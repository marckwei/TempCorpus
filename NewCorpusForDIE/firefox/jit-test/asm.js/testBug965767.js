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

var buffer = new ArrayBuffer(4096);

function testmod (glob, env, b) {
    'use asm';
    var f32=new glob.Float32Array(b)
    function fn1() {
	f32[0 >> 2]=2.0
	f32[4 >> 2]=2.125
	f32[8 >> 2]=2.25
	f32[12 >> 2]=2.375
	f32[16 >> 2]=2.5
	f32[20 >> 2]=2.625
	f32[24 >> 2]=2.75
	f32[28 >> 2]=2.875
	f32[32 >> 2]=3.0
	f32[36 >> 2]=3.125
	f32[40 >> 2]=3.25
	f32[44 >> 2]=3.375
	f32[48 >> 2]=3.5
	f32[52 >> 2]=3.625
	f32[56 >> 2]=3.75
	f32[60 >> 2]=3.875
	f32[64 >> 2]=4.0
	f32[68 >> 2]=4.25
	f32[72 >> 2]=4.5
	f32[76 >> 2]=4.75
	f32[80 >> 2]=5.0
	f32[84 >> 2]=5.25
	f32[88 >> 2]=5.5
	f32[92 >> 2]=5.75
	f32[96 >> 2]=6.0
	f32[100 >> 2]=6.25
	f32[104 >> 2]=6.5
	f32[108 >> 2]=6.75
	f32[112 >> 2]=7.0
	f32[116 >> 2]=7.25
	f32[120 >> 2]=7.5
	f32[124 >> 2]=7.75
	f32[128 >> 2]=8.0
	f32[132 >> 2]=8.5
	f32[136 >> 2]=9.0
	f32[140 >> 2]=9.5
	f32[144 >> 2]=10.0
	f32[148 >> 2]=10.5
	f32[152 >> 2]=11.0
	f32[156 >> 2]=11.5
	f32[160 >> 2]=12.0
	f32[164 >> 2]=12.5
	f32[168 >> 2]=13.0
	f32[172 >> 2]=13.5
	f32[176 >> 2]=14.0
	f32[180 >> 2]=14.5
	f32[184 >> 2]=15.0
	f32[188 >> 2]=15.5
	f32[192 >> 2]=16.0
	f32[196 >> 2]=17.0
	f32[200 >> 2]=18.0
	f32[204 >> 2]=19.0
	f32[208 >> 2]=20.0
	f32[212 >> 2]=21.0
	f32[216 >> 2]=22.0
	f32[220 >> 2]=23.0
	f32[224 >> 2]=24.0
	f32[228 >> 2]=25.0
	f32[232 >> 2]=26.0
	f32[236 >> 2]=27.0
	f32[240 >> 2]=28.0
	f32[244 >> 2]=29.0
	f32[248 >> 2]=30.0
	f32[252 >> 2]=31.0
	f32[256 >> 2]=0.125
	f32[260 >> 2]=0.1328125
	f32[264 >> 2]=0.140625
	f32[268 >> 2]=0.1484375
	f32[272 >> 2]=0.15625
	f32[276 >> 2]=0.1640625
	f32[280 >> 2]=0.171875
	f32[284 >> 2]=0.1796875
	f32[288 >> 2]=0.1875
	f32[292 >> 2]=0.1953125
	f32[296 >> 2]=0.203125
	f32[300 >> 2]=0.2109375
	f32[304 >> 2]=0.21875
	f32[308 >> 2]=0.2265625
	f32[312 >> 2]=0.234375
	f32[316 >> 2]=0.2421875
	f32[320 >> 2]=0.25
	f32[324 >> 2]=0.265625
	f32[328 >> 2]=0.28125
	f32[332 >> 2]=0.296875
	f32[336 >> 2]=0.3125
	f32[340 >> 2]=0.328125
	f32[344 >> 2]=0.34375
	f32[348 >> 2]=0.359375
	f32[352 >> 2]=0.375
	f32[356 >> 2]=0.390625
	f32[360 >> 2]=0.40625
	f32[364 >> 2]=0.421875
	f32[368 >> 2]=0.4375
	f32[368 >> 2]=0.4375
	f32[372 >> 2]=0.453125
	f32[376 >> 2]=0.46875
	f32[380 >> 2]=0.484375
	f32[384 >> 2]=0.5
	f32[388 >> 2]=0.53125
	f32[392 >> 2]=0.5625
	f32[396 >> 2]=0.59375
	f32[400 >> 2]=0.625
	f32[404 >> 2]=0.65625
	f32[408 >> 2]=0.6875
	f32[412 >> 2]=0.71875
	f32[416 >> 2]=0.75
	f32[420 >> 2]=0.78125
	f32[424 >> 2]=0.8125
	f32[428 >> 2]=0.84375
	f32[432 >> 2]=0.875
	f32[436 >> 2]=0.90625
	f32[440 >> 2]=0.9375
	f32[444 >> 2]=0.96875
	f32[448 >> 2]=1.0
	f32[452 >> 2]=1.0625
	f32[456 >> 2]=1.125
	f32[460 >> 2]=1.1875
	f32[464 >> 2]=1.25
	f32[468 >> 2]=1.3125
	f32[472 >> 2]=1.375
	f32[476 >> 2]=1.4375
	f32[480 >> 2]=1.5
	f32[484 >> 2]=1.5625
	f32[488 >> 2]=1.625
	f32[492 >> 2]=1.6875
	f32[496 >> 2]=1.75
	f32[500 >> 2]=1.8125
	f32[504 >> 2]=1.875
	f32[508 >> 2]=1.9375
	f32[512 >> 2]=-2.0
	f32[516 >> 2]=-2.125
	f32[520 >> 2]=-2.25
	f32[524 >> 2]=-2.375
	f32[528 >> 2]=-2.5
	f32[532 >> 2]=-2.625
	f32[536 >> 2]=-2.75
	f32[540 >> 2]=-2.875
	f32[544 >> 2]=-3.0
	f32[548 >> 2]=-3.125
	f32[552 >> 2]=-3.25
	f32[556 >> 2]=-3.375
	f32[560 >> 2]=-3.5
	f32[564 >> 2]=-3.625
	f32[568 >> 2]=-3.75
	f32[572 >> 2]=-3.875
	f32[576 >> 2]=-4.0
	f32[580 >> 2]=-4.25
	f32[584 >> 2]=-4.5
	f32[588 >> 2]=-4.75
	f32[592 >> 2]=-5.0
	f32[596 >> 2]=-5.25
	f32[600 >> 2]=-5.5
	f32[604 >> 2]=-5.75
	f32[608 >> 2]=-6.0
	f32[612 >> 2]=-6.25
	f32[616 >> 2]=-6.5
	f32[620 >> 2]=-6.75
	f32[624 >> 2]=-7.0
	f32[628 >> 2]=-7.25
	f32[632 >> 2]=-7.5
	f32[636 >> 2]=-7.75
	f32[640 >> 2]=-8.0
	f32[644 >> 2]=-8.5
	f32[648 >> 2]=-9.0
	f32[652 >> 2]=-9.5
	f32[656 >> 2]=-10.0
	f32[660 >> 2]=-10.5
	f32[664 >> 2]=-11.0
	f32[668 >> 2]=-11.5
	f32[672 >> 2]=-12.0
	f32[676 >> 2]=-12.5
	f32[680 >> 2]=-13.0
	f32[684 >> 2]=-13.5
	f32[688 >> 2]=-14.0
	f32[692 >> 2]=-14.5
	f32[696 >> 2]=-15.0
	f32[700 >> 2]=-15.5
	f32[704 >> 2]=-16.0
	f32[708 >> 2]=-17.0
	f32[712 >> 2]=-18.0
	f32[716 >> 2]=-19.0
	f32[720 >> 2]=-20.0
	f32[724 >> 2]=-21.0
	f32[728 >> 2]=-22.0
	f32[732 >> 2]=-23.0
	f32[736 >> 2]=-24.0
	f32[740 >> 2]=-25.0
	f32[744 >> 2]=-26.0
	f32[748 >> 2]=-27.0
	f32[752 >> 2]=-28.0
	f32[756 >> 2]=-29.0
	f32[760 >> 2]=-30.0
	f32[764 >> 2]=-31.0
	f32[768 >> 2]=-0.125
	f32[768 >> 2]=-0.125
	f32[772 >> 2]=-0.1328125
	f32[776 >> 2]=-0.140625
	f32[780 >> 2]=-0.1484375
	f32[784 >> 2]=-0.15625
	f32[788 >> 2]=-0.1640625
	f32[792 >> 2]=-0.171875
	f32[796 >> 2]=-0.1796875
	f32[800 >> 2]=-0.1875
	f32[804 >> 2]=-0.1953125
	f32[808 >> 2]=-0.203125
	f32[812 >> 2]=-0.2109375
	f32[816 >> 2]=-0.21875
	f32[820 >> 2]=-0.2265625
	f32[824 >> 2]=-0.234375
	f32[828 >> 2]=-0.2421875
	f32[832 >> 2]=-0.25
	f32[836 >> 2]=-0.265625
	f32[840 >> 2]=-0.28125
	f32[844 >> 2]=-0.296875
	f32[848 >> 2]=-0.3125
	f32[852 >> 2]=-0.328125
	f32[856 >> 2]=-0.34375
	f32[860 >> 2]=-0.359375
	f32[864 >> 2]=-0.375
	f32[868 >> 2]=-0.390625
	f32[872 >> 2]=-0.40625
	f32[876 >> 2]=-0.421875
	f32[880 >> 2]=-0.4375
	f32[884 >> 2]=-0.453125
	f32[888 >> 2]=-0.46875
	f32[892 >> 2]=-0.484375
	f32[896 >> 2]=-0.5
	f32[900 >> 2]=-0.53125
	f32[904 >> 2]=-0.5625
	f32[908 >> 2]=-0.59375
	f32[912 >> 2]=-0.625
	f32[916 >> 2]=-0.65625
	f32[920 >> 2]=-0.6875
	f32[924 >> 2]=-0.71875
	f32[928 >> 2]=-0.75
	f32[932 >> 2]=-0.78125
	f32[936 >> 2]=-0.8125
	f32[940 >> 2]=-0.84375
	f32[944 >> 2]=-0.875
	f32[948 >> 2]=-0.90625
	f32[952 >> 2]=-0.9375
	f32[956 >> 2]=-0.96875
	f32[960 >> 2]=-1.0
	f32[964 >> 2]=-1.0625
	f32[968 >> 2]=-1.125
	f32[972 >> 2]=-1.1875
	f32[976 >> 2]=-1.25
	f32[980 >> 2]=-1.3125
	f32[984 >> 2]=-1.375
	f32[988 >> 2]=-1.4375
	f32[992 >> 2]=-1.5
	f32[996 >> 2]=-1.5625
	f32[1000 >> 2]=-1.625
	f32[1004 >> 2]=-1.6875
	f32[1008 >> 2]=-1.75
	f32[1012 >> 2]=-1.8125
	f32[1016 >> 2]=-1.875
	f32[1020 >> 2]=-1.9375

	// Some cases that should not be encoded as an immediate on the ARM.

	// All the low zero bits set.
	f32[1024 >> 2]=2.1249998
	f32[1028 >> 2]=2.2499998
	f32[1032 >> 2]=2.3749998
	f32[1036 >> 2]=2.4999998
	f32[1040 >> 2]=2.6249998
	f32[1044 >> 2]=2.7499998
	f32[1048 >> 2]=2.8749998
	f32[1052 >> 2]=2.9999998
	f32[1056 >> 2]=3.1249998
	f32[1060 >> 2]=3.2499998
	f32[1064 >> 2]=3.3749998
	f32[1068 >> 2]=3.4999998
	f32[1072 >> 2]=3.6249998
	f32[1076 >> 2]=3.7499998
	f32[1080 >> 2]=3.8749998
	f32[1084 >> 2]=3.9999998
	f32[1088 >> 2]=4.2499995
	f32[1092 >> 2]=4.4999995
	f32[1096 >> 2]=4.7499995
	f32[1100 >> 2]=4.9999995
	f32[1104 >> 2]=5.2499995
	f32[1108 >> 2]=5.4999995
	f32[1112 >> 2]=5.7499995
	f32[1116 >> 2]=5.9999995
	f32[1120 >> 2]=6.2499995
	f32[1124 >> 2]=6.4999995
	f32[1128 >> 2]=6.7499995
	f32[1132 >> 2]=6.9999995
	f32[1136 >> 2]=7.2499995
	f32[1140 >> 2]=7.4999995
	f32[1144 >> 2]=7.7499995
	f32[1148 >> 2]=7.9999995
	f32[1152 >> 2]=8.499999
	f32[1156 >> 2]=8.999999
	f32[1160 >> 2]=9.499999
	f32[1164 >> 2]=9.999999
	f32[1168 >> 2]=10.499999
	f32[1172 >> 2]=10.999999
	f32[1176 >> 2]=11.499999
	f32[1180 >> 2]=11.999999
	f32[1184 >> 2]=12.499999
	f32[1188 >> 2]=12.999999
	f32[1192 >> 2]=13.499999
	f32[1196 >> 2]=13.999999
	f32[1200 >> 2]=14.499999
	f32[1204 >> 2]=14.999999
	f32[1208 >> 2]=15.499999
	f32[1212 >> 2]=15.999999
	f32[1216 >> 2]=16.999998
	f32[1220 >> 2]=17.999998
	f32[1224 >> 2]=18.999998
	f32[1228 >> 2]=19.999998
	f32[1232 >> 2]=20.999998
	f32[1236 >> 2]=21.999998
	f32[1240 >> 2]=22.999998
	f32[1244 >> 2]=23.999998
	f32[1248 >> 2]=24.999998
	f32[1252 >> 2]=25.999998
	f32[1256 >> 2]=26.999998
	f32[1260 >> 2]=27.999998
	f32[1264 >> 2]=28.999998
	f32[1268 >> 2]=29.999998
	f32[1272 >> 2]=30.999998
	f32[1276 >> 2]=31.999998
	f32[1280 >> 2]=0.13281249
	f32[1284 >> 2]=0.14062499
	f32[1288 >> 2]=0.14843749
	f32[1292 >> 2]=0.15624999
	f32[1296 >> 2]=0.16406249
	f32[1300 >> 2]=0.17187499
	f32[1304 >> 2]=0.17968749
	f32[1308 >> 2]=0.18749999
	f32[1312 >> 2]=0.19531249
	f32[1316 >> 2]=0.20312499
	f32[1320 >> 2]=0.21093749
	f32[1324 >> 2]=0.21874999
	f32[1328 >> 2]=0.22656249
	f32[1332 >> 2]=0.23437499
	f32[1336 >> 2]=0.24218749
	f32[1340 >> 2]=0.24999999
	f32[1344 >> 2]=0.26562497
	f32[1348 >> 2]=0.28124997
	f32[1352 >> 2]=0.29687497
	f32[1356 >> 2]=0.31249997
	f32[1360 >> 2]=0.32812497
	f32[1364 >> 2]=0.34374997
	f32[1368 >> 2]=0.35937497
	f32[1372 >> 2]=0.37499997
	f32[1376 >> 2]=0.39062497
	f32[1380 >> 2]=0.40624997
	f32[1384 >> 2]=0.42187497
	f32[1388 >> 2]=0.43749997
	f32[1392 >> 2]=0.45312497
	f32[1396 >> 2]=0.46874997
	f32[1400 >> 2]=0.48437497
	f32[1404 >> 2]=0.49999997
	f32[1408 >> 2]=0.53124994
	f32[1412 >> 2]=0.56249994
	f32[1416 >> 2]=0.59374994
	f32[1420 >> 2]=0.62499994
	f32[1424 >> 2]=0.65624994
	f32[1428 >> 2]=0.68749994
	f32[1432 >> 2]=0.71874994
	f32[1436 >> 2]=0.74999994
	f32[1440 >> 2]=0.78124994
	f32[1444 >> 2]=0.81249994
	f32[1448 >> 2]=0.84374994
	f32[1452 >> 2]=0.87499994
	f32[1456 >> 2]=0.90624994
	f32[1460 >> 2]=0.93749994
	f32[1464 >> 2]=0.96874994
	f32[1468 >> 2]=0.99999994
	f32[1472 >> 2]=1.0624999
	f32[1476 >> 2]=1.1249999
	f32[1480 >> 2]=1.1874999
	f32[1484 >> 2]=1.2499999
	f32[1488 >> 2]=1.3124999
	f32[1488 >> 2]=1.3124999
	f32[1492 >> 2]=1.3749999
	f32[1496 >> 2]=1.4374999
	f32[1500 >> 2]=1.4999999
	f32[1504 >> 2]=1.5624999
	f32[1508 >> 2]=1.6249999
	f32[1512 >> 2]=1.6874999
	f32[1516 >> 2]=1.7499999
	f32[1520 >> 2]=1.8124999
	f32[1524 >> 2]=1.8749999
	f32[1528 >> 2]=1.9374999
	f32[1532 >> 2]=1.9999999
	f32[1536 >> 2]=-2.1249998
	f32[1540 >> 2]=-2.2499998
	f32[1544 >> 2]=-2.3749998
	f32[1548 >> 2]=-2.4999998
	f32[1552 >> 2]=-2.6249998
	f32[1556 >> 2]=-2.7499998
	f32[1560 >> 2]=-2.8749998
	f32[1564 >> 2]=-2.9999998
	f32[1568 >> 2]=-3.1249998
	f32[1572 >> 2]=-3.2499998
	f32[1576 >> 2]=-3.3749998
	f32[1580 >> 2]=-3.4999998
	f32[1584 >> 2]=-3.6249998
	f32[1588 >> 2]=-3.7499998
	f32[1592 >> 2]=-3.8749998
	f32[1596 >> 2]=-3.9999998
	f32[1600 >> 2]=-4.2499995
	f32[1604 >> 2]=-4.4999995
	f32[1608 >> 2]=-4.7499995
	f32[1612 >> 2]=-4.9999995
	f32[1616 >> 2]=-5.2499995
	f32[1620 >> 2]=-5.4999995
	f32[1624 >> 2]=-5.7499995
	f32[1628 >> 2]=-5.9999995
	f32[1632 >> 2]=-6.2499995
	f32[1636 >> 2]=-6.4999995
	f32[1640 >> 2]=-6.7499995
	f32[1644 >> 2]=-6.9999995
	f32[1648 >> 2]=-7.2499995
	f32[1652 >> 2]=-7.4999995
	f32[1656 >> 2]=-7.7499995
	f32[1660 >> 2]=-7.9999995
	f32[1664 >> 2]=-8.499999
	f32[1668 >> 2]=-8.999999
	f32[1672 >> 2]=-9.499999
	f32[1676 >> 2]=-9.999999
	f32[1680 >> 2]=-10.499999
	f32[1684 >> 2]=-10.999999
	f32[1688 >> 2]=-11.499999
	f32[1692 >> 2]=-11.999999
	f32[1696 >> 2]=-12.499999
	f32[1700 >> 2]=-12.999999
	f32[1704 >> 2]=-13.499999
	f32[1708 >> 2]=-13.999999
	f32[1712 >> 2]=-14.499999
	f32[1716 >> 2]=-14.999999
	f32[1720 >> 2]=-15.499999
	f32[1724 >> 2]=-15.999999
	f32[1728 >> 2]=-16.999998
	f32[1732 >> 2]=-17.999998
	f32[1736 >> 2]=-18.999998
	f32[1740 >> 2]=-19.999998
	f32[1744 >> 2]=-20.999998
	f32[1748 >> 2]=-21.999998
	f32[1752 >> 2]=-22.999998
	f32[1756 >> 2]=-23.999998
	f32[1760 >> 2]=-24.999998
	f32[1764 >> 2]=-25.999998
	f32[1768 >> 2]=-26.999998
	f32[1772 >> 2]=-27.999998
	f32[1776 >> 2]=-28.999998
	f32[1780 >> 2]=-29.999998
	f32[1784 >> 2]=-30.999998
	f32[1788 >> 2]=-31.999998
	f32[1792 >> 2]=-0.13281249
	f32[1796 >> 2]=-0.14062499
	f32[1800 >> 2]=-0.14843749
	f32[1804 >> 2]=-0.15624999
	f32[1808 >> 2]=-0.16406249
	f32[1812 >> 2]=-0.17187499
	f32[1816 >> 2]=-0.17968749
	f32[1820 >> 2]=-0.18749999
	f32[1824 >> 2]=-0.19531249
	f32[1828 >> 2]=-0.20312499
	f32[1832 >> 2]=-0.21093749
	f32[1836 >> 2]=-0.21874999
	f32[1840 >> 2]=-0.22656249
	f32[1844 >> 2]=-0.23437499
	f32[1848 >> 2]=-0.24218749
	f32[1852 >> 2]=-0.24999999
	f32[1856 >> 2]=-0.26562497
	f32[1860 >> 2]=-0.28124997
	f32[1864 >> 2]=-0.29687497
	f32[1868 >> 2]=-0.31249997
	f32[1872 >> 2]=-0.32812497
	f32[1876 >> 2]=-0.34374997
	f32[1880 >> 2]=-0.35937497
	f32[1884 >> 2]=-0.37499997
	f32[1888 >> 2]=-0.39062497
	f32[1888 >> 2]=-0.39062497
	f32[1892 >> 2]=-0.40624997
	f32[1896 >> 2]=-0.42187497
	f32[1900 >> 2]=-0.43749997
	f32[1904 >> 2]=-0.45312497
	f32[1908 >> 2]=-0.46874997
	f32[1912 >> 2]=-0.48437497
	f32[1916 >> 2]=-0.49999997
	f32[1920 >> 2]=-0.53124994
	f32[1924 >> 2]=-0.56249994
	f32[1928 >> 2]=-0.59374994
	f32[1932 >> 2]=-0.62499994
	f32[1936 >> 2]=-0.65624994
	f32[1940 >> 2]=-0.68749994
	f32[1944 >> 2]=-0.71874994
	f32[1948 >> 2]=-0.74999994
	f32[1952 >> 2]=-0.78124994
	f32[1956 >> 2]=-0.81249994
	f32[1960 >> 2]=-0.84374994
	f32[1964 >> 2]=-0.87499994
	f32[1968 >> 2]=-0.90624994
	f32[1972 >> 2]=-0.93749994
	f32[1976 >> 2]=-0.96874994
	f32[1980 >> 2]=-0.99999994
	f32[1984 >> 2]=-1.0624999
	f32[1988 >> 2]=-1.1249999
	f32[1992 >> 2]=-1.1874999
	f32[1996 >> 2]=-1.2499999
	f32[2000 >> 2]=-1.3124999
	f32[2004 >> 2]=-1.3749999
	f32[2008 >> 2]=-1.4374999
	f32[2012 >> 2]=-1.4999999
	f32[2016 >> 2]=-1.5624999
	f32[2020 >> 2]=-1.6249999
	f32[2024 >> 2]=-1.6874999
	f32[2028 >> 2]=-1.7499999
	f32[2032 >> 2]=-1.8124999
	f32[2036 >> 2]=-1.8749999
	f32[2040 >> 2]=-1.9374999
	f32[2044 >> 2]=-1.9999999

	// Just the lowest zero bit set.
	f32[2048 >> 2]=2.0000002
	f32[2052 >> 2]=2.1250002
	f32[2056 >> 2]=2.2500002
	f32[2060 >> 2]=2.3750002
	f32[2064 >> 2]=2.5000002
	f32[2068 >> 2]=2.6250002
	f32[2072 >> 2]=2.7500002
	f32[2076 >> 2]=2.8750002
	f32[2080 >> 2]=3.0000002
	f32[2084 >> 2]=3.1250002
	f32[2088 >> 2]=3.2500002
	f32[2092 >> 2]=3.3750002
	f32[2096 >> 2]=3.5000002
	f32[2100 >> 2]=3.6250002
	f32[2104 >> 2]=3.7500002
	f32[2108 >> 2]=3.8750002
	f32[2112 >> 2]=4.0000005
	f32[2116 >> 2]=4.2500005
	f32[2120 >> 2]=4.5000005
	f32[2124 >> 2]=4.7500005
	f32[2128 >> 2]=5.0000005
	f32[2132 >> 2]=5.2500005
	f32[2136 >> 2]=5.5000005
	f32[2140 >> 2]=5.7500005
	f32[2140 >> 2]=5.7500005
	f32[2144 >> 2]=6.0000005
	f32[2148 >> 2]=6.2500005
	f32[2152 >> 2]=6.5000005
	f32[2156 >> 2]=6.7500005
	f32[2160 >> 2]=7.0000005
	f32[2164 >> 2]=7.2500005
	f32[2168 >> 2]=7.5000005
	f32[2172 >> 2]=7.7500005
	f32[2176 >> 2]=8.000001
	f32[2180 >> 2]=8.500001
	f32[2184 >> 2]=9.000001
	f32[2188 >> 2]=9.500001
	f32[2192 >> 2]=10.000001
	f32[2196 >> 2]=10.500001
	f32[2200 >> 2]=11.000001
	f32[2204 >> 2]=11.500001
	f32[2208 >> 2]=12.000001
	f32[2212 >> 2]=12.500001
	f32[2216 >> 2]=13.000001
	f32[2220 >> 2]=13.500001
	f32[2224 >> 2]=14.000001
	f32[2228 >> 2]=14.500001
	f32[2232 >> 2]=15.000001
	f32[2236 >> 2]=15.500001
	f32[2240 >> 2]=16.000002
	f32[2244 >> 2]=17.000002
	f32[2248 >> 2]=18.000002
	f32[2252 >> 2]=19.000002
	f32[2256 >> 2]=20.000002
	f32[2260 >> 2]=21.000002
	f32[2264 >> 2]=22.000002
	f32[2268 >> 2]=23.000002
	f32[2272 >> 2]=24.000002
	f32[2276 >> 2]=25.000002
	f32[2280 >> 2]=26.000002
	f32[2284 >> 2]=27.000002
	f32[2288 >> 2]=28.000002
	f32[2292 >> 2]=29.000002
	f32[2296 >> 2]=30.000002
	f32[2300 >> 2]=31.000002
	f32[2304 >> 2]=0.12500001
	f32[2308 >> 2]=0.13281251
	f32[2312 >> 2]=0.14062501
	f32[2316 >> 2]=0.14843751
	f32[2320 >> 2]=0.15625001
	f32[2324 >> 2]=0.16406251
	f32[2328 >> 2]=0.17187501
	f32[2332 >> 2]=0.17968751
	f32[2336 >> 2]=0.18750001
	f32[2340 >> 2]=0.19531251
	f32[2344 >> 2]=0.20312501
	f32[2348 >> 2]=0.21093751
	f32[2352 >> 2]=0.21875001
	f32[2356 >> 2]=0.22656251
	f32[2360 >> 2]=0.23437501
	f32[2364 >> 2]=0.24218751
	f32[2368 >> 2]=0.25000003
	f32[2372 >> 2]=0.26562503
	f32[2376 >> 2]=0.28125003
	f32[2380 >> 2]=0.29687503
	f32[2384 >> 2]=0.31250003
	f32[2388 >> 2]=0.32812503
	f32[2392 >> 2]=0.34375003
	f32[2396 >> 2]=0.35937503
	f32[2400 >> 2]=0.37500003
	f32[2404 >> 2]=0.39062503
	f32[2408 >> 2]=0.40625003
	f32[2412 >> 2]=0.42187503
	f32[2416 >> 2]=0.43750003
	f32[2420 >> 2]=0.45312503
	f32[2424 >> 2]=0.46875003
	f32[2428 >> 2]=0.48437503
	f32[2432 >> 2]=0.50000006
	f32[2436 >> 2]=0.53125006
	f32[2440 >> 2]=0.56250006
	f32[2444 >> 2]=0.59375006
	f32[2448 >> 2]=0.62500006
	f32[2452 >> 2]=0.65625006
	f32[2456 >> 2]=0.68750006
	f32[2460 >> 2]=0.71875006
	f32[2464 >> 2]=0.75000006
	f32[2468 >> 2]=0.78125006
	f32[2472 >> 2]=0.81250006
	f32[2476 >> 2]=0.84375006
	f32[2480 >> 2]=0.87500006
	f32[2484 >> 2]=0.90625006
	f32[2488 >> 2]=0.93750006
	f32[2492 >> 2]=0.96875006
	f32[2496 >> 2]=1.0000001
	f32[2500 >> 2]=1.0625001
	f32[2504 >> 2]=1.1250001
	f32[2508 >> 2]=1.1875001
	f32[2512 >> 2]=1.2500001
	f32[2516 >> 2]=1.3125001
	f32[2520 >> 2]=1.3750001
	f32[2524 >> 2]=1.4375001
	f32[2528 >> 2]=1.5000001
	f32[2532 >> 2]=1.5625001
	f32[2536 >> 2]=1.6250001
	f32[2540 >> 2]=1.6875001
	f32[2540 >> 2]=1.6875001
	f32[2544 >> 2]=1.7500001
	f32[2548 >> 2]=1.8125001
	f32[2552 >> 2]=1.8750001
	f32[2556 >> 2]=1.9375001
	f32[2560 >> 2]=-2.0000002
	f32[2564 >> 2]=-2.1250002
	f32[2568 >> 2]=-2.2500002
	f32[2572 >> 2]=-2.3750002
	f32[2576 >> 2]=-2.5000002
	f32[2580 >> 2]=-2.6250002
	f32[2584 >> 2]=-2.7500002
	f32[2588 >> 2]=-2.8750002
	f32[2592 >> 2]=-3.0000002
	f32[2596 >> 2]=-3.1250002
	f32[2600 >> 2]=-3.2500002
	f32[2604 >> 2]=-3.3750002
	f32[2608 >> 2]=-3.5000002
	f32[2612 >> 2]=-3.6250002
	f32[2616 >> 2]=-3.7500002
	f32[2620 >> 2]=-3.8750002
	f32[2624 >> 2]=-4.0000005
	f32[2628 >> 2]=-4.2500005
	f32[2632 >> 2]=-4.5000005
	f32[2636 >> 2]=-4.7500005
	f32[2640 >> 2]=-5.0000005
	f32[2644 >> 2]=-5.2500005
	f32[2648 >> 2]=-5.5000005
	f32[2652 >> 2]=-5.7500005
	f32[2656 >> 2]=-6.0000005
	f32[2660 >> 2]=-6.2500005
	f32[2664 >> 2]=-6.5000005
	f32[2668 >> 2]=-6.7500005
	f32[2672 >> 2]=-7.0000005
	f32[2676 >> 2]=-7.2500005
	f32[2680 >> 2]=-7.5000005
	f32[2684 >> 2]=-7.7500005
	f32[2688 >> 2]=-8.000001
	f32[2692 >> 2]=-8.500001
	f32[2696 >> 2]=-9.000001
	f32[2700 >> 2]=-9.500001
	f32[2704 >> 2]=-10.000001
	f32[2708 >> 2]=-10.500001
	f32[2712 >> 2]=-11.000001
	f32[2716 >> 2]=-11.500001
	f32[2720 >> 2]=-12.000001
	f32[2724 >> 2]=-12.500001
	f32[2728 >> 2]=-13.000001
	f32[2732 >> 2]=-13.500001
	f32[2736 >> 2]=-14.000001
	f32[2740 >> 2]=-14.500001
	f32[2744 >> 2]=-15.000001
	f32[2748 >> 2]=-15.500001
	f32[2752 >> 2]=-16.000002
	f32[2756 >> 2]=-17.000002
	f32[2760 >> 2]=-18.000002
	f32[2764 >> 2]=-19.000002
	f32[2768 >> 2]=-20.000002
	f32[2772 >> 2]=-21.000002
	f32[2776 >> 2]=-22.000002
	f32[2780 >> 2]=-23.000002
	f32[2784 >> 2]=-24.000002
	f32[2788 >> 2]=-25.000002
	f32[2792 >> 2]=-26.000002
	f32[2796 >> 2]=-27.000002
	f32[2800 >> 2]=-28.000002
	f32[2804 >> 2]=-29.000002
	f32[2808 >> 2]=-30.000002
	f32[2812 >> 2]=-31.000002
	f32[2816 >> 2]=-0.12500001
	f32[2820 >> 2]=-0.13281251
	f32[2824 >> 2]=-0.14062501
	f32[2828 >> 2]=-0.14843751
	f32[2832 >> 2]=-0.15625001
	f32[2836 >> 2]=-0.16406251
	f32[2840 >> 2]=-0.17187501
	f32[2844 >> 2]=-0.17968751
	f32[2848 >> 2]=-0.18750001
	f32[2852 >> 2]=-0.19531251
	f32[2856 >> 2]=-0.20312501
	f32[2860 >> 2]=-0.21093751
	f32[2864 >> 2]=-0.21875001
	f32[2868 >> 2]=-0.22656251
	f32[2872 >> 2]=-0.23437501
	f32[2876 >> 2]=-0.24218751
	f32[2880 >> 2]=-0.25000003
	f32[2884 >> 2]=-0.26562503
	f32[2888 >> 2]=-0.28125003
	f32[2892 >> 2]=-0.29687503
	f32[2896 >> 2]=-0.31250003
	f32[2900 >> 2]=-0.32812503
	f32[2904 >> 2]=-0.34375003
	f32[2908 >> 2]=-0.35937503
	f32[2912 >> 2]=-0.37500003
	f32[2916 >> 2]=-0.39062503
	f32[2920 >> 2]=-0.40625003
	f32[2924 >> 2]=-0.42187503
	f32[2928 >> 2]=-0.43750003
	f32[2932 >> 2]=-0.45312503
	f32[2936 >> 2]=-0.46875003
	f32[2940 >> 2]=-0.48437503
	f32[2940 >> 2]=-0.48437503
	f32[2944 >> 2]=-0.50000006
	f32[2948 >> 2]=-0.53125006
	f32[2952 >> 2]=-0.56250006
	f32[2956 >> 2]=-0.59375006
	f32[2960 >> 2]=-0.62500006
	f32[2964 >> 2]=-0.65625006
	f32[2968 >> 2]=-0.68750006
	f32[2972 >> 2]=-0.71875006
	f32[2976 >> 2]=-0.75000006
	f32[2980 >> 2]=-0.78125006
	f32[2984 >> 2]=-0.81250006
	f32[2988 >> 2]=-0.84375006
	f32[2992 >> 2]=-0.87500006
	f32[2996 >> 2]=-0.90625006
	f32[3000 >> 2]=-0.93750006
	f32[3004 >> 2]=-0.96875006
	f32[3008 >> 2]=-1.0000001
	f32[3012 >> 2]=-1.0625001
	f32[3016 >> 2]=-1.1250001
	f32[3020 >> 2]=-1.1875001
	f32[3024 >> 2]=-1.2500001
	f32[3028 >> 2]=-1.3125001
	f32[3032 >> 2]=-1.3750001
	f32[3036 >> 2]=-1.4375001
	f32[3040 >> 2]=-1.5000001
	f32[3044 >> 2]=-1.5625001
	f32[3048 >> 2]=-1.6250001
	f32[3052 >> 2]=-1.6875001
	f32[3056 >> 2]=-1.7500001
	f32[3060 >> 2]=-1.8125001
	f32[3064 >> 2]=-1.8750001
	f32[3068 >> 2]=-1.9375001

	// Just the highest zero bit set.
	f32[3073 >> 2]=2.0625
	f32[3073 >> 2]=2.0625
	f32[3077 >> 2]=2.1875
	f32[3081 >> 2]=2.3125
	f32[3085 >> 2]=2.4375
	f32[3089 >> 2]=2.5625
	f32[3093 >> 2]=2.6875
	f32[3097 >> 2]=2.8125
	f32[3101 >> 2]=2.9375
	f32[3105 >> 2]=3.0625
	f32[3109 >> 2]=3.1875
	f32[3113 >> 2]=3.3125
	f32[3117 >> 2]=3.4375
	f32[3121 >> 2]=3.5625
	f32[3125 >> 2]=3.6875
	f32[3129 >> 2]=3.8125
	f32[3133 >> 2]=3.9375
	f32[3137 >> 2]=4.125
	f32[3141 >> 2]=4.375
	f32[3145 >> 2]=4.625
	f32[3149 >> 2]=4.875
	f32[3153 >> 2]=5.125
	f32[3157 >> 2]=5.375
	f32[3161 >> 2]=5.625
	f32[3165 >> 2]=5.875
	f32[3169 >> 2]=6.125
	f32[3173 >> 2]=6.375
	f32[3177 >> 2]=6.625
	f32[3181 >> 2]=6.875
	f32[3185 >> 2]=7.125
	f32[3189 >> 2]=7.375
	f32[3193 >> 2]=7.625
	f32[3197 >> 2]=7.875
	f32[3201 >> 2]=8.25
	f32[3205 >> 2]=8.75
	f32[3209 >> 2]=9.25
	f32[3213 >> 2]=9.75
	f32[3217 >> 2]=10.25
	f32[3221 >> 2]=10.75
	f32[3225 >> 2]=11.25
	f32[3229 >> 2]=11.75
	f32[3233 >> 2]=12.25
	f32[3237 >> 2]=12.75
	f32[3241 >> 2]=13.25
	f32[3245 >> 2]=13.75
	f32[3249 >> 2]=14.25
	f32[3253 >> 2]=14.75
	f32[3257 >> 2]=15.25
	f32[3261 >> 2]=15.75
	f32[3265 >> 2]=16.5
	f32[3269 >> 2]=17.5
	f32[3273 >> 2]=18.5
	f32[3277 >> 2]=19.5
	f32[3281 >> 2]=20.5
	f32[3285 >> 2]=21.5
	f32[3289 >> 2]=22.5
	f32[3293 >> 2]=23.5
	f32[3297 >> 2]=24.5
	f32[3301 >> 2]=25.5
	f32[3305 >> 2]=26.5
	f32[3309 >> 2]=27.5
	f32[3313 >> 2]=28.5
	f32[3317 >> 2]=29.5
	f32[3321 >> 2]=30.5
	f32[3325 >> 2]=31.5
	f32[3329 >> 2]=0.12890625
	f32[3333 >> 2]=0.13671875
	f32[3337 >> 2]=0.14453125
	f32[3341 >> 2]=0.15234375
	f32[3345 >> 2]=0.16015625
	f32[3349 >> 2]=0.16796875
	f32[3353 >> 2]=0.17578125
	f32[3357 >> 2]=0.18359375
	f32[3361 >> 2]=0.19140625
	f32[3365 >> 2]=0.19921875
	f32[3369 >> 2]=0.20703125
	f32[3373 >> 2]=0.21484375
	f32[3377 >> 2]=0.22265625
	f32[3381 >> 2]=0.23046875
	f32[3385 >> 2]=0.23828125
	f32[3389 >> 2]=0.24609375
	f32[3393 >> 2]=0.2578125
	f32[3397 >> 2]=0.2734375
	f32[3401 >> 2]=0.2890625
	f32[3405 >> 2]=0.3046875
	f32[3409 >> 2]=0.3203125
	f32[3413 >> 2]=0.3359375
	f32[3417 >> 2]=0.3515625
	f32[3421 >> 2]=0.3671875
	f32[3425 >> 2]=0.3828125
	f32[3429 >> 2]=0.3984375
	f32[3433 >> 2]=0.4140625
	f32[3437 >> 2]=0.4296875
	f32[3441 >> 2]=0.4453125
	f32[3445 >> 2]=0.4609375
	f32[3449 >> 2]=0.4765625
	f32[3453 >> 2]=0.4921875
	f32[3457 >> 2]=0.515625
	f32[3461 >> 2]=0.546875
	f32[3465 >> 2]=0.578125
	f32[3469 >> 2]=0.609375
	f32[3473 >> 2]=0.640625
	f32[3473 >> 2]=0.640625
	f32[3477 >> 2]=0.671875
	f32[3481 >> 2]=0.703125
	f32[3485 >> 2]=0.734375
	f32[3489 >> 2]=0.765625
	f32[3493 >> 2]=0.796875
	f32[3497 >> 2]=0.828125
	f32[3501 >> 2]=0.859375
	f32[3505 >> 2]=0.890625
	f32[3509 >> 2]=0.921875
	f32[3513 >> 2]=0.953125
	f32[3517 >> 2]=0.984375
	f32[3521 >> 2]=1.03125
	f32[3525 >> 2]=1.09375
	f32[3529 >> 2]=1.15625
	f32[3533 >> 2]=1.21875
	f32[3537 >> 2]=1.28125
	f32[3541 >> 2]=1.34375
	f32[3545 >> 2]=1.40625
	f32[3549 >> 2]=1.46875
	f32[3553 >> 2]=1.53125
	f32[3557 >> 2]=1.59375
	f32[3561 >> 2]=1.65625
	f32[3565 >> 2]=1.71875
	f32[3569 >> 2]=1.78125
	f32[3573 >> 2]=1.84375
	f32[3577 >> 2]=1.90625
	f32[3581 >> 2]=1.96875
	f32[3585 >> 2]=-2.0625
	f32[3589 >> 2]=-2.1875
	f32[3593 >> 2]=-2.3125
	f32[3597 >> 2]=-2.4375
	f32[3601 >> 2]=-2.5625
	f32[3605 >> 2]=-2.6875
	f32[3609 >> 2]=-2.8125
	f32[3613 >> 2]=-2.9375
	f32[3617 >> 2]=-3.0625
	f32[3621 >> 2]=-3.1875
	f32[3625 >> 2]=-3.3125
	f32[3629 >> 2]=-3.4375
	f32[3633 >> 2]=-3.5625
	f32[3637 >> 2]=-3.6875
	f32[3641 >> 2]=-3.8125
	f32[3645 >> 2]=-3.9375
	f32[3649 >> 2]=-4.125
	f32[3653 >> 2]=-4.375
	f32[3657 >> 2]=-4.625
	f32[3661 >> 2]=-4.875
	f32[3665 >> 2]=-5.125
	f32[3669 >> 2]=-5.375
	f32[3673 >> 2]=-5.625
	f32[3677 >> 2]=-5.875
	f32[3681 >> 2]=-6.125
	f32[3685 >> 2]=-6.375
	f32[3689 >> 2]=-6.625
	f32[3693 >> 2]=-6.875
	f32[3697 >> 2]=-7.125
	f32[3701 >> 2]=-7.375
	f32[3705 >> 2]=-7.625
	f32[3709 >> 2]=-7.875
	f32[3713 >> 2]=-8.25
	f32[3717 >> 2]=-8.75
	f32[3721 >> 2]=-9.25
	f32[3725 >> 2]=-9.75
	f32[3729 >> 2]=-10.25
	f32[3733 >> 2]=-10.75
	f32[3737 >> 2]=-11.25
	f32[3741 >> 2]=-11.75
	f32[3745 >> 2]=-12.25
	f32[3749 >> 2]=-12.75
	f32[3753 >> 2]=-13.25
	f32[3757 >> 2]=-13.75
	f32[3761 >> 2]=-14.25
	f32[3765 >> 2]=-14.75
	f32[3769 >> 2]=-15.25
	f32[3773 >> 2]=-15.75
	f32[3777 >> 2]=-16.5
	f32[3781 >> 2]=-17.5
	f32[3785 >> 2]=-18.5
	f32[3789 >> 2]=-19.5
	f32[3793 >> 2]=-20.5
	f32[3797 >> 2]=-21.5
	f32[3801 >> 2]=-22.5
	f32[3805 >> 2]=-23.5
	f32[3809 >> 2]=-24.5
	f32[3813 >> 2]=-25.5
	f32[3817 >> 2]=-26.5
	f32[3821 >> 2]=-27.5
	f32[3825 >> 2]=-28.5
	f32[3829 >> 2]=-29.5
	f32[3833 >> 2]=-30.5
	f32[3837 >> 2]=-31.5
	f32[3841 >> 2]=-0.12890625
	f32[3845 >> 2]=-0.13671875
	f32[3849 >> 2]=-0.14453125
	f32[3853 >> 2]=-0.15234375
	f32[3857 >> 2]=-0.16015625
	f32[3861 >> 2]=-0.16796875
	f32[3865 >> 2]=-0.17578125
	f32[3869 >> 2]=-0.18359375
	f32[3873 >> 2]=-0.19140625
	f32[3873 >> 2]=-0.19140625
	f32[3877 >> 2]=-0.19921875
	f32[3881 >> 2]=-0.20703125
	f32[3885 >> 2]=-0.21484375
	f32[3889 >> 2]=-0.22265625
	f32[3893 >> 2]=-0.23046875
	f32[3897 >> 2]=-0.23828125
	f32[3901 >> 2]=-0.24609375
	f32[3905 >> 2]=-0.2578125
	f32[3909 >> 2]=-0.2734375
	f32[3913 >> 2]=-0.2890625
	f32[3917 >> 2]=-0.3046875
	f32[3921 >> 2]=-0.3203125
	f32[3925 >> 2]=-0.3359375
	f32[3929 >> 2]=-0.3515625
	f32[3933 >> 2]=-0.3671875
	f32[3937 >> 2]=-0.3828125
	f32[3941 >> 2]=-0.3984375
	f32[3945 >> 2]=-0.4140625
	f32[3949 >> 2]=-0.4296875
	f32[3953 >> 2]=-0.4453125
	f32[3957 >> 2]=-0.4609375
	f32[3961 >> 2]=-0.4765625
	f32[3965 >> 2]=-0.4921875
	f32[3969 >> 2]=-0.515625
	f32[3973 >> 2]=-0.546875
	f32[3977 >> 2]=-0.578125
	f32[3981 >> 2]=-0.609375
	f32[3985 >> 2]=-0.640625
	f32[3989 >> 2]=-0.671875
	f32[3993 >> 2]=-0.703125
	f32[3997 >> 2]=-0.734375
	f32[4001 >> 2]=-0.765625
	f32[4005 >> 2]=-0.796875
	f32[4009 >> 2]=-0.828125
	f32[4013 >> 2]=-0.859375
	f32[4017 >> 2]=-0.890625
	f32[4021 >> 2]=-0.921875
	f32[4025 >> 2]=-0.953125
	f32[4029 >> 2]=-0.984375
	f32[4033 >> 2]=-1.03125
	f32[4037 >> 2]=-1.09375
	f32[4041 >> 2]=-1.15625
	f32[4045 >> 2]=-1.21875
	f32[4049 >> 2]=-1.28125
	f32[4053 >> 2]=-1.34375
	f32[4057 >> 2]=-1.40625
	f32[4061 >> 2]=-1.46875
	f32[4065 >> 2]=-1.53125
	f32[4069 >> 2]=-1.59375
	f32[4073 >> 2]=-1.65625
	f32[4077 >> 2]=-1.71875
	f32[4081 >> 2]=-1.78125
	f32[4085 >> 2]=-1.84375
	f32[4089 >> 2]=-1.90625
	f32[4093 >> 2]=-1.96875
    };

    return {
	fn1: fn1
    };
};

var asm = testmod(this, {}, buffer);

asm.fn1()

var f32=new Float32Array(buffer);
assertEq(f32[0 >> 2], 2.0)
assertEq(f32[4 >> 2], 2.125)
assertEq(f32[8 >> 2], 2.25)
assertEq(f32[12 >> 2], 2.375)
assertEq(f32[16 >> 2], 2.5)
assertEq(f32[20 >> 2], 2.625)
assertEq(f32[24 >> 2], 2.75)
assertEq(f32[28 >> 2], 2.875)
assertEq(f32[32 >> 2], 3.0)
assertEq(f32[36 >> 2], 3.125)
assertEq(f32[40 >> 2], 3.25)
assertEq(f32[44 >> 2], 3.375)
assertEq(f32[48 >> 2], 3.5)
assertEq(f32[52 >> 2], 3.625)
assertEq(f32[56 >> 2], 3.75)
assertEq(f32[60 >> 2], 3.875)
assertEq(f32[64 >> 2], 4.0)
assertEq(f32[68 >> 2], 4.25)
assertEq(f32[72 >> 2], 4.5)
assertEq(f32[76 >> 2], 4.75)
assertEq(f32[80 >> 2], 5.0)
assertEq(f32[84 >> 2], 5.25)
assertEq(f32[88 >> 2], 5.5)
assertEq(f32[92 >> 2], 5.75)
assertEq(f32[96 >> 2], 6.0)
assertEq(f32[100 >> 2], 6.25)
assertEq(f32[104 >> 2], 6.5)
assertEq(f32[108 >> 2], 6.75)
assertEq(f32[112 >> 2], 7.0)
assertEq(f32[116 >> 2], 7.25)
assertEq(f32[120 >> 2], 7.5)
assertEq(f32[124 >> 2], 7.75)
assertEq(f32[128 >> 2], 8.0)
assertEq(f32[132 >> 2], 8.5)
assertEq(f32[136 >> 2], 9.0)
assertEq(f32[140 >> 2], 9.5)
assertEq(f32[144 >> 2], 10.0)
assertEq(f32[148 >> 2], 10.5)
assertEq(f32[152 >> 2], 11.0)
assertEq(f32[156 >> 2], 11.5)
assertEq(f32[160 >> 2], 12.0)
assertEq(f32[164 >> 2], 12.5)
assertEq(f32[168 >> 2], 13.0)
assertEq(f32[172 >> 2], 13.5)
assertEq(f32[176 >> 2], 14.0)
assertEq(f32[180 >> 2], 14.5)
assertEq(f32[184 >> 2], 15.0)
assertEq(f32[188 >> 2], 15.5)
assertEq(f32[192 >> 2], 16.0)
assertEq(f32[196 >> 2], 17.0)
assertEq(f32[200 >> 2], 18.0)
assertEq(f32[204 >> 2], 19.0)
assertEq(f32[208 >> 2], 20.0)
assertEq(f32[212 >> 2], 21.0)
assertEq(f32[216 >> 2], 22.0)
assertEq(f32[220 >> 2], 23.0)
assertEq(f32[224 >> 2], 24.0)
assertEq(f32[228 >> 2], 25.0)
assertEq(f32[232 >> 2], 26.0)
assertEq(f32[236 >> 2], 27.0)
assertEq(f32[240 >> 2], 28.0)
assertEq(f32[244 >> 2], 29.0)
assertEq(f32[248 >> 2], 30.0)
assertEq(f32[252 >> 2], 31.0)
assertEq(f32[256 >> 2], 0.125)
assertEq(f32[260 >> 2], 0.1328125)
assertEq(f32[264 >> 2], 0.140625)
assertEq(f32[268 >> 2], 0.1484375)
assertEq(f32[272 >> 2], 0.15625)
assertEq(f32[276 >> 2], 0.1640625)
assertEq(f32[280 >> 2], 0.171875)
assertEq(f32[284 >> 2], 0.1796875)
assertEq(f32[288 >> 2], 0.1875)
assertEq(f32[292 >> 2], 0.1953125)
assertEq(f32[296 >> 2], 0.203125)
assertEq(f32[300 >> 2], 0.2109375)
assertEq(f32[304 >> 2], 0.21875)
assertEq(f32[308 >> 2], 0.2265625)
assertEq(f32[312 >> 2], 0.234375)
assertEq(f32[316 >> 2], 0.2421875)
assertEq(f32[320 >> 2], 0.25)
assertEq(f32[324 >> 2], 0.265625)
assertEq(f32[328 >> 2], 0.28125)
assertEq(f32[332 >> 2], 0.296875)
assertEq(f32[336 >> 2], 0.3125)
assertEq(f32[340 >> 2], 0.328125)
assertEq(f32[344 >> 2], 0.34375)
assertEq(f32[348 >> 2], 0.359375)
assertEq(f32[348 >> 2], 0.359375)
assertEq(f32[352 >> 2], 0.375)
assertEq(f32[356 >> 2], 0.390625)
assertEq(f32[360 >> 2], 0.40625)
assertEq(f32[364 >> 2], 0.421875)
assertEq(f32[368 >> 2], 0.4375)
assertEq(f32[372 >> 2], 0.453125)
assertEq(f32[376 >> 2], 0.46875)
assertEq(f32[380 >> 2], 0.484375)
assertEq(f32[384 >> 2], 0.5)
assertEq(f32[388 >> 2], 0.53125)
assertEq(f32[392 >> 2], 0.5625)
assertEq(f32[396 >> 2], 0.59375)
assertEq(f32[400 >> 2], 0.625)
assertEq(f32[404 >> 2], 0.65625)
assertEq(f32[408 >> 2], 0.6875)
assertEq(f32[412 >> 2], 0.71875)
assertEq(f32[416 >> 2], 0.75)
assertEq(f32[420 >> 2], 0.78125)
assertEq(f32[424 >> 2], 0.8125)
assertEq(f32[428 >> 2], 0.84375)
assertEq(f32[432 >> 2], 0.875)
assertEq(f32[436 >> 2], 0.90625)
assertEq(f32[440 >> 2], 0.9375)
assertEq(f32[444 >> 2], 0.96875)
assertEq(f32[448 >> 2], 1.0)
assertEq(f32[452 >> 2], 1.0625)
assertEq(f32[456 >> 2], 1.125)
assertEq(f32[460 >> 2], 1.1875)
assertEq(f32[464 >> 2], 1.25)
assertEq(f32[468 >> 2], 1.3125)
assertEq(f32[472 >> 2], 1.375)
assertEq(f32[476 >> 2], 1.4375)
assertEq(f32[480 >> 2], 1.5)
assertEq(f32[484 >> 2], 1.5625)
assertEq(f32[488 >> 2], 1.625)
assertEq(f32[492 >> 2], 1.6875)
assertEq(f32[496 >> 2], 1.75)
assertEq(f32[500 >> 2], 1.8125)
assertEq(f32[504 >> 2], 1.875)
assertEq(f32[508 >> 2], 1.9375)
assertEq(f32[512 >> 2], -2.0)
assertEq(f32[516 >> 2], -2.125)
assertEq(f32[520 >> 2], -2.25)
assertEq(f32[524 >> 2], -2.375)
assertEq(f32[528 >> 2], -2.5)
assertEq(f32[532 >> 2], -2.625)
assertEq(f32[536 >> 2], -2.75)
assertEq(f32[540 >> 2], -2.875)
assertEq(f32[544 >> 2], -3.0)
assertEq(f32[548 >> 2], -3.125)
assertEq(f32[552 >> 2], -3.25)
assertEq(f32[556 >> 2], -3.375)
assertEq(f32[560 >> 2], -3.5)
assertEq(f32[564 >> 2], -3.625)
assertEq(f32[568 >> 2], -3.75)
assertEq(f32[572 >> 2], -3.875)
assertEq(f32[576 >> 2], -4.0)
assertEq(f32[580 >> 2], -4.25)
assertEq(f32[584 >> 2], -4.5)
assertEq(f32[588 >> 2], -4.75)
assertEq(f32[592 >> 2], -5.0)
assertEq(f32[596 >> 2], -5.25)
assertEq(f32[600 >> 2], -5.5)
assertEq(f32[604 >> 2], -5.75)
assertEq(f32[608 >> 2], -6.0)
assertEq(f32[612 >> 2], -6.25)
assertEq(f32[616 >> 2], -6.5)
assertEq(f32[620 >> 2], -6.75)
assertEq(f32[624 >> 2], -7.0)
assertEq(f32[628 >> 2], -7.25)
assertEq(f32[632 >> 2], -7.5)
assertEq(f32[636 >> 2], -7.75)
assertEq(f32[640 >> 2], -8.0)
assertEq(f32[644 >> 2], -8.5)
assertEq(f32[648 >> 2], -9.0)
assertEq(f32[652 >> 2], -9.5)
assertEq(f32[656 >> 2], -10.0)
assertEq(f32[660 >> 2], -10.5)
assertEq(f32[664 >> 2], -11.0)
assertEq(f32[668 >> 2], -11.5)
assertEq(f32[672 >> 2], -12.0)
assertEq(f32[676 >> 2], -12.5)
assertEq(f32[680 >> 2], -13.0)
assertEq(f32[684 >> 2], -13.5)
assertEq(f32[688 >> 2], -14.0)
assertEq(f32[692 >> 2], -14.5)
assertEq(f32[696 >> 2], -15.0)
assertEq(f32[700 >> 2], -15.5)
assertEq(f32[704 >> 2], -16.0)
assertEq(f32[708 >> 2], -17.0)
assertEq(f32[712 >> 2], -18.0)
assertEq(f32[716 >> 2], -19.0)
assertEq(f32[720 >> 2], -20.0)
assertEq(f32[724 >> 2], -21.0)
assertEq(f32[728 >> 2], -22.0)
assertEq(f32[732 >> 2], -23.0)
assertEq(f32[736 >> 2], -24.0)
assertEq(f32[740 >> 2], -25.0)
assertEq(f32[744 >> 2], -26.0)
assertEq(f32[748 >> 2], -27.0)
assertEq(f32[748 >> 2], -27.0)
assertEq(f32[752 >> 2], -28.0)
assertEq(f32[756 >> 2], -29.0)
assertEq(f32[760 >> 2], -30.0)
assertEq(f32[764 >> 2], -31.0)
assertEq(f32[768 >> 2], -0.125)
assertEq(f32[772 >> 2], -0.1328125)
assertEq(f32[776 >> 2], -0.140625)
assertEq(f32[780 >> 2], -0.1484375)
assertEq(f32[784 >> 2], -0.15625)
assertEq(f32[788 >> 2], -0.1640625)
assertEq(f32[792 >> 2], -0.171875)
assertEq(f32[796 >> 2], -0.1796875)
assertEq(f32[800 >> 2], -0.1875)
assertEq(f32[804 >> 2], -0.1953125)
assertEq(f32[808 >> 2], -0.203125)
assertEq(f32[812 >> 2], -0.2109375)
assertEq(f32[816 >> 2], -0.21875)
assertEq(f32[820 >> 2], -0.2265625)
assertEq(f32[824 >> 2], -0.234375)
assertEq(f32[828 >> 2], -0.2421875)
assertEq(f32[832 >> 2], -0.25)
assertEq(f32[836 >> 2], -0.265625)
assertEq(f32[840 >> 2], -0.28125)
assertEq(f32[844 >> 2], -0.296875)
assertEq(f32[848 >> 2], -0.3125)
assertEq(f32[852 >> 2], -0.328125)
assertEq(f32[856 >> 2], -0.34375)
assertEq(f32[860 >> 2], -0.359375)
assertEq(f32[864 >> 2], -0.375)
assertEq(f32[868 >> 2], -0.390625)
assertEq(f32[872 >> 2], -0.40625)
assertEq(f32[876 >> 2], -0.421875)
assertEq(f32[880 >> 2], -0.4375)
assertEq(f32[884 >> 2], -0.453125)
assertEq(f32[888 >> 2], -0.46875)
assertEq(f32[892 >> 2], -0.484375)
assertEq(f32[896 >> 2], -0.5)
assertEq(f32[900 >> 2], -0.53125)
assertEq(f32[904 >> 2], -0.5625)
assertEq(f32[908 >> 2], -0.59375)
assertEq(f32[912 >> 2], -0.625)
assertEq(f32[916 >> 2], -0.65625)
assertEq(f32[920 >> 2], -0.6875)
assertEq(f32[924 >> 2], -0.71875)
assertEq(f32[928 >> 2], -0.75)
assertEq(f32[932 >> 2], -0.78125)
assertEq(f32[936 >> 2], -0.8125)
assertEq(f32[940 >> 2], -0.84375)
assertEq(f32[944 >> 2], -0.875)
assertEq(f32[948 >> 2], -0.90625)
assertEq(f32[952 >> 2], -0.9375)
assertEq(f32[956 >> 2], -0.96875)
assertEq(f32[960 >> 2], -1.0)
assertEq(f32[964 >> 2], -1.0625)
assertEq(f32[968 >> 2], -1.125)
assertEq(f32[972 >> 2], -1.1875)
assertEq(f32[976 >> 2], -1.25)
assertEq(f32[980 >> 2], -1.3125)
assertEq(f32[984 >> 2], -1.375)
assertEq(f32[988 >> 2], -1.4375)
assertEq(f32[992 >> 2], -1.5)
assertEq(f32[996 >> 2], -1.5625)
assertEq(f32[1000 >> 2], -1.625)
assertEq(f32[1004 >> 2], -1.6875)
assertEq(f32[1008 >> 2], -1.75)
assertEq(f32[1012 >> 2], -1.8125)
assertEq(f32[1016 >> 2], -1.875)
assertEq(f32[1020 >> 2], -1.9375)

assertEq(f32[1024 >> 2], 2.124999761581421)
assertEq(f32[1028 >> 2], 2.249999761581421)
assertEq(f32[1032 >> 2], 2.374999761581421)
assertEq(f32[1036 >> 2], 2.499999761581421)
assertEq(f32[1040 >> 2], 2.624999761581421)
assertEq(f32[1044 >> 2], 2.749999761581421)
assertEq(f32[1048 >> 2], 2.874999761581421)
assertEq(f32[1052 >> 2], 2.999999761581421)
assertEq(f32[1056 >> 2], 3.124999761581421)
assertEq(f32[1060 >> 2], 3.249999761581421)
assertEq(f32[1064 >> 2], 3.374999761581421)
assertEq(f32[1068 >> 2], 3.499999761581421)
assertEq(f32[1072 >> 2], 3.624999761581421)
assertEq(f32[1076 >> 2], 3.749999761581421)
assertEq(f32[1080 >> 2], 3.874999761581421)
assertEq(f32[1084 >> 2], 3.999999761581421)
assertEq(f32[1088 >> 2], 4.249999523162842)
assertEq(f32[1092 >> 2], 4.499999523162842)
assertEq(f32[1096 >> 2], 4.749999523162842)
assertEq(f32[1100 >> 2], 4.999999523162842)
assertEq(f32[1104 >> 2], 5.249999523162842)
assertEq(f32[1108 >> 2], 5.499999523162842)
assertEq(f32[1112 >> 2], 5.749999523162842)
assertEq(f32[1116 >> 2], 5.999999523162842)
assertEq(f32[1120 >> 2], 6.249999523162842)
assertEq(f32[1124 >> 2], 6.499999523162842)
assertEq(f32[1128 >> 2], 6.749999523162842)
assertEq(f32[1132 >> 2], 6.999999523162842)
assertEq(f32[1136 >> 2], 7.249999523162842)
assertEq(f32[1140 >> 2], 7.499999523162842)
assertEq(f32[1144 >> 2], 7.749999523162842)
assertEq(f32[1148 >> 2], 7.999999523162842)
assertEq(f32[1152 >> 2], 8.499999046325684)
assertEq(f32[1156 >> 2], 8.999999046325684)
assertEq(f32[1160 >> 2], 9.499999046325684)
assertEq(f32[1164 >> 2], 9.999999046325684)
assertEq(f32[1168 >> 2], 10.499999046325684)
assertEq(f32[1172 >> 2], 10.999999046325684)
assertEq(f32[1176 >> 2], 11.499999046325684)
assertEq(f32[1180 >> 2], 11.999999046325684)
assertEq(f32[1184 >> 2], 12.499999046325684)
assertEq(f32[1184 >> 2], 12.499999046325684)
assertEq(f32[1188 >> 2], 12.999999046325684)
assertEq(f32[1192 >> 2], 13.499999046325684)
assertEq(f32[1196 >> 2], 13.999999046325684)
assertEq(f32[1200 >> 2], 14.499999046325684)
assertEq(f32[1204 >> 2], 14.999999046325684)
assertEq(f32[1208 >> 2], 15.499999046325684)
assertEq(f32[1212 >> 2], 15.999999046325684)
assertEq(f32[1216 >> 2], 16.999998092651367)
assertEq(f32[1220 >> 2], 17.999998092651367)
assertEq(f32[1224 >> 2], 18.999998092651367)
assertEq(f32[1228 >> 2], 19.999998092651367)
assertEq(f32[1232 >> 2], 20.999998092651367)
assertEq(f32[1236 >> 2], 21.999998092651367)
assertEq(f32[1240 >> 2], 22.999998092651367)
assertEq(f32[1244 >> 2], 23.999998092651367)
assertEq(f32[1248 >> 2], 24.999998092651367)
assertEq(f32[1252 >> 2], 25.999998092651367)
assertEq(f32[1256 >> 2], 26.999998092651367)
assertEq(f32[1260 >> 2], 27.999998092651367)
assertEq(f32[1264 >> 2], 28.999998092651367)
assertEq(f32[1268 >> 2], 29.999998092651367)
assertEq(f32[1272 >> 2], 30.999998092651367)
assertEq(f32[1276 >> 2], 31.999998092651367)
assertEq(f32[1280 >> 2], 0.1328124850988388)
assertEq(f32[1284 >> 2], 0.1406249850988388)
assertEq(f32[1288 >> 2], 0.1484374850988388)
assertEq(f32[1292 >> 2], 0.1562499850988388)
assertEq(f32[1296 >> 2], 0.1640624850988388)
assertEq(f32[1300 >> 2], 0.1718749850988388)
assertEq(f32[1304 >> 2], 0.1796874850988388)
assertEq(f32[1308 >> 2], 0.1874999850988388)
assertEq(f32[1312 >> 2], 0.1953124850988388)
assertEq(f32[1316 >> 2], 0.2031249850988388)
assertEq(f32[1320 >> 2], 0.2109374850988388)
assertEq(f32[1324 >> 2], 0.2187499850988388)
assertEq(f32[1328 >> 2], 0.2265624850988388)
assertEq(f32[1332 >> 2], 0.2343749850988388)
assertEq(f32[1336 >> 2], 0.2421874850988388)
assertEq(f32[1340 >> 2], 0.2499999850988388)
assertEq(f32[1344 >> 2], 0.2656249701976776)
assertEq(f32[1348 >> 2], 0.2812499701976776)
assertEq(f32[1352 >> 2], 0.2968749701976776)
assertEq(f32[1356 >> 2], 0.3124999701976776)
assertEq(f32[1360 >> 2], 0.3281249701976776)
assertEq(f32[1364 >> 2], 0.3437499701976776)
assertEq(f32[1368 >> 2], 0.3593749701976776)
assertEq(f32[1372 >> 2], 0.3749999701976776)
assertEq(f32[1376 >> 2], 0.3906249701976776)
assertEq(f32[1380 >> 2], 0.4062499701976776)
assertEq(f32[1384 >> 2], 0.4218749701976776)
assertEq(f32[1388 >> 2], 0.4374999701976776)
assertEq(f32[1392 >> 2], 0.4531249701976776)
assertEq(f32[1396 >> 2], 0.4687499701976776)
assertEq(f32[1400 >> 2], 0.4843749701976776)
assertEq(f32[1404 >> 2], 0.4999999701976776)
assertEq(f32[1408 >> 2], 0.5312499403953552)
assertEq(f32[1412 >> 2], 0.5624999403953552)
assertEq(f32[1416 >> 2], 0.5937499403953552)
assertEq(f32[1420 >> 2], 0.6249999403953552)
assertEq(f32[1424 >> 2], 0.6562499403953552)
assertEq(f32[1428 >> 2], 0.6874999403953552)
assertEq(f32[1432 >> 2], 0.7187499403953552)
assertEq(f32[1436 >> 2], 0.7499999403953552)
assertEq(f32[1440 >> 2], 0.7812499403953552)
assertEq(f32[1444 >> 2], 0.8124999403953552)
assertEq(f32[1448 >> 2], 0.8437499403953552)
assertEq(f32[1452 >> 2], 0.8749999403953552)
assertEq(f32[1456 >> 2], 0.9062499403953552)
assertEq(f32[1460 >> 2], 0.9374999403953552)
assertEq(f32[1464 >> 2], 0.9687499403953552)
assertEq(f32[1468 >> 2], 0.9999999403953552)
assertEq(f32[1472 >> 2], 1.0624998807907104)
assertEq(f32[1476 >> 2], 1.1249998807907104)
assertEq(f32[1480 >> 2], 1.1874998807907104)
assertEq(f32[1484 >> 2], 1.2499998807907104)
assertEq(f32[1488 >> 2], 1.3124998807907104)
assertEq(f32[1492 >> 2], 1.3749998807907104)
assertEq(f32[1496 >> 2], 1.4374998807907104)
assertEq(f32[1500 >> 2], 1.4999998807907104)
assertEq(f32[1504 >> 2], 1.5624998807907104)
assertEq(f32[1508 >> 2], 1.6249998807907104)
assertEq(f32[1512 >> 2], 1.6874998807907104)
assertEq(f32[1516 >> 2], 1.7499998807907104)
assertEq(f32[1520 >> 2], 1.8124998807907104)
assertEq(f32[1524 >> 2], 1.8749998807907104)
assertEq(f32[1528 >> 2], 1.9374998807907104)
assertEq(f32[1532 >> 2], 1.9999998807907104)
assertEq(f32[1536 >> 2], -2.124999761581421)
assertEq(f32[1540 >> 2], -2.249999761581421)
assertEq(f32[1544 >> 2], -2.374999761581421)
assertEq(f32[1548 >> 2], -2.499999761581421)
assertEq(f32[1552 >> 2], -2.624999761581421)
assertEq(f32[1556 >> 2], -2.749999761581421)
assertEq(f32[1560 >> 2], -2.874999761581421)
assertEq(f32[1564 >> 2], -2.999999761581421)
assertEq(f32[1568 >> 2], -3.124999761581421)
assertEq(f32[1572 >> 2], -3.249999761581421)
assertEq(f32[1576 >> 2], -3.374999761581421)
assertEq(f32[1580 >> 2], -3.499999761581421)
assertEq(f32[1584 >> 2], -3.624999761581421)
assertEq(f32[1584 >> 2], -3.624999761581421)
assertEq(f32[1588 >> 2], -3.749999761581421)
assertEq(f32[1592 >> 2], -3.874999761581421)
assertEq(f32[1596 >> 2], -3.999999761581421)
assertEq(f32[1600 >> 2], -4.249999523162842)
assertEq(f32[1604 >> 2], -4.499999523162842)
assertEq(f32[1608 >> 2], -4.749999523162842)
assertEq(f32[1612 >> 2], -4.999999523162842)
assertEq(f32[1616 >> 2], -5.249999523162842)
assertEq(f32[1620 >> 2], -5.499999523162842)
assertEq(f32[1624 >> 2], -5.749999523162842)
assertEq(f32[1628 >> 2], -5.999999523162842)
assertEq(f32[1632 >> 2], -6.249999523162842)
assertEq(f32[1636 >> 2], -6.499999523162842)
assertEq(f32[1640 >> 2], -6.749999523162842)
assertEq(f32[1644 >> 2], -6.999999523162842)
assertEq(f32[1648 >> 2], -7.249999523162842)
assertEq(f32[1652 >> 2], -7.499999523162842)
assertEq(f32[1656 >> 2], -7.749999523162842)
assertEq(f32[1660 >> 2], -7.999999523162842)
assertEq(f32[1664 >> 2], -8.499999046325684)
assertEq(f32[1668 >> 2], -8.999999046325684)
assertEq(f32[1672 >> 2], -9.499999046325684)
assertEq(f32[1676 >> 2], -9.999999046325684)
assertEq(f32[1680 >> 2], -10.499999046325684)
assertEq(f32[1684 >> 2], -10.999999046325684)
assertEq(f32[1688 >> 2], -11.499999046325684)
assertEq(f32[1692 >> 2], -11.999999046325684)
assertEq(f32[1696 >> 2], -12.499999046325684)
assertEq(f32[1700 >> 2], -12.999999046325684)
assertEq(f32[1704 >> 2], -13.499999046325684)
assertEq(f32[1708 >> 2], -13.999999046325684)
assertEq(f32[1712 >> 2], -14.499999046325684)
assertEq(f32[1716 >> 2], -14.999999046325684)
assertEq(f32[1720 >> 2], -15.499999046325684)
assertEq(f32[1724 >> 2], -15.999999046325684)
assertEq(f32[1728 >> 2], -16.999998092651367)
assertEq(f32[1732 >> 2], -17.999998092651367)
assertEq(f32[1736 >> 2], -18.999998092651367)
assertEq(f32[1740 >> 2], -19.999998092651367)
assertEq(f32[1744 >> 2], -20.999998092651367)
assertEq(f32[1748 >> 2], -21.999998092651367)
assertEq(f32[1752 >> 2], -22.999998092651367)
assertEq(f32[1756 >> 2], -23.999998092651367)
assertEq(f32[1760 >> 2], -24.999998092651367)
assertEq(f32[1764 >> 2], -25.999998092651367)
assertEq(f32[1768 >> 2], -26.999998092651367)
assertEq(f32[1772 >> 2], -27.999998092651367)
assertEq(f32[1776 >> 2], -28.999998092651367)
assertEq(f32[1780 >> 2], -29.999998092651367)
assertEq(f32[1784 >> 2], -30.999998092651367)
assertEq(f32[1788 >> 2], -31.999998092651367)
assertEq(f32[1792 >> 2], -0.1328124850988388)
assertEq(f32[1796 >> 2], -0.1406249850988388)
assertEq(f32[1800 >> 2], -0.1484374850988388)
assertEq(f32[1804 >> 2], -0.1562499850988388)
assertEq(f32[1808 >> 2], -0.1640624850988388)
assertEq(f32[1812 >> 2], -0.1718749850988388)
assertEq(f32[1816 >> 2], -0.1796874850988388)
assertEq(f32[1820 >> 2], -0.1874999850988388)
assertEq(f32[1824 >> 2], -0.1953124850988388)
assertEq(f32[1828 >> 2], -0.2031249850988388)
assertEq(f32[1832 >> 2], -0.2109374850988388)
assertEq(f32[1836 >> 2], -0.2187499850988388)
assertEq(f32[1840 >> 2], -0.2265624850988388)
assertEq(f32[1844 >> 2], -0.2343749850988388)
assertEq(f32[1848 >> 2], -0.2421874850988388)
assertEq(f32[1852 >> 2], -0.2499999850988388)
assertEq(f32[1856 >> 2], -0.2656249701976776)
assertEq(f32[1860 >> 2], -0.2812499701976776)
assertEq(f32[1864 >> 2], -0.2968749701976776)
assertEq(f32[1868 >> 2], -0.3124999701976776)
assertEq(f32[1872 >> 2], -0.3281249701976776)
assertEq(f32[1876 >> 2], -0.3437499701976776)
assertEq(f32[1880 >> 2], -0.3593749701976776)
assertEq(f32[1884 >> 2], -0.3749999701976776)
assertEq(f32[1888 >> 2], -0.3906249701976776)
assertEq(f32[1892 >> 2], -0.4062499701976776)
assertEq(f32[1896 >> 2], -0.4218749701976776)
assertEq(f32[1900 >> 2], -0.4374999701976776)
assertEq(f32[1904 >> 2], -0.4531249701976776)
assertEq(f32[1908 >> 2], -0.4687499701976776)
assertEq(f32[1912 >> 2], -0.4843749701976776)
assertEq(f32[1916 >> 2], -0.4999999701976776)
assertEq(f32[1920 >> 2], -0.5312499403953552)
assertEq(f32[1924 >> 2], -0.5624999403953552)
assertEq(f32[1928 >> 2], -0.5937499403953552)
assertEq(f32[1932 >> 2], -0.6249999403953552)
assertEq(f32[1936 >> 2], -0.6562499403953552)
assertEq(f32[1940 >> 2], -0.6874999403953552)
assertEq(f32[1944 >> 2], -0.7187499403953552)
assertEq(f32[1948 >> 2], -0.7499999403953552)
assertEq(f32[1952 >> 2], -0.7812499403953552)
assertEq(f32[1956 >> 2], -0.8124999403953552)
assertEq(f32[1960 >> 2], -0.8437499403953552)
assertEq(f32[1964 >> 2], -0.8749999403953552)
assertEq(f32[1968 >> 2], -0.9062499403953552)
assertEq(f32[1972 >> 2], -0.9374999403953552)
assertEq(f32[1976 >> 2], -0.9687499403953552)
assertEq(f32[1980 >> 2], -0.9999999403953552)
assertEq(f32[1984 >> 2], -1.0624998807907104)
assertEq(f32[1984 >> 2], -1.0624998807907104)
assertEq(f32[1988 >> 2], -1.1249998807907104)
assertEq(f32[1992 >> 2], -1.1874998807907104)
assertEq(f32[1996 >> 2], -1.2499998807907104)
assertEq(f32[2000 >> 2], -1.3124998807907104)
assertEq(f32[2004 >> 2], -1.3749998807907104)
assertEq(f32[2008 >> 2], -1.4374998807907104)
assertEq(f32[2012 >> 2], -1.4999998807907104)
assertEq(f32[2016 >> 2], -1.5624998807907104)
assertEq(f32[2020 >> 2], -1.6249998807907104)
assertEq(f32[2024 >> 2], -1.6874998807907104)
assertEq(f32[2028 >> 2], -1.7499998807907104)
assertEq(f32[2032 >> 2], -1.8124998807907104)
assertEq(f32[2036 >> 2], -1.8749998807907104)
assertEq(f32[2040 >> 2], -1.9374998807907104)
assertEq(f32[2044 >> 2], -1.9999998807907104)

assertEq(f32[2048 >> 2], 2.000000238418579)
assertEq(f32[2052 >> 2], 2.125000238418579)
assertEq(f32[2056 >> 2], 2.250000238418579)
assertEq(f32[2060 >> 2], 2.375000238418579)
assertEq(f32[2064 >> 2], 2.500000238418579)
assertEq(f32[2068 >> 2], 2.625000238418579)
assertEq(f32[2072 >> 2], 2.750000238418579)
assertEq(f32[2076 >> 2], 2.875000238418579)
assertEq(f32[2080 >> 2], 3.000000238418579)
assertEq(f32[2084 >> 2], 3.125000238418579)
assertEq(f32[2088 >> 2], 3.250000238418579)
assertEq(f32[2092 >> 2], 3.375000238418579)
assertEq(f32[2096 >> 2], 3.500000238418579)
assertEq(f32[2100 >> 2], 3.625000238418579)
assertEq(f32[2104 >> 2], 3.750000238418579)
assertEq(f32[2108 >> 2], 3.875000238418579)
assertEq(f32[2112 >> 2], 4.000000476837158)
assertEq(f32[2116 >> 2], 4.250000476837158)
assertEq(f32[2120 >> 2], 4.500000476837158)
assertEq(f32[2124 >> 2], 4.750000476837158)
assertEq(f32[2128 >> 2], 5.000000476837158)
assertEq(f32[2132 >> 2], 5.250000476837158)
assertEq(f32[2136 >> 2], 5.500000476837158)
assertEq(f32[2140 >> 2], 5.750000476837158)
assertEq(f32[2144 >> 2], 6.000000476837158)
assertEq(f32[2148 >> 2], 6.250000476837158)
assertEq(f32[2152 >> 2], 6.500000476837158)
assertEq(f32[2156 >> 2], 6.750000476837158)
assertEq(f32[2160 >> 2], 7.000000476837158)
assertEq(f32[2164 >> 2], 7.250000476837158)
assertEq(f32[2168 >> 2], 7.500000476837158)
assertEq(f32[2172 >> 2], 7.750000476837158)
assertEq(f32[2176 >> 2], 8.000000953674316)
assertEq(f32[2180 >> 2], 8.500000953674316)
assertEq(f32[2184 >> 2], 9.000000953674316)
assertEq(f32[2188 >> 2], 9.500000953674316)
assertEq(f32[2192 >> 2], 10.000000953674316)
assertEq(f32[2196 >> 2], 10.500000953674316)
assertEq(f32[2200 >> 2], 11.000000953674316)
assertEq(f32[2204 >> 2], 11.500000953674316)
assertEq(f32[2208 >> 2], 12.000000953674316)
assertEq(f32[2212 >> 2], 12.500000953674316)
assertEq(f32[2216 >> 2], 13.000000953674316)
assertEq(f32[2220 >> 2], 13.500000953674316)
assertEq(f32[2224 >> 2], 14.000000953674316)
assertEq(f32[2228 >> 2], 14.500000953674316)
assertEq(f32[2228 >> 2], 14.500000953674316)
assertEq(f32[2232 >> 2], 15.000000953674316)
assertEq(f32[2236 >> 2], 15.500000953674316)
assertEq(f32[2240 >> 2], 16.000001907348633)
assertEq(f32[2244 >> 2], 17.000001907348633)
assertEq(f32[2248 >> 2], 18.000001907348633)
assertEq(f32[2252 >> 2], 19.000001907348633)
assertEq(f32[2256 >> 2], 20.000001907348633)
assertEq(f32[2260 >> 2], 21.000001907348633)
assertEq(f32[2264 >> 2], 22.000001907348633)
assertEq(f32[2268 >> 2], 23.000001907348633)
assertEq(f32[2272 >> 2], 24.000001907348633)
assertEq(f32[2276 >> 2], 25.000001907348633)
assertEq(f32[2280 >> 2], 26.000001907348633)
assertEq(f32[2284 >> 2], 27.000001907348633)
assertEq(f32[2288 >> 2], 28.000001907348633)
assertEq(f32[2292 >> 2], 29.000001907348633)
assertEq(f32[2296 >> 2], 30.000001907348633)
assertEq(f32[2300 >> 2], 31.000001907348633)
assertEq(f32[2304 >> 2], 0.1250000149011612)
assertEq(f32[2308 >> 2], 0.1328125149011612)
assertEq(f32[2312 >> 2], 0.1406250149011612)
assertEq(f32[2316 >> 2], 0.1484375149011612)
assertEq(f32[2320 >> 2], 0.1562500149011612)
assertEq(f32[2324 >> 2], 0.1640625149011612)
assertEq(f32[2328 >> 2], 0.1718750149011612)
assertEq(f32[2332 >> 2], 0.1796875149011612)
assertEq(f32[2336 >> 2], 0.1875000149011612)
assertEq(f32[2340 >> 2], 0.1953125149011612)
assertEq(f32[2344 >> 2], 0.2031250149011612)
assertEq(f32[2348 >> 2], 0.2109375149011612)
assertEq(f32[2352 >> 2], 0.2187500149011612)
assertEq(f32[2356 >> 2], 0.2265625149011612)
assertEq(f32[2360 >> 2], 0.2343750149011612)
assertEq(f32[2364 >> 2], 0.2421875149011612)
assertEq(f32[2368 >> 2], 0.2500000298023224)
assertEq(f32[2372 >> 2], 0.2656250298023224)
assertEq(f32[2376 >> 2], 0.2812500298023224)
assertEq(f32[2380 >> 2], 0.2968750298023224)
assertEq(f32[2384 >> 2], 0.3125000298023224)
assertEq(f32[2388 >> 2], 0.3281250298023224)
assertEq(f32[2392 >> 2], 0.3437500298023224)
assertEq(f32[2396 >> 2], 0.3593750298023224)
assertEq(f32[2400 >> 2], 0.3750000298023224)
assertEq(f32[2404 >> 2], 0.3906250298023224)
assertEq(f32[2408 >> 2], 0.4062500298023224)
assertEq(f32[2412 >> 2], 0.4218750298023224)
assertEq(f32[2416 >> 2], 0.4375000298023224)
assertEq(f32[2420 >> 2], 0.4531250298023224)
assertEq(f32[2424 >> 2], 0.4687500298023224)
assertEq(f32[2428 >> 2], 0.4843750298023224)
assertEq(f32[2432 >> 2], 0.5000000596046448)
assertEq(f32[2436 >> 2], 0.5312500596046448)
assertEq(f32[2440 >> 2], 0.5625000596046448)
assertEq(f32[2444 >> 2], 0.5937500596046448)
assertEq(f32[2448 >> 2], 0.6250000596046448)
assertEq(f32[2452 >> 2], 0.6562500596046448)
assertEq(f32[2456 >> 2], 0.6875000596046448)
assertEq(f32[2460 >> 2], 0.7187500596046448)
assertEq(f32[2464 >> 2], 0.7500000596046448)
assertEq(f32[2468 >> 2], 0.7812500596046448)
assertEq(f32[2472 >> 2], 0.8125000596046448)
assertEq(f32[2476 >> 2], 0.8437500596046448)
assertEq(f32[2480 >> 2], 0.8750000596046448)
assertEq(f32[2484 >> 2], 0.9062500596046448)
assertEq(f32[2488 >> 2], 0.9375000596046448)
assertEq(f32[2492 >> 2], 0.9687500596046448)
assertEq(f32[2496 >> 2], 1.0000001192092896)
assertEq(f32[2500 >> 2], 1.0625001192092896)
assertEq(f32[2504 >> 2], 1.1250001192092896)
assertEq(f32[2508 >> 2], 1.1875001192092896)
assertEq(f32[2512 >> 2], 1.2500001192092896)
assertEq(f32[2516 >> 2], 1.3125001192092896)
assertEq(f32[2520 >> 2], 1.3750001192092896)
assertEq(f32[2524 >> 2], 1.4375001192092896)
assertEq(f32[2528 >> 2], 1.5000001192092896)
assertEq(f32[2532 >> 2], 1.5625001192092896)
assertEq(f32[2536 >> 2], 1.6250001192092896)
assertEq(f32[2540 >> 2], 1.6875001192092896)
assertEq(f32[2544 >> 2], 1.7500001192092896)
assertEq(f32[2548 >> 2], 1.8125001192092896)
assertEq(f32[2552 >> 2], 1.8750001192092896)
assertEq(f32[2556 >> 2], 1.9375001192092896)
assertEq(f32[2560 >> 2], -2.000000238418579)
assertEq(f32[2564 >> 2], -2.125000238418579)
assertEq(f32[2568 >> 2], -2.250000238418579)
assertEq(f32[2572 >> 2], -2.375000238418579)
assertEq(f32[2576 >> 2], -2.500000238418579)
assertEq(f32[2580 >> 2], -2.625000238418579)
assertEq(f32[2584 >> 2], -2.750000238418579)
assertEq(f32[2588 >> 2], -2.875000238418579)
assertEq(f32[2592 >> 2], -3.000000238418579)
assertEq(f32[2596 >> 2], -3.125000238418579)
assertEq(f32[2600 >> 2], -3.250000238418579)
assertEq(f32[2604 >> 2], -3.375000238418579)
assertEq(f32[2608 >> 2], -3.500000238418579)
assertEq(f32[2612 >> 2], -3.625000238418579)
assertEq(f32[2616 >> 2], -3.750000238418579)
assertEq(f32[2620 >> 2], -3.875000238418579)
assertEq(f32[2624 >> 2], -4.000000476837158)
assertEq(f32[2628 >> 2], -4.250000476837158)
assertEq(f32[2628 >> 2], -4.250000476837158)
assertEq(f32[2632 >> 2], -4.500000476837158)
assertEq(f32[2636 >> 2], -4.750000476837158)
assertEq(f32[2640 >> 2], -5.000000476837158)
assertEq(f32[2644 >> 2], -5.250000476837158)
assertEq(f32[2648 >> 2], -5.500000476837158)
assertEq(f32[2652 >> 2], -5.750000476837158)
assertEq(f32[2656 >> 2], -6.000000476837158)
assertEq(f32[2660 >> 2], -6.250000476837158)
assertEq(f32[2664 >> 2], -6.500000476837158)
assertEq(f32[2668 >> 2], -6.750000476837158)
assertEq(f32[2672 >> 2], -7.000000476837158)
assertEq(f32[2676 >> 2], -7.250000476837158)
assertEq(f32[2680 >> 2], -7.500000476837158)
assertEq(f32[2684 >> 2], -7.750000476837158)
assertEq(f32[2688 >> 2], -8.000000953674316)
assertEq(f32[2692 >> 2], -8.500000953674316)
assertEq(f32[2696 >> 2], -9.000000953674316)
assertEq(f32[2700 >> 2], -9.500000953674316)
assertEq(f32[2704 >> 2], -10.000000953674316)
assertEq(f32[2708 >> 2], -10.500000953674316)
assertEq(f32[2712 >> 2], -11.000000953674316)
assertEq(f32[2716 >> 2], -11.500000953674316)
assertEq(f32[2720 >> 2], -12.000000953674316)
assertEq(f32[2724 >> 2], -12.500000953674316)
assertEq(f32[2728 >> 2], -13.000000953674316)
assertEq(f32[2732 >> 2], -13.500000953674316)
assertEq(f32[2736 >> 2], -14.000000953674316)
assertEq(f32[2740 >> 2], -14.500000953674316)
assertEq(f32[2744 >> 2], -15.000000953674316)
assertEq(f32[2748 >> 2], -15.500000953674316)
assertEq(f32[2752 >> 2], -16.000001907348633)
assertEq(f32[2756 >> 2], -17.000001907348633)
assertEq(f32[2760 >> 2], -18.000001907348633)
assertEq(f32[2764 >> 2], -19.000001907348633)
assertEq(f32[2768 >> 2], -20.000001907348633)
assertEq(f32[2772 >> 2], -21.000001907348633)
assertEq(f32[2776 >> 2], -22.000001907348633)
assertEq(f32[2780 >> 2], -23.000001907348633)
assertEq(f32[2784 >> 2], -24.000001907348633)
assertEq(f32[2788 >> 2], -25.000001907348633)
assertEq(f32[2792 >> 2], -26.000001907348633)
assertEq(f32[2796 >> 2], -27.000001907348633)
assertEq(f32[2800 >> 2], -28.000001907348633)
assertEq(f32[2804 >> 2], -29.000001907348633)
assertEq(f32[2808 >> 2], -30.000001907348633)
assertEq(f32[2812 >> 2], -31.000001907348633)
assertEq(f32[2816 >> 2], -0.1250000149011612)
assertEq(f32[2820 >> 2], -0.1328125149011612)
assertEq(f32[2824 >> 2], -0.1406250149011612)
assertEq(f32[2828 >> 2], -0.1484375149011612)
assertEq(f32[2832 >> 2], -0.1562500149011612)
assertEq(f32[2836 >> 2], -0.1640625149011612)
assertEq(f32[2840 >> 2], -0.1718750149011612)
assertEq(f32[2844 >> 2], -0.1796875149011612)
assertEq(f32[2848 >> 2], -0.1875000149011612)
assertEq(f32[2852 >> 2], -0.1953125149011612)
assertEq(f32[2856 >> 2], -0.2031250149011612)
assertEq(f32[2860 >> 2], -0.2109375149011612)
assertEq(f32[2864 >> 2], -0.2187500149011612)
assertEq(f32[2868 >> 2], -0.2265625149011612)
assertEq(f32[2872 >> 2], -0.2343750149011612)
assertEq(f32[2876 >> 2], -0.2421875149011612)
assertEq(f32[2880 >> 2], -0.2500000298023224)
assertEq(f32[2884 >> 2], -0.2656250298023224)
assertEq(f32[2888 >> 2], -0.2812500298023224)
assertEq(f32[2892 >> 2], -0.2968750298023224)
assertEq(f32[2896 >> 2], -0.3125000298023224)
assertEq(f32[2900 >> 2], -0.3281250298023224)
assertEq(f32[2904 >> 2], -0.3437500298023224)
assertEq(f32[2908 >> 2], -0.3593750298023224)
assertEq(f32[2912 >> 2], -0.3750000298023224)
assertEq(f32[2916 >> 2], -0.3906250298023224)
assertEq(f32[2920 >> 2], -0.4062500298023224)
assertEq(f32[2924 >> 2], -0.4218750298023224)
assertEq(f32[2928 >> 2], -0.4375000298023224)
assertEq(f32[2932 >> 2], -0.4531250298023224)
assertEq(f32[2936 >> 2], -0.4687500298023224)
assertEq(f32[2940 >> 2], -0.4843750298023224)
assertEq(f32[2944 >> 2], -0.5000000596046448)
assertEq(f32[2948 >> 2], -0.5312500596046448)
assertEq(f32[2952 >> 2], -0.5625000596046448)
assertEq(f32[2956 >> 2], -0.5937500596046448)
assertEq(f32[2960 >> 2], -0.6250000596046448)
assertEq(f32[2964 >> 2], -0.6562500596046448)
assertEq(f32[2968 >> 2], -0.6875000596046448)
assertEq(f32[2972 >> 2], -0.7187500596046448)
assertEq(f32[2976 >> 2], -0.7500000596046448)
assertEq(f32[2980 >> 2], -0.7812500596046448)
assertEq(f32[2984 >> 2], -0.8125000596046448)
assertEq(f32[2988 >> 2], -0.8437500596046448)
assertEq(f32[2992 >> 2], -0.8750000596046448)
assertEq(f32[2996 >> 2], -0.9062500596046448)
assertEq(f32[3000 >> 2], -0.9375000596046448)
assertEq(f32[3004 >> 2], -0.9687500596046448)
assertEq(f32[3008 >> 2], -1.0000001192092896)
assertEq(f32[3012 >> 2], -1.0625001192092896)
assertEq(f32[3016 >> 2], -1.1250001192092896)
assertEq(f32[3020 >> 2], -1.1875001192092896)
assertEq(f32[3024 >> 2], -1.2500001192092896)
assertEq(f32[3028 >> 2], -1.3125001192092896)
assertEq(f32[3028 >> 2], -1.3125001192092896)
assertEq(f32[3032 >> 2], -1.3750001192092896)
assertEq(f32[3036 >> 2], -1.4375001192092896)
assertEq(f32[3040 >> 2], -1.5000001192092896)
assertEq(f32[3044 >> 2], -1.5625001192092896)
assertEq(f32[3048 >> 2], -1.6250001192092896)
assertEq(f32[3052 >> 2], -1.6875001192092896)
assertEq(f32[3056 >> 2], -1.7500001192092896)
assertEq(f32[3060 >> 2], -1.8125001192092896)
assertEq(f32[3064 >> 2], -1.8750001192092896)
assertEq(f32[3068 >> 2], -1.9375001192092896)

assertEq(f32[3072 >> 2], 2.0625)
assertEq(f32[3076 >> 2], 2.1875)
assertEq(f32[3080 >> 2], 2.3125)
assertEq(f32[3084 >> 2], 2.4375)
assertEq(f32[3088 >> 2], 2.5625)
assertEq(f32[3092 >> 2], 2.6875)
assertEq(f32[3096 >> 2], 2.8125)
assertEq(f32[3100 >> 2], 2.9375)
assertEq(f32[3104 >> 2], 3.0625)
assertEq(f32[3108 >> 2], 3.1875)
assertEq(f32[3112 >> 2], 3.3125)
assertEq(f32[3116 >> 2], 3.4375)
assertEq(f32[3120 >> 2], 3.5625)
assertEq(f32[3124 >> 2], 3.6875)
assertEq(f32[3128 >> 2], 3.8125)
assertEq(f32[3132 >> 2], 3.9375)
assertEq(f32[3136 >> 2], 4.125)
assertEq(f32[3140 >> 2], 4.375)
assertEq(f32[3144 >> 2], 4.625)
assertEq(f32[3148 >> 2], 4.875)
assertEq(f32[3152 >> 2], 5.125)
assertEq(f32[3156 >> 2], 5.375)
assertEq(f32[3160 >> 2], 5.625)
assertEq(f32[3164 >> 2], 5.875)
assertEq(f32[3168 >> 2], 6.125)
assertEq(f32[3172 >> 2], 6.375)
assertEq(f32[3176 >> 2], 6.625)
assertEq(f32[3180 >> 2], 6.875)
assertEq(f32[3184 >> 2], 7.125)
assertEq(f32[3188 >> 2], 7.375)
assertEq(f32[3192 >> 2], 7.625)
assertEq(f32[3196 >> 2], 7.875)
assertEq(f32[3200 >> 2], 8.25)
assertEq(f32[3204 >> 2], 8.75)
assertEq(f32[3208 >> 2], 9.25)
assertEq(f32[3212 >> 2], 9.75)
assertEq(f32[3216 >> 2], 10.25)
assertEq(f32[3220 >> 2], 10.75)
assertEq(f32[3224 >> 2], 11.25)
assertEq(f32[3224 >> 2], 11.25)
assertEq(f32[3228 >> 2], 11.75)
assertEq(f32[3232 >> 2], 12.25)
assertEq(f32[3236 >> 2], 12.75)
assertEq(f32[3240 >> 2], 13.25)
assertEq(f32[3244 >> 2], 13.75)
assertEq(f32[3248 >> 2], 14.25)
assertEq(f32[3252 >> 2], 14.75)
assertEq(f32[3256 >> 2], 15.25)
assertEq(f32[3260 >> 2], 15.75)
assertEq(f32[3264 >> 2], 16.5)
assertEq(f32[3268 >> 2], 17.5)
assertEq(f32[3272 >> 2], 18.5)
assertEq(f32[3276 >> 2], 19.5)
assertEq(f32[3280 >> 2], 20.5)
assertEq(f32[3284 >> 2], 21.5)
assertEq(f32[3288 >> 2], 22.5)
assertEq(f32[3292 >> 2], 23.5)
assertEq(f32[3296 >> 2], 24.5)
assertEq(f32[3300 >> 2], 25.5)
assertEq(f32[3304 >> 2], 26.5)
assertEq(f32[3308 >> 2], 27.5)
assertEq(f32[3312 >> 2], 28.5)
assertEq(f32[3316 >> 2], 29.5)
assertEq(f32[3320 >> 2], 30.5)
assertEq(f32[3324 >> 2], 31.5)
assertEq(f32[3328 >> 2], 0.12890625)
assertEq(f32[3332 >> 2], 0.13671875)
assertEq(f32[3336 >> 2], 0.14453125)
assertEq(f32[3340 >> 2], 0.15234375)
assertEq(f32[3344 >> 2], 0.16015625)
assertEq(f32[3348 >> 2], 0.16796875)
assertEq(f32[3352 >> 2], 0.17578125)
assertEq(f32[3356 >> 2], 0.18359375)
assertEq(f32[3360 >> 2], 0.19140625)
assertEq(f32[3364 >> 2], 0.19921875)
assertEq(f32[3368 >> 2], 0.20703125)
assertEq(f32[3372 >> 2], 0.21484375)
assertEq(f32[3376 >> 2], 0.22265625)
assertEq(f32[3380 >> 2], 0.23046875)
assertEq(f32[3384 >> 2], 0.23828125)
assertEq(f32[3388 >> 2], 0.24609375)
assertEq(f32[3392 >> 2], 0.2578125)
assertEq(f32[3396 >> 2], 0.2734375)
assertEq(f32[3400 >> 2], 0.2890625)
assertEq(f32[3404 >> 2], 0.3046875)
assertEq(f32[3408 >> 2], 0.3203125)
assertEq(f32[3412 >> 2], 0.3359375)
assertEq(f32[3416 >> 2], 0.3515625)
assertEq(f32[3420 >> 2], 0.3671875)
assertEq(f32[3424 >> 2], 0.3828125)
assertEq(f32[3428 >> 2], 0.3984375)
assertEq(f32[3432 >> 2], 0.4140625)
assertEq(f32[3436 >> 2], 0.4296875)
assertEq(f32[3440 >> 2], 0.4453125)
assertEq(f32[3444 >> 2], 0.4609375)
assertEq(f32[3448 >> 2], 0.4765625)
assertEq(f32[3452 >> 2], 0.4921875)
assertEq(f32[3456 >> 2], 0.515625)
assertEq(f32[3460 >> 2], 0.546875)
assertEq(f32[3464 >> 2], 0.578125)
assertEq(f32[3468 >> 2], 0.609375)
assertEq(f32[3472 >> 2], 0.640625)
assertEq(f32[3476 >> 2], 0.671875)
assertEq(f32[3480 >> 2], 0.703125)
assertEq(f32[3484 >> 2], 0.734375)
assertEq(f32[3488 >> 2], 0.765625)
assertEq(f32[3492 >> 2], 0.796875)
assertEq(f32[3496 >> 2], 0.828125)
assertEq(f32[3500 >> 2], 0.859375)
assertEq(f32[3504 >> 2], 0.890625)
assertEq(f32[3508 >> 2], 0.921875)
assertEq(f32[3512 >> 2], 0.953125)
assertEq(f32[3516 >> 2], 0.984375)
assertEq(f32[3520 >> 2], 1.03125)
assertEq(f32[3524 >> 2], 1.09375)
assertEq(f32[3528 >> 2], 1.15625)
assertEq(f32[3532 >> 2], 1.21875)
assertEq(f32[3536 >> 2], 1.28125)
assertEq(f32[3540 >> 2], 1.34375)
assertEq(f32[3544 >> 2], 1.40625)
assertEq(f32[3548 >> 2], 1.46875)
assertEq(f32[3552 >> 2], 1.53125)
assertEq(f32[3556 >> 2], 1.59375)
assertEq(f32[3560 >> 2], 1.65625)
assertEq(f32[3564 >> 2], 1.71875)
assertEq(f32[3568 >> 2], 1.78125)
assertEq(f32[3572 >> 2], 1.84375)
assertEq(f32[3576 >> 2], 1.90625)
assertEq(f32[3580 >> 2], 1.96875)
assertEq(f32[3584 >> 2], -2.0625)
assertEq(f32[3588 >> 2], -2.1875)
assertEq(f32[3592 >> 2], -2.3125)
assertEq(f32[3596 >> 2], -2.4375)
assertEq(f32[3600 >> 2], -2.5625)
assertEq(f32[3604 >> 2], -2.6875)
assertEq(f32[3608 >> 2], -2.8125)
assertEq(f32[3612 >> 2], -2.9375)
assertEq(f32[3616 >> 2], -3.0625)
assertEq(f32[3620 >> 2], -3.1875)
assertEq(f32[3624 >> 2], -3.3125)
assertEq(f32[3624 >> 2], -3.3125)
assertEq(f32[3628 >> 2], -3.4375)
assertEq(f32[3632 >> 2], -3.5625)
assertEq(f32[3636 >> 2], -3.6875)
assertEq(f32[3640 >> 2], -3.8125)
assertEq(f32[3644 >> 2], -3.9375)
assertEq(f32[3648 >> 2], -4.125)
assertEq(f32[3652 >> 2], -4.375)
assertEq(f32[3656 >> 2], -4.625)
assertEq(f32[3660 >> 2], -4.875)
assertEq(f32[3664 >> 2], -5.125)
assertEq(f32[3668 >> 2], -5.375)
assertEq(f32[3672 >> 2], -5.625)
assertEq(f32[3676 >> 2], -5.875)
assertEq(f32[3680 >> 2], -6.125)
assertEq(f32[3684 >> 2], -6.375)
assertEq(f32[3688 >> 2], -6.625)
assertEq(f32[3692 >> 2], -6.875)
assertEq(f32[3696 >> 2], -7.125)
assertEq(f32[3700 >> 2], -7.375)
assertEq(f32[3704 >> 2], -7.625)
assertEq(f32[3708 >> 2], -7.875)
assertEq(f32[3712 >> 2], -8.25)
assertEq(f32[3716 >> 2], -8.75)
assertEq(f32[3720 >> 2], -9.25)
assertEq(f32[3724 >> 2], -9.75)
assertEq(f32[3728 >> 2], -10.25)
assertEq(f32[3732 >> 2], -10.75)
assertEq(f32[3736 >> 2], -11.25)
assertEq(f32[3740 >> 2], -11.75)
assertEq(f32[3744 >> 2], -12.25)
assertEq(f32[3748 >> 2], -12.75)
assertEq(f32[3752 >> 2], -13.25)
assertEq(f32[3756 >> 2], -13.75)
assertEq(f32[3760 >> 2], -14.25)
assertEq(f32[3764 >> 2], -14.75)
assertEq(f32[3768 >> 2], -15.25)
assertEq(f32[3772 >> 2], -15.75)
assertEq(f32[3776 >> 2], -16.5)
assertEq(f32[3780 >> 2], -17.5)
assertEq(f32[3784 >> 2], -18.5)
assertEq(f32[3788 >> 2], -19.5)
assertEq(f32[3792 >> 2], -20.5)
assertEq(f32[3796 >> 2], -21.5)
assertEq(f32[3800 >> 2], -22.5)
assertEq(f32[3804 >> 2], -23.5)
assertEq(f32[3808 >> 2], -24.5)
assertEq(f32[3812 >> 2], -25.5)
assertEq(f32[3816 >> 2], -26.5)
assertEq(f32[3820 >> 2], -27.5)
assertEq(f32[3824 >> 2], -28.5)
assertEq(f32[3828 >> 2], -29.5)
assertEq(f32[3832 >> 2], -30.5)
assertEq(f32[3836 >> 2], -31.5)
assertEq(f32[3840 >> 2], -0.12890625)
assertEq(f32[3844 >> 2], -0.13671875)
assertEq(f32[3848 >> 2], -0.14453125)
assertEq(f32[3852 >> 2], -0.15234375)
assertEq(f32[3856 >> 2], -0.16015625)
assertEq(f32[3860 >> 2], -0.16796875)
assertEq(f32[3864 >> 2], -0.17578125)
assertEq(f32[3868 >> 2], -0.18359375)
assertEq(f32[3872 >> 2], -0.19140625)
assertEq(f32[3876 >> 2], -0.19921875)
assertEq(f32[3880 >> 2], -0.20703125)
assertEq(f32[3884 >> 2], -0.21484375)
assertEq(f32[3888 >> 2], -0.22265625)
assertEq(f32[3892 >> 2], -0.23046875)
assertEq(f32[3896 >> 2], -0.23828125)
assertEq(f32[3900 >> 2], -0.24609375)
assertEq(f32[3904 >> 2], -0.2578125)
assertEq(f32[3908 >> 2], -0.2734375)
assertEq(f32[3912 >> 2], -0.2890625)
assertEq(f32[3916 >> 2], -0.3046875)
assertEq(f32[3920 >> 2], -0.3203125)
assertEq(f32[3924 >> 2], -0.3359375)
assertEq(f32[3928 >> 2], -0.3515625)
assertEq(f32[3932 >> 2], -0.3671875)
assertEq(f32[3936 >> 2], -0.3828125)
assertEq(f32[3940 >> 2], -0.3984375)
assertEq(f32[3944 >> 2], -0.4140625)
assertEq(f32[3948 >> 2], -0.4296875)
assertEq(f32[3952 >> 2], -0.4453125)
assertEq(f32[3956 >> 2], -0.4609375)
assertEq(f32[3960 >> 2], -0.4765625)
assertEq(f32[3964 >> 2], -0.4921875)
assertEq(f32[3968 >> 2], -0.515625)
assertEq(f32[3972 >> 2], -0.546875)
assertEq(f32[3976 >> 2], -0.578125)
assertEq(f32[3980 >> 2], -0.609375)
assertEq(f32[3984 >> 2], -0.640625)
assertEq(f32[3988 >> 2], -0.671875)
assertEq(f32[3992 >> 2], -0.703125)
assertEq(f32[3996 >> 2], -0.734375)
assertEq(f32[4000 >> 2], -0.765625)
assertEq(f32[4004 >> 2], -0.796875)
assertEq(f32[4008 >> 2], -0.828125)
assertEq(f32[4012 >> 2], -0.859375)
assertEq(f32[4016 >> 2], -0.890625)
assertEq(f32[4020 >> 2], -0.921875)
assertEq(f32[4024 >> 2], -0.953125)
assertEq(f32[4024 >> 2], -0.953125)
assertEq(f32[4028 >> 2], -0.984375)
assertEq(f32[4032 >> 2], -1.03125)
assertEq(f32[4036 >> 2], -1.09375)
assertEq(f32[4040 >> 2], -1.15625)
assertEq(f32[4044 >> 2], -1.21875)
assertEq(f32[4048 >> 2], -1.28125)
assertEq(f32[4052 >> 2], -1.34375)
assertEq(f32[4056 >> 2], -1.40625)
assertEq(f32[4060 >> 2], -1.46875)
assertEq(f32[4064 >> 2], -1.53125)
assertEq(f32[4068 >> 2], -1.59375)
assertEq(f32[4072 >> 2], -1.65625)
assertEq(f32[4076 >> 2], -1.71875)
assertEq(f32[4080 >> 2], -1.78125)
assertEq(f32[4084 >> 2], -1.84375)
assertEq(f32[4088 >> 2], -1.90625)
assertEq(f32[4092 >> 2], -1.96875)
