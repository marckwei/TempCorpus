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
 * Date:    12 June 2003
 * SUMMARY: Testing complicated str.replace()
 *
 * See http://bugzilla.mozilla.org/show_bug.cgi?id=209067
 *
 */
//-----------------------------------------------------------------------------
var UBound = 0;
var BUGNUMBER = 209067;
var summary = 'Testing complicated str.replace()';
var status = '';
var statusitems = [];
var actual = '';
var actualvalues = [];
var expect= '';
var expectedvalues = [];


function formatHTML(h)
{
  // a replace function used in the succeeding lines -
  function S(s)
  {
    return s.replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  h+='\n';
  h=h.replace(/&([^\s]+;)/g,'&lt;&amp;$1&gt;');
  h=h.replace(new RegExp('<!-'+'-[\\s\\S]*-'+'->','g'), S);
  h=h.replace(/"[^"]*"/g,S);
  h=h.replace(/'[^']*'/g,S);


  h=h.replace(/<([^>]*)>/g,
              function(s,p)
              {
                if(s.match(/!doctype/i))
                  return'<span class=doctype>&lt;' + p + '&gt;</span>';

                p=p.replace(/\\'/g,'\\&#39;').replace(/\\"/g,'\\&#34;').replace(/^\s/,'');
p=p.replace(/(\s)([^<]+)$/g,
	    function(s,p1,p2)
	    {
	      p2=p2.replace(/(=)(\s*[^"'][^\s]*)(\s|$)/g,'$1<span class=attribute-value>$2</span>$3');
                              p2=p2.replace(/("[^"]*")/g,'<span class=attribute-value>$1</span>');
				 p2=p2.replace(/('[^']*')/g,'<span class=attribute-value>$1</span>');
                              return p1 + '<span class=attribute-name>'+p2+'</span>';
                            }
                           )

                return'&lt;<span class=' + (s.match(/<\s*\//)?'end-tag':'start-tag') + '>' + p + '</span>&gt;';
              }
             )


  h=h.replace(/&lt;(&[^\s]+;)&gt;/g,'<span class=entity>$1</span>');
  h=h.replace(/(&lt;!--[\s\S]*--&gt;)/g,'<span class=comment>$1</span>');


  numer=1;
  h=h.replace(/(.*\n)/g,
              function(s,p)
              {
                return (numer++) +'. ' + p;
              }
             )


  return'<span class=text>' + h + '</span>';
}



/*
 * sanity check
 */
status = inSection(1);
actual = formatHTML('abc');
expect = '<span class=text>1. abc\n</span>';
addThis();


/*
 * The real test: can we run this without crashing?
 * We are not validating the result, just running it.
 */
status = inSection(2);
var HUGE_TEST_STRING = hugeString();
formatHTML(HUGE_TEST_STRING);




//-----------------------------------------------------------------------------
test();
//-----------------------------------------------------------------------------



function addThis()
{
  statusitems[UBound] = status;
  actualvalues[UBound] = actual;
  expectedvalues[UBound] = expect;
  UBound++;
}


function test()
{
  printBugNumber(BUGNUMBER);
  printStatus(summary);

  for (var i=0; i<UBound; i++)
  {
    reportCompare(expectedvalues[i], actualvalues[i], statusitems[i]);
  }
}


function hugeString()
{
var s = '';

s += '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">';
s += '<html lang="en">';
s += '<head>';
s += '	<meta http-equiv="content-type" content="text/html; charset=iso-8859-1">';
s += '	<meta http-equiv="refresh" content="1800">';
s += '	<title>CNN.com</title>';
s += '	<link rel="Start" href="/">';
s += '	<link rel="Search" href="/search/">';
s += '	<link rel="stylesheet" href="http://i.cnn.net/cnn/.element/ssi/css/1.0/main.css" type="text/css">';
s += '	<script language="JavaScript1.2" src="http://i.cnn.net/cnn/.element/ssi/js/1.0/main.js" type="text/javascript"></script>';
s += '<script language="JavaScript1.1" src="http://ar.atwola.com/file/adsWrapper.js"></script>';
s += '<style type="text/css">';
s += '<!--';
s += '.aoltextad { text-align: justify; font-size: 12px; color: black; font-family: Georgia, sans-serif }';
s += '-->';
s += '</style>';
s += '<script language="JavaScript1.1" type="text/javascript" src="http://ar.atwola.com/file/adsPopup2.js"></script>';
s += '<script language="JavaScript">';
s += 'document.adoffset = 0;';
s += 'document.adPopupDomain = "www.cnn.com";';
s += 'document.adPopupFile = "/cnn_adspaces/adsPopup2.html";';
s += 'document.adPopupInterval = "P24";';
s += 'document.adPopunderInterval = "P24";';
s += 'adSetOther("&TVAR="+escape("class=us.low"));';
s += '</script>';
s += '';
s += '	';
s += '</head>';
s += '<body class="cnnMainPage">';
s += '';
s += '';
s += '';
s += '<a name="top_of_page"></a>';
s += '<a href="#ContentArea"><img src="http://i.cnn.net/cnn/images/1.gif" alt="Click here to skip to main content." width="10" height="1" border="0" align="right"></a>';
s += '<table width="770" border="0" cellpadding="0" cellspacing="0" style="speak: none">';
s += '	<col width="229">';
s += '	<col width="73">';
s += '	<col width="468">';
s += '	<tr>';
s += '		<td colspan="3"><!--';
s += '[[!~~ netscape hat ~~]][[table border="0" cellpadding="0" cellspacing="0" width="100%"]][[tr]][[td]][[script Language="Javascript" SRC="http://toolbar.aol.com/dashboard.twhat?dom=cnn" type="text/javascript"]][[/script]][[/td]][[/tr]][[/table]]';
s += '';
s += '[[div]][[img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="1" height="2" border="0"]][[/div]]';
s += '-->';
s += '		</td>';
s += '	</tr>';
s += '	<tr valign="bottom">';
s += '		<td width="229" style="speak: normal"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/logo/cnn.gif" alt="CNN.com" width="229" height="52" border="0"></td>';
s += '		<td width="73"></td>';
s += '		<td width="468" align="right">';
s += '			<!-- home/bottom.468x60 -->';
s += '<script language="JavaScript1.1">';
s += '<!--';
s += 'adSetTarget("_top");';
s += 'htmlAdWH( (new Array(93103287,93103287,93103300,93103300))[document.adoffset||0] , 468, 60);';
s += '//-->';
					       s += '</script>';
					       s += '<noscript><a href="http://ar.atwola.com/link/93103287/aol" target="_top"><img src="http://ar.atwola.com/image/93103287/aol" alt="Click Here" width="468" height="60" border="0"></a></noscript> ';
					       s += '';
					       s += '';
					       s += '';
					       s += '';
					       s += '		</td>';
					       s += '	</tr>';
					       s += '	<tr><td colspan="3"><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="1" height="2"></td></tr>';
					       s += '	<tr>';
					       s += '		<td colspan="3">';
					       s += '</td>';
					       s += '	</tr>';
					       s += '	<tr><td colspan="3" bgcolor="#CC0000"><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="1" height="3"></td></tr>';
					       s += '	<tr>';
					       s += '		<td colspan="3">';
					       s += '';
					       s += '<table width="770" border="0" cellpadding="0" cellspacing="0">';
					       s += '	<form action="http://search.cnn.com/cnn/search" method="get" onsubmit="return CNN_validateSearchForm(this);">';
					       s += '<input type="hidden" name="source" value="cnn">';
					       s += '<input type="hidden" name="invocationType" value="search/top">';
					       s += '	<tr><td colspan="4"><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="1" height="1" border="0"></td></tr>';
					       s += '	<tr><td colspan="4" bgcolor="#003366"><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="1" height="3" border="0"></td></tr>';
					       s += '	<tr>';
					       s += '		<td rowspan="2"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/searchbar/bar.search.gif" alt="SEARCH" width="110" height="27" border="0"></td>';
					       s += '		<td colspan="2"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/searchbar/bar.top.bevel.gif" alt="" width="653" height="3" border="0"></td>';
					       s += '		<td rowspan="2"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/searchbar/bar.right.bevel.gif" alt="" width="7" height="27" border="0"></td>';
					       s += '	</tr>';
					       s += '	<tr bgcolor="#B6D8E0">';
					       s += '		<td><table border="0" cellpadding="0" cellspacing="0">';
					       s += '				<tr>';
					       s += '					<td>&nbsp;&nbsp;</td>';
					       s += '					<td nowrap><span class="cnnFormTextB" style="color:#369">The Web</span></td>';
					       s += '					<td><input type="radio" name="sites" value="google" checked></td>';
					       s += '					<td>&nbsp;&nbsp;</td>';
					       s += '					<td><span class="cnnFormTextB" style="color:#369;">CNN.com</span></td>';
					       s += '					<td><input type="radio" name="sites" value="cnn"></td>';
					       s += '					<td>&nbsp;&nbsp;</td>';
					       s += '					<td><input type="text" name="query" class="cnnFormText" value="" title="Enter text to search for and click Search" size="35" maxlength="40" style="width: 280px"></td>';
					       s += '					<td>&nbsp;<input type="Submit" value="Search" class="cnnNavButton" style="padding: 0px; margin: 0px; width: 50px"></td>';
					       s += '				</tr>';
					       s += '			</table></td>';
					       s += '		<td align="right"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/searchbar/bar.google.gif" alt="enhanced by Google" width="137" height="24" border="0"></td>';
					       s += '	</tr>';
					       s += '	<tr><td colspan="4"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/searchbar/bar.bottom.bevel.gif" alt="" width="770" height="3" border="0"></td></tr>';
					       s += '	</form>';
					       s += '</table>';
					       s += '		</td>';
					       s += '	</tr>';
					       s += '';
					       s += '';
					       s += '</table>';
					       s += '';
					       s += '<table width="770" border="0" cellpadding="0" cellspacing="0">';
					       s += '	<col width="126" align="left" valign="top">';
					       s += '	<col width="10">';
					       s += '	<col width="280">';
					       s += '	<col width="10">';
					       s += '	<col width="344">';
					       s += '	<tr valign="top">';
					       s += '		<td rowspan="5" width="126" style="speak: none"><table id="cnnNavBar" width="126" bgcolor="#EEEEEE" border="0" cellpadding="0" cellspacing="0" summary="CNN.com Navigation">';
					       s += '	<col width="8" align="left" valign="top">';
					       s += '	<col width="118" align="left" valign="top">';
					       s += '	<tr bgcolor="#CCCCCC" class="cnnNavHiliteRow"><td width="8" class="swath">&nbsp;</td>';
					       s += '		<td class="cnnNavHilite" onClick="CNN_goTo("/")"><div class="cnnNavText"><a href="/">Home Page</a></div></td></tr>';
					       s += '	<tr class="cnnNavRow"><td class="swath">&nbsp;</td>';
					       s += '		<td class="cnnNav" onMouseOver="CNN_navBar(this,1,1)" onMouseOut="CNN_navBar(this,0,1)" onClick="CNN_navBarClick(this,1,"/WORLD/")"><div class="cnnNavText"><a href="/WORLD/">World</a></div></td></tr>';
					       s += '	<tr class="cnnNavRow"><td class="swath">&nbsp;</td>';
					       s += '		<td class="cnnNav" onMouseOver="CNN_navBar(this,1,1)" onMouseOut="CNN_navBar(this,0,1)" onClick="CNN_navBarClick(this,1,"/US/")"><div class="cnnNavText"><a href="/US/">U.S.</a></div></td></tr>';
					       s += '	<tr class="cnnNavRow"><td class="swath">&nbsp;</td>';
					       s += '		<td class="cnnNav" onMouseOver="CNN_navBar(this,1,1)" onMouseOut="CNN_navBar(this,0,1)" onClick="CNN_navBarClick(this,1,"/WEATHER/")"><div class="cnnNavText"><a href="/WEATHER/">Weather</a></div></td></tr>';
					       s += '	<tr class="cnnNavRow"><td class="swath">&nbsp;</td>';
					       s += '		<td class="cnnNav" onMouseOver="CNN_navBar(this,1,1)" onMouseOut="CNN_navBar(this,0,1)" onClick="CNN_navBarClick(this,1,"/money/")"><div class="cnnNavText"><a href="/money/">Business</a>&nbsp;<a href="/money/"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/nav_at_money.gif" alt="at CNN/Money" width="51" height="5" border="0"></a></div></td></tr>';
					       s += '	<tr class="cnnNavRow"><td class="swath">&nbsp;</td>';
					       s += '		<td class="cnnNav" onMouseOver="CNN_navBar(this,1,1)" onMouseOut="CNN_navBar(this,0,1)" onClick="CNN_navBarClick(this,1,"/cnnsi/")"><div class="cnnNavText"><a href="/si/">Sports</a>&nbsp;<a href="/si/"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/nav_at_si.gif" alt="at SI.com" width="50" height="5" border="0"></a></div></td></tr>';
					       s += '	<tr class="cnnNavRow"><td class="swath">&nbsp;</td>';
					       s += '		<td class="cnnNav" onMouseOver="CNN_navBar(this,1,1)" onMouseOut="CNN_navBar(this,0,1)" onClick="CNN_navBarClick(this,1,"/ALLPOLITICS/")"><div class="cnnNavText"><a href="/ALLPOLITICS/">Politics</a></div></td></tr>';
					       s += '	<tr class="cnnNavRow"><td class="swath">&nbsp;</td>';
					       s += '		<td class="cnnNav" onMouseOver="CNN_navBar(this,1,1)" onMouseOut="CNN_navBar(this,0,1)" onClick="CNN_navBarClick(this,1,"/LAW/")"><div class="cnnNavText"><a href="/LAW/">Law</a></div></td></tr>';
					       s += '	<tr class="cnnNavRow"><td class="swath">&nbsp;</td>';
					       s += '		<td class="cnnNav" onMouseOver="CNN_navBar(this,1,1)" onMouseOut="CNN_navBar(this,0,1)" onClick="CNN_navBarClick(this,1,"/TECH/")"><div class="cnnNavText"><a href="/TECH/">Technology</a></div></td></tr>';
					       s += '	<tr class="cnnNavRow"><td class="swath">&nbsp;</td>';
					       s += '		<td class="cnnNav" onMouseOver="CNN_navBar(this,1,1)" onMouseOut="CNN_navBar(this,0,1)" onClick="CNN_navBarClick(this,1,"/TECH/space/")"><div class="cnnNavText"><a href="/TECH/space/">Science &amp; Space</a></div></td></tr>';
					       s += '	<tr class="cnnNavRow"><td class="swath">&nbsp;</td>';
					       s += '		<td class="cnnNav" onMouseOver="CNN_navBar(this,1,1)" onMouseOut="CNN_navBar(this,0,1)" onClick="CNN_navBarClick(this,1,"/HEALTH/")"><div class="cnnNavText"><a href="/HEALTH/">Health</a></div></td></tr>';
					       s += '	<tr class="cnnNavRow"><td class="swath">&nbsp;</td>';
					       s += '		<td class="cnnNav" onMouseOver="CNN_navBar(this,1,1)" onMouseOut="CNN_navBar(this,0,1)" onClick="CNN_navBarClick(this,1,"/SHOWBIZ/")"><div class="cnnNavText"><a href="/SHOWBIZ/">Entertainment</a></div></td></tr>';
					       s += '	<tr class="cnnNavRow"><td class="swath">&nbsp;</td>';
					       s += '		<td class="cnnNav" onMouseOver="CNN_navBar(this,1,1)" onMouseOut="CNN_navBar(this,0,1)" onClick="CNN_navBarClick(this,1,"/TRAVEL/")"><div class="cnnNavText"><a href="/TRAVEL/">Travel</a></div></td></tr>';
					       s += '	<tr class="cnnNavRow"><td class="swath">&nbsp;</td>';
					       s += '		<td class="cnnNav" onMouseOver="CNN_navBar(this,1,1)" onMouseOut="CNN_navBar(this,0,1)" onClick="CNN_navBarClick(this,1,"/EDUCATION/")"><div class="cnnNavText"><a href="/EDUCATION/">Education</a></div></td></tr>';
					       s += '	<tr class="cnnNavRow"><td class="swath">&nbsp;</td>';
					       s += '		<td class="cnnNav" onMouseOver="CNN_navBar(this,1,1)" onMouseOut="CNN_navBar(this,0,1)" onClick="CNN_navBarClick(this,1,"/SPECIALS/")"><div class="cnnNavText"><a href="/SPECIALS/">Special Reports</a></div></td></tr>';
					       s += '	<tr bgcolor="#FFFFFF"><td class="cnnNavAd" colspan="2" align="center"><!-- home/left.120x90 -->';
					       s += '<script language="JavaScript1.1">';
					       s += '<!--';
					       s += 'adSetTarget("_top");';
					       s += 'htmlAdWH( (new Array(93166917,93166917,93170132,93170132))[document.adoffset||0] , 120, 90);';
					       s += '//-->';
					       s += '</script><noscript><a href="http://ar.atwola.com/link/93166917/aol" target="_top"><img src="http://ar.atwola.com/image/93166917/aol" alt="Click here for our advertiser" width="120" height="90" border="0"></a></noscript></td></tr>';
					       s += '	<tr bgcolor="#999999" class="cnnNavGroupRow">';
					       s += '		<td colspan="2" class="cnnNavGroup"><div class="cnnNavText">SERVICES</div></td></tr>';
					       s += '	<tr class="cnnNavOtherRow"><td class="swath">&nbsp;</td>';
					       s += '		<td class="cnnNavOther" onMouseOver="CNN_navBar(this,1,0)" onMouseOut="CNN_navBar(this,0,0)" onClick="CNN_navBarClick(this,0,"/video/")"><div class="cnnNavText"><a href="/video/">Video</a></div></td></tr>';
					       s += '	<tr class="cnnNavOtherRow"><td class="swath">&nbsp;</td>';
					       s += '		<td class="cnnNavOther" onMouseOver="CNN_navBar(this,1,0)" onMouseOut="CNN_navBar(this,0,0)" onClick="CNN_navBarClick(this,0,"/EMAIL/")"><div class="cnnNavText"><a href="/EMAIL/">E-Mail Services</a></div></td></tr>';
					       s += '	<tr class="cnnNavOtherRow"><td class="swath">&nbsp;</td>';
					       s += '		<td class="cnnNavOther" onMouseOver="CNN_navBar(this,1,0)" onMouseOut="CNN_navBar(this,0,0)" onClick="CNN_navBarClick(this,0,"/mobile/CNNtoGO/")"><div class="cnnNavText"><a href="/mobile/CNNtoGO/">CNN To Go</a></div></td></tr>';
					       s += '	<tr bgcolor="#999999" class="cnnNavGroupRow">';
					       s += '		<td colspan="2" class="cnnNavGroup" style="background-color: #445B60"><div class="cnnNavText" style="color: #fff">SEARCH</div></td></tr>';
					       s += '	<tr bgcolor="#CCCCCC"><td colspan="2" class="cnnNavSearch" style="background-color:#B6D8E0">';
					       s += '';
					       s += '<form action="http://search.cnn.com/cnn/search" method="get" name="nav_bottom_search" onSubmit="return CNN_validateSearchForm(this)" style="margin: 0px;">';
					       s += '	<input type="hidden" name="sites" value="cnn">';
					       s += '	<input type="hidden" name="source" value="cnn">';
					       s += '	<input type="hidden" name="invocationType" value="side/bottom">';
					       s += '<table width="100%" border="0" cellpadding="0" cellspacing="4">';
					       s += '	<tr><td colspan="2"><table width="100%" border="0" cellpadding="0" cellspacing="0">';
					       s += '			<tr>';
					       s += '				<td align="left"><span class="cnnFormTextB" style="color: #369">Web</span></td>';
					       s += '				<td><input type="radio" name="sites" value="google" checked></td>';
					       s += '				<td align="right"><span class="cnnFormTextB" style="color: #369">CNN.com</span></td>';
					       s += '				<td><input type="radio" name="sites" value="cnn"></td>';
					       s += '			</tr>';
					       s += '		</table></td></tr>';
					       s += '	<tr><td colspan="2"><input type="text" name="query" class="cnnFormText" value="" title="Enter text to search for and click Search" size="7" maxlength="40" style="width: 100%"></td></tr>';
					       s += '	<tr valign="top">';
					       s += '		<td><input type="submit" value="Search" class="cnnNavButton" style="padding: 0px; margin: 0px; width: 50px"></td>';
					       s += '		<td align="right"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/sect/SEARCH/nav.search.gif" alt="enhanced by Google" width="54" height="27"></td>';
					       s += '	</tr>';
					       s += '</table>';
					       s += '';
					       s += '';
					       s += '';
					       s += '</td></form></tr>';
					       s += '</table>';
					       s += '';
					       s += '		</td>';
					       s += '		<td rowspan="5" width="10"><a name="ContentArea"></a><img id="accessibilityPixel" src="http://i.cnn.net/cnn/images/1.gif" alt="" width="1" height="7" border="0"></td>';
					       s += '		<td colspan="3" valign="middle">';
					       s += '			<table border="0" cellpadding="0" cellspacing="0" width="100%">';
					       s += '				<tr>';
					       s += '					<td valign="top" nowrap><div class="cnnFinePrint" style="color: #333;padding:6px;padding-left:0px;">Updated: 05:53 p.m. EDT (2153 GMT) June 12, 2003</div></td>';
					       s += '					<td align="right" nowrap class="cnnt1link"><a href="http://edition.cnn.com/">Visit International Edition</a>&nbsp;</td>';
					       s += '				</tr><!--include virtual="/.element/ssi/sect/MAIN/1.0/banner.html"-->';
					       s += '			</table>';
					       s += '		</td>';
					       s += '	</tr>';
					       s += '	<tr valign="top">';
					       s += '		<td rowspan="2" width="280" bgcolor="#EAEFF4">';
					       s += '';
					       s += '<!-- T1 -->';
					       s += '					';
					       s += '					<a href="/2003/SHOWBIZ/Movies/06/12/obit.peck/index.html"><img src="http://i.cnn.net/cnn/2003/SHOWBIZ/Movies/06/12/obit.peck/top.peck.obit.jpg" alt="Oscar-winner Peck dies" width="280" height="210" border="0" hspace="0" vspace="0"></a>';
					       s += '';
					       s += '						<div class="cnnMainT1">';
					       s += '		<h2 style="font-size:20px;"><a href="/2003/SHOWBIZ/Movies/06/12/obit.peck/index.html">Oscar-winner Peck dies</a></h2>';
					       s += '<p>';
					       s += 'Actor Gregory Peck, who won an Oscar for his portrayal of upstanding lawyer Atticus Finch in 1962s "To Kill a Mockingbird," has died at age 87. Peck was best known for roles of dignified statesmen and people who followed a strong code of ethics. But he also could play against type. All told, Peck was nominated for five Academy Awards.';
					       s += '</p>';
					       s += '		<p>';
					       s += '			<b><a href="/2003/SHOWBIZ/Movies/06/12/obit.peck/index.html" class="cnnt1link">FULL STORY</a></b>';
					       s += '		</p>';
					       s += '';
					       s += '';
					       s += '';
					       s += '&#8226; <span class="cnnBodyText" style="font-weight:bold;color:#333;">Video: </span><img src="http://i.cnn.net/cnn/.element/img/1.0/misc/premium.gif" alt="premium content" width="9" height="11" hspace="0" vspace="0" border="0" align="absmiddle">  <a href="javascript:LaunchVideo("/showbiz/2003/06/12/peck.obit.affl.","300k");">A leading mans leading man</a><br>';
					       s += '';
					       s += '';
					       s += '';
					       s += '		';
					       s += '&#8226; <span class="cnnBodyText" style="font-weight:bold;color:#333">Interactive: </span> <a href="javascript:CNN_openPopup("/interactive/entertainment/0306/peck.obit/frameset.exclude.html","620x430","toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no,width=620,height=430")">Gregory Peck through the years</a><br>';
					       s += '';
					       s += '	';
					       s += '&#8226;  <a href="http://www.cnn.com/2003/SHOWBIZ/Movies/06/12/peck.filmography/index.html" target="new">Gregory Peck filmography</a><img src="http://i.cnn.net/cnn/.element/img/1.0/misc/icon.external.links.gif" alt="external link" width="20" height="13" vspace="1" hspace="4" border="0" align="top"><br>';
					       s += '';
					       s += '	';
					       s += '&#8226;  <a href="http://www.cnn.com/2003/SHOWBIZ/Movies/06/04/heroes.villains.ap/index.html" target="new">Pecks Finch chararcter AFIs top hero</a><img src="http://i.cnn.net/cnn/.element/img/1.0/misc/icon.external.links.gif" alt="external link" width="20" height="13" vspace="1" hspace="4" border="0" align="top"><br>';
					       s += '	</div>';
					       s += '';
					       s += '<!-- /T1 -->';
					       s += '		</td>';
					       s += '		';
					       s += '		<td rowspan="2" width="10"><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="10" height="1"></td>';
					       s += '		<td width="344">';
					       s += '';
					       s += '';
					       s += '';
					       s += '';
					       s += '<!-- T2 -->';
					       s += '';
					       s += '<div><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/px_c00.gif" alt="" width="344" height="2"></div>';
					       s += '<table width="344" border="0" cellpadding="0" cellspacing="0">';
					       s += '	<tr>';
					       s += '		<td width="285" class="cnnTabbedBoxHeader" style="padding-left:0px;"><span class="cnnBigPrint"><b>MORE TOP STORIES</b></span></td>';
					       s += ' 		<td width="59" class="cnnTabbedBoxTab" align="right" bgcolor="#336699"><a href="/userpicks"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/userpicks.gif" alt=" Hot Stories " width="59" height="11" border="0"></a></td>';
					       s += '	</tr>';
					       s += '</table>';
					       s += '<div style="padding:6px;padding-left:0px;">';
					       s += '';
					       s += '	';
					       s += '<div class="cnnMainNewT2">&#8226; <a href="/2003/WORLD/meast/06/12/mideast/index.html">7 dead in new Gaza strike</a>';
					       s += '| <img src="http://i.cnn.net/cnn/.element/img/1.0/misc/premium.gif" alt="premium content" width="9" height="11" hspace="0" vspace="0" border="0" align="absmiddle"> <a href="javascript:LaunchVideo("/world/2003/06/11/cb.bush.roadmap.ap.","300k");">Video</a><br></div>';
					       s += '';
					       s += '	';
					       s += '<div class="cnnMainNewT2">&#8226; <a href="/2003/WORLD/meast/06/12/sprj.irq.main/index.html">U.S. helicopter, jet down in Iraqi raid</a>';
					       s += '| <img src="http://i.cnn.net/cnn/.element/img/1.0/misc/premium.gif" alt="premium content" width="9" height="11" hspace="0" vspace="0" border="0" align="absmiddle"> <a href="javascript:LaunchVideo("/iraq/2003/06/11/bw.iraq.oil.cnn.","300k");">Video</a><br></div>';
					       s += '';
					       s += '	';
					       s += '<div class="cnnMainNewT2">&#8226; <a href="/2003/SHOWBIZ/TV/06/12/obit.brinkley/index.html">Television icon David Brinkley dead at 82</a><br></div>';
					       s += '';
					       s += '	';
					       s += '<div class="cnnMainNewT2">&#8226; <a href="/2003/LAW/06/12/peterson.case/index.html">Peterson search warrants will be made public in July</a><br></div>';
					       s += '';
					       s += '	';
					       s += '<div class="cnnMainNewT2">&#8226; <a href="/2003/WORLD/asiapcf/east/06/12/okinawa.rape/index.html">U.S. Marine held in new Okinawa rape case</a><br></div>';
					       s += '';
					       s += '	';
					       s += '<div class="cnnMainNewT2">&#8226; <a href="/2003/TECH/space/06/12/sprj.colu.bolts.ap/index.html">New threat discovered for shuttle launches</a><br></div>';
					       s += '';
					       s += '	';
					       s += '<div class="cnnMainNewT2">&#8226; <a href="/2003/SHOWBIZ/TV/06/12/television.sopranos.reut/index.html">"Soprano" Gandolfini shares his wealth with castmates</a><br></div>';
					       s += '<!--[[div class="cnnMainNewT2"]]&#8226;&nbsp;[[b]][[span style="color:#C00;"]]CNN[[/span]]Radio:[[/b]]&nbsp;[[a href="javascript:CNN_openPopup("/audio/radio/preferences.html","radioplayer","toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no,width=200,height=124")"]]Bush on Medicare[[/a]]&nbsp;[[a href="javascript:CNN_openPopup("/audio/radio/preferences.html","radioplayer","toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no,width=200,height=124")"]][[img src="http://i.a.cnn.net/cnn/.element/img/1.0/misc/live.video.gif" alt="" width="61" height="14" vspace="0" hspace="2" align="absmiddle" border="0"]][[/a]][[img src="http://i.a.cnn.net/cnn/.element/img/1.0/misc/audio.gif" alt="" width="10" height="10" vspace="0" hspace="2" align="absmiddle"]][[br]][[/div]]--></div>';
					       s += '';
					       s += '<!-- /T2 -->';
					       s += '<div><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="1" height="10"></div>';
					       s += '';
					       s += '<!--include virtual="/.element/ssi/misc/1.0/war.zone.smmap.txt"-->';
					       s += '<!-- =========== CNN Radio/Video Box =========== -->';
					       s += '<!-- top line -->	';
					       s += '<div><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/px_ccc.gif" alt="" width="344" height="1"></div>';
					       s += '<!-- /top line -->';
					       s += ' <table width="344" border="0" cellpadding="0" cellspacing="0">';
					       s += '	<tr valign="top">';
					       s += '<!-- left-side line -->	';
					       s += '		<td bgcolor="#CCCCCC" width="1"><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="1" height="30" hspace="0" vspace="0" border="0"></td>';
					       s += '<!-- /left-side line -->	';
					       s += '<!-- CNNRadio cell -->';
					       s += '        <td width="114"><div class="cnn6pxPad">';
					       s += '        <span class="cnnBigPrint" style="color:#C00;font-weight:bold;">CNN</span><span class="cnnBigPrint" style="color:#000;font-weight:bold;">RADIO</span>';
					       s += '<div class="cnnMainNewT2"><a href="javascript:CNN_openPopup("/audio/radio/preferences.html","radioplayer","toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no,width=200,height=124")">Listen to latest updates</a><img src="http://i.a.cnn.net/cnn/.element/img/1.0/misc/audio.gif" alt="" width="10" height="10" vspace="0" hspace="2" align="absmiddle">';
					       s += '<div><img src="http://i.a.cnn.net/cnn/images/1.gif" alt="" width="1" height="5" hspace="0" vspace="0"></div>';
					       s += '<!--';
					       s += '[[span class="cnnFinePrint"]]sponsored by:[[/span]][[br]][[center]]';
					       s += '[[!~~#include virtual="/cnn_adspaces/home/war_in_iraq/sponsor.88x31.ad"~~]]';
					       s += ' [[/center]]';
					       s += '-->';
					       s += ' </div></td>';
					       s += '<!-- /CNNRadio cell --> ';
					       s += '<!-- center line -->  ';
					       s += '		<td bgcolor="#CCCCCC" width="1"><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="1" height="1" hspace="0" vspace="0" border="0"></td>';
					       s += '<!-- /center line --> ';
					       s += '<!-- video cell --> ';
					       s += '       <td width="227"><div class="cnn6pxPad">';
					       s += '<!-- video box -->       ';
					       s += '<table width="215" border="0" cellpadding="0" cellspacing="0">';
					       s += '   <tr valign="top">';
					       s += '    <td width="144"><span class="cnnBigPrint" style="font-weight:bold;">VIDEO</span></td>';
					       s += '    <td width="6"><img src="http://i.a.cnn.net/cnn/images/1.gif" alt="" width="6" height="1" hspace="0" vspace="0"></td>';
					       s += '	<td width="65"><a href="/video/"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/more.video.blue.gif" alt="MORE VIDEO" width="62" height="11" hspace="0" vspace="0" border="0"></a></td></tr>';
					       s += '   <tr>';
					       s += '    <td width="215" colspan="3"><img src="http://i.a.cnn.net/cnn/images/1.gif" alt="" width="1" height="2" hspace="0" vspace="0"></td></tr>';
					       s += '  <tr valign="top">';
					       s += '    <td><div class="cnnBodyText">';
					       s += '     	Soldier broke dozens of hearts over e-mail<br>';
					       s += '     <img src="http://i.a.cnn.net/cnn/images/icons/premium.gif" align="middle" alt="premium content" width="9" height="11" hspace="0" vspace="1" border="0">&nbsp;<a href="javascript:LaunchVideo("/offbeat/2003/06/12/ms.casanova.col.ap.","300k");" class="cnnVideoLink">PLAY VIDEO</a></div>';
					       s += '  </td>';
					       s += '<td width="3"><img src="http://i.a.cnn.net/cnn/images/1.gif" alt="" width="3" height="1" hspace="0" vspace="0"></td>  ';
					       s += '  <td width="65" align="right">';
					       s += '    <a href="javascript:LaunchVideo("/offbeat/2003/06/12/ms.casanova.col.ap.","300k");"><img src="http://i.cnn.net/cnn/video/offbeat/2003/06/12/ms.casanova.col.vs.kndu.jpg" alt="" width="65" height="49" border="0" vspace="2" hspace="0"></a>';
					       s += '  </td></tr>';
					       s += '</table>';
					       s += ' <!-- /video box -->        ';
					       s += '       </div></td>';
					       s += '<!-- /video cell -->        ';
					       s += '<!-- right-side line -->       ';
					       s += '<td bgcolor="#CCCCCC" width="1"><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="1" height="1" hspace="0" vspace="0" border="0"></td>';
					       s += '<!-- /right-side line -->  ';
					       s += '		</tr>';
					       s += '  </table>';
					       s += '';
					       s += '<!-- bottom line -->';
					       s += '<div><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/px_ccc.gif" alt="" width="344" height="1"></div>';
					       s += '<!-- /bottom line -->';
					       s += '<!-- =========== /CNN Radio/Video Box =========== -->';
					       s += '';
					       s += '<div><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="1" height="10"></div>';
					       s += '<div><img src="http://i.cnn.net/cnn/.element/img/1.0/main/px_c00.gif" alt="" width="344" height="2"></div>';
					       s += '<table width="344" border="0" cellpadding="0" cellspacing="0">';
					       s += '	<tr>';
					       s += '		<td width="260" class="cnnTabbedBoxHeader" style="padding-left:0px;"><span class="cnnBigPrint"><b>ON THE SCENE</b></span></td>';
					       s += '		<td width="84" class="cnnTabbedBoxTab" align="right" bgcolor="#336699" style="padding: 0px 3px;"><a href="/LAW/"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/superlinks/law.gif" alt="more reports" height="11" border="0" hspace="2" vspace="2" align="right"></a></td>';
					       s += '	</tr>';
					       s += '</table>';
					       s += '';
					       s += '<table width="344" border="0" cellpadding="5" cellspacing="0">';
					       s += '	<tr valign="top">';
					       s += '		<td style="padding-left:0px;">                                                                                                                                <b>Jeffrey Toobin:</b> "It takes guts" for Peterson defense to subpoena judge over wiretap issue.';
					       s += '<a href="/2003/LAW/06/12/otsc.toobin/index.html">Full Story</a></td>';
					       s += '';
					       s += '<td width="65" align="right" style="padding-left:6px;"><a href="/2003/LAW/06/12/otsc.toobin/index.html"><img src="http://i.cnn.net/cnn/2003/LAW/06/12/otsc.toobin/tz.toobin.jpg" alt="image" width="65" height="49" border="0" hspace="0" vspace="0"></a></td>';
					       s += '	</tr>';
					       s += '</table>';
					       s += '<div><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="1" height="10"></div>';
					       s += '		</td>';
					       s += '	</tr>';
					       s += '	<tr valign="bottom">';
					       s += '		<td>';
					       s += '<table width="344" border="0" cellpadding="0" cellspacing="0">';
					       s += '	<tr>';
					       s += '		<td width="267" nowrap style="color: #c00; padding-left: 6px"><span class="cnnBigPrint" style="vertical-align: top"><b>BUSINESS</b></span>';
					       s += '			<a href="/money/"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/at_cnnmoney.gif" alt=" at CNN/Money " width="100" height="15" border="0"></a></td>';
					       s += '		<td width="77" align="right"><a href="/money/"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/business.news.blue.gif" alt=" Business News " width="77" height="11" border="0"></a></td>';
					       s += '	</tr>';
					       s += '</table>';
					       s += '';
					       s += '<table width="344" bgcolor="#EEEEEE" border="0" cellpadding="0" cellspacing="0" style="border: solid 1px #ddd">';
					       s += '	<tr valign="top">';
					       s += '		<td>';
					       s += '			<table width="100%" border="0" cellpadding="0" cellspacing="4">';
					       s += '				<tr>';
					       s += '					<td colspan="3"><span class="cnnMenuText"><b>STOCK/FUND QUOTES: </b></span></td>';
					       s += '				</tr><form action="http://qs.money.cnn.com/tq/stockquote" method="get" style="margin: 0px;">';
					       s += '				<tr>';
					       s += '					<td><span class="cnnFinePrint">enter symbol</span></td>';
					       s += '					<td><input type="text" name="symbols" size="7" maxlength="40" class="cnnMenuText" title="Enter stock/fund symbol or name to get a quote"></td>';
					       s += '					<td><input type="submit" value="GET" class="cnnNavButton"></td>';
					       s += '				</tr></form>';
					       s += '			</table>';
					       s += '			<table width="100%" border="0" cellpadding="0" cellspacing="4">';
					       s += '				<tr valign="top">';
					       s += '					<td><span class="cnnFinePrint">sponsored by:</span></td>';
					       s += '					<td align="right"><!--<a href="/money/news/specials/rebuild_iraq/"><img src="http://i.a.cnn.net/cnn/2003/images/04/17/money.box.gif" ALT="" width="150" height="31" HSPACE="0" VSPACE="0" border="0" align="left"></a>--><a href="http://ar.atwola.com/link/93103306/aol"><img src="http://ar.atwola.com/image/93103306/aol" alt="Click Here" width="88" height="31" border="0" hspace="0" vspace="0"></a></td>';
					       s += '				</tr>';
					       s += '			</table>';
					       s += '			</td>';
					       s += '		<td class="cnnMainMarketBox">		<table width="100%" border="0" cellpadding="4" cellspacing="0" summary="Market data from CNNmoney">';
					       s += '			<tr class="noBottomBorder">';
					       s += '				<td colspan="5"><span class="cnnMainMarketCell"><span class="cnnMenuText"><b><a href="/money/markets/">MARKETS:</a></b></span> <!-- 16:30:15 -->';
					       s += '';
					       s += '4:30pm ET, 6/12</span></td>';
					       s += '			</tr>';
					       s += '			<tr class="noTopBorder">';
					       s += '				<td><span class="cnnMainMarketCell"><a href="/money/markets/dow.html" title="Dow Jones Industrial Average">DJIA</a></span></td>';
					       s += '								<td><img src="http://i.cnn.net/cnn/.element/img/1.0/main/arrow_up.gif" alt="" width="9" height="9"></td>';
					       s += '				<td align="right" nowrap><span class="cnnMainMarketCell">+13.30</span></td>';
					       s += '				<td align="right" nowrap><span class="cnnMainMarketCell">9196.50</span></td>';
					       s += '				<td align="right" nowrap><span class="cnnMainMarketCell">+ 0.14%</span></td>';
					       s += '';
					       s += '			</tr>';
					       s += '			<tr>';
					       s += '				<td><span class="cnnMainMarketCell"><a href="/money/markets/nasdaq.html" title="NASDAQ">NAS</a></span></td>';
					       s += '								<td><img src="http://i.cnn.net/cnn/.element/img/1.0/main/arrow_up.gif" alt="" width="9" height="9"></td>';
					       s += '				<td align="right" nowrap><span class="cnnMainMarketCell">+ 7.60</span></td>';
					       s += '				<td align="right" nowrap><span class="cnnMainMarketCell">1653.62</span></td>';
					       s += '				<td align="right" nowrap><span class="cnnMainMarketCell">+ 0.46%</span></td>';
					       s += '';
					       s += '			</tr>';
					       s += '			<tr class="noBottomBorder">';
					       s += '				<td><span class="cnnMainMarketCell"><a href="/money/markets/sandp.html" title="S&amp;P 500">S&amp;P</a></span></td>';
					       s += '								<td><img src="http://i.cnn.net/cnn/.element/img/1.0/main/arrow_up.gif" alt="" width="9" height="9"></td>';
					       s += '				<td align="right" nowrap><span class="cnnMainMarketCell">+ 1.03</span></td>';
					       s += '				<td align="right" nowrap><span class="cnnMainMarketCell">998.51</span></td>';
					       s += '				<td align="right" nowrap><span class="cnnMainMarketCell">+ 0.10%</span></td>';
					       s += '';
					       s += '			</tr>';
					       s += '		</table>';
					       s += '</td>';
					       s += '	</tr>';
					       s += '</table>';
					       s += '';
					       s += '</td>';
					       s += '	</tr>';
					       s += '	<tr>';
					       s += '		<td colspan="3"><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="1" height="4"></td>';
					       s += '	</tr>';
					       s += '	<tr align="center" valign="bottom">';
					       s += '		<td width="280" bgcolor="#EEEEEE"><a href="/linkto/ftn.nytimes1.html"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/ftn.280x32.ny.times.gif" width="255" height="32" alt="" border="0"></a></td>';
					       s += '<td width="10"><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="10" height="1"></td>';
					       s += '		<td width="344" bgcolor="#EEEEEE"><a href="/linkto/ftn.bn3.html"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/ftn.345x32.breaking.news.gif" width="340" height="32" alt="" border="0"></a></td>';
					       s += '	</tr>';
					       s += '';
					       s += '</table>';
					       s += '';
					       s += '';
					       s += '<div><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="1" height="10"></div>';
					       s += '';
					       s += '';
					       s += '<table width="770" border="0" cellpadding="0" cellspacing="0">';
					       s += '	<col width="10">';
					       s += '	<col width="483" align="left" valign="top">';
					       s += '	<col width="10">';
					       s += '	<col width="267" align="left" valign="top">';
					       s += '	<tr valign="top">';
					       s += '		<td rowspan="2"><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="10" height="1"></td>';
					       s += '		<td valign="top">';
					       s += '			<table border="0" cellpadding="0" cellspacing="0">';
					       s += '				<tr valign="top">';
					       s += '					<td width="238">';
					       s += '						<div><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/px_c00.gif" alt="" width="238" height="2"></div>';
					       s += '';
					       s += '';
					       s += '';
					       s += '';
					       s += '';
					       s += '';
					       s += '						<table width="238" border="0" cellpadding="0" cellspacing="0">';
					       s += '							<tr>';
					       s += '						<td width="132" class="cnnTabbedBoxHeader" style="padding-left:0px;"><span class="cnnBigPrint"><b>MORE REAL TV</b></span></td>';
					       s += '						<td width="106" class="cnnTabbedBoxTab" align="right" bgcolor="#336699" style="padding: 0px 3px;"><a href="/SHOWBIZ"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/entertainment.news.gif" alt="More Entertainment" border="0" width="102" height="11" hspace="2" vspace="2" align="right"></a></td>';
					       s += '					</tr>';
					       s += '				</table>';
					       s += '				<div><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="238" height="5" vspace="0" hspace="0"></div>';
					       s += '						<table width="238" border="0" cellpadding="0" cellspacing="0">';
					       s += '							<tr valign="top">';
					       s += '								<td><div class="cnn6pxTpad">';
					       s += '	';
					       s += ' <a href="/2003/SHOWBIZ/06/11/eye.ent.voyeurs/index.html">Go ahead, follow me</a><br>';
					       s += 'New reality series and the movie debut of "Idol" finalists';
					       s += '								</div></td>';
					       s += '								<td width="71" align="right"><a href="/2003/SHOWBIZ/06/11/eye.ent.voyeurs/index.html"><img src="http://i.a.cnn.net/cnn/2003/SHOWBIZ/06/11/eye.ent.voyeurs/tz.movies.gif" alt="Go ahead, follow me" width="65" height="49" border="0" vspace="6"></a></td>';
					       s += '							</tr>';
					       s += '						</table>';
					       s += '';
					       s += '';
					       s += '';
					       s += '';
					       s += '';
					       s += '';
					       s += '			';
					       s += '				<div><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="238" height="5" vspace="0" hspace="0"></div>';
					       s += '<!--include virtual="/.element/ssi/video/section_teases/topvideos_include.txt"-->';
					       s += '					</td>';
					       s += '					<td><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="7" height="1"></td>';
					       s += '					<td width="238">';
					       s += '						<div><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/px_c00.gif" alt="" width="238" height="2"></div>';
					       s += '';
					       s += '';
					       s += '';
					       s += '';
					       s += '';
					       s += '';
					       s += '						<table width="238" border="0" cellpadding="0" cellspacing="0">';
					       s += '							<tr>';
					       s += '						<td width="157" class="cnnTabbedBoxHeader" style="padding-left:0px;"><span class="cnnBigPrint"><b>GIFT IDEAS</b></span></td>';
					       s += '						<td width="81" class="cnnTabbedBoxTab" align="right" bgcolor="#336699" style="padding: 0px 3px;"><a href="/money"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/superlinks/business.gif" alt="Business News" border="0" width="77" height="11" hspace="2" vspace="2" align="right"></a></td>';
					       s += '					</tr>';
					       s += '				</table>';
					       s += '				<div><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="238" height="5" vspace="0" hspace="0"></div>';
					       s += '						<table width="238" border="0" cellpadding="0" cellspacing="0">';
					       s += '							<tr valign="top">';
					       s += '								<td><div class="cnn6pxTpad">';
					       s += '';
					       s += '';
					       s += '<span class="cnnBodyText" style="font-weight:bold;">CNN/Money: </span> <a href="/money/2003/06/12/news/companies/fathers_day/index.htm?cnn=yes">Fathers Day</a><br>';
					       s += 'Smaller is better --from digital cameras to iPod';
					       s += '								</div></td>';
					       s += '								<td width="71" align="right"><a href="/money/2003/06/12/news/companies/fathers_day/index.htm?cnn=yes"><img src="http://i.a.cnn.net/cnn/images/programming.boxes/tz.money.dads.day.watch.jpg" alt="Fathers Day" width="65" height="49" border="0" vspace="6"></a></td>';
					       s += '							</tr>';
					       s += '						</table>';
					       s += '					</td>';
					       s += '				</tr>';
					       s += '			</table>';
					       s += '				<div><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="238" height="10" vspace="0" hspace="0"></div>			';
					       s += '<table width="483" border="0" cellspacing="0" cellpadding="0">';
					       s += '	<tr valign="top">';
					       s += '		<td rowspan="9"><br></td>';
					       s += '		<td width="238"><a href="/US/"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/us.gif" alt="U.S. News: " width="238" height="15" border="0"></a><br><div class="cnnMainSections">';
					       s += '';
					       s += '	';
					       s += '&#8226;&nbsp;<a href="/2003/US/South/06/11/miami.rapist/index.html">Miami police link 4 rapes to serial rapist</a><br>';
					       s += '';
					       s += '	';
					       s += '&#8226;&nbsp;<a href="/2003/LAW/06/12/mistaken.identity.ap/index.html">Woman mistaken for fugitive jailed</a><br>';
					       s += '';
					       s += '	';
					       s += '&#8226;&nbsp;<a href="/2003/US/Northeast/06/12/woman.impaled.ap/index.html">Pregnant woman impaled on mic stand</a><br>';
					       s += '		</div></td>';
					       s += '		<td rowspan="7" width="7"><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="7" height="1"></td>';
					       s += '		<td width="238"><a href="/WORLD/"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/world.gif" alt="World News: " width="238" height="15" border="0"></a><br><div class="cnnMainSections">';
					       s += '';
					       s += '	';
					       s += '&#8226;&nbsp;<a href="/2003/WORLD/europe/06/12/nato.bases/index.html">NATO reshapes for new era</a><br>';
					       s += '';
					       s += '	';
					       s += '&#8226;&nbsp;<a href="/2003/WORLD/africa/06/12/congo.democratic/index.html">U.N. reviews Bunia peace force</a><br>';
					       s += '';
					       s += '';
					       s += '';
					       s += '&#8226;&nbsp;<span class="cnnBodyText" style="font-weight:bold;color:#900;">TIME.com: </span><a href="/time/magazine/article/0,9171,1101030616-457361,00.html?CNN=yes" target="new">Saddams curtain trail</a><img src="http://i.cnn.net/cnn/.element/img/1.0/misc/icon.external.links.gif" alt="external link" width="20" height="13" vspace="1" hspace="4" border="0" align="top"><br>';
					       s += '		</div></td>';
					       s += '	</tr><tr valign="top">';
					       s += '		<td width="238"><a href="/TECH/"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/technology.gif" alt="Sci-Tech News: " width="238" height="15" border="0"></a><br><div class="cnnMainSections">';
					       s += '';
					       s += '	';
					       s += '&#8226;&nbsp;<a href="/2003/TECH/ptech/06/11/bus2.ptech.dvd.maker/index.html">Another reason to throw out your VCR</a><br>';
					       s += '';
					       s += '	';
					       s += '&#8226;&nbsp;<a href="/2003/TECH/ptech/06/12/korea.samsung.reut/index.html">Flat screen TV prices dropping</a><br>';
					       s += '		</div></td>';
					       s += '		<td width="238"><a href="/SHOWBIZ/"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/entertainment.gif" alt="Entertainment News: " width="238" height="15" border="0"></a><br><div class="cnnMainSections">';
					       s += '';
					       s += '	';
					       s += '&#8226;&nbsp;<a href="/2003/SHOWBIZ/TV/06/12/cnn.obrien/index.html">CNN hires Soledad OBrien for "AM"</a><br>';
					       s += '';
					       s += '	';
					       s += '&#8226;&nbsp;<a href="/2003/SHOWBIZ/TV/06/11/batchelor.troubles.ap/index.html">Dating show star let go by law firm</a><br>';
					       s += '		</div></td>';
					       s += '	</tr><tr valign="top">';
					       s += '		<td width="238"><a href="/ALLPOLITICS/"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/politics.gif" alt="Politics News: " width="238" height="15" border="0"></a><br><div class="cnnMainSections">';
					       s += '';
					       s += '	';
					       s += '&#8226;&nbsp;<a href="/2003/ALLPOLITICS/06/11/schwarzenegger.ap/index.html">Schwarzenegger on California politics</a><br>';
					       s += '';
					       s += '	';
					       s += '&#8226;&nbsp;<a href="/2003/ALLPOLITICS/06/12/tax.credit.ap/index.html">House approves extension on child tax credit</a><br>';
					       s += '		</div></td>';
					       s += '		<td width="238"><a href="/LAW/"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/law.gif" alt="Law News: " width="238" height="15" border="0"></a><br><div class="cnnMainSections">';
					       s += '';
					       s += '	';
					       s += '&#8226;&nbsp;<a href="/2003/LAW/06/12/plaintiff.advances.ap/index.html">Court bars cash advances to plaintiffs</a><br>';
					       s += '';
					       s += '	';
					       s += '&#8226;&nbsp;<a href="/2003/LAW/06/11/jackson.lawsuit.ap/index.html">Lawsuit against Jackson settled</a><br>';
					       s += '		</div></td>';
					       s += '	</tr><tr valign="top">';
					       s += '		<td width="238"><a href="/HEALTH/"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/health.gif" alt="Health News: " width="238" height="15" border="0"></a><br><div class="cnnMainSections">';
					       s += '';
					       s += '	';
					       s += '&#8226;&nbsp;<a href="/2003/HEALTH/06/12/monkeypox.ap/index.html">Monkeypox spreading person-to-person?</a><br>';
					       s += '';
					       s += '	';
					       s += '&#8226;&nbsp;<a href="/2003/HEALTH/06/12/quick.xray.ap/index.html">A full body X-ray in 13 seconds</a><br>';
					       s += '		</div></td>';
					       s += '		<td width="238"><a href="/TECH/space/"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/space.gif" alt="Space News: " width="238" height="15" border="0"></a><br><div class="cnnMainSections">';
					       s += '';
					       s += '	';
					       s += '&#8226;&nbsp;<a href="/2003/TECH/science/06/12/hydrogen.ozone.ap/index.html">Hydrogen fuel may disturb ozone layer</a><br>';
					       s += '';
					       s += '	';
					       s += '&#8226;&nbsp;<a href="/2003/TECH/space/06/12/sprj.colu.bolts.ap/index.html">New threat found for shuttle launches</a><br>';
					       s += '		</div></td>';
					       s += '	</tr><tr valign="top">';
					       s += '		<td width="238"><a href="/TRAVEL/"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/travel.gif" alt="Travel News: " width="238" height="15" border="0"></a><br><div class="cnnMainSections">';
					       s += '';
					       s += '	';
					       s += '&#8226;&nbsp;<a href="/2003/TRAVEL/DESTINATIONS/06/12/walk.across.america.ap/index.html">Walking America from coast to coast</a><br>';
					       s += '';
					       s += '	';
					       s += '&#8226;&nbsp;<a href="/2003/TRAVEL/06/11/bi.airlines.executives.reut/index.html">Airline execs not seeing sunny skies yet</a><br>';
					       s += '		</div></td>';
					       s += '		<td width="238"><a href="/EDUCATION/"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/education.gif" alt="Education News: " width="238" height="15" border="0"></a><br><div class="cnnMainSections">';
					       s += '';
					       s += '	';
					       s += '&#8226;&nbsp;<a href="/2003/EDUCATION/06/12/arabs.prom.ap/index.html">Arab students seek prom balance</a><br>';
					       s += '';
					       s += '	';
					       s += '&#8226;&nbsp;<a href="/2003/EDUCATION/06/11/school.fundraising.ap/index.html">Public schools turn to upscale fundraising</a><br>';
					       s += '		</div></td>';
					       s += '	</tr><tr valign="top">';
					       s += '		<td width="238"><a href="/si/index.html?cnn=yes"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/sports.gif" alt="Sports News: " width="238" height="15" border="0"></a><br><div class="cnnMainSections">';
					       s += '';
					       s += '&#8226;&nbsp;<a href="/cnnsi/golfonline/2003/us_open/news/2003/06/12/open_thursday_ap">Woods eyes third U.S. Open title</a><br>';
					       s += '&#8226;&nbsp;<a href="/cnnsi/basketball/news/2003/06/12/jordan_ruling_ap">Judge denies Jordan&#039;s former lover $5M payoff</a><br>';
					       s += '		</div></td>';
					       s += '		<td width="238"><a href="/money/"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/business.gif" alt="Business News: " width="238" height="15" border="0"></a><br><div class="cnnMainSections">';
					       s += '&#8226;&nbsp;<a href="/money/2003/06/12/pf/saving/duppies/index.htm">Here come the "Duppies"</a><br>';
					       s += '&#8226;&nbsp;<a href="/money/2003/06/12/technology/oracle/index.htm">Oracle beats estimates</a><br>';
					       s += '		</div></td>';
					       s += '	</tr>';
					       s += '</table>';
					       s += '		</td>';
					       s += '		<td><img src="http://i.cnn.net/cnn/images/1.gif" width="10" hspace="0" vspace="0" alt=""></td>';
					       s += '		<td valign="top">';
					       s += '		<div><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/px_c00.gif" alt="" width="267" height="2"></div>';
					       s += '				';
					       s += '<table width="267" border="0" cellpadding="0" cellspacing="0">';
					       s += '	<tr>';
					       s += '		<td width="173" bgcolor="#003366"><div class="cnnBlueBoxHeader"><span class="cnnBigPrint"><b>WATCH CNN TV</b></span></div></td>';
					       s += '		<td width="25" class="cnnBlueBoxHeader" align="right"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/misc/diagonal.gif" width="25" height="19" alt=""></td>';
					       s += '		<td width="69" class="cnnBlueBoxTab" align="right" bgcolor="#336699"><a href="/CNN/Programs/"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/tv.schedule.gif" alt="On CNN TV" border="0" width="65" height="11" hspace="2" vspace="2" align="right"></a></td>';
					       s += '	</tr>';
					       s += '</table>';
					       s += '<table width="267" bgcolor="#EEEEEE" border="0" cellpadding="4" cellspacing="0">';
					       s += '	<tr valign="top">';
					       s += '		<td><a href="/CNN/Programs/american.morning/"><img src="http://i.cnn.net/cnn/CNN/Programs/includes/showbox/images/2003/05/tz.hemmer.jpg" alt="American Morning, 7 a.m. ET" width="65" height="49" border="0" align="right"></a><a href="/CNN/Programs/american.morning/"><b>American Morning (7 a.m. ET):</b></a> Tomorrow, singer Carnie Wilson talks about her new book, "Im Still Hungry."';
					       s += '		</td>';
					       s += '	</tr>';
					       s += '</table>';
					       s += '';
					       s += '<!--';
					       s += '[[table width="267" border="0" cellpadding="0" cellspacing="0"]]';
					       s += '[[tr]][[td width="173" bgcolor="#003366"]][[div class="cnnBlueBoxHeader"]][[span class="cnnBigPrint"]][[b]]WATCH CNN TV[[/b]][[/span]][[/div]][[/td]][[td width="25" class="cnnBlueBoxHeader" align="right"]][[img src="http://i.a.cnn.net/cnn/.element/img/1.0/misc/diagonal.gif" width="25" height="19" alt=""]][[/td]][[td width="69" class="cnnBlueBoxTab" align="right" bgcolor="#336699"]][[a href="/CNN/Programs/"]][[img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/tv.schedule.gif" alt="On CNN TV" border="0" width="65" height="11" hspace="2" vspace="2" align="right"]][[/a]][[/td]][[/tr]][[/table]][[table width="267" bgcolor="#EEEEEE" border="0" cellpadding="4" cellspacing="0"]][[tr valign="top"]][[td]]';
					       s += '[[img src="http://i.cnn.net/cnn/2003/images/05/31/tz.bw.jpg" alt="" width="65" height="49" border="0" align="right"]]';
					       s += '	';
					       s += '[[b]] CNN Presents: The Hunt for Eric Robert Rudolph (8 p.m. ET)[[/b]][[br]]Latest on his capture.';
					       s += '					[[/td]]';
					       s += '				[[/tr]]';
					       s += '			[[/table]]';
					       s += '-->';
					       s += '';
					       s += '				<div><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="1" height="10"></div>	';
					       s += '';
					       s += '';
					       s += '';
					       s += '';
					       s += '';
					       s += '';
					       s += '				<div><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/px_c00.gif" alt="" width="267" height="2"></div>';
					       s += '				<table width="267" border="0" cellpadding="0" cellspacing="0">';
					       s += '					<tr>';
					       s += '						<td width="184" bgcolor="#003366"><div class="cnnBlueBoxHeader"><span class="cnnBigPrint"><b>ANALYSIS</b></span></div></td>';
					       s += '						<td width="25" class="cnnBlueBoxHeader" align="right"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/misc/diagonal.gif" width="25" height="19" alt=""></td>';
					       s += '						<td width="58" class="cnnBlueBoxTab" align="right" bgcolor="#336699"><a href="/US"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/superlinks/us.gif" alt="U.S. News" border="0" width="54" height="11" hspace="2" vspace="2" align="right"></a></td>';
					       s += '					</tr>';
					       s += '				</table>';
					       s += '				<table width="267" bgcolor="#EEEEEE" border="0" cellpadding="4" cellspacing="0">';
					       s += '					<tr valign="top">';
					       s += '						<td>';
					       s += '<a href="/2003/US/06/12/nyt.safire/index.html"><img src="http://i.a.cnn.net/cnn/2003/US/06/12/nyt.safire/tz.stewart.jpg" alt="Fight It, Martha" width="65" height="49" border="0" align="right"></a>';
					       s += '';
					       s += '';
					       s += '<span class="cnnBodyText" style="font-weight:bold;color:#000;">NYTimes: </span> <a href="/2003/US/06/12/nyt.safire/index.html">Fight It, Martha</a><br>';
					       s += 'William Safire: I hope Martha Stewart beats this bum rap';
					       s += '';
					       s += '';
					       s += '';
					       s += '';
					       s += '					</td>';
					       s += '				</tr>';
					       s += '			</table>';
					       s += '			<div><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="1" height="10"></div>';
					       s += '				<div><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/px_c00.gif" alt="" width="267" height="2"></div>';
					       s += '				<table width="267" border="0" cellpadding="0" cellspacing="0">';
					       s += '					<tr>';
					       s += '						<td width="164" bgcolor="#003366"><div class="cnnBlueBoxHeader"><span class="cnnBigPrint"><b>OFFBEAT</b></span></div></td>';
					       s += '						<td width="25" class="cnnBlueBoxHeader" align="right"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/misc/diagonal.gif" width="25" height="19" alt=""></td>';
					       s += '						<td width="78" class="cnnBlueBoxTab" align="right" bgcolor="#336699"><a href="/offbeat"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/superlinks/offbeat.gif" alt="more offbeat" width="74" height="11" border="0" hspace="2" vspace="2" align="right"></a></td>';
					       s += '					</tr>';
					       s += '				</table>';
					       s += '				<table width="267" bgcolor="#DDDDDD" border="0" cellpadding="4" cellspacing="0">';
					       s += '					<tr valign="top">';
					       s += '						<td>';
					       s += '<a href="/2003/HEALTH/06/12/offbeat.china.sperm.ap/index.html"><img src="http://i.a.cnn.net/cnn/2003/HEALTH/06/12/offbeat.china.sperm.ap/tz.china.sperm.jpg" alt="Waiting list" width="65" height="49" border="0" align="right"></a>';
					       s += '	';
					       s += ' <a href="/2003/HEALTH/06/12/offbeat.china.sperm.ap/index.html">Waiting list</a><br>';
					       s += 'Chinas "smart sperm" bank needs donors';
					       s += '					</td>';
					       s += '				</tr>';
					       s += '			</table>';
					       s += '			<div><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="1" height="10"></div>';
					       s += '';
					       s += '			<table width="267" bgcolor="#999999" border="0" cellpadding="0" cellspacing="0">';
					       s += '				<tr>';
					       s += '					<td>';
					       s += '						<table width="100%" border="0" cellpadding="4" cellspacing="1">';
					       s += '							<tr>';
					       s += '								<td bgcolor="#EEEEEE" class="cnnMainWeatherBox"><a name="weatherBox"></a>';
					       s += '';
					       s += '';
					       s += '';
					       s += '';
					       s += '';
					       s += '';
					       s += '<table width="257" border="0" cellpadding="1" cellspacing="0">';
					       s += '<form method="get" action="http://weather.cnn.com/weather/search" style="margin: 0px">';
					       s += '<input type="hidden" name="mode" value="hplwp">';
					       s += '  <tr>';
					       s += '    <td bgcolor="#FFFFFF"><table width="255" bgcolor="#EAEFF4" border="0" cellpadding="4" cellspacing="0">';
					       s += '        <tr>';
					       s += '          <td colspan="2" class="cnnWEATHERrow">&nbsp;<span class="cnnBigPrint">WEATHER</span></td>';
					       s += '        </tr>';
					       s += '        <tr>';
					       s += '          <td colspan="2" class="cnnBodyText">Get your hometown weather on the home page! <b>Enter city name or U.S. Zip Code:</b></td>';
					       s += '        </tr>';
					       s += '        <tr>';
					       s += '          <td><input class="cnnFormText" type="text" size="12" name="wsearch" value="" style="width:100px;"></td>';
					       s += '          <td><input class="cnnNavButton" type="submit" value="PERSONALIZE"></td>';
					       s += '        </tr>';
					       s += '        <tr>';
					       s += '          <td class="cnnBodyText" colspan="2">Or <a href="javascript:CNN_openPopup("http://weather.cnn.com/weather/select.popup/content2.jsp?mode=hplwp", "weather", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no,width=260,height=250")"><b>select location from a list</b></a></td>';
					       s += '        </tr>';
					       s += '    </table></td>';
					       s += '  </tr>';
					       s += '</form>';
					       s += '</table>';
					       s += '';
					       s += '';
					       s += '';
					       s += '								</td>';
					       s += '							</tr>';
					       s += '							<tr>';
					       s += '								<td bgcolor="#EEEEEE">';
					       s += '									<table width="100%" border="0" cellpadding="0" cellspacing="2">';
					       s += '										<tr>';
					       s += '											<td><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/quickvote.gif" alt="Quick Vote" width="107" height="24" border="0"></td>';
					       s += '											<td width="88" align="right"><!-- ad home/quickvote/sponsor.88x31 -->';
					       s += '<!-- ad commented while aol investigates 3/31/03 5:40 a.m. lk -->';
					       s += '<a href="http://ar.atwola.com/link/93101912/aol"><img src="http://ar.atwola.com/image/93101912/aol" alt="Click Here" width="88" height="31" border="0" hspace="0" vspace="0"></a>';
					       s += '</td>';
					       s += '										</tr>';
					       s += '									</table>';
					       s += '<table width="100%" cellspacing="0" cellpadding="1" border="0"><form target="popuppoll" method="post" action="http://polls.cnn.com/poll">';
					       s += '<INPUT TYPE=HIDDEN NAME="poll_id" VALUE="3966">';
					       s += '<tr><td colspan="2" align="left"><span class="cnnBodyText">Should an international peacekeeping force be sent to the Mideast?<br></span></td></tr>';
					       s += '<tr valign="top">';
					       s += '<td><span class="cnnBodyText">Yes</span>';
					       s += '</td><td align="right"><input value="1" type="radio" name="question_1"></td></tr>';
					       s += '<tr valign="top">';
					       s += '<td><span class="cnnBodyText">No</span>';
					       s += '</td><td align="right"><input value="2" type="radio" name="question_1"></td></tr>';
					       s += '<!-- /end Question 1 -->';
					       s += '<tr>';
					       s += '<td colspan="2">';
					       s += '<table width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td><span class="cnnInterfaceLink"><nobr><a href="javascript:CNN_openPopup("/POLLSERVER/results/3966.html","popuppoll","toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no,width=510,height=400")">VIEW RESULTS</a></nobr></span></td>';
					       s += '<td align="right"><input class="cnnFormButton" onclick="CNN_openPopup("","popuppoll","toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no,width=510,height=400")" value="VOTE" type="SUBMIT"></td></tr></table></td></tr>';
					       s += '</form></table>';
					       s += '';
					       s += '								</td>';
					       s += '							</tr>';
					       s += '</table>';
					       s += '';
					       s += '					</td>';
					       s += '				</tr>';
					       s += '			</table>';
					       s += '		<!-- /right --></td>';
					       s += '	</tr>';
					       s += '	<tr>';
					       s += '		<td colspan="3" valign="bottom">		<img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/px_ccc.gif" alt="" width="483" height="1">		</td>';
					       s += '	</tr>';
					       s += '</table>';
					       s += '<table width="770" border="0" cellpadding="0" cellspacing="0" summary="Links to stories from CNN partners">';
					       s += '	<col width="10">';
					       s += '	<col width="250" align="left" valign="top">';
					       s += '	<col width="5">';
					       s += '	<col width="250" align="left" valign="top">';
					       s += '	<col width="5">';
					       s += '	<col width="250" align="left" valign="top">';
					       s += '	<tr><td colspan="6"><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="1" height="2"></td></tr>';
					       s += '	<tr valign="top">';
					       s += '		<td rowspan="6" width="10"><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="10" height="1"></td>';
					       s += '		<td colspan="3"><span class="cnnMenuText" style="font-size: 12px"><b style="color: #c00">From our Partners</b></span>';
					       s += '			<img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/icon_external.gif" alt=" External site icon " width="20" height="13" border="0" align="middle"></td>';
					       s += '		<td colspan="2"></td>';
					       s += '	</tr>';
					       s += '	<tr><td colspan="5"><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="1" height="2"></td></tr>';
					       s += '	<tr><td colspan="5" bgcolor="#CCCCCC"><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="1" height="1"></td></tr>';
					       s += '	<tr><td colspan="5"><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="1" height="2"></td></tr>';
					       s += '	<tr valign="top">';
					       s += '		<td class="cnnMainSections" width="250">';
					       s += '<a href="/time/" target="new"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/partner_time.gif" alt="Time: " width="70" height="17" border="0"></a><br><div style="margin-top: 4px">	&#8226;&nbsp;<a target="new" href="/time/magazine/article/0,9171,1101030616-457387,00.html?CNN=yes">Where the Jobs Are</a><br>	&#8226;&nbsp;<a target="new" href="/time/magazine/article/0,9171,1101030616-457373,00.html?CNN=yes">Of Dogs and Men</a><br>	&#8226;&nbsp;<a target="new" href="/time/photoessays/gunmen/?CNN=yes">Photo Essay: Fighting the Peace</a><br></div><table border="0"><tr><td><img height="1" width="1" alt="" src="http://i.cnn.net/cnn/images/1.gif"/></td></tr><tr bgcolor="#dddddd"><td>&nbsp;&nbsp;<a target="new" href="/linkto/time.main.html">Subscribe to TIME</a>&nbsp;&nbsp;</td></tr></table>		</td>';
					       s += '		<td width="5"><br></td>';
					       s += '		<td class="cnnMainSections" width="250">';
					       s += '<a href="/cnnsi/index.html?cnn=yes"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/partner_si.gif" alt="CNNsi.com: " width="138" height="17" border="0"></a><br><div style="margin-top: 4px">';
					       s += '&#8226;&nbsp;Marty Burns: <a target="new" href="/cnnsi/inside_game/marty_burns/news/2003/06/11/burns_game4/">Nets pull out all stops</a><br>';
					       s += '&#8226;&nbsp;Michael Farber: <a target="new" href="/cnnsi/inside_game/michael_farber/news/2003/06/11/farber_wrapup/">Sens look good for "04</a><br>';
					       s += '&#8226;&nbsp;Tim Layden: <a target="new" href="/cnnsi/inside_game/tim_layden/news/2003/06/11/layden_neuheisel/">NFL or bust for Neuheisel</a><br>';
					       s += '</div>';
					       s += '<table border="0"><tr><td><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="1" height="1"></td></tr><tr bgcolor="#dddddd"><td>&nbsp;&nbsp;<a href="http://subs.timeinc.net/CampaignHandler/si_cnnsi?source_id=19">Subscribe to Sports Illustrated</a>&nbsp;&nbsp;</td></tr></table>';
					       s += '		</td>';
					       s += '		<td width="5"><br></td>';
					       s += '		<td class="cnnMainSections" width="250">';
					       s += '<a href="/linkto/nyt/main.banner.html" target="new"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/partners_nyt.gif" alt="New York Times: " width="105" height="17" border="0"></a><br><div style="margin-top: 4px">	&#8226;&nbsp;<a target="new" href="/linkto/nyt/story/1.0612.html">U.S. Widens Checks at Foreign Ports</a><br>	&#8226;&nbsp;<a target="new" href="/linkto/nyt/story/2.0612.html">Rumsfeld: Iran Developing Nuclear Arms</a><br>	&#8226;&nbsp;<a target="new" href="/linkto/nyt/story/3.0612.html">Vandalism, "Improvements" Mar Great Wall</a><br></div><table border="0"><tr><td><img height="1" width="1" alt="" src="http://i.cnn.net/cnn/images/1.gif"/></td></tr><tr bgcolor="#dddddd"><td>&nbsp;&nbsp;<a target="new" href="/linkto/nyt.main.html">Get 50% OFF the NY Times</a>&nbsp;&nbsp;</td></tr></table>		</td>';
					       s += '	</tr>';
					       s += '';
					       s += '</table>';
					       s += '<div><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="1" height="2"></div>';
					       s += '';
					       s += '<table width="770" border="0" cellpadding="0" cellspacing="0">';
					       s += '	<tr>';
					       s += '		<td width="10"><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="10" height="10"></td>';
					       s += '		<td width="760">';
					       s += '<!-- floor -->';
					       s += '';
					       s += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr><td bgcolor="#999999"><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="1" height="1"></td></tr></table>';
					       s += '';
					       s += '<div><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="1" height="1"></div>';
					       s += '';
					       s += '<table width="100%" bgcolor="#DEDEDE" border="0" cellpadding="3" cellspacing="0">';
					       s += '	<tr> ';
					       s += '		<td><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="5" height="5"></td>';
					       s += '		<td><a href="http://edition.cnn.com/" class="cnnFormTextB" onClick="clickEdLink()" style="color:#000;">International Edition</a></td>';
					       s += '<form>';
					       s += '		<td><select title="CNN.com is available in different languages" class="cnnMenuText" name="languages" size="1" style="font-weight: bold; vertical-align: middle" onChange="if (this.options[selectedIndex].value != "") location.href=this.options[selectedIndex].value">';
					       s += '				<option value="" disabled selected>Languages</option>';
					       s += '				<option value="" disabled>---------</option>';
					       s += '				<option value="/cnnes/">Spanish</option>';
					       s += '				<option value="http://cnn.de/">German</option>';
					       s += '				<option value="http://cnnitalia.it/">Italian</option>';
					       s += '				<option value="http://www.joins.com/cnn/">Korean</option>';
					       s += '				<option value="http://arabic.cnn.com/">Arabic</option>';
					       s += '				<option value="http://www.CNN.co.jp/">Japanese</option>';
					       s += '			</select></td>';
					       s += '</form>';
					       s += '		<td><a href="/CNN/Programs/" class="cnnFormTextB" style="color:#000;">CNN TV</a></td>';
					       s += '		<td><a href="/CNNI/" class="cnnFormTextB" style="color:#000;">CNN International</a></td>';
					       s += '		<td><a href="/HLN/" class="cnnFormTextB" style="color:#000;">Headline News</a></td>';
					       s += '		<td><a href="/TRANSCRIPTS/" class="cnnFormTextB" style="color:#000;">Transcripts</a></td>';
					       s += '		<td><a href="/services/preferences/" title="Customize your CNN.com experience" class="cnnFormTextB" style="color:#000;">Preferences</a></td>';
					       s += '		<td><a href="/INDEX/about.us/" class="cnnFormTextB" style="color:#000;">About CNN.com</a></td>';
					       s += '	</tr>';
					       s += '</table>';
					       s += '';
					       s += '<div><img src="http://i.cnn.net/cnn/images/1.gif" alt="" width="1" height="1"></div>';
					       s += '';
					       s += '<table width="100%" bgcolor="#EFEFEF" border="0" cellpadding="4" cellspacing="0">';
					       s += '	<tr valign="top"> ';
					       s += '		<td style="padding-left:10px"><div class="cnnSectCopyright">';
					       s += '<b>&copy; 2003 Cable News Network LP, LLLP.</b><br>';
					       s += 'An AOL Time Warner Company. All Rights Reserved.<br>';
					       s += '<a href="/interactive_legal.html">Terms</a> under which this service is provided to you.<br>';
					       s += 'Read our <a href="/privacy.html">privacy guidelines</a>. <a href="/feedback/">Contact us</a>.';
					       s += '		</div></td>';
					       s += '		<td align="right"><table border="0" cellpadding="4" cellspacing="0">';
					       s += '				<tr> ';
					       s += '					<td rowspan="2" align="middle"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/sect/SEARCH/dotted.line.gif" alt="" width="7" height="46"></td>';
					       s += '					<td><img src="http://i.a.cnn.net/cnn/.element/img/1.0/misc/icon.external.links.gif" alt="external link" width="20" height="13"></td>';
					       s += '					<td><div class="cnnSectExtSites">All external sites will open in a new browser.<br>';
					       s += '							CNN.com does not endorse external sites.</div></td>';
					       s += '					<td rowspan="2" align="middle"><img src="http://i.a.cnn.net/cnn/.element/img/1.0/sect/SEARCH/dotted.line.gif" alt="" width="7" height="46"></td>';
					       s += '					<td rowspan="2"><!-- home/powered_by/sponsor.88x31 -->';
					       s += '<script language="JavaScript1.1">';
					       s += '<!--';
					       s += 'adSetTarget("_top");';
					       s += 'htmlAdWH( (new Array(93103308,93103308,93103308,93103308))[document.adoffset||0] , 88, 31);';
					       s += '//-->';
					       s += '</script><noscript><a href="http://ar.atwola.com/link/93103308/aol" target="_top"><img src="http://ar.atwola.com/image/93103308/aol" alt="Click here for our advertiser" width="88" height="31" border="0"></a></noscript>';
					       s += '</td>';
					       s += '				</tr>';
					       s += '				<tr valign="top"> ';
					       s += '					<td><img src="http://i.a.cnn.net/cnn/.element/img/1.0/main/icon_premium.gif" alt=" Premium content icon " width="9" height="11"></td>';
					       s += '					<td><span class="cnnSectExtSites">Denotes premium content.</span></td>';
					       s += '				</tr>';
					       s += '			</table></td>';
					       s += '	</tr>';
					       s += '</table>';
					       s += '';
					       s += '<!-- /floor --></td>';
					       s += '	</tr>';
					       s += '</table>';
					       s += '';
					       s += '';
					       s += '';
					       s += '<!-- popunder ad generic/popunder_launch.720x300 -->';
					       s += '<script language="JavaScript1.1" type="text/javascript">';
					       s += '<!--';
					       s += 'if (document.adPopupFile) {';
					       s += '	if (document.adPopupInterval == null) {';
					       s += '		document.adPopupInterval = "0";';
					       s += '	}';
					       s += '	if (document.adPopunderInterval == null) {';
					       s += '		document.adPopunderInterval = document.adPopupInterval;';
					       s += '	}';
					       s += '	if (document.adPopupDomain != null) {';
					       s += '		adSetPopDm(document.adPopupDomain);';
					       s += '	}';
					       s += '	adSetPopupWH("93162673", "720", "300", document.adPopupFile, document.adPopunderInterval, 20, 50, -1);';
					       s += '}';
					       s += '// -->';
					       s += '</script>';
					       s += '	';
					       s += '<!-- home/bottom.eyeblaster -->';
					       s += '<script language="JavaScript1.1" type="text/javascript">';
					       s += '<!--';
					       s += 'var MacPPC = (navigator.platform == "MacPPC") ? true : false;';
					       s += 'if (!MacPPC) {';
					       s += 'adSetType("J");';
					       s += 'htmlAdWH( (new Array(93137910,93137910,93137910,93137910))[document.adoffset||0], 101, 1);';
					       s += 'adSetType("");';
					       s += '}';
					       s += '// -->';
					       s += '</script>';
					       s += '';
					       s += '<script language="JavaScript1.1" src="http://ar.atwola.com/file/adsEnd.js"></script>';
					       s += '';
					       s += '<img src="/cookie.crumb" alt="" width="1" height="1">';
					       s += '<!--include virtual="/virtual/2002/main/survey.html"-->';
					       s += '</body>';
					       s += '</html>';

					       return s;
					       }
