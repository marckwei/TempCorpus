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

if (typeof fdlibm === "undefined") {
  var fdlibm = SpecialPowers.Cu.getJSTestingFunctions().fdlibm;
}

if (typeof getBuildConfiguration === "undefined") {
  var getBuildConfiguration = SpecialPowers.Cu.getJSTestingFunctions().getBuildConfiguration;
}

const f64 = new Float64Array(1);
const ui64 = new BigUint64Array(f64.buffer);

function toBits(n) {
  f64[0] = n;
  return ui64[0];
}

function errorInULP(actual, expected) {
  // Handle NaN and +0/-0.
  if (Object.is(actual, expected)) {
    return 0;
  }

  let x = toBits(actual);
  let y = toBits(expected);
  return x <= y ? Number(y - x) : Number(x - y);
}

// Test methodology:
//
// Generate test cases for inputs where the original js::powi implementation
// returns a different result than std::pow. If such inputs where found, compare
// them against fdlibm::pow to find inputs where the error is larger than 1 ULP.
//
// Compile with:
// -std=c++17 -O3 -msse -msse2 -mfpmath=sse -fno-math-errno -fno-exceptions -fno-rtti -march=native
//
// static bool test(double x, int32_t y) {
//   if (std::isnan(x)) {
//     return true;
//   }
//
//   double t = js::powi(x, y);
//   double u = std::pow(x, static_cast<double>(y));
//   if (t == u) {
//     return true;
//   }
//
//   uint64_t a;
//   std::memcpy(&a, &t, sizeof(double));
//
//   uint64_t b;
//   std::memcpy(&b, &u, sizeof(double));
//
//   double v = fdlibm::pow(x, y);
//
//   uint64_t c;
//   std::memcpy(&c, &v, sizeof(double));
//
//   double w = musl::pow(x, y);
//
//   uint64_t d;
//   std::memcpy(&d, &w, sizeof(double));
//
//   // Expect at most 1 ULP difference between std::pow and fdlibm::pow.
//   if ((b < c && c - b > 1) || (b > c && b - c > 1)) {
//     printf("!!! [fdlibm] %.53f ** %d: 0x%" PRIx64 " != 0x%" PRIx64 "\n", x, y, b, c);
//     exit(1);
//   }
//
//   // Expect at most 1 ULP difference between std::pow and musl::pow.
//   if ((b < d && d - b > 1) || (b > d && b - d > 1)) {
//     printf("!!! [musl] %.53f ** %d: 0x%" PRIx64 " != 0x%" PRIx64 "\n", x, y, b, d);
//     exit(1);
//   }
//
//   // Accept 1 ULP difference between js::powi and fdlibm::pow.
//   if ((a <= c && c - a <= 1) || (a >= c && a - c <= 1)) {
//     return true;
//   }
//
//   // Output if a larger error was found.
//   printf("%.53f ** %d: 0x%" PRIx64 " != 0x%" PRIx64 " (0x%" PRIx64 ") (0x%" PRIx64 ")\n", x, y, a, b, c, d);
//   return false;
// }
//
// int main() {
//   // Use mt19937 for reproducible results.
//   std::mt19937_64 gen64;
//   std::mt19937 gen32;
//
//   for (uint64_t i = 0; i < 100'000'000'000; ++i) {
//     uint64_t x = gen64();
//     int32_t y = gen32();
//
//     double f;
//     std::memcpy(&f, &x, sizeof(double));
//
//     test(f, y);
//   }
// }

// Raw output:
//
// 0.99998738156596089776684266325901262462139129638671875 ** 38583256: 0x140854811fb319e7 != 0x140854811fe4d778 (0x140854811fe4d778) (0x140854811fe4d778)
// -0.99843469603485224261874009243911132216453552246093750 ** 326215: 0x91dad4716de6fc4b != 0x91dad4716de5e587 (0x91dad4716de5e588) (0x91dad4716de5e587)
// 0.00003722856305626354357250426541092735988058848306537 ** -33: 0x5e47357c3582e49e != 0x5e47357c3582e4a3 (0x5e47357c3582e4a3) (0x5e47357c3582e4a3)
// -0.99996909838479330900895547529216855764389038085937500 ** 17078527: 0x9058409e5ea3b80a != 0x9058409e5eb11ef4 (0x9058409e5eb11ef4) (0x9058409e5eb11ef4)
// 0.99992690642006631929206150743993930518627166748046875 ** -6725291: 0x6c42a167a8b7c0b2 != 0x6c42a167a8b81d0e (0x6c42a167a8b81d0e) (0x6c42a167a8b81d0e)
// -0.99879181217764612110698863034485839307308197021484375 ** 485128: 0xb0d9c6f2f710d24 != 0xb0d9c6f2f71708d (0xb0d9c6f2f71708d) (0xb0d9c6f2f71708d)
// -1.00560838484317760510577954846667125821113586425781250 ** 92252: 0x6e744b727536056b != 0x6e744b72753599a4 (0x6e744b72753599a4) (0x6e744b72753599a4)
// 0.99999532655875444930870798998512327671051025390625000 ** 93511912: 0x1886c29a53ed9332 != 0x1886c29a53cba724 (0x1886c29a53cba724) (0x1886c29a53cba724)
// -0.99989751779212987514711130643263459205627441406250000 ** -2864087: 0xda664b586d48712f != 0xda664b586d437e8c (0xda664b586d437e8c) (0xda664b586d437e8c)
// -239.35307289280868303649185691028833389282226562500000000 ** -90: 0x137a8b43006c4438 != 0x137a8b43006c443e (0x137a8b43006c443e) (0x137a8b43006c443e)
// 0.96128212369452570307259975379565730690956115722656250 ** -9670: 0x625d7eb275191f6f != 0x625d7eb2751920bf (0x625d7eb2751920c0) (0x625d7eb2751920bf)
// 0.99996078564218904283222855156054720282554626464843750 ** 10583765: 0x1a829de67930f619 != 0x1a829de67951cc2d (0x1a829de67951cc2d) (0x1a829de67951cc2d)
// -953.14032530394126752071315422654151916503906250000000000 ** 22: 0x4d8a6d863703112c != 0x4d8a6d863703112e (0x4d8a6d863703112e) (0x4d8a6d863703112e)
// 0.99857985216514444370972114484175108373165130615234375 ** 335918: 0x14e345eb84f09d46 != 0x14e345eb84f036f4 (0x14e345eb84f036f4) (0x14e345eb84f036f4)
// -1.20521595553711002857255607523256912827491760253906250 ** -2760: 0x117b0064dd165101 != 0x117b0064dd16511a (0x117b0064dd16511a) (0x117b0064dd16511a)
// -1.19074911947068473594413262617308646440505981445312500 ** 3884: 0x7d132c80ed6973f6 != 0x7d132c80ed697072 (0x7d132c80ed697072) (0x7d132c80ed697072)
// -0.99999908129426284819629699995857663452625274658203125 ** -172780371: 0xce400f20e4a13b1a != 0xce400f20e3e56454 (0xce400f20e3e56454) (0xce400f20e3e56454)
// -0.00000000000000000000000000007930552628950037082519209 ** 8: 0x1142888ad3062fc1 != 0x1142888ad3062fbe (0x1142888ad3062fbe) (0x1142888ad3062fbe)
// -0.99998583604065760521706351937609724700450897216796875 ** -5861784: 0x476b83d92617a928 != 0x476b83d9261b0d4e (0x476b83d9261b0d4e) (0x476b83d9261b0d4e)
// 0.99989915564587761309667257592082023620605468750000000 ** 5468367: 0xe34d25f36eef64b != 0xe34d25f36f555ca (0xe34d25f36f555ca) (0xe34d25f36f555ca)
// 0.99977805581863743444870351595454849302768707275390625 ** -130493: 0x428ba17ba9286df6 != 0x428ba17ba9282f94 (0x428ba17ba9282f94) (0x428ba17ba9282f94)
// 29.19821057723854806909002945758402347564697265625000000 ** -20: 0x39d8ffec76e30251 != 0x39d8ffec76e3024a (0x39d8ffec76e3024a) (0x39d8ffec76e3024a)
// 0.99985373283040668290766461723251268267631530761718750 ** 2345687: 0x20ff8c2fd8e5b4e0 != 0x20ff8c2fd8e00564 (0x20ff8c2fd8e00564) (0x20ff8c2fd8e00564)
// -0.88383265987178571965188211834174580872058868408203125 ** -841: 0xc94c6878de27b17c != 0xc94c6878de27b20d (0xc94c6878de27b20d) (0xc94c6878de27b20d)
// 0.99999589815682188298495702838408760726451873779296875 ** 72449292: 0x25233af2e809c6a6 != 0x25233af2e87ddc61 (0x25233af2e87ddc61) (0x25233af2e87ddc61)
// 345736476.13618659973144531250000000000000000000000000000000000 ** -16: 0x2391db755176ac1b != 0x2391db755176ac19 (0x2391db755176ac19) (0x2391db755176ac19)
// -0.99999307321818442506611290809814818203449249267578125 ** -55045397: 0xe250f3d69f25ec86 != 0xe250f3d69f03e875 (0xe250f3d69f03e875) (0xe250f3d69f03e875)
// 1419676.56599932140670716762542724609375000000000000000000000 ** 25: 0x5fde72aa74287c2d != 0x5fde72aa74287c30 (0x5fde72aa74287c30) (0x5fde72aa74287c30)
// 0.95797249286536323431562323094112798571586608886718750 ** -11483: 0x6c63b79e88c07b6f != 0x6c63b79e88c07a3f (0x6c63b79e88c07a3f) (0x6c63b79e88c07a3f)
// 0.99998135132609855535434917328529991209506988525390625 ** 5682278: 0x3661650feb28b969 != 0x3661650feb22b7ed (0x3661650feb22b7ed) (0x3661650feb22b7ed)
// -1.02020595459010832151136582979233935475349426269531250 ** -1668: 0x3ced0e90ddfec9a3 != 0x3ced0e90ddfecabc (0x3ced0e90ddfecabc) (0x3ced0e90ddfecabc)
// 0.97281701550260646360612781791132874786853790283203125 ** 13717: 0x1dd88a88f24fc0d5 != 0x1dd88a88f24fb801 (0x1dd88a88f24fb801) (0x1dd88a88f24fb801)
// -0.88724290003841266294415390802896581590175628662109375 ** -3437: 0xe502ab8ea591420d != 0xe502ab8ea5914139 (0xe502ab8ea5914139) (0xe502ab8ea5914139)
// -0.99998630320599690701754980182158760726451873779296875 ** -11251995: 0xcdd44ff462cfbf32 != 0xcdd44ff462dbdcb2 (0xcdd44ff462dbdcb2) (0xcdd44ff462dbdcb2)
// -0.99995743703658013235013868325040675699710845947265625 ** 13995099: 0x8a38604324e009d5 != 0x8a38604324c2ec7d (0x8a38604324c2ec7d) (0x8a38604324c2ec7d)
// 0.99991090354494038816568490801728330552577972412109375 ** 7116340: 0x6c2ca56237c8161 != 0x6c2ca562366c00b (0x6c2ca562366c00b) (0x6c2ca562366c00b)
// 0.00000022955540324908999561342678487341206761129797087 ** 27: 0x1ab703277bbb112d != 0x1ab703277bbb1131 (0x1ab703277bbb1130) (0x1ab703277bbb1131)
// -1.00000041289256280663266807096078991889953613281250000 ** -365287834: 0x3255339a24caec8a != 0x3255339a26f00dc8 (0x3255339a26f00dc8) (0x3255339a26f00dc8)
// -1.38949508997780957209045027411775663495063781738281250 ** 1996: 0x7b22ad71344bbd0b != 0x7b22ad71344bbddf (0x7b22ad71344bbddf) (0x7b22ad71344bbddf)
// 0.99999867528282249118376512342365458607673645019531250 ** 164253172: 0x2c50f93fbc72a2b4 != 0x2c50f93fbb2d2fd4 (0x2c50f93fbb2d2fd4) (0x2c50f93fbb2d2fd4)
// 1.00356688770562074708436739456374198198318481445312500 ** -141698: 0x12717fb35c5fd169 != 0x12717fb35c5ff8c8 (0x12717fb35c5ff8c8) (0x12717fb35c5ff8c8)
// 368710687472107.18750000000000000000000000000000000000000000000000000 ** -20: 0x37282f0ae9be13c != 0x37282f0ae9be138 (0x37282f0ae9be138) (0x37282f0ae9be138)
// 0.99246668780181890312519499275367707014083862304687500 ** -44617: 0x5e5ad2c000333e50 != 0x5e5ad2c0003351f5 (0x5e5ad2c0003351f5) (0x5e5ad2c0003351f5)
// 1.13820783188362395499382273555966094136238098144531250 ** 1411: 0x506701df16f3a891 != 0x506701df16f3a70d (0x506701df16f3a70d) (0x506701df16f3a70d)
// -0.99671841783028414241130121808964759111404418945312500 ** 97041: 0xa32c44e6e77f8d3b != 0xa32c44e6e77f6a7a (0xa32c44e6e77f6a7a) (0xa32c44e6e77f6a7a)
// -0.57021831816264889614132016504299826920032501220703125 ** -802: 0x688ef2cc36fa60b3 != 0x688ef2cc36fa6064 (0x688ef2cc36fa6064) (0x688ef2cc36fa6064)
// -0.97423450510790443601649712945800274610519409179687500 ** 23570: 0x874c760d601ec94 != 0x874c760d601e66f (0x874c760d601e66f) (0x874c760d601e66f)
// -0.98067196425761504752216524138930253684520721435546875 ** -19882: 0x62ec606ceb9af0ae != 0x62ec606ceb9ae89c (0x62ec606ceb9ae89c) (0x62ec606ceb9ae89c)
// 0.99683039770073134100414335989626124501228332519531250 ** -29823: 0x487816b919332b03 != 0x487816b919333fe4 (0x487816b919333fe4) (0x487816b919333fe4)
// 0.99882797644578258378089685720624402165412902832031250 ** -540990: 0x792372efd5ca5ad2 != 0x792372efd5c92857 (0x792372efd5c92857) (0x792372efd5c92857)

const testCases = [
  [0.99998738156596089776684266325901262462139129638671875 , 38583256],
  [-0.99843469603485224261874009243911132216453552246093750 , 326215],
  [0.00003722856305626354357250426541092735988058848306537 , -33],
  [-0.99996909838479330900895547529216855764389038085937500 , 17078527],
  [0.99992690642006631929206150743993930518627166748046875 , -6725291],
  [-0.99879181217764612110698863034485839307308197021484375 , 485128],
  [-1.00560838484317760510577954846667125821113586425781250 , 92252],
  [0.99999532655875444930870798998512327671051025390625000 , 93511912],
  [-0.99989751779212987514711130643263459205627441406250000 , -2864087],
  [-239.35307289280868303649185691028833389282226562500000000 , -90],
  [0.96128212369452570307259975379565730690956115722656250 , -9670],
  [0.99996078564218904283222855156054720282554626464843750 , 10583765],
  [-953.14032530394126752071315422654151916503906250000000000 , 22],
  [0.99857985216514444370972114484175108373165130615234375 , 335918],
  [-1.20521595553711002857255607523256912827491760253906250 , -2760],
  [-1.19074911947068473594413262617308646440505981445312500 , 3884],
  [-0.99999908129426284819629699995857663452625274658203125 , -172780371],
  [-0.00000000000000000000000000007930552628950037082519209 , 8],
  [-0.99998583604065760521706351937609724700450897216796875 , -5861784],
  [0.99989915564587761309667257592082023620605468750000000 , 5468367],
  [0.99977805581863743444870351595454849302768707275390625 , -130493],
  [29.19821057723854806909002945758402347564697265625000000 , -20],
  [0.99985373283040668290766461723251268267631530761718750 , 2345687],
  [-0.88383265987178571965188211834174580872058868408203125 , -841],
  [0.99999589815682188298495702838408760726451873779296875 , 72449292],
  [345736476.13618659973144531250000000000000000000000000000000000 , -16],
  [-0.99999307321818442506611290809814818203449249267578125 , -55045397],
  [1419676.56599932140670716762542724609375000000000000000000000 , 25],
  [0.95797249286536323431562323094112798571586608886718750 , -11483],
  [0.99998135132609855535434917328529991209506988525390625 , 5682278],
  [-1.02020595459010832151136582979233935475349426269531250 , -1668],
  [0.97281701550260646360612781791132874786853790283203125 , 13717],
  [-0.88724290003841266294415390802896581590175628662109375 , -3437],
  [-0.99998630320599690701754980182158760726451873779296875 , -11251995],
  [-0.99995743703658013235013868325040675699710845947265625 , 13995099],
  [0.99991090354494038816568490801728330552577972412109375 , 7116340],
  [0.00000022955540324908999561342678487341206761129797087 , 27],
  [-1.00000041289256280663266807096078991889953613281250000 , -365287834],
  [-1.38949508997780957209045027411775663495063781738281250 , 1996],
  [0.99999867528282249118376512342365458607673645019531250 , 164253172],
  [1.00356688770562074708436739456374198198318481445312500 , -141698],
  [368710687472107.18750000000000000000000000000000000000000000000000000 , -20],
  [0.99246668780181890312519499275367707014083862304687500 , -44617],
  [1.13820783188362395499382273555966094136238098144531250 , 1411],
  [-0.99671841783028414241130121808964759111404418945312500 , 97041],
  [-0.57021831816264889614132016504299826920032501220703125 , -802],
  [-0.97423450510790443601649712945800274610519409179687500 , 23570],
  [-0.98067196425761504752216524138930253684520721435546875 , -19882],
  [0.99683039770073134100414335989626124501228332519531250 , -29823],
  [0.99882797644578258378089685720624402165412902832031250 , -540990],
];

// Test program modified to avoid bases with |abs(x) < 1| and large exponents.
//
// ```cpp
// // Skip over likely denormals.
// if (-1 < f && f < 0) {
//   f -= 1;
// } else if (0 < f && f < 1) {
//   f += 1;
// }
//
// // Keep the power small.
// y &= 63;
// ```
//
// 7.86990183266223297664510027971118688583374023437500000 ** 54: 0x49fa67548289784a != 0x49fa675482897851 (0x49fa675482897850) (0x49fa675482897851)
// -1.00000018751738117828153917798772454261779785156250000 ** 25: 0xbff00004ea6921f6 != 0xbff00004ea6921fc (0xbff00004ea6921fc) (0xbff00004ea6921fc)
// 1.19908234423429393977755808009533211588859558105468750 ** 58: 0x40e246fe7b30c6ec != 0x40e246fe7b30c6e6 (0x40e246fe7b30c6e6) (0x40e246fe7b30c6e6)
// 1.00000649317438283780745678086532279849052429199218750 ** 42: 0x3ff0011dffabb95c != 0x3ff0011dffabb950 (0x3ff0011dffabb950) (0x3ff0011dffabb950)
// 863370098.16819441318511962890625000000000000000000000000000000 ** 27: 0x7206b860614eb6df != 0x7206b860614eb6d9 (0x7206b860614eb6d9) (0x7206b860614eb6d9)
// -1.00011928123711690830077714053913950920104980468750000 ** 57: 0xbff01bf129d0ffab != 0xbff01bf129d0ffbf (0xbff01bf129d0ffbf) (0xbff01bf129d0ffbf)
// -1.14006037237328494704513559554470703005790710449218750 ** 30: 0x404983fd4d57c4aa != 0x404983fd4d57c4a0 (0x404983fd4d57c4a0) (0x404983fd4d57c4a0)
// -447.11057737163486081044538877904415130615234375000000000 ** 8: 0x4455a4e4be220fce != 0x4455a4e4be220fd0 (0x4455a4e4be220fd0) (0x4455a4e4be220fd0)
// -1.03656507831253685836259137431625276803970336914062500 ** 20: 0x4000681e0886d6db != 0x4000681e0886d6d9 (0x4000681e0886d6d9) (0x4000681e0886d6d9)
// -1.00000465330344945336094042431795969605445861816406250 ** 41: 0xbff000c81257efc1 != 0xbff000c81257efc6 (0xbff000c81257efc6) (0xbff000c81257efc6)
// -1.00002726631492944164847358479164540767669677734375000 ** 14: 0x3ff00190579a2f93 != 0x3ff00190579a2f90 (0x3ff00190579a2f90) (0x3ff00190579a2f90)
// 2512068.57641875604167580604553222656250000000000000000000000 ** 26: 0x627b50512391a46e != 0x627b50512391a46c (0x627b50512391a46c) (0x627b50512391a46c)
// 3309586784.85019683837890625000000000000000000000000000000000000 ** 30: 0x7b3a5b69a3a40717 != 0x7b3a5b69a3a40719 (0x7b3a5b69a3a40719) (0x7b3a5b69a3a40719)
// 1.40742719307547781149025922786677256226539611816406250 ** 19: 0x4084a6ad66b5f1ce != 0x4084a6ad66b5f1d1 (0x4084a6ad66b5f1d0) (0x4084a6ad66b5f1d1)
// 1.00035740860596344958821646287105977535247802734375000 ** 36: 0x3ff0350873b3189e != 0x3ff0350873b318a0 (0x3ff0350873b318a0) (0x3ff0350873b318a0)
testCases.push(
  [7.86990183266223297664510027971118688583374023437500000 , 54],
  [-1.00000018751738117828153917798772454261779785156250000 , 25],
  [1.19908234423429393977755808009533211588859558105468750 , 58],
  [1.00000649317438283780745678086532279849052429199218750 , 42],
  [863370098.16819441318511962890625000000000000000000000000000000 , 27],
  [-1.00011928123711690830077714053913950920104980468750000 , 57],
  [-1.14006037237328494704513559554470703005790710449218750 , 30],
  [-447.11057737163486081044538877904415130615234375000000000 , 8],
  [-1.03656507831253685836259137431625276803970336914062500 , 20],
  [-1.00000465330344945336094042431795969605445861816406250 , 41],
  [-1.00002726631492944164847358479164540767669677734375000 , 14],
  [2512068.57641875604167580604553222656250000000000000000000000 , 26],
  [3309586784.85019683837890625000000000000000000000000000000000000 , 30],
  [1.40742719307547781149025922786677256226539611816406250 , 19],
  [1.00035740860596344958821646287105977535247802734375000 , 36],
);

// Test program modified to only use small integer bases (< 20) and positive exponents.
//
// ```cpp
// f = static_cast<double>(x);
// f = std::fmod(f, 20);
// y &= 63;
// ```
//
// 13.00000000000000000000000000000000000000000000000000000 ** 31: 0x471a3d23b248d522 != 0x471a3d23b248d520 (0x471a3d23b248d520) (0x471a3d23b248d520)
// 13.00000000000000000000000000000000000000000000000000000 ** 41: 0x496a51a4d0054bb2 != 0x496a51a4d0054bb1 (0x496a51a4d0054bb0) (0x496a51a4d0054bb1)
// 13.00000000000000000000000000000000000000000000000000000 ** 51: 0x4bba6635f3af40fa != 0x4bba6635f3af40f8 (0x4bba6635f3af40f8) (0x4bba6635f3af40f8)
// 13.00000000000000000000000000000000000000000000000000000 ** 58: 0x4d58af19e7576d60 != 0x4d58af19e7576d5e (0x4d58af19e7576d5e) (0x4d58af19e7576d5e)
// 13.00000000000000000000000000000000000000000000000000000 ** 63: 0x4e817b180a97c789 != 0x4e817b180a97c787 (0x4e817b180a97c787) (0x4e817b180a97c787)
// 11.00000000000000000000000000000000000000000000000000000 ** 63: 0x4d8ec9288a0088ce != 0x4d8ec9288a0088d0 (0x4d8ec9288a0088d0) (0x4d8ec9288a0088d0)
// 13.00000000000000000000000000000000000000000000000000000 ** 47: 0x4ace49afd4c20163 != 0x4ace49afd4c20161 (0x4ace49afd4c20161) (0x4ace49afd4c20161)
// 13.00000000000000000000000000000000000000000000000000000 ** 41: 0x496a51a4d0054bb2 != 0x496a51a4d0054bb1 (0x496a51a4d0054bb0) (0x496a51a4d0054bb1)
// 13.00000000000000000000000000000000000000000000000000000 ** 63: 0x4e817b180a97c789 != 0x4e817b180a97c787 (0x4e817b180a97c787) (0x4e817b180a97c787)
// 13.00000000000000000000000000000000000000000000000000000 ** 31: 0x471a3d23b248d522 != 0x471a3d23b248d520 (0x471a3d23b248d520) (0x471a3d23b248d520)
// 13.00000000000000000000000000000000000000000000000000000 ** 49: 0x4b43fea5137412eb != 0x4b43fea5137412e9 (0x4b43fea5137412e9) (0x4b43fea5137412e9)
// 13.00000000000000000000000000000000000000000000000000000 ** 58: 0x4d58af19e7576d60 != 0x4d58af19e7576d5e (0x4d58af19e7576d5e) (0x4d58af19e7576d5e)
// 13.00000000000000000000000000000000000000000000000000000 ** 31: 0x471a3d23b248d522 != 0x471a3d23b248d520 (0x471a3d23b248d520) (0x471a3d23b248d520)
// 11.00000000000000000000000000000000000000000000000000000 ** 63: 0x4d8ec9288a0088ce != 0x4d8ec9288a0088d0 (0x4d8ec9288a0088d0) (0x4d8ec9288a0088d0)
// 13.00000000000000000000000000000000000000000000000000000 ** 31: 0x471a3d23b248d522 != 0x471a3d23b248d520 (0x471a3d23b248d520) (0x471a3d23b248d520)
testCases.push(
  [13.00000000000000000000000000000000000000000000000000000 , 31],
  [13.00000000000000000000000000000000000000000000000000000 , 41],
  [13.00000000000000000000000000000000000000000000000000000 , 51],
  [13.00000000000000000000000000000000000000000000000000000 , 58],
  [13.00000000000000000000000000000000000000000000000000000 , 63],
  [11.00000000000000000000000000000000000000000000000000000 , 63],
  [13.00000000000000000000000000000000000000000000000000000 , 47],
  [13.00000000000000000000000000000000000000000000000000000 , 41],
  [13.00000000000000000000000000000000000000000000000000000 , 63],
  [13.00000000000000000000000000000000000000000000000000000 , 31],
  [13.00000000000000000000000000000000000000000000000000000 , 49],
  [13.00000000000000000000000000000000000000000000000000000 , 58],
  [13.00000000000000000000000000000000000000000000000000000 , 31],
  [11.00000000000000000000000000000000000000000000000000000 , 63],
  [13.00000000000000000000000000000000000000000000000000000 , 31],
);

// Test program modified to only use small integer bases (< 20) and negative exponents.
//
// ```cpp
// f = static_cast<double>(x);
// f = std::fmod(f, 20);
// y &= 63;
// y = -y;
// ```
//
// 14.00000000000000000000000000000000000000000000000000000 ** -57: 0x325f938745f05e58 != 0x325f938745f05e5a (0x325f938745f05e5a) (0x325f938745f05e5a)
// 11.00000000000000000000000000000000000000000000000000000 ** -53: 0x34791bddc7b3025a != 0x34791bddc7b30259 (0x34791bddc7b30258) (0x34791bddc7b30259)
// 7.00000000000000000000000000000000000000000000000000000 ** -57: 0x35ef938745f05e58 != 0x35ef938745f05e5a (0x35ef938745f05e5a) (0x35ef938745f05e5a)
// 15.00000000000000000000000000000000000000000000000000000 ** -50: 0x33b933babb6d9cd8 != 0x33b933babb6d9cda (0x33b933babb6d9cda) (0x33b933babb6d9cda)
// 14.00000000000000000000000000000000000000000000000000000 ** -57: 0x325f938745f05e58 != 0x325f938745f05e5a (0x325f938745f05e5a) (0x325f938745f05e5a)
// 13.00000000000000000000000000000000000000000000000000000 ** -33: 0x384d8ee9f0edfd7c != 0x384d8ee9f0edfd7d (0x384d8ee9f0edfd7e) (0x384d8ee9f0edfd7d)
// 19.00000000000000000000000000000000000000000000000000000 ** -53: 0x31dd0994e8aaf4e0 != 0x31dd0994e8aaf4e1 (0x31dd0994e8aaf4e2) (0x31dd0994e8aaf4e1)
// 15.00000000000000000000000000000000000000000000000000000 ** -50: 0x33b933babb6d9cd8 != 0x33b933babb6d9cda (0x33b933babb6d9cda) (0x33b933babb6d9cda)
// 14.00000000000000000000000000000000000000000000000000000 ** -57: 0x325f938745f05e58 != 0x325f938745f05e5a (0x325f938745f05e5a) (0x325f938745f05e5a)
// 13.00000000000000000000000000000000000000000000000000000 ** -63: 0x315d4a0a2c8d4bd8 != 0x315d4a0a2c8d4bdb (0x315d4a0a2c8d4bdb) (0x315d4a0a2c8d4bdb)
// 11.00000000000000000000000000000000000000000000000000000 ** -53: 0x34791bddc7b3025a != 0x34791bddc7b30259 (0x34791bddc7b30258) (0x34791bddc7b30259)
// 15.00000000000000000000000000000000000000000000000000000 ** -50: 0x33b933babb6d9cd8 != 0x33b933babb6d9cda (0x33b933babb6d9cda) (0x33b933babb6d9cda)
// 13.00000000000000000000000000000000000000000000000000000 ** -53: 0x33ad60ed868e2926 != 0x33ad60ed868e2928 (0x33ad60ed868e2928) (0x33ad60ed868e2928)
// 19.00000000000000000000000000000000000000000000000000000 ** -53: 0x31dd0994e8aaf4e0 != 0x31dd0994e8aaf4e1 (0x31dd0994e8aaf4e2) (0x31dd0994e8aaf4e1)
// 13.00000000000000000000000000000000000000000000000000000 ** -33: 0x384d8ee9f0edfd7c != 0x384d8ee9f0edfd7d (0x384d8ee9f0edfd7e) (0x384d8ee9f0edfd7d)
testCases.push(
  [14.00000000000000000000000000000000000000000000000000000 , -57],
  [11.00000000000000000000000000000000000000000000000000000 , -53],
  [7.00000000000000000000000000000000000000000000000000000 , -57],
  [15.00000000000000000000000000000000000000000000000000000 , -50],
  [14.00000000000000000000000000000000000000000000000000000 , -57],
  [13.00000000000000000000000000000000000000000000000000000 , -33],
  [19.00000000000000000000000000000000000000000000000000000 , -53],
  [15.00000000000000000000000000000000000000000000000000000 , -50],
  [14.00000000000000000000000000000000000000000000000000000 , -57],
  [13.00000000000000000000000000000000000000000000000000000 , -63],
  [11.00000000000000000000000000000000000000000000000000000 , -53],
  [15.00000000000000000000000000000000000000000000000000000 , -50],
  [13.00000000000000000000000000000000000000000000000000000 , -53],
  [19.00000000000000000000000000000000000000000000000000000 , -53],
  [13.00000000000000000000000000000000000000000000000000000 , -33],
);

// std::pow is less precise on Windows.
const maxError = getBuildConfiguration().windows ? 3 : 1;

// Ensure the error is less-or-equal to |maxError| ULP when compared to fdlibm.
for (let [x, y] of testCases) {
  let actual = Math.pow(x, y);
  let expected = fdlibm.pow(x, y);
  let error = errorInULP(actual, expected);

  assertEq(error <= maxError, true,
           `${x} ** ${y}: ${actual} (${toBits(actual).toString(16)}) != ${expected} (${toBits(expected).toString(16)})`);
}

// Test program modified to use 4 as the exponent:
//
// ```cpp
// y = 4;
// ```
//
// -0.00000000000000000000000000000749666789562697097993956 ** 4: 0x27bfdbe3cf0b7e1d != 0x27bfdbe3cf0b7e1b (0x27bfdbe3cf0b7e1b) (0x27bfdbe3cf0b7e1b)
// 0.00000000000000000000000000000000000000000000000000000 ** 4: 0xd3e1e77bd0d8f5d != 0xd3e1e77bd0d8f5f (0xd3e1e77bd0d8f5f) (0xd3e1e77bd0d8f5f)
// -0.00000000000000000000000000023705601542216470968966009 ** 4: 0x28fe60d2f5131d02 != 0x28fe60d2f5131d04 (0x28fe60d2f5131d04) (0x28fe60d2f5131d04)
// 0.00000000000000000000000000000000000000000000000000441 ** 4: 0x161dad0fa681c66c != 0x161dad0fa681c66b (0x161dad0fa681c66a) (0x161dad0fa681c66b)
// 0.00000000000000537255761599995092558925668894011631095 ** 4: 0x3414eb4baea214b6 != 0x3414eb4baea214b5 (0x3414eb4baea214b4) (0x3414eb4baea214b5)
// 0.01225688384384779339164595057809492573142051696777344 ** 4: 0x3e583bd550871dfc != 0x3e583bd550871dfd (0x3e583bd550871dfe) (0x3e583bd550871dfd)
// -0.00000000000000000000000000000000000000000000000000000 ** 4: 0xa59292360f6d326 != 0xa59292360f6d324 (0xa59292360f6d324) (0xa59292360f6d324)
// -0.00000000000000000000000000000000000000000000000000000 ** 4: 0x109fb7a8459811ec != 0x109fb7a8459811ed (0x109fb7a8459811ee) (0x109fb7a8459811ed)
// -120834175976112453093144522854609799898808186321228136949237230085114691584.00000000000000000000000000000000000000000000000000000 ** 4: 0x7d74dcc37a2d7dc2 != 0x7d74dcc37a2d7dc3 (0x7d74dcc37a2d7dc4) (0x7d74dcc37a2d7dc3)
// -6676.83140968165753292851150035858154296875000000000000000 ** 4: 0x431c3e0ef48fe66a != 0x431c3e0ef48fe66c (0x431c3e0ef48fe66c) (0x431c3e0ef48fe66c)
// -0.00000000000000000000000000000000000000000000039753861 ** 4: 0x1a3a87f39f288766 != 0x1a3a87f39f288764 (0x1a3a87f39f288764) (0x1a3a87f39f288764)
// 129749516186492032220917661696.00000000000000000000000000000000000000000000000000000 ** 4: 0x581cc58a512bdd10 != 0x581cc58a512bdd12 (0x581cc58a512bdd12) (0x581cc58a512bdd12)
// -1888635225450734959219733085647207705818299180319259746124169216.00000000000000000000000000000000000000000000000000000 ** 4: 0x747bc423aba49de6 != 0x747bc423aba49de5 (0x747bc423aba49de4) (0x747bc423aba49de5)
// 7934926680560039158281691725824.00000000000000000000000000000000000000000000000000000 ** 4: 0x5997fceb5eed5c94 != 0x5997fceb5eed5c93 (0x5997fceb5eed5c92) (0x5997fceb5eed5c93)
// -0.00000000000000579868166379701264244398310517312073637 ** 4: 0x341c635a1a764ef2 != 0x341c635a1a764ef0 (0x341c635a1a764ef0) (0x341c635a1a764ef0)
//
//
// Test program modified to avoid bases with |abs(x) < 1| and large exponents.
//
// ```cpp
// // Skip over likely denormals.
// if (-1 < f && f < 0) {
//   f -= 1;
// } else if (0 < f && f < 1) {
//   f += 1;
// }
//
// f = std::fmod(f, 20);
//
// y = 4;
// ```
//
// 4.73347349464893341064453125000000000000000000000000000 ** 4: 0x407f604c239c2323 != 0x407f604c239c2321 (0x407f604c239c2321) (0x407f604c239c2321)
// -12.35635152040049433708190917968750000000000000000000000 ** 4: 0x40d6c3c0652f0948 != 0x40d6c3c0652f0949 (0x40d6c3c0652f094a) (0x40d6c3c0652f0949)
// -1.50385549572482823954544528533006086945533752441406250 ** 4: 0x40147581145bc6e6 != 0x40147581145bc6e7 (0x40147581145bc6e8) (0x40147581145bc6e7)
// -8.93048901623114943504333496093750000000000000000000000 ** 4: 0x40b8d8a463c28bd6 != 0x40b8d8a463c28bd7 (0x40b8d8a463c28bd8) (0x40b8d8a463c28bd7)
// 19.02711385915608843788504600524902343750000000000000000 ** 4: 0x40ffffa7d5df2562 != 0x40ffffa7d5df2560 (0x40ffffa7d5df2560) (0x40ffffa7d5df2560)
// 17.83878016096969076897948980331420898437500000000000000 ** 4: 0x40f8b914a6acb498 != 0x40f8b914a6acb497 (0x40f8b914a6acb496) (0x40f8b914a6acb497)
// 12.90541613101959228515625000000000000000000000000000000 ** 4: 0x40db16b4c2dafa0a != 0x40db16b4c2dafa0c (0x40db16b4c2dafa0c) (0x40db16b4c2dafa0c)
// -18.34655402903445065021514892578125000000000000000000000 ** 4: 0x40fba90e5b7bbc6a != 0x40fba90e5b7bbc6b (0x40fba90e5b7bbc6c) (0x40fba90e5b7bbc6b)
// -13.28634420270100235939025878906250000000000000000000000 ** 4: 0x40de6e70b9ed821a != 0x40de6e70b9ed821c (0x40de6e70b9ed821c) (0x40de6e70b9ed821c)
// 18.52965961024165153503417968750000000000000000000000000 ** 4: 0x40fcc800b850b01a != 0x40fcc800b850b018 (0x40fcc800b850b018) (0x40fcc800b850b018)
// 13.32226210648514097556471824645996093750000000000000000 ** 4: 0x40dec3063a559350 != 0x40dec3063a55934e (0x40dec3063a55934e) (0x40dec3063a55934e)
// 1.09174693829848346027233674249146133661270141601562500 ** 4: 0x3ff6bafe5bbe7532 != 0x3ff6bafe5bbe7533 (0x3ff6bafe5bbe7534) (0x3ff6bafe5bbe7533)
// 9.35059530444141273619607090950012207031250000000000000 ** 4: 0x40bddca3dd9f5c8f != 0x40bddca3dd9f5c91 (0x40bddca3dd9f5c91) (0x40bddca3dd9f5c91)
// 17.59552449546754360198974609375000000000000000000000000 ** 4: 0x40f766db2706f434 != 0x40f766db2706f435 (0x40f766db2706f436) (0x40f766db2706f435)
// 17.94561576098203659057617187500000000000000000000000000 ** 4: 0x40f952110041965c != 0x40f952110041965a (0x40f952110041965a) (0x40f952110041965a)
const testCases4 = [
  [-0.00000000000000000000000000000749666789562697097993956 , 4],
  [0.00000000000000000000000000000000000000000000000000000 , 4],
  [-0.00000000000000000000000000023705601542216470968966009 , 4],
  [0.00000000000000000000000000000000000000000000000000441 , 4],
  [0.00000000000000537255761599995092558925668894011631095 , 4],
  [0.01225688384384779339164595057809492573142051696777344 , 4],
  [-0.00000000000000000000000000000000000000000000000000000 , 4],
  [-0.00000000000000000000000000000000000000000000000000000 , 4],
  [-120834175976112453093144522854609799898808186321228136949237230085114691584.00000000000000000000000000000000000000000000000000000 , 4],
  [-6676.83140968165753292851150035858154296875000000000000000 , 4],
  [-0.00000000000000000000000000000000000000000000039753861 , 4],
  [129749516186492032220917661696.00000000000000000000000000000000000000000000000000000 , 4],
  [-1888635225450734959219733085647207705818299180319259746124169216.00000000000000000000000000000000000000000000000000000 , 4],
  [7934926680560039158281691725824.00000000000000000000000000000000000000000000000000000 , 4],
  [-0.00000000000000579868166379701264244398310517312073637 , 4],

  [4.73347349464893341064453125000000000000000000000000000 , 4],
  [-12.35635152040049433708190917968750000000000000000000000 , 4],
  [-1.50385549572482823954544528533006086945533752441406250 , 4],
  [-8.93048901623114943504333496093750000000000000000000000 , 4],
  [19.02711385915608843788504600524902343750000000000000000 , 4],
  [17.83878016096969076897948980331420898437500000000000000 , 4],
  [12.90541613101959228515625000000000000000000000000000000 , 4],
  [-18.34655402903445065021514892578125000000000000000000000 , 4],
  [-13.28634420270100235939025878906250000000000000000000000 , 4],
  [18.52965961024165153503417968750000000000000000000000000 , 4],
  [13.32226210648514097556471824645996093750000000000000000 , 4],
  [1.09174693829848346027233674249146133661270141601562500 , 4],
  [9.35059530444141273619607090950012207031250000000000000 , 4],
  [17.59552449546754360198974609375000000000000000000000000 , 4],
  [17.94561576098203659057617187500000000000000000000000000 , 4],
];

// Ensure the error is less-or-equal to 2 ULP when compared to fdlibm.
//
// This can produce a larger error than std::pow, because we evaluate
// |x ** 4| as |(x * x) * (x * x)| to match Ion.
for (let [x, y] of testCases4) {
  let actual = Math.pow(x, y);
  let expected = fdlibm.pow(x, y);
  let error = errorInULP(actual, expected);
  assertEq(error <= 2, true,
           `${x} ** ${y}: ${actual} (${toBits(actual).toString(16)}) != ${expected} (${toBits(expected).toString(16)})`);
}

for (let [x, y] of testCases4) {
  // Replace |y| with a constant to trigger Ion optimisations.
  let actual = Math.pow(x, 4);
  let expected = fdlibm.pow(x, y);
  let error = errorInULP(actual, expected);
  assertEq(error <= 2, true,
           `${x} ** ${y}: ${actual} (${toBits(actual).toString(16)}) != ${expected} (${toBits(expected).toString(16)})`);
}

// Test program modified to use 3 as the exponent:
//
// ```cpp
// y = 3;
// ```
//
// 196194373276.42089843750000000000000000000000000000000000000000000 ** 3: 0x46f745720bc58e22 != 0x46f745720bc58e23 (0x46f745720bc58e24) (0x46f745720bc58e23)
// 17260025115986696435331651385474892363490876322742272.00000000000000000000000000000000000000000000000000000 ** 3: 0x6077f8040eb542fc != 0x6077f8040eb542fb (0x6077f8040eb542fa) (0x6077f8040eb542fb)
// -0.00000000000000000000000000000000000000000000000000000 ** 3: 0x9307c17ddf2c4af6 != 0x9307c17ddf2c4af7 (0x9307c17ddf2c4af8) (0x9307c17ddf2c4af7)
// 2359506498398344427475761591701240715936602989985583832867274752.00000000000000000000000000000000000000000000000000000 ** 3: 0x6767960b1076dc24 != 0x6767960b1076dc25 (0x6767960b1076dc26) (0x6767960b1076dc25)
// 22724457948673043906745552566513068013978508710758109286797554897659283949989408425377792.00000000000000000000000000000000000000000000000000000 ** 3: 0x76f74ab82115b372 != 0x76f74ab82115b373 (0x76f74ab82115b374) (0x76f74ab82115b373)
// -1024872849611580448634200763411882795753013248.00000000000000000000000000000000000000000000000000000 ** 3: 0xdbf7b2694dce1d6c != 0xdbf7b2694dce1d6b (0xdbf7b2694dce1d6a) (0xdbf7b2694dce1d6b)
// -918435268181356203923125447950336.00000000000000000000000000000000000000000000000000000 ** 3: 0xd476ab3173dbfcc0 != 0xd476ab3173dbfcbf (0xd476ab3173dbfcbe) (0xd476ab3173dbfcbf)
// 558545783776545344834655968246618719333738303286453207040.00000000000000000000000000000000000000000000000000000 ** 3: 0x634716045b3ee61c != 0x634716045b3ee61b (0x634716045b3ee61a) (0x634716045b3ee61b)
// 0.00000000000000000000000000000000000000000000000000000 ** 3: 0x1c6f3bddc90315c != 0x1c6f3bddc90315b (0x1c6f3bddc90315a) (0x1c6f3bddc90315b)
// -0.00000000000261062225071774409619236799548496917242058 ** 3: 0xb8b7a667f8b6344e != 0xb8b7a667f8b6344f (0xb8b7a667f8b63450) (0xb8b7a667f8b6344f)
// 0.00000000000000000000000000000000000000000000012475377 ** 3: 0x23571f25316bb01e != 0x23571f25316bb01f (0x23571f25316bb020) (0x23571f25316bb01f)
// -0.00000000000000000000000000000000000000000000000000000 ** 3: 0x93f6c04c12acc76c != 0x93f6c04c12acc76d (0x93f6c04c12acc76e) (0x93f6c04c12acc76d)
// 0.00000000000000000000000000000000000000000000000000000 ** 3: 0x676eb3aa0a63236 != 0x676eb3aa0a63237 (0x676eb3aa0a63238) (0x676eb3aa0a63237)
// 0.00000000000000000000000007454937961610833261396029146 ** 3: 0x3047fcbe59481112 != 0x3047fcbe59481111 (0x3047fcbe59481110) (0x3047fcbe59481111)
// 0.00000000000000000000000000000000000003326770580987513 ** 3: 0x2896aaec8bb845c8 != 0x2896aaec8bb845c9 (0x2896aaec8bb845ca) (0x2896aaec8bb845c9)
//
//
// Test program modified to avoid bases with |abs(x) < 1| and large exponents.
//
// ```cpp
// // Skip over likely denormals.
// if (-1 < f && f < 0) {
//   f -= 1;
// } else if (0 < f && f < 1) {
//   f += 1;
// }
//
// f = std::fmod(f, 20);
//
// y = 3;
// ```
//
// -11.40858423709869384765625000000000000000000000000000000 ** 3: 0xc0973392c88cadcc != 0xc0973392c88cadcd (0xc0973392c88cadce) (0xc0973392c88cadcd)
// 11.42477834224700927734375000000000000000000000000000000 ** 3: 0x40974ce701d58518 != 0x40974ce701d58519 (0x40974ce701d5851a) (0x40974ce701d58519)
// -11.46123231985238533070514677092432975769042968750000000 ** 3: 0xc097862ed0211e58 != 0xc097862ed0211e59 (0xc097862ed0211e5a) (0xc097862ed0211e59)
// -11.40183842182159423828125000000000000000000000000000000 ** 3: 0xc097290b23fe8cdc != 0xc097290b23fe8cdd (0xc097290b23fe8cde) (0xc097290b23fe8cdd)
// 2.87109172078278795936512324260547757148742675781250000 ** 3: 0x4037aab95517cdd0 != 0x4037aab95517cdcf (0x4037aab95517cdce) (0x4037aab95517cdcf)
// -0.72109144181013107299804687500000000000000000000000000 ** 3: 0xbfd7ff25d4fd46bc != 0xbfd7ff25d4fd46bd (0xbfd7ff25d4fd46be) (0xbfd7ff25d4fd46bd)
// 5.70116788148880004882812500000000000000000000000000000 ** 3: 0x406729d1c53687b4 != 0x406729d1c53687b5 (0x406729d1c53687b6) (0x406729d1c53687b5)
// -11.32285048566092200417187996208667755126953125000000000 ** 3: 0xc096aeac14d25c0e != 0xc096aeac14d25c0f (0xc096aeac14d25c10) (0xc096aeac14d25c0f)
// 1.41961999237537384033203125000000000000000000000000000 ** 3: 0x4006e34ea8957732 != 0x4006e34ea8957733 (0x4006e34ea8957734) (0x4006e34ea8957733)
// -11.52091628707762538397219032049179077148437500000000000 ** 3: 0xc097e4c12ab5e96e != 0xc097e4c12ab5e96f (0xc097e4c12ab5e970) (0xc097e4c12ab5e96f)
// -5.73415940999984741210937500000000000000000000000000000 ** 3: 0xc067915c3febbeba != 0xc067915c3febbebb (0xc067915c3febbebc) (0xc067915c3febbebb)
// 1.41478560105390638312883311300538480281829833984375000 ** 3: 0x4006a7a69b402738 != 0x4006a7a69b402737 (0x4006a7a69b402736) (0x4006a7a69b402737)
// -2.88328036665916442871093750000000000000000000000000000 ** 3: 0xc037f8371e1d17ce != 0xc037f8371e1d17cf (0xc037f8371e1d17d0) (0xc037f8371e1d17cf)
// 1.42408178602072932328326260176254436373710632324218750 ** 3: 0x40071aba43b3bcea != 0x40071aba43b3bceb (0x40071aba43b3bcec) (0x40071aba43b3bceb)
// 11.48128501093015074729919433593750000000000000000000000 ** 3: 0x4097a5d8fdac3954 != 0x4097a5d8fdac3955 (0x4097a5d8fdac3956) (0x4097a5d8fdac3955)
const testCases3 = [
  [196194373276.42089843750000000000000000000000000000000000000000000 , 3],
  [17260025115986696435331651385474892363490876322742272.00000000000000000000000000000000000000000000000000000 , 3],
  [-0.00000000000000000000000000000000000000000000000000000 , 3],
  [2359506498398344427475761591701240715936602989985583832867274752.00000000000000000000000000000000000000000000000000000 , 3],
  [22724457948673043906745552566513068013978508710758109286797554897659283949989408425377792.00000000000000000000000000000000000000000000000000000 , 3],
  [-1024872849611580448634200763411882795753013248.00000000000000000000000000000000000000000000000000000 , 3],
  [-918435268181356203923125447950336.00000000000000000000000000000000000000000000000000000 , 3],
  [558545783776545344834655968246618719333738303286453207040.00000000000000000000000000000000000000000000000000000 , 3],
  [0.00000000000000000000000000000000000000000000000000000 , 3],
  [-0.00000000000261062225071774409619236799548496917242058 , 3],
  [0.00000000000000000000000000000000000000000000012475377 , 3],
  [-0.00000000000000000000000000000000000000000000000000000 , 3],
  [0.00000000000000000000000000000000000000000000000000000 , 3],
  [0.00000000000000000000000007454937961610833261396029146 , 3],
  [0.00000000000000000000000000000000000003326770580987513 , 3],

  [-11.40858423709869384765625000000000000000000000000000000 , 3],
  [11.42477834224700927734375000000000000000000000000000000 , 3],
  [-11.46123231985238533070514677092432975769042968750000000 , 3],
  [-11.40183842182159423828125000000000000000000000000000000 , 3],
  [2.87109172078278795936512324260547757148742675781250000 , 3],
  [-0.72109144181013107299804687500000000000000000000000000 , 3],
  [5.70116788148880004882812500000000000000000000000000000 , 3],
  [-11.32285048566092200417187996208667755126953125000000000 , 3],
  [1.41961999237537384033203125000000000000000000000000000 , 3],
  [-11.52091628707762538397219032049179077148437500000000000 , 3],
  [-5.73415940999984741210937500000000000000000000000000000 , 3],
  [1.41478560105390638312883311300538480281829833984375000 , 3],
  [-2.88328036665916442871093750000000000000000000000000000 , 3],
  [1.42408178602072932328326260176254436373710632324218750 , 3],
  [11.48128501093015074729919433593750000000000000000000000 , 3],
];

// Ensure the error is less-or-equal to 2 ULP when compared to fdlibm.
//
// This can produce a larger error than std::pow, because we evaluate
// |x ** 3| as |(x * x) * x| to match Ion.
for (let [x, y] of testCases3) {
  let actual = Math.pow(x, y);
  let expected = fdlibm.pow(x, y);
  let error = errorInULP(actual, expected);
  assertEq(error <= 2, true,
           `${x} ** ${y}: ${actual} (${toBits(actual).toString(16)}) != ${expected} (${toBits(expected).toString(16)})`);
}

for (let [x, y] of testCases3) {
  // Replace |y| with a constant to trigger Ion optimisations.
  let actual = Math.pow(x, 3);
  let expected = fdlibm.pow(x, y);
  let error = errorInULP(actual, expected);
  assertEq(error <= 2, true,
           `${x} ** ${y}: ${actual} (${toBits(actual).toString(16)}) != ${expected} (${toBits(expected).toString(16)})`);
}

if (typeof reportCompare === "function")
  reportCompare(true, true);
