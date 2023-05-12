// Copyright 2008 the V8 project authors. All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above
//       copyright notice, this list of conditions and the following
//       disclaimer in the documentation and/or other materials provided
//       with the distribution.
//     * Neither the name of Google Inc. nor the names of its
//       contributors may be used to endorse or promote products derived
//       from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

function MjsUnitAssertionError(message) {
  this.message = message;
  // Temporarily install a custom stack trace formatter and restore the
  // previous value.
  let prevPrepareStackTrace = Error.prepareStackTrace;
  try {
    Error.prepareStackTrace = MjsUnitAssertionError.prepareStackTrace;
    // This allows fetching the stack trace using TryCatch::StackTrace.
    this.stack = new Error("MjsUnitAssertionError").stack;
  } finally {
    Error.prepareStackTrace = prevPrepareStackTrace;
  }
}

/*
 * This file is included in all mini jsunit test cases.  The test
 * framework expects lines that signal failed tests to start with
 * the f-word and ignore all other lines.
 */

MjsUnitAssertionError.prototype.toString = function () {
	return this.message + "\n\nStack: " + this.stack;
};

// Expected and found values the same objects, or the same primitive
// values.
// For known primitive values, please use assertEquals.
var assertSame;

// Inverse of assertSame.
var assertNotSame;

// Expected and found values are identical primitive values or functions
// or similarly structured objects (checking internal properties
// of, e.g., Number and Date objects, the elements of arrays
// and the properties of non-Array objects).
var assertEquals;

// Deep equality predicate used by assertEquals.
var deepEquals;

// Expected and found values are not identical primitive values or functions
// or similarly structured objects (checking internal properties
// of, e.g., Number and Date objects, the elements of arrays
// and the properties of non-Array objects).
var assertNotEquals;

// The difference between expected and found value is within certain tolerance.
var assertEqualsDelta;

// The found object is an Array with the same length and elements
// as the expected object. The expected object doesn't need to be an Array,
// as long as it's "array-ish".
var assertArrayEquals;

// The found object must have the same enumerable properties as the
// expected object. The type of object isn't checked.
var assertPropertiesEqual;

// Assert that the string conversion of the found value is equal to
// the expected string. Only kept for backwards compatibility, please
// check the real structure of the found value.
var assertToStringEquals;

// Checks that the found value is true. Use with boolean expressions
// for tests that doesn't have their own assertXXX function.
var assertTrue;

// Checks that the found value is false.
var assertFalse;

// Checks that the found value is null. Kept for historical compatibility,
// please just use assertEquals(null, expected).
var assertNull;

// Checks that the found value is *not* null.
var assertNotNull;

// Assert that the passed function or eval code throws an exception.
// The optional second argument is an exception constructor that the
// thrown exception is checked against with "instanceof".
// The optional third argument is a message type string that is compared
// to the type property on the thrown exception.
var assertThrows;

// Assert that the passed function throws an exception.
// The exception is checked against the second argument using assertEquals.
var assertThrowsEquals;

// Assert that the passed function or eval code does not throw an exception.
var assertDoesNotThrow;

// Asserts that the found value is an instance of the constructor passed
// as the second argument.
var assertInstanceof;

// Assert that this code is never executed (i.e., always fails if executed).
var assertUnreachable;

// Assert that the function code is (not) optimized.  If "no sync" is passed
// as second argument, we do not wait for the concurrent optimization thread to
// finish when polling for optimization status.
// Only works with --allow-natives-syntax.
var assertOptimized;
var assertUnoptimized;

// Assert that a string contains another expected substring.
var assertContains;

// Assert that a string matches a given regex.
var assertMatches;

// Assert that a promise resolves or rejects.
// Parameters:
// {promise} - the promise
// {success} - optional - a callback which is called with the result of the
//             resolving promise.
//  {fail} -   optional - a callback which is called with the result of the
//             rejecting promise. If the promise is rejected but no {fail}
//             callback is set, the error is propagated out of the promise
//             chain.
var assertPromiseResult;

var promiseTestChain;
var promiseTestCount = 0;

// These bits must be in sync with bits defined in Runtime_GetOptimizationStatus
var V8OptimizationStatus = {
  kIsFunction: 1 << 0,
  kNeverOptimize: 1 << 1,
  kAlwaysOptimize: 1 << 2,
  kMaybeDeopted: 1 << 3,
  kOptimized: 1 << 4,
  kTurboFanned: 1 << 5,
  kInterpreted: 1 << 6,
  kMarkedForOptimization: 1 << 7,
  kMarkedForConcurrentOptimization: 1 << 8,
  kOptimizingConcurrently: 1 << 9,
  kIsExecuting: 1 << 10,
  kTopmostFrameIsTurboFanned: 1 << 11,
  kLiteMode: 1 << 12,
};

// Returns true if --lite-mode is on and we can't ever turn on optimization.
var isNeverOptimizeLiteMode;

// Returns true if --no-opt mode is on.
var isNeverOptimize;

// Returns true if --always-opt mode is on.
var isAlwaysOptimize;

// Returns true if given function in interpreted.
var isInterpreted;

// Returns true if given function is optimized.
var isOptimized;

// Returns true if given function is compiled by TurboFan.
var isTurboFanned;

// Monkey-patchable all-purpose failure handler.
var failWithMessage;

// Returns the formatted failure text.  Used by test-async.js.
var formatFailureText;

// Returns a pretty-printed string representation of the passed value.
var prettyPrinted;

(function () {  // Scope for utility functions.

  var ObjectPrototypeToString = Object.prototype.toString;
  var NumberPrototypeValueOf = Number.prototype.valueOf;
  var BooleanPrototypeValueOf = Boolean.prototype.valueOf;
  var StringPrototypeValueOf = String.prototype.valueOf;
  var DatePrototypeValueOf = Date.prototype.valueOf;
  var RegExpPrototypeToString = RegExp.prototype.toString;
  var ArrayPrototypeForEach = Array.prototype.forEach;
  var ArrayPrototypeJoin = Array.prototype.join;
  var ArrayPrototypeMap = Array.prototype.map;
  var ArrayPrototypePush = Array.prototype.push;

  var BigIntPrototypeValueOf;
  // TODO(neis): Remove try-catch once BigInts are enabled by default.
  try {
    BigIntPrototypeValueOf = BigInt.prototype.valueOf;
  } catch(e) {}

  function classOf(object) {
    // Argument must not be null or undefined.
    var string = ObjectPrototypeToString.call(object);
    // String has format [object <ClassName>].
    return string.substring(8, string.length - 1);
  }


  function ValueOf(value) {
    switch (classOf(value)) {
      case "Number":
        return NumberPrototypeValueOf.call(value);
      case "BigInt":
        return BigIntPrototypeValueOf.call(value);
      case "String":
        return StringPrototypeValueOf.call(value);
      case "Boolean":
        return BooleanPrototypeValueOf.call(value);
      case "Date":
        return DatePrototypeValueOf.call(value);
      default:
        return value;
    }
  }


  prettyPrinted = function prettyPrinted(value) {
    switch (typeof value) {
      case "string":
        return JSON.stringify(value);
      case "bigint":
        return String(value) + "n";
      case "number":
        if (value === 0 && (1 / value) < 0) return "-0";
        // FALLTHROUGH.
      case "boolean":
      case "undefined":
      case "function":
      case "symbol":
        return String(value);
      case "object":
        if (value === null) return "null";
        var objectClass = classOf(value);
        switch (objectClass) {
          case "Number":
          case "BigInt":
          case "String":
          case "Boolean":
          case "Date":
            return objectClass + "(" + prettyPrinted(ValueOf(value)) + ")";
          case "RegExp":
            return RegExpPrototypeToString.call(value);
          case "Array":
            var mapped = ArrayPrototypeMap.call(
                value, prettyPrintedArrayElement);
            var joined = ArrayPrototypeJoin.call(mapped, ",");
            return "[" + joined + "]";
          case "Uint8Array":
          case "Int8Array":
          case "Int16Array":
          case "Uint16Array":
          case "Uint32Array":
          case "Int32Array":
          case "Float32Array":
          case "Float64Array":
            var joined = ArrayPrototypeJoin.call(value, ",");
            return objectClass + "([" + joined + "])";
          case "Object":
            break;
          default:
            return objectClass + "(" + String(value) + ")";
        }
        // [[Class]] is "Object".
        var name = value.constructor.name;
        if (name) return name + "()";
        return "Object()";
      default:
        return "-- unknown value --";
    }
  }


  function prettyPrintedArrayElement(value, index, array) {
    if (value === undefined && !(index in array)) return "";
    return prettyPrinted(value);
  }


  failWithMessage = function failWithMessage(message) {
    throw new MjsUnitAssertionError(message);
  }

  formatFailureText = function(expectedText, found, name_opt) {
    var message = "Fail" + "ure";
    if (name_opt) {
      // Fix this when we ditch the old test runner.
      message += " (" + name_opt + ")";
    }

    var foundText = prettyPrinted(found);
    if (expectedText.length <= 40 && foundText.length <= 40) {
      message += ": expected <" + expectedText + "> found <" + foundText + ">";
    } else {
      message += ":\nexpected:\n" + expectedText + "\nfound:\n" + foundText;
    }
    return message;
  }

  function fail(expectedText, found, name_opt) {
    return failWithMessage(formatFailureText(expectedText, found, name_opt));
  }


  function deepObjectEquals(a, b) {
    var aProps = Object.keys(a);
    aProps.sort();
    var bProps = Object.keys(b);
    bProps.sort();
    if (!deepEquals(aProps, bProps)) {
      return false;
    }
    for (var i = 0; i < aProps.length; i++) {
      if (!deepEquals(a[aProps[i]], b[aProps[i]])) {
        return false;
      }
    }
    return true;
  }


  deepEquals = function deepEquals(a, b) {
    if (a === b) {
      // Check for -0.
      if (a === 0) return (1 / a) === (1 / b);
      return true;
    }
    if (typeof a !== typeof b) return false;
    if (typeof a === "number") return isNaN(a) && isNaN(b);
    if (typeof a !== "object" && typeof a !== "function") return false;
    // Neither a nor b is primitive.
    var objectClass = classOf(a);
    if (objectClass !== classOf(b)) return false;
    if (objectClass === "RegExp") {
      // For RegExp, just compare pattern and flags using its toString.
      return RegExpPrototypeToString.call(a) ===
             RegExpPrototypeToString.call(b);
    }
    // Functions are only identical to themselves.
    if (objectClass === "Function") return false;
    if (objectClass === "Array") {
      var elementCount = 0;
      if (a.length !== b.length) {
        return false;
      }
      for (var i = 0; i < a.length; i++) {
        if (!deepEquals(a[i], b[i])) return false;
      }
      return true;
    }
    if (objectClass === "String" || objectClass === "Number" ||
      objectClass === "BigInt" || objectClass === "Boolean" ||
      objectClass === "Date") {
      if (ValueOf(a) !== ValueOf(b)) return false;
    }
    return deepObjectEquals(a, b);
  }

  assertSame = function assertSame(expected, found, name_opt) {
    // TODO(mstarzinger): We should think about using Harmony's egal operator
    // or the function equivalent Object.is() here.
    if (found === expected) {
      if (expected !== 0 || (1 / expected) === (1 / found)) return;
    } else if ((expected !== expected) && (found !== found)) {
      return;
    }
    fail(prettyPrinted(expected), found, name_opt);
  };

  assertNotSame = function assertNotSame(expected, found, name_opt) {
    // TODO(mstarzinger): We should think about using Harmony's egal operator
    // or the function equivalent Object.is() here.
    if (found !== expected) {
      if (expected === 0 || (1 / expected) !== (1 / found)) return;
    } else if (!((expected !== expected) && (found !== found))) {
      return;
    }
    fail(prettyPrinted(expected), found, name_opt);
  }

  assertEquals = function assertEquals(expected, found, name_opt) {
    if (!deepEquals(found, expected)) {
      fail(prettyPrinted(expected), found, name_opt);
    }
  };

  assertNotEquals = function assertNotEquals(expected, found, name_opt) {
    if (deepEquals(found, expected)) {
      fail("not equals to " + prettyPrinted(expected), found, name_opt);
    }
  };


  assertEqualsDelta =
      function assertEqualsDelta(expected, found, delta, name_opt) {
    if (Math.abs(expected - found) > delta) {
      fail(prettyPrinted(expected) + " +- " + prettyPrinted(delta), found, name_opt);
    }
  };


  assertArrayEquals = function assertArrayEquals(expected, found, name_opt) {
    var start = "";
    if (name_opt) {
      start = name_opt + " - ";
    }
    assertEquals(expected.length, found.length, start + "array length");
    if (expected.length === found.length) {
      for (var i = 0; i < expected.length; ++i) {
        assertEquals(expected[i], found[i],
                     start + "array element at index " + i);
      }
    }
  };


  assertPropertiesEqual = function assertPropertiesEqual(expected, found,
                                                         name_opt) {
    // Check properties only.
    if (!deepObjectEquals(expected, found)) {
      fail(expected, found, name_opt);
    }
  };


  assertToStringEquals = function assertToStringEquals(expected, found,
                                                       name_opt) {
    if (expected !== String(found)) {
      fail(expected, found, name_opt);
    }
  };


  assertTrue = function assertTrue(value, name_opt) {
    assertEquals(true, value, name_opt);
  };


  assertFalse = function assertFalse(value, name_opt) {
    assertEquals(false, value, name_opt);
  };


  assertNull = function assertNull(value, name_opt) {
    if (value !== null) {
      fail("null", value, name_opt);
    }
  };


  assertNotNull = function assertNotNull(value, name_opt) {
    if (value === null) {
      fail("not null", value, name_opt);
    }
  };


  assertThrows = function assertThrows(code, type_opt, cause_opt) {
    try {
      if (typeof code === 'function') {
        code();
      } else {
        eval(code);
      }
    } catch (e) {
      if (typeof type_opt === 'function') {
        assertInstanceof(e, type_opt);
      } else if (type_opt !== void 0) {
        failWithMessage(
            'invalid use of assertThrows, maybe you want assertThrowsEquals');
      }
      if (arguments.length >= 3) {
        if (cause_opt instanceof RegExp) {
          assertMatches(cause_opt, e.message, "Error message");
        } else {
          assertEquals(cause_opt, e.message, "Error message");
        }
      }
      // Success.
      return;
    }
    failWithMessage("Did not throw exception");
  };


  assertThrowsEquals = function assertThrowsEquals(fun, val) {
    try {
      fun();
    } catch(e) {
      assertSame(val, e);
      return;
    }
    failWithMessage("Did not throw exception");
  };


  assertInstanceof = function assertInstanceof(obj, type) {
    if (!(obj instanceof type)) {
      var actualTypeName = null;
      var actualConstructor = Object.getPrototypeOf(obj).constructor;
      if (typeof actualConstructor === "function") {
        actualTypeName = actualConstructor.name || String(actualConstructor);
      }
      failWithMessage("Object <" + prettyPrinted(obj) + "> is not an instance of <" +
               (type.name || type) + ">" +
               (actualTypeName ? " but of <" + actualTypeName + ">" : ""));
    }
  };


   assertDoesNotThrow = function assertDoesNotThrow(code, name_opt) {
    try {
      if (typeof code === 'function') {
        return code();
      } else {
        return eval(code);
      }
    } catch (e) {
      failWithMessage("threw an exception: " + (e.message || e));
    }
  };

  assertUnreachable = function assertUnreachable(name_opt) {
    // Fix this when we ditch the old test runner.
    var message = "Fail" + "ure: unreachable";
    if (name_opt) {
      message += " - " + name_opt;
    }
    failWithMessage(message);
  };

  assertContains = function(sub, value, name_opt) {
    if (value == null ? (sub != null) : value.indexOf(sub) == -1) {
      fail("contains '" + String(sub) + "'", value, name_opt);
    }
  };

  assertMatches = function(regexp, str, name_opt) {
    if (!(regexp instanceof RegExp)) {
      regexp = new RegExp(regexp);
    }
    if (!str.match(regexp)) {
      fail("should match '" + regexp + "'", str, name_opt);
    }
  };

  function concatenateErrors(stack, exception) {
    // If the exception does not contain a stack trace, wrap it in a new Error.
    if (!exception.stack) exception = new Error(exception);

    // If the exception already provides a special stack trace, we do not modify
    // it.
    if (typeof exception.stack !== 'string') {
      return exception;
    }
    exception.stack = stack + '\n\n' + exception.stack;
    return exception;
  }

  assertPromiseResult = function(promise, success, fail) {
    const stack = (new Error()).stack;

    var test_promise = promise.then(
        result => {
          try {
            if (--promiseTestCount == 0) {} 
            if (success) success(result);
          } catch (e) {
            // Use setTimeout to throw the error again to get out of the promise
            // chain.
            setTimeout(_ => {
              throw concatenateErrors(stack, e);
            }, 0);
          }
        },
        result => {
          try {
            if (--promiseTestCount == 0) {}
            if (!fail) throw result;
            fail(result);
          } catch (e) {
            // Use setTimeout to throw the error again to get out of the promise
            // chain.
            setTimeout(_ => {
              throw concatenateErrors(stack, e);
            }, 0);
          }
        });

    if (!promiseTestChain) promiseTestChain = Promise.resolve();
    // waitUntilDone is idempotent.
    ++promiseTestCount;
    return promiseTestChain.then(test_promise);
  };

  var OptimizationStatusImpl = undefined;

  var OptimizationStatus = function(fun, sync_opt) {
    if (OptimizationStatusImpl === undefined) {
      try {
        OptimizationStatusImpl = new Function(
            "fun", "sync", "return %GetOptimizationStatus(fun, sync);");
      } catch (e) {
        throw new Error("natives syntax not allowed");
      }
    }
    return OptimizationStatusImpl(fun, sync_opt);
  }

  assertUnoptimized = function assertUnoptimized(
      fun, sync_opt, name_opt, skip_if_maybe_deopted = true) {
    if (sync_opt === undefined) sync_opt = "";
    var opt_status = OptimizationStatus(fun, sync_opt);
    // Tests that use assertUnoptimized() do not make sense if --always-opt
    // option is provided. Such tests must add --no-always-opt to flags comment.
    assertFalse((opt_status & V8OptimizationStatus.kAlwaysOptimize) !== 0,
                "test does not make sense with --always-opt");
    assertTrue((opt_status & V8OptimizationStatus.kIsFunction) !== 0, name_opt);
    if (skip_if_maybe_deopted &&
        (opt_status & V8OptimizationStatus.kMaybeDeopted) !== 0) {
      // When --deopt-every-n-times flag is specified it's no longer guaranteed
      // that particular function is still deoptimized, so keep running the test
      // to stress test the deoptimizer.
      return;
    }
    assertFalse((opt_status & V8OptimizationStatus.kOptimized) !== 0, name_opt);
  }

  assertOptimized = function assertOptimized(
      fun, sync_opt, name_opt, skip_if_maybe_deopted = true) {
    if (sync_opt === undefined) sync_opt = "";
    var opt_status = OptimizationStatus(fun, sync_opt);
    // Tests that use assertOptimized() do not make sense for Lite mode where
    // optimization is always disabled, explicitly exit the test with a warning.
    if (opt_status & V8OptimizationStatus.kLiteMode) {
      print("Warning: Test uses assertOptimized in Lite mode, skipping test.");
      quit(0);
    }
    // Tests that use assertOptimized() do not make sense if --no-opt
    // option is provided. Such tests must add --opt to flags comment.
    assertFalse((opt_status & V8OptimizationStatus.kNeverOptimize) !== 0,
                "test does not make sense with --no-opt");
    assertTrue((opt_status & V8OptimizationStatus.kIsFunction) !== 0, name_opt);
    if (skip_if_maybe_deopted &&
        (opt_status & V8OptimizationStatus.kMaybeDeopted) !== 0) {
      // When --deopt-every-n-times flag is specified it's no longer guaranteed
      // that particular function is still optimized, so keep running the test
      // to stress test the deoptimizer.
      return;
    }
    assertTrue((opt_status & V8OptimizationStatus.kOptimized) !== 0, name_opt);
  }

  isNeverOptimizeLiteMode = function isNeverOptimizeLiteMode() {
    var opt_status = OptimizationStatus(undefined, "");
    return (opt_status & V8OptimizationStatus.kLiteMode) !== 0;
  }

  isNeverOptimize = function isNeverOptimize() {
    var opt_status = OptimizationStatus(undefined, "");
    return (opt_status & V8OptimizationStatus.kNeverOptimize) !== 0;
  }

  isAlwaysOptimize = function isAlwaysOptimize() {
    var opt_status = OptimizationStatus(undefined, "");
    return (opt_status & V8OptimizationStatus.kAlwaysOptimize) !== 0;
  }

  isInterpreted = function isInterpreted(fun) {
    var opt_status = OptimizationStatus(fun, "");
    assertTrue((opt_status & V8OptimizationStatus.kIsFunction) !== 0,
               "not a function");
    return (opt_status & V8OptimizationStatus.kOptimized) === 0 &&
           (opt_status & V8OptimizationStatus.kInterpreted) !== 0;
  }

  isOptimized = function isOptimized(fun) {
    var opt_status = OptimizationStatus(fun, "");
    assertTrue((opt_status & V8OptimizationStatus.kIsFunction) !== 0,
               "not a function");
    return (opt_status & V8OptimizationStatus.kOptimized) !== 0;
  }

  isTurboFanned = function isTurboFanned(fun) {
    var opt_status = OptimizationStatus(fun, "");
    assertTrue((opt_status & V8OptimizationStatus.kIsFunction) !== 0,
               "not a function");
    return (opt_status & V8OptimizationStatus.kOptimized) !== 0 &&
           (opt_status & V8OptimizationStatus.kTurboFanned) !== 0;
  }

  // Custom V8-specific stack trace formatter that is temporarily installed on
  // the Error object.
  MjsUnitAssertionError.prepareStackTrace = function(error, stack) {
    // Trigger default formatting with recursion.
    try {
      // Filter-out all but the first mjsunit frame.
      let filteredStack = [];
      let inMjsunit = true;
      for (let i = 0; i < stack.length; i++) {
        let frame = stack[i];
        if (inMjsunit) {
          let file = frame.getFileName();
          if (!file || !file.endsWith("mjsunit.js")) {
            inMjsunit = false;
            // Push the last mjsunit frame, typically containing the assertion
            // function.
            if (i > 0) ArrayPrototypePush.call(filteredStack, stack[i-1]);
            ArrayPrototypePush.call(filteredStack, stack[i]);
          }
          continue;
        }
        ArrayPrototypePush.call(filteredStack, frame);
      }
      stack = filteredStack;

      // Infer function names and calculate {max_name_length}
      let max_name_length = 0;
      ArrayPrototypeForEach.call(stack, each => {
        let name = each.getFunctionName();
        if (name == null) name = "";
        if (each.isEval()) {
          name = name;
        } else if (each.isConstructor()) {
          name = "new " + name;
        } else if (each.isNative()) {
          name = "native " + name;
        } else if (!each.isToplevel()) {
          name = each.getTypeName() + "." + name;
        }
        each.name = name;
        max_name_length = Math.max(name.length, max_name_length)
      });

      // Format stack frames.
      stack = ArrayPrototypeMap.call(stack, each => {
        let frame = "    at " + each.name.padEnd(max_name_length);
        let fileName = each.getFileName();
        if (each.isEval()) return frame + " " + each.getEvalOrigin();
        frame += " " + (fileName ? fileName : "");
        let line= each.getLineNumber();
        frame += " " + (line ? line : "");
        let column = each.getColumnNumber();
        frame += (column ? ":" + column : "");
        return frame;
      });
      return "" + error.message + "\n" + ArrayPrototypeJoin.call(stack, "\n");
    } catch(e) {};
    return error.stack;
  }
})();


function f() { return []; }
function f0() { return true; }
function f1() { return 0.0; }
function f2(v) { return v; }
let TestCoverage;
let TestCoverageNoGC;

let nop;
let gen;

!function() {
  function GetCoverage(source) {
    return undefined;
  };

  function TestCoverageInternal(name, source, expectation, collect_garbage) {
    source = source.trim();
    eval(source);
    var covfefe = GetCoverage(source);
    var stringified_result = JSON.stringify(covfefe);
    var stringified_expectation = JSON.stringify(expectation);
    if (stringified_result != stringified_expectation) {
      print(stringified_result.replace(/[}],[{]/g, "},\n {"));
    }
    assertEquals(stringified_expectation, stringified_result, name + " failed");
  };

  TestCoverage = function(name, source, expectation) {
    TestCoverageInternal(name, source, expectation, true);
  };

  TestCoverageNoGC = function(name, source, expectation) {
    TestCoverageInternal(name, source, expectation, false);
  };

  nop = function() {};

  gen = function*() {
    yield 1;
    yield 2;
    yield 3;
  };
}();

function isOneByteString(s) {
  return s[0];
}



const regexp = "/\P{Lu}/ui";
const regexpu = "/[\0-@\[-\xBF\xD7\xDF-\xFF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9-\u01BB\u01BD-\u01C3\u01C5\u01C6\u01C8\u01C9\u01CB\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F2\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u036F\u0371\u0373-\u0375\u0377-\u037E\u0380-\u0385\u0387\u038B\u038D\u0390\u03A2\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F6\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481-\u0489\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0530\u0557-\u109F\u10C6\u10C8-\u10CC\u10CE-\u139F\u13F6-\u1DFF\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F17\u1F1E-\u1F27\u1F30-\u1F37\u1F40-\u1F47\u1F4E-\u1F58\u1F5A\u1F5C\u1F5E\u1F60-\u1F67\u1F70-\u1FB7\u1FBC-\u1FC7\u1FCC-\u1FD7\u1FDC-\u1FE7\u1FED-\u1FF7\u1FFC-\u2101\u2103-\u2106\u2108-\u210A\u210E\u210F\u2113\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u212F\u2134-\u213D\u2140-\u2144\u2146-\u2182\u2184-\u2BFF\u2C2F-\u2C5F\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7D\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3-\u2CEA\u2CEC\u2CEE-\u2CF1\u2CF3-\uA63F\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D-\uA67F\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B-\uA721\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787-\uA78A\uA78C\uA78E\uA78F\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7AE\uA7AF\uA7B5\uA7B7-\uFF20\uFF3B-\u{103FF}\u{10428}-\u{10C7F}\u{10CB3}-\u{1189F}\u{118C0}-\u{1D3FF}\u{1D41A}-\u{1D433}\u{1D44E}-\u{1D467}\u{1D482}-\u{1D49B}\u{1D49D}\u{1D4A0}\u{1D4A1}\u{1D4A3}\u{1D4A4}\u{1D4A7}\u{1D4A8}\u{1D4AD}\u{1D4B6}-\u{1D4CF}\u{1D4EA}-\u{1D503}\u{1D506}\u{1D50B}\u{1D50C}\u{1D515}\u{1D51D}-\u{1D537}\u{1D53A}\u{1D53F}\u{1D545}\u{1D547}-\u{1D549}\u{1D551}-\u{1D56B}\u{1D586}-\u{1D59F}\u{1D5BA}-\u{1D5D3}\u{1D5EE}-\u{1D607}\u{1D622}-\u{1D63B}\u{1D656}-\u{1D66F}\u{1D68A}-\u{1D6A7}\u{1D6C1}-\u{1D6E1}\u{1D6FB}-\u{1D71B}\u{1D735}-\u{1D755}\u{1D76F}-\u{1D78F}\u{1D7A9}-\u{1D7C9}\u{1D7CB}-\u{10FFFF}]/ui";

// Test is split into parts to increase parallelism.
const number_of_tests = 10;
const max_codepoint = 0x10FFFF;

function firstCodePointOfRange(i) {
  return Math.floor(i * (max_codepoint / number_of_tests));
}

function testCodePointRange(i) {
  assertTrue(i >= 0 && i < number_of_tests);

  const from = firstCodePointOfRange(i);
  const to = (i == number_of_tests - 1)
      ? max_codepoint + 1 : firstCodePointOfRange(i + 1);

  for (let codePoint = from; codePoint < to; codePoint++) {
    const string = String.fromCodePoint(codePoint);
    assertEquals(regexp.test(string), regexpu.test(string));
  }
}
if (gc == undefined ) {
  function gc() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
  }
}
if (BigInt == undefined)
  function BigInt(v) { return new Number(v); }
if (BigInt64Array == undefined) 
  function BigInt64Array(v) { return new Array(v); }
if (BigUint64Array == undefined) 
  function BigUint64Array(v) { return new Array(v); }

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

// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --allow-natives-syntax --no-always-turbofan --no-stress-flush-code
// Flags: --expose-gc
// Files: test/mjsunit/code-coverage-utils.js

(async function () {

  %DebugToggleBlockCoverage(true);

  await TestCoverage(
    "call an IIFE",
    `
(function f() {})();
    `,
    [ {"start":0,"end":20,"count":1},
      {"start":1,"end":16,"count":1} ]
  );

  await TestCoverage(
    "call locally allocated function",
    `
let f = () => 1; f();
    `,
    [ {"start":0,"end":21,"count":1},
      {"start":8,"end":15,"count":1} ]
  );

  await TestCoverage(
    "if statements",
    `
function g() {}                           // 0000
function f(x) {                           // 0050
  if (x == 42) {                          // 0100
    if (x == 43) g(); else g();           // 0150
  }                                       // 0200
  if (x == 42) { g(); } else { g(); }     // 0250
  if (x == 42) g(); else g();             // 0300
  if (false) g(); else g();               // 0350
  if (false) g();                         // 0400
  if (true) g(); else g();                // 0450
  if (true) g();                          // 0500
}                                         // 0550
f(42);                                    // 0600
f(43);                                    // 0650
if (true) {                               // 0700
  const foo = 'bar';                      // 0750
} else {                                  // 0800
  const bar = 'foo';                      // 0850
}                                         // 0900
    `,
    [ {"start":0,"end":949,"count":1},
      {"start":801,"end":901,"count":0},
      {"start":0,"end":15,"count":11},
      {"start":50,"end":551,"count":2},
      {"start":115,"end":203,"count":1},
      {"start":167,"end":171,"count":0},
      {"start":265,"end":287,"count":1},
      {"start":315,"end":329,"count":1},
      {"start":363,"end":367,"count":0},
      {"start":413,"end":417,"count":0},
      {"start":466,"end":476,"count":0} ]
  );

  await TestCoverage(
    "if statement (early return)",
    `
!function() {                             // 0000
  if (true) {                             // 0050
    nop();                                // 0100
    return;                               // 0150
    nop();                                // 0200
  }                                       // 0250
  nop();                                  // 0300
}()                                       // 0350
    `,
    [ {"start":0,"end":399,"count":1},
      {"start":1,"end":351,"count":1},
      {"start":161,"end":350,"count":0} ]
  );

  await TestCoverage(
    "if statement (no semi-colon)",
    `
!function() {                             // 0000
  if (true) nop()                         // 0050
  if (true) nop(); else nop()             // 0100
  nop();                                  // 0150
}()                                       // 0200
    `,
    [ {"start":0,"end":249,"count":1},
      {"start":1,"end":201,"count":1},
      {"start":118,"end":129,"count":0} ]
  );

  await TestCoverage(
    "for statements",
    `
function g() {}                           // 0000
!function() {                             // 0050
  for (var i = 0; i < 12; i++) g();       // 0100
  for (var i = 0; i < 12; i++) {          // 0150
    g();                                  // 0200
  }                                       // 0250
  for (var i = 0; false; i++) g();        // 0300
  for (var i = 0; true; i++) break;       // 0350
  for (var i = 0; i < 12; i++) {          // 0400
    if (i % 3 == 0) g(); else g();        // 0450
  }                                       // 0500
}();                                      // 0550
    `,
    [ {"start":0,"end":599,"count":1},
      {"start":0,"end":15,"count":36},
      {"start":51,"end":551,"count":1},
      {"start":131,"end":135,"count":12},
      {"start":181,"end":253,"count":12},
      {"start":330,"end":334,"count":0},
      {"start":431,"end":503,"count":12},
      {"start":470,"end":474,"count":4},
      {"start":474,"end":484,"count":8} ]
  );

  await TestCoverage(
    "for statements pt. 2",
    `
function g() {}                           // 0000
!function() {                             // 0050
  let j = 0;                              // 0100
  for (let i = 0; i < 12; i++) g();       // 0150
  for (const i = 0; j < 12; j++) g();     // 0200
  for (j = 0; j < 12; j++) g();           // 0250
  for (;;) break;                         // 0300
}();                                      // 0350
    `,
    [ {"start":0,"end":399,"count":1},
      {"start":0,"end":15,"count":36},
      {"start":51,"end":351,"count":1},
      {"start":181,"end":185,"count":12},
      {"start":233,"end":237,"count":12},
      {"start":277,"end":281,"count":12} ]
  );

  await TestCoverage(
    "for statements (no semicolon)",
    `
function g() {}                           // 0000
!function() {                             // 0050
  for (let i = 0; i < 12; i++) g()        // 0100
  for (let i = 0; i < 12; i++) break      // 0150
  for (let i = 0; i < 12; i++) break; g() // 0200
}();                                      // 0250
    `,
    [ {"start":0,"end":299,"count":1},
      {"start":0,"end":15,"count":13},
      {"start":51,"end":251,"count":1},
      {"start":131,"end":134,"count":12} ]
  );

  await TestCoverage(
    "for statement (early return)",
    `
!function() {                             // 0000
  for (var i = 0; i < 10; i++) {          // 0050
    nop();                                // 0100
    continue;                             // 0150
    nop();                                // 0200
  }                                       // 0250
  nop();                                  // 0300
  for (;;) {                              // 0350
    nop();                                // 0400
    break;                                // 0450
    nop();                                // 0500
  }                                       // 0550
  nop();                                  // 0600
  for (;;) {                              // 0650
    nop();                                // 0700
    return;                               // 0750
    nop();                                // 0800
  }                                       // 0850
  nop();                                  // 0900
}()                                       // 0950
    `,
    [ {"start":0,"end":999,"count":1},
      {"start":1,"end":951,"count":1},
      {"start":81,"end":253,"count":10},
      {"start":163,"end":253,"count":0},
      {"start":460,"end":553,"count":0},
      {"start":761,"end":950,"count":0} ]
  );

  await TestCoverage(
    "for-of and for-in statements",
    `
!function() {                             // 0000
  var i;                                  // 0050
  for (i of [0,1,2,3]) { nop(); }         // 0100
  for (let j of [0,1,2,3]) { nop(); }     // 0150
  for (i in [0,1,2,3]) { nop(); }         // 0200
  for (let j in [0,1,2,3]) { nop(); }     // 0250
  var xs = [{a:0, b:1}, {a:1,b:0}];       // 0300
  for (var {a: x, b: y} of xs) { nop(); } // 0350
}();                                      // 0400
    `,
    [ {"start":0,"end":449,"count":1},
      {"start":1,"end":401,"count":1},
      {"start":123,"end":133,"count":4},
      {"start":177,"end":187,"count":4},
      {"start":223,"end":233,"count":4},
      {"start":277,"end":287,"count":4},
      {"start":381,"end":391,"count":2} ]
  );

  await TestCoverage(
    "while and do-while statements",
    `
function g() {}                           // 0000
!function() {                             // 0050
  var i;                                  // 0100
  i = 0; while (i < 12) i++;              // 0150
  i = 0; while (i < 12) { g(); i++; }     // 0200
  i = 0; while (false) g();               // 0250
  i = 0; while (true) break;              // 0300
                                          // 0350
  i = 0; do i++; while (i < 12);          // 0400
  i = 0; do { g(); i++; }                 // 0450
         while (i < 12);                  // 0500
  i = 0; do { g(); } while (false);       // 0550
  i = 0; do { break; } while (true);      // 0600
}();                                      // 0650
    `,
    [ {"start":0,"end":699,"count":1},
      {"start":0,"end":15,"count":25},
      {"start":51,"end":651,"count":1},
      {"start":174,"end":178,"count":12},
      {"start":224,"end":237,"count":12},
      {"start":273,"end":277,"count":0},
      {"start":412,"end":416,"count":12},
      {"start":462,"end":475,"count":12} ]
  );

  await TestCoverage(
    "while statement (early return)",
    `
!function() {                             // 0000
  let i = 0;                              // 0050
  while (i < 10) {                        // 0100
    i++;                                  // 0150
    continue;                             // 0200
    nop();                                // 0250
  }                                       // 0300
  nop();                                  // 0350
  while (true) {                          // 0400
    nop();                                // 0450
    break;                                // 0500
    nop();                                // 0550
  }                                       // 0600
  nop();                                  // 0650
  while (true) {                          // 0700
    nop();                                // 0750
    return;                               // 0800
    nop();                                // 0850
  }                                       // 0900
  nop();                                  // 0950
}()                                       // 1000
    `,
    [ {"start":0,"end":1049,"count":1},
      {"start":1,"end":1001,"count":1},
      {"start":117,"end":303,"count":10},
      {"start":213,"end":303,"count":0},
      {"start":510,"end":603,"count":0},
      {"start":811,"end":1000,"count":0} ]
  );

  await TestCoverage(
    "do-while statement (early return)",
    `
!function() {                             // 0000
  let i = 0;                              // 0050
  do {                                    // 0100
    i++;                                  // 0150
    continue;                             // 0200
    nop();                                // 0250
  } while (i < 10);                       // 0300
  nop();                                  // 0350
  do {                                    // 0400
    nop();                                // 0450
    break;                                // 0500
    nop();                                // 0550
  } while (true);                         // 0600
  nop();                                  // 0650
  do {                                    // 0700
    nop();                                // 0750
    return;                               // 0800
    nop();                                // 0850
  } while (true);                         // 0900
  nop();                                  // 0950
}()                                       // 1000
    `,
    [ {"start":0,"end":1049,"count":1},
      {"start":1,"end":1001,"count":1},
      {"start":105,"end":303,"count":10},
      {"start":213,"end":303,"count":0},
      {"start":510,"end":603,"count":0},
      {"start":811,"end":1000,"count":0} ]
  );

  await TestCoverage(
    "return statements",
    `
!function() { nop(); return; nop(); }();  // 0000
!function() { nop(); return 42;           // 0050
              nop(); }();                 // 0100
    `,
    [ {"start":0,"end":149,"count":1},
      {"start":1,"end":37,"count":1},
      {"start":28,"end":36,"count":0},
      {"start":51,"end":122,"count":1},
      {"start":81,"end":121,"count":0} ]
  );

  await TestCoverage(
    "try/catch/finally statements",
    `
!function() {                             // 0000
  try { nop(); } catch (e) { nop(); }     // 0050
  try { nop(); } finally { nop(); }       // 0100
  try {                                   // 0150
    try { throw 42; } catch (e) { nop(); }// 0200
  } catch (e) { nop(); }                  // 0250
  try {                                   // 0300
    try { throw 42; } finally { nop(); }  // 0350
  } catch (e) { nop(); }                  // 0400
  try {                                   // 0450
    throw 42;                             // 0500
  } catch (e) {                           // 0550
    nop();                                // 0600
  } finally {                             // 0650
    nop();                                // 0700
  }                                       // 0750
}();                                      // 0800
    `,
    [ {"start":0,"end":849,"count":1},
      {"start":1,"end":801,"count":1},
      {"start":67,"end":87,"count":0},
      {"start":254,"end":274,"count":0} ]
  );

  await TestCoverage(
    "try/catch/finally statements with early return",
    `
!function() {                             // 0000
  try { throw 42; } catch (e) { return; } // 0050
  nop();                                  // 0100
}();                                      // 0150
!function() {                             // 0200
  try { throw 42; } catch (e) {}          // 0250
  finally { return; }                     // 0300
  nop();                                  // 0350
}();                                      // 0400
    `,
    [ {"start":0,"end":449,"count":1},
      {"start":1,"end":151,"count":1},
      {"start":91,"end":150,"count":0},
      {"start":201,"end":401,"count":1},
      {"start":321,"end":400,"count":0} ]
  );

  await TestCoverage(
    "early return in blocks",
    `
!function() {                             // 0000
  try { throw 42; } catch (e) { return; } // 0050
  nop();                                  // 0100
}();                                      // 0150
!function() {                             // 0200
  try { nop(); } finally { return; }      // 0250
  nop();                                  // 0300
}();                                      // 0350
!function() {                             // 0400
  {                                       // 0450
    let x = 42;                           // 0500
    return () => x;                       // 0550
  }                                       // 0600
  nop();                                  // 0650
}();                                      // 0700
!function() {                             // 0750
  try { throw 42; } catch (e) {           // 0800
    return;                               // 0850
    nop();                                // 0900
  }                                       // 0950
  nop();                                  // 1000
}();                                      // 1050
    `,
    [ {"start":0,"end":1099,"count":1},
      {"start":1,"end":151,"count":1},
      {"start":91,"end":150,"count":0},
      {"start":201,"end":351,"count":1},
      {"start":286,"end":350,"count":0},
      {"start":401,"end":701,"count":1},
      {"start":603,"end":700,"count":0},
      {"start":561,"end":568,"count":0},
      {"start":751,"end":1051,"count":1},
      {"start":861,"end":1050,"count":0} ]
  );

  await TestCoverage(
    "switch statements",
    `
!function() {                             // 0000
  var x = 42;                             // 0050
  switch (x) {                            // 0100
    case 41: nop(); break;                // 0150
    case 42: nop(); break;                // 0200
    default: nop(); break;                // 0250
  }                                       // 0300
}();                                      // 0350
    `,
    [ {"start":0,"end":399,"count":1},
      {"start":1,"end":351,"count":1},
      {"start":154,"end":176,"count":0},
      {"start":254,"end":276,"count":0} ]
  );

  await TestCoverage(
    "labeled break statements",
    `
!function() {                             // 0000
  var x = 42;                             // 0050
  l0: switch (x) {                        // 0100
  case 41: return;                        // 0150
  case 42:                                // 0200
    switch (x) { case 42: break l0; }     // 0250
    break;                                // 0300
  }                                       // 0350
  l1: for (;;) {                          // 0400
    for (;;) break l1;                    // 0450
  }                                       // 0500
  l2: while (true) {                      // 0550
    while (true) break l2;                // 0600
  }                                       // 0650
  l3: do {                                // 0700
    do { break l3; } while (true);        // 0750
  } while (true);                         // 0800
  l4: { break l4; }                       // 0850
  l5: for (;;) for (;;) break l5;         // 0900
}();                                      // 0950
    `,
    [ {"start":0,"end":999,"count":1},
      {"start":1,"end":951,"count":1},
      {"start":152,"end":168,"count":0},
      {"start":287,"end":310,"count":0} ]
  );

  await TestCoverage(
    "labeled continue statements",
    `
!function() {                             // 0000
  l0: for (var i0 = 0; i0 < 2; i0++) {    // 0050
    for (;;) continue l0;                 // 0100
  }                                       // 0150
  var i1 = 0;                             // 0200
  l1: while (i1 < 2) {                    // 0250
    i1++;                                 // 0300
    while (true) continue l1;             // 0350
  }                                       // 0400
  var i2 = 0;                             // 0450
  l2: do {                                // 0500
    i2++;                                 // 0550
    do { continue l2; } while (true);     // 0600
  } while (i2 < 2);                       // 0650
}();                                      // 0700
    `,
    [ {"start":0,"end":749,"count":1},
      {"start":1,"end":701,"count":1},
      {"start":87,"end":153,"count":2},
      {"start":271,"end":403,"count":2},
      {"start":509,"end":653,"count":2} ]
  );

  await TestCoverage(
    "conditional expressions",
    `
var TRUE = true;                          // 0000
var FALSE = false;                        // 0050
!function() {                             // 0100
  TRUE ? nop() : nop();                   // 0150
  true ? nop() : nop();                   // 0200
  false ? nop() : nop();                  // 0250
  FALSE ? TRUE ? nop()                    // 0300
               : nop()                    // 0350
        : nop();                          // 0400
  TRUE ? FALSE ? nop()                    // 0450
               : nop()                    // 0500
       : nop();                           // 0550
  TRUE ? nop() : FALSE ? nop()            // 0600
                       : nop();           // 0650
  FALSE ? nop() : TRUE ? nop()            // 0700
                       : nop();           // 0750
}();                                      // 0800
    `,
    [ {"start":0,"end":849,"count":1},
      {"start":101,"end":801,"count":1},
      {"start":165,"end":172,"count":0},
      {"start":215,"end":222,"count":0},
      {"start":258,"end":265,"count":0},
      {"start":308,"end":372,"count":0},
      {"start":465,"end":472,"count":0},
      {"start":557,"end":564,"count":0},
      {"start":615,"end":680,"count":0},
      {"start":708,"end":715,"count":0},
      {"start":773,"end":780,"count":0} ]
  );

  await TestCoverage(
    "yield expressions",
    `
const it = function*() {                  // 0000
  yield nop();                            // 0050
  yield nop() ? nop() : nop()             // 0100
  return nop();                           // 0150
}();                                      // 0200
it.next(); it.next();                     // 0250
    `,
    [ {"start":0,"end":299,"count":1},
      {"start":11,"end":201,"count":1},
      {"start":114,"end":121,"count":0},
      {"start":129,"end":200,"count":0} ]
  );

  await TestCoverage(
    "yield expressions twice",
    `
function* gen() {                         // 0000
  yield nop();                            // 0050
  yield nop() ? nop() : nop()             // 0100
  return nop();                           // 0150
};                                        // 0200
{const it = gen(); it.next(); it.next();} // 0250
{const it = gen(); it.next(); it.next();} // 0300
    `,
    [ {"start":0,"end":349,"count":1},
      {"start":0,"end":201,"count":2},
      {"start":114,"end":121,"count":0},
      {"start":129,"end":200,"count":0} ]
  );

  await TestCoverage(
    "yield expressions (.return and .throw)",
    `
const it0 = function*() {                 // 0000
  yield 1; yield 2; yield 3;              // 0050
}();                                      // 0100
it0.next(); it0.return();                 // 0150
try {                                     // 0200
  const it1 = function*() {               // 0250
    yield 1; yield 2; yield 3;            // 0300
  }();                                    // 0350
  it1.next(); it1.throw();                // 0400
} catch (e) {}                            // 0450
    `,
    [ {"start":0,"end":499,"count":1},
      {"start":12,"end":101,"count":1},
      {"start":60,"end":100,"count":0},
      {"start":264,"end":353,"count":1},
      {"start":312,"end":352,"count":0} ]
  );

  await TestCoverage(
    "yield expressions (.return and try/catch/finally)",
    `
const it = function*() {                  // 0000
  try {                                   // 0050
    yield 1; yield 2; yield 3;            // 0100
  } catch (e) {                           // 0150
    nop();                                // 0200
  } finally { nop(); }                    // 0250
  yield 4;                                // 0300
}();                                      // 0350
it.next(); it.return();                   // 0450
    `,
    [ {"start":0,"end":449,"count":1},
      {"start":11,"end":351,"count":1},
      {"start":112,"end":254,"count":0},
      {"start":272,"end":350,"count":0} ]
  );

  await TestCoverage(
    "yield expressions (.throw and try/catch/finally)",
    `
const it = function*() {                  // 0000
  try {                                   // 0050
    yield 1; yield 2; yield 3;            // 0100
  } catch (e) {                           // 0150
    nop();                                // 0200
  } finally { nop(); }                    // 0250
  yield 4;                                // 0300
}();                                      // 0350
it.next(); it.throw(42);                  // 0550
    `,
    [ {"start":0,"end":449,"count":1},
      {"start":11,"end":351,"count":1},
      {"start":112,"end":154,"count":0},
      {"start":310,"end":350,"count":0} ]
  );

  await TestCoverage(
    "yield* expressions",
    `
const it = function*() {                  // 0000
  yield* gen();                           // 0050
  yield* nop() ? gen() : gen()            // 0100
  return gen();                           // 0150
}();                                      // 0200
it.next(); it.next(); it.next();          // 0250
it.next(); it.next(); it.next();          // 0300
    `,
    [ {"start":0,"end":349,"count":1},
      {"start":11,"end":201,"count":1},
      {"start":115,"end":122,"count":0},
      {"start":130,"end":200,"count":0} ]
  );

  await TestCoverage(
    "yield* expressions (.return and .throw)",
    `
const it0 = function*() {                 // 0000
  yield* gen(); yield* gen(); yield 3;    // 0050
}();                                      // 0100
it0.next(); it0.return();                 // 0150
try {                                     // 0200
  const it1 = function*() {               // 0250
    yield* gen(); yield* gen(); yield 3;  // 0300
  }();                                    // 0350
  it1.next(); it1.throw();                // 0400
} catch (e) {}                            // 0450
    `,
    [ {"start":0,"end":499,"count":1},
      {"start":12,"end":101,"count":1},
      {"start":65,"end":100,"count":0},
      {"start":264,"end":353,"count":1},
      {"start":317,"end":352,"count":0} ]
  );

  await TestCoverage(
    "LogicalOrExpression assignment",
    `
const a = true || 99                      // 0000
function b () {                           // 0050
  const b = a || 2                        // 0100
}                                         // 0150
b()                                       // 0200
b()                                       // 0250
    `,
    [ {"start":0,"end":299,"count":1},
      {"start":15,"end":20,"count":0},
      {"start":50,"end":151,"count":2},
      {"start":114,"end":118,"count":0} ]
  );

  await TestCoverage(
    "LogicalOrExpression IsTest()",
    `
true || false                             // 0000
const a = 99                              // 0050
a || 50                                   // 0100
const b = false                           // 0150
if (b || true) {}                         // 0200
    `,
    [ {"start":0,"end":249,"count":1},
      {"start":5,"end":13,"count":0},
      {"start":102,"end":107,"count":0} ]
  );

  await TestCoverage(
    "LogicalAndExpression assignment",
    `
const a = false && 99                     // 0000
function b () {                           // 0050
  const b = a && 2                        // 0100
}                                         // 0150
b()                                       // 0200
b()                                       // 0250
const c = true && 50                      // 0300
    `,
    [ {"start":0,"end":349,"count":1},
      {"start":16,"end":21,"count":0},
      {"start":50,"end":151,"count":2},
      {"start":114,"end":118,"count":0} ]
  );

  await TestCoverage(
    "LogicalAndExpression IsTest()",
    `
false && true                             // 0000
const a = 0                               // 0050
a && 50                                   // 0100
const b = true                            // 0150
if (b && true) {}                         // 0200
true && true                              // 0250
    `,
    [ {"start":0,"end":299,"count":1},
      {"start":6,"end":13,"count":0},
      {"start":102,"end":107,"count":0} ]
  );

  await TestCoverage(
    "NaryLogicalOr assignment",
    `
const a = true                            // 0000
const b = false                           // 0050
const c = false || false || 99            // 0100
const d = false || true || 99             // 0150
const e = true || true || 99              // 0200
const f = b || b || 99                    // 0250
const g = b || a || 99                    // 0300
const h = a || a || 99                    // 0350
const i = a || (b || c) || d              // 0400
    `,
    [ {"start":0,"end":449,"count":1},
      {"start":174,"end":179,"count":0},
      {"start":215,"end":222,"count":0},
      {"start":223,"end":228,"count":0},
      {"start":317,"end":322,"count":0},
      {"start":362,"end":366,"count":0},
      {"start":367,"end":372,"count":0},
      {"start":412,"end":423,"count":0},
      {"start":424,"end":428,"count":0} ]
  );

  await TestCoverage(
    "NaryLogicalOr IsTest()",
    `
const a = true                            // 0000
const b = false                           // 0050
false || false || 99                      // 0100
false || true || 99                       // 0150
true || true || 99                        // 0200
b || b || 99                              // 0250
b || a || 99                              // 0300
a || a || 99                              // 0350
    `,
    [ {"start":0,"end":399,"count":1},
      {"start":164,"end":169,"count":0},
      {"start":205,"end":212,"count":0},
      {"start":213,"end":218,"count":0},
      {"start":307,"end":312,"count":0},
      {"start":352,"end":356,"count":0},
      {"start":357,"end":362,"count":0} ]
  );

  await TestCoverage(
    "NaryLogicalAnd assignment",
    `
const a = true                            // 0000
const b = false                           // 0050
const c = false && false && 99            // 0100
const d = false && true && 99             // 0150
const e = true && true && 99              // 0200
const f = true && false || true           // 0250
const g = true || false && true           // 0300
    `,
    [ {"start":0,"end":349,"count":1},
      {"start":116,"end":124,"count":0},
      {"start":125,"end":130,"count":0},
      {"start":166,"end":173,"count":0},
      {"start":174,"end":179,"count":0},
      {"start":315,"end":331,"count":0}
  ]);

  await TestCoverage(
    "NaryLogicalAnd IsTest()",
    `
const a = true                            // 0000
const b = false                           // 0050
false && false && 99                      // 0100
false && true && 99                       // 0150
true && true && 99                        // 0200
true && false || true                     // 0250
true || false && true                     // 0300
false || false || 99 || 55                // 0350
    `,
    [ {"start":0,"end":399,"count":1},
      {"start":106,"end":114,"count":0},
      {"start":115,"end":120,"count":0},
      {"start":156,"end":163,"count":0},
      {"start":164,"end":169,"count":0},
      {"start":305,"end":321,"count":0},
      {"start":371,"end":376,"count":0} ]
  );

  // see regression: https://crbug.com/785778
  await TestCoverage(
    "logical expressions + conditional expressions",
    `
const a = true                            // 0000
const b = 99                              // 0050
const c = false                           // 0100
const d = ''                              // 0150
const e = a && (b ? 'left' : 'right')     // 0200
const f = a || (b ? 'left' : 'right')     // 0250
const g = c || d ? 'left' : 'right'       // 0300
const h = a && b && (b ? 'left' : 'right')// 0350
const i = d || c || (c ? 'left' : 'right')// 0400
    `,
    [ {"start":0,"end":449,"count":1},
      {"start":227,"end":236,"count":0},
      {"start":262,"end":287,"count":0},
      {"start":317,"end":325,"count":0},
      {"start":382,"end":391,"count":0},
      {"start":423,"end":431,"count":0} ]
  );

  await TestCoverage(
    "https://crbug.com/827530",
    `
Util = {};                                // 0000
Util.escape = function UtilEscape(str) {  // 0050
  if (!str) {                             // 0100
    return 'if';                          // 0150
  } else {                                // 0200
    return 'else';                        // 0250
  }                                       // 0300
};                                        // 0350
Util.escape("foo.bar");                   // 0400
    `,
    [ {"start":0,"end":449,"count":1},
      {"start":64,"end":351,"count":1},
      {"start":112,"end":203,"count":0} ]
  );

  await TestCoverage(
    "https://crbug.com/v8/8237",
    `
!function() {                             // 0000
  if (true)                               // 0050
    while (false) return; else nop();     // 0100
}();                                      // 0150
!function() {                             // 0200
  if (true) l0: { break l0; } else        // 0250
    if (nop()) { }                        // 0300
}();                                      // 0350
!function() {                             // 0400
  if (true) { if (false) { return; }      // 0450
  } else if (nop()) { } }();              // 0500
!function(){                              // 0550
  if(true)while(false)return;else nop()   // 0600
}();                                      // 0650
!function(){                              // 0700
  if(true) l0:{break l0}else if (nop()){} // 0750
}();                                      // 0800
!function(){                              // 0850
  if(true){if(false){return}}else         // 0900
    if(nop()){}                           // 0950
}();                                      // 1000
    `,
    [ {"start":0,"end":1049,"count":1},
      {"start":1,"end":151,"count":1},
      {"start":118,"end":137,"count":0},
      {"start":201,"end":351,"count":1},
      {"start":279,"end":318,"count":0},
      {"start":401,"end":525,"count":1},
      {"start":475,"end":486,"count":0},
      {"start":503,"end":523,"count":0},
      {"start":551,"end":651,"count":1},
      {"start":622,"end":639,"count":0},
      {"start":701,"end":801,"count":1},
      {"start":774,"end":791,"count":0},
      {"start":851,"end":1001,"count":1},
      {"start":920,"end":928,"count":0},
      {"start":929,"end":965,"count":0} ]
  );

  await TestCoverage(
    "terminal break statement",
    `
while (true) {                            // 0000
  const b = false                         // 0050
  break                                   // 0100
}                                         // 0150
let stop = false                          // 0200
while (true) {                            // 0250
  if (stop) {                             // 0300
    break                                 // 0350
  }                                       // 0400
  stop = true                             // 0450
}                                         // 0500
    `,
    [ {"start":0,"end":549,"count":1},
      {"start":263,"end":501,"count":2},
      {"start":312,"end":501,"count":1} ]
  );

  await TestCoverage(
    "terminal return statement",
    `
function a () {                           // 0000
  const b = false                         // 0050
  return 1                                // 0100
}                                         // 0150
const b = (early) => {                    // 0200
  if (early) {                            // 0250
    return 2                              // 0300
  }                                       // 0350
  return 3                                // 0400
}                                         // 0450
const c = () => {                         // 0500
  if (true) {                             // 0550
    return                                // 0600
  }                                       // 0650
}                                         // 0700
a(); b(false); b(true); c()               // 0750
    `,
    [ {"start":0,"end":799,"count":1},
      {"start":0,"end":151,"count":1},
      {"start":210,"end":451,"count":2},
      {"start":263,"end":450,"count":1},
      {"start":510,"end":701,"count":1} ]
  );

  await TestCoverage(
    "terminal blocks",
    `
function a () {                           // 0000
  {                                       // 0050
    return 'a'                            // 0100
  }                                       // 0150
}                                         // 0200
function b () {                           // 0250
  {                                       // 0300
    {                                     // 0350
      return 'b'                          // 0400
    }                                     // 0450
  }                                       // 0500
}                                         // 0550
a(); b()                                  // 0600
    `,
    [ {"start":0,"end":649,"count":1},
      {"start":0,"end":201,"count":1},
      {"start":250,"end":551,"count":1} ]
  );

  await TestCoverage(
    "terminal if statements",
    `
function a (branch) {                     // 0000
  if (branch) {                           // 0050
    return 'a'                            // 0100
  } else {                                // 0150
    return 'b'                            // 0200
  }                                       // 0250
}                                         // 0300
function b (branch) {                     // 0350
  if (branch) {                           // 0400
    if (branch) {                         // 0450
      return 'c'                          // 0500
    }                                     // 0550
  }                                       // 0600
}                                         // 0650
function c (branch) {                     // 0700
  if (branch) {                           // 0750
    return 'c'                            // 0800
  } else {                                // 0850
    return 'd'                            // 0900
  }                                       // 0950
}                                         // 1000
function d (branch) {                     // 1050
  if (branch) {                           // 1100
    if (!branch) {                        // 1150
      return 'e'                          // 1200
    } else {                              // 1250
      return 'f'                          // 1300
    }                                     // 1350
  } else {                                // 1400
    // noop                               // 1450
  }                                       // 1500
}                                         // 1550
a(true); a(false); b(true); b(false)      // 1600
c(true); d(true);                         // 1650
    `,
    [ {"start":0,"end":1699,"count":1},
      {"start":0,"end":301,"count":2},
      {"start":64,"end":253,"count":1},
      {"start":350,"end":651,"count":2},
      {"start":414,"end":603,"count":1},
      {"start":700,"end":1001,"count":1},
      {"start":853,"end":953,"count":0},
      {"start":1050,"end":1551,"count":1},
      {"start":1167,"end":1255,"count":0},
      {"start":1403,"end":1503,"count":0} ]
  );

  await TestCoverage(
    "https://crbug.com/927464",
    `
!function f() {                           // 0000
  function unused() { nop(); }            // 0050
  nop();                                  // 0100
}();                                      // 0150
    `,
    [ {"start":0,"end":199,"count":1},
      {"start":1,"end":151,"count":1},
      {"start":52,"end":80,"count":0} ]
  );

  await TestCoverage(
    "https://crbug.com/v8/8691",
    `
function f(shouldThrow) {                 // 0000
  if (shouldThrow) {                      // 0050
    throw Error('threw')                  // 0100
  }                                       // 0150
}                                         // 0200
try {                                     // 0250
  f(true)                                 // 0300
} catch (err) {                           // 0350
                                          // 0400
}                                         // 0450
try {                                     // 0500
  f(false)                                // 0550
} catch (err) {}                          // 0600
    `,
    [ {"start":0,"end":649,"count":1},
      {"start":602,"end":616,"count":0},
      {"start":0,"end":201,"count":2},
      {"start":69,"end":153,"count":1} ]
  );

  await TestCoverage(
    "https://crbug.com/v8/9705",
    `
function f(x) {                           // 0000
  switch (x) {                            // 0050
    case 40: nop();                       // 0100
    case 41: nop(); return 1;             // 0150
    case 42: nop(); break;                // 0200
  }                                       // 0250
  return 3;                               // 0300
};                                        // 0350
f(40);                                    // 0400
f(41);                                    // 0450
f(42);                                    // 0500
f(43);                                    // 0550
    `,
    [ {"start":0,"end":599,"count":1},
      {"start":0,"end":351,"count":4},
      {"start":104,"end":119,"count":1},
      {"start":154,"end":179,"count":2},
      {"start":204,"end":226,"count":1},
      {"start":253,"end":350,"count":2} ]
  );

  await TestCoverage(
    "https://crbug.com/v8/9705",
    `
function f(x) {                           // 0000
  switch (x) {                            // 0050
    case 40: nop();                       // 0100
    case 41: nop(); return 1;             // 0150
    case 42: nop(); break;                // 0200
  }                                       // 0250
  return 3;                               // 0300
};                                        // 0350
f(42);                                    // 0400
f(43);                                    // 0450
    `,
    [ {"start":0,"end":499,"count":1},
      {"start":0,"end":351,"count":2},
      {"start":104,"end":119,"count":0},
      {"start":154,"end":179,"count":0},
      {"start":204,"end":226,"count":1} ]
  );

  await TestCoverage(
    "https://crbug.com/v8/9857",
    `function foo() {}`,
    [ {"start":0,"end":17,"count":1},
      {"start":0,"end":17,"count":0} ]
  );

  await TestCoverage(
    "https://crbug.com/v8/9857",
    `function foo() {function bar() {}}; foo()`,
    [ {"start":0,"end":41,"count":1},
      {"start":0,"end":34,"count":1},
      {"start":16,"end":33,"count":0} ]
  );

  await TestCoverage(
    "https://crbug.com/v8/9952",
    `
function test(foo = "foodef") {           // 0000
  return {bar};                           // 0050
                                          // 0100
  function bar() {                        // 0150
    console.log("test");                  // 0200
  }                                       // 0250
}                                         // 0300
test().bar();                             // 0350
    `,
    [ {"start":0,"end":399,"count":1},
      {"start":0,"end":301,"count":1},
      {"start":152,"end":253,"count":1} ]
  );

  await TestCoverage(
    "https://crbug.com/v8/9952",
    `
function test(foo = (()=>{})) {           // 0000
  return {foo};                           // 0050
}                                         // 0100
                                          // 0150
test(()=>{}).foo();                       // 0200
    `,
    [ {"start":0,"end":249,"count":1},
      {"start":0,"end":101,"count":1},
      {"start":21,"end":27,"count":0},
      {"start":205,"end":211,"count":1} ]
  );

  await TestCoverage(
    "https://crbug.com/v8/10030 - original",
    `
function a (shouldThrow) {                // 0000
  try {                                   // 0050
    if (shouldThrow)                      // 0100
      throw Error('I threw!');            // 0150
    return 'I ran';                       // 0200
  } catch(e) {                            // 0250
    console.info('caught');               // 0300
  }                                       // 0350
}                                         // 0400
a(false);                                 // 0450
a(true);                                  // 0500
    `,
    [ {"start":0,"end":549,"count":1},
      {"start":0,"end":401,"count":2},
      {"start":156,"end":353,"count":1} ]
  );

  await TestCoverage(
    "https://crbug.com/v8/10030 - only throw",
    `
function a (shouldThrow) {                // 0000
  try {                                   // 0050
    if (shouldThrow)                      // 0100
      throw Error('I threw!');            // 0150
    return 'I ran';                       // 0200
  } catch(e) {                            // 0250
    console.info('caught');               // 0300
  }                                       // 0350
}                                         // 0400
a(true);                                  // 0450
    `,
    [ {"start":0,"end":499,"count":1},
      {"start":0,"end":401,"count":1},
      {"start":180,"end":254,"count":0} ]
  );

  await TestCoverage(
    "https://crbug.com/v8/10030 - finally",
    `
function a (shouldThrow) {                // 0000
  try {                                   // 0050
    return 'I ran';                       // 0100
  } finally {                             // 0150
    console.info('finally');              // 0200
  }                                       // 0250
}                                         // 0300
a(false);                                 // 0350
a(true);                                  // 0400
    `,
    [ {"start":0,"end":449,"count":1},
      {"start":0,"end":301,"count":2} ]
  );

  await TestCoverage(
    "https://crbug.com/v8/10030 - catch & finally",
    `
function a (shouldThrow) {                // 0000
  try {                                   // 0050
    return 'I ran';                       // 0100
  } catch (e) {                           // 0150
    console.info('caught');               // 0200
  } finally {                             // 0250
    console.info('finally');              // 0300
  }                                       // 0350
}                                         // 0400
a(false);                                 // 0450
a(true);                                  // 0500
    `,
    [ {"start":0,"end":549,"count":1},
    {"start":0,"end":401,"count":2},
    {"start":154,"end":254,"count":0} ]
  );

  await TestCoverage(
    "https://crbug.com/v8/11231 - nullish coalescing",
    `
const a = true                            // 0000
const b = false                           // 0050
const c = undefined                       // 0100
const d = a ?? 99                         // 0150
const e = 33                              // 0200
const f = b ?? (c ?? 99)                  // 0250
const g = 33                              // 0300
const h = c ?? (c ?? 'hello')             // 0350
const i = c ?? b ?? 'hello'               // 0400
    `,
    [ {"start":0,"end":449,"count":1},
      {"start":162,"end":167,"count":0},
      {"start":262,"end":274,"count":0},
      {"start":417,"end":427,"count":0} ]
  );

  await TestCoverage(
    "Optional Chaining",
    `
const a = undefined || null               // 0000
const b = a?.b                            // 0050
const c = a?.['b']                        // 0100
const d = {                               // 0150
  e: {f: 99, g: () => {return undefined}} // 0200
}                                         // 0250
const e = d?.e?.f                         // 0300
const f = d?.e?.['f']                     // 0350
const g = d?.e?.f?.g                      // 0400
const h = d?.e?.f?.g?.h                   // 0450
const i = d?.['d']?.['e']?.['h']          // 0500
const k = a?.('b')                        // 0550
const l = d?.e?.g?.()                     // 0600
const m = d?.e?.g?.()?.a?.b               // 0650
delete a?.b                               // 0700
const n = d?.[d?.x?.f]                    // 0750
if (a?.[d?.x?.f]) { const p = 99 } else {}// 0800
const p = d?.[d?.x?.f]?.x                 // 0850
    `,
    [ {"start":0,"end":899,"count":1},
      {"start":61,"end":64,"count":0},
      {"start":111,"end":118,"count":0},
      {"start":470,"end":473,"count":0},
      {"start":518,"end":532,"count":0},
      {"start":561,"end":568,"count":0},
      {"start":671,"end":677,"count":0},
      {"start":708,"end":711,"count":0},
      {"start":768,"end":771,"count":0},
      {"start":805,"end":816,"count":0},
      {"start":818,"end":834,"count":0},
      {"start":868,"end":871,"count":0},
      {"start":872,"end":875,"count":0},
      {"start":216,"end":240,"count":2} ]
  );

  %DebugToggleBlockCoverage(false);

})();
