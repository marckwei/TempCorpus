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

/*
 *
 * Date:    04 Sep 2002
 * SUMMARY: Just seeing that we don't crash when compiling this script -
 *
 * See http://bugzilla.mozilla.org/show_bug.cgi?id=96526
 *
 */
//-----------------------------------------------------------------------------
var BUGNUMBER = 96526;
printBugNumber(BUGNUMBER);
printStatus("Just seeing that we don't crash when compiling this script -");


/*
 * Function definition with lots of branches, from http://www.newyankee.com
 */
function setaction(jumpto)
{
  if (jumpto == 0) window.location = "http://www.newyankee.com/GetYankees2.cgi?1.jpg";
  else if (jumpto == [0]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ImageName";
  else if (jumpto == [1]) window.location = "http://www.newyankee.com/GetYankees2.cgi?1.jpg";
  else if (jumpto == [2]) window.location = "http://www.newyankee.com/GetYankees2.cgi?arsrferguson.jpg";
  else if (jumpto == [3]) window.location = "http://www.newyankee.com/GetYankees2.cgi?akjamesmartin.jpg";
  else if (jumpto == [4]) window.location = "http://www.newyankee.com/GetYankees2.cgi?aldaverackett.jpg";
  else if (jumpto == [5]) window.location = "http://www.newyankee.com/GetYankees2.cgi?alericbrasher.jpg";
  else if (jumpto == [6]) window.location = "http://www.newyankee.com/GetYankees2.cgi?algeorgewatkins.jpg";
  else if (jumpto == [7]) window.location = "http://www.newyankee.com/GetYankees2.cgi?altoddcruise.jpg";
  else if (jumpto == [8]) window.location = "http://www.newyankee.com/GetYankees2.cgi?arkevinc.jpg";
  else if (jumpto == [9]) window.location = "http://www.newyankee.com/GetYankees2.cgi?arpaulmoore.jpg";
  else if (jumpto == [10]) window.location = "http://www.newyankee.com/GetYankees2.cgi?auphillaird.jpg";
  else if (jumpto == [11]) window.location = "http://www.newyankee.com/GetYankees2.cgi?azbillhensley.jpg";
  else if (jumpto == [12]) window.location = "http://www.newyankee.com/GetYankees2.cgi?azcharleshollandjr.jpg";
  else if (jumpto == [13]) window.location = "http://www.newyankee.com/GetYankees2.cgi?azdaveholland.jpg";
  else if (jumpto == [14]) window.location = "http://www.newyankee.com/GetYankees2.cgi?azdavidholland.jpg";
  else if (jumpto == [15]) window.location = "http://www.newyankee.com/GetYankees2.cgi?azdonaldvogt.jpg";
  else if (jumpto == [16]) window.location = "http://www.newyankee.com/GetYankees2.cgi?azernestortega.jpg";
  else if (jumpto == [17]) window.location = "http://www.newyankee.com/GetYankees2.cgi?azjeromekeller.jpg";
  else if (jumpto == [18]) window.location = "http://www.newyankee.com/GetYankees2.cgi?azjimpegfulton.jpg";
  else if (jumpto == [19]) window.location = "http://www.newyankee.com/GetYankees2.cgi?azjohnbelcher.jpg";
  else if (jumpto == [20]) window.location = "http://www.newyankee.com/GetYankees2.cgi?azmikejordan.jpg";
  else if (jumpto == [21]) window.location = "http://www.newyankee.com/GetYankees2.cgi?azrickemry.jpg";
  else if (jumpto == [22]) window.location = "http://www.newyankee.com/GetYankees2.cgi?azstephensavage.jpg";
  else if (jumpto == [23]) window.location = "http://www.newyankee.com/GetYankees2.cgi?azsteveferguson.jpg";
  else if (jumpto == [24]) window.location = "http://www.newyankee.com/GetYankees2.cgi?aztjhorrall.jpg";
  else if (jumpto == [25]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cabillmeiners.jpg";
  else if (jumpto == [26]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cabobhadley.jpg";
  else if (jumpto == [27]) window.location = "http://www.newyankee.com/GetYankees2.cgi?caboblennox.jpg";
  else if (jumpto == [28]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cabryanshurtz.jpg";
  else if (jumpto == [29]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cabyroncleveland.jpg";
  else if (jumpto == [30]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cacesarjimenez.jpg";
  else if (jumpto == [31]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cadalekirstine.jpg";
  else if (jumpto == [32]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cadavidlgoeffrion.jpg";
  else if (jumpto == [33]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cadennisnocerini.jpg";
  else if (jumpto == [34]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cadianemason.jpg";
  else if (jumpto == [35]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cadominicpieranunzio.jpg";
  else if (jumpto == [36]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cadonaldmotter.jpg";
  else if (jumpto == [37]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cadoncroner.jpg";
  else if (jumpto == [38]) window.location = "http://www.newyankee.com/GetYankees2.cgi?caelizabethwright.jpg";
  else if (jumpto == [39]) window.location = "http://www.newyankee.com/GetYankees2.cgi?caericlew.jpg";
  else if (jumpto == [40]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cafrancissmith.jpg";
  else if (jumpto == [41]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cafranklombano.jpg";
  else if (jumpto == [42]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cajaredweaver.jpg";
  else if (jumpto == [43]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cajerrythompson.jpg";
  else if (jumpto == [44]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cajimjanssen";
  else if (jumpto == [45]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cajohncopolillo.jpg";
  else if (jumpto == [46]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cajohnmessick.jpg";
  else if (jumpto == [47]) window.location = "http://www.newyankee.com/GetYankees2.cgi?calaynedicker.jpg";
  else if (jumpto == [48]) window.location = "http://www.newyankee.com/GetYankees2.cgi?caleeannrucker.jpg";
  else if (jumpto == [49]) window.location = "http://www.newyankee.com/GetYankees2.cgi?camathewsscharch.jpg";
  else if (jumpto == [50]) window.location = "http://www.newyankee.com/GetYankees2.cgi?camikedunn.jpg";
  else if (jumpto == [51]) window.location = "http://www.newyankee.com/GetYankees2.cgi?camikeshay.jpg";
  else if (jumpto == [52]) window.location = "http://www.newyankee.com/GetYankees2.cgi?camikeshepherd.jpg";
  else if (jumpto == [53]) window.location = "http://www.newyankee.com/GetYankees2.cgi?caphillipfreer.jpg";
  else if (jumpto == [54]) window.location = "http://www.newyankee.com/GetYankees2.cgi?carandy.jpg";
  else if (jumpto == [55]) window.location = "http://www.newyankee.com/GetYankees2.cgi?carichardwilliams.jpg";
  else if (jumpto == [56]) window.location = "http://www.newyankee.com/GetYankees2.cgi?carickgruen.jpg";
  else if (jumpto == [57]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cascottbartsch.jpg";
  else if (jumpto == [58]) window.location = "http://www.newyankee.com/GetYankees2.cgi?castevestrapac.jpg";
  else if (jumpto == [59]) window.location = "http://www.newyankee.com/GetYankees2.cgi?catimwest.jpg";
  else if (jumpto == [60]) window.location = "http://www.newyankee.com/GetYankees2.cgi?catomrietveld.jpg";
  else if (jumpto == [61]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cnalainpaquette.jpg";
  else if (jumpto == [62]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cnalanhill.jpg";
  else if (jumpto == [63]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cnalguerette.jpg";
  else if (jumpto == [64]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cnbrianhogg.jpg";
  else if (jumpto == [65]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cnbrucebeard.jpg";
  else if (jumpto == [66]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cncraigdavey.jpg";
  else if (jumpto == [67]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cndanielpattison.jpg";
  else if (jumpto == [68]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cndenisstjean.jpg";
  else if (jumpto == [69]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cnglenngray.jpg";
  else if (jumpto == [70]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cnjeansebastienduguay.jpg";
  else if (jumpto == [71]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cnjohnbritz.jpg";
  else if (jumpto == [72]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cnkevinmclean.jpg";
  else if (jumpto == [73]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cnmarcandrecartier.jpg";
  else if (jumpto == [74]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cnmarcleblanc.jpg";
  else if (jumpto == [75]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cnmatthewgiles.jpg";
  else if (jumpto == [76]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cnmichelrauzon.jpg";
  else if (jumpto == [77]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cnpierrelalonde.jpg";
  else if (jumpto == [78]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cnraytyson.jpg";
  else if (jumpto == [79]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cnrichardboucher.jpg";
  else if (jumpto == [80]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cnrodbuike.jpg";
  else if (jumpto == [81]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cnscottpitkeathly.jpg";
  else if (jumpto == [82]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cnshawndavis.jpg";
  else if (jumpto == [83]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cnstephanepelletier.jpg";
  else if (jumpto == [84]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cntodddesroches.jpg";
  else if (jumpto == [85]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cntonyharnum.jpg";
  else if (jumpto == [86]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cnwayneconabree.jpg";
  else if (jumpto == [87]) window.location = "http://www.newyankee.com/GetYankees2.cgi?codavidjbarber.jpg";
  else if (jumpto == [88]) window.location = "http://www.newyankee.com/GetYankees2.cgi?codonrandquist.jpg";
  else if (jumpto == [89]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cojeffpalese.jpg";
  else if (jumpto == [90]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cojohnlowell.jpg";
  else if (jumpto == [91]) window.location = "http://www.newyankee.com/GetYankees2.cgi?cotroytorgerson.jpg";
  else if (jumpto == [92]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ctgerrygranatowski.jpg";
  else if (jumpto == [93]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ctjasonklein.jpg";
  else if (jumpto == [94]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ctkevinkiss.jpg";
  else if (jumpto == [95]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ctmikekennedy.jpg";
  else if (jumpto == [96]) window.location = "http://www.newyankee.com/GetYankees2.cgi?flalancanfield.jpg";
  else if (jumpto == [97]) window.location = "http://www.newyankee.com/GetYankees2.cgi?flalbertgonzalez.jpg";
  else if (jumpto == [98]) window.location = "http://www.newyankee.com/GetYankees2.cgi?flbruceloy.jpg";
  else if (jumpto == [99]) window.location = "http://www.newyankee.com/GetYankees2.cgi?fldandevault.jpg";
  else if (jumpto == [100]) window.location = "http://www.newyankee.com/GetYankees2.cgi?fldonstclair.jpg";
  else if (jumpto == [101]) window.location = "http://www.newyankee.com/GetYankees2.cgi?flernestbonnell.jpg";
  else if (jumpto == [102]) window.location = "http://www.newyankee.com/GetYankees2.cgi?flgeorgebarg.jpg";
  else if (jumpto == [103]) window.location = "http://www.newyankee.com/GetYankees2.cgi?flgregslavinski.jpg";
  else if (jumpto == [104]) window.location = "http://www.newyankee.com/GetYankees2.cgi?flgregwaters.jpg";
  else if (jumpto == [105]) window.location = "http://www.newyankee.com/GetYankees2.cgi?flharoldmiller.jpg";
  else if (jumpto == [106]) window.location = "http://www.newyankee.com/GetYankees2.cgi?fljackwelch.jpg";
  else if (jumpto == [107]) window.location = "http://www.newyankee.com/GetYankees2.cgi?flmichaelostrowski.jpg";
  else if (jumpto == [108]) window.location = "http://www.newyankee.com/GetYankees2.cgi?flpauldoman.jpg";
  else if (jumpto == [109]) window.location = "http://www.newyankee.com/GetYankees2.cgi?flpaulsessions.jpg";
  else if (jumpto == [110]) window.location = "http://www.newyankee.com/GetYankees2.cgi?flrandymys.jpg";
  else if (jumpto == [111]) window.location = "http://www.newyankee.com/GetYankees2.cgi?flraysarnowski.jpg";
  else if (jumpto == [112]) window.location = "http://www.newyankee.com/GetYankees2.cgi?flrobertcahill.jpg";
  else if (jumpto == [113]) window.location = "http://www.newyankee.com/GetYankees2.cgi?flstevemorrison.jpg";
  else if (jumpto == [114]) window.location = "http://www.newyankee.com/GetYankees2.cgi?flstevezellner.jpg";
  else if (jumpto == [115]) window.location = "http://www.newyankee.com/GetYankees2.cgi?flterryjennings.jpg";
  else if (jumpto == [116]) window.location = "http://www.newyankee.com/GetYankees2.cgi?fltimmcwilliams.jpg";
  else if (jumpto == [117]) window.location = "http://www.newyankee.com/GetYankees2.cgi?fltomstellhorn.jpg";
  else if (jumpto == [118]) window.location = "http://www.newyankee.com/GetYankees2.cgi?gabobkoch.jpg";
  else if (jumpto == [119]) window.location = "http://www.newyankee.com/GetYankees2.cgi?gabrucekinney.jpg";
  else if (jumpto == [120]) window.location = "http://www.newyankee.com/GetYankees2.cgi?gadickbesemer.jpg";
  else if (jumpto == [121]) window.location = "http://www.newyankee.com/GetYankees2.cgi?gajackclunen.jpg";
  else if (jumpto == [122]) window.location = "http://www.newyankee.com/GetYankees2.cgi?gajayhart.jpg";
  else if (jumpto == [123]) window.location = "http://www.newyankee.com/GetYankees2.cgi?gajjgeller.jpg";
  else if (jumpto == [124]) window.location = "http://www.newyankee.com/GetYankees2.cgi?gakeithlacey.jpg";
  else if (jumpto == [125]) window.location = "http://www.newyankee.com/GetYankees2.cgi?gamargieminutello.jpg";
  else if (jumpto == [126]) window.location = "http://www.newyankee.com/GetYankees2.cgi?gamarvinearnest.jpg";
  else if (jumpto == [127]) window.location = "http://www.newyankee.com/GetYankees2.cgi?gamikeschwarz.jpg";
  else if (jumpto == [128]) window.location = "http://www.newyankee.com/GetYankees2.cgi?gamikeyee.jpg";
  else if (jumpto == [129]) window.location = "http://www.newyankee.com/GetYankees2.cgi?garickdubree.jpg";
  else if (jumpto == [130]) window.location = "http://www.newyankee.com/GetYankees2.cgi?garobimartin.jpg";
  else if (jumpto == [131]) window.location = "http://www.newyankee.com/GetYankees2.cgi?gastevewaddell.jpg";
  else if (jumpto == [132]) window.location = "http://www.newyankee.com/GetYankees2.cgi?gathorwiggins.jpg";
  else if (jumpto == [133]) window.location = "http://www.newyankee.com/GetYankees2.cgi?gawadewylie.jpg";
  else if (jumpto == [134]) window.location = "http://www.newyankee.com/GetYankees2.cgi?gawaynerobinson.jpg";
  else if (jumpto == [135]) window.location = "http://www.newyankee.com/GetYankees2.cgi?gepaulwestbury.jpg";
  else if (jumpto == [136]) window.location = "http://www.newyankee.com/GetYankees2.cgi?grstewartcwolfe.jpg";
  else if (jumpto == [137]) window.location = "http://www.newyankee.com/GetYankees2.cgi?gugregmesa.jpg";
  else if (jumpto == [138]) window.location = "http://www.newyankee.com/GetYankees2.cgi?hibriantokunaga.jpg";
  else if (jumpto == [139]) window.location = "http://www.newyankee.com/GetYankees2.cgi?himatthewgrady.jpg";
  else if (jumpto == [140]) window.location = "http://www.newyankee.com/GetYankees2.cgi?iabobparnell.jpg";
  else if (jumpto == [141]) window.location = "http://www.newyankee.com/GetYankees2.cgi?iadougleonard.jpg";
  else if (jumpto == [142]) window.location = "http://www.newyankee.com/GetYankees2.cgi?iajayharmon.jpg";
  else if (jumpto == [143]) window.location = "http://www.newyankee.com/GetYankees2.cgi?iajohnbevier.jpg";
  else if (jumpto == [144]) window.location = "http://www.newyankee.com/GetYankees2.cgi?iamartywitt.jpg";
  else if (jumpto == [145]) window.location = "http://www.newyankee.com/GetYankees2.cgi?idjasonbartschi.jpg";
  else if (jumpto == [146]) window.location = "http://www.newyankee.com/GetYankees2.cgi?idkellyklaas.jpg";
  else if (jumpto == [147]) window.location = "http://www.newyankee.com/GetYankees2.cgi?idmikegagnon.jpg";
  else if (jumpto == [148]) window.location = "http://www.newyankee.com/GetYankees2.cgi?idrennieheuer.jpg";
  else if (jumpto == [149]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ilbenshakman.jpg";
  else if (jumpto == [150]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ilcraigstocks.jpg";
  else if (jumpto == [151]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ildaverubini.jpg";
  else if (jumpto == [152]) window.location = "http://www.newyankee.com/GetYankees2.cgi?iledpepin.jpg";
  else if (jumpto == [153]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ilfredkirpec.jpg";
  else if (jumpto == [154]) window.location = "http://www.newyankee.com/GetYankees2.cgi?iljoecreed.jpg";
  else if (jumpto == [155]) window.location = "http://www.newyankee.com/GetYankees2.cgi?iljohnknuth.jpg";
  else if (jumpto == [156]) window.location = "http://www.newyankee.com/GetYankees2.cgi?iljoshhill.jpg";
  else if (jumpto == [157]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ilkeithrichard.jpg";
  else if (jumpto == [158]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ilkrystleweber.jpg";
  else if (jumpto == [159]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ilmattmusich.jpg";
  else if (jumpto == [160]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ilmichaellane.jpg";
  else if (jumpto == [161]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ilrodneyschwandt.jpg";
  else if (jumpto == [162]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ilrogeraukerman.jpg";
  else if (jumpto == [163]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ilscottbreeden.jpg";
  else if (jumpto == [164]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ilscottgerami.jpg";
  else if (jumpto == [165]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ilsteveritt.jpg";
  else if (jumpto == [166]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ilthomasfollin.jpg";
  else if (jumpto == [167]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ilwaynesmith.jpg";
  else if (jumpto == [168]) window.location = "http://www.newyankee.com/GetYankees2.cgi?inallenwimberly.jpg";
  else if (jumpto == [169]) window.location = "http://www.newyankee.com/GetYankees2.cgi?inbutchmyers.jpg";
  else if (jumpto == [170]) window.location = "http://www.newyankee.com/GetYankees2.cgi?inderrickbentley.jpg";
  else if (jumpto == [171]) window.location = "http://www.newyankee.com/GetYankees2.cgi?inedmeissler.jpg";
  else if (jumpto == [172]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ingarymartin.jpg";
  else if (jumpto == [173]) window.location = "http://www.newyankee.com/GetYankees2.cgi?injasondavis.jpg";
  else if (jumpto == [174]) window.location = "http://www.newyankee.com/GetYankees2.cgi?injeffjones.jpg";
  else if (jumpto == [175]) window.location = "http://www.newyankee.com/GetYankees2.cgi?injeffwilliams.jpg";
  else if (jumpto == [176]) window.location = "http://www.newyankee.com/GetYankees2.cgi?injpreslyharrington.jpg";
  else if (jumpto == [177]) window.location = "http://www.newyankee.com/GetYankees2.cgi?inrichardlouden.jpg";
  else if (jumpto == [178]) window.location = "http://www.newyankee.com/GetYankees2.cgi?inronmorrell.jpg";
  else if (jumpto == [179]) window.location = "http://www.newyankee.com/GetYankees2.cgi?insearsweaver.jpg";
  else if (jumpto == [180]) window.location = "http://www.newyankee.com/GetYankees2.cgi?irpaullaverty.jpg";
  else if (jumpto == [181]) window.location = "http://www.newyankee.com/GetYankees2.cgi?irseamusmcbride.jpg";
  else if (jumpto == [182]) window.location = "http://www.newyankee.com/GetYankees2.cgi?isazrielmorag.jpg";
  else if (jumpto == [183]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ksalankreifels.jpg";
  else if (jumpto == [184]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ksbrianbudden.jpg";
  else if (jumpto == [185]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ksgarypahls.jpg";
  else if (jumpto == [186]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ksmikefarnet.jpg";
  else if (jumpto == [187]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ksmikethomas.jpg";
  else if (jumpto == [188]) window.location = "http://www.newyankee.com/GetYankees2.cgi?kstomzillig.jpg";
  else if (jumpto == [189]) window.location = "http://www.newyankee.com/GetYankees2.cgi?kybillyandrews.jpg";
  else if (jumpto == [190]) window.location = "http://www.newyankee.com/GetYankees2.cgi?kydaveryno.jpg";
  else if (jumpto == [191]) window.location = "http://www.newyankee.com/GetYankees2.cgi?kygreglaramore.jpg";
  else if (jumpto == [192]) window.location = "http://www.newyankee.com/GetYankees2.cgi?kywilliamanderson.jpg";
  else if (jumpto == [193]) window.location = "http://www.newyankee.com/GetYankees2.cgi?kyzachschuyler.jpg";
  else if (jumpto == [194]) window.location = "http://www.newyankee.com/GetYankees2.cgi?laadriankliebert.jpg";
  else if (jumpto == [195]) window.location = "http://www.newyankee.com/GetYankees2.cgi?labarryhumphus.jpg";
  else if (jumpto == [196]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ladennisanders.jpg";
  else if (jumpto == [197]) window.location = "http://www.newyankee.com/GetYankees2.cgi?larichardeckert.jpg";
  else if (jumpto == [198]) window.location = "http://www.newyankee.com/GetYankees2.cgi?laronjames.jpg";
  else if (jumpto == [199]) window.location = "http://www.newyankee.com/GetYankees2.cgi?lasheldonstutes.jpg";
  else if (jumpto == [200]) window.location = "http://www.newyankee.com/GetYankees2.cgi?lastephenstarbuck.jpg";
  else if (jumpto == [201]) window.location = "http://www.newyankee.com/GetYankees2.cgi?latroyestonich.jpg";
  else if (jumpto == [202]) window.location = "http://www.newyankee.com/GetYankees2.cgi?lavaughntrosclair.jpg";
  else if (jumpto == [203]) window.location = "http://www.newyankee.com/GetYankees2.cgi?maalexbrown.jpg";
  else if (jumpto == [204]) window.location = "http://www.newyankee.com/GetYankees2.cgi?maalwencl.jpg";
  else if (jumpto == [205]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mabrentmills.jpg";
  else if (jumpto == [206]) window.location = "http://www.newyankee.com/GetYankees2.cgi?madangodziff.jpg";
  else if (jumpto == [207]) window.location = "http://www.newyankee.com/GetYankees2.cgi?madanielwilusz.jpg";
  else if (jumpto == [208]) window.location = "http://www.newyankee.com/GetYankees2.cgi?madavidreis.jpg";
  else if (jumpto == [209]) window.location = "http://www.newyankee.com/GetYankees2.cgi?madougrecko.jpg";
  else if (jumpto == [210]) window.location = "http://www.newyankee.com/GetYankees2.cgi?majasonhaley.jpg";
  else if (jumpto == [211]) window.location = "http://www.newyankee.com/GetYankees2.cgi?maklausjensen.jpg";
  else if (jumpto == [212]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mamikemarland.jpg";
  else if (jumpto == [213]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mapetersilvestre.jpg";
  else if (jumpto == [214]) window.location = "http://www.newyankee.com/GetYankees2.cgi?maraysweeney.jpg";
  else if (jumpto == [215]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mdallenbarnett.jpg";
  else if (jumpto == [216]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mdcharleswasson.jpg";
  else if (jumpto == [217]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mdedbaranowski.jpg";
  else if (jumpto == [218]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mdfranktate.jpg";
  else if (jumpto == [219]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mdfredschock.jpg";
  else if (jumpto == [220]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mdianstjohn.jpg";
  else if (jumpto == [221]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mdjordanevans.jpg";
  else if (jumpto == [222]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mdpaulwjones.jpg";
  else if (jumpto == [223]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mestevesandelier.jpg";
  else if (jumpto == [224]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mewilbertrbrown.jpg";
  else if (jumpto == [225]) window.location = "http://www.newyankee.com/GetYankees2.cgi?midavidkeller.jpg";
  else if (jumpto == [226]) window.location = "http://www.newyankee.com/GetYankees2.cgi?migaryvandenberg.jpg";
  else if (jumpto == [227]) window.location = "http://www.newyankee.com/GetYankees2.cgi?migeorgeberlinger.jpg";
  else if (jumpto == [228]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mijamesstapleton.jpg";
  else if (jumpto == [229]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mijerryhaney.jpg";
  else if (jumpto == [230]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mijohnrybarczyk.jpg";
  else if (jumpto == [231]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mikeithvalliere.jpg";
  else if (jumpto == [232]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mikevinpodsiadlik.jpg";
  else if (jumpto == [233]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mimarkandrews.jpg";
  else if (jumpto == [234]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mimikedecaussin.jpg";
  else if (jumpto == [235]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mimikesegorski.jpg";
  else if (jumpto == [236]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mirobertwolgast.jpg";
  else if (jumpto == [237]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mitimothybruner.jpg";
  else if (jumpto == [238]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mitomweaver.jpg";
  else if (jumpto == [239]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mnbobgontarek.jpg";
  else if (jumpto == [240]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mnbradbuffington.jpg";
  else if (jumpto == [241]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mndavewilson.jpg";
  else if (jumpto == [242]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mngenerajanen.jpg";
  else if (jumpto == [243]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mnjohnkempkes.jpg";
  else if (jumpto == [244]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mnkevinhurbanis.jpg";
  else if (jumpto == [245]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mnmarklansink.jpg";
  else if (jumpto == [246]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mnpaulmayer.jpg";
  else if (jumpto == [247]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mnpauloman.jpg";
  else if (jumpto == [248]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mnwoodylobnitz.jpg";
  else if (jumpto == [249]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mocurtkempf.jpg";
  else if (jumpto == [250]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mojerryhenry.jpg";
  else if (jumpto == [251]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mojimfinney.jpg";
  else if (jumpto == [252]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mojimrecamper.jpg";
  else if (jumpto == [253]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mojohntimmons.jpg";
  else if (jumpto == [254]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mojohnvaughan.jpg";
  else if (jumpto == [255]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mokenroberts.jpg";
  else if (jumpto == [256]) window.location = "http://www.newyankee.com/GetYankees2.cgi?momacvoss.jpg";
  else if (jumpto == [257]) window.location = "http://www.newyankee.com/GetYankees2.cgi?momarktemmer.jpg";
  else if (jumpto == [258]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mopaulzerjav.jpg";
  else if (jumpto == [259]) window.location = "http://www.newyankee.com/GetYankees2.cgi?morobtigner.jpg";
  else if (jumpto == [260]) window.location = "http://www.newyankee.com/GetYankees2.cgi?motomantrim.jpg";
  else if (jumpto == [261]) window.location = "http://www.newyankee.com/GetYankees2.cgi?mscharleshahn.jpg";
  else if (jumpto == [262]) window.location = "http://www.newyankee.com/GetYankees2.cgi?msjohnjohnson.jpg";
  else if (jumpto == [263]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ncandrelopez.jpg";
  else if (jumpto == [264]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ncedorisak.jpg";
  else if (jumpto == [265]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ncjimisbell.jpg";
  else if (jumpto == [266]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ncjohnnydark.jpg";
  else if (jumpto == [267]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nckevinebert.jpg";
  else if (jumpto == [268]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nckevinulmer.jpg";
  else if (jumpto == [269]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ncpeteparis.jpg";
  else if (jumpto == [270]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ncstevelindsley.jpg";
  else if (jumpto == [271]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nctimsmith.jpg";
  else if (jumpto == [272]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nctonylawrence.jpg";
  else if (jumpto == [273]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ncwyneaston.jpg";
  else if (jumpto == [274]) window.location = "http://www.newyankee.com/GetYankees2.cgi?neberniedevlin.jpg";
  else if (jumpto == [275]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nebrentesmoil.jpg";
  else if (jumpto == [276]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nescottmccullough.jpg";
  else if (jumpto == [277]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nhalantarring.jpg";
  else if (jumpto == [278]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nhbjmolinari.jpg";
  else if (jumpto == [279]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nhbrianmolinari.jpg";
  else if (jumpto == [280]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nhdanhorning.jpg";
  else if (jumpto == [281]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nhdonblackden.jpg";
  else if (jumpto == [282]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nhjimcalandriello.jpg";
  else if (jumpto == [283]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nhjohngunterman.jpg";
  else if (jumpto == [284]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nhjohnmagyar.jpg";
  else if (jumpto == [285]) window.location = "http://www.newyankee.com/GetYankees2.cgi?njbudclarity.jpg";
  else if (jumpto == [286]) window.location = "http://www.newyankee.com/GetYankees2.cgi?njcraigjones.jpg";
  else if (jumpto == [287]) window.location = "http://www.newyankee.com/GetYankees2.cgi?njericrowland.jpg";
  else if (jumpto == [288]) window.location = "http://www.newyankee.com/GetYankees2.cgi?njjimsnyder.jpg";
  else if (jumpto == [289]) window.location = "http://www.newyankee.com/GetYankees2.cgi?njlarrylevinson.jpg";
  else if (jumpto == [290]) window.location = "http://www.newyankee.com/GetYankees2.cgi?njlouisdispensiere.jpg";
  else if (jumpto == [291]) window.location = "http://www.newyankee.com/GetYankees2.cgi?njmarksoloff.jpg";
  else if (jumpto == [292]) window.location = "http://www.newyankee.com/GetYankees2.cgi?njmichaelhalko.jpg";
  else if (jumpto == [293]) window.location = "http://www.newyankee.com/GetYankees2.cgi?njmichaelmalkasian.jpg";
  else if (jumpto == [294]) window.location = "http://www.newyankee.com/GetYankees2.cgi?njnigelmartin.jpg";
  else if (jumpto == [295]) window.location = "http://www.newyankee.com/GetYankees2.cgi?njrjmolinari.jpg";
  else if (jumpto == [296]) window.location = "http://www.newyankee.com/GetYankees2.cgi?njtommurasky.jpg";
  else if (jumpto == [297]) window.location = "http://www.newyankee.com/GetYankees2.cgi?njtomputnam.jpg";
  else if (jumpto == [298]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nmdalepage.jpg";
  else if (jumpto == [299]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nmmikethompson.jpg";
  else if (jumpto == [300]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nvclydekemp.jpg";
  else if (jumpto == [301]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nvharveyklene.jpg";
  else if (jumpto == [302]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nvlonsimons.jpg";
  else if (jumpto == [303]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nyabeweisfelner.jpg";
  else if (jumpto == [304]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nyanthonygiudice.jpg";
  else if (jumpto == [305]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nyaustinpierce.jpg";
  else if (jumpto == [306]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nybrianmonks.jpg";
  else if (jumpto == [307]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nycharlieporter.jpg";
  else if (jumpto == [308]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nycorneliuswoglum.jpg";
  else if (jumpto == [309]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nydennishartwell.jpg";
  else if (jumpto == [310]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nydennissgheerdt.jpg";
  else if (jumpto == [311]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nygeorgepettitt.jpg";
  else if (jumpto == [312]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nyjohndrewes.jpg";
  else if (jumpto == [313]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nyjohnminichiello.jpg";
  else if (jumpto == [314]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nykevinwoolever.jpg";
  else if (jumpto == [315]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nymartyrubinstein.jpg";
  else if (jumpto == [316]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nyraysicina.jpg";
  else if (jumpto == [317]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nyrobbartley.jpg";
  else if (jumpto == [318]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nyrobertkosty.jpg";
  else if (jumpto == [319]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nystephenbagnato.jpg";
  else if (jumpto == [320]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nystevegiamundo.jpg";
  else if (jumpto == [321]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nystevekelly.jpg";
  else if (jumpto == [322]) window.location = "http://www.newyankee.com/GetYankees2.cgi?nywayneadelkoph.jpg";
  else if (jumpto == [323]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ohbriannimmo.jpg";
  else if (jumpto == [324]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ohdavehyman.jpg";
  else if (jumpto == [325]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ohdavidconant.jpg";
  else if (jumpto == [326]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ohdennismantovani.jpg";
  else if (jumpto == [327]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ohgrahambennett.jpg";
  else if (jumpto == [328]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ohgregbrunk.jpg";
  else if (jumpto == [329]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ohgregfilbrun.jpg";
  else if (jumpto == [330]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ohjimreutener.jpg";
  else if (jumpto == [331]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ohjimrike.jpg";
  else if (jumpto == [332]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ohkeithsparks.jpg";
  else if (jumpto == [333]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ohkevindrinan.jpg";
  else if (jumpto == [334]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ohmichaelhaines.jpg";
  else if (jumpto == [335]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ohmichaelsteele.jpg";
  else if (jumpto == [336]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ohpatrickguanciale.jpg";
  else if (jumpto == [337]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ohscottkelly.jpg";
  else if (jumpto == [338]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ohscottthomas.jpg";
  else if (jumpto == [339]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ohstevetuckerman.jpg";
  else if (jumpto == [340]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ohtedfigurski.jpg";
  else if (jumpto == [341]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ohterrydonald.jpg";
  else if (jumpto == [342]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ohtimokeefe.jpg";
  else if (jumpto == [343]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ohtomhaydock.jpg";
  else if (jumpto == [344]) window.location = "http://www.newyankee.com/GetYankees2.cgi?okbillsneller.jpg";
  else if (jumpto == [345]) window.location = "http://www.newyankee.com/GetYankees2.cgi?okbobbulick.jpg";
  else if (jumpto == [346]) window.location = "http://www.newyankee.com/GetYankees2.cgi?okdaryljones.jpg";
  else if (jumpto == [347]) window.location = "http://www.newyankee.com/GetYankees2.cgi?okstevetarchek.jpg";
  else if (jumpto == [348]) window.location = "http://www.newyankee.com/GetYankees2.cgi?okwoodymcelroy.jpg";
  else if (jumpto == [349]) window.location = "http://www.newyankee.com/GetYankees2.cgi?orcoryeells.jpg";
  else if (jumpto == [350]) window.location = "http://www.newyankee.com/GetYankees2.cgi?oredcavasso.jpg";
  else if (jumpto == [351]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ormarkmcculley.jpg";
  else if (jumpto == [352]) window.location = "http://www.newyankee.com/GetYankees2.cgi?orstevekarthauser.jpg";
  else if (jumpto == [353]) window.location = "http://www.newyankee.com/GetYankees2.cgi?paalanpalmieri.jpg";
  else if (jumpto == [354]) window.location = "http://www.newyankee.com/GetYankees2.cgi?pachriscarr.jpg";
  else if (jumpto == [355]) window.location = "http://www.newyankee.com/GetYankees2.cgi?padansigg.jpg";
  else if (jumpto == [356]) window.location = "http://www.newyankee.com/GetYankees2.cgi?padavecalabretta.jpg";
  else if (jumpto == [357]) window.location = "http://www.newyankee.com/GetYankees2.cgi?padennishoffman.jpg";
  else if (jumpto == [358]) window.location = "http://www.newyankee.com/GetYankees2.cgi?pafrankschlipf.jpg";
  else if (jumpto == [359]) window.location = "http://www.newyankee.com/GetYankees2.cgi?pajamesevanson.jpg";
  else if (jumpto == [360]) window.location = "http://www.newyankee.com/GetYankees2.cgi?pajoekrol.jpg";
  else if (jumpto == [361]) window.location = "http://www.newyankee.com/GetYankees2.cgi?pakatecrimmins.jpg";
  else if (jumpto == [362]) window.location = "http://www.newyankee.com/GetYankees2.cgi?pamarshallkrebs.jpg";
  else if (jumpto == [363]) window.location = "http://www.newyankee.com/GetYankees2.cgi?pascottsheaffer.jpg";
  else if (jumpto == [364]) window.location = "http://www.newyankee.com/GetYankees2.cgi?paterrycrippen.jpg";
  else if (jumpto == [365]) window.location = "http://www.newyankee.com/GetYankees2.cgi?patjpera.jpg";
  else if (jumpto == [366]) window.location = "http://www.newyankee.com/GetYankees2.cgi?patoddpatterson.jpg";
  else if (jumpto == [367]) window.location = "http://www.newyankee.com/GetYankees2.cgi?patomrehm.jpg";
  else if (jumpto == [368]) window.location = "http://www.newyankee.com/GetYankees2.cgi?pavicschreck.jpg";
  else if (jumpto == [369]) window.location = "http://www.newyankee.com/GetYankees2.cgi?pawilliamhowen.jpg";
  else if (jumpto == [370]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ricarlruggieri.jpg";
  else if (jumpto == [371]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ripetermccrea.jpg";
  else if (jumpto == [372]) window.location = "http://www.newyankee.com/GetYankees2.cgi?scbillmovius.jpg";
  else if (jumpto == [373]) window.location = "http://www.newyankee.com/GetYankees2.cgi?scbryanrackley.jpg";
  else if (jumpto == [374]) window.location = "http://www.newyankee.com/GetYankees2.cgi?scchrisgoodman.jpg";
  else if (jumpto == [375]) window.location = "http://www.newyankee.com/GetYankees2.cgi?scdarrellmunn.jpg";
  else if (jumpto == [376]) window.location = "http://www.newyankee.com/GetYankees2.cgi?scdonsandusky.jpg";
  else if (jumpto == [377]) window.location = "http://www.newyankee.com/GetYankees2.cgi?scscotalexander.jpg";
  else if (jumpto == [378]) window.location = "http://www.newyankee.com/GetYankees2.cgi?sctimbajuscik.jpg";
  else if (jumpto == [379]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ststuartcoltart.jpg";
  else if (jumpto == [380]) window.location = "http://www.newyankee.com/GetYankees2.cgi?tnbilobautista.jpg";
  else if (jumpto == [381]) window.location = "http://www.newyankee.com/GetYankees2.cgi?tnbrucebowman.jpg";
  else if (jumpto == [382]) window.location = "http://www.newyankee.com/GetYankees2.cgi?tndavidchipman.jpg";
  else if (jumpto == [383]) window.location = "http://www.newyankee.com/GetYankees2.cgi?tndavidcizunas.jpg";
  else if (jumpto == [384]) window.location = "http://www.newyankee.com/GetYankees2.cgi?tndavidreed.jpg";
  else if (jumpto == [385]) window.location = "http://www.newyankee.com/GetYankees2.cgi?tnhankdunkin.jpg";
  else if (jumpto == [386]) window.location = "http://www.newyankee.com/GetYankees2.cgi?tnkenwetherington.jpg";
  else if (jumpto == [387]) window.location = "http://www.newyankee.com/GetYankees2.cgi?tnrickgodboldt.jpg";
  else if (jumpto == [388]) window.location = "http://www.newyankee.com/GetYankees2.cgi?tnroyowen.jpg";
  else if (jumpto == [389]) window.location = "http://www.newyankee.com/GetYankees2.cgi?tnsteve.jpg";
  else if (jumpto == [390]) window.location = "http://www.newyankee.com/GetYankees2.cgi?tntommymercks.jpg";
  else if (jumpto == [391]) window.location = "http://www.newyankee.com/GetYankees2.cgi?tnwarrenmonroe.jpg";
  else if (jumpto == [392]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txbillvanpelt.jpg";
  else if (jumpto == [393]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txcarolynmoncivais.jpg";
  else if (jumpto == [394]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txchucksteding.jpg";
  else if (jumpto == [395]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txclintlafont.jpg";
  else if (jumpto == [396]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txcurthackett.jpg";
  else if (jumpto == [397]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txdavidmcneill.jpg";
  else if (jumpto == [398]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txdonowen.jpg";
  else if (jumpto == [399]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txfrankcox.jpg";
  else if (jumpto == [400]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txglenbang.jpg";
  else if (jumpto == [401]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txhowardlaunius.jpg";
  else if (jumpto == [402]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txjamienorwood.jpg";
  else if (jumpto == [403]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txjimmarkle.jpg";
  else if (jumpto == [404]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txjimmcnamara.jpg";
  else if (jumpto == [405]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txjoelgulker.jpg";
  else if (jumpto == [406]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txjoeveillon.jpg";
  else if (jumpto == [407]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txjohnburns.jpg";
  else if (jumpto == [408]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txkeithmartin.jpg";
  else if (jumpto == [409]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txkennymiller.jpg";
  else if (jumpto == [410]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txkirkconstable.jpg";
  else if (jumpto == [411]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txkylekelley.jpg";
  else if (jumpto == [412]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txlesjones.jpg";
  else if (jumpto == [413]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txlynnlacey.jpg";
  else if (jumpto == [414]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txmarksimmons.jpg";
  else if (jumpto == [415]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txmauriceharris.jpg";
  else if (jumpto == [416]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txmichaelbrown.jpg";
  else if (jumpto == [417]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txrichardthomas.jpg";
  else if (jumpto == [418]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txrickent.jpg";
  else if (jumpto == [419]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txtomlovelace.jpg";
  else if (jumpto == [420]) window.location = "http://www.newyankee.com/GetYankees2.cgi?txvareckwalla.jpg";
  else if (jumpto == [421]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ukbrianstainton.jpg";
  else if (jumpto == [422]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ukdavegrimwood.jpg";
  else if (jumpto == [423]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ukdavidevans.jpg";
  else if (jumpto == [424]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ukgeoffbogg.jpg";
  else if (jumpto == [425]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ukgordondale.jpg";
  else if (jumpto == [426]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ukharborne.jpg";
  else if (jumpto == [427]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ukjamesobrian.jpg";
  else if (jumpto == [428]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ukjeffjones.jpg";
  else if (jumpto == [429]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ukjohnworthington.jpg";
  else if (jumpto == [430]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ukkeithrobinson.jpg";
  else if (jumpto == [431]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ukkoojanzen.jpg";
  else if (jumpto == [432]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ukleewebster.jpg";
  else if (jumpto == [433]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ukpaultebbutt.jpg";
  else if (jumpto == [434]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ukriaanstrydom.jpg";
  else if (jumpto == [435]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ukrickdare.jpg";
  else if (jumpto == [436]) window.location = "http://www.newyankee.com/GetYankees2.cgi?ukterrychadwick.jpg";
  else if (jumpto == [437]) window.location = "http://www.newyankee.com/GetYankees2.cgi?utbobcanestrini.jpg";
  else if (jumpto == [438]) window.location = "http://www.newyankee.com/GetYankees2.cgi?utdonthornock.jpg";
  else if (jumpto == [439]) window.location = "http://www.newyankee.com/GetYankees2.cgi?vaartgreen.jpg";
  else if (jumpto == [440]) window.location = "http://www.newyankee.com/GetYankees2.cgi?vabobheller.jpg";
  else if (jumpto == [441]) window.location = "http://www.newyankee.com/GetYankees2.cgi?vaclintadkins.jpg";
  else if (jumpto == [442]) window.location = "http://www.newyankee.com/GetYankees2.cgi?vadanieltepe.jpg";
  else if (jumpto == [443]) window.location = "http://www.newyankee.com/GetYankees2.cgi?vadanmeier.jpg";
  else if (jumpto == [444]) window.location = "http://www.newyankee.com/GetYankees2.cgi?vadavidminnix.jpg";
  else if (jumpto == [445]) window.location = "http://www.newyankee.com/GetYankees2.cgi?vadavidyoho.jpg";
  else if (jumpto == [446]) window.location = "http://www.newyankee.com/GetYankees2.cgi?vadickthornsberry.jpg";
  else if (jumpto == [447]) window.location = "http://www.newyankee.com/GetYankees2.cgi?vamarksimonds.jpg";
  else if (jumpto == [448]) window.location = "http://www.newyankee.com/GetYankees2.cgi?vamichaelkoch.jpg";
  else if (jumpto == [449]) window.location = "http://www.newyankee.com/GetYankees2.cgi?vamikeperozziello.jpg";
  else if (jumpto == [450]) window.location = "http://www.newyankee.com/GetYankees2.cgi?vamikepingrey.jpg";
  else if (jumpto == [451]) window.location = "http://www.newyankee.com/GetYankees2.cgi?vapatrickkearney.jpg";
  else if (jumpto == [452]) window.location = "http://www.newyankee.com/GetYankees2.cgi?vapaulstreet.jpg";
  else if (jumpto == [453]) window.location = "http://www.newyankee.com/GetYankees2.cgi?vatonydemasi.jpg";
  else if (jumpto == [454]) window.location = "http://www.newyankee.com/GetYankees2.cgi?vatroylong.jpg";
  else if (jumpto == [455]) window.location = "http://www.newyankee.com/GetYankees2.cgi?vatroylong2.jpg";
  else if (jumpto == [456]) window.location = "http://www.newyankee.com/GetYankees2.cgi?vaweslyon.jpg";
  else if (jumpto == [457]) window.location = "http://www.newyankee.com/GetYankees2.cgi?wabryanthomas.jpg";
  else if (jumpto == [458]) window.location = "http://www.newyankee.com/GetYankees2.cgi?wageorgebryan.jpg";
  else if (jumpto == [459]) window.location = "http://www.newyankee.com/GetYankees2.cgi?waglennpiersall.jpg";
  else if (jumpto == [460]) window.location = "http://www.newyankee.com/GetYankees2.cgi?wajoewanjohi.jpg";
  else if (jumpto == [461]) window.location = "http://www.newyankee.com/GetYankees2.cgi?wajohndrapala.jpg";
  else if (jumpto == [462]) window.location = "http://www.newyankee.com/GetYankees2.cgi?wajohnfernstrom.jpg";
  else if (jumpto == [463]) window.location = "http://www.newyankee.com/GetYankees2.cgi?wajohnmickelson.jpg";
  else if (jumpto == [464]) window.location = "http://www.newyankee.com/GetYankees2.cgi?wakeithjohnson.jpg";
  else if (jumpto == [465]) window.location = "http://www.newyankee.com/GetYankees2.cgi?wamarkdenman.jpg";
  else if (jumpto == [466]) window.location = "http://www.newyankee.com/GetYankees2.cgi?wamiketaylor.jpg";
  else if (jumpto == [467]) window.location = "http://www.newyankee.com/GetYankees2.cgi?wascottboyd.jpg";
  else if (jumpto == [468]) window.location = "http://www.newyankee.com/GetYankees2.cgi?wibryanschappel.jpg";
  else if (jumpto == [469]) window.location = "http://www.newyankee.com/GetYankees2.cgi?widenniszuber.jpg";
  else if (jumpto == [470]) window.location = "http://www.newyankee.com/GetYankees2.cgi?wigeorgebregar.jpg";
  else if (jumpto == [471]) window.location = "http://www.newyankee.com/GetYankees2.cgi?wikevinwarren.jpg";
  else if (jumpto == [472]) window.location = "http://www.newyankee.com/GetYankees2.cgi?wirichorde.jpg";
  else if (jumpto == [473]) window.location = "http://www.newyankee.com/GetYankees2.cgi?wistevenricks.jpg";
  else if (jumpto == [474]) window.location = "http://www.newyankee.com/GetYankees2.cgi?wiweswolfrom.jpg";
  else if (jumpto == [475]) window.location = "http://www.newyankee.com/GetYankees2.cgi?wvdannorby.jpg";
}

reportCompare('No Crash', 'No Crash', '');
