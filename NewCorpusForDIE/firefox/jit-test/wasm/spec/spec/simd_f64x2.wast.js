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

// ./test/core/simd/simd_f64x2.wast

// ./test/core/simd/simd_f64x2.wast:4
let $0 = instantiate(`(module
  (func (export "f64x2.min") (param v128 v128) (result v128) (f64x2.min (local.get 0) (local.get 1)))
  (func (export "f64x2.max") (param v128 v128) (result v128) (f64x2.max (local.get 0) (local.get 1)))
  (func (export "f64x2.abs") (param v128) (result v128) (f64x2.abs (local.get 0)))
  ;; f64x2.min const vs const
  (func (export "f64x2.min_with_const_0") (result v128) (f64x2.min (v128.const f64x2 0 1) (v128.const f64x2 0 2)))
  (func (export "f64x2.min_with_const_1") (result v128) (f64x2.min (v128.const f64x2 2 -3) (v128.const f64x2 1 3)))
  (func (export "f64x2.min_with_const_2") (result v128) (f64x2.min (v128.const f64x2 0 1) (v128.const f64x2 0 1)))
  (func (export "f64x2.min_with_const_3") (result v128) (f64x2.min (v128.const f64x2 2 3) (v128.const f64x2 2 3)))
  (func (export "f64x2.min_with_const_4") (result v128) (f64x2.min (v128.const f64x2 0x00 0x01) (v128.const f64x2 0x00 0x02)))
  (func (export "f64x2.min_with_const_5") (result v128) (f64x2.min (v128.const f64x2 0x02 0x80000000) (v128.const f64x2 0x01 2147483648)))
  (func (export "f64x2.min_with_const_6") (result v128) (f64x2.min (v128.const f64x2 0x00 0x01) (v128.const f64x2 0x00 0x01)))
  (func (export "f64x2.min_with_const_7") (result v128) (f64x2.min (v128.const f64x2 0x02 0x80000000) (v128.const f64x2 0x02 0x80000000)))
  ;; f64x2.min param vs const
  (func (export "f64x2.min_with_const_9") (param v128) (result v128) (f64x2.min (local.get 0) (v128.const f64x2 0 1)))
  (func (export "f64x2.min_with_const_10") (param v128) (result v128) (f64x2.min (v128.const f64x2 2 -3) (local.get 0)))
  (func (export "f64x2.min_with_const_11") (param v128) (result v128) (f64x2.min (v128.const f64x2 0 1) (local.get 0)))
  (func (export "f64x2.min_with_const_12") (param v128) (result v128) (f64x2.min (local.get 0) (v128.const f64x2 2 3)))
  (func (export "f64x2.min_with_const_13") (param v128) (result v128) (f64x2.min (v128.const f64x2 0x00 0x01) (local.get 0)))
  (func (export "f64x2.min_with_const_14") (param v128) (result v128) (f64x2.min (v128.const f64x2 0x02 0x80000000) (local.get 0)))
  (func (export "f64x2.min_with_const_15") (param v128) (result v128) (f64x2.min (v128.const f64x2 0x00 0x01) (local.get 0)))
  (func (export "f64x2.min_with_const_16") (param v128) (result v128) (f64x2.min (v128.const f64x2 0x02 0x80000000) (local.get 0)))
  ;; f64x2.max const vs const
  (func (export "f64x2.max_with_const_18") (result v128) (f64x2.max (v128.const f64x2 0 1) (v128.const f64x2 0 2)))
  (func (export "f64x2.max_with_const_19") (result v128) (f64x2.max (v128.const f64x2 2 -3) (v128.const f64x2 1 3)))
  (func (export "f64x2.max_with_const_20") (result v128) (f64x2.max (v128.const f64x2 0 1) (v128.const f64x2 0 1)))
  (func (export "f64x2.max_with_const_21") (result v128) (f64x2.max (v128.const f64x2 2 3) (v128.const f64x2 2 3)))
  (func (export "f64x2.max_with_const_22") (result v128) (f64x2.max (v128.const f64x2 0x00 0x01) (v128.const f64x2 0x00 0x02)))
  (func (export "f64x2.max_with_const_23") (result v128) (f64x2.max (v128.const f64x2 0x02 0x80000000) (v128.const f64x2 0x01 2147483648)))
  (func (export "f64x2.max_with_const_24") (result v128) (f64x2.max (v128.const f64x2 0x00 0x01) (v128.const f64x2 0x00 0x01)))
  (func (export "f64x2.max_with_const_25") (result v128) (f64x2.max (v128.const f64x2 0x02 0x80000000) (v128.const f64x2 0x02 0x80000000)))
  ;; f64x2.max param vs const
  (func (export "f64x2.max_with_const_27") (param v128) (result v128) (f64x2.max (local.get 0) (v128.const f64x2 0 1)))
  (func (export "f64x2.max_with_const_28") (param v128) (result v128) (f64x2.max (v128.const f64x2 2 -3) (local.get 0)))
  (func (export "f64x2.max_with_const_29") (param v128) (result v128) (f64x2.max (v128.const f64x2 0 1) (local.get 0)))
  (func (export "f64x2.max_with_const_30") (param v128) (result v128) (f64x2.max (local.get 0) (v128.const f64x2 2 3)))
  (func (export "f64x2.max_with_const_31") (param v128) (result v128) (f64x2.max (v128.const f64x2 0x00 0x01) (local.get 0)))
  (func (export "f64x2.max_with_const_32") (param v128) (result v128) (f64x2.max (v128.const f64x2 0x02 0x80000000) (local.get 0)))
  (func (export "f64x2.max_with_const_33") (param v128) (result v128) (f64x2.max (v128.const f64x2 0x00 0x01) (local.get 0)))
  (func (export "f64x2.max_with_const_34") (param v128) (result v128) (f64x2.max (v128.const f64x2 0x02 0x80000000) (local.get 0)))

  (func (export "f64x2.abs_with_const_35") (result v128) (f64x2.abs (v128.const f64x2 -0 -1)))
  (func (export "f64x2.abs_with_const_36") (result v128) (f64x2.abs (v128.const f64x2 -2 -3)))
)`);

// ./test/core/simd/simd_f64x2.wast:50
assert_return(
  () => invoke($0, `f64x2.min_with_const_0`, []),
  [new F64x2Pattern(value("f64", 0), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:51
assert_return(
  () => invoke($0, `f64x2.min_with_const_1`, []),
  [new F64x2Pattern(value("f64", 1), value("f64", -3))],
);

// ./test/core/simd/simd_f64x2.wast:52
assert_return(
  () => invoke($0, `f64x2.min_with_const_2`, []),
  [new F64x2Pattern(value("f64", 0), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:53
assert_return(
  () => invoke($0, `f64x2.min_with_const_3`, []),
  [new F64x2Pattern(value("f64", 2), value("f64", 3))],
);

// ./test/core/simd/simd_f64x2.wast:55
assert_return(
  () => invoke($0, `f64x2.min_with_const_4`, []),
  [new F64x2Pattern(value("f64", 0), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:56
assert_return(
  () => invoke($0, `f64x2.min_with_const_5`, []),
  [new F64x2Pattern(value("f64", 1), value("f64", 2147483648))],
);

// ./test/core/simd/simd_f64x2.wast:57
assert_return(
  () => invoke($0, `f64x2.min_with_const_6`, []),
  [new F64x2Pattern(value("f64", 0), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:58
assert_return(
  () => invoke($0, `f64x2.min_with_const_7`, []),
  [new F64x2Pattern(value("f64", 2), value("f64", 2147483648))],
);

// ./test/core/simd/simd_f64x2.wast:59
assert_return(
  () => invoke($0, `f64x2.min_with_const_9`, [f64x2([0, 2])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:61
assert_return(
  () => invoke($0, `f64x2.min_with_const_10`, [f64x2([1, 3])]),
  [new F64x2Pattern(value("f64", 1), value("f64", -3))],
);

// ./test/core/simd/simd_f64x2.wast:63
assert_return(
  () => invoke($0, `f64x2.min_with_const_11`, [f64x2([0, 1])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:65
assert_return(
  () => invoke($0, `f64x2.min_with_const_12`, [f64x2([2, 3])]),
  [new F64x2Pattern(value("f64", 2), value("f64", 3))],
);

// ./test/core/simd/simd_f64x2.wast:67
assert_return(
  () => invoke($0, `f64x2.min_with_const_13`, [f64x2([0, 2])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:69
assert_return(
  () => invoke($0, `f64x2.min_with_const_14`, [f64x2([1, 2147483648])]),
  [new F64x2Pattern(value("f64", 1), value("f64", 2147483648))],
);

// ./test/core/simd/simd_f64x2.wast:71
assert_return(
  () => invoke($0, `f64x2.min_with_const_15`, [f64x2([0, 1])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:73
assert_return(
  () => invoke($0, `f64x2.min_with_const_16`, [f64x2([2, 2147483648])]),
  [new F64x2Pattern(value("f64", 2), value("f64", 2147483648))],
);

// ./test/core/simd/simd_f64x2.wast:76
assert_return(
  () => invoke($0, `f64x2.max_with_const_18`, []),
  [new F64x2Pattern(value("f64", 0), value("f64", 2))],
);

// ./test/core/simd/simd_f64x2.wast:77
assert_return(
  () => invoke($0, `f64x2.max_with_const_19`, []),
  [new F64x2Pattern(value("f64", 2), value("f64", 3))],
);

// ./test/core/simd/simd_f64x2.wast:78
assert_return(
  () => invoke($0, `f64x2.max_with_const_20`, []),
  [new F64x2Pattern(value("f64", 0), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:79
assert_return(
  () => invoke($0, `f64x2.max_with_const_21`, []),
  [new F64x2Pattern(value("f64", 2), value("f64", 3))],
);

// ./test/core/simd/simd_f64x2.wast:81
assert_return(
  () => invoke($0, `f64x2.max_with_const_22`, []),
  [new F64x2Pattern(value("f64", 0), value("f64", 2))],
);

// ./test/core/simd/simd_f64x2.wast:82
assert_return(
  () => invoke($0, `f64x2.max_with_const_23`, []),
  [new F64x2Pattern(value("f64", 2), value("f64", 2147483648))],
);

// ./test/core/simd/simd_f64x2.wast:83
assert_return(
  () => invoke($0, `f64x2.max_with_const_24`, []),
  [new F64x2Pattern(value("f64", 0), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:84
assert_return(
  () => invoke($0, `f64x2.max_with_const_25`, []),
  [new F64x2Pattern(value("f64", 2), value("f64", 2147483648))],
);

// ./test/core/simd/simd_f64x2.wast:85
assert_return(
  () => invoke($0, `f64x2.max_with_const_27`, [f64x2([0, 2])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 2))],
);

// ./test/core/simd/simd_f64x2.wast:87
assert_return(
  () => invoke($0, `f64x2.max_with_const_28`, [f64x2([1, 3])]),
  [new F64x2Pattern(value("f64", 2), value("f64", 3))],
);

// ./test/core/simd/simd_f64x2.wast:89
assert_return(
  () => invoke($0, `f64x2.max_with_const_29`, [f64x2([0, 1])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:91
assert_return(
  () => invoke($0, `f64x2.max_with_const_30`, [f64x2([2, 3])]),
  [new F64x2Pattern(value("f64", 2), value("f64", 3))],
);

// ./test/core/simd/simd_f64x2.wast:93
assert_return(
  () => invoke($0, `f64x2.max_with_const_31`, [f64x2([0, 2])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 2))],
);

// ./test/core/simd/simd_f64x2.wast:95
assert_return(
  () => invoke($0, `f64x2.max_with_const_32`, [f64x2([1, 2147483648])]),
  [new F64x2Pattern(value("f64", 2), value("f64", 2147483648))],
);

// ./test/core/simd/simd_f64x2.wast:97
assert_return(
  () => invoke($0, `f64x2.max_with_const_33`, [f64x2([0, 1])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:99
assert_return(
  () => invoke($0, `f64x2.max_with_const_34`, [f64x2([2, 2147483648])]),
  [new F64x2Pattern(value("f64", 2), value("f64", 2147483648))],
);

// ./test/core/simd/simd_f64x2.wast:102
assert_return(
  () => invoke($0, `f64x2.abs_with_const_35`, []),
  [new F64x2Pattern(value("f64", 0), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:103
assert_return(
  () => invoke($0, `f64x2.abs_with_const_36`, []),
  [new F64x2Pattern(value("f64", 2), value("f64", 3))],
);

// ./test/core/simd/simd_f64x2.wast:107
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
    ]),
    f64x2([0, 1]),
  ]),
  [new F64x2Pattern(`canonical_nan`, value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:115
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([0, 1]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:123
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([0, 1]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf0,
      0x3f,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:131
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
    ]),
    f64x2([0, 1]),
  ]),
  [new F64x2Pattern(`canonical_nan`, value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:139
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([0, 1]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:147
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([0, 1]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf0,
      0x3f,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:155
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([0, 0]), f64x2([0, 0])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:158
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([0, 0]), f64x2([-0, -0])]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:161
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([0, 0]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:164
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([0, 0]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:167
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([0, 0]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:170
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([0, 0]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:173
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([0, 0]), f64x2([0.5, 0.5])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:176
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([0, 0]), f64x2([-0.5, -0.5])]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:179
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([0, 0]), f64x2([1, 1])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:182
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([0, 0]), f64x2([-1, -1])]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:185
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([0, 0]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:188
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([0, 0]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:191
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([0, 0]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:194
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([0, 0]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:197
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([0, 0]), f64x2([Infinity, Infinity])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:200
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([0, 0]), f64x2([-Infinity, -Infinity])]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:203
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-0, -0]), f64x2([0, 0])]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:206
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-0, -0]), f64x2([-0, -0])]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:209
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-0, -0]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:212
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-0, -0]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:215
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-0, -0]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:218
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-0, -0]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:221
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-0, -0]), f64x2([0.5, 0.5])]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:224
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-0, -0]), f64x2([-0.5, -0.5])]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:227
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-0, -0]), f64x2([1, 1])]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:230
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-0, -0]), f64x2([-1, -1])]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:233
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-0, -0]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:236
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-0, -0]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:239
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-0, -0]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:242
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-0, -0]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:245
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-0, -0]), f64x2([Infinity, Infinity])]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:248
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-0, -0]), f64x2([-Infinity, -Infinity])]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:251
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([0, 0]),
  ]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:254
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([-0, -0]),
  ]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:257
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:260
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:263
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:266
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:269
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([0.5, 0.5]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:272
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([-0.5, -0.5]),
  ]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:275
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([1, 1]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:278
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([-1, -1]),
  ]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:281
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:284
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:287
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:290
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:293
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([Infinity, Infinity]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:296
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:299
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([0, 0]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:302
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([-0, -0]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:305
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:308
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:311
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:314
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:317
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([0.5, 0.5]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:320
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([-0.5, -0.5]),
  ]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:323
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([1, 1]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:326
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([-1, -1]),
  ]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:329
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:332
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:335
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:338
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:341
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([Infinity, Infinity]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:344
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:347
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([0, 0]),
  ]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:350
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([-0, -0]),
  ]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:353
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:356
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:359
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:362
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:365
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([0.5, 0.5]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:368
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([-0.5, -0.5]),
  ]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:371
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([1, 1]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:374
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([-1, -1]),
  ]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:377
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:380
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:383
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:386
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:389
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([Infinity, Infinity]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:392
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:395
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([0, 0]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:398
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([-0, -0]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:401
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:404
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:407
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:410
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:413
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([0.5, 0.5]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:416
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([-0.5, -0.5]),
  ]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:419
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([1, 1]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:422
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([-1, -1]),
  ]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:425
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:428
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:431
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:434
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:437
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([Infinity, Infinity]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:440
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:443
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([0.5, 0.5]), f64x2([0, 0])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:446
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([0.5, 0.5]), f64x2([-0, -0])]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:449
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([0.5, 0.5]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:452
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([0.5, 0.5]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:455
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([0.5, 0.5]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:458
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([0.5, 0.5]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:461
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([0.5, 0.5]), f64x2([0.5, 0.5])]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:464
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([0.5, 0.5]), f64x2([-0.5, -0.5])]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:467
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([0.5, 0.5]), f64x2([1, 1])]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:470
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([0.5, 0.5]), f64x2([-1, -1])]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:473
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([0.5, 0.5]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:476
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([0.5, 0.5]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:479
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([0.5, 0.5]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:482
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([0.5, 0.5]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:485
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([0.5, 0.5]), f64x2([Infinity, Infinity])]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:488
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([0.5, 0.5]), f64x2([-Infinity, -Infinity])]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:491
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-0.5, -0.5]), f64x2([0, 0])]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:494
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-0.5, -0.5]), f64x2([-0, -0])]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:497
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-0.5, -0.5]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:500
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-0.5, -0.5]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:503
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-0.5, -0.5]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:506
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-0.5, -0.5]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:509
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-0.5, -0.5]), f64x2([0.5, 0.5])]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:512
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-0.5, -0.5]), f64x2([-0.5, -0.5])]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:515
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-0.5, -0.5]), f64x2([1, 1])]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:518
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-0.5, -0.5]), f64x2([-1, -1])]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:521
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-0.5, -0.5]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:524
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-0.5, -0.5]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:527
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-0.5, -0.5]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:530
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-0.5, -0.5]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:533
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-0.5, -0.5]), f64x2([Infinity, Infinity])]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:536
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-0.5, -0.5]), f64x2([-Infinity, -Infinity])]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:539
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([1, 1]), f64x2([0, 0])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:542
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([1, 1]), f64x2([-0, -0])]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:545
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([1, 1]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:548
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([1, 1]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:551
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([1, 1]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:554
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([1, 1]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:557
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([1, 1]), f64x2([0.5, 0.5])]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:560
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([1, 1]), f64x2([-0.5, -0.5])]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:563
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([1, 1]), f64x2([1, 1])]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:566
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([1, 1]), f64x2([-1, -1])]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:569
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([1, 1]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:572
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([1, 1]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:575
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([1, 1]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:578
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([1, 1]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:581
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([1, 1]), f64x2([Infinity, Infinity])]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:584
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([1, 1]), f64x2([-Infinity, -Infinity])]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:587
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-1, -1]), f64x2([0, 0])]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:590
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-1, -1]), f64x2([-0, -0])]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:593
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-1, -1]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:596
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-1, -1]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:599
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-1, -1]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:602
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-1, -1]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:605
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-1, -1]), f64x2([0.5, 0.5])]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:608
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-1, -1]), f64x2([-0.5, -0.5])]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:611
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-1, -1]), f64x2([1, 1])]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:614
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-1, -1]), f64x2([-1, -1])]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:617
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-1, -1]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:620
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-1, -1]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:623
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-1, -1]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:626
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-1, -1]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:629
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-1, -1]), f64x2([Infinity, Infinity])]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:632
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-1, -1]), f64x2([-Infinity, -Infinity])]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:635
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([0, 0]),
  ]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:638
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([-0, -0]),
  ]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:641
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:644
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:647
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:650
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:653
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([0.5, 0.5]),
  ]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:656
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([-0.5, -0.5]),
  ]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:659
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([1, 1]),
  ]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:662
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([-1, -1]),
  ]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:665
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:668
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:671
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:674
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:677
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([Infinity, Infinity]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:680
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:683
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([0, 0]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:686
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([-0, -0]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:689
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:692
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:695
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:698
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:701
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([0.5, 0.5]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:704
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([-0.5, -0.5]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:707
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([1, 1]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:710
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([-1, -1]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:713
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:716
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:719
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:722
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:725
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([Infinity, Infinity]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:728
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:731
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([0, 0]),
  ]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:734
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([-0, -0]),
  ]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:737
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:740
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:743
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:746
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:749
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([0.5, 0.5]),
  ]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:752
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([-0.5, -0.5]),
  ]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:755
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([1, 1]),
  ]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:758
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([-1, -1]),
  ]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:761
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:764
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:767
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:770
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:773
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([Infinity, Infinity]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:776
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:779
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([0, 0]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:782
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([-0, -0]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:785
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:788
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:791
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:794
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:797
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([0.5, 0.5]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:800
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([-0.5, -0.5]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:803
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([1, 1]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:806
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([-1, -1]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:809
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:812
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:815
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:818
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:821
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([Infinity, Infinity]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:824
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:827
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([Infinity, Infinity]), f64x2([0, 0])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:830
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([Infinity, Infinity]), f64x2([-0, -0])]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:833
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([Infinity, Infinity]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:836
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([Infinity, Infinity]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:839
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([Infinity, Infinity]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:842
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([Infinity, Infinity]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:845
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([Infinity, Infinity]), f64x2([0.5, 0.5])]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:848
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([Infinity, Infinity]), f64x2([-0.5, -0.5])]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:851
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([Infinity, Infinity]), f64x2([1, 1])]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:854
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([Infinity, Infinity]), f64x2([-1, -1])]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:857
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([Infinity, Infinity]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:860
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([Infinity, Infinity]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:863
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([Infinity, Infinity]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:866
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([Infinity, Infinity]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:869
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([Infinity, Infinity]),
    f64x2([Infinity, Infinity]),
  ]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:872
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([Infinity, Infinity]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:875
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-Infinity, -Infinity]), f64x2([0, 0])]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:878
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-Infinity, -Infinity]), f64x2([-0, -0])]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:881
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-Infinity, -Infinity]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:884
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-Infinity, -Infinity]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:887
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-Infinity, -Infinity]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:890
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-Infinity, -Infinity]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:893
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-Infinity, -Infinity]), f64x2([0.5, 0.5])]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:896
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-Infinity, -Infinity]), f64x2([-0.5, -0.5])]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:899
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-Infinity, -Infinity]), f64x2([1, 1])]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:902
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-Infinity, -Infinity]), f64x2([-1, -1])]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:905
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-Infinity, -Infinity]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:908
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-Infinity, -Infinity]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:911
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-Infinity, -Infinity]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:914
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-Infinity, -Infinity]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:917
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-Infinity, -Infinity]),
    f64x2([Infinity, Infinity]),
  ]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:920
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-Infinity, -Infinity]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:923
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([0, 0]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:926
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([-0, -0]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:929
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:932
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:935
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:938
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:941
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([0.5, 0.5]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:944
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([-0.5, -0.5]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:947
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([1, 1]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:950
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([-1, -1]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:953
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:956
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:959
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:962
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:965
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([Infinity, Infinity]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:968
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:971
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:974
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:977
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:980
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:983
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([0, 0]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:986
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([-0, -0]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:989
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:992
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:995
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:998
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1001
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([0.5, 0.5]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1004
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([-0.5, -0.5]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1007
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([1, 1]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1010
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([-1, -1]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1013
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1016
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1019
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1022
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1025
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([Infinity, Infinity]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1028
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1031
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1034
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1037
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1040
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1043
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([0, 0]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1046
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([-0, -0]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1049
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1052
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1055
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1058
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1061
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([0.5, 0.5]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1064
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([-0.5, -0.5]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1067
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([1, 1]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1070
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([-1, -1]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1073
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1076
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1079
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1082
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1085
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([Infinity, Infinity]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1088
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1091
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1094
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1097
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1100
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1103
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([0, 0]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1106
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([-0, -0]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1109
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1112
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1115
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1118
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1121
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([0.5, 0.5]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1124
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([-0.5, -0.5]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1127
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([1, 1]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1130
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([-1, -1]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1133
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1136
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1139
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1142
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1145
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([Infinity, Infinity]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1148
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1151
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1154
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1157
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1160
assert_return(
  () => invoke($0, `f64x2.min`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:1163
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      123456789012345690000000000000000000000000000000000000000,
      123456789012345690000000000000000000000000000000000000000,
    ]),
    f64x2([
      123456789012345690000000000000000000000000000000000000000,
      123456789012345690000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 123456789012345690000000000000000000000000000000000000000),
      value("f64", 123456789012345690000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1166
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      123456789012345690000000000000000000000000000000000000000,
      123456789012345690000000000000000000000000000000000000000,
    ]),
    f64x2([0.000000000000000000012345678901234569, 0.000000000000000000012345678901234569]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000012345678901234569),
      value("f64", 0.000000000000000000012345678901234569),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1169
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      123456789012345690000000000000000000000000000000000000000,
      123456789012345690000000000000000000000000000000000000000,
    ]),
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 12345678900000000000000000000000000000000000000),
      value("f64", 12345678900000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1172
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      123456789012345690000000000000000000000000000000000000000,
      123456789012345690000000000000000000000000000000000000000,
    ]),
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 12345678900000000000000000000000000000000000000),
      value("f64", 12345678900000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1175
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      123456789012345690000000000000000000000000000000000000000,
      123456789012345690000000000000000000000000000000000000000,
    ]),
    f64x2([-1234567890123456800, -1234567890123456800]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -1234567890123456800),
      value("f64", -1234567890123456800),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1178
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([0.000000000000000000012345678901234569, 0.000000000000000000012345678901234569]),
    f64x2([
      123456789012345690000000000000000000000000000000000000000,
      123456789012345690000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000012345678901234569),
      value("f64", 0.000000000000000000012345678901234569),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1181
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([0.000000000000000000012345678901234569, 0.000000000000000000012345678901234569]),
    f64x2([0.000000000000000000012345678901234569, 0.000000000000000000012345678901234569]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000012345678901234569),
      value("f64", 0.000000000000000000012345678901234569),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1184
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([0.000000000000000000012345678901234569, 0.000000000000000000012345678901234569]),
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000012345678901234569),
      value("f64", 0.000000000000000000012345678901234569),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1187
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([0.000000000000000000012345678901234569, 0.000000000000000000012345678901234569]),
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000012345678901234569),
      value("f64", 0.000000000000000000012345678901234569),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1190
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([0.000000000000000000012345678901234569, 0.000000000000000000012345678901234569]),
    f64x2([-1234567890123456800, -1234567890123456800]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -1234567890123456800),
      value("f64", -1234567890123456800),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1193
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
    f64x2([
      123456789012345690000000000000000000000000000000000000000,
      123456789012345690000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 12345678900000000000000000000000000000000000000),
      value("f64", 12345678900000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1196
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
    f64x2([0.000000000000000000012345678901234569, 0.000000000000000000012345678901234569]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000012345678901234569),
      value("f64", 0.000000000000000000012345678901234569),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1199
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 12345678900000000000000000000000000000000000000),
      value("f64", 12345678900000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1202
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 12345678900000000000000000000000000000000000000),
      value("f64", 12345678900000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1205
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
    f64x2([-1234567890123456800, -1234567890123456800]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -1234567890123456800),
      value("f64", -1234567890123456800),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1208
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
    f64x2([
      123456789012345690000000000000000000000000000000000000000,
      123456789012345690000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 12345678900000000000000000000000000000000000000),
      value("f64", 12345678900000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1211
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
    f64x2([0.000000000000000000012345678901234569, 0.000000000000000000012345678901234569]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000012345678901234569),
      value("f64", 0.000000000000000000012345678901234569),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1214
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 12345678900000000000000000000000000000000000000),
      value("f64", 12345678900000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1217
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 12345678900000000000000000000000000000000000000),
      value("f64", 12345678900000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1220
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
    f64x2([-1234567890123456800, -1234567890123456800]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -1234567890123456800),
      value("f64", -1234567890123456800),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1223
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-1234567890123456800, -1234567890123456800]),
    f64x2([
      123456789012345690000000000000000000000000000000000000000,
      123456789012345690000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -1234567890123456800),
      value("f64", -1234567890123456800),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1226
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-1234567890123456800, -1234567890123456800]),
    f64x2([0.000000000000000000012345678901234569, 0.000000000000000000012345678901234569]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -1234567890123456800),
      value("f64", -1234567890123456800),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1229
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-1234567890123456800, -1234567890123456800]),
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -1234567890123456800),
      value("f64", -1234567890123456800),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1232
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-1234567890123456800, -1234567890123456800]),
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -1234567890123456800),
      value("f64", -1234567890123456800),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1235
assert_return(
  () => invoke($0, `f64x2.min`, [
    f64x2([-1234567890123456800, -1234567890123456800]),
    f64x2([-1234567890123456800, -1234567890123456800]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -1234567890123456800),
      value("f64", -1234567890123456800),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1238
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([0, 0]), f64x2([0, 0])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:1241
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([0, 0]), f64x2([-0, -0])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:1244
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([0, 0]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1247
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([0, 0]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:1250
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([0, 0]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1253
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([0, 0]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:1256
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([0, 0]), f64x2([0.5, 0.5])]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1259
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([0, 0]), f64x2([-0.5, -0.5])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:1262
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([0, 0]), f64x2([1, 1])]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:1265
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([0, 0]), f64x2([-1, -1])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:1268
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([0, 0]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1271
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([0, 0]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:1274
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([0, 0]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1277
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([0, 0]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:1280
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([0, 0]), f64x2([Infinity, Infinity])]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1283
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([0, 0]), f64x2([-Infinity, -Infinity])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:1286
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-0, -0]), f64x2([0, 0])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:1289
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-0, -0]), f64x2([-0, -0])]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:1292
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-0, -0]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1295
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-0, -0]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:1298
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-0, -0]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1301
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-0, -0]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:1304
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-0, -0]), f64x2([0.5, 0.5])]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1307
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-0, -0]), f64x2([-0.5, -0.5])]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:1310
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-0, -0]), f64x2([1, 1])]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:1313
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-0, -0]), f64x2([-1, -1])]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:1316
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-0, -0]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1319
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-0, -0]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:1322
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-0, -0]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1325
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-0, -0]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:1328
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-0, -0]), f64x2([Infinity, Infinity])]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1331
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-0, -0]), f64x2([-Infinity, -Infinity])]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:1334
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([0, 0]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1337
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([-0, -0]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1340
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1343
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1346
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1349
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1352
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([0.5, 0.5]),
  ]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1355
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([-0.5, -0.5]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1358
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([1, 1]),
  ]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:1361
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([-1, -1]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1364
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1367
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1370
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1373
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1376
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([Infinity, Infinity]),
  ]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1379
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1382
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([0, 0]),
  ]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:1385
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([-0, -0]),
  ]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:1388
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1391
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1394
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1397
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1400
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([0.5, 0.5]),
  ]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1403
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([-0.5, -0.5]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1406
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([1, 1]),
  ]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:1409
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([-1, -1]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1412
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1415
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1418
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1421
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1424
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([Infinity, Infinity]),
  ]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1427
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1430
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([0, 0]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1433
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([-0, -0]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1436
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1439
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1442
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1445
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1448
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([0.5, 0.5]),
  ]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1451
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([-0.5, -0.5]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1454
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([1, 1]),
  ]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:1457
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([-1, -1]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1460
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1463
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1466
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1469
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1472
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([Infinity, Infinity]),
  ]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1475
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1478
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([0, 0]),
  ]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:1481
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([-0, -0]),
  ]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:1484
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1487
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1490
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1493
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1496
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([0.5, 0.5]),
  ]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1499
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([-0.5, -0.5]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1502
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([1, 1]),
  ]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:1505
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([-1, -1]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1508
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1511
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1514
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1517
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1520
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([Infinity, Infinity]),
  ]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1523
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1526
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([0.5, 0.5]), f64x2([0, 0])]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1529
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([0.5, 0.5]), f64x2([-0, -0])]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1532
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([0.5, 0.5]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1535
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([0.5, 0.5]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1538
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([0.5, 0.5]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1541
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([0.5, 0.5]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1544
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([0.5, 0.5]), f64x2([0.5, 0.5])]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1547
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([0.5, 0.5]), f64x2([-0.5, -0.5])]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1550
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([0.5, 0.5]), f64x2([1, 1])]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:1553
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([0.5, 0.5]), f64x2([-1, -1])]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1556
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([0.5, 0.5]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1559
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([0.5, 0.5]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1562
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([0.5, 0.5]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1565
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([0.5, 0.5]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1568
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([0.5, 0.5]), f64x2([Infinity, Infinity])]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1571
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([0.5, 0.5]), f64x2([-Infinity, -Infinity])]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1574
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-0.5, -0.5]), f64x2([0, 0])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:1577
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-0.5, -0.5]), f64x2([-0, -0])]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:1580
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-0.5, -0.5]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1583
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-0.5, -0.5]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1586
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-0.5, -0.5]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1589
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-0.5, -0.5]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1592
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-0.5, -0.5]), f64x2([0.5, 0.5])]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1595
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-0.5, -0.5]), f64x2([-0.5, -0.5])]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1598
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-0.5, -0.5]), f64x2([1, 1])]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:1601
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-0.5, -0.5]), f64x2([-1, -1])]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1604
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-0.5, -0.5]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1607
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-0.5, -0.5]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1610
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-0.5, -0.5]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1613
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-0.5, -0.5]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1616
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-0.5, -0.5]), f64x2([Infinity, Infinity])]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1619
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-0.5, -0.5]), f64x2([-Infinity, -Infinity])]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1622
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([1, 1]), f64x2([0, 0])]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:1625
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([1, 1]), f64x2([-0, -0])]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:1628
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([1, 1]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:1631
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([1, 1]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:1634
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([1, 1]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:1637
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([1, 1]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:1640
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([1, 1]), f64x2([0.5, 0.5])]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:1643
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([1, 1]), f64x2([-0.5, -0.5])]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:1646
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([1, 1]), f64x2([1, 1])]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:1649
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([1, 1]), f64x2([-1, -1])]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:1652
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([1, 1]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1655
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([1, 1]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:1658
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([1, 1]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1661
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([1, 1]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:1664
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([1, 1]), f64x2([Infinity, Infinity])]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1667
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([1, 1]), f64x2([-Infinity, -Infinity])]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:1670
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-1, -1]), f64x2([0, 0])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:1673
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-1, -1]), f64x2([-0, -0])]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:1676
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-1, -1]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1679
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-1, -1]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1682
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-1, -1]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1685
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-1, -1]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1688
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-1, -1]), f64x2([0.5, 0.5])]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1691
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-1, -1]), f64x2([-0.5, -0.5])]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1694
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-1, -1]), f64x2([1, 1])]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:1697
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-1, -1]), f64x2([-1, -1])]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:1700
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-1, -1]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1703
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-1, -1]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:1706
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-1, -1]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1709
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-1, -1]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:1712
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-1, -1]), f64x2([Infinity, Infinity])]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1715
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-1, -1]), f64x2([-Infinity, -Infinity])]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:1718
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([0, 0]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1721
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([-0, -0]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1724
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1727
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1730
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1733
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1736
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([0.5, 0.5]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1739
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([-0.5, -0.5]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1742
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([1, 1]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1745
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([-1, -1]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1748
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1751
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1754
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1757
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1760
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([Infinity, Infinity]),
  ]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1763
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([6.283185307179586, 6.283185307179586]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1766
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([0, 0]),
  ]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:1769
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([-0, -0]),
  ]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:1772
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1775
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1778
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1781
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1784
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([0.5, 0.5]),
  ]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1787
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([-0.5, -0.5]),
  ]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1790
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([1, 1]),
  ]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:1793
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([-1, -1]),
  ]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:1796
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1799
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1802
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1805
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1808
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([Infinity, Infinity]),
  ]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1811
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-6.283185307179586, -6.283185307179586]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1814
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([0, 0]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1817
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([-0, -0]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1820
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1823
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1826
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1829
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1832
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([0.5, 0.5]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1835
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([-0.5, -0.5]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1838
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([1, 1]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1841
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([-1, -1]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1844
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1847
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1850
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1853
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1856
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([Infinity, Infinity]),
  ]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1859
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1862
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([0, 0]),
  ]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:1865
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([-0, -0]),
  ]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:1868
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1871
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1874
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1877
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1880
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([0.5, 0.5]),
  ]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1883
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([-0.5, -0.5]),
  ]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1886
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([1, 1]),
  ]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:1889
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([-1, -1]),
  ]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:1892
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1895
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1898
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1901
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1904
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([Infinity, Infinity]),
  ]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1907
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1910
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([Infinity, Infinity]), f64x2([0, 0])]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1913
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([Infinity, Infinity]), f64x2([-0, -0])]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1916
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([Infinity, Infinity]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1919
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([Infinity, Infinity]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1922
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([Infinity, Infinity]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1925
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([Infinity, Infinity]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1928
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([Infinity, Infinity]), f64x2([0.5, 0.5])]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1931
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([Infinity, Infinity]), f64x2([-0.5, -0.5])]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1934
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([Infinity, Infinity]), f64x2([1, 1])]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1937
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([Infinity, Infinity]), f64x2([-1, -1])]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1940
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([Infinity, Infinity]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1943
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([Infinity, Infinity]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1946
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([Infinity, Infinity]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1949
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([Infinity, Infinity]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1952
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([Infinity, Infinity]),
    f64x2([Infinity, Infinity]),
  ]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1955
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([Infinity, Infinity]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:1958
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-Infinity, -Infinity]), f64x2([0, 0])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:1961
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-Infinity, -Infinity]), f64x2([-0, -0])]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:1964
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-Infinity, -Infinity]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1967
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-Infinity, -Infinity]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1970
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-Infinity, -Infinity]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1973
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-Infinity, -Infinity]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1976
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-Infinity, -Infinity]), f64x2([0.5, 0.5])]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1979
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-Infinity, -Infinity]), f64x2([-0.5, -0.5])]),
  [new F64x2Pattern(value("f64", -0.5), value("f64", -0.5))],
);

// ./test/core/simd/simd_f64x2.wast:1982
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-Infinity, -Infinity]), f64x2([1, 1])]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:1985
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-Infinity, -Infinity]), f64x2([-1, -1])]),
  [new F64x2Pattern(value("f64", -1), value("f64", -1))],
);

// ./test/core/simd/simd_f64x2.wast:1988
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-Infinity, -Infinity]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1991
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-Infinity, -Infinity]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -6.283185307179586),
      value("f64", -6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1994
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-Infinity, -Infinity]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:1997
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-Infinity, -Infinity]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2000
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-Infinity, -Infinity]),
    f64x2([Infinity, Infinity]),
  ]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:2003
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-Infinity, -Infinity]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", -Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:2006
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([0, 0]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2009
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([-0, -0]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2012
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2015
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2018
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2021
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2024
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([0.5, 0.5]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2027
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([-0.5, -0.5]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2030
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([1, 1]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2033
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([-1, -1]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2036
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2039
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2042
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2045
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2048
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([Infinity, Infinity]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2051
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2054
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2057
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2060
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2063
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2066
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([0, 0]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2069
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([-0, -0]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2072
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2075
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2078
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2081
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2084
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([0.5, 0.5]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2087
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([-0.5, -0.5]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2090
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([1, 1]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2093
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([-1, -1]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2096
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2099
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2102
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2105
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2108
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([Infinity, Infinity]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2111
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2114
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2117
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
  ]),
  [new F64x2Pattern(`canonical_nan`, `canonical_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2120
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2123
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2126
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([0, 0]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2129
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([-0, -0]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2132
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2135
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2138
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2141
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2144
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([0.5, 0.5]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2147
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([-0.5, -0.5]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2150
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([1, 1]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2153
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([-1, -1]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2156
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2159
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2162
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2165
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2168
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([Infinity, Infinity]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2171
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2174
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2177
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2180
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2183
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2186
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([0, 0]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2189
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([-0, -0]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2192
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2195
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2198
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2201
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2204
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([0.5, 0.5]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2207
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([-0.5, -0.5]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2210
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([1, 1]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2213
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([-1, -1]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2216
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([6.283185307179586, 6.283185307179586]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2219
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([-6.283185307179586, -6.283185307179586]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2222
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2225
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2228
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([Infinity, Infinity]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2231
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    f64x2([-Infinity, -Infinity]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2234
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2237
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2240
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0x7f,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2243
assert_return(
  () => invoke($0, `f64x2.max`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf4,
      0xff,
    ]),
  ]),
  [new F64x2Pattern(`arithmetic_nan`, `arithmetic_nan`)],
);

// ./test/core/simd/simd_f64x2.wast:2246
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      123456789012345690000000000000000000000000000000000000000,
      123456789012345690000000000000000000000000000000000000000,
    ]),
    f64x2([
      123456789012345690000000000000000000000000000000000000000,
      123456789012345690000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 123456789012345690000000000000000000000000000000000000000),
      value("f64", 123456789012345690000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2249
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      123456789012345690000000000000000000000000000000000000000,
      123456789012345690000000000000000000000000000000000000000,
    ]),
    f64x2([0.000000000000000000012345678901234569, 0.000000000000000000012345678901234569]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 123456789012345690000000000000000000000000000000000000000),
      value("f64", 123456789012345690000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2252
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      123456789012345690000000000000000000000000000000000000000,
      123456789012345690000000000000000000000000000000000000000,
    ]),
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 123456789012345690000000000000000000000000000000000000000),
      value("f64", 123456789012345690000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2255
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      123456789012345690000000000000000000000000000000000000000,
      123456789012345690000000000000000000000000000000000000000,
    ]),
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 123456789012345690000000000000000000000000000000000000000),
      value("f64", 123456789012345690000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2258
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      123456789012345690000000000000000000000000000000000000000,
      123456789012345690000000000000000000000000000000000000000,
    ]),
    f64x2([-1234567890123456800, -1234567890123456800]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 123456789012345690000000000000000000000000000000000000000),
      value("f64", 123456789012345690000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2261
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([0.000000000000000000012345678901234569, 0.000000000000000000012345678901234569]),
    f64x2([
      123456789012345690000000000000000000000000000000000000000,
      123456789012345690000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 123456789012345690000000000000000000000000000000000000000),
      value("f64", 123456789012345690000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2264
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([0.000000000000000000012345678901234569, 0.000000000000000000012345678901234569]),
    f64x2([0.000000000000000000012345678901234569, 0.000000000000000000012345678901234569]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000012345678901234569),
      value("f64", 0.000000000000000000012345678901234569),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2267
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([0.000000000000000000012345678901234569, 0.000000000000000000012345678901234569]),
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 12345678900000000000000000000000000000000000000),
      value("f64", 12345678900000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2270
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([0.000000000000000000012345678901234569, 0.000000000000000000012345678901234569]),
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 12345678900000000000000000000000000000000000000),
      value("f64", 12345678900000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2273
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([0.000000000000000000012345678901234569, 0.000000000000000000012345678901234569]),
    f64x2([-1234567890123456800, -1234567890123456800]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000012345678901234569),
      value("f64", 0.000000000000000000012345678901234569),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2276
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
    f64x2([
      123456789012345690000000000000000000000000000000000000000,
      123456789012345690000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 123456789012345690000000000000000000000000000000000000000),
      value("f64", 123456789012345690000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2279
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
    f64x2([0.000000000000000000012345678901234569, 0.000000000000000000012345678901234569]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 12345678900000000000000000000000000000000000000),
      value("f64", 12345678900000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2282
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 12345678900000000000000000000000000000000000000),
      value("f64", 12345678900000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2285
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 12345678900000000000000000000000000000000000000),
      value("f64", 12345678900000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2288
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
    f64x2([-1234567890123456800, -1234567890123456800]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 12345678900000000000000000000000000000000000000),
      value("f64", 12345678900000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2291
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
    f64x2([
      123456789012345690000000000000000000000000000000000000000,
      123456789012345690000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 123456789012345690000000000000000000000000000000000000000),
      value("f64", 123456789012345690000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2294
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
    f64x2([0.000000000000000000012345678901234569, 0.000000000000000000012345678901234569]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 12345678900000000000000000000000000000000000000),
      value("f64", 12345678900000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2297
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 12345678900000000000000000000000000000000000000),
      value("f64", 12345678900000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2300
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 12345678900000000000000000000000000000000000000),
      value("f64", 12345678900000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2303
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
    f64x2([-1234567890123456800, -1234567890123456800]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 12345678900000000000000000000000000000000000000),
      value("f64", 12345678900000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2306
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-1234567890123456800, -1234567890123456800]),
    f64x2([
      123456789012345690000000000000000000000000000000000000000,
      123456789012345690000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 123456789012345690000000000000000000000000000000000000000),
      value("f64", 123456789012345690000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2309
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-1234567890123456800, -1234567890123456800]),
    f64x2([0.000000000000000000012345678901234569, 0.000000000000000000012345678901234569]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000012345678901234569),
      value("f64", 0.000000000000000000012345678901234569),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2312
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-1234567890123456800, -1234567890123456800]),
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 12345678900000000000000000000000000000000000000),
      value("f64", 12345678900000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2315
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-1234567890123456800, -1234567890123456800]),
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 12345678900000000000000000000000000000000000000),
      value("f64", 12345678900000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2318
assert_return(
  () => invoke($0, `f64x2.max`, [
    f64x2([-1234567890123456800, -1234567890123456800]),
    f64x2([-1234567890123456800, -1234567890123456800]),
  ]),
  [
    new F64x2Pattern(
      value("f64", -1234567890123456800),
      value("f64", -1234567890123456800),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2323
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([0, 0]), f64x2([0, -0])]),
  [new F64x2Pattern(value("f64", 0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:2326
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-0, 0]), f64x2([0, -0])]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:2329
assert_return(
  () => invoke($0, `f64x2.min`, [f64x2([-0, -0]), f64x2([0, 0])]),
  [new F64x2Pattern(value("f64", -0), value("f64", -0))],
);

// ./test/core/simd/simd_f64x2.wast:2332
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([0, 0]), f64x2([0, -0])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:2335
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-0, 0]), f64x2([0, -0])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:2338
assert_return(
  () => invoke($0, `f64x2.max`, [f64x2([-0, -0]), f64x2([0, 0])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:2343
assert_return(
  () => invoke($0, `f64x2.abs`, [f64x2([0, 0])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:2345
assert_return(
  () => invoke($0, `f64x2.abs`, [f64x2([-0, -0])]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0))],
);

// ./test/core/simd/simd_f64x2.wast:2347
assert_return(
  () => invoke($0, `f64x2.abs`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2349
assert_return(
  () => invoke($0, `f64x2.abs`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2351
assert_return(
  () => invoke($0, `f64x2.abs`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2353
assert_return(
  () => invoke($0, `f64x2.abs`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2355
assert_return(
  () => invoke($0, `f64x2.abs`, [f64x2([0.5, 0.5])]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:2357
assert_return(
  () => invoke($0, `f64x2.abs`, [f64x2([-0.5, -0.5])]),
  [new F64x2Pattern(value("f64", 0.5), value("f64", 0.5))],
);

// ./test/core/simd/simd_f64x2.wast:2359
assert_return(
  () => invoke($0, `f64x2.abs`, [f64x2([1, 1])]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:2361
assert_return(
  () => invoke($0, `f64x2.abs`, [f64x2([-1, -1])]),
  [new F64x2Pattern(value("f64", 1), value("f64", 1))],
);

// ./test/core/simd/simd_f64x2.wast:2363
assert_return(
  () => invoke($0, `f64x2.abs`, [f64x2([6.283185307179586, 6.283185307179586])]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2365
assert_return(
  () => invoke($0, `f64x2.abs`, [f64x2([-6.283185307179586, -6.283185307179586])]),
  [
    new F64x2Pattern(
      value("f64", 6.283185307179586),
      value("f64", 6.283185307179586),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2367
assert_return(
  () => invoke($0, `f64x2.abs`, [
    f64x2([
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2369
assert_return(
  () => invoke($0, `f64x2.abs`, [
    f64x2([
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2371
assert_return(
  () => invoke($0, `f64x2.abs`, [f64x2([Infinity, Infinity])]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:2373
assert_return(
  () => invoke($0, `f64x2.abs`, [f64x2([-Infinity, -Infinity])]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_f64x2.wast:2375
assert_return(
  () => invoke($0, `f64x2.abs`, [
    f64x2([
      123456789012345690000000000000000000000000000000000000000,
      123456789012345690000000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 123456789012345690000000000000000000000000000000000000000),
      value("f64", 123456789012345690000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2377
assert_return(
  () => invoke($0, `f64x2.abs`, [
    f64x2([0.000000000000000000012345678901234569, 0.000000000000000000012345678901234569]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000012345678901234569),
      value("f64", 0.000000000000000000012345678901234569),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2379
assert_return(
  () => invoke($0, `f64x2.abs`, [
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 12345678900000000000000000000000000000000000000),
      value("f64", 12345678900000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2381
assert_return(
  () => invoke($0, `f64x2.abs`, [
    f64x2([
      12345678900000000000000000000000000000000000000,
      12345678900000000000000000000000000000000000000,
    ]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 12345678900000000000000000000000000000000000000),
      value("f64", 12345678900000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2383
assert_return(
  () => invoke($0, `f64x2.abs`, [f64x2([-1234567890123456800, -1234567890123456800])]),
  [
    new F64x2Pattern(
      value("f64", 1234567890123456800),
      value("f64", 1234567890123456800),
    ),
  ],
);

// ./test/core/simd/simd_f64x2.wast:2387
assert_invalid(
  () => instantiate(`(module (func (result v128) (f64x2.abs (i32.const 0))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_f64x2.wast:2388
assert_invalid(
  () => instantiate(`(module (func (result v128) (f64x2.min (i32.const 0) (f32.const 0.0))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_f64x2.wast:2389
assert_invalid(
  () => instantiate(`(module (func (result v128) (f64x2.max (i32.const 0) (f32.const 0.0))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_f64x2.wast:2393
assert_invalid(
  () => instantiate(`(module
    (func $$f64x2.abs-arg-empty (result v128)
      (f64x2.abs)
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_f64x2.wast:2401
assert_invalid(
  () => instantiate(`(module
    (func $$f64x2.min-1st-arg-empty (result v128)
      (f64x2.min (v128.const f64x2 0 0))
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_f64x2.wast:2409
assert_invalid(
  () => instantiate(`(module
    (func $$f64x2.min-arg-empty (result v128)
      (f64x2.min)
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_f64x2.wast:2417
assert_invalid(
  () => instantiate(`(module
    (func $$f64x2.max-1st-arg-empty (result v128)
      (f64x2.max (v128.const f64x2 0 0))
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_f64x2.wast:2425
assert_invalid(
  () => instantiate(`(module
    (func $$f64x2.max-arg-empty (result v128)
      (f64x2.max)
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_f64x2.wast:2435
let $1 = instantiate(`(module
  (func (export "max-min") (param v128 v128 v128) (result v128)
    (f64x2.max (f64x2.min (local.get 0) (local.get 1))(local.get 2)))
  (func (export "min-max") (param v128 v128 v128) (result v128)
    (f64x2.min (f64x2.max (local.get 0) (local.get 1))(local.get 2)))
  (func (export "max-abs") (param v128 v128) (result v128)
    (f64x2.max (f64x2.abs (local.get 0)) (local.get 1)))
  (func (export "min-abs") (param v128 v128) (result v128)
    (f64x2.min (f64x2.abs (local.get 0)) (local.get 1)))
)`);

// ./test/core/simd/simd_f64x2.wast:2446
assert_return(
  () => invoke($1, `max-min`, [
    f64x2([1.125, 1.125]),
    f64x2([0.25, 0.25]),
    f64x2([0.125, 0.125]),
  ]),
  [new F64x2Pattern(value("f64", 0.25), value("f64", 0.25))],
);

// ./test/core/simd/simd_f64x2.wast:2450
assert_return(
  () => invoke($1, `min-max`, [
    f64x2([1.125, 1.125]),
    f64x2([0.25, 0.25]),
    f64x2([0.125, 0.125]),
  ]),
  [new F64x2Pattern(value("f64", 0.125), value("f64", 0.125))],
);

// ./test/core/simd/simd_f64x2.wast:2454
assert_return(
  () => invoke($1, `max-abs`, [f64x2([-1.125, -1.125]), f64x2([0.125, 0.125])]),
  [new F64x2Pattern(value("f64", 1.125), value("f64", 1.125))],
);

// ./test/core/simd/simd_f64x2.wast:2457
assert_return(
  () => invoke($1, `min-abs`, [f64x2([-1.125, -1.125]), f64x2([0.125, 0.125])]),
  [new F64x2Pattern(value("f64", 0.125), value("f64", 0.125))],
);
