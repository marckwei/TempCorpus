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

// ./test/core/skip-stack-guard-page.wast

// ./test/core/skip-stack-guard-page.wast:2
let $0 = instantiate(`(module
  (memory 1)
  (export "test-guard-page-skip" (func $$test-guard-page-skip))

  (func $$test-guard-page-skip
    (param $$depth i32)
    (if (i32.eq (local.get $$depth) (i32.const 0))
      (then (call $$function-with-many-locals))
      (else (call $$test-guard-page-skip (i32.sub (local.get $$depth) (i32.const 1))))
    )
  )

  (func $$function-with-many-locals

    ;; 1056 i64 = 8448 bytes of locals
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x000-0x007
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x008-0x00f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x010-0x017
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x018-0x01f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x020-0x027
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x028-0x02f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x030-0x037
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x038-0x03f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x040-0x047
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x048-0x04f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x050-0x057
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x058-0x05f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x060-0x067
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x068-0x06f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x070-0x077
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x078-0x07f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x080-0x087
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x088-0x08f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x090-0x097
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x098-0x09f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x0a0-0x0a7
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x0a8-0x0af
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x0b0-0x0b7
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x0b8-0x0bf
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x0c0-0x0c7
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x0c8-0x0cf
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x0d0-0x0d7
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x0d8-0x0df
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x0e0-0x0e7
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x0e8-0x0ef
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x0f0-0x0f7
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x0f8-0x0ff

    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x100-0x107
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x108-0x10f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x110-0x117
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x118-0x11f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x120-0x127
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x128-0x12f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x130-0x137
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x138-0x13f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x140-0x147
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x148-0x14f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x150-0x157
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x158-0x15f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x160-0x167
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x168-0x16f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x170-0x177
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x178-0x17f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x180-0x187
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x188-0x18f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x190-0x197
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x198-0x19f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x1a0-0x1a7
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x1a8-0x1af
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x1b0-0x1b7
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x1b8-0x1bf
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x1c0-0x1c7
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x1c8-0x1cf
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x1d0-0x1d7
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x1d8-0x1df
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x1e0-0x1e7
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x1e8-0x1ef
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x1f0-0x1f7
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x1f8-0x1ff

    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x200-0x207
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x208-0x20f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x210-0x217
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x218-0x21f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x220-0x227
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x228-0x22f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x230-0x237
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x238-0x23f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x240-0x247
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x248-0x24f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x250-0x257
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x258-0x25f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x260-0x267
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x268-0x26f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x270-0x277
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x278-0x27f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x280-0x287
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x288-0x28f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x290-0x297
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x298-0x29f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x2a0-0x2a7
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x2a8-0x2af
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x2b0-0x2b7
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x2b8-0x2bf
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x2c0-0x2c7
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x2c8-0x2cf
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x2d0-0x2d7
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x2d8-0x2df
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x2e0-0x2e7
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x2e8-0x2ef
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x2f0-0x2f7
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x2f8-0x2ff

    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x300-0x307
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x308-0x30f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x310-0x317
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x318-0x31f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x320-0x327
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x328-0x32f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x330-0x337
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x338-0x33f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x340-0x347
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x348-0x34f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x350-0x357
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x358-0x35f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x360-0x367
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x368-0x36f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x370-0x377
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x378-0x37f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x380-0x387
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x388-0x38f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x390-0x397
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x398-0x39f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x3a0-0x3a7
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x3a8-0x3af
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x3b0-0x3b7
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x3b8-0x3bf
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x3c0-0x3c7
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x3c8-0x3cf
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x3d0-0x3d7
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x3d8-0x3df
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x3e0-0x3e7
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x3e8-0x3ef
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x3f0-0x3f7
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x3f8-0x3ff

    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x400-0x407
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x408-0x40f
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x410-0x417
    (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) (local i64) ;; 0x418-0x41f

    ;; recurse first to try to make the callee access the stack below the space allocated for the locals before the locals themselves have been initialized.
    (call $$function-with-many-locals)

    ;; load from memory into the locals
    (local.set 0x000 (i64.load offset=0x000 align=1 (i32.const 0)))
    (local.set 0x001 (i64.load offset=0x001 align=1 (i32.const 0)))
    (local.set 0x002 (i64.load offset=0x002 align=1 (i32.const 0)))
    (local.set 0x003 (i64.load offset=0x003 align=1 (i32.const 0)))
    (local.set 0x004 (i64.load offset=0x004 align=1 (i32.const 0)))
    (local.set 0x005 (i64.load offset=0x005 align=1 (i32.const 0)))
    (local.set 0x006 (i64.load offset=0x006 align=1 (i32.const 0)))
    (local.set 0x007 (i64.load offset=0x007 align=1 (i32.const 0)))
    (local.set 0x008 (i64.load offset=0x008 align=1 (i32.const 0)))
    (local.set 0x009 (i64.load offset=0x009 align=1 (i32.const 0)))
    (local.set 0x00a (i64.load offset=0x00a align=1 (i32.const 0)))
    (local.set 0x00b (i64.load offset=0x00b align=1 (i32.const 0)))
    (local.set 0x00c (i64.load offset=0x00c align=1 (i32.const 0)))
    (local.set 0x00d (i64.load offset=0x00d align=1 (i32.const 0)))
    (local.set 0x00e (i64.load offset=0x00e align=1 (i32.const 0)))
    (local.set 0x00f (i64.load offset=0x00f align=1 (i32.const 0)))
    (local.set 0x010 (i64.load offset=0x010 align=1 (i32.const 0)))
    (local.set 0x011 (i64.load offset=0x011 align=1 (i32.const 0)))
    (local.set 0x012 (i64.load offset=0x012 align=1 (i32.const 0)))
    (local.set 0x013 (i64.load offset=0x013 align=1 (i32.const 0)))
    (local.set 0x014 (i64.load offset=0x014 align=1 (i32.const 0)))
    (local.set 0x015 (i64.load offset=0x015 align=1 (i32.const 0)))
    (local.set 0x016 (i64.load offset=0x016 align=1 (i32.const 0)))
    (local.set 0x017 (i64.load offset=0x017 align=1 (i32.const 0)))
    (local.set 0x018 (i64.load offset=0x018 align=1 (i32.const 0)))
    (local.set 0x019 (i64.load offset=0x019 align=1 (i32.const 0)))
    (local.set 0x01a (i64.load offset=0x01a align=1 (i32.const 0)))
    (local.set 0x01b (i64.load offset=0x01b align=1 (i32.const 0)))
    (local.set 0x01c (i64.load offset=0x01c align=1 (i32.const 0)))
    (local.set 0x01d (i64.load offset=0x01d align=1 (i32.const 0)))
    (local.set 0x01e (i64.load offset=0x01e align=1 (i32.const 0)))
    (local.set 0x01f (i64.load offset=0x01f align=1 (i32.const 0)))
    (local.set 0x020 (i64.load offset=0x020 align=1 (i32.const 0)))
    (local.set 0x021 (i64.load offset=0x021 align=1 (i32.const 0)))
    (local.set 0x022 (i64.load offset=0x022 align=1 (i32.const 0)))
    (local.set 0x023 (i64.load offset=0x023 align=1 (i32.const 0)))
    (local.set 0x024 (i64.load offset=0x024 align=1 (i32.const 0)))
    (local.set 0x025 (i64.load offset=0x025 align=1 (i32.const 0)))
    (local.set 0x026 (i64.load offset=0x026 align=1 (i32.const 0)))
    (local.set 0x027 (i64.load offset=0x027 align=1 (i32.const 0)))
    (local.set 0x028 (i64.load offset=0x028 align=1 (i32.const 0)))
    (local.set 0x029 (i64.load offset=0x029 align=1 (i32.const 0)))
    (local.set 0x02a (i64.load offset=0x02a align=1 (i32.const 0)))
    (local.set 0x02b (i64.load offset=0x02b align=1 (i32.const 0)))
    (local.set 0x02c (i64.load offset=0x02c align=1 (i32.const 0)))
    (local.set 0x02d (i64.load offset=0x02d align=1 (i32.const 0)))
    (local.set 0x02e (i64.load offset=0x02e align=1 (i32.const 0)))
    (local.set 0x02f (i64.load offset=0x02f align=1 (i32.const 0)))
    (local.set 0x030 (i64.load offset=0x030 align=1 (i32.const 0)))
    (local.set 0x031 (i64.load offset=0x031 align=1 (i32.const 0)))
    (local.set 0x032 (i64.load offset=0x032 align=1 (i32.const 0)))
    (local.set 0x033 (i64.load offset=0x033 align=1 (i32.const 0)))
    (local.set 0x034 (i64.load offset=0x034 align=1 (i32.const 0)))
    (local.set 0x035 (i64.load offset=0x035 align=1 (i32.const 0)))
    (local.set 0x036 (i64.load offset=0x036 align=1 (i32.const 0)))
    (local.set 0x037 (i64.load offset=0x037 align=1 (i32.const 0)))
    (local.set 0x038 (i64.load offset=0x038 align=1 (i32.const 0)))
    (local.set 0x039 (i64.load offset=0x039 align=1 (i32.const 0)))
    (local.set 0x03a (i64.load offset=0x03a align=1 (i32.const 0)))
    (local.set 0x03b (i64.load offset=0x03b align=1 (i32.const 0)))
    (local.set 0x03c (i64.load offset=0x03c align=1 (i32.const 0)))
    (local.set 0x03d (i64.load offset=0x03d align=1 (i32.const 0)))
    (local.set 0x03e (i64.load offset=0x03e align=1 (i32.const 0)))
    (local.set 0x03f (i64.load offset=0x03f align=1 (i32.const 0)))
    (local.set 0x040 (i64.load offset=0x040 align=1 (i32.const 0)))
    (local.set 0x041 (i64.load offset=0x041 align=1 (i32.const 0)))
    (local.set 0x042 (i64.load offset=0x042 align=1 (i32.const 0)))
    (local.set 0x043 (i64.load offset=0x043 align=1 (i32.const 0)))
    (local.set 0x044 (i64.load offset=0x044 align=1 (i32.const 0)))
    (local.set 0x045 (i64.load offset=0x045 align=1 (i32.const 0)))
    (local.set 0x046 (i64.load offset=0x046 align=1 (i32.const 0)))
    (local.set 0x047 (i64.load offset=0x047 align=1 (i32.const 0)))
    (local.set 0x048 (i64.load offset=0x048 align=1 (i32.const 0)))
    (local.set 0x049 (i64.load offset=0x049 align=1 (i32.const 0)))
    (local.set 0x04a (i64.load offset=0x04a align=1 (i32.const 0)))
    (local.set 0x04b (i64.load offset=0x04b align=1 (i32.const 0)))
    (local.set 0x04c (i64.load offset=0x04c align=1 (i32.const 0)))
    (local.set 0x04d (i64.load offset=0x04d align=1 (i32.const 0)))
    (local.set 0x04e (i64.load offset=0x04e align=1 (i32.const 0)))
    (local.set 0x04f (i64.load offset=0x04f align=1 (i32.const 0)))
    (local.set 0x050 (i64.load offset=0x050 align=1 (i32.const 0)))
    (local.set 0x051 (i64.load offset=0x051 align=1 (i32.const 0)))
    (local.set 0x052 (i64.load offset=0x052 align=1 (i32.const 0)))
    (local.set 0x053 (i64.load offset=0x053 align=1 (i32.const 0)))
    (local.set 0x054 (i64.load offset=0x054 align=1 (i32.const 0)))
    (local.set 0x055 (i64.load offset=0x055 align=1 (i32.const 0)))
    (local.set 0x056 (i64.load offset=0x056 align=1 (i32.const 0)))
    (local.set 0x057 (i64.load offset=0x057 align=1 (i32.const 0)))
    (local.set 0x058 (i64.load offset=0x058 align=1 (i32.const 0)))
    (local.set 0x059 (i64.load offset=0x059 align=1 (i32.const 0)))
    (local.set 0x05a (i64.load offset=0x05a align=1 (i32.const 0)))
    (local.set 0x05b (i64.load offset=0x05b align=1 (i32.const 0)))
    (local.set 0x05c (i64.load offset=0x05c align=1 (i32.const 0)))
    (local.set 0x05d (i64.load offset=0x05d align=1 (i32.const 0)))
    (local.set 0x05e (i64.load offset=0x05e align=1 (i32.const 0)))
    (local.set 0x05f (i64.load offset=0x05f align=1 (i32.const 0)))
    (local.set 0x060 (i64.load offset=0x060 align=1 (i32.const 0)))
    (local.set 0x061 (i64.load offset=0x061 align=1 (i32.const 0)))
    (local.set 0x062 (i64.load offset=0x062 align=1 (i32.const 0)))
    (local.set 0x063 (i64.load offset=0x063 align=1 (i32.const 0)))
    (local.set 0x064 (i64.load offset=0x064 align=1 (i32.const 0)))
    (local.set 0x065 (i64.load offset=0x065 align=1 (i32.const 0)))
    (local.set 0x066 (i64.load offset=0x066 align=1 (i32.const 0)))
    (local.set 0x067 (i64.load offset=0x067 align=1 (i32.const 0)))
    (local.set 0x068 (i64.load offset=0x068 align=1 (i32.const 0)))
    (local.set 0x069 (i64.load offset=0x069 align=1 (i32.const 0)))
    (local.set 0x06a (i64.load offset=0x06a align=1 (i32.const 0)))
    (local.set 0x06b (i64.load offset=0x06b align=1 (i32.const 0)))
    (local.set 0x06c (i64.load offset=0x06c align=1 (i32.const 0)))
    (local.set 0x06d (i64.load offset=0x06d align=1 (i32.const 0)))
    (local.set 0x06e (i64.load offset=0x06e align=1 (i32.const 0)))
    (local.set 0x06f (i64.load offset=0x06f align=1 (i32.const 0)))
    (local.set 0x070 (i64.load offset=0x070 align=1 (i32.const 0)))
    (local.set 0x071 (i64.load offset=0x071 align=1 (i32.const 0)))
    (local.set 0x072 (i64.load offset=0x072 align=1 (i32.const 0)))
    (local.set 0x073 (i64.load offset=0x073 align=1 (i32.const 0)))
    (local.set 0x074 (i64.load offset=0x074 align=1 (i32.const 0)))
    (local.set 0x075 (i64.load offset=0x075 align=1 (i32.const 0)))
    (local.set 0x076 (i64.load offset=0x076 align=1 (i32.const 0)))
    (local.set 0x077 (i64.load offset=0x077 align=1 (i32.const 0)))
    (local.set 0x078 (i64.load offset=0x078 align=1 (i32.const 0)))
    (local.set 0x079 (i64.load offset=0x079 align=1 (i32.const 0)))
    (local.set 0x07a (i64.load offset=0x07a align=1 (i32.const 0)))
    (local.set 0x07b (i64.load offset=0x07b align=1 (i32.const 0)))
    (local.set 0x07c (i64.load offset=0x07c align=1 (i32.const 0)))
    (local.set 0x07d (i64.load offset=0x07d align=1 (i32.const 0)))
    (local.set 0x07e (i64.load offset=0x07e align=1 (i32.const 0)))
    (local.set 0x07f (i64.load offset=0x07f align=1 (i32.const 0)))
    (local.set 0x080 (i64.load offset=0x080 align=1 (i32.const 0)))
    (local.set 0x081 (i64.load offset=0x081 align=1 (i32.const 0)))
    (local.set 0x082 (i64.load offset=0x082 align=1 (i32.const 0)))
    (local.set 0x083 (i64.load offset=0x083 align=1 (i32.const 0)))
    (local.set 0x084 (i64.load offset=0x084 align=1 (i32.const 0)))
    (local.set 0x085 (i64.load offset=0x085 align=1 (i32.const 0)))
    (local.set 0x086 (i64.load offset=0x086 align=1 (i32.const 0)))
    (local.set 0x087 (i64.load offset=0x087 align=1 (i32.const 0)))
    (local.set 0x088 (i64.load offset=0x088 align=1 (i32.const 0)))
    (local.set 0x089 (i64.load offset=0x089 align=1 (i32.const 0)))
    (local.set 0x08a (i64.load offset=0x08a align=1 (i32.const 0)))
    (local.set 0x08b (i64.load offset=0x08b align=1 (i32.const 0)))
    (local.set 0x08c (i64.load offset=0x08c align=1 (i32.const 0)))
    (local.set 0x08d (i64.load offset=0x08d align=1 (i32.const 0)))
    (local.set 0x08e (i64.load offset=0x08e align=1 (i32.const 0)))
    (local.set 0x08f (i64.load offset=0x08f align=1 (i32.const 0)))
    (local.set 0x090 (i64.load offset=0x090 align=1 (i32.const 0)))
    (local.set 0x091 (i64.load offset=0x091 align=1 (i32.const 0)))
    (local.set 0x092 (i64.load offset=0x092 align=1 (i32.const 0)))
    (local.set 0x093 (i64.load offset=0x093 align=1 (i32.const 0)))
    (local.set 0x094 (i64.load offset=0x094 align=1 (i32.const 0)))
    (local.set 0x095 (i64.load offset=0x095 align=1 (i32.const 0)))
    (local.set 0x096 (i64.load offset=0x096 align=1 (i32.const 0)))
    (local.set 0x097 (i64.load offset=0x097 align=1 (i32.const 0)))
    (local.set 0x098 (i64.load offset=0x098 align=1 (i32.const 0)))
    (local.set 0x099 (i64.load offset=0x099 align=1 (i32.const 0)))
    (local.set 0x09a (i64.load offset=0x09a align=1 (i32.const 0)))
    (local.set 0x09b (i64.load offset=0x09b align=1 (i32.const 0)))
    (local.set 0x09c (i64.load offset=0x09c align=1 (i32.const 0)))
    (local.set 0x09d (i64.load offset=0x09d align=1 (i32.const 0)))
    (local.set 0x09e (i64.load offset=0x09e align=1 (i32.const 0)))
    (local.set 0x09f (i64.load offset=0x09f align=1 (i32.const 0)))
    (local.set 0x0a0 (i64.load offset=0x0a0 align=1 (i32.const 0)))
    (local.set 0x0a1 (i64.load offset=0x0a1 align=1 (i32.const 0)))
    (local.set 0x0a2 (i64.load offset=0x0a2 align=1 (i32.const 0)))
    (local.set 0x0a3 (i64.load offset=0x0a3 align=1 (i32.const 0)))
    (local.set 0x0a4 (i64.load offset=0x0a4 align=1 (i32.const 0)))
    (local.set 0x0a5 (i64.load offset=0x0a5 align=1 (i32.const 0)))
    (local.set 0x0a6 (i64.load offset=0x0a6 align=1 (i32.const 0)))
    (local.set 0x0a7 (i64.load offset=0x0a7 align=1 (i32.const 0)))
    (local.set 0x0a8 (i64.load offset=0x0a8 align=1 (i32.const 0)))
    (local.set 0x0a9 (i64.load offset=0x0a9 align=1 (i32.const 0)))
    (local.set 0x0aa (i64.load offset=0x0aa align=1 (i32.const 0)))
    (local.set 0x0ab (i64.load offset=0x0ab align=1 (i32.const 0)))
    (local.set 0x0ac (i64.load offset=0x0ac align=1 (i32.const 0)))
    (local.set 0x0ad (i64.load offset=0x0ad align=1 (i32.const 0)))
    (local.set 0x0ae (i64.load offset=0x0ae align=1 (i32.const 0)))
    (local.set 0x0af (i64.load offset=0x0af align=1 (i32.const 0)))
    (local.set 0x0b0 (i64.load offset=0x0b0 align=1 (i32.const 0)))
    (local.set 0x0b1 (i64.load offset=0x0b1 align=1 (i32.const 0)))
    (local.set 0x0b2 (i64.load offset=0x0b2 align=1 (i32.const 0)))
    (local.set 0x0b3 (i64.load offset=0x0b3 align=1 (i32.const 0)))
    (local.set 0x0b4 (i64.load offset=0x0b4 align=1 (i32.const 0)))
    (local.set 0x0b5 (i64.load offset=0x0b5 align=1 (i32.const 0)))
    (local.set 0x0b6 (i64.load offset=0x0b6 align=1 (i32.const 0)))
    (local.set 0x0b7 (i64.load offset=0x0b7 align=1 (i32.const 0)))
    (local.set 0x0b8 (i64.load offset=0x0b8 align=1 (i32.const 0)))
    (local.set 0x0b9 (i64.load offset=0x0b9 align=1 (i32.const 0)))
    (local.set 0x0ba (i64.load offset=0x0ba align=1 (i32.const 0)))
    (local.set 0x0bb (i64.load offset=0x0bb align=1 (i32.const 0)))
    (local.set 0x0bc (i64.load offset=0x0bc align=1 (i32.const 0)))
    (local.set 0x0bd (i64.load offset=0x0bd align=1 (i32.const 0)))
    (local.set 0x0be (i64.load offset=0x0be align=1 (i32.const 0)))
    (local.set 0x0bf (i64.load offset=0x0bf align=1 (i32.const 0)))
    (local.set 0x0c0 (i64.load offset=0x0c0 align=1 (i32.const 0)))
    (local.set 0x0c1 (i64.load offset=0x0c1 align=1 (i32.const 0)))
    (local.set 0x0c2 (i64.load offset=0x0c2 align=1 (i32.const 0)))
    (local.set 0x0c3 (i64.load offset=0x0c3 align=1 (i32.const 0)))
    (local.set 0x0c4 (i64.load offset=0x0c4 align=1 (i32.const 0)))
    (local.set 0x0c5 (i64.load offset=0x0c5 align=1 (i32.const 0)))
    (local.set 0x0c6 (i64.load offset=0x0c6 align=1 (i32.const 0)))
    (local.set 0x0c7 (i64.load offset=0x0c7 align=1 (i32.const 0)))
    (local.set 0x0c8 (i64.load offset=0x0c8 align=1 (i32.const 0)))
    (local.set 0x0c9 (i64.load offset=0x0c9 align=1 (i32.const 0)))
    (local.set 0x0ca (i64.load offset=0x0ca align=1 (i32.const 0)))
    (local.set 0x0cb (i64.load offset=0x0cb align=1 (i32.const 0)))
    (local.set 0x0cc (i64.load offset=0x0cc align=1 (i32.const 0)))
    (local.set 0x0cd (i64.load offset=0x0cd align=1 (i32.const 0)))
    (local.set 0x0ce (i64.load offset=0x0ce align=1 (i32.const 0)))
    (local.set 0x0cf (i64.load offset=0x0cf align=1 (i32.const 0)))
    (local.set 0x0d0 (i64.load offset=0x0d0 align=1 (i32.const 0)))
    (local.set 0x0d1 (i64.load offset=0x0d1 align=1 (i32.const 0)))
    (local.set 0x0d2 (i64.load offset=0x0d2 align=1 (i32.const 0)))
    (local.set 0x0d3 (i64.load offset=0x0d3 align=1 (i32.const 0)))
    (local.set 0x0d4 (i64.load offset=0x0d4 align=1 (i32.const 0)))
    (local.set 0x0d5 (i64.load offset=0x0d5 align=1 (i32.const 0)))
    (local.set 0x0d6 (i64.load offset=0x0d6 align=1 (i32.const 0)))
    (local.set 0x0d7 (i64.load offset=0x0d7 align=1 (i32.const 0)))
    (local.set 0x0d8 (i64.load offset=0x0d8 align=1 (i32.const 0)))
    (local.set 0x0d9 (i64.load offset=0x0d9 align=1 (i32.const 0)))
    (local.set 0x0da (i64.load offset=0x0da align=1 (i32.const 0)))
    (local.set 0x0db (i64.load offset=0x0db align=1 (i32.const 0)))
    (local.set 0x0dc (i64.load offset=0x0dc align=1 (i32.const 0)))
    (local.set 0x0dd (i64.load offset=0x0dd align=1 (i32.const 0)))
    (local.set 0x0de (i64.load offset=0x0de align=1 (i32.const 0)))
    (local.set 0x0df (i64.load offset=0x0df align=1 (i32.const 0)))
    (local.set 0x0e0 (i64.load offset=0x0e0 align=1 (i32.const 0)))
    (local.set 0x0e1 (i64.load offset=0x0e1 align=1 (i32.const 0)))
    (local.set 0x0e2 (i64.load offset=0x0e2 align=1 (i32.const 0)))
    (local.set 0x0e3 (i64.load offset=0x0e3 align=1 (i32.const 0)))
    (local.set 0x0e4 (i64.load offset=0x0e4 align=1 (i32.const 0)))
    (local.set 0x0e5 (i64.load offset=0x0e5 align=1 (i32.const 0)))
    (local.set 0x0e6 (i64.load offset=0x0e6 align=1 (i32.const 0)))
    (local.set 0x0e7 (i64.load offset=0x0e7 align=1 (i32.const 0)))
    (local.set 0x0e8 (i64.load offset=0x0e8 align=1 (i32.const 0)))
    (local.set 0x0e9 (i64.load offset=0x0e9 align=1 (i32.const 0)))
    (local.set 0x0ea (i64.load offset=0x0ea align=1 (i32.const 0)))
    (local.set 0x0eb (i64.load offset=0x0eb align=1 (i32.const 0)))
    (local.set 0x0ec (i64.load offset=0x0ec align=1 (i32.const 0)))
    (local.set 0x0ed (i64.load offset=0x0ed align=1 (i32.const 0)))
    (local.set 0x0ee (i64.load offset=0x0ee align=1 (i32.const 0)))
    (local.set 0x0ef (i64.load offset=0x0ef align=1 (i32.const 0)))
    (local.set 0x0f0 (i64.load offset=0x0f0 align=1 (i32.const 0)))
    (local.set 0x0f1 (i64.load offset=0x0f1 align=1 (i32.const 0)))
    (local.set 0x0f2 (i64.load offset=0x0f2 align=1 (i32.const 0)))
    (local.set 0x0f3 (i64.load offset=0x0f3 align=1 (i32.const 0)))
    (local.set 0x0f4 (i64.load offset=0x0f4 align=1 (i32.const 0)))
    (local.set 0x0f5 (i64.load offset=0x0f5 align=1 (i32.const 0)))
    (local.set 0x0f6 (i64.load offset=0x0f6 align=1 (i32.const 0)))
    (local.set 0x0f7 (i64.load offset=0x0f7 align=1 (i32.const 0)))
    (local.set 0x0f8 (i64.load offset=0x0f8 align=1 (i32.const 0)))
    (local.set 0x0f9 (i64.load offset=0x0f9 align=1 (i32.const 0)))
    (local.set 0x0fa (i64.load offset=0x0fa align=1 (i32.const 0)))
    (local.set 0x0fb (i64.load offset=0x0fb align=1 (i32.const 0)))
    (local.set 0x0fc (i64.load offset=0x0fc align=1 (i32.const 0)))
    (local.set 0x0fd (i64.load offset=0x0fd align=1 (i32.const 0)))
    (local.set 0x0fe (i64.load offset=0x0fe align=1 (i32.const 0)))
    (local.set 0x0ff (i64.load offset=0x0ff align=1 (i32.const 0)))
    (local.set 0x100 (i64.load offset=0x100 align=1 (i32.const 0)))
    (local.set 0x101 (i64.load offset=0x101 align=1 (i32.const 0)))
    (local.set 0x102 (i64.load offset=0x102 align=1 (i32.const 0)))
    (local.set 0x103 (i64.load offset=0x103 align=1 (i32.const 0)))
    (local.set 0x104 (i64.load offset=0x104 align=1 (i32.const 0)))
    (local.set 0x105 (i64.load offset=0x105 align=1 (i32.const 0)))
    (local.set 0x106 (i64.load offset=0x106 align=1 (i32.const 0)))
    (local.set 0x107 (i64.load offset=0x107 align=1 (i32.const 0)))
    (local.set 0x108 (i64.load offset=0x108 align=1 (i32.const 0)))
    (local.set 0x109 (i64.load offset=0x109 align=1 (i32.const 0)))
    (local.set 0x10a (i64.load offset=0x10a align=1 (i32.const 0)))
    (local.set 0x10b (i64.load offset=0x10b align=1 (i32.const 0)))
    (local.set 0x10c (i64.load offset=0x10c align=1 (i32.const 0)))
    (local.set 0x10d (i64.load offset=0x10d align=1 (i32.const 0)))
    (local.set 0x10e (i64.load offset=0x10e align=1 (i32.const 0)))
    (local.set 0x10f (i64.load offset=0x10f align=1 (i32.const 0)))
    (local.set 0x110 (i64.load offset=0x110 align=1 (i32.const 0)))
    (local.set 0x111 (i64.load offset=0x111 align=1 (i32.const 0)))
    (local.set 0x112 (i64.load offset=0x112 align=1 (i32.const 0)))
    (local.set 0x113 (i64.load offset=0x113 align=1 (i32.const 0)))
    (local.set 0x114 (i64.load offset=0x114 align=1 (i32.const 0)))
    (local.set 0x115 (i64.load offset=0x115 align=1 (i32.const 0)))
    (local.set 0x116 (i64.load offset=0x116 align=1 (i32.const 0)))
    (local.set 0x117 (i64.load offset=0x117 align=1 (i32.const 0)))
    (local.set 0x118 (i64.load offset=0x118 align=1 (i32.const 0)))
    (local.set 0x119 (i64.load offset=0x119 align=1 (i32.const 0)))
    (local.set 0x11a (i64.load offset=0x11a align=1 (i32.const 0)))
    (local.set 0x11b (i64.load offset=0x11b align=1 (i32.const 0)))
    (local.set 0x11c (i64.load offset=0x11c align=1 (i32.const 0)))
    (local.set 0x11d (i64.load offset=0x11d align=1 (i32.const 0)))
    (local.set 0x11e (i64.load offset=0x11e align=1 (i32.const 0)))
    (local.set 0x11f (i64.load offset=0x11f align=1 (i32.const 0)))
    (local.set 0x120 (i64.load offset=0x120 align=1 (i32.const 0)))
    (local.set 0x121 (i64.load offset=0x121 align=1 (i32.const 0)))
    (local.set 0x122 (i64.load offset=0x122 align=1 (i32.const 0)))
    (local.set 0x123 (i64.load offset=0x123 align=1 (i32.const 0)))
    (local.set 0x124 (i64.load offset=0x124 align=1 (i32.const 0)))
    (local.set 0x125 (i64.load offset=0x125 align=1 (i32.const 0)))
    (local.set 0x126 (i64.load offset=0x126 align=1 (i32.const 0)))
    (local.set 0x127 (i64.load offset=0x127 align=1 (i32.const 0)))
    (local.set 0x128 (i64.load offset=0x128 align=1 (i32.const 0)))
    (local.set 0x129 (i64.load offset=0x129 align=1 (i32.const 0)))
    (local.set 0x12a (i64.load offset=0x12a align=1 (i32.const 0)))
    (local.set 0x12b (i64.load offset=0x12b align=1 (i32.const 0)))
    (local.set 0x12c (i64.load offset=0x12c align=1 (i32.const 0)))
    (local.set 0x12d (i64.load offset=0x12d align=1 (i32.const 0)))
    (local.set 0x12e (i64.load offset=0x12e align=1 (i32.const 0)))
    (local.set 0x12f (i64.load offset=0x12f align=1 (i32.const 0)))
    (local.set 0x130 (i64.load offset=0x130 align=1 (i32.const 0)))
    (local.set 0x131 (i64.load offset=0x131 align=1 (i32.const 0)))
    (local.set 0x132 (i64.load offset=0x132 align=1 (i32.const 0)))
    (local.set 0x133 (i64.load offset=0x133 align=1 (i32.const 0)))
    (local.set 0x134 (i64.load offset=0x134 align=1 (i32.const 0)))
    (local.set 0x135 (i64.load offset=0x135 align=1 (i32.const 0)))
    (local.set 0x136 (i64.load offset=0x136 align=1 (i32.const 0)))
    (local.set 0x137 (i64.load offset=0x137 align=1 (i32.const 0)))
    (local.set 0x138 (i64.load offset=0x138 align=1 (i32.const 0)))
    (local.set 0x139 (i64.load offset=0x139 align=1 (i32.const 0)))
    (local.set 0x13a (i64.load offset=0x13a align=1 (i32.const 0)))
    (local.set 0x13b (i64.load offset=0x13b align=1 (i32.const 0)))
    (local.set 0x13c (i64.load offset=0x13c align=1 (i32.const 0)))
    (local.set 0x13d (i64.load offset=0x13d align=1 (i32.const 0)))
    (local.set 0x13e (i64.load offset=0x13e align=1 (i32.const 0)))
    (local.set 0x13f (i64.load offset=0x13f align=1 (i32.const 0)))
    (local.set 0x140 (i64.load offset=0x140 align=1 (i32.const 0)))
    (local.set 0x141 (i64.load offset=0x141 align=1 (i32.const 0)))
    (local.set 0x142 (i64.load offset=0x142 align=1 (i32.const 0)))
    (local.set 0x143 (i64.load offset=0x143 align=1 (i32.const 0)))
    (local.set 0x144 (i64.load offset=0x144 align=1 (i32.const 0)))
    (local.set 0x145 (i64.load offset=0x145 align=1 (i32.const 0)))
    (local.set 0x146 (i64.load offset=0x146 align=1 (i32.const 0)))
    (local.set 0x147 (i64.load offset=0x147 align=1 (i32.const 0)))
    (local.set 0x148 (i64.load offset=0x148 align=1 (i32.const 0)))
    (local.set 0x149 (i64.load offset=0x149 align=1 (i32.const 0)))
    (local.set 0x14a (i64.load offset=0x14a align=1 (i32.const 0)))
    (local.set 0x14b (i64.load offset=0x14b align=1 (i32.const 0)))
    (local.set 0x14c (i64.load offset=0x14c align=1 (i32.const 0)))
    (local.set 0x14d (i64.load offset=0x14d align=1 (i32.const 0)))
    (local.set 0x14e (i64.load offset=0x14e align=1 (i32.const 0)))
    (local.set 0x14f (i64.load offset=0x14f align=1 (i32.const 0)))
    (local.set 0x150 (i64.load offset=0x150 align=1 (i32.const 0)))
    (local.set 0x151 (i64.load offset=0x151 align=1 (i32.const 0)))
    (local.set 0x152 (i64.load offset=0x152 align=1 (i32.const 0)))
    (local.set 0x153 (i64.load offset=0x153 align=1 (i32.const 0)))
    (local.set 0x154 (i64.load offset=0x154 align=1 (i32.const 0)))
    (local.set 0x155 (i64.load offset=0x155 align=1 (i32.const 0)))
    (local.set 0x156 (i64.load offset=0x156 align=1 (i32.const 0)))
    (local.set 0x157 (i64.load offset=0x157 align=1 (i32.const 0)))
    (local.set 0x158 (i64.load offset=0x158 align=1 (i32.const 0)))
    (local.set 0x159 (i64.load offset=0x159 align=1 (i32.const 0)))
    (local.set 0x15a (i64.load offset=0x15a align=1 (i32.const 0)))
    (local.set 0x15b (i64.load offset=0x15b align=1 (i32.const 0)))
    (local.set 0x15c (i64.load offset=0x15c align=1 (i32.const 0)))
    (local.set 0x15d (i64.load offset=0x15d align=1 (i32.const 0)))
    (local.set 0x15e (i64.load offset=0x15e align=1 (i32.const 0)))
    (local.set 0x15f (i64.load offset=0x15f align=1 (i32.const 0)))
    (local.set 0x160 (i64.load offset=0x160 align=1 (i32.const 0)))
    (local.set 0x161 (i64.load offset=0x161 align=1 (i32.const 0)))
    (local.set 0x162 (i64.load offset=0x162 align=1 (i32.const 0)))
    (local.set 0x163 (i64.load offset=0x163 align=1 (i32.const 0)))
    (local.set 0x164 (i64.load offset=0x164 align=1 (i32.const 0)))
    (local.set 0x165 (i64.load offset=0x165 align=1 (i32.const 0)))
    (local.set 0x166 (i64.load offset=0x166 align=1 (i32.const 0)))
    (local.set 0x167 (i64.load offset=0x167 align=1 (i32.const 0)))
    (local.set 0x168 (i64.load offset=0x168 align=1 (i32.const 0)))
    (local.set 0x169 (i64.load offset=0x169 align=1 (i32.const 0)))
    (local.set 0x16a (i64.load offset=0x16a align=1 (i32.const 0)))
    (local.set 0x16b (i64.load offset=0x16b align=1 (i32.const 0)))
    (local.set 0x16c (i64.load offset=0x16c align=1 (i32.const 0)))
    (local.set 0x16d (i64.load offset=0x16d align=1 (i32.const 0)))
    (local.set 0x16e (i64.load offset=0x16e align=1 (i32.const 0)))
    (local.set 0x16f (i64.load offset=0x16f align=1 (i32.const 0)))
    (local.set 0x170 (i64.load offset=0x170 align=1 (i32.const 0)))
    (local.set 0x171 (i64.load offset=0x171 align=1 (i32.const 0)))
    (local.set 0x172 (i64.load offset=0x172 align=1 (i32.const 0)))
    (local.set 0x173 (i64.load offset=0x173 align=1 (i32.const 0)))
    (local.set 0x174 (i64.load offset=0x174 align=1 (i32.const 0)))
    (local.set 0x175 (i64.load offset=0x175 align=1 (i32.const 0)))
    (local.set 0x176 (i64.load offset=0x176 align=1 (i32.const 0)))
    (local.set 0x177 (i64.load offset=0x177 align=1 (i32.const 0)))
    (local.set 0x178 (i64.load offset=0x178 align=1 (i32.const 0)))
    (local.set 0x179 (i64.load offset=0x179 align=1 (i32.const 0)))
    (local.set 0x17a (i64.load offset=0x17a align=1 (i32.const 0)))
    (local.set 0x17b (i64.load offset=0x17b align=1 (i32.const 0)))
    (local.set 0x17c (i64.load offset=0x17c align=1 (i32.const 0)))
    (local.set 0x17d (i64.load offset=0x17d align=1 (i32.const 0)))
    (local.set 0x17e (i64.load offset=0x17e align=1 (i32.const 0)))
    (local.set 0x17f (i64.load offset=0x17f align=1 (i32.const 0)))
    (local.set 0x180 (i64.load offset=0x180 align=1 (i32.const 0)))
    (local.set 0x181 (i64.load offset=0x181 align=1 (i32.const 0)))
    (local.set 0x182 (i64.load offset=0x182 align=1 (i32.const 0)))
    (local.set 0x183 (i64.load offset=0x183 align=1 (i32.const 0)))
    (local.set 0x184 (i64.load offset=0x184 align=1 (i32.const 0)))
    (local.set 0x185 (i64.load offset=0x185 align=1 (i32.const 0)))
    (local.set 0x186 (i64.load offset=0x186 align=1 (i32.const 0)))
    (local.set 0x187 (i64.load offset=0x187 align=1 (i32.const 0)))
    (local.set 0x188 (i64.load offset=0x188 align=1 (i32.const 0)))
    (local.set 0x189 (i64.load offset=0x189 align=1 (i32.const 0)))
    (local.set 0x18a (i64.load offset=0x18a align=1 (i32.const 0)))
    (local.set 0x18b (i64.load offset=0x18b align=1 (i32.const 0)))
    (local.set 0x18c (i64.load offset=0x18c align=1 (i32.const 0)))
    (local.set 0x18d (i64.load offset=0x18d align=1 (i32.const 0)))
    (local.set 0x18e (i64.load offset=0x18e align=1 (i32.const 0)))
    (local.set 0x18f (i64.load offset=0x18f align=1 (i32.const 0)))
    (local.set 0x190 (i64.load offset=0x190 align=1 (i32.const 0)))
    (local.set 0x191 (i64.load offset=0x191 align=1 (i32.const 0)))
    (local.set 0x192 (i64.load offset=0x192 align=1 (i32.const 0)))
    (local.set 0x193 (i64.load offset=0x193 align=1 (i32.const 0)))
    (local.set 0x194 (i64.load offset=0x194 align=1 (i32.const 0)))
    (local.set 0x195 (i64.load offset=0x195 align=1 (i32.const 0)))
    (local.set 0x196 (i64.load offset=0x196 align=1 (i32.const 0)))
    (local.set 0x197 (i64.load offset=0x197 align=1 (i32.const 0)))
    (local.set 0x198 (i64.load offset=0x198 align=1 (i32.const 0)))
    (local.set 0x199 (i64.load offset=0x199 align=1 (i32.const 0)))
    (local.set 0x19a (i64.load offset=0x19a align=1 (i32.const 0)))
    (local.set 0x19b (i64.load offset=0x19b align=1 (i32.const 0)))
    (local.set 0x19c (i64.load offset=0x19c align=1 (i32.const 0)))
    (local.set 0x19d (i64.load offset=0x19d align=1 (i32.const 0)))
    (local.set 0x19e (i64.load offset=0x19e align=1 (i32.const 0)))
    (local.set 0x19f (i64.load offset=0x19f align=1 (i32.const 0)))
    (local.set 0x1a0 (i64.load offset=0x1a0 align=1 (i32.const 0)))
    (local.set 0x1a1 (i64.load offset=0x1a1 align=1 (i32.const 0)))
    (local.set 0x1a2 (i64.load offset=0x1a2 align=1 (i32.const 0)))
    (local.set 0x1a3 (i64.load offset=0x1a3 align=1 (i32.const 0)))
    (local.set 0x1a4 (i64.load offset=0x1a4 align=1 (i32.const 0)))
    (local.set 0x1a5 (i64.load offset=0x1a5 align=1 (i32.const 0)))
    (local.set 0x1a6 (i64.load offset=0x1a6 align=1 (i32.const 0)))
    (local.set 0x1a7 (i64.load offset=0x1a7 align=1 (i32.const 0)))
    (local.set 0x1a8 (i64.load offset=0x1a8 align=1 (i32.const 0)))
    (local.set 0x1a9 (i64.load offset=0x1a9 align=1 (i32.const 0)))
    (local.set 0x1aa (i64.load offset=0x1aa align=1 (i32.const 0)))
    (local.set 0x1ab (i64.load offset=0x1ab align=1 (i32.const 0)))
    (local.set 0x1ac (i64.load offset=0x1ac align=1 (i32.const 0)))
    (local.set 0x1ad (i64.load offset=0x1ad align=1 (i32.const 0)))
    (local.set 0x1ae (i64.load offset=0x1ae align=1 (i32.const 0)))
    (local.set 0x1af (i64.load offset=0x1af align=1 (i32.const 0)))
    (local.set 0x1b0 (i64.load offset=0x1b0 align=1 (i32.const 0)))
    (local.set 0x1b1 (i64.load offset=0x1b1 align=1 (i32.const 0)))
    (local.set 0x1b2 (i64.load offset=0x1b2 align=1 (i32.const 0)))
    (local.set 0x1b3 (i64.load offset=0x1b3 align=1 (i32.const 0)))
    (local.set 0x1b4 (i64.load offset=0x1b4 align=1 (i32.const 0)))
    (local.set 0x1b5 (i64.load offset=0x1b5 align=1 (i32.const 0)))
    (local.set 0x1b6 (i64.load offset=0x1b6 align=1 (i32.const 0)))
    (local.set 0x1b7 (i64.load offset=0x1b7 align=1 (i32.const 0)))
    (local.set 0x1b8 (i64.load offset=0x1b8 align=1 (i32.const 0)))
    (local.set 0x1b9 (i64.load offset=0x1b9 align=1 (i32.const 0)))
    (local.set 0x1ba (i64.load offset=0x1ba align=1 (i32.const 0)))
    (local.set 0x1bb (i64.load offset=0x1bb align=1 (i32.const 0)))
    (local.set 0x1bc (i64.load offset=0x1bc align=1 (i32.const 0)))
    (local.set 0x1bd (i64.load offset=0x1bd align=1 (i32.const 0)))
    (local.set 0x1be (i64.load offset=0x1be align=1 (i32.const 0)))
    (local.set 0x1bf (i64.load offset=0x1bf align=1 (i32.const 0)))
    (local.set 0x1c0 (i64.load offset=0x1c0 align=1 (i32.const 0)))
    (local.set 0x1c1 (i64.load offset=0x1c1 align=1 (i32.const 0)))
    (local.set 0x1c2 (i64.load offset=0x1c2 align=1 (i32.const 0)))
    (local.set 0x1c3 (i64.load offset=0x1c3 align=1 (i32.const 0)))
    (local.set 0x1c4 (i64.load offset=0x1c4 align=1 (i32.const 0)))
    (local.set 0x1c5 (i64.load offset=0x1c5 align=1 (i32.const 0)))
    (local.set 0x1c6 (i64.load offset=0x1c6 align=1 (i32.const 0)))
    (local.set 0x1c7 (i64.load offset=0x1c7 align=1 (i32.const 0)))
    (local.set 0x1c8 (i64.load offset=0x1c8 align=1 (i32.const 0)))
    (local.set 0x1c9 (i64.load offset=0x1c9 align=1 (i32.const 0)))
    (local.set 0x1ca (i64.load offset=0x1ca align=1 (i32.const 0)))
    (local.set 0x1cb (i64.load offset=0x1cb align=1 (i32.const 0)))
    (local.set 0x1cc (i64.load offset=0x1cc align=1 (i32.const 0)))
    (local.set 0x1cd (i64.load offset=0x1cd align=1 (i32.const 0)))
    (local.set 0x1ce (i64.load offset=0x1ce align=1 (i32.const 0)))
    (local.set 0x1cf (i64.load offset=0x1cf align=1 (i32.const 0)))
    (local.set 0x1d0 (i64.load offset=0x1d0 align=1 (i32.const 0)))
    (local.set 0x1d1 (i64.load offset=0x1d1 align=1 (i32.const 0)))
    (local.set 0x1d2 (i64.load offset=0x1d2 align=1 (i32.const 0)))
    (local.set 0x1d3 (i64.load offset=0x1d3 align=1 (i32.const 0)))
    (local.set 0x1d4 (i64.load offset=0x1d4 align=1 (i32.const 0)))
    (local.set 0x1d5 (i64.load offset=0x1d5 align=1 (i32.const 0)))
    (local.set 0x1d6 (i64.load offset=0x1d6 align=1 (i32.const 0)))
    (local.set 0x1d7 (i64.load offset=0x1d7 align=1 (i32.const 0)))
    (local.set 0x1d8 (i64.load offset=0x1d8 align=1 (i32.const 0)))
    (local.set 0x1d9 (i64.load offset=0x1d9 align=1 (i32.const 0)))
    (local.set 0x1da (i64.load offset=0x1da align=1 (i32.const 0)))
    (local.set 0x1db (i64.load offset=0x1db align=1 (i32.const 0)))
    (local.set 0x1dc (i64.load offset=0x1dc align=1 (i32.const 0)))
    (local.set 0x1dd (i64.load offset=0x1dd align=1 (i32.const 0)))
    (local.set 0x1de (i64.load offset=0x1de align=1 (i32.const 0)))
    (local.set 0x1df (i64.load offset=0x1df align=1 (i32.const 0)))
    (local.set 0x1e0 (i64.load offset=0x1e0 align=1 (i32.const 0)))
    (local.set 0x1e1 (i64.load offset=0x1e1 align=1 (i32.const 0)))
    (local.set 0x1e2 (i64.load offset=0x1e2 align=1 (i32.const 0)))
    (local.set 0x1e3 (i64.load offset=0x1e3 align=1 (i32.const 0)))
    (local.set 0x1e4 (i64.load offset=0x1e4 align=1 (i32.const 0)))
    (local.set 0x1e5 (i64.load offset=0x1e5 align=1 (i32.const 0)))
    (local.set 0x1e6 (i64.load offset=0x1e6 align=1 (i32.const 0)))
    (local.set 0x1e7 (i64.load offset=0x1e7 align=1 (i32.const 0)))
    (local.set 0x1e8 (i64.load offset=0x1e8 align=1 (i32.const 0)))
    (local.set 0x1e9 (i64.load offset=0x1e9 align=1 (i32.const 0)))
    (local.set 0x1ea (i64.load offset=0x1ea align=1 (i32.const 0)))
    (local.set 0x1eb (i64.load offset=0x1eb align=1 (i32.const 0)))
    (local.set 0x1ec (i64.load offset=0x1ec align=1 (i32.const 0)))
    (local.set 0x1ed (i64.load offset=0x1ed align=1 (i32.const 0)))
    (local.set 0x1ee (i64.load offset=0x1ee align=1 (i32.const 0)))
    (local.set 0x1ef (i64.load offset=0x1ef align=1 (i32.const 0)))
    (local.set 0x1f0 (i64.load offset=0x1f0 align=1 (i32.const 0)))
    (local.set 0x1f1 (i64.load offset=0x1f1 align=1 (i32.const 0)))
    (local.set 0x1f2 (i64.load offset=0x1f2 align=1 (i32.const 0)))
    (local.set 0x1f3 (i64.load offset=0x1f3 align=1 (i32.const 0)))
    (local.set 0x1f4 (i64.load offset=0x1f4 align=1 (i32.const 0)))
    (local.set 0x1f5 (i64.load offset=0x1f5 align=1 (i32.const 0)))
    (local.set 0x1f6 (i64.load offset=0x1f6 align=1 (i32.const 0)))
    (local.set 0x1f7 (i64.load offset=0x1f7 align=1 (i32.const 0)))
    (local.set 0x1f8 (i64.load offset=0x1f8 align=1 (i32.const 0)))
    (local.set 0x1f9 (i64.load offset=0x1f9 align=1 (i32.const 0)))
    (local.set 0x1fa (i64.load offset=0x1fa align=1 (i32.const 0)))
    (local.set 0x1fb (i64.load offset=0x1fb align=1 (i32.const 0)))
    (local.set 0x1fc (i64.load offset=0x1fc align=1 (i32.const 0)))
    (local.set 0x1fd (i64.load offset=0x1fd align=1 (i32.const 0)))
    (local.set 0x1fe (i64.load offset=0x1fe align=1 (i32.const 0)))
    (local.set 0x1ff (i64.load offset=0x1ff align=1 (i32.const 0)))
    (local.set 0x200 (i64.load offset=0x200 align=1 (i32.const 0)))
    (local.set 0x201 (i64.load offset=0x201 align=1 (i32.const 0)))
    (local.set 0x202 (i64.load offset=0x202 align=1 (i32.const 0)))
    (local.set 0x203 (i64.load offset=0x203 align=1 (i32.const 0)))
    (local.set 0x204 (i64.load offset=0x204 align=1 (i32.const 0)))
    (local.set 0x205 (i64.load offset=0x205 align=1 (i32.const 0)))
    (local.set 0x206 (i64.load offset=0x206 align=1 (i32.const 0)))
    (local.set 0x207 (i64.load offset=0x207 align=1 (i32.const 0)))
    (local.set 0x208 (i64.load offset=0x208 align=1 (i32.const 0)))
    (local.set 0x209 (i64.load offset=0x209 align=1 (i32.const 0)))
    (local.set 0x20a (i64.load offset=0x20a align=1 (i32.const 0)))
    (local.set 0x20b (i64.load offset=0x20b align=1 (i32.const 0)))
    (local.set 0x20c (i64.load offset=0x20c align=1 (i32.const 0)))
    (local.set 0x20d (i64.load offset=0x20d align=1 (i32.const 0)))
    (local.set 0x20e (i64.load offset=0x20e align=1 (i32.const 0)))
    (local.set 0x20f (i64.load offset=0x20f align=1 (i32.const 0)))
    (local.set 0x210 (i64.load offset=0x210 align=1 (i32.const 0)))
    (local.set 0x211 (i64.load offset=0x211 align=1 (i32.const 0)))
    (local.set 0x212 (i64.load offset=0x212 align=1 (i32.const 0)))
    (local.set 0x213 (i64.load offset=0x213 align=1 (i32.const 0)))
    (local.set 0x214 (i64.load offset=0x214 align=1 (i32.const 0)))
    (local.set 0x215 (i64.load offset=0x215 align=1 (i32.const 0)))
    (local.set 0x216 (i64.load offset=0x216 align=1 (i32.const 0)))
    (local.set 0x217 (i64.load offset=0x217 align=1 (i32.const 0)))
    (local.set 0x218 (i64.load offset=0x218 align=1 (i32.const 0)))
    (local.set 0x219 (i64.load offset=0x219 align=1 (i32.const 0)))
    (local.set 0x21a (i64.load offset=0x21a align=1 (i32.const 0)))
    (local.set 0x21b (i64.load offset=0x21b align=1 (i32.const 0)))
    (local.set 0x21c (i64.load offset=0x21c align=1 (i32.const 0)))
    (local.set 0x21d (i64.load offset=0x21d align=1 (i32.const 0)))
    (local.set 0x21e (i64.load offset=0x21e align=1 (i32.const 0)))
    (local.set 0x21f (i64.load offset=0x21f align=1 (i32.const 0)))
    (local.set 0x220 (i64.load offset=0x220 align=1 (i32.const 0)))
    (local.set 0x221 (i64.load offset=0x221 align=1 (i32.const 0)))
    (local.set 0x222 (i64.load offset=0x222 align=1 (i32.const 0)))
    (local.set 0x223 (i64.load offset=0x223 align=1 (i32.const 0)))
    (local.set 0x224 (i64.load offset=0x224 align=1 (i32.const 0)))
    (local.set 0x225 (i64.load offset=0x225 align=1 (i32.const 0)))
    (local.set 0x226 (i64.load offset=0x226 align=1 (i32.const 0)))
    (local.set 0x227 (i64.load offset=0x227 align=1 (i32.const 0)))
    (local.set 0x228 (i64.load offset=0x228 align=1 (i32.const 0)))
    (local.set 0x229 (i64.load offset=0x229 align=1 (i32.const 0)))
    (local.set 0x22a (i64.load offset=0x22a align=1 (i32.const 0)))
    (local.set 0x22b (i64.load offset=0x22b align=1 (i32.const 0)))
    (local.set 0x22c (i64.load offset=0x22c align=1 (i32.const 0)))
    (local.set 0x22d (i64.load offset=0x22d align=1 (i32.const 0)))
    (local.set 0x22e (i64.load offset=0x22e align=1 (i32.const 0)))
    (local.set 0x22f (i64.load offset=0x22f align=1 (i32.const 0)))
    (local.set 0x230 (i64.load offset=0x230 align=1 (i32.const 0)))
    (local.set 0x231 (i64.load offset=0x231 align=1 (i32.const 0)))
    (local.set 0x232 (i64.load offset=0x232 align=1 (i32.const 0)))
    (local.set 0x233 (i64.load offset=0x233 align=1 (i32.const 0)))
    (local.set 0x234 (i64.load offset=0x234 align=1 (i32.const 0)))
    (local.set 0x235 (i64.load offset=0x235 align=1 (i32.const 0)))
    (local.set 0x236 (i64.load offset=0x236 align=1 (i32.const 0)))
    (local.set 0x237 (i64.load offset=0x237 align=1 (i32.const 0)))
    (local.set 0x238 (i64.load offset=0x238 align=1 (i32.const 0)))
    (local.set 0x239 (i64.load offset=0x239 align=1 (i32.const 0)))
    (local.set 0x23a (i64.load offset=0x23a align=1 (i32.const 0)))
    (local.set 0x23b (i64.load offset=0x23b align=1 (i32.const 0)))
    (local.set 0x23c (i64.load offset=0x23c align=1 (i32.const 0)))
    (local.set 0x23d (i64.load offset=0x23d align=1 (i32.const 0)))
    (local.set 0x23e (i64.load offset=0x23e align=1 (i32.const 0)))
    (local.set 0x23f (i64.load offset=0x23f align=1 (i32.const 0)))
    (local.set 0x240 (i64.load offset=0x240 align=1 (i32.const 0)))
    (local.set 0x241 (i64.load offset=0x241 align=1 (i32.const 0)))
    (local.set 0x242 (i64.load offset=0x242 align=1 (i32.const 0)))
    (local.set 0x243 (i64.load offset=0x243 align=1 (i32.const 0)))
    (local.set 0x244 (i64.load offset=0x244 align=1 (i32.const 0)))
    (local.set 0x245 (i64.load offset=0x245 align=1 (i32.const 0)))
    (local.set 0x246 (i64.load offset=0x246 align=1 (i32.const 0)))
    (local.set 0x247 (i64.load offset=0x247 align=1 (i32.const 0)))
    (local.set 0x248 (i64.load offset=0x248 align=1 (i32.const 0)))
    (local.set 0x249 (i64.load offset=0x249 align=1 (i32.const 0)))
    (local.set 0x24a (i64.load offset=0x24a align=1 (i32.const 0)))
    (local.set 0x24b (i64.load offset=0x24b align=1 (i32.const 0)))
    (local.set 0x24c (i64.load offset=0x24c align=1 (i32.const 0)))
    (local.set 0x24d (i64.load offset=0x24d align=1 (i32.const 0)))
    (local.set 0x24e (i64.load offset=0x24e align=1 (i32.const 0)))
    (local.set 0x24f (i64.load offset=0x24f align=1 (i32.const 0)))
    (local.set 0x250 (i64.load offset=0x250 align=1 (i32.const 0)))
    (local.set 0x251 (i64.load offset=0x251 align=1 (i32.const 0)))
    (local.set 0x252 (i64.load offset=0x252 align=1 (i32.const 0)))
    (local.set 0x253 (i64.load offset=0x253 align=1 (i32.const 0)))
    (local.set 0x254 (i64.load offset=0x254 align=1 (i32.const 0)))
    (local.set 0x255 (i64.load offset=0x255 align=1 (i32.const 0)))
    (local.set 0x256 (i64.load offset=0x256 align=1 (i32.const 0)))
    (local.set 0x257 (i64.load offset=0x257 align=1 (i32.const 0)))
    (local.set 0x258 (i64.load offset=0x258 align=1 (i32.const 0)))
    (local.set 0x259 (i64.load offset=0x259 align=1 (i32.const 0)))
    (local.set 0x25a (i64.load offset=0x25a align=1 (i32.const 0)))
    (local.set 0x25b (i64.load offset=0x25b align=1 (i32.const 0)))
    (local.set 0x25c (i64.load offset=0x25c align=1 (i32.const 0)))
    (local.set 0x25d (i64.load offset=0x25d align=1 (i32.const 0)))
    (local.set 0x25e (i64.load offset=0x25e align=1 (i32.const 0)))
    (local.set 0x25f (i64.load offset=0x25f align=1 (i32.const 0)))
    (local.set 0x260 (i64.load offset=0x260 align=1 (i32.const 0)))
    (local.set 0x261 (i64.load offset=0x261 align=1 (i32.const 0)))
    (local.set 0x262 (i64.load offset=0x262 align=1 (i32.const 0)))
    (local.set 0x263 (i64.load offset=0x263 align=1 (i32.const 0)))
    (local.set 0x264 (i64.load offset=0x264 align=1 (i32.const 0)))
    (local.set 0x265 (i64.load offset=0x265 align=1 (i32.const 0)))
    (local.set 0x266 (i64.load offset=0x266 align=1 (i32.const 0)))
    (local.set 0x267 (i64.load offset=0x267 align=1 (i32.const 0)))
    (local.set 0x268 (i64.load offset=0x268 align=1 (i32.const 0)))
    (local.set 0x269 (i64.load offset=0x269 align=1 (i32.const 0)))
    (local.set 0x26a (i64.load offset=0x26a align=1 (i32.const 0)))
    (local.set 0x26b (i64.load offset=0x26b align=1 (i32.const 0)))
    (local.set 0x26c (i64.load offset=0x26c align=1 (i32.const 0)))
    (local.set 0x26d (i64.load offset=0x26d align=1 (i32.const 0)))
    (local.set 0x26e (i64.load offset=0x26e align=1 (i32.const 0)))
    (local.set 0x26f (i64.load offset=0x26f align=1 (i32.const 0)))
    (local.set 0x270 (i64.load offset=0x270 align=1 (i32.const 0)))
    (local.set 0x271 (i64.load offset=0x271 align=1 (i32.const 0)))
    (local.set 0x272 (i64.load offset=0x272 align=1 (i32.const 0)))
    (local.set 0x273 (i64.load offset=0x273 align=1 (i32.const 0)))
    (local.set 0x274 (i64.load offset=0x274 align=1 (i32.const 0)))
    (local.set 0x275 (i64.load offset=0x275 align=1 (i32.const 0)))
    (local.set 0x276 (i64.load offset=0x276 align=1 (i32.const 0)))
    (local.set 0x277 (i64.load offset=0x277 align=1 (i32.const 0)))
    (local.set 0x278 (i64.load offset=0x278 align=1 (i32.const 0)))
    (local.set 0x279 (i64.load offset=0x279 align=1 (i32.const 0)))
    (local.set 0x27a (i64.load offset=0x27a align=1 (i32.const 0)))
    (local.set 0x27b (i64.load offset=0x27b align=1 (i32.const 0)))
    (local.set 0x27c (i64.load offset=0x27c align=1 (i32.const 0)))
    (local.set 0x27d (i64.load offset=0x27d align=1 (i32.const 0)))
    (local.set 0x27e (i64.load offset=0x27e align=1 (i32.const 0)))
    (local.set 0x27f (i64.load offset=0x27f align=1 (i32.const 0)))
    (local.set 0x280 (i64.load offset=0x280 align=1 (i32.const 0)))
    (local.set 0x281 (i64.load offset=0x281 align=1 (i32.const 0)))
    (local.set 0x282 (i64.load offset=0x282 align=1 (i32.const 0)))
    (local.set 0x283 (i64.load offset=0x283 align=1 (i32.const 0)))
    (local.set 0x284 (i64.load offset=0x284 align=1 (i32.const 0)))
    (local.set 0x285 (i64.load offset=0x285 align=1 (i32.const 0)))
    (local.set 0x286 (i64.load offset=0x286 align=1 (i32.const 0)))
    (local.set 0x287 (i64.load offset=0x287 align=1 (i32.const 0)))
    (local.set 0x288 (i64.load offset=0x288 align=1 (i32.const 0)))
    (local.set 0x289 (i64.load offset=0x289 align=1 (i32.const 0)))
    (local.set 0x28a (i64.load offset=0x28a align=1 (i32.const 0)))
    (local.set 0x28b (i64.load offset=0x28b align=1 (i32.const 0)))
    (local.set 0x28c (i64.load offset=0x28c align=1 (i32.const 0)))
    (local.set 0x28d (i64.load offset=0x28d align=1 (i32.const 0)))
    (local.set 0x28e (i64.load offset=0x28e align=1 (i32.const 0)))
    (local.set 0x28f (i64.load offset=0x28f align=1 (i32.const 0)))
    (local.set 0x290 (i64.load offset=0x290 align=1 (i32.const 0)))
    (local.set 0x291 (i64.load offset=0x291 align=1 (i32.const 0)))
    (local.set 0x292 (i64.load offset=0x292 align=1 (i32.const 0)))
    (local.set 0x293 (i64.load offset=0x293 align=1 (i32.const 0)))
    (local.set 0x294 (i64.load offset=0x294 align=1 (i32.const 0)))
    (local.set 0x295 (i64.load offset=0x295 align=1 (i32.const 0)))
    (local.set 0x296 (i64.load offset=0x296 align=1 (i32.const 0)))
    (local.set 0x297 (i64.load offset=0x297 align=1 (i32.const 0)))
    (local.set 0x298 (i64.load offset=0x298 align=1 (i32.const 0)))
    (local.set 0x299 (i64.load offset=0x299 align=1 (i32.const 0)))
    (local.set 0x29a (i64.load offset=0x29a align=1 (i32.const 0)))
    (local.set 0x29b (i64.load offset=0x29b align=1 (i32.const 0)))
    (local.set 0x29c (i64.load offset=0x29c align=1 (i32.const 0)))
    (local.set 0x29d (i64.load offset=0x29d align=1 (i32.const 0)))
    (local.set 0x29e (i64.load offset=0x29e align=1 (i32.const 0)))
    (local.set 0x29f (i64.load offset=0x29f align=1 (i32.const 0)))
    (local.set 0x2a0 (i64.load offset=0x2a0 align=1 (i32.const 0)))
    (local.set 0x2a1 (i64.load offset=0x2a1 align=1 (i32.const 0)))
    (local.set 0x2a2 (i64.load offset=0x2a2 align=1 (i32.const 0)))
    (local.set 0x2a3 (i64.load offset=0x2a3 align=1 (i32.const 0)))
    (local.set 0x2a4 (i64.load offset=0x2a4 align=1 (i32.const 0)))
    (local.set 0x2a5 (i64.load offset=0x2a5 align=1 (i32.const 0)))
    (local.set 0x2a6 (i64.load offset=0x2a6 align=1 (i32.const 0)))
    (local.set 0x2a7 (i64.load offset=0x2a7 align=1 (i32.const 0)))
    (local.set 0x2a8 (i64.load offset=0x2a8 align=1 (i32.const 0)))
    (local.set 0x2a9 (i64.load offset=0x2a9 align=1 (i32.const 0)))
    (local.set 0x2aa (i64.load offset=0x2aa align=1 (i32.const 0)))
    (local.set 0x2ab (i64.load offset=0x2ab align=1 (i32.const 0)))
    (local.set 0x2ac (i64.load offset=0x2ac align=1 (i32.const 0)))
    (local.set 0x2ad (i64.load offset=0x2ad align=1 (i32.const 0)))
    (local.set 0x2ae (i64.load offset=0x2ae align=1 (i32.const 0)))
    (local.set 0x2af (i64.load offset=0x2af align=1 (i32.const 0)))
    (local.set 0x2b0 (i64.load offset=0x2b0 align=1 (i32.const 0)))
    (local.set 0x2b1 (i64.load offset=0x2b1 align=1 (i32.const 0)))
    (local.set 0x2b2 (i64.load offset=0x2b2 align=1 (i32.const 0)))
    (local.set 0x2b3 (i64.load offset=0x2b3 align=1 (i32.const 0)))
    (local.set 0x2b4 (i64.load offset=0x2b4 align=1 (i32.const 0)))
    (local.set 0x2b5 (i64.load offset=0x2b5 align=1 (i32.const 0)))
    (local.set 0x2b6 (i64.load offset=0x2b6 align=1 (i32.const 0)))
    (local.set 0x2b7 (i64.load offset=0x2b7 align=1 (i32.const 0)))
    (local.set 0x2b8 (i64.load offset=0x2b8 align=1 (i32.const 0)))
    (local.set 0x2b9 (i64.load offset=0x2b9 align=1 (i32.const 0)))
    (local.set 0x2ba (i64.load offset=0x2ba align=1 (i32.const 0)))
    (local.set 0x2bb (i64.load offset=0x2bb align=1 (i32.const 0)))
    (local.set 0x2bc (i64.load offset=0x2bc align=1 (i32.const 0)))
    (local.set 0x2bd (i64.load offset=0x2bd align=1 (i32.const 0)))
    (local.set 0x2be (i64.load offset=0x2be align=1 (i32.const 0)))
    (local.set 0x2bf (i64.load offset=0x2bf align=1 (i32.const 0)))
    (local.set 0x2c0 (i64.load offset=0x2c0 align=1 (i32.const 0)))
    (local.set 0x2c1 (i64.load offset=0x2c1 align=1 (i32.const 0)))
    (local.set 0x2c2 (i64.load offset=0x2c2 align=1 (i32.const 0)))
    (local.set 0x2c3 (i64.load offset=0x2c3 align=1 (i32.const 0)))
    (local.set 0x2c4 (i64.load offset=0x2c4 align=1 (i32.const 0)))
    (local.set 0x2c5 (i64.load offset=0x2c5 align=1 (i32.const 0)))
    (local.set 0x2c6 (i64.load offset=0x2c6 align=1 (i32.const 0)))
    (local.set 0x2c7 (i64.load offset=0x2c7 align=1 (i32.const 0)))
    (local.set 0x2c8 (i64.load offset=0x2c8 align=1 (i32.const 0)))
    (local.set 0x2c9 (i64.load offset=0x2c9 align=1 (i32.const 0)))
    (local.set 0x2ca (i64.load offset=0x2ca align=1 (i32.const 0)))
    (local.set 0x2cb (i64.load offset=0x2cb align=1 (i32.const 0)))
    (local.set 0x2cc (i64.load offset=0x2cc align=1 (i32.const 0)))
    (local.set 0x2cd (i64.load offset=0x2cd align=1 (i32.const 0)))
    (local.set 0x2ce (i64.load offset=0x2ce align=1 (i32.const 0)))
    (local.set 0x2cf (i64.load offset=0x2cf align=1 (i32.const 0)))
    (local.set 0x2d0 (i64.load offset=0x2d0 align=1 (i32.const 0)))
    (local.set 0x2d1 (i64.load offset=0x2d1 align=1 (i32.const 0)))
    (local.set 0x2d2 (i64.load offset=0x2d2 align=1 (i32.const 0)))
    (local.set 0x2d3 (i64.load offset=0x2d3 align=1 (i32.const 0)))
    (local.set 0x2d4 (i64.load offset=0x2d4 align=1 (i32.const 0)))
    (local.set 0x2d5 (i64.load offset=0x2d5 align=1 (i32.const 0)))
    (local.set 0x2d6 (i64.load offset=0x2d6 align=1 (i32.const 0)))
    (local.set 0x2d7 (i64.load offset=0x2d7 align=1 (i32.const 0)))
    (local.set 0x2d8 (i64.load offset=0x2d8 align=1 (i32.const 0)))
    (local.set 0x2d9 (i64.load offset=0x2d9 align=1 (i32.const 0)))
    (local.set 0x2da (i64.load offset=0x2da align=1 (i32.const 0)))
    (local.set 0x2db (i64.load offset=0x2db align=1 (i32.const 0)))
    (local.set 0x2dc (i64.load offset=0x2dc align=1 (i32.const 0)))
    (local.set 0x2dd (i64.load offset=0x2dd align=1 (i32.const 0)))
    (local.set 0x2de (i64.load offset=0x2de align=1 (i32.const 0)))
    (local.set 0x2df (i64.load offset=0x2df align=1 (i32.const 0)))
    (local.set 0x2e0 (i64.load offset=0x2e0 align=1 (i32.const 0)))
    (local.set 0x2e1 (i64.load offset=0x2e1 align=1 (i32.const 0)))
    (local.set 0x2e2 (i64.load offset=0x2e2 align=1 (i32.const 0)))
    (local.set 0x2e3 (i64.load offset=0x2e3 align=1 (i32.const 0)))
    (local.set 0x2e4 (i64.load offset=0x2e4 align=1 (i32.const 0)))
    (local.set 0x2e5 (i64.load offset=0x2e5 align=1 (i32.const 0)))
    (local.set 0x2e6 (i64.load offset=0x2e6 align=1 (i32.const 0)))
    (local.set 0x2e7 (i64.load offset=0x2e7 align=1 (i32.const 0)))
    (local.set 0x2e8 (i64.load offset=0x2e8 align=1 (i32.const 0)))
    (local.set 0x2e9 (i64.load offset=0x2e9 align=1 (i32.const 0)))
    (local.set 0x2ea (i64.load offset=0x2ea align=1 (i32.const 0)))
    (local.set 0x2eb (i64.load offset=0x2eb align=1 (i32.const 0)))
    (local.set 0x2ec (i64.load offset=0x2ec align=1 (i32.const 0)))
    (local.set 0x2ed (i64.load offset=0x2ed align=1 (i32.const 0)))
    (local.set 0x2ee (i64.load offset=0x2ee align=1 (i32.const 0)))
    (local.set 0x2ef (i64.load offset=0x2ef align=1 (i32.const 0)))
    (local.set 0x2f0 (i64.load offset=0x2f0 align=1 (i32.const 0)))
    (local.set 0x2f1 (i64.load offset=0x2f1 align=1 (i32.const 0)))
    (local.set 0x2f2 (i64.load offset=0x2f2 align=1 (i32.const 0)))
    (local.set 0x2f3 (i64.load offset=0x2f3 align=1 (i32.const 0)))
    (local.set 0x2f4 (i64.load offset=0x2f4 align=1 (i32.const 0)))
    (local.set 0x2f5 (i64.load offset=0x2f5 align=1 (i32.const 0)))
    (local.set 0x2f6 (i64.load offset=0x2f6 align=1 (i32.const 0)))
    (local.set 0x2f7 (i64.load offset=0x2f7 align=1 (i32.const 0)))
    (local.set 0x2f8 (i64.load offset=0x2f8 align=1 (i32.const 0)))
    (local.set 0x2f9 (i64.load offset=0x2f9 align=1 (i32.const 0)))
    (local.set 0x2fa (i64.load offset=0x2fa align=1 (i32.const 0)))
    (local.set 0x2fb (i64.load offset=0x2fb align=1 (i32.const 0)))
    (local.set 0x2fc (i64.load offset=0x2fc align=1 (i32.const 0)))
    (local.set 0x2fd (i64.load offset=0x2fd align=1 (i32.const 0)))
    (local.set 0x2fe (i64.load offset=0x2fe align=1 (i32.const 0)))
    (local.set 0x2ff (i64.load offset=0x2ff align=1 (i32.const 0)))
    (local.set 0x300 (i64.load offset=0x300 align=1 (i32.const 0)))
    (local.set 0x301 (i64.load offset=0x301 align=1 (i32.const 0)))
    (local.set 0x302 (i64.load offset=0x302 align=1 (i32.const 0)))
    (local.set 0x303 (i64.load offset=0x303 align=1 (i32.const 0)))
    (local.set 0x304 (i64.load offset=0x304 align=1 (i32.const 0)))
    (local.set 0x305 (i64.load offset=0x305 align=1 (i32.const 0)))
    (local.set 0x306 (i64.load offset=0x306 align=1 (i32.const 0)))
    (local.set 0x307 (i64.load offset=0x307 align=1 (i32.const 0)))
    (local.set 0x308 (i64.load offset=0x308 align=1 (i32.const 0)))
    (local.set 0x309 (i64.load offset=0x309 align=1 (i32.const 0)))
    (local.set 0x30a (i64.load offset=0x30a align=1 (i32.const 0)))
    (local.set 0x30b (i64.load offset=0x30b align=1 (i32.const 0)))
    (local.set 0x30c (i64.load offset=0x30c align=1 (i32.const 0)))
    (local.set 0x30d (i64.load offset=0x30d align=1 (i32.const 0)))
    (local.set 0x30e (i64.load offset=0x30e align=1 (i32.const 0)))
    (local.set 0x30f (i64.load offset=0x30f align=1 (i32.const 0)))
    (local.set 0x310 (i64.load offset=0x310 align=1 (i32.const 0)))
    (local.set 0x311 (i64.load offset=0x311 align=1 (i32.const 0)))
    (local.set 0x312 (i64.load offset=0x312 align=1 (i32.const 0)))
    (local.set 0x313 (i64.load offset=0x313 align=1 (i32.const 0)))
    (local.set 0x314 (i64.load offset=0x314 align=1 (i32.const 0)))
    (local.set 0x315 (i64.load offset=0x315 align=1 (i32.const 0)))
    (local.set 0x316 (i64.load offset=0x316 align=1 (i32.const 0)))
    (local.set 0x317 (i64.load offset=0x317 align=1 (i32.const 0)))
    (local.set 0x318 (i64.load offset=0x318 align=1 (i32.const 0)))
    (local.set 0x319 (i64.load offset=0x319 align=1 (i32.const 0)))
    (local.set 0x31a (i64.load offset=0x31a align=1 (i32.const 0)))
    (local.set 0x31b (i64.load offset=0x31b align=1 (i32.const 0)))
    (local.set 0x31c (i64.load offset=0x31c align=1 (i32.const 0)))
    (local.set 0x31d (i64.load offset=0x31d align=1 (i32.const 0)))
    (local.set 0x31e (i64.load offset=0x31e align=1 (i32.const 0)))
    (local.set 0x31f (i64.load offset=0x31f align=1 (i32.const 0)))
    (local.set 0x320 (i64.load offset=0x320 align=1 (i32.const 0)))
    (local.set 0x321 (i64.load offset=0x321 align=1 (i32.const 0)))
    (local.set 0x322 (i64.load offset=0x322 align=1 (i32.const 0)))
    (local.set 0x323 (i64.load offset=0x323 align=1 (i32.const 0)))
    (local.set 0x324 (i64.load offset=0x324 align=1 (i32.const 0)))
    (local.set 0x325 (i64.load offset=0x325 align=1 (i32.const 0)))
    (local.set 0x326 (i64.load offset=0x326 align=1 (i32.const 0)))
    (local.set 0x327 (i64.load offset=0x327 align=1 (i32.const 0)))
    (local.set 0x328 (i64.load offset=0x328 align=1 (i32.const 0)))
    (local.set 0x329 (i64.load offset=0x329 align=1 (i32.const 0)))
    (local.set 0x32a (i64.load offset=0x32a align=1 (i32.const 0)))
    (local.set 0x32b (i64.load offset=0x32b align=1 (i32.const 0)))
    (local.set 0x32c (i64.load offset=0x32c align=1 (i32.const 0)))
    (local.set 0x32d (i64.load offset=0x32d align=1 (i32.const 0)))
    (local.set 0x32e (i64.load offset=0x32e align=1 (i32.const 0)))
    (local.set 0x32f (i64.load offset=0x32f align=1 (i32.const 0)))
    (local.set 0x330 (i64.load offset=0x330 align=1 (i32.const 0)))
    (local.set 0x331 (i64.load offset=0x331 align=1 (i32.const 0)))
    (local.set 0x332 (i64.load offset=0x332 align=1 (i32.const 0)))
    (local.set 0x333 (i64.load offset=0x333 align=1 (i32.const 0)))
    (local.set 0x334 (i64.load offset=0x334 align=1 (i32.const 0)))
    (local.set 0x335 (i64.load offset=0x335 align=1 (i32.const 0)))
    (local.set 0x336 (i64.load offset=0x336 align=1 (i32.const 0)))
    (local.set 0x337 (i64.load offset=0x337 align=1 (i32.const 0)))
    (local.set 0x338 (i64.load offset=0x338 align=1 (i32.const 0)))
    (local.set 0x339 (i64.load offset=0x339 align=1 (i32.const 0)))
    (local.set 0x33a (i64.load offset=0x33a align=1 (i32.const 0)))
    (local.set 0x33b (i64.load offset=0x33b align=1 (i32.const 0)))
    (local.set 0x33c (i64.load offset=0x33c align=1 (i32.const 0)))
    (local.set 0x33d (i64.load offset=0x33d align=1 (i32.const 0)))
    (local.set 0x33e (i64.load offset=0x33e align=1 (i32.const 0)))
    (local.set 0x33f (i64.load offset=0x33f align=1 (i32.const 0)))
    (local.set 0x340 (i64.load offset=0x340 align=1 (i32.const 0)))
    (local.set 0x341 (i64.load offset=0x341 align=1 (i32.const 0)))
    (local.set 0x342 (i64.load offset=0x342 align=1 (i32.const 0)))
    (local.set 0x343 (i64.load offset=0x343 align=1 (i32.const 0)))
    (local.set 0x344 (i64.load offset=0x344 align=1 (i32.const 0)))
    (local.set 0x345 (i64.load offset=0x345 align=1 (i32.const 0)))
    (local.set 0x346 (i64.load offset=0x346 align=1 (i32.const 0)))
    (local.set 0x347 (i64.load offset=0x347 align=1 (i32.const 0)))
    (local.set 0x348 (i64.load offset=0x348 align=1 (i32.const 0)))
    (local.set 0x349 (i64.load offset=0x349 align=1 (i32.const 0)))
    (local.set 0x34a (i64.load offset=0x34a align=1 (i32.const 0)))
    (local.set 0x34b (i64.load offset=0x34b align=1 (i32.const 0)))
    (local.set 0x34c (i64.load offset=0x34c align=1 (i32.const 0)))
    (local.set 0x34d (i64.load offset=0x34d align=1 (i32.const 0)))
    (local.set 0x34e (i64.load offset=0x34e align=1 (i32.const 0)))
    (local.set 0x34f (i64.load offset=0x34f align=1 (i32.const 0)))
    (local.set 0x350 (i64.load offset=0x350 align=1 (i32.const 0)))
    (local.set 0x351 (i64.load offset=0x351 align=1 (i32.const 0)))
    (local.set 0x352 (i64.load offset=0x352 align=1 (i32.const 0)))
    (local.set 0x353 (i64.load offset=0x353 align=1 (i32.const 0)))
    (local.set 0x354 (i64.load offset=0x354 align=1 (i32.const 0)))
    (local.set 0x355 (i64.load offset=0x355 align=1 (i32.const 0)))
    (local.set 0x356 (i64.load offset=0x356 align=1 (i32.const 0)))
    (local.set 0x357 (i64.load offset=0x357 align=1 (i32.const 0)))
    (local.set 0x358 (i64.load offset=0x358 align=1 (i32.const 0)))
    (local.set 0x359 (i64.load offset=0x359 align=1 (i32.const 0)))
    (local.set 0x35a (i64.load offset=0x35a align=1 (i32.const 0)))
    (local.set 0x35b (i64.load offset=0x35b align=1 (i32.const 0)))
    (local.set 0x35c (i64.load offset=0x35c align=1 (i32.const 0)))
    (local.set 0x35d (i64.load offset=0x35d align=1 (i32.const 0)))
    (local.set 0x35e (i64.load offset=0x35e align=1 (i32.const 0)))
    (local.set 0x35f (i64.load offset=0x35f align=1 (i32.const 0)))
    (local.set 0x360 (i64.load offset=0x360 align=1 (i32.const 0)))
    (local.set 0x361 (i64.load offset=0x361 align=1 (i32.const 0)))
    (local.set 0x362 (i64.load offset=0x362 align=1 (i32.const 0)))
    (local.set 0x363 (i64.load offset=0x363 align=1 (i32.const 0)))
    (local.set 0x364 (i64.load offset=0x364 align=1 (i32.const 0)))
    (local.set 0x365 (i64.load offset=0x365 align=1 (i32.const 0)))
    (local.set 0x366 (i64.load offset=0x366 align=1 (i32.const 0)))
    (local.set 0x367 (i64.load offset=0x367 align=1 (i32.const 0)))
    (local.set 0x368 (i64.load offset=0x368 align=1 (i32.const 0)))
    (local.set 0x369 (i64.load offset=0x369 align=1 (i32.const 0)))
    (local.set 0x36a (i64.load offset=0x36a align=1 (i32.const 0)))
    (local.set 0x36b (i64.load offset=0x36b align=1 (i32.const 0)))
    (local.set 0x36c (i64.load offset=0x36c align=1 (i32.const 0)))
    (local.set 0x36d (i64.load offset=0x36d align=1 (i32.const 0)))
    (local.set 0x36e (i64.load offset=0x36e align=1 (i32.const 0)))
    (local.set 0x36f (i64.load offset=0x36f align=1 (i32.const 0)))
    (local.set 0x370 (i64.load offset=0x370 align=1 (i32.const 0)))
    (local.set 0x371 (i64.load offset=0x371 align=1 (i32.const 0)))
    (local.set 0x372 (i64.load offset=0x372 align=1 (i32.const 0)))
    (local.set 0x373 (i64.load offset=0x373 align=1 (i32.const 0)))
    (local.set 0x374 (i64.load offset=0x374 align=1 (i32.const 0)))
    (local.set 0x375 (i64.load offset=0x375 align=1 (i32.const 0)))
    (local.set 0x376 (i64.load offset=0x376 align=1 (i32.const 0)))
    (local.set 0x377 (i64.load offset=0x377 align=1 (i32.const 0)))
    (local.set 0x378 (i64.load offset=0x378 align=1 (i32.const 0)))
    (local.set 0x379 (i64.load offset=0x379 align=1 (i32.const 0)))
    (local.set 0x37a (i64.load offset=0x37a align=1 (i32.const 0)))
    (local.set 0x37b (i64.load offset=0x37b align=1 (i32.const 0)))
    (local.set 0x37c (i64.load offset=0x37c align=1 (i32.const 0)))
    (local.set 0x37d (i64.load offset=0x37d align=1 (i32.const 0)))
    (local.set 0x37e (i64.load offset=0x37e align=1 (i32.const 0)))
    (local.set 0x37f (i64.load offset=0x37f align=1 (i32.const 0)))
    (local.set 0x380 (i64.load offset=0x380 align=1 (i32.const 0)))
    (local.set 0x381 (i64.load offset=0x381 align=1 (i32.const 0)))
    (local.set 0x382 (i64.load offset=0x382 align=1 (i32.const 0)))
    (local.set 0x383 (i64.load offset=0x383 align=1 (i32.const 0)))
    (local.set 0x384 (i64.load offset=0x384 align=1 (i32.const 0)))
    (local.set 0x385 (i64.load offset=0x385 align=1 (i32.const 0)))
    (local.set 0x386 (i64.load offset=0x386 align=1 (i32.const 0)))
    (local.set 0x387 (i64.load offset=0x387 align=1 (i32.const 0)))
    (local.set 0x388 (i64.load offset=0x388 align=1 (i32.const 0)))
    (local.set 0x389 (i64.load offset=0x389 align=1 (i32.const 0)))
    (local.set 0x38a (i64.load offset=0x38a align=1 (i32.const 0)))
    (local.set 0x38b (i64.load offset=0x38b align=1 (i32.const 0)))
    (local.set 0x38c (i64.load offset=0x38c align=1 (i32.const 0)))
    (local.set 0x38d (i64.load offset=0x38d align=1 (i32.const 0)))
    (local.set 0x38e (i64.load offset=0x38e align=1 (i32.const 0)))
    (local.set 0x38f (i64.load offset=0x38f align=1 (i32.const 0)))
    (local.set 0x390 (i64.load offset=0x390 align=1 (i32.const 0)))
    (local.set 0x391 (i64.load offset=0x391 align=1 (i32.const 0)))
    (local.set 0x392 (i64.load offset=0x392 align=1 (i32.const 0)))
    (local.set 0x393 (i64.load offset=0x393 align=1 (i32.const 0)))
    (local.set 0x394 (i64.load offset=0x394 align=1 (i32.const 0)))
    (local.set 0x395 (i64.load offset=0x395 align=1 (i32.const 0)))
    (local.set 0x396 (i64.load offset=0x396 align=1 (i32.const 0)))
    (local.set 0x397 (i64.load offset=0x397 align=1 (i32.const 0)))
    (local.set 0x398 (i64.load offset=0x398 align=1 (i32.const 0)))
    (local.set 0x399 (i64.load offset=0x399 align=1 (i32.const 0)))
    (local.set 0x39a (i64.load offset=0x39a align=1 (i32.const 0)))
    (local.set 0x39b (i64.load offset=0x39b align=1 (i32.const 0)))
    (local.set 0x39c (i64.load offset=0x39c align=1 (i32.const 0)))
    (local.set 0x39d (i64.load offset=0x39d align=1 (i32.const 0)))
    (local.set 0x39e (i64.load offset=0x39e align=1 (i32.const 0)))
    (local.set 0x39f (i64.load offset=0x39f align=1 (i32.const 0)))
    (local.set 0x3a0 (i64.load offset=0x3a0 align=1 (i32.const 0)))
    (local.set 0x3a1 (i64.load offset=0x3a1 align=1 (i32.const 0)))
    (local.set 0x3a2 (i64.load offset=0x3a2 align=1 (i32.const 0)))
    (local.set 0x3a3 (i64.load offset=0x3a3 align=1 (i32.const 0)))
    (local.set 0x3a4 (i64.load offset=0x3a4 align=1 (i32.const 0)))
    (local.set 0x3a5 (i64.load offset=0x3a5 align=1 (i32.const 0)))
    (local.set 0x3a6 (i64.load offset=0x3a6 align=1 (i32.const 0)))
    (local.set 0x3a7 (i64.load offset=0x3a7 align=1 (i32.const 0)))
    (local.set 0x3a8 (i64.load offset=0x3a8 align=1 (i32.const 0)))
    (local.set 0x3a9 (i64.load offset=0x3a9 align=1 (i32.const 0)))
    (local.set 0x3aa (i64.load offset=0x3aa align=1 (i32.const 0)))
    (local.set 0x3ab (i64.load offset=0x3ab align=1 (i32.const 0)))
    (local.set 0x3ac (i64.load offset=0x3ac align=1 (i32.const 0)))
    (local.set 0x3ad (i64.load offset=0x3ad align=1 (i32.const 0)))
    (local.set 0x3ae (i64.load offset=0x3ae align=1 (i32.const 0)))
    (local.set 0x3af (i64.load offset=0x3af align=1 (i32.const 0)))
    (local.set 0x3b0 (i64.load offset=0x3b0 align=1 (i32.const 0)))
    (local.set 0x3b1 (i64.load offset=0x3b1 align=1 (i32.const 0)))
    (local.set 0x3b2 (i64.load offset=0x3b2 align=1 (i32.const 0)))
    (local.set 0x3b3 (i64.load offset=0x3b3 align=1 (i32.const 0)))
    (local.set 0x3b4 (i64.load offset=0x3b4 align=1 (i32.const 0)))
    (local.set 0x3b5 (i64.load offset=0x3b5 align=1 (i32.const 0)))
    (local.set 0x3b6 (i64.load offset=0x3b6 align=1 (i32.const 0)))
    (local.set 0x3b7 (i64.load offset=0x3b7 align=1 (i32.const 0)))
    (local.set 0x3b8 (i64.load offset=0x3b8 align=1 (i32.const 0)))
    (local.set 0x3b9 (i64.load offset=0x3b9 align=1 (i32.const 0)))
    (local.set 0x3ba (i64.load offset=0x3ba align=1 (i32.const 0)))
    (local.set 0x3bb (i64.load offset=0x3bb align=1 (i32.const 0)))
    (local.set 0x3bc (i64.load offset=0x3bc align=1 (i32.const 0)))
    (local.set 0x3bd (i64.load offset=0x3bd align=1 (i32.const 0)))
    (local.set 0x3be (i64.load offset=0x3be align=1 (i32.const 0)))
    (local.set 0x3bf (i64.load offset=0x3bf align=1 (i32.const 0)))
    (local.set 0x3c0 (i64.load offset=0x3c0 align=1 (i32.const 0)))
    (local.set 0x3c1 (i64.load offset=0x3c1 align=1 (i32.const 0)))
    (local.set 0x3c2 (i64.load offset=0x3c2 align=1 (i32.const 0)))
    (local.set 0x3c3 (i64.load offset=0x3c3 align=1 (i32.const 0)))
    (local.set 0x3c4 (i64.load offset=0x3c4 align=1 (i32.const 0)))
    (local.set 0x3c5 (i64.load offset=0x3c5 align=1 (i32.const 0)))
    (local.set 0x3c6 (i64.load offset=0x3c6 align=1 (i32.const 0)))
    (local.set 0x3c7 (i64.load offset=0x3c7 align=1 (i32.const 0)))
    (local.set 0x3c8 (i64.load offset=0x3c8 align=1 (i32.const 0)))
    (local.set 0x3c9 (i64.load offset=0x3c9 align=1 (i32.const 0)))
    (local.set 0x3ca (i64.load offset=0x3ca align=1 (i32.const 0)))
    (local.set 0x3cb (i64.load offset=0x3cb align=1 (i32.const 0)))
    (local.set 0x3cc (i64.load offset=0x3cc align=1 (i32.const 0)))
    (local.set 0x3cd (i64.load offset=0x3cd align=1 (i32.const 0)))
    (local.set 0x3ce (i64.load offset=0x3ce align=1 (i32.const 0)))
    (local.set 0x3cf (i64.load offset=0x3cf align=1 (i32.const 0)))
    (local.set 0x3d0 (i64.load offset=0x3d0 align=1 (i32.const 0)))
    (local.set 0x3d1 (i64.load offset=0x3d1 align=1 (i32.const 0)))
    (local.set 0x3d2 (i64.load offset=0x3d2 align=1 (i32.const 0)))
    (local.set 0x3d3 (i64.load offset=0x3d3 align=1 (i32.const 0)))
    (local.set 0x3d4 (i64.load offset=0x3d4 align=1 (i32.const 0)))
    (local.set 0x3d5 (i64.load offset=0x3d5 align=1 (i32.const 0)))
    (local.set 0x3d6 (i64.load offset=0x3d6 align=1 (i32.const 0)))
    (local.set 0x3d7 (i64.load offset=0x3d7 align=1 (i32.const 0)))
    (local.set 0x3d8 (i64.load offset=0x3d8 align=1 (i32.const 0)))
    (local.set 0x3d9 (i64.load offset=0x3d9 align=1 (i32.const 0)))
    (local.set 0x3da (i64.load offset=0x3da align=1 (i32.const 0)))
    (local.set 0x3db (i64.load offset=0x3db align=1 (i32.const 0)))
    (local.set 0x3dc (i64.load offset=0x3dc align=1 (i32.const 0)))
    (local.set 0x3dd (i64.load offset=0x3dd align=1 (i32.const 0)))
    (local.set 0x3de (i64.load offset=0x3de align=1 (i32.const 0)))
    (local.set 0x3df (i64.load offset=0x3df align=1 (i32.const 0)))
    (local.set 0x3e0 (i64.load offset=0x3e0 align=1 (i32.const 0)))
    (local.set 0x3e1 (i64.load offset=0x3e1 align=1 (i32.const 0)))
    (local.set 0x3e2 (i64.load offset=0x3e2 align=1 (i32.const 0)))
    (local.set 0x3e3 (i64.load offset=0x3e3 align=1 (i32.const 0)))
    (local.set 0x3e4 (i64.load offset=0x3e4 align=1 (i32.const 0)))
    (local.set 0x3e5 (i64.load offset=0x3e5 align=1 (i32.const 0)))
    (local.set 0x3e6 (i64.load offset=0x3e6 align=1 (i32.const 0)))
    (local.set 0x3e7 (i64.load offset=0x3e7 align=1 (i32.const 0)))
    (local.set 0x3e8 (i64.load offset=0x3e8 align=1 (i32.const 0)))
    (local.set 0x3e9 (i64.load offset=0x3e9 align=1 (i32.const 0)))
    (local.set 0x3ea (i64.load offset=0x3ea align=1 (i32.const 0)))
    (local.set 0x3eb (i64.load offset=0x3eb align=1 (i32.const 0)))
    (local.set 0x3ec (i64.load offset=0x3ec align=1 (i32.const 0)))
    (local.set 0x3ed (i64.load offset=0x3ed align=1 (i32.const 0)))
    (local.set 0x3ee (i64.load offset=0x3ee align=1 (i32.const 0)))
    (local.set 0x3ef (i64.load offset=0x3ef align=1 (i32.const 0)))
    (local.set 0x3f0 (i64.load offset=0x3f0 align=1 (i32.const 0)))
    (local.set 0x3f1 (i64.load offset=0x3f1 align=1 (i32.const 0)))
    (local.set 0x3f2 (i64.load offset=0x3f2 align=1 (i32.const 0)))
    (local.set 0x3f3 (i64.load offset=0x3f3 align=1 (i32.const 0)))
    (local.set 0x3f4 (i64.load offset=0x3f4 align=1 (i32.const 0)))
    (local.set 0x3f5 (i64.load offset=0x3f5 align=1 (i32.const 0)))
    (local.set 0x3f6 (i64.load offset=0x3f6 align=1 (i32.const 0)))
    (local.set 0x3f7 (i64.load offset=0x3f7 align=1 (i32.const 0)))
    (local.set 0x3f8 (i64.load offset=0x3f8 align=1 (i32.const 0)))
    (local.set 0x3f9 (i64.load offset=0x3f9 align=1 (i32.const 0)))
    (local.set 0x3fa (i64.load offset=0x3fa align=1 (i32.const 0)))
    (local.set 0x3fb (i64.load offset=0x3fb align=1 (i32.const 0)))
    (local.set 0x3fc (i64.load offset=0x3fc align=1 (i32.const 0)))
    (local.set 0x3fd (i64.load offset=0x3fd align=1 (i32.const 0)))
    (local.set 0x3fe (i64.load offset=0x3fe align=1 (i32.const 0)))
    (local.set 0x3ff (i64.load offset=0x3ff align=1 (i32.const 0)))
    (local.set 0x400 (i64.load offset=0x400 align=1 (i32.const 0)))
    (local.set 0x401 (i64.load offset=0x401 align=1 (i32.const 0)))
    (local.set 0x402 (i64.load offset=0x402 align=1 (i32.const 0)))
    (local.set 0x403 (i64.load offset=0x403 align=1 (i32.const 0)))
    (local.set 0x404 (i64.load offset=0x404 align=1 (i32.const 0)))
    (local.set 0x405 (i64.load offset=0x405 align=1 (i32.const 0)))
    (local.set 0x406 (i64.load offset=0x406 align=1 (i32.const 0)))
    (local.set 0x407 (i64.load offset=0x407 align=1 (i32.const 0)))
    (local.set 0x408 (i64.load offset=0x408 align=1 (i32.const 0)))
    (local.set 0x409 (i64.load offset=0x409 align=1 (i32.const 0)))
    (local.set 0x40a (i64.load offset=0x40a align=1 (i32.const 0)))
    (local.set 0x40b (i64.load offset=0x40b align=1 (i32.const 0)))
    (local.set 0x40c (i64.load offset=0x40c align=1 (i32.const 0)))
    (local.set 0x40d (i64.load offset=0x40d align=1 (i32.const 0)))
    (local.set 0x40e (i64.load offset=0x40e align=1 (i32.const 0)))
    (local.set 0x40f (i64.load offset=0x40f align=1 (i32.const 0)))
    (local.set 0x410 (i64.load offset=0x410 align=1 (i32.const 0)))
    (local.set 0x411 (i64.load offset=0x411 align=1 (i32.const 0)))
    (local.set 0x412 (i64.load offset=0x412 align=1 (i32.const 0)))
    (local.set 0x413 (i64.load offset=0x413 align=1 (i32.const 0)))
    (local.set 0x414 (i64.load offset=0x414 align=1 (i32.const 0)))
    (local.set 0x415 (i64.load offset=0x415 align=1 (i32.const 0)))
    (local.set 0x416 (i64.load offset=0x416 align=1 (i32.const 0)))
    (local.set 0x417 (i64.load offset=0x417 align=1 (i32.const 0)))
    (local.set 0x418 (i64.load offset=0x418 align=1 (i32.const 0)))
    (local.set 0x419 (i64.load offset=0x419 align=1 (i32.const 0)))
    (local.set 0x41a (i64.load offset=0x41a align=1 (i32.const 0)))
    (local.set 0x41b (i64.load offset=0x41b align=1 (i32.const 0)))
    (local.set 0x41c (i64.load offset=0x41c align=1 (i32.const 0)))
    (local.set 0x41d (i64.load offset=0x41d align=1 (i32.const 0)))
    (local.set 0x41e (i64.load offset=0x41e align=1 (i32.const 0)))
    (local.set 0x41f (i64.load offset=0x41f align=1 (i32.const 0)))

    ;; store the locals back to memory
    (i64.store offset=0x000 align=1 (i32.const 0) (local.get 0x000))
    (i64.store offset=0x001 align=1 (i32.const 0) (local.get 0x001))
    (i64.store offset=0x002 align=1 (i32.const 0) (local.get 0x002))
    (i64.store offset=0x003 align=1 (i32.const 0) (local.get 0x003))
    (i64.store offset=0x004 align=1 (i32.const 0) (local.get 0x004))
    (i64.store offset=0x005 align=1 (i32.const 0) (local.get 0x005))
    (i64.store offset=0x006 align=1 (i32.const 0) (local.get 0x006))
    (i64.store offset=0x007 align=1 (i32.const 0) (local.get 0x007))
    (i64.store offset=0x008 align=1 (i32.const 0) (local.get 0x008))
    (i64.store offset=0x009 align=1 (i32.const 0) (local.get 0x009))
    (i64.store offset=0x00a align=1 (i32.const 0) (local.get 0x00a))
    (i64.store offset=0x00b align=1 (i32.const 0) (local.get 0x00b))
    (i64.store offset=0x00c align=1 (i32.const 0) (local.get 0x00c))
    (i64.store offset=0x00d align=1 (i32.const 0) (local.get 0x00d))
    (i64.store offset=0x00e align=1 (i32.const 0) (local.get 0x00e))
    (i64.store offset=0x00f align=1 (i32.const 0) (local.get 0x00f))
    (i64.store offset=0x010 align=1 (i32.const 0) (local.get 0x010))
    (i64.store offset=0x011 align=1 (i32.const 0) (local.get 0x011))
    (i64.store offset=0x012 align=1 (i32.const 0) (local.get 0x012))
    (i64.store offset=0x013 align=1 (i32.const 0) (local.get 0x013))
    (i64.store offset=0x014 align=1 (i32.const 0) (local.get 0x014))
    (i64.store offset=0x015 align=1 (i32.const 0) (local.get 0x015))
    (i64.store offset=0x016 align=1 (i32.const 0) (local.get 0x016))
    (i64.store offset=0x017 align=1 (i32.const 0) (local.get 0x017))
    (i64.store offset=0x018 align=1 (i32.const 0) (local.get 0x018))
    (i64.store offset=0x019 align=1 (i32.const 0) (local.get 0x019))
    (i64.store offset=0x01a align=1 (i32.const 0) (local.get 0x01a))
    (i64.store offset=0x01b align=1 (i32.const 0) (local.get 0x01b))
    (i64.store offset=0x01c align=1 (i32.const 0) (local.get 0x01c))
    (i64.store offset=0x01d align=1 (i32.const 0) (local.get 0x01d))
    (i64.store offset=0x01e align=1 (i32.const 0) (local.get 0x01e))
    (i64.store offset=0x01f align=1 (i32.const 0) (local.get 0x01f))
    (i64.store offset=0x020 align=1 (i32.const 0) (local.get 0x020))
    (i64.store offset=0x021 align=1 (i32.const 0) (local.get 0x021))
    (i64.store offset=0x022 align=1 (i32.const 0) (local.get 0x022))
    (i64.store offset=0x023 align=1 (i32.const 0) (local.get 0x023))
    (i64.store offset=0x024 align=1 (i32.const 0) (local.get 0x024))
    (i64.store offset=0x025 align=1 (i32.const 0) (local.get 0x025))
    (i64.store offset=0x026 align=1 (i32.const 0) (local.get 0x026))
    (i64.store offset=0x027 align=1 (i32.const 0) (local.get 0x027))
    (i64.store offset=0x028 align=1 (i32.const 0) (local.get 0x028))
    (i64.store offset=0x029 align=1 (i32.const 0) (local.get 0x029))
    (i64.store offset=0x02a align=1 (i32.const 0) (local.get 0x02a))
    (i64.store offset=0x02b align=1 (i32.const 0) (local.get 0x02b))
    (i64.store offset=0x02c align=1 (i32.const 0) (local.get 0x02c))
    (i64.store offset=0x02d align=1 (i32.const 0) (local.get 0x02d))
    (i64.store offset=0x02e align=1 (i32.const 0) (local.get 0x02e))
    (i64.store offset=0x02f align=1 (i32.const 0) (local.get 0x02f))
    (i64.store offset=0x030 align=1 (i32.const 0) (local.get 0x030))
    (i64.store offset=0x031 align=1 (i32.const 0) (local.get 0x031))
    (i64.store offset=0x032 align=1 (i32.const 0) (local.get 0x032))
    (i64.store offset=0x033 align=1 (i32.const 0) (local.get 0x033))
    (i64.store offset=0x034 align=1 (i32.const 0) (local.get 0x034))
    (i64.store offset=0x035 align=1 (i32.const 0) (local.get 0x035))
    (i64.store offset=0x036 align=1 (i32.const 0) (local.get 0x036))
    (i64.store offset=0x037 align=1 (i32.const 0) (local.get 0x037))
    (i64.store offset=0x038 align=1 (i32.const 0) (local.get 0x038))
    (i64.store offset=0x039 align=1 (i32.const 0) (local.get 0x039))
    (i64.store offset=0x03a align=1 (i32.const 0) (local.get 0x03a))
    (i64.store offset=0x03b align=1 (i32.const 0) (local.get 0x03b))
    (i64.store offset=0x03c align=1 (i32.const 0) (local.get 0x03c))
    (i64.store offset=0x03d align=1 (i32.const 0) (local.get 0x03d))
    (i64.store offset=0x03e align=1 (i32.const 0) (local.get 0x03e))
    (i64.store offset=0x03f align=1 (i32.const 0) (local.get 0x03f))
    (i64.store offset=0x040 align=1 (i32.const 0) (local.get 0x040))
    (i64.store offset=0x041 align=1 (i32.const 0) (local.get 0x041))
    (i64.store offset=0x042 align=1 (i32.const 0) (local.get 0x042))
    (i64.store offset=0x043 align=1 (i32.const 0) (local.get 0x043))
    (i64.store offset=0x044 align=1 (i32.const 0) (local.get 0x044))
    (i64.store offset=0x045 align=1 (i32.const 0) (local.get 0x045))
    (i64.store offset=0x046 align=1 (i32.const 0) (local.get 0x046))
    (i64.store offset=0x047 align=1 (i32.const 0) (local.get 0x047))
    (i64.store offset=0x048 align=1 (i32.const 0) (local.get 0x048))
    (i64.store offset=0x049 align=1 (i32.const 0) (local.get 0x049))
    (i64.store offset=0x04a align=1 (i32.const 0) (local.get 0x04a))
    (i64.store offset=0x04b align=1 (i32.const 0) (local.get 0x04b))
    (i64.store offset=0x04c align=1 (i32.const 0) (local.get 0x04c))
    (i64.store offset=0x04d align=1 (i32.const 0) (local.get 0x04d))
    (i64.store offset=0x04e align=1 (i32.const 0) (local.get 0x04e))
    (i64.store offset=0x04f align=1 (i32.const 0) (local.get 0x04f))
    (i64.store offset=0x050 align=1 (i32.const 0) (local.get 0x050))
    (i64.store offset=0x051 align=1 (i32.const 0) (local.get 0x051))
    (i64.store offset=0x052 align=1 (i32.const 0) (local.get 0x052))
    (i64.store offset=0x053 align=1 (i32.const 0) (local.get 0x053))
    (i64.store offset=0x054 align=1 (i32.const 0) (local.get 0x054))
    (i64.store offset=0x055 align=1 (i32.const 0) (local.get 0x055))
    (i64.store offset=0x056 align=1 (i32.const 0) (local.get 0x056))
    (i64.store offset=0x057 align=1 (i32.const 0) (local.get 0x057))
    (i64.store offset=0x058 align=1 (i32.const 0) (local.get 0x058))
    (i64.store offset=0x059 align=1 (i32.const 0) (local.get 0x059))
    (i64.store offset=0x05a align=1 (i32.const 0) (local.get 0x05a))
    (i64.store offset=0x05b align=1 (i32.const 0) (local.get 0x05b))
    (i64.store offset=0x05c align=1 (i32.const 0) (local.get 0x05c))
    (i64.store offset=0x05d align=1 (i32.const 0) (local.get 0x05d))
    (i64.store offset=0x05e align=1 (i32.const 0) (local.get 0x05e))
    (i64.store offset=0x05f align=1 (i32.const 0) (local.get 0x05f))
    (i64.store offset=0x060 align=1 (i32.const 0) (local.get 0x060))
    (i64.store offset=0x061 align=1 (i32.const 0) (local.get 0x061))
    (i64.store offset=0x062 align=1 (i32.const 0) (local.get 0x062))
    (i64.store offset=0x063 align=1 (i32.const 0) (local.get 0x063))
    (i64.store offset=0x064 align=1 (i32.const 0) (local.get 0x064))
    (i64.store offset=0x065 align=1 (i32.const 0) (local.get 0x065))
    (i64.store offset=0x066 align=1 (i32.const 0) (local.get 0x066))
    (i64.store offset=0x067 align=1 (i32.const 0) (local.get 0x067))
    (i64.store offset=0x068 align=1 (i32.const 0) (local.get 0x068))
    (i64.store offset=0x069 align=1 (i32.const 0) (local.get 0x069))
    (i64.store offset=0x06a align=1 (i32.const 0) (local.get 0x06a))
    (i64.store offset=0x06b align=1 (i32.const 0) (local.get 0x06b))
    (i64.store offset=0x06c align=1 (i32.const 0) (local.get 0x06c))
    (i64.store offset=0x06d align=1 (i32.const 0) (local.get 0x06d))
    (i64.store offset=0x06e align=1 (i32.const 0) (local.get 0x06e))
    (i64.store offset=0x06f align=1 (i32.const 0) (local.get 0x06f))
    (i64.store offset=0x070 align=1 (i32.const 0) (local.get 0x070))
    (i64.store offset=0x071 align=1 (i32.const 0) (local.get 0x071))
    (i64.store offset=0x072 align=1 (i32.const 0) (local.get 0x072))
    (i64.store offset=0x073 align=1 (i32.const 0) (local.get 0x073))
    (i64.store offset=0x074 align=1 (i32.const 0) (local.get 0x074))
    (i64.store offset=0x075 align=1 (i32.const 0) (local.get 0x075))
    (i64.store offset=0x076 align=1 (i32.const 0) (local.get 0x076))
    (i64.store offset=0x077 align=1 (i32.const 0) (local.get 0x077))
    (i64.store offset=0x078 align=1 (i32.const 0) (local.get 0x078))
    (i64.store offset=0x079 align=1 (i32.const 0) (local.get 0x079))
    (i64.store offset=0x07a align=1 (i32.const 0) (local.get 0x07a))
    (i64.store offset=0x07b align=1 (i32.const 0) (local.get 0x07b))
    (i64.store offset=0x07c align=1 (i32.const 0) (local.get 0x07c))
    (i64.store offset=0x07d align=1 (i32.const 0) (local.get 0x07d))
    (i64.store offset=0x07e align=1 (i32.const 0) (local.get 0x07e))
    (i64.store offset=0x07f align=1 (i32.const 0) (local.get 0x07f))
    (i64.store offset=0x080 align=1 (i32.const 0) (local.get 0x080))
    (i64.store offset=0x081 align=1 (i32.const 0) (local.get 0x081))
    (i64.store offset=0x082 align=1 (i32.const 0) (local.get 0x082))
    (i64.store offset=0x083 align=1 (i32.const 0) (local.get 0x083))
    (i64.store offset=0x084 align=1 (i32.const 0) (local.get 0x084))
    (i64.store offset=0x085 align=1 (i32.const 0) (local.get 0x085))
    (i64.store offset=0x086 align=1 (i32.const 0) (local.get 0x086))
    (i64.store offset=0x087 align=1 (i32.const 0) (local.get 0x087))
    (i64.store offset=0x088 align=1 (i32.const 0) (local.get 0x088))
    (i64.store offset=0x089 align=1 (i32.const 0) (local.get 0x089))
    (i64.store offset=0x08a align=1 (i32.const 0) (local.get 0x08a))
    (i64.store offset=0x08b align=1 (i32.const 0) (local.get 0x08b))
    (i64.store offset=0x08c align=1 (i32.const 0) (local.get 0x08c))
    (i64.store offset=0x08d align=1 (i32.const 0) (local.get 0x08d))
    (i64.store offset=0x08e align=1 (i32.const 0) (local.get 0x08e))
    (i64.store offset=0x08f align=1 (i32.const 0) (local.get 0x08f))
    (i64.store offset=0x090 align=1 (i32.const 0) (local.get 0x090))
    (i64.store offset=0x091 align=1 (i32.const 0) (local.get 0x091))
    (i64.store offset=0x092 align=1 (i32.const 0) (local.get 0x092))
    (i64.store offset=0x093 align=1 (i32.const 0) (local.get 0x093))
    (i64.store offset=0x094 align=1 (i32.const 0) (local.get 0x094))
    (i64.store offset=0x095 align=1 (i32.const 0) (local.get 0x095))
    (i64.store offset=0x096 align=1 (i32.const 0) (local.get 0x096))
    (i64.store offset=0x097 align=1 (i32.const 0) (local.get 0x097))
    (i64.store offset=0x098 align=1 (i32.const 0) (local.get 0x098))
    (i64.store offset=0x099 align=1 (i32.const 0) (local.get 0x099))
    (i64.store offset=0x09a align=1 (i32.const 0) (local.get 0x09a))
    (i64.store offset=0x09b align=1 (i32.const 0) (local.get 0x09b))
    (i64.store offset=0x09c align=1 (i32.const 0) (local.get 0x09c))
    (i64.store offset=0x09d align=1 (i32.const 0) (local.get 0x09d))
    (i64.store offset=0x09e align=1 (i32.const 0) (local.get 0x09e))
    (i64.store offset=0x09f align=1 (i32.const 0) (local.get 0x09f))
    (i64.store offset=0x0a0 align=1 (i32.const 0) (local.get 0x0a0))
    (i64.store offset=0x0a1 align=1 (i32.const 0) (local.get 0x0a1))
    (i64.store offset=0x0a2 align=1 (i32.const 0) (local.get 0x0a2))
    (i64.store offset=0x0a3 align=1 (i32.const 0) (local.get 0x0a3))
    (i64.store offset=0x0a4 align=1 (i32.const 0) (local.get 0x0a4))
    (i64.store offset=0x0a5 align=1 (i32.const 0) (local.get 0x0a5))
    (i64.store offset=0x0a6 align=1 (i32.const 0) (local.get 0x0a6))
    (i64.store offset=0x0a7 align=1 (i32.const 0) (local.get 0x0a7))
    (i64.store offset=0x0a8 align=1 (i32.const 0) (local.get 0x0a8))
    (i64.store offset=0x0a9 align=1 (i32.const 0) (local.get 0x0a9))
    (i64.store offset=0x0aa align=1 (i32.const 0) (local.get 0x0aa))
    (i64.store offset=0x0ab align=1 (i32.const 0) (local.get 0x0ab))
    (i64.store offset=0x0ac align=1 (i32.const 0) (local.get 0x0ac))
    (i64.store offset=0x0ad align=1 (i32.const 0) (local.get 0x0ad))
    (i64.store offset=0x0ae align=1 (i32.const 0) (local.get 0x0ae))
    (i64.store offset=0x0af align=1 (i32.const 0) (local.get 0x0af))
    (i64.store offset=0x0b0 align=1 (i32.const 0) (local.get 0x0b0))
    (i64.store offset=0x0b1 align=1 (i32.const 0) (local.get 0x0b1))
    (i64.store offset=0x0b2 align=1 (i32.const 0) (local.get 0x0b2))
    (i64.store offset=0x0b3 align=1 (i32.const 0) (local.get 0x0b3))
    (i64.store offset=0x0b4 align=1 (i32.const 0) (local.get 0x0b4))
    (i64.store offset=0x0b5 align=1 (i32.const 0) (local.get 0x0b5))
    (i64.store offset=0x0b6 align=1 (i32.const 0) (local.get 0x0b6))
    (i64.store offset=0x0b7 align=1 (i32.const 0) (local.get 0x0b7))
    (i64.store offset=0x0b8 align=1 (i32.const 0) (local.get 0x0b8))
    (i64.store offset=0x0b9 align=1 (i32.const 0) (local.get 0x0b9))
    (i64.store offset=0x0ba align=1 (i32.const 0) (local.get 0x0ba))
    (i64.store offset=0x0bb align=1 (i32.const 0) (local.get 0x0bb))
    (i64.store offset=0x0bc align=1 (i32.const 0) (local.get 0x0bc))
    (i64.store offset=0x0bd align=1 (i32.const 0) (local.get 0x0bd))
    (i64.store offset=0x0be align=1 (i32.const 0) (local.get 0x0be))
    (i64.store offset=0x0bf align=1 (i32.const 0) (local.get 0x0bf))
    (i64.store offset=0x0c0 align=1 (i32.const 0) (local.get 0x0c0))
    (i64.store offset=0x0c1 align=1 (i32.const 0) (local.get 0x0c1))
    (i64.store offset=0x0c2 align=1 (i32.const 0) (local.get 0x0c2))
    (i64.store offset=0x0c3 align=1 (i32.const 0) (local.get 0x0c3))
    (i64.store offset=0x0c4 align=1 (i32.const 0) (local.get 0x0c4))
    (i64.store offset=0x0c5 align=1 (i32.const 0) (local.get 0x0c5))
    (i64.store offset=0x0c6 align=1 (i32.const 0) (local.get 0x0c6))
    (i64.store offset=0x0c7 align=1 (i32.const 0) (local.get 0x0c7))
    (i64.store offset=0x0c8 align=1 (i32.const 0) (local.get 0x0c8))
    (i64.store offset=0x0c9 align=1 (i32.const 0) (local.get 0x0c9))
    (i64.store offset=0x0ca align=1 (i32.const 0) (local.get 0x0ca))
    (i64.store offset=0x0cb align=1 (i32.const 0) (local.get 0x0cb))
    (i64.store offset=0x0cc align=1 (i32.const 0) (local.get 0x0cc))
    (i64.store offset=0x0cd align=1 (i32.const 0) (local.get 0x0cd))
    (i64.store offset=0x0ce align=1 (i32.const 0) (local.get 0x0ce))
    (i64.store offset=0x0cf align=1 (i32.const 0) (local.get 0x0cf))
    (i64.store offset=0x0d0 align=1 (i32.const 0) (local.get 0x0d0))
    (i64.store offset=0x0d1 align=1 (i32.const 0) (local.get 0x0d1))
    (i64.store offset=0x0d2 align=1 (i32.const 0) (local.get 0x0d2))
    (i64.store offset=0x0d3 align=1 (i32.const 0) (local.get 0x0d3))
    (i64.store offset=0x0d4 align=1 (i32.const 0) (local.get 0x0d4))
    (i64.store offset=0x0d5 align=1 (i32.const 0) (local.get 0x0d5))
    (i64.store offset=0x0d6 align=1 (i32.const 0) (local.get 0x0d6))
    (i64.store offset=0x0d7 align=1 (i32.const 0) (local.get 0x0d7))
    (i64.store offset=0x0d8 align=1 (i32.const 0) (local.get 0x0d8))
    (i64.store offset=0x0d9 align=1 (i32.const 0) (local.get 0x0d9))
    (i64.store offset=0x0da align=1 (i32.const 0) (local.get 0x0da))
    (i64.store offset=0x0db align=1 (i32.const 0) (local.get 0x0db))
    (i64.store offset=0x0dc align=1 (i32.const 0) (local.get 0x0dc))
    (i64.store offset=0x0dd align=1 (i32.const 0) (local.get 0x0dd))
    (i64.store offset=0x0de align=1 (i32.const 0) (local.get 0x0de))
    (i64.store offset=0x0df align=1 (i32.const 0) (local.get 0x0df))
    (i64.store offset=0x0e0 align=1 (i32.const 0) (local.get 0x0e0))
    (i64.store offset=0x0e1 align=1 (i32.const 0) (local.get 0x0e1))
    (i64.store offset=0x0e2 align=1 (i32.const 0) (local.get 0x0e2))
    (i64.store offset=0x0e3 align=1 (i32.const 0) (local.get 0x0e3))
    (i64.store offset=0x0e4 align=1 (i32.const 0) (local.get 0x0e4))
    (i64.store offset=0x0e5 align=1 (i32.const 0) (local.get 0x0e5))
    (i64.store offset=0x0e6 align=1 (i32.const 0) (local.get 0x0e6))
    (i64.store offset=0x0e7 align=1 (i32.const 0) (local.get 0x0e7))
    (i64.store offset=0x0e8 align=1 (i32.const 0) (local.get 0x0e8))
    (i64.store offset=0x0e9 align=1 (i32.const 0) (local.get 0x0e9))
    (i64.store offset=0x0ea align=1 (i32.const 0) (local.get 0x0ea))
    (i64.store offset=0x0eb align=1 (i32.const 0) (local.get 0x0eb))
    (i64.store offset=0x0ec align=1 (i32.const 0) (local.get 0x0ec))
    (i64.store offset=0x0ed align=1 (i32.const 0) (local.get 0x0ed))
    (i64.store offset=0x0ee align=1 (i32.const 0) (local.get 0x0ee))
    (i64.store offset=0x0ef align=1 (i32.const 0) (local.get 0x0ef))
    (i64.store offset=0x0f0 align=1 (i32.const 0) (local.get 0x0f0))
    (i64.store offset=0x0f1 align=1 (i32.const 0) (local.get 0x0f1))
    (i64.store offset=0x0f2 align=1 (i32.const 0) (local.get 0x0f2))
    (i64.store offset=0x0f3 align=1 (i32.const 0) (local.get 0x0f3))
    (i64.store offset=0x0f4 align=1 (i32.const 0) (local.get 0x0f4))
    (i64.store offset=0x0f5 align=1 (i32.const 0) (local.get 0x0f5))
    (i64.store offset=0x0f6 align=1 (i32.const 0) (local.get 0x0f6))
    (i64.store offset=0x0f7 align=1 (i32.const 0) (local.get 0x0f7))
    (i64.store offset=0x0f8 align=1 (i32.const 0) (local.get 0x0f8))
    (i64.store offset=0x0f9 align=1 (i32.const 0) (local.get 0x0f9))
    (i64.store offset=0x0fa align=1 (i32.const 0) (local.get 0x0fa))
    (i64.store offset=0x0fb align=1 (i32.const 0) (local.get 0x0fb))
    (i64.store offset=0x0fc align=1 (i32.const 0) (local.get 0x0fc))
    (i64.store offset=0x0fd align=1 (i32.const 0) (local.get 0x0fd))
    (i64.store offset=0x0fe align=1 (i32.const 0) (local.get 0x0fe))
    (i64.store offset=0x0ff align=1 (i32.const 0) (local.get 0x0ff))
    (i64.store offset=0x100 align=1 (i32.const 0) (local.get 0x100))
    (i64.store offset=0x101 align=1 (i32.const 0) (local.get 0x101))
    (i64.store offset=0x102 align=1 (i32.const 0) (local.get 0x102))
    (i64.store offset=0x103 align=1 (i32.const 0) (local.get 0x103))
    (i64.store offset=0x104 align=1 (i32.const 0) (local.get 0x104))
    (i64.store offset=0x105 align=1 (i32.const 0) (local.get 0x105))
    (i64.store offset=0x106 align=1 (i32.const 0) (local.get 0x106))
    (i64.store offset=0x107 align=1 (i32.const 0) (local.get 0x107))
    (i64.store offset=0x108 align=1 (i32.const 0) (local.get 0x108))
    (i64.store offset=0x109 align=1 (i32.const 0) (local.get 0x109))
    (i64.store offset=0x10a align=1 (i32.const 0) (local.get 0x10a))
    (i64.store offset=0x10b align=1 (i32.const 0) (local.get 0x10b))
    (i64.store offset=0x10c align=1 (i32.const 0) (local.get 0x10c))
    (i64.store offset=0x10d align=1 (i32.const 0) (local.get 0x10d))
    (i64.store offset=0x10e align=1 (i32.const 0) (local.get 0x10e))
    (i64.store offset=0x10f align=1 (i32.const 0) (local.get 0x10f))
    (i64.store offset=0x110 align=1 (i32.const 0) (local.get 0x110))
    (i64.store offset=0x111 align=1 (i32.const 0) (local.get 0x111))
    (i64.store offset=0x112 align=1 (i32.const 0) (local.get 0x112))
    (i64.store offset=0x113 align=1 (i32.const 0) (local.get 0x113))
    (i64.store offset=0x114 align=1 (i32.const 0) (local.get 0x114))
    (i64.store offset=0x115 align=1 (i32.const 0) (local.get 0x115))
    (i64.store offset=0x116 align=1 (i32.const 0) (local.get 0x116))
    (i64.store offset=0x117 align=1 (i32.const 0) (local.get 0x117))
    (i64.store offset=0x118 align=1 (i32.const 0) (local.get 0x118))
    (i64.store offset=0x119 align=1 (i32.const 0) (local.get 0x119))
    (i64.store offset=0x11a align=1 (i32.const 0) (local.get 0x11a))
    (i64.store offset=0x11b align=1 (i32.const 0) (local.get 0x11b))
    (i64.store offset=0x11c align=1 (i32.const 0) (local.get 0x11c))
    (i64.store offset=0x11d align=1 (i32.const 0) (local.get 0x11d))
    (i64.store offset=0x11e align=1 (i32.const 0) (local.get 0x11e))
    (i64.store offset=0x11f align=1 (i32.const 0) (local.get 0x11f))
    (i64.store offset=0x120 align=1 (i32.const 0) (local.get 0x120))
    (i64.store offset=0x121 align=1 (i32.const 0) (local.get 0x121))
    (i64.store offset=0x122 align=1 (i32.const 0) (local.get 0x122))
    (i64.store offset=0x123 align=1 (i32.const 0) (local.get 0x123))
    (i64.store offset=0x124 align=1 (i32.const 0) (local.get 0x124))
    (i64.store offset=0x125 align=1 (i32.const 0) (local.get 0x125))
    (i64.store offset=0x126 align=1 (i32.const 0) (local.get 0x126))
    (i64.store offset=0x127 align=1 (i32.const 0) (local.get 0x127))
    (i64.store offset=0x128 align=1 (i32.const 0) (local.get 0x128))
    (i64.store offset=0x129 align=1 (i32.const 0) (local.get 0x129))
    (i64.store offset=0x12a align=1 (i32.const 0) (local.get 0x12a))
    (i64.store offset=0x12b align=1 (i32.const 0) (local.get 0x12b))
    (i64.store offset=0x12c align=1 (i32.const 0) (local.get 0x12c))
    (i64.store offset=0x12d align=1 (i32.const 0) (local.get 0x12d))
    (i64.store offset=0x12e align=1 (i32.const 0) (local.get 0x12e))
    (i64.store offset=0x12f align=1 (i32.const 0) (local.get 0x12f))
    (i64.store offset=0x130 align=1 (i32.const 0) (local.get 0x130))
    (i64.store offset=0x131 align=1 (i32.const 0) (local.get 0x131))
    (i64.store offset=0x132 align=1 (i32.const 0) (local.get 0x132))
    (i64.store offset=0x133 align=1 (i32.const 0) (local.get 0x133))
    (i64.store offset=0x134 align=1 (i32.const 0) (local.get 0x134))
    (i64.store offset=0x135 align=1 (i32.const 0) (local.get 0x135))
    (i64.store offset=0x136 align=1 (i32.const 0) (local.get 0x136))
    (i64.store offset=0x137 align=1 (i32.const 0) (local.get 0x137))
    (i64.store offset=0x138 align=1 (i32.const 0) (local.get 0x138))
    (i64.store offset=0x139 align=1 (i32.const 0) (local.get 0x139))
    (i64.store offset=0x13a align=1 (i32.const 0) (local.get 0x13a))
    (i64.store offset=0x13b align=1 (i32.const 0) (local.get 0x13b))
    (i64.store offset=0x13c align=1 (i32.const 0) (local.get 0x13c))
    (i64.store offset=0x13d align=1 (i32.const 0) (local.get 0x13d))
    (i64.store offset=0x13e align=1 (i32.const 0) (local.get 0x13e))
    (i64.store offset=0x13f align=1 (i32.const 0) (local.get 0x13f))
    (i64.store offset=0x140 align=1 (i32.const 0) (local.get 0x140))
    (i64.store offset=0x141 align=1 (i32.const 0) (local.get 0x141))
    (i64.store offset=0x142 align=1 (i32.const 0) (local.get 0x142))
    (i64.store offset=0x143 align=1 (i32.const 0) (local.get 0x143))
    (i64.store offset=0x144 align=1 (i32.const 0) (local.get 0x144))
    (i64.store offset=0x145 align=1 (i32.const 0) (local.get 0x145))
    (i64.store offset=0x146 align=1 (i32.const 0) (local.get 0x146))
    (i64.store offset=0x147 align=1 (i32.const 0) (local.get 0x147))
    (i64.store offset=0x148 align=1 (i32.const 0) (local.get 0x148))
    (i64.store offset=0x149 align=1 (i32.const 0) (local.get 0x149))
    (i64.store offset=0x14a align=1 (i32.const 0) (local.get 0x14a))
    (i64.store offset=0x14b align=1 (i32.const 0) (local.get 0x14b))
    (i64.store offset=0x14c align=1 (i32.const 0) (local.get 0x14c))
    (i64.store offset=0x14d align=1 (i32.const 0) (local.get 0x14d))
    (i64.store offset=0x14e align=1 (i32.const 0) (local.get 0x14e))
    (i64.store offset=0x14f align=1 (i32.const 0) (local.get 0x14f))
    (i64.store offset=0x150 align=1 (i32.const 0) (local.get 0x150))
    (i64.store offset=0x151 align=1 (i32.const 0) (local.get 0x151))
    (i64.store offset=0x152 align=1 (i32.const 0) (local.get 0x152))
    (i64.store offset=0x153 align=1 (i32.const 0) (local.get 0x153))
    (i64.store offset=0x154 align=1 (i32.const 0) (local.get 0x154))
    (i64.store offset=0x155 align=1 (i32.const 0) (local.get 0x155))
    (i64.store offset=0x156 align=1 (i32.const 0) (local.get 0x156))
    (i64.store offset=0x157 align=1 (i32.const 0) (local.get 0x157))
    (i64.store offset=0x158 align=1 (i32.const 0) (local.get 0x158))
    (i64.store offset=0x159 align=1 (i32.const 0) (local.get 0x159))
    (i64.store offset=0x15a align=1 (i32.const 0) (local.get 0x15a))
    (i64.store offset=0x15b align=1 (i32.const 0) (local.get 0x15b))
    (i64.store offset=0x15c align=1 (i32.const 0) (local.get 0x15c))
    (i64.store offset=0x15d align=1 (i32.const 0) (local.get 0x15d))
    (i64.store offset=0x15e align=1 (i32.const 0) (local.get 0x15e))
    (i64.store offset=0x15f align=1 (i32.const 0) (local.get 0x15f))
    (i64.store offset=0x160 align=1 (i32.const 0) (local.get 0x160))
    (i64.store offset=0x161 align=1 (i32.const 0) (local.get 0x161))
    (i64.store offset=0x162 align=1 (i32.const 0) (local.get 0x162))
    (i64.store offset=0x163 align=1 (i32.const 0) (local.get 0x163))
    (i64.store offset=0x164 align=1 (i32.const 0) (local.get 0x164))
    (i64.store offset=0x165 align=1 (i32.const 0) (local.get 0x165))
    (i64.store offset=0x166 align=1 (i32.const 0) (local.get 0x166))
    (i64.store offset=0x167 align=1 (i32.const 0) (local.get 0x167))
    (i64.store offset=0x168 align=1 (i32.const 0) (local.get 0x168))
    (i64.store offset=0x169 align=1 (i32.const 0) (local.get 0x169))
    (i64.store offset=0x16a align=1 (i32.const 0) (local.get 0x16a))
    (i64.store offset=0x16b align=1 (i32.const 0) (local.get 0x16b))
    (i64.store offset=0x16c align=1 (i32.const 0) (local.get 0x16c))
    (i64.store offset=0x16d align=1 (i32.const 0) (local.get 0x16d))
    (i64.store offset=0x16e align=1 (i32.const 0) (local.get 0x16e))
    (i64.store offset=0x16f align=1 (i32.const 0) (local.get 0x16f))
    (i64.store offset=0x170 align=1 (i32.const 0) (local.get 0x170))
    (i64.store offset=0x171 align=1 (i32.const 0) (local.get 0x171))
    (i64.store offset=0x172 align=1 (i32.const 0) (local.get 0x172))
    (i64.store offset=0x173 align=1 (i32.const 0) (local.get 0x173))
    (i64.store offset=0x174 align=1 (i32.const 0) (local.get 0x174))
    (i64.store offset=0x175 align=1 (i32.const 0) (local.get 0x175))
    (i64.store offset=0x176 align=1 (i32.const 0) (local.get 0x176))
    (i64.store offset=0x177 align=1 (i32.const 0) (local.get 0x177))
    (i64.store offset=0x178 align=1 (i32.const 0) (local.get 0x178))
    (i64.store offset=0x179 align=1 (i32.const 0) (local.get 0x179))
    (i64.store offset=0x17a align=1 (i32.const 0) (local.get 0x17a))
    (i64.store offset=0x17b align=1 (i32.const 0) (local.get 0x17b))
    (i64.store offset=0x17c align=1 (i32.const 0) (local.get 0x17c))
    (i64.store offset=0x17d align=1 (i32.const 0) (local.get 0x17d))
    (i64.store offset=0x17e align=1 (i32.const 0) (local.get 0x17e))
    (i64.store offset=0x17f align=1 (i32.const 0) (local.get 0x17f))
    (i64.store offset=0x180 align=1 (i32.const 0) (local.get 0x180))
    (i64.store offset=0x181 align=1 (i32.const 0) (local.get 0x181))
    (i64.store offset=0x182 align=1 (i32.const 0) (local.get 0x182))
    (i64.store offset=0x183 align=1 (i32.const 0) (local.get 0x183))
    (i64.store offset=0x184 align=1 (i32.const 0) (local.get 0x184))
    (i64.store offset=0x185 align=1 (i32.const 0) (local.get 0x185))
    (i64.store offset=0x186 align=1 (i32.const 0) (local.get 0x186))
    (i64.store offset=0x187 align=1 (i32.const 0) (local.get 0x187))
    (i64.store offset=0x188 align=1 (i32.const 0) (local.get 0x188))
    (i64.store offset=0x189 align=1 (i32.const 0) (local.get 0x189))
    (i64.store offset=0x18a align=1 (i32.const 0) (local.get 0x18a))
    (i64.store offset=0x18b align=1 (i32.const 0) (local.get 0x18b))
    (i64.store offset=0x18c align=1 (i32.const 0) (local.get 0x18c))
    (i64.store offset=0x18d align=1 (i32.const 0) (local.get 0x18d))
    (i64.store offset=0x18e align=1 (i32.const 0) (local.get 0x18e))
    (i64.store offset=0x18f align=1 (i32.const 0) (local.get 0x18f))
    (i64.store offset=0x190 align=1 (i32.const 0) (local.get 0x190))
    (i64.store offset=0x191 align=1 (i32.const 0) (local.get 0x191))
    (i64.store offset=0x192 align=1 (i32.const 0) (local.get 0x192))
    (i64.store offset=0x193 align=1 (i32.const 0) (local.get 0x193))
    (i64.store offset=0x194 align=1 (i32.const 0) (local.get 0x194))
    (i64.store offset=0x195 align=1 (i32.const 0) (local.get 0x195))
    (i64.store offset=0x196 align=1 (i32.const 0) (local.get 0x196))
    (i64.store offset=0x197 align=1 (i32.const 0) (local.get 0x197))
    (i64.store offset=0x198 align=1 (i32.const 0) (local.get 0x198))
    (i64.store offset=0x199 align=1 (i32.const 0) (local.get 0x199))
    (i64.store offset=0x19a align=1 (i32.const 0) (local.get 0x19a))
    (i64.store offset=0x19b align=1 (i32.const 0) (local.get 0x19b))
    (i64.store offset=0x19c align=1 (i32.const 0) (local.get 0x19c))
    (i64.store offset=0x19d align=1 (i32.const 0) (local.get 0x19d))
    (i64.store offset=0x19e align=1 (i32.const 0) (local.get 0x19e))
    (i64.store offset=0x19f align=1 (i32.const 0) (local.get 0x19f))
    (i64.store offset=0x1a0 align=1 (i32.const 0) (local.get 0x1a0))
    (i64.store offset=0x1a1 align=1 (i32.const 0) (local.get 0x1a1))
    (i64.store offset=0x1a2 align=1 (i32.const 0) (local.get 0x1a2))
    (i64.store offset=0x1a3 align=1 (i32.const 0) (local.get 0x1a3))
    (i64.store offset=0x1a4 align=1 (i32.const 0) (local.get 0x1a4))
    (i64.store offset=0x1a5 align=1 (i32.const 0) (local.get 0x1a5))
    (i64.store offset=0x1a6 align=1 (i32.const 0) (local.get 0x1a6))
    (i64.store offset=0x1a7 align=1 (i32.const 0) (local.get 0x1a7))
    (i64.store offset=0x1a8 align=1 (i32.const 0) (local.get 0x1a8))
    (i64.store offset=0x1a9 align=1 (i32.const 0) (local.get 0x1a9))
    (i64.store offset=0x1aa align=1 (i32.const 0) (local.get 0x1aa))
    (i64.store offset=0x1ab align=1 (i32.const 0) (local.get 0x1ab))
    (i64.store offset=0x1ac align=1 (i32.const 0) (local.get 0x1ac))
    (i64.store offset=0x1ad align=1 (i32.const 0) (local.get 0x1ad))
    (i64.store offset=0x1ae align=1 (i32.const 0) (local.get 0x1ae))
    (i64.store offset=0x1af align=1 (i32.const 0) (local.get 0x1af))
    (i64.store offset=0x1b0 align=1 (i32.const 0) (local.get 0x1b0))
    (i64.store offset=0x1b1 align=1 (i32.const 0) (local.get 0x1b1))
    (i64.store offset=0x1b2 align=1 (i32.const 0) (local.get 0x1b2))
    (i64.store offset=0x1b3 align=1 (i32.const 0) (local.get 0x1b3))
    (i64.store offset=0x1b4 align=1 (i32.const 0) (local.get 0x1b4))
    (i64.store offset=0x1b5 align=1 (i32.const 0) (local.get 0x1b5))
    (i64.store offset=0x1b6 align=1 (i32.const 0) (local.get 0x1b6))
    (i64.store offset=0x1b7 align=1 (i32.const 0) (local.get 0x1b7))
    (i64.store offset=0x1b8 align=1 (i32.const 0) (local.get 0x1b8))
    (i64.store offset=0x1b9 align=1 (i32.const 0) (local.get 0x1b9))
    (i64.store offset=0x1ba align=1 (i32.const 0) (local.get 0x1ba))
    (i64.store offset=0x1bb align=1 (i32.const 0) (local.get 0x1bb))
    (i64.store offset=0x1bc align=1 (i32.const 0) (local.get 0x1bc))
    (i64.store offset=0x1bd align=1 (i32.const 0) (local.get 0x1bd))
    (i64.store offset=0x1be align=1 (i32.const 0) (local.get 0x1be))
    (i64.store offset=0x1bf align=1 (i32.const 0) (local.get 0x1bf))
    (i64.store offset=0x1c0 align=1 (i32.const 0) (local.get 0x1c0))
    (i64.store offset=0x1c1 align=1 (i32.const 0) (local.get 0x1c1))
    (i64.store offset=0x1c2 align=1 (i32.const 0) (local.get 0x1c2))
    (i64.store offset=0x1c3 align=1 (i32.const 0) (local.get 0x1c3))
    (i64.store offset=0x1c4 align=1 (i32.const 0) (local.get 0x1c4))
    (i64.store offset=0x1c5 align=1 (i32.const 0) (local.get 0x1c5))
    (i64.store offset=0x1c6 align=1 (i32.const 0) (local.get 0x1c6))
    (i64.store offset=0x1c7 align=1 (i32.const 0) (local.get 0x1c7))
    (i64.store offset=0x1c8 align=1 (i32.const 0) (local.get 0x1c8))
    (i64.store offset=0x1c9 align=1 (i32.const 0) (local.get 0x1c9))
    (i64.store offset=0x1ca align=1 (i32.const 0) (local.get 0x1ca))
    (i64.store offset=0x1cb align=1 (i32.const 0) (local.get 0x1cb))
    (i64.store offset=0x1cc align=1 (i32.const 0) (local.get 0x1cc))
    (i64.store offset=0x1cd align=1 (i32.const 0) (local.get 0x1cd))
    (i64.store offset=0x1ce align=1 (i32.const 0) (local.get 0x1ce))
    (i64.store offset=0x1cf align=1 (i32.const 0) (local.get 0x1cf))
    (i64.store offset=0x1d0 align=1 (i32.const 0) (local.get 0x1d0))
    (i64.store offset=0x1d1 align=1 (i32.const 0) (local.get 0x1d1))
    (i64.store offset=0x1d2 align=1 (i32.const 0) (local.get 0x1d2))
    (i64.store offset=0x1d3 align=1 (i32.const 0) (local.get 0x1d3))
    (i64.store offset=0x1d4 align=1 (i32.const 0) (local.get 0x1d4))
    (i64.store offset=0x1d5 align=1 (i32.const 0) (local.get 0x1d5))
    (i64.store offset=0x1d6 align=1 (i32.const 0) (local.get 0x1d6))
    (i64.store offset=0x1d7 align=1 (i32.const 0) (local.get 0x1d7))
    (i64.store offset=0x1d8 align=1 (i32.const 0) (local.get 0x1d8))
    (i64.store offset=0x1d9 align=1 (i32.const 0) (local.get 0x1d9))
    (i64.store offset=0x1da align=1 (i32.const 0) (local.get 0x1da))
    (i64.store offset=0x1db align=1 (i32.const 0) (local.get 0x1db))
    (i64.store offset=0x1dc align=1 (i32.const 0) (local.get 0x1dc))
    (i64.store offset=0x1dd align=1 (i32.const 0) (local.get 0x1dd))
    (i64.store offset=0x1de align=1 (i32.const 0) (local.get 0x1de))
    (i64.store offset=0x1df align=1 (i32.const 0) (local.get 0x1df))
    (i64.store offset=0x1e0 align=1 (i32.const 0) (local.get 0x1e0))
    (i64.store offset=0x1e1 align=1 (i32.const 0) (local.get 0x1e1))
    (i64.store offset=0x1e2 align=1 (i32.const 0) (local.get 0x1e2))
    (i64.store offset=0x1e3 align=1 (i32.const 0) (local.get 0x1e3))
    (i64.store offset=0x1e4 align=1 (i32.const 0) (local.get 0x1e4))
    (i64.store offset=0x1e5 align=1 (i32.const 0) (local.get 0x1e5))
    (i64.store offset=0x1e6 align=1 (i32.const 0) (local.get 0x1e6))
    (i64.store offset=0x1e7 align=1 (i32.const 0) (local.get 0x1e7))
    (i64.store offset=0x1e8 align=1 (i32.const 0) (local.get 0x1e8))
    (i64.store offset=0x1e9 align=1 (i32.const 0) (local.get 0x1e9))
    (i64.store offset=0x1ea align=1 (i32.const 0) (local.get 0x1ea))
    (i64.store offset=0x1eb align=1 (i32.const 0) (local.get 0x1eb))
    (i64.store offset=0x1ec align=1 (i32.const 0) (local.get 0x1ec))
    (i64.store offset=0x1ed align=1 (i32.const 0) (local.get 0x1ed))
    (i64.store offset=0x1ee align=1 (i32.const 0) (local.get 0x1ee))
    (i64.store offset=0x1ef align=1 (i32.const 0) (local.get 0x1ef))
    (i64.store offset=0x1f0 align=1 (i32.const 0) (local.get 0x1f0))
    (i64.store offset=0x1f1 align=1 (i32.const 0) (local.get 0x1f1))
    (i64.store offset=0x1f2 align=1 (i32.const 0) (local.get 0x1f2))
    (i64.store offset=0x1f3 align=1 (i32.const 0) (local.get 0x1f3))
    (i64.store offset=0x1f4 align=1 (i32.const 0) (local.get 0x1f4))
    (i64.store offset=0x1f5 align=1 (i32.const 0) (local.get 0x1f5))
    (i64.store offset=0x1f6 align=1 (i32.const 0) (local.get 0x1f6))
    (i64.store offset=0x1f7 align=1 (i32.const 0) (local.get 0x1f7))
    (i64.store offset=0x1f8 align=1 (i32.const 0) (local.get 0x1f8))
    (i64.store offset=0x1f9 align=1 (i32.const 0) (local.get 0x1f9))
    (i64.store offset=0x1fa align=1 (i32.const 0) (local.get 0x1fa))
    (i64.store offset=0x1fb align=1 (i32.const 0) (local.get 0x1fb))
    (i64.store offset=0x1fc align=1 (i32.const 0) (local.get 0x1fc))
    (i64.store offset=0x1fd align=1 (i32.const 0) (local.get 0x1fd))
    (i64.store offset=0x1fe align=1 (i32.const 0) (local.get 0x1fe))
    (i64.store offset=0x1ff align=1 (i32.const 0) (local.get 0x1ff))
    (i64.store offset=0x200 align=1 (i32.const 0) (local.get 0x200))
    (i64.store offset=0x201 align=1 (i32.const 0) (local.get 0x201))
    (i64.store offset=0x202 align=1 (i32.const 0) (local.get 0x202))
    (i64.store offset=0x203 align=1 (i32.const 0) (local.get 0x203))
    (i64.store offset=0x204 align=1 (i32.const 0) (local.get 0x204))
    (i64.store offset=0x205 align=1 (i32.const 0) (local.get 0x205))
    (i64.store offset=0x206 align=1 (i32.const 0) (local.get 0x206))
    (i64.store offset=0x207 align=1 (i32.const 0) (local.get 0x207))
    (i64.store offset=0x208 align=1 (i32.const 0) (local.get 0x208))
    (i64.store offset=0x209 align=1 (i32.const 0) (local.get 0x209))
    (i64.store offset=0x20a align=1 (i32.const 0) (local.get 0x20a))
    (i64.store offset=0x20b align=1 (i32.const 0) (local.get 0x20b))
    (i64.store offset=0x20c align=1 (i32.const 0) (local.get 0x20c))
    (i64.store offset=0x20d align=1 (i32.const 0) (local.get 0x20d))
    (i64.store offset=0x20e align=1 (i32.const 0) (local.get 0x20e))
    (i64.store offset=0x20f align=1 (i32.const 0) (local.get 0x20f))
    (i64.store offset=0x210 align=1 (i32.const 0) (local.get 0x210))
    (i64.store offset=0x211 align=1 (i32.const 0) (local.get 0x211))
    (i64.store offset=0x212 align=1 (i32.const 0) (local.get 0x212))
    (i64.store offset=0x213 align=1 (i32.const 0) (local.get 0x213))
    (i64.store offset=0x214 align=1 (i32.const 0) (local.get 0x214))
    (i64.store offset=0x215 align=1 (i32.const 0) (local.get 0x215))
    (i64.store offset=0x216 align=1 (i32.const 0) (local.get 0x216))
    (i64.store offset=0x217 align=1 (i32.const 0) (local.get 0x217))
    (i64.store offset=0x218 align=1 (i32.const 0) (local.get 0x218))
    (i64.store offset=0x219 align=1 (i32.const 0) (local.get 0x219))
    (i64.store offset=0x21a align=1 (i32.const 0) (local.get 0x21a))
    (i64.store offset=0x21b align=1 (i32.const 0) (local.get 0x21b))
    (i64.store offset=0x21c align=1 (i32.const 0) (local.get 0x21c))
    (i64.store offset=0x21d align=1 (i32.const 0) (local.get 0x21d))
    (i64.store offset=0x21e align=1 (i32.const 0) (local.get 0x21e))
    (i64.store offset=0x21f align=1 (i32.const 0) (local.get 0x21f))
    (i64.store offset=0x220 align=1 (i32.const 0) (local.get 0x220))
    (i64.store offset=0x221 align=1 (i32.const 0) (local.get 0x221))
    (i64.store offset=0x222 align=1 (i32.const 0) (local.get 0x222))
    (i64.store offset=0x223 align=1 (i32.const 0) (local.get 0x223))
    (i64.store offset=0x224 align=1 (i32.const 0) (local.get 0x224))
    (i64.store offset=0x225 align=1 (i32.const 0) (local.get 0x225))
    (i64.store offset=0x226 align=1 (i32.const 0) (local.get 0x226))
    (i64.store offset=0x227 align=1 (i32.const 0) (local.get 0x227))
    (i64.store offset=0x228 align=1 (i32.const 0) (local.get 0x228))
    (i64.store offset=0x229 align=1 (i32.const 0) (local.get 0x229))
    (i64.store offset=0x22a align=1 (i32.const 0) (local.get 0x22a))
    (i64.store offset=0x22b align=1 (i32.const 0) (local.get 0x22b))
    (i64.store offset=0x22c align=1 (i32.const 0) (local.get 0x22c))
    (i64.store offset=0x22d align=1 (i32.const 0) (local.get 0x22d))
    (i64.store offset=0x22e align=1 (i32.const 0) (local.get 0x22e))
    (i64.store offset=0x22f align=1 (i32.const 0) (local.get 0x22f))
    (i64.store offset=0x230 align=1 (i32.const 0) (local.get 0x230))
    (i64.store offset=0x231 align=1 (i32.const 0) (local.get 0x231))
    (i64.store offset=0x232 align=1 (i32.const 0) (local.get 0x232))
    (i64.store offset=0x233 align=1 (i32.const 0) (local.get 0x233))
    (i64.store offset=0x234 align=1 (i32.const 0) (local.get 0x234))
    (i64.store offset=0x235 align=1 (i32.const 0) (local.get 0x235))
    (i64.store offset=0x236 align=1 (i32.const 0) (local.get 0x236))
    (i64.store offset=0x237 align=1 (i32.const 0) (local.get 0x237))
    (i64.store offset=0x238 align=1 (i32.const 0) (local.get 0x238))
    (i64.store offset=0x239 align=1 (i32.const 0) (local.get 0x239))
    (i64.store offset=0x23a align=1 (i32.const 0) (local.get 0x23a))
    (i64.store offset=0x23b align=1 (i32.const 0) (local.get 0x23b))
    (i64.store offset=0x23c align=1 (i32.const 0) (local.get 0x23c))
    (i64.store offset=0x23d align=1 (i32.const 0) (local.get 0x23d))
    (i64.store offset=0x23e align=1 (i32.const 0) (local.get 0x23e))
    (i64.store offset=0x23f align=1 (i32.const 0) (local.get 0x23f))
    (i64.store offset=0x240 align=1 (i32.const 0) (local.get 0x240))
    (i64.store offset=0x241 align=1 (i32.const 0) (local.get 0x241))
    (i64.store offset=0x242 align=1 (i32.const 0) (local.get 0x242))
    (i64.store offset=0x243 align=1 (i32.const 0) (local.get 0x243))
    (i64.store offset=0x244 align=1 (i32.const 0) (local.get 0x244))
    (i64.store offset=0x245 align=1 (i32.const 0) (local.get 0x245))
    (i64.store offset=0x246 align=1 (i32.const 0) (local.get 0x246))
    (i64.store offset=0x247 align=1 (i32.const 0) (local.get 0x247))
    (i64.store offset=0x248 align=1 (i32.const 0) (local.get 0x248))
    (i64.store offset=0x249 align=1 (i32.const 0) (local.get 0x249))
    (i64.store offset=0x24a align=1 (i32.const 0) (local.get 0x24a))
    (i64.store offset=0x24b align=1 (i32.const 0) (local.get 0x24b))
    (i64.store offset=0x24c align=1 (i32.const 0) (local.get 0x24c))
    (i64.store offset=0x24d align=1 (i32.const 0) (local.get 0x24d))
    (i64.store offset=0x24e align=1 (i32.const 0) (local.get 0x24e))
    (i64.store offset=0x24f align=1 (i32.const 0) (local.get 0x24f))
    (i64.store offset=0x250 align=1 (i32.const 0) (local.get 0x250))
    (i64.store offset=0x251 align=1 (i32.const 0) (local.get 0x251))
    (i64.store offset=0x252 align=1 (i32.const 0) (local.get 0x252))
    (i64.store offset=0x253 align=1 (i32.const 0) (local.get 0x253))
    (i64.store offset=0x254 align=1 (i32.const 0) (local.get 0x254))
    (i64.store offset=0x255 align=1 (i32.const 0) (local.get 0x255))
    (i64.store offset=0x256 align=1 (i32.const 0) (local.get 0x256))
    (i64.store offset=0x257 align=1 (i32.const 0) (local.get 0x257))
    (i64.store offset=0x258 align=1 (i32.const 0) (local.get 0x258))
    (i64.store offset=0x259 align=1 (i32.const 0) (local.get 0x259))
    (i64.store offset=0x25a align=1 (i32.const 0) (local.get 0x25a))
    (i64.store offset=0x25b align=1 (i32.const 0) (local.get 0x25b))
    (i64.store offset=0x25c align=1 (i32.const 0) (local.get 0x25c))
    (i64.store offset=0x25d align=1 (i32.const 0) (local.get 0x25d))
    (i64.store offset=0x25e align=1 (i32.const 0) (local.get 0x25e))
    (i64.store offset=0x25f align=1 (i32.const 0) (local.get 0x25f))
    (i64.store offset=0x260 align=1 (i32.const 0) (local.get 0x260))
    (i64.store offset=0x261 align=1 (i32.const 0) (local.get 0x261))
    (i64.store offset=0x262 align=1 (i32.const 0) (local.get 0x262))
    (i64.store offset=0x263 align=1 (i32.const 0) (local.get 0x263))
    (i64.store offset=0x264 align=1 (i32.const 0) (local.get 0x264))
    (i64.store offset=0x265 align=1 (i32.const 0) (local.get 0x265))
    (i64.store offset=0x266 align=1 (i32.const 0) (local.get 0x266))
    (i64.store offset=0x267 align=1 (i32.const 0) (local.get 0x267))
    (i64.store offset=0x268 align=1 (i32.const 0) (local.get 0x268))
    (i64.store offset=0x269 align=1 (i32.const 0) (local.get 0x269))
    (i64.store offset=0x26a align=1 (i32.const 0) (local.get 0x26a))
    (i64.store offset=0x26b align=1 (i32.const 0) (local.get 0x26b))
    (i64.store offset=0x26c align=1 (i32.const 0) (local.get 0x26c))
    (i64.store offset=0x26d align=1 (i32.const 0) (local.get 0x26d))
    (i64.store offset=0x26e align=1 (i32.const 0) (local.get 0x26e))
    (i64.store offset=0x26f align=1 (i32.const 0) (local.get 0x26f))
    (i64.store offset=0x270 align=1 (i32.const 0) (local.get 0x270))
    (i64.store offset=0x271 align=1 (i32.const 0) (local.get 0x271))
    (i64.store offset=0x272 align=1 (i32.const 0) (local.get 0x272))
    (i64.store offset=0x273 align=1 (i32.const 0) (local.get 0x273))
    (i64.store offset=0x274 align=1 (i32.const 0) (local.get 0x274))
    (i64.store offset=0x275 align=1 (i32.const 0) (local.get 0x275))
    (i64.store offset=0x276 align=1 (i32.const 0) (local.get 0x276))
    (i64.store offset=0x277 align=1 (i32.const 0) (local.get 0x277))
    (i64.store offset=0x278 align=1 (i32.const 0) (local.get 0x278))
    (i64.store offset=0x279 align=1 (i32.const 0) (local.get 0x279))
    (i64.store offset=0x27a align=1 (i32.const 0) (local.get 0x27a))
    (i64.store offset=0x27b align=1 (i32.const 0) (local.get 0x27b))
    (i64.store offset=0x27c align=1 (i32.const 0) (local.get 0x27c))
    (i64.store offset=0x27d align=1 (i32.const 0) (local.get 0x27d))
    (i64.store offset=0x27e align=1 (i32.const 0) (local.get 0x27e))
    (i64.store offset=0x27f align=1 (i32.const 0) (local.get 0x27f))
    (i64.store offset=0x280 align=1 (i32.const 0) (local.get 0x280))
    (i64.store offset=0x281 align=1 (i32.const 0) (local.get 0x281))
    (i64.store offset=0x282 align=1 (i32.const 0) (local.get 0x282))
    (i64.store offset=0x283 align=1 (i32.const 0) (local.get 0x283))
    (i64.store offset=0x284 align=1 (i32.const 0) (local.get 0x284))
    (i64.store offset=0x285 align=1 (i32.const 0) (local.get 0x285))
    (i64.store offset=0x286 align=1 (i32.const 0) (local.get 0x286))
    (i64.store offset=0x287 align=1 (i32.const 0) (local.get 0x287))
    (i64.store offset=0x288 align=1 (i32.const 0) (local.get 0x288))
    (i64.store offset=0x289 align=1 (i32.const 0) (local.get 0x289))
    (i64.store offset=0x28a align=1 (i32.const 0) (local.get 0x28a))
    (i64.store offset=0x28b align=1 (i32.const 0) (local.get 0x28b))
    (i64.store offset=0x28c align=1 (i32.const 0) (local.get 0x28c))
    (i64.store offset=0x28d align=1 (i32.const 0) (local.get 0x28d))
    (i64.store offset=0x28e align=1 (i32.const 0) (local.get 0x28e))
    (i64.store offset=0x28f align=1 (i32.const 0) (local.get 0x28f))
    (i64.store offset=0x290 align=1 (i32.const 0) (local.get 0x290))
    (i64.store offset=0x291 align=1 (i32.const 0) (local.get 0x291))
    (i64.store offset=0x292 align=1 (i32.const 0) (local.get 0x292))
    (i64.store offset=0x293 align=1 (i32.const 0) (local.get 0x293))
    (i64.store offset=0x294 align=1 (i32.const 0) (local.get 0x294))
    (i64.store offset=0x295 align=1 (i32.const 0) (local.get 0x295))
    (i64.store offset=0x296 align=1 (i32.const 0) (local.get 0x296))
    (i64.store offset=0x297 align=1 (i32.const 0) (local.get 0x297))
    (i64.store offset=0x298 align=1 (i32.const 0) (local.get 0x298))
    (i64.store offset=0x299 align=1 (i32.const 0) (local.get 0x299))
    (i64.store offset=0x29a align=1 (i32.const 0) (local.get 0x29a))
    (i64.store offset=0x29b align=1 (i32.const 0) (local.get 0x29b))
    (i64.store offset=0x29c align=1 (i32.const 0) (local.get 0x29c))
    (i64.store offset=0x29d align=1 (i32.const 0) (local.get 0x29d))
    (i64.store offset=0x29e align=1 (i32.const 0) (local.get 0x29e))
    (i64.store offset=0x29f align=1 (i32.const 0) (local.get 0x29f))
    (i64.store offset=0x2a0 align=1 (i32.const 0) (local.get 0x2a0))
    (i64.store offset=0x2a1 align=1 (i32.const 0) (local.get 0x2a1))
    (i64.store offset=0x2a2 align=1 (i32.const 0) (local.get 0x2a2))
    (i64.store offset=0x2a3 align=1 (i32.const 0) (local.get 0x2a3))
    (i64.store offset=0x2a4 align=1 (i32.const 0) (local.get 0x2a4))
    (i64.store offset=0x2a5 align=1 (i32.const 0) (local.get 0x2a5))
    (i64.store offset=0x2a6 align=1 (i32.const 0) (local.get 0x2a6))
    (i64.store offset=0x2a7 align=1 (i32.const 0) (local.get 0x2a7))
    (i64.store offset=0x2a8 align=1 (i32.const 0) (local.get 0x2a8))
    (i64.store offset=0x2a9 align=1 (i32.const 0) (local.get 0x2a9))
    (i64.store offset=0x2aa align=1 (i32.const 0) (local.get 0x2aa))
    (i64.store offset=0x2ab align=1 (i32.const 0) (local.get 0x2ab))
    (i64.store offset=0x2ac align=1 (i32.const 0) (local.get 0x2ac))
    (i64.store offset=0x2ad align=1 (i32.const 0) (local.get 0x2ad))
    (i64.store offset=0x2ae align=1 (i32.const 0) (local.get 0x2ae))
    (i64.store offset=0x2af align=1 (i32.const 0) (local.get 0x2af))
    (i64.store offset=0x2b0 align=1 (i32.const 0) (local.get 0x2b0))
    (i64.store offset=0x2b1 align=1 (i32.const 0) (local.get 0x2b1))
    (i64.store offset=0x2b2 align=1 (i32.const 0) (local.get 0x2b2))
    (i64.store offset=0x2b3 align=1 (i32.const 0) (local.get 0x2b3))
    (i64.store offset=0x2b4 align=1 (i32.const 0) (local.get 0x2b4))
    (i64.store offset=0x2b5 align=1 (i32.const 0) (local.get 0x2b5))
    (i64.store offset=0x2b6 align=1 (i32.const 0) (local.get 0x2b6))
    (i64.store offset=0x2b7 align=1 (i32.const 0) (local.get 0x2b7))
    (i64.store offset=0x2b8 align=1 (i32.const 0) (local.get 0x2b8))
    (i64.store offset=0x2b9 align=1 (i32.const 0) (local.get 0x2b9))
    (i64.store offset=0x2ba align=1 (i32.const 0) (local.get 0x2ba))
    (i64.store offset=0x2bb align=1 (i32.const 0) (local.get 0x2bb))
    (i64.store offset=0x2bc align=1 (i32.const 0) (local.get 0x2bc))
    (i64.store offset=0x2bd align=1 (i32.const 0) (local.get 0x2bd))
    (i64.store offset=0x2be align=1 (i32.const 0) (local.get 0x2be))
    (i64.store offset=0x2bf align=1 (i32.const 0) (local.get 0x2bf))
    (i64.store offset=0x2c0 align=1 (i32.const 0) (local.get 0x2c0))
    (i64.store offset=0x2c1 align=1 (i32.const 0) (local.get 0x2c1))
    (i64.store offset=0x2c2 align=1 (i32.const 0) (local.get 0x2c2))
    (i64.store offset=0x2c3 align=1 (i32.const 0) (local.get 0x2c3))
    (i64.store offset=0x2c4 align=1 (i32.const 0) (local.get 0x2c4))
    (i64.store offset=0x2c5 align=1 (i32.const 0) (local.get 0x2c5))
    (i64.store offset=0x2c6 align=1 (i32.const 0) (local.get 0x2c6))
    (i64.store offset=0x2c7 align=1 (i32.const 0) (local.get 0x2c7))
    (i64.store offset=0x2c8 align=1 (i32.const 0) (local.get 0x2c8))
    (i64.store offset=0x2c9 align=1 (i32.const 0) (local.get 0x2c9))
    (i64.store offset=0x2ca align=1 (i32.const 0) (local.get 0x2ca))
    (i64.store offset=0x2cb align=1 (i32.const 0) (local.get 0x2cb))
    (i64.store offset=0x2cc align=1 (i32.const 0) (local.get 0x2cc))
    (i64.store offset=0x2cd align=1 (i32.const 0) (local.get 0x2cd))
    (i64.store offset=0x2ce align=1 (i32.const 0) (local.get 0x2ce))
    (i64.store offset=0x2cf align=1 (i32.const 0) (local.get 0x2cf))
    (i64.store offset=0x2d0 align=1 (i32.const 0) (local.get 0x2d0))
    (i64.store offset=0x2d1 align=1 (i32.const 0) (local.get 0x2d1))
    (i64.store offset=0x2d2 align=1 (i32.const 0) (local.get 0x2d2))
    (i64.store offset=0x2d3 align=1 (i32.const 0) (local.get 0x2d3))
    (i64.store offset=0x2d4 align=1 (i32.const 0) (local.get 0x2d4))
    (i64.store offset=0x2d5 align=1 (i32.const 0) (local.get 0x2d5))
    (i64.store offset=0x2d6 align=1 (i32.const 0) (local.get 0x2d6))
    (i64.store offset=0x2d7 align=1 (i32.const 0) (local.get 0x2d7))
    (i64.store offset=0x2d8 align=1 (i32.const 0) (local.get 0x2d8))
    (i64.store offset=0x2d9 align=1 (i32.const 0) (local.get 0x2d9))
    (i64.store offset=0x2da align=1 (i32.const 0) (local.get 0x2da))
    (i64.store offset=0x2db align=1 (i32.const 0) (local.get 0x2db))
    (i64.store offset=0x2dc align=1 (i32.const 0) (local.get 0x2dc))
    (i64.store offset=0x2dd align=1 (i32.const 0) (local.get 0x2dd))
    (i64.store offset=0x2de align=1 (i32.const 0) (local.get 0x2de))
    (i64.store offset=0x2df align=1 (i32.const 0) (local.get 0x2df))
    (i64.store offset=0x2e0 align=1 (i32.const 0) (local.get 0x2e0))
    (i64.store offset=0x2e1 align=1 (i32.const 0) (local.get 0x2e1))
    (i64.store offset=0x2e2 align=1 (i32.const 0) (local.get 0x2e2))
    (i64.store offset=0x2e3 align=1 (i32.const 0) (local.get 0x2e3))
    (i64.store offset=0x2e4 align=1 (i32.const 0) (local.get 0x2e4))
    (i64.store offset=0x2e5 align=1 (i32.const 0) (local.get 0x2e5))
    (i64.store offset=0x2e6 align=1 (i32.const 0) (local.get 0x2e6))
    (i64.store offset=0x2e7 align=1 (i32.const 0) (local.get 0x2e7))
    (i64.store offset=0x2e8 align=1 (i32.const 0) (local.get 0x2e8))
    (i64.store offset=0x2e9 align=1 (i32.const 0) (local.get 0x2e9))
    (i64.store offset=0x2ea align=1 (i32.const 0) (local.get 0x2ea))
    (i64.store offset=0x2eb align=1 (i32.const 0) (local.get 0x2eb))
    (i64.store offset=0x2ec align=1 (i32.const 0) (local.get 0x2ec))
    (i64.store offset=0x2ed align=1 (i32.const 0) (local.get 0x2ed))
    (i64.store offset=0x2ee align=1 (i32.const 0) (local.get 0x2ee))
    (i64.store offset=0x2ef align=1 (i32.const 0) (local.get 0x2ef))
    (i64.store offset=0x2f0 align=1 (i32.const 0) (local.get 0x2f0))
    (i64.store offset=0x2f1 align=1 (i32.const 0) (local.get 0x2f1))
    (i64.store offset=0x2f2 align=1 (i32.const 0) (local.get 0x2f2))
    (i64.store offset=0x2f3 align=1 (i32.const 0) (local.get 0x2f3))
    (i64.store offset=0x2f4 align=1 (i32.const 0) (local.get 0x2f4))
    (i64.store offset=0x2f5 align=1 (i32.const 0) (local.get 0x2f5))
    (i64.store offset=0x2f6 align=1 (i32.const 0) (local.get 0x2f6))
    (i64.store offset=0x2f7 align=1 (i32.const 0) (local.get 0x2f7))
    (i64.store offset=0x2f8 align=1 (i32.const 0) (local.get 0x2f8))
    (i64.store offset=0x2f9 align=1 (i32.const 0) (local.get 0x2f9))
    (i64.store offset=0x2fa align=1 (i32.const 0) (local.get 0x2fa))
    (i64.store offset=0x2fb align=1 (i32.const 0) (local.get 0x2fb))
    (i64.store offset=0x2fc align=1 (i32.const 0) (local.get 0x2fc))
    (i64.store offset=0x2fd align=1 (i32.const 0) (local.get 0x2fd))
    (i64.store offset=0x2fe align=1 (i32.const 0) (local.get 0x2fe))
    (i64.store offset=0x2ff align=1 (i32.const 0) (local.get 0x2ff))
    (i64.store offset=0x300 align=1 (i32.const 0) (local.get 0x300))
    (i64.store offset=0x301 align=1 (i32.const 0) (local.get 0x301))
    (i64.store offset=0x302 align=1 (i32.const 0) (local.get 0x302))
    (i64.store offset=0x303 align=1 (i32.const 0) (local.get 0x303))
    (i64.store offset=0x304 align=1 (i32.const 0) (local.get 0x304))
    (i64.store offset=0x305 align=1 (i32.const 0) (local.get 0x305))
    (i64.store offset=0x306 align=1 (i32.const 0) (local.get 0x306))
    (i64.store offset=0x307 align=1 (i32.const 0) (local.get 0x307))
    (i64.store offset=0x308 align=1 (i32.const 0) (local.get 0x308))
    (i64.store offset=0x309 align=1 (i32.const 0) (local.get 0x309))
    (i64.store offset=0x30a align=1 (i32.const 0) (local.get 0x30a))
    (i64.store offset=0x30b align=1 (i32.const 0) (local.get 0x30b))
    (i64.store offset=0x30c align=1 (i32.const 0) (local.get 0x30c))
    (i64.store offset=0x30d align=1 (i32.const 0) (local.get 0x30d))
    (i64.store offset=0x30e align=1 (i32.const 0) (local.get 0x30e))
    (i64.store offset=0x30f align=1 (i32.const 0) (local.get 0x30f))
    (i64.store offset=0x310 align=1 (i32.const 0) (local.get 0x310))
    (i64.store offset=0x311 align=1 (i32.const 0) (local.get 0x311))
    (i64.store offset=0x312 align=1 (i32.const 0) (local.get 0x312))
    (i64.store offset=0x313 align=1 (i32.const 0) (local.get 0x313))
    (i64.store offset=0x314 align=1 (i32.const 0) (local.get 0x314))
    (i64.store offset=0x315 align=1 (i32.const 0) (local.get 0x315))
    (i64.store offset=0x316 align=1 (i32.const 0) (local.get 0x316))
    (i64.store offset=0x317 align=1 (i32.const 0) (local.get 0x317))
    (i64.store offset=0x318 align=1 (i32.const 0) (local.get 0x318))
    (i64.store offset=0x319 align=1 (i32.const 0) (local.get 0x319))
    (i64.store offset=0x31a align=1 (i32.const 0) (local.get 0x31a))
    (i64.store offset=0x31b align=1 (i32.const 0) (local.get 0x31b))
    (i64.store offset=0x31c align=1 (i32.const 0) (local.get 0x31c))
    (i64.store offset=0x31d align=1 (i32.const 0) (local.get 0x31d))
    (i64.store offset=0x31e align=1 (i32.const 0) (local.get 0x31e))
    (i64.store offset=0x31f align=1 (i32.const 0) (local.get 0x31f))
    (i64.store offset=0x320 align=1 (i32.const 0) (local.get 0x320))
    (i64.store offset=0x321 align=1 (i32.const 0) (local.get 0x321))
    (i64.store offset=0x322 align=1 (i32.const 0) (local.get 0x322))
    (i64.store offset=0x323 align=1 (i32.const 0) (local.get 0x323))
    (i64.store offset=0x324 align=1 (i32.const 0) (local.get 0x324))
    (i64.store offset=0x325 align=1 (i32.const 0) (local.get 0x325))
    (i64.store offset=0x326 align=1 (i32.const 0) (local.get 0x326))
    (i64.store offset=0x327 align=1 (i32.const 0) (local.get 0x327))
    (i64.store offset=0x328 align=1 (i32.const 0) (local.get 0x328))
    (i64.store offset=0x329 align=1 (i32.const 0) (local.get 0x329))
    (i64.store offset=0x32a align=1 (i32.const 0) (local.get 0x32a))
    (i64.store offset=0x32b align=1 (i32.const 0) (local.get 0x32b))
    (i64.store offset=0x32c align=1 (i32.const 0) (local.get 0x32c))
    (i64.store offset=0x32d align=1 (i32.const 0) (local.get 0x32d))
    (i64.store offset=0x32e align=1 (i32.const 0) (local.get 0x32e))
    (i64.store offset=0x32f align=1 (i32.const 0) (local.get 0x32f))
    (i64.store offset=0x330 align=1 (i32.const 0) (local.get 0x330))
    (i64.store offset=0x331 align=1 (i32.const 0) (local.get 0x331))
    (i64.store offset=0x332 align=1 (i32.const 0) (local.get 0x332))
    (i64.store offset=0x333 align=1 (i32.const 0) (local.get 0x333))
    (i64.store offset=0x334 align=1 (i32.const 0) (local.get 0x334))
    (i64.store offset=0x335 align=1 (i32.const 0) (local.get 0x335))
    (i64.store offset=0x336 align=1 (i32.const 0) (local.get 0x336))
    (i64.store offset=0x337 align=1 (i32.const 0) (local.get 0x337))
    (i64.store offset=0x338 align=1 (i32.const 0) (local.get 0x338))
    (i64.store offset=0x339 align=1 (i32.const 0) (local.get 0x339))
    (i64.store offset=0x33a align=1 (i32.const 0) (local.get 0x33a))
    (i64.store offset=0x33b align=1 (i32.const 0) (local.get 0x33b))
    (i64.store offset=0x33c align=1 (i32.const 0) (local.get 0x33c))
    (i64.store offset=0x33d align=1 (i32.const 0) (local.get 0x33d))
    (i64.store offset=0x33e align=1 (i32.const 0) (local.get 0x33e))
    (i64.store offset=0x33f align=1 (i32.const 0) (local.get 0x33f))
    (i64.store offset=0x340 align=1 (i32.const 0) (local.get 0x340))
    (i64.store offset=0x341 align=1 (i32.const 0) (local.get 0x341))
    (i64.store offset=0x342 align=1 (i32.const 0) (local.get 0x342))
    (i64.store offset=0x343 align=1 (i32.const 0) (local.get 0x343))
    (i64.store offset=0x344 align=1 (i32.const 0) (local.get 0x344))
    (i64.store offset=0x345 align=1 (i32.const 0) (local.get 0x345))
    (i64.store offset=0x346 align=1 (i32.const 0) (local.get 0x346))
    (i64.store offset=0x347 align=1 (i32.const 0) (local.get 0x347))
    (i64.store offset=0x348 align=1 (i32.const 0) (local.get 0x348))
    (i64.store offset=0x349 align=1 (i32.const 0) (local.get 0x349))
    (i64.store offset=0x34a align=1 (i32.const 0) (local.get 0x34a))
    (i64.store offset=0x34b align=1 (i32.const 0) (local.get 0x34b))
    (i64.store offset=0x34c align=1 (i32.const 0) (local.get 0x34c))
    (i64.store offset=0x34d align=1 (i32.const 0) (local.get 0x34d))
    (i64.store offset=0x34e align=1 (i32.const 0) (local.get 0x34e))
    (i64.store offset=0x34f align=1 (i32.const 0) (local.get 0x34f))
    (i64.store offset=0x350 align=1 (i32.const 0) (local.get 0x350))
    (i64.store offset=0x351 align=1 (i32.const 0) (local.get 0x351))
    (i64.store offset=0x352 align=1 (i32.const 0) (local.get 0x352))
    (i64.store offset=0x353 align=1 (i32.const 0) (local.get 0x353))
    (i64.store offset=0x354 align=1 (i32.const 0) (local.get 0x354))
    (i64.store offset=0x355 align=1 (i32.const 0) (local.get 0x355))
    (i64.store offset=0x356 align=1 (i32.const 0) (local.get 0x356))
    (i64.store offset=0x357 align=1 (i32.const 0) (local.get 0x357))
    (i64.store offset=0x358 align=1 (i32.const 0) (local.get 0x358))
    (i64.store offset=0x359 align=1 (i32.const 0) (local.get 0x359))
    (i64.store offset=0x35a align=1 (i32.const 0) (local.get 0x35a))
    (i64.store offset=0x35b align=1 (i32.const 0) (local.get 0x35b))
    (i64.store offset=0x35c align=1 (i32.const 0) (local.get 0x35c))
    (i64.store offset=0x35d align=1 (i32.const 0) (local.get 0x35d))
    (i64.store offset=0x35e align=1 (i32.const 0) (local.get 0x35e))
    (i64.store offset=0x35f align=1 (i32.const 0) (local.get 0x35f))
    (i64.store offset=0x360 align=1 (i32.const 0) (local.get 0x360))
    (i64.store offset=0x361 align=1 (i32.const 0) (local.get 0x361))
    (i64.store offset=0x362 align=1 (i32.const 0) (local.get 0x362))
    (i64.store offset=0x363 align=1 (i32.const 0) (local.get 0x363))
    (i64.store offset=0x364 align=1 (i32.const 0) (local.get 0x364))
    (i64.store offset=0x365 align=1 (i32.const 0) (local.get 0x365))
    (i64.store offset=0x366 align=1 (i32.const 0) (local.get 0x366))
    (i64.store offset=0x367 align=1 (i32.const 0) (local.get 0x367))
    (i64.store offset=0x368 align=1 (i32.const 0) (local.get 0x368))
    (i64.store offset=0x369 align=1 (i32.const 0) (local.get 0x369))
    (i64.store offset=0x36a align=1 (i32.const 0) (local.get 0x36a))
    (i64.store offset=0x36b align=1 (i32.const 0) (local.get 0x36b))
    (i64.store offset=0x36c align=1 (i32.const 0) (local.get 0x36c))
    (i64.store offset=0x36d align=1 (i32.const 0) (local.get 0x36d))
    (i64.store offset=0x36e align=1 (i32.const 0) (local.get 0x36e))
    (i64.store offset=0x36f align=1 (i32.const 0) (local.get 0x36f))
    (i64.store offset=0x370 align=1 (i32.const 0) (local.get 0x370))
    (i64.store offset=0x371 align=1 (i32.const 0) (local.get 0x371))
    (i64.store offset=0x372 align=1 (i32.const 0) (local.get 0x372))
    (i64.store offset=0x373 align=1 (i32.const 0) (local.get 0x373))
    (i64.store offset=0x374 align=1 (i32.const 0) (local.get 0x374))
    (i64.store offset=0x375 align=1 (i32.const 0) (local.get 0x375))
    (i64.store offset=0x376 align=1 (i32.const 0) (local.get 0x376))
    (i64.store offset=0x377 align=1 (i32.const 0) (local.get 0x377))
    (i64.store offset=0x378 align=1 (i32.const 0) (local.get 0x378))
    (i64.store offset=0x379 align=1 (i32.const 0) (local.get 0x379))
    (i64.store offset=0x37a align=1 (i32.const 0) (local.get 0x37a))
    (i64.store offset=0x37b align=1 (i32.const 0) (local.get 0x37b))
    (i64.store offset=0x37c align=1 (i32.const 0) (local.get 0x37c))
    (i64.store offset=0x37d align=1 (i32.const 0) (local.get 0x37d))
    (i64.store offset=0x37e align=1 (i32.const 0) (local.get 0x37e))
    (i64.store offset=0x37f align=1 (i32.const 0) (local.get 0x37f))
    (i64.store offset=0x380 align=1 (i32.const 0) (local.get 0x380))
    (i64.store offset=0x381 align=1 (i32.const 0) (local.get 0x381))
    (i64.store offset=0x382 align=1 (i32.const 0) (local.get 0x382))
    (i64.store offset=0x383 align=1 (i32.const 0) (local.get 0x383))
    (i64.store offset=0x384 align=1 (i32.const 0) (local.get 0x384))
    (i64.store offset=0x385 align=1 (i32.const 0) (local.get 0x385))
    (i64.store offset=0x386 align=1 (i32.const 0) (local.get 0x386))
    (i64.store offset=0x387 align=1 (i32.const 0) (local.get 0x387))
    (i64.store offset=0x388 align=1 (i32.const 0) (local.get 0x388))
    (i64.store offset=0x389 align=1 (i32.const 0) (local.get 0x389))
    (i64.store offset=0x38a align=1 (i32.const 0) (local.get 0x38a))
    (i64.store offset=0x38b align=1 (i32.const 0) (local.get 0x38b))
    (i64.store offset=0x38c align=1 (i32.const 0) (local.get 0x38c))
    (i64.store offset=0x38d align=1 (i32.const 0) (local.get 0x38d))
    (i64.store offset=0x38e align=1 (i32.const 0) (local.get 0x38e))
    (i64.store offset=0x38f align=1 (i32.const 0) (local.get 0x38f))
    (i64.store offset=0x390 align=1 (i32.const 0) (local.get 0x390))
    (i64.store offset=0x391 align=1 (i32.const 0) (local.get 0x391))
    (i64.store offset=0x392 align=1 (i32.const 0) (local.get 0x392))
    (i64.store offset=0x393 align=1 (i32.const 0) (local.get 0x393))
    (i64.store offset=0x394 align=1 (i32.const 0) (local.get 0x394))
    (i64.store offset=0x395 align=1 (i32.const 0) (local.get 0x395))
    (i64.store offset=0x396 align=1 (i32.const 0) (local.get 0x396))
    (i64.store offset=0x397 align=1 (i32.const 0) (local.get 0x397))
    (i64.store offset=0x398 align=1 (i32.const 0) (local.get 0x398))
    (i64.store offset=0x399 align=1 (i32.const 0) (local.get 0x399))
    (i64.store offset=0x39a align=1 (i32.const 0) (local.get 0x39a))
    (i64.store offset=0x39b align=1 (i32.const 0) (local.get 0x39b))
    (i64.store offset=0x39c align=1 (i32.const 0) (local.get 0x39c))
    (i64.store offset=0x39d align=1 (i32.const 0) (local.get 0x39d))
    (i64.store offset=0x39e align=1 (i32.const 0) (local.get 0x39e))
    (i64.store offset=0x39f align=1 (i32.const 0) (local.get 0x39f))
    (i64.store offset=0x3a0 align=1 (i32.const 0) (local.get 0x3a0))
    (i64.store offset=0x3a1 align=1 (i32.const 0) (local.get 0x3a1))
    (i64.store offset=0x3a2 align=1 (i32.const 0) (local.get 0x3a2))
    (i64.store offset=0x3a3 align=1 (i32.const 0) (local.get 0x3a3))
    (i64.store offset=0x3a4 align=1 (i32.const 0) (local.get 0x3a4))
    (i64.store offset=0x3a5 align=1 (i32.const 0) (local.get 0x3a5))
    (i64.store offset=0x3a6 align=1 (i32.const 0) (local.get 0x3a6))
    (i64.store offset=0x3a7 align=1 (i32.const 0) (local.get 0x3a7))
    (i64.store offset=0x3a8 align=1 (i32.const 0) (local.get 0x3a8))
    (i64.store offset=0x3a9 align=1 (i32.const 0) (local.get 0x3a9))
    (i64.store offset=0x3aa align=1 (i32.const 0) (local.get 0x3aa))
    (i64.store offset=0x3ab align=1 (i32.const 0) (local.get 0x3ab))
    (i64.store offset=0x3ac align=1 (i32.const 0) (local.get 0x3ac))
    (i64.store offset=0x3ad align=1 (i32.const 0) (local.get 0x3ad))
    (i64.store offset=0x3ae align=1 (i32.const 0) (local.get 0x3ae))
    (i64.store offset=0x3af align=1 (i32.const 0) (local.get 0x3af))
    (i64.store offset=0x3b0 align=1 (i32.const 0) (local.get 0x3b0))
    (i64.store offset=0x3b1 align=1 (i32.const 0) (local.get 0x3b1))
    (i64.store offset=0x3b2 align=1 (i32.const 0) (local.get 0x3b2))
    (i64.store offset=0x3b3 align=1 (i32.const 0) (local.get 0x3b3))
    (i64.store offset=0x3b4 align=1 (i32.const 0) (local.get 0x3b4))
    (i64.store offset=0x3b5 align=1 (i32.const 0) (local.get 0x3b5))
    (i64.store offset=0x3b6 align=1 (i32.const 0) (local.get 0x3b6))
    (i64.store offset=0x3b7 align=1 (i32.const 0) (local.get 0x3b7))
    (i64.store offset=0x3b8 align=1 (i32.const 0) (local.get 0x3b8))
    (i64.store offset=0x3b9 align=1 (i32.const 0) (local.get 0x3b9))
    (i64.store offset=0x3ba align=1 (i32.const 0) (local.get 0x3ba))
    (i64.store offset=0x3bb align=1 (i32.const 0) (local.get 0x3bb))
    (i64.store offset=0x3bc align=1 (i32.const 0) (local.get 0x3bc))
    (i64.store offset=0x3bd align=1 (i32.const 0) (local.get 0x3bd))
    (i64.store offset=0x3be align=1 (i32.const 0) (local.get 0x3be))
    (i64.store offset=0x3bf align=1 (i32.const 0) (local.get 0x3bf))
    (i64.store offset=0x3c0 align=1 (i32.const 0) (local.get 0x3c0))
    (i64.store offset=0x3c1 align=1 (i32.const 0) (local.get 0x3c1))
    (i64.store offset=0x3c2 align=1 (i32.const 0) (local.get 0x3c2))
    (i64.store offset=0x3c3 align=1 (i32.const 0) (local.get 0x3c3))
    (i64.store offset=0x3c4 align=1 (i32.const 0) (local.get 0x3c4))
    (i64.store offset=0x3c5 align=1 (i32.const 0) (local.get 0x3c5))
    (i64.store offset=0x3c6 align=1 (i32.const 0) (local.get 0x3c6))
    (i64.store offset=0x3c7 align=1 (i32.const 0) (local.get 0x3c7))
    (i64.store offset=0x3c8 align=1 (i32.const 0) (local.get 0x3c8))
    (i64.store offset=0x3c9 align=1 (i32.const 0) (local.get 0x3c9))
    (i64.store offset=0x3ca align=1 (i32.const 0) (local.get 0x3ca))
    (i64.store offset=0x3cb align=1 (i32.const 0) (local.get 0x3cb))
    (i64.store offset=0x3cc align=1 (i32.const 0) (local.get 0x3cc))
    (i64.store offset=0x3cd align=1 (i32.const 0) (local.get 0x3cd))
    (i64.store offset=0x3ce align=1 (i32.const 0) (local.get 0x3ce))
    (i64.store offset=0x3cf align=1 (i32.const 0) (local.get 0x3cf))
    (i64.store offset=0x3d0 align=1 (i32.const 0) (local.get 0x3d0))
    (i64.store offset=0x3d1 align=1 (i32.const 0) (local.get 0x3d1))
    (i64.store offset=0x3d2 align=1 (i32.const 0) (local.get 0x3d2))
    (i64.store offset=0x3d3 align=1 (i32.const 0) (local.get 0x3d3))
    (i64.store offset=0x3d4 align=1 (i32.const 0) (local.get 0x3d4))
    (i64.store offset=0x3d5 align=1 (i32.const 0) (local.get 0x3d5))
    (i64.store offset=0x3d6 align=1 (i32.const 0) (local.get 0x3d6))
    (i64.store offset=0x3d7 align=1 (i32.const 0) (local.get 0x3d7))
    (i64.store offset=0x3d8 align=1 (i32.const 0) (local.get 0x3d8))
    (i64.store offset=0x3d9 align=1 (i32.const 0) (local.get 0x3d9))
    (i64.store offset=0x3da align=1 (i32.const 0) (local.get 0x3da))
    (i64.store offset=0x3db align=1 (i32.const 0) (local.get 0x3db))
    (i64.store offset=0x3dc align=1 (i32.const 0) (local.get 0x3dc))
    (i64.store offset=0x3dd align=1 (i32.const 0) (local.get 0x3dd))
    (i64.store offset=0x3de align=1 (i32.const 0) (local.get 0x3de))
    (i64.store offset=0x3df align=1 (i32.const 0) (local.get 0x3df))
    (i64.store offset=0x3e0 align=1 (i32.const 0) (local.get 0x3e0))
    (i64.store offset=0x3e1 align=1 (i32.const 0) (local.get 0x3e1))
    (i64.store offset=0x3e2 align=1 (i32.const 0) (local.get 0x3e2))
    (i64.store offset=0x3e3 align=1 (i32.const 0) (local.get 0x3e3))
    (i64.store offset=0x3e4 align=1 (i32.const 0) (local.get 0x3e4))
    (i64.store offset=0x3e5 align=1 (i32.const 0) (local.get 0x3e5))
    (i64.store offset=0x3e6 align=1 (i32.const 0) (local.get 0x3e6))
    (i64.store offset=0x3e7 align=1 (i32.const 0) (local.get 0x3e7))
    (i64.store offset=0x3e8 align=1 (i32.const 0) (local.get 0x3e8))
    (i64.store offset=0x3e9 align=1 (i32.const 0) (local.get 0x3e9))
    (i64.store offset=0x3ea align=1 (i32.const 0) (local.get 0x3ea))
    (i64.store offset=0x3eb align=1 (i32.const 0) (local.get 0x3eb))
    (i64.store offset=0x3ec align=1 (i32.const 0) (local.get 0x3ec))
    (i64.store offset=0x3ed align=1 (i32.const 0) (local.get 0x3ed))
    (i64.store offset=0x3ee align=1 (i32.const 0) (local.get 0x3ee))
    (i64.store offset=0x3ef align=1 (i32.const 0) (local.get 0x3ef))
    (i64.store offset=0x3f0 align=1 (i32.const 0) (local.get 0x3f0))
    (i64.store offset=0x3f1 align=1 (i32.const 0) (local.get 0x3f1))
    (i64.store offset=0x3f2 align=1 (i32.const 0) (local.get 0x3f2))
    (i64.store offset=0x3f3 align=1 (i32.const 0) (local.get 0x3f3))
    (i64.store offset=0x3f4 align=1 (i32.const 0) (local.get 0x3f4))
    (i64.store offset=0x3f5 align=1 (i32.const 0) (local.get 0x3f5))
    (i64.store offset=0x3f6 align=1 (i32.const 0) (local.get 0x3f6))
    (i64.store offset=0x3f7 align=1 (i32.const 0) (local.get 0x3f7))
    (i64.store offset=0x3f8 align=1 (i32.const 0) (local.get 0x3f8))
    (i64.store offset=0x3f9 align=1 (i32.const 0) (local.get 0x3f9))
    (i64.store offset=0x3fa align=1 (i32.const 0) (local.get 0x3fa))
    (i64.store offset=0x3fb align=1 (i32.const 0) (local.get 0x3fb))
    (i64.store offset=0x3fc align=1 (i32.const 0) (local.get 0x3fc))
    (i64.store offset=0x3fd align=1 (i32.const 0) (local.get 0x3fd))
    (i64.store offset=0x3fe align=1 (i32.const 0) (local.get 0x3fe))
    (i64.store offset=0x3ff align=1 (i32.const 0) (local.get 0x3ff))
    (i64.store offset=0x400 align=1 (i32.const 0) (local.get 0x400))
    (i64.store offset=0x401 align=1 (i32.const 0) (local.get 0x401))
    (i64.store offset=0x402 align=1 (i32.const 0) (local.get 0x402))
    (i64.store offset=0x403 align=1 (i32.const 0) (local.get 0x403))
    (i64.store offset=0x404 align=1 (i32.const 0) (local.get 0x404))
    (i64.store offset=0x405 align=1 (i32.const 0) (local.get 0x405))
    (i64.store offset=0x406 align=1 (i32.const 0) (local.get 0x406))
    (i64.store offset=0x407 align=1 (i32.const 0) (local.get 0x407))
    (i64.store offset=0x408 align=1 (i32.const 0) (local.get 0x408))
    (i64.store offset=0x409 align=1 (i32.const 0) (local.get 0x409))
    (i64.store offset=0x40a align=1 (i32.const 0) (local.get 0x40a))
    (i64.store offset=0x40b align=1 (i32.const 0) (local.get 0x40b))
    (i64.store offset=0x40c align=1 (i32.const 0) (local.get 0x40c))
    (i64.store offset=0x40d align=1 (i32.const 0) (local.get 0x40d))
    (i64.store offset=0x40e align=1 (i32.const 0) (local.get 0x40e))
    (i64.store offset=0x40f align=1 (i32.const 0) (local.get 0x40f))
    (i64.store offset=0x410 align=1 (i32.const 0) (local.get 0x410))
    (i64.store offset=0x411 align=1 (i32.const 0) (local.get 0x411))
    (i64.store offset=0x412 align=1 (i32.const 0) (local.get 0x412))
    (i64.store offset=0x413 align=1 (i32.const 0) (local.get 0x413))
    (i64.store offset=0x414 align=1 (i32.const 0) (local.get 0x414))
    (i64.store offset=0x415 align=1 (i32.const 0) (local.get 0x415))
    (i64.store offset=0x416 align=1 (i32.const 0) (local.get 0x416))
    (i64.store offset=0x417 align=1 (i32.const 0) (local.get 0x417))
    (i64.store offset=0x418 align=1 (i32.const 0) (local.get 0x418))
    (i64.store offset=0x419 align=1 (i32.const 0) (local.get 0x419))
    (i64.store offset=0x41a align=1 (i32.const 0) (local.get 0x41a))
    (i64.store offset=0x41b align=1 (i32.const 0) (local.get 0x41b))
    (i64.store offset=0x41c align=1 (i32.const 0) (local.get 0x41c))
    (i64.store offset=0x41d align=1 (i32.const 0) (local.get 0x41d))
    (i64.store offset=0x41e align=1 (i32.const 0) (local.get 0x41e))
    (i64.store offset=0x41f align=1 (i32.const 0) (local.get 0x41f))
  )
)`);

// ./test/core/skip-stack-guard-page.wast:2275
assert_exhaustion(() => invoke($0, `test-guard-page-skip`, [0]), `call stack exhausted`);

// ./test/core/skip-stack-guard-page.wast:2276
assert_exhaustion(() => invoke($0, `test-guard-page-skip`, [100]), `call stack exhausted`);

// ./test/core/skip-stack-guard-page.wast:2277
assert_exhaustion(() => invoke($0, `test-guard-page-skip`, [200]), `call stack exhausted`);

// ./test/core/skip-stack-guard-page.wast:2278
assert_exhaustion(() => invoke($0, `test-guard-page-skip`, [300]), `call stack exhausted`);

// ./test/core/skip-stack-guard-page.wast:2279
assert_exhaustion(() => invoke($0, `test-guard-page-skip`, [400]), `call stack exhausted`);

// ./test/core/skip-stack-guard-page.wast:2280
assert_exhaustion(() => invoke($0, `test-guard-page-skip`, [500]), `call stack exhausted`);

// ./test/core/skip-stack-guard-page.wast:2281
assert_exhaustion(() => invoke($0, `test-guard-page-skip`, [600]), `call stack exhausted`);

// ./test/core/skip-stack-guard-page.wast:2282
assert_exhaustion(() => invoke($0, `test-guard-page-skip`, [700]), `call stack exhausted`);

// ./test/core/skip-stack-guard-page.wast:2283
assert_exhaustion(() => invoke($0, `test-guard-page-skip`, [800]), `call stack exhausted`);

// ./test/core/skip-stack-guard-page.wast:2284
assert_exhaustion(() => invoke($0, `test-guard-page-skip`, [900]), `call stack exhausted`);
