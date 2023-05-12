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

/* Generated by make_unicode.py DO NOT MODIFY */
/* Unicode version: 15.0.0 */

/*
 * Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/licenses/publicdomain/
 */
assertEq(String.fromCodePoint(0x10428).toUpperCase().codePointAt(0), 0x10400); // DESERET SMALL LETTER LONG I, DESERET CAPITAL LETTER LONG I
assertEq(String.fromCodePoint(0x10429).toUpperCase().codePointAt(0), 0x10401); // DESERET SMALL LETTER LONG E, DESERET CAPITAL LETTER LONG E
assertEq(String.fromCodePoint(0x1042A).toUpperCase().codePointAt(0), 0x10402); // DESERET SMALL LETTER LONG A, DESERET CAPITAL LETTER LONG A
assertEq(String.fromCodePoint(0x1042B).toUpperCase().codePointAt(0), 0x10403); // DESERET SMALL LETTER LONG AH, DESERET CAPITAL LETTER LONG AH
assertEq(String.fromCodePoint(0x1042C).toUpperCase().codePointAt(0), 0x10404); // DESERET SMALL LETTER LONG O, DESERET CAPITAL LETTER LONG O
assertEq(String.fromCodePoint(0x1042D).toUpperCase().codePointAt(0), 0x10405); // DESERET SMALL LETTER LONG OO, DESERET CAPITAL LETTER LONG OO
assertEq(String.fromCodePoint(0x1042E).toUpperCase().codePointAt(0), 0x10406); // DESERET SMALL LETTER SHORT I, DESERET CAPITAL LETTER SHORT I
assertEq(String.fromCodePoint(0x1042F).toUpperCase().codePointAt(0), 0x10407); // DESERET SMALL LETTER SHORT E, DESERET CAPITAL LETTER SHORT E
assertEq(String.fromCodePoint(0x10430).toUpperCase().codePointAt(0), 0x10408); // DESERET SMALL LETTER SHORT A, DESERET CAPITAL LETTER SHORT A
assertEq(String.fromCodePoint(0x10431).toUpperCase().codePointAt(0), 0x10409); // DESERET SMALL LETTER SHORT AH, DESERET CAPITAL LETTER SHORT AH
assertEq(String.fromCodePoint(0x10432).toUpperCase().codePointAt(0), 0x1040A); // DESERET SMALL LETTER SHORT O, DESERET CAPITAL LETTER SHORT O
assertEq(String.fromCodePoint(0x10433).toUpperCase().codePointAt(0), 0x1040B); // DESERET SMALL LETTER SHORT OO, DESERET CAPITAL LETTER SHORT OO
assertEq(String.fromCodePoint(0x10434).toUpperCase().codePointAt(0), 0x1040C); // DESERET SMALL LETTER AY, DESERET CAPITAL LETTER AY
assertEq(String.fromCodePoint(0x10435).toUpperCase().codePointAt(0), 0x1040D); // DESERET SMALL LETTER OW, DESERET CAPITAL LETTER OW
assertEq(String.fromCodePoint(0x10436).toUpperCase().codePointAt(0), 0x1040E); // DESERET SMALL LETTER WU, DESERET CAPITAL LETTER WU
assertEq(String.fromCodePoint(0x10437).toUpperCase().codePointAt(0), 0x1040F); // DESERET SMALL LETTER YEE, DESERET CAPITAL LETTER YEE
assertEq(String.fromCodePoint(0x10438).toUpperCase().codePointAt(0), 0x10410); // DESERET SMALL LETTER H, DESERET CAPITAL LETTER H
assertEq(String.fromCodePoint(0x10439).toUpperCase().codePointAt(0), 0x10411); // DESERET SMALL LETTER PEE, DESERET CAPITAL LETTER PEE
assertEq(String.fromCodePoint(0x1043A).toUpperCase().codePointAt(0), 0x10412); // DESERET SMALL LETTER BEE, DESERET CAPITAL LETTER BEE
assertEq(String.fromCodePoint(0x1043B).toUpperCase().codePointAt(0), 0x10413); // DESERET SMALL LETTER TEE, DESERET CAPITAL LETTER TEE
assertEq(String.fromCodePoint(0x1043C).toUpperCase().codePointAt(0), 0x10414); // DESERET SMALL LETTER DEE, DESERET CAPITAL LETTER DEE
assertEq(String.fromCodePoint(0x1043D).toUpperCase().codePointAt(0), 0x10415); // DESERET SMALL LETTER CHEE, DESERET CAPITAL LETTER CHEE
assertEq(String.fromCodePoint(0x1043E).toUpperCase().codePointAt(0), 0x10416); // DESERET SMALL LETTER JEE, DESERET CAPITAL LETTER JEE
assertEq(String.fromCodePoint(0x1043F).toUpperCase().codePointAt(0), 0x10417); // DESERET SMALL LETTER KAY, DESERET CAPITAL LETTER KAY
assertEq(String.fromCodePoint(0x10440).toUpperCase().codePointAt(0), 0x10418); // DESERET SMALL LETTER GAY, DESERET CAPITAL LETTER GAY
assertEq(String.fromCodePoint(0x10441).toUpperCase().codePointAt(0), 0x10419); // DESERET SMALL LETTER EF, DESERET CAPITAL LETTER EF
assertEq(String.fromCodePoint(0x10442).toUpperCase().codePointAt(0), 0x1041A); // DESERET SMALL LETTER VEE, DESERET CAPITAL LETTER VEE
assertEq(String.fromCodePoint(0x10443).toUpperCase().codePointAt(0), 0x1041B); // DESERET SMALL LETTER ETH, DESERET CAPITAL LETTER ETH
assertEq(String.fromCodePoint(0x10444).toUpperCase().codePointAt(0), 0x1041C); // DESERET SMALL LETTER THEE, DESERET CAPITAL LETTER THEE
assertEq(String.fromCodePoint(0x10445).toUpperCase().codePointAt(0), 0x1041D); // DESERET SMALL LETTER ES, DESERET CAPITAL LETTER ES
assertEq(String.fromCodePoint(0x10446).toUpperCase().codePointAt(0), 0x1041E); // DESERET SMALL LETTER ZEE, DESERET CAPITAL LETTER ZEE
assertEq(String.fromCodePoint(0x10447).toUpperCase().codePointAt(0), 0x1041F); // DESERET SMALL LETTER ESH, DESERET CAPITAL LETTER ESH
assertEq(String.fromCodePoint(0x10448).toUpperCase().codePointAt(0), 0x10420); // DESERET SMALL LETTER ZHEE, DESERET CAPITAL LETTER ZHEE
assertEq(String.fromCodePoint(0x10449).toUpperCase().codePointAt(0), 0x10421); // DESERET SMALL LETTER ER, DESERET CAPITAL LETTER ER
assertEq(String.fromCodePoint(0x1044A).toUpperCase().codePointAt(0), 0x10422); // DESERET SMALL LETTER EL, DESERET CAPITAL LETTER EL
assertEq(String.fromCodePoint(0x1044B).toUpperCase().codePointAt(0), 0x10423); // DESERET SMALL LETTER EM, DESERET CAPITAL LETTER EM
assertEq(String.fromCodePoint(0x1044C).toUpperCase().codePointAt(0), 0x10424); // DESERET SMALL LETTER EN, DESERET CAPITAL LETTER EN
assertEq(String.fromCodePoint(0x1044D).toUpperCase().codePointAt(0), 0x10425); // DESERET SMALL LETTER ENG, DESERET CAPITAL LETTER ENG
assertEq(String.fromCodePoint(0x1044E).toUpperCase().codePointAt(0), 0x10426); // DESERET SMALL LETTER OI, DESERET CAPITAL LETTER OI
assertEq(String.fromCodePoint(0x1044F).toUpperCase().codePointAt(0), 0x10427); // DESERET SMALL LETTER EW, DESERET CAPITAL LETTER EW
assertEq(String.fromCodePoint(0x104D8).toUpperCase().codePointAt(0), 0x104B0); // OSAGE SMALL LETTER A, OSAGE CAPITAL LETTER A
assertEq(String.fromCodePoint(0x104D9).toUpperCase().codePointAt(0), 0x104B1); // OSAGE SMALL LETTER AI, OSAGE CAPITAL LETTER AI
assertEq(String.fromCodePoint(0x104DA).toUpperCase().codePointAt(0), 0x104B2); // OSAGE SMALL LETTER AIN, OSAGE CAPITAL LETTER AIN
assertEq(String.fromCodePoint(0x104DB).toUpperCase().codePointAt(0), 0x104B3); // OSAGE SMALL LETTER AH, OSAGE CAPITAL LETTER AH
assertEq(String.fromCodePoint(0x104DC).toUpperCase().codePointAt(0), 0x104B4); // OSAGE SMALL LETTER BRA, OSAGE CAPITAL LETTER BRA
assertEq(String.fromCodePoint(0x104DD).toUpperCase().codePointAt(0), 0x104B5); // OSAGE SMALL LETTER CHA, OSAGE CAPITAL LETTER CHA
assertEq(String.fromCodePoint(0x104DE).toUpperCase().codePointAt(0), 0x104B6); // OSAGE SMALL LETTER EHCHA, OSAGE CAPITAL LETTER EHCHA
assertEq(String.fromCodePoint(0x104DF).toUpperCase().codePointAt(0), 0x104B7); // OSAGE SMALL LETTER E, OSAGE CAPITAL LETTER E
assertEq(String.fromCodePoint(0x104E0).toUpperCase().codePointAt(0), 0x104B8); // OSAGE SMALL LETTER EIN, OSAGE CAPITAL LETTER EIN
assertEq(String.fromCodePoint(0x104E1).toUpperCase().codePointAt(0), 0x104B9); // OSAGE SMALL LETTER HA, OSAGE CAPITAL LETTER HA
assertEq(String.fromCodePoint(0x104E2).toUpperCase().codePointAt(0), 0x104BA); // OSAGE SMALL LETTER HYA, OSAGE CAPITAL LETTER HYA
assertEq(String.fromCodePoint(0x104E3).toUpperCase().codePointAt(0), 0x104BB); // OSAGE SMALL LETTER I, OSAGE CAPITAL LETTER I
assertEq(String.fromCodePoint(0x104E4).toUpperCase().codePointAt(0), 0x104BC); // OSAGE SMALL LETTER KA, OSAGE CAPITAL LETTER KA
assertEq(String.fromCodePoint(0x104E5).toUpperCase().codePointAt(0), 0x104BD); // OSAGE SMALL LETTER EHKA, OSAGE CAPITAL LETTER EHKA
assertEq(String.fromCodePoint(0x104E6).toUpperCase().codePointAt(0), 0x104BE); // OSAGE SMALL LETTER KYA, OSAGE CAPITAL LETTER KYA
assertEq(String.fromCodePoint(0x104E7).toUpperCase().codePointAt(0), 0x104BF); // OSAGE SMALL LETTER LA, OSAGE CAPITAL LETTER LA
assertEq(String.fromCodePoint(0x104E8).toUpperCase().codePointAt(0), 0x104C0); // OSAGE SMALL LETTER MA, OSAGE CAPITAL LETTER MA
assertEq(String.fromCodePoint(0x104E9).toUpperCase().codePointAt(0), 0x104C1); // OSAGE SMALL LETTER NA, OSAGE CAPITAL LETTER NA
assertEq(String.fromCodePoint(0x104EA).toUpperCase().codePointAt(0), 0x104C2); // OSAGE SMALL LETTER O, OSAGE CAPITAL LETTER O
assertEq(String.fromCodePoint(0x104EB).toUpperCase().codePointAt(0), 0x104C3); // OSAGE SMALL LETTER OIN, OSAGE CAPITAL LETTER OIN
assertEq(String.fromCodePoint(0x104EC).toUpperCase().codePointAt(0), 0x104C4); // OSAGE SMALL LETTER PA, OSAGE CAPITAL LETTER PA
assertEq(String.fromCodePoint(0x104ED).toUpperCase().codePointAt(0), 0x104C5); // OSAGE SMALL LETTER EHPA, OSAGE CAPITAL LETTER EHPA
assertEq(String.fromCodePoint(0x104EE).toUpperCase().codePointAt(0), 0x104C6); // OSAGE SMALL LETTER SA, OSAGE CAPITAL LETTER SA
assertEq(String.fromCodePoint(0x104EF).toUpperCase().codePointAt(0), 0x104C7); // OSAGE SMALL LETTER SHA, OSAGE CAPITAL LETTER SHA
assertEq(String.fromCodePoint(0x104F0).toUpperCase().codePointAt(0), 0x104C8); // OSAGE SMALL LETTER TA, OSAGE CAPITAL LETTER TA
assertEq(String.fromCodePoint(0x104F1).toUpperCase().codePointAt(0), 0x104C9); // OSAGE SMALL LETTER EHTA, OSAGE CAPITAL LETTER EHTA
assertEq(String.fromCodePoint(0x104F2).toUpperCase().codePointAt(0), 0x104CA); // OSAGE SMALL LETTER TSA, OSAGE CAPITAL LETTER TSA
assertEq(String.fromCodePoint(0x104F3).toUpperCase().codePointAt(0), 0x104CB); // OSAGE SMALL LETTER EHTSA, OSAGE CAPITAL LETTER EHTSA
assertEq(String.fromCodePoint(0x104F4).toUpperCase().codePointAt(0), 0x104CC); // OSAGE SMALL LETTER TSHA, OSAGE CAPITAL LETTER TSHA
assertEq(String.fromCodePoint(0x104F5).toUpperCase().codePointAt(0), 0x104CD); // OSAGE SMALL LETTER DHA, OSAGE CAPITAL LETTER DHA
assertEq(String.fromCodePoint(0x104F6).toUpperCase().codePointAt(0), 0x104CE); // OSAGE SMALL LETTER U, OSAGE CAPITAL LETTER U
assertEq(String.fromCodePoint(0x104F7).toUpperCase().codePointAt(0), 0x104CF); // OSAGE SMALL LETTER WA, OSAGE CAPITAL LETTER WA
assertEq(String.fromCodePoint(0x104F8).toUpperCase().codePointAt(0), 0x104D0); // OSAGE SMALL LETTER KHA, OSAGE CAPITAL LETTER KHA
assertEq(String.fromCodePoint(0x104F9).toUpperCase().codePointAt(0), 0x104D1); // OSAGE SMALL LETTER GHA, OSAGE CAPITAL LETTER GHA
assertEq(String.fromCodePoint(0x104FA).toUpperCase().codePointAt(0), 0x104D2); // OSAGE SMALL LETTER ZA, OSAGE CAPITAL LETTER ZA
assertEq(String.fromCodePoint(0x104FB).toUpperCase().codePointAt(0), 0x104D3); // OSAGE SMALL LETTER ZHA, OSAGE CAPITAL LETTER ZHA
assertEq(String.fromCodePoint(0x10597).toUpperCase().codePointAt(0), 0x10570); // VITHKUQI SMALL LETTER A, VITHKUQI CAPITAL LETTER A
assertEq(String.fromCodePoint(0x10598).toUpperCase().codePointAt(0), 0x10571); // VITHKUQI SMALL LETTER BBE, VITHKUQI CAPITAL LETTER BBE
assertEq(String.fromCodePoint(0x10599).toUpperCase().codePointAt(0), 0x10572); // VITHKUQI SMALL LETTER BE, VITHKUQI CAPITAL LETTER BE
assertEq(String.fromCodePoint(0x1059A).toUpperCase().codePointAt(0), 0x10573); // VITHKUQI SMALL LETTER CE, VITHKUQI CAPITAL LETTER CE
assertEq(String.fromCodePoint(0x1059B).toUpperCase().codePointAt(0), 0x10574); // VITHKUQI SMALL LETTER CHE, VITHKUQI CAPITAL LETTER CHE
assertEq(String.fromCodePoint(0x1059C).toUpperCase().codePointAt(0), 0x10575); // VITHKUQI SMALL LETTER DE, VITHKUQI CAPITAL LETTER DE
assertEq(String.fromCodePoint(0x1059D).toUpperCase().codePointAt(0), 0x10576); // VITHKUQI SMALL LETTER DHE, VITHKUQI CAPITAL LETTER DHE
assertEq(String.fromCodePoint(0x1059E).toUpperCase().codePointAt(0), 0x10577); // VITHKUQI SMALL LETTER EI, VITHKUQI CAPITAL LETTER EI
assertEq(String.fromCodePoint(0x1059F).toUpperCase().codePointAt(0), 0x10578); // VITHKUQI SMALL LETTER E, VITHKUQI CAPITAL LETTER E
assertEq(String.fromCodePoint(0x105A0).toUpperCase().codePointAt(0), 0x10579); // VITHKUQI SMALL LETTER FE, VITHKUQI CAPITAL LETTER FE
assertEq(String.fromCodePoint(0x105A1).toUpperCase().codePointAt(0), 0x1057A); // VITHKUQI SMALL LETTER GA, VITHKUQI CAPITAL LETTER GA
assertEq(String.fromCodePoint(0x105A3).toUpperCase().codePointAt(0), 0x1057C); // VITHKUQI SMALL LETTER HA, VITHKUQI CAPITAL LETTER HA
assertEq(String.fromCodePoint(0x105A4).toUpperCase().codePointAt(0), 0x1057D); // VITHKUQI SMALL LETTER HHA, VITHKUQI CAPITAL LETTER HHA
assertEq(String.fromCodePoint(0x105A5).toUpperCase().codePointAt(0), 0x1057E); // VITHKUQI SMALL LETTER I, VITHKUQI CAPITAL LETTER I
assertEq(String.fromCodePoint(0x105A6).toUpperCase().codePointAt(0), 0x1057F); // VITHKUQI SMALL LETTER IJE, VITHKUQI CAPITAL LETTER IJE
assertEq(String.fromCodePoint(0x105A7).toUpperCase().codePointAt(0), 0x10580); // VITHKUQI SMALL LETTER JE, VITHKUQI CAPITAL LETTER JE
assertEq(String.fromCodePoint(0x105A8).toUpperCase().codePointAt(0), 0x10581); // VITHKUQI SMALL LETTER KA, VITHKUQI CAPITAL LETTER KA
assertEq(String.fromCodePoint(0x105A9).toUpperCase().codePointAt(0), 0x10582); // VITHKUQI SMALL LETTER LA, VITHKUQI CAPITAL LETTER LA
assertEq(String.fromCodePoint(0x105AA).toUpperCase().codePointAt(0), 0x10583); // VITHKUQI SMALL LETTER LLA, VITHKUQI CAPITAL LETTER LLA
assertEq(String.fromCodePoint(0x105AB).toUpperCase().codePointAt(0), 0x10584); // VITHKUQI SMALL LETTER ME, VITHKUQI CAPITAL LETTER ME
assertEq(String.fromCodePoint(0x105AC).toUpperCase().codePointAt(0), 0x10585); // VITHKUQI SMALL LETTER NE, VITHKUQI CAPITAL LETTER NE
assertEq(String.fromCodePoint(0x105AD).toUpperCase().codePointAt(0), 0x10586); // VITHKUQI SMALL LETTER NJE, VITHKUQI CAPITAL LETTER NJE
assertEq(String.fromCodePoint(0x105AE).toUpperCase().codePointAt(0), 0x10587); // VITHKUQI SMALL LETTER O, VITHKUQI CAPITAL LETTER O
assertEq(String.fromCodePoint(0x105AF).toUpperCase().codePointAt(0), 0x10588); // VITHKUQI SMALL LETTER PE, VITHKUQI CAPITAL LETTER PE
assertEq(String.fromCodePoint(0x105B0).toUpperCase().codePointAt(0), 0x10589); // VITHKUQI SMALL LETTER QA, VITHKUQI CAPITAL LETTER QA
assertEq(String.fromCodePoint(0x105B1).toUpperCase().codePointAt(0), 0x1058A); // VITHKUQI SMALL LETTER RE, VITHKUQI CAPITAL LETTER RE
assertEq(String.fromCodePoint(0x105B3).toUpperCase().codePointAt(0), 0x1058C); // VITHKUQI SMALL LETTER SE, VITHKUQI CAPITAL LETTER SE
assertEq(String.fromCodePoint(0x105B4).toUpperCase().codePointAt(0), 0x1058D); // VITHKUQI SMALL LETTER SHE, VITHKUQI CAPITAL LETTER SHE
assertEq(String.fromCodePoint(0x105B5).toUpperCase().codePointAt(0), 0x1058E); // VITHKUQI SMALL LETTER TE, VITHKUQI CAPITAL LETTER TE
assertEq(String.fromCodePoint(0x105B6).toUpperCase().codePointAt(0), 0x1058F); // VITHKUQI SMALL LETTER THE, VITHKUQI CAPITAL LETTER THE
assertEq(String.fromCodePoint(0x105B7).toUpperCase().codePointAt(0), 0x10590); // VITHKUQI SMALL LETTER U, VITHKUQI CAPITAL LETTER U
assertEq(String.fromCodePoint(0x105B8).toUpperCase().codePointAt(0), 0x10591); // VITHKUQI SMALL LETTER VE, VITHKUQI CAPITAL LETTER VE
assertEq(String.fromCodePoint(0x105B9).toUpperCase().codePointAt(0), 0x10592); // VITHKUQI SMALL LETTER XE, VITHKUQI CAPITAL LETTER XE
assertEq(String.fromCodePoint(0x105BB).toUpperCase().codePointAt(0), 0x10594); // VITHKUQI SMALL LETTER Y, VITHKUQI CAPITAL LETTER Y
assertEq(String.fromCodePoint(0x105BC).toUpperCase().codePointAt(0), 0x10595); // VITHKUQI SMALL LETTER ZE, VITHKUQI CAPITAL LETTER ZE
assertEq(String.fromCodePoint(0x10CC0).toUpperCase().codePointAt(0), 0x10C80); // OLD HUNGARIAN SMALL LETTER A, OLD HUNGARIAN CAPITAL LETTER A
assertEq(String.fromCodePoint(0x10CC1).toUpperCase().codePointAt(0), 0x10C81); // OLD HUNGARIAN SMALL LETTER AA, OLD HUNGARIAN CAPITAL LETTER AA
assertEq(String.fromCodePoint(0x10CC2).toUpperCase().codePointAt(0), 0x10C82); // OLD HUNGARIAN SMALL LETTER EB, OLD HUNGARIAN CAPITAL LETTER EB
assertEq(String.fromCodePoint(0x10CC3).toUpperCase().codePointAt(0), 0x10C83); // OLD HUNGARIAN SMALL LETTER AMB, OLD HUNGARIAN CAPITAL LETTER AMB
assertEq(String.fromCodePoint(0x10CC4).toUpperCase().codePointAt(0), 0x10C84); // OLD HUNGARIAN SMALL LETTER EC, OLD HUNGARIAN CAPITAL LETTER EC
assertEq(String.fromCodePoint(0x10CC5).toUpperCase().codePointAt(0), 0x10C85); // OLD HUNGARIAN SMALL LETTER ENC, OLD HUNGARIAN CAPITAL LETTER ENC
assertEq(String.fromCodePoint(0x10CC6).toUpperCase().codePointAt(0), 0x10C86); // OLD HUNGARIAN SMALL LETTER ECS, OLD HUNGARIAN CAPITAL LETTER ECS
assertEq(String.fromCodePoint(0x10CC7).toUpperCase().codePointAt(0), 0x10C87); // OLD HUNGARIAN SMALL LETTER ED, OLD HUNGARIAN CAPITAL LETTER ED
assertEq(String.fromCodePoint(0x10CC8).toUpperCase().codePointAt(0), 0x10C88); // OLD HUNGARIAN SMALL LETTER AND, OLD HUNGARIAN CAPITAL LETTER AND
assertEq(String.fromCodePoint(0x10CC9).toUpperCase().codePointAt(0), 0x10C89); // OLD HUNGARIAN SMALL LETTER E, OLD HUNGARIAN CAPITAL LETTER E
assertEq(String.fromCodePoint(0x10CCA).toUpperCase().codePointAt(0), 0x10C8A); // OLD HUNGARIAN SMALL LETTER CLOSE E, OLD HUNGARIAN CAPITAL LETTER CLOSE E
assertEq(String.fromCodePoint(0x10CCB).toUpperCase().codePointAt(0), 0x10C8B); // OLD HUNGARIAN SMALL LETTER EE, OLD HUNGARIAN CAPITAL LETTER EE
assertEq(String.fromCodePoint(0x10CCC).toUpperCase().codePointAt(0), 0x10C8C); // OLD HUNGARIAN SMALL LETTER EF, OLD HUNGARIAN CAPITAL LETTER EF
assertEq(String.fromCodePoint(0x10CCD).toUpperCase().codePointAt(0), 0x10C8D); // OLD HUNGARIAN SMALL LETTER EG, OLD HUNGARIAN CAPITAL LETTER EG
assertEq(String.fromCodePoint(0x10CCE).toUpperCase().codePointAt(0), 0x10C8E); // OLD HUNGARIAN SMALL LETTER EGY, OLD HUNGARIAN CAPITAL LETTER EGY
assertEq(String.fromCodePoint(0x10CCF).toUpperCase().codePointAt(0), 0x10C8F); // OLD HUNGARIAN SMALL LETTER EH, OLD HUNGARIAN CAPITAL LETTER EH
assertEq(String.fromCodePoint(0x10CD0).toUpperCase().codePointAt(0), 0x10C90); // OLD HUNGARIAN SMALL LETTER I, OLD HUNGARIAN CAPITAL LETTER I
assertEq(String.fromCodePoint(0x10CD1).toUpperCase().codePointAt(0), 0x10C91); // OLD HUNGARIAN SMALL LETTER II, OLD HUNGARIAN CAPITAL LETTER II
assertEq(String.fromCodePoint(0x10CD2).toUpperCase().codePointAt(0), 0x10C92); // OLD HUNGARIAN SMALL LETTER EJ, OLD HUNGARIAN CAPITAL LETTER EJ
assertEq(String.fromCodePoint(0x10CD3).toUpperCase().codePointAt(0), 0x10C93); // OLD HUNGARIAN SMALL LETTER EK, OLD HUNGARIAN CAPITAL LETTER EK
assertEq(String.fromCodePoint(0x10CD4).toUpperCase().codePointAt(0), 0x10C94); // OLD HUNGARIAN SMALL LETTER AK, OLD HUNGARIAN CAPITAL LETTER AK
assertEq(String.fromCodePoint(0x10CD5).toUpperCase().codePointAt(0), 0x10C95); // OLD HUNGARIAN SMALL LETTER UNK, OLD HUNGARIAN CAPITAL LETTER UNK
assertEq(String.fromCodePoint(0x10CD6).toUpperCase().codePointAt(0), 0x10C96); // OLD HUNGARIAN SMALL LETTER EL, OLD HUNGARIAN CAPITAL LETTER EL
assertEq(String.fromCodePoint(0x10CD7).toUpperCase().codePointAt(0), 0x10C97); // OLD HUNGARIAN SMALL LETTER ELY, OLD HUNGARIAN CAPITAL LETTER ELY
assertEq(String.fromCodePoint(0x10CD8).toUpperCase().codePointAt(0), 0x10C98); // OLD HUNGARIAN SMALL LETTER EM, OLD HUNGARIAN CAPITAL LETTER EM
assertEq(String.fromCodePoint(0x10CD9).toUpperCase().codePointAt(0), 0x10C99); // OLD HUNGARIAN SMALL LETTER EN, OLD HUNGARIAN CAPITAL LETTER EN
assertEq(String.fromCodePoint(0x10CDA).toUpperCase().codePointAt(0), 0x10C9A); // OLD HUNGARIAN SMALL LETTER ENY, OLD HUNGARIAN CAPITAL LETTER ENY
assertEq(String.fromCodePoint(0x10CDB).toUpperCase().codePointAt(0), 0x10C9B); // OLD HUNGARIAN SMALL LETTER O, OLD HUNGARIAN CAPITAL LETTER O
assertEq(String.fromCodePoint(0x10CDC).toUpperCase().codePointAt(0), 0x10C9C); // OLD HUNGARIAN SMALL LETTER OO, OLD HUNGARIAN CAPITAL LETTER OO
assertEq(String.fromCodePoint(0x10CDD).toUpperCase().codePointAt(0), 0x10C9D); // OLD HUNGARIAN SMALL LETTER NIKOLSBURG OE, OLD HUNGARIAN CAPITAL LETTER NIKOLSBURG OE
assertEq(String.fromCodePoint(0x10CDE).toUpperCase().codePointAt(0), 0x10C9E); // OLD HUNGARIAN SMALL LETTER RUDIMENTA OE, OLD HUNGARIAN CAPITAL LETTER RUDIMENTA OE
assertEq(String.fromCodePoint(0x10CDF).toUpperCase().codePointAt(0), 0x10C9F); // OLD HUNGARIAN SMALL LETTER OEE, OLD HUNGARIAN CAPITAL LETTER OEE
assertEq(String.fromCodePoint(0x10CE0).toUpperCase().codePointAt(0), 0x10CA0); // OLD HUNGARIAN SMALL LETTER EP, OLD HUNGARIAN CAPITAL LETTER EP
assertEq(String.fromCodePoint(0x10CE1).toUpperCase().codePointAt(0), 0x10CA1); // OLD HUNGARIAN SMALL LETTER EMP, OLD HUNGARIAN CAPITAL LETTER EMP
assertEq(String.fromCodePoint(0x10CE2).toUpperCase().codePointAt(0), 0x10CA2); // OLD HUNGARIAN SMALL LETTER ER, OLD HUNGARIAN CAPITAL LETTER ER
assertEq(String.fromCodePoint(0x10CE3).toUpperCase().codePointAt(0), 0x10CA3); // OLD HUNGARIAN SMALL LETTER SHORT ER, OLD HUNGARIAN CAPITAL LETTER SHORT ER
assertEq(String.fromCodePoint(0x10CE4).toUpperCase().codePointAt(0), 0x10CA4); // OLD HUNGARIAN SMALL LETTER ES, OLD HUNGARIAN CAPITAL LETTER ES
assertEq(String.fromCodePoint(0x10CE5).toUpperCase().codePointAt(0), 0x10CA5); // OLD HUNGARIAN SMALL LETTER ESZ, OLD HUNGARIAN CAPITAL LETTER ESZ
assertEq(String.fromCodePoint(0x10CE6).toUpperCase().codePointAt(0), 0x10CA6); // OLD HUNGARIAN SMALL LETTER ET, OLD HUNGARIAN CAPITAL LETTER ET
assertEq(String.fromCodePoint(0x10CE7).toUpperCase().codePointAt(0), 0x10CA7); // OLD HUNGARIAN SMALL LETTER ENT, OLD HUNGARIAN CAPITAL LETTER ENT
assertEq(String.fromCodePoint(0x10CE8).toUpperCase().codePointAt(0), 0x10CA8); // OLD HUNGARIAN SMALL LETTER ETY, OLD HUNGARIAN CAPITAL LETTER ETY
assertEq(String.fromCodePoint(0x10CE9).toUpperCase().codePointAt(0), 0x10CA9); // OLD HUNGARIAN SMALL LETTER ECH, OLD HUNGARIAN CAPITAL LETTER ECH
assertEq(String.fromCodePoint(0x10CEA).toUpperCase().codePointAt(0), 0x10CAA); // OLD HUNGARIAN SMALL LETTER U, OLD HUNGARIAN CAPITAL LETTER U
assertEq(String.fromCodePoint(0x10CEB).toUpperCase().codePointAt(0), 0x10CAB); // OLD HUNGARIAN SMALL LETTER UU, OLD HUNGARIAN CAPITAL LETTER UU
assertEq(String.fromCodePoint(0x10CEC).toUpperCase().codePointAt(0), 0x10CAC); // OLD HUNGARIAN SMALL LETTER NIKOLSBURG UE, OLD HUNGARIAN CAPITAL LETTER NIKOLSBURG UE
assertEq(String.fromCodePoint(0x10CED).toUpperCase().codePointAt(0), 0x10CAD); // OLD HUNGARIAN SMALL LETTER RUDIMENTA UE, OLD HUNGARIAN CAPITAL LETTER RUDIMENTA UE
assertEq(String.fromCodePoint(0x10CEE).toUpperCase().codePointAt(0), 0x10CAE); // OLD HUNGARIAN SMALL LETTER EV, OLD HUNGARIAN CAPITAL LETTER EV
assertEq(String.fromCodePoint(0x10CEF).toUpperCase().codePointAt(0), 0x10CAF); // OLD HUNGARIAN SMALL LETTER EZ, OLD HUNGARIAN CAPITAL LETTER EZ
assertEq(String.fromCodePoint(0x10CF0).toUpperCase().codePointAt(0), 0x10CB0); // OLD HUNGARIAN SMALL LETTER EZS, OLD HUNGARIAN CAPITAL LETTER EZS
assertEq(String.fromCodePoint(0x10CF1).toUpperCase().codePointAt(0), 0x10CB1); // OLD HUNGARIAN SMALL LETTER ENT-SHAPED SIGN, OLD HUNGARIAN CAPITAL LETTER ENT-SHAPED SIGN
assertEq(String.fromCodePoint(0x10CF2).toUpperCase().codePointAt(0), 0x10CB2); // OLD HUNGARIAN SMALL LETTER US, OLD HUNGARIAN CAPITAL LETTER US
assertEq(String.fromCodePoint(0x118C0).toUpperCase().codePointAt(0), 0x118A0); // WARANG CITI SMALL LETTER NGAA, WARANG CITI CAPITAL LETTER NGAA
assertEq(String.fromCodePoint(0x118C1).toUpperCase().codePointAt(0), 0x118A1); // WARANG CITI SMALL LETTER A, WARANG CITI CAPITAL LETTER A
assertEq(String.fromCodePoint(0x118C2).toUpperCase().codePointAt(0), 0x118A2); // WARANG CITI SMALL LETTER WI, WARANG CITI CAPITAL LETTER WI
assertEq(String.fromCodePoint(0x118C3).toUpperCase().codePointAt(0), 0x118A3); // WARANG CITI SMALL LETTER YU, WARANG CITI CAPITAL LETTER YU
assertEq(String.fromCodePoint(0x118C4).toUpperCase().codePointAt(0), 0x118A4); // WARANG CITI SMALL LETTER YA, WARANG CITI CAPITAL LETTER YA
assertEq(String.fromCodePoint(0x118C5).toUpperCase().codePointAt(0), 0x118A5); // WARANG CITI SMALL LETTER YO, WARANG CITI CAPITAL LETTER YO
assertEq(String.fromCodePoint(0x118C6).toUpperCase().codePointAt(0), 0x118A6); // WARANG CITI SMALL LETTER II, WARANG CITI CAPITAL LETTER II
assertEq(String.fromCodePoint(0x118C7).toUpperCase().codePointAt(0), 0x118A7); // WARANG CITI SMALL LETTER UU, WARANG CITI CAPITAL LETTER UU
assertEq(String.fromCodePoint(0x118C8).toUpperCase().codePointAt(0), 0x118A8); // WARANG CITI SMALL LETTER E, WARANG CITI CAPITAL LETTER E
assertEq(String.fromCodePoint(0x118C9).toUpperCase().codePointAt(0), 0x118A9); // WARANG CITI SMALL LETTER O, WARANG CITI CAPITAL LETTER O
assertEq(String.fromCodePoint(0x118CA).toUpperCase().codePointAt(0), 0x118AA); // WARANG CITI SMALL LETTER ANG, WARANG CITI CAPITAL LETTER ANG
assertEq(String.fromCodePoint(0x118CB).toUpperCase().codePointAt(0), 0x118AB); // WARANG CITI SMALL LETTER GA, WARANG CITI CAPITAL LETTER GA
assertEq(String.fromCodePoint(0x118CC).toUpperCase().codePointAt(0), 0x118AC); // WARANG CITI SMALL LETTER KO, WARANG CITI CAPITAL LETTER KO
assertEq(String.fromCodePoint(0x118CD).toUpperCase().codePointAt(0), 0x118AD); // WARANG CITI SMALL LETTER ENY, WARANG CITI CAPITAL LETTER ENY
assertEq(String.fromCodePoint(0x118CE).toUpperCase().codePointAt(0), 0x118AE); // WARANG CITI SMALL LETTER YUJ, WARANG CITI CAPITAL LETTER YUJ
assertEq(String.fromCodePoint(0x118CF).toUpperCase().codePointAt(0), 0x118AF); // WARANG CITI SMALL LETTER UC, WARANG CITI CAPITAL LETTER UC
assertEq(String.fromCodePoint(0x118D0).toUpperCase().codePointAt(0), 0x118B0); // WARANG CITI SMALL LETTER ENN, WARANG CITI CAPITAL LETTER ENN
assertEq(String.fromCodePoint(0x118D1).toUpperCase().codePointAt(0), 0x118B1); // WARANG CITI SMALL LETTER ODD, WARANG CITI CAPITAL LETTER ODD
assertEq(String.fromCodePoint(0x118D2).toUpperCase().codePointAt(0), 0x118B2); // WARANG CITI SMALL LETTER TTE, WARANG CITI CAPITAL LETTER TTE
assertEq(String.fromCodePoint(0x118D3).toUpperCase().codePointAt(0), 0x118B3); // WARANG CITI SMALL LETTER NUNG, WARANG CITI CAPITAL LETTER NUNG
assertEq(String.fromCodePoint(0x118D4).toUpperCase().codePointAt(0), 0x118B4); // WARANG CITI SMALL LETTER DA, WARANG CITI CAPITAL LETTER DA
assertEq(String.fromCodePoint(0x118D5).toUpperCase().codePointAt(0), 0x118B5); // WARANG CITI SMALL LETTER AT, WARANG CITI CAPITAL LETTER AT
assertEq(String.fromCodePoint(0x118D6).toUpperCase().codePointAt(0), 0x118B6); // WARANG CITI SMALL LETTER AM, WARANG CITI CAPITAL LETTER AM
assertEq(String.fromCodePoint(0x118D7).toUpperCase().codePointAt(0), 0x118B7); // WARANG CITI SMALL LETTER BU, WARANG CITI CAPITAL LETTER BU
assertEq(String.fromCodePoint(0x118D8).toUpperCase().codePointAt(0), 0x118B8); // WARANG CITI SMALL LETTER PU, WARANG CITI CAPITAL LETTER PU
assertEq(String.fromCodePoint(0x118D9).toUpperCase().codePointAt(0), 0x118B9); // WARANG CITI SMALL LETTER HIYO, WARANG CITI CAPITAL LETTER HIYO
assertEq(String.fromCodePoint(0x118DA).toUpperCase().codePointAt(0), 0x118BA); // WARANG CITI SMALL LETTER HOLO, WARANG CITI CAPITAL LETTER HOLO
assertEq(String.fromCodePoint(0x118DB).toUpperCase().codePointAt(0), 0x118BB); // WARANG CITI SMALL LETTER HORR, WARANG CITI CAPITAL LETTER HORR
assertEq(String.fromCodePoint(0x118DC).toUpperCase().codePointAt(0), 0x118BC); // WARANG CITI SMALL LETTER HAR, WARANG CITI CAPITAL LETTER HAR
assertEq(String.fromCodePoint(0x118DD).toUpperCase().codePointAt(0), 0x118BD); // WARANG CITI SMALL LETTER SSUU, WARANG CITI CAPITAL LETTER SSUU
assertEq(String.fromCodePoint(0x118DE).toUpperCase().codePointAt(0), 0x118BE); // WARANG CITI SMALL LETTER SII, WARANG CITI CAPITAL LETTER SII
assertEq(String.fromCodePoint(0x118DF).toUpperCase().codePointAt(0), 0x118BF); // WARANG CITI SMALL LETTER VIYO, WARANG CITI CAPITAL LETTER VIYO
assertEq(String.fromCodePoint(0x16E60).toUpperCase().codePointAt(0), 0x16E40); // MEDEFAIDRIN SMALL LETTER M, MEDEFAIDRIN CAPITAL LETTER M
assertEq(String.fromCodePoint(0x16E61).toUpperCase().codePointAt(0), 0x16E41); // MEDEFAIDRIN SMALL LETTER S, MEDEFAIDRIN CAPITAL LETTER S
assertEq(String.fromCodePoint(0x16E62).toUpperCase().codePointAt(0), 0x16E42); // MEDEFAIDRIN SMALL LETTER V, MEDEFAIDRIN CAPITAL LETTER V
assertEq(String.fromCodePoint(0x16E63).toUpperCase().codePointAt(0), 0x16E43); // MEDEFAIDRIN SMALL LETTER W, MEDEFAIDRIN CAPITAL LETTER W
assertEq(String.fromCodePoint(0x16E64).toUpperCase().codePointAt(0), 0x16E44); // MEDEFAIDRIN SMALL LETTER ATIU, MEDEFAIDRIN CAPITAL LETTER ATIU
assertEq(String.fromCodePoint(0x16E65).toUpperCase().codePointAt(0), 0x16E45); // MEDEFAIDRIN SMALL LETTER Z, MEDEFAIDRIN CAPITAL LETTER Z
assertEq(String.fromCodePoint(0x16E66).toUpperCase().codePointAt(0), 0x16E46); // MEDEFAIDRIN SMALL LETTER KP, MEDEFAIDRIN CAPITAL LETTER KP
assertEq(String.fromCodePoint(0x16E67).toUpperCase().codePointAt(0), 0x16E47); // MEDEFAIDRIN SMALL LETTER P, MEDEFAIDRIN CAPITAL LETTER P
assertEq(String.fromCodePoint(0x16E68).toUpperCase().codePointAt(0), 0x16E48); // MEDEFAIDRIN SMALL LETTER T, MEDEFAIDRIN CAPITAL LETTER T
assertEq(String.fromCodePoint(0x16E69).toUpperCase().codePointAt(0), 0x16E49); // MEDEFAIDRIN SMALL LETTER G, MEDEFAIDRIN CAPITAL LETTER G
assertEq(String.fromCodePoint(0x16E6A).toUpperCase().codePointAt(0), 0x16E4A); // MEDEFAIDRIN SMALL LETTER F, MEDEFAIDRIN CAPITAL LETTER F
assertEq(String.fromCodePoint(0x16E6B).toUpperCase().codePointAt(0), 0x16E4B); // MEDEFAIDRIN SMALL LETTER I, MEDEFAIDRIN CAPITAL LETTER I
assertEq(String.fromCodePoint(0x16E6C).toUpperCase().codePointAt(0), 0x16E4C); // MEDEFAIDRIN SMALL LETTER K, MEDEFAIDRIN CAPITAL LETTER K
assertEq(String.fromCodePoint(0x16E6D).toUpperCase().codePointAt(0), 0x16E4D); // MEDEFAIDRIN SMALL LETTER A, MEDEFAIDRIN CAPITAL LETTER A
assertEq(String.fromCodePoint(0x16E6E).toUpperCase().codePointAt(0), 0x16E4E); // MEDEFAIDRIN SMALL LETTER J, MEDEFAIDRIN CAPITAL LETTER J
assertEq(String.fromCodePoint(0x16E6F).toUpperCase().codePointAt(0), 0x16E4F); // MEDEFAIDRIN SMALL LETTER E, MEDEFAIDRIN CAPITAL LETTER E
assertEq(String.fromCodePoint(0x16E70).toUpperCase().codePointAt(0), 0x16E50); // MEDEFAIDRIN SMALL LETTER B, MEDEFAIDRIN CAPITAL LETTER B
assertEq(String.fromCodePoint(0x16E71).toUpperCase().codePointAt(0), 0x16E51); // MEDEFAIDRIN SMALL LETTER C, MEDEFAIDRIN CAPITAL LETTER C
assertEq(String.fromCodePoint(0x16E72).toUpperCase().codePointAt(0), 0x16E52); // MEDEFAIDRIN SMALL LETTER U, MEDEFAIDRIN CAPITAL LETTER U
assertEq(String.fromCodePoint(0x16E73).toUpperCase().codePointAt(0), 0x16E53); // MEDEFAIDRIN SMALL LETTER YU, MEDEFAIDRIN CAPITAL LETTER YU
assertEq(String.fromCodePoint(0x16E74).toUpperCase().codePointAt(0), 0x16E54); // MEDEFAIDRIN SMALL LETTER L, MEDEFAIDRIN CAPITAL LETTER L
assertEq(String.fromCodePoint(0x16E75).toUpperCase().codePointAt(0), 0x16E55); // MEDEFAIDRIN SMALL LETTER Q, MEDEFAIDRIN CAPITAL LETTER Q
assertEq(String.fromCodePoint(0x16E76).toUpperCase().codePointAt(0), 0x16E56); // MEDEFAIDRIN SMALL LETTER HP, MEDEFAIDRIN CAPITAL LETTER HP
assertEq(String.fromCodePoint(0x16E77).toUpperCase().codePointAt(0), 0x16E57); // MEDEFAIDRIN SMALL LETTER NY, MEDEFAIDRIN CAPITAL LETTER NY
assertEq(String.fromCodePoint(0x16E78).toUpperCase().codePointAt(0), 0x16E58); // MEDEFAIDRIN SMALL LETTER X, MEDEFAIDRIN CAPITAL LETTER X
assertEq(String.fromCodePoint(0x16E79).toUpperCase().codePointAt(0), 0x16E59); // MEDEFAIDRIN SMALL LETTER D, MEDEFAIDRIN CAPITAL LETTER D
assertEq(String.fromCodePoint(0x16E7A).toUpperCase().codePointAt(0), 0x16E5A); // MEDEFAIDRIN SMALL LETTER OE, MEDEFAIDRIN CAPITAL LETTER OE
assertEq(String.fromCodePoint(0x16E7B).toUpperCase().codePointAt(0), 0x16E5B); // MEDEFAIDRIN SMALL LETTER N, MEDEFAIDRIN CAPITAL LETTER N
assertEq(String.fromCodePoint(0x16E7C).toUpperCase().codePointAt(0), 0x16E5C); // MEDEFAIDRIN SMALL LETTER R, MEDEFAIDRIN CAPITAL LETTER R
assertEq(String.fromCodePoint(0x16E7D).toUpperCase().codePointAt(0), 0x16E5D); // MEDEFAIDRIN SMALL LETTER O, MEDEFAIDRIN CAPITAL LETTER O
assertEq(String.fromCodePoint(0x16E7E).toUpperCase().codePointAt(0), 0x16E5E); // MEDEFAIDRIN SMALL LETTER AI, MEDEFAIDRIN CAPITAL LETTER AI
assertEq(String.fromCodePoint(0x16E7F).toUpperCase().codePointAt(0), 0x16E5F); // MEDEFAIDRIN SMALL LETTER Y, MEDEFAIDRIN CAPITAL LETTER Y
assertEq(String.fromCodePoint(0x1E922).toUpperCase().codePointAt(0), 0x1E900); // ADLAM SMALL LETTER ALIF, ADLAM CAPITAL LETTER ALIF
assertEq(String.fromCodePoint(0x1E923).toUpperCase().codePointAt(0), 0x1E901); // ADLAM SMALL LETTER DAALI, ADLAM CAPITAL LETTER DAALI
assertEq(String.fromCodePoint(0x1E924).toUpperCase().codePointAt(0), 0x1E902); // ADLAM SMALL LETTER LAAM, ADLAM CAPITAL LETTER LAAM
assertEq(String.fromCodePoint(0x1E925).toUpperCase().codePointAt(0), 0x1E903); // ADLAM SMALL LETTER MIIM, ADLAM CAPITAL LETTER MIIM
assertEq(String.fromCodePoint(0x1E926).toUpperCase().codePointAt(0), 0x1E904); // ADLAM SMALL LETTER BA, ADLAM CAPITAL LETTER BA
assertEq(String.fromCodePoint(0x1E927).toUpperCase().codePointAt(0), 0x1E905); // ADLAM SMALL LETTER SINNYIIYHE, ADLAM CAPITAL LETTER SINNYIIYHE
assertEq(String.fromCodePoint(0x1E928).toUpperCase().codePointAt(0), 0x1E906); // ADLAM SMALL LETTER PE, ADLAM CAPITAL LETTER PE
assertEq(String.fromCodePoint(0x1E929).toUpperCase().codePointAt(0), 0x1E907); // ADLAM SMALL LETTER BHE, ADLAM CAPITAL LETTER BHE
assertEq(String.fromCodePoint(0x1E92A).toUpperCase().codePointAt(0), 0x1E908); // ADLAM SMALL LETTER RA, ADLAM CAPITAL LETTER RA
assertEq(String.fromCodePoint(0x1E92B).toUpperCase().codePointAt(0), 0x1E909); // ADLAM SMALL LETTER E, ADLAM CAPITAL LETTER E
assertEq(String.fromCodePoint(0x1E92C).toUpperCase().codePointAt(0), 0x1E90A); // ADLAM SMALL LETTER FA, ADLAM CAPITAL LETTER FA
assertEq(String.fromCodePoint(0x1E92D).toUpperCase().codePointAt(0), 0x1E90B); // ADLAM SMALL LETTER I, ADLAM CAPITAL LETTER I
assertEq(String.fromCodePoint(0x1E92E).toUpperCase().codePointAt(0), 0x1E90C); // ADLAM SMALL LETTER O, ADLAM CAPITAL LETTER O
assertEq(String.fromCodePoint(0x1E92F).toUpperCase().codePointAt(0), 0x1E90D); // ADLAM SMALL LETTER DHA, ADLAM CAPITAL LETTER DHA
assertEq(String.fromCodePoint(0x1E930).toUpperCase().codePointAt(0), 0x1E90E); // ADLAM SMALL LETTER YHE, ADLAM CAPITAL LETTER YHE
assertEq(String.fromCodePoint(0x1E931).toUpperCase().codePointAt(0), 0x1E90F); // ADLAM SMALL LETTER WAW, ADLAM CAPITAL LETTER WAW
assertEq(String.fromCodePoint(0x1E932).toUpperCase().codePointAt(0), 0x1E910); // ADLAM SMALL LETTER NUN, ADLAM CAPITAL LETTER NUN
assertEq(String.fromCodePoint(0x1E933).toUpperCase().codePointAt(0), 0x1E911); // ADLAM SMALL LETTER KAF, ADLAM CAPITAL LETTER KAF
assertEq(String.fromCodePoint(0x1E934).toUpperCase().codePointAt(0), 0x1E912); // ADLAM SMALL LETTER YA, ADLAM CAPITAL LETTER YA
assertEq(String.fromCodePoint(0x1E935).toUpperCase().codePointAt(0), 0x1E913); // ADLAM SMALL LETTER U, ADLAM CAPITAL LETTER U
assertEq(String.fromCodePoint(0x1E936).toUpperCase().codePointAt(0), 0x1E914); // ADLAM SMALL LETTER JIIM, ADLAM CAPITAL LETTER JIIM
assertEq(String.fromCodePoint(0x1E937).toUpperCase().codePointAt(0), 0x1E915); // ADLAM SMALL LETTER CHI, ADLAM CAPITAL LETTER CHI
assertEq(String.fromCodePoint(0x1E938).toUpperCase().codePointAt(0), 0x1E916); // ADLAM SMALL LETTER HA, ADLAM CAPITAL LETTER HA
assertEq(String.fromCodePoint(0x1E939).toUpperCase().codePointAt(0), 0x1E917); // ADLAM SMALL LETTER QAAF, ADLAM CAPITAL LETTER QAAF
assertEq(String.fromCodePoint(0x1E93A).toUpperCase().codePointAt(0), 0x1E918); // ADLAM SMALL LETTER GA, ADLAM CAPITAL LETTER GA
assertEq(String.fromCodePoint(0x1E93B).toUpperCase().codePointAt(0), 0x1E919); // ADLAM SMALL LETTER NYA, ADLAM CAPITAL LETTER NYA
assertEq(String.fromCodePoint(0x1E93C).toUpperCase().codePointAt(0), 0x1E91A); // ADLAM SMALL LETTER TU, ADLAM CAPITAL LETTER TU
assertEq(String.fromCodePoint(0x1E93D).toUpperCase().codePointAt(0), 0x1E91B); // ADLAM SMALL LETTER NHA, ADLAM CAPITAL LETTER NHA
assertEq(String.fromCodePoint(0x1E93E).toUpperCase().codePointAt(0), 0x1E91C); // ADLAM SMALL LETTER VA, ADLAM CAPITAL LETTER VA
assertEq(String.fromCodePoint(0x1E93F).toUpperCase().codePointAt(0), 0x1E91D); // ADLAM SMALL LETTER KHA, ADLAM CAPITAL LETTER KHA
assertEq(String.fromCodePoint(0x1E940).toUpperCase().codePointAt(0), 0x1E91E); // ADLAM SMALL LETTER GBE, ADLAM CAPITAL LETTER GBE
assertEq(String.fromCodePoint(0x1E941).toUpperCase().codePointAt(0), 0x1E91F); // ADLAM SMALL LETTER ZAL, ADLAM CAPITAL LETTER ZAL
assertEq(String.fromCodePoint(0x1E942).toUpperCase().codePointAt(0), 0x1E920); // ADLAM SMALL LETTER KPO, ADLAM CAPITAL LETTER KPO
assertEq(String.fromCodePoint(0x1E943).toUpperCase().codePointAt(0), 0x1E921); // ADLAM SMALL LETTER SHA, ADLAM CAPITAL LETTER SHA
assertEq(String.fromCodePoint(0x10400).toLowerCase().codePointAt(0), 0x10428); // DESERET CAPITAL LETTER LONG I, DESERET SMALL LETTER LONG I
assertEq(String.fromCodePoint(0x10401).toLowerCase().codePointAt(0), 0x10429); // DESERET CAPITAL LETTER LONG E, DESERET SMALL LETTER LONG E
assertEq(String.fromCodePoint(0x10402).toLowerCase().codePointAt(0), 0x1042A); // DESERET CAPITAL LETTER LONG A, DESERET SMALL LETTER LONG A
assertEq(String.fromCodePoint(0x10403).toLowerCase().codePointAt(0), 0x1042B); // DESERET CAPITAL LETTER LONG AH, DESERET SMALL LETTER LONG AH
assertEq(String.fromCodePoint(0x10404).toLowerCase().codePointAt(0), 0x1042C); // DESERET CAPITAL LETTER LONG O, DESERET SMALL LETTER LONG O
assertEq(String.fromCodePoint(0x10405).toLowerCase().codePointAt(0), 0x1042D); // DESERET CAPITAL LETTER LONG OO, DESERET SMALL LETTER LONG OO
assertEq(String.fromCodePoint(0x10406).toLowerCase().codePointAt(0), 0x1042E); // DESERET CAPITAL LETTER SHORT I, DESERET SMALL LETTER SHORT I
assertEq(String.fromCodePoint(0x10407).toLowerCase().codePointAt(0), 0x1042F); // DESERET CAPITAL LETTER SHORT E, DESERET SMALL LETTER SHORT E
assertEq(String.fromCodePoint(0x10408).toLowerCase().codePointAt(0), 0x10430); // DESERET CAPITAL LETTER SHORT A, DESERET SMALL LETTER SHORT A
assertEq(String.fromCodePoint(0x10409).toLowerCase().codePointAt(0), 0x10431); // DESERET CAPITAL LETTER SHORT AH, DESERET SMALL LETTER SHORT AH
assertEq(String.fromCodePoint(0x1040A).toLowerCase().codePointAt(0), 0x10432); // DESERET CAPITAL LETTER SHORT O, DESERET SMALL LETTER SHORT O
assertEq(String.fromCodePoint(0x1040B).toLowerCase().codePointAt(0), 0x10433); // DESERET CAPITAL LETTER SHORT OO, DESERET SMALL LETTER SHORT OO
assertEq(String.fromCodePoint(0x1040C).toLowerCase().codePointAt(0), 0x10434); // DESERET CAPITAL LETTER AY, DESERET SMALL LETTER AY
assertEq(String.fromCodePoint(0x1040D).toLowerCase().codePointAt(0), 0x10435); // DESERET CAPITAL LETTER OW, DESERET SMALL LETTER OW
assertEq(String.fromCodePoint(0x1040E).toLowerCase().codePointAt(0), 0x10436); // DESERET CAPITAL LETTER WU, DESERET SMALL LETTER WU
assertEq(String.fromCodePoint(0x1040F).toLowerCase().codePointAt(0), 0x10437); // DESERET CAPITAL LETTER YEE, DESERET SMALL LETTER YEE
assertEq(String.fromCodePoint(0x10410).toLowerCase().codePointAt(0), 0x10438); // DESERET CAPITAL LETTER H, DESERET SMALL LETTER H
assertEq(String.fromCodePoint(0x10411).toLowerCase().codePointAt(0), 0x10439); // DESERET CAPITAL LETTER PEE, DESERET SMALL LETTER PEE
assertEq(String.fromCodePoint(0x10412).toLowerCase().codePointAt(0), 0x1043A); // DESERET CAPITAL LETTER BEE, DESERET SMALL LETTER BEE
assertEq(String.fromCodePoint(0x10413).toLowerCase().codePointAt(0), 0x1043B); // DESERET CAPITAL LETTER TEE, DESERET SMALL LETTER TEE
assertEq(String.fromCodePoint(0x10414).toLowerCase().codePointAt(0), 0x1043C); // DESERET CAPITAL LETTER DEE, DESERET SMALL LETTER DEE
assertEq(String.fromCodePoint(0x10415).toLowerCase().codePointAt(0), 0x1043D); // DESERET CAPITAL LETTER CHEE, DESERET SMALL LETTER CHEE
assertEq(String.fromCodePoint(0x10416).toLowerCase().codePointAt(0), 0x1043E); // DESERET CAPITAL LETTER JEE, DESERET SMALL LETTER JEE
assertEq(String.fromCodePoint(0x10417).toLowerCase().codePointAt(0), 0x1043F); // DESERET CAPITAL LETTER KAY, DESERET SMALL LETTER KAY
assertEq(String.fromCodePoint(0x10418).toLowerCase().codePointAt(0), 0x10440); // DESERET CAPITAL LETTER GAY, DESERET SMALL LETTER GAY
assertEq(String.fromCodePoint(0x10419).toLowerCase().codePointAt(0), 0x10441); // DESERET CAPITAL LETTER EF, DESERET SMALL LETTER EF
assertEq(String.fromCodePoint(0x1041A).toLowerCase().codePointAt(0), 0x10442); // DESERET CAPITAL LETTER VEE, DESERET SMALL LETTER VEE
assertEq(String.fromCodePoint(0x1041B).toLowerCase().codePointAt(0), 0x10443); // DESERET CAPITAL LETTER ETH, DESERET SMALL LETTER ETH
assertEq(String.fromCodePoint(0x1041C).toLowerCase().codePointAt(0), 0x10444); // DESERET CAPITAL LETTER THEE, DESERET SMALL LETTER THEE
assertEq(String.fromCodePoint(0x1041D).toLowerCase().codePointAt(0), 0x10445); // DESERET CAPITAL LETTER ES, DESERET SMALL LETTER ES
assertEq(String.fromCodePoint(0x1041E).toLowerCase().codePointAt(0), 0x10446); // DESERET CAPITAL LETTER ZEE, DESERET SMALL LETTER ZEE
assertEq(String.fromCodePoint(0x1041F).toLowerCase().codePointAt(0), 0x10447); // DESERET CAPITAL LETTER ESH, DESERET SMALL LETTER ESH
assertEq(String.fromCodePoint(0x10420).toLowerCase().codePointAt(0), 0x10448); // DESERET CAPITAL LETTER ZHEE, DESERET SMALL LETTER ZHEE
assertEq(String.fromCodePoint(0x10421).toLowerCase().codePointAt(0), 0x10449); // DESERET CAPITAL LETTER ER, DESERET SMALL LETTER ER
assertEq(String.fromCodePoint(0x10422).toLowerCase().codePointAt(0), 0x1044A); // DESERET CAPITAL LETTER EL, DESERET SMALL LETTER EL
assertEq(String.fromCodePoint(0x10423).toLowerCase().codePointAt(0), 0x1044B); // DESERET CAPITAL LETTER EM, DESERET SMALL LETTER EM
assertEq(String.fromCodePoint(0x10424).toLowerCase().codePointAt(0), 0x1044C); // DESERET CAPITAL LETTER EN, DESERET SMALL LETTER EN
assertEq(String.fromCodePoint(0x10425).toLowerCase().codePointAt(0), 0x1044D); // DESERET CAPITAL LETTER ENG, DESERET SMALL LETTER ENG
assertEq(String.fromCodePoint(0x10426).toLowerCase().codePointAt(0), 0x1044E); // DESERET CAPITAL LETTER OI, DESERET SMALL LETTER OI
assertEq(String.fromCodePoint(0x10427).toLowerCase().codePointAt(0), 0x1044F); // DESERET CAPITAL LETTER EW, DESERET SMALL LETTER EW
assertEq(String.fromCodePoint(0x104B0).toLowerCase().codePointAt(0), 0x104D8); // OSAGE CAPITAL LETTER A, OSAGE SMALL LETTER A
assertEq(String.fromCodePoint(0x104B1).toLowerCase().codePointAt(0), 0x104D9); // OSAGE CAPITAL LETTER AI, OSAGE SMALL LETTER AI
assertEq(String.fromCodePoint(0x104B2).toLowerCase().codePointAt(0), 0x104DA); // OSAGE CAPITAL LETTER AIN, OSAGE SMALL LETTER AIN
assertEq(String.fromCodePoint(0x104B3).toLowerCase().codePointAt(0), 0x104DB); // OSAGE CAPITAL LETTER AH, OSAGE SMALL LETTER AH
assertEq(String.fromCodePoint(0x104B4).toLowerCase().codePointAt(0), 0x104DC); // OSAGE CAPITAL LETTER BRA, OSAGE SMALL LETTER BRA
assertEq(String.fromCodePoint(0x104B5).toLowerCase().codePointAt(0), 0x104DD); // OSAGE CAPITAL LETTER CHA, OSAGE SMALL LETTER CHA
assertEq(String.fromCodePoint(0x104B6).toLowerCase().codePointAt(0), 0x104DE); // OSAGE CAPITAL LETTER EHCHA, OSAGE SMALL LETTER EHCHA
assertEq(String.fromCodePoint(0x104B7).toLowerCase().codePointAt(0), 0x104DF); // OSAGE CAPITAL LETTER E, OSAGE SMALL LETTER E
assertEq(String.fromCodePoint(0x104B8).toLowerCase().codePointAt(0), 0x104E0); // OSAGE CAPITAL LETTER EIN, OSAGE SMALL LETTER EIN
assertEq(String.fromCodePoint(0x104B9).toLowerCase().codePointAt(0), 0x104E1); // OSAGE CAPITAL LETTER HA, OSAGE SMALL LETTER HA
assertEq(String.fromCodePoint(0x104BA).toLowerCase().codePointAt(0), 0x104E2); // OSAGE CAPITAL LETTER HYA, OSAGE SMALL LETTER HYA
assertEq(String.fromCodePoint(0x104BB).toLowerCase().codePointAt(0), 0x104E3); // OSAGE CAPITAL LETTER I, OSAGE SMALL LETTER I
assertEq(String.fromCodePoint(0x104BC).toLowerCase().codePointAt(0), 0x104E4); // OSAGE CAPITAL LETTER KA, OSAGE SMALL LETTER KA
assertEq(String.fromCodePoint(0x104BD).toLowerCase().codePointAt(0), 0x104E5); // OSAGE CAPITAL LETTER EHKA, OSAGE SMALL LETTER EHKA
assertEq(String.fromCodePoint(0x104BE).toLowerCase().codePointAt(0), 0x104E6); // OSAGE CAPITAL LETTER KYA, OSAGE SMALL LETTER KYA
assertEq(String.fromCodePoint(0x104BF).toLowerCase().codePointAt(0), 0x104E7); // OSAGE CAPITAL LETTER LA, OSAGE SMALL LETTER LA
assertEq(String.fromCodePoint(0x104C0).toLowerCase().codePointAt(0), 0x104E8); // OSAGE CAPITAL LETTER MA, OSAGE SMALL LETTER MA
assertEq(String.fromCodePoint(0x104C1).toLowerCase().codePointAt(0), 0x104E9); // OSAGE CAPITAL LETTER NA, OSAGE SMALL LETTER NA
assertEq(String.fromCodePoint(0x104C2).toLowerCase().codePointAt(0), 0x104EA); // OSAGE CAPITAL LETTER O, OSAGE SMALL LETTER O
assertEq(String.fromCodePoint(0x104C3).toLowerCase().codePointAt(0), 0x104EB); // OSAGE CAPITAL LETTER OIN, OSAGE SMALL LETTER OIN
assertEq(String.fromCodePoint(0x104C4).toLowerCase().codePointAt(0), 0x104EC); // OSAGE CAPITAL LETTER PA, OSAGE SMALL LETTER PA
assertEq(String.fromCodePoint(0x104C5).toLowerCase().codePointAt(0), 0x104ED); // OSAGE CAPITAL LETTER EHPA, OSAGE SMALL LETTER EHPA
assertEq(String.fromCodePoint(0x104C6).toLowerCase().codePointAt(0), 0x104EE); // OSAGE CAPITAL LETTER SA, OSAGE SMALL LETTER SA
assertEq(String.fromCodePoint(0x104C7).toLowerCase().codePointAt(0), 0x104EF); // OSAGE CAPITAL LETTER SHA, OSAGE SMALL LETTER SHA
assertEq(String.fromCodePoint(0x104C8).toLowerCase().codePointAt(0), 0x104F0); // OSAGE CAPITAL LETTER TA, OSAGE SMALL LETTER TA
assertEq(String.fromCodePoint(0x104C9).toLowerCase().codePointAt(0), 0x104F1); // OSAGE CAPITAL LETTER EHTA, OSAGE SMALL LETTER EHTA
assertEq(String.fromCodePoint(0x104CA).toLowerCase().codePointAt(0), 0x104F2); // OSAGE CAPITAL LETTER TSA, OSAGE SMALL LETTER TSA
assertEq(String.fromCodePoint(0x104CB).toLowerCase().codePointAt(0), 0x104F3); // OSAGE CAPITAL LETTER EHTSA, OSAGE SMALL LETTER EHTSA
assertEq(String.fromCodePoint(0x104CC).toLowerCase().codePointAt(0), 0x104F4); // OSAGE CAPITAL LETTER TSHA, OSAGE SMALL LETTER TSHA
assertEq(String.fromCodePoint(0x104CD).toLowerCase().codePointAt(0), 0x104F5); // OSAGE CAPITAL LETTER DHA, OSAGE SMALL LETTER DHA
assertEq(String.fromCodePoint(0x104CE).toLowerCase().codePointAt(0), 0x104F6); // OSAGE CAPITAL LETTER U, OSAGE SMALL LETTER U
assertEq(String.fromCodePoint(0x104CF).toLowerCase().codePointAt(0), 0x104F7); // OSAGE CAPITAL LETTER WA, OSAGE SMALL LETTER WA
assertEq(String.fromCodePoint(0x104D0).toLowerCase().codePointAt(0), 0x104F8); // OSAGE CAPITAL LETTER KHA, OSAGE SMALL LETTER KHA
assertEq(String.fromCodePoint(0x104D1).toLowerCase().codePointAt(0), 0x104F9); // OSAGE CAPITAL LETTER GHA, OSAGE SMALL LETTER GHA
assertEq(String.fromCodePoint(0x104D2).toLowerCase().codePointAt(0), 0x104FA); // OSAGE CAPITAL LETTER ZA, OSAGE SMALL LETTER ZA
assertEq(String.fromCodePoint(0x104D3).toLowerCase().codePointAt(0), 0x104FB); // OSAGE CAPITAL LETTER ZHA, OSAGE SMALL LETTER ZHA
assertEq(String.fromCodePoint(0x10570).toLowerCase().codePointAt(0), 0x10597); // VITHKUQI CAPITAL LETTER A, VITHKUQI SMALL LETTER A
assertEq(String.fromCodePoint(0x10571).toLowerCase().codePointAt(0), 0x10598); // VITHKUQI CAPITAL LETTER BBE, VITHKUQI SMALL LETTER BBE
assertEq(String.fromCodePoint(0x10572).toLowerCase().codePointAt(0), 0x10599); // VITHKUQI CAPITAL LETTER BE, VITHKUQI SMALL LETTER BE
assertEq(String.fromCodePoint(0x10573).toLowerCase().codePointAt(0), 0x1059A); // VITHKUQI CAPITAL LETTER CE, VITHKUQI SMALL LETTER CE
assertEq(String.fromCodePoint(0x10574).toLowerCase().codePointAt(0), 0x1059B); // VITHKUQI CAPITAL LETTER CHE, VITHKUQI SMALL LETTER CHE
assertEq(String.fromCodePoint(0x10575).toLowerCase().codePointAt(0), 0x1059C); // VITHKUQI CAPITAL LETTER DE, VITHKUQI SMALL LETTER DE
assertEq(String.fromCodePoint(0x10576).toLowerCase().codePointAt(0), 0x1059D); // VITHKUQI CAPITAL LETTER DHE, VITHKUQI SMALL LETTER DHE
assertEq(String.fromCodePoint(0x10577).toLowerCase().codePointAt(0), 0x1059E); // VITHKUQI CAPITAL LETTER EI, VITHKUQI SMALL LETTER EI
assertEq(String.fromCodePoint(0x10578).toLowerCase().codePointAt(0), 0x1059F); // VITHKUQI CAPITAL LETTER E, VITHKUQI SMALL LETTER E
assertEq(String.fromCodePoint(0x10579).toLowerCase().codePointAt(0), 0x105A0); // VITHKUQI CAPITAL LETTER FE, VITHKUQI SMALL LETTER FE
assertEq(String.fromCodePoint(0x1057A).toLowerCase().codePointAt(0), 0x105A1); // VITHKUQI CAPITAL LETTER GA, VITHKUQI SMALL LETTER GA
assertEq(String.fromCodePoint(0x1057C).toLowerCase().codePointAt(0), 0x105A3); // VITHKUQI CAPITAL LETTER HA, VITHKUQI SMALL LETTER HA
assertEq(String.fromCodePoint(0x1057D).toLowerCase().codePointAt(0), 0x105A4); // VITHKUQI CAPITAL LETTER HHA, VITHKUQI SMALL LETTER HHA
assertEq(String.fromCodePoint(0x1057E).toLowerCase().codePointAt(0), 0x105A5); // VITHKUQI CAPITAL LETTER I, VITHKUQI SMALL LETTER I
assertEq(String.fromCodePoint(0x1057F).toLowerCase().codePointAt(0), 0x105A6); // VITHKUQI CAPITAL LETTER IJE, VITHKUQI SMALL LETTER IJE
assertEq(String.fromCodePoint(0x10580).toLowerCase().codePointAt(0), 0x105A7); // VITHKUQI CAPITAL LETTER JE, VITHKUQI SMALL LETTER JE
assertEq(String.fromCodePoint(0x10581).toLowerCase().codePointAt(0), 0x105A8); // VITHKUQI CAPITAL LETTER KA, VITHKUQI SMALL LETTER KA
assertEq(String.fromCodePoint(0x10582).toLowerCase().codePointAt(0), 0x105A9); // VITHKUQI CAPITAL LETTER LA, VITHKUQI SMALL LETTER LA
assertEq(String.fromCodePoint(0x10583).toLowerCase().codePointAt(0), 0x105AA); // VITHKUQI CAPITAL LETTER LLA, VITHKUQI SMALL LETTER LLA
assertEq(String.fromCodePoint(0x10584).toLowerCase().codePointAt(0), 0x105AB); // VITHKUQI CAPITAL LETTER ME, VITHKUQI SMALL LETTER ME
assertEq(String.fromCodePoint(0x10585).toLowerCase().codePointAt(0), 0x105AC); // VITHKUQI CAPITAL LETTER NE, VITHKUQI SMALL LETTER NE
assertEq(String.fromCodePoint(0x10586).toLowerCase().codePointAt(0), 0x105AD); // VITHKUQI CAPITAL LETTER NJE, VITHKUQI SMALL LETTER NJE
assertEq(String.fromCodePoint(0x10587).toLowerCase().codePointAt(0), 0x105AE); // VITHKUQI CAPITAL LETTER O, VITHKUQI SMALL LETTER O
assertEq(String.fromCodePoint(0x10588).toLowerCase().codePointAt(0), 0x105AF); // VITHKUQI CAPITAL LETTER PE, VITHKUQI SMALL LETTER PE
assertEq(String.fromCodePoint(0x10589).toLowerCase().codePointAt(0), 0x105B0); // VITHKUQI CAPITAL LETTER QA, VITHKUQI SMALL LETTER QA
assertEq(String.fromCodePoint(0x1058A).toLowerCase().codePointAt(0), 0x105B1); // VITHKUQI CAPITAL LETTER RE, VITHKUQI SMALL LETTER RE
assertEq(String.fromCodePoint(0x1058C).toLowerCase().codePointAt(0), 0x105B3); // VITHKUQI CAPITAL LETTER SE, VITHKUQI SMALL LETTER SE
assertEq(String.fromCodePoint(0x1058D).toLowerCase().codePointAt(0), 0x105B4); // VITHKUQI CAPITAL LETTER SHE, VITHKUQI SMALL LETTER SHE
assertEq(String.fromCodePoint(0x1058E).toLowerCase().codePointAt(0), 0x105B5); // VITHKUQI CAPITAL LETTER TE, VITHKUQI SMALL LETTER TE
assertEq(String.fromCodePoint(0x1058F).toLowerCase().codePointAt(0), 0x105B6); // VITHKUQI CAPITAL LETTER THE, VITHKUQI SMALL LETTER THE
assertEq(String.fromCodePoint(0x10590).toLowerCase().codePointAt(0), 0x105B7); // VITHKUQI CAPITAL LETTER U, VITHKUQI SMALL LETTER U
assertEq(String.fromCodePoint(0x10591).toLowerCase().codePointAt(0), 0x105B8); // VITHKUQI CAPITAL LETTER VE, VITHKUQI SMALL LETTER VE
assertEq(String.fromCodePoint(0x10592).toLowerCase().codePointAt(0), 0x105B9); // VITHKUQI CAPITAL LETTER XE, VITHKUQI SMALL LETTER XE
assertEq(String.fromCodePoint(0x10594).toLowerCase().codePointAt(0), 0x105BB); // VITHKUQI CAPITAL LETTER Y, VITHKUQI SMALL LETTER Y
assertEq(String.fromCodePoint(0x10595).toLowerCase().codePointAt(0), 0x105BC); // VITHKUQI CAPITAL LETTER ZE, VITHKUQI SMALL LETTER ZE
assertEq(String.fromCodePoint(0x10C80).toLowerCase().codePointAt(0), 0x10CC0); // OLD HUNGARIAN CAPITAL LETTER A, OLD HUNGARIAN SMALL LETTER A
assertEq(String.fromCodePoint(0x10C81).toLowerCase().codePointAt(0), 0x10CC1); // OLD HUNGARIAN CAPITAL LETTER AA, OLD HUNGARIAN SMALL LETTER AA
assertEq(String.fromCodePoint(0x10C82).toLowerCase().codePointAt(0), 0x10CC2); // OLD HUNGARIAN CAPITAL LETTER EB, OLD HUNGARIAN SMALL LETTER EB
assertEq(String.fromCodePoint(0x10C83).toLowerCase().codePointAt(0), 0x10CC3); // OLD HUNGARIAN CAPITAL LETTER AMB, OLD HUNGARIAN SMALL LETTER AMB
assertEq(String.fromCodePoint(0x10C84).toLowerCase().codePointAt(0), 0x10CC4); // OLD HUNGARIAN CAPITAL LETTER EC, OLD HUNGARIAN SMALL LETTER EC
assertEq(String.fromCodePoint(0x10C85).toLowerCase().codePointAt(0), 0x10CC5); // OLD HUNGARIAN CAPITAL LETTER ENC, OLD HUNGARIAN SMALL LETTER ENC
assertEq(String.fromCodePoint(0x10C86).toLowerCase().codePointAt(0), 0x10CC6); // OLD HUNGARIAN CAPITAL LETTER ECS, OLD HUNGARIAN SMALL LETTER ECS
assertEq(String.fromCodePoint(0x10C87).toLowerCase().codePointAt(0), 0x10CC7); // OLD HUNGARIAN CAPITAL LETTER ED, OLD HUNGARIAN SMALL LETTER ED
assertEq(String.fromCodePoint(0x10C88).toLowerCase().codePointAt(0), 0x10CC8); // OLD HUNGARIAN CAPITAL LETTER AND, OLD HUNGARIAN SMALL LETTER AND
assertEq(String.fromCodePoint(0x10C89).toLowerCase().codePointAt(0), 0x10CC9); // OLD HUNGARIAN CAPITAL LETTER E, OLD HUNGARIAN SMALL LETTER E
assertEq(String.fromCodePoint(0x10C8A).toLowerCase().codePointAt(0), 0x10CCA); // OLD HUNGARIAN CAPITAL LETTER CLOSE E, OLD HUNGARIAN SMALL LETTER CLOSE E
assertEq(String.fromCodePoint(0x10C8B).toLowerCase().codePointAt(0), 0x10CCB); // OLD HUNGARIAN CAPITAL LETTER EE, OLD HUNGARIAN SMALL LETTER EE
assertEq(String.fromCodePoint(0x10C8C).toLowerCase().codePointAt(0), 0x10CCC); // OLD HUNGARIAN CAPITAL LETTER EF, OLD HUNGARIAN SMALL LETTER EF
assertEq(String.fromCodePoint(0x10C8D).toLowerCase().codePointAt(0), 0x10CCD); // OLD HUNGARIAN CAPITAL LETTER EG, OLD HUNGARIAN SMALL LETTER EG
assertEq(String.fromCodePoint(0x10C8E).toLowerCase().codePointAt(0), 0x10CCE); // OLD HUNGARIAN CAPITAL LETTER EGY, OLD HUNGARIAN SMALL LETTER EGY
assertEq(String.fromCodePoint(0x10C8F).toLowerCase().codePointAt(0), 0x10CCF); // OLD HUNGARIAN CAPITAL LETTER EH, OLD HUNGARIAN SMALL LETTER EH
assertEq(String.fromCodePoint(0x10C90).toLowerCase().codePointAt(0), 0x10CD0); // OLD HUNGARIAN CAPITAL LETTER I, OLD HUNGARIAN SMALL LETTER I
assertEq(String.fromCodePoint(0x10C91).toLowerCase().codePointAt(0), 0x10CD1); // OLD HUNGARIAN CAPITAL LETTER II, OLD HUNGARIAN SMALL LETTER II
assertEq(String.fromCodePoint(0x10C92).toLowerCase().codePointAt(0), 0x10CD2); // OLD HUNGARIAN CAPITAL LETTER EJ, OLD HUNGARIAN SMALL LETTER EJ
assertEq(String.fromCodePoint(0x10C93).toLowerCase().codePointAt(0), 0x10CD3); // OLD HUNGARIAN CAPITAL LETTER EK, OLD HUNGARIAN SMALL LETTER EK
assertEq(String.fromCodePoint(0x10C94).toLowerCase().codePointAt(0), 0x10CD4); // OLD HUNGARIAN CAPITAL LETTER AK, OLD HUNGARIAN SMALL LETTER AK
assertEq(String.fromCodePoint(0x10C95).toLowerCase().codePointAt(0), 0x10CD5); // OLD HUNGARIAN CAPITAL LETTER UNK, OLD HUNGARIAN SMALL LETTER UNK
assertEq(String.fromCodePoint(0x10C96).toLowerCase().codePointAt(0), 0x10CD6); // OLD HUNGARIAN CAPITAL LETTER EL, OLD HUNGARIAN SMALL LETTER EL
assertEq(String.fromCodePoint(0x10C97).toLowerCase().codePointAt(0), 0x10CD7); // OLD HUNGARIAN CAPITAL LETTER ELY, OLD HUNGARIAN SMALL LETTER ELY
assertEq(String.fromCodePoint(0x10C98).toLowerCase().codePointAt(0), 0x10CD8); // OLD HUNGARIAN CAPITAL LETTER EM, OLD HUNGARIAN SMALL LETTER EM
assertEq(String.fromCodePoint(0x10C99).toLowerCase().codePointAt(0), 0x10CD9); // OLD HUNGARIAN CAPITAL LETTER EN, OLD HUNGARIAN SMALL LETTER EN
assertEq(String.fromCodePoint(0x10C9A).toLowerCase().codePointAt(0), 0x10CDA); // OLD HUNGARIAN CAPITAL LETTER ENY, OLD HUNGARIAN SMALL LETTER ENY
assertEq(String.fromCodePoint(0x10C9B).toLowerCase().codePointAt(0), 0x10CDB); // OLD HUNGARIAN CAPITAL LETTER O, OLD HUNGARIAN SMALL LETTER O
assertEq(String.fromCodePoint(0x10C9C).toLowerCase().codePointAt(0), 0x10CDC); // OLD HUNGARIAN CAPITAL LETTER OO, OLD HUNGARIAN SMALL LETTER OO
assertEq(String.fromCodePoint(0x10C9D).toLowerCase().codePointAt(0), 0x10CDD); // OLD HUNGARIAN CAPITAL LETTER NIKOLSBURG OE, OLD HUNGARIAN SMALL LETTER NIKOLSBURG OE
assertEq(String.fromCodePoint(0x10C9E).toLowerCase().codePointAt(0), 0x10CDE); // OLD HUNGARIAN CAPITAL LETTER RUDIMENTA OE, OLD HUNGARIAN SMALL LETTER RUDIMENTA OE
assertEq(String.fromCodePoint(0x10C9F).toLowerCase().codePointAt(0), 0x10CDF); // OLD HUNGARIAN CAPITAL LETTER OEE, OLD HUNGARIAN SMALL LETTER OEE
assertEq(String.fromCodePoint(0x10CA0).toLowerCase().codePointAt(0), 0x10CE0); // OLD HUNGARIAN CAPITAL LETTER EP, OLD HUNGARIAN SMALL LETTER EP
assertEq(String.fromCodePoint(0x10CA1).toLowerCase().codePointAt(0), 0x10CE1); // OLD HUNGARIAN CAPITAL LETTER EMP, OLD HUNGARIAN SMALL LETTER EMP
assertEq(String.fromCodePoint(0x10CA2).toLowerCase().codePointAt(0), 0x10CE2); // OLD HUNGARIAN CAPITAL LETTER ER, OLD HUNGARIAN SMALL LETTER ER
assertEq(String.fromCodePoint(0x10CA3).toLowerCase().codePointAt(0), 0x10CE3); // OLD HUNGARIAN CAPITAL LETTER SHORT ER, OLD HUNGARIAN SMALL LETTER SHORT ER
assertEq(String.fromCodePoint(0x10CA4).toLowerCase().codePointAt(0), 0x10CE4); // OLD HUNGARIAN CAPITAL LETTER ES, OLD HUNGARIAN SMALL LETTER ES
assertEq(String.fromCodePoint(0x10CA5).toLowerCase().codePointAt(0), 0x10CE5); // OLD HUNGARIAN CAPITAL LETTER ESZ, OLD HUNGARIAN SMALL LETTER ESZ
assertEq(String.fromCodePoint(0x10CA6).toLowerCase().codePointAt(0), 0x10CE6); // OLD HUNGARIAN CAPITAL LETTER ET, OLD HUNGARIAN SMALL LETTER ET
assertEq(String.fromCodePoint(0x10CA7).toLowerCase().codePointAt(0), 0x10CE7); // OLD HUNGARIAN CAPITAL LETTER ENT, OLD HUNGARIAN SMALL LETTER ENT
assertEq(String.fromCodePoint(0x10CA8).toLowerCase().codePointAt(0), 0x10CE8); // OLD HUNGARIAN CAPITAL LETTER ETY, OLD HUNGARIAN SMALL LETTER ETY
assertEq(String.fromCodePoint(0x10CA9).toLowerCase().codePointAt(0), 0x10CE9); // OLD HUNGARIAN CAPITAL LETTER ECH, OLD HUNGARIAN SMALL LETTER ECH
assertEq(String.fromCodePoint(0x10CAA).toLowerCase().codePointAt(0), 0x10CEA); // OLD HUNGARIAN CAPITAL LETTER U, OLD HUNGARIAN SMALL LETTER U
assertEq(String.fromCodePoint(0x10CAB).toLowerCase().codePointAt(0), 0x10CEB); // OLD HUNGARIAN CAPITAL LETTER UU, OLD HUNGARIAN SMALL LETTER UU
assertEq(String.fromCodePoint(0x10CAC).toLowerCase().codePointAt(0), 0x10CEC); // OLD HUNGARIAN CAPITAL LETTER NIKOLSBURG UE, OLD HUNGARIAN SMALL LETTER NIKOLSBURG UE
assertEq(String.fromCodePoint(0x10CAD).toLowerCase().codePointAt(0), 0x10CED); // OLD HUNGARIAN CAPITAL LETTER RUDIMENTA UE, OLD HUNGARIAN SMALL LETTER RUDIMENTA UE
assertEq(String.fromCodePoint(0x10CAE).toLowerCase().codePointAt(0), 0x10CEE); // OLD HUNGARIAN CAPITAL LETTER EV, OLD HUNGARIAN SMALL LETTER EV
assertEq(String.fromCodePoint(0x10CAF).toLowerCase().codePointAt(0), 0x10CEF); // OLD HUNGARIAN CAPITAL LETTER EZ, OLD HUNGARIAN SMALL LETTER EZ
assertEq(String.fromCodePoint(0x10CB0).toLowerCase().codePointAt(0), 0x10CF0); // OLD HUNGARIAN CAPITAL LETTER EZS, OLD HUNGARIAN SMALL LETTER EZS
assertEq(String.fromCodePoint(0x10CB1).toLowerCase().codePointAt(0), 0x10CF1); // OLD HUNGARIAN CAPITAL LETTER ENT-SHAPED SIGN, OLD HUNGARIAN SMALL LETTER ENT-SHAPED SIGN
assertEq(String.fromCodePoint(0x10CB2).toLowerCase().codePointAt(0), 0x10CF2); // OLD HUNGARIAN CAPITAL LETTER US, OLD HUNGARIAN SMALL LETTER US
assertEq(String.fromCodePoint(0x118A0).toLowerCase().codePointAt(0), 0x118C0); // WARANG CITI CAPITAL LETTER NGAA, WARANG CITI SMALL LETTER NGAA
assertEq(String.fromCodePoint(0x118A1).toLowerCase().codePointAt(0), 0x118C1); // WARANG CITI CAPITAL LETTER A, WARANG CITI SMALL LETTER A
assertEq(String.fromCodePoint(0x118A2).toLowerCase().codePointAt(0), 0x118C2); // WARANG CITI CAPITAL LETTER WI, WARANG CITI SMALL LETTER WI
assertEq(String.fromCodePoint(0x118A3).toLowerCase().codePointAt(0), 0x118C3); // WARANG CITI CAPITAL LETTER YU, WARANG CITI SMALL LETTER YU
assertEq(String.fromCodePoint(0x118A4).toLowerCase().codePointAt(0), 0x118C4); // WARANG CITI CAPITAL LETTER YA, WARANG CITI SMALL LETTER YA
assertEq(String.fromCodePoint(0x118A5).toLowerCase().codePointAt(0), 0x118C5); // WARANG CITI CAPITAL LETTER YO, WARANG CITI SMALL LETTER YO
assertEq(String.fromCodePoint(0x118A6).toLowerCase().codePointAt(0), 0x118C6); // WARANG CITI CAPITAL LETTER II, WARANG CITI SMALL LETTER II
assertEq(String.fromCodePoint(0x118A7).toLowerCase().codePointAt(0), 0x118C7); // WARANG CITI CAPITAL LETTER UU, WARANG CITI SMALL LETTER UU
assertEq(String.fromCodePoint(0x118A8).toLowerCase().codePointAt(0), 0x118C8); // WARANG CITI CAPITAL LETTER E, WARANG CITI SMALL LETTER E
assertEq(String.fromCodePoint(0x118A9).toLowerCase().codePointAt(0), 0x118C9); // WARANG CITI CAPITAL LETTER O, WARANG CITI SMALL LETTER O
assertEq(String.fromCodePoint(0x118AA).toLowerCase().codePointAt(0), 0x118CA); // WARANG CITI CAPITAL LETTER ANG, WARANG CITI SMALL LETTER ANG
assertEq(String.fromCodePoint(0x118AB).toLowerCase().codePointAt(0), 0x118CB); // WARANG CITI CAPITAL LETTER GA, WARANG CITI SMALL LETTER GA
assertEq(String.fromCodePoint(0x118AC).toLowerCase().codePointAt(0), 0x118CC); // WARANG CITI CAPITAL LETTER KO, WARANG CITI SMALL LETTER KO
assertEq(String.fromCodePoint(0x118AD).toLowerCase().codePointAt(0), 0x118CD); // WARANG CITI CAPITAL LETTER ENY, WARANG CITI SMALL LETTER ENY
assertEq(String.fromCodePoint(0x118AE).toLowerCase().codePointAt(0), 0x118CE); // WARANG CITI CAPITAL LETTER YUJ, WARANG CITI SMALL LETTER YUJ
assertEq(String.fromCodePoint(0x118AF).toLowerCase().codePointAt(0), 0x118CF); // WARANG CITI CAPITAL LETTER UC, WARANG CITI SMALL LETTER UC
assertEq(String.fromCodePoint(0x118B0).toLowerCase().codePointAt(0), 0x118D0); // WARANG CITI CAPITAL LETTER ENN, WARANG CITI SMALL LETTER ENN
assertEq(String.fromCodePoint(0x118B1).toLowerCase().codePointAt(0), 0x118D1); // WARANG CITI CAPITAL LETTER ODD, WARANG CITI SMALL LETTER ODD
assertEq(String.fromCodePoint(0x118B2).toLowerCase().codePointAt(0), 0x118D2); // WARANG CITI CAPITAL LETTER TTE, WARANG CITI SMALL LETTER TTE
assertEq(String.fromCodePoint(0x118B3).toLowerCase().codePointAt(0), 0x118D3); // WARANG CITI CAPITAL LETTER NUNG, WARANG CITI SMALL LETTER NUNG
assertEq(String.fromCodePoint(0x118B4).toLowerCase().codePointAt(0), 0x118D4); // WARANG CITI CAPITAL LETTER DA, WARANG CITI SMALL LETTER DA
assertEq(String.fromCodePoint(0x118B5).toLowerCase().codePointAt(0), 0x118D5); // WARANG CITI CAPITAL LETTER AT, WARANG CITI SMALL LETTER AT
assertEq(String.fromCodePoint(0x118B6).toLowerCase().codePointAt(0), 0x118D6); // WARANG CITI CAPITAL LETTER AM, WARANG CITI SMALL LETTER AM
assertEq(String.fromCodePoint(0x118B7).toLowerCase().codePointAt(0), 0x118D7); // WARANG CITI CAPITAL LETTER BU, WARANG CITI SMALL LETTER BU
assertEq(String.fromCodePoint(0x118B8).toLowerCase().codePointAt(0), 0x118D8); // WARANG CITI CAPITAL LETTER PU, WARANG CITI SMALL LETTER PU
assertEq(String.fromCodePoint(0x118B9).toLowerCase().codePointAt(0), 0x118D9); // WARANG CITI CAPITAL LETTER HIYO, WARANG CITI SMALL LETTER HIYO
assertEq(String.fromCodePoint(0x118BA).toLowerCase().codePointAt(0), 0x118DA); // WARANG CITI CAPITAL LETTER HOLO, WARANG CITI SMALL LETTER HOLO
assertEq(String.fromCodePoint(0x118BB).toLowerCase().codePointAt(0), 0x118DB); // WARANG CITI CAPITAL LETTER HORR, WARANG CITI SMALL LETTER HORR
assertEq(String.fromCodePoint(0x118BC).toLowerCase().codePointAt(0), 0x118DC); // WARANG CITI CAPITAL LETTER HAR, WARANG CITI SMALL LETTER HAR
assertEq(String.fromCodePoint(0x118BD).toLowerCase().codePointAt(0), 0x118DD); // WARANG CITI CAPITAL LETTER SSUU, WARANG CITI SMALL LETTER SSUU
assertEq(String.fromCodePoint(0x118BE).toLowerCase().codePointAt(0), 0x118DE); // WARANG CITI CAPITAL LETTER SII, WARANG CITI SMALL LETTER SII
assertEq(String.fromCodePoint(0x118BF).toLowerCase().codePointAt(0), 0x118DF); // WARANG CITI CAPITAL LETTER VIYO, WARANG CITI SMALL LETTER VIYO
assertEq(String.fromCodePoint(0x16E40).toLowerCase().codePointAt(0), 0x16E60); // MEDEFAIDRIN CAPITAL LETTER M, MEDEFAIDRIN SMALL LETTER M
assertEq(String.fromCodePoint(0x16E41).toLowerCase().codePointAt(0), 0x16E61); // MEDEFAIDRIN CAPITAL LETTER S, MEDEFAIDRIN SMALL LETTER S
assertEq(String.fromCodePoint(0x16E42).toLowerCase().codePointAt(0), 0x16E62); // MEDEFAIDRIN CAPITAL LETTER V, MEDEFAIDRIN SMALL LETTER V
assertEq(String.fromCodePoint(0x16E43).toLowerCase().codePointAt(0), 0x16E63); // MEDEFAIDRIN CAPITAL LETTER W, MEDEFAIDRIN SMALL LETTER W
assertEq(String.fromCodePoint(0x16E44).toLowerCase().codePointAt(0), 0x16E64); // MEDEFAIDRIN CAPITAL LETTER ATIU, MEDEFAIDRIN SMALL LETTER ATIU
assertEq(String.fromCodePoint(0x16E45).toLowerCase().codePointAt(0), 0x16E65); // MEDEFAIDRIN CAPITAL LETTER Z, MEDEFAIDRIN SMALL LETTER Z
assertEq(String.fromCodePoint(0x16E46).toLowerCase().codePointAt(0), 0x16E66); // MEDEFAIDRIN CAPITAL LETTER KP, MEDEFAIDRIN SMALL LETTER KP
assertEq(String.fromCodePoint(0x16E47).toLowerCase().codePointAt(0), 0x16E67); // MEDEFAIDRIN CAPITAL LETTER P, MEDEFAIDRIN SMALL LETTER P
assertEq(String.fromCodePoint(0x16E48).toLowerCase().codePointAt(0), 0x16E68); // MEDEFAIDRIN CAPITAL LETTER T, MEDEFAIDRIN SMALL LETTER T
assertEq(String.fromCodePoint(0x16E49).toLowerCase().codePointAt(0), 0x16E69); // MEDEFAIDRIN CAPITAL LETTER G, MEDEFAIDRIN SMALL LETTER G
assertEq(String.fromCodePoint(0x16E4A).toLowerCase().codePointAt(0), 0x16E6A); // MEDEFAIDRIN CAPITAL LETTER F, MEDEFAIDRIN SMALL LETTER F
assertEq(String.fromCodePoint(0x16E4B).toLowerCase().codePointAt(0), 0x16E6B); // MEDEFAIDRIN CAPITAL LETTER I, MEDEFAIDRIN SMALL LETTER I
assertEq(String.fromCodePoint(0x16E4C).toLowerCase().codePointAt(0), 0x16E6C); // MEDEFAIDRIN CAPITAL LETTER K, MEDEFAIDRIN SMALL LETTER K
assertEq(String.fromCodePoint(0x16E4D).toLowerCase().codePointAt(0), 0x16E6D); // MEDEFAIDRIN CAPITAL LETTER A, MEDEFAIDRIN SMALL LETTER A
assertEq(String.fromCodePoint(0x16E4E).toLowerCase().codePointAt(0), 0x16E6E); // MEDEFAIDRIN CAPITAL LETTER J, MEDEFAIDRIN SMALL LETTER J
assertEq(String.fromCodePoint(0x16E4F).toLowerCase().codePointAt(0), 0x16E6F); // MEDEFAIDRIN CAPITAL LETTER E, MEDEFAIDRIN SMALL LETTER E
assertEq(String.fromCodePoint(0x16E50).toLowerCase().codePointAt(0), 0x16E70); // MEDEFAIDRIN CAPITAL LETTER B, MEDEFAIDRIN SMALL LETTER B
assertEq(String.fromCodePoint(0x16E51).toLowerCase().codePointAt(0), 0x16E71); // MEDEFAIDRIN CAPITAL LETTER C, MEDEFAIDRIN SMALL LETTER C
assertEq(String.fromCodePoint(0x16E52).toLowerCase().codePointAt(0), 0x16E72); // MEDEFAIDRIN CAPITAL LETTER U, MEDEFAIDRIN SMALL LETTER U
assertEq(String.fromCodePoint(0x16E53).toLowerCase().codePointAt(0), 0x16E73); // MEDEFAIDRIN CAPITAL LETTER YU, MEDEFAIDRIN SMALL LETTER YU
assertEq(String.fromCodePoint(0x16E54).toLowerCase().codePointAt(0), 0x16E74); // MEDEFAIDRIN CAPITAL LETTER L, MEDEFAIDRIN SMALL LETTER L
assertEq(String.fromCodePoint(0x16E55).toLowerCase().codePointAt(0), 0x16E75); // MEDEFAIDRIN CAPITAL LETTER Q, MEDEFAIDRIN SMALL LETTER Q
assertEq(String.fromCodePoint(0x16E56).toLowerCase().codePointAt(0), 0x16E76); // MEDEFAIDRIN CAPITAL LETTER HP, MEDEFAIDRIN SMALL LETTER HP
assertEq(String.fromCodePoint(0x16E57).toLowerCase().codePointAt(0), 0x16E77); // MEDEFAIDRIN CAPITAL LETTER NY, MEDEFAIDRIN SMALL LETTER NY
assertEq(String.fromCodePoint(0x16E58).toLowerCase().codePointAt(0), 0x16E78); // MEDEFAIDRIN CAPITAL LETTER X, MEDEFAIDRIN SMALL LETTER X
assertEq(String.fromCodePoint(0x16E59).toLowerCase().codePointAt(0), 0x16E79); // MEDEFAIDRIN CAPITAL LETTER D, MEDEFAIDRIN SMALL LETTER D
assertEq(String.fromCodePoint(0x16E5A).toLowerCase().codePointAt(0), 0x16E7A); // MEDEFAIDRIN CAPITAL LETTER OE, MEDEFAIDRIN SMALL LETTER OE
assertEq(String.fromCodePoint(0x16E5B).toLowerCase().codePointAt(0), 0x16E7B); // MEDEFAIDRIN CAPITAL LETTER N, MEDEFAIDRIN SMALL LETTER N
assertEq(String.fromCodePoint(0x16E5C).toLowerCase().codePointAt(0), 0x16E7C); // MEDEFAIDRIN CAPITAL LETTER R, MEDEFAIDRIN SMALL LETTER R
assertEq(String.fromCodePoint(0x16E5D).toLowerCase().codePointAt(0), 0x16E7D); // MEDEFAIDRIN CAPITAL LETTER O, MEDEFAIDRIN SMALL LETTER O
assertEq(String.fromCodePoint(0x16E5E).toLowerCase().codePointAt(0), 0x16E7E); // MEDEFAIDRIN CAPITAL LETTER AI, MEDEFAIDRIN SMALL LETTER AI
assertEq(String.fromCodePoint(0x16E5F).toLowerCase().codePointAt(0), 0x16E7F); // MEDEFAIDRIN CAPITAL LETTER Y, MEDEFAIDRIN SMALL LETTER Y
assertEq(String.fromCodePoint(0x1E900).toLowerCase().codePointAt(0), 0x1E922); // ADLAM CAPITAL LETTER ALIF, ADLAM SMALL LETTER ALIF
assertEq(String.fromCodePoint(0x1E901).toLowerCase().codePointAt(0), 0x1E923); // ADLAM CAPITAL LETTER DAALI, ADLAM SMALL LETTER DAALI
assertEq(String.fromCodePoint(0x1E902).toLowerCase().codePointAt(0), 0x1E924); // ADLAM CAPITAL LETTER LAAM, ADLAM SMALL LETTER LAAM
assertEq(String.fromCodePoint(0x1E903).toLowerCase().codePointAt(0), 0x1E925); // ADLAM CAPITAL LETTER MIIM, ADLAM SMALL LETTER MIIM
assertEq(String.fromCodePoint(0x1E904).toLowerCase().codePointAt(0), 0x1E926); // ADLAM CAPITAL LETTER BA, ADLAM SMALL LETTER BA
assertEq(String.fromCodePoint(0x1E905).toLowerCase().codePointAt(0), 0x1E927); // ADLAM CAPITAL LETTER SINNYIIYHE, ADLAM SMALL LETTER SINNYIIYHE
assertEq(String.fromCodePoint(0x1E906).toLowerCase().codePointAt(0), 0x1E928); // ADLAM CAPITAL LETTER PE, ADLAM SMALL LETTER PE
assertEq(String.fromCodePoint(0x1E907).toLowerCase().codePointAt(0), 0x1E929); // ADLAM CAPITAL LETTER BHE, ADLAM SMALL LETTER BHE
assertEq(String.fromCodePoint(0x1E908).toLowerCase().codePointAt(0), 0x1E92A); // ADLAM CAPITAL LETTER RA, ADLAM SMALL LETTER RA
assertEq(String.fromCodePoint(0x1E909).toLowerCase().codePointAt(0), 0x1E92B); // ADLAM CAPITAL LETTER E, ADLAM SMALL LETTER E
assertEq(String.fromCodePoint(0x1E90A).toLowerCase().codePointAt(0), 0x1E92C); // ADLAM CAPITAL LETTER FA, ADLAM SMALL LETTER FA
assertEq(String.fromCodePoint(0x1E90B).toLowerCase().codePointAt(0), 0x1E92D); // ADLAM CAPITAL LETTER I, ADLAM SMALL LETTER I
assertEq(String.fromCodePoint(0x1E90C).toLowerCase().codePointAt(0), 0x1E92E); // ADLAM CAPITAL LETTER O, ADLAM SMALL LETTER O
assertEq(String.fromCodePoint(0x1E90D).toLowerCase().codePointAt(0), 0x1E92F); // ADLAM CAPITAL LETTER DHA, ADLAM SMALL LETTER DHA
assertEq(String.fromCodePoint(0x1E90E).toLowerCase().codePointAt(0), 0x1E930); // ADLAM CAPITAL LETTER YHE, ADLAM SMALL LETTER YHE
assertEq(String.fromCodePoint(0x1E90F).toLowerCase().codePointAt(0), 0x1E931); // ADLAM CAPITAL LETTER WAW, ADLAM SMALL LETTER WAW
assertEq(String.fromCodePoint(0x1E910).toLowerCase().codePointAt(0), 0x1E932); // ADLAM CAPITAL LETTER NUN, ADLAM SMALL LETTER NUN
assertEq(String.fromCodePoint(0x1E911).toLowerCase().codePointAt(0), 0x1E933); // ADLAM CAPITAL LETTER KAF, ADLAM SMALL LETTER KAF
assertEq(String.fromCodePoint(0x1E912).toLowerCase().codePointAt(0), 0x1E934); // ADLAM CAPITAL LETTER YA, ADLAM SMALL LETTER YA
assertEq(String.fromCodePoint(0x1E913).toLowerCase().codePointAt(0), 0x1E935); // ADLAM CAPITAL LETTER U, ADLAM SMALL LETTER U
assertEq(String.fromCodePoint(0x1E914).toLowerCase().codePointAt(0), 0x1E936); // ADLAM CAPITAL LETTER JIIM, ADLAM SMALL LETTER JIIM
assertEq(String.fromCodePoint(0x1E915).toLowerCase().codePointAt(0), 0x1E937); // ADLAM CAPITAL LETTER CHI, ADLAM SMALL LETTER CHI
assertEq(String.fromCodePoint(0x1E916).toLowerCase().codePointAt(0), 0x1E938); // ADLAM CAPITAL LETTER HA, ADLAM SMALL LETTER HA
assertEq(String.fromCodePoint(0x1E917).toLowerCase().codePointAt(0), 0x1E939); // ADLAM CAPITAL LETTER QAAF, ADLAM SMALL LETTER QAAF
assertEq(String.fromCodePoint(0x1E918).toLowerCase().codePointAt(0), 0x1E93A); // ADLAM CAPITAL LETTER GA, ADLAM SMALL LETTER GA
assertEq(String.fromCodePoint(0x1E919).toLowerCase().codePointAt(0), 0x1E93B); // ADLAM CAPITAL LETTER NYA, ADLAM SMALL LETTER NYA
assertEq(String.fromCodePoint(0x1E91A).toLowerCase().codePointAt(0), 0x1E93C); // ADLAM CAPITAL LETTER TU, ADLAM SMALL LETTER TU
assertEq(String.fromCodePoint(0x1E91B).toLowerCase().codePointAt(0), 0x1E93D); // ADLAM CAPITAL LETTER NHA, ADLAM SMALL LETTER NHA
assertEq(String.fromCodePoint(0x1E91C).toLowerCase().codePointAt(0), 0x1E93E); // ADLAM CAPITAL LETTER VA, ADLAM SMALL LETTER VA
assertEq(String.fromCodePoint(0x1E91D).toLowerCase().codePointAt(0), 0x1E93F); // ADLAM CAPITAL LETTER KHA, ADLAM SMALL LETTER KHA
assertEq(String.fromCodePoint(0x1E91E).toLowerCase().codePointAt(0), 0x1E940); // ADLAM CAPITAL LETTER GBE, ADLAM SMALL LETTER GBE
assertEq(String.fromCodePoint(0x1E91F).toLowerCase().codePointAt(0), 0x1E941); // ADLAM CAPITAL LETTER ZAL, ADLAM SMALL LETTER ZAL
assertEq(String.fromCodePoint(0x1E920).toLowerCase().codePointAt(0), 0x1E942); // ADLAM CAPITAL LETTER KPO, ADLAM SMALL LETTER KPO
assertEq(String.fromCodePoint(0x1E921).toLowerCase().codePointAt(0), 0x1E943); // ADLAM CAPITAL LETTER SHA, ADLAM SMALL LETTER SHA

if (typeof reportCompare === "function")
    reportCompare(true, true);
