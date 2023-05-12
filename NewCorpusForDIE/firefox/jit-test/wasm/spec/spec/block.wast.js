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

// ./test/core/block.wast

// ./test/core/block.wast:3
let $0 = instantiate(`(module
  ;; Auxiliary definition
  (memory 1)

  (func $$dummy)

  (func (export "empty")
    (block)
    (block $$l)
  )

  (func (export "singular") (result i32)
    (block (nop))
    (block (result i32) (i32.const 7))
  )

  (func (export "multi") (result i32)
    (block (call $$dummy) (call $$dummy) (call $$dummy) (call $$dummy))
    (block (result i32)
      (call $$dummy) (call $$dummy) (call $$dummy) (i32.const 7) (call $$dummy)
    )
    (drop)
    (block (result i32 i64 i32)
      (call $$dummy) (call $$dummy) (call $$dummy) (i32.const 8) (call $$dummy)
      (call $$dummy) (call $$dummy) (call $$dummy) (i64.const 7) (call $$dummy)
      (call $$dummy) (call $$dummy) (call $$dummy) (i32.const 9) (call $$dummy)
    )
    (drop) (drop)
  )

  (func (export "nested") (result i32)
    (block (result i32)
      (block (call $$dummy) (block) (nop))
      (block (result i32) (call $$dummy) (i32.const 9))
    )
  )

  (func (export "deep") (result i32)
    (block (result i32) (block (result i32)
      (block (result i32) (block (result i32)
        (block (result i32) (block (result i32)
          (block (result i32) (block (result i32)
            (block (result i32) (block (result i32)
              (block (result i32) (block (result i32)
                (block (result i32) (block (result i32)
                  (block (result i32) (block (result i32)
                    (block (result i32) (block (result i32)
                      (block (result i32) (block (result i32)
                        (block (result i32) (block (result i32)
                          (block (result i32) (block (result i32)
                            (block (result i32) (block (result i32)
                              (block (result i32) (block (result i32)
                                (block (result i32) (block (result i32)
                                  (block (result i32) (block (result i32)
                                    (block (result i32) (block (result i32)
                                      (block (result i32) (block (result i32)
                                        (block (result i32) (block (result i32)
                                          (call $$dummy) (i32.const 150)
                                        ))
                                      ))
                                    ))
                                  ))
                                ))
                              ))
                            ))
                          ))
                        ))
                      ))
                    ))
                  ))
                ))
              ))
            ))
          ))
        ))
      ))
    ))
  )

  (func (export "as-select-first") (result i32)
    (select (block (result i32) (i32.const 1)) (i32.const 2) (i32.const 3))
  )
  (func (export "as-select-mid") (result i32)
    (select (i32.const 2) (block (result i32) (i32.const 1)) (i32.const 3))
  )
  (func (export "as-select-last") (result i32)
    (select (i32.const 2) (i32.const 3) (block (result i32) (i32.const 1)))
  )

  (func (export "as-loop-first") (result i32)
    (loop (result i32) (block (result i32) (i32.const 1)) (call $$dummy) (call $$dummy))
  )
  (func (export "as-loop-mid") (result i32)
    (loop (result i32) (call $$dummy) (block (result i32) (i32.const 1)) (call $$dummy))
  )
  (func (export "as-loop-last") (result i32)
    (loop (result i32) (call $$dummy) (call $$dummy) (block (result i32) (i32.const 1)))
  )

  (func (export "as-if-condition")
    (block (result i32) (i32.const 1)) (if (then (call $$dummy)))
  )
  (func (export "as-if-then") (result i32)
    (if (result i32) (i32.const 1) (then (block (result i32) (i32.const 1))) (else (i32.const 2)))
  )
  (func (export "as-if-else") (result i32)
    (if (result i32) (i32.const 1) (then (i32.const 2)) (else (block (result i32) (i32.const 1))))
  )

  (func (export "as-br_if-first") (result i32)
    (block (result i32) (br_if 0 (block (result i32) (i32.const 1)) (i32.const 2)))
  )
  (func (export "as-br_if-last") (result i32)
    (block (result i32) (br_if 0 (i32.const 2) (block (result i32) (i32.const 1))))
  )

  (func (export "as-br_table-first") (result i32)
    (block (result i32) (block (result i32) (i32.const 1)) (i32.const 2) (br_table 0 0))
  )
  (func (export "as-br_table-last") (result i32)
    (block (result i32) (i32.const 2) (block (result i32) (i32.const 1)) (br_table 0 0))
  )

  (func $$func (param i32 i32) (result i32) (local.get 0))
  (type $$check (func (param i32 i32) (result i32)))
  (table funcref (elem $$func))
  (func (export "as-call_indirect-first") (result i32)
    (block (result i32)
      (call_indirect (type $$check)
        (block (result i32) (i32.const 1)) (i32.const 2) (i32.const 0)
      )
    )
  )
  (func (export "as-call_indirect-mid") (result i32)
    (block (result i32)
      (call_indirect (type $$check)
        (i32.const 2) (block (result i32) (i32.const 1)) (i32.const 0)
      )
    )
  )
  (func (export "as-call_indirect-last") (result i32)
    (block (result i32)
      (call_indirect (type $$check)
        (i32.const 1) (i32.const 2) (block (result i32) (i32.const 0))
      )
    )
  )

  (func (export "as-store-first")
    (block (result i32) (i32.const 1)) (i32.const 1) (i32.store)
  )
  (func (export "as-store-last")
    (i32.const 10) (block (result i32) (i32.const 1)) (i32.store)
  )

  (func (export "as-memory.grow-value") (result i32)
    (memory.grow (block (result i32) (i32.const 1)))
  )

  (func $$f (param i32) (result i32) (local.get 0))

  (func (export "as-call-value") (result i32)
    (call $$f (block (result i32) (i32.const 1)))
  )
  (func (export "as-return-value") (result i32)
    (block (result i32) (i32.const 1)) (return)
  )
  (func (export "as-drop-operand")
    (drop (block (result i32) (i32.const 1)))
  )
  (func (export "as-br-value") (result i32)
    (block (result i32) (br 0 (block (result i32) (i32.const 1))))
  )
  (func (export "as-local.set-value") (result i32)
    (local i32) (local.set 0 (block (result i32) (i32.const 1))) (local.get 0)
  )
  (func (export "as-local.tee-value") (result i32)
    (local i32) (local.tee 0 (block (result i32) (i32.const 1)))
  )
  (global $$a (mut i32) (i32.const 10))
  (func (export "as-global.set-value") (result i32)
    (global.set $$a (block (result i32) (i32.const 1)))
    (global.get $$a)
  )

  (func (export "as-load-operand") (result i32)
    (i32.load (block (result i32) (i32.const 1)))
  )

  (func (export "as-unary-operand") (result i32)
    (i32.ctz (block (result i32) (call $$dummy) (i32.const 13)))
  )
  (func (export "as-binary-operand") (result i32)
    (i32.mul
      (block (result i32) (call $$dummy) (i32.const 3))
      (block (result i32) (call $$dummy) (i32.const 4))
    )
  )
  (func (export "as-test-operand") (result i32)
    (i32.eqz (block (result i32) (call $$dummy) (i32.const 13)))
  )
  (func (export "as-compare-operand") (result i32)
    (f32.gt
      (block (result f32) (call $$dummy) (f32.const 3))
      (block (result f32) (call $$dummy) (f32.const 3))
    )
  )
  (func (export "as-binary-operands") (result i32)
    (i32.mul
      (block (result i32 i32)
        (call $$dummy) (i32.const 3) (call $$dummy) (i32.const 4)
      )
    )
  )
  (func (export "as-compare-operands") (result i32)
    (f32.gt
      (block (result f32 f32)
        (call $$dummy) (f32.const 3) (call $$dummy) (f32.const 3)
      )
    )
  )
  (func (export "as-mixed-operands") (result i32)
    (block (result i32 i32)
      (call $$dummy) (i32.const 3) (call $$dummy) (i32.const 4)
    )
    (i32.const 5)
    (i32.add)
    (i32.mul)
  )

  (func (export "break-bare") (result i32)
    (block (br 0) (unreachable))
    (block (br_if 0 (i32.const 1)) (unreachable))
    (block (br_table 0 (i32.const 0)) (unreachable))
    (block (br_table 0 0 0 (i32.const 1)) (unreachable))
    (i32.const 19)
  )
  (func (export "break-value") (result i32)
    (block (result i32) (br 0 (i32.const 18)) (i32.const 19))
  )
  (func (export "break-multi-value") (result i32 i32 i64)
    (block (result i32 i32 i64)
      (br 0 (i32.const 18) (i32.const -18) (i64.const 18))
      (i32.const 19) (i32.const -19) (i64.const 19)
    )
  )
  (func (export "break-repeated") (result i32)
    (block (result i32)
      (br 0 (i32.const 18))
      (br 0 (i32.const 19))
      (drop (br_if 0 (i32.const 20) (i32.const 0)))
      (drop (br_if 0 (i32.const 20) (i32.const 1)))
      (br 0 (i32.const 21))
      (br_table 0 (i32.const 22) (i32.const 4))
      (br_table 0 0 0 (i32.const 23) (i32.const 1))
      (i32.const 21)
    )
  )
  (func (export "break-inner") (result i32)
    (local i32)
    (local.set 0 (i32.const 0))
    (local.set 0 (i32.add (local.get 0) (block (result i32) (block (result i32) (br 1 (i32.const 0x1))))))
    (local.set 0 (i32.add (local.get 0) (block (result i32) (block (br 0)) (i32.const 0x2))))
    (local.set 0
      (i32.add (local.get 0) (block (result i32) (i32.ctz (br 0 (i32.const 0x4)))))
    )
    (local.set 0
      (i32.add (local.get 0) (block (result i32) (i32.ctz (block (result i32) (br 1 (i32.const 0x8))))))
    )
    (local.get 0)
  )

  (func (export "param") (result i32)
    (i32.const 1)
    (block (param i32) (result i32)
      (i32.const 2)
      (i32.add)
    )
  )
  (func (export "params") (result i32)
    (i32.const 1)
    (i32.const 2)
    (block (param i32 i32) (result i32)
      (i32.add)
    )
  )
  (func (export "params-id") (result i32)
    (i32.const 1)
    (i32.const 2)
    (block (param i32 i32) (result i32 i32))
    (i32.add)
  )
  (func (export "param-break") (result i32)
    (i32.const 1)
    (block (param i32) (result i32)
      (i32.const 2)
      (i32.add)
      (br 0)
    )
  )
  (func (export "params-break") (result i32)
    (i32.const 1)
    (i32.const 2)
    (block (param i32 i32) (result i32)
      (i32.add)
      (br 0)
    )
  )
  (func (export "params-id-break") (result i32)
    (i32.const 1)
    (i32.const 2)
    (block (param i32 i32) (result i32 i32) (br 0))
    (i32.add)
  )

  (func (export "effects") (result i32)
    (local i32)
    (block
      (local.set 0 (i32.const 1))
      (local.set 0 (i32.mul (local.get 0) (i32.const 3)))
      (local.set 0 (i32.sub (local.get 0) (i32.const 5)))
      (local.set 0 (i32.mul (local.get 0) (i32.const 7)))
      (br 0)
      (local.set 0 (i32.mul (local.get 0) (i32.const 100)))
    )
    (i32.eq (local.get 0) (i32.const -14))
  )

  (type $$block-sig-1 (func))
  (type $$block-sig-2 (func (result i32)))
  (type $$block-sig-3 (func (param $$x i32)))
  (type $$block-sig-4 (func (param i32 f64 i32) (result i32 f64 i32)))

  (func (export "type-use")
    (block (type $$block-sig-1))
    (block (type $$block-sig-2) (i32.const 0))
    (block (type $$block-sig-3) (drop))
    (i32.const 0) (f64.const 0) (i32.const 0)
    (block (type $$block-sig-4))
    (drop) (drop) (drop)
    (block (type $$block-sig-2) (result i32) (i32.const 0))
    (block (type $$block-sig-3) (param i32) (drop))
    (i32.const 0) (f64.const 0) (i32.const 0)
    (block (type $$block-sig-4)
      (param i32) (param f64 i32) (result i32 f64) (result i32)
    )
    (drop) (drop) (drop)
  )
)`);

// ./test/core/block.wast:353
assert_return(() => invoke($0, `empty`, []), []);

// ./test/core/block.wast:354
assert_return(() => invoke($0, `singular`, []), [value("i32", 7)]);

// ./test/core/block.wast:355
assert_return(() => invoke($0, `multi`, []), [value("i32", 8)]);

// ./test/core/block.wast:356
assert_return(() => invoke($0, `nested`, []), [value("i32", 9)]);

// ./test/core/block.wast:357
assert_return(() => invoke($0, `deep`, []), [value("i32", 150)]);

// ./test/core/block.wast:359
assert_return(() => invoke($0, `as-select-first`, []), [value("i32", 1)]);

// ./test/core/block.wast:360
assert_return(() => invoke($0, `as-select-mid`, []), [value("i32", 2)]);

// ./test/core/block.wast:361
assert_return(() => invoke($0, `as-select-last`, []), [value("i32", 2)]);

// ./test/core/block.wast:363
assert_return(() => invoke($0, `as-loop-first`, []), [value("i32", 1)]);

// ./test/core/block.wast:364
assert_return(() => invoke($0, `as-loop-mid`, []), [value("i32", 1)]);

// ./test/core/block.wast:365
assert_return(() => invoke($0, `as-loop-last`, []), [value("i32", 1)]);

// ./test/core/block.wast:367
assert_return(() => invoke($0, `as-if-condition`, []), []);

// ./test/core/block.wast:368
assert_return(() => invoke($0, `as-if-then`, []), [value("i32", 1)]);

// ./test/core/block.wast:369
assert_return(() => invoke($0, `as-if-else`, []), [value("i32", 2)]);

// ./test/core/block.wast:371
assert_return(() => invoke($0, `as-br_if-first`, []), [value("i32", 1)]);

// ./test/core/block.wast:372
assert_return(() => invoke($0, `as-br_if-last`, []), [value("i32", 2)]);

// ./test/core/block.wast:374
assert_return(() => invoke($0, `as-br_table-first`, []), [value("i32", 1)]);

// ./test/core/block.wast:375
assert_return(() => invoke($0, `as-br_table-last`, []), [value("i32", 2)]);

// ./test/core/block.wast:377
assert_return(() => invoke($0, `as-call_indirect-first`, []), [value("i32", 1)]);

// ./test/core/block.wast:378
assert_return(() => invoke($0, `as-call_indirect-mid`, []), [value("i32", 2)]);

// ./test/core/block.wast:379
assert_return(() => invoke($0, `as-call_indirect-last`, []), [value("i32", 1)]);

// ./test/core/block.wast:381
assert_return(() => invoke($0, `as-store-first`, []), []);

// ./test/core/block.wast:382
assert_return(() => invoke($0, `as-store-last`, []), []);

// ./test/core/block.wast:384
assert_return(() => invoke($0, `as-memory.grow-value`, []), [value("i32", 1)]);

// ./test/core/block.wast:385
assert_return(() => invoke($0, `as-call-value`, []), [value("i32", 1)]);

// ./test/core/block.wast:386
assert_return(() => invoke($0, `as-return-value`, []), [value("i32", 1)]);

// ./test/core/block.wast:387
assert_return(() => invoke($0, `as-drop-operand`, []), []);

// ./test/core/block.wast:388
assert_return(() => invoke($0, `as-br-value`, []), [value("i32", 1)]);

// ./test/core/block.wast:389
assert_return(() => invoke($0, `as-local.set-value`, []), [value("i32", 1)]);

// ./test/core/block.wast:390
assert_return(() => invoke($0, `as-local.tee-value`, []), [value("i32", 1)]);

// ./test/core/block.wast:391
assert_return(() => invoke($0, `as-global.set-value`, []), [value("i32", 1)]);

// ./test/core/block.wast:392
assert_return(() => invoke($0, `as-load-operand`, []), [value("i32", 1)]);

// ./test/core/block.wast:394
assert_return(() => invoke($0, `as-unary-operand`, []), [value("i32", 0)]);

// ./test/core/block.wast:395
assert_return(() => invoke($0, `as-binary-operand`, []), [value("i32", 12)]);

// ./test/core/block.wast:396
assert_return(() => invoke($0, `as-test-operand`, []), [value("i32", 0)]);

// ./test/core/block.wast:397
assert_return(() => invoke($0, `as-compare-operand`, []), [value("i32", 0)]);

// ./test/core/block.wast:398
assert_return(() => invoke($0, `as-binary-operands`, []), [value("i32", 12)]);

// ./test/core/block.wast:399
assert_return(() => invoke($0, `as-compare-operands`, []), [value("i32", 0)]);

// ./test/core/block.wast:400
assert_return(() => invoke($0, `as-mixed-operands`, []), [value("i32", 27)]);

// ./test/core/block.wast:402
assert_return(() => invoke($0, `break-bare`, []), [value("i32", 19)]);

// ./test/core/block.wast:403
assert_return(() => invoke($0, `break-value`, []), [value("i32", 18)]);

// ./test/core/block.wast:404
assert_return(
  () => invoke($0, `break-multi-value`, []),
  [value("i32", 18), value("i32", -18), value("i64", 18n)],
);

// ./test/core/block.wast:407
assert_return(() => invoke($0, `break-repeated`, []), [value("i32", 18)]);

// ./test/core/block.wast:408
assert_return(() => invoke($0, `break-inner`, []), [value("i32", 15)]);

// ./test/core/block.wast:410
assert_return(() => invoke($0, `param`, []), [value("i32", 3)]);

// ./test/core/block.wast:411
assert_return(() => invoke($0, `params`, []), [value("i32", 3)]);

// ./test/core/block.wast:412
assert_return(() => invoke($0, `params-id`, []), [value("i32", 3)]);

// ./test/core/block.wast:413
assert_return(() => invoke($0, `param-break`, []), [value("i32", 3)]);

// ./test/core/block.wast:414
assert_return(() => invoke($0, `params-break`, []), [value("i32", 3)]);

// ./test/core/block.wast:415
assert_return(() => invoke($0, `params-id-break`, []), [value("i32", 3)]);

// ./test/core/block.wast:417
assert_return(() => invoke($0, `effects`, []), [value("i32", 1)]);

// ./test/core/block.wast:419
assert_return(() => invoke($0, `type-use`, []), []);

// ./test/core/block.wast:421
assert_malformed(
  () => instantiate(`(type $$sig (func (param i32) (result i32))) (func (i32.const 0) (block (type $$sig) (result i32) (param i32))) `),
  `unexpected token`,
);

// ./test/core/block.wast:428
assert_malformed(
  () => instantiate(`(type $$sig (func (param i32) (result i32))) (func (i32.const 0) (block (param i32) (type $$sig) (result i32))) `),
  `unexpected token`,
);

// ./test/core/block.wast:435
assert_malformed(
  () => instantiate(`(type $$sig (func (param i32) (result i32))) (func (i32.const 0) (block (param i32) (result i32) (type $$sig))) `),
  `unexpected token`,
);

// ./test/core/block.wast:442
assert_malformed(
  () => instantiate(`(type $$sig (func (param i32) (result i32))) (func (i32.const 0) (block (result i32) (type $$sig) (param i32))) `),
  `unexpected token`,
);

// ./test/core/block.wast:449
assert_malformed(
  () => instantiate(`(type $$sig (func (param i32) (result i32))) (func (i32.const 0) (block (result i32) (param i32) (type $$sig))) `),
  `unexpected token`,
);

// ./test/core/block.wast:456
assert_malformed(
  () => instantiate(`(func (i32.const 0) (block (result i32) (param i32))) `),
  `unexpected token`,
);

// ./test/core/block.wast:463
assert_malformed(
  () => instantiate(`(func (i32.const 0) (block (param $$x i32) (drop))) `),
  `unexpected token`,
);

// ./test/core/block.wast:467
assert_malformed(
  () => instantiate(`(type $$sig (func)) (func (block (type $$sig) (result i32) (i32.const 0)) (unreachable)) `),
  `inline function type`,
);

// ./test/core/block.wast:474
assert_malformed(
  () => instantiate(`(type $$sig (func (param i32) (result i32))) (func (block (type $$sig) (result i32) (i32.const 0)) (unreachable)) `),
  `inline function type`,
);

// ./test/core/block.wast:481
assert_malformed(
  () => instantiate(`(type $$sig (func (param i32) (result i32))) (func (i32.const 0) (block (type $$sig) (param i32) (drop)) (unreachable)) `),
  `inline function type`,
);

// ./test/core/block.wast:488
assert_malformed(
  () => instantiate(`(type $$sig (func (param i32 i32) (result i32))) (func (i32.const 0) (block (type $$sig) (param i32) (result i32)) (unreachable)) `),
  `inline function type`,
);

// ./test/core/block.wast:496
assert_invalid(
  () => instantiate(`(module
    (type $$sig (func))
    (func (block (type $$sig) (i32.const 0)))
  )`),
  `type mismatch`,
);

// ./test/core/block.wast:504
assert_invalid(
  () => instantiate(`(module (func $$type-empty-i32 (result i32) (block)))`),
  `type mismatch`,
);

// ./test/core/block.wast:508
assert_invalid(
  () => instantiate(`(module (func $$type-empty-i64 (result i64) (block)))`),
  `type mismatch`,
);

// ./test/core/block.wast:512
assert_invalid(
  () => instantiate(`(module (func $$type-empty-f32 (result f32) (block)))`),
  `type mismatch`,
);

// ./test/core/block.wast:516
assert_invalid(
  () => instantiate(`(module (func $$type-empty-f64 (result f64) (block)))`),
  `type mismatch`,
);

// ./test/core/block.wast:521
assert_invalid(
  () => instantiate(`(module (func $$type-value-i32-vs-void
    (block (i32.const 1))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:527
assert_invalid(
  () => instantiate(`(module (func $$type-value-i64-vs-void
    (block (i64.const 1))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:533
assert_invalid(
  () => instantiate(`(module (func $$type-value-f32-vs-void
    (block (f32.const 1.0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:539
assert_invalid(
  () => instantiate(`(module (func $$type-value-f64-vs-void
    (block (f64.const 1.0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:545
assert_invalid(
  () => instantiate(`(module (func $$type-value-nums-vs-void
    (block (i32.const 1) (i32.const 2))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:551
assert_invalid(
  () => instantiate(`(module (func $$type-value-empty-vs-i32 (result i32)
    (block (result i32))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:557
assert_invalid(
  () => instantiate(`(module (func $$type-value-empty-vs-i64 (result i64)
    (block (result i64))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:563
assert_invalid(
  () => instantiate(`(module (func $$type-value-empty-vs-f32 (result f32)
    (block (result f32))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:569
assert_invalid(
  () => instantiate(`(module (func $$type-value-empty-vs-f64 (result f64)
    (block (result f64))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:575
assert_invalid(
  () => instantiate(`(module (func $$type-value-empty-vs-nums (result i32 i32)
    (block (result i32 i32))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:582
assert_invalid(
  () => instantiate(`(module
    (func $$type-value-empty-in-block
      (i32.const 0)
      (block (block (result i32)) (drop))
    )
  )`),
  `type mismatch`,
);

// ./test/core/block.wast:591
assert_invalid(
  () => instantiate(`(module
    (func $$type-value-empty-in-loop
      (i32.const 0)
      (loop (block (result i32)) (drop))
    )
  )`),
  `type mismatch`,
);

// ./test/core/block.wast:600
assert_invalid(
  () => instantiate(`(module
    (func $$type-value-empty-in-then
      (i32.const 0) (i32.const 0)
      (if (then (block (result i32)) (drop)))
    )
  )`),
  `type mismatch`,
);

// ./test/core/block.wast:610
assert_invalid(
  () => instantiate(`(module (func $$type-value-void-vs-i32 (result i32)
    (block (result i32) (nop))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:616
assert_invalid(
  () => instantiate(`(module (func $$type-value-void-vs-i64 (result i64)
    (block (result i64) (nop))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:622
assert_invalid(
  () => instantiate(`(module (func $$type-value-void-vs-f32 (result f32)
    (block (result f32) (nop))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:628
assert_invalid(
  () => instantiate(`(module (func $$type-value-void-vs-f64 (result f64)
    (block (result f64) (nop))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:634
assert_invalid(
  () => instantiate(`(module (func $$type-value-void-vs-nums (result i32 i32)
    (block (result i32 i32) (nop))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:640
assert_invalid(
  () => instantiate(`(module (func $$type-value-i32-vs-i64 (result i32)
    (block (result i32) (i64.const 0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:646
assert_invalid(
  () => instantiate(`(module (func $$type-value-i32-vs-f32 (result i32)
    (block (result i32) (f32.const 0.0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:652
assert_invalid(
  () => instantiate(`(module (func $$type-value-i32-vs-f64 (result i32)
    (block (result i32) (f64.const 0.0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:658
assert_invalid(
  () => instantiate(`(module (func $$type-value-i64-vs-i32 (result i64)
    (block (result i64) (i32.const 0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:664
assert_invalid(
  () => instantiate(`(module (func $$type-value-i64-vs-f32 (result i64)
    (block (result i64) (f32.const 0.0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:670
assert_invalid(
  () => instantiate(`(module (func $$type-value-i64-vs-f64 (result i64)
    (block (result i64) (f64.const 0.0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:676
assert_invalid(
  () => instantiate(`(module (func $$type-value-f32-vs-i32 (result f32)
    (block (result f32) (i32.const 0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:682
assert_invalid(
  () => instantiate(`(module (func $$type-value-f32-vs-i64 (result f32)
    (block (result f32) (i64.const 0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:688
assert_invalid(
  () => instantiate(`(module (func $$type-value-f32-vs-f64 (result f32)
    (block (result f32) (f64.const 0.0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:694
assert_invalid(
  () => instantiate(`(module (func $$type-value-f64-vs-i32 (result f64)
    (block (result f64) (i32.const 0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:700
assert_invalid(
  () => instantiate(`(module (func $$type-value-f64-vs-i64 (result f64)
    (block (result f64) (i64.const 0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:706
assert_invalid(
  () => instantiate(`(module (func $$type-value-f64-vs-f32 (result f32)
    (block (result f64) (f32.const 0.0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:712
assert_invalid(
  () => instantiate(`(module (func $$type-value-num-vs-nums (result i32 i32)
    (block (result i32 i32) (i32.const 0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:718
assert_invalid(
  () => instantiate(`(module (func $$type-value-partial-vs-nums (result i32 i32)
    (i32.const 1) (block (result i32 i32) (i32.const 2))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:724
assert_invalid(
  () => instantiate(`(module (func $$type-value-nums-vs-num (result i32)
    (block (result i32) (i32.const 1) (i32.const 2))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:731
assert_invalid(
  () => instantiate(`(module (func $$type-value-unreached-select-i32-i64 (result i32)
    (block (result i64) (select (unreachable) (unreachable) (unreachable)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:737
assert_invalid(
  () => instantiate(`(module (func $$type-value-unreached-select-i32-f32 (result i32)
    (block (result f32) (select (unreachable) (unreachable) (unreachable)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:743
assert_invalid(
  () => instantiate(`(module (func $$type-value-unreached-select-i32-f64 (result i32)
    (block (result f64) (select (unreachable) (unreachable) (unreachable)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:749
assert_invalid(
  () => instantiate(`(module (func $$type-value-unreached-select-i64-i32 (result i64)
    (block (result i32) (select (unreachable) (unreachable) (unreachable)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:755
assert_invalid(
  () => instantiate(`(module (func $$type-value-unreached-select-i64-f32 (result i64)
    (block (result f32) (select (unreachable) (unreachable) (unreachable)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:761
assert_invalid(
  () => instantiate(`(module (func $$type-value-unreached-select-i64-f64 (result i64)
    (block (result f64) (select (unreachable) (unreachable) (unreachable)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:767
assert_invalid(
  () => instantiate(`(module (func $$type-value-unreached-select-f32-i32 (result f32)
    (block (result i32) (select (unreachable) (unreachable) (unreachable)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:773
assert_invalid(
  () => instantiate(`(module (func $$type-value-unreached-select-f32-i64 (result f32)
    (block (result i64) (select (unreachable) (unreachable) (unreachable)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:779
assert_invalid(
  () => instantiate(`(module (func $$type-value-unreached-select-f32-f64 (result f32)
    (block (result f64) (select (unreachable) (unreachable) (unreachable)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:785
assert_invalid(
  () => instantiate(`(module (func $$type-value-unreached-select-f64-i32 (result f64)
    (block (result i32) (select (unreachable) (unreachable) (unreachable)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:791
assert_invalid(
  () => instantiate(`(module (func $$type-value-unreached-select-f64-i64 (result f64)
    (block (result i64) (select (unreachable) (unreachable) (unreachable)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:797
assert_invalid(
  () => instantiate(`(module (func $$type-value-unreached-select-f64-f32 (result f64)
    (block (result f32) (select (unreachable) (unreachable) (unreachable)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:804
assert_invalid(
  () => instantiate(`(module (func $$type-break-last-void-vs-i32 (result i32)
    (block (result i32) (br 0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:810
assert_invalid(
  () => instantiate(`(module (func $$type-break-last-void-vs-i64 (result i64)
    (block (result i64) (br 0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:816
assert_invalid(
  () => instantiate(`(module (func $$type-break-last-void-vs-f32 (result f32)
    (block (result f32) (br 0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:822
assert_invalid(
  () => instantiate(`(module (func $$type-break-last-void-vs-f64 (result f64)
    (block (result f64) (br 0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:828
assert_invalid(
  () => instantiate(`(module (func $$type-break-last-void-vs-nums (result i32 i32)
    (block (result i32 i32) (br 0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:835
assert_invalid(
  () => instantiate(`(module (func $$type-break-empty-vs-i32 (result i32)
    (block (result i32) (br 0) (i32.const 1))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:841
assert_invalid(
  () => instantiate(`(module (func $$type-break-empty-vs-i64 (result i64)
    (block (result i64) (br 0) (i64.const 1))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:847
assert_invalid(
  () => instantiate(`(module (func $$type-break-empty-vs-f32 (result f32)
    (block (result f32) (br 0) (f32.const 1.0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:853
assert_invalid(
  () => instantiate(`(module (func $$type-break-empty-vs-f64 (result f64)
    (block (result f64) (br 0) (f64.const 1.0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:859
assert_invalid(
  () => instantiate(`(module (func $$type-break-empty-vs-nums (result i32 i32)
    (block (result i32 i32) (br 0) (i32.const 1) (i32.const 2))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:866
assert_invalid(
  () => instantiate(`(module (func $$type-break-void-vs-i32 (result i32)
    (block (result i32) (br 0 (nop)) (i32.const 1))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:872
assert_invalid(
  () => instantiate(`(module (func $$type-break-void-vs-i64 (result i64)
    (block (result i64) (br 0 (nop)) (i64.const 1))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:878
assert_invalid(
  () => instantiate(`(module (func $$type-break-void-vs-f32 (result f32)
    (block (result f32) (br 0 (nop)) (f32.const 1.0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:884
assert_invalid(
  () => instantiate(`(module (func $$type-break-void-vs-f64 (result f64)
    (block (result f64) (br 0 (nop)) (f64.const 1.0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:891
assert_invalid(
  () => instantiate(`(module (func $$type-break-i32-vs-i64 (result i32)
    (block (result i32) (br 0 (i64.const 1)) (i32.const 1))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:897
assert_invalid(
  () => instantiate(`(module (func $$type-break-i32-vs-f32 (result i32)
    (block (result i32) (br 0 (f32.const 1.0)) (i32.const 1))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:903
assert_invalid(
  () => instantiate(`(module (func $$type-break-i32-vs-f64 (result i32)
    (block (result i32) (br 0 (f64.const 1.0)) (i32.const 1))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:909
assert_invalid(
  () => instantiate(`(module (func $$type-break-i64-vs-i32 (result i64)
    (block (result i64) (br 0 (i32.const 1)) (i64.const 1))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:915
assert_invalid(
  () => instantiate(`(module (func $$type-break-i64-vs-f32 (result i64)
    (block (result i64) (br 0 (f32.const 1.0)) (i64.const 1))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:921
assert_invalid(
  () => instantiate(`(module (func $$type-break-i64-vs-f64 (result i64)
    (block (result i64) (br 0 (f64.const 1.0)) (i64.const 1))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:927
assert_invalid(
  () => instantiate(`(module (func $$type-break-f32-vs-i32 (result f32)
    (block (result f32) (br 0 (i32.const 1)) (f32.const 1.0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:933
assert_invalid(
  () => instantiate(`(module (func $$type-break-f32-vs-i64 (result f32)
    (block (result f32) (br 0 (i64.const 1)) (f32.const 1.0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:939
assert_invalid(
  () => instantiate(`(module (func $$type-break-f32-vs-f64 (result f32)
    (block (result f32) (br 0 (f64.const 1.0)) (f32.const 1.0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:945
assert_invalid(
  () => instantiate(`(module (func $$type-break-f64-vs-i32 (result f64)
    (block (result i64) (br 0 (i32.const 1)) (f64.const 1.0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:951
assert_invalid(
  () => instantiate(`(module (func $$type-break-f64-vs-i64 (result f64)
    (block (result f64) (br 0 (i64.const 1)) (f64.const 1.0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:957
assert_invalid(
  () => instantiate(`(module (func $$type-break-f64-vs-f32 (result f64)
    (block (result f64) (br 0 (f32.const 1.0)) (f64.const 1))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:963
assert_invalid(
  () => instantiate(`(module (func $$type-break-num-vs-nums (result i32 i32)
    (block (result i32 i32) (br 0 (i32.const 0)) (i32.const 1) (i32.const 2))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:969
assert_invalid(
  () => instantiate(`(module (func $$type-break-partial-vs-nums (result i32 i32)
    (i32.const 1) (block (result i32 i32) (br 0 (i32.const 0)) (i32.const 2))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:976
assert_invalid(
  () => instantiate(`(module (func $$type-break-first-void-vs-i32 (result i32)
    (block (result i32) (br 0 (nop)) (br 0 (i32.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:982
assert_invalid(
  () => instantiate(`(module (func $$type-break-first-void-vs-i64 (result i64)
    (block (result i64) (br 0 (nop)) (br 0 (i64.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:988
assert_invalid(
  () => instantiate(`(module (func $$type-break-first-void-vs-f32 (result f32)
    (block (result f32) (br 0 (nop)) (br 0 (f32.const 1.0)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:994
assert_invalid(
  () => instantiate(`(module (func $$type-break-first-void-vs-f64 (result f64)
    (block (result f64) (br 0 (nop)) (br 0 (f64.const 1.0)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1000
assert_invalid(
  () => instantiate(`(module (func $$type-break-first-void-vs-nums (result i32 i32)
    (block (result i32 i32) (br 0 (nop)) (br 0 (i32.const 1) (i32.const 2)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1007
assert_invalid(
  () => instantiate(`(module (func $$type-break-first-i32-vs-i64 (result i32)
    (block (result i32) (br 0 (i64.const 1)) (br 0 (i32.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1013
assert_invalid(
  () => instantiate(`(module (func $$type-break-first-i32-vs-f32 (result i32)
    (block (result i32) (br 0 (f32.const 1.0)) (br 0 (i32.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1019
assert_invalid(
  () => instantiate(`(module (func $$type-break-first-i32-vs-f64 (result i32)
    (block (result i32) (br 0 (f64.const 1.0)) (br 0 (i32.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1025
assert_invalid(
  () => instantiate(`(module (func $$type-break-first-i64-vs-i32 (result i64)
    (block (result i64) (br 0 (i32.const 1)) (br 0 (i64.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1031
assert_invalid(
  () => instantiate(`(module (func $$type-break-first-i64-vs-f32 (result i64)
    (block (result i64) (br 0 (f32.const 1.0)) (br 0 (i64.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1037
assert_invalid(
  () => instantiate(`(module (func $$type-break-first-i64-vs-f64 (result i64)
    (block (result i64) (br 0 (f64.const 1.0)) (br 0 (i64.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1043
assert_invalid(
  () => instantiate(`(module (func $$type-break-first-f32-vs-i32 (result f32)
    (block (result f32) (br 0 (i32.const 1)) (br 0 (f32.const 1.0)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1049
assert_invalid(
  () => instantiate(`(module (func $$type-break-first-f32-vs-i64 (result f32)
    (block (result f32) (br 0 (i64.const 1)) (br 0 (f32.const 1.0)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1055
assert_invalid(
  () => instantiate(`(module (func $$type-break-first-f32-vs-f64 (result f32)
    (block (result f32) (br 0 (f64.const 1.0)) (br 0 (f32.const 1.0)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1061
assert_invalid(
  () => instantiate(`(module (func $$type-break-first-f64-vs-i32 (result f64)
    (block (result f64) (br 0 (i32.const 1)) (br 0 (f64.const 1.0)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1067
assert_invalid(
  () => instantiate(`(module (func $$type-break-first-f64-vs-i64 (result f64)
    (block (result f64) (br 0 (i64.const 1)) (br 0 (f64.const 1.0)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1073
assert_invalid(
  () => instantiate(`(module (func $$type-break-first-f64-vs-f32 (result f64)
    (block (result f64) (br 0 (f32.const 1.0)) (br 0 (f64.const 1.0)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1079
assert_invalid(
  () => instantiate(`(module (func $$type-break-first-num-vs-nums (result i32 i32)
    (block (result i32 i32) (br 0 (i32.const 0)) (br 0 (i32.const 1) (i32.const 2)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1086
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-i32-vs-void
    (block (result i32) (block (result i32) (br 1 (i32.const 1))) (br 0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1092
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-i64-vs-void
    (block (result i64) (block (result i64) (br 1 (i64.const 1))) (br 0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1098
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-f32-vs-void
    (block (result f32) (block (result f32) (br 1 (f32.const 1.0))) (br 0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1104
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-f64-vs-void
    (block (result f64) (block (result f64) (br 1 (f64.const 1.0))) (br 0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1110
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-nums-vs-void
    (block (result i32 i32) (block (result i32 i32) (br 1 (i32.const 1) (i32.const 2))) (br 0))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1117
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-empty-vs-i32 (result i32)
    (block (result i32) (block (br 1)) (br 0 (i32.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1123
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-empty-vs-i64 (result i64)
    (block (result i64) (block (br 1)) (br 0 (i64.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1129
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-empty-vs-f32 (result f32)
    (block (result f32) (block (br 1)) (br 0 (f32.const 1.0)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1135
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-empty-vs-f64 (result f64)
    (block (result f64) (block (br 1)) (br 0 (f64.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1141
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-empty-vs-nums (result i32 i32)
    (block (result i32 i32) (block (br 1)) (br 0 (i32.const 1) (i32.const 2)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1148
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-void-vs-i32 (result i32)
    (block (result i32) (block (result i32) (br 1 (nop))) (br 0 (i32.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1154
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-void-vs-i64 (result i64)
    (block (result i64) (block (result i64) (br 1 (nop))) (br 0 (i64.const 1)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1160
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-void-vs-f32 (result f32)
    (block (result f32) (block (result f32) (br 1 (nop))) (br 0 (f32.const 1.0)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1166
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-void-vs-f64 (result f64)
    (block (result f64) (block (result f64) (br 1 (nop))) (br 0 (f64.const 1.0)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1172
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-void-vs-nums (result i32 i32)
    (block (result i32 i32) (block (result i32 i32) (br 1 (nop))) (br 0 (i32.const 1) (i32.const 2)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1179
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-i32-vs-i64 (result i32)
    (block (result i32)
      (block (result i32) (br 1 (i64.const 1))) (br 0 (i32.const 1))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1187
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-i32-vs-f32 (result i32)
    (block (result i32)
      (block (result i32) (br 1 (f32.const 1.0))) (br 0 (i32.const 1))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1195
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-i32-vs-f64 (result i32)
    (block (result i32)
      (block (result i32) (br 1 (f64.const 1.0))) (br 0 (i32.const 1))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1203
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-i64-vs-i32 (result i64)
    (block (result i64)
      (block (result i64) (br 1 (i32.const 1))) (br 0 (i64.const 1))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1211
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-i64-vs-f32 (result i64)
    (block (result i64)
      (block (result i64) (br 1 (f32.const 1.0))) (br 0 (i64.const 1))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1219
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-i64-vs-f64 (result i64)
    (block (result i64)
      (block (result i64) (br 1 (f64.const 1.0))) (br 0 (i64.const 1))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1227
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-f32-vs-i32 (result f32)
    (block (result f32)
      (block (result f32) (br 1 (i32.const 1))) (br 0 (f32.const 1.0))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1235
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-f32-vs-i64 (result f32)
    (block (result f32)
      (block (result f32) (br 1 (i64.const 1))) (br 0 (f32.const 1.0))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1243
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-f32-vs-f64 (result f32)
    (block (result f32)
      (block (result f32) (br 1 (f64.const 1.0))) (br 0 (f32.const 1.0))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1251
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-f64-vs-i32 (result f64)
    (block (result f64)
      (block (result f64) (br 1 (i32.const 1))) (br 0 (f64.const 1.0))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1259
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-f64-vs-i64 (result f64)
    (block (result f64)
      (block (result f64) (br 1 (i64.const 1))) (br 0 (f64.const 1.0))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1267
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-f64-vs-f32 (result f64)
    (block (result f64)
      (block (result f64) (br 1 (f32.const 1.0))) (br 0 (f64.const 1.0))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1275
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-num-vs-nums (result i32 i32)
    (block (result i32 i32)
      (block (result i32 i32) (br 1 (i32.const 0))) (br 0 (i32.const 1) (i32.const 2))
    )
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1284
assert_invalid(
  () => instantiate(`(module (func $$type-break-operand-empty-vs-i32 (result i32)
    (i32.ctz (block (br 0)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1290
assert_invalid(
  () => instantiate(`(module (func $$type-break-operand-empty-vs-i64 (result i64)
    (i64.ctz (block (br 0)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1296
assert_invalid(
  () => instantiate(`(module (func $$type-break-operand-empty-vs-f32 (result f32)
    (f32.floor (block (br 0)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1302
assert_invalid(
  () => instantiate(`(module (func $$type-break-operand-empty-vs-f64 (result f64)
    (f64.floor (block (br 0)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1308
assert_invalid(
  () => instantiate(`(module (func $$type-break-operand-empty-vs-nums (result i32)
    (i32.add (block (br 0)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1315
assert_invalid(
  () => instantiate(`(module (func $$type-break-operand-void-vs-i32 (result i32)
    (i32.ctz (block (br 0 (nop))))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1321
assert_invalid(
  () => instantiate(`(module (func $$type-break-operand-void-vs-i64 (result i64)
    (i64.ctz (block (br 0 (nop))))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1327
assert_invalid(
  () => instantiate(`(module (func $$type-break-operand-void-vs-f32 (result f32)
    (f32.floor (block (br 0 (nop))))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1333
assert_invalid(
  () => instantiate(`(module (func $$type-break-operand-void-vs-f64 (result f64)
    (f64.floor (block (br 0 (nop))))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1339
assert_invalid(
  () => instantiate(`(module (func $$type-break-operand-void-vs-nums (result i32)
    (i32.add (block (br 0 (nop))))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1346
assert_invalid(
  () => instantiate(`(module (func $$type-break-operand-i32-vs-i64 (result i32)
    (i64.ctz (block (br 0 (i64.const 9))))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1352
assert_invalid(
  () => instantiate(`(module (func $$type-break-operand-i32-vs-f32 (result i32)
    (f32.floor (block (br 0 (f32.const 9.0))))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1358
assert_invalid(
  () => instantiate(`(module (func $$type-break-operand-i32-vs-f64 (result i32)
    (f64.floor (block (br 0 (f64.const 9.0))))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1364
assert_invalid(
  () => instantiate(`(module (func $$type-break-operand-i64-vs-i32 (result i64)
    (i32.ctz (block (br 0 (i32.const 9))))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1370
assert_invalid(
  () => instantiate(`(module (func $$type-break-operand-i64-vs-f32 (result i64)
    (f32.floor (block (br 0 (f32.const 9.0))))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1376
assert_invalid(
  () => instantiate(`(module (func $$type-break-operand-i64-vs-f64 (result i64)
    (f64.floor (block (br 0 (f64.const 9.0))))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1382
assert_invalid(
  () => instantiate(`(module (func $$type-break-operand-f32-vs-i32 (result f32)
    (i32.ctz (block (br 0 (i32.const 9))))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1388
assert_invalid(
  () => instantiate(`(module (func $$type-break-operand-f32-vs-i64 (result f32)
    (i64.ctz (block (br 0 (i64.const 9))))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1394
assert_invalid(
  () => instantiate(`(module (func $$type-break-operand-f32-vs-f64 (result f32)
    (f64.floor (block (br 0 (f64.const 9.0))))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1400
assert_invalid(
  () => instantiate(`(module (func $$type-break-operand-f64-vs-i32 (result f64)
    (i32.ctz (block (br 0 (i32.const 9))))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1406
assert_invalid(
  () => instantiate(`(module (func $$type-break-operand-f64-vs-i64 (result f64)
    (i64.ctz (block (br 0 (i64.const 9))))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1412
assert_invalid(
  () => instantiate(`(module (func $$type-break-operand-f64-vs-f32 (result f64)
    (f32.floor (block (br 0 (f32.const 9.0))))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1418
assert_invalid(
  () => instantiate(`(module (func $$type-break-operand-num-vs-nums (result i32)
    (i32.add (block (br 0 (i64.const 9) (i32.const 10))))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1425
assert_invalid(
  () => instantiate(`(module (func $$type-param-void-vs-num
    (block (param i32) (drop))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1431
assert_invalid(
  () => instantiate(`(module (func $$type-param-void-vs-nums
    (block (param i32 f64) (drop) (drop))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1437
assert_invalid(
  () => instantiate(`(module (func $$type-param-num-vs-num
    (f32.const 0) (block (param i32) (drop))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1443
assert_invalid(
  () => instantiate(`(module (func $$type-param-num-vs-nums
    (f32.const 0) (block (param f32 i32) (drop) (drop))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1449
assert_invalid(
  () => instantiate(`(module (func $$type-param-nested-void-vs-num
    (block (block (param i32) (drop)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1455
assert_invalid(
  () => instantiate(`(module (func $$type-param-void-vs-nums
    (block (block (param i32 f64) (drop) (drop)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1461
assert_invalid(
  () => instantiate(`(module (func $$type-param-num-vs-num
    (block (f32.const 0) (block (param i32) (drop)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1467
assert_invalid(
  () => instantiate(`(module (func $$type-param-num-vs-nums
    (block (f32.const 0) (block (param f32 i32) (drop) (drop)))
  ))`),
  `type mismatch`,
);

// ./test/core/block.wast:1474
assert_malformed(
  () => instantiate(`(func (param i32) (result i32) block (param $$x i32) end) `),
  `unexpected token`,
);

// ./test/core/block.wast:1478
assert_malformed(
  () => instantiate(`(func (param i32) (result i32) (block (param $$x i32))) `),
  `unexpected token`,
);

// ./test/core/block.wast:1484
assert_malformed(() => instantiate(`(func block end $$l) `), `mismatching label`);

// ./test/core/block.wast:1488
assert_malformed(() => instantiate(`(func block $$a end $$l) `), `mismatching label`);
