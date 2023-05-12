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

// Copyright 2013 the V8 project authors. All rights reserved.
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

// Flags: --allow-natives-syntax

// ArrayBuffer

function TestByteLength(param, expectedByteLength) {
  var ab = new ArrayBuffer(param);
  assertSame(expectedByteLength, ab.byteLength);
}

function TestArrayBufferCreation() {
  TestByteLength(1, 1);
  TestByteLength(256, 256);
  TestByteLength(2.567, 2);

  TestByteLength("abc", 0);

  TestByteLength(0, 0);

  assertThrows(function() { new ArrayBuffer(-10); }, RangeError);
  assertThrows(function() { new ArrayBuffer(-2.567); }, RangeError);

  assertThrows(function() {
    let kArrayBufferByteLengthLimit = %ArrayBufferMaxByteLength() + 1;
    var ab1 = new ArrayBuffer(kArrayBufferByteLengthLimit);
  }, RangeError);

  var ab = new ArrayBuffer();
  assertSame(0, ab.byteLength);
  assertEquals("[object ArrayBuffer]",
      Object.prototype.toString.call(ab));
}

TestArrayBufferCreation();

function TestByteLengthNotWritable() {
  var ab = new ArrayBuffer(1024);
  assertSame(1024, ab.byteLength);

  assertThrows(function() { "use strict"; ab.byteLength = 42; }, TypeError);
}

TestByteLengthNotWritable();

function TestSlice(expectedResultLen, initialLen, start, end) {
  var ab = new ArrayBuffer(initialLen);
  var a1 = new Uint8Array(ab);
  for (var i = 0; i < a1.length; i++) {
    a1[i] = 0xCA;
  }
  var slice = ab.slice(start, end);
  assertSame(expectedResultLen, slice.byteLength);
  var a2 = new Uint8Array(slice);
  for (var i = 0; i < a2.length; i++) {
    assertSame(0xCA, a2[i]);
  }
}

function TestArrayBufferSlice() {
  var ab = new ArrayBuffer(1024);
  var ab1 = ab.slice(512, 1024);
  assertSame(512, ab1.byteLength);

  TestSlice(512, 1024, 512, 1024);
  TestSlice(512, 1024, 512);

  TestSlice(0, 0, 1, 20);
  TestSlice(100, 100, 0, 100);
  TestSlice(100, 100, 0, 1000);

  TestSlice(0, 100, 5, 1);

  TestSlice(1, 100, -11, -10);
  TestSlice(9, 100, -10, 99);
  TestSlice(0, 100, -10, 80);
  TestSlice(10, 100, 80, -10);

  TestSlice(10, 100, 90, "100");
  TestSlice(10, 100, "90", "100");

  TestSlice(0,  100, 90, "abc");
  TestSlice(10, 100, "abc", 10);

  TestSlice(10, 100, 0.96, 10.96);
  TestSlice(10, 100, 0.96, 10.01);
  TestSlice(10, 100, 0.01, 10.01);
  TestSlice(10, 100, 0.01, 10.96);

  TestSlice(10, 100, 90);
  TestSlice(10, 100, -10);
}

TestArrayBufferSlice();

// Typed arrays

function TestTypedArray(constr, elementSize, typicalElement) {
  assertSame(elementSize, constr.BYTES_PER_ELEMENT);

  var ab = new ArrayBuffer(256*elementSize);

  var a0 = new constr(30);
  assertEquals("[object " + constr.name + "]",
      Object.prototype.toString.call(a0));

  assertTrue(ArrayBuffer.isView(a0));
  assertSame(elementSize, a0.BYTES_PER_ELEMENT);
  assertSame(30, a0.length);
  assertSame(30*elementSize, a0.byteLength);
  assertSame(0, a0.byteOffset);
  assertSame(30*elementSize, a0.buffer.byteLength);

  var aLen0 = new constr(0);
  assertSame(elementSize, aLen0.BYTES_PER_ELEMENT);
  assertSame(0, aLen0.length);
  assertSame(0, aLen0.byteLength);
  assertSame(0, aLen0.byteOffset);
  assertSame(0, aLen0.buffer.byteLength);

  var aOverBufferLen0 = new constr(ab, 128*elementSize, 0);
  assertSame(ab, aOverBufferLen0.buffer);
  assertSame(elementSize, aOverBufferLen0.BYTES_PER_ELEMENT);
  assertSame(0, aOverBufferLen0.length);
  assertSame(0, aOverBufferLen0.byteLength);
  assertSame(128*elementSize, aOverBufferLen0.byteOffset);

  var a1 = new constr(ab, 128*elementSize, 128);
  assertSame(ab, a1.buffer);
  assertSame(elementSize, a1.BYTES_PER_ELEMENT);
  assertSame(128, a1.length);
  assertSame(128*elementSize, a1.byteLength);
  assertSame(128*elementSize, a1.byteOffset);


  var a2 = new constr(ab, 64*elementSize, 128);
  assertSame(ab, a2.buffer);
  assertSame(elementSize, a2.BYTES_PER_ELEMENT);
  assertSame(128, a2.length);
  assertSame(128*elementSize, a2.byteLength);
  assertSame(64*elementSize, a2.byteOffset);

  var a3 = new constr(ab, 192*elementSize);
  assertSame(ab, a3.buffer);
  assertSame(64, a3.length);
  assertSame(64*elementSize, a3.byteLength);
  assertSame(192*elementSize, a3.byteOffset);

  var a4 = new constr(ab);
  assertSame(ab, a4.buffer);
  assertSame(256, a4.length);
  assertSame(256*elementSize, a4.byteLength);
  assertSame(0, a4.byteOffset);


  var i;
  for (i = 0; i < 128; i++) {
    a1[i] = typicalElement;
  }

  for (i = 0; i < 128; i++) {
    assertSame(typicalElement, a1[i]);
  }

  for (i = 0; i < 64; i++) {
    assertSame(0, a2[i]);
  }

  for (i = 64; i < 128; i++) {
    assertSame(typicalElement, a2[i]);
  }

  for (i = 0; i < 64; i++) {
    assertSame(typicalElement, a3[i]);
  }

  for (i = 0; i < 128; i++) {
    assertSame(0, a4[i]);
  }

  for (i = 128; i < 256; i++) {
    assertSame(typicalElement, a4[i]);
  }

  var aAtTheEnd = new constr(ab, 256*elementSize);
  assertSame(elementSize, aAtTheEnd.BYTES_PER_ELEMENT);
  assertSame(0, aAtTheEnd.length);
  assertSame(0, aAtTheEnd.byteLength);
  assertSame(256*elementSize, aAtTheEnd.byteOffset);

  assertThrows(function () { new constr(ab, 257*elementSize); }, RangeError);
  assertThrows(
      function () { new constr(ab, 128*elementSize, 192); },
      RangeError);

  if (elementSize !== 1) {
    assertThrows(function() { new constr(ab, 128*elementSize - 1, 10); },
                 RangeError);
    var unalignedArrayBuffer = new ArrayBuffer(10*elementSize + 1);
    var goodArray = new constr(unalignedArrayBuffer, 0, 10);
    assertSame(10, goodArray.length);
    assertSame(10*elementSize, goodArray.byteLength);
    assertThrows(function() { new constr(unalignedArrayBuffer)}, RangeError);
    assertThrows(function() { new constr(unalignedArrayBuffer, 5*elementSize)},
                 RangeError);
  }

  var aFromUndef = new constr();
  assertSame(elementSize, aFromUndef.BYTES_PER_ELEMENT);
  assertSame(0, aFromUndef.length);
  assertSame(0*elementSize, aFromUndef.byteLength);
  assertSame(0, aFromUndef.byteOffset);
  assertSame(0*elementSize, aFromUndef.buffer.byteLength);

  var aFromNull = new constr(null);
  assertSame(elementSize, aFromNull.BYTES_PER_ELEMENT);
  assertSame(0, aFromNull.length);
  assertSame(0*elementSize, aFromNull.byteLength);
  assertSame(0, aFromNull.byteOffset);
  assertSame(0*elementSize, aFromNull.buffer.byteLength);

  var aFromBool = new constr(true);
  assertSame(elementSize, aFromBool.BYTES_PER_ELEMENT);
  assertSame(1, aFromBool.length);
  assertSame(1*elementSize, aFromBool.byteLength);
  assertSame(0, aFromBool.byteOffset);
  assertSame(1*elementSize, aFromBool.buffer.byteLength);

  var aFromString = new constr("30");
  assertSame(elementSize, aFromString.BYTES_PER_ELEMENT);
  assertSame(30, aFromString.length);
  assertSame(30*elementSize, aFromString.byteLength);
  assertSame(0, aFromString.byteOffset);
  assertSame(30*elementSize, aFromString.buffer.byteLength);

  assertThrows(function() { new constr(Symbol()); }, TypeError);

  assertThrows(function() { new constr(-1); }, RangeError);

  var jsArray = [];
  for (i = 0; i < 30; i++) {
    jsArray.push(typicalElement);
  }
  var aFromArray = new constr(jsArray);
  assertSame(elementSize, aFromArray.BYTES_PER_ELEMENT);
  assertSame(30, aFromArray.length);
  assertSame(30*elementSize, aFromArray.byteLength);
  assertSame(0, aFromArray.byteOffset);
  assertSame(30*elementSize, aFromArray.buffer.byteLength);
  for (i = 0; i < 30; i++) {
    assertSame(typicalElement, aFromArray[i]);
  }

  var abLen0 = new ArrayBuffer(0);
  var aOverAbLen0 = new constr(abLen0);
  assertSame(abLen0, aOverAbLen0.buffer);
  assertSame(elementSize, aOverAbLen0.BYTES_PER_ELEMENT);
  assertSame(0, aOverAbLen0.length);
  assertSame(0, aOverAbLen0.byteLength);
  assertSame(0, aOverAbLen0.byteOffset);

  var aNoParam = new constr();
  assertSame(elementSize, aNoParam.BYTES_PER_ELEMENT);
  assertSame(0, aNoParam.length);
  assertSame(0, aNoParam.byteLength);
  assertSame(0, aNoParam.byteOffset);

  var a = new constr(ab, 64*elementSize, 128);
  assertEquals("[object " + constr.name + "]",
      Object.prototype.toString.call(a));
  var desc = Object.getOwnPropertyDescriptor(
      constr.prototype.__proto__, Symbol.toStringTag);
  assertTrue(desc.configurable);
  assertFalse(desc.enumerable);
  assertFalse(!!desc.writable);
  assertFalse(!!desc.set);
  assertEquals("function", typeof desc.get);

  // Test that the constructor can be called with an iterable
  function* gen() { for (var i = 0; i < 10; i++) yield i; }
  var genArr = new constr(gen());
  assertEquals(10, genArr.length);
  assertEquals(0, genArr[0]);
  assertEquals(9, genArr[9]);
  // Arrays can be converted to TypedArrays
  genArr = new constr([1, 2, 3]);
  assertEquals(3, genArr.length);
  assertEquals(1, genArr[0]);
  assertEquals(3, genArr[2]);
  // Redefining Array.prototype[Symbol.iterator] still works
  var arrayIterator = Array.prototype[Symbol.iterator];
  Array.prototype[Symbol.iterator] = gen;
  genArr = new constr([1, 2, 3]);
  assertEquals(10, genArr.length);
  assertEquals(0, genArr[0]);
  assertEquals(9, genArr[9]);
  Array.prototype[Symbol.iterator] = arrayIterator;
  // Other array-like things can be made into a TypedArray
  var myObject = { 0: 5, 1: 6, length: 2 };
  genArr = new constr(myObject);
  assertEquals(2, genArr.length);
  assertEquals(5, genArr[0]);
  assertEquals(6, genArr[1]);
  // Iterator takes precedence over array-like, and the property
  // is read only once.
  var iteratorReadCount = 0;
  Object.defineProperty(myObject, Symbol.iterator, {
    get: function() { iteratorReadCount++; return gen; }
  });
  genArr = new constr(myObject);
  assertEquals(10, genArr.length);
  assertEquals(0, genArr[0]);
  assertEquals(9, genArr[9]);
  assertEquals(1, iteratorReadCount);

  // Modified %ArrayIteratorPrototype%.next() method is honoured (v8:5699)
  const ArrayIteratorPrototype = Object.getPrototypeOf([][Symbol.iterator]());
  const ArrayIteratorPrototypeNextDescriptor =
      Object.getOwnPropertyDescriptor(ArrayIteratorPrototype, 'next');
  const ArrayIteratorPrototypeNext = ArrayIteratorPrototype.next;
  ArrayIteratorPrototype.next = function() {
    return { done: true };
  };
  genArr = new constr([1, 2, 3]);
  assertEquals(0, genArr.length);

  ArrayIteratorPrototype.next = ArrayIteratorPrototypeNext;

  // Modified %ArrayIteratorPrototype%.next() is only loaded during the iterator
  // prologue.
  let nextMethod = ArrayIteratorPrototypeNext;
  let getNextCount = 0;
  Object.defineProperty(ArrayIteratorPrototype, 'next', {
    get() {
      getNextCount++;
      return nextMethod;
    },
    set(v) { nextMethod = v; },
    configurable: true
  });

  genArr = new constr(Object.defineProperty([1, , 3], 1, {
    get() {
      ArrayIteratorPrototype.next = function() {
        return { done: true };
      }
      return 2;
    }
  }));
  Object.defineProperty(ArrayIteratorPrototype, 'next',
                        ArrayIteratorPrototypeNextDescriptor);
  assertEquals(1, getNextCount);
  assertEquals(3, genArr.length);
  assertEquals(1, genArr[0]);
  assertEquals(2, genArr[1]);
  assertEquals(3, genArr[2]);
  ArrayIteratorPrototype.next = ArrayIteratorPrototypeNext;
}

TestTypedArray(Uint8Array, 1, 0xFF);
TestTypedArray(Int8Array, 1, -0x7F);
TestTypedArray(Uint16Array, 2, 0xFFFF);
TestTypedArray(Int16Array, 2, -0x7FFF);
TestTypedArray(Uint32Array, 4, 0xFFFFFFFF);
TestTypedArray(Int32Array, 4, -0x7FFFFFFF);
TestTypedArray(Float32Array, 4, 0.5);
TestTypedArray(Float64Array, 8, 0.5);
TestTypedArray(Uint8ClampedArray, 1, 0xFF);

function SubarrayTestCase(constructor, item, expectedResultLen, expectedStartIndex,
                          initialLen, start, end) {
  var a = new constructor(initialLen);
  var s = a.subarray(start, end);
  assertSame(constructor, s.constructor);
  assertSame(expectedResultLen, s.length);
  if (s.length > 0) {
    s[0] = item;
    assertSame(item, a[expectedStartIndex]);
  }
}

function TestSubArray(constructor, item) {
  SubarrayTestCase(constructor, item, 512, 512, 1024, 512, 1024);
  SubarrayTestCase(constructor, item, 512, 512, 1024, 512);

  SubarrayTestCase(constructor, item, 0, undefined, 0, 1, 20);
  SubarrayTestCase(constructor, item, 100, 0,       100, 0, 100);
  SubarrayTestCase(constructor, item, 100, 0,       100,  0, 1000);
  SubarrayTestCase(constructor, item, 0, undefined, 100, 5, 1);

  SubarrayTestCase(constructor, item, 1, 89,        100, -11, -10);
  SubarrayTestCase(constructor, item, 9, 90,        100, -10, 99);
  SubarrayTestCase(constructor, item, 0, undefined, 100, -10, 80);
  SubarrayTestCase(constructor, item, 10,80,        100, 80, -10);

  SubarrayTestCase(constructor, item, 10,90,        100, 90, "100");
  SubarrayTestCase(constructor, item, 10,90,        100, "90", "100");

  SubarrayTestCase(constructor, item, 0, undefined, 100, 90, "abc");
  SubarrayTestCase(constructor, item, 10,0,         100, "abc", 10);

  SubarrayTestCase(constructor, item, 10,0,         100, 0.96, 10.96);
  SubarrayTestCase(constructor, item, 10,0,         100, 0.96, 10.01);
  SubarrayTestCase(constructor, item, 10,0,         100, 0.01, 10.01);
  SubarrayTestCase(constructor, item, 10,0,         100, 0.01, 10.96);


  SubarrayTestCase(constructor, item, 10,90,        100, 90);
  SubarrayTestCase(constructor, item, 10,90,        100, -10);

  var method = constructor.prototype.subarray;
  method.call(new constructor(100), 0, 100);
  var o = {};
  assertThrows(function() { method.call(o, 0, 100); }, TypeError);
}

TestSubArray(Uint8Array, 0xFF);
TestSubArray(Int8Array, -0x7F);
TestSubArray(Uint16Array, 0xFFFF);
TestSubArray(Int16Array, -0x7FFF);
TestSubArray(Uint32Array, 0xFFFFFFFF);
TestSubArray(Int32Array, -0x7FFFFFFF);
TestSubArray(Float32Array, 0.5);
TestSubArray(Float64Array, 0.5);
TestSubArray(Uint8ClampedArray, 0xFF);

function TestTypedArrayOutOfRange(constructor, value, result) {
  var a = new constructor(1);
  a[0] = value;
  assertSame(result, a[0]);
}

TestTypedArrayOutOfRange(Uint8Array, 0x1FA, 0xFA);
TestTypedArrayOutOfRange(Uint8Array, -1, 0xFF);

TestTypedArrayOutOfRange(Int8Array, 0x1FA, 0x7A - 0x80);

TestTypedArrayOutOfRange(Uint16Array, 0x1FFFA, 0xFFFA);
TestTypedArrayOutOfRange(Uint16Array, -1, 0xFFFF);
TestTypedArrayOutOfRange(Int16Array, 0x1FFFA, 0x7FFA - 0x8000);

TestTypedArrayOutOfRange(Uint32Array, 0x1FFFFFFFA, 0xFFFFFFFA);
TestTypedArrayOutOfRange(Uint32Array, -1, 0xFFFFFFFF);
TestTypedArrayOutOfRange(Int32Array, 0x1FFFFFFFA, 0x7FFFFFFA - 0x80000000);

TestTypedArrayOutOfRange(Uint8ClampedArray, 0x1FA, 0xFF);
TestTypedArrayOutOfRange(Uint8ClampedArray, -1, 0);

var typedArrayConstructors = [
  Uint8Array,
  Int8Array,
  Uint16Array,
  Int16Array,
  Uint32Array,
  Int32Array,
  Uint8ClampedArray,
  Float32Array,
  Float64Array];

function TestPropertyTypeChecks(constructor) {
  function CheckProperty(name) {
    assertThrows(function() { 'use strict'; new constructor(10)[name] = 0; })
    var d = Object.getOwnPropertyDescriptor(constructor.prototype.__proto__, name);
    var o = {};
    assertThrows(function() {d.get.call(o);}, TypeError);
    for (var i = 0; i < typedArrayConstructors.length; i++) {
      var ctor = typedArrayConstructors[i];
      var a = new ctor(10);
      d.get.call(a); // shouldn't throw
    }
  }

  CheckProperty("buffer");
  CheckProperty("byteOffset");
  CheckProperty("byteLength");
  CheckProperty("length");
}

for(i = 0; i < typedArrayConstructors.length; i++) {
  TestPropertyTypeChecks(typedArrayConstructors[i]);
}


function TestTypedArraySet() {
  // Test array.set in different combinations.

  function assertArrayPrefix(expected, array) {
    for (var i = 0; i < expected.length; ++i) {
      assertEquals(expected[i], array[i]);
    }
  }

  a = new Uint32Array();
  a.set('');
  assertEquals(0, a.length);

  assertThrows(() => a.set('abc'), RangeError);

  a = new Uint8Array(3);
  a.set('123');
  assertArrayEquals([1, 2, 3], a);

  var a11 = new Int16Array([1, 2, 3, 4, 0, -1])
  var a12 = new Uint16Array(15)
  a12.set(a11, 3)
  assertArrayPrefix([0, 0, 0, 1, 2, 3, 4, 0, 0xffff, 0, 0], a12)
  assertThrows(function(){ a11.set(a12) })

  var a21 = [1, undefined, 10, NaN, 0, -1, {valueOf: function() {return 3}}]
  var a22 = new Int32Array(12)
  a22.set(a21, 2)
  assertArrayPrefix([0, 0, 1, 0, 10, 0, 0, -1, 3, 0], a22)

  var a31 = new Float32Array([2, 4, 6, 8, 11, NaN, 1/0, -3])
  var a32 = a31.subarray(2, 6)
  a31.set(a32, 4)
  assertArrayPrefix([2, 4, 6, 8, 6, 8, 11, NaN], a31)
  assertArrayPrefix([6, 8, 6, 8], a32)

  var a4 = new Uint8ClampedArray([3,2,5,6])
  a4.set(a4)
  assertArrayPrefix([3, 2, 5, 6], a4)

  // Cases with overlapping backing store but different element sizes.
  var b = new ArrayBuffer(4)
  var a5 = new Int16Array(b)
  var a50 = new Int8Array(b)
  var a51 = new Int8Array(b, 0, 2)
  var a52 = new Int8Array(b, 1, 2)
  var a53 = new Int8Array(b, 2, 2)
  var a54 = new Int8Array(b, 0, 0)

  a5.set([0x5050, 0x0a0a])
  assertArrayPrefix([0x50, 0x50, 0x0a, 0x0a], a50)
  assertArrayPrefix([0x50, 0x50], a51)
  assertArrayPrefix([0x50, 0x0a], a52)
  assertArrayPrefix([0x0a, 0x0a], a53)

  a50.set([0x50, 0x50, 0x0a, 0x0a])
  a51.set(a5)
  assertArrayPrefix([0x50, 0x0a, 0x0a, 0x0a], a50)

  a50.set([0x50, 0x50, 0x0a, 0x0a])
  a52.set(a5)
  assertArrayPrefix([0x50, 0x50, 0x0a, 0x0a], a50)

  a50.set([0x50, 0x50, 0x0a, 0x0a])
  a53.set(a5)
  assertArrayPrefix([0x50, 0x50, 0x50, 0x0a], a50)

  a50.set([0x50, 0x51, 0x0a, 0x0b])
  a5.set(a51)
  assertArrayPrefix([0x0050, 0x0051], a5)

  a50.set([0x50, 0x51, 0x0a, 0x0b])
  a5.set(a52)
  assertArrayPrefix([0x0051, 0x000a], a5)

  a50.set([0x50, 0x51, 0x0a, 0x0b])
  a5.set(a53)
  assertArrayPrefix([0x000a, 0x000b], a5)

  a50.set([0x50, 0x51, 0x0a, 0x0b])
  a5.set(a54, 0)
  assertArrayPrefix([0x50, 0x51, 0x0a, 0x0b], a50)

  // Mixed types of same size.
  var a61 = new Float32Array([1.2, 12.3])
  var a62 = new Int32Array(2)
  a62.set(a61)
  assertArrayPrefix([1, 12], a62)
  a61.set(a62)
  assertArrayPrefix([1, 12], a61)

  // Invalid source
  var a = new Uint16Array(50);
  var expected = [];
  for (i = 0; i < 50; i++) {
    a[i] = i;
    expected.push(i);
  }
  a.set({});
  assertArrayPrefix(expected, a);
  assertThrows(function() { a.set.call({}) }, TypeError);
  assertThrows(function() { a.set.call([]) }, TypeError);

  a.set(0);
  assertArrayPrefix(expected, a);
  a.set(0, 1);
  assertArrayPrefix(expected, a);

  assertEquals(1, a.set.length);

  // Shared buffer that does not overlap.
  var buf = new ArrayBuffer(32);
  var a101 = new Int8Array(buf, 0, 16);
  var b101 = new Uint8Array(buf, 16);
  b101[0] = 42;
  a101.set(b101);
  assertArrayPrefix([42], a101);

  buf = new ArrayBuffer(32);
  var a101 = new Int8Array(buf, 0, 16);
  var b101 = new Uint8Array(buf, 16);
  a101[0] = 42;
  b101.set(a101);
  assertArrayPrefix([42], b101);

  // Detached array buffer when accessing a source element
  var a111 = new Int8Array(100);
  var evilarr = new Array(100);
  var detached = false;
  evilarr[1] = {
    [Symbol.toPrimitive]() {
      %ArrayBufferDetach(a111.buffer);
      detached = true;
      return 1;
    }
  };
  a111.set(evilarr);
  assertEquals(true, detached);

  // Check if the target is a typed array before converting offset to integer
  var tmp = {
    [Symbol.toPrimitive]() {
      assertUnreachable("Parameter should not be processed when " +
                        "array.[[ViewedArrayBuffer]] is detached.");
      return 1;
    }
  };
  assertThrows(() => Int8Array.prototype.set.call(1, tmp), TypeError);
  assertThrows(() => Int8Array.prototype.set.call([], tmp), TypeError);

  // Detached array buffer when converting offset.
  {
    for (const klass of typedArrayConstructors) {
      const xs = new klass(10);
      let detached = false;
      const offset = {
        [Symbol.toPrimitive]() {
          %ArrayBufferDetach(xs.buffer);
          detached = true;
          return 0;
        }
      };
      assertThrows(() => xs.set(xs, offset), TypeError);
      assertEquals(true, detached);
    }
  }

  // Detached JSTypedArray source argument.
  {
    for (const klass of typedArrayConstructors) {
      const a = new klass(2);
      for (let i = 0; i < a.length; i++) a[i] = i;
      %ArrayBufferDetach(a.buffer);

      const b = new klass(2);
      assertThrows(() => b.set(a), TypeError);
    }
  }

  // Various offset edge cases.
  {
    for (const klass of typedArrayConstructors) {
      const xs = new klass(10);
      assertThrows(() => xs.set(xs, -1), RangeError);
      assertThrows(() => xs.set(xs, -1 * 2**64), RangeError);
      xs.set(xs, -0.0);
      xs.set(xs, 0.0);
      xs.set(xs, 0.5);
      assertThrows(() => xs.set(xs, 2**64), RangeError);
    }
  }

  // Exhaustively test elements kind combinations with JSArray source arg.
  {
    const kSize = 3;
    const targets = typedArrayConstructors.map(klass => new klass(kSize));
    const sources = [ [0,1,2]        // PACKED_SMI
                    , [0,,2]         // HOLEY_SMI
                    , [0.1,0.2,0.3]  // PACKED_DOUBLE
                    , [0.1,,0.3]     // HOLEY_DOUBLE
                    , [{},{},{}]     // PACKED
                    , [{},,{}]       // HOLEY
                    , []             // DICTIONARY (patched later)
                    ];

    // Migrate to DICTIONARY_ELEMENTS.
    Object.defineProperty(sources[6], 0, {});

    assertTrue(%HasSmiElements(sources[0]));
    assertTrue(%HasFastElements(sources[0]) && !%HasHoleyElements(sources[0]));
    assertTrue(%HasSmiElements(sources[1]));
    assertTrue(%HasFastElements(sources[1]) && %HasHoleyElements(sources[1]));
    assertTrue(%HasDoubleElements(sources[2]));
    assertTrue(%HasFastElements(sources[2]) && !%HasHoleyElements(sources[2]));
    assertTrue(%HasDoubleElements(sources[3]));
    assertTrue(%HasFastElements(sources[3]) && %HasHoleyElements(sources[3]));
    assertTrue(%HasObjectElements(sources[4]));
    assertTrue(%HasFastElements(sources[4]) && !%HasHoleyElements(sources[4]));
    assertTrue(%HasObjectElements(sources[4]));
    assertTrue(%HasFastElements(sources[4]) && !%HasHoleyElements(sources[4]));
    assertTrue(%HasObjectElements(sources[5]));
    assertTrue(%HasFastElements(sources[5]) && %HasHoleyElements(sources[5]));
    assertTrue(%HasDictionaryElements(sources[6]));

    for (const target of targets) {
      for (const source of sources) {
        target.set(source);
        %HeapObjectVerify(target);
        %HeapObjectVerify(source);
      }
    }
  }
}

TestTypedArraySet();

function TestTypedArraysWithIllegalIndices() {
  var a = new Int32Array(100);

  a[-10] = 10;
  assertEquals(undefined, a[-10]);
  a["-10"] = 10;
  assertEquals(undefined, a["-10"]);

  var s = "    -10";
  a[s] = 10;
  assertEquals(10, a[s]);
  var s1 = "    -10   ";
  a[s] = 10;
  assertEquals(10, a[s]);

  a["-1e2"] = 10;
  assertEquals(10, a["-1e2"]);
  assertEquals(undefined, a[-1e2]);

  a["-0"] = 256;
  var s2 = "     -0";
  a[s2] = 255;
  assertEquals(undefined, a["-0"]);
  assertEquals(255, a[s2]);
  assertEquals(0, a[-0]);

  a[-Infinity] = 50;
  assertEquals(undefined, a[-Infinity]);

  a[1.5] = 10;
  assertEquals(undefined, a[1.5]);
  var nan = Math.sqrt(-1);
  a[nan] = 5;
  assertEquals(undefined, a[nan]);

  var x = 0;
  var y = -0;
  assertEquals(Infinity, 1/x);
  assertEquals(-Infinity, 1/y);
  a[x] = 5;
  a[y] = 27;
  assertEquals(27, a[x]);
  assertEquals(27, a[y]);
}

TestTypedArraysWithIllegalIndices();

function TestTypedArraysWithIllegalIndicesStrict() {
  'use strict';
  var a = new Int32Array(100);

  a[-10] = 10;
  assertEquals(undefined, a[-10]);
  a["-10"] = 10;
  assertEquals(undefined, a["-10"]);

  var s = "    -10";
  a[s] = 10;
  assertEquals(10, a[s]);
  var s1 = "    -10   ";
  a[s] = 10;
  assertEquals(10, a[s]);

  a["-1e2"] = 10;
  assertEquals(10, a["-1e2"]);
  assertEquals(undefined, a[-1e2]);

  a["-0"] = 256;
  var s2 = "     -0";
  a[s2] = 255;
  assertEquals(undefined, a["-0"]);
  assertEquals(255, a[s2]);
  assertEquals(0, a[-0]);


  a[-Infinity] = 50;
  assertEquals(undefined, a[-Infinity]);

  a[1.5] = 10;
  assertEquals(undefined, a[1.5]);
  var nan = Math.sqrt(-1);
  a[nan] = 5;
  assertEquals(undefined, a[nan]);

  var x = 0;
  var y = -0;
  assertEquals(Infinity, 1/x);
  assertEquals(-Infinity, 1/y);
  a[x] = 5;
  a[y] = 27;
  assertEquals(27, a[x]);
  assertEquals(27, a[y]);
}

TestTypedArraysWithIllegalIndicesStrict();

// DataView
function TestDataViewConstructor() {
  var ab = new ArrayBuffer(256);

  var d1 = new DataView(ab, 1, 255);
  assertTrue(ArrayBuffer.isView(d1));
  assertSame(ab, d1.buffer);
  assertSame(1, d1.byteOffset);
  assertSame(255, d1.byteLength);

  var d2 = new DataView(ab, 2);
  assertSame(ab, d2.buffer);
  assertSame(2, d2.byteOffset);
  assertSame(254, d2.byteLength);

  var d3 = new DataView(ab);
  assertSame(ab, d3.buffer);
  assertSame(0, d3.byteOffset);
  assertSame(256, d3.byteLength);

  var d3a = new DataView(ab, 1, 0);
  assertSame(ab, d3a.buffer);
  assertSame(1, d3a.byteOffset);
  assertSame(0, d3a.byteLength);

  var d3b = new DataView(ab, 256, 0);
  assertSame(ab, d3b.buffer);
  assertSame(256, d3b.byteOffset);
  assertSame(0, d3b.byteLength);

  var d3c = new DataView(ab, 256);
  assertSame(ab, d3c.buffer);
  assertSame(256, d3c.byteOffset);
  assertSame(0, d3c.byteLength);

  var d4 = new DataView(ab, 1, 3.1415926);
  assertSame(ab, d4.buffer);
  assertSame(1, d4.byteOffset);
  assertSame(3, d4.byteLength);


  // error cases
  assertThrows(function() { new DataView(ab, -1); }, RangeError);
  assertThrows(function() { new DataView(); }, TypeError);
  assertThrows(function() { new DataView([]); }, TypeError);
  assertThrows(function() { new DataView(ab, 257); }, RangeError);
  assertThrows(function() { new DataView(ab, 1, 1024); }, RangeError);
}

TestDataViewConstructor();

function TestDataViewPropertyTypeChecks() {
  var a = new DataView(new ArrayBuffer(10));
  function CheckProperty(name) {
    var d = Object.getOwnPropertyDescriptor(DataView.prototype, name);
    var o = {}
    assertThrows(function() {d.get.call(o);}, TypeError);
    d.get.call(a); // shouldn't throw
  }

  CheckProperty("buffer");
  CheckProperty("byteOffset");
  CheckProperty("byteLength");

  function CheckGetSetLength(name) {
    assertEquals(1, DataView.prototype["get" + name].length);
    assertEquals(2, DataView.prototype["set" + name].length);
  }
  CheckGetSetLength("Int8");
  CheckGetSetLength("Uint8");
  CheckGetSetLength("Int16");
  CheckGetSetLength("Uint16");
  CheckGetSetLength("Int32");
  CheckGetSetLength("Uint32");
  CheckGetSetLength("Float32");
  CheckGetSetLength("Float64");
}


TestDataViewPropertyTypeChecks();


function TestDataViewToStringTag() {
  var a = new DataView(new ArrayBuffer(10));
  assertEquals("[object DataView]", Object.prototype.toString.call(a));
  var desc = Object.getOwnPropertyDescriptor(
      DataView.prototype, Symbol.toStringTag);
  assertTrue(desc.configurable);
  assertFalse(desc.enumerable);
  assertFalse(desc.writable);
  assertEquals("DataView", desc.value);
}


// General tests for properties

// Test property attribute [[Enumerable]]
function TestEnumerable(func, obj) {
  function props(x) {
    var array = [];
    for (var p in x) array.push(p);
    return array.sort();
  }
  assertArrayEquals([], props(func));
  assertArrayEquals([], props(func.prototype));
  if (obj)
    assertArrayEquals([], props(obj));
}
TestEnumerable(ArrayBuffer, new ArrayBuffer());
for(i = 0; i < typedArrayConstructors.length; i++) {
  TestEnumerable(typedArrayConstructors[i]);
}
TestEnumerable(DataView, new DataView(new ArrayBuffer()));

// Test arbitrary properties on ArrayBuffer
function TestArbitrary(m) {
  function TestProperty(map, property, value) {
    map[property] = value;
    assertEquals(value, map[property]);
  }
  for (var i = 0; i < 20; i++) {
    TestProperty(m, 'key' + i, 'val' + i);
    TestProperty(m, 'foo' + i, 'bar' + i);
  }
}
TestArbitrary(new ArrayBuffer(256));
for(i = 0; i < typedArrayConstructors.length; i++) {
  TestArbitrary(new typedArrayConstructors[i](10));
}
TestArbitrary(new DataView(new ArrayBuffer(256)));


// Test direct constructor call
assertThrows(function() { ArrayBuffer(); }, TypeError);
assertThrows(function() { DataView(new ArrayBuffer()); }, TypeError);

function TestNonConfigurableProperties(constructor) {
  var arr = new constructor([100])
  assertTrue(Object.getOwnPropertyDescriptor(arr,"0").configurable)
  assertFalse(delete arr[0])
}

for(i = 0; i < typedArrayConstructors.length; i++) {
  TestNonConfigurableProperties(typedArrayConstructors[i]);
}

(function TestInitialization() {
  for (var i = 0; i <= 128; i++) {
    var arr = new Uint8Array(i);
    for (var j = 0; j < i; j++) {
      assertEquals(0, arr[j]);
    }
  }
})();

(function TestBufferLengthTooLong() {
  const kLength = %TypedArrayMaxLength() + 1;
  try {
    var buf = new ArrayBuffer(kLength);
  } catch (e) {
    // The ArrayBuffer allocation fails on 32-bit archs, so no need to try to
    // construct the typed array.
    return;
  }
  assertThrows(function() {
    new Int8Array(buf);
  }, RangeError);
})();

(function TestByteLengthErrorMessage() {
  try {
    new Uint32Array(new ArrayBuffer(17));
  } catch (e) {
    assertEquals("byte length of Uint32Array should be a multiple of 4",
                 e.message);
  }
})();

// Regression test 761654
assertThrows(function LargeSourceArray() {
  let v0 = {};
  v0.length =  2 ** 32; // too large for uint32
  let a = new Int8Array();

  a.set(v0);
});

function TestMapCustomSpeciesConstructor(constructor) {
  const sample = new constructor([40, 42, 42]);
  let result, ctorThis;

  sample.constructor = {};
  sample.constructor[Symbol.species] = function(count) {
    result = arguments;
    ctorThis = this;
    return new constructor(count);
  };

  sample.map(function(v) { return v; });

  assertSame(result.length, 1, "called with 1 argument");
  assertSame(result[0], 3, "[0] is the new captured length");

  assertTrue(
    ctorThis instanceof sample.constructor[Symbol.species],
    "`this` value in the @@species fn is an instance of the function itself"
  );
};

for(i = 0; i < typedArrayConstructors.length; i++) {
  TestPropertyTypeChecks(typedArrayConstructors[i]);
}
