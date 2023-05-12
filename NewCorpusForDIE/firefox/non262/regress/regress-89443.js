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
 * Date: 2001-07-12
 *
 * SUMMARY: Regression test for bug 89443
 * See http://bugzilla.mozilla.org/show_bug.cgi?id=89443
 *
 * Just seeing if this script will compile without stack overflow.
 */
//-----------------------------------------------------------------------------
var BUGNUMBER = 89443;
var summary = 'Testing this script will compile without stack overflow';

printBugNumber(BUGNUMBER);
printStatus (summary);


//  I don't know what these functions are supposed to be; use dummies -
function isPlainHostName()
{
}

function dnsDomainIs()
{
}

// Here's the big function -
function FindProxyForURL(url, host)
{

  if (isPlainHostName(host)
      || dnsDomainIs(host, ".hennepin.lib.mn.us")
      || dnsDomainIs(host, ".hclib.org")
    )
    return "DIRECT";
  else if (isPlainHostName(host)

// subscription database access

	   || dnsDomainIs(host, ".asahi.com")
	   || dnsDomainIs(host, ".2facts.com")
	   || dnsDomainIs(host, ".oclc.org")
	   || dnsDomainIs(host, ".collegesource.com")
	   || dnsDomainIs(host, ".cq.com")
	   || dnsDomainIs(host, ".grolier.com")
	   || dnsDomainIs(host, ".groveart.com")
	   || dnsDomainIs(host, ".groveopera.com")
	   || dnsDomainIs(host, ".fsonline.com")
	   || dnsDomainIs(host, ".carl.org")
	   || dnsDomainIs(host, ".newslibrary.com")
	   || dnsDomainIs(host, ".pioneerplanet.com")
	   || dnsDomainIs(host, ".startribune.com")
	   || dnsDomainIs(host, ".poemfinder.com")
	   || dnsDomainIs(host, ".umi.com")
	   || dnsDomainIs(host, ".referenceusa.com")
	   || dnsDomainIs(host, ".sirs.com")
	   || dnsDomainIs(host, ".krmediastream.com")
	   || dnsDomainIs(host, ".gale.com")
	   || dnsDomainIs(host, ".galenet.com")
	   || dnsDomainIs(host, ".galegroup.com")
	   || dnsDomainIs(host, ".facts.com")
	   || dnsDomainIs(host, ".eb.com")
	   || dnsDomainIs(host, ".worldbookonline.com")
	   || dnsDomainIs(host, ".galegroup.com")
	   || dnsDomainIs(host, ".accessscience.com")
	   || dnsDomainIs(host, ".booksinprint.com")
	   || dnsDomainIs(host, ".infolearning.com")
	   || dnsDomainIs(host, ".standardpoor.com")

// image servers
	   || dnsDomainIs(host, ".akamaitech.net")
	   || dnsDomainIs(host, ".akamai.net")
	   || dnsDomainIs(host, ".yimg.com")
	   || dnsDomainIs(host, ".imgis.com")
	   || dnsDomainIs(host, ".ibsys.com")

//  KidsClick-linked kids search engines
	   || dnsDomainIs(host, ".edview.com")
	   || dnsDomainIs(host, ".searchopolis.com")
	   || dnsDomainIs(host, ".onekey.com")
	   || dnsDomainIs(host, ".askjeeves.com")
 
//  Non-subscription Reference Tools URLs from the RecWebSites DBData table
	   || dnsDomainIs(host, "www.cnn.com")
	   || dnsDomainIs(host, "www.emulateme.com")
	   || dnsDomainIs(host, "terraserver.microsoft.com")
	   || dnsDomainIs(host, "www.theodora.com")
	   || dnsDomainIs(host, "www.3datlas.com")
	   || dnsDomainIs(host, "www.infoplease.com")
	   || dnsDomainIs(host, "www.switchboard.com")
	   || dnsDomainIs(host, "www.bartleby.com")
	   || dnsDomainIs(host, "www.mn-politics.com")
	   || dnsDomainIs(host, "www.thesaurus.com")
	   || dnsDomainIs(host, "www.usnews.com")
	   || dnsDomainIs(host, "www.petersons.com")
	   || dnsDomainIs(host, "www.collegenet.com")
	   || dnsDomainIs(host, "www.m-w.com")
	   || dnsDomainIs(host, "clever.net")
	   || dnsDomainIs(host, "maps.expedia.com")
	   || dnsDomainIs(host, "www.CollegeEdge.com")
	   || dnsDomainIs(host, "www.homeworkcentral.com")
	   || dnsDomainIs(host, "www.studyweb.com")
	   || dnsDomainIs(host, "www.mnpro.com")
 
//  custom URLs for local and other access
	   || dnsDomainIs(host, ".dsdukes.com")
	   || dnsDomainIs(host, ".spsaints.com")
	   || dnsDomainIs(host, ".mnzoo.com")
	   || dnsDomainIs(host, ".realaudio.com")
	   || dnsDomainIs(host, ".co.hennepin.mn.us")
	   || dnsDomainIs(host, ".gov")
	   || dnsDomainIs(host, ".org")
	   || dnsDomainIs(host, ".edu")
	   || dnsDomainIs(host, ".fox29.com")
	   || dnsDomainIs(host, ".wcco.com")
	   || dnsDomainIs(host, ".kstp.com")
	   || dnsDomainIs(host, ".kmsp.com")
	   || dnsDomainIs(host, ".kare11.com")
	   || dnsDomainIs(host, ".macromedia.com")
	   || dnsDomainIs(host, ".shockwave.com")
	   || dnsDomainIs(host, ".wwf.com")
	   || dnsDomainIs(host, ".wwfsuperstars.com")
	   || dnsDomainIs(host, ".summerslam.com")
	   || dnsDomainIs(host, ".yahooligans.com")
	   || dnsDomainIs(host, ".mhoob.com")
	   || dnsDomainIs(host, "www.hmonginternet.com")
	   || dnsDomainIs(host, "www.hmongonline.com")
	   || dnsDomainIs(host, ".yahoo.com")
	   || dnsDomainIs(host, ".pokemon.com")
	   || dnsDomainIs(host, ".bet.com")
	   || dnsDomainIs(host, ".smallworld.com")
	   || dnsDomainIs(host, ".cartoonnetwork.com")
	   || dnsDomainIs(host, ".carmensandiego.com")
	   || dnsDomainIs(host, ".disney.com")
	   || dnsDomainIs(host, ".powerpuffgirls.com")
	   || dnsDomainIs(host, ".aol.com")

// Smithsonian
	   || dnsDomainIs(host, "160.111.100.190")

// Hotmail
	   || dnsDomainIs(host, ".passport.com")
	   || dnsDomainIs(host, ".hotmail.com")
	   || dnsDomainIs(host, "216.33.236.24")
	   || dnsDomainIs(host, "216.32.182.251")
	   || dnsDomainIs(host, ".hotmail.msn.com")

//  K12 schools
	   || dnsDomainIs(host, ".k12.al.us")
	   || dnsDomainIs(host, ".k12.ak.us")
	   || dnsDomainIs(host, ".k12.ar.us")
	   || dnsDomainIs(host, ".k12.az.us")
	   || dnsDomainIs(host, ".k12.ca.us")
	   || dnsDomainIs(host, ".k12.co.us")
	   || dnsDomainIs(host, ".k12.ct.us")
	   || dnsDomainIs(host, ".k12.dc.us")
	   || dnsDomainIs(host, ".k12.de.us")
	   || dnsDomainIs(host, ".k12.fl.us")
	   || dnsDomainIs(host, ".k12.ga.us")
	   || dnsDomainIs(host, ".k12.hi.us")
	   || dnsDomainIs(host, ".k12.id.us")
	   || dnsDomainIs(host, ".k12.il.us")
	   || dnsDomainIs(host, ".k12.in.us")
	   || dnsDomainIs(host, ".k12.ia.us")
	   || dnsDomainIs(host, ".k12.ks.us")
	   || dnsDomainIs(host, ".k12.ky.us")
	   || dnsDomainIs(host, ".k12.la.us")
	   || dnsDomainIs(host, ".k12.me.us")
	   || dnsDomainIs(host, ".k12.md.us")
	   || dnsDomainIs(host, ".k12.ma.us")
	   || dnsDomainIs(host, ".k12.mi.us")
	   || dnsDomainIs(host, ".k12.mn.us")
	   || dnsDomainIs(host, ".k12.ms.us")
	   || dnsDomainIs(host, ".k12.mo.us")
	   || dnsDomainIs(host, ".k12.mt.us")
	   || dnsDomainIs(host, ".k12.ne.us")
	   || dnsDomainIs(host, ".k12.nv.us")
	   || dnsDomainIs(host, ".k12.nh.us")
	   || dnsDomainIs(host, ".k12.nj.us")
	   || dnsDomainIs(host, ".k12.nm.us")
	   || dnsDomainIs(host, ".k12.ny.us")
	   || dnsDomainIs(host, ".k12.nc.us")
	   || dnsDomainIs(host, ".k12.nd.us")
	   || dnsDomainIs(host, ".k12.oh.us")
	   || dnsDomainIs(host, ".k12.ok.us")
	   || dnsDomainIs(host, ".k12.or.us")
	   || dnsDomainIs(host, ".k12.pa.us")
	   || dnsDomainIs(host, ".k12.ri.us")
	   || dnsDomainIs(host, ".k12.sc.us")
	   || dnsDomainIs(host, ".k12.sd.us")
	   || dnsDomainIs(host, ".k12.tn.us")
	   || dnsDomainIs(host, ".k12.tx.us")
	   || dnsDomainIs(host, ".k12.ut.us")
	   || dnsDomainIs(host, ".k12.vt.us")
	   || dnsDomainIs(host, ".k12.va.us")
	   || dnsDomainIs(host, ".k12.wa.us")
	   || dnsDomainIs(host, ".k12.wv.us")
	   || dnsDomainIs(host, ".k12.wi.us")
	   || dnsDomainIs(host, ".k12.wy.us")

//  U.S. Libraries
	   || dnsDomainIs(host, ".lib.al.us")
	   || dnsDomainIs(host, ".lib.ak.us")
	   || dnsDomainIs(host, ".lib.ar.us")
	   || dnsDomainIs(host, ".lib.az.us")
	   || dnsDomainIs(host, ".lib.ca.us")
	   || dnsDomainIs(host, ".lib.co.us")
	   || dnsDomainIs(host, ".lib.ct.us")
	   || dnsDomainIs(host, ".lib.dc.us")
	   || dnsDomainIs(host, ".lib.de.us")
	   || dnsDomainIs(host, ".lib.fl.us")
	   || dnsDomainIs(host, ".lib.ga.us")
	   || dnsDomainIs(host, ".lib.hi.us")
	   || dnsDomainIs(host, ".lib.id.us")
	   || dnsDomainIs(host, ".lib.il.us")
	   || dnsDomainIs(host, ".lib.in.us")
	   || dnsDomainIs(host, ".lib.ia.us")
	   || dnsDomainIs(host, ".lib.ks.us")
	   || dnsDomainIs(host, ".lib.ky.us")
	   || dnsDomainIs(host, ".lib.la.us")
	   || dnsDomainIs(host, ".lib.me.us")
	   || dnsDomainIs(host, ".lib.md.us")
	   || dnsDomainIs(host, ".lib.ma.us")
	   || dnsDomainIs(host, ".lib.mi.us")
	   || dnsDomainIs(host, ".lib.mn.us")
	   || dnsDomainIs(host, ".lib.ms.us")
	   || dnsDomainIs(host, ".lib.mo.us")
	   || dnsDomainIs(host, ".lib.mt.us")
	   || dnsDomainIs(host, ".lib.ne.us")
	   || dnsDomainIs(host, ".lib.nv.us")
	   || dnsDomainIs(host, ".lib.nh.us")
	   || dnsDomainIs(host, ".lib.nj.us")
	   || dnsDomainIs(host, ".lib.nm.us")
	   || dnsDomainIs(host, ".lib.ny.us")
	   || dnsDomainIs(host, ".lib.nc.us")
	   || dnsDomainIs(host, ".lib.nd.us")
	   || dnsDomainIs(host, ".lib.oh.us")
	   || dnsDomainIs(host, ".lib.ok.us")
	   || dnsDomainIs(host, ".lib.or.us")
	   || dnsDomainIs(host, ".lib.pa.us")
	   || dnsDomainIs(host, ".lib.ri.us")
	   || dnsDomainIs(host, ".lib.sc.us")
	   || dnsDomainIs(host, ".lib.sd.us")
	   || dnsDomainIs(host, ".lib.tn.us")
	   || dnsDomainIs(host, ".lib.tx.us")
	   || dnsDomainIs(host, ".lib.ut.us")
	   || dnsDomainIs(host, ".lib.vt.us")
	   || dnsDomainIs(host, ".lib.va.us")
	   || dnsDomainIs(host, ".lib.wa.us")
	   || dnsDomainIs(host, ".lib.wv.us")
	   || dnsDomainIs(host, ".lib.wi.us")
	   || dnsDomainIs(host, ".lib.wy.us")

//  U.S. Cities
	   || dnsDomainIs(host, ".ci.al.us")
	   || dnsDomainIs(host, ".ci.ak.us")
	   || dnsDomainIs(host, ".ci.ar.us")
	   || dnsDomainIs(host, ".ci.az.us")
	   || dnsDomainIs(host, ".ci.ca.us")
	   || dnsDomainIs(host, ".ci.co.us")
	   || dnsDomainIs(host, ".ci.ct.us")
	   || dnsDomainIs(host, ".ci.dc.us")
	   || dnsDomainIs(host, ".ci.de.us")
	   || dnsDomainIs(host, ".ci.fl.us")
	   || dnsDomainIs(host, ".ci.ga.us")
	   || dnsDomainIs(host, ".ci.hi.us")
	   || dnsDomainIs(host, ".ci.id.us")
	   || dnsDomainIs(host, ".ci.il.us")
	   || dnsDomainIs(host, ".ci.in.us")
	   || dnsDomainIs(host, ".ci.ia.us")
	   || dnsDomainIs(host, ".ci.ks.us")
	   || dnsDomainIs(host, ".ci.ky.us")
	   || dnsDomainIs(host, ".ci.la.us")
	   || dnsDomainIs(host, ".ci.me.us")
	   || dnsDomainIs(host, ".ci.md.us")
	   || dnsDomainIs(host, ".ci.ma.us")
	   || dnsDomainIs(host, ".ci.mi.us")
	   || dnsDomainIs(host, ".ci.mn.us")
	   || dnsDomainIs(host, ".ci.ms.us")
	   || dnsDomainIs(host, ".ci.mo.us")
	   || dnsDomainIs(host, ".ci.mt.us")
	   || dnsDomainIs(host, ".ci.ne.us")
	   || dnsDomainIs(host, ".ci.nv.us")
	   || dnsDomainIs(host, ".ci.nh.us")
	   || dnsDomainIs(host, ".ci.nj.us")
	   || dnsDomainIs(host, ".ci.nm.us")
	   || dnsDomainIs(host, ".ci.ny.us")
	   || dnsDomainIs(host, ".ci.nc.us")
	   || dnsDomainIs(host, ".ci.nd.us")
	   || dnsDomainIs(host, ".ci.oh.us")
	   || dnsDomainIs(host, ".ci.ok.us")
	   || dnsDomainIs(host, ".ci.or.us")
	   || dnsDomainIs(host, ".ci.pa.us")
	   || dnsDomainIs(host, ".ci.ri.us")
	   || dnsDomainIs(host, ".ci.sc.us")
	   || dnsDomainIs(host, ".ci.sd.us")
	   || dnsDomainIs(host, ".ci.tn.us")
	   || dnsDomainIs(host, ".ci.tx.us")
	   || dnsDomainIs(host, ".ci.ut.us")
	   || dnsDomainIs(host, ".ci.vt.us")
	   || dnsDomainIs(host, ".ci.va.us")
	   || dnsDomainIs(host, ".ci.wa.us")
	   || dnsDomainIs(host, ".ci.wv.us")
	   || dnsDomainIs(host, ".ci.wi.us")
	   || dnsDomainIs(host, ".ci.wy.us")

//  U.S. Counties
	   || dnsDomainIs(host, ".co.al.us")
	   || dnsDomainIs(host, ".co.ak.us")
	   || dnsDomainIs(host, ".co.ar.us")
	   || dnsDomainIs(host, ".co.az.us")
	   || dnsDomainIs(host, ".co.ca.us")
	   || dnsDomainIs(host, ".co.co.us")
	   || dnsDomainIs(host, ".co.ct.us")
	   || dnsDomainIs(host, ".co.dc.us")
	   || dnsDomainIs(host, ".co.de.us")
	   || dnsDomainIs(host, ".co.fl.us")
	   || dnsDomainIs(host, ".co.ga.us")
	   || dnsDomainIs(host, ".co.hi.us")
	   || dnsDomainIs(host, ".co.id.us")
	   || dnsDomainIs(host, ".co.il.us")
	   || dnsDomainIs(host, ".co.in.us")
	   || dnsDomainIs(host, ".co.ia.us")
	   || dnsDomainIs(host, ".co.ks.us")
	   || dnsDomainIs(host, ".co.ky.us")
	   || dnsDomainIs(host, ".co.la.us")
	   || dnsDomainIs(host, ".co.me.us")
	   || dnsDomainIs(host, ".co.md.us")
	   || dnsDomainIs(host, ".co.ma.us")
	   || dnsDomainIs(host, ".co.mi.us")
	   || dnsDomainIs(host, ".co.mn.us")
	   || dnsDomainIs(host, ".co.ms.us")
	   || dnsDomainIs(host, ".co.mo.us")
	   || dnsDomainIs(host, ".co.mt.us")
	   || dnsDomainIs(host, ".co.ne.us")
	   || dnsDomainIs(host, ".co.nv.us")
	   || dnsDomainIs(host, ".co.nh.us")
	   || dnsDomainIs(host, ".co.nj.us")
	   || dnsDomainIs(host, ".co.nm.us")
	   || dnsDomainIs(host, ".co.ny.us")
	   || dnsDomainIs(host, ".co.nc.us")
	   || dnsDomainIs(host, ".co.nd.us")
	   || dnsDomainIs(host, ".co.oh.us")
	   || dnsDomainIs(host, ".co.ok.us")
	   || dnsDomainIs(host, ".co.or.us")
	   || dnsDomainIs(host, ".co.pa.us")
	   || dnsDomainIs(host, ".co.ri.us")
	   || dnsDomainIs(host, ".co.sc.us")
	   || dnsDomainIs(host, ".co.sd.us")
	   || dnsDomainIs(host, ".co.tn.us")
	   || dnsDomainIs(host, ".co.tx.us")
	   || dnsDomainIs(host, ".co.ut.us")
	   || dnsDomainIs(host, ".co.vt.us")
	   || dnsDomainIs(host, ".co.va.us")
	   || dnsDomainIs(host, ".co.wa.us")
	   || dnsDomainIs(host, ".co.wv.us")
	   || dnsDomainIs(host, ".co.wi.us")
	   || dnsDomainIs(host, ".co.wy.us")

//  U.S. States
	   || dnsDomainIs(host, ".state.al.us")
	   || dnsDomainIs(host, ".state.ak.us")
	   || dnsDomainIs(host, ".state.ar.us")
	   || dnsDomainIs(host, ".state.az.us")
	   || dnsDomainIs(host, ".state.ca.us")
	   || dnsDomainIs(host, ".state.co.us")
	   || dnsDomainIs(host, ".state.ct.us")
	   || dnsDomainIs(host, ".state.dc.us")
	   || dnsDomainIs(host, ".state.de.us")
	   || dnsDomainIs(host, ".state.fl.us")
	   || dnsDomainIs(host, ".state.ga.us")
	   || dnsDomainIs(host, ".state.hi.us")
	   || dnsDomainIs(host, ".state.id.us")
	   || dnsDomainIs(host, ".state.il.us")
	   || dnsDomainIs(host, ".state.in.us")
	   || dnsDomainIs(host, ".state.ia.us")
	   || dnsDomainIs(host, ".state.ks.us")
	   || dnsDomainIs(host, ".state.ky.us")
	   || dnsDomainIs(host, ".state.la.us")
	   || dnsDomainIs(host, ".state.me.us")
	   || dnsDomainIs(host, ".state.md.us")
	   || dnsDomainIs(host, ".state.ma.us")
	   || dnsDomainIs(host, ".state.mi.us")
	   || dnsDomainIs(host, ".state.mn.us")
	   || dnsDomainIs(host, ".state.ms.us")
	   || dnsDomainIs(host, ".state.mo.us")
	   || dnsDomainIs(host, ".state.mt.us")
	   || dnsDomainIs(host, ".state.ne.us")
	   || dnsDomainIs(host, ".state.nv.us")
	   || dnsDomainIs(host, ".state.nh.us")
	   || dnsDomainIs(host, ".state.nj.us")
	   || dnsDomainIs(host, ".state.nm.us")
	   || dnsDomainIs(host, ".state.ny.us")
	   || dnsDomainIs(host, ".state.nc.us")
	   || dnsDomainIs(host, ".state.nd.us")
	   || dnsDomainIs(host, ".state.oh.us")
	   || dnsDomainIs(host, ".state.ok.us")
	   || dnsDomainIs(host, ".state.or.us")
	   || dnsDomainIs(host, ".state.pa.us")
	   || dnsDomainIs(host, ".state.ri.us")
	   || dnsDomainIs(host, ".state.sc.us")
	   || dnsDomainIs(host, ".state.sd.us")
	   || dnsDomainIs(host, ".state.tn.us")
	   || dnsDomainIs(host, ".state.tx.us")
	   || dnsDomainIs(host, ".state.ut.us")
	   || dnsDomainIs(host, ".state.vt.us")
	   || dnsDomainIs(host, ".state.va.us")
	   || dnsDomainIs(host, ".state.wa.us")
	   || dnsDomainIs(host, ".state.wv.us")
	   || dnsDomainIs(host, ".state.wi.us")
	   || dnsDomainIs(host, ".state.wy.us")

// KidsClick URLs

	   || dnsDomainIs(host, "12.16.163.163")
	   || dnsDomainIs(host, "128.59.173.136")
	   || dnsDomainIs(host, "165.112.78.61")
	   || dnsDomainIs(host, "216.55.23.140")
	   || dnsDomainIs(host, "63.111.53.150")
	   || dnsDomainIs(host, "64.94.206.8")

	   || dnsDomainIs(host, "abc.go.com")
	   || dnsDomainIs(host, "acmepet.petsmart.com")
	   || dnsDomainIs(host, "adver-net.com")
	   || dnsDomainIs(host, "aint-it-cool-news.com")
	   || dnsDomainIs(host, "akidsheart.com")
	   || dnsDomainIs(host, "alabanza.com")
	   || dnsDomainIs(host, "allerdays.com")
	   || dnsDomainIs(host, "allgame.com")
	   || dnsDomainIs(host, "allowancenet.com")
	   || dnsDomainIs(host, "amish-heartland.com")
	   || dnsDomainIs(host, "ancienthistory.about.com")
	   || dnsDomainIs(host, "animals.about.com")
	   || dnsDomainIs(host, "antenna.nl")
	   || dnsDomainIs(host, "arcweb.sos.state.or.us")
	   || dnsDomainIs(host, "artistmummer.homestead.com")
	   || dnsDomainIs(host, "artists.vh1.com")
	   || dnsDomainIs(host, "arts.lausd.k12.ca.us")
	   || dnsDomainIs(host, "asiatravel.com")
	   || dnsDomainIs(host, "asterius.com")
	   || dnsDomainIs(host, "atlas.gc.ca")
	   || dnsDomainIs(host, "atschool.eduweb.co.uk")
	   || dnsDomainIs(host, "ayya.pd.net")
	   || dnsDomainIs(host, "babelfish.altavista.com")
	   || dnsDomainIs(host, "babylon5.warnerbros.com")
	   || dnsDomainIs(host, "banzai.neosoft.com")
	   || dnsDomainIs(host, "barneyonline.com")
	   || dnsDomainIs(host, "baroque-music.com")
	   || dnsDomainIs(host, "barsoom.msss.com")
	   || dnsDomainIs(host, "baseball-almanac.com")
	   || dnsDomainIs(host, "bcadventure.com")
	   || dnsDomainIs(host, "beadiecritters.hosting4less.com")
	   || dnsDomainIs(host, "beverlyscrafts.com")
	   || dnsDomainIs(host, "biology.about.com")
	   || dnsDomainIs(host, "birding.about.com")
	   || dnsDomainIs(host, "boatsafe.com")
	   || dnsDomainIs(host, "bombpop.com")
	   || dnsDomainIs(host, "boulter.com")
	   || dnsDomainIs(host, "bright-ideas-software.com")
	   || dnsDomainIs(host, "buckman.pps.k12.or.us")
	   || dnsDomainIs(host, "buffalobills.com")
	   || dnsDomainIs(host, "bvsd.k12.co.us")
	   || dnsDomainIs(host, "cagle.slate.msn.com")
	   || dnsDomainIs(host, "calc.entisoft.com")
	   || dnsDomainIs(host, "canada.gc.ca")
	   || dnsDomainIs(host, "candleandsoap.about.com")
	   || dnsDomainIs(host, "caselaw.lp.findlaw.com")
	   || dnsDomainIs(host, "catalog.com")
	   || dnsDomainIs(host, "catalog.socialstudies.com")
	   || dnsDomainIs(host, "cavern.com")
	   || dnsDomainIs(host, "cbs.sportsline.com")
	   || dnsDomainIs(host, "cc.matsuyama-u.ac.jp")
	   || dnsDomainIs(host, "celt.net")
	   || dnsDomainIs(host, "cgfa.kelloggcreek.com")
	   || dnsDomainIs(host, "channel4000.com")
	   || dnsDomainIs(host, "chess.delorie.com")
	   || dnsDomainIs(host, "chess.liveonthenet.com")
	   || dnsDomainIs(host, "childfun.com")
	   || dnsDomainIs(host, "christmas.com")
	   || dnsDomainIs(host, "citystar.com")
	   || dnsDomainIs(host, "claim.goldrush.com")
	   || dnsDomainIs(host, "clairerosemaryjane.com")
	   || dnsDomainIs(host, "clevermedia.com")
	   || dnsDomainIs(host, "cobblestonepub.com")
	   || dnsDomainIs(host, "codebrkr.infopages.net")
	   || dnsDomainIs(host, "colitz.com")
	   || dnsDomainIs(host, "collections.ic.gc.ca")
	   || dnsDomainIs(host, "coloquio.com")
	   || dnsDomainIs(host, "come.to")
	   || dnsDomainIs(host, "coombs.anu.edu.au")
	   || dnsDomainIs(host, "crafterscommunity.com")
	   || dnsDomainIs(host, "craftsforkids.about.com")
	   || dnsDomainIs(host, "creativity.net")
	   || dnsDomainIs(host, "cslewis.drzeus.net")
	   || dnsDomainIs(host, "cust.idl.com.au")
	   || dnsDomainIs(host, "cvs.anu.edu.au")
	   || dnsDomainIs(host, "cybersleuth-kids.com")
	   || dnsDomainIs(host, "cybertown.com")
	   || dnsDomainIs(host, "darkfish.com")
	   || dnsDomainIs(host, "datadragon.com")
	   || dnsDomainIs(host, "davesite.com")
	   || dnsDomainIs(host, "dbertens.www.cistron.nl")
	   || dnsDomainIs(host, "detnews.com")
	   || dnsDomainIs(host, "dhr.dos.state.fl.us")
	   || dnsDomainIs(host, "dialspace.dial.pipex.com")
	   || dnsDomainIs(host, "dictionaries.travlang.com")
	   || dnsDomainIs(host, "disney.go.com")
	   || dnsDomainIs(host, "disneyland.disney.go.com")
	   || dnsDomainIs(host, "district.gresham.k12.or.us")
	   || dnsDomainIs(host, "dmarie.com")
	   || dnsDomainIs(host, "dreamwater.com")
	   || dnsDomainIs(host, "duke.fuse.net")
	   || dnsDomainIs(host, "earlyamerica.com")
	   || dnsDomainIs(host, "earthsky.com")
	   || dnsDomainIs(host, "easyweb.easynet.co.uk")
	   || dnsDomainIs(host, "ecards1.bansheeweb.com")
	   || dnsDomainIs(host, "edugreen.teri.res.in")
	   || dnsDomainIs(host, "edwardlear.tripod.com")
	   || dnsDomainIs(host, "eelink.net")
	   || dnsDomainIs(host, "elizabethsings.com")
	   || dnsDomainIs(host, "enature.com")
	   || dnsDomainIs(host, "encarta.msn.com")
	   || dnsDomainIs(host, "endangeredspecie.com")
	   || dnsDomainIs(host, "enterprise.america.com")
	   || dnsDomainIs(host, "ericae.net")
	   || dnsDomainIs(host, "esl.about.com")
	   || dnsDomainIs(host, "eveander.com")
	   || dnsDomainIs(host, "exn.ca")
	   || dnsDomainIs(host, "fallscam.niagara.com")
	   || dnsDomainIs(host, "family.go.com")
	   || dnsDomainIs(host, "family2.go.com")
	   || dnsDomainIs(host, "familyeducation.com")
	   || dnsDomainIs(host, "finditquick.com")
	   || dnsDomainIs(host, "fln-bma.yazigi.com.br")
	   || dnsDomainIs(host, "fln-con.yazigi.com.br")
	   || dnsDomainIs(host, "food.epicurious.com")
	   || dnsDomainIs(host, "forums.sympatico.ca")
	   || dnsDomainIs(host, "fotw.vexillum.com")
	   || dnsDomainIs(host, "fox.nstn.ca")
	   || dnsDomainIs(host, "framingham.com")
	   || dnsDomainIs(host, "freevote.com")
	   || dnsDomainIs(host, "freeweb.pdq.net")
	   || dnsDomainIs(host, "games.yahoo.com")
	   || dnsDomainIs(host, "gardening.sierrahome.com")
	   || dnsDomainIs(host, "gardenofpraise.com")
	   || dnsDomainIs(host, "gcclearn.gcc.cc.va.us")
	   || dnsDomainIs(host, "genealogytoday.com")
	   || dnsDomainIs(host, "genesis.ne.mediaone.net")
	   || dnsDomainIs(host, "geniefind.com")
	   || dnsDomainIs(host, "geography.about.com")
	   || dnsDomainIs(host, "gf.state.wy.us")
	   || dnsDomainIs(host, "gi.grolier.com")
	   || dnsDomainIs(host, "golf.com")
	   || dnsDomainIs(host, "greatseal.com")
	   || dnsDomainIs(host, "guardians.net")
	   || dnsDomainIs(host, "hamlet.hypermart.net")
	   || dnsDomainIs(host, "happypuppy.com")
	   || dnsDomainIs(host, "harcourt.fsc.follett.com")
	   || dnsDomainIs(host, "haringkids.com")
	   || dnsDomainIs(host, "harrietmaysavitz.com")
	   || dnsDomainIs(host, "harrypotter.warnerbros.com")
	   || dnsDomainIs(host, "hca.gilead.org.il")
	   || dnsDomainIs(host, "header.future.easyspace.com")
	   || dnsDomainIs(host, "historymedren.about.com")
	   || dnsDomainIs(host, "home.att.net")
	   || dnsDomainIs(host, "home.austin.rr.com")
	   || dnsDomainIs(host, "home.capu.net")
	   || dnsDomainIs(host, "home.cfl.rr.com")
	   || dnsDomainIs(host, "home.clara.net")
	   || dnsDomainIs(host, "home.clear.net.nz")
	   || dnsDomainIs(host, "home.earthlink.net")
	   || dnsDomainIs(host, "home.eznet.net")
	   || dnsDomainIs(host, "home.flash.net")
	   || dnsDomainIs(host, "home.hiwaay.net")
	   || dnsDomainIs(host, "home.hkstar.com")
	   || dnsDomainIs(host, "home.ici.net")
	   || dnsDomainIs(host, "home.inreach.com")
	   || dnsDomainIs(host, "home.interlynx.net")
	   || dnsDomainIs(host, "home.istar.ca")
	   || dnsDomainIs(host, "home.mira.net")
	   || dnsDomainIs(host, "home.nycap.rr.com")
	   || dnsDomainIs(host, "home.online.no")
	   || dnsDomainIs(host, "home.pb.net")
	   || dnsDomainIs(host, "home2.pacific.net.sg")
	   || dnsDomainIs(host, "homearts.com")
	   || dnsDomainIs(host, "homepage.mac.com")
	   || dnsDomainIs(host, "hometown.aol.com")
	   || dnsDomainIs(host, "homiliesbyemail.com")
	   || dnsDomainIs(host, "hotei.fix.co.jp")
	   || dnsDomainIs(host, "hotwired.lycos.com")
	   || dnsDomainIs(host, "hp.vector.co.jp")
	   || dnsDomainIs(host, "hum.amu.edu.pl")
	   || dnsDomainIs(host, "i-cias.com")
	   || dnsDomainIs(host, "icatapults.freeservers.com")
	   || dnsDomainIs(host, "ind.cioe.com")
	   || dnsDomainIs(host, "info.ex.ac.uk")
	   || dnsDomainIs(host, "infocan.gc.ca")
	   || dnsDomainIs(host, "infoservice.gc.ca")
	   || dnsDomainIs(host, "interoz.com")
	   || dnsDomainIs(host, "ireland.iol.ie")
	   || dnsDomainIs(host, "is.dal.ca")
	   || dnsDomainIs(host, "itss.raytheon.com")
	   || dnsDomainIs(host, "iul.com")
	   || dnsDomainIs(host, "jameswhitcombriley.com")
	   || dnsDomainIs(host, "jellieszone.com")
	   || dnsDomainIs(host, "jordan.sportsline.com")
	   || dnsDomainIs(host, "judyanddavid.com")
	   || dnsDomainIs(host, "jurai.murdoch.edu.au")
	   || dnsDomainIs(host, "just.about.com")
	   || dnsDomainIs(host, "kayleigh.tierranet.com")
	   || dnsDomainIs(host, "kcwingwalker.tripod.com")
	   || dnsDomainIs(host, "kidexchange.about.com")
	   || dnsDomainIs(host, "kids-world.colgatepalmolive.com")
	   || dnsDomainIs(host, "kids.mysterynet.com")
	   || dnsDomainIs(host, "kids.ot.com")
	   || dnsDomainIs(host, "kidsartscrafts.about.com")
	   || dnsDomainIs(host, "kidsastronomy.about.com")
	   || dnsDomainIs(host, "kidscience.about.com")
	   || dnsDomainIs(host, "kidscience.miningco.com")
	   || dnsDomainIs(host, "kidscollecting.about.com")
	   || dnsDomainIs(host, "kidsfun.co.uk")
	   || dnsDomainIs(host, "kidsinternet.about.com")
	   || dnsDomainIs(host, "kidslangarts.about.com")
	   || dnsDomainIs(host, "kidspenpals.about.com")
	   || dnsDomainIs(host, "kitecast.com")
	   || dnsDomainIs(host, "knight.city.ba.k12.md.us")
	   || dnsDomainIs(host, "kodak.com")
	   || dnsDomainIs(host, "kwanzaa4kids.homestead.com")
	   || dnsDomainIs(host, "lagos.africaonline.com")
	   || dnsDomainIs(host, "lancearmstrong.com")
	   || dnsDomainIs(host, "landru.i-link-2.net")
	   || dnsDomainIs(host, "lang.nagoya-u.ac.jp")
	   || dnsDomainIs(host, "lascala.milano.it")
	   || dnsDomainIs(host, "latinoculture.about.com")
	   || dnsDomainIs(host, "litcal.yasuda-u.ac.jp")
	   || dnsDomainIs(host, "littlebit.com")
	   || dnsDomainIs(host, "live.edventures.com")
	   || dnsDomainIs(host, "look.net")
	   || dnsDomainIs(host, "lycoskids.infoplease.com")
	   || dnsDomainIs(host, "lynx.uio.no")
	   || dnsDomainIs(host, "macdict.dict.mq.edu.au")
	   || dnsDomainIs(host, "maori.culture.co.nz")
	   || dnsDomainIs(host, "marktwain.about.com")
	   || dnsDomainIs(host, "marktwain.miningco.com")
	   || dnsDomainIs(host, "mars2030.net")
	   || dnsDomainIs(host, "martin.parasitology.mcgill.ca")
	   || dnsDomainIs(host, "martinlutherking.8m.com")
	   || dnsDomainIs(host, "mastercollector.com")
	   || dnsDomainIs(host, "mathcentral.uregina.ca")
	   || dnsDomainIs(host, "members.aol.com")
	   || dnsDomainIs(host, "members.carol.net")
	   || dnsDomainIs(host, "members.cland.net")
	   || dnsDomainIs(host, "members.cruzio.com")
	   || dnsDomainIs(host, "members.easyspace.com")
	   || dnsDomainIs(host, "members.eisa.net.au")
	   || dnsDomainIs(host, "members.home.net")
	   || dnsDomainIs(host, "members.iinet.net.au")
	   || dnsDomainIs(host, "members.nbci.com")
	   || dnsDomainIs(host, "members.ozemail.com.au")
	   || dnsDomainIs(host, "members.surfsouth.com")
	   || dnsDomainIs(host, "members.theglobe.com")
	   || dnsDomainIs(host, "members.tripod.com")
	   || dnsDomainIs(host, "mexplaza.udg.mx")
	   || dnsDomainIs(host, "mgfx.com")
	   || dnsDomainIs(host, "microimg.com")
	   || dnsDomainIs(host, "midusa.net")
	   || dnsDomainIs(host, "mildan.com")
	   || dnsDomainIs(host, "millennianet.com")
	   || dnsDomainIs(host, "mindbreakers.e-fun.nu")
	   || dnsDomainIs(host, "missjanet.xs4all.nl")
	   || dnsDomainIs(host, "mistral.culture.fr")
	   || dnsDomainIs(host, "mobileation.com")
	   || dnsDomainIs(host, "mrshowbiz.go.com")
	   || dnsDomainIs(host, "ms.simplenet.com")
	   || dnsDomainIs(host, "museum.gov.ns.ca")
	   || dnsDomainIs(host, "music.excite.com")
	   || dnsDomainIs(host, "musicfinder.yahoo.com")
	   || dnsDomainIs(host, "my.freeway.net")
	   || dnsDomainIs(host, "mytrains.com")
	   || dnsDomainIs(host, "nativeauthors.com")
	   || dnsDomainIs(host, "nba.com")
	   || dnsDomainIs(host, "nch.ari.net")
	   || dnsDomainIs(host, "neonpeach.tripod.com")
	   || dnsDomainIs(host, "net.indra.com")
	   || dnsDomainIs(host, "ngeorgia.com")
	   || dnsDomainIs(host, "ngp.ngpc.state.ne.us")
	   || dnsDomainIs(host, "nhd.heinle.com")
	   || dnsDomainIs(host, "nick.com")
	   || dnsDomainIs(host, "normandy.eb.com")
	   || dnsDomainIs(host, "northshore.shore.net")
	   || dnsDomainIs(host, "now2000.com")
	   || dnsDomainIs(host, "npc.nunavut.ca")
	   || dnsDomainIs(host, "ns2.carib-link.net")
	   || dnsDomainIs(host, "ntl.sympatico.ca")
	   || dnsDomainIs(host, "oceanographer.navy.mil")
	   || dnsDomainIs(host, "oddens.geog.uu.nl")
	   || dnsDomainIs(host, "officialcitysites.com")
	   || dnsDomainIs(host, "oneida-nation.net")
	   || dnsDomainIs(host, "onlinegeorgia.com")
	   || dnsDomainIs(host, "originator_2.tripod.com")
	   || dnsDomainIs(host, "ortech-engr.com")
	   || dnsDomainIs(host, "osage.voorhees.k12.nj.us")
	   || dnsDomainIs(host, "osiris.sund.ac.uk")
	   || dnsDomainIs(host, "ourworld.compuserve.com")
	   || dnsDomainIs(host, "outdoorphoto.com")
	   || dnsDomainIs(host, "pages.map.com")
	   || dnsDomainIs(host, "pages.prodigy.com")
	   || dnsDomainIs(host, "pages.prodigy.net")
	   || dnsDomainIs(host, "pages.tca.net")
	   || dnsDomainIs(host, "parcsafari.qc.ca")
	   || dnsDomainIs(host, "parenthoodweb.com")
	   || dnsDomainIs(host, "pathfinder.com")
	   || dnsDomainIs(host, "people.clarityconnect.com")
	   || dnsDomainIs(host, "people.enternet.com.au")
	   || dnsDomainIs(host, "people.ne.mediaone.net")
	   || dnsDomainIs(host, "phonics.jazzles.com")
	   || dnsDomainIs(host, "pibburns.com")
	   || dnsDomainIs(host, "pilgrims.net")
	   || dnsDomainIs(host, "pinenet.com")
	   || dnsDomainIs(host, "place.scholastic.com")
	   || dnsDomainIs(host, "playground.kodak.com")
	   || dnsDomainIs(host, "politicalgraveyard.com")
	   || dnsDomainIs(host, "polk.ga.net")
	   || dnsDomainIs(host, "pompstory.home.mindspring.com")
	   || dnsDomainIs(host, "popularmechanics.com")
	   || dnsDomainIs(host, "projects.edtech.sandi.net")
	   || dnsDomainIs(host, "psyche.usno.navy.mil")
	   || dnsDomainIs(host, "pubweb.parc.xerox.com")
	   || dnsDomainIs(host, "puzzlemaker.school.discovery.com")
	   || dnsDomainIs(host, "quest.classroom.com")
	   || dnsDomainIs(host, "quilting.about.com")
	   || dnsDomainIs(host, "rabbitmoon.home.mindspring.com")
	   || dnsDomainIs(host, "radio.cbc.ca")
	   || dnsDomainIs(host, "rats2u.com")
	   || dnsDomainIs(host, "rbcm1.rbcm.gov.bc.ca")
	   || dnsDomainIs(host, "readplay.com")
	   || dnsDomainIs(host, "recipes4children.homestead.com")
	   || dnsDomainIs(host, "redsox.com")
	   || dnsDomainIs(host, "renaissance.district96.k12.il.us")
	   || dnsDomainIs(host, "rhyme.lycos.com")
	   || dnsDomainIs(host, "rhythmweb.com")
	   || dnsDomainIs(host, "riverresource.com")
	   || dnsDomainIs(host, "rockhoundingar.com")
	   || dnsDomainIs(host, "rockies.mlb.com")
	   || dnsDomainIs(host, "rosecity.net")
	   || dnsDomainIs(host, "rr-vs.informatik.uni-ulm.de")
	   || dnsDomainIs(host, "rubens.anu.edu.au")
	   || dnsDomainIs(host, "rummelplatz.uni-mannheim.de")
	   || dnsDomainIs(host, "sandbox.xerox.com")
	   || dnsDomainIs(host, "sarah.fredart.com")
	   || dnsDomainIs(host, "schmidel.com")
	   || dnsDomainIs(host, "scholastic.com")
	   || dnsDomainIs(host, "school.discovery.com")
	   || dnsDomainIs(host, "schoolcentral.com")
	   || dnsDomainIs(host, "seattletimes.nwsource.com")
	   || dnsDomainIs(host, "sericulum.com")
	   || dnsDomainIs(host, "sf.airforce.com")
	   || dnsDomainIs(host, "shop.usps.com")
	   || dnsDomainIs(host, "showcase.netins.net")
	   || dnsDomainIs(host, "sikids.com")
	   || dnsDomainIs(host, "sites.huji.ac.il")
	   || dnsDomainIs(host, "sjliving.com")
	   || dnsDomainIs(host, "skullduggery.com")
	   || dnsDomainIs(host, "skyways.lib.ks.us")
	   || dnsDomainIs(host, "snowdaymovie.nick.com")
	   || dnsDomainIs(host, "sosa21.hypermart.net")
	   || dnsDomainIs(host, "soundamerica.com")
	   || dnsDomainIs(host, "spaceboy.nasda.go.jp")
	   || dnsDomainIs(host, "sports.nfl.com")
	   || dnsDomainIs(host, "sportsillustrated.cnn.com")
	   || dnsDomainIs(host, "starwars.hasbro.com")
	   || dnsDomainIs(host, "statelibrary.dcr.state.nc.us")
	   || dnsDomainIs(host, "streetplay.com")
	   || dnsDomainIs(host, "sts.gsc.nrcan.gc.ca")
	   || dnsDomainIs(host, "sunniebunniezz.com")
	   || dnsDomainIs(host, "sunsite.nus.edu.sg")
	   || dnsDomainIs(host, "sunsite.sut.ac.jp")
	   || dnsDomainIs(host, "superm.bart.nl")
	   || dnsDomainIs(host, "surf.to")
	   || dnsDomainIs(host, "svinet2.fs.fed.us")
	   || dnsDomainIs(host, "swiminfo.com")
	   || dnsDomainIs(host, "tabletennis.about.com")
	   || dnsDomainIs(host, "teacher.scholastic.com")
	   || dnsDomainIs(host, "theforce.net")
	   || dnsDomainIs(host, "thejessicas.homestead.com")
	   || dnsDomainIs(host, "themes.editthispage.com")
	   || dnsDomainIs(host, "theory.uwinnipeg.ca")
	   || dnsDomainIs(host, "theshadowlands.net")
	   || dnsDomainIs(host, "thinks.com")
	   || dnsDomainIs(host, "thryomanes.tripod.com")
	   || dnsDomainIs(host, "time_zone.tripod.com")
	   || dnsDomainIs(host, "titania.cobuild.collins.co.uk")
	   || dnsDomainIs(host, "torre.duomo.pisa.it")
	   || dnsDomainIs(host, "touregypt.net")
	   || dnsDomainIs(host, "toycollecting.about.com")
	   || dnsDomainIs(host, "trace.ntu.ac.uk")
	   || dnsDomainIs(host, "travelwithkids.about.com")
	   || dnsDomainIs(host, "tukids.tucows.com")
	   || dnsDomainIs(host, "tv.yahoo.com")
	   || dnsDomainIs(host, "tycho.usno.navy.mil")
	   || dnsDomainIs(host, "ubl.artistdirect.com")
	   || dnsDomainIs(host, "uk-pages.net")
	   || dnsDomainIs(host, "ukraine.uazone.net")
	   || dnsDomainIs(host, "unmuseum.mus.pa.us")
	   || dnsDomainIs(host, "us.imdb.com")
	   || dnsDomainIs(host, "userpage.chemie.fu-berlin.de")
	   || dnsDomainIs(host, "userpage.fu-berlin.de")
	   || dnsDomainIs(host, "userpages.aug.com")
	   || dnsDomainIs(host, "users.aol.com")
	   || dnsDomainIs(host, "users.bigpond.net.au")
	   || dnsDomainIs(host, "users.breathemail.net")
	   || dnsDomainIs(host, "users.erols.com")
	   || dnsDomainIs(host, "users.imag.net")
	   || dnsDomainIs(host, "users.inetw.net")
	   || dnsDomainIs(host, "users.massed.net")
	   || dnsDomainIs(host, "users.skynet.be")
	   || dnsDomainIs(host, "users.uniserve.com")
	   || dnsDomainIs(host, "venus.spaceports.com")
	   || dnsDomainIs(host, "vgstrategies.about.com")
	   || dnsDomainIs(host, "victorian.fortunecity.com")
	   || dnsDomainIs(host, "vilenski.com")
	   || dnsDomainIs(host, "village.infoweb.ne.jp")
	   || dnsDomainIs(host, "virtual.finland.fi")
	   || dnsDomainIs(host, "vrml.fornax.hu")
	   || dnsDomainIs(host, "vvv.com")
	   || dnsDomainIs(host, "w1.xrefer.com")
	   || dnsDomainIs(host, "w3.one.net")
	   || dnsDomainIs(host, "w3.rz-berlin.mpg.de")
	   || dnsDomainIs(host, "w3.trib.com")
	   || dnsDomainIs(host, "wallofsound.go.com")
	   || dnsDomainIs(host, "web.aimnet.com")
	   || dnsDomainIs(host, "web.ccsd.k12.wy.us")
	   || dnsDomainIs(host, "web.cs.ualberta.ca")
	   || dnsDomainIs(host, "web.idirect.com")
	   || dnsDomainIs(host, "web.kyoto-inet.or.jp")
	   || dnsDomainIs(host, "web.macam98.ac.il")
	   || dnsDomainIs(host, "web.massvacation.com")
	   || dnsDomainIs(host, "web.one.net.au")
	   || dnsDomainIs(host, "web.qx.net")
	   || dnsDomainIs(host, "web.uvic.ca")
	   || dnsDomainIs(host, "web2.airmail.net")
	   || dnsDomainIs(host, "webcoast.com")
	   || dnsDomainIs(host, "webgames.kalisto.com")
	   || dnsDomainIs(host, "webhome.idirect.com")
	   || dnsDomainIs(host, "webpages.homestead.com")
	   || dnsDomainIs(host, "webrum.uni-mannheim.de")
	   || dnsDomainIs(host, "webusers.anet-stl.com")
	   || dnsDomainIs(host, "welcome.to")
	   || dnsDomainIs(host, "wgntv.com")
	   || dnsDomainIs(host, "whales.magna.com.au")
	   || dnsDomainIs(host, "wildheart.com")
	   || dnsDomainIs(host, "wilstar.net")
	   || dnsDomainIs(host, "winter-wonderland.com")
	   || dnsDomainIs(host, "women.com")
	   || dnsDomainIs(host, "woodrow.mpls.frb.fed.us")
	   || dnsDomainIs(host, "wordzap.com")
	   || dnsDomainIs(host, "worldkids.net")
	   || dnsDomainIs(host, "worldwideguide.net")
	   || dnsDomainIs(host, "ww3.bay.k12.fl.us")
	   || dnsDomainIs(host, "ww3.sportsline.com")
	   || dnsDomainIs(host, "www-groups.dcs.st-and.ac.uk")
	   || dnsDomainIs(host, "www-public.rz.uni-duesseldorf.de")
	   || dnsDomainIs(host, "www.1stkids.com")
	   || dnsDomainIs(host, "www.2020tech.com")
	   || dnsDomainIs(host, "www.21stcenturytoys.com")
	   || dnsDomainIs(host, "www.4adventure.com")
	   || dnsDomainIs(host, "www.50states.com")
	   || dnsDomainIs(host, "www.800padutch.com")
	   || dnsDomainIs(host, "www.88.com")
	   || dnsDomainIs(host, "www.a-better.com")
	   || dnsDomainIs(host, "www.aaa.com.au")
	   || dnsDomainIs(host, "www.aacca.com")
	   || dnsDomainIs(host, "www.aalbc.com")
	   || dnsDomainIs(host, "www.aardman.com")
	   || dnsDomainIs(host, "www.aardvarkelectric.com")
	   || dnsDomainIs(host, "www.aawc.com")
	   || dnsDomainIs(host, "www.ababmx.com")
	   || dnsDomainIs(host, "www.abbeville.com")
	   || dnsDomainIs(host, "www.abc.net.au")
	   || dnsDomainIs(host, "www.abcb.com")
	   || dnsDomainIs(host, "www.abctooncenter.com")
	   || dnsDomainIs(host, "www.about.ch")
	   || dnsDomainIs(host, "www.accessart.org.uk")
	   || dnsDomainIs(host, "www.accu.or.jp")
	   || dnsDomainIs(host, "www.accuweather.com")
	   || dnsDomainIs(host, "www.achuka.co.uk")
	   || dnsDomainIs(host, "www.acmecity.com")
	   || dnsDomainIs(host, "www.acorn-group.com")
	   || dnsDomainIs(host, "www.acs.ucalgary.ca")
	   || dnsDomainIs(host, "www.actden.com")
	   || dnsDomainIs(host, "www.actionplanet.com")
	   || dnsDomainIs(host, "www.activityvillage.co.uk")
	   || dnsDomainIs(host, "www.actwin.com")
	   || dnsDomainIs(host, "www.adequate.com")
	   || dnsDomainIs(host, "www.adidas.com")
	   || dnsDomainIs(host, "www.advent-calendars.com")
	   || dnsDomainIs(host, "www.aegis.com")
	   || dnsDomainIs(host, "www.af.mil")
	   || dnsDomainIs(host, "www.africaindex.africainfo.no")
	   || dnsDomainIs(host, "www.africam.com")
	   || dnsDomainIs(host, "www.africancrafts.com")
	   || dnsDomainIs(host, "www.aggressive.com")
	   || dnsDomainIs(host, "www.aghines.com")
	   || dnsDomainIs(host, "www.agirlsworld.com")
	   || dnsDomainIs(host, "www.agora.stm.it")
	   || dnsDomainIs(host, "www.agriculture.com")
	   || dnsDomainIs(host, "www.aikidofaq.com")
	   || dnsDomainIs(host, "www.ajkids.com")
	   || dnsDomainIs(host, "www.akfkoala.gil.com.au")
	   || dnsDomainIs(host, "www.akhlah.com")
	   || dnsDomainIs(host, "www.alabamainfo.com")
	   || dnsDomainIs(host, "www.aland.fi")
	   || dnsDomainIs(host, "www.albion.com")
	   || dnsDomainIs(host, "www.alcoholismhelp.com")
	   || dnsDomainIs(host, "www.alcottweb.com")
	   || dnsDomainIs(host, "www.alfanet.it")
	   || dnsDomainIs(host, "www.alfy.com")
	   || dnsDomainIs(host, "www.algebra-online.com")
	   || dnsDomainIs(host, "www.alienexplorer.com")
	   || dnsDomainIs(host, "www.aliensatschool.com")
	   || dnsDomainIs(host, "www.all-links.com")
	   || dnsDomainIs(host, "www.alldetroit.com")
	   || dnsDomainIs(host, "www.allexperts.com")
	   || dnsDomainIs(host, "www.allmixedup.com")
	   || dnsDomainIs(host, "www.allmusic.com")
	   || dnsDomainIs(host, "www.almanac.com")
	   || dnsDomainIs(host, "www.almaz.com")
	   || dnsDomainIs(host, "www.almondseed.com")
	   || dnsDomainIs(host, "www.aloha.com")
	   || dnsDomainIs(host, "www.aloha.net")
	   || dnsDomainIs(host, "www.altonweb.com")
	   || dnsDomainIs(host, "www.alyeska-pipe.com")
	   || dnsDomainIs(host, "www.am-wood.com")
	   || dnsDomainIs(host, "www.amazingadventure.com")
	   || dnsDomainIs(host, "www.amazon.com")
	   || dnsDomainIs(host, "www.americancheerleader.com")
	   || dnsDomainIs(host, "www.americancowboy.com")
	   || dnsDomainIs(host, "www.americangirl.com")
	   || dnsDomainIs(host, "www.americanparknetwork.com")
	   || dnsDomainIs(host, "www.americansouthwest.net")
	   || dnsDomainIs(host, "www.americanwest.com")
	   || dnsDomainIs(host, "www.ameritech.net")
	   || dnsDomainIs(host, "www.amtexpo.com")
	   || dnsDomainIs(host, "www.anbg.gov.au")
	   || dnsDomainIs(host, "www.anc.org.za")
	   || dnsDomainIs(host, "www.ancientegypt.co.uk")
	   || dnsDomainIs(host, "www.angelfire.com")
	   || dnsDomainIs(host, "www.angelsbaseball.com")
	   || dnsDomainIs(host, "www.anholt.co.uk")
	   || dnsDomainIs(host, "www.animabets.com")
	   || dnsDomainIs(host, "www.animalnetwork.com")
	   || dnsDomainIs(host, "www.animalpicturesarchive.com")
	   || dnsDomainIs(host, "www.anime-genesis.com")
	   || dnsDomainIs(host, "www.annefrank.com")
	   || dnsDomainIs(host, "www.annefrank.nl")
	   || dnsDomainIs(host, "www.annie75.com")
	   || dnsDomainIs(host, "www.antbee.com")
	   || dnsDomainIs(host, "www.antiquetools.com")
	   || dnsDomainIs(host, "www.antiquetoy.com")
	   || dnsDomainIs(host, "www.anzsbeg.org.au")
	   || dnsDomainIs(host, "www.aol.com")
	   || dnsDomainIs(host, "www.aone.com")
	   || dnsDomainIs(host, "www.aphids.com")
	   || dnsDomainIs(host, "www.apl.com")
	   || dnsDomainIs(host, "www.aplusmath.com")
	   || dnsDomainIs(host, "www.applebookshop.co.uk")
	   || dnsDomainIs(host, "www.appropriatesoftware.com")
	   || dnsDomainIs(host, "www.appukids.com")
	   || dnsDomainIs(host, "www.april-joy.com")
	   || dnsDomainIs(host, "www.arab.net")
	   || dnsDomainIs(host, "www.aracnet.com")
	   || dnsDomainIs(host, "www.arborday.com")
	   || dnsDomainIs(host, "www.arcadevillage.com")
	   || dnsDomainIs(host, "www.archiecomics.com")
	   || dnsDomainIs(host, "www.archives.state.al.us")
	   || dnsDomainIs(host, "www.arctic.ca")
	   || dnsDomainIs(host, "www.ardenjohnson.com")
	   || dnsDomainIs(host, "www.aristotle.net")
	   || dnsDomainIs(host, "www.arizhwys.com")
	   || dnsDomainIs(host, "www.arizonaguide.com")
	   || dnsDomainIs(host, "www.arlingtoncemetery.com")
	   || dnsDomainIs(host, "www.armory.com")
	   || dnsDomainIs(host, "www.armwrestling.com")
	   || dnsDomainIs(host, "www.arnprior.com")
	   || dnsDomainIs(host, "www.artabunga.com")
	   || dnsDomainIs(host, "www.artcarte.com")
	   || dnsDomainIs(host, "www.artchive.com")
	   || dnsDomainIs(host, "www.artcontest.com")
	   || dnsDomainIs(host, "www.artcyclopedia.com")
	   || dnsDomainIs(host, "www.artisandevelopers.com")
	   || dnsDomainIs(host, "www.artlex.com")
	   || dnsDomainIs(host, "www.artsandkids.com")
	   || dnsDomainIs(host, "www.artyastro.com")
	   || dnsDomainIs(host, "www.arwhead.com")
	   || dnsDomainIs(host, "www.asahi-net.or.jp")
	   || dnsDomainIs(host, "www.asap.unimelb.edu.au")
	   || dnsDomainIs(host, "www.ascpl.lib.oh.us")
	   || dnsDomainIs(host, "www.asia-art.net")
	   || dnsDomainIs(host, "www.asiabigtime.com")
	   || dnsDomainIs(host, "www.asianart.com")
	   || dnsDomainIs(host, "www.asiatour.com")
	   || dnsDomainIs(host, "www.asiaweek.com")
	   || dnsDomainIs(host, "www.askanexpert.com")
	   || dnsDomainIs(host, "www.askbasil.com")
	   || dnsDomainIs(host, "www.assa.org.au")
	   || dnsDomainIs(host, "www.ast.cam.ac.uk")
	   || dnsDomainIs(host, "www.astronomy.com")
	   || dnsDomainIs(host, "www.astros.com")
	   || dnsDomainIs(host, "www.atek.com")
	   || dnsDomainIs(host, "www.athlete.com")
	   || dnsDomainIs(host, "www.athropolis.com")
	   || dnsDomainIs(host, "www.atkielski.com")
	   || dnsDomainIs(host, "www.atlantabraves.com")
	   || dnsDomainIs(host, "www.atlantafalcons.com")
	   || dnsDomainIs(host, "www.atlantathrashers.com")
	   || dnsDomainIs(host, "www.atlanticus.com")
	   || dnsDomainIs(host, "www.atm.ch.cam.ac.uk")
	   || dnsDomainIs(host, "www.atom.co.jp")
	   || dnsDomainIs(host, "www.atomicarchive.com")
	   || dnsDomainIs(host, "www.att.com")
	   || dnsDomainIs(host, "www.audreywood.com")
	   || dnsDomainIs(host, "www.auntannie.com")
	   || dnsDomainIs(host, "www.auntie.com")
	   || dnsDomainIs(host, "www.avi-writer.com")
	   || dnsDomainIs(host, "www.awesomeclipartforkids.com")
	   || dnsDomainIs(host, "www.awhitehorse.com")
	   || dnsDomainIs(host, "www.axess.com")
	   || dnsDomainIs(host, "www.ayles.com")
	   || dnsDomainIs(host, "www.ayn.ca")
	   || dnsDomainIs(host, "www.azcardinals.com")
	   || dnsDomainIs(host, "www.azdiamondbacks.com")
	   || dnsDomainIs(host, "www.azsolarcenter.com")
	   || dnsDomainIs(host, "www.azstarnet.com")
	   || dnsDomainIs(host, "www.aztecafoods.com")
	   || dnsDomainIs(host, "www.b-witched.com")
	   || dnsDomainIs(host, "www.baberuthmuseum.com")
	   || dnsDomainIs(host, "www.backstreetboys.com")
	   || dnsDomainIs(host, "www.bagheera.com")
	   || dnsDomainIs(host, "www.bahamas.com")
	   || dnsDomainIs(host, "www.baileykids.com")
	   || dnsDomainIs(host, "www.baldeagleinfo.com")
	   || dnsDomainIs(host, "www.balloonhq.com")
	   || dnsDomainIs(host, "www.balloonzone.com")
	   || dnsDomainIs(host, "www.ballparks.com")
	   || dnsDomainIs(host, "www.balmoralsoftware.com")
	   || dnsDomainIs(host, "www.banja.com")
	   || dnsDomainIs(host, "www.banph.com")
	   || dnsDomainIs(host, "www.barbie.com")
	   || dnsDomainIs(host, "www.barkingbuddies.com")
	   || dnsDomainIs(host, "www.barnsdle.demon.co.uk")
	   || dnsDomainIs(host, "www.barrysclipart.com")
	   || dnsDomainIs(host, "www.bartleby.com")
	   || dnsDomainIs(host, "www.baseplate.com")
	   || dnsDomainIs(host, "www.batman-superman.com")
	   || dnsDomainIs(host, "www.batmanbeyond.com")
	   || dnsDomainIs(host, "www.bbc.co.uk")
	   || dnsDomainIs(host, "www.bbhighway.com")
	   || dnsDomainIs(host, "www.bboy.com")
	   || dnsDomainIs(host, "www.bcit.tec.nj.us")
	   || dnsDomainIs(host, "www.bconnex.net")
	   || dnsDomainIs(host, "www.bcpl.net")
	   || dnsDomainIs(host, "www.beach-net.com")
	   || dnsDomainIs(host, "www.beachboys.com")
	   || dnsDomainIs(host, "www.beakman.com")
	   || dnsDomainIs(host, "www.beano.co.uk")
	   || dnsDomainIs(host, "www.beans.demon.co.uk")
	   || dnsDomainIs(host, "www.beartime.com")
	   || dnsDomainIs(host, "www.bearyspecial.co.uk")
	   || dnsDomainIs(host, "www.bedtime.com")
	   || dnsDomainIs(host, "www.beingme.com")
	   || dnsDomainIs(host, "www.belizeexplorer.com")
	   || dnsDomainIs(host, "www.bell-labs.com")
	   || dnsDomainIs(host, "www.bemorecreative.com")
	   || dnsDomainIs(host, "www.bengals.com")
	   || dnsDomainIs(host, "www.benjerry.com")
	   || dnsDomainIs(host, "www.bennygoodsport.com")
	   || dnsDomainIs(host, "www.berenstainbears.com")
	   || dnsDomainIs(host, "www.beringia.com")
	   || dnsDomainIs(host, "www.beritsbest.com")
	   || dnsDomainIs(host, "www.berksweb.com")
	   || dnsDomainIs(host, "www.best.com")
	   || dnsDomainIs(host, "www.betsybyars.com")
	   || dnsDomainIs(host, "www.bfro.net")
	   || dnsDomainIs(host, "www.bgmm.com")
	   || dnsDomainIs(host, "www.bibliography.com")
	   || dnsDomainIs(host, "www.bigblue.com.au")
	   || dnsDomainIs(host, "www.bigchalk.com")
	   || dnsDomainIs(host, "www.bigidea.com")
	   || dnsDomainIs(host, "www.bigtop.com")
	   || dnsDomainIs(host, "www.bikecrawler.com")
	   || dnsDomainIs(host, "www.billboard.com")
	   || dnsDomainIs(host, "www.billybear4kids.com")
	   || dnsDomainIs(host, "www.biography.com")
	   || dnsDomainIs(host, "www.birdnature.com")
	   || dnsDomainIs(host, "www.birdsnways.com")
	   || dnsDomainIs(host, "www.birdtimes.com")
	   || dnsDomainIs(host, "www.birminghamzoo.com")
	   || dnsDomainIs(host, "www.birthdaypartyideas.com")
	   || dnsDomainIs(host, "www.bis.arachsys.com")
	   || dnsDomainIs(host, "www.bkgm.com")
	   || dnsDomainIs(host, "www.blackbaseball.com")
	   || dnsDomainIs(host, "www.blackbeardthepirate.com")
	   || dnsDomainIs(host, "www.blackbeltmag.com")
	   || dnsDomainIs(host, "www.blackfacts.com")
	   || dnsDomainIs(host, "www.blackfeetnation.com")
	   || dnsDomainIs(host, "www.blackhills-info.com")
	   || dnsDomainIs(host, "www.blackholegang.com")
	   || dnsDomainIs(host, "www.blaque.net")
	   || dnsDomainIs(host, "www.blarg.net")
	   || dnsDomainIs(host, "www.blasternaut.com")
	   || dnsDomainIs(host, "www.blizzard.com")
	   || dnsDomainIs(host, "www.blocksite.com")
	   || dnsDomainIs(host, "www.bluejackets.com")
	   || dnsDomainIs(host, "www.bluejays.ca")
	   || dnsDomainIs(host, "www.bluemountain.com")
	   || dnsDomainIs(host, "www.blupete.com")
	   || dnsDomainIs(host, "www.blyton.co.uk")
	   || dnsDomainIs(host, "www.boatnerd.com")
	   || dnsDomainIs(host, "www.boatsafe.com")
	   || dnsDomainIs(host, "www.bonus.com")
	   || dnsDomainIs(host, "www.boowakwala.com")
	   || dnsDomainIs(host, "www.bostonbruins.com")
	   || dnsDomainIs(host, "www.braceface.com")
	   || dnsDomainIs(host, "www.bracesinfo.com")
	   || dnsDomainIs(host, "www.bradkent.com")
	   || dnsDomainIs(host, "www.brainium.com")
	   || dnsDomainIs(host, "www.brainmania.com")
	   || dnsDomainIs(host, "www.brainpop.com")
	   || dnsDomainIs(host, "www.bridalcave.com")
	   || dnsDomainIs(host, "www.brightmoments.com")
	   || dnsDomainIs(host, "www.britannia.com")
	   || dnsDomainIs(host, "www.britannica.com")
	   || dnsDomainIs(host, "www.british-museum.ac.uk")
	   || dnsDomainIs(host, "www.brookes.ac.uk")
	   || dnsDomainIs(host, "www.brookfieldreader.com")
	   || dnsDomainIs(host, "www.btinternet.com")
	   || dnsDomainIs(host, "www.bubbledome.co.nz")
	   || dnsDomainIs(host, "www.buccaneers.com")
	   || dnsDomainIs(host, "www.buffy.com")
	   || dnsDomainIs(host, "www.bullying.co.uk")
	   || dnsDomainIs(host, "www.bumply.com")
	   || dnsDomainIs(host, "www.bungi.com")
	   || dnsDomainIs(host, "www.burlco.lib.nj.us")
	   || dnsDomainIs(host, "www.burlingamepezmuseum.com")
	   || dnsDomainIs(host, "www.bus.ualberta.ca")
	   || dnsDomainIs(host, "www.busprod.com")
	   || dnsDomainIs(host, "www.butlerart.com")
	   || dnsDomainIs(host, "www.butterflies.com")
	   || dnsDomainIs(host, "www.butterflyfarm.co.cr")
	   || dnsDomainIs(host, "www.bway.net")
	   || dnsDomainIs(host, "www.bydonovan.com")
	   || dnsDomainIs(host, "www.ca-mall.com")
	   || dnsDomainIs(host, "www.cabinessence.com")
	   || dnsDomainIs(host, "www.cablecarmuseum.com")
	   || dnsDomainIs(host, "www.cadbury.co.uk")
	   || dnsDomainIs(host, "www.calendarzone.com")
	   || dnsDomainIs(host, "www.calgaryflames.com")
	   || dnsDomainIs(host, "www.californiamissions.com")
	   || dnsDomainIs(host, "www.camalott.com")
	   || dnsDomainIs(host, "www.camelotintl.com")
	   || dnsDomainIs(host, "www.campbellsoup.com")
	   || dnsDomainIs(host, "www.camvista.com")
	   || dnsDomainIs(host, "www.canadiens.com")
	   || dnsDomainIs(host, "www.canals.state.ny.us")
	   || dnsDomainIs(host, "www.candlelightstories.com")
	   || dnsDomainIs(host, "www.candles-museum.com")
	   || dnsDomainIs(host, "www.candystand.com")
	   || dnsDomainIs(host, "www.caneshockey.com")
	   || dnsDomainIs(host, "www.canismajor.com")
	   || dnsDomainIs(host, "www.canucks.com")
	   || dnsDomainIs(host, "www.capecod.net")
	   || dnsDomainIs(host, "www.capital.net")
	   || dnsDomainIs(host, "www.capstonestudio.com")
	   || dnsDomainIs(host, "www.cardblvd.com")
	   || dnsDomainIs(host, "www.caro.net")
	   || dnsDomainIs(host, "www.carolhurst.com")
	   || dnsDomainIs(host, "www.carr.lib.md.us")
	   || dnsDomainIs(host, "www.cartooncorner.com")
	   || dnsDomainIs(host, "www.cartooncritters.com")
	   || dnsDomainIs(host, "www.cartoonnetwork.com")
	   || dnsDomainIs(host, "www.carvingpatterns.com")
	   || dnsDomainIs(host, "www.cashuniversity.com")
	   || dnsDomainIs(host, "www.castles-of-britain.com")
	   || dnsDomainIs(host, "www.castlewales.com")
	   || dnsDomainIs(host, "www.catholic-forum.com")
	   || dnsDomainIs(host, "www.catholic.net")
	   || dnsDomainIs(host, "www.cattle.guelph.on.ca")
	   || dnsDomainIs(host, "www.cavedive.com")
	   || dnsDomainIs(host, "www.caveofthewinds.com")
	   || dnsDomainIs(host, "www.cbc4kids.ca")
	   || dnsDomainIs(host, "www.ccer.ggl.ruu.nl")
	   || dnsDomainIs(host, "www.ccnet.com")
	   || dnsDomainIs(host, "www.celineonline.com")
	   || dnsDomainIs(host, "www.cellsalive.com")
	   || dnsDomainIs(host, "www.centuryinshoes.com")
	   || dnsDomainIs(host, "www.cfl.ca")
	   || dnsDomainIs(host, "www.channel4.com")
	   || dnsDomainIs(host, "www.channel8.net")
	   || dnsDomainIs(host, "www.chanukah99.com")
	   || dnsDomainIs(host, "www.charged.com")
	   || dnsDomainIs(host, "www.chargers.com")
	   || dnsDomainIs(host, "www.charlotte.com")
	   || dnsDomainIs(host, "www.chaseday.com")
	   || dnsDomainIs(host, "www.chateauversailles.fr")
	   || dnsDomainIs(host, "www.cheatcc.com")
	   || dnsDomainIs(host, "www.cheerleading.net")
	   || dnsDomainIs(host, "www.cheese.com")
	   || dnsDomainIs(host, "www.chem4kids.com")
	   || dnsDomainIs(host, "www.chemicool.com")
	   || dnsDomainIs(host, "www.cherbearsden.com")
	   || dnsDomainIs(host, "www.chesskids.com")
	   || dnsDomainIs(host, "www.chessvariants.com")
	   || dnsDomainIs(host, "www.cheungswingchun.com")
	   || dnsDomainIs(host, "www.chevroncars.com")
	   || dnsDomainIs(host, "www.chibi.simplenet.com")
	   || dnsDomainIs(host, "www.chicagobears.com")
	   || dnsDomainIs(host, "www.chicagoblackhawks.com")
	   || dnsDomainIs(host, "www.chickasaw.net")
	   || dnsDomainIs(host, "www.childrensmusic.co.uk")
	   || dnsDomainIs(host, "www.childrenssoftware.com")
	   || dnsDomainIs(host, "www.childrenstory.com")
	   || dnsDomainIs(host, "www.childrenwithdiabetes.com")
	   || dnsDomainIs(host, "www.chinapage.com")
	   || dnsDomainIs(host, "www.chinatoday.com")
	   || dnsDomainIs(host, "www.chinavista.com")
	   || dnsDomainIs(host, "www.chinnet.net")
	   || dnsDomainIs(host, "www.chiquita.com")
	   || dnsDomainIs(host, "www.chisox.com")
	   || dnsDomainIs(host, "www.chivalry.com")
	   || dnsDomainIs(host, "www.christiananswers.net")
	   || dnsDomainIs(host, "www.christianity.com")
	   || dnsDomainIs(host, "www.christmas.com")
	   || dnsDomainIs(host, "www.christmas98.com")
	   || dnsDomainIs(host, "www.chron.com")
	   || dnsDomainIs(host, "www.chronique.com")
	   || dnsDomainIs(host, "www.chuckecheese.com")
	   || dnsDomainIs(host, "www.chucklebait.com")
	   || dnsDomainIs(host, "www.chunkymonkey.com")
	   || dnsDomainIs(host, "www.ci.chi.il.us")
	   || dnsDomainIs(host, "www.ci.nyc.ny.us")
	   || dnsDomainIs(host, "www.ci.phoenix.az.us")
	   || dnsDomainIs(host, "www.ci.san-diego.ca.us")
	   || dnsDomainIs(host, "www.cibc.com")
	   || dnsDomainIs(host, "www.ciderpresspottery.com")
	   || dnsDomainIs(host, "www.cincinnatireds.com")
	   || dnsDomainIs(host, "www.circusparade.com")
	   || dnsDomainIs(host, "www.circusweb.com")
	   || dnsDomainIs(host, "www.cirquedusoleil.com")
	   || dnsDomainIs(host, "www.cit.state.vt.us")
	   || dnsDomainIs(host, "www.citycastles.com")
	   || dnsDomainIs(host, "www.cityu.edu.hk")
	   || dnsDomainIs(host, "www.civicmind.com")
	   || dnsDomainIs(host, "www.civil-war.net")
	   || dnsDomainIs(host, "www.civilization.ca")
	   || dnsDomainIs(host, "www.cl.cam.ac.uk")
	   || dnsDomainIs(host, "www.clantongang.com")
	   || dnsDomainIs(host, "www.clark.net")
	   || dnsDomainIs(host, "www.classicgaming.com")
	   || dnsDomainIs(host, "www.claus.com")
	   || dnsDomainIs(host, "www.clayz.com")
	   || dnsDomainIs(host, "www.clearcf.uvic.ca")
	   || dnsDomainIs(host, "www.clearlight.com")
	   || dnsDomainIs(host, "www.clemusart.com")
	   || dnsDomainIs(host, "www.clevelandbrowns.com")
	   || dnsDomainIs(host, "www.clipartcastle.com")
	   || dnsDomainIs(host, "www.clubi.ie")
	   || dnsDomainIs(host, "www.cnn.com")
	   || dnsDomainIs(host, "www.co.henrico.va.us")
	   || dnsDomainIs(host, "www.coax.net")
	   || dnsDomainIs(host, "www.cocacola.com")
	   || dnsDomainIs(host, "www.cocori.com")
	   || dnsDomainIs(host, "www.codesmiths.com")
	   || dnsDomainIs(host, "www.codetalk.fed.us")
	   || dnsDomainIs(host, "www.coin-gallery.com")
	   || dnsDomainIs(host, "www.colinthompson.com")
	   || dnsDomainIs(host, "www.collectoronline.com")
	   || dnsDomainIs(host, "www.colonialhall.com")
	   || dnsDomainIs(host, "www.coloradoavalanche.com")
	   || dnsDomainIs(host, "www.coloradorockies.com")
	   || dnsDomainIs(host, "www.colormathpink.com")
	   || dnsDomainIs(host, "www.colts.com")
	   || dnsDomainIs(host, "www.comet.net")
	   || dnsDomainIs(host, "www.cometsystems.com")
	   || dnsDomainIs(host, "www.comicbookresources.com")
	   || dnsDomainIs(host, "www.comicspage.com")
	   || dnsDomainIs(host, "www.compassnet.com")
	   || dnsDomainIs(host, "www.compleatbellairs.com")
	   || dnsDomainIs(host, "www.comptons.com")
	   || dnsDomainIs(host, "www.concentric.net")
	   || dnsDomainIs(host, "www.congogorillaforest.com")
	   || dnsDomainIs(host, "www.conjuror.com")
	   || dnsDomainIs(host, "www.conk.com")
	   || dnsDomainIs(host, "www.conservation.state.mo.us")
	   || dnsDomainIs(host, "www.contracostatimes.com")
	   || dnsDomainIs(host, "www.control.chalmers.se")
	   || dnsDomainIs(host, "www.cookierecipe.com")
	   || dnsDomainIs(host, "www.cooljapanesetoys.com")
	   || dnsDomainIs(host, "www.cooper.com")
	   || dnsDomainIs(host, "www.corpcomm.net")
	   || dnsDomainIs(host, "www.corrietenboom.com")
	   || dnsDomainIs(host, "www.corynet.com")
	   || dnsDomainIs(host, "www.corypaints.com")
	   || dnsDomainIs(host, "www.cosmosmith.com")
	   || dnsDomainIs(host, "www.countdown2000.com")
	   || dnsDomainIs(host, "www.cowboy.net")
	   || dnsDomainIs(host, "www.cowboypal.com")
	   || dnsDomainIs(host, "www.cowcreek.com")
	   || dnsDomainIs(host, "www.cowgirl.net")
	   || dnsDomainIs(host, "www.cowgirls.com")
	   || dnsDomainIs(host, "www.cp.duluth.mn.us")
	   || dnsDomainIs(host, "www.cpsweb.com")
	   || dnsDomainIs(host, "www.craftideas.com")
	   || dnsDomainIs(host, "www.craniamania.com")
	   || dnsDomainIs(host, "www.crater.lake.national-park.com")
	   || dnsDomainIs(host, "www.crayoncrawler.com")
	   || dnsDomainIs(host, "www.crazybone.com")
	   || dnsDomainIs(host, "www.crazybones.com")
	   || dnsDomainIs(host, "www.crd.ge.com")
	   || dnsDomainIs(host, "www.create4kids.com")
	   || dnsDomainIs(host, "www.creativemusic.com")
	   || dnsDomainIs(host, "www.crocodilian.com")
	   || dnsDomainIs(host, "www.crop.cri.nz")
	   || dnsDomainIs(host, "www.cruzio.com")
	   || dnsDomainIs(host, "www.crwflags.com")
	   || dnsDomainIs(host, "www.cryptograph.com")
	   || dnsDomainIs(host, "www.cryst.bbk.ac.uk")
	   || dnsDomainIs(host, "www.cs.bilkent.edu.tr")
	   || dnsDomainIs(host, "www.cs.man.ac.uk")
	   || dnsDomainIs(host, "www.cs.sfu.ca")
	   || dnsDomainIs(host, "www.cs.ubc.ca")
	   || dnsDomainIs(host, "www.csd.uu.se")
	   || dnsDomainIs(host, "www.csmonitor.com")
	   || dnsDomainIs(host, "www.csse.monash.edu.au")
	   || dnsDomainIs(host, "www.cstone.net")
	   || dnsDomainIs(host, "www.csu.edu.au")
	   || dnsDomainIs(host, "www.cubs.com")
	   || dnsDomainIs(host, "www.culture.fr")
	   || dnsDomainIs(host, "www.cultures.com")
	   || dnsDomainIs(host, "www.curtis-collection.com")
	   || dnsDomainIs(host, "www.cut-the-knot.com")
	   || dnsDomainIs(host, "www.cws-scf.ec.gc.ca")
	   || dnsDomainIs(host, "www.cyber-dyne.com")
	   || dnsDomainIs(host, "www.cyberbee.com")
	   || dnsDomainIs(host, "www.cyberbee.net")
	   || dnsDomainIs(host, "www.cybercom.net")
	   || dnsDomainIs(host, "www.cybercomm.net")
	   || dnsDomainIs(host, "www.cybercomm.nl")
	   || dnsDomainIs(host, "www.cybercorp.co.nz")
	   || dnsDomainIs(host, "www.cybercs.com")
	   || dnsDomainIs(host, "www.cybergoal.com")
	   || dnsDomainIs(host, "www.cyberkids.com")
	   || dnsDomainIs(host, "www.cyberspaceag.com")
	   || dnsDomainIs(host, "www.cyberteens.com")
	   || dnsDomainIs(host, "www.cybertours.com")
	   || dnsDomainIs(host, "www.cybiko.com")
	   || dnsDomainIs(host, "www.czweb.com")
	   || dnsDomainIs(host, "www.d91.k12.id.us")
	   || dnsDomainIs(host, "www.dailygrammar.com")
	   || dnsDomainIs(host, "www.dakidz.com")
	   || dnsDomainIs(host, "www.dalejarrettonline.com")
	   || dnsDomainIs(host, "www.dallascowboys.com")
	   || dnsDomainIs(host, "www.dallasdogndisc.com")
	   || dnsDomainIs(host, "www.dallasstars.com")
	   || dnsDomainIs(host, "www.damnyankees.com")
	   || dnsDomainIs(host, "www.danceart.com")
	   || dnsDomainIs(host, "www.daniellesplace.com")
	   || dnsDomainIs(host, "www.dare-america.com")
	   || dnsDomainIs(host, "www.darkfish.com")
	   || dnsDomainIs(host, "www.darsbydesign.com")
	   || dnsDomainIs(host, "www.datadragon.com")
	   || dnsDomainIs(host, "www.davidreilly.com")
	   || dnsDomainIs(host, "www.dccomics.com")
	   || dnsDomainIs(host, "www.dcn.davis.ca.us")
	   || dnsDomainIs(host, "www.deepseaworld.com")
	   || dnsDomainIs(host, "www.delawaretribeofindians.nsn.us")
	   || dnsDomainIs(host, "www.demon.co.uk")
	   || dnsDomainIs(host, "www.denverbroncos.com")
	   || dnsDomainIs(host, "www.denverpost.com")
	   || dnsDomainIs(host, "www.dep.state.pa.us")
	   || dnsDomainIs(host, "www.desert-fairy.com")
	   || dnsDomainIs(host, "www.desert-storm.com")
	   || dnsDomainIs(host, "www.desertusa.com")
	   || dnsDomainIs(host, "www.designltd.com")
	   || dnsDomainIs(host, "www.designsbykat.com")
	   || dnsDomainIs(host, "www.detnews.com")
	   || dnsDomainIs(host, "www.detroitlions.com")
	   || dnsDomainIs(host, "www.detroitredwings.com")
	   || dnsDomainIs(host, "www.detroittigers.com")
	   || dnsDomainIs(host, "www.deutsches-museum.de")
	   || dnsDomainIs(host, "www.devilray.com")
	   || dnsDomainIs(host, "www.dhorse.com")
	   || dnsDomainIs(host, "www.diana-ross.co.uk")
	   || dnsDomainIs(host, "www.dianarossandthesupremes.net")
	   || dnsDomainIs(host, "www.diaryproject.com")
	   || dnsDomainIs(host, "www.dickbutkus.com")
	   || dnsDomainIs(host, "www.dickshovel.com")
	   || dnsDomainIs(host, "www.dictionary.com")
	   || dnsDomainIs(host, "www.didyouknow.com")
	   || dnsDomainIs(host, "www.diegorivera.com")
	   || dnsDomainIs(host, "www.digitalcentury.com")
	   || dnsDomainIs(host, "www.digitaldog.com")
	   || dnsDomainIs(host, "www.digiweb.com")
	   || dnsDomainIs(host, "www.dimdima.com")
	   || dnsDomainIs(host, "www.dinodon.com")
	   || dnsDomainIs(host, "www.dinosauria.com")
	   || dnsDomainIs(host, "www.discovereso.com")
	   || dnsDomainIs(host, "www.discovergalapagos.com")
	   || dnsDomainIs(host, "www.discovergames.com")
	   || dnsDomainIs(host, "www.discoveringarchaeology.com")
	   || dnsDomainIs(host, "www.discoveringmontana.com")
	   || dnsDomainIs(host, "www.discoverlearning.com")
	   || dnsDomainIs(host, "www.discovery.com")
	   || dnsDomainIs(host, "www.disknet.com")
	   || dnsDomainIs(host, "www.disney.go.com")
	   || dnsDomainIs(host, "www.distinguishedwomen.com")
	   || dnsDomainIs(host, "www.dkonline.com")
	   || dnsDomainIs(host, "www.dltk-kids.com")
	   || dnsDomainIs(host, "www.dmgi.com")
	   || dnsDomainIs(host, "www.dnr.state.md.us")
	   || dnsDomainIs(host, "www.dnr.state.mi.us")
	   || dnsDomainIs(host, "www.dnr.state.wi.us")
	   || dnsDomainIs(host, "www.dodgers.com")
	   || dnsDomainIs(host, "www.dodoland.com")
	   || dnsDomainIs(host, "www.dog-play.com")
	   || dnsDomainIs(host, "www.dogbreedinfo.com")
	   || dnsDomainIs(host, "www.doginfomat.com")
	   || dnsDomainIs(host, "www.dole5aday.com")
	   || dnsDomainIs(host, "www.dollart.com")
	   || dnsDomainIs(host, "www.dolliedish.com")
	   || dnsDomainIs(host, "www.dome2000.co.uk")
	   || dnsDomainIs(host, "www.domtar.com")
	   || dnsDomainIs(host, "www.donegal.k12.pa.us")
	   || dnsDomainIs(host, "www.dorneypark.com")
	   || dnsDomainIs(host, "www.dorothyhinshawpatent.com")
	   || dnsDomainIs(host, "www.dougweb.com")
	   || dnsDomainIs(host, "www.dps.state.ak.us")
	   || dnsDomainIs(host, "www.draw3d.com")
	   || dnsDomainIs(host, "www.dreamgate.com")
	   || dnsDomainIs(host, "www.dreamkitty.com")
	   || dnsDomainIs(host, "www.dreamscape.com")
	   || dnsDomainIs(host, "www.dreamtime.net.au")
	   || dnsDomainIs(host, "www.drpeppermuseum.com")
	   || dnsDomainIs(host, "www.drscience.com")
	   || dnsDomainIs(host, "www.drseward.com")
	   || dnsDomainIs(host, "www.drtoy.com")
	   || dnsDomainIs(host, "www.dse.nl")
	   || dnsDomainIs(host, "www.dtic.mil")
	   || dnsDomainIs(host, "www.duracell.com")
	   || dnsDomainIs(host, "www.dustbunny.com")
	   || dnsDomainIs(host, "www.dynanet.com")
	   || dnsDomainIs(host, "www.eagerreaders.com")
	   || dnsDomainIs(host, "www.eaglekids.com")
	   || dnsDomainIs(host, "www.earthcalendar.net")
	   || dnsDomainIs(host, "www.earthday.net")
	   || dnsDomainIs(host, "www.earthdog.com")
	   || dnsDomainIs(host, "www.earthwatch.com")
	   || dnsDomainIs(host, "www.ease.com")
	   || dnsDomainIs(host, "www.eastasia.ws")
	   || dnsDomainIs(host, "www.easytype.com")
	   || dnsDomainIs(host, "www.eblewis.com")
	   || dnsDomainIs(host, "www.ebs.hw.ac.uk")
	   || dnsDomainIs(host, "www.eclipse.net")
	   || dnsDomainIs(host, "www.eco-pros.com")
	   || dnsDomainIs(host, "www.edbydesign.com")
	   || dnsDomainIs(host, "www.eddytheeco-dog.com")
	   || dnsDomainIs(host, "www.edgate.com")
	   || dnsDomainIs(host, "www.edmontonoilers.com")
	   || dnsDomainIs(host, "www.edu-source.com")
	   || dnsDomainIs(host, "www.edu.gov.on.ca")
	   || dnsDomainIs(host, "www.edu4kids.com")
	   || dnsDomainIs(host, "www.educ.uvic.ca")
	   || dnsDomainIs(host, "www.educate.org.uk")
	   || dnsDomainIs(host, "www.education-world.com")
	   || dnsDomainIs(host, "www.edunet.com")
	   || dnsDomainIs(host, "www.eduplace.com")
	   || dnsDomainIs(host, "www.edupuppy.com")
	   || dnsDomainIs(host, "www.eduweb.com")
	   || dnsDomainIs(host, "www.ee.ryerson.ca")
	   || dnsDomainIs(host, "www.ee.surrey.ac.uk")
	   || dnsDomainIs(host, "www.eeggs.com")
	   || dnsDomainIs(host, "www.efes.com")
	   || dnsDomainIs(host, "www.egalvao.com")
	   || dnsDomainIs(host, "www.egypt.com")
	   || dnsDomainIs(host, "www.egyptology.com")
	   || dnsDomainIs(host, "www.ehobbies.com")
	   || dnsDomainIs(host, "www.ehow.com")
	   || dnsDomainIs(host, "www.eia.brad.ac.uk")
	   || dnsDomainIs(host, "www.elbalero.gob.mx")
	   || dnsDomainIs(host, "www.eliki.com")
	   || dnsDomainIs(host, "www.elnino.com")
	   || dnsDomainIs(host, "www.elok.com")
	   || dnsDomainIs(host, "www.emf.net")
	   || dnsDomainIs(host, "www.emsphone.com")
	   || dnsDomainIs(host, "www.emulateme.com")
	   || dnsDomainIs(host, "www.en.com")
	   || dnsDomainIs(host, "www.enature.com")
	   || dnsDomainIs(host, "www.enchantedlearning.com")
	   || dnsDomainIs(host, "www.encyclopedia.com")
	   || dnsDomainIs(host, "www.endex.com")
	   || dnsDomainIs(host, "www.enjoyillinois.com")
	   || dnsDomainIs(host, "www.enn.com")
	   || dnsDomainIs(host, "www.enriqueig.com")
	   || dnsDomainIs(host, "www.enteract.com")
	   || dnsDomainIs(host, "www.epals.com")
	   || dnsDomainIs(host, "www.equine-world.co.uk")
	   || dnsDomainIs(host, "www.eric-carle.com")
	   || dnsDomainIs(host, "www.ericlindros.net")
	   || dnsDomainIs(host, "www.escape.com")
	   || dnsDomainIs(host, "www.eskimo.com")
	   || dnsDomainIs(host, "www.essentialsofmusic.com")
	   || dnsDomainIs(host, "www.etch-a-sketch.com")
	   || dnsDomainIs(host, "www.ethanallen.together.com")
	   || dnsDomainIs(host, "www.etoys.com")
	   || dnsDomainIs(host, "www.eurekascience.com")
	   || dnsDomainIs(host, "www.euronet.nl")
	   || dnsDomainIs(host, "www.everyrule.com")
	   || dnsDomainIs(host, "www.ex.ac.uk")
	   || dnsDomainIs(host, "www.excite.com")
	   || dnsDomainIs(host, "www.execpc.com")
	   || dnsDomainIs(host, "www.execulink.com")
	   || dnsDomainIs(host, "www.exn.net")
	   || dnsDomainIs(host, "www.expa.hvu.nl")
	   || dnsDomainIs(host, "www.expage.com")
	   || dnsDomainIs(host, "www.explode.to")
	   || dnsDomainIs(host, "www.explorescience.com")
	   || dnsDomainIs(host, "www.explorezone.com")
	   || dnsDomainIs(host, "www.extremescience.com")
	   || dnsDomainIs(host, "www.eyelid.co.uk")
	   || dnsDomainIs(host, "www.eyeneer.com")
	   || dnsDomainIs(host, "www.eyesofachild.com")
	   || dnsDomainIs(host, "www.eyesofglory.com")
	   || dnsDomainIs(host, "www.ezschool.com")
	   || dnsDomainIs(host, "www.f1-live.com")
	   || dnsDomainIs(host, "www.fables.co.uk")
	   || dnsDomainIs(host, "www.factmonster.com")
	   || dnsDomainIs(host, "www.fairygodmother.com")
	   || dnsDomainIs(host, "www.familybuzz.com")
	   || dnsDomainIs(host, "www.familygames.com")
	   || dnsDomainIs(host, "www.familygardening.com")
	   || dnsDomainIs(host, "www.familyinternet.com")
	   || dnsDomainIs(host, "www.familymoney.com")
	   || dnsDomainIs(host, "www.familyplay.com")
	   || dnsDomainIs(host, "www.famousbirthdays.com")
	   || dnsDomainIs(host, "www.fandom.com")
	   || dnsDomainIs(host, "www.fansites.com")
	   || dnsDomainIs(host, "www.faoschwarz.com")
	   || dnsDomainIs(host, "www.fbe.unsw.edu.au")
	   || dnsDomainIs(host, "www.fcps.k12.va.us")
	   || dnsDomainIs(host, "www.fellersartsfactory.com")
	   || dnsDomainIs(host, "www.ferrari.it")
	   || dnsDomainIs(host, "www.fertnel.com")
	   || dnsDomainIs(host, "www.fh-konstanz.de")
	   || dnsDomainIs(host, "www.fhw.gr")
	   || dnsDomainIs(host, "www.fibblesnork.com")
	   || dnsDomainIs(host, "www.fidnet.com")
	   || dnsDomainIs(host, "www.fieldhockey.com")
	   || dnsDomainIs(host, "www.fieldhockeytraining.com")
	   || dnsDomainIs(host, "www.fieler.com")
	   || dnsDomainIs(host, "www.finalfour.net")
	   || dnsDomainIs(host, "www.finifter.com")
	   || dnsDomainIs(host, "www.fireworks-safety.com")
	   || dnsDomainIs(host, "www.firstcut.com")
	   || dnsDomainIs(host, "www.firstnations.com")
	   || dnsDomainIs(host, "www.fishbc.com")
	   || dnsDomainIs(host, "www.fisher-price.com")
	   || dnsDomainIs(host, "www.fisheyeview.com")
	   || dnsDomainIs(host, "www.fishgeeks.com")
	   || dnsDomainIs(host, "www.fishindex.com")
	   || dnsDomainIs(host, "www.fitzgeraldstudio.com")
	   || dnsDomainIs(host, "www.flags.net")
	   || dnsDomainIs(host, "www.flail.com")
	   || dnsDomainIs(host, "www.flamarlins.com")
	   || dnsDomainIs(host, "www.flausa.com")
	   || dnsDomainIs(host, "www.floodlight-findings.com")
	   || dnsDomainIs(host, "www.floridahistory.com")
	   || dnsDomainIs(host, "www.floridapanthers.com")
	   || dnsDomainIs(host, "www.fng.fi")
	   || dnsDomainIs(host, "www.foodsci.uoguelph.ca")
	   || dnsDomainIs(host, "www.foremost.com")
	   || dnsDomainIs(host, "www.fortress.am")
	   || dnsDomainIs(host, "www.fortunecity.com")
	   || dnsDomainIs(host, "www.fosterclub.com")
	   || dnsDomainIs(host, "www.foundus.com")
	   || dnsDomainIs(host, "www.fourmilab.ch")
	   || dnsDomainIs(host, "www.fox.com")
	   || dnsDomainIs(host, "www.foxfamilychannel.com")
	   || dnsDomainIs(host, "www.foxhome.com")
	   || dnsDomainIs(host, "www.foxkids.com")
	   || dnsDomainIs(host, "www.franceway.com")
	   || dnsDomainIs(host, "www.fred.net")
	   || dnsDomainIs(host, "www.fredpenner.com")
	   || dnsDomainIs(host, "www.freedomknot.com")
	   || dnsDomainIs(host, "www.freejigsawpuzzles.com")
	   || dnsDomainIs(host, "www.freenet.edmonton.ab.ca")
	   || dnsDomainIs(host, "www.frii.com")
	   || dnsDomainIs(host, "www.frisbee.com")
	   || dnsDomainIs(host, "www.fritolay.com")
	   || dnsDomainIs(host, "www.frogsonice.com")
	   || dnsDomainIs(host, "www.frontiernet.net")
	   || dnsDomainIs(host, "www.fs.fed.us")
	   || dnsDomainIs(host, "www.funattic.com")
	   || dnsDomainIs(host, ".funbrain.com")
	   || dnsDomainIs(host, "www.fundango.com")
	   || dnsDomainIs(host, "www.funisland.com")
	   || dnsDomainIs(host, "www.funkandwagnalls.com")
	   || dnsDomainIs(host, "www.funorama.com")
	   || dnsDomainIs(host, "www.funschool.com")
	   || dnsDomainIs(host, "www.funster.com")
	   || dnsDomainIs(host, "www.furby.com")
	   || dnsDomainIs(host, "www.fusion.org.uk")
	   || dnsDomainIs(host, "www.futcher.com")
	   || dnsDomainIs(host, "www.futurescan.com")
	   || dnsDomainIs(host, "www.fyi.net")
	   || dnsDomainIs(host, "www.gailgibbons.com")
	   || dnsDomainIs(host, "www.galegroup.com")
	   || dnsDomainIs(host, "www.gambia.com")
	   || dnsDomainIs(host, "www.gamecabinet.com")
	   || dnsDomainIs(host, "www.gamecenter.com")
	   || dnsDomainIs(host, "www.gamefaqs.com")
	   || dnsDomainIs(host, "www.garfield.com")
	   || dnsDomainIs(host, "www.garyharbo.com")
	   || dnsDomainIs(host, "www.gatefish.com")
	   || dnsDomainIs(host, "www.gateway-va.com")
	   || dnsDomainIs(host, "www.gazillionaire.com")
	   || dnsDomainIs(host, "www.gearhead.com")
	   || dnsDomainIs(host, "www.genesplicing.com")
	   || dnsDomainIs(host, "www.genhomepage.com")
	   || dnsDomainIs(host, "www.geobop.com")
	   || dnsDomainIs(host, "www.geocities.com")
	   || dnsDomainIs(host, "www.geographia.com")
	   || dnsDomainIs(host, "www.georgeworld.com")
	   || dnsDomainIs(host, "www.georgian.net")
	   || dnsDomainIs(host, "www.german-way.com")
	   || dnsDomainIs(host, "www.germanfortravellers.com")
	   || dnsDomainIs(host, "www.germantown.k12.il.us")
	   || dnsDomainIs(host, "www.germany-tourism.de")
	   || dnsDomainIs(host, "www.getmusic.com")
	   || dnsDomainIs(host, "www.gettysburg.com")
	   || dnsDomainIs(host, "www.ghirardellisq.com")
	   || dnsDomainIs(host, "www.ghosttowngallery.com")
	   || dnsDomainIs(host, "www.ghosttownsusa.com")
	   || dnsDomainIs(host, "www.giants.com")
	   || dnsDomainIs(host, "www.gibraltar.gi")
	   || dnsDomainIs(host, "www.gigglepoetry.com")
	   || dnsDomainIs(host, "www.gilchriststudios.com")
	   || dnsDomainIs(host, "www.gillslap.freeserve.co.uk")
	   || dnsDomainIs(host, "www.gilmer.net")
	   || dnsDomainIs(host, "www.gio.gov.tw")
	   || dnsDomainIs(host, "www.girltech.com")
	   || dnsDomainIs(host, "www.girlzone.com")
	   || dnsDomainIs(host, "www.globalgang.org.uk")
	   || dnsDomainIs(host, "www.globalindex.com")
	   || dnsDomainIs(host, "www.globalinfo.com")
	   || dnsDomainIs(host, "www.gloriafan.com")
	   || dnsDomainIs(host, "www.gms.ocps.k12.fl.us")
	   || dnsDomainIs(host, "www.go-go-diggity.com")
	   || dnsDomainIs(host, "www.goals.com")
	   || dnsDomainIs(host, "www.godiva.com")
	   || dnsDomainIs(host, "www.golden-retriever.com")
	   || dnsDomainIs(host, "www.goldenbooks.com")
	   || dnsDomainIs(host, "www.goldeneggs.com.au")
	   || dnsDomainIs(host, "www.golfonline.com")
	   || dnsDomainIs(host, "www.goobo.com")
	   || dnsDomainIs(host, "www.goodearthgraphics.com")
	   || dnsDomainIs(host, "www.goodyear.com")
	   || dnsDomainIs(host, "www.gopbi.com")
	   || dnsDomainIs(host, "www.gorge.net")
	   || dnsDomainIs(host, "www.gorp.com")
	   || dnsDomainIs(host, "www.got-milk.com")
	   || dnsDomainIs(host, "www.gov.ab.ca")
	   || dnsDomainIs(host, "www.gov.nb.ca")
	   || dnsDomainIs(host, "www.grammarbook.com")
	   || dnsDomainIs(host, "www.grammarlady.com")
	   || dnsDomainIs(host, "www.grandparents-day.com")
	   || dnsDomainIs(host, "www.granthill.com")
	   || dnsDomainIs(host, "www.grayweb.com")
	   || dnsDomainIs(host, "www.greatbuildings.com")
	   || dnsDomainIs(host, "www.greatkids.com")
	   || dnsDomainIs(host, "www.greatscience.com")
	   || dnsDomainIs(host, "www.greeceny.com")
	   || dnsDomainIs(host, "www.greenkeepers.com")
	   || dnsDomainIs(host, "www.greylabyrinth.com")
	   || dnsDomainIs(host, "www.grimmy.com")
	   || dnsDomainIs(host, "www.gsrg.nmh.ac.uk")
	   || dnsDomainIs(host, "www.gti.net")
	   || dnsDomainIs(host, "www.guinnessworldrecords.com")
	   || dnsDomainIs(host, "www.guitar.net")
	   || dnsDomainIs(host, "www.guitarplaying.com")
	   || dnsDomainIs(host, "www.gumbyworld.com")
	   || dnsDomainIs(host, "www.gurlwurld.com")
	   || dnsDomainIs(host, "www.gwi.net")
	   || dnsDomainIs(host, "www.gymn-forum.com")
	   || dnsDomainIs(host, "www.gzkidzone.com")
	   || dnsDomainIs(host, "www.haemibalgassi.com")
	   || dnsDomainIs(host, "www.hairstylist.com")
	   || dnsDomainIs(host, "www.halcyon.com")
	   || dnsDomainIs(host, "www.halifax.cbc.ca")
	   || dnsDomainIs(host, "www.halloween-online.com")
	   || dnsDomainIs(host, "www.halloweenkids.com")
	   || dnsDomainIs(host, "www.halloweenmagazine.com")
	   || dnsDomainIs(host, "www.hamill.co.uk")
	   || dnsDomainIs(host, "www.hamsterdance2.com")
	   || dnsDomainIs(host, "www.hamsters.co.uk")
	   || dnsDomainIs(host, "www.hamstertours.com")
	   || dnsDomainIs(host, "www.handsonmath.com")
	   || dnsDomainIs(host, "www.handspeak.com")
	   || dnsDomainIs(host, "www.hansonline.com")
	   || dnsDomainIs(host, "www.happychild.org.uk")
	   || dnsDomainIs(host, "www.happyfamilies.com")
	   || dnsDomainIs(host, "www.happytoy.com")
	   || dnsDomainIs(host, "www.harley-davidson.com")
	   || dnsDomainIs(host, "www.harmonicalessons.com")
	   || dnsDomainIs(host, "www.harperchildrens.com")
	   || dnsDomainIs(host, "www.harvey.com")
	   || dnsDomainIs(host, "www.hasbro-interactive.com")
	   || dnsDomainIs(host, "www.haynet.net")
	   || dnsDomainIs(host, "www.hbc.com")
	   || dnsDomainIs(host, "www.hblewis.com")
	   || dnsDomainIs(host, "www.hbook.com")
	   || dnsDomainIs(host, "www.he.net")
	   || dnsDomainIs(host, "www.headbone.com")
	   || dnsDomainIs(host, "www.healthatoz.com")
	   || dnsDomainIs(host, "www.healthypet.com")
	   || dnsDomainIs(host, "www.heartfoundation.com.au")
	   || dnsDomainIs(host, "www.heatersworld.com")
	   || dnsDomainIs(host, "www.her-online.com")
	   || dnsDomainIs(host, "www.heroesofhistory.com")
	   || dnsDomainIs(host, "www.hersheypa.com")
	   || dnsDomainIs(host, "www.hersheys.com")
	   || dnsDomainIs(host, "www.hevanet.com")
	   || dnsDomainIs(host, "www.heynetwork.com")
	   || dnsDomainIs(host, "www.hgo.com")
	   || dnsDomainIs(host, "www.hhof.com")
	   || dnsDomainIs(host, "www.hideandseekpuppies.com")
	   || dnsDomainIs(host, "www.hifusion.com")
	   || dnsDomainIs(host, "www.highbridgepress.com")
	   || dnsDomainIs(host, "www.his.com")
	   || dnsDomainIs(host, "www.history.navy.mil")
	   || dnsDomainIs(host, "www.historychannel.com")
	   || dnsDomainIs(host, "www.historyhouse.com")
	   || dnsDomainIs(host, "www.historyplace.com")
	   || dnsDomainIs(host, "www.hisurf.com")
	   || dnsDomainIs(host, "www.hiyah.com")
	   || dnsDomainIs(host, "www.hmnet.com")
	   || dnsDomainIs(host, "www.hoboes.com")
	   || dnsDomainIs(host, "www.hockeydb.com")
	   || dnsDomainIs(host, "www.hohnerusa.com")
	   || dnsDomainIs(host, "www.holidaychannel.com")
	   || dnsDomainIs(host, "www.holidayfestival.com")
	   || dnsDomainIs(host, "www.holidays.net")
	   || dnsDomainIs(host, "www.hollywood.com")
	   || dnsDomainIs(host, "www.holoworld.com")
	   || dnsDomainIs(host, "www.homepagers.com")
	   || dnsDomainIs(host, "www.homeschoolzone.com")
	   || dnsDomainIs(host, "www.homestead.com")
	   || dnsDomainIs(host, "www.homeworkspot.com")
	   || dnsDomainIs(host, "www.hompro.com")
	   || dnsDomainIs(host, "www.honey.com")
	   || dnsDomainIs(host, "www.hooked.net")
	   || dnsDomainIs(host, "www.hoophall.com")
	   || dnsDomainIs(host, "www.hooverdam.com")
	   || dnsDomainIs(host, "www.hopepaul.com")
	   || dnsDomainIs(host, "www.horse-country.com")
	   || dnsDomainIs(host, "www.horsechat.com")
	   || dnsDomainIs(host, "www.horsefun.com")
	   || dnsDomainIs(host, "www.horus.ics.org.eg")
	   || dnsDomainIs(host, "www.hotbraille.com")
	   || dnsDomainIs(host, "www.hotwheels.com")
	   || dnsDomainIs(host, "www.howstuffworks.com")
	   || dnsDomainIs(host, "www.hpdigitalbookclub.com")
	   || dnsDomainIs(host, "www.hpj.com")
	   || dnsDomainIs(host, "www.hpl.hp.com")
	   || dnsDomainIs(host, "www.hpl.lib.tx.us")
	   || dnsDomainIs(host, "www.hpnetwork.f2s.com")
	   || dnsDomainIs(host, "www.hsswp.com")
	   || dnsDomainIs(host, "www.hsx.com")
	   || dnsDomainIs(host, "www.humboldt1.com")
	   || dnsDomainIs(host, "www.humongous.com")
	   || dnsDomainIs(host, "www.humph3.freeserve.co.uk")
	   || dnsDomainIs(host, "www.humphreybear.com ")
	   || dnsDomainIs(host, "www.hurricanehunters.com")
	   || dnsDomainIs(host, "www.hyperhistory.com")
	   || dnsDomainIs(host, "www.i2k.com")
	   || dnsDomainIs(host, "www.ibhof.com")
	   || dnsDomainIs(host, "www.ibiscom.com")
	   || dnsDomainIs(host, "www.ibm.com")
	   || dnsDomainIs(host, "www.icangarden.com")
	   || dnsDomainIs(host, "www.icecreamusa.com")
	   || dnsDomainIs(host, "www.icn.co.uk")
	   || dnsDomainIs(host, "www.icomm.ca")
	   || dnsDomainIs(host, "www.idfishnhunt.com")
	   || dnsDomainIs(host, "www.iditarod.com")
	   || dnsDomainIs(host, "www.iei.net")
	   || dnsDomainIs(host, "www.iemily.com")
	   || dnsDomainIs(host, "www.iir.com")
	   || dnsDomainIs(host, "www.ika.com")
	   || dnsDomainIs(host, "www.ikoala.com")
	   || dnsDomainIs(host, "www.iln.net")
	   || dnsDomainIs(host, "www.imagine5.com")
	   || dnsDomainIs(host, "www.imes.boj.or.jp")
	   || dnsDomainIs(host, "www.inch.com")
	   || dnsDomainIs(host, "www.incwell.com")
	   || dnsDomainIs(host, "www.indian-river.fl.us")
	   || dnsDomainIs(host, "www.indians.com")
	   || dnsDomainIs(host, "www.indo.com")
	   || dnsDomainIs(host, "www.indyracingleague.com")
	   || dnsDomainIs(host, "www.indyzoo.com")
	   || dnsDomainIs(host, "www.info-canada.com")
	   || dnsDomainIs(host, "www.infomagic.net")
	   || dnsDomainIs(host, "www.infoplease.com")
	   || dnsDomainIs(host, "www.infoporium.com")
	   || dnsDomainIs(host, "www.infostuff.com")
	   || dnsDomainIs(host, "www.inhandmuseum.com")
	   || dnsDomainIs(host, "www.inil.com")
	   || dnsDomainIs(host, "www.inkspot.com")
	   || dnsDomainIs(host, "www.inkyfingers.com")
	   || dnsDomainIs(host, "www.innerauto.com")
	   || dnsDomainIs(host, "www.innerbody.com")
	   || dnsDomainIs(host, "www.inqpub.com")
	   || dnsDomainIs(host, "www.insecta-inspecta.com")
	   || dnsDomainIs(host, "www.insectclopedia.com")
	   || dnsDomainIs(host, "www.inside-mexico.com")
	   || dnsDomainIs(host, "www.insiders.com")
	   || dnsDomainIs(host, "www.insteam.com")
	   || dnsDomainIs(host, "www.intel.com")
	   || dnsDomainIs(host, "www.intellicast.com")
	   || dnsDomainIs(host, "www.interads.co.uk")
	   || dnsDomainIs(host, "www.intercot.com")
	   || dnsDomainIs(host, "www.intergraffix.com")
	   || dnsDomainIs(host, "www.interknowledge.com")
	   || dnsDomainIs(host, "www.interlog.com")
	   || dnsDomainIs(host, "www.internet4kids.com")
	   || dnsDomainIs(host, "www.intersurf.com")
	   || dnsDomainIs(host, "www.inthe80s.com")
	   || dnsDomainIs(host, "www.inventorsmuseum.com")
	   || dnsDomainIs(host, "www.inwap.com")
	   || dnsDomainIs(host, "www.ioa.com")
	   || dnsDomainIs(host, "www.ionet.net")
	   || dnsDomainIs(host, "www.iowacity.com")
	   || dnsDomainIs(host, "www.ireland-now.com")
	   || dnsDomainIs(host, "www.ireland.com")
	   || dnsDomainIs(host, "www.irelandseye.com")
	   || dnsDomainIs(host, "www.irlgov.ie")
	   || dnsDomainIs(host, "www.isd.net")
	   || dnsDomainIs(host, "www.islandnet.com")
	   || dnsDomainIs(host, "www.isomedia.com")
	   || dnsDomainIs(host, "www.itftennis.com")
	   || dnsDomainIs(host, "www.itpi.dpi.state.nc.us")
	   || dnsDomainIs(host, "www.itskwanzaatime.com")
	   || dnsDomainIs(host, "www.itss.raytheon.com")
	   || dnsDomainIs(host, "www.iuma.com")
	   || dnsDomainIs(host, "www.iwaynet.net")
	   || dnsDomainIs(host, "www.iwc.com")
	   || dnsDomainIs(host, "www.iwight.gov.uk")
	   || dnsDomainIs(host, "www.ixpres.com")
	   || dnsDomainIs(host, "www.j.b.allen.btinternet.co.uk")
	   || dnsDomainIs(host, "www.jabuti.com")
	   || dnsDomainIs(host, "www.jackinthebox.com")
	   || dnsDomainIs(host, "www.jaffebros.com")
	   || dnsDomainIs(host, "www.jaguars.com")
	   || dnsDomainIs(host, "www.jamaica-gleaner.com")
	   || dnsDomainIs(host, "www.jamm.com")
	   || dnsDomainIs(host, "www.janbrett.com")
	   || dnsDomainIs(host, "www.janetstevens.com")
	   || dnsDomainIs(host, "www.japan-guide.com")
	   || dnsDomainIs(host, "www.jargon.net")
	   || dnsDomainIs(host, "www.javelinamx.com")
	   || dnsDomainIs(host, "www.jayjay.com")
	   || dnsDomainIs(host, "www.jazclass.aust.com")
	   || dnsDomainIs(host, "www.jedinet.com")
	   || dnsDomainIs(host, "www.jenniferlopez.com")
	   || dnsDomainIs(host, "www.jlpanagopoulos.com")
	   || dnsDomainIs(host, "www.jmarshall.com")
	   || dnsDomainIs(host, "www.jmccall.demon.co.uk")
	   || dnsDomainIs(host, "www.jmts.com")
	   || dnsDomainIs(host, "www.joesherlock.com")
	   || dnsDomainIs(host, "www.jorvik-viking-centre.co.uk")
	   || dnsDomainIs(host, "www.joycecarolthomas.com")
	   || dnsDomainIs(host, "www.joycone.com")
	   || dnsDomainIs(host, "www.joyrides.com")
	   || dnsDomainIs(host, "www.jps.net")
	   || dnsDomainIs(host, "www.jspub.com")
	   || dnsDomainIs(host, "www.judaica.com")
	   || dnsDomainIs(host, "www.judyblume.com")
	   || dnsDomainIs(host, "www.julen.net")
	   || dnsDomainIs(host, "www.june29.com")
	   || dnsDomainIs(host, "www.juneteenth.com")
	   || dnsDomainIs(host, "www.justuskidz.com")
	   || dnsDomainIs(host, "www.justwomen.com")
	   || dnsDomainIs(host, "www.jwindow.net")
	   || dnsDomainIs(host, "www.k9web.com")
	   || dnsDomainIs(host, "www.kaercher.de")
	   || dnsDomainIs(host, "www.kaleidoscapes.com")
	   || dnsDomainIs(host, "www.kapili.com")
	   || dnsDomainIs(host, "www.kcchiefs.com")
	   || dnsDomainIs(host, "www.kcpl.lib.mo.us")
	   || dnsDomainIs(host, "www.kcroyals.com")
	   || dnsDomainIs(host, "www.kcsd.k12.pa.us")
	   || dnsDomainIs(host, "www.kdu.com")
	   || dnsDomainIs(host, "www.kelloggs.com")
	   || dnsDomainIs(host, "www.kentuckyfriedchicken.com")
	   || dnsDomainIs(host, "www.kenyaweb.com")
	   || dnsDomainIs(host, "www.keypals.com")
	   || dnsDomainIs(host, "www.kfn.com")
	   || dnsDomainIs(host, "www.kid-at-art.com")
	   || dnsDomainIs(host, "www.kid-channel.com")
	   || dnsDomainIs(host, "www.kidallergy.com")
	   || dnsDomainIs(host, "www.kidbibs.com")
	   || dnsDomainIs(host, "www.kidcomics.com")
	   || dnsDomainIs(host, "www.kiddesafety.com")
	   || dnsDomainIs(host, "www.kiddiecampus.com")
	   || dnsDomainIs(host, "www.kididdles.com")
	   || dnsDomainIs(host, "www.kidnews.com")
	   || dnsDomainIs(host, "www.kidocracy.com")
	   || dnsDomainIs(host, "www.kidport.com")
	   || dnsDomainIs(host, "www.kids-channel.co.uk")
	   || dnsDomainIs(host, "www.kids-drawings.com")
	   || dnsDomainIs(host, "www.kids-in-mind.com")
	   || dnsDomainIs(host, "www.kids4peace.com")
	   || dnsDomainIs(host, "www.kidsandcomputers.com")
	   || dnsDomainIs(host, "www.kidsart.co.uk")
	   || dnsDomainIs(host, "www.kidsastronomy.com")
	   || dnsDomainIs(host, "www.kidsbank.com")
	   || dnsDomainIs(host, "www.kidsbookshelf.com")
	   || dnsDomainIs(host, "www.kidsclick.com")
	   || dnsDomainIs(host, "www.kidscom.com")
	   || dnsDomainIs(host, "www.kidscook.com")
	   || dnsDomainIs(host, "www.kidsdoctor.com")
	   || dnsDomainIs(host, "www.kidsdomain.com")
	   || dnsDomainIs(host, "www.kidsfarm.com")
	   || dnsDomainIs(host, "www.kidsfreeware.com")
	   || dnsDomainIs(host, "www.kidsfun.tv")
	   || dnsDomainIs(host, "www.kidsgolf.com")
	   || dnsDomainIs(host, "www.kidsgowild.com")
	   || dnsDomainIs(host, "www.kidsjokes.com")
	   || dnsDomainIs(host, "www.kidsloveamystery.com")
	   || dnsDomainIs(host, "www.kidsmoneycents.com")
	   || dnsDomainIs(host, "www.kidsnewsroom.com")
	   || dnsDomainIs(host, "www.kidsource.com")
	   || dnsDomainIs(host, "www.kidsparties.com")
	   || dnsDomainIs(host, "www.kidsplaytown.com")
	   || dnsDomainIs(host, "www.kidsreads.com")
	   || dnsDomainIs(host, "www.kidsreport.com")
	   || dnsDomainIs(host, "www.kidsrunning.com")
	   || dnsDomainIs(host, "www.kidstamps.com")
	   || dnsDomainIs(host, "www.kidsvideogames.com")
	   || dnsDomainIs(host, "www.kidsway.com")
	   || dnsDomainIs(host, "www.kidswithcancer.com")
	   || dnsDomainIs(host, "www.kidszone.ourfamily.com")
	   || dnsDomainIs(host, "www.kidzup.com")
	   || dnsDomainIs(host, "www.kinderart.com")
	   || dnsDomainIs(host, "www.kineticcity.com")
	   || dnsDomainIs(host, "www.kings.k12.ca.us")
	   || dnsDomainIs(host, "www.kiplinger.com")
	   || dnsDomainIs(host, "www.kiwirecovery.org.nz")
	   || dnsDomainIs(host, "www.klipsan.com")
	   || dnsDomainIs(host, "www.klutz.com")
	   || dnsDomainIs(host, "www.kn.pacbell.com")
	   || dnsDomainIs(host, "www.knex.com")
	   || dnsDomainIs(host, "www.knowledgeadventure.com")
	   || dnsDomainIs(host, "www.knto.or.kr")
	   || dnsDomainIs(host, "www.kodak.com")
	   || dnsDomainIs(host, "www.konica.co.jp")
	   || dnsDomainIs(host, "www.kraftfoods.com")
	   || dnsDomainIs(host, "www.kudzukids.com")
	   || dnsDomainIs(host, "www.kulichki.com")
	   || dnsDomainIs(host, "www.kuttu.com")
	   || dnsDomainIs(host, "www.kv5.com")
	   || dnsDomainIs(host, "www.kyes-world.com")
	   || dnsDomainIs(host, "www.kyohaku.go.jp")
	   || dnsDomainIs(host, "www.kyrene.k12.az.us")
	   || dnsDomainIs(host, "www.kz")
	   || dnsDomainIs(host, "www.la-hq.org.uk")
	   || dnsDomainIs(host, "www.labs.net")
	   || dnsDomainIs(host, "www.labyrinth.net.au")
	   || dnsDomainIs(host, "www.laffinthedark.com")
	   || dnsDomainIs(host, "www.lakhota.com")
	   || dnsDomainIs(host, "www.lakings.com")
	   || dnsDomainIs(host, "www.lam.mus.ca.us")
	   || dnsDomainIs(host, "www.lampstras.k12.pa.us")
	   || dnsDomainIs(host, "www.lams.losalamos.k12.nm.us")
	   || dnsDomainIs(host, "www.landofcadbury.ca")
	   || dnsDomainIs(host, "www.larry-boy.com")
	   || dnsDomainIs(host, "www.lasersite.com")
	   || dnsDomainIs(host, "www.last-word.com")
	   || dnsDomainIs(host, "www.latimes.com")
	   || dnsDomainIs(host, "www.laughon.com")
	   || dnsDomainIs(host, "www.laurasmidiheaven.com")
	   || dnsDomainIs(host, "www.lausd.k12.ca.us")
	   || dnsDomainIs(host, "www.learn2.com")
	   || dnsDomainIs(host, "www.learn2type.com")
	   || dnsDomainIs(host, "www.learnfree-hobbies.com")
	   || dnsDomainIs(host, "www.learningkingdom.com")
	   || dnsDomainIs(host, "www.learningplanet.com")
	   || dnsDomainIs(host, "www.leftjustified.com")
	   || dnsDomainIs(host, "www.legalpadjr.com")
	   || dnsDomainIs(host, "www.legendarysurfers.com")
	   || dnsDomainIs(host, "www.legends.dm.net")
	   || dnsDomainIs(host, "www.legis.state.wi.us")
	   || dnsDomainIs(host, "www.legis.state.wv.us")
	   || dnsDomainIs(host, "www.lego.com")
	   || dnsDomainIs(host, "www.leje.com")
	   || dnsDomainIs(host, "www.leonardodicaprio.com")
	   || dnsDomainIs(host, "www.lessonplanspage.com")
	   || dnsDomainIs(host, "www.letour.fr")
	   || dnsDomainIs(host, "www.levins.com")
	   || dnsDomainIs(host, "www.levistrauss.com")
	   || dnsDomainIs(host, "www.libertystatepark.com")
	   || dnsDomainIs(host, "www.libraryspot.com")
	   || dnsDomainIs(host, "www.lifelong.com")
	   || dnsDomainIs(host, "www.lighthouse.cc")
	   || dnsDomainIs(host, "www.lightlink.com")
	   || dnsDomainIs(host, "www.lightspan.com")
	   || dnsDomainIs(host, "www.lil-fingers.com")
	   || dnsDomainIs(host, "www.linc.or.jp")
	   || dnsDomainIs(host, "www.lindsaysbackyard.com")
	   || dnsDomainIs(host, "www.lindtchocolate.com")
	   || dnsDomainIs(host, "www.lineone.net")
	   || dnsDomainIs(host, "www.lionel.com")
	   || dnsDomainIs(host, "www.lisafrank.com")
	   || dnsDomainIs(host, "www.lissaexplains.com")
	   || dnsDomainIs(host, "www.literacycenter.net")
	   || dnsDomainIs(host, "www.littleartist.com")
	   || dnsDomainIs(host, "www.littlechiles.com")
	   || dnsDomainIs(host, "www.littlecritter.com")
	   || dnsDomainIs(host, "www.littlecrowtoys.com")
	   || dnsDomainIs(host, "www.littlehousebooks.com")
	   || dnsDomainIs(host, "www.littlejason.com")
	   || dnsDomainIs(host, "www.littleplanettimes.com")
	   || dnsDomainIs(host, "www.liveandlearn.com")
	   || dnsDomainIs(host, "www.loadstar.prometeus.net")
	   || dnsDomainIs(host, "www.localaccess.com")
	   || dnsDomainIs(host, "www.lochness.co.uk")
	   || dnsDomainIs(host, "www.lochness.scotland.net")
	   || dnsDomainIs(host, "www.logos.it")
	   || dnsDomainIs(host, "www.lonelyplanet.com")
	   || dnsDomainIs(host, "www.looklearnanddo.com")
	   || dnsDomainIs(host, "www.loosejocks.com")
	   || dnsDomainIs(host, "www.lost-worlds.com")
	   || dnsDomainIs(host, "www.love-story.com")
	   || dnsDomainIs(host, "www.lpga.com")
	   || dnsDomainIs(host, "www.lsjunction.com")
	   || dnsDomainIs(host, "www.lucasarts.com")
	   || dnsDomainIs(host, "www.lucent.com")
	   || dnsDomainIs(host, "www.lucie.com")
	   || dnsDomainIs(host, "www.lunaland.co.za")
	   || dnsDomainIs(host, "www.luth.se")
	   || dnsDomainIs(host, "www.lyricalworks.com")
	   || dnsDomainIs(host, "www.infoporium.com")
	   || dnsDomainIs(host, "www.infostuff.com")
	   || dnsDomainIs(host, "www.inhandmuseum.com")
	   || dnsDomainIs(host, "www.inil.com")
	   || dnsDomainIs(host, "www.inkspot.com")
	   || dnsDomainIs(host, "www.inkyfingers.com")
	   || dnsDomainIs(host, "www.innerauto.com")
	   || dnsDomainIs(host, "www.innerbody.com")
	   || dnsDomainIs(host, "www.inqpub.com")
	   || dnsDomainIs(host, "www.insecta-inspecta.com")
	   || dnsDomainIs(host, "www.insectclopedia.com")
	   || dnsDomainIs(host, "www.inside-mexico.com")
	   || dnsDomainIs(host, "www.insiders.com")
	   || dnsDomainIs(host, "www.insteam.com")
	   || dnsDomainIs(host, "www.intel.com")
	   || dnsDomainIs(host, "www.intellicast.com")
	   || dnsDomainIs(host, "www.interads.co.uk")
	   || dnsDomainIs(host, "www.intercot.com")
	   || dnsDomainIs(host, "www.intergraffix.com")
	   || dnsDomainIs(host, "www.interknowledge.com")
	   || dnsDomainIs(host, "www.interlog.com")
	   || dnsDomainIs(host, "www.internet4kids.com")
	   || dnsDomainIs(host, "www.intersurf.com")
	   || dnsDomainIs(host, "www.inthe80s.com")
	   || dnsDomainIs(host, "www.inventorsmuseum.com")
	   || dnsDomainIs(host, "www.inwap.com")
	   || dnsDomainIs(host, "www.ioa.com")
	   || dnsDomainIs(host, "www.ionet.net")
	   || dnsDomainIs(host, "www.iowacity.com")
	   || dnsDomainIs(host, "www.ireland-now.com")
	   || dnsDomainIs(host, "www.ireland.com")
	   || dnsDomainIs(host, "www.irelandseye.com")
	   || dnsDomainIs(host, "www.irlgov.ie")
	   || dnsDomainIs(host, "www.isd.net")
	   || dnsDomainIs(host, "www.islandnet.com")
	   || dnsDomainIs(host, "www.isomedia.com")
	   || dnsDomainIs(host, "www.itftennis.com")
	   || dnsDomainIs(host, "www.itpi.dpi.state.nc.us")
	   || dnsDomainIs(host, "www.itskwanzaatime.com")
	   || dnsDomainIs(host, "www.itss.raytheon.com")
	   || dnsDomainIs(host, "www.iuma.com")
	   || dnsDomainIs(host, "www.iwaynet.net")
	   || dnsDomainIs(host, "www.iwc.com")
	   || dnsDomainIs(host, "www.iwight.gov.uk")
	   || dnsDomainIs(host, "www.ixpres.com")
	   || dnsDomainIs(host, "www.j.b.allen.btinternet.co.uk")
	   || dnsDomainIs(host, "www.jabuti.com")
	   || dnsDomainIs(host, "www.jackinthebox.com")
	   || dnsDomainIs(host, "www.jaffebros.com")
	   || dnsDomainIs(host, "www.jaguars.com")
	   || dnsDomainIs(host, "www.jamaica-gleaner.com")
	   || dnsDomainIs(host, "www.jamm.com")
	   || dnsDomainIs(host, "www.janbrett.com")
	   || dnsDomainIs(host, "www.janetstevens.com")
	   || dnsDomainIs(host, "www.japan-guide.com")
	   || dnsDomainIs(host, "www.jargon.net")
	   || dnsDomainIs(host, "www.javelinamx.com")
	   || dnsDomainIs(host, "www.jayjay.com")
	   || dnsDomainIs(host, "www.jazclass.aust.com")

    )
    return "PROXY proxy.hclib.org:80";
  else
    return "PROXY 172.16.100.20:8080";
}

reportCompare('No Crash', 'No Crash', '');
