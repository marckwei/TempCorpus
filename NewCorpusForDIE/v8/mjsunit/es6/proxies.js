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

// Copyright 2011 the V8 project authors. All rights reserved.
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

// We change the stack size for the ARM64 simulator because at one point this
// test enters an infinite recursion which goes through the runtime and we
// overflow the system stack before the simulator stack.

// Flags: --sim-stack-size=500 --allow-natives-syntax


// Helper.

function TestWithProxies(test, x, y, z) {
  // Separate function for nicer stack traces.
  TestWithObjectProxy(test, x, y, z);
  TestWithFunctionProxy(test, x, y, z);
}

function TestWithObjectProxy(test, x, y, z) {
  test((handler) => { return new Proxy({}, handler) }, x, y, z)

}

function TestWithFunctionProxy(test, x, y, z) {
  test((handler) => { return new Proxy(() => {}, handler) }, x, y, z)
}

// ---------------------------------------------------------------------------
// Test Proxy constructor properties

(function TestProxyProperties() {
  assertEquals(2, Proxy.length);
  assertEquals(Function.__proto__, Proxy.__proto__);
  assertEquals(undefined, Proxy.prototype);
  assertEquals(undefined, Object.getOwnPropertyDescriptor(Proxy, "arguments"));
  assertThrows(() => Proxy.arguments, TypeError);
  assertEquals(undefined, Object.getOwnPropertyDescriptor(Proxy, "caller"));
  assertThrows(() => Proxy.caller, TypeError);
})();

// ---------------------------------------------------------------------------
// Getting property descriptors (Object.getOwnPropertyDescriptor).

var key

function TestGetOwnProperty(handler) {
  TestWithProxies(TestGetOwnProperty2, handler)
}

function TestGetOwnProperty2(create, handler) {
  var p = create(handler)
  assertEquals(42, Object.getOwnPropertyDescriptor(p, "a").value)
  assertEquals("a", key)
  assertEquals(42, Object.getOwnPropertyDescriptor(p, 99).value)
  assertEquals("99", key)
}

TestGetOwnProperty({
  getOwnPropertyDescriptor(target, k) {
    key = k
    return {value: 42, configurable: true}
  }
})

TestGetOwnProperty({
  getOwnPropertyDescriptor(target, k) {
    return this.getOwnPropertyDescriptor2(k)
  },
  getOwnPropertyDescriptor2(k) {
    key = k
    return {value: 42, configurable: true}
  }
})

TestGetOwnProperty({
  getOwnPropertyDescriptor(target, k) {
    key = k
    return {get value() { return 42 }, get configurable() { return true }}
  }
})

TestGetOwnProperty(new Proxy({}, {
  get(target, pk, receiver) {
    return function(t, k) { key = k; return {value: 42, configurable: true} }
  }
}))


// ---------------------------------------------------------------------------
function TestGetOwnPropertyThrow(handler) {
  TestWithProxies(TestGetOwnPropertyThrow2, handler)
}

function TestGetOwnPropertyThrow2(create, handler) {
  var p = create(handler)
  assertThrowsEquals(() => Object.getOwnPropertyDescriptor(p, "a"), "myexn")
  assertThrowsEquals(() => Object.getOwnPropertyDescriptor(p, 77), "myexn")
}

TestGetOwnPropertyThrow({
  getOwnPropertyDescriptor: function(k) { throw "myexn" }
})

TestGetOwnPropertyThrow({
  getOwnPropertyDescriptor: function(k) {
    return this.getOwnPropertyDescriptor2(k)
  },
  getOwnPropertyDescriptor2: function(k) { throw "myexn" }
})

TestGetOwnPropertyThrow({
  getOwnPropertyDescriptor: function(k) {
    return {get value() { throw "myexn" }}
  }
})

TestGetOwnPropertyThrow(new Proxy({}, {
  get: function(pr, pk) {
    return function(k) { throw "myexn" }
  }
}))


// ---------------------------------------------------------------------------
// Getters (dot, brackets).

var key

function TestGet(handler) {
  TestWithProxies(TestGet2, handler)
}

function TestGet2(create, handler) {
  var p = create(handler)
  assertEquals(42, p.a)
  assertEquals("a", key)
  assertEquals(42, p["b"])
  assertEquals("b", key)
  assertEquals(42, p[99])
  assertEquals("99", key)
  assertEquals(42, (function(n) { return p[n] })("c"))
  assertEquals("c", key)
  assertEquals(42, (function(n) { return p[n] })(101))
  assertEquals("101", key)

  var o = Object.create(p, {x: {value: 88}})
  assertEquals(42, o.a)
  assertEquals("a", key)
  assertEquals(42, o["b"])
  assertEquals("b", key)
  assertEquals(42, o[99])
  assertEquals("99", key)
  assertEquals(88, o.x)
  assertEquals(88, o["x"])
  assertEquals(42, (function(n) { return o[n] })("c"))
  assertEquals("c", key)
  assertEquals(42, (function(n) { return o[n] })(101))
  assertEquals("101", key)
  assertEquals(88, (function(n) { return o[n] })("x"))
}

TestGet({
  get(t, k, r) { key = k; return 42 }
})

TestGet({
  get(t, k, r) { return this.get2(r, k) },
  get2(r, k) { key = k; return 42 }
})

TestGet(new Proxy({}, {
  get(pt, pk, pr) {
    return function(t, k, r) { key = k; return 42 }
  }
}))


// ---------------------------------------------------------------------------
function TestGetCall(handler) {
  TestWithProxies(TestGetCall2, handler)
}

function TestGetCall2(create, handler) {
  var p = create(handler)
  assertEquals(55, p.f())
  assertEquals(55, p["f"]())
  assertEquals(55, p.f("unused", "arguments"))
  assertEquals(55, p.f.call(p))
  assertEquals(55, p["f"].call(p))
  assertEquals(55, p[101].call(p))
  assertEquals(55, p.withargs(45, 5))
  assertEquals(55, p.withargs.call(p, 11, 22))
  assertEquals(55, (function(n) { return p[n]() })("f"))
  assertEquals(55, (function(n) { return p[n].call(p) })("f"))
  assertEquals(55, (function(n) { return p[n](15, 20) })("withargs"))
  assertEquals(55, (function(n) { return p[n].call(p, 13, 21) })("withargs"))
  assertEquals("6655", "66" + p)  // calls p.toString

  var o = Object.create(p, {g: {value: function(x) { return x + 88 }}})
  assertEquals(55, o.f())
  assertEquals(55, o["f"]())
  assertEquals(55, o.f("unused", "arguments"))
  assertEquals(55, o.f.call(o))
  assertEquals(55, o.f.call(p))
  assertEquals(55, o["f"].call(p))
  assertEquals(55, o[101].call(p))
  assertEquals(55, o.withargs(45, 5))
  assertEquals(55, o.withargs.call(p, 11, 22))
  assertEquals(90, o.g(2))
  assertEquals(91, o.g.call(o, 3))
  assertEquals(92, o.g.call(p, 4))
  assertEquals(55, (function(n) { return o[n]() })("f"))
  assertEquals(55, (function(n) { return o[n].call(o) })("f"))
  assertEquals(55, (function(n) { return o[n](15, 20) })("withargs"))
  assertEquals(55, (function(n) { return o[n].call(o, 13, 21) })("withargs"))
  assertEquals(93, (function(n) { return o[n](5) })("g"))
  assertEquals(94, (function(n) { return o[n].call(o, 6) })("g"))
  assertEquals(95, (function(n) { return o[n].call(p, 7) })("g"))
  assertEquals("6655", "66" + o)  // calls o.toString
}

TestGetCall({
  get(t, k, r) { return () => { return 55 } }
})

TestGetCall({
  get(t, k, r)  { return this.get2(t, k, r) },
  get2(t, k, r) { return () => { return 55 } }
})

TestGetCall({
  get(t, k, r) {
    if (k == "gg") {
      return () => { return 55 }
    } else if (k == "withargs") {
      return (n, m) => { return n + m * 2 }
    } else {
      return () => { return r.gg() }
    }
  }
})

TestGetCall(new Proxy({}, {
  get(pt, pk, pr) {
    return (t, k, r) => { return () => { return 55 } }
  }
}))


// ---------------------------------------------------------------------------
function TestGetThrow(handler) {
  TestWithProxies(TestGetThrow2, handler)
}

function TestGetThrow2(create, handler) {
  var p = create(handler)
  assertThrowsEquals(function(){ p.a }, "myexn")
  assertThrowsEquals(function(){ p["b"] }, "myexn")
  assertThrowsEquals(function(){ p[3] }, "myexn")
  assertThrowsEquals(function(){ (function(n) { p[n] })("c") }, "myexn")
  assertThrowsEquals(function(){ (function(n) { p[n] })(99) }, "myexn")

  var o = Object.create(p, {x: {value: 88}, '4': {value: 89}})
  assertThrowsEquals(function(){ o.a }, "myexn")
  assertThrowsEquals(function(){ o["b"] }, "myexn")
  assertThrowsEquals(function(){ o[3] }, "myexn")
  assertThrowsEquals(function(){ (function(n) { o[n] })("c") }, "myexn")
  assertThrowsEquals(function(){ (function(n) { o[n] })(99) }, "myexn")
}

TestGetThrow({
  get(r, k) { throw "myexn" }
})

TestGetThrow({
  get(r, k) { return this.get2(r, k) },
  get2(r, k) { throw "myexn" }
})

TestGetThrow(new Proxy({}, {
  get(pr, pk) { throw "myexn" }
}))

TestGetThrow(new Proxy({}, {
  get(pr, pk) {
    return function(r, k) { throw "myexn" }
  }
}))


// ---------------------------------------------------------------------------
// Setters.

var key
var val

function TestSet(handler) {
  TestWithProxies(TestSet2, handler)
}

function TestSet2(create, handler) {
  var p = create(handler)
  assertEquals(42, p.a = 42)
  assertEquals("a", key)
  assertEquals(42, val)
  assertEquals(43, p["b"] = 43)
  assertEquals("b", key)
  assertEquals(43, val)
  assertEquals(44, p[77] = 44)
  assertEquals("77", key)
  assertEquals(44, val)

  assertEquals(45, (function(n) { return p[n] = 45 })("c"))
  assertEquals("c", key)
  assertEquals(45, val)
  assertEquals(46, (function(n) { return p[n] = 46 })(99))
  assertEquals("99", key)
  assertEquals(46, val)

  assertEquals(47, p["0"] = 47)
  assertEquals("0", key)
  assertEquals(47, val)
}

TestSet({
  set: function(r, k, v) { key = k; val = v; return true }
})

TestSet({
  set: function(r, k, v) { return this.set2(r, k, v) },
  set2: function(r, k, v) { key = k; val = v; return true }
})

TestSet(new Proxy({}, {
  get(pk, pr) {
    return (r, k, v) => { key = k; val = v; return true }
  }
}))


// ---------------------------------------------------------------------------
function TestSetThrow(handler) {
  TestWithProxies(TestSetThrow2, handler)
}

function TestSetThrow2(create, handler) {
  var p = create(handler)
  assertThrowsEquals(function(){ p.a = 42 }, "myexn")
  assertThrowsEquals(function(){ p["b"] = 42 }, "myexn")
  assertThrowsEquals(function(){ p[22] = 42 }, "myexn")
  assertThrowsEquals(function(){ (function(n) { p[n] = 45 })("c") }, "myexn")
  assertThrowsEquals(function(){ (function(n) { p[n] = 46 })(99) }, "myexn")
}

TestSetThrow({
  set: function(r, k, v) { throw "myexn" }
})

TestSetThrow({
  set: function(r, k, v) { return this.set2(r, k, v) },
  set2: function(r, k, v) { throw "myexn" }
})

TestSetThrow({
  getOwnPropertyDescriptor: function(k) { throw "myexn" },
  defineProperty: function(k, desc) { key = k; val = desc.value }
})

TestSetThrow({
  getOwnPropertyDescriptor: function(k) {
    return {configurable: true, writable: true}
  },
  defineProperty: function(k, desc) { throw "myexn" }
})

TestSetThrow({
  getOwnPropertyDescriptor: function(k) {
    return this.getOwnPropertyDescriptor2(k)
  },
  getOwnPropertyDescriptor2: function(k) { throw "myexn" },
  defineProperty: function(k, desc) { this.defineProperty2(k, desc) },
  defineProperty2: function(k, desc) { key = k; val = desc.value }
})

TestSetThrow({
  getOwnPropertyDescriptor: function(k) {
    return this.getOwnPropertyDescriptor2(k)
  },
  getOwnPropertyDescriptor2: function(k) {
    return {configurable: true, writable: true}
  },
  defineProperty: function(k, desc) { this.defineProperty2(k, desc) },
  defineProperty2: function(k, desc) { throw "myexn" }
})

TestSetThrow({
  getOwnPropertyDescriptor: function(k) { throw "myexn" },
  defineProperty: function(k, desc) { key = k; val = desc.value }
})

TestSetThrow({
  getOwnPropertyDescriptor: function(k) {
    return {
      get configurable() { return true },
      get writable() { return true }
    }
  },
  defineProperty: function(k, desc) { throw "myexn" }
})

TestSetThrow({
  getOwnPropertyDescriptor: function(k) { throw "myexn" }
})

TestSetThrow({
  getOwnPropertyDescriptor: function(k) { throw "myexn" },
  defineProperty: function(k, desc) { key = k; val = desc.value }
})

TestSetThrow(new Proxy({}, {
  get: function(pr, pk) { throw "myexn" }
}))

TestSetThrow(new Proxy({}, {
  get: function(pr, pk) {
    return function(r, k, v) { throw "myexn" }
  }
}))

// ---------------------------------------------------------------------------

// Evil proxy-induced side-effects shouldn't crash.
TestWithProxies(function(create) {
  var calls = 0
  var handler = {
    getPropertyDescriptor: function() {
      ++calls
      return (calls % 2 == 1)
        ? {get: function() { return 5 }, configurable: true}
        : {set: function() { return false }, configurable: true}
    }
  }
  var p = create(handler)
  var o = Object.create(p)
  // Make proxy prototype property read-only after CanPut check.
  try { o.x = 4 } catch (e) { assertInstanceof(e, Error) }
})

TestWithProxies(function(create) {
  var handler = {
    getPropertyDescriptor: function() {
      Object.defineProperty(o, "x", {get: function() { return 5 }});
      return {set: function() {}}
    }
  }
  var p = create(handler)
  var o = Object.create(p)
  // Make object property read-only after CanPut check.
  try { o.x = 4 } catch (e) { assertInstanceof(e, Error) }
})


// ---------------------------------------------------------------------------
// Property definition (Object.defineProperty and Object.defineProperties).

var key
var desc

function TestDefine(handler) {
  TestWithProxies(TestDefine2, handler)
}

function TestDefine2(create, handler) {
  var p = create(handler)
  assertEquals(p, Object.defineProperty(p, "a", {value: 44}))
  assertEquals("a", key)
  assertEquals(1, Object.getOwnPropertyNames(desc).length)
  assertEquals(44, desc.value)

  assertEquals(p, Object.defineProperty(p, "b", {value: 45, writable: false}))
  assertEquals("b", key)
  assertEquals(2, Object.getOwnPropertyNames(desc).length)
  assertEquals(45, desc.value)
  assertEquals(false, desc.writable)

  assertEquals(p, Object.defineProperty(p, "c", {value: 46, enumerable: false}))
  assertEquals("c", key)
  assertEquals(2, Object.getOwnPropertyNames(desc).length)
  assertEquals(46, desc.value)
  assertEquals(false, desc.enumerable)

  assertEquals(p, Object.defineProperty(p, 101, {value: 47, enumerable: false}))
  assertEquals("101", key)
  assertEquals(2, Object.getOwnPropertyNames(desc).length)
  assertEquals(47, desc.value)
  assertEquals(false, desc.enumerable)

  var attributes = {configurable: true, mine: 66, minetoo: 23}
  assertEquals(p, Object.defineProperty(p, "d", attributes))
  assertEquals("d", key);
  // Modifying the attributes object after the fact should have no effect.
  attributes.configurable = false
  attributes.mine = 77
  delete attributes.minetoo;
  assertEquals(1, Object.getOwnPropertyNames(desc).length)
  assertEquals(true, desc.configurable)
  assertEquals(undefined, desc.mine)
  assertEquals(undefined, desc.minetoo)

  assertEquals(p, Object.defineProperty(p, "e", {get: function(){ return 5 }}))
  assertEquals("e", key)
  assertEquals(1, Object.getOwnPropertyNames(desc).length)
  assertEquals(5, desc.get())

  assertEquals(p, Object.defineProperty(p, "zzz", {}))
  assertEquals("zzz", key)
  assertEquals(0, Object.getOwnPropertyNames(desc).length)

  var props = {
    '11': {},
    blub: {get: function() { return true }},
    '': {get value() { return 20 }},
    last: {value: 21, configurable: true, mine: "eyes"}
  }
  Object.defineProperty(props, "hidden", {value: "hidden", enumerable: false})
  assertEquals(p, Object.defineProperties(p, props))
  assertEquals("last", key)
  assertEquals(2, Object.getOwnPropertyNames(desc).length)
  assertEquals(21, desc.value)
  assertEquals(true, desc.configurable)
  assertEquals(undefined, desc.mine)  // Arguably a bug in the spec...

  var props = {bla: {get value() { throw "myexn" }}}
  assertThrowsEquals(function(){ Object.defineProperties(p, props) }, "myexn")
}

TestDefine({
  defineProperty(t, k, d) { key = k; desc = d; return true }
})

TestDefine({
  defineProperty(t, k, d) { return this.defineProperty2(k, d) },
  defineProperty2(k, d) { key = k; desc = d; return true }
})


// ---------------------------------------------------------------------------
function TestDefineThrow(handler) {
  TestWithProxies(TestDefineThrow2, handler)
}

function TestDefineThrow2(create, handler) {
  var p = create(handler)
  assertThrowsEquals(() => Object.defineProperty(p, "a", {value: 44}), "myexn")
  assertThrowsEquals(() => Object.defineProperty(p, 0, {value: 44}), "myexn")

  var d1 = create({
    get: function(r, k) { throw "myexn" },
    getOwnPropertyNames: function() { return ["value"] }
  })
  assertThrowsEquals(function(){ Object.defineProperty(p, "p", d1) }, "myexn")
  var d2 = create({
    get: function(r, k) { return 77 },
    getOwnPropertyNames: function() { throw "myexn" }
  })
  assertThrowsEquals(function(){ Object.defineProperty(p, "p", d2) }, "myexn")

  var props = {bla: {get value() { throw "otherexn" }}}
  assertThrowsEquals(() => Object.defineProperties(p, props), "otherexn")
}

TestDefineThrow({
  defineProperty: function(k, d) { throw "myexn" }
})

TestDefineThrow({
  defineProperty: function(k, d) { return this.defineProperty2(k, d) },
  defineProperty2: function(k, d) { throw "myexn" }
})

TestDefineThrow(new Proxy({}, {
  get: function(pr, pk) { throw "myexn" }
}))

TestDefineThrow(new Proxy({}, {
  get: function(pr, pk) {
    return function(k, d) { throw "myexn" }
  }
}))



// ---------------------------------------------------------------------------
// Property deletion (delete).

var key

function TestDelete(handler) {
  TestWithProxies(TestDelete2, handler)
}

function TestDelete2(create, handler) {
  var p = create(handler)
  assertEquals(true, delete p.a)
  assertEquals("a", key)
  assertEquals(true, delete p["b"])
  assertEquals("b", key)
  assertEquals(true, delete p[1])
  assertEquals("1", key)

  assertEquals(false, delete p.z1)
  assertEquals("z1", key)
  assertEquals(false, delete p["z2"])
  assertEquals("z2", key);

  (function() {
    "use strict"
    assertEquals(true, delete p.c)
    assertEquals("c", key)
    assertEquals(true, delete p["d"])
    assertEquals("d", key)
    assertEquals(true, delete p[2])
    assertEquals("2", key)

    assertThrows(function(){ delete p.z3 }, TypeError)
    assertEquals("z3", key)
    assertThrows(function(){ delete p["z4"] }, TypeError)
    assertEquals("z4", key)
  })()
}

TestDelete({
  deleteProperty(target, k) { key = k; return k < "z" }
})

TestDelete({
  deleteProperty(target, k) { return this.delete2(k) },
  delete2: function(k) { key = k; return k < "z" }
})

TestDelete(new Proxy({}, {
  get(pt, pk, pr) {
    return (target, k) => { key = k; return k < "z" }
  }
}))


// ---------------------------------------------------------------------------
function TestDeleteThrow(handler) {
  TestWithProxies(TestDeleteThrow2, handler)
}

function TestDeleteThrow2(create, handler) {
  var p = create(handler)
  assertThrowsEquals(function(){ delete p.a }, "myexn")
  assertThrowsEquals(function(){ delete p["b"] }, "myexn");
  assertThrowsEquals(function(){ delete p[3] }, "myexn");

  (function() {
    "use strict"
    assertThrowsEquals(function(){ delete p.c }, "myexn")
    assertThrowsEquals(function(){ delete p["d"] }, "myexn")
    assertThrowsEquals(function(){ delete p[4] }, "myexn");
  })()
}

TestDeleteThrow({
  deleteProperty(t, k) { throw "myexn" }
})

TestDeleteThrow({
  deleteProperty(t, k) { return this.delete2(k) },
  delete2(k) { throw "myexn" }
})

TestDeleteThrow(new Proxy({}, {
  get(pt, pk, pr) { throw "myexn" }
}))

TestDeleteThrow(new Proxy({}, {
  get(pt, pk, pr) {
    return (k) => { throw "myexn" }
  }
}))


// ---------------------------------------------------------------------------
// Property descriptors (Object.getOwnPropertyDescriptor).

function TestDescriptor(handler) {
  TestWithProxies(TestDescriptor2, handler)
}

function TestDescriptor2(create, handler) {
  var p = create(handler)
  var descs = [
    {configurable: true},
    {value: 34, enumerable: true, configurable: true},
    {value: 3, writable: false, mine: "eyes", configurable: true},
    {get value() { return 20 }, get configurable() { return true }},
    {get: function() { "get" }, set: function() { "set" }, configurable: true}
  ]
  for (var i = 0; i < descs.length; ++i) {
    assertEquals(p, Object.defineProperty(p, i, descs[i]))
    var desc = Object.getOwnPropertyDescriptor(p, i)
    for (prop in descs[i]) {
      // TODO(rossberg): Ignore user attributes as long as the spec isn't
      // fixed suitably.
      if (prop != "mine") assertEquals(descs[i][prop], desc[prop])
    }
    assertEquals(undefined, Object.getOwnPropertyDescriptor(p, "absent"))
  }
}

TestDescriptor({
  defineProperty(t, k, d) { this["__" + k] = d; return true },
  getOwnPropertyDescriptor(t, k) { return this["__" + k] }
})

TestDescriptor({
  defineProperty(t, k, d) { this["__" + k] = d; return true },
  getOwnPropertyDescriptor(t, k) {
    return this.getOwnPropertyDescriptor2(k)
  },
  getOwnPropertyDescriptor2: function(k) { return this["__" + k] }
})


// ---------------------------------------------------------------------------
function TestDescriptorThrow(handler) {
  TestWithProxies(TestDescriptorThrow2, handler)
}

function TestDescriptorThrow2(create, handler) {
  var p = create(handler)
  assertThrowsEquals(() => Object.getOwnPropertyDescriptor(p, "a"), "myexn")
}

TestDescriptorThrow({
  getOwnPropertyDescriptor: function(k) { throw "myexn" }
})

TestDescriptorThrow({
  getOwnPropertyDescriptor: function(k) {
    return this.getOwnPropertyDescriptor2(k)
  },
  getOwnPropertyDescriptor2: function(k) { throw "myexn" }
})



// ---------------------------------------------------------------------------
// Comparison.

function TestComparison(eq) {
  TestWithProxies(TestComparison2, eq)
}

function TestComparison2(create, eq) {
  var p1 = create({})
  var p2 = create({})

  assertTrue(eq(p1, p1))
  assertTrue(eq(p2, p2))
  assertTrue(!eq(p1, p2))
  assertTrue(!eq(p1, {}))
  assertTrue(!eq({}, p2))
  assertTrue(!eq({}, {}))
}

TestComparison(function(o1, o2) { return o1 == o2 })
TestComparison(function(o1, o2) { return o1 === o2 })
TestComparison(function(o1, o2) { return !(o1 != o2) })
TestComparison(function(o1, o2) { return !(o1 !== o2) })



// Type (typeof).

function TestTypeof() {
  assertEquals("object", typeof new Proxy({},{}))
  assertTrue(typeof new Proxy({}, {}) == "object")
  assertTrue("object" == typeof new Proxy({},{}))

  assertEquals("function", typeof new Proxy(function() {}, {}))
  assertTrue(typeof new Proxy(function() {}, {}) == "function")
  assertTrue("function" == typeof new Proxy(function() {},{}))
}

TestTypeof()



// ---------------------------------------------------------------------------
// Membership test (in).

var key

function TestIn(handler) {
  TestWithProxies(TestIn2, handler)
}

function TestIn2(create, handler) {
  var p = create(handler)
  assertTrue("a" in p)
  assertEquals("a", key)
  assertTrue(99 in p)
  assertEquals("99", key)
  assertFalse("z" in p)
  assertEquals("z", key)

  assertEquals(2, ("a" in p) ? 2 : 0)
  assertEquals(0, !("a" in p) ? 2 : 0)
  assertEquals(0, ("zzz" in p) ? 2 : 0)
  assertEquals(2, !("zzz" in p) ? 2 : 0)

  // Test compilation in conditionals.
  if ("b" in p) {
  } else {
    assertTrue(false)
  }
  assertEquals("b", key)

  if ("zz" in p) {
    assertTrue(false)
  }
  assertEquals("zz", key)

  if (!("c" in p)) {
    assertTrue(false)
  }
  assertEquals("c", key)

  if (!("zzz" in p)) {
  } else {
    assertTrue(false)
  }
  assertEquals("zzz", key)
}

TestIn({
  has(t, k) { key = k; return k < "z" }
})

TestIn({
  has(t, k) { return this.has2(k) },
  has2(k) { key = k; return k < "z" }
})

TestIn(new Proxy({},{
  get(pt, pk, pr) {
    return (t, k) => { key = k; return k < "z" }
  }
}))


// ---------------------------------------------------------------------------
function TestInThrow(handler) {
  TestWithProxies(TestInThrow2, handler)
}

function TestInThrow2(create, handler) {
  var p = create(handler)
  assertThrowsEquals(function(){ return "a" in p }, "myexn")
  assertThrowsEquals(function(){ return 99 in p }, "myexn")
  assertThrowsEquals(function(){ return !("a" in p) }, "myexn")
  assertThrowsEquals(function(){ return ("a" in p) ? 2 : 3 }, "myexn")
  assertThrowsEquals(function(){ if ("b" in p) {} }, "myexn")
  assertThrowsEquals(function(){ if (!("b" in p)) {} }, "myexn")
  assertThrowsEquals(function(){ if ("zzz" in p) {} }, "myexn")
}

TestInThrow({
  has: function(k) { throw "myexn" }
})

TestInThrow({
  has: function(k) { return this.has2(k) },
  has2: function(k) { throw "myexn" }
})

TestInThrow(new Proxy({},{
  get: function(pr, pk) { throw "myexn" }
}))

TestInThrow(new Proxy({},{
  get: function(pr, pk) {
    return function(k) { throw "myexn" }
  }
}))



// ---------------------------------------------------------------------------
// Own Properties (Object.prototype.hasOwnProperty).

var key

function TestHasOwn(handler) {
  TestWithProxies(TestHasOwn2, handler)
}

function TestHasOwn2(create, handler) {
  var p = create(handler)
  assertTrue(Object.prototype.hasOwnProperty.call(p, "a"))
  assertEquals("a", key)
  assertTrue(Object.prototype.hasOwnProperty.call(p, 99))
  assertEquals("99", key)
  assertFalse(Object.prototype.hasOwnProperty.call(p, "z"))
  assertEquals("z", key)
}

TestHasOwn({
  getOwnPropertyDescriptor(t, k) {
    key = k; if (k < "z") return {configurable: true}
  },
  has() { assertUnreachable() }
})

TestHasOwn({
  getOwnPropertyDescriptor(t, k) { return this.getOwnPropertyDescriptor2(k) },
  getOwnPropertyDescriptor2(k) {
    key = k; if (k < "z") return {configurable: true}
  }
})



// ---------------------------------------------------------------------------
function TestHasOwnThrow(handler) {
  TestWithProxies(TestHasOwnThrow2, handler)
}

function TestHasOwnThrow2(create, handler) {
  var p = create(handler)
  assertThrowsEquals(function(){ Object.prototype.hasOwnProperty.call(p, "a")},
    "myexn")
  assertThrowsEquals(function(){ Object.prototype.hasOwnProperty.call(p, 99)},
    "myexn")
}

TestHasOwnThrow({
  getOwnPropertyDescriptor(t, k) { throw "myexn" }
})

TestHasOwnThrow({
  getOwnPropertyDescriptor(t, k) { return this.getOwnPropertyDescriptor2(k) },
  getOwnPropertyDescriptor2(k) { throw "myexn" }
});


// ---------------------------------------------------------------------------
// Instanceof (instanceof)

(function TestProxyInstanceof() {
  var o1 = {}
  var p1 = new Proxy({}, {})
  var p2 = new Proxy(o1, {})
  var p3 = new Proxy(p2, {})
  var o2 = Object.create(p2)

  var f0 = function() {}
  f0.prototype = o1
  var f1 = function() {}
  f1.prototype = p1
  var f2 = function() {}
  f2.prototype = p2
  var f3 = function() {}
  f3.prototype = o2

  assertTrue(o1 instanceof Object)
  assertFalse(o1 instanceof f0)
  assertFalse(o1 instanceof f1)
  assertFalse(o1 instanceof f2)
  assertFalse(o1 instanceof f3)
  assertTrue(p1 instanceof Object)
  assertFalse(p1 instanceof f0)
  assertFalse(p1 instanceof f1)
  assertFalse(p1 instanceof f2)
  assertFalse(p1 instanceof f3)
  assertTrue(p2 instanceof Object)
  assertFalse(p2 instanceof f0)
  assertFalse(p2 instanceof f1)
  assertFalse(p2 instanceof f2)
  assertFalse(p2 instanceof f3)
  assertTrue(p3 instanceof Object)
  assertFalse(p3 instanceof f0)
  assertFalse(p3 instanceof f1)
  assertFalse(p3 instanceof f2)
  assertFalse(p3 instanceof f3)
  assertTrue(o2 instanceof Object)
  assertFalse(o2 instanceof f0)
  assertFalse(o2 instanceof f1)
  assertTrue(o2 instanceof f2)
  assertFalse(o2 instanceof f3)

  var f = new Proxy(function() {}, {})
  assertTrue(f instanceof Function)
})();


(function TestInstanceofProxy() {
  var o0 = Object.create(null)
  var o1 = {}
  var o2 = Object.create(o0)
  var o3 = Object.create(o1)
  var o4 = Object.create(o2)
  var o5 = Object.create(o3)

  function handler(o) {
    return {
      get: function(r, p) {
        // We want to test prototype lookup, so ensure the proxy
        // offers OrdinaryHasInstance behavior.
        if (p === Symbol.hasInstance) {
          return undefined;
        }
        return o;
      }
    }
  }

  var f0 = new Proxy(function() {}, handler(o0))
  var f1 = new Proxy(function() {}, handler(o1))
  var f2 = new Proxy(function() {}, handler(o2))
  var f3 = new Proxy(function() {}, handler(o3))
  var f4 = new Proxy(function() {}, handler(o4))
  var f5 = new Proxy(function() {}, handler(o4))

  assertFalse(null instanceof f0)
  assertFalse(o0 instanceof f0)
  assertFalse(o0 instanceof f1)
  assertFalse(o0 instanceof f2)
  assertFalse(o0 instanceof f3)
  assertFalse(o0 instanceof f4)
  assertFalse(o0 instanceof f5)
  assertFalse(o1 instanceof f0)
  assertFalse(o1 instanceof f1)
  assertFalse(o1 instanceof f2)
  assertFalse(o1 instanceof f3)
  assertFalse(o1 instanceof f4)
  assertFalse(o1 instanceof f5)
  assertTrue(o2 instanceof f0)
  assertFalse(o2 instanceof f1)
  assertFalse(o2 instanceof f2)
  assertFalse(o2 instanceof f3)
  assertFalse(o2 instanceof f4)
  assertFalse(o2 instanceof f5)
  assertFalse(o3 instanceof f0)
  assertTrue(o3 instanceof f1)
  assertFalse(o3 instanceof f2)
  assertFalse(o3 instanceof f3)
  assertFalse(o3 instanceof f4)
  assertFalse(o3 instanceof f5)
  assertTrue(o4 instanceof f0)
  assertFalse(o4 instanceof f1)
  assertTrue(o4 instanceof f2)
  assertFalse(o4 instanceof f3)
  assertFalse(o4 instanceof f4)
  assertFalse(o4 instanceof f5)
  assertFalse(o5 instanceof f0)
  assertTrue(o5 instanceof f1)
  assertFalse(o5 instanceof f2)
  assertTrue(o5 instanceof f3)
  assertFalse(o5 instanceof f4)
  assertFalse(o5 instanceof f5)

  var f = new Proxy(function() {}, {})
  var ff = new Proxy(function() {}, handler(Function))
  assertTrue(f instanceof Function)
  assertFalse(f instanceof ff)
})();


// ---------------------------------------------------------------------------
// Prototype (Object.getPrototypeOf, Object.prototype.isPrototypeOf).

(function TestPrototype() {
  var o1 = {}
  var p1 = new Proxy({}, {})
  var p2 = new Proxy(o1, {})
  var p3 = new Proxy(p2, {})
  var o2 = Object.create(p3)

  assertSame(Object.getPrototypeOf(o1), Object.prototype)
  assertSame(Object.getPrototypeOf(p1), Object.prototype)
  assertSame(Object.getPrototypeOf(p2), Object.prototype)
  assertSame(Object.getPrototypeOf(p3), Object.prototype)
  assertSame(Object.getPrototypeOf(o2), p3)

  assertTrue(Object.prototype.isPrototypeOf(o1))
  assertTrue(Object.prototype.isPrototypeOf(p1))
  assertTrue(Object.prototype.isPrototypeOf(p2))
  assertTrue(Object.prototype.isPrototypeOf(p3))
  assertTrue(Object.prototype.isPrototypeOf(o2))
  assertTrue(Object.prototype.isPrototypeOf.call(Object.prototype, o1))
  assertTrue(Object.prototype.isPrototypeOf.call(Object.prototype, p1))
  assertTrue(Object.prototype.isPrototypeOf.call(Object.prototype, p2))
  assertTrue(Object.prototype.isPrototypeOf.call(Object.prototype, p3))
  assertTrue(Object.prototype.isPrototypeOf.call(Object.prototype, o2))
  assertFalse(Object.prototype.isPrototypeOf.call(o1, o1))
  assertFalse(Object.prototype.isPrototypeOf.call(o1, p1))
  assertFalse(Object.prototype.isPrototypeOf.call(o1, p2))
  assertFalse(Object.prototype.isPrototypeOf.call(o1, p3))
  assertFalse(Object.prototype.isPrototypeOf.call(o1, o2))
  assertFalse(Object.prototype.isPrototypeOf.call(p1, p1))
  assertFalse(Object.prototype.isPrototypeOf.call(p1, o1))
  assertFalse(Object.prototype.isPrototypeOf.call(p1, p2))
  assertFalse(Object.prototype.isPrototypeOf.call(p1, p3))
  assertFalse(Object.prototype.isPrototypeOf.call(p1, o2))
  assertFalse(Object.prototype.isPrototypeOf.call(p2, p1))
  assertFalse(Object.prototype.isPrototypeOf.call(p2, p2))
  assertFalse(Object.prototype.isPrototypeOf.call(p2, p3))
  assertFalse(Object.prototype.isPrototypeOf.call(p2, o2))
  assertFalse(Object.prototype.isPrototypeOf.call(p3, p2))
  assertTrue(Object.prototype.isPrototypeOf.call(p3, o2))
  assertFalse(Object.prototype.isPrototypeOf.call(o2, o1))
  assertFalse(Object.prototype.isPrototypeOf.call(o2, p1))
  assertFalse(Object.prototype.isPrototypeOf.call(o2, p2))
  assertFalse(Object.prototype.isPrototypeOf.call(o2, p3))
  assertFalse(Object.prototype.isPrototypeOf.call(o2, o2))

  var f = new Proxy(function() {}, {})
  assertSame(Object.getPrototypeOf(f), Function.prototype)
  assertTrue(Object.prototype.isPrototypeOf(f))
  assertTrue(Object.prototype.isPrototypeOf.call(Function.prototype, f))
})();


// ---------------------------------------------------------------------------
function TestPropertyNamesThrow(handler) {
  TestWithProxies(TestPropertyNamesThrow2, handler)
}

function TestPropertyNamesThrow2(create, handler) {
  var p = create(handler)
  assertThrowsEquals(function(){ Object.getOwnPropertyNames(p) }, "myexn")
}

TestPropertyNamesThrow({
  ownKeys() { throw "myexn" }
})

TestPropertyNamesThrow({
  ownKeys() { return this.getOwnPropertyNames2() },
  getOwnPropertyNames2() { throw "myexn" }
})

// ---------------------------------------------------------------------------

function TestKeys(names, handler) {
  var p = new Proxy({}, handler);
  assertArrayEquals(names, Object.keys(p))
}

TestKeys([], {
  ownKeys() { return [] }
})

TestKeys([], {
  ownKeys() { return ["a", "zz", " ", "0", "toString"] }
})

TestKeys(["a", "zz", " ", "0", "toString"], {
  ownKeys() { return ["a", "zz", " ", "0", "toString"] },
  getOwnPropertyDescriptor(t, p) {
    return {configurable: true, enumerable: true}
  }
})

TestKeys([], {
  ownKeys() { return this.keys2() },
  keys2() { return ["throw", "function "] }
})

TestKeys(["throw", "function "], {
  ownKeys() { return this.keys2() },
  keys2() { return ["throw", "function "] },
  getOwnPropertyDescriptor(t, p) {
    return {configurable: true, enumerable: true}
  }
})

TestKeys(["a", "0"], {
  ownKeys() { return ["a", "23", "zz", "", "0"] },
  getOwnPropertyDescriptor(t, k) {
    return k == "" ?
        undefined :
        { configurable: true, enumerable: k.length == 1}
  }
})

TestKeys(["23", "zz", ""], {
  ownKeys() { return this.getOwnPropertyNames2() },
  getOwnPropertyNames2() { return ["a", "23", "zz", "", "0"] },
  getOwnPropertyDescriptor(t, k) {
    return this.getOwnPropertyDescriptor2(k)
  },
  getOwnPropertyDescriptor2(k) {
    return {configurable: true, enumerable: k.length != 1 }
  }
})

TestKeys([], {
  get ownKeys() {
    return function() { return ["a", "b", "c"] }
  },
  getOwnPropertyDescriptor: function(k) { return {configurable: true} }
})


// ---------------------------------------------------------------------------
function TestKeysThrow(handler) {
  TestWithProxies(TestKeysThrow2, handler)
}

function TestKeysThrow2(create, handler) {
  var p = create(handler);
  assertThrowsEquals(function(){ Object.keys(p) }, "myexn");
}

TestKeysThrow({
  ownKeys() { throw "myexn" }
})

TestKeysThrow({
  ownKeys() { return this.keys2() },
  keys2() { throw "myexn" }
})

TestKeysThrow({
  ownKeys() { return ['1'] },
  getOwnPropertyDescriptor: function() { throw "myexn" },
})

TestKeysThrow({
  ownKeys() { return this.getOwnPropertyNames2() },
  getOwnPropertyNames2() { return ['1', '2'] },
  getOwnPropertyDescriptor(k) {
    return this.getOwnPropertyDescriptor2(k)
  },
  getOwnPropertyDescriptor2(k) { throw "myexn" }
})

TestKeysThrow({
  get ownKeys() { throw "myexn" }
})

TestKeysThrow({
  get ownKeys() {
    return function() { throw "myexn" }
  },
})

TestKeysThrow({
  get ownKeys() {
    return function() { return ['1', '2'] }
  },
  getOwnPropertyDescriptor(k) { throw "myexn" }
})



// ---------------------------------------------------------------------------
// String conversion (Object.prototype.toString,
//                    Object.prototype.toLocaleString)

var key

function TestToString(handler) {
  var p = new Proxy({}, handler)
  key = ""
  assertEquals("[object Object]", Object.prototype.toString.call(p))
  assertEquals(Symbol.toStringTag, key)
  assertEquals("my_proxy", Object.prototype.toLocaleString.call(p))
  assertEquals("toString", key)

  var f = new Proxy(function() {}, handler)
  key = ""
  assertEquals("[object Function]", Object.prototype.toString.call(f))
  assertEquals(Symbol.toStringTag, key)
  assertEquals("my_proxy", Object.prototype.toLocaleString.call(f))
  assertEquals("toString", key)

  var o = Object.create(p)
  key = ""
  assertEquals("[object Object]", Object.prototype.toString.call(o))
  assertEquals(Symbol.toStringTag, key)
  assertEquals("my_proxy", Object.prototype.toLocaleString.call(o))
  assertEquals("toString", key)
}

TestToString({
  get: function(r, k) { key = k; return function() { return "my_proxy" } }
})

TestToString({
  get: function(r, k) { return this.get2(r, k) },
  get2: function(r, k) { key = k; return function() { return "my_proxy" } }
})

TestToString(new Proxy({}, {
  get: function(pr, pk) {
    return function(r, k) { key = k; return function() { return "my_proxy" } }
  }
}))


function TestToStringThrow(handler) {
  var p = new Proxy({}, handler)
  assertThrowsEquals(() => Object.prototype.toString.call(p), "myexn")
  assertThrowsEquals(() => Object.prototype.toLocaleString.call(p), "myexn")

  var f = new Proxy(function(){}, handler)
  assertThrowsEquals(() => Object.prototype.toString.call(f), "myexn")
  assertThrowsEquals(() => Object.prototype.toLocaleString.call(f), "myexn")

  var o = Object.create(p)
  assertThrowsEquals(() => Object.prototype.toString.call(o), "myexn")
  assertThrowsEquals(() => Object.prototype.toLocaleString.call(o), "myexn")
}

TestToStringThrow({
  get: function(r, k) { throw "myexn" }
})

TestToStringThrow({
  get: function(r, k) { return this.get2(r, k) },
  get2: function(r, k) { throw "myexn" }
})

TestToStringThrow(new Proxy({}, {
  get: function(pr, pk) { throw "myexn" }
}))

TestToStringThrow(new Proxy({}, {
  get: function(pr, pk) {
    return function(r, k) { throw "myexn" }
  }
}))


// ---------------------------------------------------------------------------
// Value conversion (Object.prototype.toValue)

function TestValueOf(handler) {
  TestWithProxies(TestValueOf2, handler)
}

function TestValueOf2(create, handler) {
  var p = create(handler)
  assertSame(p, Object.prototype.valueOf.call(p))
}

TestValueOf({})



// ---------------------------------------------------------------------------
// Enumerability (Object.prototype.propertyIsEnumerable)

var key

function TestIsEnumerable(handler) {
  TestWithProxies(TestIsEnumerable2, handler)
}

function TestIsEnumerable2(create, handler) {
  var p = create(handler)
  assertTrue(Object.prototype.propertyIsEnumerable.call(p, "a"))
  assertEquals("a", key)
  assertTrue(Object.prototype.propertyIsEnumerable.call(p, 2))
  assertEquals("2", key)
  assertFalse(Object.prototype.propertyIsEnumerable.call(p, "z"))
  assertEquals("z", key)

  var o = Object.create(p)
  key = ""
  assertFalse(Object.prototype.propertyIsEnumerable.call(o, "a"))
  assertEquals("", key)  // trap not invoked
}

TestIsEnumerable({
  getOwnPropertyDescriptor(t, k) {
    key = k;
    return {enumerable: k < "z", configurable: true}
  },
})

TestIsEnumerable({
  getOwnPropertyDescriptor: function(t, k) {
    return this.getOwnPropertyDescriptor2(k)
  },
  getOwnPropertyDescriptor2: function(k) {
    key = k;
    return {enumerable: k < "z", configurable: true}
  },
})

TestIsEnumerable({
  getOwnPropertyDescriptor: function(t, k) {
    key = k;
    return {get enumerable() { return k < "z" }, configurable: true}
  },
})

TestIsEnumerable(new Proxy({}, {
  get: function(pt, pk, pr) {
    return function(t, k) {
      key = k;
      return {enumerable: k < "z", configurable: true}
    }
  }
}))


// ---------------------------------------------------------------------------
function TestIsEnumerableThrow(handler) {
  TestWithProxies(TestIsEnumerableThrow2, handler)
}

function TestIsEnumerableThrow2(create, handler) {
  var p = create(handler)
  assertThrowsEquals(() => Object.prototype.propertyIsEnumerable.call(p, "a"),
      "myexn")
  assertThrowsEquals(() => Object.prototype.propertyIsEnumerable.call(p, 11),
      "myexn")
}

TestIsEnumerableThrow({
  getOwnPropertyDescriptor: function(k) { throw "myexn" }
})

TestIsEnumerableThrow({
  getOwnPropertyDescriptor: function(k) {
    return this.getOwnPropertyDescriptor2(k)
  },
  getOwnPropertyDescriptor2: function(k) { throw "myexn" }
})

TestIsEnumerableThrow({
  getOwnPropertyDescriptor: function(k) {
    return {get enumerable() { throw "myexn" }, configurable: true}
  },
})

TestIsEnumerableThrow(new Proxy({}, {
  get: function(pr, pk) { throw "myexn" }
}))

TestIsEnumerableThrow(new Proxy({}, {
  get: function(pr, pk) {
    return function(k) { throw "myexn" }
  }
}));



// ---------------------------------------------------------------------------
// Constructor functions with proxy prototypes.

(function TestConstructorWithProxyPrototype() {
  TestWithProxies(TestConstructorWithProxyPrototype2, {})
})();

function TestConstructorWithProxyPrototype2(create, handler) {
  function C() {};
  C.prototype = create(handler);

  var o = new C;
  assertSame(C.prototype, Object.getPrototypeOf(o));
};


(function TestOptWithProxyPrototype() {
  var handler = {
    get(t, k) {
      return 10;
    }
  };

  function C() {};
  C.prototype = new Proxy({}, handler);
  var o = new C();

  function f() {
    return o.x;
  }
  %PrepareFunctionForOptimization(f);
  assertEquals(10, f());
  assertEquals(10, f());
  %OptimizeFunctionOnNextCall(f);
  assertEquals(10, f());
})();
