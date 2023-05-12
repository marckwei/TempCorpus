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

/* Copyright 2021 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// ./test/core/if.wast

// ./test/core/if.wast:3
let $0 = instantiate(`(module
  ;; Auxiliary definition
  (memory 1)

  (func $$dummy)

  (func (export "empty") (param i32)
    (if (local.get 0) (then))
    (if (local.get 0) (then) (else))
    (if $$l (local.get 0) (then))
    (if $$l (local.get 0) (then) (else))
  )

  (func (export "singular") (param i32) (result i32)
    (if (local.get 0) (then (nop)))
    (if (local.get 0) (then (nop)) (else (nop)))
    (if (result i32) (local.get 0) (then (i32.const 7)) (else (i32.const 8)))
  )

  (func (export "multi") (param i32) (result i32 i32)
    (if (local.get 0) (then (call $$dummy) (call $$dummy) (call $$dummy)))
    (if (local.get 0) (then) (else (call $$dummy) (call $$dummy) (call $$dummy)))
    (if (result i32) (local.get 0)
      (then (call $$dummy) (call $$dummy) (i32.const 8) (call $$dummy))
      (else (call $$dummy) (call $$dummy) (i32.const 9) (call $$dummy))
    )
    (if (result i32 i64 i32) (local.get 0)
      (then
        (call $$dummy) (call $$dummy) (i32.const 1) (call $$dummy)
        (call $$dummy) (call $$dummy) (i64.const 2) (call $$dummy)
        (call $$dummy) (call $$dummy) (i32.const 3) (call $$dummy)
      )
      (else
        (call $$dummy) (call $$dummy) (i32.const -1) (call $$dummy)
        (call $$dummy) (call $$dummy) (i64.const -2) (call $$dummy)
        (call $$dummy) (call $$dummy) (i32.const -3) (call $$dummy)
      )
    )
    (drop) (drop)
  )

  (func (export "nested") (param i32 i32) (result i32)
    (if (result i32) (local.get 0)
      (then
        (if (local.get 1) (then (call $$dummy) (block) (nop)))
        (if (local.get 1) (then) (else (call $$dummy) (block) (nop)))
        (if (result i32) (local.get 1)
          (then (call $$dummy) (i32.const 9))
          (else (call $$dummy) (i32.const 10))
        )
      )
      (else
        (if (local.get 1) (then (call $$dummy) (block) (nop)))
        (if (local.get 1) (then) (else (call $$dummy) (block) (nop)))
        (if (result i32) (local.get 1)
          (then (call $$dummy) (i32.const 10))
          (else (call $$dummy) (i32.const 11))
        )
      )
    )
  )

  (func (export "as-select-first") (param i32) (result i32)
    (select
      (if (result i32) (local.get 0)
        (then (call $$dummy) (i32.const 1))
        (else (call $$dummy) (i32.const 0))
      )
      (i32.const 2) (i32.const 3)
    )
  )
  (func (export "as-select-mid") (param i32) (result i32)
    (select
      (i32.const 2)
      (if (result i32) (local.get 0)
        (then (call $$dummy) (i32.const 1))
        (else (call $$dummy) (i32.const 0))
      )
      (i32.const 3)
    )
  )
  (func (export "as-select-last") (param i32) (result i32)
    (select
      (i32.const 2) (i32.const 3)
      (if (result i32) (local.get 0)
        (then (call $$dummy) (i32.const 1))
        (else (call $$dummy) (i32.const 0))
      )
    )
  )

  (func (export "as-loop-first") (param i32) (result i32)
    (loop (result i32)
      (if (result i32) (local.get 0)
        (then (call $$dummy) (i32.const 1))
        (else (call $$dummy) (i32.const 0))
      )
      (call $$dummy) (call $$dummy)
    )
  )
  (func (export "as-loop-mid") (param i32) (result i32)
    (loop (result i32)
      (call $$dummy)
      (if (result i32) (local.get 0)
        (then (call $$dummy) (i32.const 1))
        (else (call $$dummy) (i32.const 0))
      )
      (call $$dummy)
    )
  )
  (func (export "as-loop-last") (param i32) (result i32)
    (loop (result i32)
      (call $$dummy) (call $$dummy)
      (if (result i32) (local.get 0)
        (then (call $$dummy) (i32.const 1))
        (else (call $$dummy) (i32.const 0))
      )
    )
  )

  (func (export "as-if-condition") (param i32) (result i32)
    (if (result i32)
      (if (result i32) (local.get 0)
        (then (i32.const 1)) (else (i32.const 0))
      )
      (then (call $$dummy) (i32.const 2))
      (else (call $$dummy) (i32.const 3))
    )
  )

  (func (export "as-br_if-first") (param i32) (result i32)
    (block (result i32)
      (br_if 0
        (if (result i32) (local.get 0)
          (then (call $$dummy) (i32.const 1))
          (else (call $$dummy) (i32.const 0))
        )
        (i32.const 2)
      )
      (return (i32.const 3))
    )
  )
  (func (export "as-br_if-last") (param i32) (result i32)
    (block (result i32)
      (br_if 0
        (i32.const 2)
        (if (result i32) (local.get 0)
          (then (call $$dummy) (i32.const 1))
          (else (call $$dummy) (i32.const 0))
        )
      )
      (return (i32.const 3))
    )
  )

  (func (export "as-br_table-first") (param i32) (result i32)
    (block (result i32)
      (if (result i32) (local.get 0)
        (then (call $$dummy) (i32.const 1))
        (else (call $$dummy) (i32.const 0))
      )
      (i32.const 2)
      (br_table 0 0)
    )
  )
  (func (export "as-br_table-last") (param i32) (result i32)
    (block (result i32)
      (i32.const 2)
      (if (result i32) (local.get 0)
        (then (call $$dummy) (i32.const 1))
        (else (call $$dummy) (i32.const 0))
      )
      (br_table 0 0)
    )
  )

  (func $$func (param i32 i32) (result i32) (local.get 0))
  (type $$check (func (param i32 i32) (result i32)))
  (table funcref (elem $$func))
  (func (export "as-call_indirect-first") (param i32) (result i32)
    (block (result i32)
      (call_indirect (type $$check)
        (if (result i32) (local.get 0)
          (then (call $$dummy) (i32.const 1))
          (else (call $$dummy) (i32.const 0))
        )
        (i32.const 2) (i32.const 0)
      )
    )
  )
  (func (export "as-call_indirect-mid") (param i32) (result i32)
    (block (result i32)
      (call_indirect (type $$check)
        (i32.const 2)
        (if (result i32) (local.get 0)
          (then (call $$dummy) (i32.const 1))
          (else (call $$dummy) (i32.const 0))
        )
        (i32.const 0)
      )
    )
  )
  (func (export "as-call_indirect-last") (param i32) (result i32)
    (block (result i32)
      (call_indirect (type $$check)
        (i32.const 2) (i32.const 0)
        (if (result i32) (local.get 0)
          (then (call $$dummy) (i32.const 1))
          (else (call $$dummy) (i32.const 0))
        )
      )
    )
  )

  (func (export "as-store-first") (param i32)
    (if (result i32) (local.get 0)
      (then (call $$dummy) (i32.const 1))
      (else (call $$dummy) (i32.const 0))
    )
    (i32.const 2)
    (i32.store)
  )
  (func (export "as-store-last") (param i32)
    (i32.const 2)
    (if (result i32) (local.get 0)
      (then (call $$dummy) (i32.const 1))
      (else (call $$dummy) (i32.const 0))
    )
    (i32.store)
  )

  (func (export "as-memory.grow-value") (param i32) (result i32)
    (memory.grow
      (if (result i32) (local.get 0)
        (then (i32.const 1))
        (else (i32.const 0))
      )
    )
  )

  (func $$f (param i32) (result i32) (local.get 0))

  (func (export "as-call-value") (param i32) (result i32)
    (call $$f
      (if (result i32) (local.get 0)
        (then (i32.const 1))
        (else (i32.const 0))
      )
    )
  )
  (func (export "as-return-value") (param i32) (result i32)
    (if (result i32) (local.get 0)
      (then (i32.const 1))
      (else (i32.const 0)))
    (return)
  )
  (func (export "as-drop-operand") (param i32)
    (drop
      (if (result i32) (local.get 0)
        (then (i32.const 1))
        (else (i32.const 0))
      )
    )
  )
  (func (export "as-br-value") (param i32) (result i32)
    (block (result i32)
      (br 0
        (if (result i32) (local.get 0)
          (then (i32.const 1))
          (else (i32.const 0))
        )
      )
    )
  )
  (func (export "as-local.set-value") (param i32) (result i32)
    (local i32)
    (local.set 0
      (if (result i32) (local.get 0)
        (then (i32.const 1))
        (else (i32.const 0))
      )
    )
    (local.get 0)
  )
  (func (export "as-local.tee-value") (param i32) (result i32)
    (local.tee 0
      (if (result i32) (local.get 0)
        (then (i32.const 1))
        (else (i32.const 0))
      )
    )
  )
  (global $$a (mut i32) (i32.const 10))
  (func (export "as-global.set-value") (param i32) (result i32)
    (global.set $$a
      (if (result i32) (local.get 0)
        (then (i32.const 1))
        (else (i32.const 0))
      )
    ) (global.get $$a)
  )
  (func (export "as-load-operand") (param i32) (result i32)
    (i32.load
      (if (result i32) (local.get 0)
        (then (i32.const 11))
        (else (i32.const 10))
      )
    )
  )

  (func (export "as-unary-operand") (param i32) (result i32)
    (i32.ctz
      (if (result i32) (local.get 0)
        (then (call $$dummy) (i32.const 13))
        (else (call $$dummy) (i32.const -13))
      )
    )
  )
  (func (export "as-binary-operand") (param i32 i32) (result i32)
    (i32.mul
      (if (result i32) (local.get 0)
        (then (call $$dummy) (i32.const 3))
        (else (call $$dummy) (i32.const -3))
      )
      (if (result i32) (local.get 1)
        (then (call $$dummy) (i32.const 4))
        (else (call $$dummy) (i32.const -5))
      )
    )
  )
  (func (export "as-test-operand") (param i32) (result i32)
    (i32.eqz
      (if (result i32) (local.get 0)
        (then (call $$dummy) (i32.const 13))
        (else (call $$dummy) (i32.const 0))
      )
    )
  )
  (func (export "as-compare-operand") (param i32 i32) (result i32)
    (f32.gt
      (if (result f32) (local.get 0)
        (then (call $$dummy) (f32.const 3))
        (else (call $$dummy) (f32.const -3))
      )
      (if (result f32) (local.get 1)
        (then (call $$dummy) (f32.const 4))
        (else (call $$dummy) (f32.const -4))
      )
    )
  )
  (func (export "as-binary-operands") (param i32) (result i32)
    (i32.mul
      (if (result i32 i32) (local.get 0)
        (then (call $$dummy) (i32.const 3) (call $$dummy) (i32.const 4))
        (else (call $$dummy) (i32.const 3) (call $$dummy) (i32.const -4))
      )
    )
  )
  (func (export "as-compare-operands") (param i32) (result i32)
    (f32.gt
      (if (result f32 f32) (local.get 0)
        (then (call $$dummy) (f32.const 3) (call $$dummy) (f32.const 3))
        (else (call $$dummy) (f32.const -2) (call $$dummy) (f32.const -3))
      )
    )
  )
  (func (export "as-mixed-operands") (param i32) (result i32)
    (if (result i32 i32) (local.get 0)
      (then (call $$dummy) (i32.const 3) (call $$dummy) (i32.const 4))
      (else (call $$dummy) (i32.const -3) (call $$dummy) (i32.const -4))
    )
    (i32.const 5)
    (i32.add)
    (i32.mul)
  )

  (func (export "break-bare") (result i32)
    (if (i32.const 1) (then (br 0) (unreachable)))
    (if (i32.const 1) (then (br 0) (unreachable)) (else (unreachable)))
    (if (i32.const 0) (then (unreachable)) (else (br 0) (unreachable)))
    (if (i32.const 1) (then (br_if 0 (i32.const 1)) (unreachable)))
    (if (i32.const 1) (then (br_if 0 (i32.const 1)) (unreachable)) (else (unreachable)))
    (if (i32.const 0) (then (unreachable)) (else (br_if 0 (i32.const 1)) (unreachable)))
    (if (i32.const 1) (then (br_table 0 (i32.const 0)) (unreachable)))
    (if (i32.const 1) (then (br_table 0 (i32.const 0)) (unreachable)) (else (unreachable)))
    (if (i32.const 0) (then (unreachable)) (else (br_table 0 (i32.const 0)) (unreachable)))
    (i32.const 19)
  )

  (func (export "break-value") (param i32) (result i32)
    (if (result i32) (local.get 0)
      (then (br 0 (i32.const 18)) (i32.const 19))
      (else (br 0 (i32.const 21)) (i32.const 20))
    )
  )
  (func (export "break-multi-value") (param i32) (result i32 i32 i64)
    (if (result i32 i32 i64) (local.get 0)
      (then
        (br 0 (i32.const 18) (i32.const -18) (i64.const 18))
        (i32.const 19) (i32.const -19) (i64.const 19)
      )
      (else
        (br 0 (i32.const -18) (i32.const 18) (i64.const -18))
        (i32.const -19) (i32.const 19) (i64.const -19)
      )
    )
  )

  (func (export "param") (param i32) (result i32)
    (i32.const 1)
    (if (param i32) (result i32) (local.get 0)
      (then (i32.const 2) (i32.add))
      (else (i32.const -2) (i32.add))
    )
  )
  (func (export "params") (param i32) (result i32)
    (i32.const 1)
    (i32.const 2)
    (if (param i32 i32) (result i32) (local.get 0)
      (then (i32.add))
      (else (i32.sub))
    )
  )
  (func (export "params-id") (param i32) (result i32)
    (i32.const 1)
    (i32.const 2)
    (if (param i32 i32) (result i32 i32) (local.get 0) (then))
    (i32.add)
  )
  (func (export "param-break") (param i32) (result i32)
    (i32.const 1)
    (if (param i32) (result i32) (local.get 0)
      (then (i32.const 2) (i32.add) (br 0))
      (else (i32.const -2) (i32.add) (br 0))
    )
  )
  (func (export "params-break") (param i32) (result i32)
    (i32.const 1)
    (i32.const 2)
    (if (param i32 i32) (result i32) (local.get 0)
      (then (i32.add) (br 0))
      (else (i32.sub) (br 0))
    )
  )
  (func (export "params-id-break") (param i32) (result i32)
    (i32.const 1)
    (i32.const 2)
    (if (param i32 i32) (result i32 i32) (local.get 0) (then (br 0)))
    (i32.add)
  )

  (func (export "effects") (param i32) (result i32)
    (local i32)
    (if
      (block (result i32) (local.set 1 (i32.const 1)) (local.get 0))
      (then
        (local.set 1 (i32.mul (local.get 1) (i32.const 3)))
        (local.set 1 (i32.sub (local.get 1) (i32.const 5)))
        (local.set 1 (i32.mul (local.get 1) (i32.const 7)))
        (br 0)
        (local.set 1 (i32.mul (local.get 1) (i32.const 100)))
      )
      (else
        (local.set 1 (i32.mul (local.get 1) (i32.const 5)))
        (local.set 1 (i32.sub (local.get 1) (i32.const 7)))
        (local.set 1 (i32.mul (local.get 1) (i32.const 3)))
        (br 0)
        (local.set 1 (i32.mul (local.get 1) (i32.const 1000)))
      )
    )
    (local.get 1)
  )

  ;; Examples

  (func $$add64_u_with_carry (export "add64_u_with_carry")
    (param $$i i64) (param $$j i64) (param $$c i32) (result i64 i32)
    (local $$k i64)
    (local.set $$k
      (i64.add
        (i64.add (local.get $$i) (local.get $$j))
        (i64.extend_i32_u (local.get $$c))
      )
    )
    (return (local.get $$k) (i64.lt_u (local.get $$k) (local.get $$i)))
  )

  (func $$add64_u_saturated (export "add64_u_saturated")
    (param i64 i64) (result i64)
    (call $$add64_u_with_carry (local.get 0) (local.get 1) (i32.const 0))
    (if (param i64) (result i64)
      (then (drop) (i64.const -1))
    )
  )

  ;; Block signature syntax

  (type $$block-sig-1 (func))
  (type $$block-sig-2 (func (result i32)))
  (type $$block-sig-3 (func (param $$x i32)))
  (type $$block-sig-4 (func (param i32 f64 i32) (result i32 f64 i32)))

  (func (export "type-use")
    (if (type $$block-sig-1) (i32.const 1) (then))
    (if (type $$block-sig-2) (i32.const 1)
      (then (i32.const 0)) (else (i32.const 2))
    )
    (if (type $$block-sig-3) (i32.const 1) (then (drop)) (else (drop)))
    (i32.const 0) (f64.const 0) (i32.const 0)
    (if (type $$block-sig-4) (i32.const 1) (then))
    (drop) (drop) (drop)
    (if (type $$block-sig-2) (result i32) (i32.const 1)
      (then (i32.const 0)) (else (i32.const 2))
    )
    (if (type $$block-sig-3) (param i32) (i32.const 1)
      (then (drop)) (else (drop))
    )
    (i32.const 0) (f64.const 0) (i32.const 0)
    (if (type $$block-sig-4)
      (param i32) (param f64 i32) (result i32 f64) (result i32)
      (i32.const 1) (then)
    )
    (drop) (drop) (drop)
  )
)`);

// ./test/core/if.wast:529
assert_return(() => invoke($0, `empty`, [0]), []);

// ./test/core/if.wast:530
assert_return(() => invoke($0, `empty`, [1]), []);

// ./test/core/if.wast:531
assert_return(() => invoke($0, `empty`, [100]), []);

// ./test/core/if.wast:532
assert_return(() => invoke($0, `empty`, [-2]), []);

// ./test/core/if.wast:534
assert_return(() => invoke($0, `singular`, [0]), [value("i32", 8)]);

// ./test/core/if.wast:535
assert_return(() => invoke($0, `singular`, [1]), [value("i32", 7)]);

// ./test/core/if.wast:536
assert_return(() => invoke($0, `singular`, [10]), [value("i32", 7)]);

// ./test/core/if.wast:537
assert_return(() => invoke($0, `singular`, [-10]), [value("i32", 7)]);

// ./test/core/if.wast:539
assert_return(() => invoke($0, `multi`, [0]), [value("i32", 9), value("i32", -1)]);

// ./test/core/if.wast:540
assert_return(() => invoke($0, `multi`, [1]), [value("i32", 8), value("i32", 1)]);

// ./test/core/if.wast:541
assert_return(() => invoke($0, `multi`, [13]), [value("i32", 8), value("i32", 1)]);

// ./test/core/if.wast:542
assert_return(() => invoke($0, `multi`, [-5]), [value("i32", 8), value("i32", 1)]);

// ./test/core/if.wast:544
assert_return(() => invoke($0, `nested`, [0, 0]), [value("i32", 11)]);

// ./test/core/if.wast:545
assert_return(() => invoke($0, `nested`, [1, 0]), [value("i32", 10)]);

// ./test/core/if.wast:546
assert_return(() => invoke($0, `nested`, [0, 1]), [value("i32", 10)]);

// ./test/core/if.wast:547
assert_return(() => invoke($0, `nested`, [3, 2]), [value("i32", 9)]);

// ./test/core/if.wast:548
assert_return(() => invoke($0, `nested`, [0, -100]), [value("i32", 10)]);

// ./test/core/if.wast:549
assert_return(() => invoke($0, `nested`, [10, 10]), [value("i32", 9)]);

// ./test/core/if.wast:550
assert_return(() => invoke($0, `nested`, [0, -1]), [value("i32", 10)]);

// ./test/core/if.wast:551
assert_return(() => invoke($0, `nested`, [-111, -2]), [value("i32", 9)]);

// ./test/core/if.wast:553
assert_return(() => invoke($0, `as-select-first`, [0]), [value("i32", 0)]);

// ./test/core/if.wast:554
assert_return(() => invoke($0, `as-select-first`, [1]), [value("i32", 1)]);

// ./test/core/if.wast:555
assert_return(() => invoke($0, `as-select-mid`, [0]), [value("i32", 2)]);

// ./test/core/if.wast:556
assert_return(() => invoke($0, `as-select-mid`, [1]), [value("i32", 2)]);

// ./test/core/if.wast:557
assert_return(() => invoke($0, `as-select-last`, [0]), [value("i32", 3)]);

// ./test/core/if.wast:558
assert_return(() => invoke($0, `as-select-last`, [1]), [value("i32", 2)]);

// ./test/core/if.wast:560
assert_return(() => invoke($0, `as-loop-first`, [0]), [value("i32", 0)]);

// ./test/core/if.wast:561
assert_return(() => invoke($0, `as-loop-first`, [1]), [value("i32", 1)]);

// ./test/core/if.wast:562
assert_return(() => invoke($0, `as-loop-mid`, [0]), [value("i32", 0)]);

// ./test/core/if.wast:563
assert_return(() => invoke($0, `as-loop-mid`, [1]), [value("i32", 1)]);

// ./test/core/if.wast:564
assert_return(() => invoke($0, `as-loop-last`, [0]), [value("i32", 0)]);

// ./test/core/if.wast:565
assert_return(() => invoke($0, `as-loop-last`, [1]), [value("i32", 1)]);

// ./test/core/if.wast:567
assert_return(() => invoke($0, `as-if-condition`, [0]), [value("i32", 3)]);

// ./test/core/if.wast:568
assert_return(() => invoke($0, `as-if-condition`, [1]), [value("i32", 2)]);

// ./test/core/if.wast:570
assert_return(() => invoke($0, `as-br_if-first`, [0]), [value("i32", 0)]);

// ./test/core/if.wast:571
assert_return(() => invoke($0, `as-br_if-first`, [1]), [value("i32", 1)]);

// ./test/core/if.wast:572
assert_return(() => invoke($0, `as-br_if-last`, [0]), [value("i32", 3)]);

// ./test/core/if.wast:573
assert_return(() => invoke($0, `as-br_if-last`, [1]), [value("i32", 2)]);

// ./test/core/if.wast:575
assert_return(() => invoke($0, `as-br_table-first`, [0]), [value("i32", 0)]);

// ./test/core/if.wast:576
assert_return(() => invoke($0, `as-br_table-first`, [1]), [value("i32", 1)]);

// ./test/core/if.wast:577
assert_return(() => invoke($0, `as-br_table-last`, [0]), [value("i32", 2)]);

// ./test/core/if.wast:578
assert_return(() => invoke($0, `as-br_table-last`, [1]), [value("i32", 2)]);

// ./test/core/if.wast:580
assert_return(() => invoke($0, `as-call_indirect-first`, [0]), [value("i32", 0)]);

// ./test/core/if.wast:581
assert_return(() => invoke($0, `as-call_indirect-first`, [1]), [value("i32", 1)]);

// ./test/core/if.wast:582
assert_return(() => invoke($0, `as-call_indirect-mid`, [0]), [value("i32", 2)]);

// ./test/core/if.wast:583
assert_return(() => invoke($0, `as-call_indirect-mid`, [1]), [value("i32", 2)]);

// ./test/core/if.wast:584
assert_return(() => invoke($0, `as-call_indirect-last`, [0]), [value("i32", 2)]);

// ./test/core/if.wast:585
assert_trap(() => invoke($0, `as-call_indirect-last`, [1]), `undefined element`);

// ./test/core/if.wast:587
assert_return(() => invoke($0, `as-store-first`, [0]), []);

// ./test/core/if.wast:588
assert_return(() => invoke($0, `as-store-first`, [1]), []);

// ./test/core/if.wast:589
assert_return(() => invoke($0, `as-store-last`, [0]), []);

// ./test/core/if.wast:590
assert_return(() => invoke($0, `as-store-last`, [1]), []);

// ./test/core/if.wast:592
assert_return(() => invoke($0, `as-memory.grow-value`, [0]), [value("i32", 1)]);

// ./test/core/if.wast:593
assert_return(() => invoke($0, `as-memory.grow-value`, [1]), [value("i32", 1)]);

// ./test/core/if.wast:595
assert_return(() => invoke($0, `as-call-value`, [0]), [value("i32", 0)]);

// ./test/core/if.wast:596
assert_return(() => invoke($0, `as-call-value`, [1]), [value("i32", 1)]);

// ./test/core/if.wast:598
assert_return(() => invoke($0, `as-return-value`, [0]), [value("i32", 0)]);

// ./test/core/if.wast:599
assert_return(() => invoke($0, `as-return-value`, [1]), [value("i32", 1)]);

// ./test/core/if.wast:601
assert_return(() => invoke($0, `as-drop-operand`, [0]), []);

// ./test/core/if.wast:602
assert_return(() => invoke($0, `as-drop-operand`, [1]), []);

// ./test/core/if.wast:604
assert_return(() => invoke($0, `as-br-value`, [0]), [value("i32", 0)]);

// ./test/core/if.wast:605
assert_return(() => invoke($0, `as-br-value`, [1]), [value("i32", 1)]);

// ./test/core/if.wast:607
assert_return(() => invoke($0, `as-local.set-value`, [0]), [value("i32", 0)]);

// ./test/core/if.wast:608
assert_return(() => invoke($0, `as-local.set-value`, [1]), [value("i32", 1)]);

// ./test/core/if.wast:610
assert_return(() => invoke($0, `as-local.tee-value`, [0]), [value("i32", 0)]);

// ./test/core/if.wast:611
assert_return(() => invoke($0, `as-local.tee-value`, [1]), [value("i32", 1)]);

// ./test/core/if.wast:613
assert_return(() => invoke($0, `as-global.set-value`, [0]), [value("i32", 0)]);

// ./test/core/if.wast:614
assert_return(() => invoke($0, `as-global.set-value`, [1]), [value("i32", 1)]);

// ./test/core/if.wast:616
assert_return(() => invoke($0, `as-load-operand`, [0]), [value("i32", 0)]);

// ./test/core/if.wast:617
assert_return(() => invoke($0, `as-load-operand`, [1]), [value("i32", 0)]);

// ./test/core/if.wast:619
assert_return(() => invoke($0, `as-unary-operand`, [0]), [value("i32", 0)]);

// ./test/core/if.wast:620
assert_return(() => invoke($0, `as-unary-operand`, [1]), [value("i32", 0)]);

// ./test/core/if.wast:621
assert_return(() => invoke($0, `as-unary-operand`, [-1]), [value("i32", 0)]);

// ./test/core/if.wast:623
assert_return(() => invoke($0, `as-binary-operand`, [0, 0]), [value("i32", 15)]);

// ./test/core/if.wast:624
assert_return(() => invoke($0, `as-binary-operand`, [0, 1]), [value("i32", -12)]);

// ./test/core/if.wast:625
assert_return(() => invoke($0, `as-binary-operand`, [1, 0]), [value("i32", -15)]);

// ./test/core/if.wast:626
assert_return(() => invoke($0, `as-binary-operand`, [1, 1]), [value("i32", 12)]);

// ./test/core/if.wast:628
assert_return(() => invoke($0, `as-test-operand`, [0]), [value("i32", 1)]);

// ./test/core/if.wast:629
assert_return(() => invoke($0, `as-test-operand`, [1]), [value("i32", 0)]);

// ./test/core/if.wast:631
assert_return(() => invoke($0, `as-compare-operand`, [0, 0]), [value("i32", 1)]);

// ./test/core/if.wast:632
assert_return(() => invoke($0, `as-compare-operand`, [0, 1]), [value("i32", 0)]);

// ./test/core/if.wast:633
assert_return(() => invoke($0, `as-compare-operand`, [1, 0]), [value("i32", 1)]);

// ./test/core/if.wast:634
assert_return(() => invoke($0, `as-compare-operand`, [1, 1]), [value("i32", 0)]);

// ./test/core/if.wast:636
assert_return(() => invoke($0, `as-binary-operands`, [0]), [value("i32", -12)]);

// ./test/core/if.wast:637
assert_return(() => invoke($0, `as-binary-operands`, [1]), [value("i32", 12)]);

// ./test/core/if.wast:639
assert_return(() => invoke($0, `as-compare-operands`, [0]), [value("i32", 1)]);

// ./test/core/if.wast:640
assert_return(() => invoke($0, `as-compare-operands`, [1]), [value("i32", 0)]);

// ./test/core/if.wast:642
assert_return(() => invoke($0, `as-mixed-operands`, [0]), [value("i32", -3)]);

// ./test/core/if.wast:643
assert_return(() => invoke($0, `as-mixed-operands`, [1]), [value("i32", 27)]);

// ./test/core/if.wast:645
assert_return(() => invoke($0, `break-bare`, []), [value("i32", 19)]);

// ./test/core/if.wast:646
assert_return(() => invoke($0, `break-value`, [1]), [value("i32", 18)]);

// ./test/core/if.wast:647
assert_return(() => invoke($0, `break-value`, [0]), [value("i32", 21)]);

// ./test/core/if.wast:648
assert_return(
  () => invoke($0, `break-multi-value`, [0]),
  [value("i32", -18), value("i32", 18), value("i64", -18n)],
);

// ./test/core/if.wast:651
assert_return(
  () => invoke($0, `break-multi-value`, [1]),
  [value("i32", 18), value("i32", -18), value("i64", 18n)],
);

// ./test/core/if.wast:655
assert_return(() => invoke($0, `param`, [0]), [value("i32", -1)]);

// ./test/core/if.wast:656
assert_return(() => invoke($0, `param`, [1]), [value("i32", 3)]);

// ./test/core/if.wast:657
assert_return(() => invoke($0, `params`, [0]), [value("i32", -1)]);

// ./test/core/if.wast:658
assert_return(() => invoke($0, `params`, [1]), [value("i32", 3)]);

// ./test/core/if.wast:659
assert_return(() => invoke($0, `params-id`, [0]), [value("i32", 3)]);

// ./test/core/if.wast:660
assert_return(() => invoke($0, `params-id`, [1]), [value("i32", 3)]);

// ./test/core/if.wast:661
assert_return(() => invoke($0, `param-break`, [0]), [value("i32", -1)]);

// ./test/core/if.wast:662
assert_return(() => invoke($0, `param-break`, [1]), [value("i32", 3)]);

// ./test/core/if.wast:663
assert_return(() => invoke($0, `params-break`, [0]), [value("i32", -1)]);

// ./test/core/if.wast:664
assert_return(() => invoke($0, `params-break`, [1]), [value("i32", 3)]);

// ./test/core/if.wast:665
assert_return(() => invoke($0, `params-id-break`, [0]), [value("i32", 3)]);

// ./test/core/if.wast:666
assert_return(() => invoke($0, `params-id-break`, [1]), [value("i32", 3)]);

// ./test/core/if.wast:668
assert_return(() => invoke($0, `effects`, [1]), [value("i32", -14)]);

// ./test/core/if.wast:669
assert_return(() => invoke($0, `effects`, [0]), [value("i32", -6)]);

// ./test/core/if.wast:671
assert_return(() => invoke($0, `add64_u_with_carry`, [0n, 0n, 0]), [value("i64", 0n), value("i32", 0)]);

// ./test/core/if.wast:675
assert_return(
  () => invoke($0, `add64_u_with_carry`, [100n, 124n, 0]),
  [value("i64", 224n), value("i32", 0)],
);

// ./test/core/if.wast:679
assert_return(
  () => invoke($0, `add64_u_with_carry`, [-1n, 0n, 0]),
  [value("i64", -1n), value("i32", 0)],
);

// ./test/core/if.wast:683
assert_return(() => invoke($0, `add64_u_with_carry`, [-1n, 1n, 0]), [value("i64", 0n), value("i32", 1)]);

// ./test/core/if.wast:687
assert_return(
  () => invoke($0, `add64_u_with_carry`, [-1n, -1n, 0]),
  [value("i64", -2n), value("i32", 1)],
);

// ./test/core/if.wast:691
assert_return(() => invoke($0, `add64_u_with_carry`, [-1n, 0n, 1]), [value("i64", 0n), value("i32", 1)]);

// ./test/core/if.wast:695
assert_return(() => invoke($0, `add64_u_with_carry`, [-1n, 1n, 1]), [value("i64", 1n), value("i32", 1)]);

// ./test/core/if.wast:699
assert_return(
  () => invoke($0, `add64_u_with_carry`, [
    -9223372036854775808n,
    -9223372036854775808n,
    0,
  ]),
  [value("i64", 0n), value("i32", 1)],
);

// ./test/core/if.wast:704
assert_return(() => invoke($0, `add64_u_saturated`, [0n, 0n]), [value("i64", 0n)]);

// ./test/core/if.wast:707
assert_return(() => invoke($0, `add64_u_saturated`, [1230n, 23n]), [value("i64", 1253n)]);

// ./test/core/if.wast:710
assert_return(() => invoke($0, `add64_u_saturated`, [-1n, 0n]), [value("i64", -1n)]);

// ./test/core/if.wast:713
assert_return(() => invoke($0, `add64_u_saturated`, [-1n, 1n]), [value("i64", -1n)]);

// ./test/core/if.wast:716
assert_return(() => invoke($0, `add64_u_saturated`, [-1n, -1n]), [value("i64", -1n)]);

// ./test/core/if.wast:719
assert_return(
  () => invoke($0, `add64_u_saturated`, [-9223372036854775808n, -9223372036854775808n]),
  [value("i64", -1n)],
);

// ./test/core/if.wast:723
assert_return(() => invoke($0, `type-use`, []), []);

// ./test/core/if.wast:725
assert_malformed(
  () => instantiate(`(type $$sig (func (param i32) (result i32))) (func (i32.const 0)   (if (type $$sig) (result i32) (param i32) (i32.const 1) (then)) ) `),
  `unexpected token`,
);

// ./test/core/if.wast:734
assert_malformed(
  () => instantiate(`(type $$sig (func (param i32) (result i32))) (func (i32.const 0)   (if (param i32) (type $$sig) (result i32) (i32.const 1) (then)) ) `),
  `unexpected token`,
);

// ./test/core/if.wast:743
assert_malformed(
  () => instantiate(`(type $$sig (func (param i32) (result i32))) (func (i32.const 0)   (if (param i32) (result i32) (type $$sig) (i32.const 1) (then)) ) `),
  `unexpected token`,
);

// ./test/core/if.wast:752
assert_malformed(
  () => instantiate(`(type $$sig (func (param i32) (result i32))) (func (i32.const 0)   (if (result i32) (type $$sig) (param i32) (i32.const 1) (then)) ) `),
  `unexpected token`,
);

// ./test/core/if.wast:761
assert_malformed(
  () => instantiate(`(type $$sig (func (param i32) (result i32))) (func (i32.const 0)   (if (result i32) (param i32) (type $$sig) (i32.const 1) (then)) ) `),
  `unexpected token`,
);

// ./test/core/if.wast:770
assert_malformed(
  () => instantiate(`(func (i32.const 0) (if (result i32) (param i32) (i32.const 1) (then))) `),
  `unexpected token`,
);

// ./test/core/if.wast:777
assert_malformed(
  () => instantiate(`(func (i32.const 0) (i32.const 1)   (if (param $$x i32) (then (drop)) (else (drop))) ) `),
  `unexpected token`,
);

// ./test/core/if.wast:785
assert_malformed(
  () => instantiate(`(type $$sig (func)) (func (i32.const 1)   (if (type $$sig) (result i32) (then (i32.const 0)) (else (i32.const 2)))   (unreachable) ) `),
  `inline function type`,
);

// ./test/core/if.wast:795
assert_malformed(
  () => instantiate(`(type $$sig (func (param i32) (result i32))) (func (i32.const 1)   (if (type $$sig) (result i32) (then (i32.const 0)) (else (i32.const 2)))   (unreachable) ) `),
  `inline function type`,
);

// ./test/core/if.wast:805
assert_malformed(
  () => instantiate(`(type $$sig (func (param i32) (result i32))) (func (i32.const 0) (i32.const 1)   (if (type $$sig) (param i32) (then (drop)) (else (drop)))   (unreachable) ) `),
  `inline function type`,
);

// ./test/core/if.wast:815
assert_malformed(
  () => instantiate(`(type $$sig (func (param i32 i32) (result i32))) (func (i32.const 0) (i32.const 1)   (if (type $$sig) (param i32) (result i32) (then)) (unreachable) ) `),
  `inline function type`,
);

// ./test/core/if.wast:825
assert_invalid(
  () => instantiate(`(module
    (type $$sig (func))
    (func (i32.const 1) (if (type $$sig) (i32.const 0) (then)))
  )`),
  `type mismatch`,
);

// ./test/core/if.wast:833
assert_invalid(
  () => instantiate(`(module (func $$type-empty-i32 (result i32) (if (i32.const 0) (then))))`),
  `type mismatch`,
);

// ./test/core/if.wast:837
assert_invalid(
  () => instantiate(`(module (func $$type-empty-i64 (result i64) (if (i32.const 0) (then))))`),
  `type mismatch`,
);

// ./test/core/if.wast:841
assert_invalid(
  () => instantiate(`(module (func $$type-empty-f32 (result f32) (if (i32.const 0) (then))))`),
  `type mismatch`,
);

// ./test/core/if.wast:845
assert_invalid(
  () => instantiate(`(module (func $$type-empty-f64 (result f64) (if (i32.const 0) (then))))`),
  `type mismatch`,
);

// ./test/core/if.wast:850
assert_invalid(
  () => instantiate(`(module (func $$type-empty-i32 (result i32) (if (i32.const 0) (then) (else))))`),
  `type mismatch`,
);

// ./test/core/if.wast:854
assert_invalid(
  () => instantiate(`(module (func $$type-empty-i64 (result i64) (if (i32.const 0) (then) (else))))`),
  `type mismatch`,
);

// ./test/core/if.wast:858
assert_invalid(
  () => instantiate(`(module (func $$type-empty-f32 (result f32) (if (i32.const 0) (then) (else))))`),
  `type mismatch`,
);

// ./test/core/if.wast:862
assert_invalid(
  () => instantiate(`(module (func $$type-empty-f64 (result f64) (if (i32.const 0) (then) (else))))`),
  `type mismatch`,
);

// ./test/core/if.wast:867
assert_invalid(
  () => instantiate(`(module (func $$type-then-value-num-vs-void
    (if (i32.const 1) (then (i32.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:873
assert_invalid(
  () => instantiate(`(module (func $$type-then-value-num-vs-void-else
    (if (i32.const 1) (then (i32.const 1)) (else))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:879
assert_invalid(
  () => instantiate(`(module (func $$type-else-value-num-vs-void
    (if (i32.const 1) (then) (else (i32.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:885
assert_invalid(
  () => instantiate(`(module (func $$type-both-value-num-vs-void
    (if (i32.const 1) (then (i32.const 1)) (else (i32.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:892
assert_invalid(
  () => instantiate(`(module (func $$type-then-value-nums-vs-void
    (if (i32.const 1) (then (i32.const 1) (i32.const 2)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:898
assert_invalid(
  () => instantiate(`(module (func $$type-then-value-nums-vs-void-else
    (if (i32.const 1) (then (i32.const 1) (i32.const 2)) (else))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:904
assert_invalid(
  () => instantiate(`(module (func $$type-else-value-nums-vs-void
    (if (i32.const 1) (then) (else (i32.const 1) (i32.const 2)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:910
assert_invalid(
  () => instantiate(`(module (func $$type-both-value-nums-vs-void
    (if (i32.const 1) (then (i32.const 1) (i32.const 2)) (else (i32.const 2) (i32.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:917
assert_invalid(
  () => instantiate(`(module (func $$type-then-value-empty-vs-num (result i32)
    (if (result i32) (i32.const 1) (then) (else (i32.const 0)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:923
assert_invalid(
  () => instantiate(`(module (func $$type-else-value-empty-vs-num (result i32)
    (if (result i32) (i32.const 1) (then (i32.const 0)) (else))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:929
assert_invalid(
  () => instantiate(`(module (func $$type-both-value-empty-vs-num (result i32)
    (if (result i32) (i32.const 1) (then) (else))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:936
assert_invalid(
  () => instantiate(`(module (func $$type-then-value-empty-vs-nums (result i32 i32)
    (if (result i32 i32) (i32.const 1) (then) (else (i32.const 0) (i32.const 2)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:942
assert_invalid(
  () => instantiate(`(module (func $$type-else-value-empty-vs-nums (result i32 i32)
    (if (result i32 i32) (i32.const 1) (then (i32.const 0) (i32.const 1)) (else))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:948
assert_invalid(
  () => instantiate(`(module (func $$type-both-value-empty-vs-nums (result i32 i32)
    (if (result i32 i32) (i32.const 1) (then) (else))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:955
assert_invalid(
  () => instantiate(`(module (func $$type-no-else-vs-num (result i32)
    (if (result i32) (i32.const 1) (then (i32.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:961
assert_invalid(
  () => instantiate(`(module (func $$type-no-else-vs-nums (result i32 i32)
    (if (result i32 i32) (i32.const 1) (then (i32.const 1) (i32.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:968
assert_invalid(
  () => instantiate(`(module (func $$type-then-value-void-vs-num (result i32)
    (if (result i32) (i32.const 1) (then (nop)) (else (i32.const 0)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:974
assert_invalid(
  () => instantiate(`(module (func $$type-else-value-void-vs-num (result i32)
    (if (result i32) (i32.const 1) (then (i32.const 0)) (else (nop)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:980
assert_invalid(
  () => instantiate(`(module (func $$type-both-value-void-vs-num (result i32)
    (if (result i32) (i32.const 1) (then (nop)) (else (nop)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:987
assert_invalid(
  () => instantiate(`(module (func $$type-then-value-void-vs-nums (result i32 i32)
    (if (result i32 i32) (i32.const 1) (then (nop)) (else (i32.const 0) (i32.const 0)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:993
assert_invalid(
  () => instantiate(`(module (func $$type-else-value-void-vs-nums (result i32 i32)
    (if (result i32 i32) (i32.const 1) (then (i32.const 0) (i32.const 0)) (else (nop)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:999
assert_invalid(
  () => instantiate(`(module (func $$type-both-value-void-vs-nums (result i32 i32)
    (if (result i32 i32) (i32.const 1) (then (nop)) (else (nop)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1006
assert_invalid(
  () => instantiate(`(module (func $$type-then-value-num-vs-num (result i32)
    (if (result i32) (i32.const 1) (then (i64.const 1)) (else (i32.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1012
assert_invalid(
  () => instantiate(`(module (func $$type-else-value-num-vs-num (result i32)
    (if (result i32) (i32.const 1) (then (i32.const 1)) (else (i64.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1018
assert_invalid(
  () => instantiate(`(module (func $$type-both-value-num-vs-num (result i32)
    (if (result i32) (i32.const 1) (then (i64.const 1)) (else (i64.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1025
assert_invalid(
  () => instantiate(`(module (func $$type-then-value-num-vs-nums (result i32 i32)
    (if (result i32 i32) (i32.const 1) (then (i32.const 1)) (else (i32.const 1) (i32.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1031
assert_invalid(
  () => instantiate(`(module (func $$type-else-value-num-vs-nums (result i32 i32)
    (if (result i32 i32) (i32.const 1) (then (i32.const 1) (i32.const 1)) (else (i32.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1037
assert_invalid(
  () => instantiate(`(module (func $$type-both-value-num-vs-nums (result i32 i32)
    (if (result i32 i32) (i32.const 1) (then (i32.const 1)) (else (i32.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1044
assert_invalid(
  () => instantiate(`(module (func $$type-then-value-partial-vs-nums (result i32 i32)
    (i32.const 0)
    (if (result i32 i32) (i32.const 1) (then (i32.const 1)) (else (i32.const 1) (i32.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1051
assert_invalid(
  () => instantiate(`(module (func $$type-else-value-partial-vs-nums (result i32 i32)
    (i32.const 0)
    (if (result i32 i32) (i32.const 1) (then (i32.const 1) (i32.const 1)) (else (i32.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1058
assert_invalid(
  () => instantiate(`(module (func $$type-both-value-partial-vs-nums (result i32 i32)
    (i32.const 0)
    (if (result i32 i32) (i32.const 1) (then (i32.const 1)) (else (i32.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1066
assert_invalid(
  () => instantiate(`(module (func $$type-then-value-nums-vs-num (result i32)
    (if (result i32) (i32.const 1) (then (i32.const 1) (i32.const 1)) (else (i32.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1072
assert_invalid(
  () => instantiate(`(module (func $$type-else-value-nums-vs-num (result i32)
    (if (result i32) (i32.const 1) (then (i32.const 1)) (else (i32.const 1) (i32.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1078
assert_invalid(
  () => instantiate(`(module (func $$type-both-value-nums-vs-num (result i32)
    (if (result i32) (i32.const 1) (then (i32.const 1) (i32.const 1)) (else (i32.const 1) (i32.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1085
assert_invalid(
  () => instantiate(`(module (func $$type-both-different-value-num-vs-num (result i32)
    (if (result i32) (i32.const 1) (then (i64.const 1)) (else (f64.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1091
assert_invalid(
  () => instantiate(`(module (func $$type-both-different-value-nums-vs-nums (result i32 i32)
    (if (result i32 i32) (i32.const 1) (then (i32.const 1) (i32.const 1) (i32.const 1)) (else (i32.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1098
assert_invalid(
  () => instantiate(`(module (func $$type-then-value-unreached-select (result i32)
    (if (result i64)
      (i32.const 0)
      (then (select (unreachable) (unreachable) (unreachable)))
      (else (i64.const 0))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1108
assert_invalid(
  () => instantiate(`(module (func $$type-else-value-unreached-select (result i32)
    (if (result i64)
      (i32.const 1)
      (then (i64.const 0))
      (else (select (unreachable) (unreachable) (unreachable)))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1118
assert_invalid(
  () => instantiate(`(module (func $$type-else-value-unreached-select (result i32)
    (if (result i64)
      (i32.const 1)
      (then (select (unreachable) (unreachable) (unreachable)))
      (else (select (unreachable) (unreachable) (unreachable)))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1129
assert_invalid(
  () => instantiate(`(module (func $$type-then-break-last-void-vs-num (result i32)
    (if (result i32) (i32.const 1) (then (br 0)) (else (i32.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1135
assert_invalid(
  () => instantiate(`(module (func $$type-else-break-last-void-vs-num (result i32)
    (if (result i32) (i32.const 1) (then (i32.const 1)) (else (br 0)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1141
assert_invalid(
  () => instantiate(`(module (func $$type-then-break-last-void-vs-nums (result i32 i32)
    (if (result i32 i32) (i32.const 1) (then (br 0)) (else (i32.const 1) (i32.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1147
assert_invalid(
  () => instantiate(`(module (func $$type-else-break-last-void-vs-nums (result i32 i32)
    (if (result i32 i32) (i32.const 1) (then (i32.const 1) (i32.const 1)) (else (br 0)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1154
assert_invalid(
  () => instantiate(`(module (func $$type-then-break-empty-vs-num (result i32)
    (if (result i32) (i32.const 1)
      (then (br 0) (i32.const 1))
      (else (i32.const 1))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1163
assert_invalid(
  () => instantiate(`(module (func $$type-else-break-empty-vs-num (result i32)
    (if (result i32) (i32.const 1)
      (then (i32.const 1))
      (else (br 0) (i32.const 1))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1172
assert_invalid(
  () => instantiate(`(module (func $$type-then-break-empty-vs-nums (result i32 i32)
    (if (result i32 i32) (i32.const 1)
      (then (br 0) (i32.const 1) (i32.const 1))
      (else (i32.const 1) (i32.const 1))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1181
assert_invalid(
  () => instantiate(`(module (func $$type-else-break-empty-vs-nums (result i32 i32)
    (if (result i32 i32) (i32.const 1)
      (then (i32.const 1) (i32.const 1))
      (else (br 0) (i32.const 1) (i32.const 1))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1191
assert_invalid(
  () => instantiate(`(module (func $$type-then-break-void-vs-num (result i32)
    (if (result i32) (i32.const 1)
      (then (br 0 (nop)) (i32.const 1))
      (else (i32.const 1))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1200
assert_invalid(
  () => instantiate(`(module (func $$type-else-break-void-vs-num (result i32)
    (if (result i32) (i32.const 1)
      (then (i32.const 1))
      (else (br 0 (nop)) (i32.const 1))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1209
assert_invalid(
  () => instantiate(`(module (func $$type-then-break-void-vs-nums (result i32 i32)
    (if (result i32 i32) (i32.const 1)
      (then (br 0 (nop)) (i32.const 1) (i32.const 1))
      (else (i32.const 1) (i32.const 1))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1218
assert_invalid(
  () => instantiate(`(module (func $$type-else-break-void-vs-nums (result i32 i32)
    (if (result i32 i32) (i32.const 1)
      (then (i32.const 1) (i32.const 1))
      (else (br 0 (nop)) (i32.const 1) (i32.const 1))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1228
assert_invalid(
  () => instantiate(`(module (func $$type-then-break-num-vs-num (result i32)
    (if (result i32) (i32.const 1)
      (then (br 0 (i64.const 1)) (i32.const 1))
      (else (i32.const 1))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1237
assert_invalid(
  () => instantiate(`(module (func $$type-else-break-num-vs-num (result i32)
    (if (result i32) (i32.const 1)
      (then (i32.const 1))
      (else (br 0 (i64.const 1)) (i32.const 1))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1246
assert_invalid(
  () => instantiate(`(module (func $$type-then-break-num-vs-nums (result i32 i32)
    (if (result i32 i32) (i32.const 1)
      (then (br 0 (i64.const 1)) (i32.const 1) (i32.const 1))
      (else (i32.const 1) (i32.const 1))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1255
assert_invalid(
  () => instantiate(`(module (func $$type-else-break-num-vs-nums (result i32 i32)
    (if (result i32 i32) (i32.const 1)
      (then (i32.const 1) (i32.const 1))
      (else (br 0 (i64.const 1)) (i32.const 1) (i32.const 1))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1264
assert_invalid(
  () => instantiate(`(module (func $$type-then-break-partial-vs-nums (result i32 i32)
    (i32.const 1)
    (if (result i32 i32) (i32.const 1)
      (then (br 0 (i64.const 1)) (i32.const 1))
      (else (i32.const 1))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1274
assert_invalid(
  () => instantiate(`(module (func $$type-else-break-partial-vs-nums (result i32 i32)
    (i32.const 1)
    (if (result i32 i32) (i32.const 1)
      (then (i32.const 1))
      (else (br 0 (i64.const 1)) (i32.const 1))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1285
assert_invalid(
  () => instantiate(`(module
    (func $$type-condition-empty
      (if (then))
    )
  )`),
  `type mismatch`,
);

// ./test/core/if.wast:1293
assert_invalid(
  () => instantiate(`(module
    (func $$type-condition-empty-in-block
      (i32.const 0)
      (block (if (then)))
    )
  )`),
  `type mismatch`,
);

// ./test/core/if.wast:1302
assert_invalid(
  () => instantiate(`(module
    (func $$type-condition-empty-in-loop
      (i32.const 0)
      (loop (if (then)))
    )
  )`),
  `type mismatch`,
);

// ./test/core/if.wast:1311
assert_invalid(
  () => instantiate(`(module
    (func $$type-condition-empty-in-then
      (i32.const 0) (i32.const 0)
      (if (then (if (then))))
    )
  )`),
  `type mismatch`,
);

// ./test/core/if.wast:1320
assert_invalid(
  () => instantiate(`(module
    (func $$type-condition-empty-in-else
      (i32.const 0) (i32.const 0)
      (if (result i32) (then (i32.const 0)) (else (if (then)) (i32.const 0)))
      (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/if.wast:1330
assert_invalid(
  () => instantiate(`(module
    (func $$type-condition-empty-in-br
      (i32.const 0)
      (block (br 0 (if(then))) (drop))
    )
  )`),
  `type mismatch`,
);

// ./test/core/if.wast:1339
assert_invalid(
  () => instantiate(`(module
    (func $$type-condition-empty-in-br_if
      (i32.const 0)
      (block (br_if 0 (if(then)) (i32.const 1)) (drop))
    )
  )`),
  `type mismatch`,
);

// ./test/core/if.wast:1348
assert_invalid(
  () => instantiate(`(module
    (func $$type-condition-empty-in-br_table
      (i32.const 0)
      (block (br_table 0 (if(then))) (drop))
    )
  )`),
  `type mismatch`,
);

// ./test/core/if.wast:1357
assert_invalid(
  () => instantiate(`(module
    (func $$type-condition-empty-in-return
      (return (if(then))) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/if.wast:1365
assert_invalid(
  () => instantiate(`(module
    (func $$type-condition-empty-in-select
      (select (if(then)) (i32.const 1) (i32.const 2)) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/if.wast:1373
assert_invalid(
  () => instantiate(`(module
    (func $$type-condition-empty-in-call
      (call 1 (if(then))) (drop)
    )
    (func (param i32) (result i32) (local.get 0))
  )`),
  `type mismatch`,
);

// ./test/core/if.wast:1382
assert_invalid(
  () => instantiate(`(module
    (func $$f (param i32) (result i32) (local.get 0))
    (type $$sig (func (param i32) (result i32)))
    (table funcref (elem $$f))
    (func $$type-condition-empty-in-call_indirect
      (block (result i32)
        (call_indirect (type $$sig)
          (if(then)) (i32.const 0)
        )
        (drop)
      )
    )
  )`),
  `type mismatch`,
);

// ./test/core/if.wast:1398
assert_invalid(
  () => instantiate(`(module
    (func $$type-condition-empty-in-local.set
      (local i32)
      (local.set 0 (if(then))) (local.get 0) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/if.wast:1407
assert_invalid(
  () => instantiate(`(module
    (func $$type-condition-empty-in-local.tee
      (local i32)
      (local.tee 0 (if(then))) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/if.wast:1416
assert_invalid(
  () => instantiate(`(module
    (global $$x (mut i32) (i32.const 0))
    (func $$type-condition-empty-in-global.set
      (global.set $$x (if(then))) (global.get $$x) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/if.wast:1425
assert_invalid(
  () => instantiate(`(module
    (memory 0)
    (func $$type-condition-empty-in-memory.grow
      (memory.grow (if(then))) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/if.wast:1434
assert_invalid(
  () => instantiate(`(module
    (memory 0)
    (func $$type-condition-empty-in-load
      (i32.load (if(then))) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/if.wast:1443
assert_invalid(
  () => instantiate(`(module
    (memory 1)
    (func $$type-condition-empty-in-store
      (i32.store (if(then)) (i32.const 1))
    )
  )`),
  `type mismatch`,
);

// ./test/core/if.wast:1453
assert_invalid(
  () => instantiate(`(module (func $$type-param-void-vs-num
    (if (param i32) (i32.const 1) (then (drop)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1459
assert_invalid(
  () => instantiate(`(module (func $$type-param-void-vs-nums
    (if (param i32 f64) (i32.const 1) (then (drop) (drop)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1465
assert_invalid(
  () => instantiate(`(module (func $$type-param-num-vs-num
    (f32.const 0) (if (param i32) (i32.const 1) (then (drop)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1471
assert_invalid(
  () => instantiate(`(module (func $$type-param-num-vs-nums
    (f32.const 0) (if (param f32 i32) (i32.const 1) (then (drop) (drop)))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1477
assert_invalid(
  () => instantiate(`(module (func $$type-param-nested-void-vs-num
    (block (if (param i32) (i32.const 1) (then (drop))))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1483
assert_invalid(
  () => instantiate(`(module (func $$type-param-void-vs-nums
    (block (if (param i32 f64) (i32.const 1) (then (drop) (drop))))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1489
assert_invalid(
  () => instantiate(`(module (func $$type-param-num-vs-num
    (block (f32.const 0) (if (param i32) (i32.const 1) (then (drop))))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1495
assert_invalid(
  () => instantiate(`(module (func $$type-param-num-vs-nums
    (block (f32.const 0) (if (param f32 i32) (i32.const 1) (then (drop) (drop))))
  ))`),
  `type mismatch`,
);

// ./test/core/if.wast:1502
assert_malformed(
  () => instantiate(`(func (param i32) (result i32) if (param $$x i32) end) `),
  `unexpected token`,
);

// ./test/core/if.wast:1506
assert_malformed(
  () => instantiate(`(func (param i32) (result i32) (if (param $$x i32) (then))) `),
  `unexpected token`,
);

// ./test/core/if.wast:1511
assert_malformed(() => instantiate(`(func i32.const 0 if end $$l) `), `mismatching label`);

// ./test/core/if.wast:1515
assert_malformed(
  () => instantiate(`(func i32.const 0 if $$a end $$l) `),
  `mismatching label`,
);

// ./test/core/if.wast:1519
assert_malformed(
  () => instantiate(`(func i32.const 0 if else $$l end) `),
  `mismatching label`,
);

// ./test/core/if.wast:1523
assert_malformed(
  () => instantiate(`(func i32.const 0 if $$a else $$l end) `),
  `mismatching label`,
);

// ./test/core/if.wast:1527
assert_malformed(
  () => instantiate(`(func i32.const 0 if else end $$l) `),
  `mismatching label`,
);

// ./test/core/if.wast:1531
assert_malformed(
  () => instantiate(`(func i32.const 0 if else $$l end $$l) `),
  `mismatching label`,
);

// ./test/core/if.wast:1535
assert_malformed(
  () => instantiate(`(func i32.const 0 if else $$l1 end $$l2) `),
  `mismatching label`,
);

// ./test/core/if.wast:1539
assert_malformed(
  () => instantiate(`(func i32.const 0 if $$a else end $$l) `),
  `mismatching label`,
);

// ./test/core/if.wast:1543
assert_malformed(
  () => instantiate(`(func i32.const 0 if $$a else $$a end $$l) `),
  `mismatching label`,
);

// ./test/core/if.wast:1547
assert_malformed(
  () => instantiate(`(func i32.const 0 if $$a else $$l end $$l) `),
  `mismatching label`,
);
