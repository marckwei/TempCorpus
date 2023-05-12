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

// Flags: --allow-natives-syntax

'use strict'

const minus_one = BigInt(-1);
const zero = BigInt(0);
const another_zero = BigInt(0);
const one = BigInt(1);
const another_one = BigInt(1);
const two = BigInt(2);
const three = BigInt(3);
const six = BigInt(6);

// BigInt
{
  assertSame(BigInt, BigInt.prototype.constructor)
}{
  assertThrows(() => new BigInt, TypeError);
  assertThrows(() => new BigInt(), TypeError);
  assertThrows(() => new BigInt(0), TypeError);
  assertThrows(() => new BigInt(0n), TypeError);
  assertThrows(() => new BigInt("0"), TypeError);
}{
  class C extends BigInt { constructor() { throw 42 } };
  assertThrowsEquals(() => new C, 42);
}

// ToBigInt, NumberToBigInt, BigInt
{
  assertThrows(() => BigInt(undefined), TypeError);
  assertThrows(() => BigInt(null), TypeError);
  assertThrows(() => BigInt({}), SyntaxError);
  assertThrows(() => BigInt("foo"), SyntaxError);

  assertThrows(() => BigInt("1j"), SyntaxError);
  assertThrows(() => BigInt("0b1ju"), SyntaxError);
  assertThrows(() => BigInt("0o1jun"), SyntaxError);
  assertThrows(() => BigInt("0x1junk"), SyntaxError);
}{
  assertSame(BigInt(true), 1n);
  assertSame(BigInt(false), 0n);
  assertSame(BigInt(""), 0n);
  assertSame(BigInt(" 42"), 42n);
  assertSame(BigInt("0b101010"), 42n);
  assertSame(BigInt("  0b101011"), 43n);
  assertSame(BigInt("0x2a  "), 42n);
  assertSame(BigInt("    0x2b"), 43n);
  assertSame(BigInt("0o52"), 42n);
  assertSame(BigInt("     0o53\n"), 43n);
  assertSame(BigInt(-0), 0n);
  assertSame(BigInt(42), 42n);
  assertSame(BigInt(42n), 42n);
  assertSame(BigInt(Object(42n)), 42n);
  assertSame(BigInt(2**53 - 1), 9007199254740991n);
  assertSame(BigInt(2**53), 9007199254740992n);
  assertSame(BigInt(2**1000), 2n ** 1000n);
  assertSame(BigInt(3.0755851989071915e29), 307558519890719151276406341632n);
  assertSame(BigInt(-1e50), -0x446c3b15f992680000000000000000000000000000n);
  assertSame(BigInt(Object(2**53 - 1)), 9007199254740991n);
  assertSame(BigInt([]), 0n);
}{
  assertThrows(() => BigInt(NaN), RangeError);
  assertThrows(() => BigInt(-Infinity), RangeError);
  assertThrows(() => BigInt(+Infinity), RangeError);
  assertThrows(() => BigInt(4.00000001), RangeError);
  assertThrows(() => BigInt(Object(4.00000001)), RangeError);
}

// BigInt.prototype[Symbol.toStringTag]
{
  const toStringTag = Object.getOwnPropertyDescriptor(
      BigInt.prototype, Symbol.toStringTag);
  assertTrue(toStringTag.configurable);
  assertFalse(toStringTag.enumerable);
  assertFalse(toStringTag.writable);
  assertEquals("BigInt", toStringTag.value);
}

// Object.prototype.toString
{
  const toString = Object.prototype.toString;

  assertEquals("[object BigInt]", toString.call(42n));
  assertEquals("[object BigInt]", toString.call(Object(42n)));

  delete BigInt.prototype[Symbol.toStringTag];
  assertEquals("[object Object]", toString.call(42n));
  assertEquals("[object Object]", toString.call(Object(42n)));

  BigInt.prototype[Symbol.toStringTag] = "foo";
  assertEquals("[object foo]", toString.call(42n));
  assertEquals("[object foo]", toString.call(Object(42n)));
}

// typeof
{
  assertEquals(typeof zero, "bigint");
  assertEquals(typeof one, "bigint");
}{
  assertEquals(%Typeof(zero), "bigint");
  assertEquals(%Typeof(one), "bigint");
}{
  assertTrue(typeof 1n === "bigint");
  assertFalse(typeof 1n === "BigInt");
  assertFalse(typeof 1 === "bigint");
}

// ToString
{
  assertEquals(String(zero), "0");
  assertEquals(String(one), "1");
}

// .toString(radix)
{
  // Single-digit BigInts: random-generated inputs close to kMaxInt.
  // Expectations computed with the following Python program:
  //   def Format(x, base):
  //     s = ""
  //     while x > 0:
  //       s = "0123456789abcdefghijklmnopqrstuvwxyz"[x % base] + s
  //       x = x / base
  //     return s
  assertEquals("10100110000100101000011100101", BigInt(0x14c250e5).toString(2));
  assertEquals("-110110100010011111001011111", BigInt(-0x6d13e5f).toString(2));
  assertEquals("1001222020000100000", BigInt(0x18c72873).toString(3));
  assertEquals("-1212101122110102020", BigInt(-0x2b19aebe).toString(3));
  assertEquals("120303133110120", BigInt(0x18cdf518).toString(4));
  assertEquals("-113203101020122", BigInt(-0x178d121a).toString(4));
  assertEquals("1323302233400", BigInt(0x18de6256).toString(5));
  assertEquals("-2301033210212", BigInt(-0x25f7f454).toString(5));
  assertEquals("131050115130", BigInt(0x211f0d5e).toString(6));
  assertEquals("-104353333321", BigInt(-0x186bbe91).toString(6));
  assertEquals("25466260221", BigInt(0x2f69f47e).toString(7));
  assertEquals("-31051540346", BigInt(-0x352c7efa).toString(7));
  assertEquals("5004630525", BigInt(0x28133155).toString(8));
  assertEquals("-7633240703", BigInt(-0x3e6d41c3).toString(8));
  assertEquals("705082365", BigInt(0x121f4264).toString(9));
  assertEquals("-780654431", BigInt(-0x1443b36e).toString(9));
  assertEquals("297019028", BigInt(0x11b42694).toString(10));
  assertEquals("-721151126", BigInt(-0x2afbe496).toString(10));
  assertEquals("312914074", BigInt(0x27ca6879).toString(11));
  assertEquals("-198025592", BigInt(-0x1813d3a7).toString(11));
  assertEquals("191370997", BigInt(0x2d14f083).toString(12));
  assertEquals("-1b8aab4a2", BigInt(-0x32b52efa).toString(12));
  assertEquals("7818062c", BigInt(0x1c84a48c).toString(13));
  assertEquals("-7529695b", BigInt(-0x1badffee).toString(13));
  assertEquals("6bc929c4", BigInt(0x2b0a91d0).toString(14));
  assertEquals("-63042008", BigInt(-0x270dff78).toString(14));
  assertEquals("5e8b8dec", BigInt(0x3cd27d7f).toString(15));
  assertEquals("-4005433d", BigInt(-0x28c0821a).toString(15));
  assertEquals("10b35ca3", BigInt(0x10b35ca3).toString(16));
  assertEquals("-23d4d9d6", BigInt(-0x23d4d9d6).toString(16));
  assertEquals("28c3d5e3", BigInt(0x3d75d48c).toString(17));
  assertEquals("-10c06328", BigInt(-0x1979b7f0).toString(17));
  assertEquals("eb8d349", BigInt(0x1dacf0a5).toString(18));
  assertEquals("-1217015h", BigInt(-0x28b3c23f).toString(18));
  assertEquals("1018520b", BigInt(0x357da01a).toString(19));
  assertEquals("-9c64e33", BigInt(-0x1b0e9571).toString(19));
  assertEquals("d7bf9ab", BigInt(0x3309daa3).toString(20));
  assertEquals("-58h0h9h", BigInt(-0x14c30c55).toString(20));
  assertEquals("64igi9h", BigInt(0x1fdd329c).toString(21));
  assertEquals("-45cbc4a", BigInt(-0x15cf9682).toString(21));
  assertEquals("7bi7d1h", BigInt(0x32f0dfe3).toString(22));
  assertEquals("-61j743l", BigInt(-0x291ff61f).toString(22));
  assertEquals("5g5gg25", BigInt(0x325a10bd).toString(23));
  assertEquals("-3359flb", BigInt(-0x1bb653c9).toString(23));
  assertEquals("392f5ec", BigInt(0x267ed69c).toString(24));
  assertEquals("-2ab3icb", BigInt(-0x1bbf7bab).toString(24));
  assertEquals("3jb2afo", BigInt(0x36f93c24).toString(25));
  assertEquals("-30bcheh", BigInt(-0x2bec76fa).toString(25));
  assertEquals("3845agk", BigInt(0x3d04bf64).toString(26));
  assertEquals("-1gpjl3g", BigInt(-0x1e720b1a).toString(26));
  assertEquals("20bpaf0", BigInt(0x2e8ff627).toString(27));
  assertEquals("-292i3c2", BigInt(-0x35f751fe).toString(27));
  assertEquals("266113k", BigInt(0x3fd26738).toString(28));
  assertEquals("-1eh16bo", BigInt(-0x2bb5726c).toString(28));
  assertEquals("19gj7qa", BigInt(0x2f28e8d8).toString(29));
  assertEquals("-13a0apf", BigInt(-0x278b4588).toString(29));
  assertEquals("iasrb8", BigInt(0x1a99b3be).toString(30));
  assertEquals("-frlhoc", BigInt(-0x17106f48).toString(30));
  assertEquals("bfe4p2", BigInt(0x139f1ea3).toString(31));
  assertEquals("-ioal1a", BigInt(-0x200e49fa).toString(31));
  assertEquals("m0v0kf", BigInt(0x2c0f828f).toString(32));
  assertEquals("-g4bab5", BigInt(-0x2045a965).toString(32));
  assertEquals("9i1kit", BigInt(0x16450a9f).toString(33));
  assertEquals("-fqb0e7", BigInt(-0x24d9e889).toString(33));
  assertEquals("gb9r6m", BigInt(0x2c3acf46).toString(34));
  assertEquals("-jcaemv", BigInt(-0x346f72b3).toString(34));
  assertEquals("cw4mbk", BigInt(0x2870cdcb).toString(35));
  assertEquals("-hw4eki", BigInt(-0x3817c29b).toString(35));
  assertEquals("alzwgj", BigInt(0x263e2c13).toString(36));
  assertEquals("-bo4ukz", BigInt(-0x2a0f97d3).toString(36));

  // Multi-digit BigInts.
  // Test parseInt/toString round trip on a list of randomly generated
  // string representations of numbers in various bases.

  // Userland polyfill while we wait for BigInt.fromString (see:
  // https://mathiasbynens.github.io/proposal-number-fromstring/ ).
  // This intentionally only implements what the tests below need.
  function ParseBigInt(str, radix) {
    const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
    var result = 0n;
    var base = BigInt(radix);
    var index = 0;
    var negative = false;
    if (str[0] === "-") {
      negative = true;
      index++;
    }
    for (; index < str.length; index++) {
      var digit = alphabet.indexOf(str[index]);
      assertTrue(digit >= 0 && digit < radix);
      result = result * base + BigInt(digit);
    }
    if (negative) result = -result;
    return result;
  }
  var positive = [0, 0,  // Skip base 0 and 1.
    "1100110001100010110011110110010010001011100111100101111000111101100001000",
    "1001200022210010220101120212021002011002201122200002211102120120021011020",
    "1111113020012203332320220022231110130001001320122012131311333110012023232",
    "4214313040222110434114402342013144321401424143322013320403411012033300312",
    "5025302003542512450341430541203424555035430434034243510233043041501130015",
    "6231052230016515343200525230300322104013130605414211331345043144525012021",
    "1146340505617030644211355340006353546230356336306352536433054143503442135",
    "7262360724624787621528668212168232276348417717770383567066203032200270570",
    "7573792356581293501680046955899735043496925151216904903504319328753434194",
    "4a627927557579898720a42647639128174a8689889766a219342133671449069a2235011",
    "1a574a5848289924996342a32893380690322330393633b587ba5a15b7b82080222400464",
    "5163304c74c387b7a443c92466688595b671a3329b42083b1499b0c10a74a9298a06c3a5a",
    "4b63c834356a03c80946133284a709cbbc2a75022757207dc31c14abd4c160dc122327c17",
    "d8d59cbb4ca2860de7c002eee4ab3c215b90069200d20dbdc0111cb1e1bab97e8c7609670",
    "22d4b69398a7f848e6ae36798811cd1a63d90f340d8607f3ce5566c97c18468787eb2b9fd",
    "1176gf69afd32cc105fa70c705927a384dbdb1g8d952f28028g31ebdc9e32a89f16e825ee",
    "5d64b74f4d70632h4ee07h7c1e2da9125c42g2727f4b6d95e5cec6ga49566hh731ab5f544",
    "7ff8cg7f05dd72916a09a4761ii7b0ibcg68ba39b10436f14efg76ge817317badcbi4gffc",
    "6d7c4hci6cd72e4ja26j354i12i71gb0cbj12gi145j91h02hde3b72c65geb7ff9bi9d0c2b",
    "c96997f50abe425d13a53kk4af631kg7db208ka5j5bfg8ca5f9c0bjf69j5kgg4jb5h7hi86",
    "3g5fd800d9ib9j0i8all5jgb23dh9483ab6le5ad9g4kja8a0b3j5jbjfge7k5fffg2kbheee",
    "9j1119d1cd61kmdm7kma105cki313f678fc3h25f4664281bbmg3fk97kfbh7d48j89j178ch",
    "d2933cdc9jfe4hl3794kb3e13dg2lihad968ib9jg19dgf1fi482b27ji0d10c6kfkdge5764",
    "bf6o0njkm1ij5in5nh7h94584bd80el02b07el5ojk9k9g0gn906do70gbbnckl048c0kdmao",
    "8gb7jnge9p9cdgigo394oa33gfaenc3gnb53eceg4b8511gkkm88b0dod85e5bggpc861d7d5",
    "qbbnqhkpleb4o8ndaddpc34h5b2iljn3jgnjdn5k57bi3n9i09hjle9hqgqdpgbnk499mak56",
    "akg7e2976arn8i2m53gif0dp59bmfd7mk9erlg2qm3fc76da9glf397eh4ooij9il0nfl9gac",
    "mehpbfrj5ah2ef3p2hl637gjp1pm5grqn4037pm1qfgfpr9cfljfc145hljehjjb48bb1n6en",
    "rg6ik3agnb3p6t2rtja9h4il76i8fkqlt6gplap3fq6pfr7bbcfcp5ffncf3nm4kamap39hse",
    "bk8rp9r9r8pltdqpb7euc6s9rcm33969pcq6uk3mtfoktt86di8589oacbam5tn29b9b6dq3j",
    "npth8juld44rss3e57iigjg65po3d1h02heo4r103jmg3ocv89buqtgiov35k39rdf8j9t4ca",
    "vrmqlwrrrd0uml1womae49jpa9tadh44fw7mucgk06l0uk4uqwuo37t6kwn7wwrm3a6oq081s",
    "n5cft6gvufqd8iksquu2amghokk17gbtpguidc290af634p7k7rhmfu7bf1s62ej4megoa1j4",
    "3v3gcrmlfc2tl0tefgkiogj41f6y2tmj9w5bxke8y03xqf49ox8gh9wbrhycrkluicqajtnur",
    "z2m7b0sy2tzergtkqts5yj0dkrlfkxls81ijgxgfequizpntcwggv2d4rdzcncd0kj9mrmnrb",
  ];
  var negative = [0, 0,  // Skip base 0 and 1.
    "-100010011110111010111111110001100100111010101000001011010010101100101000",
    "-110012122000122102021210112200001000122011010120101201001122000002022102",
    "-203210320111001002200122200001312300221100221321010300023323201113122333",
    "-133042441230110320040323303341320302144241224443231311022240124413104131",
    "-311325230504055004330150145105331121322231155401110315251422505233103112",
    "-643153641664240231336166403516403454646560261062114326443664602606315326",
    "-200057252627665476551635525303641543165622340301637556323453513664337277",
    "-826688166214270516331644053744613530235020517172322840763172114078364165",
    "-743042397390679269240157150971957535458122650450558451124173993544604852",
    "-73528688500003573942a56a504a2996a1384129563098512a63196697975038692aaa63",
    "-616576a2948a9029316290168b71137b027851639a0283150b125b664b74b767a3597805",
    "-b875467540719b371b7a36047a7886872a5399c4c630c37149bc3182917a7a7c124475bb",
    "-3860411b61d35977721bc81bd715c386c9b70a752940913d265505d8c7c5dd2624b591d7",
    "-bad5dd79b083ee0da9a6296664e72c246d827762357116ae7076a22bb369acbc3a201d03",
    "-f9b37352aff265124303942a463917a252ff1a2ff4a33777f490b4c103bdcd1a655dbe2c",
    "-805fg8c74125214g383a8d8g573c49fa7c4035fbc6db61g5gb5g6beb8f90dae4a9a5g7cc",
    "-70aae113459d3h5084b1gg209g3695d20e78d01gcbb71bh1bd4gdge31haf5hc02dghf14e",
    "-c55a57haf47b7ih2gh6ea93098ig02b42icga6ead254e0aeeic7g53h5fd6637ge03b2e20",
    "-e32f7204624ie596j731g72136cejc25ebbgb0140i4997fcdf477f021d86ci4e10db543a",
    "-i7f32c817i3cac1c24c7786k6ig185f47cj1471ki6bb7agiae838027gjge9g59if9f88g6",
    "-i30aha2030a9605c270h92e1ca3i02j996hl918gh52fbhb7i16ik1i919ieak3cj384kb61",
    "-58jmem8e59li67aellid2083dabh4kh51ci1jg7c6a3k4l1hdgfkdha0fglfm4805kida5b9",
    "-cl9iecjg9ak087cad4151lll44296heae2349g70fbjj37998m2ddn6427fgcl2aknhgn1a1",
    "-alfjfhho4gf8bi4j2bi3743mhg2aache4c6jcinkmf5ddm7kf9gg350hlja16ealbdlk201j",
    "-bhh1146ho3o2m3b839c565hbgjnhjh96oofbmdl7gn8h4f94kli94hkk180o79pc4d2l0721",
    "-p00gknh7e05k6a3apg6i9lb46f4a9qeeiq1778ak8il5dcponk5gl2fiednb4pmo1agmoqph",
    "-4j8lo4d4p508fnd2hkfb76e8ri81k6hq0op3pr14ca0cn96pccplk7rbahc9cdkdce1q16dn",
    "-ednlo3ogf2i8annrel9rm323bpf00meed3oi47n0qrdgnd2n3il4bnsc9s2jd7loh44im8ra",
    "-bjjg6fsbpcc2tc1o09m9r6fd6eoq5480har62a5offn9thcfahbno9kf9magl2akl0jgncj9",
    "-sonuhat2h60glpbpej9jjado2s5l86122d26tudoc1d6aic2oitu793gk0mlac3dk1dufp1q",
    "-i9pbvm53ubh8jqifuarauch8cbgk9cjsl6rlioka1phs1lskg1oosll23hjoli2subgr1rto",
    "-w1ncn5t60b5dv669ekwnvk8n2g7djrsl8cdkwun8o3m5divc3jhnkp2381rhj70gc71a6wff",
    "-buiq8v33p5ex44ps4s45enj6lrluivm19lcowkvntu72u0xguw13bxgxxe7mdlwt1a4qksae",
    "-woiycfmea6i12r2yai49mf4lbd7w2jdoebiogfhnh1i4rwgox57obci8qbsfpb4w07nu19m5",
    "-tbttuip1r6ioca6g6dw354o4m78qep9yh03nojx47yq29fqime6zstwllb74501qct8eskxn",
  ];
  for (var base = 2; base <= 36; base++) {
    var input = positive[base];
    assertEquals(input, ParseBigInt(input, base).toString(base));
    input = negative[base];
    assertEquals(input, ParseBigInt(input, base).toString(base));
  }
}

// .valueOf
{
  assertEquals(Object(zero).valueOf(), another_zero);
  assertThrows(() => { return BigInt.prototype.valueOf.call("string"); },
               TypeError);
  assertEquals(-42n, Object(-42n).valueOf());
}

// ToBoolean
{
  assertTrue(!zero);
  assertFalse(!!zero);
  assertTrue(!!!zero);

  assertFalse(!one);
  assertTrue(!!one);
  assertFalse(!!!one);

  // This is a hack to test Object::BooleanValue.
  assertTrue(%CreateIterResultObject(42, one).done);
  assertFalse(%CreateIterResultObject(42, zero).done);
}

// ToNumber
{
  assertThrows(() => isNaN(zero), TypeError);
  assertThrows(() => isNaN(one), TypeError);

  assertThrows(() => +zero, TypeError);
  assertThrows(() => +one, TypeError);
}
{
  let Zero = {valueOf() { return zero }};
  let One = {valueOf() { return one }};

  assertThrows(() => isNaN(Zero), TypeError);
  assertThrows(() => isNaN(One), TypeError);

  assertThrows(() => +Zero, TypeError);
  assertThrows(() => +One, TypeError);
}{
  let Zero = {valueOf() { return Object(NaN) }, toString() { return zero }};
  let One = {valueOf() { return one }, toString() { return NaN }};

  assertThrows(() => isNaN(Zero), TypeError);
  assertThrows(() => isNaN(One), TypeError);

  assertThrows(() => +Zero, TypeError);
  assertThrows(() => +One, TypeError);
}

// ToObject
{
  const ToObject = x => (new Function("", "return this")).call(x);

  function test(x) {
    const X = ToObject(x);
    assertEquals(typeof x, "bigint");
    assertEquals(typeof X, 'object');
    assertEquals(X.constructor, BigInt);
    assertTrue(X == x);
  }

  test(0n);
  test(-1n);
  test(1n);
  test(2343423423423423423424234234234235234524353453452345324523452345234534n);
}{
  function test(x) {
    const X = Object(x);
    assertEquals(typeof x, "bigint");
    assertEquals(typeof X, 'object');
    assertEquals(X.constructor, BigInt);
    assertTrue(X == x);
  }

  test(0n);
  test(-1n);
  test(1n);
  test(2343423423423423423424234234234235234524353453452345324523452345234534n);
}

// Literals
{
  // Invalid literals.
  assertThrows("00n", SyntaxError);
  assertThrows("01n", SyntaxError);
  assertThrows("0bn", SyntaxError);
  assertThrows("0on", SyntaxError);
  assertThrows("0xn", SyntaxError);
  assertThrows("1.n", SyntaxError);
  assertThrows("1.0n", SyntaxError);
  assertThrows("1e25n", SyntaxError);

  // Various radixes.
  assertTrue(12345n === BigInt(12345));
  assertTrue(0xabcden === BigInt(0xabcde));
  assertTrue(0xAbCdEn === BigInt(0xabcde));
  assertTrue(0o54321n === BigInt(0o54321));
  assertTrue(0b1010101n === BigInt(0b1010101));
}

// Binary ops.
{
  let One = {valueOf() { return one }};
  assertTrue(one + two === three);
  assertTrue(One + two === three);
  assertTrue(two + One === three);
  assertEquals("hello1", "hello" + one);
  assertEquals("2hello", two + "hello");
  assertThrows("one + 2", TypeError);
  assertThrows("2 + one", TypeError);
  assertThrows("one + 0.5", TypeError);
  assertThrows("0.5 + one", TypeError);
  assertThrows("one + null", TypeError);
  assertThrows("null + one", TypeError);

  assertTrue(three - two === one);
  assertThrows("two - 1", TypeError);
  assertThrows("2 - one", TypeError);
  assertThrows("two - 0.5", TypeError);
  assertThrows("2.5 - one", TypeError);

  assertTrue(two * three === six);
  assertTrue(two * One === two);
  assertTrue(One * two === two);
  assertThrows("two * 1", TypeError);
  assertThrows("1 * two", TypeError);
  assertThrows("two * 1.5", TypeError);
  assertThrows("1.5 * two", TypeError);

  assertTrue(six / three === two);
  assertThrows("six / 3", TypeError);
  assertThrows("3 / three", TypeError);
  assertThrows("six / 0.5", TypeError);
  assertThrows("0.5 / six", TypeError);
  assertThrows("zero / zero", RangeError);
  assertThrows("zero / 0", TypeError);

  assertTrue(three % two === one);
  assertThrows("three % 2", TypeError);
  assertThrows("3 % two", TypeError);
  assertThrows("three % 2.5", TypeError);
  assertThrows("3.5 % two", TypeError);
  assertThrows("three % zero", RangeError);
  assertThrows("three % 0", TypeError);
}

// Bitwise binary ops.
{
  let One = {valueOf() { return one }};
  assertTrue((three & one) === one);
  assertTrue((BigInt(-2) & zero) === zero);
  assertTrue((three & One) === one);
  assertTrue((One & three) === one);
  assertThrows("three & 1", TypeError);
  assertThrows("1 & three", TypeError);
  assertThrows("three & true", TypeError);
  assertThrows("true & three", TypeError);
  assertThrows("three & {valueOf: function() { return 1; }}", TypeError);
  assertThrows("({valueOf: function() { return 1; }}) & three", TypeError);

  assertTrue((two | one) === three);
  assertThrows("two | 0", TypeError);
  assertThrows("0 | two", TypeError);
  assertThrows("two | undefined", TypeError);
  assertThrows("undefined | two", TypeError);

  assertTrue((three ^ one) === two);
  assertThrows("three ^ 1", TypeError);
  assertThrows("1 ^ three", TypeError);
  assertThrows("three ^ 2.5", TypeError);
  assertThrows("2.5 ^ three", TypeError);
}

// Shift ops.
{
  assertTrue(one << one === two);
  assertThrows("one << 1", TypeError);
  assertThrows("1 << one", TypeError);
  assertThrows("one << true", TypeError);
  assertThrows("true << one", TypeError);

  assertTrue(three >> one === one);
  assertThrows("three >> 1", TypeError);
  assertThrows("0xbeef >> one", TypeError);
  assertThrows("three >> 1.5", TypeError);
  assertThrows("23.45 >> three", TypeError);

  assertThrows("three >>> one", TypeError);
  assertThrows("three >>> 1", TypeError);
  assertThrows("0xbeef >>> one", TypeError);
  assertThrows("three >>> {valueOf: function() { return 1; }}", TypeError);
  assertThrows("({valueOf: function() { return 1; }}) >>> one", TypeError);
}

// Unary ops.
{
  let One = {valueOf() { return one }};
  assertTrue(~minus_one === zero);
  assertTrue(-minus_one === one);
  assertTrue(-One === minus_one);
  assertTrue(~~two === two);
  assertTrue(-(-two) === two);
  assertTrue(~One === BigInt(-2));

  let a = minus_one;
  assertTrue(a++ === minus_one);
  assertTrue(a === zero);
  assertTrue(a++ === zero);
  assertTrue(a === one);
  assertTrue(++a === two);
  assertTrue(a === two);
  assertTrue(--a === one);
  assertTrue(a === one);
  assertTrue(a-- === one);
  assertTrue(a === zero);
  assertTrue(a-- === zero);
  assertTrue(a === minus_one);

  a = {valueOf() { return minus_one }};
  assertTrue(a++ === minus_one);
  assertTrue(a++ === zero);
  assertTrue(a === one);

  a = {valueOf() { return one }};
  assertTrue(a-- === one);
  assertTrue(a-- === zero);
  assertTrue(a === minus_one);
}

// ToPropertyKey
{
  let obj = {};
  assertEquals(obj[0n], undefined);
  assertEquals(obj[0n] = 42, 42);
  assertEquals(obj[0n], 42);
  assertEquals(obj[0], 42);
  obj[0]++;
  assertEquals(obj[1n - 1n], 43);
  assertEquals(Reflect.get(obj, -0n), 43);
  assertEquals(obj[{toString() {return 0n}}], 43);
  assertEquals(Reflect.ownKeys(obj), ["0"]);
}{
  let obj = {};
  const unsafe = 9007199254740993n;
  assertEquals(obj[unsafe] = 23, 23);
  assertEquals(obj[unsafe], 23);
  assertEquals(Reflect.ownKeys(obj), ["9007199254740993"]);
  assertEquals(obj[9007199254740993], undefined);
  delete obj[unsafe];
  assertEquals(Reflect.ownKeys(obj), []);
}{
  let arr = [];
  assertFalse(4n in arr);
  arr[4n] = 42;
  assertTrue(4n in arr);
  let enumkeys = 0;
  for (const key in arr) {
    enumkeys++;
    assertSame(key, "4");
  }
  assertEquals(enumkeys, 1);
}{
  let str = "blubb";
  assertEquals(str[2n], "u");
  assertThrows(() => str.slice(2n), TypeError);
}{
  let obj = {};
  let key = 0;

  function set_key(x) { obj[key] = x }
  set_key("aaa");
  set_key("bbb");
  key = 0n;
  set_key("ccc");
  assertEquals(obj[key], "ccc");

  function get_key() { return obj[key] }
  assertEquals(get_key(), "ccc");
  assertEquals(get_key(), "ccc");
  key = 0;
  assertEquals(get_key(), "ccc");
}{
  assertSame(%ToName(0n), "0");
  assertSame(%ToName(-0n), "0");

  const unsafe = 9007199254740993n;
  assertSame(%ToName(unsafe), "9007199254740993");
}
