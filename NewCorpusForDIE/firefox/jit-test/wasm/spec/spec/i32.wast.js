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

// ./test/core/i32.wast

// ./test/core/i32.wast:3
let $0 = instantiate(`(module
  (func (export "add") (param $$x i32) (param $$y i32) (result i32) (i32.add (local.get $$x) (local.get $$y)))
  (func (export "sub") (param $$x i32) (param $$y i32) (result i32) (i32.sub (local.get $$x) (local.get $$y)))
  (func (export "mul") (param $$x i32) (param $$y i32) (result i32) (i32.mul (local.get $$x) (local.get $$y)))
  (func (export "div_s") (param $$x i32) (param $$y i32) (result i32) (i32.div_s (local.get $$x) (local.get $$y)))
  (func (export "div_u") (param $$x i32) (param $$y i32) (result i32) (i32.div_u (local.get $$x) (local.get $$y)))
  (func (export "rem_s") (param $$x i32) (param $$y i32) (result i32) (i32.rem_s (local.get $$x) (local.get $$y)))
  (func (export "rem_u") (param $$x i32) (param $$y i32) (result i32) (i32.rem_u (local.get $$x) (local.get $$y)))
  (func (export "and") (param $$x i32) (param $$y i32) (result i32) (i32.and (local.get $$x) (local.get $$y)))
  (func (export "or") (param $$x i32) (param $$y i32) (result i32) (i32.or (local.get $$x) (local.get $$y)))
  (func (export "xor") (param $$x i32) (param $$y i32) (result i32) (i32.xor (local.get $$x) (local.get $$y)))
  (func (export "shl") (param $$x i32) (param $$y i32) (result i32) (i32.shl (local.get $$x) (local.get $$y)))
  (func (export "shr_s") (param $$x i32) (param $$y i32) (result i32) (i32.shr_s (local.get $$x) (local.get $$y)))
  (func (export "shr_u") (param $$x i32) (param $$y i32) (result i32) (i32.shr_u (local.get $$x) (local.get $$y)))
  (func (export "rotl") (param $$x i32) (param $$y i32) (result i32) (i32.rotl (local.get $$x) (local.get $$y)))
  (func (export "rotr") (param $$x i32) (param $$y i32) (result i32) (i32.rotr (local.get $$x) (local.get $$y)))
  (func (export "clz") (param $$x i32) (result i32) (i32.clz (local.get $$x)))
  (func (export "ctz") (param $$x i32) (result i32) (i32.ctz (local.get $$x)))
  (func (export "popcnt") (param $$x i32) (result i32) (i32.popcnt (local.get $$x)))
  (func (export "extend8_s") (param $$x i32) (result i32) (i32.extend8_s (local.get $$x)))
  (func (export "extend16_s") (param $$x i32) (result i32) (i32.extend16_s (local.get $$x)))
  (func (export "eqz") (param $$x i32) (result i32) (i32.eqz (local.get $$x)))
  (func (export "eq") (param $$x i32) (param $$y i32) (result i32) (i32.eq (local.get $$x) (local.get $$y)))
  (func (export "ne") (param $$x i32) (param $$y i32) (result i32) (i32.ne (local.get $$x) (local.get $$y)))
  (func (export "lt_s") (param $$x i32) (param $$y i32) (result i32) (i32.lt_s (local.get $$x) (local.get $$y)))
  (func (export "lt_u") (param $$x i32) (param $$y i32) (result i32) (i32.lt_u (local.get $$x) (local.get $$y)))
  (func (export "le_s") (param $$x i32) (param $$y i32) (result i32) (i32.le_s (local.get $$x) (local.get $$y)))
  (func (export "le_u") (param $$x i32) (param $$y i32) (result i32) (i32.le_u (local.get $$x) (local.get $$y)))
  (func (export "gt_s") (param $$x i32) (param $$y i32) (result i32) (i32.gt_s (local.get $$x) (local.get $$y)))
  (func (export "gt_u") (param $$x i32) (param $$y i32) (result i32) (i32.gt_u (local.get $$x) (local.get $$y)))
  (func (export "ge_s") (param $$x i32) (param $$y i32) (result i32) (i32.ge_s (local.get $$x) (local.get $$y)))
  (func (export "ge_u") (param $$x i32) (param $$y i32) (result i32) (i32.ge_u (local.get $$x) (local.get $$y)))
)`);

// ./test/core/i32.wast:37
assert_return(() => invoke($0, `add`, [1, 1]), [value("i32", 2)]);

// ./test/core/i32.wast:38
assert_return(() => invoke($0, `add`, [1, 0]), [value("i32", 1)]);

// ./test/core/i32.wast:39
assert_return(() => invoke($0, `add`, [-1, -1]), [value("i32", -2)]);

// ./test/core/i32.wast:40
assert_return(() => invoke($0, `add`, [-1, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:41
assert_return(() => invoke($0, `add`, [2147483647, 1]), [value("i32", -2147483648)]);

// ./test/core/i32.wast:42
assert_return(() => invoke($0, `add`, [-2147483648, -1]), [value("i32", 2147483647)]);

// ./test/core/i32.wast:43
assert_return(() => invoke($0, `add`, [-2147483648, -2147483648]), [value("i32", 0)]);

// ./test/core/i32.wast:44
assert_return(() => invoke($0, `add`, [1073741823, 1]), [value("i32", 1073741824)]);

// ./test/core/i32.wast:46
assert_return(() => invoke($0, `sub`, [1, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:47
assert_return(() => invoke($0, `sub`, [1, 0]), [value("i32", 1)]);

// ./test/core/i32.wast:48
assert_return(() => invoke($0, `sub`, [-1, -1]), [value("i32", 0)]);

// ./test/core/i32.wast:49
assert_return(() => invoke($0, `sub`, [2147483647, -1]), [value("i32", -2147483648)]);

// ./test/core/i32.wast:50
assert_return(() => invoke($0, `sub`, [-2147483648, 1]), [value("i32", 2147483647)]);

// ./test/core/i32.wast:51
assert_return(() => invoke($0, `sub`, [-2147483648, -2147483648]), [value("i32", 0)]);

// ./test/core/i32.wast:52
assert_return(() => invoke($0, `sub`, [1073741823, -1]), [value("i32", 1073741824)]);

// ./test/core/i32.wast:54
assert_return(() => invoke($0, `mul`, [1, 1]), [value("i32", 1)]);

// ./test/core/i32.wast:55
assert_return(() => invoke($0, `mul`, [1, 0]), [value("i32", 0)]);

// ./test/core/i32.wast:56
assert_return(() => invoke($0, `mul`, [-1, -1]), [value("i32", 1)]);

// ./test/core/i32.wast:57
assert_return(() => invoke($0, `mul`, [268435456, 4096]), [value("i32", 0)]);

// ./test/core/i32.wast:58
assert_return(() => invoke($0, `mul`, [-2147483648, 0]), [value("i32", 0)]);

// ./test/core/i32.wast:59
assert_return(() => invoke($0, `mul`, [-2147483648, -1]), [value("i32", -2147483648)]);

// ./test/core/i32.wast:60
assert_return(() => invoke($0, `mul`, [2147483647, -1]), [value("i32", -2147483647)]);

// ./test/core/i32.wast:61
assert_return(() => invoke($0, `mul`, [19088743, 1985229328]), [value("i32", 898528368)]);

// ./test/core/i32.wast:62
assert_return(() => invoke($0, `mul`, [2147483647, 2147483647]), [value("i32", 1)]);

// ./test/core/i32.wast:64
assert_trap(() => invoke($0, `div_s`, [1, 0]), `integer divide by zero`);

// ./test/core/i32.wast:65
assert_trap(() => invoke($0, `div_s`, [0, 0]), `integer divide by zero`);

// ./test/core/i32.wast:66
assert_trap(() => invoke($0, `div_s`, [-2147483648, -1]), `integer overflow`);

// ./test/core/i32.wast:67
assert_trap(() => invoke($0, `div_s`, [-2147483648, 0]), `integer divide by zero`);

// ./test/core/i32.wast:68
assert_return(() => invoke($0, `div_s`, [1, 1]), [value("i32", 1)]);

// ./test/core/i32.wast:69
assert_return(() => invoke($0, `div_s`, [0, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:70
assert_return(() => invoke($0, `div_s`, [0, -1]), [value("i32", 0)]);

// ./test/core/i32.wast:71
assert_return(() => invoke($0, `div_s`, [-1, -1]), [value("i32", 1)]);

// ./test/core/i32.wast:72
assert_return(() => invoke($0, `div_s`, [-2147483648, 2]), [value("i32", -1073741824)]);

// ./test/core/i32.wast:73
assert_return(() => invoke($0, `div_s`, [-2147483647, 1000]), [value("i32", -2147483)]);

// ./test/core/i32.wast:74
assert_return(() => invoke($0, `div_s`, [5, 2]), [value("i32", 2)]);

// ./test/core/i32.wast:75
assert_return(() => invoke($0, `div_s`, [-5, 2]), [value("i32", -2)]);

// ./test/core/i32.wast:76
assert_return(() => invoke($0, `div_s`, [5, -2]), [value("i32", -2)]);

// ./test/core/i32.wast:77
assert_return(() => invoke($0, `div_s`, [-5, -2]), [value("i32", 2)]);

// ./test/core/i32.wast:78
assert_return(() => invoke($0, `div_s`, [7, 3]), [value("i32", 2)]);

// ./test/core/i32.wast:79
assert_return(() => invoke($0, `div_s`, [-7, 3]), [value("i32", -2)]);

// ./test/core/i32.wast:80
assert_return(() => invoke($0, `div_s`, [7, -3]), [value("i32", -2)]);

// ./test/core/i32.wast:81
assert_return(() => invoke($0, `div_s`, [-7, -3]), [value("i32", 2)]);

// ./test/core/i32.wast:82
assert_return(() => invoke($0, `div_s`, [11, 5]), [value("i32", 2)]);

// ./test/core/i32.wast:83
assert_return(() => invoke($0, `div_s`, [17, 7]), [value("i32", 2)]);

// ./test/core/i32.wast:85
assert_trap(() => invoke($0, `div_u`, [1, 0]), `integer divide by zero`);

// ./test/core/i32.wast:86
assert_trap(() => invoke($0, `div_u`, [0, 0]), `integer divide by zero`);

// ./test/core/i32.wast:87
assert_return(() => invoke($0, `div_u`, [1, 1]), [value("i32", 1)]);

// ./test/core/i32.wast:88
assert_return(() => invoke($0, `div_u`, [0, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:89
assert_return(() => invoke($0, `div_u`, [-1, -1]), [value("i32", 1)]);

// ./test/core/i32.wast:90
assert_return(() => invoke($0, `div_u`, [-2147483648, -1]), [value("i32", 0)]);

// ./test/core/i32.wast:91
assert_return(() => invoke($0, `div_u`, [-2147483648, 2]), [value("i32", 1073741824)]);

// ./test/core/i32.wast:92
assert_return(() => invoke($0, `div_u`, [-1880092688, 65537]), [value("i32", 36847)]);

// ./test/core/i32.wast:93
assert_return(() => invoke($0, `div_u`, [-2147483647, 1000]), [value("i32", 2147483)]);

// ./test/core/i32.wast:94
assert_return(() => invoke($0, `div_u`, [5, 2]), [value("i32", 2)]);

// ./test/core/i32.wast:95
assert_return(() => invoke($0, `div_u`, [-5, 2]), [value("i32", 2147483645)]);

// ./test/core/i32.wast:96
assert_return(() => invoke($0, `div_u`, [5, -2]), [value("i32", 0)]);

// ./test/core/i32.wast:97
assert_return(() => invoke($0, `div_u`, [-5, -2]), [value("i32", 0)]);

// ./test/core/i32.wast:98
assert_return(() => invoke($0, `div_u`, [7, 3]), [value("i32", 2)]);

// ./test/core/i32.wast:99
assert_return(() => invoke($0, `div_u`, [11, 5]), [value("i32", 2)]);

// ./test/core/i32.wast:100
assert_return(() => invoke($0, `div_u`, [17, 7]), [value("i32", 2)]);

// ./test/core/i32.wast:102
assert_trap(() => invoke($0, `rem_s`, [1, 0]), `integer divide by zero`);

// ./test/core/i32.wast:103
assert_trap(() => invoke($0, `rem_s`, [0, 0]), `integer divide by zero`);

// ./test/core/i32.wast:104
assert_return(() => invoke($0, `rem_s`, [2147483647, -1]), [value("i32", 0)]);

// ./test/core/i32.wast:105
assert_return(() => invoke($0, `rem_s`, [1, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:106
assert_return(() => invoke($0, `rem_s`, [0, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:107
assert_return(() => invoke($0, `rem_s`, [0, -1]), [value("i32", 0)]);

// ./test/core/i32.wast:108
assert_return(() => invoke($0, `rem_s`, [-1, -1]), [value("i32", 0)]);

// ./test/core/i32.wast:109
assert_return(() => invoke($0, `rem_s`, [-2147483648, -1]), [value("i32", 0)]);

// ./test/core/i32.wast:110
assert_return(() => invoke($0, `rem_s`, [-2147483648, 2]), [value("i32", 0)]);

// ./test/core/i32.wast:111
assert_return(() => invoke($0, `rem_s`, [-2147483647, 1000]), [value("i32", -647)]);

// ./test/core/i32.wast:112
assert_return(() => invoke($0, `rem_s`, [5, 2]), [value("i32", 1)]);

// ./test/core/i32.wast:113
assert_return(() => invoke($0, `rem_s`, [-5, 2]), [value("i32", -1)]);

// ./test/core/i32.wast:114
assert_return(() => invoke($0, `rem_s`, [5, -2]), [value("i32", 1)]);

// ./test/core/i32.wast:115
assert_return(() => invoke($0, `rem_s`, [-5, -2]), [value("i32", -1)]);

// ./test/core/i32.wast:116
assert_return(() => invoke($0, `rem_s`, [7, 3]), [value("i32", 1)]);

// ./test/core/i32.wast:117
assert_return(() => invoke($0, `rem_s`, [-7, 3]), [value("i32", -1)]);

// ./test/core/i32.wast:118
assert_return(() => invoke($0, `rem_s`, [7, -3]), [value("i32", 1)]);

// ./test/core/i32.wast:119
assert_return(() => invoke($0, `rem_s`, [-7, -3]), [value("i32", -1)]);

// ./test/core/i32.wast:120
assert_return(() => invoke($0, `rem_s`, [11, 5]), [value("i32", 1)]);

// ./test/core/i32.wast:121
assert_return(() => invoke($0, `rem_s`, [17, 7]), [value("i32", 3)]);

// ./test/core/i32.wast:123
assert_trap(() => invoke($0, `rem_u`, [1, 0]), `integer divide by zero`);

// ./test/core/i32.wast:124
assert_trap(() => invoke($0, `rem_u`, [0, 0]), `integer divide by zero`);

// ./test/core/i32.wast:125
assert_return(() => invoke($0, `rem_u`, [1, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:126
assert_return(() => invoke($0, `rem_u`, [0, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:127
assert_return(() => invoke($0, `rem_u`, [-1, -1]), [value("i32", 0)]);

// ./test/core/i32.wast:128
assert_return(() => invoke($0, `rem_u`, [-2147483648, -1]), [value("i32", -2147483648)]);

// ./test/core/i32.wast:129
assert_return(() => invoke($0, `rem_u`, [-2147483648, 2]), [value("i32", 0)]);

// ./test/core/i32.wast:130
assert_return(() => invoke($0, `rem_u`, [-1880092688, 65537]), [value("i32", 32769)]);

// ./test/core/i32.wast:131
assert_return(() => invoke($0, `rem_u`, [-2147483647, 1000]), [value("i32", 649)]);

// ./test/core/i32.wast:132
assert_return(() => invoke($0, `rem_u`, [5, 2]), [value("i32", 1)]);

// ./test/core/i32.wast:133
assert_return(() => invoke($0, `rem_u`, [-5, 2]), [value("i32", 1)]);

// ./test/core/i32.wast:134
assert_return(() => invoke($0, `rem_u`, [5, -2]), [value("i32", 5)]);

// ./test/core/i32.wast:135
assert_return(() => invoke($0, `rem_u`, [-5, -2]), [value("i32", -5)]);

// ./test/core/i32.wast:136
assert_return(() => invoke($0, `rem_u`, [7, 3]), [value("i32", 1)]);

// ./test/core/i32.wast:137
assert_return(() => invoke($0, `rem_u`, [11, 5]), [value("i32", 1)]);

// ./test/core/i32.wast:138
assert_return(() => invoke($0, `rem_u`, [17, 7]), [value("i32", 3)]);

// ./test/core/i32.wast:140
assert_return(() => invoke($0, `and`, [1, 0]), [value("i32", 0)]);

// ./test/core/i32.wast:141
assert_return(() => invoke($0, `and`, [0, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:142
assert_return(() => invoke($0, `and`, [1, 1]), [value("i32", 1)]);

// ./test/core/i32.wast:143
assert_return(() => invoke($0, `and`, [0, 0]), [value("i32", 0)]);

// ./test/core/i32.wast:144
assert_return(() => invoke($0, `and`, [2147483647, -2147483648]), [value("i32", 0)]);

// ./test/core/i32.wast:145
assert_return(() => invoke($0, `and`, [2147483647, -1]), [value("i32", 2147483647)]);

// ./test/core/i32.wast:146
assert_return(() => invoke($0, `and`, [-252641281, -3856]), [value("i32", -252645136)]);

// ./test/core/i32.wast:147
assert_return(() => invoke($0, `and`, [-1, -1]), [value("i32", -1)]);

// ./test/core/i32.wast:149
assert_return(() => invoke($0, `or`, [1, 0]), [value("i32", 1)]);

// ./test/core/i32.wast:150
assert_return(() => invoke($0, `or`, [0, 1]), [value("i32", 1)]);

// ./test/core/i32.wast:151
assert_return(() => invoke($0, `or`, [1, 1]), [value("i32", 1)]);

// ./test/core/i32.wast:152
assert_return(() => invoke($0, `or`, [0, 0]), [value("i32", 0)]);

// ./test/core/i32.wast:153
assert_return(() => invoke($0, `or`, [2147483647, -2147483648]), [value("i32", -1)]);

// ./test/core/i32.wast:154
assert_return(() => invoke($0, `or`, [-2147483648, 0]), [value("i32", -2147483648)]);

// ./test/core/i32.wast:155
assert_return(() => invoke($0, `or`, [-252641281, -3856]), [value("i32", -1)]);

// ./test/core/i32.wast:156
assert_return(() => invoke($0, `or`, [-1, -1]), [value("i32", -1)]);

// ./test/core/i32.wast:158
assert_return(() => invoke($0, `xor`, [1, 0]), [value("i32", 1)]);

// ./test/core/i32.wast:159
assert_return(() => invoke($0, `xor`, [0, 1]), [value("i32", 1)]);

// ./test/core/i32.wast:160
assert_return(() => invoke($0, `xor`, [1, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:161
assert_return(() => invoke($0, `xor`, [0, 0]), [value("i32", 0)]);

// ./test/core/i32.wast:162
assert_return(() => invoke($0, `xor`, [2147483647, -2147483648]), [value("i32", -1)]);

// ./test/core/i32.wast:163
assert_return(() => invoke($0, `xor`, [-2147483648, 0]), [value("i32", -2147483648)]);

// ./test/core/i32.wast:164
assert_return(() => invoke($0, `xor`, [-1, -2147483648]), [value("i32", 2147483647)]);

// ./test/core/i32.wast:165
assert_return(() => invoke($0, `xor`, [-1, 2147483647]), [value("i32", -2147483648)]);

// ./test/core/i32.wast:166
assert_return(() => invoke($0, `xor`, [-252641281, -3856]), [value("i32", 252645135)]);

// ./test/core/i32.wast:167
assert_return(() => invoke($0, `xor`, [-1, -1]), [value("i32", 0)]);

// ./test/core/i32.wast:169
assert_return(() => invoke($0, `shl`, [1, 1]), [value("i32", 2)]);

// ./test/core/i32.wast:170
assert_return(() => invoke($0, `shl`, [1, 0]), [value("i32", 1)]);

// ./test/core/i32.wast:171
assert_return(() => invoke($0, `shl`, [2147483647, 1]), [value("i32", -2)]);

// ./test/core/i32.wast:172
assert_return(() => invoke($0, `shl`, [-1, 1]), [value("i32", -2)]);

// ./test/core/i32.wast:173
assert_return(() => invoke($0, `shl`, [-2147483648, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:174
assert_return(() => invoke($0, `shl`, [1073741824, 1]), [value("i32", -2147483648)]);

// ./test/core/i32.wast:175
assert_return(() => invoke($0, `shl`, [1, 31]), [value("i32", -2147483648)]);

// ./test/core/i32.wast:176
assert_return(() => invoke($0, `shl`, [1, 32]), [value("i32", 1)]);

// ./test/core/i32.wast:177
assert_return(() => invoke($0, `shl`, [1, 33]), [value("i32", 2)]);

// ./test/core/i32.wast:178
assert_return(() => invoke($0, `shl`, [1, -1]), [value("i32", -2147483648)]);

// ./test/core/i32.wast:179
assert_return(() => invoke($0, `shl`, [1, 2147483647]), [value("i32", -2147483648)]);

// ./test/core/i32.wast:181
assert_return(() => invoke($0, `shr_s`, [1, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:182
assert_return(() => invoke($0, `shr_s`, [1, 0]), [value("i32", 1)]);

// ./test/core/i32.wast:183
assert_return(() => invoke($0, `shr_s`, [-1, 1]), [value("i32", -1)]);

// ./test/core/i32.wast:184
assert_return(() => invoke($0, `shr_s`, [2147483647, 1]), [value("i32", 1073741823)]);

// ./test/core/i32.wast:185
assert_return(() => invoke($0, `shr_s`, [-2147483648, 1]), [value("i32", -1073741824)]);

// ./test/core/i32.wast:186
assert_return(() => invoke($0, `shr_s`, [1073741824, 1]), [value("i32", 536870912)]);

// ./test/core/i32.wast:187
assert_return(() => invoke($0, `shr_s`, [1, 32]), [value("i32", 1)]);

// ./test/core/i32.wast:188
assert_return(() => invoke($0, `shr_s`, [1, 33]), [value("i32", 0)]);

// ./test/core/i32.wast:189
assert_return(() => invoke($0, `shr_s`, [1, -1]), [value("i32", 0)]);

// ./test/core/i32.wast:190
assert_return(() => invoke($0, `shr_s`, [1, 2147483647]), [value("i32", 0)]);

// ./test/core/i32.wast:191
assert_return(() => invoke($0, `shr_s`, [1, -2147483648]), [value("i32", 1)]);

// ./test/core/i32.wast:192
assert_return(() => invoke($0, `shr_s`, [-2147483648, 31]), [value("i32", -1)]);

// ./test/core/i32.wast:193
assert_return(() => invoke($0, `shr_s`, [-1, 32]), [value("i32", -1)]);

// ./test/core/i32.wast:194
assert_return(() => invoke($0, `shr_s`, [-1, 33]), [value("i32", -1)]);

// ./test/core/i32.wast:195
assert_return(() => invoke($0, `shr_s`, [-1, -1]), [value("i32", -1)]);

// ./test/core/i32.wast:196
assert_return(() => invoke($0, `shr_s`, [-1, 2147483647]), [value("i32", -1)]);

// ./test/core/i32.wast:197
assert_return(() => invoke($0, `shr_s`, [-1, -2147483648]), [value("i32", -1)]);

// ./test/core/i32.wast:199
assert_return(() => invoke($0, `shr_u`, [1, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:200
assert_return(() => invoke($0, `shr_u`, [1, 0]), [value("i32", 1)]);

// ./test/core/i32.wast:201
assert_return(() => invoke($0, `shr_u`, [-1, 1]), [value("i32", 2147483647)]);

// ./test/core/i32.wast:202
assert_return(() => invoke($0, `shr_u`, [2147483647, 1]), [value("i32", 1073741823)]);

// ./test/core/i32.wast:203
assert_return(() => invoke($0, `shr_u`, [-2147483648, 1]), [value("i32", 1073741824)]);

// ./test/core/i32.wast:204
assert_return(() => invoke($0, `shr_u`, [1073741824, 1]), [value("i32", 536870912)]);

// ./test/core/i32.wast:205
assert_return(() => invoke($0, `shr_u`, [1, 32]), [value("i32", 1)]);

// ./test/core/i32.wast:206
assert_return(() => invoke($0, `shr_u`, [1, 33]), [value("i32", 0)]);

// ./test/core/i32.wast:207
assert_return(() => invoke($0, `shr_u`, [1, -1]), [value("i32", 0)]);

// ./test/core/i32.wast:208
assert_return(() => invoke($0, `shr_u`, [1, 2147483647]), [value("i32", 0)]);

// ./test/core/i32.wast:209
assert_return(() => invoke($0, `shr_u`, [1, -2147483648]), [value("i32", 1)]);

// ./test/core/i32.wast:210
assert_return(() => invoke($0, `shr_u`, [-2147483648, 31]), [value("i32", 1)]);

// ./test/core/i32.wast:211
assert_return(() => invoke($0, `shr_u`, [-1, 32]), [value("i32", -1)]);

// ./test/core/i32.wast:212
assert_return(() => invoke($0, `shr_u`, [-1, 33]), [value("i32", 2147483647)]);

// ./test/core/i32.wast:213
assert_return(() => invoke($0, `shr_u`, [-1, -1]), [value("i32", 1)]);

// ./test/core/i32.wast:214
assert_return(() => invoke($0, `shr_u`, [-1, 2147483647]), [value("i32", 1)]);

// ./test/core/i32.wast:215
assert_return(() => invoke($0, `shr_u`, [-1, -2147483648]), [value("i32", -1)]);

// ./test/core/i32.wast:217
assert_return(() => invoke($0, `rotl`, [1, 1]), [value("i32", 2)]);

// ./test/core/i32.wast:218
assert_return(() => invoke($0, `rotl`, [1, 0]), [value("i32", 1)]);

// ./test/core/i32.wast:219
assert_return(() => invoke($0, `rotl`, [-1, 1]), [value("i32", -1)]);

// ./test/core/i32.wast:220
assert_return(() => invoke($0, `rotl`, [1, 32]), [value("i32", 1)]);

// ./test/core/i32.wast:221
assert_return(() => invoke($0, `rotl`, [-1412589450, 1]), [value("i32", 1469788397)]);

// ./test/core/i32.wast:222
assert_return(() => invoke($0, `rotl`, [-33498112, 4]), [value("i32", -535969777)]);

// ./test/core/i32.wast:223
assert_return(() => invoke($0, `rotl`, [-1329474845, 5]), [value("i32", 406477942)]);

// ./test/core/i32.wast:224
assert_return(() => invoke($0, `rotl`, [32768, 37]), [value("i32", 1048576)]);

// ./test/core/i32.wast:225
assert_return(() => invoke($0, `rotl`, [-1329474845, 65285]), [value("i32", 406477942)]);

// ./test/core/i32.wast:226
assert_return(() => invoke($0, `rotl`, [1989852383, -19]), [value("i32", 1469837011)]);

// ./test/core/i32.wast:227
assert_return(() => invoke($0, `rotl`, [1989852383, -2147483635]), [value("i32", 1469837011)]);

// ./test/core/i32.wast:228
assert_return(() => invoke($0, `rotl`, [1, 31]), [value("i32", -2147483648)]);

// ./test/core/i32.wast:229
assert_return(() => invoke($0, `rotl`, [-2147483648, 1]), [value("i32", 1)]);

// ./test/core/i32.wast:231
assert_return(() => invoke($0, `rotr`, [1, 1]), [value("i32", -2147483648)]);

// ./test/core/i32.wast:232
assert_return(() => invoke($0, `rotr`, [1, 0]), [value("i32", 1)]);

// ./test/core/i32.wast:233
assert_return(() => invoke($0, `rotr`, [-1, 1]), [value("i32", -1)]);

// ./test/core/i32.wast:234
assert_return(() => invoke($0, `rotr`, [1, 32]), [value("i32", 1)]);

// ./test/core/i32.wast:235
assert_return(() => invoke($0, `rotr`, [-16724992, 1]), [value("i32", 2139121152)]);

// ./test/core/i32.wast:236
assert_return(() => invoke($0, `rotr`, [524288, 4]), [value("i32", 32768)]);

// ./test/core/i32.wast:237
assert_return(() => invoke($0, `rotr`, [-1329474845, 5]), [value("i32", 495324823)]);

// ./test/core/i32.wast:238
assert_return(() => invoke($0, `rotr`, [32768, 37]), [value("i32", 1024)]);

// ./test/core/i32.wast:239
assert_return(() => invoke($0, `rotr`, [-1329474845, 65285]), [value("i32", 495324823)]);

// ./test/core/i32.wast:240
assert_return(() => invoke($0, `rotr`, [1989852383, -19]), [value("i32", -419711787)]);

// ./test/core/i32.wast:241
assert_return(() => invoke($0, `rotr`, [1989852383, -2147483635]), [value("i32", -419711787)]);

// ./test/core/i32.wast:242
assert_return(() => invoke($0, `rotr`, [1, 31]), [value("i32", 2)]);

// ./test/core/i32.wast:243
assert_return(() => invoke($0, `rotr`, [-2147483648, 31]), [value("i32", 1)]);

// ./test/core/i32.wast:245
assert_return(() => invoke($0, `clz`, [-1]), [value("i32", 0)]);

// ./test/core/i32.wast:246
assert_return(() => invoke($0, `clz`, [0]), [value("i32", 32)]);

// ./test/core/i32.wast:247
assert_return(() => invoke($0, `clz`, [32768]), [value("i32", 16)]);

// ./test/core/i32.wast:248
assert_return(() => invoke($0, `clz`, [255]), [value("i32", 24)]);

// ./test/core/i32.wast:249
assert_return(() => invoke($0, `clz`, [-2147483648]), [value("i32", 0)]);

// ./test/core/i32.wast:250
assert_return(() => invoke($0, `clz`, [1]), [value("i32", 31)]);

// ./test/core/i32.wast:251
assert_return(() => invoke($0, `clz`, [2]), [value("i32", 30)]);

// ./test/core/i32.wast:252
assert_return(() => invoke($0, `clz`, [2147483647]), [value("i32", 1)]);

// ./test/core/i32.wast:254
assert_return(() => invoke($0, `ctz`, [-1]), [value("i32", 0)]);

// ./test/core/i32.wast:255
assert_return(() => invoke($0, `ctz`, [0]), [value("i32", 32)]);

// ./test/core/i32.wast:256
assert_return(() => invoke($0, `ctz`, [32768]), [value("i32", 15)]);

// ./test/core/i32.wast:257
assert_return(() => invoke($0, `ctz`, [65536]), [value("i32", 16)]);

// ./test/core/i32.wast:258
assert_return(() => invoke($0, `ctz`, [-2147483648]), [value("i32", 31)]);

// ./test/core/i32.wast:259
assert_return(() => invoke($0, `ctz`, [2147483647]), [value("i32", 0)]);

// ./test/core/i32.wast:261
assert_return(() => invoke($0, `popcnt`, [-1]), [value("i32", 32)]);

// ./test/core/i32.wast:262
assert_return(() => invoke($0, `popcnt`, [0]), [value("i32", 0)]);

// ./test/core/i32.wast:263
assert_return(() => invoke($0, `popcnt`, [32768]), [value("i32", 1)]);

// ./test/core/i32.wast:264
assert_return(() => invoke($0, `popcnt`, [-2147450880]), [value("i32", 2)]);

// ./test/core/i32.wast:265
assert_return(() => invoke($0, `popcnt`, [2147483647]), [value("i32", 31)]);

// ./test/core/i32.wast:266
assert_return(() => invoke($0, `popcnt`, [-1431655766]), [value("i32", 16)]);

// ./test/core/i32.wast:267
assert_return(() => invoke($0, `popcnt`, [1431655765]), [value("i32", 16)]);

// ./test/core/i32.wast:268
assert_return(() => invoke($0, `popcnt`, [-559038737]), [value("i32", 24)]);

// ./test/core/i32.wast:270
assert_return(() => invoke($0, `extend8_s`, [0]), [value("i32", 0)]);

// ./test/core/i32.wast:271
assert_return(() => invoke($0, `extend8_s`, [127]), [value("i32", 127)]);

// ./test/core/i32.wast:272
assert_return(() => invoke($0, `extend8_s`, [128]), [value("i32", -128)]);

// ./test/core/i32.wast:273
assert_return(() => invoke($0, `extend8_s`, [255]), [value("i32", -1)]);

// ./test/core/i32.wast:274
assert_return(() => invoke($0, `extend8_s`, [19088640]), [value("i32", 0)]);

// ./test/core/i32.wast:275
assert_return(() => invoke($0, `extend8_s`, [-19088768]), [value("i32", -128)]);

// ./test/core/i32.wast:276
assert_return(() => invoke($0, `extend8_s`, [-1]), [value("i32", -1)]);

// ./test/core/i32.wast:278
assert_return(() => invoke($0, `extend16_s`, [0]), [value("i32", 0)]);

// ./test/core/i32.wast:279
assert_return(() => invoke($0, `extend16_s`, [32767]), [value("i32", 32767)]);

// ./test/core/i32.wast:280
assert_return(() => invoke($0, `extend16_s`, [32768]), [value("i32", -32768)]);

// ./test/core/i32.wast:281
assert_return(() => invoke($0, `extend16_s`, [65535]), [value("i32", -1)]);

// ./test/core/i32.wast:282
assert_return(() => invoke($0, `extend16_s`, [19070976]), [value("i32", 0)]);

// ./test/core/i32.wast:283
assert_return(() => invoke($0, `extend16_s`, [-19103744]), [value("i32", -32768)]);

// ./test/core/i32.wast:284
assert_return(() => invoke($0, `extend16_s`, [-1]), [value("i32", -1)]);

// ./test/core/i32.wast:286
assert_return(() => invoke($0, `eqz`, [0]), [value("i32", 1)]);

// ./test/core/i32.wast:287
assert_return(() => invoke($0, `eqz`, [1]), [value("i32", 0)]);

// ./test/core/i32.wast:288
assert_return(() => invoke($0, `eqz`, [-2147483648]), [value("i32", 0)]);

// ./test/core/i32.wast:289
assert_return(() => invoke($0, `eqz`, [2147483647]), [value("i32", 0)]);

// ./test/core/i32.wast:290
assert_return(() => invoke($0, `eqz`, [-1]), [value("i32", 0)]);

// ./test/core/i32.wast:292
assert_return(() => invoke($0, `eq`, [0, 0]), [value("i32", 1)]);

// ./test/core/i32.wast:293
assert_return(() => invoke($0, `eq`, [1, 1]), [value("i32", 1)]);

// ./test/core/i32.wast:294
assert_return(() => invoke($0, `eq`, [-1, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:295
assert_return(() => invoke($0, `eq`, [-2147483648, -2147483648]), [value("i32", 1)]);

// ./test/core/i32.wast:296
assert_return(() => invoke($0, `eq`, [2147483647, 2147483647]), [value("i32", 1)]);

// ./test/core/i32.wast:297
assert_return(() => invoke($0, `eq`, [-1, -1]), [value("i32", 1)]);

// ./test/core/i32.wast:298
assert_return(() => invoke($0, `eq`, [1, 0]), [value("i32", 0)]);

// ./test/core/i32.wast:299
assert_return(() => invoke($0, `eq`, [0, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:300
assert_return(() => invoke($0, `eq`, [-2147483648, 0]), [value("i32", 0)]);

// ./test/core/i32.wast:301
assert_return(() => invoke($0, `eq`, [0, -2147483648]), [value("i32", 0)]);

// ./test/core/i32.wast:302
assert_return(() => invoke($0, `eq`, [-2147483648, -1]), [value("i32", 0)]);

// ./test/core/i32.wast:303
assert_return(() => invoke($0, `eq`, [-1, -2147483648]), [value("i32", 0)]);

// ./test/core/i32.wast:304
assert_return(() => invoke($0, `eq`, [-2147483648, 2147483647]), [value("i32", 0)]);

// ./test/core/i32.wast:305
assert_return(() => invoke($0, `eq`, [2147483647, -2147483648]), [value("i32", 0)]);

// ./test/core/i32.wast:307
assert_return(() => invoke($0, `ne`, [0, 0]), [value("i32", 0)]);

// ./test/core/i32.wast:308
assert_return(() => invoke($0, `ne`, [1, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:309
assert_return(() => invoke($0, `ne`, [-1, 1]), [value("i32", 1)]);

// ./test/core/i32.wast:310
assert_return(() => invoke($0, `ne`, [-2147483648, -2147483648]), [value("i32", 0)]);

// ./test/core/i32.wast:311
assert_return(() => invoke($0, `ne`, [2147483647, 2147483647]), [value("i32", 0)]);

// ./test/core/i32.wast:312
assert_return(() => invoke($0, `ne`, [-1, -1]), [value("i32", 0)]);

// ./test/core/i32.wast:313
assert_return(() => invoke($0, `ne`, [1, 0]), [value("i32", 1)]);

// ./test/core/i32.wast:314
assert_return(() => invoke($0, `ne`, [0, 1]), [value("i32", 1)]);

// ./test/core/i32.wast:315
assert_return(() => invoke($0, `ne`, [-2147483648, 0]), [value("i32", 1)]);

// ./test/core/i32.wast:316
assert_return(() => invoke($0, `ne`, [0, -2147483648]), [value("i32", 1)]);

// ./test/core/i32.wast:317
assert_return(() => invoke($0, `ne`, [-2147483648, -1]), [value("i32", 1)]);

// ./test/core/i32.wast:318
assert_return(() => invoke($0, `ne`, [-1, -2147483648]), [value("i32", 1)]);

// ./test/core/i32.wast:319
assert_return(() => invoke($0, `ne`, [-2147483648, 2147483647]), [value("i32", 1)]);

// ./test/core/i32.wast:320
assert_return(() => invoke($0, `ne`, [2147483647, -2147483648]), [value("i32", 1)]);

// ./test/core/i32.wast:322
assert_return(() => invoke($0, `lt_s`, [0, 0]), [value("i32", 0)]);

// ./test/core/i32.wast:323
assert_return(() => invoke($0, `lt_s`, [1, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:324
assert_return(() => invoke($0, `lt_s`, [-1, 1]), [value("i32", 1)]);

// ./test/core/i32.wast:325
assert_return(() => invoke($0, `lt_s`, [-2147483648, -2147483648]), [value("i32", 0)]);

// ./test/core/i32.wast:326
assert_return(() => invoke($0, `lt_s`, [2147483647, 2147483647]), [value("i32", 0)]);

// ./test/core/i32.wast:327
assert_return(() => invoke($0, `lt_s`, [-1, -1]), [value("i32", 0)]);

// ./test/core/i32.wast:328
assert_return(() => invoke($0, `lt_s`, [1, 0]), [value("i32", 0)]);

// ./test/core/i32.wast:329
assert_return(() => invoke($0, `lt_s`, [0, 1]), [value("i32", 1)]);

// ./test/core/i32.wast:330
assert_return(() => invoke($0, `lt_s`, [-2147483648, 0]), [value("i32", 1)]);

// ./test/core/i32.wast:331
assert_return(() => invoke($0, `lt_s`, [0, -2147483648]), [value("i32", 0)]);

// ./test/core/i32.wast:332
assert_return(() => invoke($0, `lt_s`, [-2147483648, -1]), [value("i32", 1)]);

// ./test/core/i32.wast:333
assert_return(() => invoke($0, `lt_s`, [-1, -2147483648]), [value("i32", 0)]);

// ./test/core/i32.wast:334
assert_return(() => invoke($0, `lt_s`, [-2147483648, 2147483647]), [value("i32", 1)]);

// ./test/core/i32.wast:335
assert_return(() => invoke($0, `lt_s`, [2147483647, -2147483648]), [value("i32", 0)]);

// ./test/core/i32.wast:337
assert_return(() => invoke($0, `lt_u`, [0, 0]), [value("i32", 0)]);

// ./test/core/i32.wast:338
assert_return(() => invoke($0, `lt_u`, [1, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:339
assert_return(() => invoke($0, `lt_u`, [-1, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:340
assert_return(() => invoke($0, `lt_u`, [-2147483648, -2147483648]), [value("i32", 0)]);

// ./test/core/i32.wast:341
assert_return(() => invoke($0, `lt_u`, [2147483647, 2147483647]), [value("i32", 0)]);

// ./test/core/i32.wast:342
assert_return(() => invoke($0, `lt_u`, [-1, -1]), [value("i32", 0)]);

// ./test/core/i32.wast:343
assert_return(() => invoke($0, `lt_u`, [1, 0]), [value("i32", 0)]);

// ./test/core/i32.wast:344
assert_return(() => invoke($0, `lt_u`, [0, 1]), [value("i32", 1)]);

// ./test/core/i32.wast:345
assert_return(() => invoke($0, `lt_u`, [-2147483648, 0]), [value("i32", 0)]);

// ./test/core/i32.wast:346
assert_return(() => invoke($0, `lt_u`, [0, -2147483648]), [value("i32", 1)]);

// ./test/core/i32.wast:347
assert_return(() => invoke($0, `lt_u`, [-2147483648, -1]), [value("i32", 1)]);

// ./test/core/i32.wast:348
assert_return(() => invoke($0, `lt_u`, [-1, -2147483648]), [value("i32", 0)]);

// ./test/core/i32.wast:349
assert_return(() => invoke($0, `lt_u`, [-2147483648, 2147483647]), [value("i32", 0)]);

// ./test/core/i32.wast:350
assert_return(() => invoke($0, `lt_u`, [2147483647, -2147483648]), [value("i32", 1)]);

// ./test/core/i32.wast:352
assert_return(() => invoke($0, `le_s`, [0, 0]), [value("i32", 1)]);

// ./test/core/i32.wast:353
assert_return(() => invoke($0, `le_s`, [1, 1]), [value("i32", 1)]);

// ./test/core/i32.wast:354
assert_return(() => invoke($0, `le_s`, [-1, 1]), [value("i32", 1)]);

// ./test/core/i32.wast:355
assert_return(() => invoke($0, `le_s`, [-2147483648, -2147483648]), [value("i32", 1)]);

// ./test/core/i32.wast:356
assert_return(() => invoke($0, `le_s`, [2147483647, 2147483647]), [value("i32", 1)]);

// ./test/core/i32.wast:357
assert_return(() => invoke($0, `le_s`, [-1, -1]), [value("i32", 1)]);

// ./test/core/i32.wast:358
assert_return(() => invoke($0, `le_s`, [1, 0]), [value("i32", 0)]);

// ./test/core/i32.wast:359
assert_return(() => invoke($0, `le_s`, [0, 1]), [value("i32", 1)]);

// ./test/core/i32.wast:360
assert_return(() => invoke($0, `le_s`, [-2147483648, 0]), [value("i32", 1)]);

// ./test/core/i32.wast:361
assert_return(() => invoke($0, `le_s`, [0, -2147483648]), [value("i32", 0)]);

// ./test/core/i32.wast:362
assert_return(() => invoke($0, `le_s`, [-2147483648, -1]), [value("i32", 1)]);

// ./test/core/i32.wast:363
assert_return(() => invoke($0, `le_s`, [-1, -2147483648]), [value("i32", 0)]);

// ./test/core/i32.wast:364
assert_return(() => invoke($0, `le_s`, [-2147483648, 2147483647]), [value("i32", 1)]);

// ./test/core/i32.wast:365
assert_return(() => invoke($0, `le_s`, [2147483647, -2147483648]), [value("i32", 0)]);

// ./test/core/i32.wast:367
assert_return(() => invoke($0, `le_u`, [0, 0]), [value("i32", 1)]);

// ./test/core/i32.wast:368
assert_return(() => invoke($0, `le_u`, [1, 1]), [value("i32", 1)]);

// ./test/core/i32.wast:369
assert_return(() => invoke($0, `le_u`, [-1, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:370
assert_return(() => invoke($0, `le_u`, [-2147483648, -2147483648]), [value("i32", 1)]);

// ./test/core/i32.wast:371
assert_return(() => invoke($0, `le_u`, [2147483647, 2147483647]), [value("i32", 1)]);

// ./test/core/i32.wast:372
assert_return(() => invoke($0, `le_u`, [-1, -1]), [value("i32", 1)]);

// ./test/core/i32.wast:373
assert_return(() => invoke($0, `le_u`, [1, 0]), [value("i32", 0)]);

// ./test/core/i32.wast:374
assert_return(() => invoke($0, `le_u`, [0, 1]), [value("i32", 1)]);

// ./test/core/i32.wast:375
assert_return(() => invoke($0, `le_u`, [-2147483648, 0]), [value("i32", 0)]);

// ./test/core/i32.wast:376
assert_return(() => invoke($0, `le_u`, [0, -2147483648]), [value("i32", 1)]);

// ./test/core/i32.wast:377
assert_return(() => invoke($0, `le_u`, [-2147483648, -1]), [value("i32", 1)]);

// ./test/core/i32.wast:378
assert_return(() => invoke($0, `le_u`, [-1, -2147483648]), [value("i32", 0)]);

// ./test/core/i32.wast:379
assert_return(() => invoke($0, `le_u`, [-2147483648, 2147483647]), [value("i32", 0)]);

// ./test/core/i32.wast:380
assert_return(() => invoke($0, `le_u`, [2147483647, -2147483648]), [value("i32", 1)]);

// ./test/core/i32.wast:382
assert_return(() => invoke($0, `gt_s`, [0, 0]), [value("i32", 0)]);

// ./test/core/i32.wast:383
assert_return(() => invoke($0, `gt_s`, [1, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:384
assert_return(() => invoke($0, `gt_s`, [-1, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:385
assert_return(() => invoke($0, `gt_s`, [-2147483648, -2147483648]), [value("i32", 0)]);

// ./test/core/i32.wast:386
assert_return(() => invoke($0, `gt_s`, [2147483647, 2147483647]), [value("i32", 0)]);

// ./test/core/i32.wast:387
assert_return(() => invoke($0, `gt_s`, [-1, -1]), [value("i32", 0)]);

// ./test/core/i32.wast:388
assert_return(() => invoke($0, `gt_s`, [1, 0]), [value("i32", 1)]);

// ./test/core/i32.wast:389
assert_return(() => invoke($0, `gt_s`, [0, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:390
assert_return(() => invoke($0, `gt_s`, [-2147483648, 0]), [value("i32", 0)]);

// ./test/core/i32.wast:391
assert_return(() => invoke($0, `gt_s`, [0, -2147483648]), [value("i32", 1)]);

// ./test/core/i32.wast:392
assert_return(() => invoke($0, `gt_s`, [-2147483648, -1]), [value("i32", 0)]);

// ./test/core/i32.wast:393
assert_return(() => invoke($0, `gt_s`, [-1, -2147483648]), [value("i32", 1)]);

// ./test/core/i32.wast:394
assert_return(() => invoke($0, `gt_s`, [-2147483648, 2147483647]), [value("i32", 0)]);

// ./test/core/i32.wast:395
assert_return(() => invoke($0, `gt_s`, [2147483647, -2147483648]), [value("i32", 1)]);

// ./test/core/i32.wast:397
assert_return(() => invoke($0, `gt_u`, [0, 0]), [value("i32", 0)]);

// ./test/core/i32.wast:398
assert_return(() => invoke($0, `gt_u`, [1, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:399
assert_return(() => invoke($0, `gt_u`, [-1, 1]), [value("i32", 1)]);

// ./test/core/i32.wast:400
assert_return(() => invoke($0, `gt_u`, [-2147483648, -2147483648]), [value("i32", 0)]);

// ./test/core/i32.wast:401
assert_return(() => invoke($0, `gt_u`, [2147483647, 2147483647]), [value("i32", 0)]);

// ./test/core/i32.wast:402
assert_return(() => invoke($0, `gt_u`, [-1, -1]), [value("i32", 0)]);

// ./test/core/i32.wast:403
assert_return(() => invoke($0, `gt_u`, [1, 0]), [value("i32", 1)]);

// ./test/core/i32.wast:404
assert_return(() => invoke($0, `gt_u`, [0, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:405
assert_return(() => invoke($0, `gt_u`, [-2147483648, 0]), [value("i32", 1)]);

// ./test/core/i32.wast:406
assert_return(() => invoke($0, `gt_u`, [0, -2147483648]), [value("i32", 0)]);

// ./test/core/i32.wast:407
assert_return(() => invoke($0, `gt_u`, [-2147483648, -1]), [value("i32", 0)]);

// ./test/core/i32.wast:408
assert_return(() => invoke($0, `gt_u`, [-1, -2147483648]), [value("i32", 1)]);

// ./test/core/i32.wast:409
assert_return(() => invoke($0, `gt_u`, [-2147483648, 2147483647]), [value("i32", 1)]);

// ./test/core/i32.wast:410
assert_return(() => invoke($0, `gt_u`, [2147483647, -2147483648]), [value("i32", 0)]);

// ./test/core/i32.wast:412
assert_return(() => invoke($0, `ge_s`, [0, 0]), [value("i32", 1)]);

// ./test/core/i32.wast:413
assert_return(() => invoke($0, `ge_s`, [1, 1]), [value("i32", 1)]);

// ./test/core/i32.wast:414
assert_return(() => invoke($0, `ge_s`, [-1, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:415
assert_return(() => invoke($0, `ge_s`, [-2147483648, -2147483648]), [value("i32", 1)]);

// ./test/core/i32.wast:416
assert_return(() => invoke($0, `ge_s`, [2147483647, 2147483647]), [value("i32", 1)]);

// ./test/core/i32.wast:417
assert_return(() => invoke($0, `ge_s`, [-1, -1]), [value("i32", 1)]);

// ./test/core/i32.wast:418
assert_return(() => invoke($0, `ge_s`, [1, 0]), [value("i32", 1)]);

// ./test/core/i32.wast:419
assert_return(() => invoke($0, `ge_s`, [0, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:420
assert_return(() => invoke($0, `ge_s`, [-2147483648, 0]), [value("i32", 0)]);

// ./test/core/i32.wast:421
assert_return(() => invoke($0, `ge_s`, [0, -2147483648]), [value("i32", 1)]);

// ./test/core/i32.wast:422
assert_return(() => invoke($0, `ge_s`, [-2147483648, -1]), [value("i32", 0)]);

// ./test/core/i32.wast:423
assert_return(() => invoke($0, `ge_s`, [-1, -2147483648]), [value("i32", 1)]);

// ./test/core/i32.wast:424
assert_return(() => invoke($0, `ge_s`, [-2147483648, 2147483647]), [value("i32", 0)]);

// ./test/core/i32.wast:425
assert_return(() => invoke($0, `ge_s`, [2147483647, -2147483648]), [value("i32", 1)]);

// ./test/core/i32.wast:427
assert_return(() => invoke($0, `ge_u`, [0, 0]), [value("i32", 1)]);

// ./test/core/i32.wast:428
assert_return(() => invoke($0, `ge_u`, [1, 1]), [value("i32", 1)]);

// ./test/core/i32.wast:429
assert_return(() => invoke($0, `ge_u`, [-1, 1]), [value("i32", 1)]);

// ./test/core/i32.wast:430
assert_return(() => invoke($0, `ge_u`, [-2147483648, -2147483648]), [value("i32", 1)]);

// ./test/core/i32.wast:431
assert_return(() => invoke($0, `ge_u`, [2147483647, 2147483647]), [value("i32", 1)]);

// ./test/core/i32.wast:432
assert_return(() => invoke($0, `ge_u`, [-1, -1]), [value("i32", 1)]);

// ./test/core/i32.wast:433
assert_return(() => invoke($0, `ge_u`, [1, 0]), [value("i32", 1)]);

// ./test/core/i32.wast:434
assert_return(() => invoke($0, `ge_u`, [0, 1]), [value("i32", 0)]);

// ./test/core/i32.wast:435
assert_return(() => invoke($0, `ge_u`, [-2147483648, 0]), [value("i32", 1)]);

// ./test/core/i32.wast:436
assert_return(() => invoke($0, `ge_u`, [0, -2147483648]), [value("i32", 0)]);

// ./test/core/i32.wast:437
assert_return(() => invoke($0, `ge_u`, [-2147483648, -1]), [value("i32", 0)]);

// ./test/core/i32.wast:438
assert_return(() => invoke($0, `ge_u`, [-1, -2147483648]), [value("i32", 1)]);

// ./test/core/i32.wast:439
assert_return(() => invoke($0, `ge_u`, [-2147483648, 2147483647]), [value("i32", 1)]);

// ./test/core/i32.wast:440
assert_return(() => invoke($0, `ge_u`, [2147483647, -2147483648]), [value("i32", 0)]);

// ./test/core/i32.wast:443
assert_invalid(
  () => instantiate(`(module
    (func $$type-unary-operand-empty
      (i32.eqz) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:451
assert_invalid(
  () => instantiate(`(module
    (func $$type-unary-operand-empty-in-block
      (i32.const 0)
      (block (i32.eqz) (drop))
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:460
assert_invalid(
  () => instantiate(`(module
    (func $$type-unary-operand-empty-in-loop
      (i32.const 0)
      (loop (i32.eqz) (drop))
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:469
assert_invalid(
  () => instantiate(`(module
    (func $$type-unary-operand-empty-in-if
      (i32.const 0) (i32.const 0)
      (if (then (i32.eqz) (drop)))
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:478
assert_invalid(
  () => instantiate(`(module
    (func $$type-unary-operand-empty-in-else
      (i32.const 0) (i32.const 0)
      (if (result i32) (then (i32.const 0)) (else (i32.eqz))) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:487
assert_invalid(
  () => instantiate(`(module
    (func $$type-unary-operand-empty-in-br
      (i32.const 0)
      (block (br 0 (i32.eqz)) (drop))
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:496
assert_invalid(
  () => instantiate(`(module
    (func $$type-unary-operand-empty-in-br_if
      (i32.const 0)
      (block (br_if 0 (i32.eqz) (i32.const 1)) (drop))
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:505
assert_invalid(
  () => instantiate(`(module
    (func $$type-unary-operand-empty-in-br_table
      (i32.const 0)
      (block (br_table 0 (i32.eqz)) (drop))
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:514
assert_invalid(
  () => instantiate(`(module
    (func $$type-unary-operand-empty-in-return
      (return (i32.eqz)) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:522
assert_invalid(
  () => instantiate(`(module
    (func $$type-unary-operand-empty-in-select
      (select (i32.eqz) (i32.const 1) (i32.const 2)) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:530
assert_invalid(
  () => instantiate(`(module
    (func $$type-unary-operand-empty-in-call
      (call 1 (i32.eqz)) (drop)
    )
    (func (param i32) (result i32) (local.get 0))
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:539
assert_invalid(
  () => instantiate(`(module
    (func $$f (param i32) (result i32) (local.get 0))
    (type $$sig (func (param i32) (result i32)))
    (table funcref (elem $$f))
    (func $$type-unary-operand-empty-in-call_indirect
      (block (result i32)
        (call_indirect (type $$sig)
          (i32.eqz) (i32.const 0)
        )
        (drop)
      )
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:555
assert_invalid(
  () => instantiate(`(module
    (func $$type-unary-operand-empty-in-local.set
      (local i32)
      (local.set 0 (i32.eqz)) (local.get 0) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:564
assert_invalid(
  () => instantiate(`(module
    (func $$type-unary-operand-empty-in-local.tee
      (local i32)
      (local.tee 0 (i32.eqz)) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:573
assert_invalid(
  () => instantiate(`(module
    (global $$x (mut i32) (i32.const 0))
    (func $$type-unary-operand-empty-in-global.set
      (global.set $$x (i32.eqz)) (global.get $$x) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:582
assert_invalid(
  () => instantiate(`(module
    (memory 0)
    (func $$type-unary-operand-empty-in-memory.grow
      (memory.grow (i32.eqz)) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:591
assert_invalid(
  () => instantiate(`(module
    (memory 0)
    (func $$type-unary-operand-empty-in-load
      (i32.load (i32.eqz)) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:600
assert_invalid(
  () => instantiate(`(module
    (memory 1)
    (func $$type-unary-operand-empty-in-store
      (i32.store (i32.eqz) (i32.const 1))
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:610
assert_invalid(
  () => instantiate(`(module
    (func $$type-binary-1st-operand-empty
      (i32.add) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:618
assert_invalid(
  () => instantiate(`(module
    (func $$type-binary-2nd-operand-empty
      (i32.const 0) (i32.add) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:626
assert_invalid(
  () => instantiate(`(module
    (func $$type-binary-1st-operand-empty-in-block
      (i32.const 0) (i32.const 0)
      (block (i32.add) (drop))
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:635
assert_invalid(
  () => instantiate(`(module
    (func $$type-binary-2nd-operand-empty-in-block
      (i32.const 0)
      (block (i32.const 0) (i32.add) (drop))
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:644
assert_invalid(
  () => instantiate(`(module
    (func $$type-binary-1st-operand-empty-in-loop
      (i32.const 0) (i32.const 0)
      (loop (i32.add) (drop))
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:653
assert_invalid(
  () => instantiate(`(module
    (func $$type-binary-2nd-operand-empty-in-loop
      (i32.const 0)
      (loop (i32.const 0) (i32.add) (drop))
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:662
assert_invalid(
  () => instantiate(`(module
    (func $$type-binary-1st-operand-empty-in-if
      (i32.const 0) (i32.const 0) (i32.const 0)
      (if (i32.add) (then (drop)))
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:671
assert_invalid(
  () => instantiate(`(module
    (func $$type-binary-2nd-operand-empty-in-if
      (i32.const 0) (i32.const 0)
      (if (i32.const 0) (then (i32.add)) (else (drop)))
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:680
assert_invalid(
  () => instantiate(`(module
    (func $$type-binary-1st-operand-empty-in-else
      (i32.const 0) (i32.const 0) (i32.const 0)
      (if (result i32) (then (i32.const 0)) (else (i32.add) (i32.const 0)))
      (drop) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:690
assert_invalid(
  () => instantiate(`(module
    (func $$type-binary-2nd-operand-empty-in-else
      (i32.const 0) (i32.const 0)
      (if (result i32) (then (i32.const 0)) (else (i32.add)))
      (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:700
assert_invalid(
  () => instantiate(`(module
    (func $$type-binary-1st-operand-empty-in-br
      (i32.const 0) (i32.const 0)
      (block (br 0 (i32.add)) (drop))
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:709
assert_invalid(
  () => instantiate(`(module
    (func $$type-binary-2nd-operand-empty-in-br
      (i32.const 0)
      (block (br 0 (i32.const 0) (i32.add)) (drop))
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:718
assert_invalid(
  () => instantiate(`(module
    (func $$type-binary-1st-operand-empty-in-br_if
      (i32.const 0) (i32.const 0)
      (block (br_if 0 (i32.add) (i32.const 1)) (drop))
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:727
assert_invalid(
  () => instantiate(`(module
    (func $$type-binary-2nd-operand-empty-in-br_if
      (i32.const 0)
      (block (br_if 0 (i32.const 0) (i32.add) (i32.const 1)) (drop))
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:736
assert_invalid(
  () => instantiate(`(module
    (func $$type-binary-1st-operand-empty-in-br_table
      (i32.const 0) (i32.const 0)
      (block (br_table 0 (i32.add)) (drop))
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:745
assert_invalid(
  () => instantiate(`(module
    (func $$type-binary-2nd-operand-empty-in-br_table
      (i32.const 0)
      (block (br_table 0 (i32.const 0) (i32.add)) (drop))
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:754
assert_invalid(
  () => instantiate(`(module
    (func $$type-binary-1st-operand-empty-in-return
      (return (i32.add)) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:762
assert_invalid(
  () => instantiate(`(module
    (func $$type-binary-2nd-operand-empty-in-return
      (return (i32.const 0) (i32.add)) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:770
assert_invalid(
  () => instantiate(`(module
    (func $$type-binary-1st-operand-empty-in-select
      (select (i32.add) (i32.const 1) (i32.const 2)) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:778
assert_invalid(
  () => instantiate(`(module
    (func $$type-binary-2nd-operand-empty-in-select
      (select (i32.const 0) (i32.add) (i32.const 1) (i32.const 2)) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:786
assert_invalid(
  () => instantiate(`(module
    (func $$type-binary-1st-operand-empty-in-call
      (call 1 (i32.add)) (drop)
    )
    (func (param i32 i32) (result i32) (local.get 0))
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:795
assert_invalid(
  () => instantiate(`(module
    (func $$type-binary-2nd-operand-empty-in-call
      (call 1 (i32.const 0) (i32.add)) (drop)
    )
    (func (param i32 i32) (result i32) (local.get 0))
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:804
assert_invalid(
  () => instantiate(`(module
    (func $$f (param i32) (result i32) (local.get 0))
    (type $$sig (func (param i32) (result i32)))
    (table funcref (elem $$f))
    (func $$type-binary-1st-operand-empty-in-call_indirect
      (block (result i32)
        (call_indirect (type $$sig)
          (i32.add) (i32.const 0)
        )
        (drop)
      )
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:820
assert_invalid(
  () => instantiate(`(module
    (func $$f (param i32) (result i32) (local.get 0))
    (type $$sig (func (param i32) (result i32)))
    (table funcref (elem $$f))
    (func $$type-binary-2nd-operand-empty-in-call_indirect
      (block (result i32)
        (call_indirect (type $$sig)
          (i32.const 0) (i32.add) (i32.const 0)
        )
        (drop)
      )
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:836
assert_invalid(
  () => instantiate(`(module
    (func $$type-binary-1st-operand-empty-in-local.set
      (local i32)
      (local.set 0 (i32.add)) (local.get 0) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:845
assert_invalid(
  () => instantiate(`(module
    (func $$type-binary-2nd-operand-empty-in-local.set
      (local i32)
      (local.set 0 (i32.const 0) (i32.add)) (local.get 0) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:854
assert_invalid(
  () => instantiate(`(module
    (func $$type-binary-1st-operand-empty-in-local.tee
      (local i32)
      (local.tee 0 (i32.add)) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:863
assert_invalid(
  () => instantiate(`(module
    (func $$type-binary-2nd-operand-empty-in-local.tee
      (local i32)
      (local.tee 0 (i32.const 0) (i32.add)) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:872
assert_invalid(
  () => instantiate(`(module
    (global $$x (mut i32) (i32.const 0))
    (func $$type-binary-1st-operand-empty-in-global.set
      (global.set $$x (i32.add)) (global.get $$x) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:881
assert_invalid(
  () => instantiate(`(module
    (global $$x (mut i32) (i32.const 0))
    (func $$type-binary-2nd-operand-empty-in-global.set
      (global.set $$x (i32.const 0) (i32.add)) (global.get $$x) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:890
assert_invalid(
  () => instantiate(`(module
    (memory 0)
    (func $$type-binary-1st-operand-empty-in-memory.grow
      (memory.grow (i32.add)) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:899
assert_invalid(
  () => instantiate(`(module
    (memory 0)
    (func $$type-binary-2nd-operand-empty-in-memory.grow
      (memory.grow (i32.const 0) (i32.add)) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:908
assert_invalid(
  () => instantiate(`(module
    (memory 0)
    (func $$type-binary-1st-operand-empty-in-load
      (i32.load (i32.add)) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:917
assert_invalid(
  () => instantiate(`(module
    (memory 0)
    (func $$type-binary-2nd-operand-empty-in-load
      (i32.load (i32.const 0) (i32.add)) (drop)
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:926
assert_invalid(
  () => instantiate(`(module
    (memory 1)
    (func $$type-binary-1st-operand-empty-in-store
      (i32.store (i32.add) (i32.const 1))
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:935
assert_invalid(
  () => instantiate(`(module
    (memory 1)
    (func $$type-binary-2nd-operand-empty-in-store
      (i32.store (i32.const 1) (i32.add) (i32.const 0))
    )
  )`),
  `type mismatch`,
);

// ./test/core/i32.wast:948
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.add (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:949
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.and (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:950
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.div_s (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:951
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.div_u (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:952
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.mul (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:953
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.or (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:954
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.rem_s (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:955
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.rem_u (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:956
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.rotl (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:957
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.rotr (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:958
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.shl (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:959
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.shr_s (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:960
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.shr_u (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:961
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.sub (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:962
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.xor (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:963
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.eqz (i64.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:964
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.clz (i64.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:965
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.ctz (i64.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:966
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.popcnt (i64.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:967
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.eq (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:968
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.ge_s (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:969
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.ge_u (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:970
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.gt_s (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:971
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.gt_u (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:972
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.le_s (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:973
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.le_u (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:974
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.lt_s (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:975
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.lt_u (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:976
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32.ne (i64.const 0) (f32.const 0))))`),
  `type mismatch`,
);

// ./test/core/i32.wast:978
assert_malformed(
  () => instantiate(`(func (result i32) (i32.const nan:arithmetic)) `),
  `unexpected token`,
);

// ./test/core/i32.wast:982
assert_malformed(
  () => instantiate(`(func (result i32) (i32.const nan:canonical)) `),
  `unexpected token`,
);
