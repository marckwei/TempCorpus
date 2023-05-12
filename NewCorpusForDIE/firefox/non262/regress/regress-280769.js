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
var BUGNUMBER = 280769;
var summary = 'Do not crash on overflow of 32K boundary in regexp bytecode jump offset';
var actual = 'No Crash';
var expect = 'No Crash';
var status;
var result;

printBugNumber(BUGNUMBER);
printStatus (summary);

status = summary + ' ' + inSection(1) + ' /1|...|6779/.exec("6777") ';

var re = /1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39|40|41|42|43|44|45|46|47|48|49|50|51|52|53|54|55|56|57|58|59|60|61|62|63|64|65|66|67|68|69|70|71|72|73|74|75|76|77|78|79|80|81|82|83|84|85|86|87|88|89|90|91|92|93|94|95|96|97|98|99|100|101|102|103|104|105|106|107|108|109|110|111|112|113|114|115|116|117|118|119|120|121|122|123|124|125|126|127|128|129|130|131|132|133|134|135|136|137|138|139|140|141|142|143|144|145|146|147|148|149|150|151|152|153|154|155|156|157|158|159|160|161|162|163|164|165|166|167|168|169|170|171|172|173|174|175|176|177|178|179|180|181|182|183|184|185|186|187|188|189|190|191|192|193|194|195|196|197|198|199|200|201|202|203|204|205|206|207|208|209|210|211|212|213|214|215|216|217|218|219|220|221|222|223|224|225|226|227|228|229|230|231|232|233|234|235|236|237|238|239|240|241|242|243|244|245|246|247|248|249|250|251|252|253|254|255|256|257|258|259|260|261|262|263|264|265|266|267|268|269|270|271|272|273|274|275|276|277|278|279|280|281|282|283|284|285|286|287|288|289|290|291|292|293|294|295|296|297|298|299|300|301|302|303|304|305|306|307|308|309|310|311|312|313|314|315|316|317|318|319|320|321|322|323|324|325|326|327|328|329|330|331|332|333|334|335|336|337|338|339|340|341|342|343|344|345|346|347|348|349|350|351|352|353|354|355|356|357|358|359|360|361|362|363|364|365|366|367|368|369|370|371|372|373|374|375|376|377|378|379|380|381|382|383|384|385|386|387|388|389|390|391|392|393|394|395|396|397|398|399|400|401|402|403|404|405|406|407|408|409|410|411|412|413|414|415|416|417|418|419|420|421|422|423|424|425|426|427|428|429|430|431|432|433|434|435|436|437|438|439|440|441|442|443|444|445|446|447|448|449|450|451|452|453|454|455|456|457|458|459|460|461|462|463|464|465|466|467|468|469|470|471|472|473|474|475|476|477|478|479|480|481|482|483|484|485|486|487|488|489|490|491|492|493|494|495|496|497|498|499|500|501|502|503|504|505|506|507|508|509|510|511|512|513|514|515|516|517|518|519|520|521|522|523|524|525|526|527|528|529|530|531|532|533|534|535|536|537|538|539|540|541|542|543|544|545|546|547|548|549|550|551|552|553|554|555|556|557|558|559|560|561|562|563|564|565|566|567|568|569|570|571|572|573|574|575|576|577|578|579|580|581|582|583|584|585|586|587|588|589|590|591|592|593|594|595|596|597|598|599|600|601|602|603|604|605|606|607|608|609|610|611|612|613|614|615|616|617|618|619|620|621|622|623|624|625|626|627|628|629|630|631|632|633|634|635|636|637|638|639|640|641|642|643|644|645|646|647|648|649|650|651|652|653|654|655|656|657|658|659|660|661|662|663|664|665|666|667|668|669|670|671|672|673|674|675|676|677|678|679|680|681|682|683|684|685|686|687|688|689|690|691|692|693|694|695|696|697|698|699|700|701|702|703|704|705|706|707|708|709|710|711|712|713|714|715|716|717|718|719|720|721|722|723|724|725|726|727|728|729|730|731|732|733|734|735|736|737|738|739|740|741|742|743|744|745|746|747|748|749|750|751|752|753|754|755|756|757|758|759|760|761|762|763|764|765|766|767|768|769|770|771|772|773|774|775|776|777|778|779|780|781|782|783|784|785|786|787|788|789|790|791|792|793|794|795|796|797|798|799|800|801|802|803|804|805|806|807|808|809|810|811|812|813|814|815|816|817|818|819|820|821|822|823|824|825|826|827|828|829|830|831|832|833|834|835|836|837|838|839|840|841|842|843|844|845|846|847|848|849|850|851|852|853|854|855|856|857|858|859|860|861|862|863|864|865|866|867|868|869|870|871|872|873|874|875|876|877|878|879|880|881|882|883|884|885|886|887|888|889|890|891|892|893|894|895|896|897|898|899|900|901|902|903|904|905|906|907|908|909|910|911|912|913|914|915|916|917|918|919|920|921|922|923|924|925|926|927|928|929|930|931|932|933|934|935|936|937|938|939|940|941|942|943|944|945|946|947|948|949|950|951|952|953|954|955|956|957|958|959|960|961|962|963|964|965|966|967|968|969|970|971|972|973|974|975|976|977|978|979|980|981|982|983|984|985|986|987|988|989|990|991|992|993|994|995|996|997|998|999|1000|1001|1002|1003|1004|1005|1006|1007|1008|1009|1010|1011|1012|1013|1014|1015|1016|1017|1018|1019|1020|1021|1022|1023|1024|1025|1026|1027|1028|1029|1030|1031|1032|1033|1034|1035|1036|1037|1038|1039|1040|1041|1042|1043|1044|1045|1046|1047|1048|1049|1050|1051|1052|1053|1054|1055|1056|1057|1058|1059|1060|1061|1062|1063|1064|1065|1066|1067|1068|1069|1070|1071|1072|1073|1074|1075|1076|1077|1078|1079|1080|1081|1082|1083|1084|1085|1086|1087|1088|1089|1090|1091|1092|1093|1094|1095|1096|1097|1098|1099|1100|1101|1102|1103|1104|1105|1106|1107|1108|1109|1110|1111|1112|1113|1114|1115|1116|1117|1118|1119|1120|1121|1122|1123|1124|1125|1126|1127|1128|1129|1130|1131|1132|1133|1134|1135|1136|1137|1138|1139|1140|1141|1142|1143|1144|1145|1146|1147|1148|1149|1150|1151|1152|1153|1154|1155|1156|1157|1158|1159|1160|1161|1162|1163|1164|1165|1166|1167|1168|1169|1170|1171|1172|1173|1174|1175|1176|1177|1178|1179|1180|1181|1182|1183|1184|1185|1186|1187|1188|1189|1190|1191|1192|1193|1194|1195|1196|1197|1198|1199|1200|1201|1202|1203|1204|1205|1206|1207|1208|1209|1210|1211|1212|1213|1214|1215|1216|1217|1218|1219|1220|1221|1222|1223|1224|1225|1226|1227|1228|1229|1230|1231|1232|1233|1234|1235|1236|1237|1238|1239|1240|1241|1242|1243|1244|1245|1246|1247|1248|1249|1250|1251|1252|1253|1254|1255|1256|1257|1258|1259|1260|1261|1262|1263|1264|1265|1266|1267|1268|1269|1270|1271|1272|1273|1274|1275|1276|1277|1278|1279|1280|1281|1282|1283|1284|1285|1286|1287|1288|1289|1290|1291|1292|1293|1294|1295|1296|1297|1298|1299|1300|1301|1302|1303|1304|1305|1306|1307|1308|1309|1310|1311|1312|1313|1314|1315|1316|1317|1318|1319|1320|1321|1322|1323|1324|1325|1326|1327|1328|1329|1330|1331|1332|1333|1334|1335|1336|1337|1338|1339|1340|1341|1342|1343|1344|1345|1346|1347|1348|1349|1350|1351|1352|1353|1354|1355|1356|1357|1358|1359|1360|1361|1362|1363|1364|1365|1366|1367|1368|1369|1370|1371|1372|1373|1374|1375|1376|1377|1378|1379|1380|1381|1382|1383|1384|1385|1386|1387|1388|1389|1390|1391|1392|1393|1394|1395|1396|1397|1398|1399|1400|1401|1402|1403|1404|1405|1406|1407|1408|1409|1410|1411|1412|1413|1414|1415|1416|1417|1418|1419|1420|1421|1422|1423|1424|1425|1426|1427|1428|1429|1430|1431|1432|1433|1434|1435|1436|1437|1438|1439|1440|1441|1442|1443|1444|1445|1446|1447|1448|1449|1450|1451|1452|1453|1454|1455|1456|1457|1458|1459|1460|1461|1462|1463|1464|1465|1466|1467|1468|1469|1470|1471|1472|1473|1474|1475|1476|1477|1478|1479|1480|1481|1482|1483|1484|1485|1486|1487|1488|1489|1490|1491|1492|1493|1494|1495|1496|1497|1498|1499|1500|1501|1502|1503|1504|1505|1506|1507|1508|1509|1510|1511|1512|1513|1514|1515|1516|1517|1518|1519|1520|1521|1522|1523|1524|1525|1526|1527|1528|1529|1530|1531|1532|1533|1534|1535|1536|1537|1538|1539|1540|1541|1542|1543|1544|1545|1546|1547|1548|1549|1550|1551|1552|1553|1554|1555|1556|1557|1558|1559|1560|1561|1562|1563|1564|1565|1566|1567|1568|1569|1570|1571|1572|1573|1574|1575|1576|1577|1578|1579|1580|1581|1582|1583|1584|1585|1586|1587|1588|1589|1590|1591|1592|1593|1594|1595|1596|1597|1598|1599|1600|1601|1602|1603|1604|1605|1606|1607|1608|1609|1610|1611|1612|1613|1614|1615|1616|1617|1618|1619|1620|1621|1622|1623|1624|1625|1626|1627|1628|1629|1630|1631|1632|1633|1634|1635|1636|1637|1638|1639|1640|1641|1642|1643|1644|1645|1646|1647|1648|1649|1650|1651|1652|1653|1654|1655|1656|1657|1658|1659|1660|1661|1662|1663|1664|1665|1666|1667|1668|1669|1670|1671|1672|1673|1674|1675|1676|1677|1678|1679|1680|1681|1682|1683|1684|1685|1686|1687|1688|1689|1690|1691|1692|1693|1694|1695|1696|1697|1698|1699|1700|1701|1702|1703|1704|1705|1706|1707|1708|1709|1710|1711|1712|1713|1714|1715|1716|1717|1718|1719|1720|1721|1722|1723|1724|1725|1726|1727|1728|1729|1730|1731|1732|1733|1734|1735|1736|1737|1738|1739|1740|1741|1742|1743|1744|1745|1746|1747|1748|1749|1750|1751|1752|1753|1754|1755|1756|1757|1758|1759|1760|1761|1762|1763|1764|1765|1766|1767|1768|1769|1770|1771|1772|1773|1774|1775|1776|1777|1778|1779|1780|1781|1782|1783|1784|1785|1786|1787|1788|1789|1790|1791|1792|1793|1794|1795|1796|1797|1798|1799|1800|1801|1802|1803|1804|1805|1806|1807|1808|1809|1810|1811|1812|1813|1814|1815|1816|1817|1818|1819|1820|1821|1822|1823|1824|1825|1826|1827|1828|1829|1830|1831|1832|1833|1834|1835|1836|1837|1838|1839|1840|1841|1842|1843|1844|1845|1846|1847|1848|1849|1850|1851|1852|1853|1854|1855|1856|1857|1858|1859|1860|1861|1862|1863|1864|1865|1866|1867|1868|1869|1870|1871|1872|1873|1874|1875|1876|1877|1878|1879|1880|1881|1882|1883|1884|1885|1886|1887|1888|1889|1890|1891|1892|1893|1894|1895|1896|1897|1898|1899|1900|1901|1902|1903|1904|1905|1906|1907|1908|1909|1910|1911|1912|1913|1914|1915|1916|1917|1918|1919|1920|1921|1922|1923|1924|1925|1926|1927|1928|1929|1930|1931|1932|1933|1934|1935|1936|1937|1938|1939|1940|1941|1942|1943|1944|1945|1946|1947|1948|1949|1950|1951|1952|1953|1954|1955|1956|1957|1958|1959|1960|1961|1962|1963|1964|1965|1966|1967|1968|1969|1970|1971|1972|1973|1974|1975|1976|1977|1978|1979|1980|1981|1982|1983|1984|1985|1986|1987|1988|1989|1990|1991|1992|1993|1994|1995|1996|1997|1998|1999|2000|2001|2002|2003|2004|2005|2006|2007|2008|2009|2010|2011|2012|2013|2014|2015|2016|2017|2018|2019|2020|2021|2022|2023|2024|2025|2026|2027|2028|2029|2030|2031|2032|2033|2034|2035|2036|2037|2038|2039|2040|2041|2042|2043|2044|2045|2046|2047|2048|2049|2050|2051|2052|2053|2054|2055|2056|2057|2058|2059|2060|2061|2062|2063|2064|2065|2066|2067|2068|2069|2070|2071|2072|2073|2074|2075|2076|2077|2078|2079|2080|2081|2082|2083|2084|2085|2086|2087|2088|2089|2090|2091|2092|2093|2094|2095|2096|2097|2098|2099|2100|2101|2102|2103|2104|2105|2106|2107|2108|2109|2110|2111|2112|2113|2114|2115|2116|2117|2118|2119|2120|2121|2122|2123|2124|2125|2126|2127|2128|2129|2130|2131|2132|2133|2134|2135|2136|2137|2138|2139|2140|2141|2142|2143|2144|2145|2146|2147|2148|2149|2150|2151|2152|2153|2154|2155|2156|2157|2158|2159|2160|2161|2162|2163|2164|2165|2166|2167|2168|2169|2170|2171|2172|2173|2174|2175|2176|2177|2178|2179|2180|2181|2182|2183|2184|2185|2186|2187|2188|2189|2190|2191|2192|2193|2194|2195|2196|2197|2198|2199|2200|2201|2202|2203|2204|2205|2206|2207|2208|2209|2210|2211|2212|2213|2214|2215|2216|2217|2218|2219|2220|2221|2222|2223|2224|2225|2226|2227|2228|2229|2230|2231|2232|2233|2234|2235|2236|2237|2238|2239|2240|2241|2242|2243|2244|2245|2246|2247|2248|2249|2250|2251|2252|2253|2254|2255|2256|2257|2258|2259|2260|2261|2262|2263|2264|2265|2266|2267|2268|2269|2270|2271|2272|2273|2274|2275|2276|2277|2278|2279|2280|2281|2282|2283|2284|2285|2286|2287|2288|2289|2290|2291|2292|2293|2294|2295|2296|2297|2298|2299|2300|2301|2302|2303|2304|2305|2306|2307|2308|2309|2310|2311|2312|2313|2314|2315|2316|2317|2318|2319|2320|2321|2322|2323|2324|2325|2326|2327|2328|2329|2330|2331|2332|2333|2334|2335|2336|2337|2338|2339|2340|2341|2342|2343|2344|2345|2346|2347|2348|2349|2350|2351|2352|2353|2354|2355|2356|2357|2358|2359|2360|2361|2362|2363|2364|2365|2366|2367|2368|2369|2370|2371|2372|2373|2374|2375|2376|2377|2378|2379|2380|2381|2382|2383|2384|2385|2386|2387|2388|2389|2390|2391|2392|2393|2394|2395|2396|2397|2398|2399|2400|2401|2402|2403|2404|2405|2406|2407|2408|2409|2410|2411|2412|2413|2414|2415|2416|2417|2418|2419|2420|2421|2422|2423|2424|2425|2426|2427|2428|2429|2430|2431|2432|2433|2434|2435|2436|2437|2438|2439|2440|2441|2442|2443|2444|2445|2446|2447|2448|2449|2450|2451|2452|2453|2454|2455|2456|2457|2458|2459|2460|2461|2462|2463|2464|2465|2466|2467|2468|2469|2470|2471|2472|2473|2474|2475|2476|2477|2478|2479|2480|2481|2482|2483|2484|2485|2486|2487|2488|2489|2490|2491|2492|2493|2494|2495|2496|2497|2498|2499|2500|2501|2502|2503|2504|2505|2506|2507|2508|2509|2510|2511|2512|2513|2514|2515|2516|2517|2518|2519|2520|2521|2522|2523|2524|2525|2526|2527|2528|2529|2530|2531|2532|2533|2534|2535|2536|2537|2538|2539|2540|2541|2542|2543|2544|2545|2546|2547|2548|2549|2550|2551|2552|2553|2554|2555|2556|2557|2558|2559|2560|2561|2562|2563|2564|2565|2566|2567|2568|2569|2570|2571|2572|2573|2574|2575|2576|2577|2578|2579|2580|2581|2582|2583|2584|2585|2586|2587|2588|2589|2590|2591|2592|2593|2594|2595|2596|2597|2598|2599|2600|2601|2602|2603|2604|2605|2606|2607|2608|2609|2610|2611|2612|2613|2614|2615|2616|2617|2618|2619|2620|2621|2622|2623|2624|2625|2626|2627|2628|2629|2630|2631|2632|2633|2634|2635|2636|2637|2638|2639|2640|2641|2642|2643|2644|2645|2646|2647|2648|2649|2650|2651|2652|2653|2654|2655|2656|2657|2658|2659|2660|2661|2662|2663|2664|2665|2666|2667|2668|2669|2670|2671|2672|2673|2674|2675|2676|2677|2678|2679|2680|2681|2682|2683|2684|2685|2686|2687|2688|2689|2690|2691|2692|2693|2694|2695|2696|2697|2698|2699|2700|2701|2702|2703|2704|2705|2706|2707|2708|2709|2710|2711|2712|2713|2714|2715|2716|2717|2718|2719|2720|2721|2722|2723|2724|2725|2726|2727|2728|2729|2730|2731|2732|2733|2734|2735|2736|2737|2738|2739|2740|2741|2742|2743|2744|2745|2746|2747|2748|2749|2750|2751|2752|2753|2754|2755|2756|2757|2758|2759|2760|2761|2762|2763|2764|2765|2766|2767|2768|2769|2770|2771|2772|2773|2774|2775|2776|2777|2778|2779|2780|2781|2782|2783|2784|2785|2786|2787|2788|2789|2790|2791|2792|2793|2794|2795|2796|2797|2798|2799|2800|2801|2802|2803|2804|2805|2806|2807|2808|2809|2810|2811|2812|2813|2814|2815|2816|2817|2818|2819|2820|2821|2822|2823|2824|2825|2826|2827|2828|2829|2830|2831|2832|2833|2834|2835|2836|2837|2838|2839|2840|2841|2842|2843|2844|2845|2846|2847|2848|2849|2850|2851|2852|2853|2854|2855|2856|2857|2858|2859|2860|2861|2862|2863|2864|2865|2866|2867|2868|2869|2870|2871|2872|2873|2874|2875|2876|2877|2878|2879|2880|2881|2882|2883|2884|2885|2886|2887|2888|2889|2890|2891|2892|2893|2894|2895|2896|2897|2898|2899|2900|2901|2902|2903|2904|2905|2906|2907|2908|2909|2910|2911|2912|2913|2914|2915|2916|2917|2918|2919|2920|2921|2922|2923|2924|2925|2926|2927|2928|2929|2930|2931|2932|2933|2934|2935|2936|2937|2938|2939|2940|2941|2942|2943|2944|2945|2946|2947|2948|2949|2950|2951|2952|2953|2954|2955|2956|2957|2958|2959|2960|2961|2962|2963|2964|2965|2966|2967|2968|2969|2970|2971|2972|2973|2974|2975|2976|2977|2978|2979|2980|2981|2982|2983|2984|2985|2986|2987|2988|2989|2990|2991|2992|2993|2994|2995|2996|2997|2998|2999|3000|3001|3002|3003|3004|3005|3006|3007|3008|3009|3010|3011|3012|3013|3014|3015|3016|3017|3018|3019|3020|3021|3022|3023|3024|3025|3026|3027|3028|3029|3030|3031|3032|3033|3034|3035|3036|3037|3038|3039|3040|3041|3042|3043|3044|3045|3046|3047|3048|3049|3050|3051|3052|3053|3054|3055|3056|3057|3058|3059|3060|3061|3062|3063|3064|3065|3066|3067|3068|3069|3070|3071|3072|3073|3074|3075|3076|3077|3078|3079|3080|3081|3082|3083|3084|3085|3086|3087|3088|3089|3090|3091|3092|3093|3094|3095|3096|3097|3098|3099|3100|3101|3102|3103|3104|3105|3106|3107|3108|3109|3110|3111|3112|3113|3114|3115|3116|3117|3118|3119|3120|3121|3122|3123|3124|3125|3126|3127|3128|3129|3130|3131|3132|3133|3134|3135|3136|3137|3138|3139|3140|3141|3142|3143|3144|3145|3146|3147|3148|3149|3150|3151|3152|3153|3154|3155|3156|3157|3158|3159|3160|3161|3162|3163|3164|3165|3166|3167|3168|3169|3170|3171|3172|3173|3174|3175|3176|3177|3178|3179|3180|3181|3182|3183|3184|3185|3186|3187|3188|3189|3190|3191|3192|3193|3194|3195|3196|3197|3198|3199|3200|3201|3202|3203|3204|3205|3206|3207|3208|3209|3210|3211|3212|3213|3214|3215|3216|3217|3218|3219|3220|3221|3222|3223|3224|3225|3226|3227|3228|3229|3230|3231|3232|3233|3234|3235|3236|3237|3238|3239|3240|3241|3242|3243|3244|3245|3246|3247|3248|3249|3250|3251|3252|3253|3254|3255|3256|3257|3258|3259|3260|3261|3262|3263|3264|3265|3266|3267|3268|3269|3270|3271|3272|3273|3274|3275|3276|3277|3278|3279|3280|3281|3282|3283|3284|3285|3286|3287|3288|3289|3290|3291|3292|3293|3294|3295|3296|3297|3298|3299|3300|3301|3302|3303|3304|3305|3306|3307|3308|3309|3310|3311|3312|3313|3314|3315|3316|3317|3318|3319|3320|3321|3322|3323|3324|3325|3326|3327|3328|3329|3330|3331|3332|3333|3334|3335|3336|3337|3338|3339|3340|3341|3342|3343|3344|3345|3346|3347|3348|3349|3350|3351|3352|3353|3354|3355|3356|3357|3358|3359|3360|3361|3362|3363|3364|3365|3366|3367|3368|3369|3370|3371|3372|3373|3374|3375|3376|3377|3378|3379|3380|3381|3382|3383|3384|3385|3386|3387|3388|3389|3390|3391|3392|3393|3394|3395|3396|3397|3398|3399|3400|3401|3402|3403|3404|3405|3406|3407|3408|3409|3410|3411|3412|3413|3414|3415|3416|3417|3418|3419|3420|3421|3422|3423|3424|3425|3426|3427|3428|3429|3430|3431|3432|3433|3434|3435|3436|3437|3438|3439|3440|3441|3442|3443|3444|3445|3446|3447|3448|3449|3450|3451|3452|3453|3454|3455|3456|3457|3458|3459|3460|3461|3462|3463|3464|3465|3466|3467|3468|3469|3470|3471|3472|3473|3474|3475|3476|3477|3478|3479|3480|3481|3482|3483|3484|3485|3486|3487|3488|3489|3490|3491|3492|3493|3494|3495|3496|3497|3498|3499|3500|3501|3502|3503|3504|3505|3506|3507|3508|3509|3510|3511|3512|3513|3514|3515|3516|3517|3518|3519|3520|3521|3522|3523|3524|3525|3526|3527|3528|3529|3530|3531|3532|3533|3534|3535|3536|3537|3538|3539|3540|3541|3542|3543|3544|3545|3546|3547|3548|3549|3550|3551|3552|3553|3554|3555|3556|3557|3558|3559|3560|3561|3562|3563|3564|3565|3566|3567|3568|3569|3570|3571|3572|3573|3574|3575|3576|3577|3578|3579|3580|3581|3582|3583|3584|3585|3586|3587|3588|3589|3590|3591|3592|3593|3594|3595|3596|3597|3598|3599|3600|3601|3602|3603|3604|3605|3606|3607|3608|3609|3610|3611|3612|3613|3614|3615|3616|3617|3618|3619|3620|3621|3622|3623|3624|3625|3626|3627|3628|3629|3630|3631|3632|3633|3634|3635|3636|3637|3638|3639|3640|3641|3642|3643|3644|3645|3646|3647|3648|3649|3650|3651|3652|3653|3654|3655|3656|3657|3658|3659|3660|3661|3662|3663|3664|3665|3666|3667|3668|3669|3670|3671|3672|3673|3674|3675|3676|3677|3678|3679|3680|3681|3682|3683|3684|3685|3686|3687|3688|3689|3690|3691|3692|3693|3694|3695|3696|3697|3698|3699|3700|3701|3702|3703|3704|3705|3706|3707|3708|3709|3710|3711|3712|3713|3714|3715|3716|3717|3718|3719|3720|3721|3722|3723|3724|3725|3726|3727|3728|3729|3730|3731|3732|3733|3734|3735|3736|3737|3738|3739|3740|3741|3742|3743|3744|3745|3746|3747|3748|3749|3750|3751|3752|3753|3754|3755|3756|3757|3758|3759|3760|3761|3762|3763|3764|3765|3766|3767|3768|3769|3770|3771|3772|3773|3774|3775|3776|3777|3778|3779|3780|3781|3782|3783|3784|3785|3786|3787|3788|3789|3790|3791|3792|3793|3794|3795|3796|3797|3798|3799|3800|3801|3802|3803|3804|3805|3806|3807|3808|3809|3810|3811|3812|3813|3814|3815|3816|3817|3818|3819|3820|3821|3822|3823|3824|3825|3826|3827|3828|3829|3830|3831|3832|3833|3834|3835|3836|3837|3838|3839|3840|3841|3842|3843|3844|3845|3846|3847|3848|3849|3850|3851|3852|3853|3854|3855|3856|3857|3858|3859|3860|3861|3862|3863|3864|3865|3866|3867|3868|3869|3870|3871|3872|3873|3874|3875|3876|3877|3878|3879|3880|3881|3882|3883|3884|3885|3886|3887|3888|3889|3890|3891|3892|3893|3894|3895|3896|3897|3898|3899|3900|3901|3902|3903|3904|3905|3906|3907|3908|3909|3910|3911|3912|3913|3914|3915|3916|3917|3918|3919|3920|3921|3922|3923|3924|3925|3926|3927|3928|3929|3930|3931|3932|3933|3934|3935|3936|3937|3938|3939|3940|3941|3942|3943|3944|3945|3946|3947|3948|3949|3950|3951|3952|3953|3954|3955|3956|3957|3958|3959|3960|3961|3962|3963|3964|3965|3966|3967|3968|3969|3970|3971|3972|3973|3974|3975|3976|3977|3978|3979|3980|3981|3982|3983|3984|3985|3986|3987|3988|3989|3990|3991|3992|3993|3994|3995|3996|3997|3998|3999|4000|4001|4002|4003|4004|4005|4006|4007|4008|4009|4010|4011|4012|4013|4014|4015|4016|4017|4018|4019|4020|4021|4022|4023|4024|4025|4026|4027|4028|4029|4030|4031|4032|4033|4034|4035|4036|4037|4038|4039|4040|4041|4042|4043|4044|4045|4046|4047|4048|4049|4050|4051|4052|4053|4054|4055|4056|4057|4058|4059|4060|4061|4062|4063|4064|4065|4066|4067|4068|4069|4070|4071|4072|4073|4074|4075|4076|4077|4078|4079|4080|4081|4082|4083|4084|4085|4086|4087|4088|4089|4090|4091|4092|4093|4094|4095|4096|4097|4098|4099|4100|4101|4102|4103|4104|4105|4106|4107|4108|4109|4110|4111|4112|4113|4114|4115|4116|4117|4118|4119|4120|4121|4122|4123|4124|4125|4126|4127|4128|4129|4130|4131|4132|4133|4134|4135|4136|4137|4138|4139|4140|4141|4142|4143|4144|4145|4146|4147|4148|4149|4150|4151|4152|4153|4154|4155|4156|4157|4158|4159|4160|4161|4162|4163|4164|4165|4166|4167|4168|4169|4170|4171|4172|4173|4174|4175|4176|4177|4178|4179|4180|4181|4182|4183|4184|4185|4186|4187|4188|4189|4190|4191|4192|4193|4194|4195|4196|4197|4198|4199|4200|4201|4202|4203|4204|4205|4206|4207|4208|4209|4210|4211|4212|4213|4214|4215|4216|4217|4218|4219|4220|4221|4222|4223|4224|4225|4226|4227|4228|4229|4230|4231|4232|4233|4234|4235|4236|4237|4238|4239|4240|4241|4242|4243|4244|4245|4246|4247|4248|4249|4250|4251|4252|4253|4254|4255|4256|4257|4258|4259|4260|4261|4262|4263|4264|4265|4266|4267|4268|4269|4270|4271|4272|4273|4274|4275|4276|4277|4278|4279|4280|4281|4282|4283|4284|4285|4286|4287|4288|4289|4290|4291|4292|4293|4294|4295|4296|4297|4298|4299|4300|4301|4302|4303|4304|4305|4306|4307|4308|4309|4310|4311|4312|4313|4314|4315|4316|4317|4318|4319|4320|4321|4322|4323|4324|4325|4326|4327|4328|4329|4330|4331|4332|4333|4334|4335|4336|4337|4338|4339|4340|4341|4342|4343|4344|4345|4346|4347|4348|4349|4350|4351|4352|4353|4354|4355|4356|4357|4358|4359|4360|4361|4362|4363|4364|4365|4366|4367|4368|4369|4370|4371|4372|4373|4374|4375|4376|4377|4378|4379|4380|4381|4382|4383|4384|4385|4386|4387|4388|4389|4390|4391|4392|4393|4394|4395|4396|4397|4398|4399|4400|4401|4402|4403|4404|4405|4406|4407|4408|4409|4410|4411|4412|4413|4414|4415|4416|4417|4418|4419|4420|4421|4422|4423|4424|4425|4426|4427|4428|4429|4430|4431|4432|4433|4434|4435|4436|4437|4438|4439|4440|4441|4442|4443|4444|4445|4446|4447|4448|4449|4450|4451|4452|4453|4454|4455|4456|4457|4458|4459|4460|4461|4462|4463|4464|4465|4466|4467|4468|4469|4470|4471|4472|4473|4474|4475|4476|4477|4478|4479|4480|4481|4482|4483|4484|4485|4486|4487|4488|4489|4490|4491|4492|4493|4494|4495|4496|4497|4498|4499|4500|4501|4502|4503|4504|4505|4506|4507|4508|4509|4510|4511|4512|4513|4514|4515|4516|4517|4518|4519|4520|4521|4522|4523|4524|4525|4526|4527|4528|4529|4530|4531|4532|4533|4534|4535|4536|4537|4538|4539|4540|4541|4542|4543|4544|4545|4546|4547|4548|4549|4550|4551|4552|4553|4554|4555|4556|4557|4558|4559|4560|4561|4562|4563|4564|4565|4566|4567|4568|4569|4570|4571|4572|4573|4574|4575|4576|4577|4578|4579|4580|4581|4582|4583|4584|4585|4586|4587|4588|4589|4590|4591|4592|4593|4594|4595|4596|4597|4598|4599|4600|4601|4602|4603|4604|4605|4606|4607|4608|4609|4610|4611|4612|4613|4614|4615|4616|4617|4618|4619|4620|4621|4622|4623|4624|4625|4626|4627|4628|4629|4630|4631|4632|4633|4634|4635|4636|4637|4638|4639|4640|4641|4642|4643|4644|4645|4646|4647|4648|4649|4650|4651|4652|4653|4654|4655|4656|4657|4658|4659|4660|4661|4662|4663|4664|4665|4666|4667|4668|4669|4670|4671|4672|4673|4674|4675|4676|4677|4678|4679|4680|4681|4682|4683|4684|4685|4686|4687|4688|4689|4690|4691|4692|4693|4694|4695|4696|4697|4698|4699|4700|4701|4702|4703|4704|4705|4706|4707|4708|4709|4710|4711|4712|4713|4714|4715|4716|4717|4718|4719|4720|4721|4722|4723|4724|4725|4726|4727|4728|4729|4730|4731|4732|4733|4734|4735|4736|4737|4738|4739|4740|4741|4742|4743|4744|4745|4746|4747|4748|4749|4750|4751|4752|4753|4754|4755|4756|4757|4758|4759|4760|4761|4762|4763|4764|4765|4766|4767|4768|4769|4770|4771|4772|4773|4774|4775|4776|4777|4778|4779|4780|4781|4782|4783|4784|4785|4786|4787|4788|4789|4790|4791|4792|4793|4794|4795|4796|4797|4798|4799|4800|4801|4802|4803|4804|4805|4806|4807|4808|4809|4810|4811|4812|4813|4814|4815|4816|4817|4818|4819|4820|4821|4822|4823|4824|4825|4826|4827|4828|4829|4830|4831|4832|4833|4834|4835|4836|4837|4838|4839|4840|4841|4842|4843|4844|4845|4846|4847|4848|4849|4850|4851|4852|4853|4854|4855|4856|4857|4858|4859|4860|4861|4862|4863|4864|4865|4866|4867|4868|4869|4870|4871|4872|4873|4874|4875|4876|4877|4878|4879|4880|4881|4882|4883|4884|4885|4886|4887|4888|4889|4890|4891|4892|4893|4894|4895|4896|4897|4898|4899|4900|4901|4902|4903|4904|4905|4906|4907|4908|4909|4910|4911|4912|4913|4914|4915|4916|4917|4918|4919|4920|4921|4922|4923|4924|4925|4926|4927|4928|4929|4930|4931|4932|4933|4934|4935|4936|4937|4938|4939|4940|4941|4942|4943|4944|4945|4946|4947|4948|4949|4950|4951|4952|4953|4954|4955|4956|4957|4958|4959|4960|4961|4962|4963|4964|4965|4966|4967|4968|4969|4970|4971|4972|4973|4974|4975|4976|4977|4978|4979|4980|4981|4982|4983|4984|4985|4986|4987|4988|4989|4990|4991|4992|4993|4994|4995|4996|4997|4998|4999|5000|5001|5002|5003|5004|5005|5006|5007|5008|5009|5010|5011|5012|5013|5014|5015|5016|5017|5018|5019|5020|5021|5022|5023|5024|5025|5026|5027|5028|5029|5030|5031|5032|5033|5034|5035|5036|5037|5038|5039|5040|5041|5042|5043|5044|5045|5046|5047|5048|5049|5050|5051|5052|5053|5054|5055|5056|5057|5058|5059|5060|5061|5062|5063|5064|5065|5066|5067|5068|5069|5070|5071|5072|5073|5074|5075|5076|5077|5078|5079|5080|5081|5082|5083|5084|5085|5086|5087|5088|5089|5090|5091|5092|5093|5094|5095|5096|5097|5098|5099|5100|5101|5102|5103|5104|5105|5106|5107|5108|5109|5110|5111|5112|5113|5114|5115|5116|5117|5118|5119|5120|5121|5122|5123|5124|5125|5126|5127|5128|5129|5130|5131|5132|5133|5134|5135|5136|5137|5138|5139|5140|5141|5142|5143|5144|5145|5146|5147|5148|5149|5150|5151|5152|5153|5154|5155|5156|5157|5158|5159|5160|5161|5162|5163|5164|5165|5166|5167|5168|5169|5170|5171|5172|5173|5174|5175|5176|5177|5178|5179|5180|5181|5182|5183|5184|5185|5186|5187|5188|5189|5190|5191|5192|5193|5194|5195|5196|5197|5198|5199|5200|5201|5202|5203|5204|5205|5206|5207|5208|5209|5210|5211|5212|5213|5214|5215|5216|5217|5218|5219|5220|5221|5222|5223|5224|5225|5226|5227|5228|5229|5230|5231|5232|5233|5234|5235|5236|5237|5238|5239|5240|5241|5242|5243|5244|5245|5246|5247|5248|5249|5250|5251|5252|5253|5254|5255|5256|5257|5258|5259|5260|5261|5262|5263|5264|5265|5266|5267|5268|5269|5270|5271|5272|5273|5274|5275|5276|5277|5278|5279|5280|5281|5282|5283|5284|5285|5286|5287|5288|5289|5290|5291|5292|5293|5294|5295|5296|5297|5298|5299|5300|5301|5302|5303|5304|5305|5306|5307|5308|5309|5310|5311|5312|5313|5314|5315|5316|5317|5318|5319|5320|5321|5322|5323|5324|5325|5326|5327|5328|5329|5330|5331|5332|5333|5334|5335|5336|5337|5338|5339|5340|5341|5342|5343|5344|5345|5346|5347|5348|5349|5350|5351|5352|5353|5354|5355|5356|5357|5358|5359|5360|5361|5362|5363|5364|5365|5366|5367|5368|5369|5370|5371|5372|5373|5374|5375|5376|5377|5378|5379|5380|5381|5382|5383|5384|5385|5386|5387|5388|5389|5390|5391|5392|5393|5394|5395|5396|5397|5398|5399|5400|5401|5402|5403|5404|5405|5406|5407|5408|5409|5410|5411|5412|5413|5414|5415|5416|5417|5418|5419|5420|5421|5422|5423|5424|5425|5426|5427|5428|5429|5430|5431|5432|5433|5434|5435|5436|5437|5438|5439|5440|5441|5442|5443|5444|5445|5446|5447|5448|5449|5450|5451|5452|5453|5454|5455|5456|5457|5458|5459|5460|5461|5462|5463|5464|5465|5466|5467|5468|5469|5470|5471|5472|5473|5474|5475|5476|5477|5478|5479|5480|5481|5482|5483|5484|5485|5486|5487|5488|5489|5490|5491|5492|5493|5494|5495|5496|5497|5498|5499|5500|5501|5502|5503|5504|5505|5506|5507|5508|5509|5510|5511|5512|5513|5514|5515|5516|5517|5518|5519|5520|5521|5522|5523|5524|5525|5526|5527|5528|5529|5530|5531|5532|5533|5534|5535|5536|5537|5538|5539|5540|5541|5542|5543|5544|5545|5546|5547|5548|5549|5550|5551|5552|5553|5554|5555|5556|5557|5558|5559|5560|5561|5562|5563|5564|5565|5566|5567|5568|5569|5570|5571|5572|5573|5574|5575|5576|5577|5578|5579|5580|5581|5582|5583|5584|5585|5586|5587|5588|5589|5590|5591|5592|5593|5594|5595|5596|5597|5598|5599|5600|5601|5602|5603|5604|5605|5606|5607|5608|5609|5610|5611|5612|5613|5614|5615|5616|5617|5618|5619|5620|5621|5622|5623|5624|5625|5626|5627|5628|5629|5630|5631|5632|5633|5634|5635|5636|5637|5638|5639|5640|5641|5642|5643|5644|5645|5646|5647|5648|5649|5650|5651|5652|5653|5654|5655|5656|5657|5658|5659|5660|5661|5662|5663|5664|5665|5666|5667|5668|5669|5670|5671|5672|5673|5674|5675|5676|5677|5678|5679|5680|5681|5682|5683|5684|5685|5686|5687|5688|5689|5690|5691|5692|5693|5694|5695|5696|5697|5698|5699|5700|5701|5702|5703|5704|5705|5706|5707|5708|5709|5710|5711|5712|5713|5714|5715|5716|5717|5718|5719|5720|5721|5722|5723|5724|5725|5726|5727|5728|5729|5730|5731|5732|5733|5734|5735|5736|5737|5738|5739|5740|5741|5742|5743|5744|5745|5746|5747|5748|5749|5750|5751|5752|5753|5754|5755|5756|5757|5758|5759|5760|5761|5762|5763|5764|5765|5766|5767|5768|5769|5770|5771|5772|5773|5774|5775|5776|5777|5778|5779|5780|5781|5782|5783|5784|5785|5786|5787|5788|5789|5790|5791|5792|5793|5794|5795|5796|5797|5798|5799|5800|5801|5802|5803|5804|5805|5806|5807|5808|5809|5810|5811|5812|5813|5814|5815|5816|5817|5818|5819|5820|5821|5822|5823|5824|5825|5826|5827|5828|5829|5830|5831|5832|5833|5834|5835|5836|5837|5838|5839|5840|5841|5842|5843|5844|5845|5846|5847|5848|5849|5850|5851|5852|5853|5854|5855|5856|5857|5858|5859|5860|5861|5862|5863|5864|5865|5866|5867|5868|5869|5870|5871|5872|5873|5874|5875|5876|5877|5878|5879|5880|5881|5882|5883|5884|5885|5886|5887|5888|5889|5890|5891|5892|5893|5894|5895|5896|5897|5898|5899|5900|5901|5902|5903|5904|5905|5906|5907|5908|5909|5910|5911|5912|5913|5914|5915|5916|5917|5918|5919|5920|5921|5922|5923|5924|5925|5926|5927|5928|5929|5930|5931|5932|5933|5934|5935|5936|5937|5938|5939|5940|5941|5942|5943|5944|5945|5946|5947|5948|5949|5950|5951|5952|5953|5954|5955|5956|5957|5958|5959|5960|5961|5962|5963|5964|5965|5966|5967|5968|5969|5970|5971|5972|5973|5974|5975|5976|5977|5978|5979|5980|5981|5982|5983|5984|5985|5986|5987|5988|5989|5990|5991|5992|5993|5994|5995|5996|5997|5998|5999|6000|6001|6002|6003|6004|6005|6006|6007|6008|6009|6010|6011|6012|6013|6014|6015|6016|6017|6018|6019|6020|6021|6022|6023|6024|6025|6026|6027|6028|6029|6030|6031|6032|6033|6034|6035|6036|6037|6038|6039|6040|6041|6042|6043|6044|6045|6046|6047|6048|6049|6050|6051|6052|6053|6054|6055|6056|6057|6058|6059|6060|6061|6062|6063|6064|6065|6066|6067|6068|6069|6070|6071|6072|6073|6074|6075|6076|6077|6078|6079|6080|6081|6082|6083|6084|6085|6086|6087|6088|6089|6090|6091|6092|6093|6094|6095|6096|6097|6098|6099|6100|6101|6102|6103|6104|6105|6106|6107|6108|6109|6110|6111|6112|6113|6114|6115|6116|6117|6118|6119|6120|6121|6122|6123|6124|6125|6126|6127|6128|6129|6130|6131|6132|6133|6134|6135|6136|6137|6138|6139|6140|6141|6142|6143|6144|6145|6146|6147|6148|6149|6150|6151|6152|6153|6154|6155|6156|6157|6158|6159|6160|6161|6162|6163|6164|6165|6166|6167|6168|6169|6170|6171|6172|6173|6174|6175|6176|6177|6178|6179|6180|6181|6182|6183|6184|6185|6186|6187|6188|6189|6190|6191|6192|6193|6194|6195|6196|6197|6198|6199|6200|6201|6202|6203|6204|6205|6206|6207|6208|6209|6210|6211|6212|6213|6214|6215|6216|6217|6218|6219|6220|6221|6222|6223|6224|6225|6226|6227|6228|6229|6230|6231|6232|6233|6234|6235|6236|6237|6238|6239|6240|6241|6242|6243|6244|6245|6246|6247|6248|6249|6250|6251|6252|6253|6254|6255|6256|6257|6258|6259|6260|6261|6262|6263|6264|6265|6266|6267|6268|6269|6270|6271|6272|6273|6274|6275|6276|6277|6278|6279|6280|6281|6282|6283|6284|6285|6286|6287|6288|6289|6290|6291|6292|6293|6294|6295|6296|6297|6298|6299|6300|6301|6302|6303|6304|6305|6306|6307|6308|6309|6310|6311|6312|6313|6314|6315|6316|6317|6318|6319|6320|6321|6322|6323|6324|6325|6326|6327|6328|6329|6330|6331|6332|6333|6334|6335|6336|6337|6338|6339|6340|6341|6342|6343|6344|6345|6346|6347|6348|6349|6350|6351|6352|6353|6354|6355|6356|6357|6358|6359|6360|6361|6362|6363|6364|6365|6366|6367|6368|6369|6370|6371|6372|6373|6374|6375|6376|6377|6378|6379|6380|6381|6382|6383|6384|6385|6386|6387|6388|6389|6390|6391|6392|6393|6394|6395|6396|6397|6398|6399|6400|6401|6402|6403|6404|6405|6406|6407|6408|6409|6410|6411|6412|6413|6414|6415|6416|6417|6418|6419|6420|6421|6422|6423|6424|6425|6426|6427|6428|6429|6430|6431|6432|6433|6434|6435|6436|6437|6438|6439|6440|6441|6442|6443|6444|6445|6446|6447|6448|6449|6450|6451|6452|6453|6454|6455|6456|6457|6458|6459|6460|6461|6462|6463|6464|6465|6466|6467|6468|6469|6470|6471|6472|6473|6474|6475|6476|6477|6478|6479|6480|6481|6482|6483|6484|6485|6486|6487|6488|6489|6490|6491|6492|6493|6494|6495|6496|6497|6498|6499|6500|6501|6502|6503|6504|6505|6506|6507|6508|6509|6510|6511|6512|6513|6514|6515|6516|6517|6518|6519|6520|6521|6522|6523|6524|6525|6526|6527|6528|6529|6530|6531|6532|6533|6534|6535|6536|6537|6538|6539|6540|6541|6542|6543|6544|6545|6546|6547|6548|6549|6550|6551|6552|6553|6554|6555|6556|6557|6558|6559|6560|6561|6562|6563|6564|6565|6566|6567|6568|6569|6570|6571|6572|6573|6574|6575|6576|6577|6578|6579|6580|6581|6582|6583|6584|6585|6586|6587|6588|6589|6590|6591|6592|6593|6594|6595|6596|6597|6598|6599|6600|6601|6602|6603|6604|6605|6606|6607|6608|6609|6610|6611|6612|6613|6614|6615|6616|6617|6618|6619|6620|6621|6622|6623|6624|6625|6626|6627|6628|6629|6630|6631|6632|6633|6634|6635|6636|6637|6638|6639|6640|6641|6642|6643|6644|6645|6646|6647|6648|6649|6650|6651|6652|6653|6654|6655|6656|6657|6658|6659|6660|6661|6662|6663|6664|6665|6666|6667|6668|6669|6670|6671|6672|6673|6674|6675|6676|6677|6678|6679|6680|6681|6682|6683|6684|6685|6686|6687|6688|6689|6690|6691|6692|6693|6694|6695|6696|6697|6698|6699|6700|6701|6702|6703|6704|6705|6706|6707|6708|6709|6710|6711|6712|6713|6714|6715|6716|6717|6718|6719|6720|6721|6722|6723|6724|6725|6726|6727|6728|6729|6730|6731|6732|6733|6734|6735|6736|6737|6738|6739|6740|6741|6742|6743|6744|6745|6746|6747|6748|6749|6750|6751|6752|6753|6754|6755|6756|6757|6758|6759|6760|6761|6762|6763|6764|6765|6766|6767|6768|6769|6770|6771|6772|6773|6774|6775|6776|6777|6778/;

result = re.exec('6777');

reportCompare(expect, actual, summary);

status = summary + ' ' + inSection(2) + ' (new RegExp("0|...|9999") ';

var N = 10 * 1000;
var a = new Array(N);
for (var i = 0; i != N; ++i) {
  a[i] = i;
}
var str = a.join('|');  // str is 0|1|2|3|...|<printed value of N -1>
var re = new RegExp(str);
re.exec(N - 1);

reportCompare(expect, actual, summary);



