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

// ./test/core/table_copy.wast

// ./test/core/table_copy.wast:6
let $0 = instantiate(`(module
  (func (export "ef0") (result i32) (i32.const 0))
  (func (export "ef1") (result i32) (i32.const 1))
  (func (export "ef2") (result i32) (i32.const 2))
  (func (export "ef3") (result i32) (i32.const 3))
  (func (export "ef4") (result i32) (i32.const 4))
)`);

// ./test/core/table_copy.wast:13
register($0, `a`);

// ./test/core/table_copy.wast:15
let $1 = instantiate(`(module
  (type (func (result i32)))  ;; type #0
  (import "a" "ef0" (func (result i32)))    ;; index 0
  (import "a" "ef1" (func (result i32)))
  (import "a" "ef2" (func (result i32)))
  (import "a" "ef3" (func (result i32)))
  (import "a" "ef4" (func (result i32)))    ;; index 4
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (elem (table $$t1) (i32.const 3) func 1 3 1 4)
  (elem (table $$t1) (i32.const 11) func 6 3 2 5 7)
  (func (result i32) (i32.const 5))  ;; index 5
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))  ;; index 9
  (func (export "test")
    (nop))
  (func (export "check_t0") (param i32) (result i32)
    (call_indirect $$t0 (type 0) (local.get 0)))
  (func (export "check_t1") (param i32) (result i32)
    (call_indirect $$t1 (type 0) (local.get 0)))
)`);

// ./test/core/table_copy.wast:45
invoke($1, `test`, []);

// ./test/core/table_copy.wast:46
assert_trap(() => invoke($1, `check_t0`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:47
assert_trap(() => invoke($1, `check_t0`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:48
assert_return(() => invoke($1, `check_t0`, [2]), [value("i32", 3)]);

// ./test/core/table_copy.wast:49
assert_return(() => invoke($1, `check_t0`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:50
assert_return(() => invoke($1, `check_t0`, [4]), [value("i32", 4)]);

// ./test/core/table_copy.wast:51
assert_return(() => invoke($1, `check_t0`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:52
assert_trap(() => invoke($1, `check_t0`, [6]), `uninitialized element`);

// ./test/core/table_copy.wast:53
assert_trap(() => invoke($1, `check_t0`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:54
assert_trap(() => invoke($1, `check_t0`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:55
assert_trap(() => invoke($1, `check_t0`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:56
assert_trap(() => invoke($1, `check_t0`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:57
assert_trap(() => invoke($1, `check_t0`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:58
assert_return(() => invoke($1, `check_t0`, [12]), [value("i32", 7)]);

// ./test/core/table_copy.wast:59
assert_return(() => invoke($1, `check_t0`, [13]), [value("i32", 5)]);

// ./test/core/table_copy.wast:60
assert_return(() => invoke($1, `check_t0`, [14]), [value("i32", 2)]);

// ./test/core/table_copy.wast:61
assert_return(() => invoke($1, `check_t0`, [15]), [value("i32", 3)]);

// ./test/core/table_copy.wast:62
assert_return(() => invoke($1, `check_t0`, [16]), [value("i32", 6)]);

// ./test/core/table_copy.wast:63
assert_trap(() => invoke($1, `check_t0`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:64
assert_trap(() => invoke($1, `check_t0`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:65
assert_trap(() => invoke($1, `check_t0`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:66
assert_trap(() => invoke($1, `check_t0`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:67
assert_trap(() => invoke($1, `check_t0`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:68
assert_trap(() => invoke($1, `check_t0`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:69
assert_trap(() => invoke($1, `check_t0`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:70
assert_trap(() => invoke($1, `check_t0`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:71
assert_trap(() => invoke($1, `check_t0`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:72
assert_trap(() => invoke($1, `check_t0`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:73
assert_trap(() => invoke($1, `check_t0`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:74
assert_trap(() => invoke($1, `check_t0`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:75
assert_trap(() => invoke($1, `check_t0`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:76
assert_trap(() => invoke($1, `check_t1`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:77
assert_trap(() => invoke($1, `check_t1`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:78
assert_trap(() => invoke($1, `check_t1`, [2]), `uninitialized element`);

// ./test/core/table_copy.wast:79
assert_return(() => invoke($1, `check_t1`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:80
assert_return(() => invoke($1, `check_t1`, [4]), [value("i32", 3)]);

// ./test/core/table_copy.wast:81
assert_return(() => invoke($1, `check_t1`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:82
assert_return(() => invoke($1, `check_t1`, [6]), [value("i32", 4)]);

// ./test/core/table_copy.wast:83
assert_trap(() => invoke($1, `check_t1`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:84
assert_trap(() => invoke($1, `check_t1`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:85
assert_trap(() => invoke($1, `check_t1`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:86
assert_trap(() => invoke($1, `check_t1`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:87
assert_return(() => invoke($1, `check_t1`, [11]), [value("i32", 6)]);

// ./test/core/table_copy.wast:88
assert_return(() => invoke($1, `check_t1`, [12]), [value("i32", 3)]);

// ./test/core/table_copy.wast:89
assert_return(() => invoke($1, `check_t1`, [13]), [value("i32", 2)]);

// ./test/core/table_copy.wast:90
assert_return(() => invoke($1, `check_t1`, [14]), [value("i32", 5)]);

// ./test/core/table_copy.wast:91
assert_return(() => invoke($1, `check_t1`, [15]), [value("i32", 7)]);

// ./test/core/table_copy.wast:92
assert_trap(() => invoke($1, `check_t1`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:93
assert_trap(() => invoke($1, `check_t1`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:94
assert_trap(() => invoke($1, `check_t1`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:95
assert_trap(() => invoke($1, `check_t1`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:96
assert_trap(() => invoke($1, `check_t1`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:97
assert_trap(() => invoke($1, `check_t1`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:98
assert_trap(() => invoke($1, `check_t1`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:99
assert_trap(() => invoke($1, `check_t1`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:100
assert_trap(() => invoke($1, `check_t1`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:101
assert_trap(() => invoke($1, `check_t1`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:102
assert_trap(() => invoke($1, `check_t1`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:103
assert_trap(() => invoke($1, `check_t1`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:104
assert_trap(() => invoke($1, `check_t1`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:105
assert_trap(() => invoke($1, `check_t1`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:107
let $2 = instantiate(`(module
  (type (func (result i32)))  ;; type #0
  (import "a" "ef0" (func (result i32)))    ;; index 0
  (import "a" "ef1" (func (result i32)))
  (import "a" "ef2" (func (result i32)))
  (import "a" "ef3" (func (result i32)))
  (import "a" "ef4" (func (result i32)))    ;; index 4
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (elem (table $$t1) (i32.const 3) func 1 3 1 4)
  (elem (table $$t1) (i32.const 11) func 6 3 2 5 7)
  (func (result i32) (i32.const 5))  ;; index 5
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))  ;; index 9
  (func (export "test")
    (table.copy $$t0 $$t0 (i32.const 13) (i32.const 2) (i32.const 3)))
  (func (export "check_t0") (param i32) (result i32)
    (call_indirect $$t0 (type 0) (local.get 0)))
  (func (export "check_t1") (param i32) (result i32)
    (call_indirect $$t1 (type 0) (local.get 0)))
)`);

// ./test/core/table_copy.wast:137
invoke($2, `test`, []);

// ./test/core/table_copy.wast:138
assert_trap(() => invoke($2, `check_t0`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:139
assert_trap(() => invoke($2, `check_t0`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:140
assert_return(() => invoke($2, `check_t0`, [2]), [value("i32", 3)]);

// ./test/core/table_copy.wast:141
assert_return(() => invoke($2, `check_t0`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:142
assert_return(() => invoke($2, `check_t0`, [4]), [value("i32", 4)]);

// ./test/core/table_copy.wast:143
assert_return(() => invoke($2, `check_t0`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:144
assert_trap(() => invoke($2, `check_t0`, [6]), `uninitialized element`);

// ./test/core/table_copy.wast:145
assert_trap(() => invoke($2, `check_t0`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:146
assert_trap(() => invoke($2, `check_t0`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:147
assert_trap(() => invoke($2, `check_t0`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:148
assert_trap(() => invoke($2, `check_t0`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:149
assert_trap(() => invoke($2, `check_t0`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:150
assert_return(() => invoke($2, `check_t0`, [12]), [value("i32", 7)]);

// ./test/core/table_copy.wast:151
assert_return(() => invoke($2, `check_t0`, [13]), [value("i32", 3)]);

// ./test/core/table_copy.wast:152
assert_return(() => invoke($2, `check_t0`, [14]), [value("i32", 1)]);

// ./test/core/table_copy.wast:153
assert_return(() => invoke($2, `check_t0`, [15]), [value("i32", 4)]);

// ./test/core/table_copy.wast:154
assert_return(() => invoke($2, `check_t0`, [16]), [value("i32", 6)]);

// ./test/core/table_copy.wast:155
assert_trap(() => invoke($2, `check_t0`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:156
assert_trap(() => invoke($2, `check_t0`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:157
assert_trap(() => invoke($2, `check_t0`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:158
assert_trap(() => invoke($2, `check_t0`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:159
assert_trap(() => invoke($2, `check_t0`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:160
assert_trap(() => invoke($2, `check_t0`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:161
assert_trap(() => invoke($2, `check_t0`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:162
assert_trap(() => invoke($2, `check_t0`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:163
assert_trap(() => invoke($2, `check_t0`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:164
assert_trap(() => invoke($2, `check_t0`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:165
assert_trap(() => invoke($2, `check_t0`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:166
assert_trap(() => invoke($2, `check_t0`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:167
assert_trap(() => invoke($2, `check_t0`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:168
assert_trap(() => invoke($2, `check_t1`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:169
assert_trap(() => invoke($2, `check_t1`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:170
assert_trap(() => invoke($2, `check_t1`, [2]), `uninitialized element`);

// ./test/core/table_copy.wast:171
assert_return(() => invoke($2, `check_t1`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:172
assert_return(() => invoke($2, `check_t1`, [4]), [value("i32", 3)]);

// ./test/core/table_copy.wast:173
assert_return(() => invoke($2, `check_t1`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:174
assert_return(() => invoke($2, `check_t1`, [6]), [value("i32", 4)]);

// ./test/core/table_copy.wast:175
assert_trap(() => invoke($2, `check_t1`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:176
assert_trap(() => invoke($2, `check_t1`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:177
assert_trap(() => invoke($2, `check_t1`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:178
assert_trap(() => invoke($2, `check_t1`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:179
assert_return(() => invoke($2, `check_t1`, [11]), [value("i32", 6)]);

// ./test/core/table_copy.wast:180
assert_return(() => invoke($2, `check_t1`, [12]), [value("i32", 3)]);

// ./test/core/table_copy.wast:181
assert_return(() => invoke($2, `check_t1`, [13]), [value("i32", 2)]);

// ./test/core/table_copy.wast:182
assert_return(() => invoke($2, `check_t1`, [14]), [value("i32", 5)]);

// ./test/core/table_copy.wast:183
assert_return(() => invoke($2, `check_t1`, [15]), [value("i32", 7)]);

// ./test/core/table_copy.wast:184
assert_trap(() => invoke($2, `check_t1`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:185
assert_trap(() => invoke($2, `check_t1`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:186
assert_trap(() => invoke($2, `check_t1`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:187
assert_trap(() => invoke($2, `check_t1`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:188
assert_trap(() => invoke($2, `check_t1`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:189
assert_trap(() => invoke($2, `check_t1`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:190
assert_trap(() => invoke($2, `check_t1`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:191
assert_trap(() => invoke($2, `check_t1`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:192
assert_trap(() => invoke($2, `check_t1`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:193
assert_trap(() => invoke($2, `check_t1`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:194
assert_trap(() => invoke($2, `check_t1`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:195
assert_trap(() => invoke($2, `check_t1`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:196
assert_trap(() => invoke($2, `check_t1`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:197
assert_trap(() => invoke($2, `check_t1`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:199
let $3 = instantiate(`(module
  (type (func (result i32)))  ;; type #0
  (import "a" "ef0" (func (result i32)))    ;; index 0
  (import "a" "ef1" (func (result i32)))
  (import "a" "ef2" (func (result i32)))
  (import "a" "ef3" (func (result i32)))
  (import "a" "ef4" (func (result i32)))    ;; index 4
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (elem (table $$t1) (i32.const 3) func 1 3 1 4)
  (elem (table $$t1) (i32.const 11) func 6 3 2 5 7)
  (func (result i32) (i32.const 5))  ;; index 5
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))  ;; index 9
  (func (export "test")
    (table.copy $$t0 $$t0 (i32.const 25) (i32.const 15) (i32.const 2)))
  (func (export "check_t0") (param i32) (result i32)
    (call_indirect $$t0 (type 0) (local.get 0)))
  (func (export "check_t1") (param i32) (result i32)
    (call_indirect $$t1 (type 0) (local.get 0)))
)`);

// ./test/core/table_copy.wast:229
invoke($3, `test`, []);

// ./test/core/table_copy.wast:230
assert_trap(() => invoke($3, `check_t0`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:231
assert_trap(() => invoke($3, `check_t0`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:232
assert_return(() => invoke($3, `check_t0`, [2]), [value("i32", 3)]);

// ./test/core/table_copy.wast:233
assert_return(() => invoke($3, `check_t0`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:234
assert_return(() => invoke($3, `check_t0`, [4]), [value("i32", 4)]);

// ./test/core/table_copy.wast:235
assert_return(() => invoke($3, `check_t0`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:236
assert_trap(() => invoke($3, `check_t0`, [6]), `uninitialized element`);

// ./test/core/table_copy.wast:237
assert_trap(() => invoke($3, `check_t0`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:238
assert_trap(() => invoke($3, `check_t0`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:239
assert_trap(() => invoke($3, `check_t0`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:240
assert_trap(() => invoke($3, `check_t0`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:241
assert_trap(() => invoke($3, `check_t0`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:242
assert_return(() => invoke($3, `check_t0`, [12]), [value("i32", 7)]);

// ./test/core/table_copy.wast:243
assert_return(() => invoke($3, `check_t0`, [13]), [value("i32", 5)]);

// ./test/core/table_copy.wast:244
assert_return(() => invoke($3, `check_t0`, [14]), [value("i32", 2)]);

// ./test/core/table_copy.wast:245
assert_return(() => invoke($3, `check_t0`, [15]), [value("i32", 3)]);

// ./test/core/table_copy.wast:246
assert_return(() => invoke($3, `check_t0`, [16]), [value("i32", 6)]);

// ./test/core/table_copy.wast:247
assert_trap(() => invoke($3, `check_t0`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:248
assert_trap(() => invoke($3, `check_t0`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:249
assert_trap(() => invoke($3, `check_t0`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:250
assert_trap(() => invoke($3, `check_t0`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:251
assert_trap(() => invoke($3, `check_t0`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:252
assert_trap(() => invoke($3, `check_t0`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:253
assert_trap(() => invoke($3, `check_t0`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:254
assert_trap(() => invoke($3, `check_t0`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:255
assert_return(() => invoke($3, `check_t0`, [25]), [value("i32", 3)]);

// ./test/core/table_copy.wast:256
assert_return(() => invoke($3, `check_t0`, [26]), [value("i32", 6)]);

// ./test/core/table_copy.wast:257
assert_trap(() => invoke($3, `check_t0`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:258
assert_trap(() => invoke($3, `check_t0`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:259
assert_trap(() => invoke($3, `check_t0`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:260
assert_trap(() => invoke($3, `check_t1`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:261
assert_trap(() => invoke($3, `check_t1`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:262
assert_trap(() => invoke($3, `check_t1`, [2]), `uninitialized element`);

// ./test/core/table_copy.wast:263
assert_return(() => invoke($3, `check_t1`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:264
assert_return(() => invoke($3, `check_t1`, [4]), [value("i32", 3)]);

// ./test/core/table_copy.wast:265
assert_return(() => invoke($3, `check_t1`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:266
assert_return(() => invoke($3, `check_t1`, [6]), [value("i32", 4)]);

// ./test/core/table_copy.wast:267
assert_trap(() => invoke($3, `check_t1`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:268
assert_trap(() => invoke($3, `check_t1`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:269
assert_trap(() => invoke($3, `check_t1`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:270
assert_trap(() => invoke($3, `check_t1`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:271
assert_return(() => invoke($3, `check_t1`, [11]), [value("i32", 6)]);

// ./test/core/table_copy.wast:272
assert_return(() => invoke($3, `check_t1`, [12]), [value("i32", 3)]);

// ./test/core/table_copy.wast:273
assert_return(() => invoke($3, `check_t1`, [13]), [value("i32", 2)]);

// ./test/core/table_copy.wast:274
assert_return(() => invoke($3, `check_t1`, [14]), [value("i32", 5)]);

// ./test/core/table_copy.wast:275
assert_return(() => invoke($3, `check_t1`, [15]), [value("i32", 7)]);

// ./test/core/table_copy.wast:276
assert_trap(() => invoke($3, `check_t1`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:277
assert_trap(() => invoke($3, `check_t1`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:278
assert_trap(() => invoke($3, `check_t1`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:279
assert_trap(() => invoke($3, `check_t1`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:280
assert_trap(() => invoke($3, `check_t1`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:281
assert_trap(() => invoke($3, `check_t1`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:282
assert_trap(() => invoke($3, `check_t1`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:283
assert_trap(() => invoke($3, `check_t1`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:284
assert_trap(() => invoke($3, `check_t1`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:285
assert_trap(() => invoke($3, `check_t1`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:286
assert_trap(() => invoke($3, `check_t1`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:287
assert_trap(() => invoke($3, `check_t1`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:288
assert_trap(() => invoke($3, `check_t1`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:289
assert_trap(() => invoke($3, `check_t1`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:291
let $4 = instantiate(`(module
  (type (func (result i32)))  ;; type #0
  (import "a" "ef0" (func (result i32)))    ;; index 0
  (import "a" "ef1" (func (result i32)))
  (import "a" "ef2" (func (result i32)))
  (import "a" "ef3" (func (result i32)))
  (import "a" "ef4" (func (result i32)))    ;; index 4
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (elem (table $$t1) (i32.const 3) func 1 3 1 4)
  (elem (table $$t1) (i32.const 11) func 6 3 2 5 7)
  (func (result i32) (i32.const 5))  ;; index 5
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))  ;; index 9
  (func (export "test")
    (table.copy $$t0 $$t0 (i32.const 13) (i32.const 25) (i32.const 3)))
  (func (export "check_t0") (param i32) (result i32)
    (call_indirect $$t0 (type 0) (local.get 0)))
  (func (export "check_t1") (param i32) (result i32)
    (call_indirect $$t1 (type 0) (local.get 0)))
)`);

// ./test/core/table_copy.wast:321
invoke($4, `test`, []);

// ./test/core/table_copy.wast:322
assert_trap(() => invoke($4, `check_t0`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:323
assert_trap(() => invoke($4, `check_t0`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:324
assert_return(() => invoke($4, `check_t0`, [2]), [value("i32", 3)]);

// ./test/core/table_copy.wast:325
assert_return(() => invoke($4, `check_t0`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:326
assert_return(() => invoke($4, `check_t0`, [4]), [value("i32", 4)]);

// ./test/core/table_copy.wast:327
assert_return(() => invoke($4, `check_t0`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:328
assert_trap(() => invoke($4, `check_t0`, [6]), `uninitialized element`);

// ./test/core/table_copy.wast:329
assert_trap(() => invoke($4, `check_t0`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:330
assert_trap(() => invoke($4, `check_t0`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:331
assert_trap(() => invoke($4, `check_t0`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:332
assert_trap(() => invoke($4, `check_t0`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:333
assert_trap(() => invoke($4, `check_t0`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:334
assert_return(() => invoke($4, `check_t0`, [12]), [value("i32", 7)]);

// ./test/core/table_copy.wast:335
assert_trap(() => invoke($4, `check_t0`, [13]), `uninitialized element`);

// ./test/core/table_copy.wast:336
assert_trap(() => invoke($4, `check_t0`, [14]), `uninitialized element`);

// ./test/core/table_copy.wast:337
assert_trap(() => invoke($4, `check_t0`, [15]), `uninitialized element`);

// ./test/core/table_copy.wast:338
assert_return(() => invoke($4, `check_t0`, [16]), [value("i32", 6)]);

// ./test/core/table_copy.wast:339
assert_trap(() => invoke($4, `check_t0`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:340
assert_trap(() => invoke($4, `check_t0`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:341
assert_trap(() => invoke($4, `check_t0`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:342
assert_trap(() => invoke($4, `check_t0`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:343
assert_trap(() => invoke($4, `check_t0`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:344
assert_trap(() => invoke($4, `check_t0`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:345
assert_trap(() => invoke($4, `check_t0`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:346
assert_trap(() => invoke($4, `check_t0`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:347
assert_trap(() => invoke($4, `check_t0`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:348
assert_trap(() => invoke($4, `check_t0`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:349
assert_trap(() => invoke($4, `check_t0`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:350
assert_trap(() => invoke($4, `check_t0`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:351
assert_trap(() => invoke($4, `check_t0`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:352
assert_trap(() => invoke($4, `check_t1`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:353
assert_trap(() => invoke($4, `check_t1`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:354
assert_trap(() => invoke($4, `check_t1`, [2]), `uninitialized element`);

// ./test/core/table_copy.wast:355
assert_return(() => invoke($4, `check_t1`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:356
assert_return(() => invoke($4, `check_t1`, [4]), [value("i32", 3)]);

// ./test/core/table_copy.wast:357
assert_return(() => invoke($4, `check_t1`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:358
assert_return(() => invoke($4, `check_t1`, [6]), [value("i32", 4)]);

// ./test/core/table_copy.wast:359
assert_trap(() => invoke($4, `check_t1`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:360
assert_trap(() => invoke($4, `check_t1`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:361
assert_trap(() => invoke($4, `check_t1`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:362
assert_trap(() => invoke($4, `check_t1`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:363
assert_return(() => invoke($4, `check_t1`, [11]), [value("i32", 6)]);

// ./test/core/table_copy.wast:364
assert_return(() => invoke($4, `check_t1`, [12]), [value("i32", 3)]);

// ./test/core/table_copy.wast:365
assert_return(() => invoke($4, `check_t1`, [13]), [value("i32", 2)]);

// ./test/core/table_copy.wast:366
assert_return(() => invoke($4, `check_t1`, [14]), [value("i32", 5)]);

// ./test/core/table_copy.wast:367
assert_return(() => invoke($4, `check_t1`, [15]), [value("i32", 7)]);

// ./test/core/table_copy.wast:368
assert_trap(() => invoke($4, `check_t1`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:369
assert_trap(() => invoke($4, `check_t1`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:370
assert_trap(() => invoke($4, `check_t1`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:371
assert_trap(() => invoke($4, `check_t1`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:372
assert_trap(() => invoke($4, `check_t1`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:373
assert_trap(() => invoke($4, `check_t1`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:374
assert_trap(() => invoke($4, `check_t1`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:375
assert_trap(() => invoke($4, `check_t1`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:376
assert_trap(() => invoke($4, `check_t1`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:377
assert_trap(() => invoke($4, `check_t1`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:378
assert_trap(() => invoke($4, `check_t1`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:379
assert_trap(() => invoke($4, `check_t1`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:380
assert_trap(() => invoke($4, `check_t1`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:381
assert_trap(() => invoke($4, `check_t1`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:383
let $5 = instantiate(`(module
  (type (func (result i32)))  ;; type #0
  (import "a" "ef0" (func (result i32)))    ;; index 0
  (import "a" "ef1" (func (result i32)))
  (import "a" "ef2" (func (result i32)))
  (import "a" "ef3" (func (result i32)))
  (import "a" "ef4" (func (result i32)))    ;; index 4
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (elem (table $$t1) (i32.const 3) func 1 3 1 4)
  (elem (table $$t1) (i32.const 11) func 6 3 2 5 7)
  (func (result i32) (i32.const 5))  ;; index 5
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))  ;; index 9
  (func (export "test")
    (table.copy $$t0 $$t0 (i32.const 20) (i32.const 22) (i32.const 4)))
  (func (export "check_t0") (param i32) (result i32)
    (call_indirect $$t0 (type 0) (local.get 0)))
  (func (export "check_t1") (param i32) (result i32)
    (call_indirect $$t1 (type 0) (local.get 0)))
)`);

// ./test/core/table_copy.wast:413
invoke($5, `test`, []);

// ./test/core/table_copy.wast:414
assert_trap(() => invoke($5, `check_t0`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:415
assert_trap(() => invoke($5, `check_t0`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:416
assert_return(() => invoke($5, `check_t0`, [2]), [value("i32", 3)]);

// ./test/core/table_copy.wast:417
assert_return(() => invoke($5, `check_t0`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:418
assert_return(() => invoke($5, `check_t0`, [4]), [value("i32", 4)]);

// ./test/core/table_copy.wast:419
assert_return(() => invoke($5, `check_t0`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:420
assert_trap(() => invoke($5, `check_t0`, [6]), `uninitialized element`);

// ./test/core/table_copy.wast:421
assert_trap(() => invoke($5, `check_t0`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:422
assert_trap(() => invoke($5, `check_t0`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:423
assert_trap(() => invoke($5, `check_t0`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:424
assert_trap(() => invoke($5, `check_t0`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:425
assert_trap(() => invoke($5, `check_t0`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:426
assert_return(() => invoke($5, `check_t0`, [12]), [value("i32", 7)]);

// ./test/core/table_copy.wast:427
assert_return(() => invoke($5, `check_t0`, [13]), [value("i32", 5)]);

// ./test/core/table_copy.wast:428
assert_return(() => invoke($5, `check_t0`, [14]), [value("i32", 2)]);

// ./test/core/table_copy.wast:429
assert_return(() => invoke($5, `check_t0`, [15]), [value("i32", 3)]);

// ./test/core/table_copy.wast:430
assert_return(() => invoke($5, `check_t0`, [16]), [value("i32", 6)]);

// ./test/core/table_copy.wast:431
assert_trap(() => invoke($5, `check_t0`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:432
assert_trap(() => invoke($5, `check_t0`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:433
assert_trap(() => invoke($5, `check_t0`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:434
assert_trap(() => invoke($5, `check_t0`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:435
assert_trap(() => invoke($5, `check_t0`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:436
assert_trap(() => invoke($5, `check_t0`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:437
assert_trap(() => invoke($5, `check_t0`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:438
assert_trap(() => invoke($5, `check_t0`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:439
assert_trap(() => invoke($5, `check_t0`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:440
assert_trap(() => invoke($5, `check_t0`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:441
assert_trap(() => invoke($5, `check_t0`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:442
assert_trap(() => invoke($5, `check_t0`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:443
assert_trap(() => invoke($5, `check_t0`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:444
assert_trap(() => invoke($5, `check_t1`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:445
assert_trap(() => invoke($5, `check_t1`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:446
assert_trap(() => invoke($5, `check_t1`, [2]), `uninitialized element`);

// ./test/core/table_copy.wast:447
assert_return(() => invoke($5, `check_t1`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:448
assert_return(() => invoke($5, `check_t1`, [4]), [value("i32", 3)]);

// ./test/core/table_copy.wast:449
assert_return(() => invoke($5, `check_t1`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:450
assert_return(() => invoke($5, `check_t1`, [6]), [value("i32", 4)]);

// ./test/core/table_copy.wast:451
assert_trap(() => invoke($5, `check_t1`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:452
assert_trap(() => invoke($5, `check_t1`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:453
assert_trap(() => invoke($5, `check_t1`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:454
assert_trap(() => invoke($5, `check_t1`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:455
assert_return(() => invoke($5, `check_t1`, [11]), [value("i32", 6)]);

// ./test/core/table_copy.wast:456
assert_return(() => invoke($5, `check_t1`, [12]), [value("i32", 3)]);

// ./test/core/table_copy.wast:457
assert_return(() => invoke($5, `check_t1`, [13]), [value("i32", 2)]);

// ./test/core/table_copy.wast:458
assert_return(() => invoke($5, `check_t1`, [14]), [value("i32", 5)]);

// ./test/core/table_copy.wast:459
assert_return(() => invoke($5, `check_t1`, [15]), [value("i32", 7)]);

// ./test/core/table_copy.wast:460
assert_trap(() => invoke($5, `check_t1`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:461
assert_trap(() => invoke($5, `check_t1`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:462
assert_trap(() => invoke($5, `check_t1`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:463
assert_trap(() => invoke($5, `check_t1`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:464
assert_trap(() => invoke($5, `check_t1`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:465
assert_trap(() => invoke($5, `check_t1`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:466
assert_trap(() => invoke($5, `check_t1`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:467
assert_trap(() => invoke($5, `check_t1`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:468
assert_trap(() => invoke($5, `check_t1`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:469
assert_trap(() => invoke($5, `check_t1`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:470
assert_trap(() => invoke($5, `check_t1`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:471
assert_trap(() => invoke($5, `check_t1`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:472
assert_trap(() => invoke($5, `check_t1`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:473
assert_trap(() => invoke($5, `check_t1`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:475
let $6 = instantiate(`(module
  (type (func (result i32)))  ;; type #0
  (import "a" "ef0" (func (result i32)))    ;; index 0
  (import "a" "ef1" (func (result i32)))
  (import "a" "ef2" (func (result i32)))
  (import "a" "ef3" (func (result i32)))
  (import "a" "ef4" (func (result i32)))    ;; index 4
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (elem (table $$t1) (i32.const 3) func 1 3 1 4)
  (elem (table $$t1) (i32.const 11) func 6 3 2 5 7)
  (func (result i32) (i32.const 5))  ;; index 5
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))  ;; index 9
  (func (export "test")
    (table.copy $$t0 $$t0 (i32.const 25) (i32.const 1) (i32.const 3)))
  (func (export "check_t0") (param i32) (result i32)
    (call_indirect $$t0 (type 0) (local.get 0)))
  (func (export "check_t1") (param i32) (result i32)
    (call_indirect $$t1 (type 0) (local.get 0)))
)`);

// ./test/core/table_copy.wast:505
invoke($6, `test`, []);

// ./test/core/table_copy.wast:506
assert_trap(() => invoke($6, `check_t0`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:507
assert_trap(() => invoke($6, `check_t0`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:508
assert_return(() => invoke($6, `check_t0`, [2]), [value("i32", 3)]);

// ./test/core/table_copy.wast:509
assert_return(() => invoke($6, `check_t0`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:510
assert_return(() => invoke($6, `check_t0`, [4]), [value("i32", 4)]);

// ./test/core/table_copy.wast:511
assert_return(() => invoke($6, `check_t0`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:512
assert_trap(() => invoke($6, `check_t0`, [6]), `uninitialized element`);

// ./test/core/table_copy.wast:513
assert_trap(() => invoke($6, `check_t0`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:514
assert_trap(() => invoke($6, `check_t0`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:515
assert_trap(() => invoke($6, `check_t0`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:516
assert_trap(() => invoke($6, `check_t0`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:517
assert_trap(() => invoke($6, `check_t0`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:518
assert_return(() => invoke($6, `check_t0`, [12]), [value("i32", 7)]);

// ./test/core/table_copy.wast:519
assert_return(() => invoke($6, `check_t0`, [13]), [value("i32", 5)]);

// ./test/core/table_copy.wast:520
assert_return(() => invoke($6, `check_t0`, [14]), [value("i32", 2)]);

// ./test/core/table_copy.wast:521
assert_return(() => invoke($6, `check_t0`, [15]), [value("i32", 3)]);

// ./test/core/table_copy.wast:522
assert_return(() => invoke($6, `check_t0`, [16]), [value("i32", 6)]);

// ./test/core/table_copy.wast:523
assert_trap(() => invoke($6, `check_t0`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:524
assert_trap(() => invoke($6, `check_t0`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:525
assert_trap(() => invoke($6, `check_t0`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:526
assert_trap(() => invoke($6, `check_t0`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:527
assert_trap(() => invoke($6, `check_t0`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:528
assert_trap(() => invoke($6, `check_t0`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:529
assert_trap(() => invoke($6, `check_t0`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:530
assert_trap(() => invoke($6, `check_t0`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:531
assert_trap(() => invoke($6, `check_t0`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:532
assert_return(() => invoke($6, `check_t0`, [26]), [value("i32", 3)]);

// ./test/core/table_copy.wast:533
assert_return(() => invoke($6, `check_t0`, [27]), [value("i32", 1)]);

// ./test/core/table_copy.wast:534
assert_trap(() => invoke($6, `check_t0`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:535
assert_trap(() => invoke($6, `check_t0`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:536
assert_trap(() => invoke($6, `check_t1`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:537
assert_trap(() => invoke($6, `check_t1`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:538
assert_trap(() => invoke($6, `check_t1`, [2]), `uninitialized element`);

// ./test/core/table_copy.wast:539
assert_return(() => invoke($6, `check_t1`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:540
assert_return(() => invoke($6, `check_t1`, [4]), [value("i32", 3)]);

// ./test/core/table_copy.wast:541
assert_return(() => invoke($6, `check_t1`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:542
assert_return(() => invoke($6, `check_t1`, [6]), [value("i32", 4)]);

// ./test/core/table_copy.wast:543
assert_trap(() => invoke($6, `check_t1`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:544
assert_trap(() => invoke($6, `check_t1`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:545
assert_trap(() => invoke($6, `check_t1`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:546
assert_trap(() => invoke($6, `check_t1`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:547
assert_return(() => invoke($6, `check_t1`, [11]), [value("i32", 6)]);

// ./test/core/table_copy.wast:548
assert_return(() => invoke($6, `check_t1`, [12]), [value("i32", 3)]);

// ./test/core/table_copy.wast:549
assert_return(() => invoke($6, `check_t1`, [13]), [value("i32", 2)]);

// ./test/core/table_copy.wast:550
assert_return(() => invoke($6, `check_t1`, [14]), [value("i32", 5)]);

// ./test/core/table_copy.wast:551
assert_return(() => invoke($6, `check_t1`, [15]), [value("i32", 7)]);

// ./test/core/table_copy.wast:552
assert_trap(() => invoke($6, `check_t1`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:553
assert_trap(() => invoke($6, `check_t1`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:554
assert_trap(() => invoke($6, `check_t1`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:555
assert_trap(() => invoke($6, `check_t1`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:556
assert_trap(() => invoke($6, `check_t1`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:557
assert_trap(() => invoke($6, `check_t1`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:558
assert_trap(() => invoke($6, `check_t1`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:559
assert_trap(() => invoke($6, `check_t1`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:560
assert_trap(() => invoke($6, `check_t1`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:561
assert_trap(() => invoke($6, `check_t1`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:562
assert_trap(() => invoke($6, `check_t1`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:563
assert_trap(() => invoke($6, `check_t1`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:564
assert_trap(() => invoke($6, `check_t1`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:565
assert_trap(() => invoke($6, `check_t1`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:567
let $7 = instantiate(`(module
  (type (func (result i32)))  ;; type #0
  (import "a" "ef0" (func (result i32)))    ;; index 0
  (import "a" "ef1" (func (result i32)))
  (import "a" "ef2" (func (result i32)))
  (import "a" "ef3" (func (result i32)))
  (import "a" "ef4" (func (result i32)))    ;; index 4
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (elem (table $$t1) (i32.const 3) func 1 3 1 4)
  (elem (table $$t1) (i32.const 11) func 6 3 2 5 7)
  (func (result i32) (i32.const 5))  ;; index 5
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))  ;; index 9
  (func (export "test")
    (table.copy $$t0 $$t0 (i32.const 10) (i32.const 12) (i32.const 7)))
  (func (export "check_t0") (param i32) (result i32)
    (call_indirect $$t0 (type 0) (local.get 0)))
  (func (export "check_t1") (param i32) (result i32)
    (call_indirect $$t1 (type 0) (local.get 0)))
)`);

// ./test/core/table_copy.wast:597
invoke($7, `test`, []);

// ./test/core/table_copy.wast:598
assert_trap(() => invoke($7, `check_t0`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:599
assert_trap(() => invoke($7, `check_t0`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:600
assert_return(() => invoke($7, `check_t0`, [2]), [value("i32", 3)]);

// ./test/core/table_copy.wast:601
assert_return(() => invoke($7, `check_t0`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:602
assert_return(() => invoke($7, `check_t0`, [4]), [value("i32", 4)]);

// ./test/core/table_copy.wast:603
assert_return(() => invoke($7, `check_t0`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:604
assert_trap(() => invoke($7, `check_t0`, [6]), `uninitialized element`);

// ./test/core/table_copy.wast:605
assert_trap(() => invoke($7, `check_t0`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:606
assert_trap(() => invoke($7, `check_t0`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:607
assert_trap(() => invoke($7, `check_t0`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:608
assert_return(() => invoke($7, `check_t0`, [10]), [value("i32", 7)]);

// ./test/core/table_copy.wast:609
assert_return(() => invoke($7, `check_t0`, [11]), [value("i32", 5)]);

// ./test/core/table_copy.wast:610
assert_return(() => invoke($7, `check_t0`, [12]), [value("i32", 2)]);

// ./test/core/table_copy.wast:611
assert_return(() => invoke($7, `check_t0`, [13]), [value("i32", 3)]);

// ./test/core/table_copy.wast:612
assert_return(() => invoke($7, `check_t0`, [14]), [value("i32", 6)]);

// ./test/core/table_copy.wast:613
assert_trap(() => invoke($7, `check_t0`, [15]), `uninitialized element`);

// ./test/core/table_copy.wast:614
assert_trap(() => invoke($7, `check_t0`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:615
assert_trap(() => invoke($7, `check_t0`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:616
assert_trap(() => invoke($7, `check_t0`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:617
assert_trap(() => invoke($7, `check_t0`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:618
assert_trap(() => invoke($7, `check_t0`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:619
assert_trap(() => invoke($7, `check_t0`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:620
assert_trap(() => invoke($7, `check_t0`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:621
assert_trap(() => invoke($7, `check_t0`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:622
assert_trap(() => invoke($7, `check_t0`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:623
assert_trap(() => invoke($7, `check_t0`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:624
assert_trap(() => invoke($7, `check_t0`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:625
assert_trap(() => invoke($7, `check_t0`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:626
assert_trap(() => invoke($7, `check_t0`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:627
assert_trap(() => invoke($7, `check_t0`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:628
assert_trap(() => invoke($7, `check_t1`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:629
assert_trap(() => invoke($7, `check_t1`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:630
assert_trap(() => invoke($7, `check_t1`, [2]), `uninitialized element`);

// ./test/core/table_copy.wast:631
assert_return(() => invoke($7, `check_t1`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:632
assert_return(() => invoke($7, `check_t1`, [4]), [value("i32", 3)]);

// ./test/core/table_copy.wast:633
assert_return(() => invoke($7, `check_t1`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:634
assert_return(() => invoke($7, `check_t1`, [6]), [value("i32", 4)]);

// ./test/core/table_copy.wast:635
assert_trap(() => invoke($7, `check_t1`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:636
assert_trap(() => invoke($7, `check_t1`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:637
assert_trap(() => invoke($7, `check_t1`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:638
assert_trap(() => invoke($7, `check_t1`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:639
assert_return(() => invoke($7, `check_t1`, [11]), [value("i32", 6)]);

// ./test/core/table_copy.wast:640
assert_return(() => invoke($7, `check_t1`, [12]), [value("i32", 3)]);

// ./test/core/table_copy.wast:641
assert_return(() => invoke($7, `check_t1`, [13]), [value("i32", 2)]);

// ./test/core/table_copy.wast:642
assert_return(() => invoke($7, `check_t1`, [14]), [value("i32", 5)]);

// ./test/core/table_copy.wast:643
assert_return(() => invoke($7, `check_t1`, [15]), [value("i32", 7)]);

// ./test/core/table_copy.wast:644
assert_trap(() => invoke($7, `check_t1`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:645
assert_trap(() => invoke($7, `check_t1`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:646
assert_trap(() => invoke($7, `check_t1`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:647
assert_trap(() => invoke($7, `check_t1`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:648
assert_trap(() => invoke($7, `check_t1`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:649
assert_trap(() => invoke($7, `check_t1`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:650
assert_trap(() => invoke($7, `check_t1`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:651
assert_trap(() => invoke($7, `check_t1`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:652
assert_trap(() => invoke($7, `check_t1`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:653
assert_trap(() => invoke($7, `check_t1`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:654
assert_trap(() => invoke($7, `check_t1`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:655
assert_trap(() => invoke($7, `check_t1`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:656
assert_trap(() => invoke($7, `check_t1`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:657
assert_trap(() => invoke($7, `check_t1`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:659
let $8 = instantiate(`(module
  (type (func (result i32)))  ;; type #0
  (import "a" "ef0" (func (result i32)))    ;; index 0
  (import "a" "ef1" (func (result i32)))
  (import "a" "ef2" (func (result i32)))
  (import "a" "ef3" (func (result i32)))
  (import "a" "ef4" (func (result i32)))    ;; index 4
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (elem (table $$t1) (i32.const 3) func 1 3 1 4)
  (elem (table $$t1) (i32.const 11) func 6 3 2 5 7)
  (func (result i32) (i32.const 5))  ;; index 5
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))  ;; index 9
  (func (export "test")
    (table.copy $$t0 $$t0 (i32.const 12) (i32.const 10) (i32.const 7)))
  (func (export "check_t0") (param i32) (result i32)
    (call_indirect $$t0 (type 0) (local.get 0)))
  (func (export "check_t1") (param i32) (result i32)
    (call_indirect $$t1 (type 0) (local.get 0)))
)`);

// ./test/core/table_copy.wast:689
invoke($8, `test`, []);

// ./test/core/table_copy.wast:690
assert_trap(() => invoke($8, `check_t0`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:691
assert_trap(() => invoke($8, `check_t0`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:692
assert_return(() => invoke($8, `check_t0`, [2]), [value("i32", 3)]);

// ./test/core/table_copy.wast:693
assert_return(() => invoke($8, `check_t0`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:694
assert_return(() => invoke($8, `check_t0`, [4]), [value("i32", 4)]);

// ./test/core/table_copy.wast:695
assert_return(() => invoke($8, `check_t0`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:696
assert_trap(() => invoke($8, `check_t0`, [6]), `uninitialized element`);

// ./test/core/table_copy.wast:697
assert_trap(() => invoke($8, `check_t0`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:698
assert_trap(() => invoke($8, `check_t0`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:699
assert_trap(() => invoke($8, `check_t0`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:700
assert_trap(() => invoke($8, `check_t0`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:701
assert_trap(() => invoke($8, `check_t0`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:702
assert_trap(() => invoke($8, `check_t0`, [12]), `uninitialized element`);

// ./test/core/table_copy.wast:703
assert_trap(() => invoke($8, `check_t0`, [13]), `uninitialized element`);

// ./test/core/table_copy.wast:704
assert_return(() => invoke($8, `check_t0`, [14]), [value("i32", 7)]);

// ./test/core/table_copy.wast:705
assert_return(() => invoke($8, `check_t0`, [15]), [value("i32", 5)]);

// ./test/core/table_copy.wast:706
assert_return(() => invoke($8, `check_t0`, [16]), [value("i32", 2)]);

// ./test/core/table_copy.wast:707
assert_return(() => invoke($8, `check_t0`, [17]), [value("i32", 3)]);

// ./test/core/table_copy.wast:708
assert_return(() => invoke($8, `check_t0`, [18]), [value("i32", 6)]);

// ./test/core/table_copy.wast:709
assert_trap(() => invoke($8, `check_t0`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:710
assert_trap(() => invoke($8, `check_t0`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:711
assert_trap(() => invoke($8, `check_t0`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:712
assert_trap(() => invoke($8, `check_t0`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:713
assert_trap(() => invoke($8, `check_t0`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:714
assert_trap(() => invoke($8, `check_t0`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:715
assert_trap(() => invoke($8, `check_t0`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:716
assert_trap(() => invoke($8, `check_t0`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:717
assert_trap(() => invoke($8, `check_t0`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:718
assert_trap(() => invoke($8, `check_t0`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:719
assert_trap(() => invoke($8, `check_t0`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:720
assert_trap(() => invoke($8, `check_t1`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:721
assert_trap(() => invoke($8, `check_t1`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:722
assert_trap(() => invoke($8, `check_t1`, [2]), `uninitialized element`);

// ./test/core/table_copy.wast:723
assert_return(() => invoke($8, `check_t1`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:724
assert_return(() => invoke($8, `check_t1`, [4]), [value("i32", 3)]);

// ./test/core/table_copy.wast:725
assert_return(() => invoke($8, `check_t1`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:726
assert_return(() => invoke($8, `check_t1`, [6]), [value("i32", 4)]);

// ./test/core/table_copy.wast:727
assert_trap(() => invoke($8, `check_t1`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:728
assert_trap(() => invoke($8, `check_t1`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:729
assert_trap(() => invoke($8, `check_t1`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:730
assert_trap(() => invoke($8, `check_t1`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:731
assert_return(() => invoke($8, `check_t1`, [11]), [value("i32", 6)]);

// ./test/core/table_copy.wast:732
assert_return(() => invoke($8, `check_t1`, [12]), [value("i32", 3)]);

// ./test/core/table_copy.wast:733
assert_return(() => invoke($8, `check_t1`, [13]), [value("i32", 2)]);

// ./test/core/table_copy.wast:734
assert_return(() => invoke($8, `check_t1`, [14]), [value("i32", 5)]);

// ./test/core/table_copy.wast:735
assert_return(() => invoke($8, `check_t1`, [15]), [value("i32", 7)]);

// ./test/core/table_copy.wast:736
assert_trap(() => invoke($8, `check_t1`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:737
assert_trap(() => invoke($8, `check_t1`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:738
assert_trap(() => invoke($8, `check_t1`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:739
assert_trap(() => invoke($8, `check_t1`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:740
assert_trap(() => invoke($8, `check_t1`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:741
assert_trap(() => invoke($8, `check_t1`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:742
assert_trap(() => invoke($8, `check_t1`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:743
assert_trap(() => invoke($8, `check_t1`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:744
assert_trap(() => invoke($8, `check_t1`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:745
assert_trap(() => invoke($8, `check_t1`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:746
assert_trap(() => invoke($8, `check_t1`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:747
assert_trap(() => invoke($8, `check_t1`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:748
assert_trap(() => invoke($8, `check_t1`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:749
assert_trap(() => invoke($8, `check_t1`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:751
let $9 = instantiate(`(module
  (type (func (result i32)))  ;; type #0
  (import "a" "ef0" (func (result i32)))    ;; index 0
  (import "a" "ef1" (func (result i32)))
  (import "a" "ef2" (func (result i32)))
  (import "a" "ef3" (func (result i32)))
  (import "a" "ef4" (func (result i32)))    ;; index 4
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (elem (table $$t1) (i32.const 3) func 1 3 1 4)
  (elem (table $$t1) (i32.const 11) func 6 3 2 5 7)
  (func (result i32) (i32.const 5))  ;; index 5
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))  ;; index 9
  (func (export "test")
    (table.copy $$t1 $$t0 (i32.const 10) (i32.const 0) (i32.const 20)))
  (func (export "check_t0") (param i32) (result i32)
    (call_indirect $$t0 (type 0) (local.get 0)))
  (func (export "check_t1") (param i32) (result i32)
    (call_indirect $$t1 (type 0) (local.get 0)))
)`);

// ./test/core/table_copy.wast:781
invoke($9, `test`, []);

// ./test/core/table_copy.wast:782
assert_trap(() => invoke($9, `check_t0`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:783
assert_trap(() => invoke($9, `check_t0`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:784
assert_return(() => invoke($9, `check_t0`, [2]), [value("i32", 3)]);

// ./test/core/table_copy.wast:785
assert_return(() => invoke($9, `check_t0`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:786
assert_return(() => invoke($9, `check_t0`, [4]), [value("i32", 4)]);

// ./test/core/table_copy.wast:787
assert_return(() => invoke($9, `check_t0`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:788
assert_trap(() => invoke($9, `check_t0`, [6]), `uninitialized element`);

// ./test/core/table_copy.wast:789
assert_trap(() => invoke($9, `check_t0`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:790
assert_trap(() => invoke($9, `check_t0`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:791
assert_trap(() => invoke($9, `check_t0`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:792
assert_trap(() => invoke($9, `check_t0`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:793
assert_trap(() => invoke($9, `check_t0`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:794
assert_return(() => invoke($9, `check_t0`, [12]), [value("i32", 7)]);

// ./test/core/table_copy.wast:795
assert_return(() => invoke($9, `check_t0`, [13]), [value("i32", 5)]);

// ./test/core/table_copy.wast:796
assert_return(() => invoke($9, `check_t0`, [14]), [value("i32", 2)]);

// ./test/core/table_copy.wast:797
assert_return(() => invoke($9, `check_t0`, [15]), [value("i32", 3)]);

// ./test/core/table_copy.wast:798
assert_return(() => invoke($9, `check_t0`, [16]), [value("i32", 6)]);

// ./test/core/table_copy.wast:799
assert_trap(() => invoke($9, `check_t0`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:800
assert_trap(() => invoke($9, `check_t0`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:801
assert_trap(() => invoke($9, `check_t0`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:802
assert_trap(() => invoke($9, `check_t0`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:803
assert_trap(() => invoke($9, `check_t0`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:804
assert_trap(() => invoke($9, `check_t0`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:805
assert_trap(() => invoke($9, `check_t0`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:806
assert_trap(() => invoke($9, `check_t0`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:807
assert_trap(() => invoke($9, `check_t0`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:808
assert_trap(() => invoke($9, `check_t0`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:809
assert_trap(() => invoke($9, `check_t0`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:810
assert_trap(() => invoke($9, `check_t0`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:811
assert_trap(() => invoke($9, `check_t0`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:812
assert_trap(() => invoke($9, `check_t1`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:813
assert_trap(() => invoke($9, `check_t1`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:814
assert_trap(() => invoke($9, `check_t1`, [2]), `uninitialized element`);

// ./test/core/table_copy.wast:815
assert_return(() => invoke($9, `check_t1`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:816
assert_return(() => invoke($9, `check_t1`, [4]), [value("i32", 3)]);

// ./test/core/table_copy.wast:817
assert_return(() => invoke($9, `check_t1`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:818
assert_return(() => invoke($9, `check_t1`, [6]), [value("i32", 4)]);

// ./test/core/table_copy.wast:819
assert_trap(() => invoke($9, `check_t1`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:820
assert_trap(() => invoke($9, `check_t1`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:821
assert_trap(() => invoke($9, `check_t1`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:822
assert_trap(() => invoke($9, `check_t1`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:823
assert_trap(() => invoke($9, `check_t1`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:824
assert_return(() => invoke($9, `check_t1`, [12]), [value("i32", 3)]);

// ./test/core/table_copy.wast:825
assert_return(() => invoke($9, `check_t1`, [13]), [value("i32", 1)]);

// ./test/core/table_copy.wast:826
assert_return(() => invoke($9, `check_t1`, [14]), [value("i32", 4)]);

// ./test/core/table_copy.wast:827
assert_return(() => invoke($9, `check_t1`, [15]), [value("i32", 1)]);

// ./test/core/table_copy.wast:828
assert_trap(() => invoke($9, `check_t1`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:829
assert_trap(() => invoke($9, `check_t1`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:830
assert_trap(() => invoke($9, `check_t1`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:831
assert_trap(() => invoke($9, `check_t1`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:832
assert_trap(() => invoke($9, `check_t1`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:833
assert_trap(() => invoke($9, `check_t1`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:834
assert_return(() => invoke($9, `check_t1`, [22]), [value("i32", 7)]);

// ./test/core/table_copy.wast:835
assert_return(() => invoke($9, `check_t1`, [23]), [value("i32", 5)]);

// ./test/core/table_copy.wast:836
assert_return(() => invoke($9, `check_t1`, [24]), [value("i32", 2)]);

// ./test/core/table_copy.wast:837
assert_return(() => invoke($9, `check_t1`, [25]), [value("i32", 3)]);

// ./test/core/table_copy.wast:838
assert_return(() => invoke($9, `check_t1`, [26]), [value("i32", 6)]);

// ./test/core/table_copy.wast:839
assert_trap(() => invoke($9, `check_t1`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:840
assert_trap(() => invoke($9, `check_t1`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:841
assert_trap(() => invoke($9, `check_t1`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:843
let $10 = instantiate(`(module
  (type (func (result i32)))  ;; type #0
  (import "a" "ef0" (func (result i32)))    ;; index 0
  (import "a" "ef1" (func (result i32)))
  (import "a" "ef2" (func (result i32)))
  (import "a" "ef3" (func (result i32)))
  (import "a" "ef4" (func (result i32)))    ;; index 4
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t1) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t1) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (elem (table $$t0) (i32.const 3) func 1 3 1 4)
  (elem (table $$t0) (i32.const 11) func 6 3 2 5 7)
  (func (result i32) (i32.const 5))  ;; index 5
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))  ;; index 9
  (func (export "test")
    (nop))
  (func (export "check_t0") (param i32) (result i32)
    (call_indirect $$t1 (type 0) (local.get 0)))
  (func (export "check_t1") (param i32) (result i32)
    (call_indirect $$t0 (type 0) (local.get 0)))
)`);

// ./test/core/table_copy.wast:873
invoke($10, `test`, []);

// ./test/core/table_copy.wast:874
assert_trap(() => invoke($10, `check_t0`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:875
assert_trap(() => invoke($10, `check_t0`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:876
assert_return(() => invoke($10, `check_t0`, [2]), [value("i32", 3)]);

// ./test/core/table_copy.wast:877
assert_return(() => invoke($10, `check_t0`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:878
assert_return(() => invoke($10, `check_t0`, [4]), [value("i32", 4)]);

// ./test/core/table_copy.wast:879
assert_return(() => invoke($10, `check_t0`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:880
assert_trap(() => invoke($10, `check_t0`, [6]), `uninitialized element`);

// ./test/core/table_copy.wast:881
assert_trap(() => invoke($10, `check_t0`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:882
assert_trap(() => invoke($10, `check_t0`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:883
assert_trap(() => invoke($10, `check_t0`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:884
assert_trap(() => invoke($10, `check_t0`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:885
assert_trap(() => invoke($10, `check_t0`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:886
assert_return(() => invoke($10, `check_t0`, [12]), [value("i32", 7)]);

// ./test/core/table_copy.wast:887
assert_return(() => invoke($10, `check_t0`, [13]), [value("i32", 5)]);

// ./test/core/table_copy.wast:888
assert_return(() => invoke($10, `check_t0`, [14]), [value("i32", 2)]);

// ./test/core/table_copy.wast:889
assert_return(() => invoke($10, `check_t0`, [15]), [value("i32", 3)]);

// ./test/core/table_copy.wast:890
assert_return(() => invoke($10, `check_t0`, [16]), [value("i32", 6)]);

// ./test/core/table_copy.wast:891
assert_trap(() => invoke($10, `check_t0`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:892
assert_trap(() => invoke($10, `check_t0`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:893
assert_trap(() => invoke($10, `check_t0`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:894
assert_trap(() => invoke($10, `check_t0`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:895
assert_trap(() => invoke($10, `check_t0`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:896
assert_trap(() => invoke($10, `check_t0`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:897
assert_trap(() => invoke($10, `check_t0`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:898
assert_trap(() => invoke($10, `check_t0`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:899
assert_trap(() => invoke($10, `check_t0`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:900
assert_trap(() => invoke($10, `check_t0`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:901
assert_trap(() => invoke($10, `check_t0`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:902
assert_trap(() => invoke($10, `check_t0`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:903
assert_trap(() => invoke($10, `check_t0`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:904
assert_trap(() => invoke($10, `check_t1`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:905
assert_trap(() => invoke($10, `check_t1`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:906
assert_trap(() => invoke($10, `check_t1`, [2]), `uninitialized element`);

// ./test/core/table_copy.wast:907
assert_return(() => invoke($10, `check_t1`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:908
assert_return(() => invoke($10, `check_t1`, [4]), [value("i32", 3)]);

// ./test/core/table_copy.wast:909
assert_return(() => invoke($10, `check_t1`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:910
assert_return(() => invoke($10, `check_t1`, [6]), [value("i32", 4)]);

// ./test/core/table_copy.wast:911
assert_trap(() => invoke($10, `check_t1`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:912
assert_trap(() => invoke($10, `check_t1`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:913
assert_trap(() => invoke($10, `check_t1`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:914
assert_trap(() => invoke($10, `check_t1`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:915
assert_return(() => invoke($10, `check_t1`, [11]), [value("i32", 6)]);

// ./test/core/table_copy.wast:916
assert_return(() => invoke($10, `check_t1`, [12]), [value("i32", 3)]);

// ./test/core/table_copy.wast:917
assert_return(() => invoke($10, `check_t1`, [13]), [value("i32", 2)]);

// ./test/core/table_copy.wast:918
assert_return(() => invoke($10, `check_t1`, [14]), [value("i32", 5)]);

// ./test/core/table_copy.wast:919
assert_return(() => invoke($10, `check_t1`, [15]), [value("i32", 7)]);

// ./test/core/table_copy.wast:920
assert_trap(() => invoke($10, `check_t1`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:921
assert_trap(() => invoke($10, `check_t1`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:922
assert_trap(() => invoke($10, `check_t1`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:923
assert_trap(() => invoke($10, `check_t1`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:924
assert_trap(() => invoke($10, `check_t1`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:925
assert_trap(() => invoke($10, `check_t1`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:926
assert_trap(() => invoke($10, `check_t1`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:927
assert_trap(() => invoke($10, `check_t1`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:928
assert_trap(() => invoke($10, `check_t1`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:929
assert_trap(() => invoke($10, `check_t1`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:930
assert_trap(() => invoke($10, `check_t1`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:931
assert_trap(() => invoke($10, `check_t1`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:932
assert_trap(() => invoke($10, `check_t1`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:933
assert_trap(() => invoke($10, `check_t1`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:935
let $11 = instantiate(`(module
  (type (func (result i32)))  ;; type #0
  (import "a" "ef0" (func (result i32)))    ;; index 0
  (import "a" "ef1" (func (result i32)))
  (import "a" "ef2" (func (result i32)))
  (import "a" "ef3" (func (result i32)))
  (import "a" "ef4" (func (result i32)))    ;; index 4
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t1) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t1) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (elem (table $$t0) (i32.const 3) func 1 3 1 4)
  (elem (table $$t0) (i32.const 11) func 6 3 2 5 7)
  (func (result i32) (i32.const 5))  ;; index 5
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))  ;; index 9
  (func (export "test")
    (table.copy $$t1 $$t1 (i32.const 13) (i32.const 2) (i32.const 3)))
  (func (export "check_t0") (param i32) (result i32)
    (call_indirect $$t1 (type 0) (local.get 0)))
  (func (export "check_t1") (param i32) (result i32)
    (call_indirect $$t0 (type 0) (local.get 0)))
)`);

// ./test/core/table_copy.wast:965
invoke($11, `test`, []);

// ./test/core/table_copy.wast:966
assert_trap(() => invoke($11, `check_t0`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:967
assert_trap(() => invoke($11, `check_t0`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:968
assert_return(() => invoke($11, `check_t0`, [2]), [value("i32", 3)]);

// ./test/core/table_copy.wast:969
assert_return(() => invoke($11, `check_t0`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:970
assert_return(() => invoke($11, `check_t0`, [4]), [value("i32", 4)]);

// ./test/core/table_copy.wast:971
assert_return(() => invoke($11, `check_t0`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:972
assert_trap(() => invoke($11, `check_t0`, [6]), `uninitialized element`);

// ./test/core/table_copy.wast:973
assert_trap(() => invoke($11, `check_t0`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:974
assert_trap(() => invoke($11, `check_t0`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:975
assert_trap(() => invoke($11, `check_t0`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:976
assert_trap(() => invoke($11, `check_t0`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:977
assert_trap(() => invoke($11, `check_t0`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:978
assert_return(() => invoke($11, `check_t0`, [12]), [value("i32", 7)]);

// ./test/core/table_copy.wast:979
assert_return(() => invoke($11, `check_t0`, [13]), [value("i32", 3)]);

// ./test/core/table_copy.wast:980
assert_return(() => invoke($11, `check_t0`, [14]), [value("i32", 1)]);

// ./test/core/table_copy.wast:981
assert_return(() => invoke($11, `check_t0`, [15]), [value("i32", 4)]);

// ./test/core/table_copy.wast:982
assert_return(() => invoke($11, `check_t0`, [16]), [value("i32", 6)]);

// ./test/core/table_copy.wast:983
assert_trap(() => invoke($11, `check_t0`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:984
assert_trap(() => invoke($11, `check_t0`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:985
assert_trap(() => invoke($11, `check_t0`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:986
assert_trap(() => invoke($11, `check_t0`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:987
assert_trap(() => invoke($11, `check_t0`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:988
assert_trap(() => invoke($11, `check_t0`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:989
assert_trap(() => invoke($11, `check_t0`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:990
assert_trap(() => invoke($11, `check_t0`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:991
assert_trap(() => invoke($11, `check_t0`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:992
assert_trap(() => invoke($11, `check_t0`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:993
assert_trap(() => invoke($11, `check_t0`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:994
assert_trap(() => invoke($11, `check_t0`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:995
assert_trap(() => invoke($11, `check_t0`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:996
assert_trap(() => invoke($11, `check_t1`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:997
assert_trap(() => invoke($11, `check_t1`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:998
assert_trap(() => invoke($11, `check_t1`, [2]), `uninitialized element`);

// ./test/core/table_copy.wast:999
assert_return(() => invoke($11, `check_t1`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1000
assert_return(() => invoke($11, `check_t1`, [4]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1001
assert_return(() => invoke($11, `check_t1`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1002
assert_return(() => invoke($11, `check_t1`, [6]), [value("i32", 4)]);

// ./test/core/table_copy.wast:1003
assert_trap(() => invoke($11, `check_t1`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:1004
assert_trap(() => invoke($11, `check_t1`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:1005
assert_trap(() => invoke($11, `check_t1`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:1006
assert_trap(() => invoke($11, `check_t1`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:1007
assert_return(() => invoke($11, `check_t1`, [11]), [value("i32", 6)]);

// ./test/core/table_copy.wast:1008
assert_return(() => invoke($11, `check_t1`, [12]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1009
assert_return(() => invoke($11, `check_t1`, [13]), [value("i32", 2)]);

// ./test/core/table_copy.wast:1010
assert_return(() => invoke($11, `check_t1`, [14]), [value("i32", 5)]);

// ./test/core/table_copy.wast:1011
assert_return(() => invoke($11, `check_t1`, [15]), [value("i32", 7)]);

// ./test/core/table_copy.wast:1012
assert_trap(() => invoke($11, `check_t1`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:1013
assert_trap(() => invoke($11, `check_t1`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:1014
assert_trap(() => invoke($11, `check_t1`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:1015
assert_trap(() => invoke($11, `check_t1`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:1016
assert_trap(() => invoke($11, `check_t1`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:1017
assert_trap(() => invoke($11, `check_t1`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:1018
assert_trap(() => invoke($11, `check_t1`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:1019
assert_trap(() => invoke($11, `check_t1`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:1020
assert_trap(() => invoke($11, `check_t1`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:1021
assert_trap(() => invoke($11, `check_t1`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:1022
assert_trap(() => invoke($11, `check_t1`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:1023
assert_trap(() => invoke($11, `check_t1`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:1024
assert_trap(() => invoke($11, `check_t1`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:1025
assert_trap(() => invoke($11, `check_t1`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:1027
let $12 = instantiate(`(module
  (type (func (result i32)))  ;; type #0
  (import "a" "ef0" (func (result i32)))    ;; index 0
  (import "a" "ef1" (func (result i32)))
  (import "a" "ef2" (func (result i32)))
  (import "a" "ef3" (func (result i32)))
  (import "a" "ef4" (func (result i32)))    ;; index 4
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t1) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t1) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (elem (table $$t0) (i32.const 3) func 1 3 1 4)
  (elem (table $$t0) (i32.const 11) func 6 3 2 5 7)
  (func (result i32) (i32.const 5))  ;; index 5
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))  ;; index 9
  (func (export "test")
    (table.copy $$t1 $$t1 (i32.const 25) (i32.const 15) (i32.const 2)))
  (func (export "check_t0") (param i32) (result i32)
    (call_indirect $$t1 (type 0) (local.get 0)))
  (func (export "check_t1") (param i32) (result i32)
    (call_indirect $$t0 (type 0) (local.get 0)))
)`);

// ./test/core/table_copy.wast:1057
invoke($12, `test`, []);

// ./test/core/table_copy.wast:1058
assert_trap(() => invoke($12, `check_t0`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:1059
assert_trap(() => invoke($12, `check_t0`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:1060
assert_return(() => invoke($12, `check_t0`, [2]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1061
assert_return(() => invoke($12, `check_t0`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1062
assert_return(() => invoke($12, `check_t0`, [4]), [value("i32", 4)]);

// ./test/core/table_copy.wast:1063
assert_return(() => invoke($12, `check_t0`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1064
assert_trap(() => invoke($12, `check_t0`, [6]), `uninitialized element`);

// ./test/core/table_copy.wast:1065
assert_trap(() => invoke($12, `check_t0`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:1066
assert_trap(() => invoke($12, `check_t0`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:1067
assert_trap(() => invoke($12, `check_t0`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:1068
assert_trap(() => invoke($12, `check_t0`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:1069
assert_trap(() => invoke($12, `check_t0`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:1070
assert_return(() => invoke($12, `check_t0`, [12]), [value("i32", 7)]);

// ./test/core/table_copy.wast:1071
assert_return(() => invoke($12, `check_t0`, [13]), [value("i32", 5)]);

// ./test/core/table_copy.wast:1072
assert_return(() => invoke($12, `check_t0`, [14]), [value("i32", 2)]);

// ./test/core/table_copy.wast:1073
assert_return(() => invoke($12, `check_t0`, [15]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1074
assert_return(() => invoke($12, `check_t0`, [16]), [value("i32", 6)]);

// ./test/core/table_copy.wast:1075
assert_trap(() => invoke($12, `check_t0`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:1076
assert_trap(() => invoke($12, `check_t0`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:1077
assert_trap(() => invoke($12, `check_t0`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:1078
assert_trap(() => invoke($12, `check_t0`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:1079
assert_trap(() => invoke($12, `check_t0`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:1080
assert_trap(() => invoke($12, `check_t0`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:1081
assert_trap(() => invoke($12, `check_t0`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:1082
assert_trap(() => invoke($12, `check_t0`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:1083
assert_return(() => invoke($12, `check_t0`, [25]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1084
assert_return(() => invoke($12, `check_t0`, [26]), [value("i32", 6)]);

// ./test/core/table_copy.wast:1085
assert_trap(() => invoke($12, `check_t0`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:1086
assert_trap(() => invoke($12, `check_t0`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:1087
assert_trap(() => invoke($12, `check_t0`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:1088
assert_trap(() => invoke($12, `check_t1`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:1089
assert_trap(() => invoke($12, `check_t1`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:1090
assert_trap(() => invoke($12, `check_t1`, [2]), `uninitialized element`);

// ./test/core/table_copy.wast:1091
assert_return(() => invoke($12, `check_t1`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1092
assert_return(() => invoke($12, `check_t1`, [4]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1093
assert_return(() => invoke($12, `check_t1`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1094
assert_return(() => invoke($12, `check_t1`, [6]), [value("i32", 4)]);

// ./test/core/table_copy.wast:1095
assert_trap(() => invoke($12, `check_t1`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:1096
assert_trap(() => invoke($12, `check_t1`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:1097
assert_trap(() => invoke($12, `check_t1`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:1098
assert_trap(() => invoke($12, `check_t1`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:1099
assert_return(() => invoke($12, `check_t1`, [11]), [value("i32", 6)]);

// ./test/core/table_copy.wast:1100
assert_return(() => invoke($12, `check_t1`, [12]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1101
assert_return(() => invoke($12, `check_t1`, [13]), [value("i32", 2)]);

// ./test/core/table_copy.wast:1102
assert_return(() => invoke($12, `check_t1`, [14]), [value("i32", 5)]);

// ./test/core/table_copy.wast:1103
assert_return(() => invoke($12, `check_t1`, [15]), [value("i32", 7)]);

// ./test/core/table_copy.wast:1104
assert_trap(() => invoke($12, `check_t1`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:1105
assert_trap(() => invoke($12, `check_t1`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:1106
assert_trap(() => invoke($12, `check_t1`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:1107
assert_trap(() => invoke($12, `check_t1`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:1108
assert_trap(() => invoke($12, `check_t1`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:1109
assert_trap(() => invoke($12, `check_t1`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:1110
assert_trap(() => invoke($12, `check_t1`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:1111
assert_trap(() => invoke($12, `check_t1`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:1112
assert_trap(() => invoke($12, `check_t1`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:1113
assert_trap(() => invoke($12, `check_t1`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:1114
assert_trap(() => invoke($12, `check_t1`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:1115
assert_trap(() => invoke($12, `check_t1`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:1116
assert_trap(() => invoke($12, `check_t1`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:1117
assert_trap(() => invoke($12, `check_t1`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:1119
let $13 = instantiate(`(module
  (type (func (result i32)))  ;; type #0
  (import "a" "ef0" (func (result i32)))    ;; index 0
  (import "a" "ef1" (func (result i32)))
  (import "a" "ef2" (func (result i32)))
  (import "a" "ef3" (func (result i32)))
  (import "a" "ef4" (func (result i32)))    ;; index 4
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t1) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t1) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (elem (table $$t0) (i32.const 3) func 1 3 1 4)
  (elem (table $$t0) (i32.const 11) func 6 3 2 5 7)
  (func (result i32) (i32.const 5))  ;; index 5
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))  ;; index 9
  (func (export "test")
    (table.copy $$t1 $$t1 (i32.const 13) (i32.const 25) (i32.const 3)))
  (func (export "check_t0") (param i32) (result i32)
    (call_indirect $$t1 (type 0) (local.get 0)))
  (func (export "check_t1") (param i32) (result i32)
    (call_indirect $$t0 (type 0) (local.get 0)))
)`);

// ./test/core/table_copy.wast:1149
invoke($13, `test`, []);

// ./test/core/table_copy.wast:1150
assert_trap(() => invoke($13, `check_t0`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:1151
assert_trap(() => invoke($13, `check_t0`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:1152
assert_return(() => invoke($13, `check_t0`, [2]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1153
assert_return(() => invoke($13, `check_t0`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1154
assert_return(() => invoke($13, `check_t0`, [4]), [value("i32", 4)]);

// ./test/core/table_copy.wast:1155
assert_return(() => invoke($13, `check_t0`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1156
assert_trap(() => invoke($13, `check_t0`, [6]), `uninitialized element`);

// ./test/core/table_copy.wast:1157
assert_trap(() => invoke($13, `check_t0`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:1158
assert_trap(() => invoke($13, `check_t0`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:1159
assert_trap(() => invoke($13, `check_t0`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:1160
assert_trap(() => invoke($13, `check_t0`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:1161
assert_trap(() => invoke($13, `check_t0`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:1162
assert_return(() => invoke($13, `check_t0`, [12]), [value("i32", 7)]);

// ./test/core/table_copy.wast:1163
assert_trap(() => invoke($13, `check_t0`, [13]), `uninitialized element`);

// ./test/core/table_copy.wast:1164
assert_trap(() => invoke($13, `check_t0`, [14]), `uninitialized element`);

// ./test/core/table_copy.wast:1165
assert_trap(() => invoke($13, `check_t0`, [15]), `uninitialized element`);

// ./test/core/table_copy.wast:1166
assert_return(() => invoke($13, `check_t0`, [16]), [value("i32", 6)]);

// ./test/core/table_copy.wast:1167
assert_trap(() => invoke($13, `check_t0`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:1168
assert_trap(() => invoke($13, `check_t0`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:1169
assert_trap(() => invoke($13, `check_t0`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:1170
assert_trap(() => invoke($13, `check_t0`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:1171
assert_trap(() => invoke($13, `check_t0`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:1172
assert_trap(() => invoke($13, `check_t0`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:1173
assert_trap(() => invoke($13, `check_t0`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:1174
assert_trap(() => invoke($13, `check_t0`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:1175
assert_trap(() => invoke($13, `check_t0`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:1176
assert_trap(() => invoke($13, `check_t0`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:1177
assert_trap(() => invoke($13, `check_t0`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:1178
assert_trap(() => invoke($13, `check_t0`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:1179
assert_trap(() => invoke($13, `check_t0`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:1180
assert_trap(() => invoke($13, `check_t1`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:1181
assert_trap(() => invoke($13, `check_t1`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:1182
assert_trap(() => invoke($13, `check_t1`, [2]), `uninitialized element`);

// ./test/core/table_copy.wast:1183
assert_return(() => invoke($13, `check_t1`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1184
assert_return(() => invoke($13, `check_t1`, [4]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1185
assert_return(() => invoke($13, `check_t1`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1186
assert_return(() => invoke($13, `check_t1`, [6]), [value("i32", 4)]);

// ./test/core/table_copy.wast:1187
assert_trap(() => invoke($13, `check_t1`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:1188
assert_trap(() => invoke($13, `check_t1`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:1189
assert_trap(() => invoke($13, `check_t1`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:1190
assert_trap(() => invoke($13, `check_t1`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:1191
assert_return(() => invoke($13, `check_t1`, [11]), [value("i32", 6)]);

// ./test/core/table_copy.wast:1192
assert_return(() => invoke($13, `check_t1`, [12]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1193
assert_return(() => invoke($13, `check_t1`, [13]), [value("i32", 2)]);

// ./test/core/table_copy.wast:1194
assert_return(() => invoke($13, `check_t1`, [14]), [value("i32", 5)]);

// ./test/core/table_copy.wast:1195
assert_return(() => invoke($13, `check_t1`, [15]), [value("i32", 7)]);

// ./test/core/table_copy.wast:1196
assert_trap(() => invoke($13, `check_t1`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:1197
assert_trap(() => invoke($13, `check_t1`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:1198
assert_trap(() => invoke($13, `check_t1`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:1199
assert_trap(() => invoke($13, `check_t1`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:1200
assert_trap(() => invoke($13, `check_t1`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:1201
assert_trap(() => invoke($13, `check_t1`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:1202
assert_trap(() => invoke($13, `check_t1`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:1203
assert_trap(() => invoke($13, `check_t1`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:1204
assert_trap(() => invoke($13, `check_t1`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:1205
assert_trap(() => invoke($13, `check_t1`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:1206
assert_trap(() => invoke($13, `check_t1`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:1207
assert_trap(() => invoke($13, `check_t1`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:1208
assert_trap(() => invoke($13, `check_t1`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:1209
assert_trap(() => invoke($13, `check_t1`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:1211
let $14 = instantiate(`(module
  (type (func (result i32)))  ;; type #0
  (import "a" "ef0" (func (result i32)))    ;; index 0
  (import "a" "ef1" (func (result i32)))
  (import "a" "ef2" (func (result i32)))
  (import "a" "ef3" (func (result i32)))
  (import "a" "ef4" (func (result i32)))    ;; index 4
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t1) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t1) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (elem (table $$t0) (i32.const 3) func 1 3 1 4)
  (elem (table $$t0) (i32.const 11) func 6 3 2 5 7)
  (func (result i32) (i32.const 5))  ;; index 5
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))  ;; index 9
  (func (export "test")
    (table.copy $$t1 $$t1 (i32.const 20) (i32.const 22) (i32.const 4)))
  (func (export "check_t0") (param i32) (result i32)
    (call_indirect $$t1 (type 0) (local.get 0)))
  (func (export "check_t1") (param i32) (result i32)
    (call_indirect $$t0 (type 0) (local.get 0)))
)`);

// ./test/core/table_copy.wast:1241
invoke($14, `test`, []);

// ./test/core/table_copy.wast:1242
assert_trap(() => invoke($14, `check_t0`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:1243
assert_trap(() => invoke($14, `check_t0`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:1244
assert_return(() => invoke($14, `check_t0`, [2]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1245
assert_return(() => invoke($14, `check_t0`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1246
assert_return(() => invoke($14, `check_t0`, [4]), [value("i32", 4)]);

// ./test/core/table_copy.wast:1247
assert_return(() => invoke($14, `check_t0`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1248
assert_trap(() => invoke($14, `check_t0`, [6]), `uninitialized element`);

// ./test/core/table_copy.wast:1249
assert_trap(() => invoke($14, `check_t0`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:1250
assert_trap(() => invoke($14, `check_t0`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:1251
assert_trap(() => invoke($14, `check_t0`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:1252
assert_trap(() => invoke($14, `check_t0`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:1253
assert_trap(() => invoke($14, `check_t0`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:1254
assert_return(() => invoke($14, `check_t0`, [12]), [value("i32", 7)]);

// ./test/core/table_copy.wast:1255
assert_return(() => invoke($14, `check_t0`, [13]), [value("i32", 5)]);

// ./test/core/table_copy.wast:1256
assert_return(() => invoke($14, `check_t0`, [14]), [value("i32", 2)]);

// ./test/core/table_copy.wast:1257
assert_return(() => invoke($14, `check_t0`, [15]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1258
assert_return(() => invoke($14, `check_t0`, [16]), [value("i32", 6)]);

// ./test/core/table_copy.wast:1259
assert_trap(() => invoke($14, `check_t0`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:1260
assert_trap(() => invoke($14, `check_t0`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:1261
assert_trap(() => invoke($14, `check_t0`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:1262
assert_trap(() => invoke($14, `check_t0`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:1263
assert_trap(() => invoke($14, `check_t0`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:1264
assert_trap(() => invoke($14, `check_t0`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:1265
assert_trap(() => invoke($14, `check_t0`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:1266
assert_trap(() => invoke($14, `check_t0`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:1267
assert_trap(() => invoke($14, `check_t0`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:1268
assert_trap(() => invoke($14, `check_t0`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:1269
assert_trap(() => invoke($14, `check_t0`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:1270
assert_trap(() => invoke($14, `check_t0`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:1271
assert_trap(() => invoke($14, `check_t0`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:1272
assert_trap(() => invoke($14, `check_t1`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:1273
assert_trap(() => invoke($14, `check_t1`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:1274
assert_trap(() => invoke($14, `check_t1`, [2]), `uninitialized element`);

// ./test/core/table_copy.wast:1275
assert_return(() => invoke($14, `check_t1`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1276
assert_return(() => invoke($14, `check_t1`, [4]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1277
assert_return(() => invoke($14, `check_t1`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1278
assert_return(() => invoke($14, `check_t1`, [6]), [value("i32", 4)]);

// ./test/core/table_copy.wast:1279
assert_trap(() => invoke($14, `check_t1`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:1280
assert_trap(() => invoke($14, `check_t1`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:1281
assert_trap(() => invoke($14, `check_t1`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:1282
assert_trap(() => invoke($14, `check_t1`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:1283
assert_return(() => invoke($14, `check_t1`, [11]), [value("i32", 6)]);

// ./test/core/table_copy.wast:1284
assert_return(() => invoke($14, `check_t1`, [12]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1285
assert_return(() => invoke($14, `check_t1`, [13]), [value("i32", 2)]);

// ./test/core/table_copy.wast:1286
assert_return(() => invoke($14, `check_t1`, [14]), [value("i32", 5)]);

// ./test/core/table_copy.wast:1287
assert_return(() => invoke($14, `check_t1`, [15]), [value("i32", 7)]);

// ./test/core/table_copy.wast:1288
assert_trap(() => invoke($14, `check_t1`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:1289
assert_trap(() => invoke($14, `check_t1`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:1290
assert_trap(() => invoke($14, `check_t1`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:1291
assert_trap(() => invoke($14, `check_t1`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:1292
assert_trap(() => invoke($14, `check_t1`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:1293
assert_trap(() => invoke($14, `check_t1`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:1294
assert_trap(() => invoke($14, `check_t1`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:1295
assert_trap(() => invoke($14, `check_t1`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:1296
assert_trap(() => invoke($14, `check_t1`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:1297
assert_trap(() => invoke($14, `check_t1`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:1298
assert_trap(() => invoke($14, `check_t1`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:1299
assert_trap(() => invoke($14, `check_t1`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:1300
assert_trap(() => invoke($14, `check_t1`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:1301
assert_trap(() => invoke($14, `check_t1`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:1303
let $15 = instantiate(`(module
  (type (func (result i32)))  ;; type #0
  (import "a" "ef0" (func (result i32)))    ;; index 0
  (import "a" "ef1" (func (result i32)))
  (import "a" "ef2" (func (result i32)))
  (import "a" "ef3" (func (result i32)))
  (import "a" "ef4" (func (result i32)))    ;; index 4
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t1) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t1) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (elem (table $$t0) (i32.const 3) func 1 3 1 4)
  (elem (table $$t0) (i32.const 11) func 6 3 2 5 7)
  (func (result i32) (i32.const 5))  ;; index 5
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))  ;; index 9
  (func (export "test")
    (table.copy $$t1 $$t1 (i32.const 25) (i32.const 1) (i32.const 3)))
  (func (export "check_t0") (param i32) (result i32)
    (call_indirect $$t1 (type 0) (local.get 0)))
  (func (export "check_t1") (param i32) (result i32)
    (call_indirect $$t0 (type 0) (local.get 0)))
)`);

// ./test/core/table_copy.wast:1333
invoke($15, `test`, []);

// ./test/core/table_copy.wast:1334
assert_trap(() => invoke($15, `check_t0`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:1335
assert_trap(() => invoke($15, `check_t0`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:1336
assert_return(() => invoke($15, `check_t0`, [2]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1337
assert_return(() => invoke($15, `check_t0`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1338
assert_return(() => invoke($15, `check_t0`, [4]), [value("i32", 4)]);

// ./test/core/table_copy.wast:1339
assert_return(() => invoke($15, `check_t0`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1340
assert_trap(() => invoke($15, `check_t0`, [6]), `uninitialized element`);

// ./test/core/table_copy.wast:1341
assert_trap(() => invoke($15, `check_t0`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:1342
assert_trap(() => invoke($15, `check_t0`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:1343
assert_trap(() => invoke($15, `check_t0`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:1344
assert_trap(() => invoke($15, `check_t0`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:1345
assert_trap(() => invoke($15, `check_t0`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:1346
assert_return(() => invoke($15, `check_t0`, [12]), [value("i32", 7)]);

// ./test/core/table_copy.wast:1347
assert_return(() => invoke($15, `check_t0`, [13]), [value("i32", 5)]);

// ./test/core/table_copy.wast:1348
assert_return(() => invoke($15, `check_t0`, [14]), [value("i32", 2)]);

// ./test/core/table_copy.wast:1349
assert_return(() => invoke($15, `check_t0`, [15]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1350
assert_return(() => invoke($15, `check_t0`, [16]), [value("i32", 6)]);

// ./test/core/table_copy.wast:1351
assert_trap(() => invoke($15, `check_t0`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:1352
assert_trap(() => invoke($15, `check_t0`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:1353
assert_trap(() => invoke($15, `check_t0`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:1354
assert_trap(() => invoke($15, `check_t0`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:1355
assert_trap(() => invoke($15, `check_t0`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:1356
assert_trap(() => invoke($15, `check_t0`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:1357
assert_trap(() => invoke($15, `check_t0`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:1358
assert_trap(() => invoke($15, `check_t0`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:1359
assert_trap(() => invoke($15, `check_t0`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:1360
assert_return(() => invoke($15, `check_t0`, [26]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1361
assert_return(() => invoke($15, `check_t0`, [27]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1362
assert_trap(() => invoke($15, `check_t0`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:1363
assert_trap(() => invoke($15, `check_t0`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:1364
assert_trap(() => invoke($15, `check_t1`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:1365
assert_trap(() => invoke($15, `check_t1`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:1366
assert_trap(() => invoke($15, `check_t1`, [2]), `uninitialized element`);

// ./test/core/table_copy.wast:1367
assert_return(() => invoke($15, `check_t1`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1368
assert_return(() => invoke($15, `check_t1`, [4]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1369
assert_return(() => invoke($15, `check_t1`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1370
assert_return(() => invoke($15, `check_t1`, [6]), [value("i32", 4)]);

// ./test/core/table_copy.wast:1371
assert_trap(() => invoke($15, `check_t1`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:1372
assert_trap(() => invoke($15, `check_t1`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:1373
assert_trap(() => invoke($15, `check_t1`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:1374
assert_trap(() => invoke($15, `check_t1`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:1375
assert_return(() => invoke($15, `check_t1`, [11]), [value("i32", 6)]);

// ./test/core/table_copy.wast:1376
assert_return(() => invoke($15, `check_t1`, [12]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1377
assert_return(() => invoke($15, `check_t1`, [13]), [value("i32", 2)]);

// ./test/core/table_copy.wast:1378
assert_return(() => invoke($15, `check_t1`, [14]), [value("i32", 5)]);

// ./test/core/table_copy.wast:1379
assert_return(() => invoke($15, `check_t1`, [15]), [value("i32", 7)]);

// ./test/core/table_copy.wast:1380
assert_trap(() => invoke($15, `check_t1`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:1381
assert_trap(() => invoke($15, `check_t1`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:1382
assert_trap(() => invoke($15, `check_t1`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:1383
assert_trap(() => invoke($15, `check_t1`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:1384
assert_trap(() => invoke($15, `check_t1`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:1385
assert_trap(() => invoke($15, `check_t1`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:1386
assert_trap(() => invoke($15, `check_t1`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:1387
assert_trap(() => invoke($15, `check_t1`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:1388
assert_trap(() => invoke($15, `check_t1`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:1389
assert_trap(() => invoke($15, `check_t1`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:1390
assert_trap(() => invoke($15, `check_t1`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:1391
assert_trap(() => invoke($15, `check_t1`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:1392
assert_trap(() => invoke($15, `check_t1`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:1393
assert_trap(() => invoke($15, `check_t1`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:1395
let $16 = instantiate(`(module
  (type (func (result i32)))  ;; type #0
  (import "a" "ef0" (func (result i32)))    ;; index 0
  (import "a" "ef1" (func (result i32)))
  (import "a" "ef2" (func (result i32)))
  (import "a" "ef3" (func (result i32)))
  (import "a" "ef4" (func (result i32)))    ;; index 4
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t1) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t1) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (elem (table $$t0) (i32.const 3) func 1 3 1 4)
  (elem (table $$t0) (i32.const 11) func 6 3 2 5 7)
  (func (result i32) (i32.const 5))  ;; index 5
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))  ;; index 9
  (func (export "test")
    (table.copy $$t1 $$t1 (i32.const 10) (i32.const 12) (i32.const 7)))
  (func (export "check_t0") (param i32) (result i32)
    (call_indirect $$t1 (type 0) (local.get 0)))
  (func (export "check_t1") (param i32) (result i32)
    (call_indirect $$t0 (type 0) (local.get 0)))
)`);

// ./test/core/table_copy.wast:1425
invoke($16, `test`, []);

// ./test/core/table_copy.wast:1426
assert_trap(() => invoke($16, `check_t0`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:1427
assert_trap(() => invoke($16, `check_t0`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:1428
assert_return(() => invoke($16, `check_t0`, [2]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1429
assert_return(() => invoke($16, `check_t0`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1430
assert_return(() => invoke($16, `check_t0`, [4]), [value("i32", 4)]);

// ./test/core/table_copy.wast:1431
assert_return(() => invoke($16, `check_t0`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1432
assert_trap(() => invoke($16, `check_t0`, [6]), `uninitialized element`);

// ./test/core/table_copy.wast:1433
assert_trap(() => invoke($16, `check_t0`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:1434
assert_trap(() => invoke($16, `check_t0`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:1435
assert_trap(() => invoke($16, `check_t0`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:1436
assert_return(() => invoke($16, `check_t0`, [10]), [value("i32", 7)]);

// ./test/core/table_copy.wast:1437
assert_return(() => invoke($16, `check_t0`, [11]), [value("i32", 5)]);

// ./test/core/table_copy.wast:1438
assert_return(() => invoke($16, `check_t0`, [12]), [value("i32", 2)]);

// ./test/core/table_copy.wast:1439
assert_return(() => invoke($16, `check_t0`, [13]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1440
assert_return(() => invoke($16, `check_t0`, [14]), [value("i32", 6)]);

// ./test/core/table_copy.wast:1441
assert_trap(() => invoke($16, `check_t0`, [15]), `uninitialized element`);

// ./test/core/table_copy.wast:1442
assert_trap(() => invoke($16, `check_t0`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:1443
assert_trap(() => invoke($16, `check_t0`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:1444
assert_trap(() => invoke($16, `check_t0`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:1445
assert_trap(() => invoke($16, `check_t0`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:1446
assert_trap(() => invoke($16, `check_t0`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:1447
assert_trap(() => invoke($16, `check_t0`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:1448
assert_trap(() => invoke($16, `check_t0`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:1449
assert_trap(() => invoke($16, `check_t0`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:1450
assert_trap(() => invoke($16, `check_t0`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:1451
assert_trap(() => invoke($16, `check_t0`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:1452
assert_trap(() => invoke($16, `check_t0`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:1453
assert_trap(() => invoke($16, `check_t0`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:1454
assert_trap(() => invoke($16, `check_t0`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:1455
assert_trap(() => invoke($16, `check_t0`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:1456
assert_trap(() => invoke($16, `check_t1`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:1457
assert_trap(() => invoke($16, `check_t1`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:1458
assert_trap(() => invoke($16, `check_t1`, [2]), `uninitialized element`);

// ./test/core/table_copy.wast:1459
assert_return(() => invoke($16, `check_t1`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1460
assert_return(() => invoke($16, `check_t1`, [4]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1461
assert_return(() => invoke($16, `check_t1`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1462
assert_return(() => invoke($16, `check_t1`, [6]), [value("i32", 4)]);

// ./test/core/table_copy.wast:1463
assert_trap(() => invoke($16, `check_t1`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:1464
assert_trap(() => invoke($16, `check_t1`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:1465
assert_trap(() => invoke($16, `check_t1`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:1466
assert_trap(() => invoke($16, `check_t1`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:1467
assert_return(() => invoke($16, `check_t1`, [11]), [value("i32", 6)]);

// ./test/core/table_copy.wast:1468
assert_return(() => invoke($16, `check_t1`, [12]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1469
assert_return(() => invoke($16, `check_t1`, [13]), [value("i32", 2)]);

// ./test/core/table_copy.wast:1470
assert_return(() => invoke($16, `check_t1`, [14]), [value("i32", 5)]);

// ./test/core/table_copy.wast:1471
assert_return(() => invoke($16, `check_t1`, [15]), [value("i32", 7)]);

// ./test/core/table_copy.wast:1472
assert_trap(() => invoke($16, `check_t1`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:1473
assert_trap(() => invoke($16, `check_t1`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:1474
assert_trap(() => invoke($16, `check_t1`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:1475
assert_trap(() => invoke($16, `check_t1`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:1476
assert_trap(() => invoke($16, `check_t1`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:1477
assert_trap(() => invoke($16, `check_t1`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:1478
assert_trap(() => invoke($16, `check_t1`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:1479
assert_trap(() => invoke($16, `check_t1`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:1480
assert_trap(() => invoke($16, `check_t1`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:1481
assert_trap(() => invoke($16, `check_t1`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:1482
assert_trap(() => invoke($16, `check_t1`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:1483
assert_trap(() => invoke($16, `check_t1`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:1484
assert_trap(() => invoke($16, `check_t1`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:1485
assert_trap(() => invoke($16, `check_t1`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:1487
let $17 = instantiate(`(module
  (type (func (result i32)))  ;; type #0
  (import "a" "ef0" (func (result i32)))    ;; index 0
  (import "a" "ef1" (func (result i32)))
  (import "a" "ef2" (func (result i32)))
  (import "a" "ef3" (func (result i32)))
  (import "a" "ef4" (func (result i32)))    ;; index 4
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t1) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t1) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (elem (table $$t0) (i32.const 3) func 1 3 1 4)
  (elem (table $$t0) (i32.const 11) func 6 3 2 5 7)
  (func (result i32) (i32.const 5))  ;; index 5
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))  ;; index 9
  (func (export "test")
    (table.copy $$t1 $$t1 (i32.const 12) (i32.const 10) (i32.const 7)))
  (func (export "check_t0") (param i32) (result i32)
    (call_indirect $$t1 (type 0) (local.get 0)))
  (func (export "check_t1") (param i32) (result i32)
    (call_indirect $$t0 (type 0) (local.get 0)))
)`);

// ./test/core/table_copy.wast:1517
invoke($17, `test`, []);

// ./test/core/table_copy.wast:1518
assert_trap(() => invoke($17, `check_t0`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:1519
assert_trap(() => invoke($17, `check_t0`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:1520
assert_return(() => invoke($17, `check_t0`, [2]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1521
assert_return(() => invoke($17, `check_t0`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1522
assert_return(() => invoke($17, `check_t0`, [4]), [value("i32", 4)]);

// ./test/core/table_copy.wast:1523
assert_return(() => invoke($17, `check_t0`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1524
assert_trap(() => invoke($17, `check_t0`, [6]), `uninitialized element`);

// ./test/core/table_copy.wast:1525
assert_trap(() => invoke($17, `check_t0`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:1526
assert_trap(() => invoke($17, `check_t0`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:1527
assert_trap(() => invoke($17, `check_t0`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:1528
assert_trap(() => invoke($17, `check_t0`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:1529
assert_trap(() => invoke($17, `check_t0`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:1530
assert_trap(() => invoke($17, `check_t0`, [12]), `uninitialized element`);

// ./test/core/table_copy.wast:1531
assert_trap(() => invoke($17, `check_t0`, [13]), `uninitialized element`);

// ./test/core/table_copy.wast:1532
assert_return(() => invoke($17, `check_t0`, [14]), [value("i32", 7)]);

// ./test/core/table_copy.wast:1533
assert_return(() => invoke($17, `check_t0`, [15]), [value("i32", 5)]);

// ./test/core/table_copy.wast:1534
assert_return(() => invoke($17, `check_t0`, [16]), [value("i32", 2)]);

// ./test/core/table_copy.wast:1535
assert_return(() => invoke($17, `check_t0`, [17]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1536
assert_return(() => invoke($17, `check_t0`, [18]), [value("i32", 6)]);

// ./test/core/table_copy.wast:1537
assert_trap(() => invoke($17, `check_t0`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:1538
assert_trap(() => invoke($17, `check_t0`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:1539
assert_trap(() => invoke($17, `check_t0`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:1540
assert_trap(() => invoke($17, `check_t0`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:1541
assert_trap(() => invoke($17, `check_t0`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:1542
assert_trap(() => invoke($17, `check_t0`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:1543
assert_trap(() => invoke($17, `check_t0`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:1544
assert_trap(() => invoke($17, `check_t0`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:1545
assert_trap(() => invoke($17, `check_t0`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:1546
assert_trap(() => invoke($17, `check_t0`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:1547
assert_trap(() => invoke($17, `check_t0`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:1548
assert_trap(() => invoke($17, `check_t1`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:1549
assert_trap(() => invoke($17, `check_t1`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:1550
assert_trap(() => invoke($17, `check_t1`, [2]), `uninitialized element`);

// ./test/core/table_copy.wast:1551
assert_return(() => invoke($17, `check_t1`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1552
assert_return(() => invoke($17, `check_t1`, [4]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1553
assert_return(() => invoke($17, `check_t1`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1554
assert_return(() => invoke($17, `check_t1`, [6]), [value("i32", 4)]);

// ./test/core/table_copy.wast:1555
assert_trap(() => invoke($17, `check_t1`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:1556
assert_trap(() => invoke($17, `check_t1`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:1557
assert_trap(() => invoke($17, `check_t1`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:1558
assert_trap(() => invoke($17, `check_t1`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:1559
assert_return(() => invoke($17, `check_t1`, [11]), [value("i32", 6)]);

// ./test/core/table_copy.wast:1560
assert_return(() => invoke($17, `check_t1`, [12]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1561
assert_return(() => invoke($17, `check_t1`, [13]), [value("i32", 2)]);

// ./test/core/table_copy.wast:1562
assert_return(() => invoke($17, `check_t1`, [14]), [value("i32", 5)]);

// ./test/core/table_copy.wast:1563
assert_return(() => invoke($17, `check_t1`, [15]), [value("i32", 7)]);

// ./test/core/table_copy.wast:1564
assert_trap(() => invoke($17, `check_t1`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:1565
assert_trap(() => invoke($17, `check_t1`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:1566
assert_trap(() => invoke($17, `check_t1`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:1567
assert_trap(() => invoke($17, `check_t1`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:1568
assert_trap(() => invoke($17, `check_t1`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:1569
assert_trap(() => invoke($17, `check_t1`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:1570
assert_trap(() => invoke($17, `check_t1`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:1571
assert_trap(() => invoke($17, `check_t1`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:1572
assert_trap(() => invoke($17, `check_t1`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:1573
assert_trap(() => invoke($17, `check_t1`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:1574
assert_trap(() => invoke($17, `check_t1`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:1575
assert_trap(() => invoke($17, `check_t1`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:1576
assert_trap(() => invoke($17, `check_t1`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:1577
assert_trap(() => invoke($17, `check_t1`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:1579
let $18 = instantiate(`(module
  (type (func (result i32)))  ;; type #0
  (import "a" "ef0" (func (result i32)))    ;; index 0
  (import "a" "ef1" (func (result i32)))
  (import "a" "ef2" (func (result i32)))
  (import "a" "ef3" (func (result i32)))
  (import "a" "ef4" (func (result i32)))    ;; index 4
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t1) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t1) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (elem (table $$t0) (i32.const 3) func 1 3 1 4)
  (elem (table $$t0) (i32.const 11) func 6 3 2 5 7)
  (func (result i32) (i32.const 5))  ;; index 5
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))  ;; index 9
  (func (export "test")
    (table.copy $$t0 $$t1 (i32.const 10) (i32.const 0) (i32.const 20)))
  (func (export "check_t0") (param i32) (result i32)
    (call_indirect $$t1 (type 0) (local.get 0)))
  (func (export "check_t1") (param i32) (result i32)
    (call_indirect $$t0 (type 0) (local.get 0)))
)`);

// ./test/core/table_copy.wast:1609
invoke($18, `test`, []);

// ./test/core/table_copy.wast:1610
assert_trap(() => invoke($18, `check_t0`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:1611
assert_trap(() => invoke($18, `check_t0`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:1612
assert_return(() => invoke($18, `check_t0`, [2]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1613
assert_return(() => invoke($18, `check_t0`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1614
assert_return(() => invoke($18, `check_t0`, [4]), [value("i32", 4)]);

// ./test/core/table_copy.wast:1615
assert_return(() => invoke($18, `check_t0`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1616
assert_trap(() => invoke($18, `check_t0`, [6]), `uninitialized element`);

// ./test/core/table_copy.wast:1617
assert_trap(() => invoke($18, `check_t0`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:1618
assert_trap(() => invoke($18, `check_t0`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:1619
assert_trap(() => invoke($18, `check_t0`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:1620
assert_trap(() => invoke($18, `check_t0`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:1621
assert_trap(() => invoke($18, `check_t0`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:1622
assert_return(() => invoke($18, `check_t0`, [12]), [value("i32", 7)]);

// ./test/core/table_copy.wast:1623
assert_return(() => invoke($18, `check_t0`, [13]), [value("i32", 5)]);

// ./test/core/table_copy.wast:1624
assert_return(() => invoke($18, `check_t0`, [14]), [value("i32", 2)]);

// ./test/core/table_copy.wast:1625
assert_return(() => invoke($18, `check_t0`, [15]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1626
assert_return(() => invoke($18, `check_t0`, [16]), [value("i32", 6)]);

// ./test/core/table_copy.wast:1627
assert_trap(() => invoke($18, `check_t0`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:1628
assert_trap(() => invoke($18, `check_t0`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:1629
assert_trap(() => invoke($18, `check_t0`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:1630
assert_trap(() => invoke($18, `check_t0`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:1631
assert_trap(() => invoke($18, `check_t0`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:1632
assert_trap(() => invoke($18, `check_t0`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:1633
assert_trap(() => invoke($18, `check_t0`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:1634
assert_trap(() => invoke($18, `check_t0`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:1635
assert_trap(() => invoke($18, `check_t0`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:1636
assert_trap(() => invoke($18, `check_t0`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:1637
assert_trap(() => invoke($18, `check_t0`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:1638
assert_trap(() => invoke($18, `check_t0`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:1639
assert_trap(() => invoke($18, `check_t0`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:1640
assert_trap(() => invoke($18, `check_t1`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:1641
assert_trap(() => invoke($18, `check_t1`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:1642
assert_trap(() => invoke($18, `check_t1`, [2]), `uninitialized element`);

// ./test/core/table_copy.wast:1643
assert_return(() => invoke($18, `check_t1`, [3]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1644
assert_return(() => invoke($18, `check_t1`, [4]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1645
assert_return(() => invoke($18, `check_t1`, [5]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1646
assert_return(() => invoke($18, `check_t1`, [6]), [value("i32", 4)]);

// ./test/core/table_copy.wast:1647
assert_trap(() => invoke($18, `check_t1`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:1648
assert_trap(() => invoke($18, `check_t1`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:1649
assert_trap(() => invoke($18, `check_t1`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:1650
assert_trap(() => invoke($18, `check_t1`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:1651
assert_trap(() => invoke($18, `check_t1`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:1652
assert_return(() => invoke($18, `check_t1`, [12]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1653
assert_return(() => invoke($18, `check_t1`, [13]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1654
assert_return(() => invoke($18, `check_t1`, [14]), [value("i32", 4)]);

// ./test/core/table_copy.wast:1655
assert_return(() => invoke($18, `check_t1`, [15]), [value("i32", 1)]);

// ./test/core/table_copy.wast:1656
assert_trap(() => invoke($18, `check_t1`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:1657
assert_trap(() => invoke($18, `check_t1`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:1658
assert_trap(() => invoke($18, `check_t1`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:1659
assert_trap(() => invoke($18, `check_t1`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:1660
assert_trap(() => invoke($18, `check_t1`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:1661
assert_trap(() => invoke($18, `check_t1`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:1662
assert_return(() => invoke($18, `check_t1`, [22]), [value("i32", 7)]);

// ./test/core/table_copy.wast:1663
assert_return(() => invoke($18, `check_t1`, [23]), [value("i32", 5)]);

// ./test/core/table_copy.wast:1664
assert_return(() => invoke($18, `check_t1`, [24]), [value("i32", 2)]);

// ./test/core/table_copy.wast:1665
assert_return(() => invoke($18, `check_t1`, [25]), [value("i32", 3)]);

// ./test/core/table_copy.wast:1666
assert_return(() => invoke($18, `check_t1`, [26]), [value("i32", 6)]);

// ./test/core/table_copy.wast:1667
assert_trap(() => invoke($18, `check_t1`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:1668
assert_trap(() => invoke($18, `check_t1`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:1669
assert_trap(() => invoke($18, `check_t1`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:1671
let $19 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (func (result i32) (i32.const 0))
  (func (result i32) (i32.const 1))
  (func (result i32) (i32.const 2))
  (func (result i32) (i32.const 3))
  (func (result i32) (i32.const 4))
  (func (result i32) (i32.const 5))
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))
  (func (export "test")
    (table.copy $$t0 $$t0 (i32.const 28) (i32.const 1) (i32.const 3))
    ))`);

// ./test/core/table_copy.wast:1694
assert_trap(() => invoke($19, `test`, []), `out of bounds table access`);

// ./test/core/table_copy.wast:1696
let $20 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (func (result i32) (i32.const 0))
  (func (result i32) (i32.const 1))
  (func (result i32) (i32.const 2))
  (func (result i32) (i32.const 3))
  (func (result i32) (i32.const 4))
  (func (result i32) (i32.const 5))
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))
  (func (export "test")
    (table.copy $$t0 $$t0 (i32.const 0xFFFFFFFE) (i32.const 1) (i32.const 2))
    ))`);

// ./test/core/table_copy.wast:1719
assert_trap(() => invoke($20, `test`, []), `out of bounds table access`);

// ./test/core/table_copy.wast:1721
let $21 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (func (result i32) (i32.const 0))
  (func (result i32) (i32.const 1))
  (func (result i32) (i32.const 2))
  (func (result i32) (i32.const 3))
  (func (result i32) (i32.const 4))
  (func (result i32) (i32.const 5))
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))
  (func (export "test")
    (table.copy $$t0 $$t0 (i32.const 15) (i32.const 25) (i32.const 6))
    ))`);

// ./test/core/table_copy.wast:1744
assert_trap(() => invoke($21, `test`, []), `out of bounds table access`);

// ./test/core/table_copy.wast:1746
let $22 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (func (result i32) (i32.const 0))
  (func (result i32) (i32.const 1))
  (func (result i32) (i32.const 2))
  (func (result i32) (i32.const 3))
  (func (result i32) (i32.const 4))
  (func (result i32) (i32.const 5))
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))
  (func (export "test")
    (table.copy $$t0 $$t0 (i32.const 15) (i32.const 0xFFFFFFFE) (i32.const 2))
    ))`);

// ./test/core/table_copy.wast:1769
assert_trap(() => invoke($22, `test`, []), `out of bounds table access`);

// ./test/core/table_copy.wast:1771
let $23 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (func (result i32) (i32.const 0))
  (func (result i32) (i32.const 1))
  (func (result i32) (i32.const 2))
  (func (result i32) (i32.const 3))
  (func (result i32) (i32.const 4))
  (func (result i32) (i32.const 5))
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))
  (func (export "test")
    (table.copy $$t0 $$t0 (i32.const 15) (i32.const 25) (i32.const 0))
    ))`);

// ./test/core/table_copy.wast:1794
invoke($23, `test`, []);

// ./test/core/table_copy.wast:1796
let $24 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (func (result i32) (i32.const 0))
  (func (result i32) (i32.const 1))
  (func (result i32) (i32.const 2))
  (func (result i32) (i32.const 3))
  (func (result i32) (i32.const 4))
  (func (result i32) (i32.const 5))
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))
  (func (export "test")
    (table.copy $$t0 $$t0 (i32.const 30) (i32.const 15) (i32.const 0))
    ))`);

// ./test/core/table_copy.wast:1819
invoke($24, `test`, []);

// ./test/core/table_copy.wast:1821
let $25 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (func (result i32) (i32.const 0))
  (func (result i32) (i32.const 1))
  (func (result i32) (i32.const 2))
  (func (result i32) (i32.const 3))
  (func (result i32) (i32.const 4))
  (func (result i32) (i32.const 5))
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))
  (func (export "test")
    (table.copy $$t0 $$t0 (i32.const 31) (i32.const 15) (i32.const 0))
    ))`);

// ./test/core/table_copy.wast:1844
assert_trap(() => invoke($25, `test`, []), `out of bounds table access`);

// ./test/core/table_copy.wast:1846
let $26 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (func (result i32) (i32.const 0))
  (func (result i32) (i32.const 1))
  (func (result i32) (i32.const 2))
  (func (result i32) (i32.const 3))
  (func (result i32) (i32.const 4))
  (func (result i32) (i32.const 5))
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))
  (func (export "test")
    (table.copy $$t0 $$t0 (i32.const 15) (i32.const 30) (i32.const 0))
    ))`);

// ./test/core/table_copy.wast:1869
invoke($26, `test`, []);

// ./test/core/table_copy.wast:1871
let $27 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (func (result i32) (i32.const 0))
  (func (result i32) (i32.const 1))
  (func (result i32) (i32.const 2))
  (func (result i32) (i32.const 3))
  (func (result i32) (i32.const 4))
  (func (result i32) (i32.const 5))
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))
  (func (export "test")
    (table.copy $$t0 $$t0 (i32.const 15) (i32.const 31) (i32.const 0))
    ))`);

// ./test/core/table_copy.wast:1894
assert_trap(() => invoke($27, `test`, []), `out of bounds table access`);

// ./test/core/table_copy.wast:1896
let $28 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (func (result i32) (i32.const 0))
  (func (result i32) (i32.const 1))
  (func (result i32) (i32.const 2))
  (func (result i32) (i32.const 3))
  (func (result i32) (i32.const 4))
  (func (result i32) (i32.const 5))
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))
  (func (export "test")
    (table.copy $$t0 $$t0 (i32.const 30) (i32.const 30) (i32.const 0))
    ))`);

// ./test/core/table_copy.wast:1919
invoke($28, `test`, []);

// ./test/core/table_copy.wast:1921
let $29 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (func (result i32) (i32.const 0))
  (func (result i32) (i32.const 1))
  (func (result i32) (i32.const 2))
  (func (result i32) (i32.const 3))
  (func (result i32) (i32.const 4))
  (func (result i32) (i32.const 5))
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))
  (func (export "test")
    (table.copy $$t0 $$t0 (i32.const 31) (i32.const 31) (i32.const 0))
    ))`);

// ./test/core/table_copy.wast:1944
assert_trap(() => invoke($29, `test`, []), `out of bounds table access`);

// ./test/core/table_copy.wast:1946
let $30 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (func (result i32) (i32.const 0))
  (func (result i32) (i32.const 1))
  (func (result i32) (i32.const 2))
  (func (result i32) (i32.const 3))
  (func (result i32) (i32.const 4))
  (func (result i32) (i32.const 5))
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))
  (func (export "test")
    (table.copy $$t1 $$t0 (i32.const 28) (i32.const 1) (i32.const 3))
    ))`);

// ./test/core/table_copy.wast:1969
assert_trap(() => invoke($30, `test`, []), `out of bounds table access`);

// ./test/core/table_copy.wast:1971
let $31 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (func (result i32) (i32.const 0))
  (func (result i32) (i32.const 1))
  (func (result i32) (i32.const 2))
  (func (result i32) (i32.const 3))
  (func (result i32) (i32.const 4))
  (func (result i32) (i32.const 5))
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))
  (func (export "test")
    (table.copy $$t1 $$t0 (i32.const 0xFFFFFFFE) (i32.const 1) (i32.const 2))
    ))`);

// ./test/core/table_copy.wast:1994
assert_trap(() => invoke($31, `test`, []), `out of bounds table access`);

// ./test/core/table_copy.wast:1996
let $32 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (func (result i32) (i32.const 0))
  (func (result i32) (i32.const 1))
  (func (result i32) (i32.const 2))
  (func (result i32) (i32.const 3))
  (func (result i32) (i32.const 4))
  (func (result i32) (i32.const 5))
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))
  (func (export "test")
    (table.copy $$t1 $$t0 (i32.const 15) (i32.const 25) (i32.const 6))
    ))`);

// ./test/core/table_copy.wast:2019
assert_trap(() => invoke($32, `test`, []), `out of bounds table access`);

// ./test/core/table_copy.wast:2021
let $33 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (func (result i32) (i32.const 0))
  (func (result i32) (i32.const 1))
  (func (result i32) (i32.const 2))
  (func (result i32) (i32.const 3))
  (func (result i32) (i32.const 4))
  (func (result i32) (i32.const 5))
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))
  (func (export "test")
    (table.copy $$t1 $$t0 (i32.const 15) (i32.const 0xFFFFFFFE) (i32.const 2))
    ))`);

// ./test/core/table_copy.wast:2044
assert_trap(() => invoke($33, `test`, []), `out of bounds table access`);

// ./test/core/table_copy.wast:2046
let $34 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (func (result i32) (i32.const 0))
  (func (result i32) (i32.const 1))
  (func (result i32) (i32.const 2))
  (func (result i32) (i32.const 3))
  (func (result i32) (i32.const 4))
  (func (result i32) (i32.const 5))
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))
  (func (export "test")
    (table.copy $$t1 $$t0 (i32.const 15) (i32.const 25) (i32.const 0))
    ))`);

// ./test/core/table_copy.wast:2069
invoke($34, `test`, []);

// ./test/core/table_copy.wast:2071
let $35 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (func (result i32) (i32.const 0))
  (func (result i32) (i32.const 1))
  (func (result i32) (i32.const 2))
  (func (result i32) (i32.const 3))
  (func (result i32) (i32.const 4))
  (func (result i32) (i32.const 5))
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))
  (func (export "test")
    (table.copy $$t1 $$t0 (i32.const 30) (i32.const 15) (i32.const 0))
    ))`);

// ./test/core/table_copy.wast:2094
invoke($35, `test`, []);

// ./test/core/table_copy.wast:2096
let $36 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (func (result i32) (i32.const 0))
  (func (result i32) (i32.const 1))
  (func (result i32) (i32.const 2))
  (func (result i32) (i32.const 3))
  (func (result i32) (i32.const 4))
  (func (result i32) (i32.const 5))
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))
  (func (export "test")
    (table.copy $$t1 $$t0 (i32.const 31) (i32.const 15) (i32.const 0))
    ))`);

// ./test/core/table_copy.wast:2119
assert_trap(() => invoke($36, `test`, []), `out of bounds table access`);

// ./test/core/table_copy.wast:2121
let $37 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (func (result i32) (i32.const 0))
  (func (result i32) (i32.const 1))
  (func (result i32) (i32.const 2))
  (func (result i32) (i32.const 3))
  (func (result i32) (i32.const 4))
  (func (result i32) (i32.const 5))
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))
  (func (export "test")
    (table.copy $$t1 $$t0 (i32.const 15) (i32.const 30) (i32.const 0))
    ))`);

// ./test/core/table_copy.wast:2144
invoke($37, `test`, []);

// ./test/core/table_copy.wast:2146
let $38 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (func (result i32) (i32.const 0))
  (func (result i32) (i32.const 1))
  (func (result i32) (i32.const 2))
  (func (result i32) (i32.const 3))
  (func (result i32) (i32.const 4))
  (func (result i32) (i32.const 5))
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))
  (func (export "test")
    (table.copy $$t1 $$t0 (i32.const 15) (i32.const 31) (i32.const 0))
    ))`);

// ./test/core/table_copy.wast:2169
assert_trap(() => invoke($38, `test`, []), `out of bounds table access`);

// ./test/core/table_copy.wast:2171
let $39 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (func (result i32) (i32.const 0))
  (func (result i32) (i32.const 1))
  (func (result i32) (i32.const 2))
  (func (result i32) (i32.const 3))
  (func (result i32) (i32.const 4))
  (func (result i32) (i32.const 5))
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))
  (func (export "test")
    (table.copy $$t1 $$t0 (i32.const 30) (i32.const 30) (i32.const 0))
    ))`);

// ./test/core/table_copy.wast:2194
invoke($39, `test`, []);

// ./test/core/table_copy.wast:2196
let $40 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 30 30 funcref)
  (elem (table $$t0) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t0) (i32.const 12) func 7 5 2 3 6)
  (elem funcref
    (ref.func 5) (ref.func 9) (ref.func 2) (ref.func 7) (ref.func 6))
  (func (result i32) (i32.const 0))
  (func (result i32) (i32.const 1))
  (func (result i32) (i32.const 2))
  (func (result i32) (i32.const 3))
  (func (result i32) (i32.const 4))
  (func (result i32) (i32.const 5))
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))
  (func (export "test")
    (table.copy $$t1 $$t0 (i32.const 31) (i32.const 31) (i32.const 0))
    ))`);

// ./test/core/table_copy.wast:2219
assert_trap(() => invoke($40, `test`, []), `out of bounds table access`);

// ./test/core/table_copy.wast:2221
let $41 = instantiate(`(module
  (type (func (result i32)))
  (table 32 64 funcref)
  (elem (i32.const 0)
         $$f0 $$f1 $$f2 $$f3 $$f4 $$f5 $$f6 $$f7)
  (func $$f0 (export "f0") (result i32) (i32.const 0))
  (func $$f1 (export "f1") (result i32) (i32.const 1))
  (func $$f2 (export "f2") (result i32) (i32.const 2))
  (func $$f3 (export "f3") (result i32) (i32.const 3))
  (func $$f4 (export "f4") (result i32) (i32.const 4))
  (func $$f5 (export "f5") (result i32) (i32.const 5))
  (func $$f6 (export "f6") (result i32) (i32.const 6))
  (func $$f7 (export "f7") (result i32) (i32.const 7))
  (func $$f8 (export "f8") (result i32) (i32.const 8))
  (func $$f9 (export "f9") (result i32) (i32.const 9))
  (func $$f10 (export "f10") (result i32) (i32.const 10))
  (func $$f11 (export "f11") (result i32) (i32.const 11))
  (func $$f12 (export "f12") (result i32) (i32.const 12))
  (func $$f13 (export "f13") (result i32) (i32.const 13))
  (func $$f14 (export "f14") (result i32) (i32.const 14))
  (func $$f15 (export "f15") (result i32) (i32.const 15))
  (func (export "test") (param $$n i32) (result i32)
    (call_indirect (type 0) (local.get $$n)))
  (func (export "run") (param $$targetOffs i32) (param $$srcOffs i32) (param $$len i32)
    (table.copy (local.get $$targetOffs) (local.get $$srcOffs) (local.get $$len))))`);

// ./test/core/table_copy.wast:2247
assert_trap(() => invoke($41, `run`, [24, 0, 16]), `out of bounds table access`);

// ./test/core/table_copy.wast:2249
assert_return(() => invoke($41, `test`, [0]), [value("i32", 0)]);

// ./test/core/table_copy.wast:2250
assert_return(() => invoke($41, `test`, [1]), [value("i32", 1)]);

// ./test/core/table_copy.wast:2251
assert_return(() => invoke($41, `test`, [2]), [value("i32", 2)]);

// ./test/core/table_copy.wast:2252
assert_return(() => invoke($41, `test`, [3]), [value("i32", 3)]);

// ./test/core/table_copy.wast:2253
assert_return(() => invoke($41, `test`, [4]), [value("i32", 4)]);

// ./test/core/table_copy.wast:2254
assert_return(() => invoke($41, `test`, [5]), [value("i32", 5)]);

// ./test/core/table_copy.wast:2255
assert_return(() => invoke($41, `test`, [6]), [value("i32", 6)]);

// ./test/core/table_copy.wast:2256
assert_return(() => invoke($41, `test`, [7]), [value("i32", 7)]);

// ./test/core/table_copy.wast:2257
assert_trap(() => invoke($41, `test`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:2258
assert_trap(() => invoke($41, `test`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:2259
assert_trap(() => invoke($41, `test`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:2260
assert_trap(() => invoke($41, `test`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:2261
assert_trap(() => invoke($41, `test`, [12]), `uninitialized element`);

// ./test/core/table_copy.wast:2262
assert_trap(() => invoke($41, `test`, [13]), `uninitialized element`);

// ./test/core/table_copy.wast:2263
assert_trap(() => invoke($41, `test`, [14]), `uninitialized element`);

// ./test/core/table_copy.wast:2264
assert_trap(() => invoke($41, `test`, [15]), `uninitialized element`);

// ./test/core/table_copy.wast:2265
assert_trap(() => invoke($41, `test`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:2266
assert_trap(() => invoke($41, `test`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:2267
assert_trap(() => invoke($41, `test`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:2268
assert_trap(() => invoke($41, `test`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:2269
assert_trap(() => invoke($41, `test`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:2270
assert_trap(() => invoke($41, `test`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:2271
assert_trap(() => invoke($41, `test`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:2272
assert_trap(() => invoke($41, `test`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:2273
assert_trap(() => invoke($41, `test`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:2274
assert_trap(() => invoke($41, `test`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:2275
assert_trap(() => invoke($41, `test`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:2276
assert_trap(() => invoke($41, `test`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:2277
assert_trap(() => invoke($41, `test`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:2278
assert_trap(() => invoke($41, `test`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:2279
assert_trap(() => invoke($41, `test`, [30]), `uninitialized element`);

// ./test/core/table_copy.wast:2280
assert_trap(() => invoke($41, `test`, [31]), `uninitialized element`);

// ./test/core/table_copy.wast:2282
let $42 = instantiate(`(module
  (type (func (result i32)))
  (table 32 64 funcref)
  (elem (i32.const 0)
         $$f0 $$f1 $$f2 $$f3 $$f4 $$f5 $$f6 $$f7 $$f8)
  (func $$f0 (export "f0") (result i32) (i32.const 0))
  (func $$f1 (export "f1") (result i32) (i32.const 1))
  (func $$f2 (export "f2") (result i32) (i32.const 2))
  (func $$f3 (export "f3") (result i32) (i32.const 3))
  (func $$f4 (export "f4") (result i32) (i32.const 4))
  (func $$f5 (export "f5") (result i32) (i32.const 5))
  (func $$f6 (export "f6") (result i32) (i32.const 6))
  (func $$f7 (export "f7") (result i32) (i32.const 7))
  (func $$f8 (export "f8") (result i32) (i32.const 8))
  (func $$f9 (export "f9") (result i32) (i32.const 9))
  (func $$f10 (export "f10") (result i32) (i32.const 10))
  (func $$f11 (export "f11") (result i32) (i32.const 11))
  (func $$f12 (export "f12") (result i32) (i32.const 12))
  (func $$f13 (export "f13") (result i32) (i32.const 13))
  (func $$f14 (export "f14") (result i32) (i32.const 14))
  (func $$f15 (export "f15") (result i32) (i32.const 15))
  (func (export "test") (param $$n i32) (result i32)
    (call_indirect (type 0) (local.get $$n)))
  (func (export "run") (param $$targetOffs i32) (param $$srcOffs i32) (param $$len i32)
    (table.copy (local.get $$targetOffs) (local.get $$srcOffs) (local.get $$len))))`);

// ./test/core/table_copy.wast:2308
assert_trap(() => invoke($42, `run`, [23, 0, 15]), `out of bounds table access`);

// ./test/core/table_copy.wast:2310
assert_return(() => invoke($42, `test`, [0]), [value("i32", 0)]);

// ./test/core/table_copy.wast:2311
assert_return(() => invoke($42, `test`, [1]), [value("i32", 1)]);

// ./test/core/table_copy.wast:2312
assert_return(() => invoke($42, `test`, [2]), [value("i32", 2)]);

// ./test/core/table_copy.wast:2313
assert_return(() => invoke($42, `test`, [3]), [value("i32", 3)]);

// ./test/core/table_copy.wast:2314
assert_return(() => invoke($42, `test`, [4]), [value("i32", 4)]);

// ./test/core/table_copy.wast:2315
assert_return(() => invoke($42, `test`, [5]), [value("i32", 5)]);

// ./test/core/table_copy.wast:2316
assert_return(() => invoke($42, `test`, [6]), [value("i32", 6)]);

// ./test/core/table_copy.wast:2317
assert_return(() => invoke($42, `test`, [7]), [value("i32", 7)]);

// ./test/core/table_copy.wast:2318
assert_return(() => invoke($42, `test`, [8]), [value("i32", 8)]);

// ./test/core/table_copy.wast:2319
assert_trap(() => invoke($42, `test`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:2320
assert_trap(() => invoke($42, `test`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:2321
assert_trap(() => invoke($42, `test`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:2322
assert_trap(() => invoke($42, `test`, [12]), `uninitialized element`);

// ./test/core/table_copy.wast:2323
assert_trap(() => invoke($42, `test`, [13]), `uninitialized element`);

// ./test/core/table_copy.wast:2324
assert_trap(() => invoke($42, `test`, [14]), `uninitialized element`);

// ./test/core/table_copy.wast:2325
assert_trap(() => invoke($42, `test`, [15]), `uninitialized element`);

// ./test/core/table_copy.wast:2326
assert_trap(() => invoke($42, `test`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:2327
assert_trap(() => invoke($42, `test`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:2328
assert_trap(() => invoke($42, `test`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:2329
assert_trap(() => invoke($42, `test`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:2330
assert_trap(() => invoke($42, `test`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:2331
assert_trap(() => invoke($42, `test`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:2332
assert_trap(() => invoke($42, `test`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:2333
assert_trap(() => invoke($42, `test`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:2334
assert_trap(() => invoke($42, `test`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:2335
assert_trap(() => invoke($42, `test`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:2336
assert_trap(() => invoke($42, `test`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:2337
assert_trap(() => invoke($42, `test`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:2338
assert_trap(() => invoke($42, `test`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:2339
assert_trap(() => invoke($42, `test`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:2340
assert_trap(() => invoke($42, `test`, [30]), `uninitialized element`);

// ./test/core/table_copy.wast:2341
assert_trap(() => invoke($42, `test`, [31]), `uninitialized element`);

// ./test/core/table_copy.wast:2343
let $43 = instantiate(`(module
  (type (func (result i32)))
  (table 32 64 funcref)
  (elem (i32.const 24)
         $$f0 $$f1 $$f2 $$f3 $$f4 $$f5 $$f6 $$f7)
  (func $$f0 (export "f0") (result i32) (i32.const 0))
  (func $$f1 (export "f1") (result i32) (i32.const 1))
  (func $$f2 (export "f2") (result i32) (i32.const 2))
  (func $$f3 (export "f3") (result i32) (i32.const 3))
  (func $$f4 (export "f4") (result i32) (i32.const 4))
  (func $$f5 (export "f5") (result i32) (i32.const 5))
  (func $$f6 (export "f6") (result i32) (i32.const 6))
  (func $$f7 (export "f7") (result i32) (i32.const 7))
  (func $$f8 (export "f8") (result i32) (i32.const 8))
  (func $$f9 (export "f9") (result i32) (i32.const 9))
  (func $$f10 (export "f10") (result i32) (i32.const 10))
  (func $$f11 (export "f11") (result i32) (i32.const 11))
  (func $$f12 (export "f12") (result i32) (i32.const 12))
  (func $$f13 (export "f13") (result i32) (i32.const 13))
  (func $$f14 (export "f14") (result i32) (i32.const 14))
  (func $$f15 (export "f15") (result i32) (i32.const 15))
  (func (export "test") (param $$n i32) (result i32)
    (call_indirect (type 0) (local.get $$n)))
  (func (export "run") (param $$targetOffs i32) (param $$srcOffs i32) (param $$len i32)
    (table.copy (local.get $$targetOffs) (local.get $$srcOffs) (local.get $$len))))`);

// ./test/core/table_copy.wast:2369
assert_trap(() => invoke($43, `run`, [0, 24, 16]), `out of bounds table access`);

// ./test/core/table_copy.wast:2371
assert_trap(() => invoke($43, `test`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:2372
assert_trap(() => invoke($43, `test`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:2373
assert_trap(() => invoke($43, `test`, [2]), `uninitialized element`);

// ./test/core/table_copy.wast:2374
assert_trap(() => invoke($43, `test`, [3]), `uninitialized element`);

// ./test/core/table_copy.wast:2375
assert_trap(() => invoke($43, `test`, [4]), `uninitialized element`);

// ./test/core/table_copy.wast:2376
assert_trap(() => invoke($43, `test`, [5]), `uninitialized element`);

// ./test/core/table_copy.wast:2377
assert_trap(() => invoke($43, `test`, [6]), `uninitialized element`);

// ./test/core/table_copy.wast:2378
assert_trap(() => invoke($43, `test`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:2379
assert_trap(() => invoke($43, `test`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:2380
assert_trap(() => invoke($43, `test`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:2381
assert_trap(() => invoke($43, `test`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:2382
assert_trap(() => invoke($43, `test`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:2383
assert_trap(() => invoke($43, `test`, [12]), `uninitialized element`);

// ./test/core/table_copy.wast:2384
assert_trap(() => invoke($43, `test`, [13]), `uninitialized element`);

// ./test/core/table_copy.wast:2385
assert_trap(() => invoke($43, `test`, [14]), `uninitialized element`);

// ./test/core/table_copy.wast:2386
assert_trap(() => invoke($43, `test`, [15]), `uninitialized element`);

// ./test/core/table_copy.wast:2387
assert_trap(() => invoke($43, `test`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:2388
assert_trap(() => invoke($43, `test`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:2389
assert_trap(() => invoke($43, `test`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:2390
assert_trap(() => invoke($43, `test`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:2391
assert_trap(() => invoke($43, `test`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:2392
assert_trap(() => invoke($43, `test`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:2393
assert_trap(() => invoke($43, `test`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:2394
assert_trap(() => invoke($43, `test`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:2395
assert_return(() => invoke($43, `test`, [24]), [value("i32", 0)]);

// ./test/core/table_copy.wast:2396
assert_return(() => invoke($43, `test`, [25]), [value("i32", 1)]);

// ./test/core/table_copy.wast:2397
assert_return(() => invoke($43, `test`, [26]), [value("i32", 2)]);

// ./test/core/table_copy.wast:2398
assert_return(() => invoke($43, `test`, [27]), [value("i32", 3)]);

// ./test/core/table_copy.wast:2399
assert_return(() => invoke($43, `test`, [28]), [value("i32", 4)]);

// ./test/core/table_copy.wast:2400
assert_return(() => invoke($43, `test`, [29]), [value("i32", 5)]);

// ./test/core/table_copy.wast:2401
assert_return(() => invoke($43, `test`, [30]), [value("i32", 6)]);

// ./test/core/table_copy.wast:2402
assert_return(() => invoke($43, `test`, [31]), [value("i32", 7)]);

// ./test/core/table_copy.wast:2404
let $44 = instantiate(`(module
  (type (func (result i32)))
  (table 32 64 funcref)
  (elem (i32.const 23)
         $$f0 $$f1 $$f2 $$f3 $$f4 $$f5 $$f6 $$f7 $$f8)
  (func $$f0 (export "f0") (result i32) (i32.const 0))
  (func $$f1 (export "f1") (result i32) (i32.const 1))
  (func $$f2 (export "f2") (result i32) (i32.const 2))
  (func $$f3 (export "f3") (result i32) (i32.const 3))
  (func $$f4 (export "f4") (result i32) (i32.const 4))
  (func $$f5 (export "f5") (result i32) (i32.const 5))
  (func $$f6 (export "f6") (result i32) (i32.const 6))
  (func $$f7 (export "f7") (result i32) (i32.const 7))
  (func $$f8 (export "f8") (result i32) (i32.const 8))
  (func $$f9 (export "f9") (result i32) (i32.const 9))
  (func $$f10 (export "f10") (result i32) (i32.const 10))
  (func $$f11 (export "f11") (result i32) (i32.const 11))
  (func $$f12 (export "f12") (result i32) (i32.const 12))
  (func $$f13 (export "f13") (result i32) (i32.const 13))
  (func $$f14 (export "f14") (result i32) (i32.const 14))
  (func $$f15 (export "f15") (result i32) (i32.const 15))
  (func (export "test") (param $$n i32) (result i32)
    (call_indirect (type 0) (local.get $$n)))
  (func (export "run") (param $$targetOffs i32) (param $$srcOffs i32) (param $$len i32)
    (table.copy (local.get $$targetOffs) (local.get $$srcOffs) (local.get $$len))))`);

// ./test/core/table_copy.wast:2430
assert_trap(() => invoke($44, `run`, [0, 23, 15]), `out of bounds table access`);

// ./test/core/table_copy.wast:2432
assert_trap(() => invoke($44, `test`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:2433
assert_trap(() => invoke($44, `test`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:2434
assert_trap(() => invoke($44, `test`, [2]), `uninitialized element`);

// ./test/core/table_copy.wast:2435
assert_trap(() => invoke($44, `test`, [3]), `uninitialized element`);

// ./test/core/table_copy.wast:2436
assert_trap(() => invoke($44, `test`, [4]), `uninitialized element`);

// ./test/core/table_copy.wast:2437
assert_trap(() => invoke($44, `test`, [5]), `uninitialized element`);

// ./test/core/table_copy.wast:2438
assert_trap(() => invoke($44, `test`, [6]), `uninitialized element`);

// ./test/core/table_copy.wast:2439
assert_trap(() => invoke($44, `test`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:2440
assert_trap(() => invoke($44, `test`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:2441
assert_trap(() => invoke($44, `test`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:2442
assert_trap(() => invoke($44, `test`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:2443
assert_trap(() => invoke($44, `test`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:2444
assert_trap(() => invoke($44, `test`, [12]), `uninitialized element`);

// ./test/core/table_copy.wast:2445
assert_trap(() => invoke($44, `test`, [13]), `uninitialized element`);

// ./test/core/table_copy.wast:2446
assert_trap(() => invoke($44, `test`, [14]), `uninitialized element`);

// ./test/core/table_copy.wast:2447
assert_trap(() => invoke($44, `test`, [15]), `uninitialized element`);

// ./test/core/table_copy.wast:2448
assert_trap(() => invoke($44, `test`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:2449
assert_trap(() => invoke($44, `test`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:2450
assert_trap(() => invoke($44, `test`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:2451
assert_trap(() => invoke($44, `test`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:2452
assert_trap(() => invoke($44, `test`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:2453
assert_trap(() => invoke($44, `test`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:2454
assert_trap(() => invoke($44, `test`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:2455
assert_return(() => invoke($44, `test`, [23]), [value("i32", 0)]);

// ./test/core/table_copy.wast:2456
assert_return(() => invoke($44, `test`, [24]), [value("i32", 1)]);

// ./test/core/table_copy.wast:2457
assert_return(() => invoke($44, `test`, [25]), [value("i32", 2)]);

// ./test/core/table_copy.wast:2458
assert_return(() => invoke($44, `test`, [26]), [value("i32", 3)]);

// ./test/core/table_copy.wast:2459
assert_return(() => invoke($44, `test`, [27]), [value("i32", 4)]);

// ./test/core/table_copy.wast:2460
assert_return(() => invoke($44, `test`, [28]), [value("i32", 5)]);

// ./test/core/table_copy.wast:2461
assert_return(() => invoke($44, `test`, [29]), [value("i32", 6)]);

// ./test/core/table_copy.wast:2462
assert_return(() => invoke($44, `test`, [30]), [value("i32", 7)]);

// ./test/core/table_copy.wast:2463
assert_return(() => invoke($44, `test`, [31]), [value("i32", 8)]);

// ./test/core/table_copy.wast:2465
let $45 = instantiate(`(module
  (type (func (result i32)))
  (table 32 64 funcref)
  (elem (i32.const 11)
         $$f0 $$f1 $$f2 $$f3 $$f4 $$f5 $$f6 $$f7)
  (func $$f0 (export "f0") (result i32) (i32.const 0))
  (func $$f1 (export "f1") (result i32) (i32.const 1))
  (func $$f2 (export "f2") (result i32) (i32.const 2))
  (func $$f3 (export "f3") (result i32) (i32.const 3))
  (func $$f4 (export "f4") (result i32) (i32.const 4))
  (func $$f5 (export "f5") (result i32) (i32.const 5))
  (func $$f6 (export "f6") (result i32) (i32.const 6))
  (func $$f7 (export "f7") (result i32) (i32.const 7))
  (func $$f8 (export "f8") (result i32) (i32.const 8))
  (func $$f9 (export "f9") (result i32) (i32.const 9))
  (func $$f10 (export "f10") (result i32) (i32.const 10))
  (func $$f11 (export "f11") (result i32) (i32.const 11))
  (func $$f12 (export "f12") (result i32) (i32.const 12))
  (func $$f13 (export "f13") (result i32) (i32.const 13))
  (func $$f14 (export "f14") (result i32) (i32.const 14))
  (func $$f15 (export "f15") (result i32) (i32.const 15))
  (func (export "test") (param $$n i32) (result i32)
    (call_indirect (type 0) (local.get $$n)))
  (func (export "run") (param $$targetOffs i32) (param $$srcOffs i32) (param $$len i32)
    (table.copy (local.get $$targetOffs) (local.get $$srcOffs) (local.get $$len))))`);

// ./test/core/table_copy.wast:2491
assert_trap(() => invoke($45, `run`, [24, 11, 16]), `out of bounds table access`);

// ./test/core/table_copy.wast:2493
assert_trap(() => invoke($45, `test`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:2494
assert_trap(() => invoke($45, `test`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:2495
assert_trap(() => invoke($45, `test`, [2]), `uninitialized element`);

// ./test/core/table_copy.wast:2496
assert_trap(() => invoke($45, `test`, [3]), `uninitialized element`);

// ./test/core/table_copy.wast:2497
assert_trap(() => invoke($45, `test`, [4]), `uninitialized element`);

// ./test/core/table_copy.wast:2498
assert_trap(() => invoke($45, `test`, [5]), `uninitialized element`);

// ./test/core/table_copy.wast:2499
assert_trap(() => invoke($45, `test`, [6]), `uninitialized element`);

// ./test/core/table_copy.wast:2500
assert_trap(() => invoke($45, `test`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:2501
assert_trap(() => invoke($45, `test`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:2502
assert_trap(() => invoke($45, `test`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:2503
assert_trap(() => invoke($45, `test`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:2504
assert_return(() => invoke($45, `test`, [11]), [value("i32", 0)]);

// ./test/core/table_copy.wast:2505
assert_return(() => invoke($45, `test`, [12]), [value("i32", 1)]);

// ./test/core/table_copy.wast:2506
assert_return(() => invoke($45, `test`, [13]), [value("i32", 2)]);

// ./test/core/table_copy.wast:2507
assert_return(() => invoke($45, `test`, [14]), [value("i32", 3)]);

// ./test/core/table_copy.wast:2508
assert_return(() => invoke($45, `test`, [15]), [value("i32", 4)]);

// ./test/core/table_copy.wast:2509
assert_return(() => invoke($45, `test`, [16]), [value("i32", 5)]);

// ./test/core/table_copy.wast:2510
assert_return(() => invoke($45, `test`, [17]), [value("i32", 6)]);

// ./test/core/table_copy.wast:2511
assert_return(() => invoke($45, `test`, [18]), [value("i32", 7)]);

// ./test/core/table_copy.wast:2512
assert_trap(() => invoke($45, `test`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:2513
assert_trap(() => invoke($45, `test`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:2514
assert_trap(() => invoke($45, `test`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:2515
assert_trap(() => invoke($45, `test`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:2516
assert_trap(() => invoke($45, `test`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:2517
assert_trap(() => invoke($45, `test`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:2518
assert_trap(() => invoke($45, `test`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:2519
assert_trap(() => invoke($45, `test`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:2520
assert_trap(() => invoke($45, `test`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:2521
assert_trap(() => invoke($45, `test`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:2522
assert_trap(() => invoke($45, `test`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:2523
assert_trap(() => invoke($45, `test`, [30]), `uninitialized element`);

// ./test/core/table_copy.wast:2524
assert_trap(() => invoke($45, `test`, [31]), `uninitialized element`);

// ./test/core/table_copy.wast:2526
let $46 = instantiate(`(module
  (type (func (result i32)))
  (table 32 64 funcref)
  (elem (i32.const 24)
         $$f0 $$f1 $$f2 $$f3 $$f4 $$f5 $$f6 $$f7)
  (func $$f0 (export "f0") (result i32) (i32.const 0))
  (func $$f1 (export "f1") (result i32) (i32.const 1))
  (func $$f2 (export "f2") (result i32) (i32.const 2))
  (func $$f3 (export "f3") (result i32) (i32.const 3))
  (func $$f4 (export "f4") (result i32) (i32.const 4))
  (func $$f5 (export "f5") (result i32) (i32.const 5))
  (func $$f6 (export "f6") (result i32) (i32.const 6))
  (func $$f7 (export "f7") (result i32) (i32.const 7))
  (func $$f8 (export "f8") (result i32) (i32.const 8))
  (func $$f9 (export "f9") (result i32) (i32.const 9))
  (func $$f10 (export "f10") (result i32) (i32.const 10))
  (func $$f11 (export "f11") (result i32) (i32.const 11))
  (func $$f12 (export "f12") (result i32) (i32.const 12))
  (func $$f13 (export "f13") (result i32) (i32.const 13))
  (func $$f14 (export "f14") (result i32) (i32.const 14))
  (func $$f15 (export "f15") (result i32) (i32.const 15))
  (func (export "test") (param $$n i32) (result i32)
    (call_indirect (type 0) (local.get $$n)))
  (func (export "run") (param $$targetOffs i32) (param $$srcOffs i32) (param $$len i32)
    (table.copy (local.get $$targetOffs) (local.get $$srcOffs) (local.get $$len))))`);

// ./test/core/table_copy.wast:2552
assert_trap(() => invoke($46, `run`, [11, 24, 16]), `out of bounds table access`);

// ./test/core/table_copy.wast:2554
assert_trap(() => invoke($46, `test`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:2555
assert_trap(() => invoke($46, `test`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:2556
assert_trap(() => invoke($46, `test`, [2]), `uninitialized element`);

// ./test/core/table_copy.wast:2557
assert_trap(() => invoke($46, `test`, [3]), `uninitialized element`);

// ./test/core/table_copy.wast:2558
assert_trap(() => invoke($46, `test`, [4]), `uninitialized element`);

// ./test/core/table_copy.wast:2559
assert_trap(() => invoke($46, `test`, [5]), `uninitialized element`);

// ./test/core/table_copy.wast:2560
assert_trap(() => invoke($46, `test`, [6]), `uninitialized element`);

// ./test/core/table_copy.wast:2561
assert_trap(() => invoke($46, `test`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:2562
assert_trap(() => invoke($46, `test`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:2563
assert_trap(() => invoke($46, `test`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:2564
assert_trap(() => invoke($46, `test`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:2565
assert_trap(() => invoke($46, `test`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:2566
assert_trap(() => invoke($46, `test`, [12]), `uninitialized element`);

// ./test/core/table_copy.wast:2567
assert_trap(() => invoke($46, `test`, [13]), `uninitialized element`);

// ./test/core/table_copy.wast:2568
assert_trap(() => invoke($46, `test`, [14]), `uninitialized element`);

// ./test/core/table_copy.wast:2569
assert_trap(() => invoke($46, `test`, [15]), `uninitialized element`);

// ./test/core/table_copy.wast:2570
assert_trap(() => invoke($46, `test`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:2571
assert_trap(() => invoke($46, `test`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:2572
assert_trap(() => invoke($46, `test`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:2573
assert_trap(() => invoke($46, `test`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:2574
assert_trap(() => invoke($46, `test`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:2575
assert_trap(() => invoke($46, `test`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:2576
assert_trap(() => invoke($46, `test`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:2577
assert_trap(() => invoke($46, `test`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:2578
assert_return(() => invoke($46, `test`, [24]), [value("i32", 0)]);

// ./test/core/table_copy.wast:2579
assert_return(() => invoke($46, `test`, [25]), [value("i32", 1)]);

// ./test/core/table_copy.wast:2580
assert_return(() => invoke($46, `test`, [26]), [value("i32", 2)]);

// ./test/core/table_copy.wast:2581
assert_return(() => invoke($46, `test`, [27]), [value("i32", 3)]);

// ./test/core/table_copy.wast:2582
assert_return(() => invoke($46, `test`, [28]), [value("i32", 4)]);

// ./test/core/table_copy.wast:2583
assert_return(() => invoke($46, `test`, [29]), [value("i32", 5)]);

// ./test/core/table_copy.wast:2584
assert_return(() => invoke($46, `test`, [30]), [value("i32", 6)]);

// ./test/core/table_copy.wast:2585
assert_return(() => invoke($46, `test`, [31]), [value("i32", 7)]);

// ./test/core/table_copy.wast:2587
let $47 = instantiate(`(module
  (type (func (result i32)))
  (table 32 64 funcref)
  (elem (i32.const 21)
         $$f0 $$f1 $$f2 $$f3 $$f4 $$f5 $$f6 $$f7)
  (func $$f0 (export "f0") (result i32) (i32.const 0))
  (func $$f1 (export "f1") (result i32) (i32.const 1))
  (func $$f2 (export "f2") (result i32) (i32.const 2))
  (func $$f3 (export "f3") (result i32) (i32.const 3))
  (func $$f4 (export "f4") (result i32) (i32.const 4))
  (func $$f5 (export "f5") (result i32) (i32.const 5))
  (func $$f6 (export "f6") (result i32) (i32.const 6))
  (func $$f7 (export "f7") (result i32) (i32.const 7))
  (func $$f8 (export "f8") (result i32) (i32.const 8))
  (func $$f9 (export "f9") (result i32) (i32.const 9))
  (func $$f10 (export "f10") (result i32) (i32.const 10))
  (func $$f11 (export "f11") (result i32) (i32.const 11))
  (func $$f12 (export "f12") (result i32) (i32.const 12))
  (func $$f13 (export "f13") (result i32) (i32.const 13))
  (func $$f14 (export "f14") (result i32) (i32.const 14))
  (func $$f15 (export "f15") (result i32) (i32.const 15))
  (func (export "test") (param $$n i32) (result i32)
    (call_indirect (type 0) (local.get $$n)))
  (func (export "run") (param $$targetOffs i32) (param $$srcOffs i32) (param $$len i32)
    (table.copy (local.get $$targetOffs) (local.get $$srcOffs) (local.get $$len))))`);

// ./test/core/table_copy.wast:2613
assert_trap(() => invoke($47, `run`, [24, 21, 16]), `out of bounds table access`);

// ./test/core/table_copy.wast:2615
assert_trap(() => invoke($47, `test`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:2616
assert_trap(() => invoke($47, `test`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:2617
assert_trap(() => invoke($47, `test`, [2]), `uninitialized element`);

// ./test/core/table_copy.wast:2618
assert_trap(() => invoke($47, `test`, [3]), `uninitialized element`);

// ./test/core/table_copy.wast:2619
assert_trap(() => invoke($47, `test`, [4]), `uninitialized element`);

// ./test/core/table_copy.wast:2620
assert_trap(() => invoke($47, `test`, [5]), `uninitialized element`);

// ./test/core/table_copy.wast:2621
assert_trap(() => invoke($47, `test`, [6]), `uninitialized element`);

// ./test/core/table_copy.wast:2622
assert_trap(() => invoke($47, `test`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:2623
assert_trap(() => invoke($47, `test`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:2624
assert_trap(() => invoke($47, `test`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:2625
assert_trap(() => invoke($47, `test`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:2626
assert_trap(() => invoke($47, `test`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:2627
assert_trap(() => invoke($47, `test`, [12]), `uninitialized element`);

// ./test/core/table_copy.wast:2628
assert_trap(() => invoke($47, `test`, [13]), `uninitialized element`);

// ./test/core/table_copy.wast:2629
assert_trap(() => invoke($47, `test`, [14]), `uninitialized element`);

// ./test/core/table_copy.wast:2630
assert_trap(() => invoke($47, `test`, [15]), `uninitialized element`);

// ./test/core/table_copy.wast:2631
assert_trap(() => invoke($47, `test`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:2632
assert_trap(() => invoke($47, `test`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:2633
assert_trap(() => invoke($47, `test`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:2634
assert_trap(() => invoke($47, `test`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:2635
assert_trap(() => invoke($47, `test`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:2636
assert_return(() => invoke($47, `test`, [21]), [value("i32", 0)]);

// ./test/core/table_copy.wast:2637
assert_return(() => invoke($47, `test`, [22]), [value("i32", 1)]);

// ./test/core/table_copy.wast:2638
assert_return(() => invoke($47, `test`, [23]), [value("i32", 2)]);

// ./test/core/table_copy.wast:2639
assert_return(() => invoke($47, `test`, [24]), [value("i32", 3)]);

// ./test/core/table_copy.wast:2640
assert_return(() => invoke($47, `test`, [25]), [value("i32", 4)]);

// ./test/core/table_copy.wast:2641
assert_return(() => invoke($47, `test`, [26]), [value("i32", 5)]);

// ./test/core/table_copy.wast:2642
assert_return(() => invoke($47, `test`, [27]), [value("i32", 6)]);

// ./test/core/table_copy.wast:2643
assert_return(() => invoke($47, `test`, [28]), [value("i32", 7)]);

// ./test/core/table_copy.wast:2644
assert_trap(() => invoke($47, `test`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:2645
assert_trap(() => invoke($47, `test`, [30]), `uninitialized element`);

// ./test/core/table_copy.wast:2646
assert_trap(() => invoke($47, `test`, [31]), `uninitialized element`);

// ./test/core/table_copy.wast:2648
let $48 = instantiate(`(module
  (type (func (result i32)))
  (table 32 64 funcref)
  (elem (i32.const 24)
         $$f0 $$f1 $$f2 $$f3 $$f4 $$f5 $$f6 $$f7)
  (func $$f0 (export "f0") (result i32) (i32.const 0))
  (func $$f1 (export "f1") (result i32) (i32.const 1))
  (func $$f2 (export "f2") (result i32) (i32.const 2))
  (func $$f3 (export "f3") (result i32) (i32.const 3))
  (func $$f4 (export "f4") (result i32) (i32.const 4))
  (func $$f5 (export "f5") (result i32) (i32.const 5))
  (func $$f6 (export "f6") (result i32) (i32.const 6))
  (func $$f7 (export "f7") (result i32) (i32.const 7))
  (func $$f8 (export "f8") (result i32) (i32.const 8))
  (func $$f9 (export "f9") (result i32) (i32.const 9))
  (func $$f10 (export "f10") (result i32) (i32.const 10))
  (func $$f11 (export "f11") (result i32) (i32.const 11))
  (func $$f12 (export "f12") (result i32) (i32.const 12))
  (func $$f13 (export "f13") (result i32) (i32.const 13))
  (func $$f14 (export "f14") (result i32) (i32.const 14))
  (func $$f15 (export "f15") (result i32) (i32.const 15))
  (func (export "test") (param $$n i32) (result i32)
    (call_indirect (type 0) (local.get $$n)))
  (func (export "run") (param $$targetOffs i32) (param $$srcOffs i32) (param $$len i32)
    (table.copy (local.get $$targetOffs) (local.get $$srcOffs) (local.get $$len))))`);

// ./test/core/table_copy.wast:2674
assert_trap(() => invoke($48, `run`, [21, 24, 16]), `out of bounds table access`);

// ./test/core/table_copy.wast:2676
assert_trap(() => invoke($48, `test`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:2677
assert_trap(() => invoke($48, `test`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:2678
assert_trap(() => invoke($48, `test`, [2]), `uninitialized element`);

// ./test/core/table_copy.wast:2679
assert_trap(() => invoke($48, `test`, [3]), `uninitialized element`);

// ./test/core/table_copy.wast:2680
assert_trap(() => invoke($48, `test`, [4]), `uninitialized element`);

// ./test/core/table_copy.wast:2681
assert_trap(() => invoke($48, `test`, [5]), `uninitialized element`);

// ./test/core/table_copy.wast:2682
assert_trap(() => invoke($48, `test`, [6]), `uninitialized element`);

// ./test/core/table_copy.wast:2683
assert_trap(() => invoke($48, `test`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:2684
assert_trap(() => invoke($48, `test`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:2685
assert_trap(() => invoke($48, `test`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:2686
assert_trap(() => invoke($48, `test`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:2687
assert_trap(() => invoke($48, `test`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:2688
assert_trap(() => invoke($48, `test`, [12]), `uninitialized element`);

// ./test/core/table_copy.wast:2689
assert_trap(() => invoke($48, `test`, [13]), `uninitialized element`);

// ./test/core/table_copy.wast:2690
assert_trap(() => invoke($48, `test`, [14]), `uninitialized element`);

// ./test/core/table_copy.wast:2691
assert_trap(() => invoke($48, `test`, [15]), `uninitialized element`);

// ./test/core/table_copy.wast:2692
assert_trap(() => invoke($48, `test`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:2693
assert_trap(() => invoke($48, `test`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:2694
assert_trap(() => invoke($48, `test`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:2695
assert_trap(() => invoke($48, `test`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:2696
assert_trap(() => invoke($48, `test`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:2697
assert_trap(() => invoke($48, `test`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:2698
assert_trap(() => invoke($48, `test`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:2699
assert_trap(() => invoke($48, `test`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:2700
assert_return(() => invoke($48, `test`, [24]), [value("i32", 0)]);

// ./test/core/table_copy.wast:2701
assert_return(() => invoke($48, `test`, [25]), [value("i32", 1)]);

// ./test/core/table_copy.wast:2702
assert_return(() => invoke($48, `test`, [26]), [value("i32", 2)]);

// ./test/core/table_copy.wast:2703
assert_return(() => invoke($48, `test`, [27]), [value("i32", 3)]);

// ./test/core/table_copy.wast:2704
assert_return(() => invoke($48, `test`, [28]), [value("i32", 4)]);

// ./test/core/table_copy.wast:2705
assert_return(() => invoke($48, `test`, [29]), [value("i32", 5)]);

// ./test/core/table_copy.wast:2706
assert_return(() => invoke($48, `test`, [30]), [value("i32", 6)]);

// ./test/core/table_copy.wast:2707
assert_return(() => invoke($48, `test`, [31]), [value("i32", 7)]);

// ./test/core/table_copy.wast:2709
let $49 = instantiate(`(module
  (type (func (result i32)))
  (table 32 64 funcref)
  (elem (i32.const 21)
         $$f0 $$f1 $$f2 $$f3 $$f4 $$f5 $$f6 $$f7 $$f8 $$f9 $$f10)
  (func $$f0 (export "f0") (result i32) (i32.const 0))
  (func $$f1 (export "f1") (result i32) (i32.const 1))
  (func $$f2 (export "f2") (result i32) (i32.const 2))
  (func $$f3 (export "f3") (result i32) (i32.const 3))
  (func $$f4 (export "f4") (result i32) (i32.const 4))
  (func $$f5 (export "f5") (result i32) (i32.const 5))
  (func $$f6 (export "f6") (result i32) (i32.const 6))
  (func $$f7 (export "f7") (result i32) (i32.const 7))
  (func $$f8 (export "f8") (result i32) (i32.const 8))
  (func $$f9 (export "f9") (result i32) (i32.const 9))
  (func $$f10 (export "f10") (result i32) (i32.const 10))
  (func $$f11 (export "f11") (result i32) (i32.const 11))
  (func $$f12 (export "f12") (result i32) (i32.const 12))
  (func $$f13 (export "f13") (result i32) (i32.const 13))
  (func $$f14 (export "f14") (result i32) (i32.const 14))
  (func $$f15 (export "f15") (result i32) (i32.const 15))
  (func (export "test") (param $$n i32) (result i32)
    (call_indirect (type 0) (local.get $$n)))
  (func (export "run") (param $$targetOffs i32) (param $$srcOffs i32) (param $$len i32)
    (table.copy (local.get $$targetOffs) (local.get $$srcOffs) (local.get $$len))))`);

// ./test/core/table_copy.wast:2735
assert_trap(() => invoke($49, `run`, [21, 21, 16]), `out of bounds table access`);

// ./test/core/table_copy.wast:2737
assert_trap(() => invoke($49, `test`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:2738
assert_trap(() => invoke($49, `test`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:2739
assert_trap(() => invoke($49, `test`, [2]), `uninitialized element`);

// ./test/core/table_copy.wast:2740
assert_trap(() => invoke($49, `test`, [3]), `uninitialized element`);

// ./test/core/table_copy.wast:2741
assert_trap(() => invoke($49, `test`, [4]), `uninitialized element`);

// ./test/core/table_copy.wast:2742
assert_trap(() => invoke($49, `test`, [5]), `uninitialized element`);

// ./test/core/table_copy.wast:2743
assert_trap(() => invoke($49, `test`, [6]), `uninitialized element`);

// ./test/core/table_copy.wast:2744
assert_trap(() => invoke($49, `test`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:2745
assert_trap(() => invoke($49, `test`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:2746
assert_trap(() => invoke($49, `test`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:2747
assert_trap(() => invoke($49, `test`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:2748
assert_trap(() => invoke($49, `test`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:2749
assert_trap(() => invoke($49, `test`, [12]), `uninitialized element`);

// ./test/core/table_copy.wast:2750
assert_trap(() => invoke($49, `test`, [13]), `uninitialized element`);

// ./test/core/table_copy.wast:2751
assert_trap(() => invoke($49, `test`, [14]), `uninitialized element`);

// ./test/core/table_copy.wast:2752
assert_trap(() => invoke($49, `test`, [15]), `uninitialized element`);

// ./test/core/table_copy.wast:2753
assert_trap(() => invoke($49, `test`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:2754
assert_trap(() => invoke($49, `test`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:2755
assert_trap(() => invoke($49, `test`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:2756
assert_trap(() => invoke($49, `test`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:2757
assert_trap(() => invoke($49, `test`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:2758
assert_return(() => invoke($49, `test`, [21]), [value("i32", 0)]);

// ./test/core/table_copy.wast:2759
assert_return(() => invoke($49, `test`, [22]), [value("i32", 1)]);

// ./test/core/table_copy.wast:2760
assert_return(() => invoke($49, `test`, [23]), [value("i32", 2)]);

// ./test/core/table_copy.wast:2761
assert_return(() => invoke($49, `test`, [24]), [value("i32", 3)]);

// ./test/core/table_copy.wast:2762
assert_return(() => invoke($49, `test`, [25]), [value("i32", 4)]);

// ./test/core/table_copy.wast:2763
assert_return(() => invoke($49, `test`, [26]), [value("i32", 5)]);

// ./test/core/table_copy.wast:2764
assert_return(() => invoke($49, `test`, [27]), [value("i32", 6)]);

// ./test/core/table_copy.wast:2765
assert_return(() => invoke($49, `test`, [28]), [value("i32", 7)]);

// ./test/core/table_copy.wast:2766
assert_return(() => invoke($49, `test`, [29]), [value("i32", 8)]);

// ./test/core/table_copy.wast:2767
assert_return(() => invoke($49, `test`, [30]), [value("i32", 9)]);

// ./test/core/table_copy.wast:2768
assert_return(() => invoke($49, `test`, [31]), [value("i32", 10)]);

// ./test/core/table_copy.wast:2770
let $50 = instantiate(`(module
  (type (func (result i32)))
  (table 128 128 funcref)
  (elem (i32.const 112)
         $$f0 $$f1 $$f2 $$f3 $$f4 $$f5 $$f6 $$f7 $$f8 $$f9 $$f10 $$f11 $$f12 $$f13 $$f14 $$f15)
  (func $$f0 (export "f0") (result i32) (i32.const 0))
  (func $$f1 (export "f1") (result i32) (i32.const 1))
  (func $$f2 (export "f2") (result i32) (i32.const 2))
  (func $$f3 (export "f3") (result i32) (i32.const 3))
  (func $$f4 (export "f4") (result i32) (i32.const 4))
  (func $$f5 (export "f5") (result i32) (i32.const 5))
  (func $$f6 (export "f6") (result i32) (i32.const 6))
  (func $$f7 (export "f7") (result i32) (i32.const 7))
  (func $$f8 (export "f8") (result i32) (i32.const 8))
  (func $$f9 (export "f9") (result i32) (i32.const 9))
  (func $$f10 (export "f10") (result i32) (i32.const 10))
  (func $$f11 (export "f11") (result i32) (i32.const 11))
  (func $$f12 (export "f12") (result i32) (i32.const 12))
  (func $$f13 (export "f13") (result i32) (i32.const 13))
  (func $$f14 (export "f14") (result i32) (i32.const 14))
  (func $$f15 (export "f15") (result i32) (i32.const 15))
  (func (export "test") (param $$n i32) (result i32)
    (call_indirect (type 0) (local.get $$n)))
  (func (export "run") (param $$targetOffs i32) (param $$srcOffs i32) (param $$len i32)
    (table.copy (local.get $$targetOffs) (local.get $$srcOffs) (local.get $$len))))`);

// ./test/core/table_copy.wast:2796
assert_trap(() => invoke($50, `run`, [0, 112, -32]), `out of bounds table access`);

// ./test/core/table_copy.wast:2798
assert_trap(() => invoke($50, `test`, [0]), `uninitialized element`);

// ./test/core/table_copy.wast:2799
assert_trap(() => invoke($50, `test`, [1]), `uninitialized element`);

// ./test/core/table_copy.wast:2800
assert_trap(() => invoke($50, `test`, [2]), `uninitialized element`);

// ./test/core/table_copy.wast:2801
assert_trap(() => invoke($50, `test`, [3]), `uninitialized element`);

// ./test/core/table_copy.wast:2802
assert_trap(() => invoke($50, `test`, [4]), `uninitialized element`);

// ./test/core/table_copy.wast:2803
assert_trap(() => invoke($50, `test`, [5]), `uninitialized element`);

// ./test/core/table_copy.wast:2804
assert_trap(() => invoke($50, `test`, [6]), `uninitialized element`);

// ./test/core/table_copy.wast:2805
assert_trap(() => invoke($50, `test`, [7]), `uninitialized element`);

// ./test/core/table_copy.wast:2806
assert_trap(() => invoke($50, `test`, [8]), `uninitialized element`);

// ./test/core/table_copy.wast:2807
assert_trap(() => invoke($50, `test`, [9]), `uninitialized element`);

// ./test/core/table_copy.wast:2808
assert_trap(() => invoke($50, `test`, [10]), `uninitialized element`);

// ./test/core/table_copy.wast:2809
assert_trap(() => invoke($50, `test`, [11]), `uninitialized element`);

// ./test/core/table_copy.wast:2810
assert_trap(() => invoke($50, `test`, [12]), `uninitialized element`);

// ./test/core/table_copy.wast:2811
assert_trap(() => invoke($50, `test`, [13]), `uninitialized element`);

// ./test/core/table_copy.wast:2812
assert_trap(() => invoke($50, `test`, [14]), `uninitialized element`);

// ./test/core/table_copy.wast:2813
assert_trap(() => invoke($50, `test`, [15]), `uninitialized element`);

// ./test/core/table_copy.wast:2814
assert_trap(() => invoke($50, `test`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:2815
assert_trap(() => invoke($50, `test`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:2816
assert_trap(() => invoke($50, `test`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:2817
assert_trap(() => invoke($50, `test`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:2818
assert_trap(() => invoke($50, `test`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:2819
assert_trap(() => invoke($50, `test`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:2820
assert_trap(() => invoke($50, `test`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:2821
assert_trap(() => invoke($50, `test`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:2822
assert_trap(() => invoke($50, `test`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:2823
assert_trap(() => invoke($50, `test`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:2824
assert_trap(() => invoke($50, `test`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:2825
assert_trap(() => invoke($50, `test`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:2826
assert_trap(() => invoke($50, `test`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:2827
assert_trap(() => invoke($50, `test`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:2828
assert_trap(() => invoke($50, `test`, [30]), `uninitialized element`);

// ./test/core/table_copy.wast:2829
assert_trap(() => invoke($50, `test`, [31]), `uninitialized element`);

// ./test/core/table_copy.wast:2830
assert_trap(() => invoke($50, `test`, [32]), `uninitialized element`);

// ./test/core/table_copy.wast:2831
assert_trap(() => invoke($50, `test`, [33]), `uninitialized element`);

// ./test/core/table_copy.wast:2832
assert_trap(() => invoke($50, `test`, [34]), `uninitialized element`);

// ./test/core/table_copy.wast:2833
assert_trap(() => invoke($50, `test`, [35]), `uninitialized element`);

// ./test/core/table_copy.wast:2834
assert_trap(() => invoke($50, `test`, [36]), `uninitialized element`);

// ./test/core/table_copy.wast:2835
assert_trap(() => invoke($50, `test`, [37]), `uninitialized element`);

// ./test/core/table_copy.wast:2836
assert_trap(() => invoke($50, `test`, [38]), `uninitialized element`);

// ./test/core/table_copy.wast:2837
assert_trap(() => invoke($50, `test`, [39]), `uninitialized element`);

// ./test/core/table_copy.wast:2838
assert_trap(() => invoke($50, `test`, [40]), `uninitialized element`);

// ./test/core/table_copy.wast:2839
assert_trap(() => invoke($50, `test`, [41]), `uninitialized element`);

// ./test/core/table_copy.wast:2840
assert_trap(() => invoke($50, `test`, [42]), `uninitialized element`);

// ./test/core/table_copy.wast:2841
assert_trap(() => invoke($50, `test`, [43]), `uninitialized element`);

// ./test/core/table_copy.wast:2842
assert_trap(() => invoke($50, `test`, [44]), `uninitialized element`);

// ./test/core/table_copy.wast:2843
assert_trap(() => invoke($50, `test`, [45]), `uninitialized element`);

// ./test/core/table_copy.wast:2844
assert_trap(() => invoke($50, `test`, [46]), `uninitialized element`);

// ./test/core/table_copy.wast:2845
assert_trap(() => invoke($50, `test`, [47]), `uninitialized element`);

// ./test/core/table_copy.wast:2846
assert_trap(() => invoke($50, `test`, [48]), `uninitialized element`);

// ./test/core/table_copy.wast:2847
assert_trap(() => invoke($50, `test`, [49]), `uninitialized element`);

// ./test/core/table_copy.wast:2848
assert_trap(() => invoke($50, `test`, [50]), `uninitialized element`);

// ./test/core/table_copy.wast:2849
assert_trap(() => invoke($50, `test`, [51]), `uninitialized element`);

// ./test/core/table_copy.wast:2850
assert_trap(() => invoke($50, `test`, [52]), `uninitialized element`);

// ./test/core/table_copy.wast:2851
assert_trap(() => invoke($50, `test`, [53]), `uninitialized element`);

// ./test/core/table_copy.wast:2852
assert_trap(() => invoke($50, `test`, [54]), `uninitialized element`);

// ./test/core/table_copy.wast:2853
assert_trap(() => invoke($50, `test`, [55]), `uninitialized element`);

// ./test/core/table_copy.wast:2854
assert_trap(() => invoke($50, `test`, [56]), `uninitialized element`);

// ./test/core/table_copy.wast:2855
assert_trap(() => invoke($50, `test`, [57]), `uninitialized element`);

// ./test/core/table_copy.wast:2856
assert_trap(() => invoke($50, `test`, [58]), `uninitialized element`);

// ./test/core/table_copy.wast:2857
assert_trap(() => invoke($50, `test`, [59]), `uninitialized element`);

// ./test/core/table_copy.wast:2858
assert_trap(() => invoke($50, `test`, [60]), `uninitialized element`);

// ./test/core/table_copy.wast:2859
assert_trap(() => invoke($50, `test`, [61]), `uninitialized element`);

// ./test/core/table_copy.wast:2860
assert_trap(() => invoke($50, `test`, [62]), `uninitialized element`);

// ./test/core/table_copy.wast:2861
assert_trap(() => invoke($50, `test`, [63]), `uninitialized element`);

// ./test/core/table_copy.wast:2862
assert_trap(() => invoke($50, `test`, [64]), `uninitialized element`);

// ./test/core/table_copy.wast:2863
assert_trap(() => invoke($50, `test`, [65]), `uninitialized element`);

// ./test/core/table_copy.wast:2864
assert_trap(() => invoke($50, `test`, [66]), `uninitialized element`);

// ./test/core/table_copy.wast:2865
assert_trap(() => invoke($50, `test`, [67]), `uninitialized element`);

// ./test/core/table_copy.wast:2866
assert_trap(() => invoke($50, `test`, [68]), `uninitialized element`);

// ./test/core/table_copy.wast:2867
assert_trap(() => invoke($50, `test`, [69]), `uninitialized element`);

// ./test/core/table_copy.wast:2868
assert_trap(() => invoke($50, `test`, [70]), `uninitialized element`);

// ./test/core/table_copy.wast:2869
assert_trap(() => invoke($50, `test`, [71]), `uninitialized element`);

// ./test/core/table_copy.wast:2870
assert_trap(() => invoke($50, `test`, [72]), `uninitialized element`);

// ./test/core/table_copy.wast:2871
assert_trap(() => invoke($50, `test`, [73]), `uninitialized element`);

// ./test/core/table_copy.wast:2872
assert_trap(() => invoke($50, `test`, [74]), `uninitialized element`);

// ./test/core/table_copy.wast:2873
assert_trap(() => invoke($50, `test`, [75]), `uninitialized element`);

// ./test/core/table_copy.wast:2874
assert_trap(() => invoke($50, `test`, [76]), `uninitialized element`);

// ./test/core/table_copy.wast:2875
assert_trap(() => invoke($50, `test`, [77]), `uninitialized element`);

// ./test/core/table_copy.wast:2876
assert_trap(() => invoke($50, `test`, [78]), `uninitialized element`);

// ./test/core/table_copy.wast:2877
assert_trap(() => invoke($50, `test`, [79]), `uninitialized element`);

// ./test/core/table_copy.wast:2878
assert_trap(() => invoke($50, `test`, [80]), `uninitialized element`);

// ./test/core/table_copy.wast:2879
assert_trap(() => invoke($50, `test`, [81]), `uninitialized element`);

// ./test/core/table_copy.wast:2880
assert_trap(() => invoke($50, `test`, [82]), `uninitialized element`);

// ./test/core/table_copy.wast:2881
assert_trap(() => invoke($50, `test`, [83]), `uninitialized element`);

// ./test/core/table_copy.wast:2882
assert_trap(() => invoke($50, `test`, [84]), `uninitialized element`);

// ./test/core/table_copy.wast:2883
assert_trap(() => invoke($50, `test`, [85]), `uninitialized element`);

// ./test/core/table_copy.wast:2884
assert_trap(() => invoke($50, `test`, [86]), `uninitialized element`);

// ./test/core/table_copy.wast:2885
assert_trap(() => invoke($50, `test`, [87]), `uninitialized element`);

// ./test/core/table_copy.wast:2886
assert_trap(() => invoke($50, `test`, [88]), `uninitialized element`);

// ./test/core/table_copy.wast:2887
assert_trap(() => invoke($50, `test`, [89]), `uninitialized element`);

// ./test/core/table_copy.wast:2888
assert_trap(() => invoke($50, `test`, [90]), `uninitialized element`);

// ./test/core/table_copy.wast:2889
assert_trap(() => invoke($50, `test`, [91]), `uninitialized element`);

// ./test/core/table_copy.wast:2890
assert_trap(() => invoke($50, `test`, [92]), `uninitialized element`);

// ./test/core/table_copy.wast:2891
assert_trap(() => invoke($50, `test`, [93]), `uninitialized element`);

// ./test/core/table_copy.wast:2892
assert_trap(() => invoke($50, `test`, [94]), `uninitialized element`);

// ./test/core/table_copy.wast:2893
assert_trap(() => invoke($50, `test`, [95]), `uninitialized element`);

// ./test/core/table_copy.wast:2894
assert_trap(() => invoke($50, `test`, [96]), `uninitialized element`);

// ./test/core/table_copy.wast:2895
assert_trap(() => invoke($50, `test`, [97]), `uninitialized element`);

// ./test/core/table_copy.wast:2896
assert_trap(() => invoke($50, `test`, [98]), `uninitialized element`);

// ./test/core/table_copy.wast:2897
assert_trap(() => invoke($50, `test`, [99]), `uninitialized element`);

// ./test/core/table_copy.wast:2898
assert_trap(() => invoke($50, `test`, [100]), `uninitialized element`);

// ./test/core/table_copy.wast:2899
assert_trap(() => invoke($50, `test`, [101]), `uninitialized element`);

// ./test/core/table_copy.wast:2900
assert_trap(() => invoke($50, `test`, [102]), `uninitialized element`);

// ./test/core/table_copy.wast:2901
assert_trap(() => invoke($50, `test`, [103]), `uninitialized element`);

// ./test/core/table_copy.wast:2902
assert_trap(() => invoke($50, `test`, [104]), `uninitialized element`);

// ./test/core/table_copy.wast:2903
assert_trap(() => invoke($50, `test`, [105]), `uninitialized element`);

// ./test/core/table_copy.wast:2904
assert_trap(() => invoke($50, `test`, [106]), `uninitialized element`);

// ./test/core/table_copy.wast:2905
assert_trap(() => invoke($50, `test`, [107]), `uninitialized element`);

// ./test/core/table_copy.wast:2906
assert_trap(() => invoke($50, `test`, [108]), `uninitialized element`);

// ./test/core/table_copy.wast:2907
assert_trap(() => invoke($50, `test`, [109]), `uninitialized element`);

// ./test/core/table_copy.wast:2908
assert_trap(() => invoke($50, `test`, [110]), `uninitialized element`);

// ./test/core/table_copy.wast:2909
assert_trap(() => invoke($50, `test`, [111]), `uninitialized element`);

// ./test/core/table_copy.wast:2910
assert_return(() => invoke($50, `test`, [112]), [value("i32", 0)]);

// ./test/core/table_copy.wast:2911
assert_return(() => invoke($50, `test`, [113]), [value("i32", 1)]);

// ./test/core/table_copy.wast:2912
assert_return(() => invoke($50, `test`, [114]), [value("i32", 2)]);

// ./test/core/table_copy.wast:2913
assert_return(() => invoke($50, `test`, [115]), [value("i32", 3)]);

// ./test/core/table_copy.wast:2914
assert_return(() => invoke($50, `test`, [116]), [value("i32", 4)]);

// ./test/core/table_copy.wast:2915
assert_return(() => invoke($50, `test`, [117]), [value("i32", 5)]);

// ./test/core/table_copy.wast:2916
assert_return(() => invoke($50, `test`, [118]), [value("i32", 6)]);

// ./test/core/table_copy.wast:2917
assert_return(() => invoke($50, `test`, [119]), [value("i32", 7)]);

// ./test/core/table_copy.wast:2918
assert_return(() => invoke($50, `test`, [120]), [value("i32", 8)]);

// ./test/core/table_copy.wast:2919
assert_return(() => invoke($50, `test`, [121]), [value("i32", 9)]);

// ./test/core/table_copy.wast:2920
assert_return(() => invoke($50, `test`, [122]), [value("i32", 10)]);

// ./test/core/table_copy.wast:2921
assert_return(() => invoke($50, `test`, [123]), [value("i32", 11)]);

// ./test/core/table_copy.wast:2922
assert_return(() => invoke($50, `test`, [124]), [value("i32", 12)]);

// ./test/core/table_copy.wast:2923
assert_return(() => invoke($50, `test`, [125]), [value("i32", 13)]);

// ./test/core/table_copy.wast:2924
assert_return(() => invoke($50, `test`, [126]), [value("i32", 14)]);

// ./test/core/table_copy.wast:2925
assert_return(() => invoke($50, `test`, [127]), [value("i32", 15)]);

// ./test/core/table_copy.wast:2927
let $51 = instantiate(`(module
  (type (func (result i32)))
  (table 128 128 funcref)
  (elem (i32.const 0)
         $$f0 $$f1 $$f2 $$f3 $$f4 $$f5 $$f6 $$f7 $$f8 $$f9 $$f10 $$f11 $$f12 $$f13 $$f14 $$f15)
  (func $$f0 (export "f0") (result i32) (i32.const 0))
  (func $$f1 (export "f1") (result i32) (i32.const 1))
  (func $$f2 (export "f2") (result i32) (i32.const 2))
  (func $$f3 (export "f3") (result i32) (i32.const 3))
  (func $$f4 (export "f4") (result i32) (i32.const 4))
  (func $$f5 (export "f5") (result i32) (i32.const 5))
  (func $$f6 (export "f6") (result i32) (i32.const 6))
  (func $$f7 (export "f7") (result i32) (i32.const 7))
  (func $$f8 (export "f8") (result i32) (i32.const 8))
  (func $$f9 (export "f9") (result i32) (i32.const 9))
  (func $$f10 (export "f10") (result i32) (i32.const 10))
  (func $$f11 (export "f11") (result i32) (i32.const 11))
  (func $$f12 (export "f12") (result i32) (i32.const 12))
  (func $$f13 (export "f13") (result i32) (i32.const 13))
  (func $$f14 (export "f14") (result i32) (i32.const 14))
  (func $$f15 (export "f15") (result i32) (i32.const 15))
  (func (export "test") (param $$n i32) (result i32)
    (call_indirect (type 0) (local.get $$n)))
  (func (export "run") (param $$targetOffs i32) (param $$srcOffs i32) (param $$len i32)
    (table.copy (local.get $$targetOffs) (local.get $$srcOffs) (local.get $$len))))`);

// ./test/core/table_copy.wast:2953
assert_trap(() => invoke($51, `run`, [112, 0, -32]), `out of bounds table access`);

// ./test/core/table_copy.wast:2955
assert_return(() => invoke($51, `test`, [0]), [value("i32", 0)]);

// ./test/core/table_copy.wast:2956
assert_return(() => invoke($51, `test`, [1]), [value("i32", 1)]);

// ./test/core/table_copy.wast:2957
assert_return(() => invoke($51, `test`, [2]), [value("i32", 2)]);

// ./test/core/table_copy.wast:2958
assert_return(() => invoke($51, `test`, [3]), [value("i32", 3)]);

// ./test/core/table_copy.wast:2959
assert_return(() => invoke($51, `test`, [4]), [value("i32", 4)]);

// ./test/core/table_copy.wast:2960
assert_return(() => invoke($51, `test`, [5]), [value("i32", 5)]);

// ./test/core/table_copy.wast:2961
assert_return(() => invoke($51, `test`, [6]), [value("i32", 6)]);

// ./test/core/table_copy.wast:2962
assert_return(() => invoke($51, `test`, [7]), [value("i32", 7)]);

// ./test/core/table_copy.wast:2963
assert_return(() => invoke($51, `test`, [8]), [value("i32", 8)]);

// ./test/core/table_copy.wast:2964
assert_return(() => invoke($51, `test`, [9]), [value("i32", 9)]);

// ./test/core/table_copy.wast:2965
assert_return(() => invoke($51, `test`, [10]), [value("i32", 10)]);

// ./test/core/table_copy.wast:2966
assert_return(() => invoke($51, `test`, [11]), [value("i32", 11)]);

// ./test/core/table_copy.wast:2967
assert_return(() => invoke($51, `test`, [12]), [value("i32", 12)]);

// ./test/core/table_copy.wast:2968
assert_return(() => invoke($51, `test`, [13]), [value("i32", 13)]);

// ./test/core/table_copy.wast:2969
assert_return(() => invoke($51, `test`, [14]), [value("i32", 14)]);

// ./test/core/table_copy.wast:2970
assert_return(() => invoke($51, `test`, [15]), [value("i32", 15)]);

// ./test/core/table_copy.wast:2971
assert_trap(() => invoke($51, `test`, [16]), `uninitialized element`);

// ./test/core/table_copy.wast:2972
assert_trap(() => invoke($51, `test`, [17]), `uninitialized element`);

// ./test/core/table_copy.wast:2973
assert_trap(() => invoke($51, `test`, [18]), `uninitialized element`);

// ./test/core/table_copy.wast:2974
assert_trap(() => invoke($51, `test`, [19]), `uninitialized element`);

// ./test/core/table_copy.wast:2975
assert_trap(() => invoke($51, `test`, [20]), `uninitialized element`);

// ./test/core/table_copy.wast:2976
assert_trap(() => invoke($51, `test`, [21]), `uninitialized element`);

// ./test/core/table_copy.wast:2977
assert_trap(() => invoke($51, `test`, [22]), `uninitialized element`);

// ./test/core/table_copy.wast:2978
assert_trap(() => invoke($51, `test`, [23]), `uninitialized element`);

// ./test/core/table_copy.wast:2979
assert_trap(() => invoke($51, `test`, [24]), `uninitialized element`);

// ./test/core/table_copy.wast:2980
assert_trap(() => invoke($51, `test`, [25]), `uninitialized element`);

// ./test/core/table_copy.wast:2981
assert_trap(() => invoke($51, `test`, [26]), `uninitialized element`);

// ./test/core/table_copy.wast:2982
assert_trap(() => invoke($51, `test`, [27]), `uninitialized element`);

// ./test/core/table_copy.wast:2983
assert_trap(() => invoke($51, `test`, [28]), `uninitialized element`);

// ./test/core/table_copy.wast:2984
assert_trap(() => invoke($51, `test`, [29]), `uninitialized element`);

// ./test/core/table_copy.wast:2985
assert_trap(() => invoke($51, `test`, [30]), `uninitialized element`);

// ./test/core/table_copy.wast:2986
assert_trap(() => invoke($51, `test`, [31]), `uninitialized element`);

// ./test/core/table_copy.wast:2987
assert_trap(() => invoke($51, `test`, [32]), `uninitialized element`);

// ./test/core/table_copy.wast:2988
assert_trap(() => invoke($51, `test`, [33]), `uninitialized element`);

// ./test/core/table_copy.wast:2989
assert_trap(() => invoke($51, `test`, [34]), `uninitialized element`);

// ./test/core/table_copy.wast:2990
assert_trap(() => invoke($51, `test`, [35]), `uninitialized element`);

// ./test/core/table_copy.wast:2991
assert_trap(() => invoke($51, `test`, [36]), `uninitialized element`);

// ./test/core/table_copy.wast:2992
assert_trap(() => invoke($51, `test`, [37]), `uninitialized element`);

// ./test/core/table_copy.wast:2993
assert_trap(() => invoke($51, `test`, [38]), `uninitialized element`);

// ./test/core/table_copy.wast:2994
assert_trap(() => invoke($51, `test`, [39]), `uninitialized element`);

// ./test/core/table_copy.wast:2995
assert_trap(() => invoke($51, `test`, [40]), `uninitialized element`);

// ./test/core/table_copy.wast:2996
assert_trap(() => invoke($51, `test`, [41]), `uninitialized element`);

// ./test/core/table_copy.wast:2997
assert_trap(() => invoke($51, `test`, [42]), `uninitialized element`);

// ./test/core/table_copy.wast:2998
assert_trap(() => invoke($51, `test`, [43]), `uninitialized element`);

// ./test/core/table_copy.wast:2999
assert_trap(() => invoke($51, `test`, [44]), `uninitialized element`);

// ./test/core/table_copy.wast:3000
assert_trap(() => invoke($51, `test`, [45]), `uninitialized element`);

// ./test/core/table_copy.wast:3001
assert_trap(() => invoke($51, `test`, [46]), `uninitialized element`);

// ./test/core/table_copy.wast:3002
assert_trap(() => invoke($51, `test`, [47]), `uninitialized element`);

// ./test/core/table_copy.wast:3003
assert_trap(() => invoke($51, `test`, [48]), `uninitialized element`);

// ./test/core/table_copy.wast:3004
assert_trap(() => invoke($51, `test`, [49]), `uninitialized element`);

// ./test/core/table_copy.wast:3005
assert_trap(() => invoke($51, `test`, [50]), `uninitialized element`);

// ./test/core/table_copy.wast:3006
assert_trap(() => invoke($51, `test`, [51]), `uninitialized element`);

// ./test/core/table_copy.wast:3007
assert_trap(() => invoke($51, `test`, [52]), `uninitialized element`);

// ./test/core/table_copy.wast:3008
assert_trap(() => invoke($51, `test`, [53]), `uninitialized element`);

// ./test/core/table_copy.wast:3009
assert_trap(() => invoke($51, `test`, [54]), `uninitialized element`);

// ./test/core/table_copy.wast:3010
assert_trap(() => invoke($51, `test`, [55]), `uninitialized element`);

// ./test/core/table_copy.wast:3011
assert_trap(() => invoke($51, `test`, [56]), `uninitialized element`);

// ./test/core/table_copy.wast:3012
assert_trap(() => invoke($51, `test`, [57]), `uninitialized element`);

// ./test/core/table_copy.wast:3013
assert_trap(() => invoke($51, `test`, [58]), `uninitialized element`);

// ./test/core/table_copy.wast:3014
assert_trap(() => invoke($51, `test`, [59]), `uninitialized element`);

// ./test/core/table_copy.wast:3015
assert_trap(() => invoke($51, `test`, [60]), `uninitialized element`);

// ./test/core/table_copy.wast:3016
assert_trap(() => invoke($51, `test`, [61]), `uninitialized element`);

// ./test/core/table_copy.wast:3017
assert_trap(() => invoke($51, `test`, [62]), `uninitialized element`);

// ./test/core/table_copy.wast:3018
assert_trap(() => invoke($51, `test`, [63]), `uninitialized element`);

// ./test/core/table_copy.wast:3019
assert_trap(() => invoke($51, `test`, [64]), `uninitialized element`);

// ./test/core/table_copy.wast:3020
assert_trap(() => invoke($51, `test`, [65]), `uninitialized element`);

// ./test/core/table_copy.wast:3021
assert_trap(() => invoke($51, `test`, [66]), `uninitialized element`);

// ./test/core/table_copy.wast:3022
assert_trap(() => invoke($51, `test`, [67]), `uninitialized element`);

// ./test/core/table_copy.wast:3023
assert_trap(() => invoke($51, `test`, [68]), `uninitialized element`);

// ./test/core/table_copy.wast:3024
assert_trap(() => invoke($51, `test`, [69]), `uninitialized element`);

// ./test/core/table_copy.wast:3025
assert_trap(() => invoke($51, `test`, [70]), `uninitialized element`);

// ./test/core/table_copy.wast:3026
assert_trap(() => invoke($51, `test`, [71]), `uninitialized element`);

// ./test/core/table_copy.wast:3027
assert_trap(() => invoke($51, `test`, [72]), `uninitialized element`);

// ./test/core/table_copy.wast:3028
assert_trap(() => invoke($51, `test`, [73]), `uninitialized element`);

// ./test/core/table_copy.wast:3029
assert_trap(() => invoke($51, `test`, [74]), `uninitialized element`);

// ./test/core/table_copy.wast:3030
assert_trap(() => invoke($51, `test`, [75]), `uninitialized element`);

// ./test/core/table_copy.wast:3031
assert_trap(() => invoke($51, `test`, [76]), `uninitialized element`);

// ./test/core/table_copy.wast:3032
assert_trap(() => invoke($51, `test`, [77]), `uninitialized element`);

// ./test/core/table_copy.wast:3033
assert_trap(() => invoke($51, `test`, [78]), `uninitialized element`);

// ./test/core/table_copy.wast:3034
assert_trap(() => invoke($51, `test`, [79]), `uninitialized element`);

// ./test/core/table_copy.wast:3035
assert_trap(() => invoke($51, `test`, [80]), `uninitialized element`);

// ./test/core/table_copy.wast:3036
assert_trap(() => invoke($51, `test`, [81]), `uninitialized element`);

// ./test/core/table_copy.wast:3037
assert_trap(() => invoke($51, `test`, [82]), `uninitialized element`);

// ./test/core/table_copy.wast:3038
assert_trap(() => invoke($51, `test`, [83]), `uninitialized element`);

// ./test/core/table_copy.wast:3039
assert_trap(() => invoke($51, `test`, [84]), `uninitialized element`);

// ./test/core/table_copy.wast:3040
assert_trap(() => invoke($51, `test`, [85]), `uninitialized element`);

// ./test/core/table_copy.wast:3041
assert_trap(() => invoke($51, `test`, [86]), `uninitialized element`);

// ./test/core/table_copy.wast:3042
assert_trap(() => invoke($51, `test`, [87]), `uninitialized element`);

// ./test/core/table_copy.wast:3043
assert_trap(() => invoke($51, `test`, [88]), `uninitialized element`);

// ./test/core/table_copy.wast:3044
assert_trap(() => invoke($51, `test`, [89]), `uninitialized element`);

// ./test/core/table_copy.wast:3045
assert_trap(() => invoke($51, `test`, [90]), `uninitialized element`);

// ./test/core/table_copy.wast:3046
assert_trap(() => invoke($51, `test`, [91]), `uninitialized element`);

// ./test/core/table_copy.wast:3047
assert_trap(() => invoke($51, `test`, [92]), `uninitialized element`);

// ./test/core/table_copy.wast:3048
assert_trap(() => invoke($51, `test`, [93]), `uninitialized element`);

// ./test/core/table_copy.wast:3049
assert_trap(() => invoke($51, `test`, [94]), `uninitialized element`);

// ./test/core/table_copy.wast:3050
assert_trap(() => invoke($51, `test`, [95]), `uninitialized element`);

// ./test/core/table_copy.wast:3051
assert_trap(() => invoke($51, `test`, [96]), `uninitialized element`);

// ./test/core/table_copy.wast:3052
assert_trap(() => invoke($51, `test`, [97]), `uninitialized element`);

// ./test/core/table_copy.wast:3053
assert_trap(() => invoke($51, `test`, [98]), `uninitialized element`);

// ./test/core/table_copy.wast:3054
assert_trap(() => invoke($51, `test`, [99]), `uninitialized element`);

// ./test/core/table_copy.wast:3055
assert_trap(() => invoke($51, `test`, [100]), `uninitialized element`);

// ./test/core/table_copy.wast:3056
assert_trap(() => invoke($51, `test`, [101]), `uninitialized element`);

// ./test/core/table_copy.wast:3057
assert_trap(() => invoke($51, `test`, [102]), `uninitialized element`);

// ./test/core/table_copy.wast:3058
assert_trap(() => invoke($51, `test`, [103]), `uninitialized element`);

// ./test/core/table_copy.wast:3059
assert_trap(() => invoke($51, `test`, [104]), `uninitialized element`);

// ./test/core/table_copy.wast:3060
assert_trap(() => invoke($51, `test`, [105]), `uninitialized element`);

// ./test/core/table_copy.wast:3061
assert_trap(() => invoke($51, `test`, [106]), `uninitialized element`);

// ./test/core/table_copy.wast:3062
assert_trap(() => invoke($51, `test`, [107]), `uninitialized element`);

// ./test/core/table_copy.wast:3063
assert_trap(() => invoke($51, `test`, [108]), `uninitialized element`);

// ./test/core/table_copy.wast:3064
assert_trap(() => invoke($51, `test`, [109]), `uninitialized element`);

// ./test/core/table_copy.wast:3065
assert_trap(() => invoke($51, `test`, [110]), `uninitialized element`);

// ./test/core/table_copy.wast:3066
assert_trap(() => invoke($51, `test`, [111]), `uninitialized element`);

// ./test/core/table_copy.wast:3067
assert_trap(() => invoke($51, `test`, [112]), `uninitialized element`);

// ./test/core/table_copy.wast:3068
assert_trap(() => invoke($51, `test`, [113]), `uninitialized element`);

// ./test/core/table_copy.wast:3069
assert_trap(() => invoke($51, `test`, [114]), `uninitialized element`);

// ./test/core/table_copy.wast:3070
assert_trap(() => invoke($51, `test`, [115]), `uninitialized element`);

// ./test/core/table_copy.wast:3071
assert_trap(() => invoke($51, `test`, [116]), `uninitialized element`);

// ./test/core/table_copy.wast:3072
assert_trap(() => invoke($51, `test`, [117]), `uninitialized element`);

// ./test/core/table_copy.wast:3073
assert_trap(() => invoke($51, `test`, [118]), `uninitialized element`);

// ./test/core/table_copy.wast:3074
assert_trap(() => invoke($51, `test`, [119]), `uninitialized element`);

// ./test/core/table_copy.wast:3075
assert_trap(() => invoke($51, `test`, [120]), `uninitialized element`);

// ./test/core/table_copy.wast:3076
assert_trap(() => invoke($51, `test`, [121]), `uninitialized element`);

// ./test/core/table_copy.wast:3077
assert_trap(() => invoke($51, `test`, [122]), `uninitialized element`);

// ./test/core/table_copy.wast:3078
assert_trap(() => invoke($51, `test`, [123]), `uninitialized element`);

// ./test/core/table_copy.wast:3079
assert_trap(() => invoke($51, `test`, [124]), `uninitialized element`);

// ./test/core/table_copy.wast:3080
assert_trap(() => invoke($51, `test`, [125]), `uninitialized element`);

// ./test/core/table_copy.wast:3081
assert_trap(() => invoke($51, `test`, [126]), `uninitialized element`);

// ./test/core/table_copy.wast:3082
assert_trap(() => invoke($51, `test`, [127]), `uninitialized element`);
