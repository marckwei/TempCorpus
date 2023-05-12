/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// NOTE: If you're adding new test harness functionality -- first, should you
//       at all?  Most stuff is better in specific tests, or in nested shell.js
//       or browser.js.  Second, supposing you should, please add it to this
//       IIFE for better modularity/resilience against tests that must do
//       particularly bizarre things that might break the harness.

(function(global) {
  "use strict";

  /**********************************************************************
   * CACHED PRIMORDIAL FUNCTIONALITY (before a test might overwrite it) *
   **********************************************************************/

  var undefined; // sigh

  var Error = global.Error;
  var Function = global.Function;
  var Number = global.Number;
  var RegExp = global.RegExp;
  var String = global.String;
  var Symbol = global.Symbol;
  var TypeError = global.TypeError;

  var ArrayIsArray = global.Array.isArray;
  var MathAbs = global.Math.abs;
  var ObjectCreate = global.Object.create;
  var ObjectDefineProperty = global.Object.defineProperty;
  var ReflectApply = global.Reflect.apply;
  var RegExpPrototypeExec = global.RegExp.prototype.exec;
  var StringPrototypeCharCodeAt = global.String.prototype.charCodeAt;
  var StringPrototypeIndexOf = global.String.prototype.indexOf;
  var StringPrototypeSubstring = global.String.prototype.substring;

  var runningInBrowser = typeof global.window !== "undefined";
  if (runningInBrowser) {
    // Certain cached functionality only exists (and is only needed) when
    // running in the browser.  Segregate that caching here.

    var SpecialPowersSetGCZeal =
      global.SpecialPowers ? global.SpecialPowers.setGCZeal : undefined;
  }

  var evaluate = global.evaluate;
  var options = global.options;

  /****************************
   * GENERAL HELPER FUNCTIONS *
   ****************************/

  // We *cannot* use Array.prototype.push for this, because that function sets
  // the new trailing element, which could invoke a setter (left by a test) on
  // Array.prototype or Object.prototype.
  function ArrayPush(arr, val) {
    assertEq(ArrayIsArray(arr), true,
             "ArrayPush must only be used on actual arrays");

    var desc = ObjectCreate(null);
    desc.value = val;
    desc.enumerable = true;
    desc.configurable = true;
    desc.writable = true;
    ObjectDefineProperty(arr, arr.length, desc);
  }

  function StringCharCodeAt(str, index) {
    return ReflectApply(StringPrototypeCharCodeAt, str, [index]);
  }

  function StringSplit(str, delimiter) {
    assertEq(typeof str === "string" && typeof delimiter === "string", true,
             "StringSplit must be called with two string arguments");
    assertEq(delimiter.length > 0, true,
             "StringSplit doesn't support an empty delimiter string");

    var parts = [];
    var last = 0;
    while (true) {
      var i = ReflectApply(StringPrototypeIndexOf, str, [delimiter, last]);
      if (i < 0) {
        if (last < str.length)
          ArrayPush(parts, ReflectApply(StringPrototypeSubstring, str, [last]));
        return parts;
      }

      ArrayPush(parts, ReflectApply(StringPrototypeSubstring, str, [last, i]));
      last = i + delimiter.length;
    }
  }

  function shellOptionsClear() {
    assertEq(runningInBrowser, false, "Only called when running in the shell.");

    // Return early if no options are set.
    var currentOptions = options ? options() : "";
    if (currentOptions === "")
      return;

    // Turn off current settings.
    var optionNames = StringSplit(currentOptions, ",");
    for (var i = 0; i < optionNames.length; i++) {
      options(optionNames[i]);
    }
  }

  /****************************
   * TESTING FUNCTION EXPORTS *
   ****************************/

  function SameValue(v1, v2) {
    // We could |return Object.is(v1, v2);|, but that's less portable.
    if (v1 === 0 && v2 === 0)
      return 1 / v1 === 1 / v2;
    if (v1 !== v1 && v2 !== v2)
      return true;
    return v1 === v2;
  }

  var assertEq = global.assertEq;
  if (typeof assertEq !== "function") {
    assertEq = function assertEq(actual, expected, message) {
      if (!SameValue(actual, expected)) {
        throw new TypeError(`Assertion failed: got "${actual}", expected "${expected}"` +
                            (message ? ": " + message : ""));
      }
    };
    global.assertEq = assertEq;
  }

  function assertEqArray(actual, expected) {
    var len = actual.length;
    assertEq(len, expected.length, "mismatching array lengths");

    var i = 0;
    try {
      for (; i < len; i++)
        assertEq(actual[i], expected[i], "mismatch at element " + i);
    } catch (e) {
      throw new Error(`Exception thrown at index ${i}: ${e}`);
    }
  }
  global.assertEqArray = assertEqArray;

  function assertThrows(f) {
    var ok = false;
    try {
      f();
    } catch (exc) {
      ok = true;
    }
    if (!ok)
      throw new Error(`Assertion failed: ${f} did not throw as expected`);
  }
  global.assertThrows = assertThrows;

  function assertThrowsInstanceOf(f, ctor, msg) {
    var fullmsg;
    try {
      f();
    } catch (exc) {
      if (exc instanceof ctor)
        return;
      fullmsg = `Assertion failed: expected exception ${ctor.name}, got ${exc}`;
    }

    if (fullmsg === undefined)
      fullmsg = `Assertion failed: expected exception ${ctor.name}, no exception thrown`;
    if (msg !== undefined)
      fullmsg += " - " + msg;

    throw new Error(fullmsg);
  }
  global.assertThrowsInstanceOf = assertThrowsInstanceOf;

  /****************************
   * UTILITY FUNCTION EXPORTS *
   ****************************/

  var dump = global.dump;
  if (typeof global.dump === "function") {
    // A presumptively-functional |dump| exists, so no need to do anything.
  } else {
    // We don't have |dump|.  Try to simulate the desired effect another way.
    if (runningInBrowser) {
      // We can't actually print to the console: |global.print| invokes browser
      // printing functionality here (it's overwritten just below), and
      // |global.dump| isn't a function that'll dump to the console (presumably
      // because the preference to enable |dump| wasn't set).  Just make it a
      // no-op.
      dump = function() {};
    } else {
      // |print| prints to stdout: make |dump| do likewise.
      dump = global.print;
    }
    global.dump = dump;
  }

  var print;
  if (runningInBrowser) {
    // We're executing in a browser.  Using |global.print| would invoke browser
    // printing functionality: not what tests want!  Instead, use a print
    // function that syncs up with the test harness and console.
    print = function print() {
      var s = "TEST-INFO | ";
      for (var i = 0; i < arguments.length; i++)
        s += String(arguments[i]) + " ";

      // Dump the string to the console for developers and the harness.
      dump(s + "\n");

      // AddPrintOutput doesn't require HTML special characters be escaped.
      global.AddPrintOutput(s);
    };

    global.print = print;
  } else {
    // We're executing in a shell, and |global.print| is the desired function.
    print = global.print;
  }

  var gczeal = global.gczeal;
  if (typeof gczeal !== "function") {
    if (typeof SpecialPowersSetGCZeal === "function") {
      gczeal = function gczeal(z) {
        SpecialPowersSetGCZeal(z);
      };
    } else {
      gczeal = function() {}; // no-op if not available
    }

    global.gczeal = gczeal;
  }

  // Evaluates the given source code as global script code. browser.js provides
  // a different implementation for this function.
  var evaluateScript = global.evaluateScript;
  if (typeof evaluate === "function" && typeof evaluateScript !== "function") {
    evaluateScript = function evaluateScript(code) {
      evaluate(String(code));
    };

    global.evaluateScript = evaluateScript;
  }

  function toPrinted(value) {
    value = String(value);

    var digits = "0123456789ABCDEF";
    var result = "";
    for (var i = 0; i < value.length; i++) {
      var ch = StringCharCodeAt(value, i);
      if (ch === 0x5C && i + 1 < value.length) {
        var d = value[i + 1];
        if (d === "n") {
          result += "NL";
          i++;
        } else if (d === "r") {
          result += "CR";
          i++;
        } else {
          result += "\\";
        }
      } else if (ch === 0x0A) {
        result += "NL";
      } else if (ch < 0x20 || ch > 0x7E) {
        var a = digits[ch & 0xf];
        ch >>= 4;
        var b = digits[ch & 0xf];
        ch >>= 4;

        if (ch) {
          var c = digits[ch & 0xf];
          ch >>= 4;
          var d = digits[ch & 0xf];

          result += "\\u" + d + c + b + a;
        } else {
          result += "\\x" + b + a;
        }
      } else {
        result += value[i];
      }
    }

    return result;
  }

  /*
   * An xorshift pseudo-random number generator see:
   * https://en.wikipedia.org/wiki/Xorshift#xorshift.2A
   * This generator will always produce a value, n, where
   * 0 <= n <= 255
   */
  function *XorShiftGenerator(seed, size) {
      let x = seed;
      for (let i = 0; i < size; i++) {
          x ^= x >> 12;
          x ^= x << 25;
          x ^= x >> 27;
          yield x % 256;
      }
  }
  global.XorShiftGenerator = XorShiftGenerator;

  /*************************************************************************
   * HARNESS-CENTRIC EXPORTS (we should generally work to eliminate these) *
   *************************************************************************/

  var PASSED = " PASSED! ";
  var FAILED = " FAILED! ";

  /*
   * Same as `new TestCase(description, expect, actual)`, except it doesn't
   * return the newly created test case object.
   */
  function AddTestCase(description, expect, actual) {
    new TestCase(description, expect, actual);
  }
  global.AddTestCase = AddTestCase;

  var testCasesArray = [];

  function TestCase(d, e, a, r) {
    this.description = d;
    this.expect = e;
    this.actual = a;
    this.passed = getTestCaseResult(e, a);
    this.reason = typeof r !== 'undefined' ? String(r) : '';

    ArrayPush(testCasesArray, this);
  }
  global.TestCase = TestCase;

  TestCase.prototype = ObjectCreate(null);
  TestCase.prototype.testPassed = (function TestCase_testPassed() { return this.passed; });
  TestCase.prototype.testFailed = (function TestCase_testFailed() { return !this.passed; });
  TestCase.prototype.testDescription = (function TestCase_testDescription() { return this.description + ' ' + this.reason; });

  function getTestCaseResult(expected, actual) {
    if (typeof expected !== typeof actual)
      return false;
    if (typeof expected !== 'number')
      // Note that many tests depend on the use of '==' here, not '==='.
      return actual == expected;

    // Distinguish NaN from other values.  Using x !== x comparisons here
    // works even if tests redefine isNaN.
    if (actual !== actual)
      return expected !== expected;
    if (expected !== expected)
      return false;

    // Tolerate a certain degree of error.
    if (actual !== expected)
      return MathAbs(actual - expected) <= 1E-10;

    // Here would be a good place to distinguish 0 and -0, if we wanted
    // to.  However, doing so would introduce a number of failures in
    // areas where they don't seem important.  For example, the WeekDay
    // function in ECMA-262 returns -0 for Sundays before the epoch, but
    // the Date functions in SpiderMonkey specified in terms of WeekDay
    // often don't.  This seems unimportant.
    return true;
  }

  function reportTestCaseResult(description, expected, actual, output) {
    var testcase = new TestCase(description, expected, actual, output);

    // if running under reftest, let it handle result reporting.
    if (!runningInBrowser) {
      if (testcase.passed) {
        print(PASSED + description);
      } else {
        reportFailure(description + " : " + output);
      }
    }
  }

  function getTestCases() {
    return testCasesArray;
  }
  global.getTestCases = getTestCases;

  /*
   * The test driver searches for such a phrase in the test output.
   * If such phrase exists, it will set n as the expected exit code.
   */
  function expectExitCode(n) {
    print('--- NOTE: IN THIS TESTCASE, WE EXPECT EXIT CODE ' + n + ' ---');
  }
  global.expectExitCode = expectExitCode;

  /*
   * Statuses current section of a test
   */
  function inSection(x) {
    return "Section " + x + " of test - ";
  }
  global.inSection = inSection;

  /*
   * Report a failure in the 'accepted' manner
   */
  function reportFailure(msg) {
    msg = String(msg);
    var lines = StringSplit(msg, "\n");

    for (var i = 0; i < lines.length; i++)
      print(FAILED + " " + lines[i]);
  }
  global.reportFailure = reportFailure;

  /*
   * Print a non-failure message.
   */
  function printStatus(msg) {
    msg = String(msg);
    var lines = StringSplit(msg, "\n");

    for (var i = 0; i < lines.length; i++)
      print("STATUS: " + lines[i]);
  }
  global.printStatus = printStatus;

  /*
  * Print a bugnumber message.
  */
  function printBugNumber(num) {
    print('BUGNUMBER: ' + num);
  }
  global.printBugNumber = printBugNumber;

  /*
   * Compare expected result to actual result, if they differ (in value and/or
   * type) report a failure.  If description is provided, include it in the
   * failure report.
   */
  function reportCompare(expected, actual, description) {
    var expected_t = typeof expected;
    var actual_t = typeof actual;
    var output = "";

    if (typeof description === "undefined")
      description = "";

    if (expected_t !== actual_t)
      output += `Type mismatch, expected type ${expected_t}, actual type ${actual_t} `;

    if (expected != actual)
      output += `Expected value '${toPrinted(expected)}', Actual value '${toPrinted(actual)}' `;

    reportTestCaseResult(description, expected, actual, output);
  }
  global.reportCompare = reportCompare;

  /*
   * Attempt to match a regular expression describing the result to
   * the actual result, if they differ (in value and/or
   * type) report a failure.  If description is provided, include it in the
   * failure report.
   */
  function reportMatch(expectedRegExp, actual, description) {
    var expected_t = "string";
    var actual_t = typeof actual;
    var output = "";

    if (typeof description === "undefined")
      description = "";

    if (expected_t !== actual_t)
      output += `Type mismatch, expected type ${expected_t}, actual type ${actual_t} `;

    var matches = ReflectApply(RegExpPrototypeExec, expectedRegExp, [actual]) !== null;
    if (!matches) {
      output +=
        `Expected match to '${toPrinted(expectedRegExp)}', Actual value '${toPrinted(actual)}' `;
    }

    reportTestCaseResult(description, true, matches, output);
  }
  global.reportMatch = reportMatch;

  function compareSource(expect, actual, summary) {
    // compare source
    var expectP = String(expect);
    var actualP = String(actual);

    print('expect:\n' + expectP);
    print('actual:\n' + actualP);

    reportCompare(expectP, actualP, summary);

    // actual must be compilable if expect is?
    try {
      var expectCompile = 'No Error';
      var actualCompile;

      Function(expect);
      try {
        Function(actual);
        actualCompile = 'No Error';
      } catch(ex1) {
        actualCompile = ex1 + '';
      }
      reportCompare(expectCompile, actualCompile,
                    summary + ': compile actual');
    } catch(ex) {
    }
  }
  global.compareSource = compareSource;

  function test() {
    var testCases = getTestCases();
    for (var i = 0; i < testCases.length; i++) {
      var testCase = testCases[i];
      testCase.reason += testCase.passed ? "" : "wrong value ";

      // if running under reftest, let it handle result reporting.
      if (!runningInBrowser) {
        var message = `${testCase.description} = ${testCase.actual} expected: ${testCase.expect}`;
        print((testCase.passed ? PASSED : FAILED) + message);
      }
    }
  }
  global.test = test;

  // This function uses the shell's print function. When running tests in the
  // browser, browser.js overrides this function to write to the page.
  function writeHeaderToLog(string) {
    print(string);
  }
  global.writeHeaderToLog = writeHeaderToLog;

  /************************************
   * PROMISE TESTING FUNCTION EXPORTS *
   ************************************/

  function getPromiseResult(promise) {
    var result, error, caught = false;
    promise.then(r => { result = r; },
                 e => { caught = true; error = e; });
    if (caught)
      throw error;
    return result;
  }
  global.getPromiseResult = getPromiseResult;

  function assertEventuallyEq(promise, expected) {
    assertEq(getPromiseResult(promise), expected);
  }
  global.assertEventuallyEq = assertEventuallyEq;

  function assertEventuallyThrows(promise, expectedErrorType) {
    assertThrowsInstanceOf(() => getPromiseResult(promise), expectedErrorType);
  };
  global.assertEventuallyThrows = assertEventuallyThrows;

  function assertEventuallyDeepEq(promise, expected) {
    assertDeepEq(getPromiseResult(promise), expected);
  };
  global.assertEventuallyDeepEq = assertEventuallyDeepEq;

  /*******************************************
   * RUN ONCE CODE TO SETUP ADDITIONAL STATE *
   *******************************************/


  /*
   * completesNormally(CODE) returns true if evaluating CODE (as eval
   * code) completes normally (rather than throwing an exception).
   */
  global.completesNormally = function completesNormally(code) {
    try {
      eval(code);
      return true;
    } catch (exception) {
      return false;
    }
  }

  /*
   * raisesException(EXCEPTION)(CODE) returns true if evaluating CODE (as
   * eval code) throws an exception object that is an instance of EXCEPTION,
   * and returns false if it throws any other error or evaluates
   * successfully. For example: raises(TypeError)("0()") == true.
   */
  global.raisesException = function raisesException(exception) {
    return function (code) {
      try {
	eval(code);
	return false;
      } catch (actual) {
	return actual instanceof exception;
      }
    };
  };

  /*
   * Return true if A is equal to B, where equality on arrays and objects
   * means that they have the same set of enumerable properties, the values
   * of each property are deep_equal, and their 'length' properties are
   * equal. Equality on other types is ==.
   */
    global.deepEqual = function deepEqual(a, b) {
    if (typeof a != typeof b)
      return false;

    if (typeof a == 'object') {
      var props = {};
      // For every property of a, does b have that property with an equal value?
      for (var prop in a) {
        if (!deepEqual(a[prop], b[prop]))
          return false;
        props[prop] = true;
      }
      // Are all of b's properties present on a?
      for (var prop in b)
        if (!props[prop])
          return false;
      // length isn't enumerable, but we want to check it, too.
      return a.length == b.length;
    }

    if (a === b) {
      // Distinguish 0 from -0, even though they are ===.
      return a !== 0 || 1/a === 1/b;
    }

    // Treat NaNs as equal, even though NaN !== NaN.
    // NaNs are the only non-reflexive values, i.e., if a !== a, then a is a NaN.
    // isNaN is broken: it converts its argument to number, so isNaN("foo") => true
    return a !== a && b !== b;
  }

  /** Make an iterator with a return method. */
  global.makeIterator = function makeIterator(overrides) {
    var throwMethod;
    if (overrides && overrides.throw)
      throwMethod = overrides.throw;
    var iterator = {
      throw: throwMethod,
      next: function(x) {
        if (overrides && overrides.next)
          return overrides.next(x);
        return { done: false };
      },
      return: function(x) {
        if (overrides && overrides.ret)
          return overrides.ret(x);
        return { done: true };
      }
    };

    return function() { return iterator; };
  };

  /** Yield every permutation of the elements in some array. */
  global.Permutations = function* Permutations(items) {
    if (items.length == 0) {
      yield [];
    } else {
      items = items.slice(0);
      for (let i = 0; i < items.length; i++) {
        let swap = items[0];
        items[0] = items[i];
        items[i] = swap;
        for (let e of Permutations(items.slice(1, items.length)))
          yield [items[0]].concat(e);
      }
    }
  };

  if (typeof global.assertThrowsValue === 'undefined') {
    global.assertThrowsValue = function assertThrowsValue(f, val, msg) {
      var fullmsg;
      try {
        f();
      } catch (exc) {
        if ((exc === val) === (val === val) && (val !== 0 || 1 / exc === 1 / val))
          return;
        fullmsg = "Assertion failed: expected exception " + val + ", got " + exc;
      }
      if (fullmsg === undefined)
        fullmsg = "Assertion failed: expected exception " + val + ", no exception thrown";
      if (msg !== undefined)
        fullmsg += " - " + msg;
      throw new Error(fullmsg);
    };
  }

  if (typeof global.assertThrowsInstanceOf === 'undefined') {
    global.assertThrowsInstanceOf = function assertThrowsInstanceOf(f, ctor, msg) {
      var fullmsg;
      try {
        f();
      } catch (exc) {
        if (exc instanceof ctor)
          return;
        fullmsg = `Assertion failed: expected exception ${ctor.name}, got ${exc}`;
      }

      if (fullmsg === undefined)
        fullmsg = `Assertion failed: expected exception ${ctor.name}, no exception thrown`;
      if (msg !== undefined)
        fullmsg += " - " + msg;

      throw new Error(fullmsg);
    };
  }

  global.assertDeepEq = (function(){
    var call = Function.prototype.call,
      Array_isArray = Array.isArray,
      Map_ = Map,
      Error_ = Error,
      Symbol_ = Symbol,
      Map_has = call.bind(Map.prototype.has),
      Map_get = call.bind(Map.prototype.get),
      Map_set = call.bind(Map.prototype.set),
      Object_toString = call.bind(Object.prototype.toString),
      Function_toString = call.bind(Function.prototype.toString),
      Object_getPrototypeOf = Object.getPrototypeOf,
      Object_hasOwnProperty = call.bind(Object.prototype.hasOwnProperty),
      Object_getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor,
      Object_isExtensible = Object.isExtensible,
      Object_getOwnPropertyNames = Object.getOwnPropertyNames,
      uneval_ = global.uneval;

    // Return true iff ES6 Type(v) isn't Object.
    // Note that `typeof document.all === "undefined"`.
    function isPrimitive(v) {
      return (v === null ||
          v === undefined ||
          typeof v === "boolean" ||
          typeof v === "number" ||
          typeof v === "string" ||
          typeof v === "symbol");
    }

    function assertSameValue(a, b, msg) {
      try {
        assertEq(a, b);
      } catch (exc) {
        throw Error_(exc.message + (msg ? " " + msg : ""));
      }
    }

    function assertSameClass(a, b, msg) {
      var ac = Object_toString(a), bc = Object_toString(b);
      assertSameValue(ac, bc, msg);
      switch (ac) {
      case "[object Function]":
        if (typeof isProxy !== "undefined" && !isProxy(a) && !isProxy(b))
          assertSameValue(Function_toString(a), Function_toString(b), msg);
      }
    }

    function at(prevmsg, segment) {
      return prevmsg ? prevmsg + segment : "at _" + segment;
    }

    // Assert that the arguments a and b are thoroughly structurally equivalent.
    //
    // For the sake of speed, we cut a corner:
    //    var x = {}, y = {}, ax = [x];
    //    assertDeepEq([ax, x], [ax, y]);  // passes (?!)
    //
    // Technically this should fail, since the two object graphs are different.
    // (The graph of [ax, y] contains one more object than the graph of [ax, x].)
    //
    // To get technically correct behavior, pass {strictEquivalence: true}.
    // This is slower because we have to walk the entire graph, and Object.prototype
    // is big.
    //
    return function assertDeepEq(a, b, options) {
      var strictEquivalence = options ? options.strictEquivalence : false;

      function assertSameProto(a, b, msg) {
        check(Object_getPrototypeOf(a), Object_getPrototypeOf(b), at(msg, ".__proto__"));
      }

      function failPropList(na, nb, msg) {
        throw Error_("got own properties " + uneval_(na) + ", expected " + uneval_(nb) +
               (msg ? " " + msg : ""));
      }

      function assertSameProps(a, b, msg) {
        var na = Object_getOwnPropertyNames(a),
          nb = Object_getOwnPropertyNames(b);
        if (na.length !== nb.length)
          failPropList(na, nb, msg);

        // Ignore differences in whether Array elements are stored densely.
        if (Array_isArray(a)) {
          na.sort();
          nb.sort();
        }

        for (var i = 0; i < na.length; i++) {
          var name = na[i];
          if (name !== nb[i])
            failPropList(na, nb, msg);
          var da = Object_getOwnPropertyDescriptor(a, name),
            db = Object_getOwnPropertyDescriptor(b, name);
          var pmsg = at(msg, /^[_$A-Za-z0-9]+$/.test(name)
                     ? /0|[1-9][0-9]*/.test(name) ? "[" + name + "]" : "." + name
                     : "[" + uneval_(name) + "]");
          assertSameValue(da.configurable, db.configurable, at(pmsg, ".[[Configurable]]"));
          assertSameValue(da.enumerable, db.enumerable, at(pmsg, ".[[Enumerable]]"));
          if (Object_hasOwnProperty(da, "value")) {
            if (!Object_hasOwnProperty(db, "value"))
              throw Error_("got data property, expected accessor property" + pmsg);
            check(da.value, db.value, pmsg);
          } else {
            if (Object_hasOwnProperty(db, "value"))
              throw Error_("got accessor property, expected data property" + pmsg);
            check(da.get, db.get, at(pmsg, ".[[Get]]"));
            check(da.set, db.set, at(pmsg, ".[[Set]]"));
          }
        }
      };

      var ab = new Map_();
      var bpath = new Map_();

      function check(a, b, path) {
        if (typeof a === "symbol") {
          // Symbols are primitives, but they have identity.
          // Symbol("x") !== Symbol("x") but
          // assertDeepEq(Symbol("x"), Symbol("x")) should pass.
          if (typeof b !== "symbol") {
            throw Error_("got " + uneval_(a) + ", expected " + uneval_(b) + " " + path);
          } else if (uneval_(a) !== uneval_(b)) {
            // We lamely use uneval_ to distinguish well-known symbols
            // from user-created symbols. The standard doesn't offer
            // a convenient way to do it.
            throw Error_("got " + uneval_(a) + ", expected " + uneval_(b) + " " + path);
          } else if (Map_has(ab, a)) {
            assertSameValue(Map_get(ab, a), b, path);
          } else if (Map_has(bpath, b)) {
            var bPrevPath = Map_get(bpath, b) || "_";
            throw Error_("got distinct symbols " + at(path, "") + " and " +
                   at(bPrevPath, "") + ", expected the same symbol both places");
          } else {
            Map_set(ab, a, b);
            Map_set(bpath, b, path);
          }
        } else if (isPrimitive(a)) {
          assertSameValue(a, b, path);
        } else if (isPrimitive(b)) {
          throw Error_("got " + Object_toString(a) + ", expected " + uneval_(b) + " " + path);
        } else if (Map_has(ab, a)) {
          assertSameValue(Map_get(ab, a), b, path);
        } else if (Map_has(bpath, b)) {
          var bPrevPath = Map_get(bpath, b) || "_";
          throw Error_("got distinct objects " + at(path, "") + " and " + at(bPrevPath, "") +
                 ", expected the same object both places");
        } else {
          Map_set(ab, a, b);
          Map_set(bpath, b, path);
          if (a !== b || strictEquivalence) {
            assertSameClass(a, b, path);
            assertSameProto(a, b, path);
            assertSameProps(a, b, path);
            assertSameValue(Object_isExtensible(a),
                    Object_isExtensible(b),
                    at(path, ".[[Extensible]]"));
          }
        }
      }

      check(a, b, "");
    };
  })();

    const msPerDay = 1000 * 60 * 60 * 24;
    const msPerHour = 1000 * 60 * 60;
    global.msPerHour = msPerHour;

    // Offset of tester's time zone from UTC.
    const TZ_DIFF = GetRawTimezoneOffset();
    global.TZ_ADJUST = TZ_DIFF * msPerHour;

    const UTC_01_JAN_1900 = -2208988800000;
    const UTC_01_JAN_2000 = 946684800000;
    const UTC_29_FEB_2000 = UTC_01_JAN_2000 + 31 * msPerDay + 28 * msPerDay;
    const UTC_01_JAN_2005 = UTC_01_JAN_2000 + TimeInYear(2000) + TimeInYear(2001) +
                            TimeInYear(2002) + TimeInYear(2003) + TimeInYear(2004);
    global.UTC_01_JAN_1900 = UTC_01_JAN_1900;
    global.UTC_01_JAN_2000 = UTC_01_JAN_2000;
    global.UTC_29_FEB_2000 = UTC_29_FEB_2000;
    global.UTC_01_JAN_2005 = UTC_01_JAN_2005;

    /*
     * Originally, the test suite used a hard-coded value TZ_DIFF = -8.
     * But that was only valid for testers in the Pacific Standard Time Zone!
     * We calculate the proper number dynamically for any tester. We just
     * have to be careful not to use a date subject to Daylight Savings Time...
     */
    function GetRawTimezoneOffset() {
        let t1 = new Date(2000, 1, 1).getTimezoneOffset();
        let t2 = new Date(2000, 1 + 6, 1).getTimezoneOffset();

        // 1) Time zone without daylight saving time.
        // 2) Northern hemisphere with daylight saving time.
        if ((t1 - t2) >= 0)
            return -t1 / 60;

        // 3) Southern hemisphere with daylight saving time.
        return -t2 / 60;
    }

    function DaysInYear(y) {
        return y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 366 : 365;
    }

    function TimeInYear(y) {
        return DaysInYear(y) * msPerDay;
    }

    function getDefaultTimeZone() {
            return "EST5EDT";
    }

    function getDefaultLocale() {
        // If the default locale looks like a BCP-47 language tag, return it.
        var locale = global.getDefaultLocale();
        if (locale.match(/^[a-z][a-z0-9\-]+$/i))
            return locale;

        // Otherwise use undefined to reset to the default locale.
        return undefined;
    }

    let defaultTimeZone = null;
    let defaultLocale = null;

    // Run the given test in the requested time zone.
    function inTimeZone(tzname, fn) {
        if (defaultTimeZone === null)
            defaultTimeZone = getDefaultTimeZone();

        try {
            fn();
        } finally {
        }
    }
    global.inTimeZone = inTimeZone;

    // Run the given test with the requested locale.
    function withLocale(locale, fn) {
        if (defaultLocale === null)
            defaultLocale = getDefaultLocale();

        setDefaultLocale(locale);
        try {
            fn();
        } finally {
            setDefaultLocale(defaultLocale);
        }
    }
    global.withLocale = withLocale;

    const Month = {
        January: 0,
        February: 1,
        March: 2,
        April: 3,
        May: 4,
        June: 5,
        July: 6,
        August: 7,
        September: 8,
        October: 9,
        November: 10,
        December: 11,
    };
    global.Month = Month;

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].join("|");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].join("|");
    const datePart = String.raw `(?:${weekdays}) (?:${months}) \d{2}`;
    const timePart = String.raw `\d{4,6} \d{2}:\d{2}:\d{2} GMT[+-]\d{4}`;
    const dateTimeRE = new RegExp(String.raw `^(${datePart} ${timePart})(?: \((.+)\))?$`);

    function assertDateTime(date, expected, ...alternativeTimeZones) {
        let actual = date.toString();
        assertEq(dateTimeRE.test(expected), true, `${expected}`);
        assertEq(dateTimeRE.test(actual), true, `${actual}`);

        let [, expectedDateTime, expectedTimeZone] = dateTimeRE.exec(expected);
        let [, actualDateTime, actualTimeZone] = dateTimeRE.exec(actual);

        assertEq(actualDateTime, expectedDateTime);

        // The time zone identifier is optional, so only compare its value if
        // it's present in |actual| and |expected|.
        if (expectedTimeZone !== undefined && actualTimeZone !== undefined) {
            // Test against the alternative time zone identifiers if necessary.
            if (actualTimeZone !== expectedTimeZone) {
                for (let alternativeTimeZone of alternativeTimeZones) {
                    if (actualTimeZone === alternativeTimeZone) {
                        expectedTimeZone = alternativeTimeZone;
                        break;
                    }
                }
            }
            assertEq(actualTimeZone, expectedTimeZone);
        }
    }
    global.assertDateTime = assertDateTime;

  global.testRegExp = function testRegExp(statuses, patterns, strings, actualmatches, expectedmatches)
  {
    var status = '';
    var pattern = new RegExp();
    var string = '';
    var actualmatch = new Array();
    var expectedmatch = new Array();
    var state = '';
    var lActual = -1;
    var lExpect = -1;
    var actual = new Array();


    for (var i=0; i != patterns.length; i++)
    {
      status = statuses[i];
      pattern = patterns[i];
      string = strings[i];
      actualmatch=actualmatches[i];
      expectedmatch=expectedmatches[i];


      if(actualmatch)
      {
        actual = formatArray(actualmatch);
        if(expectedmatch)
        {
          // expectedmatch and actualmatch are arrays -
          lExpect = expectedmatch.length;
          lActual = actualmatch.length;

          var expected = formatArray(expectedmatch);

          if (lActual != lExpect)
          {
            reportCompare(lExpect, lActual,
                          state + ERR_LENGTH +
                          MSG_EXPECT + expected +
                          MSG_ACTUAL + actual +
                          CHAR_NL
	                       );
            continue;
          }

          // OK, the arrays have same length -
          if (expected != actual)
          {
            reportCompare(expected, actual,
                          state + ERR_MATCH +
                          MSG_EXPECT + expected +
                          MSG_ACTUAL + actual +
                          CHAR_NL
	                       );
          }
          else
          {
            reportCompare(expected, actual, state)
	        }

        }
        else //expectedmatch is null - that is, we did not expect a match -
        {
          expected = expectedmatch;
          reportCompare(expected, actual,
                        state + ERR_UNEXP_MATCH +
                        MSG_EXPECT + expectedmatch +
                        MSG_ACTUAL + actual +
                        CHAR_NL
	                     );
        }

      }
      else // actualmatch is null
      {
        if (expectedmatch)
        {
          actual = actualmatch;
          reportCompare(expected, actual,
                        state + ERR_NO_MATCH +
                        MSG_EXPECT + expectedmatch +
                        MSG_ACTUAL + actualmatch +
                        CHAR_NL
	                     );
        }
        else // we did not expect a match
        {
          // Being ultra-cautious. Presumably expectedmatch===actualmatch===null
          expected = expectedmatch;
          actual   = actualmatch;
          reportCompare (expectedmatch, actualmatch, state);
        }
      }
    }
  }



  function clone_object_check(b, desc) {
    function classOf(obj) {
      return Object.prototype.toString.call(obj);
    }

    function ownProperties(obj) {
      return Object.getOwnPropertyNames(obj).
        map(function (p) { return [p, Object.getOwnPropertyDescriptor(obj, p)]; });
    }

    function isArrayLength(obj, pair) {
      return Array.isArray(obj) && pair[0] == "length";
    }

    function isCloneable(obj, pair) {
      return isArrayLength(obj, pair) || (typeof pair[0] === 'string' && pair[1].enumerable);
    }

    function notIndex(p) {
      var u = p >>> 0;
      return !("" + u == p && u != 0xffffffff);
    }

    function assertIsCloneOf(a, b, path) {
      assertEq(a === b, false);

      var ca = classOf(a);
      assertEq(ca, classOf(b), path);

      assertEq(Object.getPrototypeOf(a),
               ca == "[object Object]" ? Object.prototype : Array.prototype,
               path);

      // 'b', the original object, may have non-enumerable or XMLName
      // properties; ignore them (except .length, if it's an Array).
      // 'a', the clone, should not have any non-enumerable properties
      // (except .length, if it's an Array) or XMLName properties.
      var pb = ownProperties(b).filter(function(element) {
        return isCloneable(b, element);
      });
      var pa = ownProperties(a);
      for (var i = 0; i < pa.length; i++) {
        assertEq(typeof pa[i][0], "string", "clone should not have E4X properties " + path);
        if (!isCloneable(a, pa[i])) {
          throw new Error("non-cloneable clone property " + uneval(pa[i][0]) + " " + path);
        }
      }

      // Check that, apart from properties whose names are array indexes, 
      // the enumerable properties appear in the same order.
      var aNames = pa.map(function (pair) { return pair[1]; }).filter(notIndex);
      var bNames = pa.map(function (pair) { return pair[1]; }).filter(notIndex);
      assertEq(aNames.join(","), bNames.join(","), path);

      // Check that the lists are the same when including array indexes.
      function byName(a, b) { a = a[0]; b = b[0]; return a < b ? -1 : a === b ? 0 : 1; }
      pa.sort(byName);
      pb.sort(byName);
      assertEq(pa.length, pb.length, "should see the same number of properties " + path);
      for (var i = 0; i < pa.length; i++) {
        var aName = pa[i][0];
        var bName = pb[i][0];
        assertEq(aName, bName, path);

        var path2 = path + "." + aName;
        var da = pa[i][1];
        var db = pb[i][1];
        if (!isArrayLength(a, pa[i])) {
          assertEq(da.configurable, true, path2);
        }
        assertEq(da.writable, true, path2);
        assertEq("value" in da, true, path2);
        var va = da.value;
        var vb = b[pb[i][0]];
        if (typeof va === "object" && va !== null)
          queue.push([va, vb, path2]);
        else
          assertEq(va, vb, path2);
      }
    }

    var banner = "while testing clone of " + (desc || uneval(b));
    var a = deserialize(serialize(b));
    var queue = [[a, b, banner]];
    while (queue.length) {
      var triple = queue.shift();
      assertIsCloneOf(triple[0], triple[1], triple[2]);
    }

    return a; // for further testing
  }
  global.clone_object_check = clone_object_check;

  global.testLenientAndStrict = function testLenientAndStrict(code, lenient_pred, strict_pred) {
    return (strict_pred("'use strict'; " + code) && 
            lenient_pred(code));
  }

  /*
   * parsesSuccessfully(CODE) returns true if CODE parses as function
   * code without an error.
   */
  global.parsesSuccessfully = function parsesSuccessfully(code) {
    try {
      Function(code);
      return true;
    } catch (exception) {
      return false;
    }
  };

  /*
   * parseRaisesException(EXCEPTION)(CODE) returns true if parsing CODE
   * as function code raises EXCEPTION.
   */
  global.parseRaisesException = function parseRaisesException(exception) {
    return function (code) {
      try {
        Function(code);
        return false;
      } catch (actual) {
        return exception.prototype.isPrototypeOf(actual);
      }
    };
  };

  /*
   * returns(VALUE)(CODE) returns true if evaluating CODE (as eval code)
   * completes normally (rather than throwing an exception), yielding a value
   * strictly equal to VALUE.
   */
  global.returns = function returns(value) {
    return function(code) {
      try {
        return eval(code) === value;
      } catch (exception) {
        return false;
      }
    }
  }


    const {
        apply: Reflect_apply,
        construct: Reflect_construct,
    } = Reflect;
    const {
        get: WeakMap_prototype_get,
        has: WeakMap_prototype_has,
    } = WeakMap.prototype;

    const sharedConstructors = new WeakMap();

    // Synthesize a constructor for a shared memory array from the constructor
    // for unshared memory. This has "good enough" fidelity for many uses. In
    // cases where it's not good enough, call isSharedConstructor for local
    // workarounds.
    function sharedConstructor(baseConstructor) {
        // Create SharedTypedArray as a subclass of %TypedArray%, following the
        // built-in %TypedArray% subclasses.
        class SharedTypedArray extends Object.getPrototypeOf(baseConstructor) {
            constructor(...args) {
                var array = Reflect_construct(baseConstructor, args);
                var {buffer, byteOffset, length} = array;
                var sharedBuffer = new SharedArrayBuffer(buffer.byteLength);
                var sharedArray = Reflect_construct(baseConstructor,
                                                    [sharedBuffer, byteOffset, length],
                                                    new.target);
                for (var i = 0; i < length; i++)
                    sharedArray[i] = array[i];
                assertEq(sharedArray.buffer, sharedBuffer);
                return sharedArray;
            }
        }

        // 22.2.5.1 TypedArray.BYTES_PER_ELEMENT
        Object.defineProperty(SharedTypedArray, "BYTES_PER_ELEMENT",
                              {__proto__: null, value: baseConstructor.BYTES_PER_ELEMENT});

        // 22.2.6.1 TypedArray.prototype.BYTES_PER_ELEMENT
        Object.defineProperty(SharedTypedArray.prototype, "BYTES_PER_ELEMENT",
                              {__proto__: null, value: baseConstructor.BYTES_PER_ELEMENT});

        // Share the same name with the base constructor to avoid calling
        // isSharedConstructor() in multiple places.
        Object.defineProperty(SharedTypedArray, "name",
                              {__proto__: null, value: baseConstructor.name});

        sharedConstructors.set(SharedTypedArray, baseConstructor);

        return SharedTypedArray;
    }





    /**
     * Returns `true` if `constructor` is a TypedArray constructor for shared
     * memory.
     */
    function isSharedConstructor(constructor) {
        return Reflect_apply(WeakMap_prototype_has, sharedConstructors, [constructor]);
    }

    /**
     * All TypedArray constructors for unshared memory.
     */
    const typedArrayConstructors = Object.freeze([
        Int8Array,
        Uint8Array,
        Uint8ClampedArray,
        Int16Array,
        Uint16Array,
        Int32Array,
        Uint32Array,
        Float32Array,
        Float64Array,
    ]);
    /**
     * All TypedArray constructors for shared memory.
     */
    const sharedTypedArrayConstructors = Object.freeze(
        typeof SharedArrayBuffer === "function"
        ? typedArrayConstructors.map(sharedConstructor)
        : []
    );

    /**
     * All TypedArray constructors for unshared and shared memory.
     */
    const anyTypedArrayConstructors = Object.freeze([
        ...typedArrayConstructors, ...sharedTypedArrayConstructors,
    ]);
    global.typedArrayConstructors = typedArrayConstructors;
    global.sharedTypedArrayConstructors = sharedTypedArrayConstructors;
    global.anyTypedArrayConstructors = anyTypedArrayConstructors;
    /**
     * Returns `true` if `constructor` is a TypedArray constructor for shared
     * or unshared memory, with an underlying element type of either Float32 or
     * Float64.
     */
    function isFloatConstructor(constructor) {
        if (isSharedConstructor(constructor))
            constructor = Reflect_apply(WeakMap_prototype_get, sharedConstructors, [constructor]);
        return constructor == Float32Array || constructor == Float64Array;
    }

    global.isSharedConstructor = isSharedConstructor;
    global.isFloatConstructor = isFloatConstructor;

})(this);

var DESCRIPTION;

function arraysEqual(a1, a2)
{
  return a1.length === a2.length &&
         a1.every(function(v, i) { return v === a2[i]; });
}

function SameValue(v1, v2)
{
  if (v1 === 0 && v2 === 0)
    return 1 / v1 === 1 / v2;
  if (v1 !== v1 && v2 !== v2)
    return true;
  return v1 === v2;
}

function arraysEqual(a1, a2)
{
  var len1 = a1.length, len2 = a2.length;
  if (len1 !== len2)
    return false;
  for (var i = 0; i < len1; i++)
  {
    if (!SameValue(a1[i], a2[i]))
      return false;
  }
  return true;
}

var evalInFrame = function (f) { return eval(f);};


function globalPrototypeChainIsMutable()
{
  return false;
}

if (typeof assertIteratorResult === 'undefined') {
    var assertIteratorResult = function assertIteratorResult(result, value, done) {
        assertEq(typeof result, "object");
        var expectedProps = ['done', 'value'];
        var actualProps = Object.getOwnPropertyNames(result);
        actualProps.sort(), expectedProps.sort();
        assertDeepEq(actualProps, expectedProps);
        assertDeepEq(result.value, value);
        assertDeepEq(result.done, done);
    }
}

if (typeof assertIteratorNext === 'undefined') {
    var assertIteratorNext = function assertIteratorNext(iter, value) {
        assertIteratorResult(iter.next(), value, false);
    }
}

if (typeof assertIteratorDone === 'undefined') {
    var assertIteratorDone = function assertIteratorDone(iter, value) {
        assertIteratorResult(iter.next(), value, true);
    }
}

var appendToActual = function(s) {
    actual += s + ',';
}

if (!("gczeal" in this)) {
  gczeal = function() { }
}

if (!("schedulegc" in this)) {
  schedulegc = function() { }
}

if (!("gcslice" in this)) {
  gcslice = function() { }
}

if (!("selectforgc" in this)) {
  selectforgc = function() { }
}

if (!("verifyprebarriers" in this)) {
  verifyprebarriers = function() { }
}

if (!("verifypostbarriers" in this)) {
  verifypostbarriers = function() { }
}

if (!("gcPreserveCode" in this)) {
  gcPreserveCode = function() { }
}

if (typeof isHighSurrogate === 'undefined') {
    var isHighSurrogate = function isHighSurrogate(s) {
        var c = s.charCodeAt(0);
        return c >= 0xD800 && c <= 0xDBFF;
    }
}

if (typeof isLowSurrogate === 'undefined') {
    var isLowSurrogate = function isLowSurrogate(s) {
        var c = s.charCodeAt(0);
        return c >= 0xDC00 && c <= 0xDFFF;
    }
}

if (typeof isSurrogatePair === 'undefined') {
    var isSurrogatePair = function isSurrogatePair(s) {
        return s.length == 2 && isHighSurrogate(s[0]) && isLowSurrogate(s[1]);
    }
}
var newGlobal = function () { 
  newGlobal.eval = eval; 
  return this; };

function assertThrowsValue(f) { f();}
function evalcx(f) { eval(f); }
function gcparam() {}
function uneval(f) {return f.toString()}
function oomTest(f) {f();}
function evaluate(f) {return eval(f);}
function inIon() {return true;}
function byteSizeOfScript(f) { return f.toString().length; }

var Match =

(function() {

    function Pattern(template) {
        // act like a constructor even as a function
        if (!(this instanceof Pattern))
            return new Pattern(template);

        this.template = template;
    }

    Pattern.prototype = {
        match: function(act) {
            return match(act, this.template);
        },

        matches: function(act) {
            try {
                return this.match(act);
            }
            catch (e) {
                if (!(e instanceof MatchError))
                    throw e;
                return false;
            }
        },

        assert: function(act, message) {
            try {
                return this.match(act);
            }
            catch (e) {
                if (!(e instanceof MatchError))
                    throw e;
                throw new Error((message || "failed match") + ": " + e.message);
            }
        },

        toString: () => "[object Pattern]"
    };

    Pattern.ANY = new Pattern;
    Pattern.ANY.template = Pattern.ANY;

    Pattern.NUMBER = new Pattern;
    Pattern.NUMBER.match = function (act) {
      if (typeof act !== 'number') {
        throw new MatchError("Expected number, got: " + quote(act));
      }
    }

    Pattern.NATURAL = new Pattern
    Pattern.NATURAL.match = function (act) {
      if (typeof act !== 'number' || act !== Math.floor(act) || act < 0) {
        throw new MatchError("Expected natural number, got: " + quote(act));
      }
    }

    var quote = uneval;

    function MatchError(msg) {
        this.message = msg;
    }

    MatchError.prototype = {
        toString: function() {
            return "match error: " + this.message;
        }
    };

    function isAtom(x) {
        return (typeof x === "number") ||
            (typeof x === "string") ||
            (typeof x === "boolean") ||
            (x === null) ||
            (x === undefined) ||
            (typeof x === "object" && x instanceof RegExp) ||
            (typeof x === "bigint");
    }

    function isObject(x) {
        return (x !== null) && (typeof x === "object");
    }

    function isFunction(x) {
        return typeof x === "function";
    }

    function isArrayLike(x) {
        return isObject(x) && ("length" in x);
    }

    function matchAtom(act, exp) {
        if ((typeof exp) === "number" && isNaN(exp)) {
            if ((typeof act) !== "number" || !isNaN(act))
                throw new MatchError("expected NaN, got: " + quote(act));
            return true;
        }

        if (exp === null) {
            if (act !== null)
                throw new MatchError("expected null, got: " + quote(act));
            return true;
        }

        if (exp instanceof RegExp) {
            if (!(act instanceof RegExp) || exp.source !== act.source)
                throw new MatchError("expected " + quote(exp) + ", got: " + quote(act));
            return true;
        }

        switch (typeof exp) {
        case "string":
        case "undefined":
            if (act !== exp)
                throw new MatchError("expected " + quote(exp) + ", got " + quote(act));
            return true;
        case "boolean":
        case "number":
        case "bigint":
            if (exp !== act)
                throw new MatchError("expected " + exp + ", got " + quote(act));
            return true;
        }

        throw new Error("bad pattern: " + exp.toSource());
    }

    function matchObject(act, exp) {
        if (!isObject(act))
            throw new MatchError("expected object, got " + quote(act));

        for (var key in exp) {
            if (!(key in act))
                throw new MatchError("expected property " + quote(key) + " not found in " + quote(act));
            match(act[key], exp[key]);
        }

        return true;
    }

    function matchFunction(act, exp) {
        if (!isFunction(act))
            throw new MatchError("expected function, got " + quote(act));

        if (act !== exp)
            throw new MatchError("expected function: " + exp +
                                 "\nbut got different function: " + act);
    }

    function matchArray(act, exp) {
        if (!isObject(act) || !("length" in act))
            throw new MatchError("expected array-like object, got " + quote(act));

        var length = exp.length;
        if (act.length !== exp.length)
            throw new MatchError("expected array-like object of length " + length + ", got " + quote(act));

        for (var i = 0; i < length; i++) {
            if (i in exp) {
                if (!(i in act))
                    throw new MatchError("expected array property " + i + " not found in " + quote(act));
                match(act[i], exp[i]);
            }
        }

        return true;
    }

    function match(act, exp) {
        if (exp === Pattern.ANY)
            return true;

        if (exp instanceof Pattern)
            return exp.match(act);

        if (isAtom(exp))
            return matchAtom(act, exp);

        if (isArrayLike(exp))
            return matchArray(act, exp);

        if (isFunction(exp))
            return matchFunction(act, exp);

        if (isObject(exp))
            return matchObject(act, exp);

        throw new Error("bad pattern: " + exp.toSource());
    }

    return { Pattern: Pattern,
             MatchError: MatchError };

})();

function serialize (f) { return f.toString()}
function isLatin1() {return true; }
function deserialize(f) { return f};

function assertErrorMessage(f) { f(); }
function cacheEntry(f) { return eval(f);}

function resolvePromise(p, s) { return p.resolve(s); }

function isConstructor(o) {
    try {
        new (new Proxy(o, {construct: () => ({})}));
        return true;
    } catch(e) {
        return false;
    }
}

var InternalError = new Error();
function wrapWithProto(p, v) {
  p.proto = v;
  return p;
}

function objectGlobal(v) { return v; }
function saveStack() { return ""; }
function callFunctionWithAsyncStack(f) { f(); }
function readlineBuf(v) { if (v) { v = 'a';} }
function inJit() { return true; }
function isRelazifiableFunction(f) {return f}
function bailout(f) {}
function ReadableStream () { return {}; }
function evalWithCache(f) { return eval(f);}
function offThreadDecodeScript(f) {return eval(f);}
function isLazyFunction(f) { if ( typeof(f) == "function" ) return true; return false; }
var generation = 0;


function Disjunction(alternatives) {
  return{
    type: "Disjunction",
    alternatives: alternatives
  };
}

function Alternative(nodes) {
  return {
    type: "Alternative",
    nodes: nodes
  };
}

function Empty() {
  return {
    type: "Empty"
  };
}

function Text(elements) {
  return {
    type: "Text",
    elements: elements
  };
}

function Assertion(type) {
  return {
    type: "Assertion",
    assertion_type: type
  };
}

function Atom(data) {
  return {
    type: "Atom",
    data: data
  };
}

const kInfinity = 0x7FFFFFFF;
function Quantifier(min, max, type, body) {
  return {
    type: "Quantifier",
    min: min,
    max: max,
    quantifier_type: type,
    body: body
  };
}

function Lookahead(body) {
  return {
    type: "Lookahead",
    is_positive: true,
    body: body
  };
}

function NegativeLookahead(body) {
  return {
    type: "Lookahead",
    is_positive: false,
    body: body
  };
}

function BackReference(index) {
  return {
    type: "BackReference",
    index: index
  };
}

function CharacterClass(ranges) {
  return {
    type: "CharacterClass",
    is_negated: false,
    ranges: ranges.map(([from, to]) => ({ from ,to }))
  };
}

function NegativeCharacterClass(ranges) {
  return {
    type: "CharacterClass",
    is_negated: true,
    ranges: ranges.map(([from, to]) => ({ from ,to }))
  };
}

function Capture(index, body) {
  return {
    type: "Capture",
    index: index,
    body: body
  };
}

function AllSurrogateAndCharacterClass(ranges) {
  return Disjunction([
    CharacterClass(ranges),
    Alternative([
      CharacterClass([["\uD800", "\uDBFF"]]),
      NegativeLookahead(CharacterClass([["\uDC00", "\uDFFF"]]))
    ]),
    Alternative([
      Assertion("NOT_AFTER_LEAD_SURROGATE"),
      CharacterClass([["\uDC00", "\uDFFF"]])
    ]),
    Text([
      CharacterClass([["\uD800", "\uDBFF"]]),
      CharacterClass([["\uDC00", "\uDFFF"]])
    ])
  ]);
}

// testing functions

var all_flags = [
  "",
  "i",
  "m",
  "u",
  "im",
  "iu",
  "mu",
  "imu",
];

var no_unicode_flags = [
  "",
  "i",
  "m",
  "im",
];

var unicode_flags = [
  "u",
  "iu",
  "mu",
  "imu",
];

var no_multiline_flags = [
  "",
  "i",
  "u",
  "iu",
];

var multiline_flags = [
  "m",
  "im",
  "mu",
  "imu",
];

function test_flags(pattern, flags, match_only, expected) {
  return true;
}

function make_mix(tree) {
  if (tree.type == "Atom") {
    return Atom("X" + tree.data + "Y");
  }
  if (tree.type == "CharacterClass") {
    return Text([
      Atom("X"),
      tree,
      Atom("Y")
    ]);
  }
  if (tree.type == "Alternative") {
    return Alternative([
      Atom("X"),
      ...tree.nodes,
      Atom("Y")
    ]);
  }
  return Alternative([
    Atom("X"),
    tree,
    Atom("Y")
  ]);
}

function test_mix(pattern, flags, expected) {
  test_flags(pattern, flags, false, expected);
  test_flags("X" + pattern + "Y", flags, false, make_mix(expected));
}

function test(pattern, flags, expected) {
  test_flags(pattern, flags, false, expected);
}

function test_match_only(pattern, flags, expected) {
  test_flags(pattern, flags, true, expected);
}
if (gc == undefined ) {
  function gc() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
  }
}
function minorgc() { gc();}
function detachArrayBuffer() {};
function newRope(a, b) { return a + b; }
function oomAfterAllocations(v) { return v; }
function assertJitStackInvariants () {}
function withSourceHook (hook, f) {f();}

function orTestHelper(a, b, n)
{
  var k = 0;
  for (var i = 0; i < n; i++) {
    if (a || b)
      k += i;
  }
  return k;
}

var lazy = 0;
function clone(f) { return f;}
function shapeOf(f) { return {}; }
function getMaxArgs() { return 0xffffffff; }

// The nearest representable values to +1.0.
const ONE_PLUS_EPSILON = 1 + Math.pow(2, -52);  // 0.9999999999999999
const ONE_MINUS_EPSILON = 1 - Math.pow(2, -53);  // 1.0000000000000002

{
    const fail = function (msg) {
        var exc = new Error(msg);
        try {
            // Try to improve on exc.fileName and .lineNumber; leave exc.stack
            // alone. We skip two frames: fail() and its caller, an assertX()
            // function.
            var frames = exc.stack.trim().split("\n");
            if (frames.length > 2) {
                var m = /@([^@:]*):([0-9]+)$/.exec(frames[2]);
                if (m) {
                    exc.fileName = m[1];
                    exc.lineNumber = +m[2];
                }
            }
        } catch (ignore) { throw ignore;}
        throw exc;
    };

    let ENDIAN;  // 0 for little-endian, 1 for big-endian.

    // Return the difference between the IEEE 754 bit-patterns for a and b.
    //
    // This is meaningful when a and b are both finite and have the same
    // sign. Then the following hold:
    //
    //   * If a === b, then diff(a, b) === 0.
    //
    //   * If a !== b, then diff(a, b) === 1 + the number of representable values
    //                                         between a and b.
    //
    const f = new Float64Array([0, 0]);
    const u = new Uint32Array(f.buffer);
    const diff = function (a, b) {
        f[0] = a;
        f[1] = b;
        //print(u[1].toString(16) + u[0].toString(16) + " " + u[3].toString(16) + u[2].toString(16));
        return Math.abs((u[3-ENDIAN] - u[1-ENDIAN]) * 0x100000000 + u[2+ENDIAN] - u[0+ENDIAN]);
    };

    // Set ENDIAN to the platform's endianness.
    ENDIAN = 0;  // try little-endian first
    if (diff(2, 4) === 0x100000)  // exact wrong answer we'll get on a big-endian platform
        ENDIAN = 1;
    assertEq(diff(2,4), 0x10000000000000);
    assertEq(diff(0, Number.MIN_VALUE), 1);
    assertEq(diff(1, ONE_PLUS_EPSILON), 1);
    assertEq(diff(1, ONE_MINUS_EPSILON), 1);

    var assertNear = function assertNear(a, b, tolerance=1) {
        if (!Number.isFinite(b)) {
            fail("second argument to assertNear (expected value) must be a finite number");
        } else if (Number.isNaN(a)) {
            fail("got NaN, expected a number near " + b);
        } else if (!Number.isFinite(a)) {
            if (b * Math.sign(a) < Number.MAX_VALUE)
                fail("got " + a + ", expected a number near " + b);
        } else {
            // When the two arguments do not have the same sign bit, diff()
            // returns some huge number. So if b is positive or negative 0,
            // make target the zero that has the same sign bit as a.
            var target = b === 0 ? a * 0 : b;
            var err = diff(a, target);
            if (err > tolerance) {
                fail("got " + a + ", expected a number near " + b +
                     " (relative error: " + err + ")");
            }
        }
    };
}
function newExternalString(s) { return String(s); }
function unboxedObjectsEnabled() { return true; }
function unwrappedObjectsHaveSameShape() { return true; }
function relazifyFunctions(f) { }
function isUnboxedObject() {}
function ensureFlatString(s) {return s; }
function finalizeCount() { return 1; }
var mandelbrotImageDataFuzzyResult = 0;
function evalReturningScope (f) { return eval(f); }
function getAllocationMetadata(v) { return {}; }
function displayName (f) { return f.name }
function getBuildConfiguration () { this.debug = true; return this; }
function dumpStringRepresentation() { }
function getLastWarning() { return null; }
function grayRoot () { return new Array(); }
function byteSize(v) { return v.length }
function assertThrownErrorContains(thunk, substr) {
    try {
        thunk();
    } catch (e) {
        if (e.message.indexOf(substr) !== -1)
            return;
        throw new Error("Expected error containing " + substr + ", got " + e);
    }
    throw new Error("Expected error containing " + substr + ", no exception thrown");
}

  function formatArray(arr)
  {
    try
    {
      return arr.toSource();
    }
    catch(e)
    {
      return arr.toString(); 
    }
  }

var document = {};
function options () {}
function setTimeout() {}

function assertFalse(a) { assertEq(a, false) }
function assertTrue(a) { assertEq(a, true) }
function assertNotEq(found, not_expected) { assertEq(Object.is(found, not_expected), false) }
function assertIteratorResult(result, value, done) {
    assertDeepEq(result.value, value);
    assertEq(result.done, done);
}
function assertIteratorNext(iter, value) {
    assertIteratorResult(iter.next(), value, false);
}
function assertIteratorDone(iter, value) {
    assertIteratorResult(iter.next(), value, true);
}

function hasPipeline() {
    try {
        Function('a |> a');
    } catch (e) {
        return false;
    }

    return true;
}

var SOME_PRIMITIVE_VALUES = [
    undefined, null,
    false,
    -Infinity, -1.6e99, -1, -0, 0, Math.pow(2, -1074), 1, 4294967295,
    Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER + 1, 1.6e99, Infinity, NaN,
    "", "Phaedo",
    Symbol(), Symbol("iterator"), Symbol.for("iterator"), Symbol.iterator
];

function runtest(f) { f(); }

var bufferGlobal = [];

if (typeof(console) == "undefined") {
    console = {
        log: print
    };
}

if (typeof(gc) == "undefined") {
  gc = function() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
  }
}

if (typeof(BigInt) == "undefined") {
  BigInt = function (v) { return new Number(v); }
}

if (typeof(BigInt64Array) == "undefined") {
  BigInt64Array = function(v) { return new Array(v); }
}

if (typeof(BigUint64Array) == "undefined") { 
  BigUint64Array = function (v) { return new Array(v); }
}

if (typeof(quit) == "undefined") {
  quit = function() {
  }
}

// |jit-test| skip-if: !wasmSimdEnabled()

// Ad-hoc test cases used during development.  Generally these are ordered from
// easier toward harder.
//
// The test cases here are usually those that require some special processing.
// Simple binary operators (v128 x v128 -> v128) and unary operators (v128 ->
// v128) are tested in ad-hack-simple-binops*.js and ad-hack-simple-unops.js.

// Do not include this in the preamble, it must be loaded after lib/wasm.js
load(scriptdir + "ad-hack-preamble.js")

// v128.store
// oob store
// v128.const

for ( let offset of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]) {
    var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "f") (param $loc i32)
      (v128.store offset=${offset} (local.get $loc) (v128.const i32x4 ${1+offset} 2 3 ${4+offset*2}))))`);
    var mem8 = new Uint8Array(ins.exports.mem.buffer);
    ins.exports.f(160);
    assertSame(getUnaligned(mem8, 4, 160 + offset, 4), [1+offset, 2, 3, 4+offset*2]);

    // OOB write should trap
    assertErrorMessage(() => ins.exports.f(65536-15),
                       WebAssembly.RuntimeError,
                       /index out of bounds/)

    // Ensure that OOB writes don't write anything: moved to simd-partial-oob-store.js
}

// v128.load
// oob load
// v128.store
// temp register

for ( let offset of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]) {
    var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "copy") (param $dest i32) (param $src i32)
      (v128.store (local.get $dest) (v128.load offset=${offset} (local.get $src)))))`);
    var mem32 = new Uint32Array(ins.exports.mem.buffer);
    var mem8 = new Uint8Array(ins.exports.mem.buffer);
    setUnaligned(mem8, 4, 4*4 + offset, [8+offset, 10, 12, 14+offset*2]);
    ins.exports.copy(40*4, 4*4);
    assertSame(get(mem32, 40, 4), [8+offset, 10, 12, 14+offset*2]);
    assertErrorMessage(() => ins.exports.copy(40*4, 65536-15),
                       WebAssembly.RuntimeError,
                       /index out of bounds/);
}

// call [with register params]
// parameters [in registers]
// return [with register values]
// locals
//
// local.get
// local.set
// v128.const
// v128.store

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func $g (param $param v128) (result v128)
      (local $tmp v128)
      (local.set $tmp (local.get $param))
      (local.get $tmp))
    (func (export "f")
      (v128.store (i32.const 160) (call $g (v128.const i32x4 1 2 3 4)))))`);
var mem = new Uint32Array(ins.exports.mem.buffer);
ins.exports.f();
assertSame(get(mem, 40, 4), [1, 2, 3, 4]);

// Same test but with local.tee

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func $g (param $param v128) (result v128)
      (local $tmp v128)
      (local.tee $tmp (local.get $param)))
    (func (export "f")
      (v128.store (i32.const 160) (call $g (v128.const i32x4 1 2 3 4)))))`);
var mem = new Uint32Array(ins.exports.mem.buffer);
ins.exports.f();
assertSame(get(mem, 40, 4), [1, 2, 3, 4]);

// Locals that end up on the stack.  Try to create unaligned placement (in the
// baseline compiler anyway) by inserting i32 locals before or after and
// inbetween the v128 ones and by having so many locals that we run out of
// registers.

var nlocals = 64;
for ( let start of [0, 1]) {
    let decl = "";
    let set = "";
    let sum = "(v128.const i32x4 0 0 0 0)";
    var res = [0,0,0,0];
    var locno = start;
    for ( let i=start ; i < start + nlocals ; i++ ) {
        decl += "(local v128) ";
        set += `(local.set ${locno} (v128.const i32x4 ${i} ${i+1} ${i+2} ${i+3})) `;
        sum = `(i32x4.add ${sum} (local.get ${locno}))`;
        locno++;
        res[0] += i;
        res[1] += i+1;
        res[2] += i+2;
        res[3] += i+3;
        if ((i % 5) == 3) {
            decl += "(local i32) ";
            locno++;
        }
    }
    if (start)
        decl = "(local i32) " + decl;
    else
        decl += "(local i32) ";
    var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func $g (result v128)
      ${decl}
      ${set}
      ${sum})
    (func (export "f")
      (v128.store (i32.const 160) (call $g))))`);

    var mem = new Uint32Array(ins.exports.mem.buffer);
    ins.exports.f();
    assertSame(get(mem, 40, 4), res);
}

// Ditto parameters.  This is like the case above but values are passed rather
// than set.
//
// call
// call_indirect

var nlocals = 64;
for ( let start of [0, 1]) {
    let decl = "";
    let pass = "";
    let sum = "(v128.const i32x4 0 0 0 0)";
    var res = [0,0,0,0];
    var locno = start;
    for ( let i=start ; i < start + nlocals ; i++ ) {
        decl += "(param v128) ";
        pass += `(v128.const i32x4 ${i} ${i+1} ${i+2} ${i+3}) `;
        sum = `(i32x4.add ${sum} (local.get ${locno}))`;
        locno++;
        res[0] += i;
        res[1] += i+1;
        res[2] += i+2;
        res[3] += i+3;
        if ((i % 5) == 3) {
            decl += "(param i32) ";
            pass += "(i32.const 0) ";
            locno++;
        }
    }
    if (start) {
        decl = "(param i32) " + decl;
        pass = "(i32.const 0) " + pass;
    } else {
        decl += "(param i32) ";
        pass += "(i32.const 0) ";
    }
    var txt = `
  (module
    (memory (export "mem") 1 1)
    (type $t1 (func ${decl} (result v128)))
    (table funcref (elem $h))
    (func $g ${decl} (result v128)
      ${sum})
    (func (export "f1")
      (v128.store (i32.const 160) (call $g ${pass})))
    (func $h ${decl} (result v128)
      ${sum})
    (func (export "f2")
      (v128.store (i32.const 512) (call_indirect (type $t1) ${pass} (i32.const 0)))))`;
    var ins = wasmEvalText(txt);

    var mem = new Uint32Array(ins.exports.mem.buffer);
    ins.exports.f1();
    assertSame(get(mem, 40, 4), res);
    ins.exports.f2();
    assertSame(get(mem, 128, 4), res);
}

// Widening integer dot product

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "run")
      (v128.store (i32.const 0)
        (i32x4.dot_i16x8_s (v128.load (i32.const 16)) (v128.load (i32.const 32))))))`);

var xs = [5, 1, -4, 2, 20, -15, 12, 3];
var ys = [6, 0, -7, 3, 8, -1, -3, 7];
var ans = [xs[0]*ys[0] + xs[1]*ys[1],
           xs[2]*ys[2] + xs[3]*ys[3],
           xs[4]*ys[4] + xs[5]*ys[5],
           xs[6]*ys[6] + xs[7]*ys[7]];

var mem16 = new Int16Array(ins.exports.mem.buffer);
var mem32 = new Int32Array(ins.exports.mem.buffer);
set(mem16, 8, xs);
set(mem16, 16, ys);
ins.exports.run();
var result = get(mem32, 0, 4);
assertSame(result, ans);

// Splat, with and without constants (different code paths in ion)

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "splat_i8x16") (param $src i32)
      (v128.store (i32.const 0) (i8x16.splat (local.get $src))))
    (func (export "csplat_i8x16")
      (v128.store (i32.const 0) (i8x16.splat (i32.const 37))))
    (func (export "splat_i16x8") (param $src i32)
      (v128.store (i32.const 0) (i16x8.splat (local.get $src))))
    (func (export "csplat_i16x8")
      (v128.store (i32.const 0) (i16x8.splat (i32.const 1175))))
    (func (export "splat_i32x4") (param $src i32)
      (v128.store (i32.const 0) (i32x4.splat (local.get $src))))
    (func (export "csplat_i32x4")
      (v128.store (i32.const 0) (i32x4.splat (i32.const 127639))))
    (func (export "splat_i64x2") (param $src i64)
      (v128.store (i32.const 0) (i64x2.splat (local.get $src))))
    (func (export "csplat_i64x2")
      (v128.store (i32.const 0) (i64x2.splat (i64.const 0x1234_5678_4365))))
    (func (export "splat_f32x4") (param $src f32)
      (v128.store (i32.const 0) (f32x4.splat (local.get $src))))
    (func (export "csplat_f32x4")
      (v128.store (i32.const 0) (f32x4.splat (f32.const 9121.25))))
    (func (export "splat_f64x2") (param $src f64)
      (v128.store (i32.const 0) (f64x2.splat (local.get $src))))
    (func (export "csplat_f64x2")
      (v128.store (i32.const 0) (f64x2.splat (f64.const 26789.125))))
)`);

var mem8 = new Uint8Array(ins.exports.mem.buffer);
ins.exports.splat_i8x16(3);
assertSame(get(mem8, 0, 16), iota(16).map(_=>3));
ins.exports.csplat_i8x16();
assertSame(get(mem8, 0, 16), iota(16).map(_=>37));

var mem16 = new Uint16Array(ins.exports.mem.buffer);
ins.exports.splat_i16x8(976);
assertSame(get(mem16, 0, 8), iota(8).map(_=>976));
ins.exports.csplat_i16x8();
assertSame(get(mem16, 0, 8), iota(8).map(_=>1175));

var mem32 = new Uint32Array(ins.exports.mem.buffer);
ins.exports.splat_i32x4(147812);
assertSame(get(mem32, 0, 4), [147812, 147812, 147812, 147812]);
ins.exports.csplat_i32x4();
assertSame(get(mem32, 0, 4), [127639, 127639, 127639, 127639]);

var mem64 = new BigInt64Array(ins.exports.mem.buffer);
ins.exports.splat_i64x2(147812n);
assertSame(get(mem64, 0, 2), [147812, 147812]);
ins.exports.csplat_i64x2();
assertSame(get(mem64, 0, 2), [0x1234_5678_4365n, 0x1234_5678_4365n]);

var memf32 = new Float32Array(ins.exports.mem.buffer);
ins.exports.splat_f32x4(147812.5);
assertSame(get(memf32, 0, 4), [147812.5, 147812.5, 147812.5, 147812.5]);
ins.exports.csplat_f32x4();
assertSame(get(memf32, 0, 4), [9121.25, 9121.25, 9121.25, 9121.25]);

var memf64 = new Float64Array(ins.exports.mem.buffer);
ins.exports.splat_f64x2(147812.5);
assertSame(get(memf64, 0, 2), [147812.5, 147812.5]);
ins.exports.csplat_f64x2();
assertSame(get(memf64, 0, 2), [26789.125, 26789.125]);

// AnyTrue.  Ion constant folds, so test that too.

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "anytrue_i8x16") (result i32)
      (v128.any_true (v128.load (i32.const 16))))
    (func (export "true_anytrue_i8x16") (result i32)
      (v128.any_true (v128.const i8x16 0 0 8 0 0 0 0 0 0 0 0 0 0 0 0 0)))
    (func (export "false_anytrue_i8x16") (result i32)
      (v128.any_true (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0))))`);

var mem = new Uint8Array(ins.exports.mem.buffer);
set(mem, 16, iota(16).map((_) => 0));
assertEq(ins.exports.anytrue_i8x16(), 0);

for ( let dope of [1, 7, 32, 195 ] ) {
    set(mem, 16, iota(16).map((x) => x == 7 ? dope : 0));
    assertEq(ins.exports.anytrue_i8x16(), 1);
}

assertEq(ins.exports.true_anytrue_i8x16(), 1);
assertEq(ins.exports.false_anytrue_i8x16(), 0);

// AllTrue.  Ion constant folds, so test that too.

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "alltrue_i8x16") (result i32)
      (i8x16.all_true (v128.load (i32.const 16))))
    (func (export "true_alltrue_i8x16") (result i32)
      (i8x16.all_true (v128.const i8x16 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16)))
    (func (export "false_alltrue_i8x16") (result i32)
      (i8x16.all_true (v128.const i8x16 1 2 3 4 5 6 0 8 9 10 11 12 13 14 15 16)))
    (func (export "alltrue_i16x8") (result i32)
      (i16x8.all_true (v128.load (i32.const 16))))
    (func (export "true_alltrue_i16x8") (result i32)
      (i16x8.all_true (v128.const i16x8 1 2 3 4 5 6 7 8)))
    (func (export "false_alltrue_i16x8") (result i32)
      (i16x8.all_true (v128.const i16x8 1 2 3 4 5 0 7 8)))
    (func (export "alltrue_i32x4") (result i32)
      (i32x4.all_true (v128.load (i32.const 16))))
    (func (export "true_alltrue_i32x4") (result i32)
      (i32x4.all_true (v128.const i32x4 1 2 3 4)))
    (func (export "false_alltrue_i32x4") (result i32)
      (i32x4.all_true (v128.const i32x4 1 2 3 0))))`);

var mem8 = new Uint8Array(ins.exports.mem.buffer);
var mem16 = new Uint16Array(ins.exports.mem.buffer);
var mem32 = new Uint32Array(ins.exports.mem.buffer);

set(mem8, 16, iota(16).map((_) => 0));
assertEq(ins.exports.alltrue_i8x16(), 0);
assertEq(ins.exports.alltrue_i16x8(), 0);
assertEq(ins.exports.alltrue_i32x4(), 0);

set(mem8, 16, iota(16).map((_) => 1));
assertEq(ins.exports.alltrue_i8x16(), 1);

set(mem16, 8, iota(8).map((_) => 1));
assertEq(ins.exports.alltrue_i16x8(), 1);

set(mem32, 4, iota(4).map((_) => 1));
assertEq(ins.exports.alltrue_i32x4(), 1);

for ( let dope of [1, 7, 32, 195 ] ) {
    set(mem8, 16, iota(16).map((x) => x == 7 ? 0 : dope));
    assertEq(ins.exports.alltrue_i8x16(), 0);

    set(mem16, 8, iota(8).map((x) => x == 4 ? 0 : dope));
    assertEq(ins.exports.alltrue_i16x8(), 0);

    set(mem32, 4, iota(4).map((x) => x == 2 ? 0 : dope));
    assertEq(ins.exports.alltrue_i32x4(), 0);
}

assertEq(ins.exports.true_alltrue_i8x16(), 1);
assertEq(ins.exports.false_alltrue_i8x16(), 0);
assertEq(ins.exports.true_alltrue_i16x8(), 1);
assertEq(ins.exports.false_alltrue_i16x8(), 0);
assertEq(ins.exports.true_alltrue_i32x4(), 1);
assertEq(ins.exports.false_alltrue_i32x4(), 0);

// Bitmask.  Ion constant folds, so test that too.

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "bitmask_i8x16") (result i32)
      (i8x16.bitmask (v128.load (i32.const 16))))
    (func (export "const_bitmask_i8x16") (result i32)
      (i8x16.bitmask (v128.const i8x16 0x80 0x7f 0xff 0x33 0x42 0x98 0x01 0x00
                                       0x31 0xcc 0xdd 0x12 0xf0 0x40 0x02 0xa0)))
    (func (export "bitmask_i16x8") (result i32)
      (i16x8.bitmask (v128.load (i32.const 16))))
    (func (export "const_bitmask_i16x8") (result i32)
      (i16x8.bitmask (v128.const i16x8 0x7f80 0xff33 0x9842 0x0001 0xcc31 0x12dd 0x40f0 0xa002)))
    (func (export "bitmask_i32x4") (result i32)
      (i32x4.bitmask (v128.load (i32.const 16))))
    (func (export "const_bitmask_i32x4") (result i32)
      (i32x4.bitmask (v128.const i32x4 0xff337f80 0x00019842 0xcc3112dd 0xa00240f0))))`);

var mem8 = new Uint8Array(ins.exports.mem.buffer);
var mem16 = new Uint16Array(ins.exports.mem.buffer);
var mem32 = new Uint32Array(ins.exports.mem.buffer);

set(mem8, 16, iota(16).map((_) => 0));
assertEq(ins.exports.bitmask_i8x16(), 0);
assertEq(ins.exports.bitmask_i16x8(), 0);
assertEq(ins.exports.bitmask_i32x4(), 0);

set(mem8, 16, iota(16).map((_) => 0x80));
assertEq(ins.exports.bitmask_i8x16(), 0xFFFF);

set(mem8, 16, iota(16).map((_) => 0x7F));
assertEq(ins.exports.bitmask_i8x16(), 0);

set(mem8, 16, iota(16).map((i) => popcount(i) == 1 ? 0x80 : 0));
assertEq(ins.exports.bitmask_i8x16(), (1 << 1) | (1 << 2) | (1 << 4) | (1 << 8));

assertEq(ins.exports.const_bitmask_i8x16(), 0x9625);

set(mem16, 8, iota(8).map((i) => 0x8000))
assertEq(ins.exports.bitmask_i16x8(), 0xFF)

set(mem16, 8, iota(8).map((i) => 0x7FFF))
assertEq(ins.exports.bitmask_i16x8(), 0)

set(mem16, 8, iota(8).map((i) => popcount(i) == 1 ? 0x8000 : 0))
assertEq(ins.exports.bitmask_i16x8(), (1 << 1) | (1 << 2) | (1 << 4));

assertEq(ins.exports.const_bitmask_i16x8(), 0x96);

set(mem32, 4, iota(4).map((_) => 0x80000000))
assertEq(ins.exports.bitmask_i32x4(), 0xF);

set(mem32, 4, iota(4).map((_) => 0x7FFFFFFF))
assertEq(ins.exports.bitmask_i32x4(), 0);

set(mem32, 4, iota(4).map((i) => popcount(i) == 1 ? 0x80000000 : 0))
assertEq(ins.exports.bitmask_i32x4(), (1 << 1) | (1 << 2));

assertEq(ins.exports.const_bitmask_i32x4(), 0xd);

// Shifts
//
// lhs is v128 in memory
// rhs is i32 (passed directly)
// result is v128 in memory

function shr(count, width) {
    return (v) => {
        if (count == 0)
            return v;
        if (width == 64) {
            if (v < 0) {
                // This basically mirrors what the SIMD code does, so if there's
                // a bug there then there's a bug here too.  Seems OK though.
                let s = 0x1_0000_0000_0000_0000n + BigInt(v);
                let t = s / (1n << BigInt(count));
                let u = ((1n << BigInt(count)) - 1n) * (2n ** BigInt(64-count));
                let w = t + u;
                return w - 0x1_0000_0000_0000_0000n;
            }
            return BigInt(v) / (1n << BigInt(count));
        } else {
            let mask = (width == 32) ? -1 : ((1 << width) - 1);
            return (sign_extend(v, width) >> count) & mask;
        }
    }
}

function shru(count, width) {
    if (width == 64) {
        return (v) => {
            if (count == 0)
                return v;
            if (v < 0) {
                v = 0x1_0000_0000_0000_0000n + BigInt(v);
            }
            return BigInt(v) / (1n << BigInt(count));
        }
    } else {
        return (v) => {
            let mask = (width == 32) ? -1 : ((1 << width) - 1);
            return (v >>> count) & mask;
        }
    }
}

var constantI8Shifts = "";
for ( let i of iota(10).concat([-7]) ) {
    constantI8Shifts += `
    (func (export "shl_i8x16_${i}")
      (v128.store (i32.const 0) (i8x16.shl (v128.load (i32.const 16)) (i32.const ${i}))))
    (func (export "shr_i8x16_${i}")
      (v128.store (i32.const 0) (i8x16.shr_s (v128.load (i32.const 16)) (i32.const ${i}))))
    (func (export "shr_u8x16_${i}")
      (v128.store (i32.const 0) (i8x16.shr_u (v128.load (i32.const 16)) (i32.const ${i}))))`;
}

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "shl_i8x16") (param $count i32)
      (v128.store (i32.const 0) (i8x16.shl (v128.load (i32.const 16)) (local.get $count))))
    (func (export "shr_i8x16") (param $count i32)
      (v128.store (i32.const 0) (i8x16.shr_s (v128.load (i32.const 16)) (local.get $count))))
    (func (export "shr_u8x16") (param $count i32)
      (v128.store (i32.const 0) (i8x16.shr_u (v128.load (i32.const 16)) (local.get $count))))
    ${constantI8Shifts}
    (func (export "shl_i16x8") (param $count i32)
      (v128.store (i32.const 0) (i16x8.shl (v128.load (i32.const 16)) (local.get $count))))
    (func (export "shl_i16x8_3")
      (v128.store (i32.const 0) (i16x8.shl (v128.load (i32.const 16)) (i32.const 3))))
    (func (export "shl_i16x8_15")
      (v128.store (i32.const 0) (i16x8.shl (v128.load (i32.const 16)) (i32.const 15))))
    (func (export "shl_i16x8_16")
      (v128.store (i32.const 0) (i16x8.shl (v128.load (i32.const 16)) (i32.const 16))))
    (func (export "shl_i16x8_-15")
      (v128.store (i32.const 0) (i16x8.shl (v128.load (i32.const 16)) (i32.const -15))))
    (func (export "shr_i16x8") (param $count i32)
      (v128.store (i32.const 0) (i16x8.shr_s (v128.load (i32.const 16)) (local.get $count))))
    (func (export "shr_i16x8_3")
      (v128.store (i32.const 0) (i16x8.shr_s (v128.load (i32.const 16)) (i32.const 3))))
    (func (export "shr_i16x8_15")
      (v128.store (i32.const 0) (i16x8.shr_s (v128.load (i32.const 16)) (i32.const 15))))
    (func (export "shr_i16x8_16")
      (v128.store (i32.const 0) (i16x8.shr_s (v128.load (i32.const 16)) (i32.const 16))))
    (func (export "shr_i16x8_-15")
      (v128.store (i32.const 0) (i16x8.shr_s (v128.load (i32.const 16)) (i32.const -15))))
    (func (export "shr_u16x8") (param $count i32)
      (v128.store (i32.const 0) (i16x8.shr_u (v128.load (i32.const 16)) (local.get $count))))
    (func (export "shr_u16x8_3")
      (v128.store (i32.const 0) (i16x8.shr_u (v128.load (i32.const 16)) (i32.const 3))))
    (func (export "shr_u16x8_15")
      (v128.store (i32.const 0) (i16x8.shr_u (v128.load (i32.const 16)) (i32.const 15))))
    (func (export "shr_u16x8_16")
      (v128.store (i32.const 0) (i16x8.shr_u (v128.load (i32.const 16)) (i32.const 16))))
    (func (export "shr_u16x8_-15")
      (v128.store (i32.const 0) (i16x8.shr_u (v128.load (i32.const 16)) (i32.const -15))))
    (func (export "shl_i32x4") (param $count i32)
      (v128.store (i32.const 0) (i32x4.shl (v128.load (i32.const 16)) (local.get $count))))
    (func (export "shl_i32x4_12")
      (v128.store (i32.const 0) (i32x4.shl (v128.load (i32.const 16)) (i32.const 12))))
    (func (export "shl_i32x4_31")
      (v128.store (i32.const 0) (i32x4.shl (v128.load (i32.const 16)) (i32.const 31))))
    (func (export "shl_i32x4_32")
      (v128.store (i32.const 0) (i32x4.shl (v128.load (i32.const 16)) (i32.const 32))))
    (func (export "shl_i32x4_-27")
      (v128.store (i32.const 0) (i32x4.shl (v128.load (i32.const 16)) (i32.const -27))))
    (func (export "shr_i32x4") (param $count i32)
      (v128.store (i32.const 0) (i32x4.shr_s (v128.load (i32.const 16)) (local.get $count))))
    (func (export "shr_i32x4_12")
      (v128.store (i32.const 0) (i32x4.shr_s (v128.load (i32.const 16)) (i32.const 12))))
    (func (export "shr_i32x4_31")
      (v128.store (i32.const 0) (i32x4.shr_s (v128.load (i32.const 16)) (i32.const 31))))
    (func (export "shr_i32x4_32")
      (v128.store (i32.const 0) (i32x4.shr_s (v128.load (i32.const 16)) (i32.const 32))))
    (func (export "shr_i32x4_-27")
      (v128.store (i32.const 0) (i32x4.shr_s (v128.load (i32.const 16)) (i32.const -27))))
    (func (export "shr_u32x4") (param $count i32)
      (v128.store (i32.const 0) (i32x4.shr_u (v128.load (i32.const 16)) (local.get $count))))
    (func (export "shr_u32x4_12")
      (v128.store (i32.const 0) (i32x4.shr_u (v128.load (i32.const 16)) (i32.const 12))))
    (func (export "shr_u32x4_31")
      (v128.store (i32.const 0) (i32x4.shr_u (v128.load (i32.const 16)) (i32.const 31))))
    (func (export "shr_u32x4_32")
      (v128.store (i32.const 0) (i32x4.shr_u (v128.load (i32.const 16)) (i32.const 32))))
    (func (export "shr_u32x4_-27")
      (v128.store (i32.const 0) (i32x4.shr_u (v128.load (i32.const 16)) (i32.const -27))))
    (func (export "shl_i64x2") (param $count i32)
      (v128.store (i32.const 0) (i64x2.shl (v128.load (i32.const 16)) (local.get $count))))
    (func (export "shl_i64x2_27")
      (v128.store (i32.const 0) (i64x2.shl (v128.load (i32.const 16)) (i32.const 27))))
    (func (export "shl_i64x2_63")
      (v128.store (i32.const 0) (i64x2.shl (v128.load (i32.const 16)) (i32.const 63))))
    (func (export "shl_i64x2_64")
      (v128.store (i32.const 0) (i64x2.shl (v128.load (i32.const 16)) (i32.const 64))))
    (func (export "shl_i64x2_-231")
      (v128.store (i32.const 0) (i64x2.shl (v128.load (i32.const 16)) (i32.const -231))))
    (func (export "shr_i64x2") (param $count i32)
      (v128.store (i32.const 0) (i64x2.shr_s (v128.load (i32.const 16)) (local.get $count))))
    (func (export "shr_i64x2_27")
      (v128.store (i32.const 0) (i64x2.shr_s (v128.load (i32.const 16)) (i32.const 27))))
    (func (export "shr_i64x2_45")
      (v128.store (i32.const 0) (i64x2.shr_s (v128.load (i32.const 16)) (i32.const 45))))
    (func (export "shr_i64x2_63")
      (v128.store (i32.const 0) (i64x2.shr_s (v128.load (i32.const 16)) (i32.const 63))))
    (func (export "shr_i64x2_64")
      (v128.store (i32.const 0) (i64x2.shr_s (v128.load (i32.const 16)) (i32.const 64))))
    (func (export "shr_i64x2_-231")
      (v128.store (i32.const 0) (i64x2.shr_s (v128.load (i32.const 16)) (i32.const -231))))
    (func (export "shr_i64x2_-1")
      (v128.store (i32.const 0) (i64x2.shr_s (v128.load (i32.const 16)) (i32.const -1))))
    (func (export "shr_u64x2") (param $count i32)
      (v128.store (i32.const 0) (i64x2.shr_u (v128.load (i32.const 16)) (local.get $count))))
    (func (export "shr_u64x2_27")
      (v128.store (i32.const 0) (i64x2.shr_u (v128.load (i32.const 16)) (i32.const 27))))
    (func (export "shr_u64x2_63")
      (v128.store (i32.const 0) (i64x2.shr_u (v128.load (i32.const 16)) (i32.const 63))))
    (func (export "shr_u64x2_64")
      (v128.store (i32.const 0) (i64x2.shr_u (v128.load (i32.const 16)) (i32.const 64))))
    (func (export "shr_u64x2_-231")
      (v128.store (i32.const 0) (i64x2.shr_u (v128.load (i32.const 16)) (i32.const -231)))))`);

var mem8 = new Uint8Array(ins.exports.mem.buffer);
var as = [1, 2, 4, 8, 16, 32, 64, 128, 129, 130, 132, 136, 144, 160, 192, 255];

set(mem8, 16, as);

for (let [meth,op] of [["shl_i8x16",shl], ["shr_i8x16",shr], ["shr_u8x16",shru]]) {
    for ( let i=0 ; i < 8 ; i++ ) {
        ins.exports[meth](i);
        assertSame(get(mem8, 0, 16), as.map(op(i, 8)))
        ins.exports[meth + "_" + i]();
        assertSame(get(mem8, 0, 16), as.map(op(i, 8)))
    }

    ins.exports[meth](1);
    let a = get(mem8, 0, 16);
    ins.exports[meth](9);
    let b = get(mem8, 0, 16);
    assertSame(a, b);
    ins.exports[meth](-7);
    let c = get(mem8, 0, 16);
    assertSame(a, c);

    ins.exports[meth + "_1"]();
    let x = get(mem8, 0, 16);
    ins.exports[meth + "_9"]();
    let y = get(mem8, 0, 16);
    ins.exports[meth + "_-7"]();
    let z = get(mem8, 0, 16);
    assertSame(x, y);
    assertSame(x, z);
}

var mem16 = new Uint16Array(ins.exports.mem.buffer);
var as = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000];
set(mem16, 8, as)

ins.exports.shl_i16x8(2);
var res = get(mem16, 0, 8);
assertSame(res, as.map(shl(2, 16)))

ins.exports.shl_i16x8(18);      // Masked count
assertSame(get(mem16, 0, 8), res);

ins.exports.shl_i16x8(-14);      // Masked count
assertSame(get(mem16, 0, 8), res);

for ( let shift of [3, 15, 16, -15] ) {
    ins.exports["shl_i16x8_" + shift]();
    assertSame(get(mem16, 0, 8), as.map(shl(shift & 15, 16)))
}

ins.exports.shr_i16x8(1);
var res = get(mem16, 0, 8);
assertSame(res, as.map(shr(1, 16)))

ins.exports.shr_i16x8(17);      // Masked count
assertSame(get(mem16, 0, 8), res);

ins.exports.shr_i16x8(-15);      // Masked count
assertSame(get(mem16, 0, 8), res);

for ( let shift of [3, 15, 16, -15] ) {
    ins.exports["shr_i16x8_" + shift]();
    assertSame(get(mem16, 0, 8), as.map(shr(shift & 15, 16)))
}

ins.exports.shr_u16x8(1);
var res = get(mem16, 0, 8);
assertSame(res, as.map(shru(1, 16)))

ins.exports.shr_u16x8(17);      // Masked count
assertSame(get(mem16, 0, 8), res);

ins.exports.shr_u16x8(-15);      // Masked count
assertSame(get(mem16, 0, 8), res);

for ( let shift of [3, 15, 16, -15] ) {
    ins.exports["shr_u16x8_" + shift]();
    assertSame(get(mem16, 0, 8), as.map(shru(shift & 15, 16)))
}

var mem32 = new Uint32Array(ins.exports.mem.buffer);
var as = [5152, 6768, 7074, 800811];

set(mem32, 4, as)
ins.exports.shl_i32x4(2);
var res = get(mem32, 0, 4);
assertSame(res, as.map(shl(2, 32)))

ins.exports.shl_i32x4(34);      // Masked count
assertSame(get(mem32, 0, 4), res);

ins.exports.shl_i32x4(-30);      // Masked count
assertSame(get(mem32, 0, 4), res);

for ( let shift of [12, 31, 32, -27] ) {
    ins.exports["shl_i32x4_" + shift]();
    assertSame(get(mem32, 0, 4), as.map(shl(shift & 31, 32)).map(x => x>>>0))
}

ins.exports.shr_i32x4(1);
var res = get(mem32, 0, 4);
assertSame(res, as.map(shr(1, 32)))

ins.exports.shr_i32x4(33);      // Masked count
assertSame(get(mem32, 0, 4), res);

ins.exports.shr_i32x4(-31);      // Masked count
assertSame(get(mem32, 0, 4), res);

for ( let shift of [12, 31, 32, -27] ) {
    ins.exports["shr_i32x4_" + shift]();
    assertSame(get(mem32, 0, 4), as.map(shr(shift & 31, 32)))
}

ins.exports.shr_u32x4(1);
var res = get(mem32, 0, 4);
assertSame(res, as.map(shru(1, 32)))

ins.exports.shr_u32x4(33);      // Masked count
assertSame(get(mem32, 0, 4), res);

ins.exports.shr_u32x4(-31);      // Masked count
assertSame(get(mem32, 0, 4), res);

for ( let shift of [12, 31, 32, -27] ) {
    ins.exports["shr_u32x4_" + shift]();
    assertSame(get(mem32, 0, 4), as.map(shru(shift & 31, 32)))
}

var mem64 = new BigInt64Array(ins.exports.mem.buffer);
var as = [50515253, -616263];

set(mem64, 2, as)
ins.exports.shl_i64x2(2);
var res = get(mem64, 0, 2);
assertSame(res, as.map(shl(2, 64)))

ins.exports.shl_i64x2(66);      // Masked count
assertSame(get(mem64, 0, 2), res);

ins.exports.shl_i64x2(-62);      // Masked count
assertSame(get(mem64, 0, 2), res);

for ( let shift of [27, 63, 64, -231] ) {
    ins.exports["shl_i64x2_" + shift]();
    assertSame(get(mem64, 0, 2), as.map(shl(shift & 63, 64)))
}

ins.exports.shr_u64x2(1);
var res = get(mem64, 0, 2);
assertSame(res, as.map(shru(1, 64)))

ins.exports.shr_u64x2(65);      // Masked count
assertSame(get(mem64, 0, 2), res);

ins.exports.shr_u64x2(-63);      // Masked count
assertSame(get(mem64, 0, 2), res);

for ( let shift of [27, 63, 64, -231] ) {
    ins.exports["shr_u64x2_" + shift]();
    assertSame(get(mem64, 0, 2), as.map(shru(shift & 63, 64)))
}

ins.exports.shr_i64x2(2);
var res = get(mem64, 0, 2);
assertSame(res, as.map(shr(2, 64)))

ins.exports.shr_i64x2(66);      // Masked count
assertSame(get(mem64, 0, 2), res);

ins.exports.shr_i64x2(-62);      // Masked count
assertSame(get(mem64, 0, 2), res);

// The ion code generator has multiple paths here, for < 32 and >= 32
for ( let shift of [27, 45, 63, 64, -1, -231] ) {
    ins.exports["shr_i64x2_" + shift]();
    assertSame(get(mem64, 0, 2), as.map(shr(shift & 63, 64)))
}

// Narrow

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "narrow_i16x8_s")
      (v128.store (i32.const 0) (i8x16.narrow_i16x8_s (v128.load (i32.const 16)) (v128.load (i32.const 32)))))
    (func (export "narrow_i16x8_u")
      (v128.store (i32.const 0) (i8x16.narrow_i16x8_u (v128.load (i32.const 16)) (v128.load (i32.const 32)))))
    (func (export "narrow_i32x4_s")
      (v128.store (i32.const 0) (i16x8.narrow_i32x4_s (v128.load (i32.const 16)) (v128.load (i32.const 32)))))
    (func (export "narrow_i32x4_u")
      (v128.store (i32.const 0) (i16x8.narrow_i32x4_u (v128.load (i32.const 16)) (v128.load (i32.const 32))))))`);

var mem8 = new Int8Array(ins.exports.mem.buffer);
var mem8u = new Uint8Array(ins.exports.mem.buffer);
var mem16 = new Int16Array(ins.exports.mem.buffer);
var mem16u = new Uint16Array(ins.exports.mem.buffer);
var mem32 = new Int32Array(ins.exports.mem.buffer);

var as = [1, 267, 3987, 14523, 32768, 3, 312, 4876].map((x) => sign_extend(x, 16));
var bs = [2, 312, 4876, 15987, 33777, 1, 267, 3987].map((x) => sign_extend(x, 16));

set(mem16, 8, as);
set(mem16, 16, bs);

ins.exports.narrow_i16x8_s();
var cs = as.concat(...bs).map((x) => signed_saturate(x, 8));
assertSame(get(mem8, 0, 16), cs);

ins.exports.narrow_i16x8_u();
var cs = as.concat(...bs).map((x) => unsigned_saturate(x, 8));
assertSame(get(mem8u, 0, 16), cs);

var xs = [1, 3987, 14523, 32768].map((x) => x << 16).map((x) => sign_extend(x, 32));
var ys = [2, 4876, 15987, 33777].map((x) => x << 16).map((x) => sign_extend(x, 32));

set(mem32, 4, xs);
set(mem32, 8, ys);

ins.exports.narrow_i32x4_s();
var cs = xs.concat(...ys).map((x) => signed_saturate(x, 16));
assertSame(get(mem16, 0, 8), cs);

ins.exports.narrow_i32x4_u();
var cs = xs.concat(...ys).map((x) => unsigned_saturate(x, 16));
assertSame(get(mem16u, 0, 8), cs);

// Extend low/high

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "extend_low_i8x16_s")
      (v128.store (i32.const 0) (i16x8.extend_low_i8x16_s (v128.load (i32.const 16)))))
    (func (export "extend_high_i8x16_s")
      (v128.store (i32.const 0) (i16x8.extend_high_i8x16_s (v128.load (i32.const 16)))))
    (func (export "extend_low_i8x16_u")
      (v128.store (i32.const 0) (i16x8.extend_low_i8x16_u (v128.load (i32.const 16)))))
    (func (export "extend_high_i8x16_u")
      (v128.store (i32.const 0) (i16x8.extend_high_i8x16_u (v128.load (i32.const 16)))))
    (func (export "extend_low_i16x8_s")
      (v128.store (i32.const 0) (i32x4.extend_low_i16x8_s (v128.load (i32.const 16)))))
    (func (export "extend_high_i16x8_s")
      (v128.store (i32.const 0) (i32x4.extend_high_i16x8_s (v128.load (i32.const 16)))))
    (func (export "extend_low_i16x8_u")
      (v128.store (i32.const 0) (i32x4.extend_low_i16x8_u (v128.load (i32.const 16)))))
    (func (export "extend_high_i16x8_u")
      (v128.store (i32.const 0) (i32x4.extend_high_i16x8_u (v128.load (i32.const 16))))))`);

var mem16 = new Int16Array(ins.exports.mem.buffer);
var mem16u = new Uint16Array(ins.exports.mem.buffer);
var mem8 =  new Int8Array(ins.exports.mem.buffer);
var as = [0, 1, 192, 3, 205, 5, 6, 133, 8, 9, 129, 11, 201, 13, 14, 255];

set(mem8, 16, as);

ins.exports.extend_low_i8x16_s();
assertSame(get(mem16, 0, 8), iota(8).map((n) => sign_extend(as[n], 8)));

ins.exports.extend_high_i8x16_s();
assertSame(get(mem16, 0, 8), iota(8).map((n) => sign_extend(as[n+8], 8)));

ins.exports.extend_low_i8x16_u();
assertSame(get(mem16u, 0, 8), iota(8).map((n) => zero_extend(as[n], 8)));

ins.exports.extend_high_i8x16_u();
assertSame(get(mem16u, 0, 8), iota(8).map((n) => zero_extend(as[n+8], 8)));

var mem32 = new Int32Array(ins.exports.mem.buffer);
var mem32u = new Uint32Array(ins.exports.mem.buffer);

var as = [0, 1, 192, 3, 205, 5, 6, 133].map((x) => x << 8);

set(mem16, 8, as);

ins.exports.extend_low_i16x8_s();
assertSame(get(mem32, 0, 4), iota(4).map((n) => sign_extend(as[n], 16)));

ins.exports.extend_high_i16x8_s();
assertSame(get(mem32, 0, 4), iota(4).map((n) => sign_extend(as[n+4], 16)));

ins.exports.extend_low_i16x8_u();
assertSame(get(mem32u, 0, 4), iota(4).map((n) => zero_extend(as[n], 16)));

ins.exports.extend_high_i16x8_u();
assertSame(get(mem32u, 0, 4), iota(4).map((n) => zero_extend(as[n+4], 16)));


// Extract lane.  Ion constant folds, so test that too.
//
// operand is v128 in memory (or constant)
// lane index is immediate so we're testing something randomish but not zero
// result is scalar (returned directly)

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "extract_i8x16_9") (result i32)
      (i8x16.extract_lane_s 9 (v128.load (i32.const 16))))
    (func (export "const_extract_i8x16_9") (result i32)
      (i8x16.extract_lane_s 9 (v128.const i8x16 -1 -2 -3 -4 -5 -6 -7 -8 -9 -10 -11 -12 -13 -14 -15 -16)))
    (func (export "extract_u8x16_6") (result i32)
      (i8x16.extract_lane_u 6 (v128.load (i32.const 16))))
    (func (export "const_extract_u8x16_9") (result i32)
      (i8x16.extract_lane_u 9 (v128.const i8x16 -1 -2 -3 -4 -5 -6 -7 -8 -9 -10 -11 -12 -13 -14 -15 -16)))
    (func (export "extract_i16x8_5") (result i32)
      (i16x8.extract_lane_s 5 (v128.load (i32.const 16))))
    (func (export "const_extract_i16x8_5") (result i32)
      (i16x8.extract_lane_s 5 (v128.const i16x8 -1 -2 -3 -4 -5 -6 -7 -8)))
    (func (export "extract_u16x8_3") (result i32)
      (i16x8.extract_lane_u 3 (v128.load (i32.const 16))))
    (func (export "const_extract_u16x8_3") (result i32)
      (i16x8.extract_lane_u 3 (v128.const i16x8 -1 -2 -3 -4 -5 -6 -7 -8)))
    (func (export "extract_i32x4_2") (result i32)
      (i32x4.extract_lane 2 (v128.load (i32.const 16))))
    (func (export "const_extract_i32x4_2") (result i32)
      (i32x4.extract_lane 2 (v128.const i32x4 -1 -2 -3 -4)))
    (func (export "extract_i64x2_1") (result i64)
      (i64x2.extract_lane 1 (v128.load (i32.const 16))))
    (func (export "const_extract_i64x2_1") (result i64)
      (i64x2.extract_lane 1 (v128.const i64x2 -1 -2)))
    (func (export "extract_f32x4_2") (result f32)
      (f32x4.extract_lane 2 (v128.load (i32.const 16))))
    (func (export "const_extract_f32x4_2") (result f32)
      (f32x4.extract_lane 2 (v128.const f32x4 -1 -2 -3 -4)))
    (func (export "extract_f64x2_1") (result f64)
      (f64x2.extract_lane 1 (v128.load (i32.const 16))))
    (func (export "const_extract_f64x2_1") (result f64)
      (f64x2.extract_lane 1 (v128.const f64x2 -1 -2))))`);

var mem8 = new Uint8Array(ins.exports.mem.buffer);
var as = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
var bs = as.map((x) => -x);

set(mem8, 16, as)
assertEq(ins.exports.extract_i8x16_9(), as[9]);

set(mem8, 16, bs)
assertEq(ins.exports.extract_u8x16_6(), 256 - as[6]);

assertEq(ins.exports.const_extract_i8x16_9(), -10);
assertEq(ins.exports.const_extract_u8x16_9(), 256-10);

var mem16 = new Uint16Array(ins.exports.mem.buffer);
var as = [1, 2, 3, 4, 5, 6, 7, 8];
var bs = as.map((x) => -x);

set(mem16, 8, as)
assertEq(ins.exports.extract_i16x8_5(), as[5]);

set(mem16, 8, bs)
assertEq(ins.exports.extract_u16x8_3(), 65536 - as[3]);

assertEq(ins.exports.const_extract_i16x8_5(), -6);
assertEq(ins.exports.const_extract_u16x8_3(), 65536-4);

var mem32 = new Uint32Array(ins.exports.mem.buffer);
var as = [1, 2, 3, 4];

set(mem32, 4, as)
assertEq(ins.exports.extract_i32x4_2(), as[2]);

assertEq(ins.exports.const_extract_i32x4_2(), -3);

var mem32 = new Float32Array(ins.exports.mem.buffer);
var as = [1.5, 2.5, 3.5, 4.5];

set(mem32, 4, as)
assertEq(ins.exports.extract_f32x4_2(), as[2]);

assertEq(ins.exports.const_extract_f32x4_2(), -3);

var mem64 = new Float64Array(ins.exports.mem.buffer);
var as = [1.5, 2.5];

set(mem64, 2, as)
assertEq(ins.exports.extract_f64x2_1(), as[1]);

assertEq(ins.exports.const_extract_f64x2_1(), -2);

var mem64 = new BigInt64Array(ins.exports.mem.buffer);
var as = [12345, 67890];

set(mem64, 2, as)
assertSame(ins.exports.extract_i64x2_1(), as[1]);

assertEq(ins.exports.const_extract_i64x2_1(), -2n);

// Replace lane
//
// operand 1 is v128 in memory
// operand 2 is immediate scalar
// lane index is immediate so we're testing something randomish but not zero
// (note though that fp operations have special cases for zero)
// result is v128 in memory

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "replace_i8x16_9") (param $value i32)
      (v128.store (i32.const 0)
        (i8x16.replace_lane 9 (v128.load (i32.const 16)) (local.get $value))))
    (func (export "replace_i16x8_5") (param $value i32)
      (v128.store (i32.const 0)
        (i16x8.replace_lane 5 (v128.load (i32.const 16)) (local.get $value))))
    (func (export "replace_i32x4_3") (param $value i32)
      (v128.store (i32.const 0)
        (i32x4.replace_lane 3 (v128.load (i32.const 16)) (local.get $value))))
    (func (export "replace_i64x2_1") (param $value i64)
      (v128.store (i32.const 0)
        (i64x2.replace_lane 1 (v128.load (i32.const 16)) (local.get $value))))
    (func (export "replace_f32x4_0") (param $value f32)
      (v128.store (i32.const 0)
        (f32x4.replace_lane 0 (v128.load (i32.const 16)) (local.get $value))))
    (func (export "replace_f32x4_3") (param $value f32)
      (v128.store (i32.const 0)
        (f32x4.replace_lane 3 (v128.load (i32.const 16)) (local.get $value))))
    (func (export "replace_f64x2_0") (param $value f64)
      (v128.store (i32.const 0)
        (f64x2.replace_lane 0 (v128.load (i32.const 16)) (local.get $value))))
    (func (export "replace_f64x2_1") (param $value f64)
      (v128.store (i32.const 0)
        (f64x2.replace_lane 1 (v128.load (i32.const 16)) (local.get $value)))))`);


var mem8 = new Uint8Array(ins.exports.mem.buffer);
var as = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

set(mem8, 16, as)
ins.exports.replace_i8x16_9(42);
assertSame(get(mem8, 0, 16), upd(as, 9, 42));

var mem16 = new Uint16Array(ins.exports.mem.buffer);
var as = [1, 2, 3, 4, 5, 6, 7, 8];

set(mem16, 8, as)
ins.exports.replace_i16x8_5(42);
assertSame(get(mem16, 0, 8), upd(as, 5, 42));

var mem32 = new Uint32Array(ins.exports.mem.buffer);
var as = [1, 2, 3, 4];

set(mem32, 4, as)
ins.exports.replace_i32x4_3(42);
assertSame(get(mem32, 0, 4), upd(as, 3, 42));

var mem64 = new BigInt64Array(ins.exports.mem.buffer);
var as = [1, 2];

set(mem64, 2, as)
ins.exports.replace_i64x2_1(42n);
assertSame(get(mem64, 0, 2), upd(as, 1, 42));

var mem32 = new Float32Array(ins.exports.mem.buffer);
var as = [1.5, 2.5, 3.5, 4.5];

set(mem32, 4, as)
ins.exports.replace_f32x4_0(42.5);
assertSame(get(mem32, 0, 4), upd(as, 0, 42.5));

set(mem32, 4, as)
ins.exports.replace_f32x4_3(42.5);
assertSame(get(mem32, 0, 4), upd(as, 3, 42.5));

var mem64 = new Float64Array(ins.exports.mem.buffer);
var as = [1.5, 2.5];

set(mem64, 2, as)
ins.exports.replace_f64x2_0(42.5);
assertSame(get(mem64, 0, 2), upd(as, 0, 42.5));

set(mem64, 2, as)
ins.exports.replace_f64x2_1(42.5);
assertSame(get(mem64, 0, 2), upd(as, 1, 42.5));

// Load and splat
//
// Operand is memory address of scalar
// Result is v128 in memory

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "load_splat_v8x16") (param $addr i32)
      (v128.store (i32.const 0) (v128.load8_splat (local.get $addr))))
    (func (export "load_splat_v16x8") (param $addr i32)
      (v128.store (i32.const 0) (v128.load16_splat (local.get $addr))))
    (func (export "load_splat_v32x4") (param $addr i32)
      (v128.store (i32.const 0) (v128.load32_splat (local.get $addr))))
    (func (export "load_splat_v64x2") (param $addr i32)
      (v128.store (i32.const 0) (v128.load64_splat (local.get $addr)))))`);

var mem8 = new Uint8Array(ins.exports.mem.buffer);
mem8[37] = 42;
ins.exports.load_splat_v8x16(37);
assertSame(get(mem8, 0, 16), [42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42]);

var mem16 = new Uint16Array(ins.exports.mem.buffer);
mem16[37] = 69;
ins.exports.load_splat_v16x8(37*2);
assertSame(get(mem16, 0, 8), [69, 69, 69, 69, 69, 69, 69, 69]);

var mem32 = new Int32Array(ins.exports.mem.buffer);
mem32[37] = 83;
ins.exports.load_splat_v32x4(37*4);
assertSame(get(mem32, 0, 4), [83, 83, 83, 83]);

var mem64 = new BigInt64Array(ins.exports.mem.buffer);
mem64[37] = 83n;
ins.exports.load_splat_v64x2(37*8);
assertSame(get(mem64, 0, 2), [83, 83]);

// Load and zero
//
// Operand is memory address of scalar
// Result is v128 in memory

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "load32_zero") (param $addr i32)
      (v128.store (i32.const 0) (v128.load32_zero (local.get $addr))))
    (func (export "load64_zero") (param $addr i32)
      (v128.store (i32.const 0) (v128.load64_zero (local.get $addr)))))`);

var mem32 = new Int32Array(ins.exports.mem.buffer);
mem32[37] = 0x12345678;
mem32[38] = 0xffffffff;
mem32[39] = 0xfffffffe;
mem32[40] = 0xfffffffd;
ins.exports.load32_zero(37*4);
assertSame(get(mem32, 0, 4), [0x12345678, 0, 0, 0]);

var mem64 = new BigInt64Array(ins.exports.mem.buffer);
mem64[37] = 0x12345678abcdef01n;
mem64[38] = 0xffffffffffffffffn;
ins.exports.load64_zero(37*8);
assertSame(get(mem64, 0, 2), [0x12345678abcdef01n, 0n]);

// Load and extend
//
// Operand is memory address of 64-bit scalar representing 8, 4, or 2 values
// Result is v128 in memory

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "load8x8_s") (param $addr i32)
      (v128.store (i32.const 0) (v128.load8x8_s (local.get $addr))))
    (func (export "load8x8_u") (param $addr i32)
      (v128.store (i32.const 0) (v128.load8x8_u (local.get $addr))))
    (func (export "load16x4_s") (param $addr i32)
      (v128.store (i32.const 0) (v128.load16x4_s (local.get $addr))))
    (func (export "load16x4_u") (param $addr i32)
      (v128.store (i32.const 0) (v128.load16x4_u (local.get $addr))))
    (func (export "load32x2_s") (param $addr i32)
      (v128.store (i32.const 0) (v128.load32x2_s (local.get $addr))))
    (func (export "load32x2_u") (param $addr i32)
      (v128.store (i32.const 0) (v128.load32x2_u (local.get $addr)))))`);

var mem8 = new Uint8Array(ins.exports.mem.buffer);
var mem16s = new Int16Array(ins.exports.mem.buffer);
var mem16u = new Uint16Array(ins.exports.mem.buffer);
var mem32s = new Int32Array(ins.exports.mem.buffer);
var mem32u = new Uint32Array(ins.exports.mem.buffer);
var mem64s = new BigInt64Array(ins.exports.mem.buffer);
var mem64u = new BigUint64Array(ins.exports.mem.buffer);
var xs = [42, 129, 2, 212, 44, 27, 12, 199];
set(mem8, 48, xs);

ins.exports.load8x8_s(48);
assertSame(get(mem16s, 0, 8), xs.map((x) => sign_extend(x, 8)));

ins.exports.load8x8_u(48);
assertSame(get(mem16u, 0, 8), xs.map((x) => zero_extend(x, 8)));

var xs = [(42 << 8) | 129, (212 << 8) | 2, (44 << 8) | 27, (199 << 8) | 12];
set(mem16u, 24, xs);

ins.exports.load16x4_s(48);
assertSame(get(mem32s, 0, 4), xs.map((x) => sign_extend(x, 16)));

ins.exports.load16x4_u(48);
assertSame(get(mem32u, 0, 4), xs.map((x) => zero_extend(x, 16)));

var xs = [5, -8];
set(mem32u, 12, xs);

ins.exports.load32x2_s(48);
assertSame(get(mem64s, 0, 2), xs.map((x) => sign_extend(x, 32)));

ins.exports.load32x2_u(48);
assertSame(get(mem64s, 0, 2), xs.map((x) => zero_extend(x, 32)));

// Vector select
//
// Operands and results are all in memory

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "bitselect_v128")
      (v128.store (i32.const 0)
        (v128.bitselect (v128.load (i32.const 16))
                        (v128.load (i32.const 32))
                        (v128.load (i32.const 48))))))`);

var mem8 = new Uint8Array(ins.exports.mem.buffer);
set(mem8, 16, iota(16).map((_) => 0xAA));
set(mem8, 32, iota(16).map((_) => 0x55));

set(mem8, 48, iota(16).map((_) => 0x99));
ins.exports.bitselect_v128();
assertSame(get(mem8, 0, 16), iota(16).map((_) => 0xCC));

set(mem8, 48, iota(16).map((_) => 0x77));
ins.exports.bitselect_v128();
assertSame(get(mem8, 0, 16), iota(16).map((_) => 0x22));

// Vector shuffle
//
// Operands and results are all in memory

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    ;; the result interleaves the low eight bytes of the inputs
    (func (export "shuffle1")
      (v128.store (i32.const 0)
        (i8x16.shuffle 0 16 1 17 2 18 3 19 4 20 5 21 6 22 7 23
           (v128.load (i32.const 16))
           (v128.load (i32.const 32)))))
    ;; ditto the high eight bytes
    (func (export "shuffle2")
      (v128.store (i32.const 0)
        (i8x16.shuffle 8 24 9 25 10 26 11 27 12 28 13 29 14 30 15 31
           (v128.load (i32.const 16))
           (v128.load (i32.const 32))))))`);

var mem8 = new Uint8Array(ins.exports.mem.buffer);
var xs = iota(16).map((n) => 0xA0 + n);
var ys = iota(16).map((n) => 0x50 + n);
set(mem8, 16, xs);
set(mem8, 32, ys);

ins.exports.shuffle1();
assertSame(get(mem8, 0, 16), iota(16).map((x) => ((x & 1) ? ys : xs)[x >>> 1]))

ins.exports.shuffle2();
assertSame(get(mem8, 0, 16), iota(32).map((x) => ((x & 1) ? ys : xs)[x >>> 1]).slice(16));

// Vector swizzle (variable permute).
//
// Case 1: Operands and results are all in memory

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "swizzle")
      (v128.store (i32.const 0)
        (i8x16.swizzle (v128.load (i32.const 16)) (v128.load (i32.const 32))))))`);

var mem8 = new Uint8Array(ins.exports.mem.buffer);

var xs = [100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115];
set(mem8, 16, xs);

set(mem8, 32, [1,0,3,2,5,4,7,6,9,8,11,10,13,12,15,14]);
ins.exports.swizzle();
assertSame(get(mem8, 0, 16), [101,100,103,102,105,104,107,106,109,108,111,110,113,112,115,114]);

set(mem8, 32, [9,8,11,10,13,12,16,14,1,0,3,2,5,192,7,6]);
ins.exports.swizzle();
assertSame(get(mem8, 0, 16), [109,108,111,110,113,112,0,114,101,100,103,102,105,0,107,106]);

// Case 2: The mask operand is a constant; the swizzle gets optimized into a
// shuffle (also see ion-analysis.js).

for ( let [mask, expected] of [[[1,0,3,2,5,4,7,6,9,8,11,10,13,12,15,14],
                                [101,100,103,102,105,104,107,106,109,108,111,110,113,112,115,114]],
                               [[9,8,11,10,13,12,16,14,1,0,3,2,5,192,7,6],
                                [109,108,111,110,113,112,0,114,101,100,103,102,105,0,107,106]]] ) {

    let ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "swizzle")
      (v128.store (i32.const 0)
        (i8x16.swizzle (v128.load (i32.const 16)) (v128.const i8x16 ${mask.join(' ')})))))
`);

    let mem8 = new Uint8Array(ins.exports.mem.buffer);
    set(mem8, 16, [100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115]);
    ins.exports.swizzle();
    assertSame(get(mem8, 0, 16), expected);
}

// Convert integer to floating point

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "convert_s")
      (v128.store (i32.const 0)
        (f32x4.convert_i32x4_s (v128.load (i32.const 16)))))
    (func (export "convert_u")
      (v128.store (i32.const 0)
        (f32x4.convert_i32x4_u (v128.load (i32.const 16))))))`);

var mem32s = new Int32Array(ins.exports.mem.buffer);
var mem32f = new Float32Array(ins.exports.mem.buffer);
var xs = [1, -9, 77987, -34512];

set(mem32s, 4, xs);
ins.exports.convert_s();
assertSame(get(mem32f, 0, 4), xs);

var mem32u = new Uint32Array(ins.exports.mem.buffer);
var ys = xs.map((x) => x>>>0);

set(mem32u, 4, ys);
ins.exports.convert_u();
assertSame(get(mem32f, 0, 4), ys.map(Math.fround));

// Convert floating point to integer with saturating truncation

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "trunc_sat_s")
      (v128.store (i32.const 0)
        (i32x4.trunc_sat_f32x4_s (v128.load (i32.const 16)))))
    (func (export "trunc_sat_u")
      (v128.store (i32.const 0)
        (i32x4.trunc_sat_f32x4_u (v128.load (i32.const 16))))))`);

var mem32s = new Int32Array(ins.exports.mem.buffer);
var mem32u = new Uint32Array(ins.exports.mem.buffer);
var mem32f = new Float32Array(ins.exports.mem.buffer);
var xs = [1.5, -9.5, 7.5e12, -8e13];

set(mem32f, 4, xs);
ins.exports.trunc_sat_s();
assertSame(get(mem32s, 0, 4), [1, -9, 0x7FFFFFFF, -0x80000000]);

var xs = [1.5, -9.5, 7.5e12, 812];
set(mem32f, 4, xs);
ins.exports.trunc_sat_u();
assertSame(get(mem32u, 0, 4), [1, 0, 0xFFFFFFFF, 812]);

var xs = [0, -0, 0x80860000, 0x100000000];
set(mem32f, 4, xs);
ins.exports.trunc_sat_u();
assertSame(get(mem32u, 0, 4), [0, 0, 0x80860000, 0xFFFFFFFF]);

// Loops and blocks.  This should at least test "sync" in the baseline compiler.

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func $f (param $count i32) (param $v v128) (result v128)
      (local $tmp v128)
      (block $B1
        (loop $L1
          (br_if $B1 (i32.eqz (local.get $count)))
          (local.set $tmp (i32x4.add (local.get $tmp) (local.get $v)))
          (local.set $count (i32.sub (local.get $count) (i32.const 1)))
          (br $L1)))
      (local.get $tmp))
    (func (export "run") (param $count i32)
      (v128.store (i32.const 0)
        (call $f (local.get $count) (v128.load (i32.const 16))))))`);

var mem32 = new Int32Array(ins.exports.mem.buffer);
set(mem32, 4, [1,2,3,4]);
ins.exports.run(7);
assertSame(get(mem32, 0, 4), [7,14,21,28]);

// Lots of parameters, this should trigger stack parameter passing
//
// 10 parameters in memory, we load them and pass them and operate on them.

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func $f (param $v0 v128) (param $v1 v128) (param $v2 v128) (param $v3 v128) (param $v4 v128)
             (param $v5 v128) (param $v6 v128) (param $v7 v128) (param $v8 v128) (param $v9 v128)
             (result v128)
      (i32x4.add (local.get $v0)
        (i32x4.add (local.get $v1)
          (i32x4.add (local.get $v2)
            (i32x4.add (local.get $v3)
              (i32x4.add (local.get $v4)
                (i32x4.add (local.get $v5)
                  (i32x4.add (local.get $v6)
                    (i32x4.add (local.get $v7)
                      (i32x4.add (local.get $v8) (local.get $v9)))))))))))
    (func (export "run")
      (v128.store (i32.const 0)
        (call $f (v128.load (i32.const ${16*1}))
                 (v128.load (i32.const ${16*2}))
                 (v128.load (i32.const ${16*3}))
                 (v128.load (i32.const ${16*4}))
                 (v128.load (i32.const ${16*5}))
                 (v128.load (i32.const ${16*6}))
                 (v128.load (i32.const ${16*7}))
                 (v128.load (i32.const ${16*8}))
                 (v128.load (i32.const ${16*9}))
                 (v128.load (i32.const ${16*10}))))))`);


var mem32 = new Int32Array(ins.exports.mem.buffer);
var sum = [0, 0, 0, 0];
for ( let i=1; i <= 10; i++ ) {
    let v = [1,2,3,4].map((x) => x*i);
    set(mem32, 4*i, v);
    for ( let j=0; j < 4; j++ )
        sum[j] += v[j];
}

ins.exports.run();

assertSame(get(mem32, 0, 4), sum);

// Globals.
//
// We have a number of different code paths and representations and
// need to test them all.
//
// Cases:
//  - private global, mutable / immutable, initialized from constant or imported immutable global
//  - exported global, mutable / immutable, initialized from constant or imported immutable global
//  - imported global, mutable / immutable
//  - imported global that's re-exported, mutable / immutable

// Global used for initialization below.

var init = (function () {
    var ins = wasmEvalText(`
      (module
        (global (export "init") v128 (v128.const i32x4 9 8 7 6)))`);
    return ins.exports;
})();

for ( let exportspec of ['', '(export "g")'] ) {

    // Private/exported immutable initialized from constant

    let ins1 = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (global $g ${exportspec} v128 (v128.const i32x4 9 8 7 6))
    (func (export "get") (param $dest i32)
      (v128.store (local.get $dest) (global.get $g))))`);

    let mem1 = new Int32Array(ins1.exports.mem.buffer);
    ins1.exports.get(0);
    assertSame(get(mem1, 0, 4), [9, 8, 7, 6]);

    // Private/exported mutable initialized from constant

    let ins2 = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (global $g ${exportspec} (mut v128) (v128.const i32x4 9 8 7 6))
    (func (export "put") (param $val i32)
      (global.set $g (i32x4.splat (local.get $val))))
    (func (export "get") (param $dest i32)
      (v128.store (local.get $dest) (global.get $g))))`);

    let mem2 = new Int32Array(ins2.exports.mem.buffer);
    ins2.exports.get(0);
    assertSame(get(mem2, 0, 4), [9, 8, 7, 6]);
    ins2.exports.put(37);
    ins2.exports.get(0);
    assertSame(get(mem2, 0, 4), [37, 37, 37, 37]);

    // Private/exported immutable initialized from imported immutable global

    let ins3 = wasmEvalText(`
  (module
    (global $init (import "m" "init") v128)
    (memory (export "mem") 1 1)
    (global $g ${exportspec} v128 (global.get $init))
    (func (export "get") (param $dest i32)
      (v128.store (local.get $dest) (global.get $g))))`,
                       {m:init});

    let mem3 = new Int32Array(ins3.exports.mem.buffer);
    ins3.exports.get(0);
    assertSame(get(mem3, 0, 4), [9, 8, 7, 6]);

    // Private/exported mutable initialized from imported immutable global

    let ins4 = wasmEvalText(`
  (module
    (global $init (import "m" "init") v128)
    (memory (export "mem") 1 1)
    (global $g ${exportspec} (mut v128) (global.get $init))
    (func (export "put") (param $val i32)
      (global.set $g (i32x4.splat (local.get $val))))
    (func (export "get") (param $dest i32)
      (v128.store (local.get $dest) (global.get $g))))`,
                       {m:init});

    let mem4 = new Int32Array(ins4.exports.mem.buffer);
    ins4.exports.get(0);
    assertSame(get(mem4, 0, 4), [9, 8, 7, 6]);
    ins4.exports.put(37);
    ins4.exports.get(0);
    assertSame(get(mem4, 0, 4), [37, 37, 37, 37]);

    // Imported private/re-exported immutable

    let ins5 = wasmEvalText(`
  (module
    (global $g ${exportspec} (import "m" "init") v128)
    (memory (export "mem") 1 1)
    (func (export "get") (param $dest i32)
      (v128.store (local.get $dest) (global.get $g))))`,
                       {m:init});

    let mem5 = new Int32Array(ins5.exports.mem.buffer);
    ins5.exports.get(0);
    assertSame(get(mem5, 0, 4), [9, 8, 7, 6]);

    // Imported private/re-exported mutable

    let mutg = (function () {
        var ins = wasmEvalText(`
      (module
        (global (export "mutg") (mut v128) (v128.const i32x4 19 18 17 16)))`);
        return ins.exports;
    })();

    let ins6 = wasmEvalText(`
  (module
    (global $g ${exportspec} (import "m" "mutg") (mut v128))
    (memory (export "mem") 1 1)
    (func (export "put") (param $val i32)
      (global.set $g (i32x4.splat (local.get $val))))
    (func (export "get") (param $dest i32)
      (v128.store (local.get $dest) (global.get $g))))`,
                       {m:mutg});

    let mem6 = new Int32Array(ins6.exports.mem.buffer);
    ins6.exports.get(0);
    assertSame(get(mem6, 0, 4), [19, 18, 17, 16]);
    ins6.exports.put(37);
    ins6.exports.get(0);
    assertSame(get(mem6, 0, 4), [37, 37, 37, 37]);
}

// Imports and exports that pass and return v128

var insworker = wasmEvalText(`
  (module
    (func (export "worker") (param v128) (result v128)
      (i8x16.add (local.get 0) (v128.const i8x16 ${iota(16).join(' ')}))))`);

var insrun = wasmEvalText(`
  (module
    (import "" "worker" (func $worker (param v128) (result v128)))
    (memory (export "mem") 1 1)
    (func (export "run") (param $srcloc i32) (param $destloc i32)
      (v128.store (local.get $destloc)
        (call $worker (v128.load (local.get $srcloc))))))`,
                          {"":insworker.exports});

var mem = new Uint8Array(insrun.exports.mem.buffer);
var xs = iota(16).map((x) => x+5);
set(mem, 0, xs);
insrun.exports.run(0, 16);
assertSame(get(mem, 16, 16), xs.map((x,i) => x+i))

// Make sure JS<->wasm call guards are sensible.

// Calling from JS to export that accepts v128.
assertErrorMessage(() => insworker.exports.worker(),
                   TypeError,
                   /cannot pass.*v128.*to or from JS/);

// Calling from wasm with v128 to import that comes from JS.  The instantiation
// will succeed even if the param type of the import is v128 (see "create a host
// function" in the Wasm JSAPI spec), it is the act of invoking it that checks
// that verboten types are not used (see "run a host function", ibid.).
var badImporter = wasmEvalText(`
  (module
    (import "" "worker" (func $worker (param v128) (result v128)))
    (func (export "run")
      (drop (call $worker (v128.const i32x4 0 1 2 3)))))`,
             {"":{worker: function(a) { return a; }}});

assertErrorMessage(() => badImporter.exports.run(),
                   TypeError,
                   /cannot pass.*v128.*to or from JS/);

// Imports and exports that pass and return v128 as stack (not register) args.

var exportWithStackArgs = wasmEvalText(`
  (module
    (func (export "worker") (param v128) (param v128) (param v128) (param v128)
                            (param v128) (param v128) (param v128) (param v128)
                            (param v128) (param v128) (param v128) (param v128)
                            (param v128) (param v128)
           (result v128 v128)
      (i8x16.add (local.get 3) (local.get 12))
      (local.get 7)))`);

var importWithStackArgs = wasmEvalText(`
  (module
    (type $t1 (func (param v128) (param v128) (param v128) (param v128)
                    (param v128) (param v128) (param v128) (param v128)
                    (param v128) (param v128) (param v128) (param v128)
                    (param v128) (param v128)
                    (result v128 v128)))
    (import "" "worker" (func $worker (type $t1)))
    (memory (export "mem") 1 1)
    (table funcref (elem $worker))
    (func (export "run")
      (i32.const 16)
      (call_indirect (type $t1) (v128.const i32x4 1 1 1 1) (v128.const i32x4 2 2 2 2) (v128.const i32x4 3 3 3 3)
                    (v128.const i32x4 4 4 4 4) (v128.const i32x4 5 5 5 5) (v128.const i32x4 6 6 6 6)
                    (v128.const i32x4 7 7 7 7) (v128.const i32x4 8 8 8 8) (v128.const i32x4 9 9 9 9)
                    (v128.const i32x4 10 10 10 10) (v128.const i32x4 11 11 11 11) (v128.const i32x4 12 12 12 12)
                    (v128.const i32x4 13 13 13 13) (v128.const i32x4 14 14 14 14)
           (i32.const 0))
      drop
      v128.store
      (i32.const 0)
      (call $worker (v128.const i32x4 1 1 1 1) (v128.const i32x4 2 2 2 2) (v128.const i32x4 3 3 3 3)
                    (v128.const i32x4 4 4 4 4) (v128.const i32x4 5 5 5 5) (v128.const i32x4 6 6 6 6)
                    (v128.const i32x4 7 7 7 7) (v128.const i32x4 8 8 8 8) (v128.const i32x4 9 9 9 9)
                    (v128.const i32x4 10 10 10 10) (v128.const i32x4 11 11 11 11) (v128.const i32x4 12 12 12 12)
                    (v128.const i32x4 13 13 13 13) (v128.const i32x4 14 14 14 14))
      drop
      v128.store))`,
                                       {"": exportWithStackArgs.exports});

var mem = new Int32Array(importWithStackArgs.exports.mem.buffer);
importWithStackArgs.exports.run();
assertSame(get(mem, 0, 4), [17, 17, 17, 17]);
assertSame(get(mem, 4, 4), [17, 17, 17, 17]);

// Imports and exports of v128 globals

var insexporter = wasmEvalText(`
  (module
    (global (export "myglobal") (mut v128) (v128.const i8x16 ${iota(16).join(' ')})))`);

var insimporter = wasmEvalText(`
  (module
    (import "m" "myglobal" (global $g (mut v128)))
    (memory (export "mem") 1 1)
    (func (export "run") (param $dest i32)
      (v128.store (local.get $dest) (global.get $g))))`,
                               {m:insexporter.exports});

var mem = new Uint8Array(insimporter.exports.mem.buffer);
insimporter.exports.run(16);
assertSame(get(mem, 16, 16), iota(16));

// Guards on accessing v128 globals from JS

assertErrorMessage(() => insexporter.exports.myglobal.value = 0,
                   TypeError,
                   /cannot pass.*v128.*to or from JS/);

assertErrorMessage(function () { let v = insexporter.exports.myglobal.value },
                   TypeError,
                   /cannot pass.*v128.*to or from JS/);

// Multi-value cases + v128 parameters to if, block, loop

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func $mvreturn (result v128 v128 v128)
      (v128.load (i32.const 16))
      (v128.load (i32.const 0))
      (v128.load (i32.const 32)))
    (func (export "runreturn")
      i32.const 48
      (call $mvreturn)
      i32x4.sub ;; [-20, -20, -20, -20]
      i32x4.sub ;; [31, 32, 33, 34]
      v128.store)
    (func (export "runif") (param $cond i32)
      i32.const 48
      (v128.load (i32.const 0))
      (v128.load (i32.const 16))
      (if (param v128) (param v128) (result v128 v128)
          (local.get $cond)
          (then i32x4.add
                (v128.load (i32.const 32)))
          (else i32x4.sub
                (v128.load (i32.const 0))))
      i32x4.add
      v128.store)
    (func (export "runblock")
      i32.const 48
      (v128.load (i32.const 0))
      (v128.load (i32.const 16))
      (block (param v128 v128) (result v128 v128)
          i32x4.add
          (v128.load (i32.const 32)))
      i32x4.add
      v128.store)
    (func (export "runloop") (param $count i32)
      i32.const 48
      (v128.load (i32.const 0))
      (v128.load (i32.const 16))
      (block $B (param v128 v128) (result v128 v128)
        (loop $L (param v128 v128) (result v128 v128)
          i32x4.add
          (v128.load (i32.const 32))
          (local.set $count (i32.sub (local.get $count) (i32.const 1)))
          (br_if $B (i32.eqz (local.get $count)))
          (br $L)))
      i32x4.add
      v128.store))`);

var mem = new Int32Array(ins.exports.mem.buffer);
set(mem, 0, [1, 2, 3, 4]);
set(mem, 4, [11, 12, 13, 14]);
set(mem, 8, [21, 22, 23, 24]);

// Multi-value returns

ins.exports.runreturn();
assertSame(get(mem, 12, 4), [31, 32, 33, 34]);

// Multi-parameters to and multi-returns from "if"

// This should be vector@0 + vector@16 + vector@32
ins.exports.runif(1);
assertSame(get(mem, 12, 4),
           [33, 36, 39, 42]);

// This should be vector@0 - vector@16 + vector@0
ins.exports.runif(0);
assertSame(get(mem, 12, 4),
           [-9, -8, -7, -6]);

// This should be vector@0 + vector@16 + vector@32
ins.exports.runblock();
assertSame(get(mem, 12, 4),
           [33, 36, 39, 42]);

// This should be vector@0 + vector@16 + N * vector@32 where
// N is the parameter to runloop.
ins.exports.runloop(3);
assertSame(get(mem, 12, 4),
           [12+3*21, 14+3*22, 16+3*23, 18+3*24]);
