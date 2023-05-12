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

// Copyright 2022 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --harmony-rab-gsab --allow-natives-syntax --turbofan
// Flags: --no-always-turbofan --turbo-rab-gsab

"use strict";

d8.file.execute('test/mjsunit/typedarray-helpers.js');

const is_little_endian = (() => {
  var buffer = new ArrayBuffer(4);
  const HEAP32 = new Int32Array(buffer);
  const HEAPU8 = new Uint8Array(buffer);
  HEAP32[0] = 255;
  return (HEAPU8[0] === 255 && HEAPU8[3] === 0);
})();

function FillBuffer(buffer) {
  const view = new Uint8Array(buffer);
  for (let i = 0; i < view.length; ++i) {
    view[i] = i;
  }
}
%NeverOptimizeFunction(FillBuffer);

function asU16(index) {
  const start = index * 2;
  if (is_little_endian) {
    return (start + 1) * 256 + start;
  } else {
    return start * 256 + start + 1;
  }
}
%NeverOptimizeFunction(asU16);

function asU32(index) {
  const start = index * 4;
  if (is_little_endian) {
    return (((start + 3) * 256 + start + 2) * 256 + start + 1) * 256 + start;
  } else {
    return ((((start * 256) + start + 1) * 256) + start + 2) * 256 + start + 3;
  }
}
%NeverOptimizeFunction(asU32);

function asF32(index) {
  const start = index * 4;
  const ab = new ArrayBuffer(4);
  const ta = new Uint8Array(ab);
  for (let i = 0; i < 4; ++i) ta[i] = start + i;
  return new Float32Array(ab)[0];
}
%NeverOptimizeFunction(asF32);

function asF64(index) {
  const start = index * 8;
  const ab = new ArrayBuffer(8);
  const ta = new Uint8Array(ab);
  for (let i = 0; i < 8; ++i) ta[i] = start + i;
  return new Float64Array(ab)[0];
}
%NeverOptimizeFunction(asF64);

function asB64(index) {
  const start = index * 8;
  let result = 0n;
  if (is_little_endian) {
    for (let i = 0; i < 8; ++i) {
      result = result << 8n;
      result += BigInt(start + 7 - i);
    }
  } else {
    for (let i = 0; i < 8; ++i) {
      result = result << 8n;
      result += BigInt(start + i);
    }
  }
  return result;
}
%NeverOptimizeFunction(asB64);

function CreateBuffer(shared, len, max_len) {
  return shared ? new SharedArrayBuffer(len, {maxByteLength: max_len}) :
                  new ArrayBuffer(len, {maxByteLength: max_len});
}
%NeverOptimizeFunction(CreateBuffer);

function MakeResize(target, shared, offset, fixed_len) {
  const bpe = target.name === 'DataView' ? 1 : target.BYTES_PER_ELEMENT;
  function RoundDownToElementSize(blen) {
    return Math.floor(blen / bpe) * bpe;
  }
  if (!shared) {
    if (fixed_len === undefined) {
      return (b, len) => {
        b.resize(len);
        const blen = Math.max(0, len - offset);
        return RoundDownToElementSize(blen);
      };
    } else {
      const fixed_blen = fixed_len * bpe;
      return (b, len) => {
        b.resize(len);
        const blen = fixed_blen <= (len - offset) ? fixed_blen : 0;
        return RoundDownToElementSize(blen);
      }
    }
  } else {
    if (fixed_len === undefined) {
      return (b, len) => {
        let blen = 0;
        if (len > b.byteLength) {
          b.grow(len);
          blen = Math.max(0, len - offset);
        } else {
          blen = b.byteLength - offset;
        }
        return RoundDownToElementSize(blen);
      };
    } else {
      return (b, len) => {
        if (len > b.byteLength) {
          b.grow(len);
        }
        return fixed_len * bpe;
      };
    }
  }
}
%NeverOptimizeFunction(MakeResize);

function MakeElement(target, offset) {
  const o = offset / target.BYTES_PER_ELEMENT;
  if (target.name === 'Int8Array') {
    return (index) => {
      return o + index;
    };
  } else if (target.name === 'Uint32Array') {
    return (index) => {
      return asU32(o + index);
    };
  } else if (target.name === 'Float64Array') {
    return (index) => {
      return asF64(o + index);
    };
  } else if (target.name === 'BigInt64Array') {
    return (index) => {
      return asB64(o + index);
    };
  } else {
    console.log(`unimplemented: MakeElement(${target.name})`);
    return () => undefined;
  }
}
%NeverOptimizeFunction(MakeElement);

function MakeCheckBuffer(target, offset) {
  return (ab, up_to) => {
    const view = new Uint8Array(ab);
    for (let i = 0; i < offset; ++i) {
      assertEquals(0, view[i]);
    }
    for (let i = 0; i < (up_to * target.BYTES_PER_ELEMENT) + 1; ++i) {
      // Use PrintBuffer(ab) for debugging.
      assertEquals(offset + i, view[offset + i]);
    }
  }
}
%NeverOptimizeFunction(MakeCheckBuffer);

function ClearBuffer(ab) {
  for (let i = 0; i < ab.byteLength; ++i) ab[i] = 0;
}
%NeverOptimizeFunction(ClearBuffer);

// Use this for debugging these tests.
function PrintBuffer(buffer) {
  const view = new Uint8Array(buffer);
  for (let i = 0; i < 32; ++i) {
    console.log(`[${i}]: ${view[i]}`)
  }
}
%NeverOptimizeFunction(PrintBuffer);

(function() {
for (let shared of [false, true]) {
  for (let length_tracking of [false, true]) {
    for (let with_offset of [false, true]) {
      for (let target
               of [Int8Array, Uint32Array, Float64Array, BigInt64Array]) {
        const test_case = `Testing: Length_${shared ? 'GSAB' : 'RAB'}_${
            length_tracking ? 'LengthTracking' : 'FixedLength'}${
            with_offset ? 'WithOffset' : ''}_${target.name}`;
        // console.log(test_case);

        const byte_length_code = 'return ta.byteLength; // ' + test_case;
        const ByteLength = new Function('ta', byte_length_code);
        const length_code = 'return ta.length; // ' + test_case;
        const Length = new Function('ta', length_code);
        const offset = with_offset ? 8 : 0;

        let blen = 16 - offset;
        const fixed_len =
            length_tracking ? undefined : (blen / target.BYTES_PER_ELEMENT);
        const ab = CreateBuffer(shared, 16, 40);
        const ta = new target(ab, offset, fixed_len);
        const Resize = MakeResize(target, shared, offset, fixed_len);

        assertUnoptimized(ByteLength);
        assertUnoptimized(Length);
        %PrepareFunctionForOptimization(ByteLength);
        %PrepareFunctionForOptimization(Length);
        assertEquals(blen, ByteLength(ta));
        assertEquals(blen, ByteLength(ta));
        assertEquals(Math.floor(blen / target.BYTES_PER_ELEMENT), Length(ta));
        assertEquals(Math.floor(blen / target.BYTES_PER_ELEMENT), Length(ta));
        %OptimizeFunctionOnNextCall(ByteLength);
        %OptimizeFunctionOnNextCall(Length);
        assertEquals(blen, ByteLength(ta));
        assertEquals(Math.floor(blen / target.BYTES_PER_ELEMENT), Length(ta));
        blen = Resize(ab, 32);
        assertEquals(blen, ByteLength(ta));
        assertEquals(Math.floor(blen / target.BYTES_PER_ELEMENT), Length(ta));
        blen = Resize(ab, 9);
        assertEquals(blen, ByteLength(ta));
        assertEquals(Math.floor(blen / target.BYTES_PER_ELEMENT), Length(ta));
        assertOptimized(ByteLength);
        assertOptimized(Length);
        blen = Resize(ab, 24);
        assertEquals(blen, ByteLength(ta));
        assertEquals(Math.floor(blen / target.BYTES_PER_ELEMENT), Length(ta));
        assertOptimized(ByteLength);
        assertOptimized(Length);

        if (!shared) {
          %ArrayBufferDetach(ab);
          assertEquals(0, ByteLength(ta));
          assertEquals(0, Length(ta));
          assertOptimized(Length);
        }
      }
    }
  }
}
})();

(function() {
for (let shared of [false, true]) {
  for (let length_tracking of [false, true]) {
    for (let with_offset of [false, true]) {
      for (let target
               of [Int8Array, Uint32Array, Float64Array, BigInt64Array]) {
        const test_case = `Testing: Read_${shared ? 'GSAB' : 'RAB'}_${
            length_tracking ? 'LengthTracking' : 'FixedLength'}${
            with_offset ? 'WithOffset' : ''}_${target.name}`;
        // console.log(test_case);

        const read_code = 'return ta[index]; // ' + test_case;
        const Read = new Function('ta', 'index', read_code);
        const offset = with_offset ? 8 : 0;

        let blen = 16 - offset;
        let len = Math.floor(blen / target.BYTES_PER_ELEMENT);
        const fixed_len = length_tracking ? undefined : len;
        const ab = CreateBuffer(shared, 16, 40);
        const ta = new target(ab, offset, fixed_len);
        const Resize = MakeResize(target, shared, offset, fixed_len);
        const Element = MakeElement(target, offset);
        FillBuffer(ab);

        assertUnoptimized(Read);
        %PrepareFunctionForOptimization(Read);
        for (let i = 0; i < len * 2; ++i)
          assertEquals(i < len ? Element(i) : undefined, Read(ta, i));
        %OptimizeFunctionOnNextCall(Read);
        for (let i = 0; i < len * 2; ++i)
          assertEquals(i < len ? Element(i) : undefined, Read(ta, i));
        assertOptimized(Read);
        blen = Resize(ab, 32);
        FillBuffer(ab);
        len = Math.floor(blen / target.BYTES_PER_ELEMENT);
        for (let i = 0; i < len * 2; ++i)
          assertEquals(i < len ? Element(i) : undefined, Read(ta, i));
        assertOptimized(Read);
        blen = Resize(ab, 9);
        FillBuffer(ab);
        len = Math.floor(blen / target.BYTES_PER_ELEMENT);
        for (let i = 0; i < len * 2; ++i)
          assertEquals(i < len ? Element(i) : undefined, Read(ta, i));
        assertOptimized(Read);
        blen = Resize(ab, 0);
        len = Math.floor(blen / target.BYTES_PER_ELEMENT);
        for (let i = 0; i < len * 2; ++i)
          assertEquals(i < len ? Element(i) : undefined, Read(ta, i));
        assertOptimized(Read);
        blen = Resize(ab, 24);
        FillBuffer(ab);
        len = Math.floor(blen / target.BYTES_PER_ELEMENT);
        for (let i = 0; i < len * 2; ++i)
          assertEquals(i < len ? Element(i) : undefined, Read(ta, i));
        assertOptimized(Read);

        if (!shared) {
          %ArrayBufferDetach(ab);
          assertEquals(undefined, Read(ta, 0));
          //                        assertOptimized(Read);
        }
      }
    }
  }
}
})();

(function() {
for (let shared of [false, true]) {
  for (let length_tracking of [false, true]) {
    for (let with_offset of [false, true]) {
      for (let target
               of [Int8Array, Uint32Array, Float64Array, BigInt64Array]) {
        const test_case = `Testing: Write_${shared ? 'GSAB' : 'RAB'}_${
            length_tracking ? 'LengthTracking' : 'FixedLength'}${
            with_offset ? 'WithOffset' : ''}_${target.name}`;
        // console.log(test_case);

        const write_code = 'ta[index] = value; // ' + test_case;
        const Write = new Function('ta', 'index', 'value', write_code);
        const offset = with_offset ? 8 : 0;

        let blen = 16 - offset;
        let len = Math.floor(blen / target.BYTES_PER_ELEMENT);
        const fixed_len = length_tracking ? undefined : len;
        const ab = CreateBuffer(shared, 16, 40);
        const ta = new target(ab, offset, fixed_len);
        const Resize = MakeResize(target, shared, offset, fixed_len);
        const Element = MakeElement(target, offset);
        const CheckBuffer = MakeCheckBuffer(target, offset);
        ClearBuffer(ab);

        assertUnoptimized(Write);
        %PrepareFunctionForOptimization(Write);
        for (let i = 0; i < len; ++i) {
          Write(ta, i, Element(i));
          CheckBuffer(ab, i);
        }
        ClearBuffer(ab);
        %OptimizeFunctionOnNextCall(Write);
        for (let i = 0; i < len; ++i) {
          Write(ta, i, Element(i));
          CheckBuffer(ab, i);
        }
        assertOptimized(Write);
        blen = Resize(ab, 32);
        ClearBuffer(ab);
        len = Math.floor(blen / target.BYTES_PER_ELEMENT);
        for (let i = 0; i < len; ++i) {
          Write(ta, i, Element(i));
          CheckBuffer(ab, i);
        }
        assertOptimized(Write);
        blen = Resize(ab, 9);
        ClearBuffer(ab);
        len = Math.floor(blen / target.BYTES_PER_ELEMENT);
        for (let i = 0; i < len; ++i) {
          Write(ta, i, Element(i));
          CheckBuffer(ab, i);
        }
        assertOptimized(Write);
        blen = Resize(ab, 24);
        ClearBuffer(ab);
        len = Math.floor(blen / target.BYTES_PER_ELEMENT);
        for (let i = 0; i < len; ++i) {
          Write(ta, i, Element(i));
          CheckBuffer(ab, i);
        }
        assertOptimized(Write);
      }
    }
  }
}
})();

(function() {
for (let shared of [false, true]) {
  for (let length_tracking of [false, true]) {
    for (let with_offset of [false, true]) {
      const test_case = `Testing: ByteLength_${shared ? 'GSAB' : 'RAB'}_${
          length_tracking ?
              'LengthTracking' :
              'FixedLength'}${with_offset ? 'WithOffset' : ''}_DataView`;
      // console.log(test_case);

      const byte_length_code = 'return dv.byteLength; // ' + test_case;
      const ByteLength = new Function('dv', byte_length_code);
      const offset = with_offset ? 8 : 0;

      let blen = 16 - offset;
      const fixed_blen = length_tracking ? undefined : blen;
      const ab = CreateBuffer(shared, 16, 40);
      const dv = new DataView(ab, offset, fixed_blen);
      const Resize = MakeResize(DataView, shared, offset, fixed_blen);

      assertUnoptimized(ByteLength);
      %PrepareFunctionForOptimization(ByteLength);
      assertEquals(blen, ByteLength(dv));
      assertEquals(blen, ByteLength(dv));
      %OptimizeFunctionOnNextCall(ByteLength);
      assertEquals(blen, ByteLength(dv));
      assertOptimized(ByteLength);
      blen = Resize(ab, 32);
      assertEquals(blen, ByteLength(dv));
      assertOptimized(ByteLength);
      blen = Resize(ab, 9);
      if (length_tracking || shared) {
        assertEquals(blen, ByteLength(dv));
      } else {
        // For fixed length rabs, Resize(ab, 9) will put the ArrayBuffer in
        // detached state, for which DataView.prototype.byteLength has to throw.
        assertThrows(() => { ByteLength(dv); }, TypeError);
      }
      assertOptimized(ByteLength);
      blen = Resize(ab, 24);
      assertEquals(blen, ByteLength(dv));
      assertOptimized(ByteLength);

      if (!shared) {
        %ArrayBufferDetach(ab);
        assertThrows(() => { ByteLength(dv); }, TypeError);
        assertOptimized(ByteLength);
      }
    }
  }
}
})();

(function() {
function ByteLength_RAB_LengthTrackingWithOffset_DataView(dv) {
  return dv.byteLength;
}
const ByteLength = ByteLength_RAB_LengthTrackingWithOffset_DataView;

const rab = CreateResizableArrayBuffer(16, 40);
const dv = new DataView(rab, 7);

%PrepareFunctionForOptimization(ByteLength);
assertEquals(9, ByteLength(dv));
assertEquals(9, ByteLength(dv));
%OptimizeFunctionOnNextCall(ByteLength);
assertEquals(9, ByteLength(dv));
assertOptimized(ByteLength);
})();

const dataview_data_sizes = ['Int8', 'Uint8', 'Int16', 'Uint16', 'Int32',
                             'Uint32', 'Float32', 'Float64', 'BigInt64',
                             'BigUint64'];

// Global variable used for DataViews; this is important for triggering some
// optimizations.
var dv;
(function() {
for (let use_global_var of [true, false]) {
  for (let shared of [false, true]) {
    for (let length_tracking of [false, true]) {
      for (let with_offset of [false, true]) {
        for (let data_size of dataview_data_sizes) {
          const test_case = `Testing: Get_${
              data_size}_${
              shared ? 'GSAB' : 'RAB'}_${
              length_tracking ?
                  'LengthTracking' :
                  'FixedLength'}${with_offset ? 'WithOffset' : ''}_${
              use_global_var ? 'UseGlobalVar' : ''}_DataView`;
          // console.log(test_case);
          const is_bigint = data_size.startsWith('Big');
          const expected_value = is_bigint ? 0n : 0;

          const get_code = 'return dv.get' + data_size + '(0); // ' + test_case;
          const Get = use_global_var ?
              new Function(get_code) : new Function('dv', get_code);

          const offset = with_offset ? 8 : 0;

          let blen = 8;  // Enough for one element.
          const fixed_blen = length_tracking ? undefined : blen;
          const ab = CreateBuffer(shared, 8*10, 8*20);
          // Assign to the global var.
          dv = new DataView(ab, offset, fixed_blen);
          const Resize = MakeResize(DataView, shared, offset, fixed_blen);

          assertUnoptimized(Get);
          %PrepareFunctionForOptimization(Get);
          assertEquals(expected_value, Get(dv));
          assertEquals(expected_value, Get(dv));
          %OptimizeFunctionOnNextCall(Get);
          assertEquals(expected_value, Get(dv));
          assertOptimized(Get);

          // Enough for one element or more (even with offset).
          blen = Resize(ab, 8 + offset);
          assertEquals(expected_value, Get(dv));
          assertOptimized(Get);

          blen = Resize(ab, 0);  // Not enough for one element.
          if (shared) {
            assertEquals(expected_value, Get(dv));
          } else {
            if (!length_tracking || with_offset) {
              // DataView is out of bounds.
              assertThrows(() => { Get(dv); }, TypeError);
            } else {
              // DataView is valid, the index is out of bounds.
              assertThrows(() => { Get(dv); }, RangeError);
            }
          }

          blen = Resize(ab, 64);
          assertEquals(expected_value, Get(dv));

          if (!shared) {
            %ArrayBufferDetach(ab);
            assertThrows(() => { Get(dv); }, TypeError);
          }
        }
      }
    }
  }
}
})();

(function() {
function Read_TA_RAB_LengthTracking_Mixed(ta, index) {
  return ta[index];
}
const Get = Read_TA_RAB_LengthTracking_Mixed;

const ab = new ArrayBuffer(16);
FillBuffer(ab);
const rab = CreateResizableArrayBuffer(16, 40);
FillBuffer(rab);
let ta_int8 = new Int8Array(ab);
let ta_uint16 = new Uint16Array(rab);
let ta_float32 = new Float32Array(ab);
let ta_float64 = new Float64Array(rab);

// Train with feedback for all elements kinds.
%PrepareFunctionForOptimization(Get);
assertEquals(0, Get(ta_int8, 0));
assertEquals(3, Get(ta_int8, 3));
assertEquals(15, Get(ta_int8, 15));
assertEquals(undefined, Get(ta_int8, 16));
assertEquals(undefined, Get(ta_int8, 32));
assertEquals(asU16(0), Get(ta_uint16, 0));
assertEquals(asU16(3), Get(ta_uint16, 3));
assertEquals(asU16(7), Get(ta_uint16, 7));
assertEquals(undefined, Get(ta_uint16, 8));
assertEquals(undefined, Get(ta_uint16, 12));
assertEquals(asF32(0), Get(ta_float32, 0));
assertEquals(asF32(3), Get(ta_float32, 3));
assertEquals(undefined, Get(ta_float32, 4));
assertEquals(undefined, Get(ta_float32, 12));
assertEquals(asF64(0), Get(ta_float64, 0));
assertEquals(asF64(1), Get(ta_float64, 1));
assertEquals(undefined, Get(ta_float64, 2));
assertEquals(undefined, Get(ta_float64, 12));
%OptimizeFunctionOnNextCall(Get);
assertEquals(0, Get(ta_int8, 0));
assertEquals(3, Get(ta_int8, 3));
assertEquals(15, Get(ta_int8, 15));
assertEquals(undefined, Get(ta_int8, 16));
assertEquals(undefined, Get(ta_int8, 32));
assertEquals(asU16(0), Get(ta_uint16, 0));
assertEquals(asU16(3), Get(ta_uint16, 3));
assertEquals(asU16(7), Get(ta_uint16, 7));
assertEquals(undefined, Get(ta_uint16, 8));
assertEquals(undefined, Get(ta_uint16, 12));
assertEquals(asF32(0), Get(ta_float32, 0));
assertEquals(asF32(3), Get(ta_float32, 3));
assertEquals(undefined, Get(ta_float32, 4));
assertEquals(undefined, Get(ta_float32, 12));
assertEquals(asF64(0), Get(ta_float64, 0));
assertEquals(asF64(1), Get(ta_float64, 1));
assertEquals(undefined, Get(ta_float64, 2));
assertEquals(undefined, Get(ta_float64, 12));
assertOptimized(Get);
rab.resize(32);
FillBuffer(rab);
assertEquals(0, Get(ta_int8, 0));
assertEquals(3, Get(ta_int8, 3));
assertEquals(15, Get(ta_int8, 15));
assertEquals(undefined, Get(ta_int8, 16));
assertEquals(undefined, Get(ta_int8, 32));
assertEquals(asU16(0), Get(ta_uint16, 0));
assertEquals(asU16(3), Get(ta_uint16, 3));
assertEquals(asU16(15), Get(ta_uint16, 15));
assertEquals(undefined, Get(ta_uint16, 16));
assertEquals(undefined, Get(ta_uint16, 40));
assertEquals(asF32(0), Get(ta_float32, 0));
assertEquals(asF32(3), Get(ta_float32, 3));
assertEquals(undefined, Get(ta_float32, 4));
assertEquals(undefined, Get(ta_float32, 12));
assertEquals(asF64(0), Get(ta_float64, 0));
assertEquals(asF64(1), Get(ta_float64, 1));
assertEquals(asF64(3), Get(ta_float64, 3));
assertEquals(undefined, Get(ta_float64, 4));
assertEquals(undefined, Get(ta_float64, 12));
assertOptimized(Get);
rab.resize(9);
assertEquals(0, Get(ta_int8, 0));
assertEquals(3, Get(ta_int8, 3));
assertEquals(15, Get(ta_int8, 15));
assertEquals(undefined, Get(ta_int8, 16));
assertEquals(undefined, Get(ta_int8, 32));
assertEquals(asU16(0), Get(ta_uint16, 0));
assertEquals(asU16(3), Get(ta_uint16, 3));
assertEquals(undefined, Get(ta_uint16, 4));
assertEquals(undefined, Get(ta_uint16, 12));
assertEquals(asF32(0), Get(ta_float32, 0));
assertEquals(asF32(3), Get(ta_float32, 3));
assertEquals(undefined, Get(ta_float32, 4));
assertEquals(undefined, Get(ta_float32, 12));
assertEquals(asF64(0), Get(ta_float64, 0));
assertEquals(undefined, Get(ta_float64, 1));
assertEquals(undefined, Get(ta_float64, 12));
assertOptimized(Get);

// Call with a different map to trigger deoptimization. We use this
// to verify that we have actually specialized on the above maps only.
let ta_uint8 = new Uint8Array(rab);
assertEquals(7, Get(ta_uint8, 7));
assertUnoptimized(Get);
}());

(function() {
function Read_TA_RAB_LengthTracking_Mixed(ta, index) {
  return ta[index];
}
const Get = Read_TA_RAB_LengthTracking_Mixed;

const ab = new ArrayBuffer(16);
FillBuffer(ab);
const rab = CreateResizableArrayBuffer(16, 40);
FillBuffer(rab);
let ta_int8 = new Int8Array(ab);
let ta_uint16 = new Uint16Array(rab);
let ta_float32 = new Float32Array(ab);
let ta_float64 = new Float64Array(rab);

// Train with feedback for all elements kinds.
%PrepareFunctionForOptimization(Get);
assertEquals(0, Get(ta_int8, 0));
assertEquals(3, Get(ta_int8, 3));
assertEquals(15, Get(ta_int8, 15));
assertEquals(undefined, Get(ta_int8, 16));
assertEquals(undefined, Get(ta_int8, 32));
assertEquals(asU16(0), Get(ta_uint16, 0));
assertEquals(asU16(3), Get(ta_uint16, 3));
assertEquals(asU16(7), Get(ta_uint16, 7));
assertEquals(undefined, Get(ta_uint16, 8));
assertEquals(undefined, Get(ta_uint16, 12));
assertEquals(asF32(0), Get(ta_float32, 0));
assertEquals(asF32(3), Get(ta_float32, 3));
assertEquals(undefined, Get(ta_float32, 4));
assertEquals(undefined, Get(ta_float32, 12));
assertEquals(asF64(0), Get(ta_float64, 0));
assertEquals(asF64(1), Get(ta_float64, 1));
assertEquals(undefined, Get(ta_float64, 2));
assertEquals(undefined, Get(ta_float64, 12));
%OptimizeFunctionOnNextCall(Get);
assertEquals(0, Get(ta_int8, 0));
assertEquals(3, Get(ta_int8, 3));
assertEquals(15, Get(ta_int8, 15));
assertEquals(undefined, Get(ta_int8, 16));
assertEquals(undefined, Get(ta_int8, 32));
assertEquals(asU16(0), Get(ta_uint16, 0));
assertEquals(asU16(3), Get(ta_uint16, 3));
assertEquals(asU16(7), Get(ta_uint16, 7));
assertEquals(undefined, Get(ta_uint16, 8));
assertEquals(undefined, Get(ta_uint16, 12));
assertEquals(asF32(0), Get(ta_float32, 0));
assertEquals(asF32(3), Get(ta_float32, 3));
assertEquals(undefined, Get(ta_float32, 4));
assertEquals(undefined, Get(ta_float32, 12));
assertEquals(asF64(0), Get(ta_float64, 0));
assertEquals(asF64(1), Get(ta_float64, 1));
assertEquals(undefined, Get(ta_float64, 2));
assertEquals(undefined, Get(ta_float64, 12));
assertOptimized(Get);
rab.resize(32);
FillBuffer(rab);
assertEquals(0, Get(ta_int8, 0));
assertEquals(3, Get(ta_int8, 3));
assertEquals(15, Get(ta_int8, 15));
assertEquals(undefined, Get(ta_int8, 16));
assertEquals(undefined, Get(ta_int8, 32));
assertEquals(asU16(0), Get(ta_uint16, 0));
assertEquals(asU16(3), Get(ta_uint16, 3));
assertEquals(asU16(15), Get(ta_uint16, 15));
assertEquals(undefined, Get(ta_uint16, 16));
assertEquals(undefined, Get(ta_uint16, 40));
assertEquals(asF32(0), Get(ta_float32, 0));
assertEquals(asF32(3), Get(ta_float32, 3));
assertEquals(undefined, Get(ta_float32, 4));
assertEquals(undefined, Get(ta_float32, 12));
assertEquals(asF64(0), Get(ta_float64, 0));
assertEquals(asF64(1), Get(ta_float64, 1));
assertEquals(asF64(3), Get(ta_float64, 3));
assertEquals(undefined, Get(ta_float64, 4));
assertEquals(undefined, Get(ta_float64, 12));
assertOptimized(Get);
rab.resize(9);
assertEquals(0, Get(ta_int8, 0));
assertEquals(3, Get(ta_int8, 3));
assertEquals(15, Get(ta_int8, 15));
assertEquals(undefined, Get(ta_int8, 16));
assertEquals(undefined, Get(ta_int8, 32));
assertEquals(asU16(0), Get(ta_uint16, 0));
assertEquals(asU16(3), Get(ta_uint16, 3));
assertEquals(undefined, Get(ta_uint16, 4));
assertEquals(undefined, Get(ta_uint16, 12));
assertEquals(asF32(0), Get(ta_float32, 0));
assertEquals(asF32(3), Get(ta_float32, 3));
assertEquals(undefined, Get(ta_float32, 4));
assertEquals(undefined, Get(ta_float32, 12));
assertEquals(asF64(0), Get(ta_float64, 0));
assertEquals(undefined, Get(ta_float64, 1));
assertEquals(undefined, Get(ta_float64, 12));
assertOptimized(Get);

// Call with a different map to trigger deoptimization. We use this
// to verify that we have actually specialized on the above maps only.
let ta_uint8 = new Uint8Array(rab);
Get(7, Get(ta_uint8, 7));
assertUnoptimized(Get);
}());

(function() {
function Length_TA_RAB_LengthTracking_Mixed(ta) {
  return ta.length;
}
let Length = Length_TA_RAB_LengthTracking_Mixed;

const ab = new ArrayBuffer(32);
const rab = CreateResizableArrayBuffer(16, 40);
let ta_int8 = new Int8Array(ab);
let ta_uint16 = new Uint16Array(rab);
let ta_float32 = new Float32Array(ab);
let ta_bigint64 = new BigInt64Array(rab);

// Train with feedback for all elements kinds.
%PrepareFunctionForOptimization(Length);
assertEquals(32, Length(ta_int8));
assertEquals(8, Length(ta_uint16));
assertEquals(8, Length(ta_float32));
assertEquals(2, Length(ta_bigint64));
%OptimizeFunctionOnNextCall(Length);
assertEquals(32, Length(ta_int8));
assertEquals(8, Length(ta_uint16));
assertEquals(8, Length(ta_float32));
assertEquals(2, Length(ta_bigint64));
assertOptimized(Length);
}());

(function() {
function Length_RAB_GSAB_LengthTrackingWithOffset_Mixed(ta) {
  return ta.length;
}
const Length = Length_RAB_GSAB_LengthTrackingWithOffset_Mixed;

const rab = CreateResizableArrayBuffer(16, 40);
let ta_int8 = new Int8Array(rab);
let ta_float64 = new Float64Array(rab);

// Train with feedback for Int8Array and Float64Array.
%PrepareFunctionForOptimization(Length);
assertEquals(16, Length(ta_int8));
assertEquals(2, Length(ta_float64));
%OptimizeFunctionOnNextCall(Length);
assertEquals(16, Length(ta_int8));
assertEquals(2, Length(ta_float64));
assertOptimized(Length);

let ta_uint32 = new Uint32Array(rab);
let ta_bigint64 = new BigInt64Array(rab);
// Calling with Uint32Array will deopt because of the map check on length.
assertEquals(4, Length(ta_uint32));
assertUnoptimized(Length);
%PrepareFunctionForOptimization(Length);
assertEquals(2, Length(ta_bigint64));
// Recompile with additional feedback for Uint32Array and BigInt64Array.
%OptimizeFunctionOnNextCall(Length);
assertEquals(2, Length(ta_bigint64));
assertOptimized(Length);

// Length handles all four TypedArrays without deopting.
assertEquals(16, Length(ta_int8));
assertEquals(2, Length(ta_float64));
assertEquals(4, Length(ta_uint32));
assertEquals(2, Length(ta_bigint64));
assertOptimized(Length);

// Length handles corresponding gsab-backed TypedArrays without deopting.
const gsab = CreateGrowableSharedArrayBuffer(16, 40);
let ta2_uint32 = new Uint32Array(gsab, 8);
let ta2_float64 = new Float64Array(gsab, 8);
let ta2_bigint64 = new BigInt64Array(gsab, 8);
let ta2_int8 = new Int8Array(gsab, 8);
assertEquals(8, Length(ta2_int8));
assertEquals(1, Length(ta2_float64));
assertEquals(2, Length(ta2_uint32));
assertEquals(1, Length(ta2_bigint64));
assertOptimized(Length);

// Test Length after rab has been resized to a smaller size.
rab.resize(5);
assertEquals(5, Length(ta_int8));
assertEquals(0, Length(ta_float64));
assertEquals(1, Length(ta_uint32));
assertEquals(0, Length(ta_bigint64));
assertOptimized(Length);

// Test Length after rab has been resized to a larger size.
rab.resize(40);
assertEquals(40, Length(ta_int8));
assertEquals(5, Length(ta_float64));
assertEquals(10, Length(ta_uint32));
assertEquals(5, Length(ta_bigint64));
assertOptimized(Length);

// Test Length after gsab has been grown to a larger size.
gsab.grow(25);
assertEquals(17, Length(ta2_int8));
assertEquals(2, Length(ta2_float64));
assertEquals(4, Length(ta2_uint32));
assertEquals(2, Length(ta2_bigint64));
assertOptimized(Length);
})();

(function() {
function Length_AB_RAB_GSAB_LengthTrackingWithOffset_Mixed(ta) {
  return ta.length;
}
const Length = Length_AB_RAB_GSAB_LengthTrackingWithOffset_Mixed;

let ab = new ArrayBuffer(32);
let rab = CreateResizableArrayBuffer(16, 40);
let gsab = CreateGrowableSharedArrayBuffer(16, 40);

let ta_ab_int32 = new Int32Array(ab, 8, 3);
let ta_rab_int32 = new Int32Array(rab, 4);
let ta_gsab_float64 = new Float64Array(gsab);
let ta_gsab_bigint64 = new BigInt64Array(gsab, 0, 2);

// Optimize Length with polymorphic feedback.
%PrepareFunctionForOptimization(Length);
assertEquals(3, Length(ta_ab_int32));
assertEquals(3, Length(ta_rab_int32));
assertEquals(2, Length(ta_gsab_float64));
assertEquals(2, Length(ta_gsab_bigint64));
%OptimizeFunctionOnNextCall(Length);
assertEquals(3, Length(ta_ab_int32));
assertEquals(3, Length(ta_rab_int32));
assertEquals(2, Length(ta_gsab_float64));
assertEquals(2, Length(ta_gsab_bigint64));
assertOptimized(Length);

// Test resizing and growing the underlying rab/gsab buffers.
rab.resize(8);
gsab.grow(36);
assertEquals(3, Length(ta_ab_int32));
assertEquals(1, Length(ta_rab_int32));
assertEquals(4, Length(ta_gsab_float64));
assertEquals(2, Length(ta_gsab_bigint64));
assertOptimized(Length);

// Construct additional TypedArrays with the same ElementsKind.
let ta2_ab_bigint64 = new BigInt64Array(ab, 0, 1);
let ta2_gsab_int32 = new Int32Array(gsab, 16);
let ta2_rab_float64 = new Float64Array(rab, 8);
let ta2_rab_int32 = new Int32Array(rab, 0, 1);
assertEquals(1, Length(ta2_ab_bigint64));
assertEquals(5, Length(ta2_gsab_int32));
assertEquals(0, Length(ta2_rab_float64));
assertEquals(1, Length(ta2_rab_int32));
assertOptimized(Length);
})();

(function() {
function ByteOffset(ta) {
  return ta.byteOffset;
}

const rab = CreateResizableArrayBuffer(16, 40);
const ta = new Int32Array(rab, 4);

%PrepareFunctionForOptimization(ByteOffset);
assertEquals(4, ByteOffset(ta));
assertEquals(4, ByteOffset(ta));
%OptimizeFunctionOnNextCall(ByteOffset);
assertEquals(4, ByteOffset(ta));
assertOptimized(ByteOffset);
})();
