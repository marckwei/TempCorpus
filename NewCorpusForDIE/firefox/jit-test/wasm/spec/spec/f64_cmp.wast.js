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

// ./test/core/f64_cmp.wast

// ./test/core/f64_cmp.wast:4
let $0 = instantiate(`(module
  (func (export "eq") (param $$x f64) (param $$y f64) (result i32) (f64.eq (local.get $$x) (local.get $$y)))
  (func (export "ne") (param $$x f64) (param $$y f64) (result i32) (f64.ne (local.get $$x) (local.get $$y)))
  (func (export "lt") (param $$x f64) (param $$y f64) (result i32) (f64.lt (local.get $$x) (local.get $$y)))
  (func (export "le") (param $$x f64) (param $$y f64) (result i32) (f64.le (local.get $$x) (local.get $$y)))
  (func (export "gt") (param $$x f64) (param $$y f64) (result i32) (f64.gt (local.get $$x) (local.get $$y)))
  (func (export "ge") (param $$x f64) (param $$y f64) (result i32) (f64.ge (local.get $$x) (local.get $$y)))
)`);

// ./test/core/f64_cmp.wast:13
assert_return(() => invoke($0, `eq`, [value("f64", -0), value("f64", -0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:14
assert_return(() => invoke($0, `eq`, [value("f64", -0), value("f64", 0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:15
assert_return(() => invoke($0, `eq`, [value("f64", 0), value("f64", -0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:16
assert_return(() => invoke($0, `eq`, [value("f64", 0), value("f64", 0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:17
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:18
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:19
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:20
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:21
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:22
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:23
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:24
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:25
assert_return(() => invoke($0, `eq`, [value("f64", -0), value("f64", -0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:26
assert_return(() => invoke($0, `eq`, [value("f64", -0), value("f64", 0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:27
assert_return(() => invoke($0, `eq`, [value("f64", 0), value("f64", -0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:28
assert_return(() => invoke($0, `eq`, [value("f64", 0), value("f64", 0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:29
assert_return(() => invoke($0, `eq`, [value("f64", -0), value("f64", -1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:30
assert_return(() => invoke($0, `eq`, [value("f64", -0), value("f64", 1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:31
assert_return(() => invoke($0, `eq`, [value("f64", 0), value("f64", -1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:32
assert_return(() => invoke($0, `eq`, [value("f64", 0), value("f64", 1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:33
assert_return(
  () => invoke($0, `eq`, [value("f64", -0), value("f64", -6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:34
assert_return(
  () => invoke($0, `eq`, [value("f64", -0), value("f64", 6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:35
assert_return(
  () => invoke($0, `eq`, [value("f64", 0), value("f64", -6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:36
assert_return(
  () => invoke($0, `eq`, [value("f64", 0), value("f64", 6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:37
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:38
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:39
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:40
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:41
assert_return(() => invoke($0, `eq`, [value("f64", -0), value("f64", -Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:42
assert_return(() => invoke($0, `eq`, [value("f64", -0), value("f64", Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:43
assert_return(() => invoke($0, `eq`, [value("f64", 0), value("f64", -Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:44
assert_return(() => invoke($0, `eq`, [value("f64", 0), value("f64", Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:45
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:46
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:47
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:48
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:49
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:50
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:51
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:52
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:53
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:54
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:55
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:56
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:57
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:58
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:59
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:60
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:61
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:62
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:63
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:64
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:65
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:66
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:67
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:68
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:69
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:70
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:71
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:72
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:73
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:74
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:75
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:76
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:77
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:78
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:79
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:80
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:81
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:82
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:83
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:84
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:85
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:86
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:87
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:88
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:89
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:90
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:91
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:92
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:93
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:94
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:95
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:96
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:97
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:98
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:99
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:100
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:101
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:102
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:103
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:104
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:105
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:106
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:107
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:108
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:109
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:110
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:111
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:112
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:113
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:114
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:115
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:116
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:117
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:118
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:119
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:120
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:121
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:122
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:123
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:124
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:125
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:126
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:127
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:128
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:129
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:130
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:131
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:132
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:133
assert_return(() => invoke($0, `eq`, [value("f64", -0.5), value("f64", -0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:134
assert_return(() => invoke($0, `eq`, [value("f64", -0.5), value("f64", 0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:135
assert_return(() => invoke($0, `eq`, [value("f64", 0.5), value("f64", -0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:136
assert_return(() => invoke($0, `eq`, [value("f64", 0.5), value("f64", 0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:137
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.5),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:138
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.5),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:139
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.5),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:140
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.5),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:141
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.5),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:142
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.5),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:143
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.5),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:144
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.5),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:145
assert_return(() => invoke($0, `eq`, [value("f64", -0.5), value("f64", -0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:146
assert_return(() => invoke($0, `eq`, [value("f64", -0.5), value("f64", 0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:147
assert_return(() => invoke($0, `eq`, [value("f64", 0.5), value("f64", -0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:148
assert_return(() => invoke($0, `eq`, [value("f64", 0.5), value("f64", 0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:149
assert_return(() => invoke($0, `eq`, [value("f64", -0.5), value("f64", -1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:150
assert_return(() => invoke($0, `eq`, [value("f64", -0.5), value("f64", 1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:151
assert_return(() => invoke($0, `eq`, [value("f64", 0.5), value("f64", -1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:152
assert_return(() => invoke($0, `eq`, [value("f64", 0.5), value("f64", 1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:153
assert_return(
  () => invoke($0, `eq`, [value("f64", -0.5), value("f64", -6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:154
assert_return(
  () => invoke($0, `eq`, [value("f64", -0.5), value("f64", 6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:155
assert_return(
  () => invoke($0, `eq`, [value("f64", 0.5), value("f64", -6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:156
assert_return(
  () => invoke($0, `eq`, [value("f64", 0.5), value("f64", 6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:157
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.5),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:158
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.5),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:159
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.5),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:160
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.5),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:161
assert_return(() => invoke($0, `eq`, [value("f64", -0.5), value("f64", -Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:162
assert_return(() => invoke($0, `eq`, [value("f64", -0.5), value("f64", Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:163
assert_return(() => invoke($0, `eq`, [value("f64", 0.5), value("f64", -Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:164
assert_return(() => invoke($0, `eq`, [value("f64", 0.5), value("f64", Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:165
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:166
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:167
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:168
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:169
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:170
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:171
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:172
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:173
assert_return(() => invoke($0, `eq`, [value("f64", -1), value("f64", -0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:174
assert_return(() => invoke($0, `eq`, [value("f64", -1), value("f64", 0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:175
assert_return(() => invoke($0, `eq`, [value("f64", 1), value("f64", -0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:176
assert_return(() => invoke($0, `eq`, [value("f64", 1), value("f64", 0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:177
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -1),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:178
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -1),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:179
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 1),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:180
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 1),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:181
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -1),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:182
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -1),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:183
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 1),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:184
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 1),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:185
assert_return(() => invoke($0, `eq`, [value("f64", -1), value("f64", -0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:186
assert_return(() => invoke($0, `eq`, [value("f64", -1), value("f64", 0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:187
assert_return(() => invoke($0, `eq`, [value("f64", 1), value("f64", -0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:188
assert_return(() => invoke($0, `eq`, [value("f64", 1), value("f64", 0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:189
assert_return(() => invoke($0, `eq`, [value("f64", -1), value("f64", -1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:190
assert_return(() => invoke($0, `eq`, [value("f64", -1), value("f64", 1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:191
assert_return(() => invoke($0, `eq`, [value("f64", 1), value("f64", -1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:192
assert_return(() => invoke($0, `eq`, [value("f64", 1), value("f64", 1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:193
assert_return(
  () => invoke($0, `eq`, [value("f64", -1), value("f64", -6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:194
assert_return(
  () => invoke($0, `eq`, [value("f64", -1), value("f64", 6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:195
assert_return(
  () => invoke($0, `eq`, [value("f64", 1), value("f64", -6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:196
assert_return(
  () => invoke($0, `eq`, [value("f64", 1), value("f64", 6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:197
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -1),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:198
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -1),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:199
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 1),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:200
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 1),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:201
assert_return(() => invoke($0, `eq`, [value("f64", -1), value("f64", -Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:202
assert_return(() => invoke($0, `eq`, [value("f64", -1), value("f64", Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:203
assert_return(() => invoke($0, `eq`, [value("f64", 1), value("f64", -Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:204
assert_return(() => invoke($0, `eq`, [value("f64", 1), value("f64", Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:205
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:206
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:207
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:208
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:209
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:210
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:211
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:212
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:213
assert_return(
  () => invoke($0, `eq`, [value("f64", -6.283185307179586), value("f64", -0)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:214
assert_return(
  () => invoke($0, `eq`, [value("f64", -6.283185307179586), value("f64", 0)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:215
assert_return(
  () => invoke($0, `eq`, [value("f64", 6.283185307179586), value("f64", -0)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:216
assert_return(
  () => invoke($0, `eq`, [value("f64", 6.283185307179586), value("f64", 0)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:217
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -6.283185307179586),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:218
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -6.283185307179586),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:219
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 6.283185307179586),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:220
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 6.283185307179586),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:221
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -6.283185307179586),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:222
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -6.283185307179586),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:223
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 6.283185307179586),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:224
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 6.283185307179586),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:225
assert_return(
  () => invoke($0, `eq`, [value("f64", -6.283185307179586), value("f64", -0.5)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:226
assert_return(
  () => invoke($0, `eq`, [value("f64", -6.283185307179586), value("f64", 0.5)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:227
assert_return(
  () => invoke($0, `eq`, [value("f64", 6.283185307179586), value("f64", -0.5)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:228
assert_return(
  () => invoke($0, `eq`, [value("f64", 6.283185307179586), value("f64", 0.5)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:229
assert_return(
  () => invoke($0, `eq`, [value("f64", -6.283185307179586), value("f64", -1)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:230
assert_return(
  () => invoke($0, `eq`, [value("f64", -6.283185307179586), value("f64", 1)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:231
assert_return(
  () => invoke($0, `eq`, [value("f64", 6.283185307179586), value("f64", -1)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:232
assert_return(
  () => invoke($0, `eq`, [value("f64", 6.283185307179586), value("f64", 1)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:233
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -6.283185307179586),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:234
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -6.283185307179586),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:235
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 6.283185307179586),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:236
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 6.283185307179586),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:237
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -6.283185307179586),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:238
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -6.283185307179586),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:239
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 6.283185307179586),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:240
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 6.283185307179586),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:241
assert_return(
  () => invoke($0, `eq`, [value("f64", -6.283185307179586), value("f64", -Infinity)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:242
assert_return(
  () => invoke($0, `eq`, [value("f64", -6.283185307179586), value("f64", Infinity)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:243
assert_return(
  () => invoke($0, `eq`, [value("f64", 6.283185307179586), value("f64", -Infinity)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:244
assert_return(
  () => invoke($0, `eq`, [value("f64", 6.283185307179586), value("f64", Infinity)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:245
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:246
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:247
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:248
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:249
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:250
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:251
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:252
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:253
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:254
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:255
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:256
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:257
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:258
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:259
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:260
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:261
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:262
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:263
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:264
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:265
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:266
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:267
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:268
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:269
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:270
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:271
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:272
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:273
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:274
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:275
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:276
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:277
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:278
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:279
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:280
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:281
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:282
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:283
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:284
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:285
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:286
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:287
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:288
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:289
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:290
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:291
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:292
assert_return(
  () => invoke($0, `eq`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:293
assert_return(() => invoke($0, `eq`, [value("f64", -Infinity), value("f64", -0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:294
assert_return(() => invoke($0, `eq`, [value("f64", -Infinity), value("f64", 0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:295
assert_return(() => invoke($0, `eq`, [value("f64", Infinity), value("f64", -0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:296
assert_return(() => invoke($0, `eq`, [value("f64", Infinity), value("f64", 0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:297
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -Infinity),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:298
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -Infinity),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:299
assert_return(
  () => invoke($0, `eq`, [
    value("f64", Infinity),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:300
assert_return(
  () => invoke($0, `eq`, [
    value("f64", Infinity),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:301
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -Infinity),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:302
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -Infinity),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:303
assert_return(
  () => invoke($0, `eq`, [
    value("f64", Infinity),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:304
assert_return(
  () => invoke($0, `eq`, [
    value("f64", Infinity),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:305
assert_return(() => invoke($0, `eq`, [value("f64", -Infinity), value("f64", -0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:306
assert_return(() => invoke($0, `eq`, [value("f64", -Infinity), value("f64", 0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:307
assert_return(() => invoke($0, `eq`, [value("f64", Infinity), value("f64", -0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:308
assert_return(() => invoke($0, `eq`, [value("f64", Infinity), value("f64", 0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:309
assert_return(() => invoke($0, `eq`, [value("f64", -Infinity), value("f64", -1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:310
assert_return(() => invoke($0, `eq`, [value("f64", -Infinity), value("f64", 1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:311
assert_return(() => invoke($0, `eq`, [value("f64", Infinity), value("f64", -1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:312
assert_return(() => invoke($0, `eq`, [value("f64", Infinity), value("f64", 1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:313
assert_return(
  () => invoke($0, `eq`, [value("f64", -Infinity), value("f64", -6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:314
assert_return(
  () => invoke($0, `eq`, [value("f64", -Infinity), value("f64", 6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:315
assert_return(
  () => invoke($0, `eq`, [value("f64", Infinity), value("f64", -6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:316
assert_return(
  () => invoke($0, `eq`, [value("f64", Infinity), value("f64", 6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:317
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -Infinity),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:318
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -Infinity),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:319
assert_return(
  () => invoke($0, `eq`, [
    value("f64", Infinity),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:320
assert_return(
  () => invoke($0, `eq`, [
    value("f64", Infinity),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:321
assert_return(
  () => invoke($0, `eq`, [value("f64", -Infinity), value("f64", -Infinity)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:322
assert_return(
  () => invoke($0, `eq`, [value("f64", -Infinity), value("f64", Infinity)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:323
assert_return(
  () => invoke($0, `eq`, [value("f64", Infinity), value("f64", -Infinity)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:324
assert_return(
  () => invoke($0, `eq`, [value("f64", Infinity), value("f64", Infinity)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:325
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:326
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:327
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:328
assert_return(
  () => invoke($0, `eq`, [
    value("f64", -Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:329
assert_return(
  () => invoke($0, `eq`, [
    value("f64", Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:330
assert_return(
  () => invoke($0, `eq`, [
    value("f64", Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:331
assert_return(
  () => invoke($0, `eq`, [
    value("f64", Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:332
assert_return(
  () => invoke($0, `eq`, [
    value("f64", Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:333
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:334
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:335
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:336
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:337
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:338
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:339
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:340
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:341
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:342
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:343
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:344
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:345
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:346
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:347
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:348
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:349
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:350
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:351
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:352
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:353
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:354
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:355
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:356
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:357
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:358
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:359
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:360
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:361
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:362
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:363
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:364
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:365
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:366
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:367
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:368
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:369
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:370
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:371
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:372
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:373
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:374
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:375
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:376
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:377
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:378
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:379
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:380
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:381
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:382
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:383
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:384
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:385
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:386
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:387
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:388
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:389
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:390
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:391
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:392
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:393
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:394
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:395
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:396
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:397
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:398
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:399
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:400
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:401
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:402
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:403
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:404
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:405
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:406
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:407
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:408
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:409
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:410
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:411
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:412
assert_return(
  () => invoke($0, `eq`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:413
assert_return(() => invoke($0, `ne`, [value("f64", -0), value("f64", -0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:414
assert_return(() => invoke($0, `ne`, [value("f64", -0), value("f64", 0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:415
assert_return(() => invoke($0, `ne`, [value("f64", 0), value("f64", -0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:416
assert_return(() => invoke($0, `ne`, [value("f64", 0), value("f64", 0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:417
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:418
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:419
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:420
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:421
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:422
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:423
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:424
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:425
assert_return(() => invoke($0, `ne`, [value("f64", -0), value("f64", -0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:426
assert_return(() => invoke($0, `ne`, [value("f64", -0), value("f64", 0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:427
assert_return(() => invoke($0, `ne`, [value("f64", 0), value("f64", -0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:428
assert_return(() => invoke($0, `ne`, [value("f64", 0), value("f64", 0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:429
assert_return(() => invoke($0, `ne`, [value("f64", -0), value("f64", -1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:430
assert_return(() => invoke($0, `ne`, [value("f64", -0), value("f64", 1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:431
assert_return(() => invoke($0, `ne`, [value("f64", 0), value("f64", -1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:432
assert_return(() => invoke($0, `ne`, [value("f64", 0), value("f64", 1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:433
assert_return(
  () => invoke($0, `ne`, [value("f64", -0), value("f64", -6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:434
assert_return(
  () => invoke($0, `ne`, [value("f64", -0), value("f64", 6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:435
assert_return(
  () => invoke($0, `ne`, [value("f64", 0), value("f64", -6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:436
assert_return(
  () => invoke($0, `ne`, [value("f64", 0), value("f64", 6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:437
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:438
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:439
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:440
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:441
assert_return(() => invoke($0, `ne`, [value("f64", -0), value("f64", -Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:442
assert_return(() => invoke($0, `ne`, [value("f64", -0), value("f64", Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:443
assert_return(() => invoke($0, `ne`, [value("f64", 0), value("f64", -Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:444
assert_return(() => invoke($0, `ne`, [value("f64", 0), value("f64", Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:445
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:446
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:447
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:448
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:449
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:450
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:451
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:452
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:453
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:454
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:455
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:456
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:457
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:458
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:459
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:460
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:461
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:462
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:463
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:464
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:465
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:466
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:467
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:468
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:469
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:470
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:471
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:472
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:473
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:474
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:475
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:476
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:477
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:478
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:479
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:480
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:481
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:482
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:483
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:484
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:485
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:486
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:487
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:488
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:489
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:490
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:491
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:492
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:493
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:494
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:495
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:496
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:497
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:498
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:499
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:500
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:501
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:502
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:503
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:504
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:505
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:506
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:507
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:508
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:509
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:510
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:511
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:512
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:513
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:514
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:515
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:516
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:517
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:518
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:519
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:520
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:521
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:522
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:523
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:524
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:525
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:526
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:527
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:528
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:529
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:530
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:531
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:532
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:533
assert_return(() => invoke($0, `ne`, [value("f64", -0.5), value("f64", -0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:534
assert_return(() => invoke($0, `ne`, [value("f64", -0.5), value("f64", 0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:535
assert_return(() => invoke($0, `ne`, [value("f64", 0.5), value("f64", -0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:536
assert_return(() => invoke($0, `ne`, [value("f64", 0.5), value("f64", 0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:537
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.5),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:538
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.5),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:539
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.5),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:540
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.5),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:541
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.5),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:542
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.5),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:543
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.5),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:544
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.5),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:545
assert_return(() => invoke($0, `ne`, [value("f64", -0.5), value("f64", -0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:546
assert_return(() => invoke($0, `ne`, [value("f64", -0.5), value("f64", 0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:547
assert_return(() => invoke($0, `ne`, [value("f64", 0.5), value("f64", -0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:548
assert_return(() => invoke($0, `ne`, [value("f64", 0.5), value("f64", 0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:549
assert_return(() => invoke($0, `ne`, [value("f64", -0.5), value("f64", -1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:550
assert_return(() => invoke($0, `ne`, [value("f64", -0.5), value("f64", 1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:551
assert_return(() => invoke($0, `ne`, [value("f64", 0.5), value("f64", -1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:552
assert_return(() => invoke($0, `ne`, [value("f64", 0.5), value("f64", 1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:553
assert_return(
  () => invoke($0, `ne`, [value("f64", -0.5), value("f64", -6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:554
assert_return(
  () => invoke($0, `ne`, [value("f64", -0.5), value("f64", 6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:555
assert_return(
  () => invoke($0, `ne`, [value("f64", 0.5), value("f64", -6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:556
assert_return(
  () => invoke($0, `ne`, [value("f64", 0.5), value("f64", 6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:557
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.5),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:558
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.5),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:559
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.5),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:560
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.5),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:561
assert_return(() => invoke($0, `ne`, [value("f64", -0.5), value("f64", -Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:562
assert_return(() => invoke($0, `ne`, [value("f64", -0.5), value("f64", Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:563
assert_return(() => invoke($0, `ne`, [value("f64", 0.5), value("f64", -Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:564
assert_return(() => invoke($0, `ne`, [value("f64", 0.5), value("f64", Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:565
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:566
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:567
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:568
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:569
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:570
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:571
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:572
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:573
assert_return(() => invoke($0, `ne`, [value("f64", -1), value("f64", -0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:574
assert_return(() => invoke($0, `ne`, [value("f64", -1), value("f64", 0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:575
assert_return(() => invoke($0, `ne`, [value("f64", 1), value("f64", -0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:576
assert_return(() => invoke($0, `ne`, [value("f64", 1), value("f64", 0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:577
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -1),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:578
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -1),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:579
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 1),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:580
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 1),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:581
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -1),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:582
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -1),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:583
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 1),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:584
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 1),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:585
assert_return(() => invoke($0, `ne`, [value("f64", -1), value("f64", -0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:586
assert_return(() => invoke($0, `ne`, [value("f64", -1), value("f64", 0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:587
assert_return(() => invoke($0, `ne`, [value("f64", 1), value("f64", -0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:588
assert_return(() => invoke($0, `ne`, [value("f64", 1), value("f64", 0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:589
assert_return(() => invoke($0, `ne`, [value("f64", -1), value("f64", -1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:590
assert_return(() => invoke($0, `ne`, [value("f64", -1), value("f64", 1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:591
assert_return(() => invoke($0, `ne`, [value("f64", 1), value("f64", -1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:592
assert_return(() => invoke($0, `ne`, [value("f64", 1), value("f64", 1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:593
assert_return(
  () => invoke($0, `ne`, [value("f64", -1), value("f64", -6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:594
assert_return(
  () => invoke($0, `ne`, [value("f64", -1), value("f64", 6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:595
assert_return(
  () => invoke($0, `ne`, [value("f64", 1), value("f64", -6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:596
assert_return(
  () => invoke($0, `ne`, [value("f64", 1), value("f64", 6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:597
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -1),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:598
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -1),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:599
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 1),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:600
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 1),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:601
assert_return(() => invoke($0, `ne`, [value("f64", -1), value("f64", -Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:602
assert_return(() => invoke($0, `ne`, [value("f64", -1), value("f64", Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:603
assert_return(() => invoke($0, `ne`, [value("f64", 1), value("f64", -Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:604
assert_return(() => invoke($0, `ne`, [value("f64", 1), value("f64", Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:605
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:606
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:607
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:608
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:609
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:610
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:611
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:612
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:613
assert_return(
  () => invoke($0, `ne`, [value("f64", -6.283185307179586), value("f64", -0)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:614
assert_return(
  () => invoke($0, `ne`, [value("f64", -6.283185307179586), value("f64", 0)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:615
assert_return(
  () => invoke($0, `ne`, [value("f64", 6.283185307179586), value("f64", -0)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:616
assert_return(
  () => invoke($0, `ne`, [value("f64", 6.283185307179586), value("f64", 0)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:617
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -6.283185307179586),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:618
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -6.283185307179586),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:619
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 6.283185307179586),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:620
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 6.283185307179586),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:621
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -6.283185307179586),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:622
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -6.283185307179586),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:623
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 6.283185307179586),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:624
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 6.283185307179586),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:625
assert_return(
  () => invoke($0, `ne`, [value("f64", -6.283185307179586), value("f64", -0.5)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:626
assert_return(
  () => invoke($0, `ne`, [value("f64", -6.283185307179586), value("f64", 0.5)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:627
assert_return(
  () => invoke($0, `ne`, [value("f64", 6.283185307179586), value("f64", -0.5)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:628
assert_return(
  () => invoke($0, `ne`, [value("f64", 6.283185307179586), value("f64", 0.5)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:629
assert_return(
  () => invoke($0, `ne`, [value("f64", -6.283185307179586), value("f64", -1)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:630
assert_return(
  () => invoke($0, `ne`, [value("f64", -6.283185307179586), value("f64", 1)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:631
assert_return(
  () => invoke($0, `ne`, [value("f64", 6.283185307179586), value("f64", -1)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:632
assert_return(
  () => invoke($0, `ne`, [value("f64", 6.283185307179586), value("f64", 1)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:633
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -6.283185307179586),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:634
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -6.283185307179586),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:635
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 6.283185307179586),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:636
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 6.283185307179586),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:637
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -6.283185307179586),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:638
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -6.283185307179586),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:639
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 6.283185307179586),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:640
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 6.283185307179586),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:641
assert_return(
  () => invoke($0, `ne`, [value("f64", -6.283185307179586), value("f64", -Infinity)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:642
assert_return(
  () => invoke($0, `ne`, [value("f64", -6.283185307179586), value("f64", Infinity)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:643
assert_return(
  () => invoke($0, `ne`, [value("f64", 6.283185307179586), value("f64", -Infinity)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:644
assert_return(
  () => invoke($0, `ne`, [value("f64", 6.283185307179586), value("f64", Infinity)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:645
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:646
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:647
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:648
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:649
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:650
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:651
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:652
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:653
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:654
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:655
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:656
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:657
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:658
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:659
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:660
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:661
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:662
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:663
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:664
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:665
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:666
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:667
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:668
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:669
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:670
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:671
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:672
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:673
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:674
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:675
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:676
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:677
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:678
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:679
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:680
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:681
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:682
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:683
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:684
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:685
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:686
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:687
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:688
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:689
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:690
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:691
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:692
assert_return(
  () => invoke($0, `ne`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:693
assert_return(() => invoke($0, `ne`, [value("f64", -Infinity), value("f64", -0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:694
assert_return(() => invoke($0, `ne`, [value("f64", -Infinity), value("f64", 0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:695
assert_return(() => invoke($0, `ne`, [value("f64", Infinity), value("f64", -0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:696
assert_return(() => invoke($0, `ne`, [value("f64", Infinity), value("f64", 0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:697
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -Infinity),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:698
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -Infinity),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:699
assert_return(
  () => invoke($0, `ne`, [
    value("f64", Infinity),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:700
assert_return(
  () => invoke($0, `ne`, [
    value("f64", Infinity),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:701
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -Infinity),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:702
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -Infinity),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:703
assert_return(
  () => invoke($0, `ne`, [
    value("f64", Infinity),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:704
assert_return(
  () => invoke($0, `ne`, [
    value("f64", Infinity),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:705
assert_return(() => invoke($0, `ne`, [value("f64", -Infinity), value("f64", -0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:706
assert_return(() => invoke($0, `ne`, [value("f64", -Infinity), value("f64", 0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:707
assert_return(() => invoke($0, `ne`, [value("f64", Infinity), value("f64", -0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:708
assert_return(() => invoke($0, `ne`, [value("f64", Infinity), value("f64", 0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:709
assert_return(() => invoke($0, `ne`, [value("f64", -Infinity), value("f64", -1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:710
assert_return(() => invoke($0, `ne`, [value("f64", -Infinity), value("f64", 1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:711
assert_return(() => invoke($0, `ne`, [value("f64", Infinity), value("f64", -1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:712
assert_return(() => invoke($0, `ne`, [value("f64", Infinity), value("f64", 1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:713
assert_return(
  () => invoke($0, `ne`, [value("f64", -Infinity), value("f64", -6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:714
assert_return(
  () => invoke($0, `ne`, [value("f64", -Infinity), value("f64", 6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:715
assert_return(
  () => invoke($0, `ne`, [value("f64", Infinity), value("f64", -6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:716
assert_return(
  () => invoke($0, `ne`, [value("f64", Infinity), value("f64", 6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:717
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -Infinity),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:718
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -Infinity),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:719
assert_return(
  () => invoke($0, `ne`, [
    value("f64", Infinity),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:720
assert_return(
  () => invoke($0, `ne`, [
    value("f64", Infinity),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:721
assert_return(
  () => invoke($0, `ne`, [value("f64", -Infinity), value("f64", -Infinity)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:722
assert_return(
  () => invoke($0, `ne`, [value("f64", -Infinity), value("f64", Infinity)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:723
assert_return(
  () => invoke($0, `ne`, [value("f64", Infinity), value("f64", -Infinity)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:724
assert_return(
  () => invoke($0, `ne`, [value("f64", Infinity), value("f64", Infinity)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:725
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:726
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:727
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:728
assert_return(
  () => invoke($0, `ne`, [
    value("f64", -Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:729
assert_return(
  () => invoke($0, `ne`, [
    value("f64", Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:730
assert_return(
  () => invoke($0, `ne`, [
    value("f64", Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:731
assert_return(
  () => invoke($0, `ne`, [
    value("f64", Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:732
assert_return(
  () => invoke($0, `ne`, [
    value("f64", Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:733
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:734
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:735
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:736
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:737
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:738
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:739
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:740
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:741
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:742
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:743
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:744
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:745
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:746
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:747
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:748
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:749
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:750
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:751
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:752
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:753
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:754
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:755
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:756
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:757
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:758
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:759
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:760
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:761
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:762
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:763
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:764
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:765
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:766
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:767
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:768
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:769
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:770
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:771
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:772
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:773
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:774
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:775
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:776
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:777
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:778
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:779
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:780
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:781
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:782
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:783
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:784
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:785
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:786
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:787
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:788
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:789
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:790
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:791
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:792
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:793
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:794
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:795
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:796
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:797
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:798
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:799
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:800
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:801
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:802
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:803
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:804
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:805
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:806
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:807
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:808
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:809
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:810
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:811
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:812
assert_return(
  () => invoke($0, `ne`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:813
assert_return(() => invoke($0, `lt`, [value("f64", -0), value("f64", -0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:814
assert_return(() => invoke($0, `lt`, [value("f64", -0), value("f64", 0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:815
assert_return(() => invoke($0, `lt`, [value("f64", 0), value("f64", -0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:816
assert_return(() => invoke($0, `lt`, [value("f64", 0), value("f64", 0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:817
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:818
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:819
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:820
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:821
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:822
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:823
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:824
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:825
assert_return(() => invoke($0, `lt`, [value("f64", -0), value("f64", -0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:826
assert_return(() => invoke($0, `lt`, [value("f64", -0), value("f64", 0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:827
assert_return(() => invoke($0, `lt`, [value("f64", 0), value("f64", -0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:828
assert_return(() => invoke($0, `lt`, [value("f64", 0), value("f64", 0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:829
assert_return(() => invoke($0, `lt`, [value("f64", -0), value("f64", -1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:830
assert_return(() => invoke($0, `lt`, [value("f64", -0), value("f64", 1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:831
assert_return(() => invoke($0, `lt`, [value("f64", 0), value("f64", -1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:832
assert_return(() => invoke($0, `lt`, [value("f64", 0), value("f64", 1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:833
assert_return(
  () => invoke($0, `lt`, [value("f64", -0), value("f64", -6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:834
assert_return(
  () => invoke($0, `lt`, [value("f64", -0), value("f64", 6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:835
assert_return(
  () => invoke($0, `lt`, [value("f64", 0), value("f64", -6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:836
assert_return(
  () => invoke($0, `lt`, [value("f64", 0), value("f64", 6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:837
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:838
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:839
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:840
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:841
assert_return(() => invoke($0, `lt`, [value("f64", -0), value("f64", -Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:842
assert_return(() => invoke($0, `lt`, [value("f64", -0), value("f64", Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:843
assert_return(() => invoke($0, `lt`, [value("f64", 0), value("f64", -Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:844
assert_return(() => invoke($0, `lt`, [value("f64", 0), value("f64", Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:845
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:846
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:847
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:848
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:849
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:850
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:851
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:852
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:853
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:854
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:855
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:856
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:857
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:858
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:859
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:860
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:861
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:862
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:863
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:864
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:865
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:866
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:867
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:868
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:869
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:870
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:871
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:872
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:873
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:874
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:875
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:876
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:877
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:878
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:879
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:880
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:881
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:882
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:883
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:884
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:885
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:886
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:887
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:888
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:889
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:890
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:891
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:892
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:893
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:894
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:895
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:896
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:897
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:898
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:899
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:900
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:901
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:902
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:903
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:904
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:905
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:906
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:907
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:908
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:909
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:910
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:911
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:912
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:913
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:914
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:915
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:916
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:917
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:918
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:919
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:920
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:921
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:922
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:923
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:924
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:925
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:926
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:927
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:928
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:929
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:930
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:931
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:932
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:933
assert_return(() => invoke($0, `lt`, [value("f64", -0.5), value("f64", -0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:934
assert_return(() => invoke($0, `lt`, [value("f64", -0.5), value("f64", 0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:935
assert_return(() => invoke($0, `lt`, [value("f64", 0.5), value("f64", -0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:936
assert_return(() => invoke($0, `lt`, [value("f64", 0.5), value("f64", 0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:937
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.5),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:938
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.5),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:939
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.5),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:940
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.5),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:941
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.5),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:942
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.5),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:943
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.5),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:944
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.5),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:945
assert_return(() => invoke($0, `lt`, [value("f64", -0.5), value("f64", -0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:946
assert_return(() => invoke($0, `lt`, [value("f64", -0.5), value("f64", 0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:947
assert_return(() => invoke($0, `lt`, [value("f64", 0.5), value("f64", -0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:948
assert_return(() => invoke($0, `lt`, [value("f64", 0.5), value("f64", 0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:949
assert_return(() => invoke($0, `lt`, [value("f64", -0.5), value("f64", -1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:950
assert_return(() => invoke($0, `lt`, [value("f64", -0.5), value("f64", 1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:951
assert_return(() => invoke($0, `lt`, [value("f64", 0.5), value("f64", -1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:952
assert_return(() => invoke($0, `lt`, [value("f64", 0.5), value("f64", 1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:953
assert_return(
  () => invoke($0, `lt`, [value("f64", -0.5), value("f64", -6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:954
assert_return(
  () => invoke($0, `lt`, [value("f64", -0.5), value("f64", 6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:955
assert_return(
  () => invoke($0, `lt`, [value("f64", 0.5), value("f64", -6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:956
assert_return(
  () => invoke($0, `lt`, [value("f64", 0.5), value("f64", 6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:957
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.5),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:958
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.5),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:959
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.5),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:960
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.5),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:961
assert_return(() => invoke($0, `lt`, [value("f64", -0.5), value("f64", -Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:962
assert_return(() => invoke($0, `lt`, [value("f64", -0.5), value("f64", Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:963
assert_return(() => invoke($0, `lt`, [value("f64", 0.5), value("f64", -Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:964
assert_return(() => invoke($0, `lt`, [value("f64", 0.5), value("f64", Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:965
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:966
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:967
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:968
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:969
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:970
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:971
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:972
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:973
assert_return(() => invoke($0, `lt`, [value("f64", -1), value("f64", -0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:974
assert_return(() => invoke($0, `lt`, [value("f64", -1), value("f64", 0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:975
assert_return(() => invoke($0, `lt`, [value("f64", 1), value("f64", -0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:976
assert_return(() => invoke($0, `lt`, [value("f64", 1), value("f64", 0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:977
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -1),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:978
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -1),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:979
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 1),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:980
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 1),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:981
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -1),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:982
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -1),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:983
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 1),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:984
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 1),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:985
assert_return(() => invoke($0, `lt`, [value("f64", -1), value("f64", -0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:986
assert_return(() => invoke($0, `lt`, [value("f64", -1), value("f64", 0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:987
assert_return(() => invoke($0, `lt`, [value("f64", 1), value("f64", -0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:988
assert_return(() => invoke($0, `lt`, [value("f64", 1), value("f64", 0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:989
assert_return(() => invoke($0, `lt`, [value("f64", -1), value("f64", -1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:990
assert_return(() => invoke($0, `lt`, [value("f64", -1), value("f64", 1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:991
assert_return(() => invoke($0, `lt`, [value("f64", 1), value("f64", -1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:992
assert_return(() => invoke($0, `lt`, [value("f64", 1), value("f64", 1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:993
assert_return(
  () => invoke($0, `lt`, [value("f64", -1), value("f64", -6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:994
assert_return(
  () => invoke($0, `lt`, [value("f64", -1), value("f64", 6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:995
assert_return(
  () => invoke($0, `lt`, [value("f64", 1), value("f64", -6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:996
assert_return(
  () => invoke($0, `lt`, [value("f64", 1), value("f64", 6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:997
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -1),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:998
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -1),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:999
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 1),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1000
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 1),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1001
assert_return(() => invoke($0, `lt`, [value("f64", -1), value("f64", -Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1002
assert_return(() => invoke($0, `lt`, [value("f64", -1), value("f64", Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1003
assert_return(() => invoke($0, `lt`, [value("f64", 1), value("f64", -Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1004
assert_return(() => invoke($0, `lt`, [value("f64", 1), value("f64", Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1005
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1006
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1007
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1008
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1009
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1010
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1011
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1012
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1013
assert_return(
  () => invoke($0, `lt`, [value("f64", -6.283185307179586), value("f64", -0)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1014
assert_return(
  () => invoke($0, `lt`, [value("f64", -6.283185307179586), value("f64", 0)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1015
assert_return(
  () => invoke($0, `lt`, [value("f64", 6.283185307179586), value("f64", -0)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1016
assert_return(
  () => invoke($0, `lt`, [value("f64", 6.283185307179586), value("f64", 0)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1017
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -6.283185307179586),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1018
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -6.283185307179586),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1019
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 6.283185307179586),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1020
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 6.283185307179586),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1021
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -6.283185307179586),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1022
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -6.283185307179586),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1023
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 6.283185307179586),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1024
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 6.283185307179586),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1025
assert_return(
  () => invoke($0, `lt`, [value("f64", -6.283185307179586), value("f64", -0.5)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1026
assert_return(
  () => invoke($0, `lt`, [value("f64", -6.283185307179586), value("f64", 0.5)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1027
assert_return(
  () => invoke($0, `lt`, [value("f64", 6.283185307179586), value("f64", -0.5)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1028
assert_return(
  () => invoke($0, `lt`, [value("f64", 6.283185307179586), value("f64", 0.5)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1029
assert_return(
  () => invoke($0, `lt`, [value("f64", -6.283185307179586), value("f64", -1)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1030
assert_return(
  () => invoke($0, `lt`, [value("f64", -6.283185307179586), value("f64", 1)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1031
assert_return(
  () => invoke($0, `lt`, [value("f64", 6.283185307179586), value("f64", -1)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1032
assert_return(
  () => invoke($0, `lt`, [value("f64", 6.283185307179586), value("f64", 1)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1033
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -6.283185307179586),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1034
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -6.283185307179586),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1035
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 6.283185307179586),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1036
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 6.283185307179586),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1037
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -6.283185307179586),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1038
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -6.283185307179586),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1039
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 6.283185307179586),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1040
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 6.283185307179586),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1041
assert_return(
  () => invoke($0, `lt`, [value("f64", -6.283185307179586), value("f64", -Infinity)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1042
assert_return(
  () => invoke($0, `lt`, [value("f64", -6.283185307179586), value("f64", Infinity)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1043
assert_return(
  () => invoke($0, `lt`, [value("f64", 6.283185307179586), value("f64", -Infinity)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1044
assert_return(
  () => invoke($0, `lt`, [value("f64", 6.283185307179586), value("f64", Infinity)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1045
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1046
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1047
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1048
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1049
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1050
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1051
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1052
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1053
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1054
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1055
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1056
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1057
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1058
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1059
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1060
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1061
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1062
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1063
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1064
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1065
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1066
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1067
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1068
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1069
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1070
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1071
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1072
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1073
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1074
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1075
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1076
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1077
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1078
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1079
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1080
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1081
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1082
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1083
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1084
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1085
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1086
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1087
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1088
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1089
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1090
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1091
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1092
assert_return(
  () => invoke($0, `lt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1093
assert_return(() => invoke($0, `lt`, [value("f64", -Infinity), value("f64", -0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1094
assert_return(() => invoke($0, `lt`, [value("f64", -Infinity), value("f64", 0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1095
assert_return(() => invoke($0, `lt`, [value("f64", Infinity), value("f64", -0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1096
assert_return(() => invoke($0, `lt`, [value("f64", Infinity), value("f64", 0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1097
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -Infinity),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1098
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -Infinity),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1099
assert_return(
  () => invoke($0, `lt`, [
    value("f64", Infinity),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1100
assert_return(
  () => invoke($0, `lt`, [
    value("f64", Infinity),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1101
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -Infinity),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1102
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -Infinity),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1103
assert_return(
  () => invoke($0, `lt`, [
    value("f64", Infinity),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1104
assert_return(
  () => invoke($0, `lt`, [
    value("f64", Infinity),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1105
assert_return(() => invoke($0, `lt`, [value("f64", -Infinity), value("f64", -0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1106
assert_return(() => invoke($0, `lt`, [value("f64", -Infinity), value("f64", 0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1107
assert_return(() => invoke($0, `lt`, [value("f64", Infinity), value("f64", -0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1108
assert_return(() => invoke($0, `lt`, [value("f64", Infinity), value("f64", 0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1109
assert_return(() => invoke($0, `lt`, [value("f64", -Infinity), value("f64", -1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1110
assert_return(() => invoke($0, `lt`, [value("f64", -Infinity), value("f64", 1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1111
assert_return(() => invoke($0, `lt`, [value("f64", Infinity), value("f64", -1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1112
assert_return(() => invoke($0, `lt`, [value("f64", Infinity), value("f64", 1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1113
assert_return(
  () => invoke($0, `lt`, [value("f64", -Infinity), value("f64", -6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1114
assert_return(
  () => invoke($0, `lt`, [value("f64", -Infinity), value("f64", 6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1115
assert_return(
  () => invoke($0, `lt`, [value("f64", Infinity), value("f64", -6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1116
assert_return(
  () => invoke($0, `lt`, [value("f64", Infinity), value("f64", 6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1117
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -Infinity),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1118
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -Infinity),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1119
assert_return(
  () => invoke($0, `lt`, [
    value("f64", Infinity),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1120
assert_return(
  () => invoke($0, `lt`, [
    value("f64", Infinity),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1121
assert_return(
  () => invoke($0, `lt`, [value("f64", -Infinity), value("f64", -Infinity)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1122
assert_return(
  () => invoke($0, `lt`, [value("f64", -Infinity), value("f64", Infinity)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1123
assert_return(
  () => invoke($0, `lt`, [value("f64", Infinity), value("f64", -Infinity)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1124
assert_return(
  () => invoke($0, `lt`, [value("f64", Infinity), value("f64", Infinity)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1125
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1126
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1127
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1128
assert_return(
  () => invoke($0, `lt`, [
    value("f64", -Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1129
assert_return(
  () => invoke($0, `lt`, [
    value("f64", Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1130
assert_return(
  () => invoke($0, `lt`, [
    value("f64", Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1131
assert_return(
  () => invoke($0, `lt`, [
    value("f64", Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1132
assert_return(
  () => invoke($0, `lt`, [
    value("f64", Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1133
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1134
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1135
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1136
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1137
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1138
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1139
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1140
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1141
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1142
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1143
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1144
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1145
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1146
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1147
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1148
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1149
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1150
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1151
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1152
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1153
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1154
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1155
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1156
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1157
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1158
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1159
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1160
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1161
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1162
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1163
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1164
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1165
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1166
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1167
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1168
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1169
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1170
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1171
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1172
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1173
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1174
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1175
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1176
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1177
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1178
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1179
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1180
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1181
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1182
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1183
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1184
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1185
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1186
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1187
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1188
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1189
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1190
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1191
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1192
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1193
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1194
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1195
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1196
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1197
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1198
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1199
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1200
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1201
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1202
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1203
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1204
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1205
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1206
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1207
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1208
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1209
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1210
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1211
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1212
assert_return(
  () => invoke($0, `lt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1213
assert_return(() => invoke($0, `le`, [value("f64", -0), value("f64", -0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1214
assert_return(() => invoke($0, `le`, [value("f64", -0), value("f64", 0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1215
assert_return(() => invoke($0, `le`, [value("f64", 0), value("f64", -0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1216
assert_return(() => invoke($0, `le`, [value("f64", 0), value("f64", 0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1217
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1218
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1219
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1220
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1221
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1222
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1223
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1224
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1225
assert_return(() => invoke($0, `le`, [value("f64", -0), value("f64", -0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1226
assert_return(() => invoke($0, `le`, [value("f64", -0), value("f64", 0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1227
assert_return(() => invoke($0, `le`, [value("f64", 0), value("f64", -0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1228
assert_return(() => invoke($0, `le`, [value("f64", 0), value("f64", 0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1229
assert_return(() => invoke($0, `le`, [value("f64", -0), value("f64", -1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1230
assert_return(() => invoke($0, `le`, [value("f64", -0), value("f64", 1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1231
assert_return(() => invoke($0, `le`, [value("f64", 0), value("f64", -1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1232
assert_return(() => invoke($0, `le`, [value("f64", 0), value("f64", 1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1233
assert_return(
  () => invoke($0, `le`, [value("f64", -0), value("f64", -6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1234
assert_return(
  () => invoke($0, `le`, [value("f64", -0), value("f64", 6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1235
assert_return(
  () => invoke($0, `le`, [value("f64", 0), value("f64", -6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1236
assert_return(
  () => invoke($0, `le`, [value("f64", 0), value("f64", 6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1237
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1238
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1239
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1240
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1241
assert_return(() => invoke($0, `le`, [value("f64", -0), value("f64", -Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1242
assert_return(() => invoke($0, `le`, [value("f64", -0), value("f64", Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1243
assert_return(() => invoke($0, `le`, [value("f64", 0), value("f64", -Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1244
assert_return(() => invoke($0, `le`, [value("f64", 0), value("f64", Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1245
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1246
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1247
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1248
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1249
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1250
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1251
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1252
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1253
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1254
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1255
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1256
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1257
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1258
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1259
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1260
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1261
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1262
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1263
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1264
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1265
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1266
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1267
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1268
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1269
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1270
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1271
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1272
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1273
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1274
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1275
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1276
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1277
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1278
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1279
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1280
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1281
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1282
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1283
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1284
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1285
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1286
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1287
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1288
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1289
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1290
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1291
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1292
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1293
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1294
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1295
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1296
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1297
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1298
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1299
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1300
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1301
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1302
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1303
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1304
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1305
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1306
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1307
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1308
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1309
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1310
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1311
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1312
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1313
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1314
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1315
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1316
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1317
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1318
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1319
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1320
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1321
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1322
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1323
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1324
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1325
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1326
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1327
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1328
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1329
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1330
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1331
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1332
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1333
assert_return(() => invoke($0, `le`, [value("f64", -0.5), value("f64", -0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1334
assert_return(() => invoke($0, `le`, [value("f64", -0.5), value("f64", 0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1335
assert_return(() => invoke($0, `le`, [value("f64", 0.5), value("f64", -0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1336
assert_return(() => invoke($0, `le`, [value("f64", 0.5), value("f64", 0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1337
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.5),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1338
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.5),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1339
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.5),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1340
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.5),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1341
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.5),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1342
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.5),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1343
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.5),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1344
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.5),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1345
assert_return(() => invoke($0, `le`, [value("f64", -0.5), value("f64", -0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1346
assert_return(() => invoke($0, `le`, [value("f64", -0.5), value("f64", 0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1347
assert_return(() => invoke($0, `le`, [value("f64", 0.5), value("f64", -0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1348
assert_return(() => invoke($0, `le`, [value("f64", 0.5), value("f64", 0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1349
assert_return(() => invoke($0, `le`, [value("f64", -0.5), value("f64", -1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1350
assert_return(() => invoke($0, `le`, [value("f64", -0.5), value("f64", 1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1351
assert_return(() => invoke($0, `le`, [value("f64", 0.5), value("f64", -1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1352
assert_return(() => invoke($0, `le`, [value("f64", 0.5), value("f64", 1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1353
assert_return(
  () => invoke($0, `le`, [value("f64", -0.5), value("f64", -6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1354
assert_return(
  () => invoke($0, `le`, [value("f64", -0.5), value("f64", 6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1355
assert_return(
  () => invoke($0, `le`, [value("f64", 0.5), value("f64", -6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1356
assert_return(
  () => invoke($0, `le`, [value("f64", 0.5), value("f64", 6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1357
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.5),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1358
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.5),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1359
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.5),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1360
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.5),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1361
assert_return(() => invoke($0, `le`, [value("f64", -0.5), value("f64", -Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1362
assert_return(() => invoke($0, `le`, [value("f64", -0.5), value("f64", Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1363
assert_return(() => invoke($0, `le`, [value("f64", 0.5), value("f64", -Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1364
assert_return(() => invoke($0, `le`, [value("f64", 0.5), value("f64", Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1365
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1366
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1367
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1368
assert_return(
  () => invoke($0, `le`, [
    value("f64", -0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1369
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1370
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1371
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1372
assert_return(
  () => invoke($0, `le`, [
    value("f64", 0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1373
assert_return(() => invoke($0, `le`, [value("f64", -1), value("f64", -0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1374
assert_return(() => invoke($0, `le`, [value("f64", -1), value("f64", 0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1375
assert_return(() => invoke($0, `le`, [value("f64", 1), value("f64", -0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1376
assert_return(() => invoke($0, `le`, [value("f64", 1), value("f64", 0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1377
assert_return(
  () => invoke($0, `le`, [
    value("f64", -1),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1378
assert_return(
  () => invoke($0, `le`, [
    value("f64", -1),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1379
assert_return(
  () => invoke($0, `le`, [
    value("f64", 1),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1380
assert_return(
  () => invoke($0, `le`, [
    value("f64", 1),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1381
assert_return(
  () => invoke($0, `le`, [
    value("f64", -1),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1382
assert_return(
  () => invoke($0, `le`, [
    value("f64", -1),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1383
assert_return(
  () => invoke($0, `le`, [
    value("f64", 1),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1384
assert_return(
  () => invoke($0, `le`, [
    value("f64", 1),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1385
assert_return(() => invoke($0, `le`, [value("f64", -1), value("f64", -0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1386
assert_return(() => invoke($0, `le`, [value("f64", -1), value("f64", 0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1387
assert_return(() => invoke($0, `le`, [value("f64", 1), value("f64", -0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1388
assert_return(() => invoke($0, `le`, [value("f64", 1), value("f64", 0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1389
assert_return(() => invoke($0, `le`, [value("f64", -1), value("f64", -1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1390
assert_return(() => invoke($0, `le`, [value("f64", -1), value("f64", 1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1391
assert_return(() => invoke($0, `le`, [value("f64", 1), value("f64", -1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1392
assert_return(() => invoke($0, `le`, [value("f64", 1), value("f64", 1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1393
assert_return(
  () => invoke($0, `le`, [value("f64", -1), value("f64", -6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1394
assert_return(
  () => invoke($0, `le`, [value("f64", -1), value("f64", 6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1395
assert_return(
  () => invoke($0, `le`, [value("f64", 1), value("f64", -6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1396
assert_return(
  () => invoke($0, `le`, [value("f64", 1), value("f64", 6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1397
assert_return(
  () => invoke($0, `le`, [
    value("f64", -1),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1398
assert_return(
  () => invoke($0, `le`, [
    value("f64", -1),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1399
assert_return(
  () => invoke($0, `le`, [
    value("f64", 1),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1400
assert_return(
  () => invoke($0, `le`, [
    value("f64", 1),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1401
assert_return(() => invoke($0, `le`, [value("f64", -1), value("f64", -Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1402
assert_return(() => invoke($0, `le`, [value("f64", -1), value("f64", Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1403
assert_return(() => invoke($0, `le`, [value("f64", 1), value("f64", -Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1404
assert_return(() => invoke($0, `le`, [value("f64", 1), value("f64", Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1405
assert_return(
  () => invoke($0, `le`, [
    value("f64", -1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1406
assert_return(
  () => invoke($0, `le`, [
    value("f64", -1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1407
assert_return(
  () => invoke($0, `le`, [
    value("f64", -1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1408
assert_return(
  () => invoke($0, `le`, [
    value("f64", -1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1409
assert_return(
  () => invoke($0, `le`, [
    value("f64", 1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1410
assert_return(
  () => invoke($0, `le`, [
    value("f64", 1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1411
assert_return(
  () => invoke($0, `le`, [
    value("f64", 1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1412
assert_return(
  () => invoke($0, `le`, [
    value("f64", 1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1413
assert_return(
  () => invoke($0, `le`, [value("f64", -6.283185307179586), value("f64", -0)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1414
assert_return(
  () => invoke($0, `le`, [value("f64", -6.283185307179586), value("f64", 0)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1415
assert_return(
  () => invoke($0, `le`, [value("f64", 6.283185307179586), value("f64", -0)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1416
assert_return(
  () => invoke($0, `le`, [value("f64", 6.283185307179586), value("f64", 0)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1417
assert_return(
  () => invoke($0, `le`, [
    value("f64", -6.283185307179586),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1418
assert_return(
  () => invoke($0, `le`, [
    value("f64", -6.283185307179586),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1419
assert_return(
  () => invoke($0, `le`, [
    value("f64", 6.283185307179586),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1420
assert_return(
  () => invoke($0, `le`, [
    value("f64", 6.283185307179586),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1421
assert_return(
  () => invoke($0, `le`, [
    value("f64", -6.283185307179586),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1422
assert_return(
  () => invoke($0, `le`, [
    value("f64", -6.283185307179586),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1423
assert_return(
  () => invoke($0, `le`, [
    value("f64", 6.283185307179586),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1424
assert_return(
  () => invoke($0, `le`, [
    value("f64", 6.283185307179586),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1425
assert_return(
  () => invoke($0, `le`, [value("f64", -6.283185307179586), value("f64", -0.5)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1426
assert_return(
  () => invoke($0, `le`, [value("f64", -6.283185307179586), value("f64", 0.5)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1427
assert_return(
  () => invoke($0, `le`, [value("f64", 6.283185307179586), value("f64", -0.5)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1428
assert_return(
  () => invoke($0, `le`, [value("f64", 6.283185307179586), value("f64", 0.5)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1429
assert_return(
  () => invoke($0, `le`, [value("f64", -6.283185307179586), value("f64", -1)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1430
assert_return(
  () => invoke($0, `le`, [value("f64", -6.283185307179586), value("f64", 1)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1431
assert_return(
  () => invoke($0, `le`, [value("f64", 6.283185307179586), value("f64", -1)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1432
assert_return(
  () => invoke($0, `le`, [value("f64", 6.283185307179586), value("f64", 1)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1433
assert_return(
  () => invoke($0, `le`, [
    value("f64", -6.283185307179586),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1434
assert_return(
  () => invoke($0, `le`, [
    value("f64", -6.283185307179586),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1435
assert_return(
  () => invoke($0, `le`, [
    value("f64", 6.283185307179586),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1436
assert_return(
  () => invoke($0, `le`, [
    value("f64", 6.283185307179586),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1437
assert_return(
  () => invoke($0, `le`, [
    value("f64", -6.283185307179586),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1438
assert_return(
  () => invoke($0, `le`, [
    value("f64", -6.283185307179586),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1439
assert_return(
  () => invoke($0, `le`, [
    value("f64", 6.283185307179586),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1440
assert_return(
  () => invoke($0, `le`, [
    value("f64", 6.283185307179586),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1441
assert_return(
  () => invoke($0, `le`, [value("f64", -6.283185307179586), value("f64", -Infinity)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1442
assert_return(
  () => invoke($0, `le`, [value("f64", -6.283185307179586), value("f64", Infinity)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1443
assert_return(
  () => invoke($0, `le`, [value("f64", 6.283185307179586), value("f64", -Infinity)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1444
assert_return(
  () => invoke($0, `le`, [value("f64", 6.283185307179586), value("f64", Infinity)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1445
assert_return(
  () => invoke($0, `le`, [
    value("f64", -6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1446
assert_return(
  () => invoke($0, `le`, [
    value("f64", -6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1447
assert_return(
  () => invoke($0, `le`, [
    value("f64", -6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1448
assert_return(
  () => invoke($0, `le`, [
    value("f64", -6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1449
assert_return(
  () => invoke($0, `le`, [
    value("f64", 6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1450
assert_return(
  () => invoke($0, `le`, [
    value("f64", 6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1451
assert_return(
  () => invoke($0, `le`, [
    value("f64", 6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1452
assert_return(
  () => invoke($0, `le`, [
    value("f64", 6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1453
assert_return(
  () => invoke($0, `le`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1454
assert_return(
  () => invoke($0, `le`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1455
assert_return(
  () => invoke($0, `le`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1456
assert_return(
  () => invoke($0, `le`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1457
assert_return(
  () => invoke($0, `le`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1458
assert_return(
  () => invoke($0, `le`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1459
assert_return(
  () => invoke($0, `le`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1460
assert_return(
  () => invoke($0, `le`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1461
assert_return(
  () => invoke($0, `le`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1462
assert_return(
  () => invoke($0, `le`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1463
assert_return(
  () => invoke($0, `le`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1464
assert_return(
  () => invoke($0, `le`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1465
assert_return(
  () => invoke($0, `le`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1466
assert_return(
  () => invoke($0, `le`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1467
assert_return(
  () => invoke($0, `le`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1468
assert_return(
  () => invoke($0, `le`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1469
assert_return(
  () => invoke($0, `le`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1470
assert_return(
  () => invoke($0, `le`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1471
assert_return(
  () => invoke($0, `le`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1472
assert_return(
  () => invoke($0, `le`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1473
assert_return(
  () => invoke($0, `le`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1474
assert_return(
  () => invoke($0, `le`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1475
assert_return(
  () => invoke($0, `le`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1476
assert_return(
  () => invoke($0, `le`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1477
assert_return(
  () => invoke($0, `le`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1478
assert_return(
  () => invoke($0, `le`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1479
assert_return(
  () => invoke($0, `le`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1480
assert_return(
  () => invoke($0, `le`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1481
assert_return(
  () => invoke($0, `le`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1482
assert_return(
  () => invoke($0, `le`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1483
assert_return(
  () => invoke($0, `le`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1484
assert_return(
  () => invoke($0, `le`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1485
assert_return(
  () => invoke($0, `le`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1486
assert_return(
  () => invoke($0, `le`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1487
assert_return(
  () => invoke($0, `le`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1488
assert_return(
  () => invoke($0, `le`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1489
assert_return(
  () => invoke($0, `le`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1490
assert_return(
  () => invoke($0, `le`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1491
assert_return(
  () => invoke($0, `le`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1492
assert_return(
  () => invoke($0, `le`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1493
assert_return(() => invoke($0, `le`, [value("f64", -Infinity), value("f64", -0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1494
assert_return(() => invoke($0, `le`, [value("f64", -Infinity), value("f64", 0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1495
assert_return(() => invoke($0, `le`, [value("f64", Infinity), value("f64", -0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1496
assert_return(() => invoke($0, `le`, [value("f64", Infinity), value("f64", 0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1497
assert_return(
  () => invoke($0, `le`, [
    value("f64", -Infinity),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1498
assert_return(
  () => invoke($0, `le`, [
    value("f64", -Infinity),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1499
assert_return(
  () => invoke($0, `le`, [
    value("f64", Infinity),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1500
assert_return(
  () => invoke($0, `le`, [
    value("f64", Infinity),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1501
assert_return(
  () => invoke($0, `le`, [
    value("f64", -Infinity),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1502
assert_return(
  () => invoke($0, `le`, [
    value("f64", -Infinity),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1503
assert_return(
  () => invoke($0, `le`, [
    value("f64", Infinity),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1504
assert_return(
  () => invoke($0, `le`, [
    value("f64", Infinity),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1505
assert_return(() => invoke($0, `le`, [value("f64", -Infinity), value("f64", -0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1506
assert_return(() => invoke($0, `le`, [value("f64", -Infinity), value("f64", 0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1507
assert_return(() => invoke($0, `le`, [value("f64", Infinity), value("f64", -0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1508
assert_return(() => invoke($0, `le`, [value("f64", Infinity), value("f64", 0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1509
assert_return(() => invoke($0, `le`, [value("f64", -Infinity), value("f64", -1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1510
assert_return(() => invoke($0, `le`, [value("f64", -Infinity), value("f64", 1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1511
assert_return(() => invoke($0, `le`, [value("f64", Infinity), value("f64", -1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1512
assert_return(() => invoke($0, `le`, [value("f64", Infinity), value("f64", 1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1513
assert_return(
  () => invoke($0, `le`, [value("f64", -Infinity), value("f64", -6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1514
assert_return(
  () => invoke($0, `le`, [value("f64", -Infinity), value("f64", 6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1515
assert_return(
  () => invoke($0, `le`, [value("f64", Infinity), value("f64", -6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1516
assert_return(
  () => invoke($0, `le`, [value("f64", Infinity), value("f64", 6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1517
assert_return(
  () => invoke($0, `le`, [
    value("f64", -Infinity),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1518
assert_return(
  () => invoke($0, `le`, [
    value("f64", -Infinity),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1519
assert_return(
  () => invoke($0, `le`, [
    value("f64", Infinity),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1520
assert_return(
  () => invoke($0, `le`, [
    value("f64", Infinity),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1521
assert_return(
  () => invoke($0, `le`, [value("f64", -Infinity), value("f64", -Infinity)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1522
assert_return(
  () => invoke($0, `le`, [value("f64", -Infinity), value("f64", Infinity)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1523
assert_return(
  () => invoke($0, `le`, [value("f64", Infinity), value("f64", -Infinity)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1524
assert_return(
  () => invoke($0, `le`, [value("f64", Infinity), value("f64", Infinity)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1525
assert_return(
  () => invoke($0, `le`, [
    value("f64", -Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1526
assert_return(
  () => invoke($0, `le`, [
    value("f64", -Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1527
assert_return(
  () => invoke($0, `le`, [
    value("f64", -Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1528
assert_return(
  () => invoke($0, `le`, [
    value("f64", -Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1529
assert_return(
  () => invoke($0, `le`, [
    value("f64", Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1530
assert_return(
  () => invoke($0, `le`, [
    value("f64", Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1531
assert_return(
  () => invoke($0, `le`, [
    value("f64", Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1532
assert_return(
  () => invoke($0, `le`, [
    value("f64", Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1533
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1534
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1535
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1536
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1537
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1538
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1539
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1540
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1541
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1542
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1543
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1544
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1545
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1546
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1547
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1548
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1549
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1550
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1551
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1552
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1553
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1554
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1555
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1556
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1557
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1558
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1559
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1560
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1561
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1562
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1563
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1564
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1565
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1566
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1567
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1568
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1569
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1570
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1571
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1572
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1573
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1574
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1575
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1576
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1577
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1578
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1579
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1580
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1581
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1582
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1583
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1584
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1585
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1586
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1587
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1588
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1589
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1590
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1591
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1592
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1593
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1594
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1595
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1596
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1597
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1598
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1599
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1600
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1601
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1602
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1603
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1604
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1605
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1606
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1607
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1608
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1609
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1610
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1611
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1612
assert_return(
  () => invoke($0, `le`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1613
assert_return(() => invoke($0, `gt`, [value("f64", -0), value("f64", -0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1614
assert_return(() => invoke($0, `gt`, [value("f64", -0), value("f64", 0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1615
assert_return(() => invoke($0, `gt`, [value("f64", 0), value("f64", -0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1616
assert_return(() => invoke($0, `gt`, [value("f64", 0), value("f64", 0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1617
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1618
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1619
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1620
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1621
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1622
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1623
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1624
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1625
assert_return(() => invoke($0, `gt`, [value("f64", -0), value("f64", -0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1626
assert_return(() => invoke($0, `gt`, [value("f64", -0), value("f64", 0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1627
assert_return(() => invoke($0, `gt`, [value("f64", 0), value("f64", -0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1628
assert_return(() => invoke($0, `gt`, [value("f64", 0), value("f64", 0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1629
assert_return(() => invoke($0, `gt`, [value("f64", -0), value("f64", -1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1630
assert_return(() => invoke($0, `gt`, [value("f64", -0), value("f64", 1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1631
assert_return(() => invoke($0, `gt`, [value("f64", 0), value("f64", -1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1632
assert_return(() => invoke($0, `gt`, [value("f64", 0), value("f64", 1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1633
assert_return(
  () => invoke($0, `gt`, [value("f64", -0), value("f64", -6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1634
assert_return(
  () => invoke($0, `gt`, [value("f64", -0), value("f64", 6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1635
assert_return(
  () => invoke($0, `gt`, [value("f64", 0), value("f64", -6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1636
assert_return(
  () => invoke($0, `gt`, [value("f64", 0), value("f64", 6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1637
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1638
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1639
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1640
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1641
assert_return(() => invoke($0, `gt`, [value("f64", -0), value("f64", -Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1642
assert_return(() => invoke($0, `gt`, [value("f64", -0), value("f64", Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1643
assert_return(() => invoke($0, `gt`, [value("f64", 0), value("f64", -Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1644
assert_return(() => invoke($0, `gt`, [value("f64", 0), value("f64", Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1645
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1646
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1647
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1648
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1649
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1650
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1651
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1652
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1653
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1654
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1655
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1656
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1657
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1658
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1659
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1660
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1661
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1662
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1663
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1664
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1665
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1666
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1667
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1668
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1669
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1670
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1671
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1672
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1673
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1674
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1675
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1676
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1677
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1678
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1679
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1680
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1681
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1682
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1683
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1684
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1685
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1686
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1687
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1688
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1689
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1690
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1691
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1692
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1693
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1694
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1695
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1696
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1697
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1698
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1699
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1700
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1701
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1702
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1703
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1704
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1705
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1706
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1707
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1708
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1709
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1710
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1711
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1712
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1713
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1714
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1715
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1716
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1717
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1718
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1719
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1720
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1721
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1722
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1723
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1724
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1725
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1726
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1727
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1728
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1729
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1730
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1731
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1732
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1733
assert_return(() => invoke($0, `gt`, [value("f64", -0.5), value("f64", -0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1734
assert_return(() => invoke($0, `gt`, [value("f64", -0.5), value("f64", 0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1735
assert_return(() => invoke($0, `gt`, [value("f64", 0.5), value("f64", -0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1736
assert_return(() => invoke($0, `gt`, [value("f64", 0.5), value("f64", 0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1737
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.5),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1738
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.5),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1739
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.5),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1740
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.5),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1741
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.5),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1742
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.5),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1743
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.5),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1744
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.5),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1745
assert_return(() => invoke($0, `gt`, [value("f64", -0.5), value("f64", -0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1746
assert_return(() => invoke($0, `gt`, [value("f64", -0.5), value("f64", 0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1747
assert_return(() => invoke($0, `gt`, [value("f64", 0.5), value("f64", -0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1748
assert_return(() => invoke($0, `gt`, [value("f64", 0.5), value("f64", 0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1749
assert_return(() => invoke($0, `gt`, [value("f64", -0.5), value("f64", -1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1750
assert_return(() => invoke($0, `gt`, [value("f64", -0.5), value("f64", 1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1751
assert_return(() => invoke($0, `gt`, [value("f64", 0.5), value("f64", -1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1752
assert_return(() => invoke($0, `gt`, [value("f64", 0.5), value("f64", 1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1753
assert_return(
  () => invoke($0, `gt`, [value("f64", -0.5), value("f64", -6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1754
assert_return(
  () => invoke($0, `gt`, [value("f64", -0.5), value("f64", 6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1755
assert_return(
  () => invoke($0, `gt`, [value("f64", 0.5), value("f64", -6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1756
assert_return(
  () => invoke($0, `gt`, [value("f64", 0.5), value("f64", 6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1757
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.5),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1758
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.5),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1759
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.5),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1760
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.5),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1761
assert_return(() => invoke($0, `gt`, [value("f64", -0.5), value("f64", -Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1762
assert_return(() => invoke($0, `gt`, [value("f64", -0.5), value("f64", Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1763
assert_return(() => invoke($0, `gt`, [value("f64", 0.5), value("f64", -Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1764
assert_return(() => invoke($0, `gt`, [value("f64", 0.5), value("f64", Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1765
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1766
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1767
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1768
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1769
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1770
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1771
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1772
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1773
assert_return(() => invoke($0, `gt`, [value("f64", -1), value("f64", -0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1774
assert_return(() => invoke($0, `gt`, [value("f64", -1), value("f64", 0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1775
assert_return(() => invoke($0, `gt`, [value("f64", 1), value("f64", -0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1776
assert_return(() => invoke($0, `gt`, [value("f64", 1), value("f64", 0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1777
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -1),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1778
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -1),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1779
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 1),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1780
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 1),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1781
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -1),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1782
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -1),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1783
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 1),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1784
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 1),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1785
assert_return(() => invoke($0, `gt`, [value("f64", -1), value("f64", -0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1786
assert_return(() => invoke($0, `gt`, [value("f64", -1), value("f64", 0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1787
assert_return(() => invoke($0, `gt`, [value("f64", 1), value("f64", -0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1788
assert_return(() => invoke($0, `gt`, [value("f64", 1), value("f64", 0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1789
assert_return(() => invoke($0, `gt`, [value("f64", -1), value("f64", -1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1790
assert_return(() => invoke($0, `gt`, [value("f64", -1), value("f64", 1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1791
assert_return(() => invoke($0, `gt`, [value("f64", 1), value("f64", -1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1792
assert_return(() => invoke($0, `gt`, [value("f64", 1), value("f64", 1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1793
assert_return(
  () => invoke($0, `gt`, [value("f64", -1), value("f64", -6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1794
assert_return(
  () => invoke($0, `gt`, [value("f64", -1), value("f64", 6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1795
assert_return(
  () => invoke($0, `gt`, [value("f64", 1), value("f64", -6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1796
assert_return(
  () => invoke($0, `gt`, [value("f64", 1), value("f64", 6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1797
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -1),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1798
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -1),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1799
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 1),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1800
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 1),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1801
assert_return(() => invoke($0, `gt`, [value("f64", -1), value("f64", -Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1802
assert_return(() => invoke($0, `gt`, [value("f64", -1), value("f64", Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1803
assert_return(() => invoke($0, `gt`, [value("f64", 1), value("f64", -Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1804
assert_return(() => invoke($0, `gt`, [value("f64", 1), value("f64", Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1805
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1806
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1807
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1808
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1809
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1810
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1811
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1812
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1813
assert_return(
  () => invoke($0, `gt`, [value("f64", -6.283185307179586), value("f64", -0)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1814
assert_return(
  () => invoke($0, `gt`, [value("f64", -6.283185307179586), value("f64", 0)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1815
assert_return(
  () => invoke($0, `gt`, [value("f64", 6.283185307179586), value("f64", -0)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1816
assert_return(
  () => invoke($0, `gt`, [value("f64", 6.283185307179586), value("f64", 0)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1817
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -6.283185307179586),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1818
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -6.283185307179586),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1819
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 6.283185307179586),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1820
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 6.283185307179586),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1821
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -6.283185307179586),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1822
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -6.283185307179586),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1823
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 6.283185307179586),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1824
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 6.283185307179586),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1825
assert_return(
  () => invoke($0, `gt`, [value("f64", -6.283185307179586), value("f64", -0.5)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1826
assert_return(
  () => invoke($0, `gt`, [value("f64", -6.283185307179586), value("f64", 0.5)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1827
assert_return(
  () => invoke($0, `gt`, [value("f64", 6.283185307179586), value("f64", -0.5)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1828
assert_return(
  () => invoke($0, `gt`, [value("f64", 6.283185307179586), value("f64", 0.5)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1829
assert_return(
  () => invoke($0, `gt`, [value("f64", -6.283185307179586), value("f64", -1)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1830
assert_return(
  () => invoke($0, `gt`, [value("f64", -6.283185307179586), value("f64", 1)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1831
assert_return(
  () => invoke($0, `gt`, [value("f64", 6.283185307179586), value("f64", -1)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1832
assert_return(
  () => invoke($0, `gt`, [value("f64", 6.283185307179586), value("f64", 1)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1833
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -6.283185307179586),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1834
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -6.283185307179586),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1835
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 6.283185307179586),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1836
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 6.283185307179586),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1837
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -6.283185307179586),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1838
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -6.283185307179586),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1839
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 6.283185307179586),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1840
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 6.283185307179586),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1841
assert_return(
  () => invoke($0, `gt`, [value("f64", -6.283185307179586), value("f64", -Infinity)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1842
assert_return(
  () => invoke($0, `gt`, [value("f64", -6.283185307179586), value("f64", Infinity)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1843
assert_return(
  () => invoke($0, `gt`, [value("f64", 6.283185307179586), value("f64", -Infinity)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1844
assert_return(
  () => invoke($0, `gt`, [value("f64", 6.283185307179586), value("f64", Infinity)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1845
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1846
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1847
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1848
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1849
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1850
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1851
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1852
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1853
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1854
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1855
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1856
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1857
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1858
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1859
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1860
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1861
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1862
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1863
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1864
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1865
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1866
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1867
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1868
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1869
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1870
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1871
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1872
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1873
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1874
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1875
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1876
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1877
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1878
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1879
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1880
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1881
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1882
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1883
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1884
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1885
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1886
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1887
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1888
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1889
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1890
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1891
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1892
assert_return(
  () => invoke($0, `gt`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1893
assert_return(() => invoke($0, `gt`, [value("f64", -Infinity), value("f64", -0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1894
assert_return(() => invoke($0, `gt`, [value("f64", -Infinity), value("f64", 0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1895
assert_return(() => invoke($0, `gt`, [value("f64", Infinity), value("f64", -0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1896
assert_return(() => invoke($0, `gt`, [value("f64", Infinity), value("f64", 0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1897
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -Infinity),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1898
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -Infinity),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1899
assert_return(
  () => invoke($0, `gt`, [
    value("f64", Infinity),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1900
assert_return(
  () => invoke($0, `gt`, [
    value("f64", Infinity),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1901
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -Infinity),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1902
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -Infinity),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1903
assert_return(
  () => invoke($0, `gt`, [
    value("f64", Infinity),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1904
assert_return(
  () => invoke($0, `gt`, [
    value("f64", Infinity),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1905
assert_return(() => invoke($0, `gt`, [value("f64", -Infinity), value("f64", -0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1906
assert_return(() => invoke($0, `gt`, [value("f64", -Infinity), value("f64", 0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1907
assert_return(() => invoke($0, `gt`, [value("f64", Infinity), value("f64", -0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1908
assert_return(() => invoke($0, `gt`, [value("f64", Infinity), value("f64", 0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1909
assert_return(() => invoke($0, `gt`, [value("f64", -Infinity), value("f64", -1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1910
assert_return(() => invoke($0, `gt`, [value("f64", -Infinity), value("f64", 1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:1911
assert_return(() => invoke($0, `gt`, [value("f64", Infinity), value("f64", -1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1912
assert_return(() => invoke($0, `gt`, [value("f64", Infinity), value("f64", 1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:1913
assert_return(
  () => invoke($0, `gt`, [value("f64", -Infinity), value("f64", -6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1914
assert_return(
  () => invoke($0, `gt`, [value("f64", -Infinity), value("f64", 6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1915
assert_return(
  () => invoke($0, `gt`, [value("f64", Infinity), value("f64", -6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1916
assert_return(
  () => invoke($0, `gt`, [value("f64", Infinity), value("f64", 6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1917
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -Infinity),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1918
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -Infinity),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1919
assert_return(
  () => invoke($0, `gt`, [
    value("f64", Infinity),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1920
assert_return(
  () => invoke($0, `gt`, [
    value("f64", Infinity),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1921
assert_return(
  () => invoke($0, `gt`, [value("f64", -Infinity), value("f64", -Infinity)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1922
assert_return(
  () => invoke($0, `gt`, [value("f64", -Infinity), value("f64", Infinity)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1923
assert_return(
  () => invoke($0, `gt`, [value("f64", Infinity), value("f64", -Infinity)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:1924
assert_return(
  () => invoke($0, `gt`, [value("f64", Infinity), value("f64", Infinity)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1925
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1926
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1927
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1928
assert_return(
  () => invoke($0, `gt`, [
    value("f64", -Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1929
assert_return(
  () => invoke($0, `gt`, [
    value("f64", Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1930
assert_return(
  () => invoke($0, `gt`, [
    value("f64", Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1931
assert_return(
  () => invoke($0, `gt`, [
    value("f64", Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1932
assert_return(
  () => invoke($0, `gt`, [
    value("f64", Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1933
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1934
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1935
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1936
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1937
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1938
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1939
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1940
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1941
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1942
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1943
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1944
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1945
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1946
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1947
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1948
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1949
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1950
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1951
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1952
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1953
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1954
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1955
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1956
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1957
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1958
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1959
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1960
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1961
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1962
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1963
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1964
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1965
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1966
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1967
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1968
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1969
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1970
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1971
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1972
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1973
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1974
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1975
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1976
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1977
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1978
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1979
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1980
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1981
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1982
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1983
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1984
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1985
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1986
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1987
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1988
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1989
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1990
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1991
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1992
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1993
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1994
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1995
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1996
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1997
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1998
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:1999
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2000
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2001
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2002
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2003
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2004
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2005
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2006
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2007
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2008
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2009
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2010
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2011
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2012
assert_return(
  () => invoke($0, `gt`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2013
assert_return(() => invoke($0, `ge`, [value("f64", -0), value("f64", -0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2014
assert_return(() => invoke($0, `ge`, [value("f64", -0), value("f64", 0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2015
assert_return(() => invoke($0, `ge`, [value("f64", 0), value("f64", -0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2016
assert_return(() => invoke($0, `ge`, [value("f64", 0), value("f64", 0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2017
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2018
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2019
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2020
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2021
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2022
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2023
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2024
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2025
assert_return(() => invoke($0, `ge`, [value("f64", -0), value("f64", -0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2026
assert_return(() => invoke($0, `ge`, [value("f64", -0), value("f64", 0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:2027
assert_return(() => invoke($0, `ge`, [value("f64", 0), value("f64", -0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2028
assert_return(() => invoke($0, `ge`, [value("f64", 0), value("f64", 0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:2029
assert_return(() => invoke($0, `ge`, [value("f64", -0), value("f64", -1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2030
assert_return(() => invoke($0, `ge`, [value("f64", -0), value("f64", 1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:2031
assert_return(() => invoke($0, `ge`, [value("f64", 0), value("f64", -1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2032
assert_return(() => invoke($0, `ge`, [value("f64", 0), value("f64", 1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:2033
assert_return(
  () => invoke($0, `ge`, [value("f64", -0), value("f64", -6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2034
assert_return(
  () => invoke($0, `ge`, [value("f64", -0), value("f64", 6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2035
assert_return(
  () => invoke($0, `ge`, [value("f64", 0), value("f64", -6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2036
assert_return(
  () => invoke($0, `ge`, [value("f64", 0), value("f64", 6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2037
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2038
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2039
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2040
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2041
assert_return(() => invoke($0, `ge`, [value("f64", -0), value("f64", -Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2042
assert_return(() => invoke($0, `ge`, [value("f64", -0), value("f64", Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:2043
assert_return(() => invoke($0, `ge`, [value("f64", 0), value("f64", -Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2044
assert_return(() => invoke($0, `ge`, [value("f64", 0), value("f64", Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:2045
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2046
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2047
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2048
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2049
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2050
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2051
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2052
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2053
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2054
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2055
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2056
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2057
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2058
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2059
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2060
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2061
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2062
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2063
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2064
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2065
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2066
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2067
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2068
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2069
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2070
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2071
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2072
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2073
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2074
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2075
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2076
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2077
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2078
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2079
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2080
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2081
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2082
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2083
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", -Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2084
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2085
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2086
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2087
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2088
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2089
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2090
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2091
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2092
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2093
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2094
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2095
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2096
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2097
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2098
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2099
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2100
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2101
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2102
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2103
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2104
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2105
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2106
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2107
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2108
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2109
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2110
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2111
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2112
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2113
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2114
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2115
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2116
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2117
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2118
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2119
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2120
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2121
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2122
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2123
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", -Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2124
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2125
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2126
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2127
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2128
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2129
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2130
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2131
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2132
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2133
assert_return(() => invoke($0, `ge`, [value("f64", -0.5), value("f64", -0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:2134
assert_return(() => invoke($0, `ge`, [value("f64", -0.5), value("f64", 0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:2135
assert_return(() => invoke($0, `ge`, [value("f64", 0.5), value("f64", -0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2136
assert_return(() => invoke($0, `ge`, [value("f64", 0.5), value("f64", 0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2137
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.5),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2138
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.5),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2139
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.5),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2140
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.5),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2141
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.5),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2142
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.5),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2143
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.5),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2144
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.5),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2145
assert_return(() => invoke($0, `ge`, [value("f64", -0.5), value("f64", -0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2146
assert_return(() => invoke($0, `ge`, [value("f64", -0.5), value("f64", 0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:2147
assert_return(() => invoke($0, `ge`, [value("f64", 0.5), value("f64", -0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2148
assert_return(() => invoke($0, `ge`, [value("f64", 0.5), value("f64", 0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2149
assert_return(() => invoke($0, `ge`, [value("f64", -0.5), value("f64", -1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2150
assert_return(() => invoke($0, `ge`, [value("f64", -0.5), value("f64", 1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:2151
assert_return(() => invoke($0, `ge`, [value("f64", 0.5), value("f64", -1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2152
assert_return(() => invoke($0, `ge`, [value("f64", 0.5), value("f64", 1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:2153
assert_return(
  () => invoke($0, `ge`, [value("f64", -0.5), value("f64", -6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2154
assert_return(
  () => invoke($0, `ge`, [value("f64", -0.5), value("f64", 6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2155
assert_return(
  () => invoke($0, `ge`, [value("f64", 0.5), value("f64", -6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2156
assert_return(
  () => invoke($0, `ge`, [value("f64", 0.5), value("f64", 6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2157
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.5),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2158
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.5),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2159
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.5),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2160
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.5),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2161
assert_return(() => invoke($0, `ge`, [value("f64", -0.5), value("f64", -Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2162
assert_return(() => invoke($0, `ge`, [value("f64", -0.5), value("f64", Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:2163
assert_return(() => invoke($0, `ge`, [value("f64", 0.5), value("f64", -Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2164
assert_return(() => invoke($0, `ge`, [value("f64", 0.5), value("f64", Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:2165
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2166
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2167
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2168
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2169
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2170
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2171
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2172
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 0.5),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2173
assert_return(() => invoke($0, `ge`, [value("f64", -1), value("f64", -0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:2174
assert_return(() => invoke($0, `ge`, [value("f64", -1), value("f64", 0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:2175
assert_return(() => invoke($0, `ge`, [value("f64", 1), value("f64", -0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2176
assert_return(() => invoke($0, `ge`, [value("f64", 1), value("f64", 0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2177
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -1),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2178
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -1),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2179
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 1),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2180
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 1),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2181
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -1),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2182
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -1),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2183
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 1),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2184
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 1),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2185
assert_return(() => invoke($0, `ge`, [value("f64", -1), value("f64", -0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:2186
assert_return(() => invoke($0, `ge`, [value("f64", -1), value("f64", 0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:2187
assert_return(() => invoke($0, `ge`, [value("f64", 1), value("f64", -0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2188
assert_return(() => invoke($0, `ge`, [value("f64", 1), value("f64", 0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2189
assert_return(() => invoke($0, `ge`, [value("f64", -1), value("f64", -1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2190
assert_return(() => invoke($0, `ge`, [value("f64", -1), value("f64", 1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:2191
assert_return(() => invoke($0, `ge`, [value("f64", 1), value("f64", -1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2192
assert_return(() => invoke($0, `ge`, [value("f64", 1), value("f64", 1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2193
assert_return(
  () => invoke($0, `ge`, [value("f64", -1), value("f64", -6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2194
assert_return(
  () => invoke($0, `ge`, [value("f64", -1), value("f64", 6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2195
assert_return(
  () => invoke($0, `ge`, [value("f64", 1), value("f64", -6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2196
assert_return(
  () => invoke($0, `ge`, [value("f64", 1), value("f64", 6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2197
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -1),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2198
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -1),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2199
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 1),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2200
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 1),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2201
assert_return(() => invoke($0, `ge`, [value("f64", -1), value("f64", -Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2202
assert_return(() => invoke($0, `ge`, [value("f64", -1), value("f64", Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:2203
assert_return(() => invoke($0, `ge`, [value("f64", 1), value("f64", -Infinity)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2204
assert_return(() => invoke($0, `ge`, [value("f64", 1), value("f64", Infinity)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:2205
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2206
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2207
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2208
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2209
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2210
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2211
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2212
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 1),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2213
assert_return(
  () => invoke($0, `ge`, [value("f64", -6.283185307179586), value("f64", -0)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2214
assert_return(
  () => invoke($0, `ge`, [value("f64", -6.283185307179586), value("f64", 0)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2215
assert_return(
  () => invoke($0, `ge`, [value("f64", 6.283185307179586), value("f64", -0)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2216
assert_return(
  () => invoke($0, `ge`, [value("f64", 6.283185307179586), value("f64", 0)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2217
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -6.283185307179586),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2218
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -6.283185307179586),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2219
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 6.283185307179586),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2220
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 6.283185307179586),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2221
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -6.283185307179586),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2222
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -6.283185307179586),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2223
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 6.283185307179586),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2224
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 6.283185307179586),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2225
assert_return(
  () => invoke($0, `ge`, [value("f64", -6.283185307179586), value("f64", -0.5)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2226
assert_return(
  () => invoke($0, `ge`, [value("f64", -6.283185307179586), value("f64", 0.5)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2227
assert_return(
  () => invoke($0, `ge`, [value("f64", 6.283185307179586), value("f64", -0.5)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2228
assert_return(
  () => invoke($0, `ge`, [value("f64", 6.283185307179586), value("f64", 0.5)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2229
assert_return(
  () => invoke($0, `ge`, [value("f64", -6.283185307179586), value("f64", -1)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2230
assert_return(
  () => invoke($0, `ge`, [value("f64", -6.283185307179586), value("f64", 1)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2231
assert_return(
  () => invoke($0, `ge`, [value("f64", 6.283185307179586), value("f64", -1)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2232
assert_return(
  () => invoke($0, `ge`, [value("f64", 6.283185307179586), value("f64", 1)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2233
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -6.283185307179586),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2234
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -6.283185307179586),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2235
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 6.283185307179586),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2236
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 6.283185307179586),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2237
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -6.283185307179586),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2238
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -6.283185307179586),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2239
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 6.283185307179586),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2240
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 6.283185307179586),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2241
assert_return(
  () => invoke($0, `ge`, [value("f64", -6.283185307179586), value("f64", -Infinity)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2242
assert_return(
  () => invoke($0, `ge`, [value("f64", -6.283185307179586), value("f64", Infinity)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2243
assert_return(
  () => invoke($0, `ge`, [value("f64", 6.283185307179586), value("f64", -Infinity)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2244
assert_return(
  () => invoke($0, `ge`, [value("f64", 6.283185307179586), value("f64", Infinity)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2245
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2246
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2247
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2248
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2249
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2250
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2251
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2252
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 6.283185307179586),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2253
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2254
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2255
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2256
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2257
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2258
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2259
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2260
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2261
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2262
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2263
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2264
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2265
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2266
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2267
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2268
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.5),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2269
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2270
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2271
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2272
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 1),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2273
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2274
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2275
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2276
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2277
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2278
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2279
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2280
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2281
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2282
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2283
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -Infinity),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2284
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2285
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2286
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2287
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2288
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2289
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2290
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2291
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2292
assert_return(
  () => invoke($0, `ge`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2293
assert_return(() => invoke($0, `ge`, [value("f64", -Infinity), value("f64", -0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:2294
assert_return(() => invoke($0, `ge`, [value("f64", -Infinity), value("f64", 0)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:2295
assert_return(() => invoke($0, `ge`, [value("f64", Infinity), value("f64", -0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2296
assert_return(() => invoke($0, `ge`, [value("f64", Infinity), value("f64", 0)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2297
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -Infinity),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2298
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -Infinity),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2299
assert_return(
  () => invoke($0, `ge`, [
    value("f64", Infinity),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2300
assert_return(
  () => invoke($0, `ge`, [
    value("f64", Infinity),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2301
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -Infinity),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2302
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -Infinity),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2303
assert_return(
  () => invoke($0, `ge`, [
    value("f64", Infinity),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2304
assert_return(
  () => invoke($0, `ge`, [
    value("f64", Infinity),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2305
assert_return(() => invoke($0, `ge`, [value("f64", -Infinity), value("f64", -0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:2306
assert_return(() => invoke($0, `ge`, [value("f64", -Infinity), value("f64", 0.5)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:2307
assert_return(() => invoke($0, `ge`, [value("f64", Infinity), value("f64", -0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2308
assert_return(() => invoke($0, `ge`, [value("f64", Infinity), value("f64", 0.5)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2309
assert_return(() => invoke($0, `ge`, [value("f64", -Infinity), value("f64", -1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:2310
assert_return(() => invoke($0, `ge`, [value("f64", -Infinity), value("f64", 1)]), [value("i32", 0)]);

// ./test/core/f64_cmp.wast:2311
assert_return(() => invoke($0, `ge`, [value("f64", Infinity), value("f64", -1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2312
assert_return(() => invoke($0, `ge`, [value("f64", Infinity), value("f64", 1)]), [value("i32", 1)]);

// ./test/core/f64_cmp.wast:2313
assert_return(
  () => invoke($0, `ge`, [value("f64", -Infinity), value("f64", -6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2314
assert_return(
  () => invoke($0, `ge`, [value("f64", -Infinity), value("f64", 6.283185307179586)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2315
assert_return(
  () => invoke($0, `ge`, [value("f64", Infinity), value("f64", -6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2316
assert_return(
  () => invoke($0, `ge`, [value("f64", Infinity), value("f64", 6.283185307179586)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2317
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -Infinity),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2318
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -Infinity),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2319
assert_return(
  () => invoke($0, `ge`, [
    value("f64", Infinity),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2320
assert_return(
  () => invoke($0, `ge`, [
    value("f64", Infinity),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2321
assert_return(
  () => invoke($0, `ge`, [value("f64", -Infinity), value("f64", -Infinity)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2322
assert_return(
  () => invoke($0, `ge`, [value("f64", -Infinity), value("f64", Infinity)]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2323
assert_return(
  () => invoke($0, `ge`, [value("f64", Infinity), value("f64", -Infinity)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2324
assert_return(
  () => invoke($0, `ge`, [value("f64", Infinity), value("f64", Infinity)]),
  [value("i32", 1)],
);

// ./test/core/f64_cmp.wast:2325
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2326
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2327
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2328
assert_return(
  () => invoke($0, `ge`, [
    value("f64", -Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2329
assert_return(
  () => invoke($0, `ge`, [
    value("f64", Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2330
assert_return(
  () => invoke($0, `ge`, [
    value("f64", Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2331
assert_return(
  () => invoke($0, `ge`, [
    value("f64", Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2332
assert_return(
  () => invoke($0, `ge`, [
    value("f64", Infinity),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2333
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2334
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2335
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2336
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2337
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2338
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2339
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2340
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 0),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2341
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2342
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2343
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2344
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2345
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2346
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2347
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2348
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2349
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2350
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2351
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2352
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2353
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2354
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2355
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2356
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2357
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2358
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2359
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2360
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2361
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2362
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2363
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2364
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 0.5),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2365
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2366
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2367
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2368
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2369
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2370
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2371
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2372
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 1),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2373
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2374
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2375
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2376
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2377
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2378
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2379
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2380
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 6.283185307179586),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2381
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2382
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2383
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2384
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2385
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2386
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2387
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2388
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2389
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2390
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2391
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2392
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2393
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2394
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", -Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2395
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2396
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    value("f64", Infinity),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2397
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2398
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2399
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2400
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2401
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2402
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2403
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2404
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2405
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2406
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2407
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2408
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0xff]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2409
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2410
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2411
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2412
assert_return(
  () => invoke($0, `ge`, [
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf4, 0x7f]),
  ]),
  [value("i32", 0)],
);

// ./test/core/f64_cmp.wast:2417
assert_invalid(
  () => instantiate(`(module (func (result f64) (f64.eq (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/f64_cmp.wast:2418
assert_invalid(
  () => instantiate(`(module (func (result f64) (f64.ge (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/f64_cmp.wast:2419
assert_invalid(
  () => instantiate(`(module (func (result f64) (f64.gt (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/f64_cmp.wast:2420
assert_invalid(
  () => instantiate(`(module (func (result f64) (f64.le (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/f64_cmp.wast:2421
assert_invalid(
  () => instantiate(`(module (func (result f64) (f64.lt (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/f64_cmp.wast:2422
assert_invalid(
  () => instantiate(`(module (func (result f64) (f64.ne (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);
