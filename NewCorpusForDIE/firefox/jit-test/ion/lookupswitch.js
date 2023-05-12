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

/////////////////////////////////////////
// This is a generated file!
// See jit-tests/etc/generate-lookupswitch-tests.js for the code
// that generated this code!
/////////////////////////////////////////

/////////////////////////////////////////
// PRELUDE                             //
/////////////////////////////////////////

// Avoid eager compilation of the global-scope.
try{} catch (x) {};

function ASSERT(cond, msg) {
    assertEq(cond, true, msg);
}
function IsNull(x) {
    return typeof x == "object" && x == null;
}
function IsNum(x) {
    return typeof x == "number";
}
function ArraysEqual(arr1, arr2) {
    ASSERT(arr1.length == arr2.length, "Lengths not equal");
    for (var i = 0; i < arr1.length; i++) {
        ASSERT(typeof arr1[i] == typeof arr2[i], "Types not equal for position " + i);
        ASSERT(arr1[i] == arr2[i], "Values not equal for position " + i);
    }
}
function InterpretSwitch(spec, input, outputArray) {
    var foundMatch = undefined, foundDefault = undefined;
    for (var i = 0; i < spec.length; i++) {
        var caseSpec = spec[i], match = caseSpec.match;
        if (IsNull(match)) {
            foundDefault = i;
            continue;
        } else if (match === input) {
            foundMatch = i;
            break;
        }
    }
    var matchI = IsNum(foundMatch) ? foundMatch : foundDefault;
    if (IsNum(matchI)) {
        for (var i = matchI; i < spec.length; i++) {
            var caseSpec = spec[i], match = caseSpec.match, body = caseSpec.body, fallthrough = caseSpec.fallthrough;
            if (!IsNull(body)) {
                outputArray.push(body);
            }
            if (!fallthrough) {
                break;
            }
        }
    }
}
function RunTest(test) {
    var inputs = test.INPUTS;
    inputs.push("UNMATCHED_CASE");
    var spec = test.SPEC;
    var results1 = [];
    for (var i = 0; i < 80; i++) {
        for (var j = 0; j < inputs.length; j++) {
            test(inputs[j], results1);
        }
    }
    var results2 = [];
    for (var i = 0; i < 80; i++) {
        for (var j = 0; j < inputs.length; j++) {
            InterpretSwitch(spec, inputs[j], results2);
        }
    }
    ArraysEqual(results1, results2);
}

/////////////////////////////////////////
// TEST CASES                          //
/////////////////////////////////////////

var TESTS = [];
function test_1(x, arr) {
    switch(x) {
    default:
    case 'foo':
        arr.push(777087170);
        break;
    case 'bar':
        arr.push(641037838);
        break;
    case 'zing':
        arr.push(1652156613);
        break;
    }
}
test_1.INPUTS = ['foo', 'bar', 'zing'];
test_1.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":777087170,"fallthrough":false},{"match":"bar","body":641037838,"fallthrough":false},{"match":"zing","body":1652156613,"fallthrough":false}];
TESTS.push(test_1);

function test_2(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(777087170);
        break;
    default:
    case 'bar':
        arr.push(641037838);
        break;
    case 'zing':
        arr.push(1652156613);
        break;
    }
}
test_2.INPUTS = ['foo', 'bar', 'zing'];
test_2.SPEC = [{"match":"foo","body":777087170,"fallthrough":false},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":641037838,"fallthrough":false},{"match":"zing","body":1652156613,"fallthrough":false}];
TESTS.push(test_2);

function test_3(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(777087170);
        break;
    case 'bar':
        arr.push(641037838);
        break;
    case 'zing':
        arr.push(1652156613);
        break;
    default:
    }
}
test_3.INPUTS = ['foo', 'bar', 'zing'];
test_3.SPEC = [{"match":"foo","body":777087170,"fallthrough":false},{"match":"bar","body":641037838,"fallthrough":false},{"match":"zing","body":1652156613,"fallthrough":false},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_3);

function test_4(x, arr) {
    switch(x) {
    default:
        arr.push(633415567);
    case 'foo':
        arr.push(777087170);
        break;
    case 'bar':
        arr.push(641037838);
        break;
    case 'zing':
        arr.push(1652156613);
        break;
    }
}
test_4.INPUTS = ['foo', 'bar', 'zing'];
test_4.SPEC = [{"match":null,"body":633415567,"fallthrough":true},{"match":"foo","body":777087170,"fallthrough":false},{"match":"bar","body":641037838,"fallthrough":false},{"match":"zing","body":1652156613,"fallthrough":false}];
TESTS.push(test_4);

function test_5(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(777087170);
        break;
    default:
        arr.push(633415567);
    case 'bar':
        arr.push(641037838);
        break;
    case 'zing':
        arr.push(1652156613);
        break;
    }
}
test_5.INPUTS = ['foo', 'bar', 'zing'];
test_5.SPEC = [{"match":"foo","body":777087170,"fallthrough":false},{"match":null,"body":633415567,"fallthrough":true},{"match":"bar","body":641037838,"fallthrough":false},{"match":"zing","body":1652156613,"fallthrough":false}];
TESTS.push(test_5);

function test_6(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(777087170);
        break;
    case 'bar':
        arr.push(641037838);
        break;
    case 'zing':
        arr.push(1652156613);
        break;
    default:
        arr.push(633415567);
    }
}
test_6.INPUTS = ['foo', 'bar', 'zing'];
test_6.SPEC = [{"match":"foo","body":777087170,"fallthrough":false},{"match":"bar","body":641037838,"fallthrough":false},{"match":"zing","body":1652156613,"fallthrough":false},{"match":null,"body":633415567,"fallthrough":true}];
TESTS.push(test_6);

function test_7(x, arr) {
    switch(x) {
    default:
        arr.push('5zO^Qj');
        break;
    case 'foo':
        arr.push(777087170);
        break;
    case 'bar':
        arr.push(641037838);
        break;
    case 'zing':
        arr.push(1652156613);
        break;
    }
}
test_7.INPUTS = ['foo', 'bar', 'zing'];
test_7.SPEC = [{"match":null,"body":"5zO^Qj","fallthrough":false},{"match":"foo","body":777087170,"fallthrough":false},{"match":"bar","body":641037838,"fallthrough":false},{"match":"zing","body":1652156613,"fallthrough":false}];
TESTS.push(test_7);

function test_8(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(777087170);
        break;
    default:
        arr.push('5zO^Qj');
        break;
    case 'bar':
        arr.push(641037838);
        break;
    case 'zing':
        arr.push(1652156613);
        break;
    }
}
test_8.INPUTS = ['foo', 'bar', 'zing'];
test_8.SPEC = [{"match":"foo","body":777087170,"fallthrough":false},{"match":null,"body":"5zO^Qj","fallthrough":false},{"match":"bar","body":641037838,"fallthrough":false},{"match":"zing","body":1652156613,"fallthrough":false}];
TESTS.push(test_8);

function test_9(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(777087170);
        break;
    case 'bar':
        arr.push(641037838);
        break;
    case 'zing':
        arr.push(1652156613);
        break;
    default:
        arr.push('5zO^Qj');
        break;
    }
}
test_9.INPUTS = ['foo', 'bar', 'zing'];
test_9.SPEC = [{"match":"foo","body":777087170,"fallthrough":false},{"match":"bar","body":641037838,"fallthrough":false},{"match":"zing","body":1652156613,"fallthrough":false},{"match":null,"body":"5zO^Qj","fallthrough":false}];
TESTS.push(test_9);

function test_10(x, arr) {
    switch(x) {
    default:
    case 'foo':
        break;
    case 'bar':
        arr.push('c');
        break;
    case 'zing':
        arr.push(2008006064);
        break;
    }
}
test_10.INPUTS = ['foo', 'bar', 'zing'];
test_10.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":"c","fallthrough":false},{"match":"zing","body":2008006064,"fallthrough":false}];
TESTS.push(test_10);

function test_11(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
    case 'bar':
        arr.push('c');
        break;
    case 'zing':
        arr.push(2008006064);
        break;
    }
}
test_11.INPUTS = ['foo', 'bar', 'zing'];
test_11.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":"c","fallthrough":false},{"match":"zing","body":2008006064,"fallthrough":false}];
TESTS.push(test_11);

function test_12(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
        arr.push('c');
        break;
    case 'zing':
        arr.push(2008006064);
        break;
    default:
    }
}
test_12.INPUTS = ['foo', 'bar', 'zing'];
test_12.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":"c","fallthrough":false},{"match":"zing","body":2008006064,"fallthrough":false},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_12);

function test_13(x, arr) {
    switch(x) {
    default:
        arr.push('M');
    case 'foo':
        break;
    case 'bar':
        arr.push('c');
        break;
    case 'zing':
        arr.push(2008006064);
        break;
    }
}
test_13.INPUTS = ['foo', 'bar', 'zing'];
test_13.SPEC = [{"match":null,"body":"M","fallthrough":true},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":"c","fallthrough":false},{"match":"zing","body":2008006064,"fallthrough":false}];
TESTS.push(test_13);

function test_14(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
        arr.push('M');
    case 'bar':
        arr.push('c');
        break;
    case 'zing':
        arr.push(2008006064);
        break;
    }
}
test_14.INPUTS = ['foo', 'bar', 'zing'];
test_14.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":"M","fallthrough":true},{"match":"bar","body":"c","fallthrough":false},{"match":"zing","body":2008006064,"fallthrough":false}];
TESTS.push(test_14);

function test_15(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
        arr.push('c');
        break;
    case 'zing':
        arr.push(2008006064);
        break;
    default:
        arr.push('M');
    }
}
test_15.INPUTS = ['foo', 'bar', 'zing'];
test_15.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":"c","fallthrough":false},{"match":"zing","body":2008006064,"fallthrough":false},{"match":null,"body":"M","fallthrough":true}];
TESTS.push(test_15);

function test_16(x, arr) {
    switch(x) {
    default:
        arr.push(1424069880);
        break;
    case 'foo':
        break;
    case 'bar':
        arr.push('c');
        break;
    case 'zing':
        arr.push(2008006064);
        break;
    }
}
test_16.INPUTS = ['foo', 'bar', 'zing'];
test_16.SPEC = [{"match":null,"body":1424069880,"fallthrough":false},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":"c","fallthrough":false},{"match":"zing","body":2008006064,"fallthrough":false}];
TESTS.push(test_16);

function test_17(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
        arr.push(1424069880);
        break;
    case 'bar':
        arr.push('c');
        break;
    case 'zing':
        arr.push(2008006064);
        break;
    }
}
test_17.INPUTS = ['foo', 'bar', 'zing'];
test_17.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":1424069880,"fallthrough":false},{"match":"bar","body":"c","fallthrough":false},{"match":"zing","body":2008006064,"fallthrough":false}];
TESTS.push(test_17);

function test_18(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
        arr.push('c');
        break;
    case 'zing':
        arr.push(2008006064);
        break;
    default:
        arr.push(1424069880);
        break;
    }
}
test_18.INPUTS = ['foo', 'bar', 'zing'];
test_18.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":"c","fallthrough":false},{"match":"zing","body":2008006064,"fallthrough":false},{"match":null,"body":1424069880,"fallthrough":false}];
TESTS.push(test_18);

function test_19(x, arr) {
    switch(x) {
    default:
    case 'foo':
    case 'bar':
        arr.push(1915689729);
        break;
    case 'zing':
        arr.push(973913896);
        break;
    }
}
test_19.INPUTS = ['foo', 'bar', 'zing'];
test_19.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":1915689729,"fallthrough":false},{"match":"zing","body":973913896,"fallthrough":false}];
TESTS.push(test_19);

function test_20(x, arr) {
    switch(x) {
    case 'foo':
    default:
    case 'bar':
        arr.push(1915689729);
        break;
    case 'zing':
        arr.push(973913896);
        break;
    }
}
test_20.INPUTS = ['foo', 'bar', 'zing'];
test_20.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":1915689729,"fallthrough":false},{"match":"zing","body":973913896,"fallthrough":false}];
TESTS.push(test_20);

function test_21(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
        arr.push(1915689729);
        break;
    case 'zing':
        arr.push(973913896);
        break;
    default:
    }
}
test_21.INPUTS = ['foo', 'bar', 'zing'];
test_21.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":1915689729,"fallthrough":false},{"match":"zing","body":973913896,"fallthrough":false},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_21);

function test_22(x, arr) {
    switch(x) {
    default:
        arr.push(104770589);
    case 'foo':
    case 'bar':
        arr.push(1915689729);
        break;
    case 'zing':
        arr.push(973913896);
        break;
    }
}
test_22.INPUTS = ['foo', 'bar', 'zing'];
test_22.SPEC = [{"match":null,"body":104770589,"fallthrough":true},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":1915689729,"fallthrough":false},{"match":"zing","body":973913896,"fallthrough":false}];
TESTS.push(test_22);

function test_23(x, arr) {
    switch(x) {
    case 'foo':
    default:
        arr.push(104770589);
    case 'bar':
        arr.push(1915689729);
        break;
    case 'zing':
        arr.push(973913896);
        break;
    }
}
test_23.INPUTS = ['foo', 'bar', 'zing'];
test_23.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":104770589,"fallthrough":true},{"match":"bar","body":1915689729,"fallthrough":false},{"match":"zing","body":973913896,"fallthrough":false}];
TESTS.push(test_23);

function test_24(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
        arr.push(1915689729);
        break;
    case 'zing':
        arr.push(973913896);
        break;
    default:
        arr.push(104770589);
    }
}
test_24.INPUTS = ['foo', 'bar', 'zing'];
test_24.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":1915689729,"fallthrough":false},{"match":"zing","body":973913896,"fallthrough":false},{"match":null,"body":104770589,"fallthrough":true}];
TESTS.push(test_24);

function test_25(x, arr) {
    switch(x) {
    default:
        arr.push(304532507);
        break;
    case 'foo':
    case 'bar':
        arr.push(1915689729);
        break;
    case 'zing':
        arr.push(973913896);
        break;
    }
}
test_25.INPUTS = ['foo', 'bar', 'zing'];
test_25.SPEC = [{"match":null,"body":304532507,"fallthrough":false},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":1915689729,"fallthrough":false},{"match":"zing","body":973913896,"fallthrough":false}];
TESTS.push(test_25);

function test_26(x, arr) {
    switch(x) {
    case 'foo':
    default:
        arr.push(304532507);
        break;
    case 'bar':
        arr.push(1915689729);
        break;
    case 'zing':
        arr.push(973913896);
        break;
    }
}
test_26.INPUTS = ['foo', 'bar', 'zing'];
test_26.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":304532507,"fallthrough":false},{"match":"bar","body":1915689729,"fallthrough":false},{"match":"zing","body":973913896,"fallthrough":false}];
TESTS.push(test_26);

function test_27(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
        arr.push(1915689729);
        break;
    case 'zing':
        arr.push(973913896);
        break;
    default:
        arr.push(304532507);
        break;
    }
}
test_27.INPUTS = ['foo', 'bar', 'zing'];
test_27.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":1915689729,"fallthrough":false},{"match":"zing","body":973913896,"fallthrough":false},{"match":null,"body":304532507,"fallthrough":false}];
TESTS.push(test_27);

function test_28(x, arr) {
    switch(x) {
    default:
    case 'foo':
        arr.push(2116660419);
        break;
    case 'bar':
        break;
    case 'zing':
        arr.push('FvxWZ');
        break;
    }
}
test_28.INPUTS = ['foo', 'bar', 'zing'];
test_28.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":2116660419,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"FvxWZ","fallthrough":false}];
TESTS.push(test_28);

function test_29(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(2116660419);
        break;
    default:
    case 'bar':
        break;
    case 'zing':
        arr.push('FvxWZ');
        break;
    }
}
test_29.INPUTS = ['foo', 'bar', 'zing'];
test_29.SPEC = [{"match":"foo","body":2116660419,"fallthrough":false},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"FvxWZ","fallthrough":false}];
TESTS.push(test_29);

function test_30(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(2116660419);
        break;
    case 'bar':
        break;
    case 'zing':
        arr.push('FvxWZ');
        break;
    default:
    }
}
test_30.INPUTS = ['foo', 'bar', 'zing'];
test_30.SPEC = [{"match":"foo","body":2116660419,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"FvxWZ","fallthrough":false},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_30);

function test_31(x, arr) {
    switch(x) {
    default:
        arr.push(121730727);
    case 'foo':
        arr.push(2116660419);
        break;
    case 'bar':
        break;
    case 'zing':
        arr.push('FvxWZ');
        break;
    }
}
test_31.INPUTS = ['foo', 'bar', 'zing'];
test_31.SPEC = [{"match":null,"body":121730727,"fallthrough":true},{"match":"foo","body":2116660419,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"FvxWZ","fallthrough":false}];
TESTS.push(test_31);

function test_32(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(2116660419);
        break;
    default:
        arr.push(121730727);
    case 'bar':
        break;
    case 'zing':
        arr.push('FvxWZ');
        break;
    }
}
test_32.INPUTS = ['foo', 'bar', 'zing'];
test_32.SPEC = [{"match":"foo","body":2116660419,"fallthrough":false},{"match":null,"body":121730727,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"FvxWZ","fallthrough":false}];
TESTS.push(test_32);

function test_33(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(2116660419);
        break;
    case 'bar':
        break;
    case 'zing':
        arr.push('FvxWZ');
        break;
    default:
        arr.push(121730727);
    }
}
test_33.INPUTS = ['foo', 'bar', 'zing'];
test_33.SPEC = [{"match":"foo","body":2116660419,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"FvxWZ","fallthrough":false},{"match":null,"body":121730727,"fallthrough":true}];
TESTS.push(test_33);

function test_34(x, arr) {
    switch(x) {
    default:
        arr.push(1614107154);
        break;
    case 'foo':
        arr.push(2116660419);
        break;
    case 'bar':
        break;
    case 'zing':
        arr.push('FvxWZ');
        break;
    }
}
test_34.INPUTS = ['foo', 'bar', 'zing'];
test_34.SPEC = [{"match":null,"body":1614107154,"fallthrough":false},{"match":"foo","body":2116660419,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"FvxWZ","fallthrough":false}];
TESTS.push(test_34);

function test_35(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(2116660419);
        break;
    default:
        arr.push(1614107154);
        break;
    case 'bar':
        break;
    case 'zing':
        arr.push('FvxWZ');
        break;
    }
}
test_35.INPUTS = ['foo', 'bar', 'zing'];
test_35.SPEC = [{"match":"foo","body":2116660419,"fallthrough":false},{"match":null,"body":1614107154,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"FvxWZ","fallthrough":false}];
TESTS.push(test_35);

function test_36(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(2116660419);
        break;
    case 'bar':
        break;
    case 'zing':
        arr.push('FvxWZ');
        break;
    default:
        arr.push(1614107154);
        break;
    }
}
test_36.INPUTS = ['foo', 'bar', 'zing'];
test_36.SPEC = [{"match":"foo","body":2116660419,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"FvxWZ","fallthrough":false},{"match":null,"body":1614107154,"fallthrough":false}];
TESTS.push(test_36);

function test_37(x, arr) {
    switch(x) {
    default:
    case 'foo':
        arr.push('-=Z');
        break;
    case 'bar':
    case 'zing':
        arr.push('R8f');
        break;
    }
}
test_37.INPUTS = ['foo', 'bar', 'zing'];
test_37.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":"-=Z","fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":"R8f","fallthrough":false}];
TESTS.push(test_37);

function test_38(x, arr) {
    switch(x) {
    case 'foo':
        arr.push('-=Z');
        break;
    default:
    case 'bar':
    case 'zing':
        arr.push('R8f');
        break;
    }
}
test_38.INPUTS = ['foo', 'bar', 'zing'];
test_38.SPEC = [{"match":"foo","body":"-=Z","fallthrough":false},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":"R8f","fallthrough":false}];
TESTS.push(test_38);

function test_39(x, arr) {
    switch(x) {
    case 'foo':
        arr.push('-=Z');
        break;
    case 'bar':
    case 'zing':
        arr.push('R8f');
        break;
    default:
    }
}
test_39.INPUTS = ['foo', 'bar', 'zing'];
test_39.SPEC = [{"match":"foo","body":"-=Z","fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":"R8f","fallthrough":false},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_39);

function test_40(x, arr) {
    switch(x) {
    default:
        arr.push('XfrKO0');
    case 'foo':
        arr.push('-=Z');
        break;
    case 'bar':
    case 'zing':
        arr.push('R8f');
        break;
    }
}
test_40.INPUTS = ['foo', 'bar', 'zing'];
test_40.SPEC = [{"match":null,"body":"XfrKO0","fallthrough":true},{"match":"foo","body":"-=Z","fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":"R8f","fallthrough":false}];
TESTS.push(test_40);

function test_41(x, arr) {
    switch(x) {
    case 'foo':
        arr.push('-=Z');
        break;
    default:
        arr.push('XfrKO0');
    case 'bar':
    case 'zing':
        arr.push('R8f');
        break;
    }
}
test_41.INPUTS = ['foo', 'bar', 'zing'];
test_41.SPEC = [{"match":"foo","body":"-=Z","fallthrough":false},{"match":null,"body":"XfrKO0","fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":"R8f","fallthrough":false}];
TESTS.push(test_41);

function test_42(x, arr) {
    switch(x) {
    case 'foo':
        arr.push('-=Z');
        break;
    case 'bar':
    case 'zing':
        arr.push('R8f');
        break;
    default:
        arr.push('XfrKO0');
    }
}
test_42.INPUTS = ['foo', 'bar', 'zing'];
test_42.SPEC = [{"match":"foo","body":"-=Z","fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":"R8f","fallthrough":false},{"match":null,"body":"XfrKO0","fallthrough":true}];
TESTS.push(test_42);

function test_43(x, arr) {
    switch(x) {
    default:
        arr.push(465477587);
        break;
    case 'foo':
        arr.push('-=Z');
        break;
    case 'bar':
    case 'zing':
        arr.push('R8f');
        break;
    }
}
test_43.INPUTS = ['foo', 'bar', 'zing'];
test_43.SPEC = [{"match":null,"body":465477587,"fallthrough":false},{"match":"foo","body":"-=Z","fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":"R8f","fallthrough":false}];
TESTS.push(test_43);

function test_44(x, arr) {
    switch(x) {
    case 'foo':
        arr.push('-=Z');
        break;
    default:
        arr.push(465477587);
        break;
    case 'bar':
    case 'zing':
        arr.push('R8f');
        break;
    }
}
test_44.INPUTS = ['foo', 'bar', 'zing'];
test_44.SPEC = [{"match":"foo","body":"-=Z","fallthrough":false},{"match":null,"body":465477587,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":"R8f","fallthrough":false}];
TESTS.push(test_44);

function test_45(x, arr) {
    switch(x) {
    case 'foo':
        arr.push('-=Z');
        break;
    case 'bar':
    case 'zing':
        arr.push('R8f');
        break;
    default:
        arr.push(465477587);
        break;
    }
}
test_45.INPUTS = ['foo', 'bar', 'zing'];
test_45.SPEC = [{"match":"foo","body":"-=Z","fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":"R8f","fallthrough":false},{"match":null,"body":465477587,"fallthrough":false}];
TESTS.push(test_45);

function test_46(x, arr) {
    switch(x) {
    default:
    case 'foo':
        break;
    case 'bar':
        break;
    case 'zing':
        arr.push('(0');
        break;
    }
}
test_46.INPUTS = ['foo', 'bar', 'zing'];
test_46.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"(0","fallthrough":false}];
TESTS.push(test_46);

function test_47(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
    case 'bar':
        break;
    case 'zing':
        arr.push('(0');
        break;
    }
}
test_47.INPUTS = ['foo', 'bar', 'zing'];
test_47.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"(0","fallthrough":false}];
TESTS.push(test_47);

function test_48(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
        break;
    case 'zing':
        arr.push('(0');
        break;
    default:
    }
}
test_48.INPUTS = ['foo', 'bar', 'zing'];
test_48.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"(0","fallthrough":false},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_48);

function test_49(x, arr) {
    switch(x) {
    default:
        arr.push('{5J~&%)kV');
    case 'foo':
        break;
    case 'bar':
        break;
    case 'zing':
        arr.push('(0');
        break;
    }
}
test_49.INPUTS = ['foo', 'bar', 'zing'];
test_49.SPEC = [{"match":null,"body":"{5J~&%)kV","fallthrough":true},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"(0","fallthrough":false}];
TESTS.push(test_49);

function test_50(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
        arr.push('{5J~&%)kV');
    case 'bar':
        break;
    case 'zing':
        arr.push('(0');
        break;
    }
}
test_50.INPUTS = ['foo', 'bar', 'zing'];
test_50.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":"{5J~&%)kV","fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"(0","fallthrough":false}];
TESTS.push(test_50);

function test_51(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
        break;
    case 'zing':
        arr.push('(0');
        break;
    default:
        arr.push('{5J~&%)kV');
    }
}
test_51.INPUTS = ['foo', 'bar', 'zing'];
test_51.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"(0","fallthrough":false},{"match":null,"body":"{5J~&%)kV","fallthrough":true}];
TESTS.push(test_51);

function test_52(x, arr) {
    switch(x) {
    default:
        arr.push('V^IbL');
        break;
    case 'foo':
        break;
    case 'bar':
        break;
    case 'zing':
        arr.push('(0');
        break;
    }
}
test_52.INPUTS = ['foo', 'bar', 'zing'];
test_52.SPEC = [{"match":null,"body":"V^IbL","fallthrough":false},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"(0","fallthrough":false}];
TESTS.push(test_52);

function test_53(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
        arr.push('V^IbL');
        break;
    case 'bar':
        break;
    case 'zing':
        arr.push('(0');
        break;
    }
}
test_53.INPUTS = ['foo', 'bar', 'zing'];
test_53.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":"V^IbL","fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"(0","fallthrough":false}];
TESTS.push(test_53);

function test_54(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
        break;
    case 'zing':
        arr.push('(0');
        break;
    default:
        arr.push('V^IbL');
        break;
    }
}
test_54.INPUTS = ['foo', 'bar', 'zing'];
test_54.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"(0","fallthrough":false},{"match":null,"body":"V^IbL","fallthrough":false}];
TESTS.push(test_54);

function test_55(x, arr) {
    switch(x) {
    default:
    case 'foo':
    case 'bar':
        break;
    case 'zing':
        arr.push('4');
        break;
    }
}
test_55.INPUTS = ['foo', 'bar', 'zing'];
test_55.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"4","fallthrough":false}];
TESTS.push(test_55);

function test_56(x, arr) {
    switch(x) {
    case 'foo':
    default:
    case 'bar':
        break;
    case 'zing':
        arr.push('4');
        break;
    }
}
test_56.INPUTS = ['foo', 'bar', 'zing'];
test_56.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"4","fallthrough":false}];
TESTS.push(test_56);

function test_57(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
        break;
    case 'zing':
        arr.push('4');
        break;
    default:
    }
}
test_57.INPUTS = ['foo', 'bar', 'zing'];
test_57.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"4","fallthrough":false},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_57);

function test_58(x, arr) {
    switch(x) {
    default:
        arr.push('K');
    case 'foo':
    case 'bar':
        break;
    case 'zing':
        arr.push('4');
        break;
    }
}
test_58.INPUTS = ['foo', 'bar', 'zing'];
test_58.SPEC = [{"match":null,"body":"K","fallthrough":true},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"4","fallthrough":false}];
TESTS.push(test_58);

function test_59(x, arr) {
    switch(x) {
    case 'foo':
    default:
        arr.push('K');
    case 'bar':
        break;
    case 'zing':
        arr.push('4');
        break;
    }
}
test_59.INPUTS = ['foo', 'bar', 'zing'];
test_59.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":"K","fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"4","fallthrough":false}];
TESTS.push(test_59);

function test_60(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
        break;
    case 'zing':
        arr.push('4');
        break;
    default:
        arr.push('K');
    }
}
test_60.INPUTS = ['foo', 'bar', 'zing'];
test_60.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"4","fallthrough":false},{"match":null,"body":"K","fallthrough":true}];
TESTS.push(test_60);

function test_61(x, arr) {
    switch(x) {
    default:
        arr.push(129591787);
        break;
    case 'foo':
    case 'bar':
        break;
    case 'zing':
        arr.push('4');
        break;
    }
}
test_61.INPUTS = ['foo', 'bar', 'zing'];
test_61.SPEC = [{"match":null,"body":129591787,"fallthrough":false},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"4","fallthrough":false}];
TESTS.push(test_61);

function test_62(x, arr) {
    switch(x) {
    case 'foo':
    default:
        arr.push(129591787);
        break;
    case 'bar':
        break;
    case 'zing':
        arr.push('4');
        break;
    }
}
test_62.INPUTS = ['foo', 'bar', 'zing'];
test_62.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":129591787,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"4","fallthrough":false}];
TESTS.push(test_62);

function test_63(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
        break;
    case 'zing':
        arr.push('4');
        break;
    default:
        arr.push(129591787);
        break;
    }
}
test_63.INPUTS = ['foo', 'bar', 'zing'];
test_63.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":"4","fallthrough":false},{"match":null,"body":129591787,"fallthrough":false}];
TESTS.push(test_63);

function test_64(x, arr) {
    switch(x) {
    default:
    case 'foo':
        break;
    case 'bar':
    case 'zing':
        arr.push(60518010);
        break;
    }
}
test_64.INPUTS = ['foo', 'bar', 'zing'];
test_64.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":60518010,"fallthrough":false}];
TESTS.push(test_64);

function test_65(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
    case 'bar':
    case 'zing':
        arr.push(60518010);
        break;
    }
}
test_65.INPUTS = ['foo', 'bar', 'zing'];
test_65.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":60518010,"fallthrough":false}];
TESTS.push(test_65);

function test_66(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
    case 'zing':
        arr.push(60518010);
        break;
    default:
    }
}
test_66.INPUTS = ['foo', 'bar', 'zing'];
test_66.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":60518010,"fallthrough":false},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_66);

function test_67(x, arr) {
    switch(x) {
    default:
        arr.push('0]YO]}');
    case 'foo':
        break;
    case 'bar':
    case 'zing':
        arr.push(60518010);
        break;
    }
}
test_67.INPUTS = ['foo', 'bar', 'zing'];
test_67.SPEC = [{"match":null,"body":"0]YO]}","fallthrough":true},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":60518010,"fallthrough":false}];
TESTS.push(test_67);

function test_68(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
        arr.push('0]YO]}');
    case 'bar':
    case 'zing':
        arr.push(60518010);
        break;
    }
}
test_68.INPUTS = ['foo', 'bar', 'zing'];
test_68.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":"0]YO]}","fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":60518010,"fallthrough":false}];
TESTS.push(test_68);

function test_69(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
    case 'zing':
        arr.push(60518010);
        break;
    default:
        arr.push('0]YO]}');
    }
}
test_69.INPUTS = ['foo', 'bar', 'zing'];
test_69.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":60518010,"fallthrough":false},{"match":null,"body":"0]YO]}","fallthrough":true}];
TESTS.push(test_69);

function test_70(x, arr) {
    switch(x) {
    default:
        arr.push(1222888797);
        break;
    case 'foo':
        break;
    case 'bar':
    case 'zing':
        arr.push(60518010);
        break;
    }
}
test_70.INPUTS = ['foo', 'bar', 'zing'];
test_70.SPEC = [{"match":null,"body":1222888797,"fallthrough":false},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":60518010,"fallthrough":false}];
TESTS.push(test_70);

function test_71(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
        arr.push(1222888797);
        break;
    case 'bar':
    case 'zing':
        arr.push(60518010);
        break;
    }
}
test_71.INPUTS = ['foo', 'bar', 'zing'];
test_71.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":1222888797,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":60518010,"fallthrough":false}];
TESTS.push(test_71);

function test_72(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
    case 'zing':
        arr.push(60518010);
        break;
    default:
        arr.push(1222888797);
        break;
    }
}
test_72.INPUTS = ['foo', 'bar', 'zing'];
test_72.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":60518010,"fallthrough":false},{"match":null,"body":1222888797,"fallthrough":false}];
TESTS.push(test_72);

function test_73(x, arr) {
    switch(x) {
    default:
    case 'foo':
    case 'bar':
    case 'zing':
        arr.push('ku]^x');
        break;
    }
}
test_73.INPUTS = ['foo', 'bar', 'zing'];
test_73.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":"ku]^x","fallthrough":false}];
TESTS.push(test_73);

function test_74(x, arr) {
    switch(x) {
    case 'foo':
    default:
    case 'bar':
    case 'zing':
        arr.push('ku]^x');
        break;
    }
}
test_74.INPUTS = ['foo', 'bar', 'zing'];
test_74.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":"ku]^x","fallthrough":false}];
TESTS.push(test_74);

function test_75(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
    case 'zing':
        arr.push('ku]^x');
        break;
    default:
    }
}
test_75.INPUTS = ['foo', 'bar', 'zing'];
test_75.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":"ku]^x","fallthrough":false},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_75);

function test_76(x, arr) {
    switch(x) {
    default:
        arr.push(1697959342);
    case 'foo':
    case 'bar':
    case 'zing':
        arr.push('ku]^x');
        break;
    }
}
test_76.INPUTS = ['foo', 'bar', 'zing'];
test_76.SPEC = [{"match":null,"body":1697959342,"fallthrough":true},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":"ku]^x","fallthrough":false}];
TESTS.push(test_76);

function test_77(x, arr) {
    switch(x) {
    case 'foo':
    default:
        arr.push(1697959342);
    case 'bar':
    case 'zing':
        arr.push('ku]^x');
        break;
    }
}
test_77.INPUTS = ['foo', 'bar', 'zing'];
test_77.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":1697959342,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":"ku]^x","fallthrough":false}];
TESTS.push(test_77);

function test_78(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
    case 'zing':
        arr.push('ku]^x');
        break;
    default:
        arr.push(1697959342);
    }
}
test_78.INPUTS = ['foo', 'bar', 'zing'];
test_78.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":"ku]^x","fallthrough":false},{"match":null,"body":1697959342,"fallthrough":true}];
TESTS.push(test_78);

function test_79(x, arr) {
    switch(x) {
    default:
        arr.push(2023306409);
        break;
    case 'foo':
    case 'bar':
    case 'zing':
        arr.push('ku]^x');
        break;
    }
}
test_79.INPUTS = ['foo', 'bar', 'zing'];
test_79.SPEC = [{"match":null,"body":2023306409,"fallthrough":false},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":"ku]^x","fallthrough":false}];
TESTS.push(test_79);

function test_80(x, arr) {
    switch(x) {
    case 'foo':
    default:
        arr.push(2023306409);
        break;
    case 'bar':
    case 'zing':
        arr.push('ku]^x');
        break;
    }
}
test_80.INPUTS = ['foo', 'bar', 'zing'];
test_80.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":2023306409,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":"ku]^x","fallthrough":false}];
TESTS.push(test_80);

function test_81(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
    case 'zing':
        arr.push('ku]^x');
        break;
    default:
        arr.push(2023306409);
        break;
    }
}
test_81.INPUTS = ['foo', 'bar', 'zing'];
test_81.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":"ku]^x","fallthrough":false},{"match":null,"body":2023306409,"fallthrough":false}];
TESTS.push(test_81);

function test_82(x, arr) {
    switch(x) {
    default:
    case 'foo':
        arr.push(588167318);
        break;
    case 'bar':
        arr.push(663884613);
        break;
    case 'zing':
        break;
    }
}
test_82.INPUTS = ['foo', 'bar', 'zing'];
test_82.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":588167318,"fallthrough":false},{"match":"bar","body":663884613,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_82);

function test_83(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(588167318);
        break;
    default:
    case 'bar':
        arr.push(663884613);
        break;
    case 'zing':
        break;
    }
}
test_83.INPUTS = ['foo', 'bar', 'zing'];
test_83.SPEC = [{"match":"foo","body":588167318,"fallthrough":false},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":663884613,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_83);

function test_84(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(588167318);
        break;
    case 'bar':
        arr.push(663884613);
        break;
    case 'zing':
        break;
    default:
    }
}
test_84.INPUTS = ['foo', 'bar', 'zing'];
test_84.SPEC = [{"match":"foo","body":588167318,"fallthrough":false},{"match":"bar","body":663884613,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_84);

function test_85(x, arr) {
    switch(x) {
    default:
        arr.push(1238869146);
    case 'foo':
        arr.push(588167318);
        break;
    case 'bar':
        arr.push(663884613);
        break;
    case 'zing':
        break;
    }
}
test_85.INPUTS = ['foo', 'bar', 'zing'];
test_85.SPEC = [{"match":null,"body":1238869146,"fallthrough":true},{"match":"foo","body":588167318,"fallthrough":false},{"match":"bar","body":663884613,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_85);

function test_86(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(588167318);
        break;
    default:
        arr.push(1238869146);
    case 'bar':
        arr.push(663884613);
        break;
    case 'zing':
        break;
    }
}
test_86.INPUTS = ['foo', 'bar', 'zing'];
test_86.SPEC = [{"match":"foo","body":588167318,"fallthrough":false},{"match":null,"body":1238869146,"fallthrough":true},{"match":"bar","body":663884613,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_86);

function test_87(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(588167318);
        break;
    case 'bar':
        arr.push(663884613);
        break;
    case 'zing':
        break;
    default:
        arr.push(1238869146);
    }
}
test_87.INPUTS = ['foo', 'bar', 'zing'];
test_87.SPEC = [{"match":"foo","body":588167318,"fallthrough":false},{"match":"bar","body":663884613,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":1238869146,"fallthrough":true}];
TESTS.push(test_87);

function test_88(x, arr) {
    switch(x) {
    default:
        arr.push('pOh#');
        break;
    case 'foo':
        arr.push(588167318);
        break;
    case 'bar':
        arr.push(663884613);
        break;
    case 'zing':
        break;
    }
}
test_88.INPUTS = ['foo', 'bar', 'zing'];
test_88.SPEC = [{"match":null,"body":"pOh#","fallthrough":false},{"match":"foo","body":588167318,"fallthrough":false},{"match":"bar","body":663884613,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_88);

function test_89(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(588167318);
        break;
    default:
        arr.push('pOh#');
        break;
    case 'bar':
        arr.push(663884613);
        break;
    case 'zing':
        break;
    }
}
test_89.INPUTS = ['foo', 'bar', 'zing'];
test_89.SPEC = [{"match":"foo","body":588167318,"fallthrough":false},{"match":null,"body":"pOh#","fallthrough":false},{"match":"bar","body":663884613,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_89);

function test_90(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(588167318);
        break;
    case 'bar':
        arr.push(663884613);
        break;
    case 'zing':
        break;
    default:
        arr.push('pOh#');
        break;
    }
}
test_90.INPUTS = ['foo', 'bar', 'zing'];
test_90.SPEC = [{"match":"foo","body":588167318,"fallthrough":false},{"match":"bar","body":663884613,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":"pOh#","fallthrough":false}];
TESTS.push(test_90);

function test_91(x, arr) {
    switch(x) {
    default:
    case 'foo':
        arr.push('Z!I#t');
        break;
    case 'bar':
        arr.push('D');
        break;
    case 'zing':
    }
}
test_91.INPUTS = ['foo', 'bar', 'zing'];
test_91.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":"Z!I#t","fallthrough":false},{"match":"bar","body":"D","fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_91);

function test_92(x, arr) {
    switch(x) {
    case 'foo':
        arr.push('Z!I#t');
        break;
    default:
    case 'bar':
        arr.push('D');
        break;
    case 'zing':
    }
}
test_92.INPUTS = ['foo', 'bar', 'zing'];
test_92.SPEC = [{"match":"foo","body":"Z!I#t","fallthrough":false},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":"D","fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_92);

function test_93(x, arr) {
    switch(x) {
    case 'foo':
        arr.push('Z!I#t');
        break;
    case 'bar':
        arr.push('D');
        break;
    case 'zing':
    default:
    }
}
test_93.INPUTS = ['foo', 'bar', 'zing'];
test_93.SPEC = [{"match":"foo","body":"Z!I#t","fallthrough":false},{"match":"bar","body":"D","fallthrough":false},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_93);

function test_94(x, arr) {
    switch(x) {
    default:
        arr.push(63474909);
    case 'foo':
        arr.push('Z!I#t');
        break;
    case 'bar':
        arr.push('D');
        break;
    case 'zing':
    }
}
test_94.INPUTS = ['foo', 'bar', 'zing'];
test_94.SPEC = [{"match":null,"body":63474909,"fallthrough":true},{"match":"foo","body":"Z!I#t","fallthrough":false},{"match":"bar","body":"D","fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_94);

function test_95(x, arr) {
    switch(x) {
    case 'foo':
        arr.push('Z!I#t');
        break;
    default:
        arr.push(63474909);
    case 'bar':
        arr.push('D');
        break;
    case 'zing':
    }
}
test_95.INPUTS = ['foo', 'bar', 'zing'];
test_95.SPEC = [{"match":"foo","body":"Z!I#t","fallthrough":false},{"match":null,"body":63474909,"fallthrough":true},{"match":"bar","body":"D","fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_95);

function test_96(x, arr) {
    switch(x) {
    case 'foo':
        arr.push('Z!I#t');
        break;
    case 'bar':
        arr.push('D');
        break;
    case 'zing':
    default:
        arr.push(63474909);
    }
}
test_96.INPUTS = ['foo', 'bar', 'zing'];
test_96.SPEC = [{"match":"foo","body":"Z!I#t","fallthrough":false},{"match":"bar","body":"D","fallthrough":false},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":63474909,"fallthrough":true}];
TESTS.push(test_96);

function test_97(x, arr) {
    switch(x) {
    default:
        arr.push(1165220694);
        break;
    case 'foo':
        arr.push('Z!I#t');
        break;
    case 'bar':
        arr.push('D');
        break;
    case 'zing':
    }
}
test_97.INPUTS = ['foo', 'bar', 'zing'];
test_97.SPEC = [{"match":null,"body":1165220694,"fallthrough":false},{"match":"foo","body":"Z!I#t","fallthrough":false},{"match":"bar","body":"D","fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_97);

function test_98(x, arr) {
    switch(x) {
    case 'foo':
        arr.push('Z!I#t');
        break;
    default:
        arr.push(1165220694);
        break;
    case 'bar':
        arr.push('D');
        break;
    case 'zing':
    }
}
test_98.INPUTS = ['foo', 'bar', 'zing'];
test_98.SPEC = [{"match":"foo","body":"Z!I#t","fallthrough":false},{"match":null,"body":1165220694,"fallthrough":false},{"match":"bar","body":"D","fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_98);

function test_99(x, arr) {
    switch(x) {
    case 'foo':
        arr.push('Z!I#t');
        break;
    case 'bar':
        arr.push('D');
        break;
    case 'zing':
    default:
        arr.push(1165220694);
        break;
    }
}
test_99.INPUTS = ['foo', 'bar', 'zing'];
test_99.SPEC = [{"match":"foo","body":"Z!I#t","fallthrough":false},{"match":"bar","body":"D","fallthrough":false},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":1165220694,"fallthrough":false}];
TESTS.push(test_99);

function test_100(x, arr) {
    switch(x) {
    default:
    case 'foo':
        break;
    case 'bar':
        arr.push(1994756408);
        break;
    case 'zing':
        break;
    }
}
test_100.INPUTS = ['foo', 'bar', 'zing'];
test_100.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":1994756408,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_100);

function test_101(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
    case 'bar':
        arr.push(1994756408);
        break;
    case 'zing':
        break;
    }
}
test_101.INPUTS = ['foo', 'bar', 'zing'];
test_101.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":1994756408,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_101);

function test_102(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
        arr.push(1994756408);
        break;
    case 'zing':
        break;
    default:
    }
}
test_102.INPUTS = ['foo', 'bar', 'zing'];
test_102.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":1994756408,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_102);

function test_103(x, arr) {
    switch(x) {
    default:
        arr.push('*8ZYmVI($X');
    case 'foo':
        break;
    case 'bar':
        arr.push(1994756408);
        break;
    case 'zing':
        break;
    }
}
test_103.INPUTS = ['foo', 'bar', 'zing'];
test_103.SPEC = [{"match":null,"body":"*8ZYmVI($X","fallthrough":true},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":1994756408,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_103);

function test_104(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
        arr.push('*8ZYmVI($X');
    case 'bar':
        arr.push(1994756408);
        break;
    case 'zing':
        break;
    }
}
test_104.INPUTS = ['foo', 'bar', 'zing'];
test_104.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":"*8ZYmVI($X","fallthrough":true},{"match":"bar","body":1994756408,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_104);

function test_105(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
        arr.push(1994756408);
        break;
    case 'zing':
        break;
    default:
        arr.push('*8ZYmVI($X');
    }
}
test_105.INPUTS = ['foo', 'bar', 'zing'];
test_105.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":1994756408,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":"*8ZYmVI($X","fallthrough":true}];
TESTS.push(test_105);

function test_106(x, arr) {
    switch(x) {
    default:
        arr.push(207183901);
        break;
    case 'foo':
        break;
    case 'bar':
        arr.push(1994756408);
        break;
    case 'zing':
        break;
    }
}
test_106.INPUTS = ['foo', 'bar', 'zing'];
test_106.SPEC = [{"match":null,"body":207183901,"fallthrough":false},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":1994756408,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_106);

function test_107(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
        arr.push(207183901);
        break;
    case 'bar':
        arr.push(1994756408);
        break;
    case 'zing':
        break;
    }
}
test_107.INPUTS = ['foo', 'bar', 'zing'];
test_107.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":207183901,"fallthrough":false},{"match":"bar","body":1994756408,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_107);

function test_108(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
        arr.push(1994756408);
        break;
    case 'zing':
        break;
    default:
        arr.push(207183901);
        break;
    }
}
test_108.INPUTS = ['foo', 'bar', 'zing'];
test_108.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":1994756408,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":207183901,"fallthrough":false}];
TESTS.push(test_108);

function test_109(x, arr) {
    switch(x) {
    default:
    case 'foo':
    case 'bar':
        arr.push('YJQk');
        break;
    case 'zing':
        break;
    }
}
test_109.INPUTS = ['foo', 'bar', 'zing'];
test_109.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":"YJQk","fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_109);

function test_110(x, arr) {
    switch(x) {
    case 'foo':
    default:
    case 'bar':
        arr.push('YJQk');
        break;
    case 'zing':
        break;
    }
}
test_110.INPUTS = ['foo', 'bar', 'zing'];
test_110.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":"YJQk","fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_110);

function test_111(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
        arr.push('YJQk');
        break;
    case 'zing':
        break;
    default:
    }
}
test_111.INPUTS = ['foo', 'bar', 'zing'];
test_111.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":"YJQk","fallthrough":false},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_111);

function test_112(x, arr) {
    switch(x) {
    default:
        arr.push('04mJy');
    case 'foo':
    case 'bar':
        arr.push('YJQk');
        break;
    case 'zing':
        break;
    }
}
test_112.INPUTS = ['foo', 'bar', 'zing'];
test_112.SPEC = [{"match":null,"body":"04mJy","fallthrough":true},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":"YJQk","fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_112);

function test_113(x, arr) {
    switch(x) {
    case 'foo':
    default:
        arr.push('04mJy');
    case 'bar':
        arr.push('YJQk');
        break;
    case 'zing':
        break;
    }
}
test_113.INPUTS = ['foo', 'bar', 'zing'];
test_113.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":"04mJy","fallthrough":true},{"match":"bar","body":"YJQk","fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_113);

function test_114(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
        arr.push('YJQk');
        break;
    case 'zing':
        break;
    default:
        arr.push('04mJy');
    }
}
test_114.INPUTS = ['foo', 'bar', 'zing'];
test_114.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":"YJQk","fallthrough":false},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":"04mJy","fallthrough":true}];
TESTS.push(test_114);

function test_115(x, arr) {
    switch(x) {
    default:
        arr.push('0NgLbYKr~c');
        break;
    case 'foo':
    case 'bar':
        arr.push('YJQk');
        break;
    case 'zing':
        break;
    }
}
test_115.INPUTS = ['foo', 'bar', 'zing'];
test_115.SPEC = [{"match":null,"body":"0NgLbYKr~c","fallthrough":false},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":"YJQk","fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_115);

function test_116(x, arr) {
    switch(x) {
    case 'foo':
    default:
        arr.push('0NgLbYKr~c');
        break;
    case 'bar':
        arr.push('YJQk');
        break;
    case 'zing':
        break;
    }
}
test_116.INPUTS = ['foo', 'bar', 'zing'];
test_116.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":"0NgLbYKr~c","fallthrough":false},{"match":"bar","body":"YJQk","fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_116);

function test_117(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
        arr.push('YJQk');
        break;
    case 'zing':
        break;
    default:
        arr.push('0NgLbYKr~c');
        break;
    }
}
test_117.INPUTS = ['foo', 'bar', 'zing'];
test_117.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":"YJQk","fallthrough":false},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":"0NgLbYKr~c","fallthrough":false}];
TESTS.push(test_117);

function test_118(x, arr) {
    switch(x) {
    default:
    case 'foo':
        break;
    case 'bar':
        arr.push('[^U}J^z');
        break;
    case 'zing':
    }
}
test_118.INPUTS = ['foo', 'bar', 'zing'];
test_118.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":"[^U}J^z","fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_118);

function test_119(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
    case 'bar':
        arr.push('[^U}J^z');
        break;
    case 'zing':
    }
}
test_119.INPUTS = ['foo', 'bar', 'zing'];
test_119.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":"[^U}J^z","fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_119);

function test_120(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
        arr.push('[^U}J^z');
        break;
    case 'zing':
    default:
    }
}
test_120.INPUTS = ['foo', 'bar', 'zing'];
test_120.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":"[^U}J^z","fallthrough":false},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_120);

function test_121(x, arr) {
    switch(x) {
    default:
        arr.push('Y');
    case 'foo':
        break;
    case 'bar':
        arr.push('[^U}J^z');
        break;
    case 'zing':
    }
}
test_121.INPUTS = ['foo', 'bar', 'zing'];
test_121.SPEC = [{"match":null,"body":"Y","fallthrough":true},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":"[^U}J^z","fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_121);

function test_122(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
        arr.push('Y');
    case 'bar':
        arr.push('[^U}J^z');
        break;
    case 'zing':
    }
}
test_122.INPUTS = ['foo', 'bar', 'zing'];
test_122.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":"Y","fallthrough":true},{"match":"bar","body":"[^U}J^z","fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_122);

function test_123(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
        arr.push('[^U}J^z');
        break;
    case 'zing':
    default:
        arr.push('Y');
    }
}
test_123.INPUTS = ['foo', 'bar', 'zing'];
test_123.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":"[^U}J^z","fallthrough":false},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":"Y","fallthrough":true}];
TESTS.push(test_123);

function test_124(x, arr) {
    switch(x) {
    default:
        arr.push(279382281);
        break;
    case 'foo':
        break;
    case 'bar':
        arr.push('[^U}J^z');
        break;
    case 'zing':
    }
}
test_124.INPUTS = ['foo', 'bar', 'zing'];
test_124.SPEC = [{"match":null,"body":279382281,"fallthrough":false},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":"[^U}J^z","fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_124);

function test_125(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
        arr.push(279382281);
        break;
    case 'bar':
        arr.push('[^U}J^z');
        break;
    case 'zing':
    }
}
test_125.INPUTS = ['foo', 'bar', 'zing'];
test_125.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":279382281,"fallthrough":false},{"match":"bar","body":"[^U}J^z","fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_125);

function test_126(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
        arr.push('[^U}J^z');
        break;
    case 'zing':
    default:
        arr.push(279382281);
        break;
    }
}
test_126.INPUTS = ['foo', 'bar', 'zing'];
test_126.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":"[^U}J^z","fallthrough":false},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":279382281,"fallthrough":false}];
TESTS.push(test_126);

function test_127(x, arr) {
    switch(x) {
    default:
    case 'foo':
    case 'bar':
        arr.push('7+leA1');
        break;
    case 'zing':
    }
}
test_127.INPUTS = ['foo', 'bar', 'zing'];
test_127.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":"7+leA1","fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_127);

function test_128(x, arr) {
    switch(x) {
    case 'foo':
    default:
    case 'bar':
        arr.push('7+leA1');
        break;
    case 'zing':
    }
}
test_128.INPUTS = ['foo', 'bar', 'zing'];
test_128.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":"7+leA1","fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_128);

function test_129(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
        arr.push('7+leA1');
        break;
    case 'zing':
    default:
    }
}
test_129.INPUTS = ['foo', 'bar', 'zing'];
test_129.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":"7+leA1","fallthrough":false},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_129);

function test_130(x, arr) {
    switch(x) {
    default:
        arr.push(282691036);
    case 'foo':
    case 'bar':
        arr.push('7+leA1');
        break;
    case 'zing':
    }
}
test_130.INPUTS = ['foo', 'bar', 'zing'];
test_130.SPEC = [{"match":null,"body":282691036,"fallthrough":true},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":"7+leA1","fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_130);

function test_131(x, arr) {
    switch(x) {
    case 'foo':
    default:
        arr.push(282691036);
    case 'bar':
        arr.push('7+leA1');
        break;
    case 'zing':
    }
}
test_131.INPUTS = ['foo', 'bar', 'zing'];
test_131.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":282691036,"fallthrough":true},{"match":"bar","body":"7+leA1","fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_131);

function test_132(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
        arr.push('7+leA1');
        break;
    case 'zing':
    default:
        arr.push(282691036);
    }
}
test_132.INPUTS = ['foo', 'bar', 'zing'];
test_132.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":"7+leA1","fallthrough":false},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":282691036,"fallthrough":true}];
TESTS.push(test_132);

function test_133(x, arr) {
    switch(x) {
    default:
        arr.push('C^kPR');
        break;
    case 'foo':
    case 'bar':
        arr.push('7+leA1');
        break;
    case 'zing':
    }
}
test_133.INPUTS = ['foo', 'bar', 'zing'];
test_133.SPEC = [{"match":null,"body":"C^kPR","fallthrough":false},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":"7+leA1","fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_133);

function test_134(x, arr) {
    switch(x) {
    case 'foo':
    default:
        arr.push('C^kPR');
        break;
    case 'bar':
        arr.push('7+leA1');
        break;
    case 'zing':
    }
}
test_134.INPUTS = ['foo', 'bar', 'zing'];
test_134.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":"C^kPR","fallthrough":false},{"match":"bar","body":"7+leA1","fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_134);

function test_135(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
        arr.push('7+leA1');
        break;
    case 'zing':
    default:
        arr.push('C^kPR');
        break;
    }
}
test_135.INPUTS = ['foo', 'bar', 'zing'];
test_135.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":"7+leA1","fallthrough":false},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":"C^kPR","fallthrough":false}];
TESTS.push(test_135);

function test_136(x, arr) {
    switch(x) {
    default:
    case 'foo':
        arr.push(1580091060);
        break;
    case 'bar':
        break;
    case 'zing':
        break;
    }
}
test_136.INPUTS = ['foo', 'bar', 'zing'];
test_136.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":1580091060,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_136);

function test_137(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(1580091060);
        break;
    default:
    case 'bar':
        break;
    case 'zing':
        break;
    }
}
test_137.INPUTS = ['foo', 'bar', 'zing'];
test_137.SPEC = [{"match":"foo","body":1580091060,"fallthrough":false},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_137);

function test_138(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(1580091060);
        break;
    case 'bar':
        break;
    case 'zing':
        break;
    default:
    }
}
test_138.INPUTS = ['foo', 'bar', 'zing'];
test_138.SPEC = [{"match":"foo","body":1580091060,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_138);

function test_139(x, arr) {
    switch(x) {
    default:
        arr.push(1822221944);
    case 'foo':
        arr.push(1580091060);
        break;
    case 'bar':
        break;
    case 'zing':
        break;
    }
}
test_139.INPUTS = ['foo', 'bar', 'zing'];
test_139.SPEC = [{"match":null,"body":1822221944,"fallthrough":true},{"match":"foo","body":1580091060,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_139);

function test_140(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(1580091060);
        break;
    default:
        arr.push(1822221944);
    case 'bar':
        break;
    case 'zing':
        break;
    }
}
test_140.INPUTS = ['foo', 'bar', 'zing'];
test_140.SPEC = [{"match":"foo","body":1580091060,"fallthrough":false},{"match":null,"body":1822221944,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_140);

function test_141(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(1580091060);
        break;
    case 'bar':
        break;
    case 'zing':
        break;
    default:
        arr.push(1822221944);
    }
}
test_141.INPUTS = ['foo', 'bar', 'zing'];
test_141.SPEC = [{"match":"foo","body":1580091060,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":1822221944,"fallthrough":true}];
TESTS.push(test_141);

function test_142(x, arr) {
    switch(x) {
    default:
        arr.push(1855786158);
        break;
    case 'foo':
        arr.push(1580091060);
        break;
    case 'bar':
        break;
    case 'zing':
        break;
    }
}
test_142.INPUTS = ['foo', 'bar', 'zing'];
test_142.SPEC = [{"match":null,"body":1855786158,"fallthrough":false},{"match":"foo","body":1580091060,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_142);

function test_143(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(1580091060);
        break;
    default:
        arr.push(1855786158);
        break;
    case 'bar':
        break;
    case 'zing':
        break;
    }
}
test_143.INPUTS = ['foo', 'bar', 'zing'];
test_143.SPEC = [{"match":"foo","body":1580091060,"fallthrough":false},{"match":null,"body":1855786158,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_143);

function test_144(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(1580091060);
        break;
    case 'bar':
        break;
    case 'zing':
        break;
    default:
        arr.push(1855786158);
        break;
    }
}
test_144.INPUTS = ['foo', 'bar', 'zing'];
test_144.SPEC = [{"match":"foo","body":1580091060,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":1855786158,"fallthrough":false}];
TESTS.push(test_144);

function test_145(x, arr) {
    switch(x) {
    default:
    case 'foo':
        arr.push('XO');
        break;
    case 'bar':
    case 'zing':
        break;
    }
}
test_145.INPUTS = ['foo', 'bar', 'zing'];
test_145.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":"XO","fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_145);

function test_146(x, arr) {
    switch(x) {
    case 'foo':
        arr.push('XO');
        break;
    default:
    case 'bar':
    case 'zing':
        break;
    }
}
test_146.INPUTS = ['foo', 'bar', 'zing'];
test_146.SPEC = [{"match":"foo","body":"XO","fallthrough":false},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_146);

function test_147(x, arr) {
    switch(x) {
    case 'foo':
        arr.push('XO');
        break;
    case 'bar':
    case 'zing':
        break;
    default:
    }
}
test_147.INPUTS = ['foo', 'bar', 'zing'];
test_147.SPEC = [{"match":"foo","body":"XO","fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_147);

function test_148(x, arr) {
    switch(x) {
    default:
        arr.push('L');
    case 'foo':
        arr.push('XO');
        break;
    case 'bar':
    case 'zing':
        break;
    }
}
test_148.INPUTS = ['foo', 'bar', 'zing'];
test_148.SPEC = [{"match":null,"body":"L","fallthrough":true},{"match":"foo","body":"XO","fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_148);

function test_149(x, arr) {
    switch(x) {
    case 'foo':
        arr.push('XO');
        break;
    default:
        arr.push('L');
    case 'bar':
    case 'zing':
        break;
    }
}
test_149.INPUTS = ['foo', 'bar', 'zing'];
test_149.SPEC = [{"match":"foo","body":"XO","fallthrough":false},{"match":null,"body":"L","fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_149);

function test_150(x, arr) {
    switch(x) {
    case 'foo':
        arr.push('XO');
        break;
    case 'bar':
    case 'zing':
        break;
    default:
        arr.push('L');
    }
}
test_150.INPUTS = ['foo', 'bar', 'zing'];
test_150.SPEC = [{"match":"foo","body":"XO","fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":"L","fallthrough":true}];
TESTS.push(test_150);

function test_151(x, arr) {
    switch(x) {
    default:
        arr.push(1118900933);
        break;
    case 'foo':
        arr.push('XO');
        break;
    case 'bar':
    case 'zing':
        break;
    }
}
test_151.INPUTS = ['foo', 'bar', 'zing'];
test_151.SPEC = [{"match":null,"body":1118900933,"fallthrough":false},{"match":"foo","body":"XO","fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_151);

function test_152(x, arr) {
    switch(x) {
    case 'foo':
        arr.push('XO');
        break;
    default:
        arr.push(1118900933);
        break;
    case 'bar':
    case 'zing':
        break;
    }
}
test_152.INPUTS = ['foo', 'bar', 'zing'];
test_152.SPEC = [{"match":"foo","body":"XO","fallthrough":false},{"match":null,"body":1118900933,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_152);

function test_153(x, arr) {
    switch(x) {
    case 'foo':
        arr.push('XO');
        break;
    case 'bar':
    case 'zing':
        break;
    default:
        arr.push(1118900933);
        break;
    }
}
test_153.INPUTS = ['foo', 'bar', 'zing'];
test_153.SPEC = [{"match":"foo","body":"XO","fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":1118900933,"fallthrough":false}];
TESTS.push(test_153);

function test_154(x, arr) {
    switch(x) {
    default:
    case 'foo':
        arr.push('H@');
        break;
    case 'bar':
        break;
    case 'zing':
    }
}
test_154.INPUTS = ['foo', 'bar', 'zing'];
test_154.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":"H@","fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_154);

function test_155(x, arr) {
    switch(x) {
    case 'foo':
        arr.push('H@');
        break;
    default:
    case 'bar':
        break;
    case 'zing':
    }
}
test_155.INPUTS = ['foo', 'bar', 'zing'];
test_155.SPEC = [{"match":"foo","body":"H@","fallthrough":false},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_155);

function test_156(x, arr) {
    switch(x) {
    case 'foo':
        arr.push('H@');
        break;
    case 'bar':
        break;
    case 'zing':
    default:
    }
}
test_156.INPUTS = ['foo', 'bar', 'zing'];
test_156.SPEC = [{"match":"foo","body":"H@","fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_156);

function test_157(x, arr) {
    switch(x) {
    default:
        arr.push('f8n');
    case 'foo':
        arr.push('H@');
        break;
    case 'bar':
        break;
    case 'zing':
    }
}
test_157.INPUTS = ['foo', 'bar', 'zing'];
test_157.SPEC = [{"match":null,"body":"f8n","fallthrough":true},{"match":"foo","body":"H@","fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_157);

function test_158(x, arr) {
    switch(x) {
    case 'foo':
        arr.push('H@');
        break;
    default:
        arr.push('f8n');
    case 'bar':
        break;
    case 'zing':
    }
}
test_158.INPUTS = ['foo', 'bar', 'zing'];
test_158.SPEC = [{"match":"foo","body":"H@","fallthrough":false},{"match":null,"body":"f8n","fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_158);

function test_159(x, arr) {
    switch(x) {
    case 'foo':
        arr.push('H@');
        break;
    case 'bar':
        break;
    case 'zing':
    default:
        arr.push('f8n');
    }
}
test_159.INPUTS = ['foo', 'bar', 'zing'];
test_159.SPEC = [{"match":"foo","body":"H@","fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":"f8n","fallthrough":true}];
TESTS.push(test_159);

function test_160(x, arr) {
    switch(x) {
    default:
        arr.push('4rg');
        break;
    case 'foo':
        arr.push('H@');
        break;
    case 'bar':
        break;
    case 'zing':
    }
}
test_160.INPUTS = ['foo', 'bar', 'zing'];
test_160.SPEC = [{"match":null,"body":"4rg","fallthrough":false},{"match":"foo","body":"H@","fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_160);

function test_161(x, arr) {
    switch(x) {
    case 'foo':
        arr.push('H@');
        break;
    default:
        arr.push('4rg');
        break;
    case 'bar':
        break;
    case 'zing':
    }
}
test_161.INPUTS = ['foo', 'bar', 'zing'];
test_161.SPEC = [{"match":"foo","body":"H@","fallthrough":false},{"match":null,"body":"4rg","fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_161);

function test_162(x, arr) {
    switch(x) {
    case 'foo':
        arr.push('H@');
        break;
    case 'bar':
        break;
    case 'zing':
    default:
        arr.push('4rg');
        break;
    }
}
test_162.INPUTS = ['foo', 'bar', 'zing'];
test_162.SPEC = [{"match":"foo","body":"H@","fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":"4rg","fallthrough":false}];
TESTS.push(test_162);

function test_163(x, arr) {
    switch(x) {
    default:
    case 'foo':
        arr.push(1921603085);
        break;
    case 'bar':
    case 'zing':
    }
}
test_163.INPUTS = ['foo', 'bar', 'zing'];
test_163.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":1921603085,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_163);

function test_164(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(1921603085);
        break;
    default:
    case 'bar':
    case 'zing':
    }
}
test_164.INPUTS = ['foo', 'bar', 'zing'];
test_164.SPEC = [{"match":"foo","body":1921603085,"fallthrough":false},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_164);

function test_165(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(1921603085);
        break;
    case 'bar':
    case 'zing':
    default:
    }
}
test_165.INPUTS = ['foo', 'bar', 'zing'];
test_165.SPEC = [{"match":"foo","body":1921603085,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_165);

function test_166(x, arr) {
    switch(x) {
    default:
        arr.push(2201436);
    case 'foo':
        arr.push(1921603085);
        break;
    case 'bar':
    case 'zing':
    }
}
test_166.INPUTS = ['foo', 'bar', 'zing'];
test_166.SPEC = [{"match":null,"body":2201436,"fallthrough":true},{"match":"foo","body":1921603085,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_166);

function test_167(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(1921603085);
        break;
    default:
        arr.push(2201436);
    case 'bar':
    case 'zing':
    }
}
test_167.INPUTS = ['foo', 'bar', 'zing'];
test_167.SPEC = [{"match":"foo","body":1921603085,"fallthrough":false},{"match":null,"body":2201436,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_167);

function test_168(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(1921603085);
        break;
    case 'bar':
    case 'zing':
    default:
        arr.push(2201436);
    }
}
test_168.INPUTS = ['foo', 'bar', 'zing'];
test_168.SPEC = [{"match":"foo","body":1921603085,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":2201436,"fallthrough":true}];
TESTS.push(test_168);

function test_169(x, arr) {
    switch(x) {
    default:
        arr.push('(vPssM{');
        break;
    case 'foo':
        arr.push(1921603085);
        break;
    case 'bar':
    case 'zing':
    }
}
test_169.INPUTS = ['foo', 'bar', 'zing'];
test_169.SPEC = [{"match":null,"body":"(vPssM{","fallthrough":false},{"match":"foo","body":1921603085,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_169);

function test_170(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(1921603085);
        break;
    default:
        arr.push('(vPssM{');
        break;
    case 'bar':
    case 'zing':
    }
}
test_170.INPUTS = ['foo', 'bar', 'zing'];
test_170.SPEC = [{"match":"foo","body":1921603085,"fallthrough":false},{"match":null,"body":"(vPssM{","fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_170);

function test_171(x, arr) {
    switch(x) {
    case 'foo':
        arr.push(1921603085);
        break;
    case 'bar':
    case 'zing':
    default:
        arr.push('(vPssM{');
        break;
    }
}
test_171.INPUTS = ['foo', 'bar', 'zing'];
test_171.SPEC = [{"match":"foo","body":1921603085,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":"(vPssM{","fallthrough":false}];
TESTS.push(test_171);

function test_172(x, arr) {
    switch(x) {
    default:
    case 'foo':
        break;
    case 'bar':
        break;
    case 'zing':
        break;
    }
}
test_172.INPUTS = ['foo', 'bar', 'zing'];
test_172.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_172);

function test_173(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
    case 'bar':
        break;
    case 'zing':
        break;
    }
}
test_173.INPUTS = ['foo', 'bar', 'zing'];
test_173.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_173);

function test_174(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
        break;
    case 'zing':
        break;
    default:
    }
}
test_174.INPUTS = ['foo', 'bar', 'zing'];
test_174.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_174);

function test_175(x, arr) {
    switch(x) {
    default:
        arr.push('y');
    case 'foo':
        break;
    case 'bar':
        break;
    case 'zing':
        break;
    }
}
test_175.INPUTS = ['foo', 'bar', 'zing'];
test_175.SPEC = [{"match":null,"body":"y","fallthrough":true},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_175);

function test_176(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
        arr.push('y');
    case 'bar':
        break;
    case 'zing':
        break;
    }
}
test_176.INPUTS = ['foo', 'bar', 'zing'];
test_176.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":"y","fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_176);

function test_177(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
        break;
    case 'zing':
        break;
    default:
        arr.push('y');
    }
}
test_177.INPUTS = ['foo', 'bar', 'zing'];
test_177.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":"y","fallthrough":true}];
TESTS.push(test_177);

function test_178(x, arr) {
    switch(x) {
    default:
        arr.push('H');
        break;
    case 'foo':
        break;
    case 'bar':
        break;
    case 'zing':
        break;
    }
}
test_178.INPUTS = ['foo', 'bar', 'zing'];
test_178.SPEC = [{"match":null,"body":"H","fallthrough":false},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_178);

function test_179(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
        arr.push('H');
        break;
    case 'bar':
        break;
    case 'zing':
        break;
    }
}
test_179.INPUTS = ['foo', 'bar', 'zing'];
test_179.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":"H","fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_179);

function test_180(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
        break;
    case 'zing':
        break;
    default:
        arr.push('H');
        break;
    }
}
test_180.INPUTS = ['foo', 'bar', 'zing'];
test_180.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":"H","fallthrough":false}];
TESTS.push(test_180);

function test_181(x, arr) {
    switch(x) {
    default:
    case 'foo':
    case 'bar':
        break;
    case 'zing':
        break;
    }
}
test_181.INPUTS = ['foo', 'bar', 'zing'];
test_181.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_181);

function test_182(x, arr) {
    switch(x) {
    case 'foo':
    default:
    case 'bar':
        break;
    case 'zing':
        break;
    }
}
test_182.INPUTS = ['foo', 'bar', 'zing'];
test_182.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_182);

function test_183(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
        break;
    case 'zing':
        break;
    default:
    }
}
test_183.INPUTS = ['foo', 'bar', 'zing'];
test_183.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_183);

function test_184(x, arr) {
    switch(x) {
    default:
        arr.push('0vM}');
    case 'foo':
    case 'bar':
        break;
    case 'zing':
        break;
    }
}
test_184.INPUTS = ['foo', 'bar', 'zing'];
test_184.SPEC = [{"match":null,"body":"0vM}","fallthrough":true},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_184);

function test_185(x, arr) {
    switch(x) {
    case 'foo':
    default:
        arr.push('0vM}');
    case 'bar':
        break;
    case 'zing':
        break;
    }
}
test_185.INPUTS = ['foo', 'bar', 'zing'];
test_185.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":"0vM}","fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_185);

function test_186(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
        break;
    case 'zing':
        break;
    default:
        arr.push('0vM}');
    }
}
test_186.INPUTS = ['foo', 'bar', 'zing'];
test_186.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":"0vM}","fallthrough":true}];
TESTS.push(test_186);

function test_187(x, arr) {
    switch(x) {
    default:
        arr.push('jn~d(x');
        break;
    case 'foo':
    case 'bar':
        break;
    case 'zing':
        break;
    }
}
test_187.INPUTS = ['foo', 'bar', 'zing'];
test_187.SPEC = [{"match":null,"body":"jn~d(x","fallthrough":false},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_187);

function test_188(x, arr) {
    switch(x) {
    case 'foo':
    default:
        arr.push('jn~d(x');
        break;
    case 'bar':
        break;
    case 'zing':
        break;
    }
}
test_188.INPUTS = ['foo', 'bar', 'zing'];
test_188.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":"jn~d(x","fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_188);

function test_189(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
        break;
    case 'zing':
        break;
    default:
        arr.push('jn~d(x');
        break;
    }
}
test_189.INPUTS = ['foo', 'bar', 'zing'];
test_189.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":"jn~d(x","fallthrough":false}];
TESTS.push(test_189);

function test_190(x, arr) {
    switch(x) {
    default:
    case 'foo':
        break;
    case 'bar':
    case 'zing':
        break;
    }
}
test_190.INPUTS = ['foo', 'bar', 'zing'];
test_190.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_190);

function test_191(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
    case 'bar':
    case 'zing':
        break;
    }
}
test_191.INPUTS = ['foo', 'bar', 'zing'];
test_191.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_191);

function test_192(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
    case 'zing':
        break;
    default:
    }
}
test_192.INPUTS = ['foo', 'bar', 'zing'];
test_192.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_192);

function test_193(x, arr) {
    switch(x) {
    default:
        arr.push('[');
    case 'foo':
        break;
    case 'bar':
    case 'zing':
        break;
    }
}
test_193.INPUTS = ['foo', 'bar', 'zing'];
test_193.SPEC = [{"match":null,"body":"[","fallthrough":true},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_193);

function test_194(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
        arr.push('[');
    case 'bar':
    case 'zing':
        break;
    }
}
test_194.INPUTS = ['foo', 'bar', 'zing'];
test_194.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":"[","fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_194);

function test_195(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
    case 'zing':
        break;
    default:
        arr.push('[');
    }
}
test_195.INPUTS = ['foo', 'bar', 'zing'];
test_195.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":"[","fallthrough":true}];
TESTS.push(test_195);

function test_196(x, arr) {
    switch(x) {
    default:
        arr.push('3DbGY');
        break;
    case 'foo':
        break;
    case 'bar':
    case 'zing':
        break;
    }
}
test_196.INPUTS = ['foo', 'bar', 'zing'];
test_196.SPEC = [{"match":null,"body":"3DbGY","fallthrough":false},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_196);

function test_197(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
        arr.push('3DbGY');
        break;
    case 'bar':
    case 'zing':
        break;
    }
}
test_197.INPUTS = ['foo', 'bar', 'zing'];
test_197.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":"3DbGY","fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_197);

function test_198(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
    case 'zing':
        break;
    default:
        arr.push('3DbGY');
        break;
    }
}
test_198.INPUTS = ['foo', 'bar', 'zing'];
test_198.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":"3DbGY","fallthrough":false}];
TESTS.push(test_198);

function test_199(x, arr) {
    switch(x) {
    default:
    case 'foo':
    case 'bar':
    case 'zing':
        break;
    }
}
test_199.INPUTS = ['foo', 'bar', 'zing'];
test_199.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_199);

function test_200(x, arr) {
    switch(x) {
    case 'foo':
    default:
    case 'bar':
    case 'zing':
        break;
    }
}
test_200.INPUTS = ['foo', 'bar', 'zing'];
test_200.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_200);

function test_201(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
    case 'zing':
        break;
    default:
    }
}
test_201.INPUTS = ['foo', 'bar', 'zing'];
test_201.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_201);

function test_202(x, arr) {
    switch(x) {
    default:
        arr.push(1320190826);
    case 'foo':
    case 'bar':
    case 'zing':
        break;
    }
}
test_202.INPUTS = ['foo', 'bar', 'zing'];
test_202.SPEC = [{"match":null,"body":1320190826,"fallthrough":true},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_202);

function test_203(x, arr) {
    switch(x) {
    case 'foo':
    default:
        arr.push(1320190826);
    case 'bar':
    case 'zing':
        break;
    }
}
test_203.INPUTS = ['foo', 'bar', 'zing'];
test_203.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":1320190826,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_203);

function test_204(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
    case 'zing':
        break;
    default:
        arr.push(1320190826);
    }
}
test_204.INPUTS = ['foo', 'bar', 'zing'];
test_204.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":1320190826,"fallthrough":true}];
TESTS.push(test_204);

function test_205(x, arr) {
    switch(x) {
    default:
        arr.push(1211439111);
        break;
    case 'foo':
    case 'bar':
    case 'zing':
        break;
    }
}
test_205.INPUTS = ['foo', 'bar', 'zing'];
test_205.SPEC = [{"match":null,"body":1211439111,"fallthrough":false},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_205);

function test_206(x, arr) {
    switch(x) {
    case 'foo':
    default:
        arr.push(1211439111);
        break;
    case 'bar':
    case 'zing':
        break;
    }
}
test_206.INPUTS = ['foo', 'bar', 'zing'];
test_206.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":1211439111,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false}];
TESTS.push(test_206);

function test_207(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
    case 'zing':
        break;
    default:
        arr.push(1211439111);
        break;
    }
}
test_207.INPUTS = ['foo', 'bar', 'zing'];
test_207.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":false},{"match":null,"body":1211439111,"fallthrough":false}];
TESTS.push(test_207);

function test_208(x, arr) {
    switch(x) {
    default:
    case 'foo':
        break;
    case 'bar':
        break;
    case 'zing':
    }
}
test_208.INPUTS = ['foo', 'bar', 'zing'];
test_208.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_208);

function test_209(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
    case 'bar':
        break;
    case 'zing':
    }
}
test_209.INPUTS = ['foo', 'bar', 'zing'];
test_209.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_209);

function test_210(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
        break;
    case 'zing':
    default:
    }
}
test_210.INPUTS = ['foo', 'bar', 'zing'];
test_210.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_210);

function test_211(x, arr) {
    switch(x) {
    default:
        arr.push(1547874695);
    case 'foo':
        break;
    case 'bar':
        break;
    case 'zing':
    }
}
test_211.INPUTS = ['foo', 'bar', 'zing'];
test_211.SPEC = [{"match":null,"body":1547874695,"fallthrough":true},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_211);

function test_212(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
        arr.push(1547874695);
    case 'bar':
        break;
    case 'zing':
    }
}
test_212.INPUTS = ['foo', 'bar', 'zing'];
test_212.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":1547874695,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_212);

function test_213(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
        break;
    case 'zing':
    default:
        arr.push(1547874695);
    }
}
test_213.INPUTS = ['foo', 'bar', 'zing'];
test_213.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":1547874695,"fallthrough":true}];
TESTS.push(test_213);

function test_214(x, arr) {
    switch(x) {
    default:
        arr.push('@_2GFlnK=t');
        break;
    case 'foo':
        break;
    case 'bar':
        break;
    case 'zing':
    }
}
test_214.INPUTS = ['foo', 'bar', 'zing'];
test_214.SPEC = [{"match":null,"body":"@_2GFlnK=t","fallthrough":false},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_214);

function test_215(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
        arr.push('@_2GFlnK=t');
        break;
    case 'bar':
        break;
    case 'zing':
    }
}
test_215.INPUTS = ['foo', 'bar', 'zing'];
test_215.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":"@_2GFlnK=t","fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_215);

function test_216(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
        break;
    case 'zing':
    default:
        arr.push('@_2GFlnK=t');
        break;
    }
}
test_216.INPUTS = ['foo', 'bar', 'zing'];
test_216.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":"@_2GFlnK=t","fallthrough":false}];
TESTS.push(test_216);

function test_217(x, arr) {
    switch(x) {
    default:
    case 'foo':
    case 'bar':
        break;
    case 'zing':
    }
}
test_217.INPUTS = ['foo', 'bar', 'zing'];
test_217.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_217);

function test_218(x, arr) {
    switch(x) {
    case 'foo':
    default:
    case 'bar':
        break;
    case 'zing':
    }
}
test_218.INPUTS = ['foo', 'bar', 'zing'];
test_218.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_218);

function test_219(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
        break;
    case 'zing':
    default:
    }
}
test_219.INPUTS = ['foo', 'bar', 'zing'];
test_219.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_219);

function test_220(x, arr) {
    switch(x) {
    default:
        arr.push('~C$');
    case 'foo':
    case 'bar':
        break;
    case 'zing':
    }
}
test_220.INPUTS = ['foo', 'bar', 'zing'];
test_220.SPEC = [{"match":null,"body":"~C$","fallthrough":true},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_220);

function test_221(x, arr) {
    switch(x) {
    case 'foo':
    default:
        arr.push('~C$');
    case 'bar':
        break;
    case 'zing':
    }
}
test_221.INPUTS = ['foo', 'bar', 'zing'];
test_221.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":"~C$","fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_221);

function test_222(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
        break;
    case 'zing':
    default:
        arr.push('~C$');
    }
}
test_222.INPUTS = ['foo', 'bar', 'zing'];
test_222.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":"~C$","fallthrough":true}];
TESTS.push(test_222);

function test_223(x, arr) {
    switch(x) {
    default:
        arr.push('2sfo%');
        break;
    case 'foo':
    case 'bar':
        break;
    case 'zing':
    }
}
test_223.INPUTS = ['foo', 'bar', 'zing'];
test_223.SPEC = [{"match":null,"body":"2sfo%","fallthrough":false},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_223);

function test_224(x, arr) {
    switch(x) {
    case 'foo':
    default:
        arr.push('2sfo%');
        break;
    case 'bar':
        break;
    case 'zing':
    }
}
test_224.INPUTS = ['foo', 'bar', 'zing'];
test_224.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":"2sfo%","fallthrough":false},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_224);

function test_225(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
        break;
    case 'zing':
    default:
        arr.push('2sfo%');
        break;
    }
}
test_225.INPUTS = ['foo', 'bar', 'zing'];
test_225.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":false},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":"2sfo%","fallthrough":false}];
TESTS.push(test_225);

function test_226(x, arr) {
    switch(x) {
    default:
    case 'foo':
        break;
    case 'bar':
    case 'zing':
    }
}
test_226.INPUTS = ['foo', 'bar', 'zing'];
test_226.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_226);

function test_227(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
    case 'bar':
    case 'zing':
    }
}
test_227.INPUTS = ['foo', 'bar', 'zing'];
test_227.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_227);

function test_228(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
    case 'zing':
    default:
    }
}
test_228.INPUTS = ['foo', 'bar', 'zing'];
test_228.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_228);

function test_229(x, arr) {
    switch(x) {
    default:
        arr.push(1637942279);
    case 'foo':
        break;
    case 'bar':
    case 'zing':
    }
}
test_229.INPUTS = ['foo', 'bar', 'zing'];
test_229.SPEC = [{"match":null,"body":1637942279,"fallthrough":true},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_229);

function test_230(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
        arr.push(1637942279);
    case 'bar':
    case 'zing':
    }
}
test_230.INPUTS = ['foo', 'bar', 'zing'];
test_230.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":1637942279,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_230);

function test_231(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
    case 'zing':
    default:
        arr.push(1637942279);
    }
}
test_231.INPUTS = ['foo', 'bar', 'zing'];
test_231.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":1637942279,"fallthrough":true}];
TESTS.push(test_231);

function test_232(x, arr) {
    switch(x) {
    default:
        arr.push('4E!jR');
        break;
    case 'foo':
        break;
    case 'bar':
    case 'zing':
    }
}
test_232.INPUTS = ['foo', 'bar', 'zing'];
test_232.SPEC = [{"match":null,"body":"4E!jR","fallthrough":false},{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_232);

function test_233(x, arr) {
    switch(x) {
    case 'foo':
        break;
    default:
        arr.push('4E!jR');
        break;
    case 'bar':
    case 'zing':
    }
}
test_233.INPUTS = ['foo', 'bar', 'zing'];
test_233.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":null,"body":"4E!jR","fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_233);

function test_234(x, arr) {
    switch(x) {
    case 'foo':
        break;
    case 'bar':
    case 'zing':
    default:
        arr.push('4E!jR');
        break;
    }
}
test_234.INPUTS = ['foo', 'bar', 'zing'];
test_234.SPEC = [{"match":"foo","body":null,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":"4E!jR","fallthrough":false}];
TESTS.push(test_234);

function test_235(x, arr) {
    switch(x) {
    default:
    case 'foo':
    case 'bar':
    case 'zing':
    }
}
test_235.INPUTS = ['foo', 'bar', 'zing'];
test_235.SPEC = [{"match":null,"body":null,"fallthrough":true},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_235);

function test_236(x, arr) {
    switch(x) {
    case 'foo':
    default:
    case 'bar':
    case 'zing':
    }
}
test_236.INPUTS = ['foo', 'bar', 'zing'];
test_236.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_236);

function test_237(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
    case 'zing':
    default:
    }
}
test_237.INPUTS = ['foo', 'bar', 'zing'];
test_237.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":null,"fallthrough":true}];
TESTS.push(test_237);

function test_238(x, arr) {
    switch(x) {
    default:
        arr.push(')fSNzp06');
    case 'foo':
    case 'bar':
    case 'zing':
    }
}
test_238.INPUTS = ['foo', 'bar', 'zing'];
test_238.SPEC = [{"match":null,"body":")fSNzp06","fallthrough":true},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_238);

function test_239(x, arr) {
    switch(x) {
    case 'foo':
    default:
        arr.push(')fSNzp06');
    case 'bar':
    case 'zing':
    }
}
test_239.INPUTS = ['foo', 'bar', 'zing'];
test_239.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":")fSNzp06","fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_239);

function test_240(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
    case 'zing':
    default:
        arr.push(')fSNzp06');
    }
}
test_240.INPUTS = ['foo', 'bar', 'zing'];
test_240.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":")fSNzp06","fallthrough":true}];
TESTS.push(test_240);

function test_241(x, arr) {
    switch(x) {
    default:
        arr.push(974910083);
        break;
    case 'foo':
    case 'bar':
    case 'zing':
    }
}
test_241.INPUTS = ['foo', 'bar', 'zing'];
test_241.SPEC = [{"match":null,"body":974910083,"fallthrough":false},{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_241);

function test_242(x, arr) {
    switch(x) {
    case 'foo':
    default:
        arr.push(974910083);
        break;
    case 'bar':
    case 'zing':
    }
}
test_242.INPUTS = ['foo', 'bar', 'zing'];
test_242.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":null,"body":974910083,"fallthrough":false},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true}];
TESTS.push(test_242);

function test_243(x, arr) {
    switch(x) {
    case 'foo':
    case 'bar':
    case 'zing':
    default:
        arr.push(974910083);
        break;
    }
}
test_243.INPUTS = ['foo', 'bar', 'zing'];
test_243.SPEC = [{"match":"foo","body":null,"fallthrough":true},{"match":"bar","body":null,"fallthrough":true},{"match":"zing","body":null,"fallthrough":true},{"match":null,"body":974910083,"fallthrough":false}];
TESTS.push(test_243);


/////////////////////////////////////////
// RUNNER                              //
/////////////////////////////////////////

for(var i = 0; i < TESTS.length; i++) {
  RunTest(TESTS[i]);
}
