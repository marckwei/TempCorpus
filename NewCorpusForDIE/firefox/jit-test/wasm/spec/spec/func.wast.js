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

// ./test/core/func.wast

// ./test/core/func.wast:3
let $0 = instantiate(`(module
  ;; Auxiliary definition
  (type $$sig (func))
  (func $$dummy)

  ;; Syntax

  (func)
  (func (export "f"))
  (func $$f)
  (func $$h (export "g"))

  (func (local))
  (func (local) (local))
  (func (local i32))
  (func (local $$x i32))
  (func (local i32 f64 i64))
  (func (local i32) (local f64))
  (func (local i32 f32) (local $$x i64) (local) (local i32 f64))

  (func (param))
  (func (param) (param))
  (func (param i32))
  (func (param $$x i32))
  (func (param i32 f64 i64))
  (func (param i32) (param f64))
  (func (param i32 f32) (param $$x i64) (param) (param i32 f64))

  (func (result))
  (func (result) (result))
  (func (result i32) (unreachable))
  (func (result i32 f64 f32) (unreachable))
  (func (result i32) (result f64) (unreachable))
  (func (result i32 f32) (result i64) (result) (result i32 f64) (unreachable))

  (type $$sig-1 (func))
  (type $$sig-2 (func (result i32)))
  (type $$sig-3 (func (param $$x i32)))
  (type $$sig-4 (func (param i32 f64 i32) (result i32)))

  (func (export "type-use-1") (type $$sig-1))
  (func (export "type-use-2") (type $$sig-2) (i32.const 0))
  (func (export "type-use-3") (type $$sig-3))
  (func (export "type-use-4") (type $$sig-4) (i32.const 0))
  (func (export "type-use-5") (type $$sig-2) (result i32) (i32.const 0))
  (func (export "type-use-6") (type $$sig-3) (param i32))
  (func (export "type-use-7")
    (type $$sig-4) (param i32) (param f64 i32) (result i32) (i32.const 0)
  )

  (func (type $$sig))
  (func (type $$forward))  ;; forward reference

  (func $$complex
    (param i32 f32) (param $$x i64) (param) (param i32)
    (result) (result i32) (result) (result i64 i32)
    (local f32) (local $$y i32) (local i64 i32) (local) (local f64 i32)
    (unreachable) (unreachable)
  )
  (func $$complex-sig
    (type $$sig)
    (local f32) (local $$y i32) (local i64 i32) (local) (local f64 i32)
    (unreachable) (unreachable)
  )

  (type $$forward (func))

  ;; Typing of locals

  (func (export "local-first-i32") (result i32) (local i32 i32) (local.get 0))
  (func (export "local-first-i64") (result i64) (local i64 i64) (local.get 0))
  (func (export "local-first-f32") (result f32) (local f32 f32) (local.get 0))
  (func (export "local-first-f64") (result f64) (local f64 f64) (local.get 0))
  (func (export "local-second-i32") (result i32) (local i32 i32) (local.get 1))
  (func (export "local-second-i64") (result i64) (local i64 i64) (local.get 1))
  (func (export "local-second-f32") (result f32) (local f32 f32) (local.get 1))
  (func (export "local-second-f64") (result f64) (local f64 f64) (local.get 1))
  (func (export "local-mixed") (result f64)
    (local f32) (local $$x i32) (local i64 i32) (local) (local f64 i32)
    (drop (f32.neg (local.get 0)))
    (drop (i32.eqz (local.get 1)))
    (drop (i64.eqz (local.get 2)))
    (drop (i32.eqz (local.get 3)))
    (drop (f64.neg (local.get 4)))
    (drop (i32.eqz (local.get 5)))
    (local.get 4)
  )

  ;; Typing of parameters

  (func (export "param-first-i32") (param i32 i32) (result i32) (local.get 0))
  (func (export "param-first-i64") (param i64 i64) (result i64) (local.get 0))
  (func (export "param-first-f32") (param f32 f32) (result f32) (local.get 0))
  (func (export "param-first-f64") (param f64 f64) (result f64) (local.get 0))
  (func (export "param-second-i32") (param i32 i32) (result i32) (local.get 1))
  (func (export "param-second-i64") (param i64 i64) (result i64) (local.get 1))
  (func (export "param-second-f32") (param f32 f32) (result f32) (local.get 1))
  (func (export "param-second-f64") (param f64 f64) (result f64) (local.get 1))
  (func (export "param-mixed") (param f32 i32) (param) (param $$x i64) (param i32 f64 i32)
    (result f64)
    (drop (f32.neg (local.get 0)))
    (drop (i32.eqz (local.get 1)))
    (drop (i64.eqz (local.get 2)))
    (drop (i32.eqz (local.get 3)))
    (drop (f64.neg (local.get 4)))
    (drop (i32.eqz (local.get 5)))
    (local.get 4)
  )

  ;; Typing of results

  (func (export "empty"))
  (func (export "value-void") (call $$dummy))
  (func (export "value-i32") (result i32) (i32.const 77))
  (func (export "value-i64") (result i64) (i64.const 7777))
  (func (export "value-f32") (result f32) (f32.const 77.7))
  (func (export "value-f64") (result f64) (f64.const 77.77))
  (func (export "value-i32-f64") (result i32 f64) (i32.const 77) (f64.const 7))
  (func (export "value-i32-i32-i32") (result i32 i32 i32)
    (i32.const 1) (i32.const 2) (i32.const 3)
  )
  (func (export "value-block-void") (block (call $$dummy) (call $$dummy)))
  (func (export "value-block-i32") (result i32)
    (block (result i32) (call $$dummy) (i32.const 77))
  )
  (func (export "value-block-i32-i64") (result i32 i64)
    (block (result i32 i64) (call $$dummy) (i32.const 1) (i64.const 2))
  )

  (func (export "return-empty") (return))
  (func (export "return-i32") (result i32) (return (i32.const 78)))
  (func (export "return-i64") (result i64) (return (i64.const 7878)))
  (func (export "return-f32") (result f32) (return (f32.const 78.7)))
  (func (export "return-f64") (result f64) (return (f64.const 78.78)))
  (func (export "return-i32-f64") (result i32 f64)
    (return (i32.const 78) (f64.const 78.78))
  )
  (func (export "return-i32-i32-i32") (result i32 i32 i32)
    (return (i32.const 1) (i32.const 2) (i32.const 3))
  )
  (func (export "return-block-i32") (result i32)
    (return (block (result i32) (call $$dummy) (i32.const 77)))
  )
  (func (export "return-block-i32-i64") (result i32 i64)
    (return (block (result i32 i64) (call $$dummy) (i32.const 1) (i64.const 2)))
  )

  (func (export "break-empty") (br 0))
  (func (export "break-i32") (result i32) (br 0 (i32.const 79)))
  (func (export "break-i64") (result i64) (br 0 (i64.const 7979)))
  (func (export "break-f32") (result f32) (br 0 (f32.const 79.9)))
  (func (export "break-f64") (result f64) (br 0 (f64.const 79.79)))
  (func (export "break-i32-f64") (result i32 f64)
    (br 0 (i32.const 79) (f64.const 79.79))
  )
  (func (export "break-i32-i32-i32") (result i32 i32 i32)
    (br 0 (i32.const 1) (i32.const 2) (i32.const 3))
  )
  (func (export "break-block-i32") (result i32)
    (br 0 (block (result i32) (call $$dummy) (i32.const 77)))
  )
  (func (export "break-block-i32-i64") (result i32 i64)
    (br 0 (block (result i32 i64) (call $$dummy) (i32.const 1) (i64.const 2)))
  )

  (func (export "break-br_if-empty") (param i32)
    (br_if 0 (local.get 0))
  )
  (func (export "break-br_if-num") (param i32) (result i32)
    (drop (br_if 0 (i32.const 50) (local.get 0))) (i32.const 51)
  )
  (func (export "break-br_if-num-num") (param i32) (result i32 i64)
    (drop (drop (br_if 0 (i32.const 50) (i64.const 51) (local.get 0))))
    (i32.const 51) (i64.const 52)
  )

  (func (export "break-br_table-empty") (param i32)
    (br_table 0 0 0 (local.get 0))
  )
  (func (export "break-br_table-num") (param i32) (result i32)
    (br_table 0 0 (i32.const 50) (local.get 0)) (i32.const 51)
  )
  (func (export "break-br_table-num-num") (param i32) (result i32 i64)
    (br_table 0 0 (i32.const 50) (i64.const 51) (local.get 0))
    (i32.const 51) (i64.const 52)
  )
  (func (export "break-br_table-nested-empty") (param i32)
    (block (br_table 0 1 0 (local.get 0)))
  )
  (func (export "break-br_table-nested-num") (param i32) (result i32)
    (i32.add
      (block (result i32)
        (br_table 0 1 0 (i32.const 50) (local.get 0)) (i32.const 51)
      )
      (i32.const 2)
    )
  )
  (func (export "break-br_table-nested-num-num") (param i32) (result i32 i32)
    (i32.add
      (block (result i32 i32)
        (br_table 0 1 0 (i32.const 50) (i32.const 51) (local.get 0))
        (i32.const 51) (i32.const -3)
      )
    )
    (i32.const 52)
  )

  ;; Large signatures

  (func (export "large-sig")
    (param i32 i64 f32 f32 i32 f64 f32 i32 i32 i32 f32 f64 f64 f64 i32 i32 f32)
    (result f64 f32 i32 i32 i32 i64 f32 i32 i32 f32 f64 f64 i32 f32 i32 f64)
    (local.get 5)
    (local.get 2)
    (local.get 0)
    (local.get 8)
    (local.get 7)
    (local.get 1)
    (local.get 3)
    (local.get 9)
    (local.get 4)
    (local.get 6)
    (local.get 13)
    (local.get 11)
    (local.get 15)
    (local.get 16)
    (local.get 14)
    (local.get 12)
  )

  ;; Default initialization of locals

  (func (export "init-local-i32") (result i32) (local i32) (local.get 0))
  (func (export "init-local-i64") (result i64) (local i64) (local.get 0))
  (func (export "init-local-f32") (result f32) (local f32) (local.get 0))
  (func (export "init-local-f64") (result f64) (local f64) (local.get 0))
)`);

// ./test/core/func.wast:241
assert_return(() => invoke($0, `type-use-1`, []), []);

// ./test/core/func.wast:242
assert_return(() => invoke($0, `type-use-2`, []), [value("i32", 0)]);

// ./test/core/func.wast:243
assert_return(() => invoke($0, `type-use-3`, [1]), []);

// ./test/core/func.wast:244
assert_return(() => invoke($0, `type-use-4`, [1, value("f64", 1), 1]), [value("i32", 0)]);

// ./test/core/func.wast:248
assert_return(() => invoke($0, `type-use-5`, []), [value("i32", 0)]);

// ./test/core/func.wast:249
assert_return(() => invoke($0, `type-use-6`, [1]), []);

// ./test/core/func.wast:250
assert_return(() => invoke($0, `type-use-7`, [1, value("f64", 1), 1]), [value("i32", 0)]);

// ./test/core/func.wast:255
assert_return(() => invoke($0, `local-first-i32`, []), [value("i32", 0)]);

// ./test/core/func.wast:256
assert_return(() => invoke($0, `local-first-i64`, []), [value("i64", 0n)]);

// ./test/core/func.wast:257
assert_return(() => invoke($0, `local-first-f32`, []), [value("f32", 0)]);

// ./test/core/func.wast:258
assert_return(() => invoke($0, `local-first-f64`, []), [value("f64", 0)]);

// ./test/core/func.wast:259
assert_return(() => invoke($0, `local-second-i32`, []), [value("i32", 0)]);

// ./test/core/func.wast:260
assert_return(() => invoke($0, `local-second-i64`, []), [value("i64", 0n)]);

// ./test/core/func.wast:261
assert_return(() => invoke($0, `local-second-f32`, []), [value("f32", 0)]);

// ./test/core/func.wast:262
assert_return(() => invoke($0, `local-second-f64`, []), [value("f64", 0)]);

// ./test/core/func.wast:263
assert_return(() => invoke($0, `local-mixed`, []), [value("f64", 0)]);

// ./test/core/func.wast:265
assert_return(() => invoke($0, `param-first-i32`, [2, 3]), [value("i32", 2)]);

// ./test/core/func.wast:268
assert_return(() => invoke($0, `param-first-i64`, [2n, 3n]), [value("i64", 2n)]);

// ./test/core/func.wast:271
assert_return(
  () => invoke($0, `param-first-f32`, [value("f32", 2), value("f32", 3)]),
  [value("f32", 2)],
);

// ./test/core/func.wast:274
assert_return(
  () => invoke($0, `param-first-f64`, [value("f64", 2), value("f64", 3)]),
  [value("f64", 2)],
);

// ./test/core/func.wast:277
assert_return(() => invoke($0, `param-second-i32`, [2, 3]), [value("i32", 3)]);

// ./test/core/func.wast:280
assert_return(() => invoke($0, `param-second-i64`, [2n, 3n]), [value("i64", 3n)]);

// ./test/core/func.wast:283
assert_return(
  () => invoke($0, `param-second-f32`, [value("f32", 2), value("f32", 3)]),
  [value("f32", 3)],
);

// ./test/core/func.wast:286
assert_return(
  () => invoke($0, `param-second-f64`, [value("f64", 2), value("f64", 3)]),
  [value("f64", 3)],
);

// ./test/core/func.wast:290
assert_return(
  () => invoke($0, `param-mixed`, [value("f32", 1), 2, 3n, 4, value("f64", 5.5), 6]),
  [value("f64", 5.5)],
);

// ./test/core/func.wast:298
assert_return(() => invoke($0, `empty`, []), []);

// ./test/core/func.wast:299
assert_return(() => invoke($0, `value-void`, []), []);

// ./test/core/func.wast:300
assert_return(() => invoke($0, `value-i32`, []), [value("i32", 77)]);

// ./test/core/func.wast:301
assert_return(() => invoke($0, `value-i64`, []), [value("i64", 7777n)]);

// ./test/core/func.wast:302
assert_return(() => invoke($0, `value-f32`, []), [value("f32", 77.7)]);

// ./test/core/func.wast:303
assert_return(() => invoke($0, `value-f64`, []), [value("f64", 77.77)]);

// ./test/core/func.wast:304
assert_return(() => invoke($0, `value-i32-f64`, []), [value("i32", 77), value("f64", 7)]);

// ./test/core/func.wast:305
assert_return(
  () => invoke($0, `value-i32-i32-i32`, []),
  [value("i32", 1), value("i32", 2), value("i32", 3)],
);

// ./test/core/func.wast:308
assert_return(() => invoke($0, `value-block-void`, []), []);

// ./test/core/func.wast:309
assert_return(() => invoke($0, `value-block-i32`, []), [value("i32", 77)]);

// ./test/core/func.wast:310
assert_return(() => invoke($0, `value-block-i32-i64`, []), [value("i32", 1), value("i64", 2n)]);

// ./test/core/func.wast:312
assert_return(() => invoke($0, `return-empty`, []), []);

// ./test/core/func.wast:313
assert_return(() => invoke($0, `return-i32`, []), [value("i32", 78)]);

// ./test/core/func.wast:314
assert_return(() => invoke($0, `return-i64`, []), [value("i64", 7878n)]);

// ./test/core/func.wast:315
assert_return(() => invoke($0, `return-f32`, []), [value("f32", 78.7)]);

// ./test/core/func.wast:316
assert_return(() => invoke($0, `return-f64`, []), [value("f64", 78.78)]);

// ./test/core/func.wast:317
assert_return(() => invoke($0, `return-i32-f64`, []), [value("i32", 78), value("f64", 78.78)]);

// ./test/core/func.wast:318
assert_return(
  () => invoke($0, `return-i32-i32-i32`, []),
  [value("i32", 1), value("i32", 2), value("i32", 3)],
);

// ./test/core/func.wast:321
assert_return(() => invoke($0, `return-block-i32`, []), [value("i32", 77)]);

// ./test/core/func.wast:322
assert_return(() => invoke($0, `return-block-i32-i64`, []), [value("i32", 1), value("i64", 2n)]);

// ./test/core/func.wast:324
assert_return(() => invoke($0, `break-empty`, []), []);

// ./test/core/func.wast:325
assert_return(() => invoke($0, `break-i32`, []), [value("i32", 79)]);

// ./test/core/func.wast:326
assert_return(() => invoke($0, `break-i64`, []), [value("i64", 7979n)]);

// ./test/core/func.wast:327
assert_return(() => invoke($0, `break-f32`, []), [value("f32", 79.9)]);

// ./test/core/func.wast:328
assert_return(() => invoke($0, `break-f64`, []), [value("f64", 79.79)]);

// ./test/core/func.wast:329
assert_return(() => invoke($0, `break-i32-f64`, []), [value("i32", 79), value("f64", 79.79)]);

// ./test/core/func.wast:330
assert_return(
  () => invoke($0, `break-i32-i32-i32`, []),
  [value("i32", 1), value("i32", 2), value("i32", 3)],
);

// ./test/core/func.wast:333
assert_return(() => invoke($0, `break-block-i32`, []), [value("i32", 77)]);

// ./test/core/func.wast:334
assert_return(() => invoke($0, `break-block-i32-i64`, []), [value("i32", 1), value("i64", 2n)]);

// ./test/core/func.wast:336
assert_return(() => invoke($0, `break-br_if-empty`, [0]), []);

// ./test/core/func.wast:337
assert_return(() => invoke($0, `break-br_if-empty`, [2]), []);

// ./test/core/func.wast:338
assert_return(() => invoke($0, `break-br_if-num`, [0]), [value("i32", 51)]);

// ./test/core/func.wast:339
assert_return(() => invoke($0, `break-br_if-num`, [1]), [value("i32", 50)]);

// ./test/core/func.wast:340
assert_return(() => invoke($0, `break-br_if-num-num`, [0]), [value("i32", 51), value("i64", 52n)]);

// ./test/core/func.wast:343
assert_return(() => invoke($0, `break-br_if-num-num`, [1]), [value("i32", 50), value("i64", 51n)]);

// ./test/core/func.wast:347
assert_return(() => invoke($0, `break-br_table-empty`, [0]), []);

// ./test/core/func.wast:348
assert_return(() => invoke($0, `break-br_table-empty`, [1]), []);

// ./test/core/func.wast:349
assert_return(() => invoke($0, `break-br_table-empty`, [5]), []);

// ./test/core/func.wast:350
assert_return(() => invoke($0, `break-br_table-empty`, [-1]), []);

// ./test/core/func.wast:351
assert_return(() => invoke($0, `break-br_table-num`, [0]), [value("i32", 50)]);

// ./test/core/func.wast:352
assert_return(() => invoke($0, `break-br_table-num`, [1]), [value("i32", 50)]);

// ./test/core/func.wast:353
assert_return(() => invoke($0, `break-br_table-num`, [10]), [value("i32", 50)]);

// ./test/core/func.wast:354
assert_return(() => invoke($0, `break-br_table-num`, [-100]), [value("i32", 50)]);

// ./test/core/func.wast:355
assert_return(() => invoke($0, `break-br_table-num-num`, [0]), [value("i32", 50), value("i64", 51n)]);

// ./test/core/func.wast:358
assert_return(() => invoke($0, `break-br_table-num-num`, [1]), [value("i32", 50), value("i64", 51n)]);

// ./test/core/func.wast:361
assert_return(() => invoke($0, `break-br_table-num-num`, [10]), [value("i32", 50), value("i64", 51n)]);

// ./test/core/func.wast:364
assert_return(() => invoke($0, `break-br_table-num-num`, [-100]), [value("i32", 50), value("i64", 51n)]);

// ./test/core/func.wast:367
assert_return(() => invoke($0, `break-br_table-nested-empty`, [0]), []);

// ./test/core/func.wast:368
assert_return(() => invoke($0, `break-br_table-nested-empty`, [1]), []);

// ./test/core/func.wast:369
assert_return(() => invoke($0, `break-br_table-nested-empty`, [3]), []);

// ./test/core/func.wast:370
assert_return(() => invoke($0, `break-br_table-nested-empty`, [-2]), []);

// ./test/core/func.wast:371
assert_return(() => invoke($0, `break-br_table-nested-num`, [0]), [value("i32", 52)]);

// ./test/core/func.wast:374
assert_return(() => invoke($0, `break-br_table-nested-num`, [1]), [value("i32", 50)]);

// ./test/core/func.wast:377
assert_return(() => invoke($0, `break-br_table-nested-num`, [2]), [value("i32", 52)]);

// ./test/core/func.wast:380
assert_return(() => invoke($0, `break-br_table-nested-num`, [-3]), [value("i32", 52)]);

// ./test/core/func.wast:383
assert_return(
  () => invoke($0, `break-br_table-nested-num-num`, [0]),
  [value("i32", 101), value("i32", 52)],
);

// ./test/core/func.wast:387
assert_return(
  () => invoke($0, `break-br_table-nested-num-num`, [1]),
  [value("i32", 50), value("i32", 51)],
);

// ./test/core/func.wast:391
assert_return(
  () => invoke($0, `break-br_table-nested-num-num`, [2]),
  [value("i32", 101), value("i32", 52)],
);

// ./test/core/func.wast:395
assert_return(
  () => invoke($0, `break-br_table-nested-num-num`, [-3]),
  [value("i32", 101), value("i32", 52)],
);

// ./test/core/func.wast:400
assert_return(
  () => invoke($0, `large-sig`, [
    0,
    1n,
    value("f32", 2),
    value("f32", 3),
    4,
    value("f64", 5),
    value("f32", 6),
    7,
    8,
    9,
    value("f32", 10),
    value("f64", 11),
    value("f64", 12),
    value("f64", 13),
    14,
    15,
    value("f32", 16),
  ]),
  [
    value("f64", 5),
    value("f32", 2),
    value("i32", 0),
    value("i32", 8),
    value("i32", 7),
    value("i64", 1n),
    value("f32", 3),
    value("i32", 9),
    value("i32", 4),
    value("f32", 6),
    value("f64", 13),
    value("f64", 11),
    value("i32", 15),
    value("f32", 16),
    value("i32", 14),
    value("f64", 12),
  ],
);

// ./test/core/func.wast:414
assert_return(() => invoke($0, `init-local-i32`, []), [value("i32", 0)]);

// ./test/core/func.wast:415
assert_return(() => invoke($0, `init-local-i64`, []), [value("i64", 0n)]);

// ./test/core/func.wast:416
assert_return(() => invoke($0, `init-local-f32`, []), [value("f32", 0)]);

// ./test/core/func.wast:417
assert_return(() => invoke($0, `init-local-f64`, []), [value("f64", 0)]);

// ./test/core/func.wast:422
let $1 = instantiate(`(module
  (func $$f (result f64) (f64.const 0))  ;; adds implicit type definition
  (func $$g (param i32))                 ;; reuses explicit type definition
  (type $$t (func (param i32)))

  (func $$i32->void (type 0))                ;; (param i32)
  (func $$void->f64 (type 1) (f64.const 0))  ;; (result f64)
  (func $$check
    (call $$i32->void (i32.const 0))
    (drop (call $$void->f64))
  )
)`);

// ./test/core/func.wast:435
assert_invalid(
  () => instantiate(`(module
    (func $$f (result f64) (f64.const 0))  ;; adds implicit type definition
    (func $$g (param i32))                 ;; reuses explicit type definition
    (func $$h (result f64) (f64.const 1))  ;; reuses implicit type definition
    (type $$t (func (param i32)))

    (func (type 2))  ;; does not exist
  )`),
  `unknown type`,
);

// ./test/core/func.wast:447
assert_malformed(
  () => instantiate(`(func $$f (result f64) (f64.const 0)) (func $$g (param i32)) (func $$h (result f64) (f64.const 1)) (type $$t (func (param i32))) (func (type 2) (param i32)) `),
  `unknown type`,
);

// ./test/core/func.wast:459
let $2 = instantiate(`(module
  (type $$proc (func (result i32)))
  (type $$sig (func (param i32) (result i32)))

  (func (export "f") (type $$sig)
    (local $$var i32)
    (local.get $$var)
  )

  (func $$g (type $$sig)
    (local $$var i32)
    (local.get $$var)
  )
  (func (export "g") (type $$sig)
    (call $$g (local.get 0))
  )

  (func (export "p") (type $$proc)
    (local $$var i32)
    (local.set 0 (i32.const 42))
    (local.get $$var)
  )
)`);

// ./test/core/func.wast:483
assert_return(() => invoke($2, `f`, [42]), [value("i32", 0)]);

// ./test/core/func.wast:484
assert_return(() => invoke($2, `g`, [42]), [value("i32", 0)]);

// ./test/core/func.wast:485
assert_return(() => invoke($2, `p`, []), [value("i32", 42)]);

// ./test/core/func.wast:488
let $3 = instantiate(`(module
  (type $$sig (func))

  (func $$empty-sig-1)  ;; should be assigned type $$sig
  (func $$complex-sig-1 (param f64 i64 f64 i64 f64 i64 f32 i32))
  (func $$empty-sig-2)  ;; should be assigned type $$sig
  (func $$complex-sig-2 (param f64 i64 f64 i64 f64 i64 f32 i32))
  (func $$complex-sig-3 (param f64 i64 f64 i64 f64 i64 f32 i32))
  (func $$complex-sig-4 (param i64 i64 f64 i64 f64 i64 f32 i32))
  (func $$complex-sig-5 (param i64 i64 f64 i64 f64 i64 f32 i32))

  (type $$empty-sig-duplicate (func))
  (type $$complex-sig-duplicate (func (param i64 i64 f64 i64 f64 i64 f32 i32)))
  (table funcref
    (elem
      $$complex-sig-3 $$empty-sig-2 $$complex-sig-1 $$complex-sig-3 $$empty-sig-1
      $$complex-sig-4 $$complex-sig-5
    )
  )

  (func (export "signature-explicit-reused")
    (call_indirect (type $$sig) (i32.const 1))
    (call_indirect (type $$sig) (i32.const 4))
  )

  (func (export "signature-implicit-reused")
    ;; The implicit index 3 in this test depends on the function and
    ;; type definitions, and may need adapting if they change.
    (call_indirect (type 3)
      (f64.const 0) (i64.const 0) (f64.const 0) (i64.const 0)
      (f64.const 0) (i64.const 0) (f32.const 0) (i32.const 0)
      (i32.const 0)
    )
    (call_indirect (type 3)
      (f64.const 0) (i64.const 0) (f64.const 0) (i64.const 0)
      (f64.const 0) (i64.const 0) (f32.const 0) (i32.const 0)
      (i32.const 2)
    )
    (call_indirect (type 3)
      (f64.const 0) (i64.const 0) (f64.const 0) (i64.const 0)
      (f64.const 0) (i64.const 0) (f32.const 0) (i32.const 0)
      (i32.const 3)
    )
  )

  (func (export "signature-explicit-duplicate")
    (call_indirect (type $$empty-sig-duplicate) (i32.const 1))
  )

  (func (export "signature-implicit-duplicate")
    (call_indirect (type $$complex-sig-duplicate)
      (i64.const 0) (i64.const 0) (f64.const 0) (i64.const 0)
      (f64.const 0) (i64.const 0) (f32.const 0) (i32.const 0)
      (i32.const 5)
    )
    (call_indirect (type $$complex-sig-duplicate)
      (i64.const 0) (i64.const 0) (f64.const 0) (i64.const 0)
      (f64.const 0) (i64.const 0) (f32.const 0) (i32.const 0)
      (i32.const 6)
    )
  )
)`);

// ./test/core/func.wast:551
assert_return(() => invoke($3, `signature-explicit-reused`, []), []);

// ./test/core/func.wast:552
assert_return(() => invoke($3, `signature-implicit-reused`, []), []);

// ./test/core/func.wast:553
assert_return(() => invoke($3, `signature-explicit-duplicate`, []), []);

// ./test/core/func.wast:554
assert_return(() => invoke($3, `signature-implicit-duplicate`, []), []);

// ./test/core/func.wast:559
assert_malformed(
  () => instantiate(`(type $$sig (func (param i32) (result i32))) (func (type $$sig) (result i32) (param i32) (i32.const 0)) `),
  `unexpected token`,
);

// ./test/core/func.wast:566
assert_malformed(
  () => instantiate(`(type $$sig (func (param i32) (result i32))) (func (param i32) (type $$sig) (result i32) (i32.const 0)) `),
  `unexpected token`,
);

// ./test/core/func.wast:573
assert_malformed(
  () => instantiate(`(type $$sig (func (param i32) (result i32))) (func (param i32) (result i32) (type $$sig) (i32.const 0)) `),
  `unexpected token`,
);

// ./test/core/func.wast:580
assert_malformed(
  () => instantiate(`(type $$sig (func (param i32) (result i32))) (func (result i32) (type $$sig) (param i32) (i32.const 0)) `),
  `unexpected token`,
);

// ./test/core/func.wast:587
assert_malformed(
  () => instantiate(`(type $$sig (func (param i32) (result i32))) (func (result i32) (param i32) (type $$sig) (i32.const 0)) `),
  `unexpected token`,
);

// ./test/core/func.wast:594
assert_malformed(
  () => instantiate(`(func (result i32) (param i32) (i32.const 0)) `),
  `unexpected token`,
);

// ./test/core/func.wast:601
assert_malformed(
  () => instantiate(`(type $$sig (func)) (func (type $$sig) (result i32) (i32.const 0)) `),
  `inline function type`,
);

// ./test/core/func.wast:608
assert_malformed(
  () => instantiate(`(type $$sig (func (param i32) (result i32))) (func (type $$sig) (result i32) (i32.const 0)) `),
  `inline function type`,
);

// ./test/core/func.wast:615
assert_malformed(
  () => instantiate(`(type $$sig (func (param i32) (result i32))) (func (type $$sig) (param i32) (i32.const 0)) `),
  `inline function type`,
);

// ./test/core/func.wast:622
assert_malformed(
  () => instantiate(`(type $$sig (func (param i32 i32) (result i32))) (func (type $$sig) (param i32) (result i32) (unreachable)) `),
  `inline function type`,
);

// ./test/core/func.wast:633
assert_invalid(
  () => instantiate(`(module (func $$type-local-num-vs-num (result i64) (local i32) (local.get 0)))`),
  `type mismatch`,
);

// ./test/core/func.wast:637
assert_invalid(
  () => instantiate(`(module (func $$type-local-num-vs-num (local f32) (i32.eqz (local.get 0))))`),
  `type mismatch`,
);

// ./test/core/func.wast:641
assert_invalid(
  () => instantiate(`(module (func $$type-local-num-vs-num (local f64 i64) (f64.neg (local.get 1))))`),
  `type mismatch`,
);

// ./test/core/func.wast:649
assert_invalid(
  () => instantiate(`(module (func $$type-param-num-vs-num (param i32) (result i64) (local.get 0)))`),
  `type mismatch`,
);

// ./test/core/func.wast:653
assert_invalid(
  () => instantiate(`(module (func $$type-param-num-vs-num (param f32) (i32.eqz (local.get 0))))`),
  `type mismatch`,
);

// ./test/core/func.wast:657
assert_invalid(
  () => instantiate(`(module (func $$type-param-num-vs-num (param f64 i64) (f64.neg (local.get 1))))`),
  `type mismatch`,
);

// ./test/core/func.wast:665
assert_invalid(
  () => instantiate(`(module (func $$type-empty-i32 (result i32)))`),
  `type mismatch`,
);

// ./test/core/func.wast:669
assert_invalid(
  () => instantiate(`(module (func $$type-empty-i64 (result i64)))`),
  `type mismatch`,
);

// ./test/core/func.wast:673
assert_invalid(
  () => instantiate(`(module (func $$type-empty-f32 (result f32)))`),
  `type mismatch`,
);

// ./test/core/func.wast:677
assert_invalid(
  () => instantiate(`(module (func $$type-empty-f64 (result f64)))`),
  `type mismatch`,
);

// ./test/core/func.wast:681
assert_invalid(
  () => instantiate(`(module (func $$type-empty-f64-i32 (result f64 i32)))`),
  `type mismatch`,
);

// ./test/core/func.wast:686
assert_invalid(
  () => instantiate(`(module (func $$type-value-void-vs-num (result i32)
    (nop)
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:692
assert_invalid(
  () => instantiate(`(module (func $$type-value-void-vs-nums (result i32 i32)
    (nop)
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:698
assert_invalid(
  () => instantiate(`(module (func $$type-value-num-vs-void
    (i32.const 0)
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:704
assert_invalid(
  () => instantiate(`(module (func $$type-value-nums-vs-void
    (i32.const 0) (i64.const 0)
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:710
assert_invalid(
  () => instantiate(`(module (func $$type-value-num-vs-num (result i32)
    (f32.const 0)
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:716
assert_invalid(
  () => instantiate(`(module (func $$type-value-num-vs-nums (result f32 f32)
    (f32.const 0)
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:722
assert_invalid(
  () => instantiate(`(module (func $$type-value-nums-vs-num (result f32)
    (f32.const 0) (f32.const 0)
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:729
assert_invalid(
  () => instantiate(`(module (func $$type-return-last-empty-vs-num (result i32)
    (return)
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:735
assert_invalid(
  () => instantiate(`(module (func $$type-return-last-empty-vs-nums (result i32 i32)
    (return)
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:741
assert_invalid(
  () => instantiate(`(module (func $$type-return-last-void-vs-num (result i32)
    (return (nop))
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:747
assert_invalid(
  () => instantiate(`(module (func $$type-return-last-void-vs-nums (result i32 i64)
    (return (nop))
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:753
assert_invalid(
  () => instantiate(`(module (func $$type-return-last-num-vs-num (result i32)
    (return (i64.const 0))
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:759
assert_invalid(
  () => instantiate(`(module (func $$type-return-last-num-vs-nums (result i64 i64)
    (return (i64.const 0))
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:766
assert_invalid(
  () => instantiate(`(module (func $$type-return-empty-vs-num (result i32)
    (return) (i32.const 1)
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:772
assert_invalid(
  () => instantiate(`(module (func $$type-return-empty-vs-nums (result i32 i32)
    (return) (i32.const 1) (i32.const 2)
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:778
assert_invalid(
  () => instantiate(`(module (func $$type-return-partial-vs-nums (result i32 i32)
    (i32.const 1) (return) (i32.const 2)
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:784
assert_invalid(
  () => instantiate(`(module (func $$type-return-void-vs-num (result i32)
    (return (nop)) (i32.const 1)
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:790
assert_invalid(
  () => instantiate(`(module (func $$type-return-void-vs-nums (result i32 i32)
    (return (nop)) (i32.const 1)
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:796
assert_invalid(
  () => instantiate(`(module (func $$type-return-num-vs-num (result i32)
    (return (i64.const 1)) (i32.const 1)
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:802
assert_invalid(
  () => instantiate(`(module (func $$type-return-num-vs-nums (result i32 i32)
    (return (i64.const 1)) (i32.const 1) (i32.const 2)
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:808
assert_invalid(
  () => instantiate(`(module (func $$type-return-first-num-vs-num (result i32)
    (return (i64.const 1)) (return (i32.const 1))
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:814
assert_invalid(
  () => instantiate(`(module (func $$type-return-first-num-vs-nums (result i32 i32)
    (return (i32.const 1)) (return (i32.const 1) (i32.const 2))
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:821
assert_invalid(
  () => instantiate(`(module (func $$type-break-last-void-vs-num (result i32)
    (br 0)
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:827
assert_invalid(
  () => instantiate(`(module (func $$type-break-last-void-vs-nums (result i32 i32)
    (br 0)
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:833
assert_invalid(
  () => instantiate(`(module (func $$type-break-last-num-vs-num (result i32)
    (br 0 (f32.const 0))
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:839
assert_invalid(
  () => instantiate(`(module (func $$type-break-last-num-vs-nums (result i32 i32)
    (br 0 (i32.const 0))
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:845
assert_invalid(
  () => instantiate(`(module (func $$type-break-void-vs-num (result i32)
    (br 0) (i32.const 1)
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:851
assert_invalid(
  () => instantiate(`(module (func $$type-break-void-vs-nums (result i32 i32)
    (br 0) (i32.const 1) (i32.const 2)
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:857
assert_invalid(
  () => instantiate(`(module (func $$type-break-num-vs-num (result i32)
    (br 0 (i64.const 1)) (i32.const 1)
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:863
assert_invalid(
  () => instantiate(`(module (func $$type-break-num-vs-nums (result i32 i32)
    (br 0 (i32.const 1)) (i32.const 1) (i32.const 2)
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:869
assert_invalid(
  () => instantiate(`(module (func $$type-break-first-num-vs-num (result i32)
    (br 0 (i64.const 1)) (br 0 (i32.const 1))
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:876
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-empty-vs-num (result i32)
    (block (br 1)) (br 0 (i32.const 1))
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:882
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-empty-vs-nums (result i32 i32)
    (block (br 1)) (br 0 (i32.const 1) (i32.const 2))
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:888
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-void-vs-num (result i32)
    (block (br 1 (nop))) (br 0 (i32.const 1))
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:894
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-void-vs-nums (result i32 i32)
    (block (br 1 (nop))) (br 0 (i32.const 1) (i32.const 2))
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:900
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-num-vs-num (result i32)
    (block (br 1 (i64.const 1))) (br 0 (i32.const 1))
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:906
assert_invalid(
  () => instantiate(`(module (func $$type-break-nested-num-vs-nums (result i32 i32)
    (block (result i32) (br 1 (i32.const 1))) (br 0 (i32.const 1) (i32.const 2))
  ))`),
  `type mismatch`,
);

// ./test/core/func.wast:916
assert_malformed(() => instantiate(`(func (nop) (local i32)) `), `unexpected token`);

// ./test/core/func.wast:920
assert_malformed(() => instantiate(`(func (nop) (param i32)) `), `unexpected token`);

// ./test/core/func.wast:924
assert_malformed(() => instantiate(`(func (nop) (result i32)) `), `unexpected token`);

// ./test/core/func.wast:928
assert_malformed(() => instantiate(`(func (local i32) (param i32)) `), `unexpected token`);

// ./test/core/func.wast:932
assert_malformed(
  () => instantiate(`(func (local i32) (result i32) (local.get 0)) `),
  `unexpected token`,
);

// ./test/core/func.wast:936
assert_malformed(
  () => instantiate(`(func (result i32) (param i32) (local.get 0)) `),
  `unexpected token`,
);

// ./test/core/func.wast:943
assert_malformed(() => instantiate(`(func $$foo) (func $$foo) `), `duplicate func`);

// ./test/core/func.wast:947
assert_malformed(
  () => instantiate(`(import "" "" (func $$foo)) (func $$foo) `),
  `duplicate func`,
);

// ./test/core/func.wast:951
assert_malformed(
  () => instantiate(`(import "" "" (func $$foo)) (import "" "" (func $$foo)) `),
  `duplicate func`,
);

// ./test/core/func.wast:956
assert_malformed(
  () => instantiate(`(func (param $$foo i32) (param $$foo i32)) `),
  `duplicate local`,
);

// ./test/core/func.wast:958
assert_malformed(
  () => instantiate(`(func (param $$foo i32) (local $$foo i32)) `),
  `duplicate local`,
);

// ./test/core/func.wast:960
assert_malformed(
  () => instantiate(`(func (local $$foo i32) (local $$foo i32)) `),
  `duplicate local`,
);
