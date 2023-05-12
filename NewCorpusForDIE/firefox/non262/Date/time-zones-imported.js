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

// |reftest| skip-if(xulRuntime.OS=="WINNT"||!this.hasOwnProperty("Intl")) -- Windows doesn't accept IANA names for the TZ env variable; Requires ICU time zone support

// Imported tests from es6draft and then adapted to use ICU/CLDR time zone display names.

function assertSame(expected, actual, message = undefined) {
  if (message !== undefined)
    assertEq(actual, expected, String(message));
  else
    assertEq(actual, expected);
}

function assertTrue(actual, message = undefined) {
  assertSame(true, actual, message);
}

// File: lib/datetime.jsm
const {
  DayOfWeek,
  Month,
  DateTime,
  TimeZone,
  Format,
} = (function() {

// 5.2 Algorithm Conventions
function modulo(dividend, divisor) {
  assertTrue(typeof dividend === "number");
  assertTrue(typeof divisor === "number");
  assertTrue(divisor !== 0 && Number.isFinite(divisor));
  let remainder = dividend % divisor;
  // NB: add +0 to convert -0 to +0
  return (remainder >= 0 ? remainder + 0 : remainder + divisor);
}

// 7.1.4 ToInteger ( argument )
function ToInteger(number) {
  /* steps 1-2 */
  assertTrue(typeof number === "number");
  /* step 3 */
  if (Number.isNaN(number))
    return +0.0;
  /* step 4 */
  if (number == 0.0 || !Number.isFinite(number))
    return number;
  /* step 5 */
  return Math.sign(number) * Math.floor(Math.abs(number));
}

// 20.3.1.2 Day Number and Time within Day
const msPerDay = 86400000;

// 20.3.1.2 Day Number and Time within Day
function Day(t) {
  assertTrue(typeof t === "number");
  return Math.floor(t / msPerDay);
}

// 20.3.1.2 Day Number and Time within Day
function TimeWithinDay(t) {
  assertTrue(typeof t === "number");
  return modulo(t, msPerDay);
}

// 20.3.1.3 Year Number
function DaysInYear(y) {
  assertTrue(typeof y === "number");
  if (y % 4 !== 0) {
    return 365;
  }
  if (y % 100 !== 0) {
    return 366;
  }
  if (y % 400 !== 0) {
    return 365;
  }
  return 366;
}

// 20.3.1.3 Year Number
function DayFromYear(y) {
  assertTrue(typeof y === "number");
  return 365 * (y - 1970) + Math.floor((y - 1969) / 4) - Math.floor((y - 1901) / 100) + Math.floor((y - 1601) / 400);
}

// 20.3.1.3 Year Number
function TimeFromYear(y) {
  assertTrue(typeof y === "number");
  return msPerDay * DayFromYear(y);
}

// TODO: fill in rest

// 20.3.1.10 Hours, Minutes, Second, and Milliseconds
const HoursPerDay = 24;
const MinutesPerHour = 60;
const SecondsPerMinute = 60;
const msPerSecond = 1000;
const msPerMinute = msPerSecond * SecondsPerMinute;
const msPerHour = msPerMinute * MinutesPerHour;

// 20.3.1.10 Hours, Minutes, Second, and Milliseconds
function HourFromTime(t) {
  assertTrue(typeof t === "number");
  return modulo(Math.floor(t / msPerHour), HoursPerDay);
}

// 20.3.1.10 Hours, Minutes, Second, and Milliseconds
function MinFromTime(t) {
  assertTrue(typeof t === "number");
  return modulo(Math.floor(t / msPerMinute), MinutesPerHour);
}

// 20.3.1.10 Hours, Minutes, Second, and Milliseconds
function SecFromTime(t) {
  assertTrue(typeof t === "number");
  return modulo(Math.floor(t / msPerSecond), SecondsPerMinute);
}

// 20.3.1.10 Hours, Minutes, Second, and Milliseconds
function msFromTime(t) {
  assertTrue(typeof t === "number");
  return modulo(t, msPerSecond);
}

// 20.3.1.11 MakeTime (hour, min, sec, ms)
function MakeTime(hour, min, sec, ms) {
  assertTrue(typeof hour === "number");
  assertTrue(typeof min === "number");
  assertTrue(typeof sec === "number");
  assertTrue(typeof ms === "number");
  if (!Number.isFinite(hour) || !Number.isFinite(min) || !Number.isFinite(sec) || !Number.isFinite(ms)) {
    return Number.NaN;
  }
  let h = ToInteger(hour);
  let m = ToInteger(min);
  let s = ToInteger(sec);
  let milli = ToInteger(ms);
  let t = h * msPerHour + m * msPerMinute + s * msPerSecond + milli;
  return t;
}

// 20.3.1.12 MakeDay (year, month, date)
function MakeDay(year, month, date) {
  assertTrue(typeof year === "number");
  assertTrue(typeof month === "number");
  assertTrue(typeof date === "number");
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(date)) {
    return Number.NaN;
  }
  let y = ToInteger(year);
  let m = ToInteger(month);
  let dt = ToInteger(date);
  let ym = y + Math.floor(m / 12);
  let mn = modulo(m, 12);

  const monthStart = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let day = Math.floor(TimeFromYear(ym) / msPerDay) + monthStart[mn];
  if (mn >= 2 && DaysInYear(ym) == 366) {
    day += 1;
  }

  return day + dt - 1;
}

// 20.3.1.13 MakeDate (day, time)
function MakeDate(day, time) {
  assertTrue(typeof day === "number");
  assertTrue(typeof time === "number");
  if (!Number.isFinite(day) || !Number.isFinite(time)) {
    return Number.NaN;
  }
  return day * msPerDay + time;
}

// 20.3.1.14 TimeClip (time)
function TimeClip(time) {
  assertTrue(typeof time === "number");
  if (!Number.isFinite(time)) {
    return Number.NaN;
  }
  if (Math.abs(time) > 8.64e15) {
    return Number.NaN;
  }
  return ToInteger(time) + (+0);
}

const DayOfWeek = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

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

const DateTime = {
  Local: class {
    constructor(year, month, day, weekday, hour = 0, minute = 0, second = 0, ms = 0) {
      Object.assign(this, {year, month, day, weekday, hour, minute, second, ms});
    }

    toDate() {
      return new Date(this.year, this.month, this.day, this.hour, this.minute, this.second, this.ms);
    }
  },
  UTC: class {
    constructor(year, month, day, weekday, hour = 0, minute = 0, second = 0, ms = 0) {
      Object.assign(this, {year, month, day, weekday, hour, minute, second, ms});
    }

    toInstant() {
      return MakeDate(MakeDay(this.year, this.month, this.day), MakeTime(this.hour, this.minute, this.second, this.ms));
    }
  },
};

function TimeZone(hour, minute = 0, second = 0) {
  return new class TimeZone {
    constructor(hour, minute, second) {
      Object.assign(this, {hour, minute, second});
    }

    toOffset() {
      let offset = TimeZoneOffset(this.hour, this.minute, this.second);
      return offset !== 0 ? -offset : 0;
    }
  }(hour, minute, second);

  function TimeZoneOffset(hour, minute = 0, second = 0) {
    assertTrue(typeof hour === "number");
    assertTrue(typeof minute === "number");
    assertTrue(typeof second === "number");
    assertTrue(minute >= 0);
    assertTrue(second >= 0);
    if (hour < 0 || Object.is(-0, hour)) {
      return hour * MinutesPerHour - minute - (second / 60);
    }
    return hour * MinutesPerHour + minute + (second / 60);
  }
}

const Format = {
  Locale: "en-US",
  DateTime: {
    localeMatcher: "lookup",
    timeZone: void 0,
    weekday: "short",
    era: void 0,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
    formatMatcher: "best fit",
    hour12: void 0,
  },
  Date: {
    localeMatcher: "lookup",
    timeZone: void 0,
    weekday: "short",
    era: void 0,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: void 0,
    minute: void 0,
    second: void 0,
    timeZoneName: void 0,
    formatMatcher: "best fit",
    hour12: void 0,
  },
  Time: {
    localeMatcher: "lookup",
    timeZone: void 0,
    weekday: void 0,
    era: void 0,
    year: void 0,
    month: void 0,
    day: void 0,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
    formatMatcher: "best fit",
    hour12: void 0,
  },
};

return {
  DayOfWeek,
  Month,
  DateTime,
  TimeZone,
  Format,
};
})();


// File: lib/assert-datetime.js

function assertDate(local, utc, timeZone, options, formatArgs) {
  let d = local.toDate();
  assertDateValue(d, utc.toInstant(), timeZone.toOffset());
  assertLocalDate(d, local);
  assertUTCDate(d, utc);
  assertDateString(d, options, formatArgs);
}

function assertDateValue(actual, dateValue, timeZoneOffset) {
  assertSame(dateValue, actual.valueOf(), `valueOf()[${dateValue - actual.valueOf()}]`);
  assertSame(dateValue, actual.getTime(), `valueOf()[${dateValue - actual.getTime()}]`);
  assertSame(timeZoneOffset, actual.getTimezoneOffset(), "getTimezoneOffset()");
}

function assertLocalDate(actual, {year, month, day, weekday, hour = 0, minute = 0, second = 0, ms = 0}) {
  assertSame(year, actual.getFullYear(), "getFullYear()");
  assertSame(month, actual.getMonth(), "getMonth()");
  assertSame(day, actual.getDate(), "getDate()");
  assertSame(weekday, actual.getDay(), "getDay()");
  assertSame(hour, actual.getHours(), "getHours()");
  assertSame(minute, actual.getMinutes(), "getMinutes()");
  assertSame(second, actual.getSeconds(), "getSeconds()");
  assertSame(ms, actual.getMilliseconds(), "getMilliseconds()");
}

function assertUTCDate(actual, {year, month, day, weekday, hour = 0, minute = 0, second = 0, ms = 0}) {
  assertSame(year, actual.getUTCFullYear(), "getUTCFullYear()");
  assertSame(month, actual.getUTCMonth(), "getUTCMonth()");
  assertSame(day, actual.getUTCDate(), "getUTCDate()");
  assertSame(weekday, actual.getUTCDay(), "getUTCDay()");
  assertSame(hour, actual.getUTCHours(), "getUTCHours()");
  assertSame(minute, actual.getUTCMinutes(), "getUTCMinutes()");
  assertSame(second, actual.getUTCSeconds(), "getUTCSeconds()");
  assertSame(ms, actual.getUTCMilliseconds(), "getUTCMilliseconds()");
}

function assertDateString(actual, options, formatArgs = {
  LocaleString: [Format.Locale, Format.DateTime],
  LocaleDateString: [Format.Locale, Format.Date],
  LocaleTimeString: [Format.Locale, Format.Time],
}) {
  for (var key of Object.keys(options)) {
    var args = formatArgs[key] || [];
    assertSame(options[key], actual[`to${key}`](...args), `to${key}()`);
  }
}


// File: Date/Africa_Monrovia.js
// Liberia was the last country to switch to UTC based offsets (1972 May).

inTimeZone("Africa/Monrovia", () => {
{
  let local = new DateTime.Local(1972, Month.January, 6, DayOfWeek.Thursday, 0, 0, 0);
  let utc = new DateTime.UTC(1972, Month.January, 6, DayOfWeek.Thursday, 0, 44, 30);

  assertDate(local, utc, TimeZone(-0,44,30), {
    String: "Thu Jan 06 1972 00:00:00 GMT-0044 (Greenwich Mean Time)",
    UTCString: "Thu, 06 Jan 1972 00:44:30 GMT",
  });
}

{
  let local = new DateTime.Local(1972, Month.January, 6, DayOfWeek.Thursday, 23, 59, 0);
  let utc = new DateTime.UTC(1972, Month.January, 7, DayOfWeek.Friday, 0, 43, 30);

  assertDate(local, utc, TimeZone(-0,44,30), {
    String: "Thu Jan 06 1972 23:59:00 GMT-0044 (Greenwich Mean Time)",
    UTCString: "Fri, 07 Jan 1972 00:43:30 GMT",
  });
}

{
  let local = new DateTime.Local(1972, Month.January, 7, DayOfWeek.Friday, 0, 0, 0);
  let utc = new DateTime.UTC(1972, Month.January, 7, DayOfWeek.Friday, 0, 44, 30);

  assertDateValue(local.toDate(), utc.toInstant(), TimeZone(+0).toOffset());

  assertDateString(local.toDate(), {
    String: "Fri Jan 07 1972 00:44:30 GMT+0000 (Greenwich Mean Time)",
    UTCString: "Fri, 07 Jan 1972 00:44:30 GMT",
  });
}

{
  let local = new DateTime.Local(1972, Month.January, 7, DayOfWeek.Friday, 0, 44, 30);
  let utc = new DateTime.UTC(1972, Month.January, 7, DayOfWeek.Friday, 0, 44, 30);

  assertDate(local, utc, TimeZone(+0), {
    String: "Fri Jan 07 1972 00:44:30 GMT+0000 (Greenwich Mean Time)",
    UTCString: "Fri, 07 Jan 1972 00:44:30 GMT",
  });
}

{
  let local = new DateTime.Local(1972, Month.January, 7, DayOfWeek.Friday, 0, 45, 0);
  let utc = new DateTime.UTC(1972, Month.January, 7, DayOfWeek.Friday, 0, 45, 0);

  assertDate(local, utc, TimeZone(+0), {
    String: "Fri Jan 07 1972 00:45:00 GMT+0000 (Greenwich Mean Time)",
    UTCString: "Fri, 07 Jan 1972 00:45:00 GMT",
  });
}

{
  let local = new DateTime.Local(1972, Month.January, 8, DayOfWeek.Saturday, 0, 0, 0);
  let utc = new DateTime.UTC(1972, Month.January, 8, DayOfWeek.Saturday, 0, 0, 0);

  assertDate(local, utc, TimeZone(+0), {
    String: "Sat Jan 08 1972 00:00:00 GMT+0000 (Greenwich Mean Time)",
    UTCString: "Sat, 08 Jan 1972 00:00:00 GMT",
  });
}
});


// File: Date/Africa_Monrovia.js
// Africa/Tripoli switched from +02:00 to +01:00 and back.

inTimeZone("Africa/Tripoli", () => {
{
  // +02:00 (standard time)
  let local = new DateTime.Local(2012, Month.November, 1, DayOfWeek.Thursday, 0, 0, 0);
  let utc = new DateTime.UTC(2012, Month.October, 31, DayOfWeek.Wednesday, 22, 0, 0);

  assertDate(local, utc, TimeZone(+2), {
    String: "Thu Nov 01 2012 00:00:00 GMT+0200 (Eastern European Standard Time)",
    UTCString: "Wed, 31 Oct 2012 22:00:00 GMT",
  });
}

{
  // +01:00 (standard time)
  let local = new DateTime.Local(2012, Month.December, 1, DayOfWeek.Saturday, 0, 0, 0);
  let utc = new DateTime.UTC(2012, Month.November, 30, DayOfWeek.Friday, 23, 0, 0);

  assertDate(local, utc, TimeZone(+1), {
    String: "Sat Dec 01 2012 00:00:00 GMT+0100 (Eastern European Standard Time)",
    UTCString: "Fri, 30 Nov 2012 23:00:00 GMT",
  });
}

{
  // +01:00 (daylight savings)
  let local = new DateTime.Local(2013, Month.October, 1, DayOfWeek.Tuesday, 0, 0, 0);
  let utc = new DateTime.UTC(2013, Month.September, 30, DayOfWeek.Monday, 22, 0, 0);

  assertDate(local, utc, TimeZone(+2), {
    String: "Tue Oct 01 2013 00:00:00 GMT+0200 (Eastern European Summer Time)",
    UTCString: "Mon, 30 Sep 2013 22:00:00 GMT",
  });
}

{
  // +02:00 (standard time)
  let local = new DateTime.Local(2013, Month.November, 1, DayOfWeek.Friday, 0, 0, 0);
  let utc = new DateTime.UTC(2013, Month.October, 31, DayOfWeek.Thursday, 22, 0, 0);

  assertDate(local, utc, TimeZone(+2), {
    String: "Fri Nov 01 2013 00:00:00 GMT+0200 (Eastern European Standard Time)",
    UTCString: "Thu, 31 Oct 2013 22:00:00 GMT",
  });
}
});


// File: Date/America_Caracas.js
// America/Caracas switched from -04:00 to -04:30 on 2007 Dec 9.

inTimeZone("America/Caracas", () => {
{
  // -04:00 (standard time)
  let local = new DateTime.Local(2007, Month.December, 5, DayOfWeek.Wednesday, 0, 0, 0);
  let utc = new DateTime.UTC(2007, Month.December, 5, DayOfWeek.Wednesday, 4, 0, 0);

  assertDate(local, utc, TimeZone(-4), {
    String: "Wed Dec 05 2007 00:00:00 GMT-0400 (Venezuela Time)",
    DateString: "Wed Dec 05 2007",
    TimeString: "00:00:00 GMT-0400 (Venezuela Time)",
    UTCString: "Wed, 05 Dec 2007 04:00:00 GMT",
    ISOString: "2007-12-05T04:00:00.000Z",
    LocaleString: "Wed, 12/05/2007, 12:00:00 AM GMT-4",
    LocaleDateString: "Wed, 12/05/2007",
    LocaleTimeString: "12:00:00 AM GMT-4",
  });
}

{
  // -04:30 (standard time)
  let local = new DateTime.Local(2007, Month.December, 12, DayOfWeek.Wednesday, 0, 0, 0);
  let utc = new DateTime.UTC(2007, Month.December, 12, DayOfWeek.Wednesday, 4, 30, 0);

  assertDate(local, utc, TimeZone(-4, 30), {
    String: "Wed Dec 12 2007 00:00:00 GMT-0430 (Venezuela Time)",
    DateString: "Wed Dec 12 2007",
    TimeString: "00:00:00 GMT-0430 (Venezuela Time)",
    UTCString: "Wed, 12 Dec 2007 04:30:00 GMT",
    ISOString: "2007-12-12T04:30:00.000Z",
    LocaleString: "Wed, 12/12/2007, 12:00:00 AM GMT-4:30",
    LocaleDateString: "Wed, 12/12/2007",
    LocaleTimeString: "12:00:00 AM GMT-4:30",
  });
}
});


// File: Date/Australia_Lord_Howe.js
// Australia/Lord_Howe time zone offset is +10:30 and daylight savings amount is 00:30.

inTimeZone("Australia/Lord_Howe", () => {
{
  // +10:30 (standard time)
  let local = new DateTime.Local(2010, Month.August, 1, DayOfWeek.Sunday, 0, 0, 0);
  let utc = new DateTime.UTC(2010, Month.July, 31, DayOfWeek.Saturday, 13, 30, 0);

  assertDate(local, utc, TimeZone(+10,30), {
    String: "Sun Aug 01 2010 00:00:00 GMT+1030 (Lord Howe Standard Time)",
    DateString: "Sun Aug 01 2010",
    TimeString: "00:00:00 GMT+1030 (Lord Howe Standard Time)",
    UTCString: "Sat, 31 Jul 2010 13:30:00 GMT",
    ISOString: "2010-07-31T13:30:00.000Z",
    LocaleString: "Sun, 08/01/2010, 12:00:00 AM GMT+10:30",
    LocaleDateString: "Sun, 08/01/2010",
    LocaleTimeString: "12:00:00 AM GMT+10:30",
  });
}

{
  // +10:30 (daylight savings)
  let local = new DateTime.Local(2010, Month.January, 3, DayOfWeek.Sunday, 0, 0, 0);
  let utc = new DateTime.UTC(2010, Month.January, 2, DayOfWeek.Saturday, 13, 0, 0);

  assertDate(local, utc, TimeZone(+11), {
    String: "Sun Jan 03 2010 00:00:00 GMT+1100 (Lord Howe Daylight Time)",
    DateString: "Sun Jan 03 2010",
    TimeString: "00:00:00 GMT+1100 (Lord Howe Daylight Time)",
    UTCString: "Sat, 02 Jan 2010 13:00:00 GMT",
    ISOString: "2010-01-02T13:00:00.000Z",
    LocaleString: "Sun, 01/03/2010, 12:00:00 AM GMT+11",
    LocaleDateString: "Sun, 01/03/2010",
    LocaleTimeString: "12:00:00 AM GMT+11",
  });
}
});


// File: Date/Europe_Amsterdam.js
// Europe/Amsterdam as an example for mean time like timezones after LMT (AMT, NST).
//
// tzdata2022b changed Europe/Amsterdam into a link to Europe/Brussels.

inTimeZone("Europe/Amsterdam", () => {
{
  let local = new DateTime.Local(1935, Month.January, 1, DayOfWeek.Tuesday, 0, 0, 0);
  let utc = new DateTime.UTC(1935, Month.January, 1, DayOfWeek.Tuesday, 0, 0, 0);

  assertDate(local, utc, TimeZone(+0,0,0), {
    String: "Tue Jan 01 1935 00:00:00 GMT+0000 (Central European Standard Time)",
    UTCString: "Tue, 01 Jan 1935 00:00:00 GMT",
  });
}

{
  let local = new DateTime.Local(1935, Month.July, 1, DayOfWeek.Monday, 0, 0, 0);
  let utc = new DateTime.UTC(1935, Month.June, 30, DayOfWeek.Sunday, 23, 0, 0);

  assertDate(local, utc, TimeZone(+1,0,0), {
    String: "Mon Jul 01 1935 00:00:00 GMT+0100 (Central European Summer Time)",
    UTCString: "Sun, 30 Jun 1935 23:00:00 GMT",
  });
}
});

// Use America/St_Johns as a replacement for the Europe/Amsterdam test case.
//
// Zone America/St_Johns as an example for mean time like timezones after LMT (NST, NDT).

inTimeZone("America/St_Johns", () => {
{
  let local = new DateTime.Local(1917, Month.January, 1, DayOfWeek.Monday, 0, 0, 0);
  let utc = new DateTime.UTC(1917, Month.January, 1, DayOfWeek.Monday, 3, 30, 52);

  assertDate(local, utc, TimeZone(-3,30,52), {
    String: "Mon Jan 01 1917 00:00:00 GMT-0330 (Newfoundland Standard Time)",
    UTCString: "Mon, 01 Jan 1917 03:30:52 GMT",
  });
}

{
  let local = new DateTime.Local(1917, Month.July, 1, DayOfWeek.Sunday, 0, 0, 0);
  let utc = new DateTime.UTC(1917, Month.July, 1, DayOfWeek.Sunday, 2, 30, 52);

  assertDate(local, utc, TimeZone(-2,30,52), {
    String: "Sun Jul 01 1917 00:00:00 GMT-0230 (Newfoundland Daylight Time)",
    UTCString: "Sun, 01 Jul 1917 02:30:52 GMT",
  });
}
});


// File: Date/Europe_London.js

inTimeZone("Europe/London", () => {
{
  // +01:00 (standard time)
  let local = new DateTime.Local(1970, Month.January, 1, DayOfWeek.Thursday, 0, 0, 0);
  let utc = new DateTime.UTC(1969, Month.December, 31, DayOfWeek.Wednesday, 23, 0, 0);

  assertDate(local, utc, TimeZone(+1), {
    String: "Thu Jan 01 1970 00:00:00 GMT+0100 (Greenwich Mean Time)",
    DateString: "Thu Jan 01 1970",
    TimeString: "00:00:00 GMT+0100 (Greenwich Mean Time)",
    UTCString: "Wed, 31 Dec 1969 23:00:00 GMT",
    ISOString: "1969-12-31T23:00:00.000Z",
    LocaleString: "Thu, 01/01/1970, 12:00:00 AM GMT+1",
    LocaleDateString: "Thu, 01/01/1970",
    LocaleTimeString: "12:00:00 AM GMT+1",
  });
}
});


// File: Date/Europe_Moscow.js

inTimeZone("Europe/Moscow", () => {
{
  let local = new DateTime.Local(1970, Month.January, 1, DayOfWeek.Thursday, 0, 0, 0);
  let utc = new DateTime.UTC(1969, Month.December, 31, DayOfWeek.Wednesday, 21, 0, 0);

  assertDate(local, utc, TimeZone(+3), {
    String: "Thu Jan 01 1970 00:00:00 GMT+0300 (Moscow Standard Time)",
    DateString: "Thu Jan 01 1970",
    TimeString: "00:00:00 GMT+0300 (Moscow Standard Time)",
    UTCString: "Wed, 31 Dec 1969 21:00:00 GMT",
    ISOString: "1969-12-31T21:00:00.000Z",
    LocaleString: "Thu, 01/01/1970, 12:00:00 AM GMT+3",
    LocaleDateString: "Thu, 01/01/1970",
    LocaleTimeString: "12:00:00 AM GMT+3",
  });
}

// Russia was in +02:00 starting on 1991-03-31 until 1992-01-19,
// while still observing DST (transitions 1991-03-31 and 1991-09-29).

{
  // +03:00 (daylight savings)
  let local = new DateTime.Local(1990, Month.September, 1, DayOfWeek.Saturday, 0, 0, 0);
  let utc = new DateTime.UTC(1990, Month.August, 31, DayOfWeek.Friday, 20, 0, 0);

  assertDate(local, utc, TimeZone(+4), {
    String: "Sat Sep 01 1990 00:00:00 GMT+0400 (Moscow Summer Time)",
    DateString: "Sat Sep 01 1990",
    TimeString: "00:00:00 GMT+0400 (Moscow Summer Time)",
    UTCString: "Fri, 31 Aug 1990 20:00:00 GMT",
    ISOString: "1990-08-31T20:00:00.000Z",
    LocaleString: "Sat, 09/01/1990, 12:00:00 AM GMT+4",
    LocaleDateString: "Sat, 09/01/1990",
    LocaleTimeString: "12:00:00 AM GMT+4",
  });
}

{
  // +03:00 (standard time)
  let local = new DateTime.Local(1991, Month.March, 25, DayOfWeek.Monday, 0, 0, 0);
  let utc = new DateTime.UTC(1991, Month.March, 24, DayOfWeek.Sunday, 21, 0, 0);

  assertDate(local, utc, TimeZone(+3), {
    String: "Mon Mar 25 1991 00:00:00 GMT+0300 (Moscow Standard Time)",
    DateString: "Mon Mar 25 1991",
    TimeString: "00:00:00 GMT+0300 (Moscow Standard Time)",
    UTCString: "Sun, 24 Mar 1991 21:00:00 GMT",
    ISOString: "1991-03-24T21:00:00.000Z",
    LocaleString: "Mon, 03/25/1991, 12:00:00 AM GMT+3",
    LocaleDateString: "Mon, 03/25/1991",
    LocaleTimeString: "12:00:00 AM GMT+3",
  });
}

{
  // +02:00 (daylight savings)
  let local = new DateTime.Local(1991, Month.March, 31, DayOfWeek.Sunday, 12, 0, 0);
  let utc = new DateTime.UTC(1991, Month.March, 31, DayOfWeek.Sunday, 9, 0, 0);

  assertDate(local, utc, TimeZone(+3), {
    String: "Sun Mar 31 1991 12:00:00 GMT+0300 (Moscow Summer Time)",
    DateString: "Sun Mar 31 1991",
    TimeString: "12:00:00 GMT+0300 (Moscow Summer Time)",
    UTCString: "Sun, 31 Mar 1991 09:00:00 GMT",
    ISOString: "1991-03-31T09:00:00.000Z",
    LocaleString: "Sun, 03/31/1991, 12:00:00 PM GMT+3",
    LocaleDateString: "Sun, 03/31/1991",
    LocaleTimeString: "12:00:00 PM GMT+3",
  });
}

{
  // +02:00 (daylight savings)
  let local = new DateTime.Local(1991, Month.September, 28, DayOfWeek.Saturday, 0, 0, 0);
  let utc = new DateTime.UTC(1991, Month.September, 27, DayOfWeek.Friday, 21, 0, 0);

  assertDate(local, utc, TimeZone(+3), {
    String: "Sat Sep 28 1991 00:00:00 GMT+0300 (Moscow Summer Time)",
    DateString: "Sat Sep 28 1991",
    TimeString: "00:00:00 GMT+0300 (Moscow Summer Time)",
    UTCString: "Fri, 27 Sep 1991 21:00:00 GMT",
    ISOString: "1991-09-27T21:00:00.000Z",
    LocaleString: "Sat, 09/28/1991, 12:00:00 AM GMT+3",
    LocaleDateString: "Sat, 09/28/1991",
    LocaleTimeString: "12:00:00 AM GMT+3",
  });
}

{
  // +02:00 (standard time)
  let local = new DateTime.Local(1991, Month.September, 30, DayOfWeek.Monday, 0, 0, 0);
  let utc = new DateTime.UTC(1991, Month.September, 29, DayOfWeek.Sunday, 22, 0, 0);

  assertDate(local, utc, TimeZone(+2), {
    String: "Mon Sep 30 1991 00:00:00 GMT+0200 (Moscow Standard Time)",
    DateString: "Mon Sep 30 1991",
    TimeString: "00:00:00 GMT+0200 (Moscow Standard Time)",
    UTCString: "Sun, 29 Sep 1991 22:00:00 GMT",
    ISOString: "1991-09-29T22:00:00.000Z",
    LocaleString: "Mon, 09/30/1991, 12:00:00 AM GMT+2",
    LocaleDateString: "Mon, 09/30/1991",
    LocaleTimeString: "12:00:00 AM GMT+2",
  });
}

// Russia stopped observing DST in Oct. 2010 (last transition on 2010-10-31),
// and changed timezone from +03:00 to +04:00 on 2011-03-27.

{
  // +03:00 (daylight savings)
  let local = new DateTime.Local(2010, Month.October, 30, DayOfWeek.Saturday, 0, 0, 0);
  let utc = new DateTime.UTC(2010, Month.October, 29, DayOfWeek.Friday, 20, 0, 0);

  assertDate(local, utc, TimeZone(+4), {
    String: "Sat Oct 30 2010 00:00:00 GMT+0400 (Moscow Summer Time)",
    DateString: "Sat Oct 30 2010",
    TimeString: "00:00:00 GMT+0400 (Moscow Summer Time)",
    UTCString: "Fri, 29 Oct 2010 20:00:00 GMT",
    ISOString: "2010-10-29T20:00:00.000Z",
    LocaleString: "Sat, 10/30/2010, 12:00:00 AM GMT+4",
    LocaleDateString: "Sat, 10/30/2010",
    LocaleTimeString: "12:00:00 AM GMT+4",
  });
}

{
  // +03:00 (standard time)
  let local = new DateTime.Local(2010, Month.November, 1, DayOfWeek.Monday, 0, 0, 0);
  let utc = new DateTime.UTC(2010, Month.October, 31, DayOfWeek.Sunday, 21, 0, 0);

  assertDate(local, utc, TimeZone(+3), {
    String: "Mon Nov 01 2010 00:00:00 GMT+0300 (Moscow Standard Time)",
    DateString: "Mon Nov 01 2010",
    TimeString: "00:00:00 GMT+0300 (Moscow Standard Time)",
    UTCString: "Sun, 31 Oct 2010 21:00:00 GMT",
    ISOString: "2010-10-31T21:00:00.000Z",
    LocaleString: "Mon, 11/01/2010, 12:00:00 AM GMT+3",
    LocaleDateString: "Mon, 11/01/2010",
    LocaleTimeString: "12:00:00 AM GMT+3",
  });
}

{
  // +04:00 (standard time)
  let local = new DateTime.Local(2011, Month.October, 30, DayOfWeek.Sunday, 0, 0, 0);
  let utc = new DateTime.UTC(2011, Month.October, 29, DayOfWeek.Saturday, 20, 0, 0);

  assertDate(local, utc, TimeZone(+4), {
    String: "Sun Oct 30 2011 00:00:00 GMT+0400 (Moscow Standard Time)",
    DateString: "Sun Oct 30 2011",
    TimeString: "00:00:00 GMT+0400 (Moscow Standard Time)",
    UTCString: "Sat, 29 Oct 2011 20:00:00 GMT",
    ISOString: "2011-10-29T20:00:00.000Z",
    LocaleString: "Sun, 10/30/2011, 12:00:00 AM GMT+4",
    LocaleDateString: "Sun, 10/30/2011",
    LocaleTimeString: "12:00:00 AM GMT+4",
  });
}

{
  // +04:00 (standard time)
  let local = new DateTime.Local(2011, Month.November, 1, DayOfWeek.Tuesday, 0, 0, 0);
  let utc = new DateTime.UTC(2011, Month.October, 31, DayOfWeek.Monday, 20, 0, 0);

  assertDate(local, utc, TimeZone(+4), {
    String: "Tue Nov 01 2011 00:00:00 GMT+0400 (Moscow Standard Time)",
    DateString: "Tue Nov 01 2011",
    TimeString: "00:00:00 GMT+0400 (Moscow Standard Time)",
    UTCString: "Mon, 31 Oct 2011 20:00:00 GMT",
    ISOString: "2011-10-31T20:00:00.000Z",
    LocaleString: "Tue, 11/01/2011, 12:00:00 AM GMT+4",
    LocaleDateString: "Tue, 11/01/2011",
    LocaleTimeString: "12:00:00 AM GMT+4",
  });
}

// Russia changed timezone from +04:00 to +03:00 on 2014-10-26.

{
  // +04:00 (standard time)
  let local = new DateTime.Local(2014, Month.October, 26, DayOfWeek.Sunday, 0, 0, 0);
  let utc = new DateTime.UTC(2014, Month.October, 25, DayOfWeek.Saturday, 20, 0, 0);

  assertDate(local, utc, TimeZone(+4), {
    String: "Sun Oct 26 2014 00:00:00 GMT+0400 (Moscow Standard Time)",
    DateString: "Sun Oct 26 2014",
    TimeString: "00:00:00 GMT+0400 (Moscow Standard Time)",
    UTCString: "Sat, 25 Oct 2014 20:00:00 GMT",
    ISOString: "2014-10-25T20:00:00.000Z",
    LocaleString: "Sun, 10/26/2014, 12:00:00 AM GMT+4",
    LocaleDateString: "Sun, 10/26/2014",
    LocaleTimeString: "12:00:00 AM GMT+4",
  });
}

{
  // +03:00 (standard time)
  let local = new DateTime.Local(2014, Month.October, 27, DayOfWeek.Monday, 0, 0, 0);
  let utc = new DateTime.UTC(2014, Month.October, 26, DayOfWeek.Sunday, 21, 0, 0);

  assertDate(local, utc, TimeZone(+3), {
    String: "Mon Oct 27 2014 00:00:00 GMT+0300 (Moscow Standard Time)",
    DateString: "Mon Oct 27 2014",
    TimeString: "00:00:00 GMT+0300 (Moscow Standard Time)",
    UTCString: "Sun, 26 Oct 2014 21:00:00 GMT",
    ISOString: "2014-10-26T21:00:00.000Z",
    LocaleString: "Mon, 10/27/2014, 12:00:00 AM GMT+3",
    LocaleDateString: "Mon, 10/27/2014",
    LocaleTimeString: "12:00:00 AM GMT+3",
  });
}
});


// File: Date/Pacific_Apia.js
// Pacific/Apia switched from -11:00 to +13:00 on 2011 Dec 29 24:00.

inTimeZone("Pacific/Apia", () => {
{
  // -11:00 (daylight savings)
  let local = new DateTime.Local(2011, Month.December, 29, DayOfWeek.Thursday, 0, 0, 0);
  let utc = new DateTime.UTC(2011, Month.December, 29, DayOfWeek.Thursday, 10, 0, 0);

  assertDate(local, utc, TimeZone(-10), {
    String: "Thu Dec 29 2011 00:00:00 GMT-1000 (Apia Daylight Time)",
    DateString: "Thu Dec 29 2011",
    TimeString: "00:00:00 GMT-1000 (Apia Daylight Time)",
    UTCString: "Thu, 29 Dec 2011 10:00:00 GMT",
    ISOString: "2011-12-29T10:00:00.000Z",
    LocaleString: "Thu, 12/29/2011, 12:00:00 AM GMT-10",
    LocaleDateString: "Thu, 12/29/2011",
    LocaleTimeString: "12:00:00 AM GMT-10",
  });
}

{
  // +13:00 (daylight savings)
  let local = new DateTime.Local(2011, Month.December, 31, DayOfWeek.Saturday, 0, 0, 0);
  let utc = new DateTime.UTC(2011, Month.December, 30, DayOfWeek.Friday, 10, 0, 0);

  assertDate(local, utc, TimeZone(+14), {
    String: "Sat Dec 31 2011 00:00:00 GMT+1400 (Apia Daylight Time)",
    DateString: "Sat Dec 31 2011",
    TimeString: "00:00:00 GMT+1400 (Apia Daylight Time)",
    UTCString: "Fri, 30 Dec 2011 10:00:00 GMT",
    ISOString: "2011-12-30T10:00:00.000Z",
    LocaleString: "Sat, 12/31/2011, 12:00:00 AM GMT+14",
    LocaleDateString: "Sat, 12/31/2011",
    LocaleTimeString: "12:00:00 AM GMT+14",
  });
}

{
  // +13:00 (standard time)
  let local = new DateTime.Local(2012, Month.April, 2, DayOfWeek.Monday, 0, 0, 0);
  let utc = new DateTime.UTC(2012, Month.April, 1, DayOfWeek.Sunday, 11, 0, 0);

  assertDate(local, utc, TimeZone(+13), {
    String: "Mon Apr 02 2012 00:00:00 GMT+1300 (Apia Standard Time)",
    DateString: "Mon Apr 02 2012",
    TimeString: "00:00:00 GMT+1300 (Apia Standard Time)",
    UTCString: "Sun, 01 Apr 2012 11:00:00 GMT",
    ISOString: "2012-04-01T11:00:00.000Z",
    LocaleString: "Mon, 04/02/2012, 12:00:00 AM GMT+13",
    LocaleDateString: "Mon, 04/02/2012",
    LocaleTimeString: "12:00:00 AM GMT+13",
  });
}
});


// File: Date/Pacific_Chatham.js
// Pacific/Chatham time zone offset is 12:45.

inTimeZone("Pacific/Chatham", () => {
{
  // +12:45 (standard time)
  let local = new DateTime.Local(2010, Month.August, 1, DayOfWeek.Sunday, 0, 0, 0);
  let utc = new DateTime.UTC(2010, Month.July, 31, DayOfWeek.Saturday, 11, 15, 0);

  assertDate(local, utc, TimeZone(+12,45), {
    String: "Sun Aug 01 2010 00:00:00 GMT+1245 (Chatham Standard Time)",
    DateString: "Sun Aug 01 2010",
    TimeString: "00:00:00 GMT+1245 (Chatham Standard Time)",
    UTCString: "Sat, 31 Jul 2010 11:15:00 GMT",
    ISOString: "2010-07-31T11:15:00.000Z",
    LocaleString: "Sun, 08/01/2010, 12:00:00 AM GMT+12:45",
    LocaleDateString: "Sun, 08/01/2010",
    LocaleTimeString: "12:00:00 AM GMT+12:45",
  });
}

{
  // +12:45 (daylight savings)
  let local = new DateTime.Local(2010, Month.January, 3, DayOfWeek.Sunday, 0, 0, 0);
  let utc = new DateTime.UTC(2010, Month.January, 2, DayOfWeek.Saturday, 10, 15, 0);

  assertDate(local, utc, TimeZone(+13,45), {
    String: "Sun Jan 03 2010 00:00:00 GMT+1345 (Chatham Daylight Time)",
    DateString: "Sun Jan 03 2010",
    TimeString: "00:00:00 GMT+1345 (Chatham Daylight Time)",
    UTCString: "Sat, 02 Jan 2010 10:15:00 GMT",
    ISOString: "2010-01-02T10:15:00.000Z",
    LocaleString: "Sun, 01/03/2010, 12:00:00 AM GMT+13:45",
    LocaleDateString: "Sun, 01/03/2010",
    LocaleTimeString: "12:00:00 AM GMT+13:45",
  });
}
});


// File: Date/Pacific_Kiritimati.js
// Pacific/Kiritimati time zone offset is +14:00.

inTimeZone("Pacific/Kiritimati", () => {
{
  // +14:00 (standard time)
  let local = new DateTime.Local(2010, Month.August, 1, DayOfWeek.Sunday, 0, 0, 0);
  let utc = new DateTime.UTC(2010, Month.July, 31, DayOfWeek.Saturday, 10, 0, 0);

  assertDate(local, utc, TimeZone(+14), {
    String: "Sun Aug 01 2010 00:00:00 GMT+1400 (Line Islands Time)",
    DateString: "Sun Aug 01 2010",
    TimeString: "00:00:00 GMT+1400 (Line Islands Time)",
    UTCString: "Sat, 31 Jul 2010 10:00:00 GMT",
    ISOString: "2010-07-31T10:00:00.000Z",
    LocaleString: "Sun, 08/01/2010, 12:00:00 AM GMT+14",
    LocaleDateString: "Sun, 08/01/2010",
    LocaleTimeString: "12:00:00 AM GMT+14",
  });
}

// Pacific/Kiritimati time zone offset was -10:40 until Oct. 1979.

{
  // -10:40 (standard time)
  let local = new DateTime.Local(1975, Month.January, 1, DayOfWeek.Wednesday, 0, 0, 0);
  let utc = new DateTime.UTC(1975, Month.January, 1, DayOfWeek.Wednesday, 10, 40, 0);

  assertDate(local, utc, TimeZone(-10,40), {
    String: "Wed Jan 01 1975 00:00:00 GMT-1040 (Line Islands Time)",
    DateString: "Wed Jan 01 1975",
    TimeString: "00:00:00 GMT-1040 (Line Islands Time)",
    UTCString: "Wed, 01 Jan 1975 10:40:00 GMT",
    ISOString: "1975-01-01T10:40:00.000Z",
    LocaleString: "Wed, 01/01/1975, 12:00:00 AM GMT-10:40",
    LocaleDateString: "Wed, 01/01/1975",
    LocaleTimeString: "12:00:00 AM GMT-10:40",
  });
}
});


// File: Date/Pacifi_Niue.js
// Pacific/Niue time zone offset was -11:20 from 1952 through 1964.

inTimeZone("Pacific/Niue", () => {
{
  // -11:20 (standard time)
  let local = new DateTime.Local(1956, Month.January, 1, DayOfWeek.Sunday, 0, 0, 0);
  let utc = new DateTime.UTC(1956, Month.January, 1, DayOfWeek.Sunday, 11, 20, 0);

  assertDate(local, utc, TimeZone(-11,20), {
    String: "Sun Jan 01 1956 00:00:00 GMT-1120 (Niue Time)",
    DateString: "Sun Jan 01 1956",
    TimeString: "00:00:00 GMT-1120 (Niue Time)",
    UTCString: "Sun, 01 Jan 1956 11:20:00 GMT",
    ISOString: "1956-01-01T11:20:00.000Z",
    LocaleString: "Sun, 01/01/1956, 12:00:00 AM GMT-11:20",
    LocaleDateString: "Sun, 01/01/1956",
    LocaleTimeString: "12:00:00 AM GMT-11:20",
  });
}
});


if (typeof reportCompare === "function")
    reportCompare(true, true);
