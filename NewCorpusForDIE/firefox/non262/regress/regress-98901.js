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
var BUGNUMBER = 98901;
var summary = 'Stack overflow concatenating variables';
var actual = 'No Crash';
var expect = 'No Crash';


printBugNumber(BUGNUMBER);
printStatus (summary);

UNID=""; 
shrg="0";
EMAL="";
PASS="";
PASV="";
FNAM="";
LNAM="";
ADD1="";
ADD2="";
CITY="";
STAT="";
STATi=0;
ZIPC="";
PHON="";
AGE2="";
AGE2i=0;
AGES="";
SEXX="";
SEXXi=-1;
OCCU="";
OCCUi=0;
OCCO="";
MODL="";
SRNU="";
MNTH="";
MNTHi=0;
YEAR="";
YEARi=0;
POPR="";
POPRi=0;
OPOP="";
WHEN="";
WHENi=-1;
INFL="";
INFLi=0;
HM01="";
HM02="";
HM03="";
HM04="";
HM05="";
HM06="";
HM07="";
HM08="";
HM09="";
HM10="";
HM11="";
HM12="";
HM13="";
HM14="";
HM15="";
HM16="";
HM17="";
HM18="";
HM19="";
HM20="";
HM21="";
HM22="";
HM23="";
HM24="";
HS01="";
HS02="";
HS03="";
HS04="";
HS05="";
HS06="";
HS07="";
HS08="";
HS09="";
HS10="";
HS11="";
HS12="";
HS13="";
HS14="";
HS15="";
HS16="";
HS17="";
HS18="";
HS19="";
HS20="";
HS21="";
HS22="";
HS23="";
HS24="";
PL01="";
PL01i=-1;
PL02="";
PL02i=-1;
PL03="";
PL03i=-1;
PL04="";
PL04i=-1;
PL05="";
PL05i=-1;
PL06="";
PL06i=-1;
PL07="";
PL07i=-1;
PL08="";
PL08i=-1;
PL09="";
PL09i=-1;
PL10="";
PL10i=-1;
PL11="";
PL11i=-1;
PL12="";
PL12i=-1;
PL13="";
PL13i=-1;
PL14="";
PL14i=-1;
PL15="";
PL15i=-1;
PL16="";
PL16i=-1;
PL17="";
PL17i=-1;
PL18="";
PL18i=-1;
PL19="";
PL19i=-1;
PL20="";
PL20i=-1;
PL21="";
PL21i=-1;
PL22="";
PL22i=-1;
PL23="";
PL23i=-1;
PL24="";
PL24i=-1;
TVSO="";
TVSOi=-1;
FNDS="";
FNDSi=-1;
WGFT="";
WGFTi=0;
CE01="";
CE01i=-1;
CE02="";
CE02i=-1;
NEMA="Yes";
NEMAi=0;
PPUR="";
PPURi=-1;
PPUO="";
CON1="";
CON2="";
CON3="";
STNM="";
STNMi=0;
FE01="";
FE01i=0;
FE02="";
FE03="";
FE04="";
FE05="";
FE06="";
FE07="";
FE08="";
FE09="";
FE10="";
FE11="";
FE12="";
FE13="";
FE14="";
FE15="";
FE16="";
FE17="";
FE18="";
FE19="";
FE20="";
FE21="";
FE22="";
FE23="";
FE24="";
FE25="";
FE26="";
FE27="";
FE28="";
FE29="";
FE30="";
FE31="";
FE32="";
FE33="";
FE34="";
FEOT="";
NF01="";
NF02="";
NF03="";
NF04="";
NF05="";
NF06="";
NF07="";
NF08="";
NF09="";
NF10="";
NF11="";
NF12="";
NF13="";
NF14="";
NF15="";
NF16="";
NF17="";
NF18="";
NF19="";
NFOT="";
OSYS="";
OSYSi=0;
OSOT="";
IMGS="";
PBY1="";
PBY2="";
PBY3="";
PBY4="";
PBY5="";
PBY6="";
PBY7="";
PBY8="";
OPBY="";
OWNC="";
OWNCi=-1;
CUSE="";
CUSEi=-1;
OCUS="";
WCAM="";
WCAMi=0;
OC01="";
OC02="";
OC03="";
OC04="";
OC05="";
OC06="";
OC07="";
OC08="";
OC09="";
OC10="";
OC11="";
CU01="";
CU02="";
CU03="";
CU04="";
CU05="";
CU06="";
CU07="";
CU08="";
CU09="";
CU10="";
PLYB="";
PLYBi=0;
CCON="";
CCONi=0;
BC01="";
BC02="";
BC03="";
BC04="";
BC05="";
BC06="";
IN01="";
IN02="";
IN03="";
IN04="";
IN05="";
IN06="";
IN07="";
IN08="";
IN09="";
IN10="";
IN11="";
IN12="";
IN13="";
IN14="";
IN15="";
FI01="";
FI02="";
FI03="";
FI04="";
FI05="";
FI06="";
FI07="";
FI08="";
FI09="";
FI10="";
FI11="";
FI12="";
FI13="";
FI14="";
FI15="";
FI16="";
FI17="";
FI18="";
FI19="";
FI20="";
FI21="";
FI22="";
FI23="";
FI24="";
FI25="";
FI26="";
FI27="";
FI28="";
FI29="";
FI30="";
FI31="";
FI32="";
FI33="";
FI34="";
FI35="";
FI36="";
FI37="";
FI38="";
FI39="";
FI40="";
FI41="";
FI42="";
FI43="";
FI44="";
FI45="";
FI46="";
FI47="";
FI48="";
FI49="";
FI50="";
FI51="";
FI52="";
FI53="";
FI54="";
FI55="";
FI56="";
FI57="";
FI58="";
FF01="";
FF02="";
FF03="";
FF04="";
FF05="";
FF06="";
FF07="";
FF08="";
FF09="";
FF10="";
FF11="";
FF12="";
FF13="";
FF14="";
FF15="";
FF16="";
FF17="";
FF18="";
FF19="";
FF20="";
FF21="";
FF22="";
PPQT="";
PPQTi=-1;
PSQT="";
PSQTi=-1;
LCDQ="";
LCDQi=-1;
NITQ="";
NITQi=-1;
NTSQ="";
NTSQi=-1;
GENQ="";
GENQi=-1;
DSNQ="";
DSNQi=-1;
OPMQ="";
OPMQi=-1;
PRCQ="";
PRCQi=-1;
BATQ="";
BATQi=-1;
CMPQ="";
CMPQi=-1;
DSCQ="";
DSCQi=-1;
MSSQ="";
MSSQi=-1;
MSIQ="";
MSIQi=-1;
PGSQ="";
PGSQi=-1;
PCPQ="";
PCPQi=-1;
AO01="";
AO02="";
AO03="";
AO04="";
AO05="";
AO06="";
AO07="";
AO08="";
AO09="";
AO10="";
AO11="";
AO12="";
AO13="";
AO14="";
AO15="";
AO16="";
AO17="";
AO18="";
AO19="";
AO20="";
AO21="";
AO22="";
AO23="";
AO24="";
AO25="";
AO26="";
AO27="";
AO28="";
AO29="";
AO30="";
AO31="";
AO32="";
AO33="";
AO34="";
AO35="";
IS01="";
IS02="";
IS03="";
IS04="";
IS05="";
IS06="";
IS07="";
IS08="";
IS09="";
IS10="";
IS11="";
IS12="";
IS13="";
IS14="";
IS15="";
IS16="";
IS17="";
IS18="";
IS19="";
IS20="";
IS21="";
IS22="";
IS23="";
IS24="";
IS25="";
IS26="";
IS27="";
IS28="";
IS29="";
IS30="";
IS31="";
IS32="";
IS33="";
IS34="";
IS35="";
B601="";
B602="";
B603="";
B604="";
B605="";
B606="";
B607="";
B608="";
B609="";
B610="";
B611="";
B612="";
B613="";
B614="";
B615="";
B616="";
B617="";
B618="";
B619="";
B620="";
B621="";
B622="";
B623="";
B624="";
B625="";
B626="";
B627="";
B628="";
B629="";
B630="";
B631="";
B632="";
B633="";
B634="";
B635="";
CTYP="";
CTYPi=-1;
AO36="";
AO37="";
IS36="";
IS37="";
B636="";
B637="";
FA01="";
FA02="";
FA03="";
FA04="";
FA05="";
FA06="";
FA07="";
FA08="";
FA09="";
FA10="";
FA11="";
FA12="";
FA13="";
FA14="";
FA15="";
FA16="";
FA17="";
FA18="";
FA19="";
FA20="";
FA21="";
FA22="";
FA23="";
FA24="";
FA25="";
FA26="";
FA27="";
SI01="";
SI02="";
SI03="";
SI04="";
SI05="";
SI06="";
SI07="";
SI08="";
SI09="";
SI10="";
SI11="";
SI12="";
SI13="";
SI14="";
SI15="";
SI16="";
SI17="";
SI18="";
SI19="";
SI20="";
SI21="";
SI22="";
SI23="";
SI24="";
SI25="";
SI26="";
SI27="";
SI28="";
SI29="";
SI30="";
SI31="";
SI32="";
SI33="";
SI34="";
SI35="";
SI36="";
SI37="";
SI38="";
SI39="";
SI40="";
SI41="";
II01="";
II02="";
II03="";
II04="";
II05="";
II06="";
II07="";
II08="";
II09="";
II10="";
II11="";
OB01="";
OB02="";
OB03="";
OB04="";
PUCO="";
SF01="";
SF02="";
SF03="";
SF04="";
SF05="";
SF06="";
SF07="";
SF08="";
SF09="";
SF10="";
SF11="";
SF12="";
SF13="";
SF14="";
SF15="";
SF16="";
SF17="";
SF18="";
SF19="";
SF20="";
SF21="";
SF22="";
SF23="";
SF24="";
SF25="";
SF26="";
SF27="";
SF28="";
SF29="";
SF30="";
SF31="";
SF32="";
SF33="";
SF34="";
SF35="";
SF36="";
SF37="";
SF38="";
SF39="";
SF40="";
SF41="";
SF42="";
SF43="";
SF44="";
SF45="";
SF46="";
SF47="";
SF48="";
SF49="";
FA28="";
FA29="";
FA30="";
FA31="";
II12="";
II13="";
II14="";
AO38="";
IS38="";
B638="";
PRMU="";
PRMUi=0;
PRMO="";
CAMU="";
CAMUi=0;
CAMO="";
INDU="";
INDUi=0;
INDO="";
INDH="";
II15="";
II16="";
II17="";
II18="";
II19="";
II20="";
PLYP="";
PLYPi=0;
WEDT="";
WEDTi=0;
FM01="";
FM02="";
FM03="";
FM04="";
FM05="";
FM06="";
FM07="";
FM08="";
FM09="";
FM10="";
FM11="";
FM12="";
FM13="";
FM14="";
FM15="";
FM16="";
FM17="";
FM18="";
FM19="";
FM20="";
FM21="";
FM22="";
FM23="";
FM24="";
FM25="";
FM26="";
FM27="";
FL01="";
FL02="";
FL03="";
FL04="";
FL05="";
FL06="";
FL07="";
FL08="";
FL09="";
FL10="";
FL11="";
FL12="";
FL13="";
FL14="";
FL15="";
FL16="";
FL17="";
FL18="";
FL19="";
FL20="";
FL21="";
FL22="";
FL23="";
FL24="";
FL25="";
FL26="";
FL27="";
AE01="";
AE02="";
AE03="";
AE04="";
AE05="";
AE06="";
AE07="";
AE08="";
AE09="";
AE10="";
AG01="";
AG02="";
AG03="";
AG04="";
AG05="";
AG06="";
AG07="";
AG08="";
AG09="";
AG10="";
AF01="";
AF02="";
AF03="";
AF04="";
AF05="";
AF06="";
AF07="";
AF08="";
AF09="";
AF10="";
AP01="";
AP02="";
AP03="";
AP04="";
AP05="";
AP06="";
AP07="";
AP08="";
AP09="";
AP10="";
BA01="";
BA02="";
BA03="";
BA04="";
BA05="";
BA06="";
BA07="";
BA08="";
BA09="";
BA10="";
BA11="";
BA12="";
BA13="";
BA14="";
BA15="";
CNCT="";
CNCTi=-1;
TCNT="";
TCNTi=0;
OCNT="";
OCNTi=0;
CMNT="";
PTYP="";
PTYPi=0;
REPS="";
REPSi=0;
REPO="";
SDIS="";
SDISi=0;
SDSO="";
WUSE="";
WUSEi=0;
WUSO="";
RF01="";
RF02="";
RF03="";
RF04="";
RF05="";
RF06="";
RF07="";
RF08="";
RFOT="";
MOUF="";
MOUFi=0;
MOFO="";
CO01="";
CO02="";
CO03="";
CO04="";
CO05="";
CO06="";
CO07="";
WC01="";
WC02="";
WC03="";
WC04="";
WC05="";
WC06="";
WC07="";
DVDS="";
CDDS="";
MINI="";
RCRD="";
TAPE="";
FDVD="";
FDVDi=-1;
ODVD="";
NCHD="";
NCHDi=0;
INCM="";
INCMi=0;
HTYP="";
HTYPi=-1;
AOLE="";
AOLEi=-1;
COLE="";
COLEi=-1;
OOLE="";
HM25="";
HM26="";
HM27="";
HS25="";
HS26="";
HS27="";
PL25="";
PL25i=-1;
PL26="";
PL26i=-1;
PL27="";
PL27i=-1;
IF01="";
IF01i=0;
IF02="";
IF03="";
IF04="";
IF05="";
IF06="";
IF07="";
IF08="";
IF09="";
IF10="";
IF11="";
IF12="";
IF13="";
IF14="";
IF15="";
IF16="";
IF17="";
IF18="";
IF19="";
IF20="";
IF21="";
IF22="";
IF23="";
IF24="";
IF25="";
IF26="";
IF27="";
IF28="";
IF29="";
IF30="";
IF31="";
IF32="";
IF33="";
IF34="";
IF35="";
IF36="";
IF37="";
IF38="";
IF39="";
IF40="";
IF41="";
IFOT="";
MA01="";
MA02="";
MA03="";
MA04="";
MA05="";
MA06="";
MA07="";
MA08="";
MA09="";
MA10="";
MA11="";
MA12="";
MA13="";
MA14="";
MA15="";
MA16="";
MA17="";
MA18="";
MA19="";
MA20="";
MA21="";
MA22="";
MA23="";
MA24="";
MA25="";
MA26="";
MAOT="";
OF01="";
OF02="";
OF03="";
OF04="";
OF05="";
OF06="";
OF07="";
OF08="";
OF09="";
OF10="";
OF11="";
OF12="";
OF13="";
OF14="";
OF15="";
OF16="";
OF17="";
OF18="";
OF19="";
OS01="";
OS02="";
OS03="";
OS04="";
OS05="";
OS06="";
OS07="";
OS08="";
OS09="";
OS10="";
OS11="";
OS12="";
OS13="";
OS14="";
OS15="";
OS16="";
OS17="";
OS18="";
OS19="";
BR01="";
BR02="";
BR03="";
BR04="";
BR05="";
BR06="";
BR07="";
BR08="";
BR09="";
BR10="";
BR11="";
BR12="";
BR13="";
BR14="";
BR15="";
BR16="";
BR17="";
BR18="";
BR19="";
FC01="";
FC02="";
FC03="";
FC04="";
FC05="";
FC06="";
FC07="";
FC08="";
FC09="";
FC10="";
FC11="";
FC12="";
FC13="";
FC14="";
FC15="";
FC16="";
FC17="";
FC01i=-1;
FC02i=-1;
FC03i=-1;
FC04i=-1;
FC05i=-1;
FC06i=-1;
FC07i=-1;
FC08i=-1;
FC09i=-1;
FC10i=-1;
FC11i=-1;
FC12i=-1;
FC13i=-1;
FC14i=-1;
FC15i=-1;
FC16i=-1;
FC17i=-1;
UNET="";
UNETi=-1;
MARS="";
MARSi=-1;
EWAR="";
EWARi=-1;
OCOT="";
CG00="";
CG00i=-1;
CG01="";
CG01i=-1;
CG02="";
CG02i=-1;
CG03="";
CG03i=-1;
CG04="";
CG04i=-1;
CG05="";
CG05i=-1;
CG06="";
CG06i=-1;
CG07="";
CG07i=-1;
CG08="";
CG08i=-1;
CG09="";
CG09i=-1;
CG10="";
CG10i=-1;
CG11="";
CG11i=-1;
COCO="";
COCOi=0;
MI00="";
MI01="";
MI02="";
MI03="";
MI04="";
MI05="";
MI06="";
MI07="";
MI08="";
MI09="";
MI10="";
MI11="";
MI12="";
MI13="";
MI14="";
MI00i=-1;
MI01i=-1;
MI02i=-1;
MI03i=-1;
MI04i=-1;
MI05i=-1;
MI06i=-1;
MI07i=-1;
MI08i=-1;
MI09i=-1;
MI10i=-1;
MI11i=-1;
MI12i=-1;
MI13i=-1;
MI14i=-1;

YD01="";
YD02="";
YD03="";
YD04="";
YD05="";
YD06="";
YD07="";
YD08="";
YD09="";
YD10="";
YD11="";
YD12="";
YD13="";
YD14="";
YD15="";
YD16="";
YD17="";
YD18="";
YD19="";
YD20="";
YD21="";
YD22="";
YD23="";
YD24="";
YD25="";
YD26="";
YD27="";
YD28="";
YD29="";
YD30="";
YD31="";
YD32="";
YD33="";
YD34="";
YD35="";
YD36="";
YD37="";
YD38="";
YD39="";
YD40="";
YD41="";
YD42="";
YD43="";
YD44="";
YD45="";
YD46="";
YD47="";
YD48="";
YD49="";
YD50="";
YD51="";
YD52="";
YD53="";
YD54="";
YD55="";
YD01i=-1;
YD02i=-1;
YD03i=-1;
YD04i=-1;
YD05i=-1;
YD06i=-1;
YD07i=-1;
YD08i=-1;
YD09i=-1;
YD10i=-1;
YD11i=-1;
YD12i=-1;
YD13i=-1;
YD14i=-1;
YD15i=-1;
YD16i=-1;
YD17i=-1;
YD18i=-1;
YD19i=-1;
YD20i=-1;
YD21i=-1;
YD22i=-1;
YD23i=-1;
YD24i=-1;
YD25i=-1;
YD26i=-1;
YD27i=-1;
YD28i=-1;
YD29i=-1;
YD30i=-1;
YD31i=-1;
YD32i=-1;
YD33i=-1;
YD34i=-1;
YD35i=-1;
YD36i=-1;
YD37i=-1;
YD38i=-1;
YD39i=-1;
YD40i=-1;
YD41i=-1;
YD42i=-1;
YD43i=-1;
YD44i=-1;
YD45i=-1;
YD46i=-1;
YD47i=-1;
YD48i=-1;
YD49i=-1;
YD50i=-1;
YD51i=-1;
YD52i=-1;
YD53i=-1;
YD54i=-1;
YD55i=-1;
NI00="";
NI01="";
NI02="";
NI03="";
NI04="";
NI05="";
NI06="";
NI07="";
NI08="";
NI09="";
NI10="";
NI11="";
NI12="";
NI13="";
NI14="";
NI15="";
NI16="";
NI17="";
NI18="";
NI19="";
NI20="";
NI21="";
NI22="";
NI23="";
NI24="";
NI25="";
NI26="";
NI27="";
NI00i=-1;
NI01i=-1;
NI02i=-1;
NI03i=-1;
NI04i=-1;
NI05i=-1;
NI06i=-1;
NI07i=-1;
NI08i=-1;
NI09i=-1;
NI10i=-1;
NI11i=-1;
NI12i=-1;
NI13i=-1;
NI14i=-1;
NI15i=-1;
NI16i=-1;
NI17i=-1;
NI18i=-1;
NI19i=-1;
NI20i=-1;
NI21i=-1;
NI22i=-1;
NI23i=-1;
NI24i=-1;
NI25i=-1;
NI26i=-1;
NI27i=-1;
NIOT="";

AC01="";
AC02="";
AC03="";
AC04="";
AC05="";
AC06="";
AC07="";
AC08="";
AC09="";
AC10="";
AC11="";
AC12="";
AC13="";
AC14="";
AC15="";
AC16="";
AC17="";
AC18="";
AC19="";
AC20="";
AC21="";
AC22="";
AC23="";
AC24="";

AC01i=-1;
AC02i=-1;
AC03i=-1;
AC04i=-1;
AC05i=-1;
AC06i=-1;
AC07i=-1;
AC08i=-1;
AC09i=-1;
AC10i=-1;
AC11i=-1;
AC12i=-1;
AC13i=-1;
AC14i=-1;
AC15i=-1;
AC16i=-1;
AC17i=-1;
AC18i=-1;
AC19i=-1;
AC20i=-1;
AC21i=-1;
AC22i=-1;
AC23i=-1;
AC24i=-1;

AO39="";
IS39="";
B639="";
AO40="";
IS40="";
B640="";
AO41="";
IS41="";
B641="";
AO42="";
IS42="";
B642="";
AO43="";
IS43="";
B643="";

AO39i=-1;
IS39i=-1;
B639i=-1;
AO40i=-1;
IS40i=-1;
B640i=-1;
AO41i=-1;
IS41i=-1;
B641i=-1;
AO42i=-1;
IS42i=-1;
B642i=-1;
AO43i=-1;
IS43i=-1;
B643i=-1;

EIMG="";
EIMGi=0;
IC01="";
IC02="";
IC03="";
IC04="";
IC05="";
IC06="";
IC07="";
IC01i=-1;
IC02i=-1;
IC03i=-1;
IC04i=-1;
IC05i=-1;
IC06i=-1;
IC07i=-1;
ICOT="";

SF49="";
FA32="";
EISC="";
EISCi=-1;

COLR="";
COLRi="0";
WPOL="";
SF50="";
SF50i="-1";
SF51="";
SF51i="-1";
SF52="";
SF52i="-1";
SF53="";
SF53i="-1";
SF54="";
SF54i="-1";
MDRI="";
MDRIi="-1";
MDIR="";
MDIRi="0";
OB05="";
OB05i="-1";
OB06="";
OB06i="-1";
OB07="";
OB07i="-1";
OB08="";
OB08i="-1";
OB09="";
OB09i="-1";
OB10="";
OB10i="-1";
OB11="";
OB11i="-1";
OB12="";
OB12i="-1";
OBFI="";
OP01="";
OP01i="-1";
OP02="";
OP02i="-1";
OP03="";
OP03i="-1";
OP04="";
OP04i="-1";
SMDR="";
SMDRi="0";
SMDO="";
DMFI="";
DMFIi="-1";
HMFD="";
HMFDi="0";
WSMM="";
WSMMi="0";
MMFI="";
MDFP ="";
MDMP ="";
MDFC ="";
MDMC ="";
SF55 ="";
SF56 ="";
SF57 ="";
SF58 ="";
SF59 ="";
SF60 ="";
SF61 ="";
SF62 ="";
SF63 ="";
SF64 ="";
SF65 ="";
SF55i =0;
SF56i =0;
SF57i =0;
SF58i =0;
SF59i =0;
SF60i =0;
SF61i =0;
SF62i =0;
SF63i =0;
SF64i =0;
SF65i =0;
SFFI ="";
RC01 ="";
RC02 ="";
RC03 ="";
RC04 ="";
RC05 ="";
RC06 ="";
RC07 ="";
RC08 ="";
RC01i =0;
RC02i =0;
RC03i =0;
RC04i =0;
RC05i =0;
RC06i =0;
RC07i =0;
RC08i =0;
RCFI ="";
RH01 ="";
RH02 ="";
RH03 ="";
RH04 ="";
RH05 ="";
RH06 ="";
RH01i =0;
RH02i =0;
RH03i =0;
RH04i =0;
RH05i =0;
RH06i =0;
RHFI ="";
FE35 ="";
FE36 ="";
FE37 ="";
FE38 ="";
FE39 ="";
FE40 ="";
FE41 ="";
FE42 ="";
FE43 ="";
FE44 ="";
FE45 ="";
FE46 ="";
FE47 ="";
FE48 ="";
FE49 ="";
FE50 ="";
FE51 ="";
FE52 ="";
FE53 ="";
FE35i =0;
FE36i =0;
FE37i =0;
FE38i =0;
FE39i =0;
FE40i =0;
FE41i =0;
FE42i =0;
FE43i =0;
FE44i =0;
FE45i =0;
FE46i =0;
FE47i =0;
FE48i =0;
FE49i =0;
FE50i =0;
FE51i =0;
FE52i =0;
FE53i =0;
NCDK ="";
NCDKi =0;
NPRM ="";
NBLM ="";
NVRC ="";
NCTP ="";

PMDP ="";
PMDR ="";
CRMD ="";
MDDK ="";
PMDPi =-1;
PMDRi =-1;
CRMDi =-1;
MDDKi =-1;
PUSE = "";
PUSEi =0;
IF42="";
IF43="";
IF44="";
IF45="";
IF46="";
IF47="";
IF48="";
OF00="";
OS00="";
BR00="";
OB13="";
OB14="";

MO01="";
MO02="";
MO03="";
MO04="";
MO05="";
MO06="";
MO07="";
MO08="";
MO09="";
MO10="";
MO11="";
MO12="";
MO13="";

MO01i=-1;
MO02i=-1;
MO03i=-1;
MO04i=-1;
MO05i=-1;
MO06i=-1;
MO07i=-1;
MO08i=-1;
MO09i=-1;
MO10i=-1;
MO11i=-1;
MO12i=-1;
MO13i=-1;

RF09="";
RF10="";
RF11="";
RF12="";
RF13="";
RF14="";
RF15="";
RF16="";
RF17="";
RF18="";
RF19="";
RF20="";
RF21="";
RF22="";
RF23="";
RF24="";
RF25="";
RF26="";
RF27="";
RF28="";
RF29="";
RF30="";
RF31="";
RF32="";
RF33="";
RF34="";
RF35="";
RF36="";
RF37="";
RF38="";
RF39="";
RF40="";
RF41="";
RF42="";
RF43="";
RF44="";
RF45="";
RF46="";
RF47="";
RF48="";
RF49="";
RF50="";
RF51="";
RF52="";
RF53="";
RF54="";
RF55="";
RF56="";
RF57="";
RF58="";
RF59="";
RF60="";
RF61="";
RF62="";
RF63="";
RF64="";
RF65="";
RF66="";
RF67="";

RF09i=-1;
RF10i=-1;
RF11i=-1;
RF12i=-1;
RF13i=-1;
RF14i=-1;
RF15i=-1;
RF16i=-1;
RF17i=-1;
RF18i=-1;
RF19i=-1;
RF20i=-1;
RF21i=-1;
RF22i=-1;
RF23i=-1;
RF24i=-1;
RF25i=-1;
RF26i=-1;
RF27i=-1;
RF28i=-1;
RF29i=-1;
RF30i=-1;
RF31i=-1;
RF32i=-1;
RF33i=-1;
RF34i=-1;
RF35i=-1;
RF36i=-1;
RF37i=-1;
RF38i=-1;
RF39i=-1;
RF40i=-1;
RF41i=-1;
RF42i=-1;
RF43i=-1;
RF44i=-1;
RF45i=-1;
RF46i=-1;
RF47i=-1;
RF48i=-1;
RF49i=-1;
RF50i=-1;
RF51i=-1;
RF52i=-1;
RF53i=-1;
RF54i=-1;
RF55i=-1;
RF56i=-1;
RF57i=-1;
RF58i=-1;
RF59i=-1;
RF60i=-1;
RF61i=-1;
RF62i=-1;
RF63i=-1;
RF64i=-1;
RF65i=-1;
RF66i=-1;
RF67i=-1;

CO08="";
CO09="";
CO10="";
CO11="";
CO12="";
CO13="";
CO14="";
CO15="";
CO16="";
CO17="";
CO18="";
CO19="";

CO08i=-1;
CO09i=-1;
CO10i=-1;
CO11i=-1;
CO12i=-1;
CO13i=-1;
CO14i=-1;
CO15i=-1;
CO16i=-1;
CO17i=-1;
CO18i=-1;
CO19i=-1;

WUCP="";
WUCPi=0;

AVSM="";
AVSMi=0;

SD01="";
SD02="";
SD03="";
SD04="";
SD05="";
SD06="";
SD07="";

SD01i=-1;
SD02i=-1;
SD03i=-1;
SD04i=-1;
SD05i=-1;
SD06i=-1;
SD07i=-1;

TP01="";
TP02="";
TP03="";
TP04="";

WC08="";
WC09="";
WC10="";
WC11="";
WC12="";
WC13="";
WC14="";
WC15="";

WC08i=-1;
WC09i=-1;
WC10i=-1;
WC11i=-1;
WC12i=-1;
WC13i=-1;
WC14i=-1;
WC15i=-1;

MD01="";
MD02="";
MD03="";
MD04="";
MD05="";
MD06="";
MD07="";
MD08="";
MD09="";
MD10="";
MD11="";
MD12="";
MD13="";
MD14="";
MD15="";

MF01="";
MF02="";
MF03="";
MF04="";
MF05="";
MF06="";
MF07="";
MF08="";
MF09="";
MF10="";
MF11="";
MF12="";
MF13="";
MF14="";
MF15="";

PU01="";
PU02="";
PU03="";
PU04="";
PU05="";

PU01i=-1;
PU02i=-1;
PU03i=-1;
PU04i=-1;
PU05i=-1;

SF00="";
SF00i=-1;

NCDR="";
AGCT="";
AGCTi=0;

MUS1="";
MUS2="";
MUS3="";

MUS1i=0;
MUS2i=0;
MUS3i=0;

SF66="";
SF67="";
SF68="";
FA33="";
FA34="";
AO44="";
IS44="";
B644="";
AO44i=-1;
IS44i=-1;
B644i=-1;

IF52="";
IF53="";
IF54="";
IF55="";
IF56="";
IF57="";
IF58="";
IF59="";
IF60="";
IF61="";
IF62="";
IF63="";
IF64="";
IF65="";
IF66="";
IF67="";
IF68="";

IF52i=-1;
IF53i=-1;
IF54i=-1;
IF55i=-1;
IF56i=-1;
IF57i=-1;
IF58i=-1;
IF59i=-1;
IF60i=-1;
IF61i=-1;
IF62i=-1;
IF63i=-1;
IF64i=-1;
IF65i=-1;
IF66i=-1;
IF67i=-1;
IF68i=-1;

MA28="";
MA28i=-1;

NADL="";
AGCH="";
LRNA="";
LRNAi=0;
LROT="";
WHRM="";
WHRMi="0";
WROT="";
DV01="";
DV01i="-1";
DV02="";
DV02i="-1";
DV03="";
DV03i="-1";
DV04="";
DV04i="-1";
DV05="";
DV05i="-1";
DV06="";
DV06i="-1";
DV07="";
DV07i="-1";
DV08="";
DV08i="-1";
PVUF="";
PVUFi="0";
WDVC="";
WDVCi="0";
VCOT="";
VCPU="";
VCPUi="0";
PUCA="";
PUOT="";
SCAT="";
SCATi="-1";
UCBX="";
UCBXi="-1";
CRDS="";
CRDSi="-1";
SATP="";
SATPi="-1";
BRPS="";
BRES="";
HMCC="";
HMCCi="0";
MRTV="";
MRTVi="0";
WTTV="";
WTTVi="0";
WTOT="";
MASL="";
MASLi="-1";
RESL="";
RESLi="-1";
OVSL="";
OVSLi="-1";
MPNC="";
MPNCi="0";
NCOT="";
MPDC="";
MPDCi="0";
DCOT="";
MPCP="";
MPCPi="0";
CPOT="";

CA01="";
CA01i="0";
CA02="";
CA02i="0";
CA03="";
CA03i="0";
CA04="";
CA04i="0";
CA05="";
CA05i="0";
CA06="";
CA06i="0";
HMVC="";
CTVS="";
CTVSi="0";
CTVA="";
CTVAi="0";
WKCC="";
WKCCi="0";
TVBN="";
VP01="";
VP01i="-1";
VP02="";
VP02i="-1";
VP03="";
VP03i="-1";
VPOT="";
WWVT="";
WWVTi="0";
FKTR="";
FKTP="";
FKOP="";
PKOO="";
C1AG="";
C1FV="";
C2AG="";
C2FV="";
C3AG="";
C3FV="";
C4AG="";
C4FV="";
C1A2="";
N1HT="";
N1VT="";
C2A2="";
N2HT="";
N2VT="";
C3A2="";
N3HT="";
N3VT="";
C4A2="";
N4HT="";
N4VT="";
HECG="";
HECGi="-1";
HEIC="";
HEICi="-1";
HECC="";
HECCi="-1";
HEDV="";
HEDVi="-1";
PVPR="";
PVPRi="0";
PPOT="";
BVOV="";
BVOVi="-1";
HUVV="";
HUVVi="0";
HUOT="";
RCVC="";
RCVCi="-1";
HRVC="";
HRVCi="0";
HROT="";

NCP1="";
CD01="";
CD02="";
CD03="";
CD04="";
CD05="";
CD01i=-1;
CD02i=-1;
CD03i=-1;
CD04i=-1;
CD05i=-1;
RF73="";
RF74="";
RF75="";
RF76="";
RF77="";
RF78="";
RF79="";
RF80="";
RF81="";
RF82="";
RF83="";
RF84="";
RF85="";
RF86="";
RF73i=-1;
RF74i=-1;
RF75i=-1;
RF76i=-1;
RF77i=-1;
RF78i=-1;
RF79i=-1;
RF80i=-1;
RF81i=-1;
RF82i=-1;
RF83i=-1;
RF84i=-1;
RF85i=-1;
RF86i=-1;
YUDC="";
YUDCi=0;
OCPB="";
IF49="";
IF50="";
MA27="";

CP01="";
CP02="";
CP03="";
CP04="";
CP05="";
CP06="";
CP07="";
CP08="";
CP09="";
CP10="";
CP11="";
CPFI="";
OBRN="";
OMDL="";
SNQU="";
SNQUi=0;
TS01="";
TS02="";
TS03="";
TS04="";
TS05="";
TS06="";
TS07="";
TS08="";
RPAU="";
RPAUi=0;
US01="";
US02="";
US03="";
US04="";
US05="";
US06="";
US07="";
US08="";
US09="";
US10="";
US11="";
US12="";
US13="";
US14="";
US01i=-1;
US02i=-1;
US03i=-1;
US04i=-1;
US05i=-1;
US06i=-1;
US07i=-1;
US08i=-1;
US09i=-1;
US10i=-1;
US11i=-1;
US12i=-1;
US13i=-1;
US14i=-1;
LK01="";
LK02="";
LK03="";
LK04="";
LK05="";
LK06="";
LK07="";
LK08="";
LK09="";
LK10="";
LK11="";
LK12="";
LK13="";
LK14="";
LK01i=-1;
LK02i=-1;
LK03i=-1;
LK04i=-1;
LK05i=-1;
LK06i=-1;
LK07i=-1;
LK08i=-1;
LK09i=-1;
LK10i=-1;
LK11i=-1;
LK12i=-1;
LK13i=-1;
LK14i=-1;
NCID="";
NCIDi=0;
NP01="";
NP02="";
NP03="";
NP04="";
NP05="";
NP06="";
NP07="";
NP08="";
PLPH="";
PLPHi=0;
LPFI="";

POP2="";
POP2i=0;
OPP2="";
PULO="";
PULOi=0;
ARTI="";
ARTIi=0;
FND2="";
FND2i=-1;
IWUM="";
IWUMi=0;
VTPS="";
VTPSi=0;
VPFI="";
MART="";
MARTi=0;

OB15="";
IF69="";
IF70="";
IF71="";
OF20="";
OS20="";
BR20="";
OF21="";
OS21="";
BR21="";
FC18="";
FC18i=-1;

IF72="";
IF73="";
IF74="";
IF75="";
IF76="";
IF77="";
IF78="";
MA29="";
MA30="";
OF22="";
OS22="";
BR22="";

IF79="";
IF80="";
IF81="";
MA31="";
OF23="";
OS23="";
BR23="";
OF24="";
OS24="";
BR24="";
OF25="";
OS25="";
BR25="";
OF26="";
OS26="";
BR26="";
FC19="";
FC19i=-1;
IF51="";
SUIN="";
SUINi=-1;
CBRN="";
CBRNi=0;
PICW="";
PICWi=-1;
PICI="";
PICIi=-1;
WS01="";
WS02="";
WS03="";
WS04="";
WS05="";
WS06="";
WS07="";
WS08="";
WS09="";
WS10="";
WSOT="";
WR01="";
WR02="";
WR03="";
WR04="";
WR05="";
WR06="";
WR07="";
WR08="";
WR09="";
WR10="";
WR11="";
WR12="";
WR13="";
SV01="";
SV02="";
SV03="";
BMOL="";
BMOLi=-1;
WTBM="";
WTBMi=0;
WJSU="";
WJSUi=0;

OF27="";
OS27="";
BR27="";
OF28="";
OS28="";
BR28="";
IF82="";
IF83="";
MA32="";
MA33="";
MA34="";

SFOT="";

A_Reg=0;
DI_Reg_Code=0;

function formData() {
  age_header="19";
  data="";
  data+="&UNID="+UNID
    +"&DIstat="+DI_Reg_Code
    +"&EMAL="+EMAL
    +"&PASS="+PASS
    +"&PASV="+PASV
    +"&FNAM="+FNAM
    +"&LNAM="+LNAM
    +"&ADD1="+ADD1
    +"&ADD2="+ADD2
    +"&CITY="+CITY
    +"&STAT="+STAT
    +"&ZIPC="+ZIPC
    +"&PHON="+PHON
    +"&AGES="+age_header+AGES
    +"&SEXX="+SEXX
    +"&OCCU="+OCCU
    +"&OCCO="+OCCO
    +"&MODL="+MODL
    +"&SRNU="+SRNU
    +"&MNTH="+MNTH
    +"&YEAR="+YEAR
    +"&POPR="+POPR
    +"&OPOP="+OPOP
    +"&WHEN="+WHEN
    +"&INFL="+INFL
    +"&FNDS="+FNDS
    +"&WGFT="+WGFT
    +"&HM01="+HM01
    +"&HM02="+HM02
    +"&HM03="+HM03
    +"&HM04="+HM04
    +"&HM05="+HM05
    +"&HM06="+HM06
    +"&HM07="+HM07
    +"&HM08="+HM08
    +"&HM09="+HM09
    +"&HM10="+HM10
    +"&HM11="+HM11
    +"&HM12="+HM12
    +"&HM13="+HM13
    +"&HM14="+HM14
    +"&HM15="+HM15
    +"&HM16="+HM16
    +"&HM17="+HM17
    +"&HM18="+HM18
    +"&HM19="+HM19
    +"&HM20="+HM20
    +"&HM21="+HM21
    +"&HM22="+HM22
    +"&HM23="+HM23
    +"&HM24="+HM24
    +"&HS01="+HS01
    +"&HS02="+HS02
    +"&HS03="+HS03
    +"&HS04="+HS04
    +"&HS05="+HS05
    +"&HS06="+HS06
    +"&HS07="+HS07
    +"&HS08="+HS08
    +"&HS09="+HS09
    +"&HS10="+HS10
    +"&HS11="+HS11
    +"&HS12="+HS12
    +"&HS13="+HS13
    +"&HS14="+HS14
    +"&HS15="+HS15
    +"&HS16="+HS16
    +"&HS17="+HS17
    +"&HS18="+HS18
    +"&HS19="+HS19
    +"&HS20="+HS20
    +"&HS21="+HS21
    +"&HS22="+HS22
    +"&HS23="+HS23
    +"&HS24="+HS24
    +"&PL01="+PL01
    +"&PL02="+PL02
    +"&PL03="+PL03
    +"&PL04="+PL04
    +"&PL05="+PL05
    +"&PL06="+PL06
    +"&PL07="+PL07
    +"&PL08="+PL08
    +"&PL09="+PL09
    +"&PL10="+PL10
    +"&PL11="+PL11
    +"&PL12="+PL12
    +"&PL13="+PL13
    +"&PL14="+PL14
    +"&PL15="+PL15
    +"&PL16="+PL16
    +"&PL17="+PL17
    +"&PL18="+PL18
    +"&PL19="+PL19
    +"&PL20="+PL20
    +"&PL21="+PL21
    +"&PL22="+PL22
    +"&PL23="+PL23
    +"&PL24="+PL24
    +"&TVSO="+TVSO
    +"&CE01="+CE01
    +"&CE02="+CE02
    +"&NEMA="+NEMA
    +"&PPUR="+PPUR
    +"&PPUO="+PPUO
    +"&CON1="+CON1
    +"&CON2="+CON2
    +"&CON3="+CON3
    +"&STNM="+STNM
    +"&FE01="+FE01
    +"&FE02="+FE02
    +"&FE03="+FE03
    +"&FE04="+FE04
    +"&FE05="+FE05
    +"&FE06="+FE06
    +"&FE07="+FE07
    +"&FE08="+FE08
    +"&FE09="+FE09
    +"&FE10="+FE10
    +"&FE11="+FE11
    +"&FE12="+FE12
    +"&FE13="+FE13
    +"&FE14="+FE14
    +"&FE15="+FE15
    +"&FE16="+FE16
    +"&FE17="+FE17
    +"&FE18="+FE18
    +"&FE19="+FE19
    +"&FE20="+FE20
    +"&FE21="+FE21
    +"&FE22="+FE22
    +"&FE23="+FE23
    +"&FE24="+FE24
    +"&FE25="+FE25
    +"&FE26="+FE26
    +"&FE27="+FE27
    +"&FE28="+FE28
    +"&FE29="+FE29
    +"&FE30="+FE30
    +"&FE31="+FE31
    +"&FE32="+FE32
    +"&FE33="+FE33
    +"&FE34="+FE34
    +"&FEOT="+FEOT
    +"&NF01="+NF01
    +"&NF02="+NF02
    +"&NF03="+NF03
    +"&NF04="+NF04
    +"&NF05="+NF05
    +"&NF06="+NF06
    +"&NF07="+NF07
    +"&NF08="+NF08
    +"&NF09="+NF09
    +"&NF10="+NF10
    +"&NF11="+NF11
    +"&NF12="+NF12
    +"&NF13="+NF13
    +"&NF14="+NF14
    +"&NF15="+NF15
    +"&NF16="+NF16
    +"&NF17="+NF17
    +"&NF18="+NF18
    +"&NF19="+NF19
    +"&NFOT="+NFOT
    +"&OSYS="+OSYS
    +"&OSOT="+OSOT
    +"&IMGS="+IMGS
    +"&PBY1="+PBY1
    +"&PBY2="+PBY2
    +"&PBY3="+PBY3
    +"&PBY4="+PBY4
    +"&PBY5="+PBY5
    +"&PBY6="+PBY6
    +"&PBY7="+PBY7
    +"&PBY8="+PBY8
    +"&OPBY="+OPBY
    +"&OWNC="+OWNC
    +"&CUSE="+CUSE
    +"&OCUS="+OCUS
    +"&WCAM="+WCAM
    +"&OC01="+OC01
    +"&OC02="+OC02
    +"&OC03="+OC03
    +"&OC04="+OC04
    +"&OC05="+OC05
    +"&OC06="+OC06
    +"&OC07="+OC07
    +"&OC08="+OC08
    +"&OC09="+OC09
    +"&OC10="+OC10
    +"&OC11="+OC11
    +"&CU01="+CU01
    +"&CU02="+CU02
    +"&CU03="+CU03
    +"&CU04="+CU04
    +"&CU05="+CU05
    +"&CU06="+CU06
    +"&CU07="+CU07
    +"&CU08="+CU08
    +"&CU09="+CU09
    +"&CU10="+CU10
    +"&PLYB="+PLYB
    +"&CCON="+CCON
    +"&BC01="+BC01
    +"&BC02="+BC02
    +"&BC03="+BC03
    +"&BC04="+BC04
    +"&BC05="+BC05
    +"&BC06="+BC06
    +"&IN01="+IN01
    +"&IN02="+IN02
    +"&IN03="+IN03
    +"&IN04="+IN04
    +"&IN05="+IN05
    +"&IN06="+IN06
    +"&IN07="+IN07
    +"&IN08="+IN08
    +"&IN09="+IN09
    +"&IN10="+IN10
    +"&IN11="+IN11
    +"&IN12="+IN12
    +"&IN13="+IN13
    +"&IN14="+IN14
    +"&IN15="+IN15
    +"&FI01="+FI01
    +"&FI02="+FI02
    +"&FI03="+FI03
    +"&FI04="+FI04
    +"&FI05="+FI05
    +"&FI06="+FI06
    +"&FI07="+FI07
    +"&FI08="+FI08
    +"&FI09="+FI09
    +"&FI10="+FI10
    +"&FI11="+FI11
    +"&FI12="+FI12
    +"&FI13="+FI13
    +"&FI14="+FI14
    +"&FI15="+FI15
    +"&FI16="+FI16
    +"&FI17="+FI17
    +"&FI18="+FI18
    +"&FI19="+FI19
    +"&FI20="+FI20
    +"&FI21="+FI21
    +"&FI22="+FI22
    +"&FI23="+FI23
    +"&FI24="+FI24
    +"&FI25="+FI25
    +"&FI26="+FI26
    +"&FI27="+FI27
    +"&FI28="+FI28
    +"&FI29="+FI29
    +"&FI30="+FI30
    +"&FI31="+FI31
    +"&FI32="+FI32
    +"&FI33="+FI33
    +"&FI34="+FI34
    +"&FI35="+FI35
    +"&FI36="+FI36
    +"&FI37="+FI37
    +"&FI38="+FI38
    +"&FI39="+FI39
    +"&FI40="+FI40
    +"&FI41="+FI41
    +"&FI42="+FI42
    +"&FI43="+FI43
    +"&FI44="+FI44
    +"&FI45="+FI45
    +"&FI46="+FI46
    +"&FI47="+FI47
    +"&FI48="+FI48
    +"&FI49="+FI49
    +"&FI50="+FI50
    +"&FI51="+FI51
    +"&FI52="+FI52
    +"&FI53="+FI53
    +"&FI54="+FI54
    +"&FI55="+FI55
    +"&FI56="+FI56
    +"&FI57="+FI57
    +"&FI58="+FI58
    +"&FF01="+FF01
    +"&FF02="+FF02
    +"&FF03="+FF03
    +"&FF04="+FF04
    +"&FF05="+FF05
    +"&FF06="+FF06
    +"&FF07="+FF07
    +"&FF08="+FF08
    +"&FF09="+FF09
    +"&FF10="+FF10
    +"&FF11="+FF11
    +"&FF12="+FF12
    +"&FF13="+FF13
    +"&FF14="+FF14
    +"&FF15="+FF15
    +"&FF16="+FF16
    +"&FF17="+FF17
    +"&FF18="+FF18
    +"&FF19="+FF19
    +"&FF20="+FF20
    +"&FF21="+FF21
    +"&FF22="+FF22
    +"&PPQT="+PPQT
    +"&PSQT="+PSQT
    +"&LCDQ="+LCDQ
    +"&NITQ="+NITQ
    +"&NTSQ="+NTSQ
    +"&GENQ="+GENQ
    +"&DSNQ="+DSNQ
    +"&OPMQ="+OPMQ
    +"&PRCQ="+PRCQ
    +"&BATQ="+BATQ
    +"&CMPQ="+CMPQ
    +"&DSCQ="+DSCQ
    +"&MSSQ="+MSSQ
    +"&MSIQ="+MSIQ
    +"&PGSQ="+PGSQ
    +"&PCPQ="+PCPQ
    +"&AO01="+AO01
    +"&AO02="+AO02
    +"&AO03="+AO03
    +"&AO04="+AO04
    +"&AO05="+AO05
    +"&AO06="+AO06
    +"&AO07="+AO07
    +"&AO08="+AO08
    +"&AO09="+AO09
    +"&AO10="+AO10
    +"&AO11="+AO11
    +"&AO12="+AO12
    +"&AO13="+AO13
    +"&AO14="+AO14
    +"&AO15="+AO15
    +"&AO16="+AO16
    +"&AO17="+AO17
    +"&AO18="+AO18
    +"&AO19="+AO19
    +"&AO20="+AO20
    +"&AO21="+AO21
    +"&AO22="+AO22
    +"&AO23="+AO23
    +"&AO24="+AO24
    +"&AO25="+AO25
    +"&AO26="+AO26
    +"&AO27="+AO27
    +"&AO28="+AO28
    +"&AO29="+AO29
    +"&AO30="+AO30
    +"&AO31="+AO31
    +"&AO32="+AO32
    +"&AO33="+AO33
    +"&AO34="+AO34
    +"&AO35="+AO35
    +"&IS01="+IS01
    +"&IS02="+IS02
    +"&IS03="+IS03
    +"&IS04="+IS04
    +"&IS05="+IS05
    +"&IS06="+IS06
    +"&IS07="+IS07
    +"&IS08="+IS08
    +"&IS09="+IS09
    +"&IS10="+IS10
    +"&IS11="+IS11
    +"&IS12="+IS12
    +"&IS13="+IS13
    +"&IS14="+IS14
    +"&IS15="+IS15
    +"&IS16="+IS16
    +"&IS17="+IS17
    +"&IS18="+IS18
    +"&IS19="+IS19
    +"&IS20="+IS20
    +"&IS21="+IS21
    +"&IS22="+IS22
    +"&IS23="+IS23
    +"&IS24="+IS24
    +"&IS25="+IS25
    +"&IS26="+IS26
    +"&IS27="+IS27
    +"&IS28="+IS28
    +"&IS29="+IS29
    +"&IS30="+IS30
    +"&IS31="+IS31
    +"&IS32="+IS32
    +"&IS33="+IS33
    +"&IS34="+IS34
    +"&IS35="+IS35
    +"&B601="+B601
    +"&B602="+B602
    +"&B603="+B603
    +"&B604="+B604
    +"&B605="+B605
    +"&B606="+B606
    +"&B607="+B607
    +"&B608="+B608
    +"&B609="+B609
    +"&B610="+B610
    +"&B611="+B611
    +"&B612="+B612
    +"&B613="+B613
    +"&B614="+B614
    +"&B615="+B615
    +"&B616="+B616
    +"&B617="+B617
    +"&B618="+B618
    +"&B619="+B619
    +"&B620="+B620
    +"&B621="+B621
    +"&B622="+B622
    +"&B623="+B623
    +"&B624="+B624
    +"&B625="+B625
    +"&B626="+B626
    +"&B627="+B627
    +"&B628="+B628
    +"&B629="+B629
    +"&B630="+B630
    +"&B631="+B631
    +"&B632="+B632
    +"&B633="+B633
    +"&B634="+B634
    +"&B635="+B635
    +"&CTYP="+CTYP
    +"&AO36="+AO36
    +"&AO37="+AO37
    +"&IS36="+IS36
    +"&IS37="+IS37
    +"&B636="+B636
    +"&B637="+B637
    +"&FA01="+FA01
    +"&FA02="+FA02
    +"&FA03="+FA03
    +"&FA04="+FA04
    +"&FA05="+FA05
    +"&FA06="+FA06
    +"&FA07="+FA07
    +"&FA08="+FA08
    +"&FA09="+FA09
    +"&FA10="+FA10
    +"&FA11="+FA11
    +"&FA12="+FA12
    +"&FA13="+FA13
    +"&FA14="+FA14
    +"&FA15="+FA15
    +"&FA16="+FA16
    +"&FA17="+FA17
    +"&FA18="+FA18
    +"&FA19="+FA19
    +"&FA20="+FA20
    +"&FA21="+FA21
    +"&FA22="+FA22
    +"&FA23="+FA23
    +"&FA24="+FA24
    +"&FA25="+FA25
    +"&FA26="+FA26
    +"&FA27="+FA27
    +"&SI01="+SI01
    +"&SI02="+SI02
    +"&SI03="+SI03
    +"&SI04="+SI04
    +"&SI05="+SI05
    +"&SI06="+SI06
    +"&SI07="+SI07
    +"&SI08="+SI08
    +"&SI09="+SI09
    +"&SI10="+SI10
    +"&SI11="+SI11
    +"&SI12="+SI12
    +"&SI13="+SI13
    +"&SI14="+SI14
    +"&SI15="+SI15
    +"&SI16="+SI16
    +"&SI17="+SI17
    +"&SI18="+SI18
    +"&SI19="+SI19
    +"&SI20="+SI20
    +"&SI21="+SI21
    +"&SI22="+SI22
    +"&SI23="+SI23
    +"&SI24="+SI24
    +"&SI25="+SI25
    +"&SI26="+SI26
    +"&SI27="+SI27
    +"&II01="+II01
    +"&II02="+II02
    +"&II03="+II03
    +"&II04="+II04
    +"&II05="+II05
    +"&II06="+II06
    +"&II07="+II07
    +"&II08="+II08
    +"&II09="+II09
    +"&II10="+II10
    +"&OB01="+OB01
    +"&OB02="+OB02
    +"&OB03="+OB03
    +"&OB04="+OB04
    +"&PUCO="+PUCO
    +"&SI28="+SI28
    +"&SI29="+SI29
    +"&SI30="+SI30
    +"&SI31="+SI31
    +"&SI32="+SI32
    +"&SI33="+SI33
    +"&SI34="+SI34
    +"&SI35="+SI35
    +"&SI36="+SI36
    +"&SI37="+SI37
    +"&SI38="+SI38
    +"&SI39="+SI39
    +"&SI40="+SI40
    +"&SI41="+SI41
    +"&II11="+II11
    +"&II12="+II12
    +"&II13="+II13
    +"&II14="+II14
    +"&SF01="+SF01
    +"&SF02="+SF02
    +"&SF03="+SF03
    +"&SF04="+SF04
    +"&SF05="+SF05
    +"&SF06="+SF06
    +"&SF07="+SF07
    +"&SF08="+SF08
    +"&SF09="+SF09
    +"&SF10="+SF10
    +"&SF11="+SF11
    +"&SF12="+SF12
    +"&SF13="+SF13
    +"&SF14="+SF14
    +"&SF15="+SF15
    +"&SF16="+SF16
    +"&SF17="+SF17
    +"&SF18="+SF18
    +"&SF19="+SF19
    +"&SF20="+SF20
    +"&SF21="+SF21
    +"&SF22="+SF22
    +"&SF23="+SF23
    +"&SF24="+SF24
    +"&SF25="+SF25
    +"&SF26="+SF26
    +"&SF27="+SF27
    +"&SF28="+SF28
    +"&SF29="+SF29
    +"&SF30="+SF30
    +"&SF31="+SF31
    +"&SF32="+SF32
    +"&SF33="+SF33
    +"&SF34="+SF34
    +"&SF35="+SF35
    +"&SF36="+SF36
    +"&SF37="+SF37
    +"&SF38="+SF38
    +"&SF39="+SF39
    +"&SF40="+SF40
    +"&SF41="+SF41
    +"&SF42="+SF42
    +"&SF43="+SF43
    +"&SF44="+SF44
    +"&SF45="+SF45
    +"&SF46="+SF46
    +"&SF47="+SF47
    +"&SF48="+SF48
    +"&SF49="+SF49
    +"&FA28="+FA28
    +"&FA29="+FA29
    +"&FA30="+FA30
    +"&FA31="+FA31
    +"&AO38="+AO38
    +"&IS38="+IS38
    +"&B638="+B638
    +"&PRMU="+PRMU
    +"&PRMO="+PRMO
    +"&CAMU="+CAMU
    +"&CAMO="+CAMO
    +"&INDU="+INDU
    +"&INDO="+INDO
    +"&INDH="+INDH
    +"&II15="+II15
    +"&II16="+II16
    +"&II17="+II17
    +"&II18="+II18
    +"&II19="+II19
    +"&II20="+II20
    +"&PLYP="+PLYP
    +"&WEDT="+WEDT
    +"&FM01="+FM01
    +"&FM02="+FM02
    +"&FM03="+FM03
    +"&FM04="+FM04
    +"&FM05="+FM05
    +"&FM06="+FM06
    +"&FM07="+FM07
    +"&FM08="+FM08
    +"&FM09="+FM09
    +"&FM10="+FM10
    +"&FM11="+FM11
    +"&FM12="+FM12
    +"&FM13="+FM13
    +"&FM14="+FM14
    +"&FM15="+FM15
    +"&FM16="+FM16
    +"&FM17="+FM17
    +"&FM18="+FM18
    +"&FM19="+FM19
    +"&FM20="+FM20
    +"&FM21="+FM21
    +"&FM22="+FM22
    +"&FM23="+FM23
    +"&FM24="+FM24
    +"&FM25="+FM25
    +"&FM26="+FM26
    +"&FM27="+FM27
    +"&FL01="+FL01
    +"&FL02="+FL02
    +"&FL03="+FL03
    +"&FL04="+FL04
    +"&FL05="+FL05
    +"&FL06="+FL06
    +"&FL07="+FL07
    +"&FL08="+FL08
    +"&FL09="+FL09
    +"&FL10="+FL10
    +"&FL11="+FL11
    +"&FL12="+FL12
    +"&FL13="+FL13
    +"&FL14="+FL14
    +"&FL15="+FL15
    +"&FL16="+FL16
    +"&FL17="+FL17
    +"&FL18="+FL18
    +"&FL19="+FL19
    +"&FL20="+FL20
    +"&FL21="+FL21
    +"&FL22="+FL22
    +"&FL23="+FL23
    +"&FL24="+FL24
    +"&FL25="+FL25
    +"&FL26="+FL26
    +"&FL27="+FL27
    +"&AE01="+AE01
    +"&AE02="+AE02
    +"&AE03="+AE03
    +"&AE04="+AE04
    +"&AE05="+AE05
    +"&AE06="+AE06
    +"&AE07="+AE07
    +"&AE08="+AE08
    +"&AE09="+AE09
    +"&AE10="+AE10
    +"&AP01="+AP01
    +"&AP02="+AP02
    +"&AP03="+AP03
    +"&AP04="+AP04
    +"&AP05="+AP05
    +"&AP06="+AP06
    +"&AP07="+AP07
    +"&AP08="+AP08
    +"&AP09="+AP09
    +"&AP10="+AP10
    +"&AG01="+AG01
    +"&AG02="+AG02
    +"&AG03="+AG03
    +"&AG04="+AG04
    +"&AG05="+AG05
    +"&AG06="+AG06
    +"&AG07="+AG07
    +"&AG08="+AG08
    +"&AG09="+AG09
    +"&AG10="+AG10
    +"&AF01="+AF01
    +"&AF02="+AF02
    +"&AF03="+AF03
    +"&AF04="+AF04
    +"&AF05="+AF05
    +"&AF06="+AF06
    +"&AF07="+AF07
    +"&AF08="+AF08
    +"&AF09="+AF09
    +"&AF10="+AF10
    +"&BA01="+BA01
    +"&BA02="+BA02
    +"&BA03="+BA03
    +"&BA04="+BA04
    +"&BA05="+BA05
    +"&BA06="+BA06
    +"&BA07="+BA07
    +"&BA08="+BA08
    +"&BA09="+BA09
    +"&BA10="+BA10
    +"&BA11="+BA11
    +"&BA12="+BA12
    +"&BA13="+BA13
    +"&BA14="+BA14
    +"&BA15="+BA15
    +"&CNCT="+CNCT
    +"&TCNT="+TCNT
    +"&OCNT="+OCNT
    +"&CMNT="+CMNT
    +"&PTYP="+PTYP
    +"&REPS="+REPS
    +"&REPO="+REPO
    +"&SDIS="+SDIS
    +"&SDSO="+SDSO
    +"&WUSE="+WUSE
    +"&WUSO="+WUSO
    +"&RF01="+RF01
    +"&RF02="+RF02
    +"&RF03="+RF03
    +"&RF04="+RF04
    +"&RF05="+RF05
    +"&RF06="+RF06
    +"&RF07="+RF07
    +"&RF08="+RF08
    +"&RFOT="+RFOT
    +"&MOUF="+MOUF
    +"&MOFO="+MOFO
    +"&CO01="+CO01
    +"&CO02="+CO02
    +"&CO03="+CO03
    +"&CO04="+CO04
    +"&CO05="+CO05
    +"&CO06="+CO06
    +"&CO07="+CO07
    +"&WC01="+WC01
    +"&WC02="+WC02
    +"&WC03="+WC03
    +"&WC04="+WC04
    +"&WC05="+WC05
    +"&WC06="+WC06
    +"&WC07="+WC07
    +"&DVDS="+DVDS
    +"&CDDS="+CDDS
    +"&MINI="+MINI
    +"&RCRD="+RCRD
    +"&TAPE="+TAPE
    +"&FDVD="+FDVD
    +"&ODVD="+ODVD
    +"&NCHD="+NCHD
    +"&INCM="+INCM
    +"&HTYP="+HTYP
    +"&AOLE="+AOLE
    +"&COLE="+COLE
    +"&OOLE="+OOLE
    +"&HM25="+HM25
    +"&HM26="+HM26
    +"&HM27="+HM27
    +"&HS25="+HS25
    +"&HS26="+HS26
    +"&HS27="+HS27
    +"&PL25="+PL25
    +"&PL26="+PL26
    +"&PL27="+PL27
    +"&IF01="+IF01
    +"&IF02="+IF02
    +"&IF03="+IF03
    +"&IF04="+IF04
    +"&IF05="+IF05
    +"&IF06="+IF06
    +"&IF07="+IF07
    +"&IF08="+IF08
    +"&IF09="+IF09
    +"&IF10="+IF10
    +"&IF11="+IF11
    +"&IF12="+IF12
    +"&IF13="+IF13
    +"&IF14="+IF14
    +"&IF15="+IF15
    +"&IF16="+IF16
    +"&IF17="+IF17
    +"&IF18="+IF18
    +"&IF19="+IF19
    +"&IF20="+IF20
    +"&IF21="+IF21
    +"&IF22="+IF22
    +"&IF23="+IF23
    +"&IF24="+IF24
    +"&IF25="+IF25
    +"&IF26="+IF26
    +"&IF27="+IF27
    +"&IF28="+IF28
    +"&IF29="+IF29
    +"&IF30="+IF30
    +"&IF31="+IF31
    +"&IF32="+IF32
    +"&IF33="+IF33
    +"&IF34="+IF34
    +"&IF35="+IF35
    +"&IF36="+IF36
    +"&IF37="+IF37
    +"&IF38="+IF38
    +"&IF39="+IF39
    +"&IF40="+IF40
    +"&IF41="+IF41
    +"&IFOT="+IFOT
    +"&MA01="+MA01
    +"&MA02="+MA02
    +"&MA03="+MA03
    +"&MA04="+MA04
    +"&MA05="+MA05
    +"&MA06="+MA06
    +"&MA07="+MA07
    +"&MA08="+MA08
    +"&MA09="+MA09
    +"&MA10="+MA10
    +"&MA11="+MA11
    +"&MA12="+MA12
    +"&MA13="+MA13
    +"&MA14="+MA14
    +"&MA15="+MA15
    +"&MA16="+MA16
    +"&MA17="+MA17
    +"&MA18="+MA18
    +"&MA19="+MA19
    +"&MA20="+MA20
    +"&MA21="+MA21
    +"&MA22="+MA22
    +"&MA23="+MA23
    +"&MA24="+MA24
    +"&MA25="+MA25
    +"&MA26="+MA26
    +"&MAOT="+MAOT
    +"&OF01="+OF01
    +"&OF02="+OF02
    +"&OF03="+OF03
    +"&OF04="+OF04
    +"&OF05="+OF05
    +"&OF06="+OF06
    +"&OF07="+OF07
    +"&OF08="+OF08
    +"&OF09="+OF09
    +"&OF10="+OF10
    +"&OF11="+OF11
    +"&OF12="+OF12
    +"&OF13="+OF13
    +"&OF14="+OF14
    +"&OF15="+OF15
    +"&OF16="+OF16
    +"&OF17="+OF17
    +"&OF18="+OF18
    +"&OF19="+OF19
    +"&OS01="+OS01
    +"&OS02="+OS02
    +"&OS03="+OS03
    +"&OS04="+OS04
    +"&OS05="+OS05
    +"&OS06="+OS06
    +"&OS07="+OS07
    +"&OS08="+OS08
    +"&OS09="+OS09
    +"&OS10="+OS10
    +"&OS11="+OS11
    +"&OS12="+OS12
    +"&OS13="+OS13
    +"&OS14="+OS14
    +"&OS15="+OS15
    +"&OS16="+OS16
    +"&OS17="+OS17
    +"&OS18="+OS18
    +"&OS19="+OS19
    +"&BR01="+BR01
    +"&BR02="+BR02
    +"&BR03="+BR03
    +"&BR04="+BR04
    +"&BR05="+BR05
    +"&BR06="+BR06
    +"&BR07="+BR07
    +"&BR08="+BR08
    +"&BR09="+BR09
    +"&BR10="+BR10
    +"&BR11="+BR11
    +"&BR12="+BR12
    +"&BR13="+BR13
    +"&BR14="+BR14
    +"&BR15="+BR15
    +"&BR16="+BR16
    +"&BR17="+BR17
    +"&BR18="+BR18
    +"&BR19="+BR19
    +"&FC01="+FC01
    +"&FC02="+FC02
    +"&FC03="+FC03
    +"&FC04="+FC04
    +"&FC05="+FC05
    +"&FC06="+FC06
    +"&FC07="+FC07
    +"&FC08="+FC08
    +"&FC09="+FC09
    +"&FC10="+FC10
    +"&FC11="+FC11
    +"&FC12="+FC12
    +"&FC13="+FC13
    +"&FC14="+FC14
    +"&FC15="+FC15
    +"&FC16="+FC16
    +"&FC17="+FC17
    +"&UNET="+UNET
    +"&MARS="+MARS
    +"&EWAR="+EWAR
    +"&OCOT="+OCOT
    +"&CG00="+CG00
    +"&CG01="+CG01
    +"&CG02="+CG02
    +"&CG03="+CG03
    +"&CG04="+CG04
    +"&CG05="+CG05
    +"&CG06="+CG06
    +"&CG07="+CG07
    +"&CG08="+CG08
    +"&CG09="+CG09
    +"&CG10="+CG10
    +"&CG11="+CG11
    +"&COCO="+COCO
    +"&MI00="+MI00
    +"&MI01="+MI01
    +"&MI02="+MI02
    +"&MI03="+MI03
    +"&MI04="+MI04
    +"&MI05="+MI05
    +"&MI06="+MI06
    +"&MI07="+MI07
    +"&MI08="+MI08
    +"&MI09="+MI09
    +"&MI10="+MI10
    +"&MI11="+MI11
    +"&MI12="+MI12
    +"&MI13="+MI13
    +"&MI14="+MI14
    +"&YD01="+YD01
    +"&YD02="+YD02
    +"&YD03="+YD03
    +"&YD04="+YD04
    +"&YD05="+YD05
    +"&YD06="+YD06
    +"&YD07="+YD07
    +"&YD08="+YD08
    +"&YD09="+YD09
    +"&YD10="+YD10
    +"&YD11="+YD11
    +"&YD12="+YD12
    +"&YD13="+YD13
    +"&YD14="+YD14
    +"&YD15="+YD15
    +"&YD16="+YD16
    +"&YD17="+YD17
    +"&YD18="+YD18
    +"&YD19="+YD19
    +"&YD20="+YD20
    +"&YD21="+YD21
    +"&YD22="+YD22
    +"&YD23="+YD23
    +"&YD24="+YD24
    +"&YD25="+YD25
    +"&YD26="+YD26
    +"&YD27="+YD27
    +"&YD28="+YD28
    +"&YD29="+YD29
    +"&YD30="+YD30
    +"&YD31="+YD31
    +"&YD32="+YD32
    +"&YD33="+YD33
    +"&YD34="+YD34
    +"&YD35="+YD35
    +"&YD36="+YD36
    +"&YD37="+YD37
    +"&YD38="+YD38
    +"&YD39="+YD39
    +"&YD40="+YD40
    +"&YD41="+YD41
    +"&YD42="+YD42
    +"&YD43="+YD43
    +"&YD44="+YD44
    +"&YD45="+YD45
    +"&YD46="+YD46
    +"&YD47="+YD47
    +"&YD48="+YD48
    +"&YD49="+YD49
    +"&YD50="+YD50
    +"&YD51="+YD51
    +"&YD52="+YD52
    +"&YD53="+YD53
    +"&YD54="+YD54
    +"&YD55="+YD55
    +"&NI00="+NI00
    +"&NI01="+NI01
    +"&NI02="+NI02
    +"&NI03="+NI03
    +"&NI04="+NI04
    +"&NI05="+NI05
    +"&NI06="+NI06
    +"&NI07="+NI07
    +"&NI08="+NI08
    +"&NI09="+NI09
    +"&NI10="+NI10
    +"&NI11="+NI11
    +"&NI12="+NI12
    +"&NI13="+NI13
    +"&NI14="+NI14
    +"&NI15="+NI15
    +"&NI16="+NI16
    +"&NI17="+NI17
    +"&NI18="+NI18
    +"&NI19="+NI19
    +"&NI20="+NI20
    +"&NI21="+NI21
    +"&NI22="+NI22
    +"&NI23="+NI23
    +"&NI24="+NI24
    +"&NI25="+NI25
    +"&NI26="+NI26
    +"&NI27="+NI27
    +"&NIOT="+NIOT
    +"&AC01="+AC01
    +"&AC02="+AC02
    +"&AC03="+AC03
    +"&AC04="+AC04
    +"&AC05="+AC05
    +"&AC06="+AC06
    +"&AC07="+AC07
    +"&AC08="+AC08
    +"&AC09="+AC09
    +"&AC10="+AC10
    +"&AC11="+AC11
    +"&AC12="+AC12
    +"&AC13="+AC13
    +"&AC14="+AC14
    +"&AC15="+AC15
    +"&AC16="+AC16
    +"&AC17="+AC17
    +"&AC18="+AC18
    +"&AC19="+AC19
    +"&AC20="+AC20
    +"&AC21="+AC21
    +"&AC22="+AC22
    +"&AC23="+AC23
    +"&AC24="+AC24
    +"&AO39="+AO39
    +"&IS39="+IS39
    +"&B639="+B639
    +"&AO40="+AO40
    +"&IS40="+IS40
    +"&B640="+B640
    +"&AO41="+AO41
    +"&IS41="+IS41
    +"&B641="+B641
    +"&AO42="+AO42
    +"&IS42="+IS42
    +"&B642="+B642
    +"&AO43="+AO43
    +"&IS43="+IS43
    +"&B643="+B643
    +"&EIMG="+EIMG
    +"&IC01="+IC01
    +"&IC02="+IC02
    +"&IC03="+IC03
    +"&IC04="+IC04
    +"&IC05="+IC05
    +"&IC06="+IC06
    +"&IC07="+IC07
    +"&ICOT="+ICOT
    +"&FA32="+FA32
    +"&EISC="+EISC
    +"&COLR="+COLR
    +"&WPOL="+WPOL
    +"&SF50="+SF50
    +"&SF51="+SF51
    +"&SF52="+SF52
    +"&SF53="+SF53
    +"&SF54="+SF54
    +"&MDRI="+MDRI
    +"&MDIR="+MDIR
    +"&OB05="+OB05
    +"&OB06="+OB06
    +"&OB07="+OB07
    +"&OB08="+OB08
    +"&OB09="+OB09
    +"&OB10="+OB10
    +"&OB11="+OB11
    +"&OB12="+OB12
    +"&OBFI="+OBFI
    +"&OP01="+OP01
    +"&OP02="+OP02
    +"&OP03="+OP03
    +"&OP04="+OP04
    +"&SMDR="+SMDR
    +"&SMDO="+SMDO
    +"&DMFI="+DMFI
    +"&HMFD="+HMFD
    +"&WSMM="+WSMM
    +"&MMFI="+MMFI
    +"&MDFP="+MDFP
    +"&MDMP="+MDMP
    +"&MDFC="+MDFC
    +"&MDMC="+MDMC
    +"&SF55="+SF55
    +"&SF56="+SF56
    +"&SF57="+SF57
    +"&SF58="+SF58
    +"&SF59="+SF59
    +"&SF60="+SF60
    +"&SF61="+SF61
    +"&SF62="+SF62
    +"&SF63="+SF63
    +"&SF64="+SF64
    +"&SF65="+SF65
    +"&SFFI="+SFFI
    +"&RC01="+RC01
    +"&RC02="+RC02
    +"&RC03="+RC03
    +"&RC04="+RC04
    +"&RC05="+RC05
    +"&RC06="+RC06
    +"&RC07="+RC07
    +"&RC08="+RC08
    +"&RCFI="+RCFI
    +"&RH01="+RH01
    +"&RH02="+RH02
    +"&RH03="+RH03
    +"&RH04="+RH04
    +"&RH05="+RH05
    +"&RH06="+RH06
    +"&RHFI="+RHFI
    +"&FE35="+FE35
    +"&FE36="+FE36
    +"&FE37="+FE37
    +"&FE38="+FE38
    +"&FE39="+FE39
    +"&FE40="+FE40
    +"&FE41="+FE41
    +"&FE42="+FE42
    +"&FE43="+FE43
    +"&FE44="+FE44
    +"&FE45="+FE45
    +"&FE46="+FE46
    +"&FE47="+FE47
    +"&FE48="+FE48
    +"&FE49="+FE49
    +"&FE50="+FE50
    +"&FE51="+FE51
    +"&FE52="+FE52
    +"&FE53="+FE53
    +"&NCDK="+NCDK
    +"&NPRM="+NPRM
    +"&NBLM="+NBLM
    +"&NVRC="+NVRC
    +"&NCTP="+NCTP
    +"&PMDP="+PMDP
    +"&PMDR="+PMDR
    +"&CRMD="+CRMD
    +"&MDDK="+MDDK
    +"&PUSE="+PUSE
    +"&IF42="+IF42
    +"&IF43="+IF43
    +"&IF44="+IF44
    +"&IF45="+IF45
    +"&IF46="+IF46
    +"&IF47="+IF47
    +"&IF48="+IF48
    +"&OF00="+OF00
    +"&OS00="+OS00
    +"&BR00="+BR00
    +"&OB13="+OB13
    +"&OB14="+OB14
    +"&MO01="+MO01
    +"&MO02="+MO02
    +"&MO03="+MO03
    +"&MO04="+MO04
    +"&MO05="+MO05
    +"&MO06="+MO06
    +"&MO07="+MO07
    +"&MO08="+MO08
    +"&MO09="+MO09
    +"&MO10="+MO10
    +"&MO11="+MO11
    +"&MO12="+MO12
    +"&MO13="+MO13
    +"&RF09="+RF09
    +"&RF10="+RF10
    +"&RF11="+RF11
    +"&RF12="+RF12
    +"&RF13="+RF13
    +"&RF14="+RF14
    +"&RF15="+RF15
    +"&RF16="+RF16
    +"&RF17="+RF17
    +"&RF18="+RF18
    +"&RF19="+RF19
    +"&RF20="+RF20
    +"&RF21="+RF21
    +"&RF22="+RF22
    +"&RF23="+RF23
    +"&RF24="+RF24
    +"&RF25="+RF25
    +"&RF26="+RF26
    +"&RF27="+RF27
    +"&RF28="+RF28
    +"&RF29="+RF29
    +"&RF30="+RF30
    +"&RF31="+RF31
    +"&RF32="+RF32
    +"&RF33="+RF33
    +"&RF34="+RF34
    +"&RF35="+RF35
    +"&RF36="+RF36
    +"&RF37="+RF37
    +"&RF38="+RF38
    +"&RF39="+RF39
    +"&RF40="+RF40
    +"&RF41="+RF41
    +"&RF42="+RF42
    +"&RF43="+RF43
    +"&RF44="+RF44
    +"&RF45="+RF45
    +"&RF46="+RF46
    +"&RF47="+RF47
    +"&RF48="+RF48
    +"&RF49="+RF49
    +"&RF50="+RF50
    +"&RF51="+RF51
    +"&RF52="+RF52
    +"&RF53="+RF53
    +"&RF54="+RF54
    +"&RF55="+RF55
    +"&RF56="+RF56
    +"&RF57="+RF57
    +"&RF58="+RF58
    +"&RF59="+RF59
    +"&RF60="+RF60
    +"&RF61="+RF61
    +"&RF62="+RF62
    +"&RF63="+RF63
    +"&RF64="+RF64
    +"&RF65="+RF65
    +"&RF66="+RF66
    +"&RF67="+RF67
    +"&CO08="+CO08
    +"&CO09="+CO09
    +"&CO10="+CO10
    +"&CO11="+CO11
    +"&CO12="+CO12
    +"&CO13="+CO13
    +"&CO14="+CO14
    +"&CO15="+CO15
    +"&CO16="+CO16
    +"&CO17="+CO17
    +"&CO18="+CO18
    +"&CO19="+CO19
    +"&WUCP="+WUCP
    +"&AVSM="+AVSM
    +"&SD01="+SD01
    +"&SD02="+SD02
    +"&SD03="+SD03
    +"&SD04="+SD04
    +"&SD05="+SD05
    +"&SD06="+SD06
    +"&SD07="+SD07
    +"&TP01="+TP01
    +"&TP02="+TP02
    +"&TP03="+TP03
    +"&TP04="+TP04
    +"&WC08="+WC08
    +"&WC09="+WC09
    +"&WC10="+WC10
    +"&WC11="+WC11
    +"&WC12="+WC12
    +"&WC13="+WC13
    +"&WC14="+WC14
    +"&WC15="+WC15
    +"&MD01="+MD01
    +"&MD02="+MD02
    +"&MD03="+MD03
    +"&MD04="+MD04
    +"&MD05="+MD05
    +"&MD06="+MD06
    +"&MD07="+MD07
    +"&MD08="+MD08
    +"&MD09="+MD09
    +"&MD10="+MD10
    +"&MD11="+MD11
    +"&MD12="+MD12
    +"&MD13="+MD13
    +"&MD14="+MD14
    +"&MD15="+MD15
    +"&MF01="+MF01
    +"&MF02="+MF02
    +"&MF03="+MF03
    +"&MF04="+MF04
    +"&MF05="+MF05
    +"&MF06="+MF06
    +"&MF07="+MF07
    +"&MF08="+MF08
    +"&MF09="+MF09
    +"&MF10="+MF10
    +"&MF11="+MF11
    +"&MF12="+MF12
    +"&MF13="+MF13
    +"&MF14="+MF14
    +"&MF15="+MF15
    +"&PU01="+PU01
    +"&PU02="+PU02
    +"&PU03="+PU03
    +"&PU04="+PU04
    +"&PU05="+PU05
    +"&SF00="+SF00
    +"&NCDR="+NCDR
    +"&AGCT="+AGCT
    +"&MUS1="+MUS1
    +"&MUS2="+MUS2
    +"&MUS3="+MUS3
    +"&SF66="+SF66
    +"&SF67="+SF67
    +"&SF68="+SF68
    +"&FA33="+FA33
    +"&FA34="+FA34
    +"&AO44="+AO44
    +"&IS44="+IS44
    +"&B644="+B644
    +"&IF52="+IF52
    +"&IF53="+IF53
    +"&IF54="+IF54
    +"&IF55="+IF55
    +"&IF56="+IF56
    +"&IF57="+IF57
    +"&IF58="+IF58
    +"&IF59="+IF59
    +"&IF60="+IF60
    +"&IF61="+IF61
    +"&IF62="+IF62
    +"&IF63="+IF63
    +"&IF64="+IF64
    +"&IF65="+IF65
    +"&IF66="+IF66
    +"&IF67="+IF67
    +"&IF68="+IF68
    +"&MA28="+MA28
    +"&NADL="+NADL
    +"&AGCH="+AGCH
    +"&LRNA="+LRNA
    +"&LROT="+LROT
    +"&WHRM="+WHRM
    +"&WROT="+WROT
    +"&DV01="+DV01
    +"&DV02="+DV02
    +"&DV03="+DV03
    +"&DV04="+DV04
    +"&DV05="+DV05
    +"&DV06="+DV06
    +"&DV07="+DV07
    +"&DV08="+DV08
    +"&PVUF="+PVUF
    +"&WDVC="+WDVC
    +"&VCOT="+VCOT
    +"&VCPU="+VCPU
    +"&PUCA="+PUCA
    +"&PUOT="+PUOT
    +"&SCAT="+SCAT
    +"&UCBX="+UCBX
    +"&CRDS="+CRDS
    +"&SATP="+SATP
    +"&BRPS="+BRPS
    +"&BRES="+BRES
    +"&HMCC="+HMCC
    +"&MRTV="+MRTV
    +"&WTTV="+WTTV
    +"&WTOT="+WTOT
    +"&MASL="+MASL
    +"&RESL="+RESL
    +"&OVSL="+OVSL
    +"&MPNC="+MPNC
    +"&NCOT="+NCOT
    +"&MPCP="+MPCP
    +"&CPOT="+CPOT
    +"&CA01="+CA01
    +"&CA02="+CA02
    +"&CA03="+CA03
    +"&CA04="+CA04
    +"&CA05="+CA05
    +"&CA06="+CA06
    +"&HMVC="+HMVC
    +"&CTVS="+CTVS
    +"&CTVA="+CTVA
    +"&WKCC="+WKCC
    +"&TVBN="+TVBN
    +"&VP01="+VP01
    +"&VP02="+VP02
    +"&VP03="+VP03
    +"&VPOT="+VPOT
    +"&WWVT="+WWVT
    +"&FKTR="+FKTR
    +"&FKTP="+FKTP
    +"&FKOP="+FKOP
    +"&PKOO="+PKOO
    +"&C1AG="+C1AG
    +"&C1FV="+C1FV
    +"&C2AG="+C2AG
    +"&C2FV="+C2FV
    +"&C3AG="+C3AG
    +"&C3FV="+C3FV
    +"&C4AG="+C4AG
    +"&C4FV="+C4FV
    +"&C1A2="+C1A2
    +"&N1HT="+N1HT
    +"&N1VT="+N1VT
    +"&C2A2="+C2A2
    +"&N2HT="+N2HT
    +"&N2VT="+N2VT
    +"&C3A2="+C3A2
    +"&N3HT="+N3HT
    +"&N3VT="+N3VT
    +"&C4A2="+C4A2
    +"&N4HT="+N4HT
    +"&N4VT="+N4VT
    +"&HECG="+HECG
    +"&HEIC="+HEIC
    +"&HECC="+HECC
    +"&HEDV="+HEDV
    +"&PVPR="+PVPR
    +"&PPOT="+PPOT
    +"&BVOV="+BVOV
    +"&HUVV="+HUVV
    +"&HUOT="+HUOT
    +"&RCVC="+RCVC
    +"&HRVC="+HRVC
    +"&HROT="+HROT
    +"&NCP1="+NCP1
    +"&CD01="+CD01
    +"&CD02="+CD02
    +"&CD03="+CD03
    +"&CD04="+CD04
    +"&CD05="+CD05
    +"&RF73="+RF73
    +"&RF74="+RF74
    +"&RF75="+RF75
    +"&RF76="+RF76
    +"&RF77="+RF77
    +"&RF78="+RF78
    +"&RF79="+RF79
    +"&RF80="+RF80
    +"&RF81="+RF81
    +"&RF82="+RF82
    +"&RF83="+RF83
    +"&RF84="+RF84
    +"&RF85="+RF85
    +"&RF86="+RF86
    +"&YUDC="+YUDC
    +"&OCPB="+OCPB
    +"&IF49="+IF49
    +"&IF50="+IF50
    +"&MA27="+MA27
    +"&CP01="+CP01
    +"&CP02="+CP02
    +"&CP03="+CP03
    +"&CP04="+CP04
    +"&CP05="+CP05
    +"&CP06="+CP06
    +"&CP07="+CP07
    +"&CP08="+CP08
    +"&CP09="+CP09
    +"&CP10="+CP10
    +"&CP11="+CP11
    +"&CPFI="+CPFI
    +"&OBRN="+OBRN
    +"&OMDL="+OMDL
    +"&SNQU="+SNQU
    +"&TS01="+TS01
    +"&TS02="+TS02
    +"&TS03="+TS03
    +"&TS04="+TS04
    +"&TS05="+TS05
    +"&TS06="+TS06
    +"&TS07="+TS07
    +"&TS08="+TS08
    +"&RPAU="+RPAU
    +"&US01="+US01
    +"&US02="+US02
    +"&US03="+US03
    +"&US04="+US04
    +"&US05="+US05
    +"&US06="+US06
    +"&US07="+US07
    +"&US08="+US08
    +"&US09="+US09
    +"&US10="+US10
    +"&US11="+US11
    +"&US12="+US12
    +"&US13="+US13
    +"&US14="+US14
    +"&LK01="+LK01
    +"&LK02="+LK02
    +"&LK03="+LK03
    +"&LK04="+LK04
    +"&LK05="+LK05
    +"&LK06="+LK06
    +"&LK07="+LK07
    +"&LK08="+LK08
    +"&LK09="+LK09
    +"&LK10="+LK10
    +"&LK11="+LK11
    +"&LK12="+LK12
    +"&LK13="+LK13
    +"&LK14="+LK14
    +"&NCID="+NCID
    +"&NP01="+NP01
    +"&NP02="+NP02
    +"&NP03="+NP03
    +"&NP04="+NP04
    +"&NP05="+NP05
    +"&NP06="+NP06
    +"&NP07="+NP07
    +"&NP08="+NP08
    +"&PLPH="+PLPH
    +"&LPFI="+LPFI
    +"&POP2="+POP2
    +"&OPP2="+OPP2
    +"&PULO="+PULO
    +"&ARTI="+ARTI
    +"&FND2="+FND2
    +"&IWUM="+IWUM
    +"&VTPS="+VTPS
    +"&VPFI="+VPFI
    +"&MART="+MART
    +"&OB15="+OB15
    +"&IF69="+IF69
    +"&IF70="+IF70
    +"&IF71="+IF71
    +"&OF20="+OF20
    +"&OS20="+OS20
    +"&BR20="+BR20
    +"&OF21="+OF21
    +"&OS21="+OS21
    +"&BR21="+BR21
    +"&FC18="+FC18
    +"&IF72="+IF72
    +"&IF73="+IF73
    +"&IF74="+IF74
    +"&IF75="+IF75
    +"&IF76="+IF76
    +"&IF77="+IF77
    +"&IF78="+IF78
    +"&MA29="+MA29
    +"&MA30="+MA30
    +"&OF22="+OF22
    +"&OS22="+OS22
    +"&BR22="+BR22
    +"&IF79="+IF79
    +"&IF80="+IF80
    +"&IF81="+IF81
    +"&MA31="+MA31
    +"&OF23="+OF23
    +"&OS23="+OS23
    +"&BR23="+BR23
    +"&OF24="+OF24
    +"&OS24="+OS24
    +"&BR24="+BR24
    +"&OF25="+OF25
    +"&OS25="+OS25
    +"&BR25="+BR25
    +"&OF26="+OF26
    +"&OS26="+OS26
    +"&BR26="+BR26
    +"&FC19="+FC19
    +"&IF51="+IF51
    +"&SUIN="+SUIN
    +"&CBRN="+CBRN
    +"&PICW="+PICW
    +"&PICI="+PICI
    +"&WS01="+WS01
    +"&WS02="+WS02
    +"&WS03="+WS03
    +"&WS04="+WS04
    +"&WS05="+WS05
    +"&WS06="+WS06
    +"&WS07="+WS07
    +"&WS08="+WS08
    +"&WS09="+WS09
    +"&WS10="+WS10
    +"&WSOT="+WSOT
    +"&WR01="+WR01
    +"&WR02="+WR02
    +"&WR03="+WR03
    +"&WR04="+WR04
    +"&WR05="+WR05
    +"&WR06="+WR06
    +"&WR07="+WR07
    +"&WR08="+WR08
    +"&WR09="+WR09
    +"&WR10="+WR10
    +"&WR11="+WR11
    +"&WR12="+WR12
    +"&WR13="+WR13
    +"&SV01="+SV01
    +"&SV02="+SV02
    +"&SV03="+SV03
    +"&BMOL="+BMOL
    +"&WTBM="+WTBM
    +"&WJSU="+WJSU
    +"&OF27="+OF27
    +"&OS27="+OS27
    +"&BR27="+BR27
    +"&OF28="+OF28
    +"&OS28="+OS28
    +"&BR28="+BR28
    +"&IF82="+IF82
    +"&IF83="+IF83
    +"&MA32="+MA32
    +"&MA33="+MA33
    +"&MA34="+MA34
    +"&SFOT="+SFOT
    +"&MPDC="+MPDC
    +"&DCOT="+DCOT
    ;
  return data;
}

formData();

reportCompare(expect, actual, summary);
