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

// ./test/core/table_init.wast

// ./test/core/table_init.wast:6
let $0 = instantiate(`(module
  (func (export "ef0") (result i32) (i32.const 0))
  (func (export "ef1") (result i32) (i32.const 1))
  (func (export "ef2") (result i32) (i32.const 2))
  (func (export "ef3") (result i32) (i32.const 3))
  (func (export "ef4") (result i32) (i32.const 4))
)`);

// ./test/core/table_init.wast:13
register($0, `a`);

// ./test/core/table_init.wast:15
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
  (func (result i32) (i32.const 5))  ;; index 5
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))  ;; index 9
  (func (export "test")
    (table.init $$t0 1 (i32.const 7) (i32.const 0) (i32.const 4)))
  (func (export "check") (param i32) (result i32)
    (call_indirect $$t0 (type 0) (local.get 0)))
)`);

// ./test/core/table_init.wast:41
invoke($1, `test`, []);

// ./test/core/table_init.wast:42
assert_trap(() => invoke($1, `check`, [0]), `uninitialized element`);

// ./test/core/table_init.wast:43
assert_trap(() => invoke($1, `check`, [1]), `uninitialized element`);

// ./test/core/table_init.wast:44
assert_return(() => invoke($1, `check`, [2]), [value("i32", 3)]);

// ./test/core/table_init.wast:45
assert_return(() => invoke($1, `check`, [3]), [value("i32", 1)]);

// ./test/core/table_init.wast:46
assert_return(() => invoke($1, `check`, [4]), [value("i32", 4)]);

// ./test/core/table_init.wast:47
assert_return(() => invoke($1, `check`, [5]), [value("i32", 1)]);

// ./test/core/table_init.wast:48
assert_trap(() => invoke($1, `check`, [6]), `uninitialized element`);

// ./test/core/table_init.wast:49
assert_return(() => invoke($1, `check`, [7]), [value("i32", 2)]);

// ./test/core/table_init.wast:50
assert_return(() => invoke($1, `check`, [8]), [value("i32", 7)]);

// ./test/core/table_init.wast:51
assert_return(() => invoke($1, `check`, [9]), [value("i32", 1)]);

// ./test/core/table_init.wast:52
assert_return(() => invoke($1, `check`, [10]), [value("i32", 8)]);

// ./test/core/table_init.wast:53
assert_trap(() => invoke($1, `check`, [11]), `uninitialized element`);

// ./test/core/table_init.wast:54
assert_return(() => invoke($1, `check`, [12]), [value("i32", 7)]);

// ./test/core/table_init.wast:55
assert_return(() => invoke($1, `check`, [13]), [value("i32", 5)]);

// ./test/core/table_init.wast:56
assert_return(() => invoke($1, `check`, [14]), [value("i32", 2)]);

// ./test/core/table_init.wast:57
assert_return(() => invoke($1, `check`, [15]), [value("i32", 3)]);

// ./test/core/table_init.wast:58
assert_return(() => invoke($1, `check`, [16]), [value("i32", 6)]);

// ./test/core/table_init.wast:59
assert_trap(() => invoke($1, `check`, [17]), `uninitialized element`);

// ./test/core/table_init.wast:60
assert_trap(() => invoke($1, `check`, [18]), `uninitialized element`);

// ./test/core/table_init.wast:61
assert_trap(() => invoke($1, `check`, [19]), `uninitialized element`);

// ./test/core/table_init.wast:62
assert_trap(() => invoke($1, `check`, [20]), `uninitialized element`);

// ./test/core/table_init.wast:63
assert_trap(() => invoke($1, `check`, [21]), `uninitialized element`);

// ./test/core/table_init.wast:64
assert_trap(() => invoke($1, `check`, [22]), `uninitialized element`);

// ./test/core/table_init.wast:65
assert_trap(() => invoke($1, `check`, [23]), `uninitialized element`);

// ./test/core/table_init.wast:66
assert_trap(() => invoke($1, `check`, [24]), `uninitialized element`);

// ./test/core/table_init.wast:67
assert_trap(() => invoke($1, `check`, [25]), `uninitialized element`);

// ./test/core/table_init.wast:68
assert_trap(() => invoke($1, `check`, [26]), `uninitialized element`);

// ./test/core/table_init.wast:69
assert_trap(() => invoke($1, `check`, [27]), `uninitialized element`);

// ./test/core/table_init.wast:70
assert_trap(() => invoke($1, `check`, [28]), `uninitialized element`);

// ./test/core/table_init.wast:71
assert_trap(() => invoke($1, `check`, [29]), `uninitialized element`);

// ./test/core/table_init.wast:73
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
  (func (result i32) (i32.const 5))  ;; index 5
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))  ;; index 9
  (func (export "test")
    (table.init $$t0 3 (i32.const 15) (i32.const 1) (i32.const 3)))
  (func (export "check") (param i32) (result i32)
    (call_indirect $$t0 (type 0) (local.get 0)))
)`);

// ./test/core/table_init.wast:99
invoke($2, `test`, []);

// ./test/core/table_init.wast:100
assert_trap(() => invoke($2, `check`, [0]), `uninitialized element`);

// ./test/core/table_init.wast:101
assert_trap(() => invoke($2, `check`, [1]), `uninitialized element`);

// ./test/core/table_init.wast:102
assert_return(() => invoke($2, `check`, [2]), [value("i32", 3)]);

// ./test/core/table_init.wast:103
assert_return(() => invoke($2, `check`, [3]), [value("i32", 1)]);

// ./test/core/table_init.wast:104
assert_return(() => invoke($2, `check`, [4]), [value("i32", 4)]);

// ./test/core/table_init.wast:105
assert_return(() => invoke($2, `check`, [5]), [value("i32", 1)]);

// ./test/core/table_init.wast:106
assert_trap(() => invoke($2, `check`, [6]), `uninitialized element`);

// ./test/core/table_init.wast:107
assert_trap(() => invoke($2, `check`, [7]), `uninitialized element`);

// ./test/core/table_init.wast:108
assert_trap(() => invoke($2, `check`, [8]), `uninitialized element`);

// ./test/core/table_init.wast:109
assert_trap(() => invoke($2, `check`, [9]), `uninitialized element`);

// ./test/core/table_init.wast:110
assert_trap(() => invoke($2, `check`, [10]), `uninitialized element`);

// ./test/core/table_init.wast:111
assert_trap(() => invoke($2, `check`, [11]), `uninitialized element`);

// ./test/core/table_init.wast:112
assert_return(() => invoke($2, `check`, [12]), [value("i32", 7)]);

// ./test/core/table_init.wast:113
assert_return(() => invoke($2, `check`, [13]), [value("i32", 5)]);

// ./test/core/table_init.wast:114
assert_return(() => invoke($2, `check`, [14]), [value("i32", 2)]);

// ./test/core/table_init.wast:115
assert_return(() => invoke($2, `check`, [15]), [value("i32", 9)]);

// ./test/core/table_init.wast:116
assert_return(() => invoke($2, `check`, [16]), [value("i32", 2)]);

// ./test/core/table_init.wast:117
assert_return(() => invoke($2, `check`, [17]), [value("i32", 7)]);

// ./test/core/table_init.wast:118
assert_trap(() => invoke($2, `check`, [18]), `uninitialized element`);

// ./test/core/table_init.wast:119
assert_trap(() => invoke($2, `check`, [19]), `uninitialized element`);

// ./test/core/table_init.wast:120
assert_trap(() => invoke($2, `check`, [20]), `uninitialized element`);

// ./test/core/table_init.wast:121
assert_trap(() => invoke($2, `check`, [21]), `uninitialized element`);

// ./test/core/table_init.wast:122
assert_trap(() => invoke($2, `check`, [22]), `uninitialized element`);

// ./test/core/table_init.wast:123
assert_trap(() => invoke($2, `check`, [23]), `uninitialized element`);

// ./test/core/table_init.wast:124
assert_trap(() => invoke($2, `check`, [24]), `uninitialized element`);

// ./test/core/table_init.wast:125
assert_trap(() => invoke($2, `check`, [25]), `uninitialized element`);

// ./test/core/table_init.wast:126
assert_trap(() => invoke($2, `check`, [26]), `uninitialized element`);

// ./test/core/table_init.wast:127
assert_trap(() => invoke($2, `check`, [27]), `uninitialized element`);

// ./test/core/table_init.wast:128
assert_trap(() => invoke($2, `check`, [28]), `uninitialized element`);

// ./test/core/table_init.wast:129
assert_trap(() => invoke($2, `check`, [29]), `uninitialized element`);

// ./test/core/table_init.wast:131
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
  (func (result i32) (i32.const 5))  ;; index 5
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))  ;; index 9
  (func (export "test")
    (table.init $$t0 1 (i32.const 7) (i32.const 0) (i32.const 4))
         (elem.drop 1)
         (table.init $$t0 3 (i32.const 15) (i32.const 1) (i32.const 3))
         (elem.drop 3)
         (table.copy $$t0 0 (i32.const 20) (i32.const 15) (i32.const 5))
         (table.copy $$t0 0 (i32.const 21) (i32.const 29) (i32.const 1))
         (table.copy $$t0 0 (i32.const 24) (i32.const 10) (i32.const 1))
         (table.copy $$t0 0 (i32.const 13) (i32.const 11) (i32.const 4))
         (table.copy $$t0 0 (i32.const 19) (i32.const 20) (i32.const 5)))
  (func (export "check") (param i32) (result i32)
    (call_indirect $$t0 (type 0) (local.get 0)))
)`);

// ./test/core/table_init.wast:165
invoke($3, `test`, []);

// ./test/core/table_init.wast:166
assert_trap(() => invoke($3, `check`, [0]), `uninitialized element`);

// ./test/core/table_init.wast:167
assert_trap(() => invoke($3, `check`, [1]), `uninitialized element`);

// ./test/core/table_init.wast:168
assert_return(() => invoke($3, `check`, [2]), [value("i32", 3)]);

// ./test/core/table_init.wast:169
assert_return(() => invoke($3, `check`, [3]), [value("i32", 1)]);

// ./test/core/table_init.wast:170
assert_return(() => invoke($3, `check`, [4]), [value("i32", 4)]);

// ./test/core/table_init.wast:171
assert_return(() => invoke($3, `check`, [5]), [value("i32", 1)]);

// ./test/core/table_init.wast:172
assert_trap(() => invoke($3, `check`, [6]), `uninitialized element`);

// ./test/core/table_init.wast:173
assert_return(() => invoke($3, `check`, [7]), [value("i32", 2)]);

// ./test/core/table_init.wast:174
assert_return(() => invoke($3, `check`, [8]), [value("i32", 7)]);

// ./test/core/table_init.wast:175
assert_return(() => invoke($3, `check`, [9]), [value("i32", 1)]);

// ./test/core/table_init.wast:176
assert_return(() => invoke($3, `check`, [10]), [value("i32", 8)]);

// ./test/core/table_init.wast:177
assert_trap(() => invoke($3, `check`, [11]), `uninitialized element`);

// ./test/core/table_init.wast:178
assert_return(() => invoke($3, `check`, [12]), [value("i32", 7)]);

// ./test/core/table_init.wast:179
assert_trap(() => invoke($3, `check`, [13]), `uninitialized element`);

// ./test/core/table_init.wast:180
assert_return(() => invoke($3, `check`, [14]), [value("i32", 7)]);

// ./test/core/table_init.wast:181
assert_return(() => invoke($3, `check`, [15]), [value("i32", 5)]);

// ./test/core/table_init.wast:182
assert_return(() => invoke($3, `check`, [16]), [value("i32", 2)]);

// ./test/core/table_init.wast:183
assert_return(() => invoke($3, `check`, [17]), [value("i32", 7)]);

// ./test/core/table_init.wast:184
assert_trap(() => invoke($3, `check`, [18]), `uninitialized element`);

// ./test/core/table_init.wast:185
assert_return(() => invoke($3, `check`, [19]), [value("i32", 9)]);

// ./test/core/table_init.wast:186
assert_trap(() => invoke($3, `check`, [20]), `uninitialized element`);

// ./test/core/table_init.wast:187
assert_return(() => invoke($3, `check`, [21]), [value("i32", 7)]);

// ./test/core/table_init.wast:188
assert_trap(() => invoke($3, `check`, [22]), `uninitialized element`);

// ./test/core/table_init.wast:189
assert_return(() => invoke($3, `check`, [23]), [value("i32", 8)]);

// ./test/core/table_init.wast:190
assert_return(() => invoke($3, `check`, [24]), [value("i32", 8)]);

// ./test/core/table_init.wast:191
assert_trap(() => invoke($3, `check`, [25]), `uninitialized element`);

// ./test/core/table_init.wast:192
assert_trap(() => invoke($3, `check`, [26]), `uninitialized element`);

// ./test/core/table_init.wast:193
assert_trap(() => invoke($3, `check`, [27]), `uninitialized element`);

// ./test/core/table_init.wast:194
assert_trap(() => invoke($3, `check`, [28]), `uninitialized element`);

// ./test/core/table_init.wast:195
assert_trap(() => invoke($3, `check`, [29]), `uninitialized element`);

// ./test/core/table_init.wast:197
let $4 = instantiate(`(module
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
  (func (result i32) (i32.const 5))  ;; index 5
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))  ;; index 9
  (func (export "test")
    (table.init $$t1 1 (i32.const 7) (i32.const 0) (i32.const 4)))
  (func (export "check") (param i32) (result i32)
    (call_indirect $$t1 (type 0) (local.get 0)))
)`);

// ./test/core/table_init.wast:223
invoke($4, `test`, []);

// ./test/core/table_init.wast:224
assert_trap(() => invoke($4, `check`, [0]), `uninitialized element`);

// ./test/core/table_init.wast:225
assert_trap(() => invoke($4, `check`, [1]), `uninitialized element`);

// ./test/core/table_init.wast:226
assert_return(() => invoke($4, `check`, [2]), [value("i32", 3)]);

// ./test/core/table_init.wast:227
assert_return(() => invoke($4, `check`, [3]), [value("i32", 1)]);

// ./test/core/table_init.wast:228
assert_return(() => invoke($4, `check`, [4]), [value("i32", 4)]);

// ./test/core/table_init.wast:229
assert_return(() => invoke($4, `check`, [5]), [value("i32", 1)]);

// ./test/core/table_init.wast:230
assert_trap(() => invoke($4, `check`, [6]), `uninitialized element`);

// ./test/core/table_init.wast:231
assert_return(() => invoke($4, `check`, [7]), [value("i32", 2)]);

// ./test/core/table_init.wast:232
assert_return(() => invoke($4, `check`, [8]), [value("i32", 7)]);

// ./test/core/table_init.wast:233
assert_return(() => invoke($4, `check`, [9]), [value("i32", 1)]);

// ./test/core/table_init.wast:234
assert_return(() => invoke($4, `check`, [10]), [value("i32", 8)]);

// ./test/core/table_init.wast:235
assert_trap(() => invoke($4, `check`, [11]), `uninitialized element`);

// ./test/core/table_init.wast:236
assert_return(() => invoke($4, `check`, [12]), [value("i32", 7)]);

// ./test/core/table_init.wast:237
assert_return(() => invoke($4, `check`, [13]), [value("i32", 5)]);

// ./test/core/table_init.wast:238
assert_return(() => invoke($4, `check`, [14]), [value("i32", 2)]);

// ./test/core/table_init.wast:239
assert_return(() => invoke($4, `check`, [15]), [value("i32", 3)]);

// ./test/core/table_init.wast:240
assert_return(() => invoke($4, `check`, [16]), [value("i32", 6)]);

// ./test/core/table_init.wast:241
assert_trap(() => invoke($4, `check`, [17]), `uninitialized element`);

// ./test/core/table_init.wast:242
assert_trap(() => invoke($4, `check`, [18]), `uninitialized element`);

// ./test/core/table_init.wast:243
assert_trap(() => invoke($4, `check`, [19]), `uninitialized element`);

// ./test/core/table_init.wast:244
assert_trap(() => invoke($4, `check`, [20]), `uninitialized element`);

// ./test/core/table_init.wast:245
assert_trap(() => invoke($4, `check`, [21]), `uninitialized element`);

// ./test/core/table_init.wast:246
assert_trap(() => invoke($4, `check`, [22]), `uninitialized element`);

// ./test/core/table_init.wast:247
assert_trap(() => invoke($4, `check`, [23]), `uninitialized element`);

// ./test/core/table_init.wast:248
assert_trap(() => invoke($4, `check`, [24]), `uninitialized element`);

// ./test/core/table_init.wast:249
assert_trap(() => invoke($4, `check`, [25]), `uninitialized element`);

// ./test/core/table_init.wast:250
assert_trap(() => invoke($4, `check`, [26]), `uninitialized element`);

// ./test/core/table_init.wast:251
assert_trap(() => invoke($4, `check`, [27]), `uninitialized element`);

// ./test/core/table_init.wast:252
assert_trap(() => invoke($4, `check`, [28]), `uninitialized element`);

// ./test/core/table_init.wast:253
assert_trap(() => invoke($4, `check`, [29]), `uninitialized element`);

// ./test/core/table_init.wast:255
let $5 = instantiate(`(module
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
  (func (result i32) (i32.const 5))  ;; index 5
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))  ;; index 9
  (func (export "test")
    (table.init $$t1 3 (i32.const 15) (i32.const 1) (i32.const 3)))
  (func (export "check") (param i32) (result i32)
    (call_indirect $$t1 (type 0) (local.get 0)))
)`);

// ./test/core/table_init.wast:281
invoke($5, `test`, []);

// ./test/core/table_init.wast:282
assert_trap(() => invoke($5, `check`, [0]), `uninitialized element`);

// ./test/core/table_init.wast:283
assert_trap(() => invoke($5, `check`, [1]), `uninitialized element`);

// ./test/core/table_init.wast:284
assert_return(() => invoke($5, `check`, [2]), [value("i32", 3)]);

// ./test/core/table_init.wast:285
assert_return(() => invoke($5, `check`, [3]), [value("i32", 1)]);

// ./test/core/table_init.wast:286
assert_return(() => invoke($5, `check`, [4]), [value("i32", 4)]);

// ./test/core/table_init.wast:287
assert_return(() => invoke($5, `check`, [5]), [value("i32", 1)]);

// ./test/core/table_init.wast:288
assert_trap(() => invoke($5, `check`, [6]), `uninitialized element`);

// ./test/core/table_init.wast:289
assert_trap(() => invoke($5, `check`, [7]), `uninitialized element`);

// ./test/core/table_init.wast:290
assert_trap(() => invoke($5, `check`, [8]), `uninitialized element`);

// ./test/core/table_init.wast:291
assert_trap(() => invoke($5, `check`, [9]), `uninitialized element`);

// ./test/core/table_init.wast:292
assert_trap(() => invoke($5, `check`, [10]), `uninitialized element`);

// ./test/core/table_init.wast:293
assert_trap(() => invoke($5, `check`, [11]), `uninitialized element`);

// ./test/core/table_init.wast:294
assert_return(() => invoke($5, `check`, [12]), [value("i32", 7)]);

// ./test/core/table_init.wast:295
assert_return(() => invoke($5, `check`, [13]), [value("i32", 5)]);

// ./test/core/table_init.wast:296
assert_return(() => invoke($5, `check`, [14]), [value("i32", 2)]);

// ./test/core/table_init.wast:297
assert_return(() => invoke($5, `check`, [15]), [value("i32", 9)]);

// ./test/core/table_init.wast:298
assert_return(() => invoke($5, `check`, [16]), [value("i32", 2)]);

// ./test/core/table_init.wast:299
assert_return(() => invoke($5, `check`, [17]), [value("i32", 7)]);

// ./test/core/table_init.wast:300
assert_trap(() => invoke($5, `check`, [18]), `uninitialized element`);

// ./test/core/table_init.wast:301
assert_trap(() => invoke($5, `check`, [19]), `uninitialized element`);

// ./test/core/table_init.wast:302
assert_trap(() => invoke($5, `check`, [20]), `uninitialized element`);

// ./test/core/table_init.wast:303
assert_trap(() => invoke($5, `check`, [21]), `uninitialized element`);

// ./test/core/table_init.wast:304
assert_trap(() => invoke($5, `check`, [22]), `uninitialized element`);

// ./test/core/table_init.wast:305
assert_trap(() => invoke($5, `check`, [23]), `uninitialized element`);

// ./test/core/table_init.wast:306
assert_trap(() => invoke($5, `check`, [24]), `uninitialized element`);

// ./test/core/table_init.wast:307
assert_trap(() => invoke($5, `check`, [25]), `uninitialized element`);

// ./test/core/table_init.wast:308
assert_trap(() => invoke($5, `check`, [26]), `uninitialized element`);

// ./test/core/table_init.wast:309
assert_trap(() => invoke($5, `check`, [27]), `uninitialized element`);

// ./test/core/table_init.wast:310
assert_trap(() => invoke($5, `check`, [28]), `uninitialized element`);

// ./test/core/table_init.wast:311
assert_trap(() => invoke($5, `check`, [29]), `uninitialized element`);

// ./test/core/table_init.wast:313
let $6 = instantiate(`(module
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
  (func (result i32) (i32.const 5))  ;; index 5
  (func (result i32) (i32.const 6))
  (func (result i32) (i32.const 7))
  (func (result i32) (i32.const 8))
  (func (result i32) (i32.const 9))  ;; index 9
  (func (export "test")
    (table.init $$t1 1 (i32.const 7) (i32.const 0) (i32.const 4))
         (elem.drop 1)
         (table.init $$t1 3 (i32.const 15) (i32.const 1) (i32.const 3))
         (elem.drop 3)
         (table.copy $$t1 1 (i32.const 20) (i32.const 15) (i32.const 5))
         (table.copy $$t1 1 (i32.const 21) (i32.const 29) (i32.const 1))
         (table.copy $$t1 1 (i32.const 24) (i32.const 10) (i32.const 1))
         (table.copy $$t1 1 (i32.const 13) (i32.const 11) (i32.const 4))
         (table.copy $$t1 1 (i32.const 19) (i32.const 20) (i32.const 5)))
  (func (export "check") (param i32) (result i32)
    (call_indirect $$t1 (type 0) (local.get 0)))
)`);

// ./test/core/table_init.wast:347
invoke($6, `test`, []);

// ./test/core/table_init.wast:348
assert_trap(() => invoke($6, `check`, [0]), `uninitialized element`);

// ./test/core/table_init.wast:349
assert_trap(() => invoke($6, `check`, [1]), `uninitialized element`);

// ./test/core/table_init.wast:350
assert_return(() => invoke($6, `check`, [2]), [value("i32", 3)]);

// ./test/core/table_init.wast:351
assert_return(() => invoke($6, `check`, [3]), [value("i32", 1)]);

// ./test/core/table_init.wast:352
assert_return(() => invoke($6, `check`, [4]), [value("i32", 4)]);

// ./test/core/table_init.wast:353
assert_return(() => invoke($6, `check`, [5]), [value("i32", 1)]);

// ./test/core/table_init.wast:354
assert_trap(() => invoke($6, `check`, [6]), `uninitialized element`);

// ./test/core/table_init.wast:355
assert_return(() => invoke($6, `check`, [7]), [value("i32", 2)]);

// ./test/core/table_init.wast:356
assert_return(() => invoke($6, `check`, [8]), [value("i32", 7)]);

// ./test/core/table_init.wast:357
assert_return(() => invoke($6, `check`, [9]), [value("i32", 1)]);

// ./test/core/table_init.wast:358
assert_return(() => invoke($6, `check`, [10]), [value("i32", 8)]);

// ./test/core/table_init.wast:359
assert_trap(() => invoke($6, `check`, [11]), `uninitialized element`);

// ./test/core/table_init.wast:360
assert_return(() => invoke($6, `check`, [12]), [value("i32", 7)]);

// ./test/core/table_init.wast:361
assert_trap(() => invoke($6, `check`, [13]), `uninitialized element`);

// ./test/core/table_init.wast:362
assert_return(() => invoke($6, `check`, [14]), [value("i32", 7)]);

// ./test/core/table_init.wast:363
assert_return(() => invoke($6, `check`, [15]), [value("i32", 5)]);

// ./test/core/table_init.wast:364
assert_return(() => invoke($6, `check`, [16]), [value("i32", 2)]);

// ./test/core/table_init.wast:365
assert_return(() => invoke($6, `check`, [17]), [value("i32", 7)]);

// ./test/core/table_init.wast:366
assert_trap(() => invoke($6, `check`, [18]), `uninitialized element`);

// ./test/core/table_init.wast:367
assert_return(() => invoke($6, `check`, [19]), [value("i32", 9)]);

// ./test/core/table_init.wast:368
assert_trap(() => invoke($6, `check`, [20]), `uninitialized element`);

// ./test/core/table_init.wast:369
assert_return(() => invoke($6, `check`, [21]), [value("i32", 7)]);

// ./test/core/table_init.wast:370
assert_trap(() => invoke($6, `check`, [22]), `uninitialized element`);

// ./test/core/table_init.wast:371
assert_return(() => invoke($6, `check`, [23]), [value("i32", 8)]);

// ./test/core/table_init.wast:372
assert_return(() => invoke($6, `check`, [24]), [value("i32", 8)]);

// ./test/core/table_init.wast:373
assert_trap(() => invoke($6, `check`, [25]), `uninitialized element`);

// ./test/core/table_init.wast:374
assert_trap(() => invoke($6, `check`, [26]), `uninitialized element`);

// ./test/core/table_init.wast:375
assert_trap(() => invoke($6, `check`, [27]), `uninitialized element`);

// ./test/core/table_init.wast:376
assert_trap(() => invoke($6, `check`, [28]), `uninitialized element`);

// ./test/core/table_init.wast:377
assert_trap(() => invoke($6, `check`, [29]), `uninitialized element`);

// ./test/core/table_init.wast:378
assert_invalid(
  () => instantiate(`(module
    (func (export "test")
      (elem.drop 0)))`),
  `unknown elem segment 0`,
);

// ./test/core/table_init.wast:384
assert_invalid(
  () => instantiate(`(module
    (func (export "test")
      (table.init 0 (i32.const 12) (i32.const 1) (i32.const 1))))`),
  `unknown table 0`,
);

// ./test/core/table_init.wast:390
assert_invalid(
  () => instantiate(`(module
    (elem funcref (ref.func 0))
    (func (result i32) (i32.const 0))
    (func (export "test")
      (elem.drop 4)))`),
  `unknown elem segment 4`,
);

// ./test/core/table_init.wast:398
assert_invalid(
  () => instantiate(`(module
    (elem funcref (ref.func 0))
    (func (result i32) (i32.const 0))
    (func (export "test")
      (table.init 4 (i32.const 12) (i32.const 1) (i32.const 1))))`),
  `unknown table 0`,
);

// ./test/core/table_init.wast:407
let $7 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 28 28 funcref)
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
    (elem.drop 2)
    ))`);

// ./test/core/table_init.wast:429
invoke($7, `test`, []);

// ./test/core/table_init.wast:431
let $8 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 28 28 funcref)
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
    (table.init 2 (i32.const 12) (i32.const 1) (i32.const 1))
    ))`);

// ./test/core/table_init.wast:453
assert_trap(() => invoke($8, `test`, []), `out of bounds table access`);

// ./test/core/table_init.wast:455
let $9 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 28 28 funcref)
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
    (table.init 1 (i32.const 12) (i32.const 1) (i32.const 1))
    (table.init 1 (i32.const 21) (i32.const 1) (i32.const 1))))`);

// ./test/core/table_init.wast:477
invoke($9, `test`, []);

// ./test/core/table_init.wast:479
let $10 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 28 28 funcref)
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
    (elem.drop 1)
    (elem.drop 1)))`);

// ./test/core/table_init.wast:501
invoke($10, `test`, []);

// ./test/core/table_init.wast:503
let $11 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 28 28 funcref)
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
    (elem.drop 1)
    (table.init 1 (i32.const 12) (i32.const 1) (i32.const 1))))`);

// ./test/core/table_init.wast:525
assert_trap(() => invoke($11, `test`, []), `out of bounds table access`);

// ./test/core/table_init.wast:527
let $12 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 28 28 funcref)
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
    (table.init 1 (i32.const 12) (i32.const 0) (i32.const 5))
    ))`);

// ./test/core/table_init.wast:549
assert_trap(() => invoke($12, `test`, []), `out of bounds table access`);

// ./test/core/table_init.wast:551
let $13 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 28 28 funcref)
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
    (table.init 1 (i32.const 12) (i32.const 2) (i32.const 3))
    ))`);

// ./test/core/table_init.wast:573
assert_trap(() => invoke($13, `test`, []), `out of bounds table access`);

// ./test/core/table_init.wast:575
let $14 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 28 28 funcref)
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
    (table.init $$t0 1 (i32.const 28) (i32.const 1) (i32.const 3))
    ))`);

// ./test/core/table_init.wast:597
assert_trap(() => invoke($14, `test`, []), `out of bounds table access`);

// ./test/core/table_init.wast:599
let $15 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 28 28 funcref)
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
    (table.init $$t0 1 (i32.const 12) (i32.const 4) (i32.const 0))
    ))`);

// ./test/core/table_init.wast:621
invoke($15, `test`, []);

// ./test/core/table_init.wast:623
let $16 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 28 28 funcref)
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
    (table.init $$t0 1 (i32.const 12) (i32.const 5) (i32.const 0))
    ))`);

// ./test/core/table_init.wast:645
assert_trap(() => invoke($16, `test`, []), `out of bounds table access`);

// ./test/core/table_init.wast:647
let $17 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 28 28 funcref)
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
    (table.init $$t0 1 (i32.const 30) (i32.const 2) (i32.const 0))
    ))`);

// ./test/core/table_init.wast:669
invoke($17, `test`, []);

// ./test/core/table_init.wast:671
let $18 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 28 28 funcref)
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
    (table.init $$t0 1 (i32.const 31) (i32.const 2) (i32.const 0))
    ))`);

// ./test/core/table_init.wast:693
assert_trap(() => invoke($18, `test`, []), `out of bounds table access`);

// ./test/core/table_init.wast:695
let $19 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 28 28 funcref)
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
    (table.init $$t0 1 (i32.const 30) (i32.const 4) (i32.const 0))
    ))`);

// ./test/core/table_init.wast:717
invoke($19, `test`, []);

// ./test/core/table_init.wast:719
let $20 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 28 28 funcref)
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
    (table.init $$t0 1 (i32.const 31) (i32.const 5) (i32.const 0))
    ))`);

// ./test/core/table_init.wast:741
assert_trap(() => invoke($20, `test`, []), `out of bounds table access`);

// ./test/core/table_init.wast:743
let $21 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 28 28 funcref)
  (elem (table $$t1) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t1) (i32.const 12) func 7 5 2 3 6)
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
    (table.init $$t1 1 (i32.const 26) (i32.const 1) (i32.const 3))
    ))`);

// ./test/core/table_init.wast:765
assert_trap(() => invoke($21, `test`, []), `out of bounds table access`);

// ./test/core/table_init.wast:767
let $22 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 28 28 funcref)
  (elem (table $$t1) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t1) (i32.const 12) func 7 5 2 3 6)
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
    (table.init $$t1 1 (i32.const 12) (i32.const 4) (i32.const 0))
    ))`);

// ./test/core/table_init.wast:789
invoke($22, `test`, []);

// ./test/core/table_init.wast:791
let $23 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 28 28 funcref)
  (elem (table $$t1) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t1) (i32.const 12) func 7 5 2 3 6)
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
    (table.init $$t1 1 (i32.const 12) (i32.const 5) (i32.const 0))
    ))`);

// ./test/core/table_init.wast:813
assert_trap(() => invoke($23, `test`, []), `out of bounds table access`);

// ./test/core/table_init.wast:815
let $24 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 28 28 funcref)
  (elem (table $$t1) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t1) (i32.const 12) func 7 5 2 3 6)
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
    (table.init $$t1 1 (i32.const 28) (i32.const 2) (i32.const 0))
    ))`);

// ./test/core/table_init.wast:837
invoke($24, `test`, []);

// ./test/core/table_init.wast:839
let $25 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 28 28 funcref)
  (elem (table $$t1) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t1) (i32.const 12) func 7 5 2 3 6)
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
    (table.init $$t1 1 (i32.const 29) (i32.const 2) (i32.const 0))
    ))`);

// ./test/core/table_init.wast:861
assert_trap(() => invoke($25, `test`, []), `out of bounds table access`);

// ./test/core/table_init.wast:863
let $26 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 28 28 funcref)
  (elem (table $$t1) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t1) (i32.const 12) func 7 5 2 3 6)
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
    (table.init $$t1 1 (i32.const 28) (i32.const 4) (i32.const 0))
    ))`);

// ./test/core/table_init.wast:885
invoke($26, `test`, []);

// ./test/core/table_init.wast:887
let $27 = instantiate(`(module
  (table $$t0 30 30 funcref)
  (table $$t1 28 28 funcref)
  (elem (table $$t1) (i32.const 2) func 3 1 4 1)
  (elem funcref
    (ref.func 2) (ref.func 7) (ref.func 1) (ref.func 8))
  (elem (table $$t1) (i32.const 12) func 7 5 2 3 6)
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
    (table.init $$t1 1 (i32.const 29) (i32.const 5) (i32.const 0))
    ))`);

// ./test/core/table_init.wast:909
assert_trap(() => invoke($27, `test`, []), `out of bounds table access`);

// ./test/core/table_init.wast:911
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i32.const 1) (i32.const 1) (f32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:920
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i32.const 1) (i32.const 1) (i64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:929
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i32.const 1) (i32.const 1) (f64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:938
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i32.const 1) (f32.const 1) (i32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:947
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i32.const 1) (f32.const 1) (f32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:956
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i32.const 1) (f32.const 1) (i64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:965
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i32.const 1) (f32.const 1) (f64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:974
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i32.const 1) (i64.const 1) (i32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:983
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i32.const 1) (i64.const 1) (f32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:992
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i32.const 1) (i64.const 1) (i64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1001
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i32.const 1) (i64.const 1) (f64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1010
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i32.const 1) (f64.const 1) (i32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1019
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i32.const 1) (f64.const 1) (f32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1028
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i32.const 1) (f64.const 1) (i64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1037
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i32.const 1) (f64.const 1) (f64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1046
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f32.const 1) (i32.const 1) (i32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1055
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f32.const 1) (i32.const 1) (f32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1064
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f32.const 1) (i32.const 1) (i64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1073
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f32.const 1) (i32.const 1) (f64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1082
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f32.const 1) (f32.const 1) (i32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1091
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f32.const 1) (f32.const 1) (f32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1100
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f32.const 1) (f32.const 1) (i64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1109
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f32.const 1) (f32.const 1) (f64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1118
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f32.const 1) (i64.const 1) (i32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1127
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f32.const 1) (i64.const 1) (f32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1136
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f32.const 1) (i64.const 1) (i64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1145
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f32.const 1) (i64.const 1) (f64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1154
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f32.const 1) (f64.const 1) (i32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1163
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f32.const 1) (f64.const 1) (f32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1172
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f32.const 1) (f64.const 1) (i64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1181
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f32.const 1) (f64.const 1) (f64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1190
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i64.const 1) (i32.const 1) (i32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1199
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i64.const 1) (i32.const 1) (f32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1208
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i64.const 1) (i32.const 1) (i64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1217
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i64.const 1) (i32.const 1) (f64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1226
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i64.const 1) (f32.const 1) (i32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1235
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i64.const 1) (f32.const 1) (f32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1244
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i64.const 1) (f32.const 1) (i64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1253
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i64.const 1) (f32.const 1) (f64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1262
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i64.const 1) (i64.const 1) (i32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1271
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i64.const 1) (i64.const 1) (f32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1280
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i64.const 1) (i64.const 1) (i64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1289
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i64.const 1) (i64.const 1) (f64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1298
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i64.const 1) (f64.const 1) (i32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1307
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i64.const 1) (f64.const 1) (f32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1316
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i64.const 1) (f64.const 1) (i64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1325
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (i64.const 1) (f64.const 1) (f64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1334
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f64.const 1) (i32.const 1) (i32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1343
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f64.const 1) (i32.const 1) (f32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1352
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f64.const 1) (i32.const 1) (i64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1361
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f64.const 1) (i32.const 1) (f64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1370
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f64.const 1) (f32.const 1) (i32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1379
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f64.const 1) (f32.const 1) (f32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1388
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f64.const 1) (f32.const 1) (i64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1397
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f64.const 1) (f32.const 1) (f64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1406
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f64.const 1) (i64.const 1) (i32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1415
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f64.const 1) (i64.const 1) (f32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1424
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f64.const 1) (i64.const 1) (i64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1433
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f64.const 1) (i64.const 1) (f64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1442
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f64.const 1) (f64.const 1) (i32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1451
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f64.const 1) (f64.const 1) (f32.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1460
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f64.const 1) (f64.const 1) (i64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1469
assert_invalid(
  () => instantiate(`(module
    (table 10 funcref)
    (elem funcref (ref.func $$f0) (ref.func $$f0) (ref.func $$f0))
    (func $$f0)
    (func (export "test")
      (table.init 0 (f64.const 1) (f64.const 1) (f64.const 1))))`),
  `type mismatch`,
);

// ./test/core/table_init.wast:1478
let $28 = instantiate(`(module
  (type (func (result i32)))
  (table 32 64 funcref)
  (elem funcref
    (ref.func $$f0) (ref.func $$f1) (ref.func $$f2) (ref.func $$f3)
    (ref.func $$f4) (ref.func $$f5) (ref.func $$f6) (ref.func $$f7)
    (ref.func $$f8) (ref.func $$f9) (ref.func $$f10) (ref.func $$f11)
    (ref.func $$f12) (ref.func $$f13) (ref.func $$f14) (ref.func $$f15))
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
  (func (export "run") (param $$offs i32) (param $$len i32)
    (table.init 0 (local.get $$offs) (i32.const 0) (local.get $$len))))`);

// ./test/core/table_init.wast:1506
assert_trap(() => invoke($28, `run`, [24, 16]), `out of bounds table access`);

// ./test/core/table_init.wast:1507
assert_trap(() => invoke($28, `test`, [0]), `uninitialized element`);

// ./test/core/table_init.wast:1508
assert_trap(() => invoke($28, `test`, [1]), `uninitialized element`);

// ./test/core/table_init.wast:1509
assert_trap(() => invoke($28, `test`, [2]), `uninitialized element`);

// ./test/core/table_init.wast:1510
assert_trap(() => invoke($28, `test`, [3]), `uninitialized element`);

// ./test/core/table_init.wast:1511
assert_trap(() => invoke($28, `test`, [4]), `uninitialized element`);

// ./test/core/table_init.wast:1512
assert_trap(() => invoke($28, `test`, [5]), `uninitialized element`);

// ./test/core/table_init.wast:1513
assert_trap(() => invoke($28, `test`, [6]), `uninitialized element`);

// ./test/core/table_init.wast:1514
assert_trap(() => invoke($28, `test`, [7]), `uninitialized element`);

// ./test/core/table_init.wast:1515
assert_trap(() => invoke($28, `test`, [8]), `uninitialized element`);

// ./test/core/table_init.wast:1516
assert_trap(() => invoke($28, `test`, [9]), `uninitialized element`);

// ./test/core/table_init.wast:1517
assert_trap(() => invoke($28, `test`, [10]), `uninitialized element`);

// ./test/core/table_init.wast:1518
assert_trap(() => invoke($28, `test`, [11]), `uninitialized element`);

// ./test/core/table_init.wast:1519
assert_trap(() => invoke($28, `test`, [12]), `uninitialized element`);

// ./test/core/table_init.wast:1520
assert_trap(() => invoke($28, `test`, [13]), `uninitialized element`);

// ./test/core/table_init.wast:1521
assert_trap(() => invoke($28, `test`, [14]), `uninitialized element`);

// ./test/core/table_init.wast:1522
assert_trap(() => invoke($28, `test`, [15]), `uninitialized element`);

// ./test/core/table_init.wast:1523
assert_trap(() => invoke($28, `test`, [16]), `uninitialized element`);

// ./test/core/table_init.wast:1524
assert_trap(() => invoke($28, `test`, [17]), `uninitialized element`);

// ./test/core/table_init.wast:1525
assert_trap(() => invoke($28, `test`, [18]), `uninitialized element`);

// ./test/core/table_init.wast:1526
assert_trap(() => invoke($28, `test`, [19]), `uninitialized element`);

// ./test/core/table_init.wast:1527
assert_trap(() => invoke($28, `test`, [20]), `uninitialized element`);

// ./test/core/table_init.wast:1528
assert_trap(() => invoke($28, `test`, [21]), `uninitialized element`);

// ./test/core/table_init.wast:1529
assert_trap(() => invoke($28, `test`, [22]), `uninitialized element`);

// ./test/core/table_init.wast:1530
assert_trap(() => invoke($28, `test`, [23]), `uninitialized element`);

// ./test/core/table_init.wast:1531
assert_trap(() => invoke($28, `test`, [24]), `uninitialized element`);

// ./test/core/table_init.wast:1532
assert_trap(() => invoke($28, `test`, [25]), `uninitialized element`);

// ./test/core/table_init.wast:1533
assert_trap(() => invoke($28, `test`, [26]), `uninitialized element`);

// ./test/core/table_init.wast:1534
assert_trap(() => invoke($28, `test`, [27]), `uninitialized element`);

// ./test/core/table_init.wast:1535
assert_trap(() => invoke($28, `test`, [28]), `uninitialized element`);

// ./test/core/table_init.wast:1536
assert_trap(() => invoke($28, `test`, [29]), `uninitialized element`);

// ./test/core/table_init.wast:1537
assert_trap(() => invoke($28, `test`, [30]), `uninitialized element`);

// ./test/core/table_init.wast:1538
assert_trap(() => invoke($28, `test`, [31]), `uninitialized element`);

// ./test/core/table_init.wast:1540
let $29 = instantiate(`(module
  (type (func (result i32)))
  (table 32 64 funcref)
  (elem funcref
    (ref.func $$f0) (ref.func $$f1) (ref.func $$f2) (ref.func $$f3)
    (ref.func $$f4) (ref.func $$f5) (ref.func $$f6) (ref.func $$f7)
    (ref.func $$f8) (ref.func $$f9) (ref.func $$f10) (ref.func $$f11)
    (ref.func $$f12) (ref.func $$f13) (ref.func $$f14) (ref.func $$f15))
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
  (func (export "run") (param $$offs i32) (param $$len i32)
    (table.init 0 (local.get $$offs) (i32.const 0) (local.get $$len))))`);

// ./test/core/table_init.wast:1568
assert_trap(() => invoke($29, `run`, [25, 16]), `out of bounds table access`);

// ./test/core/table_init.wast:1569
assert_trap(() => invoke($29, `test`, [0]), `uninitialized element`);

// ./test/core/table_init.wast:1570
assert_trap(() => invoke($29, `test`, [1]), `uninitialized element`);

// ./test/core/table_init.wast:1571
assert_trap(() => invoke($29, `test`, [2]), `uninitialized element`);

// ./test/core/table_init.wast:1572
assert_trap(() => invoke($29, `test`, [3]), `uninitialized element`);

// ./test/core/table_init.wast:1573
assert_trap(() => invoke($29, `test`, [4]), `uninitialized element`);

// ./test/core/table_init.wast:1574
assert_trap(() => invoke($29, `test`, [5]), `uninitialized element`);

// ./test/core/table_init.wast:1575
assert_trap(() => invoke($29, `test`, [6]), `uninitialized element`);

// ./test/core/table_init.wast:1576
assert_trap(() => invoke($29, `test`, [7]), `uninitialized element`);

// ./test/core/table_init.wast:1577
assert_trap(() => invoke($29, `test`, [8]), `uninitialized element`);

// ./test/core/table_init.wast:1578
assert_trap(() => invoke($29, `test`, [9]), `uninitialized element`);

// ./test/core/table_init.wast:1579
assert_trap(() => invoke($29, `test`, [10]), `uninitialized element`);

// ./test/core/table_init.wast:1580
assert_trap(() => invoke($29, `test`, [11]), `uninitialized element`);

// ./test/core/table_init.wast:1581
assert_trap(() => invoke($29, `test`, [12]), `uninitialized element`);

// ./test/core/table_init.wast:1582
assert_trap(() => invoke($29, `test`, [13]), `uninitialized element`);

// ./test/core/table_init.wast:1583
assert_trap(() => invoke($29, `test`, [14]), `uninitialized element`);

// ./test/core/table_init.wast:1584
assert_trap(() => invoke($29, `test`, [15]), `uninitialized element`);

// ./test/core/table_init.wast:1585
assert_trap(() => invoke($29, `test`, [16]), `uninitialized element`);

// ./test/core/table_init.wast:1586
assert_trap(() => invoke($29, `test`, [17]), `uninitialized element`);

// ./test/core/table_init.wast:1587
assert_trap(() => invoke($29, `test`, [18]), `uninitialized element`);

// ./test/core/table_init.wast:1588
assert_trap(() => invoke($29, `test`, [19]), `uninitialized element`);

// ./test/core/table_init.wast:1589
assert_trap(() => invoke($29, `test`, [20]), `uninitialized element`);

// ./test/core/table_init.wast:1590
assert_trap(() => invoke($29, `test`, [21]), `uninitialized element`);

// ./test/core/table_init.wast:1591
assert_trap(() => invoke($29, `test`, [22]), `uninitialized element`);

// ./test/core/table_init.wast:1592
assert_trap(() => invoke($29, `test`, [23]), `uninitialized element`);

// ./test/core/table_init.wast:1593
assert_trap(() => invoke($29, `test`, [24]), `uninitialized element`);

// ./test/core/table_init.wast:1594
assert_trap(() => invoke($29, `test`, [25]), `uninitialized element`);

// ./test/core/table_init.wast:1595
assert_trap(() => invoke($29, `test`, [26]), `uninitialized element`);

// ./test/core/table_init.wast:1596
assert_trap(() => invoke($29, `test`, [27]), `uninitialized element`);

// ./test/core/table_init.wast:1597
assert_trap(() => invoke($29, `test`, [28]), `uninitialized element`);

// ./test/core/table_init.wast:1598
assert_trap(() => invoke($29, `test`, [29]), `uninitialized element`);

// ./test/core/table_init.wast:1599
assert_trap(() => invoke($29, `test`, [30]), `uninitialized element`);

// ./test/core/table_init.wast:1600
assert_trap(() => invoke($29, `test`, [31]), `uninitialized element`);

// ./test/core/table_init.wast:1602
let $30 = instantiate(`(module
  (type (func (result i32)))
  (table 160 320 funcref)
  (elem funcref
    (ref.func $$f0) (ref.func $$f1) (ref.func $$f2) (ref.func $$f3)
    (ref.func $$f4) (ref.func $$f5) (ref.func $$f6) (ref.func $$f7)
    (ref.func $$f8) (ref.func $$f9) (ref.func $$f10) (ref.func $$f11)
    (ref.func $$f12) (ref.func $$f13) (ref.func $$f14) (ref.func $$f15))
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
  (func (export "run") (param $$offs i32) (param $$len i32)
    (table.init 0 (local.get $$offs) (i32.const 0) (local.get $$len))))`);

// ./test/core/table_init.wast:1630
assert_trap(() => invoke($30, `run`, [96, 32]), `out of bounds table access`);

// ./test/core/table_init.wast:1631
assert_trap(() => invoke($30, `test`, [0]), `uninitialized element`);

// ./test/core/table_init.wast:1632
assert_trap(() => invoke($30, `test`, [1]), `uninitialized element`);

// ./test/core/table_init.wast:1633
assert_trap(() => invoke($30, `test`, [2]), `uninitialized element`);

// ./test/core/table_init.wast:1634
assert_trap(() => invoke($30, `test`, [3]), `uninitialized element`);

// ./test/core/table_init.wast:1635
assert_trap(() => invoke($30, `test`, [4]), `uninitialized element`);

// ./test/core/table_init.wast:1636
assert_trap(() => invoke($30, `test`, [5]), `uninitialized element`);

// ./test/core/table_init.wast:1637
assert_trap(() => invoke($30, `test`, [6]), `uninitialized element`);

// ./test/core/table_init.wast:1638
assert_trap(() => invoke($30, `test`, [7]), `uninitialized element`);

// ./test/core/table_init.wast:1639
assert_trap(() => invoke($30, `test`, [8]), `uninitialized element`);

// ./test/core/table_init.wast:1640
assert_trap(() => invoke($30, `test`, [9]), `uninitialized element`);

// ./test/core/table_init.wast:1641
assert_trap(() => invoke($30, `test`, [10]), `uninitialized element`);

// ./test/core/table_init.wast:1642
assert_trap(() => invoke($30, `test`, [11]), `uninitialized element`);

// ./test/core/table_init.wast:1643
assert_trap(() => invoke($30, `test`, [12]), `uninitialized element`);

// ./test/core/table_init.wast:1644
assert_trap(() => invoke($30, `test`, [13]), `uninitialized element`);

// ./test/core/table_init.wast:1645
assert_trap(() => invoke($30, `test`, [14]), `uninitialized element`);

// ./test/core/table_init.wast:1646
assert_trap(() => invoke($30, `test`, [15]), `uninitialized element`);

// ./test/core/table_init.wast:1647
assert_trap(() => invoke($30, `test`, [16]), `uninitialized element`);

// ./test/core/table_init.wast:1648
assert_trap(() => invoke($30, `test`, [17]), `uninitialized element`);

// ./test/core/table_init.wast:1649
assert_trap(() => invoke($30, `test`, [18]), `uninitialized element`);

// ./test/core/table_init.wast:1650
assert_trap(() => invoke($30, `test`, [19]), `uninitialized element`);

// ./test/core/table_init.wast:1651
assert_trap(() => invoke($30, `test`, [20]), `uninitialized element`);

// ./test/core/table_init.wast:1652
assert_trap(() => invoke($30, `test`, [21]), `uninitialized element`);

// ./test/core/table_init.wast:1653
assert_trap(() => invoke($30, `test`, [22]), `uninitialized element`);

// ./test/core/table_init.wast:1654
assert_trap(() => invoke($30, `test`, [23]), `uninitialized element`);

// ./test/core/table_init.wast:1655
assert_trap(() => invoke($30, `test`, [24]), `uninitialized element`);

// ./test/core/table_init.wast:1656
assert_trap(() => invoke($30, `test`, [25]), `uninitialized element`);

// ./test/core/table_init.wast:1657
assert_trap(() => invoke($30, `test`, [26]), `uninitialized element`);

// ./test/core/table_init.wast:1658
assert_trap(() => invoke($30, `test`, [27]), `uninitialized element`);

// ./test/core/table_init.wast:1659
assert_trap(() => invoke($30, `test`, [28]), `uninitialized element`);

// ./test/core/table_init.wast:1660
assert_trap(() => invoke($30, `test`, [29]), `uninitialized element`);

// ./test/core/table_init.wast:1661
assert_trap(() => invoke($30, `test`, [30]), `uninitialized element`);

// ./test/core/table_init.wast:1662
assert_trap(() => invoke($30, `test`, [31]), `uninitialized element`);

// ./test/core/table_init.wast:1663
assert_trap(() => invoke($30, `test`, [32]), `uninitialized element`);

// ./test/core/table_init.wast:1664
assert_trap(() => invoke($30, `test`, [33]), `uninitialized element`);

// ./test/core/table_init.wast:1665
assert_trap(() => invoke($30, `test`, [34]), `uninitialized element`);

// ./test/core/table_init.wast:1666
assert_trap(() => invoke($30, `test`, [35]), `uninitialized element`);

// ./test/core/table_init.wast:1667
assert_trap(() => invoke($30, `test`, [36]), `uninitialized element`);

// ./test/core/table_init.wast:1668
assert_trap(() => invoke($30, `test`, [37]), `uninitialized element`);

// ./test/core/table_init.wast:1669
assert_trap(() => invoke($30, `test`, [38]), `uninitialized element`);

// ./test/core/table_init.wast:1670
assert_trap(() => invoke($30, `test`, [39]), `uninitialized element`);

// ./test/core/table_init.wast:1671
assert_trap(() => invoke($30, `test`, [40]), `uninitialized element`);

// ./test/core/table_init.wast:1672
assert_trap(() => invoke($30, `test`, [41]), `uninitialized element`);

// ./test/core/table_init.wast:1673
assert_trap(() => invoke($30, `test`, [42]), `uninitialized element`);

// ./test/core/table_init.wast:1674
assert_trap(() => invoke($30, `test`, [43]), `uninitialized element`);

// ./test/core/table_init.wast:1675
assert_trap(() => invoke($30, `test`, [44]), `uninitialized element`);

// ./test/core/table_init.wast:1676
assert_trap(() => invoke($30, `test`, [45]), `uninitialized element`);

// ./test/core/table_init.wast:1677
assert_trap(() => invoke($30, `test`, [46]), `uninitialized element`);

// ./test/core/table_init.wast:1678
assert_trap(() => invoke($30, `test`, [47]), `uninitialized element`);

// ./test/core/table_init.wast:1679
assert_trap(() => invoke($30, `test`, [48]), `uninitialized element`);

// ./test/core/table_init.wast:1680
assert_trap(() => invoke($30, `test`, [49]), `uninitialized element`);

// ./test/core/table_init.wast:1681
assert_trap(() => invoke($30, `test`, [50]), `uninitialized element`);

// ./test/core/table_init.wast:1682
assert_trap(() => invoke($30, `test`, [51]), `uninitialized element`);

// ./test/core/table_init.wast:1683
assert_trap(() => invoke($30, `test`, [52]), `uninitialized element`);

// ./test/core/table_init.wast:1684
assert_trap(() => invoke($30, `test`, [53]), `uninitialized element`);

// ./test/core/table_init.wast:1685
assert_trap(() => invoke($30, `test`, [54]), `uninitialized element`);

// ./test/core/table_init.wast:1686
assert_trap(() => invoke($30, `test`, [55]), `uninitialized element`);

// ./test/core/table_init.wast:1687
assert_trap(() => invoke($30, `test`, [56]), `uninitialized element`);

// ./test/core/table_init.wast:1688
assert_trap(() => invoke($30, `test`, [57]), `uninitialized element`);

// ./test/core/table_init.wast:1689
assert_trap(() => invoke($30, `test`, [58]), `uninitialized element`);

// ./test/core/table_init.wast:1690
assert_trap(() => invoke($30, `test`, [59]), `uninitialized element`);

// ./test/core/table_init.wast:1691
assert_trap(() => invoke($30, `test`, [60]), `uninitialized element`);

// ./test/core/table_init.wast:1692
assert_trap(() => invoke($30, `test`, [61]), `uninitialized element`);

// ./test/core/table_init.wast:1693
assert_trap(() => invoke($30, `test`, [62]), `uninitialized element`);

// ./test/core/table_init.wast:1694
assert_trap(() => invoke($30, `test`, [63]), `uninitialized element`);

// ./test/core/table_init.wast:1695
assert_trap(() => invoke($30, `test`, [64]), `uninitialized element`);

// ./test/core/table_init.wast:1696
assert_trap(() => invoke($30, `test`, [65]), `uninitialized element`);

// ./test/core/table_init.wast:1697
assert_trap(() => invoke($30, `test`, [66]), `uninitialized element`);

// ./test/core/table_init.wast:1698
assert_trap(() => invoke($30, `test`, [67]), `uninitialized element`);

// ./test/core/table_init.wast:1699
assert_trap(() => invoke($30, `test`, [68]), `uninitialized element`);

// ./test/core/table_init.wast:1700
assert_trap(() => invoke($30, `test`, [69]), `uninitialized element`);

// ./test/core/table_init.wast:1701
assert_trap(() => invoke($30, `test`, [70]), `uninitialized element`);

// ./test/core/table_init.wast:1702
assert_trap(() => invoke($30, `test`, [71]), `uninitialized element`);

// ./test/core/table_init.wast:1703
assert_trap(() => invoke($30, `test`, [72]), `uninitialized element`);

// ./test/core/table_init.wast:1704
assert_trap(() => invoke($30, `test`, [73]), `uninitialized element`);

// ./test/core/table_init.wast:1705
assert_trap(() => invoke($30, `test`, [74]), `uninitialized element`);

// ./test/core/table_init.wast:1706
assert_trap(() => invoke($30, `test`, [75]), `uninitialized element`);

// ./test/core/table_init.wast:1707
assert_trap(() => invoke($30, `test`, [76]), `uninitialized element`);

// ./test/core/table_init.wast:1708
assert_trap(() => invoke($30, `test`, [77]), `uninitialized element`);

// ./test/core/table_init.wast:1709
assert_trap(() => invoke($30, `test`, [78]), `uninitialized element`);

// ./test/core/table_init.wast:1710
assert_trap(() => invoke($30, `test`, [79]), `uninitialized element`);

// ./test/core/table_init.wast:1711
assert_trap(() => invoke($30, `test`, [80]), `uninitialized element`);

// ./test/core/table_init.wast:1712
assert_trap(() => invoke($30, `test`, [81]), `uninitialized element`);

// ./test/core/table_init.wast:1713
assert_trap(() => invoke($30, `test`, [82]), `uninitialized element`);

// ./test/core/table_init.wast:1714
assert_trap(() => invoke($30, `test`, [83]), `uninitialized element`);

// ./test/core/table_init.wast:1715
assert_trap(() => invoke($30, `test`, [84]), `uninitialized element`);

// ./test/core/table_init.wast:1716
assert_trap(() => invoke($30, `test`, [85]), `uninitialized element`);

// ./test/core/table_init.wast:1717
assert_trap(() => invoke($30, `test`, [86]), `uninitialized element`);

// ./test/core/table_init.wast:1718
assert_trap(() => invoke($30, `test`, [87]), `uninitialized element`);

// ./test/core/table_init.wast:1719
assert_trap(() => invoke($30, `test`, [88]), `uninitialized element`);

// ./test/core/table_init.wast:1720
assert_trap(() => invoke($30, `test`, [89]), `uninitialized element`);

// ./test/core/table_init.wast:1721
assert_trap(() => invoke($30, `test`, [90]), `uninitialized element`);

// ./test/core/table_init.wast:1722
assert_trap(() => invoke($30, `test`, [91]), `uninitialized element`);

// ./test/core/table_init.wast:1723
assert_trap(() => invoke($30, `test`, [92]), `uninitialized element`);

// ./test/core/table_init.wast:1724
assert_trap(() => invoke($30, `test`, [93]), `uninitialized element`);

// ./test/core/table_init.wast:1725
assert_trap(() => invoke($30, `test`, [94]), `uninitialized element`);

// ./test/core/table_init.wast:1726
assert_trap(() => invoke($30, `test`, [95]), `uninitialized element`);

// ./test/core/table_init.wast:1727
assert_trap(() => invoke($30, `test`, [96]), `uninitialized element`);

// ./test/core/table_init.wast:1728
assert_trap(() => invoke($30, `test`, [97]), `uninitialized element`);

// ./test/core/table_init.wast:1729
assert_trap(() => invoke($30, `test`, [98]), `uninitialized element`);

// ./test/core/table_init.wast:1730
assert_trap(() => invoke($30, `test`, [99]), `uninitialized element`);

// ./test/core/table_init.wast:1731
assert_trap(() => invoke($30, `test`, [100]), `uninitialized element`);

// ./test/core/table_init.wast:1732
assert_trap(() => invoke($30, `test`, [101]), `uninitialized element`);

// ./test/core/table_init.wast:1733
assert_trap(() => invoke($30, `test`, [102]), `uninitialized element`);

// ./test/core/table_init.wast:1734
assert_trap(() => invoke($30, `test`, [103]), `uninitialized element`);

// ./test/core/table_init.wast:1735
assert_trap(() => invoke($30, `test`, [104]), `uninitialized element`);

// ./test/core/table_init.wast:1736
assert_trap(() => invoke($30, `test`, [105]), `uninitialized element`);

// ./test/core/table_init.wast:1737
assert_trap(() => invoke($30, `test`, [106]), `uninitialized element`);

// ./test/core/table_init.wast:1738
assert_trap(() => invoke($30, `test`, [107]), `uninitialized element`);

// ./test/core/table_init.wast:1739
assert_trap(() => invoke($30, `test`, [108]), `uninitialized element`);

// ./test/core/table_init.wast:1740
assert_trap(() => invoke($30, `test`, [109]), `uninitialized element`);

// ./test/core/table_init.wast:1741
assert_trap(() => invoke($30, `test`, [110]), `uninitialized element`);

// ./test/core/table_init.wast:1742
assert_trap(() => invoke($30, `test`, [111]), `uninitialized element`);

// ./test/core/table_init.wast:1743
assert_trap(() => invoke($30, `test`, [112]), `uninitialized element`);

// ./test/core/table_init.wast:1744
assert_trap(() => invoke($30, `test`, [113]), `uninitialized element`);

// ./test/core/table_init.wast:1745
assert_trap(() => invoke($30, `test`, [114]), `uninitialized element`);

// ./test/core/table_init.wast:1746
assert_trap(() => invoke($30, `test`, [115]), `uninitialized element`);

// ./test/core/table_init.wast:1747
assert_trap(() => invoke($30, `test`, [116]), `uninitialized element`);

// ./test/core/table_init.wast:1748
assert_trap(() => invoke($30, `test`, [117]), `uninitialized element`);

// ./test/core/table_init.wast:1749
assert_trap(() => invoke($30, `test`, [118]), `uninitialized element`);

// ./test/core/table_init.wast:1750
assert_trap(() => invoke($30, `test`, [119]), `uninitialized element`);

// ./test/core/table_init.wast:1751
assert_trap(() => invoke($30, `test`, [120]), `uninitialized element`);

// ./test/core/table_init.wast:1752
assert_trap(() => invoke($30, `test`, [121]), `uninitialized element`);

// ./test/core/table_init.wast:1753
assert_trap(() => invoke($30, `test`, [122]), `uninitialized element`);

// ./test/core/table_init.wast:1754
assert_trap(() => invoke($30, `test`, [123]), `uninitialized element`);

// ./test/core/table_init.wast:1755
assert_trap(() => invoke($30, `test`, [124]), `uninitialized element`);

// ./test/core/table_init.wast:1756
assert_trap(() => invoke($30, `test`, [125]), `uninitialized element`);

// ./test/core/table_init.wast:1757
assert_trap(() => invoke($30, `test`, [126]), `uninitialized element`);

// ./test/core/table_init.wast:1758
assert_trap(() => invoke($30, `test`, [127]), `uninitialized element`);

// ./test/core/table_init.wast:1759
assert_trap(() => invoke($30, `test`, [128]), `uninitialized element`);

// ./test/core/table_init.wast:1760
assert_trap(() => invoke($30, `test`, [129]), `uninitialized element`);

// ./test/core/table_init.wast:1761
assert_trap(() => invoke($30, `test`, [130]), `uninitialized element`);

// ./test/core/table_init.wast:1762
assert_trap(() => invoke($30, `test`, [131]), `uninitialized element`);

// ./test/core/table_init.wast:1763
assert_trap(() => invoke($30, `test`, [132]), `uninitialized element`);

// ./test/core/table_init.wast:1764
assert_trap(() => invoke($30, `test`, [133]), `uninitialized element`);

// ./test/core/table_init.wast:1765
assert_trap(() => invoke($30, `test`, [134]), `uninitialized element`);

// ./test/core/table_init.wast:1766
assert_trap(() => invoke($30, `test`, [135]), `uninitialized element`);

// ./test/core/table_init.wast:1767
assert_trap(() => invoke($30, `test`, [136]), `uninitialized element`);

// ./test/core/table_init.wast:1768
assert_trap(() => invoke($30, `test`, [137]), `uninitialized element`);

// ./test/core/table_init.wast:1769
assert_trap(() => invoke($30, `test`, [138]), `uninitialized element`);

// ./test/core/table_init.wast:1770
assert_trap(() => invoke($30, `test`, [139]), `uninitialized element`);

// ./test/core/table_init.wast:1771
assert_trap(() => invoke($30, `test`, [140]), `uninitialized element`);

// ./test/core/table_init.wast:1772
assert_trap(() => invoke($30, `test`, [141]), `uninitialized element`);

// ./test/core/table_init.wast:1773
assert_trap(() => invoke($30, `test`, [142]), `uninitialized element`);

// ./test/core/table_init.wast:1774
assert_trap(() => invoke($30, `test`, [143]), `uninitialized element`);

// ./test/core/table_init.wast:1775
assert_trap(() => invoke($30, `test`, [144]), `uninitialized element`);

// ./test/core/table_init.wast:1776
assert_trap(() => invoke($30, `test`, [145]), `uninitialized element`);

// ./test/core/table_init.wast:1777
assert_trap(() => invoke($30, `test`, [146]), `uninitialized element`);

// ./test/core/table_init.wast:1778
assert_trap(() => invoke($30, `test`, [147]), `uninitialized element`);

// ./test/core/table_init.wast:1779
assert_trap(() => invoke($30, `test`, [148]), `uninitialized element`);

// ./test/core/table_init.wast:1780
assert_trap(() => invoke($30, `test`, [149]), `uninitialized element`);

// ./test/core/table_init.wast:1781
assert_trap(() => invoke($30, `test`, [150]), `uninitialized element`);

// ./test/core/table_init.wast:1782
assert_trap(() => invoke($30, `test`, [151]), `uninitialized element`);

// ./test/core/table_init.wast:1783
assert_trap(() => invoke($30, `test`, [152]), `uninitialized element`);

// ./test/core/table_init.wast:1784
assert_trap(() => invoke($30, `test`, [153]), `uninitialized element`);

// ./test/core/table_init.wast:1785
assert_trap(() => invoke($30, `test`, [154]), `uninitialized element`);

// ./test/core/table_init.wast:1786
assert_trap(() => invoke($30, `test`, [155]), `uninitialized element`);

// ./test/core/table_init.wast:1787
assert_trap(() => invoke($30, `test`, [156]), `uninitialized element`);

// ./test/core/table_init.wast:1788
assert_trap(() => invoke($30, `test`, [157]), `uninitialized element`);

// ./test/core/table_init.wast:1789
assert_trap(() => invoke($30, `test`, [158]), `uninitialized element`);

// ./test/core/table_init.wast:1790
assert_trap(() => invoke($30, `test`, [159]), `uninitialized element`);

// ./test/core/table_init.wast:1792
let $31 = instantiate(`(module
  (type (func (result i32)))
  (table 160 320 funcref)
  (elem funcref
    (ref.func $$f0) (ref.func $$f1) (ref.func $$f2) (ref.func $$f3)
    (ref.func $$f4) (ref.func $$f5) (ref.func $$f6) (ref.func $$f7)
    (ref.func $$f8) (ref.func $$f9) (ref.func $$f10) (ref.func $$f11)
    (ref.func $$f12) (ref.func $$f13) (ref.func $$f14) (ref.func $$f15))
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
  (func (export "run") (param $$offs i32) (param $$len i32)
    (table.init 0 (local.get $$offs) (i32.const 0) (local.get $$len))))`);

// ./test/core/table_init.wast:1820
assert_trap(() => invoke($31, `run`, [97, 31]), `out of bounds table access`);

// ./test/core/table_init.wast:1821
assert_trap(() => invoke($31, `test`, [0]), `uninitialized element`);

// ./test/core/table_init.wast:1822
assert_trap(() => invoke($31, `test`, [1]), `uninitialized element`);

// ./test/core/table_init.wast:1823
assert_trap(() => invoke($31, `test`, [2]), `uninitialized element`);

// ./test/core/table_init.wast:1824
assert_trap(() => invoke($31, `test`, [3]), `uninitialized element`);

// ./test/core/table_init.wast:1825
assert_trap(() => invoke($31, `test`, [4]), `uninitialized element`);

// ./test/core/table_init.wast:1826
assert_trap(() => invoke($31, `test`, [5]), `uninitialized element`);

// ./test/core/table_init.wast:1827
assert_trap(() => invoke($31, `test`, [6]), `uninitialized element`);

// ./test/core/table_init.wast:1828
assert_trap(() => invoke($31, `test`, [7]), `uninitialized element`);

// ./test/core/table_init.wast:1829
assert_trap(() => invoke($31, `test`, [8]), `uninitialized element`);

// ./test/core/table_init.wast:1830
assert_trap(() => invoke($31, `test`, [9]), `uninitialized element`);

// ./test/core/table_init.wast:1831
assert_trap(() => invoke($31, `test`, [10]), `uninitialized element`);

// ./test/core/table_init.wast:1832
assert_trap(() => invoke($31, `test`, [11]), `uninitialized element`);

// ./test/core/table_init.wast:1833
assert_trap(() => invoke($31, `test`, [12]), `uninitialized element`);

// ./test/core/table_init.wast:1834
assert_trap(() => invoke($31, `test`, [13]), `uninitialized element`);

// ./test/core/table_init.wast:1835
assert_trap(() => invoke($31, `test`, [14]), `uninitialized element`);

// ./test/core/table_init.wast:1836
assert_trap(() => invoke($31, `test`, [15]), `uninitialized element`);

// ./test/core/table_init.wast:1837
assert_trap(() => invoke($31, `test`, [16]), `uninitialized element`);

// ./test/core/table_init.wast:1838
assert_trap(() => invoke($31, `test`, [17]), `uninitialized element`);

// ./test/core/table_init.wast:1839
assert_trap(() => invoke($31, `test`, [18]), `uninitialized element`);

// ./test/core/table_init.wast:1840
assert_trap(() => invoke($31, `test`, [19]), `uninitialized element`);

// ./test/core/table_init.wast:1841
assert_trap(() => invoke($31, `test`, [20]), `uninitialized element`);

// ./test/core/table_init.wast:1842
assert_trap(() => invoke($31, `test`, [21]), `uninitialized element`);

// ./test/core/table_init.wast:1843
assert_trap(() => invoke($31, `test`, [22]), `uninitialized element`);

// ./test/core/table_init.wast:1844
assert_trap(() => invoke($31, `test`, [23]), `uninitialized element`);

// ./test/core/table_init.wast:1845
assert_trap(() => invoke($31, `test`, [24]), `uninitialized element`);

// ./test/core/table_init.wast:1846
assert_trap(() => invoke($31, `test`, [25]), `uninitialized element`);

// ./test/core/table_init.wast:1847
assert_trap(() => invoke($31, `test`, [26]), `uninitialized element`);

// ./test/core/table_init.wast:1848
assert_trap(() => invoke($31, `test`, [27]), `uninitialized element`);

// ./test/core/table_init.wast:1849
assert_trap(() => invoke($31, `test`, [28]), `uninitialized element`);

// ./test/core/table_init.wast:1850
assert_trap(() => invoke($31, `test`, [29]), `uninitialized element`);

// ./test/core/table_init.wast:1851
assert_trap(() => invoke($31, `test`, [30]), `uninitialized element`);

// ./test/core/table_init.wast:1852
assert_trap(() => invoke($31, `test`, [31]), `uninitialized element`);

// ./test/core/table_init.wast:1853
assert_trap(() => invoke($31, `test`, [32]), `uninitialized element`);

// ./test/core/table_init.wast:1854
assert_trap(() => invoke($31, `test`, [33]), `uninitialized element`);

// ./test/core/table_init.wast:1855
assert_trap(() => invoke($31, `test`, [34]), `uninitialized element`);

// ./test/core/table_init.wast:1856
assert_trap(() => invoke($31, `test`, [35]), `uninitialized element`);

// ./test/core/table_init.wast:1857
assert_trap(() => invoke($31, `test`, [36]), `uninitialized element`);

// ./test/core/table_init.wast:1858
assert_trap(() => invoke($31, `test`, [37]), `uninitialized element`);

// ./test/core/table_init.wast:1859
assert_trap(() => invoke($31, `test`, [38]), `uninitialized element`);

// ./test/core/table_init.wast:1860
assert_trap(() => invoke($31, `test`, [39]), `uninitialized element`);

// ./test/core/table_init.wast:1861
assert_trap(() => invoke($31, `test`, [40]), `uninitialized element`);

// ./test/core/table_init.wast:1862
assert_trap(() => invoke($31, `test`, [41]), `uninitialized element`);

// ./test/core/table_init.wast:1863
assert_trap(() => invoke($31, `test`, [42]), `uninitialized element`);

// ./test/core/table_init.wast:1864
assert_trap(() => invoke($31, `test`, [43]), `uninitialized element`);

// ./test/core/table_init.wast:1865
assert_trap(() => invoke($31, `test`, [44]), `uninitialized element`);

// ./test/core/table_init.wast:1866
assert_trap(() => invoke($31, `test`, [45]), `uninitialized element`);

// ./test/core/table_init.wast:1867
assert_trap(() => invoke($31, `test`, [46]), `uninitialized element`);

// ./test/core/table_init.wast:1868
assert_trap(() => invoke($31, `test`, [47]), `uninitialized element`);

// ./test/core/table_init.wast:1869
assert_trap(() => invoke($31, `test`, [48]), `uninitialized element`);

// ./test/core/table_init.wast:1870
assert_trap(() => invoke($31, `test`, [49]), `uninitialized element`);

// ./test/core/table_init.wast:1871
assert_trap(() => invoke($31, `test`, [50]), `uninitialized element`);

// ./test/core/table_init.wast:1872
assert_trap(() => invoke($31, `test`, [51]), `uninitialized element`);

// ./test/core/table_init.wast:1873
assert_trap(() => invoke($31, `test`, [52]), `uninitialized element`);

// ./test/core/table_init.wast:1874
assert_trap(() => invoke($31, `test`, [53]), `uninitialized element`);

// ./test/core/table_init.wast:1875
assert_trap(() => invoke($31, `test`, [54]), `uninitialized element`);

// ./test/core/table_init.wast:1876
assert_trap(() => invoke($31, `test`, [55]), `uninitialized element`);

// ./test/core/table_init.wast:1877
assert_trap(() => invoke($31, `test`, [56]), `uninitialized element`);

// ./test/core/table_init.wast:1878
assert_trap(() => invoke($31, `test`, [57]), `uninitialized element`);

// ./test/core/table_init.wast:1879
assert_trap(() => invoke($31, `test`, [58]), `uninitialized element`);

// ./test/core/table_init.wast:1880
assert_trap(() => invoke($31, `test`, [59]), `uninitialized element`);

// ./test/core/table_init.wast:1881
assert_trap(() => invoke($31, `test`, [60]), `uninitialized element`);

// ./test/core/table_init.wast:1882
assert_trap(() => invoke($31, `test`, [61]), `uninitialized element`);

// ./test/core/table_init.wast:1883
assert_trap(() => invoke($31, `test`, [62]), `uninitialized element`);

// ./test/core/table_init.wast:1884
assert_trap(() => invoke($31, `test`, [63]), `uninitialized element`);

// ./test/core/table_init.wast:1885
assert_trap(() => invoke($31, `test`, [64]), `uninitialized element`);

// ./test/core/table_init.wast:1886
assert_trap(() => invoke($31, `test`, [65]), `uninitialized element`);

// ./test/core/table_init.wast:1887
assert_trap(() => invoke($31, `test`, [66]), `uninitialized element`);

// ./test/core/table_init.wast:1888
assert_trap(() => invoke($31, `test`, [67]), `uninitialized element`);

// ./test/core/table_init.wast:1889
assert_trap(() => invoke($31, `test`, [68]), `uninitialized element`);

// ./test/core/table_init.wast:1890
assert_trap(() => invoke($31, `test`, [69]), `uninitialized element`);

// ./test/core/table_init.wast:1891
assert_trap(() => invoke($31, `test`, [70]), `uninitialized element`);

// ./test/core/table_init.wast:1892
assert_trap(() => invoke($31, `test`, [71]), `uninitialized element`);

// ./test/core/table_init.wast:1893
assert_trap(() => invoke($31, `test`, [72]), `uninitialized element`);

// ./test/core/table_init.wast:1894
assert_trap(() => invoke($31, `test`, [73]), `uninitialized element`);

// ./test/core/table_init.wast:1895
assert_trap(() => invoke($31, `test`, [74]), `uninitialized element`);

// ./test/core/table_init.wast:1896
assert_trap(() => invoke($31, `test`, [75]), `uninitialized element`);

// ./test/core/table_init.wast:1897
assert_trap(() => invoke($31, `test`, [76]), `uninitialized element`);

// ./test/core/table_init.wast:1898
assert_trap(() => invoke($31, `test`, [77]), `uninitialized element`);

// ./test/core/table_init.wast:1899
assert_trap(() => invoke($31, `test`, [78]), `uninitialized element`);

// ./test/core/table_init.wast:1900
assert_trap(() => invoke($31, `test`, [79]), `uninitialized element`);

// ./test/core/table_init.wast:1901
assert_trap(() => invoke($31, `test`, [80]), `uninitialized element`);

// ./test/core/table_init.wast:1902
assert_trap(() => invoke($31, `test`, [81]), `uninitialized element`);

// ./test/core/table_init.wast:1903
assert_trap(() => invoke($31, `test`, [82]), `uninitialized element`);

// ./test/core/table_init.wast:1904
assert_trap(() => invoke($31, `test`, [83]), `uninitialized element`);

// ./test/core/table_init.wast:1905
assert_trap(() => invoke($31, `test`, [84]), `uninitialized element`);

// ./test/core/table_init.wast:1906
assert_trap(() => invoke($31, `test`, [85]), `uninitialized element`);

// ./test/core/table_init.wast:1907
assert_trap(() => invoke($31, `test`, [86]), `uninitialized element`);

// ./test/core/table_init.wast:1908
assert_trap(() => invoke($31, `test`, [87]), `uninitialized element`);

// ./test/core/table_init.wast:1909
assert_trap(() => invoke($31, `test`, [88]), `uninitialized element`);

// ./test/core/table_init.wast:1910
assert_trap(() => invoke($31, `test`, [89]), `uninitialized element`);

// ./test/core/table_init.wast:1911
assert_trap(() => invoke($31, `test`, [90]), `uninitialized element`);

// ./test/core/table_init.wast:1912
assert_trap(() => invoke($31, `test`, [91]), `uninitialized element`);

// ./test/core/table_init.wast:1913
assert_trap(() => invoke($31, `test`, [92]), `uninitialized element`);

// ./test/core/table_init.wast:1914
assert_trap(() => invoke($31, `test`, [93]), `uninitialized element`);

// ./test/core/table_init.wast:1915
assert_trap(() => invoke($31, `test`, [94]), `uninitialized element`);

// ./test/core/table_init.wast:1916
assert_trap(() => invoke($31, `test`, [95]), `uninitialized element`);

// ./test/core/table_init.wast:1917
assert_trap(() => invoke($31, `test`, [96]), `uninitialized element`);

// ./test/core/table_init.wast:1918
assert_trap(() => invoke($31, `test`, [97]), `uninitialized element`);

// ./test/core/table_init.wast:1919
assert_trap(() => invoke($31, `test`, [98]), `uninitialized element`);

// ./test/core/table_init.wast:1920
assert_trap(() => invoke($31, `test`, [99]), `uninitialized element`);

// ./test/core/table_init.wast:1921
assert_trap(() => invoke($31, `test`, [100]), `uninitialized element`);

// ./test/core/table_init.wast:1922
assert_trap(() => invoke($31, `test`, [101]), `uninitialized element`);

// ./test/core/table_init.wast:1923
assert_trap(() => invoke($31, `test`, [102]), `uninitialized element`);

// ./test/core/table_init.wast:1924
assert_trap(() => invoke($31, `test`, [103]), `uninitialized element`);

// ./test/core/table_init.wast:1925
assert_trap(() => invoke($31, `test`, [104]), `uninitialized element`);

// ./test/core/table_init.wast:1926
assert_trap(() => invoke($31, `test`, [105]), `uninitialized element`);

// ./test/core/table_init.wast:1927
assert_trap(() => invoke($31, `test`, [106]), `uninitialized element`);

// ./test/core/table_init.wast:1928
assert_trap(() => invoke($31, `test`, [107]), `uninitialized element`);

// ./test/core/table_init.wast:1929
assert_trap(() => invoke($31, `test`, [108]), `uninitialized element`);

// ./test/core/table_init.wast:1930
assert_trap(() => invoke($31, `test`, [109]), `uninitialized element`);

// ./test/core/table_init.wast:1931
assert_trap(() => invoke($31, `test`, [110]), `uninitialized element`);

// ./test/core/table_init.wast:1932
assert_trap(() => invoke($31, `test`, [111]), `uninitialized element`);

// ./test/core/table_init.wast:1933
assert_trap(() => invoke($31, `test`, [112]), `uninitialized element`);

// ./test/core/table_init.wast:1934
assert_trap(() => invoke($31, `test`, [113]), `uninitialized element`);

// ./test/core/table_init.wast:1935
assert_trap(() => invoke($31, `test`, [114]), `uninitialized element`);

// ./test/core/table_init.wast:1936
assert_trap(() => invoke($31, `test`, [115]), `uninitialized element`);

// ./test/core/table_init.wast:1937
assert_trap(() => invoke($31, `test`, [116]), `uninitialized element`);

// ./test/core/table_init.wast:1938
assert_trap(() => invoke($31, `test`, [117]), `uninitialized element`);

// ./test/core/table_init.wast:1939
assert_trap(() => invoke($31, `test`, [118]), `uninitialized element`);

// ./test/core/table_init.wast:1940
assert_trap(() => invoke($31, `test`, [119]), `uninitialized element`);

// ./test/core/table_init.wast:1941
assert_trap(() => invoke($31, `test`, [120]), `uninitialized element`);

// ./test/core/table_init.wast:1942
assert_trap(() => invoke($31, `test`, [121]), `uninitialized element`);

// ./test/core/table_init.wast:1943
assert_trap(() => invoke($31, `test`, [122]), `uninitialized element`);

// ./test/core/table_init.wast:1944
assert_trap(() => invoke($31, `test`, [123]), `uninitialized element`);

// ./test/core/table_init.wast:1945
assert_trap(() => invoke($31, `test`, [124]), `uninitialized element`);

// ./test/core/table_init.wast:1946
assert_trap(() => invoke($31, `test`, [125]), `uninitialized element`);

// ./test/core/table_init.wast:1947
assert_trap(() => invoke($31, `test`, [126]), `uninitialized element`);

// ./test/core/table_init.wast:1948
assert_trap(() => invoke($31, `test`, [127]), `uninitialized element`);

// ./test/core/table_init.wast:1949
assert_trap(() => invoke($31, `test`, [128]), `uninitialized element`);

// ./test/core/table_init.wast:1950
assert_trap(() => invoke($31, `test`, [129]), `uninitialized element`);

// ./test/core/table_init.wast:1951
assert_trap(() => invoke($31, `test`, [130]), `uninitialized element`);

// ./test/core/table_init.wast:1952
assert_trap(() => invoke($31, `test`, [131]), `uninitialized element`);

// ./test/core/table_init.wast:1953
assert_trap(() => invoke($31, `test`, [132]), `uninitialized element`);

// ./test/core/table_init.wast:1954
assert_trap(() => invoke($31, `test`, [133]), `uninitialized element`);

// ./test/core/table_init.wast:1955
assert_trap(() => invoke($31, `test`, [134]), `uninitialized element`);

// ./test/core/table_init.wast:1956
assert_trap(() => invoke($31, `test`, [135]), `uninitialized element`);

// ./test/core/table_init.wast:1957
assert_trap(() => invoke($31, `test`, [136]), `uninitialized element`);

// ./test/core/table_init.wast:1958
assert_trap(() => invoke($31, `test`, [137]), `uninitialized element`);

// ./test/core/table_init.wast:1959
assert_trap(() => invoke($31, `test`, [138]), `uninitialized element`);

// ./test/core/table_init.wast:1960
assert_trap(() => invoke($31, `test`, [139]), `uninitialized element`);

// ./test/core/table_init.wast:1961
assert_trap(() => invoke($31, `test`, [140]), `uninitialized element`);

// ./test/core/table_init.wast:1962
assert_trap(() => invoke($31, `test`, [141]), `uninitialized element`);

// ./test/core/table_init.wast:1963
assert_trap(() => invoke($31, `test`, [142]), `uninitialized element`);

// ./test/core/table_init.wast:1964
assert_trap(() => invoke($31, `test`, [143]), `uninitialized element`);

// ./test/core/table_init.wast:1965
assert_trap(() => invoke($31, `test`, [144]), `uninitialized element`);

// ./test/core/table_init.wast:1966
assert_trap(() => invoke($31, `test`, [145]), `uninitialized element`);

// ./test/core/table_init.wast:1967
assert_trap(() => invoke($31, `test`, [146]), `uninitialized element`);

// ./test/core/table_init.wast:1968
assert_trap(() => invoke($31, `test`, [147]), `uninitialized element`);

// ./test/core/table_init.wast:1969
assert_trap(() => invoke($31, `test`, [148]), `uninitialized element`);

// ./test/core/table_init.wast:1970
assert_trap(() => invoke($31, `test`, [149]), `uninitialized element`);

// ./test/core/table_init.wast:1971
assert_trap(() => invoke($31, `test`, [150]), `uninitialized element`);

// ./test/core/table_init.wast:1972
assert_trap(() => invoke($31, `test`, [151]), `uninitialized element`);

// ./test/core/table_init.wast:1973
assert_trap(() => invoke($31, `test`, [152]), `uninitialized element`);

// ./test/core/table_init.wast:1974
assert_trap(() => invoke($31, `test`, [153]), `uninitialized element`);

// ./test/core/table_init.wast:1975
assert_trap(() => invoke($31, `test`, [154]), `uninitialized element`);

// ./test/core/table_init.wast:1976
assert_trap(() => invoke($31, `test`, [155]), `uninitialized element`);

// ./test/core/table_init.wast:1977
assert_trap(() => invoke($31, `test`, [156]), `uninitialized element`);

// ./test/core/table_init.wast:1978
assert_trap(() => invoke($31, `test`, [157]), `uninitialized element`);

// ./test/core/table_init.wast:1979
assert_trap(() => invoke($31, `test`, [158]), `uninitialized element`);

// ./test/core/table_init.wast:1980
assert_trap(() => invoke($31, `test`, [159]), `uninitialized element`);

// ./test/core/table_init.wast:1982
let $32 = instantiate(`(module
  (type (func (result i32)))
  (table 64 64 funcref)
  (elem funcref
    (ref.func $$f0) (ref.func $$f1) (ref.func $$f2) (ref.func $$f3)
    (ref.func $$f4) (ref.func $$f5) (ref.func $$f6) (ref.func $$f7)
    (ref.func $$f8) (ref.func $$f9) (ref.func $$f10) (ref.func $$f11)
    (ref.func $$f12) (ref.func $$f13) (ref.func $$f14) (ref.func $$f15))
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
  (func (export "run") (param $$offs i32) (param $$len i32)
    (table.init 0 (local.get $$offs) (i32.const 0) (local.get $$len))))`);

// ./test/core/table_init.wast:2010
assert_trap(() => invoke($32, `run`, [48, -16]), `out of bounds table access`);

// ./test/core/table_init.wast:2011
assert_trap(() => invoke($32, `test`, [0]), `uninitialized element`);

// ./test/core/table_init.wast:2012
assert_trap(() => invoke($32, `test`, [1]), `uninitialized element`);

// ./test/core/table_init.wast:2013
assert_trap(() => invoke($32, `test`, [2]), `uninitialized element`);

// ./test/core/table_init.wast:2014
assert_trap(() => invoke($32, `test`, [3]), `uninitialized element`);

// ./test/core/table_init.wast:2015
assert_trap(() => invoke($32, `test`, [4]), `uninitialized element`);

// ./test/core/table_init.wast:2016
assert_trap(() => invoke($32, `test`, [5]), `uninitialized element`);

// ./test/core/table_init.wast:2017
assert_trap(() => invoke($32, `test`, [6]), `uninitialized element`);

// ./test/core/table_init.wast:2018
assert_trap(() => invoke($32, `test`, [7]), `uninitialized element`);

// ./test/core/table_init.wast:2019
assert_trap(() => invoke($32, `test`, [8]), `uninitialized element`);

// ./test/core/table_init.wast:2020
assert_trap(() => invoke($32, `test`, [9]), `uninitialized element`);

// ./test/core/table_init.wast:2021
assert_trap(() => invoke($32, `test`, [10]), `uninitialized element`);

// ./test/core/table_init.wast:2022
assert_trap(() => invoke($32, `test`, [11]), `uninitialized element`);

// ./test/core/table_init.wast:2023
assert_trap(() => invoke($32, `test`, [12]), `uninitialized element`);

// ./test/core/table_init.wast:2024
assert_trap(() => invoke($32, `test`, [13]), `uninitialized element`);

// ./test/core/table_init.wast:2025
assert_trap(() => invoke($32, `test`, [14]), `uninitialized element`);

// ./test/core/table_init.wast:2026
assert_trap(() => invoke($32, `test`, [15]), `uninitialized element`);

// ./test/core/table_init.wast:2027
assert_trap(() => invoke($32, `test`, [16]), `uninitialized element`);

// ./test/core/table_init.wast:2028
assert_trap(() => invoke($32, `test`, [17]), `uninitialized element`);

// ./test/core/table_init.wast:2029
assert_trap(() => invoke($32, `test`, [18]), `uninitialized element`);

// ./test/core/table_init.wast:2030
assert_trap(() => invoke($32, `test`, [19]), `uninitialized element`);

// ./test/core/table_init.wast:2031
assert_trap(() => invoke($32, `test`, [20]), `uninitialized element`);

// ./test/core/table_init.wast:2032
assert_trap(() => invoke($32, `test`, [21]), `uninitialized element`);

// ./test/core/table_init.wast:2033
assert_trap(() => invoke($32, `test`, [22]), `uninitialized element`);

// ./test/core/table_init.wast:2034
assert_trap(() => invoke($32, `test`, [23]), `uninitialized element`);

// ./test/core/table_init.wast:2035
assert_trap(() => invoke($32, `test`, [24]), `uninitialized element`);

// ./test/core/table_init.wast:2036
assert_trap(() => invoke($32, `test`, [25]), `uninitialized element`);

// ./test/core/table_init.wast:2037
assert_trap(() => invoke($32, `test`, [26]), `uninitialized element`);

// ./test/core/table_init.wast:2038
assert_trap(() => invoke($32, `test`, [27]), `uninitialized element`);

// ./test/core/table_init.wast:2039
assert_trap(() => invoke($32, `test`, [28]), `uninitialized element`);

// ./test/core/table_init.wast:2040
assert_trap(() => invoke($32, `test`, [29]), `uninitialized element`);

// ./test/core/table_init.wast:2041
assert_trap(() => invoke($32, `test`, [30]), `uninitialized element`);

// ./test/core/table_init.wast:2042
assert_trap(() => invoke($32, `test`, [31]), `uninitialized element`);

// ./test/core/table_init.wast:2043
assert_trap(() => invoke($32, `test`, [32]), `uninitialized element`);

// ./test/core/table_init.wast:2044
assert_trap(() => invoke($32, `test`, [33]), `uninitialized element`);

// ./test/core/table_init.wast:2045
assert_trap(() => invoke($32, `test`, [34]), `uninitialized element`);

// ./test/core/table_init.wast:2046
assert_trap(() => invoke($32, `test`, [35]), `uninitialized element`);

// ./test/core/table_init.wast:2047
assert_trap(() => invoke($32, `test`, [36]), `uninitialized element`);

// ./test/core/table_init.wast:2048
assert_trap(() => invoke($32, `test`, [37]), `uninitialized element`);

// ./test/core/table_init.wast:2049
assert_trap(() => invoke($32, `test`, [38]), `uninitialized element`);

// ./test/core/table_init.wast:2050
assert_trap(() => invoke($32, `test`, [39]), `uninitialized element`);

// ./test/core/table_init.wast:2051
assert_trap(() => invoke($32, `test`, [40]), `uninitialized element`);

// ./test/core/table_init.wast:2052
assert_trap(() => invoke($32, `test`, [41]), `uninitialized element`);

// ./test/core/table_init.wast:2053
assert_trap(() => invoke($32, `test`, [42]), `uninitialized element`);

// ./test/core/table_init.wast:2054
assert_trap(() => invoke($32, `test`, [43]), `uninitialized element`);

// ./test/core/table_init.wast:2055
assert_trap(() => invoke($32, `test`, [44]), `uninitialized element`);

// ./test/core/table_init.wast:2056
assert_trap(() => invoke($32, `test`, [45]), `uninitialized element`);

// ./test/core/table_init.wast:2057
assert_trap(() => invoke($32, `test`, [46]), `uninitialized element`);

// ./test/core/table_init.wast:2058
assert_trap(() => invoke($32, `test`, [47]), `uninitialized element`);

// ./test/core/table_init.wast:2059
assert_trap(() => invoke($32, `test`, [48]), `uninitialized element`);

// ./test/core/table_init.wast:2060
assert_trap(() => invoke($32, `test`, [49]), `uninitialized element`);

// ./test/core/table_init.wast:2061
assert_trap(() => invoke($32, `test`, [50]), `uninitialized element`);

// ./test/core/table_init.wast:2062
assert_trap(() => invoke($32, `test`, [51]), `uninitialized element`);

// ./test/core/table_init.wast:2063
assert_trap(() => invoke($32, `test`, [52]), `uninitialized element`);

// ./test/core/table_init.wast:2064
assert_trap(() => invoke($32, `test`, [53]), `uninitialized element`);

// ./test/core/table_init.wast:2065
assert_trap(() => invoke($32, `test`, [54]), `uninitialized element`);

// ./test/core/table_init.wast:2066
assert_trap(() => invoke($32, `test`, [55]), `uninitialized element`);

// ./test/core/table_init.wast:2067
assert_trap(() => invoke($32, `test`, [56]), `uninitialized element`);

// ./test/core/table_init.wast:2068
assert_trap(() => invoke($32, `test`, [57]), `uninitialized element`);

// ./test/core/table_init.wast:2069
assert_trap(() => invoke($32, `test`, [58]), `uninitialized element`);

// ./test/core/table_init.wast:2070
assert_trap(() => invoke($32, `test`, [59]), `uninitialized element`);

// ./test/core/table_init.wast:2071
assert_trap(() => invoke($32, `test`, [60]), `uninitialized element`);

// ./test/core/table_init.wast:2072
assert_trap(() => invoke($32, `test`, [61]), `uninitialized element`);

// ./test/core/table_init.wast:2073
assert_trap(() => invoke($32, `test`, [62]), `uninitialized element`);

// ./test/core/table_init.wast:2074
assert_trap(() => invoke($32, `test`, [63]), `uninitialized element`);

// ./test/core/table_init.wast:2076
let $33 = instantiate(`(module
  (type (func (result i32)))
  (table 16 16 funcref)
  (elem funcref
    (ref.func $$f0) (ref.func $$f1) (ref.func $$f2) (ref.func $$f3)
    (ref.func $$f4) (ref.func $$f5) (ref.func $$f6) (ref.func $$f7)
    (ref.func $$f8) (ref.func $$f9) (ref.func $$f10) (ref.func $$f11)
    (ref.func $$f12) (ref.func $$f13) (ref.func $$f14) (ref.func $$f15))
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
  (func (export "run") (param $$offs i32) (param $$len i32)
    (table.init 0 (local.get $$offs) (i32.const 8) (local.get $$len))))`);

// ./test/core/table_init.wast:2104
assert_trap(() => invoke($33, `run`, [0, -4]), `out of bounds table access`);

// ./test/core/table_init.wast:2105
assert_trap(() => invoke($33, `test`, [0]), `uninitialized element`);

// ./test/core/table_init.wast:2106
assert_trap(() => invoke($33, `test`, [1]), `uninitialized element`);

// ./test/core/table_init.wast:2107
assert_trap(() => invoke($33, `test`, [2]), `uninitialized element`);

// ./test/core/table_init.wast:2108
assert_trap(() => invoke($33, `test`, [3]), `uninitialized element`);

// ./test/core/table_init.wast:2109
assert_trap(() => invoke($33, `test`, [4]), `uninitialized element`);

// ./test/core/table_init.wast:2110
assert_trap(() => invoke($33, `test`, [5]), `uninitialized element`);

// ./test/core/table_init.wast:2111
assert_trap(() => invoke($33, `test`, [6]), `uninitialized element`);

// ./test/core/table_init.wast:2112
assert_trap(() => invoke($33, `test`, [7]), `uninitialized element`);

// ./test/core/table_init.wast:2113
assert_trap(() => invoke($33, `test`, [8]), `uninitialized element`);

// ./test/core/table_init.wast:2114
assert_trap(() => invoke($33, `test`, [9]), `uninitialized element`);

// ./test/core/table_init.wast:2115
assert_trap(() => invoke($33, `test`, [10]), `uninitialized element`);

// ./test/core/table_init.wast:2116
assert_trap(() => invoke($33, `test`, [11]), `uninitialized element`);

// ./test/core/table_init.wast:2117
assert_trap(() => invoke($33, `test`, [12]), `uninitialized element`);

// ./test/core/table_init.wast:2118
assert_trap(() => invoke($33, `test`, [13]), `uninitialized element`);

// ./test/core/table_init.wast:2119
assert_trap(() => invoke($33, `test`, [14]), `uninitialized element`);

// ./test/core/table_init.wast:2120
assert_trap(() => invoke($33, `test`, [15]), `uninitialized element`);

// ./test/core/table_init.wast:2122
let $34 = instantiate(`(module
  (table 1 funcref)
  ;; 65 elem segments. 64 is the smallest positive number that is encoded
  ;; differently as a signed LEB.
  (elem funcref) (elem funcref) (elem funcref) (elem funcref)
  (elem funcref) (elem funcref) (elem funcref) (elem funcref)
  (elem funcref) (elem funcref) (elem funcref) (elem funcref)
  (elem funcref) (elem funcref) (elem funcref) (elem funcref)
  (elem funcref) (elem funcref) (elem funcref) (elem funcref)
  (elem funcref) (elem funcref) (elem funcref) (elem funcref)
  (elem funcref) (elem funcref) (elem funcref) (elem funcref)
  (elem funcref) (elem funcref) (elem funcref) (elem funcref)
  (elem funcref) (elem funcref) (elem funcref) (elem funcref)
  (elem funcref) (elem funcref) (elem funcref) (elem funcref)
  (elem funcref) (elem funcref) (elem funcref) (elem funcref)
  (elem funcref) (elem funcref) (elem funcref) (elem funcref)
  (elem funcref) (elem funcref) (elem funcref) (elem funcref)
  (elem funcref) (elem funcref) (elem funcref) (elem funcref)
  (elem funcref) (elem funcref) (elem funcref) (elem funcref)
  (elem funcref) (elem funcref) (elem funcref) (elem funcref)
  (elem funcref)
  (func (table.init 64 (i32.const 0) (i32.const 0) (i32.const 0))))`);
