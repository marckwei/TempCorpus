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

// Do not include this in the preamble, it must be loaded after lib/wasm.js
load(scriptdir + "ad-hack-preamble.js")

// Widening multiplication.
// This is to be moved into ad-hack.js
//
//   (iMxN.extmul_{high,low}_iKxL_{s,u} A B)
//
// is equivalent to
//
//   (iMxN.mul (iMxN.extend_{high,low}_iKxL_{s,u} A)
//             (iMxN.extend_{high,low}_iKxL_{s,u} B))
//
// It doesn't really matter what the inputs are, we can test this almost
// blindly.
//
// Unfortunately, we do not yet have i64x2.extend_* so we introduce a helper
// function to compute that.

function makeExtMulTest(wide, narrow, part, signed) {
    let widener = (wide == 'i64x2') ?
        `call $${wide}_extend_${part}_${narrow}_${signed}` :
        `${wide}.extend_${part}_${narrow}_${signed}`;
    return `
    (func (export "${wide}_extmul_${part}_${narrow}_${signed}")
      (v128.store (i32.const 0)
         (${wide}.extmul_${part}_${narrow}_${signed} (v128.load (i32.const 16))
                                                     (v128.load (i32.const 32))))
      (v128.store (i32.const 48)
         (${wide}.mul (${widener} (v128.load (i32.const 16)))
                      (${widener} (v128.load (i32.const 32))))))
`;
}

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func $i64x2_extend_low_i32x4_s (param v128) (result v128)
      (i64x2.shr_s (i8x16.shuffle 16 16 16 16 0 1 2 3 16 16 16 16 4 5 6 7
                                  (local.get 0)
                                  (v128.const i32x4 0 0 0 0))
                   (i32.const 32)))
    (func $i64x2_extend_high_i32x4_s (param v128) (result v128)
      (i64x2.shr_s (i8x16.shuffle 16 16 16 16 8 9 10 11 16 16 16 16 12 13 14 15
                                  (local.get 0)
                                  (v128.const i32x4 0 0 0 0))
                   (i32.const 32)))
    (func $i64x2_extend_low_i32x4_u (param v128) (result v128)
      (i8x16.shuffle 0 1 2 3 16 16 16 16 4 5 6 7 16 16 16 16
                     (local.get 0)
                     (v128.const i32x4 0 0 0 0)))
    (func $i64x2_extend_high_i32x4_u (param v128) (result v128)
      (i8x16.shuffle 8 9 10 11 16 16 16 16 12 13 14 15 16 16 16 16
                     (local.get 0)
                     (v128.const i32x4 0 0 0 0)))
    ${makeExtMulTest('i64x2','i32x4','low','s')}
    ${makeExtMulTest('i64x2','i32x4','high','s')}
    ${makeExtMulTest('i64x2','i32x4','low','u')}
    ${makeExtMulTest('i64x2','i32x4','high','u')}
    ${makeExtMulTest('i32x4','i16x8','low','s')}
    ${makeExtMulTest('i32x4','i16x8','high','s')}
    ${makeExtMulTest('i32x4','i16x8','low','u')}
    ${makeExtMulTest('i32x4','i16x8','high','u')}
    ${makeExtMulTest('i16x8','i8x16','low','s')}
    ${makeExtMulTest('i16x8','i8x16','high','s')}
    ${makeExtMulTest('i16x8','i8x16','low','u')}
    ${makeExtMulTest('i16x8','i8x16','high','u')})`);

for ( let [ WideArray, NarrowArray ] of
      [ [ Int16Array, Int8Array ],
        [ Int32Array, Int16Array ],
        [ BigInt64Array, Int32Array ] ] ) {
    let narrowMem = new NarrowArray(ins.exports.mem.buffer);
    let narrowSrc0 = 16/NarrowArray.BYTES_PER_ELEMENT;
    let narrowSrc1 = 32/NarrowArray.BYTES_PER_ELEMENT;
    let wideMem = new WideArray(ins.exports.mem.buffer);
    let wideElems = 16/WideArray.BYTES_PER_ELEMENT;
    let wideRes0 = 0;
    let wideRes1 = 48/WideArray.BYTES_PER_ELEMENT;
    let zero = iota(wideElems).map(_ => 0);
    for ( let part of [ 'low', 'high' ] ) {
        for ( let signed of [ 's', 'u' ] ) {
            for ( let [a, b] of cross(NarrowArray.inputs) ) {
                set(wideMem, wideRes0, zero);
                set(wideMem, wideRes1, zero);
                set(narrowMem, narrowSrc0, a);
                set(narrowMem, narrowSrc1, b);
                let test = `${WideArray.layoutName}_extmul_${part}_${NarrowArray.layoutName}_${signed}`;
                ins.exports[test]();
                assertSame(get(wideMem, wideRes0, wideElems),
                           get(wideMem, wideRes1, wideElems));
            }
        }
    }
}

// Bitmask.  Ion constant folds, so test that too.
// This is to be merged into the existing bitmask tests in ad-hack.js.

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "bitmask_i64x2") (result i32)
      (i64x2.bitmask (v128.load (i32.const 16))))
    (func (export "const_bitmask_i64x2") (result i32)
      (i64x2.bitmask (v128.const i64x2 0xff337f8012345678 0x0001984212345678))))`);

var mem8 = new Uint8Array(ins.exports.mem.buffer);
var mem64 = new BigUint64Array(ins.exports.mem.buffer);

set(mem8, 16, iota(16).map((_) => 0));
assertEq(ins.exports.bitmask_i64x2(), 0);

set(mem64, 2, [0x8000000000000000n, 0x8000000000000000n]);
assertEq(ins.exports.bitmask_i64x2(), 3);

set(mem64, 2, [0x7FFFFFFFFFFFFFFFn, 0x7FFFFFFFFFFFFFFFn]);
assertEq(ins.exports.bitmask_i64x2(), 0);

set(mem64, 2, [0n, 0x8000000000000000n]);
assertEq(ins.exports.bitmask_i64x2(), 2);

set(mem64, 2, [0x8000000000000000n, 0n]);
assertEq(ins.exports.bitmask_i64x2(), 1);

assertEq(ins.exports.const_bitmask_i64x2(), 1);

// Widen low/high.
// This is to be merged into the existing widening tests in ad-hack.js.

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "extend_low_i32x4_s")
      (v128.store (i32.const 0) (i64x2.extend_low_i32x4_s (v128.load (i32.const 16)))))
    (func (export "extend_high_i32x4_s")
      (v128.store (i32.const 0) (i64x2.extend_high_i32x4_s (v128.load (i32.const 16)))))
    (func (export "extend_low_i32x4_u")
      (v128.store (i32.const 0) (i64x2.extend_low_i32x4_u (v128.load (i32.const 16)))))
    (func (export "extend_high_i32x4_u")
      (v128.store (i32.const 0) (i64x2.extend_high_i32x4_u (v128.load (i32.const 16))))))`);

var mem32 = new Int32Array(ins.exports.mem.buffer);
var mem64 = new BigInt64Array(ins.exports.mem.buffer);
var mem64u = new BigUint64Array(ins.exports.mem.buffer);

var as = [205, 1, 192, 3].map((x) => x << 24);
set(mem32, 4, as);

ins.exports.extend_low_i32x4_s();
assertSame(get(mem64, 0, 2), iota(2).map((n) => BigInt(as[n])))

ins.exports.extend_high_i32x4_s();
assertSame(get(mem64, 0, 2), iota(2).map((n) => BigInt(as[n+2])));

ins.exports.extend_low_i32x4_u();
assertSame(get(mem64u, 0, 2), iota(2).map((n) => BigInt(as[n] >>> 0)));

ins.exports.extend_high_i32x4_u();
assertSame(get(mem64u, 0, 2), iota(2).map((n) => BigInt(as[n+2] >>> 0)));

// Saturating rounding q-format multiplication.
// This is to be moved into ad-hack.js

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "q15mulr_sat_s")
      (v128.store (i32.const 0) (i16x8.q15mulr_sat_s (v128.load (i32.const 16)) (v128.load (i32.const 32))))))`);

var mem16 = new Int16Array(ins.exports.mem.buffer);
for ( let [as, bs] of cross(Int16Array.inputs) ) {
    set(mem16, 8, as);
    set(mem16, 16, bs);
    ins.exports.q15mulr_sat_s();
    assertSame(get(mem16, 0, 8),
               iota(8).map((i) => signed_saturate((as[i] * bs[i] + 0x4000) >> 15, 16)));
}


// i64.all_true

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "i64_all_true") (result i32)
      (i64x2.all_true (v128.load (i32.const 16)) ) ) )`);

var mem32 = new Int32Array(ins.exports.mem.buffer);

set(mem32, 4, [0, 0, 0, 0]);
assertEq(0, ins.exports.i64_all_true());
set(mem32, 4, [1, 0, 0, 0]);
assertEq(0, ins.exports.i64_all_true());
set(mem32, 4, [1, 0, 0, 1]);
assertEq(1, ins.exports.i64_all_true());
set(mem32, 4, [0, 0, 10, 0]);
assertEq(0, ins.exports.i64_all_true());
set(mem32, 4, [0, -250, 1, 0]);
assertEq(1, ins.exports.i64_all_true());
set(mem32, 4, [-1, -1, -1, -1]);
assertEq(1, ins.exports.i64_all_true());

if (this.wasmSimdAnalysis && wasmCompileMode() == "ion") {
  const positive =
      wasmCompile(
          `(module
              (memory (export "mem") 1 1)
              (func $f (param v128) (result i32)
                  (if (result i32) (i64x2.all_true (local.get 0))
                      (i32.const 42)
                      (i32.const 37)))
              (func (export "run") (result i32)
                (call $f (v128.load (i32.const 16)))))`);
  assertEq(wasmSimdAnalysis(), "simd128-to-scalar-and-branch -> folded");

  const negative =
      wasmCompile(
          `(module
              (memory (export "mem") 1 1)
              (func $f (param v128) (result i32)
                  (if (result i32) (i32.eqz (i64x2.all_true (local.get 0)))
                      (i32.const 42)
                      (i32.const 37)))
              (func (export "run") (result i32)
                (call $f (v128.load (i32.const 16)))))`);
  assertEq(wasmSimdAnalysis(), "simd128-to-scalar-and-branch -> folded");

  for ( let inp of [[1n, 2n], [4n, 0n], [0n, 0n]]) {
      const all_true = inp.every(v => v != 0n)
      let mem = new BigInt64Array(positive.exports.mem.buffer);
      set(mem, 2, inp);
      assertEq(positive.exports.run(), all_true ? 42 : 37);

      mem = new BigInt64Array(negative.exports.mem.buffer);
      set(mem, 2, inp);
      assertEq(negative.exports.run(), all_true ? 37 : 42);
  }

  wasmCompile(`(module (func (result i32) (i64x2.all_true (v128.const i64x2 0 0))))`);
  assertEq(wasmSimdAnalysis(), "simd128-to-scalar -> constant folded");
}


// i64x2.eq and i64x2.ne

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "i64_eq")
      (v128.store (i32.const 0)
        (i64x2.eq (v128.load (i32.const 16)) (v128.load (i32.const 32))) ))
    (func (export "i64_ne")
      (v128.store (i32.const 0)
         (i64x2.ne (v128.load (i32.const 16)) (v128.load (i32.const 32))) )) )`);

var mem64 = new BigInt64Array(ins.exports.mem.buffer);

set(mem64, 2, [0n, 1n, 0n, 1n]);
ins.exports.i64_eq();
assertSame(get(mem64, 0, 2), [-1n, -1n]);
ins.exports.i64_ne();
assertSame(get(mem64, 0, 2), [0n, 0n]);
set(mem64, 2, [0x0n, -1n, 0x100000000n, -1n]);
ins.exports.i64_eq();
assertSame(get(mem64, 0, 2), [0n, -1n]);
set(mem64, 2, [-1n, 0x0n, -1n, 0x100000000n]);
ins.exports.i64_ne();
assertSame(get(mem64, 0, 2), [0n, -1n]);


// i64x2.lt, i64x2.gt, i64x2.le, and i64.ge

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "i64_lt_s")
      (v128.store (i32.const 0)
        (i64x2.lt_s (v128.load (i32.const 16)) (v128.load (i32.const 32))) ))
    (func (export "i64_gt_s")
      (v128.store (i32.const 0)
        (i64x2.gt_s (v128.load (i32.const 16)) (v128.load (i32.const 32))) ))
    (func (export "i64_le_s")
      (v128.store (i32.const 0)
        (i64x2.le_s (v128.load (i32.const 16)) (v128.load (i32.const 32))) ))
    (func (export "i64_ge_s")
      (v128.store (i32.const 0)
        (i64x2.ge_s (v128.load (i32.const 16)) (v128.load (i32.const 32))) )) )`);

var mem64 = new BigInt64Array(ins.exports.mem.buffer);

set(mem64, 2, [0n, 1n, 1n, 0n]);
ins.exports.i64_lt_s();
assertSame(get(mem64, 0, 2), [-1n, 0n]);
ins.exports.i64_gt_s();
assertSame(get(mem64, 0, 2), [0n, -1n]);
ins.exports.i64_le_s();
assertSame(get(mem64, 0, 2), [-1n, 0n]);
ins.exports.i64_ge_s();
assertSame(get(mem64, 0, 2), [0n, -1n]);

set(mem64, 2, [0n, -1n, -1n, 0n]);
ins.exports.i64_lt_s();
assertSame(get(mem64, 0, 2), [0n, -1n]);
ins.exports.i64_gt_s();
assertSame(get(mem64, 0, 2), [-1n, 0n]);
ins.exports.i64_le_s();
assertSame(get(mem64, 0, 2), [0n, -1n]);
ins.exports.i64_ge_s();
assertSame(get(mem64, 0, 2), [-1n, 0n]);

set(mem64, 2, [-2n, 2n, -1n, 1n]);
ins.exports.i64_lt_s();
assertSame(get(mem64, 0, 2), [-1n, 0n]);
ins.exports.i64_gt_s();
assertSame(get(mem64, 0, 2), [0n, -1n]);
ins.exports.i64_le_s();
assertSame(get(mem64, 0, 2), [-1n, 0n]);
ins.exports.i64_ge_s();
assertSame(get(mem64, 0, 2), [0n, -1n]);

set(mem64, 2, [-2n, 1n, -2n, 1n]);
ins.exports.i64_lt_s();
assertSame(get(mem64, 0, 2), [0n, 0n]);
ins.exports.i64_gt_s();
assertSame(get(mem64, 0, 2), [0n, 0n]);
ins.exports.i64_le_s();
assertSame(get(mem64, 0, 2), [-1n, -1n]);
ins.exports.i64_ge_s();
assertSame(get(mem64, 0, 2), [-1n, -1n]);


function wasmCompile(text) {
  return new WebAssembly.Instance(new WebAssembly.Module(wasmTextToBinary(text)))
}


// i64x2.abs

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "i64_abs")
      (v128.store (i32.const 0)
        (i64x2.abs (v128.load (i32.const 16))) )) )`);

var mem64 = new BigInt64Array(ins.exports.mem.buffer);

set(mem64, 2, [-3n, 42n]);
ins.exports.i64_abs();
assertSame(get(mem64, 0, 2), [3n, 42n]);
set(mem64, 2, [0n, -0x8000000000000000n]);
ins.exports.i64_abs();
assertSame(get(mem64, 0, 2), [0n, -0x8000000000000000n]);


// Load lane

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    ${iota(16).map(i => `(func (export "load8_lane_${i}") (param i32)
      (v128.store (i32.const 0)
        (v128.load8_lane offset=0 ${i} (local.get 0) (v128.load (i32.const 16)))))
    `).join('')}
    ${iota(8).map(i => `(func (export "load16_lane_${i}") (param i32)
    (v128.store (i32.const 0)
      (v128.load16_lane offset=0 ${i} (local.get 0) (v128.load (i32.const 16)))))
    `).join('')}
    ${iota(4).map(i => `(func (export "load32_lane_${i}") (param i32)
    (v128.store (i32.const 0)
      (v128.load32_lane offset=0 ${i} (local.get 0) (v128.load (i32.const 16)))))
    `).join('')}
    ${iota(2).map(i => `(func (export "load64_lane_${i}") (param i32)
    (v128.store (i32.const 0)
      (v128.load64_lane offset=0 ${i} (local.get 0) (v128.load (i32.const 16)))))
    `).join('')}
    (func (export "load_lane_const_and_align")
      (v128.store (i32.const 0)
        (v128.load64_lane offset=32 1 (i32.const 1)
          (v128.load32_lane offset=32 1 (i32.const 3)
            (v128.load16_lane offset=32 0 (i32.const 5)
              (v128.load (i32.const 16)))))
      ))
  )`);

var mem8 = new Int8Array(ins.exports.mem.buffer);
var mem32 = new Int32Array(ins.exports.mem.buffer);
var mem64 = new BigInt64Array(ins.exports.mem.buffer);

var as = [0x12345678, 0x23456789, 0x3456789A, 0x456789AB];
set(mem32, 4, as); set(mem8, 32, [0xC2]);

ins.exports["load8_lane_0"](32);
assertSame(get(mem32, 0, 4), [0x123456C2, 0x23456789, 0x3456789A, 0x456789AB]);
ins.exports["load8_lane_1"](32);
assertSame(get(mem32, 0, 4), [0x1234C278, 0x23456789, 0x3456789A, 0x456789AB]);
ins.exports["load8_lane_2"](32);
assertSame(get(mem32, 0, 4), [0x12C25678, 0x23456789, 0x3456789A, 0x456789AB]);
ins.exports["load8_lane_3"](32);
assertSame(get(mem32, 0, 4), [0xC2345678|0, 0x23456789, 0x3456789A, 0x456789AB]);
ins.exports["load8_lane_4"](32);
assertSame(get(mem32, 0, 4), [0x12345678, 0x234567C2, 0x3456789A, 0x456789AB]);
ins.exports["load8_lane_6"](32);
assertSame(get(mem32, 0, 4), [0x12345678, 0x23C26789, 0x3456789A, 0x456789AB]);
ins.exports["load8_lane_9"](32);
assertSame(get(mem32, 0, 4), [0x12345678, 0x23456789, 0x3456C29A, 0x456789AB]);
ins.exports["load8_lane_14"](32);
assertSame(get(mem32, 0, 4), [0x12345678, 0x23456789, 0x3456789A, 0x45C289AB]);

set(mem8, 32, [0xC2, 0xD1]);

ins.exports["load16_lane_0"](32);
assertSame(get(mem32, 0, 4), [0x1234D1C2, 0x23456789, 0x3456789A, 0x456789AB]);
ins.exports["load16_lane_1"](32);
assertSame(get(mem32, 0, 4), [0xD1C25678|0, 0x23456789, 0x3456789A, 0x456789AB]);
ins.exports["load16_lane_2"](32);
assertSame(get(mem32, 0, 4), [0x12345678, 0x2345D1C2, 0x3456789A, 0x456789AB]);
ins.exports["load16_lane_5"](32);
assertSame(get(mem32, 0, 4), [0x12345678, 0x23456789, 0xD1C2789A|0, 0x456789AB]);
ins.exports["load16_lane_7"](32);
assertSame(get(mem32, 0, 4), [0x12345678, 0x23456789, 0x3456789A, 0xD1C289AB|0]);

set(mem32, 8, [0x16B5C3D0]);

ins.exports["load32_lane_0"](32);
assertSame(get(mem32, 0, 4), [0x16B5C3D0, 0x23456789, 0x3456789A, 0x456789AB]);
ins.exports["load32_lane_1"](32);
assertSame(get(mem32, 0, 4), [0x12345678, 0x16B5C3D0, 0x3456789A, 0x456789AB]);
ins.exports["load32_lane_2"](32);
assertSame(get(mem32, 0, 4), [0x12345678, 0x23456789, 0x16B5C3D0, 0x456789AB]);
ins.exports["load32_lane_3"](32);
assertSame(get(mem32, 0, 4), [0x12345678, 0x23456789, 0x3456789A, 0x16B5C3D0]);

set(mem64, 4, [0x3300AA4416B5C3D0n]);

ins.exports["load64_lane_0"](32);
assertSame(get(mem64, 0, 2), [0x3300AA4416B5C3D0n, 0x456789AB3456789An]);
ins.exports["load64_lane_1"](32);
assertSame(get(mem64, 0, 2), [0x2345678912345678n, 0x3300AA4416B5C3D0n]);

// .. (mis)align load lane

var as = [0x12345678, 0x23456789, 0x3456789A, 0x456789AB];
set(mem32, 4, as); set(mem64, 4, [0x3300AA4416B5C3D0n, 0x300AA4416B5C3D03n]);

ins.exports["load16_lane_5"](33);
assertSame(get(mem32, 0, 4), [0x12345678,0x23456789,0xb5c3789a|0,0x456789ab]);
ins.exports["load32_lane_1"](34);
assertSame(get(mem32, 0, 4), [0x12345678, 0xaa4416b5|0,0x3456789a,0x456789ab]);
ins.exports["load64_lane_0"](35);
assertSame(get(mem64, 0, 2), [0x5c3d033300aa4416n, 0x456789ab3456789an]);

ins.exports["load_lane_const_and_align"]();
assertSame(get(mem32, 0, 4), [0x123400aa,0x00AA4416,0x4416b5c3,0x033300aa]);

// Store lane

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    ${iota(16).map(i => `(func (export "store8_lane_${i}") (param i32) (param i32)
      (v128.store8_lane ${i} (local.get 1) (v128.load (local.get 0))))
    `).join('')}
    ${iota(8).map(i => `(func (export "store16_lane_${i}") (param i32) (param i32)
      (v128.store16_lane ${i} (local.get 1) (v128.load (local.get 0))))
    `).join('')}
    ${iota(4).map(i => `(func (export "store32_lane_${i}") (param i32) (param i32)
      (v128.store32_lane ${i} (local.get 1) (v128.load (local.get 0))))
    `).join('')}
    ${iota(2).map(i => `(func (export "store64_lane_${i}") (param i32) (param i32)
      (v128.store64_lane ${i} (local.get 1) (v128.load (local.get 0))))
    `).join('')}
    (func (export "store_lane_const_and_align")
      (v128.store16_lane 1 (i32.const 33) (v128.load (i32.const 16)))
      (v128.store32_lane 2 (i32.const 37) (v128.load (i32.const 16)))
      (v128.store64_lane 0 (i32.const 47) (v128.load (i32.const 16)))
    ))`);


var mem8 = new Int8Array(ins.exports.mem.buffer);
var mem32 = new Int32Array(ins.exports.mem.buffer);
var mem64 = new BigInt64Array(ins.exports.mem.buffer);

var as = [0x12345678, 0x23456789, 0x3456789A, 0x456789AB];
set(mem32, 4, as); set(mem32, 0, [0x7799AA00, 42, 3, 0]);

ins.exports["store8_lane_0"](16, 0); assertSame(get(mem32, 0, 1), [0x7799AA78]);
ins.exports["store8_lane_1"](16, 0); assertSame(get(mem32, 0, 1), [0x7799AA56]);
ins.exports["store8_lane_2"](16, 0); assertSame(get(mem32, 0, 1), [0x7799AA34]);
ins.exports["store8_lane_3"](16, 0); assertSame(get(mem32, 0, 1), [0x7799AA12]);
ins.exports["store8_lane_5"](16, 0); assertSame(get(mem32, 0, 1), [0x7799AA67]);
ins.exports["store8_lane_7"](16, 0); assertSame(get(mem32, 0, 1), [0x7799AA23]);
ins.exports["store8_lane_8"](16, 0); assertSame(get(mem32, 0, 1), [0x7799AA9A]);
ins.exports["store8_lane_15"](16, 0); assertSame(get(mem32, 0, 1), [0x7799AA45]);

ins.exports["store16_lane_0"](16, 0); assertSame(get(mem32, 0, 1), [0x77995678]);
ins.exports["store16_lane_1"](16, 0); assertSame(get(mem32, 0, 1), [0x77991234]);
ins.exports["store16_lane_2"](16, 0); assertSame(get(mem32, 0, 1), [0x77996789]);
ins.exports["store16_lane_5"](16, 0); assertSame(get(mem32, 0, 1), [0x77993456]);
ins.exports["store16_lane_7"](16, 0); assertSame(get(mem32, 0, 1), [0x77994567]);

ins.exports["store32_lane_0"](16, 0); assertSame(get(mem32, 0, 2), [0x12345678, 42]);
ins.exports["store32_lane_1"](16, 0); assertSame(get(mem32, 0, 2), [0x23456789, 42]);
ins.exports["store32_lane_2"](16, 0); assertSame(get(mem32, 0, 2), [0x3456789A, 42]);
ins.exports["store32_lane_3"](16, 0); assertSame(get(mem32, 0, 2), [0x456789AB, 42]);

ins.exports["store64_lane_0"](16, 0); assertSame(get(mem64, 0, 2), [0x2345678912345678n, 3]);
ins.exports["store64_lane_1"](16, 0); assertSame(get(mem64, 0, 2), [0x456789AB3456789An, 3]);

// .. (mis)align store lane

var as = [0x12345678, 0x23456789, 0x3456789A, 0x456789AB];
set(mem32, 4, as); set(mem32, 0, [0x7799AA01, 42, 3, 0]);
ins.exports["store16_lane_1"](16, 1); assertSame(get(mem32, 0, 2), [0x77123401, 42]);
set(mem32, 0, [0x7799AA01, 42, 3, 0]);
ins.exports["store32_lane_1"](16, 2); assertSame(get(mem32, 0, 2), [0x6789AA01, 0x2345]);
set(mem32, 0, [0x7799AA01, 42, 5, 3]);
ins.exports["store64_lane_0"](16, 1);
assertSame(get(mem64, 0, 2), [0x4567891234567801n, 0x0300000023]);

set(mem32, 4, [
  0x12345678, 0x23456789, 0x3456789A, 0x456789AB,
  0x55AA55AA, 0xCC44CC44, 0x55AA55AA, 0xCC44CC44,
  0x55AA55AA, 0xCC44CC44, 0x55AA55AA, 0xCC44CC44,
]);
ins.exports["store_lane_const_and_align"]();
assertSame(get(mem32, 8, 8), [
  0x551234aa, 0x56789a44, 0x55aa5534, 0x7844cc44,
  0x89123456|0, 0xcc234567|0, 0x55aa55aa, 0xcc44cc44|0,
]);


// i8x16.popcnt

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "i8x16_popcnt")
      (v128.store (i32.const 0) (i8x16.popcnt (v128.load (i32.const 16)) )))
  )`);

var mem8 = new Int8Array(ins.exports.mem.buffer);

set(mem8, 16, [0, 1, 2, 4, 8, 0x10, 0x20, 0x40, 0x80, 3, -1, 0xF0, 0x11, 0xFE, 0x0F, 0xE]);
ins.exports.i8x16_popcnt();
assertSame(get(mem8, 0, 16), [0,1,1,1,1,1,1,1,1,2,8,4,2,7,4,3]);


/// Double-precision conversion instructions.
/// f64x2.convert_low_i32x4_{u,s} / i32x4.trunc_sat_f64x2_{u,s}_zero
/// f32x4.demote_f64x2_zero / f64x2.promote_low_f32x4

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "f64x2_convert_low_i32x4_s")
      (v128.store (i32.const 0) (f64x2.convert_low_i32x4_s (v128.load (i32.const 16)) )))
    (func (export "f64x2_convert_low_i32x4_u")
      (v128.store (i32.const 0) (f64x2.convert_low_i32x4_u (v128.load (i32.const 16)) )))

    (func (export "i32x4_trunc_sat_f64x2_s_zero")
      (v128.store (i32.const 0) (i32x4.trunc_sat_f64x2_s_zero (v128.load (i32.const 16)) )))
    (func (export "i32x4_trunc_sat_f64x2_u_zero")
      (v128.store (i32.const 0) (i32x4.trunc_sat_f64x2_u_zero (v128.load (i32.const 16)) )))

    (func (export "f32x4_demote_f64x2")
      (v128.store (i32.const 0) (f32x4.demote_f64x2_zero (v128.load (i32.const 16)) )))
    (func (export "f64x2_protomote_f32x4")
      (v128.store (i32.const 0) (f64x2.promote_low_f32x4 (v128.load (i32.const 16)) )))
  )`);

var mem32 = new Int32Array(ins.exports.mem.buffer);
var memU32 = new Uint32Array(ins.exports.mem.buffer);
var memF32 = new Float32Array(ins.exports.mem.buffer);
var memF64 = new Float64Array(ins.exports.mem.buffer);

// f64x2.convert_low_i32x4_u / f64x2.convert_low_i32x4_s

set(mem32, 4, [1, -2, 0, -2]);
ins.exports.f64x2_convert_low_i32x4_s();
assertSame(get(memF64, 0, 2), [1, -2]);
set(mem32, 4, [-1, 0, 5, -212312312]);
ins.exports.f64x2_convert_low_i32x4_s();
assertSame(get(memF64, 0, 2), [-1, 0]);

set(memU32, 4, [1, 4045646797, 4, 0]);
ins.exports.f64x2_convert_low_i32x4_u();
assertSame(get(memF64, 0, 2), [1, 4045646797]);
set(memU32, 4, [0, 2, 4, 3]);
ins.exports.f64x2_convert_low_i32x4_u();
assertSame(get(memF64, 0, 2), [0, 2]);

// i32x4.trunc_sat_f64x2_u_zero / i32x4.trunc_sat_f64x2_s_zero

set(memF64, 2, [0,0])
ins.exports.i32x4_trunc_sat_f64x2_s_zero();
assertSame(get(mem32, 0, 4), [0,0,0,0]);
ins.exports.i32x4_trunc_sat_f64x2_u_zero();
assertSame(get(memU32, 0, 4), [0,0,0,0]);

set(memF64, 2, [-1.23,65535.12])
ins.exports.i32x4_trunc_sat_f64x2_s_zero();
assertSame(get(mem32, 0, 4), [-1,65535,0,0]);
set(memF64, 2, [1.99,65535.12])
ins.exports.i32x4_trunc_sat_f64x2_u_zero();
assertSame(get(memU32, 0, 4), [1,65535,0,0]);

set(memF64, 2, [10e+100,-10e+100])
ins.exports.i32x4_trunc_sat_f64x2_s_zero();
assertSame(get(mem32, 0, 4), [0x7fffffff,-0x80000000,0,0]);
ins.exports.i32x4_trunc_sat_f64x2_u_zero();
assertSame(get(memU32, 0, 4), [0xffffffff,0,0,0]);

// f32x4.demote_f64x2_zero

set(memF64, 2, [1, 2])
ins.exports.f32x4_demote_f64x2();
assertSame(get(memF32, 0, 4), [1,2,0,0]);

set(memF64, 2, [-4e38, 4e38])
ins.exports.f32x4_demote_f64x2();
assertSame(get(memF32, 0, 4), [-Infinity,Infinity,0,0]);

set(memF64, 2, [-1e-46, 1e-46])
ins.exports.f32x4_demote_f64x2();
assertSame(get(memF32, 0, 4), [1/-Infinity,0,0,0]);

set(memF64, 2, [0, NaN])
ins.exports.f32x4_demote_f64x2();
assertSame(get(memF32, 0, 4), [0, NaN,0,0]);

set(memF64, 2, [Infinity, -Infinity])
ins.exports.f32x4_demote_f64x2();
assertSame(get(memF32, 0, 4), [Infinity, -Infinity,0,0]);

// f64x2.promote_low_f32x4

set(memF32, 4, [4, 3, 1, 2])
ins.exports.f64x2_protomote_f32x4();
assertSame(get(memF64, 0, 2), [4, 3]);

set(memF32, 4, [NaN, 0, 0, 0])
ins.exports.f64x2_protomote_f32x4();
assertSame(get(memF64, 0, 2), [NaN, 0]);

set(memF32, 4, [Infinity, -Infinity, 0, 0])
ins.exports.f64x2_protomote_f32x4();
assertSame(get(memF64, 0, 2), [Infinity, -Infinity]);


// i16x8.extadd_pairwise_i8x16_{s,u} / i32x4.extadd_pairwise_i16x8_{s,u}

var ins = wasmEvalText(`
  (module
    (memory (export "mem") 1 1)
    (func (export "i16x8_extadd_pairwise_i8x16_s")
      (v128.store (i32.const 0) (i16x8.extadd_pairwise_i8x16_s (v128.load (i32.const 16)) )))
    (func (export "i16x8_extadd_pairwise_i8x16_u")
      (v128.store (i32.const 0) (i16x8.extadd_pairwise_i8x16_u (v128.load (i32.const 16)) )))

    (func (export "i32x4_extadd_pairwise_i16x8_s")
      (v128.store (i32.const 0) (i32x4.extadd_pairwise_i16x8_s (v128.load (i32.const 16)) )))
    (func (export "i32x4_extadd_pairwise_i16x8_u")
      (v128.store (i32.const 0) (i32x4.extadd_pairwise_i16x8_u (v128.load (i32.const 16)) )))
  )`);

var mem8 = new Int8Array(ins.exports.mem.buffer);
var memU8 = new Uint8Array(ins.exports.mem.buffer);
var mem16 = new Int16Array(ins.exports.mem.buffer);
var memU16 = new Uint16Array(ins.exports.mem.buffer);
var mem32 = new Int32Array(ins.exports.mem.buffer);
var memU32 = new Uint32Array(ins.exports.mem.buffer);

set(mem8, 16, [0, 0, 1, 1, 2, -2, 0, 42, 1, -101, 101, -1, 127, 125, -1, -2]);
ins.exports.i16x8_extadd_pairwise_i8x16_s();
assertSame(get(mem16, 0, 8), [0, 2, 0, 42, -100, 100, 252, -3]);

set(memU8, 16, [0, 0, 1, 1, 2, 255, 0, 42, 0, 255, 254, 0, 127, 125, 255, 255]);
ins.exports.i16x8_extadd_pairwise_i8x16_u();
assertSame(get(memU16, 0, 8), [0, 2, 257, 42, 255, 254, 252, 510]);

set(mem16, 8, [0, 0, 1, 1, 2, -2, -1, -2]);
ins.exports.i32x4_extadd_pairwise_i16x8_s();
assertSame(get(mem32, 0, 4), [0, 2, 0, -3]);
set(mem16, 8, [0, 42, 1, -32760, 32766, -1, 32761, 32762]);
ins.exports.i32x4_extadd_pairwise_i16x8_s();
assertSame(get(mem32, 0, 4), [42, -32759, 32765, 65523]);

set(memU16, 8, [0, 0, 1, 1, 2, 65535, 65535, 65535]);
ins.exports.i32x4_extadd_pairwise_i16x8_u();
assertSame(get(memU32, 0, 4), [0, 2, 65537, 131070]);
set(memU16, 8, [0, 42, 0, 65535, 65534, 0, 32768, 32765]);
ins.exports.i32x4_extadd_pairwise_i16x8_u();
assertSame(get(memU32, 0, 4), [42, 65535, 65534, 65533]);
