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

load(libdir + "wasm-binary.js");

const v2vSig = {args:[], ret:VoidCode};
const v2vSigSection = sigSection([v2vSig]);

const Module = WebAssembly.Module;
const Instance = WebAssembly.Instance;

// Some non-boundary tests for {table,memory}.{init,drop,copy}.  The table
// case is more complex and appears first.  The memory case is a simplified
// version of it.

// This module exports 5 functions ..
let tab_expmod_t =
    `(module
        (func (export "ef0") (result i32) (i32.const 0))
        (func (export "ef1") (result i32) (i32.const 1))
        (func (export "ef2") (result i32) (i32.const 2))
        (func (export "ef3") (result i32) (i32.const 3))
        (func (export "ef4") (result i32) (i32.const 4))
     )`;

// .. and this one imports those 5 functions.  It adds 5 of its own, creates a
// 30 element table using both active and passive initialisers, with a mixture
// of the imported and local functions.  |setup| and |check| are exported.
// |setup| uses the supplied |insn| to modify the table somehow.  |check| will
// indirect-call the table entry number specified as a parameter.  That will
// either return a value 0 to 9 indicating the function called, or will throw an
// exception if the table entry is empty.
function gen_tab_impmod_t(insn)
{
  let t =
  `(module
     ;; -------- Types --------
     (type (func (result i32)))  ;; type #0
     ;; -------- Imports --------
     (import "a" "if0" (func (result i32)))    ;; index 0
     (import "a" "if1" (func (result i32)))
     (import "a" "if2" (func (result i32)))
     (import "a" "if3" (func (result i32)))
     (import "a" "if4" (func (result i32)))    ;; index 4
     ;; -------- Tables --------
     (table 30 30 funcref)
     ;; -------- Table initialisers --------
     (elem (i32.const 2) 3 1 4 1)
     (elem func 2 7 1 8)
     (elem (i32.const 12) 7 5 2 3 6)
     (elem func 5 9 2 7 6)
     ;; -------- Functions --------
     (func (result i32) (i32.const 5))  ;; index 5
     (func (result i32) (i32.const 6))
     (func (result i32) (i32.const 7))
     (func (result i32) (i32.const 8))
     (func (result i32) (i32.const 9))  ;; index 9

     (func (export "setup")
       ${insn})
     (func (export "check") (param i32) (result i32)
       ;; call the selected table entry, which will either return a value,
       ;; or will cause an exception.
       local.get 0      ;; callIx
       call_indirect (type 0)  ;; and its return value is our return value.
     )
   )`;
   return t;
};

// This is the test driver.  It constructs the abovementioned module, using
// the given |instruction| to modify the table, and then probes the table
// by making indirect calls, one for each element of |expected_result_vector|.
// The results are compared to those in the vector.

function tab_test(instruction, expected_result_vector)
{
    let tab_expmod_b = wasmTextToBinary(tab_expmod_t);
    let tab_expmod_i = new Instance(new Module(tab_expmod_b));

    let tab_impmod_t = gen_tab_impmod_t(instruction);
    let tab_impmod_b = wasmTextToBinary(tab_impmod_t);

    let inst = new Instance(new Module(tab_impmod_b),
                            {a:{if0:tab_expmod_i.exports.ef0,
                                if1:tab_expmod_i.exports.ef1,
                                if2:tab_expmod_i.exports.ef2,
                                if3:tab_expmod_i.exports.ef3,
                                if4:tab_expmod_i.exports.ef4
                               }});
    inst.exports.setup();

    for (let i = 0; i < expected_result_vector.length; i++) {
        let expected = expected_result_vector[i];
        let actual = undefined;
        try {
            actual = inst.exports.check(i);
            assertEq(actual !== null, true);
        } catch (e) {
            if (!(e instanceof Error &&
                  e.message.match(/indirect call to null/)))
                throw e;
            // actual remains undefined
        }
        assertEq(actual, expected,
                 "tab_test fail: insn = '" + instruction + "', index = " +
                 i + ", expected = " + expected + ", actual = " + actual);
    }
}

// Using 'e' for empty (undefined) spaces in the table, to make it easier
// to count through the vector entries when debugging.
let e = undefined;

// This just gives the initial state of the table, with its active
// initialisers applied
tab_test("nop",
         [e,e,3,1,4, 1,e,e,e,e, e,e,7,5,2, 3,6,e,e,e, e,e,e,e,e, e,e,e,e,e]);

// Copy non-null over non-null
tab_test("(table.copy (i32.const 13) (i32.const 2) (i32.const 3))",
         [e,e,3,1,4, 1,e,e,e,e, e,e,7,3,1, 4,6,e,e,e, e,e,e,e,e, e,e,e,e,e]);

// Copy non-null over null
tab_test("(table.copy (i32.const 25) (i32.const 15) (i32.const 2))",
         [e,e,3,1,4, 1,e,e,e,e, e,e,7,5,2, 3,6,e,e,e, e,e,e,e,e, 3,6,e,e,e]);

// Copy null over non-null
tab_test("(table.copy (i32.const 13) (i32.const 25) (i32.const 3))",
         [e,e,3,1,4, 1,e,e,e,e, e,e,7,e,e, e,6,e,e,e, e,e,e,e,e, e,e,e,e,e]);

// Copy null over null
tab_test("(table.copy (i32.const 20) (i32.const 22) (i32.const 4))",
         [e,e,3,1,4, 1,e,e,e,e, e,e,7,5,2, 3,6,e,e,e, e,e,e,e,e, e,e,e,e,e]);

// Copy null and non-null entries, non overlapping
tab_test("(table.copy (i32.const 25) (i32.const 1) (i32.const 3))",
         [e,e,3,1,4, 1,e,e,e,e, e,e,7,5,2, 3,6,e,e,e, e,e,e,e,e, e,3,1,e,e]);

// Copy null and non-null entries, overlapping, backwards
tab_test("(table.copy (i32.const 10) (i32.const 12) (i32.const 7))",
         [e,e,3,1,4, 1,e,e,e,e, 7,5,2,3,6, e,e,e,e,e, e,e,e,e,e, e,e,e,e,e]);

// Copy null and non-null entries, overlapping, forwards
tab_test("(table.copy (i32.const 12) (i32.const 10) (i32.const 7))",
         [e,e,3,1,4, 1,e,e,e,e, e,e,e,e,7, 5,2,3,6,e, e,e,e,e,e, e,e,e,e,e]);

// Passive init that overwrites all-null entries
tab_test("(table.init 1 (i32.const 7) (i32.const 0) (i32.const 4))",
         [e,e,3,1,4, 1,e,2,7,1, 8,e,7,5,2, 3,6,e,e,e, e,e,e,e,e, e,e,e,e,e]);

// Passive init that overwrites existing active-init-created entries
tab_test("(table.init 3 (i32.const 15) (i32.const 1) (i32.const 3))",
         [e,e,3,1,4, 1,e,e,e,e, e,e,7,5,2, 9,2,7,e,e, e,e,e,e,e, e,e,e,e,e]);

// Perform active and passive initialisation and then multiple copies
tab_test("(table.init 1 (i32.const 7) (i32.const 0) (i32.const 4)) \n" +
         "elem.drop 1 \n" +
         "(table.init 3 (i32.const 15) (i32.const 1) (i32.const 3)) \n" +
         "elem.drop 3 \n" +
         "(table.copy (i32.const 20) (i32.const 15) (i32.const 5)) \n" +
         "(table.copy (i32.const 21) (i32.const 29) (i32.const 1)) \n" +
         "(table.copy (i32.const 24) (i32.const 10) (i32.const 1)) \n" +
         "(table.copy (i32.const 13) (i32.const 11) (i32.const 4)) \n" +
         "(table.copy (i32.const 19) (i32.const 20) (i32.const 5))",
         [e,e,3,1,4, 1,e,2,7,1, 8,e,7,e,7, 5,2,7,e,9, e,7,e,8,8, e,e,e,e,e]);

// And now a simplified version of the above, for memory.{init,drop,copy}.

function gen_mem_mod_t(insn)
{
  let t =
  `(module
     ;; -------- Memories --------
     (memory (export "memory0") 1 1)
     ;; -------- Memory initialisers --------
     (data (i32.const 2) "\\03\\01\\04\\01")
     (data "\\02\\07\\01\\08")
     (data (i32.const 12) "\\07\\05\\02\\03\\06")
     (data "\\05\\09\\02\\07\\06")

     (func (export "testfn")
       ${insn}
       ;; There's no return value.  The JS driver can just pull out the
       ;; final memory and examine it.
     )
   )`;
   return t;
};

function mem_test(instruction, expected_result_vector)
{
    let mem_mod_t = gen_mem_mod_t(instruction);
    let mem_mod_b = wasmTextToBinary(mem_mod_t);

    let inst = new Instance(new Module(mem_mod_b));
    inst.exports.testfn();
    let buf = new Uint8Array(inst.exports.memory0.buffer);

    for (let i = 0; i < expected_result_vector.length; i++) {
        let expected = expected_result_vector[i];
        let actual = buf[i];
        assertEq(actual, expected,
                 "mem_test fail: insn = '" + instruction + "', index = " +
                 i + ", expected = " + expected + ", actual = " + actual);
    }
}

e = 0;

// This just gives the initial state of the memory, with its active
// initialisers applied.
mem_test("nop",
         [e,e,3,1,4, 1,e,e,e,e, e,e,7,5,2, 3,6,e,e,e, e,e,e,e,e, e,e,e,e,e]);

// Copy non-zero over non-zero
mem_test("(memory.copy (i32.const 13) (i32.const 2) (i32.const 3))",
         [e,e,3,1,4, 1,e,e,e,e, e,e,7,3,1, 4,6,e,e,e, e,e,e,e,e, e,e,e,e,e]);

// Copy non-zero over zero
mem_test("(memory.copy (i32.const 25) (i32.const 15) (i32.const 2))",
         [e,e,3,1,4, 1,e,e,e,e, e,e,7,5,2, 3,6,e,e,e, e,e,e,e,e, 3,6,e,e,e]);

// Copy zero over non-zero
mem_test("(memory.copy (i32.const 13) (i32.const 25) (i32.const 3))",
         [e,e,3,1,4, 1,e,e,e,e, e,e,7,e,e, e,6,e,e,e, e,e,e,e,e, e,e,e,e,e]);

// Copy zero over zero
mem_test("(memory.copy (i32.const 20) (i32.const 22) (i32.const 4))",
         [e,e,3,1,4, 1,e,e,e,e, e,e,7,5,2, 3,6,e,e,e, e,e,e,e,e, e,e,e,e,e]);

// Copy zero and non-zero entries, non overlapping
mem_test("(memory.copy (i32.const 25) (i32.const 1) (i32.const 3))",
         [e,e,3,1,4, 1,e,e,e,e, e,e,7,5,2, 3,6,e,e,e, e,e,e,e,e, e,3,1,e,e]);

// Copy zero and non-zero entries, overlapping, backwards
mem_test("(memory.copy (i32.const 10) (i32.const 12) (i32.const 7))",
         [e,e,3,1,4, 1,e,e,e,e, 7,5,2,3,6, e,e,e,e,e, e,e,e,e,e, e,e,e,e,e]);

// Copy zero and non-zero entries, overlapping, forwards
mem_test("(memory.copy (i32.const 12) (i32.const 10) (i32.const 7))",
         [e,e,3,1,4, 1,e,e,e,e, e,e,e,e,7, 5,2,3,6,e, e,e,e,e,e, e,e,e,e,e]);

// Passive init that overwrites all-zero entries
mem_test("(memory.init 1 (i32.const 7) (i32.const 0) (i32.const 4))",
         [e,e,3,1,4, 1,e,2,7,1, 8,e,7,5,2, 3,6,e,e,e, e,e,e,e,e, e,e,e,e,e]);

// Passive init that overwrites existing active-init-created entries
mem_test("(memory.init 3 (i32.const 15) (i32.const 1) (i32.const 3))",
         [e,e,3,1,4, 1,e,e,e,e, e,e,7,5,2, 9,2,7,e,e, e,e,e,e,e, e,e,e,e,e]);

// Perform active and passive initialisation and then multiple copies
mem_test("(memory.init 1 (i32.const 7) (i32.const 0) (i32.const 4)) \n" +
         "data.drop 1 \n" +
         "(memory.init 3 (i32.const 15) (i32.const 1) (i32.const 3)) \n" +
         "data.drop 3 \n" +
         "(memory.copy (i32.const 20) (i32.const 15) (i32.const 5)) \n" +
         "(memory.copy (i32.const 21) (i32.const 29) (i32.const 1)) \n" +
         "(memory.copy (i32.const 24) (i32.const 10) (i32.const 1)) \n" +
         "(memory.copy (i32.const 13) (i32.const 11) (i32.const 4)) \n" +
         "(memory.copy (i32.const 19) (i32.const 20) (i32.const 5))",
         [e,e,3,1,4, 1,e,2,7,1, 8,e,7,e,7, 5,2,7,e,9, e,7,e,8,8, e,e,e,e,e]);

function checkDataCount(count, err) {
    let binary = moduleWithSections(
        [v2vSigSection,
         dataCountSection(count),
         dataSection([
           {offset: 0, elems: []},
           {offset: 0, elems: []},
         ])
        ]);
    assertErrorMessage(() => new WebAssembly.Module(binary),
                       WebAssembly.CompileError,
                       err);
}

// DataCount section is present but value is too low for the number of data segments
checkDataCount(1, /number of data segments does not match declared count/);
// DataCount section is present but value is too high for the number of data segments
checkDataCount(3, /number of data segments does not match declared count/);

// DataCount section is not present but memory.init or data.drop uses it
function checkNoDataCount(body, err) {
    let binary = moduleWithSections(
        [v2vSigSection,
         declSection([0]),
         memorySection(1),
         bodySection(
             [funcBody({locals:[], body})])]);
    assertErrorMessage(() => new WebAssembly.Module(binary),
                       WebAssembly.CompileError,
                       err);
}

checkNoDataCount([I32ConstCode, 0,
                  I32ConstCode, 0,
                  I32ConstCode, 0,
                  MiscPrefix, MemoryInitCode, 0, 0],
                /(memory.init requires a DataCount section)|(unknown data segment)/);

checkNoDataCount([MiscPrefix, DataDropCode, 0],
                 /(data.drop requires a DataCount section)|(unknown data segment)/);

//---------------------------------------------------------------------//
//---------------------------------------------------------------------//
// Some further tests for memory.copy and memory.fill.  First, validation
// tests.

// Prefixed opcodes

function checkMiscPrefixed(opcode, expect_failure) {
    let binary = moduleWithSections(
           [v2vSigSection, declSection([0]), memorySection(1),
            bodySection(
                [funcBody(
                    {locals:[],
                     body:[I32ConstCode, 0x0,
                           I32ConstCode, 0x0,
                           I32ConstCode, 0x0,
                           MiscPrefix, ...opcode]})])]);
    if (expect_failure) {
        assertErrorMessage(() => new WebAssembly.Module(binary),
                           WebAssembly.CompileError, /(unrecognized opcode)|(Unknown.*subopcode)/);
    } else {
        assertEq(WebAssembly.validate(binary), true);
    }
}

//-----------------------------------------------------------
// Verification cases for memory.copy/fill opcode encodings

checkMiscPrefixed([MemoryCopyCode, 0x00, 0x00], false); // memory.copy src=0 dest=0
checkMiscPrefixed([MemoryFillCode, 0x00], false); // memory.fill mem=0
checkMiscPrefixed([0x13], true);        // table.size+1, which is currently unassigned

//-----------------------------------------------------------
// Verification cases for memory.copy/fill arguments

// Invalid argument types
{
    const tys = ['i32', 'f32', 'i64', 'f64'];
    const ops = ['copy', 'fill'];
    for (let ty1 of tys) {
    for (let ty2 of tys) {
    for (let ty3 of tys) {
    for (let op of ops) {
        if (ty1 == 'i32' && ty2 == 'i32' && ty3 == 'i32')
            continue;  // this is the only valid case
        let text =
        `(module
          (memory (export "memory") 1 1)
           (func (export "testfn")
           (memory.${op} (${ty1}.const 10) (${ty2}.const 20) (${ty3}.const 30))
          )
         )`;
        assertErrorMessage(() => wasmEvalText(text),
                           WebAssembly.CompileError, /type mismatch/);
    }}}}
}

// Not enough, or too many, args
{
    for (let op of ['copy', 'fill']) {
        let text1 =
        `(module
          (memory (export "memory") 1 1)
          (func (export "testfn")
           (i32.const 10)
           (i32.const 20)
           memory.${op}
         )
        )`;
        assertErrorMessage(() => wasmEvalText(text1),
                           WebAssembly.CompileError,
                           /(popping value from empty stack)|(expected i32 but nothing on stack)/);
        let text2 =
        `(module
          (memory (export "memory") 1 1)
          (func (export "testfn")
           (i32.const 10)
           (i32.const 20)
           (i32.const 30)
           (i32.const 40)
           memory.${op}
         )
        )`;
        assertErrorMessage(() => wasmEvalText(text2),
                           WebAssembly.CompileError,
                           /(unused values not explicitly dropped by end of block)|(values remaining on stack at end of block)/);
    }
}

// Module doesn't have a memory
{
    for (let op of ['copy', 'fill']) {
        let text =
        `(module
          (func (export "testfn")
           (memory.${op} (i32.const 10) (i32.const 20) (i32.const 30))
         )
        )`;
        assertErrorMessage(() => wasmEvalText(text),
                           WebAssembly.CompileError,
                           /(can't touch memory without memory)|(unknown memory)/);
    }
}

//---------------------------------------------------------------------//
//---------------------------------------------------------------------//
// Run tests

//-----------------------------------------------------------
// Test helpers
function checkRange(arr, minIx, maxIxPlusOne, expectedValue)
{
    for (let i = minIx; i < maxIxPlusOne; i++) {
        assertEq(arr[i], expectedValue);
    }
}

//-----------------------------------------------------------
// Test cases for memory.fill

// Range valid
{
    let inst = wasmEvalText(
    `(module
       (memory (export "memory") 1 1)
       (func (export "testfn")
         (memory.fill (i32.const 0xFF00) (i32.const 0x55) (i32.const 256))
       )
     )`
    );
    inst.exports.testfn();
    let b = new Uint8Array(inst.exports.memory.buffer);
    checkRange(b, 0x00000, 0x0FF00, 0x00);
    checkRange(b, 0x0FF00, 0x10000, 0x55);
}

// Range invalid
{
    let inst = wasmEvalText(
    `(module
       (memory (export "memory") 1 1)
       (func (export "testfn")
         (memory.fill (i32.const 0xFF00) (i32.const 0x55) (i32.const 257))
       )
     )`
    );
    assertErrorMessage(() => inst.exports.testfn(),
                       WebAssembly.RuntimeError, /index out of bounds/);
}

// Wraparound the end of 32-bit offset space
{
    let inst = wasmEvalText(
    `(module
       (memory (export "memory") 1 1)
       (func (export "testfn")
         (memory.fill (i32.const 0xFFFFFF00) (i32.const 0x55) (i32.const 257))
       )
     )`
    );
    assertErrorMessage(() => inst.exports.testfn(),
                       WebAssembly.RuntimeError, /index out of bounds/);
}

// Zero len with offset in-bounds is a no-op
{
    let inst = wasmEvalText(
    `(module
       (memory (export "memory") 1 1)
       (func (export "testfn")
         (memory.fill (i32.const 0x12) (i32.const 0x55) (i32.const 0))
       )
     )`
    );
    inst.exports.testfn();
    let b = new Uint8Array(inst.exports.memory.buffer);
    checkRange(b, 0x00000, 0x10000, 0x00);
}

// Zero len with offset out-of-bounds is OK
{
    let inst = wasmEvalText(
    `(module
       (memory (export "memory") 1 1)
       (func (export "testfn")
         (memory.fill (i32.const 0x10000) (i32.const 0x55) (i32.const 0))
       )
     )`
    );
    inst.exports.testfn();
}

{
    let inst = wasmEvalText(
    `(module
       (memory (export "memory") 1 1)
       (func (export "testfn")
         (memory.fill (i32.const 0x10001) (i32.const 0x55) (i32.const 0))
       )
     )`
    );
    assertErrorMessage(() => inst.exports.testfn(),
                       WebAssembly.RuntimeError, /index out of bounds/);
}

// Very large range
{
    let inst = wasmEvalText(
    `(module
       (memory (export "memory") 1 1)
       (func (export "testfn")
         (memory.fill (i32.const 0x1) (i32.const 0xAA) (i32.const 0xFFFE))
       )
     )`
    );
    inst.exports.testfn();
    let b = new Uint8Array(inst.exports.memory.buffer);
    checkRange(b, 0x00000, 0x00001, 0x00);
    checkRange(b, 0x00001, 0x0FFFF, 0xAA);
    checkRange(b, 0x0FFFF, 0x10000, 0x00);
}

// Sequencing
{
    let i = wasmEvalText(
    `(module
       (memory (export "memory") 1 1)
       (func (export "testfn") (result i32)
         (memory.fill (i32.const 0x12) (i32.const 0x55) (i32.const 10))
         (memory.fill (i32.const 0x15) (i32.const 0xAA) (i32.const 4))
         i32.const 99
       )
     )`
    );
    i.exports.testfn();
    let b = new Uint8Array(i.exports.memory.buffer);
    checkRange(b, 0x0,     0x12+0,  0x00);
    checkRange(b, 0x12+0,  0x12+3,  0x55);
    checkRange(b, 0x12+3,  0x12+7,  0xAA);
    checkRange(b, 0x12+7,  0x12+10, 0x55);
    checkRange(b, 0x12+10, 0x10000, 0x00);
}


//-----------------------------------------------------------
// Test cases for memory.copy

// Both ranges valid.  Copy 5 bytes backwards by 1 (overlapping).
// result = 0x00--(09) 0x55--(11) 0x00--(pagesize-20)
{
    let inst = wasmEvalText(
    `(module
       (memory (export "memory") 1 1)
       (func (export "testfn")
         (memory.fill (i32.const 10) (i32.const 0x55) (i32.const 10))
         (memory.copy (i32.const 9) (i32.const 10) (i32.const 5))
       )
     )`
    );
    inst.exports.testfn();
    let b = new Uint8Array(inst.exports.memory.buffer);
    checkRange(b, 0,    0+9,     0x00);
    checkRange(b, 9,    9+11,    0x55);
    checkRange(b, 9+11, 0x10000, 0x00);
}

// Both ranges valid.  Copy 5 bytes forwards by 1 (overlapping).
// result = 0x00--(10) 0x55--(11) 0x00--(pagesize-19)
{
    let inst = wasmEvalText(
    `(module
       (memory (export "memory") 1 1)
       (func (export "testfn")
         (memory.fill (i32.const 10) (i32.const 0x55) (i32.const 10))
         (memory.copy (i32.const 16) (i32.const 15) (i32.const 5))
       )
     )`
    );
    inst.exports.testfn();
    let b = new Uint8Array(inst.exports.memory.buffer);
    checkRange(b, 0,     0+10,    0x00);
    checkRange(b, 10,    10+11,   0x55);
    checkRange(b, 10+11, 0x10000, 0x00);
}

// Destination range invalid
{
    let inst = wasmEvalText(
    `(module
       (memory (export "memory") 1 1)
       (func (export "testfn")
         (memory.copy (i32.const 0xFF00) (i32.const 0x8000) (i32.const 257))
       )
     )`
    );
    assertErrorMessage(() => inst.exports.testfn(),
                       WebAssembly.RuntimeError, /index out of bounds/);
}

// Destination wraparound the end of 32-bit offset space
{
    let inst = wasmEvalText(
    `(module
       (memory (export "memory") 1 1)
       (func (export "testfn")
         (memory.copy (i32.const 0xFFFFFF00) (i32.const 0x4000) (i32.const 257))
       )
     )`
    );
    assertErrorMessage(() => inst.exports.testfn(),
                       WebAssembly.RuntimeError, /index out of bounds/);
}

// Source range invalid
{
    let inst = wasmEvalText(
    `(module
       (memory (export "memory") 1 1)
       (func (export "testfn")
         (memory.copy (i32.const 0x8000) (i32.const 0xFF00) (i32.const 257))
       )
     )`
    );
    assertErrorMessage(() => inst.exports.testfn(),
                       WebAssembly.RuntimeError, /index out of bounds/);
}

// Source wraparound the end of 32-bit offset space
{
    let inst = wasmEvalText(
    `(module
       (memory (export "memory") 1 1)
       (func (export "testfn")
         (memory.copy (i32.const 0x4000) (i32.const 0xFFFFFF00) (i32.const 257))
       )
     )`
    );
    assertErrorMessage(() => inst.exports.testfn(),
                       WebAssembly.RuntimeError, /index out of bounds/);
}

// Zero len with both offsets in-bounds is a no-op
{
    let inst = wasmEvalText(
    `(module
       (memory (export "memory") 1 1)
       (func (export "testfn")
         (memory.fill (i32.const 0x0000) (i32.const 0x55) (i32.const 0x8000))
         (memory.fill (i32.const 0x8000) (i32.const 0xAA) (i32.const 0x8000))
         (memory.copy (i32.const 0x9000) (i32.const 0x7000) (i32.const 0))
       )
     )`
    );
    inst.exports.testfn();
    let b = new Uint8Array(inst.exports.memory.buffer);
    checkRange(b, 0x00000, 0x08000, 0x55);
    checkRange(b, 0x08000, 0x10000, 0xAA);
}

// Zero len with dest offset out-of-bounds at the edge of memory
{
    let inst = wasmEvalText(
    `(module
       (memory (export "memory") 1 1)
       (func (export "testfn")
         (memory.copy (i32.const 0x10000) (i32.const 0x7000) (i32.const 0))
       )
     )`
    );
    inst.exports.testfn();
}

// Ditto, but one element further out
{
    let inst = wasmEvalText(
    `(module
       (memory (export "memory") 1 1)
       (func (export "testfn")
         (memory.copy (i32.const 0x10001) (i32.const 0x7000) (i32.const 0))
       )
     )`
    );
    assertErrorMessage(() => inst.exports.testfn(),
                       WebAssembly.RuntimeError, /index out of bounds/);
}

// Zero len with src offset out-of-bounds at the edge of memory
{
    let inst = wasmEvalText(
    `(module
       (memory (export "memory") 1 1)
       (func (export "testfn")
         (memory.copy (i32.const 0x9000) (i32.const 0x10000) (i32.const 0))
       )
     )`
    );
    inst.exports.testfn();
}

// Ditto, but one element further out
{
    let inst = wasmEvalText(
    `(module
       (memory (export "memory") 1 1)
       (func (export "testfn")
         (memory.copy (i32.const 0x9000) (i32.const 0x10001) (i32.const 0))
       )
     )`
    );
    assertErrorMessage(() => inst.exports.testfn(),
                       WebAssembly.RuntimeError, /index out of bounds/);
}

// 100 random fills followed by 100 random copies, in a single-page buffer,
// followed by verification of the (now heavily mashed-around) buffer.
{
    let inst = wasmEvalText(
    `(module
       (memory (export "memory") 1 1)
       (func (export "testfn")
         (memory.fill (i32.const 17767) (i32.const 1) (i32.const 1344))
         (memory.fill (i32.const 39017) (i32.const 2) (i32.const 1055))
         (memory.fill (i32.const 56401) (i32.const 3) (i32.const 988))
         (memory.fill (i32.const 37962) (i32.const 4) (i32.const 322))
         (memory.fill (i32.const 7977) (i32.const 5) (i32.const 1994))
         (memory.fill (i32.const 22714) (i32.const 6) (i32.const 3036))
         (memory.fill (i32.const 16882) (i32.const 7) (i32.const 2372))
         (memory.fill (i32.const 43491) (i32.const 8) (i32.const 835))
         (memory.fill (i32.const 124) (i32.const 9) (i32.const 1393))
         (memory.fill (i32.const 2132) (i32.const 10) (i32.const 2758))
         (memory.fill (i32.const 8987) (i32.const 11) (i32.const 3098))
         (memory.fill (i32.const 52711) (i32.const 12) (i32.const 741))
         (memory.fill (i32.const 3958) (i32.const 13) (i32.const 2823))
         (memory.fill (i32.const 49715) (i32.const 14) (i32.const 1280))
         (memory.fill (i32.const 50377) (i32.const 15) (i32.const 1466))
         (memory.fill (i32.const 20493) (i32.const 16) (i32.const 3158))
         (memory.fill (i32.const 47665) (i32.const 17) (i32.const 544))
         (memory.fill (i32.const 12451) (i32.const 18) (i32.const 2669))
         (memory.fill (i32.const 24869) (i32.const 19) (i32.const 2651))
         (memory.fill (i32.const 45317) (i32.const 20) (i32.const 1570))
         (memory.fill (i32.const 43096) (i32.const 21) (i32.const 1691))
         (memory.fill (i32.const 33886) (i32.const 22) (i32.const 646))
         (memory.fill (i32.const 48555) (i32.const 23) (i32.const 1858))
         (memory.fill (i32.const 53453) (i32.const 24) (i32.const 2657))
         (memory.fill (i32.const 30363) (i32.const 25) (i32.const 981))
         (memory.fill (i32.const 9300) (i32.const 26) (i32.const 1807))
         (memory.fill (i32.const 50190) (i32.const 27) (i32.const 487))
         (memory.fill (i32.const 62753) (i32.const 28) (i32.const 530))
         (memory.fill (i32.const 36316) (i32.const 29) (i32.const 943))
         (memory.fill (i32.const 6768) (i32.const 30) (i32.const 381))
         (memory.fill (i32.const 51262) (i32.const 31) (i32.const 3089))
         (memory.fill (i32.const 49729) (i32.const 32) (i32.const 658))
         (memory.fill (i32.const 44540) (i32.const 33) (i32.const 1702))
         (memory.fill (i32.const 33342) (i32.const 34) (i32.const 1092))
         (memory.fill (i32.const 50814) (i32.const 35) (i32.const 1410))
         (memory.fill (i32.const 47594) (i32.const 36) (i32.const 2204))
         (memory.fill (i32.const 54123) (i32.const 37) (i32.const 2394))
         (memory.fill (i32.const 55183) (i32.const 38) (i32.const 250))
         (memory.fill (i32.const 22620) (i32.const 39) (i32.const 2097))
         (memory.fill (i32.const 17132) (i32.const 40) (i32.const 3264))
         (memory.fill (i32.const 54331) (i32.const 41) (i32.const 3299))
         (memory.fill (i32.const 39474) (i32.const 42) (i32.const 2796))
         (memory.fill (i32.const 36156) (i32.const 43) (i32.const 2070))
         (memory.fill (i32.const 35308) (i32.const 44) (i32.const 2763))
         (memory.fill (i32.const 32731) (i32.const 45) (i32.const 312))
         (memory.fill (i32.const 63746) (i32.const 46) (i32.const 192))
         (memory.fill (i32.const 30974) (i32.const 47) (i32.const 596))
         (memory.fill (i32.const 16635) (i32.const 48) (i32.const 501))
         (memory.fill (i32.const 57002) (i32.const 49) (i32.const 686))
         (memory.fill (i32.const 34299) (i32.const 50) (i32.const 385))
         (memory.fill (i32.const 60881) (i32.const 51) (i32.const 903))
         (memory.fill (i32.const 61445) (i32.const 52) (i32.const 2390))
         (memory.fill (i32.const 46972) (i32.const 53) (i32.const 1441))
         (memory.fill (i32.const 25973) (i32.const 54) (i32.const 3162))
         (memory.fill (i32.const 5566) (i32.const 55) (i32.const 2135))
         (memory.fill (i32.const 35977) (i32.const 56) (i32.const 519))
         (memory.fill (i32.const 44892) (i32.const 57) (i32.const 3280))
         (memory.fill (i32.const 46760) (i32.const 58) (i32.const 1678))
         (memory.fill (i32.const 46607) (i32.const 59) (i32.const 3168))
         (memory.fill (i32.const 22449) (i32.const 60) (i32.const 1441))
         (memory.fill (i32.const 58609) (i32.const 61) (i32.const 663))
         (memory.fill (i32.const 32261) (i32.const 62) (i32.const 1671))
         (memory.fill (i32.const 3063) (i32.const 63) (i32.const 721))
         (memory.fill (i32.const 34025) (i32.const 64) (i32.const 84))
         (memory.fill (i32.const 33338) (i32.const 65) (i32.const 2029))
         (memory.fill (i32.const 36810) (i32.const 66) (i32.const 29))
         (memory.fill (i32.const 19147) (i32.const 67) (i32.const 3034))
         (memory.fill (i32.const 12616) (i32.const 68) (i32.const 1043))
         (memory.fill (i32.const 18276) (i32.const 69) (i32.const 3324))
         (memory.fill (i32.const 4639) (i32.const 70) (i32.const 1091))
         (memory.fill (i32.const 16158) (i32.const 71) (i32.const 1997))
         (memory.fill (i32.const 18204) (i32.const 72) (i32.const 2259))
         (memory.fill (i32.const 50532) (i32.const 73) (i32.const 3189))
         (memory.fill (i32.const 11028) (i32.const 74) (i32.const 1968))
         (memory.fill (i32.const 15962) (i32.const 75) (i32.const 1455))
         (memory.fill (i32.const 45406) (i32.const 76) (i32.const 1177))
         (memory.fill (i32.const 54137) (i32.const 77) (i32.const 1568))
         (memory.fill (i32.const 33083) (i32.const 78) (i32.const 1642))
         (memory.fill (i32.const 61028) (i32.const 79) (i32.const 3284))
         (memory.fill (i32.const 51729) (i32.const 80) (i32.const 223))
         (memory.fill (i32.const 4361) (i32.const 81) (i32.const 2171))
         (memory.fill (i32.const 57514) (i32.const 82) (i32.const 1322))
         (memory.fill (i32.const 55724) (i32.const 83) (i32.const 2648))
         (memory.fill (i32.const 24091) (i32.const 84) (i32.const 1045))
         (memory.fill (i32.const 43183) (i32.const 85) (i32.const 3097))
         (memory.fill (i32.const 32307) (i32.const 86) (i32.const 2796))
         (memory.fill (i32.const 3811) (i32.const 87) (i32.const 2010))
         (memory.fill (i32.const 54856) (i32.const 88) (i32.const 0))
         (memory.fill (i32.const 49941) (i32.const 89) (i32.const 2069))
         (memory.fill (i32.const 20411) (i32.const 90) (i32.const 2896))
         (memory.fill (i32.const 33826) (i32.const 91) (i32.const 192))
         (memory.fill (i32.const 9402) (i32.const 92) (i32.const 2195))
         (memory.fill (i32.const 12413) (i32.const 93) (i32.const 24))
         (memory.fill (i32.const 14091) (i32.const 94) (i32.const 577))
         (memory.fill (i32.const 44058) (i32.const 95) (i32.const 2089))
         (memory.fill (i32.const 36735) (i32.const 96) (i32.const 3436))
         (memory.fill (i32.const 23288) (i32.const 97) (i32.const 2765))
         (memory.fill (i32.const 6392) (i32.const 98) (i32.const 830))
         (memory.fill (i32.const 33307) (i32.const 99) (i32.const 1938))
         (memory.fill (i32.const 21941) (i32.const 100) (i32.const 2750))
         (memory.copy (i32.const 59214) (i32.const 54248) (i32.const 2098))
         (memory.copy (i32.const 63026) (i32.const 39224) (i32.const 230))
         (memory.copy (i32.const 51833) (i32.const 23629) (i32.const 2300))
         (memory.copy (i32.const 6708) (i32.const 23996) (i32.const 639))
         (memory.copy (i32.const 6990) (i32.const 33399) (i32.const 1097))
         (memory.copy (i32.const 19403) (i32.const 10348) (i32.const 3197))
         (memory.copy (i32.const 27308) (i32.const 54406) (i32.const 100))
         (memory.copy (i32.const 27221) (i32.const 43682) (i32.const 1717))
         (memory.copy (i32.const 60528) (i32.const 8629) (i32.const 119))
         (memory.copy (i32.const 5947) (i32.const 2308) (i32.const 658))
         (memory.copy (i32.const 4787) (i32.const 51631) (i32.const 2269))
         (memory.copy (i32.const 12617) (i32.const 19197) (i32.const 833))
         (memory.copy (i32.const 11854) (i32.const 46505) (i32.const 3300))
         (memory.copy (i32.const 11376) (i32.const 45012) (i32.const 2281))
         (memory.copy (i32.const 34186) (i32.const 6697) (i32.const 2572))
         (memory.copy (i32.const 4936) (i32.const 1690) (i32.const 1328))
         (memory.copy (i32.const 63164) (i32.const 7637) (i32.const 1670))
         (memory.copy (i32.const 44568) (i32.const 18344) (i32.const 33))
         (memory.copy (i32.const 43918) (i32.const 22348) (i32.const 1427))
         (memory.copy (i32.const 46637) (i32.const 49819) (i32.const 1434))
         (memory.copy (i32.const 63684) (i32.const 8755) (i32.const 834))
         (memory.copy (i32.const 33485) (i32.const 20131) (i32.const 3317))
         (memory.copy (i32.const 40575) (i32.const 54317) (i32.const 3201))
         (memory.copy (i32.const 25812) (i32.const 59254) (i32.const 2452))
         (memory.copy (i32.const 19678) (i32.const 56882) (i32.const 346))
         (memory.copy (i32.const 15852) (i32.const 35914) (i32.const 2430))
         (memory.copy (i32.const 11824) (i32.const 35574) (i32.const 300))
         (memory.copy (i32.const 59427) (i32.const 13957) (i32.const 3153))
         (memory.copy (i32.const 34299) (i32.const 60594) (i32.const 1281))
         (memory.copy (i32.const 8964) (i32.const 12276) (i32.const 943))
         (memory.copy (i32.const 2827) (i32.const 10425) (i32.const 1887))
         (memory.copy (i32.const 43194) (i32.const 43910) (i32.const 738))
         (memory.copy (i32.const 63038) (i32.const 18949) (i32.const 122))
         (memory.copy (i32.const 24044) (i32.const 44761) (i32.const 1755))
         (memory.copy (i32.const 22608) (i32.const 14755) (i32.const 702))
         (memory.copy (i32.const 11284) (i32.const 26579) (i32.const 1830))
         (memory.copy (i32.const 23092) (i32.const 20471) (i32.const 1064))
         (memory.copy (i32.const 57248) (i32.const 54770) (i32.const 2631))
         (memory.copy (i32.const 25492) (i32.const 1025) (i32.const 3113))
         (memory.copy (i32.const 49588) (i32.const 44220) (i32.const 975))
         (memory.copy (i32.const 28280) (i32.const 41722) (i32.const 2336))
         (memory.copy (i32.const 61289) (i32.const 230) (i32.const 2872))
         (memory.copy (i32.const 22480) (i32.const 52506) (i32.const 2197))
         (memory.copy (i32.const 40553) (i32.const 9578) (i32.const 1958))
         (memory.copy (i32.const 29004) (i32.const 20862) (i32.const 2186))
         (memory.copy (i32.const 53029) (i32.const 43955) (i32.const 1037))
         (memory.copy (i32.const 25476) (i32.const 35667) (i32.const 1650))
         (memory.copy (i32.const 58516) (i32.const 45819) (i32.const 1986))
         (memory.copy (i32.const 38297) (i32.const 5776) (i32.const 1955))
         (memory.copy (i32.const 28503) (i32.const 55364) (i32.const 2368))
         (memory.copy (i32.const 62619) (i32.const 18108) (i32.const 1356))
         (memory.copy (i32.const 50149) (i32.const 13861) (i32.const 382))
         (memory.copy (i32.const 16904) (i32.const 36341) (i32.const 1900))
         (memory.copy (i32.const 48098) (i32.const 11358) (i32.const 2807))
         (memory.copy (i32.const 28512) (i32.const 40362) (i32.const 323))
         (memory.copy (i32.const 35506) (i32.const 27856) (i32.const 1670))
         (memory.copy (i32.const 62970) (i32.const 53332) (i32.const 1341))
         (memory.copy (i32.const 14133) (i32.const 46312) (i32.const 644))
         (memory.copy (i32.const 29030) (i32.const 19074) (i32.const 496))
         (memory.copy (i32.const 44952) (i32.const 47577) (i32.const 2784))
         (memory.copy (i32.const 39559) (i32.const 44661) (i32.const 1350))
         (memory.copy (i32.const 10352) (i32.const 29274) (i32.const 1475))
         (memory.copy (i32.const 46911) (i32.const 46178) (i32.const 1467))
         (memory.copy (i32.const 4905) (i32.const 28740) (i32.const 1895))
         (memory.copy (i32.const 38012) (i32.const 57253) (i32.const 1751))
         (memory.copy (i32.const 26446) (i32.const 27223) (i32.const 1127))
         (memory.copy (i32.const 58835) (i32.const 24657) (i32.const 1063))
         (memory.copy (i32.const 61356) (i32.const 38790) (i32.const 766))
         (memory.copy (i32.const 44160) (i32.const 2284) (i32.const 1520))
         (memory.copy (i32.const 32740) (i32.const 47237) (i32.const 3014))
         (memory.copy (i32.const 11148) (i32.const 21260) (i32.const 1011))
         (memory.copy (i32.const 7665) (i32.const 31612) (i32.const 3034))
         (memory.copy (i32.const 18044) (i32.const 12987) (i32.const 3320))
         (memory.copy (i32.const 57306) (i32.const 55905) (i32.const 308))
         (memory.copy (i32.const 24675) (i32.const 16815) (i32.const 1155))
         (memory.copy (i32.const 19900) (i32.const 10115) (i32.const 722))
         (memory.copy (i32.const 2921) (i32.const 5935) (i32.const 2370))
         (memory.copy (i32.const 32255) (i32.const 50095) (i32.const 2926))
         (memory.copy (i32.const 15126) (i32.const 17299) (i32.const 2607))
         (memory.copy (i32.const 45575) (i32.const 28447) (i32.const 2045))
         (memory.copy (i32.const 55149) (i32.const 36113) (i32.const 2596))
         (memory.copy (i32.const 28461) (i32.const 54157) (i32.const 1168))
         (memory.copy (i32.const 47951) (i32.const 53385) (i32.const 3137))
         (memory.copy (i32.const 30646) (i32.const 45155) (i32.const 2649))
         (memory.copy (i32.const 5057) (i32.const 4295) (i32.const 52))
         (memory.copy (i32.const 6692) (i32.const 24195) (i32.const 441))
         (memory.copy (i32.const 32984) (i32.const 27117) (i32.const 3445))
         (memory.copy (i32.const 32530) (i32.const 59372) (i32.const 2785))
         (memory.copy (i32.const 34361) (i32.const 8962) (i32.const 2406))
         (memory.copy (i32.const 17893) (i32.const 54538) (i32.const 3381))
         (memory.copy (i32.const 22685) (i32.const 44151) (i32.const 136))
         (memory.copy (i32.const 59089) (i32.const 7077) (i32.const 1045))
         (memory.copy (i32.const 42945) (i32.const 55028) (i32.const 2389))
         (memory.copy (i32.const 44693) (i32.const 20138) (i32.const 877))
         (memory.copy (i32.const 36810) (i32.const 25196) (i32.const 3447))
         (memory.copy (i32.const 45742) (i32.const 31888) (i32.const 854))
         (memory.copy (i32.const 24236) (i32.const 31866) (i32.const 1377))
         (memory.copy (i32.const 33778) (i32.const 692) (i32.const 1594))
         (memory.copy (i32.const 60618) (i32.const 18585) (i32.const 2987))
         (memory.copy (i32.const 50370) (i32.const 41271) (i32.const 1406))
       )
     )`
    );
    inst.exports.testfn();
    let b = new Uint8Array(inst.exports.memory.buffer);
    checkRange(b, 0, 124, 0);
    checkRange(b, 124, 1517, 9);
    checkRange(b, 1517, 2132, 0);
    checkRange(b, 2132, 2827, 10);
    checkRange(b, 2827, 2921, 92);
    checkRange(b, 2921, 3538, 83);
    checkRange(b, 3538, 3786, 77);
    checkRange(b, 3786, 4042, 97);
    checkRange(b, 4042, 4651, 99);
    checkRange(b, 4651, 5057, 0);
    checkRange(b, 5057, 5109, 99);
    checkRange(b, 5109, 5291, 0);
    checkRange(b, 5291, 5524, 72);
    checkRange(b, 5524, 5691, 92);
    checkRange(b, 5691, 6552, 83);
    checkRange(b, 6552, 7133, 77);
    checkRange(b, 7133, 7665, 99);
    checkRange(b, 7665, 8314, 0);
    checkRange(b, 8314, 8360, 62);
    checkRange(b, 8360, 8793, 86);
    checkRange(b, 8793, 8979, 83);
    checkRange(b, 8979, 9373, 79);
    checkRange(b, 9373, 9518, 95);
    checkRange(b, 9518, 9934, 59);
    checkRange(b, 9934, 10087, 77);
    checkRange(b, 10087, 10206, 5);
    checkRange(b, 10206, 10230, 77);
    checkRange(b, 10230, 10249, 41);
    checkRange(b, 10249, 11148, 83);
    checkRange(b, 11148, 11356, 74);
    checkRange(b, 11356, 11380, 93);
    checkRange(b, 11380, 11939, 74);
    checkRange(b, 11939, 12159, 68);
    checkRange(b, 12159, 12575, 83);
    checkRange(b, 12575, 12969, 79);
    checkRange(b, 12969, 13114, 95);
    checkRange(b, 13114, 14133, 59);
    checkRange(b, 14133, 14404, 76);
    checkRange(b, 14404, 14428, 57);
    checkRange(b, 14428, 14458, 59);
    checkRange(b, 14458, 14580, 32);
    checkRange(b, 14580, 14777, 89);
    checkRange(b, 14777, 15124, 59);
    checkRange(b, 15124, 15126, 36);
    checkRange(b, 15126, 15192, 100);
    checkRange(b, 15192, 15871, 96);
    checkRange(b, 15871, 15998, 95);
    checkRange(b, 15998, 17017, 59);
    checkRange(b, 17017, 17288, 76);
    checkRange(b, 17288, 17312, 57);
    checkRange(b, 17312, 17342, 59);
    checkRange(b, 17342, 17464, 32);
    checkRange(b, 17464, 17661, 89);
    checkRange(b, 17661, 17727, 59);
    checkRange(b, 17727, 17733, 5);
    checkRange(b, 17733, 17893, 96);
    checkRange(b, 17893, 18553, 77);
    checkRange(b, 18553, 18744, 42);
    checkRange(b, 18744, 18801, 76);
    checkRange(b, 18801, 18825, 57);
    checkRange(b, 18825, 18876, 59);
    checkRange(b, 18876, 18885, 77);
    checkRange(b, 18885, 18904, 41);
    checkRange(b, 18904, 19567, 83);
    checkRange(b, 19567, 20403, 96);
    checkRange(b, 20403, 21274, 77);
    checkRange(b, 21274, 21364, 100);
    checkRange(b, 21364, 21468, 74);
    checkRange(b, 21468, 21492, 93);
    checkRange(b, 21492, 22051, 74);
    checkRange(b, 22051, 22480, 68);
    checkRange(b, 22480, 22685, 100);
    checkRange(b, 22685, 22694, 68);
    checkRange(b, 22694, 22821, 10);
    checkRange(b, 22821, 22869, 100);
    checkRange(b, 22869, 24107, 97);
    checkRange(b, 24107, 24111, 37);
    checkRange(b, 24111, 24236, 77);
    checkRange(b, 24236, 24348, 72);
    checkRange(b, 24348, 24515, 92);
    checkRange(b, 24515, 24900, 83);
    checkRange(b, 24900, 25136, 95);
    checkRange(b, 25136, 25182, 85);
    checkRange(b, 25182, 25426, 68);
    checkRange(b, 25426, 25613, 89);
    checkRange(b, 25613, 25830, 96);
    checkRange(b, 25830, 26446, 100);
    checkRange(b, 26446, 26517, 10);
    checkRange(b, 26517, 27468, 92);
    checkRange(b, 27468, 27503, 95);
    checkRange(b, 27503, 27573, 77);
    checkRange(b, 27573, 28245, 92);
    checkRange(b, 28245, 28280, 95);
    checkRange(b, 28280, 29502, 77);
    checkRange(b, 29502, 29629, 42);
    checkRange(b, 29629, 30387, 83);
    checkRange(b, 30387, 30646, 77);
    checkRange(b, 30646, 31066, 92);
    checkRange(b, 31066, 31131, 77);
    checkRange(b, 31131, 31322, 42);
    checkRange(b, 31322, 31379, 76);
    checkRange(b, 31379, 31403, 57);
    checkRange(b, 31403, 31454, 59);
    checkRange(b, 31454, 31463, 77);
    checkRange(b, 31463, 31482, 41);
    checkRange(b, 31482, 31649, 83);
    checkRange(b, 31649, 31978, 72);
    checkRange(b, 31978, 32145, 92);
    checkRange(b, 32145, 32530, 83);
    checkRange(b, 32530, 32766, 95);
    checkRange(b, 32766, 32812, 85);
    checkRange(b, 32812, 33056, 68);
    checkRange(b, 33056, 33660, 89);
    checkRange(b, 33660, 33752, 59);
    checkRange(b, 33752, 33775, 36);
    checkRange(b, 33775, 33778, 32);
    checkRange(b, 33778, 34603, 9);
    checkRange(b, 34603, 35218, 0);
    checkRange(b, 35218, 35372, 10);
    checkRange(b, 35372, 35486, 77);
    checkRange(b, 35486, 35605, 5);
    checkRange(b, 35605, 35629, 77);
    checkRange(b, 35629, 35648, 41);
    checkRange(b, 35648, 36547, 83);
    checkRange(b, 36547, 36755, 74);
    checkRange(b, 36755, 36767, 93);
    checkRange(b, 36767, 36810, 83);
    checkRange(b, 36810, 36839, 100);
    checkRange(b, 36839, 37444, 96);
    checkRange(b, 37444, 38060, 100);
    checkRange(b, 38060, 38131, 10);
    checkRange(b, 38131, 39082, 92);
    checkRange(b, 39082, 39117, 95);
    checkRange(b, 39117, 39187, 77);
    checkRange(b, 39187, 39859, 92);
    checkRange(b, 39859, 39894, 95);
    checkRange(b, 39894, 40257, 77);
    checkRange(b, 40257, 40344, 89);
    checkRange(b, 40344, 40371, 59);
    checkRange(b, 40371, 40804, 77);
    checkRange(b, 40804, 40909, 5);
    checkRange(b, 40909, 42259, 92);
    checkRange(b, 42259, 42511, 77);
    checkRange(b, 42511, 42945, 83);
    checkRange(b, 42945, 43115, 77);
    checkRange(b, 43115, 43306, 42);
    checkRange(b, 43306, 43363, 76);
    checkRange(b, 43363, 43387, 57);
    checkRange(b, 43387, 43438, 59);
    checkRange(b, 43438, 43447, 77);
    checkRange(b, 43447, 43466, 41);
    checkRange(b, 43466, 44129, 83);
    checkRange(b, 44129, 44958, 96);
    checkRange(b, 44958, 45570, 77);
    checkRange(b, 45570, 45575, 92);
    checkRange(b, 45575, 45640, 77);
    checkRange(b, 45640, 45742, 42);
    checkRange(b, 45742, 45832, 72);
    checkRange(b, 45832, 45999, 92);
    checkRange(b, 45999, 46384, 83);
    checkRange(b, 46384, 46596, 95);
    checkRange(b, 46596, 46654, 92);
    checkRange(b, 46654, 47515, 83);
    checkRange(b, 47515, 47620, 77);
    checkRange(b, 47620, 47817, 79);
    checkRange(b, 47817, 47951, 95);
    checkRange(b, 47951, 48632, 100);
    checkRange(b, 48632, 48699, 97);
    checkRange(b, 48699, 48703, 37);
    checkRange(b, 48703, 49764, 77);
    checkRange(b, 49764, 49955, 42);
    checkRange(b, 49955, 50012, 76);
    checkRange(b, 50012, 50036, 57);
    checkRange(b, 50036, 50087, 59);
    checkRange(b, 50087, 50096, 77);
    checkRange(b, 50096, 50115, 41);
    checkRange(b, 50115, 50370, 83);
    checkRange(b, 50370, 51358, 92);
    checkRange(b, 51358, 51610, 77);
    checkRange(b, 51610, 51776, 83);
    checkRange(b, 51776, 51833, 89);
    checkRange(b, 51833, 52895, 100);
    checkRange(b, 52895, 53029, 97);
    checkRange(b, 53029, 53244, 68);
    checkRange(b, 53244, 54066, 100);
    checkRange(b, 54066, 54133, 97);
    checkRange(b, 54133, 54137, 37);
    checkRange(b, 54137, 55198, 77);
    checkRange(b, 55198, 55389, 42);
    checkRange(b, 55389, 55446, 76);
    checkRange(b, 55446, 55470, 57);
    checkRange(b, 55470, 55521, 59);
    checkRange(b, 55521, 55530, 77);
    checkRange(b, 55530, 55549, 41);
    checkRange(b, 55549, 56212, 83);
    checkRange(b, 56212, 57048, 96);
    checkRange(b, 57048, 58183, 77);
    checkRange(b, 58183, 58202, 41);
    checkRange(b, 58202, 58516, 83);
    checkRange(b, 58516, 58835, 95);
    checkRange(b, 58835, 58855, 77);
    checkRange(b, 58855, 59089, 95);
    checkRange(b, 59089, 59145, 77);
    checkRange(b, 59145, 59677, 99);
    checkRange(b, 59677, 60134, 0);
    checkRange(b, 60134, 60502, 89);
    checkRange(b, 60502, 60594, 59);
    checkRange(b, 60594, 60617, 36);
    checkRange(b, 60617, 60618, 32);
    checkRange(b, 60618, 60777, 42);
    checkRange(b, 60777, 60834, 76);
    checkRange(b, 60834, 60858, 57);
    checkRange(b, 60858, 60909, 59);
    checkRange(b, 60909, 60918, 77);
    checkRange(b, 60918, 60937, 41);
    checkRange(b, 60937, 61600, 83);
    checkRange(b, 61600, 62436, 96);
    checkRange(b, 62436, 63307, 77);
    checkRange(b, 63307, 63397, 100);
    checkRange(b, 63397, 63501, 74);
    checkRange(b, 63501, 63525, 93);
    checkRange(b, 63525, 63605, 74);
    checkRange(b, 63605, 63704, 100);
    checkRange(b, 63704, 63771, 97);
    checkRange(b, 63771, 63775, 37);
    checkRange(b, 63775, 64311, 77);
    checkRange(b, 64311, 64331, 26);
    checkRange(b, 64331, 64518, 92);
    checkRange(b, 64518, 64827, 11);
    checkRange(b, 64827, 64834, 26);
    checkRange(b, 64834, 65536, 0);
}

// Make sure dead code doesn't prevent compilation.
wasmEvalText(
    `(module
       (memory 0 10)
       (data (i32.const 0))
       (func
         (return)
         (memory.init 0)
        )
    )`);

wasmEvalText(
    `(module
       (memory 0 10)
       (func
         (return)
         (memory.fill)
        )
    )`);

wasmEvalText(
    `(module
       (table (export "t") 10 funcref)
       (elem (i32.const 0) 0)
       (func
         (return)
         (elem.drop 0)
        )
    )`);
