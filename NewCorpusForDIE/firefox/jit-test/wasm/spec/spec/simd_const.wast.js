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

// ./test/core/simd/simd_const.wast

// ./test/core/simd/simd_const.wast:3
let $0 = instantiate(`(module (func (v128.const i8x16  0xFF  0xFF  0xFF  0xFF  0xFF  0xFF  0xFF  0xFF  0xFF  0xFF  0xFF  0xFF  0xFF  0xFF  0xFF  0xFF) drop))`);

// ./test/core/simd/simd_const.wast:4
let $1 = instantiate(`(module (func (v128.const i8x16 -0x80 -0x80 -0x80 -0x80 -0x80 -0x80 -0x80 -0x80 -0x80 -0x80 -0x80 -0x80 -0x80 -0x80 -0x80 -0x80) drop))`);

// ./test/core/simd/simd_const.wast:5
let $2 = instantiate(`(module (func (v128.const i8x16  255  255  255  255  255  255  255  255  255  255  255  255  255  255  255  255) drop))`);

// ./test/core/simd/simd_const.wast:6
let $3 = instantiate(`(module (func (v128.const i8x16 -128 -128 -128 -128 -128 -128 -128 -128 -128 -128 -128 -128 -128 -128 -128 -128) drop))`);

// ./test/core/simd/simd_const.wast:7
let $4 = instantiate(`(module (func (v128.const i16x8  0xFFFF  0xFFFF  0xFFFF  0xFFFF  0xFFFF  0xFFFF  0xFFFF  0xFFFF) drop))`);

// ./test/core/simd/simd_const.wast:8
let $5 = instantiate(`(module (func (v128.const i16x8 -0x8000 -0x8000 -0x8000 -0x8000 -0x8000 -0x8000 -0x8000 -0x8000) drop))`);

// ./test/core/simd/simd_const.wast:9
let $6 = instantiate(`(module (func (v128.const i16x8  65535  65535  65535  65535  65535  65535  65535  65535) drop))`);

// ./test/core/simd/simd_const.wast:10
let $7 = instantiate(`(module (func (v128.const i16x8 -32768 -32768 -32768 -32768 -32768 -32768 -32768 -32768) drop))`);

// ./test/core/simd/simd_const.wast:11
let $8 = instantiate(`(module (func (v128.const i16x8  65_535  65_535  65_535  65_535  65_535  65_535  65_535  65_535) drop))`);

// ./test/core/simd/simd_const.wast:12
let $9 = instantiate(`(module (func (v128.const i16x8 -32_768 -32_768 -32_768 -32_768 -32_768 -32_768 -32_768 -32_768) drop))`);

// ./test/core/simd/simd_const.wast:13
let $10 = instantiate(`(module (func (v128.const i16x8  0_123_45 0_123_45 0_123_45 0_123_45 0_123_45 0_123_45 0_123_45 0_123_45) drop))`);

// ./test/core/simd/simd_const.wast:14
let $11 = instantiate(`(module (func (v128.const i16x8  0x0_1234 0x0_1234 0x0_1234 0x0_1234 0x0_1234 0x0_1234 0x0_1234 0x0_1234) drop))`);

// ./test/core/simd/simd_const.wast:15
let $12 = instantiate(`(module (func (v128.const i32x4  0xffffffff  0xffffffff  0xffffffff  0xffffffff) drop))`);

// ./test/core/simd/simd_const.wast:16
let $13 = instantiate(`(module (func (v128.const i32x4 -0x80000000 -0x80000000 -0x80000000 -0x80000000) drop))`);

// ./test/core/simd/simd_const.wast:17
let $14 = instantiate(`(module (func (v128.const i32x4  4294967295  4294967295  4294967295  4294967295) drop))`);

// ./test/core/simd/simd_const.wast:18
let $15 = instantiate(`(module (func (v128.const i32x4 -2147483648 -2147483648 -2147483648 -2147483648) drop))`);

// ./test/core/simd/simd_const.wast:19
let $16 = instantiate(`(module (func (v128.const i32x4  0xffff_ffff  0xffff_ffff  0xffff_ffff  0xffff_ffff) drop))`);

// ./test/core/simd/simd_const.wast:20
let $17 = instantiate(`(module (func (v128.const i32x4 -0x8000_0000 -0x8000_0000 -0x8000_0000 -0x8000_0000) drop))`);

// ./test/core/simd/simd_const.wast:21
let $18 = instantiate(`(module (func (v128.const i32x4 4_294_967_295  4_294_967_295  4_294_967_295  4_294_967_295) drop))`);

// ./test/core/simd/simd_const.wast:22
let $19 = instantiate(`(module (func (v128.const i32x4 -2_147_483_648 -2_147_483_648 -2_147_483_648 -2_147_483_648) drop))`);

// ./test/core/simd/simd_const.wast:23
let $20 = instantiate(`(module (func (v128.const i32x4 0_123_456_789 0_123_456_789 0_123_456_789 0_123_456_789) drop))`);

// ./test/core/simd/simd_const.wast:24
let $21 = instantiate(`(module (func (v128.const i32x4 0x0_9acf_fBDF 0x0_9acf_fBDF 0x0_9acf_fBDF 0x0_9acf_fBDF) drop))`);

// ./test/core/simd/simd_const.wast:25
let $22 = instantiate(`(module (func (v128.const i64x2  0xffffffffffffffff  0xffffffffffffffff) drop))`);

// ./test/core/simd/simd_const.wast:26
let $23 = instantiate(`(module (func (v128.const i64x2 -0x8000000000000000 -0x8000000000000000) drop))`);

// ./test/core/simd/simd_const.wast:27
let $24 = instantiate(`(module (func (v128.const i64x2  18446744073709551615 18446744073709551615) drop))`);

// ./test/core/simd/simd_const.wast:28
let $25 = instantiate(`(module (func (v128.const i64x2 -9223372036854775808 -9223372036854775808) drop))`);

// ./test/core/simd/simd_const.wast:29
let $26 = instantiate(`(module (func (v128.const i64x2  0xffff_ffff_ffff_ffff  0xffff_ffff_ffff_ffff) drop))`);

// ./test/core/simd/simd_const.wast:30
let $27 = instantiate(`(module (func (v128.const i64x2 -0x8000_0000_0000_0000 -0x8000_0000_0000_0000) drop))`);

// ./test/core/simd/simd_const.wast:31
let $28 = instantiate(`(module (func (v128.const i64x2  18_446_744_073_709_551_615 18_446_744_073_709_551_615) drop))`);

// ./test/core/simd/simd_const.wast:32
let $29 = instantiate(`(module (func (v128.const i64x2 -9_223_372_036_854_775_808 -9_223_372_036_854_775_808) drop))`);

// ./test/core/simd/simd_const.wast:33
let $30 = instantiate(`(module (func (v128.const i64x2  0_123_456_789 0_123_456_789) drop))`);

// ./test/core/simd/simd_const.wast:34
let $31 = instantiate(`(module (func (v128.const i64x2  0x0125_6789_ADEF_bcef 0x0125_6789_ADEF_bcef) drop))`);

// ./test/core/simd/simd_const.wast:35
let $32 = instantiate(`(module (func (v128.const f32x4  0x1p127  0x1p127  0x1p127  0x1p127) drop))`);

// ./test/core/simd/simd_const.wast:36
let $33 = instantiate(`(module (func (v128.const f32x4 -0x1p127 -0x1p127 -0x1p127 -0x1p127) drop))`);

// ./test/core/simd/simd_const.wast:37
let $34 = instantiate(`(module (func (v128.const f32x4  1e38  1e38  1e38  1e38) drop))`);

// ./test/core/simd/simd_const.wast:38
let $35 = instantiate(`(module (func (v128.const f32x4 -1e38 -1e38 -1e38 -1e38) drop))`);

// ./test/core/simd/simd_const.wast:39
let $36 = instantiate(`(module (func (v128.const f32x4  340282356779733623858607532500980858880 340282356779733623858607532500980858880
                                 340282356779733623858607532500980858880 340282356779733623858607532500980858880) drop))`);

// ./test/core/simd/simd_const.wast:41
let $37 = instantiate(`(module (func (v128.const f32x4 -340282356779733623858607532500980858880 -340282356779733623858607532500980858880
                                -340282356779733623858607532500980858880 -340282356779733623858607532500980858880) drop))`);

// ./test/core/simd/simd_const.wast:43
let $38 = instantiate(`(module (func (v128.const f32x4 nan:0x1 nan:0x1 nan:0x1 nan:0x1) drop))`);

// ./test/core/simd/simd_const.wast:44
let $39 = instantiate(`(module (func (v128.const f32x4 nan:0x7f_ffff nan:0x7f_ffff nan:0x7f_ffff nan:0x7f_ffff) drop))`);

// ./test/core/simd/simd_const.wast:45
let $40 = instantiate(`(module (func (v128.const f32x4 0123456789 0123456789 0123456789 0123456789) drop))`);

// ./test/core/simd/simd_const.wast:46
let $41 = instantiate(`(module (func (v128.const f32x4 0123456789e019 0123456789e019 0123456789e019 0123456789e019) drop))`);

// ./test/core/simd/simd_const.wast:47
let $42 = instantiate(`(module (func (v128.const f32x4 0123456789e+019 0123456789e+019 0123456789e+019 0123456789e+019) drop))`);

// ./test/core/simd/simd_const.wast:48
let $43 = instantiate(`(module (func (v128.const f32x4 0123456789e-019 0123456789e-019 0123456789e-019 0123456789e-019) drop))`);

// ./test/core/simd/simd_const.wast:49
let $44 = instantiate(`(module (func (v128.const f32x4 0123456789. 0123456789. 0123456789. 0123456789.) drop))`);

// ./test/core/simd/simd_const.wast:50
let $45 = instantiate(`(module (func (v128.const f32x4 0123456789.e019 0123456789.e019 0123456789.e019 0123456789.e019) drop))`);

// ./test/core/simd/simd_const.wast:51
let $46 = instantiate(`(module (func (v128.const f32x4 0123456789.e+019 0123456789.e+019 0123456789.e+019 0123456789.e+019) drop))`);

// ./test/core/simd/simd_const.wast:52
let $47 = instantiate(`(module (func (v128.const f32x4 0123456789.e-019 0123456789.e-019 0123456789.e-019 0123456789.e-019) drop))`);

// ./test/core/simd/simd_const.wast:53
let $48 = instantiate(`(module (func (v128.const f32x4 0123456789.0123456789 0123456789.0123456789 0123456789.0123456789 0123456789.0123456789) drop))`);

// ./test/core/simd/simd_const.wast:54
let $49 = instantiate(`(module (func (v128.const f32x4 0123456789.0123456789e019 0123456789.0123456789e019 0123456789.0123456789e019 0123456789.0123456789e019) drop))`);

// ./test/core/simd/simd_const.wast:55
let $50 = instantiate(`(module (func (v128.const f32x4 0123456789.0123456789e+019 0123456789.0123456789e+019 0123456789.0123456789e+019 0123456789.0123456789e+019) drop))`);

// ./test/core/simd/simd_const.wast:56
let $51 = instantiate(`(module (func (v128.const f32x4 0123456789.0123456789e-019 0123456789.0123456789e-019 0123456789.0123456789e-019 0123456789.0123456789e-019) drop))`);

// ./test/core/simd/simd_const.wast:57
let $52 = instantiate(`(module (func (v128.const f32x4 0x0123456789ABCDEF 0x0123456789ABCDEF 0x0123456789ABCDEF 0x0123456789ABCDEF) drop))`);

// ./test/core/simd/simd_const.wast:58
let $53 = instantiate(`(module (func (v128.const f32x4 0x0123456789ABCDEFp019 0x0123456789ABCDEFp019 0x0123456789ABCDEFp019 0x0123456789ABCDEFp019) drop))`);

// ./test/core/simd/simd_const.wast:59
let $54 = instantiate(`(module (func (v128.const f32x4 0x0123456789ABCDEFp+019 0x0123456789ABCDEFp+019 0x0123456789ABCDEFp+019 0x0123456789ABCDEFp+019) drop))`);

// ./test/core/simd/simd_const.wast:60
let $55 = instantiate(`(module (func (v128.const f32x4 0x0123456789ABCDEFp-019 0x0123456789ABCDEFp-019 0x0123456789ABCDEFp-019 0x0123456789ABCDEFp-019) drop))`);

// ./test/core/simd/simd_const.wast:61
let $56 = instantiate(`(module (func (v128.const f32x4 0x0123456789ABCDEF. 0x0123456789ABCDEF. 0x0123456789ABCDEF. 0x0123456789ABCDEF.) drop))`);

// ./test/core/simd/simd_const.wast:62
let $57 = instantiate(`(module (func (v128.const f32x4 0x0123456789ABCDEF.p019 0x0123456789ABCDEF.p019 0x0123456789ABCDEF.p019 0x0123456789ABCDEF.p019) drop))`);

// ./test/core/simd/simd_const.wast:63
let $58 = instantiate(`(module (func (v128.const f32x4 0x0123456789ABCDEF.p+019 0x0123456789ABCDEF.p+019 0x0123456789ABCDEF.p+019 0x0123456789ABCDEF.p+019) drop))`);

// ./test/core/simd/simd_const.wast:64
let $59 = instantiate(`(module (func (v128.const f32x4 0x0123456789ABCDEF.p-019 0x0123456789ABCDEF.p-019 0x0123456789ABCDEF.p-019 0x0123456789ABCDEF.p-019) drop))`);

// ./test/core/simd/simd_const.wast:65
let $60 = instantiate(`(module (func (v128.const f32x4 0x0123456789ABCDEF.019aF 0x0123456789ABCDEF.019aF 0x0123456789ABCDEF.019aF 0x0123456789ABCDEF.019aF) drop))`);

// ./test/core/simd/simd_const.wast:66
let $61 = instantiate(`(module (func (v128.const f32x4 0x0123456789ABCDEF.019aFp019 0x0123456789ABCDEF.019aFp019 0x0123456789ABCDEF.019aFp019 0x0123456789ABCDEF.019aFp019) drop))`);

// ./test/core/simd/simd_const.wast:67
let $62 = instantiate(`(module (func (v128.const f32x4 0x0123456789ABCDEF.019aFp+019 0x0123456789ABCDEF.019aFp+019 0x0123456789ABCDEF.019aFp+019 0x0123456789ABCDEF.019aFp+019) drop))`);

// ./test/core/simd/simd_const.wast:68
let $63 = instantiate(`(module (func (v128.const f32x4 0x0123456789ABCDEF.019aFp-019 0x0123456789ABCDEF.019aFp-019 0x0123456789ABCDEF.019aFp-019 0x0123456789ABCDEF.019aFp-019) drop))`);

// ./test/core/simd/simd_const.wast:69
let $64 = instantiate(`(module (func (v128.const f64x2  0x1p1023  0x1p1023) drop))`);

// ./test/core/simd/simd_const.wast:70
let $65 = instantiate(`(module (func (v128.const f64x2 -0x1p1023 -0x1p1023) drop))`);

// ./test/core/simd/simd_const.wast:71
let $66 = instantiate(`(module (func (v128.const f64x2  1e308  1e308) drop))`);

// ./test/core/simd/simd_const.wast:72
let $67 = instantiate(`(module (func (v128.const f64x2 -1e308 -1e308) drop))`);

// ./test/core/simd/simd_const.wast:73
let $68 = instantiate(`(module (func (v128.const f64x2  179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368
                                 179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368) drop))`);

// ./test/core/simd/simd_const.wast:75
let $69 = instantiate(`(module (func (v128.const f64x2 -179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368
                                -179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368) drop))`);

// ./test/core/simd/simd_const.wast:77
let $70 = instantiate(`(module (func (v128.const f64x2 nan:0x1 nan:0x1) drop))`);

// ./test/core/simd/simd_const.wast:78
let $71 = instantiate(`(module (func (v128.const f64x2 nan:0xf_ffff_ffff_ffff nan:0xf_ffff_ffff_ffff) drop))`);

// ./test/core/simd/simd_const.wast:79
let $72 = instantiate(`(module (func (v128.const f64x2 0123456789 0123456789) drop))`);

// ./test/core/simd/simd_const.wast:80
let $73 = instantiate(`(module (func (v128.const f64x2 0123456789e019 0123456789e019) drop))`);

// ./test/core/simd/simd_const.wast:81
let $74 = instantiate(`(module (func (v128.const f64x2 0123456789e+019 0123456789e+019) drop))`);

// ./test/core/simd/simd_const.wast:82
let $75 = instantiate(`(module (func (v128.const f64x2 0123456789e-019 0123456789e-019) drop))`);

// ./test/core/simd/simd_const.wast:83
let $76 = instantiate(`(module (func (v128.const f64x2 0123456789. 0123456789.) drop))`);

// ./test/core/simd/simd_const.wast:84
let $77 = instantiate(`(module (func (v128.const f64x2 0123456789.e019 0123456789.e019) drop))`);

// ./test/core/simd/simd_const.wast:85
let $78 = instantiate(`(module (func (v128.const f64x2 0123456789.e+019 0123456789.e+019) drop))`);

// ./test/core/simd/simd_const.wast:86
let $79 = instantiate(`(module (func (v128.const f64x2 0123456789.e-019 0123456789.e-019) drop))`);

// ./test/core/simd/simd_const.wast:87
let $80 = instantiate(`(module (func (v128.const f64x2 0123456789.0123456789 0123456789.0123456789) drop))`);

// ./test/core/simd/simd_const.wast:88
let $81 = instantiate(`(module (func (v128.const f64x2 0123456789.0123456789e019 0123456789.0123456789e019) drop))`);

// ./test/core/simd/simd_const.wast:89
let $82 = instantiate(`(module (func (v128.const f64x2 0123456789.0123456789e+019 0123456789.0123456789e+019) drop))`);

// ./test/core/simd/simd_const.wast:90
let $83 = instantiate(`(module (func (v128.const f64x2 0123456789.0123456789e-019 0123456789.0123456789e-019) drop))`);

// ./test/core/simd/simd_const.wast:91
let $84 = instantiate(`(module (func (v128.const f64x2 0x0123456789ABCDEFabcdef 0x0123456789ABCDEFabcdef) drop))`);

// ./test/core/simd/simd_const.wast:92
let $85 = instantiate(`(module (func (v128.const f64x2 0x0123456789ABCDEFabcdefp019 0x0123456789ABCDEFabcdefp019) drop))`);

// ./test/core/simd/simd_const.wast:93
let $86 = instantiate(`(module (func (v128.const f64x2 0x0123456789ABCDEFabcdefp+019 0x0123456789ABCDEFabcdefp+019) drop))`);

// ./test/core/simd/simd_const.wast:94
let $87 = instantiate(`(module (func (v128.const f64x2 0x0123456789ABCDEFabcdefp-019 0x0123456789ABCDEFabcdefp-019) drop))`);

// ./test/core/simd/simd_const.wast:95
let $88 = instantiate(`(module (func (v128.const f64x2 0x0123456789ABCDEFabcdef. 0x0123456789ABCDEFabcdef.) drop))`);

// ./test/core/simd/simd_const.wast:96
let $89 = instantiate(`(module (func (v128.const f64x2 0x0123456789ABCDEFabcdef.p019 0x0123456789ABCDEFabcdef.p019) drop))`);

// ./test/core/simd/simd_const.wast:97
let $90 = instantiate(`(module (func (v128.const f64x2 0x0123456789ABCDEFabcdef.p+019 0x0123456789ABCDEFabcdef.p+019) drop))`);

// ./test/core/simd/simd_const.wast:98
let $91 = instantiate(`(module (func (v128.const f64x2 0x0123456789ABCDEFabcdef.p-019 0x0123456789ABCDEFabcdef.p-019) drop))`);

// ./test/core/simd/simd_const.wast:99
let $92 = instantiate(`(module (func (v128.const f64x2 0x0123456789ABCDEFabcdef.0123456789ABCDEFabcdef 0x0123456789ABCDEFabcdef.0123456789ABCDEFabcdef) drop))`);

// ./test/core/simd/simd_const.wast:100
let $93 = instantiate(`(module (func (v128.const f64x2 0x0123456789ABCDEFabcdef.0123456789ABCDEFabcdefp019 0x0123456789ABCDEFabcdef.0123456789ABCDEFabcdefp019) drop))`);

// ./test/core/simd/simd_const.wast:101
let $94 = instantiate(`(module (func (v128.const f64x2 0x0123456789ABCDEFabcdef.0123456789ABCDEFabcdefp+019 0x0123456789ABCDEFabcdef.0123456789ABCDEFabcdefp+019) drop))`);

// ./test/core/simd/simd_const.wast:102
let $95 = instantiate(`(module (func (v128.const f64x2 0x0123456789ABCDEFabcdef.0123456789ABCDEFabcdefp-019 0x0123456789ABCDEFabcdef.0123456789ABCDEFabcdefp-019) drop))`);

// ./test/core/simd/simd_const.wast:106
let $96 = instantiate(`(module (func (v128.const i8x16  0xFF  0xFF  0xFF  0xFF  0xFF  0xFF  0xFF  0xFF
                                -0x80 -0x80 -0x80 -0x80 -0x80 -0x80 -0x80 -0x80) drop))`);

// ./test/core/simd/simd_const.wast:108
let $97 = instantiate(`(module (func (v128.const i8x16  0xFF  0xFF  0xFF  0xFF   255   255   255   255
                                -0x80 -0x80 -0x80 -0x80 -0x80 -0x80 -0x80 -0x80) drop))`);

// ./test/core/simd/simd_const.wast:110
let $98 = instantiate(`(module (func (v128.const i8x16  0xFF  0xFF  0xFF  0xFF   255   255   255   255
                                -0x80 -0x80 -0x80 -0x80  -128  -128  -128  -128) drop))`);

// ./test/core/simd/simd_const.wast:112
let $99 = instantiate(`(module (func (v128.const i16x8 0xFF 0xFF  0xFF  0xFF -0x8000 -0x8000 -0x8000 -0x8000) drop))`);

// ./test/core/simd/simd_const.wast:113
let $100 = instantiate(`(module (func (v128.const i16x8 0xFF 0xFF 65535 65535 -0x8000 -0x8000 -0x8000 -0x8000) drop))`);

// ./test/core/simd/simd_const.wast:114
let $101 = instantiate(`(module (func (v128.const i16x8 0xFF 0xFF 65535 65535 -0x8000 -0x8000  -32768  -32768) drop))`);

// ./test/core/simd/simd_const.wast:115
let $102 = instantiate(`(module (func (v128.const i32x4 0xffffffff 0xffffffff -0x80000000 -0x80000000) drop))`);

// ./test/core/simd/simd_const.wast:116
let $103 = instantiate(`(module (func (v128.const i32x4 0xffffffff 4294967295 -0x80000000 -0x80000000) drop))`);

// ./test/core/simd/simd_const.wast:117
let $104 = instantiate(`(module (func (v128.const i32x4 0xffffffff 4294967295 -0x80000000 -2147483648) drop))`);

// ./test/core/simd/simd_const.wast:118
let $105 = instantiate(`(module (func (v128.const f32x4 0x1p127 0x1p127 -0x1p127 -1e38) drop))`);

// ./test/core/simd/simd_const.wast:119
let $106 = instantiate(`(module (func (v128.const f32x4 0x1p127 340282356779733623858607532500980858880 -1e38 -340282356779733623858607532500980858880) drop))`);

// ./test/core/simd/simd_const.wast:120
let $107 = instantiate(`(module (func (v128.const f32x4 nan -nan inf -inf) drop))`);

// ./test/core/simd/simd_const.wast:121
let $108 = instantiate(`(module (func (v128.const i64x2 0xffffffffffffffff 0x8000000000000000) drop))`);

// ./test/core/simd/simd_const.wast:122
let $109 = instantiate(`(module (func (v128.const i64x2 0xffffffffffffffff -9223372036854775808) drop))`);

// ./test/core/simd/simd_const.wast:123
let $110 = instantiate(`(module (func (v128.const f64x2 0x1p1023 -1e308) drop))`);

// ./test/core/simd/simd_const.wast:124
let $111 = instantiate(`(module (func (v128.const f64x2 nan -inf) drop))`);

// ./test/core/simd/simd_const.wast:128
let $112 = instantiate(`(module (memory 1))`);

// ./test/core/simd/simd_const.wast:129
assert_malformed(
  () => instantiate(`(func (v128.const i8x16 0x100 0x100 0x100 0x100 0x100 0x100 0x100 0x100 0x100 0x100 0x100 0x100 0x100 0x100 0x100 0x100) drop) `),
  `constant out of range`,
);

// ./test/core/simd/simd_const.wast:133
assert_malformed(
  () => instantiate(`(func (v128.const i8x16 -0x81 -0x81 -0x81 -0x81 -0x81 -0x81 -0x81 -0x81 -0x81 -0x81 -0x81 -0x81 -0x81 -0x81 -0x81 -0x81) drop) `),
  `constant out of range`,
);

// ./test/core/simd/simd_const.wast:137
assert_malformed(
  () => instantiate(`(func (v128.const i8x16 256 256 256 256 256 256 256 256 256 256 256 256 256 256 256 256) drop) `),
  `constant out of range`,
);

// ./test/core/simd/simd_const.wast:141
assert_malformed(
  () => instantiate(`(func (v128.const i8x16 -129 -129 -129 -129 -129 -129 -129 -129 -129 -129 -129 -129 -129 -129 -129 -129) drop) `),
  `constant out of range`,
);

// ./test/core/simd/simd_const.wast:145
assert_malformed(
  () => instantiate(`(func (v128.const i16x8 0x10000 0x10000 0x10000 0x10000 0x10000 0x10000 0x10000 0x10000) drop) `),
  `constant out of range`,
);

// ./test/core/simd/simd_const.wast:149
assert_malformed(
  () => instantiate(`(func (v128.const i16x8 -0x8001 -0x8001 -0x8001 -0x8001 -0x8001 -0x8001 -0x8001 -0x8001) drop) `),
  `constant out of range`,
);

// ./test/core/simd/simd_const.wast:153
assert_malformed(
  () => instantiate(`(func (v128.const i16x8 65536 65536 65536 65536 65536 65536 65536 65536) drop) `),
  `constant out of range`,
);

// ./test/core/simd/simd_const.wast:157
assert_malformed(
  () => instantiate(`(func (v128.const i16x8 -32769 -32769 -32769 -32769 -32769 -32769 -32769 -32769) drop) `),
  `constant out of range`,
);

// ./test/core/simd/simd_const.wast:161
assert_malformed(
  () => instantiate(`(func (v128.const i32x4  0x100000000  0x100000000  0x100000000  0x100000000) drop) `),
  `constant out of range`,
);

// ./test/core/simd/simd_const.wast:165
assert_malformed(
  () => instantiate(`(func (v128.const i32x4 -0x80000001 -0x80000001 -0x80000001 -0x80000001) drop) `),
  `constant out of range`,
);

// ./test/core/simd/simd_const.wast:169
assert_malformed(
  () => instantiate(`(func (v128.const i32x4  4294967296  4294967296  4294967296  4294967296) drop) `),
  `constant out of range`,
);

// ./test/core/simd/simd_const.wast:173
assert_malformed(
  () => instantiate(`(func (v128.const i32x4 -2147483649 -2147483649 -2147483649 -2147483649) drop) `),
  `constant out of range`,
);

// ./test/core/simd/simd_const.wast:177
assert_malformed(
  () => instantiate(`(func (v128.const f32x4  0x1p128  0x1p128  0x1p128  0x1p128) drop) `),
  `constant out of range`,
);

// ./test/core/simd/simd_const.wast:181
assert_malformed(
  () => instantiate(`(func (v128.const f32x4 -0x1p128 -0x1p128 -0x1p128 -0x1p128) drop) `),
  `constant out of range`,
);

// ./test/core/simd/simd_const.wast:185
assert_malformed(
  () => instantiate(`(func (v128.const f32x4  1e39  1e39  1e39  1e39) drop) `),
  `constant out of range`,
);

// ./test/core/simd/simd_const.wast:189
assert_malformed(
  () => instantiate(`(func (v128.const f32x4 -1e39 -1e39 -1e39 -1e39) drop) `),
  `constant out of range`,
);

// ./test/core/simd/simd_const.wast:193
assert_malformed(
  () => instantiate(`(func (v128.const f32x4  340282356779733661637539395458142568448 340282356779733661637539395458142568448                          340282356779733661637539395458142568448 340282356779733661637539395458142568448) drop) `),
  `constant out of range`,
);

// ./test/core/simd/simd_const.wast:198
assert_malformed(
  () => instantiate(`(func (v128.const f32x4 -340282356779733661637539395458142568448 -340282356779733661637539395458142568448                         -340282356779733661637539395458142568448 -340282356779733661637539395458142568448) drop) `),
  `constant out of range`,
);

// ./test/core/simd/simd_const.wast:204
assert_malformed(
  () => instantiate(`(func (v128.const f32x4 nan:0x80_0000 nan:0x80_0000 nan:0x80_0000 nan:0x80_0000) drop) `),
  `constant out of range`,
);

// ./test/core/simd/simd_const.wast:209
assert_malformed(
  () => instantiate(`(func (v128.const f64x2  269653970229347356221791135597556535197105851288767494898376215204735891170042808140884337949150317257310688430271573696351481990334196274152701320055306275479074865864826923114368235135583993416113802762682700913456874855354834422248712838998185022412196739306217084753107265771378949821875606039276187287552                          269653970229347356221791135597556535197105851288767494898376215204735891170042808140884337949150317257310688430271573696351481990334196274152701320055306275479074865864826923114368235135583993416113802762682700913456874855354834422248712838998185022412196739306217084753107265771378949821875606039276187287552) drop) `),
  `constant out of range`,
);

// ./test/core/simd/simd_const.wast:214
assert_malformed(
  () => instantiate(`(func (v128.const f64x2 -269653970229347356221791135597556535197105851288767494898376215204735891170042808140884337949150317257310688430271573696351481990334196274152701320055306275479074865864826923114368235135583993416113802762682700913456874855354834422248712838998185022412196739306217084753107265771378949821875606039276187287552                         -269653970229347356221791135597556535197105851288767494898376215204735891170042808140884337949150317257310688430271573696351481990334196274152701320055306275479074865864826923114368235135583993416113802762682700913456874855354834422248712838998185022412196739306217084753107265771378949821875606039276187287552) drop) `),
  `constant out of range`,
);

// ./test/core/simd/simd_const.wast:220
assert_malformed(
  () => instantiate(`(func (v128.const f64x2 nan:0x10_0000_0000_0000 nan:0x10_0000_0000_0000) drop) `),
  `constant out of range`,
);

// ./test/core/simd/simd_const.wast:226
assert_malformed(() => instantiate(`(func (v128.const) drop) `), `unexpected token`);

// ./test/core/simd/simd_const.wast:231
assert_malformed(
  () => instantiate(`(func (v128.const 0 0 0 0) drop) `),
  `unexpected token`,
);

// ./test/core/simd/simd_const.wast:235
assert_malformed(
  () => instantiate(`(func (v128.const i8x16) drop) `),
  `wrong number of lane literals`,
);

// ./test/core/simd/simd_const.wast:239
assert_malformed(
  () => instantiate(`(func (v128.const i8x16 0x 0x 0x 0x 0x 0x 0x 0x 0x 0x 0x 0x 0x 0x 0x 0x) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:243
assert_malformed(
  () => instantiate(`(func (v128.const i8x16 1x 1x 1x 1x 1x 1x 1x 1x 1x 1x 1x 1x 1x 1x 1x 1x) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:247
assert_malformed(
  () => instantiate(`(func (v128.const i8x16 0xg 0xg 0xg 0xg 0xg 0xg 0xg 0xg 0xg 0xg 0xg 0xg 0xg 0xg 0xg 0xg) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:252
assert_malformed(
  () => instantiate(`(func (v128.const i16x8) drop) `),
  `wrong number of lane literals`,
);

// ./test/core/simd/simd_const.wast:256
assert_malformed(
  () => instantiate(`(func (v128.const i16x8 0x 0x 0x 0x 0x 0x 0x 0x) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:260
assert_malformed(
  () => instantiate(`(func (v128.const i16x8 1x 1x 1x 1x 1x 1x 1x 1x) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:264
assert_malformed(
  () => instantiate(`(func (v128.const i16x8 0xg 0xg 0xg 0xg 0xg 0xg 0xg 0xg) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:269
assert_malformed(
  () => instantiate(`(func (v128.const i32x4) drop) `),
  `wrong number of lane literals`,
);

// ./test/core/simd/simd_const.wast:273
assert_malformed(
  () => instantiate(`(func (v128.const i32x4 0x 0x 0x 0x) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:277
assert_malformed(
  () => instantiate(`(func (v128.const i32x4 1x 1x 1x 1x) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:281
assert_malformed(
  () => instantiate(`(func (v128.const i32x4 0xg 0xg 0xg 0xg) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:286
assert_malformed(
  () => instantiate(`(func (v128.const i64x2) drop) `),
  `wrong number of lane literals`,
);

// ./test/core/simd/simd_const.wast:290
assert_malformed(
  () => instantiate(`(func (v128.const i64x2 0x 0x) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:294
assert_malformed(
  () => instantiate(`(func (v128.const f64x2 1x 1x) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:298
assert_malformed(
  () => instantiate(`(func (v128.const f64x2 0xg 0xg) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:303
assert_malformed(
  () => instantiate(`(func (v128.const f32x4) drop) `),
  `wrong number of lane literals`,
);

// ./test/core/simd/simd_const.wast:307
assert_malformed(
  () => instantiate(`(func (v128.const f32x4 .0 .0 .0 .0) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:311
assert_malformed(
  () => instantiate(`(func (v128.const f32x4 .0e0 .0e0 .0e0 .0e0) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:315
assert_malformed(
  () => instantiate(`(func (v128.const f32x4 0e 0e 0e 0e) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:319
assert_malformed(
  () => instantiate(`(func (v128.const f32x4 0e+ 0e+ 0e+ 0e+) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:323
assert_malformed(
  () => instantiate(`(func (v128.const f32x4 0.0e 0.0e 0.0e 0.0e) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:327
assert_malformed(
  () => instantiate(`(func (v128.const f32x4 0.0e- 0.0e- 0.0e- 0.0e-) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:331
assert_malformed(
  () => instantiate(`(func (v128.const f32x4 0x 0x 0x 0x) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:335
assert_malformed(
  () => instantiate(`(func (v128.const f32x4 1x 1x 1x 1x) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:339
assert_malformed(
  () => instantiate(`(func (v128.const f32x4 0xg 0xg 0xg 0xg) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:343
assert_malformed(
  () => instantiate(`(func (v128.const f32x4 0x. 0x. 0x. 0x.) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:347
assert_malformed(
  () => instantiate(`(func (v128.const f32x4 0x0.g 0x0.g 0x0.g 0x0.g) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:351
assert_malformed(
  () => instantiate(`(func (v128.const f32x4 0x0p 0x0p 0x0p 0x0p) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:355
assert_malformed(
  () => instantiate(`(func (v128.const f32x4 0x0p+ 0x0p+ 0x0p+ 0x0p+) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:359
assert_malformed(
  () => instantiate(`(func (v128.const f32x4 0x0p- 0x0p- 0x0p- 0x0p-) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:363
assert_malformed(
  () => instantiate(`(func (v128.const f32x4 0x0.0p 0x0.0p 0x0.0p 0x0.0p) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:367
assert_malformed(
  () => instantiate(`(func (v128.const f32x4 0x0.0p+ 0x0.0p+ 0x0.0p+ 0x0.0p+) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:371
assert_malformed(
  () => instantiate(`(func (v128.const f32x4 0x0.0p- 0x0.0p- 0x0.0p- 0x0.0p-) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:375
assert_malformed(
  () => instantiate(`(func (v128.const f32x4 0x0pA 0x0pA 0x0pA 0x0pA) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:379
assert_malformed(
  () => instantiate(`(func (v128.const f32x4 nan:1 nan:1 nan:1 nan:1) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:383
assert_malformed(
  () => instantiate(`(func (v128.const f32x4 nan:0x0 nan:0x0 nan:0x0 nan:0x0) drop) `),
  `constant out of range`,
);

// ./test/core/simd/simd_const.wast:388
assert_malformed(
  () => instantiate(`(func (v128.const f64x2) drop) `),
  `wrong number of lane literals`,
);

// ./test/core/simd/simd_const.wast:392
assert_malformed(
  () => instantiate(`(func (v128.const f64x2 .0 .0) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:396
assert_malformed(
  () => instantiate(`(func (v128.const f64x2 .0e0 .0e0) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:400
assert_malformed(
  () => instantiate(`(func (v128.const f64x2 0e 0e) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:404
assert_malformed(
  () => instantiate(`(func (v128.const f64x2 0e+ 0e+) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:408
assert_malformed(
  () => instantiate(`(func (v128.const f64x2 0.0e+ 0.0e+) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:412
assert_malformed(
  () => instantiate(`(func (v128.const f64x2 0.0e- 0.0e-) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:416
assert_malformed(
  () => instantiate(`(func (v128.const f64x2 0x 0x) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:420
assert_malformed(
  () => instantiate(`(func (v128.const f64x2 1x 1x) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:424
assert_malformed(
  () => instantiate(`(func (v128.const f64x2 0xg 0xg) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:428
assert_malformed(
  () => instantiate(`(func (v128.const f64x2 0x. 0x.) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:432
assert_malformed(
  () => instantiate(`(func (v128.const f64x2 0x0.g 0x0.g) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:436
assert_malformed(
  () => instantiate(`(func (v128.const f64x2 0x0p 0x0p) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:440
assert_malformed(
  () => instantiate(`(func (v128.const f64x2 0x0p+ 0x0p+) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:444
assert_malformed(
  () => instantiate(`(func (v128.const f64x2 0x0p- 0x0p-) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:448
assert_malformed(
  () => instantiate(`(func (v128.const f64x2 0x0.0p 0x0.0p) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:452
assert_malformed(
  () => instantiate(`(func (v128.const f64x2 0x0.0p+ 0x0.0p+) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:456
assert_malformed(
  () => instantiate(`(func (v128.const f64x2 0x0.0p- 0x0.0p-) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:460
assert_malformed(
  () => instantiate(`(func (v128.const f64x2 0x0pA 0x0pA) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:464
assert_malformed(
  () => instantiate(`(func (v128.const f64x2 nan:1 nan:1) drop) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:468
assert_malformed(
  () => instantiate(`(func (v128.const f64x2 nan:0x0 nan:0x0) drop) `),
  `constant out of range`,
);

// ./test/core/simd/simd_const.wast:475
assert_malformed(
  () => instantiate(`(func (v128.const i32x4 0x10000000000000000 0x10000000000000000) drop) `),
  `wrong number of lane literals`,
);

// ./test/core/simd/simd_const.wast:481
assert_malformed(
  () => instantiate(`(func (v128.const i32x4 0x1 0x1 0x1 0x1 0x1) drop) `),
  `wrong number of lane literals`,
);

// ./test/core/simd/simd_const.wast:489
let $113 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 +0x1.00000100000000000p-50 +0x1.00000100000000000p-50 +0x1.00000100000000000p-50 +0x1.00000100000000000p-50)))`);

// ./test/core/simd/simd_const.wast:490
assert_return(
  () => invoke($113, `f`, []),
  [
    new F32x4Pattern(
      value("f32", 0.0000000000000008881784),
      value("f32", 0.0000000000000008881784),
      value("f32", 0.0000000000000008881784),
      value("f32", 0.0000000000000008881784),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:491
let $114 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 -0x1.00000100000000000p-50 -0x1.00000100000000000p-50 -0x1.00000100000000000p-50 -0x1.00000100000000000p-50)))`);

// ./test/core/simd/simd_const.wast:492
assert_return(
  () => invoke($114, `f`, []),
  [
    new F32x4Pattern(
      value("f32", -0.0000000000000008881784),
      value("f32", -0.0000000000000008881784),
      value("f32", -0.0000000000000008881784),
      value("f32", -0.0000000000000008881784),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:493
let $115 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 +0x1.00000500000000001p-50 +0x1.00000500000000001p-50 +0x1.00000500000000001p-50 +0x1.00000500000000001p-50)))`);

// ./test/core/simd/simd_const.wast:494
assert_return(
  () => invoke($115, `f`, []),
  [
    new F32x4Pattern(
      value("f32", 0.0000000000000008881787),
      value("f32", 0.0000000000000008881787),
      value("f32", 0.0000000000000008881787),
      value("f32", 0.0000000000000008881787),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:495
let $116 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 -0x1.00000500000000001p-50 -0x1.00000500000000001p-50 -0x1.00000500000000001p-50 -0x1.00000500000000001p-50)))`);

// ./test/core/simd/simd_const.wast:496
assert_return(
  () => invoke($116, `f`, []),
  [
    new F32x4Pattern(
      value("f32", -0.0000000000000008881787),
      value("f32", -0.0000000000000008881787),
      value("f32", -0.0000000000000008881787),
      value("f32", -0.0000000000000008881787),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:498
let $117 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 +0x4000.004000000p-64 +0x4000.004000000p-64 +0x4000.004000000p-64 +0x4000.004000000p-64)))`);

// ./test/core/simd/simd_const.wast:499
assert_return(
  () => invoke($117, `f`, []),
  [
    new F32x4Pattern(
      value("f32", 0.0000000000000008881784),
      value("f32", 0.0000000000000008881784),
      value("f32", 0.0000000000000008881784),
      value("f32", 0.0000000000000008881784),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:500
let $118 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 -0x4000.004000000p-64 -0x4000.004000000p-64 -0x4000.004000000p-64 -0x4000.004000000p-64)))`);

// ./test/core/simd/simd_const.wast:501
assert_return(
  () => invoke($118, `f`, []),
  [
    new F32x4Pattern(
      value("f32", -0.0000000000000008881784),
      value("f32", -0.0000000000000008881784),
      value("f32", -0.0000000000000008881784),
      value("f32", -0.0000000000000008881784),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:502
let $119 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 +0x4000.014000001p-64 +0x4000.014000001p-64 +0x4000.014000001p-64 +0x4000.014000001p-64)))`);

// ./test/core/simd/simd_const.wast:503
assert_return(
  () => invoke($119, `f`, []),
  [
    new F32x4Pattern(
      value("f32", 0.0000000000000008881787),
      value("f32", 0.0000000000000008881787),
      value("f32", 0.0000000000000008881787),
      value("f32", 0.0000000000000008881787),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:504
let $120 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 -0x4000.014000001p-64 -0x4000.014000001p-64 -0x4000.014000001p-64 -0x4000.014000001p-64)))`);

// ./test/core/simd/simd_const.wast:505
assert_return(
  () => invoke($120, `f`, []),
  [
    new F32x4Pattern(
      value("f32", -0.0000000000000008881787),
      value("f32", -0.0000000000000008881787),
      value("f32", -0.0000000000000008881787),
      value("f32", -0.0000000000000008881787),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:507
let $121 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 +8.8817847263968443573e-16 +8.8817847263968443573e-16 +8.8817847263968443573e-16 +8.8817847263968443573e-16)))`);

// ./test/core/simd/simd_const.wast:508
assert_return(
  () => invoke($121, `f`, []),
  [
    new F32x4Pattern(
      value("f32", 0.0000000000000008881784),
      value("f32", 0.0000000000000008881784),
      value("f32", 0.0000000000000008881784),
      value("f32", 0.0000000000000008881784),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:509
let $122 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 -8.8817847263968443573e-16 -8.8817847263968443573e-16 -8.8817847263968443573e-16 -8.8817847263968443573e-16)))`);

// ./test/core/simd/simd_const.wast:510
assert_return(
  () => invoke($122, `f`, []),
  [
    new F32x4Pattern(
      value("f32", -0.0000000000000008881784),
      value("f32", -0.0000000000000008881784),
      value("f32", -0.0000000000000008881784),
      value("f32", -0.0000000000000008881784),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:511
let $123 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 +8.8817857851880284253e-16 +8.8817857851880284253e-16 +8.8817857851880284253e-16 +8.8817857851880284253e-16)))`);

// ./test/core/simd/simd_const.wast:512
assert_return(
  () => invoke($123, `f`, []),
  [
    new F32x4Pattern(
      value("f32", 0.0000000000000008881786),
      value("f32", 0.0000000000000008881786),
      value("f32", 0.0000000000000008881786),
      value("f32", 0.0000000000000008881786),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:513
let $124 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 -8.8817857851880284253e-16 -8.8817857851880284253e-16 -8.8817857851880284253e-16 -8.8817857851880284253e-16)))`);

// ./test/core/simd/simd_const.wast:514
assert_return(
  () => invoke($124, `f`, []),
  [
    new F32x4Pattern(
      value("f32", -0.0000000000000008881786),
      value("f32", -0.0000000000000008881786),
      value("f32", -0.0000000000000008881786),
      value("f32", -0.0000000000000008881786),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:517
let $125 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 +0x1.00000100000000000p+50 +0x1.00000100000000000p+50 +0x1.00000100000000000p+50 +0x1.00000100000000000p+50)))`);

// ./test/core/simd/simd_const.wast:518
assert_return(
  () => invoke($125, `f`, []),
  [
    new F32x4Pattern(
      value("f32", 1125899900000000),
      value("f32", 1125899900000000),
      value("f32", 1125899900000000),
      value("f32", 1125899900000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:519
let $126 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 -0x1.00000100000000000p+50 -0x1.00000100000000000p+50 -0x1.00000100000000000p+50 -0x1.00000100000000000p+50)))`);

// ./test/core/simd/simd_const.wast:520
assert_return(
  () => invoke($126, `f`, []),
  [
    new F32x4Pattern(
      value("f32", -1125899900000000),
      value("f32", -1125899900000000),
      value("f32", -1125899900000000),
      value("f32", -1125899900000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:521
let $127 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 +0x1.00000500000000001p+50 +0x1.00000500000000001p+50 +0x1.00000500000000001p+50 +0x1.00000500000000001p+50)))`);

// ./test/core/simd/simd_const.wast:522
assert_return(
  () => invoke($127, `f`, []),
  [
    new F32x4Pattern(
      value("f32", 1125900300000000),
      value("f32", 1125900300000000),
      value("f32", 1125900300000000),
      value("f32", 1125900300000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:523
let $128 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 -0x1.00000500000000001p+50 -0x1.00000500000000001p+50 -0x1.00000500000000001p+50 -0x1.00000500000000001p+50)))`);

// ./test/core/simd/simd_const.wast:524
assert_return(
  () => invoke($128, `f`, []),
  [
    new F32x4Pattern(
      value("f32", -1125900300000000),
      value("f32", -1125900300000000),
      value("f32", -1125900300000000),
      value("f32", -1125900300000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:526
let $129 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 +0x4000004000000 +0x4000004000000 +0x4000004000000 +0x4000004000000)))`);

// ./test/core/simd/simd_const.wast:527
assert_return(
  () => invoke($129, `f`, []),
  [
    new F32x4Pattern(
      value("f32", 1125899900000000),
      value("f32", 1125899900000000),
      value("f32", 1125899900000000),
      value("f32", 1125899900000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:528
let $130 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 -0x4000004000000 -0x4000004000000 -0x4000004000000 -0x4000004000000)))`);

// ./test/core/simd/simd_const.wast:529
assert_return(
  () => invoke($130, `f`, []),
  [
    new F32x4Pattern(
      value("f32", -1125899900000000),
      value("f32", -1125899900000000),
      value("f32", -1125899900000000),
      value("f32", -1125899900000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:530
let $131 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 +0x400000c000000 +0x400000c000000 +0x400000c000000 +0x400000c000000)))`);

// ./test/core/simd/simd_const.wast:531
assert_return(
  () => invoke($131, `f`, []),
  [
    new F32x4Pattern(
      value("f32", 1125900200000000),
      value("f32", 1125900200000000),
      value("f32", 1125900200000000),
      value("f32", 1125900200000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:532
let $132 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 -0x400000c000000 -0x400000c000000 -0x400000c000000 -0x400000c000000)))`);

// ./test/core/simd/simd_const.wast:533
assert_return(
  () => invoke($132, `f`, []),
  [
    new F32x4Pattern(
      value("f32", -1125900200000000),
      value("f32", -1125900200000000),
      value("f32", -1125900200000000),
      value("f32", -1125900200000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:535
let $133 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 +1125899973951488 +1125899973951488 +1125899973951488 +1125899973951488)))`);

// ./test/core/simd/simd_const.wast:536
assert_return(
  () => invoke($133, `f`, []),
  [
    new F32x4Pattern(
      value("f32", 1125899900000000),
      value("f32", 1125899900000000),
      value("f32", 1125899900000000),
      value("f32", 1125899900000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:537
let $134 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 -1125899973951488 -1125899973951488 -1125899973951488 -1125899973951488)))`);

// ./test/core/simd/simd_const.wast:538
assert_return(
  () => invoke($134, `f`, []),
  [
    new F32x4Pattern(
      value("f32", -1125899900000000),
      value("f32", -1125899900000000),
      value("f32", -1125899900000000),
      value("f32", -1125899900000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:539
let $135 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 +1125900108169216 +1125900108169216 +1125900108169216 +1125900108169216)))`);

// ./test/core/simd/simd_const.wast:540
assert_return(
  () => invoke($135, `f`, []),
  [
    new F32x4Pattern(
      value("f32", 1125900200000000),
      value("f32", 1125900200000000),
      value("f32", 1125900200000000),
      value("f32", 1125900200000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:541
let $136 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 -1125900108169216 -1125900108169216 -1125900108169216 -1125900108169216)))`);

// ./test/core/simd/simd_const.wast:542
assert_return(
  () => invoke($136, `f`, []),
  [
    new F32x4Pattern(
      value("f32", -1125900200000000),
      value("f32", -1125900200000000),
      value("f32", -1125900200000000),
      value("f32", -1125900200000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:545
let $137 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 +0x0.00000100000000000p-126 +0x0.00000100000000000p-126 +0x0.00000100000000000p-126 +0x0.00000100000000000p-126)))`);

// ./test/core/simd/simd_const.wast:546
assert_return(
  () => invoke($137, `f`, []),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:547
let $138 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 -0x0.00000100000000000p-126 -0x0.00000100000000000p-126 -0x0.00000100000000000p-126 -0x0.00000100000000000p-126)))`);

// ./test/core/simd/simd_const.wast:548
assert_return(
  () => invoke($138, `f`, []),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:549
let $139 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 +0x0.00000500000000001p-126 +0x0.00000500000000001p-126 +0x0.00000500000000001p-126 +0x0.00000500000000001p-126)))`);

// ./test/core/simd/simd_const.wast:550
assert_return(
  () => invoke($139, `f`, []),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000004),
      value("f32", 0.000000000000000000000000000000000000000000004),
      value("f32", 0.000000000000000000000000000000000000000000004),
      value("f32", 0.000000000000000000000000000000000000000000004),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:551
let $140 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 -0x0.00000500000000001p-126 -0x0.00000500000000001p-126 -0x0.00000500000000001p-126 -0x0.00000500000000001p-126)))`);

// ./test/core/simd/simd_const.wast:552
assert_return(
  () => invoke($140, `f`, []),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000004),
      value("f32", -0.000000000000000000000000000000000000000000004),
      value("f32", -0.000000000000000000000000000000000000000000004),
      value("f32", -0.000000000000000000000000000000000000000000004),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:555
let $141 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 +0x1.fffffe8p127 +0x1.fffffe8p127 +0x1.fffffe8p127 +0x1.fffffe8p127)))`);

// ./test/core/simd/simd_const.wast:556
assert_return(
  () => invoke($141, `f`, []),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:557
let $142 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 -0x1.fffffe8p127 -0x1.fffffe8p127 -0x1.fffffe8p127 -0x1.fffffe8p127)))`);

// ./test/core/simd/simd_const.wast:558
assert_return(
  () => invoke($142, `f`, []),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:559
let $143 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 +0x1.fffffefffffffffffp127 +0x1.fffffefffffffffffp127 +0x1.fffffefffffffffffp127 +0x1.fffffefffffffffffp127)))`);

// ./test/core/simd/simd_const.wast:560
assert_return(
  () => invoke($143, `f`, []),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:561
let $144 = instantiate(`(module (func (export "f") (result v128) (v128.const f32x4 -0x1.fffffefffffffffffp127 -0x1.fffffefffffffffffp127 -0x1.fffffefffffffffffp127 -0x1.fffffefffffffffffp127)))`);

// ./test/core/simd/simd_const.wast:562
assert_return(
  () => invoke($144, `f`, []),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:565
let $145 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000080000000000p-600)))`);

// ./test/core/simd/simd_const.wast:566
assert_return(
  () => invoke($145, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102884),
  ],
);

// ./test/core/simd/simd_const.wast:567
let $146 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000080000000000p-600)))`);

// ./test/core/simd/simd_const.wast:568
assert_return(
  () => invoke($146, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102884),
  ],
);

// ./test/core/simd/simd_const.wast:569
let $147 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000080000000001p-600)))`);

// ./test/core/simd/simd_const.wast:570
assert_return(
  () => invoke($147, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/simd/simd_const.wast:571
let $148 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000080000000001p-600)))`);

// ./test/core/simd/simd_const.wast:572
assert_return(
  () => invoke($148, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/simd/simd_const.wast:573
let $149 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.0000000000000fffffffffffp-600)))`);

// ./test/core/simd/simd_const.wast:574
assert_return(
  () => invoke($149, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/simd/simd_const.wast:575
let $150 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.0000000000000fffffffffffp-600)))`);

// ./test/core/simd/simd_const.wast:576
assert_return(
  () => invoke($150, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/simd/simd_const.wast:577
let $151 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000100000000000p-600)))`);

// ./test/core/simd/simd_const.wast:578
assert_return(
  () => invoke($151, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/simd/simd_const.wast:579
let $152 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000100000000000p-600)))`);

// ./test/core/simd/simd_const.wast:580
assert_return(
  () => invoke($152, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/simd/simd_const.wast:581
let $153 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000100000000001p-600)))`);

// ./test/core/simd/simd_const.wast:582
assert_return(
  () => invoke($153, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/simd/simd_const.wast:583
let $154 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000100000000001p-600)))`);

// ./test/core/simd/simd_const.wast:584
assert_return(
  () => invoke($154, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/simd/simd_const.wast:585
let $155 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.00000000000017ffffffffffp-600)))`);

// ./test/core/simd/simd_const.wast:586
assert_return(
  () => invoke($155, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/simd/simd_const.wast:587
let $156 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.00000000000017ffffffffffp-600)))`);

// ./test/core/simd/simd_const.wast:588
assert_return(
  () => invoke($156, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/simd/simd_const.wast:589
let $157 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000180000000000p-600)))`);

// ./test/core/simd/simd_const.wast:590
assert_return(
  () => invoke($157, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/simd/simd_const.wast:591
let $158 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000180000000000p-600)))`);

// ./test/core/simd/simd_const.wast:592
assert_return(
  () => invoke($158, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/simd/simd_const.wast:593
let $159 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000180000000001p-600)))`);

// ./test/core/simd/simd_const.wast:594
assert_return(
  () => invoke($159, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/simd/simd_const.wast:595
let $160 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000180000000001p-600)))`);

// ./test/core/simd/simd_const.wast:596
assert_return(
  () => invoke($160, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/simd/simd_const.wast:597
let $161 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.0000000000001fffffffffffp-600)))`);

// ./test/core/simd/simd_const.wast:598
assert_return(
  () => invoke($161, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/simd/simd_const.wast:599
let $162 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.0000000000001fffffffffffp-600)))`);

// ./test/core/simd/simd_const.wast:600
assert_return(
  () => invoke($162, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/simd/simd_const.wast:601
let $163 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000200000000000p-600)))`);

// ./test/core/simd/simd_const.wast:602
assert_return(
  () => invoke($163, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/simd/simd_const.wast:603
let $164 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000200000000000p-600)))`);

// ./test/core/simd/simd_const.wast:604
assert_return(
  () => invoke($164, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/simd/simd_const.wast:605
let $165 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000200000000001p-600)))`);

// ./test/core/simd/simd_const.wast:606
assert_return(
  () => invoke($165, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/simd/simd_const.wast:607
let $166 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000200000000001p-600)))`);

// ./test/core/simd/simd_const.wast:608
assert_return(
  () => invoke($166, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/simd/simd_const.wast:609
let $167 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.00000000000027ffffffffffp-600)))`);

// ./test/core/simd/simd_const.wast:610
assert_return(
  () => invoke($167, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/simd/simd_const.wast:611
let $168 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.00000000000027ffffffffffp-600)))`);

// ./test/core/simd/simd_const.wast:612
assert_return(
  () => invoke($168, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/simd/simd_const.wast:613
let $169 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x1.000000000000280000000001p-600)))`);

// ./test/core/simd/simd_const.wast:614
assert_return(
  () => invoke($169, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028857),
  ],
);

// ./test/core/simd/simd_const.wast:615
let $170 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x1.000000000000280000000001p-600)))`);

// ./test/core/simd/simd_const.wast:616
assert_return(
  () => invoke($170, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028857),
  ],
);

// ./test/core/simd/simd_const.wast:617
let $171 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x8000000.000000400000000000p-627)))`);

// ./test/core/simd/simd_const.wast:618
assert_return(
  () => invoke($171, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102884),
  ],
);

// ./test/core/simd/simd_const.wast:619
let $172 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x8000000.000000400000000000p-627)))`);

// ./test/core/simd/simd_const.wast:620
assert_return(
  () => invoke($172, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102884),
  ],
);

// ./test/core/simd/simd_const.wast:621
let $173 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x8000000.000000400000000001p-627)))`);

// ./test/core/simd/simd_const.wast:622
assert_return(
  () => invoke($173, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/simd/simd_const.wast:623
let $174 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x8000000.000000400000000001p-627)))`);

// ./test/core/simd/simd_const.wast:624
assert_return(
  () => invoke($174, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/simd/simd_const.wast:625
let $175 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x8000000.0000007fffffffffffp-627)))`);

// ./test/core/simd/simd_const.wast:626
assert_return(
  () => invoke($175, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/simd/simd_const.wast:627
let $176 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x8000000.0000007fffffffffffp-627)))`);

// ./test/core/simd/simd_const.wast:628
assert_return(
  () => invoke($176, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/simd/simd_const.wast:629
let $177 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x8000000.000000800000000000p-627)))`);

// ./test/core/simd/simd_const.wast:630
assert_return(
  () => invoke($177, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/simd/simd_const.wast:631
let $178 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x8000000.000000800000000000p-627)))`);

// ./test/core/simd/simd_const.wast:632
assert_return(
  () => invoke($178, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/simd/simd_const.wast:633
let $179 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x8000000.000000800000000001p-627)))`);

// ./test/core/simd/simd_const.wast:634
assert_return(
  () => invoke($179, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/simd/simd_const.wast:635
let $180 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x8000000.000000800000000001p-627)))`);

// ./test/core/simd/simd_const.wast:636
assert_return(
  () => invoke($180, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/simd/simd_const.wast:637
let $181 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x8000000.000000bfffffffffffp-627)))`);

// ./test/core/simd/simd_const.wast:638
assert_return(
  () => invoke($181, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/simd/simd_const.wast:639
let $182 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x8000000.000000bfffffffffffp-627)))`);

// ./test/core/simd/simd_const.wast:640
assert_return(
  () => invoke($182, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028847),
  ],
);

// ./test/core/simd/simd_const.wast:641
let $183 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x8000000.000000c00000000000p-627)))`);

// ./test/core/simd/simd_const.wast:642
assert_return(
  () => invoke($183, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/simd/simd_const.wast:643
let $184 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x8000000.000000c00000000000p-627)))`);

// ./test/core/simd/simd_const.wast:644
assert_return(
  () => invoke($184, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/simd/simd_const.wast:645
let $185 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x8000000.000000c00000000001p-627)))`);

// ./test/core/simd/simd_const.wast:646
assert_return(
  () => invoke($185, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/simd/simd_const.wast:647
let $186 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x8000000.000000c00000000001p-627)))`);

// ./test/core/simd/simd_const.wast:648
assert_return(
  () => invoke($186, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/simd/simd_const.wast:649
let $187 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x8000000.000000ffffffffffffp-627)))`);

// ./test/core/simd/simd_const.wast:650
assert_return(
  () => invoke($187, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/simd/simd_const.wast:651
let $188 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x8000000.000000ffffffffffffp-627)))`);

// ./test/core/simd/simd_const.wast:652
assert_return(
  () => invoke($188, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/simd/simd_const.wast:653
let $189 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x8000000.000001000000000000p-627)))`);

// ./test/core/simd/simd_const.wast:654
assert_return(
  () => invoke($189, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/simd/simd_const.wast:655
let $190 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x8000000.000001000000000000p-627)))`);

// ./test/core/simd/simd_const.wast:656
assert_return(
  () => invoke($190, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/simd/simd_const.wast:657
let $191 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x8000000.000001000000000001p-627)))`);

// ./test/core/simd/simd_const.wast:658
assert_return(
  () => invoke($191, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/simd/simd_const.wast:659
let $192 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x8000000.000001000000000001p-627)))`);

// ./test/core/simd/simd_const.wast:660
assert_return(
  () => invoke($192, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/simd/simd_const.wast:661
let $193 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x8000000.0000013fffffffffffp-627)))`);

// ./test/core/simd/simd_const.wast:662
assert_return(
  () => invoke($193, `f`, []),
  [
    value("f64", 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/simd/simd_const.wast:663
let $194 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x8000000.0000013fffffffffffp-627)))`);

// ./test/core/simd/simd_const.wast:664
assert_return(
  () => invoke($194, `f`, []),
  [
    value("f64", -0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002409919865102885),
  ],
);

// ./test/core/simd/simd_const.wast:665
let $195 = instantiate(`(module (func (export "f") (result f64) (f64.const +0x8000000.000001400000000001p-627)))`);

// ./test/core/simd/simd_const.wast:666
assert_return(
  () => invoke($195, `f`, []),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028857),
  ],
);

// ./test/core/simd/simd_const.wast:667
let $196 = instantiate(`(module (func (export "f") (result f64) (f64.const -0x8000000.000001400000000001p-627)))`);

// ./test/core/simd/simd_const.wast:668
assert_return(
  () => invoke($196, `f`, []),
  [
    value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024099198651028857),
  ],
);

// ./test/core/simd/simd_const.wast:669
let $197 = instantiate(`(module (func (export "f") (result f64) (f64.const +5.3575430359313371995e+300)))`);

// ./test/core/simd/simd_const.wast:670
assert_return(
  () => invoke($197, `f`, []),
  [
    value("f64", 5357543035931337000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/simd/simd_const.wast:671
let $198 = instantiate(`(module (func (export "f") (result f64) (f64.const -5.3575430359313371995e+300)))`);

// ./test/core/simd/simd_const.wast:672
assert_return(
  () => invoke($198, `f`, []),
  [
    value("f64", -5357543035931337000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/simd/simd_const.wast:673
let $199 = instantiate(`(module (func (export "f") (result f64) (f64.const +5.3575430359313371996e+300)))`);

// ./test/core/simd/simd_const.wast:674
assert_return(
  () => invoke($199, `f`, []),
  [
    value("f64", 5357543035931338000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/simd/simd_const.wast:675
let $200 = instantiate(`(module (func (export "f") (result f64) (f64.const -5.3575430359313371996e+300)))`);

// ./test/core/simd/simd_const.wast:676
assert_return(
  () => invoke($200, `f`, []),
  [
    value("f64", -5357543035931338000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/simd/simd_const.wast:677
let $201 = instantiate(`(module (func (export "f") (result f64) (f64.const +5.3575430359313383891e+300)))`);

// ./test/core/simd/simd_const.wast:678
assert_return(
  () => invoke($201, `f`, []),
  [
    value("f64", 5357543035931338000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/simd/simd_const.wast:679
let $202 = instantiate(`(module (func (export "f") (result f64) (f64.const -5.3575430359313383891e+300)))`);

// ./test/core/simd/simd_const.wast:680
assert_return(
  () => invoke($202, `f`, []),
  [
    value("f64", -5357543035931338000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/simd/simd_const.wast:681
let $203 = instantiate(`(module (func (export "f") (result f64) (f64.const +5.3575430359313383892e+300)))`);

// ./test/core/simd/simd_const.wast:682
assert_return(
  () => invoke($203, `f`, []),
  [
    value("f64", 5357543035931339000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/simd/simd_const.wast:683
let $204 = instantiate(`(module (func (export "f") (result f64) (f64.const -5.3575430359313383892e+300)))`);

// ./test/core/simd/simd_const.wast:684
assert_return(
  () => invoke($204, `f`, []),
  [
    value("f64", -5357543035931339000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/simd/simd_const.wast:687
let $205 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x1.000000000000080000000000p+600 +0x1.000000000000080000000000p+600)))`);

// ./test/core/simd/simd_const.wast:688
assert_return(
  () => invoke($205, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 4149515568880993000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 4149515568880993000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:689
let $206 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x1.000000000000080000000000p+600 -0x1.000000000000080000000000p+600)))`);

// ./test/core/simd/simd_const.wast:690
assert_return(
  () => invoke($206, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -4149515568880993000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -4149515568880993000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:691
let $207 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x1.000000000000080000000001p+600 +0x1.000000000000080000000001p+600)))`);

// ./test/core/simd/simd_const.wast:692
assert_return(
  () => invoke($207, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:693
let $208 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x1.000000000000080000000001p+600 -0x1.000000000000080000000001p+600)))`);

// ./test/core/simd/simd_const.wast:694
assert_return(
  () => invoke($208, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:695
let $209 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x1.0000000000000fffffffffffp+600 +0x1.0000000000000fffffffffffp+600)))`);

// ./test/core/simd/simd_const.wast:696
assert_return(
  () => invoke($209, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:697
let $210 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x1.0000000000000fffffffffffp+600 -0x1.0000000000000fffffffffffp+600)))`);

// ./test/core/simd/simd_const.wast:698
assert_return(
  () => invoke($210, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:699
let $211 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x1.000000000000100000000000p+600 +0x1.000000000000100000000000p+600)))`);

// ./test/core/simd/simd_const.wast:700
assert_return(
  () => invoke($211, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:701
let $212 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x1.000000000000100000000000p+600 -0x1.000000000000100000000000p+600)))`);

// ./test/core/simd/simd_const.wast:702
assert_return(
  () => invoke($212, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:703
let $213 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x1.000000000000100000000001p+600 +0x1.000000000000100000000001p+600)))`);

// ./test/core/simd/simd_const.wast:704
assert_return(
  () => invoke($213, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:705
let $214 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x1.000000000000100000000001p+600 -0x1.000000000000100000000001p+600)))`);

// ./test/core/simd/simd_const.wast:706
assert_return(
  () => invoke($214, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:707
let $215 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x1.00000000000017ffffffffffp+600 +0x1.00000000000017ffffffffffp+600)))`);

// ./test/core/simd/simd_const.wast:708
assert_return(
  () => invoke($215, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:709
let $216 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x1.00000000000017ffffffffffp+600 -0x1.00000000000017ffffffffffp+600)))`);

// ./test/core/simd/simd_const.wast:710
assert_return(
  () => invoke($216, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -4149515568880994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:711
let $217 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x1.000000000000180000000000p+600 +0x1.000000000000180000000000p+600)))`);

// ./test/core/simd/simd_const.wast:712
assert_return(
  () => invoke($217, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:713
let $218 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x1.000000000000180000000000p+600 -0x1.000000000000180000000000p+600)))`);

// ./test/core/simd/simd_const.wast:714
assert_return(
  () => invoke($218, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:715
let $219 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x1.000000000000180000000001p+600 +0x1.000000000000180000000001p+600)))`);

// ./test/core/simd/simd_const.wast:716
assert_return(
  () => invoke($219, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:717
let $220 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x1.000000000000180000000001p+600 -0x1.000000000000180000000001p+600)))`);

// ./test/core/simd/simd_const.wast:718
assert_return(
  () => invoke($220, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:719
let $221 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x1.0000000000001fffffffffffp+600 +0x1.0000000000001fffffffffffp+600)))`);

// ./test/core/simd/simd_const.wast:720
assert_return(
  () => invoke($221, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:721
let $222 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x1.0000000000001fffffffffffp+600 -0x1.0000000000001fffffffffffp+600)))`);

// ./test/core/simd/simd_const.wast:722
assert_return(
  () => invoke($222, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:723
let $223 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x1.000000000000200000000000p+600 +0x1.000000000000200000000000p+600)))`);

// ./test/core/simd/simd_const.wast:724
assert_return(
  () => invoke($223, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:725
let $224 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x1.000000000000200000000000p+600 -0x1.000000000000200000000000p+600)))`);

// ./test/core/simd/simd_const.wast:726
assert_return(
  () => invoke($224, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:727
let $225 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x1.000000000000200000000001p+600 +0x1.000000000000200000000001p+600)))`);

// ./test/core/simd/simd_const.wast:728
assert_return(
  () => invoke($225, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:729
let $226 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x1.000000000000200000000001p+600 -0x1.000000000000200000000001p+600)))`);

// ./test/core/simd/simd_const.wast:730
assert_return(
  () => invoke($226, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:731
let $227 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x1.00000000000027ffffffffffp+600 +0x1.00000000000027ffffffffffp+600)))`);

// ./test/core/simd/simd_const.wast:732
assert_return(
  () => invoke($227, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:733
let $228 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x1.00000000000027ffffffffffp+600 -0x1.00000000000027ffffffffffp+600)))`);

// ./test/core/simd/simd_const.wast:734
assert_return(
  () => invoke($228, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:735
let $229 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x1.000000000000280000000000p+600 +0x1.000000000000280000000000p+600)))`);

// ./test/core/simd/simd_const.wast:736
assert_return(
  () => invoke($229, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:737
let $230 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x1.000000000000280000000000p+600 -0x1.000000000000280000000000p+600)))`);

// ./test/core/simd/simd_const.wast:738
assert_return(
  () => invoke($230, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -4149515568880995000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:739
let $231 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x1.000000000000280000000001p+600 +0x1.000000000000280000000001p+600)))`);

// ./test/core/simd/simd_const.wast:740
assert_return(
  () => invoke($231, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 4149515568880996000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 4149515568880996000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:741
let $232 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x1.000000000000280000000001p+600 -0x1.000000000000280000000001p+600)))`);

// ./test/core/simd/simd_const.wast:742
assert_return(
  () => invoke($232, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -4149515568880996000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -4149515568880996000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:743
let $233 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x2000000000000100000000000 +0x2000000000000100000000000)))`);

// ./test/core/simd/simd_const.wast:744
assert_return(
  () => invoke($233, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 158456325028528680000000000000),
      value("f64", 158456325028528680000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:745
let $234 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x2000000000000100000000000 -0x2000000000000100000000000)))`);

// ./test/core/simd/simd_const.wast:746
assert_return(
  () => invoke($234, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -158456325028528680000000000000),
      value("f64", -158456325028528680000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:747
let $235 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x2000000000000100000000001 +0x2000000000000100000000001)))`);

// ./test/core/simd/simd_const.wast:748
assert_return(
  () => invoke($235, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 158456325028528700000000000000),
      value("f64", 158456325028528700000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:749
let $236 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x2000000000000100000000001 -0x2000000000000100000000001)))`);

// ./test/core/simd/simd_const.wast:750
assert_return(
  () => invoke($236, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -158456325028528700000000000000),
      value("f64", -158456325028528700000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:751
let $237 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x20000000000001fffffffffff +0x20000000000001fffffffffff)))`);

// ./test/core/simd/simd_const.wast:752
assert_return(
  () => invoke($237, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 158456325028528700000000000000),
      value("f64", 158456325028528700000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:753
let $238 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x20000000000001fffffffffff -0x20000000000001fffffffffff)))`);

// ./test/core/simd/simd_const.wast:754
assert_return(
  () => invoke($238, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -158456325028528700000000000000),
      value("f64", -158456325028528700000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:755
let $239 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x2000000000000200000000000 +0x2000000000000200000000000)))`);

// ./test/core/simd/simd_const.wast:756
assert_return(
  () => invoke($239, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 158456325028528700000000000000),
      value("f64", 158456325028528700000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:757
let $240 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x2000000000000200000000000 -0x2000000000000200000000000)))`);

// ./test/core/simd/simd_const.wast:758
assert_return(
  () => invoke($240, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -158456325028528700000000000000),
      value("f64", -158456325028528700000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:759
let $241 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x2000000000000200000000001 +0x2000000000000200000000001)))`);

// ./test/core/simd/simd_const.wast:760
assert_return(
  () => invoke($241, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 158456325028528700000000000000),
      value("f64", 158456325028528700000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:761
let $242 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x2000000000000200000000001 -0x2000000000000200000000001)))`);

// ./test/core/simd/simd_const.wast:762
assert_return(
  () => invoke($242, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -158456325028528700000000000000),
      value("f64", -158456325028528700000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:763
let $243 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x20000000000002fffffffffff +0x20000000000002fffffffffff)))`);

// ./test/core/simd/simd_const.wast:764
assert_return(
  () => invoke($243, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 158456325028528700000000000000),
      value("f64", 158456325028528700000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:765
let $244 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x20000000000002fffffffffff -0x20000000000002fffffffffff)))`);

// ./test/core/simd/simd_const.wast:766
assert_return(
  () => invoke($244, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -158456325028528700000000000000),
      value("f64", -158456325028528700000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:767
let $245 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x2000000000000300000000000 +0x2000000000000300000000000)))`);

// ./test/core/simd/simd_const.wast:768
assert_return(
  () => invoke($245, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 158456325028528750000000000000),
      value("f64", 158456325028528750000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:769
let $246 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x2000000000000300000000000 -0x2000000000000300000000000)))`);

// ./test/core/simd/simd_const.wast:770
assert_return(
  () => invoke($246, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -158456325028528750000000000000),
      value("f64", -158456325028528750000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:771
let $247 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x2000000000000300000000001 +0x2000000000000300000000001)))`);

// ./test/core/simd/simd_const.wast:772
assert_return(
  () => invoke($247, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 158456325028528750000000000000),
      value("f64", 158456325028528750000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:773
let $248 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x2000000000000300000000001 -0x2000000000000300000000001)))`);

// ./test/core/simd/simd_const.wast:774
assert_return(
  () => invoke($248, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -158456325028528750000000000000),
      value("f64", -158456325028528750000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:775
let $249 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x20000000000003fffffffffff +0x20000000000003fffffffffff)))`);

// ./test/core/simd/simd_const.wast:776
assert_return(
  () => invoke($249, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 158456325028528750000000000000),
      value("f64", 158456325028528750000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:777
let $250 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x20000000000003fffffffffff -0x20000000000003fffffffffff)))`);

// ./test/core/simd/simd_const.wast:778
assert_return(
  () => invoke($250, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -158456325028528750000000000000),
      value("f64", -158456325028528750000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:779
let $251 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x2000000000000400000000000 +0x2000000000000400000000000)))`);

// ./test/core/simd/simd_const.wast:780
assert_return(
  () => invoke($251, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 158456325028528750000000000000),
      value("f64", 158456325028528750000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:781
let $252 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x2000000000000400000000000 -0x2000000000000400000000000)))`);

// ./test/core/simd/simd_const.wast:782
assert_return(
  () => invoke($252, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -158456325028528750000000000000),
      value("f64", -158456325028528750000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:783
let $253 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x2000000000000400000000001 +0x2000000000000400000000001)))`);

// ./test/core/simd/simd_const.wast:784
assert_return(
  () => invoke($253, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 158456325028528750000000000000),
      value("f64", 158456325028528750000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:785
let $254 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x2000000000000400000000001 -0x2000000000000400000000001)))`);

// ./test/core/simd/simd_const.wast:786
assert_return(
  () => invoke($254, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -158456325028528750000000000000),
      value("f64", -158456325028528750000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:787
let $255 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x20000000000004fffffffffff +0x20000000000004fffffffffff)))`);

// ./test/core/simd/simd_const.wast:788
assert_return(
  () => invoke($255, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 158456325028528750000000000000),
      value("f64", 158456325028528750000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:789
let $256 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x20000000000004fffffffffff -0x20000000000004fffffffffff)))`);

// ./test/core/simd/simd_const.wast:790
assert_return(
  () => invoke($256, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -158456325028528750000000000000),
      value("f64", -158456325028528750000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:791
let $257 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x2000000000000500000000000 +0x2000000000000500000000000)))`);

// ./test/core/simd/simd_const.wast:792
assert_return(
  () => invoke($257, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 158456325028528750000000000000),
      value("f64", 158456325028528750000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:793
let $258 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x2000000000000500000000000 -0x2000000000000500000000000)))`);

// ./test/core/simd/simd_const.wast:794
assert_return(
  () => invoke($258, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -158456325028528750000000000000),
      value("f64", -158456325028528750000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:795
let $259 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x2000000000000500000000001 +0x2000000000000500000000001)))`);

// ./test/core/simd/simd_const.wast:796
assert_return(
  () => invoke($259, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 158456325028528780000000000000),
      value("f64", 158456325028528780000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:797
let $260 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x2000000000000500000000001 -0x2000000000000500000000001)))`);

// ./test/core/simd/simd_const.wast:798
assert_return(
  () => invoke($260, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -158456325028528780000000000000),
      value("f64", -158456325028528780000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:799
let $261 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +1152921504606847104 +1152921504606847104)))`);

// ./test/core/simd/simd_const.wast:800
assert_return(
  () => invoke($261, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 1152921504606847000),
      value("f64", 1152921504606847000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:801
let $262 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -1152921504606847104 -1152921504606847104)))`);

// ./test/core/simd/simd_const.wast:802
assert_return(
  () => invoke($262, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -1152921504606847000),
      value("f64", -1152921504606847000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:803
let $263 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +1152921504606847105 +1152921504606847105)))`);

// ./test/core/simd/simd_const.wast:804
assert_return(
  () => invoke($263, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 1152921504606847200),
      value("f64", 1152921504606847200),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:805
let $264 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -1152921504606847105 -1152921504606847105)))`);

// ./test/core/simd/simd_const.wast:806
assert_return(
  () => invoke($264, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -1152921504606847200),
      value("f64", -1152921504606847200),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:807
let $265 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +1152921504606847359 +1152921504606847359)))`);

// ./test/core/simd/simd_const.wast:808
assert_return(
  () => invoke($265, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 1152921504606847200),
      value("f64", 1152921504606847200),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:809
let $266 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -1152921504606847359 -1152921504606847359)))`);

// ./test/core/simd/simd_const.wast:810
assert_return(
  () => invoke($266, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -1152921504606847200),
      value("f64", -1152921504606847200),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:811
let $267 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +1152921504606847360 +1152921504606847360)))`);

// ./test/core/simd/simd_const.wast:812
assert_return(
  () => invoke($267, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 1152921504606847500),
      value("f64", 1152921504606847500),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:813
let $268 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -1152921504606847360 -1152921504606847360)))`);

// ./test/core/simd/simd_const.wast:814
assert_return(
  () => invoke($268, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -1152921504606847500),
      value("f64", -1152921504606847500),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:817
let $269 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x0.000000000000080000000000p-1022 +0x0.000000000000080000000000p-1022)))`);

// ./test/core/simd/simd_const.wast:818
assert_return(() => invoke($269, `f`, []), [new F64x2Pattern(value("f64", 0), value("f64", 0))]);

// ./test/core/simd/simd_const.wast:819
let $270 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x0.000000000000080000000000p-1022 -0x0.000000000000080000000000p-1022)))`);

// ./test/core/simd/simd_const.wast:820
assert_return(() => invoke($270, `f`, []), [new F64x2Pattern(value("f64", -0), value("f64", -0))]);

// ./test/core/simd/simd_const.wast:821
let $271 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x0.000000000000080000000001p-1022 +0x0.000000000000080000000001p-1022)))`);

// ./test/core/simd/simd_const.wast:822
assert_return(
  () => invoke($271, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:823
let $272 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x0.000000000000080000000001p-1022 -0x0.000000000000080000000001p-1022)))`);

// ./test/core/simd/simd_const.wast:824
assert_return(
  () => invoke($272, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:825
let $273 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x0.0000000000000fffffffffffp-1022 +0x0.0000000000000fffffffffffp-1022)))`);

// ./test/core/simd/simd_const.wast:826
assert_return(
  () => invoke($273, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:827
let $274 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x0.0000000000000fffffffffffp-1022 -0x0.0000000000000fffffffffffp-1022)))`);

// ./test/core/simd/simd_const.wast:828
assert_return(
  () => invoke($274, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:829
let $275 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x0.000000000000100000000000p-1022 +0x0.000000000000100000000000p-1022)))`);

// ./test/core/simd/simd_const.wast:830
assert_return(
  () => invoke($275, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:831
let $276 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x0.000000000000100000000000p-1022 -0x0.000000000000100000000000p-1022)))`);

// ./test/core/simd/simd_const.wast:832
assert_return(
  () => invoke($276, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:833
let $277 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x0.000000000000100000000001p-1022 +0x0.000000000000100000000001p-1022)))`);

// ./test/core/simd/simd_const.wast:834
assert_return(
  () => invoke($277, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:835
let $278 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x0.000000000000100000000001p-1022 -0x0.000000000000100000000001p-1022)))`);

// ./test/core/simd/simd_const.wast:836
assert_return(
  () => invoke($278, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:837
let $279 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x0.00000000000017ffffffffffp-1022 +0x0.00000000000017ffffffffffp-1022)))`);

// ./test/core/simd/simd_const.wast:838
assert_return(
  () => invoke($279, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:839
let $280 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x0.00000000000017ffffffffffp-1022 -0x0.00000000000017ffffffffffp-1022)))`);

// ./test/core/simd/simd_const.wast:840
assert_return(
  () => invoke($280, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:841
let $281 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x0.000000000000180000000000p-1022 +0x0.000000000000180000000000p-1022)))`);

// ./test/core/simd/simd_const.wast:842
assert_return(
  () => invoke($281, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
      value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:843
let $282 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x0.000000000000180000000000p-1022 -0x0.000000000000180000000000p-1022)))`);

// ./test/core/simd/simd_const.wast:844
assert_return(
  () => invoke($282, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
      value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:845
let $283 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x0.000000000000180000000001p-1022 +0x0.000000000000180000000001p-1022)))`);

// ./test/core/simd/simd_const.wast:846
assert_return(
  () => invoke($283, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
      value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:847
let $284 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x0.000000000000180000000001p-1022 -0x0.000000000000180000000001p-1022)))`);

// ./test/core/simd/simd_const.wast:848
assert_return(
  () => invoke($284, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
      value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:849
let $285 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x0.0000000000001fffffffffffp-1022 +0x0.0000000000001fffffffffffp-1022)))`);

// ./test/core/simd/simd_const.wast:850
assert_return(
  () => invoke($285, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
      value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:851
let $286 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x0.0000000000001fffffffffffp-1022 -0x0.0000000000001fffffffffffp-1022)))`);

// ./test/core/simd/simd_const.wast:852
assert_return(
  () => invoke($286, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
      value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:853
let $287 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x0.000000000000200000000000p-1022 +0x0.000000000000200000000000p-1022)))`);

// ./test/core/simd/simd_const.wast:854
assert_return(
  () => invoke($287, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
      value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:855
let $288 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x0.000000000000200000000000p-1022 -0x0.000000000000200000000000p-1022)))`);

// ./test/core/simd/simd_const.wast:856
assert_return(
  () => invoke($288, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
      value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:857
let $289 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x0.000000000000200000000001p-1022 +0x0.000000000000200000000001p-1022)))`);

// ./test/core/simd/simd_const.wast:858
assert_return(
  () => invoke($289, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
      value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:859
let $290 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x0.000000000000200000000001p-1022 -0x0.000000000000200000000001p-1022)))`);

// ./test/core/simd/simd_const.wast:860
assert_return(
  () => invoke($290, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
      value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:861
let $291 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x0.00000000000027ffffffffffp-1022 +0x0.00000000000027ffffffffffp-1022)))`);

// ./test/core/simd/simd_const.wast:862
assert_return(
  () => invoke($291, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
      value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:863
let $292 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x0.00000000000027ffffffffffp-1022 -0x0.00000000000027ffffffffffp-1022)))`);

// ./test/core/simd/simd_const.wast:864
assert_return(
  () => invoke($292, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
      value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:865
let $293 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x0.000000000000280000000000p-1022 +0x0.000000000000280000000000p-1022)))`);

// ./test/core/simd/simd_const.wast:866
assert_return(
  () => invoke($293, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
      value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:867
let $294 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x0.000000000000280000000000p-1022 -0x0.000000000000280000000000p-1022)))`);

// ./test/core/simd/simd_const.wast:868
assert_return(
  () => invoke($294, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
      value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:869
let $295 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x1.000000000000280000000001p-1022 +0x1.000000000000280000000001p-1022)))`);

// ./test/core/simd/simd_const.wast:870
assert_return(
  () => invoke($295, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002225073858507203),
      value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002225073858507203),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:871
let $296 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x1.000000000000280000000001p-1022 -0x1.000000000000280000000001p-1022)))`);

// ./test/core/simd/simd_const.wast:872
assert_return(
  () => invoke($296, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002225073858507203),
      value("f64", -0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002225073858507203),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:875
let $297 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x1.fffffffffffff4p1023 +0x1.fffffffffffff4p1023)))`);

// ./test/core/simd/simd_const.wast:876
assert_return(
  () => invoke($297, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:877
let $298 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x1.fffffffffffff4p1023 -0x1.fffffffffffff4p1023)))`);

// ./test/core/simd/simd_const.wast:878
assert_return(
  () => invoke($298, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:879
let $299 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 +0x1.fffffffffffff7ffffffp1023 +0x1.fffffffffffff7ffffffp1023)))`);

// ./test/core/simd/simd_const.wast:880
assert_return(
  () => invoke($299, `f`, []),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:881
let $300 = instantiate(`(module (func (export "f") (result v128) (v128.const f64x2 -0x1.fffffffffffff7ffffffp1023 -0x1.fffffffffffff7ffffffp1023)))`);

// ./test/core/simd/simd_const.wast:882
assert_return(
  () => invoke($300, `f`, []),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:886
let $301 = instantiate(`(module (memory 1)
  (func (export "as-br-retval") (result v128)
    (block (result v128) (br 0 (v128.const i32x4 0x03020100 0x07060504 0x0b0a0908 0x0f0e0d0c)))
  )
  (func (export "as-br_if-retval") (result v128)
    (block (result v128)
      (br_if 0 (v128.const i32x4 0 1 2 3) (i32.const 1))
    )
  )
  (func (export "as-return-retval") (result v128)
    (return (v128.const i32x4 0 1 2 3))
  )
  (func (export "as-if-then-retval") (result v128)
    (if (result v128) (i32.const 1)
      (then (v128.const i32x4 0 1 2 3)) (else (v128.const i32x4 3 2 1 0))
    )
  )
  (func (export "as-if-else-retval") (result v128)
    (if (result v128) (i32.const 0)
      (then (v128.const i32x4 0 1 2 3)) (else (v128.const i32x4 3 2 1 0))
    )
  )
  (func $$f (param v128 v128 v128) (result v128) (v128.const i32x4 0 1 2 3))
  (func (export "as-call-param") (result v128)
    (call $$f (v128.const i32x4 0 1 2 3) (v128.const i32x4 0 1 2 3) (v128.const i32x4 0 1 2 3))
  )
  (func (export "as-block-retval") (result v128)
    (block (result v128) (v128.const i32x4 0 1 2 3))
  )
  (func (export "as-loop-retval") (result v128)
    (loop (result v128) (v128.const i32x4 0 1 2 3))
  )
  (func (export "as-drop-operand")
    (drop (v128.const i32x4 0 1 2 3))
  )

  (func (export "as-br-retval2") (result v128)
    (block (result v128) (br 0 (v128.const i64x2 0x0302010007060504 0x0b0a09080f0e0d0c)))
  )
  (func (export "as-br_if-retval2") (result v128)
    (block (result v128)
      (br_if 0 (v128.const i64x2 0 1) (i32.const 1))
    )
  )
  (func (export "as-return-retval2") (result v128)
    (return (v128.const i64x2 0 1))
  )
  (func (export "as-if-then-retval2") (result v128)
    (if (result v128) (i32.const 1)
      (then (v128.const i64x2 0 1)) (else (v128.const i64x2 1 0))
    )
  )
  (func (export "as-if-else-retval2") (result v128)
    (if (result v128) (i32.const 0)
      (then (v128.const i64x2 0 1)) (else (v128.const i64x2 1 0))
    )
  )
  (func $$f2 (param v128 v128 v128) (result v128) (v128.const i64x2 0 1))
  (func (export "as-call-param2") (result v128)
    (call $$f2 (v128.const i64x2 0 1) (v128.const i64x2 0 1) (v128.const i64x2 0 1))
  )

  (type $$sig (func (param v128 v128 v128) (result v128)))
  (table funcref (elem $$f $$f2))
  (func (export "as-call_indirect-param") (result v128)
    (call_indirect (type $$sig)
      (v128.const i32x4 0 1 2 3) (v128.const i32x4 0 1 2 3) (v128.const i32x4 0 1 2 3) (i32.const 0)
    )
  )
  (func (export "as-call_indirect-param2") (result v128)
    (call_indirect (type $$sig)
      (v128.const i64x2 0 1) (v128.const i64x2 0 1) (v128.const i64x2 0 1) (i32.const 1)
    )
  )
  (func (export "as-block-retval2") (result v128)
    (block (result v128) (v128.const i64x2 0 1))
  )
  (func (export "as-loop-retval2") (result v128)
    (loop (result v128) (v128.const i64x2 0 1))
  )
  (func (export "as-drop-operand2")
    (drop (v128.const i64x2 0 1))
  )
)`);

// ./test/core/simd/simd_const.wast:971
assert_return(
  () => invoke($301, `as-br-retval`, []),
  [i32x4([0x3020100, 0x7060504, 0xb0a0908, 0xf0e0d0c])],
);

// ./test/core/simd/simd_const.wast:972
assert_return(() => invoke($301, `as-br_if-retval`, []), [i32x4([0x0, 0x1, 0x2, 0x3])]);

// ./test/core/simd/simd_const.wast:973
assert_return(() => invoke($301, `as-return-retval`, []), [i32x4([0x0, 0x1, 0x2, 0x3])]);

// ./test/core/simd/simd_const.wast:974
assert_return(() => invoke($301, `as-if-then-retval`, []), [i32x4([0x0, 0x1, 0x2, 0x3])]);

// ./test/core/simd/simd_const.wast:975
assert_return(() => invoke($301, `as-if-else-retval`, []), [i32x4([0x3, 0x2, 0x1, 0x0])]);

// ./test/core/simd/simd_const.wast:976
assert_return(() => invoke($301, `as-call-param`, []), [i32x4([0x0, 0x1, 0x2, 0x3])]);

// ./test/core/simd/simd_const.wast:977
assert_return(() => invoke($301, `as-call_indirect-param`, []), [i32x4([0x0, 0x1, 0x2, 0x3])]);

// ./test/core/simd/simd_const.wast:978
assert_return(() => invoke($301, `as-block-retval`, []), [i32x4([0x0, 0x1, 0x2, 0x3])]);

// ./test/core/simd/simd_const.wast:979
assert_return(() => invoke($301, `as-loop-retval`, []), [i32x4([0x0, 0x1, 0x2, 0x3])]);

// ./test/core/simd/simd_const.wast:980
assert_return(() => invoke($301, `as-drop-operand`, []), []);

// ./test/core/simd/simd_const.wast:982
assert_return(() => invoke($301, `as-br-retval2`, []), [i64x2([0x302010007060504n, 0xb0a09080f0e0d0cn])]);

// ./test/core/simd/simd_const.wast:983
assert_return(() => invoke($301, `as-br_if-retval2`, []), [i64x2([0x0n, 0x1n])]);

// ./test/core/simd/simd_const.wast:984
assert_return(() => invoke($301, `as-return-retval2`, []), [i64x2([0x0n, 0x1n])]);

// ./test/core/simd/simd_const.wast:985
assert_return(() => invoke($301, `as-if-then-retval2`, []), [i64x2([0x0n, 0x1n])]);

// ./test/core/simd/simd_const.wast:986
assert_return(() => invoke($301, `as-if-else-retval2`, []), [i64x2([0x1n, 0x0n])]);

// ./test/core/simd/simd_const.wast:987
assert_return(() => invoke($301, `as-call-param2`, []), [i64x2([0x0n, 0x1n])]);

// ./test/core/simd/simd_const.wast:988
assert_return(() => invoke($301, `as-call_indirect-param2`, []), [i64x2([0x0n, 0x1n])]);

// ./test/core/simd/simd_const.wast:989
assert_return(() => invoke($301, `as-block-retval2`, []), [i64x2([0x0n, 0x1n])]);

// ./test/core/simd/simd_const.wast:990
assert_return(() => invoke($301, `as-loop-retval2`, []), [i64x2([0x0n, 0x1n])]);

// ./test/core/simd/simd_const.wast:991
assert_return(() => invoke($301, `as-drop-operand2`, []), []);

// ./test/core/simd/simd_const.wast:995
let $302 = instantiate(`(module (memory 1)
  (func (export "as-local.set/get-value_0_0") (param $$0 v128) (result v128)
    (local v128 v128 v128 v128)
    (local.set 0 (local.get $$0))
    (local.get 0)
  )
  (func (export "as-local.set/get-value_0_1") (param $$0 v128) (result v128)
    (local v128 v128 v128 v128)
    (local.set 0 (local.get $$0))
    (local.set 1 (local.get 0))
    (local.set 2 (local.get 1))
    (local.set 3 (local.get 2))
    (local.get 0)
  )
  (func (export "as-local.set/get-value_3_0") (param $$0 v128) (result v128)
    (local v128 v128 v128 v128)
    (local.set 0 (local.get $$0))
    (local.set 1 (local.get 0))
    (local.set 2 (local.get 1))
    (local.set 3 (local.get 2))
    (local.get 3)
  )
  (func (export "as-local.tee-value") (result v128)
    (local v128)
    (local.tee 0 (v128.const i32x4 0 1 2 3))
  )
)`);

// ./test/core/simd/simd_const.wast:1023
assert_return(
  () => invoke($302, `as-local.set/get-value_0_0`, [i32x4([0x0, 0x0, 0x0, 0x0])]),
  [i32x4([0x0, 0x0, 0x0, 0x0])],
);

// ./test/core/simd/simd_const.wast:1024
assert_return(
  () => invoke($302, `as-local.set/get-value_0_1`, [i32x4([0x1, 0x1, 0x1, 0x1])]),
  [i32x4([0x1, 0x1, 0x1, 0x1])],
);

// ./test/core/simd/simd_const.wast:1025
assert_return(
  () => invoke($302, `as-local.set/get-value_3_0`, [i32x4([0x2, 0x2, 0x2, 0x2])]),
  [i32x4([0x2, 0x2, 0x2, 0x2])],
);

// ./test/core/simd/simd_const.wast:1026
assert_return(() => invoke($302, `as-local.tee-value`, []), [i32x4([0x0, 0x1, 0x2, 0x3])]);

// ./test/core/simd/simd_const.wast:1031
let $303 = instantiate(`(module (memory 1)
  (global $$g0 (mut v128) (v128.const i32x4 0 1 2 3))
  (global $$g1 (mut v128) (v128.const i32x4 4 5 6 7))
  (global $$g2 (mut v128) (v128.const i32x4 8 9 10 11))
  (global $$g3 (mut v128) (v128.const i32x4 12 13 14 15))
  (global $$g4 (mut v128) (v128.const i32x4 16 17 18 19))

  (func $$set_g0 (export "as-global.set_value_$$g0") (param $$0 v128)
    (global.set $$g0 (local.get $$0))
  )
  (func $$set_g1_g2 (export "as-global.set_value_$$g1_$$g2") (param $$0 v128) (param $$1 v128)
    (global.set $$g1 (local.get $$0))
    (global.set $$g2 (local.get $$1))
  )
  (func $$set_g0_g1_g2_g3 (export "as-global.set_value_$$g0_$$g1_$$g2_$$g3") (param $$0 v128) (param $$1 v128) (param $$2 v128) (param $$3 v128)
    (call $$set_g0 (local.get $$0))
    (call $$set_g1_g2 (local.get $$1) (local.get $$2))
    (global.set $$g3 (local.get $$3))
  )
  (func (export "global.get_g0") (result v128)
    (global.get $$g0)
  )
  (func (export "global.get_g1") (result v128)
    (global.get $$g1)
  )
  (func (export "global.get_g2") (result v128)
    (global.get $$g2)
  )
  (func (export "global.get_g3") (result v128)
    (global.get $$g3)
  )
)`);

// ./test/core/simd/simd_const.wast:1064
assert_return(
  () => invoke($303, `as-global.set_value_$$g0_$$g1_$$g2_$$g3`, [
    i32x4([0x1, 0x1, 0x1, 0x1]),
    i32x4([0x2, 0x2, 0x2, 0x2]),
    i32x4([0x3, 0x3, 0x3, 0x3]),
    i32x4([0x4, 0x4, 0x4, 0x4]),
  ]),
  [],
);

// ./test/core/simd/simd_const.wast:1068
assert_return(() => invoke($303, `global.get_g0`, []), [i32x4([0x1, 0x1, 0x1, 0x1])]);

// ./test/core/simd/simd_const.wast:1069
assert_return(() => invoke($303, `global.get_g1`, []), [i32x4([0x2, 0x2, 0x2, 0x2])]);

// ./test/core/simd/simd_const.wast:1070
assert_return(() => invoke($303, `global.get_g2`, []), [i32x4([0x3, 0x3, 0x3, 0x3])]);

// ./test/core/simd/simd_const.wast:1071
assert_return(() => invoke($303, `global.get_g3`, []), [i32x4([0x4, 0x4, 0x4, 0x4])]);

// ./test/core/simd/simd_const.wast:1076
let $304 = instantiate(`(module
  (func (export "i32x4.test") (result v128) (return (v128.const i32x4 0x0bAdD00D 0x0bAdD00D 0x0bAdD00D 0x0bAdD00D)))
  (func (export "i32x4.smax") (result v128) (return (v128.const i32x4 0x7fffffff 0x7fffffff 0x7fffffff 0x7fffffff)))
  (func (export "i32x4.neg_smax") (result v128) (return (v128.const i32x4 -0x7fffffff -0x7fffffff -0x7fffffff -0x7fffffff)))
  (func (export "i32x4.inc_smin") (result v128) (return (i32x4.add (v128.const i32x4 -0x80000000 -0x80000000 -0x80000000 -0x80000000) (v128.const i32x4 1 1 1 1))))
  (func (export "i32x4.neg_zero") (result v128) (return (v128.const i32x4 -0x0 -0x0 -0x0 -0x0)))
  (func (export "i32x4.not_octal") (result v128) (return (v128.const i32x4 010 010 010 010)))
  (func (export "i32x4.plus_sign") (result v128) (return (v128.const i32x4 +42 +42 +42 +42)))

  (func (export "i32x4-dec-sep1") (result v128) (v128.const i32x4 1_000_000 1_000_000 1_000_000 1_000_000))
  (func (export "i32x4-dec-sep2") (result v128) (v128.const i32x4 1_0_0_0 1_0_0_0 1_0_0_0 1_0_0_0))
  (func (export "i32x4-hex-sep1") (result v128) (v128.const i32x4 0xa_0f_00_99 0xa_0f_00_99 0xa_0f_00_99 0xa_0f_00_99))
  (func (export "i32x4-hex-sep2") (result v128) (v128.const i32x4 0x1_a_A_0_f 0x1_a_A_0_f 0x1_a_A_0_f 0x1_a_A_0_f))

  (func (export "i64x2.test") (result v128) (return (v128.const i64x2 0x0bAdD00D0bAdD00D 0x0bAdD00D0bAdD00D)))
  (func (export "i64x2.smax") (result v128) (return (v128.const i64x2 0x7fffffffffffffff 0x7fffffffffffffff)))
  (func (export "i64x2.neg_smax") (result v128) (return (v128.const i64x2 -0x7fffffffffffffff -0x7fffffffffffffff)))
  (func (export "i64x2.inc_smin") (result v128) (return (i64x2.add (v128.const i64x2 -0x8000000000000000 -0x8000000000000000) (v128.const i64x2 1 1))))
  (func (export "i64x2.neg_zero") (result v128) (return (v128.const i64x2 -0x0 -0x0)))
  (func (export "i64x2.not_octal") (result v128) (return (v128.const i64x2 010010 010010)))
  (func (export "i64x2.plus_sign") (result v128) (return (v128.const i64x2 +42 +42)))

  (func (export "i64x2-dec-sep1") (result v128) (v128.const i64x2 10_000_000_000_000 10_000_000_000_000))
  (func (export "i64x2-dec-sep2") (result v128) (v128.const i64x2 1_0_0_0_0_0_0_0 1_0_0_0_0_0_0_0))
  (func (export "i64x2-hex-sep1") (result v128) (v128.const i64x2 0xa_0f_00_99_0a_0f_00_99 0xa_0f_00_99_0a_0f_00_99))
  (func (export "i64x2-hex-sep2") (result v128) (v128.const i64x2 0x1_a_A_0_f_1_a_A_0_f 0x1_a_A_0_f_1_a_A_0_f))
)`);

// ./test/core/simd/simd_const.wast:1104
assert_return(() => invoke($304, `i32x4.test`, []), [i32x4([0xbadd00d, 0xbadd00d, 0xbadd00d, 0xbadd00d])]);

// ./test/core/simd/simd_const.wast:1105
assert_return(
  () => invoke($304, `i32x4.smax`, []),
  [i32x4([0x7fffffff, 0x7fffffff, 0x7fffffff, 0x7fffffff])],
);

// ./test/core/simd/simd_const.wast:1106
assert_return(
  () => invoke($304, `i32x4.neg_smax`, []),
  [i32x4([0x80000001, 0x80000001, 0x80000001, 0x80000001])],
);

// ./test/core/simd/simd_const.wast:1107
assert_return(
  () => invoke($304, `i32x4.inc_smin`, []),
  [i32x4([0x80000001, 0x80000001, 0x80000001, 0x80000001])],
);

// ./test/core/simd/simd_const.wast:1108
assert_return(() => invoke($304, `i32x4.neg_zero`, []), [i32x4([0x0, 0x0, 0x0, 0x0])]);

// ./test/core/simd/simd_const.wast:1109
assert_return(() => invoke($304, `i32x4.not_octal`, []), [i32x4([0xa, 0xa, 0xa, 0xa])]);

// ./test/core/simd/simd_const.wast:1110
assert_return(() => invoke($304, `i32x4.plus_sign`, []), [i32x4([0x2a, 0x2a, 0x2a, 0x2a])]);

// ./test/core/simd/simd_const.wast:1112
assert_return(() => invoke($304, `i32x4-dec-sep1`, []), [i32x4([0xf4240, 0xf4240, 0xf4240, 0xf4240])]);

// ./test/core/simd/simd_const.wast:1113
assert_return(() => invoke($304, `i32x4-dec-sep2`, []), [i32x4([0x3e8, 0x3e8, 0x3e8, 0x3e8])]);

// ./test/core/simd/simd_const.wast:1114
assert_return(
  () => invoke($304, `i32x4-hex-sep1`, []),
  [i32x4([0xa0f0099, 0xa0f0099, 0xa0f0099, 0xa0f0099])],
);

// ./test/core/simd/simd_const.wast:1115
assert_return(() => invoke($304, `i32x4-hex-sep2`, []), [i32x4([0x1aa0f, 0x1aa0f, 0x1aa0f, 0x1aa0f])]);

// ./test/core/simd/simd_const.wast:1117
assert_return(() => invoke($304, `i64x2.test`, []), [i64x2([0xbadd00d0badd00dn, 0xbadd00d0badd00dn])]);

// ./test/core/simd/simd_const.wast:1118
assert_return(() => invoke($304, `i64x2.smax`, []), [i64x2([0x7fffffffffffffffn, 0x7fffffffffffffffn])]);

// ./test/core/simd/simd_const.wast:1119
assert_return(
  () => invoke($304, `i64x2.neg_smax`, []),
  [i64x2([0x8000000000000001n, 0x8000000000000001n])],
);

// ./test/core/simd/simd_const.wast:1120
assert_return(
  () => invoke($304, `i64x2.inc_smin`, []),
  [i64x2([0x8000000000000001n, 0x8000000000000001n])],
);

// ./test/core/simd/simd_const.wast:1121
assert_return(() => invoke($304, `i64x2.neg_zero`, []), [i64x2([0x0n, 0x0n])]);

// ./test/core/simd/simd_const.wast:1122
assert_return(() => invoke($304, `i64x2.not_octal`, []), [i64x2([0x271an, 0x271an])]);

// ./test/core/simd/simd_const.wast:1123
assert_return(() => invoke($304, `i64x2.plus_sign`, []), [i64x2([0x2an, 0x2an])]);

// ./test/core/simd/simd_const.wast:1125
assert_return(() => invoke($304, `i64x2-dec-sep1`, []), [i64x2([0x9184e72a000n, 0x9184e72a000n])]);

// ./test/core/simd/simd_const.wast:1126
assert_return(() => invoke($304, `i64x2-dec-sep2`, []), [i64x2([0x989680n, 0x989680n])]);

// ./test/core/simd/simd_const.wast:1127
assert_return(() => invoke($304, `i64x2-hex-sep1`, []), [i64x2([0xa0f00990a0f0099n, 0xa0f00990a0f0099n])]);

// ./test/core/simd/simd_const.wast:1128
assert_return(() => invoke($304, `i64x2-hex-sep2`, []), [i64x2([0x1aa0f1aa0fn, 0x1aa0f1aa0fn])]);

// ./test/core/simd/simd_const.wast:1130
assert_malformed(
  () => instantiate(`(global v128 (v128.const i32x4 _100 _100 _100 _100)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1134
assert_malformed(
  () => instantiate(`(global v128 (v128.const i32x4 +_100 +_100 +_100 +_100)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1138
assert_malformed(
  () => instantiate(`(global v128 (v128.const i32x4 -_100 -_100 -_100 -_100)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1142
assert_malformed(
  () => instantiate(`(global v128 (v128.const i32x4 99_ 99_ 99_ 99_)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1146
assert_malformed(
  () => instantiate(`(global v128 (v128.const i32x4 1__000 1__000 1__000 1__000)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1150
assert_malformed(
  () => instantiate(`(global v128 (v128.const i32x4 _0x100 _0x100 _0x100 _0x100)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1154
assert_malformed(
  () => instantiate(`(global v128 (v128.const i32x4 0_x100 0_x100 0_x100 0_x100)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1158
assert_malformed(
  () => instantiate(`(global v128 (v128.const i32x4 0x_100 0x_100 0x_100 0x_100)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1162
assert_malformed(
  () => instantiate(`(global v128 (v128.const i32x4 0x00_ 0x00_ 0x00_ 0x00_)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1166
assert_malformed(
  () => instantiate(`(global v128 (v128.const i32x4 0xff__ffff 0xff__ffff 0xff__ffff 0xff__ffff)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1171
assert_malformed(
  () => instantiate(`(global v128 (v128.const i64x2 _100_100 _100_100)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1175
assert_malformed(
  () => instantiate(`(global v128 (v128.const i64x2 +_100_100 +_100_100)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1179
assert_malformed(
  () => instantiate(`(global v128 (v128.const i64x2 -_100_100 -_100_100)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1183
assert_malformed(
  () => instantiate(`(global v128 (v128.const i64x2 99_99_ 99_99_)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1187
assert_malformed(
  () => instantiate(`(global v128 (v128.const i64x2 1__000_000 1__000_000)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1191
assert_malformed(
  () => instantiate(`(global v128 (v128.const i64x2 _0x100000 _0x100000)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1195
assert_malformed(
  () => instantiate(`(global v128 (v128.const i64x2 0_x100000 0_x100000)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1199
assert_malformed(
  () => instantiate(`(global v128 (v128.const i64x2 0x_100000 0x_100000)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1203
assert_malformed(
  () => instantiate(`(global v128 (v128.const i64x2 0x00_ 0x00_)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1207
assert_malformed(
  () => instantiate(`(global v128 (v128.const i64x2 0xff__ffff_ffff_ffff 0xff__ffff_ffff_ffff)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1214
let $305 = instantiate(`(module
  (func (export "f32-dec-sep1") (result v128) (v128.const f32x4 1_000_000 1_000_000 1_000_000 1_000_000))
  (func (export "f32-dec-sep2") (result v128) (v128.const f32x4 1_0_0_0 1_0_0_0 1_0_0_0 1_0_0_0))
  (func (export "f32-dec-sep3") (result v128) (v128.const f32x4 100_3.141_592 100_3.141_592 100_3.141_592 100_3.141_592))
  (func (export "f32-dec-sep4") (result v128) (v128.const f32x4 99e+1_3 99e+1_3 99e+1_3 99e+1_3))
  (func (export "f32-dec-sep5") (result v128) (v128.const f32x4 122_000.11_3_54E0_2_3 122_000.11_3_54E0_2_3 122_000.11_3_54E0_2_3 122_000.11_3_54E0_2_3))
  (func (export "f32-hex-sep1") (result v128) (v128.const f32x4 0xa_0f_00_99 0xa_0f_00_99 0xa_0f_00_99 0xa_0f_00_99))
  (func (export "f32-hex-sep2") (result v128) (v128.const f32x4 0x1_a_A_0_f 0x1_a_A_0_f 0x1_a_A_0_f 0x1_a_A_0_f))
  (func (export "f32-hex-sep3") (result v128) (v128.const f32x4 0xa0_ff.f141_a59a 0xa0_ff.f141_a59a 0xa0_ff.f141_a59a 0xa0_ff.f141_a59a))
  (func (export "f32-hex-sep4") (result v128) (v128.const f32x4 0xf0P+1_3 0xf0P+1_3 0xf0P+1_3 0xf0P+1_3))
  (func (export "f32-hex-sep5") (result v128) (v128.const f32x4 0x2a_f00a.1f_3_eep2_3 0x2a_f00a.1f_3_eep2_3 0x2a_f00a.1f_3_eep2_3 0x2a_f00a.1f_3_eep2_3))
  (func (export "f64-dec-sep1") (result v128) (v128.const f64x2 1_000_000 1_000_000))
  (func (export "f64-dec-sep2") (result v128) (v128.const f64x2 1_0_0_0 1_0_0_0))
  (func (export "f64-dec-sep3") (result v128) (v128.const f64x2 100_3.141_592 100_3.141_592))
  (func (export "f64-dec-sep4") (result v128) (v128.const f64x2 99e+1_3 99e+1_3))
  (func (export "f64-dec-sep5") (result v128) (v128.const f64x2 122_000.11_3_54E0_2_3 122_000.11_3_54E0_2_3))
  (func (export "f64-hex-sep1") (result v128) (v128.const f64x2 0xa_0f_00_99 0xa_0f_00_99))
  (func (export "f64-hex-sep2") (result v128) (v128.const f64x2 0x1_a_A_0_f 0x1_a_A_0_f))
  (func (export "f64-hex-sep3") (result v128) (v128.const f64x2 0xa0_ff.f141_a59a 0xa0_ff.f141_a59a))
  (func (export "f64-hex-sep4") (result v128) (v128.const f64x2 0xf0P+1_3 0xf0P+1_3))
  (func (export "f64-hex-sep5") (result v128) (v128.const f64x2 0x2a_f00a.1f_3_eep2_3 0x2a_f00a.1f_3_eep2_3))
)`);

// ./test/core/simd/simd_const.wast:1237
assert_return(
  () => invoke($305, `f32-dec-sep1`, []),
  [
    new F32x4Pattern(
      value("f32", 1000000),
      value("f32", 1000000),
      value("f32", 1000000),
      value("f32", 1000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:1238
assert_return(
  () => invoke($305, `f32-dec-sep2`, []),
  [
    new F32x4Pattern(
      value("f32", 1000),
      value("f32", 1000),
      value("f32", 1000),
      value("f32", 1000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:1239
assert_return(
  () => invoke($305, `f32-dec-sep3`, []),
  [
    new F32x4Pattern(
      value("f32", 1003.1416),
      value("f32", 1003.1416),
      value("f32", 1003.1416),
      value("f32", 1003.1416),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:1240
assert_return(
  () => invoke($305, `f32-dec-sep4`, []),
  [
    new F32x4Pattern(
      value("f32", 990000000000000),
      value("f32", 990000000000000),
      value("f32", 990000000000000),
      value("f32", 990000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:1241
assert_return(
  () => invoke($305, `f32-dec-sep5`, []),
  [
    new F32x4Pattern(
      value("f32", 12200012000000000000000000000),
      value("f32", 12200012000000000000000000000),
      value("f32", 12200012000000000000000000000),
      value("f32", 12200012000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:1242
assert_return(
  () => invoke($305, `f32-hex-sep1`, []),
  [
    new F32x4Pattern(
      value("f32", 168755360),
      value("f32", 168755360),
      value("f32", 168755360),
      value("f32", 168755360),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:1243
assert_return(
  () => invoke($305, `f32-hex-sep2`, []),
  [
    new F32x4Pattern(
      value("f32", 109071),
      value("f32", 109071),
      value("f32", 109071),
      value("f32", 109071),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:1244
assert_return(
  () => invoke($305, `f32-hex-sep3`, []),
  [
    new F32x4Pattern(
      value("f32", 41215.94),
      value("f32", 41215.94),
      value("f32", 41215.94),
      value("f32", 41215.94),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:1245
assert_return(
  () => invoke($305, `f32-hex-sep4`, []),
  [
    new F32x4Pattern(
      value("f32", 1966080),
      value("f32", 1966080),
      value("f32", 1966080),
      value("f32", 1966080),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:1246
assert_return(
  () => invoke($305, `f32-hex-sep5`, []),
  [
    new F32x4Pattern(
      value("f32", 23605224000000),
      value("f32", 23605224000000),
      value("f32", 23605224000000),
      value("f32", 23605224000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:1247
assert_return(
  () => invoke($305, `f64-dec-sep1`, []),
  [new F64x2Pattern(value("f64", 1000000), value("f64", 1000000))],
);

// ./test/core/simd/simd_const.wast:1248
assert_return(
  () => invoke($305, `f64-dec-sep2`, []),
  [new F64x2Pattern(value("f64", 1000), value("f64", 1000))],
);

// ./test/core/simd/simd_const.wast:1249
assert_return(
  () => invoke($305, `f64-dec-sep3`, []),
  [new F64x2Pattern(value("f64", 1003.141592), value("f64", 1003.141592))],
);

// ./test/core/simd/simd_const.wast:1250
assert_return(
  () => invoke($305, `f64-dec-sep4`, []),
  [
    new F64x2Pattern(value("f64", 990000000000000), value("f64", 990000000000000)),
  ],
);

// ./test/core/simd/simd_const.wast:1251
assert_return(
  () => invoke($305, `f64-dec-sep5`, []),
  [
    new F64x2Pattern(
      value("f64", 12200011354000000000000000000),
      value("f64", 12200011354000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:1252
assert_return(
  () => invoke($305, `f64-hex-sep1`, []),
  [new F64x2Pattern(value("f64", 168755353), value("f64", 168755353))],
);

// ./test/core/simd/simd_const.wast:1253
assert_return(
  () => invoke($305, `f64-hex-sep2`, []),
  [new F64x2Pattern(value("f64", 109071), value("f64", 109071))],
);

// ./test/core/simd/simd_const.wast:1254
assert_return(
  () => invoke($305, `f64-hex-sep3`, []),
  [
    new F64x2Pattern(
      value("f64", 41215.94240794191),
      value("f64", 41215.94240794191),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:1255
assert_return(
  () => invoke($305, `f64-hex-sep4`, []),
  [new F64x2Pattern(value("f64", 1966080), value("f64", 1966080))],
);

// ./test/core/simd/simd_const.wast:1256
assert_return(
  () => invoke($305, `f64-hex-sep5`, []),
  [new F64x2Pattern(value("f64", 23605225168752), value("f64", 23605225168752))],
);

// ./test/core/simd/simd_const.wast:1258
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 _100 _100 _100 _100)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1262
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 +_100 +_100 +_100 +_100)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1266
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 -_100 -_100 -_100 -_100)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1270
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 99_ 99_ 99_ 99_)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1274
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 1__000 1__000 1__000 1__000)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1278
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 _1.0 _1.0 _1.0 _1.0)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1282
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 1.0_ 1.0_ 1.0_ 1.0_)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1286
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 1_.0 1_.0 1_.0 1_.0)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1290
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 1._0 1._0 1._0 1._0)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1294
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 _1e1 _1e1 _1e1 _1e1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1298
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 1e1_ 1e1_ 1e1_ 1e1_)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1302
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 1_e1 1_e1 1_e1 1_e1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1306
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 1e_1 1e_1 1e_1 1e_1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1310
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 _1.0e1 _1.0e1 _1.0e1 _1.0e1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1314
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 1.0e1_ 1.0e1_ 1.0e1_ 1.0e1_)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1318
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 1.0_e1 1.0_e1 1.0_e1 1.0_e1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1322
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 1.0e_1 1.0e_1 1.0e_1 1.0e_1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1326
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 1.0e+_1 1.0e+_1 1.0e+_1 1.0e+_1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1330
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 1.0e_+1 1.0e_+1 1.0e_+1 1.0e_+1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1334
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 _0x100 _0x100 _0x100 _0x100)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1338
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 0_x100 0_x100 0_x100 0_x100)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1342
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 0x_100 0x_100 0x_100 0x_100)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1346
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 0x00_ 0x00_ 0x00_ 0x00_)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1350
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 0xff__ffff 0xff__ffff 0xff__ffff 0xff__ffff)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1354
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 0x_1.0 0x_1.0 0x_1.0 0x_1.0)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1358
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 0x1.0_ 0x1.0_ 0x1.0_ 0x1.0_)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1362
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 0x1_.0 0x1_.0 0x1_.0 0x1_.0)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1366
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 0x1._0 0x1._0 0x1._0 0x1._0)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1370
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 0x_1p1 0x_1p1 0x_1p1 0x_1p1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1374
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 0x1p1_ 0x1p1_ 0x1p1_ 0x1p1_)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1378
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 0x1_p1 0x1_p1 0x1_p1 0x1_p1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1382
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 0x1p_1 0x1p_1 0x1p_1 0x1p_1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1386
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 0x_1.0p1 0x_1.0p1 0x_1.0p1 0x_1.0p1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1390
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 0x1.0p1_ 0x1.0p1_ 0x1.0p1_ 0x1.0p1_)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1394
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 0x1.0_p1 0x1.0_p1 0x1.0_p1 0x1.0_p1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1398
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 0x1.0p_1 0x1.0p_1 0x1.0p_1 0x1.0p_1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1402
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 0x1.0p+_1 0x1.0p+_1 0x1.0p+_1 0x1.0p+_1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1406
assert_malformed(
  () => instantiate(`(global v128 (v128.const f32x4 0x1.0p_+1 0x1.0p_+1 0x1.0p_+1 0x1.0p_+1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1411
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 _100 _100)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1415
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 +_100 +_100)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1419
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 -_100 -_100)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1423
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 99_ 99_)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1427
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 1__000 1__000)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1431
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 _1.0 _1.0)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1435
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 1.0_ 1.0_)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1439
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 1_.0 1_.0)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1443
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 1._0 1._0)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1447
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 _1e1 _1e1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1451
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 1e1_ 1e1_)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1455
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 1_e1 1_e1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1459
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 1e_1 1e_1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1463
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 _1.0e1 _1.0e1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1467
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 1.0e1_ 1.0e1_)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1471
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 1.0_e1 1.0_e1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1475
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 1.0e_1 1.0e_1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1479
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 1.0e+_1 1.0e+_1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1483
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 1.0e_+1 1.0e_+1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1487
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 _0x100 _0x100)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1491
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 0_x100 0_x100)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1495
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 0x_100 0x_100)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1499
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 0x00_ 0x00_)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1503
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 0xff__ffff 0xff__ffff)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1507
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 0x_1.0 0x_1.0)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1511
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 0x1.0_ 0x1.0_)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1515
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 0x1_.0 0x1_.0)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1519
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 0x1._0 0x1._0)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1523
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 0x_1p1 0x_1p1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1527
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 0x1p1_ 0x1p1_)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1531
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 0x1_p1 0x1_p1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1535
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 0x1p_1 0x1p_1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1539
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 0x_1.0p1 0x_1.0p1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1543
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 0x1.0p1_ 0x1.0p1_)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1547
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 0x1.0_p1 0x1.0_p1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1551
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 0x1.0p_1 0x1.0p_1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1555
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 0x1.0p+_1 0x1.0p+_1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1559
assert_malformed(
  () => instantiate(`(global v128 (v128.const f64x2 0x1.0p_+1 0x1.0p_+1)) `),
  `unknown operator`,
);

// ./test/core/simd/simd_const.wast:1566
let $306 = instantiate(`(module binary
  "\\00asm" "\\01\\00\\00\\00"
  "\\01\\05\\01"                                ;; type   section
  "\\60\\00\\01\\7b"                             ;; type 0 (func)
  "\\03\\02\\01\\00"                             ;; func   section
  "\\07\\0f\\01\\0b"                             ;; export section
  "\\70\\61\\72\\73\\65\\5f\\69\\38\\78\\31\\36\\00\\00"  ;; export name (parse_i8x16)
  "\\0a\\16\\01"                                ;; code   section
  "\\14\\00\\fd\\0c"                             ;; func body
  "\\00\\00\\00\\00"                             ;; data lane 0~3   (0,    0,    0,    0)
  "\\80\\80\\80\\80"                             ;; data lane 4~7   (-128, -128, -128, -128)
  "\\ff\\ff\\ff\\ff"                             ;; data lane 8~11  (0xff, 0xff, 0xff, 0xff)
  "\\ff\\ff\\ff\\ff"                             ;; data lane 12~15 (255,  255,  255,  255)
  "\\0b"                                      ;; end
)`);

// ./test/core/simd/simd_const.wast:1581
assert_return(
  () => invoke($306, `parse_i8x16`, []),
  [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x80, 0x80, 0x80, 0x80, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]),
  ],
);

// ./test/core/simd/simd_const.wast:1583
let $307 = instantiate(`(module binary
  "\\00asm" "\\01\\00\\00\\00"
  "\\01\\05\\01"                                ;; type   section
  "\\60\\00\\01\\7b"                             ;; type 0 (func)
  "\\03\\02\\01\\00"                             ;; func   section
  "\\07\\0f\\01\\0b"                             ;; export section
  "\\70\\61\\72\\73\\65\\5f\\69\\31\\36\\78\\38\\00\\00"  ;; export name (parse_i16x8)
  "\\0a\\16\\01"                                ;; code   section
  "\\14\\00\\fd\\0c"                             ;; func body
  "\\00\\00\\00\\00"                             ;; data lane 0, 1 (0,      0)
  "\\00\\80\\00\\80"                             ;; data lane 2, 3 (-32768, -32768)
  "\\ff\\ff\\ff\\ff"                             ;; data lane 4, 5 (65535,  65535)
  "\\ff\\ff\\ff\\ff"                             ;; data lane 6, 7 (0xffff, 0xffff)
  "\\0b"                                      ;; end
)`);

// ./test/core/simd/simd_const.wast:1598
assert_return(
  () => invoke($307, `parse_i16x8`, []),
  [i16x8([0x0, 0x0, 0x8000, 0x8000, 0xffff, 0xffff, 0xffff, 0xffff])],
);

// ./test/core/simd/simd_const.wast:1600
let $308 = instantiate(`(module binary
  "\\00asm" "\\01\\00\\00\\00"
  "\\01\\05\\01"                                ;; type   section
  "\\60\\00\\01\\7b"                             ;; type 0 (func)
  "\\03\\02\\01\\00"                             ;; func   section
  "\\07\\0f\\01\\0b"                             ;; export section
  "\\70\\61\\72\\73\\65\\5f\\69\\33\\32\\78\\34\\00\\00"  ;; export name (parse_i32x4)
  "\\0a\\16\\01"                                ;; code   section
  "\\14\\00\\fd\\0c"                             ;; func body
  "\\d1\\ff\\ff\\ff"                             ;; data lane 0 (4294967249)
  "\\d1\\ff\\ff\\ff"                             ;; data lane 1 (4294967249)
  "\\d1\\ff\\ff\\ff"                             ;; data lane 2 (4294967249)
  "\\d1\\ff\\ff\\ff"                             ;; data lane 3 (4294967249)
  "\\0b"                                      ;; end
)`);

// ./test/core/simd/simd_const.wast:1615
assert_return(
  () => invoke($308, `parse_i32x4`, []),
  [i32x4([0xffffffd1, 0xffffffd1, 0xffffffd1, 0xffffffd1])],
);

// ./test/core/simd/simd_const.wast:1617
let $309 = instantiate(`(module binary
  "\\00asm" "\\01\\00\\00\\00"
  "\\01\\05\\01"                                ;; type   section
  "\\60\\00\\01\\7b"                             ;; type 0 (func)
  "\\03\\02\\01\\00"                             ;; func   section
  "\\07\\0f\\01\\0b"                             ;; export section
  "\\70\\61\\72\\73\\65\\5f\\69\\36\\34\\78\\32\\00\\00"  ;; export name (parse_i64x2)
  "\\0a\\16\\01"                                ;; code   section
  "\\14\\00\\fd\\0c"                             ;; func body
  "\\ff\\ff\\ff\\ff\\ff\\ff\\ff\\7f"                 ;; data lane 0 (9223372036854775807)
  "\\ff\\ff\\ff\\ff\\ff\\ff\\ff\\7f"                 ;; data lane 1 (9223372036854775807)
  "\\0b"                                      ;; end
)`);

// ./test/core/simd/simd_const.wast:1630
assert_return(() => invoke($309, `parse_i64x2`, []), [i64x2([0x7fffffffffffffffn, 0x7fffffffffffffffn])]);

// ./test/core/simd/simd_const.wast:1634
let $310 = instantiate(`(module binary
  "\\00asm" "\\01\\00\\00\\00"
  "\\01\\05\\01"                                ;; type   section
  "\\60\\00\\01\\7b"                             ;; type 0 (func)
  "\\03\\02\\01\\00"                             ;; func   section
  "\\07\\0f\\01\\0b"                             ;; export section
  "\\70\\61\\72\\73\\65\\5f\\66\\33\\32\\78\\34\\00\\00"  ;; export name (parse_f32x4)
  "\\0a\\16\\01"                                ;; code   section
  "\\14\\00\\fd\\0c"                             ;; func body
  "\\00\\00\\80\\4f"                             ;; data lane 0 (4294967249)
  "\\00\\00\\80\\4f"                             ;; data lane 1 (4294967249)
  "\\00\\00\\80\\4f"                             ;; data lane 2 (4294967249)
  "\\00\\00\\80\\4f"                             ;; data lane 3 (4294967249)
  "\\0b"                                      ;; end
)`);

// ./test/core/simd/simd_const.wast:1649
assert_return(
  () => invoke($310, `parse_f32x4`, []),
  [
    new F32x4Pattern(
      value("f32", 4294967300),
      value("f32", 4294967300),
      value("f32", 4294967300),
      value("f32", 4294967300),
    ),
  ],
);

// ./test/core/simd/simd_const.wast:1651
let $311 = instantiate(`(module binary
  "\\00asm" "\\01\\00\\00\\00"
  "\\01\\05\\01"                                ;; type   section
  "\\60\\00\\01\\7b"                             ;; type 0 (func)
  "\\03\\02\\01\\00"                             ;; func   section
  "\\07\\0f\\01\\0b"                             ;; export section
  "\\70\\61\\72\\73\\65\\5f\\66\\36\\34\\78\\32\\00\\00"  ;; export name (parse_f64x2)
  "\\0a\\16\\01"                                ;; code   section
  "\\14\\00\\fd\\0c"                             ;; func body
  "\\ff\\ff\\ff\\ff\\ff\\ff\\ef\\7f"                 ;; data lane 0 (0x1.fffffffffffffp+1023)
  "\\ff\\ff\\ff\\ff\\ff\\ff\\ef\\7f"                 ;; data lane 1 (0x1.fffffffffffffp+1023)
  "\\0b"                                      ;; end
)`);

// ./test/core/simd/simd_const.wast:1664
assert_return(
  () => invoke($311, `parse_f64x2`, []),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);
