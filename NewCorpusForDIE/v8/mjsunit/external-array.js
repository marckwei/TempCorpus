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

// Copyright 2012 the V8 project authors. All rights reserved.
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

// Helper
function assertInstance(o, f) {
  assertSame(o.constructor, f);
  assertInstanceof(o, f);
}

// This is a regression test for overlapping key and value registers.
function f(a) {
  a[0] = 0;
  a[1] = 0;
}
%PrepareFunctionForOptimization(f);

var a = new Int32Array(2);
for (var i = 0; i < 5; i++) {
  f(a);
}
%OptimizeFunctionOnNextCall(f);
f(a);

assertEquals(0, a[0]);
assertEquals(0, a[1]);

// Test derivation from an ArrayBuffer
var ab = new ArrayBuffer(12);
assertInstance(ab, ArrayBuffer);
var derived_uint8 = new Uint8Array(ab);
assertInstance(derived_uint8, Uint8Array);
assertSame(ab, derived_uint8.buffer);
assertEquals(12, derived_uint8.length);
assertEquals(12, derived_uint8.byteLength);
assertEquals(0, derived_uint8.byteOffset);
assertEquals(1, derived_uint8.BYTES_PER_ELEMENT);
var derived_uint8_2 = new Uint8Array(ab,7);
assertInstance(derived_uint8_2, Uint8Array);
assertSame(ab, derived_uint8_2.buffer);
assertEquals(5, derived_uint8_2.length);
assertEquals(5, derived_uint8_2.byteLength);
assertEquals(7, derived_uint8_2.byteOffset);
assertEquals(1, derived_uint8_2.BYTES_PER_ELEMENT);
var derived_int16 = new Int16Array(ab);
assertInstance(derived_int16, Int16Array);
assertSame(ab, derived_int16.buffer);
assertEquals(6, derived_int16.length);
assertEquals(12, derived_int16.byteLength);
assertEquals(0, derived_int16.byteOffset);
assertEquals(2, derived_int16.BYTES_PER_ELEMENT);
var derived_int16_2 = new Int16Array(ab,6);
assertInstance(derived_int16_2, Int16Array);
assertSame(ab, derived_int16_2.buffer);
assertEquals(3, derived_int16_2.length);
assertEquals(6, derived_int16_2.byteLength);
assertEquals(6, derived_int16_2.byteOffset);
assertEquals(2, derived_int16_2.BYTES_PER_ELEMENT);
var derived_uint32 = new Uint32Array(ab);
assertInstance(derived_uint32, Uint32Array);
assertSame(ab, derived_uint32.buffer);
assertEquals(3, derived_uint32.length);
assertEquals(12, derived_uint32.byteLength);
assertEquals(0, derived_uint32.byteOffset);
assertEquals(4, derived_uint32.BYTES_PER_ELEMENT);
var derived_uint32_2 = new Uint32Array(ab,4);
assertInstance(derived_uint32_2, Uint32Array);
assertSame(ab, derived_uint32_2.buffer);
assertEquals(2, derived_uint32_2.length);
assertEquals(8, derived_uint32_2.byteLength);
assertEquals(4, derived_uint32_2.byteOffset);
assertEquals(4, derived_uint32_2.BYTES_PER_ELEMENT);
var derived_uint32_3 = new Uint32Array(ab,4,1);
assertInstance(derived_uint32_3, Uint32Array);
assertSame(ab, derived_uint32_3.buffer);
assertEquals(1, derived_uint32_3.length);
assertEquals(4, derived_uint32_3.byteLength);
assertEquals(4, derived_uint32_3.byteOffset);
assertEquals(4, derived_uint32_3.BYTES_PER_ELEMENT);
var derived_float64 = new Float64Array(ab,0,1);
assertInstance(derived_float64, Float64Array);
assertSame(ab, derived_float64.buffer);
assertEquals(1, derived_float64.length);
assertEquals(8, derived_float64.byteLength);
assertEquals(0, derived_float64.byteOffset);
assertEquals(8, derived_float64.BYTES_PER_ELEMENT);

// If a given byteOffset and length references an area beyond the end of the
// ArrayBuffer an exception is raised.
function abfunc3() {
  new Uint32Array(ab,4,3);
}
assertThrows(abfunc3);
function abfunc4() {
  new Uint32Array(ab,16);
}
assertThrows(abfunc4);

// The given byteOffset must be a multiple of the element size of the specific
// type, otherwise an exception is raised.
function abfunc5() {
  new Uint32Array(ab,5);
}
assertThrows(abfunc5);

// If length is not explicitly specified, the length of the ArrayBuffer minus
// the byteOffset must be a multiple of the element size of the specific type,
// or an exception is raised.
var ab2 = new ArrayBuffer(13);
function abfunc6() {
  new Uint32Array(ab2,4);
}
assertThrows(abfunc6);

// Test that an array constructed without an array buffer creates one properly.
a = new Uint8Array(31);
assertEquals(a.byteLength, a.buffer.byteLength);
assertEquals(a.length, a.buffer.byteLength);
assertEquals(a.length * a.BYTES_PER_ELEMENT, a.buffer.byteLength);
a = new Int16Array(5);
assertEquals(a.byteLength, a.buffer.byteLength);
assertEquals(a.length * a.BYTES_PER_ELEMENT, a.buffer.byteLength);
a = new Float64Array(7);
assertEquals(a.byteLength, a.buffer.byteLength);
assertEquals(a.length * a.BYTES_PER_ELEMENT, a.buffer.byteLength);

// Test that an implicitly created buffer is a valid buffer.
a = new Float64Array(7);
assertSame(a.buffer, (new Uint16Array(a.buffer)).buffer);
assertSame(a.buffer, (new Float32Array(a.buffer,4)).buffer);
assertSame(a.buffer, (new Int8Array(a.buffer,3,51)).buffer);
assertInstance(a.buffer, ArrayBuffer);

// Test the correct behavior of the |BYTES_PER_ELEMENT| property
a = new Int32Array(2);
assertEquals(4, a.BYTES_PER_ELEMENT);
a.BYTES_PER_ELEMENT = 42;
a = new Uint8Array(2);
assertEquals(1, a.BYTES_PER_ELEMENT);
a = new Int16Array(2);
assertEquals(2, a.BYTES_PER_ELEMENT);

// Test Float64Arrays.
function get(a, index) {
  return a[index];
};
%PrepareFunctionForOptimization(get);
function set(a, index, value) {
  a[index] = value;
};
%PrepareFunctionForOptimization(set);
function temp() {
var array = new Float64Array(2);
for (var i = 0; i < 5; i++) {
  set(array, 0, 2.5);
  assertEquals(2.5, array[0]);
}
%OptimizeFunctionOnNextCall(set);
set(array, 0, 2.5);
assertEquals(2.5, array[0]);
set(array, 1, 3.5);
assertEquals(3.5, array[1]);
for (var i = 0; i < 5; i++) {
  assertEquals(2.5, get(array, 0));
  assertEquals(3.5, array[1]);
}
%OptimizeFunctionOnNextCall(get);
assertEquals(2.5, get(array, 0));
assertEquals(3.5, get(array, 1));
}

// Test non-number parameters.
var array_with_length_from_non_number = new Int32Array("2");
assertEquals(2, array_with_length_from_non_number.length);

// Test loads and stores.
types = [Array, Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array,
         Uint32Array, Uint8ClampedArray, Float32Array, Float64Array];

test_result_nan = [NaN, 0, 0, 0, 0, 0, 0, 0, NaN, NaN];
test_result_low_int = [-1, -1, 255, -1, 65535, -1, 0xFFFFFFFF, 0, -1, -1];
test_result_low_double = [-1.25, -1, 255, -1, 65535, -1, 0xFFFFFFFF, 0, -1.25, -1.25];
test_result_middle = [253.75, -3, 253, 253, 253, 253, 253, 254, 253.75, 253.75];
test_result_high_int = [256, 0, 0, 256, 256, 256, 256, 255, 256, 256];
test_result_high_double = [256.25, 0, 0, 256, 256, 256, 256, 255, 256.25, 256.25];

const kElementCount = 40;

function test_load(array, sum) {
  for (var i = 0; i < kElementCount; i++) {
    sum += array[i];
  }
  return sum;
}

function test_load_const_key(array, sum) {
  sum += array[0];
  sum += array[1];
  sum += array[2];
  return sum;
}

function test_store(array, sum) {
  for (var i = 0; i < kElementCount; i++) {
    sum += array[i] = i+1;
  }
  return sum;
}

function test_store_const_key(array, sum) {
  sum += array[0] = 1;
  sum += array[1] = 2;
  sum += array[2] = 3;
  return sum;
}

function zero() {
  return 0.0;
}

function test_store_middle_tagged(array, sum) {
  array[0] = 253.75;
  return array[0];
}

function test_store_high_tagged(array, sum) {
  array[0] = 256.25;
  return array[0];
}

function test_store_middle_double(array, sum) {
  array[0] = 253.75 + zero(); // + forces double type feedback
  return array[0];
}

function test_store_high_double(array, sum) {
  array[0] = 256.25 + zero(); // + forces double type feedback
  return array[0];
}

function test_store_high_double(array, sum) {
  array[0] = 256.25;
  return array[0];
}

function test_store_low_int(array, sum) {
  array[0] = -1;
  return array[0];
}

function test_store_low_tagged(array, sum) {
  array[0] = -1.25;
  return array[0];
}

function test_store_low_double(array, sum) {
  array[0] = -1.25 + zero(); // + forces double type feedback
  return array[0];
}

function test_store_high_int(array, sum) {
  array[0] = 256;
  return array[0];
}

function test_store_nan(array, sum) {
  array[0] = NaN;
  return array[0];
}

const kRuns = 10;

function run_test(test_func, array, expected_result) {
  %PrepareFunctionForOptimization(test_func);
  for (var i = 0; i < 5; i++) test_func(array, 0);
  %OptimizeFunctionOnNextCall(test_func);
  var sum = 0;
  for (var i = 0; i < kRuns; i++) {
    sum = test_func(array, sum);
  }
  assertEquals(expected_result, sum);
  %DeoptimizeFunction(test_func);
  %ClearFunctionFeedback(test_func);
}

function run_bounds_test(test_func, array, expected_result) {
  assertEquals(undefined, a[kElementCount]);
  a[kElementCount] = 456;
  assertEquals(undefined, a[kElementCount]);
  assertEquals(undefined, a[kElementCount+1]);
  a[kElementCount+1] = 456;
  assertEquals(undefined, a[kElementCount+1]);
}

for (var t = 0; t < types.length; t++) {
  var type = types[t];
  var a = new type(kElementCount);

  for (var i = 0; i < kElementCount; i++) {
    a[i] = i;
  }

  // Run test functions defined above.
  run_test(test_load, a, 780 * kRuns);
  run_test(test_load_const_key, a, 3 * kRuns);
  run_test(test_store, a, 820 * kRuns);
  run_test(test_store_const_key, a, 6 * kRuns);
  run_test(test_store_low_int, a, test_result_low_int[t]);
  run_test(test_store_low_double, a, test_result_low_double[t]);
  run_test(test_store_low_tagged, a, test_result_low_double[t]);
  run_test(test_store_high_int, a, test_result_high_int[t]);
  run_test(test_store_nan, a, test_result_nan[t]);
  run_test(test_store_middle_double, a, test_result_middle[t]);
  run_test(test_store_middle_tagged, a, test_result_middle[t]);
  run_test(test_store_high_double, a, test_result_high_double[t]);
  run_test(test_store_high_tagged, a, test_result_high_double[t]);

  // Test the correct behavior of the |length| property (which is read-only).
  if (t != 0) {
    assertEquals(kElementCount, a.length);
    a.length = 2;
    assertEquals(kElementCount, a.length);
    assertTrue(delete a.length);

    // Make sure bounds checks are handled correctly for external arrays.
    %PrepareFunctionForOptimization(run_bounds_test);
    run_bounds_test(a);
    run_bounds_test(a);
    run_bounds_test(a);
    %OptimizeFunctionOnNextCall(run_bounds_test);
    run_bounds_test(a);
    %DeoptimizeFunction(run_bounds_test);
    %ClearFunctionFeedback(run_bounds_test);
  }

  function array_load_set_smi_check(a) {
    return a[0] = a[0] = 1;
  }

  array_load_set_smi_check(a);
  array_load_set_smi_check(0);

  function array_load_set_smi_check2(a) {
    return a[0] = a[0] = 1;
  }

  %PrepareFunctionForOptimization(array_load_set_smi_check2);
  array_load_set_smi_check2(a);
  %OptimizeFunctionOnNextCall(array_load_set_smi_check2);
  array_load_set_smi_check2(a);
  array_load_set_smi_check2(0);
  %DeoptimizeFunction(array_load_set_smi_check2);
  %ClearFunctionFeedback(array_load_set_smi_check2);
}

// Check handling of undefined in 32- and 64-bit external float arrays.

function store_float32_undefined(ext_array) {
  ext_array[0] = undefined;
}

%PrepareFunctionForOptimization(store_float32_undefined);
var float32_array = new Float32Array(1);
// Make sure runtime does it right
store_float32_undefined(float32_array);
assertTrue(isNaN(float32_array[0]));
// Make sure the ICs do it right
store_float32_undefined(float32_array);
assertTrue(isNaN(float32_array[0]));
// Make sure that Cranskshft does it right.
%OptimizeFunctionOnNextCall(store_float32_undefined);
store_float32_undefined(float32_array);
assertTrue(isNaN(float32_array[0]));

function store_float64_undefined(ext_array) {
  ext_array[0] = undefined;
}

%PrepareFunctionForOptimization(store_float64_undefined);
var float64_array = new Float64Array(1);
// Make sure runtime does it right
store_float64_undefined(float64_array);
assertTrue(isNaN(float64_array[0]));
// Make sure the ICs do it right
store_float64_undefined(float64_array);
assertTrue(isNaN(float64_array[0]));
// Make sure that Cranskshft does it right.
%OptimizeFunctionOnNextCall(store_float64_undefined);
store_float64_undefined(float64_array);
assertTrue(isNaN(float64_array[0]));


// Check handling of 0-sized buffers and arrays.
ab = new ArrayBuffer(0);
assertInstance(ab, ArrayBuffer);
assertEquals(0, ab.byteLength);
a = new Int8Array(ab);
assertInstance(a, Int8Array);
assertEquals(0, a.byteLength);
assertEquals(0, a.length);
a[0] = 1;
assertEquals(undefined, a[0]);
ab = new ArrayBuffer(16);
assertInstance(ab, ArrayBuffer);
a = new Float32Array(ab,4,0);
assertInstance(a, Float32Array);
assertEquals(0, a.byteLength);
assertEquals(0, a.length);
a[0] = 1;
assertEquals(undefined, a[0]);
a = new Uint16Array(0);
assertInstance(a, Uint16Array);
assertEquals(0, a.byteLength);
assertEquals(0, a.length);
a[0] = 1;
assertEquals(undefined, a[0]);

// Check construction from arrays.
a = new Uint32Array([]);
assertInstance(a, Uint32Array);
assertEquals(0, a.length);
assertEquals(0, a.byteLength);
assertEquals(0, a.buffer.byteLength);
assertEquals(4, a.BYTES_PER_ELEMENT);
assertInstance(a.buffer, ArrayBuffer);
a = new Uint16Array([1,2,3]);
assertInstance(a, Uint16Array);
assertEquals(3, a.length);
assertEquals(6, a.byteLength);
assertEquals(6, a.buffer.byteLength);
assertEquals(2, a.BYTES_PER_ELEMENT);
assertEquals(1, a[0]);
assertEquals(3, a[2]);
assertInstance(a.buffer, ArrayBuffer);
a = new Uint32Array(a);
assertInstance(a, Uint32Array);
assertEquals(3, a.length);
assertEquals(12, a.byteLength);
assertEquals(12, a.buffer.byteLength);
assertEquals(4, a.BYTES_PER_ELEMENT);
assertEquals(1, a[0]);
assertEquals(3, a[2]);
assertInstance(a.buffer, ArrayBuffer);

// Check subarrays.
a = new Uint16Array([1,2,3,4,5,6]);
aa = a.subarray(3);
assertInstance(aa, Uint16Array);
assertEquals(3, aa.length);
assertEquals(6, aa.byteLength);
assertEquals(2, aa.BYTES_PER_ELEMENT);
assertSame(a.buffer, aa.buffer);
aa = a.subarray(3,5);
assertInstance(aa, Uint16Array);
assertEquals(2, aa.length);
assertEquals(4, aa.byteLength);
assertEquals(2, aa.BYTES_PER_ELEMENT);
assertSame(a.buffer, aa.buffer);
aa = a.subarray(4,8);
assertInstance(aa, Uint16Array);
assertEquals(2, aa.length);
assertEquals(4, aa.byteLength);
assertEquals(2, aa.BYTES_PER_ELEMENT);
assertSame(a.buffer, aa.buffer);
aa = a.subarray(9);
assertInstance(aa, Uint16Array);
assertEquals(0, aa.length);
assertEquals(0, aa.byteLength);
assertEquals(2, aa.BYTES_PER_ELEMENT);
assertSame(a.buffer, aa.buffer);
aa = a.subarray(-4);
assertInstance(aa, Uint16Array);
assertEquals(4, aa.length);
assertEquals(8, aa.byteLength);
assertEquals(2, aa.BYTES_PER_ELEMENT);
assertSame(a.buffer, aa.buffer);
aa = a.subarray(-3,-1);
assertInstance(aa, Uint16Array);
assertEquals(2, aa.length);
assertEquals(4, aa.byteLength);
assertEquals(2, aa.BYTES_PER_ELEMENT);
assertSame(a.buffer, aa.buffer);
aa = a.subarray(3,2);
assertInstance(aa, Uint16Array);
assertEquals(0, aa.length);
assertEquals(0, aa.byteLength);
assertEquals(2, aa.BYTES_PER_ELEMENT);
assertSame(a.buffer, aa.buffer);
aa = a.subarray(-3,-4);
assertInstance(aa, Uint16Array);
assertEquals(0, aa.length);
assertEquals(0, aa.byteLength);
assertEquals(2, aa.BYTES_PER_ELEMENT);
assertSame(a.buffer, aa.buffer);
aa = a.subarray(0,-8);
assertInstance(aa, Uint16Array);
assertEquals(0, aa.length);
assertEquals(0, aa.byteLength);
assertEquals(2, aa.BYTES_PER_ELEMENT);
assertSame(a.buffer, aa.buffer);

assertThrows(function(){ a.subarray.call({}, 0) });
assertThrows(function(){ a.subarray.call([], 0) });

// Try to call constructors directly as functions, and through .call
// and .apply. Should fail.

assertThrows(function() { ArrayBuffer(100); }, TypeError);
assertThrows(function() { Int8Array(b, 5, 77); }, TypeError);
assertThrows(function() { ArrayBuffer.call(null, 10); }, TypeError);
assertThrows(function() { Uint16Array.call(null, b, 2, 4); }, TypeError);
assertThrows(function() { ArrayBuffer.apply(null, [1000]); }, TypeError);
assertThrows(function() { Float32Array.apply(null, [b, 128, 1]); }, TypeError);

// Test array.set in different combinations.
var b = new ArrayBuffer(4)

function assertArrayPrefix(expected, array) {
  for (var i = 0; i < expected.length; ++i) {
    assertEquals(expected[i], array[i]);
  }
}

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

// Mixed types of same size.
var a61 = new Float32Array([1.2, 12.3])
var a62 = new Int32Array(2)
a62.set(a61)
assertArrayPrefix([1, 12], a62)
a61.set(a62)
assertArrayPrefix([1, 12], a61)

// Invalid source
a.set(0); // does not throw
assertArrayPrefix([1,2,3,4,5,6], a);
a.set({}); // does not throw
assertArrayPrefix([1,2,3,4,5,6], a);


// Test arraybuffer.slice

var a0 = new Int8Array([1, 2, 3, 4, 5, 6])
var b0 = a0.buffer

var b1 = b0.slice(0)
assertEquals(b0.byteLength, b1.byteLength)
assertArrayPrefix([1, 2, 3, 4, 5, 6], new Int8Array(b1))

var b2 = b0.slice(3)
assertEquals(b0.byteLength - 3, b2.byteLength)
assertArrayPrefix([4, 5, 6], new Int8Array(b2))

var b3 = b0.slice(2, 4)
assertEquals(2, b3.byteLength)
assertArrayPrefix([3, 4], new Int8Array(b3))

function goo(a, i) {
  return a[i];
}

function boo(a, i, v) {
  return a[i] = v;
}

function do_tagged_index_external_array_test(constructor) {
  var t_array = new constructor([1, 2, 3, 4, 5, 6]);
  %PrepareFunctionForOptimization(goo);
  %PrepareFunctionForOptimization(boo);
  assertEquals(1, goo(t_array, 0));
  assertEquals(1, goo(t_array, 0));
  boo(t_array, 0, 13);
  assertEquals(13, goo(t_array, 0));
  %OptimizeFunctionOnNextCall(goo);
  %OptimizeFunctionOnNextCall(boo);
  boo(t_array, 0, 15);
  assertEquals(15, goo(t_array, 0));
  %ClearFunctionFeedback(goo);
  %ClearFunctionFeedback(boo);
}

do_tagged_index_external_array_test(Int8Array);
do_tagged_index_external_array_test(Uint8Array);
do_tagged_index_external_array_test(Int16Array);
do_tagged_index_external_array_test(Uint16Array);
do_tagged_index_external_array_test(Int32Array);
do_tagged_index_external_array_test(Uint32Array);
do_tagged_index_external_array_test(Float32Array);
do_tagged_index_external_array_test(Float64Array);

var built_in_array = new Array(1, 2, 3, 4, 5, 6);
%PrepareFunctionForOptimization(goo);
%PrepareFunctionForOptimization(boo);
assertEquals(1, goo(built_in_array, 0));
assertEquals(1, goo(built_in_array, 0));
%OptimizeFunctionOnNextCall(goo);
%OptimizeFunctionOnNextCall(boo);
boo(built_in_array, 0, 11);
assertEquals(11, goo(built_in_array, 0));
%ClearFunctionFeedback(goo);
%ClearFunctionFeedback(boo);

built_in_array = new Array(1.5, 2, 3, 4, 5, 6);
%PrepareFunctionForOptimization(goo);
%PrepareFunctionForOptimization(boo);
assertEquals(1.5, goo(built_in_array, 0));
assertEquals(1.5, goo(built_in_array, 0));
%OptimizeFunctionOnNextCall(goo);
%OptimizeFunctionOnNextCall(boo);
boo(built_in_array, 0, 2.5);
assertEquals(2.5, goo(built_in_array, 0));
%ClearFunctionFeedback(goo);
%ClearFunctionFeedback(boo);

// Check all int range edge cases
function checkRange() {
  var e32 = Math.pow(2,32); var e31 = Math.pow(2,31);
  var e16 = Math.pow(2,16); var e15 = Math.pow(2,15);
  var e8 = Math.pow(2,8);   var e7 = Math.pow(2,7);
  var a7 = new Uint32Array(2);  var a71 = new Int32Array(2);
  var a72 = new Uint16Array(2); var a73 = new Int16Array(2);
  var a74 = new Uint8Array(2);  var a75 = new Int8Array(2);
  for (i = 1; i <= Math.pow(2,33); i *= 2) {
    var j = i-1;
    a7[0] = i; a71[0] = i; a72[0] = i; a73[0] = i; a74[0] = i; a75[0] = i;
    a7[1] = j; a71[1] = j; a72[1] = j; a73[1] = j; a74[1] = j; a75[1] = j;

    if (i < e32) { assertEquals(a7[0], i); } else { assertEquals(a7[0], 0); }
    if (j < e32) { assertEquals(a7[1], j); } else { assertEquals(a7[1],e32-1); }
    if (i < e31) { assertEquals(a71[0], i); } else {
      assertEquals(a71[0], (i < e32) ? -e31 : 0 ); }
    if (j < e31) { assertEquals(a71[1], j); } else { assertEquals(a71[1], -1); }

    if (i < e16) { assertEquals(a72[0], i); } else { assertEquals(a72[0], 0); }
    if (j < e16) { assertEquals(a72[1], j); } else { assertEquals(a72[1], e16-1); }
    if (i < e15) { assertEquals(a73[0], i); } else {
      assertEquals(a73[0], (i < e16) ? -e15 : 0 ); }
    if (j < e15) { assertEquals(a73[1], j); } else { assertEquals(a73[1], -1); }

    if (i < e8) { assertEquals(a74[0], i); } else { assertEquals(a74[0], 0); }
    if (j < e8) { assertEquals(a74[1], j); } else { assertEquals(a74[1], e8-1); }
    if (i < e7) { assertEquals(a75[0], i); } else {
      assertEquals(a75[0], (i < e8) ? -e7 : 0); }
    if (j < e7) { assertEquals(a75[1], j); } else { assertEquals(a75[1], -1); }
  }
}
checkRange();
