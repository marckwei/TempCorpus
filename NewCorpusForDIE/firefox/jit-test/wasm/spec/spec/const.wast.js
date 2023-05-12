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

// ./test/core/const.wast

// ./test/core/const.wast:5
let $0 = instantiate(`(module (func (i32.const 0_123_456_789) drop))`);

// ./test/core/const.wast:6
let $1 = instantiate(`(module (func (i32.const 0x0_9acf_fBDF) drop))`);

// ./test/core/const.wast:7
assert_malformed(() => instantiate(`(func (i32.const) drop) `), `unexpected token`);

// ./test/core/const.wast:11
assert_malformed(() => instantiate(`(func (i32.const 0x) drop) `), `unknown operator`);

// ./test/core/const.wast:15
assert_malformed(() => instantiate(`(func (i32.const 1x) drop) `), `unknown operator`);

// ./test/core/const.wast:19
assert_malformed(() => instantiate(`(func (i32.const 0xg) drop) `), `unknown operator`);

// ./test/core/const.wast:24
let $2 = instantiate(`(module (func (i64.const 0_123_456_789) drop))`);

// ./test/core/const.wast:25
let $3 = instantiate(`(module (func (i64.const 0x0125_6789_ADEF_bcef) drop))`);

// ./test/core/const.wast:26
assert_malformed(() => instantiate(`(func (i64.const) drop) `), `unexpected token`);

// ./test/core/const.wast:30
assert_malformed(() => instantiate(`(func (i64.const 0x) drop) `), `unknown operator`);

// ./test/core/const.wast:34
assert_malformed(() => instantiate(`(func (i64.const 1x) drop) `), `unknown operator`);

// ./test/core/const.wast:38
assert_malformed(() => instantiate(`(func (i64.const 0xg) drop) `), `unknown operator`);

// ./test/core/const.wast:43
let $4 = instantiate(`(module (func (f32.const 0123456789) drop))`);

// ./test/core/const.wast:44
let $5 = instantiate(`(module (func (f32.const 0123456789e019) drop))`);

// ./test/core/const.wast:45
let $6 = instantiate(`(module (func (f32.const 0123456789e+019) drop))`);

// ./test/core/const.wast:46
let $7 = instantiate(`(module (func (f32.const 0123456789e-019) drop))`);

// ./test/core/const.wast:47
let $8 = instantiate(`(module (func (f32.const 0123456789.) drop))`);

// ./test/core/const.wast:48
let $9 = instantiate(`(module (func (f32.const 0123456789.e019) drop))`);

// ./test/core/const.wast:49
let $10 = instantiate(`(module (func (f32.const 0123456789.e+019) drop))`);

// ./test/core/const.wast:50
let $11 = instantiate(`(module (func (f32.const 0123456789.e-019) drop))`);

// ./test/core/const.wast:51
let $12 = instantiate(`(module (func (f32.const 0123456789.0123456789) drop))`);

// ./test/core/const.wast:52
let $13 = instantiate(`(module (func (f32.const 0123456789.0123456789e019) drop))`);

// ./test/core/const.wast:53
let $14 = instantiate(`(module (func (f32.const 0123456789.0123456789e+019) drop))`);

// ./test/core/const.wast:54
let $15 = instantiate(`(module (func (f32.const 0123456789.0123456789e-019) drop))`);

// ./test/core/const.wast:55
let $16 = instantiate(`(module (func (f32.const 0x0123456789ABCDEF) drop))`);

// ./test/core/const.wast:56
let $17 = instantiate(`(module (func (f32.const 0x0123456789ABCDEFp019) drop))`);

// ./test/core/const.wast:57
let $18 = instantiate(`(module (func (f32.const 0x0123456789ABCDEFp+019) drop))`);

// ./test/core/const.wast:58
let $19 = instantiate(`(module (func (f32.const 0x0123456789ABCDEFp-019) drop))`);

// ./test/core/const.wast:59
let $20 = instantiate(`(module (func (f32.const 0x0123456789ABCDEF.) drop))`);

// ./test/core/const.wast:60
let $21 = instantiate(`(module (func (f32.const 0x0123456789ABCDEF.p019) drop))`);

// ./test/core/const.wast:61
let $22 = instantiate(`(module (func (f32.const 0x0123456789ABCDEF.p+019) drop))`);

// ./test/core/const.wast:62
let $23 = instantiate(`(module (func (f32.const 0x0123456789ABCDEF.p-019) drop))`);

// ./test/core/const.wast:63
let $24 = instantiate(`(module (func (f32.const 0x0123456789ABCDEF.019aF) drop))`);

// ./test/core/const.wast:64
let $25 = instantiate(`(module (func (f32.const 0x0123456789ABCDEF.019aFp019) drop))`);

// ./test/core/const.wast:65
let $26 = instantiate(`(module (func (f32.const 0x0123456789ABCDEF.019aFp+019) drop))`);

// ./test/core/const.wast:66
let $27 = instantiate(`(module (func (f32.const 0x0123456789ABCDEF.019aFp-019) drop))`);

// ./test/core/const.wast:67
assert_malformed(() => instantiate(`(func (f32.const) drop) `), `unexpected token`);

// ./test/core/const.wast:71
assert_malformed(() => instantiate(`(func (f32.const .0) drop) `), `unknown operator`);

// ./test/core/const.wast:75
assert_malformed(() => instantiate(`(func (f32.const .0e0) drop) `), `unknown operator`);

// ./test/core/const.wast:79
assert_malformed(() => instantiate(`(func (f32.const 0e) drop) `), `unknown operator`);

// ./test/core/const.wast:83
assert_malformed(() => instantiate(`(func (f32.const 0e+) drop) `), `unknown operator`);

// ./test/core/const.wast:87
assert_malformed(() => instantiate(`(func (f32.const 0.0e) drop) `), `unknown operator`);

// ./test/core/const.wast:91
assert_malformed(() => instantiate(`(func (f32.const 0.0e-) drop) `), `unknown operator`);

// ./test/core/const.wast:95
assert_malformed(() => instantiate(`(func (f32.const 0x) drop) `), `unknown operator`);

// ./test/core/const.wast:99
assert_malformed(() => instantiate(`(func (f32.const 1x) drop) `), `unknown operator`);

// ./test/core/const.wast:103
assert_malformed(() => instantiate(`(func (f32.const 0xg) drop) `), `unknown operator`);

// ./test/core/const.wast:107
assert_malformed(() => instantiate(`(func (f32.const 0x.) drop) `), `unknown operator`);

// ./test/core/const.wast:111
assert_malformed(() => instantiate(`(func (f32.const 0x0.g) drop) `), `unknown operator`);

// ./test/core/const.wast:115
assert_malformed(() => instantiate(`(func (f32.const 0x0p) drop) `), `unknown operator`);

// ./test/core/const.wast:119
assert_malformed(() => instantiate(`(func (f32.const 0x0p+) drop) `), `unknown operator`);

// ./test/core/const.wast:123
assert_malformed(() => instantiate(`(func (f32.const 0x0p-) drop) `), `unknown operator`);

// ./test/core/const.wast:127
assert_malformed(() => instantiate(`(func (f32.const 0x0.0p) drop) `), `unknown operator`);

// ./test/core/const.wast:131
assert_malformed(
  () => instantiate(`(func (f32.const 0x0.0p+) drop) `),
  `unknown operator`,
);

// ./test/core/const.wast:135
assert_malformed(
  () => instantiate(`(func (f32.const 0x0.0p-) drop) `),
  `unknown operator`,
);

// ./test/core/const.wast:139
assert_malformed(() => instantiate(`(func (f32.const 0x0pA) drop) `), `unknown operator`);

// ./test/core/const.wast:145
let $28 = instantiate(`(module (func (f64.const 0123456789) drop))`);

// ./test/core/const.wast:146
let $29 = instantiate(`(module (func (f64.const 0123456789e019) drop))`);

// ./test/core/const.wast:147
let $30 = instantiate(`(module (func (f64.const 0123456789e+019) drop))`);

// ./test/core/const.wast:148
let $31 = instantiate(`(module (func (f64.const 0123456789e-019) drop))`);

// ./test/core/const.wast:149
let $32 = instantiate(`(module (func (f64.const 0123456789.) drop))`);

// ./test/core/const.wast:150
let $33 = instantiate(`(module (func (f64.const 0123456789.e019) drop))`);

// ./test/core/const.wast:151
let $34 = instantiate(`(module (func (f64.const 0123456789.e+019) drop))`);

// ./test/core/const.wast:152
let $35 = instantiate(`(module (func (f64.const 0123456789.e-019) drop))`);

// ./test/core/const.wast:153
let $36 = instantiate(`(module (func (f64.const 0123456789.0123456789) drop))`);

// ./test/core/const.wast:154
let $37 = instantiate(`(module (func (f64.const 0123456789.0123456789e019) drop))`);

// ./test/core/const.wast:155
let $38 = instantiate(`(module (func (f64.const 0123456789.0123456789e+019) drop))`);

// ./test/core/const.wast:156
let $39 = instantiate(`(module (func (f64.const 0123456789.0123456789e-019) drop))`);

// ./test/core/const.wast:157
let $40 = instantiate(`(module (func (f64.const 0_1_2_3_4_5_6_7_8_9) drop))`);

// ./test/core/const.wast:158
let $41 = instantiate(`(module (func (f64.const 0_1_2_3_4_5_6_7_8_9.) drop))`);

// ./test/core/const.wast:159
let $42 = instantiate(`(module (func (f64.const 0_1_2_3_4_5_6_7_8_9.0_1_2_3_4_5_6_7_8_9) drop))`);

// ./test/core/const.wast:160
let $43 = instantiate(`(module (func (f64.const 0_1_2_3_4_5_6_7_8_9e+0_1_9) drop))`);

// ./test/core/const.wast:161
let $44 = instantiate(`(module (func (f64.const 0_1_2_3_4_5_6_7_8_9.e+0_1_9) drop))`);

// ./test/core/const.wast:162
let $45 = instantiate(`(module (func (f64.const 0_1_2_3_4_5_6_7_8_9.0_1_2_3_4_5_6_7_8_9e0_1_9) drop))`);

// ./test/core/const.wast:164
let $46 = instantiate(`(module (func (f64.const 0x0123456789ABCDEFabcdef) drop))`);

// ./test/core/const.wast:165
let $47 = instantiate(`(module (func (f64.const 0x0123456789ABCDEFabcdefp019) drop))`);

// ./test/core/const.wast:166
let $48 = instantiate(`(module (func (f64.const 0x0123456789ABCDEFabcdefp+019) drop))`);

// ./test/core/const.wast:167
let $49 = instantiate(`(module (func (f64.const 0x0123456789ABCDEFabcdefp-019) drop))`);

// ./test/core/const.wast:168
let $50 = instantiate(`(module (func (f64.const 0x0123456789ABCDEFabcdef.) drop))`);

// ./test/core/const.wast:169
let $51 = instantiate(`(module (func (f64.const 0x0123456789ABCDEFabcdef.p019) drop))`);

// ./test/core/const.wast:170
let $52 = instantiate(`(module (func (f64.const 0x0123456789ABCDEFabcdef.p+019) drop))`);

// ./test/core/const.wast:171
let $53 = instantiate(`(module (func (f64.const 0x0123456789ABCDEFabcdef.p-019) drop))`);

// ./test/core/const.wast:172
let $54 = instantiate(`(module (func (f64.const 0x0123456789ABCDEFabcdef.0123456789ABCDEFabcdef) drop))`);

// ./test/core/const.wast:173
let $55 = instantiate(`(module (func (f64.const 0x0123456789ABCDEFabcdef.0123456789ABCDEFabcdefp019) drop))`);

// ./test/core/const.wast:174
let $56 = instantiate(`(module (func (f64.const 0x0123456789ABCDEFabcdef.0123456789ABCDEFabcdefp+019) drop))`);

// ./test/core/const.wast:175
let $57 = instantiate(`(module (func (f64.const 0x0123456789ABCDEFabcdef.0123456789ABCDEFabcdefp-019) drop))`);

// ./test/core/const.wast:176
let $58 = instantiate(`(module (func (f64.const 0x0_1_2_3_4_5_6_7_8_9_A_B_C_D_E_F_a_b_c_d_e_f) drop))`);

// ./test/core/const.wast:177
let $59 = instantiate(`(module (func (f64.const 0x0_1_2_3_4_5_6_7_8_9_A_B_C_D_E_F_a_b_c_d_e_f.) drop))`);

// ./test/core/const.wast:178
let $60 = instantiate(`(module (func (f64.const 0x0_1_2_3_4_5_6_7_8_9_A_B_C_D_E_F_a_b_c_d_e_f.0_1_2_3_4_5_6_7_8_9_A_B_C_D_E_F_a_b_c_d_e_f) drop))`);

// ./test/core/const.wast:179
let $61 = instantiate(`(module (func (f64.const 0x0_1_2_3_4_5_6_7_8_9_A_B_C_D_E_F_a_b_c_d_e_fp0_1_9) drop))`);

// ./test/core/const.wast:180
let $62 = instantiate(`(module (func (f64.const 0x0_1_2_3_4_5_6_7_8_9_A_B_C_D_E_F_a_b_c_d_e_f.p0_1_9) drop))`);

// ./test/core/const.wast:181
let $63 = instantiate(`(module (func (f64.const 0x0_1_2_3_4_5_6_7_8_9_A_B_C_D_E_F_a_b_c_d_e_f.0_1_2_3_4_5_6_7_8_9_A_B_C_D_E_F_a_b_c_d_e_fp0_1_9) drop))`);

// ./test/core/const.wast:184
assert_malformed(() => instantiate(`(func (f64.const) drop) `), `unexpected token`);

// ./test/core/const.wast:188
assert_malformed(() => instantiate(`(func (f64.const .0) drop) `), `unknown operator`);

// ./test/core/const.wast:192
assert_malformed(() => instantiate(`(func (f64.const .0e0) drop) `), `unknown operator`);

// ./test/core/const.wast:196
assert_malformed(() => instantiate(`(func (f64.const 0e) drop) `), `unknown operator`);

// ./test/core/const.wast:200
assert_malformed(() => instantiate(`(func (f64.const 0e+) drop) `), `unknown operator`);

// ./test/core/const.wast:204
assert_malformed(() => instantiate(`(func (f64.const 0.0e) drop) `), `unknown operator`);

// ./test/core/const.wast:208
assert_malformed(() => instantiate(`(func (f64.const 0.0e-) drop) `), `unknown operator`);

// ./test/core/const.wast:212
assert_malformed(() => instantiate(`(func (f64.const 0x) drop) `), `unknown operator`);

// ./test/core/const.wast:216
assert_malformed(() => instantiate(`(func (f64.const 1x) drop) `), `unknown operator`);

// ./test/core/const.wast:220
assert_malformed(() => instantiate(`(func (f64.const 0xg) drop) `), `unknown operator`);

// ./test/core/const.wast:224
assert_malformed(() => instantiate(`(func (f64.const 0x.) drop) `), `unknown operator`);

// ./test/core/const.wast:228
assert_malformed(() => instantiate(`(func (f64.const 0x0.g) drop) `), `unknown operator`);

// ./test/core/const.wast:232
assert_malformed(() => instantiate(`(func (f64.const 0x0p) drop) `), `unknown operator`);

// ./test/core/const.wast:236
assert_malformed(() => instantiate(`(func (f64.const 0x0p+) drop) `), `unknown operator`);

// ./test/core/const.wast:240
assert_malformed(() => instantiate(`(func (f64.const 0x0p-) drop) `), `unknown operator`);

// ./test/core/const.wast:244
assert_malformed(() => instantiate(`(func (f64.const 0x0.0p) drop) `), `unknown operator`);

// ./test/core/const.wast:248
assert_malformed(
  () => instantiate(`(func (f64.const 0x0.0p+) drop) `),
  `unknown operator`,
);

// ./test/core/const.wast:252
assert_malformed(
  () => instantiate(`(func (f64.const 0x0.0p-) drop) `),
  `unknown operator`,
);

// ./test/core/const.wast:256
assert_malformed(() => instantiate(`(func (f64.const 0x0pA) drop) `), `unknown operator`);

// ./test/core/const.wast:264
let $64 = instantiate(`(module (func (i32.const 0xffffffff) drop))`);

// ./test/core/const.wast:265
let $65 = instantiate(`(module (func (i32.const -0x80000000) drop))`);

// ./test/core/const.wast:266
assert_malformed(
  () => instantiate(`(func (i32.const 0x100000000) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:270
assert_malformed(
  () => instantiate(`(func (i32.const -0x80000001) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:275
let $66 = instantiate(`(module (func (i32.const 4294967295) drop))`);

// ./test/core/const.wast:276
let $67 = instantiate(`(module (func (i32.const -2147483648) drop))`);

// ./test/core/const.wast:277
assert_malformed(
  () => instantiate(`(func (i32.const 4294967296) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:281
assert_malformed(
  () => instantiate(`(func (i32.const -2147483649) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:286
let $68 = instantiate(`(module (func (i64.const 0xffffffffffffffff) drop))`);

// ./test/core/const.wast:287
let $69 = instantiate(`(module (func (i64.const -0x8000000000000000) drop))`);

// ./test/core/const.wast:288
assert_malformed(
  () => instantiate(`(func (i64.const 0x10000000000000000) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:292
assert_malformed(
  () => instantiate(`(func (i64.const -0x8000000000000001) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:297
let $70 = instantiate(`(module (func (i64.const 18446744073709551615) drop))`);

// ./test/core/const.wast:298
let $71 = instantiate(`(module (func (i64.const -9223372036854775808) drop))`);

// ./test/core/const.wast:299
assert_malformed(
  () => instantiate(`(func (i64.const 18446744073709551616) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:303
assert_malformed(
  () => instantiate(`(func (i64.const -9223372036854775809) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:308
let $72 = instantiate(`(module (func (f32.const 0x1p127) drop))`);

// ./test/core/const.wast:309
let $73 = instantiate(`(module (func (f32.const -0x1p127) drop))`);

// ./test/core/const.wast:310
let $74 = instantiate(`(module (func (f32.const 0x1.fffffep127) drop))`);

// ./test/core/const.wast:311
let $75 = instantiate(`(module (func (f32.const -0x1.fffffep127) drop))`);

// ./test/core/const.wast:312
let $76 = instantiate(`(module (func (f32.const 0x1.fffffe7p127) drop))`);

// ./test/core/const.wast:313
let $77 = instantiate(`(module (func (f32.const -0x1.fffffe7p127) drop))`);

// ./test/core/const.wast:314
let $78 = instantiate(`(module (func (f32.const 0x1.fffffefffffff8000000p127) drop))`);

// ./test/core/const.wast:315
let $79 = instantiate(`(module (func (f32.const -0x1.fffffefffffff8000000p127) drop))`);

// ./test/core/const.wast:316
let $80 = instantiate(`(module (func (f32.const 0x1.fffffefffffffffffffp127) drop))`);

// ./test/core/const.wast:317
let $81 = instantiate(`(module (func (f32.const -0x1.fffffefffffffffffffp127) drop))`);

// ./test/core/const.wast:318
assert_malformed(
  () => instantiate(`(func (f32.const 0x1p128) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:322
assert_malformed(
  () => instantiate(`(func (f32.const -0x1p128) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:326
assert_malformed(
  () => instantiate(`(func (f32.const 0x1.ffffffp127) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:330
assert_malformed(
  () => instantiate(`(func (f32.const -0x1.ffffffp127) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:335
let $82 = instantiate(`(module (func (f32.const 1e38) drop))`);

// ./test/core/const.wast:336
let $83 = instantiate(`(module (func (f32.const -1e38) drop))`);

// ./test/core/const.wast:337
assert_malformed(
  () => instantiate(`(func (f32.const 1e39) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:341
assert_malformed(
  () => instantiate(`(func (f32.const -1e39) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:346
let $84 = instantiate(`(module (func (f32.const 340282356779733623858607532500980858880) drop))`);

// ./test/core/const.wast:347
let $85 = instantiate(`(module (func (f32.const -340282356779733623858607532500980858880) drop))`);

// ./test/core/const.wast:348
assert_malformed(
  () => instantiate(`(func (f32.const 340282356779733661637539395458142568448) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:352
assert_malformed(
  () => instantiate(`(func (f32.const -340282356779733661637539395458142568448) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:357
let $86 = instantiate(`(module (func (f64.const 0x1p1023) drop))`);

// ./test/core/const.wast:358
let $87 = instantiate(`(module (func (f64.const -0x1p1023) drop))`);

// ./test/core/const.wast:359
let $88 = instantiate(`(module (func (f64.const 0x1.fffffffffffffp1023) drop))`);

// ./test/core/const.wast:360
let $89 = instantiate(`(module (func (f64.const -0x1.fffffffffffffp1023) drop))`);

// ./test/core/const.wast:361
let $90 = instantiate(`(module (func (f64.const 0x1.fffffffffffff7p1023) drop))`);

// ./test/core/const.wast:362
let $91 = instantiate(`(module (func (f64.const -0x1.fffffffffffff7p1023) drop))`);

// ./test/core/const.wast:363
let $92 = instantiate(`(module (func (f64.const 0x1.fffffffffffff7ffffffp1023) drop))`);

// ./test/core/const.wast:364
let $93 = instantiate(`(module (func (f64.const -0x1.fffffffffffff7ffffffp1023) drop))`);

// ./test/core/const.wast:365
assert_malformed(
  () => instantiate(`(func (f64.const 0x1p1024) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:369
assert_malformed(
  () => instantiate(`(func (f64.const -0x1p1024) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:373
assert_malformed(
  () => instantiate(`(func (f64.const 0x1.fffffffffffff8p1023) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:377
assert_malformed(
  () => instantiate(`(func (f64.const -0x1.fffffffffffff8p1023) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:382
let $94 = instantiate(`(module (func (f64.const 1e308) drop))`);

// ./test/core/const.wast:383
let $95 = instantiate(`(module (func (f64.const -1e308) drop))`);

// ./test/core/const.wast:384
assert_malformed(
  () => instantiate(`(func (f64.const 1e309) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:388
assert_malformed(
  () => instantiate(`(func (f64.const -1e309) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:393
let $96 = instantiate(`(module (func (f64.const 179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368) drop))`);

// ./test/core/const.wast:394
let $97 = instantiate(`(module (func (f64.const -179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368) drop))`);

// ./test/core/const.wast:395
assert_malformed(
  () => instantiate(`(func (f64.const 269653970229347356221791135597556535197105851288767494898376215204735891170042808140884337949150317257310688430271573696351481990334196274152701320055306275479074865864826923114368235135583993416113802762682700913456874855354834422248712838998185022412196739306217084753107265771378949821875606039276187287552) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:399
assert_malformed(
  () => instantiate(`(func (f64.const -269653970229347356221791135597556535197105851288767494898376215204735891170042808140884337949150317257310688430271573696351481990334196274152701320055306275479074865864826923114368235135583993416113802762682700913456874855354834422248712838998185022412196739306217084753107265771378949821875606039276187287552) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:404
let $98 = instantiate(`(module (func (f32.const nan:0x1) drop))`);

// ./test/core/const.wast:405
let $99 = instantiate(`(module (func (f64.const nan:0x1) drop))`);

// ./test/core/const.wast:406
let $100 = instantiate(`(module (func (f32.const nan:0x7f_ffff) drop))`);

// ./test/core/const.wast:407
let $101 = instantiate(`(module (func (f64.const nan:0xf_ffff_ffff_ffff) drop))`);

// ./test/core/const.wast:409
assert_malformed(() => instantiate(`(func (f32.const nan:1) drop) `), `unknown operator`);

// ./test/core/const.wast:413
assert_malformed(() => instantiate(`(func (f64.const nan:1) drop) `), `unknown operator`);

// ./test/core/const.wast:418
assert_malformed(
  () => instantiate(`(func (f32.const nan:0x0) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:422
assert_malformed(
  () => instantiate(`(func (f64.const nan:0x0) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:427
assert_malformed(
  () => instantiate(`(func (f32.const nan:0x80_0000) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:431
assert_malformed(
  () => instantiate(`(func (f64.const nan:0x10_0000_0000_0000) drop) `),
  `constant out of range`,
);

// ./test/core/const.wast:440
let $102 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.00000100000000000p-50)))`);

// ./test/core/const.wast:441
assert_return(() => invoke($102, `f`, []), [value("f32", 0.0000000000000008881784)]);

// ./test/core/const.wast:442
let $103 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.00000100000000000p-50)))`);

// ./test/core/const.wast:443
assert_return(() => invoke($103, `f`, []), [value("f32", -0.0000000000000008881784)]);

// ./test/core/const.wast:444
let $104 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.00000100000000001p-50)))`);

// ./test/core/const.wast:445
assert_return(() => invoke($104, `f`, []), [value("f32", 0.0000000000000008881785)]);

// ./test/core/const.wast:446
let $105 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.00000100000000001p-50)))`);

// ./test/core/const.wast:447
assert_return(() => invoke($105, `f`, []), [value("f32", -0.0000000000000008881785)]);

// ./test/core/const.wast:448
let $106 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.000001fffffffffffp-50)))`);

// ./test/core/const.wast:449
assert_return(() => invoke($106, `f`, []), [value("f32", 0.0000000000000008881785)]);

// ./test/core/const.wast:450
let $107 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.000001fffffffffffp-50)))`);

// ./test/core/const.wast:451
assert_return(() => invoke($107, `f`, []), [value("f32", -0.0000000000000008881785)]);

// ./test/core/const.wast:452
let $108 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.00000200000000000p-50)))`);

// ./test/core/const.wast:453
assert_return(() => invoke($108, `f`, []), [value("f32", 0.0000000000000008881785)]);

// ./test/core/const.wast:454
let $109 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.00000200000000000p-50)))`);

// ./test/core/const.wast:455
assert_return(() => invoke($109, `f`, []), [value("f32", -0.0000000000000008881785)]);

// ./test/core/const.wast:456
let $110 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.00000200000000001p-50)))`);

// ./test/core/const.wast:457
assert_return(() => invoke($110, `f`, []), [value("f32", 0.0000000000000008881785)]);

// ./test/core/const.wast:458
let $111 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.00000200000000001p-50)))`);

// ./test/core/const.wast:459
assert_return(() => invoke($111, `f`, []), [value("f32", -0.0000000000000008881785)]);

// ./test/core/const.wast:460
let $112 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.000002fffffffffffp-50)))`);

// ./test/core/const.wast:461
assert_return(() => invoke($112, `f`, []), [value("f32", 0.0000000000000008881785)]);

// ./test/core/const.wast:462
let $113 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.000002fffffffffffp-50)))`);

// ./test/core/const.wast:463
assert_return(() => invoke($113, `f`, []), [value("f32", -0.0000000000000008881785)]);

// ./test/core/const.wast:464
let $114 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.00000300000000000p-50)))`);

// ./test/core/const.wast:465
assert_return(() => invoke($114, `f`, []), [value("f32", 0.0000000000000008881786)]);

// ./test/core/const.wast:466
let $115 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.00000300000000000p-50)))`);

// ./test/core/const.wast:467
assert_return(() => invoke($115, `f`, []), [value("f32", -0.0000000000000008881786)]);

// ./test/core/const.wast:468
let $116 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.00000300000000001p-50)))`);

// ./test/core/const.wast:469
assert_return(() => invoke($116, `f`, []), [value("f32", 0.0000000000000008881786)]);

// ./test/core/const.wast:470
let $117 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.00000300000000001p-50)))`);

// ./test/core/const.wast:471
assert_return(() => invoke($117, `f`, []), [value("f32", -0.0000000000000008881786)]);

// ./test/core/const.wast:472
let $118 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.000003fffffffffffp-50)))`);

// ./test/core/const.wast:473
assert_return(() => invoke($118, `f`, []), [value("f32", 0.0000000000000008881786)]);

// ./test/core/const.wast:474
let $119 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.000003fffffffffffp-50)))`);

// ./test/core/const.wast:475
assert_return(() => invoke($119, `f`, []), [value("f32", -0.0000000000000008881786)]);

// ./test/core/const.wast:476
let $120 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.00000400000000000p-50)))`);

// ./test/core/const.wast:477
assert_return(() => invoke($120, `f`, []), [value("f32", 0.0000000000000008881786)]);

// ./test/core/const.wast:478
let $121 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.00000400000000000p-50)))`);

// ./test/core/const.wast:479
assert_return(() => invoke($121, `f`, []), [value("f32", -0.0000000000000008881786)]);

// ./test/core/const.wast:480
let $122 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.00000400000000001p-50)))`);

// ./test/core/const.wast:481
assert_return(() => invoke($122, `f`, []), [value("f32", 0.0000000000000008881786)]);

// ./test/core/const.wast:482
let $123 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.00000400000000001p-50)))`);

// ./test/core/const.wast:483
assert_return(() => invoke($123, `f`, []), [value("f32", -0.0000000000000008881786)]);

// ./test/core/const.wast:484
let $124 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.000004fffffffffffp-50)))`);

// ./test/core/const.wast:485
assert_return(() => invoke($124, `f`, []), [value("f32", 0.0000000000000008881786)]);

// ./test/core/const.wast:486
let $125 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.000004fffffffffffp-50)))`);

// ./test/core/const.wast:487
assert_return(() => invoke($125, `f`, []), [value("f32", -0.0000000000000008881786)]);

// ./test/core/const.wast:488
let $126 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.00000500000000000p-50)))`);

// ./test/core/const.wast:489
assert_return(() => invoke($126, `f`, []), [value("f32", 0.0000000000000008881786)]);

// ./test/core/const.wast:490
let $127 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.00000500000000000p-50)))`);

// ./test/core/const.wast:491
assert_return(() => invoke($127, `f`, []), [value("f32", -0.0000000000000008881786)]);

// ./test/core/const.wast:492
let $128 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.00000500000000001p-50)))`);

// ./test/core/const.wast:493
assert_return(() => invoke($128, `f`, []), [value("f32", 0.0000000000000008881787)]);

// ./test/core/const.wast:494
let $129 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.00000500000000001p-50)))`);

// ./test/core/const.wast:495
assert_return(() => invoke($129, `f`, []), [value("f32", -0.0000000000000008881787)]);

// ./test/core/const.wast:497
let $130 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x4000.004000000p-64)))`);

// ./test/core/const.wast:498
assert_return(() => invoke($130, `f`, []), [value("f32", 0.0000000000000008881784)]);

// ./test/core/const.wast:499
let $131 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x4000.004000000p-64)))`);

// ./test/core/const.wast:500
assert_return(() => invoke($131, `f`, []), [value("f32", -0.0000000000000008881784)]);

// ./test/core/const.wast:501
let $132 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x4000.004000001p-64)))`);

// ./test/core/const.wast:502
assert_return(() => invoke($132, `f`, []), [value("f32", 0.0000000000000008881785)]);

// ./test/core/const.wast:503
let $133 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x4000.004000001p-64)))`);

// ./test/core/const.wast:504
assert_return(() => invoke($133, `f`, []), [value("f32", -0.0000000000000008881785)]);

// ./test/core/const.wast:505
let $134 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x4000.007ffffffp-64)))`);

// ./test/core/const.wast:506
assert_return(() => invoke($134, `f`, []), [value("f32", 0.0000000000000008881785)]);

// ./test/core/const.wast:507
let $135 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x4000.007ffffffp-64)))`);

// ./test/core/const.wast:508
assert_return(() => invoke($135, `f`, []), [value("f32", -0.0000000000000008881785)]);

// ./test/core/const.wast:509
let $136 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x4000.008000000p-64)))`);

// ./test/core/const.wast:510
assert_return(() => invoke($136, `f`, []), [value("f32", 0.0000000000000008881785)]);

// ./test/core/const.wast:511
let $137 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x4000.008000000p-64)))`);

// ./test/core/const.wast:512
assert_return(() => invoke($137, `f`, []), [value("f32", -0.0000000000000008881785)]);

// ./test/core/const.wast:513
let $138 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x4000.008000001p-64)))`);

// ./test/core/const.wast:514
assert_return(() => invoke($138, `f`, []), [value("f32", 0.0000000000000008881785)]);

// ./test/core/const.wast:515
let $139 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x4000.008000001p-64)))`);

// ./test/core/const.wast:516
assert_return(() => invoke($139, `f`, []), [value("f32", -0.0000000000000008881785)]);

// ./test/core/const.wast:517
let $140 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x4000.00bffffffp-64)))`);

// ./test/core/const.wast:518
assert_return(() => invoke($140, `f`, []), [value("f32", 0.0000000000000008881785)]);

// ./test/core/const.wast:519
let $141 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x4000.00bffffffp-64)))`);

// ./test/core/const.wast:520
assert_return(() => invoke($141, `f`, []), [value("f32", -0.0000000000000008881785)]);

// ./test/core/const.wast:521
let $142 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x4000.00c000000p-64)))`);

// ./test/core/const.wast:522
assert_return(() => invoke($142, `f`, []), [value("f32", 0.0000000000000008881786)]);

// ./test/core/const.wast:523
let $143 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x4000.00c000000p-64)))`);

// ./test/core/const.wast:524
assert_return(() => invoke($143, `f`, []), [value("f32", -0.0000000000000008881786)]);

// ./test/core/const.wast:525
let $144 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x4000.00c000001p-64)))`);

// ./test/core/const.wast:526
assert_return(() => invoke($144, `f`, []), [value("f32", 0.0000000000000008881786)]);

// ./test/core/const.wast:527
let $145 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x4000.00c000001p-64)))`);

// ./test/core/const.wast:528
assert_return(() => invoke($145, `f`, []), [value("f32", -0.0000000000000008881786)]);

// ./test/core/const.wast:529
let $146 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x4000.00fffffffp-64)))`);

// ./test/core/const.wast:530
assert_return(() => invoke($146, `f`, []), [value("f32", 0.0000000000000008881786)]);

// ./test/core/const.wast:531
let $147 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x4000.00fffffffp-64)))`);

// ./test/core/const.wast:532
assert_return(() => invoke($147, `f`, []), [value("f32", -0.0000000000000008881786)]);

// ./test/core/const.wast:533
let $148 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x4000.010000001p-64)))`);

// ./test/core/const.wast:534
assert_return(() => invoke($148, `f`, []), [value("f32", 0.0000000000000008881786)]);

// ./test/core/const.wast:535
let $149 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x4000.010000001p-64)))`);

// ./test/core/const.wast:536
assert_return(() => invoke($149, `f`, []), [value("f32", -0.0000000000000008881786)]);

// ./test/core/const.wast:537
let $150 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x4000.013ffffffp-64)))`);

// ./test/core/const.wast:538
assert_return(() => invoke($150, `f`, []), [value("f32", 0.0000000000000008881786)]);

// ./test/core/const.wast:539
let $151 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x4000.013ffffffp-64)))`);

// ./test/core/const.wast:540
assert_return(() => invoke($151, `f`, []), [value("f32", -0.0000000000000008881786)]);

// ./test/core/const.wast:541
let $152 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x4000.014000001p-64)))`);

// ./test/core/const.wast:542
assert_return(() => invoke($152, `f`, []), [value("f32", 0.0000000000000008881787)]);

// ./test/core/const.wast:543
let $153 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x4000.014000001p-64)))`);

// ./test/core/const.wast:544
assert_return(() => invoke($153, `f`, []), [value("f32", -0.0000000000000008881787)]);

// ./test/core/const.wast:546
let $154 = instantiate(`(module (func (export "f") (result f32) (f32.const +8.8817847263968443573e-16)))`);

// ./test/core/const.wast:547
assert_return(() => invoke($154, `f`, []), [value("f32", 0.0000000000000008881784)]);

// ./test/core/const.wast:548
let $155 = instantiate(`(module (func (export "f") (result f32) (f32.const -8.8817847263968443573e-16)))`);

// ./test/core/const.wast:549
assert_return(() => invoke($155, `f`, []), [value("f32", -0.0000000000000008881784)]);

// ./test/core/const.wast:550
let $156 = instantiate(`(module (func (export "f") (result f32) (f32.const +8.8817847263968443574e-16)))`);

// ./test/core/const.wast:551
assert_return(() => invoke($156, `f`, []), [value("f32", 0.0000000000000008881785)]);

// ./test/core/const.wast:552
let $157 = instantiate(`(module (func (export "f") (result f32) (f32.const -8.8817847263968443574e-16)))`);

// ./test/core/const.wast:553
assert_return(() => invoke($157, `f`, []), [value("f32", -0.0000000000000008881785)]);

// ./test/core/const.wast:554
let $158 = instantiate(`(module (func (export "f") (result f32) (f32.const +8.8817857851880284252e-16)))`);

// ./test/core/const.wast:555
assert_return(() => invoke($158, `f`, []), [value("f32", 0.0000000000000008881785)]);

// ./test/core/const.wast:556
let $159 = instantiate(`(module (func (export "f") (result f32) (f32.const -8.8817857851880284252e-16)))`);

// ./test/core/const.wast:557
assert_return(() => invoke($159, `f`, []), [value("f32", -0.0000000000000008881785)]);

// ./test/core/const.wast:558
let $160 = instantiate(`(module (func (export "f") (result f32) (f32.const +8.8817857851880284253e-16)))`);

// ./test/core/const.wast:559
assert_return(() => invoke($160, `f`, []), [value("f32", 0.0000000000000008881786)]);

// ./test/core/const.wast:560
let $161 = instantiate(`(module (func (export "f") (result f32) (f32.const -8.8817857851880284253e-16)))`);

// ./test/core/const.wast:561
assert_return(() => invoke($161, `f`, []), [value("f32", -0.0000000000000008881786)]);

// ./test/core/const.wast:564
let $162 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.00000100000000000p+50)))`);

// ./test/core/const.wast:565
assert_return(() => invoke($162, `f`, []), [value("f32", 1125899900000000)]);

// ./test/core/const.wast:566
let $163 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.00000100000000000p+50)))`);

// ./test/core/const.wast:567
assert_return(() => invoke($163, `f`, []), [value("f32", -1125899900000000)]);

// ./test/core/const.wast:568
let $164 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.00000100000000001p+50)))`);

// ./test/core/const.wast:569
assert_return(() => invoke($164, `f`, []), [value("f32", 1125900000000000)]);

// ./test/core/const.wast:570
let $165 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.00000100000000001p+50)))`);

// ./test/core/const.wast:571
assert_return(() => invoke($165, `f`, []), [value("f32", -1125900000000000)]);

// ./test/core/const.wast:572
let $166 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.000001fffffffffffp+50)))`);

// ./test/core/const.wast:573
assert_return(() => invoke($166, `f`, []), [value("f32", 1125900000000000)]);

// ./test/core/const.wast:574
let $167 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.000001fffffffffffp+50)))`);

// ./test/core/const.wast:575
assert_return(() => invoke($167, `f`, []), [value("f32", -1125900000000000)]);

// ./test/core/const.wast:576
let $168 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.00000200000000000p+50)))`);

// ./test/core/const.wast:577
assert_return(() => invoke($168, `f`, []), [value("f32", 1125900000000000)]);

// ./test/core/const.wast:578
let $169 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.00000200000000000p+50)))`);

// ./test/core/const.wast:579
assert_return(() => invoke($169, `f`, []), [value("f32", -1125900000000000)]);

// ./test/core/const.wast:580
let $170 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.00000200000000001p+50)))`);

// ./test/core/const.wast:581
assert_return(() => invoke($170, `f`, []), [value("f32", 1125900000000000)]);

// ./test/core/const.wast:582
let $171 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.00000200000000001p+50)))`);

// ./test/core/const.wast:583
assert_return(() => invoke($171, `f`, []), [value("f32", -1125900000000000)]);

// ./test/core/const.wast:584
let $172 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.000002fffffffffffp+50)))`);

// ./test/core/const.wast:585
assert_return(() => invoke($172, `f`, []), [value("f32", 1125900000000000)]);

// ./test/core/const.wast:586
let $173 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.000002fffffffffffp+50)))`);

// ./test/core/const.wast:587
assert_return(() => invoke($173, `f`, []), [value("f32", -1125900000000000)]);

// ./test/core/const.wast:588
let $174 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.00000300000000000p+50)))`);

// ./test/core/const.wast:589
assert_return(() => invoke($174, `f`, []), [value("f32", 1125900200000000)]);

// ./test/core/const.wast:590
let $175 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.00000300000000000p+50)))`);

// ./test/core/const.wast:591
assert_return(() => invoke($175, `f`, []), [value("f32", -1125900200000000)]);

// ./test/core/const.wast:592
let $176 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.00000300000000001p+50)))`);

// ./test/core/const.wast:593
assert_return(() => invoke($176, `f`, []), [value("f32", 1125900200000000)]);

// ./test/core/const.wast:594
let $177 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.00000300000000001p+50)))`);

// ./test/core/const.wast:595
assert_return(() => invoke($177, `f`, []), [value("f32", -1125900200000000)]);

// ./test/core/const.wast:596
let $178 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.000003fffffffffffp+50)))`);

// ./test/core/const.wast:597
assert_return(() => invoke($178, `f`, []), [value("f32", 1125900200000000)]);

// ./test/core/const.wast:598
let $179 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.000003fffffffffffp+50)))`);

// ./test/core/const.wast:599
assert_return(() => invoke($179, `f`, []), [value("f32", -1125900200000000)]);

// ./test/core/const.wast:600
let $180 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.00000400000000000p+50)))`);

// ./test/core/const.wast:601
assert_return(() => invoke($180, `f`, []), [value("f32", 1125900200000000)]);

// ./test/core/const.wast:602
let $181 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.00000400000000000p+50)))`);

// ./test/core/const.wast:603
assert_return(() => invoke($181, `f`, []), [value("f32", -1125900200000000)]);

// ./test/core/const.wast:604
let $182 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.00000400000000001p+50)))`);

// ./test/core/const.wast:605
assert_return(() => invoke($182, `f`, []), [value("f32", 1125900200000000)]);

// ./test/core/const.wast:606
let $183 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.00000400000000001p+50)))`);

// ./test/core/const.wast:607
assert_return(() => invoke($183, `f`, []), [value("f32", -1125900200000000)]);

// ./test/core/const.wast:608
let $184 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.000004fffffffffffp+50)))`);

// ./test/core/const.wast:609
assert_return(() => invoke($184, `f`, []), [value("f32", 1125900200000000)]);

// ./test/core/const.wast:610
let $185 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.000004fffffffffffp+50)))`);

// ./test/core/const.wast:611
assert_return(() => invoke($185, `f`, []), [value("f32", -1125900200000000)]);

// ./test/core/const.wast:612
let $186 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.00000500000000000p+50)))`);

// ./test/core/const.wast:613
assert_return(() => invoke($186, `f`, []), [value("f32", 1125900200000000)]);

// ./test/core/const.wast:614
let $187 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.00000500000000000p+50)))`);

// ./test/core/const.wast:615
assert_return(() => invoke($187, `f`, []), [value("f32", -1125900200000000)]);

// ./test/core/const.wast:616
let $188 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.00000500000000001p+50)))`);

// ./test/core/const.wast:617
assert_return(() => invoke($188, `f`, []), [value("f32", 1125900300000000)]);

// ./test/core/const.wast:618
let $189 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.00000500000000001p+50)))`);

// ./test/core/const.wast:619
assert_return(() => invoke($189, `f`, []), [value("f32", -1125900300000000)]);

// ./test/core/const.wast:621
let $190 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x4000004000000)))`);

// ./test/core/const.wast:622
assert_return(() => invoke($190, `f`, []), [value("f32", 1125899900000000)]);

// ./test/core/const.wast:623
let $191 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x4000004000000)))`);

// ./test/core/const.wast:624
assert_return(() => invoke($191, `f`, []), [value("f32", -1125899900000000)]);

// ./test/core/const.wast:625
let $192 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x4000004000001)))`);

// ./test/core/const.wast:626
assert_return(() => invoke($192, `f`, []), [value("f32", 1125900000000000)]);

// ./test/core/const.wast:627
let $193 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x4000004000001)))`);

// ./test/core/const.wast:628
assert_return(() => invoke($193, `f`, []), [value("f32", -1125900000000000)]);

// ./test/core/const.wast:629
let $194 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x4000007ffffff)))`);

// ./test/core/const.wast:630
assert_return(() => invoke($194, `f`, []), [value("f32", 1125900000000000)]);

// ./test/core/const.wast:631
let $195 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x4000007ffffff)))`);

// ./test/core/const.wast:632
assert_return(() => invoke($195, `f`, []), [value("f32", -1125900000000000)]);

// ./test/core/const.wast:633
let $196 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x4000008000000)))`);

// ./test/core/const.wast:634
assert_return(() => invoke($196, `f`, []), [value("f32", 1125900000000000)]);

// ./test/core/const.wast:635
let $197 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x4000008000000)))`);

// ./test/core/const.wast:636
assert_return(() => invoke($197, `f`, []), [value("f32", -1125900000000000)]);

// ./test/core/const.wast:637
let $198 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x4000008000001)))`);

// ./test/core/const.wast:638
assert_return(() => invoke($198, `f`, []), [value("f32", 1125900000000000)]);

// ./test/core/const.wast:639
let $199 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x4000008000001)))`);

// ./test/core/const.wast:640
assert_return(() => invoke($199, `f`, []), [value("f32", -1125900000000000)]);

// ./test/core/const.wast:641
let $200 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x400000bffffff)))`);

// ./test/core/const.wast:642
assert_return(() => invoke($200, `f`, []), [value("f32", 1125900000000000)]);

// ./test/core/const.wast:643
let $201 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x400000bffffff)))`);

// ./test/core/const.wast:644
assert_return(() => invoke($201, `f`, []), [value("f32", -1125900000000000)]);

// ./test/core/const.wast:645
let $202 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x400000c000000)))`);

// ./test/core/const.wast:646
assert_return(() => invoke($202, `f`, []), [value("f32", 1125900200000000)]);

// ./test/core/const.wast:647
let $203 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x400000c000000)))`);

// ./test/core/const.wast:648
assert_return(() => invoke($203, `f`, []), [value("f32", -1125900200000000)]);

// ./test/core/const.wast:650
let $204 = instantiate(`(module (func (export "f") (result f32) (f32.const +1125899973951488)))`);

// ./test/core/const.wast:651
assert_return(() => invoke($204, `f`, []), [value("f32", 1125899900000000)]);

// ./test/core/const.wast:652
let $205 = instantiate(`(module (func (export "f") (result f32) (f32.const -1125899973951488)))`);

// ./test/core/const.wast:653
assert_return(() => invoke($205, `f`, []), [value("f32", -1125899900000000)]);

// ./test/core/const.wast:654
let $206 = instantiate(`(module (func (export "f") (result f32) (f32.const +1125899973951489)))`);

// ./test/core/const.wast:655
assert_return(() => invoke($206, `f`, []), [value("f32", 1125900000000000)]);

// ./test/core/const.wast:656
let $207 = instantiate(`(module (func (export "f") (result f32) (f32.const -1125899973951489)))`);

// ./test/core/const.wast:657
assert_return(() => invoke($207, `f`, []), [value("f32", -1125900000000000)]);

// ./test/core/const.wast:658
let $208 = instantiate(`(module (func (export "f") (result f32) (f32.const +1125900108169215)))`);

// ./test/core/const.wast:659
assert_return(() => invoke($208, `f`, []), [value("f32", 1125900000000000)]);

// ./test/core/const.wast:660
let $209 = instantiate(`(module (func (export "f") (result f32) (f32.const -1125900108169215)))`);

// ./test/core/const.wast:661
assert_return(() => invoke($209, `f`, []), [value("f32", -1125900000000000)]);

// ./test/core/const.wast:662
let $210 = instantiate(`(module (func (export "f") (result f32) (f32.const +1125900108169216)))`);

// ./test/core/const.wast:663
assert_return(() => invoke($210, `f`, []), [value("f32", 1125900200000000)]);

// ./test/core/const.wast:664
let $211 = instantiate(`(module (func (export "f") (result f32) (f32.const -1125900108169216)))`);

// ./test/core/const.wast:665
assert_return(() => invoke($211, `f`, []), [value("f32", -1125900200000000)]);

// ./test/core/const.wast:668
let $212 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x0.00000100000000000p-126)))`);

// ./test/core/const.wast:669
assert_return(() => invoke($212, `f`, []), [value("f32", 0)]);

// ./test/core/const.wast:670
let $213 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x0.00000100000000000p-126)))`);

// ./test/core/const.wast:671
assert_return(() => invoke($213, `f`, []), [value("f32", -0)]);

// ./test/core/const.wast:672
let $214 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x0.00000100000000001p-126)))`);

// ./test/core/const.wast:673
assert_return(
  () => invoke($214, `f`, []),
  [value("f32", 0.000000000000000000000000000000000000000000001)],
);

// ./test/core/const.wast:674
let $215 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x0.00000100000000001p-126)))`);

// ./test/core/const.wast:675
assert_return(
  () => invoke($215, `f`, []),
  [value("f32", -0.000000000000000000000000000000000000000000001)],
);

// ./test/core/const.wast:676
let $216 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x0.000001fffffffffffp-126)))`);

// ./test/core/const.wast:677
assert_return(
  () => invoke($216, `f`, []),
  [value("f32", 0.000000000000000000000000000000000000000000001)],
);

// ./test/core/const.wast:678
let $217 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x0.000001fffffffffffp-126)))`);

// ./test/core/const.wast:679
assert_return(
  () => invoke($217, `f`, []),
  [value("f32", -0.000000000000000000000000000000000000000000001)],
);

// ./test/core/const.wast:680
let $218 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x0.00000200000000000p-126)))`);

// ./test/core/const.wast:681
assert_return(
  () => invoke($218, `f`, []),
  [value("f32", 0.000000000000000000000000000000000000000000001)],
);

// ./test/core/const.wast:682
let $219 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x0.00000200000000000p-126)))`);

// ./test/core/const.wast:683
assert_return(
  () => invoke($219, `f`, []),
  [value("f32", -0.000000000000000000000000000000000000000000001)],
);

// ./test/core/const.wast:684
let $220 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x0.00000200000000001p-126)))`);

// ./test/core/const.wast:685
assert_return(
  () => invoke($220, `f`, []),
  [value("f32", 0.000000000000000000000000000000000000000000001)],
);

// ./test/core/const.wast:686
let $221 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x0.00000200000000001p-126)))`);

// ./test/core/const.wast:687
assert_return(
  () => invoke($221, `f`, []),
  [value("f32", -0.000000000000000000000000000000000000000000001)],
);

// ./test/core/const.wast:688
let $222 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x0.000002fffffffffffp-126)))`);

// ./test/core/const.wast:689
assert_return(
  () => invoke($222, `f`, []),
  [value("f32", 0.000000000000000000000000000000000000000000001)],
);

// ./test/core/const.wast:690
let $223 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x0.000002fffffffffffp-126)))`);

// ./test/core/const.wast:691
assert_return(
  () => invoke($223, `f`, []),
  [value("f32", -0.000000000000000000000000000000000000000000001)],
);

// ./test/core/const.wast:692
let $224 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x0.00000300000000000p-126)))`);

// ./test/core/const.wast:693
assert_return(
  () => invoke($224, `f`, []),
  [value("f32", 0.000000000000000000000000000000000000000000003)],
);

// ./test/core/const.wast:694
let $225 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x0.00000300000000000p-126)))`);

// ./test/core/const.wast:695
assert_return(
  () => invoke($225, `f`, []),
  [value("f32", -0.000000000000000000000000000000000000000000003)],
);

// ./test/core/const.wast:696
let $226 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x0.00000300000000001p-126)))`);

// ./test/core/const.wast:697
assert_return(
  () => invoke($226, `f`, []),
  [value("f32", 0.000000000000000000000000000000000000000000003)],
);

// ./test/core/const.wast:698
let $227 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x0.00000300000000001p-126)))`);

// ./test/core/const.wast:699
assert_return(
  () => invoke($227, `f`, []),
  [value("f32", -0.000000000000000000000000000000000000000000003)],
);

// ./test/core/const.wast:700
let $228 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x0.000003fffffffffffp-126)))`);

// ./test/core/const.wast:701
assert_return(
  () => invoke($228, `f`, []),
  [value("f32", 0.000000000000000000000000000000000000000000003)],
);

// ./test/core/const.wast:702
let $229 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x0.000003fffffffffffp-126)))`);

// ./test/core/const.wast:703
assert_return(
  () => invoke($229, `f`, []),
  [value("f32", -0.000000000000000000000000000000000000000000003)],
);

// ./test/core/const.wast:704
let $230 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x0.00000400000000000p-126)))`);

// ./test/core/const.wast:705
assert_return(
  () => invoke($230, `f`, []),
  [value("f32", 0.000000000000000000000000000000000000000000003)],
);

// ./test/core/const.wast:706
let $231 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x0.00000400000000000p-126)))`);

// ./test/core/const.wast:707
assert_return(
  () => invoke($231, `f`, []),
  [value("f32", -0.000000000000000000000000000000000000000000003)],
);

// ./test/core/const.wast:708
let $232 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x0.00000400000000001p-126)))`);

// ./test/core/const.wast:709
assert_return(
  () => invoke($232, `f`, []),
  [value("f32", 0.000000000000000000000000000000000000000000003)],
);

// ./test/core/const.wast:710
let $233 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x0.00000400000000001p-126)))`);

// ./test/core/const.wast:711
assert_return(
  () => invoke($233, `f`, []),
  [value("f32", -0.000000000000000000000000000000000000000000003)],
);

// ./test/core/const.wast:712
let $234 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x0.000004fffffffffffp-126)))`);

// ./test/core/const.wast:713
assert_return(
  () => invoke($234, `f`, []),
  [value("f32", 0.000000000000000000000000000000000000000000003)],
);

// ./test/core/const.wast:714
let $235 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x0.000004fffffffffffp-126)))`);

// ./test/core/const.wast:715
assert_return(
  () => invoke($235, `f`, []),
  [value("f32", -0.000000000000000000000000000000000000000000003)],
);

// ./test/core/const.wast:716
let $236 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x0.00000500000000000p-126)))`);

// ./test/core/const.wast:717
assert_return(
  () => invoke($236, `f`, []),
  [value("f32", 0.000000000000000000000000000000000000000000003)],
);

// ./test/core/const.wast:718
let $237 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x0.00000500000000000p-126)))`);

// ./test/core/const.wast:719
assert_return(
  () => invoke($237, `f`, []),
  [value("f32", -0.000000000000000000000000000000000000000000003)],
);

// ./test/core/const.wast:720
let $238 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x0.00000500000000001p-126)))`);

// ./test/core/const.wast:721
assert_return(
  () => invoke($238, `f`, []),
  [value("f32", 0.000000000000000000000000000000000000000000004)],
);

// ./test/core/const.wast:722
let $239 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x0.00000500000000001p-126)))`);

// ./test/core/const.wast:723
assert_return(
  () => invoke($239, `f`, []),
  [value("f32", -0.000000000000000000000000000000000000000000004)],
);

// ./test/core/const.wast:726
let $240 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.fffffe8p127)))`);

// ./test/core/const.wast:727
assert_return(() => invoke($240, `f`, []), [value("f32", 340282350000000000000000000000000000000)]);

// ./test/core/const.wast:728
let $241 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.fffffe8p127)))`);

// ./test/core/const.wast:729
assert_return(() => invoke($241, `f`, []), [value("f32", -340282350000000000000000000000000000000)]);

// ./test/core/const.wast:730
let $242 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.fffffefffffff8p127)))`);

// ./test/core/const.wast:731
assert_return(() => invoke($242, `f`, []), [value("f32", 340282350000000000000000000000000000000)]);

// ./test/core/const.wast:732
let $243 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.fffffefffffff8p127)))`);

// ./test/core/const.wast:733
assert_return(() => invoke($243, `f`, []), [value("f32", -340282350000000000000000000000000000000)]);

// ./test/core/const.wast:734
let $244 = instantiate(`(module (func (export "f") (result f32) (f32.const +0x1.fffffefffffffffffp127)))`);

// ./test/core/const.wast:735
assert_return(() => invoke($244, `f`, []), [value("f32", 340282350000000000000000000000000000000)]);

// ./test/core/const.wast:736
let $245 = instantiate(`(module (func (export "f") (result f32) (f32.const -0x1.fffffefffffffffffp127)))`);

// ./test/core/const.wast:737
assert_return(() => invoke($245, `f`, []), [value("f32", -340282350000000000000000000000000000000)]);

// ./test/core/const.wast:740
let $246 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000080000000000p-600)))`);

// ./test/core/const.wast:741
assert_return(
  () => invoke($246, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102884),
  ],
);

// ./test/core/const.wast:742
let $247 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000080000000000p-600)))`);

// ./test/core/const.wast:743
assert_return(
  () => invoke($247, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102884),
  ],
);

// ./test/core/const.wast:744
let $248 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000080000000001p-600)))`);

// ./test/core/const.wast:745
assert_return(
  () => invoke($248, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/const.wast:746
let $249 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000080000000001p-600)))`);

// ./test/core/const.wast:747
assert_return(
  () => invoke($249, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/const.wast:748
let $250 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.0000000000000fffffffffffp-600)))`);

// ./test/core/const.wast:749
assert_return(
  () => invoke($250, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/const.wast:750
let $251 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.0000000000000fffffffffffp-600)))`);

// ./test/core/const.wast:751
assert_return(
  () => invoke($251, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/const.wast:752
let $252 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000100000000000p-600)))`);

// ./test/core/const.wast:753
assert_return(
  () => invoke($252, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/const.wast:754
let $253 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000100000000000p-600)))`);

// ./test/core/const.wast:755
assert_return(
  () => invoke($253, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/const.wast:756
let $254 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000100000000001p-600)))`);

// ./test/core/const.wast:757
assert_return(
  () => invoke($254, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/const.wast:758
let $255 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000100000000001p-600)))`);

// ./test/core/const.wast:759
assert_return(
  () => invoke($255, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/const.wast:760
let $256 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.00000000000017ffffffffffp-600)))`);

// ./test/core/const.wast:761
assert_return(
  () => invoke($256, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/const.wast:762
let $257 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.00000000000017ffffffffffp-600)))`);

// ./test/core/const.wast:763
assert_return(
  () => invoke($257, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/const.wast:764
let $258 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000180000000000p-600)))`);

// ./test/core/const.wast:765
assert_return(
  () => invoke($258, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/const.wast:766
let $259 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000180000000000p-600)))`);

// ./test/core/const.wast:767
assert_return(
  () => invoke($259, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/const.wast:768
let $260 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000180000000001p-600)))`);

// ./test/core/const.wast:769
assert_return(
  () => invoke($260, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/const.wast:770
let $261 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000180000000001p-600)))`);

// ./test/core/const.wast:771
assert_return(
  () => invoke($261, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/const.wast:772
let $262 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.0000000000001fffffffffffp-600)))`);

// ./test/core/const.wast:773
assert_return(
  () => invoke($262, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/const.wast:774
let $263 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.0000000000001fffffffffffp-600)))`);

// ./test/core/const.wast:775
assert_return(
  () => invoke($263, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/const.wast:776
let $264 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000200000000000p-600)))`);

// ./test/core/const.wast:777
assert_return(
  () => invoke($264, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/const.wast:778
let $265 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000200000000000p-600)))`);

// ./test/core/const.wast:779
assert_return(
  () => invoke($265, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/const.wast:780
let $266 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000200000000001p-600)))`);

// ./test/core/const.wast:781
assert_return(
  () => invoke($266, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/const.wast:782
let $267 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000200000000001p-600)))`);

// ./test/core/const.wast:783
assert_return(
  () => invoke($267, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/const.wast:784
let $268 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.00000000000027ffffffffffp-600)))`);

// ./test/core/const.wast:785
assert_return(
  () => invoke($268, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/const.wast:786
let $269 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.00000000000027ffffffffffp-600)))`);

// ./test/core/const.wast:787
assert_return(
  () => invoke($269, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/const.wast:788
let $270 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000280000000001p-600)))`);

// ./test/core/const.wast:789
assert_return(
  () => invoke($270, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028857),
  ],
);

// ./test/core/const.wast:790
let $271 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000280000000001p-600)))`);

// ./test/core/const.wast:791
assert_return(
  () => invoke($271, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028857),
  ],
);

// ./test/core/const.wast:793
let $272 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x8000000.000000400000000000p-627)))`);

// ./test/core/const.wast:794
assert_return(
  () => invoke($272, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102884),
  ],
);

// ./test/core/const.wast:795
let $273 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x8000000.000000400000000000p-627)))`);

// ./test/core/const.wast:796
assert_return(
  () => invoke($273, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102884),
  ],
);

// ./test/core/const.wast:797
let $274 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x8000000.000000400000000001p-627)))`);

// ./test/core/const.wast:798
assert_return(
  () => invoke($274, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/const.wast:799
let $275 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x8000000.000000400000000001p-627)))`);

// ./test/core/const.wast:800
assert_return(
  () => invoke($275, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/const.wast:801
let $276 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x8000000.0000007fffffffffffp-627)))`);

// ./test/core/const.wast:802
assert_return(
  () => invoke($276, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/const.wast:803
let $277 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x8000000.0000007fffffffffffp-627)))`);

// ./test/core/const.wast:804
assert_return(
  () => invoke($277, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/const.wast:805
let $278 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x8000000.000000800000000000p-627)))`);

// ./test/core/const.wast:806
assert_return(
  () => invoke($278, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/const.wast:807
let $279 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x8000000.000000800000000000p-627)))`);

// ./test/core/const.wast:808
assert_return(
  () => invoke($279, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/const.wast:809
let $280 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x8000000.000000800000000001p-627)))`);

// ./test/core/const.wast:810
assert_return(
  () => invoke($280, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/const.wast:811
let $281 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x8000000.000000800000000001p-627)))`);

// ./test/core/const.wast:812
assert_return(
  () => invoke($281, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/const.wast:813
let $282 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x8000000.000000bfffffffffffp-627)))`);

// ./test/core/const.wast:814
assert_return(
  () => invoke($282, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/const.wast:815
let $283 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x8000000.000000bfffffffffffp-627)))`);

// ./test/core/const.wast:816
assert_return(
  () => invoke($283, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/const.wast:817
let $284 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x8000000.000000c00000000000p-627)))`);

// ./test/core/const.wast:818
assert_return(
  () => invoke($284, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/const.wast:819
let $285 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x8000000.000000c00000000000p-627)))`);

// ./test/core/const.wast:820
assert_return(
  () => invoke($285, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/const.wast:821
let $286 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x8000000.000000c00000000001p-627)))`);

// ./test/core/const.wast:822
assert_return(
  () => invoke($286, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/const.wast:823
let $287 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x8000000.000000c00000000001p-627)))`);

// ./test/core/const.wast:824
assert_return(
  () => invoke($287, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/const.wast:825
let $288 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x8000000.000000ffffffffffffp-627)))`);

// ./test/core/const.wast:826
assert_return(
  () => invoke($288, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/const.wast:827
let $289 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x8000000.000000ffffffffffffp-627)))`);

// ./test/core/const.wast:828
assert_return(
  () => invoke($289, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/const.wast:829
let $290 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x8000000.000001000000000000p-627)))`);

// ./test/core/const.wast:830
assert_return(
  () => invoke($290, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/const.wast:831
let $291 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x8000000.000001000000000000p-627)))`);

// ./test/core/const.wast:832
assert_return(
  () => invoke($291, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/const.wast:833
let $292 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x8000000.000001000000000001p-627)))`);

// ./test/core/const.wast:834
assert_return(
  () => invoke($292, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/const.wast:835
let $293 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x8000000.000001000000000001p-627)))`);

// ./test/core/const.wast:836
assert_return(
  () => invoke($293, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/const.wast:837
let $294 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x8000000.0000013fffffffffffp-627)))`);

// ./test/core/const.wast:838
assert_return(
  () => invoke($294, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/const.wast:839
let $295 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x8000000.0000013fffffffffffp-627)))`);

// ./test/core/const.wast:840
assert_return(
  () => invoke($295, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/const.wast:841
let $296 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x8000000.000001400000000001p-627)))`);

// ./test/core/const.wast:842
assert_return(
  () => invoke($296, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028857),
  ],
);

// ./test/core/const.wast:843
let $297 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x8000000.000001400000000001p-627)))`);

// ./test/core/const.wast:844
assert_return(
  () => invoke($297, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028857),
  ],
);

// ./test/core/const.wast:846
let $298 = instantiate(`(module (func (export "f") (result f64) (f64.const +5.3575430359313371995e+300)))`);

// ./test/core/const.wast:847
assert_return(
  () => invoke($298, `f`, []),
  [
    value("f64", 5357543035931337000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:848
let $299 = instantiate(`(module (func (export "f") (result f64) (f64.const -5.3575430359313371995e+300)))`);

// ./test/core/const.wast:849
assert_return(
  () => invoke($299, `f`, []),
  [
    value("f64", -5357543035931337000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:850
let $300 = instantiate(`(module (func (export "f") (result f64) (f64.const +5.3575430359313371996e+300)))`);

// ./test/core/const.wast:851
assert_return(
  () => invoke($300, `f`, []),
  [
    value("f64", 5357543035931338000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:852
let $301 = instantiate(`(module (func (export "f") (result f64) (f64.const -5.3575430359313371996e+300)))`);

// ./test/core/const.wast:853
assert_return(
  () => invoke($301, `f`, []),
  [
    value("f64", -5357543035931338000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:854
let $302 = instantiate(`(module (func (export "f") (result f64) (f64.const +5.3575430359313383891e+300)))`);

// ./test/core/const.wast:855
assert_return(
  () => invoke($302, `f`, []),
  [
    value("f64", 5357543035931338000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:856
let $303 = instantiate(`(module (func (export "f") (result f64) (f64.const -5.3575430359313383891e+300)))`);

// ./test/core/const.wast:857
assert_return(
  () => invoke($303, `f`, []),
  [
    value("f64", -5357543035931338000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:858
let $304 = instantiate(`(module (func (export "f") (result f64) (f64.const +5.3575430359313383892e+300)))`);

// ./test/core/const.wast:859
assert_return(
  () => invoke($304, `f`, []),
  [
    value("f64", 5357543035931339000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:860
let $305 = instantiate(`(module (func (export "f") (result f64) (f64.const -5.3575430359313383892e+300)))`);

// ./test/core/const.wast:861
assert_return(
  () => invoke($305, `f`, []),
  [
    value("f64", -5357543035931339000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:864
let $306 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000080000000000p+600)))`);

// ./test/core/const.wast:865
assert_return(
  () => invoke($306, `f`, []),
  [
    value("f64", 4149515568880993000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:866
let $307 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000080000000000p+600)))`);

// ./test/core/const.wast:867
assert_return(
  () => invoke($307, `f`, []),
  [
    value("f64", -4149515568880993000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:868
let $308 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000080000000001p+600)))`);

// ./test/core/const.wast:869
assert_return(
  () => invoke($308, `f`, []),
  [
    value("f64", 4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:870
let $309 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000080000000001p+600)))`);

// ./test/core/const.wast:871
assert_return(
  () => invoke($309, `f`, []),
  [
    value("f64", -4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:872
let $310 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.0000000000000fffffffffffp+600)))`);

// ./test/core/const.wast:873
assert_return(
  () => invoke($310, `f`, []),
  [
    value("f64", 4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:874
let $311 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.0000000000000fffffffffffp+600)))`);

// ./test/core/const.wast:875
assert_return(
  () => invoke($311, `f`, []),
  [
    value("f64", -4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:876
let $312 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000100000000000p+600)))`);

// ./test/core/const.wast:877
assert_return(
  () => invoke($312, `f`, []),
  [
    value("f64", 4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:878
let $313 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000100000000000p+600)))`);

// ./test/core/const.wast:879
assert_return(
  () => invoke($313, `f`, []),
  [
    value("f64", -4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:880
let $314 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000100000000001p+600)))`);

// ./test/core/const.wast:881
assert_return(
  () => invoke($314, `f`, []),
  [
    value("f64", 4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:882
let $315 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000100000000001p+600)))`);

// ./test/core/const.wast:883
assert_return(
  () => invoke($315, `f`, []),
  [
    value("f64", -4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:884
let $316 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.00000000000017ffffffffffp+600)))`);

// ./test/core/const.wast:885
assert_return(
  () => invoke($316, `f`, []),
  [
    value("f64", 4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:886
let $317 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.00000000000017ffffffffffp+600)))`);

// ./test/core/const.wast:887
assert_return(
  () => invoke($317, `f`, []),
  [
    value("f64", -4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:888
let $318 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000180000000000p+600)))`);

// ./test/core/const.wast:889
assert_return(
  () => invoke($318, `f`, []),
  [
    value("f64", 4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:890
let $319 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000180000000000p+600)))`);

// ./test/core/const.wast:891
assert_return(
  () => invoke($319, `f`, []),
  [
    value("f64", -4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:892
let $320 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000180000000001p+600)))`);

// ./test/core/const.wast:893
assert_return(
  () => invoke($320, `f`, []),
  [
    value("f64", 4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:894
let $321 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000180000000001p+600)))`);

// ./test/core/const.wast:895
assert_return(
  () => invoke($321, `f`, []),
  [
    value("f64", -4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:896
let $322 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.0000000000001fffffffffffp+600)))`);

// ./test/core/const.wast:897
assert_return(
  () => invoke($322, `f`, []),
  [
    value("f64", 4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:898
let $323 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.0000000000001fffffffffffp+600)))`);

// ./test/core/const.wast:899
assert_return(
  () => invoke($323, `f`, []),
  [
    value("f64", -4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:900
let $324 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000200000000000p+600)))`);

// ./test/core/const.wast:901
assert_return(
  () => invoke($324, `f`, []),
  [
    value("f64", 4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:902
let $325 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000200000000000p+600)))`);

// ./test/core/const.wast:903
assert_return(
  () => invoke($325, `f`, []),
  [
    value("f64", -4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:904
let $326 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000200000000001p+600)))`);

// ./test/core/const.wast:905
assert_return(
  () => invoke($326, `f`, []),
  [
    value("f64", 4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:906
let $327 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000200000000001p+600)))`);

// ./test/core/const.wast:907
assert_return(
  () => invoke($327, `f`, []),
  [
    value("f64", -4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:908
let $328 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.00000000000027ffffffffffp+600)))`);

// ./test/core/const.wast:909
assert_return(
  () => invoke($328, `f`, []),
  [
    value("f64", 4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:910
let $329 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.00000000000027ffffffffffp+600)))`);

// ./test/core/const.wast:911
assert_return(
  () => invoke($329, `f`, []),
  [
    value("f64", -4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:912
let $330 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000280000000000p+600)))`);

// ./test/core/const.wast:913
assert_return(
  () => invoke($330, `f`, []),
  [
    value("f64", 4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:914
let $331 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000280000000000p+600)))`);

// ./test/core/const.wast:915
assert_return(
  () => invoke($331, `f`, []),
  [
    value("f64", -4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:916
let $332 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000280000000001p+600)))`);

// ./test/core/const.wast:917
assert_return(
  () => invoke($332, `f`, []),
  [
    value("f64", 4149515568880996000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:918
let $333 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000280000000001p+600)))`);

// ./test/core/const.wast:919
assert_return(
  () => invoke($333, `f`, []),
  [
    value("f64", -4149515568880996000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:921
let $334 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x2000000000000100000000000)))`);

// ./test/core/const.wast:922
assert_return(() => invoke($334, `f`, []), [value("f64", 158456325028528680000000000000)]);

// ./test/core/const.wast:923
let $335 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x2000000000000100000000000)))`);

// ./test/core/const.wast:924
assert_return(() => invoke($335, `f`, []), [value("f64", -158456325028528680000000000000)]);

// ./test/core/const.wast:925
let $336 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x2000000000000100000000001)))`);

// ./test/core/const.wast:926
assert_return(() => invoke($336, `f`, []), [value("f64", 158456325028528700000000000000)]);

// ./test/core/const.wast:927
let $337 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x2000000000000100000000001)))`);

// ./test/core/const.wast:928
assert_return(() => invoke($337, `f`, []), [value("f64", -158456325028528700000000000000)]);

// ./test/core/const.wast:929
let $338 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x20000000000001fffffffffff)))`);

// ./test/core/const.wast:930
assert_return(() => invoke($338, `f`, []), [value("f64", 158456325028528700000000000000)]);

// ./test/core/const.wast:931
let $339 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x20000000000001fffffffffff)))`);

// ./test/core/const.wast:932
assert_return(() => invoke($339, `f`, []), [value("f64", -158456325028528700000000000000)]);

// ./test/core/const.wast:933
let $340 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x2000000000000200000000000)))`);

// ./test/core/const.wast:934
assert_return(() => invoke($340, `f`, []), [value("f64", 158456325028528700000000000000)]);

// ./test/core/const.wast:935
let $341 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x2000000000000200000000000)))`);

// ./test/core/const.wast:936
assert_return(() => invoke($341, `f`, []), [value("f64", -158456325028528700000000000000)]);

// ./test/core/const.wast:937
let $342 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x2000000000000200000000001)))`);

// ./test/core/const.wast:938
assert_return(() => invoke($342, `f`, []), [value("f64", 158456325028528700000000000000)]);

// ./test/core/const.wast:939
let $343 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x2000000000000200000000001)))`);

// ./test/core/const.wast:940
assert_return(() => invoke($343, `f`, []), [value("f64", -158456325028528700000000000000)]);

// ./test/core/const.wast:941
let $344 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x20000000000002fffffffffff)))`);

// ./test/core/const.wast:942
assert_return(() => invoke($344, `f`, []), [value("f64", 158456325028528700000000000000)]);

// ./test/core/const.wast:943
let $345 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x20000000000002fffffffffff)))`);

// ./test/core/const.wast:944
assert_return(() => invoke($345, `f`, []), [value("f64", -158456325028528700000000000000)]);

// ./test/core/const.wast:945
let $346 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x2000000000000300000000000)))`);

// ./test/core/const.wast:946
assert_return(() => invoke($346, `f`, []), [value("f64", 158456325028528750000000000000)]);

// ./test/core/const.wast:947
let $347 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x2000000000000300000000000)))`);

// ./test/core/const.wast:948
assert_return(() => invoke($347, `f`, []), [value("f64", -158456325028528750000000000000)]);

// ./test/core/const.wast:949
let $348 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x2000000000000300000000001)))`);

// ./test/core/const.wast:950
assert_return(() => invoke($348, `f`, []), [value("f64", 158456325028528750000000000000)]);

// ./test/core/const.wast:951
let $349 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x2000000000000300000000001)))`);

// ./test/core/const.wast:952
assert_return(() => invoke($349, `f`, []), [value("f64", -158456325028528750000000000000)]);

// ./test/core/const.wast:953
let $350 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x20000000000003fffffffffff)))`);

// ./test/core/const.wast:954
assert_return(() => invoke($350, `f`, []), [value("f64", 158456325028528750000000000000)]);

// ./test/core/const.wast:955
let $351 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x20000000000003fffffffffff)))`);

// ./test/core/const.wast:956
assert_return(() => invoke($351, `f`, []), [value("f64", -158456325028528750000000000000)]);

// ./test/core/const.wast:957
let $352 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x2000000000000400000000000)))`);

// ./test/core/const.wast:958
assert_return(() => invoke($352, `f`, []), [value("f64", 158456325028528750000000000000)]);

// ./test/core/const.wast:959
let $353 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x2000000000000400000000000)))`);

// ./test/core/const.wast:960
assert_return(() => invoke($353, `f`, []), [value("f64", -158456325028528750000000000000)]);

// ./test/core/const.wast:961
let $354 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x2000000000000400000000001)))`);

// ./test/core/const.wast:962
assert_return(() => invoke($354, `f`, []), [value("f64", 158456325028528750000000000000)]);

// ./test/core/const.wast:963
let $355 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x2000000000000400000000001)))`);

// ./test/core/const.wast:964
assert_return(() => invoke($355, `f`, []), [value("f64", -158456325028528750000000000000)]);

// ./test/core/const.wast:965
let $356 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x20000000000004fffffffffff)))`);

// ./test/core/const.wast:966
assert_return(() => invoke($356, `f`, []), [value("f64", 158456325028528750000000000000)]);

// ./test/core/const.wast:967
let $357 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x20000000000004fffffffffff)))`);

// ./test/core/const.wast:968
assert_return(() => invoke($357, `f`, []), [value("f64", -158456325028528750000000000000)]);

// ./test/core/const.wast:969
let $358 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x2000000000000500000000000)))`);

// ./test/core/const.wast:970
assert_return(() => invoke($358, `f`, []), [value("f64", 158456325028528750000000000000)]);

// ./test/core/const.wast:971
let $359 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x2000000000000500000000000)))`);

// ./test/core/const.wast:972
assert_return(() => invoke($359, `f`, []), [value("f64", -158456325028528750000000000000)]);

// ./test/core/const.wast:973
let $360 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x2000000000000500000000001)))`);

// ./test/core/const.wast:974
assert_return(() => invoke($360, `f`, []), [value("f64", 158456325028528780000000000000)]);

// ./test/core/const.wast:975
let $361 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x2000000000000500000000001)))`);

// ./test/core/const.wast:976
assert_return(() => invoke($361, `f`, []), [value("f64", -158456325028528780000000000000)]);

// ./test/core/const.wast:978
let $362 = instantiate(`(module (func (export "f") (result f64) (f64.const +1152921504606847104)))`);

// ./test/core/const.wast:979
assert_return(() => invoke($362, `f`, []), [value("f64", 1152921504606847000)]);

// ./test/core/const.wast:980
let $363 = instantiate(`(module (func (export "f") (result f64) (f64.const -1152921504606847104)))`);

// ./test/core/const.wast:981
assert_return(() => invoke($363, `f`, []), [value("f64", -1152921504606847000)]);

// ./test/core/const.wast:982
let $364 = instantiate(`(module (func (export "f") (result f64) (f64.const +1152921504606847105)))`);

// ./test/core/const.wast:983
assert_return(() => invoke($364, `f`, []), [value("f64", 1152921504606847200)]);

// ./test/core/const.wast:984
let $365 = instantiate(`(module (func (export "f") (result f64) (f64.const -1152921504606847105)))`);

// ./test/core/const.wast:985
assert_return(() => invoke($365, `f`, []), [value("f64", -1152921504606847200)]);

// ./test/core/const.wast:986
let $366 = instantiate(`(module (func (export "f") (result f64) (f64.const +1152921504606847359)))`);

// ./test/core/const.wast:987
assert_return(() => invoke($366, `f`, []), [value("f64", 1152921504606847200)]);

// ./test/core/const.wast:988
let $367 = instantiate(`(module (func (export "f") (result f64) (f64.const -1152921504606847359)))`);

// ./test/core/const.wast:989
assert_return(() => invoke($367, `f`, []), [value("f64", -1152921504606847200)]);

// ./test/core/const.wast:990
let $368 = instantiate(`(module (func (export "f") (result f64) (f64.const +1152921504606847360)))`);

// ./test/core/const.wast:991
assert_return(() => invoke($368, `f`, []), [value("f64", 1152921504606847500)]);

// ./test/core/const.wast:992
let $369 = instantiate(`(module (func (export "f") (result f64) (f64.const -1152921504606847360)))`);

// ./test/core/const.wast:993
assert_return(() => invoke($369, `f`, []), [value("f64", -1152921504606847500)]);

// ./test/core/const.wast:996
let $370 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x0.000000000000080000000000p-1022)))`);

// ./test/core/const.wast:997
assert_return(() => invoke($370, `f`, []), [value("f64", 0)]);

// ./test/core/const.wast:998
let $371 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x0.000000000000080000000000p-1022)))`);

// ./test/core/const.wast:999
assert_return(() => invoke($371, `f`, []), [value("f64", -0)]);

// ./test/core/const.wast:1000
let $372 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x0.000000000000080000000001p-1022)))`);

// ./test/core/const.wast:1001
assert_return(
  () => invoke($372, `f`, []),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ],
);

// ./test/core/const.wast:1002
let $373 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x0.000000000000080000000001p-1022)))`);

// ./test/core/const.wast:1003
assert_return(
  () => invoke($373, `f`, []),
  [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ],
);

// ./test/core/const.wast:1004
let $374 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x0.0000000000000fffffffffffp-1022)))`);

// ./test/core/const.wast:1005
assert_return(
  () => invoke($374, `f`, []),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ],
);

// ./test/core/const.wast:1006
let $375 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x0.0000000000000fffffffffffp-1022)))`);

// ./test/core/const.wast:1007
assert_return(
  () => invoke($375, `f`, []),
  [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ],
);

// ./test/core/const.wast:1008
let $376 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x0.000000000000100000000000p-1022)))`);

// ./test/core/const.wast:1009
assert_return(
  () => invoke($376, `f`, []),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ],
);

// ./test/core/const.wast:1010
let $377 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x0.000000000000100000000000p-1022)))`);

// ./test/core/const.wast:1011
assert_return(
  () => invoke($377, `f`, []),
  [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ],
);

// ./test/core/const.wast:1012
let $378 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x0.000000000000100000000001p-1022)))`);

// ./test/core/const.wast:1013
assert_return(
  () => invoke($378, `f`, []),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ],
);

// ./test/core/const.wast:1014
let $379 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x0.000000000000100000000001p-1022)))`);

// ./test/core/const.wast:1015
assert_return(
  () => invoke($379, `f`, []),
  [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ],
);

// ./test/core/const.wast:1016
let $380 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x0.00000000000017ffffffffffp-1022)))`);

// ./test/core/const.wast:1017
assert_return(
  () => invoke($380, `f`, []),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ],
);

// ./test/core/const.wast:1018
let $381 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x0.00000000000017ffffffffffp-1022)))`);

// ./test/core/const.wast:1019
assert_return(
  () => invoke($381, `f`, []),
  [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ],
);

// ./test/core/const.wast:1020
let $382 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x0.000000000000180000000000p-1022)))`);

// ./test/core/const.wast:1021
assert_return(
  () => invoke($382, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
  ],
);

// ./test/core/const.wast:1022
let $383 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x0.000000000000180000000000p-1022)))`);

// ./test/core/const.wast:1023
assert_return(
  () => invoke($383, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
  ],
);

// ./test/core/const.wast:1024
let $384 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x0.000000000000180000000001p-1022)))`);

// ./test/core/const.wast:1025
assert_return(
  () => invoke($384, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
  ],
);

// ./test/core/const.wast:1026
let $385 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x0.000000000000180000000001p-1022)))`);

// ./test/core/const.wast:1027
assert_return(
  () => invoke($385, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
  ],
);

// ./test/core/const.wast:1028
let $386 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x0.0000000000001fffffffffffp-1022)))`);

// ./test/core/const.wast:1029
assert_return(
  () => invoke($386, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
  ],
);

// ./test/core/const.wast:1030
let $387 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x0.0000000000001fffffffffffp-1022)))`);

// ./test/core/const.wast:1031
assert_return(
  () => invoke($387, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
  ],
);

// ./test/core/const.wast:1032
let $388 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x0.000000000000200000000000p-1022)))`);

// ./test/core/const.wast:1033
assert_return(
  () => invoke($388, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
  ],
);

// ./test/core/const.wast:1034
let $389 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x0.000000000000200000000000p-1022)))`);

// ./test/core/const.wast:1035
assert_return(
  () => invoke($389, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
  ],
);

// ./test/core/const.wast:1036
let $390 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x0.000000000000200000000001p-1022)))`);

// ./test/core/const.wast:1037
assert_return(
  () => invoke($390, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
  ],
);

// ./test/core/const.wast:1038
let $391 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x0.000000000000200000000001p-1022)))`);

// ./test/core/const.wast:1039
assert_return(
  () => invoke($391, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
  ],
);

// ./test/core/const.wast:1040
let $392 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x0.00000000000027ffffffffffp-1022)))`);

// ./test/core/const.wast:1041
assert_return(
  () => invoke($392, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
  ],
);

// ./test/core/const.wast:1042
let $393 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x0.00000000000027ffffffffffp-1022)))`);

// ./test/core/const.wast:1043
assert_return(
  () => invoke($393, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
  ],
);

// ./test/core/const.wast:1044
let $394 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x0.000000000000280000000000p-1022)))`);

// ./test/core/const.wast:1045
assert_return(
  () => invoke($394, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
  ],
);

// ./test/core/const.wast:1046
let $395 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x0.000000000000280000000000p-1022)))`);

// ./test/core/const.wast:1047
assert_return(
  () => invoke($395, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
  ],
);

// ./test/core/const.wast:1048
let $396 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000280000000001p-1022)))`);

// ./test/core/const.wast:1049
assert_return(
  () => invoke($396, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002225073858507203),
  ],
);

// ./test/core/const.wast:1050
let $397 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000280000000001p-1022)))`);

// ./test/core/const.wast:1051
assert_return(
  () => invoke($397, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002225073858507203),
  ],
);

// ./test/core/const.wast:1054
let $398 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.fffffffffffff4p1023)))`);

// ./test/core/const.wast:1055
assert_return(
  () => invoke($398, `f`, []),
  [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:1056
let $399 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.fffffffffffff4p1023)))`);

// ./test/core/const.wast:1057
assert_return(
  () => invoke($399, `f`, []),
  [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:1058
let $400 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.fffffffffffff7ffffffp1023)))`);

// ./test/core/const.wast:1059
assert_return(
  () => invoke($400, `f`, []),
  [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/const.wast:1060
let $401 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.fffffffffffff7ffffffp1023)))`);

// ./test/core/const.wast:1061
assert_return(
  () => invoke($401, `f`, []),
  [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);
