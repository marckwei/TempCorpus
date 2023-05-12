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

// The Computer Language Shootout
// http://shootout.alioth.debian.org/
//
// contributed by Jesse Millikan
// Base on the Ruby version by jose fco. gonzalez

var l;
var dnaInput = ">ONE Homo sapiens alu\n\
GGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGA\n\
TCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACT\n\
AAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAG\n\
GCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCG\n\
CCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGT\n\
GGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCA\n\
GGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAA\n\
TTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAG\n\
AATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCA\n\
GCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGT\n\
AATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACC\n\
AGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTG\n\
GTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACC\n\
CGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAG\n\
AGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTT\n\
TGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACA\n\
TGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCT\n\
GTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGG\n\
TTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGT\n\
CTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGG\n\
CGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCG\n\
TCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTA\n\
CTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCG\n\
AGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCG\n\
GGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACC\n\
TGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAA\n\
TACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGA\n\
GGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACT\n\
GCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTC\n\
ACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGT\n\
TCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGC\n\
CGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCG\n\
CTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTG\n\
GGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCC\n\
CAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCT\n\
GGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGC\n\
GCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGA\n\
GGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGA\n\
GACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGA\n\
GGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTG\n\
AAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAAT\n\
CCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCA\n\
GTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAA\n\
AAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGC\n\
GGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCT\n\
ACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGG\n\
GAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATC\n\
GCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGC\n\
GGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGG\n\
TCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAA\n\
AAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAG\n\
GAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACT\n\
CCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCC\n\
TGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAG\n\
ACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGC\n\
GTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGA\n\
ACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGA\n\
CAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCA\n\
CTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCA\n\
ACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCG\n\
CCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGG\n\
AGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTC\n\
CGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCG\n\
AGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACC\n\
CCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAG\n\
CTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAG\n\
CCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGG\n\
CCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATC\n\
ACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAA\n\
AAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGC\n\
TGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCC\n\
ACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGG\n\
CTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGG\n\
AGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATT\n\
AGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAA\n\
TCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGC\n\
CTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAA\n\
TCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAG\n\
CCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGT\n\
GGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCG\n\
GGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAG\n\
CGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTG\n\
GGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATG\n\
GTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGT\n\
AATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTT\n\
GCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCT\n\
CAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCG\n\
GGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTC\n\
TCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACT\n\
CGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAG\n\
ATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGG\n\
CGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTG\n\
AGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATA\n\
CAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGG\n\
CAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGC\n\
ACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCAC\n\
GCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTC\n\
GAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCG\n\
GGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCT\n\
TGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGG\n\
CGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCA\n\
GCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGG\n\
CCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGC\n\
GCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGG\n\
CGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGA\n\
CTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGG\n\
CCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAA\n\
ACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCC\n\
CAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGT\n\
GAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAA\n\
AGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGG\n\
ATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTAC\n\
TAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGA\n\
GGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGC\n\
GCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGG\n\
TGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTC\n\
AGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAA\n\
ATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGA\n\
GAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCC\n\
AGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTG\n\
TAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGAC\n\
CAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGT\n\
GGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAAC\n\
CCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACA\n\
GAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACT\n\
TTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAAC\n\
ATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCC\n\
TGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAG\n\
GTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCG\n\
TCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAG\n\
GCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCC\n\
GTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCT\n\
ACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCC\n\
GAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCC\n\
GGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCAC\n\
CTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAA\n\
ATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTG\n\
AGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCAC\n\
TGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCT\n\
CACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAG\n\
TTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAG\n\
CCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATC\n\
GCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCT\n\
GGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATC\n\
CCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCC\n\
TGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGG\n\
CGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGG\n\
AGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCG\n\
AGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGG\n\
AGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGT\n\
GAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAA\n\
TCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGC\n\
AGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCA\n\
AAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGG\n\
CGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTC\n\
TACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCG\n\
GGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGAT\n\
CGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCG\n\
CGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAG\n\
GTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACA\n\
AAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCA\n\
GGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCAC\n\
TCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGC\n\
CTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGA\n\
GACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGG\n\
CGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTG\n\
AACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCG\n\
ACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGC\n\
ACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCC\n\
AACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGC\n\
GCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCG\n\
GAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACT\n\
CCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCC\n\
GAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAAC\n\
CCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCA\n\
GCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGA\n\
GCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAG\n\
GCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGAT\n\
CACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTA\n\
AAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGG\n\
CTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGC\n\
CACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTG\n\
GCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAG\n\
GAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAAT\n\
TAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGA\n\
ATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAG\n\
CCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTA\n\
ATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCA\n\
GCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGG\n\
TGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCC\n\
GGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGA\n\
GCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTT\n\
GGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACAT\n\
GGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTG\n\
TAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGT\n\
TGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTC\n\
TCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGC\n\
GGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGT\n\
CTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTAC\n\
TCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGA\n\
GATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGG\n\
GCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCT\n\
GAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAAT\n\
ACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAG\n\
GCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTG\n\
CACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCA\n\
CGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTT\n\
CGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCC\n\
GGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGC\n\
TTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGG\n\
GCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCC\n\
AGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTG\n\
GCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCG\n\
CGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAG\n\
GCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAG\n\
ACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAG\n\
GCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGA\n\
AACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATC\n\
CCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAG\n\
TGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAA\n\
AAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCG\n\
GATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTA\n\
CTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGG\n\
AGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCG\n\
CGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCG\n\
GTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGT\n\
CAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAA\n\
AATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGG\n\
AGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTC\n\
CAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCT\n\
GTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGA\n\
CCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCG\n\
TGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAA\n\
CCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGAC\n\
AGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCAC\n\
TTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAA\n\
CATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGC\n\
CTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGA\n\
GGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCC\n\
GTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGA\n\
GGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCC\n\
CGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGC\n\
TACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGC\n\
CGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGC\n\
CGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCA\n\
CCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAA\n\
AATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCT\n\
GAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCA\n\
CTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGC\n\
TCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGA\n\
GTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTA\n\
GCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAAT\n\
CGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCC\n\
TGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAAT\n\
CCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGC\n\
CTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTG\n\
GCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGG\n\
GAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGC\n\
GAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGG\n\
GAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGG\n\
TGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTA\n\
ATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTG\n\
CAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTC\n\
AAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGG\n\
GCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCT\n\
CTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTC\n\
GGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGA\n\
TCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGC\n\
GCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGA\n\
GGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATAC\n\
AAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGC\n\
AGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCA\n\
CTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACG\n\
CCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCG\n\
AGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGG\n\
GCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTT\n\
GAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGC\n\
GACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAG\n\
CACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGC\n\
CAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCG\n\
CGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGC\n\
GGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGAC\n\
TCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGC\n\
CGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAA\n\
CCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCC\n\
AGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTG\n\
AGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAA\n\
GGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGA\n\
TCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACT\n\
AAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAG\n\
GCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCG\n\
CCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGT\n\
GGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCA\n\
GGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAA\n\
TTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAG\n\
AATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCA\n\
GCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGT\n\
AATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACC\n\
AGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTG\n\
GTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACC\n\
CGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAG\n\
AGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTT\n\
TGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACA\n\
TGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCT\n\
GTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGG\n\
TTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGT\n\
CTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGG\n\
CGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCG\n\
TCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTA\n\
CTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCG\n\
AGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCG\n\
GGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACC\n\
TGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAA\n\
TACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGA\n\
GGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACT\n\
GCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTC\n\
ACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGT\n\
TCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGC\n\
CGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCG\n\
CTTGAACCCGGGAGGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTG\n\
GGCGACAGAGCGAGACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCC\n\
CAGCACTTTGGGAGGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCT\n\
GGCCAACATGGTGAAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGC\n\
GCGCGCCTGTAATCCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGA\n\
GGCGGAGGTTGCAGTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGA\n\
GACTCCGTCTCAAAAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGA\n\
GGCCGAGGCGGGCGGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTG\n\
AAACCCCGTCTCTACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAAT\n\
CCCAGCTACTCGGGAGGCTGAGGCAGGAGAATCGCTTGAACCCGGGAGGCGGAGGTTGCA\n\
GTGAGCCGAGATCGCGCCACTGCACTCCAGCCTGGGCGACAGAGCGAGACTCCGTCTCAA\n\
AAAGGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGGCGGGC\n\
GGATCACCTGAGGTCAGGAGTTCGAGACCAGCCTGGCCAACATGGTGAAACCCCGTCTCT\n\
ACTAAAAATACAAAAATTAGCCGGGCGTGGTGGCGCGCGCCTGTAATCCCAGCTACTCGG\n\
GAGGCTGAGGCAGGAGAATC\n\
>TWO IUB ambiguity codes\n\
cttBtatcatatgctaKggNcataaaSatgtaaaDcDRtBggDtctttataattcBgtcg\n\
tactDtDagcctatttSVHtHttKtgtHMaSattgWaHKHttttagacatWatgtRgaaa\n\
NtactMcSMtYtcMgRtacttctWBacgaaatatagScDtttgaagacacatagtVgYgt\n\
cattHWtMMWcStgttaggKtSgaYaaccWStcgBttgcgaMttBYatcWtgacaYcaga\n\
gtaBDtRacttttcWatMttDBcatWtatcttactaBgaYtcttgttttttttYaaScYa\n\
HgtgttNtSatcMtcVaaaStccRcctDaataataStcYtRDSaMtDttgttSagtRRca\n\
tttHatSttMtWgtcgtatSSagactYaaattcaMtWatttaSgYttaRgKaRtccactt\n\
tattRggaMcDaWaWagttttgacatgttctacaaaRaatataataaMttcgDacgaSSt\n\
acaStYRctVaNMtMgtaggcKatcttttattaaaaagVWaHKYagtttttatttaacct\n\
tacgtVtcVaattVMBcttaMtttaStgacttagattWWacVtgWYagWVRctDattBYt\n\
gtttaagaagattattgacVatMaacattVctgtBSgaVtgWWggaKHaatKWcBScSWa\n\
accRVacacaaactaccScattRatatKVtactatatttHttaagtttSKtRtacaaagt\n\
RDttcaaaaWgcacatWaDgtDKacgaacaattacaRNWaatHtttStgttattaaMtgt\n\
tgDcgtMgcatBtgcttcgcgaDWgagctgcgaggggVtaaScNatttacttaatgacag\n\
cccccacatYScaMgtaggtYaNgttctgaMaacNaMRaacaaacaKctacatagYWctg\n\
ttWaaataaaataRattagHacacaagcgKatacBttRttaagtatttccgatctHSaat\n\
actcNttMaagtattMtgRtgaMgcataatHcMtaBSaRattagttgatHtMttaaKagg\n\
YtaaBataSaVatactWtataVWgKgttaaaacagtgcgRatatacatVtHRtVYataSa\n\
KtWaStVcNKHKttactatccctcatgWHatWaRcttactaggatctataDtDHBttata\n\
aaaHgtacVtagaYttYaKcctattcttcttaataNDaaggaaaDYgcggctaaWSctBa\n\
aNtgctggMBaKctaMVKagBaactaWaDaMaccYVtNtaHtVWtKgRtcaaNtYaNacg\n\
gtttNattgVtttctgtBaWgtaattcaagtcaVWtactNggattctttaYtaaagccgc\n\
tcttagHVggaYtgtNcDaVagctctctKgacgtatagYcctRYHDtgBattDaaDgccK\n\
tcHaaStttMcctagtattgcRgWBaVatHaaaataYtgtttagMDMRtaataaggatMt\n\
ttctWgtNtgtgaaaaMaatatRtttMtDgHHtgtcattttcWattRSHcVagaagtacg\n\
ggtaKVattKYagactNaatgtttgKMMgYNtcccgSKttctaStatatNVataYHgtNa\n\
BKRgNacaactgatttcctttaNcgatttctctataScaHtataRagtcRVttacDSDtt\n\
aRtSatacHgtSKacYagttMHtWataggatgactNtatSaNctataVtttRNKtgRacc\n\
tttYtatgttactttttcctttaaacatacaHactMacacggtWataMtBVacRaSaatc\n\
cgtaBVttccagccBcttaRKtgtgcctttttRtgtcagcRttKtaaacKtaaatctcac\n\
aattgcaNtSBaaccgggttattaaBcKatDagttactcttcattVtttHaaggctKKga\n\
tacatcBggScagtVcacattttgaHaDSgHatRMaHWggtatatRgccDttcgtatcga\n\
aacaHtaagttaRatgaVacttagattVKtaaYttaaatcaNatccRttRRaMScNaaaD\n\
gttVHWgtcHaaHgacVaWtgttScactaagSgttatcttagggDtaccagWattWtRtg\n\
ttHWHacgattBtgVcaYatcggttgagKcWtKKcaVtgaYgWctgYggVctgtHgaNcV\n\
taBtWaaYatcDRaaRtSctgaHaYRttagatMatgcatttNattaDttaattgttctaa\n\
ccctcccctagaWBtttHtBccttagaVaatMcBHagaVcWcagBVttcBtaYMccagat\n\
gaaaaHctctaacgttagNWRtcggattNatcRaNHttcagtKttttgWatWttcSaNgg\n\
gaWtactKKMaacatKatacNattgctWtatctaVgagctatgtRaHtYcWcttagccaa\n\
tYttWttaWSSttaHcaaaaagVacVgtaVaRMgattaVcDactttcHHggHRtgNcctt\n\
tYatcatKgctcctctatVcaaaaKaaaagtatatctgMtWtaaaacaStttMtcgactt\n\
taSatcgDataaactaaacaagtaaVctaggaSccaatMVtaaSKNVattttgHccatca\n\
cBVctgcaVatVttRtactgtVcaattHgtaaattaaattttYtatattaaRSgYtgBag\n\
aHSBDgtagcacRHtYcBgtcacttacactaYcgctWtattgSHtSatcataaatataHt\n\
cgtYaaMNgBaatttaRgaMaatatttBtttaaaHHKaatctgatWatYaacttMctctt\n\
ttVctagctDaaagtaVaKaKRtaacBgtatccaaccactHHaagaagaaggaNaaatBW\n\
attccgStaMSaMatBttgcatgRSacgttVVtaaDMtcSgVatWcaSatcttttVatag\n\
ttactttacgatcaccNtaDVgSRcgVcgtgaacgaNtaNatatagtHtMgtHcMtagaa\n\
attBgtataRaaaacaYKgtRccYtatgaagtaataKgtaaMttgaaRVatgcagaKStc\n\
tHNaaatctBBtcttaYaBWHgtVtgacagcaRcataWctcaBcYacYgatDgtDHccta\n\
aagacYRcaggattHaYgtKtaatgcVcaataMYacccatatcacgWDBtgaatcBaata\n\
cKcttRaRtgatgaBDacggtaattaaYtataStgVHDtDctgactcaaatKtacaatgc\n\
gYatBtRaDatHaactgtttatatDttttaaaKVccYcaaccNcBcgHaaVcattHctcg\n\
attaaatBtatgcaaaaatYMctSactHatacgaWacattacMBgHttcgaatVaaaaca\n\
BatatVtctgaaaaWtctRacgBMaatSgRgtgtcgactatcRtattaScctaStagKga\n\
DcWgtYtDDWKRgRtHatRtggtcgaHgggcgtattaMgtcagccaBggWVcWctVaaat\n\
tcgNaatcKWagcNaHtgaaaSaaagctcYctttRVtaaaatNtataaccKtaRgtttaM\n\
tgtKaBtRtNaggaSattHatatWactcagtgtactaKctatttgRYYatKatgtccgtR\n\
tttttatttaatatVgKtttgtatgtNtataRatWYNgtRtHggtaaKaYtKSDcatcKg\n\
taaYatcSRctaVtSMWtVtRWHatttagataDtVggacagVcgKWagBgatBtaaagNc\n\
aRtagcataBggactaacacRctKgttaatcctHgDgttKHHagttgttaatgHBtatHc\n\
DaagtVaBaRccctVgtgDtacRHSctaagagcggWYaBtSaKtHBtaaactYacgNKBa\n\
VYgtaacttagtVttcttaatgtBtatMtMtttaattaatBWccatRtttcatagVgMMt\n\
agctStKctaMactacDNYgKYHgaWcgaHgagattacVgtttgtRaSttaWaVgataat\n\
gtgtYtaStattattMtNgWtgttKaccaatagNYttattcgtatHcWtctaaaNVYKKt\n\
tWtggcDtcgaagtNcagatacgcattaagaccWctgcagcttggNSgaNcHggatgtVt\n\
catNtRaaBNcHVagagaaBtaaSggDaatWaatRccaVgggStctDaacataKttKatt\n\
tggacYtattcSatcttagcaatgaVBMcttDattctYaaRgatgcattttNgVHtKcYR\n\
aatRKctgtaaacRatVSagctgtWacBtKVatctgttttKcgtctaaDcaagtatcSat\n\
aWVgcKKataWaYttcccSaatgaaaacccWgcRctWatNcWtBRttYaattataaNgac\n\
acaatagtttVNtataNaYtaatRaVWKtBatKagtaatataDaNaaaaataMtaagaaS\n\
tccBcaatNgaataWtHaNactgtcDtRcYaaVaaaaaDgtttRatctatgHtgttKtga\n\
aNSgatactttcgagWaaatctKaaDaRttgtggKKagcDgataaattgSaacWaVtaNM\n\
acKtcaDaaatttctRaaVcagNacaScRBatatctRatcctaNatWgRtcDcSaWSgtt\n\
RtKaRtMtKaatgttBHcYaaBtgatSgaSWaScMgatNtctcctatttctYtatMatMt\n\
RRtSaattaMtagaaaaStcgVgRttSVaScagtgDtttatcatcatacRcatatDctta\n\
tcatVRtttataaHtattcYtcaaaatactttgVctagtaaYttagatagtSYacKaaac\n\
gaaKtaaatagataatSatatgaaatSgKtaatVtttatcctgKHaatHattagaaccgt\n\
YaaHactRcggSBNgtgctaaBagBttgtRttaaattYtVRaaaattgtaatVatttctc\n\
ttcatgBcVgtgKgaHaaatattYatagWacNctgaaMcgaattStagWaSgtaaKagtt\n\
ttaagaDgatKcctgtaHtcatggKttVDatcaaggtYcgccagNgtgcVttttagagat\n\
gctaccacggggtNttttaSHaNtatNcctcatSaaVgtactgBHtagcaYggYVKNgta\n\
KBcRttgaWatgaatVtagtcgattYgatgtaatttacDacSctgctaaaStttaWMagD\n\
aaatcaVYctccgggcgaVtaaWtStaKMgDtttcaaMtVgBaatccagNaaatcYRMBg\n\
gttWtaaScKttMWtYataRaDBMaDataatHBcacDaaKDactaMgagttDattaHatH\n\
taYatDtattDcRNStgaatattSDttggtattaaNSYacttcDMgYgBatWtaMagact\n\
VWttctttgYMaYaacRgHWaattgRtaagcattctMKVStatactacHVtatgatcBtV\n\
NataaBttYtSttacKgggWgYDtgaVtYgatDaacattYgatggtRDaVDttNactaSa\n\
MtgNttaacaaSaBStcDctaccacagacgcaHatMataWKYtaYattMcaMtgSttDag\n\
cHacgatcaHttYaKHggagttccgatYcaatgatRaVRcaagatcagtatggScctata\n\
ttaNtagcgacgtgKaaWaactSgagtMYtcttccaKtStaacggMtaagNttattatcg\n\
tctaRcactctctDtaacWYtgaYaSaagaWtNtatttRacatgNaatgttattgWDDcN\n\
aHcctgaaHacSgaataaRaataMHttatMtgaSDSKatatHHaNtacagtccaYatWtc\n\
actaactatKDacSaStcggataHgYatagKtaatKagStaNgtatactatggRHacttg\n\
tattatgtDVagDVaRctacMYattDgtttYgtctatggtKaRSttRccRtaaccttaga\n\
gRatagSaaMaacgcaNtatgaaatcaRaagataatagatactcHaaYKBctccaagaRa\n\
BaStNagataggcgaatgaMtagaatgtcaKttaaatgtaWcaBttaatRcggtgNcaca\n\
aKtttScRtWtgcatagtttWYaagBttDKgcctttatMggNttattBtctagVtacata\n\
aaYttacacaaRttcYtWttgHcaYYtaMgBaBatctNgcDtNttacgacDcgataaSat\n\
YaSttWtcctatKaatgcagHaVaacgctgcatDtgttaSataaaaYSNttatagtaNYt\n\
aDaaaNtggggacttaBggcHgcgtNtaaMcctggtVtaKcgNacNtatVaSWctWtgaW\n\
cggNaBagctctgaYataMgaagatBSttctatacttgtgtKtaattttRagtDtacata\n\
tatatgatNHVgBMtKtaKaNttDHaagatactHaccHtcatttaaagttVaMcNgHata\n\
tKtaNtgYMccttatcaaNagctggacStttcNtggcaVtattactHaSttatgNMVatt\n\
MMDtMactattattgWMSgtHBttStStgatatRaDaagattttctatMtaaaaaggtac\n\
taaVttaSacNaatactgMttgacHaHRttgMacaaaatagttaatatWKRgacDgaRta\n\
tatttattatcYttaWtgtBRtWatgHaaattHataagtVaDtWaVaWtgStcgtMSgaS\n\
RgMKtaaataVacataatgtaSaatttagtcgaaHtaKaatgcacatcggRaggSKctDc\n\
agtcSttcccStYtccRtctctYtcaaKcgagtaMttttcRaYDttgttatctaatcata\n\
NctctgctatcaMatactataggDaHaaSttMtaDtcNatataattctMcStaaBYtaNa\n\
gatgtaatHagagSttgWHVcttatKaYgDctcttggtgttMcRaVgSgggtagacaata\n\
aDtaattSaDaNaHaBctattgNtaccaaRgaVtKNtaaYggHtaKKgHcatctWtctDt\n\
ttctttggSDtNtaStagttataaacaattgcaBaBWggHgcaaaBtYgctaatgaaatW\n\
cDcttHtcMtWWattBHatcatcaaatctKMagtDNatttWaBtHaaaNgMttaaStagt\n\
tctctaatDtcRVaYttgttMtRtgtcaSaaYVgSWDRtaatagctcagDgcWWaaaBaa\n\
RaBctgVgggNgDWStNaNBKcBctaaKtttDcttBaaggBttgaccatgaaaNgttttt\n\
tttatctatgttataccaaDRaaSagtaVtDtcaWatBtacattaWacttaSgtattggD\n\
gKaaatScaattacgWcagKHaaccaYcRcaRttaDttRtttHgaHVggcttBaRgtccc\n\
tDatKaVtKtcRgYtaKttacgtatBtStaagcaattaagaRgBagSaattccSWYttta\n\
ttVaataNctgHgttaaNBgcVYgtRtcccagWNaaaacaDNaBcaaaaRVtcWMgBagM\n\
tttattacgDacttBtactatcattggaaatVccggttRttcatagttVYcatYaSHaHc\n\
ttaaagcNWaHataaaRWtctVtRYtagHtaaaYMataHYtNBctNtKaatattStgaMc\n\
BtRgctaKtgcScSttDgYatcVtggaaKtaagatWccHccgKYctaNNctacaWctttt\n\
gcRtgtVcgaKttcMRHgctaHtVaataaDtatgKDcttatBtDttggNtacttttMtga\n\
acRattaaNagaactcaaaBBVtcDtcgaStaDctgaaaSgttMaDtcgttcaccaaaag\n\
gWtcKcgSMtcDtatgtttStaaBtatagDcatYatWtaaaBacaKgcaDatgRggaaYc\n\
taRtccagattDaWtttggacBaVcHtHtaacDacYgtaatataMagaatgHMatcttat\n\
acgtatttttatattacHactgttataMgStYaattYaccaattgagtcaaattaYtgta\n\
tcatgMcaDcgggtcttDtKgcatgWRtataatatRacacNRBttcHtBgcRttgtgcgt\n\
catacMtttBctatctBaatcattMttMYgattaaVYatgDaatVagtattDacaacDMa\n\
tcMtHcccataagatgBggaccattVWtRtSacatgctcaaggggYtttDtaaNgNtaaB\n\
atggaatgtctRtaBgBtcNYatatNRtagaacMgagSaSDDSaDcctRagtVWSHtVSR\n\
ggaacaBVaccgtttaStagaacaMtactccagtttVctaaRaaHttNcttagcaattta\n\
ttaatRtaaaatctaacDaBttggSagagctacHtaaRWgattcaaBtctRtSHaNtgta\n\
cattVcaHaNaagtataccacaWtaRtaaVKgMYaWgttaKggKMtKcgWatcaDatYtK\n\
SttgtacgaccNctSaattcDcatcttcaaaDKttacHtggttHggRRaRcaWacaMtBW\n\
VHSHgaaMcKattgtaRWttScNattBBatYtaNRgcggaagacHSaattRtttcYgacc\n\
BRccMacccKgatgaacttcgDgHcaaaaaRtatatDtatYVtttttHgSHaSaatagct\n\
NYtaHYaVYttattNtttgaaaYtaKttWtctaNtgagaaaNctNDctaaHgttagDcRt\n\
tatagccBaacgcaRBtRctRtggtaMYYttWtgataatcgaataattattataVaaaaa\n\
ttacNRVYcaaMacNatRttcKatMctgaagactaattataaYgcKcaSYaatMNctcaa\n\
cgtgatttttBacNtgatDccaattattKWWcattttatatatgatBcDtaaaagttgaa\n\
VtaHtaHHtBtataRBgtgDtaataMttRtDgDcttattNtggtctatctaaBcatctaR\n\
atgNacWtaatgaagtcMNaacNgHttatactaWgcNtaStaRgttaaHacccgaYStac\n\
aaaatWggaYaWgaattattcMaactcBKaaaRVNcaNRDcYcgaBctKaacaaaaaSgc\n\
tccYBBHYaVagaatagaaaacagYtctVccaMtcgtttVatcaatttDRtgWctagtac\n\
RttMctgtDctttcKtWttttataaatgVttgBKtgtKWDaWagMtaaagaaattDVtag\n\
gttacatcatttatgtcgMHaVcttaBtVRtcgtaYgBRHatttHgaBcKaYWaatcNSc\n\
tagtaaaaatttacaatcactSWacgtaatgKttWattagttttNaggtctcaagtcact\n\
attcttctaagKggaataMgtttcataagataaaaatagattatDgcBVHWgaBKttDgc\n\
atRHaagcaYcRaattattatgtMatatattgHDtcaDtcaaaHctStattaatHaccga\n\
cNattgatatattttgtgtDtRatagSacaMtcRtcattcccgacacSattgttKaWatt\n\
NHcaacttccgtttSRtgtctgDcgctcaaMagVtBctBMcMcWtgtaacgactctcttR\n\
ggRKSttgYtYatDccagttDgaKccacgVatWcataVaaagaataMgtgataaKYaaat\n\
cHDaacgataYctRtcYatcgcaMgtNttaBttttgatttaRtStgcaacaaaataccVg\n\
aaDgtVgDcStctatatttattaaaaRKDatagaaagaKaaYYcaYSgKStctccSttac\n\
agtcNactttDVttagaaagMHttRaNcSaRaMgBttattggtttaRMggatggcKDgWR\n\
tNaataataWKKacttcKWaaagNaBttaBatMHtccattaacttccccYtcBcYRtaga\n\
ttaagctaaYBDttaNtgaaaccHcaRMtKtaaHMcNBttaNaNcVcgVttWNtDaBatg\n\
ataaVtcWKcttRggWatcattgaRagHgaattNtatttctctattaattaatgaDaaMa\n\
tacgttgggcHaYVaaNaDDttHtcaaHtcVVDgBVagcMacgtgttaaBRNtatRtcag\n\
taagaggtttaagacaVaaggttaWatctccgtVtaDtcDatttccVatgtacNtttccg\n\
tHttatKgScBatgtVgHtYcWagcaKtaMYaaHgtaattaSaHcgcagtWNaatNccNN\n\
YcacgVaagaRacttctcattcccRtgtgtaattagcSttaaStWaMtctNNcSMacatt\n\
ataaactaDgtatWgtagtttaagaaaattgtagtNagtcaataaatttgatMMYactaa\n\
tatcggBWDtVcYttcDHtVttatacYaRgaMaacaStaatcRttttVtagaDtcacWat\n\
ttWtgaaaagaaagNRacDtttStVatBaDNtaactatatcBSMcccaSttccggaMatg\n\
attaaWatKMaBaBatttgataNctgttKtVaagtcagScgaaaDggaWgtgttttKtWt\n\
atttHaatgtagttcactaaKMagttSYBtKtaYgaactcagagRtatagtVtatcaaaW\n\
YagcgNtaDagtacNSaaYDgatBgtcgataacYDtaaactacagWDcYKaagtttatta\n\
gcatcgagttKcatDaattgattatDtcagRtWSKtcgNtMaaaaacaMttKcaWcaaSV\n\
MaaaccagMVtaMaDtMaHaBgaacataBBVtaatVYaNSWcSgNtDNaaKacacBttta\n\
tKtgtttcaaHaMctcagtaacgtcgYtactDcgcctaNgagagcYgatattttaaattt\n\
ccattttacatttDaaRctattttWctttacgtDatYtttcagacgcaaVttagtaaKaa\n\
aRtgVtccataBggacttatttgtttaWNtgttVWtaWNVDaattgtatttBaagcBtaa\n\
BttaaVatcHcaVgacattccNggtcgacKttaaaRtagRtctWagaYggtgMtataatM\n\
tgaaRttattttgWcttNtDRRgMDKacagaaaaggaaaRStcccagtYccVattaNaaK\n\
StNWtgacaVtagaagcttSaaDtcacaacgDYacWDYtgtttKatcVtgcMaDaSKStV\n\
cgtagaaWaKaagtttcHaHgMgMtctataagBtKaaaKKcactggagRRttaagaBaaN\n\
atVVcgRcKSttDaactagtSttSattgttgaaRYatggttVttaataaHttccaagDtg\n\
atNWtaagHtgcYtaactRgcaatgMgtgtRaatRaNaacHKtagactactggaatttcg\n\
ccataacgMctRgatgttaccctaHgtgWaYcactcacYaattcttaBtgacttaaacct\n\
gYgaWatgBttcttVttcgttWttMcNYgtaaaatctYgMgaaattacNgaHgaacDVVM\n\
tttggtHtctaaRgtacagacgHtVtaBMNBgattagcttaRcttacaHcRctgttcaaD\n\
BggttKaacatgKtttYataVaNattccgMcgcgtagtRaVVaattaKaatggttRgaMc\n\
agtatcWBttNtHagctaatctagaaNaaacaYBctatcgcVctBtgcaaagDgttVtga\n\
HtactSNYtaaNccatgtgDacgaVtDcgKaRtacDcttgctaagggcagMDagggtBWR\n\
tttSgccttttttaacgtcHctaVtVDtagatcaNMaVtcVacatHctDWNaataRgcgt\n\
aVHaggtaaaaSgtttMtattDgBtctgatSgtRagagYtctSaKWaataMgattRKtaa\n\
catttYcgtaacacattRWtBtcggtaaatMtaaacBatttctKagtcDtttgcBtKYYB\n\
aKttctVttgttaDtgattttcttccacttgSaaacggaaaNDaattcYNNaWcgaaYat\n\
tttMgcBtcatRtgtaaagatgaWtgaccaYBHgaatagataVVtHtttVgYBtMctaMt\n\
cctgaDcYttgtccaaaRNtacagcMctKaaaggatttacatgtttaaWSaYaKttBtag\n\
DacactagctMtttNaKtctttcNcSattNacttggaacaatDagtattRtgSHaataat\n\
gccVgacccgatactatccctgtRctttgagaSgatcatatcgDcagWaaHSgctYYWta\n\
tHttggttctttatVattatcgactaagtgtagcatVgtgHMtttgtttcgttaKattcM\n\
atttgtttWcaaStNatgtHcaaaDtaagBaKBtRgaBgDtSagtatMtaacYaatYtVc\n\
KatgtgcaacVaaaatactKcRgtaYtgtNgBBNcKtcttaccttKgaRaYcaNKtactt\n\
tgagSBtgtRagaNgcaaaNcacagtVtttHWatgttaNatBgtttaatNgVtctgaata\n\
tcaRtattcttttttttRaaKcRStctcggDgKagattaMaaaKtcaHacttaataataK\n\
taRgDtKVBttttcgtKaggHHcatgttagHggttNctcgtatKKagVagRaaaggaaBt\n\
NatttVKcRttaHctaHtcaaatgtaggHccaBataNaNaggttgcWaatctgatYcaaa\n\
HaatWtaVgaaBttagtaagaKKtaaaKtRHatMaDBtBctagcatWtatttgWttVaaa\n\
ScMNattRactttgtYtttaaaagtaagtMtaMaSttMBtatgaBtttaKtgaatgagYg\n\
tNNacMtcNRacMMHcttWtgtRtctttaacaacattattcYaMagBaacYttMatcttK\n\
cRMtgMNccattaRttNatHaHNaSaaHMacacaVaatacaKaSttHatattMtVatWga\n\
ttttttaYctttKttHgScWaacgHtttcaVaaMgaacagNatcgttaacaaaaagtaca\n\
HBNaattgttKtcttVttaaBtctgctacgBgcWtttcaggacacatMgacatcccagcg\n\
gMgaVKaBattgacttaatgacacacaaaaaatRKaaBctacgtRaDcgtagcVBaacDS\n\
BHaaaaSacatatacagacRNatcttNaaVtaaaataHattagtaaaaSWccgtatWatg\n\
gDttaactattgcccatcttHaSgYataBttBaactattBtcHtgatcaataSttaBtat\n\
KSHYttWggtcYtttBttaataccRgVatStaHaKagaatNtagRMNgtcttYaaSaact\n\
cagDSgagaaYtMttDtMRVgWKWtgMaKtKaDttttgactatacataatcNtatNaHat\n\
tVagacgYgatatatttttgtStWaaatctWaMgagaRttRatacgStgattcttaagaD\n\
taWccaaatRcagcagaaNKagtaaDggcgccBtYtagSBMtactaaataMataBSacRM\n\
gDgattMMgtcHtcaYDtRaDaacggttDaggcMtttatgttaNctaattaVacgaaMMt\n\
aatDccSgtattgaRtWWaccaccgagtactMcgVNgctDctaMScatagcgtcaactat\n\
acRacgHRttgctatttaatgaattataYKttgtaagWgtYttgcHgMtaMattWaWVta\n\
RgcttgYgttBHtYataSccStBtgtagMgtDtggcVaaSBaatagDttgBgtctttctc\n\
attttaNagtHKtaMWcYactVcgcgtatMVtttRacVagDaatcttgctBBcRDgcaac\n\
KttgatSKtYtagBMagaRtcgBattHcBWcaactgatttaatttWDccatttatcgagS\n\
KaWttataHactaHMttaatHtggaHtHagaatgtKtaaRactgtttMatacgatcaagD\n\
gatKaDctataMggtHDtggHacctttRtatcttYattttgacttgaaSaataaatYcgB\n\
aaaaccgNatVBttMacHaKaataagtatKgtcaagactcttaHttcggaattgttDtct\n\
aaccHttttWaaatgaaatataaaWattccYDtKtaaaacggtgaggWVtctattagtga\n\
ctattaagtMgtttaagcatttgSgaaatatccHaaggMaaaattttcWtatKctagDtY\n\
tMcctagagHcactttactatacaaacattaacttaHatcVMYattYgVgtMttaaRtga\n\
aataaDatcaHgtHHatKcDYaatcttMtNcgatYatgSaMaNtcttKcWataScKggta\n\
tcttacgcttWaaagNatgMgHtctttNtaacVtgttcMaaRatccggggactcMtttaY\n\
MtcWRgNctgNccKatcttgYDcMgattNYaRagatHaaHgKctcataRDttacatBatc\n\
cattgDWttatttaWgtcggagaaaaatacaatacSNtgggtttccttacSMaagBatta\n\
caMaNcactMttatgaRBacYcYtcaaaWtagctSaacttWgDMHgaggatgBVgcHaDt\n\
ggaactttggtcNatNgtaKaBcccaNtaagttBaacagtatacDYttcctNgWgcgSMc\n\
acatStctHatgRcNcgtacacaatRttMggaNKKggataaaSaYcMVcMgtaMaHtgat\n\
tYMatYcggtcttcctHtcDccgtgRatcattgcgccgatatMaaYaataaYSggatagc\n\
gcBtNtaaaScaKgttBgagVagttaKagagtatVaactaSacWactSaKatWccaKaaa\n\
atBKgaaKtDMattttgtaaatcRctMatcaaMagMttDgVatggMaaWgttcgaWatga\n\
aatttgRtYtattaWHKcRgctacatKttctaccaaHttRatctaYattaaWatVNccat\n\
NgagtcKttKataStRaatatattcctRWatDctVagttYDgSBaatYgttttgtVaatt\n\
taatagcagMatRaacttBctattgtMagagattaaactaMatVtHtaaatctRgaaaaa\n\
aaatttWacaacaYccYDSaattMatgaccKtaBKWBattgtcaagcHKaagttMMtaat\n\
ttcKcMagNaaKagattggMagaggtaatttYacatcWaaDgatMgKHacMacgcVaaca\n\
DtaDatatYggttBcgtatgWgaSatttgtagaHYRVacaRtctHaaRtatgaactaata\n\
tctSSBgggaaHMWtcaagatKgagtDaSatagttgattVRatNtctMtcSaagaSHaat\n\
aNataataRaaRgattctttaataaagWaRHcYgcatgtWRcttgaaggaMcaataBRaa\n\
ccagStaaacNtttcaatataYtaatatgHaDgcStcWttaacctaRgtYaRtataKtgM\n\
ttttatgactaaaatttacYatcccRWtttHRtattaaatgtttatatttgttYaatMca\n\
RcSVaaDatcgtaYMcatgtagacatgaaattgRtcaaYaaYtRBatKacttataccaNa\n\
aattVaBtctggacaagKaaYaaatatWtMtatcYaaVNtcgHaactBaagKcHgtctac\n\
aatWtaDtSgtaHcataHtactgataNctRgttMtDcDttatHtcgtacatcccaggStt\n\
aBgtcacacWtccNMcNatMVaVgtccDYStatMaccDatggYaRKaaagataRatttHK\n\
tSaaatDgataaacttaHgttgVBtcttVttHgDacgaKatgtatatNYataactctSat\n\
atatattgcHRRYttStggaactHgttttYtttaWtatMcttttctatctDtagVHYgMR\n\
BgtHttcctaatYRttKtaagatggaVRataKDctaMtKBNtMtHNtWtttYcVtattMc\n\
gRaacMcctNSctcatttaaagDcaHtYccSgatgcaatYaaaaDcttcgtaWtaattct\n\
cgttttScttggtaatctttYgtctaactKataHacctMctcttacHtKataacacagcN\n\
RatgKatttttSaaatRYcgDttaMRcgaaattactMtgcgtaagcgttatBtttttaat\n\
taagtNacatHgttcRgacKcBBtVgatKttcgaBaatactDRgtRtgaNacWtcacYtt\n\
aaKcgttctHaKttaNaMgWgWaggtctRgaKgWttSttBtDcNtgtttacaaatYcDRt\n\
gVtgcctattcNtctaaaDMNttttNtggctgagaVctDaacVtWccaagtaacacaNct\n\
gaScattccDHcVBatcgatgtMtaatBgHaatDctMYgagaatgYWKcctaatNaStHa\n\
aaKccgHgcgtYaaYtattgtStgtgcaaRtattaKatattagaWVtcaMtBagttatta\n\
gNaWHcVgcaattttDcMtgtaRHVYtHtctgtaaaaHVtMKacatcgNaatttMatatg\n\
ttgttactagWYtaRacgataKagYNKcattataNaRtgaacKaYgcaaYYacaNccHat\n\
MatDcNgtHttRaWttagaaDcaaaaaatagggtKDtStaDaRtaVtHWKNtgtattVct\n\
SVgRgataDaRaWataBgaagaaKtaataaYgDcaStaNgtaDaaggtattHaRaWMYaY\n\
aWtggttHYgagVtgtgcttttcaaDKcagVcgttagacNaaWtagtaataDttctggtt\n\
VcatcataaagtgKaaaNaMtaBBaattaatWaattgctHaVKaSgDaaVKaHtatatat\n\
HatcatSBagNgHtatcHYMHgttDgtaHtBttWatcgtttaRaattgStKgSKNWKatc\n\
agDtctcagatttctRtYtBatBgHHtKaWtgYBgacVVWaKtacKcDttKMaKaVcggt\n\
gttataagaataaHaatattagtataatMHgttYgaRttagtaRtcaaVatacggtcMcg\n\
agtaaRttacWgactKRYataaaagSattYaWgagatYagKagatgSaagKgttaatMgg\n\
tataatgttWYttatgagaaacctNVataatHcccKtDctcctaatactggctHggaSag\n\
gRtKHaWaattcgSatMatttagaggcYtctaMcgctcataSatatgRagacNaaDagga\n\
VBagaYttKtacNaKgtSYtagttggaWcatcWttaatctatgaVtcgtgtMtatcaYcg\n\
tRccaaYgDctgcMgtgtWgacWtgataacacgcgctBtgttaKtYDtatDcatcagKaV\n\
MctaatcttgVcaaRgcRMtDcgattaHttcaNatgaatMtactacVgtRgatggaWttt\n\
actaaKatgagSaaKggtaNtactVaYtaaKRagaacccacaMtaaMtKtatBcttgtaa\n\
WBtMctaataaVcDaaYtcRHBtcgttNtaaHatttBNgRStVDattBatVtaagttaYa\n\
tVattaagaBcacggtSgtVtatttaRattgatgtaHDKgcaatattKtggcctatgaWD\n\
KRYcggattgRctatNgatacaatMNttctgtcRBYRaaaHctNYattcHtaWcaattct\n\
BtMKtVgYataatMgYtcagcttMDataVtggRtKtgaatgccNcRttcaMtRgattaac\n\
attRcagcctHtWMtgtDRagaKaBtgDttYaaaaKatKgatctVaaYaacWcgcatagB\n\
VtaNtRtYRaggBaaBtgKgttacataagagcatgtRattccacttaccatRaaatgWgD\n\
aMHaYVgVtaSctatcgKaatatattaDgacccYagtgtaYNaaatKcagtBRgagtcca\n\
tgKgaaaccBgaagBtgSttWtacgatWHaYatcgatttRaaNRgcaNaKVacaNtDgat\n\
tgHVaatcDaagcgtatgcNttaDataatcSataaKcaataaHWataBtttatBtcaKtK\n\
tatagttaDgSaYctacaRatNtaWctSaatatttYaKaKtaccWtatcRagacttaYtt\n\
VcKgSDcgagaagatccHtaattctSttatggtKYgtMaHagVaBRatttctgtRgtcta\n\
tgggtaHKgtHacHtSYacgtacacHatacKaaBaVaccaDtatcSaataaHaagagaat\n\
ScagactataaRttagcaaVcaHataKgDacatWccccaagcaBgagWatctaYttgaaa\n\
tctVNcYtttWagHcgcgcDcVaaatgttKcHtNtcaatagtgtNRaactttttcaatgg\n\
WgBcgDtgVgtttctacMtaaataaaRggaaacWaHttaRtNtgctaaRRtVBctYtVta\n\
tDcattDtgaccYatagatYRKatNYKttNgcctagtaWtgaactaMVaacctgaStttc\n\
tgaKVtaaVaRKDttVtVctaDNtataaaDtccccaagtWtcgatcactDgYaBcatcct\n\
MtVtacDaaBtYtMaKNatNtcaNacgDatYcatcgcaRatWBgaacWttKttagYtaat\n\
tcggttgSWttttDWctttacYtatatWtcatDtMgtBttgRtVDggttaacYtacgtac\n\
atgaattgaaWcttMStaDgtatattgaDtcRBcattSgaaVBRgagccaaKtttcDgcg\n\
aSMtatgWattaKttWtgDBMaggBBttBaatWttRtgcNtHcgttttHtKtcWtagHSt\n\
aacagttgatatBtaWSaWggtaataaMttaKacDaatactcBttcaatatHttcBaaSa\n\
aatYggtaRtatNtHcaatcaHtagVtgtattataNggaMtcttHtNagctaaaggtaga\n\
YctMattNaMVNtcKtactBKcaHHcBttaSagaKacataYgctaKaYgttYcgacWVtt\n\
WtSagcaacatcccHaccKtcttaacgaKttcacKtNtacHtatatRtaaatacactaBt\n\
ttgaHaRttggttWtatYagcatYDatcggagagcWBataagRtacctataRKgtBgatg\n\
aDatataSttagBaHtaatNtaDWcWtgtaattacagKttcNtMagtattaNgtctcgtc\n\
ctcttBaHaKcKccgtRcaaYagSattaagtKataDatatatagtcDtaacaWHcaKttD\n\
gaaRcgtgYttgtcatatNtatttttatggccHtgDtYHtWgttatYaacaattcaWtat\n\
NgctcaaaSttRgctaatcaaatNatcgtttaBtNNVtgttataagcaaagattBacgtD\n\
atttNatttaaaDcBgtaSKgacgtagataatttcHMVNttgttBtDtgtaWKaaRMcKM\n\
tHtaVtagataWctccNNaSWtVaHatctcMgggDgtNHtDaDttatatVWttgttattt\n\
aacctttcacaaggaSaDcggttttttatatVtctgVtaacaStDVaKactaMtttaSNa\n\
gtgaaattaNacttSKctattcctctaSagKcaVttaagNaVcttaVaaRNaHaaHttat\n\
gtHttgtgatMccaggtaDcgaccgtWgtWMtttaHcRtattgScctatttKtaaccaag\n\
tYagaHgtWcHaatgccKNRtttagtMYSgaDatctgtgaWDtccMNcgHgcaaacNDaa\n\
aRaStDWtcaaaaHKtaNBctagBtgtattaactaattttVctagaatggcWSatMaccc\n\
ttHttaSgSgtgMRcatRVKtatctgaaaccDNatYgaaVHNgatMgHRtacttaaaRta\n\
tStRtDtatDttYatattHggaBcttHgcgattgaKcKtttcRataMtcgaVttWacatN\n\
catacctRataDDatVaWNcggttgaHtgtMacVtttaBHtgagVttMaataattatgtt\n\
cttagtttgtgcDtSatttgBtcaacHattaaBagVWcgcaSYttMgcttacYKtVtatc\n\
aYaKctgBatgcgggcYcaaaaacgNtctagKBtattatctttKtaVttatagtaYtRag\n\
NtaYataaVtgaatatcHgcaaRataHtacacatgtaNtgtcgYatWMatttgaactacR\n\
ctaWtWtatacaatctBatatgYtaagtatgtgtatSttactVatcttYtaBcKgRaSgg\n\
RaaaaatgcagtaaaWgtaRgcgataatcBaataccgtatttttccatcNHtatWYgatH\n\
SaaaDHttgctgtccHtggggcctaataatttttctatattYWtcattBtgBRcVttaVM\n\
RSgctaatMagtYtttaaaaatBRtcBttcaaVtaacagctccSaaSttKNtHtKYcagc\n\
agaaaccccRtttttaaDcDtaStatccaagcgctHtatcttaDRYgatDHtWcaaaBcW\n\
gKWHttHataagHacgMNKttMKHccaYcatMVaacgttaKgYcaVaaBtacgcaacttt\n\
MctaaHaatgtBatgagaSatgtatgSRgHgWaVWgataaatatttccKagVgataattW\n\
aHNcYggaaatgctHtKtaDtctaaagtMaatVDVactWtSaaWaaMtaHtaSKtcBRaN\n\
cttStggtBttacNagcatagRgtKtgcgaacaacBcgKaatgataagatgaaaattgta\n\
ctgcgggtccHHWHaaNacaBttNKtKtcaaBatatgctaHNgtKcDWgtttatNgVDHg\n\
accaacWctKaaggHttgaRgYaatHcaBacaatgagcaaattactgtaVaaYaDtagat\n\
tgagNKggtggtgKtWKaatacagDRtatRaMRtgattDggtcaaYRtatttNtagaDtc\n\
acaaSDctDtataatcgtactaHttatacaatYaacaaHttHatHtgcgatRRttNgcat\n\
SVtacWWgaaggagtatVMaVaaattScDDKNcaYBYaDatHgtctatBagcaacaagaa\n\
tgagaaRcataaKNaRtBDatcaaacgcattttttaaBtcSgtacaRggatgtMNaattg\n\
gatatWtgagtattaaaVctgcaYMtatgatttttYgaHtgtcttaagWBttHttgtctt\n\
attDtcgtatWtataataSgctaHagcDVcNtaatcaagtaBDaWaDgtttagYctaNcc\n\
DtaKtaHcttaataacccaRKtacaVaatNgcWRaMgaattatgaBaaagattVYaHMDc\n\
aDHtcRcgYtcttaaaWaaaVKgatacRtttRRKYgaatacaWVacVcRtatMacaBtac\n\
tggMataaattttHggNagSctacHgtBagcgtcgtgattNtttgatSaaggMttctttc\n\
ttNtYNagBtaaacaaatttMgaccttacataattgYtcgacBtVMctgStgMDtagtaR\n\
ctHtatgttcatatVRNWataDKatWcgaaaaagttaaaagcacgHNacgtaatctttMR\n\
tgacttttDacctataaacgaaatatgattagaactccSYtaBctttaataacWgaaaYa\n\
tagatgWttcatKtNgatttttcaagHtaYgaaRaDaagtaggagcttatVtagtctttc\n\
attaaaatcgKtattaRttacagVaDatgcatVgattgggtctttHVtagKaaRBtaHta\n\
aggccccaaaaKatggtttaMWgtBtaaacttcactttKHtcgatctccctaYaBacMgt\n\
cttBaBaNgcgaaacaatctagtHccHtKttcRtRVttccVctttcatacYagMVtMcag\n\
aMaaacaataBctgYtaatRaaagattaaccatVRatHtaRagcgcaBcgDttStttttc\n\
VtttaDtKgcaaWaaaaatSccMcVatgtKgtaKgcgatatgtagtSaaaDttatacaaa\n\
catYaRRcVRHctKtcgacKttaaVctaDaatgttMggRcWaacttttHaDaKaDaBctg\n\
taggcgtttaHBccatccattcNHtDaYtaataMttacggctNVaacDattgatatttta\n\
cVttSaattacaaRtataNDgacVtgaacataVRttttaDtcaaacataYDBtttaatBa\n\
DtttYDaDaMccMttNBttatatgagaaMgaNtattHccNataattcaHagtgaaggDga\n\
tgtatatatgYatgaStcataaBStWacgtcccataRMaaDattggttaaattcMKtctM\n\
acaBSactcggaatDDgatDgcWctaacaccgggaVcacWKVacggtaNatatacctMta\n\
tgatagtgcaKagggVaDtgtaacttggagtcKatatcgMcttRaMagcattaBRaStct\n\
YSggaHYtacaactMBaagDcaBDRaaacMYacaHaattagcattaaaHgcgctaaggSc\n\
cKtgaaKtNaBtatDDcKBSaVtgatVYaagVtctSgMctacgttaacWaaattctSgtD\n\
actaaStaaattgcagBBRVctaatatacctNttMcRggctttMttagacRaHcaBaacV\n\
KgaataHttttMgYgattcYaNRgttMgcVaaacaVVcDHaatttgKtMYgtatBtVVct\n\
WgVtatHtacaaHttcacgatagcagtaaNattBatatatttcVgaDagcggttMaagtc\n\
ScHagaaatgcYNggcgtttttMtStggtRatctacttaaatVVtBacttHNttttaRca\n\
aatcacagHgagagtMgatcSWaNRacagDtatactaaDKaSRtgattctccatSaaRtt\n\
aaYctacacNtaRtaactggatgaccYtacactttaattaattgattYgttcagDtNKtt\n\
agDttaaaaaaaBtttaaNaYWKMBaaaacVcBMtatWtgBatatgaacVtattMtYatM\n\
NYDKNcKgDttDaVtaaaatgggatttctgtaaatWtctcWgtVVagtcgRgacttcccc\n\
taDcacagcRcagagtgtWSatgtacatgttaaSttgtaaHcgatgggMagtgaacttat\n\
RtttaVcaccaWaMgtactaatSSaHtcMgaaYtatcgaaggYgggcgtgaNDtgttMNg\n\
aNDMtaattcgVttttaacatgVatgtWVMatatcaKgaaattcaBcctccWcttgaaWH\n\
tWgHtcgNWgaRgctcBgSgaattgcaaHtgattgtgNagtDttHHgBttaaWcaaWagc\n\
aSaHHtaaaVctRaaMagtaDaatHtDMtcVaWMtagSagcttHSattaacaaagtRacM\n\
tRtctgttagcMtcaBatVKtKtKacgagaSNatSactgtatatcBctgagVtYactgta\n\
aattaaaggcYgDHgtaacatSRDatMMccHatKgttaacgactKtgKagtcttcaaHRV\n\
tccttKgtSataatttacaactggatDNgaacttcaRtVaagDcaWatcBctctHYatHa\n\
DaaatttagYatSatccaWtttagaaatVaacBatHcatcgtacaatatcgcNYRcaata\n\
YaRaYtgattVttgaatgaVaactcRcaNStgtgtattMtgaggtNttBaDRcgaaaagc\n\
tNgBcWaWgtSaDcVtgVaatMKBtttcgtttctaaHctaaagYactgMtatBDtcStga\n\
ccgtSDattYaataHctgggaYYttcggttaWaatctggtRagWMaDagtaacBccacta\n\
cgHWMKaatgatWatcctgHcaBaSctVtcMtgtDttacctaVgatYcWaDRaaaaRtag\n\
atcgaMagtggaRaWctctgMgcWttaagKBRtaaDaaWtctgtaagYMttactaHtaat\n\
cttcataacggcacBtSgcgttNHtgtHccatgttttaaagtatcgaKtMttVcataYBB\n\
aKtaMVaVgtattNDSataHcagtWMtaggtaSaaKgttgBtVtttgttatcatKcgHac\n\
acRtctHatNVagSBgatgHtgaRaSgttRcctaacaaattDNttgacctaaYtBgaaaa\n\
tagttattactcttttgatgtNNtVtgtatMgtcttRttcatttgatgacacttcHSaaa\n\
ccaWWDtWagtaRDDVNacVaRatgttBccttaatHtgtaaacStcVNtcacaSRttcYa\n\
gacagaMMttttgMcNttBcgWBtactgVtaRttctccaaYHBtaaagaBattaYacgat\n\
ttacatctgtaaMKaRYtttttactaaVatWgctBtttDVttctggcDaHaggDaagtcg\n\
aWcaagtagtWttHtgKtVataStccaMcWcaagataagatcactctHatgtcYgaKcat\n\
cagatactaagNSStHcctRRNtattgtccttagttagMVgtatagactaactctVcaat\n\
MctgtttgtgttgccttatWgtaBVtttctggMcaaKgDWtcgtaaYStgSactatttHg\n\
atctgKagtagBtVacRaagRtMctatgggcaaaKaaaatacttcHctaRtgtDcttDat\n\
taggaaatttcYHaRaaBttaatggcacKtgctHVcaDcaaaVDaaaVcgMttgtNagcg\n\
taDWgtcgttaatDgKgagcSatatcSHtagtagttggtgtHaWtaHKtatagctgtVga\n\
ttaBVaatgaataagtaatVatSttaHctttKtttgtagttaccttaatcgtagtcctgB\n\
cgactatttVcMacHaaaggaatgDatggKtaHtgStatattaaSagctWcctccRtata\n\
BaDYcgttgcNaagaggatRaaaYtaWgNtSMcaatttactaacatttaaWttHtatBat\n\
tgtcgacaatNgattgcNgtMaaaKaBDattHacttggtRtttaYaacgVactBtaBaKt\n\
gBttatgVttgtVttcaatcWcNctDBaaBgaDHacBttattNtgtDtatttVSaaacag\n\
gatgcRatSgtaSaNtgBatagttcHBgcBBaaattaHgtDattatDaKaatBaaYaaMa\n\
ataaataKtttYtagtBgMatNcatgtttgaNagtgttgtgKaNaSagtttgaSMaYBca\n\
aaacDStagttVacaaaaactaaWttBaagtctgtgcgtMgtaattctcctacctcaNtt\n\
taaccaaaaVtBcacataacaccccBcWMtatVtggaatgaWtcaaWaaaaaaaaWtDta\n\
atatRcctDWtcctaccMtVVatKttaWaaKaaatataaagScHBagaggBaSMtaWaVt\n\
atattactSaaaKNaactatNatccttgaYctattcaaaVgatttYHcRagattttaSat\n\
aggttattcVtaaagaKgtattattKtRttNcggcRgtgtgtWYtaacHgKatKgatYta\n\
cYagDtWcHBDctctgRaYKaYagcactKcacSaRtBttttBHKcMtNtcBatttatttt\n\
tgSatVgaaagaWtcDtagDatatgMacaacRgatatatgtttgtKtNRaatatNatgYc\n\
aHtgHataacKtgagtagtaacYttaNccaaatHcacaacaVDtagtaYtccagcattNt\n\
acKtBtactaaagaBatVtKaaHBctgStgtBgtatgaSNtgDataaccctgtagcaBgt\n\
gatcttaDataStgaMaccaSBBgWagtacKcgattgaDgNNaaaacacagtSatBacKD\n\
gcgtataBKcatacactaSaatYtYcDaactHttcatRtttaatcaattataRtttgtaa\n\
gMcgNttcatcBtYBagtNWNMtSHcattcRctttttRWgaKacKttgggagBcgttcgc\n\
MaWHtaatactgtctctatttataVgtttaBScttttaBMaNaatMacactYtBMggtHa\n\
cMagtaRtctgcatttaHtcaaaatttgagKtgNtactBacaHtcgtatttctMaSRagc\n\
agttaatgtNtaaattgagagWcKtaNttagVtacgatttgaatttcgRtgtWcVatcgt\n\
taaDVctgtttBWgaccagaaagtcSgtVtatagaBccttttcctaaattgHtatcggRa\n\
ttttcaaggcYSKaagWaWtRactaaaacccBatMtttBaatYtaagaactSttcgaaSc\n\
aatagtattgaccaagtgttttctaacatgtttNVaatcaaagagaaaNattaaRtttta\n\
VaaaccgcaggNMtatattVctcaagaggaacgBgtttaacaagttcKcYaatatactaa\n\
ccBaaaSggttcNtattctagttRtBacgScVctcaatttaatYtaaaaaaatgSaatga\n\
tagaMBRatgRcMcgttgaWHtcaVYgaatYtaatctttYttatRaWtctgBtDcgatNa\n\
tcKaBaDgatgtaNatWKctccgatattaacattNaaacDatgBgttctgtDtaaaMggt\n\
gaBaSHataacgccSctaBtttaRBtcNHcDatcDcctagagtcRtaBgWttDRVHagat\n\
tYatgtatcWtaHtttYcattWtaaagtctNgtStggRNcgcggagSSaaagaaaatYcH\n\
DtcgctttaatgYcKBVSgtattRaYBaDaaatBgtatgaHtaaRaRgcaSWNtagatHa\n\
acttNctBtcaccatctMcatattccaSatttgcgaDagDgtatYtaaaVDtaagtttWV\n\
aagtagYatRttaagDcNgacKBcScagHtattatcDaDactaaaaaYgHttBcgaDttg\n\
gataaaKSRcBMaBcgaBSttcWtgNBatRaccgattcatttataacggHVtaattcaca\n\
agagVttaaRaatVVRKcgWtVgacctgDgYaaHaWtctttcacMagggatVgactagMa\n\
aataKaaNWagKatagNaaWtaaaatttgaattttatttgctaaVgaHatBatcaaBWcB\n\
gttcMatcgBaaNgttcgSNaggSaRtttgHtRtattaNttcDcatSaVttttcgaaaaa\n\
ttgHatctaRaggSaNatMDaaatDcacgattttagaHgHaWtYgattaatHNSttatMS\n\
gggNtcKtYatRggtttgtMWVtttaYtagcagBagHaYagttatatggtBacYcattaR\n\
SataBatMtttaaatctHcaaaSaaaagttNSaaWcWRccRtKaagtBWtcaaattSttM\n\
tattggaaaccttaacgttBtWatttatatWcDaatagattcctScacctaagggRaaYt\n\
aNaatgVtBcttaaBaacaMVaaattatStYgRcctgtactatcMcVKatttcgSgatRH\n\
MaaaHtagtaaHtVgcaaataatatcgKKtgccaatBNgaaWcVttgagttaKatagttc\n\
aggKDatDtattgaKaVcaKtaataDataataHSaHcattagttaatRVYcNaHtaRcaa\n\
ggtNHcgtcaaccaBaaagYtHWaaaRcKgaYaaDttgcWYtataRgaatatgtYtgcKt\n\
aNttWacatYHctRaDtYtattcBttttatcSataYaYgttWaRagcacHMgtttHtYtt\n\
YaatcggtatStttcgtRSattaaDaKMaatatactaNBaWgctacacYtgaYVgtgHta\n\
aaRaaRgHtagtWattataaaSDaaWtgMattatcgaaaagtaYRSaWtSgNtBgagcRY\n\
aMDtactaacttaWgtatctagacaagNtattHggataatYttYatcataDcgHgttBtt\n\
ctttVttgccgaaWtaaaacgKgtatctaaaaaNtccDtaDatBMaMggaatNKtatBaa\n\
atVtccRaHtaSacataHattgtttKVYattcataVaattWtcgtgMttcttKtgtctaa\n\
cVtatctatatBRataactcgKatStatattcatHHRttKtccaacgtgggtgRgtgaMt\n\
attattggctatcgtgacMtRcBDtcttgtactaatRHttttaagatcgVMDStattatY\n\
BtttDttgtBtNttgRcMtYtgBacHaWaBaatDKctaagtgaaactaatgRaaKgatcc\n\
aagNaaaatattaggWNtaagtatacttttKcgtcggSYtcttgRctataYcttatataa\n\
agtatattaatttataVaacacaDHatctatttttKYVatHRactttaBHccaWagtact\n\
BtcacgaVgcgttRtttttttSVgtSagtBaaattctgaHgactcttgMcattttagVta\n\
agaattHctHtcaDaaNtaacRggWatagttcgtSttgaDatcNgNagctagDgatcNtt\n\
KgttgtaDtctttRaaYStRatDtgMggactSttaDtagSaVtBDttgtDgccatcacaM\n\
attaaaMtNacaVcgSWcVaaDatcaHaatgaattaMtatccVtctBtaattgtWattat\n\
BRcWcaatgNNtactWYtDaKttaaatcactcagtRaaRgatggtKgcgccaaHgaggat\n\
StattYcaNMtcaBttacttatgagDaNtaMgaaWtgtttcttctaHtMNgttatctaWW\n\
atMtBtaaatagDVatgtBYtatcggcttaagacMRtaHScgatatYgRDtcattatSDa\n\
HggaaataNgaWSRRaaaBaatagBattaDctttgHWNttacaataaaaaaatacggttt\n\
gHgVtaHtWMttNtBtctagtMcgKMgHgYtataHaNagWtcaacYattaataYRgtaWK\n\
gaBctataaccgatttaHaNBRaRaMtccggtNgacMtctcatttgcaattcWgMactta\n\
caaDaaNtactWatVtttagccttMaatcagVaagtctVaaDaBtattaattaYtNaYtg\n\
gattaKtaKctYaMtattYgatattataatKtVgDcttatatNBtcgttgtStttttMag\n\
aggttaHYSttcKgtcKtDNtataagttataagSgttatDtRttattgttttSNggRtca\n\
aKMNatgaatattgtBWtaMacctgggYgaSgaagYataagattacgagaatBtggtRcV\n\
HtgYggaDgaYaKagWagctatagacgaaHgtWaNgacttHRatVaWacKYtgRVNgVcS\n\
gRWctacatcKSactctgWYtBggtataagcttNRttVtgRcaWaaatDMatYattaact\n\
ttcgaagRatSctgccttgcRKaccHtttSNVagtagHagBagttagaccaRtataBcca\n\
taatSHatRtcHagacBWatagcaMtacaRtgtgaaBatctKRtScttccaNaatcNgta\n\
atatWtcaMgactctBtWtaaNactHaaaaRctcgcatggctMcaaNtcagaaaaacaca\n\
gtggggWttRttagtaagaVctVMtcgaatcttcMaaaHcaHBttcgattatgtcaDagc\n\
YRtBtYcgacMgtDcagcgaNgttaataatagcagKYYtcgtaBtYctMaRtaRtDagaa\n\
aacacatgYaBttgattattcgaaNttBctSataaMataWRgaHtttccgtDgaYtatgg\n\
tDgHKgMtatttVtMtVagttaRatMattRagataaccctKctMtSttgaHagtcStcta\n\
tttccSagatgttccacgaggYNttHRacgattcDatatDcataaaatBBttatcgaHtN\n\
HaaatatDNaggctgaNcaaggagttBttMgRagVatBcRtaWgatgBtSgaKtcgHttt\n\
gaatcaaDaHttcSBgHcagtVaaSttDcagccgttNBtgttHagYtattctttRWaaVt\n\
SttcatatKaaRaaaNacaVtVctMtSDtDtRHRcgtaatgctcttaaatSacacaatcg\n\
HattcaWcttaaaatHaaatcNctWttaNMcMtaKctVtcctaagYgatgatcYaaaRac\n\
tctaRDaYagtaacgtDgaggaaatctcaaacatcaScttcKttNtaccatNtaNataca\n\
tttHaaDHgcaDatMWaaBttcRggctMaagctVYcacgatcaDttatYtaatcKatWat\n\
caatVYtNagatttgattgaYttttYgacttVtcKaRagaaaHVgDtaMatKYagagttN\n\
atWttaccNtYtcDWgSatgaRgtMatgKtcgacaagWtacttaagtcgKtgatccttNc\n\
ttatagMatHVggtagcgHctatagccctYttggtaattKNaacgaaYatatVctaataM\n\
aaaYtgVtcKaYtaataacagaatHcacVagatYWHttagaaSMaatWtYtgtaaagNaa\n\
acaVgaWtcacNWgataNttcaSagctMDaRttgNactaccgataMaaatgtttattDtc\n\
aagacgctDHYYatggttcaagccNctccttcMctttagacBtaaWtaWVHggaaaaNat\n\
ttaDtDtgctaaHHtMtatNtMtagtcatttgcaaaRatacagRHtatDNtgtDgaatVg\n\
tVNtcaaatYBMaaaagcaKgtgatgatMgWWMaHttttMgMagatDtataaattaacca\n\
actMtacataaattgRataatacgBtKtaataattRgtatDagDtcRDacctatRcagag\n\
cSHatNtcaScNtttggacNtaaggaccgtgKNttgttNcttgaaRgYgRtNtcagttBc\n\
ttttcHtKtgcttYaaNgYagtaaatgaatggWaMattBHtatctatSgtcYtgcHtaat\n\
tHgaaMtHcagaaSatggtatgccaHBtYtcNattWtgtNgctttaggtttgtWatNtgH\n\
tgcDttactttttttgcNtactKtWRaVcttcatagtgSNKaNccgaataaBttataata\n\
YtSagctttaaatSttggctaaKSaatRccgWHgagDttaaatcatgagMtcgagtVtaD\n\
ggaBtatttgDacataaacgtagYRagBWtgDStKDgatgaagttcattatttaKWcata\n\
aatWRgatataRgttRacaaNKttNtKagaaYaStaactScattattaacgatttaaatg\n\
DtaattagatHgaYataaactatggggatVHtgccgtNgatNYcaStRtagaccacWcaM\n\
tatRagHgVactYtWHtcttcatgatWgagaKggagtatgaWtDtVtNaNtcgYYgtaaa\n\
ctttaDtBactagtaDctatagtaatatttatatataacgHaaaRagKattSagttYtSt\n\
>THREE Homo sapiens frequency\n\
agagagacgatgaaaattaatcgtcaatacgctggcgaacactgagggggacccaatgct\n\
cttctcggtctaaaaaggaatgtgtcagaaattggtcagttcaaaagtagaccggatctt\n\
tgcggagaacaattcacggaacgtagcgttgggaaatatcctttctaccacacatcggat\n\
tttcgccctctcccattatttattgtgttctcacatagaattattgtttagacatccctc\n\
gttgtatggagagttgcccgagcgtaaaggcataatccatataccgccgggtgagtgacc\n\
tgaaattgtttttagttgggatttcgctatggattagcttacacgaagagattctaatgg\n\
tactataggataattataatgctgcgtggcgcagtacaccgttacaaacgtcgttcgcat\n\
atgtggctaacacggtgaaaatacctacatcgtatttgcaatttcggtcgtttcatagag\n\
cgcattgaattactcaaaaattatatatgttgattatttgattagactgcgtggaaagaa\n\
ggggtactcaagccatttgtaaaagctgcatctcgcttaagtttgagagcttacattagt\n\
ctatttcagtcttctaggaaatgtctgtgtgagtggttgtcgtccataggtcactggcat\n\
atgcgattcatgacatgctaaactaagaaagtagattactattaccggcatgcctaatgc\n\
gattgcactgctatgaaggtgcggacgtcgcgcccatgtagccctgataataccaatact\n\
tacatttggtcagcaattctgacattatacctagcacccataaatttactcagacttgag\n\
gacaggctcttggagtcgatcttctgtttgtatgcatgtgatcatatagatgaataagcg\n\
atgcgactagttagggcatagtatagatctgtgtatacagttcagctgaacgtccgcgag\n\
tggaagtacagctgagatctatcctaaaatgcaaccatatcgttcacacatgatatgaac\n\
ccagggggaaacattgagttcagttaaattggcagcgaatcccccaagaagaaggcggag\n\
tgacgttgaacgggcttatggtttttcagtacttcctccgtataagttgagcgaaatgta\n\
aacagaataatcgttgtgttaacaacattaaaatcgcggaatatgatgagaatacacagt\n\
gtgagcatttcacttgtaaaatatctttggtagaacttactttgctttaaatatgttaaa\n\
ccgatctaataatctacaaaacggtagattttgcctagcacattgcgtccttctctattc\n\
agatagaggcaatactcagaaggttttatccaaagcactgtgttgactaacctaagtttt\n\
agtctaataatcatgattgattataggtgccgtggactacatgactcgtccacaaataat\n\
acttagcagatcagcaattggccaagcacccgacttttatttaatggttgtgcaatagtc\n\
cagattcgtattcgggactctttcaaataatagtttcctggcatctaagtaagaaaagct\n\
cataaggaagcgatattatgacacgctcttccgccgctgttttgaaacttgagtattgct\n\
cgtccgaaattgagggtcacttcaaaatttactgagaagacgaagatcgactaaagttaa\n\
aatgctagtccacagttggtcaagttgaattcatccacgagttatatagctattttaatt\n\
tatagtcgagtgtacaaaaaacatccacaataagatttatcttagaataacaacccccgt\n\
atcatcgaaatcctccgttatggcctgactcctcgagcttatagcatttgtgctggcgct\n\
cttgccaggaacttgctcgcgaggtggtgacgagtgagatgatcagtttcattatgatga\n\
tacgattttatcgcgactagttaatcatcatagcaagtaaaatttgaattatgtcattat\n\
catgctccattaacaggttatttaattgatactgacgaaattttttcacaatgggttttc\n\
tagaatttaatatcagtaattgaagccttcataggggtcctactagtatcctacacgacg\n\
caggtccgcagtatcctggagggacgtgttactgattaaaagggtcaaaggaatgaaggc\n\
tcacaatgttacctgcttcaccatagtgagccgatgagttttacattagtactaaatccc\n\
aaatcatactttacgatgaggcttgctagcgctaaagagaatacatacaccaccacatag\n\
aattgttagcgatgatatcaaatagactcctggaagtgtcagggggaaactgttcaatat\n\
ttcgtccacaggactgaccaggcatggaaaagactgacgttggaaactataccatctcac\n\
gcccgacgcttcactaattgatgatccaaaaaatatagcccggattcctgattagcaaag\n\
ggttcacagagaaagatattatcgacgtatatcccaaaaaacagacgtaatgtgcatctt\n\
cgaatcgggatgaatacttgtatcataaaaatgtgacctctagtatacaggttaatgtta\n\
gtgatacacaatactcgtgggccatgggttctcaaataaaatgtaatattgcgtcgatca\n\
ctcacccacgtatttggtctaattatgttttatttagtgacaatccaatagataaccggt\n\
cctattaagggctatatttttagcgaccacgcgtttaaacaaaggattgtatgtagatgg\n\
taccagtttaattgccagtgggcaatcctaagcaaaatgagattctatcctaaagtttgg\n\
gcttgatataagatttcggatgtatgggttttataatcgttggagagctcaatcatgagc\n\
taatacatggatttcgctacctcaccgagagaccttgcatgaagaattctaaccaaaagt\n\
ttaataggccggattggattgagttaattaagaccttgttcagtcatagtaaaaaccctt\n\
aaattttaccgattgacaaagtgagcagtcgcaataccctatgcgaaacgcctcgatagt\n\
gactaggtatacaaggtttttgagttcctttgaaatagttaactaatttaaaattaatta\n\
acgacatggaaatcacagaacctaatgctttgtaggagttatttatgctgtttactgcct\n\
ctacaaccctaataaagcagtcctaagaatgaaacgcatcttttagttcagaaagtggta\n\
tccagggtggtcaatttaataaattcaacatcgggtctcaggatattcggtcatataatt\n\
tattaagggctcttcgagtcttactctgagtgaaattggaaacagtcatccttttcgttg\n\
tgaggcatcttacaccgctatcgatatacaatgcattccaccgcggtgtcccgtacacaa\n\
ggaaacttgttaccttggggatataagaaaactcacacgtctcattattaaactgagtac\n\
aatttttgcacgagaaagtaatgcaatacaatatgatgaaagccagctaatgaaaaggga\n\
tggaacgcacctcggatctgttgcactggattaaaatccgattatttttaaaaatattca\n\
gtgctagagcatatcaggtctacttttttatctggtatgtaaagcccacggagcgatagt\n\
gagatccttacgactcaacgaaaagttataacataactcccgttagccaaagcccaatcc\n\
cgattactgccctaccctaacgtctgccatctaaatatcgaacttgttatgatcaatgtg\n\
actacctcccaccctttccccttcatttgttccactggggataagctagcgttttcagaa\n\
tcaatgcaataagaatagccaattgtctcacttcatcagagctcttggcaattccaggcg\n\
ctacgtggttctggaatatattcatttttcaaatagtaatacgtttagtgttgctattgt\n\
ctacacgtttggatattacgttatgtgagcggacatcaatagttgtctaactctttagta\n\
agccagagatagcactcttagcgaatggataccatcttccataagtttagttaatagtcc\n\
gaaacaactgcttcgagcatatttgaacctccttgtaggcaaatagcctcttcaaagcaa\n\
tcttactaatagatagagtttgttttaagggactactagaaatgggacaatcttaatagt\n\
atgacctaaactgacatttaaagatatatccaggtggcaagcataaagatcattgcgcca\n\
cctccaccgtgggattacttatcagtcgatatcctatatgctaagtttgcgacggcagaa\n\
tacaaactaagctgagttgatgctaaccttacctatgataccccattggaccggttaaca\n\
gccctacttattccaaataaaagaacttttatgctgtagaagctattatagtgatgcctg\n\
gtaacttcagtatattaaaatgacacacatacgccatatagagctcctggaactttgaat\n\
aatgagcgaacttcgaagttgaagagcaagaaaccatatgtcacggttgcctaaagcccg\n\
gtaaccagacatgtgctatcattgatcattatcgaggttttcataaccttgacccattat\n\
cggctgtgcgcggacaagtacttaaatcactagtttcttcacctgcttatcggtaagaaa\n\
taaggttggcaaagaatcgcataagacggacgtagagccgcagcgttgtgcgagtccagg\n\
tgcatgcgcagcaataggattttaaattttgttccatttttaatttagccgtaaggatgt\n\
ccgtaaatgattgaaaattggattcaatctttgggcctatgctactggaacctgatcgac\n\
aaaatttcaaacatacgttaactccgaaagaccgtatttttgcggctagaatagtcagtc\n\
gcttggagccatataccttaccacttaaacgacgtgctcctgtagttgaaatataaacag\n\
aacacaaagactaccgatcatatcaactgaagatctttgtaactttgaggcgaagcaccc\n\
tcttcgagacaactaagagtaaagtaccgggcgccgcaaggagtcgattgggaccctaaa\n\
tcttgacgaattgctaagaggctcagagctaccactgtaatttctctagagcccataata\n\
aatgaacgatacatccgtaggtagcacctaagggattataatggaagccaaatgcagtta\n\
ataatattatatactggcgtacacgattcgacggatctctcacatagtgattcacgaccc\n\
ccccctttgattgacacagcgtcagcattttgcaagaacgatcttctgcatagggtgcgc\n\
caccgtaaggatgacgtcgaagctacaactgggtataatttaccatgcttccctgatgct\n\
gagtgcaatacactaagaatgagtttttaccccatatcaccagtatttgttctgttattg\n\
cgaagaaatggctatgctgagttggcgactaaagtcacccatcctttttattaggtaacc\n\
ccctcccttaaactaactgatttgctggagctgccctgcatacatatactttatcattta\n\
tggacgtccgtgacgcttattatccaccatagtcgatatgctacacggattcattaatgg\n\
atcgtaggagtttaagttatatttactaagatcggtctcggctactatcccgccttaccc\n\
ggcgctatttacggccatttttaatatattgacggtaattattcctatggtttcgaccgc\n\
acgtccttggacaagaaagaatggcaaaaaaaatgtaaaagaaaaaaaatattgagtccc\n\
taccatcatataaaaaatatgtgatgagtaacttgacgaaatgttagtggttattaaaga\n\
ctatctattacaccttttgttttctgtcgtagtatattaaagtctagaagccttacagga\n\
aaatcagggttatacagccgatactccgcagcatgaatcatcgaggaggtgtcctaccat\n\
cgcgccttgtaatcttgtctgtgtatactgtatttagaccttttatacaaagtaaatatc\n\
tcggctttatgtgattgggaggggcctactcaaacatgatgacttgacctaataatcact\n\
gtgcgggcgtcttatgactagctattccttgaaatccaccaccaaatggttaatatgtaa\n\
aaactttgacgatgaaacaaggtgaatgtgtagttactttgtgtaattagctgcgtcgag\n\
cattgcttgtaaaaccgtcaatcgcacacgttacttccataaaatttctacgaatacacc\n\
cttcttaaaaaaaacgtaggaattcacgagtttaacaaacgataactgtataaagtggaa\n\
gtccgaagaaagcagatgcccgaactactcgaagatgtttcgttttcttaaccatagggg\n\
cttcttaatggcccactacgcacattttgttcaagcccgagagggacatccccattacgg\n\
gagtattactaaaactgttccgtaatacgttcagcaagggatgaaaaaggccactgctca\n\
agttattgacgtgggagtattacatcggaagcctgaatcccacactatgatggtctgtac\n\
aggcctagggactgcgtctagacggtattaccggcttctaatcatacgatcgtgagtctt\n\
aacgggaagtaaggctcacacctaccccaaaccatttatctatgtaagtataaaattgtg\n\
cgtaagtgttcaaagtggacaataaagacgtggcaaaaacccccgcacataagccgcttt\n\
agatttcacaaataccaatgcggttaaaaacatccttgagtcgtacatacaccatactcg\n\
cgttaaacggatataacagaagataataaatccggatgtggagtcggtgtaactatagaa\n\
agccaagtgaaataatgcttaccagtcatttagctatacggctttcatttcatgtcaaga\n\
gggtggagtttgacctgtacagttgatatatcaccgatacttagaactcacctaaagcta\n\
aaattgctcgcagcgtgtaatccgcatattacaaacaatagatgggattcattatacata\n\
agacacgatgatctgctttttcaggttgcgagatgttgcctatcgtcaatcgagtcctgc\n\
cttacaccacttaaacaaaagtattgacagggaacctattttcgaggtattatatagtcc\n\
agcttgaatatcaatttgacagttaacctagtgaaaatcagtaagaggaaatacgccaca\n\
ttctccagtgaaattctacgggttatcgtctagtccaactatcaattataactcacgaga\n\
tataagtaaattctcgtacttggcctgatttttattatactttggatccttagtaaacag\n\
gaagggagaaaccttcaacgaaaaacactggattttgttttactctcaaagctcttatat\n\
gacggaaataccctgtcaagtcttaactttattactagactaatgaaatgggcttggggt\n\
ggccagaatcatagtacaatttagcggatacactattcggactttcctatcggctgtctg\n\
gttggataagtatggggactaataggctagacatacctatacttaaactatacaggcgtc\n\
atctatctctgcaactttggagttccctgatgttctcccgccctttgggttcacatcttc\n\
tataccgacacccctaataacgattagtttgtgggttagagtaaattaatacggttaata\n\
ttaatgtatcgttgaaaagctggtgtcgccaataaggtaaccggctaggcagagtatatg\n\
tcacgaagtataactaccctaatgataagctgtaggaataaaattaatgctgtctctaag\n\
cgaagagatatttccgactctgttttaatgacgaatctcattacttctgacttgcaaatg\n\
ttcaatatggcacggtttcacggcacctttgtgacgcatataatgaacttagaagattat\n\
aacgacggaactttatatgataatccgttacgattaaagaatctgttaaatatcataatg\n\
gcattcagttctagaccgtgcatcatggtaaacttactttctctgcatggcgacatacat\n\
ttcgctattcaaattcgcgtgtggttacacccactcgcacctttggaatattaagagaag\n\
atgatcagaaaatccattcgctcaatttttctgacgtacgtctaatttatcctaggagac\n\
aaatcgttttatgtctctcacatttttgaagaaaggttcgagagacaatactcaggtcct\n\
gaactgctagaagatactcggtggagcgtggcaacaatgaaaaactcgtgacataaatga\n\
atgatacttttccaagttcagttaagtgaatatgtttaacatacccggcttttcgatctt\n\
aagctgacgctggacgtgcgagtaatgtcagtctcttacatacactagtgactccaagtt\n\
tcgtcaaaaacgccccctcccttctcgagcccactcacgctatgtattgacgcgaacttg\n\
ttcgggatcagacttttcaggagttcggtcgcgtgtccctatgtgctaatatataagtta\n\
gatcgcattagatgctaatctgaatacttatagacgaccttcaacgagaacgggtaccac\n\
cttgaggctagagttaggtgtgaaacgacaggtagggacatataaaatttgagtgcggct\n\
ttagttaagggtttaattacctactcaaacatcacgctcgcgcccttcgtacgtaatcga\n\
ccatctagaggctaaggggactgtactaggtagtgattaatgatatcctagacgcacgtg\n\
ccttagatcttcagactctgatggtccgcgatcaccgtaattgtagtcctccaactcgat\n\
cactttgttggcgtcaaagaaattacgatatctaaatacttataatacaataaccaagga\n\
tgagaatgactcatcgcgttggagttatattgcttgaagttctatggaatgaaagcacgt\n\
tatctgccgtcccaatatctccagtgagctaattcattggacggtccactttgatcaatc\n\
cccgaggagatgttcggacactttagtctgtaacacttagcgttgagaccacgaacaatt\n\
gattactcagtcttgaaggtgttttccaaagttcattttaaataagactacgataggcct\n\
ttcctattgatataaactacccggctctgttgttcgtgtgagtcgtacttctctgtgttt\n\
ttctgattatagcaagattcgattcttagtgtaaacagcgatttttatttgacccgtcaa\n\
tgagaagcgcataggatctaagcaaaattatcaagttgtgccacaaggtaagatctttcc\n\
agttattgcaggtaggatgtatcccacgttgatagtatgaggtctgacgtcaactgtcta\n\
ggagagttgaccgcgtgcgggtacaccggatttgcatcgatgttgagaacgcagaactcc\n\
cactgtcgtggcggcgttcctgatatttagcaagaggcgttgataaagccctcatcatct\n\
agatctcgacctcatctgccctcttgctccatcattttctacacagactactttcctatc\n\
tacgttagtataattgctttctatcttagtatcatttagagcttctccgtcaacaggttc\n\
gtgctattaaagttagtacgaaagggacaacttgtagcaacgcatttaatcggttttcga\n\
ctacttcgcacaaaatcagataaagaagtttgtcattctattagacattgaattgcgcaa\n\
ttgacttgtaccacttatgatcgaacactgaatcaagactgtgattaactaaaatagaca\n\
agccactatatcaactaataaaaacgcccctggtggtcgaacatagttgactacaggata\n\
attaattggactggagccattacattctctacaatcgtatcacttcccaagtagacaact\n\
ttgaccttgtagtttcatgtacaaaaaaatgctttcgcaggagcacattggtagttcaat\n\
agtttcatgggaacctcttgagccgtcttctgtgggtgtgttcggatagtaggtactgat\n\
aaagtcgtgtcgctttcgatgagagggaattcaccggaaaacaccttggttaacaggata\n\
gtctatgtaaacttcgagacatgtttaagagttaccagcttaatccacggtgctctacta\n\
gtatcatcagctgtcttgcctcgcctagaaatatgcattctatcgttatcctatcaacgg\n\
ttgccgtactgagcagccttattgtggaagagtaatatataaatgtagtcttgtctttac\n\
gaagcagacgtaagtaataatgacttggaataccaaaactaaacatagtggattatcata\n\
ctcaagaactctccagataaataacagtttttacgatacgtcaccaatgagcttaaagat\n\
taggatcctcaaaactgatacaaacgctaattcatttgttattggatccagtatcagtta\n\
aactgaatggagtgaagattgtagaatgttgttctggcctcgcatggggtctaggtgata\n\
tacaatttctcatacttacacggtagtggaaatctgattctagcttcgtagctgactata\n\
ctcaaggaaccactgctcaaggtaggagactagttccgaccctacagtcaaagtggccga\n\
agcttaaactatagactagttgttaaatgctgatttcaagatatcatctatatacagttt\n\
ggacaattatgtgtgcgaaactaaaattcatgctattcagatggatttcacttatgcctt\n\
agaaacagatattgcccgagctcaatcaacagttttagccggaaacaatcgaagcatagg\n\
gacaatgtatcttttcctaaattgccatgtgcagatttctgagtgtcacgaagcgcataa\n\
tagaatcttgtgttgcctcaactcgttgaaaagtttaaaacaatcgcagcagtctttttg\n\
gggtctactgtgtgtttgcaaaataactgaaagaaacgcttgaacaactctgaagtagct\n\
cgagtactcattaaagtgtaacacattagtgaatatcggccaatgaaccaaacgcttccc\n\
ggtacgctatctctctcatcgggaggcgatgtgcaggttatctacgaaagcatcccttta\n\
cgttgagagtgtcgatgcatgaacctcattgtaacaatagcccagcaaattctcatacgt\n\
gcctcagggtccgggcgtactcctccatggaagggcgcgcatctagtgttataccaactc\n\
gctttttaactactatgctgtagttctacaggcatagtggccagtattttctaacttctc\n\
tggatagatgctctcactcctcatccatcacggcttcagtttacgtcttacttgcttgtt\n\
cagcaacggatggaggcattaagtatcttcactgttccctaaaattgctgttcaatatca\n\
aagtaaggacgatacagggaaagctcaagcacactcattgaatactgccccagttgcaac\n\
ctcacttaatctgacaaaaataatgactactctaagtgttgcggaagcagtctcttccac\n\
gagcttgtctgtatcacttcgtataggcatgtaactcgatagacacgaacaccgagtgag\n\
aaactatattcttgcttccgtgtgtgtgacaccaggtaattgatgcggatataagctgga\n\
gatcactcacgcccacacaaggcgctgctacctctttattccaatgtgtaagaatttgct\n\
aacttcatttctagaccgcagctttgcggtcataatttcacggtacggacccttgggtta\n\
gagacttgataacacacttcgcagtttccaccgcgcacatgttttagtggcttctaacat\n\
agaatttttgttgtgacataaagagtgcgtgggagacttgcccgaccgttaagccataat\n\
caattgaaagccccgtgagtcacatctaattggttgtactgcgcatttagctatccttta\n\
gctgactcgaagagattcgattcctaatataggttaattagatggctgccgcgcgaagta\n\
aaacgtgaaaaacgtagtgcgcagatctgcataactcgcgcttaattacttatgagtagt\n\
tccaagttcgctacgttatgagagagattggaattaagcaaatatgttttatggtgattt\n\
tgggatgagaaggactgctaagtacggctactaaacaaatttctaaaaccgccatctacc\n\
ttatcttggagacatttaagttgtatatgtcactagtctagcttttgtctgtgggacgcg\n\
ttctcggaatgagggaaatgcaagagccgattcatcaaatgcttatctaagaaagtagtg\n\
gactattacaccaagcacgaatgccagggaactgctttcttgctcaggacctcgcgacaa\n\
ggtaccccgcataagtcctagaattacatttggtcagcaatgctgacatttgaccgtgaa\n\
aacataattttaatcagaaggcagctcacccgcttgctctagatcttatctttgtatgaa\n\
tgtcagaatttactgcaatatccgttccgaatagtgagggcttagtatagttctctgtat\n\
acaggtcacatcaaactccccctgtcctagtacagctctgagctttaattaattgcatac\n\
atttccttcaatcatcagatgaaaacaccgcgaatcatgctcttctcgtatagggcaaga\n\
gaagcaacaaacaactagcccgactcacgttcatccgccgtatccttgttcagttcttac\n\
tccgtattaggtcagcgaaatctaatcagaataatcggtcgcgtatcaaaattaaaatcc\n\
cgcttgaggttgacaattaaaacgctgagcagttatcggctattagatagtggggtgaaa\n\
gtaattggctggaattatgttaaaacgtgatattaagctaaaatacgctacttgttgccg\n\
acctaattcagtcattcgatattcagttagagccaagaataacaagcttgtataaattga\n\
acggggtgcactaaacgatgtgttactctaatattcagcttggagtatacctgaaggcga\n\
attcatgtatcggccaataataagacgttgaagatcacaatttggactagcaaaagaagg\n\
tgatttatgcgtggggattgagtccactgtacgagtacggtctctggaaaattataggtt\n\
cagggaatataaggaagtaaagataattaccaagagatttttggtatcgctatgacccag\n\
aggtgttctaacgtctgttttgatccgcagaatttctgcctcaatgcatatttgacggac\n\
ttgaactagagcctctaaagttaaatggcgacgcaactgttcctaaacttcaattattac\n\
tactctttttttcctagggtattgtagaggccagtggacaaaataaatcaaatttaagat\n\
gtttcggacattaacatcccccgtagcatagaaatcatcagttatccaatctctcatcga\n\
gcttttacaatttctgctggcgctatggacagcatatgccgcgagacctccgcaagactc\n\
acttgatcactgtaagtatcttcattagaggttagagcctatagttaagctgctgaccta\n\
gtaaaattggtattttctaattttattgctcaagttaaaggttagtgaagggataatgac\n\
gttatttttgaacaatgggttgtattcaattttatatcacgaatggaacccttcattccc\n\
ggcataatactagacgacacgaacaagctccgatctatcagccaggcacgtgttaaggtt\n\
taattccggcaaaccaatgaagcatcaaaaggtgacctgatgcaacttagggtcacgatg\n\
agtttttcaggactacttattacctattaataagttaacatgagccttcataccccgtaa\n\
gacaatacatactccaccaattagaattctgagccatcttatctttttgtatcatcgaag\n\
ggtatggccgaataggttaattagttactcctaacgtctctacaggcatgcatttgacgc\n\
accttcgaaaatagtcaatctctcgccacacgcgtctagtatgcagcatcaaaaatatag\n\
tccacggtttccggattaccaaacgcggcaaagagaaacattgtatcgacggagataact\n\
taatacagaaggaaggggcatcttcgaatacggatgaataattctatctgtttattctga\n\
catcttgttttcaggttaatcttacgcattcaaatgacgcctgccccatgcgtgcgcaat\n\
tattttctaatattgacgagagcaatctcactccttttgggtctatttatgttttattga\n\
ggcacaagcctatacagaacaggtactattaaggccgtgagtgtgagactcaaaccgtgg\n\
aaacaaaggatgggttgttcttggtacaagttttagtgcatgtgggcaatccttaccaaa\n\
atcagatgctatccttaactttgggctgcatttaagatggcggttggaggcctgtgagaa\n\
tcctgcgtgtcatctttaatgaccgaattcatccatgtagattcagatcacacactcatt\n\
ccttgatgttgtctaaacaaaagttgttgtggacgcattggagggagttaagtaacaact\n\
tgggatcgcatacttataaaaattatatgttaaactttcacaaacgctgaagtccaaagt\n\
aactagcccaaacgcctcgagagtcactaggtattaatggtgtttgagttcctgtgaaat\n\
agtgttcgaaggtaaaatttatgtaccaaatcgaaagaacacttaataaggcttgcttgc\n\
acggaggtatgatgtttactgactctacaaccctaattttccagtacgtacattcattcc\n\
aataggttagttctcaaagtgctatacaggctcctcaattgatgatatgcttcagccgct\n\
ctatggatattagctcattttatttaggaagcccgcttagaggcttactatgagggaaat\n\
gccaaaatgtcatacttttcggtgtgtcccatatgacaccgctttacatagaatttgaat\n\
taaaacgcgctctcccgttcactaccatacttggtaccgtgcgcatattacatatagata\n\
taggatcattttttaaagctgtactaggtttgatcgacaatcttatgctatactatatga\n\
tgtaaccctcataatcaataccgatcgtacgatcctagcataggtggcaagcgattttat\n\
gccgattattgtgttaaatagtctgtgagtgtgattatcagggctacgttggtagagggg\n\
ttgtatagacctcgcacacattgtgacatacttaacaatatacgaaaactgatataataa\n\
atccccttacccaaacaccaatcccgttgaatcaactaccataacgtctcccatataaat\n\
tgcctacttgtttgcataaatctgaatacataacaccattgcaccttcttgtgttccaat\n\
cccgttaagattgccttgtcagatgatatgcaagaacaatagcatttgctagcaattatt\n\
aacagctcttcgaattgcctccacataacgcgggagggtatattttaatttggcaaatac\n\
taagtactgttggcgtcatatgctattaacggttggatattaagttatgtcagccgtaag\n\
caagagtgggcgaaatattttgttacccagtgagagcactcttagagtttggatacaata\n\
ggccatatgttgacttaagaggacgtaactacgccgtacaccattgttcaaccgacttct\n\
tggcaaatagaatcgtattagcaatcttaagaatagagacacgttcgtgttagggtatac\n\
tacaaatccgaaaatcttaagaggatcacctaaactgaaatttatacatatttcaacgtg\n\
gatagatttaacataattcagccacctccaacctgggagtaattttcagtagatttacta\n\
gatgattagtggcccaacgcacttgactatataagatctggggatcctaacctgacctat\n\
gagacaaaattggaaacgttaacagcccttatgtgtacaaagaaaagtaagttgttgctg\n\
ttcaacagatgatagtcatgacgcgtaacttcactatagtaaattgaaacaaatacgcaa\n\
tttagacagaatggtacggtcatgaatgacagtaattcgaagtgctagaccaacttaaaa\n\
taggtaaacgtgcccgaaaccccccttaacagaaagctgctatcatggtgcagtatcgac\n\
gtgttcagaaacttgtaacttttgagcaggtccgagcacatggaagtatatcacgtgttt\n\
ctgaaccggcttatccctaagatatatccgtcgcaaactttcgatttagtcccacgtaga\n\
gcccaagcgttgtgcgactccacgtgcatgcccagaaatacgagtttaaatttggttaca\n\
tggttaattttgaccgaagcatcgcactttatgattgataattggattcaatatgtcgcc\n\
ctatgcgaatgcaacatgatccacaatttggctataagacgtttaatccgtatcacactt\n\
tgtttgcggctagtatagtaacgcccgtgcaccaagagtcagtaacaattataagtactc\n\
cgcaggtacttcaaatataaaaactaatcaaacacgacccatatgatcatctgaagatat\n\
ttggaactttctcgacaaccaccctcgtactcaatacttacactaatcgacaggcacacg\n\
caacgtgtacagtcgcaccatattgagtcaagatttgcttagtggcgatgagcgtacacg\n\
cttatttctctagtcacaattagttatctacgagacatcacgagggagcaaataagcgat\n\
gttatggctacacataggcacgtatgaatatgatataagccagttaaacagtcgaaccat\n\
cgagcaaattctcatgcaccaacccacacgttgaggcacaaagagtaagctgtttgaatg\n\
taacttcttctgctgagcgggccccaacgtaaggatcaactagaagagaaaactcggtat\n\
tagtttaaatgcgtcacggagcatgagtgcatttcactaagaatgtctgtgtaaccaata\n\
taacatctatttgttatctgattgcctacttatggctttgcggtcgtggcgactaatgtc\n\
tccaatccttttgaggtcggtaccaactccctttaaattacgctgtgcaggctcatgcac\n\
tgcatacatatacggtagcaggtagggacctcacgcacccttattataatcaatagtagt\n\
tatcagtcaacgaggcaggaatgctgaggtcgaggtgttggtatattttctatgtgccgt\n\
ctaggcgactatcacgcattaccaggcgagatttaagccaattttgaatatagtcaacgt\n\
aatttttactatgggttccaccgaaacgccttgcacaactaagaatcccataaaatatcg\n\
atatcaaataaaagattgtgtcaataccttcatatatattttttcggttgactaacgtga\n\
actaaggttaggggttttgtatgtctatataggaaacagtttcttttctgtcctacttta\n\
gtaaagtcttcaagccttactccaaaatcacggtgattaagccgttactcagcagcatga\n\
ttctgcctgctcgggtcctaaaatccagccttgtaagagtcgctgtgtattagctaggga\n\
gacctttgttaaaaaggatatatcgcggcgggatgtgagtgcgtggcgcatactcaatct\n\
tcagctcgtgtcattataatatctctcccccacgcttttcactagatatgccgtgtaagc\n\
aaacaccttatgcttaatttcgaaaatattggtacttgaaaaaagctgtaggggtactta\n\
atgtctggtaggagatcaggagagaattgagtgtaaaaccgtaaagccctcacctgactt\n\
catgtaaatggcttagaagactccatgatttaataaatactacgaaggaaagactggatc\n\
taaagataactctagtaaggccaactcccttcaatgctgttgccagttataatccaagag\n\
ctgtccttttctgaaccatagcggcttctgaagcgaactagaagcaaagttggttctagc\n\
cagacagccacataccctgtacgggtgtattactaaaactggtccggtattagttcacca\n\
agggaggaattaggcaaaggatctaggtatgcaagtcggagtattacatccctaccctga\n\
atccatcaataggttcctctgtactggccttcgcaatgagtattcaaggttgtacagccg\n\
tataataataagatagtgactatgaacgggaagtaacccgctcaccttccccaaaacatt\n\
gttatatctaagtattaaagtctgccgtagtgttaatactcgaaaataaacaactggcaa\n\
attacaccgcacttaagccgcttttgatttatatttttccaatgcgcttttaaaaataat\n\
tcagtcctacatactaattaagacccttaaacggagatatcacaagttaagttttaacca\n\
tctcgactaggtggaactatagatacccaactcaatttatcattacctgtaatgttccta\n\
gaaggattgcatttcatgtcaagacggtggagtttcacagcgaaacttcagtgtgaacag\n\
attctgagaaatcacctaaacctattagtcagagcacccggttagaaccagttgtcaaaa\n\
aatagagcggttgcatgagacagaagtaacgatgagatccgttgtaacgttgagacatct\n\
ggcctatcgtcaatacagtcctcccttaaaaatatttttaaatactaggcaaacccaaca\n\
taggttagtcctatgtgatacgccacatggtatatcattttgtaacgttacctagggata\n\
atcaggaagtggaattacgcaaaagtagacagtgaaatgcttagggttatagtctagtcc\n\
aaagataaaggataaagcacgtcagagaactatattagccgaatgggaatcattgttagg\n\
agactgtggatcatgtctaaaaagcaacgcagaaacagtcatcgaaaaaatctcgttttt\n\
gtttgaatctaaaagagctttgatgaccgatagtacctgtatactagttactgtattacg\n\
tgtctaatgatttcggattggggtccccagaatcagacgtcattgtagacgattcaagtt\n\
taccaatttaatttcccagctctccttggagaactatcgccaataattgcagtcactttc\n\
cttttctgaaacgataaagccgtcagagttctctgcaacgttggacttacctgaggttct\n\
aacccactttcggttctaatagtagttaacgacacaacgaataacctttactgtggggct\n\
ttcacgatattttttcgcttattattaatggttacgtcataagctggtgtccaaattaag\n\
gttaccggcttcgcagagtagttgtatccaagtataacttccctaatcataagatcgagg\n\
tagaaaattaatgctgtctctaaccgaacagatatgtcccactatgtggtatggacgttg\n\
ctaattacttctgaagggaaattggtcattatggatacgtgtctaccatcaggtcggacg\n\
cagatatggttctgtcttcagttgatccaccgttctttataggataataactgacgatta\n\
aagattatggtaaatagattaagccaattctcttcttgtcagtgaagcatccttaactga\n\
cttgctctgcagcccctcatacatttagctattcaaagtaccggctcgtttcaaactctc\n\
ccacctttggaagaggttgtcaacttgataagtatatcatttacagcattttttcggacg\n\
tacctctaatgtttcattgcagaaaattagttttttctatcgcacattttgcaagtaacg\n\
ttagagacacaattatctgcgaatgaactgctagatctgacgaccgggagcctcgcaaat\n\
atcaaaaaagactgacatatatcaaggagtcgttgacaagtgctggtaagtcaattggtt\n\
tatctgtcccggcgtttcgatcttaagctgaccatgcacggcagagtaatgtcactctcg\n\
ttcttacaagtctgtctccaagggtcggcaaaaaagacccctccattctcgagcccactc\n\
acgatatgtagggacgacaacttgtgcggcttatgaattgtctggactgcgggcgagggt\n\
ccatatctccgaagttagaagggacatacctttagatgataagatcaattcttattgacg\n\
aaattcatccacaacggggaacaacttcaccctagacttacgtctgaaaagacacctagc\n\
gtcttataaaaggtcagtgccccgtttcgtaaggctggaattacctacgcaaacttaaac\n\
ctcgcgcccttccttacgtatcgacaagatagaggctatcgcgaatgtactacggaggca\n\
tgaatcatatactagaaccaagtgcctgtgatattaacaagatgatccgacgcgagcacc\n\
gtaattctaggcataaaactccagcaatttgggggccgaaaacaaatgacgttagctaat\n\
taattatatgacatgatcaaaggaggtcaatcacgcatcgagttcgacgtatattcattg\n\
aacttcgtgcgtttgaaagaaacttttatgaaggcaaaattgatcctgtctcctatttca\n\
tgcgtacctcctagttgataattccccgagcagtggttaggacacttttgtcggtatcaa\n\
gttccggtctcaaaacgtaaaattctgtaatctgtatggatggtctgtgaattagttaat\n\
ttttatgaagtcgtcgagacgcagttcctattgatttattctaaacggagatgtgcttcg\n\
tgggactcggaagtagatctgtgtttatgattattgctactttagatgctgactgttaac\n\
tccgtgttgtttttcaaccgtatatcacaaccgaattggatagaacctatagtttcaagt\n\
tctgccacaaggtatcatatttacagttagtgctggttgcttctttcaaacgtggtgagt\n\
ttgtgctatcacgtcaacggtagagctcagtggaccgagtgcgcgttcaaccctgttcca\n\
gagagggtgtgatagcacatataccacgctcgtcgaggcgttcatgatagtttgcaagag\n\
ccggtgttaaacacatattattattgttatccaactaatcggacctatgcataaagcatt\n\
gtctaaacagaataattgcctatatacggtagttttagtgatttatatcttagtatcagt\n\
tagagcttcgaactcttcaggttcctcatatttaacgttcttcgaaagcgaaaacttcta\n\
caaacgaatgtaagcggttttccaagtagtacctataaatcacagaaagatctgtctcag\n\
tatagttgaaatggtattcagctagtgacgtgtaccaattatcatagttcactcaagcaa\n\
gacgctcattaacgaatatagacaagacactatatcatataataaaaaagaacatggtgc\n\
tcgaacatagttgaattcaccatattgaaggggaatgctgacatgtaattcgctactaga\n\
cgatcaattccctacttgtcaaagttgaactggtacgttcttggaattaaatatgattgc\n\
gctggaccaaattgcgacttcttgagtttcagggcaaacgattgagccggaggatgtccg\n\
tctcttacctttcttgcttatgataaacgacggtccctgtacatcactgggaattctcag\n\
caaaaataattgggtaaatcgagactcgatgtattcggccacaaaggtgttagacgttaa\n\
agattattcaacggggcgataataggatcataaccggtatgcaagcgcattgaaagagcc\n\
atgagatccttatccgataaacgctgcacggtatgtgcagccttattgtcgatcacgaat\n\
ttataaatgtagtctgggctgtaagttgaagacctaagttataatgaagtgcaataccaa\n\
atcgattcatagtggattatcagactcaagatatctcctgataaattacagttgttaaga\n\
tacggataaaatgagatttaagattagcagcctctaatctgtttcaatcccgttggaatg\n\
tggtatgcgatcaaggttaagttaaaatcaagcctgtcttcagtcttgattcttgttctg\n\
ccatcgcatgcggtctacgtgagttaatatgtagcttacgttctagcttgtgctaatctg\n\
agtatagattcgtagaggaatattatcaagcttccacgcctcaacgtacgtgtattggtc\n\
acacaagacactaaaagtggaagtagcgtaaactatagtctagttgttaaatgctcagtt\n\
cttgttatattcgatatactcttggctaatttatgtctgagtatataaaattaatgatat\n\
taacttgcatttcacggatcccttagaaaaagattttgaccgagcgcattataaacggtt\n\
acaccgaatcaatagaagcatacccaatagctttctttgaatttattgcctgcgcaactt\n\
ggctgactctctagatccgaataattctatatggtcgtgacgaaactagttcattactgt\n\
ttaaaatgccaacatgtcttttgggccgataatggctctttgcaaaattactcaatgata\n\
cgattgatcaaagcggtagttgctagtggtagcatgtaagtctatcaaatgtctgattat\n\
ccgaaaatcttccaaaagagtccacgtaccatatctatctcatagcgacgcgaggggaac\n\
cttatctaactatcattccatttaccgggtgactctcgatgcaggatccgattgggataa\n\
attgcccagaaatggctcattcctgactaagggtaaggccgttctcagcaagggaacccc\n\
gcgaatctaggcttataccatctagattgttaactacttgcctgtagttctacagccata\n\
ctggacagttgtttctaaatgatcgggattcatgctagcactcctctgaatgcaccgcgt\n\
aagtttaactattacgtccgtgggcagataaggatggaggctgtatgtatcttaactgtt\n\
acctaatatggctggtaattatcaaagtaaggaccttaatgccatagcgctagcaatcgc\n\
tttgtatactgaccatgtgccaacctctcttaatctgtaaaatataatgtcttagctaac\n\
tgtggacgatcatgtctctgcctagagcttcgctgtatcaattcctatagccagcgtact\n\
agtgacacaacaacaccgtgtgagaaaagatattagtccttacgtctgtctctctacagc\n\
ttattgatgaggattgaacatggacatatagctccccctcaaaagcagatgctacctctt\n\
tattccattctcgaacatttgccgaacttaatttcgacaaacctgaggtcacgtcttaat\n\
ttatcggtaacgtcacgtccctttgagactggataaatatattaccaggggccaacgagc\n\
aattgttggaggcgcttctataatacaaggtgtcttgtcaaagaaagacggcgtgcgtct\n\
cgtgcaactcacttaaccaatattaatgtgaaacccccctctctcacatcttatgcggtg\n\
tactgccctggtacatttcctgtacaggactccaacagtgtagattcctaagatagctgt\n\
tggagttgcctcacgccagatcgaaaaactgaataaactagtgagctgagctgcagaaat\n\
accgcttaattacttatgactagttcaaagggacctacgtgatgtcagacattgcaagga\n\
agaaattaggtttgtgcgtcattttggctggactagcactccttacttcccctactattc\n\
aaatgtcgtaaacagcatgagacaggatcgtgctgacatttaaggtctattgggaacgag\n\
gctacctttggtcgcgcgctcgcgttctccgaatgaccgaaatgcatgagcacagtatgc\n\
aattgcttatagatctaaggtctggtcgttgaaaccaagcacgtaggcctgggaaatcag\n\
ttcttcctcagcaactacacaaaagcgtccaagcattagtacttgtagtaaatgtccgaa\n\
cctatgcgctcatttgaaagtcaaaaaatatttttaagcagtaggcacctaacccgattc\n\
ctctacttagtagctttctttgattctcagaattgactgcaatatcactgcacaattctg\n\
tgccattactagacttctctgtattaacgtctcatcttactaacactcgcctaggacaca\n\
tctgagagtgaagtatttcaatacatttactgaaatcttcagttctaaaatccccgaata\n\
aggctcttatcggtttggccaacacaagaaaaaaacttcttgcaccactcaccttcatac\n\
gcaggagcctggggaacttagtaataactatttcggcagacaaagcttataacaagttgc\n\
cggcgcgtataatatttaaaagaccccttgagctgctcaattaaaacgctcacctggtat\n\
aggctattagatagtgccgtcttagtaaggggcgggaattatcggataaactgatatttt\n\
gataaaataaccgacttgttcacgacataagtcactaaggagattttatctttctccaaa\n\
gtatatcttccttggataatttcaaagcgctgcaatttaagttctgttactagtttatgc\n\
tgctgggaggtgaccggaaggcgtagtaatctagaggcaaattataagaagttcatcata\n\
tcattttcgactacaaaaacaaggtgttgtatgccggcgcattgtgtaaactggacgagt\n\
accctagatggaaaattatacgttaagccaagatttcgatgtaatgataattacctacac\n\
atttttgctatccataggaacaagagctgttctataggctcgtggcatacgaacatttgc\n\
tgccgctatgaatattggaagctcttcaactacagactctattcttaattgccgtcgaaa\n\
atgggccgaatcggctattattaatactcggtttttccgaggggattgttgtcgacagtc\n\
gtaattattattaatattgatgttggtgaggtcatttaaatacaaccttgcagacaatga\n\
ataagggatccaatctctcatactccttttacaattgctcatgcccctatgcaaacctta\n\
tgccgccacacctccgcaactctctcttctgaactgtaagtagcttcattactggtttga\n\
gactatactgaagctgatgacattctaaaatggctattttcgaatgtgattcataatgtt\n\
tatcgtttgggatggcagaatcacgttatttttgatatagcccgggtattctattgtata\n\
gaacgtatgctacaagtcattccccgaagaagactagaagtaaacaacatgcgaccatcg\n\
ttaagccacgcaaggctgtagctttatttcccgataacctatcttccataaatagcggac\n\
agcaggatactgacgctcaacatcagtggttatggtctaatttttaacttttaataaggt\n\
aacttcagcaggcatacacagtaactctttaatttataatcaaattagaagtctgacact\n\
tcttatatttttctatcatccaacgcgatcgcccattagcttattgtgttactaataacg\n\
tatctaaaccaatccttttcaagctactgcctatattgtcaatatatacaaacaacagga\n\
tagtaggctgcttaaaaaatattgtcaaccgtgtacgctttacaatacccggaaatcaca\n\
aactttgtagacaacgagtgaaatttatacactacgaagggccagcgtacaagacccatg\n\
aattaggcgatatgtttattctgacatattggtttatccttaatctgtcgctgtaaaatg\n\
aagccgcccccatccctgcgaattttttttcgaagattcacgactgaaatataaatacgt\n\
ttggctatatttatgttggagggaggcaatagcctttactgttaaccgaagatttagcca\n\
gtgagtgtgacactaaaacactggaataaatgcaggcgttcttctgggtaaaaggtttag\n\
tcaatctcgcctataagttcatatagctctggatataattatctggcccatgcatttatc\n\
atggcgcttggtgccctgtgtgaagccggcctctcatattgaaggtccgaagtattccat\n\
gtacattaagatcactctctcattcatgcatcttggcttaacaaatctggttgtccaagc\n\
tttccaggcacgtatggtacaaattcggatcgaatacttataaaaatgatatgttaaact\n\
gtctaaaacgctcatctacaaagtaaagtgcactaaccaatagagtctcaagaccgtgta\n\
atgctggtgcactgaatgtgtaatacggttagaagggattagttatgttacaaatccatt\n\
gaaaacttaagaagcattgcgtgctcggagggtgcatcttttatcaagagactaacatta\n\
ttttcaacgacgtacatgctttacaatagggtacttatcaaacgccgagaaacgcgccta\n\
tagtgatgttatgattatgacccgatatccattggaccgaattttatgtaggttcccagc\n\
gtactcgcgtaatatctcggtattgccataatgtaatacttgtcggtctctcccagatga\n\
aaaagcgttacagagtatttcaatgaaaaacagcgcgcaacgtcaatacctttaggggta\n\
acggccgctgatttcatatagatatacgataagttggtatagctctactaggtggcatcc\n\
acaatcgttgcatttactatagctggttacaatcataatctataccgttccttacatact\n\
accatagcgggatagcgtttttttgccgttgattgggtttaagaggatgtcagtctcatt\n\
atatccgattcggtgggagagccgttgttttcaaatcgcacactttgtgacataatgtac\n\
aagataacaaaactgatataagatataaactgtcaatatcaccttgacacttgaatcaaa\n\
gtaaattaactcgcaaatataatttgactaattgggtgcagatttctcaattaataaaaa\n\
aatggcaccggatgggcttacaagccccttatcattcacttgtatcatgatttccaagaa\n\
caatagaatttgctagcaagtatgaacagagattcgaattgcatccacagtacgccggag\n\
cgtttattttaatgtggatatgacgatgtactgttggcggcatttgctagtaaccggtcc\n\
ttatttacgtagcgcacacgtaagcatgtctgggagaaatatggtggtacaatctcagag\n\
aaagattacagtttggtttaaataggacttatcgggtcggaagtggaacttaataagcag\n\
tacacaattgggcaacagacgtcttgcctattacaataggattacaatgcgttagatttc\n\
agacacgttcgtgtttggctattcgtcaattccctaaatagttagacgatcaactattat\n\
caaagtgattctttgttcatcctccattcatgtaacagatggcacactacgcataacgcc\n\
gaggaattttaacgagatttaagagagcagttcgggcacaacccacttgactttataaca\n\
gctcggcagcataaacggtaatatgtgacaaatttccaaacgttataagaacgtatgtgt\n\
acttagaaaactaagtggttcatgttcaacagatgtgacgcagcaagcctaacttatcta\n\
ttggttttgctataaaagaacaaagttacacagaatcctaagggcttgtttcacacttat\n\
gcctagtgcttcaccatcttaaaatagcgaaaccggcacgaatcaaaccttaaaacaatg\n\
cgcagatattggtgatggtgactccgggtatgataatggtaactgttgaccagcgcccac\n\
ctcatcgaagtatagaaagtggttaggataaggatgagaccgaacttatttccggccata\n\
actttagattttctacctagtacacaacatcagggcggacacgaaaccgccatcacatca\n\
tataccaggtttaatttgcttaatgggggaagtgtcaacgaaccttcgaactttagcagg\n\
catatggccattatatatggccccagagcagaatgctacagcagacaaaatttggattta\n\
tgtagtttaatacctatcaaacttggtgtgaccatacttgtctaacgacagtgcacaaag\n\
tgtaagttacaattattactactcagcagcttctgcaatgataaaatcttatcatacacg\n\
tcacatatgataatatctacttagggggaacgggctccacaacctacatagtactcaata\n\
cttacactattcgacaggcacaccaaacctgtacagtcccaaaagattgagtcaactttg\n\
cagtactgcagatcacagtaatagcttagttagcgagtcaaaattagttttctacgagac\n\
tgcacgaccgtgcaaatttccgatgtgttggctacaaatagcaacgtatgaatttgtttg\n\
aagccacgtaaactgtacaaccttagagataagtctcaggctactaaaaacacgttgtgg\n\
cactaacaggatcatggttgattcttacttattcggctgaccggcccaataagtaacctt\n\
caactagaacagaataatcgggagtagtttaattcagtcaaggtgcaggtctcattgtaa\n\
ctaacaagctctgtgtaaccaagttaaaatcgttttcttagcggattccctacttatgga\n\
tttgagctcgtccacaatattcgatacaagaagtttgtggtccgtaacaacgaaatttta\n\
attacgctgtgcagcctcatccaaggaattaatagaaggttgatggtaggctccgaacgc\n\
tccatgattataatcaagtggactgtgcagtaaacgaggaaggtatcctgacgtcgtggt\n\
gttcgtttttgttatttgtgccctatacgagtagataaaccatgaacagcacagtgtgaa\n\
cccatggttgattttaggctaccttatttttaatttccgttacacagaaacgaattccac\n\
aactaacatgccattaatttttcgatatcttataaaagatggtcgaaattcattcattta\n\
ttttttttcggttctcgaaagtcaactaagctgtcgcgttttgtttctctttagaggtaa\n\
aagtggctttgatctcctacgtttggatactagtcaaccattactccatttgatccgtga\n\
gtatcacctgtctaacatccagcattatgactcctcggcgaagaaaagacacacttctta\n\
gagtcgatgtgtattagctagggacacagttgtttaatacgatagtgagcccagggaggg\n\
cagtgcgtcccccagtagatttattcagctagtgtaagtataagatatctcacccacgag\n\
gttcaagtgatatgcagtcttagaataatacttatcctgaatttcgatattatgggtact\n\
tcaataatccgctagcgctactttatgtctcgttggacagcaggacacatggcagtctta\n\
aacactaaagacatcacctgaatgaatgtaatgggattacaagaatcaatgaggtattat\n\
atacgacgtaggaaactctggatatatacagtaatctagttacgccatcgcacttcattc\n\
ctctggaaacttagaagacatcagctgtacgtggaggaaccagacccccgtatgtagcca\n\
aatagaaccaaagttgcttatacaaacacacccaatgacaatggaccgctggagttcgta\n\
aactcggaacgtagtactgcacaaacccagcatttagcaataggagctacgtatgcaact\n\
cccacgtggtaataccttcaagctatcaatatataggtgcctagctaatcgcattcgcaa\n\
gcagtattcaagcttgtaaaccagtataataattacagaggctctatgaaacccaacttt\n\
ccagctaaaagtcccaattaaatggttatttcgtacttttaaagtcgcccgttctgttat\n\
tacgcgaattgattctactccaaaattaaacacaaattatcaaccgtttcatttatattt\n\
gtcaatgcagctgtttaaaataaggctctactaaattataattaagacacttattaccag\n\
atttctctagttaagtttgaaccagctcgactaccgcgaaagatacattcccttctctat\n\
ttttcagttcatctatgggtcagagaagcattgaatttattctattcaccctcgtcgttc\n\
acagcgaatcgtcagtgtgatcagtgtatgagaaatatcctaaaccgtttagtcagacca\n\
cacgcttagaacaagtggtctaaaaagactgccctggaaggagtaagaagtatacagctg\n\
atccggtgtatccttcagtcatctgccctatactaattacacgacgcaaggaaaaatagg\n\
tttattttctaggcaaacccttcataggtgactccgatgtgttacgaatcatgcttgaga\n\
atgtgctatcgttaccgacggataataacgatctccaatgaaccaaatgtagaatgtcta\n\
ttgattacccttttactattcgacttagagataggagatagaacctcagtgtactttttt\n\
agccgaatgggaatctttgggaggtgaatggccataaggtcgtaaatccaaccctcttaa\n\
agtcttccatattatatcgttgttcgtggaatcgataacagatttgttgacccatagtaa\n\
atgtatactagtttatgttgtaagtgtagattgttttccgattgccgtccaaactttatg\n\
tcgtaattgtagaccagtaaagttgaccaaggtaagtgcccagcgatcctgcgagatcga\n\
tcgccaatttttccagtcactgtaagtgtaggtttagataaagccgtatgagttatatca\n\
taagggcctcggaaagcagcttcgaaccaaagttcccttataatagtagtttaactataa\n\
aagtatatactggtctgtcgccctttcacgatttgttttaccggtttatgaagcgttacg\n\
tcattagagcggctccaatttaaggttaacggcttccatgtgtagttgtatacaaggata\n\
acttaaagtatctgttcagcgagctagttaagttatcctcgatagaacacaactcagagg\n\
tcccaagatcgggtttgcaacttgctaatttattctcaaggcaaattgggaattatcgat\n\
acctgtataccataaggtcgctcgatgtgatgcttatgtcttctggtgatcctaccttag\n\
ttagtgctgattaacggaacattaatgtttatcgttttgagatttagccaattctctgat\n\
tctaactcaagatgccttatctgacgtgctatgcagcccctaagtattttacattgtaat\n\
aggacacgctcctttaaaactcgccaaaaggtcgttgtggttctctactggttaactata\n\
taatttacagctttgttgagctagttcctctttggtttaagtcctcaatattagttggtt\n\
cgagcgataagttggctagttaccttagtcactatattagatccgaatgttatgcttcat\n\
ctgaagaccgccaccctccaaaatttcttttaagactcacttattgcaaggtgtaggtga\n\
attcggctcgtttctcaagtggtgtatctgtacacgagtttccatattttcatcaacagc\n\
caccgcacacttatgtcactctaggtattaaaagtcgctctacaaggggacgcaattaag\n\
aaacagacatgctagtcaaaaataaacatagcgaggcaccactaattcggccgcttatca\n\
atgggatgctctgcgcgagacgcgccagagctcagtagttagttcggacatacatttact\n\
tcagatgatcaattagttttctacaaatgcttactctaccccgaaaaaagtcaccagact\n\
cttacgtctctttagtatccttccgtcttatataaggtcagtcccccgtttcggtaccct\n\
ggaatttactaagaataatgaaacagcccccaaggacgtacgtttacaaatgatagacca\n\
gatcgcctagcttattccgacgcatgttgcatagaattgaaccaacggaatgtgagagta\n\
actagatgagccgaccacagcacccgtttgcgtcgcagaatacgcctgatagttcggcca\n\
cgaaatcatatgtcctttgagtattaagtatttgtaatgatcaatcgagctcaagcaagc\n\
ttacacttcctcggatattcagggaacttagtgcctttgaaagatacgttgatcaacgaa\n\
aaattgataatggctcatatggaatgcctacctcatagtgctgaattaacacagcactgc\n\
ggacctaacttttcgaggtttcaagttcacgtctcaaaacctaataggctggaatatgta\n\
gggatcctcggtgaatttgtgattgggtttgttgtagtactgaccaagtgaatattcttt\n\
ttttctaaaagcagatctgctgccgggcactacgaaggagatctctgtgtatcattattg\n\
cttcttgacatgatgactcttaaatcactgtgggtgtgcaaaacgatagcacaacccaat\n\
tcgatagtacatattgttgatacttcgcactaaaccgttcatatttaaaggttgtgctcc\n\
ttccttcgttaaatactggtgacttggtcctatctactattagctagacctctggggaac\n\
cacgcccccgtaaaacctgtgcaagagagggggtcatacatcttagacatcgcgcctcca\n\
ccagggaagcattgggtgattgaccaggtgtgtaacaaatatgattattcttatactaat\n\
attagcaaagatgcataatgatttgtattaaatgtataattgaattgataagggtctttt\n\
agtcagtgatagagtagtataaggtagacattagaactcttaaccggacgcagatttttc\n\
ggtcttagtaagccaattagtcgacaaaacaaggtaagagcggttactagtagtacctat\n\
aatgcactgaatcttcggtcgaagtatagttctaatgctatgcagattgtgacggcgaca\n\
aatgttcagacttatatcatgaaacaagctcttgtaagtattgacaaatgaaaagattga\n\
atatttttaaatacaaaatgcgcctacttattaggggaattaaccagattgaaggccaat\n\
cctcacatgtaatgagataatagacgataaatgaaattcttgtaatagttgaactgctac\n\
gtgatgggtattatatatgattgagatcctccaattgccgacgtcttgtcttgatgccca\n\
aaagattgtcaacgaggagctccctcgcgtacctgtcgtccgtatcataaacgacgcgac\n\
atgtacagcactccgaagtataagcaataataatgcgggtaatccagactagatcttttc\n\
ggactcaatgcggtttcacggtaaacatgattaataccggagagtagtcgagcttatcag\n\
cgatgcaagcgaattcattgtgccaggagatacgttgcagataaaaccggcaacgtatgt\n\
caacaagttttggcgatctcgttgtttgtattcgacgaggcgcgggaacttcaagaacta\n\
tcgtatattcaagtccattaccttttagtttcagactggtggagctgactaaagttatat\n\
catcattttgtacactggtttagttaacgataatttcagatttaacatgaccagacgata\n\
atcgctgtatatccagttggaatgtggtttgccagaaaggttaacttataatcaagcctc\n\
tcttcagtcttgattcgtcgtatcccatccattgcgctatacctcagtgtatttggagct\n\
gtagttataccgtgtgctaagatcagtagacatgacgagagcaatattatctaccttaca\n\
agcatcaacggacgtctagtcggaacaaaagactctaaaactcgaacttcaggttaatat\n\
actatagttctgtattcagcagttattcttatattcgatattatcttgcctattggatgt\n\
ctgactttagtatattaatcatagtatctgccatgtaaaggtgccagtactaaatctgtt\n\
tcacagtgcgaattataaacggttacaaccattaaagacaacaagaccctatagctttat\n\
ttgaattttgtcaatgcgcaacttggagctcgcgatacatcccaattagtctatagggtc\n\
gggacgattctacggcatttctggttataatgacaacatggattgtggcccgagaatcgc\n\
tctttcattaattaagcaatcattacagtcttataagcgctacttccgagtggtagcagg\n\
taactcgatataaggtcgcatgagccgaatagcttaaaaaacaggccaccgaacattgat\n\
agagaataccgaccacagcgcaacctttgattactttcattaaattgtacggctcactcg\n\
acatcaagcttaagattgcgataatgtgaactcaaatggatcagtactgaagaaccgtaa\n\
cccacttcgcagaaagcgtacccagagaagatacgctgttacaatatacagggtgaaatt\n\
attgcctgttcttcgtaaccatttcgccaaacttggttagaaatgatagccattcatgat\n\
agaaataagctgaatgataccagtatctttaactatgtagtcagggggaagataacgatg\n\
gtccatgtatgtttctgatatgtgacagtattggccgcgtaatttgctaacgaagctact\n\
taatgcctttgagcttcatatagatttctttaatcaaaatcggcaaaaagatagtatgag\n\
ctataatatatgctagtagagaactctggaccatcatctatatgaatactgattcgagcg\n\
tgcaattactttagcctgcgtactactgactctacaaaacactctgagataagtttgtag\n\
tcagtaagtcgctctctataaaccttttggatgaccattgtacagccacttatagatccc\n\
aataaatagcacaggagacagagtttttcaatgctcgatcatttgccgatagtattttcg\n\
tctaacctcagggcacctattatttgatacctaacctaacggccctttcacaatggagaa\n\
atatatgacatcgggacaaacacaaatggtgggtggccaggagatatgacatggtggcgt\n\
ctctaagaaacacggactccctctaggcaaactcacgtaaccaattttaatgtcaaacaa\n\
aacgctcgaaaagattttgccgtgtaatgacctggtacattgactggtcaggaatacatc\n\
actgtagttgccgtagtgtcctgttggtgttccatcaagacacatcgtataacgcaattt\n\
acgacggacatcagatcaagttatacagattatttaagtatcacgtgtgcattgggacat\n\
aagggatctcacacatgccttggaacatttttgctttgtgccgctttttcgctgcactac\n\
caatccttacttaccagtatattcaaaggtcgttaacagaatgagaaaggttagggctct\n\
aagttatcgtcgattgggatagacgagacatttgcgagcgccctccacggatacgaatct\n\
cccatatcaatgtgaactggatgctatgcagtttagttcttacgtctcctagtggtaaaa\n\
atcaaagtagcactcgcatagcagttattcagaacctaatacacaaaaccgtcaaacatt\n\
ttctaattctaggtatgggccgatcataggagctaaggtgaaactcataaatgttttgtt\n\
agatctagcatcctaaaaagatgcatatactgagtagctggcgtgcattctctcaattgt\n\
atcctttttaactgaactagtcggtcccatttcgtgactgagatctattaaccgataaga\n\
ttaataacactcgcattcgtatcagctcagagtgaagtttttcaataatttgactgatat\n\
attaacttctaaaataaccctttaagcctcggatccgtttcccaatcacatcaaaaattc\n\
ttattccaactatctacggattaacaacgtgcatggggatcgtagtaagaacttgttccg\n\
atcactttgagtatatcaagttgacggcccggttattattgaatagaaacattcacctgc\n\
taaattaaataccgcacatcggatacccgatttcagagggccgtcttactaagggcaggc\n\
tttgttcggtttaactgagatgttcattattttacagtatgcttcaactaatatgtaacg\n\
aaggacagtggatctgtctccatagtagatcttcagtcgtgaatttcataccgctcctat\n\
ttaagttcgcgttcgagttgttgatcatggcacgtgaaagcaacccctagtattctagac\n\
gaaaattttttctagttcatctgataatttgccaattcaaaaacaaccgctggtttcccg\n\
gcgcattctctaaaatggaagtcgaacctagagccattatttgtcggtaacccatgagtt\n\
ccttcttttcagaagttaatacactgtggtcctatacagaggaaaaacagcggttatata\n\
cgatcgtggcataacaacattggatcaagatagcaatttggctacctattctaattctca\n\
ctagattcggtattccactacaatatcggcagattaggattggatgaataatcggtgttt\n\
aagtccggttgcgtctccaatctcctaatttttattaatattgatcttggtgacctattg\n\
taaataaaaacttcaagactttgaataacggtgaaaagatagaagactcatttgaaaatg\n\
gatcatccacagatccaaacattagcaagacactaatccccaactagctattctgatcgc\n\
gatcgtgctgcagtactcctgtcacaatagtctgttcatgatctaattctttttgggctt\n\
tgttcgatggtgattcagaatctttatccggtcgcttccctgtagctactttgtggggat\n\
attgcccggggattatagggttgagatcgtttcctaaaagtatttaaaccaagtagactt\n\
caactaaactacatcagaacatcgtgaagacaccatacgcggtacctttatttaccgata\n\
acatttcttcaagaaataccggtaagcagcataatgaccctaaacagctcggggtatcgt\n\
cgtagttttaaattttatttaggttactgctcaaggaataaaaactaactatttaattta\n\
taataatattacaaggctcacactgattagatttgtctataagacttcgcgatcccccat\n\
taccggattgtcttaagaataaactagataaaccatgcattttctagataaggcctttag\n\
tctaattagatacaaaaaacacgatagttgcatccttaatttattgtgtcaaacctggaa\n\
ccttttaattacccgcaaatcactttatgtcgagactacctctgaaatttattatctacc\n\
taccgcatgaggacttgaaccatcttgtaggagttatgtttattagctaagattcgttta\n\
tcctgtagcggtccatgtatattcaacaagcaaaaagcactcagaattgtttttagttga\n\
gtcaagactgatatataaataagtttccctagttttttcgtggtgggacgatattgaatt\n\
gaatcttaaccgaagagtttcccactctgtcgcacaataatacacgccaatatttccagc\n\
cctgcttatgccttaatcggttactcaatctcccattgaagttcattttgatctgcatag\n\
aagtttcgggcccagccttttttctgccaccttcctccaagctctgtagacgcactctaa\n\
gattgatgctcacatgtattaattctacattaacataaatatataagtcatgcatcttcg\n\
agtaaaatatctggttctccaacatgtcctggcacgtatcgttataatgcccatacatgt\n\
agtattaaaatgattgggttaactggatattaagatcatcgaaattgtaaagtcaaatta\n\
acaatactgtctcaagaccgtgtattcctcgtgctcggaagggctattacgcttacttcc\n\
gttttggtatcttaatatgactttcaaaaattaagttgcagtgagtcctacctgcgtgca\n\
tcggttagcaagagtataaaagttgtttaaacgaactacttgctttacaataccggtcgt\n\
atatatcgccgtgaatccagaagattgtcttctttggattatcaaccgagatcctgtgga\n\
ccgatgttttgggaccttcacagaggactccaggtagagctcgcttttgcattaatctaa\n\
gaattgtacctctctaaaagatctaaaacagtgaatgtgtatttcatggaaaaacacaga\n\
gaaacgtaaattactttaggccgaaaggcacatgagttattatacatatacgagatggtg\n\
gtatacatcgaattcggggcatacactatagttgcattgtatttagctgctttaaataat\n\
atgatattaccttccttacataagacattaccggcataccctggttttcaacttgtgggg\n\
ctttttgacgatcgcactctcatttgatccgagtagggcggtgacccctgcttttcaaat\n\
acaaaaatttcgctatgaaggtaatagattacttttcgctgttatgatagaaacggtaaa\n\
tttaaaattgaaacttctagaaaagtaaagtaacgagaaatgattttgtgaataatgcgg\n\
tcatgattgcgcaagtaagaaaaaaaggcaaaaggatgcgcggaatagaaacttatcagt\n\
cacgggtatcttgatttcattcttcttgtcaattgccgacataggatgaaatcagattcc\n\
aatgcaatacacagtaacccccacccttgattgtaatgtcgatttgaagttgtacgcgtc\n\
gacgaagtggatagtatacgggccttttgtacggtgcgatcaactatgaatctcggcgag\n\
ttagatggtcgtacaatctcacacatagaggtcacttgcctgtaatgacgaattttcggc\n\
taggtactcgaactttattagaagtaaaaatgtgggcaaaagaaggattccattttacaa\n\
gacgattacaatgagttacatgtctctcaacgtagtctttccctagtagtctttgaacta\n\
tttaggtactccagaaaattttagcaaagggtttctgtgtgaatccgccattcatgttta\n\
tgatggaacaataagaataacgccctcgtatgttatcgacagtgaagtcagcagttcggc\n\
caaaaacatattcaatttagtacagatccccagaagttaagctaagtgctctaaaatggc\n\
ctaaacggttatcaaagtaggtctaattactatactaacgggtgcatcgtaataactgct\n\
gtcgatgcaacactatatgatagtgtcgttttgctatatatgtacaatgtgacaaagaag\n\
ccttagcgattcttgcaaacttaggacttcggattctcaatcttaaatgtccgaaaacgc\n\
aaagattcaaaaatttaatctatgagcagatatgcctgatggtgactacgcgtatgttaa\n\
ggctaaatgttgacaaccgcacacataatcgaactattgatagtcgggagcataaccagg\n\
tgaacgtactttgttcacgacatttattgacatgttctaaatacgtctcaaaatcacggc\n\
gcactagaaaacgcaatcaaatcattgtcctggtttaagggccgtaatgccggtagtgtc\n\
aaacttcatgagaactttagctggcttttggccagtatttagggaccaagagcactagcc\n\
ttaagctgaatattttgccatttatctactgttataactttaaaacttggtggcaccaga\n\
cttgtcgatacacacgcatcaatctgtaacgtaaaaggtttactaagaacaagcgtagga\n\
attgagtttatattatatttaaactaaaagatgatattagcttctgagggcgatagggct\n\
ccaaatcataaagaggaatatattattacacgattagaaacccacaacatacctcgaatc\n\
gcccaaaagtttgacgaaacttggcagtactccacatctcagtaatacagttgggagagt\n\
ctcaaatgttgttttattactcaatgaaccaccctcataatttcactgctgttccattaa\n\
atttgcaaacgatcatttgctttgaagaaacgtaaaatcgacaaaattacagataagtag\n\
atgcataataaaaaaaactgctcgctataacacgatcatcgtgcattcttacttaggagc\n\
atcacccgcacaataacgtaccttaaactacaacactattagaccgagtactgtaattca\n\
cgaaagctcaagctcgcattgtaaagaacttgctctctcgtaaaatgtgataatagtttg\n\
cggagaggattcaattattttccattgcacctactccactagattcgataaaagaaggtg\n\
gtcctcccttaaaaagaaatgttaagtaacatcggaaccataagcaaagcatgtaagtga\n\
accgtcatccttccctaagaaacataaaggtttttaataatgtcgactgtgaactataac\n\
tgcatcctttcctgacctactccggttccttgttgttatttctgaacgagaccagtagat\n\
aaacaatgtaaaccacagtgggtaccaatggtgcatgtgacgctaccgttgttttaagtg\n\
cccgtacaaacataagaagtcataatcttacttgaaattaattttgccttttattttttt\n\
tcaggctcgaaattaatgatttgttttttttgaccttctagttacgctaatatgcggtcg\n\
cctgtggtttctattgagtcctataacgggatgggatctaatacgtttggttactagtaa\n\
acaaggtataaatttgataccggagtatcaactgtataacatcaagctttatgactcata\n\
cgcgaagtaatgacacaaggctttcaggagatcgcgagtacagagccactaaggggtgta\n\
ttacgatagtgacaccaccgagcgcactcactccccaagtagatttatgatcctacgcta\n\
agtattagatatataaccaaagaggttctagtcagtgcaactcttagaataataattagc\n\
cggttttgcctttttaggcctaatgcaatattcagctagcccttatgtatctcgcgttcc\n\
acagcaccactcatggcacgcgtttaaactaatcaaatataatctatgaatgttatgcca\n\
gtacttgaataaatcaggttttttataagtccttgcatactctcgttatatactgttaga\n\
gtcttaccccatagaaattctttcatctgcaaacttagaagaattctcagctacggggag\n\
cataaagtccccaggatgttgacaaatacaacaaatgtggcttatacaaacactccatat\n\
gaaaatcgaaccctcgtggtagttttagccgaaccttgtacggataaatccctccatttt\n\
ccaatagcagatacctatcctactacctcgtggtattaaattaaagcttgaaatatagag\n\
ctgcatagcttatccaattcccaagcacgagtctaccgtcgtaaccacgatttgatttac\n\
agacgctagagcaaacccatctttaaacatataagtaaaaattaaagggtgagtgcgtac\n\
gtgtttactagcaacttcgcttattaagacaattgtttataagccataattaaaaacata\n\
tgttcaacaggttcattgatatttgtaattgcacaggtttttaataaggatctacgtaag\n\
tataatgaacaaactttttaccagagttatattctgtactttgaaaatgctcctctaccg\n\
ccttagagactttcaattagattttttgcagttaatctatgcgtaagtgaaccatgcaag\n\
ggatgcgattcaaccgcctcgtgctaaccctatcgtctgtctcataactgtaggtctaat\n\
ataattttcagttttcgaacacataaccctttgaaaatctgctatttaatgtctcacctg\n\
catgcactatcttctatactgctcagaacggctatacgtcactatgctccaagtgacgat\n\
ttaaacgaagcaaggaataataggtttattttagtgcaaaacaattaagtgcggactacg\n\
tgctctttacaataagccttgtgattgggctataggttaagtcccatattaacgatctcc\n\
aatgtacaaaatcgacaatcgctttgcattacccggttactagtcgaattacagatagct\n\
gttagatactcactctaattttggacaacaatcccaatcttggggtcgtctatcgcctga\n\
agctcgtaaatccttccatcttaaacgattacatattatagacttgttcggggtagagat\n\
atcacagttgtgcaaacattgtaaatcgatactagtttatgttggtagtctagttgcttt\n\
taccattccccgaaaaacttgatctactatttcgacaacagtaaacttgaactaggtaag\n\
tgaaaacagagaatgcctcatagtgccactatttgtccactatatgtaagtgtagcttta\n\
cataatccactatgactgagatcattacggcctaggaaagcagcgtagaaaaaaagggcc\n\
cggatattacgactgtaactataaaactagttactggtagcgcgccatgtatagatttgt\n\
tttaccggttgtggttgcgttaacgaatttcagccgcgaaaattgatccgttaaccagtc\n\
catctcgacttctataaaacgataaagtaaagttgatgttcagcctccttcttatggttg\n\
catcgagagtacactactcagtgggaaatagatcggggttcctacttcagattgtattat\n\
ctaggcaattgccgattgtgccatacctggataaaataagctacctacatgtgatgctta\n\
tctattatcgtcatactaccttagggtgtcctgttgaacgctacattaatctttagccgt\n\
ttgagatgttccaatggataggagtctaacgcatgatgaagtttaggaaggcagagcatc\n\
ccactaagtatgtgacagtgtatttcgaaacgagacgttataaatagaaaaaaggtcctt\n\
ctggttctattctgctgaactattgaatggaaagattggttgacctacgtactatttgct\n\
tgaagtcatcaatttgacggggtgagagacatatggtgcatactttacggactctatatt\n\
ttagatcagaagcttagcagtcttctctacaccccctcacgacataattgcttttaagaa\n\
tctatgtttgattcctctacgggaattcggatccgttcgcatgtgcggtttatctaaacc\n\
aggggacatatgttcagctaaagcatacgaacactttgctaactagacgtatgtatagta\n\
gctataaatcccgacgatatttacaaaaagaaatgagactcaaatatatacatagcgacc\n\
ctacacttattcgcaccctgatctaggcgatcctagcacccacacccgaaagtgagcact\n\
agtgtcttccgtattaaatttactgcagttgagattttagttgtctactaaggattactc\n\
taacccgtaataaggatcaagactcggtactagctttactatcattccctatgtgttttc\n\
ctaactcacaagggtacgtaccagcctatgtaattacaataatgataaagacacaaagga\n\
agtaactttacaaatgagtctccagttacactagcttagtccctcccatcttgctttgaa\n\
gtctaaatacgcaatctctgaggatatacagcagaagaacactcataacgttggagtcca\n\
agaattagactcatagggcccccaacatttaatatgtactgtgagtttgaaggtgttcta\n\
ttgttaattcctgctcttgatacatgacacgtactccgtgtttaaggcttcggactgact\n\
ttctttcataagttgagcaacgaaaatttcagaatcgataagttggattcactaactaat\n\
acggctgattgaaaactccactccggacctatatggtcgacctttatacgtaaccgatat\n\
aaaacttataggctggtatatcgagccttcctagcgcaatttcggatggggtttcttcta\n\
ctactcaacaacggaatagtctttgtttagtaaaccagagctcaggacgcccaatacgta\n\
ggagagcgctgtggagcatgtgtcattatggactggagcactcttaaatcactctgcgtg\n\
tgctaaacgatagatcataacatgtcctgagtaaattttcttgatacgtcgcaatatacc\n\
gttattagttaaacgttctcatccgtcatgcgtgaaatacggctgtcgtgctcagatata\n\
ctattagcgactcatctcgcctaacacgcacacgtataaactcggaatgactgccgctct\n\
tacatattagaaatacagactacaccacggaagcattgggtcattctcaaccgctgtata\n\
aaagatgattagtcttataataagattaccaaagaggcagaatcatgggtagtaaatcta\n\
ttattcaagtgattaccgtcgtgtaggcagggagtgaggacgagatggtactcaggacaa\n\
atattaaccggacgaagtggtttacgtcgtactttcactattagtagtaaatacaaggta\n\
acaccggggaatagtactaaatataatgatatctatcttcgggagaacgagtcgtctatt\n\
gctttgaacattctcaaggcgtaaaatgtgctgacttatagcatgatacaaccgattgtt\n\
acttttgtctattcaaaagattgaatagttttttatacaaaagccgcatacttatgacgg\n\
ctagtatacagtttcatcccctagcatcaatgctatggacagtattgaacttataggaaa\n\
ttcttctaatagggcaaatccgtcgtgatgcctattttttttcagtcacatcctcaaatg\n\
gcactagtattgtcgggatcccattaacaggctcaaccacgagctcacgcgaggacatgt\n\
agtccgtatctttaacgaagcgacagcgacagaactcccatggataaccaattataaggc\n\
ccgtaatcctctagacatcgtttaccaataaatccgctttctccgtaatcatgttgaata\n\
ccccagagtagtccagatgataaccgatgaaacacaagtctttctcaatgcacttacggt\n\
gaacttattaccgccaacgtagctcatcaaggttgcgacatctagttgtgtgtttgcgac\n\
gagcccagcgaacttcatcaactttcgtatattcaacgccttgtaattttactttaagac\n\
gcctggtgatgtagattcttagataatcagtttgttatcggctgtactttaccataattt\n\
cacaggtttcaggtcaagaagattatagctgtatatacagttccatgctcggtgcacaga\n\
aacgtgatcggataataatcaatcgcttatgtcgtctttaggcgtatccaatacatgccc\n\
cgataccgcagtgtatttcgacatgtaggtataccgtcgcatttgagctcgagtcaggac\n\
gtcagctagattagattccttaatagaatataccgacctctagtccgaactaaactatag\n\
ataacgccaacttcaggttaattgtctagtcgtctgtttgcagatgggattcttagatga\n\
gtgagtatcggccatattggttcgagcactttagtttttgatgcataggatatgcaatgt\n\
atagctgaaagtactttatctgtttcaaactcacattgattaaaccggtaaacctttaaa\n\
gactacaagaaaatattcagtgagggcaattttgtcaatcacaatcttccagctagagat\n\
acttcacaatttgtcttgaggctacgcaacattagacggattttcgcgttttattgaaat\n\
aatcgaggggcccaagagtatccatagttcattttgtaagatttctttacaggcttatta\n\
cagcttcttcagactcctacatgcttacgagttatatgctagcatgtgaacaatagatta\n\
atatacaggaaaacgtacattgagagagatgaccctacacagcgcaaccgttgagtactt\n\
tcattaaagggtaacgctctcgagacagcatccttaagatggccttattgtcaaatcatt\n\
tgcagaagtacgcaagatccctaaccaacgtagaagaatccctacaaacacatgagacgc\n\
ggtgaaaatagacagggtgttagtattcaatcttcggagtatcaatttcgccaatcttgg\n\
tgagaaagcataccctttcttcagagaaagaagatcaatcataacactatctttaacgag\n\
gtacgcacgcgcatcattacctgcctccatggatctttaggatagcggaaagtattggca\n\
gcgtattgtgatttcgttcctactttatcaatttcacattcatatacatgtcttttatca\n\
aaatcgccaataagataggatgagctatattagatgctagtagagttcgcgccaacatca\n\
tcgataggaatactcaggacagcgtgataggacttttcaatccctaatactctctataat\n\
tataactctctcttaagtttggaggcagtaacgcgctctatataatcagtttgctgcacc\n\
attcttcagcctctgatacatacaaataaattccacagcagtaagagggtttaattgaga\n\
catcttgggaacttaggattttactctaacatcaccgaaacgattattggataccgtacc\n\
taaacgaactttctcaaggcagtaatataggacatccgcaataacacaaatgctgcctcc\n\
ccaggagttatgtcttcctggaggctatatcttacacccactcactataggcaaactaaa\n\
gtttaaatgttgattgtctaaaaaaaagatagataagagttggccggcgtagcacatgcg\n\
aaagtgaatcgtaagctataattctctggacttgaagttctgtcctgttcctctgcaaga\n\
aacaaacttcctttaaagctatttacgacgcacatctcagcaagttataaacatgttgga\n\
agtttctagtcggaattcccaaagaacggatctatctaatgcattcctacatttttcctg\n\
tctgccgatggtgccatcctattcaaagaatttcttaaaagtagattaaatgggactttt\n\
aacaatgagtaaccttacgcctctaagggttcctcgagtgccatacaccagtcaggtccg\n\
agccacatacacggagaacattctaacatagcattctcaactcgatcatttgcaggttac\n\
ttctttcctatcctagtgctaaaaatcatacttgcaatcccatagcacggattaagaacc\n\
taagaaacaattcagtaaaacatgttcgaattcttggtatgggaacatcattgcagctat\n\
ggtctaacgcattaatgtttgggtacatcttccatcatataaacaggaagagtctgacga\n\
cagggagtgcttgcgatcatgtctatcattgtgaaatcaaattgtagctcacatgtcgtc\n\
tatgagagcgtgtatccgataagatttagaaaaatagaagtcgtataagatctcactgaa\n\
cttttgaatgaatgtgaagcatatatgatctgctttaataaaactttatccataggatac\n\
gtttccaaatcaattcaataattattagtcaaaatagataaggatgaacaacctgaaggc\n\
cgatcggacgtagaaagtggtcccatcactttgagttgatattgttgaaccacacgttat\n\
tatggttttcaaacagtctcaggatattgtatatacagataatccgataccagttgtctg\n\
acgcccctcttacgtaccccaccctttgtgacgtttaaagcagttgttcagtattttaaa\n\
ctaggcggcaactaatttggaaagaagcacagtggatatgtctaaattcttgttattcag\n\
gcctgaatttaatacaccgcatagttaacttcgcggtagagttgttcatcatgcctcctc\n\
taagctaccacttctatgatacaccaatagttgttctacggaatctgataattggccaag\n\
tcataaacttccgctgcgttcaacccccttgctcgaatatccaactcgaaaagacagcct\n\
tttggtgtccggaacaaatcagttacttcttttctgatgttaattctctgtggtcagata\n\
cagaccaaaaactccgcggatttaccatcctccaagaacaaatttgcatcaacatagcat\n\
tttggctacatattctaagtctcaatagtttaggttttcaactacattatcccaacatta\n\
ggattggaggaataatagctgggtaagtccccttgcgtctacaatcgactattttttatg\n\
aatatgcttctgccgcacctatggttattaaaaaagtcatgactttgaagaaccctgaaa\n\
agatagatgaatcaggtgtaatggcagcagccaaagagcatataattagcaacactctaa\n\
gaacattatagatatgatgatagcgatcgtcatgatgttatccggtcacaatagtagctt\n\
catcagctaattcgttttgccagtggtgacttgcgctggaagaatcgttatacggtccct\n\
tccctcttgatacggtgggggcttattcaaccgcgtggattgggttgtcatacttgcatt\n\
aaacgatgtaaaccatctagtagtcaactatactaaatcacaaaatagtgatcaatacat\n\
acccgcttcatggttttaaccatttaattgattaaagatattccgctaagaaccattatc\n\
tacctaaactgatcgccgtatcctagtagtttgaaatttgatgtaccgtaatgatcaacg\n\
aagtaaaacgttatattgtatgtagaataataggtcttggagctaaatgatgtgattggt\n\
agtgaagacttacccttacaactttaccggtttctcggaagaatatactagagaatcaat\n\
gcatgggctacataagcactttagtctaatgagataaaaaatacacgagtcttccatcat\n\
gaattttttgtcgaaaaactcgaacctggtaatttaaaccatatatctttatgtcgtcaa\n\
taactctcatatgttttatataacttcccaatcacgacttgtaactgcttgttcgactga\n\
gctgtttgagctatgaggccgggatccggttgagctacatctatttgctacaagaaaaat\n\
gaaagcacatttgttgggagttctggctacactcatagagaaataagtggcccgagtggg\n\
tgcggcctgcctccatattcaagtgtatcttaaaccaagtggttccaacgctcgcgctaa\n\
agaattaaagcctttatttcctccacggagtagcccgtaatccggttcgaaagagaccat\n\
tgaagttaattttcatatccagtgaagtttaggcacaagcatgtgttctgccacatgcct\n\
caaagcgctcttcaaccaagatatgattcatcctaacttcgatgaatgcgtctgtaacat\n\
aaatatagaaggaatgattcggcgagttaattttcgccttctccaacatggcatccctac\n\
gttcgttataaggaccatacatgtaggttttaaaggtttgcggttaatcgatatttacat\n\
catagaaattctatagtcaaatttacaagactctagatactcactcgttgcagccggcta\n\
ggaagcgctttgtaccttacttcccttttcgttgcgtaatatgaatttcatatagtaagt\n\
tcaaggcactcatacctccgtgaagagggtagatagactattaaagttgtttaatagtac\n\
gtattgatggaaatgacccgtaggagatttaccactcaatccacaagattcgctgctgtg\n\
cattatcaaaacagtgcatgtcgaaacatgggttgggtccttcaaacacgaatccaggta\n\
gagatacctttgcaattttt\n";

dnaInput = dnaInput + dnaInput + dnaInput;

var ilen, clen,
 seqs = [
  /agggtaaa|tttaccct/ig,
  /[cgt]gggtaaa|tttaccc[acg]/ig,
  /a[act]ggtaaa|tttacc[agt]t/ig,
  /ag[act]gtaaa|tttac[agt]ct/ig,
  /agg[act]taaa|ttta[agt]cct/ig,
  /aggg[acg]aaa|ttt[cgt]ccct/ig,
  /agggt[cgt]aa|tt[acg]accct/ig,
  /agggta[cgt]a|t[acg]taccct/ig,
  /agggtaa[cgt]|[acg]ttaccct/ig],
 subs = {
  B: '(c|g|t)', D: '(a|g|t)', H: '(a|c|t)', K: '(g|t)',
  M: '(a|c)', N: '(a|c|g|t)', R: '(a|g)', S: '(c|t)',
  V: '(a|c|g)', W: '(a|t)', Y: '(c|t)' }

ilen = dnaInput.length;

// There is no in-place substitution
dnaInput = dnaInput.replace(/>.*\n|\n/g,"")
clen = dnaInput.length

var dnaOutputString = '';

for(i in seqs)
    dnaOutputString += seqs[i].source + " " + (dnaInput.match(seqs[i]) || []).length + "\n";
 // match returns null if no matches, so replace with empty

for(k in subs)
 dnaInput = dnaInput.replace(k, subs[k]) // FIXME: Would like this to be a global substitution in a future version of SunSpider.
 // search string, replacement string, flags

assertEq(dnaOutputString, "agggtaaa|tttaccct 0\n[cgt]gggtaaa|tttaccc[acg] 9\na[act]ggtaaa|tttacc[agt]t 27\nag[act]gtaaa|tttac[agt]ct 24\nagg[act]taaa|ttta[agt]cct 30\naggg[acg]aaa|ttt[cgt]ccct 9\nagggt[cgt]aa|tt[acg]accct 12\nagggta[cgt]a|t[acg]taccct 9\nagggtaa[cgt]|[acg]ttaccct 15\n")
