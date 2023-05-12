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

// Copyright 2012-2015 the V8 project authors. All rights reserved.
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

// Tests the Reflect.defineProperty method - ES6 26.1.3
// This is adapted from mjsunit/object-define-property.js.

// Flags: --allow-natives-syntax


// Check that an exception is thrown when null is passed as object.
var exception = false;
try {
  Reflect.defineProperty(null, null, null);
} catch (e) {
  exception = true;
  assertTrue(/called on non-object/.test(e));
}
assertTrue(exception);

// Check that an exception is thrown when undefined is passed as object.
exception = false;
try {
  Reflect.defineProperty(undefined, undefined, undefined);
} catch (e) {
  exception = true;
  assertTrue(/called on non-object/.test(e));
}
assertTrue(exception);

// Check that an exception is thrown when non-object is passed as object.
exception = false;
try {
  Reflect.defineProperty(0, "foo", undefined);
} catch (e) {
  exception = true;
  assertTrue(/called on non-object/.test(e));
}
assertTrue(exception);

// Object.
var obj1 = {};

// Values.
var val1 = 0;
var val2 = 0;
var val3 = 0;

function setter1() {val1++; }
function getter1() {return val1; }

function setter2() {val2++; }
function getter2() {return val2; }

function setter3() {val3++; }
function getter3() {return val3; }


// Descriptors.
var emptyDesc = {};

var accessorConfigurable = {
    set: setter1,
    get: getter1,
    configurable: true
};

var accessorNoConfigurable = {
    set: setter2,
    get: getter2,
    configurable: false
};

var accessorOnlySet = {
  set: setter3,
  configurable: true
};

var accessorOnlyGet = {
  get: getter3,
  configurable: true
};

var accessorDefault = {set: function(){} };

var dataConfigurable = { value: 1000, configurable: true };

var dataNoConfigurable = { value: 2000, configurable: false };

var dataWritable = { value: 3000, writable: true};


// Check that we can't add property with undefined attributes.
assertThrows(function() { Reflect.defineProperty(obj1, "foo", undefined) },
  TypeError);

// Make sure that we can add a property with an empty descriptor and
// that it has the default descriptor values.
assertTrue(Reflect.defineProperty(obj1, "foo", emptyDesc));

// foo should be undefined as it has no get, set or value
assertEquals(undefined, obj1.foo);

// We should, however, be able to retrieve the propertydescriptor which should
// have all default values (according to 8.6.1).
var desc = Object.getOwnPropertyDescriptor(obj1, "foo");
assertFalse(desc.configurable);
assertFalse(desc.enumerable);
assertFalse(desc.writable);
assertEquals(desc.get, undefined);
assertEquals(desc.set, undefined);
assertEquals(desc.value, undefined);

// Make sure that getOwnPropertyDescriptor does not return a descriptor
// with default values if called with non existing property (otherwise
// the test above is invalid).
desc = Object.getOwnPropertyDescriptor(obj1, "bar");
assertEquals(desc, undefined);

// Make sure that foo can't be reset (as configurable is false).
assertFalse(Reflect.defineProperty(obj1, "foo", accessorConfigurable));


// Accessor properties

assertTrue(Reflect.defineProperty(obj1, "bar", accessorConfigurable));
desc = Object.getOwnPropertyDescriptor(obj1, "bar");
assertTrue(desc.configurable);
assertFalse(desc.enumerable);
assertEquals(desc.writable, undefined);
assertEquals(desc.get, accessorConfigurable.get);
assertEquals(desc.set, accessorConfigurable.set);
assertEquals(desc.value, undefined);
assertEquals(1, obj1.bar = 1);
assertEquals(1, val1);
assertEquals(1, obj1.bar = 1);
assertEquals(2, val1);
assertEquals(2, obj1.bar);

// Redefine bar with non configurable test
assertTrue(Reflect.defineProperty(obj1, "bar", accessorNoConfigurable));
desc = Object.getOwnPropertyDescriptor(obj1, "bar");
assertFalse(desc.configurable);
assertFalse(desc.enumerable);
assertEquals(desc.writable, undefined);
assertEquals(desc.get, accessorNoConfigurable.get);
assertEquals(desc.set, accessorNoConfigurable.set);
assertEquals(desc.value, undefined);
assertEquals(1, obj1.bar = 1);
assertEquals(2, val1);
assertEquals(1, val2);
assertEquals(1, obj1.bar = 1)
assertEquals(2, val1);
assertEquals(2, val2);
assertEquals(2, obj1.bar);

// Try to redefine bar again - should fail as configurable is false.
assertFalse(Reflect.defineProperty(obj1, "bar", accessorConfigurable));

// Try to redefine bar again using the data descriptor - should fail.
assertFalse(Reflect.defineProperty(obj1, "bar", dataConfigurable));

// Redefine using same descriptor - should succeed.
assertTrue(Reflect.defineProperty(obj1, "bar", accessorNoConfigurable));
desc = Object.getOwnPropertyDescriptor(obj1, "bar");
assertFalse(desc.configurable);
assertFalse(desc.enumerable);
assertEquals(desc.writable, undefined);
assertEquals(desc.get, accessorNoConfigurable.get);
assertEquals(desc.set, accessorNoConfigurable.set);
assertEquals(desc.value, undefined);
assertEquals(1, obj1.bar = 1);
assertEquals(2, val1);
assertEquals(3, val2);
assertEquals(1, obj1.bar = 1)
assertEquals(2, val1);
assertEquals(4, val2);
assertEquals(4, obj1.bar);

// Define an accessor that has only a setter.
assertTrue(Reflect.defineProperty(obj1, "setOnly", accessorOnlySet));
desc = Object.getOwnPropertyDescriptor(obj1, "setOnly");
assertTrue(desc.configurable);
assertFalse(desc.enumerable);
assertEquals(desc.set, accessorOnlySet.set);
assertEquals(desc.writable, undefined);
assertEquals(desc.value, undefined);
assertEquals(desc.get, undefined);
assertEquals(1, obj1.setOnly = 1);
assertEquals(1, val3);

// Add a getter - should not touch the setter.
assertTrue(Reflect.defineProperty(obj1, "setOnly", accessorOnlyGet));
desc = Object.getOwnPropertyDescriptor(obj1, "setOnly");
assertTrue(desc.configurable);
assertFalse(desc.enumerable);
assertEquals(desc.get, accessorOnlyGet.get);
assertEquals(desc.set, accessorOnlySet.set);
assertEquals(desc.writable, undefined);
assertEquals(desc.value, undefined);
assertEquals(1, obj1.setOnly = 1);
assertEquals(2, val3);

// The above should also work if redefining just a getter or setter on
// an existing property with both a getter and a setter.
assertTrue(Reflect.defineProperty(obj1, "both", accessorConfigurable));

assertTrue(Reflect.defineProperty(obj1, "both", accessorOnlySet));
desc = Object.getOwnPropertyDescriptor(obj1, "both");
assertTrue(desc.configurable);
assertFalse(desc.enumerable);
assertEquals(desc.set, accessorOnlySet.set);
assertEquals(desc.get, accessorConfigurable.get);
assertEquals(desc.writable, undefined);
assertEquals(desc.value, undefined);
assertEquals(1, obj1.both = 1);
assertEquals(3, val3);


// Data properties

assertTrue(Reflect.defineProperty(obj1, "foobar", dataConfigurable));
desc = Object.getOwnPropertyDescriptor(obj1, "foobar");
assertEquals(obj1.foobar, 1000);
assertEquals(desc.value, 1000);
assertTrue(desc.configurable);
assertFalse(desc.writable);
assertFalse(desc.enumerable);
assertEquals(desc.get, undefined);
assertEquals(desc.set, undefined);
//Try writing to non writable attribute - should remain 1000
obj1.foobar = 1001;
assertEquals(obj1.foobar, 1000);


// Redefine to writable descriptor - now writing to foobar should be allowed.
assertTrue(Reflect.defineProperty(obj1, "foobar", dataWritable));
desc = Object.getOwnPropertyDescriptor(obj1, "foobar");
assertEquals(obj1.foobar, 3000);
assertEquals(desc.value, 3000);
// Note that since dataWritable does not define configurable the configurable
// setting from the redefined property (in this case true) is used.
assertTrue(desc.configurable);
assertTrue(desc.writable);
assertFalse(desc.enumerable);
assertEquals(desc.get, undefined);
assertEquals(desc.set, undefined);
// Writing to the property should now be allowed
obj1.foobar = 1001;
assertEquals(obj1.foobar, 1001);


// Redefine with non configurable data property.
assertTrue(Reflect.defineProperty(obj1, "foobar", dataNoConfigurable));
desc = Object.getOwnPropertyDescriptor(obj1, "foobar");
assertEquals(obj1.foobar, 2000);
assertEquals(desc.value, 2000);
assertFalse(desc.configurable);
assertTrue(desc.writable);
assertFalse(desc.enumerable);
assertEquals(desc.get, undefined);
assertEquals(desc.set, undefined);

// Try redefine again - shold fail because configurable is now false.
assertFalse(Reflect.defineProperty(obj1, "foobar", dataConfigurable));

// Try redefine again with accessor property - shold also fail.
assertFalse(Reflect.defineProperty(obj1, "foobar", dataConfigurable));


// Redifine with the same descriptor - should succeed (step 6).
assertTrue(Reflect.defineProperty(obj1, "foobar", dataNoConfigurable));
desc = Object.getOwnPropertyDescriptor(obj1, "foobar");
assertEquals(obj1.foobar, 2000);
assertEquals(desc.value, 2000);
assertFalse(desc.configurable);
assertTrue(desc.writable);
assertFalse(desc.enumerable);
assertEquals(desc.get, undefined);
assertEquals(desc.set, undefined);


// New object
var obj2 = {};

// Make accessor - redefine to data
assertTrue(Reflect.defineProperty(obj2, "foo", accessorConfigurable));

// Redefine to data property
assertTrue(Reflect.defineProperty(obj2, "foo", dataConfigurable));
desc = Object.getOwnPropertyDescriptor(obj2, "foo");
assertEquals(obj2.foo, 1000);
assertEquals(desc.value, 1000);
assertTrue(desc.configurable);
assertFalse(desc.writable);
assertFalse(desc.enumerable);
assertEquals(desc.get, undefined);
assertEquals(desc.set, undefined);


// Redefine back to accessor
assertTrue(Reflect.defineProperty(obj2, "foo", accessorConfigurable));
desc = Object.getOwnPropertyDescriptor(obj2, "foo");
assertTrue(desc.configurable);
assertFalse(desc.enumerable);
assertEquals(desc.writable, undefined);
assertEquals(desc.get, accessorConfigurable.get);
assertEquals(desc.set, accessorConfigurable.set);
assertEquals(desc.value, undefined);
assertEquals(1, obj2.foo = 1);
assertEquals(3, val1);
assertEquals(4, val2);
assertEquals(3, obj2.foo);

// Make data - redefine to accessor
assertTrue(Reflect.defineProperty(obj2, "bar", dataConfigurable))

// Redefine to accessor property
assertTrue(Reflect.defineProperty(obj2, "bar", accessorConfigurable));
desc = Object.getOwnPropertyDescriptor(obj2, "bar");
assertTrue(desc.configurable);
assertFalse(desc.enumerable);
assertEquals(desc.writable, undefined);
assertEquals(desc.get, accessorConfigurable.get);
assertEquals(desc.set, accessorConfigurable.set);
assertEquals(desc.value, undefined);
assertEquals(1, obj2.bar = 1);
assertEquals(4, val1);
assertEquals(4, val2);
assertEquals(4, obj2.foo);

// Redefine back to data property
assertTrue(Reflect.defineProperty(obj2, "bar", dataConfigurable));
desc = Object.getOwnPropertyDescriptor(obj2, "bar");
assertEquals(obj2.bar, 1000);
assertEquals(desc.value, 1000);
assertTrue(desc.configurable);
assertFalse(desc.writable);
assertFalse(desc.enumerable);
assertEquals(desc.get, undefined);
assertEquals(desc.set, undefined);


// Redefinition of an accessor defined using __defineGetter__ and
// __defineSetter__.
function get(){return this.x}
function set(x){this.x=x};

var obj3 = {x:1000};
obj3.__defineGetter__("foo", get);
obj3.__defineSetter__("foo", set);

desc = Object.getOwnPropertyDescriptor(obj3, "foo");
assertTrue(desc.configurable);
assertTrue(desc.enumerable);
assertEquals(desc.writable, undefined);
assertEquals(desc.get, get);
assertEquals(desc.set, set);
assertEquals(desc.value, undefined);
assertEquals(1, obj3.foo = 1);
assertEquals(1, obj3.x);
assertEquals(1, obj3.foo);

// Redefine to accessor property (non configurable) - note that enumerable
// which we do not redefine should remain the same (true).
assertTrue(Reflect.defineProperty(obj3, "foo", accessorNoConfigurable));
desc = Object.getOwnPropertyDescriptor(obj3, "foo");
assertFalse(desc.configurable);
assertTrue(desc.enumerable);
assertEquals(desc.writable, undefined);
assertEquals(desc.get, accessorNoConfigurable.get);
assertEquals(desc.set, accessorNoConfigurable.set);
assertEquals(desc.value, undefined);
assertEquals(1, obj3.foo = 1);
assertEquals(5, val2);
assertEquals(5, obj3.foo);


obj3.__defineGetter__("bar", get);
obj3.__defineSetter__("bar", set);


// Redefine back to data property
assertTrue(Reflect.defineProperty(obj3, "bar", dataConfigurable));
desc = Object.getOwnPropertyDescriptor(obj3, "bar");
assertEquals(obj3.bar, 1000);
assertEquals(desc.value, 1000);
assertTrue(desc.configurable);
assertFalse(desc.writable);
assertTrue(desc.enumerable);
assertEquals(desc.get, undefined);
assertEquals(desc.set, undefined);


var obj4 = {};
var func = function (){return 42;};
obj4.bar = func;
assertEquals(42, obj4.bar());

assertTrue(Reflect.defineProperty(obj4, "bar", accessorConfigurable));
desc = Object.getOwnPropertyDescriptor(obj4, "bar");
assertTrue(desc.configurable);
assertTrue(desc.enumerable);
assertEquals(desc.writable, undefined);
assertEquals(desc.get, accessorConfigurable.get);
assertEquals(desc.set, accessorConfigurable.set);
assertEquals(desc.value, undefined);
assertEquals(1, obj4.bar = 1);
assertEquals(5, val1);
assertEquals(5, obj4.bar);

// Make sure an error is thrown when trying to access to redefined function.
try {
  obj4.bar();
  assertTrue(false);
} catch (e) {
  assertTrue(/is not a function/.test(e));
}


// Test that all possible differences in step 6 in DefineOwnProperty are
// exercised, i.e., any difference in the given property descriptor and the
// existing properties should not return true, but throw an error if the
// existing configurable property is false.

var obj5 = {};
// Enumerable will default to false.
assertTrue(Reflect.defineProperty(obj5, 'foo', accessorNoConfigurable));
desc = Object.getOwnPropertyDescriptor(obj5, 'foo');
// First, test that we are actually allowed to set the accessor if all
// values are of the descriptor are the same as the existing one.
assertTrue(Reflect.defineProperty(obj5, 'foo', accessorNoConfigurable));

// Different setter.
var descDifferent = {
  configurable:false,
  enumerable:false,
  set: setter1,
  get: getter2
};

assertFalse(Reflect.defineProperty(obj5, 'foo', descDifferent));

// Different getter.
descDifferent = {
  configurable:false,
  enumerable:false,
  set: setter2,
  get: getter1
};

assertFalse(Reflect.defineProperty(obj5, 'foo', descDifferent));

// Different enumerable.
descDifferent = {
  configurable:false,
  enumerable:true,
  set: setter2,
  get: getter2
};

assertFalse(Reflect.defineProperty(obj5, 'foo', descDifferent));

// Different configurable.
descDifferent = {
  configurable:false,
  enumerable:true,
  set: setter2,
  get: getter2
};

assertFalse(Reflect.defineProperty(obj5, 'foo', descDifferent));

// No difference.
descDifferent = {
  configurable:false,
  enumerable:false,
  set: setter2,
  get: getter2
};
// Make sure we can still redefine if all properties are the same.
assertTrue(Reflect.defineProperty(obj5, 'foo', descDifferent));

// Make sure that obj5 still holds the original values.
desc = Object.getOwnPropertyDescriptor(obj5, 'foo');
assertEquals(desc.get, getter2);
assertEquals(desc.set, setter2);
assertFalse(desc.enumerable);
assertFalse(desc.configurable);


// Also exercise step 6 on data property, writable and enumerable
// defaults to false.
assertTrue(Reflect.defineProperty(obj5, 'bar', dataNoConfigurable));

// Test that redefinition with the same property descriptor is possible
assertTrue(Reflect.defineProperty(obj5, 'bar', dataNoConfigurable));

// Different value.
descDifferent = {
  configurable:false,
  enumerable:false,
  writable: false,
  value: 1999
};

assertFalse(Reflect.defineProperty(obj5, 'bar', descDifferent));

// Different writable.
descDifferent = {
  configurable:false,
  enumerable:false,
  writable: true,
  value: 2000
};

assertFalse(Reflect.defineProperty(obj5, 'bar', descDifferent));


// Different enumerable.
descDifferent = {
  configurable:false,
  enumerable:true ,
  writable:false,
  value: 2000
};

assertFalse(Reflect.defineProperty(obj5, 'bar', descDifferent));


// Different configurable.
descDifferent = {
  configurable:true,
  enumerable:false,
  writable:false,
  value: 2000
};

assertFalse(Reflect.defineProperty(obj5, 'bar', descDifferent));

// No difference.
descDifferent = {
  configurable:false,
  enumerable:false,
  writable:false,
  value:2000
};
// Make sure we can still redefine if all properties are the same.
assertTrue(Reflect.defineProperty(obj5, 'bar', descDifferent));

// Make sure that obj5 still holds the original values.
desc = Object.getOwnPropertyDescriptor(obj5, 'bar');
assertEquals(desc.value, 2000);
assertFalse(desc.writable);
assertFalse(desc.enumerable);
assertFalse(desc.configurable);


// Make sure that we can't overwrite +0 with -0 and vice versa.
var descMinusZero = {value: -0, configurable: false};
var descPlusZero = {value: +0, configurable: false};

assertTrue(Reflect.defineProperty(obj5, 'minuszero', descMinusZero));

// Make sure we can redefine with -0.
assertTrue(Reflect.defineProperty(obj5, 'minuszero', descMinusZero));

assertFalse(Reflect.defineProperty(obj5, 'minuszero', descPlusZero));


assertTrue(Reflect.defineProperty(obj5, 'pluszero', descPlusZero));

// Make sure we can redefine with +0.
assertTrue(Reflect.defineProperty(obj5, 'pluszero', descPlusZero));

assertFalse(Reflect.defineProperty(obj5, 'pluszero', descMinusZero));


var obj6 = {};
obj6[1] = 'foo';
obj6[2] = 'bar';
obj6[3] = '42';
obj6[4] = '43';
obj6[5] = '44';

var descElement = { value: 'foobar' };
var descElementNonConfigurable = { value: 'barfoo', configurable: false };
var descElementNonWritable = { value: 'foofoo', writable: false };
var descElementNonEnumerable = { value: 'barbar', enumerable: false };
var descElementAllFalse = { value: 'foofalse',
                            configurable: false,
                            writable: false,
                            enumerable: false };


// Redefine existing property.
assertTrue(Reflect.defineProperty(obj6, '1', descElement));
desc = Object.getOwnPropertyDescriptor(obj6, '1');
assertEquals(desc.value, 'foobar');
assertTrue(desc.writable);
assertTrue(desc.enumerable);
assertTrue(desc.configurable);

// Redefine existing property with configurable: false.
assertTrue(Reflect.defineProperty(obj6, '2', descElementNonConfigurable));
desc = Object.getOwnPropertyDescriptor(obj6, '2');
assertEquals(desc.value, 'barfoo');
assertTrue(desc.writable);
assertTrue(desc.enumerable);
assertFalse(desc.configurable);

// Can use defineProperty to change the value of a non
// configurable property.
try {
  assertTrue(Reflect.defineProperty(obj6, '2', descElement));
  desc = Object.getOwnPropertyDescriptor(obj6, '2');
  assertEquals(desc.value, 'foobar');
} catch (e) {
  assertUnreachable();
}

// Ensure that we can't change the descriptor of a
// non configurable property.
var descAccessor = { get: function() { return 0; } };
assertFalse(Reflect.defineProperty(obj6, '2', descAccessor));

assertTrue(Reflect.defineProperty(obj6, '2', descElementNonWritable));
desc = Object.getOwnPropertyDescriptor(obj6, '2');
assertEquals(desc.value, 'foofoo');
assertFalse(desc.writable);
assertTrue(desc.enumerable);
assertFalse(desc.configurable);

assertTrue(Reflect.defineProperty(obj6, '3', descElementNonWritable));
desc = Object.getOwnPropertyDescriptor(obj6, '3');
assertEquals(desc.value, 'foofoo');
assertFalse(desc.writable);
assertTrue(desc.enumerable);
assertTrue(desc.configurable);

// Redefine existing property with configurable: false.
assertTrue(Reflect.defineProperty(obj6, '4', descElementNonEnumerable));
desc = Object.getOwnPropertyDescriptor(obj6, '4');
assertEquals(desc.value, 'barbar');
assertTrue(desc.writable);
assertFalse(desc.enumerable);
assertTrue(desc.configurable);

// Redefine existing property with configurable: false.
assertTrue(Reflect.defineProperty(obj6, '5', descElementAllFalse));
desc = Object.getOwnPropertyDescriptor(obj6, '5');
assertEquals(desc.value, 'foofalse');
assertFalse(desc.writable);
assertFalse(desc.enumerable);
assertFalse(desc.configurable);

// Define non existing property - all attributes should default to false.
assertTrue(Reflect.defineProperty(obj6, '15', descElement));
desc = Object.getOwnPropertyDescriptor(obj6, '15');
assertEquals(desc.value, 'foobar');
assertFalse(desc.writable);
assertFalse(desc.enumerable);
assertFalse(desc.configurable);

// Make sure that we can't redefine using direct access.
obj6[15] ='overwrite';
assertEquals(obj6[15],'foobar');


// Repeat the above tests on an array.
var arr = new Array();
arr[1] = 'foo';
arr[2] = 'bar';
arr[3] = '42';
arr[4] = '43';
arr[5] = '44';

var descElement = { value: 'foobar' };
var descElementNonConfigurable = { value: 'barfoo', configurable: false };
var descElementNonWritable = { value: 'foofoo', writable: false };
var descElementNonEnumerable = { value: 'barbar', enumerable: false };
var descElementAllFalse = { value: 'foofalse',
                            configurable: false,
                            writable: false,
                            enumerable: false };


// Redefine existing property.
assertTrue(Reflect.defineProperty(arr, '1', descElement));
desc = Object.getOwnPropertyDescriptor(arr, '1');
assertEquals(desc.value, 'foobar');
assertTrue(desc.writable);
assertTrue(desc.enumerable);
assertTrue(desc.configurable);

// Redefine existing property with configurable: false.
assertTrue(Reflect.defineProperty(arr, '2', descElementNonConfigurable));
desc = Object.getOwnPropertyDescriptor(arr, '2');
assertEquals(desc.value, 'barfoo');
assertTrue(desc.writable);
assertTrue(desc.enumerable);
assertFalse(desc.configurable);

// Can use defineProperty to change the value of a non
// configurable property of an array.
try {
  assertTrue(Reflect.defineProperty(arr, '2', descElement));
  desc = Object.getOwnPropertyDescriptor(arr, '2');
  assertEquals(desc.value, 'foobar');
} catch (e) {
  assertUnreachable();
}

// Ensure that we can't change the descriptor of a
// non configurable property.
var descAccessor = { get: function() { return 0; } };
assertFalse(Reflect.defineProperty(arr, '2', descAccessor));

assertTrue(Reflect.defineProperty(arr, '2', descElementNonWritable));
desc = Object.getOwnPropertyDescriptor(arr, '2');
assertEquals(desc.value, 'foofoo');
assertFalse(desc.writable);
assertTrue(desc.enumerable);
assertFalse(desc.configurable);

assertTrue(Reflect.defineProperty(arr, '3', descElementNonWritable));
desc = Object.getOwnPropertyDescriptor(arr, '3');
assertEquals(desc.value, 'foofoo');
assertFalse(desc.writable);
assertTrue(desc.enumerable);
assertTrue(desc.configurable);

// Redefine existing property with configurable: false.
assertTrue(Reflect.defineProperty(arr, '4', descElementNonEnumerable));
desc = Object.getOwnPropertyDescriptor(arr, '4');
assertEquals(desc.value, 'barbar');
assertTrue(desc.writable);
assertFalse(desc.enumerable);
assertTrue(desc.configurable);

// Redefine existing property with configurable: false.
assertTrue(Reflect.defineProperty(arr, '5', descElementAllFalse));
desc = Object.getOwnPropertyDescriptor(arr, '5');
assertEquals(desc.value, 'foofalse');
assertFalse(desc.writable);
assertFalse(desc.enumerable);
assertFalse(desc.configurable);

// Define non existing property - all attributes should default to false.
assertTrue(Reflect.defineProperty(arr, '15', descElement));
desc = Object.getOwnPropertyDescriptor(arr, '15');
assertEquals(desc.value, 'foobar');
assertFalse(desc.writable);
assertFalse(desc.enumerable);
assertFalse(desc.configurable);

// Define non-array property, check that .length is unaffected.
assertEquals(16, arr.length);
assertTrue(Reflect.defineProperty(arr, '0x20', descElement));
assertEquals(16, arr.length);

// See issue 968: http://code.google.com/p/v8/issues/detail?id=968
var o = { x : 42 };
assertTrue(Reflect.defineProperty(o, "x", { writable: false }));
assertEquals(42, o.x);
o.x = 37;
assertEquals(42, o.x);

o = { x : 42 };
assertTrue(Reflect.defineProperty(o, "x", {}));
assertEquals(42, o.x);
o.x = 37;
// Writability is preserved.
assertEquals(37, o.x);

var o = { };
assertTrue(Reflect.defineProperty(o, "x", { writable: false }));
assertEquals(undefined, o.x);
o.x = 37;
assertEquals(undefined, o.x);

o = { get x() { return 87; } };
assertTrue(Reflect.defineProperty(o, "x", { writable: false }));
assertEquals(undefined, o.x);
o.x = 37;
assertEquals(undefined, o.x);

// Ignore inherited properties.
o = { __proto__ : { x : 87 } };
assertTrue(Reflect.defineProperty(o, "x", { writable: false }));
assertEquals(undefined, o.x);
o.x = 37;
assertEquals(undefined, o.x);

function testDefineProperty(obj, propertyName, desc, resultDesc) {
  assertTrue(Reflect.defineProperty(obj, propertyName, desc));
  var actualDesc = Object.getOwnPropertyDescriptor(obj, propertyName);
  assertEquals(resultDesc.enumerable, actualDesc.enumerable);
  assertEquals(resultDesc.configurable, actualDesc.configurable);
  if (resultDesc.hasOwnProperty('value')) {
    assertEquals(resultDesc.value, actualDesc.value);
    assertEquals(resultDesc.writable, actualDesc.writable);
    assertFalse(resultDesc.hasOwnProperty('get'));
    assertFalse(resultDesc.hasOwnProperty('set'));
  } else {
    assertEquals(resultDesc.get, actualDesc.get);
    assertEquals(resultDesc.set, actualDesc.set);
    assertFalse(resultDesc.hasOwnProperty('value'));
    assertFalse(resultDesc.hasOwnProperty('writable'));
  }
}

// tests redefining existing property with a generic descriptor
o = { p : 42 };
testDefineProperty(o, 'p',
  { },
  { value : 42, writable : true, enumerable : true, configurable : true });

o = { p : 42 };
testDefineProperty(o, 'p',
  { enumerable : true },
  { value : 42, writable : true, enumerable : true, configurable : true });

o = { p : 42 };
testDefineProperty(o, 'p',
  { configurable : true },
  { value : 42, writable : true, enumerable : true, configurable : true });

o = { p : 42 };
testDefineProperty(o, 'p',
  { enumerable : false },
  { value : 42, writable : true, enumerable : false, configurable : true });

o = { p : 42 };
testDefineProperty(o, 'p',
  { configurable : false },
  { value : 42, writable : true, enumerable : true, configurable : false });

o = { p : 42 };
testDefineProperty(o, 'p',
  { enumerable : true, configurable : true },
  { value : 42, writable : true, enumerable : true, configurable : true });

o = { p : 42 };
testDefineProperty(o, 'p',
  { enumerable : false, configurable : true },
  { value : 42, writable : true, enumerable : false, configurable : true });

o = { p : 42 };
testDefineProperty(o, 'p',
  { enumerable : true, configurable : false },
  { value : 42, writable : true, enumerable : true, configurable : false });

o = { p : 42 };
testDefineProperty(o, 'p',
  { enumerable : false, configurable : false },
  { value : 42, writable : true, enumerable : false, configurable : false });

// can make a writable, non-configurable field non-writable
o = { p : 42 };
assertTrue(Reflect.defineProperty(o, 'p', { configurable: false }));
testDefineProperty(o, 'p',
  { writable: false },
  { value : 42, writable : false, enumerable : true, configurable : false });

// redefine of get only property with generic descriptor
o = {};
assertTrue(Reflect.defineProperty(o, 'p',
  { get : getter1, enumerable: true, configurable: true }));
testDefineProperty(o, 'p',
  { enumerable : false, configurable : false },
  { get: getter1, set: undefined, enumerable : false, configurable : false });

// redefine of get/set only property with generic descriptor
o = {};
assertTrue(Reflect.defineProperty(o, 'p',
  { get: getter1, set: setter1, enumerable: true, configurable: true }));
testDefineProperty(o, 'p',
  { enumerable : false, configurable : false },
  { get: getter1, set: setter1, enumerable : false, configurable : false });

// redefine of set only property with generic descriptor
o = {};
assertTrue(Reflect.defineProperty(o, 'p',
  { set : setter1, enumerable: true, configurable: true }));
testDefineProperty(o, 'p',
  { enumerable : false, configurable : false },
  { get: undefined, set: setter1, enumerable : false, configurable : false });


// Regression test: Ensure that growing dictionaries are not ignored.
o = {};
for (var i = 0; i < 1000; i++) {
  // Non-enumerable property forces dictionary mode.
  assertTrue(Reflect.defineProperty(o, i, {value: i, enumerable: false}));
}
assertEquals(999, o[999]);


// Regression test: Bizarre behavior on non-strict arguments object.
// TODO(yangguo): Tests disabled, needs investigation!
/*
(function test(arg0) {
  // Here arguments[0] is a fast alias on arg0.
  Reflect.defineProperty(arguments, "0", {
    value:1,
    enumerable:false
  });
  // Here arguments[0] is a slow alias on arg0.
  Reflect.defineProperty(arguments, "0", {
    value:2,
    writable:false
  });
  // Here arguments[0] is no alias at all.
  Reflect.defineProperty(arguments, "0", {
    value:3
  });
  assertEquals(2, arg0);
  assertEquals(3, arguments[0]);
})(0);
*/

// Regression test: We should never observe the hole value.
var objectWithGetter = {};
objectWithGetter.__defineGetter__('foo', function() {});
assertEquals(undefined, objectWithGetter.__lookupSetter__('foo'));

var objectWithSetter = {};
objectWithSetter.__defineSetter__('foo', function(x) {});
assertEquals(undefined, objectWithSetter.__lookupGetter__('foo'));

// An object with a getter on the prototype chain.
function getter() { return 111; }
function anotherGetter() { return 222; }

function testGetterOnProto(expected, o) {
  assertEquals(expected, o.quebec);
}

obj1 = {};
assertTrue(
  Reflect.defineProperty(obj1, "quebec", { get: getter, configurable: true }));
obj2 = Object.create(obj1);
obj3 = Object.create(obj2);

%PrepareFunctionForOptimization(testGetterOnProto);
testGetterOnProto(111, obj3);
testGetterOnProto(111, obj3);
%OptimizeFunctionOnNextCall(testGetterOnProto);
testGetterOnProto(111, obj3);
testGetterOnProto(111, obj3);

assertTrue(Reflect.defineProperty(obj1, "quebec", { get: anotherGetter }));

%PrepareFunctionForOptimization(testGetterOnProto);
testGetterOnProto(222, obj3);
testGetterOnProto(222, obj3);
%OptimizeFunctionOnNextCall(testGetterOnProto);
testGetterOnProto(222, obj3);
testGetterOnProto(222, obj3);

// An object with a setter on the prototype chain.
var modifyMe;
function setter(x) { modifyMe = x+1; }
function anotherSetter(x) { modifyMe = x+2; }

function testSetterOnProto(expected, o) {
  modifyMe = 333;
  o.romeo = 444;
  assertEquals(expected, modifyMe);
}

obj1 = {};
assertTrue(
  Reflect.defineProperty(obj1, "romeo", { set: setter, configurable: true }));
obj2 = Object.create(obj1);
obj3 = Object.create(obj2);

%PrepareFunctionForOptimization(testSetterOnProto);
testSetterOnProto(445, obj3);
testSetterOnProto(445, obj3);
%OptimizeFunctionOnNextCall(testSetterOnProto);
testSetterOnProto(445, obj3);
testSetterOnProto(445, obj3);

assertTrue(Reflect.defineProperty(obj1, "romeo", { set: anotherSetter }));

%PrepareFunctionForOptimization(testSetterOnProto);
testSetterOnProto(446, obj3);
testSetterOnProto(446, obj3);
%OptimizeFunctionOnNextCall(testSetterOnProto);
testSetterOnProto(446, obj3);
testSetterOnProto(446, obj3);

// Removing a setter on the prototype chain.
function testSetterOnProtoStrict(o) {
  "use strict";
  o.sierra = 12345;
}

obj1 = {};
assertTrue(Reflect.defineProperty(obj1, "sierra",
                      { get: getter, set: setter, configurable: true }));
obj2 = Object.create(obj1);
obj3 = Object.create(obj2);

%PrepareFunctionForOptimization(testSetterOnProtoStrict);
testSetterOnProtoStrict(obj3);
testSetterOnProtoStrict(obj3);
%OptimizeFunctionOnNextCall(testSetterOnProtoStrict);
testSetterOnProtoStrict(obj3);
testSetterOnProtoStrict(obj3);

assertTrue(Reflect.defineProperty(obj1, "sierra",
                      { get: getter, set: undefined, configurable: true }));

exception = false;
try {
  testSetterOnProtoStrict(obj3);
} catch (e) {
  exception = true;
  assertTrue(/which has only a getter/.test(e));
}
assertTrue(exception);

// Test assignment to a getter-only property on the prototype chain. This makes
// sure that crankshaft re-checks its assumptions and doesn't rely only on type
// feedback (which would be monomorphic here).

function Assign(o) {
  o.blubb = 123;
}

function C() {}

%PrepareFunctionForOptimization(Assign);
Assign(new C);
Assign(new C);
%OptimizeFunctionOnNextCall(Assign);
assertTrue(
  Reflect.defineProperty(C.prototype, "blubb", {get: function() {return -42}}));
Assign(new C);

// Test that changes to the prototype of a simple constructor are not ignored,
// even after creating initial instances.
function C() {
  this.x = 23;
}
assertEquals(23, new C().x);
C.prototype.__defineSetter__('x', function(value) { this.y = 23; });
assertEquals(void 0, new C().x);
