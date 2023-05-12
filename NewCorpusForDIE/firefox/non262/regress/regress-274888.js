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

/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

//-----------------------------------------------------------------------------
var BUGNUMBER = 274888;
var summary = 'Negative lookahead should match at positions > approx. 64k';
var actual = '';
var expect = '';

printBugNumber(BUGNUMBER);
printStatus (summary);

var re;
var status;
var s;

re = /(?!\d)a/;
status = summary + ' ' + inSection(1) + ' /(?!\\d)a/.text("12345a")';
s = '12345a';

expect = true; 
actual = re.test(s);

reportCompare(expect, actual, status);

re = /(?!\d)a/;
status = summary + ' ' + inSection(2) + ' ' + '/(?!\\d)a/.text("1...ka")';
s = '1234567891011121314151617181920212223242526272829303132333435363738394041424344454647484950515253545556575859606162636465666768697071727374757677787980818283848586878889909192939495969798991001011021031041051061071081091101111121131141151161171181191201211221231241251261271281291301311321331341351361371381391401411421431441451461471481491501511521531541551561571581591601611621631641651661671681691701711721731741751761771781791801811821831841851861871881891901911921931941951961971981992002012022032042052062072082092102112122132142152162172182192202212222232242252262272282292302312322332342352362372382392402412422432442452462472482492502512522532542552562572582592602612622632642652662672682692702712722732742752762772782792802812822832842852862872882892902912922932942952962972982993003013023033043053063073083093103113123133143153163173183193203213223233243253263273283293303313323333343353363373383393403413423433443453463473483493503513523533543553563573583593603613623633643653663673683693703713723733743753763773783793803813823833843853863873883893903913923933943953963973983994004014024034044054064074084094104114124134144154164174184194204214224234244254264274284294304314324334344354364374384394404414424434444454464474484494504514524534544554564574584594604614624634644654664674684694704714724734744754764774784794804814824834844854864874884894904914924934944954964974984995005015025035045055065075085095105115125135145155165175185195205215225235245255265275285295305315325335345355365375385395405415425435445455465475485495505515525535545555565575585595605615625635645655665675685695705715725735745755765775785795805815825835845855865875885895905915925935945955965975985996006016026036046056066076086096106116126136146156166176186196206216226236246256266276286296306316326336346356366376386396406416426436446456466476486496506516526536546556566576586596606616626636646656666676686696706716726736746756766776786796806816826836846856866876886896906916926936946956966976986997007017027037047057067077087097107117127137147157167177187197207217227237247257267277287297307317327337347357367377387397407417427437447457467477487497507517527537547557567577587597607617627637647657667677687697707717727737747757767777787797807817827837847857867877887897907917927937947957967977987998008018028038048058068078088098108118128138148158168178188198208218228238248258268278288298308318328338348358368378388398408418428438448458468478488498508518528538548558568578588598608618628638648658668678688698708718728738748758768778788798808818828838848858868878888898908918928938948958968978988999009019029039049059069079089099109119129139149159169179189199209219229239249259269279289299309319329339349359369379389399409419429439449459469479489499509519529539549559569579589599609619629639649659669679689699709719729739749759769779789799809819829839849859869879889899909919929939949959969979989991000100110021003100410051006100710081009101010111012101310141015101610171018101910201021102210231024102510261027102810291030103110321033103410351036103710381039104010411042104310441045104610471048104910501051105210531054105510561057105810591060106110621063106410651066106710681069107010711072107310741075107610771078107910801081108210831084108510861087108810891090109110921093109410951096109710981099110011011102110311041105110611071108110911101111111211131114111511161117111811191120112111221123112411251126112711281129113011311132113311341135113611371138113911401141114211431144114511461147114811491150115111521153115411551156115711581159116011611162116311641165116611671168116911701171117211731174117511761177117811791180118111821183118411851186118711881189119011911192119311941195119611971198119912001201120212031204120512061207120812091210121112121213121412151216121712181219122012211222122312241225122612271228122912301231123212331234123512361237123812391240124112421243124412451246124712481249125012511252125312541255125612571258125912601261126212631264126512661267126812691270127112721273127412751276127712781279128012811282128312841285128612871288128912901291129212931294129512961297129812991300130113021303130413051306130713081309131013111312131313141315131613171318131913201321132213231324132513261327132813291330133113321333133413351336133713381339134013411342134313441345134613471348134913501351135213531354135513561357135813591360136113621363136413651366136713681369137013711372137313741375137613771378137913801381138213831384138513861387138813891390139113921393139413951396139713981399140014011402140314041405140614071408140914101411141214131414141514161417141814191420142114221423142414251426142714281429143014311432143314341435143614371438143914401441144214431444144514461447144814491450145114521453145414551456145714581459146014611462146314641465146614671468146914701471147214731474147514761477147814791480148114821483148414851486148714881489149014911492149314941495149614971498149915001501150215031504150515061507150815091510151115121513151415151516151715181519152015211522152315241525152615271528152915301531153215331534153515361537153815391540154115421543154415451546154715481549155015511552155315541555155615571558155915601561156215631564156515661567156815691570157115721573157415751576157715781579158015811582158315841585158615871588158915901591159215931594159515961597159815991600160116021603160416051606160716081609161016111612161316141615161616171618161916201621162216231624162516261627162816291630163116321633163416351636163716381639164016411642164316441645164616471648164916501651165216531654165516561657165816591660166116621663166416651666166716681669167016711672167316741675167616771678167916801681168216831684168516861687168816891690169116921693169416951696169716981699170017011702170317041705170617071708170917101711171217131714171517161717171817191720172117221723172417251726172717281729173017311732173317341735173617371738173917401741174217431744174517461747174817491750175117521753175417551756175717581759176017611762176317641765176617671768176917701771177217731774177517761777177817791780178117821783178417851786178717881789179017911792179317941795179617971798179918001801180218031804180518061807180818091810181118121813181418151816181718181819182018211822182318241825182618271828182918301831183218331834183518361837183818391840184118421843184418451846184718481849185018511852185318541855185618571858185918601861186218631864186518661867186818691870187118721873187418751876187718781879188018811882188318841885188618871888188918901891189218931894189518961897189818991900190119021903190419051906190719081909191019111912191319141915191619171918191919201921192219231924192519261927192819291930193119321933193419351936193719381939194019411942194319441945194619471948194919501951195219531954195519561957195819591960196119621963196419651966196719681969197019711972197319741975197619771978197919801981198219831984198519861987198819891990199119921993199419951996199719981999200020012002200320042005200620072008200920102011201220132014201520162017201820192020202120222023202420252026202720282029203020312032203320342035203620372038203920402041204220432044204520462047204820492050205120522053205420552056205720582059206020612062206320642065206620672068206920702071207220732074207520762077207820792080208120822083208420852086208720882089209020912092209320942095209620972098209921002101210221032104210521062107210821092110211121122113211421152116211721182119212021212122212321242125212621272128212921302131213221332134213521362137213821392140214121422143214421452146214721482149215021512152215321542155215621572158215921602161216221632164216521662167216821692170217121722173217421752176217721782179218021812182218321842185218621872188218921902191219221932194219521962197219821992200220122022203220422052206220722082209221022112212221322142215221622172218221922202221222222232224222522262227222822292230223122322233223422352236223722382239224022412242224322442245224622472248224922502251225222532254225522562257225822592260226122622263226422652266226722682269227022712272227322742275227622772278227922802281228222832284228522862287228822892290229122922293229422952296229722982299230023012302230323042305230623072308230923102311231223132314231523162317231823192320232123222323232423252326232723282329233023312332233323342335233623372338233923402341234223432344234523462347234823492350235123522353235423552356235723582359236023612362236323642365236623672368236923702371237223732374237523762377237823792380238123822383238423852386238723882389239023912392239323942395239623972398239924002401240224032404240524062407240824092410241124122413241424152416241724182419242024212422242324242425242624272428242924302431243224332434243524362437243824392440244124422443244424452446244724482449245024512452245324542455245624572458245924602461246224632464246524662467246824692470247124722473247424752476247724782479248024812482248324842485248624872488248924902491249224932494249524962497249824992500250125022503250425052506250725082509251025112512251325142515251625172518251925202521252225232524252525262527252825292530253125322533253425352536253725382539254025412542254325442545254625472548254925502551255225532554255525562557255825592560256125622563256425652566256725682569257025712572257325742575257625772578257925802581258225832584258525862587258825892590259125922593259425952596259725982599260026012602260326042605260626072608260926102611261226132614261526162617261826192620262126222623262426252626262726282629263026312632263326342635263626372638263926402641264226432644264526462647264826492650265126522653265426552656265726582659266026612662266326642665266626672668266926702671267226732674267526762677267826792680268126822683268426852686268726882689269026912692269326942695269626972698269927002701270227032704270527062707270827092710271127122713271427152716271727182719272027212722272327242725272627272728272927302731273227332734273527362737273827392740274127422743274427452746274727482749275027512752275327542755275627572758275927602761276227632764276527662767276827692770277127722773277427752776277727782779278027812782278327842785278627872788278927902791279227932794279527962797279827992800280128022803280428052806280728082809281028112812281328142815281628172818281928202821282228232824282528262827282828292830283128322833283428352836283728382839284028412842284328442845284628472848284928502851285228532854285528562857285828592860286128622863286428652866286728682869287028712872287328742875287628772878287928802881288228832884288528862887288828892890289128922893289428952896289728982899290029012902290329042905290629072908290929102911291229132914291529162917291829192920292129222923292429252926292729282929293029312932293329342935293629372938293929402941294229432944294529462947294829492950295129522953295429552956295729582959296029612962296329642965296629672968296929702971297229732974297529762977297829792980298129822983298429852986298729882989299029912992299329942995299629972998299930003001300230033004300530063007300830093010301130123013301430153016301730183019302030213022302330243025302630273028302930303031303230333034303530363037303830393040304130423043304430453046304730483049305030513052305330543055305630573058305930603061306230633064306530663067306830693070307130723073307430753076307730783079308030813082308330843085308630873088308930903091309230933094309530963097309830993100310131023103310431053106310731083109311031113112311331143115311631173118311931203121312231233124312531263127312831293130313131323133313431353136313731383139314031413142314331443145314631473148314931503151315231533154315531563157315831593160316131623163316431653166316731683169317031713172317331743175317631773178317931803181318231833184318531863187318831893190319131923193319431953196319731983199320032013202320332043205320632073208320932103211321232133214321532163217321832193220322132223223322432253226322732283229323032313232323332343235323632373238323932403241324232433244324532463247324832493250325132523253325432553256325732583259326032613262326332643265326632673268326932703271327232733274327532763277327832793280328132823283328432853286328732883289329032913292329332943295329632973298329933003301330233033304330533063307330833093310331133123313331433153316331733183319332033213322332333243325332633273328332933303331333233333334333533363337333833393340334133423343334433453346334733483349335033513352335333543355335633573358335933603361336233633364336533663367336833693370337133723373337433753376337733783379338033813382338333843385338633873388338933903391339233933394339533963397339833993400340134023403340434053406340734083409341034113412341334143415341634173418341934203421342234233424342534263427342834293430343134323433343434353436343734383439344034413442344334443445344634473448344934503451345234533454345534563457345834593460346134623463346434653466346734683469347034713472347334743475347634773478347934803481348234833484348534863487348834893490349134923493349434953496349734983499350035013502350335043505350635073508350935103511351235133514351535163517351835193520352135223523352435253526352735283529353035313532353335343535353635373538353935403541354235433544354535463547354835493550355135523553355435553556355735583559356035613562356335643565356635673568356935703571357235733574357535763577357835793580358135823583358435853586358735883589359035913592359335943595359635973598359936003601360236033604360536063607360836093610361136123613361436153616361736183619362036213622362336243625362636273628362936303631363236333634363536363637363836393640364136423643364436453646364736483649365036513652365336543655365636573658365936603661366236633664366536663667366836693670367136723673367436753676367736783679368036813682368336843685368636873688368936903691369236933694369536963697369836993700370137023703370437053706370737083709371037113712371337143715371637173718371937203721372237233724372537263727372837293730373137323733373437353736373737383739374037413742374337443745374637473748374937503751375237533754375537563757375837593760376137623763376437653766376737683769377037713772377337743775377637773778377937803781378237833784378537863787378837893790379137923793379437953796379737983799380038013802380338043805380638073808380938103811381238133814381538163817381838193820382138223823382438253826382738283829383038313832383338343835383638373838383938403841384238433844384538463847384838493850385138523853385438553856385738583859386038613862386338643865386638673868386938703871387238733874387538763877387838793880388138823883388438853886388738883889389038913892389338943895389638973898389939003901390239033904390539063907390839093910391139123913391439153916391739183919392039213922392339243925392639273928392939303931393239333934393539363937393839393940394139423943394439453946394739483949395039513952395339543955395639573958395939603961396239633964396539663967396839693970397139723973397439753976397739783979398039813982398339843985398639873988398939903991399239933994399539963997399839994000400140024003400440054006400740084009401040114012401340144015401640174018401940204021402240234024402540264027402840294030403140324033403440354036403740384039404040414042404340444045404640474048404940504051405240534054405540564057405840594060406140624063406440654066406740684069407040714072407340744075407640774078407940804081408240834084408540864087408840894090409140924093409440954096409740984099410041014102410341044105410641074108410941104111411241134114411541164117411841194120412141224123412441254126412741284129413041314132413341344135413641374138413941404141414241434144414541464147414841494150415141524153415441554156415741584159416041614162416341644165416641674168416941704171417241734174417541764177417841794180418141824183418441854186418741884189419041914192419341944195419641974198419942004201420242034204420542064207420842094210421142124213421442154216421742184219422042214222422342244225422642274228422942304231423242334234423542364237423842394240424142424243424442454246424742484249425042514252425342544255425642574258425942604261426242634264426542664267426842694270427142724273427442754276427742784279428042814282428342844285428642874288428942904291429242934294429542964297429842994300430143024303430443054306430743084309431043114312431343144315431643174318431943204321432243234324432543264327432843294330433143324333433443354336433743384339434043414342434343444345434643474348434943504351435243534354435543564357435843594360436143624363436443654366436743684369437043714372437343744375437643774378437943804381438243834384438543864387438843894390439143924393439443954396439743984399440044014402440344044405440644074408440944104411441244134414441544164417441844194420442144224423442444254426442744284429443044314432443344344435443644374438443944404441444244434444444544464447444844494450445144524453445444554456445744584459446044614462446344644465446644674468446944704471447244734474447544764477447844794480448144824483448444854486448744884489449044914492449344944495449644974498449945004501450245034504450545064507450845094510451145124513451445154516451745184519452045214522452345244525452645274528452945304531453245334534453545364537453845394540454145424543454445454546454745484549455045514552455345544555455645574558455945604561456245634564456545664567456845694570457145724573457445754576457745784579458045814582458345844585458645874588458945904591459245934594459545964597459845994600460146024603460446054606460746084609461046114612461346144615461646174618461946204621462246234624462546264627462846294630463146324633463446354636463746384639464046414642464346444645464646474648464946504651465246534654465546564657465846594660466146624663466446654666466746684669467046714672467346744675467646774678467946804681468246834684468546864687468846894690469146924693469446954696469746984699470047014702470347044705470647074708470947104711471247134714471547164717471847194720472147224723472447254726472747284729473047314732473347344735473647374738473947404741474247434744474547464747474847494750475147524753475447554756475747584759476047614762476347644765476647674768476947704771477247734774477547764777477847794780478147824783478447854786478747884789479047914792479347944795479647974798479948004801480248034804480548064807480848094810481148124813481448154816481748184819482048214822482348244825482648274828482948304831483248334834483548364837483848394840484148424843484448454846484748484849485048514852485348544855485648574858485948604861486248634864486548664867486848694870487148724873487448754876487748784879488048814882488348844885488648874888488948904891489248934894489548964897489848994900490149024903490449054906490749084909491049114912491349144915491649174918491949204921492249234924492549264927492849294930493149324933493449354936493749384939494049414942494349444945494649474948494949504951495249534954495549564957495849594960496149624963496449654966496749684969497049714972497349744975497649774978497949804981498249834984498549864987498849894990499149924993499449954996499749984999500050015002500350045005500650075008500950105011501250135014501550165017501850195020502150225023502450255026502750285029503050315032503350345035503650375038503950405041504250435044504550465047504850495050505150525053505450555056505750585059506050615062506350645065506650675068506950705071507250735074507550765077507850795080508150825083508450855086508750885089509050915092509350945095509650975098509951005101510251035104510551065107510851095110511151125113511451155116511751185119512051215122512351245125512651275128512951305131513251335134513551365137513851395140514151425143514451455146514751485149515051515152515351545155515651575158515951605161516251635164516551665167516851695170517151725173517451755176517751785179518051815182518351845185518651875188518951905191519251935194519551965197519851995200520152025203520452055206520752085209521052115212521352145215521652175218521952205221522252235224522552265227522852295230523152325233523452355236523752385239524052415242524352445245524652475248524952505251525252535254525552565257525852595260526152625263526452655266526752685269527052715272527352745275527652775278527952805281528252835284528552865287528852895290529152925293529452955296529752985299530053015302530353045305530653075308530953105311531253135314531553165317531853195320532153225323532453255326532753285329533053315332533353345335533653375338533953405341534253435344534553465347534853495350535153525353535453555356535753585359536053615362536353645365536653675368536953705371537253735374537553765377537853795380538153825383538453855386538753885389539053915392539353945395539653975398539954005401540254035404540554065407540854095410541154125413541454155416541754185419542054215422542354245425542654275428542954305431543254335434543554365437543854395440544154425443544454455446544754485449545054515452545354545455545654575458545954605461546254635464546554665467546854695470547154725473547454755476547754785479548054815482548354845485548654875488548954905491549254935494549554965497549854995500550155025503550455055506550755085509551055115512551355145515551655175518551955205521552255235524552555265527552855295530553155325533553455355536553755385539554055415542554355445545554655475548554955505551555255535554555555565557555855595560556155625563556455655566556755685569557055715572557355745575557655775578557955805581558255835584558555865587558855895590559155925593559455955596559755985599560056015602560356045605560656075608560956105611561256135614561556165617561856195620562156225623562456255626562756285629563056315632563356345635563656375638563956405641564256435644564556465647564856495650565156525653565456555656565756585659566056615662566356645665566656675668566956705671567256735674567556765677567856795680568156825683568456855686568756885689569056915692569356945695569656975698569957005701570257035704570557065707570857095710571157125713571457155716571757185719572057215722572357245725572657275728572957305731573257335734573557365737573857395740574157425743574457455746574757485749575057515752575357545755575657575758575957605761576257635764576557665767576857695770577157725773577457755776577757785779578057815782578357845785578657875788578957905791579257935794579557965797579857995800580158025803580458055806580758085809581058115812581358145815581658175818581958205821582258235824582558265827582858295830583158325833583458355836583758385839584058415842584358445845584658475848584958505851585258535854585558565857585858595860586158625863586458655866586758685869587058715872587358745875587658775878587958805881588258835884588558865887588858895890589158925893589458955896589758985899590059015902590359045905590659075908590959105911591259135914591559165917591859195920592159225923592459255926592759285929593059315932593359345935593659375938593959405941594259435944594559465947594859495950595159525953595459555956595759585959596059615962596359645965596659675968596959705971597259735974597559765977597859795980598159825983598459855986598759885989599059915992599359945995599659975998599960006001600260036004600560066007600860096010601160126013601460156016601760186019602060216022602360246025602660276028602960306031603260336034603560366037603860396040604160426043604460456046604760486049605060516052605360546055605660576058605960606061606260636064606560666067606860696070607160726073607460756076607760786079608060816082608360846085608660876088608960906091609260936094609560966097609860996100610161026103610461056106610761086109611061116112611361146115611661176118611961206121612261236124612561266127612861296130613161326133613461356136613761386139614061416142614361446145614661476148614961506151615261536154615561566157615861596160616161626163616461656166616761686169617061716172617361746175617661776178617961806181618261836184618561866187618861896190619161926193619461956196619761986199620062016202620362046205620662076208620962106211621262136214621562166217621862196220622162226223622462256226622762286229623062316232623362346235623662376238623962406241624262436244624562466247624862496250625162526253625462556256625762586259626062616262626362646265626662676268626962706271627262736274627562766277627862796280628162826283628462856286628762886289629062916292629362946295629662976298629963006301630263036304630563066307630863096310631163126313631463156316631763186319632063216322632363246325632663276328632963306331633263336334633563366337633863396340634163426343634463456346634763486349635063516352635363546355635663576358635963606361636263636364636563666367636863696370637163726373637463756376637763786379638063816382638363846385638663876388638963906391639263936394639563966397639863996400640164026403640464056406640764086409641064116412641364146415641664176418641964206421642264236424642564266427642864296430643164326433643464356436643764386439644064416442644364446445644664476448644964506451645264536454645564566457645864596460646164626463646464656466646764686469647064716472647364746475647664776478647964806481648264836484648564866487648864896490649164926493649464956496649764986499650065016502650365046505650665076508650965106511651265136514651565166517651865196520652165226523652465256526652765286529653065316532653365346535653665376538653965406541654265436544654565466547654865496550655165526553655465556556655765586559656065616562656365646565656665676568656965706571657265736574657565766577657865796580658165826583658465856586658765886589659065916592659365946595659665976598659966006601660266036604660566066607660866096610661166126613661466156616661766186619662066216622662366246625662666276628662966306631663266336634663566366637663866396640664166426643664466456646664766486649665066516652665366546655665666576658665966606661666266636664666566666667666866696670667166726673667466756676667766786679668066816682668366846685668666876688668966906691669266936694669566966697669866996700670167026703670467056706670767086709671067116712671367146715671667176718671967206721672267236724672567266727672867296730673167326733673467356736673767386739674067416742674367446745674667476748674967506751675267536754675567566757675867596760676167626763676467656766676767686769677067716772677367746775677667776778677967806781678267836784678567866787678867896790679167926793679467956796679767986799680068016802680368046805680668076808680968106811681268136814681568166817681868196820682168226823682468256826682768286829683068316832683368346835683668376838683968406841684268436844684568466847684868496850685168526853685468556856685768586859686068616862686368646865686668676868686968706871687268736874687568766877687868796880688168826883688468856886688768886889689068916892689368946895689668976898689969006901690269036904690569066907690869096910691169126913691469156916691769186919692069216922692369246925692669276928692969306931693269336934693569366937693869396940694169426943694469456946694769486949695069516952695369546955695669576958695969606961696269636964696569666967696869696970697169726973697469756976697769786979698069816982698369846985698669876988698969906991699269936994699569966997699869997000700170027003700470057006700770087009701070117012701370147015701670177018701970207021702270237024702570267027702870297030703170327033703470357036703770387039704070417042704370447045704670477048704970507051705270537054705570567057705870597060706170627063706470657066706770687069707070717072707370747075707670777078707970807081708270837084708570867087708870897090709170927093709470957096709770987099710071017102710371047105710671077108710971107111711271137114711571167117711871197120712171227123712471257126712771287129713071317132713371347135713671377138713971407141714271437144714571467147714871497150715171527153715471557156715771587159716071617162716371647165716671677168716971707171717271737174717571767177717871797180718171827183718471857186718771887189719071917192719371947195719671977198719972007201720272037204720572067207720872097210721172127213721472157216721772187219722072217222722372247225722672277228722972307231723272337234723572367237723872397240724172427243724472457246724772487249725072517252725372547255725672577258725972607261726272637264726572667267726872697270727172727273727472757276727772787279728072817282728372847285728672877288728972907291729272937294729572967297729872997300730173027303730473057306730773087309731073117312731373147315731673177318731973207321732273237324732573267327732873297330733173327333733473357336733773387339734073417342734373447345734673477348734973507351735273537354735573567357735873597360736173627363736473657366736773687369737073717372737373747375737673777378737973807381738273837384738573867387738873897390739173927393739473957396739773987399740074017402740374047405740674077408740974107411741274137414741574167417741874197420742174227423742474257426742774287429743074317432743374347435743674377438743974407441744274437444744574467447744874497450745174527453745474557456745774587459746074617462746374647465746674677468746974707471747274737474747574767477747874797480748174827483748474857486748774887489749074917492749374947495749674977498749975007501750275037504750575067507750875097510751175127513751475157516751775187519752075217522752375247525752675277528752975307531753275337534753575367537753875397540754175427543754475457546754775487549755075517552755375547555755675577558755975607561756275637564756575667567756875697570757175727573757475757576757775787579758075817582758375847585758675877588758975907591759275937594759575967597759875997600760176027603760476057606760776087609761076117612761376147615761676177618761976207621762276237624762576267627762876297630763176327633763476357636763776387639764076417642764376447645764676477648764976507651765276537654765576567657765876597660766176627663766476657666766776687669767076717672767376747675767676777678767976807681768276837684768576867687768876897690769176927693769476957696769776987699770077017702770377047705770677077708770977107711771277137714771577167717771877197720772177227723772477257726772777287729773077317732773377347735773677377738773977407741774277437744774577467747774877497750775177527753775477557756775777587759776077617762776377647765776677677768776977707771777277737774777577767777777877797780778177827783778477857786778777887789779077917792779377947795779677977798779978007801780278037804780578067807780878097810781178127813781478157816781778187819782078217822782378247825782678277828782978307831783278337834783578367837783878397840784178427843784478457846784778487849785078517852785378547855785678577858785978607861786278637864786578667867786878697870787178727873787478757876787778787879788078817882788378847885788678877888788978907891789278937894789578967897789878997900790179027903790479057906790779087909791079117912791379147915791679177918791979207921792279237924792579267927792879297930793179327933793479357936793779387939794079417942794379447945794679477948794979507951795279537954795579567957795879597960796179627963796479657966796779687969797079717972797379747975797679777978797979807981798279837984798579867987798879897990799179927993799479957996799779987999800080018002800380048005800680078008800980108011801280138014801580168017801880198020802180228023802480258026802780288029803080318032803380348035803680378038803980408041804280438044804580468047804880498050805180528053805480558056805780588059806080618062806380648065806680678068806980708071807280738074807580768077807880798080808180828083808480858086808780888089809080918092809380948095809680978098809981008101810281038104810581068107810881098110811181128113811481158116811781188119812081218122812381248125812681278128812981308131813281338134813581368137813881398140814181428143814481458146814781488149815081518152815381548155815681578158815981608161816281638164816581668167816881698170817181728173817481758176817781788179818081818182818381848185818681878188818981908191819281938194819581968197819881998200820182028203820482058206820782088209821082118212821382148215821682178218821982208221822282238224822582268227822882298230823182328233823482358236823782388239824082418242824382448245824682478248824982508251825282538254825582568257825882598260826182628263826482658266826782688269827082718272827382748275827682778278827982808281828282838284828582868287828882898290829182928293829482958296829782988299830083018302830383048305830683078308830983108311831283138314831583168317831883198320832183228323832483258326832783288329833083318332833383348335833683378338833983408341834283438344834583468347834883498350835183528353835483558356835783588359836083618362836383648365836683678368836983708371837283738374837583768377837883798380838183828383838483858386838783888389839083918392839383948395839683978398839984008401840284038404840584068407840884098410841184128413841484158416841784188419842084218422842384248425842684278428842984308431843284338434843584368437843884398440844184428443844484458446844784488449845084518452845384548455845684578458845984608461846284638464846584668467846884698470847184728473847484758476847784788479848084818482848384848485848684878488848984908491849284938494849584968497849884998500850185028503850485058506850785088509851085118512851385148515851685178518851985208521852285238524852585268527852885298530853185328533853485358536853785388539854085418542854385448545854685478548854985508551855285538554855585568557855885598560856185628563856485658566856785688569857085718572857385748575857685778578857985808581858285838584858585868587858885898590859185928593859485958596859785988599860086018602860386048605860686078608860986108611861286138614861586168617861886198620862186228623862486258626862786288629863086318632863386348635863686378638863986408641864286438644864586468647864886498650865186528653865486558656865786588659866086618662866386648665866686678668866986708671867286738674867586768677867886798680868186828683868486858686868786888689869086918692869386948695869686978698869987008701870287038704870587068707870887098710871187128713871487158716871787188719872087218722872387248725872687278728872987308731873287338734873587368737873887398740874187428743874487458746874787488749875087518752875387548755875687578758875987608761876287638764876587668767876887698770877187728773877487758776877787788779878087818782878387848785878687878788878987908791879287938794879587968797879887998800880188028803880488058806880788088809881088118812881388148815881688178818881988208821882288238824882588268827882888298830883188328833883488358836883788388839884088418842884388448845884688478848884988508851885288538854885588568857885888598860886188628863886488658866886788688869887088718872887388748875887688778878887988808881888288838884888588868887888888898890889188928893889488958896889788988899890089018902890389048905890689078908890989108911891289138914891589168917891889198920892189228923892489258926892789288929893089318932893389348935893689378938893989408941894289438944894589468947894889498950895189528953895489558956895789588959896089618962896389648965896689678968896989708971897289738974897589768977897889798980898189828983898489858986898789888989899089918992899389948995899689978998899990009001900290039004900590069007900890099010901190129013901490159016901790189019902090219022902390249025902690279028902990309031903290339034903590369037903890399040904190429043904490459046904790489049905090519052905390549055905690579058905990609061906290639064906590669067906890699070907190729073907490759076907790789079908090819082908390849085908690879088908990909091909290939094909590969097909890999100910191029103910491059106910791089109911091119112911391149115911691179118911991209121912291239124912591269127912891299130913191329133913491359136913791389139914091419142914391449145914691479148914991509151915291539154915591569157915891599160916191629163916491659166916791689169917091719172917391749175917691779178917991809181918291839184918591869187918891899190919191929193919491959196919791989199920092019202920392049205920692079208920992109211921292139214921592169217921892199220922192229223922492259226922792289229923092319232923392349235923692379238923992409241924292439244924592469247924892499250925192529253925492559256925792589259926092619262926392649265926692679268926992709271927292739274927592769277927892799280928192829283928492859286928792889289929092919292929392949295929692979298929993009301930293039304930593069307930893099310931193129313931493159316931793189319932093219322932393249325932693279328932993309331933293339334933593369337933893399340934193429343934493459346934793489349935093519352935393549355935693579358935993609361936293639364936593669367936893699370937193729373937493759376937793789379938093819382938393849385938693879388938993909391939293939394939593969397939893999400940194029403940494059406940794089409941094119412941394149415941694179418941994209421942294239424942594269427942894299430943194329433943494359436943794389439944094419442944394449445944694479448944994509451945294539454945594569457945894599460946194629463946494659466946794689469947094719472947394749475947694779478947994809481948294839484948594869487948894899490949194929493949494959496949794989499950095019502950395049505950695079508950995109511951295139514951595169517951895199520952195229523952495259526952795289529953095319532953395349535953695379538953995409541954295439544954595469547954895499550955195529553955495559556955795589559956095619562956395649565956695679568956995709571957295739574957595769577957895799580958195829583958495859586958795889589959095919592959395949595959695979598959996009601960296039604960596069607960896099610961196129613961496159616961796189619962096219622962396249625962696279628962996309631963296339634963596369637963896399640964196429643964496459646964796489649965096519652965396549655965696579658965996609661966296639664966596669667966896699670967196729673967496759676967796789679968096819682968396849685968696879688968996909691969296939694969596969697969896999700970197029703970497059706970797089709971097119712971397149715971697179718971997209721972297239724972597269727972897299730973197329733973497359736973797389739974097419742974397449745974697479748974997509751975297539754975597569757975897599760976197629763976497659766976797689769977097719772977397749775977697779778977997809781978297839784978597869787978897899790979197929793979497959796979797989799980098019802980398049805980698079808980998109811981298139814981598169817981898199820982198229823982498259826982798289829983098319832983398349835983698379838983998409841984298439844984598469847984898499850985198529853985498559856985798589859986098619862986398649865986698679868986998709871987298739874987598769877987898799880988198829883988498859886988798889889989098919892989398949895989698979898989999009901990299039904990599069907990899099910991199129913991499159916991799189919992099219922992399249925992699279928992999309931993299339934993599369937993899399940994199429943994499459946994799489949995099519952995399549955995699579958995999609961996299639964996599669967996899699970997199729973997499759976997799789979998099819982998399849985998699879988998999909991999299939994999599969997999899991000010001100021000310004100051000610007100081000910010100111001210013100141001510016100171001810019100201002110022100231002410025100261002710028100291003010031100321003310034100351003610037100381003910040100411004210043100441004510046100471004810049100501005110052100531005410055100561005710058100591006010061100621006310064100651006610067100681006910070100711007210073100741007510076100771007810079100801008110082100831008410085100861008710088100891009010091100921009310094100951009610097100981009910100101011010210103101041010510106101071010810109101101011110112101131011410115101161011710118101191012010121101221012310124101251012610127101281012910130101311013210133101341013510136101371013810139101401014110142101431014410145101461014710148101491015010151101521015310154101551015610157101581015910160101611016210163101641016510166101671016810169101701017110172101731017410175101761017710178101791018010181101821018310184101851018610187101881018910190101911019210193101941019510196101971019810199102001020110202102031020410205102061020710208102091021010211102121021310214102151021610217102181021910220102211022210223102241022510226102271022810229102301023110232102331023410235102361023710238102391024010241102421024310244102451024610247102481024910250102511025210253102541025510256102571025810259102601026110262102631026410265102661026710268102691027010271102721027310274102751027610277102781027910280102811028210283102841028510286102871028810289102901029110292102931029410295102961029710298102991030010301103021030310304103051030610307103081030910310103111031210313103141031510316103171031810319103201032110322103231032410325103261032710328103291033010331103321033310334103351033610337103381033910340103411034210343103441034510346103471034810349103501035110352103531035410355103561035710358103591036010361103621036310364103651036610367103681036910370103711037210373103741037510376103771037810379103801038110382103831038410385103861038710388103891039010391103921039310394103951039610397103981039910400104011040210403104041040510406104071040810409104101041110412104131041410415104161041710418104191042010421104221042310424104251042610427104281042910430104311043210433104341043510436104371043810439104401044110442104431044410445104461044710448104491045010451104521045310454104551045610457104581045910460104611046210463104641046510466104671046810469104701047110472104731047410475104761047710478104791048010481104821048310484104851048610487104881048910490104911049210493104941049510496104971049810499105001050110502105031050410505105061050710508105091051010511105121051310514105151051610517105181051910520105211052210523105241052510526105271052810529105301053110532105331053410535105361053710538105391054010541105421054310544105451054610547105481054910550105511055210553105541055510556105571055810559105601056110562105631056410565105661056710568105691057010571105721057310574105751057610577105781057910580105811058210583105841058510586105871058810589105901059110592105931059410595105961059710598105991060010601106021060310604106051060610607106081060910610106111061210613106141061510616106171061810619106201062110622106231062410625106261062710628106291063010631106321063310634106351063610637106381063910640106411064210643106441064510646106471064810649106501065110652106531065410655106561065710658106591066010661106621066310664106651066610667106681066910670106711067210673106741067510676106771067810679106801068110682106831068410685106861068710688106891069010691106921069310694106951069610697106981069910700107011070210703107041070510706107071070810709107101071110712107131071410715107161071710718107191072010721107221072310724107251072610727107281072910730107311073210733107341073510736107371073810739107401074110742107431074410745107461074710748107491075010751107521075310754107551075610757107581075910760107611076210763107641076510766107671076810769107701077110772107731077410775107761077710778107791078010781107821078310784107851078610787107881078910790107911079210793107941079510796107971079810799108001080110802108031080410805108061080710808108091081010811108121081310814108151081610817108181081910820108211082210823108241082510826108271082810829108301083110832108331083410835108361083710838108391084010841108421084310844108451084610847108481084910850108511085210853108541085510856108571085810859108601086110862108631086410865108661086710868108691087010871108721087310874108751087610877108781087910880108811088210883108841088510886108871088810889108901089110892108931089410895108961089710898108991090010901109021090310904109051090610907109081090910910109111091210913109141091510916109171091810919109201092110922109231092410925109261092710928109291093010931109321093310934109351093610937109381093910940109411094210943109441094510946109471094810949109501095110952109531095410955109561095710958109591096010961109621096310964109651096610967109681096910970109711097210973109741097510976109771097810979109801098110982109831098410985109861098710988109891099010991109921099310994109951099610997109981099911000110011100211003110041100511006110071100811009110101101111012110131101411015110161101711018110191102011021110221102311024110251102611027110281102911030110311103211033110341103511036110371103811039110401104111042110431104411045110461104711048110491105011051110521105311054110551105611057110581105911060110611106211063110641106511066110671106811069110701107111072110731107411075110761107711078110791108011081110821108311084110851108611087110881108911090110911109211093110941109511096110971109811099111001110111102111031110411105111061110711108111091111011111111121111311114111151111611117111181111911120111211112211123111241112511126111271112811129111301113111132111331113411135111361113711138111391114011141111421114311144111451114611147111481114911150111511115211153111541115511156111571115811159111601116111162111631116411165111661116711168111691117011171111721117311174111751117611177111781117911180111811118211183111841118511186111871118811189111901119111192111931119411195111961119711198111991120011201112021120311204112051120611207112081120911210112111121211213112141121511216112171121811219112201122111222112231122411225112261122711228112291123011231112321123311234112351123611237112381123911240112411124211243112441124511246112471124811249112501125111252112531125411255112561125711258112591126011261112621126311264112651126611267112681126911270112711127211273112741127511276112771127811279112801128111282112831128411285112861128711288112891129011291112921129311294112951129611297112981129911300113011130211303113041130511306113071130811309113101131111312113131131411315113161131711318113191132011321113221132311324113251132611327113281132911330113311133211333113341133511336113371133811339113401134111342113431134411345113461134711348113491135011351113521135311354113551135611357113581135911360113611136211363113641136511366113671136811369113701137111372113731137411375113761137711378113791138011381113821138311384113851138611387113881138911390113911139211393113941139511396113971139811399114001140111402114031140411405114061140711408114091141011411114121141311414114151141611417114181141911420114211142211423114241142511426114271142811429114301143111432114331143411435114361143711438114391144011441114421144311444114451144611447114481144911450114511145211453114541145511456114571145811459114601146111462114631146411465114661146711468114691147011471114721147311474114751147611477114781147911480114811148211483114841148511486114871148811489114901149111492114931149411495114961149711498114991150011501115021150311504115051150611507115081150911510115111151211513115141151511516115171151811519115201152111522115231152411525115261152711528115291153011531115321153311534115351153611537115381153911540115411154211543115441154511546115471154811549115501155111552115531155411555115561155711558115591156011561115621156311564115651156611567115681156911570115711157211573115741157511576115771157811579115801158111582115831158411585115861158711588115891159011591115921159311594115951159611597115981159911600116011160211603116041160511606116071160811609116101161111612116131161411615116161161711618116191162011621116221162311624116251162611627116281162911630116311163211633116341163511636116371163811639116401164111642116431164411645116461164711648116491165011651116521165311654116551165611657116581165911660116611166211663116641166511666116671166811669116701167111672116731167411675116761167711678116791168011681116821168311684116851168611687116881168911690116911169211693116941169511696116971169811699117001170111702117031170411705117061170711708117091171011711117121171311714117151171611717117181171911720117211172211723117241172511726117271172811729117301173111732117331173411735117361173711738117391174011741117421174311744117451174611747117481174911750117511175211753117541175511756117571175811759117601176111762117631176411765117661176711768117691177011771117721177311774117751177611777117781177911780117811178211783117841178511786117871178811789117901179111792117931179411795117961179711798117991180011801118021180311804118051180611807118081180911810118111181211813118141181511816118171181811819118201182111822118231182411825118261182711828118291183011831118321183311834118351183611837118381183911840118411184211843118441184511846118471184811849118501185111852118531185411855118561185711858118591186011861118621186311864118651186611867118681186911870118711187211873118741187511876118771187811879118801188111882118831188411885118861188711888118891189011891118921189311894118951189611897118981189911900119011190211903119041190511906119071190811909119101191111912119131191411915119161191711918119191192011921119221192311924119251192611927119281192911930119311193211933119341193511936119371193811939119401194111942119431194411945119461194711948119491195011951119521195311954119551195611957119581195911960119611196211963119641196511966119671196811969119701197111972119731197411975119761197711978119791198011981119821198311984119851198611987119881198911990119911199211993119941199511996119971199811999120001200112002120031200412005120061200712008120091201012011120121201312014120151201612017120181201912020120211202212023120241202512026120271202812029120301203112032120331203412035120361203712038120391204012041120421204312044120451204612047120481204912050120511205212053120541205512056120571205812059120601206112062120631206412065120661206712068120691207012071120721207312074120751207612077120781207912080120811208212083120841208512086120871208812089120901209112092120931209412095120961209712098120991210012101121021210312104121051210612107121081210912110121111211212113121141211512116121171211812119121201212112122121231212412125121261212712128121291213012131121321213312134121351213612137121381213912140121411214212143121441214512146121471214812149121501215112152121531215412155121561215712158121591216012161121621216312164121651216612167121681216912170121711217212173121741217512176121771217812179121801218112182121831218412185121861218712188121891219012191121921219312194121951219612197121981219912200122011220212203122041220512206122071220812209122101221112212122131221412215122161221712218122191222012221122221222312224122251222612227122281222912230122311223212233122341223512236122371223812239122401224112242122431224412245122461224712248122491225012251122521225312254122551225612257122581225912260122611226212263122641226512266122671226812269122701227112272122731227412275122761227712278122791228012281122821228312284122851228612287122881228912290122911229212293122941229512296122971229812299123001230112302123031230412305123061230712308123091231012311123121231312314123151231612317123181231912320123211232212323123241232512326123271232812329123301233112332123331233412335123361233712338123391234012341123421234312344123451234612347123481234912350123511235212353123541235512356123571235812359123601236112362123631236412365123661236712368123691237012371123721237312374123751237612377123781237912380123811238212383123841238512386123871238812389123901239112392123931239412395123961239712398123991240012401124021240312404124051240612407124081240912410124111241212413124141241512416124171241812419124201242112422124231242412425124261242712428124291243012431124321243312434124351243612437124381243912440124411244212443124441244512446124471244812449124501245112452124531245412455124561245712458124591246012461124621246312464124651246612467124681246912470124711247212473124741247512476124771247812479124801248112482124831248412485124861248712488124891249012491124921249312494124951249612497124981249912500125011250212503125041250512506125071250812509125101251112512125131251412515125161251712518125191252012521125221252312524125251252612527125281252912530125311253212533125341253512536125371253812539125401254112542125431254412545125461254712548125491255012551125521255312554125551255612557125581255912560125611256212563125641256512566125671256812569125701257112572125731257412575125761257712578125791258012581125821258312584125851258612587125881258912590125911259212593125941259512596125971259812599126001260112602126031260412605126061260712608126091261012611126121261312614126151261612617126181261912620126211262212623126241262512626126271262812629126301263112632126331263412635126361263712638126391264012641126421264312644126451264612647126481264912650126511265212653126541265512656126571265812659126601266112662126631266412665126661266712668126691267012671126721267312674126751267612677126781267912680126811268212683126841268512686126871268812689126901269112692126931269412695126961269712698126991270012701127021270312704127051270612707127081270912710127111271212713127141271512716127171271812719127201272112722127231272412725127261272712728127291273012731127321273312734127351273612737127381273912740127411274212743127441274512746127471274812749127501275112752127531275412755127561275712758127591276012761127621276312764127651276612767127681276912770127711277212773127741277512776127771277812779127801278112782127831278412785127861278712788127891279012791127921279312794127951279612797127981279912800128011280212803128041280512806128071280812809128101281112812128131281412815128161281712818128191282012821128221282312824128251282612827128281282912830128311283212833128341283512836128371283812839128401284112842128431284412845128461284712848128491285012851128521285312854128551285612857128581285912860128611286212863128641286512866128671286812869128701287112872128731287412875128761287712878128791288012881128821288312884128851288612887128881288912890128911289212893128941289512896128971289812899129001290112902129031290412905129061290712908129091291012911129121291312914129151291612917129181291912920129211292212923129241292512926129271292812929129301293112932129331293412935129361293712938129391294012941129421294312944129451294612947129481294912950129511295212953129541295512956129571295812959129601296112962129631296412965129661296712968129691297012971129721297312974129751297612977129781297912980129811298212983129841298512986129871298812989129901299112992129931299412995129961299712998129991300013001130021300313004130051300613007130081300913010130111301213013130141301513016130171301813019130201302113022130231302413025130261302713028130291303013031130321303313034130351303613037130381303913040130411304213043130441304513046130471304813049130501305113052130531305413055130561305713058130591306013061130621306313064130651306613067130681306913070130711307213073130741307513076130771307813079130801308113082130831308413085130861308713088130891309013091130921309313094130951309613097130981309913100131011310213103131041310513106131071310813109131101311113112131131311413115131161311713118131191312013121131221312313124131251312613127131281312913130131311313213133131341313513136131371313813139131401314113142131431314413145131461314713148131491315013151131521315313154131551315613157131581315913160131611316213163131641316513166131671316813169131701317113172131731317413175131761317713178131791318013181131821318313184131851318613187131881318913190131911319213193131941319513196131971319813199132001320113202132031320413205132061320713208132091321013211132121321313214132151321613217132181321913220132211322213223132241322513226132271322813229132301323113232132331323413235132361323713238132391324013241132421324313244132451324613247132481324913250132511325213253132541325513256132571325813259132601326113262132631326413265132661326713268132691327013271132721327313274132751327613277132781327913280132811328213283132841328513286132871328813289132901329113292132931329413295132961329713298132991330013301133021330313304133051330613307133081330913310133111331213313133141331513316133171331813319133201332113322133231332413325133261332713328133291333013331133321333313334133351333613337133381333913340133411334213343133441334513346133471334813349133501335113352133531335413355133561335713358133591336013361133621336313364133651336613367133681336913370133711337213373133741337513376133771337813379133801338113382133831338413385133861338713388133891339013391133921339313394133951339613397133981339913400134011340213403134041340513406134071340813409134101341113412134131341413415134161341713418134191342013421134221342313424134251342613427134281342913430134311343213433134341343513436134371343813439134401344113442134431344413445134461344713448134491345013451134521345313454134551345613457134581345913460134611346213463134641346513466134671346813469134701347113472134731347413475134761347713478134791348013481134821348313484134851348613487134881348913490134911349213493134941349513496134971349813499135001350113502135031350413505135061350713508135091351013511135121351313514135151351613517135181351913520135211352213523135241352513526135271352813529135301353113532135331353413535135361353713538135391354013541135421354313544135451354613547135481354913550135511355213553135541355513556135571355813559135601356113562135631356413565135661356713568135691357013571135721357313574135751357613577135781357913580135811358213583135841358513586135871358813589135901359113592135931359413595135961359713598135991360013601136021360313604136051360613607136081360913610136111361213613136141361513616136171361813619136201362113622136231362413625136261362713628136291363013631136321363313634136351363613637136381363913640136411364213643136441364513646136471364813649136501365113652136531365413655136561365713658136591366013661136621366313664136651366613667136681366913670136711367213673136741367513676136771367813679136801368113682136831368413685136861368713688136891369013691136921369313694136951369613697136981369913700137011370213703137041370513706137071370813709137101371113712137131371413715137161371713718137191372013721137221372313724137251372613727137281372913730137311373213733137341373513736137371373813739137401374113742137431374413745137461374713748137491375013751137521375313754137551375613757137581375913760137611376213763137641376513766137671376813769137701377113772137731377413775137761377713778137791378013781137821378313784137851378613787137881378913790137911379213793137941379513796137971379813799138001380113802138031380413805138061380713808138091381013811138121381313814138151381613817138181381913820138211382213823138241382513826138271382813829138301383113832138331383413835138361383713838138391384013841138421384313844138451384613847138481384913850138511385213853138541385513856138571385813859138601386113862138631386413865138661386713868138691387013871138721387313874138751387613877138781387913880138811388213883138841388513886138871388813889138901389113892138931389413895138961389713898138991390013901139021390313904139051390613907139081390913910139111391213913139141391513916139171391813919139201392113922139231392413925139261392713928139291393013931139321393313934139351393613937139381393913940139411394213943139441394513946139471394813949139501395113952139531395413955139561395713958139591396013961139621396313964139651396613967139681396913970139711397213973139741397513976139771397813979139801398113982139831398413985139861398713988139891399013991139921399313994139951399613997139981399914000140011400214003140041400514006140071400814009140101401114012140131401414015140161401714018140191402014021140221402314024140251402614027140281402914030140311403214033140341403514036140371403814039140401404114042140431404414045140461404714048140491405014051140521405314054140551405614057140581405914060140611406214063140641406514066140671406814069140701407114072140731407414075140761407714078140791408014081140821408314084140851408614087140881408914090140911409214093140941409514096140971409814099141001410114102141031410414105141061410714108141091411014111141121411314114141151411614117141181411914120141211412214123141241412514126141271412814129141301413114132141331413414135141361413714138141391414014141141421414314144141451414614147141481414914150141511415214153141541415514156141571415814159141601416114162141631416414165141661416714168141691417014171141721417314174141751417614177141781417914180141811418214183141841418514186141871418814189141901419114192141931419414195141961419714198141991420014201142021420314204142051420614207142081420914210142111421214213142141421514216142171421814219142201422114222142231422414225142261422714228142291423014231142321423314234142351423614237142381423914240142411424214243142441424514246142471424814249142501425114252142531425414255142561425714258142591426014261142621426314264142651426614267142681426914270142711427214273142741427514276142771427814279142801428114282142831428414285142861428714288142891429014291142921429314294142951429614297142981429914300143011430214303143041430514306143071430814309143101431114312143131431414315143161431714318143191432014321143221432314324143251432614327143281432914330143311433214333143341433514336143371433814339143401434114342143431434414345143461434714348143491435014351143521435314354143551435614357143581435914360143611436214363143641436514366143671436814369143701437114372143731437414375143761437714378143791438014381143821438314384143851438614387143881438914390143911439214393143941439514396143971439814399144001440114402144031440414405144061440714408144091441014411144121441314414144151441614417144181441914420144211442214423144241442514426144271442814429144301443114432144331443414435144361443714438144391444014441144421444314444144451444614447144481444914450144511445214453144541445514456144571445814459144601446114462144631446414465144661446714468144691447014471144721447314474144751447614477144781447914480144811448214483144841448514486144871448814489144901449114492144931449414495144961449714498144991450014501145021450314504145051450614507145081450914510145111451214513145141451514516145171451814519145201452114522145231452414525145261452714528145291453014531145321453314534145351453614537145381453914540145411454214543145441454514546145471454814549145501455114552145531455414555145561455714558145591456014561145621456314564145651456614567145681456914570145711457214573145741457514576145771457814579145801458114582145831458414585145861458714588145891459014591145921459314594145951459614597145981459914600146011460214603146041460514606146071460814609146101461114612146131461414615146161461714618146191462014621146221462314624146251462614627146281462914630146311463214633146341463514636146371463814639146401464114642146431464414645146461464714648146491465014651146521465314654146551465614657146581465914660146611466214663146641466514666146671466814669146701467114672146731467414675146761467714678146791468014681146821468314684146851468614687146881468914690146911469214693146941469514696146971469814699147001470114702147031470414705147061470714708147091471014711147121471314714147151471614717147181471914720147211472214723147241472514726147271472814729147301473114732147331473414735147361473714738147391474014741147421474314744147451474614747147481474914750147511475214753147541475514756147571475814759147601476114762147631476414765147661476714768147691477014771147721477314774147751477614777147781477914780147811478214783147841478514786147871478814789147901479114792147931479414795147961479714798147991480014801148021480314804148051480614807148081480914810148111481214813148141481514816148171481814819148201482114822148231482414825148261482714828148291483014831148321483314834148351483614837148381483914840148411484214843148441484514846148471484814849148501485114852148531485414855148561485714858148591486014861148621486314864148651486614867148681486914870148711487214873148741487514876148771487814879148801488114882148831488414885148861488714888148891489014891148921489314894148951489614897148981489914900149011490214903149041490514906149071490814909149101491114912149131491414915149161491714918149191492014921149221492314924149251492614927149281492914930149311493214933149341493514936149371493814939149401494114942149431494414945149461494714948149491495014951149521495314954149551495614957149581495914960149611496214963149641496514966149671496814969149701497114972149731497414975149761497714978149791498014981149821498314984149851498614987149881498914990149911499214993149941499514996149971499814999150001500115002150031500415005150061500715008150091501015011150121501315014150151501615017150181501915020150211502215023150241502515026150271502815029150301503115032150331503415035150361503715038150391504015041150421504315044150451504615047150481504915050150511505215053150541505515056150571505815059150601506115062150631506415065150661506715068150691507015071150721507315074150751507615077150781507915080150811508215083150841508515086150871508815089150901509115092150931509415095150961509715098150991510015101151021510315104151051510615107151081510915110151111511215113151141511515116151171511815119151201512115122151231512415125151261512715128151291513015131151321513315134151351513615137151381513915140151411514215143151441514515146151471514815149151501515115152151531515415155151561515715158151591516015161151621516315164151651516615167151681516915170151711517215173151741517515176151771517815179151801518115182151831518415185151861518715188151891519015191151921519315194151951519615197151981519915200152011520215203152041520515206152071520815209152101521115212152131521415215152161521715218152191522015221152221522315224152251522615227152281522915230152311523215233152341523515236152371523815239152401524115242152431524415245152461524715248152491525015251152521525315254152551525615257152581525915260152611526215263152641526515266152671526815269152701527115272152731527415275152761527715278152791528015281152821528315284152851528615287152881528915290152911529215293152941529515296152971529815299153001530115302153031530415305153061530715308153091531015311153121531315314153151531615317153181531915320153211532215323153241532515326153271532815329a';

expect = true; 
actual = re.test(s);

reportCompare(expect, actual, status);
