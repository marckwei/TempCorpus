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

// ./test/core/simd/simd_f32x4.wast

// ./test/core/simd/simd_f32x4.wast:4
let $0 = instantiate(`(module
  (func (export "f32x4.min") (param v128 v128) (result v128) (f32x4.min (local.get 0) (local.get 1)))
  (func (export "f32x4.max") (param v128 v128) (result v128) (f32x4.max (local.get 0) (local.get 1)))
  (func (export "f32x4.abs") (param v128) (result v128) (f32x4.abs (local.get 0)))
  ;; f32x4.min const vs const
  (func (export "f32x4.min_with_const_0") (result v128) (f32x4.min (v128.const f32x4 0 1 2 -3) (v128.const f32x4 0 2 1 3)))
  (func (export "f32x4.min_with_const_1") (result v128) (f32x4.min (v128.const f32x4 0 1 2 3) (v128.const f32x4 0 1 2 3)))
  (func (export "f32x4.min_with_const_2") (result v128) (f32x4.min (v128.const f32x4 0x00 0x01 0x02 0x80000000) (v128.const f32x4 0x00 0x02 0x01 2147483648)))
  (func (export "f32x4.min_with_const_3") (result v128) (f32x4.min (v128.const f32x4 0x00 0x01 0x02 0x80000000) (v128.const f32x4 0x00 0x01 0x02 0x80000000)))
  ;; f32x4.min param vs const
  (func (export "f32x4.min_with_const_5")(param v128) (result v128) (f32x4.min (local.get 0) (v128.const f32x4 0 1 2 -3)))
  (func (export "f32x4.min_with_const_6")(param v128) (result v128) (f32x4.min (v128.const f32x4 0 1 2 3) (local.get 0)))
  (func (export "f32x4.min_with_const_7")(param v128) (result v128) (f32x4.min (v128.const f32x4 0x00 0x01 0x02 0x80000000) (local.get 0)))
  (func (export "f32x4.min_with_const_8")(param v128) (result v128) (f32x4.min (local.get 0) (v128.const f32x4 0x00 0x01 0x02 0x80000000)))
  ;; f32x4.max const vs const
  (func (export "f32x4.max_with_const_10") (result v128) (f32x4.max (v128.const f32x4 0 1 2 -3) (v128.const f32x4 0 2 1 3)))
  (func (export "f32x4.max_with_const_11") (result v128) (f32x4.max (v128.const f32x4 0 1 2 3) (v128.const f32x4 0 1 2 3)))
  (func (export "f32x4.max_with_const_12") (result v128) (f32x4.max (v128.const f32x4 0x00 0x01 0x02 0x80000000) (v128.const f32x4 0x00 0x02 0x01 2147483648)))
  (func (export "f32x4.max_with_const_13") (result v128) (f32x4.max (v128.const f32x4 0x00 0x01 0x02 0x80000000) (v128.const f32x4 0x00 0x01 0x02 0x80000000)))
  ;; f32x4.max param vs const
  (func (export "f32x4.max_with_const_15")(param v128) (result v128) (f32x4.max (local.get 0) (v128.const f32x4 0 1 2 -3)))
  (func (export "f32x4.max_with_const_16")(param v128) (result v128) (f32x4.max (v128.const f32x4 0 1 2 3) (local.get 0)))
  (func (export "f32x4.max_with_const_17")(param v128) (result v128) (f32x4.max (v128.const f32x4 0x00 0x01 0x02 0x80000000) (local.get 0)))
  (func (export "f32x4.max_with_const_18")(param v128) (result v128) (f32x4.max (local.get 0) (v128.const f32x4 0x00 0x01 0x02 0x80000000)))

  (func (export "f32x4.abs_with_const") (result v128) (f32x4.abs (v128.const f32x4 -0 -1 -2 -3)))
)`);

// ./test/core/simd/simd_f32x4.wast:33
assert_return(
  () => invoke($0, `f32x4.min_with_const_0`, []),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 1),
      value("f32", 1),
      value("f32", -3),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:34
assert_return(
  () => invoke($0, `f32x4.min_with_const_1`, []),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 1),
      value("f32", 2),
      value("f32", 3),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:35
assert_return(
  () => invoke($0, `f32x4.min_with_const_2`, []),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 1),
      value("f32", 1),
      value("f32", 2147483600),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:36
assert_return(
  () => invoke($0, `f32x4.min_with_const_3`, []),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 1),
      value("f32", 2),
      value("f32", 2147483600),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:38
assert_return(
  () => invoke($0, `f32x4.min_with_const_5`, [f32x4([0, 2, 1, 3])]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 1),
      value("f32", 1),
      value("f32", -3),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:40
assert_return(
  () => invoke($0, `f32x4.min_with_const_6`, [f32x4([0, 1, 2, 3])]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 1),
      value("f32", 2),
      value("f32", 3),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:42
assert_return(
  () => invoke($0, `f32x4.min_with_const_7`, [f32x4([0, 2, 1, 2147483600])]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 1),
      value("f32", 1),
      value("f32", 2147483600),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:44
assert_return(
  () => invoke($0, `f32x4.min_with_const_8`, [f32x4([0, 1, 2, 2147483600])]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 1),
      value("f32", 2),
      value("f32", 2147483600),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:47
assert_return(
  () => invoke($0, `f32x4.max_with_const_10`, []),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 2),
      value("f32", 2),
      value("f32", 3),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:48
assert_return(
  () => invoke($0, `f32x4.max_with_const_11`, []),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 1),
      value("f32", 2),
      value("f32", 3),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:49
assert_return(
  () => invoke($0, `f32x4.max_with_const_12`, []),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 2),
      value("f32", 2),
      value("f32", 2147483600),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:50
assert_return(
  () => invoke($0, `f32x4.max_with_const_13`, []),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 1),
      value("f32", 2),
      value("f32", 2147483600),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:52
assert_return(
  () => invoke($0, `f32x4.max_with_const_15`, [f32x4([0, 2, 1, 3])]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 2),
      value("f32", 2),
      value("f32", 3),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:54
assert_return(
  () => invoke($0, `f32x4.max_with_const_16`, [f32x4([0, 1, 2, 3])]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 1),
      value("f32", 2),
      value("f32", 3),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:56
assert_return(
  () => invoke($0, `f32x4.max_with_const_17`, [f32x4([0, 2, 1, 2147483600])]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 2),
      value("f32", 2),
      value("f32", 2147483600),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:58
assert_return(
  () => invoke($0, `f32x4.max_with_const_18`, [f32x4([0, 1, 2, 2147483600])]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 1),
      value("f32", 2),
      value("f32", 2147483600),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:61
assert_return(
  () => invoke($0, `f32x4.abs_with_const`, []),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 1),
      value("f32", 2),
      value("f32", 3),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:65
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x80,
      0x3f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0x80,
      0x3f,
      0x0,
      0x0,
      0x0,
      0x0,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:73
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0x80,
      0x3f,
      0x0,
      0x0,
      0x0,
      0x0,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:81
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x80,
      0x3f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0x80,
      0x3f,
      0x0,
      0x0,
      0x0,
      0x0,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:89
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0x80,
      0x3f,
      0x0,
      0x0,
      0x0,
      0x0,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      value("f32", 1),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:97
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([0, 0, 0, 0]), f32x4([0, 0, 0, 0])]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:100
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([0, 0, 0, 0]), f32x4([-0, -0, -0, -0])]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:103
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([0, 0, 0, 0]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:106
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([0, 0, 0, 0]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:109
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([0, 0, 0, 0]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:112
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([0, 0, 0, 0]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:115
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([0, 0, 0, 0]), f32x4([0.5, 0.5, 0.5, 0.5])]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:118
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([0, 0, 0, 0]), f32x4([-0.5, -0.5, -0.5, -0.5])]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:121
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([0, 0, 0, 0]), f32x4([1, 1, 1, 1])]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:124
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([0, 0, 0, 0]), f32x4([-1, -1, -1, -1])]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:127
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([0, 0, 0, 0]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:130
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([0, 0, 0, 0]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:133
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([0, 0, 0, 0]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:136
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([0, 0, 0, 0]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:139
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([0, 0, 0, 0]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:142
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([0, 0, 0, 0]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:145
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([-0, -0, -0, -0]), f32x4([0, 0, 0, 0])]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:148
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([-0, -0, -0, -0]), f32x4([-0, -0, -0, -0])]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:151
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-0, -0, -0, -0]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:154
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-0, -0, -0, -0]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:157
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-0, -0, -0, -0]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:160
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-0, -0, -0, -0]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:163
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([-0, -0, -0, -0]), f32x4([0.5, 0.5, 0.5, 0.5])]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:166
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-0, -0, -0, -0]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:169
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([-0, -0, -0, -0]), f32x4([1, 1, 1, 1])]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:172
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([-0, -0, -0, -0]), f32x4([-1, -1, -1, -1])]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:175
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-0, -0, -0, -0]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:178
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-0, -0, -0, -0]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:181
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-0, -0, -0, -0]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:184
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-0, -0, -0, -0]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:187
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-0, -0, -0, -0]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:190
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-0, -0, -0, -0]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:193
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:196
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:199
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:202
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:205
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:208
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:211
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:214
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:217
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:220
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:223
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:226
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:229
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:232
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:235
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:238
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:241
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:244
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:247
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:250
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:253
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:256
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:259
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:262
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:265
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:268
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:271
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:274
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:277
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:280
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:283
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:286
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:289
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:292
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:295
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:298
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:301
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:304
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:307
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:310
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:313
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:316
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:319
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:322
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:325
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:328
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:331
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:334
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:337
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:340
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:343
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:346
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:349
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:352
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:355
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:358
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:361
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:364
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:367
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:370
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:373
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:376
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:379
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:382
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:385
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([0.5, 0.5, 0.5, 0.5]), f32x4([0, 0, 0, 0])]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:388
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([0.5, 0.5, 0.5, 0.5]), f32x4([-0, -0, -0, -0])]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:391
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([0.5, 0.5, 0.5, 0.5]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:394
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([0.5, 0.5, 0.5, 0.5]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:397
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([0.5, 0.5, 0.5, 0.5]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:400
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([0.5, 0.5, 0.5, 0.5]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:403
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([0.5, 0.5, 0.5, 0.5]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:406
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([0.5, 0.5, 0.5, 0.5]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:409
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([0.5, 0.5, 0.5, 0.5]), f32x4([1, 1, 1, 1])]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:412
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([0.5, 0.5, 0.5, 0.5]), f32x4([-1, -1, -1, -1])]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:415
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([0.5, 0.5, 0.5, 0.5]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:418
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([0.5, 0.5, 0.5, 0.5]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:421
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([0.5, 0.5, 0.5, 0.5]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:424
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([0.5, 0.5, 0.5, 0.5]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:427
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([0.5, 0.5, 0.5, 0.5]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:430
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([0.5, 0.5, 0.5, 0.5]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:433
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([-0.5, -0.5, -0.5, -0.5]), f32x4([0, 0, 0, 0])]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:436
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:439
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:442
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:445
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:448
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:451
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:454
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:457
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([-0.5, -0.5, -0.5, -0.5]), f32x4([1, 1, 1, 1])]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:460
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:463
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:466
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:469
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:472
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:475
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:478
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:481
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([1, 1, 1, 1]), f32x4([0, 0, 0, 0])]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:484
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([1, 1, 1, 1]), f32x4([-0, -0, -0, -0])]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:487
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([1, 1, 1, 1]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:490
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([1, 1, 1, 1]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:493
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([1, 1, 1, 1]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:496
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([1, 1, 1, 1]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:499
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([1, 1, 1, 1]), f32x4([0.5, 0.5, 0.5, 0.5])]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:502
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([1, 1, 1, 1]), f32x4([-0.5, -0.5, -0.5, -0.5])]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:505
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([1, 1, 1, 1]), f32x4([1, 1, 1, 1])]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:508
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([1, 1, 1, 1]), f32x4([-1, -1, -1, -1])]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:511
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([1, 1, 1, 1]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:514
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([1, 1, 1, 1]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:517
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([1, 1, 1, 1]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:520
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([1, 1, 1, 1]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:523
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([1, 1, 1, 1]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:526
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([1, 1, 1, 1]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:529
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([-1, -1, -1, -1]), f32x4([0, 0, 0, 0])]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:532
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([-1, -1, -1, -1]), f32x4([-0, -0, -0, -0])]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:535
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-1, -1, -1, -1]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:538
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-1, -1, -1, -1]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:541
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-1, -1, -1, -1]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:544
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-1, -1, -1, -1]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:547
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([-1, -1, -1, -1]), f32x4([0.5, 0.5, 0.5, 0.5])]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:550
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-1, -1, -1, -1]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:553
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([-1, -1, -1, -1]), f32x4([1, 1, 1, 1])]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:556
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([-1, -1, -1, -1]), f32x4([-1, -1, -1, -1])]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:559
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-1, -1, -1, -1]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:562
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-1, -1, -1, -1]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:565
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-1, -1, -1, -1]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:568
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-1, -1, -1, -1]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:571
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-1, -1, -1, -1]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:574
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-1, -1, -1, -1]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:577
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:580
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:583
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:586
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:589
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:592
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:595
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:598
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:601
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:604
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:607
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:610
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:613
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:616
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:619
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:622
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:625
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:628
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:631
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:634
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:637
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:640
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:643
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:646
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:649
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:652
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:655
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:658
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:661
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:664
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:667
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:670
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:673
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:676
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:679
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:682
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:685
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:688
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:691
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:694
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:697
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:700
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:703
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:706
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:709
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:712
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:715
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:718
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:721
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:724
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:727
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:730
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:733
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:736
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:739
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:742
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:745
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:748
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:751
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:754
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:757
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:760
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:763
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:766
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:769
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:772
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:775
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:778
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:781
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:784
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:787
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:790
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:793
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:796
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:799
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:802
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:805
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:808
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:811
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:814
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:817
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:820
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:823
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:826
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:829
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:832
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:835
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:838
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:841
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:844
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:847
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:850
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:853
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:856
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:859
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:862
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:865
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:868
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:871
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:874
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:877
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([-123456790, -123456790, -123456790, -123456790]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -123456790),
      value("f32", -123456790),
      value("f32", -123456790),
      value("f32", -123456790),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:880
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
    ]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:883
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
    ]),
    f32x4([
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:886
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
    ]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:889
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
    ]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:892
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
    ]),
    f32x4([-123456790, -123456790, -123456790, -123456790]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -123456790),
      value("f32", -123456790),
      value("f32", -123456790),
      value("f32", -123456790),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:895
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:898
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:901
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:904
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:907
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([-123456790, -123456790, -123456790, -123456790]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -123456790),
      value("f32", -123456790),
      value("f32", -123456790),
      value("f32", -123456790),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:910
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:913
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:916
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:919
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:922
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([-123456790, -123456790, -123456790, -123456790]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -123456790),
      value("f32", -123456790),
      value("f32", -123456790),
      value("f32", -123456790),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:925
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-123456790, -123456790, -123456790, -123456790]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -123456790),
      value("f32", -123456790),
      value("f32", -123456790),
      value("f32", -123456790),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:928
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-123456790, -123456790, -123456790, -123456790]),
    f32x4([
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -123456790),
      value("f32", -123456790),
      value("f32", -123456790),
      value("f32", -123456790),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:931
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-123456790, -123456790, -123456790, -123456790]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -123456790),
      value("f32", -123456790),
      value("f32", -123456790),
      value("f32", -123456790),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:934
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-123456790, -123456790, -123456790, -123456790]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -123456790),
      value("f32", -123456790),
      value("f32", -123456790),
      value("f32", -123456790),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:937
assert_return(
  () => invoke($0, `f32x4.min`, [
    f32x4([-123456790, -123456790, -123456790, -123456790]),
    f32x4([-123456790, -123456790, -123456790, -123456790]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -123456790),
      value("f32", -123456790),
      value("f32", -123456790),
      value("f32", -123456790),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:940
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:943
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:946
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:949
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:952
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:955
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:958
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:961
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:964
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:967
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:970
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:973
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:976
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:979
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:982
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:985
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:988
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:991
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:994
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:997
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1000
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1003
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1006
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1009
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1012
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1015
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1018
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1021
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1024
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1027
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1030
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1033
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1036
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1039
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1042
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1045
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1048
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1051
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1054
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1057
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1060
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1063
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1066
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1069
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1072
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1075
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1078
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1081
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1084
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1087
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1090
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1093
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1096
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1099
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1102
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1105
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1108
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1111
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1114
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1117
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1120
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1123
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1126
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1129
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1132
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1135
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1138
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1141
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1144
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1147
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1150
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1153
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1156
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1159
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1162
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1165
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1168
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1171
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1174
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1177
assert_return(
  () => invoke($0, `f32x4.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1180
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([0, 0, 0, 0]), f32x4([0, 0, 0, 0])]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1183
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([0, 0, 0, 0]), f32x4([-0, -0, -0, -0])]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1186
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([0, 0, 0, 0]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1189
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([0, 0, 0, 0]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1192
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([0, 0, 0, 0]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1195
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([0, 0, 0, 0]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1198
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([0, 0, 0, 0]), f32x4([0.5, 0.5, 0.5, 0.5])]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1201
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([0, 0, 0, 0]), f32x4([-0.5, -0.5, -0.5, -0.5])]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1204
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([0, 0, 0, 0]), f32x4([1, 1, 1, 1])]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1207
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([0, 0, 0, 0]), f32x4([-1, -1, -1, -1])]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1210
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([0, 0, 0, 0]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1213
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([0, 0, 0, 0]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1216
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([0, 0, 0, 0]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1219
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([0, 0, 0, 0]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1222
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([0, 0, 0, 0]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1225
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([0, 0, 0, 0]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1228
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([-0, -0, -0, -0]), f32x4([0, 0, 0, 0])]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1231
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([-0, -0, -0, -0]), f32x4([-0, -0, -0, -0])]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1234
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-0, -0, -0, -0]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1237
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-0, -0, -0, -0]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1240
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-0, -0, -0, -0]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1243
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-0, -0, -0, -0]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1246
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([-0, -0, -0, -0]), f32x4([0.5, 0.5, 0.5, 0.5])]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1249
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-0, -0, -0, -0]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1252
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([-0, -0, -0, -0]), f32x4([1, 1, 1, 1])]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1255
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([-0, -0, -0, -0]), f32x4([-1, -1, -1, -1])]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1258
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-0, -0, -0, -0]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1261
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-0, -0, -0, -0]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1264
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-0, -0, -0, -0]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1267
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-0, -0, -0, -0]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1270
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-0, -0, -0, -0]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1273
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-0, -0, -0, -0]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1276
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1279
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1282
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1285
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1288
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1291
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1294
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1297
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1300
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1303
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1306
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1309
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1312
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1315
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1318
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1321
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1324
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1327
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1330
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1333
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1336
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1339
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1342
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1345
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1348
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1351
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1354
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1357
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1360
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1363
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1366
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1369
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1372
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1375
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1378
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1381
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1384
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1387
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1390
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1393
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1396
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1399
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1402
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1405
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1408
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1411
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1414
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1417
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1420
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1423
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1426
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1429
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1432
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1435
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1438
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1441
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1444
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1447
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1450
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1453
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1456
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1459
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1462
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1465
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1468
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([0.5, 0.5, 0.5, 0.5]), f32x4([0, 0, 0, 0])]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1471
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([0.5, 0.5, 0.5, 0.5]), f32x4([-0, -0, -0, -0])]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1474
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([0.5, 0.5, 0.5, 0.5]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1477
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([0.5, 0.5, 0.5, 0.5]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1480
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([0.5, 0.5, 0.5, 0.5]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1483
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([0.5, 0.5, 0.5, 0.5]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1486
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([0.5, 0.5, 0.5, 0.5]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1489
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([0.5, 0.5, 0.5, 0.5]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1492
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([0.5, 0.5, 0.5, 0.5]), f32x4([1, 1, 1, 1])]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1495
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([0.5, 0.5, 0.5, 0.5]), f32x4([-1, -1, -1, -1])]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1498
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([0.5, 0.5, 0.5, 0.5]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1501
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([0.5, 0.5, 0.5, 0.5]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1504
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([0.5, 0.5, 0.5, 0.5]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1507
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([0.5, 0.5, 0.5, 0.5]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1510
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([0.5, 0.5, 0.5, 0.5]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1513
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([0.5, 0.5, 0.5, 0.5]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1516
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([-0.5, -0.5, -0.5, -0.5]), f32x4([0, 0, 0, 0])]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1519
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1522
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1525
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1528
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1531
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1534
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1537
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1540
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([-0.5, -0.5, -0.5, -0.5]), f32x4([1, 1, 1, 1])]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1543
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1546
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1549
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1552
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1555
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1558
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1561
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-0.5, -0.5, -0.5, -0.5]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1564
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([1, 1, 1, 1]), f32x4([0, 0, 0, 0])]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1567
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([1, 1, 1, 1]), f32x4([-0, -0, -0, -0])]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1570
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([1, 1, 1, 1]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1573
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([1, 1, 1, 1]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1576
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([1, 1, 1, 1]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1579
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([1, 1, 1, 1]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1582
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([1, 1, 1, 1]), f32x4([0.5, 0.5, 0.5, 0.5])]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1585
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([1, 1, 1, 1]), f32x4([-0.5, -0.5, -0.5, -0.5])]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1588
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([1, 1, 1, 1]), f32x4([1, 1, 1, 1])]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1591
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([1, 1, 1, 1]), f32x4([-1, -1, -1, -1])]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1594
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([1, 1, 1, 1]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1597
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([1, 1, 1, 1]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1600
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([1, 1, 1, 1]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1603
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([1, 1, 1, 1]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1606
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([1, 1, 1, 1]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1609
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([1, 1, 1, 1]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1612
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([-1, -1, -1, -1]), f32x4([0, 0, 0, 0])]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1615
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([-1, -1, -1, -1]), f32x4([-0, -0, -0, -0])]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1618
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-1, -1, -1, -1]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1621
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-1, -1, -1, -1]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1624
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-1, -1, -1, -1]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1627
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-1, -1, -1, -1]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1630
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([-1, -1, -1, -1]), f32x4([0.5, 0.5, 0.5, 0.5])]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1633
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-1, -1, -1, -1]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1636
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([-1, -1, -1, -1]), f32x4([1, 1, 1, 1])]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1639
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([-1, -1, -1, -1]), f32x4([-1, -1, -1, -1])]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1642
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-1, -1, -1, -1]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1645
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-1, -1, -1, -1]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1648
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-1, -1, -1, -1]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1651
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-1, -1, -1, -1]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1654
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-1, -1, -1, -1]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1657
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-1, -1, -1, -1]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1660
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1663
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1666
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1669
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1672
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1675
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1678
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1681
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1684
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1687
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1690
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1693
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1696
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1699
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1702
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1705
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1708
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1711
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1714
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1717
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1720
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1723
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1726
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1729
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1732
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1735
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1738
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1741
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1744
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1747
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1750
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1753
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1756
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1759
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1762
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1765
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1768
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1771
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1774
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1777
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1780
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1783
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1786
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1789
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1792
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1795
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1798
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1801
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1804
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1807
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1810
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1813
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1816
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1819
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1822
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1825
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1828
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1831
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1834
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1837
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1840
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1843
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1846
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1849
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1852
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1855
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1858
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1861
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1864
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1867
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1870
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1873
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1876
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1879
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1882
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1885
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1888
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1891
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1894
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1897
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([Infinity, Infinity, Infinity, Infinity]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1900
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1903
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1906
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1909
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
      value("f32", -0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1912
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1915
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
      value("f32", -0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1918
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1921
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
      value("f32", -0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1924
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1927
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
      value("f32", -1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1930
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1933
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
      value("f32", -6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1936
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1939
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1942
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1945
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1948
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1951
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1954
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1957
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1960
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([-123456790, -123456790, -123456790, -123456790]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1963
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
    ]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1966
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
    ]),
    f32x4([
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1969
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
    ]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1972
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
    ]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1975
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
    ]),
    f32x4([-123456790, -123456790, -123456790, -123456790]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1978
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1981
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1984
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1987
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1990
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([-123456790, -123456790, -123456790, -123456790]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1993
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1996
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:1999
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2002
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2005
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
    f32x4([-123456790, -123456790, -123456790, -123456790]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2008
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-123456790, -123456790, -123456790, -123456790]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2011
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-123456790, -123456790, -123456790, -123456790]),
    f32x4([
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2014
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-123456790, -123456790, -123456790, -123456790]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2017
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-123456790, -123456790, -123456790, -123456790]),
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2020
assert_return(
  () => invoke($0, `f32x4.max`, [
    f32x4([-123456790, -123456790, -123456790, -123456790]),
    f32x4([-123456790, -123456790, -123456790, -123456790]),
  ]),
  [
    new F32x4Pattern(
      value("f32", -123456790),
      value("f32", -123456790),
      value("f32", -123456790),
      value("f32", -123456790),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2023
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2026
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2029
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2032
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2035
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2038
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2041
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2044
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2047
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2050
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2053
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2056
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2059
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2062
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2065
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2068
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2071
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2074
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2077
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2080
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2083
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2086
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2089
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2092
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2095
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2098
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2101
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2104
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2107
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2110
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2113
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2116
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2119
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2122
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2125
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2128
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2131
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2134
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
  ]),
  [
    new F32x4Pattern(
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
      `canonical_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2137
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2140
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2143
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2146
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2149
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2152
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2155
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2158
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2161
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2164
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2167
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2170
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2173
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2176
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2179
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2182
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2185
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2188
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2191
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2194
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2197
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2200
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2203
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([0, 0, 0, 0]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2206
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([-0, -0, -0, -0]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2209
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2212
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2215
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2218
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2221
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([0.5, 0.5, 0.5, 0.5]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2224
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([-0.5, -0.5, -0.5, -0.5]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2227
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([1, 1, 1, 1]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2230
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([-1, -1, -1, -1]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2233
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2236
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2239
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2242
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2245
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([Infinity, Infinity, Infinity, Infinity]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2248
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    f32x4([-Infinity, -Infinity, -Infinity, -Infinity]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2251
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2254
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0xc0,
      0xff,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2257
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
      0x0,
      0x0,
      0xa0,
      0x7f,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2260
assert_return(
  () => invoke($0, `f32x4.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
      0x0,
      0x0,
      0xa0,
      0xff,
    ]),
  ]),
  [
    new F32x4Pattern(
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
      `arithmetic_nan`,
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2265
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([0, 0, -0, 0]), f32x4([0, -0, 0, -0])]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2268
assert_return(
  () => invoke($0, `f32x4.min`, [f32x4([-0, -0, -0, -0]), f32x4([0, 0, 0, 0])]),
  [
    new F32x4Pattern(
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
      value("f32", -0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2271
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([0, 0, -0, 0]), f32x4([0, -0, 0, -0])]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2274
assert_return(
  () => invoke($0, `f32x4.max`, [f32x4([-0, -0, -0, -0]), f32x4([0, 0, 0, 0])]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2279
assert_return(
  () => invoke($0, `f32x4.abs`, [f32x4([0, 0, 0, 0])]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2281
assert_return(
  () => invoke($0, `f32x4.abs`, [f32x4([-0, -0, -0, -0])]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2283
assert_return(
  () => invoke($0, `f32x4.abs`, [
    f32x4([
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
      0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2285
assert_return(
  () => invoke($0, `f32x4.abs`, [
    f32x4([
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
      -0.000000000000000000000000000000000000000000001,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
      value("f32", 0.000000000000000000000000000000000000000000001),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2287
assert_return(
  () => invoke($0, `f32x4.abs`, [
    f32x4([
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
      0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2289
assert_return(
  () => invoke($0, `f32x4.abs`, [
    f32x4([
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
      -0.000000000000000000000000000000000000011754944,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
      value("f32", 0.000000000000000000000000000000000000011754944),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2291
assert_return(
  () => invoke($0, `f32x4.abs`, [f32x4([0.5, 0.5, 0.5, 0.5])]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2293
assert_return(
  () => invoke($0, `f32x4.abs`, [f32x4([-0.5, -0.5, -0.5, -0.5])]),
  [
    new F32x4Pattern(
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
      value("f32", 0.5),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2295
assert_return(
  () => invoke($0, `f32x4.abs`, [f32x4([1, 1, 1, 1])]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2297
assert_return(
  () => invoke($0, `f32x4.abs`, [f32x4([-1, -1, -1, -1])]),
  [
    new F32x4Pattern(
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
      value("f32", 1),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2299
assert_return(
  () => invoke($0, `f32x4.abs`, [f32x4([6.2831855, 6.2831855, 6.2831855, 6.2831855])]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2301
assert_return(
  () => invoke($0, `f32x4.abs`, [
    f32x4([-6.2831855, -6.2831855, -6.2831855, -6.2831855]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
      value("f32", 6.2831855),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2303
assert_return(
  () => invoke($0, `f32x4.abs`, [
    f32x4([
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
      340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2305
assert_return(
  () => invoke($0, `f32x4.abs`, [
    f32x4([
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
      -340282350000000000000000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2307
assert_return(
  () => invoke($0, `f32x4.abs`, [f32x4([Infinity, Infinity, Infinity, Infinity])]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2309
assert_return(
  () => invoke($0, `f32x4.abs`, [f32x4([-Infinity, -Infinity, -Infinity, -Infinity])]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
      value("f32", Infinity),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2311
assert_return(
  () => invoke($0, `f32x4.abs`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2313
assert_return(
  () => invoke($0, `f32x4.abs`, [
    f32x4([
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
      0.000000000012345679,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
      value("f32", 0.000000000012345679),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2315
assert_return(
  () => invoke($0, `f32x4.abs`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2317
assert_return(
  () => invoke($0, `f32x4.abs`, [
    f32x4([
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
      1234567900000000000000000000,
    ]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2319
assert_return(
  () => invoke($0, `f32x4.abs`, [
    f32x4([-123456790, -123456790, -123456790, -123456790]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 123456790),
      value("f32", 123456790),
      value("f32", 123456790),
      value("f32", 123456790),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2325
assert_malformed(
  () => instantiate(`(memory 1) (func (result v128) (i8x16.min (v128.const i32x4 0 0 0 0) (v128.const i32x4 0 0 0 0))) `),
  `unknown operator`,
);

// ./test/core/simd/simd_f32x4.wast:2326
assert_malformed(
  () => instantiate(`(memory 1) (func (result v128) (i8x16.max (v128.const i32x4 0 0 0 0) (v128.const i32x4 0 0 0 0))) `),
  `unknown operator`,
);

// ./test/core/simd/simd_f32x4.wast:2327
assert_malformed(
  () => instantiate(`(memory 1) (func (result v128) (i16x8.min (v128.const i32x4 0 0 0 0) (v128.const i32x4 0 0 0 0))) `),
  `unknown operator`,
);

// ./test/core/simd/simd_f32x4.wast:2328
assert_malformed(
  () => instantiate(`(memory 1) (func (result v128) (i16x8.max (v128.const i32x4 0 0 0 0) (v128.const i32x4 0 0 0 0))) `),
  `unknown operator`,
);

// ./test/core/simd/simd_f32x4.wast:2329
assert_malformed(
  () => instantiate(`(memory 1) (func (result v128) (i32x4.min (v128.const i32x4 0 0 0 0) (v128.const i32x4 0 0 0 0))) `),
  `unknown operator`,
);

// ./test/core/simd/simd_f32x4.wast:2330
assert_malformed(
  () => instantiate(`(memory 1) (func (result v128) (i32x4.max (v128.const i32x4 0 0 0 0) (v128.const i32x4 0 0 0 0))) `),
  `unknown operator`,
);

// ./test/core/simd/simd_f32x4.wast:2331
assert_malformed(
  () => instantiate(`(memory 1) (func (result v128) (i64x2.min (v128.const i32x4 0 0 0 0) (v128.const i32x4 0 0 0 0))) `),
  `unknown operator`,
);

// ./test/core/simd/simd_f32x4.wast:2332
assert_malformed(
  () => instantiate(`(memory 1) (func (result v128) (i64x2.max (v128.const i32x4 0 0 0 0) (v128.const i32x4 0 0 0 0))) `),
  `unknown operator`,
);

// ./test/core/simd/simd_f32x4.wast:2335
assert_invalid(
  () => instantiate(`(module (func (result v128) (f32x4.abs (i32.const 0))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_f32x4.wast:2336
assert_invalid(
  () => instantiate(`(module (func (result v128) (f32x4.min (i32.const 0) (f32.const 0.0))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_f32x4.wast:2337
assert_invalid(
  () => instantiate(`(module (func (result v128) (f32x4.max (i32.const 0) (f32.const 0.0))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_f32x4.wast:2341
assert_invalid(
  () => instantiate(`(module
    (func $$f32x4.abs-arg-empty (result v128)
      (f32x4.abs)
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_f32x4.wast:2349
assert_invalid(
  () => instantiate(`(module
    (func $$f32x4.min-1st-arg-empty (result v128)
      (f32x4.min (v128.const f32x4 0 0 0 0))
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_f32x4.wast:2357
assert_invalid(
  () => instantiate(`(module
    (func $$f32x4.min-arg-empty (result v128)
      (f32x4.min)
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_f32x4.wast:2365
assert_invalid(
  () => instantiate(`(module
    (func $$f32x4.max-1st-arg-empty (result v128)
      (f32x4.max (v128.const f32x4 0 0 0 0))
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_f32x4.wast:2373
assert_invalid(
  () => instantiate(`(module
    (func $$f32x4.max-arg-empty (result v128)
      (f32x4.max)
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_f32x4.wast:2383
let $1 = instantiate(`(module
  (func (export "max-min") (param v128 v128 v128) (result v128)
    (f32x4.max (f32x4.min (local.get 0) (local.get 1))(local.get 2)))
  (func (export "min-max") (param v128 v128 v128) (result v128)
    (f32x4.min (f32x4.max (local.get 0) (local.get 1))(local.get 2)))
  (func (export "max-abs") (param v128 v128) (result v128)
    (f32x4.max (f32x4.abs (local.get 0)) (local.get 1)))
  (func (export "min-abs") (param v128 v128) (result v128)
    (f32x4.min (f32x4.abs (local.get 0)) (local.get 1)))
)`);

// ./test/core/simd/simd_f32x4.wast:2394
assert_return(
  () => invoke($1, `max-min`, [
    f32x4([1.125, 1.125, 1.125, 1.125]),
    f32x4([0.25, 0.25, 0.25, 0.25]),
    f32x4([0.125, 0.125, 0.125, 0.125]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.25),
      value("f32", 0.25),
      value("f32", 0.25),
      value("f32", 0.25),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2398
assert_return(
  () => invoke($1, `min-max`, [
    f32x4([1.125, 1.125, 1.125, 1.125]),
    f32x4([0.25, 0.25, 0.25, 0.25]),
    f32x4([0.125, 0.125, 0.125, 0.125]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.125),
      value("f32", 0.125),
      value("f32", 0.125),
      value("f32", 0.125),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2402
assert_return(
  () => invoke($1, `max-abs`, [
    f32x4([-1.125, -1.125, -1.125, -1.125]),
    f32x4([0.125, 0.125, 0.125, 0.125]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 1.125),
      value("f32", 1.125),
      value("f32", 1.125),
      value("f32", 1.125),
    ),
  ],
);

// ./test/core/simd/simd_f32x4.wast:2405
assert_return(
  () => invoke($1, `min-abs`, [
    f32x4([-1.125, -1.125, -1.125, -1.125]),
    f32x4([0.125, 0.125, 0.125, 0.125]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0.125),
      value("f32", 0.125),
      value("f32", 0.125),
      value("f32", 0.125),
    ),
  ],
);
