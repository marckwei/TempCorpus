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

// Copyright 2015 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --check-handle-count

(function (s) {
  s.frob = function () {
    var j;
    var p0 = /^[\],:{}\s]*$/;
    var p1 = /"[^"\\\n\r]*"|a|b|c|_*-?\d+(?:\.\d*)?(:?[eE][+\-]?\d+)?/g;
    var p2 = /(?:^|:|,)(?:\s*\[)+/g;
    if (p0.test(this.replace(/\\./g, '@').replace(p1, ']').replace(p2, ''))) {
       var tmp = eval('(' + this + ')');
       return 0;
     }
     return -1;
  };
})(String.prototype);

var kvJSON = '[\
  {\n    \"key\": "ionion",\n    \"value\": 779249\n  },\
  {\n    \"key\": "essess",\n    \"value\": 775215\n  },\
  {\n    \"key\": "lerler",\n    \"value\": 773163\n  },\
  {\n    \"key\": "essess",\n    \"value\": 778638\n  },\
  {\n    \"key\": "suosuo",\n    \"value\": 778428\n  },\
  {\n    \"key\": "astast",\n    \"value\": 779719\n  },\
  {\n    \"key\": "oidoid",\n    \"value\": 776316\n  },\
  {\n    \"key\": "onyony",\n    \"value\": 777017\n  },\
  {\n    \"key\": "oryory",\n    \"value\": 775785\n  },\
  {\n    \"key\": "ardard",\n    \"value\": 776276\n  },\
  {\n    \"key\": "nicnic",\n    \"value\": 773163\n  },\
  {\n    \"key\": "udyudy",\n    \"value\": 775255\n  },\
  {\n    \"key\": "blybly",\n    \"value\": 776546\n  },\
  {\n    \"key\": "ormorm",\n    \"value\": 770040\n  },\
  {\n    \"key\": "izeize",\n    \"value\": 774534\n  },\
  {\n    \"key\": "lialia",\n    \"value\": 775135\n  },\
  {\n    \"key\": "thythy",\n    \"value\": 773823\n  },\
  {\n    \"key\": "hiphip",\n    \"value\": 776526\n  },\
  {\n    \"key\": "iseise",\n    \"value\": 772322\n  },\
  {\n    \"key\": "salsal",\n    \"value\": 772122\n  },\
  {\n    \"key\": "essess",\n    \"value\": 775915\n  },\
  {\n    \"key\": "etaeta",\n    \"value\": 779719\n  },\
  {\n    \"key\": "kcakca",\n    \"value\": 776616\n  },\
  {\n    \"key\": "tiktik",\n    \"value\": 773513\n  },\
  {\n    \"key\": "rerrer",\n    \"value\": 773413\n  },\
  {\n    \"key\": "teatea",\n    \"value\": 773313\n  },\
  {\n    \"key\": "izeize",\n    \"value\": 774214\n  },\
  {\n    \"key\": "reyrey",\n    \"value\": 777117\n  },\
  {\n    \"key\": "oteote",\n    \"value\": 770110\n  },\
  {\n    \"key\": "essess",\n    \"value\": 773013\n  },\
  {\n    \"key\": "essess",\n    \"value\": 778798\n  },\
  {\n    \"key\": "tchtch",\n    \"value\": 774294\n  },\
  {\n    \"key\": "taltal",\n    \"value\": 775785\n  },\
  {\n    \"key\": "risris",\n    \"value\": 770380\n  },\
  {\n    \"key\": "ateate",\n    \"value\": 779879\n  },\
  {\n    \"key\": "ousous",\n    \"value\": 770570\n  },\
  {\n    \"key\": "essess",\n    \"value\": 775175\n  },\
  {\n    \"key\": "lesles",\n    \"value\": 772862\n  },\
  {\n    \"key\": "iveive",\n    \"value\": 771561\n  },\
  {\n    \"key\": "diadia",\n    \"value\": 772262\n  },\
  {\n    \"key\": "ekieki",\n    \"value\": 776956\n  },\
  {\n    \"key\": "omaoma",\n    \"value\": 771751\n  },\
  {\n    \"key\": "nalnal",\n    \"value\": 777457\n  },\
  {\n    \"key\": "essess",\n    \"value\": 776256\n  },\
  {\n    \"key\": "ilyily",\n    \"value\": 775055\n  },\
  {\n    \"key\": "emuemu",\n    \"value\": 776846\n  },\
  {\n    \"key\": "eeteet",\n    \"value\": 778648\n  },\
  {\n    \"key\": "rerrer",\n    \"value\": 770540\n  },\
  {\n    \"key\": "eaeeae",\n    \"value\": 774344\n  },\
  {\n    \"key\": "lumlum",\n    \"value\": 779149\n  },\
  {\n    \"key\": "essess",\n    \"value\": 774044\n  },\
  {\n    \"key\": "antant",\n    \"value\": 771931\n  },\
  {\n    \"key\": "lahlah",\n    \"value\": 778738\n  },\
  {\n    \"key\": "tnatna",\n    \"value\": 775635\n  },\
  {\n    \"key\": "oseose",\n    \"value\": 774534\n  },\
  {\n    \"key\": "ataata",\n    \"value\": 773433\n  },\
  {\n    \"key\": "inging",\n    \"value\": 772332\n  },\
  {\n    \"key\": "ypeype",\n    \"value\": 772232\n  },\
  {\n    \"key\": "tictic",\n    \"value\": 772132\n  },\
  {\n    \"key\": "hiphip",\n    \"value\": 773033\n  },\
  {\n    \"key\": "taltal",\n    \"value\": 774924\n  },\
  {\n    \"key\": "istist",\n    \"value\": 776826\n  },\
  {\n    \"key\": "ralral",\n    \"value\": 778728\n  },\
  {\n    \"key\": "tortor",\n    \"value\": 770720\n  },\
  {\n    \"key\": "rnsrns",\n    \"value\": 773623\n  },\
  {\n    \"key\": "siasia",\n    \"value\": 776526\n  },\
  {\n    \"key\": "yabyab",\n    \"value\": 779429\n  },\
  {\n    \"key\": "noinoi",\n    \"value\": 773423\n  },\
  {\n    \"key\": "ardard",\n    \"value\": 777327\n  },\
  {\n    \"key\": "derder",\n    \"value\": 771321\n  },\
  {\n    \"key\": "iveive",\n    \"value\": 775225\n  },\
  {\n    \"key\": "ateate",\n    \"value\": 779129\n  },\
  {\n    \"key\": "imoimo",\n    \"value\": 774124\n  },\
  {\n    \"key\": "adeade",\n    \"value\": 779029\n  },\
  {\n    \"key\": "ugeuge",\n    \"value\": 774024\n  },\
  {\n    \"key\": "iveive",\n    \"value\": 779919\n  },\
  {\n    \"key\": "belbel",\n    \"value\": 775915\n  },\
  {\n    \"key\": "inging",\n    \"value\": 770910\n  },\
  {\n    \"key\": "barbar",\n    \"value\": 776816\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 772812\n  },\
  {\n    \"key\": "ineine",\n    \"value\": 778718\n  },\
  {\n    \"key\": "ityity",\n    \"value\": 774714\n  },\
  {\n    \"key\": "ytiyti",\n    \"value\": 770710\n  },\
  {\n    \"key\": "ismism",\n    \"value\": 777617\n  },\
  {\n    \"key\": "iumium",\n    \"value\": 773613\n  },\
  {\n    \"key\": "hichic",\n    \"value\": 770610\n  },\
  {\n    \"key\": "ideide",\n    \"value\": 777517\n  },\
  {\n    \"key\": "denden",\n    \"value\": 774514\n  },\
  {\n    \"key\": "redred",\n    \"value\": 770510\n  },\
  {\n    \"key\": "perper",\n    \"value\": 778418\n  },\
  {\n    \"key\": "rusrus",\n    \"value\": 775415\n  },\
  {\n    \"key\": "herher",\n    \"value\": 772412\n  },\
  {\n    \"key\": "sidsid",\n    \"value\": 779319\n  },\
  {\n    \"key\": "ianian",\n    \"value\": 777317\n  },\
  {\n    \"key\": "ricric",\n    \"value\": 774314\n  },\
  {\n    \"key\": "odyody",\n    \"value\": 772312\n  },\
  {\n    \"key\": "ferfer",\n    \"value\": 779219\n  },\
  {\n    \"key\": "ogyogy",\n    \"value\": 777217\n  },\
  {\n    \"key\": "micmic",\n    \"value\": 775215\n  },\
  {\n    \"key\": "ateate",\n    \"value\": 772212\n  },\
  {\n    \"key\": "tantan",\n    \"value\": 770210\n  },\
  {\n    \"key\": "getget",\n    \"value\": 778118\n  },\
  {\n    \"key\": "ulaula",\n    \"value\": 776116\n  },\
  {\n    \"key\": "calcal",\n    \"value\": 774114\n  },\
  {\n    \"key\": "izeize",\n    \"value\": 772112\n  },\
  {\n    \"key\": "manman",\n    \"value\": 770110\n  },\
  {\n    \"key\": "terter",\n    \"value\": 778018\n  },\
  {\n    \"key\": "hedhed",\n    \"value\": 777017\n  },\
  {\n    \"key\": "berber",\n    \"value\": 775015\n  },\
  {\n    \"key\": "olfolf",\n    \"value\": 773013\n  },\
  {\n    \"key\": "opeope",\n    \"value\": 772012\n  },\
  {\n    \"key\": "hiphip",\n    \"value\": 770010\n  },\
  {\n    \"key\": "tedted",\n    \"value\": 779899\n  },\
  {\n    \"key\": "ismism",\n    \"value\": 773793\n  },\
  {\n    \"key\": "terter",\n    \"value\": 778598\n  },\
  {\n    \"key\": "ismism",\n    \"value\": 774494\n  },\
  {\n    \"key\": "ikeike",\n    \"value\": 779299\n  },\
  {\n    \"key\": "sdrsdr",\n    \"value\": 776196\n  },\
  {\n    \"key\": "calcal",\n    \"value\": 772092\n  },\
  {\n    \"key\": "ledled",\n    \"value\": 779889\n  },\
  {\n    \"key\": "coicoi",\n    \"value\": 776786\n  },\
  {\n    \"key\": "ialial",\n    \"value\": 773683\n  },\
  {\n    \"key\": "izeize",\n    \"value\": 771581\n  },\
  {\n    \"key\": "ogyogy",\n    \"value\": 778388\n  },\
  {\n    \"key\": "ismism",\n    \"value\": 777287\n  },\
  {\n    \"key\": "Huk",\n    \"value\": 775185\n  },\
  {\n    \"key\": "nonnon",\n    \"value\": 774084\n  },\
  {\n    \"key\": "ledled",\n    \"value\": 773973\n  },\
  {\n    \"key\": "llylly",\n    \"value\": 772872\n  },\
  {\n    \"key\": "ishish",\n    \"value\": 771771\n  },\
  {\n    \"key\": "terter",\n    \"value\": 771671\n  },\
  {\n    \"key\": "iorior",\n    \"value\": 771571\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 771471\n  },\
  {\n    \"key\": "luslus",\n    \"value\": 771371\n  },\
  {\n    \"key\": "detdet",\n    \"value\": 771271\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 772172\n  },\
  {\n    \"key\": "ezoezo",\n    \"value\": 773073\n  },\
  {\n    \"key\": "iceice",\n    \"value\": 774964\n  },\
  {\n    \"key\": "piapia",\n    \"value\": 775865\n  },\
  {\n    \"key\": "nedned",\n    \"value\": 776766\n  },\
  {\n    \"key\": "ffaffa",\n    \"value\": 778668\n  },\
  {\n    \"key\": "oidoid",\n    \"value\": 779569\n  },\
  {\n    \"key\": "ureure",\n    \"value\": 771561\n  },\
  {\n    \"key\": "akaaka",\n    \"value\": 773463\n  },\
  {\n    \"key\": "jimjim",\n    \"value\": 775365\n  },\
  {\n    \"key\": "calcal",\n    \"value\": 778268\n  },\
  {\n    \"key\": "istist",\n    \"value\": 770260\n  },\
  {\n    \"key\": "ickick",\n    \"value\": 773163\n  },\
  {\n    \"key\": "ncence",\n    \"value\": 775065\n  },\
  {\n    \"key\": "ikeike",\n    \"value\": 778958\n  },\
  {\n    \"key\": "omeome",\n    \"value\": 771951\n  },\
  {\n    \"key\": "ismism",\n    \"value\": 774854\n  },\
  {\n    \"key\": "eeleel",\n    \"value\": 778758\n  },\
  {\n    \"key\": "ialial",\n    \"value\": 771751\n  },\
  {\n    \"key\": "deadea",\n    \"value\": 774654\n  },\
  {\n    \"key\": "fulful",\n    \"value\": 778558\n  },\
  {\n    \"key\": "bleble",\n    \"value\": 772552\n  },\
  {\n    \"key\": "tahtah",\n    \"value\": 776456\n  },\
  {\n    \"key\": "astast",\n    \"value\": 770450\n  },\
  {\n    \"key\": "ylsyls",\n    \"value\": 774354\n  },\
  {\n    \"key\": "ziazia",\n    \"value\": 778258\n  },\
  {\n    \"key\": "ssesse",\n    \"value\": 772252\n  },\
  {\n    \"key\": "essess",\n    \"value\": 776156\n  },\
  {\n    \"key\": "lewlew",\n    \"value\": 771151\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 775055\n  },\
  {\n    \"key\": "ackack",\n    \"value\": 770050\n  },\
  {\n    \"key\": "wedwed",\n    \"value\": 775945\n  },\
  {\n    \"key\": "gnigni",\n    \"value\": 779849\n  },\
  {\n    \"key\": "areare",\n    \"value\": 774844\n  },\
  {\n    \"key\": "oleole",\n    \"value\": 779749\n  },\
  {\n    \"key\": "ateate",\n    \"value\": 774744\n  },\
  {\n    \"key\": "ousous",\n    \"value\": 779649\n  },\
  {\n    \"key\": "niania",\n    \"value\": 775645\n  },\
  {\n    \"key\": "tletle",\n    \"value\": 770640\n  },\
  {\n    \"key\": "cimcim",\n    \"value\": 775545\n  },\
  {\n    \"key\": "eedeed",\n    \"value\": 771541\n  },\
  {\n    \"key\": "bleble",\n    \"value\": 776446\n  },\
  {\n    \"key\": "tcatca",\n    \"value\": 772442\n  },\
  {\n    \"key\": "oneone",\n    \"value\": 777347\n  },\
  {\n    \"key\": "nidnid",\n    \"value\": 773343\n  },\
  {\n    \"key\": "hnahna",\n    \"value\": 779249\n  },\
  {\n    \"key\": "olfolf",\n    \"value\": 775245\n  },\
  {\n    \"key\": "ousous",\n    \"value\": 770240\n  },\
  {\n    \"key\": "verver",\n    \"value\": 776146\n  },\
  {\n    \"key\": "oseose",\n    \"value\": 772142\n  },\
  {\n    \"key\": "tictic",\n    \"value\": 779049\n  },\
  {\n    \"key\": "essess",\n    \"value\": 775045\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 771041\n  },\
  {\n    \"key\": "iedied",\n    \"value\": 777937\n  },\
  {\n    \"key\": "diadia",\n    \"value\": 773933\n  },\
  {\n    \"key\": "ityity",\n    \"value\": 770930\n  },\
  {\n    \"key\": "fulful",\n    \"value\": 776836\n  },\
  {\n    \"key\": "ukeuke",\n    \"value\": 773833\n  },\
  {\n    \"key\": "intint",\n    \"value\": 779739\n  },\
  {\n    \"key\": "hoqhoq",\n    \"value\": 776736\n  },\
  {\n    \"key\": "yoxyox",\n    \"value\": 772732\n  },\
  {\n    \"key\": "taltal",\n    \"value\": 779639\n  },\
  {\n    \"key\": "paipai",\n    \"value\": 776636\n  },\
  {\n    \"key\": "eanean",\n    \"value\": 772632\n  },\
  {\n    \"key\": "ineine",\n    \"value\": 779539\n  },\
  {\n    \"key\": "uthuth",\n    \"value\": 776536\n  },\
  {\n    \"key\": "izeize",\n    \"value\": 773533\n  },\
  {\n    \"key\": "rubrub",\n    \"value\": 770530\n  },\
  {\n    \"key\": "ilyily",\n    \"value\": 777437\n  },\
  {\n    \"key\": "ylbylb",\n    \"value\": 774434\n  },\
  {\n    \"key\": "liclic",\n    \"value\": 771431\n  },\
  {\n    \"key\": "bleble",\n    \"value\": 778338\n  },\
  {\n    \"key\": "elyely",\n    \"value\": 775335\n  },\
  {\n    \"key\": "nelnel",\n    \"value\": 772332\n  },\
  {\n    \"key\": "siasia",\n    \"value\": 779239\n  },\
  {\n    \"key\": "monmon",\n    \"value\": 777237\n  },\
  {\n    \"key\": "rinrin",\n    \"value\": 774234\n  },\
  {\n    \"key\": "nalnal",\n    \"value\": 771231\n  },\
  {\n    \"key\": "etyety",\n    \"value\": 779139\n  },\
  {\n    \"key\": "tictic",\n    \"value\": 776136\n  },\
  {\n    \"key\": "hsuhsu",\n    \"value\": 773133\n  },\
  {\n    \"key\": "testes",\n    \"value\": 771131\n  },\
  {\n    \"key\": "ritrit",\n    \"value\": 778038\n  },\
  {\n    \"key\": "gabgab",\n    \"value\": 776036\n  },\
  {\n    \"key\": "naenae",\n    \"value\": 773033\n  },\
  {\n    \"key\": "noinoi",\n    \"value\": 771031\n  },\
  {\n    \"key\": "ondond",\n    \"value\": 778928\n  },\
  {\n    \"key\": "nisnis",\n    \"value\": 776926\n  },\
  {\n    \"key\": "ianian",\n    \"value\": 774924\n  },\
  {\n    \"key\": "cincin",\n    \"value\": 771921\n  },\
  {\n    \"key\": "luslus",\n    \"value\": 779829\n  },\
  {\n    \"key\": "llylly",\n    \"value\": 777827\n  },\
  {\n    \"key\": "ltylty",\n    \"value\": 775825\n  },\
  {\n    \"key\": "nienie",\n    \"value\": 772822\n  },\
  {\n    \"key\": "ookook",\n    \"value\": 770820\n  },\
  {\n    \"key\": "oinoin",\n    \"value\": 778728\n  },\
  {\n    \"key\": "dmidmi",\n    \"value\": 776726\n  },\
  {\n    \"key\": "macmac",\n    \"value\": 774724\n  },\
  {\n    \"key\": "bleble",\n    \"value\": 772722\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 770720\n  },\
  {\n    \"key\": "manman",\n    \"value\": 778628\n  },\
  {\n    \"key\": "cipcip",\n    \"value\": 776626\n  },\
  {\n    \"key\": "barbar",\n    \"value\": 774624\n  },\
  {\n    \"key\": "llylly",\n    \"value\": 772622\n  },\
  {\n    \"key\": "hothot",\n    \"value\": 770620\n  },\
  {\n    \"key\": "oodood",\n    \"value\": 778528\n  },\
  {\n    \"key\": "cumcum",\n    \"value\": 776526\n  },\
  {\n    \"key\": "rkarka",\n    \"value\": 774524\n  },\
  {\n    \"key\": "iveive",\n    \"value\": 772522\n  },\
  {\n    \"key\": "ranran",\n    \"value\": 771521\n  },\
  {\n    \"key\": "lesles",\n    \"value\": 779429\n  },\
  {\n    \"key\": "fulful",\n    \"value\": 777427\n  },\
  {\n    \"key\": "nalnal",\n    \"value\": 775425\n  },\
  {\n    \"key\": "ousous",\n    \"value\": 773423\n  },\
  {\n    \"key\": "inging",\n    \"value\": 772422\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 770420\n  },\
  {\n    \"key\": "ousous",\n    \"value\": 778328\n  },\
  {\n    \"key\": "pitpit",\n    \"value\": 777327\n  },\
  {\n    \"key\": "oicoic",\n    \"value\": 775325\n  },\
  {\n    \"key\": "vetvet",\n    \"value\": 773323\n  },\
  {\n    \"key\": "erkerk",\n    \"value\": 772322\n  },\
  {\n    \"key\": "ncyncy",\n    \"value\": 770320\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 779229\n  },\
  {\n    \"key\": "inging",\n    \"value\": 777227\n  },\
  {\n    \"key\": "tictic",\n    \"value\": 775225\n  },\
  {\n    \"key\": "sissis",\n    \"value\": 774224\n  },\
  {\n    \"key\": "rgyrgy",\n    \"value\": 772222\n  },\
  {\n    \"key\": "tictic",\n    \"value\": 771221\n  },\
  {\n    \"key\": "oedoed",\n    \"value\": 779129\n  },\
  {\n    \"key\": "omaoma",\n    \"value\": 778128\n  },\
  {\n    \"key\": "hiphip",\n    \"value\": 777127\n  },\
  {\n    \"key\": "ncence",\n    \"value\": 775125\n  },\
  {\n    \"key\": "ousous",\n    \"value\": 774124\n  },\
  {\n    \"key\": "rghrgh",\n    \"value\": 772122\n  },\
  {\n    \"key\": "ebtebt",\n    \"value\": 771121\n  },\
  {\n    \"key\": "msimsi",\n    \"value\": 779029\n  },\
  {\n    \"key\": "inging",\n    \"value\": 778028\n  },\
  {\n    \"key\": "aukauk",\n    \"value\": 777027\n  },\
  {\n    \"key\": "getget",\n    \"value\": 775025\n  },\
  {\n    \"key\": "otaota",\n    \"value\": 774024\n  },\
  {\n    \"key\": "oseose",\n    \"value\": 773023\n  },\
  {\n    \"key\": "sapsap",\n    \"value\": 771021\n  },\
  {\n    \"key\": "micmic",\n    \"value\": 770020\n  },\
  {\n    \"key\": "calcal",\n    \"value\": 779919\n  },\
  {\n    \"key\": "ismism",\n    \"value\": 778918\n  },\
  {\n    \"key\": "dlydly",\n    \"value\": 776916\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 775915\n  },\
  {\n    \"key\": "stysty",\n    \"value\": 774914\n  },\
  {\n    \"key\": "kgokgo",\n    \"value\": 773913\n  },\
  {\n    \"key\": "entent",\n    \"value\": 772912\n  },\
  {\n    \"key\": "entent",\n    \"value\": 770910\n  },\
  {\n    \"key\": "manman",\n    \"value\": 779819\n  },\
  {\n    \"key\": "minmin",\n    \"value\": 778818\n  },\
  {\n    \"key\": "gotgot",\n    \"value\": 777817\n  },\
  {\n    \"key\": "unkunk",\n    \"value\": 776816\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 775815\n  },\
  {\n    \"key\": "kerker",\n    \"value\": 773813\n  },\
  {\n    \"key\": "eltelt",\n    \"value\": 772812\n  },\
  {\n    \"key\": "manman",\n    \"value\": 771811\n  },\
  {\n    \"key\": "ncence",\n    \"value\": 770810\n  },\
  {\n    \"key\": "ernern",\n    \"value\": 779719\n  },\
  {\n    \"key\": "eegeeg",\n    \"value\": 778718\n  },\
  {\n    \"key\": "athath",\n    \"value\": 777717\n  },\
  {\n    \"key\": "daedae",\n    \"value\": 776716\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 775715\n  },\
  {\n    \"key\": "kerker",\n    \"value\": 774714\n  },\
  {\n    \"key\": "terter",\n    \"value\": 773713\n  },\
  {\n    \"key\": "essess",\n    \"value\": 772712\n  },\
  {\n    \"key\": "aneane",\n    \"value\": 771711\n  },\
  {\n    \"key\": "lahlah",\n    \"value\": 770710\n  },\
  {\n    \"key\": "inging",\n    \"value\": 779619\n  },\
  {\n    \"key\": "pilpil",\n    \"value\": 778618\n  },\
  {\n    \"key\": "iseise",\n    \"value\": 777617\n  },\
  {\n    \"key\": "sonson",\n    \"value\": 776616\n  },\
  {\n    \"key\": "ityity",\n    \"value\": 775615\n  },\
  {\n    \"key\": "esaesa",\n    \"value\": 774614\n  },\
  {\n    \"key\": "araara",\n    \"value\": 773613\n  },\
  {\n    \"key\": "perper",\n    \"value\": 772612\n  },\
  {\n    \"key\": "siasia",\n    \"value\": 771611\n  },\
  {\n    \"key\": "bleble",\n    \"value\": 770610\n  },\
  {\n    \"key\": "rumrum",\n    \"value\": 779519\n  },\
  {\n    \"key\": "toltol",\n    \"value\": 779519\n  },\
  {\n    \"key\": "ousous",\n    \"value\": 778518\n  },\
  {\n    \"key\": "ateate",\n    \"value\": 777517\n  },\
  {\n    \"key\": "verver",\n    \"value\": 776516\n  },\
  {\n    \"key\": "psepse",\n    \"value\": 775515\n  },\
  {\n    \"key\": "rkyrky",\n    \"value\": 774514\n  },\
  {\n    \"key\": "uleule",\n    \"value\": 773513\n  },\
  {\n    \"key\": "adaada",\n    \"value\": 772512\n  },\
  {\n    \"key\": "minmin",\n    \"value\": 772512\n  },\
  {\n    \"key\": "amiami",\n    \"value\": 771511\n  },\
  {\n    \"key\": "ulfulf",\n    \"value\": 770510\n  },\
  {\n    \"key\": "rtzrtz",\n    \"value\": 779419\n  },\
  {\n    \"key\": "ockock",\n    \"value\": 778418\n  },\
  {\n    \"key\": "izeize",\n    \"value\": 778418\n  },\
  {\n    \"key\": "oidoid",\n    \"value\": 777417\n  },\
  {\n    \"key\": "bisbis",\n    \"value\": 776416\n  },\
  {\n    \"key\": "nedned",\n    \"value\": 775415\n  },\
  {\n    \"key\": "ralral",\n    \"value\": 774414\n  },\
  {\n    \"key\": "aryary",\n    \"value\": 774414\n  },\
  {\n    \"key\": "ikeike",\n    \"value\": 773413\n  },\
  {\n    \"key\": "terter",\n    \"value\": 772412\n  },\
  {\n    \"key\": "oveove",\n    \"value\": 771411\n  },\
  {\n    \"key\": "ineine",\n    \"value\": 771411\n  },\
  {\n    \"key\": "ebiebi",\n    \"value\": 770410\n  },\
  {\n    \"key\": "iumium",\n    \"value\": 779319\n  },\
  {\n    \"key\": "dgedge",\n    \"value\": 779319\n  },\
  {\n    \"key\": "riaria",\n    \"value\": 778318\n  },\
  {\n    \"key\": "upaupa",\n    \"value\": 777317\n  },\
  {\n    \"key\": "entent",\n    \"value\": 776316\n  },\
  {\n    \"key\": "eneene",\n    \"value\": 776316\n  },\
  {\n    \"key\": "ridrid",\n    \"value\": 775315\n  },\
  {\n    \"key\": "llelle",\n    \"value\": 774314\n  },\
  {\n    \"key\": "dlydly",\n    \"value\": 774314\n  },\
  {\n    \"key\": "angang",\n    \"value\": 773313\n  },\
  {\n    \"key\": "tictic",\n    \"value\": 772312\n  },\
  {\n    \"key\": "ontont",\n    \"value\": 772312\n  },\
  {\n    \"key\": "astast",\n    \"value\": 771311\n  },\
  {\n    \"key\": "suosuo",\n    \"value\": 770310\n  },\
  {\n    \"key\": "essess",\n    \"value\": 770310\n  },\
  {\n    \"key\": "essess",\n    \"value\": 779219\n  },\
  {\n    \"key\": "istist",\n    \"value\": 778218\n  },\
  {\n    \"key\": "inaina",\n    \"value\": 778218\n  },\
  {\n    \"key\": "ewdewd",\n    \"value\": 777217\n  },\
  {\n    \"key\": "verver",\n    \"value\": 776216\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 776216\n  },\
  {\n    \"key\": "ardard",\n    \"value\": 775215\n  },\
  {\n    \"key\": "pidpid",\n    \"value\": 775215\n  },\
  {\n    \"key\": "eltelt",\n    \"value\": 774214\n  },\
  {\n    \"key\": "letlet",\n    \"value\": 773213\n  },\
  {\n    \"key\": "iesies",\n    \"value\": 773213\n  },\
  {\n    \"key\": "ityity",\n    \"value\": 772212\n  },\
  {\n    \"key\": "chacha",\n    \"value\": 772212\n  },\
  {\n    \"key\": "ngenge",\n    \"value\": 771211\n  },\
  {\n    \"key\": "terter",\n    \"value\": 770210\n  },\
  {\n    \"key\": "eanean",\n    \"value\": 770210\n  },\
  {\n    \"key\": "bleble",\n    \"value\": 779119\n  },\
  {\n    \"key\": "llylly",\n    \"value\": 779119\n  },\
  {\n    \"key\": "hiphip",\n    \"value\": 778118\n  },\
  {\n    \"key\": "omaoma",\n    \"value\": 778118\n  },\
  {\n    \"key\": "agoago",\n    \"value\": 777117\n  },\
  {\n    \"key\": "oidoid",\n    \"value\": 776116\n  },\
  {\n    \"key\": "manman",\n    \"value\": 776116\n  },\
  {\n    \"key\": "ismism",\n    \"value\": 775115\n  },\
  {\n    \"key\": "audaud",\n    \"value\": 775115\n  },\
  {\n    \"key\": "ismism",\n    \"value\": 774114\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 774114\n  },\
  {\n    \"key\": "thgthg",\n    \"value\": 773113\n  },\
  {\n    \"key\": "endend",\n    \"value\": 773113\n  },\
  {\n    \"key\": "udeude",\n    \"value\": 772112\n  },\
  {\n    \"key\": "ashash",\n    \"value\": 772112\n  },\
  {\n    \"key\": "ankank",\n    \"value\": 771111\n  },\
  {\n    \"key\": "calcal",\n    \"value\": 771111\n  },\
  {\n    \"key\": "pleple",\n    \"value\": 770110\n  },\
  {\n    \"key\": "hedhed",\n    \"value\": 770110\n  },\
  {\n    \"key\": "bleble",\n    \"value\": 779019\n  },\
  {\n    \"key\": "tictic",\n    \"value\": 779019\n  },\
  {\n    \"key\": "yteyte",\n    \"value\": 778018\n  },\
  {\n    \"key\": "oldold",\n    \"value\": 778018\n  },\
  {\n    \"key\": "steste",\n    \"value\": 777017\n  },\
  {\n    \"key\": "ishish",\n    \"value\": 777017\n  },\
  {\n    \"key\": "ineine",\n    \"value\": 776016\n  },\
  {\n    \"key\": "manman",\n    \"value\": 776016\n  },\
  {\n    \"key\": "miamia",\n    \"value\": 775015\n  },\
  {\n    \"key\": "ifeife",\n    \"value\": 775015\n  },\
  {\n    \"key\": "ssassa",\n    \"value\": 774014\n  },\
  {\n    \"key\": "apeape",\n    \"value\": 774014\n  },\
  {\n    \"key\": "essess",\n    \"value\": 773013\n  },\
  {\n    \"key\": "fowfow",\n    \"value\": 773013\n  },\
  {\n    \"key\": "siasia",\n    \"value\": 773013\n  },\
  {\n    \"key\": "bleble",\n    \"value\": 772012\n  },\
  {\n    \"key\": "eaeeae",\n    \"value\": 772012\n  },\
  {\n    \"key\": "larlar",\n    \"value\": 771011\n  },\
  {\n    \"key\": "tedted",\n    \"value\": 771011\n  },\
  {\n    \"key\": "ralral",\n    \"value\": 770010\n  },\
  {\n    \"key\": "ousous",\n    \"value\": 770010\n  },\
  {\n    \"key\": "hpahpa",\n    \"value\": 779999\n  },\
  {\n    \"key\": "iumium",\n    \"value\": 775995\n  },\
  {\n    \"key\": "reeree",\n    \"value\": 770990\n  },\
  {\n    \"key\": "hinhin",\n    \"value\": 776896\n  },\
  {\n    \"key\": "malmal",\n    \"value\": 772892\n  },\
  {\n    \"key\": "hathat",\n    \"value\": 778798\n  },\
  {\n    \"key\": "dondon",\n    \"value\": 774794\n  },\
  {\n    \"key\": "tictic",\n    \"value\": 770790\n  },\
  {\n    \"key\": "ataata",\n    \"value\": 776696\n  },\
  {\n    \"key\": "ilyily",\n    \"value\": 771691\n  },\
  {\n    \"key\": "assass",\n    \"value\": 777597\n  },\
  {\n    \"key\": "trytry",\n    \"value\": 773593\n  },\
  {\n    \"key\": "essess",\n    \"value\": 779499\n  },\
  {\n    \"key\": "ssesse",\n    \"value\": 775495\n  },\
  {\n    \"key\": "horhor",\n    \"value\": 772492\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 778398\n  },\
  {\n    \"key\": "glygly",\n    \"value\": 774394\n  },\
  {\n    \"key\": "izeize",\n    \"value\": 770390\n  },\
  {\n    \"key\": "essess",\n    \"value\": 776296\n  },\
  {\n    \"key\": "dledle",\n    \"value\": 772292\n  },\
  {\n    \"key\": "calcal",\n    \"value\": 778198\n  },\
  {\n    \"key\": "denden",\n    \"value\": 775195\n  },\
  {\n    \"key\": "ateate",\n    \"value\": 771191\n  },\
  {\n    \"key\": "ylsyls",\n    \"value\": 777097\n  },\
  {\n    \"key\": "oidoid",\n    \"value\": 774094\n  },\
  {\n    \"key\": "llalla",\n    \"value\": 770090\n  },\
  {\n    \"key\": "inging",\n    \"value\": 776986\n  },\
  {\n    \"key\": "omeome",\n    \"value\": 773983\n  },\
  {\n    \"key\": "ttette",\n    \"value\": 779889\n  },\
  {\n    \"key\": "uliuli",\n    \"value\": 776886\n  },\
  {\n    \"key\": "istist",\n    \"value\": 772882\n  },\
  {\n    \"key\": "dlydly",\n    \"value\": 778788\n  },\
  {\n    \"key\": "riaria",\n    \"value\": 775785\n  },\
  {\n    \"key\": "ianian",\n    \"value\": 771781\n  },\
  {\n    \"key\": "deldel",\n    \"value\": 778688\n  },\
  {\n    \"key\": "eaeeae",\n    \"value\": 775685\n  },\
  {\n    \"key\": "gungun",\n    \"value\": 771681\n  },\
  {\n    \"key\": "inging",\n    \"value\": 778588\n  },\
  {\n    \"key\": "noinoi",\n    \"value\": 774584\n  },\
  {\n    \"key\": "serser",\n    \"value\": 771581\n  },\
  {\n    \"key\": "ikeike",\n    \"value\": 778488\n  },\
  {\n    \"key\": "rkyrky",\n    \"value\": 774484\n  },\
  {\n    \"key\": "fulful",\n    \"value\": 771481\n  },\
  {\n    \"key\": "acyacy",\n    \"value\": 778388\n  },\
  {\n    \"key\": "nedned",\n    \"value\": 775385\n  },\
  {\n    \"key\": "icaica",\n    \"value\": 771381\n  },\
  {\n    \"key\": "ousous",\n    \"value\": 778288\n  },\
  {\n    \"key\": "gyegye",\n    \"value\": 775285\n  },\
  {\n    \"key\": "iumium",\n    \"value\": 772282\n  },\
  {\n    \"key\": "ockock",\n    \"value\": 779189\n  },\
  {\n    \"key\": "ushush",\n    \"value\": 775185\n  },\
  {\n    \"key\": "noinoi",\n    \"value\": 772182\n  },\
  {\n    \"key\": "ootoot",\n    \"value\": 779089\n  },\
  {\n    \"key\": "entent",\n    \"value\": 776086\n  },\
  {\n    \"key\": "llylly",\n    \"value\": 773083\n  },\
  {\n    \"key\": "ilyily",\n    \"value\": 770080\n  },\
  {\n    \"key\": "sdrsdr",\n    \"value\": 777977\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 774974\n  },\
  {\n    \"key\": "hlyhly",\n    \"value\": 771971\n  },\
  {\n    \"key\": "adoado",\n    \"value\": 778878\n  },\
  {\n    \"key\": "inkink",\n    \"value\": 775875\n  },\
  {\n    \"key\": "ineine",\n    \"value\": 772872\n  },\
  {\n    \"key\": "ousous",\n    \"value\": 779779\n  },\
  {\n    \"key\": "opeope",\n    \"value\": 776776\n  },\
  {\n    \"key\": "cilcil",\n    \"value\": 773773\n  },\
  {\n    \"key\": "ncyncy",\n    \"value\": 771771\n  },\
  {\n    \"key\": "opyopy",\n    \"value\": 778678\n  },\
  {\n    \"key\": "essess",\n    \"value\": 775675\n  },\
  {\n    \"key\": "ygoygo",\n    \"value\": 772672\n  },\
  {\n    \"key\": "ricric",\n    \"value\": 779579\n  },\
  {\n    \"key\": "inging",\n    \"value\": 776576\n  },\
  {\n    \"key\": "einein",\n    \"value\": 774574\n  },\
  {\n    \"key\": "onaona",\n    \"value\": 771571\n  },\
  {\n    \"key\": "elyely",\n    \"value\": 778478\n  },\
  {\n    \"key\": "auraur",\n    \"value\": 775475\n  },\
  {\n    \"key\": "tortor",\n    \"value\": 773473\n  },\
  {\n    \"key\": "iveive",\n    \"value\": 770470\n  },\
  {\n    \"key\": "taltal",\n    \"value\": 777377\n  },\
  {\n    \"key\": "daedae",\n    \"value\": 775375\n  },\
  {\n    \"key\": "rkarka",\n    \"value\": 772372\n  },\
  {\n    \"key\": "wayway",\n    \"value\": 779279\n  },\
  {\n    \"key\": "ousous",\n    \"value\": 777277\n  },\
  {\n    \"key\": "iveive",\n    \"value\": 774274\n  },\
  {\n    \"key\": "woewoe",\n    \"value\": 772272\n  },\
  {\n    \"key\": "rphrph",\n    \"value\": 779179\n  },\
  {\n    \"key\": "eeteet",\n    \"value\": 776176\n  },\
  {\n    \"key\": "gnigni",\n    \"value\": 774174\n  },\
  {\n    \"key\": "inkink",\n    \"value\": 771171\n  },\
  {\n    \"key\": "terter",\n    \"value\": 779079\n  },\
  {\n    \"key\": "ronron",\n    \"value\": 776076\n  },\
  {\n    \"key\": "ageage",\n    \"value\": 774074\n  },\
  {\n    \"key\": "oeaoea",\n    \"value\": 771071\n  },\
  {\n    \"key\": "geygey",\n    \"value\": 779969\n  },\
  {\n    \"key\": "oryory",\n    \"value\": 776966\n  },\
  {\n    \"key\": "gilgil",\n    \"value\": 774964\n  },\
  {\n    \"key\": "oraora",\n    \"value\": 772962\n  },\
  {\n    \"key\": "tsrtsr",\n    \"value\": 779869\n  },\
  {\n    \"key\": "iteite",\n    \"value\": 777867\n  },\
  {\n    \"key\": "essess",\n    \"value\": 774864\n  },\
  {\n    \"key\": "ashash",\n    \"value\": 772862\n  },\
  {\n    \"key\": "redred",\n    \"value\": 770860\n  },\
  {\n    \"key\": "dnedne",\n    \"value\": 777767\n  },\
  {\n    \"key\": "inging",\n    \"value\": 775765\n  },\
  {\n    \"key\": "eryery",\n    \"value\": 773763\n  },\
  {\n    \"key\": "istist",\n    \"value\": 770760\n  },\
  {\n    \"key\": "essess",\n    \"value\": 778668\n  },\
  {\n    \"key\": "gesges",\n    \"value\": 776666\n  },\
  {\n    \"key\": "odeode",\n    \"value\": 773663\n  },\
  {\n    \"key\": "essess",\n    \"value\": 771661\n  },\
  {\n    \"key\": "detdet",\n    \"value\": 779569\n  },\
  {\n    \"key\": "uleule",\n    \"value\": 777567\n  },\
  {\n    \"key\": "ousous",\n    \"value\": 774564\n  },\
  {\n    \"key\": "hsihsi",\n    \"value\": 772562\n  },\
  {\n    \"key\": "ishish",\n    \"value\": 770560\n  },\
  {\n    \"key\": "esoeso",\n    \"value\": 778468\n  },\
  {\n    \"key\": "eloelo",\n    \"value\": 776466\n  },\
  {\n    \"key\": "outout",\n    \"value\": 774464\n  },\
  {\n    \"key\": "ideide",\n    \"value\": 771461\n  },\
  {\n    \"key\": "eedeed",\n    \"value\": 779369\n  },\
  {\n    \"key\": "oidoid",\n    \"value\": 777367\n  },\
  {\n    \"key\": "oaloal",\n    \"value\": 775365\n  },\
  {\n    \"key\": "namnam",\n    \"value\": 773363\n  },\
  {\n    \"key\": "inging",\n    \"value\": 771361\n  },\
  {\n    \"key\": "inging",\n    \"value\": 779269\n  },\
  {\n    \"key\": "upiupi",\n    \"value\": 777267\n  },\
  {\n    \"key\": "ankank",\n    \"value\": 775265\n  },\
  {\n    \"key\": "kedked",\n    \"value\": 772262\n  },\
  {\n    \"key\": "iseise",\n    \"value\": 770260\n  },\
  {\n    \"key\": "dradra",\n    \"value\": 778168\n  },\
  {\n    \"key\": "ityity",\n    \"value\": 776166\n  },\
  {\n    \"key\": "diadia",\n    \"value\": 774164\n  },\
  {\n    \"key\": "essess",\n    \"value\": 772162\n  },\
  {\n    \"key\": "areare",\n    \"value\": 770160\n  },\
  {\n    \"key\": "ontont",\n    \"value\": 778068\n  },\
  {\n    \"key\": "werwer",\n    \"value\": 776066\n  },\
  {\n    \"key\": "ousous",\n    \"value\": 774064\n  },\
  {\n    \"key\": "manman",\n    \"value\": 772062\n  },\
  {\n    \"key\": "nutnut",\n    \"value\": 771061\n  },\
  {\n    \"key\": "oidoid",\n    \"value\": 779959\n  },\
  {\n    \"key\": "lahlah",\n    \"value\": 777957\n  },\
  {\n    \"key\": "ricric",\n    \"value\": 775955\n  },\
  {\n    \"key\": "ueruer",\n    \"value\": 773953\n  },\
  {\n    \"key\": "naenae",\n    \"value\": 771951\n  },\
  {\n    \"key\": "iteite",\n    \"value\": 779859\n  },\
  {\n    \"key\": "bleble",\n    \"value\": 777857\n  },\
  {\n    \"key\": "terter",\n    \"value\": 775855\n  },\
  {\n    \"key\": "nicnic",\n    \"value\": 773853\n  },\
  {\n    \"key\": "aidaid",\n    \"value\": 772852\n  },\
  {\n    \"key\": "fulful",\n    \"value\": 770850\n  },\
  {\n    \"key\": "essess",\n    \"value\": 778758\n  },\
  {\n    \"key\": "iteite",\n    \"value\": 776756\n  },\
  {\n    \"key\": "glygly",\n    \"value\": 774754\n  },\
  {\n    \"key\": "iseise",\n    \"value\": 772752\n  },\
  {\n    \"key\": "ityity",\n    \"value\": 771751\n  },\
  {\n    \"key\": "essess",\n    \"value\": 779659\n  },\
  {\n    \"key\": "ealeal",\n    \"value\": 777657\n  },\
  {\n    \"key\": "aryary",\n    \"value\": 775655\n  },\
  {\n    \"key\": "ronron",\n    \"value\": 774654\n  },\
  {\n    \"key\": "etaeta",\n    \"value\": 772652\n  },\
  {\n    \"key\": "aveave",\n    \"value\": 770650\n  },\
  {\n    \"key\": "llylly",\n    \"value\": 778558\n  },\
  {\n    \"key\": "iteite",\n    \"value\": 777557\n  },\
  {\n    \"key\": "ianian",\n    \"value\": 775555\n  },\
  {\n    \"key\": "oleole",\n    \"value\": 773553\n  },\
  {\n    \"key\": "ithith",\n    \"value\": 771551\n  },\
  {\n    \"key\": "aryary",\n    \"value\": 770550\n  },\
  {\n    \"key\": "ondond",\n    \"value\": 778458\n  },\
  {\n    \"key\": "oosoos",\n    \"value\": 776456\n  },\
  {\n    \"key\": "hlyhly",\n    \"value\": 775455\n  },\
  {\n    \"key\": "ncence",\n    \"value\": 773453\n  },\
  {\n    \"key\": "eleele",\n    \"value\": 771451\n  },\
  {\n    \"key\": "iotiot",\n    \"value\": 770450\n  },\
  {\n    \"key\": "istist",\n    \"value\": 778358\n  },\
  {\n    \"key\": "nesnes",\n    \"value\": 777357\n  },\
  {\n    \"key\": "izeize",\n    \"value\": 775355\n  },\
  {\n    \"key\": "gusgus",\n    \"value\": 773353\n  },\
  {\n    \"key\": "laylay",\n    \"value\": 772352\n  },\
  {\n    \"key\": "eneene",\n    \"value\": 770350\n  },\
  {\n    \"key\": "eteete",\n    \"value\": 779259\n  },\
  {\n    \"key\": "tictic",\n    \"value\": 777257\n  },\
  {\n    \"key\": "fulful",\n    \"value\": 775255\n  },\
  {\n    \"key\": "toltol",\n    \"value\": 774254\n  },\
  {\n    \"key\": "tictic",\n    \"value\": 772252\n  },\
  {\n    \"key\": "iveive",\n    \"value\": 771251\n  },\
  {\n    \"key\": "manman",\n    \"value\": 779159\n  },\
  {\n    \"key\": "bleble",\n    \"value\": 778158\n  },\
  {\n    \"key\": "oidoid",\n    \"value\": 776156\n  },\
  {\n    \"key\": "salsal",\n    \"value\": 775155\n  },\
  {\n    \"key\": "kalkal",\n    \"value\": 773153\n  },\
  {\n    \"key\": "essess",\n    \"value\": 771151\n  },\
  {\n    \"key\": "omyomy",\n    \"value\": 770150\n  },\
  {\n    \"key\": "oreore",\n    \"value\": 778058\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 777057\n  },\
  {\n    \"key\": "eanean",\n    \"value\": 775055\n  },\
  {\n    \"key\": "ellell",\n    \"value\": 774054\n  },\
  {\n    \"key\": "daldal",\n    \"value\": 773053\n  },\
  {\n    \"key\": "ateate",\n    \"value\": 771051\n  },\
  {\n    \"key\": "ssesse",\n    \"value\": 770050\n  },\
  {\n    \"key\": "deidei",\n    \"value\": 778948\n  },\
  {\n    \"key\": "ousous",\n    \"value\": 777947\n  },\
  {\n    \"key\": "glygly",\n    \"value\": 775945\n  },\
  {\n    \"key\": "sitsit",\n    \"value\": 774944\n  },\
  {\n    \"key\": "sissis",\n    \"value\": 772942\n  },\
  {\n    \"key\": "larlar",\n    \"value\": 771941\n  },\
  {\n    \"key\": "salsal",\n    \"value\": 770940\n  },\
  {\n    \"key\": "herher",\n    \"value\": 778848\n  },\
  {\n    \"key\": "tictic",\n    \"value\": 777847\n  },\
  {\n    \"key\": "lamlam",\n    \"value\": 775845\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 774844\n  },\
  {\n    \"key\": "lumlum",\n    \"value\": 773843\n  },\
  {\n    \"key\": "oleole",\n    \"value\": 771841\n  },\
  {\n    \"key\": "chmchm",\n    \"value\": 770840\n  },\
  {\n    \"key\": "omeome",\n    \"value\": 779749\n  },\
  {\n    \"key\": "eaeeae",\n    \"value\": 777747\n  },\
  {\n    \"key\": "adeade",\n    \"value\": 776746\n  },\
  {\n    \"key\": "hiohio",\n    \"value\": 774744\n  },\
  {\n    \"key\": "lumlum",\n    \"value\": 773743\n  },\
  {\n    \"key\": "hpahpa",\n    \"value\": 772742\n  },\
  {\n    \"key\": "entent",\n    \"value\": 770740\n  },\
  {\n    \"key\": "gusgus",\n    \"value\": 779649\n  },\
  {\n    \"key\": "essess",\n    \"value\": 778648\n  },\
  {\n    \"key\": "ityity",\n    \"value\": 777647\n  },\
  {\n    \"key\": "ousous",\n    \"value\": 775645\n  },\
  {\n    \"key\": "eloelo",\n    \"value\": 774644\n  },\
  {\n    \"key\": "orkork",\n    \"value\": 773643\n  },\
  {\n    \"key\": "otaota",\n    \"value\": 771641\n  },\
  {\n    \"key\": "omyomy",\n    \"value\": 770640\n  },\
  {\n    \"key\": "lislis",\n    \"value\": 779549\n  },\
  {\n    \"key\": "teltel",\n    \"value\": 777547\n  },\
  {\n    \"key\": "ytiyti",\n    \"value\": 776546\n  },\
  {\n    \"key\": "noinoi",\n    \"value\": 775545\n  },\
  {\n    \"key\": "micmic",\n    \"value\": 774544\n  },\
  {\n    \"key\": "rerrer",\n    \"value\": 772542\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 771541\n  },\
  {\n    \"key\": "essess",\n    \"value\": 770540\n  },\
  {\n    \"key\": "larlar",\n    \"value\": 779449\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 778448\n  },\
  {\n    \"key\": "nctnct",\n    \"value\": 776446\n  },\
  {\n    \"key\": "aceace",\n    \"value\": 775445\n  },\
  {\n    \"key\": "terter",\n    \"value\": 774444\n  },\
  {\n    \"key\": "taltal",\n    \"value\": 773443\n  },\
  {\n    \"key\": "hilhil",\n    \"value\": 771441\n  },\
  {\n    \"key\": "oleole",\n    \"value\": 770440\n  },\
  {\n    \"key\": "ileile",\n    \"value\": 779349\n  },\
  {\n    \"key\": "inging",\n    \"value\": 778348\n  },\
  {\n    \"key\": "omyomy",\n    \"value\": 777347\n  },\
  {\n    \"key\": "glegle",\n    \"value\": 776346\n  },\
  {\n    \"key\": "queque",\n    \"value\": 774344\n  },\
  {\n    \"key\": "nainai",\n    \"value\": 773343\n  },\
  {\n    \"key\": "buabua",\n    \"value\": 772342\n  },\
  {\n    \"key\": "bleble",\n    \"value\": 771341\n  },\
  {\n    \"key\": "aboabo",\n    \"value\": 770340\n  },\
  {\n    \"key\": "looloo",\n    \"value\": 779249\n  },\
  {\n    \"key\": "nlynly",\n    \"value\": 777247\n  },\
  {\n    \"key\": "inging",\n    \"value\": 776246\n  },\
  {\n    \"key\": "nahnah",\n    \"value\": 775245\n  },\
  {\n    \"key\": "omaoma",\n    \"value\": 774244\n  },\
  {\n    \"key\": "redred",\n    \"value\": 773243\n  },\
  {\n    \"key\": "nalnal",\n    \"value\": 772242\n  },\
  {\n    \"key\": "useuse",\n    \"value\": 771241\n  },\
  {\n    \"key\": "allall",\n    \"value\": 770240\n  },\
  {\n    \"key\": "laclac",\n    \"value\": 778148\n  },\
  {\n    \"key\": "sumsum",\n    \"value\": 777147\n  },\
  {\n    \"key\": "rerrer",\n    \"value\": 776146\n  },\
  {\n    \"key\": "xisxis",\n    \"value\": 775145\n  },\
  {\n    \"key\": "daedae",\n    \"value\": 774144\n  },\
  {\n    \"key\": "dledle",\n    \"value\": 773143\n  },\
  {\n    \"key\": "riaria",\n    \"value\": 772142\n  },\
  {\n    \"key\": "ityity",\n    \"value\": 771141\n  },\
  {\n    \"key\": "entent",\n    \"value\": 770140\n  },\
  {\n    \"key\": "obeobe",\n    \"value\": 779049\n  },\
  {\n    \"key\": "ierier",\n    \"value\": 778048\n  },\
  {\n    \"key\": "oreore",\n    \"value\": 777047\n  },\
  {\n    \"key\": "ateate",\n    \"value\": 776046\n  },\
  {\n    \"key\": "istist",\n    \"value\": 774044\n  },\
  {\n    \"key\": "oanoan",\n    \"value\": 773043\n  },\
  {\n    \"key\": "intint",\n    \"value\": 772042\n  },\
  {\n    \"key\": "sissis",\n    \"value\": 771041\n  },\
  {\n    \"key\": "inging",\n    \"value\": 770040\n  },\
  {\n    \"key\": "ineine",\n    \"value\": 779939\n  },\
  {\n    \"key\": "eryery",\n    \"value\": 778938\n  },\
  {\n    \"key\": "okooko",\n    \"value\": 777937\n  },\
  {\n    \"key\": "ifyify",\n    \"value\": 776936\n  },\
  {\n    \"key\": "detdet",\n    \"value\": 775935\n  },\
  {\n    \"key\": "augaug",\n    \"value\": 774934\n  },\
  {\n    \"key\": "essess",\n    \"value\": 773933\n  },\
  {\n    \"key\": "ailail",\n    \"value\": 772932\n  },\
  {\n    \"key\": "oonoon",\n    \"value\": 771931\n  },\
  {\n    \"key\": "sissis",\n    \"value\": 770930\n  },\
  {\n    \"key\": "neknek",\n    \"value\": 779839\n  },\
  {\n    \"key\": "doodoo",\n    \"value\": 778838\n  },\
  {\n    \"key\": "llylly",\n    \"value\": 777837\n  },\
  {\n    \"key\": "icsics",\n    \"value\": 776836\n  },\
  {\n    \"key\": "inging",\n    \"value\": 775835\n  },\
  {\n    \"key\": "ratrat",\n    \"value\": 774834\n  },\
  {\n    \"key\": "daldal",\n    \"value\": 773833\n  },\
  {\n    \"key\": "andand",\n    \"value\": 772832\n  },\
  {\n    \"key\": "odeode",\n    \"value\": 772832\n  },\
  {\n    \"key\": "ismism",\n    \"value\": 771831\n  },\
  {\n    \"key\": "anyany",\n    \"value\": 770830\n  },\
  {\n    \"key\": "ageage",\n    \"value\": 779739\n  },\
  {\n    \"key\": "essess",\n    \"value\": 778738\n  },\
  {\n    \"key\": "bleble",\n    \"value\": 777737\n  },\
  {\n    \"key\": "angang",\n    \"value\": 776736\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 775735\n  },\
  {\n    \"key\": "tedted",\n    \"value\": 774734\n  },\
  {\n    \"key\": "ifyify",\n    \"value\": 773733\n  },\
  {\n    \"key\": "istist",\n    \"value\": 772732\n  },\
  {\n    \"key\": "bleble",\n    \"value\": 771731\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 770730\n  },\
  {\n    \"key\": "iveive",\n    \"value\": 779639\n  },\
  {\n    \"key\": "noinoi",\n    \"value\": 779639\n  },\
  {\n    \"key\": "raerae",\n    \"value\": 778638\n  },\
  {\n    \"key\": "gedged",\n    \"value\": 777637\n  },\
  {\n    \"key\": "nalnal",\n    \"value\": 776636\n  },\
  {\n    \"key\": "ierier",\n    \"value\": 775635\n  },\
  {\n    \"key\": "hidhid",\n    \"value\": 774634\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 773633\n  },\
  {\n    \"key\": "irtirt",\n    \"value\": 772632\n  },\
  {\n    \"key\": "glygly",\n    \"value\": 771631\n  },\
  {\n    \"key\": "citcit",\n    \"value\": 771631\n  },\
  {\n    \"key\": "ateate",\n    \"value\": 770630\n  },\
  {\n    \"key\": "ikeike",\n    \"value\": 779539\n  },\
  {\n    \"key\": "ataata",\n    \"value\": 778538\n  },\
  {\n    \"key\": "letlet",\n    \"value\": 777537\n  },\
  {\n    \"key\": "ialial",\n    \"value\": 776536\n  },\
  {\n    \"key\": "sissis",\n    \"value\": 775535\n  },\
  {\n    \"key\": "istist",\n    \"value\": 774534\n  },\
  {\n    \"key\": "anaana",\n    \"value\": 774534\n  },\
  {\n    \"key\": "oidoid",\n    \"value\": 773533\n  },\
  {\n    \"key\": "ormorm",\n    \"value\": 772532\n  },\
  {\n    \"key\": "lexlex",\n    \"value\": 771531\n  },\
  {\n    \"key\": "llylly",\n    \"value\": 770530\n  },\
  {\n    \"key\": "ifeife",\n    \"value\": 779439\n  },\
  {\n    \"key\": "nalnal",\n    \"value\": 779439\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 778438\n  },\
  {\n    \"key\": "hichic",\n    \"value\": 777437\n  },\
  {\n    \"key\": "tootoo",\n    \"value\": 776436\n  },\
  {\n    \"key\": "oryory",\n    \"value\": 775435\n  },\
  {\n    \"key\": "llylly",\n    \"value\": 774434\n  },\
  {\n    \"key\": "naenae",\n    \"value\": 774434\n  },\
  {\n    \"key\": "izeize",\n    \"value\": 773433\n  },\
  {\n    \"key\": "werwer",\n    \"value\": 772432\n  },\
  {\n    \"key\": "oiloil",\n    \"value\": 771431\n  },\
  {\n    \"key\": "luslus",\n    \"value\": 770430\n  },\
  {\n    \"key\": "eneene",\n    \"value\": 770430\n  },\
  {\n    \"key\": "ismism",\n    \"value\": 779339\n  },\
  {\n    \"key\": "ricric",\n    \"value\": 778338\n  },\
  {\n    \"key\": "iveive",\n    \"value\": 777337\n  },\
  {\n    \"key\": "glygly",\n    \"value\": 776336\n  },\
  {\n    \"key\": "manman",\n    \"value\": 776336\n  },\
  {\n    \"key\": "rierie",\n    \"value\": 775335\n  },\
  {\n    \"key\": "llylly",\n    \"value\": 774334\n  },\
  {\n    \"key\": "ithith",\n    \"value\": 773333\n  },\
  {\n    \"key\": "laclac",\n    \"value\": 773333\n  },\
  {\n    \"key\": "ityity",\n    \"value\": 772332\n  },\
  {\n    \"key\": "rezrez",\n    \"value\": 771331\n  },\
  {\n    \"key\": "enyeny",\n    \"value\": 770330\n  },\
  {\n    \"key\": "iedied",\n    \"value\": 770330\n  },\
  {\n    \"key\": "rgerge",\n    \"value\": 779239\n  },\
  {\n    \"key\": "wedwed",\n    \"value\": 778238\n  },\
  {\n    \"key\": "iorior",\n    \"value\": 777237\n  },\
  {\n    \"key\": "ousous",\n    \"value\": 777237\n  },\
  {\n    \"key\": "ricric",\n    \"value\": 776236\n  },\
  {\n    \"key\": "iumium",\n    \"value\": 775235\n  },\
  {\n    \"key\": "neanea",\n    \"value\": 774234\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 774234\n  },\
  {\n    \"key\": "ateate",\n    \"value\": 773233\n  },\
  {\n    \"key\": "ateate",\n    \"value\": 772232\n  },\
  {\n    \"key\": "ismism",\n    \"value\": 771231\n  },\
  {\n    \"key\": "karkar",\n    \"value\": 771231\n  },\
  {\n    \"key\": "essess",\n    \"value\": 770230\n  },\
  {\n    \"key\": "oseose",\n    \"value\": 779139\n  },\
  {\n    \"key\": "siasia",\n    \"value\": 778138\n  },\
  {\n    \"key\": "aryary",\n    \"value\": 778138\n  },\
  {\n    \"key\": "iteite",\n    \"value\": 777137\n  },\
  {\n    \"key\": "bleble",\n    \"value\": 776136\n  },\
  {\n    \"key\": "tustus",\n    \"value\": 776136\n  },\
  {\n    \"key\": "iteite",\n    \"value\": 775135\n  },\
  {\n    \"key\": "ikeike",\n    \"value\": 774134\n  },\
  {\n    \"key\": "berber",\n    \"value\": 773133\n  },\
  {\n    \"key\": "ismism",\n    \"value\": 773133\n  },\
  {\n    \"key\": "rigrig",\n    \"value\": 772132\n  },\
  {\n    \"key\": "yreyre",\n    \"value\": 771131\n  },\
  {\n    \"key\": "ismism",\n    \"value\": 771131\n  },\
  {\n    \"key\": "ismism",\n    \"value\": 770130\n  },\
  {\n    \"key\": "oodood",\n    \"value\": 779039\n  },\
  {\n    \"key\": "amaama",\n    \"value\": 779039\n  },\
  {\n    \"key\": "sissis",\n    \"value\": 778038\n  },\
  {\n    \"key\": "ftyfty",\n    \"value\": 777037\n  },\
  {\n    \"key\": "onyony",\n    \"value\": 777037\n  },\
  {\n    \"key\": "ismism",\n    \"value\": 776036\n  },\
  {\n    \"key\": "iumium",\n    \"value\": 775035\n  },\
  {\n    \"key\": "euseus",\n    \"value\": 775035\n  },\
  {\n    \"key\": "bleble",\n    \"value\": 774034\n  },\
  {\n    \"key\": "istist",\n    \"value\": 773033\n  },\
  {\n    \"key\": "bowbow",\n    \"value\": 773033\n  },\
  {\n    \"key\": "lielie",\n    \"value\": 772032\n  },\
  {\n    \"key\": "ursurs",\n    \"value\": 771031\n  },\
  {\n    \"key\": "hsuhsu",\n    \"value\": 771031\n  },\
  {\n    \"key\": "imiimi",\n    \"value\": 770030\n  },\
  {\n    \"key\": "dgedge",\n    \"value\": 779929\n  },\
  {\n    \"key\": "laglag",\n    \"value\": 779929\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 778928\n  },\
  {\n    \"key\": "fulful",\n    \"value\": 777927\n  },\
  {\n    \"key\": "uedued",\n    \"value\": 777927\n  },\
  {\n    \"key\": "angang",\n    \"value\": 776926\n  },\
  {\n    \"key\": "ertert",\n    \"value\": 775925\n  },\
  {\n    \"key\": "bleble",\n    \"value\": 775925\n  },\
  {\n    \"key\": "tibtib",\n    \"value\": 774924\n  },\
  {\n    \"key\": "iteite",\n    \"value\": 773923\n  },\
  {\n    \"key\": "inging",\n    \"value\": 773923\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 772922\n  },\
  {\n    \"key\": "ngsngs",\n    \"value\": 772922\n  },\
  {\n    \"key\": "ralral",\n    \"value\": 771921\n  },\
  {\n    \"key\": "dlydly",\n    \"value\": 770920\n  },\
  {\n    \"key\": "nerner",\n    \"value\": 770920\n  },\
  {\n    \"key\": "iveive",\n    \"value\": 779829\n  },\
  {\n    \"key\": "istist",\n    \"value\": 778828\n  },\
  {\n    \"key\": "piapia",\n    \"value\": 778828\n  },\
  {\n    \"key\": "ncyncy",\n    \"value\": 777827\n  },\
  {\n    \"key\": "geegee",\n    \"value\": 777827\n  },\
  {\n    \"key\": "tictic",\n    \"value\": 776826\n  },\
  {\n    \"key\": "bitbit",\n    \"value\": 775825\n  },\
  {\n    \"key\": "larlar",\n    \"value\": 775825\n  },\
  {\n    \"key\": "tedted",\n    \"value\": 774824\n  },\
  {\n    \"key\": "ineine",\n    \"value\": 774824\n  },\
  {\n    \"key\": "ateate",\n    \"value\": 773823\n  },\
  {\n    \"key\": "essess",\n    \"value\": 772822\n  },\
  {\n    \"key\": "rdsrds",\n    \"value\": 772822\n  },\
  {\n    \"key\": "laplap",\n    \"value\": 771821\n  },\
  {\n    \"key\": "essess",\n    \"value\": 771821\n  },\
  {\n    \"key\": "siasia",\n    \"value\": 770820\n  },\
  {\n    \"key\": "ousous",\n    \"value\": 779729\n  },\
  {\n    \"key\": "inging",\n    \"value\": 779729\n  },\
  {\n    \"key\": "pirpir",\n    \"value\": 778728\n  },\
  {\n    \"key\": "dlydly",\n    \"value\": 778728\n  },\
  {\n    \"key\": "liclic",\n    \"value\": 777727\n  },\
  {\n    \"key\": "cuscus",\n    \"value\": 777727\n  },\
  {\n    \"key\": "essess",\n    \"value\": 776726\n  },\
  {\n    \"key\": "glygly",\n    \"value\": 775725\n  },\
  {\n    \"key\": "ainain",\n    \"value\": 775725\n  },\
  {\n    \"key\": "etyety",\n    \"value\": 774724\n  },\
  {\n    \"key\": "yllyll",\n    \"value\": 774724\n  },\
  {\n    \"key\": "nusnus",\n    \"value\": 773723\n  },\
  {\n    \"key\": "iidiid",\n    \"value\": 773723\n  },\
  {\n    \"key\": "yonyon",\n    \"value\": 772722\n  },\
  {\n    \"key\": "miamia",\n    \"value\": 771721\n  },\
  {\n    \"key\": "domdom",\n    \"value\": 771721\n  },\
  {\n    \"key\": "ineine",\n    \"value\": 770720\n  },\
  {\n    \"key\": "ayoayo",\n    \"value\": 770720\n  },\
  {\n    \"key\": "essess",\n    \"value\": 779629\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 779629\n  },\
  {\n    \"key\": "aftaft",\n    \"value\": 778628\n  },\
  {\n    \"key\": "tchtch",\n    \"value\": 778628\n  },\
  {\n    \"key\": "rowrow",\n    \"value\": 777627\n  },\
  {\n    \"key\": "euseus",\n    \"value\": 776626\n  },\
  {\n    \"key\": "bleble",\n    \"value\": 776626\n  },\
  {\n    \"key\": "manman",\n    \"value\": 775625\n  },\
  {\n    \"key\": "ianian",\n    \"value\": 775625\n  },\
  {\n    \"key\": "tlytly",\n    \"value\": 774624\n  },\
  {\n    \"key\": "opeope",\n    \"value\": 774624\n  },\
  {\n    \"key\": "parpar",\n    \"value\": 773623\n  },\
  {\n    \"key\": "rumrum",\n    \"value\": 773623\n  },\
  {\n    \"key\": "essess",\n    \"value\": 772622\n  },\
  {\n    \"key\": "hinhin",\n    \"value\": 772622\n  },\
  {\n    \"key\": "istist",\n    \"value\": 771621\n  },\
  {\n    \"key\": "denden",\n    \"value\": 771621\n  },\
  {\n    \"key\": "ualual",\n    \"value\": 770620\n  },\
  {\n    \"key\": "tiatia",\n    \"value\": 779529\n  },\
  {\n    \"key\": "sissis",\n    \"value\": 779529\n  },\
  {\n    \"key\": "slysly",\n    \"value\": 778528\n  },\
  {\n    \"key\": "ameame",\n    \"value\": 778528\n  },\
  {\n    \"key\": "ismism",\n    \"value\": 777527\n  },\
  {\n    \"key\": "ialial",\n    \"value\": 777527\n  },\
  {\n    \"key\": "nerner",\n    \"value\": 776526\n  },\
  {\n    \"key\": "ifyify",\n    \"value\": 776526\n  },\
  {\n    \"key\": "ismism",\n    \"value\": 775525\n  },\
  {\n    \"key\": "legleg",\n    \"value\": 775525\n  },\
  {\n    \"key\": "calcal",\n    \"value\": 774524\n  },\
  {\n    \"key\": "oadoad",\n    \"value\": 774524\n  },\
  {\n    \"key\": "iveive",\n    \"value\": 773523\n  },\
  {\n    \"key\": "micmic",\n    \"value\": 773523\n  },\
  {\n    \"key\": "chychy",\n    \"value\": 772522\n  },\
  {\n    \"key\": "daldal",\n    \"value\": 772522\n  },\
  {\n    \"key\": "ityity",\n    \"value\": 771521\n  },\
  {\n    \"key\": "iadiad",\n    \"value\": 771521\n  },\
  {\n    \"key\": "liclic",\n    \"value\": 770520\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 770520\n  },\
  {\n    \"key\": "micmic",\n    \"value\": 779429\n  },\
  {\n    \"key\": "sissis",\n    \"value\": 779429\n  },\
  {\n    \"key\": "rserse",\n    \"value\": 778428\n  },\
  {\n    \"key\": "iteite",\n    \"value\": 778428\n  },\
  {\n    \"key\": "izeize",\n    \"value\": 777427\n  },\
  {\n    \"key\": "iumium",\n    \"value\": 777427\n  },\
  {\n    \"key\": "panpan",\n    \"value\": 776426\n  },\
  {\n    \"key\": "glygly",\n    \"value\": 776426\n  },\
  {\n    \"key\": "etaeta",\n    \"value\": 775425\n  },\
  {\n    \"key\": "ssesse",\n    \"value\": 775425\n  },\
  {\n    \"key\": "narnar",\n    \"value\": 775425\n  },\
  {\n    \"key\": "setset",\n    \"value\": 774424\n  },\
  {\n    \"key\": "tedted",\n    \"value\": 774424\n  },\
  {\n    \"key\": "oidoid",\n    \"value\": 773423\n  },\
  {\n    \"key\": "ineine",\n    \"value\": 773423\n  },\
  {\n    \"key\": "nedned",\n    \"value\": 772422\n  },\
  {\n    \"key\": "eadead",\n    \"value\": 772422\n  },\
  {\n    \"key\": "ousous",\n    \"value\": 771421\n  },\
  {\n    \"key\": "slysly",\n    \"value\": 771421\n  },\
  {\n    \"key\": "enieni",\n    \"value\": 770420\n  },\
  {\n    \"key\": "essess",\n    \"value\": 770420\n  },\
  {\n    \"key\": "terter",\n    \"value\": 779329\n  },\
  {\n    \"key\": "ntynty",\n    \"value\": 779329\n  },\
  {\n    \"key\": "sinsin",\n    \"value\": 778328\n  },\
  {\n    \"key\": "ismism",\n    \"value\": 778328\n  },\
  {\n    \"key\": "ousous",\n    \"value\": 778328\n  },\
  {\n    \"key\": "aryary",\n    \"value\": 777327\n  },\
  {\n    \"key\": "numnum",\n    \"value\": 777327\n  },\
  {\n    \"key\": "tlytly",\n    \"value\": 776326\n  },\
  {\n    \"key\": "calcal",\n    \"value\": 776326\n  },\
  {\n    \"key\": "slysly",\n    \"value\": 775325\n  },\
  {\n    \"key\": "trytry",\n    \"value\": 775325\n  },\
  {\n    \"key\": "ailail",\n    \"value\": 774324\n  },\
  {\n    \"key\": "nicnic",\n    \"value\": 774324\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 773323\n  },\
  {\n    \"key\": "serser",\n    \"value\": 773323\n  },\
  {\n    \"key\": "essess",\n    \"value\": 773323\n  },\
  {\n    \"key\": "tistis",\n    \"value\": 772322\n  },\
  {\n    \"key\": "otlotl",\n    \"value\": 772322\n  },\
  {\n    \"key\": "ousous",\n    \"value\": 771321\n  },\
  {\n    \"key\": "dehdeh",\n    \"value\": 771321\n  },\
  {\n    \"key\": "essess",\n    \"value\": 770320\n  },\
  {\n    \"key\": "llylly",\n    \"value\": 770320\n  },\
  {\n    \"key\": "evievi",\n    \"value\": 770320\n  },\
  {\n    \"key\": "iteite",\n    \"value\": 779229\n  },\
  {\n    \"key\": "rnerne",\n    \"value\": 779229\n  },\
  {\n    \"key\": "oleole",\n    \"value\": 778228\n  },\
  {\n    \"key\": "oryory",\n    \"value\": 778228\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 777227\n  },\
  {\n    \"key\": "eteete",\n    \"value\": 777227\n  },\
  {\n    \"key\": "ismism",\n    \"value\": 777227\n  },\
  {\n    \"key\": "oidoid",\n    \"value\": 776226\n  },\
  {\n    \"key\": "ismism",\n    \"value\": 776226\n  },\
  {\n    \"key\": "ahtaht",\n    \"value\": 775225\n  },\
  {\n    \"key\": "ousous",\n    \"value\": 775225\n  },\
  {\n    \"key\": "daedae",\n    \"value\": 774224\n  },\
  {\n    \"key\": "nrenre",\n    \"value\": 774224\n  },\
  {\n    \"key\": "daldal",\n    \"value\": 774224\n  },\
  {\n    \"key\": "ngsngs",\n    \"value\": 773223\n  },\
  {\n    \"key\": "zinzin",\n    \"value\": 773223\n  },\
  {\n    \"key\": "tistis",\n    \"value\": 772222\n  },\
  {\n    \"key\": "ikeike",\n    \"value\": 772222\n  },\
  {\n    \"key\": "ithith",\n    \"value\": 772222\n  },\
  {\n    \"key\": "fulful",\n    \"value\": 771221\n  },\
  {\n    \"key\": "evievi",\n    \"value\": 771221\n  },\
  {\n    \"key\": "earear",\n    \"value\": 770220\n  },\
  {\n    \"key\": "aftaft",\n    \"value\": 770220\n  },\
  {\n    \"key\": "eereer",\n    \"value\": 770220\n  },\
  {\n    \"key\": "ousous",\n    \"value\": 779129\n  },\
  {\n    \"key\": "aphaph",\n    \"value\": 779129\n  },\
  {\n    \"key\": "iteite",\n    \"value\": 778128\n  },\
  {\n    \"key\": "gerger",\n    \"value\": 778128\n  },\
  {\n    \"key\": "llylly",\n    \"value\": 778128\n  },\
  {\n    \"key\": "oodood",\n    \"value\": 777127\n  },\
  {\n    \"key\": "araara",\n    \"value\": 777127\n  },\
  {\n    \"key\": "suosuo",\n    \"value\": 776126\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 776126\n  },\
  {\n    \"key\": "ishish",\n    \"value\": 776126\n  },\
  {\n    \"key\": "ynyyny",\n    \"value\": 775125\n  },\
  {\n    \"key\": "akeake",\n    \"value\": 775125\n  },\
  {\n    \"key\": "rawraw",\n    \"value\": 774124\n  },\
  {\n    \"key\": "fidfid",\n    \"value\": 774124\n  },\
  {\n    \"key\": "slysly",\n    \"value\": 774124\n  },\
  {\n    \"key\": "ngyngy",\n    \"value\": 773123\n  },\
  {\n    \"key\": "iteite",\n    \"value\": 773123\n  },\
  {\n    \"key\": "hichic",\n    \"value\": 772122\n  },\
  {\n    \"key\": "warwar",\n    \"value\": 772122\n  },\
  {\n    \"key\": "eziezi",\n    \"value\": 772122\n  },\
  {\n    \"key\": "sissis",\n    \"value\": 771121\n  },\
  {\n    \"key\": "aryary",\n    \"value\": 771121\n  },\
  {\n    \"key\": "trytry",\n    \"value\": 771121\n  },\
  {\n    \"key\": "eltelt",\n    \"value\": 770120\n  },\
  {\n    \"key\": "yteyte",\n    \"value\": 770120\n  },\
  {\n    \"key\": "tictic",\n    \"value\": 779029\n  },\
  {\n    \"key\": "testes",\n    \"value\": 779029\n  },\
  {\n    \"key\": "terter",\n    \"value\": 779029\n  },\
  {\n    \"key\": "antant",\n    \"value\": 778028\n  },\
  {\n    \"key\": "bleble",\n    \"value\": 778028\n  },\
  {\n    \"key\": "ikeike",\n    \"value\": 778028\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 777027\n  },\
  {\n    \"key\": "ycnycn",\n    \"value\": 777027\n  },\
  {\n    \"key\": "ermerm",\n    \"value\": 776026\n  },\
  {\n    \"key\": "istist",\n    \"value\": 776026\n  },\
  {\n    \"key\": "rryrry",\n    \"value\": 776026\n  },\
  {\n    \"key\": "nicnic",\n    \"value\": 775025\n  },\
  {\n    \"key\": "dibdib",\n    \"value\": 775025\n  },\
  {\n    \"key\": "yroyro",\n    \"value\": 775025\n  },\
  {\n    \"key\": "kerker",\n    \"value\": 774024\n  },\
  {\n    \"key\": "zenzen",\n    \"value\": 774024\n  },\
  {\n    \"key\": "llylly",\n    \"value\": 774024\n  },\
  {\n    \"key\": "essess",\n    \"value\": 773023\n  },\
  {\n    \"key\": "iteite",\n    \"value\": 773023\n  },\
  {\n    \"key\": "eraera",\n    \"value\": 773023\n  },\
  {\n    \"key\": "oneone",\n    \"value\": 772022\n  },\
  {\n    \"key\": "saesae",\n    \"value\": 772022\n  },\
  {\n    \"key\": "tortor",\n    \"value\": 771021\n  },\
  {\n    \"key\": "testes",\n    \"value\": 771021\n  },\
  {\n    \"key\": "istist",\n    \"value\": 771021\n  },\
  {\n    \"key\": "tictic",\n    \"value\": 770020\n  },\
  {\n    \"key\": "liclic",\n    \"value\": 770020\n  },\
  {\n    \"key\": "trytry",\n    \"value\": 770020\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 779919\n  },\
  {\n    \"key\": "aosaos",\n    \"value\": 779919\n  },\
  {\n    \"key\": "areare",\n    \"value\": 779919\n  },\
  {\n    \"key\": "ycayca",\n    \"value\": 778918\n  },\
  {\n    \"key\": "dahdah",\n    \"value\": 778918\n  },\
  {\n    \"key\": "eanean",\n    \"value\": 778918\n  },\
  {\n    \"key\": "uleule",\n    \"value\": 777917\n  },\
  {\n    \"key\": "ifyify",\n    \"value\": 777917\n  },\
  {\n    \"key\": "ialial",\n    \"value\": 777917\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 776916\n  },\
  {\n    \"key\": "ronron",\n    \"value\": 776916\n  },\
  {\n    \"key\": "ormorm",\n    \"value\": 776916\n  },\
  {\n    \"key\": "lonlon",\n    \"value\": 775915\n  },\
  {\n    \"key\": "nalnal",\n    \"value\": 775915\n  },\
  {\n    \"key\": "doldol",\n    \"value\": 775915\n  },\
  {\n    \"key\": "arkark",\n    \"value\": 774914\n  },\
  {\n    \"key\": "nirnir",\n    \"value\": 774914\n  },\
  {\n    \"key\": "tumtum",\n    \"value\": 774914\n  },\
  {\n    \"key\": "ineine",\n    \"value\": 773913\n  },\
  {\n    \"key\": "loyloy",\n    \"value\": 773913\n  },\
  {\n    \"key\": "tnetne",\n    \"value\": 773913\n  },\
  {\n    \"key\": "rborbo",\n    \"value\": 772912\n  },\
  {\n    \"key\": "ismism",\n    \"value\": 772912\n  },\
  {\n    \"key\": "ineine",\n    \"value\": 772912\n  },\
  {\n    \"key\": "llylly",\n    \"value\": 771911\n  },\
  {\n    \"key\": "tidtid",\n    \"value\": 771911\n  },\
  {\n    \"key\": "inging",\n    \"value\": 771911\n  },\
  {\n    \"key\": "gnigni",\n    \"value\": 770910\n  },\
  {\n    \"key\": "naenae",\n    \"value\": 770910\n  },\
  {\n    \"key\": "ncence",\n    \"value\": 770910\n  },\
  {\n    \"key\": "ikeike",\n    \"value\": 779819\n  },\
  {\n    \"key\": "pedped",\n    \"value\": 779819\n  },\
  {\n    \"key\": "napnap",\n    \"value\": 779819\n  },\
  {\n    \"key\": "renren",\n    \"value\": 778818\n  },\
  {\n    \"key\": "dedded",\n    \"value\": 778818\n  },\
  {\n    \"key\": "redred",\n    \"value\": 778818\n  },\
  {\n    \"key\": "yltylt",\n    \"value\": 777817\n  },\
  {\n    \"key\": "ylgylg",\n    \"value\": 777817\n  },\
  {\n    \"key\": "oseose",\n    \"value\": 777817\n  },\
  {\n    \"key\": "ytiyti",\n    \"value\": 777817\n  },\
  {\n    \"key\": "etaeta",\n    \"value\": 776816\n  },\
  {\n    \"key\": "oluolu",\n    \"value\": 776816\n  },\
  {\n    \"key\": "ncence",\n    \"value\": 776816\n  },\
  {\n    \"key\": "riaria",\n    \"value\": 775815\n  },\
  {\n    \"key\": "uloulo",\n    \"value\": 775815\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 775815\n  },\
  {\n    \"key\": "llylly",\n    \"value\": 774814\n  },\
  {\n    \"key\": "ninnin",\n    \"value\": 774814\n  },\
  {\n    \"key\": "ughugh",\n    \"value\": 774814\n  },\
  {\n    \"key\": "iveive",\n    \"value\": 773813\n  },\
  {\n    \"key\": "daedae",\n    \"value\": 773813\n  },\
  {\n    \"key\": "bleble",\n    \"value\": 773813\n  },\
  {\n    \"key\": "entent",\n    \"value\": 773813\n  },\
  {\n    \"key\": "budbud",\n    \"value\": 772812\n  },\
  {\n    \"key\": "ledled",\n    \"value\": 772812\n  },\
  {\n    \"key\": "rowrow",\n    \"value\": 772812\n  },\
  {\n    \"key\": "oofoof",\n    \"value\": 771811\n  },\
  {\n    \"key\": "eiteit",\n    \"value\": 771811\n  },\
  {\n    \"key\": "hedhed",\n    \"value\": 771811\n  },\
  {\n    \"key\": "eadead",\n    \"value\": 770810\n  },\
  {\n    \"key\": "ghtght",\n    \"value\": 770810\n  },\
  {\n    \"key\": "ncence",\n    \"value\": 770810\n  },\
  {\n    \"key\": "bleble",\n    \"value\": 770810\n  },\
  {\n    \"key\": "ralral",\n    \"value\": 779719\n  },\
  {\n    \"key\": "entent",\n    \"value\": 779719\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 779719\n  },\
  {\n    \"key\": "hlyhly",\n    \"value\": 778718\n  },\
  {\n    \"key\": "dledle",\n    \"value\": 778718\n  },\
  {\n    \"key\": "oidoid",\n    \"value\": 778718\n  },\
  {\n    \"key\": "ousous",\n    \"value\": 778718\n  },\
  {\n    \"key\": "ineine",\n    \"value\": 777717\n  },\
  {\n    \"key\": "ianian",\n    \"value\": 777717\n  },\
  {\n    \"key\": "gicgic",\n    \"value\": 777717\n  },\
  {\n    \"key\": "mbombo",\n    \"value\": 776716\n  },\
  {\n    \"key\": "tictic",\n    \"value\": 776716\n  },\
  {\n    \"key\": "antant",\n    \"value\": 776716\n  },\
  {\n    \"key\": "nwonwo",\n    \"value\": 775715\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 775715\n  },\
  {\n    \"key\": "inging",\n    \"value\": 775715\n  },\
  {\n    \"key\": "arkark",\n    \"value\": 775715\n  },\
  {\n    \"key\": "nicnic",\n    \"value\": 774714\n  },\
  {\n    \"key\": "ityity",\n    \"value\": 774714\n  },\
  {\n    \"key\": "iveive",\n    \"value\": 774714\n  },\
  {\n    \"key\": "testes",\n    \"value\": 774714\n  },\
  {\n    \"key\": "llylly",\n    \"value\": 773713\n  },\
  {\n    \"key\": "sissis",\n    \"value\": 773713\n  },\
  {\n    \"key\": "ateate",\n    \"value\": 773713\n  },\
  {\n    \"key\": "ledled",\n    \"value\": 772712\n  },\
  {\n    \"key\": "niuniu",\n    \"value\": 772712\n  },\
  {\n    \"key\": "linlin",\n    \"value\": 772712\n  },\
  {\n    \"key\": "omyomy",\n    \"value\": 772712\n  },\
  {\n    \"key\": "nannan",\n    \"value\": 771711\n  },\
  {\n    \"key\": "abeabe",\n    \"value\": 771711\n  },\
  {\n    \"key\": "ssesse",\n    \"value\": 771711\n  },\
  {\n    \"key\": "hlyhly",\n    \"value\": 770710\n  },\
  {\n    \"key\": "llalla",\n    \"value\": 770710\n  },\
  {\n    \"key\": "kinkin",\n    \"value\": 770710\n  },\
  {\n    \"key\": "essess",\n    \"value\": 770710\n  },\
  {\n    \"key\": "essess",\n    \"value\": 779619\n  },\
  {\n    \"key\": "itoito",\n    \"value\": 779619\n  },\
  {\n    \"key\": "entent",\n    \"value\": 779619\n  },\
  {\n    \"key\": "oidoid",\n    \"value\": 779619\n  },\
  {\n    \"key\": "gerger",\n    \"value\": 778618\n  },\
  {\n    \"key\": "moomoo",\n    \"value\": 778618\n  },\
  {\n    \"key\": "ogyogy",\n    \"value\": 778618\n  },\
  {\n    \"key\": "iseise",\n    \"value\": 778618\n  },\
  {\n    \"key\": "ichich",\n    \"value\": 777617\n  },\
  {\n    \"key\": "nedned",\n    \"value\": 777617\n  },\
  {\n    \"key\": "bleble",\n    \"value\": 777617\n  },\
  {\n    \"key\": "tictic",\n    \"value\": 777617\n  },\
  {\n    \"key\": "izeize",\n    \"value\": 776616\n  },\
  {\n    \"key\": "oxyoxy",\n    \"value\": 776616\n  },\
  {\n    \"key\": "daldal",\n    \"value\": 776616\n  },\
  {\n    \"key\": "carcar",\n    \"value\": 775615\n  },\
  {\n    \"key\": "entent",\n    \"value\": 775615\n  },\
  {\n    \"key\": "lezlez",\n    \"value\": 775615\n  },\
  {\n    \"key\": "ikeike",\n    \"value\": 775615\n  },\
  {\n    \"key\": "noinoi",\n    \"value\": 774614\n  },\
  {\n    \"key\": "oftoft",\n    \"value\": 774614\n  },\
  {\n    \"key\": "larlar",\n    \"value\": 774614\n  },\
  {\n    \"key\": "aicaic",\n    \"value\": 774614\n  },\
  {\n    \"key\": "nzonzo",\n    \"value\": 773613\n  },\
  {\n    \"key\": "ianian",\n    \"value\": 773613\n  },\
  {\n    \"key\": "hlyhly",\n    \"value\": 773613\n  },\
  {\n    \"key\": "manman",\n    \"value\": 773613\n  },\
  {\n    \"key\": "iteite",\n    \"value\": 772612\n  },\
  {\n    \"key\": "eryery",\n    \"value\": 772612\n  },\
  {\n    \"key\": "ttotto",\n    \"value\": 772612\n  },\
  {\n    \"key\": "nylnyl",\n    \"value\": 772612\n  },\
  {\n    \"key\": "ariari",\n    \"value\": 771611\n  },\
  {\n    \"key\": "ssesse",\n    \"value\": 771611\n  },\
  {\n    \"key\": "warwar",\n    \"value\": 771611\n  },\
  {\n    \"key\": "ousous",\n    \"value\": 771611\n  },\
  {\n    \"key\": "oreore",\n    \"value\": 770610\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 770610\n  },\
  {\n    \"key\": "nornor",\n    \"value\": 770610\n  },\
  {\n    \"key\": "niania",\n    \"value\": 770610\n  },\
  {\n    \"key\": "niania",\n    \"value\": 779519\n  },\
  {\n    \"key\": "boxbox",\n    \"value\": 779519\n  },\
  {\n    \"key\": "aabaab",\n    \"value\": 779519\n  },\
  {\n    \"key\": "miamia",\n    \"value\": 779519\n  },\
  {\n    \"key\": "untunt",\n    \"value\": 778518\n  },\
  {\n    \"key\": "ogyogy",\n    \"value\": 778518\n  },\
  {\n    \"key\": "ousous",\n    \"value\": 778518\n  },\
  {\n    \"key\": "ialial",\n    \"value\": 778518\n  },\
  {\n    \"key\": "lialia",\n    \"value\": 777517\n  },\
  {\n    \"key\": "etyety",\n    \"value\": 777517\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 777517\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 777517\n  },\
  {\n    \"key\": "eateat",\n    \"value\": 777517\n  },\
  {\n    \"key\": "bitbit",\n    \"value\": 776516\n  },\
  {\n    \"key\": "ishish",\n    \"value\": 776516\n  },\
  {\n    \"key\": "calcal",\n    \"value\": 776516\n  },\
  {\n    \"key\": "ikeike",\n    \"value\": 776516\n  },\
  {\n    \"key\": "cincin",\n    \"value\": 775515\n  },\
  {\n    \"key\": "niknik",\n    \"value\": 775515\n  },\
  {\n    \"key\": "oneone",\n    \"value\": 775515\n  },\
  {\n    \"key\": "roiroi",\n    \"value\": 775515\n  },\
  {\n    \"key\": "ricric",\n    \"value\": 774514\n  },\
  {\n    \"key\": "ideide",\n    \"value\": 774514\n  },\
  {\n    \"key\": "nrynry",\n    \"value\": 774514\n  },\
  {\n    \"key\": "roiroi",\n    \"value\": 775515\n  },\
  {\n    \"key\": "ricric",\n    \"value\": 774514\n  },\
  {\n    \"key\": "ideide",\n    \"value\": 774514\n  },\
  {\n    \"key\": "nrynry",\n    \"value\": 774514\n  },\
  {\n    \"key\": "lialia",\n    \"value\": 777517\n  },\
  {\n    \"key\": "etyety",\n    \"value\": 777517\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 777517\n  },\
  {\n    \"key\": "ionion",\n    \"value\": 777517\n  },\
  {\n    \"key\": "eateat",\n    \"value\": 777517\n  },\
  {\n    \"key\": "bitbit",\n    \"value\": 776516\n  },\
  {\n    \"key\": "ishish",\n    \"value\": 776516\n  },\
  {\n    \"key\": "calcal",\n    \"value\": 776516\n  },\
  {\n    \"key\": "ikeike",\n    \"value\": 776516\n  },\
  {\n    \"key\": "cincin",\n    \"value\": 775515\n  },\
  {\n    \"key\": "niknik",\n    \"value\": 775515\n  },\
  {\n    \"key\": "oneone",\n    \"value\": 775515\n  },\
  {\n    \"key\": "roiroi",\n    \"value\": 775515\n  },\
  {\n    \"key\": "ricric",\n    \"value\": 774514\n  },\
  {\n    \"key\": "ideide",\n    \"value\": 774514\n  },\
  {\n    \"key\": "nrynry",\n    \"value\": 774514\n  },\
  {\n    \"key\": "roiroi",\n    \"value\": 775515\n  },\
  {\n    \"key\": "ricric",\n    \"value\": 774514\n  },\
  {\n    \"key\": "ideide",\n    \"value\": 774514\n  },\
  {\n    \"key\": "nrynry",\n    \"value\": 774514\n  },\
  {\n    \"key\": "ralral",\n    \"value\": 779049\n  }]';

kvJSON.frob();
