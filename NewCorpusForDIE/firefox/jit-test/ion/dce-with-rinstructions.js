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

// |jit-test| --ion-limit-script-size=off

setJitCompilerOption("baseline.warmup.trigger", 9);
setJitCompilerOption("ion.warmup.trigger", 20);
var i;

var warp = true;

// Prevent GC from cancelling/discarding Ion compilations.
gczeal(0);

var config = getBuildConfiguration();
var max = 200;

// Check that we are able to remove the operation inside recover test functions (denoted by "rop..."),
// when we inline the first version of uceFault, and ensure that the bailout is correct
// when uceFault is replaced (which cause an invalidation bailout)

var uceFault = function (i) {
    if (i > 98)
        uceFault = function (i) { return true; };
    return false;
}

var uceFault_bitnot_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_bitnot_number'));
function rbitnot_number(i) {
    var x = ~i;
    if (uceFault_bitnot_number(i) || uceFault_bitnot_number(i))
        assertEq(x, -100  /* = ~99 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_bitnot_object = eval(`(${uceFault})`.replace('uceFault', 'uceFault_bitnot_object'));
function rbitnot_object(i) {
    var t = i;
    var o = { valueOf: function () { return t; } };
    var x = ~o; /* computed with t == i, not 1000 */
    t = 1000;
    if (uceFault_bitnot_object(i) || uceFault_bitnot_object(i))
        assertEq(x, -100  /* = ~99 */);
    assertRecoveredOnBailout(x, false);
    return i;
}

var uceFault_bitand_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_bitand_number'));
function rbitand_number(i) {
    var x = 1 & i;
    if (uceFault_bitand_number(i) || uceFault_bitand_number(i))
        assertEq(x, 1  /* = 1 & 99 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_bitand_object = eval(`(${uceFault})`.replace('uceFault', 'uceFault_bitand_object'));
function rbitand_object(i) {
    var t = i;
    var o = { valueOf: function () { return t; } };
    var x = o & i; /* computed with t == i, not 1000 */
    t = 1000;
    if (uceFault_bitand_object(i) || uceFault_bitand_object(i))
        assertEq(x, 99);
    assertRecoveredOnBailout(x, false);
    return i;
}

var uceFault_bitor_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_bitor_number'));
function rbitor_number(i) {
    var x = i | -100; /* -100 == ~99 */
    if (uceFault_bitor_number(i) || uceFault_bitor_number(i))
        assertEq(x, -1) /* ~99 | 99 = -1 */
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_bitor_object = eval(`(${uceFault})`.replace('uceFault', 'uceFault_bitor_object'));
function rbitor_object(i) {
    var t = i;
    var o = { valueOf: function() { return t; } };
    var x = o | -100;
    t = 1000;
    if (uceFault_bitor_object(i) || uceFault_bitor_object(i))
        assertEq(x, -1);
    assertRecoveredOnBailout(x, false);
    return i;
}

var uceFault_bitxor_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_bitxor_number'));
function rbitxor_number(i) {
    var x = 1 ^ i;
    if (uceFault_bitxor_number(i) || uceFault_bitxor_number(i))
        assertEq(x, 98  /* = 1 XOR 99 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_bitxor_object = eval(`(${uceFault})`.replace('uceFault', 'uceFault_bitxor_object'));
function rbitxor_object(i) {
    var t = i;
    var o = { valueOf: function () { return t; } };
    var x = 1 ^ o; /* computed with t == i, not 1000 */
    t = 1000;
    if (uceFault_bitxor_object(i) || uceFault_bitxor_object(i))
        assertEq(x, 98  /* = 1 XOR 99 */);
    assertRecoveredOnBailout(x, false);
    return i;
}

var uceFault_lsh_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_lsh_number'));
function rlsh_number(i) {
    var x = i << 1;
    if (uceFault_lsh_number(i) || uceFault_lsh_number(i))
        assertEq(x, 198); /* 99 << 1 == 198 */
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_lsh_object = eval(`(${uceFault})`.replace('uceFault', 'uceFault_lsh_object'));
function rlsh_object(i) {
    var t = i;
    var o = { valueOf: function() { return t; } };
    var x = o << 1;
    t = 1000;
    if (uceFault_lsh_object(i) || uceFault_lsh_object(i))
        assertEq(x, 198);
    assertRecoveredOnBailout(x, false);
    return i;
}

var uceFault_rsh_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_rsh_number'));
function rrsh_number(i) {
    var x = i >> 1;
    if (uceFault_rsh_number(i) || uceFault_rsh_number(i))
        assertEq(x, 49  /* = 99 >> 1 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_rsh_object = eval(`(${uceFault})`.replace('uceFault', 'uceFault_rsh_object'));
function rrsh_object(i) {
    var t = i;
    var o = { valueOf: function () { return t; } };
    var x = o >> 1; /* computed with t == i, not 1000 */
    t = 1000;
    if (uceFault_rsh_object(i) || uceFault_rsh_object(i))
        assertEq(x, 49  /* = 99 >> 1 */);
    assertRecoveredOnBailout(x, false);
    return i;
}

var uceFault_ursh_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_ursh_number'));
function rursh_number(i) {
    var x = i >>> 1;
    if (uceFault_ursh_number(i) || uceFault_ursh_number(i))
        assertEq(x, 49  /* = 99 >>> 1 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_ursh_object = eval(`(${uceFault})`.replace('uceFault', 'uceFault_ursh_object'));
function rursh_object(i) {
    var t = i;
    var o = { valueOf: function () { return t; } };
    var x = o >>> 1; /* computed with t == i, not 1000 */
    t = 1000;
    if (uceFault_ursh_object(i) || uceFault_ursh_object(i))
        assertEq(x, 49  /* = 99 >>> 1 */);
    assertRecoveredOnBailout(x, false);
    return i;
}

var uceFault_signextend8_1 = eval(`(${uceFault})`.replace('uceFault', 'uceFault_signextend8_1'));
function rsignextend8_1(i) {
    var x = (i << 24) >> 24;
    if (uceFault_signextend8_1(i) || uceFault_signextend8_1(i))
        assertEq(x, 99  /* = (99 << 24) >> 24 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_signextend8_2 = eval(`(${uceFault})`.replace('uceFault', 'uceFault_signextend8_2'));
function rsignextend8_2(i) {
    var x = ((-1 * i) << 24) >> 24;
    if (uceFault_signextend8_2(i) || uceFault_signextend8_2(i))
        assertEq(x, -99  /* = (-99 << 24) >> 24 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_signextend16_1 = eval(`(${uceFault})`.replace('uceFault', 'uceFault_signextend16_1'));
function rsignextend16_1(i) {
    var x = (i << 16) >> 16;
    if (uceFault_signextend16_1(i) || uceFault_signextend16_1(i))
        assertEq(x, 99  /* = (99 << 16) >> 16 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_signextend16_2 = eval(`(${uceFault})`.replace('uceFault', 'uceFault_signextend16_2'));
function rsignextend16_2(i) {
    var x = ((-1 * i) << 16) >> 16;
    if (uceFault_signextend16_2(i) || uceFault_signextend16_2(i))
        assertEq(x, -99  /* = (-99 << 16) >> 16 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_add_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_add_number'));
function radd_number(i) {
    var x = 1 + i;
    if (uceFault_add_number(i) || uceFault_add_number(i))
        assertEq(x, 100  /* = 1 + 99 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_add_float = eval(`(${uceFault})`.replace('uceFault', 'uceFault_add_float'));
function radd_float(i) {
    var t = Math.fround(1/3);
    var fi = Math.fround(i);
    var x = Math.fround(Math.fround(Math.fround(Math.fround(t + fi) + t) + fi) + t);
    if (uceFault_add_float(i) || uceFault_add_float(i))
        assertEq(x, 199); /* != 199.00000002980232 (when computed with double additions) */
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_add_object = eval(`(${uceFault})`.replace('uceFault', 'uceFault_add_object'));
function radd_object(i) {
    var t = i;
    var o = { valueOf: function () { return t; } };
    var x = o + i; /* computed with t == i, not 1000 */
    t = 1000;
    if (uceFault_add_object(i) || uceFault_add_object(i))
        assertEq(x, 198);
    assertRecoveredOnBailout(x, false);
    return i;
}

var uceFault_sub_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_sub_number'));
function rsub_number(i) {
    var x = 1 - i;
    if (uceFault_sub_number(i) || uceFault_sub_number(i))
        assertEq(x, -98  /* = 1 - 99 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_sub_float = eval(`(${uceFault})`.replace('uceFault', 'uceFault_sub_float'));
function rsub_float(i) {
    var t = Math.fround(1/3);
    var fi = Math.fround(i);
    var x = Math.fround(Math.fround(Math.fround(Math.fround(t - fi) - t) - fi) - t);
    if (uceFault_sub_float(i) || uceFault_sub_float(i))
        assertEq(x, -198.3333282470703); /* != -198.33333334326744 (when computed with double subtractions) */
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_sub_object = eval(`(${uceFault})`.replace('uceFault', 'uceFault_sub_object'));
function rsub_object(i) {
    var t = i;
    var o = { valueOf: function () { return t; } };
    var x = o - i; /* computed with t == i, not 1000 */
    t = 1000;
    if (uceFault_sub_object(i) || uceFault_sub_object(i))
        assertEq(x, 0);
    assertRecoveredOnBailout(x, false);
    return i;
}

var uceFault_mul_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_mul_number'));
function rmul_number(i) {
    var x = 2 * i;
    if (uceFault_mul_number(i) || uceFault_mul_number(i))
        assertEq(x, 198  /* = 2 * 99 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_mul_overflow = eval(`(${uceFault})`.replace('uceFault', 'uceFault_mul_overflow'));
function rmul_overflow(i) {
    var x = Math.pow(2, i * 16 / 99) | 0;
    x = x * x;
    if (uceFault_mul_overflow(i) || uceFault_mul_overflow(i))
        assertEq(x, Math.pow(2, 32));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_mul_float = eval(`(${uceFault})`.replace('uceFault', 'uceFault_mul_float'));
function rmul_float(i) {
    var t = Math.fround(1/3);
    var fi = Math.fround(i);
    var x = Math.fround(Math.fround(Math.fround(Math.fround(t * fi) * t) * fi) * t);
    if (uceFault_mul_float(i) || uceFault_mul_float(i))
        assertEq(x, 363); /* != 363.0000324547301 (when computed with double multiplications) */
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_mul_object = eval(`(${uceFault})`.replace('uceFault', 'uceFault_mul_object'));
function rmul_object(i) {
    var t = i;
    var o = { valueOf: function () { return t; } };
    var x = o * i; /* computed with t == i, not 1000 */
    t = 1000;
    if (uceFault_mul_object(i) || uceFault_mul_object(i))
        assertEq(x, 9801);
    assertRecoveredOnBailout(x, false);
    return i;
}

var uceFault_imul_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_imul_number'));
function rimul_number(i) {
    var x = Math.imul(2, i);
    if (uceFault_imul_number(i) || uceFault_imul_number(i))
        assertEq(x, 198  /* = 2 * 99 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_imul_overflow = eval(`(${uceFault})`.replace('uceFault', 'uceFault_imul_overflow'));
function rimul_overflow(i) {
    var x = Math.pow(2, i * 16 / 99) | 0;
    x = Math.imul(x, x);
    if (uceFault_imul_overflow(i) || uceFault_imul_overflow(i))
        assertEq(x, 0);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_imul_object = eval(`(${uceFault})`.replace('uceFault', 'uceFault_imul_object'));
function rimul_object(i) {
    var t = i;
    var o = { valueOf: function () { return t; } };
    var x = Math.imul(o, i); /* computed with t == i, not 1000 */
    t = 1000;
    if (uceFault_imul_object(i) || uceFault_imul_object(i))
        assertEq(x, 9801);
    assertRecoveredOnBailout(x, false);
    return i;
}

var uceFault_div_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_div_number'));
function rdiv_number(i) {
    i = i | 0;
    if (i < 1) { return i; }
    var x = 1 / i;
    if (uceFault_div_number(i) || uceFault_div_number(i))
        assertEq(x, 0.010101010101010102  /* = 1 / 99 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_div_float = eval(`(${uceFault})`.replace('uceFault', 'uceFault_div_float'));
function rdiv_float(i) {
    var t = Math.fround(1/3);
    var fi = Math.fround(i);
    var x = Math.fround(Math.fround(Math.fround(Math.fround(t / fi) / t) / fi) / t);
    if (uceFault_div_float(i) || uceFault_div_float(i))
        assertEq(x, 0.0003060912131331861); /* != 0.0003060912060598955 (when computed with double divisions) */
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_div_object = eval(`(${uceFault})`.replace('uceFault', 'uceFault_div_object'));
function rdiv_object(i) {
    var t = i;
    var o = { valueOf: function () { return t; } };
    var x = o / i; /* computed with t == i, not 1000 */
    t = 1000;
    if (uceFault_div_object(i) || uceFault_div_object(i))
        assertEq(x, 1);
    assertRecoveredOnBailout(x, false);
    return i;
}

var uceFault_mod_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_mod_number'));
function rmod_number(i) {
    var x = i % 98;
    if (uceFault_mod_number(i) || uceFault_mod_number(i))
        assertEq(x, 1); /* 99 % 98 = 1 */
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_mod_object = eval(`(${uceFault})`.replace('uceFault', 'uceFault_mod_object'));
function rmod_object(i) {
    var t = i;
    var o = { valueOf: function() { return t; } };
    var x = o % 98; /* computed with t == i, not 1000 */
    t = 1000;
    if(uceFault_mod_object(i) || uceFault_mod_object(i))
        assertEq(x, 1); /* 99 % 98 = 1 */
    assertRecoveredOnBailout(x, false);
    return i;
}

var uceFault_not_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_not_number'));
function rnot_number(i) {
    var x = !i;
    if (uceFault_not_number(i) || uceFault_not_number(i))
        assertEq(x, false /* = !99 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_not_object = eval(`(${uceFault})`.replace('uceFault', 'uceFault_not_object'));
function rnot_object(i) {
    var o = createIsHTMLDDA();
    var x = !o;
    if(uceFault_not_object(i) || uceFault_not_object(i))
        assertEq(x, true /* = !undefined = !document.all = !createIsHTMLDDA() */);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_compare_number_eq = eval(`(${uceFault})`.replace('uceFault', 'uceFault_compare_number_eq'));
function rcompare_number_eq(i) {
    var x = i == 99;
    if (uceFault_compare_number_eq(i) || uceFault_compare_number_eq(i))
        assertEq(x, true);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_compare_number_stricteq = eval(`(${uceFault})`.replace('uceFault', 'uceFault_compare_number_stricteq'));
function rcompare_number_stricteq(i) {
    var x = i === 99;
    if (uceFault_compare_number_stricteq(i) || uceFault_compare_number_stricteq(i))
        assertEq(x, true);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_compare_number_ne = eval(`(${uceFault})`.replace('uceFault', 'uceFault_compare_number_ne'));
function rcompare_number_ne(i) {
    var x = i != 99;
    if (uceFault_compare_number_ne(i) || uceFault_compare_number_ne(i))
        assertEq(x, false);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_compare_number_strictne = eval(`(${uceFault})`.replace('uceFault', 'uceFault_compare_number_strictne'));
function rcompare_number_strictne(i) {
    var x = i !== 99;
    if (uceFault_compare_number_strictne(i) || uceFault_compare_number_strictne(i))
        assertEq(x, false);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_compare_number_lt = eval(`(${uceFault})`.replace('uceFault', 'uceFault_compare_number_lt'));
function rcompare_number_lt(i) {
    var x = i < 99;
    if (uceFault_compare_number_lt(i) || uceFault_compare_number_lt(i))
        assertEq(x, false);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_compare_number_le = eval(`(${uceFault})`.replace('uceFault', 'uceFault_compare_number_le'));
function rcompare_number_le(i) {
    var x = i <= 99;
    if (uceFault_compare_number_le(i) || uceFault_compare_number_le(i))
        assertEq(x, true);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_compare_number_gt = eval(`(${uceFault})`.replace('uceFault', 'uceFault_compare_number_gt'));
function rcompare_number_gt(i) {
    var x = i > 99;
    if (uceFault_compare_number_gt(i) || uceFault_compare_number_gt(i))
        assertEq(x, false);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_compare_number_ge = eval(`(${uceFault})`.replace('uceFault', 'uceFault_compare_number_ge'));
function rcompare_number_ge(i) {
    var x = i >= 99;
    if (uceFault_compare_number_ge(i) || uceFault_compare_number_ge(i))
        assertEq(x, true);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_compare_string_eq = eval(`(${uceFault})`.replace('uceFault', 'uceFault_compare_string_eq'));
function rcompare_string_eq(i) {
    var x = String(i) == "99";
    if (uceFault_compare_string_eq(i) || uceFault_compare_string_eq(i))
        assertEq(x, true);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_compare_string_stricteq = eval(`(${uceFault})`.replace('uceFault', 'uceFault_compare_string_stricteq'));
function rcompare_string_stricteq(i) {
    var x = String(i) === "99";
    if (uceFault_compare_string_stricteq(i) || uceFault_compare_string_stricteq(i))
        assertEq(x, true);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_compare_string_ne = eval(`(${uceFault})`.replace('uceFault', 'uceFault_compare_string_ne'));
function rcompare_string_ne(i) {
    var x = String(i) != "99";
    if (uceFault_compare_string_ne(i) || uceFault_compare_string_ne(i))
        assertEq(x, false);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_compare_string_strictne = eval(`(${uceFault})`.replace('uceFault', 'uceFault_compare_string_strictne'));
function rcompare_string_strictne(i) {
    var x = String(i) !== "99";
    if (uceFault_compare_string_strictne(i) || uceFault_compare_string_strictne(i))
        assertEq(x, false);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_compare_string_lt = eval(`(${uceFault})`.replace('uceFault', 'uceFault_compare_string_lt'));
function rcompare_string_lt(i) {
    var x = String(i) < "99";
    if (uceFault_compare_string_lt(i) || uceFault_compare_string_lt(i))
        assertEq(x, false);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_compare_string_le = eval(`(${uceFault})`.replace('uceFault', 'uceFault_compare_string_le'));
function rcompare_string_le(i) {
    var x = String(i) <= "99";
    if (uceFault_compare_string_le(i) || uceFault_compare_string_le(i))
        assertEq(x, true);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_compare_string_gt = eval(`(${uceFault})`.replace('uceFault', 'uceFault_compare_string_gt'));
function rcompare_string_gt(i) {
    var x = String(i) > "99";
    if (uceFault_compare_string_gt(i) || uceFault_compare_string_gt(i))
        assertEq(x, false);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_compare_string_ge = eval(`(${uceFault})`.replace('uceFault', 'uceFault_compare_string_ge'));
function rcompare_string_ge(i) {
    var x = String(i) >= "99";
    if (uceFault_compare_string_ge(i) || uceFault_compare_string_ge(i))
        assertEq(x, true);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_compare_bigint_eq = eval(`(${uceFault})`.replace('uceFault', 'uceFault_compare_bigint_eq'));
function rcompare_bigint_eq(i) {
    var x = BigInt(i) == 99n;
    if (uceFault_compare_bigint_eq(i) || uceFault_compare_bigint_eq(i))
        assertEq(x, true);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_compare_bigint_stricteq = eval(`(${uceFault})`.replace('uceFault', 'uceFault_compare_bigint_stricteq'));
function rcompare_bigint_stricteq(i) {
    var x = BigInt(i) === 99n;
    if (uceFault_compare_bigint_stricteq(i) || uceFault_compare_bigint_stricteq(i))
        assertEq(x, true);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_compare_bigint_ne = eval(`(${uceFault})`.replace('uceFault', 'uceFault_compare_bigint_ne'));
function rcompare_bigint_ne(i) {
    var x = BigInt(i) != 99n;
    if (uceFault_compare_bigint_ne(i) || uceFault_compare_bigint_ne(i))
        assertEq(x, false);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_compare_bigint_strictne = eval(`(${uceFault})`.replace('uceFault', 'uceFault_compare_bigint_strictne'));
function rcompare_bigint_strictne(i) {
    var x = BigInt(i) !== 99n;
    if (uceFault_compare_bigint_strictne(i) || uceFault_compare_bigint_strictne(i))
        assertEq(x, false);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_compare_bigint_lt = eval(`(${uceFault})`.replace('uceFault', 'uceFault_compare_bigint_lt'));
function rcompare_bigint_lt(i) {
    var x = BigInt(i) < 99n;
    if (uceFault_compare_bigint_lt(i) || uceFault_compare_bigint_lt(i))
        assertEq(x, false);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_compare_bigint_le = eval(`(${uceFault})`.replace('uceFault', 'uceFault_compare_bigint_le'));
function rcompare_bigint_le(i) {
    var x = BigInt(i) <= 99n;
    if (uceFault_compare_bigint_le(i) || uceFault_compare_bigint_le(i))
        assertEq(x, true);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_compare_bigint_gt = eval(`(${uceFault})`.replace('uceFault', 'uceFault_compare_bigint_gt'));
function rcompare_bigint_gt(i) {
    var x = BigInt(i) > 99n;
    if (uceFault_compare_bigint_gt(i) || uceFault_compare_bigint_gt(i))
        assertEq(x, false);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_compare_bigint_ge = eval(`(${uceFault})`.replace('uceFault', 'uceFault_compare_bigint_ge'));
function rcompare_bigint_ge(i) {
    var x = BigInt(i) >= 99n;
    if (uceFault_compare_bigint_ge(i) || uceFault_compare_bigint_ge(i))
        assertEq(x, true);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_concat_string = eval(`(${uceFault})`.replace('uceFault', 'uceFault_concat_string'));
function rconcat_string(i) {
    var x = "s" + i.toString();
    if (uceFault_concat_string(i) || uceFault_concat_string(i))
        assertEq(x, "s99");
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_concat_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_concat_number'));
function rconcat_number(i) {
    var x = "s" + i;
    if (uceFault_concat_number(i) || uceFault_concat_number(i))
        assertEq(x, "s99");
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_string_length = eval(`(${uceFault})`.replace('uceFault', 'uceFault_string_length'));
function rstring_length(i) {
    var x = i.toString().length;
    if (uceFault_string_length(i) || uceFault_string_length(i))
        assertEq(x, 2);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_arguments_length_1 = eval(`(${uceFault})`.replace('uceFault', 'uceFault_arguments_length_1'));
function rarguments_length_1(i) {
    var x = arguments.length;
    if (uceFault_arguments_length_1(i) || uceFault_arguments_length_1(i))
        assertEq(x, 1);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_arguments_length_3 = eval(`(${uceFault})`.replace('uceFault', 'uceFault_arguments_length_3'));
function rarguments_length_3(i) {
    var x = arguments.length;
    if (uceFault_arguments_length_3(i) || uceFault_arguments_length_3(i))
        assertEq(x, 3);
    assertRecoveredOnBailout(x, true);
    return i;
}

function ret_argumentsLength() { return arguments.length; }

var uceFault_inline_arguments_length_1 = eval(`(${uceFault})`.replace('uceFault', 'uceFault_inline_arguments_length_1'));
function rinline_arguments_length_1(i) {
    var x = ret_argumentsLength.apply(this, arguments);
    if (uceFault_inline_arguments_length_1(i) || uceFault_inline_arguments_length_1(i))
        assertEq(x, 1);
    // We cannot garantee that the function would be inlined
    // assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_inline_arguments_length_3 = eval(`(${uceFault})`.replace('uceFault', 'uceFault_inline_arguments_length_3'));
function rinline_arguments_length_3(i) {
    var x = ret_argumentsLength.apply(this, arguments);
    if (uceFault_inline_arguments_length_3(i) || uceFault_inline_arguments_length_3(i))
        assertEq(x, 3);
    // We cannot garantee that the function would be inlined
    // assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_floor_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_floor_number'));
function rfloor_number(i) {
    var x = Math.floor(i + 0.1111);
    if (uceFault_floor_number(i) || uceFault_floor_number(i))
        assertEq(x, i);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_floor_object = eval(`(${uceFault})`.replace('uceFault', 'uceFault_floor_object'));
function rfloor_object(i) {
    var t = i + 0.1111;
    var o = { valueOf: function () { return t; } };
    var x = Math.floor(o);
    t = 1000.1111;
    if (uceFault_floor_object(i) || uceFault_floor_object(i))
        assertEq(x, i);
    assertRecoveredOnBailout(x, false);
    return i;
}

let uceFault_floor_double = eval(`(${uceFault})`.replace('uceFault', 'uceFault_floor_double'));
function rfloor_double(i) {
    const x = Math.floor(i + (-1 >>> 0));
    if (uceFault_floor_double(i) || uceFault_floor_double(i))
        assertEq(x, 99 + (-1 >>> 0)); /* = i + 2 ^ 32 - 1 */
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_ceil_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_ceil_number'));
function rceil_number(i) {
    var x = Math.ceil(-i - 0.12010799100);
    if (uceFault_ceil_number(i) || uceFault_ceil_number(i))
        assertEq(x, -i);
    assertRecoveredOnBailout(x, true);
    return i;
}

let uceFault_ceil_double = eval(`(${uceFault})`.replace('uceFault', 'uceFault_ceil_double'));
function rceil_double(i) {
    const x = Math.ceil(i + (-1 >>> 0));
    if (uceFault_ceil_double(i) || uceFault_ceil_double(i))
        assertEq(x, 99 + (-1 >>> 0)); /* = i + 2 ^ 32 - 1 */
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_round_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_round'));
function rround_number(i) {
    var x = Math.round(i + 1.4);
    if (uceFault_round_number(i) || uceFault_round_number(i))
        assertEq(x, 100); /* = i + 1*/
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_round_double = eval(`(${uceFault})`.replace('uceFault', 'uceFault_round_double'));
function rround_double(i) {
    var x = Math.round(i + (-1 >>> 0));
    if (uceFault_round_double(i) || uceFault_round_double(i))
        assertEq(x, 99 + (-1 >>> 0)); /* = i + 2 ^ 32 - 1 */
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_trunc_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_trunc_number'));
function rtrunc_number(i) {
    var x = Math.trunc(-i - 0.12010799100);
    if (uceFault_trunc_number(i) || uceFault_trunc_number(i))
        assertEq(x, -i);
    assertRecoveredOnBailout(x, true);
    return i;
}

let uceFault_trunc_double = eval(`(${uceFault})`.replace('uceFault', 'uceFault_trunc_double'));
function rtrunc_double(i) {
    const x = Math.trunc(i + (-1 >>> 0));
    if (uceFault_trunc_double(i) || uceFault_trunc_double(i))
        assertEq(x, 99 + (-1 >>> 0)); /* = i + 2 ^ 32 - 1 */
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_Char_Code_At = eval(`(${uceFault})`.replace('uceFault', 'uceFault_Char_Code_At'));
function rcharCodeAt(i) {
    var s = "aaaaa";
    var x = s.charCodeAt(i % 4);
    if (uceFault_Char_Code_At(i) || uceFault_Char_Code_At(i))
        assertEq(x, 97 );
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_from_char_code = eval(`(${uceFault})`.replace('uceFault', 'uceFault_from_char_code'));
function rfrom_char_code(i) {
    var x = String.fromCharCode(i);
    if (uceFault_from_char_code(i) || uceFault_from_char_code(i))
        assertEq(x, "c");
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_from_char_code_non_ascii = eval(`(${uceFault})`.replace('uceFault', 'uceFault_from_char_code_non_ascii'));
function rfrom_char_code_non_ascii(i) {
    var x = String.fromCharCode(i * 100);
    if (uceFault_from_char_code_non_ascii(i) || uceFault_from_char_code_non_ascii(i))
        assertEq(x, "\u26AC");
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_pow_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_pow_number'));
function rpow_number(i) {
    var x = Math.pow(i, 3.14159);
    if (uceFault_pow_number(i) || uceFault_pow_number(i))
        assertEq(x, Math.pow(99, 3.14159));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_pow_object = eval(`(${uceFault})`.replace('uceFault', 'uceFault_pow_object'));
function rpow_object(i) {
    var t = i;
    var o = { valueOf: function () { return t; } };
    var x = Math.pow(o, 3.14159); /* computed with t == i, not 1.5 */
    t = 1.5;
    if (uceFault_pow_object(i) || uceFault_pow_object(i))
        assertEq(x, Math.pow(99, 3.14159));
    assertRecoveredOnBailout(x, false);
    return i;
}

var uceFault_powhalf_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_powhalf_number'));
function rpowhalf_number(i) {
    var x = Math.pow(i, 0.5);
    if (uceFault_powhalf_number(i) || uceFault_powhalf_number(i))
        assertEq(x, Math.pow(99, 0.5));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_powhalf_object = eval(`(${uceFault})`.replace('uceFault', 'uceFault_powhalf_object'));
function rpowhalf_object(i) {
    var t = i;
    var o = { valueOf: function () { return t; } };
    var x = Math.pow(o, 0.5); /* computed with t == i, not 1.5 */
    t = 1.5;
    if (uceFault_powhalf_object(i) || uceFault_powhalf_object(i))
        assertEq(x, Math.pow(99, 0.5));
    assertRecoveredOnBailout(x, false);
    return i;
}

var uceFault_min_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_min_number'));
function rmin_number(i) {
    var x = Math.min(i, i-1, i-2.1);
    if (uceFault_min_number(i) || uceFault_min_number(i))
        assertEq(x, i-2.1);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_min_float = eval(`(${uceFault})`.replace('uceFault', 'uceFault_min_float'));
function rmin_float(i) {
    var x = Math.fround(Math.min(Math.fround(i), Math.fround(13.37)));
    if (uceFault_min_number(i) || uceFault_min_number(i))
        assertEq(x, Math.fround(13.37));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_min_object = eval(`(${uceFault})`.replace('uceFault', 'uceFault_min_object'));
function rmin_object(i) {
    var t = i;
    var o = { valueOf: function () { return t; } };
    var x = Math.min(o, o-1, o-2.1)
    t = 1000;
    if (uceFault_min_object(i) || uceFault_min_object(i))
        assertEq(x, i-2.1);
    assertRecoveredOnBailout(x, false);
    return i;
}

var uceFault_max_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_max_number'));
function rmax_number(i) {
    var x = Math.max(i, i-1, i-2.1);
    if (uceFault_max_number(i) || uceFault_max_number(i))
        assertEq(x, i);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_max_float = eval(`(${uceFault})`.replace('uceFault', 'uceFault_max_float'));
function rmax_float(i) {
    var x = Math.fround(Math.max(Math.fround(-i), Math.fround(13.37)));
    if (uceFault_max_number(i) || uceFault_max_number(i))
        assertEq(x, Math.fround(13.37));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_max_object = eval(`(${uceFault})`.replace('uceFault', 'uceFault_max_object'));
function rmax_object(i) {
    var t = i;
    var o = { valueOf: function () { return t; } };
    var x = Math.max(o, o-1, o-2.1)
    t = 1000;
    if (uceFault_max_object(i) || uceFault_max_object(i))
        assertEq(x, i);
    assertRecoveredOnBailout(x, false);
    return i;
}

var uceFault_abs = eval(`(${uceFault})`.replace('uceFault', 'uceFault_abs'));
function rabs_number(i) {
    var x = Math.abs(i-42);
    if (uceFault_abs(i) || uceFault_abs(i))
        assertEq(x, 57);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_abs_object = eval(`(${uceFault})`.replace('uceFault', 'uceFault_abs_object'));
function rabs_object(i) {
    var t = -i;
    var o = { valueOf: function() { return t; } };
    var x = Math.abs(o); /* computed with t == i, not 1000 */
    t = 1000;
    if(uceFault_abs_object(i) || uceFault_abs_object(i))
        assertEq(x, 99);
    assertRecoveredOnBailout(x, false);
    return i;
}

var uceFault_sqrt_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_sqrt_number'));
function rsqrt_number(i) {
    var x = Math.sqrt(i);
    if (uceFault_sqrt_number(i) || uceFault_sqrt_number(i))
        assertEq(x, Math.sqrt(99));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_sqrt_float = eval(`(${uceFault})`.replace('uceFault', 'uceFault_sqrt_float'));
function rsqrt_float(i) {
    var x = Math.fround(Math.sqrt(Math.fround(i)));
    if (uceFault_sqrt_float(i) || uceFault_sqrt_float(i))
        assertEq(x, Math.fround(Math.sqrt(Math.fround(99)))); /* != 9.9498743710662 (when computed with double sqrt) */
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_sqrt_object = eval(`(${uceFault})`.replace('uceFault', 'uceFault_sqrt_object'));
function rsqrt_object(i) {
    var t = i;
    var o = { valueOf: function () { return t; } };
    var x = Math.sqrt(o); /* computed with t == i, not 1.5 */
    t = 1.5;
    if (uceFault_sqrt_object(i) || uceFault_sqrt_object(i))
        assertEq(x, Math.sqrt(99));
    assertRecoveredOnBailout(x, false);
    return i;
}

var uceFault_atan2_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_atan2_number'));
function ratan2_number(i) {
    var x = Math.atan2(i, i+1);
    if (uceFault_atan2_number(i) || uceFault_atan2_number(i))
        assertEq(x, Math.atan2(99, 100));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_atan2_object = eval(`(${uceFault})`.replace('uceFault', 'uceFault_atan2_object'));
function ratan2_object(i) {
    var t = i;
    var o = { valueOf: function () { return t; } };
    var x = Math.atan2(o, o+1);
    t = 1000;
    if (uceFault_atan2_object(i) || uceFault_atan2_object(i))
        assertEq(x, Math.atan2(i, i+1));
    assertRecoveredOnBailout(x, false);
    return i;
}

var uceFault_str_split = eval(`(${uceFault})`.replace('uceFault', 'uceFault_str_split'))
function rstr_split(i) {
    var x = "str01234567899876543210rts".split("" + i);
    if (uceFault_str_split(i) || uceFault_str_split(i))
        assertEq(x[0], "str012345678");
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_regexp_exec = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_exec'))
function rregexp_exec(i) {
    var re = new RegExp("(str)\\d+" + i + "\\d+rts");
    var res = re.exec("str01234567899876543210rts");
    if (uceFault_regexp_exec(i) || uceFault_regexp_exec(i))
        assertEq(res[1], "str");
    assertRecoveredOnBailout(res, false);
    return i;
}
var uceFault_regexp_y_exec = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_y_exec'))
function rregexp_y_exec(i) {
    var re = new RegExp("(str)\\d+" + (i % 10), "y");
    var res = re.exec("str00123456789");
    if (uceFault_regexp_y_exec(i) || uceFault_regexp_y_exec(i))
        assertEq(res[1], "str");
    assertRecoveredOnBailout(res, false);
    assertEq(re.lastIndex == 0, false);
    return i;
}

var uceFault_regexp_y_literal_exec = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_y_literal_exec'))
function rregexp_y_literal_exec(i) {
    var re = /(str)\d*0/y;
    var res = re.exec("str00123456789");
    if (uceFault_regexp_y_literal_exec(i) || uceFault_regexp_y_literal_exec(i))
        assertEq(res[1], "str");
    assertRecoveredOnBailout(res, false);
    assertEq(re.lastIndex == 0, false);
    return i;
}

var uceFault_regexp_g_exec = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_g_exec'))
function rregexp_g_exec(i) {
    var re = new RegExp("(str)\\d+" + (i % 10), "g");
    var res = re.exec("str00123456789str00123456789");
    if (uceFault_regexp_g_exec(i) || uceFault_regexp_g_exec(i))
        assertEq(res[1], "str");
    assertRecoveredOnBailout(res, false);
    assertEq(re.lastIndex == 0, false);
    return i;
}

var uceFault_regexp_g_literal_exec = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_g_literal_exec'))
function rregexp_g_literal_exec(i) {
    var re = /(str)\d*0/g;
    var res = re.exec("str00123456789str00123456789");
    if (uceFault_regexp_g_literal_exec(i) || uceFault_regexp_g_literal_exec(i))
        assertEq(res[1], "str");
    assertRecoveredOnBailout(res, false);
    assertEq(re.lastIndex == 0, false);
    return i;
}

var uceFault_regexp_i_exec = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_i_exec'))
function rregexp_i_exec(i) {
    var re = new RegExp("(str)\\d+" + (i % 10), "i");
    var res = re.exec("STR00123456789");
    if (uceFault_regexp_i_exec(i) || uceFault_regexp_i_exec(i))
        assertEq(res[1], "STR");
    assertRecoveredOnBailout(res, false);
    assertEq(re.lastIndex == 0, true);
    return i;
}

var uceFault_regexp_i_literal_exec = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_i_literal_exec'))
function rregexp_i_literal_exec(i) {
    var re = /(str)\d*0/i;
    var res = re.exec("STR00123456789");
    if (uceFault_regexp_i_literal_exec(i) || uceFault_regexp_i_literal_exec(i))
        assertEq(res[1], "STR");
    assertRecoveredOnBailout(res, false);
    assertEq(re.lastIndex == 0, true);
    return i;
}


var uceFault_regexp_m_exec = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_m_exec'))
function rregexp_m_exec(i) {
    var re = new RegExp("^(str)\\d+" + (i % 10), "m");
    var res = re.exec("abc\nstr00123456789");
    if (uceFault_regexp_m_exec(i) || uceFault_regexp_m_exec(i))
        assertEq(res[1], "str");
    assertRecoveredOnBailout(res, false);
    assertEq(re.lastIndex == 0, true);
    return i;
}

var uceFault_regexp_m_literal_exec = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_m_literal_exec'))
function rregexp_m_literal_exec(i) {
    var re = /^(str)\d*0/m;
    var res = re.exec("abc\nstr00123456789");
    if (uceFault_regexp_m_literal_exec(i) || uceFault_regexp_m_literal_exec(i))
        assertEq(res[1], "str");
    assertRecoveredOnBailout(res, false);
    assertEq(re.lastIndex == 0, true);
    return i;
}

var uceFault_regexp_test = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_test'))
function rregexp_test(i) {
    var re = new RegExp("str\\d+" + i + "\\d+rts");
    var res = re.test("str01234567899876543210rts");
    if (uceFault_regexp_test(i) || uceFault_regexp_test(i))
        assertEq(res, true);
    assertRecoveredOnBailout(res, false);
    return i;
}

var uceFault_regexp_y_test = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_y_test'))
function rregexp_y_test(i) {
    var re = new RegExp("str\\d+" + (i % 10), "y");
    var res = re.test("str00123456789");
    if (uceFault_regexp_y_test(i) || uceFault_regexp_y_test(i))
        assertEq(res, true);
    assertRecoveredOnBailout(res, false);
    assertEq(re.lastIndex == 0, false);
    return i;
}

var uceFault_regexp_y_literal_test = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_y_literal_test'))
function rregexp_y_literal_test(i) {
    var re = /str\d*0/y;
    var res = re.test("str00123456789");
    if (uceFault_regexp_y_literal_test(i) || uceFault_regexp_y_literal_test(i))
        assertEq(res, true);
    assertRecoveredOnBailout(res, false);
    assertEq(re.lastIndex == 0, false);
    return i;
}

var uceFault_regexp_g_test = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_g_test'))
function rregexp_g_test(i) {
    var re = new RegExp("str\\d+" + (i % 10), "g");
    var res = re.test("str00123456789str00123456789");
    if (uceFault_regexp_g_test(i) || uceFault_regexp_g_test(i))
        assertEq(res, true);
    assertRecoveredOnBailout(res, false);
    assertEq(re.lastIndex == 0, false);
    return i;
}

var uceFault_regexp_g_literal_test = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_g_literal_test'))
function rregexp_g_literal_test(i) {
    var re = /str\d*0/g;
    var res = re.test("str00123456789str00123456789");
    if (uceFault_regexp_g_literal_test(i) || uceFault_regexp_g_literal_test(i))
        assertEq(res, true);
    assertRecoveredOnBailout(res, false);
    assertEq(re.lastIndex == 0, false);
    return i;
}

var uceFault_regexp_i_test = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_i_test'))
function rregexp_i_test(i) {
    var re = new RegExp("str\\d+" + (i % 10), "i");
    var res = re.test("STR00123456789");
    if (uceFault_regexp_i_test(i) || uceFault_regexp_i_test(i))
        assertEq(res, true);
    assertRecoveredOnBailout(res, false);
    assertEq(re.lastIndex == 0, true);
    return i;
}

var uceFault_regexp_i_literal_test = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_i_literal_test'))
function rregexp_i_literal_test(i) {
    var re = /str\d*0/i;
    var res = re.test("STR00123456789");
    if (uceFault_regexp_i_literal_test(i) || uceFault_regexp_i_literal_test(i))
        assertEq(res, true);
    assertRecoveredOnBailout(res, false);
    assertEq(re.lastIndex == 0, true);
    return i;
}

var uceFault_regexp_m_test = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_m_test'))
function rregexp_m_test(i) {
    var re = new RegExp("^str\\d+" + (i % 10), "m");
    var res = re.test("abc\nstr00123456789");
    if (uceFault_regexp_m_test(i) || uceFault_regexp_m_test(i))
        assertEq(res, true);
    assertRecoveredOnBailout(res, false);
    assertEq(re.lastIndex == 0, true);
    return i;
}

var uceFault_regexp_m_literal_test = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_m_literal_test'))
function rregexp_m_literal_test(i) {
    var re = /^str\d*0/m;
    var res = re.test("abc\nstr00123456789");
    if (uceFault_regexp_m_literal_test(i) || uceFault_regexp_m_literal_test(i))
        assertEq(res, true);
    assertRecoveredOnBailout(res, false);
    assertEq(re.lastIndex == 0, true);
    return i;
}

var uceFault_regexp_replace = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_replace'))
function rregexp_replace(i) {
    var re = new RegExp("str\\d+" + (i % 10));
    var res = "str00123456789".replace(re, "abc");
    if (uceFault_regexp_replace(i) || uceFault_regexp_replace(i))
        assertEq(res, "abc");
    assertRecoveredOnBailout(res, false);
    return i;
}

var uceFault_regexp_y_replace = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_y_replace'))
function rregexp_y_replace(i) {
    var re = new RegExp("str\\d+" + (i % 10), "y");
    re.test("str00123456789");
    assertEq(re.lastIndex == 0, false);

    var res = "str00123456789".replace(re, "abc");

    assertEq(re.lastIndex, 0);

    assertEq(res, "str00123456789");

    res = "str00123456789".replace(re, "abc");
    assertEq(re.lastIndex == 0, false);

    if (uceFault_regexp_y_replace(i) || uceFault_regexp_y_replace(i))
        assertEq(res, "abc");
    assertRecoveredOnBailout(res, false);
    return i;
}

var uceFault_regexp_y_literal_replace = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_y_literal_replace'))
function rregexp_y_literal_replace(i) {
    var re = /str\d+9/y;
    re.test("str00123456789");
    assertEq(re.lastIndex == 0, false);

    var res = "str00123456789".replace(re, "abc");

    assertEq(re.lastIndex, 0);

    assertEq(res, "str00123456789");

    res = "str00123456789".replace(re, "abc");
    assertEq(re.lastIndex == 0, false);

    if (uceFault_regexp_y_literal_replace(i) || uceFault_regexp_y_literal_replace(i))
        assertEq(res, "abc");
    assertRecoveredOnBailout(res, false);
    return i;
}

var uceFault_regexp_g_replace = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_g_replace'))
function rregexp_g_replace(i) {
    var re = new RegExp("str\\d+" + (i % 10), "g");
    re.test("str00123456789");
    assertEq(re.lastIndex == 0, false);

    var res = "str00123456789".replace(re, "abc");

    // replace will always zero the lastIndex field, even if it was not zero before.
    assertEq(re.lastIndex == 0, true);

    if (uceFault_regexp_g_replace(i) || uceFault_regexp_g_replace(i))
        assertEq(res, "abc");
    assertRecoveredOnBailout(res, false);
    return i;
}

var uceFault_regexp_g_literal_replace = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_g_literal_replace'))
function rregexp_g_literal_replace(i) {
    var re = /str\d+9/g;
    re.test("str00123456789");
    assertEq(re.lastIndex == 0, false);

    var res = "str00123456789".replace(re, "abc");

    // replace will zero the lastIndex field.
    assertEq(re.lastIndex == 0, true);

    if (uceFault_regexp_g_literal_replace(i) || uceFault_regexp_g_literal_replace(i))
        assertEq(res, "abc");
    assertRecoveredOnBailout(res, false);
    return i;
}

var uceFault_regexp_i_replace = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_i_replace'))
function rregexp_i_replace(i) {
    var re = new RegExp("str\\d+" + (i % 10), "i");
    re.test("STR00123456789");
    assertEq(re.lastIndex == 0, true);

    var res = "STR00123456789".replace(re, "abc");

    assertEq(re.lastIndex == 0, true);

    if (uceFault_regexp_i_replace(i) || uceFault_regexp_i_replace(i))
        assertEq(res, "abc");
    assertRecoveredOnBailout(res, false);
    return i;
}

var uceFault_regexp_i_literal_replace = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_i_literal_replace'))
function rregexp_i_literal_replace(i) {
    var re = /str\d+9/i;
    re.test("STR00123456789");
    assertEq(re.lastIndex == 0, true);

    var res = "str00123456789".replace(re, "abc");

    assertEq(re.lastIndex == 0, true);

    if (uceFault_regexp_i_literal_replace(i) || uceFault_regexp_i_literal_replace(i))
        assertEq(res, "abc");
    assertRecoveredOnBailout(res, false);
    return i;
}

var uceFault_regexp_m_replace = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_m_replace'))
function rregexp_m_replace(i) {
    var re = new RegExp("^str\\d+" + (i % 10), "m");
    re.test("abc\nstr00123456789");
    assertEq(re.lastIndex == 0, true);

    var res = "abc\nstr00123456789".replace(re, "abc");

    assertEq(re.lastIndex == 0, true);

    if (uceFault_regexp_m_replace(i) || uceFault_regexp_m_replace(i))
        assertEq(res, "abc\nabc");
    assertRecoveredOnBailout(res, false);
    return i;
}

var uceFault_regexp_m_literal_replace = eval(`(${uceFault})`.replace('uceFault', 'uceFault_regexp_m_literal_replace'))
function rregexp_m_literal_replace(i) {
    var re = /^str\d+9/m;
    re.test("abc\nstr00123456789");
    assertEq(re.lastIndex == 0, true);

    var res = "abc\nstr00123456789".replace(re, "abc");

    assertEq(re.lastIndex == 0, true);

    if (uceFault_regexp_m_literal_replace(i) || uceFault_regexp_m_literal_replace(i))
        assertEq(res, "abc\nabc");
    assertRecoveredOnBailout(res, false);
    return i;
}

var uceFault_string_replace = eval(`(${uceFault})`.replace('uceFault', 'uceFault_string_replace'))
function rstring_replace(i) {
    var re = /str\d+9/;

    assertEq(re.lastIndex == 0, true);
    var res = "str00123456789".replace(re, "abc");
    if (uceFault_string_replace(i) || uceFault_string_replace(i))
        assertEq(res, "abc");
    assertRecoveredOnBailout(res, false);
    assertEq(re.lastIndex == 0, true);
    return i;
}

var uceFault_string_replace_y = eval(`(${uceFault})`.replace('uceFault', 'uceFault_string_replace_y'))
function rstring_replace_y(i) {
    var re = /str\d+9/y;

    assertEq(re.lastIndex == 0, true);
    var res = "str00123456789".replace(re, "abc");
    if (uceFault_string_replace_y(i) || uceFault_string_replace_y(i))
        assertEq(res, "abc");
    assertRecoveredOnBailout(res, false);
    assertEq(re.lastIndex == 0, false);
    return i;
}

var uceFault_string_replace_g = eval(`(${uceFault})`.replace('uceFault', 'uceFault_string_replace_g'))
function rstring_replace_g(i) {
    var re = /str\d+9/g;

    assertEq(re.lastIndex == 0, true);
    var res = "str00123456789str00123456789".replace(re, "abc");
    if (uceFault_string_replace_g(i) || uceFault_string_replace_g(i))
        assertEq(res, "abcabc");
    assertRecoveredOnBailout(res, false);
    assertEq(re.lastIndex == 0, true);
    return i;
}

var uceFault_string_slice = eval(`(${uceFault})`.replace('uceFault', 'uceFault_string_slice'))
function rstring_slice(i) {
    var res = "str00123456789".slice(0, 3);
    if (uceFault_string_slice(i) || uceFault_string_slice(i))
        assertEq(res, "str");
    assertRecoveredOnBailout(res, false);
    return i;
}

var uceFault_string_substring = eval(`(${uceFault})`.replace('uceFault', 'uceFault_string_substring'))
function rstring_substring(i) {
    var res = "str00123456789".substring(0, 3);
    if (uceFault_string_substring(i) || uceFault_string_substring(i))
        assertEq(res, "str");
    assertRecoveredOnBailout(res, false);
    return i;
}

var uceFault_typeof = eval(`(${uceFault})`.replace('uceFault', 'uceFault_typeof'))
function rtypeof(i) {
    var inputs = [ {}, [], 1, true, undefined, function(){}, null, Symbol() ];
    var types = [ "object", "object", "number", "boolean", "undefined", "function", "object", "symbol"];

    var x = typeof (inputs[i % inputs.length]);
    var y = types[i % types.length];

    if (uceFault_typeof(i) || uceFault_typeof(i))
        assertEq(x, y);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_todouble_value = eval(`(${uceFault})`.replace('uceFault', 'uceFault_todouble_value'))
function rtodouble_value(i) {
    var a = 1;
    if (i == 1000) a = "1";

    var x = a < 8.1;

    if (uceFault_todouble_value(i) || uceFault_todouble_value(i))
        assertEq(x, true);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_todouble_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_todouble_number'));
function rtodouble_number(i) {
    var x = Math.fround(Math.fround(i) + Math.fround(i)) + 1;
    if (uceFault_todouble_number(i) || uceFault_todouble_number(i))
        assertEq(2 * i + 1, x);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_tofloat32_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_tofloat32_number'));
function rtofloat32_number(i) {
    var x = Math.fround(i + 0.1111111111);
    if (uceFault_tofloat32_number(i) || uceFault_tofloat32_number(i))
        assertEq(x, Math.fround(99.1111111111));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_tofloat32_object = eval(`(${uceFault})`.replace('uceFault', 'uceFault_tofloat32_object'));
function rtofloat32_object(i) {
    var t = i + 0.1111111111;
    var o = { valueOf: function () { return t; } };
    var x = Math.fround(o);
    t = 1000.1111111111;
    if (uceFault_tofloat32_object(i) || uceFault_tofloat32_object(i))
        assertEq(x, Math.fround(99.1111111111));
    assertRecoveredOnBailout(x, false);
    return i;
}

var uceFault_trunc_to_int32_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_trunc_to_int32_number'));
function rtrunc_to_int32_number(i) {
    var x = (i + 0.12) | 0;
    if (uceFault_trunc_to_int32_number(i) || uceFault_trunc_to_int32_number(i))
        assertEq(x, (i + 0.12) | 0);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_trunc_to_int32_object = eval(`(${uceFault})`.replace('uceFault', 'uceFault_trunc_to_int32_object'));
function rtrunc_to_int32_object(i) {
    var t1 = i + 0.12;
    var o1 = { valueOf: function() { return t1; } };
    var x = o1 | 0;
    t1 = 777.12;
    if (uceFault_trunc_to_int32_object(i) || uceFault_trunc_to_int32_object(i))
        assertEq(x, (i + 0.12) | 0);
    assertRecoveredOnBailout(x, false);
}

var uceFault_trunc_to_int32_string = eval(`(${uceFault})`.replace('uceFault', 'uceFault_trunc_to_int32_string'));
function rtrunc_to_int32_string(i) {
    var x = (i + "0") | 0;
    if (uceFault_trunc_to_int32_string(i) || uceFault_trunc_to_int32_string(i))
        assertEq(x, (i + "0") | 0);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_hypot_number_2args = eval(`(${uceFault})`.replace('uceFault', 'uceFault_hypot_number_2args'));
function rhypot_number_2args(i) {
    var x = Math.hypot(i, i + 1);
    if (uceFault_hypot_number_2args(i) || uceFault_hypot_number_2args(i))
        assertEq(x, Math.sqrt(i * i + (i + 1) * (i + 1)));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_hypot_number_3args = eval(`(${uceFault})`.replace('uceFault', 'uceFault_hypot_number_3args'));
function rhypot_number_3args(i) {
    var x = Math.hypot(i, i + 1, i + 2);
    if (uceFault_hypot_number_3args(i) || uceFault_hypot_number_3args(i))
        assertEq(x, Math.sqrt(i * i + (i + 1) * (i + 1) + (i + 2) * (i + 2)));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_hypot_number_4args = eval(`(${uceFault})`.replace('uceFault', 'uceFault_hypot_number_4args'));
function rhypot_number_4args(i) {
    var x = Math.hypot(i, i + 1, i + 2, i + 3);
    if (uceFault_hypot_number_4args(i) || uceFault_hypot_number_4args(i))
        assertEq(x, Math.sqrt(i * i + (i + 1) * (i + 1) + (i + 2) * (i + 2) + (i + 3) * (i + 3)));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_hypot_object_2args = eval(`(${uceFault})`.replace('uceFault', 'uceFault_hypot_object_2args'));
function rhypot_object_2args(i) {
    var t0 = i;
    var t1 = i + 1;
    var o0 = { valueOf: function () { return t0; } };
    var o1 = { valueOf: function () { return t1; } };
    var x = Math.hypot(o0, o1);
    t0 = 1000;
    t1 = 2000;
    if (uceFault_hypot_object_2args(i) || uceFault_hypot_object_2args(i) )
        assertEq(x, Math.sqrt(i * i + (i + 1) * (i + 1)));
    assertRecoveredOnBailout(x, false);
    return i;
}

var uceFault_hypot_object_3args = eval(`(${uceFault})`.replace('uceFault', 'uceFault_hypot_object_3args'));
function rhypot_object_3args(i) {
    var t0 = i;
    var t1 = i + 1;
    var t2 = i + 2;
    var o0 = { valueOf: function () { return t0; } };
    var o1 = { valueOf: function () { return t1; } };
    var o2 = { valueOf: function () { return t2; } };
    var x = Math.hypot(o0, o1, o2);
    t0 = 1000;
    t1 = 2000;
    t2 = 3000;
    if (uceFault_hypot_object_3args(i) || uceFault_hypot_object_3args(i) )
        assertEq(x, Math.sqrt(i * i + (i + 1) * (i + 1) + (i + 2) * (i + 2)));
    assertRecoveredOnBailout(x, false);
    return i;
}

var uceFault_hypot_object_4args = eval(`(${uceFault})`.replace('uceFault', 'uceFault_hypot_object_4args'));
function rhypot_object_4args(i) {
    var t0 = i;
    var t1 = i + 1;
    var t2 = i + 2;
    var t3 = i + 3;
    var o0 = { valueOf: function () { return t0; } };
    var o1 = { valueOf: function () { return t1; } };
    var o2 = { valueOf: function () { return t2; } };
    var o3 = { valueOf: function () { return t3; } };
    var x = Math.hypot(o0, o1, o2, o3);
    t0 = 1000;
    t1 = 2000;
    t2 = 3000;
    t3 = 4000;
    if (uceFault_hypot_object_4args(i) || uceFault_hypot_object_4args(i) )
        assertEq(x, Math.sqrt(i * i + (i + 1) * (i + 1) + (i + 2) * (i + 2) + (i + 3) * (i + 3)));
    assertRecoveredOnBailout(x, false);
    return i;
}

var uceFault_random = eval(`(${uceFault})`.replace('uceFault', 'uceFault_random'));
function rrandom(i) {
    // setRNGState() exists only in debug builds
    if(config.debug) setRNGState(2, 1+i);

    var x = Math.random();
    if (uceFault_random(i) || uceFault_random(i)) {
      // TODO(Warp): Conditional operator ?: prevents recovering operands.
      // assertEq(x, config.debug ? setRNGState(2, 1+i) || Math.random() : x);
      if (config.debug) {
        assertEq(x, setRNGState(2, 1+i) || Math.random());
      } else {
        assertEq(x, x);
      }
    }
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_sin_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_sin_number'));
function rsin_number(i) {
    var x = Math.sin(i);
    if (uceFault_sin_number(i) || uceFault_sin_number(i))
        assertEq(x, Math.sin(i));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_sin_object = eval(`(${uceFault})`.replace('uceFault', 'uceFault_sin_object'));
function rsin_object(i) {
    var t = i;
    var o = { valueOf: function() { return t; } };
    var x = Math.sin(o);
    t = 777;
    if (uceFault_sin_object(i) || uceFault_sin_object(i))
        assertEq(x, Math.sin(i));
    assertRecoveredOnBailout(x, false);
    return i;
}

var uceFault_log_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_log_number'));
function rlog_number(i) {
    var x = Math.log(i);
    if (uceFault_log_number(i) || uceFault_log_number(i))
        assertEq(x, Math.log(99) /* log(99) */);
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_log_object = eval(`(${uceFault})`.replace('uceFault', 'uceFault_log_object'));
function rlog_object(i) {
    var t = i;
    var o = { valueOf: function() { return t; } };
    var x = Math.log(o); /* Evaluated with t == i, not t == 1000 */
    t = 1000;
    if (uceFault_log_object(i) || uceFault_log_object(i))
        assertEq(x, Math.log(99) /* log(99) */);
    assertRecoveredOnBailout(x, false);
    return i;
}

var uceFault_cos_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_cos_number'));
function rcos_number(i) {
    var x = Math.cos(i);
    if (uceFault_cos_number(i) || uceFault_cos_number(i))
        assertEq(x, Math.cos(99));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_tan_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_tan_number'));
function rtan_number(i) {
    var x = Math.tan(i);
    if (uceFault_tan_number(i) || uceFault_tan_number(i))
        assertEq(x, Math.tan(99));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_exp_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_exp_number'));
function rexp_number(i) {
    var x = Math.exp(i);
    if (uceFault_exp_number(i) || uceFault_exp_number(i))
        assertEq(x, Math.exp(99));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_acos_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_acos_number'));
function racos_number(i) {
    var x = Math.acos(1 / i);
    if (uceFault_acos_number(i) || uceFault_acos_number(i))
        assertEq(x, Math.acos(1 / 99));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_asin_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_asin_number'));
function rasin_number(i) {
    var x = Math.asin(1 / i);
    if (uceFault_asin_number(i) || uceFault_asin_number(i))
        assertEq(x, Math.asin(1 / 99));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_atan_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_atan_number'));
function ratan_number(i) {
    var x = Math.atan(i);
    if (uceFault_atan_number(i) || uceFault_atan_number(i))
        assertEq(x, Math.atan(99));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_log10_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_log10_number'));
function rlog10_number(i) {
    var x = Math.log10(i);
    if (uceFault_log10_number(i) || uceFault_log10_number(i))
        assertEq(x, Math.log10(99));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_log2_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_log2_number'));
function rlog2_number(i) {
    var x = Math.log2(i);
    if (uceFault_log2_number(i) || uceFault_log2_number(i))
        assertEq(x, Math.log2(99));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_log1p_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_log1p_number'));
function rlog1p_number(i) {
    var x = Math.log1p(i);
    if (uceFault_log1p_number(i) || uceFault_log1p_number(i))
        assertEq(x, Math.log1p(99));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_expm1_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_expm1_number'));
function rexpm1_number(i) {
    var x = Math.expm1(i);
    if (uceFault_expm1_number(i) || uceFault_expm1_number(i))
        assertEq(x, Math.expm1(99));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_cosh_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_cosh_number'));
function rcosh_number(i) {
    var x = Math.cosh(i);
    if (uceFault_cosh_number(i) || uceFault_cosh_number(i))
        assertEq(x, Math.cosh(99));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_sinh_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_sinh_number'));
function rsinh_number(i) {
    var x = Math.sinh(i);
    if (uceFault_sinh_number(i) || uceFault_sinh_number(i))
        assertEq(x, Math.sinh(99));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_tanh_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_tanh_number'));
function rtanh_number(i) {
    var x = Math.tanh(1 / i);
    if (uceFault_tanh_number(i) || uceFault_tanh_number(i))
        assertEq(x, Math.tanh(1 / 99));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_acosh_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_acosh_number'));
function racosh_number(i) {
    var x = Math.acosh(i);
    if (uceFault_acosh_number(i) || uceFault_acosh_number(i))
        assertEq(x, Math.acosh(99));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_asinh_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_asinh_number'));
function rasinh_number(i) {
    var x = Math.asinh(i);
    if (uceFault_asinh_number(i) || uceFault_asinh_number(i))
        assertEq(x, Math.asinh(99));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_atanh_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_atanh_number'));
function ratanh_number(i) {
    var x = Math.atanh(1 / i);
    if (uceFault_atanh_number(i) || uceFault_atanh_number(i))
        assertEq(x, Math.atanh(1 / 99));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_cbrt_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_cbrt_number'));
function rcbrt_number(i) {
    var x = Math.cbrt(i);
    if (uceFault_cbrt_number(i) || uceFault_cbrt_number(i))
        assertEq(x, Math.cbrt(99));
    assertRecoveredOnBailout(x, true);
    return i;
}

var uceFault_sign_number = eval(`(${uceFault})`.replace('uceFault', 'uceFault_sign_number'));
function rsign_number(i) {
    var x = Math.sign(-i - 0.12010799100);
    if (uceFault_sign_number(i) || uceFault_sign_number(i))
        assertEq(x, Math.sign(-10));
    assertRecoveredOnBailout(x, true);
    return i;
}

let uceFault_sign_double = eval(`(${uceFault})`.replace('uceFault', 'uceFault_sign_double'));
function rsign_double(i) {
    const x = Math.sign(i + (-1 >>> 0));
    if (uceFault_sign_double(i) || uceFault_sign_double(i))
        assertEq(x, Math.sign(10));
    assertRecoveredOnBailout(x, true);
    return i;
}

let uceFault_add_bigint = eval(`(${uceFault})`.replace('uceFault', 'uceFault_add_bigint'));
function rbigintadd(i) {
    var x = 1n + i;
    if (uceFault_add_bigint(i) || uceFault_add_bigint(i))
        assertEq(x, 100n  /* = 1 + 99 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

let uceFault_sub_bigint = eval(`(${uceFault})`.replace('uceFault', 'uceFault_sub_bigint'));
function rbigintsub(i) {
    var x = 1n - i;
    if (uceFault_sub_bigint(i) || uceFault_sub_bigint(i))
        assertEq(x, -98n  /* = 1 - 99 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

let uceFault_mul_bigint = eval(`(${uceFault})`.replace('uceFault', 'uceFault_mul_bigint'));
function rbigintmul(i) {
    var x = 2n * i;
    if (uceFault_mul_bigint(i) || uceFault_mul_bigint(i))
        assertEq(x, 198n  /* = 2 * 99 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

let uceFault_div_bigint = eval(`(${uceFault})`.replace('uceFault', 'uceFault_div_bigint'));
function rbigintdiv(i) {
    var x = i / 3n;
    if (uceFault_div_bigint(i) || uceFault_div_bigint(i))
        assertEq(x, 33n  /* = 99 / 3 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

let uceFault_mod_bigint = eval(`(${uceFault})`.replace('uceFault', 'uceFault_mod_bigint'));
function rbigintmod(i) {
    var x = i % 2n;
    if (uceFault_mod_bigint(i) || uceFault_mod_bigint(i))
        assertEq(x, 1n  /* = 99 % 2 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

let uceFault_pow_bigint = eval(`(${uceFault})`.replace('uceFault', 'uceFault_pow_bigint'));
function rbigintpow(i) {
    var x = i ** 2n;
    if (uceFault_pow_bigint(i) || uceFault_pow_bigint(i))
        assertEq(x, 9801n  /* = 99 ** 2 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

let uceFault_inc_bigint = eval(`(${uceFault})`.replace('uceFault', 'uceFault_inc_bigint'));
function rbigintinc(i) {
    var x = i;
    x++;
    if (uceFault_inc_bigint(i) || uceFault_inc_bigint(i))
        assertEq(x, 100n  /* = 99 + 1 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

let uceFault_dec_bigint = eval(`(${uceFault})`.replace('uceFault', 'uceFault_dec_bigint'));
function rbigintdec(i) {
    var x = i;
    x--;
    if (uceFault_dec_bigint(i) || uceFault_dec_bigint(i))
        assertEq(x, 98n  /* = 99 - 1 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

let uceFault_neg_bigint = eval(`(${uceFault})`.replace('uceFault', 'uceFault_neg_bigint'));
function rbigintneg(i) {
    var x = -i;
    if (uceFault_neg_bigint(i) || uceFault_neg_bigint(i))
        assertEq(x, -99n);
    assertRecoveredOnBailout(x, true);
    return i;
}

let uceFault_bitand_bigint = eval(`(${uceFault})`.replace('uceFault', 'uceFault_bitand_bigint'));
function rbigintbitand(i) {
    var x = 1n & i;
    if (uceFault_bitand_bigint(i) || uceFault_bitand_bigint(i))
        assertEq(x, 1n  /* = 1 & 99 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

let uceFault_bitor_bigint = eval(`(${uceFault})`.replace('uceFault', 'uceFault_bitor_bigint'));
function rbigintbitor(i) {
    var x = i | -100n; /* -100 == ~99 */
    if (uceFault_bitor_bigint(i) || uceFault_bitor_bigint(i))
        assertEq(x, -1n) /* ~99 | 99 = -1 */
    assertRecoveredOnBailout(x, true);
    return i;
}

let uceFault_bitxor_bigint = eval(`(${uceFault})`.replace('uceFault', 'uceFault_bitxor_bigint'));
function rbigintbitxor(i) {
    var x = 1n ^ i;
    if (uceFault_bitxor_bigint(i) || uceFault_bitxor_bigint(i))
        assertEq(x, 98n  /* = 1 XOR 99 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

let uceFault_bitnot_bigint = eval(`(${uceFault})`.replace('uceFault', 'uceFault_bitnot_bigint'));
function rbigintbitnot(i) {
    var x = ~i;
    if (uceFault_bitnot_bigint(i) || uceFault_bitnot_bigint(i))
        assertEq(x, -100n  /* = ~99 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

let uceFault_lsh_bigint = eval(`(${uceFault})`.replace('uceFault', 'uceFault_lsh_bigint'));
function rbigintlsh(i) {
    var x = i << 1n;
    if (uceFault_lsh_bigint(i) || uceFault_lsh_bigint(i))
        assertEq(x, 198n); /* 99 << 1 == 198 */
    assertRecoveredOnBailout(x, true);
    return i;
}

let uceFault_rsh_bigint = eval(`(${uceFault})`.replace('uceFault', 'uceFault_rsh_bigint'));
function rbigintrsh(i) {
    var x = i >> 1n;
    if (uceFault_rsh_bigint(i) || uceFault_rsh_bigint(i))
        assertEq(x, 49n  /* = 99 >> 1 */);
    assertRecoveredOnBailout(x, true);
    return i;
}

let uceFault_bigintasint = eval(`(${uceFault})`.replace('uceFault', 'uceFault_bigintasint'));
function rbigintasint(i) {
    var x = BigInt.asIntN(6, i);
    if (uceFault_bigintasint(i) || uceFault_bigintasint(i))
        assertEq(x, -29n);
    assertRecoveredOnBailout(x, true);
    return i;
}

let uceFault_bigintasuint = eval(`(${uceFault})`.replace('uceFault', 'uceFault_bigintasuint'));
function rbigintasuint(i) {
    var x = BigInt.asUintN(6, i);
    if (uceFault_bigintasuint(i) || uceFault_bigintasuint(i))
        assertEq(x, 35n);
    assertRecoveredOnBailout(x, true);
    return i;
}

let uceFault_nantozero_nan = eval(`(${uceFault})`.replace('uceFault', 'uceFault_nantozero_nan'));
function rnantozero_nan(i) {
    // Note: |x| must be Double-typed.
    var x = (i + 0.5) * NaN;
    var y = x ? x : +0;
    if (uceFault_nantozero_nan(i) || uceFault_nantozero_nan(i))
        assertEq(y, +0);
    assertRecoveredOnBailout(y, true);
    return i;
}

let uceFault_nantozero_poszero = eval(`(${uceFault})`.replace('uceFault', 'uceFault_nantozero_poszero'));
function rnantozero_poszero(i) {
    // Note: |x| must be Double-typed.
    var x = (i + 0.5) * +0;
    var y = x ? x : +0;
    if (uceFault_nantozero_poszero(i) || uceFault_nantozero_poszero(i))
        assertEq(y, +0);
    assertRecoveredOnBailout(y, true);
    return i;
}

let uceFault_nantozero_negzero = eval(`(${uceFault})`.replace('uceFault', 'uceFault_nantozero_negzero'));
function rnantozero_negzero(i) {
    // Note: |x| must be Double-typed.
    var x = (i + 0.5) * -0;
    var y = x ? x : +0;
    if (uceFault_nantozero_negzero(i) || uceFault_nantozero_negzero(i))
        assertEq(y, +0);
    assertRecoveredOnBailout(y, true);
    return i;
}

for (j = 100 - max; j < 100; j++) {
    with({}){} // Do not Ion-compile this loop.
    let i = j < 2 ? (Math.abs(j) % 50) + 2 : j;
    rbitnot_number(i);
    rbitnot_object(i);
    rbitand_number(i);
    rbitand_object(i);
    rbitor_number(i);
    rbitor_object(i);
    rbitxor_number(i);
    rbitxor_object(i);
    rlsh_number(i);
    rlsh_object(i);
    rrsh_number(i);
    rrsh_object(i);
    rursh_number(i);
    rursh_object(i);
    rsignextend8_1(i);
    rsignextend8_2(i);
    rsignextend16_1(i);
    rsignextend16_2(i);
    radd_number(i);
    radd_float(i);
    radd_object(i);
    rsub_number(i);
    rsub_float(i);
    rsub_object(i);
    rmul_number(i);
    rmul_overflow(i);
    rmul_float(i);
    rmul_object(i);
    rimul_number(i);
    rimul_overflow(i);
    rimul_object(i);
    rdiv_number(i);
    rdiv_float(i);
    rdiv_object(i);
    rmod_number(i);
    rmod_object(i);
    rnot_number(i);
    rnot_object(i);
    rcompare_number_eq(i);
    rcompare_number_stricteq(i);
    rcompare_number_ne(i);
    rcompare_number_stricteq(i);
    rcompare_number_lt(i);
    rcompare_number_le(i);
    rcompare_number_gt(i);
    rcompare_number_ge(i);
    rcompare_string_eq(i);
    rcompare_string_stricteq(i);
    rcompare_string_ne(i);
    rcompare_string_stricteq(i);
    rcompare_string_lt(i);
    rcompare_string_le(i);
    rcompare_string_gt(i);
    rcompare_string_ge(i);
    rcompare_bigint_eq(i);
    rcompare_bigint_stricteq(i);
    rcompare_bigint_ne(i);
    rcompare_bigint_stricteq(i);
    rcompare_bigint_lt(i);
    rcompare_bigint_le(i);
    rcompare_bigint_gt(i);
    rcompare_bigint_ge(i);
    rconcat_string(i);
    rconcat_number(i);
    rstring_length(i);
    rarguments_length_1(i);
    rarguments_length_3(i, 0, 1);
    rinline_arguments_length_1(i);
    rinline_arguments_length_3(i, 0, 1);
    rfloor_number(i);
    rfloor_double(i);
    rfloor_object(i);
    rceil_number(i);
    rceil_double(i);
    rround_number(i);
    rround_double(i);
    rtrunc_number(i);
    rtrunc_double(i);
    rcharCodeAt(i);
    rfrom_char_code(i);
    rfrom_char_code_non_ascii(i);
    rpow_number(i);
    rpow_object(i);
    rpowhalf_number(i);
    rpowhalf_object(i);
    rmin_number(i);
    rmin_float(i);
    rmin_object(i);
    rmax_number(i);
    rmax_float(i);
    rmax_object(i);
    rabs_number(i);
    rabs_object(i);
    rsqrt_number(i);
    rsqrt_float(i);
    rsqrt_object(i);
    ratan2_number(i);
    ratan2_object(i);
    if (!warp) {
      // TODO(Warp): Warp doesn't currently support a compiler constraints like
      // system to elide checks for modified built-ins. Additionally this test
      // requires to inline the self-hosted function and to elide all type
      // checks before the StringSplitString intrinsic is called.
      rstr_split(i);
    }
    rregexp_exec(i);
    rregexp_y_exec(i);
    rregexp_y_literal_exec(i);
    rregexp_g_exec(i);
    rregexp_g_literal_exec(i);
    rregexp_i_exec(i);
    rregexp_i_literal_exec(i);
    rregexp_m_exec(i);
    rregexp_m_literal_exec(i);
    rregexp_test(i);
    rregexp_y_test(i);
    rregexp_y_literal_test(i);
    rregexp_g_test(i);
    rregexp_g_literal_test(i);
    rregexp_i_test(i);
    rregexp_i_literal_test(i);
    rregexp_m_test(i);
    rregexp_m_literal_test(i);
    rregexp_replace(i);
    rregexp_y_replace(i);
    rregexp_y_literal_replace(i);
    rregexp_g_replace(i);
    rregexp_g_literal_replace(i);
    rregexp_i_replace(i);
    rregexp_i_literal_replace(i);
    rregexp_m_replace(i);
    rregexp_m_literal_replace(i);
    rstring_replace(i);
    rstring_replace_y(i);
    rstring_replace_g(i);
    rstring_slice(i);
    rstring_substring(i);
    rtypeof(i);
    rtodouble_value(i);
    rtodouble_number(i);
    rtofloat32_number(i);
    rtofloat32_object(i);
    rtrunc_to_int32_number(i);
    rtrunc_to_int32_object(i);
    if (!warp) {
      // TODO(Warp): Bitwise operations on strings not optimised in Warp.
      rtrunc_to_int32_string(i);
    }
    rhypot_number_2args(i);
    rhypot_number_3args(i);
    rhypot_number_4args(i);
    rhypot_object_2args(i);
    rhypot_object_3args(i);
    rhypot_object_4args(i);
    rrandom(i);
    rsin_number(i);
    rsin_object(i);
    rlog_number(i);
    rlog_object(i);
    rcos_number(i);
    rexp_number(i);
    rtan_number(i);
    racos_number(i);
    rasin_number(i);
    ratan_number(i);
    rlog10_number(i);
    rlog2_number(i);
    rlog1p_number(i);
    rexpm1_number(i);
    rcosh_number(i);
    rsinh_number(i);
    rtanh_number(i);
    racosh_number(i);
    rasinh_number(i);
    ratanh_number(i);
    rcbrt_number(i);
    rsign_number(i);
    rsign_double(i);
    rbigintadd(BigInt(i));
    rbigintsub(BigInt(i));
    rbigintmul(BigInt(i));
    rbigintdiv(BigInt(i));
    rbigintmod(BigInt(i));
    rbigintpow(BigInt(i));
    rbigintinc(BigInt(i));
    rbigintdec(BigInt(i));
    rbigintneg(BigInt(i));
    rbigintbitand(BigInt(i));
    rbigintbitor(BigInt(i));
    rbigintbitxor(BigInt(i));
    rbigintbitnot(BigInt(i));
    rbigintlsh(BigInt(i));
    rbigintrsh(BigInt(i));
    rbigintasint(BigInt(i));
    rbigintasuint(BigInt(i));
    rnantozero_nan(i);
    rnantozero_poszero(i);
    rnantozero_negzero(i);
}

// Test that we can refer multiple time to the same recover instruction, as well
// as chaining recover instructions.

function alignedAlloc($size, $alignment) {
    var $1 = $size + 4 | 0;
    var $2 = $alignment - 1 | 0;
    var $3 = $1 + $2 | 0;
    var $4 = malloc($3);
}

function malloc($bytes) {
    var $189 = undefined;
    var $198 = $189 + 8 | 0;
}

for (i = 0; i < 50; i++)
    alignedAlloc(608, 16);
