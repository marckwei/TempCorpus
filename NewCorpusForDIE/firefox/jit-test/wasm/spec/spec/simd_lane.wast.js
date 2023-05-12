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

// ./test/core/simd/simd_lane.wast

// ./test/core/simd/simd_lane.wast:4
let $0 = instantiate(`(module
  (func (export "i8x16_extract_lane_s-first") (param v128) (result i32)
    (i8x16.extract_lane_s 0 (local.get 0)))
  (func (export "i8x16_extract_lane_s-last") (param v128) (result i32)
    (i8x16.extract_lane_s 15 (local.get 0)))
  (func (export "i8x16_extract_lane_u-first") (param v128) (result i32)
    (i8x16.extract_lane_u 0 (local.get 0)))
  (func (export "i8x16_extract_lane_u-last") (param v128) (result i32)
    (i8x16.extract_lane_u 15 (local.get 0)))
  (func (export "i16x8_extract_lane_s-first") (param v128) (result i32)
    (i16x8.extract_lane_s 0 (local.get 0)))
  (func (export "i16x8_extract_lane_s-last") (param v128) (result i32)
    (i16x8.extract_lane_s 7 (local.get 0)))
  (func (export "i16x8_extract_lane_u-first") (param v128) (result i32)
    (i16x8.extract_lane_u 0 (local.get 0)))
  (func (export "i16x8_extract_lane_u-last") (param v128) (result i32)
    (i16x8.extract_lane_u 7 (local.get 0)))
  (func (export "i32x4_extract_lane-first") (param v128) (result i32)
    (i32x4.extract_lane 0 (local.get 0)))
  (func (export "i32x4_extract_lane-last") (param v128) (result i32)
    (i32x4.extract_lane 3 (local.get 0)))
  (func (export "f32x4_extract_lane-first") (param v128) (result f32)
    (f32x4.extract_lane 0 (local.get 0)))
  (func (export "f32x4_extract_lane-last") (param v128) (result f32)
    (f32x4.extract_lane 3 (local.get 0)))
  (func (export "i8x16_replace_lane-first") (param v128 i32) (result v128)
    (i8x16.replace_lane 0 (local.get 0) (local.get 1)))
  (func (export "i8x16_replace_lane-last") (param v128 i32) (result v128)
    (i8x16.replace_lane 15 (local.get 0) (local.get 1)))
  (func (export "i16x8_replace_lane-first") (param v128 i32) (result v128)
    (i16x8.replace_lane 0 (local.get 0) (local.get 1)))
  (func (export "i16x8_replace_lane-last") (param v128 i32) (result v128)
    (i16x8.replace_lane 7 (local.get 0) (local.get 1)))
  (func (export "i32x4_replace_lane-first") (param v128 i32) (result v128)
    (i32x4.replace_lane 0 (local.get 0) (local.get 1)))
  (func (export "i32x4_replace_lane-last") (param v128 i32) (result v128)
    (i32x4.replace_lane 3 (local.get 0) (local.get 1)))
  (func (export "f32x4_replace_lane-first") (param v128 f32) (result v128)
    (f32x4.replace_lane 0 (local.get 0) (local.get 1)))
  (func (export "f32x4_replace_lane-last") (param v128 f32) (result v128)
    (f32x4.replace_lane 3 (local.get 0) (local.get 1)))
  (func (export "i64x2_extract_lane-first") (param v128) (result i64)
    (i64x2.extract_lane 0 (local.get 0)))
  (func (export "i64x2_extract_lane-last") (param v128) (result i64)
    (i64x2.extract_lane 1 (local.get 0)))
  (func (export "f64x2_extract_lane-first") (param v128) (result f64)
    (f64x2.extract_lane 0 (local.get 0)))
  (func (export "f64x2_extract_lane-last") (param v128) (result f64)
    (f64x2.extract_lane 1 (local.get 0)))
  (func (export "i64x2_replace_lane-first") (param v128 i64) (result v128)
    (i64x2.replace_lane 0 (local.get 0) (local.get 1)))
  (func (export "i64x2_replace_lane-last") (param v128 i64) (result v128)
    (i64x2.replace_lane 1 (local.get 0) (local.get 1)))
  (func (export "f64x2_replace_lane-first") (param v128 f64) (result v128)
    (f64x2.replace_lane 0 (local.get 0) (local.get 1)))
  (func (export "f64x2_replace_lane-last") (param v128 f64) (result v128)
    (f64x2.replace_lane 1 (local.get 0) (local.get 1)))

  ;; Swizzle and shuffle
  (func (export "v8x16_swizzle") (param v128 v128) (result v128)
    (i8x16.swizzle (local.get 0) (local.get 1)))
  (func (export "v8x16_shuffle-1") (param v128 v128) (result v128)
    (i8x16.shuffle  0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 (local.get 0) (local.get 1)))
  (func (export "v8x16_shuffle-2") (param v128 v128) (result v128)
    (i8x16.shuffle 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 (local.get 0) (local.get 1)))
  (func (export "v8x16_shuffle-3") (param v128 v128) (result v128)
    (i8x16.shuffle 31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16 (local.get 0) (local.get 1)))
  (func (export "v8x16_shuffle-4") (param v128 v128) (result v128)
    (i8x16.shuffle 15 14 13 12 11 10  9  8  7  6  5  4  3  2  1  0 (local.get 0) (local.get 1)))
  (func (export "v8x16_shuffle-5") (param v128 v128) (result v128)
    (i8x16.shuffle  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0 (local.get 0) (local.get 1)))
  (func (export "v8x16_shuffle-6") (param v128 v128) (result v128)
    (i8x16.shuffle 16 16 16 16 16 16 16 16 16 16 16 16 16 16 16 16 (local.get 0) (local.get 1)))
  (func (export "v8x16_shuffle-7") (param v128 v128) (result v128)
    (i8x16.shuffle  0  0  0  0  0  0  0  0 16 16 16 16 16 16 16 16 (local.get 0) (local.get 1)))
)`);

// ./test/core/simd/simd_lane.wast:81
assert_return(
  () => invoke($0, `i8x16_extract_lane_s-first`, [
    i8x16([0x7f, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ]),
  [value("i32", 127)],
);

// ./test/core/simd/simd_lane.wast:82
assert_return(
  () => invoke($0, `i8x16_extract_lane_s-first`, [
    i8x16([0x7f, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ]),
  [value("i32", 127)],
);

// ./test/core/simd/simd_lane.wast:83
assert_return(
  () => invoke($0, `i8x16_extract_lane_s-first`, [
    i8x16([0xff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ]),
  [value("i32", -1)],
);

// ./test/core/simd/simd_lane.wast:84
assert_return(
  () => invoke($0, `i8x16_extract_lane_s-first`, [
    i8x16([0xff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ]),
  [value("i32", -1)],
);

// ./test/core/simd/simd_lane.wast:85
assert_return(
  () => invoke($0, `i8x16_extract_lane_u-first`, [
    i8x16([0xff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ]),
  [value("i32", 255)],
);

// ./test/core/simd/simd_lane.wast:86
assert_return(
  () => invoke($0, `i8x16_extract_lane_u-first`, [
    i8x16([0xff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ]),
  [value("i32", 255)],
);

// ./test/core/simd/simd_lane.wast:87
assert_return(
  () => invoke($0, `i8x16_extract_lane_s-last`, [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x80]),
  ]),
  [value("i32", -128)],
);

// ./test/core/simd/simd_lane.wast:88
assert_return(
  () => invoke($0, `i8x16_extract_lane_s-last`, [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x80]),
  ]),
  [value("i32", -128)],
);

// ./test/core/simd/simd_lane.wast:89
assert_return(
  () => invoke($0, `i8x16_extract_lane_u-last`, [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xff]),
  ]),
  [value("i32", 255)],
);

// ./test/core/simd/simd_lane.wast:90
assert_return(
  () => invoke($0, `i8x16_extract_lane_u-last`, [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xff]),
  ]),
  [value("i32", 255)],
);

// ./test/core/simd/simd_lane.wast:91
assert_return(
  () => invoke($0, `i8x16_extract_lane_u-last`, [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x80]),
  ]),
  [value("i32", 128)],
);

// ./test/core/simd/simd_lane.wast:92
assert_return(
  () => invoke($0, `i8x16_extract_lane_u-last`, [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x80]),
  ]),
  [value("i32", 128)],
);

// ./test/core/simd/simd_lane.wast:94
assert_return(
  () => invoke($0, `i16x8_extract_lane_s-first`, [
    i16x8([0x7fff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ]),
  [value("i32", 32767)],
);

// ./test/core/simd/simd_lane.wast:95
assert_return(
  () => invoke($0, `i16x8_extract_lane_s-first`, [
    i16x8([0x7fff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ]),
  [value("i32", 32767)],
);

// ./test/core/simd/simd_lane.wast:96
assert_return(
  () => invoke($0, `i16x8_extract_lane_s-first`, [
    i16x8([0xffff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ]),
  [value("i32", -1)],
);

// ./test/core/simd/simd_lane.wast:97
assert_return(
  () => invoke($0, `i16x8_extract_lane_s-first`, [
    i16x8([0xffff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ]),
  [value("i32", -1)],
);

// ./test/core/simd/simd_lane.wast:98
assert_return(
  () => invoke($0, `i16x8_extract_lane_s-first`, [
    i16x8([0x3039, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ]),
  [value("i32", 12345)],
);

// ./test/core/simd/simd_lane.wast:99
assert_return(
  () => invoke($0, `i16x8_extract_lane_s-first`, [
    i16x8([0xedcc, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ]),
  [value("i32", -4660)],
);

// ./test/core/simd/simd_lane.wast:100
assert_return(
  () => invoke($0, `i16x8_extract_lane_u-first`, [
    i16x8([0xffff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ]),
  [value("i32", 65535)],
);

// ./test/core/simd/simd_lane.wast:101
assert_return(
  () => invoke($0, `i16x8_extract_lane_u-first`, [
    i16x8([0xffff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ]),
  [value("i32", 65535)],
);

// ./test/core/simd/simd_lane.wast:102
assert_return(
  () => invoke($0, `i16x8_extract_lane_u-first`, [
    i16x8([0x3039, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ]),
  [value("i32", 12345)],
);

// ./test/core/simd/simd_lane.wast:103
assert_return(
  () => invoke($0, `i16x8_extract_lane_u-first`, [
    i16x8([0xedcc, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ]),
  [value("i32", 60876)],
);

// ./test/core/simd/simd_lane.wast:104
assert_return(
  () => invoke($0, `i16x8_extract_lane_s-last`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x8000]),
  ]),
  [value("i32", -32768)],
);

// ./test/core/simd/simd_lane.wast:105
assert_return(
  () => invoke($0, `i16x8_extract_lane_s-last`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x8000]),
  ]),
  [value("i32", -32768)],
);

// ./test/core/simd/simd_lane.wast:106
assert_return(
  () => invoke($0, `i16x8_extract_lane_s-last`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1a85]),
  ]),
  [value("i32", 6789)],
);

// ./test/core/simd/simd_lane.wast:107
assert_return(
  () => invoke($0, `i16x8_extract_lane_s-last`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x9877]),
  ]),
  [value("i32", -26505)],
);

// ./test/core/simd/simd_lane.wast:108
assert_return(
  () => invoke($0, `i16x8_extract_lane_u-last`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xffff]),
  ]),
  [value("i32", 65535)],
);

// ./test/core/simd/simd_lane.wast:109
assert_return(
  () => invoke($0, `i16x8_extract_lane_u-last`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xffff]),
  ]),
  [value("i32", 65535)],
);

// ./test/core/simd/simd_lane.wast:110
assert_return(
  () => invoke($0, `i16x8_extract_lane_u-last`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x8000]),
  ]),
  [value("i32", 32768)],
);

// ./test/core/simd/simd_lane.wast:111
assert_return(
  () => invoke($0, `i16x8_extract_lane_u-last`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x8000]),
  ]),
  [value("i32", 32768)],
);

// ./test/core/simd/simd_lane.wast:112
assert_return(
  () => invoke($0, `i16x8_extract_lane_u-last`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1a85]),
  ]),
  [value("i32", 6789)],
);

// ./test/core/simd/simd_lane.wast:113
assert_return(
  () => invoke($0, `i16x8_extract_lane_u-last`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x9877]),
  ]),
  [value("i32", 39031)],
);

// ./test/core/simd/simd_lane.wast:115
assert_return(
  () => invoke($0, `i32x4_extract_lane-first`, [i32x4([0x7fffffff, 0x0, 0x0, 0x0])]),
  [value("i32", 2147483647)],
);

// ./test/core/simd/simd_lane.wast:116
assert_return(
  () => invoke($0, `i32x4_extract_lane-first`, [i32x4([0x7fffffff, 0x0, 0x0, 0x0])]),
  [value("i32", 2147483647)],
);

// ./test/core/simd/simd_lane.wast:117
assert_return(
  () => invoke($0, `i32x4_extract_lane-first`, [i32x4([0xffffffff, 0x0, 0x0, 0x0])]),
  [value("i32", -1)],
);

// ./test/core/simd/simd_lane.wast:118
assert_return(
  () => invoke($0, `i32x4_extract_lane-first`, [i32x4([0xffffffff, 0x0, 0x0, 0x0])]),
  [value("i32", -1)],
);

// ./test/core/simd/simd_lane.wast:119
assert_return(
  () => invoke($0, `i32x4_extract_lane-first`, [i32x4([0x499602d2, 0x0, 0x0, 0x0])]),
  [value("i32", 1234567890)],
);

// ./test/core/simd/simd_lane.wast:120
assert_return(
  () => invoke($0, `i32x4_extract_lane-first`, [i32x4([0xedcba988, 0x0, 0x0, 0x0])]),
  [value("i32", -305419896)],
);

// ./test/core/simd/simd_lane.wast:121
assert_return(
  () => invoke($0, `i32x4_extract_lane-last`, [i32x4([0x0, 0x0, 0x0, 0x80000000])]),
  [value("i32", -2147483648)],
);

// ./test/core/simd/simd_lane.wast:122
assert_return(
  () => invoke($0, `i32x4_extract_lane-last`, [i32x4([0x0, 0x0, 0x0, 0x80000000])]),
  [value("i32", -2147483648)],
);

// ./test/core/simd/simd_lane.wast:123
assert_return(
  () => invoke($0, `i32x4_extract_lane-last`, [i32x4([0x0, 0x0, 0x0, 0xffffffff])]),
  [value("i32", -1)],
);

// ./test/core/simd/simd_lane.wast:124
assert_return(
  () => invoke($0, `i32x4_extract_lane-last`, [i32x4([0x0, 0x0, 0x0, 0xffffffff])]),
  [value("i32", -1)],
);

// ./test/core/simd/simd_lane.wast:125
assert_return(
  () => invoke($0, `i32x4_extract_lane-last`, [i32x4([0x0, 0x0, 0x0, 0x3ade68b1])]),
  [value("i32", 987654321)],
);

// ./test/core/simd/simd_lane.wast:126
assert_return(
  () => invoke($0, `i32x4_extract_lane-last`, [i32x4([0x0, 0x0, 0x0, 0xedcba988])]),
  [value("i32", -305419896)],
);

// ./test/core/simd/simd_lane.wast:128
assert_return(
  () => invoke($0, `i64x2_extract_lane-first`, [i64x2([0x7fffffffffffffffn, 0x0n])]),
  [value("i64", 9223372036854775807n)],
);

// ./test/core/simd/simd_lane.wast:129
assert_return(
  () => invoke($0, `i64x2_extract_lane-first`, [i64x2([0x7ffffffffffffffen, 0x0n])]),
  [value("i64", 9223372036854775806n)],
);

// ./test/core/simd/simd_lane.wast:130
assert_return(
  () => invoke($0, `i64x2_extract_lane-first`, [i64x2([0xffffffffffffffffn, 0x0n])]),
  [value("i64", -1n)],
);

// ./test/core/simd/simd_lane.wast:131
assert_return(
  () => invoke($0, `i64x2_extract_lane-first`, [i64x2([0xffffffffffffffffn, 0x0n])]),
  [value("i64", -1n)],
);

// ./test/core/simd/simd_lane.wast:132
assert_return(
  () => invoke($0, `i64x2_extract_lane-first`, [i64x2([0x112210f47de98115n, 0x0n])]),
  [value("i64", 1234567890123456789n)],
);

// ./test/core/simd/simd_lane.wast:133
assert_return(
  () => invoke($0, `i64x2_extract_lane-first`, [i64x2([0x1234567890abcdefn, 0x0n])]),
  [value("i64", 1311768467294899695n)],
);

// ./test/core/simd/simd_lane.wast:134
assert_return(
  () => invoke($0, `i64x2_extract_lane-last`, [i64x2([0x0n, 0x8000000000000000n])]),
  [value("i64", -9223372036854775808n)],
);

// ./test/core/simd/simd_lane.wast:135
assert_return(
  () => invoke($0, `i64x2_extract_lane-last`, [i64x2([0x0n, 0x8000000000000000n])]),
  [value("i64", -9223372036854775808n)],
);

// ./test/core/simd/simd_lane.wast:136
assert_return(
  () => invoke($0, `i64x2_extract_lane-last`, [i64x2([0x0n, 0x8000000000000000n])]),
  [value("i64", -9223372036854775808n)],
);

// ./test/core/simd/simd_lane.wast:137
assert_return(
  () => invoke($0, `i64x2_extract_lane-last`, [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f]),
  ]),
  [value("i64", 9223372036854775807n)],
);

// ./test/core/simd/simd_lane.wast:138
assert_return(
  () => invoke($0, `i64x2_extract_lane-last`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x8000]),
  ]),
  [value("i64", -9223372036854775808n)],
);

// ./test/core/simd/simd_lane.wast:139
assert_return(
  () => invoke($0, `i64x2_extract_lane-last`, [
    i32x4([0x0, 0x0, 0xffffffff, 0x7fffffff]),
  ]),
  [value("i64", 9223372036854775807n)],
);

// ./test/core/simd/simd_lane.wast:140
assert_return(
  () => invoke($0, `i64x2_extract_lane-last`, [f64x2([-Infinity, Infinity])]),
  [value("i64", 9218868437227405312n)],
);

// ./test/core/simd/simd_lane.wast:141
assert_return(
  () => invoke($0, `i64x2_extract_lane-last`, [i64x2([0x0n, 0x112210f47de98115n])]),
  [value("i64", 1234567890123456789n)],
);

// ./test/core/simd/simd_lane.wast:142
assert_return(
  () => invoke($0, `i64x2_extract_lane-last`, [i64x2([0x0n, 0x1234567890abcdefn])]),
  [value("i64", 1311768467294899695n)],
);

// ./test/core/simd/simd_lane.wast:144
assert_return(() => invoke($0, `f32x4_extract_lane-first`, [f32x4([-5, 0, 0, 0])]), [value("f32", -5)]);

// ./test/core/simd/simd_lane.wast:145
assert_return(
  () => invoke($0, `f32x4_extract_lane-first`, [
    f32x4([100000000000000000000000000000000000000, 0, 0, 0]),
  ]),
  [value("f32", 100000000000000000000000000000000000000)],
);

// ./test/core/simd/simd_lane.wast:146
assert_return(
  () => invoke($0, `f32x4_extract_lane-first`, [
    f32x4([340282350000000000000000000000000000000, 0, 0, 0]),
  ]),
  [value("f32", 340282350000000000000000000000000000000)],
);

// ./test/core/simd/simd_lane.wast:147
assert_return(
  () => invoke($0, `f32x4_extract_lane-first`, [
    f32x4([170141180000000000000000000000000000000, 0, 0, 0]),
  ]),
  [value("f32", 170141180000000000000000000000000000000)],
);

// ./test/core/simd/simd_lane.wast:148
assert_return(
  () => invoke($0, `f32x4_extract_lane-first`, [f32x4([Infinity, 0, 0, 0])]),
  [value("f32", Infinity)],
);

// ./test/core/simd/simd_lane.wast:149
assert_return(
  () => invoke($0, `f32x4_extract_lane-first`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0x80,
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
  ]),
  [bytes("f32", [0x0, 0x0, 0xc0, 0x7f])],
);

// ./test/core/simd/simd_lane.wast:150
assert_return(
  () => invoke($0, `f32x4_extract_lane-first`, [
    f32x4([1234567900000000000000000000, 0, 0, 0]),
  ]),
  [value("f32", 1234567900000000000000000000)],
);

// ./test/core/simd/simd_lane.wast:151
assert_return(
  () => invoke($0, `f32x4_extract_lane-first`, [f32x4([156374990000, 0, 0, 0])]),
  [value("f32", 156374990000)],
);

// ./test/core/simd/simd_lane.wast:152
assert_return(
  () => invoke($0, `f32x4_extract_lane-last`, [
    f32x4([0, 0, 0, -100000000000000000000000000000000000000]),
  ]),
  [value("f32", -100000000000000000000000000000000000000)],
);

// ./test/core/simd/simd_lane.wast:153
assert_return(
  () => invoke($0, `f32x4_extract_lane-last`, [
    f32x4([0, 0, 0, -340282350000000000000000000000000000000]),
  ]),
  [value("f32", -340282350000000000000000000000000000000)],
);

// ./test/core/simd/simd_lane.wast:154
assert_return(
  () => invoke($0, `f32x4_extract_lane-last`, [
    f32x4([0, 0, 0, -170141180000000000000000000000000000000]),
  ]),
  [value("f32", -170141180000000000000000000000000000000)],
);

// ./test/core/simd/simd_lane.wast:155
assert_return(
  () => invoke($0, `f32x4_extract_lane-last`, [f32x4([0, 0, 0, -Infinity])]),
  [value("f32", -Infinity)],
);

// ./test/core/simd/simd_lane.wast:156
assert_return(
  () => invoke($0, `f32x4_extract_lane-last`, [
    bytes('v128', [
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
      0xff,
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
  ]),
  [bytes("f32", [0x0, 0x0, 0xc0, 0x7f])],
);

// ./test/core/simd/simd_lane.wast:157
assert_return(
  () => invoke($0, `f32x4_extract_lane-last`, [f32x4([0, 0, 0, 123456790])]),
  [value("f32", 123456790)],
);

// ./test/core/simd/simd_lane.wast:158
assert_return(
  () => invoke($0, `f32x4_extract_lane-last`, [f32x4([0, 0, 0, 81985530000000000])]),
  [value("f32", 81985530000000000)],
);

// ./test/core/simd/simd_lane.wast:160
assert_return(() => invoke($0, `f64x2_extract_lane-first`, [f64x2([-1.5, 0])]), [value("f64", -1.5)]);

// ./test/core/simd/simd_lane.wast:161
assert_return(() => invoke($0, `f64x2_extract_lane-first`, [f64x2([1.5, 0])]), [value("f64", 1.5)]);

// ./test/core/simd/simd_lane.wast:162
assert_return(
  () => invoke($0, `f64x2_extract_lane-first`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000017976931348623155,
      0,
    ]),
  ]),
  [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000017976931348623155),
  ],
);

// ./test/core/simd/simd_lane.wast:163
assert_return(
  () => invoke($0, `f64x2_extract_lane-first`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000017976931348623155,
      0,
    ]),
  ]),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000017976931348623155),
  ],
);

// ./test/core/simd/simd_lane.wast:164
assert_return(
  () => invoke($0, `f64x2_extract_lane-first`, [
    f64x2([
      -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0,
    ]),
  ]),
  [
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ],
);

// ./test/core/simd/simd_lane.wast:165
assert_return(
  () => invoke($0, `f64x2_extract_lane-first`, [
    f64x2([
      0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014,
      0,
    ]),
  ]),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ],
);

// ./test/core/simd/simd_lane.wast:166
assert_return(
  () => invoke($0, `f64x2_extract_lane-first`, [f64x2([-Infinity, 0])]),
  [value("f64", -Infinity)],
);

// ./test/core/simd/simd_lane.wast:167
assert_return(
  () => invoke($0, `f64x2_extract_lane-first`, [f64x2([Infinity, 0])]),
  [value("f64", Infinity)],
);

// ./test/core/simd/simd_lane.wast:168
assert_return(
  () => invoke($0, `f64x2_extract_lane-first`, [
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
      0x80,
    ]),
  ]),
  [bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff])],
);

// ./test/core/simd/simd_lane.wast:169
assert_return(
  () => invoke($0, `f64x2_extract_lane-first`, [
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
  ]),
  [bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f])],
);

// ./test/core/simd/simd_lane.wast:170
assert_return(
  () => invoke($0, `f64x2_extract_lane-first`, [
    f64x2([1234567890123456900000000000, 0]),
  ]),
  [value("f64", 1234567890123456900000000000)],
);

// ./test/core/simd/simd_lane.wast:171
assert_return(
  () => invoke($0, `f64x2_extract_lane-first`, [f64x2([2623536934927580700, 0])]),
  [value("f64", 2623536934927580700)],
);

// ./test/core/simd/simd_lane.wast:172
assert_return(() => invoke($0, `f64x2_extract_lane-last`, [f64x2([0, 2.25])]), [value("f64", 2.25)]);

// ./test/core/simd/simd_lane.wast:173
assert_return(() => invoke($0, `f64x2_extract_lane-last`, [f64x2([0, -2.25])]), [value("f64", -2.25)]);

// ./test/core/simd/simd_lane.wast:174
assert_return(
  () => invoke($0, `f64x2_extract_lane-last`, [
    f64x2([
      0,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/simd/simd_lane.wast:175
assert_return(
  () => invoke($0, `f64x2_extract_lane-last`, [
    f64x2([
      0,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/simd/simd_lane.wast:176
assert_return(
  () => invoke($0, `f64x2_extract_lane-last`, [
    f64x2([
      0,
      -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/simd/simd_lane.wast:177
assert_return(
  () => invoke($0, `f64x2_extract_lane-last`, [
    f64x2([
      0,
      179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
    ]),
  ]),
  [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/simd/simd_lane.wast:178
assert_return(
  () => invoke($0, `f64x2_extract_lane-last`, [f64x2([-0, -Infinity])]),
  [value("f64", -Infinity)],
);

// ./test/core/simd/simd_lane.wast:179
assert_return(
  () => invoke($0, `f64x2_extract_lane-last`, [f64x2([0, Infinity])]),
  [value("f64", Infinity)],
);

// ./test/core/simd/simd_lane.wast:180
assert_return(
  () => invoke($0, `f64x2_extract_lane-last`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x80,
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
  [bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff])],
);

// ./test/core/simd/simd_lane.wast:181
assert_return(
  () => invoke($0, `f64x2_extract_lane-last`, [
    bytes('v128', [
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
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
  ]),
  [bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f])],
);

// ./test/core/simd/simd_lane.wast:182
assert_return(
  () => invoke($0, `f64x2_extract_lane-last`, [f64x2([0, 123456789])]),
  [value("f64", 123456789)],
);

// ./test/core/simd/simd_lane.wast:183
assert_return(
  () => invoke($0, `f64x2_extract_lane-last`, [f64x2([0, 1375488932539311400000000])]),
  [value("f64", 1375488932539311400000000)],
);

// ./test/core/simd/simd_lane.wast:185
assert_return(
  () => invoke($0, `f64x2_extract_lane-last`, [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ]),
  [value("f64", 0)],
);

// ./test/core/simd/simd_lane.wast:186
assert_return(
  () => invoke($0, `f64x2_extract_lane-last`, [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x80]),
  ]),
  [value("f64", -0)],
);

// ./test/core/simd/simd_lane.wast:187
assert_return(
  () => invoke($0, `f64x2_extract_lane-last`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x4000]),
  ]),
  [value("f64", 2)],
);

// ./test/core/simd/simd_lane.wast:188
assert_return(
  () => invoke($0, `f64x2_extract_lane-last`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xc000]),
  ]),
  [value("f64", -2)],
);

// ./test/core/simd/simd_lane.wast:189
assert_return(
  () => invoke($0, `f64x2_extract_lane-last`, [
    i32x4([0x0, 0x0, 0xffffffff, 0x7fefffff]),
  ]),
  [
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ],
);

// ./test/core/simd/simd_lane.wast:190
assert_return(
  () => invoke($0, `f64x2_extract_lane-last`, [i32x4([0x0, 0x0, 0x0, 0x100000])]),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ],
);

// ./test/core/simd/simd_lane.wast:191
assert_return(
  () => invoke($0, `f64x2_extract_lane-last`, [i32x4([0x0, 0x0, 0xffffffff, 0xfffff])]),
  [
    value("f64", 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002225073858507201),
  ],
);

// ./test/core/simd/simd_lane.wast:192
assert_return(
  () => invoke($0, `f64x2_extract_lane-last`, [i32x4([0x0, 0x0, 0x1, 0x0])]),
  [
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005),
  ],
);

// ./test/core/simd/simd_lane.wast:194
assert_return(
  () => invoke($0, `i8x16_replace_lane-first`, [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    127,
  ]),
  [
    i8x16([0x7f, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ],
);

// ./test/core/simd/simd_lane.wast:195
assert_return(
  () => invoke($0, `i8x16_replace_lane-first`, [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    128,
  ]),
  [
    i8x16([0x80, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ],
);

// ./test/core/simd/simd_lane.wast:196
assert_return(
  () => invoke($0, `i8x16_replace_lane-first`, [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    255,
  ]),
  [
    i8x16([0xff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ],
);

// ./test/core/simd/simd_lane.wast:197
assert_return(
  () => invoke($0, `i8x16_replace_lane-first`, [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    256,
  ]),
  [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ],
);

// ./test/core/simd/simd_lane.wast:198
assert_return(
  () => invoke($0, `i8x16_replace_lane-last`, [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    -128,
  ]),
  [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x80]),
  ],
);

// ./test/core/simd/simd_lane.wast:199
assert_return(
  () => invoke($0, `i8x16_replace_lane-last`, [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    -129,
  ]),
  [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x7f]),
  ],
);

// ./test/core/simd/simd_lane.wast:200
assert_return(
  () => invoke($0, `i8x16_replace_lane-last`, [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    32767,
  ]),
  [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xff]),
  ],
);

// ./test/core/simd/simd_lane.wast:201
assert_return(
  () => invoke($0, `i8x16_replace_lane-last`, [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    -32768,
  ]),
  [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ],
);

// ./test/core/simd/simd_lane.wast:203
assert_return(
  () => invoke($0, `i16x8_replace_lane-first`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    32767,
  ]),
  [i16x8([0x7fff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])],
);

// ./test/core/simd/simd_lane.wast:204
assert_return(
  () => invoke($0, `i16x8_replace_lane-first`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    32768,
  ]),
  [i16x8([0x8000, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])],
);

// ./test/core/simd/simd_lane.wast:205
assert_return(
  () => invoke($0, `i16x8_replace_lane-first`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    65535,
  ]),
  [i16x8([0xffff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])],
);

// ./test/core/simd/simd_lane.wast:206
assert_return(
  () => invoke($0, `i16x8_replace_lane-first`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    65536,
  ]),
  [i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])],
);

// ./test/core/simd/simd_lane.wast:207
assert_return(
  () => invoke($0, `i16x8_replace_lane-first`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    12345,
  ]),
  [i16x8([0x3039, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])],
);

// ./test/core/simd/simd_lane.wast:208
assert_return(
  () => invoke($0, `i16x8_replace_lane-first`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    -4660,
  ]),
  [i16x8([0xedcc, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])],
);

// ./test/core/simd/simd_lane.wast:209
assert_return(
  () => invoke($0, `i16x8_replace_lane-last`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    -32768,
  ]),
  [i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x8000])],
);

// ./test/core/simd/simd_lane.wast:210
assert_return(
  () => invoke($0, `i16x8_replace_lane-last`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    -32769,
  ]),
  [i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x7fff])],
);

// ./test/core/simd/simd_lane.wast:211
assert_return(
  () => invoke($0, `i16x8_replace_lane-last`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    2147483647,
  ]),
  [i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xffff])],
);

// ./test/core/simd/simd_lane.wast:212
assert_return(
  () => invoke($0, `i16x8_replace_lane-last`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    -2147483648,
  ]),
  [i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])],
);

// ./test/core/simd/simd_lane.wast:213
assert_return(
  () => invoke($0, `i16x8_replace_lane-last`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    54321,
  ]),
  [i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xd431])],
);

// ./test/core/simd/simd_lane.wast:214
assert_return(
  () => invoke($0, `i16x8_replace_lane-last`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    -17185,
  ]),
  [i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xbcdf])],
);

// ./test/core/simd/simd_lane.wast:216
assert_return(
  () => invoke($0, `i32x4_replace_lane-first`, [
    i32x4([0x0, 0x0, 0x0, 0x0]),
    2147483647,
  ]),
  [i32x4([0x7fffffff, 0x0, 0x0, 0x0])],
);

// ./test/core/simd/simd_lane.wast:217
assert_return(
  () => invoke($0, `i32x4_replace_lane-first`, [i32x4([0x0, 0x0, 0x0, 0x0]), -1]),
  [i32x4([0xffffffff, 0x0, 0x0, 0x0])],
);

// ./test/core/simd/simd_lane.wast:218
assert_return(
  () => invoke($0, `i32x4_replace_lane-first`, [
    i32x4([0x0, 0x0, 0x0, 0x0]),
    1234567890,
  ]),
  [i32x4([0x499602d2, 0x0, 0x0, 0x0])],
);

// ./test/core/simd/simd_lane.wast:219
assert_return(
  () => invoke($0, `i32x4_replace_lane-first`, [
    i32x4([0x0, 0x0, 0x0, 0x0]),
    -305419896,
  ]),
  [i32x4([0xedcba988, 0x0, 0x0, 0x0])],
);

// ./test/core/simd/simd_lane.wast:220
assert_return(
  () => invoke($0, `i32x4_replace_lane-last`, [
    i32x4([0x0, 0x0, 0x0, 0x0]),
    -2147483648,
  ]),
  [i32x4([0x0, 0x0, 0x0, 0x80000000])],
);

// ./test/core/simd/simd_lane.wast:221
assert_return(
  () => invoke($0, `i32x4_replace_lane-last`, [
    i32x4([0x0, 0x0, 0x0, 0x0]),
    -2147483648,
  ]),
  [i32x4([0x0, 0x0, 0x0, 0x80000000])],
);

// ./test/core/simd/simd_lane.wast:222
assert_return(
  () => invoke($0, `i32x4_replace_lane-last`, [i32x4([0x0, 0x0, 0x0, 0x0]), 1234567890]),
  [i32x4([0x0, 0x0, 0x0, 0x499602d2])],
);

// ./test/core/simd/simd_lane.wast:223
assert_return(
  () => invoke($0, `i32x4_replace_lane-last`, [i32x4([0x0, 0x0, 0x0, 0x0]), -305419896]),
  [i32x4([0x0, 0x0, 0x0, 0xedcba988])],
);

// ./test/core/simd/simd_lane.wast:225
assert_return(
  () => invoke($0, `f32x4_replace_lane-first`, [f32x4([0, 0, 0, 0]), value("f32", 53)]),
  [
    new F32x4Pattern(
      value("f32", 53),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:226
assert_return(
  () => invoke($0, `f32x4_replace_lane-first`, [
    i32x4([0x0, 0x0, 0x0, 0x0]),
    value("f32", 53),
  ]),
  [
    new F32x4Pattern(
      value("f32", 53),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:227
assert_return(
  () => invoke($0, `f32x4_replace_lane-first`, [
    f32x4([0, 0, 0, 0]),
    bytes("f32", [0x0, 0x0, 0xc0, 0x7f]),
  ]),
  [
    new F32x4Pattern(
      bytes("f32", [0x0, 0x0, 0xc0, 0x7f]),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:228
assert_return(
  () => invoke($0, `f32x4_replace_lane-first`, [
    f32x4([0, 0, 0, 0]),
    value("f32", Infinity),
  ]),
  [
    new F32x4Pattern(
      value("f32", Infinity),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:229
assert_return(
  () => invoke($0, `f32x4_replace_lane-first`, [
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
    value("f32", 3.14),
  ]),
  [
    new F32x4Pattern(
      value("f32", 3.14),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:230
assert_return(
  () => invoke($0, `f32x4_replace_lane-first`, [
    f32x4([Infinity, 0, 0, 0]),
    value("f32", 100000000000000000000000000000000000000),
  ]),
  [
    new F32x4Pattern(
      value("f32", 100000000000000000000000000000000000000),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:231
assert_return(
  () => invoke($0, `f32x4_replace_lane-first`, [
    f32x4([Infinity, 0, 0, 0]),
    value("f32", 340282350000000000000000000000000000000),
  ]),
  [
    new F32x4Pattern(
      value("f32", 340282350000000000000000000000000000000),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:232
assert_return(
  () => invoke($0, `f32x4_replace_lane-first`, [
    f32x4([Infinity, 0, 0, 0]),
    value("f32", 170141180000000000000000000000000000000),
  ]),
  [
    new F32x4Pattern(
      value("f32", 170141180000000000000000000000000000000),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:233
assert_return(
  () => invoke($0, `f32x4_replace_lane-first`, [
    f32x4([0, 0, 0, 0]),
    value("f32", 123456790),
  ]),
  [
    new F32x4Pattern(
      value("f32", 123456790),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:234
assert_return(
  () => invoke($0, `f32x4_replace_lane-first`, [
    f32x4([0, 0, 0, 0]),
    value("f32", 123456790),
  ]),
  [
    new F32x4Pattern(
      value("f32", 123456790),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:235
assert_return(
  () => invoke($0, `f32x4_replace_lane-first`, [
    f32x4([0, 0, 0, 0]),
    value("f32", 81985530000000000),
  ]),
  [
    new F32x4Pattern(
      value("f32", 81985530000000000),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:236
assert_return(
  () => invoke($0, `f32x4_replace_lane-first`, [
    f32x4([0, 0, 0, 0]),
    value("f32", 81985530000000000),
  ]),
  [
    new F32x4Pattern(
      value("f32", 81985530000000000),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:237
assert_return(
  () => invoke($0, `f32x4_replace_lane-last`, [f32x4([0, 0, 0, 0]), value("f32", -53)]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", -53),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:238
assert_return(
  () => invoke($0, `f32x4_replace_lane-last`, [
    i32x4([0x0, 0x0, 0x0, 0x0]),
    value("f32", -53),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", -53),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:239
assert_return(
  () => invoke($0, `f32x4_replace_lane-last`, [
    f32x4([0, 0, 0, 0]),
    bytes("f32", [0x0, 0x0, 0xc0, 0x7f]),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      bytes("f32", [0x0, 0x0, 0xc0, 0x7f]),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:240
assert_return(
  () => invoke($0, `f32x4_replace_lane-last`, [
    f32x4([0, 0, 0, 0]),
    value("f32", -Infinity),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", -Infinity),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:241
assert_return(
  () => invoke($0, `f32x4_replace_lane-last`, [
    bytes('v128', [
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
      0x0,
      0x0,
      0xc0,
      0x7f,
    ]),
    value("f32", 3.14),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 3.14),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:242
assert_return(
  () => invoke($0, `f32x4_replace_lane-last`, [
    f32x4([0, 0, 0, -Infinity]),
    value("f32", -100000000000000000000000000000000000000),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", -100000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:243
assert_return(
  () => invoke($0, `f32x4_replace_lane-last`, [
    f32x4([0, 0, 0, -Infinity]),
    value("f32", -340282350000000000000000000000000000000),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", -340282350000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:244
assert_return(
  () => invoke($0, `f32x4_replace_lane-last`, [
    f32x4([0, 0, 0, -Infinity]),
    value("f32", -170141180000000000000000000000000000000),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", -170141180000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:245
assert_return(
  () => invoke($0, `f32x4_replace_lane-last`, [
    f32x4([0, 0, 0, 0]),
    value("f32", 1234567900000000000000000000),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:246
assert_return(
  () => invoke($0, `f32x4_replace_lane-last`, [
    f32x4([0, 0, 0, 0]),
    value("f32", 1234567900000000000000000000),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 1234567900000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:247
assert_return(
  () => invoke($0, `f32x4_replace_lane-last`, [
    f32x4([0, 0, 0, 0]),
    value("f32", 42984030000000000000000),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 42984030000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:248
assert_return(
  () => invoke($0, `f32x4_replace_lane-last`, [
    f32x4([0, 0, 0, 0]),
    value("f32", 156374990000),
  ]),
  [
    new F32x4Pattern(
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
      value("f32", 156374990000),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:250
assert_return(
  () => invoke($0, `i64x2_replace_lane-first`, [
    i64x2([0x0n, 0x0n]),
    9223372036854775807n,
  ]),
  [i64x2([0x7fffffffffffffffn, 0x0n])],
);

// ./test/core/simd/simd_lane.wast:251
assert_return(
  () => invoke($0, `i64x2_replace_lane-first`, [i64x2([0x0n, 0x0n]), -1n]),
  [i64x2([0xffffffffffffffffn, 0x0n])],
);

// ./test/core/simd/simd_lane.wast:252
assert_return(
  () => invoke($0, `i64x2_replace_lane-first`, [
    i64x2([0x0n, 0x0n]),
    1234567890123456789n,
  ]),
  [i64x2([0x112210f47de98115n, 0x0n])],
);

// ./test/core/simd/simd_lane.wast:253
assert_return(
  () => invoke($0, `i64x2_replace_lane-first`, [
    i64x2([0x0n, 0x0n]),
    1311768467294899695n,
  ]),
  [i64x2([0x1234567890abcdefn, 0x0n])],
);

// ./test/core/simd/simd_lane.wast:254
assert_return(
  () => invoke($0, `i64x2_replace_lane-last`, [
    i64x2([0x0n, 0x0n]),
    -9223372036854775808n,
  ]),
  [i64x2([0x0n, 0x8000000000000000n])],
);

// ./test/core/simd/simd_lane.wast:255
assert_return(
  () => invoke($0, `i64x2_replace_lane-last`, [
    i64x2([0x0n, 0x0n]),
    -9223372036854775808n,
  ]),
  [i64x2([0x0n, 0x8000000000000000n])],
);

// ./test/core/simd/simd_lane.wast:256
assert_return(
  () => invoke($0, `i64x2_replace_lane-last`, [
    i64x2([0x0n, 0x0n]),
    1234567890123456789n,
  ]),
  [i64x2([0x0n, 0x112210f47de98115n])],
);

// ./test/core/simd/simd_lane.wast:257
assert_return(
  () => invoke($0, `i64x2_replace_lane-last`, [
    i64x2([0x0n, 0x0n]),
    1311768467294899695n,
  ]),
  [i64x2([0x0n, 0x1234567890abcdefn])],
);

// ./test/core/simd/simd_lane.wast:259
assert_return(
  () => invoke($0, `f64x2_replace_lane-first`, [f64x2([1, 1]), value("f64", 0)]),
  [new F64x2Pattern(value("f64", 0), value("f64", 1))],
);

// ./test/core/simd/simd_lane.wast:260
assert_return(
  () => invoke($0, `f64x2_replace_lane-first`, [f64x2([-1, -1]), value("f64", -0)]),
  [new F64x2Pattern(value("f64", -0), value("f64", -1))],
);

// ./test/core/simd/simd_lane.wast:261
assert_return(
  () => invoke($0, `f64x2_replace_lane-first`, [f64x2([0, 0]), value("f64", 1.25)]),
  [new F64x2Pattern(value("f64", 1.25), value("f64", 0))],
);

// ./test/core/simd/simd_lane.wast:262
assert_return(
  () => invoke($0, `f64x2_replace_lane-first`, [f64x2([0, 0]), value("f64", -1.25)]),
  [new F64x2Pattern(value("f64", -1.25), value("f64", 0))],
);

// ./test/core/simd/simd_lane.wast:263
assert_return(
  () => invoke($0, `f64x2_replace_lane-first`, [
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
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    new F64x2Pattern(
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 0),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:264
assert_return(
  () => invoke($0, `f64x2_replace_lane-first`, [
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
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    new F64x2Pattern(
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 0),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:265
assert_return(
  () => invoke($0, `f64x2_replace_lane-first`, [
    f64x2([-Infinity, 0]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [
    new F64x2Pattern(
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:266
assert_return(
  () => invoke($0, `f64x2_replace_lane-first`, [
    f64x2([Infinity, 0]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
      value("f64", 0),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:267
assert_return(
  () => invoke($0, `f64x2_replace_lane-first`, [
    f64x2([0, 0]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [
    new F64x2Pattern(
      bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
      value("f64", 0),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:268
assert_return(
  () => invoke($0, `f64x2_replace_lane-first`, [
    f64x2([0, 0]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [
    new F64x2Pattern(
      bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
      value("f64", 0),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:269
assert_return(
  () => invoke($0, `f64x2_replace_lane-first`, [f64x2([0, 0]), value("f64", -Infinity)]),
  [new F64x2Pattern(value("f64", -Infinity), value("f64", 0))],
);

// ./test/core/simd/simd_lane.wast:270
assert_return(
  () => invoke($0, `f64x2_replace_lane-first`, [f64x2([0, 0]), value("f64", Infinity)]),
  [new F64x2Pattern(value("f64", Infinity), value("f64", 0))],
);

// ./test/core/simd/simd_lane.wast:271
assert_return(
  () => invoke($0, `f64x2_replace_lane-first`, [f64x2([0, 0]), value("f64", 123456789)]),
  [new F64x2Pattern(value("f64", 123456789), value("f64", 0))],
);

// ./test/core/simd/simd_lane.wast:272
assert_return(
  () => invoke($0, `f64x2_replace_lane-first`, [f64x2([0, 0]), value("f64", 123456789)]),
  [new F64x2Pattern(value("f64", 123456789), value("f64", 0))],
);

// ./test/core/simd/simd_lane.wast:273
assert_return(
  () => invoke($0, `f64x2_replace_lane-first`, [
    f64x2([0, 0]),
    value("f64", 1375488932539311400000000),
  ]),
  [new F64x2Pattern(value("f64", 1375488932539311400000000), value("f64", 0))],
);

// ./test/core/simd/simd_lane.wast:274
assert_return(
  () => invoke($0, `f64x2_replace_lane-first`, [
    f64x2([0, 0]),
    value("f64", 1375488932539311400000000),
  ]),
  [new F64x2Pattern(value("f64", 1375488932539311400000000), value("f64", 0))],
);

// ./test/core/simd/simd_lane.wast:275
assert_return(
  () => invoke($0, `f64x2_replace_lane-last`, [f64x2([2, 2]), value("f64", 0)]),
  [new F64x2Pattern(value("f64", 2), value("f64", 0))],
);

// ./test/core/simd/simd_lane.wast:276
assert_return(
  () => invoke($0, `f64x2_replace_lane-last`, [f64x2([-2, -2]), value("f64", -0)]),
  [new F64x2Pattern(value("f64", -2), value("f64", -0))],
);

// ./test/core/simd/simd_lane.wast:277
assert_return(
  () => invoke($0, `f64x2_replace_lane-last`, [f64x2([0, 0]), value("f64", 2.25)]),
  [new F64x2Pattern(value("f64", 0), value("f64", 2.25))],
);

// ./test/core/simd/simd_lane.wast:278
assert_return(
  () => invoke($0, `f64x2_replace_lane-last`, [f64x2([0, 0]), value("f64", -2.25)]),
  [new F64x2Pattern(value("f64", 0), value("f64", -2.25))],
);

// ./test/core/simd/simd_lane.wast:279
assert_return(
  () => invoke($0, `f64x2_replace_lane-last`, [
    bytes('v128', [
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
      0x0,
      0x0,
      0xf8,
      0xff,
    ]),
    value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0),
      value("f64", -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:280
assert_return(
  () => invoke($0, `f64x2_replace_lane-last`, [
    bytes('v128', [
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
      0x0,
      0x0,
      0xf8,
      0x7f,
    ]),
    value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0),
      value("f64", 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:281
assert_return(
  () => invoke($0, `f64x2_replace_lane-last`, [
    f64x2([0, -Infinity]),
    value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0),
      value("f64", -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:282
assert_return(
  () => invoke($0, `f64x2_replace_lane-last`, [
    f64x2([0, Infinity]),
    value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0),
      value("f64", 0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022250738585072014),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:283
assert_return(
  () => invoke($0, `f64x2_replace_lane-last`, [
    f64x2([0, 0]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0),
      bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xff]),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:284
assert_return(
  () => invoke($0, `f64x2_replace_lane-last`, [
    f64x2([0, 0]),
    bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
  ]),
  [
    new F64x2Pattern(
      value("f64", 0),
      bytes("f64", [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0x7f]),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:285
assert_return(
  () => invoke($0, `f64x2_replace_lane-last`, [f64x2([0, 0]), value("f64", -Infinity)]),
  [new F64x2Pattern(value("f64", 0), value("f64", -Infinity))],
);

// ./test/core/simd/simd_lane.wast:286
assert_return(
  () => invoke($0, `f64x2_replace_lane-last`, [f64x2([0, 0]), value("f64", Infinity)]),
  [new F64x2Pattern(value("f64", 0), value("f64", Infinity))],
);

// ./test/core/simd/simd_lane.wast:287
assert_return(
  () => invoke($0, `f64x2_replace_lane-last`, [
    f64x2([0, 0]),
    value("f64", 1234567890000000000000000000),
  ]),
  [
    new F64x2Pattern(value("f64", 0), value("f64", 1234567890000000000000000000)),
  ],
);

// ./test/core/simd/simd_lane.wast:288
assert_return(
  () => invoke($0, `f64x2_replace_lane-last`, [
    f64x2([0, 0]),
    value("f64", 1234567890000000000000000000),
  ]),
  [
    new F64x2Pattern(value("f64", 0), value("f64", 1234567890000000000000000000)),
  ],
);

// ./test/core/simd/simd_lane.wast:289
assert_return(
  () => invoke($0, `f64x2_replace_lane-last`, [
    f64x2([0, 0]),
    value("f64", 1234567890000000000000000000),
  ]),
  [
    new F64x2Pattern(value("f64", 0), value("f64", 1234567890000000000000000000)),
  ],
);

// ./test/core/simd/simd_lane.wast:290
assert_return(
  () => invoke($0, `f64x2_replace_lane-last`, [
    f64x2([0, 0]),
    value("f64", 0.0000000000123456789),
  ]),
  [new F64x2Pattern(value("f64", 0), value("f64", 0.0000000000123456789))],
);

// ./test/core/simd/simd_lane.wast:292
assert_return(
  () => invoke($0, `v8x16_swizzle`, [
    i8x16([0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f]),
    i8x16([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]),
  ]),
  [
    i8x16([0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f]),
  ],
);

// ./test/core/simd/simd_lane.wast:296
assert_return(
  () => invoke($0, `v8x16_swizzle`, [
    i8x16([0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff]),
    i8x16([0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17]),
  ]),
  [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ],
);

// ./test/core/simd/simd_lane.wast:300
assert_return(
  () => invoke($0, `v8x16_swizzle`, [
    i8x16([0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x6b, 0x6c, 0x6d, 0x6e, 0x6f, 0x70, 0x71, 0x72, 0x73]),
    i8x16([0xf, 0xe, 0xd, 0xc, 0xb, 0xa, 0x9, 0x8, 0x7, 0x6, 0x5, 0x4, 0x3, 0x2, 0x1, 0x0]),
  ]),
  [
    i8x16([0x73, 0x72, 0x71, 0x70, 0x6f, 0x6e, 0x6d, 0x6c, 0x6b, 0x6a, 0x69, 0x68, 0x67, 0x66, 0x65, 0x64]),
  ],
);

// ./test/core/simd/simd_lane.wast:304
assert_return(
  () => invoke($0, `v8x16_swizzle`, [
    i8x16([0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x6b, 0x6c, 0x6d, 0x6e, 0x6f, 0x70, 0x71, 0x72, 0x73]),
    i8x16([0xff, 0x1, 0xfe, 0x2, 0xfd, 0x3, 0xfc, 0x4, 0xfb, 0x5, 0xfa, 0x6, 0xf9, 0x7, 0xf8, 0x8]),
  ]),
  [
    i8x16([0x0, 0x65, 0x0, 0x66, 0x0, 0x67, 0x0, 0x68, 0x0, 0x69, 0x0, 0x6a, 0x0, 0x6b, 0x0, 0x6c]),
  ],
);

// ./test/core/simd/simd_lane.wast:308
assert_return(
  () => invoke($0, `v8x16_swizzle`, [
    i8x16([0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x6b, 0x6c, 0x6d, 0x6e, 0x6f, 0x70, 0x71, 0x72, 0x73]),
    i8x16([0x9, 0x10, 0xa, 0x11, 0xb, 0x12, 0xc, 0x13, 0xd, 0x14, 0xe, 0x15, 0xf, 0x16, 0x10, 0x17]),
  ]),
  [
    i8x16([0x6d, 0x0, 0x6e, 0x0, 0x6f, 0x0, 0x70, 0x0, 0x71, 0x0, 0x72, 0x0, 0x73, 0x0, 0x0, 0x0]),
  ],
);

// ./test/core/simd/simd_lane.wast:312
assert_return(
  () => invoke($0, `v8x16_swizzle`, [
    i8x16([0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x6b, 0x6c, 0x6d, 0x6e, 0x6f, 0x70, 0x71, 0x72, 0x73]),
    i8x16([0x9, 0x10, 0xa, 0x11, 0xb, 0x12, 0xc, 0x13, 0xd, 0x14, 0xe, 0x15, 0xf, 0x16, 0x10, 0x17]),
  ]),
  [
    i8x16([0x6d, 0x0, 0x6e, 0x0, 0x6f, 0x0, 0x70, 0x0, 0x71, 0x0, 0x72, 0x0, 0x73, 0x0, 0x0, 0x0]),
  ],
);

// ./test/core/simd/simd_lane.wast:316
assert_return(
  () => invoke($0, `v8x16_swizzle`, [
    i16x8([0x6465, 0x6667, 0x6869, 0x6a6b, 0x6c6d, 0x6e6f, 0x7071, 0x7273]),
    i8x16([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]),
  ]),
  [i16x8([0x6465, 0x6667, 0x6869, 0x6a6b, 0x6c6d, 0x6e6f, 0x7071, 0x7273])],
);

// ./test/core/simd/simd_lane.wast:320
assert_return(
  () => invoke($0, `v8x16_swizzle`, [
    i32x4([0x64656667, 0x68696a6b, 0x6c6d6e6f, 0x70717273]),
    i8x16([0xf, 0xe, 0xd, 0xc, 0xb, 0xa, 0x9, 0x8, 0x7, 0x6, 0x5, 0x4, 0x3, 0x2, 0x1, 0x0]),
  ]),
  [i32x4([0x73727170, 0x6f6e6d6c, 0x6b6a6968, 0x67666564])],
);

// ./test/core/simd/simd_lane.wast:324
assert_return(
  () => invoke($0, `v8x16_swizzle`, [
    bytes('v128', [
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0xc0,
      0xff,
      0x0,
      0x0,
      0x80,
      0x7f,
      0x0,
      0x0,
      0x80,
      0xff,
    ]),
    i8x16([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]),
  ]),
  [i32x4([0x7fc00000, 0xffc00000, 0x7f800000, 0xff800000])],
);

// ./test/core/simd/simd_lane.wast:328
assert_return(
  () => invoke($0, `v8x16_swizzle`, [
    i32x4([0x67666564, 0x6b6a6968, 0x6f6e6d5c, 0x73727170]),
    f32x4([0, -0, Infinity, -Infinity]),
  ]),
  [i32x4([0x64646464, 0x646464, 0x6464, 0x6464])],
);

// ./test/core/simd/simd_lane.wast:333
assert_return(
  () => invoke($0, `v8x16_shuffle-1`, [
    i8x16([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]),
    i8x16([0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f]),
  ]),
  [
    i8x16([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]),
  ],
);

// ./test/core/simd/simd_lane.wast:337
assert_return(
  () => invoke($0, `v8x16_shuffle-2`, [
    i8x16([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]),
    i8x16([0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff]),
  ]),
  [
    i8x16([0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff]),
  ],
);

// ./test/core/simd/simd_lane.wast:341
assert_return(
  () => invoke($0, `v8x16_shuffle-3`, [
    i8x16([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]),
    i8x16([0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff]),
  ]),
  [
    i8x16([0xff, 0xfe, 0xfd, 0xfc, 0xfb, 0xfa, 0xf9, 0xf8, 0xf7, 0xf6, 0xf5, 0xf4, 0xf3, 0xf2, 0xf1, 0xf0]),
  ],
);

// ./test/core/simd/simd_lane.wast:345
assert_return(
  () => invoke($0, `v8x16_shuffle-4`, [
    i8x16([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]),
    i8x16([0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff]),
  ]),
  [
    i8x16([0xf, 0xe, 0xd, 0xc, 0xb, 0xa, 0x9, 0x8, 0x7, 0x6, 0x5, 0x4, 0x3, 0x2, 0x1, 0x0]),
  ],
);

// ./test/core/simd/simd_lane.wast:349
assert_return(
  () => invoke($0, `v8x16_shuffle-5`, [
    i8x16([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]),
    i8x16([0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff]),
  ]),
  [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ],
);

// ./test/core/simd/simd_lane.wast:353
assert_return(
  () => invoke($0, `v8x16_shuffle-6`, [
    i8x16([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]),
    i8x16([0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff]),
  ]),
  [
    i8x16([0xf0, 0xf0, 0xf0, 0xf0, 0xf0, 0xf0, 0xf0, 0xf0, 0xf0, 0xf0, 0xf0, 0xf0, 0xf0, 0xf0, 0xf0, 0xf0]),
  ],
);

// ./test/core/simd/simd_lane.wast:357
assert_return(
  () => invoke($0, `v8x16_shuffle-7`, [
    i8x16([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]),
    i8x16([0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff]),
  ]),
  [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf0, 0xf0, 0xf0, 0xf0, 0xf0, 0xf0, 0xf0, 0xf0]),
  ],
);

// ./test/core/simd/simd_lane.wast:361
assert_return(
  () => invoke($0, `v8x16_shuffle-1`, [
    i8x16([0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x6b, 0x6c, 0x6d, 0x6e, 0x6f, 0x70, 0x71, 0x72, 0x73]),
    i8x16([0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff]),
  ]),
  [
    i8x16([0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x6b, 0x6c, 0x6d, 0x6e, 0x6f, 0x70, 0x71, 0x72, 0x73]),
  ],
);

// ./test/core/simd/simd_lane.wast:365
assert_return(
  () => invoke($0, `v8x16_shuffle-1`, [
    i16x8([0x100, 0x302, 0x504, 0x706, 0x908, 0xb0a, 0xd0c, 0xf0e]),
    i8x16([0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff]),
  ]),
  [i16x8([0x100, 0x302, 0x504, 0x706, 0x908, 0xb0a, 0xd0c, 0xf0e])],
);

// ./test/core/simd/simd_lane.wast:369
assert_return(
  () => invoke($0, `v8x16_shuffle-2`, [
    i8x16([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]),
    i32x4([0xf3f2f1f0, 0xf7f6f5f4, 0xfbfaf9f8, 0xfffefdfc]),
  ]),
  [i32x4([0xf3f2f1f0, 0xf7f6f5f4, 0xfbfaf9f8, 0xfffefdfc])],
);

// ./test/core/simd/simd_lane.wast:373
assert_return(
  () => invoke($0, `v8x16_shuffle-1`, [
    i32x4([0x10203, 0x4050607, 0x8090a0b, 0xc0d0e0f]),
    i8x16([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]),
  ]),
  [i32x4([0x10203, 0x4050607, 0x8090a0b, 0xc0d0e0f])],
);

// ./test/core/simd/simd_lane.wast:377
assert_return(
  () => invoke($0, `v8x16_shuffle-1`, [
    bytes('v128', [
      0x0,
      0x0,
      0x80,
      0x3f,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0x80,
      0x7f,
      0x0,
      0x0,
      0x80,
      0xff,
    ]),
    i8x16([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]),
  ]),
  [i32x4([0x3f800000, 0x7fc00000, 0x7f800000, 0xff800000])],
);

// ./test/core/simd/simd_lane.wast:381
assert_return(
  () => invoke($0, `v8x16_shuffle-1`, [
    i32x4([0x10203, 0x4050607, 0x8090a0b, 0xc0d0e0f]),
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x80,
      0x0,
      0x0,
      0xc0,
      0x7f,
      0x0,
      0x0,
      0x80,
      0x7f,
      0x0,
      0x0,
      0x80,
      0xff,
    ]),
  ]),
  [i32x4([0x10203, 0x4050607, 0x8090a0b, 0xc0d0e0f])],
);

// ./test/core/simd/simd_lane.wast:387
assert_return(
  () => invoke($0, `v8x16_swizzle`, [
    i32x4([0x499602d2, 0x12345678, 0x499602d2, 0x12345678]),
    i8x16([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]),
  ]),
  [i32x4([0x499602d2, 0x12345678, 0x499602d2, 0x12345678])],
);

// ./test/core/simd/simd_lane.wast:391
assert_return(
  () => invoke($0, `v8x16_shuffle-1`, [
    i64x2([0xab54a98ceb1f0ad2n, 0x1234567890abcdefn]),
    i64x2([0xab54a98ceb1f0ad2n, 0x1234567890abcdefn]),
  ]),
  [i32x4([0xeb1f0ad2, 0xab54a98c, 0x90abcdef, 0x12345678])],
);

// ./test/core/simd/simd_lane.wast:398
assert_malformed(
  () => instantiate(`(func (result i32) (i8x16.extract_lane_s  -1 (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:399
assert_malformed(
  () => instantiate(`(func (result i32) (i8x16.extract_lane_u  -1 (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:400
assert_malformed(
  () => instantiate(`(func (result i32) (i16x8.extract_lane_s  -1 (v128.const i16x8 0 0 0 0 0 0 0 0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:401
assert_malformed(
  () => instantiate(`(func (result i32) (i16x8.extract_lane_u  -1 (v128.const i16x8 0 0 0 0 0 0 0 0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:402
assert_malformed(
  () => instantiate(`(func (result i32) (i32x4.extract_lane  -1 (v128.const i32x4 0 0 0 0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:403
assert_malformed(
  () => instantiate(`(func (result f32) (f32x4.extract_lane  -1 (v128.const f32x4 0 0 0 0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:404
assert_malformed(
  () => instantiate(`(func (result v128) (i8x16.replace_lane  -1 (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0) (i32.const 1))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:405
assert_malformed(
  () => instantiate(`(func (result v128) (i16x8.replace_lane  -1 (v128.const i16x8 0 0 0 0 0 0 0 0) (i32.const 1))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:406
assert_malformed(
  () => instantiate(`(func (result v128) (i32x4.replace_lane  -1 (v128.const i32x4 0 0 0 0) (i32.const 1))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:407
assert_malformed(
  () => instantiate(`(func (result v128) (f32x4.replace_lane  -1 (v128.const f32x4 0 0 0 0) (i32.const 1))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:408
assert_malformed(
  () => instantiate(`(func (result i64) (i64x2.extract_lane  -1 (v128.const i64x2 0 0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:409
assert_malformed(
  () => instantiate(`(func (result f64) (f64x2.extract_lane  -1 (v128.const f64x2 0 0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:410
assert_malformed(
  () => instantiate(`(func (result v128) (i64x2.replace_lane  -1 (v128.const i64x2 0 0) (i64.const 1))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:411
assert_malformed(
  () => instantiate(`(func (result v128) (f64x2.replace_lane  -1 (v128.const f64x2 0 0) (f64.const 1))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:415
assert_malformed(
  () => instantiate(`(func (result i32) (i8x16.extract_lane_s 256 (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0))) `),
  `malformed lane index`,
);

// ./test/core/simd/simd_lane.wast:416
assert_malformed(
  () => instantiate(`(func (result i32) (i8x16.extract_lane_u 256 (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0))) `),
  `malformed lane index`,
);

// ./test/core/simd/simd_lane.wast:417
assert_malformed(
  () => instantiate(`(func (result i32) (i16x8.extract_lane_s 256 (v128.const i16x8 0 0 0 0 0 0 0 0))) `),
  `malformed lane index`,
);

// ./test/core/simd/simd_lane.wast:418
assert_malformed(
  () => instantiate(`(func (result i32) (i16x8.extract_lane_u 256 (v128.const i16x8 0 0 0 0 0 0 0 0))) `),
  `malformed lane index`,
);

// ./test/core/simd/simd_lane.wast:419
assert_malformed(
  () => instantiate(`(func (result i32) (i32x4.extract_lane 256 (v128.const i32x4 0 0 0 0))) `),
  `malformed lane index`,
);

// ./test/core/simd/simd_lane.wast:420
assert_malformed(
  () => instantiate(`(func (result f32) (f32x4.extract_lane 256 (v128.const f32x4 0 0 0 0))) `),
  `malformed lane index`,
);

// ./test/core/simd/simd_lane.wast:421
assert_malformed(
  () => instantiate(`(func (result v128) (i8x16.replace_lane 256 (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0) (i32.const 1))) `),
  `malformed lane index`,
);

// ./test/core/simd/simd_lane.wast:422
assert_malformed(
  () => instantiate(`(func (result v128) (i16x8.replace_lane 256 (v128.const i16x8 0 0 0 0 0 0 0 0) (i32.const 1))) `),
  `malformed lane index`,
);

// ./test/core/simd/simd_lane.wast:423
assert_malformed(
  () => instantiate(`(func (result v128) (i32x4.replace_lane 256 (v128.const i32x4 0 0 0 0) (i32.const 1))) `),
  `malformed lane index`,
);

// ./test/core/simd/simd_lane.wast:424
assert_malformed(
  () => instantiate(`(func (result v128) (f32x4.replace_lane 256 (v128.const f32x4 0 0 0 0) (i32.const 1))) `),
  `malformed lane index`,
);

// ./test/core/simd/simd_lane.wast:425
assert_malformed(
  () => instantiate(`(func (result i64) (i64x2.extract_lane 256 (v128.const i64x2 0 0))) `),
  `malformed lane index`,
);

// ./test/core/simd/simd_lane.wast:426
assert_malformed(
  () => instantiate(`(func (result f64) (f64x2.extract_lane 256 (v128.const f64x2 0 0))) `),
  `malformed lane index`,
);

// ./test/core/simd/simd_lane.wast:427
assert_malformed(
  () => instantiate(`(func (result v128) (i64x2.replace_lane 256 (v128.const i64x2 0 0) (i64.const 1))) `),
  `malformed lane index`,
);

// ./test/core/simd/simd_lane.wast:428
assert_malformed(
  () => instantiate(`(func (result v128) (f64x2.replace_lane 256 (v128.const f64x2 0 0) (f64.const 1))) `),
  `malformed lane index`,
);

// ./test/core/simd/simd_lane.wast:432
assert_invalid(
  () => instantiate(`(module (func (result i32) (i8x16.extract_lane_s 16 (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:433
assert_invalid(
  () => instantiate(`(module (func (result i32) (i8x16.extract_lane_s 255 (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:434
assert_invalid(
  () => instantiate(`(module (func (result i32) (i8x16.extract_lane_u 16 (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:435
assert_invalid(
  () => instantiate(`(module (func (result i32) (i8x16.extract_lane_u 255 (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:436
assert_invalid(
  () => instantiate(`(module (func (result i32) (i16x8.extract_lane_s 8 (v128.const i16x8 0 0 0 0 0 0 0 0))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:437
assert_invalid(
  () => instantiate(`(module (func (result i32) (i16x8.extract_lane_s 255 (v128.const i16x8 0 0 0 0 0 0 0 0))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:438
assert_invalid(
  () => instantiate(`(module (func (result i32) (i16x8.extract_lane_u 8 (v128.const i16x8 0 0 0 0 0 0 0 0))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:439
assert_invalid(
  () => instantiate(`(module (func (result i32) (i16x8.extract_lane_u 255 (v128.const i16x8 0 0 0 0 0 0 0 0))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:440
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32x4.extract_lane 4 (v128.const i32x4 0 0 0 0))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:441
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32x4.extract_lane 255 (v128.const i32x4 0 0 0 0))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:442
assert_invalid(
  () => instantiate(`(module (func (result f32) (f32x4.extract_lane 4 (v128.const f32x4 0 0 0 0))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:443
assert_invalid(
  () => instantiate(`(module (func (result f32) (f32x4.extract_lane 255 (v128.const f32x4 0 0 0 0))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:444
assert_invalid(
  () => instantiate(`(module (func (result v128) (i8x16.replace_lane 16 (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0) (i32.const 1))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:445
assert_invalid(
  () => instantiate(`(module (func (result v128) (i8x16.replace_lane 255 (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0) (i32.const 1))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:446
assert_invalid(
  () => instantiate(`(module (func (result v128) (i16x8.replace_lane 16 (v128.const i16x8 0 0 0 0 0 0 0 0) (i32.const 1))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:447
assert_invalid(
  () => instantiate(`(module (func (result v128) (i16x8.replace_lane 255 (v128.const i16x8 0 0 0 0 0 0 0 0) (i32.const 1))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:448
assert_invalid(
  () => instantiate(`(module (func (result v128) (i32x4.replace_lane 4 (v128.const i32x4 0 0 0 0) (i32.const 1))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:449
assert_invalid(
  () => instantiate(`(module (func (result v128) (i32x4.replace_lane 255 (v128.const i32x4 0 0 0 0) (i32.const 1))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:450
assert_invalid(
  () => instantiate(`(module (func (result v128) (f32x4.replace_lane 4 (v128.const f32x4 0 0 0 0) (f32.const 1))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:451
assert_invalid(
  () => instantiate(`(module (func (result v128) (f32x4.replace_lane 255 (v128.const f32x4 0 0 0 0) (f32.const 1))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:452
assert_invalid(
  () => instantiate(`(module (func (result i64) (i64x2.extract_lane 2 (v128.const i64x2 0 0))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:453
assert_invalid(
  () => instantiate(`(module (func (result i64) (i64x2.extract_lane 255 (v128.const i64x2 0 0))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:454
assert_invalid(
  () => instantiate(`(module (func (result f64) (f64x2.extract_lane 2 (v128.const f64x2 0 0))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:455
assert_invalid(
  () => instantiate(`(module (func (result f64) (f64x2.extract_lane 255 (v128.const f64x2 0 0))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:456
assert_invalid(
  () => instantiate(`(module (func (result v128) (i64x2.replace_lane 2 (v128.const i64x2 0 0) (i64.const 1))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:457
assert_invalid(
  () => instantiate(`(module (func (result v128) (i64x2.replace_lane 255 (v128.const i64x2 0 0) (i64.const 1))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:458
assert_invalid(
  () => instantiate(`(module (func (result v128) (f64x2.replace_lane 2 (v128.const f64x2 0 0) (f64.const 1))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:459
assert_invalid(
  () => instantiate(`(module (func (result v128) (f64x2.replace_lane 255 (v128.const f64x2 0 0) (f64.const 1.0))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:463
assert_invalid(
  () => instantiate(`(module (func (result i32) (i16x8.extract_lane_s 8 (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:464
assert_invalid(
  () => instantiate(`(module (func (result i32) (i16x8.extract_lane_u 8 (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:465
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32x4.extract_lane 4 (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:466
assert_invalid(
  () => instantiate(`(module (func (result i32) (f32x4.extract_lane 4 (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:467
assert_invalid(
  () => instantiate(`(module (func (result v128) (i16x8.replace_lane 8 (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0) (i32.const 1))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:468
assert_invalid(
  () => instantiate(`(module (func (result v128) (i32x4.replace_lane 4 (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0) (i32.const 1))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:469
assert_invalid(
  () => instantiate(`(module (func (result v128) (f32x4.replace_lane 4 (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0) (f32.const 1))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:470
assert_invalid(
  () => instantiate(`(module (func (result i64) (i64x2.extract_lane 2 (v128.const i64x2 0 0))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:471
assert_invalid(
  () => instantiate(`(module (func (result f64) (f64x2.extract_lane 2 (v128.const f64x2 0 0))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:472
assert_invalid(
  () => instantiate(`(module (func (result v128) (i64x2.replace_lane 2 (v128.const i64x2 0 0) (i64.const 1))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:473
assert_invalid(
  () => instantiate(`(module (func (result v128) (f64x2.replace_lane 2 (v128.const f64x2 0 0) (f64.const 1.0))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:477
assert_invalid(
  () => instantiate(`(module (func (result i32) (i8x16.extract_lane_s 0 (i32.const 0))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:478
assert_invalid(
  () => instantiate(`(module (func (result i32) (i8x16.extract_lane_u 0 (i64.const 0))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:479
assert_invalid(
  () => instantiate(`(module (func (result i32) (i8x16.extract_lane_s 0 (f32.const 0.0))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:480
assert_invalid(
  () => instantiate(`(module (func (result i32) (i8x16.extract_lane_u 0 (f64.const 0.0))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:481
assert_invalid(
  () => instantiate(`(module (func (result i32) (i32x4.extract_lane 0 (i32.const 0))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:482
assert_invalid(
  () => instantiate(`(module (func (result f32) (f32x4.extract_lane 0 (f32.const 0.0))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:483
assert_invalid(
  () => instantiate(`(module (func (result v128) (i8x16.replace_lane 0 (i32.const 0) (i32.const 1))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:484
assert_invalid(
  () => instantiate(`(module (func (result v128) (i16x8.replace_lane 0 (i64.const 0) (i32.const 1))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:485
assert_invalid(
  () => instantiate(`(module (func (result v128) (i32x4.replace_lane 0 (i32.const 0) (i32.const 1))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:486
assert_invalid(
  () => instantiate(`(module (func (result v128) (f32x4.replace_lane 0 (f32.const 0.0) (i32.const 1))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:487
assert_invalid(
  () => instantiate(`(module (func (result i64) (i64x2.extract_lane 0 (i64.const 0))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:488
assert_invalid(
  () => instantiate(`(module (func (result f64) (f64x2.extract_lane 0 (f64.const 0.0))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:489
assert_invalid(
  () => instantiate(`(module (func (result v128) (i32x4.replace_lane 0 (i32.const 0) (i32.const 1))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:490
assert_invalid(
  () => instantiate(`(module (func (result v128) (f32x4.replace_lane 0 (f32.const 0.0) (i32.const 1))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:494
assert_invalid(
  () => instantiate(`(module (func (result v128) (i8x16.replace_lane 0 (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0) (f32.const 1.0))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:495
assert_invalid(
  () => instantiate(`(module (func (result v128) (i16x8.replace_lane 0 (v128.const i16x8 0 0 0 0 0 0 0 0) (f64.const 1.0))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:496
assert_invalid(
  () => instantiate(`(module (func (result v128) (i32x4.replace_lane 0 (v128.const i32x4 0 0 0 0) (f32.const 1.0))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:497
assert_invalid(
  () => instantiate(`(module (func (result v128) (f32x4.replace_lane 0 (v128.const f32x4 0 0 0 0) (i32.const 1))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:499
assert_invalid(
  () => instantiate(`(module (func (result v128) (i64x2.replace_lane 0 (v128.const i64x2 0 0) (f64.const 1.0))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:500
assert_invalid(
  () => instantiate(`(module (func (result v128) (f64x2.replace_lane 0 (v128.const f64x2 0 0) (i64.const 1))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:503
assert_invalid(
  () => instantiate(`(module (func (result v128)
  (i8x16.swizzle (i32.const 1) (v128.const i8x16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:505
assert_invalid(
  () => instantiate(`(module (func (result v128)
  (i8x16.swizzle (v128.const i8x16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0) (i32.const 2))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:507
assert_invalid(
  () => instantiate(`(module (func (result v128)
  (i8x16.shuffle 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 (f32.const 3.0)
  (v128.const i8x16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:510
assert_invalid(
  () => instantiate(`(module (func (result v128)
  (i8x16.shuffle 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15
  (v128.const i8x16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0) (f32.const 4.0))))`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:515
assert_malformed(
  () => instantiate(`(func (param v128) (result v128) (i8x16.shuffle 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 (local.get 0) (local.get 0))) `),
  `invalid lane length`,
);

// ./test/core/simd/simd_lane.wast:518
assert_malformed(
  () => instantiate(`(func (param v128) (result v128) (i8x16.shuffle 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 (local.get 0) (local.get 0))) `),
  `invalid lane length`,
);

// ./test/core/simd/simd_lane.wast:521
assert_malformed(
  () => instantiate(`(func (result v128) (i8x16.shuffle 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 -1 (v128.const i8x16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0) (v128.const i8x16 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15))) `),
  `malformed lane index`,
);

// ./test/core/simd/simd_lane.wast:525
assert_malformed(
  () => instantiate(`(func (result v128) (i8x16.shuffle 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 256 (v128.const i8x16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0) (v128.const i8x16 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15))) `),
  `malformed lane index`,
);

// ./test/core/simd/simd_lane.wast:529
assert_invalid(
  () => instantiate(`(module (func (result v128)
  (i8x16.shuffle 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 255
  (v128.const i8x16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0)
  (v128.const i8x16 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15))))`),
  `invalid lane index`,
);

// ./test/core/simd/simd_lane.wast:536
assert_malformed(
  () => instantiate(`(func (result i32) (i8x16.extract_lane 0 (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0))) `),
  `unknown operator`,
);

// ./test/core/simd/simd_lane.wast:537
assert_malformed(
  () => instantiate(`(func (result i32) (i16x8.extract_lane 0 (v128.const i16x8 0 0 0 0 0 0 0 0))) `),
  `unknown operator`,
);

// ./test/core/simd/simd_lane.wast:538
assert_malformed(
  () => instantiate(`(func (result i32) (i32x4.extract_lane_s 0 (v128.const i32x4 0 0 0 0))) `),
  `unknown operator`,
);

// ./test/core/simd/simd_lane.wast:539
assert_malformed(
  () => instantiate(`(func (result i32) (i32x4.extract_lane_u 0 (v128.const i32x4 0 0 0 0))) `),
  `unknown operator`,
);

// ./test/core/simd/simd_lane.wast:540
assert_malformed(
  () => instantiate(`(func (result i32) (i64x2.extract_lane_s 0 (v128.const i64x2 0 0))) `),
  `unknown operator`,
);

// ./test/core/simd/simd_lane.wast:541
assert_malformed(
  () => instantiate(`(func (result i32) (i64x2.extract_lane_u 0 (v128.const i64x2 0 0))) `),
  `unknown operator`,
);

// ./test/core/simd/simd_lane.wast:545
assert_malformed(
  () => instantiate(`(func (result v128)  (i8x16.shuffle1 (v128.const i8x16 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15)  (v128.const i8x16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0))) `),
  `unknown operator`,
);

// ./test/core/simd/simd_lane.wast:549
assert_malformed(
  () => instantiate(`(func (result v128)  (i8x16.shuffle2_imm  0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15  (v128.const i8x16 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15)  (v128.const i8x16 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31))) `),
  `unknown operator`,
);

// ./test/core/simd/simd_lane.wast:555
assert_malformed(
  () => instantiate(`(func (result v128)  (v8x16.swizzle (v128.const i8x16 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15)  (v128.const i8x16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0))) `),
  `unknown operator`,
);

// ./test/core/simd/simd_lane.wast:559
assert_malformed(
  () => instantiate(`(func (result v128)  (v8x16.shuffle  0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15  (v128.const i8x16 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15)  (v128.const i8x16 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31))) `),
  `unknown operator`,
);

// ./test/core/simd/simd_lane.wast:570
assert_malformed(
  () => instantiate(`(func (param i32) (result i32) (i8x16.extract_lane_s (local.get 0) (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:571
assert_malformed(
  () => instantiate(`(func (param i32) (result i32) (i8x16.extract_lane_u (local.get 0) (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:572
assert_malformed(
  () => instantiate(`(func (param i32) (result i32) (i16x8.extract_lane_s (local.get 0) (v128.const i16x8 0 0 0 0 0 0 0 0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:573
assert_malformed(
  () => instantiate(`(func (param i32) (result i32) (i16x8.extract_lane_u (local.get 0) (v128.const i16x8 0 0 0 0 0 0 0 0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:574
assert_malformed(
  () => instantiate(`(func (param i32) (result i32) (i32x4.extract_lane (local.get 0) (v128.const i32x4 0 0 0 0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:575
assert_malformed(
  () => instantiate(`(func (param i32) (result f32) (f32x4.extract_lane (local.get 0) (v128.const f32x4 0 0 0 0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:576
assert_malformed(
  () => instantiate(`(func (param i32) (result v128) (i8x16.replace_lane (local.get 0) (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0) (i32.const 1))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:577
assert_malformed(
  () => instantiate(`(func (param i32) (result v128) (i16x8.replace_lane (local.get 0) (v128.const i16x8 0 0 0 0 0 0 0 0) (i32.const 1))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:578
assert_malformed(
  () => instantiate(`(func (param i32) (result v128) (i32x4.replace_lane (local.get 0) (v128.const i32x4 0 0 0 0) (i32.const 1))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:579
assert_malformed(
  () => instantiate(`(func (param i32) (result v128) (f32x4.replace_lane (local.get 0) (v128.const f32x4 0 0 0 0) (f32.const 1.0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:581
assert_malformed(
  () => instantiate(`(func (param i32) (result i64) (i64x2.extract_lane (local.get 0) (v128.const i64x2 0 0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:582
assert_malformed(
  () => instantiate(`(func (param i32) (result f64) (f64x2.extract_lane (local.get 0) (v128.const f64x2 0 0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:583
assert_malformed(
  () => instantiate(`(func (param i32) (result v128) (i64x2.replace_lane (local.get 0) (v128.const i64x2 0 0) (i64.const 1))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:584
assert_malformed(
  () => instantiate(`(func (param i32) (result v128) (f64x2.replace_lane (local.get 0) (v128.const f64x2 0 0) (f64.const 1.0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:588
assert_malformed(
  () => instantiate(`(func (result i32) (i8x16.extract_lane_s 1.5 (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:589
assert_malformed(
  () => instantiate(`(func (result i32) (i8x16.extract_lane_u nan (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:590
assert_malformed(
  () => instantiate(`(func (result i32) (i16x8.extract_lane_s inf (v128.const i16x8 0 0 0 0 0 0 0 0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:591
assert_malformed(
  () => instantiate(`(func (result i32) (i16x8.extract_lane_u -inf (v128.const i16x8 0 0 0 0 0 0 0 0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:592
assert_malformed(
  () => instantiate(`(func (result i32) (i32x4.extract_lane nan (v128.const i32x4 0 0 0 0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:593
assert_malformed(
  () => instantiate(`(func (result f32) (f32x4.extract_lane nan (v128.const f32x4 0 0 0 0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:594
assert_malformed(
  () => instantiate(`(func (result v128) (i8x16.replace_lane -2.5 (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0) (i32.const 1))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:595
assert_malformed(
  () => instantiate(`(func (result v128) (i16x8.replace_lane nan (v128.const i16x8 0 0 0 0 0 0 0 0) (i32.const 1))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:596
assert_malformed(
  () => instantiate(`(func (result v128) (i32x4.replace_lane inf (v128.const i32x4 0 0 0 0) (i32.const 1))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:597
assert_malformed(
  () => instantiate(`(func (result v128) (f32x4.replace_lane -inf (v128.const f32x4 0 0 0 0) (f32.const 1.1))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:600
assert_malformed(
  () => instantiate(`(func (result v128)  (i8x16.shuffle (v128.const i8x16 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31)  (v128.const i8x16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0)  (v128.const i8x16 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15))) `),
  `invalid lane length`,
);

// ./test/core/simd/simd_lane.wast:604
assert_malformed(
  () => instantiate(`(func (result v128)  (i8x16.shuffle 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15.0)  (v128.const i8x16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0)  (v128.const i8x16 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15))) `),
  `malformed lane index`,
);

// ./test/core/simd/simd_lane.wast:608
assert_malformed(
  () => instantiate(`(func (result v128)  (i8x16.shuffle 0.5 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15)  (v128.const i8x16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0)  (v128.const i8x16 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15))) `),
  `malformed lane index`,
);

// ./test/core/simd/simd_lane.wast:612
assert_malformed(
  () => instantiate(`(func (result v128)  (i8x16.shuffle -inf 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15)  (v128.const i8x16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0)  (v128.const i8x16 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15))) `),
  `malformed lane index`,
);

// ./test/core/simd/simd_lane.wast:616
assert_malformed(
  () => instantiate(`(func (result v128)  (i8x16.shuffle 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 inf)  (v128.const i8x16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0)  (v128.const i8x16 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15))) `),
  `malformed lane index`,
);

// ./test/core/simd/simd_lane.wast:620
assert_malformed(
  () => instantiate(`(func (result v128)  (i8x16.shuffle nan 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15)  (v128.const i8x16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0)  (v128.const i8x16 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15))) `),
  `malformed lane index`,
);

// ./test/core/simd/simd_lane.wast:628
let $1 = instantiate(`(module
  ;; as *.replace_lane's operand
  (func (export "i8x16_extract_lane_s") (param v128 v128) (result v128)
    (i8x16.replace_lane 0 (local.get 0) (i8x16.extract_lane_s 0 (local.get 1))))
  (func (export "i8x16_extract_lane_u") (param v128 v128) (result v128)
    (i8x16.replace_lane 0 (local.get 0) (i8x16.extract_lane_u 0 (local.get 1))))
  (func (export "i16x8_extract_lane_s") (param v128 v128) (result v128)
    (i16x8.replace_lane 0 (local.get 0) (i16x8.extract_lane_s 0 (local.get 1))))
  (func (export "i16x8_extract_lane_u") (param v128 v128) (result v128)
    (i16x8.replace_lane 0 (local.get 0) (i16x8.extract_lane_u 0 (local.get 1))))
  (func (export "i32x4_extract_lane") (param v128 v128) (result v128)
    (i32x4.replace_lane 0 (local.get 0) (i32x4.extract_lane 0 (local.get 1))))
  (func (export "f32x4_extract_lane") (param v128 v128) (result v128)
    (i32x4.replace_lane 0 (local.get 0) (i32x4.extract_lane 0 (local.get 1))))
  (func (export "i64x2_extract_lane") (param v128 v128) (result v128)
    (i64x2.replace_lane 0 (local.get 0) (i64x2.extract_lane 0 (local.get 1))))
  (func (export "f64x2_extract_lane") (param v128 v128) (result v128)
    (f64x2.replace_lane 0 (local.get 0) (f64x2.extract_lane 0 (local.get 1))))

  ;; as *.extract_lane's operand
  (func (export "i8x16_replace_lane-s") (param v128 i32) (result i32)
    (i8x16.extract_lane_s 15 (i8x16.replace_lane 15 (local.get 0) (local.get 1))))
  (func (export "i8x16_replace_lane-u") (param v128 i32) (result i32)
    (i8x16.extract_lane_u 15 (i8x16.replace_lane 15 (local.get 0) (local.get 1))))
  (func (export "i16x8_replace_lane-s") (param v128 i32) (result i32)
    (i16x8.extract_lane_s 7 (i16x8.replace_lane 7 (local.get 0) (local.get 1))))
  (func (export "i16x8_replace_lane-u") (param v128 i32) (result i32)
    (i16x8.extract_lane_u 7 (i16x8.replace_lane 7 (local.get 0) (local.get 1))))
  (func (export "i32x4_replace_lane") (param v128 i32) (result i32)
    (i32x4.extract_lane 3 (i32x4.replace_lane 3 (local.get 0) (local.get 1))))
  (func (export "f32x4_replace_lane") (param v128 f32) (result f32)
    (f32x4.extract_lane 3 (f32x4.replace_lane 3 (local.get 0) (local.get 1))))
  (func (export "i64x2_replace_lane") (param v128 i64) (result i64)
    (i64x2.extract_lane 1 (i64x2.replace_lane 1 (local.get 0) (local.get 1))))
  (func (export "f64x2_replace_lane") (param v128 f64) (result f64)
    (f64x2.extract_lane 1 (f64x2.replace_lane 1 (local.get 0) (local.get 1))))

  ;; i8x16.replace outputs as shuffle operand
  (func (export "as-v8x16_swizzle-operand") (param v128 i32 v128) (result v128)
    (i8x16.swizzle (i8x16.replace_lane 0 (local.get 0) (local.get 1)) (local.get 2)))
  (func (export "as-v8x16_shuffle-operands") (param v128 i32 v128 i32) (result v128)
    (i8x16.shuffle 16 1 18 3 20 5 22 7 24 9 26 11 28 13 30 15
      (i8x16.replace_lane 0 (local.get 0) (local.get 1))
      (i8x16.replace_lane 15 (local.get 2) (local.get 3))))
)`);

// ./test/core/simd/simd_lane.wast:674
assert_return(
  () => invoke($1, `i8x16_extract_lane_s`, [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    i8x16([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]),
  ]),
  [
    i8x16([0xff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ],
);

// ./test/core/simd/simd_lane.wast:675
assert_return(
  () => invoke($1, `i8x16_extract_lane_u`, [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    i8x16([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]),
  ]),
  [
    i8x16([0xff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ],
);

// ./test/core/simd/simd_lane.wast:676
assert_return(
  () => invoke($1, `i16x8_extract_lane_s`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    i16x8([0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff]),
  ]),
  [i16x8([0xffff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])],
);

// ./test/core/simd/simd_lane.wast:677
assert_return(
  () => invoke($1, `i16x8_extract_lane_u`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    i16x8([0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff]),
  ]),
  [i16x8([0xffff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])],
);

// ./test/core/simd/simd_lane.wast:678
assert_return(
  () => invoke($1, `i32x4_extract_lane`, [
    i32x4([0x0, 0x0, 0x0, 0x0]),
    i32x4([0x10000, 0xffffffff, 0xffffffff, 0xffffffff]),
  ]),
  [i32x4([0x10000, 0x0, 0x0, 0x0])],
);

// ./test/core/simd/simd_lane.wast:679
assert_return(
  () => invoke($1, `f32x4_extract_lane`, [
    f32x4([0, 0, 0, 0]),
    bytes('v128', [
      0x99,
      0x76,
      0x96,
      0x7e,
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
      value("f32", 100000000000000000000000000000000000000),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:680
assert_return(
  () => invoke($1, `i8x16_replace_lane-s`, [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    255,
  ]),
  [value("i32", -1)],
);

// ./test/core/simd/simd_lane.wast:681
assert_return(
  () => invoke($1, `i8x16_replace_lane-u`, [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    255,
  ]),
  [value("i32", 255)],
);

// ./test/core/simd/simd_lane.wast:682
assert_return(
  () => invoke($1, `i16x8_replace_lane-s`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    65535,
  ]),
  [value("i32", -1)],
);

// ./test/core/simd/simd_lane.wast:683
assert_return(
  () => invoke($1, `i16x8_replace_lane-u`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    65535,
  ]),
  [value("i32", 65535)],
);

// ./test/core/simd/simd_lane.wast:684
assert_return(
  () => invoke($1, `i32x4_replace_lane`, [i32x4([0x0, 0x0, 0x0, 0x0]), -1]),
  [value("i32", -1)],
);

// ./test/core/simd/simd_lane.wast:685
assert_return(
  () => invoke($1, `f32x4_replace_lane`, [f32x4([0, 0, 0, 0]), value("f32", 1.25)]),
  [value("f32", 1.25)],
);

// ./test/core/simd/simd_lane.wast:687
assert_return(
  () => invoke($1, `i64x2_extract_lane`, [
    i64x2([0x0n, 0x0n]),
    i64x2([0xffffffffffffffffn, 0xffffffffffffffffn]),
  ]),
  [i64x2([0xffffffffffffffffn, 0x0n])],
);

// ./test/core/simd/simd_lane.wast:688
assert_return(
  () => invoke($1, `f64x2_extract_lane`, [
    f64x2([0, 0]),
    bytes('v128', [
      0xa0,
      0xc8,
      0xeb,
      0x85,
      0xf3,
      0xcc,
      0xe1,
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
  [
    new F64x2Pattern(
      value("f64", 100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000),
      value("f64", 0),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:689
assert_return(() => invoke($1, `i64x2_replace_lane`, [i64x2([0x0n, 0x0n]), -1n]), [value("i64", -1n)]);

// ./test/core/simd/simd_lane.wast:690
assert_return(
  () => invoke($1, `f64x2_replace_lane`, [f64x2([0, 0]), value("f64", 2.5)]),
  [value("f64", 2.5)],
);

// ./test/core/simd/simd_lane.wast:692
assert_return(
  () => invoke($1, `as-v8x16_swizzle-operand`, [
    i8x16([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]),
    255,
    i8x16([0xff, 0xf, 0xe, 0xd, 0xc, 0xb, 0xa, 0x9, 0x8, 0x7, 0x6, 0x5, 0x4, 0x3, 0x2, 0x1]),
  ]),
  [
    i8x16([0x0, 0xf, 0xe, 0xd, 0xc, 0xb, 0xa, 0x9, 0x8, 0x7, 0x6, 0x5, 0x4, 0x3, 0x2, 0x1]),
  ],
);

// ./test/core/simd/simd_lane.wast:696
assert_return(
  () => invoke($1, `as-v8x16_shuffle-operands`, [
    i8x16([0x0, 0xff, 0x0, 0xff, 0xf, 0xff, 0x0, 0xff, 0xff, 0xff, 0x0, 0xff, 0x7f, 0xff, 0x0, 0xff]),
    1,
    i8x16([0x55, 0x0, 0x55, 0x0, 0x55, 0x0, 0x55, 0x0, 0x55, 0x0, 0x55, 0x0, 0x55, 0x1, 0x55, 0xff]),
    0,
  ]),
  [
    i8x16([0x55, 0xff, 0x55, 0xff, 0x55, 0xff, 0x55, 0xff, 0x55, 0xff, 0x55, 0xff, 0x55, 0xff, 0x55, 0xff]),
  ],
);

// ./test/core/simd/simd_lane.wast:703
let $2 = instantiate(`(module
  ;; Constructing SIMD values
  (func (export "as-i8x16_splat-operand") (param v128) (result v128)
    (i8x16.splat (i8x16.extract_lane_s 0 (local.get 0))))
  (func (export "as-i16x8_splat-operand") (param v128) (result v128)
    (i16x8.splat (i16x8.extract_lane_u 0 (local.get 0))))
  (func (export "as-i32x4_splat-operand") (param v128) (result v128)
    (i32x4.splat (i32x4.extract_lane 0 (local.get 0))))
  (func (export "as-f32x4_splat-operand") (param v128) (result v128)
    (f32x4.splat (f32x4.extract_lane 0 (local.get 0))))
  (func (export "as-i64x2_splat-operand") (param v128) (result v128)
    (i64x2.splat (i64x2.extract_lane 0 (local.get 0))))
  (func (export "as-f64x2_splat-operand") (param v128) (result v128)
    (f64x2.splat (f64x2.extract_lane 0 (local.get 0))))

  ;; Integer arithmetic
  (func (export "as-i8x16_add-operands") (param v128 i32 v128 i32) (result v128)
    (i8x16.add (i8x16.replace_lane 0 (local.get 0) (local.get 1)) (i8x16.replace_lane 15 (local.get 2) (local.get 3))))
  (func (export "as-i16x8_add-operands") (param v128 i32 v128 i32) (result v128)
    (i16x8.add (i16x8.replace_lane 0 (local.get 0) (local.get 1)) (i16x8.replace_lane 7 (local.get 2) (local.get 3))))
  (func (export "as-i32x4_add-operands") (param v128 i32 v128 i32) (result v128)
    (i32x4.add (i32x4.replace_lane 0 (local.get 0) (local.get 1)) (i32x4.replace_lane 3 (local.get 2) (local.get 3))))
  (func (export "as-i64x2_add-operands") (param v128 i64 v128 i64) (result v128)
    (i64x2.add (i64x2.replace_lane 0 (local.get 0) (local.get 1)) (i64x2.replace_lane 1 (local.get 2) (local.get 3))))

  (func (export "swizzle-as-i8x16_add-operands") (param v128 v128 v128 v128) (result v128)
    (i8x16.add (i8x16.swizzle (local.get 0) (local.get 1)) (i8x16.swizzle (local.get 2) (local.get 3))))
  (func (export "shuffle-as-i8x16_sub-operands") (param v128 v128 v128 v128) (result v128)
    (i8x16.sub (i8x16.shuffle 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 (local.get 0) (local.get 1))
      (i8x16.shuffle 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 (local.get 2) (local.get 3))))

  ;; Boolean horizontal reductions
  (func (export "as-i8x16_any_true-operand") (param v128 i32) (result i32)
    (v128.any_true (i8x16.replace_lane 0 (local.get 0) (local.get 1))))
  (func (export "as-i16x8_any_true-operand") (param v128 i32) (result i32)
    (v128.any_true (i16x8.replace_lane 0 (local.get 0) (local.get 1))))
  (func (export "as-i32x4_any_true-operand1") (param v128 i32) (result i32)
    (v128.any_true (i32x4.replace_lane 0 (local.get 0) (local.get 1))))
  (func (export "as-i32x4_any_true-operand2") (param v128 i64) (result i32)
    (v128.any_true (i64x2.replace_lane 0 (local.get 0) (local.get 1))))

  (func (export "swizzle-as-i8x16_all_true-operands") (param v128 v128) (result i32)
    (i8x16.all_true (i8x16.swizzle (local.get 0) (local.get 1))))
  (func (export "shuffle-as-i8x16_any_true-operands") (param v128 v128) (result i32)
    (v128.any_true (i8x16.shuffle 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 (local.get 0) (local.get 1))))
)`);

// ./test/core/simd/simd_lane.wast:750
assert_return(
  () => invoke($2, `as-i8x16_splat-operand`, [
    i8x16([0xff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ]),
  [
    i8x16([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]),
  ],
);

// ./test/core/simd/simd_lane.wast:751
assert_return(
  () => invoke($2, `as-i16x8_splat-operand`, [
    i16x8([0xffff, 0xffff, 0xffff, 0xffff, 0x0, 0x0, 0x0, 0x0]),
  ]),
  [i16x8([0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff, 0xffff])],
);

// ./test/core/simd/simd_lane.wast:752
assert_return(
  () => invoke($2, `as-i32x4_splat-operand`, [i32x4([0x10000, 0x0, 0x0, 0x0])]),
  [i32x4([0x10000, 0x10000, 0x10000, 0x10000])],
);

// ./test/core/simd/simd_lane.wast:753
assert_return(
  () => invoke($2, `as-f32x4_splat-operand`, [
    bytes('v128', [
      0xc3,
      0xf5,
      0x48,
      0x40,
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
      value("f32", 3.14),
      value("f32", 3.14),
      value("f32", 3.14),
      value("f32", 3.14),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:754
assert_return(
  () => invoke($2, `as-i64x2_splat-operand`, [i64x2([0xffffffffffffffffn, 0x0n])]),
  [i64x2([0xffffffffffffffffn, 0xffffffffffffffffn])],
);

// ./test/core/simd/simd_lane.wast:755
assert_return(
  () => invoke($2, `as-f64x2_splat-operand`, [
    bytes('v128', [
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0x0,
      0xf0,
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
  [new F64x2Pattern(value("f64", Infinity), value("f64", Infinity))],
);

// ./test/core/simd/simd_lane.wast:756
assert_return(
  () => invoke($2, `as-i8x16_add-operands`, [
    i8x16([0xff, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf, 0x10]),
    1,
    i8x16([0x10, 0xf, 0xe, 0xd, 0xc, 0xb, 0xa, 0x9, 0x8, 0x7, 0x6, 0x5, 0x4, 0x3, 0x2, 0xff]),
    1,
  ]),
  [
    i8x16([0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11]),
  ],
);

// ./test/core/simd/simd_lane.wast:760
assert_return(
  () => invoke($2, `as-i16x8_add-operands`, [
    i16x8([0xffff, 0x4, 0x9, 0x10, 0x19, 0x24, 0x31, 0x40]),
    1,
    i16x8([0x40, 0x31, 0x24, 0x19, 0x10, 0x9, 0x4, 0xffff]),
    1,
  ]),
  [i16x8([0x41, 0x35, 0x2d, 0x29, 0x29, 0x2d, 0x35, 0x41])],
);

// ./test/core/simd/simd_lane.wast:764
assert_return(
  () => invoke($2, `as-i32x4_add-operands`, [
    i32x4([0xffffffff, 0x8, 0x1b, 0x40]),
    1,
    i32x4([0x40, 0x1b, 0x8, 0xffffffff]),
    1,
  ]),
  [i32x4([0x41, 0x23, 0x23, 0x41])],
);

// ./test/core/simd/simd_lane.wast:766
assert_return(
  () => invoke($2, `as-i64x2_add-operands`, [
    i64x2([0xffffffffffffffffn, 0x8n]),
    1n,
    i64x2([0x40n, 0x1bn]),
    1n,
  ]),
  [i64x2([0x41n, 0x9n])],
);

// ./test/core/simd/simd_lane.wast:769
assert_return(
  () => invoke($2, `swizzle-as-i8x16_add-operands`, [
    i8x16([0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff]),
    i8x16([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]),
    i8x16([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]),
    i8x16([0xf, 0xe, 0xd, 0xc, 0xb, 0xa, 0x9, 0x8, 0x7, 0x6, 0x5, 0x4, 0x3, 0x2, 0x1, 0x0]),
  ]),
  [
    i8x16([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]),
  ],
);

// ./test/core/simd/simd_lane.wast:775
assert_return(
  () => invoke($2, `shuffle-as-i8x16_sub-operands`, [
    i8x16([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]),
    i8x16([0xf, 0xe, 0xd, 0xc, 0xb, 0xa, 0x9, 0x8, 0x7, 0x6, 0x5, 0x4, 0x3, 0x2, 0x1, 0x0]),
    i8x16([0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff]),
    i8x16([0xf, 0xe, 0xd, 0xc, 0xb, 0xa, 0x9, 0x8, 0x7, 0x6, 0x5, 0x4, 0x3, 0x2, 0x1, 0x0]),
  ]),
  [
    i8x16([0xf1, 0xf3, 0xf5, 0xf7, 0xf9, 0xfb, 0xfd, 0xff, 0x1, 0x3, 0x5, 0x7, 0x9, 0xb, 0xd, 0xf]),
  ],
);

// ./test/core/simd/simd_lane.wast:782
assert_return(
  () => invoke($2, `as-i8x16_any_true-operand`, [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    1,
  ]),
  [value("i32", 1)],
);

// ./test/core/simd/simd_lane.wast:783
assert_return(
  () => invoke($2, `as-i16x8_any_true-operand`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    1,
  ]),
  [value("i32", 1)],
);

// ./test/core/simd/simd_lane.wast:784
assert_return(
  () => invoke($2, `as-i32x4_any_true-operand1`, [i32x4([0x1, 0x0, 0x0, 0x0]), 0]),
  [value("i32", 0)],
);

// ./test/core/simd/simd_lane.wast:785
assert_return(
  () => invoke($2, `as-i32x4_any_true-operand2`, [i64x2([0x1n, 0x0n]), 0n]),
  [value("i32", 0)],
);

// ./test/core/simd/simd_lane.wast:787
assert_return(
  () => invoke($2, `swizzle-as-i8x16_all_true-operands`, [
    i8x16([0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf, 0x10]),
    i8x16([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]),
  ]),
  [value("i32", 1)],
);

// ./test/core/simd/simd_lane.wast:790
assert_return(
  () => invoke($2, `swizzle-as-i8x16_all_true-operands`, [
    i8x16([0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff]),
    i8x16([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0x10]),
  ]),
  [value("i32", 0)],
);

// ./test/core/simd/simd_lane.wast:793
assert_return(
  () => invoke($2, `shuffle-as-i8x16_any_true-operands`, [
    i8x16([0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff]),
    i8x16([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]),
  ]),
  [value("i32", 1)],
);

// ./test/core/simd/simd_lane.wast:799
let $3 = instantiate(`(module
  (memory 1)
  (func (export "as-v128_store-operand-1") (param v128 i32) (result v128)
    (v128.store (i32.const 0) (i8x16.replace_lane 0 (local.get 0) (local.get 1)))
    (v128.load (i32.const 0)))
  (func (export "as-v128_store-operand-2") (param v128 i32) (result v128)
    (v128.store (i32.const 0) (i16x8.replace_lane 0 (local.get 0) (local.get 1)))
    (v128.load (i32.const 0)))
  (func (export "as-v128_store-operand-3") (param v128 i32) (result v128)
    (v128.store (i32.const 0) (i32x4.replace_lane 0 (local.get 0) (local.get 1)))
    (v128.load (i32.const 0)))
  (func (export "as-v128_store-operand-4") (param v128 f32) (result v128)
    (v128.store (i32.const 0) (f32x4.replace_lane 0 (local.get 0) (local.get 1)))
    (v128.load (i32.const 0)))
  (func (export "as-v128_store-operand-5") (param v128 i64) (result v128)
    (v128.store (i32.const 0) (i64x2.replace_lane 0 (local.get 0) (local.get 1)))
    (v128.load (i32.const 0)))
  (func (export "as-v128_store-operand-6") (param v128 f64) (result v128)
    (v128.store (i32.const 0) (f64x2.replace_lane 0 (local.get 0) (local.get 1)))
    (v128.load (i32.const 0)))
)`);

// ./test/core/simd/simd_lane.wast:821
assert_return(
  () => invoke($3, `as-v128_store-operand-1`, [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    1,
  ]),
  [
    i8x16([0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ],
);

// ./test/core/simd/simd_lane.wast:822
assert_return(
  () => invoke($3, `as-v128_store-operand-2`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    256,
  ]),
  [i16x8([0x100, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])],
);

// ./test/core/simd/simd_lane.wast:823
assert_return(
  () => invoke($3, `as-v128_store-operand-3`, [i32x4([0x0, 0x0, 0x0, 0x0]), -1]),
  [i32x4([0xffffffff, 0x0, 0x0, 0x0])],
);

// ./test/core/simd/simd_lane.wast:824
assert_return(
  () => invoke($3, `as-v128_store-operand-4`, [f32x4([0, 0, 0, 0]), value("f32", 3.14)]),
  [
    new F32x4Pattern(
      value("f32", 3.14),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:825
assert_return(
  () => invoke($3, `as-v128_store-operand-5`, [i64x2([0x0n, 0x0n]), -1n]),
  [i64x2([0xffffffffffffffffn, 0x0n])],
);

// ./test/core/simd/simd_lane.wast:826
assert_return(
  () => invoke($3, `as-v128_store-operand-6`, [f64x2([0, 0]), value("f64", 3.14)]),
  [new F64x2Pattern(value("f64", 3.14), value("f64", 0))],
);

// ./test/core/simd/simd_lane.wast:830
let $4 = instantiate(`(module
  (global $$g (mut v128) (v128.const f32x4 0.0 0.0 0.0 0.0))
  (global $$h (mut v128) (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0))
  (func (export "as-if-condition-value") (param v128) (result i32)
    (if (result i32) (i8x16.extract_lane_s 0 (local.get 0)) (then (i32.const 0xff)) (else (i32.const 0))))
  (func (export "as-return-value-1") (param v128 i32) (result v128)
    (return (i16x8.replace_lane 0 (local.get 0) (local.get 1))))
  (func (export "as-local_set-value") (param v128) (result i32) (local i32)
    (local.set 1 (i32x4.extract_lane 0 (local.get 0)))
    (return (local.get 1)))
  (func (export "as-global_set-value-1") (param v128 f32) (result v128)
    (global.set $$g (f32x4.replace_lane 0 (local.get 0) (local.get 1)))
    (return (global.get $$g)))

   (func (export "as-return-value-2") (param v128 v128) (result v128)
    (return (i8x16.swizzle (local.get 0) (local.get 1))))
  (func (export "as-global_set-value-2") (param v128 v128) (result v128)
    (global.set $$h (i8x16.shuffle 0 1 2 3 4 5 6 7 24 25 26 27 28 29 30 31 (local.get 0) (local.get 1)))
    (return (global.get $$h)))

  (func (export "as-local_set-value-1") (param v128) (result i64) (local i64)
    (local.set 1 (i64x2.extract_lane 0 (local.get 0)))
    (return (local.get 1)))
  (func (export "as-global_set-value-3") (param v128 f64) (result v128)
    (global.set $$g (f64x2.replace_lane 0 (local.get 0) (local.get 1)))
    (return (global.get $$g)))
)`);

// ./test/core/simd/simd_lane.wast:858
assert_return(
  () => invoke($4, `as-if-condition-value`, [
    i8x16([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
  ]),
  [value("i32", 0)],
);

// ./test/core/simd/simd_lane.wast:859
assert_return(
  () => invoke($4, `as-return-value-1`, [
    i16x8([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]),
    1,
  ]),
  [i16x8([0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0])],
);

// ./test/core/simd/simd_lane.wast:860
assert_return(
  () => invoke($4, `as-local_set-value`, [
    i32x4([0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff]),
  ]),
  [value("i32", -1)],
);

// ./test/core/simd/simd_lane.wast:861
assert_return(
  () => invoke($4, `as-global_set-value-1`, [f32x4([0, 0, 0, 0]), value("f32", 3.14)]),
  [
    new F32x4Pattern(
      value("f32", 3.14),
      value("f32", 0),
      value("f32", 0),
      value("f32", 0),
    ),
  ],
);

// ./test/core/simd/simd_lane.wast:863
assert_return(
  () => invoke($4, `as-return-value-2`, [
    i8x16([0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff]),
    i8x16([0xf, 0xe, 0xd, 0xc, 0xb, 0xa, 0x9, 0x8, 0x7, 0x6, 0x5, 0x4, 0x3, 0x2, 0x1, 0x0]),
  ]),
  [
    i8x16([0xff, 0xfe, 0xfd, 0xfc, 0xfb, 0xfa, 0xf9, 0xf8, 0xf7, 0xf6, 0xf5, 0xf4, 0xf3, 0xf2, 0xf1, 0xf0]),
  ],
);

// ./test/core/simd/simd_lane.wast:867
assert_return(
  () => invoke($4, `as-global_set-value-2`, [
    i8x16([0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff]),
    i8x16([0x10, 0xf, 0xe, 0xd, 0xc, 0xb, 0xa, 0x9, 0x8, 0x7, 0x6, 0x5, 0x4, 0x3, 0x2, 0x1]),
  ]),
  [
    i8x16([0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0x8, 0x7, 0x6, 0x5, 0x4, 0x3, 0x2, 0x1]),
  ],
);

// ./test/core/simd/simd_lane.wast:872
assert_return(
  () => invoke($4, `as-local_set-value-1`, [
    i64x2([0xffffffffffffffffn, 0xffffffffffffffffn]),
  ]),
  [value("i64", -1n)],
);

// ./test/core/simd/simd_lane.wast:873
assert_return(
  () => invoke($4, `as-global_set-value-3`, [f64x2([0, 0]), value("f64", 3.14)]),
  [new F64x2Pattern(value("f64", 3.14), value("f64", 0))],
);

// ./test/core/simd/simd_lane.wast:877
assert_malformed(
  () => instantiate(`(func (result i32) (i8x16.extract_lane_u +0x0f (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:878
assert_malformed(
  () => instantiate(`(func (result f32) (f32x4.extract_lane +03 (v128.const f32x4 0 0 0 0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:879
assert_malformed(
  () => instantiate(`(func (result i64) (i64x2.extract_lane +1 (v128.const i64x2 0 0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:880
assert_malformed(
  () => instantiate(`(func (result v128) (i8x16.replace_lane +015 (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0) (i32.const 1))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:881
assert_malformed(
  () => instantiate(`(func (result v128) (i16x8.replace_lane +0x7 (v128.const i16x8 0 0 0 0 0 0 0 0) (i32.const 1))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:882
assert_malformed(
  () => instantiate(`(func (result v128) (i32x4.replace_lane +3 (v128.const i32x4 0 0 0 0) (i32.const 1))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:883
assert_malformed(
  () => instantiate(`(func (result v128) (f64x2.replace_lane +0x01 (v128.const f64x2 0 0) (f64.const 1.0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:887
let $5 = instantiate(`(module (func (result i32) (i8x16.extract_lane_s 0x0f (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0))))`);

// ./test/core/simd/simd_lane.wast:888
let $6 = instantiate(`(module (func (result i32) (i16x8.extract_lane_s 0x07 (v128.const i16x8 0 0 0 0 0 0 0 0))))`);

// ./test/core/simd/simd_lane.wast:889
let $7 = instantiate(`(module (func (result i32) (i16x8.extract_lane_u 0x0_7 (v128.const i16x8 0 0 0 0 0 0 0 0))))`);

// ./test/core/simd/simd_lane.wast:890
let $8 = instantiate(`(module (func (result i32) (i32x4.extract_lane 03 (v128.const i32x4 0 0 0 0))))`);

// ./test/core/simd/simd_lane.wast:891
let $9 = instantiate(`(module (func (result f64) (f64x2.extract_lane 0x1 (v128.const f64x2 0 0))))`);

// ./test/core/simd/simd_lane.wast:892
let $10 = instantiate(`(module (func (result v128) (f32x4.replace_lane 0x3 (v128.const f32x4 0 0 0 0) (f32.const 1.0))))`);

// ./test/core/simd/simd_lane.wast:893
let $11 = instantiate(`(module (func (result v128) (i64x2.replace_lane 01 (v128.const i64x2 0 0) (i64.const 1))))`);

// ./test/core/simd/simd_lane.wast:897
assert_malformed(
  () => instantiate(`(func (result i32) (i8x16.extract_lane_s 1.0 (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0))) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:901
assert_malformed(
  () => instantiate(`(func $$i8x16.extract_lane_s-1st-arg-empty (result i32)   (i8x16.extract_lane_s (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0)) ) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:909
assert_invalid(
  () => instantiate(`(module
    (func $$i8x16.extract_lane_s-2nd-arg-empty (result i32)
      (i8x16.extract_lane_s 0)
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:917
assert_malformed(
  () => instantiate(`(func $$i8x16.extract_lane_s-arg-empty (result i32)   (i8x16.extract_lane_s) ) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:925
assert_malformed(
  () => instantiate(`(func $$i16x8.extract_lane_u-1st-arg-empty (result i32)   (i16x8.extract_lane_u (v128.const i16x8 0 0 0 0 0 0 0 0)) ) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:933
assert_invalid(
  () => instantiate(`(module
    (func $$i16x8.extract_lane_u-2nd-arg-empty (result i32)
      (i16x8.extract_lane_u 0)
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:941
assert_malformed(
  () => instantiate(`(func $$i16x8.extract_lane_u-arg-empty (result i32)   (i16x8.extract_lane_u) ) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:949
assert_malformed(
  () => instantiate(`(func $$i32x4.extract_lane-1st-arg-empty (result i32)   (i32x4.extract_lane (v128.const i32x4 0 0 0 0)) ) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:957
assert_invalid(
  () => instantiate(`(module
    (func $$i32x4.extract_lane-2nd-arg-empty (result i32)
      (i32x4.extract_lane 0)
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:965
assert_malformed(
  () => instantiate(`(func $$i32x4.extract_lane-arg-empty (result i32)   (i32x4.extract_lane) ) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:973
assert_malformed(
  () => instantiate(`(func $$i64x2.extract_lane-1st-arg-empty (result i64)   (i64x2.extract_lane (v128.const i64x2 0 0)) ) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:981
assert_invalid(
  () => instantiate(`(module
    (func $$i64x2.extract_lane-2nd-arg-empty (result i64)
      (i64x2.extract_lane 0)
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:989
assert_malformed(
  () => instantiate(`(func $$i64x2.extract_lane-arg-empty (result i64)   (i64x2.extract_lane) ) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:997
assert_malformed(
  () => instantiate(`(func $$f32x4.extract_lane-1st-arg-empty (result f32)   (f32x4.extract_lane (v128.const f32x4 0 0 0 0)) ) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:1005
assert_invalid(
  () => instantiate(`(module
    (func $$f32x4.extract_lane-2nd-arg-empty (result f32)
      (f32x4.extract_lane 0)
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:1013
assert_malformed(
  () => instantiate(`(func $$f32x4.extract_lane-arg-empty (result f32)   (f32x4.extract_lane) ) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:1021
assert_malformed(
  () => instantiate(`(func $$f64x2.extract_lane-1st-arg-empty (result f64)   (f64x2.extract_lane (v128.const f64x2 0 0)) ) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:1029
assert_invalid(
  () => instantiate(`(module
    (func $$f64x2.extract_lane-2nd-arg-empty (result f64)
      (f64x2.extract_lane 0)
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:1037
assert_malformed(
  () => instantiate(`(func $$f64x2.extract_lane-arg-empty (result f64)   (f64x2.extract_lane) ) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:1045
assert_malformed(
  () => instantiate(`(func $$i8x16.replace_lane-1st-arg-empty (result v128)   (i8x16.replace_lane (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0) (i32.const 1)) ) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:1053
assert_invalid(
  () => instantiate(`(module
    (func $$i8x16.replace_lane-2nd-arg-empty (result v128)
      (i8x16.replace_lane 0 (i32.const 1))
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:1061
assert_invalid(
  () => instantiate(`(module
    (func $$i8x16.replace_lane-3rd-arg-empty (result v128)
      (i8x16.replace_lane 0 (v128.const i8x16 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0))
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:1069
assert_malformed(
  () => instantiate(`(func $$i8x16.replace_lane-arg-empty (result v128)   (i8x16.replace_lane) ) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:1077
assert_malformed(
  () => instantiate(`(func $$i16x8.replace_lane-1st-arg-empty (result v128)   (i16x8.replace_lane (v128.const i16x8 0 0 0 0 0 0 0 0) (i32.const 1)) ) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:1085
assert_invalid(
  () => instantiate(`(module
    (func $$i16x8.replace_lane-2nd-arg-empty (result v128)
      (i16x8.replace_lane 0 (i32.const 1))
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:1093
assert_invalid(
  () => instantiate(`(module
    (func $$i16x8.replace_lane-3rd-arg-empty (result v128)
      (i16x8.replace_lane 0 (v128.const i16x8 0 0 0 0 0 0 0 0))
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:1101
assert_malformed(
  () => instantiate(`(func $$i16x8.replace_lane-arg-empty (result v128)   (i16x8.replace_lane) ) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:1109
assert_malformed(
  () => instantiate(`(func $$i32x4.replace_lane-1st-arg-empty (result v128)   (i32x4.replace_lane (v128.const i32x4 0 0 0 0) (i32.const 1)) ) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:1117
assert_invalid(
  () => instantiate(`(module
    (func $$i32x4.replace_lane-2nd-arg-empty (result v128)
      (i32x4.replace_lane 0 (i32.const 1))
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:1125
assert_invalid(
  () => instantiate(`(module
    (func $$i32x4.replace_lane-3rd-arg-empty (result v128)
      (i32x4.replace_lane 0 (v128.const i32x4 0 0 0 0))
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:1133
assert_malformed(
  () => instantiate(`(func $$i32x4.replace_lane-arg-empty (result v128)   (i32x4.replace_lane) ) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:1141
assert_malformed(
  () => instantiate(`(func $$f32x4.replace_lane-1st-arg-empty (result v128)   (f32x4.replace_lane (v128.const f32x4 0 0 0 0) (f32.const 1.0)) ) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:1149
assert_invalid(
  () => instantiate(`(module
    (func $$f32x4.replace_lane-2nd-arg-empty (result v128)
      (f32x4.replace_lane 0 (f32.const 1.0))
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:1157
assert_invalid(
  () => instantiate(`(module
    (func $$f32x4.replace_lane-3rd-arg-empty (result v128)
      (f32x4.replace_lane 0 (v128.const f32x4 0 0 0 0))
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:1165
assert_malformed(
  () => instantiate(`(func $$f32x4.replace_lane-arg-empty (result v128)   (f32x4.replace_lane) ) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:1173
assert_malformed(
  () => instantiate(`(func $$i64x2.replace_lane-1st-arg-empty (result v128)   (i64x2.replace_lane (v128.const i64x2 0 0) (i64.const 1)) ) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:1181
assert_invalid(
  () => instantiate(`(module
    (func $$i64x2.replace_lane-2nd-arg-empty (result v128)
      (i64x2.replace_lane 0 (i64.const 1))
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:1189
assert_invalid(
  () => instantiate(`(module
    (func $$i64x2.replace_lane-3rd-arg-empty (result v128)
      (i64x2.replace_lane 0 (v128.const i64x2 0 0))
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:1197
assert_malformed(
  () => instantiate(`(func $$i64x2.replace_lane-arg-empty (result v128)   (i64x2.replace_lane) ) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:1205
assert_malformed(
  () => instantiate(`(func $$f64x2.replace_lane-1st-arg-empty (result v128)   (f64x2.replace_lane (v128.const f64x2 0 0) (f64.const 1.0)) ) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:1213
assert_invalid(
  () => instantiate(`(module
    (func $$f64x2.replace_lane-2nd-arg-empty (result v128)
      (f64x2.replace_lane 0 (f64.const 1.0))
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:1221
assert_invalid(
  () => instantiate(`(module
    (func $$f64x2.replace_lane-3rd-arg-empty (result v128)
      (f64x2.replace_lane 0 (v128.const f64x2 0 0))
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:1229
assert_malformed(
  () => instantiate(`(func $$f64x2.replace_lane-arg-empty (result v128)   (f64x2.replace_lane) ) `),
  `unexpected token`,
);

// ./test/core/simd/simd_lane.wast:1237
assert_malformed(
  () => instantiate(`(func $$i8x16.shuffle-1st-arg-empty (result v128)   (i8x16.shuffle     (v128.const i8x16 0 1 2 3 5 6 6 7 8 9 10 11 12 13 14 15)     (v128.const i8x16 1 2 3 5 6 6 7 8 9 10 11 12 13 14 15 16)   ) ) `),
  `invalid lane length`,
);

// ./test/core/simd/simd_lane.wast:1248
assert_invalid(
  () => instantiate(`(module
    (func $$i8x16.shuffle-2nd-arg-empty (result v128)
      (i8x16.shuffle 0 1 2 3 5 6 6 7 8 9 10 11 12 13 14 15
        (v128.const i8x16 1 2 3 5 6 6 7 8 9 10 11 12 13 14 15 16)
      )
    )
  )`),
  `type mismatch`,
);

// ./test/core/simd/simd_lane.wast:1258
assert_malformed(
  () => instantiate(`(func $$i8x16.shuffle-arg-empty (result v128)   (i8x16.shuffle) ) `),
  `invalid lane length`,
);
