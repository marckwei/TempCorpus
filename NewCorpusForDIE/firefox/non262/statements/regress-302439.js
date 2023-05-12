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
var BUGNUMBER = 302439;
var summary = 'spandep fu should skip unused JSOP_TABLESWITCH jump table entries';
var actual = 'No Crash';
var expect = 'No Crash';

printBugNumber(BUGNUMBER);
printStatus (summary);

function productList(catID,famID) {
  clearBox(document.Support_Form.Product_ID);

  switch(parseInt(catID)) {

  case 1 :                             // Sound Blaster
    switch(parseInt(famID)) {

    case 434 :                     // Audigy 4
      break;

    case 204 :                     // Audigy 2
      break;

    case 205 :                     // Audigy

      try { addBoxItem(document.Support_Form.Product_ID, 'Audigy Platinum eX', '45'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Audigy Platinum', '4846'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Audigy LS (SE)', '10365'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Audigy Digital Entertainment', '5085'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Audigy ES', '5086'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 206 :                     // Live!
      try { addBoxItem(document.Support_Form.Product_ID, 'Live! 24-bit External', '10702'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Sound Blaster Live! MP3+ 5.1', '573'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Live! 5.1', '50'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Live! Digital Entertainment 5.1 (SE)', '4855'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Live! Platinum 5.1', '572'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Sound Blaster Live! 5.1 Digital (Dell)', '1853'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Live! Platinum', '3203'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Sound Blaster Live! Value', '4856'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Sound Blaster Live!', '4857'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 207 :                     // Others
      try { addBoxItem(document.Support_Form.Product_ID, 'Extigy', '585'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Ensoniq AudioPCI', '420'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'PCI4.1 Digital', '681'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Vibra128 4D', '9032'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Digital Music', '154'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Vibra 128', '4851'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Sound Blaster 32', '1844'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'SB AWE64 Digital', '1821'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'SB PCI 5.1', '1828'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Sound Blaster\u00AE', '1841'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Sound Blaster\u00AE 16', '1842'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Sound Blaster 16 Wave Effects', '1843'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Sound Blaster AWE32', '1848'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Sound Blaster AWE64', '1849'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Sound Blaster AWE64 Gold', '1850'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Sound Blaster Microchannels', '1861'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Sound Blaster PCI 128', '1864'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Sound Blaster PCI 64', '1865'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Sound Blaster Pro', '1866'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Sound Blaster Audio PCI', '1559'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 16 :                     // Accessories
      try { addBoxItem(document.Support_Form.Product_ID, 'Live!Drive II', '9278'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Sound Blaster MIDI Adapter', '251'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Mini to Standard MIDI Adapter', '252'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;


    }
    break;

  case 210 :                             // Portable Media Players
    switch(parseInt(famID)) {

    case 211 :                     // Zen
      try { addBoxItem(document.Support_Form.Product_ID, 'Zen Portable Media Center', '9882'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 212 :                     // Accessories
      try { addBoxItem(document.Support_Form.Product_ID, 'Zen PMC Docking Station', '10756'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Zen PMC Li-ion Polymer Battery', '10679'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Zen PMC FM Wired Remote', '10663'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;


    }
    break;

  case 213 :                             // MP3 Players
    switch(parseInt(famID)) {

    case 214 :                     // Zen
      try { addBoxItem(document.Support_Form.Product_ID, 'Zen Touch', '10274'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Zen Micro', '10795'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Zen', '11519'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Zen Xtra', '9288'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Zen NX', '4836'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Zen USB 2.0', '9019'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative NOMAD Jukebox Zen', '117'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 215 :                     // MuVo
      try { addBoxItem(document.Support_Form.Product_ID, 'MuVo Micro N200', '10737'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'MuVo\u00B2 X-Trainer', '5080'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'MuVo Slim', '10052'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'MuVo Sport C100', '10794'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'MuVo V200', '10732'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'MuVo TX FM', '9771'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'MuVo USB 2.0', '10919'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'MuVo', '110'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'MuVo NX', '4884'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'MuVo\u00B2', '4908'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'MuVo TX', '9672'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 216 :                     // Digital MP3 Player
      try { addBoxItem(document.Support_Form.Product_ID, 'Zen Xtra', '9288'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Rhomba NX', '10302'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'MP3 Player FX120', '11010'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'DXT 200', '4996'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Zen USB 2.0', '9019'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Jukebox 3', '296'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative CD-MP3 Slim 600', '1582'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Zen NX', '4836'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'MP3 Player', '4983'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'MP3 Player 2', '4984'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'MP3 Player MX', '4985'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative NOMAD Jukebox Zen', '117'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'JukeBox 2', '239'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative NOMAD JukeBox', '241'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative NOMAD JukeBox C', '242'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Jukebox 10GB', '261'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative CD-MP3 M100', '264'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 217 :                     // Accessories
      try { addBoxItem(document.Support_Form.Product_ID, 'Zen Micro Battery', '11215'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Universal Travel Adapter for Zen Micro', '11711'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Zen Neeon Stik-On', '12982'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Zen Neeon Universal Travel Adapter', '12979'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Leather Case', '11511'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Zen Neeon Leather Case', '12978'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Home Kit - Jukebox 3', '497'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative NOMAD Jukebox 3 Leather Case', '498'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Faceplates - Jukebox 3', '499'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'MuVo Armband', '511'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'NOMAD II MG Wired Remote', '515'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative NOMAD Jukebox Accessory Kit', '533'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative NOMAD Jukebox Battery Charger Kit', '538'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative NOMAD Jukebox Battery Pack', '539'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'NOMAD II MG Travel Cable', '560'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Leather Case - Jukebox 2', '562'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Battery - Jukebox 2', '563'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'MuVo Battery Modules', '999'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'PlayDock PD200', '31'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'TravelSound', '80'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Li-Ion Battery - Jukebox 3', '86'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'FM Wired Remote - Jukebox 3/Jukebox Zen/MuVo\u00B2', '115'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative NOMAD Jukebox Power Adapter', '125'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Cassette Adapter Kit', '401'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Car Kit - Jukebox 3/Jukebox 2/Jukebox Zen/MuVo\u00B2', '496'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Battery Pack', '4997'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Battery Modules - MuVo NX / TX / TX FM', '9217'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Armband - MuVo NX / TX / TX FM', '10126'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;


    }
    break;

  case 4 :                             // Speaker Systems
    switch(parseInt(famID)) {

    case 113 :                     // 7.1 Systems
      try { addBoxItem(document.Support_Form.Product_ID, 'Inspire T7700', '5076'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 24 :                     // 6.1 Systems
      try { addBoxItem(document.Support_Form.Product_ID, 'Inspire 6.1 6600', '465'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 25 :                     // 5.1 Systems
      try { addBoxItem(document.Support_Form.Product_ID, 'Creative Inspire 5.1 5100', '1704'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'PCWorks LX520', '9412'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'I-Trigue 5600', '10736'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Inspire T5900', '10323'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Inspire P5800', '10596'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Desktop Theater 5.1 DTT2200', '428'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Inspire 5.1 5700 Digital', '439'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative Inspire 5.1 Digital 5500', '990'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Inspire 5.1 5200', '55'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative Inspire 5.1 5300', '238'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'MegaWorks THX 5.1 550', '240'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Desktop Theater 5.1 DTT3500 Digital', '290'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'PlayWorks DTT2500 Digital', '291'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative Inspire 5.1 5600', '1705'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Inspire T5400', '5077'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'PlayWorks PS2000 Digital', '427'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Desktop Theater 5.1', '1628'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Desktop Theater 5.1 DTT2500 Digital', '1629'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Cambridge SoundWorks MegaWorks 510D', '478'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 26 :                     // 4.1 Systems
      try { addBoxItem(document.Support_Form.Product_ID, 'FPS1600', '47'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'FPS2000 Digital', '297'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Inspire 4.1 4400', '446'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'FPS1800', '424'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'PC-Works FourPointSurround FPS1000', '378'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'FPS1500', '388'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 27 :                     // 2.1 Systems
      try { addBoxItem(document.Support_Form.Product_ID, 'I-Trigue 3600', '10735'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Inspire T3000', '10329'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'I-Trigue 3400', '10733'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Inspire G380', '9276'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative I-Trigue 3200', '10327'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'PCWorks LX220', '9407'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative Inspire 2.1 Slim 2600', '434'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Inspire 2.1 2500', '461'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'I-Trigue L3500', '4912'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'I-Trigue L3450', '4913'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Inspire T2900', '9025'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Inspire P380', '9026'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'SoundWorks SW320', '48'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'MegaWorks THX 2.1 250D', '124'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'I-Trigue 2.1 3300', '139'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative SBS 2.1 350 Speakers', '281'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'SBS 370', '283'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'PCWorks', '284'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative Inspire Slim 500', '289'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative Inspire 2.1 2400', '298'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'SoundWorks Digital', '299'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'SoundWorks SW310', '304'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'I-Trigue i3350', '279'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 28 :                     // 2.0 Systems
      try { addBoxItem(document.Support_Form.Product_ID, 'Inspire Monitor M85-D', '4910'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Inspire 2.0 1300', '4918'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'SBS 230 Speakers', '4905'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'SBS52', '1'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'SBS16', '2'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Cambridge SBS20', '3'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'SBS50', '1834'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'SBS10', '1831'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative SBS15', '4906'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 29 :                     // Portable Systems
      try { addBoxItem(document.Support_Form.Product_ID, 'TravelSound 200', '10164'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'TravelSound MP3', '1874'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'PlayDock PD200', '31'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'TravelSound', '80'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'TravelSound i-300', '9022'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative TravelSound MP3 Titanium', '991'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 136 :                     // Decoders
      try { addBoxItem(document.Support_Form.Product_ID, 'Decoder DDTS-100', '9468'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 30 :                     // Accessories
      try { addBoxItem(document.Support_Form.Product_ID, 'MT-1100 Speaker Stands', '166'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Headphones HQ-1700', '11164'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Headphones HQ-1300', '4936'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Headphones HN-505', '4938'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Backphones HQ-65', '4916'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Backphones HQ-60', '4937'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Earphones EP-880', '11156'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Earphones EP-480', '11708'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Headset HE-100', '11023'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Headset HS-300', '4939'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'MT-1200 Speaker Stands', '9515'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'SurroundStation', '32'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative HQ-2000 Headphones', '4'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'MT-500 Speaker Tripods', '399'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Inspire 2600 Spkr Grilles', '636'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Inspire 5300 Spkr Grilles', '637'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Inspire 5700 Spkr Grilles', '664'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative HQ-1000 Headphones', '4988'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;


    }
    break;

  case 218 :                             // Web Cameras
    switch(parseInt(famID)) {

    case 219 :                     // WebCam
      try { addBoxItem(document.Support_Form.Product_ID, 'WebCam Live! Ultra for Notebooks', '11491'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'WebCam Live! Ultra', '10451'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'WebCam Live! Pro', '10450'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'WebCam Live!', '10412'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'WebCam Instant', '10410'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'WebCam NX Ultra', '9340'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'WebCam NX Pro', '628'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'WebCam NX', '627'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'WebCam PRO eX', '243'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'WebCam PRO', '616'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'WebCam Go Plus', '15'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Webcam Go ES', '1898'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'WebCam Go Mini', '1900'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'WebCam Go', '17'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Video Blaster WebCam Plus', '16'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'WebCam Notebook', '629'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'WebCam Mobile', '4890'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'WebCam 5', '1896'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'WebCam Vista Pro', '11053'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'WebCam Vista Plus', '11043'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'WebCam', '65'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'WebCam II', '4900'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'WebCam 3', '1908'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'WebCam Vista', '1907'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 220 :                     // PC-CAM
      try { addBoxItem(document.Support_Form.Product_ID, 'PC-CAM 900', '10119'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'PC-CAM 930 Slim', '11431'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'PC-CAM 920 Slim', '10823'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'PC-CAM 880', '308'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'PC-CAM 750', '4878'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'PC-CAM 850', '4879'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative PC-CAM 300', '49'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'PC-CAM 350', '106'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'PC-CAM 550', '107'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'CardCam Value', '116'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'PC-CAM 600', '260'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;


    }
    break;

  case 437 :                             // Headphones &amp; Headsets
    switch(parseInt(famID)) {

    case 438 :                     // Headphones
      try { addBoxItem(document.Support_Form.Product_ID, 'Headphones HQ-1700', '11164'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Headphones HQ-1300', '4936'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Headphones CB2530', '11644'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 439 :                     // Noise-Cancelling Headphones
      try { addBoxItem(document.Support_Form.Product_ID, 'Headphones HN-505', '4938'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 440 :                     // Backphones
      try { addBoxItem(document.Support_Form.Product_ID, 'Backphones HQ-65', '4916'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Backphones HQ-60', '4937'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 441 :                     // Earphones
      try { addBoxItem(document.Support_Form.Product_ID, 'Earphones EP-880', '11156'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Earphones EP-630', '11397'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Earphones EP-480', '11708'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Earphones EP-380', '11229'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 442 :                     // Headsets
      try { addBoxItem(document.Support_Form.Product_ID, 'Headset HE-100', '11023'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Headset HS-300', '4939'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;


    }
    break;

  case 9 :                             // Storage Devices
    switch(parseInt(famID)) {

    case 259 :                     // DVD±RW Drive
      try { addBoxItem(document.Support_Form.Product_ID, 'DVD±RW Dual 8X', '9599'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'DVD±RW Dual 8x8', '10305'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'DVD+RW Dual External 8x8', '10583'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 47 :                     // Combo Drive
      try { addBoxItem(document.Support_Form.Product_ID, 'Combo Drive 52.32.52x/16x', '11712'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Combo Drive 40-12-40/16', '4998'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Combo Drive NS', '9454'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 46 :                     // CD-RW Drive
      try { addBoxItem(document.Support_Form.Product_ID, 'CD-RW External 52-32-52x', '9481'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'CD-RW Blaster 12-10-32', '8'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'CD-RW 52.24.52', '1590'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'CD-RW Blaster 24-10-40 External', '4944'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'CD-RW External 52-24-52x', '9027'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'CD-RW 52-32-52x', '9453'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'CD-RW Blaster 48-12-48 External', '9020'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'CD-RW Blaster 48-12-48', '4941'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 45 :                     // PC-DVD Drive
      try { addBoxItem(document.Support_Form.Product_ID, 'PC-DVD Encore 12x', '6'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'PC-DVD ROM 12x', '1486'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'PC-DVD DVD-ROM 16x', '1490'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'PC-DVD MPEG-1 Decoder Board', '1801'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 44 :                     // CD-ROM Drive
      try { addBoxItem(document.Support_Form.Product_ID, 'CD-ROM Blaster Digital iR52X', '3562'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'CD-ROM Blaster 52X', '11'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '12x CD-ROM Drives', '1485'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '16x CD-ROM Drives', '1489'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '48x CD-ROM Drives', '1548'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '1x & 2x CD-ROM Drives', '1493'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '24x CD-ROM Drives', '1495'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '2x & 3x CD-ROM (SCSI)', '1496'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '32x CD-ROM Drives', '1498'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '36x CD-ROM Drives', '1499'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '40x CD-Rom Drives', '1547'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '4x CD-ROM Drives', '1549'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '6x CD-ROM Drives', '1552'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '8x CD-ROM Drives', '1554'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 49 :                     // Portable Harddisk
      try { addBoxItem(document.Support_Form.Product_ID, 'Storage Blaster Portable Harddisk', '8996'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 265 :                     // Portable Storage
      try { addBoxItem(document.Support_Form.Product_ID, 'ThumbDrive', '10681'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;


    }
    break;

  case 12 :                             // PC Barebone
    switch(parseInt(famID)) {

    case 54 :                     // SLiX PC
      try { addBoxItem(document.Support_Form.Product_ID, 'SLiX PC MPC61Y0', '11766'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;


    }
    break;

  case 11 :                             // Monitors
    switch(parseInt(famID)) {

    case 53 :                     // LCD
      try { addBoxItem(document.Support_Form.Product_ID, '17" TFT LCD Monitor With DVI', '9980'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;


    }
    break;

  case 60 :                             // Video
    switch(parseInt(famID)) {

    case 96 :                     // Video Editing
      try { addBoxItem(document.Support_Form.Product_ID, 'Video Blaster MovieMaker', '13'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;


    }
    break;

  case 13 :                             // Accessories
    switch(parseInt(famID)) {

    case 55 :                     // Sound Blaster
      try { addBoxItem(document.Support_Form.Product_ID, 'Optical Digital I/O Card II', '30'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Sound Blaster MIDI Adapter', '251'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Mini to Standard MIDI Adapter', '252'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Live!Drive II', '9278'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Sound Blaster Audigy Internal Drive', '88'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Sound Blaster Audigy External Drive', '89'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Live! Drive IR', '26'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Live! Drive I', '27'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Remote Controller SBLive', '1816'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 449 :                     // Zen Micro
      try { addBoxItem(document.Support_Form.Product_ID, 'Universal Travel Adapter for Zen Micro', '11711'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Leather Case', '11511'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 483 :                     // Zen Neeon
      try { addBoxItem(document.Support_Form.Product_ID, 'Zen Neeon Stik-On', '12982'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Zen Neeon Leather Case', '12978'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Zen Neeon Universal Travel Adapter', '12979'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 264 :                     // Portable Media Center
      try { addBoxItem(document.Support_Form.Product_ID, 'Zen PMC Docking Station', '10756'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Zen PMC Li-ion Polymer Battery', '10679'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Zen PMC FM Wired Remote', '10663'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 57 :                     // MP3 Players
      try { addBoxItem(document.Support_Form.Product_ID, 'Creative NOMAD JukeBox 3 Car Kit', '4894'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Home Kit - Jukebox 3', '497'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative NOMAD Jukebox 3 Leather Case', '498'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Faceplates - Jukebox 3', '499'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'MuVo Armband', '511'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative NOMAD Jukebox Accessory Kit', '533'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative NOMAD Jukebox Battery Charger Kit', '538'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative NOMAD Jukebox Battery Pack', '539'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Leather Case - Jukebox 2', '562'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Battery - Jukebox 2', '563'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Li-Ion Battery - Jukebox 3', '86'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'FM Wired Remote - Jukebox 3/Jukebox Zen/MuVo\u00B2', '115'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative NOMAD Jukebox Power Adapter', '125'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Cassette Adapter Kit', '401'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Car Kit - Jukebox 3/Jukebox 2/Jukebox Zen/MuVo\u00B2', '496'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Battery Modules - MuVo NX / TX / TX FM', '9217'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Armband - MuVo NX / TX / TX FM', '10126'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 58 :                     // Speaker Systems
      try { addBoxItem(document.Support_Form.Product_ID, 'MT-1100 Speaker Stands', '166'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Headphones HQ-1700', '11164'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Earphones EP-880', '11156'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Headset HE-100', '11023'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'MT-500 Speaker Tripods', '399'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Speaker Extension Cables', '415'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Inspire 5300 Spkr Grilles', '637'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Inspire 5700 Spkr Grilles', '664'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 256 :                     // Wireless
      try { addBoxItem(document.Support_Form.Product_ID, 'Wireless Headset for Bluetooth', '10287'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Headset CB2455', '11394'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Headphones CB2530', '11644'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 59 :                     // Storage
      try { addBoxItem(document.Support_Form.Product_ID, 'S-Video Cable Coupler', '250'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'IDE Cable Set', '255'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Dxr2 Decoder Board', '1648'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Dxr3 Decoder Card', '12'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;


    }
    break;

  case 118 :                             // Digital Cameras
    switch(parseInt(famID)) {

    case 117 :                     // Digital Still Cameras
      try { addBoxItem(document.Support_Form.Product_ID, 'DC-CAM 4200ZS', '10822'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'DC-CAM 3200Z', '9762'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'DC-CAM 3000Z', '9028'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'CardCam', '120'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'CardCam Value', '116'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 309 :                     // Digital Video Cameras
      try { addBoxItem(document.Support_Form.Product_ID, 'DiVi CAM 316', '11175'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;


    }
    break;

  case 10 :                             // Mice & Keyboards
    switch(parseInt(famID)) {

    case 223 :                     // Wired Mice
      try { addBoxItem(document.Support_Form.Product_ID, 'Mouse 5500', '11387'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Mouse 3500', '11388'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Mouse Classic', '4919'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Mouse Optical Lite', '4920'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Mouse Optical 3000', '4924'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Creative Optical Mouse', '262'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Mouse Notebook Optical', '9147'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 224 :                     // Wireless Mice
      try { addBoxItem(document.Support_Form.Product_ID, 'FreePoint Travel', '11165'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'FreePoint Travel Mini', '11166'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'FreePoint 5500', '11178'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'FreePoint 3500', '11386'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Mouse Wireless Optical 5000', '9145'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Mouse Wireless Optical', '263'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Mouse Wireless Optical 3000', '4923'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 227 :                     // Wireless Mice & Keyboards
      try { addBoxItem(document.Support_Form.Product_ID, 'Desktop Wireless 9000 Pro', '11493'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Desktop Wireless 8000', '10104'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Desktop Wireless 6000', '5039'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 228 :                     // Wired PC & MIDI Keyboards
      try { addBoxItem(document.Support_Form.Product_ID, 'Prodikeys DM', '9389'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Prodikeys DM Value', '9600'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Prodikeys', '504'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 52 :                     // Gaming Devices
      try { addBoxItem(document.Support_Form.Product_ID, 'Avant Force NX', '9394'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Cobra Force 3D', '9396'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Gamepad I', '1658'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;


    }
    break;

  case 8 :                             // Musical Keyboards
    switch(parseInt(famID)) {

    case 234 :                     // PC & MIDI Keyboards
      try { addBoxItem(document.Support_Form.Product_ID, 'Prodikeys DM', '9389'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Prodikeys DM Value', '9600'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Prodikeys', '504'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 231 :                     // MIDI Keyboards
      try { addBoxItem(document.Support_Form.Product_ID, 'Creative Blasterkeys', '40'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;


    }
    break;

  case 237 :                             // Creative Professional
    switch(parseInt(famID)) {

    case 239 :                     // Digital Audio Systems
      try { addBoxItem(document.Support_Form.Product_ID, 'E-MU 1820M', '10496'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'E-MU 1212M', '10500'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'E-MU 1820', '10494'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'E-MU 0404', '10498'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 240 :                     // Desktop Sampling Systems
      try { addBoxItem(document.Support_Form.Product_ID, 'Emulator X', '10502'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Emulator X Studio', '10504'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Proteus X', '11074'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 421 :                     // Desktop Sound Modules
      try { addBoxItem(document.Support_Form.Product_ID, 'Proteus X', '11074'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 258 :                     // Accessories and Upgrades
      try { addBoxItem(document.Support_Form.Product_ID, 'Proteus X Software Upgrade', '11073'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Emulator X OS Upgrade', '10225'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Mo\'Phatt X', '11329'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Planet Earth X', '11330'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Virtuoso X', '11332'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Vintage X Pro Collection', '11072'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Street Kits', '11331'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'AudioDock M', '10229'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Audio Dock', '10230'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Beat Shop 2', '10404'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'EDI Cable', '10227'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Sync Daughter Card', '10576'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;


    }
    break;

  case 243 :                             // Wireless
    switch(parseInt(famID)) {

    case 246 :                     // Mice & Keyboards
      try { addBoxItem(document.Support_Form.Product_ID, 'FreePoint 5500', '11178'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'FreePoint 3500', '11386'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Mouse Wireless Optical 5000', '9145'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Desktop Wireless 8000', '10104'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Desktop Wireless 6000', '5039'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Mouse Wireless Optical', '263'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Mouse Wireless Optical 3000', '4923'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 248 :                     // Accessories
      try { addBoxItem(document.Support_Form.Product_ID, 'Headset CB2460', '11238'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Headset CB2455', '11394'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Wireless Headset for Bluetooth', '10287'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Headphones CB2530', '11644'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;


    }
    break;

  case 244 :                             // Notebook Products
    switch(parseInt(famID)) {

    case 250 :                     // PCMCIA Sound Blaster
      try { addBoxItem(document.Support_Form.Product_ID, 'Audigy 2 ZS Notebook', '10769'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 249 :                     // USB Sound Blaster
      try { addBoxItem(document.Support_Form.Product_ID, 'Audigy 2 NX', '9103'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Live! 24-bit External', '10702'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Digital Music LX', '10246'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Digital Music', '154'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Extigy', '585'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 251 :                     // Portable Speaker Systems
      try { addBoxItem(document.Support_Form.Product_ID, 'TravelSound 200', '10164'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'TravelSound i-300', '9022'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'TravelSound MP3', '1874'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 252 :                     // Mice & Keyboards
      try { addBoxItem(document.Support_Form.Product_ID, 'Mouse Wireless NoteBook Optical', '10188'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Mouse Notebook Optical', '9147'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 253 :                     // Web Cameras
      try { addBoxItem(document.Support_Form.Product_ID, 'WebCam Live! Ultra for Notebooks', '11491'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'WebCam Notebook', '629'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'WebCam Mobile', '4890'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;


    }
    break;

  case 6 :                             // Graphics
    switch(parseInt(famID)) {

    case 37 :                     // ATI Radeon 9000 series
      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster RX9250', '11489'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster RX9250 Xtreme', '11490'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 230 :                     // 3D Labs
      try { addBoxItem(document.Support_Form.Product_ID, 'Graphics Blaster Picture Perfect', '164'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 99 :                     // NVIDIA GeForce
      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster GeForce', '1500'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster GeForce 2', '1501'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster GeForce Pro', '1505'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster GeForce2 ULTRA 64MB AGP', '1512'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 98 :                     // NVIDIA Riva TNT Series
      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster RIVA TNT2 Pro', '1527'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Graphics Blaster RIVA128ZX', '1689'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster Riva TNT2', '4841'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster RIVA TNT2 Value', '4842'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster TNT2 Ultra', '4843'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 73 :                     // 3D Blaster
      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster 4 Titanium 4200', '1516'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster 5 RX9700 Pro', '1524'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster 4 MX440', '1539'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster 5 RX9000 64MB', '1540'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster 5 RX9000 Pro', '1541'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster 4 MX420', '4869'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster 5 RX9800 Pro', '4917'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster 4 MX460', '4969'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster 5 RX9600', '4973'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster 5 RX9000 Pro 128MB', '8995'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster 5 RX9200 SE', '9024'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster 5 RX9600 Pro', '9576'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster 5 RX9600 XT', '10311'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster 5 RX9600 SE', '10335'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster Savage 4', '1536'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster VLB', '1537'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster Voodoo 2', '1538'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster PCI', '1523'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster Banshee', '1506'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, '3D Blaster Banshee AGP', '1507'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;


    }
    break;

  case 7 :                             // Modems & Networking
    switch(parseInt(famID)) {

    case 41 :                     // Wireless
      try { addBoxItem(document.Support_Form.Product_ID, 'USB Adapter CB2431', '10863'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Network Blaster Wireless PCMCIA Card', '3868'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 42 :                     // Broadband
      try { addBoxItem(document.Support_Form.Product_ID, 'Broadband Blaster DSL Router 8015U', '11176'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Broadband Blaster Router 8110', '10280'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Broadband Blaster ADSL Bridge ', '4873'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Broadband Blaster USB Modem', '4871'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Broadband Blaster DSL', '4921'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 40 :                     // Analog
      try { addBoxItem(document.Support_Form.Product_ID, 'Modem Blaster PCMCIA', '24'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Modem Blaster V.92 PCI', '52'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Modem Blaster V.92 Serial', '258'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Modem Blaster V.92 USB', '266'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Modem 56k Internal', '1715'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Modem Blaster Flash 56II ISA', '18'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Modem Blaster V.90 ISA', '19'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Modem Blaster Flash 56 PCI', '21'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Modem Blaster V.90 USB', '22'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Modem Blaster V.90 External', '23'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Modem Blaster USB (DE5675)', '8992'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Modem Blaster USB (DE5673)', '8991'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Modem Blaster PCI (DI5663)', '4999'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Modem Blaster PCI (DI5656)', '8988'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Modem Blaster PCI (DI5655)', '8989'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Modem Blaster External (DE5625)', '8990'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Modem Blaster 28.8 External', '5000'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'CT5451 Modem Blaster Voice PnP', '5001'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'Phone Blaster', '1809'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;


    }
    break;

  case 106 :                             // Software
    switch(parseInt(famID)) {

    case 241 :                     // HansVision DXT
      try { addBoxItem(document.Support_Form.Product_ID, 'HansVision DXT 2005 Edition', '12218'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 242 :                     // Children\'s Multimedia Educational
      try { addBoxItem(document.Support_Form.Product_ID, 'WaWaYaYa Happy Mandarin Series', '11269'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      try { addBoxItem(document.Support_Form.Product_ID, 'WaWaYaYa Happy English Series', '4932'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 107 :                     // HansVision
      try { addBoxItem(document.Support_Form.Product_ID, 'HansVision DXT', '4928'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 108 :                     // WaWaYaYa
      try { addBoxItem(document.Support_Form.Product_ID, 'WaWaYaYa Comprehensive Ability Series', '4930'); } catch(e) {addBoxItem(document.Support_Form.Product_ID, '1', '2');  } //

      break;

    case 109 :                     // Others

      break;


    }
    break;

  }
  //                addBoxItem(document.Support_Form.Product_ID, 'Zen Portable Media Center', 'DUMMYPREFIX_ZenPMC_Temp|9882');
}

try
{
  productList(0,0);
}
catch(e)
{
}

reportCompare(expect, actual, summary);
