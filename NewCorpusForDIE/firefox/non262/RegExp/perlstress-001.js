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

/* -*- tab-width: 2; indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 *
 * Date:    2002-07-07
 * SUMMARY: Testing JS RegExp engine against Perl 5 RegExp engine.
 * Adjust cnLBOUND, cnUBOUND below to restrict which sections are tested.
 *
 * This test was created by running various patterns and strings through the
 * Perl 5 RegExp engine. We saved the results below to test the JS engine.
 *
 * NOTE: ECMA/JS and Perl do differ on certain points. We have either commented
 * out such sections altogether, or modified them to fit what we expect from JS.
 *
 * EXAMPLES:
 *
 * - In JS, regexp captures (/(a) etc./) must hold |undefined| if not used.
 *   See http://bugzilla.mozilla.org/show_bug.cgi?id=123437.
 *   By contrast, in Perl, unmatched captures hold the empty string.
 *   We have modified such sections accordingly. Example:

 pattern = /^([^a-z])|(\^)$/;
 string = '.';
 actualmatch = string.match(pattern);
 //expectedmatch = Array('.', '.', '');        <<<--- Perl
 expectedmatch = Array('.', '.', undefined); <<<--- JS
 addThis();


 * - In JS, you can't refer to a capture before it's encountered & completed
 *
 * - Perl supports ] & ^] inside a [], ECMA does not
 *
 * - ECMA does support (?: (?= and (?! operators, but doesn't support (?<  etc.
 *
 * - ECMA doesn't support (?imsx or (?-imsx
 *
 * - ECMA doesn't support (?(condition)
 *
 * - Perl has \Z has end-of-line, ECMA doesn't
 *
 * - In ECMA, ^ matches only the empty string before the first character
 *
 * - In ECMA, $ matches only the empty string at end of input (unless multiline)
 *
 * - ECMA spec says that each atom in a range must be a single character
 *
 * - ECMA doesn't support \A
 *
 * - ECMA doesn't have rules for [:
 *
 */
//-----------------------------------------------------------------------------
var i = 0;
var BUGNUMBER = 85721;
var summary = 'Testing regular expression edge cases';
var cnSingleSpace = ' ';
var status = '';
var statusmessages = new Array();
var pattern = '';
var patterns = new Array();
var string = '';
var strings = new Array();
var actualmatch = '';
var actualmatches = new Array();
var expectedmatch = '';
var expectedmatches = new Array();
var cnLBOUND = 1;
var cnUBOUND = 1000;


status = inSection(1);
pattern = /abc/;
string = 'abc';
actualmatch = string.match(pattern);
expectedmatch = Array('abc');
addThis();

status = inSection(2);
pattern = /abc/;
string = 'xabcy';
actualmatch = string.match(pattern);
expectedmatch = Array('abc');
addThis();

status = inSection(3);
pattern = /abc/;
string = 'ababc';
actualmatch = string.match(pattern);
expectedmatch = Array('abc');
addThis();

status = inSection(4);
pattern = /ab*c/;
string = 'abc';
actualmatch = string.match(pattern);
expectedmatch = Array('abc');
addThis();

status = inSection(5);
pattern = /ab*bc/;
string = 'abc';
actualmatch = string.match(pattern);
expectedmatch = Array('abc');
addThis();

status = inSection(6);
pattern = /ab*bc/;
string = 'abbc';
actualmatch = string.match(pattern);
expectedmatch = Array('abbc');
addThis();

status = inSection(7);
pattern = /ab*bc/;
string = 'abbbbc';
actualmatch = string.match(pattern);
expectedmatch = Array('abbbbc');
addThis();

status = inSection(8);
pattern = /.{1}/;
string = 'abbbbc';
actualmatch = string.match(pattern);
expectedmatch = Array('a');
addThis();

status = inSection(9);
pattern = /.{3,4}/;
string = 'abbbbc';
actualmatch = string.match(pattern);
expectedmatch = Array('abbb');
addThis();

status = inSection(10);
pattern = /ab{0,}bc/;
string = 'abbbbc';
actualmatch = string.match(pattern);
expectedmatch = Array('abbbbc');
addThis();

status = inSection(11);
pattern = /ab+bc/;
string = 'abbc';
actualmatch = string.match(pattern);
expectedmatch = Array('abbc');
addThis();

status = inSection(12);
pattern = /ab+bc/;
string = 'abbbbc';
actualmatch = string.match(pattern);
expectedmatch = Array('abbbbc');
addThis();

status = inSection(13);
pattern = /ab{1,}bc/;
string = 'abbbbc';
actualmatch = string.match(pattern);
expectedmatch = Array('abbbbc');
addThis();

status = inSection(14);
pattern = /ab{1,3}bc/;
string = 'abbbbc';
actualmatch = string.match(pattern);
expectedmatch = Array('abbbbc');
addThis();

status = inSection(15);
pattern = /ab{3,4}bc/;
string = 'abbbbc';
actualmatch = string.match(pattern);
expectedmatch = Array('abbbbc');
addThis();

status = inSection(16);
pattern = /ab?bc/;
string = 'abbc';
actualmatch = string.match(pattern);
expectedmatch = Array('abbc');
addThis();

status = inSection(17);
pattern = /ab?bc/;
string = 'abc';
actualmatch = string.match(pattern);
expectedmatch = Array('abc');
addThis();

status = inSection(18);
pattern = /ab{0,1}bc/;
string = 'abc';
actualmatch = string.match(pattern);
expectedmatch = Array('abc');
addThis();

status = inSection(19);
pattern = /ab?c/;
string = 'abc';
actualmatch = string.match(pattern);
expectedmatch = Array('abc');
addThis();

status = inSection(20);
pattern = /ab{0,1}c/;
string = 'abc';
actualmatch = string.match(pattern);
expectedmatch = Array('abc');
addThis();

status = inSection(21);
pattern = /^abc$/;
string = 'abc';
actualmatch = string.match(pattern);
expectedmatch = Array('abc');
addThis();

status = inSection(22);
pattern = /^abc/;
string = 'abcc';
actualmatch = string.match(pattern);
expectedmatch = Array('abc');
addThis();

status = inSection(23);
pattern = /abc$/;
string = 'aabc';
actualmatch = string.match(pattern);
expectedmatch = Array('abc');
addThis();

status = inSection(24);
pattern = /^/;
string = 'abc';
actualmatch = string.match(pattern);
expectedmatch = Array('');
addThis();

status = inSection(25);
pattern = /$/;
string = 'abc';
actualmatch = string.match(pattern);
expectedmatch = Array('');
addThis();

status = inSection(26);
pattern = /a.c/;
string = 'abc';
actualmatch = string.match(pattern);
expectedmatch = Array('abc');
addThis();

status = inSection(27);
pattern = /a.c/;
string = 'axc';
actualmatch = string.match(pattern);
expectedmatch = Array('axc');
addThis();

status = inSection(28);
pattern = /a.*c/;
string = 'axyzc';
actualmatch = string.match(pattern);
expectedmatch = Array('axyzc');
addThis();

status = inSection(29);
pattern = /a[bc]d/;
string = 'abd';
actualmatch = string.match(pattern);
expectedmatch = Array('abd');
addThis();

status = inSection(30);
pattern = /a[b-d]e/;
string = 'ace';
actualmatch = string.match(pattern);
expectedmatch = Array('ace');
addThis();

status = inSection(31);
pattern = /a[b-d]/;
string = 'aac';
actualmatch = string.match(pattern);
expectedmatch = Array('ac');
addThis();

status = inSection(32);
pattern = /a[-b]/;
string = 'a-';
actualmatch = string.match(pattern);
expectedmatch = Array('a-');
addThis();

status = inSection(33);
pattern = /a[b-]/;
string = 'a-';
actualmatch = string.match(pattern);
expectedmatch = Array('a-');
addThis();

status = inSection(34);
pattern = /a]/;
string = 'a]';
actualmatch = string.match(pattern);
expectedmatch = Array('a]');
addThis();

/* Perl supports ] & ^] inside a [], ECMA does not
   pattern = /a[]]b/;
   status = inSection(35);
   string = 'a]b';
   actualmatch = string.match(pattern);
   expectedmatch = Array('a]b');
   addThis();
*/

status = inSection(36);
pattern = /a[^bc]d/;
string = 'aed';
actualmatch = string.match(pattern);
expectedmatch = Array('aed');
addThis();

status = inSection(37);
pattern = /a[^-b]c/;
string = 'adc';
actualmatch = string.match(pattern);
expectedmatch = Array('adc');
addThis();

/* Perl supports ] & ^] inside a [], ECMA does not
   status = inSection(38);
   pattern = /a[^]b]c/;
   string = 'adc';
   actualmatch = string.match(pattern);
   expectedmatch = Array('adc');
   addThis();
*/

status = inSection(39);
pattern = /\ba\b/;
string = 'a-';
actualmatch = string.match(pattern);
expectedmatch = Array('a');
addThis();

status = inSection(40);
pattern = /\ba\b/;
string = '-a';
actualmatch = string.match(pattern);
expectedmatch = Array('a');
addThis();

status = inSection(41);
pattern = /\ba\b/;
string = '-a-';
actualmatch = string.match(pattern);
expectedmatch = Array('a');
addThis();

status = inSection(42);
pattern = /\By\b/;
string = 'xy';
actualmatch = string.match(pattern);
expectedmatch = Array('y');
addThis();

status = inSection(43);
pattern = /\by\B/;
string = 'yz';
actualmatch = string.match(pattern);
expectedmatch = Array('y');
addThis();

status = inSection(44);
pattern = /\By\B/;
string = 'xyz';
actualmatch = string.match(pattern);
expectedmatch = Array('y');
addThis();

status = inSection(45);
pattern = /\w/;
string = 'a';
actualmatch = string.match(pattern);
expectedmatch = Array('a');
addThis();

status = inSection(46);
pattern = /\W/;
string = '-';
actualmatch = string.match(pattern);
expectedmatch = Array('-');
addThis();

status = inSection(47);
pattern = /a\Sb/;
string = 'a-b';
actualmatch = string.match(pattern);
expectedmatch = Array('a-b');
addThis();

status = inSection(48);
pattern = /\d/;
string = '1';
actualmatch = string.match(pattern);
expectedmatch = Array('1');
addThis();

status = inSection(49);
pattern = /\D/;
string = '-';
actualmatch = string.match(pattern);
expectedmatch = Array('-');
addThis();

status = inSection(50);
pattern = /[\w]/;
string = 'a';
actualmatch = string.match(pattern);
expectedmatch = Array('a');
addThis();

status = inSection(51);
pattern = /[\W]/;
string = '-';
actualmatch = string.match(pattern);
expectedmatch = Array('-');
addThis();

status = inSection(52);
pattern = /a[\S]b/;
string = 'a-b';
actualmatch = string.match(pattern);
expectedmatch = Array('a-b');
addThis();

status = inSection(53);
pattern = /[\d]/;
string = '1';
actualmatch = string.match(pattern);
expectedmatch = Array('1');
addThis();

status = inSection(54);
pattern = /[\D]/;
string = '-';
actualmatch = string.match(pattern);
expectedmatch = Array('-');
addThis();

status = inSection(55);
pattern = /ab|cd/;
string = 'abc';
actualmatch = string.match(pattern);
expectedmatch = Array('ab');
addThis();

status = inSection(56);
pattern = /ab|cd/;
string = 'abcd';
actualmatch = string.match(pattern);
expectedmatch = Array('ab');
addThis();

status = inSection(57);
pattern = /()ef/;
string = 'def';
actualmatch = string.match(pattern);
expectedmatch = Array('ef', '');
addThis();

status = inSection(58);
pattern = /a\(b/;
string = 'a(b';
actualmatch = string.match(pattern);
expectedmatch = Array('a(b');
addThis();

status = inSection(59);
pattern = /a\(*b/;
string = 'ab';
actualmatch = string.match(pattern);
expectedmatch = Array('ab');
addThis();

status = inSection(60);
pattern = /a\(*b/;
string = 'a((b';
actualmatch = string.match(pattern);
expectedmatch = Array('a((b');
addThis();

status = inSection(61);
pattern = /a\\b/;
string = 'a\\b';
actualmatch = string.match(pattern);
expectedmatch = Array('a\\b');
addThis();

status = inSection(62);
pattern = /((a))/;
string = 'abc';
actualmatch = string.match(pattern);
expectedmatch = Array('a', 'a', 'a');
addThis();

status = inSection(63);
pattern = /(a)b(c)/;
string = 'abc';
actualmatch = string.match(pattern);
expectedmatch = Array('abc', 'a', 'c');
addThis();

status = inSection(64);
pattern = /a+b+c/;
string = 'aabbabc';
actualmatch = string.match(pattern);
expectedmatch = Array('abc');
addThis();

status = inSection(65);
pattern = /a{1,}b{1,}c/;
string = 'aabbabc';
actualmatch = string.match(pattern);
expectedmatch = Array('abc');
addThis();

status = inSection(66);
pattern = /a.+?c/;
string = 'abcabc';
actualmatch = string.match(pattern);
expectedmatch = Array('abc');
addThis();

status = inSection(67);
pattern = /(a+|b)*/;
string = 'ab';
actualmatch = string.match(pattern);
expectedmatch = Array('ab', 'b');
addThis();

status = inSection(68);
pattern = /(a+|b){0,}/;
string = 'ab';
actualmatch = string.match(pattern);
expectedmatch = Array('ab', 'b');
addThis();

status = inSection(69);
pattern = /(a+|b)+/;
string = 'ab';
actualmatch = string.match(pattern);
expectedmatch = Array('ab', 'b');
addThis();

status = inSection(70);
pattern = /(a+|b){1,}/;
string = 'ab';
actualmatch = string.match(pattern);
expectedmatch = Array('ab', 'b');
addThis();

status = inSection(71);
pattern = /(a+|b)?/;
string = 'ab';
actualmatch = string.match(pattern);
expectedmatch = Array('a', 'a');
addThis();

status = inSection(72);
pattern = /(a+|b){0,1}/;
string = 'ab';
actualmatch = string.match(pattern);
expectedmatch = Array('a', 'a');
addThis();

status = inSection(73);
pattern = /[^ab]*/;
string = 'cde';
actualmatch = string.match(pattern);
expectedmatch = Array('cde');
addThis();

status = inSection(74);
pattern = /([abc])*d/;
string = 'abbbcd';
actualmatch = string.match(pattern);
expectedmatch = Array('abbbcd', 'c');
addThis();

status = inSection(75);
pattern = /([abc])*bcd/;
string = 'abcd';
actualmatch = string.match(pattern);
expectedmatch = Array('abcd', 'a');
addThis();

status = inSection(76);
pattern = /a|b|c|d|e/;
string = 'e';
actualmatch = string.match(pattern);
expectedmatch = Array('e');
addThis();

status = inSection(77);
pattern = /(a|b|c|d|e)f/;
string = 'ef';
actualmatch = string.match(pattern);
expectedmatch = Array('ef', 'e');
addThis();

status = inSection(78);
pattern = /abcd*efg/;
string = 'abcdefg';
actualmatch = string.match(pattern);
expectedmatch = Array('abcdefg');
addThis();

status = inSection(79);
pattern = /ab*/;
string = 'xabyabbbz';
actualmatch = string.match(pattern);
expectedmatch = Array('ab');
addThis();

status = inSection(80);
pattern = /ab*/;
string = 'xayabbbz';
actualmatch = string.match(pattern);
expectedmatch = Array('a');
addThis();

status = inSection(81);
pattern = /(ab|cd)e/;
string = 'abcde';
actualmatch = string.match(pattern);
expectedmatch = Array('cde', 'cd');
addThis();

status = inSection(82);
pattern = /[abhgefdc]ij/;
string = 'hij';
actualmatch = string.match(pattern);
expectedmatch = Array('hij');
addThis();

status = inSection(83);
pattern = /(abc|)ef/;
string = 'abcdef';
actualmatch = string.match(pattern);
expectedmatch = Array('ef', '');
addThis();

status = inSection(84);
pattern = /(a|b)c*d/;
string = 'abcd';
actualmatch = string.match(pattern);
expectedmatch = Array('bcd', 'b');
addThis();

status = inSection(85);
pattern = /(ab|ab*)bc/;
string = 'abc';
actualmatch = string.match(pattern);
expectedmatch = Array('abc', 'a');
addThis();

status = inSection(86);
pattern = /a([bc]*)c*/;
string = 'abc';
actualmatch = string.match(pattern);
expectedmatch = Array('abc', 'bc');
addThis();

status = inSection(87);
pattern = /a([bc]*)(c*d)/;
string = 'abcd';
actualmatch = string.match(pattern);
expectedmatch = Array('abcd', 'bc', 'd');
addThis();

status = inSection(88);
pattern = /a([bc]+)(c*d)/;
string = 'abcd';
actualmatch = string.match(pattern);
expectedmatch = Array('abcd', 'bc', 'd');
addThis();

status = inSection(89);
pattern = /a([bc]*)(c+d)/;
string = 'abcd';
actualmatch = string.match(pattern);
expectedmatch = Array('abcd', 'b', 'cd');
addThis();

status = inSection(90);
pattern = /a[bcd]*dcdcde/;
string = 'adcdcde';
actualmatch = string.match(pattern);
expectedmatch = Array('adcdcde');
addThis();

status = inSection(91);
pattern = /(ab|a)b*c/;
string = 'abc';
actualmatch = string.match(pattern);
expectedmatch = Array('abc', 'ab');
addThis();

status = inSection(92);
pattern = /((a)(b)c)(d)/;
string = 'abcd';
actualmatch = string.match(pattern);
expectedmatch = Array('abcd', 'abc', 'a', 'b', 'd');
addThis();

status = inSection(93);
pattern = /[a-zA-Z_][a-zA-Z0-9_]*/;
string = 'alpha';
actualmatch = string.match(pattern);
expectedmatch = Array('alpha');
addThis();

status = inSection(94);
pattern = /^a(bc+|b[eh])g|.h$/;
string = 'abh';
actualmatch = string.match(pattern);
expectedmatch = Array('bh', undefined);
addThis();

status = inSection(95);
pattern = /(bc+d$|ef*g.|h?i(j|k))/;
string = 'effgz';
actualmatch = string.match(pattern);
expectedmatch = Array('effgz', 'effgz', undefined);
addThis();

status = inSection(96);
pattern = /(bc+d$|ef*g.|h?i(j|k))/;
string = 'ij';
actualmatch = string.match(pattern);
expectedmatch = Array('ij', 'ij', 'j');
addThis();

status = inSection(97);
pattern = /(bc+d$|ef*g.|h?i(j|k))/;
string = 'reffgz';
actualmatch = string.match(pattern);
expectedmatch = Array('effgz', 'effgz', undefined);
addThis();

status = inSection(98);
pattern = /((((((((((a))))))))))/;
string = 'a';
actualmatch = string.match(pattern);
expectedmatch = Array('a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a');
addThis();

status = inSection(99);
pattern = /((((((((((a))))))))))\10/;
string = 'aa';
actualmatch = string.match(pattern);
expectedmatch = Array('aa', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a');
addThis();

status = inSection(100);
pattern = /((((((((((a))))))))))/;
string = 'a!';
actualmatch = string.match(pattern);
expectedmatch = Array('a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a');
addThis();

status = inSection(101);
pattern = /(((((((((a)))))))))/;
string = 'a';
actualmatch = string.match(pattern);
expectedmatch = Array('a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a');
addThis();

status = inSection(102);
pattern = /(.*)c(.*)/;
string = 'abcde';
actualmatch = string.match(pattern);
expectedmatch = Array('abcde', 'ab', 'de');
addThis();

status = inSection(103);
pattern = /abcd/;
string = 'abcd';
actualmatch = string.match(pattern);
expectedmatch = Array('abcd');
addThis();

status = inSection(104);
pattern = /a(bc)d/;
string = 'abcd';
actualmatch = string.match(pattern);
expectedmatch = Array('abcd', 'bc');
addThis();

status = inSection(105);
pattern = /a[-]?c/;
string = 'ac';
actualmatch = string.match(pattern);
expectedmatch = Array('ac');
addThis();

status = inSection(106);
pattern = /(abc)\1/;
string = 'abcabc';
actualmatch = string.match(pattern);
expectedmatch = Array('abcabc', 'abc');
addThis();

status = inSection(107);
pattern = /([a-c]*)\1/;
string = 'abcabc';
actualmatch = string.match(pattern);
expectedmatch = Array('abcabc', 'abc');
addThis();

status = inSection(108);
pattern = /(a)|\1/;
string = 'a';
actualmatch = string.match(pattern);
expectedmatch = Array('a', 'a');
addThis();

status = inSection(109);
pattern = /(([a-c])b*?\2)*/;
string = 'ababbbcbc';
actualmatch = string.match(pattern);
expectedmatch = Array('ababb', 'bb', 'b');
addThis();

status = inSection(110);
pattern = /(([a-c])b*?\2){3}/;
string = 'ababbbcbc';
actualmatch = string.match(pattern);
expectedmatch = Array('ababbbcbc', 'cbc', 'c');
addThis();

/* Can't refer to a capture before it's encountered & completed
   status = inSection(111);
   pattern = /((\3|b)\2(a)x)+/;
   string = 'aaaxabaxbaaxbbax';
   actualmatch = string.match(pattern);
   expectedmatch = Array('bbax', 'bbax', 'b', 'a');
   addThis();

   status = inSection(112);
   pattern = /((\3|b)\2(a)){2,}/;
   string = 'bbaababbabaaaaabbaaaabba';
   actualmatch = string.match(pattern);
   expectedmatch = Array('bbaaaabba', 'bba', 'b', 'a');
   addThis();
*/

status = inSection(113);
pattern = /abc/i;
string = 'ABC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABC');
addThis();

status = inSection(114);
pattern = /abc/i;
string = 'XABCY';
actualmatch = string.match(pattern);
expectedmatch = Array('ABC');
addThis();

status = inSection(115);
pattern = /abc/i;
string = 'ABABC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABC');
addThis();

status = inSection(116);
pattern = /ab*c/i;
string = 'ABC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABC');
addThis();

status = inSection(117);
pattern = /ab*bc/i;
string = 'ABC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABC');
addThis();

status = inSection(118);
pattern = /ab*bc/i;
string = 'ABBC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABBC');
addThis();

status = inSection(119);
pattern = /ab*?bc/i;
string = 'ABBBBC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABBBBC');
addThis();

status = inSection(120);
pattern = /ab{0,}?bc/i;
string = 'ABBBBC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABBBBC');
addThis();

status = inSection(121);
pattern = /ab+?bc/i;
string = 'ABBC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABBC');
addThis();

status = inSection(122);
pattern = /ab+bc/i;
string = 'ABBBBC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABBBBC');
addThis();

status = inSection(123);
pattern = /ab{1,}?bc/i;
string = 'ABBBBC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABBBBC');
addThis();

status = inSection(124);
pattern = /ab{1,3}?bc/i;
string = 'ABBBBC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABBBBC');
addThis();

status = inSection(125);
pattern = /ab{3,4}?bc/i;
string = 'ABBBBC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABBBBC');
addThis();

status = inSection(126);
pattern = /ab??bc/i;
string = 'ABBC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABBC');
addThis();

status = inSection(127);
pattern = /ab??bc/i;
string = 'ABC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABC');
addThis();

status = inSection(128);
pattern = /ab{0,1}?bc/i;
string = 'ABC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABC');
addThis();

status = inSection(129);
pattern = /ab??c/i;
string = 'ABC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABC');
addThis();

status = inSection(130);
pattern = /ab{0,1}?c/i;
string = 'ABC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABC');
addThis();

status = inSection(131);
pattern = /^abc$/i;
string = 'ABC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABC');
addThis();

status = inSection(132);
pattern = /^abc/i;
string = 'ABCC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABC');
addThis();

status = inSection(133);
pattern = /abc$/i;
string = 'AABC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABC');
addThis();

status = inSection(134);
pattern = /^/i;
string = 'ABC';
actualmatch = string.match(pattern);
expectedmatch = Array('');
addThis();

status = inSection(135);
pattern = /$/i;
string = 'ABC';
actualmatch = string.match(pattern);
expectedmatch = Array('');
addThis();

status = inSection(136);
pattern = /a.c/i;
string = 'ABC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABC');
addThis();

status = inSection(137);
pattern = /a.c/i;
string = 'AXC';
actualmatch = string.match(pattern);
expectedmatch = Array('AXC');
addThis();

status = inSection(138);
pattern = /a.*?c/i;
string = 'AXYZC';
actualmatch = string.match(pattern);
expectedmatch = Array('AXYZC');
addThis();

status = inSection(139);
pattern = /a[bc]d/i;
string = 'ABD';
actualmatch = string.match(pattern);
expectedmatch = Array('ABD');
addThis();

status = inSection(140);
pattern = /a[b-d]e/i;
string = 'ACE';
actualmatch = string.match(pattern);
expectedmatch = Array('ACE');
addThis();

status = inSection(141);
pattern = /a[b-d]/i;
string = 'AAC';
actualmatch = string.match(pattern);
expectedmatch = Array('AC');
addThis();

status = inSection(142);
pattern = /a[-b]/i;
string = 'A-';
actualmatch = string.match(pattern);
expectedmatch = Array('A-');
addThis();

status = inSection(143);
pattern = /a[b-]/i;
string = 'A-';
actualmatch = string.match(pattern);
expectedmatch = Array('A-');
addThis();

status = inSection(144);
pattern = /a]/i;
string = 'A]';
actualmatch = string.match(pattern);
expectedmatch = Array('A]');
addThis();

/* Perl supports ] & ^] inside a [], ECMA does not
   status = inSection(145);
   pattern = /a[]]b/i;
   string = 'A]B';
   actualmatch = string.match(pattern);
   expectedmatch = Array('A]B');
   addThis();
*/

status = inSection(146);
pattern = /a[^bc]d/i;
string = 'AED';
actualmatch = string.match(pattern);
expectedmatch = Array('AED');
addThis();

status = inSection(147);
pattern = /a[^-b]c/i;
string = 'ADC';
actualmatch = string.match(pattern);
expectedmatch = Array('ADC');
addThis();

/* Perl supports ] & ^] inside a [], ECMA does not
   status = inSection(148);
   pattern = /a[^]b]c/i;
   string = 'ADC';
   actualmatch = string.match(pattern);
   expectedmatch = Array('ADC');
   addThis();
*/

status = inSection(149);
pattern = /ab|cd/i;
string = 'ABC';
actualmatch = string.match(pattern);
expectedmatch = Array('AB');
addThis();

status = inSection(150);
pattern = /ab|cd/i;
string = 'ABCD';
actualmatch = string.match(pattern);
expectedmatch = Array('AB');
addThis();

status = inSection(151);
pattern = /()ef/i;
string = 'DEF';
actualmatch = string.match(pattern);
expectedmatch = Array('EF', '');
addThis();

status = inSection(152);
pattern = /a\(b/i;
string = 'A(B';
actualmatch = string.match(pattern);
expectedmatch = Array('A(B');
addThis();

status = inSection(153);
pattern = /a\(*b/i;
string = 'AB';
actualmatch = string.match(pattern);
expectedmatch = Array('AB');
addThis();

status = inSection(154);
pattern = /a\(*b/i;
string = 'A((B';
actualmatch = string.match(pattern);
expectedmatch = Array('A((B');
addThis();

status = inSection(155);
pattern = /a\\b/i;
string = 'A\\B';
actualmatch = string.match(pattern);
expectedmatch = Array('A\\B');
addThis();

status = inSection(156);
pattern = /((a))/i;
string = 'ABC';
actualmatch = string.match(pattern);
expectedmatch = Array('A', 'A', 'A');
addThis();

status = inSection(157);
pattern = /(a)b(c)/i;
string = 'ABC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABC', 'A', 'C');
addThis();

status = inSection(158);
pattern = /a+b+c/i;
string = 'AABBABC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABC');
addThis();

status = inSection(159);
pattern = /a{1,}b{1,}c/i;
string = 'AABBABC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABC');
addThis();

status = inSection(160);
pattern = /a.+?c/i;
string = 'ABCABC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABC');
addThis();

status = inSection(161);
pattern = /a.*?c/i;
string = 'ABCABC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABC');
addThis();

status = inSection(162);
pattern = /a.{0,5}?c/i;
string = 'ABCABC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABC');
addThis();

status = inSection(163);
pattern = /(a+|b)*/i;
string = 'AB';
actualmatch = string.match(pattern);
expectedmatch = Array('AB', 'B');
addThis();

status = inSection(164);
pattern = /(a+|b){0,}/i;
string = 'AB';
actualmatch = string.match(pattern);
expectedmatch = Array('AB', 'B');
addThis();

status = inSection(165);
pattern = /(a+|b)+/i;
string = 'AB';
actualmatch = string.match(pattern);
expectedmatch = Array('AB', 'B');
addThis();

status = inSection(166);
pattern = /(a+|b){1,}/i;
string = 'AB';
actualmatch = string.match(pattern);
expectedmatch = Array('AB', 'B');
addThis();

status = inSection(167);
pattern = /(a+|b)?/i;
string = 'AB';
actualmatch = string.match(pattern);
expectedmatch = Array('A', 'A');
addThis();

status = inSection(168);
pattern = /(a+|b){0,1}/i;
string = 'AB';
actualmatch = string.match(pattern);
expectedmatch = Array('A', 'A');
addThis();

status = inSection(169);
pattern = /(a+|b){0,1}?/i;
string = 'AB';
actualmatch = string.match(pattern);
expectedmatch = Array('', undefined);
addThis();

status = inSection(170);
pattern = /[^ab]*/i;
string = 'CDE';
actualmatch = string.match(pattern);
expectedmatch = Array('CDE');
addThis();

status = inSection(171);
pattern = /([abc])*d/i;
string = 'ABBBCD';
actualmatch = string.match(pattern);
expectedmatch = Array('ABBBCD', 'C');
addThis();

status = inSection(172);
pattern = /([abc])*bcd/i;
string = 'ABCD';
actualmatch = string.match(pattern);
expectedmatch = Array('ABCD', 'A');
addThis();

status = inSection(173);
pattern = /a|b|c|d|e/i;
string = 'E';
actualmatch = string.match(pattern);
expectedmatch = Array('E');
addThis();

status = inSection(174);
pattern = /(a|b|c|d|e)f/i;
string = 'EF';
actualmatch = string.match(pattern);
expectedmatch = Array('EF', 'E');
addThis();

status = inSection(175);
pattern = /abcd*efg/i;
string = 'ABCDEFG';
actualmatch = string.match(pattern);
expectedmatch = Array('ABCDEFG');
addThis();

status = inSection(176);
pattern = /ab*/i;
string = 'XABYABBBZ';
actualmatch = string.match(pattern);
expectedmatch = Array('AB');
addThis();

status = inSection(177);
pattern = /ab*/i;
string = 'XAYABBBZ';
actualmatch = string.match(pattern);
expectedmatch = Array('A');
addThis();

status = inSection(178);
pattern = /(ab|cd)e/i;
string = 'ABCDE';
actualmatch = string.match(pattern);
expectedmatch = Array('CDE', 'CD');
addThis();

status = inSection(179);
pattern = /[abhgefdc]ij/i;
string = 'HIJ';
actualmatch = string.match(pattern);
expectedmatch = Array('HIJ');
addThis();

status = inSection(180);
pattern = /(abc|)ef/i;
string = 'ABCDEF';
actualmatch = string.match(pattern);
expectedmatch = Array('EF', '');
addThis();

status = inSection(181);
pattern = /(a|b)c*d/i;
string = 'ABCD';
actualmatch = string.match(pattern);
expectedmatch = Array('BCD', 'B');
addThis();

status = inSection(182);
pattern = /(ab|ab*)bc/i;
string = 'ABC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABC', 'A');
addThis();

status = inSection(183);
pattern = /a([bc]*)c*/i;
string = 'ABC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABC', 'BC');
addThis();

status = inSection(184);
pattern = /a([bc]*)(c*d)/i;
string = 'ABCD';
actualmatch = string.match(pattern);
expectedmatch = Array('ABCD', 'BC', 'D');
addThis();

status = inSection(185);
pattern = /a([bc]+)(c*d)/i;
string = 'ABCD';
actualmatch = string.match(pattern);
expectedmatch = Array('ABCD', 'BC', 'D');
addThis();

status = inSection(186);
pattern = /a([bc]*)(c+d)/i;
string = 'ABCD';
actualmatch = string.match(pattern);
expectedmatch = Array('ABCD', 'B', 'CD');
addThis();

status = inSection(187);
pattern = /a[bcd]*dcdcde/i;
string = 'ADCDCDE';
actualmatch = string.match(pattern);
expectedmatch = Array('ADCDCDE');
addThis();

status = inSection(188);
pattern = /(ab|a)b*c/i;
string = 'ABC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABC', 'AB');
addThis();

status = inSection(189);
pattern = /((a)(b)c)(d)/i;
string = 'ABCD';
actualmatch = string.match(pattern);
expectedmatch = Array('ABCD', 'ABC', 'A', 'B', 'D');
addThis();

status = inSection(190);
pattern = /[a-zA-Z_][a-zA-Z0-9_]*/i;
string = 'ALPHA';
actualmatch = string.match(pattern);
expectedmatch = Array('ALPHA');
addThis();

status = inSection(191);
pattern = /^a(bc+|b[eh])g|.h$/i;
string = 'ABH';
actualmatch = string.match(pattern);
expectedmatch = Array('BH', undefined);
addThis();

status = inSection(192);
pattern = /(bc+d$|ef*g.|h?i(j|k))/i;
string = 'EFFGZ';
actualmatch = string.match(pattern);
expectedmatch = Array('EFFGZ', 'EFFGZ', undefined);
addThis();

status = inSection(193);
pattern = /(bc+d$|ef*g.|h?i(j|k))/i;
string = 'IJ';
actualmatch = string.match(pattern);
expectedmatch = Array('IJ', 'IJ', 'J');
addThis();

status = inSection(194);
pattern = /(bc+d$|ef*g.|h?i(j|k))/i;
string = 'REFFGZ';
actualmatch = string.match(pattern);
expectedmatch = Array('EFFGZ', 'EFFGZ', undefined);
addThis();

status = inSection(195);
pattern = /((((((((((a))))))))))/i;
string = 'A';
actualmatch = string.match(pattern);
expectedmatch = Array('A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A');
addThis();

status = inSection(196);
pattern = /((((((((((a))))))))))\10/i;
string = 'AA';
actualmatch = string.match(pattern);
expectedmatch = Array('AA', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A');
addThis();

status = inSection(197);
pattern = /((((((((((a))))))))))/i;
string = 'A!';
actualmatch = string.match(pattern);
expectedmatch = Array('A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A');
addThis();

status = inSection(198);
pattern = /(((((((((a)))))))))/i;
string = 'A';
actualmatch = string.match(pattern);
expectedmatch = Array('A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A');
addThis();

status = inSection(199);
pattern = /(?:(?:(?:(?:(?:(?:(?:(?:(?:(a))))))))))/i;
string = 'A';
actualmatch = string.match(pattern);
expectedmatch = Array('A', 'A');
addThis();

status = inSection(200);
pattern = /(?:(?:(?:(?:(?:(?:(?:(?:(?:(a|b|c))))))))))/i;
string = 'C';
actualmatch = string.match(pattern);
expectedmatch = Array('C', 'C');
addThis();

status = inSection(201);
pattern = /(.*)c(.*)/i;
string = 'ABCDE';
actualmatch = string.match(pattern);
expectedmatch = Array('ABCDE', 'AB', 'DE');
addThis();

status = inSection(202);
pattern = /abcd/i;
string = 'ABCD';
actualmatch = string.match(pattern);
expectedmatch = Array('ABCD');
addThis();

status = inSection(203);
pattern = /a(bc)d/i;
string = 'ABCD';
actualmatch = string.match(pattern);
expectedmatch = Array('ABCD', 'BC');
addThis();

status = inSection(204);
pattern = /a[-]?c/i;
string = 'AC';
actualmatch = string.match(pattern);
expectedmatch = Array('AC');
addThis();

status = inSection(205);
pattern = /(abc)\1/i;
string = 'ABCABC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABCABC', 'ABC');
addThis();

status = inSection(206);
pattern = /([a-c]*)\1/i;
string = 'ABCABC';
actualmatch = string.match(pattern);
expectedmatch = Array('ABCABC', 'ABC');
addThis();

status = inSection(207);
pattern = /a(?!b)./;
string = 'abad';
actualmatch = string.match(pattern);
expectedmatch = Array('ad');
addThis();

status = inSection(208);
pattern = /a(?=d)./;
string = 'abad';
actualmatch = string.match(pattern);
expectedmatch = Array('ad');
addThis();

status = inSection(209);
pattern = /a(?=c|d)./;
string = 'abad';
actualmatch = string.match(pattern);
expectedmatch = Array('ad');
addThis();

status = inSection(210);
pattern = /a(?:b|c|d)(.)/;
string = 'ace';
actualmatch = string.match(pattern);
expectedmatch = Array('ace', 'e');
addThis();

status = inSection(211);
pattern = /a(?:b|c|d)*(.)/;
string = 'ace';
actualmatch = string.match(pattern);
expectedmatch = Array('ace', 'e');
addThis();

status = inSection(212);
pattern = /a(?:b|c|d)+?(.)/;
string = 'ace';
actualmatch = string.match(pattern);
expectedmatch = Array('ace', 'e');
addThis();

status = inSection(213);
pattern = /a(?:b|c|d)+?(.)/;
string = 'acdbcdbe';
actualmatch = string.match(pattern);
expectedmatch = Array('acd', 'd');
addThis();

status = inSection(214);
pattern = /a(?:b|c|d)+(.)/;
string = 'acdbcdbe';
actualmatch = string.match(pattern);
expectedmatch = Array('acdbcdbe', 'e');
addThis();

status = inSection(215);
pattern = /a(?:b|c|d){2}(.)/;
string = 'acdbcdbe';
actualmatch = string.match(pattern);
expectedmatch = Array('acdb', 'b');
addThis();

status = inSection(216);
pattern = /a(?:b|c|d){4,5}(.)/;
string = 'acdbcdbe';
actualmatch = string.match(pattern);
expectedmatch = Array('acdbcdb', 'b');
addThis();

status = inSection(217);
pattern = /a(?:b|c|d){4,5}?(.)/;
string = 'acdbcdbe';
actualmatch = string.match(pattern);
expectedmatch = Array('acdbcd', 'd');
addThis();

// MODIFIED - ECMA has different rules for paren contents
status = inSection(218);
pattern = /((foo)|(bar))*/;
string = 'foobar';
actualmatch = string.match(pattern);
//expectedmatch = Array('foobar', 'bar', 'foo', 'bar');
expectedmatch = Array('foobar', 'bar', undefined, 'bar');
addThis();

status = inSection(219);
pattern = /a(?:b|c|d){6,7}(.)/;
string = 'acdbcdbe';
actualmatch = string.match(pattern);
expectedmatch = Array('acdbcdbe', 'e');
addThis();

status = inSection(220);
pattern = /a(?:b|c|d){6,7}?(.)/;
string = 'acdbcdbe';
actualmatch = string.match(pattern);
expectedmatch = Array('acdbcdbe', 'e');
addThis();

status = inSection(221);
pattern = /a(?:b|c|d){5,6}(.)/;
string = 'acdbcdbe';
actualmatch = string.match(pattern);
expectedmatch = Array('acdbcdbe', 'e');
addThis();

status = inSection(222);
pattern = /a(?:b|c|d){5,6}?(.)/;
string = 'acdbcdbe';
actualmatch = string.match(pattern);
expectedmatch = Array('acdbcdb', 'b');
addThis();

status = inSection(223);
pattern = /a(?:b|c|d){5,7}(.)/;
string = 'acdbcdbe';
actualmatch = string.match(pattern);
expectedmatch = Array('acdbcdbe', 'e');
addThis();

status = inSection(224);
pattern = /a(?:b|c|d){5,7}?(.)/;
string = 'acdbcdbe';
actualmatch = string.match(pattern);
expectedmatch = Array('acdbcdb', 'b');
addThis();

status = inSection(225);
pattern = /a(?:b|(c|e){1,2}?|d)+?(.)/;
string = 'ace';
actualmatch = string.match(pattern);
expectedmatch = Array('ace', 'c', 'e');
addThis();

status = inSection(226);
pattern = /^(.+)?B/;
string = 'AB';
actualmatch = string.match(pattern);
expectedmatch = Array('AB', 'A');
addThis();

/* MODIFIED - ECMA has different rules for paren contents */
status = inSection(227);
pattern = /^([^a-z])|(\^)$/;
string = '.';
actualmatch = string.match(pattern);
//expectedmatch = Array('.', '.', '');
expectedmatch = Array('.', '.', undefined);
addThis();

status = inSection(228);
pattern = /^[<>]&/;
string = '<&OUT';
actualmatch = string.match(pattern);
expectedmatch = Array('<&');
addThis();

/* Can't refer to a capture before it's encountered & completed
   status = inSection(229);
   pattern = /^(a\1?){4}$/;
   string = 'aaaaaaaaaa';
   actualmatch = string.match(pattern);
   expectedmatch = Array('aaaaaaaaaa', 'aaaa');
   addThis();

   status = inSection(230);
   pattern = /^(a(?(1)\1)){4}$/;
   string = 'aaaaaaaaaa';
   actualmatch = string.match(pattern);
   expectedmatch = Array('aaaaaaaaaa', 'aaaa');
   addThis();
*/

status = inSection(231);
pattern = /((a{4})+)/;
string = 'aaaaaaaaa';
actualmatch = string.match(pattern);
expectedmatch = Array('aaaaaaaa', 'aaaaaaaa', 'aaaa');
addThis();

status = inSection(232);
pattern = /(((aa){2})+)/;
string = 'aaaaaaaaaa';
actualmatch = string.match(pattern);
expectedmatch = Array('aaaaaaaa', 'aaaaaaaa', 'aaaa', 'aa');
addThis();

status = inSection(233);
pattern = /(((a{2}){2})+)/;
string = 'aaaaaaaaaa';
actualmatch = string.match(pattern);
expectedmatch = Array('aaaaaaaa', 'aaaaaaaa', 'aaaa', 'aa');
addThis();

status = inSection(234);
pattern = /(?:(f)(o)(o)|(b)(a)(r))*/;
string = 'foobar';
actualmatch = string.match(pattern);
//expectedmatch = Array('foobar', 'f', 'o', 'o', 'b', 'a', 'r');
expectedmatch = Array('foobar', undefined, undefined, undefined, 'b', 'a', 'r');
addThis();

/* ECMA supports (?: (?= and (?! but doesn't support (?< etc.
   status = inSection(235);
   pattern = /(?<=a)b/;
   string = 'ab';
   actualmatch = string.match(pattern);
   expectedmatch = Array('b');
   addThis();

   status = inSection(236);
   pattern = /(?<!c)b/;
   string = 'ab';
   actualmatch = string.match(pattern);
   expectedmatch = Array('b');
   addThis();

   status = inSection(237);
   pattern = /(?<!c)b/;
   string = 'b';
   actualmatch = string.match(pattern);
   expectedmatch = Array('b');
   addThis();

   status = inSection(238);
   pattern = /(?<!c)b/;
   string = 'b';
   actualmatch = string.match(pattern);
   expectedmatch = Array('b');
   addThis();
*/

status = inSection(239);
pattern = /(?:..)*a/;
string = 'aba';
actualmatch = string.match(pattern);
expectedmatch = Array('aba');
addThis();

status = inSection(240);
pattern = /(?:..)*?a/;
string = 'aba';
actualmatch = string.match(pattern);
expectedmatch = Array('a');
addThis();

/*
 * MODIFIED - ECMA has different rules for paren contents. Note
 * this regexp has two non-capturing parens, and one capturing
 *
 * The issue: shouldn't the match be ['ab', undefined]? Because the
 * '\1' matches the undefined value of the second iteration of the '*'
 * (in which the 'b' part of the '|' matches). But Perl wants ['ab','b'].
 *
 * Answer: waldemar@netscape.com:
 *
 * The correct answer is ['ab', undefined].  Perl doesn't match
 * ECMAScript here, and I'd say that Perl is wrong in this case.
 */
status = inSection(241);
pattern = /^(?:b|a(?=(.)))*\1/;
string = 'abc';
actualmatch = string.match(pattern);
//expectedmatch = Array('ab', 'b');
expectedmatch = Array('ab', undefined);
addThis();

status = inSection(242);
pattern = /^(){3,5}/;
string = 'abc';
actualmatch = string.match(pattern);
expectedmatch = Array('', '');
addThis();

status = inSection(243);
pattern = /^(a+)*ax/;
string = 'aax';
actualmatch = string.match(pattern);
expectedmatch = Array('aax', 'a');
addThis();

status = inSection(244);
pattern = /^((a|b)+)*ax/;
string = 'aax';
actualmatch = string.match(pattern);
expectedmatch = Array('aax', 'a', 'a');
addThis();

status = inSection(245);
pattern = /^((a|bc)+)*ax/;
string = 'aax';
actualmatch = string.match(pattern);
expectedmatch = Array('aax', 'a', 'a');
addThis();

/* MODIFIED - ECMA has different rules for paren contents */
status = inSection(246);
pattern = /(a|x)*ab/;
string = 'cab';
actualmatch = string.match(pattern);
//expectedmatch = Array('ab', '');
expectedmatch = Array('ab', undefined);
addThis();

status = inSection(247);
pattern = /(a)*ab/;
string = 'cab';
actualmatch = string.match(pattern);
expectedmatch = Array('ab', undefined);
addThis();

/* ECMA doesn't support (?imsx or (?-imsx
   status = inSection(248);
   pattern = /(?:(?i)a)b/;
   string = 'ab';
   actualmatch = string.match(pattern);
   expectedmatch = Array('ab');
   addThis();

   status = inSection(249);
   pattern = /((?i)a)b/;
   string = 'ab';
   actualmatch = string.match(pattern);
   expectedmatch = Array('ab', 'a');
   addThis();

   status = inSection(250);
   pattern = /(?:(?i)a)b/;
   string = 'Ab';
   actualmatch = string.match(pattern);
   expectedmatch = Array('Ab');
   addThis();

   status = inSection(251);
   pattern = /((?i)a)b/;
   string = 'Ab';
   actualmatch = string.match(pattern);
   expectedmatch = Array('Ab', 'A');
   addThis();

   status = inSection(252);
   pattern = /(?i:a)b/;
   string = 'ab';
   actualmatch = string.match(pattern);
   expectedmatch = Array('ab');
   addThis();

   status = inSection(253);
   pattern = /((?i:a))b/;
   string = 'ab';
   actualmatch = string.match(pattern);
   expectedmatch = Array('ab', 'a');
   addThis();

   status = inSection(254);
   pattern = /(?i:a)b/;
   string = 'Ab';
   actualmatch = string.match(pattern);
   expectedmatch = Array('Ab');
   addThis();

   status = inSection(255);
   pattern = /((?i:a))b/;
   string = 'Ab';
   actualmatch = string.match(pattern);
   expectedmatch = Array('Ab', 'A');
   addThis();

   status = inSection(256);
   pattern = /(?:(?-i)a)b/i;
   string = 'ab';
   actualmatch = string.match(pattern);
   expectedmatch = Array('ab');
   addThis();

   status = inSection(257);
   pattern = /((?-i)a)b/i;
   string = 'ab';
   actualmatch = string.match(pattern);
   expectedmatch = Array('ab', 'a');
   addThis();

   status = inSection(258);
   pattern = /(?:(?-i)a)b/i;
   string = 'aB';
   actualmatch = string.match(pattern);
   expectedmatch = Array('aB');
   addThis();

   status = inSection(259);
   pattern = /((?-i)a)b/i;
   string = 'aB';
   actualmatch = string.match(pattern);
   expectedmatch = Array('aB', 'a');
   addThis();

   status = inSection(260);
   pattern = /(?:(?-i)a)b/i;
   string = 'aB';
   actualmatch = string.match(pattern);
   expectedmatch = Array('aB');
   addThis();

   status = inSection(261);
   pattern = /((?-i)a)b/i;
   string = 'aB';
   actualmatch = string.match(pattern);
   expectedmatch = Array('aB', 'a');
   addThis();

   status = inSection(262);
   pattern = /(?-i:a)b/i;
   string = 'ab';
   actualmatch = string.match(pattern);
   expectedmatch = Array('ab');
   addThis();

   status = inSection(263);
   pattern = /((?-i:a))b/i;
   string = 'ab';
   actualmatch = string.match(pattern);
   expectedmatch = Array('ab', 'a');
   addThis();

   status = inSection(264);
   pattern = /(?-i:a)b/i;
   string = 'aB';
   actualmatch = string.match(pattern);
   expectedmatch = Array('aB');
   addThis();

   status = inSection(265);
   pattern = /((?-i:a))b/i;
   string = 'aB';
   actualmatch = string.match(pattern);
   expectedmatch = Array('aB', 'a');
   addThis();

   status = inSection(266);
   pattern = /(?-i:a)b/i;
   string = 'aB';
   actualmatch = string.match(pattern);
   expectedmatch = Array('aB');
   addThis();

   status = inSection(267);
   pattern = /((?-i:a))b/i;
   string = 'aB';
   actualmatch = string.match(pattern);
   expectedmatch = Array('aB', 'a');
   addThis();

   status = inSection(268);
   pattern = /((?s-i:a.))b/i;
   string = 'a\nB';
   actualmatch = string.match(pattern);
   expectedmatch = Array('a\nB', 'a\n');
   addThis();
*/

status = inSection(269);
pattern = /(?:c|d)(?:)(?:a(?:)(?:b)(?:b(?:))(?:b(?:)(?:b)))/;
string = 'cabbbb';
actualmatch = string.match(pattern);
expectedmatch = Array('cabbbb');
addThis();

status = inSection(270);
pattern = /(?:c|d)(?:)(?:aaaaaaaa(?:)(?:bbbbbbbb)(?:bbbbbbbb(?:))(?:bbbbbbbb(?:)(?:bbbbbbbb)))/;
string = 'caaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
actualmatch = string.match(pattern);
expectedmatch = Array('caaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
addThis();

status = inSection(271);
pattern = /(ab)\d\1/i;
string = 'Ab4ab';
actualmatch = string.match(pattern);
expectedmatch = Array('Ab4ab', 'Ab');
addThis();

status = inSection(272);
pattern = /(ab)\d\1/i;
string = 'ab4Ab';
actualmatch = string.match(pattern);
expectedmatch = Array('ab4Ab', 'ab');
addThis();

status = inSection(273);
pattern = /foo\w*\d{4}baz/;
string = 'foobar1234baz';
actualmatch = string.match(pattern);
expectedmatch = Array('foobar1234baz');
addThis();

status = inSection(274);
pattern = /x(~~)*(?:(?:F)?)?/;
string = 'x~~';
actualmatch = string.match(pattern);
expectedmatch = Array('x~~', '~~');
addThis();

/* Perl supports (?# but JS doesn't
   status = inSection(275);
   pattern = /^a(?#xxx){3}c/;
   string = 'aaac';
   actualmatch = string.match(pattern);
   expectedmatch = Array('aaac');
   addThis();
*/

/* ECMA doesn't support (?< etc
   status = inSection(276);
   pattern = /(?<![cd])[ab]/;
   string = 'dbaacb';
   actualmatch = string.match(pattern);
   expectedmatch = Array('a');
   addThis();

   status = inSection(277);
   pattern = /(?<!(c|d))[ab]/;
   string = 'dbaacb';
   actualmatch = string.match(pattern);
   expectedmatch = Array('a');
   addThis();

   status = inSection(278);
   pattern = /(?<!cd)[ab]/;
   string = 'cdaccb';
   actualmatch = string.match(pattern);
   expectedmatch = Array('b');
   addThis();

   status = inSection(279);
   pattern = /((?s)^a(.))((?m)^b$)/;
   string = 'a\nb\nc\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('a\nb', 'a\n', '\n', 'b');
   addThis();

   status = inSection(280);
   pattern = /((?m)^b$)/;
   string = 'a\nb\nc\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('b', 'b');
   addThis();

   status = inSection(281);
   pattern = /(?m)^b/;
   string = 'a\nb\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('b');
   addThis();

   status = inSection(282);
   pattern = /(?m)^(b)/;
   string = 'a\nb\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('b', 'b');
   addThis();

   status = inSection(283);
   pattern = /((?m)^b)/;
   string = 'a\nb\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('b', 'b');
   addThis();

   status = inSection(284);
   pattern = /\n((?m)^b)/;
   string = 'a\nb\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('\nb', 'b');
   addThis();

   status = inSection(285);
   pattern = /((?s).)c(?!.)/;
   string = 'a\nb\nc\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('\nc', '\n');
   addThis();

   status = inSection(286);
   pattern = /((?s).)c(?!.)/;
   string = 'a\nb\nc\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('\nc', '\n');
   addThis();

   status = inSection(287);
   pattern = /((?s)b.)c(?!.)/;
   string = 'a\nb\nc\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('b\nc', 'b\n');
   addThis();

   status = inSection(288);
   pattern = /((?s)b.)c(?!.)/;
   string = 'a\nb\nc\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('b\nc', 'b\n');
   addThis();

   status = inSection(289);
   pattern = /((?m)^b)/;
   string = 'a\nb\nc\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('b', 'b');
   addThis();
*/

/* ECMA doesn't support (?(condition)
   status = inSection(290);
   pattern = /(?(1)b|a)/;
   string = 'a';
   actualmatch = string.match(pattern);
   expectedmatch = Array('a');
   addThis();

   status = inSection(291);
   pattern = /(x)?(?(1)b|a)/;
   string = 'a';
   actualmatch = string.match(pattern);
   expectedmatch = Array('a');
   addThis();

   status = inSection(292);
   pattern = /()?(?(1)b|a)/;
   string = 'a';
   actualmatch = string.match(pattern);
   expectedmatch = Array('a');
   addThis();

   status = inSection(293);
   pattern = /()?(?(1)a|b)/;
   string = 'a';
   actualmatch = string.match(pattern);
   expectedmatch = Array('a');
   addThis();

   status = inSection(294);
   pattern = /^(\()?blah(?(1)(\)))$/;
   string = '(blah)';
   actualmatch = string.match(pattern);
   expectedmatch = Array('(blah)', '(', ')');
   addThis();

   status = inSection(295);
   pattern = /^(\()?blah(?(1)(\)))$/;
   string = 'blah';
   actualmatch = string.match(pattern);
   expectedmatch = Array('blah');
   addThis();

   status = inSection(296);
   pattern = /^(\(+)?blah(?(1)(\)))$/;
   string = '(blah)';
   actualmatch = string.match(pattern);
   expectedmatch = Array('(blah)', '(', ')');
   addThis();

   status = inSection(297);
   pattern = /^(\(+)?blah(?(1)(\)))$/;
   string = 'blah';
   actualmatch = string.match(pattern);
   expectedmatch = Array('blah');
   addThis();

   status = inSection(298);
   pattern = /(?(?!a)b|a)/;
   string = 'a';
   actualmatch = string.match(pattern);
   expectedmatch = Array('a');
   addThis();

   status = inSection(299);
   pattern = /(?(?=a)a|b)/;
   string = 'a';
   actualmatch = string.match(pattern);
   expectedmatch = Array('a');
   addThis();
*/

status = inSection(300);
pattern = /(?=(a+?))(\1ab)/;
string = 'aaab';
actualmatch = string.match(pattern);
expectedmatch = Array('aab', 'a', 'aab');
addThis();

status = inSection(301);
pattern = /(\w+:)+/;
string = 'one:';
actualmatch = string.match(pattern);
expectedmatch = Array('one:', 'one:');
addThis();

/* ECMA doesn't support (?< etc
   status = inSection(302);
   pattern = /$(?<=^(a))/;
   string = 'a';
   actualmatch = string.match(pattern);
   expectedmatch = Array('', 'a');
   addThis();
*/

status = inSection(303);
pattern = /(?=(a+?))(\1ab)/;
string = 'aaab';
actualmatch = string.match(pattern);
expectedmatch = Array('aab', 'a', 'aab');
addThis();

/* MODIFIED - ECMA has different rules for paren contents */
status = inSection(304);
pattern = /([\w:]+::)?(\w+)$/;
string = 'abcd';
actualmatch = string.match(pattern);
//expectedmatch = Array('abcd', '', 'abcd');
expectedmatch = Array('abcd', undefined, 'abcd');
addThis();

status = inSection(305);
pattern = /([\w:]+::)?(\w+)$/;
string = 'xy:z:::abcd';
actualmatch = string.match(pattern);
expectedmatch = Array('xy:z:::abcd', 'xy:z:::', 'abcd');
addThis();

status = inSection(306);
pattern = /^[^bcd]*(c+)/;
string = 'aexycd';
actualmatch = string.match(pattern);
expectedmatch = Array('aexyc', 'c');
addThis();

status = inSection(307);
pattern = /(a*)b+/;
string = 'caab';
actualmatch = string.match(pattern);
expectedmatch = Array('aab', 'aa');
addThis();

/* MODIFIED - ECMA has different rules for paren contents */
status = inSection(308);
pattern = /([\w:]+::)?(\w+)$/;
string = 'abcd';
actualmatch = string.match(pattern);
//expectedmatch = Array('abcd', '', 'abcd');
expectedmatch = Array('abcd', undefined, 'abcd');
addThis();

status = inSection(309);
pattern = /([\w:]+::)?(\w+)$/;
string = 'xy:z:::abcd';
actualmatch = string.match(pattern);
expectedmatch = Array('xy:z:::abcd', 'xy:z:::', 'abcd');
addThis();

status = inSection(310);
pattern = /^[^bcd]*(c+)/;
string = 'aexycd';
actualmatch = string.match(pattern);
expectedmatch = Array('aexyc', 'c');
addThis();

/* ECMA doesn't support (?>
   status = inSection(311);
   pattern = /(?>a+)b/;
   string = 'aaab';
   actualmatch = string.match(pattern);
   expectedmatch = Array('aaab');
   addThis();
*/

status = inSection(312);
pattern = /([[:]+)/;
	    string = 'a:[b]:';
	    actualmatch = string.match(pattern);
	    expectedmatch = Array(':[', ':[');
	    addThis();

	    status = inSection(313);
	    pattern = /([[=]+)/;
			string = 'a=[b]=';
			actualmatch = string.match(pattern);
			expectedmatch = Array('=[', '=[');
			addThis();

			status = inSection(314);
			pattern = /([[.]+)/;
				    string = 'a.[b].';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('.[', '.[');
				    addThis();

/* ECMA doesn't have rules for [:
   status = inSection(315);
   pattern = /[a[:]b[:c]/;
   string = 'abc';
   actualmatch = string.match(pattern);
   expectedmatch = Array('abc');
   addThis();
*/

/* ECMA doesn't support (?>
   status = inSection(316);
   pattern = /((?>a+)b)/;
   string = 'aaab';
   actualmatch = string.match(pattern);
   expectedmatch = Array('aaab', 'aaab');
   addThis();

   status = inSection(317);
   pattern = /(?>(a+))b/;
   string = 'aaab';
   actualmatch = string.match(pattern);
   expectedmatch = Array('aaab', 'aaa');
   addThis();

   status = inSection(318);
   pattern = /((?>[^()]+)|\([^()]*\))+/;
   string = '((abc(ade)ufh()()x';
   actualmatch = string.match(pattern);
   expectedmatch = Array('abc(ade)ufh()()x', 'x');
   addThis();
*/

/* Perl has \Z has end-of-line, ECMA doesn't
   status = inSection(319);
   pattern = /\Z/;
   string = 'a\nb\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('');
   addThis();

   status = inSection(320);
   pattern = /\z/;
   string = 'a\nb\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('');
   addThis();
*/

				    status = inSection(321);
				    pattern = /$/;
				    string = 'a\nb\n';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('');
				    addThis();

/* Perl has \Z has end-of-line, ECMA doesn't
   status = inSection(322);
   pattern = /\Z/;
   string = 'b\na\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('');
   addThis();

   status = inSection(323);
   pattern = /\z/;
   string = 'b\na\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('');
   addThis();
*/

				    status = inSection(324);
				    pattern = /$/;
				    string = 'b\na\n';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('');
				    addThis();

/* Perl has \Z has end-of-line, ECMA doesn't
   status = inSection(325);
   pattern = /\Z/;
   string = 'b\na';
   actualmatch = string.match(pattern);
   expectedmatch = Array('');
   addThis();

   status = inSection(326);
   pattern = /\z/;
   string = 'b\na';
   actualmatch = string.match(pattern);
   expectedmatch = Array('');
   addThis();
*/

				    status = inSection(327);
				    pattern = /$/;
				    string = 'b\na';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('');
				    addThis();

/* Perl has \Z has end-of-line, ECMA doesn't
   status = inSection(328);
   pattern = /\Z/m;
   string = 'a\nb\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('');
   addThis();

   status = inSection(329);
   pattern = /\z/m;
   string = 'a\nb\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('');
   addThis();
*/

				    status = inSection(330);
				    pattern = /$/m;
				    string = 'a\nb\n';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('');
				    addThis();

/* Perl has \Z has end-of-line, ECMA doesn't
   status = inSection(331);
   pattern = /\Z/m;
   string = 'b\na\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('');
   addThis();

   status = inSection(332);
   pattern = /\z/m;
   string = 'b\na\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('');
   addThis();
*/

				    status = inSection(333);
				    pattern = /$/m;
				    string = 'b\na\n';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('');
				    addThis();

/* Perl has \Z has end-of-line, ECMA doesn't
   status = inSection(334);
   pattern = /\Z/m;
   string = 'b\na';
   actualmatch = string.match(pattern);
   expectedmatch = Array('');
   addThis();

   status = inSection(335);
   pattern = /\z/m;
   string = 'b\na';
   actualmatch = string.match(pattern);
   expectedmatch = Array('');
   addThis();
*/

				    status = inSection(336);
				    pattern = /$/m;
				    string = 'b\na';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('');
				    addThis();

/* Perl has \Z has end-of-line, ECMA doesn't
   status = inSection(337);
   pattern = /a\Z/;
   string = 'b\na\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('a');
   addThis();
*/

/* $ only matches end of input unless multiline
   status = inSection(338);
   pattern = /a$/;
   string = 'b\na\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('a');
   addThis();
*/

/* Perl has \Z has end-of-line, ECMA doesn't
   status = inSection(339);
   pattern = /a\Z/;
   string = 'b\na';
   actualmatch = string.match(pattern);
   expectedmatch = Array('a');
   addThis();

   status = inSection(340);
   pattern = /a\z/;
   string = 'b\na';
   actualmatch = string.match(pattern);
   expectedmatch = Array('a');
   addThis();
*/

				    status = inSection(341);
				    pattern = /a$/;
				    string = 'b\na';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('a');
				    addThis();

				    status = inSection(342);
				    pattern = /a$/m;
				    string = 'a\nb\n';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('a');
				    addThis();

/* Perl has \Z has end-of-line, ECMA doesn't
   status = inSection(343);
   pattern = /a\Z/m;
   string = 'b\na\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('a');
   addThis();
*/

				    status = inSection(344);
				    pattern = /a$/m;
				    string = 'b\na\n';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('a');
				    addThis();

/* Perl has \Z has end-of-line, ECMA doesn't
   status = inSection(345);
   pattern = /a\Z/m;
   string = 'b\na';
   actualmatch = string.match(pattern);
   expectedmatch = Array('a');
   addThis();

   status = inSection(346);
   pattern = /a\z/m;
   string = 'b\na';
   actualmatch = string.match(pattern);
   expectedmatch = Array('a');
   addThis();
*/

				    status = inSection(347);
				    pattern = /a$/m;
				    string = 'b\na';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('a');
				    addThis();

/* Perl has \Z has end-of-line, ECMA doesn't
   status = inSection(348);
   pattern = /aa\Z/;
   string = 'b\naa\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('aa');
   addThis();
*/

/* $ only matches end of input unless multiline
   status = inSection(349);
   pattern = /aa$/;
   string = 'b\naa\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('aa');
   addThis();
*/

/* Perl has \Z has end-of-line, ECMA doesn't
   status = inSection(350);
   pattern = /aa\Z/;
   string = 'b\naa';
   actualmatch = string.match(pattern);
   expectedmatch = Array('aa');
   addThis();

   status = inSection(351);
   pattern = /aa\z/;
   string = 'b\naa';
   actualmatch = string.match(pattern);
   expectedmatch = Array('aa');
   addThis();
*/

				    status = inSection(352);
				    pattern = /aa$/;
				    string = 'b\naa';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('aa');
				    addThis();

				    status = inSection(353);
				    pattern = /aa$/m;
				    string = 'aa\nb\n';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('aa');
				    addThis();

/* Perl has \Z has end-of-line, ECMA doesn't
   status = inSection(354);
   pattern = /aa\Z/m;
   string = 'b\naa\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('aa');
   addThis();
*/

				    status = inSection(355);
				    pattern = /aa$/m;
				    string = 'b\naa\n';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('aa');
				    addThis();

/* Perl has \Z has end-of-line, ECMA doesn't
   status = inSection(356);
   pattern = /aa\Z/m;
   string = 'b\naa';
   actualmatch = string.match(pattern);
   expectedmatch = Array('aa');
   addThis();

   status = inSection(357);
   pattern = /aa\z/m;
   string = 'b\naa';
   actualmatch = string.match(pattern);
   expectedmatch = Array('aa');
   addThis();
*/

				    status = inSection(358);
				    pattern = /aa$/m;
				    string = 'b\naa';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('aa');
				    addThis();

/* Perl has \Z has end-of-line, ECMA doesn't
   status = inSection(359);
   pattern = /ab\Z/;
   string = 'b\nab\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('ab');
   addThis();
*/

/* $ only matches end of input unless multiline
   status = inSection(360);
   pattern = /ab$/;
   string = 'b\nab\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('ab');
   addThis();
*/

/* Perl has \Z has end-of-line, ECMA doesn't
   status = inSection(361);
   pattern = /ab\Z/;
   string = 'b\nab';
   actualmatch = string.match(pattern);
   expectedmatch = Array('ab');
   addThis();

   status = inSection(362);
   pattern = /ab\z/;
   string = 'b\nab';
   actualmatch = string.match(pattern);
   expectedmatch = Array('ab');
   addThis();
*/

				    status = inSection(363);
				    pattern = /ab$/;
				    string = 'b\nab';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('ab');
				    addThis();

				    status = inSection(364);
				    pattern = /ab$/m;
				    string = 'ab\nb\n';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('ab');
				    addThis();

/* Perl has \Z has end-of-line, ECMA doesn't
   status = inSection(365);
   pattern = /ab\Z/m;
   string = 'b\nab\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('ab');
   addThis();
*/

				    status = inSection(366);
				    pattern = /ab$/m;
				    string = 'b\nab\n';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('ab');
				    addThis();

/* Perl has \Z has end-of-line, ECMA doesn't
   status = inSection(367);
   pattern = /ab\Z/m;
   string = 'b\nab';
   actualmatch = string.match(pattern);
   expectedmatch = Array('ab');
   addThis();

   status = inSection(368);
   pattern = /ab\z/m;
   string = 'b\nab';
   actualmatch = string.match(pattern);
   expectedmatch = Array('ab');
   addThis();
*/

				    status = inSection(369);
				    pattern = /ab$/m;
				    string = 'b\nab';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('ab');
				    addThis();

/* Perl has \Z has end-of-line, ECMA doesn't
   status = inSection(370);
   pattern = /abb\Z/;
   string = 'b\nabb\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('abb');
   addThis();
*/

/* $ only matches end of input unless multiline
   status = inSection(371);
   pattern = /abb$/;
   string = 'b\nabb\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('abb');
   addThis();
*/

/* Perl has \Z has end-of-line, ECMA doesn't
   status = inSection(372);
   pattern = /abb\Z/;
   string = 'b\nabb';
   actualmatch = string.match(pattern);
   expectedmatch = Array('abb');
   addThis();

   status = inSection(373);
   pattern = /abb\z/;
   string = 'b\nabb';
   actualmatch = string.match(pattern);
   expectedmatch = Array('abb');
   addThis();
*/

				    status = inSection(374);
				    pattern = /abb$/;
				    string = 'b\nabb';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('abb');
				    addThis();

				    status = inSection(375);
				    pattern = /abb$/m;
				    string = 'abb\nb\n';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('abb');
				    addThis();

/* Perl has \Z has end-of-line, ECMA doesn't
   status = inSection(376);
   pattern = /abb\Z/m;
   string = 'b\nabb\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('abb');
   addThis();
*/

				    status = inSection(377);
				    pattern = /abb$/m;
				    string = 'b\nabb\n';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('abb');
				    addThis();

/* Perl has \Z has end-of-line, ECMA doesn't
   status = inSection(378);
   pattern = /abb\Z/m;
   string = 'b\nabb';
   actualmatch = string.match(pattern);
   expectedmatch = Array('abb');
   addThis();

   status = inSection(379);
   pattern = /abb\z/m;
   string = 'b\nabb';
   actualmatch = string.match(pattern);
   expectedmatch = Array('abb');
   addThis();
*/

				    status = inSection(380);
				    pattern = /abb$/m;
				    string = 'b\nabb';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('abb');
				    addThis();

				    status = inSection(381);
				    pattern = /(^|x)(c)/;
				    string = 'ca';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('c', '', 'c');
				    addThis();

				    status = inSection(382);
				    pattern = /foo.bart/;
				    string = 'foo.bart';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('foo.bart');
				    addThis();

				    status = inSection(383);
				    pattern = /^d[x][x][x]/m;
				    string = 'abcd\ndxxx';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('dxxx');
				    addThis();

				    status = inSection(384);
				    pattern = /tt+$/;
				    string = 'xxxtt';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('tt');
				    addThis();

/* ECMA spec says that each atom in a range must be a single character
   status = inSection(385);
   pattern = /([a-\d]+)/;
   string = 'za-9z';
   actualmatch = string.match(pattern);
   expectedmatch = Array('9', '9');
   addThis();

   status = inSection(386);
   pattern = /([\d-z]+)/;
   string = 'a0-za';
   actualmatch = string.match(pattern);
   expectedmatch = Array('0-z', '0-z');
   addThis();
*/

/* ECMA doesn't support [:
   status = inSection(387);
   pattern = /([a-[:digit:]]+)/;
   string = 'za-9z';
   actualmatch = string.match(pattern);
   expectedmatch = Array('a-9', 'a-9');
   addThis();

   status = inSection(388);
   pattern = /([[:digit:]-z]+)/;
   string = '=0-z=';
   actualmatch = string.match(pattern);
   expectedmatch = Array('0-z', '0-z');
   addThis();

   status = inSection(389);
   pattern = /([[:digit:]-[:alpha:]]+)/;
   string = '=0-z=';
   actualmatch = string.match(pattern);
   expectedmatch = Array('0-z', '0-z');
   addThis();
*/

				    status = inSection(390);
				    pattern = /(\d+\.\d+)/;
				    string = '3.1415926';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('3.1415926', '3.1415926');
				    addThis();

				    status = inSection(391);
				    pattern = /\.c(pp|xx|c)?$/i;
				    string = 'IO.c';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('.c', undefined);
				    addThis();

				    status = inSection(392);
				    pattern = /(\.c(pp|xx|c)?$)/i;
				    string = 'IO.c';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('.c', '.c', undefined);
				    addThis();

				    status = inSection(393);
				    pattern = /(^|a)b/;
				    string = 'ab';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('ab', 'a');
				    addThis();

				    status = inSection(394);
				    pattern = /^([ab]*?)(b)?(c)$/;
				    string = 'abac';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('abac', 'aba', undefined, 'c');
				    addThis();

				    status = inSection(395);
				    pattern = /^(?:.,){2}c/i;
				    string = 'a,b,c';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('a,b,c');
				    addThis();

				    status = inSection(396);
				    pattern = /^(.,){2}c/i;
				    string = 'a,b,c';
				    actualmatch = string.match(pattern);
				    expectedmatch =  Array('a,b,c', 'b,');
				    addThis();

				    status = inSection(397);
				    pattern = /^(?:[^,]*,){2}c/;
				    string = 'a,b,c';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('a,b,c');
				    addThis();

				    status = inSection(398);
				    pattern = /^([^,]*,){2}c/;
				    string = 'a,b,c';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('a,b,c', 'b,');
				    addThis();

				    status = inSection(399);
				    pattern = /^([^,]*,){3}d/;
				    string = 'aaa,b,c,d';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('aaa,b,c,d', 'c,');
				    addThis();

				    status = inSection(400);
				    pattern = /^([^,]*,){3,}d/;
				    string = 'aaa,b,c,d';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('aaa,b,c,d', 'c,');
				    addThis();

				    status = inSection(401);
				    pattern = /^([^,]*,){0,3}d/;
				    string = 'aaa,b,c,d';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('aaa,b,c,d', 'c,');
				    addThis();

				    status = inSection(402);
				    pattern = /^([^,]{1,3},){3}d/i;
				    string = 'aaa,b,c,d';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('aaa,b,c,d', 'c,');
				    addThis();

				    status = inSection(403);
				    pattern = /^([^,]{1,3},){3,}d/;
				    string = 'aaa,b,c,d';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('aaa,b,c,d', 'c,');
				    addThis();

				    status = inSection(404);
				    pattern = /^([^,]{1,3},){0,3}d/;
				    string = 'aaa,b,c,d';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('aaa,b,c,d', 'c,');
				    addThis();

				    status = inSection(405);
				    pattern = /^([^,]{1,},){3}d/;
				    string = 'aaa,b,c,d';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('aaa,b,c,d', 'c,');
				    addThis();

				    status = inSection(406);
				    pattern = /^([^,]{1,},){3,}d/;
				    string = 'aaa,b,c,d';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('aaa,b,c,d', 'c,');
				    addThis();

				    status = inSection(407);
				    pattern = /^([^,]{1,},){0,3}d/;
				    string = 'aaa,b,c,d';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('aaa,b,c,d', 'c,');
				    addThis();

				    status = inSection(408);
				    pattern = /^([^,]{0,3},){3}d/i;
				    string = 'aaa,b,c,d';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('aaa,b,c,d', 'c,');
				    addThis();

				    status = inSection(409);
				    pattern = /^([^,]{0,3},){3,}d/;
				    string = 'aaa,b,c,d';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('aaa,b,c,d', 'c,');
				    addThis();

				    status = inSection(410);
				    pattern = /^([^,]{0,3},){0,3}d/;
				    string = 'aaa,b,c,d';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('aaa,b,c,d', 'c,');
				    addThis();

/* ECMA doesn't support \A
   status = inSection(411);
   pattern = /(?!\A)x/m;
   string = 'a\nxb\n';
   actualmatch = string.match(pattern);
   expectedmatch = Array('\n');
   addThis();
*/

				    status = inSection(412);
				    pattern = /^(a(b)?)+$/;
				    string = 'aba';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('aba', 'a', undefined);
				    addThis();

				    status = inSection(413);
				    pattern = /^(aa(bb)?)+$/;
				    string = 'aabbaa';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('aabbaa', 'aa', undefined);
				    addThis();

				    status = inSection(414);
				    pattern = /^.{9}abc.*\n/m;
				    string = '123\nabcabcabcabc\n';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('abcabcabcabc\n');
				    addThis();

				    status = inSection(415);
				    pattern = /^(a)?a$/;
				    string = 'a';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('a', undefined);
				    addThis();

				    status = inSection(416);
				    pattern = /^(a\1?)(a\1?)(a\2?)(a\3?)$/;
				    string = 'aaaaaa';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('aaaaaa', 'a', 'aa', 'a', 'aa');
				    addThis();

/* Can't refer to a capture before it's encountered & completed
   status = inSection(417);
   pattern = /^(a\1?){4}$/;
   string = 'aaaaaa';
   actualmatch = string.match(pattern);
   expectedmatch = Array('aaaaaa', 'aaa');
   addThis();
*/

				    status = inSection(418);
				    pattern = /^(0+)?(?:x(1))?/;
				    string = 'x1';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('x1', undefined, '1');
				    addThis();

				    status = inSection(419);
				    pattern = /^([0-9a-fA-F]+)(?:x([0-9a-fA-F]+)?)(?:x([0-9a-fA-F]+))?/;
				    string = '012cxx0190';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('012cxx0190', '012c', undefined, '0190');
				    addThis();

				    status = inSection(420);
				    pattern = /^(b+?|a){1,2}c/;
				    string = 'bbbac';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('bbbac', 'a');
				    addThis();

				    status = inSection(421);
				    pattern = /^(b+?|a){1,2}c/;
				    string = 'bbbbac';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('bbbbac', 'a');
				    addThis();

				    status = inSection(422);
				    pattern = /((?:aaaa|bbbb)cccc)?/;
				    string = 'aaaacccc';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('aaaacccc', 'aaaacccc');
				    addThis();

				    status = inSection(423);
				    pattern = /((?:aaaa|bbbb)cccc)?/;
				    string = 'bbbbcccc';
				    actualmatch = string.match(pattern);
				    expectedmatch = Array('bbbbcccc', 'bbbbcccc');
				    addThis();




//-----------------------------------------------------------------------------
				    test();
//-----------------------------------------------------------------------------



				    function addThis()
			  {
			    if(omitCurrentSection())
			      return;

			    statusmessages[i] = status;
			    patterns[i] = pattern;
			    strings[i] = string;
			    actualmatches[i] = actualmatch;
			    expectedmatches[i] = expectedmatch;
			    i++;
			  }


				    function omitCurrentSection()
			  {
			    try
			    {
			      // current section number is in global status variable
			      var n = status.match(/(\d+)/)[1];
			      return ((n < cnLBOUND) || (n > cnUBOUND));
			    }
			    catch(e)
			    {
			      return false;
			    }
			  }


				    function test()
			  {
			    printBugNumber(BUGNUMBER);
			    printStatus (summary);
			    testRegExp(statusmessages, patterns, strings, actualmatches, expectedmatches);
			  }
