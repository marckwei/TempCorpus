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

// |jit-test| allow-oom

// Basic tests around creating and linking memories with i64 indices

const MaxMemory64Field = 0x1_0000_0000_0000; // pages
const MaxUint32 = 0xFFFF_FFFF;

// test the validity of different i64 memory types in validation, compilation,
// and the JS-API.
function memoryTypeModuleText(shared, initial, max) {
  return `(module
            (memory i64 ${initial} ${max !== undefined ? max : ''} ${shared ? `shared` : ''}))`;
}
function memoryTypeDescriptor(shared, initial, max) {
  return {
    // TODO: "index" is not yet part of the spec
    // https://github.com/WebAssembly/memory64/issues/24
    index: 'i64',
    initial,
    maximum: max,
    shared,
  };
}
function validMemoryType(shared, initial, max) {
  wasmValidateText(memoryTypeModuleText(shared, initial, max));
  wasmEvalText(memoryTypeModuleText(shared, initial, max));
  // TODO: JS-API cannot specify pages above UINT32_MAX
  // https://github.com/WebAssembly/memory64/issues/24
  new WebAssembly.Memory(memoryTypeDescriptor(shared, initial, max));
}
function invalidMemoryType(shared, initial, max, compileMessage, jsMessage) {
  wasmFailValidateText(memoryTypeModuleText(shared, initial, max), compileMessage);
  assertErrorMessage(() => wasmEvalText(memoryTypeModuleText(shared, initial, max)), WebAssembly.CompileError, compileMessage);
  // TODO: JS-API cannot specify pages above UINT32_MAX
  // https://github.com/WebAssembly/memory64/issues/24
  assertErrorMessage(() => new WebAssembly.Memory(memoryTypeDescriptor(shared, initial, max)), Error, jsMessage);
}

// valid to define a memory with i64
validMemoryType(false, 0);
// valid to define max with i64
validMemoryType(false, 0, 1);
// invalid for min to be greater than max with i64
invalidMemoryType(false, 2, 1, /minimum must not be greater than maximum/, /bad Memory maximum size/);
// valid to define shared memory with max with i64
validMemoryType(true, 1, 2);
// invalid to define shared memory without max with i64
invalidMemoryType(true, 1, undefined, /maximum length required for shared memory/, /maximum is not specified/);

// test the limits of memory64
validMemoryType(false, 0, MaxMemory64Field);
invalidMemoryType(false, 0, MaxMemory64Field + 1, /maximum memory size too big/, /bad Memory maximum/);
validMemoryType(true, 0, MaxMemory64Field);
invalidMemoryType(true, 0, MaxMemory64Field + 1, /maximum memory size too big/, /bad Memory maximum/);

// test that linking requires index types to be equal
function testLink(importedIndexType, importIndexType) {
  let imported = new WebAssembly.Memory({
    // TODO: "index" is not yet part of the spec
    // https://github.com/WebAssembly/memory64/issues/24
    index: importedIndexType,
    initial: 0,
  });
  let testModule =
      `(module
         (memory (import "" "imported") ${importIndexType} 0))`;
  if (importedIndexType === importIndexType) {
    wasmEvalText(testModule, {"": {imported}});
  } else {
    assertErrorMessage(() => wasmEvalText(testModule, {"": {imported}}), WebAssembly.LinkError, /index type/);
  }
}

var memTypes = [
    ['i64', 'i64'],
    ['i32', 'i32'],
    ['i64', 'i32'],
    ['i32', 'i64']];

for ( let [a,b] of memTypes ) {
    testLink(a, b);
}

// Active data segments use the index type for the init expression

for ( let [memType,exprType] of memTypes ) {
    assertEq(WebAssembly.validate(wasmTextToBinary(`
(module
  (memory ${memType} 1)
  (data (${exprType}.const 0) "abcde"))`)), memType == exprType);
}

// Validate instructions using 32/64-bit pointers in 32/64-bit memories.

var validOffsets = {i32: ['', 'offset=0x10000000'],
                    i64: ['', 'offset=0x10000000', 'offset=0x200000000']}

// Basic load/store
for (let [memType, ptrType] of memTypes ) {
    for (let offs of validOffsets[memType]) {
        assertEq(WebAssembly.validate(wasmTextToBinary(`
(module
  (memory ${memType} 1)
  (func (param $p ${ptrType}) (param $i i32) (param $l i64) (param $f f32) (param $d f64)
    (drop (i32.add (i32.const 1) (i32.load8_s ${offs} (local.get $p))))
    (drop (i32.add (i32.const 1) (i32.load8_u ${offs} (local.get $p))))
    (drop (i32.add (i32.const 1) (i32.load16_s ${offs} (local.get $p))))
    (drop (i32.add (i32.const 1) (i32.load16_u ${offs} (local.get $p))))
    (drop (i32.add (i32.const 1) (i32.load ${offs} (local.get $p))))
    (i32.store8 ${offs} (local.get $p) (local.get $i))
    (i32.store16 ${offs} (local.get $p) (local.get $i))
    (i32.store ${offs} (local.get $p) (local.get $i))
    (drop (i64.add (i64.const 1) (i64.load8_s ${offs} (local.get $p))))
    (drop (i64.add (i64.const 1) (i64.load8_u ${offs} (local.get $p))))
    (drop (i64.add (i64.const 1) (i64.load16_s ${offs} (local.get $p))))
    (drop (i64.add (i64.const 1) (i64.load16_u ${offs} (local.get $p))))
    (drop (i64.add (i64.const 1) (i64.load32_s ${offs} (local.get $p))))
    (drop (i64.add (i64.const 1) (i64.load32_u ${offs} (local.get $p))))
    (drop (i64.add (i64.const 1) (i64.load ${offs} (local.get $p))))
    (i64.store8 ${offs} (local.get $p) (local.get $l))
    (i64.store16 ${offs} (local.get $p) (local.get $l))
    (i64.store32 ${offs} (local.get $p) (local.get $l))
    (i64.store ${offs} (local.get $p) (local.get $l))
    (drop (f32.add (f32.const 1) (f32.load ${offs} (local.get $p))))
    (f32.store ${offs} (local.get $p) (local.get $f))
    (drop (f64.add (f64.const 1) (f64.load ${offs} (local.get $p))))
    (f64.store ${offs} (local.get $p) (local.get $d))
))`)), memType == ptrType);
    }
}

// Bulk memory operations
for (let [memType, ptrType] of memTypes ) {
    assertEq(WebAssembly.validate(wasmTextToBinary(`
(module
  (memory ${memType} 1)
  (data $seg "0123456789abcdef")
  (func (param $p ${ptrType})
    (drop (${ptrType}.add (${ptrType}.const 1) (memory.size)))
    (drop (${ptrType}.add (${ptrType}.const 1) (memory.grow (${ptrType}.const 1))))
    (memory.copy (local.get $p) (${ptrType}.const 0) (${ptrType}.const 628))
    (memory.fill (local.get $p) (i32.const 37) (${ptrType}.const 1024))
    (memory.init $seg (local.get $p) (i32.const 3) (i32.const 5))
))`)), memType == ptrType);
}

// SIMD
if (wasmSimdEnabled()) {
    for (let [memType, ptrType] of memTypes ) {
        for (let offs of validOffsets[memType]) {
            assertEq(WebAssembly.validate(wasmTextToBinary(`
(module
  (memory ${memType} 1)
  (func (param $p ${ptrType}) (param $v v128) (param $w v128)
    (drop (i8x16.add (local.get $w) (v128.load ${offs} (local.get $p))))
    (v128.store ${offs} (local.get $p) (local.get $v))
    (drop (i8x16.add (local.get $w) (v128.load8_splat ${offs} (local.get $p))))
    (drop (i8x16.add (local.get $w) (v128.load16_splat ${offs} (local.get $p))))
    (drop (i8x16.add (local.get $w) (v128.load32_splat ${offs} (local.get $p))))
    (drop (i8x16.add (local.get $w) (v128.load64_splat ${offs} (local.get $p))))
    (drop (i8x16.add (local.get $w) (v128.load32_zero ${offs} (local.get $p))))
    (drop (i8x16.add (local.get $w) (v128.load64_zero ${offs} (local.get $p))))
    (drop (i8x16.add (local.get $w) (v128.load8_lane ${offs} 1 (local.get $p) (local.get $v))))
    (drop (i8x16.add (local.get $w) (v128.load16_lane ${offs} 1 (local.get $p) (local.get $v))))
    (drop (i8x16.add (local.get $w) (v128.load32_lane ${offs} 1 (local.get $p) (local.get $v))))
    (drop (i8x16.add (local.get $w) (v128.load64_lane ${offs} 1 (local.get $p) (local.get $v))))
    (v128.store8_lane ${offs} 1 (local.get $p) (local.get $v))
    (v128.store16_lane ${offs} 1 (local.get $p) (local.get $v))
    (v128.store32_lane ${offs} 1 (local.get $p) (local.get $v))
    (v128.store64_lane ${offs} 1 (local.get $p) (local.get $v))
    (drop (i8x16.add (local.get $w) (v128.load8x8_s ${offs} (local.get $p))))
    (drop (i8x16.add (local.get $w) (v128.load8x8_u ${offs} (local.get $p))))
    (drop (i8x16.add (local.get $w) (v128.load16x4_s ${offs} (local.get $p))))
    (drop (i8x16.add (local.get $w) (v128.load16x4_u ${offs} (local.get $p))))
    (drop (i8x16.add (local.get $w) (v128.load32x2_s ${offs} (local.get $p))))
    (drop (i8x16.add (local.get $w) (v128.load32x2_u ${offs} (local.get $p))))
))`)), memType == ptrType);
        }
    }
}

// Threads
if (wasmThreadsEnabled()) {
    for (let [memType, ptrType] of memTypes ) {
        for (let offs of validOffsets[memType]) {
            assertEq(WebAssembly.validate(wasmTextToBinary(`
(module
  (memory ${memType} 1 100 shared)
  (func (param $p ${ptrType}) (param $i i32) (param $l i64)
    (drop (i32.add (i32.const 1) (memory.atomic.wait32 ${offs} (local.get $p) (i32.const 0) (i64.const 37))))
    (drop (i32.add (i32.const 1) (memory.atomic.wait64 ${offs} (local.get $p) (i64.const 0) (i64.const 37))))
    (drop (i32.add (i32.const 1) (memory.atomic.notify ${offs} (local.get $p) (i32.const 1))))
))`)), memType == ptrType);

            for (let [ty,size,sx] of
                 [['i32','','','',],['i32','8','_u'],['i32','16','_u'],
                  ['i64','',''],['i64','8','_u'],['i64','16','_u'],['i64','32','_u']]) {
                assertEq(WebAssembly.validate(wasmTextToBinary(`
(module
  (memory ${memType} 1 100 shared)
  (func (param $p ${ptrType}) (param $vi32 i32) (param $vi64 i64)
    (drop (${ty}.add (${ty}.const 1) (${ty}.atomic.load${size}${sx} ${offs} (local.get $p))))
    (${ty}.atomic.store${size} ${offs} (local.get $p) (local.get $v${ty}))
    (drop (${ty}.add (${ty}.const 1) (${ty}.atomic.rmw${size}.add${sx} ${offs} (local.get $p) (local.get $v${ty}))))
    (drop (${ty}.add (${ty}.const 1) (${ty}.atomic.rmw${size}.sub${sx} ${offs} (local.get $p) (local.get $v${ty}))))
    (drop (${ty}.add (${ty}.const 1) (${ty}.atomic.rmw${size}.and${sx} ${offs} (local.get $p) (local.get $v${ty}))))
    (drop (${ty}.add (${ty}.const 1) (${ty}.atomic.rmw${size}.or${sx} ${offs} (local.get $p) (local.get $v${ty}))))
    (drop (${ty}.add (${ty}.const 1) (${ty}.atomic.rmw${size}.xor${sx} ${offs} (local.get $p) (local.get $v${ty}))))
    (drop (${ty}.add (${ty}.const 1) (${ty}.atomic.rmw${size}.xchg${sx} ${offs} (local.get $p) (local.get $v${ty}))))
    (drop (${ty}.add (${ty}.const 1) (${ty}.atomic.rmw${size}.cmpxchg${sx} ${offs} (local.get $p) (local.get $v${ty}) (${ty}.const 37))))
))`)), memType == ptrType);
            }

        }
    }
}

// Cursorily check that invalid offsets are rejected.

assertEq(WebAssembly.validate(wasmTextToBinary(`
(module
  (memory i32 1)
  (func (param $p i32)
    (drop (i32.load offset=0x100000000 (local.get $p)))))`)), false);


// For Memory64, any valid wat-syntaxed offset is valid.

assertEq(WebAssembly.validate(wasmTextToBinary(`
(module
  (memory i64 1)
  (func (param $p i64)
    (drop (i32.load offset=0x1000000000000 (local.get $p)))))`)), true);


///////////////////////////////////////////////////////////////////////////////
//
// EXECUTION

// Smoketest: Can we actually allocate a memory larger than 4GB?

if (getBuildConfiguration()["pointer-byte-size"] == 8) {
    // TODO: "index" is not yet part of the spec
    // https://github.com/WebAssembly/memory64/issues/24

    try {
        new WebAssembly.Memory({index:"i64", initial:65536 * 1.5, maximum:65536 * 2});
    } catch (e) {
        // OOM is OK.
        if (!(e instanceof WebAssembly.RuntimeError) || !String(e).match(/too many memory pages/)) {
            throw e;
        }
    }
}

// JS-API

if (WebAssembly.Function) {
    // TODO: "index" is not yet part of the spec
    // TODO: values outside the u32 range are not yet part of the spec
    // https://github.com/WebAssembly/memory64/issues/24

    let m64 = new WebAssembly.Memory({index:"i64", initial:1});
    assertEq(m64.type().index, "i64");

    let m32 = new WebAssembly.Memory({initial:1});
    assertEq(m32.type().index, "i32");

    let ins = new WebAssembly.Instance(new WebAssembly.Module(wasmTextToBinary(`
(module
  (memory (export "mem") i64 1 0x100000000))`)));
    assertEq(ins.exports.mem.type().minimum, 1);
    assertEq(ins.exports.mem.type().maximum, 0x100000000);
}

// Instructions

const SMALL = 64;  // < offsetguard everywhere
const BIG = 131072;  // > offsetguard on 32-bit
const HUGE = 2147483656; // > offsetguard on 64-bit
const VAST = 0x112001300;   // > 4GB

function makeTest(LOC, INITIAL, MAXIMUM, SHARED) {
    const v128Prefix =
` (func $stash (param v128)
    (v128.store (i64.const 0) (local.get 0)))

  (func $unstash (result v128)
    (v128.load (i64.const 0)))
`;

    const readV128Code =
` (func (export "readv128@0") (param $p i64)
    (call $stash (v128.load (local.get $p))))

  (func (export "readv128@small") (param $p i64)
    (call $stash (v128.load offset=${SMALL} (local.get $p))))

  (func (export "readv128@big") (param $p i64)
    (call $stash (v128.load offset=${BIG} (local.get $p))))

  (func (export "readv128@huge") (param $p i64)
    (call $stash (v128.load offset=${HUGE} (local.get $p))))

  (func (export "readv128/const@0")
    (call $stash (v128.load (i64.const ${LOC}))))

  (func (export "readv128/const@small")
    (call $stash (v128.load offset=${SMALL} (i64.const ${LOC}))))

  (func (export "readv128/const@big")
    (call $stash (v128.load offset=${BIG} (i64.const ${LOC}))))

  (func (export "v128.load_splat@small") (param $p i64)
    (call $stash (v128.load32_splat offset=${SMALL} (local.get $p))))

  (func (export "v128.load_zero@small") (param $p i64)
    (call $stash (v128.load32_zero offset=${SMALL} (local.get $p))))

  (func (export "v128.load_extend@small") (param $p i64)
    (call $stash (v128.load32x2_u offset=${SMALL} (local.get $p))))

  (func (export "v128.load_lane@small") (param $p i64)
    (call $stash (v128.load32_lane offset=${SMALL} 2 (local.get $p) (call $unstash))))
`;

    const writeV128Code =
` (func (export "writev128@0") (param $p i64)
    (v128.store (local.get $p) (call $unstash)))

  (func (export "writev128@small") (param $p i64)
    (v128.store offset=${SMALL} (local.get $p) (call $unstash)))

  (func (export "writev128@big") (param $p i64)
    (v128.store offset=${BIG} (local.get $p) (call $unstash)))

  (func (export "writev128@huge") (param $p i64)
    (v128.store offset=${HUGE} (local.get $p) (call $unstash)))

  (func (export "writev128/const@0")
    (v128.store (i64.const ${LOC}) (call $unstash)))

  (func (export "writev128/const@small")
    (v128.store offset=${SMALL} (i64.const ${LOC}) (call $unstash)))

  (func (export "writev128/const@big")
    (v128.store offset=${BIG} (i64.const ${LOC}) (call $unstash)))

  (func (export "v128.store_lane@small") (param $p i64)
    (v128.store32_lane offset=${SMALL} 2 (local.get $p) (call $unstash)))
`;

    const ins = wasmEvalText(`
(module
  (memory (export "mem") i64 ${INITIAL} ${MAXIMUM} ${SHARED})

  ;; About the test cases: there are various optimizations in the engine
  ;; for different shapes of a pointer+offset.  Constant pointers are
  ;; resolved early; large offsets are folded early using explicit code
  ;; with an overflow check (but "large" depends on 32-bit vs 64-bit);
  ;; wait/notify fold offsets early regardless; zero offsets lead to
  ;; tighter code with variable pointers; and don't get me started on
  ;; alignment checks.  These test cases are not exhaustive but aim
  ;; to test at least some things.

  ;; TODO: more sizes for all operations, though this is not critical
  ;; TODO: sign extending loads, again not critical

  ${wasmSimdEnabled() ? v128Prefix : ""}

  ;; Read i32
  (func (export "readi32@0") (param $p i64) (result i32)
    (i32.load (local.get $p)))

  (func (export "readi32@small") (param $p i64) (result i32)
    (i32.load offset=${SMALL} (local.get $p)))

  (func (export "readi32@big") (param $p i64) (result i32)
    (i32.load offset=${BIG} (local.get $p)))

  (func (export "readi32@huge") (param $p i64) (result i32)
    (i32.load offset=${HUGE} (local.get $p)))

  (func (export "readi32@vast") (param $p i64) (result i32)
    (i32.load offset=${VAST} (local.get $p)))

  (func (export "readi32/const@0") (result i32)
    (i32.load (i64.const ${LOC})))

  (func (export "readi32/const@small") (result i32)
    (i32.load offset=${SMALL} (i64.const ${LOC})))

  (func (export "readi32/const@big") (result i32)
    (i32.load offset=${BIG} (i64.const ${LOC})))

  (func (export "readi32/const@vast") (result i32)
    (i32.load offset=${VAST} (i64.const ${LOC})))

  ;; Read i64
  (func (export "readi64@0") (param $p i64) (result i64)
    (i64.load (local.get $p)))

  (func (export "readi64@small") (param $p i64) (result i64)
    (i64.load offset=${SMALL} (local.get $p)))

  (func (export "readi64@big") (param $p i64) (result i64)
    (i64.load offset=${BIG} (local.get $p)))

  (func (export "readi64@huge") (param $p i64) (result i64)
    (i64.load offset=${HUGE} (local.get $p)))

  (func (export "readi64@vast") (param $p i64) (result i64)
    (i64.load offset=${VAST} (local.get $p)))

  (func (export "readi64/const@0") (result i64)
    (i64.load (i64.const ${LOC})))

  (func (export "readi64/const@small") (result i64)
    (i64.load offset=${SMALL} (i64.const ${LOC})))

  (func (export "readi64/const@big") (result i64)
    (i64.load offset=${BIG} (i64.const ${LOC})))

  (func (export "readi64/const@vast") (result i64)
    (i64.load offset=${VAST} (i64.const ${LOC})))

  ;; Read v128
  ${wasmSimdEnabled() ? readV128Code : ""}

  ;; write i32
  (func (export "writei32@0") (param $p i64) (param $v i32)
    (i32.store (local.get $p) (local.get $v)))

  (func (export "writei32@small") (param $p i64) (param $v i32)
    (i32.store offset=${SMALL} (local.get $p) (local.get $v)))

  (func (export "writei32@big") (param $p i64) (param $v i32)
    (i32.store offset=${BIG} (local.get $p) (local.get $v)))

  (func (export "writei32@huge") (param $p i64) (param $v i32)
    (i32.store offset=${HUGE} (local.get $p) (local.get $v)))

  (func (export "writei32@vast") (param $p i64) (param $v i32)
    (i32.store offset=${VAST} (local.get $p) (local.get $v)))

  (func (export "writei32/const@0") (param $v i32)
    (i32.store (i64.const ${LOC}) (local.get $v)))

  (func (export "writei32/const@small") (param $v i32)
    (i32.store offset=${SMALL} (i64.const ${LOC}) (local.get $v)))

  (func (export "writei32/const@big") (param $v i32)
    (i32.store offset=${BIG} (i64.const ${LOC}) (local.get $v)))

  (func (export "writei32/const@vast") (param $v i32)
    (i32.store offset=${VAST} (i64.const ${LOC}) (local.get $v)))

  ;; write i64
  (func (export "writei64@0") (param $p i64) (param $v i64)
    (i64.store (local.get $p) (local.get $v)))

  (func (export "writei64@small") (param $p i64) (param $v i64)
    (i64.store offset=${SMALL} (local.get $p) (local.get $v)))

  (func (export "writei64@big") (param $p i64) (param $v i64)
    (i64.store offset=${BIG} (local.get $p) (local.get $v)))

  (func (export "writei64@huge") (param $p i64) (param $v i64)
    (i64.store offset=${HUGE} (local.get $p) (local.get $v)))

  (func (export "writei64@vast") (param $p i64) (param $v i64)
    (i64.store offset=${VAST} (local.get $p) (local.get $v)))

  (func (export "writei64/const@0") (param $v i64)
    (i64.store (i64.const ${LOC}) (local.get $v)))

  (func (export "writei64/const@small") (param $v i64)
    (i64.store offset=${SMALL} (i64.const ${LOC}) (local.get $v)))

  (func (export "writei64/const@big") (param $v i64)
    (i64.store offset=${BIG} (i64.const ${LOC}) (local.get $v)))

  (func (export "writei64/const@vast") (param $v i64)
    (i64.store offset=${VAST} (i64.const ${LOC}) (local.get $v)))

  ;; Read v128
  ${wasmSimdEnabled() ? writeV128Code : ""}

  ;; Atomic read i32

  (func (export "areadi32@0") (param $p i64) (result i32)
    (i32.atomic.load (local.get $p)))

  (func (export "areadi32@small") (param $p i64) (result i32)
    (i32.atomic.load offset=${SMALL} (local.get $p)))

  (func (export "areadi32@big") (param $p i64) (result i32)
    (i32.atomic.load offset=${BIG} (local.get $p)))

  (func (export "areadi32@huge") (param $p i64) (result i32)
    (i32.atomic.load offset=${HUGE} (local.get $p)))

  (func (export "areadi32@vast") (param $p i64) (result i32)
    (i32.atomic.load offset=${VAST} (local.get $p)))

  (func (export "areadi32/const@0") (result i32)
    (i32.atomic.load (i64.const ${LOC})))

  (func (export "areadi32/const@small") (result i32)
    (i32.atomic.load offset=${SMALL} (i64.const ${LOC})))

  (func (export "areadi32/const@big") (result i32)
    (i32.atomic.load offset=${BIG} (i64.const ${LOC})))

  (func (export "areadi32/const@vast") (result i32)
    (i32.atomic.load offset=${VAST} (i64.const ${LOC})))

  ;; Atomic read i64

  (func (export "areadi64@0") (param $p i64) (result i64)
    (i64.atomic.load (local.get $p)))

  (func (export "areadi64@small") (param $p i64) (result i64)
    (i64.atomic.load offset=${SMALL} (local.get $p)))

  (func (export "areadi64@big") (param $p i64) (result i64)
    (i64.atomic.load offset=${BIG} (local.get $p)))

  (func (export "areadi64@huge") (param $p i64) (result i64)
    (i64.atomic.load offset=${HUGE} (local.get $p)))

  (func (export "areadi64@vast") (param $p i64) (result i64)
    (i64.atomic.load offset=${VAST} (local.get $p)))

  (func (export "areadi64/const@0") (result i64)
    (i64.atomic.load (i64.const ${LOC})))

  (func (export "areadi64/const@small") (result i64)
    (i64.atomic.load offset=${SMALL} (i64.const ${LOC})))

  (func (export "areadi64/const@big") (result i64)
    (i64.atomic.load offset=${BIG} (i64.const ${LOC})))

  (func (export "areadi64/const@vast") (result i64)
    (i64.atomic.load offset=${VAST} (i64.const ${LOC})))

  ;; Atomic write i32

  (func (export "awritei32@0") (param $p i64) (param $v i32)
    (i32.atomic.store (local.get $p) (local.get $v)))

  (func (export "awritei32@small") (param $p i64) (param $v i32)
    (i32.atomic.store offset=${SMALL} (local.get $p) (local.get $v)))

  (func (export "awritei32@big") (param $p i64) (param $v i32)
    (i32.atomic.store offset=${BIG} (local.get $p) (local.get $v)))

  (func (export "awritei32@huge") (param $p i64) (param $v i32)
    (i32.atomic.store offset=${HUGE} (local.get $p) (local.get $v)))

  (func (export "awritei32@vast") (param $p i64) (param $v i32)
    (i32.atomic.store offset=${VAST} (local.get $p) (local.get $v)))

  (func (export "awritei32/const@0") (param $v i32)
    (i32.atomic.store (i64.const ${LOC}) (local.get $v)))

  (func (export "awritei32/const@small") (param $v i32)
    (i32.atomic.store offset=${SMALL} (i64.const ${LOC}) (local.get $v)))

  (func (export "awritei32/const@big") (param $v i32)
    (i32.atomic.store offset=${BIG} (i64.const ${LOC}) (local.get $v)))

  (func (export "awritei32/const@vast") (param $v i32)
    (i32.atomic.store offset=${VAST} (i64.const ${LOC}) (local.get $v)))

  ;; Atomic write i64

  (func (export "awritei64@0") (param $p i64) (param $v i64)
    (i64.atomic.store (local.get $p) (local.get $v)))

  (func (export "awritei64@small") (param $p i64) (param $v i64)
    (i64.atomic.store offset=${SMALL} (local.get $p) (local.get $v)))

  (func (export "awritei64@big") (param $p i64) (param $v i64)
    (i64.atomic.store offset=${BIG} (local.get $p) (local.get $v)))

  (func (export "awritei64@huge") (param $p i64) (param $v i64)
    (i64.atomic.store offset=${HUGE} (local.get $p) (local.get $v)))

  (func (export "awritei64@vast") (param $p i64) (param $v i64)
    (i64.atomic.store offset=${VAST} (local.get $p) (local.get $v)))

  (func (export "awritei64/const@0") (param $v i64)
    (i64.atomic.store (i64.const ${LOC}) (local.get $v)))

  (func (export "awritei64/const@small") (param $v i64)
    (i64.atomic.store offset=${SMALL} (i64.const ${LOC}) (local.get $v)))

  (func (export "awritei64/const@big") (param $v i64)
    (i64.atomic.store offset=${BIG} (i64.const ${LOC}) (local.get $v)))

  (func (export "awritei64/const@vast") (param $v i64)
    (i64.atomic.store offset=${VAST} (i64.const ${LOC}) (local.get $v)))

  ;; xchg i32

  (func (export "xchgi32@0") (param $p i64) (param $v i32) (result i32)
    (i32.atomic.rmw.xchg (local.get $p) (local.get $v)))

  (func (export "xchgi32@small") (param $p i64) (param $v i32) (result i32)
    (i32.atomic.rmw.xchg offset=${SMALL} (local.get $p) (local.get $v)))

  (func (export "xchgi32@big") (param $p i64) (param $v i32) (result i32)
    (i32.atomic.rmw.xchg offset=${BIG} (local.get $p) (local.get $v)))

  (func (export "xchgi32@huge") (param $p i64) (param $v i32) (result i32)
    (i32.atomic.rmw.xchg offset=${HUGE} (local.get $p) (local.get $v)))

  (func (export "xchgi32/const@0") (param $v i32) (result i32)
    (i32.atomic.rmw.xchg (i64.const ${LOC}) (local.get $v)))

  (func (export "xchgi32/const@small") (param $v i32) (result i32)
    (i32.atomic.rmw.xchg offset=${SMALL} (i64.const ${LOC}) (local.get $v)))

  (func (export "xchgi32/const@big") (param $v i32) (result i32)
    (i32.atomic.rmw.xchg offset=${BIG} (i64.const ${LOC}) (local.get $v)))

  ;; xchg i64

  (func (export "xchgi64@0") (param $p i64) (param $v i64) (result i64)
    (i64.atomic.rmw.xchg (local.get $p) (local.get $v)))

  (func (export "xchgi64@small") (param $p i64) (param $v i64) (result i64)
    (i64.atomic.rmw.xchg offset=${SMALL} (local.get $p) (local.get $v)))

  (func (export "xchgi64@big") (param $p i64) (param $v i64) (result i64)
    (i64.atomic.rmw.xchg offset=${BIG} (local.get $p) (local.get $v)))

  (func (export "xchgi64@huge") (param $p i64) (param $v i64) (result i64)
    (i64.atomic.rmw.xchg offset=${HUGE} (local.get $p) (local.get $v)))

  (func (export "xchgi64/const@0") (param $v i64) (result i64)
    (i64.atomic.rmw.xchg (i64.const ${LOC}) (local.get $v)))

  (func (export "xchgi64/const@small") (param $v i64) (result i64)
    (i64.atomic.rmw.xchg offset=${SMALL} (i64.const ${LOC}) (local.get $v)))

  (func (export "xchgi64/const@big") (param $v i64) (result i64)
    (i64.atomic.rmw.xchg offset=${BIG} (i64.const ${LOC}) (local.get $v)))

  ;; add i32

  (func (export "addi32@0") (param $p i64) (param $v i32) (result i32)
    (i32.atomic.rmw.add (local.get $p) (local.get $v)))

  (func (export "addi32@small") (param $p i64) (param $v i32) (result i32)
    (i32.atomic.rmw.add offset=${SMALL} (local.get $p) (local.get $v)))

  (func (export "addi32@big") (param $p i64) (param $v i32) (result i32)
    (i32.atomic.rmw.add offset=${BIG} (local.get $p) (local.get $v)))

  (func (export "addi32@huge") (param $p i64) (param $v i32) (result i32)
    (i32.atomic.rmw.add offset=${HUGE} (local.get $p) (local.get $v)))

  (func (export "addi32/const@0") (param $v i32) (result i32)
    (i32.atomic.rmw.add (i64.const ${LOC}) (local.get $v)))

  (func (export "addi32/const@small") (param $v i32) (result i32)
    (i32.atomic.rmw.add offset=${SMALL} (i64.const ${LOC}) (local.get $v)))

  (func (export "addi32/const@big") (param $v i32) (result i32)
    (i32.atomic.rmw.add offset=${BIG} (i64.const ${LOC}) (local.get $v)))

  ;; add i64

  (func (export "addi64@0") (param $p i64) (param $v i64) (result i64)
    (i64.atomic.rmw.add (local.get $p) (local.get $v)))

  (func (export "addi64@small") (param $p i64) (param $v i64) (result i64)
    (i64.atomic.rmw.add offset=${SMALL} (local.get $p) (local.get $v)))

  (func (export "addi64@big") (param $p i64) (param $v i64) (result i64)
    (i64.atomic.rmw.add offset=${BIG} (local.get $p) (local.get $v)))

  (func (export "addi64@huge") (param $p i64) (param $v i64) (result i64)
    (i64.atomic.rmw.add offset=${HUGE} (local.get $p) (local.get $v)))

  (func (export "addi64/const@0") (param $v i64) (result i64)
    (i64.atomic.rmw.add (i64.const ${LOC}) (local.get $v)))

  (func (export "addi64/const@small") (param $v i64) (result i64)
    (i64.atomic.rmw.add offset=${SMALL} (i64.const ${LOC}) (local.get $v)))

  (func (export "addi64/const@big") (param $v i64) (result i64)
    (i64.atomic.rmw.add offset=${BIG} (i64.const ${LOC}) (local.get $v)))

  ;; sub i32

  (func (export "subi32@0") (param $p i64) (param $v i32) (result i32)
    (i32.atomic.rmw.sub (local.get $p) (local.get $v)))

  (func (export "subi32@small") (param $p i64) (param $v i32) (result i32)
    (i32.atomic.rmw.sub offset=${SMALL} (local.get $p) (local.get $v)))

  (func (export "subi32@big") (param $p i64) (param $v i32) (result i32)
    (i32.atomic.rmw.sub offset=${BIG} (local.get $p) (local.get $v)))

  (func (export "subi32@huge") (param $p i64) (param $v i32) (result i32)
    (i32.atomic.rmw.sub offset=${HUGE} (local.get $p) (local.get $v)))

  (func (export "subi32/const@0") (param $v i32) (result i32)
    (i32.atomic.rmw.sub (i64.const ${LOC}) (local.get $v)))

  (func (export "subi32/const@small") (param $v i32) (result i32)
    (i32.atomic.rmw.sub offset=${SMALL} (i64.const ${LOC}) (local.get $v)))

  (func (export "subi32/const@big") (param $v i32) (result i32)
    (i32.atomic.rmw.sub offset=${BIG} (i64.const ${LOC}) (local.get $v)))

  ;; sub i64

  (func (export "subi64@0") (param $p i64) (param $v i64) (result i64)
    (i64.atomic.rmw.sub (local.get $p) (local.get $v)))

  (func (export "subi64@small") (param $p i64) (param $v i64) (result i64)
    (i64.atomic.rmw.sub offset=${SMALL} (local.get $p) (local.get $v)))

  (func (export "subi64@big") (param $p i64) (param $v i64) (result i64)
    (i64.atomic.rmw.sub offset=${BIG} (local.get $p) (local.get $v)))

  (func (export "subi64@huge") (param $p i64) (param $v i64) (result i64)
    (i64.atomic.rmw.sub offset=${HUGE} (local.get $p) (local.get $v)))

  (func (export "subi64/const@0") (param $v i64) (result i64)
    (i64.atomic.rmw.sub (i64.const ${LOC}) (local.get $v)))

  (func (export "subi64/const@small") (param $v i64) (result i64)
    (i64.atomic.rmw.sub offset=${SMALL} (i64.const ${LOC}) (local.get $v)))

  (func (export "subi64/const@big") (param $v i64) (result i64)
    (i64.atomic.rmw.sub offset=${BIG} (i64.const ${LOC}) (local.get $v)))

  ;; and i32

  (func (export "andi32@0") (param $p i64) (param $v i32) (result i32)
    (i32.atomic.rmw.and (local.get $p) (local.get $v)))

  (func (export "andi32@small") (param $p i64) (param $v i32) (result i32)
    (i32.atomic.rmw.and offset=${SMALL} (local.get $p) (local.get $v)))

  (func (export "andi32@big") (param $p i64) (param $v i32) (result i32)
    (i32.atomic.rmw.and offset=${BIG} (local.get $p) (local.get $v)))

  (func (export "andi32@huge") (param $p i64) (param $v i32) (result i32)
    (i32.atomic.rmw.and offset=${HUGE} (local.get $p) (local.get $v)))

  (func (export "andi32/const@0") (param $v i32) (result i32)
    (i32.atomic.rmw.and (i64.const ${LOC}) (local.get $v)))

  (func (export "andi32/const@small") (param $v i32) (result i32)
    (i32.atomic.rmw.and offset=${SMALL} (i64.const ${LOC}) (local.get $v)))

  (func (export "andi32/const@big") (param $v i32) (result i32)
    (i32.atomic.rmw.and offset=${BIG} (i64.const ${LOC}) (local.get $v)))

  ;; and i64

  (func (export "andi64@0") (param $p i64) (param $v i64) (result i64)
    (i64.atomic.rmw.and (local.get $p) (local.get $v)))

  (func (export "andi64@small") (param $p i64) (param $v i64) (result i64)
    (i64.atomic.rmw.and offset=${SMALL} (local.get $p) (local.get $v)))

  (func (export "andi64@big") (param $p i64) (param $v i64) (result i64)
    (i64.atomic.rmw.and offset=${BIG} (local.get $p) (local.get $v)))

  (func (export "andi64@huge") (param $p i64) (param $v i64) (result i64)
    (i64.atomic.rmw.and offset=${HUGE} (local.get $p) (local.get $v)))

  (func (export "andi64/const@0") (param $v i64) (result i64)
    (i64.atomic.rmw.and (i64.const ${LOC}) (local.get $v)))

  (func (export "andi64/const@small") (param $v i64) (result i64)
    (i64.atomic.rmw.and offset=${SMALL} (i64.const ${LOC}) (local.get $v)))

  (func (export "andi64/const@big") (param $v i64) (result i64)
    (i64.atomic.rmw.and offset=${BIG} (i64.const ${LOC}) (local.get $v)))

  ;; or i32

  (func (export "ori32@0") (param $p i64) (param $v i32) (result i32)
    (i32.atomic.rmw.or (local.get $p) (local.get $v)))

  (func (export "ori32@small") (param $p i64) (param $v i32) (result i32)
    (i32.atomic.rmw.or offset=${SMALL} (local.get $p) (local.get $v)))

  (func (export "ori32@big") (param $p i64) (param $v i32) (result i32)
    (i32.atomic.rmw.or offset=${BIG} (local.get $p) (local.get $v)))

  (func (export "ori32@huge") (param $p i64) (param $v i32) (result i32)
    (i32.atomic.rmw.or offset=${HUGE} (local.get $p) (local.get $v)))

  (func (export "ori32/const@0") (param $v i32) (result i32)
    (i32.atomic.rmw.or (i64.const ${LOC}) (local.get $v)))

  (func (export "ori32/const@small") (param $v i32) (result i32)
    (i32.atomic.rmw.or offset=${SMALL} (i64.const ${LOC}) (local.get $v)))

  (func (export "ori32/const@big") (param $v i32) (result i32)
    (i32.atomic.rmw.or offset=${BIG} (i64.const ${LOC}) (local.get $v)))

  ;; or i64

  (func (export "ori64@0") (param $p i64) (param $v i64) (result i64)
    (i64.atomic.rmw.or (local.get $p) (local.get $v)))

  (func (export "ori64@small") (param $p i64) (param $v i64) (result i64)
    (i64.atomic.rmw.or offset=${SMALL} (local.get $p) (local.get $v)))

  (func (export "ori64@big") (param $p i64) (param $v i64) (result i64)
    (i64.atomic.rmw.or offset=${BIG} (local.get $p) (local.get $v)))

  (func (export "ori64@huge") (param $p i64) (param $v i64) (result i64)
    (i64.atomic.rmw.or offset=${HUGE} (local.get $p) (local.get $v)))

  (func (export "ori64/const@0") (param $v i64) (result i64)
    (i64.atomic.rmw.or (i64.const ${LOC}) (local.get $v)))

  (func (export "ori64/const@small") (param $v i64) (result i64)
    (i64.atomic.rmw.or offset=${SMALL} (i64.const ${LOC}) (local.get $v)))

  (func (export "ori64/const@big") (param $v i64) (result i64)
    (i64.atomic.rmw.or offset=${BIG} (i64.const ${LOC}) (local.get $v)))

  ;; xor i32

  (func (export "xori32@0") (param $p i64) (param $v i32) (result i32)
    (i32.atomic.rmw.xor (local.get $p) (local.get $v)))

  (func (export "xori32@small") (param $p i64) (param $v i32) (result i32)
    (i32.atomic.rmw.xor offset=${SMALL} (local.get $p) (local.get $v)))

  (func (export "xori32@big") (param $p i64) (param $v i32) (result i32)
    (i32.atomic.rmw.xor offset=${BIG} (local.get $p) (local.get $v)))

  (func (export "xori32@huge") (param $p i64) (param $v i32) (result i32)
    (i32.atomic.rmw.xor offset=${HUGE} (local.get $p) (local.get $v)))

  (func (export "xori32/const@0") (param $v i32) (result i32)
    (i32.atomic.rmw.xor (i64.const ${LOC}) (local.get $v)))

  (func (export "xori32/const@small") (param $v i32) (result i32)
    (i32.atomic.rmw.xor offset=${SMALL} (i64.const ${LOC}) (local.get $v)))

  (func (export "xori32/const@big") (param $v i32) (result i32)
    (i32.atomic.rmw.xor offset=${BIG} (i64.const ${LOC}) (local.get $v)))

  ;; xor i64

  (func (export "xori64@0") (param $p i64) (param $v i64) (result i64)
    (i64.atomic.rmw.xor (local.get $p) (local.get $v)))

  (func (export "xori64@small") (param $p i64) (param $v i64) (result i64)
    (i64.atomic.rmw.xor offset=${SMALL} (local.get $p) (local.get $v)))

  (func (export "xori64@big") (param $p i64) (param $v i64) (result i64)
    (i64.atomic.rmw.xor offset=${BIG} (local.get $p) (local.get $v)))

  (func (export "xori64@huge") (param $p i64) (param $v i64) (result i64)
    (i64.atomic.rmw.xor offset=${HUGE} (local.get $p) (local.get $v)))

  (func (export "xori64/const@0") (param $v i64) (result i64)
    (i64.atomic.rmw.xor (i64.const ${LOC}) (local.get $v)))

  (func (export "xori64/const@small") (param $v i64) (result i64)
    (i64.atomic.rmw.xor offset=${SMALL} (i64.const ${LOC}) (local.get $v)))

  (func (export "xori64/const@big") (param $v i64) (result i64)
    (i64.atomic.rmw.xor offset=${BIG} (i64.const ${LOC}) (local.get $v)))

  ;; cmpxchg i32

  (func (export "cmpxchgi32@0") (param $p i64) (param $expect i32) (param $new i32) (result i32)
    (i32.atomic.rmw.cmpxchg (local.get $p) (local.get $expect) (local.get $new)))

  (func (export "cmpxchgi32@small") (param $p i64) (param $expect i32) (param $new i32) (result i32)
    (i32.atomic.rmw.cmpxchg offset=${SMALL} (local.get $p) (local.get $expect) (local.get $new)))

  (func (export "cmpxchgi32@big") (param $p i64) (param $expect i32) (param $new i32) (result i32)
    (i32.atomic.rmw.cmpxchg offset=${BIG} (local.get $p) (local.get $expect) (local.get $new)))

  (func (export "cmpxchgi32@huge") (param $p i64) (param $expect i32) (param $new i32) (result i32)
    (i32.atomic.rmw.cmpxchg offset=${HUGE} (local.get $p) (local.get $expect) (local.get $new)))

  (func (export "cmpxchgi32/const@0") (param $expect i32) (param $new i32) (result i32)
    (i32.atomic.rmw.cmpxchg (i64.const ${LOC}) (local.get $expect) (local.get $new)))

  (func (export "cmpxchgi32/const@small") (param $expect i32) (param $new i32) (result i32)
    (i32.atomic.rmw.cmpxchg offset=${SMALL} (i64.const ${LOC}) (local.get $expect) (local.get $new)))

  (func (export "cmpxchgi32/const@big") (param $expect i32) (param $new i32) (result i32)
    (i32.atomic.rmw.cmpxchg offset=${BIG} (i64.const ${LOC}) (local.get $expect) (local.get $new)))

  ;; cmpxchg i64

  (func (export "cmpxchgi64@0") (param $p i64) (param $expect i64) (param $new i64) (result i64)
    (i64.atomic.rmw.cmpxchg (local.get $p) (local.get $expect) (local.get $new)))

  (func (export "cmpxchgi64@small") (param $p i64) (param $expect i64) (param $new i64) (result i64)
    (i64.atomic.rmw.cmpxchg offset=${SMALL} (local.get $p) (local.get $expect) (local.get $new)))

  (func (export "cmpxchgi64@big") (param $p i64) (param $expect i64) (param $new i64) (result i64)
    (i64.atomic.rmw.cmpxchg offset=${BIG} (local.get $p) (local.get $expect) (local.get $new)))

  (func (export "cmpxchgi64@huge") (param $p i64) (param $expect i64) (param $new i64) (result i64)
    (i64.atomic.rmw.cmpxchg offset=${HUGE} (local.get $p) (local.get $expect) (local.get $new)))

  (func (export "cmpxchgi64/const@0") (param $expect i64) (param $new i64) (result i64)
    (i64.atomic.rmw.cmpxchg (i64.const ${LOC}) (local.get $expect) (local.get $new)))

  (func (export "cmpxchgi64/const@small") (param $expect i64) (param $new i64) (result i64)
    (i64.atomic.rmw.cmpxchg offset=${SMALL} (i64.const ${LOC}) (local.get $expect) (local.get $new)))

  (func (export "cmpxchgi64/const@big") (param $expect i64) (param $new i64) (result i64)
    (i64.atomic.rmw.cmpxchg offset=${BIG} (i64.const ${LOC}) (local.get $expect) (local.get $new)))

  ;; wait

  (func (export "waiti32@small") (param $p i64) (result i32)
    (memory.atomic.wait32 offset=${SMALL} (local.get $p) (i32.const 1) (i64.const 0)))

  (func (export "waiti32@huge") (param $p i64) (result i32)
    (memory.atomic.wait32 offset=${HUGE} (local.get $p) (i32.const 1) (i64.const 0)))

  (func (export "waiti64@small") (param $p i64) (result i32)
    (memory.atomic.wait64 offset=${SMALL} (local.get $p) (i64.const 1) (i64.const 0)))

  (func (export "waiti64@huge") (param $p i64) (result i32)
    (memory.atomic.wait64 offset=${HUGE} (local.get $p) (i64.const 1) (i64.const 0)))

  ;; wake

  (func (export "wake@0") (param $p i64) (result i32)
    (memory.atomic.notify (local.get $p) (i32.const 1)))

  (func (export "wake@small") (param $p i64) (result i32)
    (memory.atomic.notify offset=${SMALL} (local.get $p) (i32.const 1)))

  (func (export "wake@big") (param $p i64) (result i32)
    (memory.atomic.notify offset=${BIG} (local.get $p) (i32.const 1)))

  (func (export "wake@huge") (param $p i64) (result i32)
    (memory.atomic.notify offset=${HUGE} (local.get $p) (i32.const 1)))
)
`);
    return ins;
}

function i32Random() {
    // Limit this to small positive numbers to keep life simple.
    for (;;) {
        let r = (Math.random() * 0x3FFF_FFFF) | 0;
        if (r != 0)
            return r;
    }
}

function i64Random() {
    return (BigInt(i32Random()) << 32n) | BigInt(i32Random());
}

function Random(sz) {
    if (sz == 4)
        return i32Random();
    return i64Random();
}

function Random2(sz) {
    return [Random(sz), Random(sz)];
}

function Random4(sz) {
    return [Random(sz), Random(sz), Random(sz), Random(sz)];
}

function Zero(sz) {
    if (sz == 4)
        return 0;
    return 0n;
}

function testRead(ins, mem, LOC, prefix) {
    let r = 0;
    let SZ = mem.BYTES_PER_ELEMENT;
    let len = mem.length * SZ;
    let NM = prefix + "readi" + (SZ * 8);

    // Read in-bounds

    r = Random(SZ);
    mem[LOC / SZ] = r;
    assertEq(ins.exports[NM + "@0"](BigInt(LOC)), r);
    assertEq(ins.exports[NM + "/const@0"](), r);

    mem[(len / SZ) - 1] = Zero(SZ);
    assertEq(ins.exports[NM + "@0"](BigInt(len - SZ)), Zero(SZ)); // Just barely in-bounds

    r = Random(SZ);
    mem[(LOC + SMALL) / SZ] = r;
    assertEq(ins.exports[NM + "@small"](BigInt(LOC)), r);
    assertEq(ins.exports[NM + "/const@small"](), r);

    if (len >= LOC + BIG + SZ) {
        r = Random(SZ);
        mem[(LOC + BIG) / SZ] = r;
        assertEq(ins.exports[NM + "@big"](BigInt(LOC)), r);
        assertEq(ins.exports[NM + "/const@big"](), r);
    }

    if (len >= LOC + VAST + SZ) {
        r = Random(SZ);
        mem[(LOC + VAST) / SZ] = r;
        assertEq(ins.exports[NM + "@vast"](BigInt(LOC)), r);
        assertEq(ins.exports[NM + "/const@vast"](), r);
    }

    // Read out-of-bounds

    assertErrorMessage(() => ins.exports[NM + "@0"](BigInt(len)),
                       WebAssembly.RuntimeError,
                       /out of bounds/);

    assertErrorMessage(() => ins.exports[NM + "@0"](BigInt(len-(SZ-1))),
                       WebAssembly.RuntimeError,
                       prefix == "" ? /out of bounds/ : /unaligned memory access/);

    // This is OOB if we consider the whole pointer as we must, but if we
    // mistakenly only look at the low bits then it's in-bounds.
    if (len < 0x1_0000_0000) {
        assertErrorMessage(() => ins.exports[NM + "@0"](0x1_0000_0000n),
                           WebAssembly.RuntimeError,
                           /out of bounds/);
    }

    if (len < HUGE) {
        assertErrorMessage(() => ins.exports[NM + "@huge"](0n),
                           WebAssembly.RuntimeError,
                           /out of bounds/);
    }

    if (len < VAST) {
        assertErrorMessage(() => ins.exports[NM + "@vast"](0n),
                           WebAssembly.RuntimeError,
                           /out of bounds/);
    }
}

function testReadV128(ins, mem, LOC) {
    let r = 0;
    let SZ = mem.BYTES_PER_ELEMENT;
    let len = mem.length * SZ;
    let NM = "readv128";

    assertEq(SZ, 4);

    // Read in-bounds

    r = Random4(4);
    mem.set(r, LOC / SZ);
    ins.exports[NM + "@0"](BigInt(LOC))
    assertSame(mem.slice(0, 4), r);
    ins.exports[NM + "/const@0"]();
    assertSame(mem.slice(0, 4), r);

    r = new Int32Array([0,0,0,0]);
    mem.set(r, (len / SZ) - 4);
    ins.exports[NM + "@0"](BigInt(len - (SZ * 4)));  // Just barely in-bounds
    assertSame(mem.slice(0, 4), r);

    r = Random4(SZ);
    mem.set(r, (LOC + SMALL) / SZ);
    ins.exports[NM + "@small"](BigInt(LOC))
    assertSame(mem.slice(0, 4), r);
    ins.exports[NM + "/const@small"]();
    assertSame(mem.slice(0, 4), r);

    if (len >= LOC + BIG + SZ * 4) {
        r = Random4(SZ);
        mem.set(r, (LOC + BIG) / SZ);
        ins.exports[NM + "@big"](BigInt(LOC));
        assertSame(mem.slice(0, 4), r);
        ins.exports[NM + "/const@big"]();
        assertSame(mem.slice(0, 4), r);
    }

    // Read out-of-bounds

    assertErrorMessage(() => ins.exports[NM + "@0"](BigInt(len)),
                       WebAssembly.RuntimeError,
                       /out of bounds/);

    assertErrorMessage(() => ins.exports[NM + "@0"](BigInt(len-((SZ*4)-1))),
                       WebAssembly.RuntimeError,
                       /out of bounds/);

    // This is OOB if we consider the whole pointer as we must, but if we
    // mistakenly only look at the low bits then it's in-bounds.
    if (len < 0x1_0000_0000) {
        assertErrorMessage(() => ins.exports[NM + "@0"](0x1_0000_0000n),
                           WebAssembly.RuntimeError,
                           /out of bounds/);
    }

    if (len < HUGE) {
        assertErrorMessage(() => ins.exports[NM + "@huge"](0n),
                           WebAssembly.RuntimeError,
                           /out of bounds/);
    }

    // Superficial testing of other load operations

    r = i32Random()
    mem[(LOC + SMALL) / SZ] = r;
    ins.exports["v128.load_splat@small"](BigInt(LOC));
    assertSame(mem.slice(0, 4), [r, r, r, r]);

    r = i32Random()
    mem[(LOC + SMALL) / SZ] = r;
    ins.exports["v128.load_zero@small"](BigInt(LOC));
    assertSame(mem.slice(0, 4), [r, 0, 0, 0]);

    r = Random2(SZ)
    mem.set(r, (LOC + SMALL) / SZ);
    ins.exports["v128.load_extend@small"](BigInt(LOC));
    assertSame(mem.slice(0, 4), [r[0], 0, r[1], 0]);

    r = Random4(SZ)
    mem.set(r, 0);
    let s = i32Random()
    mem[(LOC + SMALL) / SZ] = s;
    ins.exports["v128.load_lane@small"](BigInt(LOC));
    assertSame(mem.slice(0, 4), [r[0], r[1], s, r[3]]);
}

function testWrite(ins, mem, LOC, prefix) {
    let r = 0;
    let SZ = mem.BYTES_PER_ELEMENT;
    let len = mem.length * SZ;
    let WNM = prefix + "writei" + (SZ * 8);
    let RNM = prefix + "readi" + (SZ * 8);

    // Write in-bounds

    r = Random(SZ);
    ins.exports[WNM + "@0"](BigInt(LOC), r);
    assertEq(ins.exports[RNM + "@0"](BigInt(LOC)), r);

    r = Random(SZ);
    ins.exports[WNM + "@small"](BigInt(LOC), r);
    assertEq(ins.exports[RNM + "@small"](BigInt(LOC)), r);

    if (len >= LOC + BIG + SZ) {
        r = Random(SZ);
        ins.exports[WNM + "@big"](BigInt(LOC), r);
        assertEq(ins.exports[RNM + "@big"](BigInt(LOC)), r);
    }

    if (len >= LOC + VAST + SZ) {
        r = Random(SZ);
        ins.exports[WNM + "@vast"](BigInt(LOC), r);
        assertEq(ins.exports[RNM + "@vast"](BigInt(LOC)), r);
    }

    r = Random(SZ);
    ins.exports[WNM + "@0"](BigInt(len - SZ), r); // Just barely in-bounds
    assertEq(ins.exports[RNM + "@0"](BigInt(len - SZ)), r);

    // Write out-of-bounds

    assertErrorMessage(() => ins.exports[WNM + "@0"](BigInt(len), Random(SZ)),
                       WebAssembly.RuntimeError,
                       /out of bounds/);

    assertErrorMessage(() => ins.exports[WNM + "@0"](BigInt(len - (SZ - 1)), Random(SZ)),
                       WebAssembly.RuntimeError,
                       prefix == "" ? /out of bounds/ : /unaligned memory access/);

    if (len < 0x1_0000_0000) {
        let xs = ins.exports[RNM + "@0"](0n);
        assertErrorMessage(() => ins.exports[WNM + "@0"](0x1_0000_0000n, Random(SZ)),
                           WebAssembly.RuntimeError,
                           /out of bounds/);
        // Check for scribbling
        assertEq(ins.exports[RNM + "@0"](0n), xs);
    }

    if (len < HUGE) {
        assertErrorMessage(() => ins.exports[WNM + "@huge"](0n, Random(SZ)),
                           WebAssembly.RuntimeError,
                           /out of bounds/);
    }

    if (len < VAST) {
        assertErrorMessage(() => ins.exports[WNM + "@vast"](0n, Random(SZ)),
                           WebAssembly.RuntimeError,
                           /out of bounds/);
    }
}

function testWriteV128(ins, mem, LOC) {
    let r = 0;
    let p = 0;
    let SZ = mem.BYTES_PER_ELEMENT;
    let len = mem.length * SZ;
    let WNM = "writev128";
    let RNM = "readv128";

    assertEq(SZ, 4);

    // Write in-bounds

    r = Random4(SZ);
    mem.set(r, 0);
    p = LOC / SZ;
    ins.exports[WNM + "@0"](BigInt(LOC));
    assertSame(mem.slice(p, p + 4), r);

    r = Random4(SZ);
    mem.set(r, 0);
    p = (LOC + SMALL) / SZ;
    ins.exports[WNM + "@small"](BigInt(LOC));
    assertSame(mem.slice(p, p + 4), r);

    if (len >= LOC + BIG + SZ) {
        r = Random4(SZ);
        mem.set(r, 0);
        p = (LOC + BIG) / SZ;
        ins.exports[WNM + "@big"](BigInt(LOC));
        assertSame(mem.slice(p, p + 4), r);
    }

    r = Random4(SZ);
    mem.set(r, 0);
    p = (len - (SZ * 4)) / SZ;
    ins.exports[WNM + "@0"](BigInt(len - (SZ * 4))); // Just barely in-bounds
    assertSame(mem.slice(p, p + 4), r);

    // Write out-of-bounds

    assertErrorMessage(() => ins.exports[WNM + "@0"](BigInt(len)),
                       WebAssembly.RuntimeError,
                       /out of bounds/);

    assertErrorMessage(() => ins.exports[WNM + "@0"](BigInt(len - ((SZ * 4) - 1))),
                       WebAssembly.RuntimeError,
                       /out of bounds/);

    if (len < HUGE) {
        assertErrorMessage(() => ins.exports[WNM + "@huge"](0n),
                           WebAssembly.RuntimeError,
                           /out of bounds/);
    }

    // Superficial testing of other store operations

    r = Random4(SZ);
    mem.set(r, 0);
    ins.exports["v128.store_lane@small"](BigInt(LOC));
    assertEq(mem[(LOC + SMALL) / SZ], r[2]);
}

function testAtomicRMW(ins, mem, LOC, op, fn) {
    let r = 0, s = 0;
    let SZ = mem.BYTES_PER_ELEMENT;
    let len = mem.length * SZ;
    let NM = op + "i" + (SZ * 8);

    [r,s] = Random2(SZ);
    mem[LOC / SZ] = r;
    assertEq(ins.exports[NM + "@0"](BigInt(LOC), s), r);
    assertEq(mem[LOC / SZ], fn(r, s));

    [r,s] = Random2(SZ);
    mem[(LOC + SMALL) / SZ] = r;
    assertEq(ins.exports[NM + "@small"](BigInt(LOC), s), r);
    assertEq(mem[(LOC + SMALL) / SZ], fn(r, s));

    if (len >= LOC + BIG + SZ) {
        [r,s] = Random2(SZ);
        mem[(LOC + BIG) / SZ] = r;
        assertEq(ins.exports[NM + "@big"](BigInt(LOC), s), r);
        assertEq(mem[(LOC + BIG) / SZ], fn(r, s));
    }


    assertErrorMessage(() => ins.exports[NM + "@0"](BigInt(len), Zero(SZ)),
                       WebAssembly.RuntimeError,
                       /out of bounds/);

    assertErrorMessage(() => ins.exports[NM + "@0"](BigInt(len - (SZ - 1)), Zero(SZ)),
                       WebAssembly.RuntimeError,
                       /unaligned memory access/);

    if (len < HUGE) {
        assertErrorMessage(() => ins.exports[NM + "@huge"](0n, Zero(SZ)),
                           WebAssembly.RuntimeError,
                           /out of bounds/);
    }
}

function testAtomicCmpxchg(ins, mem, LOC) {
    let r = 0, s = 0;
    let SZ = mem.BYTES_PER_ELEMENT;
    let len = mem.length * SZ;
    let NM = "cmpxchgi" + (SZ * 8);

    [r,s] = Random2(SZ);
    mem[LOC / SZ] = r;
    assertEq(ins.exports[NM + "@0"](BigInt(LOC), Zero(SZ), s), r);
    assertEq(ins.exports[NM + "@0"](BigInt(LOC), r, s), r);
    assertEq(mem[LOC / SZ], s);

    [r,s] = Random2(SZ);
    mem[(LOC + SMALL) / SZ] = r;
    assertEq(ins.exports[NM + "@0"](BigInt(LOC + SMALL), Zero(SZ), s), r);
    assertEq(ins.exports[NM + "@0"](BigInt(LOC + SMALL), r, s), r);
    assertEq(mem[(LOC + SMALL) / SZ], s);

    if (len >= LOC + BIG + SZ) {
        [r,s] = Random2(SZ);
        mem[(LOC + BIG) / SZ] = r;
        assertEq(ins.exports[NM + "@0"](BigInt(LOC + BIG), Zero(SZ), s), r);
        assertEq(ins.exports[NM + "@0"](BigInt(LOC + BIG), r, s), r);
        assertEq(mem[(LOC + BIG) / SZ], s);
    }

    assertErrorMessage(() => ins.exports[NM + "@0"](BigInt(len), Zero(SZ), Zero(SZ)),
                       WebAssembly.RuntimeError,
                       /out of bounds/);

    assertErrorMessage(() => ins.exports[NM + "@0"](BigInt(len - (SZ - 1)), Zero(SZ), Zero(SZ)),
                       WebAssembly.RuntimeError,
                       /unaligned memory access/);

    if (len < HUGE) {
        assertErrorMessage(() => ins.exports[NM + "@huge"](0n, Zero(SZ), Zero(SZ)),
                           WebAssembly.RuntimeError,
                           /out of bounds/);
    }
}

function testAtomicWake(ins, mem, LOC) {
    let SZ = mem.BYTES_PER_ELEMENT;
    let len = mem.length * SZ;

    assertEq(ins.exports["wake@0"](BigInt(LOC)), 0);
    assertEq(ins.exports["wake@small"](BigInt(LOC)), 0);
    if (len >= LOC + BIG + SZ) {
        assertEq(ins.exports["wake@big"](BigInt(LOC)), 0);
    }

    assertErrorMessage(() => ins.exports["wake@0"](BigInt(len)),
                       WebAssembly.RuntimeError,
                       /out of bounds/);

    assertErrorMessage(() => ins.exports["wake@0"](BigInt(len - (SZ - 1))),
                       WebAssembly.RuntimeError,
                       /unaligned memory access/);

    if (len < HUGE) {
        assertErrorMessage(() => ins.exports["wake@huge"](BigInt(LOC)),
                           WebAssembly.RuntimeError,
                           /out of bounds/);
    }
}

// Sometimes we start memory at zero to disable certain bounds checking
// optimizations.  Other times we start memory at something beyond most of
// our references to enable those optimizations.
let configs = [[40, 0, 3], [40, 3, '']];

// On 64-bit systems, test beyond 2GB and also beyond 4GB
if (getBuildConfiguration()["pointer-byte-size"] == 8) {
    configs.push([Math.pow(2, 31) + 40, 32771, '']);
    configs.push([Math.pow(2, 32) + 40, 65539, '']);
    configs.push([Math.pow(2, 31) + 40, 32771, 32773]);
    configs.push([Math.pow(2, 32) + 40, 65539, 65541]);
}

for ( let shared of ['','shared'] ) {
    for (let [LOC, start, max] of configs) {
        if (shared != '' && max == '') {
            continue;
        }
        const ins = makeTest(LOC, start, max, shared);
        if (max != '') {
            // This can OOM legitimately; let it.
            let res = ins.exports.mem.grow(max - start);
            if (res == -1) {
                print("SPURIOUS OOM");
                continue;
            }
            assertEq(res, start);
        }

        const mem32 = new Int32Array(ins.exports.mem.buffer);
        const mem64 = new BigInt64Array(ins.exports.mem.buffer);

        for ( let m of [mem32, mem64] ) {
            testRead(ins, m, LOC, "");
            testWrite(ins, m, LOC, "");
            testRead(ins, m, LOC, "a");
            testWrite(ins, m, LOC, "a");
            testAtomicRMW(ins, m, LOC, "add", (r,s) => r+s);
            testAtomicRMW(ins, m, LOC, "sub", (r,s) => r-s);
            testAtomicRMW(ins, m, LOC, "and", (r,s) => r&s);
            testAtomicRMW(ins, m, LOC, "or", (r,s) => r|s);
            testAtomicRMW(ins, m, LOC, "xor", (r,s) => r^s);
            testAtomicRMW(ins, m, LOC, "xchg", (r,s) => s);
            testAtomicCmpxchg(ins, m, LOC);
            testAtomicWake(ins, m, LOC);
        }

        if (wasmSimdEnabled()) {
            testReadV128(ins, mem32, LOC);
            testWriteV128(ins, mem32, LOC);
        }
    }
}

// Bulk memory operations

function makeModule(initial, maximum, shared) {
    return `
(module
  (memory (export "mem") i64 ${initial} ${maximum} ${shared})

  (data $seg "0123456789")

  (func (export "size") (result i64)
    memory.size)

  (func (export "grow") (param $delta i64) (result i64)
    (memory.grow (local.get $delta)))

  (func (export "copy") (param $to i64) (param $from i64) (param $len i64)
    (memory.copy (local.get $to) (local.get $from) (local.get $len)))

  (func (export "fill") (param $to i64) (param $val i32) (param $len i64)
    (memory.fill (local.get $to) (local.get $val) (local.get $len)))

  (func (export "init") (param $to i64) (param $src i32) (param $count i32)
    (memory.init $seg (local.get $to) (local.get $src) (local.get $count)))
)`;
}

for ( let shared of ['','shared'] ) {
    let ins = wasmEvalText(makeModule(1, 3, shared));

    assertEq(ins.exports.size(), 1n);

    // OOM with very low probability will result in test failure
    assertEq(ins.exports.grow(2n), 1n);
    assertEq(ins.exports.size(), 3n);

    // OOM with very low probability will result in test failure
    assertEq(ins.exports.grow(1n), -1n);
    assertEq(ins.exports.size(), 3n);

    // More than max pages
    assertEq(ins.exports.grow(100000n), -1n);
    assertEq(ins.exports.size(), 3n);

    // More than 2^48 pages
    assertEq(ins.exports.grow(0x1_0000_0000_0000n), -1n);
    assertEq(ins.exports.size(), 3n);

    // More than 2^48 pages - interpreted as unsigned
    assertEq(ins.exports.grow(-1n), -1n);
    assertEq(ins.exports.size(), 3n);

    var mem = new Uint8Array(ins.exports.mem.buffer);
    var val = [1,2,3,4,5];
    mem.set(val, 20);
    ins.exports.copy(40n, 20n, 5n);
    assertSame(val, mem.slice(40, 45));

    ins.exports.fill(39n, 37, 8n);
    assertSame(iota(8).map(_ => 37), mem.slice(39, 47));

    ins.exports.init(128n, 1, 5);
    assertSame(iota(5).map(x => x+49), mem.slice(128, 133));
}

if (getBuildConfiguration()["pointer-byte-size"] == 8) {
    for ( let shared of ['','shared'] ) {
        let limit = wasmMaxMemoryPages('i64');
        let initial = 65537;
        let maximum = limit + 1;
        let pagesize = 65536n;

        let ins = wasmEvalText(makeModule(initial, maximum, shared));

        assertEq(ins.exports.size(), BigInt(initial));

        // This can OOM legitimately; let it.
        {
            let res = ins.exports.grow(2n);
            if (res == -1) {
                print("SPURIOUS OOM");
                continue;
            }
            assertEq(res, BigInt(initial));
        }
        assertEq(ins.exports.size(), BigInt(initial + 2));

        // This must fail
        assertEq(ins.exports.grow(BigInt(limit - (initial + 2) + 1)), -1n);
        assertEq(ins.exports.size(), BigInt(initial + 2));

        // This can OOM legitimately; let it.
        {
            let res = ins.exports.grow(BigInt(limit - (initial + 2)));
            if (res == -1) {
                print("SPURIOUS OOM");
                continue;
            }
            assertEq(res, BigInt(initial + 2));
        }
        assertEq(ins.exports.size(), BigInt(limit));

        let mem = new Uint8Array(ins.exports.mem.buffer);

        let copyval = [1,2,3,4,5];
        let source = 20n;
        let target = BigInt(initial) * pagesize + 40n;
        let oobTarget = BigInt(limit) * pagesize - 1n;

        // Copy from memory below 4GB to memory beyond 4GB
        mem.set(copyval, Number(source));
        ins.exports.copy(target, source, BigInt(copyval.length));
        assertSame(copyval, mem.slice(Number(target), Number(target) + copyval.length))

        // Try to copy out of bounds
        // src and target are both in bounds but len brings it oob
        assertErrorMessage(() => ins.exports.copy(oobTarget, source, BigInt(copyval.length)),
                           WebAssembly.RuntimeError,
                           /out of bounds/);
        assertEq(mem[Number(oobTarget-1n)], 0);
        assertErrorMessage(() => ins.exports.copy(-1n, source, BigInt(copyval.length)),
                           WebAssembly.RuntimeError,
                           /out of bounds/);
        assertEq(mem[Number(oobTarget-1n)], 0);

        // Fill above 4GB
        ins.exports.fill(target, 37, 30n);
        assertSame(iota(30).map(_ => 37), mem.slice(Number(target), Number(target) + 30));

        // Try to fill out of bounds
        assertErrorMessage(() => ins.exports.fill(oobTarget, 37, 2n),
                           WebAssembly.RuntimeError,
                           /out of bounds/);
        assertEq(mem[Number(oobTarget-1n)], 0);

        // Init above 4GB
        ins.exports.init(target, 1, 5);
        assertSame(iota(5).map(x => x+49), mem.slice(Number(target), Number(target)+5));

        // Try to init out of bounds
        assertErrorMessage(() => ins.exports.init(oobTarget, 1, 5),
                           WebAssembly.RuntimeError,
                           /out of bounds/);
        assertEq(mem[Number(oobTarget-1n)], 0);
    }
}
