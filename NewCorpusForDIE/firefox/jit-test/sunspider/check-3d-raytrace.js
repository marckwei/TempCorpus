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

/*
 * Copyright (C) 2007 Apple Inc.  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE COMPUTER, INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE COMPUTER, INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 
 */

function createVector(x,y,z) {
    return new Array(x,y,z);
}

function sqrLengthVector(self) {
    return self[0] * self[0] + self[1] * self[1] + self[2] * self[2];
}

function lengthVector(self) {
    return Math.sqrt(self[0] * self[0] + self[1] * self[1] + self[2] * self[2]);
}

function addVector(self, v) {
    self[0] += v[0];
    self[1] += v[1];
    self[2] += v[2];
    return self;
}

function subVector(self, v) {
    self[0] -= v[0];
    self[1] -= v[1];
    self[2] -= v[2];
    return self;
}

function scaleVector(self, scale) {
    self[0] *= scale;
    self[1] *= scale;
    self[2] *= scale;
    return self;
}

function normaliseVector(self) {
    var len = Math.sqrt(self[0] * self[0] + self[1] * self[1] + self[2] * self[2]);
    self[0] /= len;
    self[1] /= len;
    self[2] /= len;
    return self;
}

function add(v1, v2) {
    return new Array(v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]);
}

function sub(v1, v2) {
    return new Array(v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]);
}

function scalev(v1, v2) {
    return new Array(v1[0] * v2[0], v1[1] * v2[1], v1[2] * v2[2]);
}

function dot(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

function scale(v, scale) {
    return [v[0] * scale, v[1] * scale, v[2] * scale];
}

function cross(v1, v2) {
    return [v1[1] * v2[2] - v1[2] * v2[1], 
            v1[2] * v2[0] - v1[0] * v2[2],
            v1[0] * v2[1] - v1[1] * v2[0]];

}

function normalise(v) {
    var len = lengthVector(v);
    return [v[0] / len, v[1] / len, v[2] / len];
}

function transformMatrix(self, v) {
    var vals = self;
    var x  = vals[0] * v[0] + vals[1] * v[1] + vals[2] * v[2] + vals[3];
    var y  = vals[4] * v[0] + vals[5] * v[1] + vals[6] * v[2] + vals[7];
    var z  = vals[8] * v[0] + vals[9] * v[1] + vals[10] * v[2] + vals[11];
    return [x, y, z];
}

function invertMatrix(self) {
    var temp = new Array(16);
    var tx = -self[3];
    var ty = -self[7];
    var tz = -self[11];
    for (h = 0; h < 3; h++) 
        for (v = 0; v < 3; v++) 
            temp[h + v * 4] = self[v + h * 4];
    for (i = 0; i < 11; i++)
        self[i] = temp[i];
    self[3] = tx * self[0] + ty * self[1] + tz * self[2];
    self[7] = tx * self[4] + ty * self[5] + tz * self[6];
    self[11] = tx * self[8] + ty * self[9] + tz * self[10];
    return self;
}


// Triangle intersection using barycentric coord method
function Triangle(p1, p2, p3) {
    var edge1 = sub(p3, p1);
    var edge2 = sub(p2, p1);
    var normal = cross(edge1, edge2);
    if (Math.abs(normal[0]) > Math.abs(normal[1]))
        if (Math.abs(normal[0]) > Math.abs(normal[2]))
            this.axis = 0; 
        else 
            this.axis = 2;
    else
        if (Math.abs(normal[1]) > Math.abs(normal[2])) 
            this.axis = 1;
        else 
            this.axis = 2;
    var u = (this.axis + 1) % 3;
    var v = (this.axis + 2) % 3;
    var u1 = edge1[u];
    var v1 = edge1[v];
    
    var u2 = edge2[u];
    var v2 = edge2[v];
    this.normal = normalise(normal);
    this.nu = normal[u] / normal[this.axis];
    this.nv = normal[v] / normal[this.axis];
    this.nd = dot(normal, p1) / normal[this.axis];
    var det = u1 * v2 - v1 * u2;
    this.eu = p1[u];
    this.ev = p1[v]; 
    this.nu1 = u1 / det;
    this.nv1 = -v1 / det;
    this.nu2 = v2 / det;
    this.nv2 = -u2 / det; 
    this.material = [0.7, 0.7, 0.7];
}

Triangle.prototype.intersect = function(orig, dir, near, far) {
    var u = (this.axis + 1) % 3;
    var v = (this.axis + 2) % 3;
    var d = dir[this.axis] + this.nu * dir[u] + this.nv * dir[v];
    var t = (this.nd - orig[this.axis] - this.nu * orig[u] - this.nv * orig[v]) / d;
    if (t < near || t > far)
        return null;
    var Pu = orig[u] + t * dir[u] - this.eu;
    var Pv = orig[v] + t * dir[v] - this.ev;
    var a2 = Pv * this.nu1 + Pu * this.nv1;
    if (a2 < 0) 
        return null;
    var a3 = Pu * this.nu2 + Pv * this.nv2;
    if (a3 < 0) 
        return null;

    if ((a2 + a3) > 1) 
        return null;
    return t;
}

function Scene(a_triangles) {
    this.triangles = a_triangles;
    this.lights = [];
    this.ambient = [0,0,0];
    this.background = [0.8,0.8,1];
}
var zero = new Array(0,0,0);

Scene.prototype.intersect = function(origin, dir, near, far) {
    var closest = null;
    for (i = 0; i < this.triangles.length; i++) {
        var triangle = this.triangles[i];   
        var d = triangle.intersect(origin, dir, near, far);
        if (d == null || d > far || d < near)
            continue;
        far = d;
        closest = triangle;
    }
    
    if (!closest)
        return [this.background[0],this.background[1],this.background[2]];
        
    var normal = closest.normal;
    var hit = add(origin, scale(dir, far)); 
    if (dot(dir, normal) > 0)
        normal = [-normal[0], -normal[1], -normal[2]];
    
    var colour = null;
    if (closest.shader) {
        colour = closest.shader(closest, hit, dir);
    } else {
        colour = closest.material;
    }
    
    // do reflection
    var reflected = null;
    if (colour.reflection > 0.001) {
        var reflection = addVector(scale(normal, -2*dot(dir, normal)), dir);
        reflected = this.intersect(hit, reflection, 0.0001, 1000000);
        if (colour.reflection >= 0.999999)
            return reflected;
    }
    
    var l = [this.ambient[0], this.ambient[1], this.ambient[2]];
    for (var i = 0; i < this.lights.length; i++) {
        var light = this.lights[i];
        var toLight = sub(light, hit);
        var distance = lengthVector(toLight);
        scaleVector(toLight, 1.0/distance);
        distance -= 0.0001;
        if (this.blocked(hit, toLight, distance))
            continue;
        var nl = dot(normal, toLight);
        if (nl > 0)
            addVector(l, scale(light.colour, nl));
    }
    l = scalev(l, colour);
    if (reflected) {
        l = addVector(scaleVector(l, 1 - colour.reflection), scaleVector(reflected, colour.reflection));
    }
    return l;
}

Scene.prototype.blocked = function(O, D, far) {
    var near = 0.0001;
    var closest = null;
    for (i = 0; i < this.triangles.length; i++) {
        var triangle = this.triangles[i];   
        var d = triangle.intersect(O, D, near, far);
        if (d == null || d > far || d < near)
            continue;
        return true;
    }
    
    return false;
}


// this camera code is from notes i made ages ago, it is from *somewhere* -- i cannot remember where
// that somewhere is
function Camera(origin, lookat, up) {
    var zaxis = normaliseVector(subVector(lookat, origin));
    var xaxis = normaliseVector(cross(up, zaxis));
    var yaxis = normaliseVector(cross(xaxis, subVector([0,0,0], zaxis)));
    var m = new Array(16);
    m[0] = xaxis[0]; m[1] = xaxis[1]; m[2] = xaxis[2];
    m[4] = yaxis[0]; m[5] = yaxis[1]; m[6] = yaxis[2];
    m[8] = zaxis[0]; m[9] = zaxis[1]; m[10] = zaxis[2];
    invertMatrix(m);
    m[3] = 0; m[7] = 0; m[11] = 0;
    this.origin = origin;
    this.directions = new Array(4);
    this.directions[0] = normalise([-0.7,  0.7, 1]);
    this.directions[1] = normalise([ 0.7,  0.7, 1]);
    this.directions[2] = normalise([ 0.7, -0.7, 1]);
    this.directions[3] = normalise([-0.7, -0.7, 1]);
    this.directions[0] = transformMatrix(m, this.directions[0]);
    this.directions[1] = transformMatrix(m, this.directions[1]);
    this.directions[2] = transformMatrix(m, this.directions[2]);
    this.directions[3] = transformMatrix(m, this.directions[3]);
}

Camera.prototype.generateRayPair = function(y) {
    rays = new Array(new Object(), new Object());
    rays[0].origin = this.origin;
    rays[1].origin = this.origin;
    rays[0].dir = addVector(scale(this.directions[0], y), scale(this.directions[3], 1 - y));
    rays[1].dir = addVector(scale(this.directions[1], y), scale(this.directions[2], 1 - y));
    return rays;
}

function renderRows(camera, scene, pixels, width, height, starty, stopy) {
    for (var y = starty; y < stopy; y++) {
        var rays = camera.generateRayPair(y / height);
        for (var x = 0; x < width; x++) {
            var xp = x / width;
            var origin = addVector(scale(rays[0].origin, xp), scale(rays[1].origin, 1 - xp));
            var dir = normaliseVector(addVector(scale(rays[0].dir, xp), scale(rays[1].dir, 1 - xp)));
            var l = scene.intersect(origin, dir);
            pixels[y][x] = l;
        }
    }
}

Camera.prototype.render = function(scene, pixels, width, height) {
    var cam = this;
    var row = 0;
    renderRows(cam, scene, pixels, width, height, 0, height);
}



function raytraceScene()
{
    var numTriangles = 2 * 6;
    var triangles = new Array();//numTriangles);
    var tfl = createVector(-10,  10, -10);
    var tfr = createVector( 10,  10, -10);
    var tbl = createVector(-10,  10,  10);
    var tbr = createVector( 10,  10,  10);
    var bfl = createVector(-10, -10, -10);
    var bfr = createVector( 10, -10, -10);
    var bbl = createVector(-10, -10,  10);
    var bbr = createVector( 10, -10,  10);
    
    // cube!!!
    // front
    var i = 0;
    
    triangles[i++] = new Triangle(tfl, tfr, bfr);
    triangles[i++] = new Triangle(tfl, bfr, bfl);
    // back
    triangles[i++] = new Triangle(tbl, tbr, bbr);
    triangles[i++] = new Triangle(tbl, bbr, bbl);
    //        triangles[i-1].material = [0.7,0.2,0.2];
    //            triangles[i-1].material.reflection = 0.8;
    // left
    triangles[i++] = new Triangle(tbl, tfl, bbl);
    //            triangles[i-1].reflection = 0.6;
    triangles[i++] = new Triangle(tfl, bfl, bbl);
    //            triangles[i-1].reflection = 0.6;
    // right
    triangles[i++] = new Triangle(tbr, tfr, bbr);
    triangles[i++] = new Triangle(tfr, bfr, bbr);
    // top
    triangles[i++] = new Triangle(tbl, tbr, tfr);
    triangles[i++] = new Triangle(tbl, tfr, tfl);
    // bottom
    triangles[i++] = new Triangle(bbl, bbr, bfr);
    triangles[i++] = new Triangle(bbl, bfr, bfl);
    
    //Floor!!!!
    var green = createVector(0.0, 0.4, 0.0);
    var grey = createVector(0.4, 0.4, 0.4);
    grey.reflection = 1.0;
    var floorShader = function(tri, pos, view) {
        var x = ((pos[0]/32) % 2 + 2) % 2;
        var z = ((pos[2]/32 + 0.3) % 2 + 2) % 2;
        if (x < 1 != z < 1) {
            //in the real world we use the fresnel term...
            //    var angle = 1-dot(view, tri.normal);
            //   angle *= angle;
            //  angle *= angle;
            // angle *= angle;
            //grey.reflection = angle;
            return grey;
        } else 
            return green;
    }
    var ffl = createVector(-1000, -30, -1000);
    var ffr = createVector( 1000, -30, -1000);
    var fbl = createVector(-1000, -30,  1000);
    var fbr = createVector( 1000, -30,  1000);
    triangles[i++] = new Triangle(fbl, fbr, ffr);
    triangles[i-1].shader = floorShader;
    triangles[i++] = new Triangle(fbl, ffr, ffl);
    triangles[i-1].shader = floorShader;
    
    var _scene = new Scene(triangles);
    _scene.lights[0] = createVector(20, 38, -22);
    _scene.lights[0].colour = createVector(0.7, 0.3, 0.3);
    _scene.lights[1] = createVector(-23, 40, 17);
    _scene.lights[1].colour = createVector(0.7, 0.3, 0.3);
    _scene.lights[2] = createVector(23, 20, 17);
    _scene.lights[2].colour = createVector(0.7, 0.7, 0.7);
    _scene.ambient = createVector(0.1, 0.1, 0.1);
    //  _scene.background = createVector(0.7, 0.7, 1.0);
    
    var size = 30;
    var pixels = new Array();
    for (var y = 0; y < size; y++) {
        pixels[y] = new Array();
        for (var x = 0; x < size; x++) {
            pixels[y][x] = 0;
        }
    }

    var _camera = new Camera(createVector(-40, 40, 40), createVector(0, 0, 0), createVector(0, 1, 0));
    _camera.render(_scene, pixels, size, size);

    return pixels;
}

function arrayToCanvasCommands(pixels)
{
    var s = '<canvas id="renderCanvas" width="30px" height="30px"></canvas><scr' + 'ipt>\nvar pixels = [';
    var size = 30;
    for (var y = 0; y < size; y++) {
        s += "[";
        for (var x = 0; x < size; x++) {
            s += "[" + pixels[y][x] + "],";
        }
        s+= "],";
    }
    s += '];\n    var canvas = document.getElementById("renderCanvas").getContext("2d");\n\
\n\
\n\
    var size = 30;\n\
    canvas.fillStyle = "red";\n\
    canvas.fillRect(0, 0, size, size);\n\
    canvas.scale(1, -1);\n\
    canvas.translate(0, -size);\n\
\n\
    if (!canvas.setFillColor)\n\
        canvas.setFillColor = function(r, g, b, a) {\n\
            this.fillStyle = "rgb("+[Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)]+")";\n\
    }\n\
\n\
for (var y = 0; y < size; y++) {\n\
  for (var x = 0; x < size; x++) {\n\
    var l = pixels[y][x];\n\
    canvas.setFillColor(l[0], l[1], l[2], 1);\n\
    canvas.fillRect(x, y, 1, 1);\n\
  }\n\
}</scr' + 'ipt>';

    return s;
}

testOutput = arrayToCanvasCommands(raytraceScene());
expected = '<canvas id="renderCanvas" width="30px" height="30px"></canvas><script>\nvar pixels = [[[0,0.22646733835486615,0],[0,0.22917348499592718,0],[0,0.23178836719862694,0],[0,0.23429286876882874,0],[0,0.23666708243914814,0],[0,0.2388906159889881,0],[0,0.3260187640505792,0],[0,0.33121005205394954,0],[0,0.3363076586511704,0],[0,0.3412818000213254,0],[0,0.34610095331648705,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.369829536245317,0],[0,0.3725822614817006,0],[0,0.37489560357280544,0],[0,0.37673658797290227,0],[0,0.3780753374916205,0],[0,0.378886188721004,0],[0,0.3791488586269958,0],[0,0.3788495731470844,0],[0,0.3779820527845238,0],[0,0.37654824729910663,0],[0,0.4585834760044105,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],],[[0.8,0.8,1],[0,0.22925665044954321,0],[0,0.2320573979410493,0],[0,0.23474822091583247,0],[0,0.2373069549209832,0],[0,0.2397107002896524,0],[0,0.15436982463108695,0],[0,0.15568628300351414,0],[0,0.33780762567168454,0],[0,0.3431766295062631,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.24744701364085558,0.14604872013179526,0.14604872013179526],[0,0.3743786742105677,0],[0,0.37742123153478285,0],[0,0.3799794006700716,0],[0,0.38201209682126785,0],[0,0.38348180518082586,0],[0,0.384356168843629,0],[0,0.3846096564538848,0],[0,0.3842251672467923,0],[0,0.3831954061706588,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],],[[0.8,0.8,1],[0.8,0.8,1],[0,0.23215413887706876,0],[0,0.2350440502458203,0],[0,0.23780113739316563,0],[0,0.24039973450409946,0],[0,0.24281359296637,0],[0,0.15528082901621987,0],[0,0.15653052853852803,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.24335890550700673,0.1442966737887172,0.1442966737887172],[0.21191595684264103,0.13082112436113186,0.13082112436113186],[0.27664813175852776,0.2248217713585563,0.2248217713585563],[0,0.3823836235518836,0],[0,0.3852234408034573,0],[0,0.38747642030616,0],[0,0.3890951276817348,0],[0,0.39003853152190077,0],[0,0.39027440447223904,0],[0,0.3897816153712006,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],],[[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.23811367607569112,0],[0,0.240922314629212,0],[0,0.2435404294800615,0],[0,0.24593811382698388,0],[0,0.1559883317159253,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.233189785862315,0.13993847965527784,0.13993847965527784],[0.2095470195339134,0.1298058655145343,0.1298058655145343],[0.06999999999999999,0.06999999999999999,0.06999999999999999],[0.2414541261336147,0.19927150247084813,0.19927150247084813],[0.30463716829842996,0.25698429422662805,0.25698429422662805],[0,0.39057010876231657,0],[0,0.39307456071571556,0],[0,0.394860705064173,0],[0,0.3958762994996104,0],[0,0.3960806578453934,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],],[[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.24123643784061885,0],[0,0.24407545031211067,0],[0,0.24668523203085055,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.20428988349740462,0.1275528072131734,0.1275528072131734],[0.06999999999999999,0.06999999999999999,0.06999999999999999],[0.06999999999999999,0.06999999999999999,0.06999999999999999],[0.06999999999999999,0.06999999999999999,0.06999999999999999],[0.2553534506258493,0.21540752629099336,0.21540752629099336],[0.8,0.8,1],[0,0.39871352471166227,0],[0,0.40068391900131317,0],[0,0.4017699848209471,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],],[[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.06999999999999999,0.06999999999999999,0.06999999999999999],[0.06999999999999999,0.06999999999999999,0.06999999999999999],[0.06999999999999999,0.06999999999999999,0.06999999999999999],[0.06999999999999999,0.06999999999999999,0.06999999999999999],[0.06999999999999999,0.06999999999999999,0.06999999999999999],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],],[[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.24436322334505386,0],[0,0.24745253188899904,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.06999999999999999,0.06999999999999999,0.06999999999999999],[0.06999999999999999,0.06999999999999999,0.06999999999999999],[0.06999999999999999,0.06999999999999999,0.06999999999999999],[0.06999999999999999,0.06999999999999999,0.06999999999999999],[0.06999999999999999,0.06999999999999999,0.06999999999999999],[0.06999999999999999,0.06999999999999999,0.06999999999999999],[0.06999999999999999,0.06999999999999999,0.06999999999999999],[0,0.40943101981787544,0],[0,0.41179341435345673,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],],[[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.24398601063610253,0],[0,0.24734388131046534,0],[0,0.2504039497369661,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.06999999999999999,0.06999999999999999,0.06999999999999999],[0.06999999999999999,0.06999999999999999,0.06999999999999999],[0.06999999999999999,0.06999999999999999,0.06999999999999999],[0.8,0.8,1],[0,0.41015054936419404,0],[0,0.4139256751539831,0],[0,0.5176011801301246,0],[0,0.5175400296826781,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],],[[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.23925831942915582,0],[0,0.2431514340750372,0],[0,0.24679679895694717,0],[0,0.25013656179204347,0],[0,0.25311244537612027,0],[0,0.2556680399787405,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.06999999999999999,0.06999999999999999,0.06999999999999999],[0.8,0.8,1],[0,0.4078259849771481,0],[0,0.4131357292874544,0],[0,0.5218814714518779,0],[0,0.5233124012306586,0],[0,0.522962771547786,0],[0,0.5207522057325761,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.47311372545546515,0],[0,0.4614041416827006,0],],[[0,0.21490764011046362,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.2331842261176049,0],[0,0.23755980367223836,0],[0,0.24175353358196602,0],[0,0.24570333061205787,0],[0,0.24934343472275186,0],[0,0.252606535195386,0],[0,0.25542647135913205,0],[0,0.25774138056580276,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.04000000000000001,0],[0,0.2913399551219817,0],[0,0.40821549181429595,0],[0,0.5226526471916983,0],[0,0.5257809891986108,0],[0,0.5270304637173788,0],[0,0.5262436797403963,0],[0,0.5233412343635394,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.48095949311801045,0],[0,0.46869626187306984,0],[0,0.4558873544509206,0],],[[0,0.21129537920439745,0],[0,0.2160838834157171,0],[0,0.22090682198375836,0],[0.8,0.8,1],[0,0.23049540839949767,0],[0,0.23516114626695328,0],[0,0.23966144813312718,0],[0,0.24392754707957162,0],[0,0.24788516106908107,0],[0,0.25145680804980497,0],[0,0.2545649373510444,0],[0,0.2571357591990073,0],[0,0.2591035093142245,0],[0,0.15255606913369724,0],[0,0.15301134862115395,0],[0.19736821241316202,0.12458637674849803,0.12458637674849803],[0,0.40504494009802183,0],[0,0.4123372862951718,0],[0,0.4183003766375901,0],[0,0.5268338036458257,0],[0,0.5277169309488912,0],[0,0.5263102439245335,0],[0,0.5225497158196737,0],[0,0.5164937589802646,0],[0.8,0.8,1],[0,0.49832248210805585,0],[0,0.4868414893043067,0],[0,0.47425805574715646,0],[0,0.46093994347307254,0],[0,0.4472184699099014,0],],[[0,0.20695133260602822,0],[0,0.21189973891969208,0],[0,0.21691233850171843,0],[0.8,0.8,1],[0.8,0.8,1],[0,0.23191357418198488,0],[0,0.23671451069678634,0],[0,0.24129830018648707,0],[0,0.24558190818576656,0],[0,0.24947677854650704,0],[0,0.2528923625850763,0],[0,0.1528305739035691,0],[0,0.1542326299051252,0],[0.8,0.8,1],[0.19785925315493239,0.12479682278068532,0.12479682278068532],[0.2081375194488818,0.12920179404952076,0.12920179404952076],[0.2240887656214228,0.18514359742568504,0.18514359742568504],[0,0.4135020430625767,0],[0,0.4192949763868133,0],[0,0.42324582463394744,0],[0,0.524175088930771,0],[0,0.5219574826556216,0],[0,0.5172050501700545,0],[0.8,0.8,1],[0.8,0.8,1],[0,0.4895533585416516,0],[0,0.4770140400123619,0],[0,0.4635030619052592,0],[0,0.44941365075166806,0],[0,0.43508467272477774,0],],[[0,0.20179362237895174,0],[0,0.20685458951965674,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.23760464753632676,0],[0,0.24220528986272394,0],[0,0.2464227921634767,0],[0,0.2501524694953926,0],[0,0.15461153696054686,0],[0.18550977568907606,0.11950418958103261,0.11950418958103261],[0.1973204644052136,0.12456591331652012,0.12456591331652012],[0.2088287796802108,0.12949804843437607,0.12949804843437607],[0.21976471724250635,0.134184878818217,0.134184878818217],[0.23568458491329167,0.19345433251780333,0.19345433251780333],[0.23236149715622312,0.19397984285078584,0.19397984285078584],[0.22707008733584053,0.19247800386744748,0.19247800386744748],[0,0.41921793505330557,0],[0,0.42018199893505187,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.4624620672233052,0],[0,0.4484080186022647,0],[0,0.43394937018864516,0],[0,0.4194117002954933,0],],[[0,0.195751560483372,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.4179362030887152,0],[0.8,0.8,1],[0.18284994643317204,0.11836426275707375,0.11836426275707375],[0.19559717882822145,0.12382736235495205,0.12382736235495205],[0.20829587479733996,0.1292696606274314,0.1292696606274314],[0.22064479825066774,0.13456205639314334,0.13456205639314334],[0.2323223325492669,0.13956671394968584,0.13956671394968584],[0.24724443467900797,0.20148878770701636,0.20148878770701636],[0.24548491352821342,0.20390487818440434,0.20390487818440434],[0.24239083545814452,0.20490715724849212,0.20490715724849212],[0.23580267356471662,0.2022853173521094,0.2022853173521094],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.42907468966717865,0],[0,0.4147140942539032,0],[0.8,0.8,1],],[[0.8,0.8,1],[0,0.19385093619429258,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.40369350610660937,0],[0,0.4158360873491173,0],[0.19261301561109398,0.12254843526189743,0.12254843526189743],[0.20636000368544563,0.1284400015794767,0.1284400015794767],[0.22006309132254379,0.13431275342394736,0.13431275342394736],[0.23336548922639505,0.14001378109702645,0.14001378109702645],[0.24588206119264946,0.1453780262254212,0.1453780262254212],[0.2585904923823373,0.20905557193769056,0.20905557193769056],[0.2583880059856603,0.21340384806404408,0.21340384806404408],[0.2579257731612357,0.21738553706566144,0.21738553706566144],[0.25469196497831764,0.21843261169087974,0.21843261169087974],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.4196956387047621,0],[0,0.40600233966188104,0],[0.8,0.8,1],[0.8,0.8,1],],[[0,0.18086678377768206,0],[0,0.29820732165845826,0],[0,0.3078671511008362,0],[0,0.31797632104786633,0],[0,0.3285185113204014,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.3740646417282967,0],[0,0.38583856211873363,0],[0,0.39747405235976174,0],[0.2029477686069114,0.12697761511724776,0.12697761511724776],[0.21781735307317274,0.1333502941742169,0.1333502941742169],[0.2326566051026994,0.13970997361544257,0.13970997361544257],[0.2470420370437997,0.145875158733057,0.145875158733057],[0.9125534455486627,0.5106731929990184,0.5106731929990184],[0.26957187383368114,0.21599310805975738,0.21599310805975738],[0.2707166126603939,0.2221190287629908,0.2221190287629908],[0.2730659500911373,0.22930539474084957,0.22930539474084957],[0.27432898752113144,0.23520013372187343,0.23520013372187343],[0,0.370913970040732,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.41728826192115065,0],[0,0.4053708259838642,0],[0,0.39282677897301016,0],[0,0.37998757881530154,0],[0,0.3671261088322657,0],[0.8,0.8,1],],[[0,0.2734507658091365,0],[0,0.28211354268150884,0],[0,0.29120495530846624,0],[0,0.3007197072254542,0],[0,0.31064069882287787,0],[0,0.32093517914620384,0],[0,0.3315502317284035,0],[0,0.34240777559380986,0],[0,0.35339949423457706,0],[0,0.3643824114196257,0],[0,0.3751761555363945,0],[0.21384735597314658,0.13164886684563426,0.13164886684563426],[0.2299739346154931,0.1385602576923542,0.1385602576923542],[0.24609657496992726,0.1454699607013974,0.1454699607013974],[0.9085781768104235,0.508698320758555,0.508698320758555],[0.9154549906081679,0.5170357163338555,0.5170357163338555],[0.9205088622142807,0.5252164494222175,0.5252164494222175],[0.28215745535360465,0.22973861951523428,0.22973861951523428],[0.2871003088909314,0.23996159648606105,0.23996159648606105],[0.29363706106359355,0.2515193872815144,0.2515193872815144],[0,0.41902122210815307,0],[0,0.41310298499553366,0],[0,0.40544274823125576,0],[0,0.396335311262737,0],[0,0.3861118369914827,0],[0,0.37510764377615097,0],[0,0.3636351145776063,0],[0,0.35196551120236436,0],[0,0.3403202703614798,0],[0,0.32887008288221503,0],],[[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.28175542273932297,0],[0,0.29085225965171946,0],[0,0.3002718747152153,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.3493460616221397,0],[0.22528651843925174,0.1365513650453936,0.1365513650453936],[0.884020287542635,0.49068080880618953,0.49068080880618953],[0.8974534722142382,0.5016001274737849,0.5016001274737849],[0.9089511260291274,0.5124192313516149,0.5124192313516149],[0.918724776273931,0.5233733004162796,0.5233733004162796],[0.9271769325614658,0.5348099989058438,0.5348099989058438],[0.9348913571357613,0.5471866228466732,0.5471866228466732],[0.9425953513779031,0.5610467455399599,0.5610467455399599],[0.31111289810529186,0.2659003418574735,0.2659003418574735],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.36238100335464446,0],[0,0.353165370752559,0],[0,0.3433460721377995,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],],[[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.269553510147819,0],[0,0.2779247384646558,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.862863795871991,0.4769708653359615,0.4769708653359615],[0.8809280461363547,0.48977541774660666,0.48977541774660666],[0.8970168973464191,0.5025218831442017,0.5025218831442017],[0.911183718592768,0.5154210174684783,0.5154210174684783],[0.923749369873305,0.5288572912288372,0.5288572912288372],[0.9353543113230034,0.5434323975814477,0.5434323975814477],[0.9469976115499875,0.5600089248350288,0.5600089248350288],[0.9600573266066551,0.5797476044207045,0.5797476044207045],[0.976264515309917,0.6041064704498702,0.6041064704498702],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.31964250752889856,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],],[[0,0.22050019052313752,0],[0,0.22681553981028935,0],[0,0.23339203717763343,0],[0,0.240214496679792,0],[0,0.24725746972595297,0],[0,0.25448250911433834,0],[0,0.26183515020613984,0],[0,0.26924183890499,0],[0,0.27660721846944913,0],[0,0.2838124066288337,0],[0,0.290715098224911,0],[0,0.2971524154784058,0],[0,0.3029472623689724,0],[0,0.3079184123129743,0],[0.9166547694971252,0.5166323224598249,0.5166323224598249],[0.9306991201883348,0.5311982918579957,0.5311982918579957],[0.942986803591991,0.5467760342781277,0.5467760342781277],[0,0.3165578521241011,0],[0,0.31548839579667104,0],[0,0.3131368632708015,0],[0.8,0.8,1],[0,0.30500137342777356,0],[0,0.29951030523776406,0],[0,0.29329773299429385,0],[0,0.28653936257609475,0],[0,0.27940222592749825,0],[0.8,0.8,1],[0,0.26457440761040923,0],[0,0.2571216942588568,0],[0,0.24976474642245705,0],],[[0.8,0.8,1],[0,0.20714814874471174,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.23670584867979186,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.2653456430194066,0],[0,0.2698801253354915,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.2797697633705014,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.2652596644585568,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.23044738434960232,0],[0.8,0.8,1],],[[0.8,0.8,1],[0,0.1874620478256095,0],[0,0.19215316230371715,0],[0,0.19696169224108015,0],[0,0.20186087426658073,0],[0,0.20681514030842463,0],[0,0.2117788084075138,0],[0,0.21669500719585458,0],[0,0.22149508562026893,0],[0,0.22609882383824634,0],[0,0.23041578943560334,0],[0,0.23434813805418903,0],[0,0.23779500435424242,0],[0,0.240658357082728,0],[0.8,0.8,1],[0,0.24429776275232565,0],[0,0.24495325891611666,0],[0,0.24479455500778916,0],[0,0.24382873003864916,0],[0.8,0.8,1],[0,0.23963973129383997,0],[0,0.23655408649128906,0],[0,0.23292473874860314,0],[0,0.2288489260033022,0],[0.8,0.8,1],[0,0.21974417921637143,0],[0,0.21489400490094954,0],[0,0.20994923454342304,0],[0,0.20497430079270745,0],[0.8,0.8,1],],[[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.1797204574749079,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.19516287408734248,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.2074862652007326,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.20573701126457444,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.19259287153244908,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.17697513874785395,0],],[[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.1614935034375082,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.17936757268974335,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.17026872079690972,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],],[[0,0.12879641411423945,0],[0.8,0.8,1],[0.8,0.8,1],[0,0.1358377385211167,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.1546643297719027,0],[0.8,0.8,1],[0.8,0.8,1],[0,0.1559650385862031,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.14211514071040432,0],[0.8,0.8,1],[0.8,0.8,1],[0,0.13513052327523242,0],],[[0,0.11212384156112787,0],[0.8,0.8,1],[0,0.11564325792725064,0],[0,0.1174011949544484,0],[0.8,0.8,1],[0,0.12084571295779206,0],[0,0.12249918688067803,0],[0,0.1240816293005488,0],[0,0.12557222890553357,0],[0.8,0.8,1],[0,0.12819024296879525,0],[0,0.12927368617900967,0],[0.8,0.8,1],[0,0.13088813449481448,0],[0,0.13138603838942955,0],[0.8,0.8,1],[0,0.13170953912018962,0],[0.8,0.8,1],[0,0.13112114069722186,0],[0,0.13049815823500216,0],[0.8,0.8,1],[0,0.12866048872503766,0],[0,0.1274822855623644,0],[0.8,0.8,1],[0,0.1247126669400825,0],[0,0.12316534788101306,0],[0,0.12153830315457151,0],[0,0.11985151859147432,0],[0.8,0.8,1],[0,0.11637011656642021,0],],[[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.104782462250846,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.1094376687357348,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],],[[0.8,0.8,1],[0.8,0.8,1],[0,0.0830756783895465,0],[0.8,0.8,1],[0,0.08474229354589341,0],[0.8,0.8,1],[0.8,0.8,1],[0,0.08702004690763979,0],[0.8,0.8,1],[0,0.08829471061229066,0],[0.8,0.8,1],[0.8,0.8,1],[0,0.0896722795161435,0],[0.8,0.8,1],[0,0.0901512080809384,0],[0.8,0.8,1],[0.8,0.8,1],[0,0.09012955842093213,0],[0.8,0.8,1],[0,0.08962319641070081,0],[0.8,0.8,1],[0.8,0.8,1],[0,0.08821080590025861,0],[0.8,0.8,1],[0,0.08691857775431859,0],[0.8,0.8,1],[0.8,0.8,1],[0,0.08462346811430875,0],[0.8,0.8,1],[0,0.08295071578903558,0],],[[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.06935458357760912,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.07223735845162484,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0,0.07191875490542338,0],[0,0.07163456254931609,0],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],],[[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],[0.8,0.8,1],],];\n    var canvas = document.getElementById("renderCanvas").getContext("2d");\n\n\n    var size = 30;\n    canvas.fillStyle = "red";\n    canvas.fillRect(0, 0, size, size);\n    canvas.scale(1, -1);\n    canvas.translate(0, -size);\n\n    if (!canvas.setFillColor)\n        canvas.setFillColor = function(r, g, b, a) {\n            this.fillStyle = "rgb("+[Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)]+")";\n    }\n\nfor (var y = 0; y < size; y++) {\n  for (var x = 0; x < size; x++) {\n    var l = pixels[y][x];\n    canvas.setFillColor(l[0], l[1], l[2], 1);\n    canvas.fillRect(x, y, 1, 1);\n  }\n}</script>';
assertEq(testOutput, expected)
