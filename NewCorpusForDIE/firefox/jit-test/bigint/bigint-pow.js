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

const tests = [
  [-0x10000000000000001n, 0n, 1n],
  [-0x10000000000000000n, 0n, 1n],
  [-0xffffffffffffffffn, 0n, 1n],
  [-0xfffffffffffffffen, 0n, 1n],
  [-0x8000000000000001n, 0n, 1n],
  [-0x8000000000000000n, 0n, 1n],
  [-0x7fffffffffffffffn, 0n, 1n],
  [-0x7ffffffffffffffen, 0n, 1n],
  [-0x100000001n, 0n, 1n],
  [-0x100000000n, 0n, 1n],
  [-0xffffffffn, 0n, 1n],
  [-0xfffffffen, 0n, 1n],
  [-0x80000001n, 0n, 1n],
  [-0x80000000n, 0n, 1n],
  [-0x7fffffffn, 0n, 1n],
  [-0x7ffffffen, 0n, 1n],
  [-9n, 0n, 1n],
  [-8n, 0n, 1n],
  [-7n, 0n, 1n],
  [-6n, 0n, 1n],
  [-5n, 0n, 1n],
  [-4n, 0n, 1n],
  [-3n, 0n, 1n],
  [-2n, 0n, 1n],
  [-1n, 0n, 1n],
  [0n, 0n, 1n],
  [1n, 0n, 1n],
  [2n, 0n, 1n],
  [3n, 0n, 1n],
  [4n, 0n, 1n],
  [5n, 0n, 1n],
  [6n, 0n, 1n],
  [7n, 0n, 1n],
  [8n, 0n, 1n],
  [9n, 0n, 1n],
  [0x7ffffffen, 0n, 1n],
  [0x7fffffffn, 0n, 1n],
  [0x80000000n, 0n, 1n],
  [0x80000001n, 0n, 1n],
  [0xfffffffen, 0n, 1n],
  [0xffffffffn, 0n, 1n],
  [0x100000000n, 0n, 1n],
  [0x100000001n, 0n, 1n],
  [0x7ffffffffffffffen, 0n, 1n],
  [0x7fffffffffffffffn, 0n, 1n],
  [0x8000000000000000n, 0n, 1n],
  [0x8000000000000001n, 0n, 1n],
  [0xfffffffffffffffen, 0n, 1n],
  [0xffffffffffffffffn, 0n, 1n],
  [0x10000000000000000n, 0n, 1n],
  [0x10000000000000001n, 0n, 1n],
  [-0x10000000000000001n, 1n, -0x10000000000000001n],
  [-0x10000000000000000n, 1n, -0x10000000000000000n],
  [-0xffffffffffffffffn, 1n, -0xffffffffffffffffn],
  [-0xfffffffffffffffen, 1n, -0xfffffffffffffffen],
  [-0x8000000000000001n, 1n, -0x8000000000000001n],
  [-0x8000000000000000n, 1n, -0x8000000000000000n],
  [-0x7fffffffffffffffn, 1n, -0x7fffffffffffffffn],
  [-0x7ffffffffffffffen, 1n, -0x7ffffffffffffffen],
  [-0x100000001n, 1n, -0x100000001n],
  [-0x100000000n, 1n, -0x100000000n],
  [-0xffffffffn, 1n, -0xffffffffn],
  [-0xfffffffen, 1n, -0xfffffffen],
  [-0x80000001n, 1n, -0x80000001n],
  [-0x80000000n, 1n, -0x80000000n],
  [-0x7fffffffn, 1n, -0x7fffffffn],
  [-0x7ffffffen, 1n, -0x7ffffffen],
  [-9n, 1n, -9n],
  [-8n, 1n, -8n],
  [-7n, 1n, -7n],
  [-6n, 1n, -6n],
  [-5n, 1n, -5n],
  [-4n, 1n, -4n],
  [-3n, 1n, -3n],
  [-2n, 1n, -2n],
  [-1n, 1n, -1n],
  [0n, 1n, 0n],
  [1n, 1n, 1n],
  [2n, 1n, 2n],
  [3n, 1n, 3n],
  [4n, 1n, 4n],
  [5n, 1n, 5n],
  [6n, 1n, 6n],
  [7n, 1n, 7n],
  [8n, 1n, 8n],
  [9n, 1n, 9n],
  [0x7ffffffen, 1n, 0x7ffffffen],
  [0x7fffffffn, 1n, 0x7fffffffn],
  [0x80000000n, 1n, 0x80000000n],
  [0x80000001n, 1n, 0x80000001n],
  [0xfffffffen, 1n, 0xfffffffen],
  [0xffffffffn, 1n, 0xffffffffn],
  [0x100000000n, 1n, 0x100000000n],
  [0x100000001n, 1n, 0x100000001n],
  [0x7ffffffffffffffen, 1n, 0x7ffffffffffffffen],
  [0x7fffffffffffffffn, 1n, 0x7fffffffffffffffn],
  [0x8000000000000000n, 1n, 0x8000000000000000n],
  [0x8000000000000001n, 1n, 0x8000000000000001n],
  [0xfffffffffffffffen, 1n, 0xfffffffffffffffen],
  [0xffffffffffffffffn, 1n, 0xffffffffffffffffn],
  [0x10000000000000000n, 1n, 0x10000000000000000n],
  [0x10000000000000001n, 1n, 0x10000000000000001n],
  [-0x10000000000000001n, 2n, 0x100000000000000020000000000000001n],
  [-0x10000000000000000n, 2n, 0x100000000000000000000000000000000n],
  [-0xffffffffffffffffn, 2n, 0xfffffffffffffffe0000000000000001n],
  [-0xfffffffffffffffen, 2n, 0xfffffffffffffffc0000000000000004n],
  [-0x8000000000000001n, 2n, 0x40000000000000010000000000000001n],
  [-0x8000000000000000n, 2n, 0x40000000000000000000000000000000n],
  [-0x7fffffffffffffffn, 2n, 0x3fffffffffffffff0000000000000001n],
  [-0x7ffffffffffffffen, 2n, 0x3ffffffffffffffe0000000000000004n],
  [-0x100000001n, 2n, 0x10000000200000001n],
  [-0x100000000n, 2n, 0x10000000000000000n],
  [-0xffffffffn, 2n, 0xfffffffe00000001n],
  [-0xfffffffen, 2n, 0xfffffffc00000004n],
  [-0x80000001n, 2n, 0x4000000100000001n],
  [-0x80000000n, 2n, 0x4000000000000000n],
  [-0x7fffffffn, 2n, 0x3fffffff00000001n],
  [-0x7ffffffen, 2n, 0x3ffffffe00000004n],
  [-9n, 2n, 81n],
  [-8n, 2n, 64n],
  [-7n, 2n, 49n],
  [-6n, 2n, 36n],
  [-5n, 2n, 25n],
  [-4n, 2n, 16n],
  [-3n, 2n, 9n],
  [-2n, 2n, 4n],
  [-1n, 2n, 1n],
  [0n, 2n, 0n],
  [1n, 2n, 1n],
  [2n, 2n, 4n],
  [3n, 2n, 9n],
  [4n, 2n, 16n],
  [5n, 2n, 25n],
  [6n, 2n, 36n],
  [7n, 2n, 49n],
  [8n, 2n, 64n],
  [9n, 2n, 81n],
  [0x7ffffffen, 2n, 0x3ffffffe00000004n],
  [0x7fffffffn, 2n, 0x3fffffff00000001n],
  [0x80000000n, 2n, 0x4000000000000000n],
  [0x80000001n, 2n, 0x4000000100000001n],
  [0xfffffffen, 2n, 0xfffffffc00000004n],
  [0xffffffffn, 2n, 0xfffffffe00000001n],
  [0x100000000n, 2n, 0x10000000000000000n],
  [0x100000001n, 2n, 0x10000000200000001n],
  [0x7ffffffffffffffen, 2n, 0x3ffffffffffffffe0000000000000004n],
  [0x7fffffffffffffffn, 2n, 0x3fffffffffffffff0000000000000001n],
  [0x8000000000000000n, 2n, 0x40000000000000000000000000000000n],
  [0x8000000000000001n, 2n, 0x40000000000000010000000000000001n],
  [0xfffffffffffffffen, 2n, 0xfffffffffffffffc0000000000000004n],
  [0xffffffffffffffffn, 2n, 0xfffffffffffffffe0000000000000001n],
  [0x10000000000000000n, 2n, 0x100000000000000000000000000000000n],
  [0x10000000000000001n, 2n, 0x100000000000000020000000000000001n],
  [-0x10000000000000001n, 3n, -0x1000000000000000300000000000000030000000000000001n],
  [-0x10000000000000000n, 3n, -0x1000000000000000000000000000000000000000000000000n],
  [-0xffffffffffffffffn, 3n, -0xfffffffffffffffd0000000000000002ffffffffffffffffn],
  [-0xfffffffffffffffen, 3n, -0xfffffffffffffffa000000000000000bfffffffffffffff8n],
  [-0x8000000000000001n, 3n, -0x2000000000000000c0000000000000018000000000000001n],
  [-0x8000000000000000n, 3n, -0x200000000000000000000000000000000000000000000000n],
  [-0x7fffffffffffffffn, 3n, -0x1fffffffffffffff40000000000000017fffffffffffffffn],
  [-0x7ffffffffffffffen, 3n, -0x1ffffffffffffffe8000000000000005fffffffffffffff8n],
  [-0x100000001n, 3n, -0x1000000030000000300000001n],
  [-0x100000000n, 3n, -0x1000000000000000000000000n],
  [-0xffffffffn, 3n, -0xfffffffd00000002ffffffffn],
  [-0xfffffffen, 3n, -0xfffffffa0000000bfffffff8n],
  [-0x80000001n, 3n, -0x20000000c000000180000001n],
  [-0x80000000n, 3n, -0x200000000000000000000000n],
  [-0x7fffffffn, 3n, -0x1fffffff400000017fffffffn],
  [-0x7ffffffen, 3n, -0x1ffffffe80000005fffffff8n],
  [-9n, 3n, -729n],
  [-8n, 3n, -512n],
  [-7n, 3n, -343n],
  [-6n, 3n, -216n],
  [-5n, 3n, -125n],
  [-4n, 3n, -64n],
  [-3n, 3n, -27n],
  [-2n, 3n, -8n],
  [-1n, 3n, -1n],
  [0n, 3n, 0n],
  [1n, 3n, 1n],
  [2n, 3n, 8n],
  [3n, 3n, 27n],
  [4n, 3n, 64n],
  [5n, 3n, 125n],
  [6n, 3n, 216n],
  [7n, 3n, 343n],
  [8n, 3n, 512n],
  [9n, 3n, 729n],
  [0x7ffffffen, 3n, 0x1ffffffe80000005fffffff8n],
  [0x7fffffffn, 3n, 0x1fffffff400000017fffffffn],
  [0x80000000n, 3n, 0x200000000000000000000000n],
  [0x80000001n, 3n, 0x20000000c000000180000001n],
  [0xfffffffen, 3n, 0xfffffffa0000000bfffffff8n],
  [0xffffffffn, 3n, 0xfffffffd00000002ffffffffn],
  [0x100000000n, 3n, 0x1000000000000000000000000n],
  [0x100000001n, 3n, 0x1000000030000000300000001n],
  [0x7ffffffffffffffen, 3n, 0x1ffffffffffffffe8000000000000005fffffffffffffff8n],
  [0x7fffffffffffffffn, 3n, 0x1fffffffffffffff40000000000000017fffffffffffffffn],
  [0x8000000000000000n, 3n, 0x200000000000000000000000000000000000000000000000n],
  [0x8000000000000001n, 3n, 0x2000000000000000c0000000000000018000000000000001n],
  [0xfffffffffffffffen, 3n, 0xfffffffffffffffa000000000000000bfffffffffffffff8n],
  [0xffffffffffffffffn, 3n, 0xfffffffffffffffd0000000000000002ffffffffffffffffn],
  [0x10000000000000000n, 3n, 0x1000000000000000000000000000000000000000000000000n],
  [0x10000000000000001n, 3n, 0x1000000000000000300000000000000030000000000000001n],
  [-0x10000000000000001n, 4n, 0x10000000000000004000000000000000600000000000000040000000000000001n],
  [-0x10000000000000000n, 4n, 0x10000000000000000000000000000000000000000000000000000000000000000n],
  [-0xffffffffffffffffn, 4n, 0xfffffffffffffffc0000000000000005fffffffffffffffc0000000000000001n],
  [-0xfffffffffffffffen, 4n, 0xfffffffffffffff80000000000000017ffffffffffffffe00000000000000010n],
  [-0x8000000000000001n, 4n, 0x1000000000000000800000000000000180000000000000020000000000000001n],
  [-0x8000000000000000n, 4n, 0x1000000000000000000000000000000000000000000000000000000000000000n],
  [-0x7fffffffffffffffn, 4n, 0xfffffffffffffff80000000000000017ffffffffffffffe0000000000000001n],
  [-0x7ffffffffffffffen, 4n, 0xfffffffffffffff0000000000000005fffffffffffffff00000000000000010n],
  [-0x100000001n, 4n, 0x100000004000000060000000400000001n],
  [-0x100000000n, 4n, 0x100000000000000000000000000000000n],
  [-0xffffffffn, 4n, 0xfffffffc00000005fffffffc00000001n],
  [-0xfffffffen, 4n, 0xfffffff800000017ffffffe000000010n],
  [-0x80000001n, 4n, 0x10000000800000018000000200000001n],
  [-0x80000000n, 4n, 0x10000000000000000000000000000000n],
  [-0x7fffffffn, 4n, 0xfffffff800000017ffffffe00000001n],
  [-0x7ffffffen, 4n, 0xfffffff00000005fffffff000000010n],
  [-9n, 4n, 0x19a1n],
  [-8n, 4n, 0x1000n],
  [-7n, 4n, 0x961n],
  [-6n, 4n, 0x510n],
  [-5n, 4n, 625n],
  [-4n, 4n, 256n],
  [-3n, 4n, 81n],
  [-2n, 4n, 16n],
  [-1n, 4n, 1n],
  [0n, 4n, 0n],
  [1n, 4n, 1n],
  [2n, 4n, 16n],
  [3n, 4n, 81n],
  [4n, 4n, 256n],
  [5n, 4n, 625n],
  [6n, 4n, 0x510n],
  [7n, 4n, 0x961n],
  [8n, 4n, 0x1000n],
  [9n, 4n, 0x19a1n],
  [0x7ffffffen, 4n, 0xfffffff00000005fffffff000000010n],
  [0x7fffffffn, 4n, 0xfffffff800000017ffffffe00000001n],
  [0x80000000n, 4n, 0x10000000000000000000000000000000n],
  [0x80000001n, 4n, 0x10000000800000018000000200000001n],
  [0xfffffffen, 4n, 0xfffffff800000017ffffffe000000010n],
  [0xffffffffn, 4n, 0xfffffffc00000005fffffffc00000001n],
  [0x100000000n, 4n, 0x100000000000000000000000000000000n],
  [0x100000001n, 4n, 0x100000004000000060000000400000001n],
  [0x7ffffffffffffffen, 4n, 0xfffffffffffffff0000000000000005fffffffffffffff00000000000000010n],
  [0x7fffffffffffffffn, 4n, 0xfffffffffffffff80000000000000017ffffffffffffffe0000000000000001n],
  [0x8000000000000000n, 4n, 0x1000000000000000000000000000000000000000000000000000000000000000n],
  [0x8000000000000001n, 4n, 0x1000000000000000800000000000000180000000000000020000000000000001n],
  [0xfffffffffffffffen, 4n, 0xfffffffffffffff80000000000000017ffffffffffffffe00000000000000010n],
  [0xffffffffffffffffn, 4n, 0xfffffffffffffffc0000000000000005fffffffffffffffc0000000000000001n],
  [0x10000000000000000n, 4n, 0x10000000000000000000000000000000000000000000000000000000000000000n],
  [0x10000000000000001n, 4n, 0x10000000000000004000000000000000600000000000000040000000000000001n],
  [-0x10000000000000001n, 31n, -0x1000000000000001f00000000000001d1000000000000118f0000000000007ae900000000000297b700000000000b3c190000000000281fc70000000000785f550000000001339e4b0000000002a4c2a500000000050bff3b000000000869540d000000000c4b2c13000000000fce5d3d0000000011e9e1230000000011e9e123000000000fce5d3d000000000c4b2c13000000000869540d00000000050bff3b0000000002a4c2a50000000001339e4b0000000000785f550000000000281fc700000000000b3c1900000000000297b70000000000007ae9000000000000118f00000000000001d1000000000000001f0000000000000001n],
  [-0x10000000000000000n, 31n, -0x10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [-0xffffffffffffffffn, 31n, -0xffffffffffffffe100000000000001d0ffffffffffffee710000000000007ae8fffffffffffd684900000000000b3c18ffffffffffd7e0390000000000785f54fffffffffecc61b50000000002a4c2a4fffffffffaf400c5000000000869540cfffffffff3b4d3ed000000000fce5d3cffffffffee161edd0000000011e9e122fffffffff031a2c3000000000c4b2c12fffffffff796abf300000000050bff3afffffffffd5b3d5b0000000001339e4affffffffff87a0ab0000000000281fc6fffffffffff4c3e700000000000297b6ffffffffffff8517000000000000118efffffffffffffe2f000000000000001effffffffffffffffn],
  [-0xfffffffffffffffen, 31n, -0xffffffffffffffc20000000000000743ffffffffffff7388000000000007ae8fffffffffffad09200000000002cf063fffffffffebf01c8000000000785f54fffffffffd98c36a000000000a930a93ffffffffd7a0062800000000869540cffffffffe769a7da000000003f3974f3ffffffff70b0f6e8000000011e9e122ffffffffe063458600000000312cb04bffffffffbcb55f980000000050bff3afffffffffab67ab60000000004ce792bfffffffffc3d0558000000000281fc6ffffffffffe987ce00000000000a5edbfffffffffffc28b800000000000118efffffffffffffc5e000000000000007bfffffffffffffff80000000n],
  [-0x8000000000000001n, 31n, -0x2000000000000007c0000000000000e8800000000000118f000000000000f5d200000000000a5edc000000000059e0c8000000000281fc70000000000f0beaa0000000004ce792c00000000152615280000000050bff3b0000000010d2a81a00000000312cb04c000000007e72e9e8000000011e9e1230000000023d3c246000000003f3974f4000000006259609800000000869540d000000000a17fe76000000000a930a9400000000099cf258000000000785f550000000000503f8e00000000002cf064000000000014bdb8000000000007ae9000000000000231e000000000000074400000000000000f8000000000000001n],
  [-0x8000000000000000n, 31n, -0x200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [-0x7fffffffffffffffn, 31n, -0x1ffffffffffffff840000000000000e87fffffffffffee71000000000000f5d1fffffffffff5a124000000000059e0c7fffffffffd7e0390000000000f0bea9fffffffffb3186d40000000015261527ffffffffaf400c50000000010d2a819ffffffffced34fb4000000007e72e9e7fffffffee161edd0000000023d3c245ffffffffc0c68b0c0000000062596097ffffffff796abf3000000000a17fe75fffffffff56cf56c00000000099cf257fffffffff87a0ab0000000000503f8dffffffffffd30f9c000000000014bdb7fffffffffff8517000000000000231dfffffffffffff8bc00000000000000f7fffffffffffffffn],
  [-0x7ffffffffffffffen, 31n, -0x1ffffffffffffff080000000000003a1ffffffffffff738800000000000f5d1ffffffffffeb4248000000000167831fffffffffebf01c8000000000f0bea9fffffffff6630da8000000005498549ffffffffd7a00628000000010d2a819ffffffff9da69f6800000001f9cba79ffffffff70b0f6e8000000023d3c245ffffffff818d1618000000018965825ffffffffbcb55f9800000000a17fe75ffffffffead9ead8000000002673c95fffffffffc3d0558000000000503f8dffffffffffa61f38000000000052f6dfffffffffffc28b800000000000231dfffffffffffff17800000000000003dfffffffffffffff80000000n],
  [-0x100000001n, 31n, -0x10000001f000001d10000118f00007ae9000297b7000b3c1900281fc700785f5501339e4b02a4c2a5050bff3b0869540d0c4b2c130fce5d3d11e9e12311e9e1230fce5d3d0c4b2c130869540d050bff3b02a4c2a501339e4b00785f5500281fc7000b3c19000297b700007ae90000118f000001d10000001f00000001n],
  [-0x100000000n, 31n, -0x100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [-0xffffffffn, 31n, -0xffffffe1000001d0ffffee7100007ae8fffd6849000b3c18ffd7e03900785f54fecc61b502a4c2a4faf400c50869540cf3b4d3ed0fce5d3cee161edd11e9e122f031a2c30c4b2c12f796abf3050bff3afd5b3d5b01339e4aff87a0ab00281fc6fff4c3e7000297b6ffff85170000118efffffe2f0000001effffffffn],
  [-0xfffffffen, 31n, -0xffffffc200000743ffff73880007ae8fffad092002cf063febf01c80785f54fd98c36a0a930a93d7a00628869540ce769a7da3f3974f370b0f6e91e9e122e0634586312cb04bbcb55f9850bff3afab67ab604ce792bfc3d05580281fc6ffe987ce000a5edbfffc28b8000118efffffc5e0000007bfffffff80000000n],
  [-0x80000001n, 31n, -0x20000007c00000e88000118f0000f5d2000a5edc0059e0c80281fc700f0beaa04ce792c1526152850bff3b10d2a81a312cb04c7e72e9e91e9e12323d3c2463f3974f462596098869540d0a17fe760a930a94099cf2580785f5500503f8e002cf0640014bdb80007ae90000231e00000744000000f80000001n],
  [-0x80000000n, 31n, -0x2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [-0x7fffffffn, 31n, -0x1ffffff8400000e87fffee710000f5d1fff5a1240059e0c7fd7e03900f0bea9fb3186d415261527af400c510d2a819ced34fb47e72e9e6e161edd23d3c245c0c68b0c62596097796abf30a17fe75f56cf56c099cf257f87a0ab00503f8dffd30f9c0014bdb7fff85170000231dfffff8bc000000f7fffffffn],
  [-0x7ffffffen, 31n, -0x1ffffff0800003a1ffff7388000f5d1ffeb42480167831febf01c80f0bea9f6630da85498549d7a006290d2a8199da69f69f9cba7970b0f6ea3d3c245818d16198965825bcb55f98a17fe75ead9ead82673c95fc3d05580503f8dffa61f380052f6dfffc28b8000231dfffff178000003dfffffff80000000n],
  [-9n, 31n, -0x4d0c24c65465ae7f329f1a339n],
  [-8n, 31n, -0x200000000000000000000000n],
  [-7n, 31n, -0x82823c992d2be80fcb9ab7n],
  [-6n, 31n, -0x118e2a5afb51580000000n],
  [-5n, 31n, -0xfc6f7c40458122964dn],
  [-4n, 31n, -0x4000000000000000n],
  [-3n, 31n, -0x231c54b5f6a2bn],
  [-2n, 31n, -0x80000000n],
  [-1n, 31n, -1n],
  [0n, 31n, 0n],
  [1n, 31n, 1n],
  [2n, 31n, 0x80000000n],
  [3n, 31n, 0x231c54b5f6a2bn],
  [4n, 31n, 0x4000000000000000n],
  [5n, 31n, 0xfc6f7c40458122964dn],
  [6n, 31n, 0x118e2a5afb51580000000n],
  [7n, 31n, 0x82823c992d2be80fcb9ab7n],
  [8n, 31n, 0x200000000000000000000000n],
  [9n, 31n, 0x4d0c24c65465ae7f329f1a339n],
  [0x7ffffffen, 31n, 0x1ffffff0800003a1ffff7388000f5d1ffeb42480167831febf01c80f0bea9f6630da85498549d7a006290d2a8199da69f69f9cba7970b0f6ea3d3c245818d16198965825bcb55f98a17fe75ead9ead82673c95fc3d05580503f8dffa61f380052f6dfffc28b8000231dfffff178000003dfffffff80000000n],
  [0x7fffffffn, 31n, 0x1ffffff8400000e87fffee710000f5d1fff5a1240059e0c7fd7e03900f0bea9fb3186d415261527af400c510d2a819ced34fb47e72e9e6e161edd23d3c245c0c68b0c62596097796abf30a17fe75f56cf56c099cf257f87a0ab00503f8dffd30f9c0014bdb7fff85170000231dfffff8bc000000f7fffffffn],
  [0x80000000n, 31n, 0x2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [0x80000001n, 31n, 0x20000007c00000e88000118f0000f5d2000a5edc0059e0c80281fc700f0beaa04ce792c1526152850bff3b10d2a81a312cb04c7e72e9e91e9e12323d3c2463f3974f462596098869540d0a17fe760a930a94099cf2580785f5500503f8e002cf0640014bdb80007ae90000231e00000744000000f80000001n],
  [0xfffffffen, 31n, 0xffffffc200000743ffff73880007ae8fffad092002cf063febf01c80785f54fd98c36a0a930a93d7a00628869540ce769a7da3f3974f370b0f6e91e9e122e0634586312cb04bbcb55f9850bff3afab67ab604ce792bfc3d05580281fc6ffe987ce000a5edbfffc28b8000118efffffc5e0000007bfffffff80000000n],
  [0xffffffffn, 31n, 0xffffffe1000001d0ffffee7100007ae8fffd6849000b3c18ffd7e03900785f54fecc61b502a4c2a4faf400c50869540cf3b4d3ed0fce5d3cee161edd11e9e122f031a2c30c4b2c12f796abf3050bff3afd5b3d5b01339e4aff87a0ab00281fc6fff4c3e7000297b6ffff85170000118efffffe2f0000001effffffffn],
  [0x100000000n, 31n, 0x100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [0x100000001n, 31n, 0x10000001f000001d10000118f00007ae9000297b7000b3c1900281fc700785f5501339e4b02a4c2a5050bff3b0869540d0c4b2c130fce5d3d11e9e12311e9e1230fce5d3d0c4b2c130869540d050bff3b02a4c2a501339e4b00785f5500281fc7000b3c19000297b700007ae90000118f000001d10000001f00000001n],
  [0x7ffffffffffffffen, 31n, 0x1ffffffffffffff080000000000003a1ffffffffffff738800000000000f5d1ffffffffffeb4248000000000167831fffffffffebf01c8000000000f0bea9fffffffff6630da8000000005498549ffffffffd7a00628000000010d2a819ffffffff9da69f6800000001f9cba79ffffffff70b0f6e8000000023d3c245ffffffff818d1618000000018965825ffffffffbcb55f9800000000a17fe75ffffffffead9ead8000000002673c95fffffffffc3d0558000000000503f8dffffffffffa61f38000000000052f6dfffffffffffc28b800000000000231dfffffffffffff17800000000000003dfffffffffffffff80000000n],
  [0x7fffffffffffffffn, 31n, 0x1ffffffffffffff840000000000000e87fffffffffffee71000000000000f5d1fffffffffff5a124000000000059e0c7fffffffffd7e0390000000000f0bea9fffffffffb3186d40000000015261527ffffffffaf400c50000000010d2a819ffffffffced34fb4000000007e72e9e7fffffffee161edd0000000023d3c245ffffffffc0c68b0c0000000062596097ffffffff796abf3000000000a17fe75fffffffff56cf56c00000000099cf257fffffffff87a0ab0000000000503f8dffffffffffd30f9c000000000014bdb7fffffffffff8517000000000000231dfffffffffffff8bc00000000000000f7fffffffffffffffn],
  [0x8000000000000000n, 31n, 0x200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [0x8000000000000001n, 31n, 0x2000000000000007c0000000000000e8800000000000118f000000000000f5d200000000000a5edc000000000059e0c8000000000281fc70000000000f0beaa0000000004ce792c00000000152615280000000050bff3b0000000010d2a81a00000000312cb04c000000007e72e9e8000000011e9e1230000000023d3c246000000003f3974f4000000006259609800000000869540d000000000a17fe76000000000a930a9400000000099cf258000000000785f550000000000503f8e00000000002cf064000000000014bdb8000000000007ae9000000000000231e000000000000074400000000000000f8000000000000001n],
  [0xfffffffffffffffen, 31n, 0xffffffffffffffc20000000000000743ffffffffffff7388000000000007ae8fffffffffffad09200000000002cf063fffffffffebf01c8000000000785f54fffffffffd98c36a000000000a930a93ffffffffd7a0062800000000869540cffffffffe769a7da000000003f3974f3ffffffff70b0f6e8000000011e9e122ffffffffe063458600000000312cb04bffffffffbcb55f980000000050bff3afffffffffab67ab60000000004ce792bfffffffffc3d0558000000000281fc6ffffffffffe987ce00000000000a5edbfffffffffffc28b800000000000118efffffffffffffc5e000000000000007bfffffffffffffff80000000n],
  [0xffffffffffffffffn, 31n, 0xffffffffffffffe100000000000001d0ffffffffffffee710000000000007ae8fffffffffffd684900000000000b3c18ffffffffffd7e0390000000000785f54fffffffffecc61b50000000002a4c2a4fffffffffaf400c5000000000869540cfffffffff3b4d3ed000000000fce5d3cffffffffee161edd0000000011e9e122fffffffff031a2c3000000000c4b2c12fffffffff796abf300000000050bff3afffffffffd5b3d5b0000000001339e4affffffffff87a0ab0000000000281fc6fffffffffff4c3e700000000000297b6ffffffffffff8517000000000000118efffffffffffffe2f000000000000001effffffffffffffffn],
  [0x10000000000000000n, 31n, 0x10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [0x10000000000000001n, 31n, 0x1000000000000001f00000000000001d1000000000000118f0000000000007ae900000000000297b700000000000b3c190000000000281fc70000000000785f550000000001339e4b0000000002a4c2a500000000050bff3b000000000869540d000000000c4b2c13000000000fce5d3d0000000011e9e1230000000011e9e123000000000fce5d3d000000000c4b2c13000000000869540d00000000050bff3b0000000002a4c2a50000000001339e4b0000000000785f550000000000281fc700000000000b3c1900000000000297b70000000000007ae9000000000000118f00000000000001d1000000000000001f0000000000000001n],
  [-0x10000000000000001n, 32n, 0x1000000000000002000000000000001f000000000000013600000000000008c7800000000000312a000000000000dd3d00000000000335be00000000000a07f1c0000000001abfda00000000003d860f00000000007b0c1e0000000000d7553480000000014b48020000000001c1989500000000021b83e600000000023d3c2460000000021b83e60000000001c1989500000000014b48020000000000d7553480000000007b0c1e00000000003d860f00000000001abfda00000000000a07f1c0000000000335be000000000000dd3d000000000000312a00000000000008c78000000000000136000000000000001f000000000000000200000000000000001n],
  [-0x10000000000000000n, 32n, 0x100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [-0xffffffffffffffffn, 32n, 0xffffffffffffffe000000000000001efffffffffffffeca00000000000008c77fffffffffffced6000000000000dd3cfffffffffffcca4200000000000a07f1bfffffffffe5402600000000003d860effffffffff84f3e20000000000d755347ffffffffeb4b7fe0000000001c19894fffffffffde47c1a00000000023d3c245ffffffffde47c1a0000000001c19894fffffffffeb4b7fe0000000000d755347fffffffff84f3e200000000003d860effffffffffe5402600000000000a07f1bffffffffffcca42000000000000dd3cffffffffffffced600000000000008c77ffffffffffffeca000000000000001efffffffffffffffe00000000000000001n],
  [-0xfffffffffffffffen, 32n, 0xffffffffffffffc000000000000007bfffffffffffff6500000000000008c77fffffffffff9dac00000000000374f3ffffffffffe652100000000000a07f1bfffffffffca804c0000000000f6183bfffffffffc279f10000000000d755347ffffffffd696ffc0000000007066253ffffffffef23e0d00000000023d3c245ffffffffbc8f8340000000007066253fffffffff5a5bff0000000000d755347fffffffff09e7c40000000000f6183bffffffffff2a01300000000000a07f1bffffffffff9948400000000000374f3fffffffffffe76b00000000000008c77ffffffffffffd94000000000000007bfffffffffffffff0000000000000000100000000n],
  [-0x8000000000000001n, 32n, 0x1000000000000004000000000000007c00000000000009b00000000000008c7800000000000625400000000000374f4000000000019adf00000000000a07f1c000000000357fb40000000000f6183c0000000003d860f0000000000d75534800000000296900400000000070662540000000010dc1f300000000023d3c2460000000043707cc0000000007066254000000000a5a4010000000000d755348000000000f6183c0000000000f6183c0000000000d5fed00000000000a07f1c000000000066b7c00000000000374f400000000000189500000000000008c7800000000000026c000000000000007c00000000000000100000000000000001n],
  [-0x8000000000000000n, 32n, 0x1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [-0x7fffffffffffffffn, 32n, 0xffffffffffffffc000000000000007bfffffffffffff6500000000000008c77fffffffffff9dac00000000000374f3ffffffffffe652100000000000a07f1bfffffffffca804c0000000000f6183bfffffffffc279f10000000000d755347ffffffffd696ffc0000000007066253ffffffffef23e0d00000000023d3c245ffffffffbc8f8340000000007066253fffffffff5a5bff0000000000d755347fffffffff09e7c40000000000f6183bffffffffff2a01300000000000a07f1bffffffffff9948400000000000374f3fffffffffffe76b00000000000008c77ffffffffffffd94000000000000007bfffffffffffffff00000000000000001n],
  [-0x7ffffffffffffffen, 32n, 0xffffffffffffff800000000000001efffffffffffffb280000000000008c77fffffffffff3b5800000000000dd3cfffffffffff329080000000000a07f1bfffffffff9500980000000003d860efffffffffe13cf88000000000d755347ffffffffad2dff8000000001c19894fffffffff791f0680000000023d3c245ffffffff791f068000000001c19894fffffffffad2dff8000000000d755347ffffffffe13cf880000000003d860effffffffff9500980000000000a07f1bffffffffff3290800000000000dd3cffffffffffff3b580000000000008c77ffffffffffffb2800000000000001efffffffffffffff8000000000000000100000000n],
  [-0x100000001n, 32n, 0x100000020000001f00000136000008c78000312a0000dd3d000335be000a07f1c01abfda003d860f007b0c1e00d75534814b480201c19895021b83e6023d3c24621b83e601c19895014b480200d75534807b0c1e003d860f001abfda000a07f1c00335be0000dd3d0000312a000008c7800001360000001f00000002000000001n],
  [-0x100000000n, 32n, 0x10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [-0xffffffffn, 32n, 0xffffffe0000001efffffeca000008c77fffced60000dd3cfffcca42000a07f1bfe54026003d860eff84f3e200d755347eb4b7fe01c19894fde47c1a023d3c245de47c1a01c19894feb4b7fe00d755347f84f3e2003d860effe54026000a07f1bffcca420000dd3cffffced6000008c77ffffeca0000001efffffffe000000001n],
  [-0xfffffffen, 32n, 0xffffffc0000007bfffff65000008c77fff9dac000374f3ffe6521000a07f1bfca804c00f6183bfc279f100d755347d696ffc07066253ef23e0d023d3c245bc8f83407066253f5a5bff00d755347f09e7c400f6183bff2a013000a07f1bff99484000374f3fffe76b000008c77ffffd940000007bfffffff00000000100000000n],
  [-0x80000001n, 32n, 0x100000040000007c000009b000008c780006254000374f40019adf000a07f1c0357fb400f6183c03d860f00d75534829690040706625410dc1f3023d3c24643707cc070662540a5a40100d7553480f6183c00f6183c00d5fed000a07f1c0066b7c000374f40001895000008c78000026c0000007c0000001000000001n],
  [-0x80000000n, 32n, 0x100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [-0x7fffffffn, 32n, 0xffffffc0000007bfffff65000008c77fff9dac000374f3ffe6521000a07f1bfca804c00f6183bfc279f100d755347d696ffc07066253ef23e0d023d3c245bc8f83407066253f5a5bff00d755347f09e7c400f6183bff2a013000a07f1bff99484000374f3fffe76b000008c77ffffd940000007bfffffff000000001n],
  [-0x7ffffffen, 32n, 0xffffff8000001efffffb2800008c77fff3b58000dd3cfff3290800a07f1bf95009803d860efe13cf880d755347ad2dff81c19894f791f06823d3c245791f0681c19894fad2dff80d755347e13cf8803d860eff95009800a07f1bff32908000dd3cffff3b5800008c77ffffb28000001efffffff80000000100000000n],
  [-9n, 32n, 0x2b56d4af8f7932278c797ebd01n],
  [-8n, 32n, 0x1000000000000000000000000n],
  [-7n, 32n, 0x3918fa8303c33586e913b01n],
  [-6n, 32n, 0x6954fe21e3e8100000000n],
  [-5n, 32n, 0x4ee2d6d415b85acef81n],
  [-4n, 32n, 0x10000000000000000n],
  [-3n, 32n, 0x6954fe21e3e81n],
  [-2n, 32n, 0x100000000n],
  [-1n, 32n, 1n],
  [0n, 32n, 0n],
  [1n, 32n, 1n],
  [2n, 32n, 0x100000000n],
  [3n, 32n, 0x6954fe21e3e81n],
  [4n, 32n, 0x10000000000000000n],
  [5n, 32n, 0x4ee2d6d415b85acef81n],
  [6n, 32n, 0x6954fe21e3e8100000000n],
  [7n, 32n, 0x3918fa8303c33586e913b01n],
  [8n, 32n, 0x1000000000000000000000000n],
  [9n, 32n, 0x2b56d4af8f7932278c797ebd01n],
  [0x7ffffffen, 32n, 0xffffff8000001efffffb2800008c77fff3b58000dd3cfff3290800a07f1bf95009803d860efe13cf880d755347ad2dff81c19894f791f06823d3c245791f0681c19894fad2dff80d755347e13cf8803d860eff95009800a07f1bff32908000dd3cffff3b5800008c77ffffb28000001efffffff80000000100000000n],
  [0x7fffffffn, 32n, 0xffffffc0000007bfffff65000008c77fff9dac000374f3ffe6521000a07f1bfca804c00f6183bfc279f100d755347d696ffc07066253ef23e0d023d3c245bc8f83407066253f5a5bff00d755347f09e7c400f6183bff2a013000a07f1bff99484000374f3fffe76b000008c77ffffd940000007bfffffff000000001n],
  [0x80000000n, 32n, 0x100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [0x80000001n, 32n, 0x100000040000007c000009b000008c780006254000374f40019adf000a07f1c0357fb400f6183c03d860f00d75534829690040706625410dc1f3023d3c24643707cc070662540a5a40100d7553480f6183c00f6183c00d5fed000a07f1c0066b7c000374f40001895000008c78000026c0000007c0000001000000001n],
  [0xfffffffen, 32n, 0xffffffc0000007bfffff65000008c77fff9dac000374f3ffe6521000a07f1bfca804c00f6183bfc279f100d755347d696ffc07066253ef23e0d023d3c245bc8f83407066253f5a5bff00d755347f09e7c400f6183bff2a013000a07f1bff99484000374f3fffe76b000008c77ffffd940000007bfffffff00000000100000000n],
  [0xffffffffn, 32n, 0xffffffe0000001efffffeca000008c77fffced60000dd3cfffcca42000a07f1bfe54026003d860eff84f3e200d755347eb4b7fe01c19894fde47c1a023d3c245de47c1a01c19894feb4b7fe00d755347f84f3e2003d860effe54026000a07f1bffcca420000dd3cffffced6000008c77ffffeca0000001efffffffe000000001n],
  [0x100000000n, 32n, 0x10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [0x100000001n, 32n, 0x100000020000001f00000136000008c78000312a0000dd3d000335be000a07f1c01abfda003d860f007b0c1e00d75534814b480201c19895021b83e6023d3c24621b83e601c19895014b480200d75534807b0c1e003d860f001abfda000a07f1c00335be0000dd3d0000312a000008c7800001360000001f00000002000000001n],
  [0x7ffffffffffffffen, 32n, 0xffffffffffffff800000000000001efffffffffffffb280000000000008c77fffffffffff3b5800000000000dd3cfffffffffff329080000000000a07f1bfffffffff9500980000000003d860efffffffffe13cf88000000000d755347ffffffffad2dff8000000001c19894fffffffff791f0680000000023d3c245ffffffff791f068000000001c19894fffffffffad2dff8000000000d755347ffffffffe13cf880000000003d860effffffffff9500980000000000a07f1bffffffffff3290800000000000dd3cffffffffffff3b580000000000008c77ffffffffffffb2800000000000001efffffffffffffff8000000000000000100000000n],
  [0x7fffffffffffffffn, 32n, 0xffffffffffffffc000000000000007bfffffffffffff6500000000000008c77fffffffffff9dac00000000000374f3ffffffffffe652100000000000a07f1bfffffffffca804c0000000000f6183bfffffffffc279f10000000000d755347ffffffffd696ffc0000000007066253ffffffffef23e0d00000000023d3c245ffffffffbc8f8340000000007066253fffffffff5a5bff0000000000d755347fffffffff09e7c40000000000f6183bffffffffff2a01300000000000a07f1bffffffffff9948400000000000374f3fffffffffffe76b00000000000008c77ffffffffffffd94000000000000007bfffffffffffffff00000000000000001n],
  [0x8000000000000000n, 32n, 0x1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [0x8000000000000001n, 32n, 0x1000000000000004000000000000007c00000000000009b00000000000008c7800000000000625400000000000374f4000000000019adf00000000000a07f1c000000000357fb40000000000f6183c0000000003d860f0000000000d75534800000000296900400000000070662540000000010dc1f300000000023d3c2460000000043707cc0000000007066254000000000a5a4010000000000d755348000000000f6183c0000000000f6183c0000000000d5fed00000000000a07f1c000000000066b7c00000000000374f400000000000189500000000000008c7800000000000026c000000000000007c00000000000000100000000000000001n],
  [0xfffffffffffffffen, 32n, 0xffffffffffffffc000000000000007bfffffffffffff6500000000000008c77fffffffffff9dac00000000000374f3ffffffffffe652100000000000a07f1bfffffffffca804c0000000000f6183bfffffffffc279f10000000000d755347ffffffffd696ffc0000000007066253ffffffffef23e0d00000000023d3c245ffffffffbc8f8340000000007066253fffffffff5a5bff0000000000d755347fffffffff09e7c40000000000f6183bffffffffff2a01300000000000a07f1bffffffffff9948400000000000374f3fffffffffffe76b00000000000008c77ffffffffffffd94000000000000007bfffffffffffffff0000000000000000100000000n],
  [0xffffffffffffffffn, 32n, 0xffffffffffffffe000000000000001efffffffffffffeca00000000000008c77fffffffffffced6000000000000dd3cfffffffffffcca4200000000000a07f1bfffffffffe5402600000000003d860effffffffff84f3e20000000000d755347ffffffffeb4b7fe0000000001c19894fffffffffde47c1a00000000023d3c245ffffffffde47c1a0000000001c19894fffffffffeb4b7fe0000000000d755347fffffffff84f3e200000000003d860effffffffffe5402600000000000a07f1bffffffffffcca42000000000000dd3cffffffffffffced600000000000008c77ffffffffffffeca000000000000001efffffffffffffffe00000000000000001n],
  [0x10000000000000000n, 32n, 0x100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [0x10000000000000001n, 32n, 0x1000000000000002000000000000001f000000000000013600000000000008c7800000000000312a000000000000dd3d00000000000335be00000000000a07f1c0000000001abfda00000000003d860f00000000007b0c1e0000000000d7553480000000014b48020000000001c1989500000000021b83e600000000023d3c2460000000021b83e60000000001c1989500000000014b48020000000000d7553480000000007b0c1e00000000003d860f00000000001abfda00000000000a07f1c0000000000335be000000000000dd3d000000000000312a00000000000008c78000000000000136000000000000001f000000000000000200000000000000001n],
  [-0x10000000000000001n, 63n, -0x1000000000000003f00000000000007a10000000000009b1f00000000000916d100000000006b406f00000000040cc4310000000020fa3d8f00000000e6d7aee90000000582b449570000001dc1cd8c090000008f5ff5a2b70000026d4a7dc119000009855f4fce2700002200e6af4df900006f1402a30fc700014d3c07e92f550003994b9d6691eb0009326be79458750015c842ee953d4b002febc6734853a500621fbaec0e009b00bb53d937037585014dee83358bbb3b022c8d85593e380d036438eebe6b4d3304f4f0bf6512faad06caeb193ea83b1308bbc08e2bfcde3d0a8a52534f924a030bf2190915ea0f9d0cb764f927d821230cb764f927d821230bf2190915ea0f9d0a8a52534f924a0308bbc08e2bfcde3d06caeb193ea83b1304f4f0bf6512faad036438eebe6b4d33022c8d85593e380d014dee83358bbb3b00bb53d93703758500621fbaec0e009b002febc6734853a50015c842ee953d4b0009326be79458750003994b9d6691eb00014d3c07e92f5500006f1402a30fc700002200e6af4df9000009855f4fce270000026d4a7dc1190000008f5ff5a2b70000001dc1cd8c090000000582b4495700000000e6d7aee90000000020fa3d8f00000000040cc43100000000006b406f00000000000916d10000000000009b1f00000000000007a1000000000000003f0000000000000001n],
  [-0x10000000000000000n, 63n, -0x1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [-0xffffffffffffffffn, 63n, -0xffffffffffffffc100000000000007a0ffffffffffff64e100000000000916d0ffffffffff94bf9100000000040cc430ffffffffdf05c27100000000e6d7aee8fffffffa7d4bb6a90000001dc1cd8c08ffffff70a00a5d490000026d4a7dc118fffff67aa0b031d900002200e6af4df8ffff90ebfd5cf03900014d3c07e92f54fffc66b462996e150009326be7945874ffea37bd116ac2b5002febc6734853a4ff9de04513f1ff6500bb53d937037584feb2117cca7444c5022c8d85593e380cfc9bc7114194b2cd04f4f0bf6512faacf93514e6c157c4ed08bbc08e2bfcde3cf575adacb06db5fd0bf2190915ea0f9cf3489b06d827dedd0cb764f927d82122f40de6f6ea15f0630a8a52534f924a02f7443f71d40321c306caeb193ea83b12fb0b0f409aed0553036438eebe6b4d32fdd3727aa6c1c7f3014dee83358bbb3aff44ac26c8fc8a7b00621fbaec0e009affd014398cb7ac5b0015c842ee953d4afff6cd94186ba78b0003994b9d6691eafffeb2c3f816d0ab00006f1402a30fc6ffffddff1950b207000009855f4fce26fffffd92b5823ee70000008f5ff5a2b6ffffffe23e3273f70000000582b44956ffffffff192851170000000020fa3d8efffffffffbf33bcf00000000006b406efffffffffff6e92f0000000000009b1efffffffffffff85f000000000000003effffffffffffffffn],
  [-0xfffffffffffffffen, 63n, -0xffffffffffffff820000000000001e83fffffffffffb27080000000000916d0ffffffffff297f2200000000103310c3fffffffef82e13880000000e6d7aee8fffffff4fa976d520000007707363023fffffb850052ea48000026d4a7dc118ffffecf5416063b2000088039abd37e3fffc875feae781c80014d3c07e92f54fff8cd68c532dc2a0024c9af9e5161d3ff51bde88b5615a802febc6734853a4ff3bc08a27e3feca02ed4f64dc0dd613f5908be653a2262822c8d85593e380cf9378e228329659a13d3c2fd944beab3c9a8a7360abe27688bbc08e2bfcde3ceaeb5b5960db6bfa2fc8642457a83e739a44d836c13ef6e8cb764f927d82122e81bcdedd42be0c62a29494d3e49280bba21fb8ea0190e186caeb193ea83b12f6161e8135da0aa60d90e3baf9ad34cbee9b93d5360e3f9814dee83358bbb3afe89584d91f914f601887eebb038026bfe80a1cc65bd62d8015c842ee953d4affed9b2830d74f16000e652e759a47abfff5961fc0b685580006f1402a30fc6ffffbbfe32a1640e000026157d3f389bffffec95ac11f738000008f5ff5a2b6ffffffc47c64e7ee000000160ad1255bfffffff8c94288b8000000020fa3d8efffffffff7e6779e0000000001ad01bbffffffffffb74978000000000009b1efffffffffffff0be00000000000000fbfffffffffffffff8000000000000000n],
  [-0x8000000000000001n, 63n, -0x200000000000000fc0000000000003d08000000000009b1f0000000000122da20000000001ad01bc0000000020662188000000020fa3d8f00000001cdaf5dd2000000160ad1255c000000ee0e6c6048000008f5ff5a2b7000004da94fb8232000026157d3f389c00011007357a6fc80006f1402a30fc700029a780fd25eaa000e652e759a47ac0049935f3ca2c3a8015c842ee953d4b005fd78ce690a74a01887eebb038026c05da9ec9b81bac2814dee83358bbb3b04591b0ab27c701a0d90e3baf9ad34cc27a785fb2897d5686caeb193ea83b131177811c57f9bc7a2a29494d3e49280c5f90c848af507ce8cb764f927d82123196ec9f24fb042462fc8642457a83e745452929a7c9250188bbc08e2bfcde3d0d95d6327d50762613d3c2fd944beab41b21c775f35a699822c8d85593e380d029bdd066b17767602ed4f64dc0dd6140310fdd7607004d802febc6734853a5002b9085dd2a7a960024c9af9e5161d4001cca5ceb348f580014d3c07e92f550000de2805461f8e000088039abd37e400004c2afa7e7138000026d4a7dc1190000011ebfeb456e00000077073630240000002c15a24ab80000000e6d7aee90000000041f47b1e00000000103310c400000000035a03780000000000916d1000000000001363e0000000000001e8400000000000001f8000000000000001n],
  [-0x8000000000000000n, 63n, -0x200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [-0x7fffffffffffffffn, 63n, -0x1ffffffffffffff040000000000003d07fffffffffff64e10000000000122da1fffffffffe52fe440000000020662187fffffffdf05c27100000001cdaf5dd1ffffffe9f52edaa4000000ee0e6c6047fffff70a00a5d49000004da94fb8231ffffd9ea82c0c76400011007357a6fc7fff90ebfd5cf03900029a780fd25ea9fff19ad18a65b8540049935f3ca2c3a7fea37bd116ac2b5005fd78ce690a749fe7781144fc7fd9405da9ec9b81bac27eb2117cca7444c504591b0ab27c7019f26f1c450652cb3427a785fb2897d56793514e6c157c4ed1177811c57f9bc79d5d6b6b2c1b6d7f45f90c848af507ce73489b06d827dedd196ec9f24fb04245d0379bdba857c18c5452929a7c9250177443f71d40321c30d95d6327d507625ec2c3d026bb4154c1b21c775f35a6997dd3727aa6c1c7f3029bdd066b177675fd12b09b23f229ec0310fdd7607004d7fd014398cb7ac5b002b9085dd2a7a95ffdb365061ae9e2c001cca5ceb348f57ffeb2c3f816d0ab0000de2805461f8dffff77fc6542c81c00004c2afa7e7137ffffd92b5823ee70000011ebfeb456dffffff88f8c9cfdc0000002c15a24ab7fffffff192851170000000041f47b1dffffffffefccef3c00000000035a0377ffffffffff6e92f000000000001363dffffffffffffe17c00000000000001f7fffffffffffffffn],
  [-0x7ffffffffffffffen, 63n, -0x1fffffffffffffe08000000000000f41fffffffffffb2708000000000122da1fffffffffca5fc88000000008198861fffffffef82e13880000001cdaf5dd1ffffffd3ea5db548000003b839b1811fffffb850052ea4800004da94fb8231ffffb3d505818ec80004401cd5e9bf1fffc875feae781c80029a780fd25ea9ffe335a314cb70a801264d7cf28b0e9ff51bde88b5615a805fd78ce690a749fcef02289f8ffb28176a7b26e06eb09f5908be653a226284591b0ab27c7019e4de388a0ca596689e9e17eca25f559c9a8a7360abe2769177811c57f9bc79abad6d65836dafe97e432122bd41f399a44d836c13ef6e996ec9f24fb04245a06f37b750af8319514a4a69f249405ba21fb8ea0190e18d95d6327d507625d8587a04d7682a986c871dd7cd69a65ee9b93d5360e3f9829bdd066b177675fa25613647e453d80c43f75d81c0135fe80a1cc65bd62d802b9085dd2a7a95ffb66ca0c35d3c5800732973acd23d5fff5961fc0b68558000de2805461f8dfffeeff8ca859038000130abe9f9c4dffffec95ac11f738000011ebfeb456dffffff11f1939fb8000000b056892adfffffff8c94288b8000000041f47b1dffffffffdf99de78000000000d680ddffffffffffb7497800000000001363dffffffffffffc2f800000000000007dfffffffffffffff8000000000000000n],
  [-0x100000001n, 63n, -0x10000003f000007a100009b1f000916d1006b406f040cc43120fa3d8fe6d7aeee82b44974c1cd8c985ff5a5244a7dca9e5f4ff027e6afbd0d02a45d0307ecc8a09d6fc456e7aa20b7eec5291173aa735fecc954743851640837b848c05ca270fbc3603df26bdde5c64763fba1368730905b84630c22a17496348f861c33ca3a2c207461f0584e0a9132c7c956439d2bd26877339bc097dab85a8c269036470f143765953fec3dec61735e1be7ee9e6fb6e797f1c09d67df2707e99e6902a331c7e6af577e5f4fd0944a7dc1a85ff5a2d4c1cd8c0e82b44957e6d7aee920fa3d8f040cc431006b406f000916d100009b1f000007a10000003f00000001n],
  [-0x100000000n, 63n, -0x1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [-0xffffffffn, 63n, -0xffffffc1000007a0ffff64e1000916d0ff94bf91040cc430df05c271e6d7aee37d4bb6c6c1cd8b79a00a5fb64a7db793a0b053d9e6aedee4fd5e3d7507e5960962a2a080e77e9032119aae7b72e633ea14ad533e35b58701cca0d24a55d9ff1e4689a38c5e480f93ca13857b21728be9bc5fcf060932aaa3e4df43d61be60819f4a042b646d68974dace0cdc39b34a539e513e41bc3ebfada80fb67634d06761c95eaa35ebde14d48ccd749dee8c0adf186f40d69d6544aef8173fbf02a2edc61950bb8c5f4fcbb9b5823f765ff5a2993e3273fc82b449561928511720fa3d8efbf33bcf006b406efff6e92f00009b1efffff85f0000003effffffffn],
  [-0xfffffffen, 63n, -0xffffff8200001e83fffb270800916d0ff297f22103310c2f82e13966d7aeddfa976dc907362ba90053111ca7dae0e4160ebb59ab9bf43eafc55887e1fcbdc557a5d99da31fbc8e54d20f284142f2ad14e2ed19e61fa766afe7d275c62f96fd28975df491ea967a30496e8399690a3d01df1ed16ab8cb54678ff3ef10fe552a12f86b239b0cc7bfab4be5994436aee60e848c8a14aed27cb4151388938193e1aeb8a4386719e706e82d87330e5b444758fddcbc0bd76982a2cbc532a18a237d3f2531ac12002dff5a27b7c64e8040ad12554c94288ba0fa3d8ef7e6779e01ad01bbffb749780009b1efffff0be000000fbfffffff8000000000000000n],
  [-0x80000001n, 63n, -0x2000000fc00003d080009b1f00122da201ad01bc2066218a0fa3d90cdaf5de80ad1264a0e6c693dff5a79194fba8477d4048a3358161082a5aa3f0fe0c3d875e3db0b3dff47d6ef514d7e8192635b612a135ccfa945b9e4d645c00d53d52154bac7954686fd01fbc2f822305c79dd9f0557ac6cc7c146eb157f78a66aabfad10f084e58fb992b46f91243923af6db22a162341edbda15136e04c5dadf1ed3eb636ec13f373e42add4f44459e6e2c30eb4963187ea0d7d0546a7919abd840efa7e980ca7dc237bfeb45e50736305015a24ac66d7aee941f47b1e103310c4035a037800916d10001363e00001e84000001f80000001n],
  [-0x80000000n, 63n, -0x200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [-0x7fffffffn, 63n, -0x1ffffff0400003d07fff64e100122da1fe52fe4420662185f05c272cdaf5dbbf52edb920e6c575200a622394fb5c1c82c1d76b35737e87d5f8ab10fc3f97b8aaf4bb33b463f791ca9a41e508285e55a29c5da33cc3f4ecd5fcfa4eb8c5f2dfa512ebbe923d52cf46092dd0732d2147a03be3da2d57196a8cf1fe7de21fcaa5425f0d64736198f7f5697cb32886d5dcc1d091914295da4f9682a2711270327c35d714870ce33ce0dd05b0e661cb6888eb1fbb97817aed30545978a65431446fa7e4a635824005bfeb44f6f8c9d00815a24aa9928511741f47b1defccef3c035a0377ff6e92f0001363dffffe17c000001f7fffffffn],
  [-0x7ffffffen, 63n, -0x1fffffe080000f41fffb27080122da1fca5fc888198860f82e13a4daf5da5ea5db90039b1397005337f14fb36070585cee4d5b2351eb112948fb5944d15f1be24e7a6ed291538e7637fa972b6fa764e39776f09933d6d175aa8a4ab43ae513ce9c91223639283a729e101b0d104618f772582b960701f79fea1f9cd7d9468f957976713d5a8f02b43ef486eb722e3b5fcc0ffe53cd7ac54284b3569ca30268766b35ce0e736c3d065cbac2b9f5c0c467d85450f86ca86c0e3e9f88e3ac120923feb447ff193a06856892a6c94288bc1f47b1ddf99de780d680ddffb74978001363dffffc2f8000007dfffffff8000000000000000n],
  [-9n, 63n, -0xd0b2c448fbd1250537195f2c63386319440e403b2ad680b839n],
  [-8n, 63n, -0x200000000000000000000000000000000000000000000000n],
  [-7n, 63n, -0x1d1bbb69c328a67bf5a6a36fb99bb2839ba41401ac7b7n],
  [-6n, 63n, -0x739237297e9885becbeea74d58000000000000000n],
  [-5n, 63n, -0x4dc9a61d998642bbb1e62afa4fc47597b9fcdn],
  [-4n, 63n, -0x40000000000000000000000000000000n],
  [-3n, 63n, -0xe7246e52fd310b7d97dd4e9abn],
  [-2n, 63n, -0x8000000000000000n],
  [-1n, 63n, -1n],
  [0n, 63n, 0n],
  [1n, 63n, 1n],
  [2n, 63n, 0x8000000000000000n],
  [3n, 63n, 0xe7246e52fd310b7d97dd4e9abn],
  [4n, 63n, 0x40000000000000000000000000000000n],
  [5n, 63n, 0x4dc9a61d998642bbb1e62afa4fc47597b9fcdn],
  [6n, 63n, 0x739237297e9885becbeea74d58000000000000000n],
  [7n, 63n, 0x1d1bbb69c328a67bf5a6a36fb99bb2839ba41401ac7b7n],
  [8n, 63n, 0x200000000000000000000000000000000000000000000000n],
  [9n, 63n, 0xd0b2c448fbd1250537195f2c63386319440e403b2ad680b839n],
  [0x7ffffffen, 63n, 0x1fffffe080000f41fffb27080122da1fca5fc888198860f82e13a4daf5da5ea5db90039b1397005337f14fb36070585cee4d5b2351eb112948fb5944d15f1be24e7a6ed291538e7637fa972b6fa764e39776f09933d6d175aa8a4ab43ae513ce9c91223639283a729e101b0d104618f772582b960701f79fea1f9cd7d9468f957976713d5a8f02b43ef486eb722e3b5fcc0ffe53cd7ac54284b3569ca30268766b35ce0e736c3d065cbac2b9f5c0c467d85450f86ca86c0e3e9f88e3ac120923feb447ff193a06856892a6c94288bc1f47b1ddf99de780d680ddffb74978001363dffffc2f8000007dfffffff8000000000000000n],
  [0x7fffffffn, 63n, 0x1ffffff0400003d07fff64e100122da1fe52fe4420662185f05c272cdaf5dbbf52edb920e6c575200a622394fb5c1c82c1d76b35737e87d5f8ab10fc3f97b8aaf4bb33b463f791ca9a41e508285e55a29c5da33cc3f4ecd5fcfa4eb8c5f2dfa512ebbe923d52cf46092dd0732d2147a03be3da2d57196a8cf1fe7de21fcaa5425f0d64736198f7f5697cb32886d5dcc1d091914295da4f9682a2711270327c35d714870ce33ce0dd05b0e661cb6888eb1fbb97817aed30545978a65431446fa7e4a635824005bfeb44f6f8c9d00815a24aa9928511741f47b1defccef3c035a0377ff6e92f0001363dffffe17c000001f7fffffffn],
  [0x80000000n, 63n, 0x200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [0x80000001n, 63n, 0x2000000fc00003d080009b1f00122da201ad01bc2066218a0fa3d90cdaf5de80ad1264a0e6c693dff5a79194fba8477d4048a3358161082a5aa3f0fe0c3d875e3db0b3dff47d6ef514d7e8192635b612a135ccfa945b9e4d645c00d53d52154bac7954686fd01fbc2f822305c79dd9f0557ac6cc7c146eb157f78a66aabfad10f084e58fb992b46f91243923af6db22a162341edbda15136e04c5dadf1ed3eb636ec13f373e42add4f44459e6e2c30eb4963187ea0d7d0546a7919abd840efa7e980ca7dc237bfeb45e50736305015a24ac66d7aee941f47b1e103310c4035a037800916d10001363e00001e84000001f80000001n],
  [0xfffffffen, 63n, 0xffffff8200001e83fffb270800916d0ff297f22103310c2f82e13966d7aeddfa976dc907362ba90053111ca7dae0e4160ebb59ab9bf43eafc55887e1fcbdc557a5d99da31fbc8e54d20f284142f2ad14e2ed19e61fa766afe7d275c62f96fd28975df491ea967a30496e8399690a3d01df1ed16ab8cb54678ff3ef10fe552a12f86b239b0cc7bfab4be5994436aee60e848c8a14aed27cb4151388938193e1aeb8a4386719e706e82d87330e5b444758fddcbc0bd76982a2cbc532a18a237d3f2531ac12002dff5a27b7c64e8040ad12554c94288ba0fa3d8ef7e6779e01ad01bbffb749780009b1efffff0be000000fbfffffff8000000000000000n],
  [0xffffffffn, 63n, 0xffffffc1000007a0ffff64e1000916d0ff94bf91040cc430df05c271e6d7aee37d4bb6c6c1cd8b79a00a5fb64a7db793a0b053d9e6aedee4fd5e3d7507e5960962a2a080e77e9032119aae7b72e633ea14ad533e35b58701cca0d24a55d9ff1e4689a38c5e480f93ca13857b21728be9bc5fcf060932aaa3e4df43d61be60819f4a042b646d68974dace0cdc39b34a539e513e41bc3ebfada80fb67634d06761c95eaa35ebde14d48ccd749dee8c0adf186f40d69d6544aef8173fbf02a2edc61950bb8c5f4fcbb9b5823f765ff5a2993e3273fc82b449561928511720fa3d8efbf33bcf006b406efff6e92f00009b1efffff85f0000003effffffffn],
  [0x100000000n, 63n, 0x1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [0x100000001n, 63n, 0x10000003f000007a100009b1f000916d1006b406f040cc43120fa3d8fe6d7aeee82b44974c1cd8c985ff5a5244a7dca9e5f4ff027e6afbd0d02a45d0307ecc8a09d6fc456e7aa20b7eec5291173aa735fecc954743851640837b848c05ca270fbc3603df26bdde5c64763fba1368730905b84630c22a17496348f861c33ca3a2c207461f0584e0a9132c7c956439d2bd26877339bc097dab85a8c269036470f143765953fec3dec61735e1be7ee9e6fb6e797f1c09d67df2707e99e6902a331c7e6af577e5f4fd0944a7dc1a85ff5a2d4c1cd8c0e82b44957e6d7aee920fa3d8f040cc431006b406f000916d100009b1f000007a10000003f00000001n],
  [0x7ffffffffffffffen, 63n, 0x1fffffffffffffe08000000000000f41fffffffffffb2708000000000122da1fffffffffca5fc88000000008198861fffffffef82e13880000001cdaf5dd1ffffffd3ea5db548000003b839b1811fffffb850052ea4800004da94fb8231ffffb3d505818ec80004401cd5e9bf1fffc875feae781c80029a780fd25ea9ffe335a314cb70a801264d7cf28b0e9ff51bde88b5615a805fd78ce690a749fcef02289f8ffb28176a7b26e06eb09f5908be653a226284591b0ab27c7019e4de388a0ca596689e9e17eca25f559c9a8a7360abe2769177811c57f9bc79abad6d65836dafe97e432122bd41f399a44d836c13ef6e996ec9f24fb04245a06f37b750af8319514a4a69f249405ba21fb8ea0190e18d95d6327d507625d8587a04d7682a986c871dd7cd69a65ee9b93d5360e3f9829bdd066b177675fa25613647e453d80c43f75d81c0135fe80a1cc65bd62d802b9085dd2a7a95ffb66ca0c35d3c5800732973acd23d5fff5961fc0b68558000de2805461f8dfffeeff8ca859038000130abe9f9c4dffffec95ac11f738000011ebfeb456dffffff11f1939fb8000000b056892adfffffff8c94288b8000000041f47b1dffffffffdf99de78000000000d680ddffffffffffb7497800000000001363dffffffffffffc2f800000000000007dfffffffffffffff8000000000000000n],
  [0x7fffffffffffffffn, 63n, 0x1ffffffffffffff040000000000003d07fffffffffff64e10000000000122da1fffffffffe52fe440000000020662187fffffffdf05c27100000001cdaf5dd1ffffffe9f52edaa4000000ee0e6c6047fffff70a00a5d49000004da94fb8231ffffd9ea82c0c76400011007357a6fc7fff90ebfd5cf03900029a780fd25ea9fff19ad18a65b8540049935f3ca2c3a7fea37bd116ac2b5005fd78ce690a749fe7781144fc7fd9405da9ec9b81bac27eb2117cca7444c504591b0ab27c7019f26f1c450652cb3427a785fb2897d56793514e6c157c4ed1177811c57f9bc79d5d6b6b2c1b6d7f45f90c848af507ce73489b06d827dedd196ec9f24fb04245d0379bdba857c18c5452929a7c9250177443f71d40321c30d95d6327d507625ec2c3d026bb4154c1b21c775f35a6997dd3727aa6c1c7f3029bdd066b177675fd12b09b23f229ec0310fdd7607004d7fd014398cb7ac5b002b9085dd2a7a95ffdb365061ae9e2c001cca5ceb348f57ffeb2c3f816d0ab0000de2805461f8dffff77fc6542c81c00004c2afa7e7137ffffd92b5823ee70000011ebfeb456dffffff88f8c9cfdc0000002c15a24ab7fffffff192851170000000041f47b1dffffffffefccef3c00000000035a0377ffffffffff6e92f000000000001363dffffffffffffe17c00000000000001f7fffffffffffffffn],
  [0x8000000000000000n, 63n, 0x200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [0x8000000000000001n, 63n, 0x200000000000000fc0000000000003d08000000000009b1f0000000000122da20000000001ad01bc0000000020662188000000020fa3d8f00000001cdaf5dd2000000160ad1255c000000ee0e6c6048000008f5ff5a2b7000004da94fb8232000026157d3f389c00011007357a6fc80006f1402a30fc700029a780fd25eaa000e652e759a47ac0049935f3ca2c3a8015c842ee953d4b005fd78ce690a74a01887eebb038026c05da9ec9b81bac2814dee83358bbb3b04591b0ab27c701a0d90e3baf9ad34cc27a785fb2897d5686caeb193ea83b131177811c57f9bc7a2a29494d3e49280c5f90c848af507ce8cb764f927d82123196ec9f24fb042462fc8642457a83e745452929a7c9250188bbc08e2bfcde3d0d95d6327d50762613d3c2fd944beab41b21c775f35a699822c8d85593e380d029bdd066b17767602ed4f64dc0dd6140310fdd7607004d802febc6734853a5002b9085dd2a7a960024c9af9e5161d4001cca5ceb348f580014d3c07e92f550000de2805461f8e000088039abd37e400004c2afa7e7138000026d4a7dc1190000011ebfeb456e00000077073630240000002c15a24ab80000000e6d7aee90000000041f47b1e00000000103310c400000000035a03780000000000916d1000000000001363e0000000000001e8400000000000001f8000000000000001n],
  [0xfffffffffffffffen, 63n, 0xffffffffffffff820000000000001e83fffffffffffb27080000000000916d0ffffffffff297f2200000000103310c3fffffffef82e13880000000e6d7aee8fffffff4fa976d520000007707363023fffffb850052ea48000026d4a7dc118ffffecf5416063b2000088039abd37e3fffc875feae781c80014d3c07e92f54fff8cd68c532dc2a0024c9af9e5161d3ff51bde88b5615a802febc6734853a4ff3bc08a27e3feca02ed4f64dc0dd613f5908be653a2262822c8d85593e380cf9378e228329659a13d3c2fd944beab3c9a8a7360abe27688bbc08e2bfcde3ceaeb5b5960db6bfa2fc8642457a83e739a44d836c13ef6e8cb764f927d82122e81bcdedd42be0c62a29494d3e49280bba21fb8ea0190e186caeb193ea83b12f6161e8135da0aa60d90e3baf9ad34cbee9b93d5360e3f9814dee83358bbb3afe89584d91f914f601887eebb038026bfe80a1cc65bd62d8015c842ee953d4affed9b2830d74f16000e652e759a47abfff5961fc0b685580006f1402a30fc6ffffbbfe32a1640e000026157d3f389bffffec95ac11f738000008f5ff5a2b6ffffffc47c64e7ee000000160ad1255bfffffff8c94288b8000000020fa3d8efffffffff7e6779e0000000001ad01bbffffffffffb74978000000000009b1efffffffffffff0be00000000000000fbfffffffffffffff8000000000000000n],
  [0xffffffffffffffffn, 63n, 0xffffffffffffffc100000000000007a0ffffffffffff64e100000000000916d0ffffffffff94bf9100000000040cc430ffffffffdf05c27100000000e6d7aee8fffffffa7d4bb6a90000001dc1cd8c08ffffff70a00a5d490000026d4a7dc118fffff67aa0b031d900002200e6af4df8ffff90ebfd5cf03900014d3c07e92f54fffc66b462996e150009326be7945874ffea37bd116ac2b5002febc6734853a4ff9de04513f1ff6500bb53d937037584feb2117cca7444c5022c8d85593e380cfc9bc7114194b2cd04f4f0bf6512faacf93514e6c157c4ed08bbc08e2bfcde3cf575adacb06db5fd0bf2190915ea0f9cf3489b06d827dedd0cb764f927d82122f40de6f6ea15f0630a8a52534f924a02f7443f71d40321c306caeb193ea83b12fb0b0f409aed0553036438eebe6b4d32fdd3727aa6c1c7f3014dee83358bbb3aff44ac26c8fc8a7b00621fbaec0e009affd014398cb7ac5b0015c842ee953d4afff6cd94186ba78b0003994b9d6691eafffeb2c3f816d0ab00006f1402a30fc6ffffddff1950b207000009855f4fce26fffffd92b5823ee70000008f5ff5a2b6ffffffe23e3273f70000000582b44956ffffffff192851170000000020fa3d8efffffffffbf33bcf00000000006b406efffffffffff6e92f0000000000009b1efffffffffffff85f000000000000003effffffffffffffffn],
  [0x10000000000000000n, 63n, 0x1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [0x10000000000000001n, 63n, 0x1000000000000003f00000000000007a10000000000009b1f00000000000916d100000000006b406f00000000040cc4310000000020fa3d8f00000000e6d7aee90000000582b449570000001dc1cd8c090000008f5ff5a2b70000026d4a7dc119000009855f4fce2700002200e6af4df900006f1402a30fc700014d3c07e92f550003994b9d6691eb0009326be79458750015c842ee953d4b002febc6734853a500621fbaec0e009b00bb53d937037585014dee83358bbb3b022c8d85593e380d036438eebe6b4d3304f4f0bf6512faad06caeb193ea83b1308bbc08e2bfcde3d0a8a52534f924a030bf2190915ea0f9d0cb764f927d821230cb764f927d821230bf2190915ea0f9d0a8a52534f924a0308bbc08e2bfcde3d06caeb193ea83b1304f4f0bf6512faad036438eebe6b4d33022c8d85593e380d014dee83358bbb3b00bb53d93703758500621fbaec0e009b002febc6734853a50015c842ee953d4b0009326be79458750003994b9d6691eb00014d3c07e92f5500006f1402a30fc700002200e6af4df9000009855f4fce270000026d4a7dc1190000008f5ff5a2b70000001dc1cd8c090000000582b4495700000000e6d7aee90000000020fa3d8f00000000040cc43100000000006b406f00000000000916d10000000000009b1f00000000000007a1000000000000003f0000000000000001n],
  [-0x10000000000000001n, 64n, 0x1000000000000004000000000000007e0000000000000a2c0000000000009b1f0000000000074574000000000047804a000000000250701c00000000107d1ec7800000006698bf840000000234481d560000000ad21c32ec0000002fcaa7363d000000bf2a9cd8f4000002b8645ff1c2000009114e9525dc00001bc500a8c3f1c0004e687a54fc140000ccbb784faea60001efaaed62995c00045b40961dd90f000920b815f565440011d7394231176200209425c6c8f30c0037a7c088ec9f3480590c67417a98540085929ae237e47e00bbfdbd8a3bb35c00f86aba76aa51950134612e17b8f2840167c6b5c657c59a018a97e023dc230c0196ec9f24fb0424618a97e023dc230c0167c6b5c657c59a0134612e17b8f28400f86aba76aa519500bbfdbd8a3bb35c0085929ae237e47e00590c67417a98540037a7c088ec9f3480209425c6c8f30c0011d73942311762000920b815f5654400045b40961dd90f0001efaaed62995c0000ccbb784faea600004e687a54fc1400001bc500a8c3f1c00009114e9525dc000002b8645ff1c2000000bf2a9cd8f40000002fcaa7363d0000000ad21c32ec0000000234481d56000000006698bf8400000000107d1ec7800000000250701c000000000047804a00000000000745740000000000009b1f0000000000000a2c000000000000007e000000000000000400000000000000001n],
  [-0x10000000000000000n, 64n, 0x10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [-0xffffffffffffffffn, 64n, 0xffffffffffffffc000000000000007dfffffffffffff5d40000000000009b1efffffffffff8ba8c0000000000478049fffffffffdaf8fe400000000107d1ec77fffffff9967407c0000000234481d55fffffff52de3cd140000002fcaa7363cffffff40d563270c000002b8645ff1c1fffff6eeb16ada2400001bc500a8c3f1bfffb19785ab03ec0000ccbb784faea5fffe1055129d66a400045b40961dd90efff6df47ea0a9abc0011d73942311761ffdf6bda39370cf40037a7c088ec9f347fa6f398be8567ac0085929ae237e47dff44024275c44ca400f86aba76aa5194fecb9ed1e8470d7c0167c6b5c657c599fe75681fdc23dcf40196ec9f24fb04245e75681fdc23dcf40167c6b5c657c599fecb9ed1e8470d7c00f86aba76aa5194ff44024275c44ca40085929ae237e47dffa6f398be8567ac0037a7c088ec9f347fdf6bda39370cf40011d73942311761fff6df47ea0a9abc00045b40961dd90efffe1055129d66a40000ccbb784faea5ffffb19785ab03ec00001bc500a8c3f1bffff6eeb16ada24000002b8645ff1c1ffffff40d563270c0000002fcaa7363cfffffff52de3cd140000000234481d55ffffffff9967407c00000000107d1ec77ffffffffdaf8fe40000000000478049fffffffffff8ba8c0000000000009b1efffffffffffff5d4000000000000007dfffffffffffffffc00000000000000001n],
  [-0xfffffffffffffffen, 64n, 0xffffffffffffff800000000000001f7ffffffffffffaea0000000000009b1efffffffffff1751800000000011e0127ffffffffed7c7f200000000107d1ec77fffffff32ce80f800000008d1207557ffffffa96f1e68a0000002fcaa7363cfffffe81aac64e1800000ae1917fc707ffffb7758b56d1200001bc500a8c3f1bfff632f0b5607d8000332ede13eba97fff082a894eb35200045b40961dd90effedbe8fd415357800475ce508c45d87fefb5ed1c9b867a0037a7c088ec9f347f4de7317d0acf5802164a6b88df91f7fa201213ae2265200f86aba76aa5194fd973da3d08e1af8059f1ad7195f1667f3ab40fee11ee7a0196ec9f24fb04245cead03fb847b9e8059f1ad7195f1667f65cf68f42386be00f86aba76aa5194fe880484eb88994802164a6b88df91f7fd379cc5f42b3d60037a7c088ec9f347fbed7b4726e19e800475ce508c45d87ffb6fa3f5054d5e00045b40961dd90efffc20aa253acd48000332ede13eba97fffd8cbc2d581f600001bc500a8c3f1bfffeddd62d5b44800000ae1917fc707fffffa06ab193860000002fcaa7363cffffffea5bc79a2800000008d1207557fffffffccb3a03e00000000107d1ec77ffffffffb5f1fc800000000011e0127ffffffffffc5d460000000000009b1effffffffffffeba800000000000001f7ffffffffffffffe000000000000000010000000000000000n],
  [-0x8000000000000001n, 64n, 0x100000000000000800000000000001f80000000000005160000000000009b1f00000000000e8ae800000000011e012800000000128380e00000000107d1ec780000000cd317f0800000008d12075580000005690e19760000002fcaa7363d0000017e5539b1e800000ae1917fc7080000488a74a92ee00001bc500a8c3f1c0009cd0f4a9f828000332ede13eba98000f7d576b14cae00045b40961dd90f001241702beaca8800475ce508c45d880104a12e36479860037a7c088ec9f3480b218ce82f530a802164a6b88df91f805dfedec51dd9ae00f86aba76aa51950268c25c2f71e508059f1ad7195f16680c54bf011ee11860196ec9f24fb042463152fc047b84618059f1ad7195f166809a30970bdc794200f86aba76aa51950177fb7b147766b802164a6b88df91f802c8633a0bd4c2a0037a7c088ec9f348041284b8d91e61800475ce508c45d88004905c0afab2a200045b40961dd90f0003df55dac532b8000332ede13eba9800027343d2a7e0a00001bc500a8c3f1c00012229d2a4bb800000ae1917fc708000005f954e6c7a0000002fcaa7363d00000015a43865d800000008d12075580000000334c5fc200000000107d1ec78000000004a0e03800000000011e012800000000003a2ba0000000000009b1f000000000000145800000000000001f800000000000000200000000000000001n],
  [-0x8000000000000000n, 64n, 0x1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [-0x7fffffffffffffffn, 64n, 0xffffffffffffff800000000000001f7ffffffffffffaea0000000000009b1efffffffffff1751800000000011e0127ffffffffed7c7f200000000107d1ec77fffffff32ce80f800000008d1207557ffffffa96f1e68a0000002fcaa7363cfffffe81aac64e1800000ae1917fc707ffffb7758b56d1200001bc500a8c3f1bfff632f0b5607d8000332ede13eba97fff082a894eb35200045b40961dd90effedbe8fd415357800475ce508c45d87fefb5ed1c9b867a0037a7c088ec9f347f4de7317d0acf5802164a6b88df91f7fa201213ae2265200f86aba76aa5194fd973da3d08e1af8059f1ad7195f1667f3ab40fee11ee7a0196ec9f24fb04245cead03fb847b9e8059f1ad7195f1667f65cf68f42386be00f86aba76aa5194fe880484eb88994802164a6b88df91f7fd379cc5f42b3d60037a7c088ec9f347fbed7b4726e19e800475ce508c45d87ffb6fa3f5054d5e00045b40961dd90efffc20aa253acd48000332ede13eba97fffd8cbc2d581f600001bc500a8c3f1bfffeddd62d5b44800000ae1917fc707fffffa06ab193860000002fcaa7363cffffffea5bc79a2800000008d1207557fffffffccb3a03e00000000107d1ec77ffffffffb5f1fc800000000011e0127ffffffffffc5d460000000000009b1effffffffffffeba800000000000001f7ffffffffffffffe00000000000000001n],
  [-0x7ffffffffffffffen, 64n, 0xffffffffffffff000000000000007dffffffffffffd750000000000009b1effffffffffe2ea30000000000478049fffffffff6be3f900000000107d1ec77ffffffe659d01f0000000234481d55ffffffd4b78f3450000002fcaa7363cfffffd03558c9c3000002b8645ff1c1ffffdbbac5ab68900001bc500a8c3f1bffec65e16ac0fb0000ccbb784faea5fff841544a759a900045b40961dd90effdb7d1fa82a6af0011d73942311761ff7daf68e4dc33d0037a7c088ec9f347e9bce62fa159eb0085929ae237e47dfd100909d71132900f86aba76aa5194fb2e7b47a11c35f0167c6b5c657c599f9d5a07f708f73d0196ec9f24fb042459d5a07f708f73d0167c6b5c657c599fb2e7b47a11c35f00f86aba76aa5194fd100909d7113290085929ae237e47dfe9bce62fa159eb0037a7c088ec9f347f7daf68e4dc33d0011d73942311761ffdb7d1fa82a6af00045b40961dd90efff841544a759a90000ccbb784faea5fffec65e16ac0fb00001bc500a8c3f1bfffdbbac5ab689000002b8645ff1c1fffffd03558c9c30000002fcaa7363cffffffd4b78f3450000000234481d55fffffffe659d01f00000000107d1ec77ffffffff6be3f90000000000478049ffffffffffe2ea30000000000009b1effffffffffffd75000000000000007dfffffffffffffff000000000000000010000000000000000n],
  [-0x100000001n, 64n, 0x100000040000007e00000a2c00009b1f000745740047804a0250701c107d1ec7e698bf8634481d60d21c331bcaa736fc2a9cdbac645ffad34e9541a100a9125a3a55c8cf78519e50ed66f49c9626f9c716073c7d4251ab87c7009acc8945ab9bc2002aeee2f3e23b8b341e1677deb2c31920b939c7e25d7a25730fab26859c048543e9c1c78c26c818b15d3e77664f528ac145f6e290f0e541b24014890d335a46daca45423a381a15f9c084961fc8b9ed636617784ffd0e7a5517d900a8cd030e952894645ff2812a9cd923caa73647d21c32ee34481d566698bf84107d1ec78250701c0047804a0007457400009b1f00000a2c0000007e00000004000000001n],
  [-0x100000000n, 64n, 0x100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [-0xffffffffn, 64n, 0xffffffc0000007dfffff5d400009b1efff8ba8c00478049fdaf8fe4107d1ec71967407e34481d4b2de3cd43caa7357dd56329c4645fe8b0b16af5e900a8758945abd0a7784dbefb12a1c1e49614b856ea1c71f54210833c396eb4b4889392cd3f0afa46e17be6c076bcb75e7575f066e9aed431c4cd2db9ddbac99323706c443d8ba3a9c523646be93f783675ee53d77649df3ee1ded816bebd0f6c88cc0b0eb948e42d4227f6a9ea0ef5fc961be964129e335f784f603d85ab1fb100a8bae0716adcdc645ff102d563273bcaa736322de3cd1634481d559967407c107d1ec77daf8fe400478049fff8ba8c00009b1efffff5d40000007dfffffffc000000001n],
  [-0xfffffffen, 64n, 0xffffff8000001f7ffffaea00009b1efff17518011e0127ed7c7f2107d1ec6b2ce8100d12075016f1e6b9caa734beaac658f9917f7e7d8b588d700a82720cb593ac5e12f3d409530e92960b979ed45c925d07bfbc59cd32e3a883a8665ff2119c382ffa40bbda910c74418f38d62d35cf0d0a5766fa8db1921e5d4641de6d4bf0fbc0cf751bf17875325619ed9ee3b386172ebdf7a5b9688ab76e8f2b576cd087b57c7509a89e9619f9b9253e0035e13c47542d59dbb00a8b1cf22d5bf29917fc10eab193b5caa736275bc79a30d1207554cb3a03e107d1ec77b5f1fc8011e0127ffc5d4600009b1effffeba8000001f7ffffffe0000000010000000000000000n],
  [-0x80000001n, 64n, 0x10000008000001f8000051600009b1f000e8ae8011e0128128380e107d1ec84d317f10d12075ae90e19a5caa737bb5539bcc991800f9274aaeb300a960c2b4ad2b15e14e37ef6b5a7ee96301a7f2c32276d09c8feb639c2146899eb803050b7b138ebf7fe46164468791313f13510ffdf25b3d569384fe25281033e4ad5760ef23021fd8cd4e3fc78224d10168db1238ba7f5320f4f3ea892dc7800dd942fd090d6348aff0de29621b864dac865a5e1412ddbd2a99cf00a8d6145d2a5699917fcd0154e6ca9caa73652a43865e0d120755b34c5fc2107d1ec784a0e038011e0128003a2ba00009b1f00001458000001f80000002000000001n],
  [-0x80000000n, 64n, 0x10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [-0x7fffffffn, 64n, 0xffffff8000001f7ffffaea00009b1efff17518011e0127ed7c7f2107d1ec6b2ce8100d12075016f1e6b9caa734beaac658f9917f7e7d8b588d700a82720cb593ac5e12f3d409530e92960b979ed45c925d07bfbc59cd32e3a883a8665ff2119c382ffa40bbda910c74418f38d62d35cf0d0a5766fa8db1921e5d4641de6d4bf0fbc0cf751bf17875325619ed9ee3b386172ebdf7a5b9688ab76e8f2b576cd087b57c7509a89e9619f9b9253e0035e13c47542d59dbb00a8b1cf22d5bf29917fc10eab193b5caa736275bc79a30d1207554cb3a03e107d1ec77b5f1fc8011e0127ffc5d4600009b1effffeba8000001f7ffffffe000000001n],
  [-0x7ffffffen, 64n, 0xffffff0000007dffffd7500009b1effe2ea300478049f6be3f9107d1ec5e59d02134481d2ab78f374caa73340558cc7b645fcd7cc5ad24e00a78a4fd6b8db67847effa4abb4e995f9562ea947de841aec6cae856afd87886d97826ec85df47ed87e697de371d8ccdcb798a14c02d661989fe3dc1ed0a4a3e70bdf2c18640e1b0a2e1973ba5a9edf6a5c3e0d3b2e0fd901ab886a4e9d65f9a76420c9481a8701ef96161a634a82664784e750416adcc000a89fac85ab941645feec5558c9f2caa73611b78f34734481d54659d01f107d1ec776be3f900478049ffe2ea300009b1effffd750000007dfffffff0000000010000000000000000n],
  [-9n, 64n, 0x75648e690da5a4d2eefe4588f7cfb7be364804214818a867a01n],
  [-8n, 64n, 0x1000000000000000000000000000000000000000000000000n],
  [-7n, 64n, 0xcbc21fe4561c8d63b78e780e1341e199417c8c0bb7601n],
  [-6n, 64n, 0x2b56d4af8f7932278c797ebd010000000000000000n],
  [-5n, 64n, 0x184f03e93ff9f4daa797ed6e38ed64bf6a1f01n],
  [-4n, 64n, 0x100000000000000000000000000000000n],
  [-3n, 64n, 0x2b56d4af8f7932278c797ebd01n],
  [-2n, 64n, 0x10000000000000000n],
  [-1n, 64n, 1n],
  [0n, 64n, 0n],
  [1n, 64n, 1n],
  [2n, 64n, 0x10000000000000000n],
  [3n, 64n, 0x2b56d4af8f7932278c797ebd01n],
  [4n, 64n, 0x100000000000000000000000000000000n],
  [5n, 64n, 0x184f03e93ff9f4daa797ed6e38ed64bf6a1f01n],
  [6n, 64n, 0x2b56d4af8f7932278c797ebd010000000000000000n],
  [7n, 64n, 0xcbc21fe4561c8d63b78e780e1341e199417c8c0bb7601n],
  [8n, 64n, 0x1000000000000000000000000000000000000000000000000n],
  [9n, 64n, 0x75648e690da5a4d2eefe4588f7cfb7be364804214818a867a01n],
  [0x7ffffffen, 64n, 0xffffff0000007dffffd7500009b1effe2ea300478049f6be3f9107d1ec5e59d02134481d2ab78f374caa73340558cc7b645fcd7cc5ad24e00a78a4fd6b8db67847effa4abb4e995f9562ea947de841aec6cae856afd87886d97826ec85df47ed87e697de371d8ccdcb798a14c02d661989fe3dc1ed0a4a3e70bdf2c18640e1b0a2e1973ba5a9edf6a5c3e0d3b2e0fd901ab886a4e9d65f9a76420c9481a8701ef96161a634a82664784e750416adcc000a89fac85ab941645feec5558c9f2caa73611b78f34734481d54659d01f107d1ec776be3f900478049ffe2ea300009b1effffd750000007dfffffff0000000010000000000000000n],
  [0x7fffffffn, 64n, 0xffffff8000001f7ffffaea00009b1efff17518011e0127ed7c7f2107d1ec6b2ce8100d12075016f1e6b9caa734beaac658f9917f7e7d8b588d700a82720cb593ac5e12f3d409530e92960b979ed45c925d07bfbc59cd32e3a883a8665ff2119c382ffa40bbda910c74418f38d62d35cf0d0a5766fa8db1921e5d4641de6d4bf0fbc0cf751bf17875325619ed9ee3b386172ebdf7a5b9688ab76e8f2b576cd087b57c7509a89e9619f9b9253e0035e13c47542d59dbb00a8b1cf22d5bf29917fc10eab193b5caa736275bc79a30d1207554cb3a03e107d1ec77b5f1fc8011e0127ffc5d4600009b1effffeba8000001f7ffffffe000000001n],
  [0x80000000n, 64n, 0x10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [0x80000001n, 64n, 0x10000008000001f8000051600009b1f000e8ae8011e0128128380e107d1ec84d317f10d12075ae90e19a5caa737bb5539bcc991800f9274aaeb300a960c2b4ad2b15e14e37ef6b5a7ee96301a7f2c32276d09c8feb639c2146899eb803050b7b138ebf7fe46164468791313f13510ffdf25b3d569384fe25281033e4ad5760ef23021fd8cd4e3fc78224d10168db1238ba7f5320f4f3ea892dc7800dd942fd090d6348aff0de29621b864dac865a5e1412ddbd2a99cf00a8d6145d2a5699917fcd0154e6ca9caa73652a43865e0d120755b34c5fc2107d1ec784a0e038011e0128003a2ba00009b1f00001458000001f80000002000000001n],
  [0xfffffffen, 64n, 0xffffff8000001f7ffffaea00009b1efff17518011e0127ed7c7f2107d1ec6b2ce8100d12075016f1e6b9caa734beaac658f9917f7e7d8b588d700a82720cb593ac5e12f3d409530e92960b979ed45c925d07bfbc59cd32e3a883a8665ff2119c382ffa40bbda910c74418f38d62d35cf0d0a5766fa8db1921e5d4641de6d4bf0fbc0cf751bf17875325619ed9ee3b386172ebdf7a5b9688ab76e8f2b576cd087b57c7509a89e9619f9b9253e0035e13c47542d59dbb00a8b1cf22d5bf29917fc10eab193b5caa736275bc79a30d1207554cb3a03e107d1ec77b5f1fc8011e0127ffc5d4600009b1effffeba8000001f7ffffffe0000000010000000000000000n],
  [0xffffffffn, 64n, 0xffffffc0000007dfffff5d400009b1efff8ba8c00478049fdaf8fe4107d1ec71967407e34481d4b2de3cd43caa7357dd56329c4645fe8b0b16af5e900a8758945abd0a7784dbefb12a1c1e49614b856ea1c71f54210833c396eb4b4889392cd3f0afa46e17be6c076bcb75e7575f066e9aed431c4cd2db9ddbac99323706c443d8ba3a9c523646be93f783675ee53d77649df3ee1ded816bebd0f6c88cc0b0eb948e42d4227f6a9ea0ef5fc961be964129e335f784f603d85ab1fb100a8bae0716adcdc645ff102d563273bcaa736322de3cd1634481d559967407c107d1ec77daf8fe400478049fff8ba8c00009b1efffff5d40000007dfffffffc000000001n],
  [0x100000000n, 64n, 0x100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [0x100000001n, 64n, 0x100000040000007e00000a2c00009b1f000745740047804a0250701c107d1ec7e698bf8634481d60d21c331bcaa736fc2a9cdbac645ffad34e9541a100a9125a3a55c8cf78519e50ed66f49c9626f9c716073c7d4251ab87c7009acc8945ab9bc2002aeee2f3e23b8b341e1677deb2c31920b939c7e25d7a25730fab26859c048543e9c1c78c26c818b15d3e77664f528ac145f6e290f0e541b24014890d335a46daca45423a381a15f9c084961fc8b9ed636617784ffd0e7a5517d900a8cd030e952894645ff2812a9cd923caa73647d21c32ee34481d566698bf84107d1ec78250701c0047804a0007457400009b1f00000a2c0000007e00000004000000001n],
  [0x7ffffffffffffffen, 64n, 0xffffffffffffff000000000000007dffffffffffffd750000000000009b1effffffffffe2ea30000000000478049fffffffff6be3f900000000107d1ec77ffffffe659d01f0000000234481d55ffffffd4b78f3450000002fcaa7363cfffffd03558c9c3000002b8645ff1c1ffffdbbac5ab68900001bc500a8c3f1bffec65e16ac0fb0000ccbb784faea5fff841544a759a900045b40961dd90effdb7d1fa82a6af0011d73942311761ff7daf68e4dc33d0037a7c088ec9f347e9bce62fa159eb0085929ae237e47dfd100909d71132900f86aba76aa5194fb2e7b47a11c35f0167c6b5c657c599f9d5a07f708f73d0196ec9f24fb042459d5a07f708f73d0167c6b5c657c599fb2e7b47a11c35f00f86aba76aa5194fd100909d7113290085929ae237e47dfe9bce62fa159eb0037a7c088ec9f347f7daf68e4dc33d0011d73942311761ffdb7d1fa82a6af00045b40961dd90efff841544a759a90000ccbb784faea5fffec65e16ac0fb00001bc500a8c3f1bfffdbbac5ab689000002b8645ff1c1fffffd03558c9c30000002fcaa7363cffffffd4b78f3450000000234481d55fffffffe659d01f00000000107d1ec77ffffffff6be3f90000000000478049ffffffffffe2ea30000000000009b1effffffffffffd75000000000000007dfffffffffffffff000000000000000010000000000000000n],
  [0x7fffffffffffffffn, 64n, 0xffffffffffffff800000000000001f7ffffffffffffaea0000000000009b1efffffffffff1751800000000011e0127ffffffffed7c7f200000000107d1ec77fffffff32ce80f800000008d1207557ffffffa96f1e68a0000002fcaa7363cfffffe81aac64e1800000ae1917fc707ffffb7758b56d1200001bc500a8c3f1bfff632f0b5607d8000332ede13eba97fff082a894eb35200045b40961dd90effedbe8fd415357800475ce508c45d87fefb5ed1c9b867a0037a7c088ec9f347f4de7317d0acf5802164a6b88df91f7fa201213ae2265200f86aba76aa5194fd973da3d08e1af8059f1ad7195f1667f3ab40fee11ee7a0196ec9f24fb04245cead03fb847b9e8059f1ad7195f1667f65cf68f42386be00f86aba76aa5194fe880484eb88994802164a6b88df91f7fd379cc5f42b3d60037a7c088ec9f347fbed7b4726e19e800475ce508c45d87ffb6fa3f5054d5e00045b40961dd90efffc20aa253acd48000332ede13eba97fffd8cbc2d581f600001bc500a8c3f1bfffeddd62d5b44800000ae1917fc707fffffa06ab193860000002fcaa7363cffffffea5bc79a2800000008d1207557fffffffccb3a03e00000000107d1ec77ffffffffb5f1fc800000000011e0127ffffffffffc5d460000000000009b1effffffffffffeba800000000000001f7ffffffffffffffe00000000000000001n],
  [0x8000000000000000n, 64n, 0x1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [0x8000000000000001n, 64n, 0x100000000000000800000000000001f80000000000005160000000000009b1f00000000000e8ae800000000011e012800000000128380e00000000107d1ec780000000cd317f0800000008d12075580000005690e19760000002fcaa7363d0000017e5539b1e800000ae1917fc7080000488a74a92ee00001bc500a8c3f1c0009cd0f4a9f828000332ede13eba98000f7d576b14cae00045b40961dd90f001241702beaca8800475ce508c45d880104a12e36479860037a7c088ec9f3480b218ce82f530a802164a6b88df91f805dfedec51dd9ae00f86aba76aa51950268c25c2f71e508059f1ad7195f16680c54bf011ee11860196ec9f24fb042463152fc047b84618059f1ad7195f166809a30970bdc794200f86aba76aa51950177fb7b147766b802164a6b88df91f802c8633a0bd4c2a0037a7c088ec9f348041284b8d91e61800475ce508c45d88004905c0afab2a200045b40961dd90f0003df55dac532b8000332ede13eba9800027343d2a7e0a00001bc500a8c3f1c00012229d2a4bb800000ae1917fc708000005f954e6c7a0000002fcaa7363d00000015a43865d800000008d12075580000000334c5fc200000000107d1ec78000000004a0e03800000000011e012800000000003a2ba0000000000009b1f000000000000145800000000000001f800000000000000200000000000000001n],
  [0xfffffffffffffffen, 64n, 0xffffffffffffff800000000000001f7ffffffffffffaea0000000000009b1efffffffffff1751800000000011e0127ffffffffed7c7f200000000107d1ec77fffffff32ce80f800000008d1207557ffffffa96f1e68a0000002fcaa7363cfffffe81aac64e1800000ae1917fc707ffffb7758b56d1200001bc500a8c3f1bfff632f0b5607d8000332ede13eba97fff082a894eb35200045b40961dd90effedbe8fd415357800475ce508c45d87fefb5ed1c9b867a0037a7c088ec9f347f4de7317d0acf5802164a6b88df91f7fa201213ae2265200f86aba76aa5194fd973da3d08e1af8059f1ad7195f1667f3ab40fee11ee7a0196ec9f24fb04245cead03fb847b9e8059f1ad7195f1667f65cf68f42386be00f86aba76aa5194fe880484eb88994802164a6b88df91f7fd379cc5f42b3d60037a7c088ec9f347fbed7b4726e19e800475ce508c45d87ffb6fa3f5054d5e00045b40961dd90efffc20aa253acd48000332ede13eba97fffd8cbc2d581f600001bc500a8c3f1bfffeddd62d5b44800000ae1917fc707fffffa06ab193860000002fcaa7363cffffffea5bc79a2800000008d1207557fffffffccb3a03e00000000107d1ec77ffffffffb5f1fc800000000011e0127ffffffffffc5d460000000000009b1effffffffffffeba800000000000001f7ffffffffffffffe000000000000000010000000000000000n],
  [0xffffffffffffffffn, 64n, 0xffffffffffffffc000000000000007dfffffffffffff5d40000000000009b1efffffffffff8ba8c0000000000478049fffffffffdaf8fe400000000107d1ec77fffffff9967407c0000000234481d55fffffff52de3cd140000002fcaa7363cffffff40d563270c000002b8645ff1c1fffff6eeb16ada2400001bc500a8c3f1bfffb19785ab03ec0000ccbb784faea5fffe1055129d66a400045b40961dd90efff6df47ea0a9abc0011d73942311761ffdf6bda39370cf40037a7c088ec9f347fa6f398be8567ac0085929ae237e47dff44024275c44ca400f86aba76aa5194fecb9ed1e8470d7c0167c6b5c657c599fe75681fdc23dcf40196ec9f24fb04245e75681fdc23dcf40167c6b5c657c599fecb9ed1e8470d7c00f86aba76aa5194ff44024275c44ca40085929ae237e47dffa6f398be8567ac0037a7c088ec9f347fdf6bda39370cf40011d73942311761fff6df47ea0a9abc00045b40961dd90efffe1055129d66a40000ccbb784faea5ffffb19785ab03ec00001bc500a8c3f1bffff6eeb16ada24000002b8645ff1c1ffffff40d563270c0000002fcaa7363cfffffff52de3cd140000000234481d55ffffffff9967407c00000000107d1ec77ffffffffdaf8fe40000000000478049fffffffffff8ba8c0000000000009b1efffffffffffff5d4000000000000007dfffffffffffffffc00000000000000001n],
  [0x10000000000000000n, 64n, 0x10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n],
  [0x10000000000000001n, 64n, 0x1000000000000004000000000000007e0000000000000a2c0000000000009b1f0000000000074574000000000047804a000000000250701c00000000107d1ec7800000006698bf840000000234481d560000000ad21c32ec0000002fcaa7363d000000bf2a9cd8f4000002b8645ff1c2000009114e9525dc00001bc500a8c3f1c0004e687a54fc140000ccbb784faea60001efaaed62995c00045b40961dd90f000920b815f565440011d7394231176200209425c6c8f30c0037a7c088ec9f3480590c67417a98540085929ae237e47e00bbfdbd8a3bb35c00f86aba76aa51950134612e17b8f2840167c6b5c657c59a018a97e023dc230c0196ec9f24fb0424618a97e023dc230c0167c6b5c657c59a0134612e17b8f28400f86aba76aa519500bbfdbd8a3bb35c0085929ae237e47e00590c67417a98540037a7c088ec9f3480209425c6c8f30c0011d73942311762000920b815f5654400045b40961dd90f0001efaaed62995c0000ccbb784faea600004e687a54fc1400001bc500a8c3f1c00009114e9525dc000002b8645ff1c2000000bf2a9cd8f40000002fcaa7363d0000000ad21c32ec0000000234481d56000000006698bf8400000000107d1ec7800000000250701c000000000047804a00000000000745740000000000009b1f0000000000000a2c000000000000007e000000000000000400000000000000001n],
];

// Cases not covered above.
tests.push(
  // 0 ** (2**31)
  // 0 ** (2**32)
  // 0 ** (2**63)
  // 0 ** (2**64)
  [0n, 0x7fffffffn, 0n],
  [0n, 0x80000000n, 0n],
  [0n, 0x80000001n, 0n],
  [0n, 0xffffffffn, 0n],
  [0n, 0x100000000n, 0n],
  [0n, 0x100000001n, 0n],
  [0n, 0x7fffffffffffffffn, 0n],
  [0n, 0x8000000000000000n, 0n],
  [0n, 0x8000000000000001n, 0n],
  [0n, 0xffffffffffffffffn, 0n],
  [0n, 0x10000000000000000n, 0n],
  [0n, 0x10000000000000001n, 0n],

  // 1 ** (2**31)
  // 1 ** (2**32)
  // 1 ** (2**63)
  // 1 ** (2**64)
  [1n, 0x7fffffffn, 1n],
  [1n, 0x80000000n, 1n],
  [1n, 0x80000001n, 1n],
  [1n, 0xffffffffn, 1n],
  [1n, 0x100000000n, 1n],
  [1n, 0x100000001n, 1n],
  [1n, 0x7fffffffffffffffn, 1n],
  [1n, 0x8000000000000000n, 1n],
  [1n, 0x8000000000000001n, 1n],
  [1n, 0xffffffffffffffffn, 1n],
  [1n, 0x10000000000000000n, 1n],
  [1n, 0x10000000000000001n, 1n],

  // -1 ** (2**31)
  // -1 ** (2**32)
  // -1 ** (2**63)
  // -1 ** (2**64)
  [-1n, 0x7fffffffn, -1n],
  [-1n, 0x80000000n, 1n],
  [-1n, 0x80000001n, -1n],
  [-1n, 0xffffffffn, -1n],
  [-1n, 0x100000000n, 1n],
  [-1n, 0x100000001n, -1n],
  [-1n, 0x7fffffffffffffffn, -1n],
  [-1n, 0x8000000000000000n, 1n],
  [-1n, 0x8000000000000001n, -1n],
  [-1n, 0xffffffffffffffffn, -1n],
  [-1n, 0x10000000000000000n, 1n],
  [-1n, 0x10000000000000001n, -1n],
);

function f(tests) {
  for (let test of tests) {
    let lhs = test[0], rhs = test[1], expected = test[2];

    assertEq(lhs ** rhs, expected);
  }
}

for (let i = 0; i < 10; ++i) {
  f(tests);
}
