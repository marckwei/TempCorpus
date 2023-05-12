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

// ./test/core/conversions.wast

// ./test/core/conversions.wast:1
let $0 = instantiate(`(module
  (func (export "i64.extend_i32_s") (param $$x i32) (result i64) (i64.extend_i32_s (local.get $$x)))
  (func (export "i64.extend_i32_u") (param $$x i32) (result i64) (i64.extend_i32_u (local.get $$x)))
  (func (export "i32.wrap_i64") (param $$x i64) (result i32) (i32.wrap_i64 (local.get $$x)))
  (func (export "i32.trunc_f32_s") (param $$x f32) (result i32) (i32.trunc_f32_s (local.get $$x)))
  (func (export "i32.trunc_f32_u") (param $$x f32) (result i32) (i32.trunc_f32_u (local.get $$x)))
  (func (export "i32.trunc_f64_s") (param $$x f64) (result i32) (i32.trunc_f64_s (local.get $$x)))
  (func (export "i32.trunc_f64_u") (param $$x f64) (result i32) (i32.trunc_f64_u (local.get $$x)))
  (func (export "i64.trunc_f32_s") (param $$x f32) (result i64) (i64.trunc_f32_s (local.get $$x)))
  (func (export "i64.trunc_f32_u") (param $$x f32) (result i64) (i64.trunc_f32_u (local.get $$x)))
  (func (export "i64.trunc_f64_s") (param $$x f64) (result i64) (i64.trunc_f64_s (local.get $$x)))
  (func (export "i64.trunc_f64_u") (param $$x f64) (result i64) (i64.trunc_f64_u (local.get $$x)))
  (func (export "i32.trunc_sat_f32_s") (param $$x f32) (result i32) (i32.trunc_sat_f32_s (local.get $$x)))
  (func (export "i32.trunc_sat_f32_u") (param $$x f32) (result i32) (i32.trunc_sat_f32_u (local.get $$x)))
  (func (export "i32.trunc_sat_f64_s") (param $$x f64) (result i32) (i32.trunc_sat_f64_s (local.get $$x)))
  (func (export "i32.trunc_sat_f64_u") (param $$x f64) (result i32) (i32.trunc_sat_f64_u (local.get $$x)))
  (func (export "i64.trunc_sat_f32_s") (param $$x f32) (result i64) (i64.trunc_sat_f32_s (local.get $$x)))
  (func (export "i64.trunc_sat_f32_u") (param $$x f32) (result i64) (i64.trunc_sat_f32_u (local.get $$x)))
  (func (export "i64.trunc_sat_f64_s") (param $$x f64) (result i64) (i64.trunc_sat_f64_s (local.get $$x)))
  (func (export "i64.trunc_sat_f64_u") (param $$x f64) (result i64) (i64.trunc_sat_f64_u (local.get $$x)))
  (func (export "f32.convert_i32_s") (param $$x i32) (result f32) (f32.convert_i32_s (local.get $$x)))
  (func (export "f32.convert_i64_s") (param $$x i64) (result f32) (f32.convert_i64_s (local.get $$x)))
  (func (export "f64.convert_i32_s") (param $$x i32) (result f64) (f64.convert_i32_s (local.get $$x)))
  (func (export "f64.convert_i64_s") (param $$x i64) (result f64) (f64.convert_i64_s (local.get $$x)))
  (func (export "f32.convert_i32_u") (param $$x i32) (result f32) (f32.convert_i32_u (local.get $$x)))
  (func (export "f32.convert_i64_u") (param $$x i64) (result f32) (f32.convert_i64_u (local.get $$x)))
  (func (export "f64.convert_i32_u") (param $$x i32) (result f64) (f64.convert_i32_u (local.get $$x)))
  (func (export "f64.convert_i64_u") (param $$x i64) (result f64) (f64.convert_i64_u (local.get $$x)))
  (func (export "f64.promote_f32") (param $$x f32) (result f64) (f64.promote_f32 (local.get $$x)))
  (func (export "f32.demote_f64") (param $$x f64) (result f32) (f32.demote_f64 (local.get $$x)))
  (func (export "f32.reinterpret_i32") (param $$x i32) (result f32) (f32.reinterpret_i32 (local.get $$x)))
  (func (export "f64.reinterpret_i64") (param $$x i64) (result f64) (f64.reinterpret_i64 (local.get $$x)))
  (func (export "i32.reinterpret_f32") (param $$x f32) (result i32) (i32.reinterpret_f32 (local.get $$x)))
  (func (export "i64.reinterpret_f64") (param $$x f64) (result i64) (i64.reinterpret_f64 (local.get $$x)))
)`);

// ./test/core/conversions.wast:37
assert_return(() => invoke($0, `i64.extend_i32_s`, [0]), [value("i64", 0n)]);

// ./test/core/conversions.wast:38
assert_return(() => invoke($0, `i64.extend_i32_s`, [10000]), [value("i64", 10000n)]);

// ./test/core/conversions.wast:39
assert_return(() => invoke($0, `i64.extend_i32_s`, [-10000]), [value("i64", -10000n)]);

// ./test/core/conversions.wast:40
assert_return(() => invoke($0, `i64.extend_i32_s`, [-1]), [value("i64", -1n)]);

// ./test/core/conversions.wast:41
assert_return(() => invoke($0, `i64.extend_i32_s`, [2147483647]), [value("i64", 2147483647n)]);

// ./test/core/conversions.wast:42
assert_return(() => invoke($0, `i64.extend_i32_s`, [-2147483648]), [value("i64", -2147483648n)]);

// ./test/core/conversions.wast:44
assert_return(() => invoke($0, `i64.extend_i32_u`, [0]), [value("i64", 0n)]);

// ./test/core/conversions.wast:45
assert_return(() => invoke($0, `i64.extend_i32_u`, [10000]), [value("i64", 10000n)]);

// ./test/core/conversions.wast:46
assert_return(() => invoke($0, `i64.extend_i32_u`, [-10000]), [value("i64", 4294957296n)]);

// ./test/core/conversions.wast:47
assert_return(() => invoke($0, `i64.extend_i32_u`, [-1]), [value("i64", 4294967295n)]);

// ./test/core/conversions.wast:48
assert_return(() => invoke($0, `i64.extend_i32_u`, [2147483647]), [value("i64", 2147483647n)]);

// ./test/core/conversions.wast:49
assert_return(() => invoke($0, `i64.extend_i32_u`, [-2147483648]), [value("i64", 2147483648n)]);

// ./test/core/conversions.wast:51
assert_return(() => invoke($0, `i32.wrap_i64`, [-1n]), [value("i32", -1)]);

// ./test/core/conversions.wast:52
assert_return(() => invoke($0, `i32.wrap_i64`, [-100000n]), [value("i32", -100000)]);

// ./test/core/conversions.wast:53
assert_return(() => invoke($0, `i32.wrap_i64`, [2147483648n]), [value("i32", -2147483648)]);

// ./test/core/conversions.wast:54
assert_return(() => invoke($0, `i32.wrap_i64`, [-2147483649n]), [value("i32", 2147483647)]);

// ./test/core/conversions.wast:55
assert_return(() => invoke($0, `i32.wrap_i64`, [-4294967296n]), [value("i32", 0)]);

// ./test/core/conversions.wast:56
assert_return(() => invoke($0, `i32.wrap_i64`, [-4294967297n]), [value("i32", -1)]);

// ./test/core/conversions.wast:57
assert_return(() => invoke($0, `i32.wrap_i64`, [-4294967295n]), [value("i32", 1)]);

// ./test/core/conversions.wast:58
assert_return(() => invoke($0, `i32.wrap_i64`, [0n]), [value("i32", 0)]);

// ./test/core/conversions.wast:59
assert_return(() => invoke($0, `i32.wrap_i64`, [1311768467463790320n]), [value("i32", -1698898192)]);

// ./test/core/conversions.wast:60
assert_return(() => invoke($0, `i32.wrap_i64`, [4294967295n]), [value("i32", -1)]);

// ./test/core/conversions.wast:61
assert_return(() => invoke($0, `i32.wrap_i64`, [4294967296n]), [value("i32", 0)]);

// ./test/core/conversions.wast:62
assert_return(() => invoke($0, `i32.wrap_i64`, [4294967297n]), [value("i32", 1)]);

// ./test/core/conversions.wast:64
assert_return(() => invoke($0, `i32.trunc_f32_s`, [value("f32", 0)]), [value("i32", 0)]);

// ./test/core/conversions.wast:65
assert_return(() => invoke($0, `i32.trunc_f32_s`, [value("f32", -0)]), [value("i32", 0)]);

// ./test/core/conversions.wast:66
assert_return(
  () => invoke($0, `i32.trunc_f32_s`, [
    value("f32", 0.000000000000000000000000000000000000000000001),
  ]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:67
assert_return(
  () => invoke($0, `i32.trunc_f32_s`, [
    value("f32", -0.000000000000000000000000000000000000000000001),
  ]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:68
assert_return(() => invoke($0, `i32.trunc_f32_s`, [value("f32", 1)]), [value("i32", 1)]);

// ./test/core/conversions.wast:69
assert_return(() => invoke($0, `i32.trunc_f32_s`, [value("f32", 1.1)]), [value("i32", 1)]);

// ./test/core/conversions.wast:70
assert_return(() => invoke($0, `i32.trunc_f32_s`, [value("f32", 1.5)]), [value("i32", 1)]);

// ./test/core/conversions.wast:71
assert_return(() => invoke($0, `i32.trunc_f32_s`, [value("f32", -1)]), [value("i32", -1)]);

// ./test/core/conversions.wast:72
assert_return(() => invoke($0, `i32.trunc_f32_s`, [value("f32", -1.1)]), [value("i32", -1)]);

// ./test/core/conversions.wast:73
assert_return(() => invoke($0, `i32.trunc_f32_s`, [value("f32", -1.5)]), [value("i32", -1)]);

// ./test/core/conversions.wast:74
assert_return(() => invoke($0, `i32.trunc_f32_s`, [value("f32", -1.9)]), [value("i32", -1)]);

// ./test/core/conversions.wast:75
assert_return(() => invoke($0, `i32.trunc_f32_s`, [value("f32", -2)]), [value("i32", -2)]);

// ./test/core/conversions.wast:76
assert_return(
  () => invoke($0, `i32.trunc_f32_s`, [value("f32", 2147483500)]),
  [value("i32", 2147483520)],
);

// ./test/core/conversions.wast:77
assert_return(
  () => invoke($0, `i32.trunc_f32_s`, [value("f32", -2147483600)]),
  [value("i32", -2147483648)],
);

// ./test/core/conversions.wast:78
assert_trap(() => invoke($0, `i32.trunc_f32_s`, [value("f32", 2147483600)]), `integer overflow`);

// ./test/core/conversions.wast:79
assert_trap(() => invoke($0, `i32.trunc_f32_s`, [value("f32", -2147484000)]), `integer overflow`);

// ./test/core/conversions.wast:80
assert_trap(() => invoke($0, `i32.trunc_f32_s`, [value("f32", Infinity)]), `integer overflow`);

// ./test/core/conversions.wast:81
assert_trap(() => invoke($0, `i32.trunc_f32_s`, [value("f32", -Infinity)]), `integer overflow`);

// ./test/core/conversions.wast:82
assert_trap(
  () => invoke($0, `i32.trunc_f32_s`, [bytes("f32", [0x0, 0x0, 0xc0, 0x7f])]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:83
assert_trap(
  () => invoke($0, `i32.trunc_f32_s`, [bytes("f32", [0x0, 0x0, 0xa0, 0x7f])]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:84
assert_trap(
  () => invoke($0, `i32.trunc_f32_s`, [bytes("f32", [0x0, 0x0, 0xc0, 0xff])]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:85
assert_trap(
  () => invoke($0, `i32.trunc_f32_s`, [bytes("f32", [0x0, 0x0, 0xa0, 0xff])]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:87
assert_return(() => invoke($0, `i32.trunc_f32_u`, [value("f32", 0)]), [value("i32", 0)]);

// ./test/core/conversions.wast:88
assert_return(() => invoke($0, `i32.trunc_f32_u`, [value("f32", -0)]), [value("i32", 0)]);

// ./test/core/conversions.wast:89
assert_return(
  () => invoke($0, `i32.trunc_f32_u`, [
    value("f32", 0.000000000000000000000000000000000000000000001),
  ]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:90
assert_return(
  () => invoke($0, `i32.trunc_f32_u`, [
    value("f32", -0.000000000000000000000000000000000000000000001),
  ]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:91
assert_return(() => invoke($0, `i32.trunc_f32_u`, [value("f32", 1)]), [value("i32", 1)]);

// ./test/core/conversions.wast:92
assert_return(() => invoke($0, `i32.trunc_f32_u`, [value("f32", 1.1)]), [value("i32", 1)]);

// ./test/core/conversions.wast:93
assert_return(() => invoke($0, `i32.trunc_f32_u`, [value("f32", 1.5)]), [value("i32", 1)]);

// ./test/core/conversions.wast:94
assert_return(() => invoke($0, `i32.trunc_f32_u`, [value("f32", 1.9)]), [value("i32", 1)]);

// ./test/core/conversions.wast:95
assert_return(() => invoke($0, `i32.trunc_f32_u`, [value("f32", 2)]), [value("i32", 2)]);

// ./test/core/conversions.wast:96
assert_return(
  () => invoke($0, `i32.trunc_f32_u`, [value("f32", 2147483600)]),
  [value("i32", -2147483648)],
);

// ./test/core/conversions.wast:97
assert_return(() => invoke($0, `i32.trunc_f32_u`, [value("f32", 4294967000)]), [value("i32", -256)]);

// ./test/core/conversions.wast:98
assert_return(() => invoke($0, `i32.trunc_f32_u`, [value("f32", -0.9)]), [value("i32", 0)]);

// ./test/core/conversions.wast:99
assert_return(() => invoke($0, `i32.trunc_f32_u`, [value("f32", -0.99999994)]), [value("i32", 0)]);

// ./test/core/conversions.wast:100
assert_trap(() => invoke($0, `i32.trunc_f32_u`, [value("f32", 4294967300)]), `integer overflow`);

// ./test/core/conversions.wast:101
assert_trap(() => invoke($0, `i32.trunc_f32_u`, [value("f32", -1)]), `integer overflow`);

// ./test/core/conversions.wast:102
assert_trap(() => invoke($0, `i32.trunc_f32_u`, [value("f32", Infinity)]), `integer overflow`);

// ./test/core/conversions.wast:103
assert_trap(() => invoke($0, `i32.trunc_f32_u`, [value("f32", -Infinity)]), `integer overflow`);

// ./test/core/conversions.wast:104
assert_trap(
  () => invoke($0, `i32.trunc_f32_u`, [bytes("f32", [0x0, 0x0, 0xc0, 0x7f])]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:105
assert_trap(
  () => invoke($0, `i32.trunc_f32_u`, [bytes("f32", [0x0, 0x0, 0xa0, 0x7f])]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:106
assert_trap(
  () => invoke($0, `i32.trunc_f32_u`, [bytes("f32", [0x0, 0x0, 0xc0, 0xff])]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:107
assert_trap(
  () => invoke($0, `i32.trunc_f32_u`, [bytes("f32", [0x0, 0x0, 0xa0, 0xff])]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:109
assert_return(() => invoke($0, `i32.trunc_f64_s`, [value("f64", 0)]), [value("i32", 0)]);

// ./test/core/conversions.wast:110
assert_return(() => invoke($0, `i32.trunc_f64_s`, [value("f64", -0)]), [value("i32", 0)]);

// ./test/core/conversions.wast:111
assert_return(
  () => invoke($0, `i32.trunc_f64_s`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:112
assert_return(
  () => invoke($0, `i32.trunc_f64_s`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:113
assert_return(() => invoke($0, `i32.trunc_f64_s`, [value("f64", 1)]), [value("i32", 1)]);

// ./test/core/conversions.wast:114
assert_return(() => invoke($0, `i32.trunc_f64_s`, [value("f64", 1.1)]), [value("i32", 1)]);

// ./test/core/conversions.wast:115
assert_return(() => invoke($0, `i32.trunc_f64_s`, [value("f64", 1.5)]), [value("i32", 1)]);

// ./test/core/conversions.wast:116
assert_return(() => invoke($0, `i32.trunc_f64_s`, [value("f64", -1)]), [value("i32", -1)]);

// ./test/core/conversions.wast:117
assert_return(() => invoke($0, `i32.trunc_f64_s`, [value("f64", -1.1)]), [value("i32", -1)]);

// ./test/core/conversions.wast:118
assert_return(() => invoke($0, `i32.trunc_f64_s`, [value("f64", -1.5)]), [value("i32", -1)]);

// ./test/core/conversions.wast:119
assert_return(() => invoke($0, `i32.trunc_f64_s`, [value("f64", -1.9)]), [value("i32", -1)]);

// ./test/core/conversions.wast:120
assert_return(() => invoke($0, `i32.trunc_f64_s`, [value("f64", -2)]), [value("i32", -2)]);

// ./test/core/conversions.wast:121
assert_return(
  () => invoke($0, `i32.trunc_f64_s`, [value("f64", 2147483647)]),
  [value("i32", 2147483647)],
);

// ./test/core/conversions.wast:122
assert_return(
  () => invoke($0, `i32.trunc_f64_s`, [value("f64", -2147483648)]),
  [value("i32", -2147483648)],
);

// ./test/core/conversions.wast:123
assert_return(
  () => invoke($0, `i32.trunc_f64_s`, [value("f64", -2147483648.9)]),
  [value("i32", -2147483648)],
);

// ./test/core/conversions.wast:124
assert_return(
  () => invoke($0, `i32.trunc_f64_s`, [value("f64", 2147483647.9)]),
  [value("i32", 2147483647)],
);

// ./test/core/conversions.wast:125
assert_trap(() => invoke($0, `i32.trunc_f64_s`, [value("f64", 2147483648)]), `integer overflow`);

// ./test/core/conversions.wast:126
assert_trap(() => invoke($0, `i32.trunc_f64_s`, [value("f64", -2147483649)]), `integer overflow`);

// ./test/core/conversions.wast:127
assert_trap(() => invoke($0, `i32.trunc_f64_s`, [value("f64", Infinity)]), `integer overflow`);

// ./test/core/conversions.wast:128
assert_trap(() => invoke($0, `i32.trunc_f64_s`, [value("f64", -Infinity)]), `integer overflow`);

// ./test/core/conversions.wast:129
assert_trap(
  () => invoke($0, `i32.trunc_f64_s`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:130
assert_trap(
  () => invoke($0, `i32.trunc_f64_s`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:131
assert_trap(
  () => invoke($0, `i32.trunc_f64_s`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:132
assert_trap(
  () => invoke($0, `i32.trunc_f64_s`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:134
assert_return(() => invoke($0, `i32.trunc_f64_u`, [value("f64", 0)]), [value("i32", 0)]);

// ./test/core/conversions.wast:135
assert_return(() => invoke($0, `i32.trunc_f64_u`, [value("f64", -0)]), [value("i32", 0)]);

// ./test/core/conversions.wast:136
assert_return(
  () => invoke($0, `i32.trunc_f64_u`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:137
assert_return(
  () => invoke($0, `i32.trunc_f64_u`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:138
assert_return(() => invoke($0, `i32.trunc_f64_u`, [value("f64", 1)]), [value("i32", 1)]);

// ./test/core/conversions.wast:139
assert_return(() => invoke($0, `i32.trunc_f64_u`, [value("f64", 1.1)]), [value("i32", 1)]);

// ./test/core/conversions.wast:140
assert_return(() => invoke($0, `i32.trunc_f64_u`, [value("f64", 1.5)]), [value("i32", 1)]);

// ./test/core/conversions.wast:141
assert_return(() => invoke($0, `i32.trunc_f64_u`, [value("f64", 1.9)]), [value("i32", 1)]);

// ./test/core/conversions.wast:142
assert_return(() => invoke($0, `i32.trunc_f64_u`, [value("f64", 2)]), [value("i32", 2)]);

// ./test/core/conversions.wast:143
assert_return(
  () => invoke($0, `i32.trunc_f64_u`, [value("f64", 2147483648)]),
  [value("i32", -2147483648)],
);

// ./test/core/conversions.wast:144
assert_return(() => invoke($0, `i32.trunc_f64_u`, [value("f64", 4294967295)]), [value("i32", -1)]);

// ./test/core/conversions.wast:145
assert_return(() => invoke($0, `i32.trunc_f64_u`, [value("f64", -0.9)]), [value("i32", 0)]);

// ./test/core/conversions.wast:146
assert_return(
  () => invoke($0, `i32.trunc_f64_u`, [value("f64", -0.9999999999999999)]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:147
assert_return(() => invoke($0, `i32.trunc_f64_u`, [value("f64", 100000000)]), [value("i32", 100000000)]);

// ./test/core/conversions.wast:148
assert_return(() => invoke($0, `i32.trunc_f64_u`, [value("f64", -0.9)]), [value("i32", 0)]);

// ./test/core/conversions.wast:149
assert_return(() => invoke($0, `i32.trunc_f64_u`, [value("f64", 4294967295.9)]), [value("i32", -1)]);

// ./test/core/conversions.wast:150
assert_trap(() => invoke($0, `i32.trunc_f64_u`, [value("f64", 4294967296)]), `integer overflow`);

// ./test/core/conversions.wast:151
assert_trap(() => invoke($0, `i32.trunc_f64_u`, [value("f64", -1)]), `integer overflow`);

// ./test/core/conversions.wast:152
assert_trap(() => invoke($0, `i32.trunc_f64_u`, [value("f64", 10000000000000000)]), `integer overflow`);

// ./test/core/conversions.wast:153
assert_trap(
  () => invoke($0, `i32.trunc_f64_u`, [value("f64", 1000000000000000000000000000000)]),
  `integer overflow`,
);

// ./test/core/conversions.wast:154
assert_trap(
  () => invoke($0, `i32.trunc_f64_u`, [value("f64", 9223372036854776000)]),
  `integer overflow`,
);

// ./test/core/conversions.wast:155
assert_trap(() => invoke($0, `i32.trunc_f64_u`, [value("f64", Infinity)]), `integer overflow`);

// ./test/core/conversions.wast:156
assert_trap(() => invoke($0, `i32.trunc_f64_u`, [value("f64", -Infinity)]), `integer overflow`);

// ./test/core/conversions.wast:157
assert_trap(
  () => invoke($0, `i32.trunc_f64_u`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:158
assert_trap(
  () => invoke($0, `i32.trunc_f64_u`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:159
assert_trap(
  () => invoke($0, `i32.trunc_f64_u`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:160
assert_trap(
  () => invoke($0, `i32.trunc_f64_u`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:162
assert_return(() => invoke($0, `i64.trunc_f32_s`, [value("f32", 0)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:163
assert_return(() => invoke($0, `i64.trunc_f32_s`, [value("f32", -0)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:164
assert_return(
  () => invoke($0, `i64.trunc_f32_s`, [
    value("f32", 0.000000000000000000000000000000000000000000001),
  ]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:165
assert_return(
  () => invoke($0, `i64.trunc_f32_s`, [
    value("f32", -0.000000000000000000000000000000000000000000001),
  ]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:166
assert_return(() => invoke($0, `i64.trunc_f32_s`, [value("f32", 1)]), [value("i64", 1n)]);

// ./test/core/conversions.wast:167
assert_return(() => invoke($0, `i64.trunc_f32_s`, [value("f32", 1.1)]), [value("i64", 1n)]);

// ./test/core/conversions.wast:168
assert_return(() => invoke($0, `i64.trunc_f32_s`, [value("f32", 1.5)]), [value("i64", 1n)]);

// ./test/core/conversions.wast:169
assert_return(() => invoke($0, `i64.trunc_f32_s`, [value("f32", -1)]), [value("i64", -1n)]);

// ./test/core/conversions.wast:170
assert_return(() => invoke($0, `i64.trunc_f32_s`, [value("f32", -1.1)]), [value("i64", -1n)]);

// ./test/core/conversions.wast:171
assert_return(() => invoke($0, `i64.trunc_f32_s`, [value("f32", -1.5)]), [value("i64", -1n)]);

// ./test/core/conversions.wast:172
assert_return(() => invoke($0, `i64.trunc_f32_s`, [value("f32", -1.9)]), [value("i64", -1n)]);

// ./test/core/conversions.wast:173
assert_return(() => invoke($0, `i64.trunc_f32_s`, [value("f32", -2)]), [value("i64", -2n)]);

// ./test/core/conversions.wast:174
assert_return(
  () => invoke($0, `i64.trunc_f32_s`, [value("f32", 4294967300)]),
  [value("i64", 4294967296n)],
);

// ./test/core/conversions.wast:175
assert_return(
  () => invoke($0, `i64.trunc_f32_s`, [value("f32", -4294967300)]),
  [value("i64", -4294967296n)],
);

// ./test/core/conversions.wast:176
assert_return(
  () => invoke($0, `i64.trunc_f32_s`, [value("f32", 9223371500000000000)]),
  [value("i64", 9223371487098961920n)],
);

// ./test/core/conversions.wast:177
assert_return(
  () => invoke($0, `i64.trunc_f32_s`, [value("f32", -9223372000000000000)]),
  [value("i64", -9223372036854775808n)],
);

// ./test/core/conversions.wast:178
assert_trap(
  () => invoke($0, `i64.trunc_f32_s`, [value("f32", 9223372000000000000)]),
  `integer overflow`,
);

// ./test/core/conversions.wast:179
assert_trap(
  () => invoke($0, `i64.trunc_f32_s`, [value("f32", -9223373000000000000)]),
  `integer overflow`,
);

// ./test/core/conversions.wast:180
assert_trap(() => invoke($0, `i64.trunc_f32_s`, [value("f32", Infinity)]), `integer overflow`);

// ./test/core/conversions.wast:181
assert_trap(() => invoke($0, `i64.trunc_f32_s`, [value("f32", -Infinity)]), `integer overflow`);

// ./test/core/conversions.wast:182
assert_trap(
  () => invoke($0, `i64.trunc_f32_s`, [bytes("f32", [0x0, 0x0, 0xc0, 0x7f])]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:183
assert_trap(
  () => invoke($0, `i64.trunc_f32_s`, [bytes("f32", [0x0, 0x0, 0xa0, 0x7f])]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:184
assert_trap(
  () => invoke($0, `i64.trunc_f32_s`, [bytes("f32", [0x0, 0x0, 0xc0, 0xff])]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:185
assert_trap(
  () => invoke($0, `i64.trunc_f32_s`, [bytes("f32", [0x0, 0x0, 0xa0, 0xff])]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:187
assert_return(() => invoke($0, `i64.trunc_f32_u`, [value("f32", 0)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:188
assert_return(() => invoke($0, `i64.trunc_f32_u`, [value("f32", -0)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:189
assert_return(
  () => invoke($0, `i64.trunc_f32_u`, [
    value("f32", 0.000000000000000000000000000000000000000000001),
  ]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:190
assert_return(
  () => invoke($0, `i64.trunc_f32_u`, [
    value("f32", -0.000000000000000000000000000000000000000000001),
  ]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:191
assert_return(() => invoke($0, `i64.trunc_f32_u`, [value("f32", 1)]), [value("i64", 1n)]);

// ./test/core/conversions.wast:192
assert_return(() => invoke($0, `i64.trunc_f32_u`, [value("f32", 1.1)]), [value("i64", 1n)]);

// ./test/core/conversions.wast:193
assert_return(() => invoke($0, `i64.trunc_f32_u`, [value("f32", 1.5)]), [value("i64", 1n)]);

// ./test/core/conversions.wast:194
assert_return(
  () => invoke($0, `i64.trunc_f32_u`, [value("f32", 4294967300)]),
  [value("i64", 4294967296n)],
);

// ./test/core/conversions.wast:195
assert_return(
  () => invoke($0, `i64.trunc_f32_u`, [value("f32", 18446743000000000000)]),
  [value("i64", -1099511627776n)],
);

// ./test/core/conversions.wast:196
assert_return(() => invoke($0, `i64.trunc_f32_u`, [value("f32", -0.9)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:197
assert_return(() => invoke($0, `i64.trunc_f32_u`, [value("f32", -0.99999994)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:198
assert_trap(
  () => invoke($0, `i64.trunc_f32_u`, [value("f32", 18446744000000000000)]),
  `integer overflow`,
);

// ./test/core/conversions.wast:199
assert_trap(() => invoke($0, `i64.trunc_f32_u`, [value("f32", -1)]), `integer overflow`);

// ./test/core/conversions.wast:200
assert_trap(() => invoke($0, `i64.trunc_f32_u`, [value("f32", Infinity)]), `integer overflow`);

// ./test/core/conversions.wast:201
assert_trap(() => invoke($0, `i64.trunc_f32_u`, [value("f32", -Infinity)]), `integer overflow`);

// ./test/core/conversions.wast:202
assert_trap(
  () => invoke($0, `i64.trunc_f32_u`, [bytes("f32", [0x0, 0x0, 0xc0, 0x7f])]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:203
assert_trap(
  () => invoke($0, `i64.trunc_f32_u`, [bytes("f32", [0x0, 0x0, 0xa0, 0x7f])]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:204
assert_trap(
  () => invoke($0, `i64.trunc_f32_u`, [bytes("f32", [0x0, 0x0, 0xc0, 0xff])]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:205
assert_trap(
  () => invoke($0, `i64.trunc_f32_u`, [bytes("f32", [0x0, 0x0, 0xa0, 0xff])]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:207
assert_return(() => invoke($0, `i64.trunc_f64_s`, [value("f64", 0)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:208
assert_return(() => invoke($0, `i64.trunc_f64_s`, [value("f64", -0)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:209
assert_return(
  () => invoke($0, `i64.trunc_f64_s`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:210
assert_return(
  () => invoke($0, `i64.trunc_f64_s`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:211
assert_return(() => invoke($0, `i64.trunc_f64_s`, [value("f64", 1)]), [value("i64", 1n)]);

// ./test/core/conversions.wast:212
assert_return(() => invoke($0, `i64.trunc_f64_s`, [value("f64", 1.1)]), [value("i64", 1n)]);

// ./test/core/conversions.wast:213
assert_return(() => invoke($0, `i64.trunc_f64_s`, [value("f64", 1.5)]), [value("i64", 1n)]);

// ./test/core/conversions.wast:214
assert_return(() => invoke($0, `i64.trunc_f64_s`, [value("f64", -1)]), [value("i64", -1n)]);

// ./test/core/conversions.wast:215
assert_return(() => invoke($0, `i64.trunc_f64_s`, [value("f64", -1.1)]), [value("i64", -1n)]);

// ./test/core/conversions.wast:216
assert_return(() => invoke($0, `i64.trunc_f64_s`, [value("f64", -1.5)]), [value("i64", -1n)]);

// ./test/core/conversions.wast:217
assert_return(() => invoke($0, `i64.trunc_f64_s`, [value("f64", -1.9)]), [value("i64", -1n)]);

// ./test/core/conversions.wast:218
assert_return(() => invoke($0, `i64.trunc_f64_s`, [value("f64", -2)]), [value("i64", -2n)]);

// ./test/core/conversions.wast:219
assert_return(
  () => invoke($0, `i64.trunc_f64_s`, [value("f64", 4294967296)]),
  [value("i64", 4294967296n)],
);

// ./test/core/conversions.wast:220
assert_return(
  () => invoke($0, `i64.trunc_f64_s`, [value("f64", -4294967296)]),
  [value("i64", -4294967296n)],
);

// ./test/core/conversions.wast:221
assert_return(
  () => invoke($0, `i64.trunc_f64_s`, [value("f64", 9223372036854775000)]),
  [value("i64", 9223372036854774784n)],
);

// ./test/core/conversions.wast:222
assert_return(
  () => invoke($0, `i64.trunc_f64_s`, [value("f64", -9223372036854776000)]),
  [value("i64", -9223372036854775808n)],
);

// ./test/core/conversions.wast:223
assert_trap(
  () => invoke($0, `i64.trunc_f64_s`, [value("f64", 9223372036854776000)]),
  `integer overflow`,
);

// ./test/core/conversions.wast:224
assert_trap(
  () => invoke($0, `i64.trunc_f64_s`, [value("f64", -9223372036854778000)]),
  `integer overflow`,
);

// ./test/core/conversions.wast:225
assert_trap(() => invoke($0, `i64.trunc_f64_s`, [value("f64", Infinity)]), `integer overflow`);

// ./test/core/conversions.wast:226
assert_trap(() => invoke($0, `i64.trunc_f64_s`, [value("f64", -Infinity)]), `integer overflow`);

// ./test/core/conversions.wast:227
assert_trap(
  () => invoke($0, `i64.trunc_f64_s`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:228
assert_trap(
  () => invoke($0, `i64.trunc_f64_s`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:229
assert_trap(
  () => invoke($0, `i64.trunc_f64_s`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:230
assert_trap(
  () => invoke($0, `i64.trunc_f64_s`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:232
assert_return(() => invoke($0, `i64.trunc_f64_u`, [value("f64", 0)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:233
assert_return(() => invoke($0, `i64.trunc_f64_u`, [value("f64", -0)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:234
assert_return(
  () => invoke($0, `i64.trunc_f64_u`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:235
assert_return(
  () => invoke($0, `i64.trunc_f64_u`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:236
assert_return(() => invoke($0, `i64.trunc_f64_u`, [value("f64", 1)]), [value("i64", 1n)]);

// ./test/core/conversions.wast:237
assert_return(() => invoke($0, `i64.trunc_f64_u`, [value("f64", 1.1)]), [value("i64", 1n)]);

// ./test/core/conversions.wast:238
assert_return(() => invoke($0, `i64.trunc_f64_u`, [value("f64", 1.5)]), [value("i64", 1n)]);

// ./test/core/conversions.wast:239
assert_return(
  () => invoke($0, `i64.trunc_f64_u`, [value("f64", 4294967295)]),
  [value("i64", 4294967295n)],
);

// ./test/core/conversions.wast:240
assert_return(
  () => invoke($0, `i64.trunc_f64_u`, [value("f64", 4294967296)]),
  [value("i64", 4294967296n)],
);

// ./test/core/conversions.wast:241
assert_return(
  () => invoke($0, `i64.trunc_f64_u`, [value("f64", 18446744073709550000)]),
  [value("i64", -2048n)],
);

// ./test/core/conversions.wast:242
assert_return(() => invoke($0, `i64.trunc_f64_u`, [value("f64", -0.9)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:243
assert_return(
  () => invoke($0, `i64.trunc_f64_u`, [value("f64", -0.9999999999999999)]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:244
assert_return(
  () => invoke($0, `i64.trunc_f64_u`, [value("f64", 100000000)]),
  [value("i64", 100000000n)],
);

// ./test/core/conversions.wast:245
assert_return(
  () => invoke($0, `i64.trunc_f64_u`, [value("f64", 10000000000000000)]),
  [value("i64", 10000000000000000n)],
);

// ./test/core/conversions.wast:246
assert_return(
  () => invoke($0, `i64.trunc_f64_u`, [value("f64", 9223372036854776000)]),
  [value("i64", -9223372036854775808n)],
);

// ./test/core/conversions.wast:247
assert_trap(
  () => invoke($0, `i64.trunc_f64_u`, [value("f64", 18446744073709552000)]),
  `integer overflow`,
);

// ./test/core/conversions.wast:248
assert_trap(() => invoke($0, `i64.trunc_f64_u`, [value("f64", -1)]), `integer overflow`);

// ./test/core/conversions.wast:249
assert_trap(() => invoke($0, `i64.trunc_f64_u`, [value("f64", Infinity)]), `integer overflow`);

// ./test/core/conversions.wast:250
assert_trap(() => invoke($0, `i64.trunc_f64_u`, [value("f64", -Infinity)]), `integer overflow`);

// ./test/core/conversions.wast:251
assert_trap(
  () => invoke($0, `i64.trunc_f64_u`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:252
assert_trap(
  () => invoke($0, `i64.trunc_f64_u`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:253
assert_trap(
  () => invoke($0, `i64.trunc_f64_u`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:254
assert_trap(
  () => invoke($0, `i64.trunc_f64_u`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  `invalid conversion to integer`,
);

// ./test/core/conversions.wast:256
assert_return(() => invoke($0, `f32.convert_i32_s`, [1]), [value("f32", 1)]);

// ./test/core/conversions.wast:257
assert_return(() => invoke($0, `f32.convert_i32_s`, [-1]), [value("f32", -1)]);

// ./test/core/conversions.wast:258
assert_return(() => invoke($0, `f32.convert_i32_s`, [0]), [value("f32", 0)]);

// ./test/core/conversions.wast:259
assert_return(() => invoke($0, `f32.convert_i32_s`, [2147483647]), [value("f32", 2147483600)]);

// ./test/core/conversions.wast:260
assert_return(() => invoke($0, `f32.convert_i32_s`, [-2147483648]), [value("f32", -2147483600)]);

// ./test/core/conversions.wast:261
assert_return(() => invoke($0, `f32.convert_i32_s`, [1234567890]), [value("f32", 1234568000)]);

// ./test/core/conversions.wast:265
assert_return(() => invoke($0, `i32.trunc_sat_f32_s`, [value("f32", 0)]), [value("i32", 0)]);

// ./test/core/conversions.wast:266
assert_return(() => invoke($0, `i32.trunc_sat_f32_s`, [value("f32", -0)]), [value("i32", 0)]);

// ./test/core/conversions.wast:267
assert_return(
  () => invoke($0, `i32.trunc_sat_f32_s`, [
    value("f32", 0.000000000000000000000000000000000000000000001),
  ]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:268
assert_return(
  () => invoke($0, `i32.trunc_sat_f32_s`, [
    value("f32", -0.000000000000000000000000000000000000000000001),
  ]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:269
assert_return(() => invoke($0, `i32.trunc_sat_f32_s`, [value("f32", 1)]), [value("i32", 1)]);

// ./test/core/conversions.wast:270
assert_return(() => invoke($0, `i32.trunc_sat_f32_s`, [value("f32", 1.1)]), [value("i32", 1)]);

// ./test/core/conversions.wast:271
assert_return(() => invoke($0, `i32.trunc_sat_f32_s`, [value("f32", 1.5)]), [value("i32", 1)]);

// ./test/core/conversions.wast:272
assert_return(() => invoke($0, `i32.trunc_sat_f32_s`, [value("f32", -1)]), [value("i32", -1)]);

// ./test/core/conversions.wast:273
assert_return(() => invoke($0, `i32.trunc_sat_f32_s`, [value("f32", -1.1)]), [value("i32", -1)]);

// ./test/core/conversions.wast:274
assert_return(() => invoke($0, `i32.trunc_sat_f32_s`, [value("f32", -1.5)]), [value("i32", -1)]);

// ./test/core/conversions.wast:275
assert_return(() => invoke($0, `i32.trunc_sat_f32_s`, [value("f32", -1.9)]), [value("i32", -1)]);

// ./test/core/conversions.wast:276
assert_return(() => invoke($0, `i32.trunc_sat_f32_s`, [value("f32", -2)]), [value("i32", -2)]);

// ./test/core/conversions.wast:277
assert_return(
  () => invoke($0, `i32.trunc_sat_f32_s`, [value("f32", 2147483500)]),
  [value("i32", 2147483520)],
);

// ./test/core/conversions.wast:278
assert_return(
  () => invoke($0, `i32.trunc_sat_f32_s`, [value("f32", -2147483600)]),
  [value("i32", -2147483648)],
);

// ./test/core/conversions.wast:279
assert_return(
  () => invoke($0, `i32.trunc_sat_f32_s`, [value("f32", 2147483600)]),
  [value("i32", 2147483647)],
);

// ./test/core/conversions.wast:280
assert_return(
  () => invoke($0, `i32.trunc_sat_f32_s`, [value("f32", -2147484000)]),
  [value("i32", -2147483648)],
);

// ./test/core/conversions.wast:281
assert_return(
  () => invoke($0, `i32.trunc_sat_f32_s`, [value("f32", Infinity)]),
  [value("i32", 2147483647)],
);

// ./test/core/conversions.wast:282
assert_return(
  () => invoke($0, `i32.trunc_sat_f32_s`, [value("f32", -Infinity)]),
  [value("i32", -2147483648)],
);

// ./test/core/conversions.wast:283
assert_return(
  () => invoke($0, `i32.trunc_sat_f32_s`, [bytes("f32", [0x0, 0x0, 0xc0, 0x7f])]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:284
assert_return(
  () => invoke($0, `i32.trunc_sat_f32_s`, [bytes("f32", [0x0, 0x0, 0xa0, 0x7f])]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:285
assert_return(
  () => invoke($0, `i32.trunc_sat_f32_s`, [bytes("f32", [0x0, 0x0, 0xc0, 0xff])]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:286
assert_return(
  () => invoke($0, `i32.trunc_sat_f32_s`, [bytes("f32", [0x0, 0x0, 0xa0, 0xff])]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:288
assert_return(() => invoke($0, `i32.trunc_sat_f32_u`, [value("f32", 0)]), [value("i32", 0)]);

// ./test/core/conversions.wast:289
assert_return(() => invoke($0, `i32.trunc_sat_f32_u`, [value("f32", -0)]), [value("i32", 0)]);

// ./test/core/conversions.wast:290
assert_return(
  () => invoke($0, `i32.trunc_sat_f32_u`, [
    value("f32", 0.000000000000000000000000000000000000000000001),
  ]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:291
assert_return(
  () => invoke($0, `i32.trunc_sat_f32_u`, [
    value("f32", -0.000000000000000000000000000000000000000000001),
  ]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:292
assert_return(() => invoke($0, `i32.trunc_sat_f32_u`, [value("f32", 1)]), [value("i32", 1)]);

// ./test/core/conversions.wast:293
assert_return(() => invoke($0, `i32.trunc_sat_f32_u`, [value("f32", 1.1)]), [value("i32", 1)]);

// ./test/core/conversions.wast:294
assert_return(() => invoke($0, `i32.trunc_sat_f32_u`, [value("f32", 1.5)]), [value("i32", 1)]);

// ./test/core/conversions.wast:295
assert_return(() => invoke($0, `i32.trunc_sat_f32_u`, [value("f32", 1.9)]), [value("i32", 1)]);

// ./test/core/conversions.wast:296
assert_return(() => invoke($0, `i32.trunc_sat_f32_u`, [value("f32", 2)]), [value("i32", 2)]);

// ./test/core/conversions.wast:297
assert_return(
  () => invoke($0, `i32.trunc_sat_f32_u`, [value("f32", 2147483600)]),
  [value("i32", -2147483648)],
);

// ./test/core/conversions.wast:298
assert_return(() => invoke($0, `i32.trunc_sat_f32_u`, [value("f32", 4294967000)]), [value("i32", -256)]);

// ./test/core/conversions.wast:299
assert_return(() => invoke($0, `i32.trunc_sat_f32_u`, [value("f32", -0.9)]), [value("i32", 0)]);

// ./test/core/conversions.wast:300
assert_return(() => invoke($0, `i32.trunc_sat_f32_u`, [value("f32", -0.99999994)]), [value("i32", 0)]);

// ./test/core/conversions.wast:301
assert_return(() => invoke($0, `i32.trunc_sat_f32_u`, [value("f32", 4294967300)]), [value("i32", -1)]);

// ./test/core/conversions.wast:302
assert_return(() => invoke($0, `i32.trunc_sat_f32_u`, [value("f32", -1)]), [value("i32", 0)]);

// ./test/core/conversions.wast:303
assert_return(() => invoke($0, `i32.trunc_sat_f32_u`, [value("f32", Infinity)]), [value("i32", -1)]);

// ./test/core/conversions.wast:304
assert_return(() => invoke($0, `i32.trunc_sat_f32_u`, [value("f32", -Infinity)]), [value("i32", 0)]);

// ./test/core/conversions.wast:305
assert_return(
  () => invoke($0, `i32.trunc_sat_f32_u`, [bytes("f32", [0x0, 0x0, 0xc0, 0x7f])]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:306
assert_return(
  () => invoke($0, `i32.trunc_sat_f32_u`, [bytes("f32", [0x0, 0x0, 0xa0, 0x7f])]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:307
assert_return(
  () => invoke($0, `i32.trunc_sat_f32_u`, [bytes("f32", [0x0, 0x0, 0xc0, 0xff])]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:308
assert_return(
  () => invoke($0, `i32.trunc_sat_f32_u`, [bytes("f32", [0x0, 0x0, 0xa0, 0xff])]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:310
assert_return(() => invoke($0, `i32.trunc_sat_f64_s`, [value("f64", 0)]), [value("i32", 0)]);

// ./test/core/conversions.wast:311
assert_return(() => invoke($0, `i32.trunc_sat_f64_s`, [value("f64", -0)]), [value("i32", 0)]);

// ./test/core/conversions.wast:312
assert_return(
  () => invoke($0, `i32.trunc_sat_f64_s`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:313
assert_return(
  () => invoke($0, `i32.trunc_sat_f64_s`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:314
assert_return(() => invoke($0, `i32.trunc_sat_f64_s`, [value("f64", 1)]), [value("i32", 1)]);

// ./test/core/conversions.wast:315
assert_return(() => invoke($0, `i32.trunc_sat_f64_s`, [value("f64", 1.1)]), [value("i32", 1)]);

// ./test/core/conversions.wast:316
assert_return(() => invoke($0, `i32.trunc_sat_f64_s`, [value("f64", 1.5)]), [value("i32", 1)]);

// ./test/core/conversions.wast:317
assert_return(() => invoke($0, `i32.trunc_sat_f64_s`, [value("f64", -1)]), [value("i32", -1)]);

// ./test/core/conversions.wast:318
assert_return(() => invoke($0, `i32.trunc_sat_f64_s`, [value("f64", -1.1)]), [value("i32", -1)]);

// ./test/core/conversions.wast:319
assert_return(() => invoke($0, `i32.trunc_sat_f64_s`, [value("f64", -1.5)]), [value("i32", -1)]);

// ./test/core/conversions.wast:320
assert_return(() => invoke($0, `i32.trunc_sat_f64_s`, [value("f64", -1.9)]), [value("i32", -1)]);

// ./test/core/conversions.wast:321
assert_return(() => invoke($0, `i32.trunc_sat_f64_s`, [value("f64", -2)]), [value("i32", -2)]);

// ./test/core/conversions.wast:322
assert_return(
  () => invoke($0, `i32.trunc_sat_f64_s`, [value("f64", 2147483647)]),
  [value("i32", 2147483647)],
);

// ./test/core/conversions.wast:323
assert_return(
  () => invoke($0, `i32.trunc_sat_f64_s`, [value("f64", -2147483648)]),
  [value("i32", -2147483648)],
);

// ./test/core/conversions.wast:324
assert_return(
  () => invoke($0, `i32.trunc_sat_f64_s`, [value("f64", 2147483648)]),
  [value("i32", 2147483647)],
);

// ./test/core/conversions.wast:325
assert_return(
  () => invoke($0, `i32.trunc_sat_f64_s`, [value("f64", -2147483649)]),
  [value("i32", -2147483648)],
);

// ./test/core/conversions.wast:326
assert_return(
  () => invoke($0, `i32.trunc_sat_f64_s`, [value("f64", Infinity)]),
  [value("i32", 2147483647)],
);

// ./test/core/conversions.wast:327
assert_return(
  () => invoke($0, `i32.trunc_sat_f64_s`, [value("f64", -Infinity)]),
  [value("i32", -2147483648)],
);

// ./test/core/conversions.wast:328
assert_return(
  () => invoke($0, `i32.trunc_sat_f64_s`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:329
assert_return(
  () => invoke($0, `i32.trunc_sat_f64_s`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:330
assert_return(
  () => invoke($0, `i32.trunc_sat_f64_s`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:331
assert_return(
  () => invoke($0, `i32.trunc_sat_f64_s`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:333
assert_return(() => invoke($0, `i32.trunc_sat_f64_u`, [value("f64", 0)]), [value("i32", 0)]);

// ./test/core/conversions.wast:334
assert_return(() => invoke($0, `i32.trunc_sat_f64_u`, [value("f64", -0)]), [value("i32", 0)]);

// ./test/core/conversions.wast:335
assert_return(
  () => invoke($0, `i32.trunc_sat_f64_u`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:336
assert_return(
  () => invoke($0, `i32.trunc_sat_f64_u`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:337
assert_return(() => invoke($0, `i32.trunc_sat_f64_u`, [value("f64", 1)]), [value("i32", 1)]);

// ./test/core/conversions.wast:338
assert_return(() => invoke($0, `i32.trunc_sat_f64_u`, [value("f64", 1.1)]), [value("i32", 1)]);

// ./test/core/conversions.wast:339
assert_return(() => invoke($0, `i32.trunc_sat_f64_u`, [value("f64", 1.5)]), [value("i32", 1)]);

// ./test/core/conversions.wast:340
assert_return(() => invoke($0, `i32.trunc_sat_f64_u`, [value("f64", 1.9)]), [value("i32", 1)]);

// ./test/core/conversions.wast:341
assert_return(() => invoke($0, `i32.trunc_sat_f64_u`, [value("f64", 2)]), [value("i32", 2)]);

// ./test/core/conversions.wast:342
assert_return(
  () => invoke($0, `i32.trunc_sat_f64_u`, [value("f64", 2147483648)]),
  [value("i32", -2147483648)],
);

// ./test/core/conversions.wast:343
assert_return(() => invoke($0, `i32.trunc_sat_f64_u`, [value("f64", 4294967295)]), [value("i32", -1)]);

// ./test/core/conversions.wast:344
assert_return(() => invoke($0, `i32.trunc_sat_f64_u`, [value("f64", -0.9)]), [value("i32", 0)]);

// ./test/core/conversions.wast:345
assert_return(
  () => invoke($0, `i32.trunc_sat_f64_u`, [value("f64", -0.9999999999999999)]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:346
assert_return(
  () => invoke($0, `i32.trunc_sat_f64_u`, [value("f64", 100000000)]),
  [value("i32", 100000000)],
);

// ./test/core/conversions.wast:347
assert_return(() => invoke($0, `i32.trunc_sat_f64_u`, [value("f64", 4294967296)]), [value("i32", -1)]);

// ./test/core/conversions.wast:348
assert_return(() => invoke($0, `i32.trunc_sat_f64_u`, [value("f64", -1)]), [value("i32", 0)]);

// ./test/core/conversions.wast:349
assert_return(
  () => invoke($0, `i32.trunc_sat_f64_u`, [value("f64", 10000000000000000)]),
  [value("i32", -1)],
);

// ./test/core/conversions.wast:350
assert_return(
  () => invoke($0, `i32.trunc_sat_f64_u`, [
    value("f64", 1000000000000000000000000000000),
  ]),
  [value("i32", -1)],
);

// ./test/core/conversions.wast:351
assert_return(
  () => invoke($0, `i32.trunc_sat_f64_u`, [value("f64", 9223372036854776000)]),
  [value("i32", -1)],
);

// ./test/core/conversions.wast:352
assert_return(() => invoke($0, `i32.trunc_sat_f64_u`, [value("f64", Infinity)]), [value("i32", -1)]);

// ./test/core/conversions.wast:353
assert_return(() => invoke($0, `i32.trunc_sat_f64_u`, [value("f64", -Infinity)]), [value("i32", 0)]);

// ./test/core/conversions.wast:354
assert_return(
  () => invoke($0, `i32.trunc_sat_f64_u`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:355
assert_return(
  () => invoke($0, `i32.trunc_sat_f64_u`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:356
assert_return(
  () => invoke($0, `i32.trunc_sat_f64_u`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:357
assert_return(
  () => invoke($0, `i32.trunc_sat_f64_u`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/conversions.wast:359
assert_return(() => invoke($0, `i64.trunc_sat_f32_s`, [value("f32", 0)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:360
assert_return(() => invoke($0, `i64.trunc_sat_f32_s`, [value("f32", -0)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:361
assert_return(
  () => invoke($0, `i64.trunc_sat_f32_s`, [
    value("f32", 0.000000000000000000000000000000000000000000001),
  ]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:362
assert_return(
  () => invoke($0, `i64.trunc_sat_f32_s`, [
    value("f32", -0.000000000000000000000000000000000000000000001),
  ]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:363
assert_return(() => invoke($0, `i64.trunc_sat_f32_s`, [value("f32", 1)]), [value("i64", 1n)]);

// ./test/core/conversions.wast:364
assert_return(() => invoke($0, `i64.trunc_sat_f32_s`, [value("f32", 1.1)]), [value("i64", 1n)]);

// ./test/core/conversions.wast:365
assert_return(() => invoke($0, `i64.trunc_sat_f32_s`, [value("f32", 1.5)]), [value("i64", 1n)]);

// ./test/core/conversions.wast:366
assert_return(() => invoke($0, `i64.trunc_sat_f32_s`, [value("f32", -1)]), [value("i64", -1n)]);

// ./test/core/conversions.wast:367
assert_return(() => invoke($0, `i64.trunc_sat_f32_s`, [value("f32", -1.1)]), [value("i64", -1n)]);

// ./test/core/conversions.wast:368
assert_return(() => invoke($0, `i64.trunc_sat_f32_s`, [value("f32", -1.5)]), [value("i64", -1n)]);

// ./test/core/conversions.wast:369
assert_return(() => invoke($0, `i64.trunc_sat_f32_s`, [value("f32", -1.9)]), [value("i64", -1n)]);

// ./test/core/conversions.wast:370
assert_return(() => invoke($0, `i64.trunc_sat_f32_s`, [value("f32", -2)]), [value("i64", -2n)]);

// ./test/core/conversions.wast:371
assert_return(
  () => invoke($0, `i64.trunc_sat_f32_s`, [value("f32", 4294967300)]),
  [value("i64", 4294967296n)],
);

// ./test/core/conversions.wast:372
assert_return(
  () => invoke($0, `i64.trunc_sat_f32_s`, [value("f32", -4294967300)]),
  [value("i64", -4294967296n)],
);

// ./test/core/conversions.wast:373
assert_return(
  () => invoke($0, `i64.trunc_sat_f32_s`, [value("f32", 9223371500000000000)]),
  [value("i64", 9223371487098961920n)],
);

// ./test/core/conversions.wast:374
assert_return(
  () => invoke($0, `i64.trunc_sat_f32_s`, [value("f32", -9223372000000000000)]),
  [value("i64", -9223372036854775808n)],
);

// ./test/core/conversions.wast:375
assert_return(
  () => invoke($0, `i64.trunc_sat_f32_s`, [value("f32", 9223372000000000000)]),
  [value("i64", 9223372036854775807n)],
);

// ./test/core/conversions.wast:376
assert_return(
  () => invoke($0, `i64.trunc_sat_f32_s`, [value("f32", -9223373000000000000)]),
  [value("i64", -9223372036854775808n)],
);

// ./test/core/conversions.wast:377
assert_return(
  () => invoke($0, `i64.trunc_sat_f32_s`, [value("f32", Infinity)]),
  [value("i64", 9223372036854775807n)],
);

// ./test/core/conversions.wast:378
assert_return(
  () => invoke($0, `i64.trunc_sat_f32_s`, [value("f32", -Infinity)]),
  [value("i64", -9223372036854775808n)],
);

// ./test/core/conversions.wast:379
assert_return(
  () => invoke($0, `i64.trunc_sat_f32_s`, [bytes("f32", [0x0, 0x0, 0xc0, 0x7f])]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:380
assert_return(
  () => invoke($0, `i64.trunc_sat_f32_s`, [bytes("f32", [0x0, 0x0, 0xa0, 0x7f])]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:381
assert_return(
  () => invoke($0, `i64.trunc_sat_f32_s`, [bytes("f32", [0x0, 0x0, 0xc0, 0xff])]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:382
assert_return(
  () => invoke($0, `i64.trunc_sat_f32_s`, [bytes("f32", [0x0, 0x0, 0xa0, 0xff])]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:384
assert_return(() => invoke($0, `i64.trunc_sat_f32_u`, [value("f32", 0)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:385
assert_return(() => invoke($0, `i64.trunc_sat_f32_u`, [value("f32", -0)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:386
assert_return(
  () => invoke($0, `i64.trunc_sat_f32_u`, [
    value("f32", 0.000000000000000000000000000000000000000000001),
  ]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:387
assert_return(
  () => invoke($0, `i64.trunc_sat_f32_u`, [
    value("f32", -0.000000000000000000000000000000000000000000001),
  ]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:388
assert_return(() => invoke($0, `i64.trunc_sat_f32_u`, [value("f32", 1)]), [value("i64", 1n)]);

// ./test/core/conversions.wast:389
assert_return(() => invoke($0, `i64.trunc_sat_f32_u`, [value("f32", 1.1)]), [value("i64", 1n)]);

// ./test/core/conversions.wast:390
assert_return(() => invoke($0, `i64.trunc_sat_f32_u`, [value("f32", 1.5)]), [value("i64", 1n)]);

// ./test/core/conversions.wast:391
assert_return(
  () => invoke($0, `i64.trunc_sat_f32_u`, [value("f32", 4294967300)]),
  [value("i64", 4294967296n)],
);

// ./test/core/conversions.wast:392
assert_return(
  () => invoke($0, `i64.trunc_sat_f32_u`, [value("f32", 18446743000000000000)]),
  [value("i64", -1099511627776n)],
);

// ./test/core/conversions.wast:393
assert_return(() => invoke($0, `i64.trunc_sat_f32_u`, [value("f32", -0.9)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:394
assert_return(() => invoke($0, `i64.trunc_sat_f32_u`, [value("f32", -0.99999994)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:395
assert_return(
  () => invoke($0, `i64.trunc_sat_f32_u`, [value("f32", 18446744000000000000)]),
  [value("i64", -1n)],
);

// ./test/core/conversions.wast:396
assert_return(() => invoke($0, `i64.trunc_sat_f32_u`, [value("f32", -1)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:397
assert_return(() => invoke($0, `i64.trunc_sat_f32_u`, [value("f32", Infinity)]), [value("i64", -1n)]);

// ./test/core/conversions.wast:398
assert_return(() => invoke($0, `i64.trunc_sat_f32_u`, [value("f32", -Infinity)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:399
assert_return(
  () => invoke($0, `i64.trunc_sat_f32_u`, [bytes("f32", [0x0, 0x0, 0xc0, 0x7f])]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:400
assert_return(
  () => invoke($0, `i64.trunc_sat_f32_u`, [bytes("f32", [0x0, 0x0, 0xa0, 0x7f])]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:401
assert_return(
  () => invoke($0, `i64.trunc_sat_f32_u`, [bytes("f32", [0x0, 0x0, 0xc0, 0xff])]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:402
assert_return(
  () => invoke($0, `i64.trunc_sat_f32_u`, [bytes("f32", [0x0, 0x0, 0xa0, 0xff])]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:404
assert_return(() => invoke($0, `i64.trunc_sat_f64_s`, [value("f64", 0)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:405
assert_return(() => invoke($0, `i64.trunc_sat_f64_s`, [value("f64", -0)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:406
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_s`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:407
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_s`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:408
assert_return(() => invoke($0, `i64.trunc_sat_f64_s`, [value("f64", 1)]), [value("i64", 1n)]);

// ./test/core/conversions.wast:409
assert_return(() => invoke($0, `i64.trunc_sat_f64_s`, [value("f64", 1.1)]), [value("i64", 1n)]);

// ./test/core/conversions.wast:410
assert_return(() => invoke($0, `i64.trunc_sat_f64_s`, [value("f64", 1.5)]), [value("i64", 1n)]);

// ./test/core/conversions.wast:411
assert_return(() => invoke($0, `i64.trunc_sat_f64_s`, [value("f64", -1)]), [value("i64", -1n)]);

// ./test/core/conversions.wast:412
assert_return(() => invoke($0, `i64.trunc_sat_f64_s`, [value("f64", -1.1)]), [value("i64", -1n)]);

// ./test/core/conversions.wast:413
assert_return(() => invoke($0, `i64.trunc_sat_f64_s`, [value("f64", -1.5)]), [value("i64", -1n)]);

// ./test/core/conversions.wast:414
assert_return(() => invoke($0, `i64.trunc_sat_f64_s`, [value("f64", -1.9)]), [value("i64", -1n)]);

// ./test/core/conversions.wast:415
assert_return(() => invoke($0, `i64.trunc_sat_f64_s`, [value("f64", -2)]), [value("i64", -2n)]);

// ./test/core/conversions.wast:416
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_s`, [value("f64", 4294967296)]),
  [value("i64", 4294967296n)],
);

// ./test/core/conversions.wast:417
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_s`, [value("f64", -4294967296)]),
  [value("i64", -4294967296n)],
);

// ./test/core/conversions.wast:418
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_s`, [value("f64", 9223372036854775000)]),
  [value("i64", 9223372036854774784n)],
);

// ./test/core/conversions.wast:419
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_s`, [value("f64", -9223372036854776000)]),
  [value("i64", -9223372036854775808n)],
);

// ./test/core/conversions.wast:420
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_s`, [value("f64", 9223372036854776000)]),
  [value("i64", 9223372036854775807n)],
);

// ./test/core/conversions.wast:421
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_s`, [value("f64", -9223372036854778000)]),
  [value("i64", -9223372036854775808n)],
);

// ./test/core/conversions.wast:422
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_s`, [value("f64", Infinity)]),
  [value("i64", 9223372036854775807n)],
);

// ./test/core/conversions.wast:423
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_s`, [value("f64", -Infinity)]),
  [value("i64", -9223372036854775808n)],
);

// ./test/core/conversions.wast:424
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_s`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:425
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_s`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:426
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_s`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:427
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_s`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:429
assert_return(() => invoke($0, `i64.trunc_sat_f64_u`, [value("f64", 0)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:430
assert_return(() => invoke($0, `i64.trunc_sat_f64_u`, [value("f64", -0)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:431
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_u`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:432
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_u`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:433
assert_return(() => invoke($0, `i64.trunc_sat_f64_u`, [value("f64", 1)]), [value("i64", 1n)]);

// ./test/core/conversions.wast:434
assert_return(() => invoke($0, `i64.trunc_sat_f64_u`, [value("f64", 1.1)]), [value("i64", 1n)]);

// ./test/core/conversions.wast:435
assert_return(() => invoke($0, `i64.trunc_sat_f64_u`, [value("f64", 1.5)]), [value("i64", 1n)]);

// ./test/core/conversions.wast:436
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_u`, [value("f64", 4294967295)]),
  [value("i64", 4294967295n)],
);

// ./test/core/conversions.wast:437
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_u`, [value("f64", 4294967296)]),
  [value("i64", 4294967296n)],
);

// ./test/core/conversions.wast:438
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_u`, [value("f64", 18446744073709550000)]),
  [value("i64", -2048n)],
);

// ./test/core/conversions.wast:439
assert_return(() => invoke($0, `i64.trunc_sat_f64_u`, [value("f64", -0.9)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:440
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_u`, [value("f64", -0.9999999999999999)]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:441
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_u`, [value("f64", 100000000)]),
  [value("i64", 100000000n)],
);

// ./test/core/conversions.wast:442
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_u`, [value("f64", 10000000000000000)]),
  [value("i64", 10000000000000000n)],
);

// ./test/core/conversions.wast:443
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_u`, [value("f64", 9223372036854776000)]),
  [value("i64", -9223372036854775808n)],
);

// ./test/core/conversions.wast:444
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_u`, [value("f64", 18446744073709552000)]),
  [value("i64", -1n)],
);

// ./test/core/conversions.wast:445
assert_return(() => invoke($0, `i64.trunc_sat_f64_u`, [value("f64", -1)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:446
assert_return(() => invoke($0, `i64.trunc_sat_f64_u`, [value("f64", Infinity)]), [value("i64", -1n)]);

// ./test/core/conversions.wast:447
assert_return(() => invoke($0, `i64.trunc_sat_f64_u`, [value("f64", -Infinity)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:448
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_u`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:449
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_u`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:450
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_u`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:451
assert_return(
  () => invoke($0, `i64.trunc_sat_f64_u`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i64", 0n)],
);

// ./test/core/conversions.wast:454
assert_return(() => invoke($0, `f32.convert_i32_s`, [16777217]), [value("f32", 16777216)]);

// ./test/core/conversions.wast:455
assert_return(() => invoke($0, `f32.convert_i32_s`, [-16777217]), [value("f32", -16777216)]);

// ./test/core/conversions.wast:456
assert_return(() => invoke($0, `f32.convert_i32_s`, [16777219]), [value("f32", 16777220)]);

// ./test/core/conversions.wast:457
assert_return(() => invoke($0, `f32.convert_i32_s`, [-16777219]), [value("f32", -16777220)]);

// ./test/core/conversions.wast:459
assert_return(() => invoke($0, `f32.convert_i64_s`, [1n]), [value("f32", 1)]);

// ./test/core/conversions.wast:460
assert_return(() => invoke($0, `f32.convert_i64_s`, [-1n]), [value("f32", -1)]);

// ./test/core/conversions.wast:461
assert_return(() => invoke($0, `f32.convert_i64_s`, [0n]), [value("f32", 0)]);

// ./test/core/conversions.wast:462
assert_return(
  () => invoke($0, `f32.convert_i64_s`, [9223372036854775807n]),
  [value("f32", 9223372000000000000)],
);

// ./test/core/conversions.wast:463
assert_return(
  () => invoke($0, `f32.convert_i64_s`, [-9223372036854775808n]),
  [value("f32", -9223372000000000000)],
);

// ./test/core/conversions.wast:464
assert_return(
  () => invoke($0, `f32.convert_i64_s`, [314159265358979n]),
  [value("f32", 314159280000000)],
);

// ./test/core/conversions.wast:466
assert_return(() => invoke($0, `f32.convert_i64_s`, [16777217n]), [value("f32", 16777216)]);

// ./test/core/conversions.wast:467
assert_return(() => invoke($0, `f32.convert_i64_s`, [-16777217n]), [value("f32", -16777216)]);

// ./test/core/conversions.wast:468
assert_return(() => invoke($0, `f32.convert_i64_s`, [16777219n]), [value("f32", 16777220)]);

// ./test/core/conversions.wast:469
assert_return(() => invoke($0, `f32.convert_i64_s`, [-16777219n]), [value("f32", -16777220)]);

// ./test/core/conversions.wast:471
assert_return(
  () => invoke($0, `f32.convert_i64_s`, [9223371212221054977n]),
  [value("f32", 9223371500000000000)],
);

// ./test/core/conversions.wast:472
assert_return(
  () => invoke($0, `f32.convert_i64_s`, [-9223371761976868863n]),
  [value("f32", -9223371500000000000)],
);

// ./test/core/conversions.wast:473
assert_return(
  () => invoke($0, `f32.convert_i64_s`, [9007199791611905n]),
  [value("f32", 9007200000000000)],
);

// ./test/core/conversions.wast:474
assert_return(
  () => invoke($0, `f32.convert_i64_s`, [-9007199791611905n]),
  [value("f32", -9007200000000000)],
);

// ./test/core/conversions.wast:476
assert_return(() => invoke($0, `f64.convert_i32_s`, [1]), [value("f64", 1)]);

// ./test/core/conversions.wast:477
assert_return(() => invoke($0, `f64.convert_i32_s`, [-1]), [value("f64", -1)]);

// ./test/core/conversions.wast:478
assert_return(() => invoke($0, `f64.convert_i32_s`, [0]), [value("f64", 0)]);

// ./test/core/conversions.wast:479
assert_return(() => invoke($0, `f64.convert_i32_s`, [2147483647]), [value("f64", 2147483647)]);

// ./test/core/conversions.wast:480
assert_return(() => invoke($0, `f64.convert_i32_s`, [-2147483648]), [value("f64", -2147483648)]);

// ./test/core/conversions.wast:481
assert_return(() => invoke($0, `f64.convert_i32_s`, [987654321]), [value("f64", 987654321)]);

// ./test/core/conversions.wast:483
assert_return(() => invoke($0, `f64.convert_i64_s`, [1n]), [value("f64", 1)]);

// ./test/core/conversions.wast:484
assert_return(() => invoke($0, `f64.convert_i64_s`, [-1n]), [value("f64", -1)]);

// ./test/core/conversions.wast:485
assert_return(() => invoke($0, `f64.convert_i64_s`, [0n]), [value("f64", 0)]);

// ./test/core/conversions.wast:486
assert_return(
  () => invoke($0, `f64.convert_i64_s`, [9223372036854775807n]),
  [value("f64", 9223372036854776000)],
);

// ./test/core/conversions.wast:487
assert_return(
  () => invoke($0, `f64.convert_i64_s`, [-9223372036854775808n]),
  [value("f64", -9223372036854776000)],
);

// ./test/core/conversions.wast:488
assert_return(
  () => invoke($0, `f64.convert_i64_s`, [4669201609102990n]),
  [value("f64", 4669201609102990)],
);

// ./test/core/conversions.wast:490
assert_return(
  () => invoke($0, `f64.convert_i64_s`, [9007199254740993n]),
  [value("f64", 9007199254740992)],
);

// ./test/core/conversions.wast:491
assert_return(
  () => invoke($0, `f64.convert_i64_s`, [-9007199254740993n]),
  [value("f64", -9007199254740992)],
);

// ./test/core/conversions.wast:492
assert_return(
  () => invoke($0, `f64.convert_i64_s`, [9007199254740995n]),
  [value("f64", 9007199254740996)],
);

// ./test/core/conversions.wast:493
assert_return(
  () => invoke($0, `f64.convert_i64_s`, [-9007199254740995n]),
  [value("f64", -9007199254740996)],
);

// ./test/core/conversions.wast:495
assert_return(() => invoke($0, `f32.convert_i32_u`, [1]), [value("f32", 1)]);

// ./test/core/conversions.wast:496
assert_return(() => invoke($0, `f32.convert_i32_u`, [0]), [value("f32", 0)]);

// ./test/core/conversions.wast:497
assert_return(() => invoke($0, `f32.convert_i32_u`, [2147483647]), [value("f32", 2147483600)]);

// ./test/core/conversions.wast:498
assert_return(() => invoke($0, `f32.convert_i32_u`, [-2147483648]), [value("f32", 2147483600)]);

// ./test/core/conversions.wast:499
assert_return(() => invoke($0, `f32.convert_i32_u`, [305419896]), [value("f32", 305419900)]);

// ./test/core/conversions.wast:500
assert_return(() => invoke($0, `f32.convert_i32_u`, [-1]), [value("f32", 4294967300)]);

// ./test/core/conversions.wast:501
assert_return(() => invoke($0, `f32.convert_i32_u`, [-2147483520]), [value("f32", 2147483600)]);

// ./test/core/conversions.wast:502
assert_return(() => invoke($0, `f32.convert_i32_u`, [-2147483519]), [value("f32", 2147484000)]);

// ./test/core/conversions.wast:503
assert_return(() => invoke($0, `f32.convert_i32_u`, [-2147483518]), [value("f32", 2147484000)]);

// ./test/core/conversions.wast:504
assert_return(() => invoke($0, `f32.convert_i32_u`, [-384]), [value("f32", 4294966800)]);

// ./test/core/conversions.wast:505
assert_return(() => invoke($0, `f32.convert_i32_u`, [-383]), [value("f32", 4294967000)]);

// ./test/core/conversions.wast:506
assert_return(() => invoke($0, `f32.convert_i32_u`, [-382]), [value("f32", 4294967000)]);

// ./test/core/conversions.wast:508
assert_return(() => invoke($0, `f32.convert_i32_u`, [16777217]), [value("f32", 16777216)]);

// ./test/core/conversions.wast:509
assert_return(() => invoke($0, `f32.convert_i32_u`, [16777219]), [value("f32", 16777220)]);

// ./test/core/conversions.wast:511
assert_return(() => invoke($0, `f32.convert_i64_u`, [1n]), [value("f32", 1)]);

// ./test/core/conversions.wast:512
assert_return(() => invoke($0, `f32.convert_i64_u`, [0n]), [value("f32", 0)]);

// ./test/core/conversions.wast:513
assert_return(
  () => invoke($0, `f32.convert_i64_u`, [9223372036854775807n]),
  [value("f32", 9223372000000000000)],
);

// ./test/core/conversions.wast:514
assert_return(
  () => invoke($0, `f32.convert_i64_u`, [-9223372036854775808n]),
  [value("f32", 9223372000000000000)],
);

// ./test/core/conversions.wast:515
assert_return(() => invoke($0, `f32.convert_i64_u`, [-1n]), [value("f32", 18446744000000000000)]);

// ./test/core/conversions.wast:517
assert_return(() => invoke($0, `f32.convert_i64_u`, [16777217n]), [value("f32", 16777216)]);

// ./test/core/conversions.wast:518
assert_return(() => invoke($0, `f32.convert_i64_u`, [16777219n]), [value("f32", 16777220)]);

// ./test/core/conversions.wast:520
assert_return(
  () => invoke($0, `f32.convert_i64_u`, [9007199791611905n]),
  [value("f32", 9007200000000000)],
);

// ./test/core/conversions.wast:521
assert_return(
  () => invoke($0, `f32.convert_i64_u`, [9223371761976868863n]),
  [value("f32", 9223371500000000000)],
);

// ./test/core/conversions.wast:522
assert_return(
  () => invoke($0, `f32.convert_i64_u`, [-9223371487098961919n]),
  [value("f32", 9223373000000000000)],
);

// ./test/core/conversions.wast:523
assert_return(
  () => invoke($0, `f32.convert_i64_u`, [-1649267441663n]),
  [value("f32", 18446743000000000000)],
);

// ./test/core/conversions.wast:525
assert_return(() => invoke($0, `f64.convert_i32_u`, [1]), [value("f64", 1)]);

// ./test/core/conversions.wast:526
assert_return(() => invoke($0, `f64.convert_i32_u`, [0]), [value("f64", 0)]);

// ./test/core/conversions.wast:527
assert_return(() => invoke($0, `f64.convert_i32_u`, [2147483647]), [value("f64", 2147483647)]);

// ./test/core/conversions.wast:528
assert_return(() => invoke($0, `f64.convert_i32_u`, [-2147483648]), [value("f64", 2147483648)]);

// ./test/core/conversions.wast:529
assert_return(() => invoke($0, `f64.convert_i32_u`, [-1]), [value("f64", 4294967295)]);

// ./test/core/conversions.wast:531
assert_return(() => invoke($0, `f64.convert_i64_u`, [1n]), [value("f64", 1)]);

// ./test/core/conversions.wast:532
assert_return(() => invoke($0, `f64.convert_i64_u`, [0n]), [value("f64", 0)]);

// ./test/core/conversions.wast:533
assert_return(
  () => invoke($0, `f64.convert_i64_u`, [9223372036854775807n]),
  [value("f64", 9223372036854776000)],
);

// ./test/core/conversions.wast:534
assert_return(
  () => invoke($0, `f64.convert_i64_u`, [-9223372036854775808n]),
  [value("f64", 9223372036854776000)],
);

// ./test/core/conversions.wast:535
assert_return(() => invoke($0, `f64.convert_i64_u`, [-1n]), [value("f64", 18446744073709552000)]);

// ./test/core/conversions.wast:536
assert_return(
  () => invoke($0, `f64.convert_i64_u`, [-9223372036854774784n]),
  [value("f64", 9223372036854776000)],
);

// ./test/core/conversions.wast:537
assert_return(
  () => invoke($0, `f64.convert_i64_u`, [-9223372036854774783n]),
  [value("f64", 9223372036854778000)],
);

// ./test/core/conversions.wast:538
assert_return(
  () => invoke($0, `f64.convert_i64_u`, [-9223372036854774782n]),
  [value("f64", 9223372036854778000)],
);

// ./test/core/conversions.wast:539
assert_return(() => invoke($0, `f64.convert_i64_u`, [-3072n]), [value("f64", 18446744073709548000)]);

// ./test/core/conversions.wast:540
assert_return(() => invoke($0, `f64.convert_i64_u`, [-3071n]), [value("f64", 18446744073709550000)]);

// ./test/core/conversions.wast:541
assert_return(() => invoke($0, `f64.convert_i64_u`, [-3070n]), [value("f64", 18446744073709550000)]);

// ./test/core/conversions.wast:543
assert_return(
  () => invoke($0, `f64.convert_i64_u`, [9007199254740993n]),
  [value("f64", 9007199254740992)],
);

// ./test/core/conversions.wast:544
assert_return(
  () => invoke($0, `f64.convert_i64_u`, [9007199254740995n]),
  [value("f64", 9007199254740996)],
);

// ./test/core/conversions.wast:546
assert_return(() => invoke($0, `f64.promote_f32`, [value("f32", 0)]), [value("f64", 0)]);

// ./test/core/conversions.wast:547
assert_return(() => invoke($0, `f64.promote_f32`, [value("f32", -0)]), [value("f64", -0)]);

// ./test/core/conversions.wast:548
assert_return(
  () => invoke($0, `f64.promote_f32`, [
    value("f32", 0.000000000000000000000000000000000000000000001),
  ]),
  [value("f64", 0.000000000000000000000000000000000000000000001401298464324817)],
);

// ./test/core/conversions.wast:549
assert_return(
  () => invoke($0, `f64.promote_f32`, [
    value("f32", -0.000000000000000000000000000000000000000000001),
  ]),
  [
    value("f64", -0.000000000000000000000000000000000000000000001401298464324817),
  ],
);

// ./test/core/conversions.wast:550
assert_return(() => invoke($0, `f64.promote_f32`, [value("f32", 1)]), [value("f64", 1)]);

// ./test/core/conversions.wast:551
assert_return(() => invoke($0, `f64.promote_f32`, [value("f32", -1)]), [value("f64", -1)]);

// ./test/core/conversions.wast:552
assert_return(
  () => invoke($0, `f64.promote_f32`, [
    value("f32", -340282350000000000000000000000000000000),
  ]),
  [value("f64", -340282346638528860000000000000000000000)],
);

// ./test/core/conversions.wast:553
assert_return(
  () => invoke($0, `f64.promote_f32`, [
    value("f32", 340282350000000000000000000000000000000),
  ]),
  [value("f64", 340282346638528860000000000000000000000)],
);

// ./test/core/conversions.wast:555
assert_return(
  () => invoke($0, `f64.promote_f32`, [
    value("f32", 0.0000000000000000000000000000000000015046328),
  ]),
  [value("f64", 0.000000000000000000000000000000000001504632769052528)],
);

// ./test/core/conversions.wast:557
assert_return(
  () => invoke($0, `f64.promote_f32`, [
    value("f32", 66382537000000000000000000000000000000),
  ]),
  [value("f64", 66382536710104395000000000000000000000)],
);

// ./test/core/conversions.wast:558
assert_return(() => invoke($0, `f64.promote_f32`, [value("f32", Infinity)]), [value("f64", Infinity)]);

// ./test/core/conversions.wast:559
assert_return(() => invoke($0, `f64.promote_f32`, [value("f32", -Infinity)]), [value("f64", -Infinity)]);

// ./test/core/conversions.wast:560
assert_return(
  () => invoke($0, `f64.promote_f32`, [bytes("f32", [0x0, 0x0, 0xc0, 0x7f])]),
  [`canonical_nan`],
);

// ./test/core/conversions.wast:561
assert_return(
  () => invoke($0, `f64.promote_f32`, [bytes("f32", [0x0, 0x0, 0xa0, 0x7f])]),
  [`arithmetic_nan`],
);

// ./test/core/conversions.wast:562
assert_return(
  () => invoke($0, `f64.promote_f32`, [bytes("f32", [0x0, 0x0, 0xc0, 0xff])]),
  [`canonical_nan`],
);

// ./test/core/conversions.wast:563
assert_return(
  () => invoke($0, `f64.promote_f32`, [bytes("f32", [0x0, 0x0, 0xa0, 0xff])]),
  [`arithmetic_nan`],
);

// ./test/core/conversions.wast:565
assert_return(() => invoke($0, `f32.demote_f64`, [value("f64", 0)]), [value("f32", 0)]);

// ./test/core/conversions.wast:566
assert_return(() => invoke($0, `f32.demote_f64`, [value("f64", -0)]), [value("f32", -0)]);

// ./test/core/conversions.wast:567
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("f32", 0)],
);

// ./test/core/conversions.wast:568
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("f32", -0)],
);

// ./test/core/conversions.wast:569
assert_return(() => invoke($0, `f32.demote_f64`, [value("f64", 1)]), [value("f32", 1)]);

// ./test/core/conversions.wast:570
assert_return(() => invoke($0, `f32.demote_f64`, [value("f64", -1)]), [value("f32", -1)]);

// ./test/core/conversions.wast:571
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", 0.000000000000000000000000000000000000011754942807573643),
  ]),
  [value("f32", 0.000000000000000000000000000000000000011754944)],
);

// ./test/core/conversions.wast:572
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", -0.000000000000000000000000000000000000011754942807573643),
  ]),
  [value("f32", -0.000000000000000000000000000000000000011754944)],
);

// ./test/core/conversions.wast:573
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", 0.000000000000000000000000000000000000011754942807573642),
  ]),
  [value("f32", 0.000000000000000000000000000000000000011754942)],
);

// ./test/core/conversions.wast:574
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", -0.000000000000000000000000000000000000011754942807573642),
  ]),
  [value("f32", -0.000000000000000000000000000000000000011754942)],
);

// ./test/core/conversions.wast:575
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", 0.000000000000000000000000000000000000000000001401298464324817),
  ]),
  [value("f32", 0.000000000000000000000000000000000000000000001)],
);

// ./test/core/conversions.wast:576
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", -0.000000000000000000000000000000000000000000001401298464324817),
  ]),
  [value("f32", -0.000000000000000000000000000000000000000000001)],
);

// ./test/core/conversions.wast:577
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", 340282336497324060000000000000000000000),
  ]),
  [value("f32", 340282330000000000000000000000000000000)],
);

// ./test/core/conversions.wast:578
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", -340282336497324060000000000000000000000),
  ]),
  [value("f32", -340282330000000000000000000000000000000)],
);

// ./test/core/conversions.wast:579
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", 340282336497324100000000000000000000000),
  ]),
  [value("f32", 340282350000000000000000000000000000000)],
);

// ./test/core/conversions.wast:580
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", -340282336497324100000000000000000000000),
  ]),
  [value("f32", -340282350000000000000000000000000000000)],
);

// ./test/core/conversions.wast:581
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", 340282346638528860000000000000000000000),
  ]),
  [value("f32", 340282350000000000000000000000000000000)],
);

// ./test/core/conversions.wast:582
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", -340282346638528860000000000000000000000),
  ]),
  [value("f32", -340282350000000000000000000000000000000)],
);

// ./test/core/conversions.wast:583
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", 340282356779733620000000000000000000000),
  ]),
  [value("f32", 340282350000000000000000000000000000000)],
);

// ./test/core/conversions.wast:584
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", -340282356779733620000000000000000000000),
  ]),
  [value("f32", -340282350000000000000000000000000000000)],
);

// ./test/core/conversions.wast:585
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", 340282356779733660000000000000000000000),
  ]),
  [value("f32", Infinity)],
);

// ./test/core/conversions.wast:586
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", -340282356779733660000000000000000000000),
  ]),
  [value("f32", -Infinity)],
);

// ./test/core/conversions.wast:587
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", 0.000000000000000000000000000000000001504632769052528),
  ]),
  [value("f32", 0.0000000000000000000000000000000000015046328)],
);

// ./test/core/conversions.wast:588
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", 66382536710104395000000000000000000000),
  ]),
  [value("f32", 66382537000000000000000000000000000000)],
);

// ./test/core/conversions.wast:589
assert_return(() => invoke($0, `f32.demote_f64`, [value("f64", Infinity)]), [value("f32", Infinity)]);

// ./test/core/conversions.wast:590
assert_return(() => invoke($0, `f32.demote_f64`, [value("f64", -Infinity)]), [value("f32", -Infinity)]);

// ./test/core/conversions.wast:591
assert_return(() => invoke($0, `f32.demote_f64`, [value("f64", 1.0000000000000002)]), [value("f32", 1)]);

// ./test/core/conversions.wast:592
assert_return(() => invoke($0, `f32.demote_f64`, [value("f64", 0.9999999999999999)]), [value("f32", 1)]);

// ./test/core/conversions.wast:593
assert_return(() => invoke($0, `f32.demote_f64`, [value("f64", 1.0000000596046448)]), [value("f32", 1)]);

// ./test/core/conversions.wast:594
assert_return(
  () => invoke($0, `f32.demote_f64`, [value("f64", 1.000000059604645)]),
  [value("f32", 1.0000001)],
);

// ./test/core/conversions.wast:595
assert_return(
  () => invoke($0, `f32.demote_f64`, [value("f64", 1.000000178813934)]),
  [value("f32", 1.0000001)],
);

// ./test/core/conversions.wast:596
assert_return(
  () => invoke($0, `f32.demote_f64`, [value("f64", 1.0000001788139343)]),
  [value("f32", 1.0000002)],
);

// ./test/core/conversions.wast:597
assert_return(
  () => invoke($0, `f32.demote_f64`, [value("f64", 1.0000002980232239)]),
  [value("f32", 1.0000002)],
);

// ./test/core/conversions.wast:598
assert_return(() => invoke($0, `f32.demote_f64`, [value("f64", 16777217)]), [value("f32", 16777216)]);

// ./test/core/conversions.wast:599
assert_return(
  () => invoke($0, `f32.demote_f64`, [value("f64", 16777217.000000004)]),
  [value("f32", 16777218)],
);

// ./test/core/conversions.wast:600
assert_return(
  () => invoke($0, `f32.demote_f64`, [value("f64", 16777218.999999996)]),
  [value("f32", 16777218)],
);

// ./test/core/conversions.wast:601
assert_return(() => invoke($0, `f32.demote_f64`, [value("f64", 16777219)]), [value("f32", 16777220)]);

// ./test/core/conversions.wast:602
assert_return(
  () => invoke($0, `f32.demote_f64`, [value("f64", 424258443299142700000000000000000)]),
  [value("f32", 424258450000000000000000000000000)],
);

// ./test/core/conversions.wast:603
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", 0.0000000000000000000000000000000001569262107843488),
  ]),
  [value("f32", 0.00000000000000000000000000000000015692621)],
);

// ./test/core/conversions.wast:604
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", 0.000000000000000000000000000000000000010551773688605172),
  ]),
  [value("f32", 0.000000000000000000000000000000000000010551773)],
);

// ./test/core/conversions.wast:605
assert_return(
  () => invoke($0, `f32.demote_f64`, [value("f64", -2.8238128484141933)]),
  [value("f32", -2.823813)],
);

// ./test/core/conversions.wast:606
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", -9063376370095757000000000000000000),
  ]),
  [value("f32", -9063376000000000000000000000000000)],
);

// ./test/core/conversions.wast:607
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [`canonical_nan`],
);

// ./test/core/conversions.wast:608
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [`arithmetic_nan`],
);

// ./test/core/conversions.wast:609
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [`canonical_nan`],
);

// ./test/core/conversions.wast:610
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [`arithmetic_nan`],
);

// ./test/core/conversions.wast:611
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("f32", 0)],
);

// ./test/core/conversions.wast:612
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("f32", -0)],
);

// ./test/core/conversions.wast:613
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", 0.0000000000000000000000000000000000000000000007006492321624085),
  ]),
  [value("f32", 0)],
);

// ./test/core/conversions.wast:614
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", -0.0000000000000000000000000000000000000000000007006492321624085),
  ]),
  [value("f32", -0)],
);

// ./test/core/conversions.wast:615
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", 0.0000000000000000000000000000000000000000000007006492321624087),
  ]),
  [value("f32", 0.000000000000000000000000000000000000000000001)],
);

// ./test/core/conversions.wast:616
assert_return(
  () => invoke($0, `f32.demote_f64`, [
    value("f64", -0.0000000000000000000000000000000000000000000007006492321624087),
  ]),
  [value("f32", -0.000000000000000000000000000000000000000000001)],
);

// ./test/core/conversions.wast:618
assert_return(() => invoke($0, `f32.reinterpret_i32`, [0]), [value("f32", 0)]);

// ./test/core/conversions.wast:619
assert_return(() => invoke($0, `f32.reinterpret_i32`, [-2147483648]), [value("f32", -0)]);

// ./test/core/conversions.wast:620
assert_return(
  () => invoke($0, `f32.reinterpret_i32`, [1]),
  [value("f32", 0.000000000000000000000000000000000000000000001)],
);

// ./test/core/conversions.wast:621
assert_return(() => invoke($0, `f32.reinterpret_i32`, [-1]), [bytes("f32", [0xff, 0xff, 0xff, 0xff])]);

// ./test/core/conversions.wast:622
assert_return(
  () => invoke($0, `f32.reinterpret_i32`, [123456789]),
  [value("f32", 0.00000000000000000000000000000000016535997)],
);

// ./test/core/conversions.wast:623
assert_return(
  () => invoke($0, `f32.reinterpret_i32`, [-2147483647]),
  [value("f32", -0.000000000000000000000000000000000000000000001)],
);

// ./test/core/conversions.wast:624
assert_return(() => invoke($0, `f32.reinterpret_i32`, [2139095040]), [value("f32", Infinity)]);

// ./test/core/conversions.wast:625
assert_return(() => invoke($0, `f32.reinterpret_i32`, [-8388608]), [value("f32", -Infinity)]);

// ./test/core/conversions.wast:626
assert_return(
  () => invoke($0, `f32.reinterpret_i32`, [2143289344]),
  [bytes("f32", [0x0, 0x0, 0xc0, 0x7f])],
);

// ./test/core/conversions.wast:627
assert_return(
  () => invoke($0, `f32.reinterpret_i32`, [-4194304]),
  [bytes("f32", [0x0, 0x0, 0xc0, 0xff])],
);

// ./test/core/conversions.wast:628
assert_return(
  () => invoke($0, `f32.reinterpret_i32`, [2141192192]),
  [bytes("f32", [0x0, 0x0, 0xa0, 0x7f])],
);

// ./test/core/conversions.wast:629
assert_return(
  () => invoke($0, `f32.reinterpret_i32`, [-6291456]),
  [bytes("f32", [0x0, 0x0, 0xa0, 0xff])],
);

// ./test/core/conversions.wast:631
assert_return(() => invoke($0, `f64.reinterpret_i64`, [0n]), [value("f64", 0)]);

// ./test/core/conversions.wast:632
assert_return(
  () => invoke($0, `f64.reinterpret_i64`, [1n]),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ],
);

// ./test/core/conversions.wast:633
assert_return(
  () => invoke($0, `f64.reinterpret_i64`, [-1n]),
  [bytes("f64", [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff])],
);

// ./test/core/conversions.wast:634
assert_return(() => invoke($0, `f64.reinterpret_i64`, [-9223372036854775808n]), [value("f64", -0)]);

// ./test/core/conversions.wast:635
assert_return(
  () => invoke($0, `f64.reinterpret_i64`, [1234567890n]),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000609957582),
  ],
);

// ./test/core/conversions.wast:636
assert_return(
  () => invoke($0, `f64.reinterpret_i64`, [-9223372036854775807n]),
  [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ],
);

// ./test/core/conversions.wast:637
assert_return(() => invoke($0, `f64.reinterpret_i64`, [9218868437227405312n]), [value("f64", Infinity)]);

// ./test/core/conversions.wast:638
assert_return(() => invoke($0, `f64.reinterpret_i64`, [-4503599627370496n]), [value("f64", -Infinity)]);

// ./test/core/conversions.wast:639
assert_return(
  () => invoke($0, `f64.reinterpret_i64`, [9221120237041090560n]),
  [bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f])],
);

// ./test/core/conversions.wast:640
assert_return(
  () => invoke($0, `f64.reinterpret_i64`, [-2251799813685248n]),
  [bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff])],
);

// ./test/core/conversions.wast:641
assert_return(
  () => invoke($0, `f64.reinterpret_i64`, [9219994337134247936n]),
  [bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f])],
);

// ./test/core/conversions.wast:642
assert_return(
  () => invoke($0, `f64.reinterpret_i64`, [-3377699720527872n]),
  [bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff])],
);

// ./test/core/conversions.wast:644
assert_return(() => invoke($0, `i32.reinterpret_f32`, [value("f32", 0)]), [value("i32", 0)]);

// ./test/core/conversions.wast:645
assert_return(() => invoke($0, `i32.reinterpret_f32`, [value("f32", -0)]), [value("i32", -2147483648)]);

// ./test/core/conversions.wast:646
assert_return(
  () => invoke($0, `i32.reinterpret_f32`, [
    value("f32", 0.000000000000000000000000000000000000000000001),
  ]),
  [value("i32", 1)],
);

// ./test/core/conversions.wast:647
assert_return(
  () => invoke($0, `i32.reinterpret_f32`, [bytes("f32", [0xff, 0xff, 0xff, 0xff])]),
  [value("i32", -1)],
);

// ./test/core/conversions.wast:648
assert_return(
  () => invoke($0, `i32.reinterpret_f32`, [
    value("f32", -0.000000000000000000000000000000000000000000001),
  ]),
  [value("i32", -2147483647)],
);

// ./test/core/conversions.wast:649
assert_return(() => invoke($0, `i32.reinterpret_f32`, [value("f32", 1)]), [value("i32", 1065353216)]);

// ./test/core/conversions.wast:650
assert_return(
  () => invoke($0, `i32.reinterpret_f32`, [value("f32", 3.1415925)]),
  [value("i32", 1078530010)],
);

// ./test/core/conversions.wast:651
assert_return(
  () => invoke($0, `i32.reinterpret_f32`, [
    value("f32", 340282350000000000000000000000000000000),
  ]),
  [value("i32", 2139095039)],
);

// ./test/core/conversions.wast:652
assert_return(
  () => invoke($0, `i32.reinterpret_f32`, [
    value("f32", -340282350000000000000000000000000000000),
  ]),
  [value("i32", -8388609)],
);

// ./test/core/conversions.wast:653
assert_return(
  () => invoke($0, `i32.reinterpret_f32`, [value("f32", Infinity)]),
  [value("i32", 2139095040)],
);

// ./test/core/conversions.wast:654
assert_return(
  () => invoke($0, `i32.reinterpret_f32`, [value("f32", -Infinity)]),
  [value("i32", -8388608)],
);

// ./test/core/conversions.wast:655
assert_return(
  () => invoke($0, `i32.reinterpret_f32`, [bytes("f32", [0x0, 0x0, 0xc0, 0x7f])]),
  [value("i32", 2143289344)],
);

// ./test/core/conversions.wast:656
assert_return(
  () => invoke($0, `i32.reinterpret_f32`, [bytes("f32", [0x0, 0x0, 0xc0, 0xff])]),
  [value("i32", -4194304)],
);

// ./test/core/conversions.wast:657
assert_return(
  () => invoke($0, `i32.reinterpret_f32`, [bytes("f32", [0x0, 0x0, 0xa0, 0x7f])]),
  [value("i32", 2141192192)],
);

// ./test/core/conversions.wast:658
assert_return(
  () => invoke($0, `i32.reinterpret_f32`, [bytes("f32", [0x0, 0x0, 0xa0, 0xff])]),
  [value("i32", -6291456)],
);

// ./test/core/conversions.wast:660
assert_return(() => invoke($0, `i64.reinterpret_f64`, [value("f64", 0)]), [value("i64", 0n)]);

// ./test/core/conversions.wast:661
assert_return(
  () => invoke($0, `i64.reinterpret_f64`, [value("f64", -0)]),
  [value("i64", -9223372036854775808n)],
);

// ./test/core/conversions.wast:662
assert_return(
  () => invoke($0, `i64.reinterpret_f64`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i64", 1n)],
);

// ./test/core/conversions.wast:663
assert_return(
  () => invoke($0, `i64.reinterpret_f64`, [
    bytes("f64", [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]),
  ]),
  [value("i64", -1n)],
);

// ./test/core/conversions.wast:664
assert_return(
  () => invoke($0, `i64.reinterpret_f64`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i64", -9223372036854775807n)],
);

// ./test/core/conversions.wast:665
assert_return(
  () => invoke($0, `i64.reinterpret_f64`, [value("f64", 1)]),
  [value("i64", 4607182418800017408n)],
);

// ./test/core/conversions.wast:666
assert_return(
  () => invoke($0, `i64.reinterpret_f64`, [value("f64", 3.14159265358979)]),
  [value("i64", 4614256656552045841n)],
);

// ./test/core/conversions.wast:667
assert_return(
  () => invoke($0, `i64.reinterpret_f64`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i64", 9218868437227405311n)],
);

// ./test/core/conversions.wast:668
assert_return(
  () => invoke($0, `i64.reinterpret_f64`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i64", -4503599627370497n)],
);

// ./test/core/conversions.wast:669
assert_return(
  () => invoke($0, `i64.reinterpret_f64`, [value("f64", Infinity)]),
  [value("i64", 9218868437227405312n)],
);

// ./test/core/conversions.wast:670
assert_return(
  () => invoke($0, `i64.reinterpret_f64`, [value("f64", -Infinity)]),
  [value("i64", -4503599627370496n)],
);

// ./test/core/conversions.wast:671
assert_return(
  () => invoke($0, `i64.reinterpret_f64`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i64", 9221120237041090560n)],
);

// ./test/core/conversions.wast:672
assert_return(
  () => invoke($0, `i64.reinterpret_f64`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i64", -2251799813685248n)],
);

// ./test/core/conversions.wast:673
assert_return(
  () => invoke($0, `i64.reinterpret_f64`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i64", 9219994337134247936n)],
);

// ./test/core/conversions.wast:674
assert_return(
  () => invoke($0, `i64.reinterpret_f64`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i64", -3377699720527872n)],
);

// ./test/core/conversions.wast:678
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.wrap_i64 (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/conversions.wast:679
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.trunc_f32_s (i64.const 0))))`),
  `type mismatch`,
);

// ./test/core/conversions.wast:680
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.trunc_f32_u (i64.const 0))))`),
  `type mismatch`,
);

// ./test/core/conversions.wast:681
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.trunc_f64_s (i64.const 0))))`),
  `type mismatch`,
);

// ./test/core/conversions.wast:682
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.trunc_f64_u (i64.const 0))))`),
  `type mismatch`,
);

// ./test/core/conversions.wast:683
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.reinterpret_f32 (i64.const 0))))`),
  `type mismatch`,
);

// ./test/core/conversions.wast:684
assert_invalid(
  () => instantiate(`(module (func (result i64) (i64.extend_i32_s (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/conversions.wast:685
assert_invalid(
  () => instantiate(`(module (func (result i64) (i64.extend_i32_u (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/conversions.wast:686
assert_invalid(
  () => instantiate(`(module (func (result i64) (i64.trunc_f32_s (i32.const 0))))`),
  `type mismatch`,
);

// ./test/core/conversions.wast:687
assert_invalid(
  () => instantiate(`(module (func (result i64) (i64.trunc_f32_u (i32.const 0))))`),
  `type mismatch`,
);

// ./test/core/conversions.wast:688
assert_invalid(
  () => instantiate(`(module (func (result i64) (i64.trunc_f64_s (i32.const 0))))`),
  `type mismatch`,
);

// ./test/core/conversions.wast:689
assert_invalid(
  () => instantiate(`(module (func (result i64) (i64.trunc_f64_u (i32.const 0))))`),
  `type mismatch`,
);

// ./test/core/conversions.wast:690
assert_invalid(
  () => instantiate(`(module (func (result i64) (i64.reinterpret_f64 (i32.const 0))))`),
  `type mismatch`,
);

// ./test/core/conversions.wast:691
assert_invalid(
  () => instantiate(`(module (func (result f32) (f32.convert_i32_s (i64.const 0))))`),
  `type mismatch`,
);

// ./test/core/conversions.wast:692
assert_invalid(
  () => instantiate(`(module (func (result f32) (f32.convert_i32_u (i64.const 0))))`),
  `type mismatch`,
);

// ./test/core/conversions.wast:693
assert_invalid(
  () => instantiate(`(module (func (result f32) (f32.convert_i64_s (i32.const 0))))`),
  `type mismatch`,
);

// ./test/core/conversions.wast:694
assert_invalid(
  () => instantiate(`(module (func (result f32) (f32.convert_i64_u (i32.const 0))))`),
  `type mismatch`,
);

// ./test/core/conversions.wast:695
assert_invalid(
  () => instantiate(`(module (func (result f32) (f32.demote_f64 (i32.const 0))))`),
  `type mismatch`,
);

// ./test/core/conversions.wast:696
assert_invalid(
  () => instantiate(`(module (func (result f32) (f32.reinterpret_i32 (i64.const 0))))`),
  `type mismatch`,
);

// ./test/core/conversions.wast:697
assert_invalid(
  () => instantiate(`(module (func (result f64) (f64.convert_i32_s (i64.const 0))))`),
  `type mismatch`,
);

// ./test/core/conversions.wast:698
assert_invalid(
  () => instantiate(`(module (func (result f64) (f64.convert_i32_u (i64.const 0))))`),
  `type mismatch`,
);

// ./test/core/conversions.wast:699
assert_invalid(
  () => instantiate(`(module (func (result f64) (f64.convert_i64_s (i32.const 0))))`),
  `type mismatch`,
);

// ./test/core/conversions.wast:700
assert_invalid(
  () => instantiate(`(module (func (result f64) (f64.convert_i64_u (i32.const 0))))`),
  `type mismatch`,
);

// ./test/core/conversions.wast:701
assert_invalid(
  () => instantiate(`(module (func (result f64) (f64.promote_f32 (i32.const 0))))`),
  `type mismatch`,
);

// ./test/core/conversions.wast:702
assert_invalid(
  () => instantiate(`(module (func (result f64) (f64.reinterpret_i64 (i32.const 0))))`),
  `type mismatch`,
);
