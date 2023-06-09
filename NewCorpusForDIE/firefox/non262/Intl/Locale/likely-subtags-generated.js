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

// |reftest| skip-if(!this.hasOwnProperty('Intl'))
// Generated by make_intl_data.py. DO NOT EDIT.

// Extracted from likelySubtags.xml.
// Derived from CLDR Supplemental Data, version 42.
// https://unicode.org/Public/cldr/42/core.zip
var maxLikelySubtags = {
    "aa": "aa-Latn-ET",
    "aai": "aai-Latn-ZZ",
    "aak": "aak-Latn-ZZ",
    "aau": "aau-Latn-ZZ",
    "ab": "ab-Cyrl-GE",
    "abi": "abi-Latn-ZZ",
    "abq": "abq-Cyrl-ZZ",
    "abr": "abr-Latn-GH",
    "abt": "abt-Latn-ZZ",
    "aby": "aby-Latn-ZZ",
    "acd": "acd-Latn-ZZ",
    "ace": "ace-Latn-ID",
    "ach": "ach-Latn-UG",
    "ada": "ada-Latn-GH",
    "ade": "ade-Latn-ZZ",
    "adj": "adj-Latn-ZZ",
    "adp": "dz-Tibt-BT",
    "ady": "ady-Cyrl-RU",
    "adz": "adz-Latn-ZZ",
    "ae": "ae-Avst-IR",
    "aeb": "aeb-Arab-TN",
    "aey": "aey-Latn-ZZ",
    "af": "af-Latn-ZA",
    "agc": "agc-Latn-ZZ",
    "agd": "agd-Latn-ZZ",
    "agg": "agg-Latn-ZZ",
    "agm": "agm-Latn-ZZ",
    "ago": "ago-Latn-ZZ",
    "agq": "agq-Latn-CM",
    "aha": "aha-Latn-ZZ",
    "ahl": "ahl-Latn-ZZ",
    "aho": "aho-Ahom-IN",
    "ajg": "ajg-Latn-ZZ",
    "ajt": "aeb-Arab-TN",
    "ak": "ak-Latn-GH",
    "akk": "akk-Xsux-IQ",
    "ala": "ala-Latn-ZZ",
    "ali": "ali-Latn-ZZ",
    "aln": "aln-Latn-XK",
    "alt": "alt-Cyrl-RU",
    "am": "am-Ethi-ET",
    "amm": "amm-Latn-ZZ",
    "amn": "amn-Latn-ZZ",
    "amo": "amo-Latn-NG",
    "amp": "amp-Latn-ZZ",
    "an": "an-Latn-ES",
    "anc": "anc-Latn-ZZ",
    "ank": "ank-Latn-ZZ",
    "ann": "ann-Latn-NG",
    "any": "any-Latn-ZZ",
    "aoj": "aoj-Latn-ZZ",
    "aom": "aom-Latn-ZZ",
    "aoz": "aoz-Latn-ID",
    "apc": "apc-Arab-ZZ",
    "apd": "apd-Arab-TG",
    "ape": "ape-Latn-ZZ",
    "apr": "apr-Latn-ZZ",
    "aps": "aps-Latn-ZZ",
    "apz": "apz-Latn-ZZ",
    "ar": "ar-Arab-EG",
    "arc": "arc-Armi-IR",
    "arc-Nbat": "arc-Nbat-JO",
    "arc-Palm": "arc-Palm-SY",
    "arh": "arh-Latn-ZZ",
    "arn": "arn-Latn-CL",
    "aro": "aro-Latn-BO",
    "arq": "arq-Arab-DZ",
    "ars": "ars-Arab-SA",
    "ary": "ary-Arab-MA",
    "arz": "arz-Arab-EG",
    "as": "as-Beng-IN",
    "asa": "asa-Latn-TZ",
    "ase": "ase-Sgnw-US",
    "asg": "asg-Latn-ZZ",
    "aso": "aso-Latn-ZZ",
    "ast": "ast-Latn-ES",
    "ata": "ata-Latn-ZZ",
    "atg": "atg-Latn-ZZ",
    "atj": "atj-Latn-CA",
    "auy": "auy-Latn-ZZ",
    "av": "av-Cyrl-RU",
    "avl": "avl-Arab-ZZ",
    "avn": "avn-Latn-ZZ",
    "avt": "avt-Latn-ZZ",
    "avu": "avu-Latn-ZZ",
    "awa": "awa-Deva-IN",
    "awb": "awb-Latn-ZZ",
    "awo": "awo-Latn-ZZ",
    "awx": "awx-Latn-ZZ",
    "ay": "ay-Latn-BO",
    "ayb": "ayb-Latn-ZZ",
    "az": "az-Latn-AZ",
    "az-Arab": "az-Arab-IR",
    "az-IQ": "az-Arab-IQ",
    "az-IR": "az-Arab-IR",
    "az-RU": "az-Cyrl-RU",
    "ba": "ba-Cyrl-RU",
    "bal": "bal-Arab-PK",
    "ban": "ban-Latn-ID",
    "bap": "bap-Deva-NP",
    "bar": "bar-Latn-AT",
    "bas": "bas-Latn-CM",
    "bav": "bav-Latn-ZZ",
    "bax": "bax-Bamu-CM",
    "bba": "bba-Latn-ZZ",
    "bbb": "bbb-Latn-ZZ",
    "bbc": "bbc-Latn-ID",
    "bbd": "bbd-Latn-ZZ",
    "bbj": "bbj-Latn-CM",
    "bbp": "bbp-Latn-ZZ",
    "bbr": "bbr-Latn-ZZ",
    "bcf": "bcf-Latn-ZZ",
    "bch": "bch-Latn-ZZ",
    "bci": "bci-Latn-CI",
    "bcm": "bcm-Latn-ZZ",
    "bcn": "bcn-Latn-ZZ",
    "bco": "bco-Latn-ZZ",
    "bcq": "bcq-Ethi-ZZ",
    "bcu": "bcu-Latn-ZZ",
    "bdd": "bdd-Latn-ZZ",
    "be": "be-Cyrl-BY",
    "bef": "bef-Latn-ZZ",
    "beh": "beh-Latn-ZZ",
    "bej": "bej-Arab-SD",
    "bem": "bem-Latn-ZM",
    "bet": "bet-Latn-ZZ",
    "bew": "bew-Latn-ID",
    "bex": "bex-Latn-ZZ",
    "bez": "bez-Latn-TZ",
    "bfd": "bfd-Latn-CM",
    "bfq": "bfq-Taml-IN",
    "bft": "bft-Arab-PK",
    "bfy": "bfy-Deva-IN",
    "bg": "bg-Cyrl-BG",
    "bgc": "bgc-Deva-IN",
    "bgn": "bgn-Arab-PK",
    "bgx": "bgx-Grek-TR",
    "bhb": "bhb-Deva-IN",
    "bhg": "bhg-Latn-ZZ",
    "bhi": "bhi-Deva-IN",
    "bhl": "bhl-Latn-ZZ",
    "bho": "bho-Deva-IN",
    "bhy": "bhy-Latn-ZZ",
    "bi": "bi-Latn-VU",
    "bib": "bib-Latn-ZZ",
    "big": "big-Latn-ZZ",
    "bik": "bik-Latn-PH",
    "bim": "bim-Latn-ZZ",
    "bin": "bin-Latn-NG",
    "bio": "bio-Latn-ZZ",
    "biq": "biq-Latn-ZZ",
    "bjh": "bjh-Latn-ZZ",
    "bji": "bji-Ethi-ZZ",
    "bjj": "bjj-Deva-IN",
    "bjn": "bjn-Latn-ID",
    "bjo": "bjo-Latn-ZZ",
    "bjr": "bjr-Latn-ZZ",
    "bjt": "bjt-Latn-SN",
    "bjz": "bjz-Latn-ZZ",
    "bkc": "bkc-Latn-ZZ",
    "bkm": "bkm-Latn-CM",
    "bkq": "bkq-Latn-ZZ",
    "bku": "bku-Latn-PH",
    "bkv": "bkv-Latn-ZZ",
    "bla": "bla-Latn-CA",
    "blg": "iba-Latn-MY",
    "blt": "blt-Tavt-VN",
    "bm": "bm-Latn-ML",
    "bmh": "bmh-Latn-ZZ",
    "bmk": "bmk-Latn-ZZ",
    "bmq": "bmq-Latn-ML",
    "bmu": "bmu-Latn-ZZ",
    "bn": "bn-Beng-BD",
    "bng": "bng-Latn-ZZ",
    "bnm": "bnm-Latn-ZZ",
    "bnp": "bnp-Latn-ZZ",
    "bo": "bo-Tibt-CN",
    "boj": "boj-Latn-ZZ",
    "bom": "bom-Latn-ZZ",
    "bon": "bon-Latn-ZZ",
    "bpy": "bpy-Beng-IN",
    "bqc": "bqc-Latn-ZZ",
    "bqi": "bqi-Arab-IR",
    "bqp": "bqp-Latn-ZZ",
    "bqv": "bqv-Latn-CI",
    "br": "br-Latn-FR",
    "bra": "bra-Deva-IN",
    "brh": "brh-Arab-PK",
    "brx": "brx-Deva-IN",
    "brz": "brz-Latn-ZZ",
    "bs": "bs-Latn-BA",
    "bsj": "bsj-Latn-ZZ",
    "bsq": "bsq-Bass-LR",
    "bss": "bss-Latn-CM",
    "bst": "bst-Ethi-ZZ",
    "bto": "bto-Latn-PH",
    "btt": "btt-Latn-ZZ",
    "btv": "btv-Deva-PK",
    "bua": "bua-Cyrl-RU",
    "buc": "buc-Latn-YT",
    "bud": "bud-Latn-ZZ",
    "bug": "bug-Latn-ID",
    "buk": "buk-Latn-ZZ",
    "bum": "bum-Latn-CM",
    "buo": "buo-Latn-ZZ",
    "bus": "bus-Latn-ZZ",
    "buu": "buu-Latn-ZZ",
    "bvb": "bvb-Latn-GQ",
    "bwd": "bwd-Latn-ZZ",
    "bwr": "bwr-Latn-ZZ",
    "bxh": "bxh-Latn-ZZ",
    "bye": "bye-Latn-ZZ",
    "byn": "byn-Ethi-ER",
    "byr": "byr-Latn-ZZ",
    "bys": "bys-Latn-ZZ",
    "byv": "byv-Latn-CM",
    "byx": "byx-Latn-ZZ",
    "bza": "bza-Latn-ZZ",
    "bze": "bze-Latn-ML",
    "bzf": "bzf-Latn-ZZ",
    "bzh": "bzh-Latn-ZZ",
    "bzw": "bzw-Latn-ZZ",
    "ca": "ca-Latn-ES",
    "cad": "cad-Latn-US",
    "can": "can-Latn-ZZ",
    "cbj": "cbj-Latn-ZZ",
    "cch": "cch-Latn-NG",
    "ccp": "ccp-Cakm-BD",
    "ce": "ce-Cyrl-RU",
    "ceb": "ceb-Latn-PH",
    "cfa": "cfa-Latn-ZZ",
    "cgg": "cgg-Latn-UG",
    "ch": "ch-Latn-GU",
    "chk": "chk-Latn-FM",
    "chm": "chm-Cyrl-RU",
    "cho": "cho-Latn-US",
    "chp": "chp-Latn-CA",
    "chr": "chr-Cher-US",
    "cic": "cic-Latn-US",
    "cja": "cja-Arab-KH",
    "cjm": "cjm-Cham-VN",
    "cjv": "cjv-Latn-ZZ",
    "ckb": "ckb-Arab-IQ",
    "ckl": "ckl-Latn-ZZ",
    "cko": "cko-Latn-ZZ",
    "cky": "cky-Latn-ZZ",
    "cla": "cla-Latn-ZZ",
    "clc": "clc-Latn-CA",
    "cme": "cme-Latn-ZZ",
    "cmg": "cmg-Soyo-MN",
    "co": "co-Latn-FR",
    "cop": "cop-Copt-EG",
    "cps": "cps-Latn-PH",
    "cr": "cr-Cans-CA",
    "crg": "crg-Latn-CA",
    "crh": "crh-Cyrl-UA",
    "crk": "crk-Cans-CA",
    "crl": "crl-Cans-CA",
    "crs": "crs-Latn-SC",
    "cs": "cs-Latn-CZ",
    "csb": "csb-Latn-PL",
    "csw": "csw-Cans-CA",
    "ctd": "ctd-Pauc-MM",
    "cu": "cu-Cyrl-RU",
    "cu-Glag": "cu-Glag-BG",
    "cv": "cv-Cyrl-RU",
    "cy": "cy-Latn-GB",
    "da": "da-Latn-DK",
    "dad": "dad-Latn-ZZ",
    "daf": "dnj-Latn-CI",
    "dag": "dag-Latn-ZZ",
    "dah": "dah-Latn-ZZ",
    "dak": "dak-Latn-US",
    "dar": "dar-Cyrl-RU",
    "dav": "dav-Latn-KE",
    "dbd": "dbd-Latn-ZZ",
    "dbq": "dbq-Latn-ZZ",
    "dcc": "dcc-Arab-IN",
    "ddn": "ddn-Latn-ZZ",
    "de": "de-Latn-DE",
    "ded": "ded-Latn-ZZ",
    "den": "den-Latn-CA",
    "dga": "dga-Latn-ZZ",
    "dgh": "dgh-Latn-ZZ",
    "dgi": "dgi-Latn-ZZ",
    "dgl": "dgl-Arab-ZZ",
    "dgr": "dgr-Latn-CA",
    "dgz": "dgz-Latn-ZZ",
    "dia": "dia-Latn-ZZ",
    "dje": "dje-Latn-NE",
    "dmf": "dmf-Medf-NG",
    "dnj": "dnj-Latn-CI",
    "dob": "dob-Latn-ZZ",
    "doi": "doi-Deva-IN",
    "dop": "dop-Latn-ZZ",
    "dow": "dow-Latn-ZZ",
    "drh": "mn-Cyrl-MN",
    "dri": "dri-Latn-ZZ",
    "drs": "drs-Ethi-ZZ",
    "dsb": "dsb-Latn-DE",
    "dtm": "dtm-Latn-ML",
    "dtp": "dtp-Latn-MY",
    "dts": "dts-Latn-ZZ",
    "dty": "dty-Deva-NP",
    "dua": "dua-Latn-CM",
    "duc": "duc-Latn-ZZ",
    "dud": "uth-Latn-ZZ",
    "dug": "dug-Latn-ZZ",
    "dv": "dv-Thaa-MV",
    "dva": "dva-Latn-ZZ",
    "dww": "dww-Latn-ZZ",
    "dyo": "dyo-Latn-SN",
    "dyu": "dyu-Latn-BF",
    "dz": "dz-Tibt-BT",
    "dzg": "dzg-Latn-ZZ",
    "ebu": "ebu-Latn-KE",
    "ee": "ee-Latn-GH",
    "efi": "efi-Latn-NG",
    "egl": "egl-Latn-IT",
    "egy": "egy-Egyp-EG",
    "eka": "eka-Latn-ZZ",
    "eky": "eky-Kali-MM",
    "el": "el-Grek-GR",
    "ema": "ema-Latn-ZZ",
    "emi": "emi-Latn-ZZ",
    "en": "en-Latn-US",
    "en-Shaw": "en-Shaw-GB",
    "enn": "enn-Latn-ZZ",
    "enq": "enq-Latn-ZZ",
    "eo": "eo-Latn-001",
    "eri": "eri-Latn-ZZ",
    "es": "es-Latn-ES",
    "esg": "esg-Gonm-IN",
    "esu": "esu-Latn-US",
    "et": "et-Latn-EE",
    "etr": "etr-Latn-ZZ",
    "ett": "ett-Ital-IT",
    "etu": "etu-Latn-ZZ",
    "etx": "etx-Latn-ZZ",
    "eu": "eu-Latn-ES",
    "ewo": "ewo-Latn-CM",
    "ext": "ext-Latn-ES",
    "eza": "eza-Latn-ZZ",
    "fa": "fa-Arab-IR",
    "faa": "faa-Latn-ZZ",
    "fab": "fab-Latn-ZZ",
    "fag": "fag-Latn-ZZ",
    "fai": "fai-Latn-ZZ",
    "fan": "fan-Latn-GQ",
    "ff": "ff-Latn-SN",
    "ff-Adlm": "ff-Adlm-GN",
    "ffi": "ffi-Latn-ZZ",
    "ffm": "ffm-Latn-ML",
    "fi": "fi-Latn-FI",
    "fia": "fia-Arab-SD",
    "fil": "fil-Latn-PH",
    "fit": "fit-Latn-SE",
    "fj": "fj-Latn-FJ",
    "flr": "flr-Latn-ZZ",
    "fmp": "fmp-Latn-ZZ",
    "fo": "fo-Latn-FO",
    "fod": "fod-Latn-ZZ",
    "fon": "fon-Latn-BJ",
    "for": "for-Latn-ZZ",
    "fpe": "fpe-Latn-ZZ",
    "fqs": "fqs-Latn-ZZ",
    "fr": "fr-Latn-FR",
    "frc": "frc-Latn-US",
    "frp": "frp-Latn-FR",
    "frr": "frr-Latn-DE",
    "frs": "frs-Latn-DE",
    "fub": "fub-Arab-CM",
    "fud": "fud-Latn-WF",
    "fue": "fue-Latn-ZZ",
    "fuf": "fuf-Latn-GN",
    "fuh": "fuh-Latn-ZZ",
    "fuq": "fuq-Latn-NE",
    "fur": "fur-Latn-IT",
    "fuv": "fuv-Latn-NG",
    "fuy": "fuy-Latn-ZZ",
    "fvr": "fvr-Latn-SD",
    "fy": "fy-Latn-NL",
    "ga": "ga-Latn-IE",
    "gaa": "gaa-Latn-GH",
    "gaf": "gaf-Latn-ZZ",
    "gag": "gag-Latn-MD",
    "gah": "gah-Latn-ZZ",
    "gaj": "gaj-Latn-ZZ",
    "gam": "gam-Latn-ZZ",
    "gan": "gan-Hans-CN",
    "gaw": "gaw-Latn-ZZ",
    "gay": "gay-Latn-ID",
    "gba": "gba-Latn-ZZ",
    "gbf": "gbf-Latn-ZZ",
    "gbm": "gbm-Deva-IN",
    "gby": "gby-Latn-ZZ",
    "gbz": "gbz-Arab-IR",
    "gcr": "gcr-Latn-GF",
    "gd": "gd-Latn-GB",
    "gde": "gde-Latn-ZZ",
    "gdn": "gdn-Latn-ZZ",
    "gdr": "gdr-Latn-ZZ",
    "geb": "geb-Latn-ZZ",
    "gej": "gej-Latn-ZZ",
    "gel": "gel-Latn-ZZ",
    "gez": "gez-Ethi-ET",
    "gfk": "gfk-Latn-ZZ",
    "ggn": "gvr-Deva-NP",
    "ghs": "ghs-Latn-ZZ",
    "gil": "gil-Latn-KI",
    "gim": "gim-Latn-ZZ",
    "gjk": "gjk-Arab-PK",
    "gjn": "gjn-Latn-ZZ",
    "gju": "gju-Arab-PK",
    "gkn": "gkn-Latn-ZZ",
    "gkp": "gkp-Latn-ZZ",
    "gl": "gl-Latn-ES",
    "glk": "glk-Arab-IR",
    "gmm": "gmm-Latn-ZZ",
    "gmv": "gmv-Ethi-ZZ",
    "gn": "gn-Latn-PY",
    "gnd": "gnd-Latn-ZZ",
    "gng": "gng-Latn-ZZ",
    "god": "god-Latn-ZZ",
    "gof": "gof-Ethi-ZZ",
    "goi": "goi-Latn-ZZ",
    "gom": "gom-Deva-IN",
    "gon": "gon-Telu-IN",
    "gor": "gor-Latn-ID",
    "gos": "gos-Latn-NL",
    "got": "got-Goth-UA",
    "grb": "grb-Latn-ZZ",
    "grc": "grc-Cprt-CY",
    "grc-Linb": "grc-Linb-GR",
    "grt": "grt-Beng-IN",
    "grw": "grw-Latn-ZZ",
    "gsw": "gsw-Latn-CH",
    "gu": "gu-Gujr-IN",
    "gub": "gub-Latn-BR",
    "guc": "guc-Latn-CO",
    "gud": "gud-Latn-ZZ",
    "gur": "gur-Latn-GH",
    "guw": "guw-Latn-ZZ",
    "gux": "gux-Latn-ZZ",
    "guz": "guz-Latn-KE",
    "gv": "gv-Latn-IM",
    "gvf": "gvf-Latn-ZZ",
    "gvr": "gvr-Deva-NP",
    "gvs": "gvs-Latn-ZZ",
    "gwc": "gwc-Arab-ZZ",
    "gwi": "gwi-Latn-CA",
    "gwt": "gwt-Arab-ZZ",
    "gyi": "gyi-Latn-ZZ",
    "ha": "ha-Latn-NG",
    "ha-CM": "ha-Arab-CM",
    "ha-SD": "ha-Arab-SD",
    "hag": "hag-Latn-ZZ",
    "hak": "hak-Hans-CN",
    "ham": "ham-Latn-ZZ",
    "haw": "haw-Latn-US",
    "haz": "haz-Arab-AF",
    "hbb": "hbb-Latn-ZZ",
    "hdy": "hdy-Ethi-ZZ",
    "he": "he-Hebr-IL",
    "hhy": "hhy-Latn-ZZ",
    "hi": "hi-Deva-IN",
    "hi-Latn": "hi-Latn-IN",
    "hia": "hia-Latn-ZZ",
    "hif": "hif-Latn-FJ",
    "hig": "hig-Latn-ZZ",
    "hih": "hih-Latn-ZZ",
    "hil": "hil-Latn-PH",
    "hla": "hla-Latn-ZZ",
    "hlu": "hlu-Hluw-TR",
    "hmd": "hmd-Plrd-CN",
    "hmt": "hmt-Latn-ZZ",
    "hnd": "hnd-Arab-PK",
    "hne": "hne-Deva-IN",
    "hnj": "hnj-Hmnp-US",
    "hnn": "hnn-Latn-PH",
    "hno": "hno-Arab-PK",
    "ho": "ho-Latn-PG",
    "hoc": "hoc-Deva-IN",
    "hoj": "hoj-Deva-IN",
    "hot": "hot-Latn-ZZ",
    "hr": "hr-Latn-HR",
    "hsb": "hsb-Latn-DE",
    "hsn": "hsn-Hans-CN",
    "ht": "ht-Latn-HT",
    "hu": "hu-Latn-HU",
    "hui": "hui-Latn-ZZ",
    "hur": "hur-Latn-CA",
    "hy": "hy-Armn-AM",
    "hz": "hz-Latn-NA",
    "ia": "ia-Latn-001",
    "ian": "ian-Latn-ZZ",
    "iar": "iar-Latn-ZZ",
    "iba": "iba-Latn-MY",
    "ibb": "ibb-Latn-NG",
    "iby": "iby-Latn-ZZ",
    "ica": "ica-Latn-ZZ",
    "ich": "ich-Latn-ZZ",
    "id": "id-Latn-ID",
    "idd": "idd-Latn-ZZ",
    "idi": "idi-Latn-ZZ",
    "idu": "idu-Latn-ZZ",
    "ife": "ife-Latn-TG",
    "ig": "ig-Latn-NG",
    "igb": "igb-Latn-ZZ",
    "ige": "ige-Latn-ZZ",
    "ii": "ii-Yiii-CN",
    "ijj": "ijj-Latn-ZZ",
    "ik": "ik-Latn-US",
    "ikk": "ikk-Latn-ZZ",
    "ikw": "ikw-Latn-ZZ",
    "ikx": "ikx-Latn-ZZ",
    "ilo": "ilo-Latn-PH",
    "imo": "imo-Latn-ZZ",
    "in": "id-Latn-ID",
    "inh": "inh-Cyrl-RU",
    "io": "io-Latn-001",
    "iou": "iou-Latn-ZZ",
    "iri": "iri-Latn-ZZ",
    "is": "is-Latn-IS",
    "it": "it-Latn-IT",
    "iu": "iu-Cans-CA",
    "iw": "he-Hebr-IL",
    "iwm": "iwm-Latn-ZZ",
    "iws": "iws-Latn-ZZ",
    "izh": "izh-Latn-RU",
    "izi": "eza-Latn-ZZ",
    "ja": "ja-Jpan-JP",
    "jab": "jab-Latn-ZZ",
    "jam": "jam-Latn-JM",
    "jar": "jgk-Latn-ZZ",
    "jbo": "jbo-Latn-001",
    "jbu": "jbu-Latn-ZZ",
    "jen": "jen-Latn-ZZ",
    "jgk": "jgk-Latn-ZZ",
    "jgo": "jgo-Latn-CM",
    "ji": "yi-Hebr-001",
    "jib": "jib-Latn-ZZ",
    "jmc": "jmc-Latn-TZ",
    "jml": "jml-Deva-NP",
    "jra": "jra-Latn-ZZ",
    "jut": "jut-Latn-DK",
    "jv": "jv-Latn-ID",
    "jw": "jv-Latn-ID",
    "ka": "ka-Geor-GE",
    "kaa": "kaa-Cyrl-UZ",
    "kab": "kab-Latn-DZ",
    "kac": "kac-Latn-MM",
    "kad": "kad-Latn-ZZ",
    "kai": "kai-Latn-ZZ",
    "kaj": "kaj-Latn-NG",
    "kam": "kam-Latn-KE",
    "kao": "kao-Latn-ML",
    "kaw": "kaw-Kawi-ID",
    "kbd": "kbd-Cyrl-RU",
    "kbm": "kbm-Latn-ZZ",
    "kbp": "kbp-Latn-ZZ",
    "kbq": "kbq-Latn-ZZ",
    "kbx": "kbx-Latn-ZZ",
    "kby": "kby-Arab-NE",
    "kcg": "kcg-Latn-NG",
    "kck": "kck-Latn-ZW",
    "kcl": "kcl-Latn-ZZ",
    "kct": "kct-Latn-ZZ",
    "kde": "kde-Latn-TZ",
    "kdh": "kdh-Latn-TG",
    "kdl": "kdl-Latn-ZZ",
    "kdt": "kdt-Thai-TH",
    "kea": "kea-Latn-CV",
    "ken": "ken-Latn-CM",
    "kez": "kez-Latn-ZZ",
    "kfo": "kfo-Latn-CI",
    "kfr": "kfr-Deva-IN",
    "kfy": "kfy-Deva-IN",
    "kg": "kg-Latn-CD",
    "kge": "kge-Latn-ID",
    "kgf": "kgf-Latn-ZZ",
    "kgp": "kgp-Latn-BR",
    "kha": "kha-Latn-IN",
    "khb": "khb-Talu-CN",
    "khn": "khn-Deva-IN",
    "khq": "khq-Latn-ML",
    "khs": "khs-Latn-ZZ",
    "kht": "kht-Mymr-IN",
    "khw": "khw-Arab-PK",
    "khz": "khz-Latn-ZZ",
    "ki": "ki-Latn-KE",
    "kij": "kij-Latn-ZZ",
    "kiu": "kiu-Latn-TR",
    "kiw": "kiw-Latn-ZZ",
    "kj": "kj-Latn-NA",
    "kjd": "kjd-Latn-ZZ",
    "kjg": "kjg-Laoo-LA",
    "kjs": "kjs-Latn-ZZ",
    "kjy": "kjy-Latn-ZZ",
    "kk": "kk-Cyrl-KZ",
    "kk-AF": "kk-Arab-AF",
    "kk-Arab": "kk-Arab-CN",
    "kk-CN": "kk-Arab-CN",
    "kk-IR": "kk-Arab-IR",
    "kk-MN": "kk-Arab-MN",
    "kkc": "kkc-Latn-ZZ",
    "kkj": "kkj-Latn-CM",
    "kl": "kl-Latn-GL",
    "kln": "kln-Latn-KE",
    "klq": "klq-Latn-ZZ",
    "klt": "klt-Latn-ZZ",
    "klx": "klx-Latn-ZZ",
    "km": "km-Khmr-KH",
    "kmb": "kmb-Latn-AO",
    "kmh": "kmh-Latn-ZZ",
    "kmo": "kmo-Latn-ZZ",
    "kms": "kms-Latn-ZZ",
    "kmu": "kmu-Latn-ZZ",
    "kmw": "kmw-Latn-ZZ",
    "kn": "kn-Knda-IN",
    "knf": "knf-Latn-GW",
    "knp": "knp-Latn-ZZ",
    "ko": "ko-Kore-KR",
    "koi": "koi-Cyrl-RU",
    "kok": "kok-Deva-IN",
    "kol": "kol-Latn-ZZ",
    "kos": "kos-Latn-FM",
    "koz": "koz-Latn-ZZ",
    "kpe": "kpe-Latn-LR",
    "kpf": "kpf-Latn-ZZ",
    "kpo": "kpo-Latn-ZZ",
    "kpr": "kpr-Latn-ZZ",
    "kpx": "kpx-Latn-ZZ",
    "kqb": "kqb-Latn-ZZ",
    "kqf": "kqf-Latn-ZZ",
    "kqs": "kqs-Latn-ZZ",
    "kqy": "kqy-Ethi-ZZ",
    "kr": "kr-Latn-ZZ",
    "krc": "krc-Cyrl-RU",
    "kri": "kri-Latn-SL",
    "krj": "krj-Latn-PH",
    "krl": "krl-Latn-RU",
    "krs": "krs-Latn-ZZ",
    "kru": "kru-Deva-IN",
    "ks": "ks-Arab-IN",
    "ksb": "ksb-Latn-TZ",
    "ksd": "ksd-Latn-ZZ",
    "ksf": "ksf-Latn-CM",
    "ksh": "ksh-Latn-DE",
    "ksj": "ksj-Latn-ZZ",
    "ksr": "ksr-Latn-ZZ",
    "ktb": "ktb-Ethi-ZZ",
    "ktm": "ktm-Latn-ZZ",
    "kto": "kto-Latn-ZZ",
    "ktr": "dtp-Latn-MY",
    "ku": "ku-Latn-TR",
    "ku-Arab": "ku-Arab-IQ",
    "ku-LB": "ku-Arab-LB",
    "ku-Yezi": "ku-Yezi-GE",
    "kub": "kub-Latn-ZZ",
    "kud": "kud-Latn-ZZ",
    "kue": "kue-Latn-ZZ",
    "kuj": "kuj-Latn-ZZ",
    "kum": "kum-Cyrl-RU",
    "kun": "kun-Latn-ZZ",
    "kup": "kup-Latn-ZZ",
    "kus": "kus-Latn-ZZ",
    "kv": "kv-Cyrl-RU",
    "kvg": "kvg-Latn-ZZ",
    "kvr": "kvr-Latn-ID",
    "kvx": "kvx-Arab-PK",
    "kw": "kw-Latn-GB",
    "kwj": "kwj-Latn-ZZ",
    "kwk": "kwk-Latn-CA",
    "kwo": "kwo-Latn-ZZ",
    "kwq": "yam-Latn-ZZ",
    "kxa": "kxa-Latn-ZZ",
    "kxc": "kxc-Ethi-ZZ",
    "kxe": "tvd-Latn-ZZ",
    "kxl": "kru-Deva-IN",
    "kxm": "kxm-Thai-TH",
    "kxp": "kxp-Arab-PK",
    "kxw": "kxw-Latn-ZZ",
    "kxz": "kxz-Latn-ZZ",
    "ky": "ky-Cyrl-KG",
    "ky-Arab": "ky-Arab-CN",
    "ky-CN": "ky-Arab-CN",
    "ky-Latn": "ky-Latn-TR",
    "ky-TR": "ky-Latn-TR",
    "kye": "kye-Latn-ZZ",
    "kyx": "kyx-Latn-ZZ",
    "kzh": "dgl-Arab-ZZ",
    "kzj": "dtp-Latn-MY",
    "kzr": "kzr-Latn-ZZ",
    "kzt": "dtp-Latn-MY",
    "la": "la-Latn-VA",
    "lab": "lab-Lina-GR",
    "lad": "lad-Hebr-IL",
    "lag": "lag-Latn-TZ",
    "lah": "lah-Arab-PK",
    "laj": "laj-Latn-UG",
    "las": "las-Latn-ZZ",
    "lb": "lb-Latn-LU",
    "lbe": "lbe-Cyrl-RU",
    "lbu": "lbu-Latn-ZZ",
    "lbw": "lbw-Latn-ID",
    "lcm": "lcm-Latn-ZZ",
    "lcp": "lcp-Thai-CN",
    "ldb": "ldb-Latn-ZZ",
    "led": "led-Latn-ZZ",
    "lee": "lee-Latn-ZZ",
    "lem": "lem-Latn-ZZ",
    "lep": "lep-Lepc-IN",
    "leq": "leq-Latn-ZZ",
    "leu": "leu-Latn-ZZ",
    "lez": "lez-Cyrl-RU",
    "lg": "lg-Latn-UG",
    "lgg": "lgg-Latn-ZZ",
    "li": "li-Latn-NL",
    "lia": "lia-Latn-ZZ",
    "lid": "lid-Latn-ZZ",
    "lif": "lif-Deva-NP",
    "lif-Limb": "lif-Limb-IN",
    "lig": "lig-Latn-ZZ",
    "lih": "lih-Latn-ZZ",
    "lij": "lij-Latn-IT",
    "lil": "lil-Latn-CA",
    "lis": "lis-Lisu-CN",
    "ljp": "ljp-Latn-ID",
    "lki": "lki-Arab-IR",
    "lkt": "lkt-Latn-US",
    "lle": "lle-Latn-ZZ",
    "lln": "lln-Latn-ZZ",
    "lmn": "lmn-Telu-IN",
    "lmo": "lmo-Latn-IT",
    "lmp": "lmp-Latn-ZZ",
    "ln": "ln-Latn-CD",
    "lns": "lns-Latn-ZZ",
    "lnu": "lnu-Latn-ZZ",
    "lo": "lo-Laoo-LA",
    "loj": "loj-Latn-ZZ",
    "lok": "lok-Latn-ZZ",
    "lol": "lol-Latn-CD",
    "lor": "lor-Latn-ZZ",
    "los": "los-Latn-ZZ",
    "loz": "loz-Latn-ZM",
    "lrc": "lrc-Arab-IR",
    "lt": "lt-Latn-LT",
    "ltg": "ltg-Latn-LV",
    "lu": "lu-Latn-CD",
    "lua": "lua-Latn-CD",
    "luo": "luo-Latn-KE",
    "luy": "luy-Latn-KE",
    "luz": "luz-Arab-IR",
    "lv": "lv-Latn-LV",
    "lwl": "lwl-Thai-TH",
    "lzh": "lzh-Hans-CN",
    "lzz": "lzz-Latn-TR",
    "mad": "mad-Latn-ID",
    "maf": "maf-Latn-CM",
    "mag": "mag-Deva-IN",
    "mai": "mai-Deva-IN",
    "mak": "mak-Latn-ID",
    "man": "man-Latn-GM",
    "man-GN": "man-Nkoo-GN",
    "man-Nkoo": "man-Nkoo-GN",
    "mas": "mas-Latn-KE",
    "maw": "maw-Latn-ZZ",
    "maz": "maz-Latn-MX",
    "mbh": "mbh-Latn-ZZ",
    "mbo": "mbo-Latn-ZZ",
    "mbq": "mbq-Latn-ZZ",
    "mbu": "mbu-Latn-ZZ",
    "mbw": "mbw-Latn-ZZ",
    "mci": "mci-Latn-ZZ",
    "mcp": "mcp-Latn-ZZ",
    "mcq": "mcq-Latn-ZZ",
    "mcr": "mcr-Latn-ZZ",
    "mcu": "mcu-Latn-ZZ",
    "mda": "mda-Latn-ZZ",
    "mde": "mde-Arab-ZZ",
    "mdf": "mdf-Cyrl-RU",
    "mdh": "mdh-Latn-PH",
    "mdj": "mdj-Latn-ZZ",
    "mdr": "mdr-Latn-ID",
    "mdx": "mdx-Ethi-ZZ",
    "med": "med-Latn-ZZ",
    "mee": "mee-Latn-ZZ",
    "mek": "mek-Latn-ZZ",
    "men": "men-Latn-SL",
    "mer": "mer-Latn-KE",
    "met": "met-Latn-ZZ",
    "meu": "meu-Latn-ZZ",
    "mfa": "mfa-Arab-TH",
    "mfe": "mfe-Latn-MU",
    "mfn": "mfn-Latn-ZZ",
    "mfo": "mfo-Latn-ZZ",
    "mfq": "mfq-Latn-ZZ",
    "mg": "mg-Latn-MG",
    "mgh": "mgh-Latn-MZ",
    "mgl": "mgl-Latn-ZZ",
    "mgo": "mgo-Latn-CM",
    "mgp": "mgp-Deva-NP",
    "mgy": "mgy-Latn-TZ",
    "mh": "mh-Latn-MH",
    "mhi": "mhi-Latn-ZZ",
    "mhl": "mhl-Latn-ZZ",
    "mi": "mi-Latn-NZ",
    "mic": "mic-Latn-CA",
    "mif": "mif-Latn-ZZ",
    "min": "min-Latn-ID",
    "miw": "miw-Latn-ZZ",
    "mk": "mk-Cyrl-MK",
    "mki": "mki-Arab-ZZ",
    "mkl": "mkl-Latn-ZZ",
    "mkp": "mkp-Latn-ZZ",
    "mkw": "mkw-Latn-ZZ",
    "ml": "ml-Mlym-IN",
    "mle": "mle-Latn-ZZ",
    "mlp": "mlp-Latn-ZZ",
    "mls": "mls-Latn-SD",
    "mmo": "mmo-Latn-ZZ",
    "mmu": "mmu-Latn-ZZ",
    "mmx": "mmx-Latn-ZZ",
    "mn": "mn-Cyrl-MN",
    "mn-CN": "mn-Mong-CN",
    "mn-Mong": "mn-Mong-CN",
    "mna": "mna-Latn-ZZ",
    "mnf": "mnf-Latn-ZZ",
    "mni": "mni-Beng-IN",
    "mnw": "mnw-Mymr-MM",
    "mo": "ro-Latn-RO",
    "moa": "moa-Latn-ZZ",
    "moe": "moe-Latn-CA",
    "moh": "moh-Latn-CA",
    "mos": "mos-Latn-BF",
    "mox": "mox-Latn-ZZ",
    "mpp": "mpp-Latn-ZZ",
    "mps": "mps-Latn-ZZ",
    "mpt": "mpt-Latn-ZZ",
    "mpx": "mpx-Latn-ZZ",
    "mql": "mql-Latn-ZZ",
    "mr": "mr-Deva-IN",
    "mrd": "mrd-Deva-NP",
    "mrj": "mrj-Cyrl-RU",
    "mro": "mro-Mroo-BD",
    "ms": "ms-Latn-MY",
    "ms-CC": "ms-Arab-CC",
    "mt": "mt-Latn-MT",
    "mtc": "mtc-Latn-ZZ",
    "mtf": "mtf-Latn-ZZ",
    "mti": "mti-Latn-ZZ",
    "mtr": "mtr-Deva-IN",
    "mua": "mua-Latn-CM",
    "mur": "mur-Latn-ZZ",
    "mus": "mus-Latn-US",
    "mva": "mva-Latn-ZZ",
    "mvn": "mvn-Latn-ZZ",
    "mvy": "mvy-Arab-PK",
    "mwk": "mwk-Latn-ML",
    "mwr": "mwr-Deva-IN",
    "mwv": "mwv-Latn-ID",
    "mww": "mww-Hmnp-US",
    "mxc": "mxc-Latn-ZW",
    "mxm": "mxm-Latn-ZZ",
    "my": "my-Mymr-MM",
    "myk": "myk-Latn-ZZ",
    "mym": "mym-Ethi-ZZ",
    "myv": "myv-Cyrl-RU",
    "myw": "myw-Latn-ZZ",
    "myx": "myx-Latn-UG",
    "myz": "myz-Mand-IR",
    "mzk": "mzk-Latn-ZZ",
    "mzm": "mzm-Latn-ZZ",
    "mzn": "mzn-Arab-IR",
    "mzp": "mzp-Latn-ZZ",
    "mzw": "mzw-Latn-ZZ",
    "mzz": "mzz-Latn-ZZ",
    "na": "na-Latn-NR",
    "nac": "nac-Latn-ZZ",
    "naf": "naf-Latn-ZZ",
    "nak": "nak-Latn-ZZ",
    "nan": "nan-Hans-CN",
    "nap": "nap-Latn-IT",
    "naq": "naq-Latn-NA",
    "nas": "nas-Latn-ZZ",
    "nb": "nb-Latn-NO",
    "nca": "nca-Latn-ZZ",
    "nce": "nce-Latn-ZZ",
    "ncf": "ncf-Latn-ZZ",
    "nch": "nch-Latn-MX",
    "nco": "nco-Latn-ZZ",
    "ncu": "ncu-Latn-ZZ",
    "nd": "nd-Latn-ZW",
    "ndc": "ndc-Latn-MZ",
    "nds": "nds-Latn-DE",
    "ne": "ne-Deva-NP",
    "neb": "neb-Latn-ZZ",
    "new": "new-Deva-NP",
    "nex": "nex-Latn-ZZ",
    "nfr": "nfr-Latn-ZZ",
    "ng": "ng-Latn-NA",
    "nga": "nga-Latn-ZZ",
    "ngb": "ngb-Latn-ZZ",
    "ngl": "ngl-Latn-MZ",
    "nhb": "nhb-Latn-ZZ",
    "nhe": "nhe-Latn-MX",
    "nhw": "nhw-Latn-MX",
    "nif": "nif-Latn-ZZ",
    "nii": "nii-Latn-ZZ",
    "nij": "nij-Latn-ID",
    "nin": "nin-Latn-ZZ",
    "niu": "niu-Latn-NU",
    "niy": "niy-Latn-ZZ",
    "niz": "niz-Latn-ZZ",
    "njo": "njo-Latn-IN",
    "nkg": "nkg-Latn-ZZ",
    "nko": "nko-Latn-ZZ",
    "nl": "nl-Latn-NL",
    "nmg": "nmg-Latn-CM",
    "nmz": "nmz-Latn-ZZ",
    "nn": "nn-Latn-NO",
    "nnf": "nnf-Latn-ZZ",
    "nnh": "nnh-Latn-CM",
    "nnk": "nnk-Latn-ZZ",
    "nnm": "nnm-Latn-ZZ",
    "nnp": "nnp-Wcho-IN",
    "no": "no-Latn-NO",
    "nod": "nod-Lana-TH",
    "noe": "noe-Deva-IN",
    "non": "non-Runr-SE",
    "nop": "nop-Latn-ZZ",
    "nou": "nou-Latn-ZZ",
    "nqo": "nqo-Nkoo-GN",
    "nr": "nr-Latn-ZA",
    "nrb": "nrb-Latn-ZZ",
    "nsk": "nsk-Cans-CA",
    "nsn": "nsn-Latn-ZZ",
    "nso": "nso-Latn-ZA",
    "nss": "nss-Latn-ZZ",
    "nst": "nst-Tnsa-IN",
    "ntm": "ntm-Latn-ZZ",
    "ntr": "ntr-Latn-ZZ",
    "nui": "nui-Latn-ZZ",
    "nup": "nup-Latn-ZZ",
    "nus": "nus-Latn-SS",
    "nuv": "nuv-Latn-ZZ",
    "nux": "nux-Latn-ZZ",
    "nv": "nv-Latn-US",
    "nwb": "nwb-Latn-ZZ",
    "nxq": "nxq-Latn-CN",
    "nxr": "nxr-Latn-ZZ",
    "ny": "ny-Latn-MW",
    "nym": "nym-Latn-TZ",
    "nyn": "nyn-Latn-UG",
    "nzi": "nzi-Latn-GH",
    "oc": "oc-Latn-FR",
    "oc-ES": "oc-Latn-ES",
    "ogc": "ogc-Latn-ZZ",
    "oj": "oj-Cans-CA",
    "ojs": "ojs-Cans-CA",
    "oka": "oka-Latn-CA",
    "okr": "okr-Latn-ZZ",
    "okv": "okv-Latn-ZZ",
    "om": "om-Latn-ET",
    "ong": "ong-Latn-ZZ",
    "onn": "onn-Latn-ZZ",
    "ons": "ons-Latn-ZZ",
    "opm": "opm-Latn-ZZ",
    "or": "or-Orya-IN",
    "oro": "oro-Latn-ZZ",
    "oru": "oru-Arab-ZZ",
    "os": "os-Cyrl-GE",
    "osa": "osa-Osge-US",
    "ota": "ota-Arab-ZZ",
    "otk": "otk-Orkh-MN",
    "oui": "oui-Ougr-143",
    "ozm": "ozm-Latn-ZZ",
    "pa": "pa-Guru-IN",
    "pa-Arab": "pa-Arab-PK",
    "pa-PK": "pa-Arab-PK",
    "pag": "pag-Latn-PH",
    "pal": "pal-Phli-IR",
    "pal-Phlp": "pal-Phlp-CN",
    "pam": "pam-Latn-PH",
    "pap": "pap-Latn-AW",
    "pau": "pau-Latn-PW",
    "pbi": "pbi-Latn-ZZ",
    "pcd": "pcd-Latn-FR",
    "pcm": "pcm-Latn-NG",
    "pdc": "pdc-Latn-US",
    "pdt": "pdt-Latn-CA",
    "ped": "ped-Latn-ZZ",
    "peo": "peo-Xpeo-IR",
    "pex": "pex-Latn-ZZ",
    "pfl": "pfl-Latn-DE",
    "phl": "phl-Arab-ZZ",
    "phn": "phn-Phnx-LB",
    "pil": "pil-Latn-ZZ",
    "pip": "pip-Latn-ZZ",
    "pis": "pis-Latn-SB",
    "pka": "pka-Brah-IN",
    "pko": "pko-Latn-KE",
    "pl": "pl-Latn-PL",
    "pla": "pla-Latn-ZZ",
    "pms": "pms-Latn-IT",
    "png": "png-Latn-ZZ",
    "pnn": "pnn-Latn-ZZ",
    "pnt": "pnt-Grek-GR",
    "pon": "pon-Latn-FM",
    "ppa": "bfy-Deva-IN",
    "ppo": "ppo-Latn-ZZ",
    "pqm": "pqm-Latn-CA",
    "pra": "pra-Khar-PK",
    "prd": "prd-Arab-IR",
    "prg": "prg-Latn-001",
    "ps": "ps-Arab-AF",
    "pss": "pss-Latn-ZZ",
    "pt": "pt-Latn-BR",
    "ptp": "ptp-Latn-ZZ",
    "puu": "puu-Latn-GA",
    "pwa": "pwa-Latn-ZZ",
    "qu": "qu-Latn-PE",
    "quc": "quc-Latn-GT",
    "qug": "qug-Latn-EC",
    "rai": "rai-Latn-ZZ",
    "raj": "raj-Deva-IN",
    "rao": "rao-Latn-ZZ",
    "rcf": "rcf-Latn-RE",
    "rej": "rej-Latn-ID",
    "rel": "rel-Latn-ZZ",
    "res": "res-Latn-ZZ",
    "rgn": "rgn-Latn-IT",
    "rhg": "rhg-Rohg-MM",
    "ria": "ria-Latn-IN",
    "rif": "rif-Tfng-MA",
    "rif-NL": "rif-Latn-NL",
    "rjs": "rjs-Deva-NP",
    "rkt": "rkt-Beng-BD",
    "rm": "rm-Latn-CH",
    "rmf": "rmf-Latn-FI",
    "rmo": "rmo-Latn-CH",
    "rmt": "rmt-Arab-IR",
    "rmu": "rmu-Latn-SE",
    "rn": "rn-Latn-BI",
    "rna": "rna-Latn-ZZ",
    "rng": "rng-Latn-MZ",
    "ro": "ro-Latn-RO",
    "rob": "rob-Latn-ID",
    "rof": "rof-Latn-TZ",
    "roo": "roo-Latn-ZZ",
    "rro": "rro-Latn-ZZ",
    "rtm": "rtm-Latn-FJ",
    "ru": "ru-Cyrl-RU",
    "rue": "rue-Cyrl-UA",
    "rug": "rug-Latn-SB",
    "rw": "rw-Latn-RW",
    "rwk": "rwk-Latn-TZ",
    "rwo": "rwo-Latn-ZZ",
    "ryu": "ryu-Kana-JP",
    "sa": "sa-Deva-IN",
    "saf": "saf-Latn-GH",
    "sah": "sah-Cyrl-RU",
    "saq": "saq-Latn-KE",
    "sas": "sas-Latn-ID",
    "sat": "sat-Olck-IN",
    "sav": "sav-Latn-SN",
    "saz": "saz-Saur-IN",
    "sba": "sba-Latn-ZZ",
    "sbe": "sbe-Latn-ZZ",
    "sbp": "sbp-Latn-TZ",
    "sc": "sc-Latn-IT",
    "sck": "sck-Deva-IN",
    "scl": "scl-Arab-ZZ",
    "scn": "scn-Latn-IT",
    "sco": "sco-Latn-GB",
    "sd": "sd-Arab-PK",
    "sd-Deva": "sd-Deva-IN",
    "sd-IN": "sd-Deva-IN",
    "sd-Khoj": "sd-Khoj-IN",
    "sd-Sind": "sd-Sind-IN",
    "sdc": "sdc-Latn-IT",
    "sdh": "sdh-Arab-IR",
    "se": "se-Latn-NO",
    "sef": "sef-Latn-CI",
    "seh": "seh-Latn-MZ",
    "sei": "sei-Latn-MX",
    "ses": "ses-Latn-ML",
    "sg": "sg-Latn-CF",
    "sga": "sga-Ogam-IE",
    "sgs": "sgs-Latn-LT",
    "sgw": "sgw-Ethi-ZZ",
    "sgz": "sgz-Latn-ZZ",
    "shi": "shi-Tfng-MA",
    "shk": "shk-Latn-ZZ",
    "shn": "shn-Mymr-MM",
    "shu": "shu-Arab-ZZ",
    "si": "si-Sinh-LK",
    "sid": "sid-Latn-ET",
    "sig": "sig-Latn-ZZ",
    "sil": "sil-Latn-ZZ",
    "sim": "sim-Latn-ZZ",
    "sjr": "sjr-Latn-ZZ",
    "sk": "sk-Latn-SK",
    "skc": "skc-Latn-ZZ",
    "skr": "skr-Arab-PK",
    "sks": "sks-Latn-ZZ",
    "sl": "sl-Latn-SI",
    "sld": "sld-Latn-ZZ",
    "sli": "sli-Latn-PL",
    "sll": "sll-Latn-ZZ",
    "sly": "sly-Latn-ID",
    "sm": "sm-Latn-WS",
    "sma": "sma-Latn-SE",
    "smd": "kmb-Latn-AO",
    "smj": "smj-Latn-SE",
    "smn": "smn-Latn-FI",
    "smp": "smp-Samr-IL",
    "smq": "smq-Latn-ZZ",
    "sms": "sms-Latn-FI",
    "sn": "sn-Latn-ZW",
    "snb": "iba-Latn-MY",
    "snc": "snc-Latn-ZZ",
    "snk": "snk-Latn-ML",
    "snp": "snp-Latn-ZZ",
    "snx": "snx-Latn-ZZ",
    "sny": "sny-Latn-ZZ",
    "so": "so-Latn-SO",
    "sog": "sog-Sogd-UZ",
    "sok": "sok-Latn-ZZ",
    "soq": "soq-Latn-ZZ",
    "sou": "sou-Thai-TH",
    "soy": "soy-Latn-ZZ",
    "spd": "spd-Latn-ZZ",
    "spl": "spl-Latn-ZZ",
    "sps": "sps-Latn-ZZ",
    "sq": "sq-Latn-AL",
    "sr": "sr-Cyrl-RS",
    "sr-ME": "sr-Latn-ME",
    "sr-RO": "sr-Latn-RO",
    "sr-RU": "sr-Latn-RU",
    "sr-TR": "sr-Latn-TR",
    "srb": "srb-Sora-IN",
    "srn": "srn-Latn-SR",
    "srr": "srr-Latn-SN",
    "srx": "srx-Deva-IN",
    "ss": "ss-Latn-ZA",
    "ssd": "ssd-Latn-ZZ",
    "ssg": "ssg-Latn-ZZ",
    "ssy": "ssy-Latn-ER",
    "st": "st-Latn-ZA",
    "stk": "stk-Latn-ZZ",
    "stq": "stq-Latn-DE",
    "su": "su-Latn-ID",
    "sua": "sua-Latn-ZZ",
    "sue": "sue-Latn-ZZ",
    "suk": "suk-Latn-TZ",
    "sur": "sur-Latn-ZZ",
    "sus": "sus-Latn-GN",
    "sv": "sv-Latn-SE",
    "sw": "sw-Latn-TZ",
    "swb": "swb-Arab-YT",
    "swc": "sw-Latn-CD",
    "swg": "swg-Latn-DE",
    "swp": "swp-Latn-ZZ",
    "swv": "swv-Deva-IN",
    "sxn": "sxn-Latn-ID",
    "sxw": "sxw-Latn-ZZ",
    "syl": "syl-Beng-BD",
    "syr": "syr-Syrc-IQ",
    "szl": "szl-Latn-PL",
    "ta": "ta-Taml-IN",
    "taj": "taj-Deva-NP",
    "tal": "tal-Latn-ZZ",
    "tan": "tan-Latn-ZZ",
    "taq": "taq-Latn-ZZ",
    "tbc": "tbc-Latn-ZZ",
    "tbd": "tbd-Latn-ZZ",
    "tbf": "tbf-Latn-ZZ",
    "tbg": "tbg-Latn-ZZ",
    "tbo": "tbo-Latn-ZZ",
    "tbw": "tbw-Latn-PH",
    "tbz": "tbz-Latn-ZZ",
    "tci": "tci-Latn-ZZ",
    "tcy": "tcy-Knda-IN",
    "tdd": "tdd-Tale-CN",
    "tdg": "tdg-Deva-NP",
    "tdh": "tdh-Deva-NP",
    "tdu": "dtp-Latn-MY",
    "te": "te-Telu-IN",
    "ted": "ted-Latn-ZZ",
    "tem": "tem-Latn-SL",
    "teo": "teo-Latn-UG",
    "tet": "tet-Latn-TL",
    "tfi": "tfi-Latn-ZZ",
    "tg": "tg-Cyrl-TJ",
    "tg-Arab": "tg-Arab-PK",
    "tg-PK": "tg-Arab-PK",
    "tgc": "tgc-Latn-ZZ",
    "tgo": "tgo-Latn-ZZ",
    "tgu": "tgu-Latn-ZZ",
    "th": "th-Thai-TH",
    "thl": "thl-Deva-NP",
    "thq": "thq-Deva-NP",
    "thr": "thr-Deva-NP",
    "ti": "ti-Ethi-ET",
    "tif": "tif-Latn-ZZ",
    "tig": "tig-Ethi-ER",
    "tik": "tik-Latn-ZZ",
    "tim": "tim-Latn-ZZ",
    "tio": "tio-Latn-ZZ",
    "tiv": "tiv-Latn-NG",
    "tk": "tk-Latn-TM",
    "tkl": "tkl-Latn-TK",
    "tkr": "tkr-Latn-AZ",
    "tkt": "tkt-Deva-NP",
    "tl": "fil-Latn-PH",
    "tlf": "tlf-Latn-ZZ",
    "tlx": "tlx-Latn-ZZ",
    "tly": "tly-Latn-AZ",
    "tmh": "tmh-Latn-NE",
    "tmy": "tmy-Latn-ZZ",
    "tn": "tn-Latn-ZA",
    "tnh": "tnh-Latn-ZZ",
    "to": "to-Latn-TO",
    "tof": "tof-Latn-ZZ",
    "tog": "tog-Latn-MW",
    "tok": "tok-Latn-001",
    "toq": "toq-Latn-ZZ",
    "tpi": "tpi-Latn-PG",
    "tpm": "tpm-Latn-ZZ",
    "tpz": "tpz-Latn-ZZ",
    "tqo": "tqo-Latn-ZZ",
    "tr": "tr-Latn-TR",
    "tru": "tru-Latn-TR",
    "trv": "trv-Latn-TW",
    "trw": "trw-Arab-PK",
    "ts": "ts-Latn-ZA",
    "tsd": "tsd-Grek-GR",
    "tsf": "taj-Deva-NP",
    "tsg": "tsg-Latn-PH",
    "tsj": "tsj-Tibt-BT",
    "tsw": "tsw-Latn-ZZ",
    "tt": "tt-Cyrl-RU",
    "ttd": "ttd-Latn-ZZ",
    "tte": "tte-Latn-ZZ",
    "ttj": "ttj-Latn-UG",
    "ttr": "ttr-Latn-ZZ",
    "tts": "tts-Thai-TH",
    "ttt": "ttt-Latn-AZ",
    "tuh": "tuh-Latn-ZZ",
    "tul": "tul-Latn-ZZ",
    "tum": "tum-Latn-MW",
    "tuq": "tuq-Latn-ZZ",
    "tvd": "tvd-Latn-ZZ",
    "tvl": "tvl-Latn-TV",
    "tvu": "tvu-Latn-ZZ",
    "twh": "twh-Latn-ZZ",
    "twq": "twq-Latn-NE",
    "txg": "txg-Tang-CN",
    "txo": "txo-Toto-IN",
    "ty": "ty-Latn-PF",
    "tya": "tya-Latn-ZZ",
    "tyv": "tyv-Cyrl-RU",
    "tzm": "tzm-Latn-MA",
    "ubu": "ubu-Latn-ZZ",
    "udi": "udi-Aghb-RU",
    "udm": "udm-Cyrl-RU",
    "ug": "ug-Arab-CN",
    "ug-Cyrl": "ug-Cyrl-KZ",
    "ug-KZ": "ug-Cyrl-KZ",
    "ug-MN": "ug-Cyrl-MN",
    "uga": "uga-Ugar-SY",
    "uk": "uk-Cyrl-UA",
    "uli": "uli-Latn-FM",
    "umb": "umb-Latn-AO",
    "und": "en-Latn-US",
    "und-002": "en-Latn-NG",
    "und-003": "en-Latn-US",
    "und-005": "pt-Latn-BR",
    "und-009": "en-Latn-AU",
    "und-011": "en-Latn-NG",
    "und-013": "es-Latn-MX",
    "und-014": "sw-Latn-TZ",
    "und-015": "ar-Arab-EG",
    "und-017": "sw-Latn-CD",
    "und-018": "en-Latn-ZA",
    "und-019": "en-Latn-US",
    "und-021": "en-Latn-US",
    "und-029": "es-Latn-CU",
    "und-030": "zh-Hans-CN",
    "und-034": "hi-Deva-IN",
    "und-035": "id-Latn-ID",
    "und-039": "it-Latn-IT",
    "und-053": "en-Latn-AU",
    "und-054": "en-Latn-PG",
    "und-057": "en-Latn-GU",
    "und-061": "sm-Latn-WS",
    "und-142": "zh-Hans-CN",
    "und-143": "uz-Latn-UZ",
    "und-145": "ar-Arab-SA",
    "und-150": "ru-Cyrl-RU",
    "und-151": "ru-Cyrl-RU",
    "und-154": "en-Latn-GB",
    "und-155": "de-Latn-DE",
    "und-202": "en-Latn-NG",
    "und-419": "es-Latn-419",
    "und-AD": "ca-Latn-AD",
    "und-AE": "ar-Arab-AE",
    "und-AF": "fa-Arab-AF",
    "und-AL": "sq-Latn-AL",
    "und-AM": "hy-Armn-AM",
    "und-AO": "pt-Latn-AO",
    "und-AQ": "und-Latn-AQ",
    "und-AR": "es-Latn-AR",
    "und-AS": "sm-Latn-AS",
    "und-AT": "de-Latn-AT",
    "und-AW": "nl-Latn-AW",
    "und-AX": "sv-Latn-AX",
    "und-AZ": "az-Latn-AZ",
    "und-Adlm": "ff-Adlm-GN",
    "und-Aghb": "udi-Aghb-RU",
    "und-Ahom": "aho-Ahom-IN",
    "und-Arab": "ar-Arab-EG",
    "und-Arab-CC": "ms-Arab-CC",
    "und-Arab-CN": "ug-Arab-CN",
    "und-Arab-GB": "ur-Arab-GB",
    "und-Arab-ID": "ms-Arab-ID",
    "und-Arab-IN": "ur-Arab-IN",
    "und-Arab-KH": "cja-Arab-KH",
    "und-Arab-MM": "rhg-Arab-MM",
    "und-Arab-MN": "kk-Arab-MN",
    "und-Arab-MU": "ur-Arab-MU",
    "und-Arab-NG": "ha-Arab-NG",
    "und-Arab-PK": "ur-Arab-PK",
    "und-Arab-TG": "apd-Arab-TG",
    "und-Arab-TH": "mfa-Arab-TH",
    "und-Arab-TJ": "fa-Arab-TJ",
    "und-Arab-TR": "az-Arab-TR",
    "und-Arab-YT": "swb-Arab-YT",
    "und-Armi": "arc-Armi-IR",
    "und-Armn": "hy-Armn-AM",
    "und-Avst": "ae-Avst-IR",
    "und-BA": "bs-Latn-BA",
    "und-BD": "bn-Beng-BD",
    "und-BE": "nl-Latn-BE",
    "und-BF": "fr-Latn-BF",
    "und-BG": "bg-Cyrl-BG",
    "und-BH": "ar-Arab-BH",
    "und-BI": "rn-Latn-BI",
    "und-BJ": "fr-Latn-BJ",
    "und-BL": "fr-Latn-BL",
    "und-BN": "ms-Latn-BN",
    "und-BO": "es-Latn-BO",
    "und-BQ": "pap-Latn-BQ",
    "und-BR": "pt-Latn-BR",
    "und-BT": "dz-Tibt-BT",
    "und-BV": "und-Latn-BV",
    "und-BY": "be-Cyrl-BY",
    "und-Bali": "ban-Bali-ID",
    "und-Bamu": "bax-Bamu-CM",
    "und-Bass": "bsq-Bass-LR",
    "und-Batk": "bbc-Batk-ID",
    "und-Beng": "bn-Beng-BD",
    "und-Bhks": "sa-Bhks-IN",
    "und-Bopo": "zh-Bopo-TW",
    "und-Brah": "pka-Brah-IN",
    "und-Brai": "fr-Brai-FR",
    "und-Bugi": "bug-Bugi-ID",
    "und-Buhd": "bku-Buhd-PH",
    "und-CD": "sw-Latn-CD",
    "und-CF": "fr-Latn-CF",
    "und-CG": "fr-Latn-CG",
    "und-CH": "de-Latn-CH",
    "und-CI": "fr-Latn-CI",
    "und-CL": "es-Latn-CL",
    "und-CM": "fr-Latn-CM",
    "und-CN": "zh-Hans-CN",
    "und-CO": "es-Latn-CO",
    "und-CP": "und-Latn-CP",
    "und-CR": "es-Latn-CR",
    "und-CU": "es-Latn-CU",
    "und-CV": "pt-Latn-CV",
    "und-CW": "pap-Latn-CW",
    "und-CY": "el-Grek-CY",
    "und-CZ": "cs-Latn-CZ",
    "und-Cakm": "ccp-Cakm-BD",
    "und-Cans": "iu-Cans-CA",
    "und-Cari": "xcr-Cari-TR",
    "und-Cham": "cjm-Cham-VN",
    "und-Cher": "chr-Cher-US",
    "und-Chrs": "xco-Chrs-UZ",
    "und-Copt": "cop-Copt-EG",
    "und-Cpmn": "und-Cpmn-CY",
    "und-Cpmn-CY": "und-Cpmn-CY",
    "und-Cprt": "grc-Cprt-CY",
    "und-Cyrl": "ru-Cyrl-RU",
    "und-Cyrl-AL": "mk-Cyrl-AL",
    "und-Cyrl-BA": "sr-Cyrl-BA",
    "und-Cyrl-GE": "ab-Cyrl-GE",
    "und-Cyrl-GR": "mk-Cyrl-GR",
    "und-Cyrl-MD": "uk-Cyrl-MD",
    "und-Cyrl-RO": "bg-Cyrl-RO",
    "und-Cyrl-SK": "uk-Cyrl-SK",
    "und-Cyrl-TR": "kbd-Cyrl-TR",
    "und-Cyrl-XK": "sr-Cyrl-XK",
    "und-DE": "de-Latn-DE",
    "und-DJ": "aa-Latn-DJ",
    "und-DK": "da-Latn-DK",
    "und-DO": "es-Latn-DO",
    "und-DZ": "ar-Arab-DZ",
    "und-Deva": "hi-Deva-IN",
    "und-Deva-BT": "ne-Deva-BT",
    "und-Deva-FJ": "hif-Deva-FJ",
    "und-Deva-MU": "bho-Deva-MU",
    "und-Deva-PK": "btv-Deva-PK",
    "und-Diak": "dv-Diak-MV",
    "und-Dogr": "doi-Dogr-IN",
    "und-Dupl": "fr-Dupl-FR",
    "und-EA": "es-Latn-EA",
    "und-EC": "es-Latn-EC",
    "und-EE": "et-Latn-EE",
    "und-EG": "ar-Arab-EG",
    "und-EH": "ar-Arab-EH",
    "und-ER": "ti-Ethi-ER",
    "und-ES": "es-Latn-ES",
    "und-ET": "am-Ethi-ET",
    "und-EU": "en-Latn-IE",
    "und-EZ": "de-Latn-EZ",
    "und-Egyp": "egy-Egyp-EG",
    "und-Elba": "sq-Elba-AL",
    "und-Elym": "arc-Elym-IR",
    "und-Ethi": "am-Ethi-ET",
    "und-FI": "fi-Latn-FI",
    "und-FO": "fo-Latn-FO",
    "und-FR": "fr-Latn-FR",
    "und-GA": "fr-Latn-GA",
    "und-GE": "ka-Geor-GE",
    "und-GF": "fr-Latn-GF",
    "und-GH": "ak-Latn-GH",
    "und-GL": "kl-Latn-GL",
    "und-GN": "fr-Latn-GN",
    "und-GP": "fr-Latn-GP",
    "und-GQ": "es-Latn-GQ",
    "und-GR": "el-Grek-GR",
    "und-GS": "und-Latn-GS",
    "und-GT": "es-Latn-GT",
    "und-GW": "pt-Latn-GW",
    "und-Geor": "ka-Geor-GE",
    "und-Glag": "cu-Glag-BG",
    "und-Gong": "wsg-Gong-IN",
    "und-Gonm": "esg-Gonm-IN",
    "und-Goth": "got-Goth-UA",
    "und-Gran": "sa-Gran-IN",
    "und-Grek": "el-Grek-GR",
    "und-Grek-TR": "bgx-Grek-TR",
    "und-Gujr": "gu-Gujr-IN",
    "und-Guru": "pa-Guru-IN",
    "und-HK": "zh-Hant-HK",
    "und-HM": "und-Latn-HM",
    "und-HN": "es-Latn-HN",
    "und-HR": "hr-Latn-HR",
    "und-HT": "ht-Latn-HT",
    "und-HU": "hu-Latn-HU",
    "und-Hanb": "zh-Hanb-TW",
    "und-Hang": "ko-Hang-KR",
    "und-Hani": "zh-Hani-CN",
    "und-Hano": "hnn-Hano-PH",
    "und-Hans": "zh-Hans-CN",
    "und-Hant": "zh-Hant-TW",
    "und-Hant-CA": "yue-Hant-CA",
    "und-Hebr": "he-Hebr-IL",
    "und-Hebr-SE": "yi-Hebr-SE",
    "und-Hebr-UA": "yi-Hebr-UA",
    "und-Hebr-US": "yi-Hebr-US",
    "und-Hira": "ja-Hira-JP",
    "und-Hluw": "hlu-Hluw-TR",
    "und-Hmng": "hnj-Hmng-LA",
    "und-Hmnp": "hnj-Hmnp-US",
    "und-Hung": "hu-Hung-HU",
    "und-IC": "es-Latn-IC",
    "und-ID": "id-Latn-ID",
    "und-IL": "he-Hebr-IL",
    "und-IN": "hi-Deva-IN",
    "und-IQ": "ar-Arab-IQ",
    "und-IR": "fa-Arab-IR",
    "und-IS": "is-Latn-IS",
    "und-IT": "it-Latn-IT",
    "und-Ital": "ett-Ital-IT",
    "und-JO": "ar-Arab-JO",
    "und-JP": "ja-Jpan-JP",
    "und-Jamo": "ko-Jamo-KR",
    "und-Java": "jv-Java-ID",
    "und-Jpan": "ja-Jpan-JP",
    "und-KE": "sw-Latn-KE",
    "und-KG": "ky-Cyrl-KG",
    "und-KH": "km-Khmr-KH",
    "und-KM": "ar-Arab-KM",
    "und-KP": "ko-Kore-KP",
    "und-KR": "ko-Kore-KR",
    "und-KW": "ar-Arab-KW",
    "und-KZ": "ru-Cyrl-KZ",
    "und-Kali": "eky-Kali-MM",
    "und-Kana": "ja-Kana-JP",
    "und-Kawi": "kaw-Kawi-ID",
    "und-Khar": "pra-Khar-PK",
    "und-Khmr": "km-Khmr-KH",
    "und-Khoj": "sd-Khoj-IN",
    "und-Kits": "zkt-Kits-CN",
    "und-Knda": "kn-Knda-IN",
    "und-Kore": "ko-Kore-KR",
    "und-Kthi": "bho-Kthi-IN",
    "und-LA": "lo-Laoo-LA",
    "und-LB": "ar-Arab-LB",
    "und-LI": "de-Latn-LI",
    "und-LK": "si-Sinh-LK",
    "und-LS": "st-Latn-LS",
    "und-LT": "lt-Latn-LT",
    "und-LU": "fr-Latn-LU",
    "und-LV": "lv-Latn-LV",
    "und-LY": "ar-Arab-LY",
    "und-Lana": "nod-Lana-TH",
    "und-Laoo": "lo-Laoo-LA",
    "und-Latn-AF": "tk-Latn-AF",
    "und-Latn-AM": "ku-Latn-AM",
    "und-Latn-CN": "za-Latn-CN",
    "und-Latn-CY": "tr-Latn-CY",
    "und-Latn-DZ": "fr-Latn-DZ",
    "und-Latn-ET": "en-Latn-ET",
    "und-Latn-GE": "ku-Latn-GE",
    "und-Latn-IR": "tk-Latn-IR",
    "und-Latn-KM": "fr-Latn-KM",
    "und-Latn-MA": "fr-Latn-MA",
    "und-Latn-MK": "sq-Latn-MK",
    "und-Latn-MM": "kac-Latn-MM",
    "und-Latn-MO": "pt-Latn-MO",
    "und-Latn-MR": "fr-Latn-MR",
    "und-Latn-RU": "krl-Latn-RU",
    "und-Latn-SY": "fr-Latn-SY",
    "und-Latn-TN": "fr-Latn-TN",
    "und-Latn-TW": "trv-Latn-TW",
    "und-Latn-UA": "pl-Latn-UA",
    "und-Lepc": "lep-Lepc-IN",
    "und-Limb": "lif-Limb-IN",
    "und-Lina": "lab-Lina-GR",
    "und-Linb": "grc-Linb-GR",
    "und-Lisu": "lis-Lisu-CN",
    "und-Lyci": "xlc-Lyci-TR",
    "und-Lydi": "xld-Lydi-TR",
    "und-MA": "ar-Arab-MA",
    "und-MC": "fr-Latn-MC",
    "und-MD": "ro-Latn-MD",
    "und-ME": "sr-Latn-ME",
    "und-MF": "fr-Latn-MF",
    "und-MG": "mg-Latn-MG",
    "und-MK": "mk-Cyrl-MK",
    "und-ML": "bm-Latn-ML",
    "und-MM": "my-Mymr-MM",
    "und-MN": "mn-Cyrl-MN",
    "und-MO": "zh-Hant-MO",
    "und-MQ": "fr-Latn-MQ",
    "und-MR": "ar-Arab-MR",
    "und-MT": "mt-Latn-MT",
    "und-MU": "mfe-Latn-MU",
    "und-MV": "dv-Thaa-MV",
    "und-MX": "es-Latn-MX",
    "und-MY": "ms-Latn-MY",
    "und-MZ": "pt-Latn-MZ",
    "und-Mahj": "hi-Mahj-IN",
    "und-Maka": "mak-Maka-ID",
    "und-Mand": "myz-Mand-IR",
    "und-Mani": "xmn-Mani-CN",
    "und-Marc": "bo-Marc-CN",
    "und-Medf": "dmf-Medf-NG",
    "und-Mend": "men-Mend-SL",
    "und-Merc": "xmr-Merc-SD",
    "und-Mero": "xmr-Mero-SD",
    "und-Mlym": "ml-Mlym-IN",
    "und-Modi": "mr-Modi-IN",
    "und-Mong": "mn-Mong-CN",
    "und-Mroo": "mro-Mroo-BD",
    "und-Mtei": "mni-Mtei-IN",
    "und-Mult": "skr-Mult-PK",
    "und-Mymr": "my-Mymr-MM",
    "und-Mymr-IN": "kht-Mymr-IN",
    "und-Mymr-TH": "mnw-Mymr-TH",
    "und-NA": "af-Latn-NA",
    "und-NC": "fr-Latn-NC",
    "und-NE": "ha-Latn-NE",
    "und-NI": "es-Latn-NI",
    "und-NL": "nl-Latn-NL",
    "und-NO": "nb-Latn-NO",
    "und-NP": "ne-Deva-NP",
    "und-Nagm": "unr-Nagm-IN",
    "und-Nand": "sa-Nand-IN",
    "und-Narb": "xna-Narb-SA",
    "und-Nbat": "arc-Nbat-JO",
    "und-Newa": "new-Newa-NP",
    "und-Nkoo": "man-Nkoo-GN",
    "und-Nshu": "zhx-Nshu-CN",
    "und-OM": "ar-Arab-OM",
    "und-Ogam": "sga-Ogam-IE",
    "und-Olck": "sat-Olck-IN",
    "und-Orkh": "otk-Orkh-MN",
    "und-Orya": "or-Orya-IN",
    "und-Osge": "osa-Osge-US",
    "und-Osma": "so-Osma-SO",
    "und-Ougr": "oui-Ougr-143",
    "und-PA": "es-Latn-PA",
    "und-PE": "es-Latn-PE",
    "und-PF": "fr-Latn-PF",
    "und-PG": "tpi-Latn-PG",
    "und-PH": "fil-Latn-PH",
    "und-PK": "ur-Arab-PK",
    "und-PL": "pl-Latn-PL",
    "und-PM": "fr-Latn-PM",
    "und-PR": "es-Latn-PR",
    "und-PS": "ar-Arab-PS",
    "und-PT": "pt-Latn-PT",
    "und-PW": "pau-Latn-PW",
    "und-PY": "gn-Latn-PY",
    "und-Palm": "arc-Palm-SY",
    "und-Pauc": "ctd-Pauc-MM",
    "und-Perm": "kv-Perm-RU",
    "und-Phag": "lzh-Phag-CN",
    "und-Phli": "pal-Phli-IR",
    "und-Phlp": "pal-Phlp-CN",
    "und-Phnx": "phn-Phnx-LB",
    "und-Plrd": "hmd-Plrd-CN",
    "und-Prti": "xpr-Prti-IR",
    "und-QA": "ar-Arab-QA",
    "und-QO": "en-Latn-DG",
    "und-RE": "fr-Latn-RE",
    "und-RO": "ro-Latn-RO",
    "und-RS": "sr-Cyrl-RS",
    "und-RU": "ru-Cyrl-RU",
    "und-RW": "rw-Latn-RW",
    "und-Rjng": "rej-Rjng-ID",
    "und-Rohg": "rhg-Rohg-MM",
    "und-Runr": "non-Runr-SE",
    "und-SA": "ar-Arab-SA",
    "und-SC": "fr-Latn-SC",
    "und-SD": "ar-Arab-SD",
    "und-SE": "sv-Latn-SE",
    "und-SI": "sl-Latn-SI",
    "und-SJ": "nb-Latn-SJ",
    "und-SK": "sk-Latn-SK",
    "und-SM": "it-Latn-SM",
    "und-SN": "fr-Latn-SN",
    "und-SO": "so-Latn-SO",
    "und-SR": "nl-Latn-SR",
    "und-ST": "pt-Latn-ST",
    "und-SV": "es-Latn-SV",
    "und-SY": "ar-Arab-SY",
    "und-Samr": "smp-Samr-IL",
    "und-Sarb": "xsa-Sarb-YE",
    "und-Saur": "saz-Saur-IN",
    "und-Sgnw": "ase-Sgnw-US",
    "und-Shaw": "en-Shaw-GB",
    "und-Shrd": "sa-Shrd-IN",
    "und-Sidd": "sa-Sidd-IN",
    "und-Sind": "sd-Sind-IN",
    "und-Sinh": "si-Sinh-LK",
    "und-Sogd": "sog-Sogd-UZ",
    "und-Sogo": "sog-Sogo-UZ",
    "und-Sora": "srb-Sora-IN",
    "und-Soyo": "cmg-Soyo-MN",
    "und-Sund": "su-Sund-ID",
    "und-Sylo": "syl-Sylo-BD",
    "und-Syrc": "syr-Syrc-IQ",
    "und-TD": "fr-Latn-TD",
    "und-TF": "fr-Latn-TF",
    "und-TG": "fr-Latn-TG",
    "und-TH": "th-Thai-TH",
    "und-TJ": "tg-Cyrl-TJ",
    "und-TK": "tkl-Latn-TK",
    "und-TL": "pt-Latn-TL",
    "und-TM": "tk-Latn-TM",
    "und-TN": "ar-Arab-TN",
    "und-TO": "to-Latn-TO",
    "und-TR": "tr-Latn-TR",
    "und-TV": "tvl-Latn-TV",
    "und-TW": "zh-Hant-TW",
    "und-TZ": "sw-Latn-TZ",
    "und-Tagb": "tbw-Tagb-PH",
    "und-Takr": "doi-Takr-IN",
    "und-Tale": "tdd-Tale-CN",
    "und-Talu": "khb-Talu-CN",
    "und-Taml": "ta-Taml-IN",
    "und-Tang": "txg-Tang-CN",
    "und-Tavt": "blt-Tavt-VN",
    "und-Telu": "te-Telu-IN",
    "und-Tfng": "zgh-Tfng-MA",
    "und-Tglg": "fil-Tglg-PH",
    "und-Thaa": "dv-Thaa-MV",
    "und-Thai": "th-Thai-TH",
    "und-Thai-CN": "lcp-Thai-CN",
    "und-Thai-KH": "kdt-Thai-KH",
    "und-Thai-LA": "kdt-Thai-LA",
    "und-Tibt": "bo-Tibt-CN",
    "und-Tirh": "mai-Tirh-IN",
    "und-Tnsa": "nst-Tnsa-IN",
    "und-Toto": "txo-Toto-IN",
    "und-UA": "uk-Cyrl-UA",
    "und-UG": "sw-Latn-UG",
    "und-UY": "es-Latn-UY",
    "und-UZ": "uz-Latn-UZ",
    "und-Ugar": "uga-Ugar-SY",
    "und-VA": "it-Latn-VA",
    "und-VE": "es-Latn-VE",
    "und-VN": "vi-Latn-VN",
    "und-VU": "bi-Latn-VU",
    "und-Vaii": "vai-Vaii-LR",
    "und-Vith": "sq-Vith-AL",
    "und-WF": "fr-Latn-WF",
    "und-WS": "sm-Latn-WS",
    "und-Wara": "hoc-Wara-IN",
    "und-Wcho": "nnp-Wcho-IN",
    "und-XK": "sq-Latn-XK",
    "und-Xpeo": "peo-Xpeo-IR",
    "und-Xsux": "akk-Xsux-IQ",
    "und-YE": "ar-Arab-YE",
    "und-YT": "fr-Latn-YT",
    "und-Yezi": "ku-Yezi-GE",
    "und-Yiii": "ii-Yiii-CN",
    "und-ZW": "sn-Latn-ZW",
    "und-Zanb": "cmg-Zanb-MN",
    "unr": "unr-Beng-IN",
    "unr-Deva": "unr-Deva-NP",
    "unr-NP": "unr-Deva-NP",
    "unx": "unx-Beng-IN",
    "uok": "ema-Latn-ZZ",
    "ur": "ur-Arab-PK",
    "uri": "uri-Latn-ZZ",
    "urt": "urt-Latn-ZZ",
    "urw": "urw-Latn-ZZ",
    "usa": "usa-Latn-ZZ",
    "uth": "uth-Latn-ZZ",
    "utr": "utr-Latn-ZZ",
    "uvh": "uvh-Latn-ZZ",
    "uvl": "uvl-Latn-ZZ",
    "uz": "uz-Latn-UZ",
    "uz-AF": "uz-Arab-AF",
    "uz-Arab": "uz-Arab-AF",
    "uz-CN": "uz-Cyrl-CN",
    "vag": "vag-Latn-ZZ",
    "vai": "vai-Vaii-LR",
    "van": "van-Latn-ZZ",
    "ve": "ve-Latn-ZA",
    "vec": "vec-Latn-IT",
    "vep": "vep-Latn-RU",
    "vi": "vi-Latn-VN",
    "vic": "vic-Latn-SX",
    "viv": "viv-Latn-ZZ",
    "vls": "vls-Latn-BE",
    "vmf": "vmf-Latn-DE",
    "vmw": "vmw-Latn-MZ",
    "vo": "vo-Latn-001",
    "vot": "vot-Latn-RU",
    "vro": "vro-Latn-EE",
    "vun": "vun-Latn-TZ",
    "vut": "vut-Latn-ZZ",
    "wa": "wa-Latn-BE",
    "wae": "wae-Latn-CH",
    "waj": "waj-Latn-ZZ",
    "wal": "wal-Ethi-ET",
    "wan": "wan-Latn-ZZ",
    "war": "war-Latn-PH",
    "wbp": "wbp-Latn-AU",
    "wbq": "wbq-Telu-IN",
    "wbr": "wbr-Deva-IN",
    "wci": "wci-Latn-ZZ",
    "wer": "wer-Latn-ZZ",
    "wgi": "wgi-Latn-ZZ",
    "whg": "whg-Latn-ZZ",
    "wib": "wib-Latn-ZZ",
    "wiu": "wiu-Latn-ZZ",
    "wiv": "wiv-Latn-ZZ",
    "wja": "wja-Latn-ZZ",
    "wji": "wji-Latn-ZZ",
    "wls": "wls-Latn-WF",
    "wmo": "wmo-Latn-ZZ",
    "wnc": "wnc-Latn-ZZ",
    "wni": "wni-Arab-KM",
    "wnu": "wnu-Latn-ZZ",
    "wo": "wo-Latn-SN",
    "wob": "wob-Latn-ZZ",
    "wos": "wos-Latn-ZZ",
    "wrs": "wrs-Latn-ZZ",
    "wsg": "wsg-Gong-IN",
    "wsk": "wsk-Latn-ZZ",
    "wtm": "wtm-Deva-IN",
    "wuu": "wuu-Hans-CN",
    "wuv": "wuv-Latn-ZZ",
    "wwa": "wwa-Latn-ZZ",
    "xav": "xav-Latn-BR",
    "xbi": "xbi-Latn-ZZ",
    "xco": "xco-Chrs-UZ",
    "xcr": "xcr-Cari-TR",
    "xes": "xes-Latn-ZZ",
    "xh": "xh-Latn-ZA",
    "xla": "xla-Latn-ZZ",
    "xlc": "xlc-Lyci-TR",
    "xld": "xld-Lydi-TR",
    "xmf": "xmf-Geor-GE",
    "xmn": "xmn-Mani-CN",
    "xmr": "xmr-Merc-SD",
    "xna": "xna-Narb-SA",
    "xnr": "xnr-Deva-IN",
    "xog": "xog-Latn-UG",
    "xon": "xon-Latn-ZZ",
    "xpr": "xpr-Prti-IR",
    "xrb": "xrb-Latn-ZZ",
    "xsa": "xsa-Sarb-YE",
    "xsi": "xsi-Latn-ZZ",
    "xsm": "xsm-Latn-ZZ",
    "xsr": "xsr-Deva-NP",
    "xwe": "xwe-Latn-ZZ",
    "yam": "yam-Latn-ZZ",
    "yao": "yao-Latn-MZ",
    "yap": "yap-Latn-FM",
    "yas": "yas-Latn-ZZ",
    "yat": "yat-Latn-ZZ",
    "yav": "yav-Latn-CM",
    "yay": "yay-Latn-ZZ",
    "yaz": "yaz-Latn-ZZ",
    "yba": "yba-Latn-ZZ",
    "ybb": "ybb-Latn-CM",
    "yby": "yby-Latn-ZZ",
    "yer": "yer-Latn-ZZ",
    "ygr": "ygr-Latn-ZZ",
    "ygw": "ygw-Latn-ZZ",
    "yi": "yi-Hebr-001",
    "yko": "yko-Latn-ZZ",
    "yle": "yle-Latn-ZZ",
    "ylg": "ylg-Latn-ZZ",
    "yll": "yll-Latn-ZZ",
    "yml": "yml-Latn-ZZ",
    "yo": "yo-Latn-NG",
    "yon": "yon-Latn-ZZ",
    "yrb": "yrb-Latn-ZZ",
    "yre": "yre-Latn-ZZ",
    "yrl": "yrl-Latn-BR",
    "yss": "yss-Latn-ZZ",
    "yua": "yua-Latn-MX",
    "yue": "yue-Hant-HK",
    "yue-CN": "yue-Hans-CN",
    "yue-Hans": "yue-Hans-CN",
    "yuj": "yuj-Latn-ZZ",
    "yut": "yut-Latn-ZZ",
    "yuw": "yuw-Latn-ZZ",
    "za": "za-Latn-CN",
    "zag": "zag-Latn-SD",
    "zdj": "zdj-Arab-KM",
    "zea": "zea-Latn-NL",
    "zgh": "zgh-Tfng-MA",
    "zh": "zh-Hans-CN",
    "zh-AU": "zh-Hant-AU",
    "zh-BN": "zh-Hant-BN",
    "zh-Bopo": "zh-Bopo-TW",
    "zh-GB": "zh-Hant-GB",
    "zh-GF": "zh-Hant-GF",
    "zh-HK": "zh-Hant-HK",
    "zh-Hanb": "zh-Hanb-TW",
    "zh-Hant": "zh-Hant-TW",
    "zh-ID": "zh-Hant-ID",
    "zh-MO": "zh-Hant-MO",
    "zh-PA": "zh-Hant-PA",
    "zh-PF": "zh-Hant-PF",
    "zh-PH": "zh-Hant-PH",
    "zh-SR": "zh-Hant-SR",
    "zh-TH": "zh-Hant-TH",
    "zh-TW": "zh-Hant-TW",
    "zh-US": "zh-Hant-US",
    "zh-VN": "zh-Hant-VN",
    "zhx": "zhx-Nshu-CN",
    "zia": "zia-Latn-ZZ",
    "zkt": "zkt-Kits-CN",
    "zlm": "zlm-Latn-TG",
    "zmi": "zmi-Latn-MY",
    "zne": "zne-Latn-ZZ",
    "zu": "zu-Latn-ZA",
    "zza": "zza-Latn-TR",
};

// Extracted from likelySubtags.xml.
// Derived from CLDR Supplemental Data, version 42.
// https://unicode.org/Public/cldr/42/core.zip
var minLikelySubtags = {
    "aa-Latn-DJ": "aa-DJ",
    "aa-Latn-ET": "aa",
    "aai-Latn-ZZ": "aai",
    "aak-Latn-ZZ": "aak",
    "aau-Latn-ZZ": "aau",
    "ab-Cyrl-GE": "ab",
    "abi-Latn-ZZ": "abi",
    "abq-Cyrl-ZZ": "abq",
    "abr-Latn-GH": "abr",
    "abt-Latn-ZZ": "abt",
    "aby-Latn-ZZ": "aby",
    "acd-Latn-ZZ": "acd",
    "ace-Latn-ID": "ace",
    "ach-Latn-UG": "ach",
    "ada-Latn-GH": "ada",
    "ade-Latn-ZZ": "ade",
    "adj-Latn-ZZ": "adj",
    "ady-Cyrl-RU": "ady",
    "adz-Latn-ZZ": "adz",
    "ae-Avst-IR": "ae",
    "aeb-Arab-TN": "aeb",
    "aey-Latn-ZZ": "aey",
    "af-Latn-NA": "af-NA",
    "af-Latn-ZA": "af",
    "agc-Latn-ZZ": "agc",
    "agd-Latn-ZZ": "agd",
    "agg-Latn-ZZ": "agg",
    "agm-Latn-ZZ": "agm",
    "ago-Latn-ZZ": "ago",
    "agq-Latn-CM": "agq",
    "aha-Latn-ZZ": "aha",
    "ahl-Latn-ZZ": "ahl",
    "aho-Ahom-IN": "aho",
    "ajg-Latn-ZZ": "ajg",
    "ak-Latn-GH": "ak",
    "akk-Xsux-IQ": "akk",
    "ala-Latn-ZZ": "ala",
    "ali-Latn-ZZ": "ali",
    "aln-Latn-XK": "aln",
    "alt-Cyrl-RU": "alt",
    "am-Ethi-ET": "am",
    "amm-Latn-ZZ": "amm",
    "amn-Latn-ZZ": "amn",
    "amo-Latn-NG": "amo",
    "amp-Latn-ZZ": "amp",
    "an-Latn-ES": "an",
    "anc-Latn-ZZ": "anc",
    "ank-Latn-ZZ": "ank",
    "ann-Latn-NG": "ann",
    "any-Latn-ZZ": "any",
    "aoj-Latn-ZZ": "aoj",
    "aom-Latn-ZZ": "aom",
    "aoz-Latn-ID": "aoz",
    "apc-Arab-ZZ": "apc",
    "apd-Arab-TG": "apd",
    "ape-Latn-ZZ": "ape",
    "apr-Latn-ZZ": "apr",
    "aps-Latn-ZZ": "aps",
    "apz-Latn-ZZ": "apz",
    "ar-Arab-AE": "ar-AE",
    "ar-Arab-BH": "ar-BH",
    "ar-Arab-DZ": "ar-DZ",
    "ar-Arab-EG": "ar",
    "ar-Arab-EH": "ar-EH",
    "ar-Arab-IQ": "ar-IQ",
    "ar-Arab-JO": "ar-JO",
    "ar-Arab-KM": "ar-KM",
    "ar-Arab-KW": "ar-KW",
    "ar-Arab-LB": "ar-LB",
    "ar-Arab-LY": "ar-LY",
    "ar-Arab-MA": "ar-MA",
    "ar-Arab-MR": "ar-MR",
    "ar-Arab-OM": "ar-OM",
    "ar-Arab-PS": "ar-PS",
    "ar-Arab-QA": "ar-QA",
    "ar-Arab-SA": "ar-SA",
    "ar-Arab-SD": "ar-SD",
    "ar-Arab-SY": "ar-SY",
    "ar-Arab-TN": "ar-TN",
    "ar-Arab-YE": "ar-YE",
    "arc-Armi-IR": "arc",
    "arc-Elym-IR": "arc-Elym",
    "arc-Nbat-JO": "arc-Nbat",
    "arc-Palm-SY": "arc-Palm",
    "arh-Latn-ZZ": "arh",
    "arn-Latn-CL": "arn",
    "aro-Latn-BO": "aro",
    "arq-Arab-DZ": "arq",
    "ars-Arab-SA": "ars",
    "ary-Arab-MA": "ary",
    "arz-Arab-EG": "arz",
    "as-Beng-IN": "as",
    "asa-Latn-TZ": "asa",
    "ase-Sgnw-US": "ase",
    "asg-Latn-ZZ": "asg",
    "aso-Latn-ZZ": "aso",
    "ast-Latn-ES": "ast",
    "ata-Latn-ZZ": "ata",
    "atg-Latn-ZZ": "atg",
    "atj-Latn-CA": "atj",
    "auy-Latn-ZZ": "auy",
    "av-Cyrl-RU": "av",
    "avl-Arab-ZZ": "avl",
    "avn-Latn-ZZ": "avn",
    "avt-Latn-ZZ": "avt",
    "avu-Latn-ZZ": "avu",
    "awa-Deva-IN": "awa",
    "awb-Latn-ZZ": "awb",
    "awo-Latn-ZZ": "awo",
    "awx-Latn-ZZ": "awx",
    "ay-Latn-BO": "ay",
    "ayb-Latn-ZZ": "ayb",
    "az-Arab-IQ": "az-IQ",
    "az-Arab-IR": "az-IR",
    "az-Arab-TR": "az-Arab-TR",
    "az-Cyrl-RU": "az-RU",
    "az-Latn-AZ": "az",
    "ba-Cyrl-RU": "ba",
    "bal-Arab-PK": "bal",
    "ban-Bali-ID": "ban-Bali",
    "ban-Latn-ID": "ban",
    "bap-Deva-NP": "bap",
    "bar-Latn-AT": "bar",
    "bas-Latn-CM": "bas",
    "bav-Latn-ZZ": "bav",
    "bax-Bamu-CM": "bax",
    "bba-Latn-ZZ": "bba",
    "bbb-Latn-ZZ": "bbb",
    "bbc-Batk-ID": "bbc-Batk",
    "bbc-Latn-ID": "bbc",
    "bbd-Latn-ZZ": "bbd",
    "bbj-Latn-CM": "bbj",
    "bbp-Latn-ZZ": "bbp",
    "bbr-Latn-ZZ": "bbr",
    "bcf-Latn-ZZ": "bcf",
    "bch-Latn-ZZ": "bch",
    "bci-Latn-CI": "bci",
    "bcm-Latn-ZZ": "bcm",
    "bcn-Latn-ZZ": "bcn",
    "bco-Latn-ZZ": "bco",
    "bcq-Ethi-ZZ": "bcq",
    "bcu-Latn-ZZ": "bcu",
    "bdd-Latn-ZZ": "bdd",
    "be-Cyrl-BY": "be",
    "bef-Latn-ZZ": "bef",
    "beh-Latn-ZZ": "beh",
    "bej-Arab-SD": "bej",
    "bem-Latn-ZM": "bem",
    "bet-Latn-ZZ": "bet",
    "bew-Latn-ID": "bew",
    "bex-Latn-ZZ": "bex",
    "bez-Latn-TZ": "bez",
    "bfd-Latn-CM": "bfd",
    "bfq-Taml-IN": "bfq",
    "bft-Arab-PK": "bft",
    "bfy-Deva-IN": "bfy",
    "bg-Cyrl-BG": "bg",
    "bg-Cyrl-RO": "bg-RO",
    "bgc-Deva-IN": "bgc",
    "bgn-Arab-PK": "bgn",
    "bgx-Grek-TR": "bgx",
    "bhb-Deva-IN": "bhb",
    "bhg-Latn-ZZ": "bhg",
    "bhi-Deva-IN": "bhi",
    "bhl-Latn-ZZ": "bhl",
    "bho-Deva-IN": "bho",
    "bho-Deva-MU": "bho-MU",
    "bho-Kthi-IN": "bho-Kthi",
    "bhy-Latn-ZZ": "bhy",
    "bi-Latn-VU": "bi",
    "bib-Latn-ZZ": "bib",
    "big-Latn-ZZ": "big",
    "bik-Latn-PH": "bik",
    "bim-Latn-ZZ": "bim",
    "bin-Latn-NG": "bin",
    "bio-Latn-ZZ": "bio",
    "biq-Latn-ZZ": "biq",
    "bjh-Latn-ZZ": "bjh",
    "bji-Ethi-ZZ": "bji",
    "bjj-Deva-IN": "bjj",
    "bjn-Latn-ID": "bjn",
    "bjo-Latn-ZZ": "bjo",
    "bjr-Latn-ZZ": "bjr",
    "bjt-Latn-SN": "bjt",
    "bjz-Latn-ZZ": "bjz",
    "bkc-Latn-ZZ": "bkc",
    "bkm-Latn-CM": "bkm",
    "bkq-Latn-ZZ": "bkq",
    "bku-Buhd-PH": "bku-Buhd",
    "bku-Latn-PH": "bku",
    "bkv-Latn-ZZ": "bkv",
    "bla-Latn-CA": "bla",
    "blt-Tavt-VN": "blt",
    "bm-Latn-ML": "bm",
    "bmh-Latn-ZZ": "bmh",
    "bmk-Latn-ZZ": "bmk",
    "bmq-Latn-ML": "bmq",
    "bmu-Latn-ZZ": "bmu",
    "bn-Beng-BD": "bn",
    "bng-Latn-ZZ": "bng",
    "bnm-Latn-ZZ": "bnm",
    "bnp-Latn-ZZ": "bnp",
    "bo-Marc-CN": "bo-Marc",
    "bo-Tibt-CN": "bo",
    "boj-Latn-ZZ": "boj",
    "bom-Latn-ZZ": "bom",
    "bon-Latn-ZZ": "bon",
    "bpy-Beng-IN": "bpy",
    "bqc-Latn-ZZ": "bqc",
    "bqi-Arab-IR": "bqi",
    "bqp-Latn-ZZ": "bqp",
    "bqv-Latn-CI": "bqv",
    "br-Latn-FR": "br",
    "bra-Deva-IN": "bra",
    "brh-Arab-PK": "brh",
    "brx-Deva-IN": "brx",
    "brz-Latn-ZZ": "brz",
    "bs-Latn-BA": "bs",
    "bsj-Latn-ZZ": "bsj",
    "bsq-Bass-LR": "bsq",
    "bss-Latn-CM": "bss",
    "bst-Ethi-ZZ": "bst",
    "bto-Latn-PH": "bto",
    "btt-Latn-ZZ": "btt",
    "btv-Deva-PK": "btv",
    "bua-Cyrl-RU": "bua",
    "buc-Latn-YT": "buc",
    "bud-Latn-ZZ": "bud",
    "bug-Bugi-ID": "bug-Bugi",
    "bug-Latn-ID": "bug",
    "buk-Latn-ZZ": "buk",
    "bum-Latn-CM": "bum",
    "buo-Latn-ZZ": "buo",
    "bus-Latn-ZZ": "bus",
    "buu-Latn-ZZ": "buu",
    "bvb-Latn-GQ": "bvb",
    "bwd-Latn-ZZ": "bwd",
    "bwr-Latn-ZZ": "bwr",
    "bxh-Latn-ZZ": "bxh",
    "bye-Latn-ZZ": "bye",
    "byn-Ethi-ER": "byn",
    "byr-Latn-ZZ": "byr",
    "bys-Latn-ZZ": "bys",
    "byv-Latn-CM": "byv",
    "byx-Latn-ZZ": "byx",
    "bza-Latn-ZZ": "bza",
    "bze-Latn-ML": "bze",
    "bzf-Latn-ZZ": "bzf",
    "bzh-Latn-ZZ": "bzh",
    "bzw-Latn-ZZ": "bzw",
    "ca-Latn-AD": "ca-AD",
    "ca-Latn-ES": "ca",
    "cad-Latn-US": "cad",
    "can-Latn-ZZ": "can",
    "cbj-Latn-ZZ": "cbj",
    "cch-Latn-NG": "cch",
    "ccp-Cakm-BD": "ccp",
    "ce-Cyrl-RU": "ce",
    "ceb-Latn-PH": "ceb",
    "cfa-Latn-ZZ": "cfa",
    "cgg-Latn-UG": "cgg",
    "ch-Latn-GU": "ch",
    "chk-Latn-FM": "chk",
    "chm-Cyrl-RU": "chm",
    "cho-Latn-US": "cho",
    "chp-Latn-CA": "chp",
    "chr-Cher-US": "chr",
    "cic-Latn-US": "cic",
    "cja-Arab-KH": "cja",
    "cjm-Cham-VN": "cjm",
    "cjv-Latn-ZZ": "cjv",
    "ckb-Arab-IQ": "ckb",
    "ckl-Latn-ZZ": "ckl",
    "cko-Latn-ZZ": "cko",
    "cky-Latn-ZZ": "cky",
    "cla-Latn-ZZ": "cla",
    "clc-Latn-CA": "clc",
    "cme-Latn-ZZ": "cme",
    "cmg-Soyo-MN": "cmg",
    "cmg-Zanb-MN": "cmg-Zanb",
    "co-Latn-FR": "co",
    "cop-Copt-EG": "cop",
    "cps-Latn-PH": "cps",
    "cr-Cans-CA": "cr",
    "crg-Latn-CA": "crg",
    "crh-Cyrl-UA": "crh",
    "crk-Cans-CA": "crk",
    "crl-Cans-CA": "crl",
    "crs-Latn-SC": "crs",
    "cs-Latn-CZ": "cs",
    "csb-Latn-PL": "csb",
    "csw-Cans-CA": "csw",
    "ctd-Pauc-MM": "ctd",
    "cu-Cyrl-RU": "cu",
    "cu-Glag-BG": "cu-Glag",
    "cv-Cyrl-RU": "cv",
    "cy-Latn-GB": "cy",
    "da-Latn-DK": "da",
    "dad-Latn-ZZ": "dad",
    "dag-Latn-ZZ": "dag",
    "dah-Latn-ZZ": "dah",
    "dak-Latn-US": "dak",
    "dar-Cyrl-RU": "dar",
    "dav-Latn-KE": "dav",
    "dbd-Latn-ZZ": "dbd",
    "dbq-Latn-ZZ": "dbq",
    "dcc-Arab-IN": "dcc",
    "ddn-Latn-ZZ": "ddn",
    "de-Latn-AT": "de-AT",
    "de-Latn-CH": "de-CH",
    "de-Latn-DE": "de",
    "de-Latn-EZ": "de-EZ",
    "de-Latn-LI": "de-LI",
    "ded-Latn-ZZ": "ded",
    "den-Latn-CA": "den",
    "dga-Latn-ZZ": "dga",
    "dgh-Latn-ZZ": "dgh",
    "dgi-Latn-ZZ": "dgi",
    "dgl-Arab-ZZ": "dgl",
    "dgr-Latn-CA": "dgr",
    "dgz-Latn-ZZ": "dgz",
    "dia-Latn-ZZ": "dia",
    "dje-Latn-NE": "dje",
    "dmf-Medf-NG": "dmf",
    "dnj-Latn-CI": "dnj",
    "dob-Latn-ZZ": "dob",
    "doi-Deva-IN": "doi",
    "doi-Dogr-IN": "doi-Dogr",
    "doi-Takr-IN": "doi-Takr",
    "dop-Latn-ZZ": "dop",
    "dow-Latn-ZZ": "dow",
    "dri-Latn-ZZ": "dri",
    "drs-Ethi-ZZ": "drs",
    "dsb-Latn-DE": "dsb",
    "dtm-Latn-ML": "dtm",
    "dtp-Latn-MY": "dtp",
    "dts-Latn-ZZ": "dts",
    "dty-Deva-NP": "dty",
    "dua-Latn-CM": "dua",
    "duc-Latn-ZZ": "duc",
    "dug-Latn-ZZ": "dug",
    "dv-Diak-MV": "dv-Diak",
    "dv-Thaa-MV": "dv",
    "dva-Latn-ZZ": "dva",
    "dww-Latn-ZZ": "dww",
    "dyo-Latn-SN": "dyo",
    "dyu-Latn-BF": "dyu",
    "dz-Tibt-BT": "dz",
    "dzg-Latn-ZZ": "dzg",
    "ebu-Latn-KE": "ebu",
    "ee-Latn-GH": "ee",
    "efi-Latn-NG": "efi",
    "egl-Latn-IT": "egl",
    "egy-Egyp-EG": "egy",
    "eka-Latn-ZZ": "eka",
    "eky-Kali-MM": "eky",
    "el-Grek-CY": "el-CY",
    "el-Grek-GR": "el",
    "ema-Latn-ZZ": "ema",
    "emi-Latn-ZZ": "emi",
    "en-Latn-AU": "en-AU",
    "en-Latn-DG": "en-DG",
    "en-Latn-ET": "en-ET",
    "en-Latn-GB": "en-GB",
    "en-Latn-GU": "en-GU",
    "en-Latn-IE": "en-IE",
    "en-Latn-NG": "en-NG",
    "en-Latn-PG": "en-PG",
    "en-Latn-US": "en",
    "en-Latn-ZA": "en-ZA",
    "en-Shaw-GB": "en-Shaw",
    "enn-Latn-ZZ": "enn",
    "enq-Latn-ZZ": "enq",
    "eo-Latn-001": "eo",
    "eri-Latn-ZZ": "eri",
    "es-Latn-419": "es-419",
    "es-Latn-AR": "es-AR",
    "es-Latn-BO": "es-BO",
    "es-Latn-CL": "es-CL",
    "es-Latn-CO": "es-CO",
    "es-Latn-CR": "es-CR",
    "es-Latn-CU": "es-CU",
    "es-Latn-DO": "es-DO",
    "es-Latn-EA": "es-EA",
    "es-Latn-EC": "es-EC",
    "es-Latn-ES": "es",
    "es-Latn-GQ": "es-GQ",
    "es-Latn-GT": "es-GT",
    "es-Latn-HN": "es-HN",
    "es-Latn-IC": "es-IC",
    "es-Latn-MX": "es-MX",
    "es-Latn-NI": "es-NI",
    "es-Latn-PA": "es-PA",
    "es-Latn-PE": "es-PE",
    "es-Latn-PR": "es-PR",
    "es-Latn-SV": "es-SV",
    "es-Latn-UY": "es-UY",
    "es-Latn-VE": "es-VE",
    "esg-Gonm-IN": "esg",
    "esu-Latn-US": "esu",
    "et-Latn-EE": "et",
    "etr-Latn-ZZ": "etr",
    "ett-Ital-IT": "ett",
    "etu-Latn-ZZ": "etu",
    "etx-Latn-ZZ": "etx",
    "eu-Latn-ES": "eu",
    "ewo-Latn-CM": "ewo",
    "ext-Latn-ES": "ext",
    "eza-Latn-ZZ": "eza",
    "fa-Arab-AF": "fa-AF",
    "fa-Arab-IR": "fa",
    "fa-Arab-TJ": "fa-TJ",
    "faa-Latn-ZZ": "faa",
    "fab-Latn-ZZ": "fab",
    "fag-Latn-ZZ": "fag",
    "fai-Latn-ZZ": "fai",
    "fan-Latn-GQ": "fan",
    "ff-Adlm-GN": "ff-Adlm",
    "ff-Latn-SN": "ff",
    "ffi-Latn-ZZ": "ffi",
    "ffm-Latn-ML": "ffm",
    "fi-Latn-FI": "fi",
    "fia-Arab-SD": "fia",
    "fil-Latn-PH": "fil",
    "fil-Tglg-PH": "fil-Tglg",
    "fit-Latn-SE": "fit",
    "fj-Latn-FJ": "fj",
    "flr-Latn-ZZ": "flr",
    "fmp-Latn-ZZ": "fmp",
    "fo-Latn-FO": "fo",
    "fod-Latn-ZZ": "fod",
    "fon-Latn-BJ": "fon",
    "for-Latn-ZZ": "for",
    "fpe-Latn-ZZ": "fpe",
    "fqs-Latn-ZZ": "fqs",
    "fr-Brai-FR": "fr-Brai",
    "fr-Dupl-FR": "fr-Dupl",
    "fr-Latn-BF": "fr-BF",
    "fr-Latn-BJ": "fr-BJ",
    "fr-Latn-BL": "fr-BL",
    "fr-Latn-CF": "fr-CF",
    "fr-Latn-CG": "fr-CG",
    "fr-Latn-CI": "fr-CI",
    "fr-Latn-CM": "fr-CM",
    "fr-Latn-DZ": "fr-DZ",
    "fr-Latn-FR": "fr",
    "fr-Latn-GA": "fr-GA",
    "fr-Latn-GF": "fr-GF",
    "fr-Latn-GN": "fr-GN",
    "fr-Latn-GP": "fr-GP",
    "fr-Latn-KM": "fr-KM",
    "fr-Latn-LU": "fr-LU",
    "fr-Latn-MA": "fr-MA",
    "fr-Latn-MC": "fr-MC",
    "fr-Latn-MF": "fr-MF",
    "fr-Latn-MQ": "fr-MQ",
    "fr-Latn-MR": "fr-MR",
    "fr-Latn-NC": "fr-NC",
    "fr-Latn-PF": "fr-PF",
    "fr-Latn-PM": "fr-PM",
    "fr-Latn-RE": "fr-RE",
    "fr-Latn-SC": "fr-SC",
    "fr-Latn-SN": "fr-SN",
    "fr-Latn-SY": "fr-SY",
    "fr-Latn-TD": "fr-TD",
    "fr-Latn-TF": "fr-TF",
    "fr-Latn-TG": "fr-TG",
    "fr-Latn-TN": "fr-TN",
    "fr-Latn-WF": "fr-WF",
    "fr-Latn-YT": "fr-YT",
    "frc-Latn-US": "frc",
    "frp-Latn-FR": "frp",
    "frr-Latn-DE": "frr",
    "frs-Latn-DE": "frs",
    "fub-Arab-CM": "fub",
    "fud-Latn-WF": "fud",
    "fue-Latn-ZZ": "fue",
    "fuf-Latn-GN": "fuf",
    "fuh-Latn-ZZ": "fuh",
    "fuq-Latn-NE": "fuq",
    "fur-Latn-IT": "fur",
    "fuv-Latn-NG": "fuv",
    "fuy-Latn-ZZ": "fuy",
    "fvr-Latn-SD": "fvr",
    "fy-Latn-NL": "fy",
    "ga-Latn-IE": "ga",
    "gaa-Latn-GH": "gaa",
    "gaf-Latn-ZZ": "gaf",
    "gag-Latn-MD": "gag",
    "gah-Latn-ZZ": "gah",
    "gaj-Latn-ZZ": "gaj",
    "gam-Latn-ZZ": "gam",
    "gan-Hans-CN": "gan",
    "gaw-Latn-ZZ": "gaw",
    "gay-Latn-ID": "gay",
    "gba-Latn-ZZ": "gba",
    "gbf-Latn-ZZ": "gbf",
    "gbm-Deva-IN": "gbm",
    "gby-Latn-ZZ": "gby",
    "gbz-Arab-IR": "gbz",
    "gcr-Latn-GF": "gcr",
    "gd-Latn-GB": "gd",
    "gde-Latn-ZZ": "gde",
    "gdn-Latn-ZZ": "gdn",
    "gdr-Latn-ZZ": "gdr",
    "geb-Latn-ZZ": "geb",
    "gej-Latn-ZZ": "gej",
    "gel-Latn-ZZ": "gel",
    "gez-Ethi-ET": "gez",
    "gfk-Latn-ZZ": "gfk",
    "ghs-Latn-ZZ": "ghs",
    "gil-Latn-KI": "gil",
    "gim-Latn-ZZ": "gim",
    "gjk-Arab-PK": "gjk",
    "gjn-Latn-ZZ": "gjn",
    "gju-Arab-PK": "gju",
    "gkn-Latn-ZZ": "gkn",
    "gkp-Latn-ZZ": "gkp",
    "gl-Latn-ES": "gl",
    "glk-Arab-IR": "glk",
    "gmm-Latn-ZZ": "gmm",
    "gmv-Ethi-ZZ": "gmv",
    "gn-Latn-PY": "gn",
    "gnd-Latn-ZZ": "gnd",
    "gng-Latn-ZZ": "gng",
    "god-Latn-ZZ": "god",
    "gof-Ethi-ZZ": "gof",
    "goi-Latn-ZZ": "goi",
    "gom-Deva-IN": "gom",
    "gon-Telu-IN": "gon",
    "gor-Latn-ID": "gor",
    "gos-Latn-NL": "gos",
    "got-Goth-UA": "got",
    "grb-Latn-ZZ": "grb",
    "grc-Cprt-CY": "grc",
    "grc-Linb-GR": "grc-Linb",
    "grt-Beng-IN": "grt",
    "grw-Latn-ZZ": "grw",
    "gsw-Latn-CH": "gsw",
    "gu-Gujr-IN": "gu",
    "gub-Latn-BR": "gub",
    "guc-Latn-CO": "guc",
    "gud-Latn-ZZ": "gud",
    "gur-Latn-GH": "gur",
    "guw-Latn-ZZ": "guw",
    "gux-Latn-ZZ": "gux",
    "guz-Latn-KE": "guz",
    "gv-Latn-IM": "gv",
    "gvf-Latn-ZZ": "gvf",
    "gvr-Deva-NP": "gvr",
    "gvs-Latn-ZZ": "gvs",
    "gwc-Arab-ZZ": "gwc",
    "gwi-Latn-CA": "gwi",
    "gwt-Arab-ZZ": "gwt",
    "gyi-Latn-ZZ": "gyi",
    "ha-Arab-CM": "ha-CM",
    "ha-Arab-NG": "ha-Arab",
    "ha-Arab-SD": "ha-SD",
    "ha-Latn-NE": "ha-NE",
    "ha-Latn-NG": "ha",
    "hag-Latn-ZZ": "hag",
    "hak-Hans-CN": "hak",
    "ham-Latn-ZZ": "ham",
    "haw-Latn-US": "haw",
    "haz-Arab-AF": "haz",
    "hbb-Latn-ZZ": "hbb",
    "hdy-Ethi-ZZ": "hdy",
    "he-Hebr-IL": "he",
    "hhy-Latn-ZZ": "hhy",
    "hi-Deva-IN": "hi",
    "hi-Latn-IN": "hi-Latn",
    "hi-Mahj-IN": "hi-Mahj",
    "hia-Latn-ZZ": "hia",
    "hif-Deva-FJ": "hif-Deva",
    "hif-Latn-FJ": "hif",
    "hig-Latn-ZZ": "hig",
    "hih-Latn-ZZ": "hih",
    "hil-Latn-PH": "hil",
    "hla-Latn-ZZ": "hla",
    "hlu-Hluw-TR": "hlu",
    "hmd-Plrd-CN": "hmd",
    "hmt-Latn-ZZ": "hmt",
    "hnd-Arab-PK": "hnd",
    "hne-Deva-IN": "hne",
    "hnj-Hmng-LA": "hnj-Hmng-LA",
    "hnj-Hmnp-US": "hnj",
    "hnn-Hano-PH": "hnn-Hano",
    "hnn-Latn-PH": "hnn",
    "hno-Arab-PK": "hno",
    "ho-Latn-PG": "ho",
    "hoc-Deva-IN": "hoc",
    "hoc-Wara-IN": "hoc-Wara",
    "hoj-Deva-IN": "hoj",
    "hot-Latn-ZZ": "hot",
    "hr-Latn-HR": "hr",
    "hsb-Latn-DE": "hsb",
    "hsn-Hans-CN": "hsn",
    "ht-Latn-HT": "ht",
    "hu-Hung-HU": "hu-Hung",
    "hu-Latn-HU": "hu",
    "hui-Latn-ZZ": "hui",
    "hur-Latn-CA": "hur",
    "hy-Armn-AM": "hy",
    "hz-Latn-NA": "hz",
    "ia-Latn-001": "ia",
    "ian-Latn-ZZ": "ian",
    "iar-Latn-ZZ": "iar",
    "iba-Latn-MY": "iba",
    "ibb-Latn-NG": "ibb",
    "iby-Latn-ZZ": "iby",
    "ica-Latn-ZZ": "ica",
    "ich-Latn-ZZ": "ich",
    "id-Latn-ID": "id",
    "idd-Latn-ZZ": "idd",
    "idi-Latn-ZZ": "idi",
    "idu-Latn-ZZ": "idu",
    "ife-Latn-TG": "ife",
    "ig-Latn-NG": "ig",
    "igb-Latn-ZZ": "igb",
    "ige-Latn-ZZ": "ige",
    "ii-Yiii-CN": "ii",
    "ijj-Latn-ZZ": "ijj",
    "ik-Latn-US": "ik",
    "ikk-Latn-ZZ": "ikk",
    "ikw-Latn-ZZ": "ikw",
    "ikx-Latn-ZZ": "ikx",
    "ilo-Latn-PH": "ilo",
    "imo-Latn-ZZ": "imo",
    "inh-Cyrl-RU": "inh",
    "io-Latn-001": "io",
    "iou-Latn-ZZ": "iou",
    "iri-Latn-ZZ": "iri",
    "is-Latn-IS": "is",
    "it-Latn-IT": "it",
    "it-Latn-SM": "it-SM",
    "it-Latn-VA": "it-VA",
    "iu-Cans-CA": "iu",
    "iwm-Latn-ZZ": "iwm",
    "iws-Latn-ZZ": "iws",
    "izh-Latn-RU": "izh",
    "ja-Hira-JP": "ja-Hira",
    "ja-Jpan-JP": "ja",
    "ja-Kana-JP": "ja-Kana",
    "jab-Latn-ZZ": "jab",
    "jam-Latn-JM": "jam",
    "jbo-Latn-001": "jbo",
    "jbu-Latn-ZZ": "jbu",
    "jen-Latn-ZZ": "jen",
    "jgk-Latn-ZZ": "jgk",
    "jgo-Latn-CM": "jgo",
    "jib-Latn-ZZ": "jib",
    "jmc-Latn-TZ": "jmc",
    "jml-Deva-NP": "jml",
    "jra-Latn-ZZ": "jra",
    "jut-Latn-DK": "jut",
    "jv-Java-ID": "jv-Java",
    "jv-Latn-ID": "jv",
    "ka-Geor-GE": "ka",
    "kaa-Cyrl-UZ": "kaa",
    "kab-Latn-DZ": "kab",
    "kac-Latn-MM": "kac",
    "kad-Latn-ZZ": "kad",
    "kai-Latn-ZZ": "kai",
    "kaj-Latn-NG": "kaj",
    "kam-Latn-KE": "kam",
    "kao-Latn-ML": "kao",
    "kaw-Kawi-ID": "kaw",
    "kbd-Cyrl-RU": "kbd",
    "kbd-Cyrl-TR": "kbd-TR",
    "kbm-Latn-ZZ": "kbm",
    "kbp-Latn-ZZ": "kbp",
    "kbq-Latn-ZZ": "kbq",
    "kbx-Latn-ZZ": "kbx",
    "kby-Arab-NE": "kby",
    "kcg-Latn-NG": "kcg",
    "kck-Latn-ZW": "kck",
    "kcl-Latn-ZZ": "kcl",
    "kct-Latn-ZZ": "kct",
    "kde-Latn-TZ": "kde",
    "kdh-Latn-TG": "kdh",
    "kdl-Latn-ZZ": "kdl",
    "kdt-Thai-KH": "kdt-KH",
    "kdt-Thai-LA": "kdt-LA",
    "kdt-Thai-TH": "kdt",
    "kea-Latn-CV": "kea",
    "ken-Latn-CM": "ken",
    "kez-Latn-ZZ": "kez",
    "kfo-Latn-CI": "kfo",
    "kfr-Deva-IN": "kfr",
    "kfy-Deva-IN": "kfy",
    "kg-Latn-CD": "kg",
    "kge-Latn-ID": "kge",
    "kgf-Latn-ZZ": "kgf",
    "kgp-Latn-BR": "kgp",
    "kha-Latn-IN": "kha",
    "khb-Talu-CN": "khb",
    "khn-Deva-IN": "khn",
    "khq-Latn-ML": "khq",
    "khs-Latn-ZZ": "khs",
    "kht-Mymr-IN": "kht",
    "khw-Arab-PK": "khw",
    "khz-Latn-ZZ": "khz",
    "ki-Latn-KE": "ki",
    "kij-Latn-ZZ": "kij",
    "kiu-Latn-TR": "kiu",
    "kiw-Latn-ZZ": "kiw",
    "kj-Latn-NA": "kj",
    "kjd-Latn-ZZ": "kjd",
    "kjg-Laoo-LA": "kjg",
    "kjs-Latn-ZZ": "kjs",
    "kjy-Latn-ZZ": "kjy",
    "kk-Arab-AF": "kk-AF",
    "kk-Arab-CN": "kk-CN",
    "kk-Arab-IR": "kk-IR",
    "kk-Arab-MN": "kk-MN",
    "kk-Cyrl-KZ": "kk",
    "kkc-Latn-ZZ": "kkc",
    "kkj-Latn-CM": "kkj",
    "kl-Latn-GL": "kl",
    "kln-Latn-KE": "kln",
    "klq-Latn-ZZ": "klq",
    "klt-Latn-ZZ": "klt",
    "klx-Latn-ZZ": "klx",
    "km-Khmr-KH": "km",
    "kmb-Latn-AO": "kmb",
    "kmh-Latn-ZZ": "kmh",
    "kmo-Latn-ZZ": "kmo",
    "kms-Latn-ZZ": "kms",
    "kmu-Latn-ZZ": "kmu",
    "kmw-Latn-ZZ": "kmw",
    "kn-Knda-IN": "kn",
    "knf-Latn-GW": "knf",
    "knp-Latn-ZZ": "knp",
    "ko-Hang-KR": "ko-Hang",
    "ko-Jamo-KR": "ko-Jamo",
    "ko-Kore-KP": "ko-KP",
    "ko-Kore-KR": "ko",
    "koi-Cyrl-RU": "koi",
    "kok-Deva-IN": "kok",
    "kol-Latn-ZZ": "kol",
    "kos-Latn-FM": "kos",
    "koz-Latn-ZZ": "koz",
    "kpe-Latn-LR": "kpe",
    "kpf-Latn-ZZ": "kpf",
    "kpo-Latn-ZZ": "kpo",
    "kpr-Latn-ZZ": "kpr",
    "kpx-Latn-ZZ": "kpx",
    "kqb-Latn-ZZ": "kqb",
    "kqf-Latn-ZZ": "kqf",
    "kqs-Latn-ZZ": "kqs",
    "kqy-Ethi-ZZ": "kqy",
    "kr-Latn-ZZ": "kr",
    "krc-Cyrl-RU": "krc",
    "kri-Latn-SL": "kri",
    "krj-Latn-PH": "krj",
    "krl-Latn-RU": "krl",
    "krs-Latn-ZZ": "krs",
    "kru-Deva-IN": "kru",
    "ks-Arab-IN": "ks",
    "ksb-Latn-TZ": "ksb",
    "ksd-Latn-ZZ": "ksd",
    "ksf-Latn-CM": "ksf",
    "ksh-Latn-DE": "ksh",
    "ksj-Latn-ZZ": "ksj",
    "ksr-Latn-ZZ": "ksr",
    "ktb-Ethi-ZZ": "ktb",
    "ktm-Latn-ZZ": "ktm",
    "kto-Latn-ZZ": "kto",
    "ku-Arab-IQ": "ku-Arab",
    "ku-Arab-LB": "ku-LB",
    "ku-Latn-AM": "ku-AM",
    "ku-Latn-GE": "ku-GE",
    "ku-Latn-TR": "ku",
    "ku-Yezi-GE": "ku-Yezi",
    "kub-Latn-ZZ": "kub",
    "kud-Latn-ZZ": "kud",
    "kue-Latn-ZZ": "kue",
    "kuj-Latn-ZZ": "kuj",
    "kum-Cyrl-RU": "kum",
    "kun-Latn-ZZ": "kun",
    "kup-Latn-ZZ": "kup",
    "kus-Latn-ZZ": "kus",
    "kv-Cyrl-RU": "kv",
    "kv-Perm-RU": "kv-Perm",
    "kvg-Latn-ZZ": "kvg",
    "kvr-Latn-ID": "kvr",
    "kvx-Arab-PK": "kvx",
    "kw-Latn-GB": "kw",
    "kwj-Latn-ZZ": "kwj",
    "kwk-Latn-CA": "kwk",
    "kwo-Latn-ZZ": "kwo",
    "kxa-Latn-ZZ": "kxa",
    "kxc-Ethi-ZZ": "kxc",
    "kxm-Thai-TH": "kxm",
    "kxp-Arab-PK": "kxp",
    "kxw-Latn-ZZ": "kxw",
    "kxz-Latn-ZZ": "kxz",
    "ky-Arab-CN": "ky-CN",
    "ky-Cyrl-KG": "ky",
    "ky-Latn-TR": "ky-TR",
    "kye-Latn-ZZ": "kye",
    "kyx-Latn-ZZ": "kyx",
    "kzr-Latn-ZZ": "kzr",
    "la-Latn-VA": "la",
    "lab-Lina-GR": "lab",
    "lad-Hebr-IL": "lad",
    "lag-Latn-TZ": "lag",
    "lah-Arab-PK": "lah",
    "laj-Latn-UG": "laj",
    "las-Latn-ZZ": "las",
    "lb-Latn-LU": "lb",
    "lbe-Cyrl-RU": "lbe",
    "lbu-Latn-ZZ": "lbu",
    "lbw-Latn-ID": "lbw",
    "lcm-Latn-ZZ": "lcm",
    "lcp-Thai-CN": "lcp",
    "ldb-Latn-ZZ": "ldb",
    "led-Latn-ZZ": "led",
    "lee-Latn-ZZ": "lee",
    "lem-Latn-ZZ": "lem",
    "lep-Lepc-IN": "lep",
    "leq-Latn-ZZ": "leq",
    "leu-Latn-ZZ": "leu",
    "lez-Cyrl-RU": "lez",
    "lg-Latn-UG": "lg",
    "lgg-Latn-ZZ": "lgg",
    "li-Latn-NL": "li",
    "lia-Latn-ZZ": "lia",
    "lid-Latn-ZZ": "lid",
    "lif-Deva-NP": "lif",
    "lif-Limb-IN": "lif-Limb",
    "lig-Latn-ZZ": "lig",
    "lih-Latn-ZZ": "lih",
    "lij-Latn-IT": "lij",
    "lil-Latn-CA": "lil",
    "lis-Lisu-CN": "lis",
    "ljp-Latn-ID": "ljp",
    "lki-Arab-IR": "lki",
    "lkt-Latn-US": "lkt",
    "lle-Latn-ZZ": "lle",
    "lln-Latn-ZZ": "lln",
    "lmn-Telu-IN": "lmn",
    "lmo-Latn-IT": "lmo",
    "lmp-Latn-ZZ": "lmp",
    "ln-Latn-CD": "ln",
    "lns-Latn-ZZ": "lns",
    "lnu-Latn-ZZ": "lnu",
    "lo-Laoo-LA": "lo",
    "loj-Latn-ZZ": "loj",
    "lok-Latn-ZZ": "lok",
    "lol-Latn-CD": "lol",
    "lor-Latn-ZZ": "lor",
    "los-Latn-ZZ": "los",
    "loz-Latn-ZM": "loz",
    "lrc-Arab-IR": "lrc",
    "lt-Latn-LT": "lt",
    "ltg-Latn-LV": "ltg",
    "lu-Latn-CD": "lu",
    "lua-Latn-CD": "lua",
    "luo-Latn-KE": "luo",
    "luy-Latn-KE": "luy",
    "luz-Arab-IR": "luz",
    "lv-Latn-LV": "lv",
    "lwl-Thai-TH": "lwl",
    "lzh-Hans-CN": "lzh",
    "lzh-Phag-CN": "lzh-Phag",
    "lzz-Latn-TR": "lzz",
    "mad-Latn-ID": "mad",
    "maf-Latn-CM": "maf",
    "mag-Deva-IN": "mag",
    "mai-Deva-IN": "mai",
    "mai-Tirh-IN": "mai-Tirh",
    "mak-Latn-ID": "mak",
    "mak-Maka-ID": "mak-Maka",
    "man-Latn-GM": "man",
    "man-Nkoo-GN": "man-GN",
    "mas-Latn-KE": "mas",
    "maw-Latn-ZZ": "maw",
    "maz-Latn-MX": "maz",
    "mbh-Latn-ZZ": "mbh",
    "mbo-Latn-ZZ": "mbo",
    "mbq-Latn-ZZ": "mbq",
    "mbu-Latn-ZZ": "mbu",
    "mbw-Latn-ZZ": "mbw",
    "mci-Latn-ZZ": "mci",
    "mcp-Latn-ZZ": "mcp",
    "mcq-Latn-ZZ": "mcq",
    "mcr-Latn-ZZ": "mcr",
    "mcu-Latn-ZZ": "mcu",
    "mda-Latn-ZZ": "mda",
    "mde-Arab-ZZ": "mde",
    "mdf-Cyrl-RU": "mdf",
    "mdh-Latn-PH": "mdh",
    "mdj-Latn-ZZ": "mdj",
    "mdr-Latn-ID": "mdr",
    "mdx-Ethi-ZZ": "mdx",
    "med-Latn-ZZ": "med",
    "mee-Latn-ZZ": "mee",
    "mek-Latn-ZZ": "mek",
    "men-Latn-SL": "men",
    "men-Mend-SL": "men-Mend",
    "mer-Latn-KE": "mer",
    "met-Latn-ZZ": "met",
    "meu-Latn-ZZ": "meu",
    "mfa-Arab-TH": "mfa",
    "mfe-Latn-MU": "mfe",
    "mfn-Latn-ZZ": "mfn",
    "mfo-Latn-ZZ": "mfo",
    "mfq-Latn-ZZ": "mfq",
    "mg-Latn-MG": "mg",
    "mgh-Latn-MZ": "mgh",
    "mgl-Latn-ZZ": "mgl",
    "mgo-Latn-CM": "mgo",
    "mgp-Deva-NP": "mgp",
    "mgy-Latn-TZ": "mgy",
    "mh-Latn-MH": "mh",
    "mhi-Latn-ZZ": "mhi",
    "mhl-Latn-ZZ": "mhl",
    "mi-Latn-NZ": "mi",
    "mic-Latn-CA": "mic",
    "mif-Latn-ZZ": "mif",
    "min-Latn-ID": "min",
    "miw-Latn-ZZ": "miw",
    "mk-Cyrl-AL": "mk-AL",
    "mk-Cyrl-GR": "mk-GR",
    "mk-Cyrl-MK": "mk",
    "mki-Arab-ZZ": "mki",
    "mkl-Latn-ZZ": "mkl",
    "mkp-Latn-ZZ": "mkp",
    "mkw-Latn-ZZ": "mkw",
    "ml-Mlym-IN": "ml",
    "mle-Latn-ZZ": "mle",
    "mlp-Latn-ZZ": "mlp",
    "mls-Latn-SD": "mls",
    "mmo-Latn-ZZ": "mmo",
    "mmu-Latn-ZZ": "mmu",
    "mmx-Latn-ZZ": "mmx",
    "mn-Cyrl-MN": "mn",
    "mn-Mong-CN": "mn-CN",
    "mna-Latn-ZZ": "mna",
    "mnf-Latn-ZZ": "mnf",
    "mni-Beng-IN": "mni",
    "mni-Mtei-IN": "mni-Mtei",
    "mnw-Mymr-MM": "mnw",
    "mnw-Mymr-TH": "mnw-TH",
    "moa-Latn-ZZ": "moa",
    "moe-Latn-CA": "moe",
    "moh-Latn-CA": "moh",
    "mos-Latn-BF": "mos",
    "mox-Latn-ZZ": "mox",
    "mpp-Latn-ZZ": "mpp",
    "mps-Latn-ZZ": "mps",
    "mpt-Latn-ZZ": "mpt",
    "mpx-Latn-ZZ": "mpx",
    "mql-Latn-ZZ": "mql",
    "mr-Deva-IN": "mr",
    "mr-Modi-IN": "mr-Modi",
    "mrd-Deva-NP": "mrd",
    "mrj-Cyrl-RU": "mrj",
    "mro-Mroo-BD": "mro",
    "ms-Arab-CC": "ms-CC",
    "ms-Arab-ID": "ms-Arab-ID",
    "ms-Latn-BN": "ms-BN",
    "ms-Latn-MY": "ms",
    "mt-Latn-MT": "mt",
    "mtc-Latn-ZZ": "mtc",
    "mtf-Latn-ZZ": "mtf",
    "mti-Latn-ZZ": "mti",
    "mtr-Deva-IN": "mtr",
    "mua-Latn-CM": "mua",
    "mur-Latn-ZZ": "mur",
    "mus-Latn-US": "mus",
    "mva-Latn-ZZ": "mva",
    "mvn-Latn-ZZ": "mvn",
    "mvy-Arab-PK": "mvy",
    "mwk-Latn-ML": "mwk",
    "mwr-Deva-IN": "mwr",
    "mwv-Latn-ID": "mwv",
    "mww-Hmnp-US": "mww",
    "mxc-Latn-ZW": "mxc",
    "mxm-Latn-ZZ": "mxm",
    "my-Mymr-MM": "my",
    "myk-Latn-ZZ": "myk",
    "mym-Ethi-ZZ": "mym",
    "myv-Cyrl-RU": "myv",
    "myw-Latn-ZZ": "myw",
    "myx-Latn-UG": "myx",
    "myz-Mand-IR": "myz",
    "mzk-Latn-ZZ": "mzk",
    "mzm-Latn-ZZ": "mzm",
    "mzn-Arab-IR": "mzn",
    "mzp-Latn-ZZ": "mzp",
    "mzw-Latn-ZZ": "mzw",
    "mzz-Latn-ZZ": "mzz",
    "na-Latn-NR": "na",
    "nac-Latn-ZZ": "nac",
    "naf-Latn-ZZ": "naf",
    "nak-Latn-ZZ": "nak",
    "nan-Hans-CN": "nan",
    "nap-Latn-IT": "nap",
    "naq-Latn-NA": "naq",
    "nas-Latn-ZZ": "nas",
    "nb-Latn-NO": "nb",
    "nb-Latn-SJ": "nb-SJ",
    "nca-Latn-ZZ": "nca",
    "nce-Latn-ZZ": "nce",
    "ncf-Latn-ZZ": "ncf",
    "nch-Latn-MX": "nch",
    "nco-Latn-ZZ": "nco",
    "ncu-Latn-ZZ": "ncu",
    "nd-Latn-ZW": "nd",
    "ndc-Latn-MZ": "ndc",
    "nds-Latn-DE": "nds",
    "ne-Deva-BT": "ne-BT",
    "ne-Deva-NP": "ne",
    "neb-Latn-ZZ": "neb",
    "new-Deva-NP": "new",
    "new-Newa-NP": "new-Newa",
    "nex-Latn-ZZ": "nex",
    "nfr-Latn-ZZ": "nfr",
    "ng-Latn-NA": "ng",
    "nga-Latn-ZZ": "nga",
    "ngb-Latn-ZZ": "ngb",
    "ngl-Latn-MZ": "ngl",
    "nhb-Latn-ZZ": "nhb",
    "nhe-Latn-MX": "nhe",
    "nhw-Latn-MX": "nhw",
    "nif-Latn-ZZ": "nif",
    "nii-Latn-ZZ": "nii",
    "nij-Latn-ID": "nij",
    "nin-Latn-ZZ": "nin",
    "niu-Latn-NU": "niu",
    "niy-Latn-ZZ": "niy",
    "niz-Latn-ZZ": "niz",
    "njo-Latn-IN": "njo",
    "nkg-Latn-ZZ": "nkg",
    "nko-Latn-ZZ": "nko",
    "nl-Latn-AW": "nl-AW",
    "nl-Latn-BE": "nl-BE",
    "nl-Latn-NL": "nl",
    "nl-Latn-SR": "nl-SR",
    "nmg-Latn-CM": "nmg",
    "nmz-Latn-ZZ": "nmz",
    "nn-Latn-NO": "nn",
    "nnf-Latn-ZZ": "nnf",
    "nnh-Latn-CM": "nnh",
    "nnk-Latn-ZZ": "nnk",
    "nnm-Latn-ZZ": "nnm",
    "nnp-Wcho-IN": "nnp",
    "no-Latn-NO": "no",
    "nod-Lana-TH": "nod",
    "noe-Deva-IN": "noe",
    "non-Runr-SE": "non",
    "nop-Latn-ZZ": "nop",
    "nou-Latn-ZZ": "nou",
    "nqo-Nkoo-GN": "nqo",
    "nr-Latn-ZA": "nr",
    "nrb-Latn-ZZ": "nrb",
    "nsk-Cans-CA": "nsk",
    "nsn-Latn-ZZ": "nsn",
    "nso-Latn-ZA": "nso",
    "nss-Latn-ZZ": "nss",
    "nst-Tnsa-IN": "nst",
    "ntm-Latn-ZZ": "ntm",
    "ntr-Latn-ZZ": "ntr",
    "nui-Latn-ZZ": "nui",
    "nup-Latn-ZZ": "nup",
    "nus-Latn-SS": "nus",
    "nuv-Latn-ZZ": "nuv",
    "nux-Latn-ZZ": "nux",
    "nv-Latn-US": "nv",
    "nwb-Latn-ZZ": "nwb",
    "nxq-Latn-CN": "nxq",
    "nxr-Latn-ZZ": "nxr",
    "ny-Latn-MW": "ny",
    "nym-Latn-TZ": "nym",
    "nyn-Latn-UG": "nyn",
    "nzi-Latn-GH": "nzi",
    "oc-Latn-ES": "oc-ES",
    "oc-Latn-FR": "oc",
    "ogc-Latn-ZZ": "ogc",
    "oj-Cans-CA": "oj",
    "ojs-Cans-CA": "ojs",
    "oka-Latn-CA": "oka",
    "okr-Latn-ZZ": "okr",
    "okv-Latn-ZZ": "okv",
    "om-Latn-ET": "om",
    "ong-Latn-ZZ": "ong",
    "onn-Latn-ZZ": "onn",
    "ons-Latn-ZZ": "ons",
    "opm-Latn-ZZ": "opm",
    "or-Orya-IN": "or",
    "oro-Latn-ZZ": "oro",
    "oru-Arab-ZZ": "oru",
    "os-Cyrl-GE": "os",
    "osa-Osge-US": "osa",
    "ota-Arab-ZZ": "ota",
    "otk-Orkh-MN": "otk",
    "oui-Ougr-143": "oui",
    "ozm-Latn-ZZ": "ozm",
    "pa-Arab-PK": "pa-PK",
    "pa-Guru-IN": "pa",
    "pag-Latn-PH": "pag",
    "pal-Phli-IR": "pal",
    "pal-Phlp-CN": "pal-Phlp",
    "pam-Latn-PH": "pam",
    "pap-Latn-AW": "pap",
    "pap-Latn-BQ": "pap-BQ",
    "pap-Latn-CW": "pap-CW",
    "pau-Latn-PW": "pau",
    "pbi-Latn-ZZ": "pbi",
    "pcd-Latn-FR": "pcd",
    "pcm-Latn-NG": "pcm",
    "pdc-Latn-US": "pdc",
    "pdt-Latn-CA": "pdt",
    "ped-Latn-ZZ": "ped",
    "peo-Xpeo-IR": "peo",
    "pex-Latn-ZZ": "pex",
    "pfl-Latn-DE": "pfl",
    "phl-Arab-ZZ": "phl",
    "phn-Phnx-LB": "phn",
    "pil-Latn-ZZ": "pil",
    "pip-Latn-ZZ": "pip",
    "pis-Latn-SB": "pis",
    "pka-Brah-IN": "pka",
    "pko-Latn-KE": "pko",
    "pl-Latn-PL": "pl",
    "pl-Latn-UA": "pl-UA",
    "pla-Latn-ZZ": "pla",
    "pms-Latn-IT": "pms",
    "png-Latn-ZZ": "png",
    "pnn-Latn-ZZ": "pnn",
    "pnt-Grek-GR": "pnt",
    "pon-Latn-FM": "pon",
    "ppo-Latn-ZZ": "ppo",
    "pqm-Latn-CA": "pqm",
    "pra-Khar-PK": "pra",
    "prd-Arab-IR": "prd",
    "prg-Latn-001": "prg",
    "ps-Arab-AF": "ps",
    "pss-Latn-ZZ": "pss",
    "pt-Latn-AO": "pt-AO",
    "pt-Latn-BR": "pt",
    "pt-Latn-CV": "pt-CV",
    "pt-Latn-GW": "pt-GW",
    "pt-Latn-MO": "pt-MO",
    "pt-Latn-MZ": "pt-MZ",
    "pt-Latn-PT": "pt-PT",
    "pt-Latn-ST": "pt-ST",
    "pt-Latn-TL": "pt-TL",
    "ptp-Latn-ZZ": "ptp",
    "puu-Latn-GA": "puu",
    "pwa-Latn-ZZ": "pwa",
    "qu-Latn-PE": "qu",
    "quc-Latn-GT": "quc",
    "qug-Latn-EC": "qug",
    "rai-Latn-ZZ": "rai",
    "raj-Deva-IN": "raj",
    "rao-Latn-ZZ": "rao",
    "rcf-Latn-RE": "rcf",
    "rej-Latn-ID": "rej",
    "rej-Rjng-ID": "rej-Rjng",
    "rel-Latn-ZZ": "rel",
    "res-Latn-ZZ": "res",
    "rgn-Latn-IT": "rgn",
    "rhg-Arab-MM": "rhg-Arab",
    "rhg-Rohg-MM": "rhg",
    "ria-Latn-IN": "ria",
    "rif-Latn-NL": "rif-NL",
    "rif-Tfng-MA": "rif",
    "rjs-Deva-NP": "rjs",
    "rkt-Beng-BD": "rkt",
    "rm-Latn-CH": "rm",
    "rmf-Latn-FI": "rmf",
    "rmo-Latn-CH": "rmo",
    "rmt-Arab-IR": "rmt",
    "rmu-Latn-SE": "rmu",
    "rn-Latn-BI": "rn",
    "rna-Latn-ZZ": "rna",
    "rng-Latn-MZ": "rng",
    "ro-Latn-MD": "ro-MD",
    "ro-Latn-RO": "ro",
    "rob-Latn-ID": "rob",
    "rof-Latn-TZ": "rof",
    "roo-Latn-ZZ": "roo",
    "rro-Latn-ZZ": "rro",
    "rtm-Latn-FJ": "rtm",
    "ru-Cyrl-KZ": "ru-KZ",
    "ru-Cyrl-RU": "ru",
    "rue-Cyrl-UA": "rue",
    "rug-Latn-SB": "rug",
    "rw-Latn-RW": "rw",
    "rwk-Latn-TZ": "rwk",
    "rwo-Latn-ZZ": "rwo",
    "ryu-Kana-JP": "ryu",
    "sa-Bhks-IN": "sa-Bhks",
    "sa-Deva-IN": "sa",
    "sa-Gran-IN": "sa-Gran",
    "sa-Nand-IN": "sa-Nand",
    "sa-Shrd-IN": "sa-Shrd",
    "sa-Sidd-IN": "sa-Sidd",
    "saf-Latn-GH": "saf",
    "sah-Cyrl-RU": "sah",
    "saq-Latn-KE": "saq",
    "sas-Latn-ID": "sas",
    "sat-Olck-IN": "sat",
    "sav-Latn-SN": "sav",
    "saz-Saur-IN": "saz",
    "sba-Latn-ZZ": "sba",
    "sbe-Latn-ZZ": "sbe",
    "sbp-Latn-TZ": "sbp",
    "sc-Latn-IT": "sc",
    "sck-Deva-IN": "sck",
    "scl-Arab-ZZ": "scl",
    "scn-Latn-IT": "scn",
    "sco-Latn-GB": "sco",
    "sd-Arab-PK": "sd",
    "sd-Deva-IN": "sd-IN",
    "sd-Khoj-IN": "sd-Khoj",
    "sd-Sind-IN": "sd-Sind",
    "sdc-Latn-IT": "sdc",
    "sdh-Arab-IR": "sdh",
    "se-Latn-NO": "se",
    "sef-Latn-CI": "sef",
    "seh-Latn-MZ": "seh",
    "sei-Latn-MX": "sei",
    "ses-Latn-ML": "ses",
    "sg-Latn-CF": "sg",
    "sga-Ogam-IE": "sga",
    "sgs-Latn-LT": "sgs",
    "sgw-Ethi-ZZ": "sgw",
    "sgz-Latn-ZZ": "sgz",
    "shi-Tfng-MA": "shi",
    "shk-Latn-ZZ": "shk",
    "shn-Mymr-MM": "shn",
    "shu-Arab-ZZ": "shu",
    "si-Sinh-LK": "si",
    "sid-Latn-ET": "sid",
    "sig-Latn-ZZ": "sig",
    "sil-Latn-ZZ": "sil",
    "sim-Latn-ZZ": "sim",
    "sjr-Latn-ZZ": "sjr",
    "sk-Latn-SK": "sk",
    "skc-Latn-ZZ": "skc",
    "skr-Arab-PK": "skr",
    "skr-Mult-PK": "skr-Mult",
    "sks-Latn-ZZ": "sks",
    "sl-Latn-SI": "sl",
    "sld-Latn-ZZ": "sld",
    "sli-Latn-PL": "sli",
    "sll-Latn-ZZ": "sll",
    "sly-Latn-ID": "sly",
    "sm-Latn-AS": "sm-AS",
    "sm-Latn-WS": "sm",
    "sma-Latn-SE": "sma",
    "smj-Latn-SE": "smj",
    "smn-Latn-FI": "smn",
    "smp-Samr-IL": "smp",
    "smq-Latn-ZZ": "smq",
    "sms-Latn-FI": "sms",
    "sn-Latn-ZW": "sn",
    "snc-Latn-ZZ": "snc",
    "snk-Latn-ML": "snk",
    "snp-Latn-ZZ": "snp",
    "snx-Latn-ZZ": "snx",
    "sny-Latn-ZZ": "sny",
    "so-Latn-SO": "so",
    "so-Osma-SO": "so-Osma",
    "sog-Sogd-UZ": "sog",
    "sog-Sogo-UZ": "sog-Sogo",
    "sok-Latn-ZZ": "sok",
    "soq-Latn-ZZ": "soq",
    "sou-Thai-TH": "sou",
    "soy-Latn-ZZ": "soy",
    "spd-Latn-ZZ": "spd",
    "spl-Latn-ZZ": "spl",
    "sps-Latn-ZZ": "sps",
    "sq-Elba-AL": "sq-Elba",
    "sq-Latn-AL": "sq",
    "sq-Latn-MK": "sq-MK",
    "sq-Latn-XK": "sq-XK",
    "sq-Vith-AL": "sq-Vith",
    "sr-Cyrl-BA": "sr-BA",
    "sr-Cyrl-RS": "sr",
    "sr-Cyrl-XK": "sr-XK",
    "sr-Latn-ME": "sr-ME",
    "sr-Latn-RO": "sr-RO",
    "sr-Latn-RU": "sr-RU",
    "sr-Latn-TR": "sr-TR",
    "srb-Sora-IN": "srb",
    "srn-Latn-SR": "srn",
    "srr-Latn-SN": "srr",
    "srx-Deva-IN": "srx",
    "ss-Latn-ZA": "ss",
    "ssd-Latn-ZZ": "ssd",
    "ssg-Latn-ZZ": "ssg",
    "ssy-Latn-ER": "ssy",
    "st-Latn-LS": "st-LS",
    "st-Latn-ZA": "st",
    "stk-Latn-ZZ": "stk",
    "stq-Latn-DE": "stq",
    "su-Latn-ID": "su",
    "su-Sund-ID": "su-Sund",
    "sua-Latn-ZZ": "sua",
    "sue-Latn-ZZ": "sue",
    "suk-Latn-TZ": "suk",
    "sur-Latn-ZZ": "sur",
    "sus-Latn-GN": "sus",
    "sv-Latn-AX": "sv-AX",
    "sv-Latn-SE": "sv",
    "sw-Latn-CD": "sw-CD",
    "sw-Latn-KE": "sw-KE",
    "sw-Latn-TZ": "sw",
    "sw-Latn-UG": "sw-UG",
    "swb-Arab-YT": "swb",
    "swg-Latn-DE": "swg",
    "swp-Latn-ZZ": "swp",
    "swv-Deva-IN": "swv",
    "sxn-Latn-ID": "sxn",
    "sxw-Latn-ZZ": "sxw",
    "syl-Beng-BD": "syl",
    "syl-Sylo-BD": "syl-Sylo",
    "syr-Syrc-IQ": "syr",
    "szl-Latn-PL": "szl",
    "ta-Taml-IN": "ta",
    "taj-Deva-NP": "taj",
    "tal-Latn-ZZ": "tal",
    "tan-Latn-ZZ": "tan",
    "taq-Latn-ZZ": "taq",
    "tbc-Latn-ZZ": "tbc",
    "tbd-Latn-ZZ": "tbd",
    "tbf-Latn-ZZ": "tbf",
    "tbg-Latn-ZZ": "tbg",
    "tbo-Latn-ZZ": "tbo",
    "tbw-Latn-PH": "tbw",
    "tbw-Tagb-PH": "tbw-Tagb",
    "tbz-Latn-ZZ": "tbz",
    "tci-Latn-ZZ": "tci",
    "tcy-Knda-IN": "tcy",
    "tdd-Tale-CN": "tdd",
    "tdg-Deva-NP": "tdg",
    "tdh-Deva-NP": "tdh",
    "te-Telu-IN": "te",
    "ted-Latn-ZZ": "ted",
    "tem-Latn-SL": "tem",
    "teo-Latn-UG": "teo",
    "tet-Latn-TL": "tet",
    "tfi-Latn-ZZ": "tfi",
    "tg-Arab-PK": "tg-PK",
    "tg-Cyrl-TJ": "tg",
    "tgc-Latn-ZZ": "tgc",
    "tgo-Latn-ZZ": "tgo",
    "tgu-Latn-ZZ": "tgu",
    "th-Thai-TH": "th",
    "thl-Deva-NP": "thl",
    "thq-Deva-NP": "thq",
    "thr-Deva-NP": "thr",
    "ti-Ethi-ER": "ti-ER",
    "ti-Ethi-ET": "ti",
    "tif-Latn-ZZ": "tif",
    "tig-Ethi-ER": "tig",
    "tik-Latn-ZZ": "tik",
    "tim-Latn-ZZ": "tim",
    "tio-Latn-ZZ": "tio",
    "tiv-Latn-NG": "tiv",
    "tk-Latn-AF": "tk-AF",
    "tk-Latn-IR": "tk-IR",
    "tk-Latn-TM": "tk",
    "tkl-Latn-TK": "tkl",
    "tkr-Latn-AZ": "tkr",
    "tkt-Deva-NP": "tkt",
    "tlf-Latn-ZZ": "tlf",
    "tlx-Latn-ZZ": "tlx",
    "tly-Latn-AZ": "tly",
    "tmh-Latn-NE": "tmh",
    "tmy-Latn-ZZ": "tmy",
    "tn-Latn-ZA": "tn",
    "tnh-Latn-ZZ": "tnh",
    "to-Latn-TO": "to",
    "tof-Latn-ZZ": "tof",
    "tog-Latn-MW": "tog",
    "tok-Latn-001": "tok",
    "toq-Latn-ZZ": "toq",
    "tpi-Latn-PG": "tpi",
    "tpm-Latn-ZZ": "tpm",
    "tpz-Latn-ZZ": "tpz",
    "tqo-Latn-ZZ": "tqo",
    "tr-Latn-CY": "tr-CY",
    "tr-Latn-TR": "tr",
    "tru-Latn-TR": "tru",
    "trv-Latn-TW": "trv",
    "trw-Arab-PK": "trw",
    "ts-Latn-ZA": "ts",
    "tsd-Grek-GR": "tsd",
    "tsg-Latn-PH": "tsg",
    "tsj-Tibt-BT": "tsj",
    "tsw-Latn-ZZ": "tsw",
    "tt-Cyrl-RU": "tt",
    "ttd-Latn-ZZ": "ttd",
    "tte-Latn-ZZ": "tte",
    "ttj-Latn-UG": "ttj",
    "ttr-Latn-ZZ": "ttr",
    "tts-Thai-TH": "tts",
    "ttt-Latn-AZ": "ttt",
    "tuh-Latn-ZZ": "tuh",
    "tul-Latn-ZZ": "tul",
    "tum-Latn-MW": "tum",
    "tuq-Latn-ZZ": "tuq",
    "tvd-Latn-ZZ": "tvd",
    "tvl-Latn-TV": "tvl",
    "tvu-Latn-ZZ": "tvu",
    "twh-Latn-ZZ": "twh",
    "twq-Latn-NE": "twq",
    "txg-Tang-CN": "txg",
    "txo-Toto-IN": "txo",
    "ty-Latn-PF": "ty",
    "tya-Latn-ZZ": "tya",
    "tyv-Cyrl-RU": "tyv",
    "tzm-Latn-MA": "tzm",
    "ubu-Latn-ZZ": "ubu",
    "udi-Aghb-RU": "udi",
    "udm-Cyrl-RU": "udm",
    "ug-Arab-CN": "ug",
    "ug-Cyrl-KZ": "ug-KZ",
    "ug-Cyrl-MN": "ug-MN",
    "uga-Ugar-SY": "uga",
    "uk-Cyrl-MD": "uk-MD",
    "uk-Cyrl-SK": "uk-SK",
    "uk-Cyrl-UA": "uk",
    "uli-Latn-FM": "uli",
    "umb-Latn-AO": "umb",
    "und-Cpmn-CY": "und-Cpmn",
    "und-Latn-AQ": "und-AQ",
    "und-Latn-BV": "und-BV",
    "und-Latn-CP": "und-CP",
    "und-Latn-GS": "und-GS",
    "und-Latn-HM": "und-HM",
    "unr-Beng-IN": "unr",
    "unr-Deva-NP": "unr-NP",
    "unr-Nagm-IN": "unr-Nagm",
    "unx-Beng-IN": "unx",
    "ur-Arab-GB": "ur-GB",
    "ur-Arab-IN": "ur-IN",
    "ur-Arab-MU": "ur-MU",
    "ur-Arab-PK": "ur",
    "uri-Latn-ZZ": "uri",
    "urt-Latn-ZZ": "urt",
    "urw-Latn-ZZ": "urw",
    "usa-Latn-ZZ": "usa",
    "uth-Latn-ZZ": "uth",
    "utr-Latn-ZZ": "utr",
    "uvh-Latn-ZZ": "uvh",
    "uvl-Latn-ZZ": "uvl",
    "uz-Arab-AF": "uz-AF",
    "uz-Cyrl-CN": "uz-CN",
    "uz-Latn-UZ": "uz",
    "vag-Latn-ZZ": "vag",
    "vai-Vaii-LR": "vai",
    "van-Latn-ZZ": "van",
    "ve-Latn-ZA": "ve",
    "vec-Latn-IT": "vec",
    "vep-Latn-RU": "vep",
    "vi-Latn-VN": "vi",
    "vic-Latn-SX": "vic",
    "viv-Latn-ZZ": "viv",
    "vls-Latn-BE": "vls",
    "vmf-Latn-DE": "vmf",
    "vmw-Latn-MZ": "vmw",
    "vo-Latn-001": "vo",
    "vot-Latn-RU": "vot",
    "vro-Latn-EE": "vro",
    "vun-Latn-TZ": "vun",
    "vut-Latn-ZZ": "vut",
    "wa-Latn-BE": "wa",
    "wae-Latn-CH": "wae",
    "waj-Latn-ZZ": "waj",
    "wal-Ethi-ET": "wal",
    "wan-Latn-ZZ": "wan",
    "war-Latn-PH": "war",
    "wbp-Latn-AU": "wbp",
    "wbq-Telu-IN": "wbq",
    "wbr-Deva-IN": "wbr",
    "wci-Latn-ZZ": "wci",
    "wer-Latn-ZZ": "wer",
    "wgi-Latn-ZZ": "wgi",
    "whg-Latn-ZZ": "whg",
    "wib-Latn-ZZ": "wib",
    "wiu-Latn-ZZ": "wiu",
    "wiv-Latn-ZZ": "wiv",
    "wja-Latn-ZZ": "wja",
    "wji-Latn-ZZ": "wji",
    "wls-Latn-WF": "wls",
    "wmo-Latn-ZZ": "wmo",
    "wnc-Latn-ZZ": "wnc",
    "wni-Arab-KM": "wni",
    "wnu-Latn-ZZ": "wnu",
    "wo-Latn-SN": "wo",
    "wob-Latn-ZZ": "wob",
    "wos-Latn-ZZ": "wos",
    "wrs-Latn-ZZ": "wrs",
    "wsg-Gong-IN": "wsg",
    "wsk-Latn-ZZ": "wsk",
    "wtm-Deva-IN": "wtm",
    "wuu-Hans-CN": "wuu",
    "wuv-Latn-ZZ": "wuv",
    "wwa-Latn-ZZ": "wwa",
    "xav-Latn-BR": "xav",
    "xbi-Latn-ZZ": "xbi",
    "xco-Chrs-UZ": "xco",
    "xcr-Cari-TR": "xcr",
    "xes-Latn-ZZ": "xes",
    "xh-Latn-ZA": "xh",
    "xla-Latn-ZZ": "xla",
    "xlc-Lyci-TR": "xlc",
    "xld-Lydi-TR": "xld",
    "xmf-Geor-GE": "xmf",
    "xmn-Mani-CN": "xmn",
    "xmr-Merc-SD": "xmr",
    "xmr-Mero-SD": "xmr-Mero",
    "xna-Narb-SA": "xna",
    "xnr-Deva-IN": "xnr",
    "xog-Latn-UG": "xog",
    "xon-Latn-ZZ": "xon",
    "xpr-Prti-IR": "xpr",
    "xrb-Latn-ZZ": "xrb",
    "xsa-Sarb-YE": "xsa",
    "xsi-Latn-ZZ": "xsi",
    "xsm-Latn-ZZ": "xsm",
    "xsr-Deva-NP": "xsr",
    "xwe-Latn-ZZ": "xwe",
    "yam-Latn-ZZ": "yam",
    "yao-Latn-MZ": "yao",
    "yap-Latn-FM": "yap",
    "yas-Latn-ZZ": "yas",
    "yat-Latn-ZZ": "yat",
    "yav-Latn-CM": "yav",
    "yay-Latn-ZZ": "yay",
    "yaz-Latn-ZZ": "yaz",
    "yba-Latn-ZZ": "yba",
    "ybb-Latn-CM": "ybb",
    "yby-Latn-ZZ": "yby",
    "yer-Latn-ZZ": "yer",
    "ygr-Latn-ZZ": "ygr",
    "ygw-Latn-ZZ": "ygw",
    "yi-Hebr-001": "yi",
    "yi-Hebr-SE": "yi-SE",
    "yi-Hebr-UA": "yi-UA",
    "yi-Hebr-US": "yi-US",
    "yko-Latn-ZZ": "yko",
    "yle-Latn-ZZ": "yle",
    "ylg-Latn-ZZ": "ylg",
    "yll-Latn-ZZ": "yll",
    "yml-Latn-ZZ": "yml",
    "yo-Latn-NG": "yo",
    "yon-Latn-ZZ": "yon",
    "yrb-Latn-ZZ": "yrb",
    "yre-Latn-ZZ": "yre",
    "yrl-Latn-BR": "yrl",
    "yss-Latn-ZZ": "yss",
    "yua-Latn-MX": "yua",
    "yue-Hans-CN": "yue-CN",
    "yue-Hant-CA": "yue-CA",
    "yue-Hant-HK": "yue",
    "yuj-Latn-ZZ": "yuj",
    "yut-Latn-ZZ": "yut",
    "yuw-Latn-ZZ": "yuw",
    "za-Latn-CN": "za",
    "zag-Latn-SD": "zag",
    "zdj-Arab-KM": "zdj",
    "zea-Latn-NL": "zea",
    "zgh-Tfng-MA": "zgh",
    "zh-Bopo-TW": "zh-Bopo",
    "zh-Hanb-TW": "zh-Hanb",
    "zh-Hani-CN": "zh-Hani",
    "zh-Hans-CN": "zh",
    "zh-Hant-AU": "zh-AU",
    "zh-Hant-BN": "zh-BN",
    "zh-Hant-GB": "zh-GB",
    "zh-Hant-GF": "zh-GF",
    "zh-Hant-HK": "zh-HK",
    "zh-Hant-ID": "zh-ID",
    "zh-Hant-MO": "zh-MO",
    "zh-Hant-PA": "zh-PA",
    "zh-Hant-PF": "zh-PF",
    "zh-Hant-PH": "zh-PH",
    "zh-Hant-SR": "zh-SR",
    "zh-Hant-TH": "zh-TH",
    "zh-Hant-TW": "zh-TW",
    "zh-Hant-US": "zh-US",
    "zh-Hant-VN": "zh-VN",
    "zhx-Nshu-CN": "zhx",
    "zia-Latn-ZZ": "zia",
    "zkt-Kits-CN": "zkt",
    "zlm-Latn-TG": "zlm",
    "zmi-Latn-MY": "zmi",
    "zne-Latn-ZZ": "zne",
    "zu-Latn-ZA": "zu",
    "zza-Latn-TR": "zza",
};

for (let [tag, maximal] of Object.entries(maxLikelySubtags)) {
    assertEq(new Intl.Locale(tag).maximize().toString(), maximal);
}

for (let [tag, minimal] of Object.entries(minLikelySubtags)) {
    assertEq(new Intl.Locale(tag).minimize().toString(), minimal);
}

if (typeof reportCompare === "function")
    reportCompare(0, 0);
