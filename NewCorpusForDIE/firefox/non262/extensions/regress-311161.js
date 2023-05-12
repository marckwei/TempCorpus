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

// |reftest| skip-if(!Object.prototype.toSource)

/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

//-----------------------------------------------------------------------------
var BUGNUMBER = 311161;
var summary = 'toSource exposes random memory or crashes';
var actual = 'No Crash';
var expect = 'No Crash';

printBugNumber(BUGNUMBER);
printStatus (summary);
 

var commands =
  [{origCount:1, fun:(function anonymous() {allElements[2].style.background = "#fcd";})},
{origCount:2, fun:(function anonymous() {allElements[9].style.width = "20em";})},
{origCount:3, fun:(function anonymous() {allElements[4].style.width = "200%";})},
{origCount:4, fun:(function anonymous() {allElements[6].style.clear = "right";})},
{origCount:5, fun:(function anonymous() {allElements[8].style.visibility = "hidden";})},
{origCount:6, fun:(function anonymous() {allElements[1].style.overflow = "visible";})},
{origCount:7, fun:(function anonymous() {allElements[4].style.position = "fixed";})},
{origCount:8, fun:(function anonymous() {allElements[10].style.display = "-moz-inline-box";})},
{origCount:9, fun:(function anonymous() {allElements[10].style.overflow = "auto";})},
{origCount:10, fun:(function anonymous() {allElements[11].style.color = "red";})},
{origCount:11, fun:(function anonymous() {allElements[4].style.height = "2em";})},
{origCount:12, fun:(function anonymous() {allElements[9].style.height = "100px";})},
{origCount:13, fun:(function anonymous() {allElements[5].style['float'] = "none";})},
{origCount:14, fun:(function anonymous() {allElements[9].style.color = "blue";})},
{origCount:15, fun:(function anonymous() {allElements[2].style.clear = "right";})},
{origCount:16, fun:(function anonymous() {allElements[1].style.height = "auto";})},
{origCount:17, fun:(function anonymous() {allElements[0].style.overflow = "hidden";})},
{origCount:18, fun:(function anonymous() {allElements[4].style.display = "table-row-group";})},
{origCount:19, fun:(function anonymous() {allElements[4].style.overflow = "auto";})},
{origCount:20, fun:(function anonymous() {allElements[7].style.height = "100px";})},
{origCount:21, fun:(function anonymous() {allElements[5].style.color = "green";})},
{origCount:22, fun:(function anonymous() {allElements[3].style.display = "-moz-grid-group";})},
{origCount:23, fun:(function anonymous() {allElements[7].style['float'] = "none";})},
{origCount:24, fun:(function anonymous() {allElements[10].style.position = "static";})},
{origCount:25, fun:(function anonymous() {allElements[3].style['float'] = "none";})},
{origCount:26, fun:(function anonymous() {allElements[4].style['float'] = "none";})},
{origCount:27, fun:(function anonymous() {allElements[8].style['float'] = "none";})},
{origCount:28, fun:(function anonymous() {allElements[5].style.visibility = "collapse";})},
{origCount:29, fun:(function anonymous() {allElements[1].style.position = "static";})},
{origCount:30, fun:(function anonymous() {allElements[2].style.color = "black";})},
{origCount:31, fun:(function anonymous() {allElements[0].style.position = "fixed";})},
{origCount:32, fun:(function anonymous() {allElements[0].style.display = "table-row-group";})},
{origCount:33, fun:(function anonymous() {allElements[9].style.position = "relative";})},
{origCount:34, fun:(function anonymous() {allElements[5].style.position = "static";})},
{origCount:35, fun:(function anonymous() {allElements[6].style.background = "transparent";})},
{origCount:36, fun:(function anonymous() {allElements[6].style.color = "blue";})},
{origCount:37, fun:(function anonymous() {allElements[9].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:38, fun:(function anonymous() {allElements[8].style.display = "-moz-grid";})},
{origCount:39, fun:(function anonymous() {allElements[9].style.color = "black";})},
{origCount:40, fun:(function anonymous() {allElements[4].style.position = "static";})},
{origCount:41, fun:(function anonymous() {allElements[10].style.height = "auto";})},
{origCount:42, fun:(function anonymous() {allElements[9].style.color = "green";})},
{origCount:43, fun:(function anonymous() {allElements[4].style.height = "auto";})},
{origCount:44, fun:(function anonymous() {allElements[2].style.clear = "both";})},
{origCount:45, fun:(function anonymous() {allElements[8].style.width = "1px";})},
{origCount:46, fun:(function anonymous() {allElements[2].style.visibility = "visible";})},
{origCount:47, fun:(function anonymous() {allElements[1].style.clear = "left";})},
{origCount:48, fun:(function anonymous() {allElements[11].style.overflow = "auto";})},
{origCount:49, fun:(function anonymous() {allElements[11].style['float'] = "left";})},
{origCount:50, fun:(function anonymous() {allElements[8].style['float'] = "left";})},
{origCount:51, fun:(function anonymous() {allElements[6].style.height = "10%";})},
{origCount:52, fun:(function anonymous() {allElements[11].style.display = "-moz-inline-box";})},
{origCount:53, fun:(function anonymous() {allElements[3].style.clear = "left";})},
{origCount:54, fun:(function anonymous() {allElements[11].style.visibility = "hidden";})},
{origCount:55, fun:(function anonymous() {allElements[4].style['float'] = "right";})},
{origCount:56, fun:(function anonymous() {allElements[0].style.width = "1px";})},
{origCount:57, fun:(function anonymous() {allElements[3].style.height = "200%";})},
{origCount:58, fun:(function anonymous() {allElements[7].style.height = "10%";})},
{origCount:59, fun:(function anonymous() {allElements[4].style.clear = "none";})},
{origCount:60, fun:(function anonymous() {allElements[11].style['float'] = "none";})},
{origCount:61, fun:(function anonymous() {allElements[9].style['float'] = "left";})},
{origCount:62, fun:(function anonymous() {allElements[4].style.overflow = "scroll";})},
{origCount:63, fun:(function anonymous() {allElements[12].style.height = "200%";})},
{origCount:64, fun:(function anonymous() {allElements[2].style.color = "green";})},
{origCount:65, fun:(function anonymous() {allElements[3].style['float'] = "none";})},
{origCount:66, fun:(function anonymous() {allElements[10].style.background = "transparent";})},
{origCount:67, fun:(function anonymous() {allElements[0].style.height = "auto";})},
{origCount:68, fun:(function anonymous() {allElements[6].style.clear = "left";})},
{origCount:69, fun:(function anonymous() {allElements[7].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:70, fun:(function anonymous() {allElements[8].style.display = "-moz-popup";})},
{origCount:71, fun:(function anonymous() {allElements[2].style.height = "10%";})},
{origCount:72, fun:(function anonymous() {allElements[7].style.display = "table-cell";})},
{origCount:73, fun:(function anonymous() {allElements[3].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:74, fun:(function anonymous() {allElements[8].style.color = "red";})},
{origCount:75, fun:(function anonymous() {allElements[1].style.overflow = "auto";})},
{origCount:76, fun:(function anonymous() {allElements[1].style.background = "#fcd";})},
{origCount:77, fun:(function anonymous() {allElements[0].style.color = "red";})},
{origCount:78, fun:(function anonymous() {allElements[4].style.background = "#fcd";})},
{origCount:79, fun:(function anonymous() {allElements[5].style.position = "static";})},
{origCount:80, fun:(function anonymous() {allElements[8].style.clear = "both";})},
{origCount:81, fun:(function anonymous() {allElements[7].style.clear = "both";})},
{origCount:82, fun:(function anonymous() {allElements[5].style.clear = "both";})},
{origCount:83, fun:(function anonymous() {allElements[10].style.display = "-moz-grid-group";})},
{origCount:84, fun:(function anonymous() {allElements[12].style.clear = "right";})},
{origCount:85, fun:(function anonymous() {allElements[5].style['float'] = "left";})},
{origCount:86, fun:(function anonymous() {allElements[8].style.position = "absolute";})},
{origCount:87, fun:(function anonymous() {allElements[11].style.background = "#fcd";})},
{origCount:88, fun:(function anonymous() {allElements[9].style.position = "relative";})},
{origCount:89, fun:(function anonymous() {allElements[5].style.width = "20em";})},
{origCount:90, fun:(function anonymous() {allElements[6].style.position = "absolute";})},
{origCount:91, fun:(function anonymous() {allElements[5].style.overflow = "scroll";})},
{origCount:92, fun:(function anonymous() {allElements[6].style.background = "#fcd";})},
{origCount:93, fun:(function anonymous() {allElements[2].style.visibility = "visible";})},
{origCount:94, fun:(function anonymous() {allElements[11].style.background = "#fcd";})},
{origCount:95, fun:(function anonymous() {allElements[0].style.visibility = "hidden";})},
{origCount:96, fun:(function anonymous() {allElements[0].style.color = "blue";})},
{origCount:97, fun:(function anonymous() {allElements[3].style['float'] = "left";})},
{origCount:98, fun:(function anonymous() {allElements[3].style.height = "200%";})},
{origCount:99, fun:(function anonymous() {allElements[4].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:100, fun:(function anonymous() {allElements[12].style.width = "10%";})},
{origCount:101, fun:(function anonymous() {allElements[6].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:102, fun:(function anonymous() {allElements[5].style.width = "auto";})},
{origCount:103, fun:(function anonymous() {allElements[1].style.position = "static";})},
{origCount:104, fun:(function anonymous() {allElements[12].style['float'] = "right";})},
{origCount:105, fun:(function anonymous() {allElements[5].style['float'] = "right";})},
{origCount:106, fun:(function anonymous() {allElements[12].style.height = "200%";})},
{origCount:107, fun:(function anonymous() {allElements[11].style['float'] = "none";})},
{origCount:108, fun:(function anonymous() {allElements[9].style.width = "20em";})},
{origCount:109, fun:(function anonymous() {allElements[10].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:110, fun:(function anonymous() {allElements[7].style['float'] = "none";})},
{origCount:111, fun:(function anonymous() {allElements[6].style.visibility = "collapse";})},
{origCount:112, fun:(function anonymous() {allElements[11].style.height = "200%";})},
{origCount:113, fun:(function anonymous() {allElements[3].style.visibility = "visible";})},
{origCount:114, fun:(function anonymous() {allElements[12].style.width = "200%";})},
{origCount:115, fun:(function anonymous() {allElements[5].style.height = "10%";})},
{origCount:116, fun:(function anonymous() {allElements[1].style['float'] = "left";})},
{origCount:117, fun:(function anonymous() {allElements[5].style.overflow = "scroll";})},
{origCount:118, fun:(function anonymous() {allElements[9].style.width = "10%";})},
{origCount:119, fun:(function anonymous() {allElements[6].style.position = "static";})},
{origCount:120, fun:(function anonymous() {allElements[1].style.background = "#fcd";})},
{origCount:121, fun:(function anonymous() {allElements[12].style['float'] = "right";})},
{origCount:122, fun:(function anonymous() {allElements[7].style.width = "1px";})},
{origCount:123, fun:(function anonymous() {allElements[3].style.color = "blue";})},
{origCount:124, fun:(function anonymous() {allElements[6].style.background = "#fcd";})},
{origCount:125, fun:(function anonymous() {allElements[8].style.overflow = "auto";})},
{origCount:126, fun:(function anonymous() {allElements[1].style.overflow = "auto";})},
{origCount:127, fun:(function anonymous() {allElements[5].style['float'] = "none";})},
{origCount:128, fun:(function anonymous() {allElements[12].style.color = "green";})},
{origCount:129, fun:(function anonymous() {allElements[0].style.color = "black";})},
{origCount:130, fun:(function anonymous() {allElements[1].style.position = "relative";})},
{origCount:131, fun:(function anonymous() {allElements[9].style.overflow = "auto";})},
{origCount:132, fun:(function anonymous() {allElements[1].style.display = "table-row";})},
{origCount:133, fun:(function anonymous() {allElements[10].style['float'] = "right";})},
{origCount:134, fun:(function anonymous() {allElements[2].style.visibility = "hidden";})},
{origCount:135, fun:(function anonymous() {allElements[9].style.overflow = "auto";})},
{origCount:136, fun:(function anonymous() {allElements[9].style.clear = "none";})},
{origCount:137, fun:(function anonymous() {allElements[9].style.position = "absolute";})},
{origCount:138, fun:(function anonymous() {allElements[0].style.width = "10%";})},
{origCount:139, fun:(function anonymous() {allElements[1].style.height = "10%";})},
{origCount:140, fun:(function anonymous() {allElements[5].style.height = "auto";})},
{origCount:141, fun:(function anonymous() {allElements[4].style.position = "fixed";})},
{origCount:142, fun:(function anonymous() {allElements[3].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:143, fun:(function anonymous() {allElements[7].style.display = "table-header-group";})},
{origCount:144, fun:(function anonymous() {allElements[10].style.position = "fixed";})},
{origCount:145, fun:(function anonymous() {allElements[4].style.background = "transparent";})},
{origCount:146, fun:(function anonymous() {allElements[6].style.position = "relative";})},
{origCount:147, fun:(function anonymous() {allElements[10].style.clear = "both";})},
{origCount:148, fun:(function anonymous() {allElements[8].style.display = "table-header-group";})},
{origCount:149, fun:(function anonymous() {allElements[5].style.height = "200%";})},
{origCount:150, fun:(function anonymous() {allElements[7].style.height = "2em";})},
{origCount:151, fun:(function anonymous() {allElements[6].style.position = "relative";})},
{origCount:152, fun:(function anonymous() {allElements[7].style.height = "2em";})},
{origCount:153, fun:(function anonymous() {allElements[3].style.width = "10%";})},
{origCount:154, fun:(function anonymous() {allElements[12].style.color = "blue";})},
{origCount:155, fun:(function anonymous() {allElements[2].style.color = "green";})},
{origCount:156, fun:(function anonymous() {allElements[2].style.visibility = "visible";})},
{origCount:157, fun:(function anonymous() {allElements[6].style['float'] = "right";})},
{origCount:158, fun:(function anonymous() {allElements[6].style.visibility = "collapse";})},
{origCount:159, fun:(function anonymous() {allElements[8].style.position = "absolute";})},
{origCount:160, fun:(function anonymous() {allElements[3].style.height = "2em";})},
{origCount:161, fun:(function anonymous() {allElements[10].style.display = "-moz-grid-line";})},
{origCount:162, fun:(function anonymous() {allElements[9].style.color = "red";})},
{origCount:163, fun:(function anonymous() {allElements[6].style.overflow = "hidden";})},
{origCount:164, fun:(function anonymous() {allElements[4].style.overflow = "scroll";})},
{origCount:165, fun:(function anonymous() {allElements[11].style.height = "100px";})},
{origCount:166, fun:(function anonymous() {allElements[5].style.display = "table-footer-group";})},
{origCount:167, fun:(function anonymous() {allElements[5].style.color = "red";})},
{origCount:168, fun:(function anonymous() {allElements[3].style.width = "20em";})},
{origCount:169, fun:(function anonymous() {allElements[4].style['float'] = "right";})},
{origCount:170, fun:(function anonymous() {allElements[2].style.background = "transparent";})},
{origCount:171, fun:(function anonymous() {allElements[0].style.position = "fixed";})},
{origCount:172, fun:(function anonymous() {allElements[6].style.visibility = "hidden";})},
{origCount:173, fun:(function anonymous() {allElements[11].style['float'] = "right";})},
{origCount:174, fun:(function anonymous() {allElements[8].style.height = "200%";})},
{origCount:175, fun:(function anonymous() {allElements[1].style.position = "relative";})},
{origCount:176, fun:(function anonymous() {allElements[11].style.width = "auto";})},
{origCount:177, fun:(function anonymous() {allElements[2].style.background = "#fcd";})},
{origCount:178, fun:(function anonymous() {allElements[6].style.position = "absolute";})},
{origCount:179, fun:(function anonymous() {allElements[3].style.position = "absolute";})},
{origCount:180, fun:(function anonymous() {allElements[12].style['float'] = "right";})},
{origCount:181, fun:(function anonymous() {allElements[11].style.background = "transparent";})},
{origCount:182, fun:(function anonymous() {allElements[6].style.height = "200%";})},
{origCount:183, fun:(function anonymous() {allElements[2].style['float'] = "none";})},
{origCount:184, fun:(function anonymous() {allElements[5].style.position = "absolute";})},
{origCount:185, fun:(function anonymous() {allElements[8].style.color = "blue";})},
{origCount:186, fun:(function anonymous() {allElements[2].style['float'] = "left";})},
{origCount:187, fun:(function anonymous() {allElements[6].style.height = "200%";})},
{origCount:188, fun:(function anonymous() {allElements[0].style.width = "20em";})},
{origCount:189, fun:(function anonymous() {allElements[1].style.display = "table-row-group";})},
{origCount:190, fun:(function anonymous() {allElements[3].style.visibility = "hidden";})},
{origCount:191, fun:(function anonymous() {allElements[11].style.width = "10%";})},
{origCount:192, fun:(function anonymous() {allElements[4].style.width = "200%";})},
{origCount:193, fun:(function anonymous() {allElements[0].style['float'] = "right";})},
{origCount:194, fun:(function anonymous() {allElements[5].style.background = "#fcd";})},
{origCount:195, fun:(function anonymous() {allElements[12].style.visibility = "hidden";})},
{origCount:196, fun:(function anonymous() {allElements[0].style.display = "table-column";})},
{origCount:197, fun:(function anonymous() {allElements[0].style.width = "auto";})},
{origCount:198, fun:(function anonymous() {allElements[4].style.color = "green";})},
{origCount:199, fun:(function anonymous() {allElements[6].style.clear = "none";})},
{origCount:200, fun:(function anonymous() {allElements[10].style.overflow = "hidden";})},
{origCount:201, fun:(function anonymous() {allElements[9].style.visibility = "collapse";})},
{origCount:202, fun:(function anonymous() {allElements[9].style.height = "100px";})},
{origCount:203, fun:(function anonymous() {allElements[1].style.width = "auto";})},
{origCount:204, fun:(function anonymous() {allElements[4].style.position = "fixed";})},
{origCount:205, fun:(function anonymous() {allElements[11].style['float'] = "none";})},
{origCount:206, fun:(function anonymous() {allElements[1].style.clear = "right";})},
{origCount:207, fun:(function anonymous() {allElements[5].style.display = "-moz-stack";})},
{origCount:208, fun:(function anonymous() {allElements[3].style.color = "black";})},
{origCount:209, fun:(function anonymous() {allElements[1].style.background = "transparent";})},
{origCount:210, fun:(function anonymous() {allElements[3].style['float'] = "left";})},
{origCount:211, fun:(function anonymous() {allElements[2].style.height = "2em";})},
{origCount:212, fun:(function anonymous() {allElements[4].style.width = "auto";})},
{origCount:213, fun:(function anonymous() {allElements[0].style['float'] = "none";})},
{origCount:214, fun:(function anonymous() {allElements[10].style.display = "table-caption";})},
{origCount:215, fun:(function anonymous() {allElements[0].style.overflow = "auto";})},
{origCount:216, fun:(function anonymous() {allElements[0].style.color = "green";})},
{origCount:217, fun:(function anonymous() {allElements[5].style.background = "#fcd";})},
{origCount:218, fun:(function anonymous() {allElements[5].style.visibility = "hidden";})},
{origCount:219, fun:(function anonymous() {allElements[7].style.width = "200%";})},
{origCount:220, fun:(function anonymous() {allElements[2].style.background = "transparent";})},
{origCount:221, fun:(function anonymous() {allElements[10].style.visibility = "hidden";})},
{origCount:222, fun:(function anonymous() {allElements[10].style['float'] = "right";})},
{origCount:223, fun:(function anonymous() {allElements[6].style.position = "absolute";})},
{origCount:224, fun:(function anonymous() {allElements[5].style.background = "transparent";})},
{origCount:225, fun:(function anonymous() {allElements[12].style.overflow = "hidden";})},
{origCount:226, fun:(function anonymous() {allElements[7].style.clear = "left";})},
{origCount:227, fun:(function anonymous() {allElements[7].style.height = "200%";})},
{origCount:228, fun:(function anonymous() {allElements[5].style.position = "absolute";})},
{origCount:229, fun:(function anonymous() {allElements[7].style['float'] = "none";})},
{origCount:230, fun:(function anonymous() {allElements[5].style.clear = "both";})},
{origCount:231, fun:(function anonymous() {allElements[4].style.clear = "left";})},
{origCount:232, fun:(function anonymous() {allElements[10].style.position = "fixed";})},
{origCount:233, fun:(function anonymous() {allElements[2].style.overflow = "scroll";})},
{origCount:234, fun:(function anonymous() {allElements[12].style.background = "#fcd";})},
{origCount:235, fun:(function anonymous() {allElements[6].style.color = "black";})},
{origCount:236, fun:(function anonymous() {allElements[3].style.position = "absolute";})},
{origCount:237, fun:(function anonymous() {allElements[8].style.color = "red";})},
{origCount:238, fun:(function anonymous() {allElements[12].style.background = "transparent";})},
{origCount:239, fun:(function anonymous() {allElements[10].style['float'] = "none";})},
{origCount:240, fun:(function anonymous() {allElements[6].style['float'] = "right";})},
{origCount:241, fun:(function anonymous() {allElements[5].style['float'] = "none";})},
{origCount:242, fun:(function anonymous() {allElements[0].style.color = "red";})},
{origCount:243, fun:(function anonymous() {allElements[10].style['float'] = "none";})},
{origCount:244, fun:(function anonymous() {allElements[1].style.width = "1px";})},
{origCount:245, fun:(function anonymous() {allElements[3].style.position = "fixed";})},
{origCount:246, fun:(function anonymous() {allElements[11].style.clear = "left";})},
{origCount:247, fun:(function anonymous() {allElements[2].style.position = "absolute";})},
{origCount:248, fun:(function anonymous() {allElements[9].style.background = "#fcd";})},
{origCount:249, fun:(function anonymous() {allElements[11].style.position = "relative";})},
{origCount:250, fun:(function anonymous() {allElements[1].style.height = "100px";})},
{origCount:251, fun:(function anonymous() {allElements[9].style.background = "transparent";})},
{origCount:252, fun:(function anonymous() {allElements[2].style.display = "block";})},
{origCount:253, fun:(function anonymous() {allElements[12].style.background = "#fcd";})},
{origCount:254, fun:(function anonymous() {allElements[4].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:255, fun:(function anonymous() {allElements[12].style.color = "black";})},
{origCount:256, fun:(function anonymous() {allElements[0].style.height = "auto";})},
{origCount:257, fun:(function anonymous() {allElements[0].style.height = "100px";})},
{origCount:258, fun:(function anonymous() {allElements[5].style.clear = "right";})},
{origCount:259, fun:(function anonymous() {allElements[7].style.height = "100px";})},
{origCount:260, fun:(function anonymous() {allElements[11].style.background = "transparent";})},
{origCount:261, fun:(function anonymous() {allElements[11].style.width = "20em";})},
{origCount:262, fun:(function anonymous() {allElements[10].style.width = "1px";})},
{origCount:263, fun:(function anonymous() {allElements[3].style.clear = "left";})},
{origCount:264, fun:(function anonymous() {allElements[7].style['float'] = "left";})},
{origCount:265, fun:(function anonymous() {allElements[1].style['float'] = "none";})},
{origCount:266, fun:(function anonymous() {allElements[4].style.overflow = "scroll";})},
{origCount:267, fun:(function anonymous() {allElements[9].style.height = "auto";})},
{origCount:268, fun:(function anonymous() {allElements[7].style.background = "transparent";})},
{origCount:269, fun:(function anonymous() {allElements[5].style.display = "table";})},
{origCount:270, fun:(function anonymous() {allElements[7].style.width = "200%";})},
{origCount:271, fun:(function anonymous() {allElements[7].style.clear = "left";})},
{origCount:272, fun:(function anonymous() {allElements[9].style.visibility = "hidden";})},
{origCount:273, fun:(function anonymous() {allElements[6].style.height = "10%";})},
{origCount:274, fun:(function anonymous() {allElements[3].style.position = "fixed";})},
{origCount:275, fun:(function anonymous() {allElements[6].style.display = "block";})},
{origCount:276, fun:(function anonymous() {allElements[7].style.overflow = "visible";})},
{origCount:277, fun:(function anonymous() {allElements[12].style['float'] = "none";})},
{origCount:278, fun:(function anonymous() {allElements[0].style['float'] = "none";})},
{origCount:279, fun:(function anonymous() {allElements[2].style.height = "10%";})},
{origCount:280, fun:(function anonymous() {allElements[11].style.clear = "right";})},
{origCount:281, fun:(function anonymous() {allElements[6].style.clear = "both";})},
{origCount:282, fun:(function anonymous() {allElements[6].style.display = "-moz-box";})},
{origCount:283, fun:(function anonymous() {allElements[3].style.height = "100px";})},
{origCount:284, fun:(function anonymous() {allElements[2].style.color = "blue";})},
{origCount:285, fun:(function anonymous() {allElements[10].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:286, fun:(function anonymous() {allElements[4].style.background = "transparent";})},
{origCount:287, fun:(function anonymous() {allElements[5].style.height = "auto";})},
{origCount:288, fun:(function anonymous() {allElements[3].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:289, fun:(function anonymous() {allElements[5].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:290, fun:(function anonymous() {allElements[4].style.clear = "right";})},
{origCount:291, fun:(function anonymous() {allElements[3].style.overflow = "auto";})},
{origCount:292, fun:(function anonymous() {allElements[10].style.display = "-moz-stack";})},
{origCount:293, fun:(function anonymous() {allElements[2].style.color = "red";})},
{origCount:294, fun:(function anonymous() {allElements[0].style.display = "-moz-groupbox";})},
{origCount:295, fun:(function anonymous() {allElements[7].style.position = "fixed";})},
{origCount:296, fun:(function anonymous() {allElements[4].style.color = "green";})},
{origCount:297, fun:(function anonymous() {allElements[9].style.display = "-moz-box";})},
{origCount:298, fun:(function anonymous() {allElements[1].style.color = "green";})},
{origCount:299, fun:(function anonymous() {allElements[12].style.visibility = "hidden";})},
{origCount:300, fun:(function anonymous() {allElements[8].style.color = "red";})},
{origCount:301, fun:(function anonymous() {allElements[8].style['float'] = "left";})},
{origCount:302, fun:(function anonymous() {allElements[3].style.height = "2em";})},
{origCount:303, fun:(function anonymous() {allElements[1].style.width = "auto";})},
{origCount:304, fun:(function anonymous() {allElements[4].style.height = "10%";})},
{origCount:305, fun:(function anonymous() {allElements[8].style.width = "20em";})},
{origCount:306, fun:(function anonymous() {allElements[2].style.height = "2em";})},
{origCount:307, fun:(function anonymous() {allElements[7].style.color = "red";})},
{origCount:308, fun:(function anonymous() {allElements[2].style.display = "-moz-inline-box";})},
{origCount:309, fun:(function anonymous() {allElements[4].style.visibility = "visible";})},
{origCount:310, fun:(function anonymous() {allElements[7].style.display = "-moz-deck";})},
{origCount:311, fun:(function anonymous() {allElements[2].style.visibility = "hidden";})},
{origCount:312, fun:(function anonymous() {allElements[9].style.clear = "both";})},
{origCount:313, fun:(function anonymous() {allElements[6].style['float'] = "left";})},
{origCount:314, fun:(function anonymous() {allElements[12].style.position = "static";})},
{origCount:315, fun:(function anonymous() {allElements[6].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:316, fun:(function anonymous() {allElements[8].style.visibility = "visible";})},
{origCount:317, fun:(function anonymous() {allElements[8].style.background = "#fcd";})},
{origCount:318, fun:(function anonymous() {allElements[1].style.visibility = "collapse";})},
{origCount:319, fun:(function anonymous() {allElements[3].style.position = "static";})},
{origCount:320, fun:(function anonymous() {allElements[8].style.overflow = "hidden";})},
{origCount:321, fun:(function anonymous() {allElements[8].style.clear = "left";})},
{origCount:322, fun:(function anonymous() {allElements[8].style.position = "static";})},
{origCount:323, fun:(function anonymous() {allElements[1].style['float'] = "none";})},
{origCount:324, fun:(function anonymous() {allElements[5].style.visibility = "hidden";})},
{origCount:325, fun:(function anonymous() {allElements[12].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:326, fun:(function anonymous() {allElements[3].style.overflow = "visible";})},
{origCount:327, fun:(function anonymous() {allElements[8].style.visibility = "collapse";})},
{origCount:328, fun:(function anonymous() {allElements[7].style.position = "static";})},
{origCount:329, fun:(function anonymous() {allElements[5].style.visibility = "collapse";})},
{origCount:330, fun:(function anonymous() {allElements[8].style.visibility = "visible";})},
{origCount:331, fun:(function anonymous() {allElements[8].style.height = "auto";})},
{origCount:332, fun:(function anonymous() {allElements[10].style.overflow = "scroll";})},
{origCount:333, fun:(function anonymous() {allElements[7].style.overflow = "visible";})},
{origCount:334, fun:(function anonymous() {allElements[5].style.visibility = "visible";})},
{origCount:335, fun:(function anonymous() {allElements[8].style.position = "fixed";})},
{origCount:336, fun:(function anonymous() {allElements[10].style.display = "-moz-grid-line";})},
{origCount:337, fun:(function anonymous() {allElements[2].style['float'] = "left";})},
{origCount:338, fun:(function anonymous() {allElements[3].style.position = "absolute";})},
{origCount:339, fun:(function anonymous() {allElements[5].style.color = "green";})},
{origCount:340, fun:(function anonymous() {allElements[2].style.display = "-moz-groupbox";})},
{origCount:341, fun:(function anonymous() {allElements[10].style.overflow = "auto";})},
{origCount:342, fun:(function anonymous() {allElements[10].style['float'] = "left";})},
{origCount:343, fun:(function anonymous() {allElements[8].style.clear = "both";})},
{origCount:344, fun:(function anonymous() {allElements[8].style.clear = "right";})},
{origCount:345, fun:(function anonymous() {allElements[2].style.color = "blue";})},
{origCount:346, fun:(function anonymous() {allElements[10].style.height = "10%";})},
{origCount:347, fun:(function anonymous() {allElements[11].style.overflow = "hidden";})},
{origCount:348, fun:(function anonymous() {allElements[10].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:349, fun:(function anonymous() {allElements[0].style['float'] = "left";})},
{origCount:350, fun:(function anonymous() {allElements[11].style.width = "10%";})},
{origCount:351, fun:(function anonymous() {allElements[11].style.overflow = "hidden";})},
{origCount:352, fun:(function anonymous() {allElements[5].style.color = "green";})},
{origCount:353, fun:(function anonymous() {allElements[11].style.position = "relative";})},
{origCount:354, fun:(function anonymous() {allElements[9].style.position = "static";})},
{origCount:355, fun:(function anonymous() {allElements[4].style.height = "10%";})},
{origCount:356, fun:(function anonymous() {allElements[1].style.position = "fixed";})},
{origCount:357, fun:(function anonymous() {allElements[6].style.position = "fixed";})},
{origCount:358, fun:(function anonymous() {allElements[12].style.display = "block";})},
{origCount:359, fun:(function anonymous() {allElements[10].style.display = "-moz-inline-block";})},
{origCount:360, fun:(function anonymous() {allElements[6].style.height = "100px";})},
{origCount:361, fun:(function anonymous() {allElements[6].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:362, fun:(function anonymous() {allElements[2].style['float'] = "right";})},
{origCount:363, fun:(function anonymous() {allElements[0].style.display = "-moz-grid-group";})},
{origCount:364, fun:(function anonymous() {allElements[4].style.background = "#fcd";})},
{origCount:365, fun:(function anonymous() {allElements[8].style['float'] = "none";})},
{origCount:366, fun:(function anonymous() {allElements[3].style.position = "relative";})},
{origCount:367, fun:(function anonymous() {allElements[8].style.position = "static";})},
{origCount:368, fun:(function anonymous() {allElements[3].style.position = "relative";})},
{origCount:369, fun:(function anonymous() {allElements[5].style.width = "auto";})},
{origCount:370, fun:(function anonymous() {allElements[8].style.clear = "none";})},
{origCount:371, fun:(function anonymous() {allElements[4].style.color = "red";})},
{origCount:372, fun:(function anonymous() {allElements[11].style.width = "auto";})},
{origCount:373, fun:(function anonymous() {allElements[9].style['float'] = "right";})},
{origCount:374, fun:(function anonymous() {allElements[2].style.width = "20em";})},
{origCount:375, fun:(function anonymous() {allElements[10].style.position = "relative";})},
{origCount:376, fun:(function anonymous() {allElements[12].style.position = "relative";})},
{origCount:377, fun:(function anonymous() {allElements[0].style.display = "-moz-grid";})},
{origCount:378, fun:(function anonymous() {allElements[5].style.clear = "left";})},
{origCount:379, fun:(function anonymous() {allElements[8].style.color = "green";})},
{origCount:380, fun:(function anonymous() {allElements[0].style.clear = "both";})},
{origCount:381, fun:(function anonymous() {allElements[0].style['float'] = "left";})},
{origCount:382, fun:(function anonymous() {allElements[1].style.background = "#fcd";})},
{origCount:383, fun:(function anonymous() {allElements[7].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:384, fun:(function anonymous() {allElements[12].style.visibility = "hidden";})},
{origCount:385, fun:(function anonymous() {allElements[7].style['float'] = "right";})},
{origCount:386, fun:(function anonymous() {allElements[11].style.display = "table-row";})},
{origCount:387, fun:(function anonymous() {allElements[3].style.position = "absolute";})},
{origCount:388, fun:(function anonymous() {allElements[2].style.height = "200%";})},
{origCount:389, fun:(function anonymous() {allElements[1].style.clear = "none";})},
{origCount:390, fun:(function anonymous() {allElements[4].style.position = "static";})},
{origCount:391, fun:(function anonymous() {allElements[4].style.position = "relative";})},
{origCount:392, fun:(function anonymous() {allElements[7].style.position = "fixed";})},
{origCount:393, fun:(function anonymous() {allElements[4].style.background = "transparent";})},
{origCount:394, fun:(function anonymous() {allElements[2].style.height = "200%";})},
{origCount:395, fun:(function anonymous() {allElements[6].style.position = "relative";})},
{origCount:396, fun:(function anonymous() {allElements[8].style.overflow = "auto";})},
{origCount:397, fun:(function anonymous() {allElements[0].style.background = "transparent";})},
{origCount:398, fun:(function anonymous() {allElements[2].style.position = "static";})},
{origCount:399, fun:(function anonymous() {allElements[4].style['float'] = "none";})},
{origCount:400, fun:(function anonymous() {allElements[1].style.height = "200%";})},
{origCount:401, fun:(function anonymous() {allElements[10].style.color = "green";})},
{origCount:402, fun:(function anonymous() {allElements[11].style.overflow = "hidden";})},
{origCount:403, fun:(function anonymous() {allElements[8].style.height = "200%";})},
{origCount:404, fun:(function anonymous() {allElements[9].style.visibility = "hidden";})},
{origCount:405, fun:(function anonymous() {allElements[4].style.display = "block";})},
{origCount:406, fun:(function anonymous() {allElements[12].style.height = "200%";})},
{origCount:407, fun:(function anonymous() {allElements[0].style.width = "auto";})},
{origCount:408, fun:(function anonymous() {allElements[0].style.position = "static";})},
{origCount:409, fun:(function anonymous() {allElements[2].style['float'] = "right";})},
{origCount:410, fun:(function anonymous() {allElements[1].style.display = "-moz-grid-group";})},
{origCount:411, fun:(function anonymous() {allElements[2].style.visibility = "hidden";})},
{origCount:412, fun:(function anonymous() {allElements[9].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:413, fun:(function anonymous() {allElements[2].style.width = "auto";})},
{origCount:414, fun:(function anonymous() {allElements[0].style.display = "-moz-inline-box";})},
{origCount:415, fun:(function anonymous() {allElements[9].style.clear = "none";})},
{origCount:416, fun:(function anonymous() {allElements[6].style['float'] = "none";})},
{origCount:417, fun:(function anonymous() {allElements[12].style.visibility = "hidden";})},
{origCount:418, fun:(function anonymous() {allElements[5].style.position = "absolute";})},
{origCount:419, fun:(function anonymous() {allElements[3].style.width = "1px";})},
{origCount:420, fun:(function anonymous() {allElements[0].style.height = "2em";})},
{origCount:421, fun:(function anonymous() {allElements[0].style['float'] = "right";})},
{origCount:422, fun:(function anonymous() {allElements[10].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:423, fun:(function anonymous() {allElements[8].style.display = "-moz-inline-box";})},
{origCount:424, fun:(function anonymous() {allElements[12].style.clear = "none";})},
{origCount:425, fun:(function anonymous() {allElements[3].style.background = "transparent";})},
{origCount:426, fun:(function anonymous() {allElements[12].style.overflow = "scroll";})},
{origCount:427, fun:(function anonymous() {allElements[4].style.height = "200%";})},
{origCount:428, fun:(function anonymous() {allElements[12].style.visibility = "collapse";})},
{origCount:429, fun:(function anonymous() {allElements[2].style.clear = "right";})},
{origCount:430, fun:(function anonymous() {allElements[6].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:431, fun:(function anonymous() {allElements[2].style.color = "blue";})},
{origCount:432, fun:(function anonymous() {allElements[9].style.clear = "right";})},
{origCount:433, fun:(function anonymous() {allElements[7].style.background = "transparent";})},
{origCount:434, fun:(function anonymous() {allElements[1].style.width = "10%";})},
{origCount:435, fun:(function anonymous() {allElements[9].style.width = "10%";})},
{origCount:436, fun:(function anonymous() {allElements[11].style.display = "table-column-group";})},
{origCount:437, fun:(function anonymous() {allElements[0].style.visibility = "visible";})},
{origCount:438, fun:(function anonymous() {allElements[6].style.color = "black";})},
{origCount:439, fun:(function anonymous() {allElements[9].style.position = "relative";})},
{origCount:440, fun:(function anonymous() {allElements[1].style.visibility = "hidden";})},
{origCount:441, fun:(function anonymous() {allElements[2].style.overflow = "hidden";})},
{origCount:442, fun:(function anonymous() {allElements[3].style.color = "black";})},
{origCount:443, fun:(function anonymous() {allElements[9].style.height = "200%";})},
{origCount:444, fun:(function anonymous() {allElements[1].style.height = "200%";})},
{origCount:445, fun:(function anonymous() {allElements[9].style['float'] = "right";})},
{origCount:446, fun:(function anonymous() {allElements[1].style.color = "green";})},
{origCount:447, fun:(function anonymous() {allElements[6].style.clear = "left";})},
{origCount:448, fun:(function anonymous() {allElements[6].style.height = "2em";})},
{origCount:449, fun:(function anonymous() {allElements[5].style.overflow = "visible";})},
{origCount:450, fun:(function anonymous() {allElements[8].style.visibility = "collapse";})},
{origCount:451, fun:(function anonymous() {allElements[9].style.color = "blue";})},
{origCount:452, fun:(function anonymous() {allElements[12].style.height = "200%";})},
{origCount:453, fun:(function anonymous() {allElements[10].style.color = "red";})},
{origCount:454, fun:(function anonymous() {allElements[8].style.display = "table-cell";})},
{origCount:455, fun:(function anonymous() {allElements[12].style['float'] = "right";})},
{origCount:456, fun:(function anonymous() {allElements[2].style.overflow = "auto";})},
{origCount:457, fun:(function anonymous() {allElements[7].style['float'] = "none";})},
{origCount:458, fun:(function anonymous() {allElements[9].style.clear = "left";})},
{origCount:459, fun:(function anonymous() {allElements[12].style.clear = "right";})},
{origCount:460, fun:(function anonymous() {allElements[9].style.position = "absolute";})},
{origCount:461, fun:(function anonymous() {allElements[6].style.position = "fixed";})},
{origCount:462, fun:(function anonymous() {allElements[7].style.color = "blue";})},
{origCount:463, fun:(function anonymous() {allElements[5].style.position = "absolute";})},
{origCount:464, fun:(function anonymous() {allElements[5].style.display = "-moz-popup";})},
{origCount:465, fun:(function anonymous() {allElements[1].style.position = "static";})},
{origCount:466, fun:(function anonymous() {allElements[9].style.position = "absolute";})},
{origCount:467, fun:(function anonymous() {allElements[11].style.background = "transparent";})},
{origCount:468, fun:(function anonymous() {allElements[11].style.background = "#fcd";})},
{origCount:469, fun:(function anonymous() {allElements[1].style.background = "#fcd";})},
{origCount:470, fun:(function anonymous() {allElements[0].style.display = "table-row";})},
{origCount:471, fun:(function anonymous() {allElements[1].style.background = "#fcd";})},
{origCount:472, fun:(function anonymous() {allElements[8].style.position = "fixed";})},
{origCount:473, fun:(function anonymous() {allElements[2].style['float'] = "left";})},
{origCount:474, fun:(function anonymous() {allElements[1].style.color = "red";})},
{origCount:475, fun:(function anonymous() {allElements[9].style.height = "2em";})},
{origCount:476, fun:(function anonymous() {allElements[7].style.display = "-moz-grid";})},
{origCount:477, fun:(function anonymous() {allElements[0].style.height = "2em";})},
{origCount:478, fun:(function anonymous() {allElements[6].style.position = "absolute";})},
{origCount:479, fun:(function anonymous() {allElements[5].style.clear = "none";})},
{origCount:480, fun:(function anonymous() {allElements[3].style.overflow = "hidden";})},
{origCount:481, fun:(function anonymous() {allElements[3].style['float'] = "none";})},
{origCount:482, fun:(function anonymous() {allElements[0].style['float'] = "none";})},
{origCount:483, fun:(function anonymous() {allElements[11].style.height = "100px";})},
{origCount:484, fun:(function anonymous() {allElements[3].style.display = "-moz-inline-box";})},
{origCount:485, fun:(function anonymous() {allElements[7].style.display = "block";})},
{origCount:486, fun:(function anonymous() {allElements[3].style.visibility = "visible";})},
{origCount:487, fun:(function anonymous() {allElements[9].style.clear = "left";})},
{origCount:488, fun:(function anonymous() {allElements[5].style.width = "200%";})},
{origCount:489, fun:(function anonymous() {allElements[8].style['float'] = "right";})},
{origCount:490, fun:(function anonymous() {allElements[12].style.height = "100px";})},
{origCount:491, fun:(function anonymous() {allElements[8].style.display = "-moz-deck";})},
{origCount:492, fun:(function anonymous() {allElements[3].style.clear = "right";})},
{origCount:493, fun:(function anonymous() {allElements[1].style['float'] = "none";})},
{origCount:494, fun:(function anonymous() {allElements[8].style.overflow = "visible";})},
{origCount:495, fun:(function anonymous() {allElements[4].style.height = "10%";})},
{origCount:496, fun:(function anonymous() {allElements[7].style.color = "red";})},
{origCount:497, fun:(function anonymous() {allElements[8].style.clear = "right";})},
{origCount:498, fun:(function anonymous() {allElements[2].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:499, fun:(function anonymous() {allElements[5].style.height = "100px";})},
{origCount:500, fun:(function anonymous() {allElements[11].style.clear = "none";})},
{origCount:501, fun:(function anonymous() {allElements[12].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:502, fun:(function anonymous() {allElements[0].style.display = "-moz-grid";})},
{origCount:503, fun:(function anonymous() {allElements[7].style.height = "100px";})},
{origCount:504, fun:(function anonymous() {allElements[12].style.visibility = "visible";})},
{origCount:505, fun:(function anonymous() {allElements[8].style.background = "#fcd";})},
{origCount:506, fun:(function anonymous() {allElements[0].style.color = "black";})},
{origCount:507, fun:(function anonymous() {allElements[6].style.overflow = "hidden";})},
{origCount:508, fun:(function anonymous() {allElements[6].style.background = "transparent";})},
{origCount:509, fun:(function anonymous() {allElements[5].style.color = "black";})},
{origCount:510, fun:(function anonymous() {allElements[9].style.background = "transparent";})},
{origCount:511, fun:(function anonymous() {allElements[10].style.position = "fixed";})},
{origCount:512, fun:(function anonymous() {allElements[0].style.clear = "right";})},
{origCount:513, fun:(function anonymous() {allElements[11].style.display = "table-caption";})},
{origCount:514, fun:(function anonymous() {allElements[10].style.clear = "right";})},
{origCount:515, fun:(function anonymous() {allElements[1].style.visibility = "hidden";})},
{origCount:516, fun:(function anonymous() {allElements[4].style.clear = "left";})},
{origCount:517, fun:(function anonymous() {allElements[10].style['float'] = "none";})},
{origCount:518, fun:(function anonymous() {allElements[12].style.overflow = "scroll";})},
{origCount:519, fun:(function anonymous() {allElements[3].style.width = "1px";})},
{origCount:520, fun:(function anonymous() {allElements[0].style.position = "fixed";})},
{origCount:521, fun:(function anonymous() {allElements[10].style.height = "200%";})},
{origCount:522, fun:(function anonymous() {allElements[11].style.position = "relative";})},
{origCount:523, fun:(function anonymous() {allElements[10].style.color = "black";})},
{origCount:524, fun:(function anonymous() {allElements[11].style.background = "transparent";})},
{origCount:525, fun:(function anonymous() {allElements[6].style.visibility = "collapse";})},
{origCount:526, fun:(function anonymous() {allElements[3].style.background = "transparent";})},
{origCount:527, fun:(function anonymous() {allElements[4].style.visibility = "visible";})},
{origCount:528, fun:(function anonymous() {allElements[5].style.background = "transparent";})},
{origCount:529, fun:(function anonymous() {allElements[8].style['float'] = "none";})},
{origCount:530, fun:(function anonymous() {allElements[8].style.height = "auto";})},
{origCount:531, fun:(function anonymous() {allElements[9].style.background = "#fcd";})},
{origCount:532, fun:(function anonymous() {allElements[4].style.height = "auto";})},
{origCount:533, fun:(function anonymous() {allElements[11].style.background = "#fcd";})},
{origCount:534, fun:(function anonymous() {allElements[10].style.width = "20em";})},
{origCount:535, fun:(function anonymous() {allElements[6].style.position = "fixed";})},
{origCount:536, fun:(function anonymous() {allElements[4].style['float'] = "left";})},
{origCount:537, fun:(function anonymous() {allElements[10].style.clear = "none";})},
{origCount:538, fun:(function anonymous() {allElements[4].style.height = "auto";})},
{origCount:539, fun:(function anonymous() {allElements[3].style.clear = "right";})},
{origCount:540, fun:(function anonymous() {allElements[1].style.width = "200%";})},
{origCount:541, fun:(function anonymous() {allElements[2].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:542, fun:(function anonymous() {allElements[12].style.clear = "left";})},
{origCount:543, fun:(function anonymous() {allElements[10].style.visibility = "hidden";})},
{origCount:544, fun:(function anonymous() {allElements[3].style.height = "auto";})},
{origCount:545, fun:(function anonymous() {allElements[7].style.visibility = "collapse";})},
{origCount:546, fun:(function anonymous() {allElements[4].style.width = "auto";})},
{origCount:547, fun:(function anonymous() {allElements[10].style.height = "auto";})},
{origCount:548, fun:(function anonymous() {allElements[6].style['float'] = "none";})},
{origCount:549, fun:(function anonymous() {allElements[10].style.overflow = "auto";})},
{origCount:550, fun:(function anonymous() {allElements[1].style.height = "auto";})},
{origCount:551, fun:(function anonymous() {allElements[11].style.overflow = "hidden";})},
{origCount:552, fun:(function anonymous() {allElements[6].style.background = "transparent";})},
{origCount:553, fun:(function anonymous() {allElements[4].style['float'] = "left";})},
{origCount:554, fun:(function anonymous() {allElements[12].style.height = "200%";})},
{origCount:555, fun:(function anonymous() {allElements[8].style.color = "green";})},
{origCount:556, fun:(function anonymous() {allElements[10].style.background = "#fcd";})},
{origCount:557, fun:(function anonymous() {allElements[0].style.overflow = "hidden";})},
{origCount:558, fun:(function anonymous() {allElements[6].style.overflow = "hidden";})},
{origCount:559, fun:(function anonymous() {allElements[10].style.clear = "right";})},
{origCount:560, fun:(function anonymous() {allElements[3].style.background = "transparent";})},
{origCount:561, fun:(function anonymous() {allElements[5].style.color = "green";})},
{origCount:562, fun:(function anonymous() {allElements[6].style.position = "static";})},
{origCount:563, fun:(function anonymous() {allElements[1].style.overflow = "hidden";})},
{origCount:564, fun:(function anonymous() {allElements[6].style.display = "inline";})},
{origCount:565, fun:(function anonymous() {allElements[2].style['float'] = "left";})},
{origCount:566, fun:(function anonymous() {allElements[7].style.visibility = "visible";})},
{origCount:567, fun:(function anonymous() {allElements[1].style.color = "blue";})},
{origCount:568, fun:(function anonymous() {allElements[1].style.clear = "both";})},
{origCount:569, fun:(function anonymous() {allElements[0].style.position = "relative";})},
{origCount:570, fun:(function anonymous() {allElements[5].style.height = "100px";})},
{origCount:571, fun:(function anonymous() {allElements[6].style.height = "auto";})},
{origCount:572, fun:(function anonymous() {allElements[10].style['float'] = "left";})},
{origCount:573, fun:(function anonymous() {allElements[8].style.position = "absolute";})},
{origCount:574, fun:(function anonymous() {allElements[7].style.background = "#fcd";})},
{origCount:575, fun:(function anonymous() {allElements[12].style.display = "-moz-popup";})},
{origCount:576, fun:(function anonymous() {allElements[2].style.position = "absolute";})},
{origCount:577, fun:(function anonymous() {allElements[9].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:578, fun:(function anonymous() {allElements[11].style.overflow = "visible";})},
{origCount:579, fun:(function anonymous() {allElements[2].style.display = "-moz-inline-box";})},
{origCount:580, fun:(function anonymous() {allElements[0].style.display = "-moz-popup";})},
{origCount:581, fun:(function anonymous() {allElements[10].style['float'] = "right";})},
{origCount:582, fun:(function anonymous() {allElements[12].style.height = "10%";})},
{origCount:583, fun:(function anonymous() {allElements[10].style.position = "static";})},
{origCount:584, fun:(function anonymous() {allElements[12].style.height = "200%";})},
{origCount:585, fun:(function anonymous() {allElements[8].style.height = "auto";})},
{origCount:586, fun:(function anonymous() {allElements[4].style.color = "green";})},
{origCount:587, fun:(function anonymous() {allElements[7].style.color = "red";})},
{origCount:588, fun:(function anonymous() {allElements[7].style.visibility = "collapse";})},
{origCount:589, fun:(function anonymous() {allElements[11].style['float'] = "left";})},
{origCount:590, fun:(function anonymous() {allElements[11].style.visibility = "hidden";})},
{origCount:591, fun:(function anonymous() {allElements[12].style.overflow = "visible";})},
{origCount:592, fun:(function anonymous() {allElements[8].style['float'] = "none";})},
{origCount:593, fun:(function anonymous() {allElements[2].style.display = "table-cell";})},
{origCount:594, fun:(function anonymous() {allElements[1].style.color = "black";})},
{origCount:595, fun:(function anonymous() {allElements[11].style.color = "green";})},
{origCount:596, fun:(function anonymous() {allElements[9].style.color = "red";})},
{origCount:597, fun:(function anonymous() {allElements[3].style['float'] = "none";})},
{origCount:598, fun:(function anonymous() {allElements[10].style.display = "inline";})},
{origCount:599, fun:(function anonymous() {allElements[10].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:600, fun:(function anonymous() {allElements[7].style.width = "10%";})},
{origCount:601, fun:(function anonymous() {allElements[9].style['float'] = "left";})},
{origCount:602, fun:(function anonymous() {allElements[6].style.width = "10%";})},
{origCount:603, fun:(function anonymous() {allElements[5].style.position = "absolute";})},
{origCount:604, fun:(function anonymous() {allElements[11].style.position = "static";})},
{origCount:605, fun:(function anonymous() {allElements[3].style.clear = "none";})},
{origCount:606, fun:(function anonymous() {allElements[0].style['float'] = "right";})},
{origCount:607, fun:(function anonymous() {allElements[6].style.position = "static";})},
{origCount:608, fun:(function anonymous() {allElements[3].style.height = "2em";})},
{origCount:609, fun:(function anonymous() {allElements[7].style.width = "20em";})},
{origCount:610, fun:(function anonymous() {allElements[11].style.overflow = "scroll";})},
{origCount:611, fun:(function anonymous() {allElements[8].style.position = "relative";})},
{origCount:612, fun:(function anonymous() {allElements[4].style['float'] = "left";})},
{origCount:613, fun:(function anonymous() {allElements[3].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:614, fun:(function anonymous() {allElements[11].style.height = "auto";})},
{origCount:615, fun:(function anonymous() {allElements[7].style['float'] = "right";})},
{origCount:616, fun:(function anonymous() {allElements[10].style.overflow = "scroll";})},
{origCount:617, fun:(function anonymous() {allElements[0].style.color = "green";})},
{origCount:618, fun:(function anonymous() {allElements[7].style['float'] = "none";})},
{origCount:619, fun:(function anonymous() {allElements[11].style.height = "10%";})},
{origCount:620, fun:(function anonymous() {allElements[4].style.height = "200%";})},
{origCount:621, fun:(function anonymous() {allElements[6].style.display = "-moz-popup";})},
{origCount:622, fun:(function anonymous() {allElements[8].style.position = "relative";})},
{origCount:623, fun:(function anonymous() {allElements[3].style.width = "1px";})},
{origCount:624, fun:(function anonymous() {allElements[8].style.height = "auto";})},
{origCount:625, fun:(function anonymous() {allElements[5].style['float'] = "right";})},
{origCount:626, fun:(function anonymous() {allElements[10].style.background = "transparent";})},
{origCount:627, fun:(function anonymous() {allElements[4].style.visibility = "visible";})},
{origCount:628, fun:(function anonymous() {allElements[5].style.display = "list-item";})},
{origCount:629, fun:(function anonymous() {allElements[5].style.height = "100px";})},
{origCount:630, fun:(function anonymous() {allElements[9].style.background = "transparent";})},
{origCount:631, fun:(function anonymous() {allElements[11].style.clear = "both";})},
{origCount:632, fun:(function anonymous() {allElements[2].style.overflow = "visible";})},
{origCount:633, fun:(function anonymous() {allElements[1].style.visibility = "hidden";})},
{origCount:634, fun:(function anonymous() {allElements[1].style['float'] = "none";})},
{origCount:635, fun:(function anonymous() {allElements[6].style.height = "2em";})},
{origCount:636, fun:(function anonymous() {allElements[9].style.position = "relative";})},
{origCount:637, fun:(function anonymous() {allElements[3].style.clear = "left";})},
{origCount:638, fun:(function anonymous() {allElements[6].style.display = "table-header-group";})},
{origCount:639, fun:(function anonymous() {allElements[10].style.display = "-moz-box";})},
{origCount:640, fun:(function anonymous() {allElements[8].style.color = "blue";})},
{origCount:641, fun:(function anonymous() {allElements[6].style.width = "200%";})},
{origCount:642, fun:(function anonymous() {allElements[8].style['float'] = "none";})},
{origCount:643, fun:(function anonymous() {allElements[7].style.height = "10%";})},
{origCount:644, fun:(function anonymous() {allElements[8].style.width = "1px";})},
{origCount:645, fun:(function anonymous() {allElements[5].style.clear = "right";})},
{origCount:646, fun:(function anonymous() {allElements[2].style.display = "table-row-group";})},
{origCount:647, fun:(function anonymous() {allElements[4].style.color = "blue";})},
{origCount:648, fun:(function anonymous() {allElements[5].style.color = "red";})},
{origCount:649, fun:(function anonymous() {allElements[10].style.background = "transparent";})},
{origCount:650, fun:(function anonymous() {allElements[10].style.visibility = "visible";})},
{origCount:651, fun:(function anonymous() {allElements[12].style.height = "auto";})},
{origCount:652, fun:(function anonymous() {allElements[7].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:653, fun:(function anonymous() {allElements[2].style.visibility = "visible";})},
{origCount:654, fun:(function anonymous() {allElements[2].style.clear = "none";})},
{origCount:655, fun:(function anonymous() {allElements[11].style.position = "relative";})},
{origCount:656, fun:(function anonymous() {allElements[10].style.width = "200%";})},
{origCount:657, fun:(function anonymous() {allElements[4].style.overflow = "scroll";})},
{origCount:658, fun:(function anonymous() {allElements[12].style.clear = "none";})},
{origCount:659, fun:(function anonymous() {allElements[12].style['float'] = "none";})},
{origCount:660, fun:(function anonymous() {allElements[10].style.overflow = "scroll";})},
{origCount:661, fun:(function anonymous() {allElements[12].style.clear = "left";})},
{origCount:662, fun:(function anonymous() {allElements[10].style.clear = "right";})},
{origCount:663, fun:(function anonymous() {allElements[9].style.clear = "none";})},
{origCount:664, fun:(function anonymous() {allElements[2].style.overflow = "hidden";})},
{origCount:665, fun:(function anonymous() {allElements[7].style.overflow = "visible";})},
{origCount:666, fun:(function anonymous() {allElements[4].style.width = "1px";})},
{origCount:667, fun:(function anonymous() {allElements[11].style.color = "blue";})},
{origCount:668, fun:(function anonymous() {allElements[8].style.position = "relative";})},
{origCount:669, fun:(function anonymous() {allElements[12].style.color = "black";})},
{origCount:670, fun:(function anonymous() {allElements[4].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:671, fun:(function anonymous() {allElements[2].style['float'] = "right";})},
{origCount:672, fun:(function anonymous() {allElements[10].style['float'] = "left";})},
{origCount:673, fun:(function anonymous() {allElements[10].style.clear = "right";})},
{origCount:674, fun:(function anonymous() {allElements[5].style.color = "black";})},
{origCount:675, fun:(function anonymous() {allElements[2].style.clear = "right";})},
{origCount:676, fun:(function anonymous() {allElements[5].style.height = "200%";})},
{origCount:677, fun:(function anonymous() {allElements[8].style.position = "absolute";})},
{origCount:678, fun:(function anonymous() {allElements[3].style.clear = "none";})},
{origCount:679, fun:(function anonymous() {allElements[7].style.position = "relative";})},
{origCount:680, fun:(function anonymous() {allElements[1].style.background = "transparent";})},
{origCount:681, fun:(function anonymous() {allElements[3].style.position = "static";})},
{origCount:682, fun:(function anonymous() {allElements[5].style['float'] = "left";})},
{origCount:683, fun:(function anonymous() {allElements[0].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:684, fun:(function anonymous() {allElements[7].style.display = "-moz-grid-line";})},
{origCount:685, fun:(function anonymous() {allElements[3].style.background = "transparent";})},
{origCount:686, fun:(function anonymous() {allElements[9].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:687, fun:(function anonymous() {allElements[3].style.background = "#fcd";})},
{origCount:688, fun:(function anonymous() {allElements[4].style['float'] = "left";})},
{origCount:689, fun:(function anonymous() {allElements[5].style['float'] = "none";})},
{origCount:690, fun:(function anonymous() {allElements[10].style.display = "table-cell";})},
{origCount:691, fun:(function anonymous() {allElements[12].style.height = "200%";})},
{origCount:692, fun:(function anonymous() {allElements[3].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:693, fun:(function anonymous() {allElements[3].style.height = "200%";})},
{origCount:694, fun:(function anonymous() {allElements[2].style.height = "2em";})},
{origCount:695, fun:(function anonymous() {allElements[8].style.clear = "both";})},
{origCount:696, fun:(function anonymous() {allElements[11].style.clear = "none";})},
{origCount:697, fun:(function anonymous() {allElements[6].style.clear = "right";})},
{origCount:698, fun:(function anonymous() {allElements[9].style.color = "red";})},
{origCount:699, fun:(function anonymous() {allElements[1].style['float'] = "left";})},
{origCount:700, fun:(function anonymous() {allElements[12].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:701, fun:(function anonymous() {allElements[10].style.display = "-moz-deck";})},
{origCount:702, fun:(function anonymous() {allElements[12].style.height = "auto";})},
{origCount:703, fun:(function anonymous() {allElements[12].style.clear = "none";})},
{origCount:704, fun:(function anonymous() {allElements[1].style.visibility = "hidden";})},
{origCount:705, fun:(function anonymous() {allElements[11].style['float'] = "right";})},
{origCount:706, fun:(function anonymous() {allElements[8].style.overflow = "hidden";})},
{origCount:707, fun:(function anonymous() {allElements[11].style.display = "-moz-grid-group";})},
{origCount:708, fun:(function anonymous() {allElements[12].style.color = "black";})},
{origCount:709, fun:(function anonymous() {allElements[4].style.clear = "right";})},
{origCount:710, fun:(function anonymous() {allElements[4].style['float'] = "right";})},
{origCount:711, fun:(function anonymous() {allElements[7].style.height = "auto";})},
{origCount:712, fun:(function anonymous() {allElements[2].style.clear = "left";})},
{origCount:713, fun:(function anonymous() {allElements[11].style.clear = "right";})},
{origCount:714, fun:(function anonymous() {allElements[11].style.display = "table-header-group";})},
{origCount:715, fun:(function anonymous() {allElements[8].style.height = "2em";})},
{origCount:716, fun:(function anonymous() {allElements[7].style.color = "green";})},
{origCount:717, fun:(function anonymous() {allElements[1].style.width = "auto";})},
{origCount:718, fun:(function anonymous() {allElements[9].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:719, fun:(function anonymous() {allElements[10].style.height = "2em";})},
{origCount:720, fun:(function anonymous() {allElements[8].style.width = "auto";})},
{origCount:721, fun:(function anonymous() {allElements[10].style.background = "#fcd";})},
{origCount:722, fun:(function anonymous() {allElements[9].style.display = "table-row-group";})},
{origCount:723, fun:(function anonymous() {allElements[8].style.overflow = "scroll";})},
{origCount:724, fun:(function anonymous() {allElements[2].style.display = "table-caption";})},
{origCount:725, fun:(function anonymous() {allElements[7].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:726, fun:(function anonymous() {allElements[5].style.visibility = "collapse";})},
{origCount:727, fun:(function anonymous() {allElements[12].style.position = "absolute";})},
{origCount:728, fun:(function anonymous() {allElements[9].style.color = "red";})},
{origCount:729, fun:(function anonymous() {allElements[1].style.display = "table-row";})},
{origCount:730, fun:(function anonymous() {allElements[6].style.color = "black";})},
{origCount:731, fun:(function anonymous() {allElements[4].style.visibility = "visible";})},
{origCount:732, fun:(function anonymous() {allElements[0].style.color = "black";})},
{origCount:733, fun:(function anonymous() {allElements[0].style.clear = "both";})},
{origCount:734, fun:(function anonymous() {allElements[8].style['float'] = "none";})},
{origCount:735, fun:(function anonymous() {allElements[5].style.width = "20em";})},
{origCount:736, fun:(function anonymous() {allElements[9].style['float'] = "left";})},
{origCount:737, fun:(function anonymous() {allElements[12].style.height = "10%";})},
{origCount:738, fun:(function anonymous() {allElements[7].style.height = "10%";})},
{origCount:739, fun:(function anonymous() {allElements[12].style.color = "black";})},
{origCount:740, fun:(function anonymous() {allElements[7].style.visibility = "hidden";})},
{origCount:741, fun:(function anonymous() {allElements[9].style.visibility = "collapse";})},
{origCount:742, fun:(function anonymous() {allElements[11].style.display = "-moz-inline-box";})},
{origCount:743, fun:(function anonymous() {allElements[7].style.position = "static";})},
{origCount:744, fun:(function anonymous() {allElements[0].style.display = "-moz-box";})},
{origCount:745, fun:(function anonymous() {allElements[11].style.clear = "both";})},
{origCount:746, fun:(function anonymous() {allElements[4].style.position = "fixed";})},
{origCount:747, fun:(function anonymous() {allElements[11].style.background = "#fcd";})},
{origCount:748, fun:(function anonymous() {allElements[0].style.position = "fixed";})},
{origCount:749, fun:(function anonymous() {allElements[0].style.width = "1px";})},
{origCount:750, fun:(function anonymous() {allElements[6].style.visibility = "hidden";})},
{origCount:751, fun:(function anonymous() {allElements[8].style.position = "absolute";})},
{origCount:752, fun:(function anonymous() {allElements[0].style.color = "green";})},
{origCount:753, fun:(function anonymous() {allElements[0].style.clear = "both";})},
{origCount:754, fun:(function anonymous() {allElements[0].style.overflow = "auto";})},
{origCount:755, fun:(function anonymous() {allElements[6].style.clear = "left";})},
{origCount:756, fun:(function anonymous() {allElements[10].style.position = "static";})},
{origCount:757, fun:(function anonymous() {allElements[4].style.background = "#fcd";})},
{origCount:758, fun:(function anonymous() {allElements[8].style.color = "black";})},
{origCount:759, fun:(function anonymous() {allElements[0].style.position = "relative";})},
{origCount:760, fun:(function anonymous() {allElements[12].style.overflow = "auto";})},
{origCount:761, fun:(function anonymous() {allElements[10].style.visibility = "hidden";})},
{origCount:762, fun:(function anonymous() {allElements[0].style.visibility = "collapse";})},
{origCount:763, fun:(function anonymous() {allElements[12].style.height = "100px";})},
{origCount:764, fun:(function anonymous() {allElements[2].style.overflow = "visible";})},
{origCount:765, fun:(function anonymous() {allElements[12].style.overflow = "auto";})},
{origCount:766, fun:(function anonymous() {allElements[10].style.position = "fixed";})},
{origCount:767, fun:(function anonymous() {allElements[0].style.overflow = "hidden";})},
{origCount:768, fun:(function anonymous() {allElements[1].style.display = "table-cell";})},
{origCount:769, fun:(function anonymous() {allElements[7].style.clear = "both";})},
{origCount:770, fun:(function anonymous() {allElements[8].style.position = "relative";})},
{origCount:771, fun:(function anonymous() {allElements[10].style.color = "red";})},
{origCount:772, fun:(function anonymous() {allElements[6].style.display = "-moz-inline-box";})},
{origCount:773, fun:(function anonymous() {allElements[2].style.overflow = "hidden";})},
{origCount:774, fun:(function anonymous() {allElements[2].style['float'] = "none";})},
{origCount:775, fun:(function anonymous() {allElements[0].style.clear = "left";})},
{origCount:776, fun:(function anonymous() {allElements[12].style.display = "table-cell";})},
{origCount:777, fun:(function anonymous() {allElements[7].style.background = "transparent";})},
{origCount:778, fun:(function anonymous() {allElements[2].style['float'] = "right";})},
{origCount:779, fun:(function anonymous() {allElements[3].style.overflow = "scroll";})},
{origCount:780, fun:(function anonymous() {allElements[2].style.width = "1px";})},
{origCount:781, fun:(function anonymous() {allElements[4].style.clear = "both";})},
{origCount:782, fun:(function anonymous() {allElements[3].style.height = "auto";})},
{origCount:783, fun:(function anonymous() {allElements[3].style.color = "green";})},
{origCount:784, fun:(function anonymous() {allElements[10].style.color = "red";})},
{origCount:785, fun:(function anonymous() {allElements[3].style.position = "static";})},
{origCount:786, fun:(function anonymous() {allElements[1].style.position = "absolute";})},
{origCount:787, fun:(function anonymous() {allElements[8].style.height = "100px";})},
{origCount:788, fun:(function anonymous() {allElements[6].style.overflow = "scroll";})},
{origCount:789, fun:(function anonymous() {allElements[11].style.position = "relative";})},
{origCount:790, fun:(function anonymous() {allElements[3].style.display = "-moz-grid-line";})},
{origCount:791, fun:(function anonymous() {allElements[2].style.visibility = "collapse";})},
{origCount:792, fun:(function anonymous() {allElements[11].style['float'] = "none";})},
{origCount:793, fun:(function anonymous() {allElements[11].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:794, fun:(function anonymous() {allElements[7].style['float'] = "right";})},
{origCount:795, fun:(function anonymous() {allElements[5].style.display = "table-column";})},
{origCount:796, fun:(function anonymous() {allElements[9].style.background = "transparent";})},
{origCount:797, fun:(function anonymous() {allElements[12].style['float'] = "right";})},
{origCount:798, fun:(function anonymous() {allElements[8].style.position = "static";})},
{origCount:799, fun:(function anonymous() {allElements[0].style.position = "fixed";})},
{origCount:800, fun:(function anonymous() {allElements[8].style.overflow = "visible";})},
{origCount:801, fun:(function anonymous() {allElements[10].style.height = "100px";})},
{origCount:802, fun:(function anonymous() {allElements[0].style.clear = "right";})},
{origCount:803, fun:(function anonymous() {allElements[9].style.color = "black";})},
{origCount:804, fun:(function anonymous() {allElements[3].style.width = "1px";})},
{origCount:805, fun:(function anonymous() {allElements[0].style.clear = "none";})},
{origCount:806, fun:(function anonymous() {allElements[7].style.width = "200%";})},
{origCount:807, fun:(function anonymous() {allElements[2].style.overflow = "visible";})},
{origCount:808, fun:(function anonymous() {allElements[4].style.overflow = "visible";})},
{origCount:809, fun:(function anonymous() {allElements[5].style.display = "table-row";})},
{origCount:810, fun:(function anonymous() {allElements[10].style.clear = "none";})},
{origCount:811, fun:(function anonymous() {allElements[0].style.color = "red";})},
{origCount:812, fun:(function anonymous() {allElements[5].style.clear = "right";})},
{origCount:813, fun:(function anonymous() {allElements[5].style['float'] = "none";})},
{origCount:814, fun:(function anonymous() {allElements[6].style.background = "#fcd";})},
{origCount:815, fun:(function anonymous() {allElements[12].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:816, fun:(function anonymous() {allElements[3].style.visibility = "visible";})},
{origCount:817, fun:(function anonymous() {allElements[11].style.clear = "none";})},
{origCount:818, fun:(function anonymous() {allElements[2].style.visibility = "visible";})},
{origCount:819, fun:(function anonymous() {allElements[8].style.position = "relative";})},
{origCount:820, fun:(function anonymous() {allElements[7].style.height = "auto";})},
{origCount:821, fun:(function anonymous() {allElements[5].style.clear = "both";})},
{origCount:822, fun:(function anonymous() {allElements[9].style.overflow = "auto";})},
{origCount:823, fun:(function anonymous() {allElements[9].style.position = "static";})},
{origCount:824, fun:(function anonymous() {allElements[11].style.position = "absolute";})},
{origCount:825, fun:(function anonymous() {allElements[9].style.width = "200%";})},
{origCount:826, fun:(function anonymous() {allElements[7].style['float'] = "none";})},
{origCount:827, fun:(function anonymous() {allElements[11].style.position = "static";})},
{origCount:828, fun:(function anonymous() {allElements[0].style.overflow = "hidden";})},
{origCount:829, fun:(function anonymous() {allElements[5].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:830, fun:(function anonymous() {allElements[6].style.position = "fixed";})},
{origCount:831, fun:(function anonymous() {allElements[9].style['float'] = "right";})},
{origCount:832, fun:(function anonymous() {allElements[6].style['float'] = "none";})},
{origCount:833, fun:(function anonymous() {allElements[2].style.background = "transparent";})},
{origCount:834, fun:(function anonymous() {allElements[3].style.overflow = "scroll";})},
{origCount:835, fun:(function anonymous() {allElements[0].style.height = "auto";})},
{origCount:836, fun:(function anonymous() {allElements[0].style.position = "static";})},
{origCount:837, fun:(function anonymous() {allElements[8].style.display = "-moz-grid-line";})},
{origCount:838, fun:(function anonymous() {allElements[4].style.height = "10%";})},
{origCount:839, fun:(function anonymous() {allElements[5].style.width = "1px";})},
{origCount:840, fun:(function anonymous() {allElements[4].style.position = "fixed";})},
{origCount:841, fun:(function anonymous() {allElements[7].style.clear = "none";})},
{origCount:842, fun:(function anonymous() {allElements[6].style.display = "table-column";})},
{origCount:843, fun:(function anonymous() {allElements[7].style.visibility = "visible";})},
{origCount:844, fun:(function anonymous() {allElements[1].style.background = "#fcd";})},
{origCount:845, fun:(function anonymous() {allElements[7].style.height = "2em";})},
{origCount:846, fun:(function anonymous() {allElements[5].style.display = "table-column";})},
{origCount:847, fun:(function anonymous() {allElements[0].style.clear = "both";})},
{origCount:848, fun:(function anonymous() {allElements[11].style['float'] = "right";})},
{origCount:849, fun:(function anonymous() {allElements[4].style.visibility = "visible";})},
{origCount:850, fun:(function anonymous() {allElements[9].style.overflow = "scroll";})},
{origCount:851, fun:(function anonymous() {allElements[8].style.height = "200%";})},
{origCount:852, fun:(function anonymous() {allElements[5].style.height = "200%";})},
{origCount:853, fun:(function anonymous() {allElements[5].style.clear = "none";})},
{origCount:854, fun:(function anonymous() {allElements[2].style.background = "#fcd";})},
{origCount:855, fun:(function anonymous() {allElements[12].style.visibility = "hidden";})},
{origCount:856, fun:(function anonymous() {allElements[4].style.clear = "both";})},
{origCount:857, fun:(function anonymous() {allElements[8].style.width = "10%";})},
{origCount:858, fun:(function anonymous() {allElements[4].style.color = "red";})},
{origCount:859, fun:(function anonymous() {allElements[9].style.height = "10%";})},
{origCount:860, fun:(function anonymous() {allElements[4].style.visibility = "hidden";})},
{origCount:861, fun:(function anonymous() {allElements[7].style.clear = "left";})},
{origCount:862, fun:(function anonymous() {allElements[11].style.background = "#fcd";})},
{origCount:863, fun:(function anonymous() {allElements[7].style.color = "green";})},
{origCount:864, fun:(function anonymous() {allElements[1].style.clear = "left";})},
{origCount:865, fun:(function anonymous() {allElements[12].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:866, fun:(function anonymous() {allElements[6].style.width = "auto";})},
{origCount:867, fun:(function anonymous() {allElements[1].style.height = "100px";})},
{origCount:868, fun:(function anonymous() {allElements[3].style.display = "-moz-inline-block";})},
{origCount:869, fun:(function anonymous() {allElements[5].style.visibility = "visible";})},
{origCount:870, fun:(function anonymous() {allElements[11].style.color = "blue";})},
{origCount:871, fun:(function anonymous() {allElements[1].style.position = "static";})},
{origCount:872, fun:(function anonymous() {allElements[6].style.visibility = "visible";})},
{origCount:873, fun:(function anonymous() {allElements[7].style.color = "red";})},
{origCount:874, fun:(function anonymous() {allElements[8].style.color = "blue";})},
{origCount:875, fun:(function anonymous() {allElements[1].style['float'] = "right";})},
{origCount:876, fun:(function anonymous() {allElements[6].style['float'] = "right";})},
{origCount:877, fun:(function anonymous() {allElements[1].style.clear = "left";})},
{origCount:878, fun:(function anonymous() {allElements[6].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:879, fun:(function anonymous() {allElements[11].style.display = "inline";})},
{origCount:880, fun:(function anonymous() {allElements[11].style['float'] = "none";})},
{origCount:881, fun:(function anonymous() {allElements[10].style.color = "black";})},
{origCount:882, fun:(function anonymous() {allElements[0].style.visibility = "hidden";})},
{origCount:883, fun:(function anonymous() {allElements[1].style.color = "green";})},
{origCount:884, fun:(function anonymous() {allElements[4].style.height = "10%";})},
{origCount:885, fun:(function anonymous() {allElements[2].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:886, fun:(function anonymous() {allElements[0].style.display = "list-item";})},
{origCount:887, fun:(function anonymous() {allElements[4].style['float'] = "left";})},
{origCount:888, fun:(function anonymous() {allElements[6].style.overflow = "hidden";})},
{origCount:889, fun:(function anonymous() {allElements[12].style.clear = "left";})},
{origCount:890, fun:(function anonymous() {allElements[1].style.clear = "none";})},
{origCount:891, fun:(function anonymous() {allElements[4].style.clear = "left";})},
{origCount:892, fun:(function anonymous() {allElements[1].style.position = "relative";})},
{origCount:893, fun:(function anonymous() {allElements[11].style.position = "absolute";})},
{origCount:894, fun:(function anonymous() {allElements[12].style.background = "#fcd";})},
{origCount:895, fun:(function anonymous() {allElements[10].style.position = "relative";})},
{origCount:896, fun:(function anonymous() {allElements[10].style.display = "-moz-box";})},
{origCount:897, fun:(function anonymous() {allElements[6].style.position = "fixed";})},
{origCount:898, fun:(function anonymous() {allElements[1].style.overflow = "scroll";})},
{origCount:899, fun:(function anonymous() {allElements[3].style.width = "10%";})},
{origCount:900, fun:(function anonymous() {allElements[3].style.background = "transparent";})},
{origCount:901, fun:(function anonymous() {allElements[6].style.background = "transparent";})},
{origCount:902, fun:(function anonymous() {allElements[5].style.visibility = "visible";})},
{origCount:903, fun:(function anonymous() {allElements[6].style.background = "#fcd";})},
{origCount:904, fun:(function anonymous() {allElements[0].style.overflow = "scroll";})},
{origCount:905, fun:(function anonymous() {allElements[7].style['float'] = "none";})},
{origCount:906, fun:(function anonymous() {allElements[6].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:907, fun:(function anonymous() {allElements[1].style.height = "200%";})},
{origCount:908, fun:(function anonymous() {allElements[12].style.display = "table-row";})},
{origCount:909, fun:(function anonymous() {allElements[5].style.height = "10%";})},
{origCount:910, fun:(function anonymous() {allElements[11].style.position = "relative";})},
{origCount:911, fun:(function anonymous() {allElements[10].style.display = "-moz-stack";})},
{origCount:912, fun:(function anonymous() {allElements[7].style.color = "green";})},
{origCount:913, fun:(function anonymous() {allElements[8].style.clear = "left";})},
{origCount:914, fun:(function anonymous() {allElements[5].style.clear = "right";})},
{origCount:915, fun:(function anonymous() {allElements[3].style['float'] = "left";})},
{origCount:916, fun:(function anonymous() {allElements[8].style.display = "table-header-group";})},
{origCount:917, fun:(function anonymous() {allElements[12].style.display = "-moz-grid-group";})},
{origCount:918, fun:(function anonymous() {allElements[8].style.position = "fixed";})},
{origCount:919, fun:(function anonymous() {allElements[1].style.clear = "none";})},
{origCount:920, fun:(function anonymous() {allElements[10].style.height = "10%";})},
{origCount:921, fun:(function anonymous() {allElements[0].style['float'] = "left";})},
{origCount:922, fun:(function anonymous() {allElements[4].style['float'] = "left";})},
{origCount:923, fun:(function anonymous() {allElements[0].style.display = "-moz-inline-box";})},
{origCount:924, fun:(function anonymous() {allElements[8].style.clear = "left";})},
{origCount:925, fun:(function anonymous() {allElements[6].style.clear = "right";})},
{origCount:926, fun:(function anonymous() {allElements[0].style.overflow = "hidden";})},
{origCount:927, fun:(function anonymous() {allElements[9].style.height = "100px";})},
{origCount:928, fun:(function anonymous() {allElements[11].style.color = "blue";})},
{origCount:929, fun:(function anonymous() {allElements[0].style.clear = "left";})},
{origCount:930, fun:(function anonymous() {allElements[6].style.background = "#fcd";})},
{origCount:931, fun:(function anonymous() {allElements[10].style['float'] = "none";})},
{origCount:932, fun:(function anonymous() {allElements[3].style.display = "-moz-inline-box";})},
{origCount:933, fun:(function anonymous() {allElements[4].style.width = "1px";})},
{origCount:934, fun:(function anonymous() {allElements[5].style.display = "table-row";})},
{origCount:935, fun:(function anonymous() {allElements[12].style.height = "2em";})},
{origCount:936, fun:(function anonymous() {allElements[4].style.visibility = "collapse";})},
{origCount:937, fun:(function anonymous() {allElements[0].style.background = "transparent";})},
{origCount:938, fun:(function anonymous() {allElements[4].style.background = "#fcd";})},
{origCount:939, fun:(function anonymous() {allElements[11].style.overflow = "scroll";})},
{origCount:940, fun:(function anonymous() {allElements[10].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:941, fun:(function anonymous() {allElements[10].style.background = "#fcd";})},
{origCount:942, fun:(function anonymous() {allElements[0].style.width = "20em";})},
{origCount:943, fun:(function anonymous() {allElements[1].style.overflow = "scroll";})},
{origCount:944, fun:(function anonymous() {allElements[5].style.clear = "left";})},
{origCount:945, fun:(function anonymous() {allElements[3].style.display = "table";})},
{origCount:946, fun:(function anonymous() {allElements[2].style.display = "table-footer-group";})},
{origCount:947, fun:(function anonymous() {allElements[6].style.visibility = "visible";})},
{origCount:948, fun:(function anonymous() {allElements[9].style.display = "-moz-inline-block";})},
{origCount:949, fun:(function anonymous() {allElements[2].style.clear = "right";})},
{origCount:950, fun:(function anonymous() {allElements[4].style.overflow = "visible";})},
{origCount:951, fun:(function anonymous() {allElements[8].style.width = "200%";})},
{origCount:952, fun:(function anonymous() {allElements[5].style.overflow = "hidden";})},
{origCount:953, fun:(function anonymous() {allElements[2].style.height = "auto";})},
{origCount:954, fun:(function anonymous() {allElements[3].style.overflow = "visible";})},
{origCount:955, fun:(function anonymous() {allElements[2].style.color = "blue";})},
{origCount:956, fun:(function anonymous() {allElements[2].style.width = "10%";})},
{origCount:957, fun:(function anonymous() {allElements[11].style.visibility = "collapse";})},
{origCount:958, fun:(function anonymous() {allElements[7].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:959, fun:(function anonymous() {allElements[9].style.position = "fixed";})},
{origCount:960, fun:(function anonymous() {allElements[9].style.background = "transparent";})},
{origCount:961, fun:(function anonymous() {allElements[0].style.clear = "right";})},
{origCount:962, fun:(function anonymous() {allElements[0].style['float'] = "left";})},
{origCount:963, fun:(function anonymous() {allElements[1].style.width = "1px";})},
{origCount:964, fun:(function anonymous() {allElements[9].style.height = "2em";})},
{origCount:965, fun:(function anonymous() {allElements[3].style.width = "20em";})},
{origCount:966, fun:(function anonymous() {allElements[1].style.width = "200%";})},
{origCount:967, fun:(function anonymous() {allElements[10].style.overflow = "hidden";})},
{origCount:968, fun:(function anonymous() {allElements[9].style.clear = "both";})},
{origCount:969, fun:(function anonymous() {allElements[2].style.clear = "both";})},
{origCount:970, fun:(function anonymous() {allElements[9].style['float'] = "left";})},
{origCount:971, fun:(function anonymous() {allElements[8].style.clear = "left";})},
{origCount:972, fun:(function anonymous() {allElements[6].style.height = "auto";})},
{origCount:973, fun:(function anonymous() {allElements[7].style.background = "#fcd";})},
{origCount:974, fun:(function anonymous() {allElements[4].style.clear = "none";})},
{origCount:975, fun:(function anonymous() {allElements[2].style.position = "relative";})},
{origCount:976, fun:(function anonymous() {allElements[8].style['float'] = "left";})},
{origCount:977, fun:(function anonymous() {allElements[12].style.visibility = "hidden";})},
{origCount:978, fun:(function anonymous() {allElements[8].style.height = "100px";})},
{origCount:979, fun:(function anonymous() {allElements[2].style['float'] = "left";})},
{origCount:980, fun:(function anonymous() {allElements[11].style.clear = "left";})},
{origCount:981, fun:(function anonymous() {allElements[1].style.color = "blue";})},
{origCount:982, fun:(function anonymous() {allElements[6].style.height = "100px";})},
{origCount:983, fun:(function anonymous() {allElements[2].style.overflow = "scroll";})},
{origCount:984, fun:(function anonymous() {allElements[10].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:985, fun:(function anonymous() {allElements[9].style.clear = "both";})},
{origCount:986, fun:(function anonymous() {allElements[4].style.height = "10%";})},
{origCount:987, fun:(function anonymous() {allElements[0].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:988, fun:(function anonymous() {allElements[2].style.background = "transparent";})},
{origCount:989, fun:(function anonymous() {allElements[4].style.color = "green";})},
{origCount:990, fun:(function anonymous() {allElements[11].style.color = "green";})},
{origCount:991, fun:(function anonymous() {allElements[2].style.clear = "left";})},
{origCount:992, fun:(function anonymous() {allElements[8].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:993, fun:(function anonymous() {allElements[10].style.background = "transparent";})},
{origCount:994, fun:(function anonymous() {allElements[11].style.overflow = "auto";})},
{origCount:995, fun:(function anonymous() {allElements[5].style.overflow = "visible";})},
{origCount:996, fun:(function anonymous() {allElements[11].style.visibility = "collapse";})},
{origCount:997, fun:(function anonymous() {allElements[7].style.clear = "both";})},
{origCount:998, fun:(function anonymous() {allElements[12].style.position = "fixed";})},
{origCount:999, fun:(function anonymous() {allElements[5].style.color = "green";})},
{origCount:1000, fun:(function anonymous() {allElements[6].style.display = "-moz-box";})},
{origCount:1001, fun:(function anonymous() {allElements[5].style.overflow = "auto";})},
{origCount:1002, fun:(function anonymous() {allElements[9].style.height = "2em";})},
{origCount:1003, fun:(function anonymous() {allElements[11].style['float'] = "left";})},
{origCount:1004, fun:(function anonymous() {allElements[2].style['float'] = "none";})},
{origCount:1005, fun:(function anonymous() {allElements[0].style.overflow = "scroll";})},
{origCount:1006, fun:(function anonymous() {allElements[12].style.background = "transparent";})},
{origCount:1007, fun:(function anonymous() {allElements[4].style.visibility = "hidden";})},
{origCount:1008, fun:(function anonymous() {allElements[7].style.overflow = "scroll";})},
{origCount:1009, fun:(function anonymous() {allElements[1].style.width = "auto";})},
{origCount:1010, fun:(function anonymous() {allElements[3].style.overflow = "hidden";})},
{origCount:1011, fun:(function anonymous() {allElements[7].style.display = "table-header-group";})},
{origCount:1012, fun:(function anonymous() {allElements[5].style.display = "-moz-box";})},
{origCount:1013, fun:(function anonymous() {allElements[2].style['float'] = "left";})},
{origCount:1014, fun:(function anonymous() {allElements[3].style.height = "auto";})},
{origCount:1015, fun:(function anonymous() {allElements[2].style.overflow = "auto";})},
{origCount:1016, fun:(function anonymous() {allElements[3].style['float'] = "right";})},
{origCount:1017, fun:(function anonymous() {allElements[0].style.height = "2em";})},
{origCount:1018, fun:(function anonymous() {allElements[9].style.background = "transparent";})},
{origCount:1019, fun:(function anonymous() {allElements[11].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:1020, fun:(function anonymous() {allElements[12].style.visibility = "hidden";})},
{origCount:1021, fun:(function anonymous() {allElements[3].style.clear = "both";})},
{origCount:1022, fun:(function anonymous() {allElements[3].style.visibility = "visible";})},
{origCount:1023, fun:(function anonymous() {allElements[4].style.overflow = "auto";})},
{origCount:1024, fun:(function anonymous() {allElements[12].style['float'] = "right";})},
{origCount:1025, fun:(function anonymous() {allElements[7].style.display = "table";})},
{origCount:1026, fun:(function anonymous() {allElements[6].style.color = "blue";})},
{origCount:1027, fun:(function anonymous() {allElements[2].style.color = "black";})},
{origCount:1028, fun:(function anonymous() {allElements[1].style.color = "black";})},
{origCount:1029, fun:(function anonymous() {allElements[8].style['float'] = "right";})},
{origCount:1030, fun:(function anonymous() {allElements[2].style.display = "-moz-grid-group";})},
{origCount:1031, fun:(function anonymous() {allElements[1].style.background = "#fcd";})},
{origCount:1032, fun:(function anonymous() {allElements[12].style.height = "auto";})},
{origCount:1033, fun:(function anonymous() {allElements[1].style.clear = "both";})},
{origCount:1034, fun:(function anonymous() {allElements[11].style.width = "auto";})},
{origCount:1035, fun:(function anonymous() {allElements[10].style.position = "relative";})},
{origCount:1036, fun:(function anonymous() {allElements[3].style.position = "fixed";})},
{origCount:1037, fun:(function anonymous() {allElements[8].style.clear = "both";})},
{origCount:1038, fun:(function anonymous() {allElements[4].style['float'] = "left";})},
{origCount:1039, fun:(function anonymous() {allElements[11].style.overflow = "auto";})},
{origCount:1040, fun:(function anonymous() {allElements[7].style.height = "200%";})},
{origCount:1041, fun:(function anonymous() {allElements[11].style.width = "200%";})},
{origCount:1042, fun:(function anonymous() {allElements[3].style.overflow = "visible";})},
{origCount:1043, fun:(function anonymous() {allElements[0].style.position = "fixed";})},
{origCount:1044, fun:(function anonymous() {allElements[8].style.clear = "none";})},
{origCount:1045, fun:(function anonymous() {allElements[7].style.width = "10%";})},
{origCount:1046, fun:(function anonymous() {allElements[2].style.height = "100px";})},
{origCount:1047, fun:(function anonymous() {allElements[12].style.clear = "left";})},
{origCount:1048, fun:(function anonymous() {allElements[2].style.overflow = "visible";})},
{origCount:1049, fun:(function anonymous() {allElements[4].style.background = "transparent";})},
{origCount:1050, fun:(function anonymous() {allElements[11].style['float'] = "none";})},
{origCount:1051, fun:(function anonymous() {allElements[3].style['float'] = "right";})},
{origCount:1052, fun:(function anonymous() {allElements[9].style.height = "auto";})},
{origCount:1053, fun:(function anonymous() {allElements[11].style.display = "-moz-grid";})},
{origCount:1054, fun:(function anonymous() {allElements[0].style.position = "fixed";})},
{origCount:1055, fun:(function anonymous() {allElements[7].style.width = "20em";})},
{origCount:1056, fun:(function anonymous() {allElements[0].style.height = "100px";})},
{origCount:1057, fun:(function anonymous() {allElements[10].style.clear = "none";})},
{origCount:1058, fun:(function anonymous() {allElements[2].style.width = "10%";})},
{origCount:1059, fun:(function anonymous() {allElements[9].style.visibility = "collapse";})},
{origCount:1060, fun:(function anonymous() {allElements[10].style.display = "-moz-inline-box";})},
{origCount:1061, fun:(function anonymous() {allElements[10].style.height = "200%";})},
{origCount:1062, fun:(function anonymous() {allElements[1].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:1063, fun:(function anonymous() {allElements[3].style.clear = "right";})},
{origCount:1064, fun:(function anonymous() {allElements[7].style.overflow = "auto";})},
{origCount:1065, fun:(function anonymous() {allElements[6].style.visibility = "visible";})},
{origCount:1066, fun:(function anonymous() {allElements[5].style['float'] = "right";})},
{origCount:1067, fun:(function anonymous() {allElements[11].style.height = "200%";})},
{origCount:1068, fun:(function anonymous() {allElements[1].style.position = "static";})},
{origCount:1069, fun:(function anonymous() {allElements[8].style.clear = "none";})},
{origCount:1070, fun:(function anonymous() {allElements[11].style.display = "-moz-groupbox";})},
{origCount:1071, fun:(function anonymous() {allElements[2].style.visibility = "visible";})},
{origCount:1072, fun:(function anonymous() {allElements[0].style.background = "transparent";})},
{origCount:1073, fun:(function anonymous() {allElements[10].style.width = "auto";})},
{origCount:1074, fun:(function anonymous() {allElements[12].style.clear = "right";})},
{origCount:1075, fun:(function anonymous() {allElements[12].style['float'] = "right";})},
{origCount:1076, fun:(function anonymous() {allElements[0].style.width = "200%";})},
{origCount:1077, fun:(function anonymous() {allElements[10].style.clear = "left";})},
{origCount:1078, fun:(function anonymous() {allElements[7].style.display = "-moz-deck";})},
{origCount:1079, fun:(function anonymous() {allElements[9].style.color = "green";})},
{origCount:1080, fun:(function anonymous() {allElements[10].style.color = "black";})},
{origCount:1081, fun:(function anonymous() {allElements[1].style.width = "200%";})},
{origCount:1082, fun:(function anonymous() {allElements[2].style.position = "fixed";})},
{origCount:1083, fun:(function anonymous() {allElements[3].style.height = "100px";})},
{origCount:1084, fun:(function anonymous() {allElements[12].style.background = "#fcd";})},
{origCount:1085, fun:(function anonymous() {allElements[7].style.visibility = "collapse";})},
{origCount:1086, fun:(function anonymous() {allElements[6].style.clear = "both";})},
{origCount:1087, fun:(function anonymous() {allElements[3].style.overflow = "visible";})},
{origCount:1088, fun:(function anonymous() {allElements[2].style.width = "10%";})},
{origCount:1089, fun:(function anonymous() {allElements[9].style.color = "red";})},
{origCount:1090, fun:(function anonymous() {allElements[3].style.display = "-moz-inline-box";})},
{origCount:1091, fun:(function anonymous() {allElements[4].style['float'] = "right";})},
{origCount:1092, fun:(function anonymous() {allElements[2].style.overflow = "visible";})},
{origCount:1093, fun:(function anonymous() {allElements[4].style.clear = "none";})},
{origCount:1094, fun:(function anonymous() {allElements[1].style.display = "table-row";})},
{origCount:1095, fun:(function anonymous() {allElements[1].style.display = "-moz-deck";})},
{origCount:1096, fun:(function anonymous() {allElements[7].style.overflow = "visible";})},
{origCount:1097, fun:(function anonymous() {allElements[12].style.color = "black";})},
{origCount:1098, fun:(function anonymous() {allElements[9].style.width = "20em";})},
{origCount:1099, fun:(function anonymous() {allElements[3].style.color = "green";})},
{origCount:1100, fun:(function anonymous() {allElements[0].style.overflow = "auto";})},
{origCount:1101, fun:(function anonymous() {allElements[4].style.background = "#fcd";})},
{origCount:1102, fun:(function anonymous() {allElements[9].style.background = "#fcd";})},
{origCount:1103, fun:(function anonymous() {allElements[7].style.clear = "none";})},
{origCount:1104, fun:(function anonymous() {allElements[2].style['float'] = "none";})},
{origCount:1105, fun:(function anonymous() {allElements[2].style.clear = "none";})},
{origCount:1106, fun:(function anonymous() {allElements[10].style.color = "blue";})},
{origCount:1107, fun:(function anonymous() {allElements[7].style.clear = "none";})},
{origCount:1108, fun:(function anonymous() {allElements[10].style.height = "10%";})},
{origCount:1109, fun:(function anonymous() {allElements[0].style.overflow = "scroll";})},
{origCount:1110, fun:(function anonymous() {allElements[7].style.display = "-moz-grid-group";})},
{origCount:1111, fun:(function anonymous() {allElements[12].style.overflow = "visible";})},
{origCount:1112, fun:(function anonymous() {allElements[6].style.width = "20em";})},
{origCount:1113, fun:(function anonymous() {allElements[8].style.overflow = "auto";})},
{origCount:1114, fun:(function anonymous() {allElements[10].style['float'] = "none";})},
{origCount:1115, fun:(function anonymous() {allElements[5].style.width = "auto";})},
{origCount:1116, fun:(function anonymous() {allElements[11].style.display = "table-caption";})},
{origCount:1117, fun:(function anonymous() {allElements[8].style.width = "200%";})},
{origCount:1118, fun:(function anonymous() {allElements[1].style.width = "1px";})},
{origCount:1119, fun:(function anonymous() {allElements[8].style.background = "transparent";})},
{origCount:1120, fun:(function anonymous() {allElements[9].style['float'] = "none";})},
{origCount:1121, fun:(function anonymous() {allElements[9].style['float'] = "none";})},
{origCount:1122, fun:(function anonymous() {allElements[1].style.display = "list-item";})},
{origCount:1123, fun:(function anonymous() {allElements[3].style['float'] = "none";})},
{origCount:1124, fun:(function anonymous() {allElements[8].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:1125, fun:(function anonymous() {allElements[7].style.height = "auto";})},
{origCount:1126, fun:(function anonymous() {allElements[7].style.height = "10%";})},
{origCount:1127, fun:(function anonymous() {allElements[0].style.display = "-moz-inline-box";})},
{origCount:1128, fun:(function anonymous() {allElements[3].style.clear = "right";})},
{origCount:1129, fun:(function anonymous() {allElements[11].style.clear = "left";})},
{origCount:1130, fun:(function anonymous() {allElements[1].style.color = "black";})},
{origCount:1131, fun:(function anonymous() {allElements[5].style['float'] = "none";})},
{origCount:1132, fun:(function anonymous() {allElements[4].style.width = "10%";})},
{origCount:1133, fun:(function anonymous() {allElements[2].style.display = "-moz-grid";})},
{origCount:1134, fun:(function anonymous() {allElements[4].style.height = "100px";})},
{origCount:1135, fun:(function anonymous() {allElements[4].style.clear = "both";})},
{origCount:1136, fun:(function anonymous() {allElements[6].style.position = "static";})},
{origCount:1137, fun:(function anonymous() {allElements[2].style['float'] = "left";})},
{origCount:1138, fun:(function anonymous() {allElements[0].style.overflow = "scroll";})},
{origCount:1139, fun:(function anonymous() {allElements[3].style.display = "table-cell";})},
{origCount:1140, fun:(function anonymous() {allElements[4].style.color = "blue";})},
{origCount:1141, fun:(function anonymous() {allElements[9].style.clear = "left";})},
{origCount:1142, fun:(function anonymous() {allElements[9].style.clear = "none";})},
{origCount:1143, fun:(function anonymous() {allElements[11].style['float'] = "left";})},
{origCount:1144, fun:(function anonymous() {allElements[7].style.display = "-moz-inline-block";})},
{origCount:1145, fun:(function anonymous() {allElements[3].style.clear = "none";})},
{origCount:1146, fun:(function anonymous() {allElements[2].style.visibility = "collapse";})},
{origCount:1147, fun:(function anonymous() {allElements[12].style['float'] = "none";})},
{origCount:1148, fun:(function anonymous() {allElements[12].style.background = "transparent";})},
{origCount:1149, fun:(function anonymous() {allElements[6].style.width = "1px";})},
{origCount:1150, fun:(function anonymous() {allElements[1].style.width = "10%";})},
{origCount:1151, fun:(function anonymous() {allElements[1].style['float'] = "none";})},
{origCount:1152, fun:(function anonymous() {allElements[0].style.width = "1px";})},
{origCount:1153, fun:(function anonymous() {allElements[2].style.width = "20em";})},
{origCount:1154, fun:(function anonymous() {allElements[0].style.display = "-moz-popup";})},
{origCount:1155, fun:(function anonymous() {allElements[0].style.color = "red";})},
{origCount:1156, fun:(function anonymous() {allElements[6].style.visibility = "visible";})},
{origCount:1157, fun:(function anonymous() {allElements[12].style.background = "#fcd";})},
{origCount:1158, fun:(function anonymous() {allElements[9].style.visibility = "hidden";})},
{origCount:1159, fun:(function anonymous() {allElements[4].style.overflow = "scroll";})},
{origCount:1160, fun:(function anonymous() {allElements[1].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:1161, fun:(function anonymous() {allElements[6].style.display = "block";})},
{origCount:1162, fun:(function anonymous() {allElements[11].style.background = "#fcd";})},
{origCount:1163, fun:(function anonymous() {allElements[9].style.visibility = "collapse";})},
{origCount:1164, fun:(function anonymous() {allElements[5].style.background = "#fcd";})},
{origCount:1165, fun:(function anonymous() {allElements[4].style.clear = "left";})},
{origCount:1166, fun:(function anonymous() {allElements[0].style['float'] = "right";})},
{origCount:1167, fun:(function anonymous() {allElements[10].style.width = "200%";})},
{origCount:1168, fun:(function anonymous() {allElements[1].style['float'] = "left";})},
{origCount:1169, fun:(function anonymous() {allElements[4].style.height = "auto";})},
{origCount:1170, fun:(function anonymous() {allElements[12].style['float'] = "right";})},
{origCount:1171, fun:(function anonymous() {allElements[4].style.color = "blue";})},
{origCount:1172, fun:(function anonymous() {allElements[11].style.visibility = "visible";})},
{origCount:1173, fun:(function anonymous() {allElements[1].style.position = "absolute";})},
{origCount:1174, fun:(function anonymous() {allElements[3].style.visibility = "visible";})},
{origCount:1175, fun:(function anonymous() {allElements[12].style.position = "fixed";})},
{origCount:1176, fun:(function anonymous() {allElements[5].style.display = "table-column-group";})},
{origCount:1177, fun:(function anonymous() {allElements[2].style.clear = "right";})},
{origCount:1178, fun:(function anonymous() {allElements[9].style.overflow = "hidden";})},
{origCount:1179, fun:(function anonymous() {allElements[3].style.width = "20em";})},
{origCount:1180, fun:(function anonymous() {allElements[4].style.position = "relative";})},
{origCount:1181, fun:(function anonymous() {allElements[5].style.width = "20em";})},
{origCount:1182, fun:(function anonymous() {allElements[10].style.visibility = "visible";})},
{origCount:1183, fun:(function anonymous() {allElements[0].style.overflow = "scroll";})},
{origCount:1184, fun:(function anonymous() {allElements[5].style.color = "red";})},
{origCount:1185, fun:(function anonymous() {allElements[4].style.clear = "right";})},
{origCount:1186, fun:(function anonymous() {allElements[5].style.overflow = "hidden";})},
{origCount:1187, fun:(function anonymous() {allElements[10].style.clear = "none";})},
{origCount:1188, fun:(function anonymous() {allElements[1].style.position = "fixed";})},
{origCount:1189, fun:(function anonymous() {allElements[9].style.width = "1px";})},
{origCount:1190, fun:(function anonymous() {allElements[0].style.color = "blue";})},
{origCount:1191, fun:(function anonymous() {allElements[5].style.position = "static";})},
{origCount:1192, fun:(function anonymous() {allElements[4].style.overflow = "hidden";})},
{origCount:1193, fun:(function anonymous() {allElements[2].style.position = "relative";})},
{origCount:1194, fun:(function anonymous() {allElements[4].style.position = "absolute";})},
{origCount:1195, fun:(function anonymous() {allElements[4].style['float'] = "none";})},
{origCount:1196, fun:(function anonymous() {allElements[7].style.color = "black";})},
{origCount:1197, fun:(function anonymous() {allElements[4].style.color = "blue";})},
{origCount:1198, fun:(function anonymous() {allElements[1].style.position = "absolute";})},
{origCount:1199, fun:(function anonymous() {allElements[5].style.overflow = "scroll";})},
{origCount:1200, fun:(function anonymous() {allElements[6].style.visibility = "visible";})},
{origCount:1201, fun:(function anonymous() {allElements[11].style.clear = "right";})},
{origCount:1202, fun:(function anonymous() {allElements[12].style.position = "static";})},
{origCount:1203, fun:(function anonymous() {allElements[2].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:1204, fun:(function anonymous() {allElements[11].style.visibility = "hidden";})},
{origCount:1205, fun:(function anonymous() {allElements[7].style.color = "red";})},
{origCount:1206, fun:(function anonymous() {allElements[7].style.clear = "right";})},
{origCount:1207, fun:(function anonymous() {allElements[4].style.clear = "none";})},
{origCount:1208, fun:(function anonymous() {allElements[4].style.display = "list-item";})},
{origCount:1209, fun:(function anonymous() {allElements[12].style.background = "transparent";})},
{origCount:1210, fun:(function anonymous() {allElements[7].style['float'] = "left";})},
{origCount:1211, fun:(function anonymous() {allElements[8].style.color = "red";})},
{origCount:1212, fun:(function anonymous() {allElements[7].style.width = "20em";})},
{origCount:1213, fun:(function anonymous() {allElements[9].style.clear = "right";})},
{origCount:1214, fun:(function anonymous() {allElements[8].style.height = "100px";})},
{origCount:1215, fun:(function anonymous() {allElements[8].style.color = "red";})},
{origCount:1216, fun:(function anonymous() {allElements[2].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:1217, fun:(function anonymous() {allElements[8].style.overflow = "auto";})},
{origCount:1218, fun:(function anonymous() {allElements[5].style.position = "relative";})},
{origCount:1219, fun:(function anonymous() {allElements[0].style['float'] = "left";})},
{origCount:1220, fun:(function anonymous() {allElements[10].style.overflow = "visible";})},
{origCount:1221, fun:(function anonymous() {allElements[3].style.overflow = "visible";})},
{origCount:1222, fun:(function anonymous() {allElements[8].style.visibility = "hidden";})},
{origCount:1223, fun:(function anonymous() {allElements[6].style.visibility = "hidden";})},
{origCount:1224, fun:(function anonymous() {allElements[3].style['float'] = "right";})},
{origCount:1225, fun:(function anonymous() {allElements[3].style.width = "1px";})},
{origCount:1226, fun:(function anonymous() {allElements[12].style['float'] = "left";})},
{origCount:1227, fun:(function anonymous() {allElements[9].style.display = "list-item";})},
{origCount:1228, fun:(function anonymous() {allElements[1].style.width = "20em";})},
{origCount:1229, fun:(function anonymous() {allElements[4].style['float'] = "left";})},
{origCount:1230, fun:(function anonymous() {allElements[12].style.overflow = "auto";})},
{origCount:1231, fun:(function anonymous() {allElements[5].style.overflow = "hidden";})},
{origCount:1232, fun:(function anonymous() {allElements[12].style.overflow = "auto";})},
{origCount:1233, fun:(function anonymous() {allElements[2].style.height = "2em";})},
{origCount:1234, fun:(function anonymous() {allElements[5].style.display = "table-cell";})},
{origCount:1235, fun:(function anonymous() {allElements[1].style.background = "#fcd";})},
{origCount:1236, fun:(function anonymous() {allElements[8].style.height = "200%";})},
{origCount:1237, fun:(function anonymous() {allElements[5].style.clear = "both";})},
{origCount:1238, fun:(function anonymous() {allElements[12].style.height = "auto";})},
{origCount:1239, fun:(function anonymous() {allElements[7].style.overflow = "auto";})},
{origCount:1240, fun:(function anonymous() {allElements[8].style.overflow = "auto";})},
{origCount:1241, fun:(function anonymous() {allElements[9].style.visibility = "visible";})},
{origCount:1242, fun:(function anonymous() {allElements[2].style.display = "-moz-deck";})},
{origCount:1243, fun:(function anonymous() {allElements[5].style.color = "black";})},
{origCount:1244, fun:(function anonymous() {allElements[10].style.clear = "none";})},
{origCount:1245, fun:(function anonymous() {allElements[10].style['float'] = "right";})},
{origCount:1246, fun:(function anonymous() {allElements[11].style.width = "20em";})},
{origCount:1247, fun:(function anonymous() {allElements[4].style.background = "#fcd";})},
{origCount:1248, fun:(function anonymous() {allElements[8].style.position = "fixed";})},
{origCount:1249, fun:(function anonymous() {allElements[3].style.clear = "both";})},
{origCount:1250, fun:(function anonymous() {allElements[7].style.visibility = "collapse";})},
{origCount:1251, fun:(function anonymous() {allElements[0].style.overflow = "visible";})},
{origCount:1252, fun:(function anonymous() {allElements[12].style.height = "100px";})},
{origCount:1253, fun:(function anonymous() {allElements[10].style.clear = "right";})},
{origCount:1254, fun:(function anonymous() {allElements[0].style.overflow = "hidden";})},
{origCount:1255, fun:(function anonymous() {allElements[1].style.overflow = "hidden";})},
{origCount:1256, fun:(function anonymous() {allElements[3].style.position = "static";})},
{origCount:1257, fun:(function anonymous() {allElements[1].style.width = "10%";})},
{origCount:1258, fun:(function anonymous() {allElements[12].style['float'] = "right";})},
{origCount:1259, fun:(function anonymous() {allElements[3].style.overflow = "auto";})},
{origCount:1260, fun:(function anonymous() {allElements[4].style.color = "green";})},
{origCount:1261, fun:(function anonymous() {allElements[10].style.width = "auto";})},
{origCount:1262, fun:(function anonymous() {allElements[11].style.overflow = "hidden";})},
{origCount:1263, fun:(function anonymous() {allElements[1].style.clear = "none";})},
{origCount:1264, fun:(function anonymous() {allElements[11].style['float'] = "right";})},
{origCount:1265, fun:(function anonymous() {allElements[7].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:1266, fun:(function anonymous() {allElements[7].style.overflow = "visible";})},
{origCount:1267, fun:(function anonymous() {allElements[5].style['float'] = "left";})},
{origCount:1268, fun:(function anonymous() {allElements[5].style.position = "fixed";})},
{origCount:1269, fun:(function anonymous() {allElements[0].style.visibility = "hidden";})},
{origCount:1270, fun:(function anonymous() {allElements[9].style.height = "100px";})},
{origCount:1271, fun:(function anonymous() {allElements[10].style.height = "200%";})},
{origCount:1272, fun:(function anonymous() {allElements[9].style.position = "absolute";})},
{origCount:1273, fun:(function anonymous() {allElements[12].style.clear = "both";})},
{origCount:1274, fun:(function anonymous() {allElements[11].style.visibility = "visible";})},
{origCount:1275, fun:(function anonymous() {allElements[11].style.position = "fixed";})},
{origCount:1276, fun:(function anonymous() {allElements[6].style.width = "20em";})},
{origCount:1277, fun:(function anonymous() {allElements[12].style.height = "200%";})},
{origCount:1278, fun:(function anonymous() {allElements[10].style.display = "list-item";})},
{origCount:1279, fun:(function anonymous() {allElements[5].style.clear = "left";})},
{origCount:1280, fun:(function anonymous() {allElements[3].style.clear = "left";})},
{origCount:1281, fun:(function anonymous() {allElements[8].style.position = "fixed";})},
{origCount:1282, fun:(function anonymous() {allElements[1].style.overflow = "auto";})},
{origCount:1283, fun:(function anonymous() {allElements[0].style.height = "10%";})},
{origCount:1284, fun:(function anonymous() {allElements[10].style['float'] = "right";})},
{origCount:1285, fun:(function anonymous() {allElements[10].style.clear = "both";})},
{origCount:1286, fun:(function anonymous() {allElements[7].style.background = "transparent";})},
{origCount:1287, fun:(function anonymous() {allElements[4].style.visibility = "visible";})},
{origCount:1288, fun:(function anonymous() {allElements[9].style.display = "-moz-box";})},
{origCount:1289, fun:(function anonymous() {allElements[0].style.width = "auto";})},
{origCount:1290, fun:(function anonymous() {allElements[8].style.color = "black";})},
{origCount:1291, fun:(function anonymous() {allElements[1].style['float'] = "right";})},
{origCount:1292, fun:(function anonymous() {allElements[9].style.position = "relative";})},
{origCount:1293, fun:(function anonymous() {allElements[12].style.clear = "none";})},
{origCount:1294, fun:(function anonymous() {allElements[3].style.width = "1px";})},
{origCount:1295, fun:(function anonymous() {allElements[12].style.color = "red";})},
{origCount:1296, fun:(function anonymous() {allElements[6].style.display = "-moz-inline-block";})},
{origCount:1297, fun:(function anonymous() {allElements[4].style.width = "10%";})},
{origCount:1298, fun:(function anonymous() {allElements[11].style.height = "2em";})},
{origCount:1299, fun:(function anonymous() {allElements[6].style.height = "2em";})},
{origCount:1300, fun:(function anonymous() {allElements[8].style.visibility = "collapse";})},
{origCount:1301, fun:(function anonymous() {allElements[9].style.position = "absolute";})},
{origCount:1302, fun:(function anonymous() {allElements[2].style.color = "green";})},
{origCount:1303, fun:(function anonymous() {allElements[5].style.overflow = "auto";})},
{origCount:1304, fun:(function anonymous() {allElements[11].style.visibility = "collapse";})},
{origCount:1305, fun:(function anonymous() {allElements[12].style.color = "black";})},
{origCount:1306, fun:(function anonymous() {allElements[12].style.background = "transparent";})},
{origCount:1307, fun:(function anonymous() {allElements[6].style['float'] = "left";})},
{origCount:1308, fun:(function anonymous() {allElements[11].style['float'] = "right";})},
{origCount:1309, fun:(function anonymous() {allElements[6].style.clear = "none";})},
{origCount:1310, fun:(function anonymous() {allElements[10].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:1311, fun:(function anonymous() {allElements[3].style.display = "-moz-grid-group";})},
{origCount:1312, fun:(function anonymous() {allElements[3].style['float'] = "right";})},
{origCount:1313, fun:(function anonymous() {allElements[2].style.color = "blue";})},
{origCount:1314, fun:(function anonymous() {allElements[5].style.visibility = "hidden";})},
{origCount:1315, fun:(function anonymous() {allElements[6].style.background = "transparent";})},
{origCount:1316, fun:(function anonymous() {allElements[9].style['float'] = "right";})},
{origCount:1317, fun:(function anonymous() {allElements[7].style.background = "#fcd";})},
{origCount:1318, fun:(function anonymous() {allElements[5].style.visibility = "collapse";})},
{origCount:1319, fun:(function anonymous() {allElements[9].style.clear = "both";})},
{origCount:1320, fun:(function anonymous() {allElements[11].style.color = "green";})},
{origCount:1321, fun:(function anonymous() {allElements[4].style.clear = "none";})},
{origCount:1322, fun:(function anonymous() {allElements[6].style.display = "-moz-deck";})},
{origCount:1323, fun:(function anonymous() {allElements[9].style.clear = "none";})},
{origCount:1324, fun:(function anonymous() {allElements[6].style.position = "static";})},
{origCount:1325, fun:(function anonymous() {allElements[2].style.overflow = "scroll";})},
{origCount:1326, fun:(function anonymous() {allElements[3].style.background = "transparent";})},
{origCount:1327, fun:(function anonymous() {allElements[1].style.overflow = "auto";})},
{origCount:1328, fun:(function anonymous() {allElements[2].style.visibility = "hidden";})},
{origCount:1329, fun:(function anonymous() {allElements[10].style.overflow = "hidden";})},
{origCount:1330, fun:(function anonymous() {allElements[6].style.overflow = "visible";})},
{origCount:1331, fun:(function anonymous() {allElements[8].style.width = "auto";})},
{origCount:1332, fun:(function anonymous() {allElements[7].style.width = "200%";})},
{origCount:1333, fun:(function anonymous() {allElements[11].style.width = "200%";})},
{origCount:1334, fun:(function anonymous() {allElements[10].style.visibility = "collapse";})},
{origCount:1335, fun:(function anonymous() {allElements[11].style.background = "transparent";})},
{origCount:1336, fun:(function anonymous() {allElements[5].style.overflow = "visible";})},
{origCount:1337, fun:(function anonymous() {allElements[12].style['float'] = "right";})},
{origCount:1338, fun:(function anonymous() {allElements[10].style.background = "#fcd";})},
{origCount:1339, fun:(function anonymous() {allElements[6].style['float'] = "right";})},
{origCount:1340, fun:(function anonymous() {allElements[4].style.visibility = "visible";})},
{origCount:1341, fun:(function anonymous() {allElements[10].style.height = "auto";})},
{origCount:1342, fun:(function anonymous() {allElements[3].style.position = "static";})},
{origCount:1343, fun:(function anonymous() {allElements[2].style.display = "-moz-box";})},
{origCount:1344, fun:(function anonymous() {allElements[12].style.color = "red";})},
{origCount:1345, fun:(function anonymous() {allElements[0].style.clear = "none";})},
{origCount:1346, fun:(function anonymous() {allElements[10].style.clear = "left";})},
{origCount:1347, fun:(function anonymous() {allElements[8].style['float'] = "none";})},
{origCount:1348, fun:(function anonymous() {allElements[0].style.visibility = "collapse";})},
{origCount:1349, fun:(function anonymous() {allElements[4].style.visibility = "hidden";})},
{origCount:1350, fun:(function anonymous() {allElements[0].style.position = "absolute";})},
{origCount:1351, fun:(function anonymous() {allElements[6].style.display = "-moz-grid-group";})},
{origCount:1352, fun:(function anonymous() {allElements[1].style.height = "100px";})},
{origCount:1353, fun:(function anonymous() {allElements[5].style['float'] = "none";})},
{origCount:1354, fun:(function anonymous() {allElements[9].style['float'] = "none";})},
{origCount:1355, fun:(function anonymous() {allElements[5].style.display = "table-footer-group";})},
{origCount:1356, fun:(function anonymous() {allElements[0].style.clear = "both";})},
{origCount:1357, fun:(function anonymous() {allElements[11].style.clear = "none";})},
{origCount:1358, fun:(function anonymous() {allElements[5].style.color = "green";})},
{origCount:1359, fun:(function anonymous() {allElements[1].style['float'] = "left";})},
{origCount:1360, fun:(function anonymous() {allElements[3].style.background = "#fcd";})},
{origCount:1361, fun:(function anonymous() {allElements[5].style.display = "block";})},
{origCount:1362, fun:(function anonymous() {allElements[11].style.width = "1px";})},
{origCount:1363, fun:(function anonymous() {allElements[2].style['float'] = "right";})},
{origCount:1364, fun:(function anonymous() {allElements[8].style.display = "table-column";})},
{origCount:1365, fun:(function anonymous() {allElements[9].style.width = "20em";})},
{origCount:1366, fun:(function anonymous() {allElements[10].style.visibility = "visible";})},
{origCount:1367, fun:(function anonymous() {allElements[4].style['float'] = "none";})},
{origCount:1368, fun:(function anonymous() {allElements[9].style.visibility = "hidden";})},
{origCount:1369, fun:(function anonymous() {allElements[5].style.width = "200%";})},
{origCount:1370, fun:(function anonymous() {allElements[9].style.background = "transparent";})},
{origCount:1371, fun:(function anonymous() {allElements[2].style.color = "red";})},
{origCount:1372, fun:(function anonymous() {allElements[2].style.width = "auto";})},
{origCount:1373, fun:(function anonymous() {allElements[1].style.background = "#fcd";})},
{origCount:1374, fun:(function anonymous() {allElements[5].style.width = "10%";})},
{origCount:1375, fun:(function anonymous() {allElements[6].style.overflow = "visible";})},
{origCount:1376, fun:(function anonymous() {allElements[10].style.display = "-moz-inline-block";})},
{origCount:1377, fun:(function anonymous() {allElements[8].style.visibility = "collapse";})},
{origCount:1378, fun:(function anonymous() {allElements[7].style.display = "inline";})},
{origCount:1379, fun:(function anonymous() {allElements[11].style.position = "fixed";})},
{origCount:1380, fun:(function anonymous() {allElements[1].style.display = "-moz-stack";})},
{origCount:1381, fun:(function anonymous() {allElements[7].style.clear = "left";})},
{origCount:1382, fun:(function anonymous() {allElements[9].style.overflow = "auto";})},
{origCount:1383, fun:(function anonymous() {allElements[0].style.height = "10%";})},
{origCount:1384, fun:(function anonymous() {allElements[10].style.overflow = "scroll";})},
{origCount:1385, fun:(function anonymous() {allElements[7].style.height = "100px";})},
{origCount:1386, fun:(function anonymous() {allElements[8].style.overflow = "auto";})},
{origCount:1387, fun:(function anonymous() {allElements[6].style.background = "#fcd";})},
{origCount:1388, fun:(function anonymous() {allElements[7].style.width = "auto";})},
{origCount:1389, fun:(function anonymous() {allElements[3].style.position = "relative";})},
{origCount:1390, fun:(function anonymous() {allElements[12].style.width = "10%";})},
{origCount:1391, fun:(function anonymous() {allElements[1].style.position = "absolute";})},
{origCount:1392, fun:(function anonymous() {allElements[1].style.background = "url(http://www.google.com/images/logo_sm.gif)";})},
{origCount:1393, fun:(function anonymous() {allElements[5].style.clear = "left";})},
{origCount:1394, fun:(function anonymous() {allElements[4].style['float'] = "left";})},
{origCount:1395, fun:(function anonymous() {allElements[6].style.width = "20em";})},
{origCount:1396, fun:(function anonymous() {allElements[0].style.height = "200%";})},
{origCount:1397, fun:(function anonymous() {allElements[8].style.width = "200%";})},
{origCount:1398, fun:(function anonymous() {allElements[6].style.height = "auto";})},
{origCount:1399, fun:(function anonymous() {allElements[2].style.overflow = "scroll";})},
{origCount:1400, fun:(function anonymous() {allElements[1].style.clear = "left";})},
{origCount:1401, fun:(function anonymous() {allElements[7].style.display = "-moz-box";})},
{origCount:1402, fun:(function anonymous() {allElements[0].style['float'] = "none";})},
{origCount:1403, fun:(function anonymous() {allElements[0].style.clear = "none";})},
{origCount:1404, fun:(function anonymous() {allElements[10].style.height = "100px";})},
{origCount:1405, fun:(function anonymous() {allElements[11].style.width = "20em";})},
{origCount:1406, fun:(function anonymous() {allElements[9].style.clear = "both";})},
{origCount:1407, fun:(function anonymous() {allElements[7].style.position = "static";})},
{origCount:1408, fun:(function anonymous() {allElements[12].style['float'] = "none";})},
{origCount:1409, fun:(function anonymous() {allElements[4].style.position = "static";})},
{origCount:1410, fun:(function anonymous() {allElements[0].style.height = "200%";})},
{origCount:1411, fun:(function anonymous() {allElements[7].style['float'] = "none";})},
{origCount:1412, fun:(function anonymous() {allElements[3].style.clear = "none";})},
{origCount:1413, fun:(function anonymous() {allElements[6].style.color = "green";})},
{origCount:1414, fun:(function anonymous() {allElements[10].style.height = "200%";})},
{origCount:1415, fun:(function anonymous() {allElements[7].style.overflow = "visible";})}

    ];


var output = eval(commands.toSource().replace(/anonymous/g,"")).toSource().replace( /\)\},/g , ")},\n");

reportCompare(expect, actual, summary);
