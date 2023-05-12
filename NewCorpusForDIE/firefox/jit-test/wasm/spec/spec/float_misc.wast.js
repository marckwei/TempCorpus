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

// ./test/core/float_misc.wast

// ./test/core/float_misc.wast:17
let $0 = instantiate(`(module
  (func (export "f32.add") (param $$x f32) (param $$y f32) (result f32) (f32.add (local.get $$x) (local.get $$y)))
  (func (export "f32.sub") (param $$x f32) (param $$y f32) (result f32) (f32.sub (local.get $$x) (local.get $$y)))
  (func (export "f32.mul") (param $$x f32) (param $$y f32) (result f32) (f32.mul (local.get $$x) (local.get $$y)))
  (func (export "f32.div") (param $$x f32) (param $$y f32) (result f32) (f32.div (local.get $$x) (local.get $$y)))
  (func (export "f32.sqrt") (param $$x f32) (result f32) (f32.sqrt (local.get $$x)))
  (func (export "f32.abs") (param $$x f32) (result f32) (f32.abs (local.get $$x)))
  (func (export "f32.neg") (param $$x f32) (result f32) (f32.neg (local.get $$x)))
  (func (export "f32.copysign") (param $$x f32) (param $$y f32) (result f32) (f32.copysign (local.get $$x) (local.get $$y)))
  (func (export "f32.ceil") (param $$x f32) (result f32) (f32.ceil (local.get $$x)))
  (func (export "f32.floor") (param $$x f32) (result f32) (f32.floor (local.get $$x)))
  (func (export "f32.trunc") (param $$x f32) (result f32) (f32.trunc (local.get $$x)))
  (func (export "f32.nearest") (param $$x f32) (result f32) (f32.nearest (local.get $$x)))
  (func (export "f32.min") (param $$x f32) (param $$y f32) (result f32) (f32.min (local.get $$x) (local.get $$y)))
  (func (export "f32.max") (param $$x f32) (param $$y f32) (result f32) (f32.max (local.get $$x) (local.get $$y)))

  (func (export "f64.add") (param $$x f64) (param $$y f64) (result f64) (f64.add (local.get $$x) (local.get $$y)))
  (func (export "f64.sub") (param $$x f64) (param $$y f64) (result f64) (f64.sub (local.get $$x) (local.get $$y)))
  (func (export "f64.mul") (param $$x f64) (param $$y f64) (result f64) (f64.mul (local.get $$x) (local.get $$y)))
  (func (export "f64.div") (param $$x f64) (param $$y f64) (result f64) (f64.div (local.get $$x) (local.get $$y)))
  (func (export "f64.sqrt") (param $$x f64) (result f64) (f64.sqrt (local.get $$x)))
  (func (export "f64.abs") (param $$x f64) (result f64) (f64.abs (local.get $$x)))
  (func (export "f64.neg") (param $$x f64) (result f64) (f64.neg (local.get $$x)))
  (func (export "f64.copysign") (param $$x f64) (param $$y f64) (result f64) (f64.copysign (local.get $$x) (local.get $$y)))
  (func (export "f64.ceil") (param $$x f64) (result f64) (f64.ceil (local.get $$x)))
  (func (export "f64.floor") (param $$x f64) (result f64) (f64.floor (local.get $$x)))
  (func (export "f64.trunc") (param $$x f64) (result f64) (f64.trunc (local.get $$x)))
  (func (export "f64.nearest") (param $$x f64) (result f64) (f64.nearest (local.get $$x)))
  (func (export "f64.min") (param $$x f64) (param $$y f64) (result f64) (f64.min (local.get $$x) (local.get $$y)))
  (func (export "f64.max") (param $$x f64) (param $$y f64) (result f64) (f64.max (local.get $$x) (local.get $$y)))
)`);

// ./test/core/float_misc.wast:50
assert_return(
  () => invoke($0, `f32.add`, [value("f32", 1.1234568), value("f32", 0.00000000012345)]),
  [value("f32", 1.1234568)],
);

// ./test/core/float_misc.wast:51
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 1.123456789),
    value("f64", 0.00000000012345),
  ]),
  [value("f64", 1.12345678912345)],
);

// ./test/core/float_misc.wast:55
assert_return(
  () => invoke($0, `f32.add`, [value("f32", 1), value("f32", 0.000000059604645)]),
  [value("f32", 1)],
);

// ./test/core/float_misc.wast:56
assert_return(
  () => invoke($0, `f32.add`, [value("f32", 1), value("f32", 0.00000005960465)]),
  [value("f32", 1.0000001)],
);

// ./test/core/float_misc.wast:57
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 1),
    value("f64", 0.00000000000000011102230246251565),
  ]),
  [value("f64", 1)],
);

// ./test/core/float_misc.wast:58
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 1),
    value("f64", 0.00000000000000011102230246251568),
  ]),
  [value("f64", 1.0000000000000002)],
);

// ./test/core/float_misc.wast:61
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", 0.000000000000000000000000000000000000000000001),
    value("f32", 0.000000000000000000000000000000000000011754942),
  ]),
  [value("f32", 0.000000000000000000000000000000000000011754944)],
);

// ./test/core/float_misc.wast:62
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002225073858507201),
  ]),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ],
);

// ./test/core/float_misc.wast:67
assert_return(
  () => invoke($0, `f32.add`, [value("f32", 2147483600), value("f32", 1024.25)]),
  [value("f32", 2147484700)],
);

// ./test/core/float_misc.wast:68
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 9223372036854776000),
    value("f64", 1024.25),
  ]),
  [value("f64", 9223372036854778000)],
);

// ./test/core/float_misc.wast:72
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003645561009778199),
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000292),
  ]),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000036455610097781983),
  ],
);

// ./test/core/float_misc.wast:75
assert_return(
  () => invoke($0, `f64.add`, [value("f64", 9007199254740992), value("f64", 1.00001)]),
  [value("f64", 9007199254740994)],
);

// ./test/core/float_misc.wast:78
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 9007199254740994),
    value("f64", 0.9999847412109375),
  ]),
  [value("f64", 9007199254740994)],
);

// ./test/core/float_misc.wast:81
assert_return(
  () => invoke($0, `f32.add`, [value("f32", 8388608), value("f32", 0.5)]),
  [value("f32", 8388608)],
);

// ./test/core/float_misc.wast:82
assert_return(
  () => invoke($0, `f32.add`, [value("f32", 8388609), value("f32", 0.5)]),
  [value("f32", 8388610)],
);

// ./test/core/float_misc.wast:83
assert_return(
  () => invoke($0, `f64.add`, [value("f64", 4503599627370496), value("f64", 0.5)]),
  [value("f64", 4503599627370496)],
);

// ./test/core/float_misc.wast:84
assert_return(
  () => invoke($0, `f64.add`, [value("f64", 4503599627370497), value("f64", 0.5)]),
  [value("f64", 4503599627370498)],
);

// ./test/core/float_misc.wast:87
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", -6207600000000000000000000000000),
    value("f32", 0.000000000000000000000000000002309799),
  ]),
  [value("f32", -6207600000000000000000000000000)],
);

// ./test/core/float_misc.wast:88
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", 209865800000000000000),
    value("f32", -5270152500000000),
  ]),
  [value("f32", 209860530000000000000)],
);

// ./test/core/float_misc.wast:89
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", 0.0000000000000000000000001963492),
    value("f32", 0.000000000000000000000000000000000000046220067),
  ]),
  [value("f32", 0.0000000000000000000000001963492)],
);

// ./test/core/float_misc.wast:90
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", 640905000000),
    value("f32", -64449550000000000),
  ]),
  [value("f32", -64448910000000000)],
);

// ./test/core/float_misc.wast:91
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", 0.0000601966),
    value("f32", 120372790000000000000000000000000),
  ]),
  [value("f32", 120372790000000000000000000000000)],
);

// ./test/core/float_misc.wast:92
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009218993827002741),
    value("f64", -1283078243878048500000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", -1283078243878048500000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:93
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", -96503407870148960000000),
    value("f64", 0.00000000000000000000000000000000000000000000000000000004670208988478548),
  ]),
  [value("f64", -96503407870148960000000)],
);

// ./test/core/float_misc.wast:94
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 0.0000000000000000000000000000000000000000000028559147675434106),
    value("f64", -0.00026124280570653086),
  ]),
  [value("f64", -0.00026124280570653086)],
);

// ./test/core/float_misc.wast:95
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 417909928165296700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 79335564741512700000),
  ]),
  [
    value("f64", 417909928165296700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:96
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 8265442868747023000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 43603327839006250000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 43603327839006250000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:99
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", 5238404000000000000000),
    value("f32", -1570182.5),
  ]),
  [value("f32", 5238404000000000000000)],
);

// ./test/core/float_misc.wast:100
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", 0.00000000000004258938),
    value("f32", -0.0000000000000000000000057092353),
  ]),
  [value("f32", 0.00000000000004258938)],
);

// ./test/core/float_misc.wast:101
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", -0.00000000000027251026),
    value("f32", 83711560000000000000000000000000000000),
  ]),
  [value("f32", 83711560000000000000000000000000000000)],
);

// ./test/core/float_misc.wast:102
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", -0.0000000000000884536),
    value("f32", -0.000000000000000000000000000000015165626),
  ]),
  [value("f32", -0.0000000000000884536)],
);

// ./test/core/float_misc.wast:103
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", 0.0010521035),
    value("f32", -0.000000000000000000000000000000007582135),
  ]),
  [value("f32", 0.0010521035)],
);

// ./test/core/float_misc.wast:104
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 1511135228188924600000000000000000000000000000000000000),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002760218100603169),
  ]),
  [value("f64", 1511135228188924600000000000000000000000000000000000000)],
);

// ./test/core/float_misc.wast:105
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 62386719760360280000000000000000000000000000000),
    value("f64", -0.0000000000000000008592185488839212),
  ]),
  [value("f64", 62386719760360280000000000000000000000000000000)],
);

// ./test/core/float_misc.wast:106
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004195022848436354),
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000029225342022551453),
  ]),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004195022848436354),
  ],
);

// ./test/core/float_misc.wast:107
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", -215220546714824520000000000000000000000000000),
    value("f64", -1112220412047137200000000000000000000000000),
  ]),
  [value("f64", -216332767126871650000000000000000000000000000)],
);

// ./test/core/float_misc.wast:108
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", -13.6911535055856),
    value("f64", 2066117898924419800000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 2066117898924419800000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:111
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", -0.000000000000000000000000000000000006456021),
    value("f32", 0.00000000000020219949),
  ]),
  [value("f32", 0.00000000000020219949)],
);

// ./test/core/float_misc.wast:112
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", -0.000026823169),
    value("f32", 0.000000011196016),
  ]),
  [value("f32", -0.000026811973)],
);

// ./test/core/float_misc.wast:113
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", -128526170000),
    value("f32", 0.0000000000000000000000000000000027356305),
  ]),
  [value("f32", -128526170000)],
);

// ./test/core/float_misc.wast:114
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", 0.000000000000000000000000000000000004158973),
    value("f32", -1573528700),
  ]),
  [value("f32", -1573528700)],
);

// ./test/core/float_misc.wast:115
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", -0.0000000000000000000000000000000000009338769),
    value("f32", 78647514000000000000000000000),
  ]),
  [value("f32", 78647514000000000000000000000)],
);

// ./test/core/float_misc.wast:116
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000021986596650683218),
    value("f64", -235447594845461340000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", -235447594845461340000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:117
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", -314175619593595700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -30114098514611660000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", -314175649707694230000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:118
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000013722858367681836),
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000011571842749688977),
  ]),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000011571842749688977),
  ],
);

// ./test/core/float_misc.wast:119
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009828583756551075),
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016862581574752944),
  ]),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009828583756551075),
  ],
);

// ./test/core/float_misc.wast:120
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", -672584203522163500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 8374007930974482000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", -672584203522163500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:123
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", -210896605327889950000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 581483233421196300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 581483022524591100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:124
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 102315792666821480000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 450204300797494900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 102315792667271680000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:125
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", -130529978570956560000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 154899434220186570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 154899434220186450000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:126
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 47629997434721684000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 455586451058259700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 455586451058259700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:127
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003958952516558414),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000023092460710062946),
  ]),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000230924607140219),
  ],
);

// ./test/core/float_misc.wast:130
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", -43780558475415996000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -49680759347383435000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", -49680759347383435000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:131
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 21174311168546080000000000000000000000000000000000000000000),
    value("f64", -26385928474612128000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", -26385928474612128000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:132
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", -9508489561700635000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007858068235728165),
  ]),
  [
    value("f64", -9508489561700635000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:133
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005079144928553737),
    value("f64", -354021720742499800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", -354021720742499800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:134
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000004165382103988111),
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010865942283516648),
  ]),
  [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000004165382103988111),
  ],
);

// ./test/core/float_misc.wast:137
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", 97215650000000000000000000000000000),
    value("f32", 305590870000000000000000000000000000000),
  ]),
  [value("f32", 305688080000000000000000000000000000000)],
);

// ./test/core/float_misc.wast:138
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", 270465630000000000000000000000000000000),
    value("f32", -230236850000000000000000000000000),
  ]),
  [value("f32", 270465400000000000000000000000000000000)],
);

// ./test/core/float_misc.wast:139
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", 357209300000000000000000000000000000),
    value("f32", -236494050000000000000000000000000000000),
  ]),
  [value("f32", -236136840000000000000000000000000000000)],
);

// ./test/core/float_misc.wast:140
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", -1484234100000000000000000000000000000),
    value("f32", -328991400000000000000000000000000000000),
  ]),
  [value("f32", -330475620000000000000000000000000000000)],
);

// ./test/core/float_misc.wast:141
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", -219885600000000000000000000000000000000),
    value("f32", -81560930000000000000000000000000000000),
  ]),
  [value("f32", -301446520000000000000000000000000000000)],
);

// ./test/core/float_misc.wast:142
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 90390204939547630000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 22943337422040356000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 90390204939570580000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:143
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 165916059736246050000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 12577349331444160000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 165916059748823400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:144
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", -136351292561394300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 60507030603873580000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", -136290785530790440000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:145
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", -34377613258227424000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 169947152758793490000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 169947118381180220000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:146
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 92273427008645570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -39269416451018680000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 92273426969376150000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:149
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", 0.000000000000000000000000000000000000008313455),
    value("f32", 0.000000000000000000000000000000000000000000873),
  ]),
  [value("f32", 0.000000000000000000000000000000000000008314328)],
);

// ./test/core/float_misc.wast:150
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", 0.000000000000000000000000000000000000000000052),
    value("f32", -0.000000000000000000000000000000000000000000003),
  ]),
  [value("f32", 0.000000000000000000000000000000000000000000049)],
);

// ./test/core/float_misc.wast:151
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", -0.000000000000000000000000000000000000000000011),
    value("f32", 0.000000000000000000000000000000000000005186284),
  ]),
  [value("f32", 0.000000000000000000000000000000000000005186273)],
);

// ./test/core/float_misc.wast:152
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", -0.000000000000000000000000000000000000000000028),
    value("f32", 0.00000000000000000000000000000000000023675283),
  ]),
  [value("f32", 0.0000000000000000000000000000000000002367528)],
);

// ./test/core/float_misc.wast:153
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", 0.000000000000000000000000000000000000000000635),
    value("f32", -0.00000000000000000000000000000000000000003327),
  ]),
  [value("f32", -0.000000000000000000000000000000000000000032635)],
);

// ./test/core/float_misc.wast:154
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000028461489375936755),
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005130160608603642),
  ]),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002284011671009967),
  ],
);

// ./test/core/float_misc.wast:155
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000047404811354775),
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008895417776504167),
  ]),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004154936641026667),
  ],
);

// ./test/core/float_misc.wast:156
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009330082001250494),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000029863980609419717),
  ]),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003919406261067021),
  ],
);

// ./test/core/float_misc.wast:157
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014418693884494008),
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016324914377759187),
  ]),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001906220493265178),
  ],
);

// ./test/core/float_misc.wast:158
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000043203619362281506),
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002521511966399844),
  ]),
  [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000017988499698283067),
  ],
);

// ./test/core/float_misc.wast:162
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", 340282330000000000000000000000000000000),
    value("f32", 20282410000000000000000000000000),
  ]),
  [value("f32", 340282350000000000000000000000000000000)],
);

// ./test/core/float_misc.wast:163
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 179769313486231550000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 19958403095347200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:166
assert_return(() => invoke($0, `f32.add`, [value("f32", 2), value("f32", 2)]), [value("f32", 4)]);

// ./test/core/float_misc.wast:167
assert_return(() => invoke($0, `f64.add`, [value("f64", 2), value("f64", 2)]), [value("f64", 4)]);

// ./test/core/float_misc.wast:170
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", 340282350000000000000000000000000000000),
    value("f32", 10141204000000000000000000000000),
  ]),
  [value("f32", 340282350000000000000000000000000000000)],
);

// ./test/core/float_misc.wast:171
assert_return(
  () => invoke($0, `f32.add`, [
    value("f32", 340282350000000000000000000000000000000),
    value("f32", 10141205000000000000000000000000),
  ]),
  [value("f32", Infinity)],
);

// ./test/core/float_misc.wast:172
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 9979201547673598000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:173
assert_return(
  () => invoke($0, `f64.add`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 9979201547673600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("f64", Infinity)],
);

// ./test/core/float_misc.wast:177
assert_return(
  () => invoke($0, `f32.sub`, [value("f32", 65536), value("f32", 0.000000000007275958)]),
  [value("f32", 65536)],
);

// ./test/core/float_misc.wast:178
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", 65536),
    value("f64", 0.000000000007275957614183426),
  ]),
  [value("f64", 65535.99999999999)],
);

// ./test/core/float_misc.wast:182
assert_return(
  () => invoke($0, `f32.sub`, [value("f32", 1), value("f32", 0.000000029802322)]),
  [value("f32", 1)],
);

// ./test/core/float_misc.wast:183
assert_return(
  () => invoke($0, `f32.sub`, [value("f32", 1), value("f32", 0.000000029802326)]),
  [value("f32", 0.99999994)],
);

// ./test/core/float_misc.wast:184
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", 1),
    value("f64", 0.00000000000000005551115123125783),
  ]),
  [value("f64", 1)],
);

// ./test/core/float_misc.wast:185
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", 1),
    value("f64", 0.00000000000000005551115123125784),
  ]),
  [value("f64", 0.9999999999999999)],
);

// ./test/core/float_misc.wast:188
assert_return(
  () => invoke($0, `f32.sub`, [
    value("f32", 0.00000000000000000000000000000002379208),
    value("f32", -722129800000000000000000000000000000),
  ]),
  [value("f32", 722129800000000000000000000000000000)],
);

// ./test/core/float_misc.wast:189
assert_return(
  () => invoke($0, `f32.sub`, [
    value("f32", -842284000000000000000000000000000000),
    value("f32", -11118414000000),
  ]),
  [value("f32", -842284000000000000000000000000000000)],
);

// ./test/core/float_misc.wast:190
assert_return(
  () => invoke($0, `f32.sub`, [
    value("f32", 1.4549444),
    value("f32", -0.00000000000000000000000033792615),
  ]),
  [value("f32", 1.4549444)],
);

// ./test/core/float_misc.wast:191
assert_return(
  () => invoke($0, `f32.sub`, [
    value("f32", 0.0000000000000000000000000000000000094808914),
    value("f32", 0.000000000000000000000018589502),
  ]),
  [value("f32", -0.000000000000000000000018589502)],
);

// ./test/core/float_misc.wast:192
assert_return(
  () => invoke($0, `f32.sub`, [
    value("f32", 0.000006181167),
    value("f32", -0.0000000000000000000000000000000093959864),
  ]),
  [value("f32", 0.000006181167)],
);

// ./test/core/float_misc.wast:193
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000775701650124413),
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002524845082116609),
  ]),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000775701650124413),
  ],
);

// ./test/core/float_misc.wast:194
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", -20991871064832710000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.0000000000000000000000000000000000000000000000038165079778426864),
  ]),
  [
    value("f64", -20991871064832710000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:195
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000028592030964162332),
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020889465194336087),
  ]),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000028592030964162332),
  ],
);

// ./test/core/float_misc.wast:196
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000303879528930943),
    value("f64", -23204941114021897000000000000000000000000000000),
  ]),
  [value("f64", 23204941114021897000000000000000000000000000000)],
);

// ./test/core/float_misc.wast:197
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", -0.00000000000000000000000000000000000000000014953904039036317),
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010592252695645683),
  ]),
  [value("f64", -0.00000000000000000000000000000000000000000014953904039036317)],
);

// ./test/core/float_misc.wast:200
assert_return(
  () => invoke($0, `f32.sub`, [
    value("f32", -448601660000000000000000000000000),
    value("f32", -8984148000000000000000000000000000),
  ]),
  [value("f32", 8535546400000000000000000000000000)],
);

// ./test/core/float_misc.wast:201
assert_return(
  () => invoke($0, `f32.sub`, [
    value("f32", -899427400000000000000000000000000),
    value("f32", 91.579384),
  ]),
  [value("f32", -899427400000000000000000000000000)],
);

// ./test/core/float_misc.wast:202
assert_return(
  () => invoke($0, `f32.sub`, [
    value("f32", -0.00000000000000000000000011975),
    value("f32", 0.000000063140405),
  ]),
  [value("f32", -0.000000063140405)],
);

// ./test/core/float_misc.wast:203
assert_return(
  () => invoke($0, `f32.sub`, [
    value("f32", -0.000000000000000000000011800487),
    value("f32", -0.00031558736),
  ]),
  [value("f32", 0.00031558736)],
);

// ./test/core/float_misc.wast:204
assert_return(
  () => invoke($0, `f32.sub`, [
    value("f32", -736483800000000000000000000000),
    value("f32", 0.0000000000000000030824513),
  ]),
  [value("f32", -736483800000000000000000000000)],
);

// ./test/core/float_misc.wast:205
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", -9410469964196796000000000000000000000000000000000000000000000),
    value("f64", -17306275691385970000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 17306275691385970000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:206
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002877908564233173),
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002339448785991429),
  ]),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002877908564233173),
  ],
);

// ./test/core/float_misc.wast:207
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000009719219783531962),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001572015082308034),
  ]),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000009719219783531962),
  ],
);

// ./test/core/float_misc.wast:208
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000034908896031751274),
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000019928479721303208),
  ]),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000019928479721303208),
  ],
);

// ./test/core/float_misc.wast:209
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", -7538298763725556000000000000000000),
    value("f64", 4447012580193329000000000000000000000000000000000000),
  ]),
  [value("f64", -4447012580193329000000000000000000000000000000000000)],
);

// ./test/core/float_misc.wast:212
assert_return(
  () => invoke($0, `f32.sub`, [
    value("f32", 75846976000000000000000000000),
    value("f32", 0.000046391753),
  ]),
  [value("f32", 75846976000000000000000000000)],
);

// ./test/core/float_misc.wast:213
assert_return(
  () => invoke($0, `f32.sub`, [
    value("f32", -567139.9),
    value("f32", -0.000000000030334842),
  ]),
  [value("f32", -567139.9)],
);

// ./test/core/float_misc.wast:214
assert_return(
  () => invoke($0, `f32.sub`, [
    value("f32", -0.000000000017412261),
    value("f32", -0.000000000000000017877793),
  ]),
  [value("f32", -0.000000000017412244)],
);

// ./test/core/float_misc.wast:215
assert_return(
  () => invoke($0, `f32.sub`, [
    value("f32", -0.000065645545),
    value("f32", 0.00014473806),
  ]),
  [value("f32", -0.00021038362)],
);

// ./test/core/float_misc.wast:216
assert_return(
  () => invoke($0, `f32.sub`, [
    value("f32", -0.00000000016016115),
    value("f32", -0.000000000000000000000000000000085380075),
  ]),
  [value("f32", -0.00000000016016115)],
);

// ./test/core/float_misc.wast:217
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", -0.000000000000000000000000000000000000000000000009358725267183177),
    value("f64", -31137147338685164000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 31137147338685164000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:218
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", -4390767596767215000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -67890457158958560000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 67890457158958560000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:219
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000036288281010831153),
    value("f64", 3383199683245004400000000000000000000000000000000000000),
  ]),
  [value("f64", -3383199683245004400000000000000000000000000000000000000)],
);

// ./test/core/float_misc.wast:220
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003645097751812619),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000031423490969686624),
  ]),
  [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000031423491006137603),
  ],
);

// ./test/core/float_misc.wast:221
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008021529638989887),
    value("f64", -0.00006774972769072139),
  ]),
  [value("f64", 0.00006774972769072139)],
);

// ./test/core/float_misc.wast:224
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", 0.000000000000000000000005816988065793039),
    value("f64", 0.000000000000000000000000000000000025021499241540866),
  ]),
  [value("f64", 0.000000000000000000000005816988065768018)],
);

// ./test/core/float_misc.wast:225
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000043336683304809554),
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016945582607476316),
  ]),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000043336683135353726),
  ],
);

// ./test/core/float_misc.wast:226
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000006908052676315257),
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000012001773734799856),
  ]),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000012001773734799856),
  ],
);

// ./test/core/float_misc.wast:227
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", -0.0000000000022044291547443813),
    value("f64", -0.0000000000000000000027947429925618632),
  ]),
  [value("f64", -0.000000000002204429151949638)],
);

// ./test/core/float_misc.wast:228
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", 0.00000004016393569117761),
    value("f64", 0.17053881989395447),
  ]),
  [value("f64", -0.17053877973001877)],
);

// ./test/core/float_misc.wast:231
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010015106898667285),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004785375958943186),
  ]),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000047853759589431757),
  ],
);

// ./test/core/float_misc.wast:232
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", -15618959953.641388),
    value("f64", 598234410620718900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", -598234410620718900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:233
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", 38832071540376680000000000000000000),
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000042192279274320304),
  ]),
  [value("f64", 38832071540376680000000000000000000)],
);

// ./test/core/float_misc.wast:234
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010705986890807897),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000017466607734737216),
  ]),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010705986890807897),
  ],
);

// ./test/core/float_misc.wast:235
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", 0.00000000000000000949378346261834),
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014584885434950294),
  ]),
  [value("f64", 0.00000000000000000949378346261834)],
);

// ./test/core/float_misc.wast:239
assert_return(
  () => invoke($0, `f32.sub`, [value("f32", 23.140692), value("f32", 3.1415927)]),
  [value("f32", 19.9991)],
);

// ./test/core/float_misc.wast:240
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", 23.14069263277927),
    value("f64", 3.141592653589793),
  ]),
  [value("f64", 19.999099979189477)],
);

// ./test/core/float_misc.wast:243
assert_return(
  () => invoke($0, `f32.sub`, [value("f32", 2999999), value("f32", 2999998)]),
  [value("f32", 1)],
);

// ./test/core/float_misc.wast:244
assert_return(
  () => invoke($0, `f32.sub`, [value("f32", 1999999), value("f32", 1999995)]),
  [value("f32", 4)],
);

// ./test/core/float_misc.wast:245
assert_return(
  () => invoke($0, `f32.sub`, [value("f32", 1999999), value("f32", 1999993)]),
  [value("f32", 6)],
);

// ./test/core/float_misc.wast:246
assert_return(
  () => invoke($0, `f32.sub`, [value("f32", 400002), value("f32", 400001)]),
  [value("f32", 1)],
);

// ./test/core/float_misc.wast:247
assert_return(
  () => invoke($0, `f32.sub`, [value("f32", 400002), value("f32", 400000)]),
  [value("f32", 2)],
);

// ./test/core/float_misc.wast:248
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", 2999999999999999),
    value("f64", 2999999999999998),
  ]),
  [value("f64", 1)],
);

// ./test/core/float_misc.wast:249
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", 1999999999999999),
    value("f64", 1999999999999995),
  ]),
  [value("f64", 4)],
);

// ./test/core/float_misc.wast:250
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", 1999999999999999),
    value("f64", 1999999999999993),
  ]),
  [value("f64", 6)],
);

// ./test/core/float_misc.wast:251
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", 400000000000002),
    value("f64", 400000000000001),
  ]),
  [value("f64", 1)],
);

// ./test/core/float_misc.wast:252
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", 400000000000002),
    value("f64", 400000000000000),
  ]),
  [value("f64", 2)],
);

// ./test/core/float_misc.wast:255
assert_return(
  () => invoke($0, `f32.sub`, [
    value("f32", 0.000000000000000000000000000000000000011754944),
    value("f32", 0.000000000000000000000000000000000000011754942),
  ]),
  [value("f32", 0.000000000000000000000000000000000000000000001)],
);

// ./test/core/float_misc.wast:256
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002225073858507201),
  ]),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ],
);

// ./test/core/float_misc.wast:259
assert_return(
  () => invoke($0, `f32.sub`, [value("f32", 1.0000001), value("f32", 0.99999994)]),
  [value("f32", 0.00000017881393)],
);

// ./test/core/float_misc.wast:260
assert_return(
  () => invoke($0, `f32.sub`, [value("f32", 1.0000001), value("f32", 1)]),
  [value("f32", 0.00000011920929)],
);

// ./test/core/float_misc.wast:261
assert_return(
  () => invoke($0, `f32.sub`, [value("f32", 1), value("f32", 0.99999994)]),
  [value("f32", 0.000000059604645)],
);

// ./test/core/float_misc.wast:262
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", 1.0000000000000002),
    value("f64", 0.9999999999999999),
  ]),
  [value("f64", 0.00000000000000033306690738754696)],
);

// ./test/core/float_misc.wast:263
assert_return(
  () => invoke($0, `f64.sub`, [value("f64", 1.0000000000000002), value("f64", 1)]),
  [value("f64", 0.0000000000000002220446049250313)],
);

// ./test/core/float_misc.wast:264
assert_return(
  () => invoke($0, `f64.sub`, [value("f64", 1), value("f64", 0.9999999999999999)]),
  [value("f64", 0.00000000000000011102230246251565)],
);

// ./test/core/float_misc.wast:268
assert_return(
  () => invoke($0, `f32.sub`, [
    value("f32", 340282350000000000000000000000000000000),
    value("f32", 10141204000000000000000000000000),
  ]),
  [value("f32", 340282350000000000000000000000000000000)],
);

// ./test/core/float_misc.wast:269
assert_return(
  () => invoke($0, `f32.sub`, [
    value("f32", 340282350000000000000000000000000000000),
    value("f32", 10141205000000000000000000000000),
  ]),
  [value("f32", 340282330000000000000000000000000000000)],
);

// ./test/core/float_misc.wast:270
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 9979201547673598000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:271
assert_return(
  () => invoke($0, `f64.sub`, [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 9979201547673600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 179769313486231550000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:274
assert_return(
  () => invoke($0, `f32.mul`, [
    value("f32", 1000000000000000),
    value("f32", 1000000000000000),
  ]),
  [value("f32", 999999940000000000000000000000)],
);

// ./test/core/float_misc.wast:275
assert_return(
  () => invoke($0, `f32.mul`, [
    value("f32", 100000000000000000000),
    value("f32", 100000000000000000000),
  ]),
  [value("f32", Infinity)],
);

// ./test/core/float_misc.wast:276
assert_return(
  () => invoke($0, `f32.mul`, [
    value("f32", 10000000000000000000000000),
    value("f32", 10000000000000000000000000),
  ]),
  [value("f32", Infinity)],
);

// ./test/core/float_misc.wast:277
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", 1000000000000000),
    value("f64", 1000000000000000),
  ]),
  [value("f64", 1000000000000000000000000000000)],
);

// ./test/core/float_misc.wast:278
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", 100000000000000000000),
    value("f64", 100000000000000000000),
  ]),
  [value("f64", 10000000000000000000000000000000000000000)],
);

// ./test/core/float_misc.wast:279
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", 10000000000000000000000000),
    value("f64", 10000000000000000000000000),
  ]),
  [value("f64", 100000000000000030000000000000000000000000000000000)],
);

// ./test/core/float_misc.wast:284
assert_return(
  () => invoke($0, `f32.mul`, [value("f32", 1848874900), value("f32", 19954563000)]),
  [value("f32", 36893493000000000000)],
);

// ./test/core/float_misc.wast:285
assert_return(
  () => invoke($0, `f64.mul`, [value("f64", 1848874847), value("f64", 19954562207)]),
  [value("f64", 36893488147419110000)],
);

// ./test/core/float_misc.wast:289
assert_return(
  () => invoke($0, `f32.mul`, [value("f32", 77.1), value("f32", 850)]),
  [value("f32", 65535)],
);

// ./test/core/float_misc.wast:290
assert_return(
  () => invoke($0, `f64.mul`, [value("f64", 77.1), value("f64", 850)]),
  [value("f64", 65534.99999999999)],
);

// ./test/core/float_misc.wast:293
assert_return(
  () => invoke($0, `f32.mul`, [
    value("f32", -2493839400000000000),
    value("f32", 0.000000000021176054),
  ]),
  [value("f32", -52809680)],
);

// ./test/core/float_misc.wast:294
assert_return(
  () => invoke($0, `f32.mul`, [
    value("f32", -6777248400000000000000000000000),
    value("f32", -0.00000000000000000000000000000034758242),
  ]),
  [value("f32", 2.3556523)],
);

// ./test/core/float_misc.wast:295
assert_return(
  () => invoke($0, `f32.mul`, [
    value("f32", -8384397600000000000000000000),
    value("f32", -0.000000000000000000000000000011948991),
  ]),
  [value("f32", 0.10018509)],
);

// ./test/core/float_misc.wast:296
assert_return(
  () => invoke($0, `f32.mul`, [
    value("f32", -656765400000000000000000),
    value("f32", -0.000000000000000000000046889766),
  ]),
  [value("f32", 30.795576)],
);

// ./test/core/float_misc.wast:297
assert_return(
  () => invoke($0, `f32.mul`, [
    value("f32", 13328204000000000),
    value("f32", 45.567223),
  ]),
  [value("f32", 607329200000000000)],
);

// ./test/core/float_misc.wast:298
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", -99426226093342430000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 583177241514245140000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("f64", -Infinity)],
);

// ./test/core/float_misc.wast:299
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002748155824301909),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000002093035437779455),
  ]),
  [value("f64", 0)],
);

// ./test/core/float_misc.wast:300
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", 464888257371302500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -159272886487254360000000000000000),
  ]),
  [
    value("f64", -74044094645556960000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:301
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008261927764172427),
    value("f64", 36684744190529535000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", -3030867065492991300000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:302
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", 253838958331769250000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007842892881810105),
  ]),
  [value("f64", 0.00000000000000000019908317594263248)],
);

// ./test/core/float_misc.wast:305
assert_return(
  () => invoke($0, `f32.mul`, [
    value("f32", -0.0000000000000000000000000020153333),
    value("f32", -5031353000000000000000000000),
  ]),
  [value("f32", 10.139854)],
);

// ./test/core/float_misc.wast:306
assert_return(
  () => invoke($0, `f32.mul`, [
    value("f32", 12286325000000000000000),
    value("f32", 749601.8),
  ]),
  [value("f32", 9209852000000000000000000000)],
);

// ./test/core/float_misc.wast:307
assert_return(
  () => invoke($0, `f32.mul`, [
    value("f32", -0.0000000002763514),
    value("f32", -35524714000000000000000),
  ]),
  [value("f32", 9817304000000)],
);

// ./test/core/float_misc.wast:308
assert_return(
  () => invoke($0, `f32.mul`, [
    value("f32", 218931220000000000000),
    value("f32", -40298.785),
  ]),
  [value("f32", -8822662000000000000000000)],
);

// ./test/core/float_misc.wast:309
assert_return(
  () => invoke($0, `f32.mul`, [
    value("f32", 1691996300),
    value("f32", -122103350000000000000),
  ]),
  [value("f32", -206598410000000000000000000000)],
);

// ./test/core/float_misc.wast:310
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007576316076452304),
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004601355879514986),
  ]),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003486132652344772),
  ],
);

// ./test/core/float_misc.wast:311
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000012228616081443885),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008055526185180067),
  ]),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009850793705258527),
  ],
);

// ./test/core/float_misc.wast:312
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", -2068651246039250800000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -366801071583254800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("f64", Infinity)],
);

// ./test/core/float_misc.wast:313
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", 1543238835610281000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007370621385787007),
  ]),
  [
    value("f64", 1137462916512617700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:314
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", 2235876566242058700000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -760669005920257000000000000000000000000000000000000),
  ]),
  [
    value("f64", -1700762005003744000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:317
assert_return(
  () => invoke($0, `f32.mul`, [
    value("f32", -110087030000000),
    value("f32", -54038020000000000000000000000),
  ]),
  [value("f32", Infinity)],
);

// ./test/core/float_misc.wast:318
assert_return(
  () => invoke($0, `f32.mul`, [
    value("f32", -0.19366351),
    value("f32", 0.0000000000000000000000000000029748954),
  ]),
  [value("f32", -0.0000000000000000000000000000005761287)],
);

// ./test/core/float_misc.wast:319
assert_return(
  () => invoke($0, `f32.mul`, [
    value("f32", -0.0000034300713),
    value("f32", 77991523000000000000000000000000),
  ]),
  [value("f32", -267516490000000000000000000)],
);

// ./test/core/float_misc.wast:320
assert_return(
  () => invoke($0, `f32.mul`, [
    value("f32", -99003850000000000),
    value("f32", 0.000000000000000000000000000020933774),
  ]),
  [value("f32", -0.0000000000020725242)],
);

// ./test/core/float_misc.wast:321
assert_return(
  () => invoke($0, `f32.mul`, [
    value("f32", -129919.07),
    value("f32", 0.0000000000000000000000000000000000018480999),
  ]),
  [value("f32", -0.00000000000000000000000000000024010342)],
);

// ./test/core/float_misc.wast:322
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006625572200844895),
    value("f64", -37374020681740010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("f64", 0.00000000000000000024762427246273877)],
);

// ./test/core/float_misc.wast:323
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", 821076848561758000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000012976552328552289),
  ]),
  [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000010654746691124455),
  ],
);

// ./test/core/float_misc.wast:324
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", -10223449294906041000000000000000000000000000000000000),
    value("f64", 1970855583334680500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", -20148942123804574000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:325
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", 2918243080119086000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -63633170941689700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("f64", -Infinity)],
);

// ./test/core/float_misc.wast:326
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", 3407037798802672000000000),
    value("f64", 1225791423971563000000),
  ]),
  [value("f64", 4176317714919266400000000000000000000000000000)],
);

// ./test/core/float_misc.wast:329
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000044091927284399547),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011518840702296592),
  ]),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005078878866462432),
  ],
);

// ./test/core/float_misc.wast:330
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", -0.002980041826472432),
    value("f64", 63125412993218000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", -188116371033135940000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:331
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", -308344578081300100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010081049555008529),
  ]),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000031084369716557833),
  ],
);

// ./test/core/float_misc.wast:332
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", 349387501315677300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 2131316915930809900),
  ]),
  [
    value("f64", 744655491768901000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:333
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000012500108005100234),
    value("f64", 1035265704160467500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", -12940933115981990000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:336
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008947461661755698),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020853844141312436),
  ]),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000018658897095462173),
  ],
);

// ./test/core/float_misc.wast:337
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", -0.00000000000000001161813037330394),
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000018737038135583668),
  ]),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000021768935186877886),
  ],
);

// ./test/core/float_misc.wast:338
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000021752326768352433),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006631210068072052),
  ]),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014424424827029184),
  ],
);

// ./test/core/float_misc.wast:339
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007149518157441743),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000022770445062365393),
  ]),
  [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001627977104264113),
  ],
);

// ./test/core/float_misc.wast:340
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004817739302150786),
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000025375023049719763),
  ]),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000012225024583961697),
  ],
);

// ./test/core/float_misc.wast:343
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", 46576441629501554000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007021344893525714),
  ]),
  [value("f64", 0.000000003270292605938992)],
);

// ./test/core/float_misc.wast:344
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", 0.012451716278313712),
    value("f64", 0.000000000000000000000000000000000000000000001945309177849331),
  ]),
  [
    value("f64", 0.00000000000000000000000000000000000000000000002422243795617958),
  ],
);

// ./test/core/float_misc.wast:345
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", -3.8312314777598586),
    value("f64", 0.0000000000009039887741742674),
  ]),
  [value("f64", -0.0000000000034633902471580017)],
);

// ./test/core/float_misc.wast:346
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009843582638849689),
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000003375405654777583),
  ]),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000033226084502443684),
  ],
);

// ./test/core/float_misc.wast:347
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", -260544537094514460000000),
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000032887528185809035),
  ]),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000008568665807354412),
  ],
);

// ./test/core/float_misc.wast:350
assert_return(
  () => invoke($0, `f32.mul`, [
    value("f32", 0.00000000000000000000002646978),
    value("f32", 0.00000000000000000000002646978),
  ]),
  [value("f32", 0)],
);

// ./test/core/float_misc.wast:351
assert_return(
  () => invoke($0, `f32.mul`, [
    value("f32", 0.000000000000000000000026469783),
    value("f32", 0.000000000000000000000026469783),
  ]),
  [value("f32", 0.000000000000000000000000000000000000000000001)],
);

// ./test/core/float_misc.wast:352
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000015717277847026285),
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000015717277847026285),
  ]),
  [value("f64", 0)],
);

// ./test/core/float_misc.wast:353
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000015717277847026288),
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000015717277847026288),
  ]),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ],
);

// ./test/core/float_misc.wast:356
assert_return(
  () => invoke($0, `f32.mul`, [
    value("f32", 18446743000000000000),
    value("f32", 18446743000000000000),
  ]),
  [value("f32", 340282330000000000000000000000000000000)],
);

// ./test/core/float_misc.wast:357
assert_return(
  () => invoke($0, `f32.mul`, [
    value("f32", 18446744000000000000),
    value("f32", 18446744000000000000),
  ]),
  [value("f32", Infinity)],
);

// ./test/core/float_misc.wast:358
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", 13407807929942596000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 13407807929942596000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 179769313486231550000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:359
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", 13407807929942597000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 13407807929942597000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("f64", Infinity)],
);

// ./test/core/float_misc.wast:362
assert_return(
  () => invoke($0, `f32.mul`, [value("f32", 1.0000001), value("f32", 1.0000001)]),
  [value("f32", 1.0000002)],
);

// ./test/core/float_misc.wast:363
assert_return(
  () => invoke($0, `f32.mul`, [value("f32", 0.99999994), value("f32", 0.99999994)]),
  [value("f32", 0.9999999)],
);

// ./test/core/float_misc.wast:364
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", 1.0000000000000002),
    value("f64", 1.0000000000000002),
  ]),
  [value("f64", 1.0000000000000004)],
);

// ./test/core/float_misc.wast:365
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", 0.9999999999999999),
    value("f64", 0.9999999999999999),
  ]),
  [value("f64", 0.9999999999999998)],
);

// ./test/core/float_misc.wast:368
assert_return(
  () => invoke($0, `f32.mul`, [value("f32", 1.0000001), value("f32", 0.99999994)]),
  [value("f32", 1)],
);

// ./test/core/float_misc.wast:369
assert_return(
  () => invoke($0, `f32.mul`, [value("f32", 1.0000002), value("f32", 0.9999999)]),
  [value("f32", 1.0000001)],
);

// ./test/core/float_misc.wast:370
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", 1.0000000000000002),
    value("f64", 0.9999999999999999),
  ]),
  [value("f64", 1)],
);

// ./test/core/float_misc.wast:371
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", 1.0000000000000004),
    value("f64", 0.9999999999999998),
  ]),
  [value("f64", 1.0000000000000002)],
);

// ./test/core/float_misc.wast:375
assert_return(
  () => invoke($0, `f32.mul`, [
    value("f32", 0.000000000000000000000000000000000000011754944),
    value("f32", 0.00000011920929),
  ]),
  [value("f32", 0.000000000000000000000000000000000000000000001)],
);

// ./test/core/float_misc.wast:376
assert_return(
  () => invoke($0, `f64.mul`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.0000000000000002220446049250313),
  ]),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ],
);

// ./test/core/float_misc.wast:379
assert_return(
  () => invoke($0, `f32.mul`, [
    value("f32", -16.001465),
    value("f32", 0.000000000000000000000000000000000000000298465),
  ]),
  [value("f32", -0.000000000000000000000000000000000000004775883)],
);

// ./test/core/float_misc.wast:382
assert_return(
  () => invoke($0, `f32.div`, [value("f32", 1.1234568), value("f32", 100)]),
  [value("f32", 0.011234568)],
);

// ./test/core/float_misc.wast:383
assert_return(
  () => invoke($0, `f32.div`, [value("f32", 8391667), value("f32", 12582905)]),
  [value("f32", 0.6669102)],
);

// ./test/core/float_misc.wast:384
assert_return(
  () => invoke($0, `f32.div`, [value("f32", 65536), value("f32", 0.000000000007275958)]),
  [value("f32", 9007199000000000)],
);

// ./test/core/float_misc.wast:385
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", 1.8622957),
    value("f32", 340282350000000000000000000000000000000),
  ]),
  [value("f32", 0.000000000000000000000000000000000000005472795)],
);

// ./test/core/float_misc.wast:386
assert_return(
  () => invoke($0, `f32.div`, [value("f32", 4), value("f32", 3)]),
  [value("f32", 1.3333334)],
);

// ./test/core/float_misc.wast:387
assert_return(
  () => invoke($0, `f64.div`, [value("f64", 1.123456789), value("f64", 100)]),
  [value("f64", 0.01123456789)],
);

// ./test/core/float_misc.wast:388
assert_return(
  () => invoke($0, `f64.div`, [value("f64", 8391667), value("f64", 12582905)]),
  [value("f64", 0.6669101451532854)],
);

// ./test/core/float_misc.wast:389
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 65536),
    value("f64", 0.000000000007275957614183426),
  ]),
  [value("f64", 9007199254740992)],
);

// ./test/core/float_misc.wast:390
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 1.8622957468032837),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001035936395755283),
  ],
);

// ./test/core/float_misc.wast:391
assert_return(
  () => invoke($0, `f64.div`, [value("f64", 4), value("f64", 3)]),
  [value("f64", 1.3333333333333333)],
);

// ./test/core/float_misc.wast:395
assert_return(
  () => invoke($0, `f32.div`, [value("f32", 4195835), value("f32", 3145727)]),
  [value("f32", 1.3338205)],
);

// ./test/core/float_misc.wast:396
assert_return(
  () => invoke($0, `f64.div`, [value("f64", 4195835), value("f64", 3145727)]),
  [value("f64", 1.333820449136241)],
);

// ./test/core/float_misc.wast:399
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", 0.000000000000005029633),
    value("f32", 336324380000000000000000000000000000000),
  ]),
  [value("f32", 0)],
);

// ./test/core/float_misc.wast:400
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", 0.000000000000000000000000008921987),
    value("f32", 354097530000000000000),
  ]),
  [value("f32", 0)],
);

// ./test/core/float_misc.wast:401
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", -104167.47),
    value("f32", 0.0000000000000000000000015866623),
  ]),
  [value("f32", -65651950000000000000000000000)],
);

// ./test/core/float_misc.wast:402
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", -0.000000000000000000000024938657),
    value("f32", -0.00000000000000000000000000000000000036230088),
  ]),
  [value("f32", 68834107000000)],
);

// ./test/core/float_misc.wast:403
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", -4142204200000),
    value("f32", 0.0000000000000000000000011954948),
  ]),
  [value("f32", -3464845000000000000000000000000000000)],
);

// ./test/core/float_misc.wast:404
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 193901163824483840000000000000000000000000000),
    value("f64", 25290742357348314000000000000000000000000000000000000000000000000000),
  ]),
  [value("f64", 0.000000000000000000000007666883046955921)],
);

// ./test/core/float_misc.wast:405
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006600332149752304),
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003007915153468629),
  ]),
  [
    value("f64", 219432125342399270000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:406
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", -934827517366190300000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 4809309529035847000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000019437873809582001),
  ],
);

// ./test/core/float_misc.wast:407
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", -17598339088417535000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 199386072580682850000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", -88262629684409150000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:408
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", -4566268877844991000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 31282495822334530000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("f64", -145968816036246260000000000)],
);

// ./test/core/float_misc.wast:411
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", -1039406400000000000000),
    value("f32", -0.000000000000000000000000012965966),
  ]),
  [value("f32", Infinity)],
);

// ./test/core/float_misc.wast:412
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", 0.000000000000026831563),
    value("f32", 31241038000000),
  ]),
  [value("f32", 0.0000000000000000000000000008588563)],
);

// ./test/core/float_misc.wast:413
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", 1.2734247),
    value("f32", -692783700000000000000000000),
  ]),
  [value("f32", -0.0000000000000000000000000018381274)],
);

// ./test/core/float_misc.wast:414
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", 0.00000000000000068988827),
    value("f32", 0.000000000000000000000000000000000000003762676),
  ]),
  [value("f32", 183350460000000000000000)],
);

// ./test/core/float_misc.wast:415
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", 1819916200000000000000000000),
    value("f32", 205067030000000000000000000),
  ]),
  [value("f32", 8.874739)],
);

// ./test/core/float_misc.wast:416
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000021137715924428077),
    value("f64", -16733261612910253000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("f64", -0)],
);

// ./test/core/float_misc.wast:417
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008116644948016275),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006517571349002277),
  ]),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000012453480772801648),
  ],
);

// ./test/core/float_misc.wast:418
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009335476912259029),
    value("f64", -39099281466396.5),
  ]),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000023876338802497726),
  ],
);

// ./test/core/float_misc.wast:419
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", -1686856985488590200000000),
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000013535993861076857),
  ]),
  [
    value("f64", -12462010568276012000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:420
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", -173388773324941200000000000000000000000000000000000000000000000000000000),
    value("f64", -70026160475217470),
  ]),
  [value("f64", 2476057121342590000000000000000000000000000000000000000)],
);

// ./test/core/float_misc.wast:423
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", 93506190),
    value("f32", 0.0000000000000000000000000000000000028760885),
  ]),
  [value("f32", Infinity)],
);

// ./test/core/float_misc.wast:424
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", -200575400000000000000000),
    value("f32", 246697220),
  ]),
  [value("f32", -813042800000000)],
);

// ./test/core/float_misc.wast:425
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", 384712200000),
    value("f32", -107037850000000000000000000000),
  ]),
  [value("f32", -0.00000000000000000359417)],
);

// ./test/core/float_misc.wast:426
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", -4156665000000000000000000000000000),
    value("f32", -901.4192),
  ]),
  [value("f32", 4611245300000000000000000000000)],
);

// ./test/core/float_misc.wast:427
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", -6702387000000000000000000000),
    value("f32", -14000.255),
  ]),
  [value("f32", 478733200000000000000000)],
);

// ./test/core/float_misc.wast:428
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010085269598907525),
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000018780374032850215),
  ]),
  [value("f64", -53701111496.85621)],
);

// ./test/core/float_misc.wast:429
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", -32571664562951100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005885738519211168),
  ]),
  [value("f64", Infinity)],
);

// ./test/core/float_misc.wast:430
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000031640946861233317),
    value("f64", 0.000000000000000000045854510556516254),
  ]),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006900291046010721),
  ],
);

// ./test/core/float_misc.wast:431
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", -526842242946656600000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014816907071451201),
  ]),
  [
    value("f64", 355568298030134360000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:432
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 4039956270017490000000000000000000000000000000000000000),
    value("f64", -47097881971884274000000000000000000000000000000000000000000000000),
  ]),
  [value("f64", -0.0000000000857778757955442)],
);

// ./test/core/float_misc.wast:435
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", -203959560468347600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -74740887394612260000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 2728888665604071000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:436
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", -304261712294687660000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", -2655679232658824300000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 114570204320220420000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:437
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 49235240512480730000000000000000000000000000000000000000),
    value("f64", -366340828310036700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000013439736089369927),
  ],
);

// ./test/core/float_misc.wast:438
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 289260843556341600000000000000000000000000000000000000000000000000),
    value("f64", 517194875837335500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000005592879146144478),
  ],
);

// ./test/core/float_misc.wast:439
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", -421542582344268600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 1428505854670649100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", -295093352936560340000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:442
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 1.8622957433108482),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010359363938125513),
  ],
);

// ./test/core/float_misc.wast:443
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008566632480779937),
    value("f64", 5381.2699796556235),
  ]),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001591935084685746),
  ],
);

// ./test/core/float_misc.wast:444
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", -0.00000000000000000000000000000000000000000008196220919495565),
    value("f64", -10406557086484777000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007876015911295176),
  ],
);

// ./test/core/float_misc.wast:445
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007052801866447111),
    value("f64", -13767429405781133000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005122816800851397),
  ],
);

// ./test/core/float_misc.wast:446
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022655621734165475),
    value("f64", 133219932963494700000000000000000000000000000000000),
  ]),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000017006180103974106),
  ],
);

// ./test/core/float_misc.wast:447
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004196304106554003),
    value("f64", -9789327.297653636),
  ]),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000042866113053139),
  ],
);

// ./test/core/float_misc.wast:450
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", 1038860800000000000000000000),
    value("f32", 6211079500000),
  ]),
  [value("f32", 167259300000000)],
);

// ./test/core/float_misc.wast:451
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", 1869033000000000000000000000),
    value("f32", -112355730000000000000000000000000),
  ]),
  [value("f32", -0.00001663496)],
);

// ./test/core/float_misc.wast:452
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", 3290747200000000000000000),
    value("f32", 0.9064788),
  ]),
  [value("f32", 3630252700000000000000000)],
);

// ./test/core/float_misc.wast:453
assert_return(
  () => invoke($0, `f32.div`, [value("f32", -908946.56), value("f32", -17034289000)]),
  [value("f32", 0.000053359818)],
);

// ./test/core/float_misc.wast:454
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", -0.00000000000024092477),
    value("f32", -89840810000000000),
  ]),
  [value("f32", 0.0000000000000000000000000000026816852)],
);

// ./test/core/float_misc.wast:455
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 3910973045785834000),
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008392730733897136),
  ]),
  [
    value("f64", -46599529638070336000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:456
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 0.0000000000000000000000000000000000000008379351966732404),
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000021077277802048832),
  ]),
  [
    value("f64", -3975538039318286000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:457
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 4561142017854715000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    value("f64", 1500578067736849100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("f64", 3039589952.6465592)],
);

// ./test/core/float_misc.wast:458
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", -6236072401827852000000000000000000000000000000000000000),
    value("f64", 83170632504609900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007497925907299316),
  ],
);

// ./test/core/float_misc.wast:459
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009757271330468098),
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000035613812243480865),
  ]),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000002739743575824061),
  ],
);

// ./test/core/float_misc.wast:462
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 0.00000000000000001046256872449641),
    value("f64", 1.8150892711657447),
  ]),
  [value("f64", 0.000000000000000005764217160391678)],
);

// ./test/core/float_misc.wast:463
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 0.00000000000000000000000000000022038268106596436),
    value("f64", -0.0000000000002859803943943555),
  ]),
  [value("f64", -0.0000000000000000007706216418530616)],
);

// ./test/core/float_misc.wast:464
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 0.0000000000007596539988437179),
    value("f64", 0.00000000000000000000000000000000021055358831337124),
  ]),
  [value("f64", 3607889112357986600000)],
);

// ./test/core/float_misc.wast:465
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 1120696114500866900000000000),
    value("f64", 159713233802866500000000000000),
  ]),
  [value("f64", 0.007016927074960728)],
);

// ./test/core/float_misc.wast:466
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 0.0006342142502301953),
    value("f64", -6391950865520085),
  ]),
  [value("f64", -0.00000000000000000009922076429769178)],
);

// ./test/core/float_misc.wast:469
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", 0.000000000000000000000000000000000000011754944),
    value("f32", 0.000000000000000000000000000000000000011754942),
  ]),
  [value("f32", 1.0000001)],
);

// ./test/core/float_misc.wast:470
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", 0.000000000000000000000000000000000000011754942),
    value("f32", 0.000000000000000000000000000000000000011754944),
  ]),
  [value("f32", 0.9999999)],
);

// ./test/core/float_misc.wast:471
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002225073858507201),
  ]),
  [value("f64", 1.0000000000000002)],
);

// ./test/core/float_misc.wast:472
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002225073858507201),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [value("f64", 0.9999999999999998)],
);

// ./test/core/float_misc.wast:475
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", 0.00000023841856),
    value("f32", 340282350000000000000000000000000000000),
  ]),
  [value("f32", 0)],
);

// ./test/core/float_misc.wast:476
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", 0.00000023841858),
    value("f32", 340282350000000000000000000000000000000),
  ]),
  [value("f32", 0.000000000000000000000000000000000000000000001)],
);

// ./test/core/float_misc.wast:477
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 0.00000000000000044408920985006257),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("f64", 0)],
);

// ./test/core/float_misc.wast:478
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 0.0000000000000004440892098500626),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ],
);

// ./test/core/float_misc.wast:481
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", 1),
    value("f32", 0.000000000000000000000000000000000000002938736),
  ]),
  [value("f32", Infinity)],
);

// ./test/core/float_misc.wast:482
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", 1),
    value("f32", 0.000000000000000000000000000000000000002938737),
  ]),
  [value("f32", 340282200000000000000000000000000000000)],
);

// ./test/core/float_misc.wast:483
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 1),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005562684646268003),
  ]),
  [value("f64", Infinity)],
);

// ./test/core/float_misc.wast:484
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 1),
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000556268464626801),
  ]),
  [
    value("f64", 179769313486231430000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:487
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", 1),
    value("f32", 85070600000000000000000000000000000000),
  ]),
  [value("f32", 0.000000000000000000000000000000000000011754942)],
);

// ./test/core/float_misc.wast:488
assert_return(
  () => invoke($0, `f32.div`, [
    value("f32", 1),
    value("f32", 85070590000000000000000000000000000000),
  ]),
  [value("f32", 0.000000000000000000000000000000000000011754944)],
);

// ./test/core/float_misc.wast:489
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 1),
    value("f64", 44942328371557910000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002225073858507201),
  ],
);

// ./test/core/float_misc.wast:490
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 1),
    value("f64", 44942328371557900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ],
);

// ./test/core/float_misc.wast:500
assert_return(
  () => invoke($0, `f32.div`, [value("f32", 1), value("f32", 3)]),
  [value("f32", 0.33333334)],
);

// ./test/core/float_misc.wast:501
assert_return(
  () => invoke($0, `f32.div`, [value("f32", 3), value("f32", 9)]),
  [value("f32", 0.33333334)],
);

// ./test/core/float_misc.wast:502
assert_return(
  () => invoke($0, `f32.div`, [value("f32", 9), value("f32", 27)]),
  [value("f32", 0.33333334)],
);

// ./test/core/float_misc.wast:503
assert_return(
  () => invoke($0, `f64.div`, [value("f64", 1), value("f64", 3)]),
  [value("f64", 0.3333333333333333)],
);

// ./test/core/float_misc.wast:504
assert_return(
  () => invoke($0, `f64.div`, [value("f64", 3), value("f64", 9)]),
  [value("f64", 0.3333333333333333)],
);

// ./test/core/float_misc.wast:505
assert_return(
  () => invoke($0, `f64.div`, [value("f64", 9), value("f64", 27)]),
  [value("f64", 0.3333333333333333)],
);

// ./test/core/float_misc.wast:508
assert_return(
  () => invoke($0, `f32.div`, [value("f32", 1.0000001), value("f32", 0.99999994)]),
  [value("f32", 1.0000002)],
);

// ./test/core/float_misc.wast:509
assert_return(
  () => invoke($0, `f32.div`, [value("f32", 0.99999994), value("f32", 1.0000001)]),
  [value("f32", 0.9999998)],
);

// ./test/core/float_misc.wast:510
assert_return(
  () => invoke($0, `f32.div`, [value("f32", 1), value("f32", 0.99999994)]),
  [value("f32", 1.0000001)],
);

// ./test/core/float_misc.wast:511
assert_return(
  () => invoke($0, `f32.div`, [value("f32", 1), value("f32", 1.0000001)]),
  [value("f32", 0.9999999)],
);

// ./test/core/float_misc.wast:512
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 1.0000000000000002),
    value("f64", 0.9999999999999999),
  ]),
  [value("f64", 1.0000000000000004)],
);

// ./test/core/float_misc.wast:513
assert_return(
  () => invoke($0, `f64.div`, [
    value("f64", 0.9999999999999999),
    value("f64", 1.0000000000000002),
  ]),
  [value("f64", 0.9999999999999997)],
);

// ./test/core/float_misc.wast:514
assert_return(
  () => invoke($0, `f64.div`, [value("f64", 1), value("f64", 0.9999999999999999)]),
  [value("f64", 1.0000000000000002)],
);

// ./test/core/float_misc.wast:515
assert_return(
  () => invoke($0, `f64.div`, [value("f64", 1), value("f64", 1.0000000000000002)]),
  [value("f64", 0.9999999999999998)],
);

// ./test/core/float_misc.wast:519
assert_return(() => invoke($0, `f32.sqrt`, [value("f32", 171)]), [value("f32", 13.076696)]);

// ./test/core/float_misc.wast:520
assert_return(
  () => invoke($0, `f32.sqrt`, [value("f32", 0.000000160795)]),
  [value("f32", 0.00040099252)],
);

// ./test/core/float_misc.wast:521
assert_return(() => invoke($0, `f64.sqrt`, [value("f64", 171)]), [value("f64", 13.076696830622021)]);

// ./test/core/float_misc.wast:522
assert_return(
  () => invoke($0, `f64.sqrt`, [value("f64", 0.000000160795)]),
  [value("f64", 0.00040099251863345283)],
);

// ./test/core/float_misc.wast:525
assert_return(
  () => invoke($0, `f64.sqrt`, [
    value("f64", 0.00000000000000000000000000000000000000000000000004316357580352844),
  ]),
  [value("f64", 0.00000000000000000000000020775845543209175)],
);

// ./test/core/float_misc.wast:526
assert_return(
  () => invoke($0, `f64.sqrt`, [
    value("f64", 676253300479648500000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("f64", 822346216918183800000000000000000000000000000000000)],
);

// ./test/core/float_misc.wast:527
assert_return(
  () => invoke($0, `f64.sqrt`, [
    value("f64", 17485296624861996000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("f64", 4181542373916829400000000000000000000000000000000000000000000)],
);

// ./test/core/float_misc.wast:528
assert_return(
  () => invoke($0, `f64.sqrt`, [value("f64", 0.000000000009593720960603523)]),
  [value("f64", 0.0000030973732355987585)],
);

// ./test/core/float_misc.wast:529
assert_return(
  () => invoke($0, `f64.sqrt`, [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006348452898717835),
  ]),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000002519613640762773),
  ],
);

// ./test/core/float_misc.wast:533
assert_return(
  () => invoke($0, `f64.sqrt`, [value("f64", 0.9999999999999999)]),
  [value("f64", 0.9999999999999999)],
);

// ./test/core/float_misc.wast:536
assert_return(() => invoke($0, `f32.sqrt`, [value("f32", 0.12963942)]), [value("f32", 0.36005473)]);

// ./test/core/float_misc.wast:537
assert_return(
  () => invoke($0, `f32.sqrt`, [value("f32", 2345875800000000000000000000000)]),
  [value("f32", 1531625200000000)],
);

// ./test/core/float_misc.wast:538
assert_return(() => invoke($0, `f32.sqrt`, [value("f32", 0.078786574)]), [value("f32", 0.28068945)]);

// ./test/core/float_misc.wast:539
assert_return(
  () => invoke($0, `f32.sqrt`, [value("f32", 0.00000000000000000000051371026)]),
  [value("f32", 0.000000000022665177)],
);

// ./test/core/float_misc.wast:540
assert_return(() => invoke($0, `f32.sqrt`, [value("f32", 0.00090167153)]), [value("f32", 0.030027846)]);

// ./test/core/float_misc.wast:541
assert_return(
  () => invoke($0, `f64.sqrt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009591922760825561),
  ]),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009793836204892116),
  ],
);

// ./test/core/float_misc.wast:542
assert_return(
  () => invoke($0, `f64.sqrt`, [
    value("f64", 935787535216400500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 30590644570136150000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:543
assert_return(
  () => invoke($0, `f64.sqrt`, [
    value("f64", 147706699783365580000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [value("f64", 12153464517715332000000000000000000000000000000000000000000)],
);

// ./test/core/float_misc.wast:544
assert_return(
  () => invoke($0, `f64.sqrt`, [value("f64", 48800457180027890000000000000000)]),
  [value("f64", 6985732401117859)],
);

// ./test/core/float_misc.wast:545
assert_return(
  () => invoke($0, `f64.sqrt`, [
    value("f64", 7618977687174540000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 2760249569726357000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:548
assert_return(() => invoke($0, `f32.sqrt`, [value("f32", 154481010)]), [value("f32", 12429.039)]);

// ./test/core/float_misc.wast:549
assert_return(
  () => invoke($0, `f32.sqrt`, [
    value("f32", 0.00000000000000000000000000000000010471305),
  ]),
  [value("f32", 0.00000000000000001023294)],
);

// ./test/core/float_misc.wast:550
assert_return(() => invoke($0, `f32.sqrt`, [value("f32", 0.00003790637)]), [value("f32", 0.006156815)]);

// ./test/core/float_misc.wast:551
assert_return(
  () => invoke($0, `f32.sqrt`, [
    value("f32", 0.00000000000000000000000000000000000089607535),
  ]),
  [value("f32", 0.0000000000000000009466126)],
);

// ./test/core/float_misc.wast:552
assert_return(
  () => invoke($0, `f32.sqrt`, [
    value("f32", 0.0000000000000000000000000000000000001687712),
  ]),
  [value("f32", 0.00000000000000000041081773)],
);

// ./test/core/float_misc.wast:553
assert_return(
  () => invoke($0, `f64.sqrt`, [
    value("f64", 316996264378909500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 563024212959717700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:554
assert_return(
  () => invoke($0, `f64.sqrt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040573669271847993),
  ]),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020142906759414837),
  ],
);

// ./test/core/float_misc.wast:555
assert_return(
  () => invoke($0, `f64.sqrt`, [value("f64", 0.0000000015299861660588838)]),
  [value("f64", 0.00003911503759500793)],
);

// ./test/core/float_misc.wast:556
assert_return(
  () => invoke($0, `f64.sqrt`, [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000002822766928951239),
  ]),
  [value("f64", 0.0000000000000000000000000000000000005312971794533864)],
);

// ./test/core/float_misc.wast:557
assert_return(
  () => invoke($0, `f64.sqrt`, [
    value("f64", 14375957727045067000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 119899782014168260000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:560
assert_return(
  () => invoke($0, `f32.sqrt`, [value("f32", 464023420000000000000000000000000000)]),
  [value("f32", 681192700000000000)],
);

// ./test/core/float_misc.wast:561
assert_return(() => invoke($0, `f32.sqrt`, [value("f32", 47536.133)]), [value("f32", 218.02783)]);

// ./test/core/float_misc.wast:562
assert_return(() => invoke($0, `f32.sqrt`, [value("f32", 0.812613)]), [value("f32", 0.9014505)]);

// ./test/core/float_misc.wast:563
assert_return(
  () => invoke($0, `f32.sqrt`, [value("f32", 0.000000000000000000000000009549605)]),
  [value("f32", 0.00000000000009772208)],
);

// ./test/core/float_misc.wast:564
assert_return(
  () => invoke($0, `f32.sqrt`, [value("f32", 0.000000000000000000000000000068856485)]),
  [value("f32", 0.000000000000008297981)],
);

// ./test/core/float_misc.wast:565
assert_return(
  () => invoke($0, `f64.sqrt`, [
    value("f64", 2349768917495332200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 1532895599020146000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:566
assert_return(
  () => invoke($0, `f64.sqrt`, [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000029262574743429683),
  ]),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000005409489323718985),
  ],
);

// ./test/core/float_misc.wast:567
assert_return(
  () => invoke($0, `f64.sqrt`, [
    value("f64", 377335087484490800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 19425114864126050000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:568
assert_return(
  () => invoke($0, `f64.sqrt`, [value("f64", 0.000000000000035498432023945234)]),
  [value("f64", 0.00000018841027579180822)],
);

// ./test/core/float_misc.wast:569
assert_return(
  () => invoke($0, `f64.sqrt`, [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000013747419336166767),
  ]),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000011724938949165905),
  ],
);

// ./test/core/float_misc.wast:572
assert_return(
  () => invoke($0, `f64.sqrt`, [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000015535152663257847),
  ]),
  [`canonical_nan`],
);

// ./test/core/float_misc.wast:573
assert_return(
  () => invoke($0, `f64.sqrt`, [value("f64", 18763296348029700000000000000000)]),
  [value("f64", 4331662076851067)],
);

// ./test/core/float_misc.wast:574
assert_return(
  () => invoke($0, `f64.sqrt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000274405777036165),
  ]),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000523837548325972),
  ],
);

// ./test/core/float_misc.wast:575
assert_return(
  () => invoke($0, `f64.sqrt`, [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000015613859952920445),
  ]),
  [value("f64", 0.0000000000000000000000000000000000000000039514377070783294)],
);

// ./test/core/float_misc.wast:576
assert_return(
  () => invoke($0, `f64.sqrt`, [
    value("f64", 619303768945071200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    value("f64", 24885814612848646000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/float_misc.wast:579
assert_return(() => invoke($0, `f32.sqrt`, [value("f32", 1.0000001)]), [value("f32", 1)]);

// ./test/core/float_misc.wast:580
assert_return(() => invoke($0, `f32.sqrt`, [value("f32", 1.0000002)]), [value("f32", 1.0000001)]);

// ./test/core/float_misc.wast:581
assert_return(() => invoke($0, `f64.sqrt`, [value("f64", 1.0000000000000002)]), [value("f64", 1)]);

// ./test/core/float_misc.wast:582
assert_return(
  () => invoke($0, `f64.sqrt`, [value("f64", 1.0000000000000004)]),
  [value("f64", 1.0000000000000002)],
);

// ./test/core/float_misc.wast:585
assert_return(() => invoke($0, `f32.sqrt`, [value("f32", 0.9999999)]), [value("f32", 0.99999994)]);

// ./test/core/float_misc.wast:586
assert_return(() => invoke($0, `f32.sqrt`, [value("f32", 0.9999998)]), [value("f32", 0.9999999)]);

// ./test/core/float_misc.wast:587
assert_return(
  () => invoke($0, `f64.sqrt`, [value("f64", 0.9999999999999998)]),
  [value("f64", 0.9999999999999999)],
);

// ./test/core/float_misc.wast:588
assert_return(
  () => invoke($0, `f64.sqrt`, [value("f64", 0.9999999999999997)]),
  [value("f64", 0.9999999999999998)],
);

// ./test/core/float_misc.wast:592
assert_return(
  () => invoke($0, `f32.abs`, [bytes("f32", [0xe2, 0xf1, 0x80, 0x7f])]),
  [bytes("f32", [0xe2, 0xf1, 0x80, 0x7f])],
);

// ./test/core/float_misc.wast:593
assert_return(
  () => invoke($0, `f32.abs`, [bytes("f32", [0xe2, 0xf1, 0x80, 0xff])]),
  [bytes("f32", [0xe2, 0xf1, 0x80, 0x7f])],
);

// ./test/core/float_misc.wast:594
assert_return(
  () => invoke($0, `f64.abs`, [
    bytes("f64", [0x6b, 0x7a, 0xe2, 0xf1, 0x0, 0x0, 0xf0, 0x7f]),
  ]),
  [bytes("f64", [0x6b, 0x7a, 0xe2, 0xf1, 0x0, 0x0, 0xf0, 0x7f])],
);

// ./test/core/float_misc.wast:595
assert_return(
  () => invoke($0, `f64.abs`, [
    bytes("f64", [0x6b, 0x7a, 0xe2, 0xf1, 0x0, 0x0, 0xf0, 0xff]),
  ]),
  [bytes("f64", [0x6b, 0x7a, 0xe2, 0xf1, 0x0, 0x0, 0xf0, 0x7f])],
);

// ./test/core/float_misc.wast:597
assert_return(
  () => invoke($0, `f32.neg`, [bytes("f32", [0xe2, 0xf1, 0x80, 0x7f])]),
  [bytes("f32", [0xe2, 0xf1, 0x80, 0xff])],
);

// ./test/core/float_misc.wast:598
assert_return(
  () => invoke($0, `f32.neg`, [bytes("f32", [0xe2, 0xf1, 0x80, 0xff])]),
  [bytes("f32", [0xe2, 0xf1, 0x80, 0x7f])],
);

// ./test/core/float_misc.wast:599
assert_return(
  () => invoke($0, `f64.neg`, [
    bytes("f64", [0x6b, 0x7a, 0xe2, 0xf1, 0x0, 0x0, 0xf0, 0x7f]),
  ]),
  [bytes("f64", [0x6b, 0x7a, 0xe2, 0xf1, 0x0, 0x0, 0xf0, 0xff])],
);

// ./test/core/float_misc.wast:600
assert_return(
  () => invoke($0, `f64.neg`, [
    bytes("f64", [0x6b, 0x7a, 0xe2, 0xf1, 0x0, 0x0, 0xf0, 0xff]),
  ]),
  [bytes("f64", [0x6b, 0x7a, 0xe2, 0xf1, 0x0, 0x0, 0xf0, 0x7f])],
);

// ./test/core/float_misc.wast:602
assert_return(
  () => invoke($0, `f32.copysign`, [
    bytes("f32", [0xe2, 0xf1, 0x80, 0x7f]),
    bytes("f32", [0x0, 0x0, 0xc0, 0x7f]),
  ]),
  [bytes("f32", [0xe2, 0xf1, 0x80, 0x7f])],
);

// ./test/core/float_misc.wast:603
assert_return(
  () => invoke($0, `f32.copysign`, [
    bytes("f32", [0xe2, 0xf1, 0x80, 0x7f]),
    bytes("f32", [0x0, 0x0, 0xc0, 0xff]),
  ]),
  [bytes("f32", [0xe2, 0xf1, 0x80, 0xff])],
);

// ./test/core/float_misc.wast:604
assert_return(
  () => invoke($0, `f32.copysign`, [
    bytes("f32", [0xe2, 0xf1, 0x80, 0xff]),
    bytes("f32", [0x0, 0x0, 0xc0, 0x7f]),
  ]),
  [bytes("f32", [0xe2, 0xf1, 0x80, 0x7f])],
);

// ./test/core/float_misc.wast:605
assert_return(
  () => invoke($0, `f32.copysign`, [
    bytes("f32", [0xe2, 0xf1, 0x80, 0xff]),
    bytes("f32", [0x0, 0x0, 0xc0, 0xff]),
  ]),
  [bytes("f32", [0xe2, 0xf1, 0x80, 0xff])],
);

// ./test/core/float_misc.wast:606
assert_return(
  () => invoke($0, `f64.copysign`, [
    bytes("f64", [0x6b, 0x7a, 0xe2, 0xf1, 0x0, 0x0, 0xf0, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [bytes("f64", [0x6b, 0x7a, 0xe2, 0xf1, 0x0, 0x0, 0xf0, 0x7f])],
);

// ./test/core/float_misc.wast:607
assert_return(
  () => invoke($0, `f64.copysign`, [
    bytes("f64", [0x6b, 0x7a, 0xe2, 0xf1, 0x0, 0x0, 0xf0, 0x7f]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [bytes("f64", [0x6b, 0x7a, 0xe2, 0xf1, 0x0, 0x0, 0xf0, 0xff])],
);

// ./test/core/float_misc.wast:608
assert_return(
  () => invoke($0, `f64.copysign`, [
    bytes("f64", [0x6b, 0x7a, 0xe2, 0xf1, 0x0, 0x0, 0xf0, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [bytes("f64", [0x6b, 0x7a, 0xe2, 0xf1, 0x0, 0x0, 0xf0, 0x7f])],
);

// ./test/core/float_misc.wast:609
assert_return(
  () => invoke($0, `f64.copysign`, [
    bytes("f64", [0x6b, 0x7a, 0xe2, 0xf1, 0x0, 0x0, 0xf0, 0xff]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [bytes("f64", [0x6b, 0x7a, 0xe2, 0xf1, 0x0, 0x0, 0xf0, 0xff])],
);

// ./test/core/float_misc.wast:612
assert_return(() => invoke($0, `f32.ceil`, [value("f32", 0.99999994)]), [value("f32", 1)]);

// ./test/core/float_misc.wast:613
assert_return(() => invoke($0, `f32.ceil`, [value("f32", 1.0000001)]), [value("f32", 2)]);

// ./test/core/float_misc.wast:614
assert_return(() => invoke($0, `f64.ceil`, [value("f64", 0.9999999999999999)]), [value("f64", 1)]);

// ./test/core/float_misc.wast:615
assert_return(() => invoke($0, `f64.ceil`, [value("f64", 1.0000000000000002)]), [value("f64", 2)]);

// ./test/core/float_misc.wast:618
assert_return(() => invoke($0, `f32.ceil`, [value("f32", 8388607.5)]), [value("f32", 8388608)]);

// ./test/core/float_misc.wast:619
assert_return(() => invoke($0, `f32.ceil`, [value("f32", -8388607.5)]), [value("f32", -8388607)]);

// ./test/core/float_misc.wast:620
assert_return(
  () => invoke($0, `f64.ceil`, [value("f64", 4503599627370495.5)]),
  [value("f64", 4503599627370496)],
);

// ./test/core/float_misc.wast:621
assert_return(
  () => invoke($0, `f64.ceil`, [value("f64", -4503599627370495.5)]),
  [value("f64", -4503599627370495)],
);

// ./test/core/float_misc.wast:625
assert_return(() => invoke($0, `f32.ceil`, [value("f32", 16777215)]), [value("f32", 16777215)]);

// ./test/core/float_misc.wast:626
assert_return(() => invoke($0, `f32.ceil`, [value("f32", -16777215)]), [value("f32", -16777215)]);

// ./test/core/float_misc.wast:627
assert_return(
  () => invoke($0, `f64.ceil`, [value("f64", 9007199254740991)]),
  [value("f64", 9007199254740991)],
);

// ./test/core/float_misc.wast:628
assert_return(
  () => invoke($0, `f64.ceil`, [value("f64", -9007199254740991)]),
  [value("f64", -9007199254740991)],
);

// ./test/core/float_misc.wast:631
assert_return(() => invoke($0, `f32.floor`, [value("f32", -0.99999994)]), [value("f32", -1)]);

// ./test/core/float_misc.wast:632
assert_return(() => invoke($0, `f32.floor`, [value("f32", -1.0000001)]), [value("f32", -2)]);

// ./test/core/float_misc.wast:633
assert_return(() => invoke($0, `f64.floor`, [value("f64", -0.9999999999999999)]), [value("f64", -1)]);

// ./test/core/float_misc.wast:634
assert_return(() => invoke($0, `f64.floor`, [value("f64", -1.0000000000000002)]), [value("f64", -2)]);

// ./test/core/float_misc.wast:637
assert_return(() => invoke($0, `f32.floor`, [value("f32", -8388607.5)]), [value("f32", -8388608)]);

// ./test/core/float_misc.wast:638
assert_return(() => invoke($0, `f32.floor`, [value("f32", 8388607.5)]), [value("f32", 8388607)]);

// ./test/core/float_misc.wast:639
assert_return(
  () => invoke($0, `f64.floor`, [value("f64", -4503599627370495.5)]),
  [value("f64", -4503599627370496)],
);

// ./test/core/float_misc.wast:640
assert_return(
  () => invoke($0, `f64.floor`, [value("f64", 4503599627370495.5)]),
  [value("f64", 4503599627370495)],
);

// ./test/core/float_misc.wast:644
assert_return(() => invoke($0, `f32.floor`, [value("f32", 88607)]), [value("f32", 88607)]);

// ./test/core/float_misc.wast:645
assert_return(() => invoke($0, `f64.floor`, [value("f64", 88607)]), [value("f64", 88607)]);

// ./test/core/float_misc.wast:648
assert_return(() => invoke($0, `f32.trunc`, [value("f32", -8388607.5)]), [value("f32", -8388607)]);

// ./test/core/float_misc.wast:649
assert_return(() => invoke($0, `f32.trunc`, [value("f32", 8388607.5)]), [value("f32", 8388607)]);

// ./test/core/float_misc.wast:650
assert_return(
  () => invoke($0, `f64.trunc`, [value("f64", -4503599627370495.5)]),
  [value("f64", -4503599627370495)],
);

// ./test/core/float_misc.wast:651
assert_return(
  () => invoke($0, `f64.trunc`, [value("f64", 4503599627370495.5)]),
  [value("f64", 4503599627370495)],
);

// ./test/core/float_misc.wast:656
assert_return(() => invoke($0, `f32.nearest`, [value("f32", 8388609)]), [value("f32", 8388609)]);

// ./test/core/float_misc.wast:657
assert_return(() => invoke($0, `f32.nearest`, [value("f32", 8388610)]), [value("f32", 8388610)]);

// ./test/core/float_misc.wast:658
assert_return(() => invoke($0, `f32.nearest`, [value("f32", 0.49999997)]), [value("f32", 0)]);

// ./test/core/float_misc.wast:659
assert_return(
  () => invoke($0, `f32.nearest`, [value("f32", 281474960000000)]),
  [value("f32", 281474960000000)],
);

// ./test/core/float_misc.wast:660
assert_return(
  () => invoke($0, `f64.nearest`, [value("f64", 4503599627370497)]),
  [value("f64", 4503599627370497)],
);

// ./test/core/float_misc.wast:661
assert_return(
  () => invoke($0, `f64.nearest`, [value("f64", 4503599627370498)]),
  [value("f64", 4503599627370498)],
);

// ./test/core/float_misc.wast:662
assert_return(() => invoke($0, `f64.nearest`, [value("f64", 0.49999999999999994)]), [value("f64", 0)]);

// ./test/core/float_misc.wast:663
assert_return(
  () => invoke($0, `f64.nearest`, [value("f64", 81129638414606670000000000000000)]),
  [value("f64", 81129638414606670000000000000000)],
);

// ./test/core/float_misc.wast:667
assert_return(() => invoke($0, `f32.nearest`, [value("f32", 4.5)]), [value("f32", 4)]);

// ./test/core/float_misc.wast:668
assert_return(() => invoke($0, `f32.nearest`, [value("f32", -4.5)]), [value("f32", -4)]);

// ./test/core/float_misc.wast:669
assert_return(() => invoke($0, `f32.nearest`, [value("f32", -3.5)]), [value("f32", -4)]);

// ./test/core/float_misc.wast:670
assert_return(() => invoke($0, `f64.nearest`, [value("f64", 4.5)]), [value("f64", 4)]);

// ./test/core/float_misc.wast:671
assert_return(() => invoke($0, `f64.nearest`, [value("f64", -4.5)]), [value("f64", -4)]);

// ./test/core/float_misc.wast:672
assert_return(() => invoke($0, `f64.nearest`, [value("f64", -3.5)]), [value("f64", -4)]);

// ./test/core/float_misc.wast:675
assert_return(() => invoke($0, `f32.nearest`, [value("f32", -8388607.5)]), [value("f32", -8388608)]);

// ./test/core/float_misc.wast:676
assert_return(() => invoke($0, `f32.nearest`, [value("f32", 8388607.5)]), [value("f32", 8388608)]);

// ./test/core/float_misc.wast:677
assert_return(
  () => invoke($0, `f64.nearest`, [value("f64", -4503599627370495.5)]),
  [value("f64", -4503599627370496)],
);

// ./test/core/float_misc.wast:678
assert_return(
  () => invoke($0, `f64.nearest`, [value("f64", 4503599627370495.5)]),
  [value("f64", 4503599627370496)],
);
