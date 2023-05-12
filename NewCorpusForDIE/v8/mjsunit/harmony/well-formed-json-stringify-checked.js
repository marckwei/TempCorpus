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

// Copyright 2018 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Test JSON.stringify for cases that hit
// JsonStringifier::SerializeString_.

// All code points from U+0000 to U+00FF.
assertEquals('"___\\u0000"', JSON.stringify('___\0'));
assertEquals('"___\\u0001"', JSON.stringify('___\x01'));
assertEquals('"___\\u0002"', JSON.stringify('___\x02'));
assertEquals('"___\\u0003"', JSON.stringify('___\x03'));
assertEquals('"___\\u0004"', JSON.stringify('___\x04'));
assertEquals('"___\\u0005"', JSON.stringify('___\x05'));
assertEquals('"___\\u0006"', JSON.stringify('___\x06'));
assertEquals('"___\\u0007"', JSON.stringify('___\x07'));
assertEquals('"___\\b"', JSON.stringify('___\b'));
assertEquals('"___\\t"', JSON.stringify('___\t'));
assertEquals('"___\\n"', JSON.stringify('___\n'));
assertEquals('"___\\u000b"', JSON.stringify('___\x0B'));
assertEquals('"___\\f"', JSON.stringify('___\f'));
assertEquals('"___\\r"', JSON.stringify('___\r'));
assertEquals('"___\\u000e"', JSON.stringify('___\x0E'));
assertEquals('"___\\u000f"', JSON.stringify('___\x0F'));
assertEquals('"___\\u0010"', JSON.stringify('___\x10'));
assertEquals('"___\\u0011"', JSON.stringify('___\x11'));
assertEquals('"___\\u0012"', JSON.stringify('___\x12'));
assertEquals('"___\\u0013"', JSON.stringify('___\x13'));
assertEquals('"___\\u0014"', JSON.stringify('___\x14'));
assertEquals('"___\\u0015"', JSON.stringify('___\x15'));
assertEquals('"___\\u0016"', JSON.stringify('___\x16'));
assertEquals('"___\\u0017"', JSON.stringify('___\x17'));
assertEquals('"___\\u0018"', JSON.stringify('___\x18'));
assertEquals('"___\\u0019"', JSON.stringify('___\x19'));
assertEquals('"___\\u001a"', JSON.stringify('___\x1A'));
assertEquals('"___\\u001b"', JSON.stringify('___\x1B'));
assertEquals('"___\\u001c"', JSON.stringify('___\x1C'));
assertEquals('"___\\u001d"', JSON.stringify('___\x1D'));
assertEquals('"___\\u001e"', JSON.stringify('___\x1E'));
assertEquals('"___\\u001f"', JSON.stringify('___\x1F'));
assertEquals('"___ "', JSON.stringify('___ '));
assertEquals('"___!"', JSON.stringify('___!'));
assertEquals('"___\\""', JSON.stringify('___"'));
assertEquals('"___#"', JSON.stringify('___#'));
assertEquals('"___$"', JSON.stringify('___$'));
assertEquals('"___%"', JSON.stringify('___%'));
assertEquals('"___&"', JSON.stringify('___&'));
assertEquals('"___\'"', JSON.stringify('___\''));
assertEquals('"___("', JSON.stringify('___('));
assertEquals('"___)"', JSON.stringify('___)'));
assertEquals('"___*"', JSON.stringify('___*'));
assertEquals('"___+"', JSON.stringify('___+'));
assertEquals('"___,"', JSON.stringify('___,'));
assertEquals('"___-"', JSON.stringify('___-'));
assertEquals('"___."', JSON.stringify('___.'));
assertEquals('"___/"', JSON.stringify('___/'));
assertEquals('"___0"', JSON.stringify('___0'));
assertEquals('"___1"', JSON.stringify('___1'));
assertEquals('"___2"', JSON.stringify('___2'));
assertEquals('"___3"', JSON.stringify('___3'));
assertEquals('"___4"', JSON.stringify('___4'));
assertEquals('"___5"', JSON.stringify('___5'));
assertEquals('"___6"', JSON.stringify('___6'));
assertEquals('"___7"', JSON.stringify('___7'));
assertEquals('"___8"', JSON.stringify('___8'));
assertEquals('"___9"', JSON.stringify('___9'));
assertEquals('"___:"', JSON.stringify('___:'));
assertEquals('"___;"', JSON.stringify('___;'));
assertEquals('"___<"', JSON.stringify('___<'));
assertEquals('"___="', JSON.stringify('___='));
assertEquals('"___>"', JSON.stringify('___>'));
assertEquals('"___?"', JSON.stringify('___?'));
assertEquals('"___@"', JSON.stringify('___@'));
assertEquals('"___A"', JSON.stringify('___A'));
assertEquals('"___B"', JSON.stringify('___B'));
assertEquals('"___C"', JSON.stringify('___C'));
assertEquals('"___D"', JSON.stringify('___D'));
assertEquals('"___E"', JSON.stringify('___E'));
assertEquals('"___F"', JSON.stringify('___F'));
assertEquals('"___G"', JSON.stringify('___G'));
assertEquals('"___H"', JSON.stringify('___H'));
assertEquals('"___I"', JSON.stringify('___I'));
assertEquals('"___J"', JSON.stringify('___J'));
assertEquals('"___K"', JSON.stringify('___K'));
assertEquals('"___L"', JSON.stringify('___L'));
assertEquals('"___M"', JSON.stringify('___M'));
assertEquals('"___N"', JSON.stringify('___N'));
assertEquals('"___O"', JSON.stringify('___O'));
assertEquals('"___P"', JSON.stringify('___P'));
assertEquals('"___Q"', JSON.stringify('___Q'));
assertEquals('"___R"', JSON.stringify('___R'));
assertEquals('"___S"', JSON.stringify('___S'));
assertEquals('"___T"', JSON.stringify('___T'));
assertEquals('"___U"', JSON.stringify('___U'));
assertEquals('"___V"', JSON.stringify('___V'));
assertEquals('"___W"', JSON.stringify('___W'));
assertEquals('"___X"', JSON.stringify('___X'));
assertEquals('"___Y"', JSON.stringify('___Y'));
assertEquals('"___Z"', JSON.stringify('___Z'));
assertEquals('"___["', JSON.stringify('___['));
assertEquals('"___\\\\"', JSON.stringify('___\\'));
assertEquals('"___]"', JSON.stringify('___]'));
assertEquals('"___^"', JSON.stringify('___^'));
assertEquals('"____"', JSON.stringify('____'));
assertEquals('"___`"', JSON.stringify('___`'));
assertEquals('"___a"', JSON.stringify('___a'));
assertEquals('"___b"', JSON.stringify('___b'));
assertEquals('"___c"', JSON.stringify('___c'));
assertEquals('"___d"', JSON.stringify('___d'));
assertEquals('"___e"', JSON.stringify('___e'));
assertEquals('"___f"', JSON.stringify('___f'));
assertEquals('"___g"', JSON.stringify('___g'));
assertEquals('"___h"', JSON.stringify('___h'));
assertEquals('"___i"', JSON.stringify('___i'));
assertEquals('"___j"', JSON.stringify('___j'));
assertEquals('"___k"', JSON.stringify('___k'));
assertEquals('"___l"', JSON.stringify('___l'));
assertEquals('"___m"', JSON.stringify('___m'));
assertEquals('"___n"', JSON.stringify('___n'));
assertEquals('"___o"', JSON.stringify('___o'));
assertEquals('"___p"', JSON.stringify('___p'));
assertEquals('"___q"', JSON.stringify('___q'));
assertEquals('"___r"', JSON.stringify('___r'));
assertEquals('"___s"', JSON.stringify('___s'));
assertEquals('"___t"', JSON.stringify('___t'));
assertEquals('"___u"', JSON.stringify('___u'));
assertEquals('"___v"', JSON.stringify('___v'));
assertEquals('"___w"', JSON.stringify('___w'));
assertEquals('"___x"', JSON.stringify('___x'));
assertEquals('"___y"', JSON.stringify('___y'));
assertEquals('"___z"', JSON.stringify('___z'));
assertEquals('"___{"', JSON.stringify('___{'));
assertEquals('"___|"', JSON.stringify('___|'));
assertEquals('"___}"', JSON.stringify('___}'));
assertEquals('"___~"', JSON.stringify('___~'));
assertEquals('"___\x7F"', JSON.stringify('___\x7F'));
assertEquals('"___\x80"', JSON.stringify('___\x80'));
assertEquals('"___\x81"', JSON.stringify('___\x81'));
assertEquals('"___\x82"', JSON.stringify('___\x82'));
assertEquals('"___\x83"', JSON.stringify('___\x83'));
assertEquals('"___\x84"', JSON.stringify('___\x84'));
assertEquals('"___\x85"', JSON.stringify('___\x85'));
assertEquals('"___\x86"', JSON.stringify('___\x86'));
assertEquals('"___\x87"', JSON.stringify('___\x87'));
assertEquals('"___\x88"', JSON.stringify('___\x88'));
assertEquals('"___\x89"', JSON.stringify('___\x89'));
assertEquals('"___\x8A"', JSON.stringify('___\x8A'));
assertEquals('"___\x8B"', JSON.stringify('___\x8B'));
assertEquals('"___\x8C"', JSON.stringify('___\x8C'));
assertEquals('"___\x8D"', JSON.stringify('___\x8D'));
assertEquals('"___\x8E"', JSON.stringify('___\x8E'));
assertEquals('"___\x8F"', JSON.stringify('___\x8F'));
assertEquals('"___\x90"', JSON.stringify('___\x90'));
assertEquals('"___\x91"', JSON.stringify('___\x91'));
assertEquals('"___\x92"', JSON.stringify('___\x92'));
assertEquals('"___\x93"', JSON.stringify('___\x93'));
assertEquals('"___\x94"', JSON.stringify('___\x94'));
assertEquals('"___\x95"', JSON.stringify('___\x95'));
assertEquals('"___\x96"', JSON.stringify('___\x96'));
assertEquals('"___\x97"', JSON.stringify('___\x97'));
assertEquals('"___\x98"', JSON.stringify('___\x98'));
assertEquals('"___\x99"', JSON.stringify('___\x99'));
assertEquals('"___\x9A"', JSON.stringify('___\x9A'));
assertEquals('"___\x9B"', JSON.stringify('___\x9B'));
assertEquals('"___\x9C"', JSON.stringify('___\x9C'));
assertEquals('"___\x9D"', JSON.stringify('___\x9D'));
assertEquals('"___\x9E"', JSON.stringify('___\x9E'));
assertEquals('"___\x9F"', JSON.stringify('___\x9F'));
assertEquals('"___\xA0"', JSON.stringify('___\xA0'));
assertEquals('"___\xA1"', JSON.stringify('___\xA1'));
assertEquals('"___\xA2"', JSON.stringify('___\xA2'));
assertEquals('"___\xA3"', JSON.stringify('___\xA3'));
assertEquals('"___\xA4"', JSON.stringify('___\xA4'));
assertEquals('"___\xA5"', JSON.stringify('___\xA5'));
assertEquals('"___\xA6"', JSON.stringify('___\xA6'));
assertEquals('"___\xA7"', JSON.stringify('___\xA7'));
assertEquals('"___\xA8"', JSON.stringify('___\xA8'));
assertEquals('"___\xA9"', JSON.stringify('___\xA9'));
assertEquals('"___\xAA"', JSON.stringify('___\xAA'));
assertEquals('"___\xAB"', JSON.stringify('___\xAB'));
assertEquals('"___\xAC"', JSON.stringify('___\xAC'));
assertEquals('"___\xAD"', JSON.stringify('___\xAD'));
assertEquals('"___\xAE"', JSON.stringify('___\xAE'));
assertEquals('"___\xAF"', JSON.stringify('___\xAF'));
assertEquals('"___\xB0"', JSON.stringify('___\xB0'));
assertEquals('"___\xB1"', JSON.stringify('___\xB1'));
assertEquals('"___\xB2"', JSON.stringify('___\xB2'));
assertEquals('"___\xB3"', JSON.stringify('___\xB3'));
assertEquals('"___\xB4"', JSON.stringify('___\xB4'));
assertEquals('"___\xB5"', JSON.stringify('___\xB5'));
assertEquals('"___\xB6"', JSON.stringify('___\xB6'));
assertEquals('"___\xB7"', JSON.stringify('___\xB7'));
assertEquals('"___\xB8"', JSON.stringify('___\xB8'));
assertEquals('"___\xB9"', JSON.stringify('___\xB9'));
assertEquals('"___\xBA"', JSON.stringify('___\xBA'));
assertEquals('"___\xBB"', JSON.stringify('___\xBB'));
assertEquals('"___\xBC"', JSON.stringify('___\xBC'));
assertEquals('"___\xBD"', JSON.stringify('___\xBD'));
assertEquals('"___\xBE"', JSON.stringify('___\xBE'));
assertEquals('"___\xBF"', JSON.stringify('___\xBF'));
assertEquals('"___\xC0"', JSON.stringify('___\xC0'));
assertEquals('"___\xC1"', JSON.stringify('___\xC1'));
assertEquals('"___\xC2"', JSON.stringify('___\xC2'));
assertEquals('"___\xC3"', JSON.stringify('___\xC3'));
assertEquals('"___\xC4"', JSON.stringify('___\xC4'));
assertEquals('"___\xC5"', JSON.stringify('___\xC5'));
assertEquals('"___\xC6"', JSON.stringify('___\xC6'));
assertEquals('"___\xC7"', JSON.stringify('___\xC7'));
assertEquals('"___\xC8"', JSON.stringify('___\xC8'));
assertEquals('"___\xC9"', JSON.stringify('___\xC9'));
assertEquals('"___\xCA"', JSON.stringify('___\xCA'));
assertEquals('"___\xCB"', JSON.stringify('___\xCB'));
assertEquals('"___\xCC"', JSON.stringify('___\xCC'));
assertEquals('"___\xCD"', JSON.stringify('___\xCD'));
assertEquals('"___\xCE"', JSON.stringify('___\xCE'));
assertEquals('"___\xCF"', JSON.stringify('___\xCF'));
assertEquals('"___\xD0"', JSON.stringify('___\xD0'));
assertEquals('"___\xD1"', JSON.stringify('___\xD1'));
assertEquals('"___\xD2"', JSON.stringify('___\xD2'));
assertEquals('"___\xD3"', JSON.stringify('___\xD3'));
assertEquals('"___\xD4"', JSON.stringify('___\xD4'));
assertEquals('"___\xD5"', JSON.stringify('___\xD5'));
assertEquals('"___\xD6"', JSON.stringify('___\xD6'));
assertEquals('"___\xD7"', JSON.stringify('___\xD7'));
assertEquals('"___\xD8"', JSON.stringify('___\xD8'));
assertEquals('"___\xD9"', JSON.stringify('___\xD9'));
assertEquals('"___\xDA"', JSON.stringify('___\xDA'));
assertEquals('"___\xDB"', JSON.stringify('___\xDB'));
assertEquals('"___\xDC"', JSON.stringify('___\xDC'));
assertEquals('"___\xDD"', JSON.stringify('___\xDD'));
assertEquals('"___\xDE"', JSON.stringify('___\xDE'));
assertEquals('"___\xDF"', JSON.stringify('___\xDF'));
assertEquals('"___\xE0"', JSON.stringify('___\xE0'));
assertEquals('"___\xE1"', JSON.stringify('___\xE1'));
assertEquals('"___\xE2"', JSON.stringify('___\xE2'));
assertEquals('"___\xE3"', JSON.stringify('___\xE3'));
assertEquals('"___\xE4"', JSON.stringify('___\xE4'));
assertEquals('"___\xE5"', JSON.stringify('___\xE5'));
assertEquals('"___\xE6"', JSON.stringify('___\xE6'));
assertEquals('"___\xE7"', JSON.stringify('___\xE7'));
assertEquals('"___\xE8"', JSON.stringify('___\xE8'));
assertEquals('"___\xE9"', JSON.stringify('___\xE9'));
assertEquals('"___\xEA"', JSON.stringify('___\xEA'));
assertEquals('"___\xEB"', JSON.stringify('___\xEB'));
assertEquals('"___\xEC"', JSON.stringify('___\xEC'));
assertEquals('"___\xED"', JSON.stringify('___\xED'));
assertEquals('"___\xEE"', JSON.stringify('___\xEE'));
assertEquals('"___\xEF"', JSON.stringify('___\xEF'));
assertEquals('"___\xF0"', JSON.stringify('___\xF0'));
assertEquals('"___\xF1"', JSON.stringify('___\xF1'));
assertEquals('"___\xF2"', JSON.stringify('___\xF2'));
assertEquals('"___\xF3"', JSON.stringify('___\xF3'));
assertEquals('"___\xF4"', JSON.stringify('___\xF4'));
assertEquals('"___\xF5"', JSON.stringify('___\xF5'));
assertEquals('"___\xF6"', JSON.stringify('___\xF6'));
assertEquals('"___\xF7"', JSON.stringify('___\xF7'));
assertEquals('"___\xF8"', JSON.stringify('___\xF8'));
assertEquals('"___\xF9"', JSON.stringify('___\xF9'));
assertEquals('"___\xFA"', JSON.stringify('___\xFA'));
assertEquals('"___\xFB"', JSON.stringify('___\xFB'));
assertEquals('"___\xFC"', JSON.stringify('___\xFC'));
assertEquals('"___\xFD"', JSON.stringify('___\xFD'));
assertEquals('"___\xFE"', JSON.stringify('___\xFE'));
assertEquals('"___\xFF"', JSON.stringify('___\xFF'));

// A random selection of code points from U+0100 to U+D7FF.
assertEquals('"___\u0100"', JSON.stringify('___\u0100'));
assertEquals('"___\u0120"', JSON.stringify('___\u0120'));
assertEquals('"___\u07D3"', JSON.stringify('___\u07D3'));
assertEquals('"___\u0B8B"', JSON.stringify('___\u0B8B'));
assertEquals('"___\u0C4C"', JSON.stringify('___\u0C4C'));
assertEquals('"___\u178D"', JSON.stringify('___\u178D'));
assertEquals('"___\u18B8"', JSON.stringify('___\u18B8'));
assertEquals('"___\u193E"', JSON.stringify('___\u193E'));
assertEquals('"___\u198A"', JSON.stringify('___\u198A'));
assertEquals('"___\u1AF5"', JSON.stringify('___\u1AF5'));
assertEquals('"___\u1D38"', JSON.stringify('___\u1D38'));
assertEquals('"___\u1E37"', JSON.stringify('___\u1E37'));
assertEquals('"___\u1FC2"', JSON.stringify('___\u1FC2'));
assertEquals('"___\u22C7"', JSON.stringify('___\u22C7'));
assertEquals('"___\u2619"', JSON.stringify('___\u2619'));
assertEquals('"___\u272A"', JSON.stringify('___\u272A'));
assertEquals('"___\u2B7F"', JSON.stringify('___\u2B7F'));
assertEquals('"___\u2DFF"', JSON.stringify('___\u2DFF'));
assertEquals('"___\u341B"', JSON.stringify('___\u341B'));
assertEquals('"___\u3A3C"', JSON.stringify('___\u3A3C'));
assertEquals('"___\u3E53"', JSON.stringify('___\u3E53'));
assertEquals('"___\u3EC2"', JSON.stringify('___\u3EC2'));
assertEquals('"___\u3F76"', JSON.stringify('___\u3F76'));
assertEquals('"___\u3F85"', JSON.stringify('___\u3F85'));
assertEquals('"___\u43C7"', JSON.stringify('___\u43C7'));
assertEquals('"___\u4A19"', JSON.stringify('___\u4A19'));
assertEquals('"___\u4A1C"', JSON.stringify('___\u4A1C'));
assertEquals('"___\u4F80"', JSON.stringify('___\u4F80'));
assertEquals('"___\u5A30"', JSON.stringify('___\u5A30'));
assertEquals('"___\u5B55"', JSON.stringify('___\u5B55'));
assertEquals('"___\u5C74"', JSON.stringify('___\u5C74'));
assertEquals('"___\u6006"', JSON.stringify('___\u6006'));
assertEquals('"___\u63CC"', JSON.stringify('___\u63CC'));
assertEquals('"___\u6608"', JSON.stringify('___\u6608'));
assertEquals('"___\u6ABF"', JSON.stringify('___\u6ABF'));
assertEquals('"___\u6AE9"', JSON.stringify('___\u6AE9'));
assertEquals('"___\u6C91"', JSON.stringify('___\u6C91'));
assertEquals('"___\u714B"', JSON.stringify('___\u714B'));
assertEquals('"___\u728A"', JSON.stringify('___\u728A'));
assertEquals('"___\u7485"', JSON.stringify('___\u7485'));
assertEquals('"___\u77C8"', JSON.stringify('___\u77C8'));
assertEquals('"___\u7BE9"', JSON.stringify('___\u7BE9'));
assertEquals('"___\u7CEF"', JSON.stringify('___\u7CEF'));
assertEquals('"___\u7DD5"', JSON.stringify('___\u7DD5'));
assertEquals('"___\u8DF1"', JSON.stringify('___\u8DF1'));
assertEquals('"___\u94A9"', JSON.stringify('___\u94A9'));
assertEquals('"___\u94F2"', JSON.stringify('___\u94F2'));
assertEquals('"___\u9A7A"', JSON.stringify('___\u9A7A'));
assertEquals('"___\u9AA6"', JSON.stringify('___\u9AA6'));
assertEquals('"___\uA2B0"', JSON.stringify('___\uA2B0'));
assertEquals('"___\uB711"', JSON.stringify('___\uB711'));
assertEquals('"___\uBC01"', JSON.stringify('___\uBC01'));
assertEquals('"___\uBCB6"', JSON.stringify('___\uBCB6'));
assertEquals('"___\uBD70"', JSON.stringify('___\uBD70'));
assertEquals('"___\uC3CD"', JSON.stringify('___\uC3CD'));
assertEquals('"___\uC451"', JSON.stringify('___\uC451'));
assertEquals('"___\uC677"', JSON.stringify('___\uC677'));
assertEquals('"___\uC89B"', JSON.stringify('___\uC89B'));
assertEquals('"___\uCBEF"', JSON.stringify('___\uCBEF'));
assertEquals('"___\uCEF8"', JSON.stringify('___\uCEF8'));
assertEquals('"___\uD089"', JSON.stringify('___\uD089'));
assertEquals('"___\uD24D"', JSON.stringify('___\uD24D'));
assertEquals('"___\uD3A7"', JSON.stringify('___\uD3A7'));
assertEquals('"___\uD7FF"', JSON.stringify('___\uD7FF'));

// All lone surrogates, i.e. code points from U+D800 to U+DFFF.
assertEquals('"___\\ud800"', JSON.stringify('___\uD800'));
assertEquals('"___\\ud801"', JSON.stringify('___\uD801'));
assertEquals('"___\\ud802"', JSON.stringify('___\uD802'));
assertEquals('"___\\ud803"', JSON.stringify('___\uD803'));
assertEquals('"___\\ud804"', JSON.stringify('___\uD804'));
assertEquals('"___\\ud805"', JSON.stringify('___\uD805'));
assertEquals('"___\\ud806"', JSON.stringify('___\uD806'));
assertEquals('"___\\ud807"', JSON.stringify('___\uD807'));
assertEquals('"___\\ud808"', JSON.stringify('___\uD808'));
assertEquals('"___\\ud809"', JSON.stringify('___\uD809'));
assertEquals('"___\\ud80a"', JSON.stringify('___\uD80A'));
assertEquals('"___\\ud80b"', JSON.stringify('___\uD80B'));
assertEquals('"___\\ud80c"', JSON.stringify('___\uD80C'));
assertEquals('"___\\ud80d"', JSON.stringify('___\uD80D'));
assertEquals('"___\\ud80e"', JSON.stringify('___\uD80E'));
assertEquals('"___\\ud80f"', JSON.stringify('___\uD80F'));
assertEquals('"___\\ud810"', JSON.stringify('___\uD810'));
assertEquals('"___\\ud811"', JSON.stringify('___\uD811'));
assertEquals('"___\\ud812"', JSON.stringify('___\uD812'));
assertEquals('"___\\ud813"', JSON.stringify('___\uD813'));
assertEquals('"___\\ud814"', JSON.stringify('___\uD814'));
assertEquals('"___\\ud815"', JSON.stringify('___\uD815'));
assertEquals('"___\\ud816"', JSON.stringify('___\uD816'));
assertEquals('"___\\ud817"', JSON.stringify('___\uD817'));
assertEquals('"___\\ud818"', JSON.stringify('___\uD818'));
assertEquals('"___\\ud819"', JSON.stringify('___\uD819'));
assertEquals('"___\\ud81a"', JSON.stringify('___\uD81A'));
assertEquals('"___\\ud81b"', JSON.stringify('___\uD81B'));
assertEquals('"___\\ud81c"', JSON.stringify('___\uD81C'));
assertEquals('"___\\ud81d"', JSON.stringify('___\uD81D'));
assertEquals('"___\\ud81e"', JSON.stringify('___\uD81E'));
assertEquals('"___\\ud81f"', JSON.stringify('___\uD81F'));
assertEquals('"___\\ud820"', JSON.stringify('___\uD820'));
assertEquals('"___\\ud821"', JSON.stringify('___\uD821'));
assertEquals('"___\\ud822"', JSON.stringify('___\uD822'));
assertEquals('"___\\ud823"', JSON.stringify('___\uD823'));
assertEquals('"___\\ud824"', JSON.stringify('___\uD824'));
assertEquals('"___\\ud825"', JSON.stringify('___\uD825'));
assertEquals('"___\\ud826"', JSON.stringify('___\uD826'));
assertEquals('"___\\ud827"', JSON.stringify('___\uD827'));
assertEquals('"___\\ud828"', JSON.stringify('___\uD828'));
assertEquals('"___\\ud829"', JSON.stringify('___\uD829'));
assertEquals('"___\\ud82a"', JSON.stringify('___\uD82A'));
assertEquals('"___\\ud82b"', JSON.stringify('___\uD82B'));
assertEquals('"___\\ud82c"', JSON.stringify('___\uD82C'));
assertEquals('"___\\ud82d"', JSON.stringify('___\uD82D'));
assertEquals('"___\\ud82e"', JSON.stringify('___\uD82E'));
assertEquals('"___\\ud82f"', JSON.stringify('___\uD82F'));
assertEquals('"___\\ud830"', JSON.stringify('___\uD830'));
assertEquals('"___\\ud831"', JSON.stringify('___\uD831'));
assertEquals('"___\\ud832"', JSON.stringify('___\uD832'));
assertEquals('"___\\ud833"', JSON.stringify('___\uD833'));
assertEquals('"___\\ud834"', JSON.stringify('___\uD834'));
assertEquals('"___\\ud835"', JSON.stringify('___\uD835'));
assertEquals('"___\\ud836"', JSON.stringify('___\uD836'));
assertEquals('"___\\ud837"', JSON.stringify('___\uD837'));
assertEquals('"___\\ud838"', JSON.stringify('___\uD838'));
assertEquals('"___\\ud839"', JSON.stringify('___\uD839'));
assertEquals('"___\\ud83a"', JSON.stringify('___\uD83A'));
assertEquals('"___\\ud83b"', JSON.stringify('___\uD83B'));
assertEquals('"___\\ud83c"', JSON.stringify('___\uD83C'));
assertEquals('"___\\ud83d"', JSON.stringify('___\uD83D'));
assertEquals('"___\\ud83e"', JSON.stringify('___\uD83E'));
assertEquals('"___\\ud83f"', JSON.stringify('___\uD83F'));
assertEquals('"___\\ud840"', JSON.stringify('___\uD840'));
assertEquals('"___\\ud841"', JSON.stringify('___\uD841'));
assertEquals('"___\\ud842"', JSON.stringify('___\uD842'));
assertEquals('"___\\ud843"', JSON.stringify('___\uD843'));
assertEquals('"___\\ud844"', JSON.stringify('___\uD844'));
assertEquals('"___\\ud845"', JSON.stringify('___\uD845'));
assertEquals('"___\\ud846"', JSON.stringify('___\uD846'));
assertEquals('"___\\ud847"', JSON.stringify('___\uD847'));
assertEquals('"___\\ud848"', JSON.stringify('___\uD848'));
assertEquals('"___\\ud849"', JSON.stringify('___\uD849'));
assertEquals('"___\\ud84a"', JSON.stringify('___\uD84A'));
assertEquals('"___\\ud84b"', JSON.stringify('___\uD84B'));
assertEquals('"___\\ud84c"', JSON.stringify('___\uD84C'));
assertEquals('"___\\ud84d"', JSON.stringify('___\uD84D'));
assertEquals('"___\\ud84e"', JSON.stringify('___\uD84E'));
assertEquals('"___\\ud84f"', JSON.stringify('___\uD84F'));
assertEquals('"___\\ud850"', JSON.stringify('___\uD850'));
assertEquals('"___\\ud851"', JSON.stringify('___\uD851'));
assertEquals('"___\\ud852"', JSON.stringify('___\uD852'));
assertEquals('"___\\ud853"', JSON.stringify('___\uD853'));
assertEquals('"___\\ud854"', JSON.stringify('___\uD854'));
assertEquals('"___\\ud855"', JSON.stringify('___\uD855'));
assertEquals('"___\\ud856"', JSON.stringify('___\uD856'));
assertEquals('"___\\ud857"', JSON.stringify('___\uD857'));
assertEquals('"___\\ud858"', JSON.stringify('___\uD858'));
assertEquals('"___\\ud859"', JSON.stringify('___\uD859'));
assertEquals('"___\\ud85a"', JSON.stringify('___\uD85A'));
assertEquals('"___\\ud85b"', JSON.stringify('___\uD85B'));
assertEquals('"___\\ud85c"', JSON.stringify('___\uD85C'));
assertEquals('"___\\ud85d"', JSON.stringify('___\uD85D'));
assertEquals('"___\\ud85e"', JSON.stringify('___\uD85E'));
assertEquals('"___\\ud85f"', JSON.stringify('___\uD85F'));
assertEquals('"___\\ud860"', JSON.stringify('___\uD860'));
assertEquals('"___\\ud861"', JSON.stringify('___\uD861'));
assertEquals('"___\\ud862"', JSON.stringify('___\uD862'));
assertEquals('"___\\ud863"', JSON.stringify('___\uD863'));
assertEquals('"___\\ud864"', JSON.stringify('___\uD864'));
assertEquals('"___\\ud865"', JSON.stringify('___\uD865'));
assertEquals('"___\\ud866"', JSON.stringify('___\uD866'));
assertEquals('"___\\ud867"', JSON.stringify('___\uD867'));
assertEquals('"___\\ud868"', JSON.stringify('___\uD868'));
assertEquals('"___\\ud869"', JSON.stringify('___\uD869'));
assertEquals('"___\\ud86a"', JSON.stringify('___\uD86A'));
assertEquals('"___\\ud86b"', JSON.stringify('___\uD86B'));
assertEquals('"___\\ud86c"', JSON.stringify('___\uD86C'));
assertEquals('"___\\ud86d"', JSON.stringify('___\uD86D'));
assertEquals('"___\\ud86e"', JSON.stringify('___\uD86E'));
assertEquals('"___\\ud86f"', JSON.stringify('___\uD86F'));
assertEquals('"___\\ud870"', JSON.stringify('___\uD870'));
assertEquals('"___\\ud871"', JSON.stringify('___\uD871'));
assertEquals('"___\\ud872"', JSON.stringify('___\uD872'));
assertEquals('"___\\ud873"', JSON.stringify('___\uD873'));
assertEquals('"___\\ud874"', JSON.stringify('___\uD874'));
assertEquals('"___\\ud875"', JSON.stringify('___\uD875'));
assertEquals('"___\\ud876"', JSON.stringify('___\uD876'));
assertEquals('"___\\ud877"', JSON.stringify('___\uD877'));
assertEquals('"___\\ud878"', JSON.stringify('___\uD878'));
assertEquals('"___\\ud879"', JSON.stringify('___\uD879'));
assertEquals('"___\\ud87a"', JSON.stringify('___\uD87A'));
assertEquals('"___\\ud87b"', JSON.stringify('___\uD87B'));
assertEquals('"___\\ud87c"', JSON.stringify('___\uD87C'));
assertEquals('"___\\ud87d"', JSON.stringify('___\uD87D'));
assertEquals('"___\\ud87e"', JSON.stringify('___\uD87E'));
assertEquals('"___\\ud87f"', JSON.stringify('___\uD87F'));
assertEquals('"___\\ud880"', JSON.stringify('___\uD880'));
assertEquals('"___\\ud881"', JSON.stringify('___\uD881'));
assertEquals('"___\\ud882"', JSON.stringify('___\uD882'));
assertEquals('"___\\ud883"', JSON.stringify('___\uD883'));
assertEquals('"___\\ud884"', JSON.stringify('___\uD884'));
assertEquals('"___\\ud885"', JSON.stringify('___\uD885'));
assertEquals('"___\\ud886"', JSON.stringify('___\uD886'));
assertEquals('"___\\ud887"', JSON.stringify('___\uD887'));
assertEquals('"___\\ud888"', JSON.stringify('___\uD888'));
assertEquals('"___\\ud889"', JSON.stringify('___\uD889'));
assertEquals('"___\\ud88a"', JSON.stringify('___\uD88A'));
assertEquals('"___\\ud88b"', JSON.stringify('___\uD88B'));
assertEquals('"___\\ud88c"', JSON.stringify('___\uD88C'));
assertEquals('"___\\ud88d"', JSON.stringify('___\uD88D'));
assertEquals('"___\\ud88e"', JSON.stringify('___\uD88E'));
assertEquals('"___\\ud88f"', JSON.stringify('___\uD88F'));
assertEquals('"___\\ud890"', JSON.stringify('___\uD890'));
assertEquals('"___\\ud891"', JSON.stringify('___\uD891'));
assertEquals('"___\\ud892"', JSON.stringify('___\uD892'));
assertEquals('"___\\ud893"', JSON.stringify('___\uD893'));
assertEquals('"___\\ud894"', JSON.stringify('___\uD894'));
assertEquals('"___\\ud895"', JSON.stringify('___\uD895'));
assertEquals('"___\\ud896"', JSON.stringify('___\uD896'));
assertEquals('"___\\ud897"', JSON.stringify('___\uD897'));
assertEquals('"___\\ud898"', JSON.stringify('___\uD898'));
assertEquals('"___\\ud899"', JSON.stringify('___\uD899'));
assertEquals('"___\\ud89a"', JSON.stringify('___\uD89A'));
assertEquals('"___\\ud89b"', JSON.stringify('___\uD89B'));
assertEquals('"___\\ud89c"', JSON.stringify('___\uD89C'));
assertEquals('"___\\ud89d"', JSON.stringify('___\uD89D'));
assertEquals('"___\\ud89e"', JSON.stringify('___\uD89E'));
assertEquals('"___\\ud89f"', JSON.stringify('___\uD89F'));
assertEquals('"___\\ud8a0"', JSON.stringify('___\uD8A0'));
assertEquals('"___\\ud8a1"', JSON.stringify('___\uD8A1'));
assertEquals('"___\\ud8a2"', JSON.stringify('___\uD8A2'));
assertEquals('"___\\ud8a3"', JSON.stringify('___\uD8A3'));
assertEquals('"___\\ud8a4"', JSON.stringify('___\uD8A4'));
assertEquals('"___\\ud8a5"', JSON.stringify('___\uD8A5'));
assertEquals('"___\\ud8a6"', JSON.stringify('___\uD8A6'));
assertEquals('"___\\ud8a7"', JSON.stringify('___\uD8A7'));
assertEquals('"___\\ud8a8"', JSON.stringify('___\uD8A8'));
assertEquals('"___\\ud8a9"', JSON.stringify('___\uD8A9'));
assertEquals('"___\\ud8aa"', JSON.stringify('___\uD8AA'));
assertEquals('"___\\ud8ab"', JSON.stringify('___\uD8AB'));
assertEquals('"___\\ud8ac"', JSON.stringify('___\uD8AC'));
assertEquals('"___\\ud8ad"', JSON.stringify('___\uD8AD'));
assertEquals('"___\\ud8ae"', JSON.stringify('___\uD8AE'));
assertEquals('"___\\ud8af"', JSON.stringify('___\uD8AF'));
assertEquals('"___\\ud8b0"', JSON.stringify('___\uD8B0'));
assertEquals('"___\\ud8b1"', JSON.stringify('___\uD8B1'));
assertEquals('"___\\ud8b2"', JSON.stringify('___\uD8B2'));
assertEquals('"___\\ud8b3"', JSON.stringify('___\uD8B3'));
assertEquals('"___\\ud8b4"', JSON.stringify('___\uD8B4'));
assertEquals('"___\\ud8b5"', JSON.stringify('___\uD8B5'));
assertEquals('"___\\ud8b6"', JSON.stringify('___\uD8B6'));
assertEquals('"___\\ud8b7"', JSON.stringify('___\uD8B7'));
assertEquals('"___\\ud8b8"', JSON.stringify('___\uD8B8'));
assertEquals('"___\\ud8b9"', JSON.stringify('___\uD8B9'));
assertEquals('"___\\ud8ba"', JSON.stringify('___\uD8BA'));
assertEquals('"___\\ud8bb"', JSON.stringify('___\uD8BB'));
assertEquals('"___\\ud8bc"', JSON.stringify('___\uD8BC'));
assertEquals('"___\\ud8bd"', JSON.stringify('___\uD8BD'));
assertEquals('"___\\ud8be"', JSON.stringify('___\uD8BE'));
assertEquals('"___\\ud8bf"', JSON.stringify('___\uD8BF'));
assertEquals('"___\\ud8c0"', JSON.stringify('___\uD8C0'));
assertEquals('"___\\ud8c1"', JSON.stringify('___\uD8C1'));
assertEquals('"___\\ud8c2"', JSON.stringify('___\uD8C2'));
assertEquals('"___\\ud8c3"', JSON.stringify('___\uD8C3'));
assertEquals('"___\\ud8c4"', JSON.stringify('___\uD8C4'));
assertEquals('"___\\ud8c5"', JSON.stringify('___\uD8C5'));
assertEquals('"___\\ud8c6"', JSON.stringify('___\uD8C6'));
assertEquals('"___\\ud8c7"', JSON.stringify('___\uD8C7'));
assertEquals('"___\\ud8c8"', JSON.stringify('___\uD8C8'));
assertEquals('"___\\ud8c9"', JSON.stringify('___\uD8C9'));
assertEquals('"___\\ud8ca"', JSON.stringify('___\uD8CA'));
assertEquals('"___\\ud8cb"', JSON.stringify('___\uD8CB'));
assertEquals('"___\\ud8cc"', JSON.stringify('___\uD8CC'));
assertEquals('"___\\ud8cd"', JSON.stringify('___\uD8CD'));
assertEquals('"___\\ud8ce"', JSON.stringify('___\uD8CE'));
assertEquals('"___\\ud8cf"', JSON.stringify('___\uD8CF'));
assertEquals('"___\\ud8d0"', JSON.stringify('___\uD8D0'));
assertEquals('"___\\ud8d1"', JSON.stringify('___\uD8D1'));
assertEquals('"___\\ud8d2"', JSON.stringify('___\uD8D2'));
assertEquals('"___\\ud8d3"', JSON.stringify('___\uD8D3'));
assertEquals('"___\\ud8d4"', JSON.stringify('___\uD8D4'));
assertEquals('"___\\ud8d5"', JSON.stringify('___\uD8D5'));
assertEquals('"___\\ud8d6"', JSON.stringify('___\uD8D6'));
assertEquals('"___\\ud8d7"', JSON.stringify('___\uD8D7'));
assertEquals('"___\\ud8d8"', JSON.stringify('___\uD8D8'));
assertEquals('"___\\ud8d9"', JSON.stringify('___\uD8D9'));
assertEquals('"___\\ud8da"', JSON.stringify('___\uD8DA'));
assertEquals('"___\\ud8db"', JSON.stringify('___\uD8DB'));
assertEquals('"___\\ud8dc"', JSON.stringify('___\uD8DC'));
assertEquals('"___\\ud8dd"', JSON.stringify('___\uD8DD'));
assertEquals('"___\\ud8de"', JSON.stringify('___\uD8DE'));
assertEquals('"___\\ud8df"', JSON.stringify('___\uD8DF'));
assertEquals('"___\\ud8e0"', JSON.stringify('___\uD8E0'));
assertEquals('"___\\ud8e1"', JSON.stringify('___\uD8E1'));
assertEquals('"___\\ud8e2"', JSON.stringify('___\uD8E2'));
assertEquals('"___\\ud8e3"', JSON.stringify('___\uD8E3'));
assertEquals('"___\\ud8e4"', JSON.stringify('___\uD8E4'));
assertEquals('"___\\ud8e5"', JSON.stringify('___\uD8E5'));
assertEquals('"___\\ud8e6"', JSON.stringify('___\uD8E6'));
assertEquals('"___\\ud8e7"', JSON.stringify('___\uD8E7'));
assertEquals('"___\\ud8e8"', JSON.stringify('___\uD8E8'));
assertEquals('"___\\ud8e9"', JSON.stringify('___\uD8E9'));
assertEquals('"___\\ud8ea"', JSON.stringify('___\uD8EA'));
assertEquals('"___\\ud8eb"', JSON.stringify('___\uD8EB'));
assertEquals('"___\\ud8ec"', JSON.stringify('___\uD8EC'));
assertEquals('"___\\ud8ed"', JSON.stringify('___\uD8ED'));
assertEquals('"___\\ud8ee"', JSON.stringify('___\uD8EE'));
assertEquals('"___\\ud8ef"', JSON.stringify('___\uD8EF'));
assertEquals('"___\\ud8f0"', JSON.stringify('___\uD8F0'));
assertEquals('"___\\ud8f1"', JSON.stringify('___\uD8F1'));
assertEquals('"___\\ud8f2"', JSON.stringify('___\uD8F2'));
assertEquals('"___\\ud8f3"', JSON.stringify('___\uD8F3'));
assertEquals('"___\\ud8f4"', JSON.stringify('___\uD8F4'));
assertEquals('"___\\ud8f5"', JSON.stringify('___\uD8F5'));
assertEquals('"___\\ud8f6"', JSON.stringify('___\uD8F6'));
assertEquals('"___\\ud8f7"', JSON.stringify('___\uD8F7'));
assertEquals('"___\\ud8f8"', JSON.stringify('___\uD8F8'));
assertEquals('"___\\ud8f9"', JSON.stringify('___\uD8F9'));
assertEquals('"___\\ud8fa"', JSON.stringify('___\uD8FA'));
assertEquals('"___\\ud8fb"', JSON.stringify('___\uD8FB'));
assertEquals('"___\\ud8fc"', JSON.stringify('___\uD8FC'));
assertEquals('"___\\ud8fd"', JSON.stringify('___\uD8FD'));
assertEquals('"___\\ud8fe"', JSON.stringify('___\uD8FE'));
assertEquals('"___\\ud8ff"', JSON.stringify('___\uD8FF'));
assertEquals('"___\\ud900"', JSON.stringify('___\uD900'));
assertEquals('"___\\ud901"', JSON.stringify('___\uD901'));
assertEquals('"___\\ud902"', JSON.stringify('___\uD902'));
assertEquals('"___\\ud903"', JSON.stringify('___\uD903'));
assertEquals('"___\\ud904"', JSON.stringify('___\uD904'));
assertEquals('"___\\ud905"', JSON.stringify('___\uD905'));
assertEquals('"___\\ud906"', JSON.stringify('___\uD906'));
assertEquals('"___\\ud907"', JSON.stringify('___\uD907'));
assertEquals('"___\\ud908"', JSON.stringify('___\uD908'));
assertEquals('"___\\ud909"', JSON.stringify('___\uD909'));
assertEquals('"___\\ud90a"', JSON.stringify('___\uD90A'));
assertEquals('"___\\ud90b"', JSON.stringify('___\uD90B'));
assertEquals('"___\\ud90c"', JSON.stringify('___\uD90C'));
assertEquals('"___\\ud90d"', JSON.stringify('___\uD90D'));
assertEquals('"___\\ud90e"', JSON.stringify('___\uD90E'));
assertEquals('"___\\ud90f"', JSON.stringify('___\uD90F'));
assertEquals('"___\\ud910"', JSON.stringify('___\uD910'));
assertEquals('"___\\ud911"', JSON.stringify('___\uD911'));
assertEquals('"___\\ud912"', JSON.stringify('___\uD912'));
assertEquals('"___\\ud913"', JSON.stringify('___\uD913'));
assertEquals('"___\\ud914"', JSON.stringify('___\uD914'));
assertEquals('"___\\ud915"', JSON.stringify('___\uD915'));
assertEquals('"___\\ud916"', JSON.stringify('___\uD916'));
assertEquals('"___\\ud917"', JSON.stringify('___\uD917'));
assertEquals('"___\\ud918"', JSON.stringify('___\uD918'));
assertEquals('"___\\ud919"', JSON.stringify('___\uD919'));
assertEquals('"___\\ud91a"', JSON.stringify('___\uD91A'));
assertEquals('"___\\ud91b"', JSON.stringify('___\uD91B'));
assertEquals('"___\\ud91c"', JSON.stringify('___\uD91C'));
assertEquals('"___\\ud91d"', JSON.stringify('___\uD91D'));
assertEquals('"___\\ud91e"', JSON.stringify('___\uD91E'));
assertEquals('"___\\ud91f"', JSON.stringify('___\uD91F'));
assertEquals('"___\\ud920"', JSON.stringify('___\uD920'));
assertEquals('"___\\ud921"', JSON.stringify('___\uD921'));
assertEquals('"___\\ud922"', JSON.stringify('___\uD922'));
assertEquals('"___\\ud923"', JSON.stringify('___\uD923'));
assertEquals('"___\\ud924"', JSON.stringify('___\uD924'));
assertEquals('"___\\ud925"', JSON.stringify('___\uD925'));
assertEquals('"___\\ud926"', JSON.stringify('___\uD926'));
assertEquals('"___\\ud927"', JSON.stringify('___\uD927'));
assertEquals('"___\\ud928"', JSON.stringify('___\uD928'));
assertEquals('"___\\ud929"', JSON.stringify('___\uD929'));
assertEquals('"___\\ud92a"', JSON.stringify('___\uD92A'));
assertEquals('"___\\ud92b"', JSON.stringify('___\uD92B'));
assertEquals('"___\\ud92c"', JSON.stringify('___\uD92C'));
assertEquals('"___\\ud92d"', JSON.stringify('___\uD92D'));
assertEquals('"___\\ud92e"', JSON.stringify('___\uD92E'));
assertEquals('"___\\ud92f"', JSON.stringify('___\uD92F'));
assertEquals('"___\\ud930"', JSON.stringify('___\uD930'));
assertEquals('"___\\ud931"', JSON.stringify('___\uD931'));
assertEquals('"___\\ud932"', JSON.stringify('___\uD932'));
assertEquals('"___\\ud933"', JSON.stringify('___\uD933'));
assertEquals('"___\\ud934"', JSON.stringify('___\uD934'));
assertEquals('"___\\ud935"', JSON.stringify('___\uD935'));
assertEquals('"___\\ud936"', JSON.stringify('___\uD936'));
assertEquals('"___\\ud937"', JSON.stringify('___\uD937'));
assertEquals('"___\\ud938"', JSON.stringify('___\uD938'));
assertEquals('"___\\ud939"', JSON.stringify('___\uD939'));
assertEquals('"___\\ud93a"', JSON.stringify('___\uD93A'));
assertEquals('"___\\ud93b"', JSON.stringify('___\uD93B'));
assertEquals('"___\\ud93c"', JSON.stringify('___\uD93C'));
assertEquals('"___\\ud93d"', JSON.stringify('___\uD93D'));
assertEquals('"___\\ud93e"', JSON.stringify('___\uD93E'));
assertEquals('"___\\ud93f"', JSON.stringify('___\uD93F'));
assertEquals('"___\\ud940"', JSON.stringify('___\uD940'));
assertEquals('"___\\ud941"', JSON.stringify('___\uD941'));
assertEquals('"___\\ud942"', JSON.stringify('___\uD942'));
assertEquals('"___\\ud943"', JSON.stringify('___\uD943'));
assertEquals('"___\\ud944"', JSON.stringify('___\uD944'));
assertEquals('"___\\ud945"', JSON.stringify('___\uD945'));
assertEquals('"___\\ud946"', JSON.stringify('___\uD946'));
assertEquals('"___\\ud947"', JSON.stringify('___\uD947'));
assertEquals('"___\\ud948"', JSON.stringify('___\uD948'));
assertEquals('"___\\ud949"', JSON.stringify('___\uD949'));
assertEquals('"___\\ud94a"', JSON.stringify('___\uD94A'));
assertEquals('"___\\ud94b"', JSON.stringify('___\uD94B'));
assertEquals('"___\\ud94c"', JSON.stringify('___\uD94C'));
assertEquals('"___\\ud94d"', JSON.stringify('___\uD94D'));
assertEquals('"___\\ud94e"', JSON.stringify('___\uD94E'));
assertEquals('"___\\ud94f"', JSON.stringify('___\uD94F'));
assertEquals('"___\\ud950"', JSON.stringify('___\uD950'));
assertEquals('"___\\ud951"', JSON.stringify('___\uD951'));
assertEquals('"___\\ud952"', JSON.stringify('___\uD952'));
assertEquals('"___\\ud953"', JSON.stringify('___\uD953'));
assertEquals('"___\\ud954"', JSON.stringify('___\uD954'));
assertEquals('"___\\ud955"', JSON.stringify('___\uD955'));
assertEquals('"___\\ud956"', JSON.stringify('___\uD956'));
assertEquals('"___\\ud957"', JSON.stringify('___\uD957'));
assertEquals('"___\\ud958"', JSON.stringify('___\uD958'));
assertEquals('"___\\ud959"', JSON.stringify('___\uD959'));
assertEquals('"___\\ud95a"', JSON.stringify('___\uD95A'));
assertEquals('"___\\ud95b"', JSON.stringify('___\uD95B'));
assertEquals('"___\\ud95c"', JSON.stringify('___\uD95C'));
assertEquals('"___\\ud95d"', JSON.stringify('___\uD95D'));
assertEquals('"___\\ud95e"', JSON.stringify('___\uD95E'));
assertEquals('"___\\ud95f"', JSON.stringify('___\uD95F'));
assertEquals('"___\\ud960"', JSON.stringify('___\uD960'));
assertEquals('"___\\ud961"', JSON.stringify('___\uD961'));
assertEquals('"___\\ud962"', JSON.stringify('___\uD962'));
assertEquals('"___\\ud963"', JSON.stringify('___\uD963'));
assertEquals('"___\\ud964"', JSON.stringify('___\uD964'));
assertEquals('"___\\ud965"', JSON.stringify('___\uD965'));
assertEquals('"___\\ud966"', JSON.stringify('___\uD966'));
assertEquals('"___\\ud967"', JSON.stringify('___\uD967'));
assertEquals('"___\\ud968"', JSON.stringify('___\uD968'));
assertEquals('"___\\ud969"', JSON.stringify('___\uD969'));
assertEquals('"___\\ud96a"', JSON.stringify('___\uD96A'));
assertEquals('"___\\ud96b"', JSON.stringify('___\uD96B'));
assertEquals('"___\\ud96c"', JSON.stringify('___\uD96C'));
assertEquals('"___\\ud96d"', JSON.stringify('___\uD96D'));
assertEquals('"___\\ud96e"', JSON.stringify('___\uD96E'));
assertEquals('"___\\ud96f"', JSON.stringify('___\uD96F'));
assertEquals('"___\\ud970"', JSON.stringify('___\uD970'));
assertEquals('"___\\ud971"', JSON.stringify('___\uD971'));
assertEquals('"___\\ud972"', JSON.stringify('___\uD972'));
assertEquals('"___\\ud973"', JSON.stringify('___\uD973'));
assertEquals('"___\\ud974"', JSON.stringify('___\uD974'));
assertEquals('"___\\ud975"', JSON.stringify('___\uD975'));
assertEquals('"___\\ud976"', JSON.stringify('___\uD976'));
assertEquals('"___\\ud977"', JSON.stringify('___\uD977'));
assertEquals('"___\\ud978"', JSON.stringify('___\uD978'));
assertEquals('"___\\ud979"', JSON.stringify('___\uD979'));
assertEquals('"___\\ud97a"', JSON.stringify('___\uD97A'));
assertEquals('"___\\ud97b"', JSON.stringify('___\uD97B'));
assertEquals('"___\\ud97c"', JSON.stringify('___\uD97C'));
assertEquals('"___\\ud97d"', JSON.stringify('___\uD97D'));
assertEquals('"___\\ud97e"', JSON.stringify('___\uD97E'));
assertEquals('"___\\ud97f"', JSON.stringify('___\uD97F'));
assertEquals('"___\\ud980"', JSON.stringify('___\uD980'));
assertEquals('"___\\ud981"', JSON.stringify('___\uD981'));
assertEquals('"___\\ud982"', JSON.stringify('___\uD982'));
assertEquals('"___\\ud983"', JSON.stringify('___\uD983'));
assertEquals('"___\\ud984"', JSON.stringify('___\uD984'));
assertEquals('"___\\ud985"', JSON.stringify('___\uD985'));
assertEquals('"___\\ud986"', JSON.stringify('___\uD986'));
assertEquals('"___\\ud987"', JSON.stringify('___\uD987'));
assertEquals('"___\\ud988"', JSON.stringify('___\uD988'));
assertEquals('"___\\ud989"', JSON.stringify('___\uD989'));
assertEquals('"___\\ud98a"', JSON.stringify('___\uD98A'));
assertEquals('"___\\ud98b"', JSON.stringify('___\uD98B'));
assertEquals('"___\\ud98c"', JSON.stringify('___\uD98C'));
assertEquals('"___\\ud98d"', JSON.stringify('___\uD98D'));
assertEquals('"___\\ud98e"', JSON.stringify('___\uD98E'));
assertEquals('"___\\ud98f"', JSON.stringify('___\uD98F'));
assertEquals('"___\\ud990"', JSON.stringify('___\uD990'));
assertEquals('"___\\ud991"', JSON.stringify('___\uD991'));
assertEquals('"___\\ud992"', JSON.stringify('___\uD992'));
assertEquals('"___\\ud993"', JSON.stringify('___\uD993'));
assertEquals('"___\\ud994"', JSON.stringify('___\uD994'));
assertEquals('"___\\ud995"', JSON.stringify('___\uD995'));
assertEquals('"___\\ud996"', JSON.stringify('___\uD996'));
assertEquals('"___\\ud997"', JSON.stringify('___\uD997'));
assertEquals('"___\\ud998"', JSON.stringify('___\uD998'));
assertEquals('"___\\ud999"', JSON.stringify('___\uD999'));
assertEquals('"___\\ud99a"', JSON.stringify('___\uD99A'));
assertEquals('"___\\ud99b"', JSON.stringify('___\uD99B'));
assertEquals('"___\\ud99c"', JSON.stringify('___\uD99C'));
assertEquals('"___\\ud99d"', JSON.stringify('___\uD99D'));
assertEquals('"___\\ud99e"', JSON.stringify('___\uD99E'));
assertEquals('"___\\ud99f"', JSON.stringify('___\uD99F'));
assertEquals('"___\\ud9a0"', JSON.stringify('___\uD9A0'));
assertEquals('"___\\ud9a1"', JSON.stringify('___\uD9A1'));
assertEquals('"___\\ud9a2"', JSON.stringify('___\uD9A2'));
assertEquals('"___\\ud9a3"', JSON.stringify('___\uD9A3'));
assertEquals('"___\\ud9a4"', JSON.stringify('___\uD9A4'));
assertEquals('"___\\ud9a5"', JSON.stringify('___\uD9A5'));
assertEquals('"___\\ud9a6"', JSON.stringify('___\uD9A6'));
assertEquals('"___\\ud9a7"', JSON.stringify('___\uD9A7'));
assertEquals('"___\\ud9a8"', JSON.stringify('___\uD9A8'));
assertEquals('"___\\ud9a9"', JSON.stringify('___\uD9A9'));
assertEquals('"___\\ud9aa"', JSON.stringify('___\uD9AA'));
assertEquals('"___\\ud9ab"', JSON.stringify('___\uD9AB'));
assertEquals('"___\\ud9ac"', JSON.stringify('___\uD9AC'));
assertEquals('"___\\ud9ad"', JSON.stringify('___\uD9AD'));
assertEquals('"___\\ud9ae"', JSON.stringify('___\uD9AE'));
assertEquals('"___\\ud9af"', JSON.stringify('___\uD9AF'));
assertEquals('"___\\ud9b0"', JSON.stringify('___\uD9B0'));
assertEquals('"___\\ud9b1"', JSON.stringify('___\uD9B1'));
assertEquals('"___\\ud9b2"', JSON.stringify('___\uD9B2'));
assertEquals('"___\\ud9b3"', JSON.stringify('___\uD9B3'));
assertEquals('"___\\ud9b4"', JSON.stringify('___\uD9B4'));
assertEquals('"___\\ud9b5"', JSON.stringify('___\uD9B5'));
assertEquals('"___\\ud9b6"', JSON.stringify('___\uD9B6'));
assertEquals('"___\\ud9b7"', JSON.stringify('___\uD9B7'));
assertEquals('"___\\ud9b8"', JSON.stringify('___\uD9B8'));
assertEquals('"___\\ud9b9"', JSON.stringify('___\uD9B9'));
assertEquals('"___\\ud9ba"', JSON.stringify('___\uD9BA'));
assertEquals('"___\\ud9bb"', JSON.stringify('___\uD9BB'));
assertEquals('"___\\ud9bc"', JSON.stringify('___\uD9BC'));
assertEquals('"___\\ud9bd"', JSON.stringify('___\uD9BD'));
assertEquals('"___\\ud9be"', JSON.stringify('___\uD9BE'));
assertEquals('"___\\ud9bf"', JSON.stringify('___\uD9BF'));
assertEquals('"___\\ud9c0"', JSON.stringify('___\uD9C0'));
assertEquals('"___\\ud9c1"', JSON.stringify('___\uD9C1'));
assertEquals('"___\\ud9c2"', JSON.stringify('___\uD9C2'));
assertEquals('"___\\ud9c3"', JSON.stringify('___\uD9C3'));
assertEquals('"___\\ud9c4"', JSON.stringify('___\uD9C4'));
assertEquals('"___\\ud9c5"', JSON.stringify('___\uD9C5'));
assertEquals('"___\\ud9c6"', JSON.stringify('___\uD9C6'));
assertEquals('"___\\ud9c7"', JSON.stringify('___\uD9C7'));
assertEquals('"___\\ud9c8"', JSON.stringify('___\uD9C8'));
assertEquals('"___\\ud9c9"', JSON.stringify('___\uD9C9'));
assertEquals('"___\\ud9ca"', JSON.stringify('___\uD9CA'));
assertEquals('"___\\ud9cb"', JSON.stringify('___\uD9CB'));
assertEquals('"___\\ud9cc"', JSON.stringify('___\uD9CC'));
assertEquals('"___\\ud9cd"', JSON.stringify('___\uD9CD'));
assertEquals('"___\\ud9ce"', JSON.stringify('___\uD9CE'));
assertEquals('"___\\ud9cf"', JSON.stringify('___\uD9CF'));
assertEquals('"___\\ud9d0"', JSON.stringify('___\uD9D0'));
assertEquals('"___\\ud9d1"', JSON.stringify('___\uD9D1'));
assertEquals('"___\\ud9d2"', JSON.stringify('___\uD9D2'));
assertEquals('"___\\ud9d3"', JSON.stringify('___\uD9D3'));
assertEquals('"___\\ud9d4"', JSON.stringify('___\uD9D4'));
assertEquals('"___\\ud9d5"', JSON.stringify('___\uD9D5'));
assertEquals('"___\\ud9d6"', JSON.stringify('___\uD9D6'));
assertEquals('"___\\ud9d7"', JSON.stringify('___\uD9D7'));
assertEquals('"___\\ud9d8"', JSON.stringify('___\uD9D8'));
assertEquals('"___\\ud9d9"', JSON.stringify('___\uD9D9'));
assertEquals('"___\\ud9da"', JSON.stringify('___\uD9DA'));
assertEquals('"___\\ud9db"', JSON.stringify('___\uD9DB'));
assertEquals('"___\\ud9dc"', JSON.stringify('___\uD9DC'));
assertEquals('"___\\ud9dd"', JSON.stringify('___\uD9DD'));
assertEquals('"___\\ud9de"', JSON.stringify('___\uD9DE'));
assertEquals('"___\\ud9df"', JSON.stringify('___\uD9DF'));
assertEquals('"___\\ud9e0"', JSON.stringify('___\uD9E0'));
assertEquals('"___\\ud9e1"', JSON.stringify('___\uD9E1'));
assertEquals('"___\\ud9e2"', JSON.stringify('___\uD9E2'));
assertEquals('"___\\ud9e3"', JSON.stringify('___\uD9E3'));
assertEquals('"___\\ud9e4"', JSON.stringify('___\uD9E4'));
assertEquals('"___\\ud9e5"', JSON.stringify('___\uD9E5'));
assertEquals('"___\\ud9e6"', JSON.stringify('___\uD9E6'));
assertEquals('"___\\ud9e7"', JSON.stringify('___\uD9E7'));
assertEquals('"___\\ud9e8"', JSON.stringify('___\uD9E8'));
assertEquals('"___\\ud9e9"', JSON.stringify('___\uD9E9'));
assertEquals('"___\\ud9ea"', JSON.stringify('___\uD9EA'));
assertEquals('"___\\ud9eb"', JSON.stringify('___\uD9EB'));
assertEquals('"___\\ud9ec"', JSON.stringify('___\uD9EC'));
assertEquals('"___\\ud9ed"', JSON.stringify('___\uD9ED'));
assertEquals('"___\\ud9ee"', JSON.stringify('___\uD9EE'));
assertEquals('"___\\ud9ef"', JSON.stringify('___\uD9EF'));
assertEquals('"___\\ud9f0"', JSON.stringify('___\uD9F0'));
assertEquals('"___\\ud9f1"', JSON.stringify('___\uD9F1'));
assertEquals('"___\\ud9f2"', JSON.stringify('___\uD9F2'));
assertEquals('"___\\ud9f3"', JSON.stringify('___\uD9F3'));
assertEquals('"___\\ud9f4"', JSON.stringify('___\uD9F4'));
assertEquals('"___\\ud9f5"', JSON.stringify('___\uD9F5'));
assertEquals('"___\\ud9f6"', JSON.stringify('___\uD9F6'));
assertEquals('"___\\ud9f7"', JSON.stringify('___\uD9F7'));
assertEquals('"___\\ud9f8"', JSON.stringify('___\uD9F8'));
assertEquals('"___\\ud9f9"', JSON.stringify('___\uD9F9'));
assertEquals('"___\\ud9fa"', JSON.stringify('___\uD9FA'));
assertEquals('"___\\ud9fb"', JSON.stringify('___\uD9FB'));
assertEquals('"___\\ud9fc"', JSON.stringify('___\uD9FC'));
assertEquals('"___\\ud9fd"', JSON.stringify('___\uD9FD'));
assertEquals('"___\\ud9fe"', JSON.stringify('___\uD9FE'));
assertEquals('"___\\ud9ff"', JSON.stringify('___\uD9FF'));
assertEquals('"___\\uda00"', JSON.stringify('___\uDA00'));
assertEquals('"___\\uda01"', JSON.stringify('___\uDA01'));
assertEquals('"___\\uda02"', JSON.stringify('___\uDA02'));
assertEquals('"___\\uda03"', JSON.stringify('___\uDA03'));
assertEquals('"___\\uda04"', JSON.stringify('___\uDA04'));
assertEquals('"___\\uda05"', JSON.stringify('___\uDA05'));
assertEquals('"___\\uda06"', JSON.stringify('___\uDA06'));
assertEquals('"___\\uda07"', JSON.stringify('___\uDA07'));
assertEquals('"___\\uda08"', JSON.stringify('___\uDA08'));
assertEquals('"___\\uda09"', JSON.stringify('___\uDA09'));
assertEquals('"___\\uda0a"', JSON.stringify('___\uDA0A'));
assertEquals('"___\\uda0b"', JSON.stringify('___\uDA0B'));
assertEquals('"___\\uda0c"', JSON.stringify('___\uDA0C'));
assertEquals('"___\\uda0d"', JSON.stringify('___\uDA0D'));
assertEquals('"___\\uda0e"', JSON.stringify('___\uDA0E'));
assertEquals('"___\\uda0f"', JSON.stringify('___\uDA0F'));
assertEquals('"___\\uda10"', JSON.stringify('___\uDA10'));
assertEquals('"___\\uda11"', JSON.stringify('___\uDA11'));
assertEquals('"___\\uda12"', JSON.stringify('___\uDA12'));
assertEquals('"___\\uda13"', JSON.stringify('___\uDA13'));
assertEquals('"___\\uda14"', JSON.stringify('___\uDA14'));
assertEquals('"___\\uda15"', JSON.stringify('___\uDA15'));
assertEquals('"___\\uda16"', JSON.stringify('___\uDA16'));
assertEquals('"___\\uda17"', JSON.stringify('___\uDA17'));
assertEquals('"___\\uda18"', JSON.stringify('___\uDA18'));
assertEquals('"___\\uda19"', JSON.stringify('___\uDA19'));
assertEquals('"___\\uda1a"', JSON.stringify('___\uDA1A'));
assertEquals('"___\\uda1b"', JSON.stringify('___\uDA1B'));
assertEquals('"___\\uda1c"', JSON.stringify('___\uDA1C'));
assertEquals('"___\\uda1d"', JSON.stringify('___\uDA1D'));
assertEquals('"___\\uda1e"', JSON.stringify('___\uDA1E'));
assertEquals('"___\\uda1f"', JSON.stringify('___\uDA1F'));
assertEquals('"___\\uda20"', JSON.stringify('___\uDA20'));
assertEquals('"___\\uda21"', JSON.stringify('___\uDA21'));
assertEquals('"___\\uda22"', JSON.stringify('___\uDA22'));
assertEquals('"___\\uda23"', JSON.stringify('___\uDA23'));
assertEquals('"___\\uda24"', JSON.stringify('___\uDA24'));
assertEquals('"___\\uda25"', JSON.stringify('___\uDA25'));
assertEquals('"___\\uda26"', JSON.stringify('___\uDA26'));
assertEquals('"___\\uda27"', JSON.stringify('___\uDA27'));
assertEquals('"___\\uda28"', JSON.stringify('___\uDA28'));
assertEquals('"___\\uda29"', JSON.stringify('___\uDA29'));
assertEquals('"___\\uda2a"', JSON.stringify('___\uDA2A'));
assertEquals('"___\\uda2b"', JSON.stringify('___\uDA2B'));
assertEquals('"___\\uda2c"', JSON.stringify('___\uDA2C'));
assertEquals('"___\\uda2d"', JSON.stringify('___\uDA2D'));
assertEquals('"___\\uda2e"', JSON.stringify('___\uDA2E'));
assertEquals('"___\\uda2f"', JSON.stringify('___\uDA2F'));
assertEquals('"___\\uda30"', JSON.stringify('___\uDA30'));
assertEquals('"___\\uda31"', JSON.stringify('___\uDA31'));
assertEquals('"___\\uda32"', JSON.stringify('___\uDA32'));
assertEquals('"___\\uda33"', JSON.stringify('___\uDA33'));
assertEquals('"___\\uda34"', JSON.stringify('___\uDA34'));
assertEquals('"___\\uda35"', JSON.stringify('___\uDA35'));
assertEquals('"___\\uda36"', JSON.stringify('___\uDA36'));
assertEquals('"___\\uda37"', JSON.stringify('___\uDA37'));
assertEquals('"___\\uda38"', JSON.stringify('___\uDA38'));
assertEquals('"___\\uda39"', JSON.stringify('___\uDA39'));
assertEquals('"___\\uda3a"', JSON.stringify('___\uDA3A'));
assertEquals('"___\\uda3b"', JSON.stringify('___\uDA3B'));
assertEquals('"___\\uda3c"', JSON.stringify('___\uDA3C'));
assertEquals('"___\\uda3d"', JSON.stringify('___\uDA3D'));
assertEquals('"___\\uda3e"', JSON.stringify('___\uDA3E'));
assertEquals('"___\\uda3f"', JSON.stringify('___\uDA3F'));
assertEquals('"___\\uda40"', JSON.stringify('___\uDA40'));
assertEquals('"___\\uda41"', JSON.stringify('___\uDA41'));
assertEquals('"___\\uda42"', JSON.stringify('___\uDA42'));
assertEquals('"___\\uda43"', JSON.stringify('___\uDA43'));
assertEquals('"___\\uda44"', JSON.stringify('___\uDA44'));
assertEquals('"___\\uda45"', JSON.stringify('___\uDA45'));
assertEquals('"___\\uda46"', JSON.stringify('___\uDA46'));
assertEquals('"___\\uda47"', JSON.stringify('___\uDA47'));
assertEquals('"___\\uda48"', JSON.stringify('___\uDA48'));
assertEquals('"___\\uda49"', JSON.stringify('___\uDA49'));
assertEquals('"___\\uda4a"', JSON.stringify('___\uDA4A'));
assertEquals('"___\\uda4b"', JSON.stringify('___\uDA4B'));
assertEquals('"___\\uda4c"', JSON.stringify('___\uDA4C'));
assertEquals('"___\\uda4d"', JSON.stringify('___\uDA4D'));
assertEquals('"___\\uda4e"', JSON.stringify('___\uDA4E'));
assertEquals('"___\\uda4f"', JSON.stringify('___\uDA4F'));
assertEquals('"___\\uda50"', JSON.stringify('___\uDA50'));
assertEquals('"___\\uda51"', JSON.stringify('___\uDA51'));
assertEquals('"___\\uda52"', JSON.stringify('___\uDA52'));
assertEquals('"___\\uda53"', JSON.stringify('___\uDA53'));
assertEquals('"___\\uda54"', JSON.stringify('___\uDA54'));
assertEquals('"___\\uda55"', JSON.stringify('___\uDA55'));
assertEquals('"___\\uda56"', JSON.stringify('___\uDA56'));
assertEquals('"___\\uda57"', JSON.stringify('___\uDA57'));
assertEquals('"___\\uda58"', JSON.stringify('___\uDA58'));
assertEquals('"___\\uda59"', JSON.stringify('___\uDA59'));
assertEquals('"___\\uda5a"', JSON.stringify('___\uDA5A'));
assertEquals('"___\\uda5b"', JSON.stringify('___\uDA5B'));
assertEquals('"___\\uda5c"', JSON.stringify('___\uDA5C'));
assertEquals('"___\\uda5d"', JSON.stringify('___\uDA5D'));
assertEquals('"___\\uda5e"', JSON.stringify('___\uDA5E'));
assertEquals('"___\\uda5f"', JSON.stringify('___\uDA5F'));
assertEquals('"___\\uda60"', JSON.stringify('___\uDA60'));
assertEquals('"___\\uda61"', JSON.stringify('___\uDA61'));
assertEquals('"___\\uda62"', JSON.stringify('___\uDA62'));
assertEquals('"___\\uda63"', JSON.stringify('___\uDA63'));
assertEquals('"___\\uda64"', JSON.stringify('___\uDA64'));
assertEquals('"___\\uda65"', JSON.stringify('___\uDA65'));
assertEquals('"___\\uda66"', JSON.stringify('___\uDA66'));
assertEquals('"___\\uda67"', JSON.stringify('___\uDA67'));
assertEquals('"___\\uda68"', JSON.stringify('___\uDA68'));
assertEquals('"___\\uda69"', JSON.stringify('___\uDA69'));
assertEquals('"___\\uda6a"', JSON.stringify('___\uDA6A'));
assertEquals('"___\\uda6b"', JSON.stringify('___\uDA6B'));
assertEquals('"___\\uda6c"', JSON.stringify('___\uDA6C'));
assertEquals('"___\\uda6d"', JSON.stringify('___\uDA6D'));
assertEquals('"___\\uda6e"', JSON.stringify('___\uDA6E'));
assertEquals('"___\\uda6f"', JSON.stringify('___\uDA6F'));
assertEquals('"___\\uda70"', JSON.stringify('___\uDA70'));
assertEquals('"___\\uda71"', JSON.stringify('___\uDA71'));
assertEquals('"___\\uda72"', JSON.stringify('___\uDA72'));
assertEquals('"___\\uda73"', JSON.stringify('___\uDA73'));
assertEquals('"___\\uda74"', JSON.stringify('___\uDA74'));
assertEquals('"___\\uda75"', JSON.stringify('___\uDA75'));
assertEquals('"___\\uda76"', JSON.stringify('___\uDA76'));
assertEquals('"___\\uda77"', JSON.stringify('___\uDA77'));
assertEquals('"___\\uda78"', JSON.stringify('___\uDA78'));
assertEquals('"___\\uda79"', JSON.stringify('___\uDA79'));
assertEquals('"___\\uda7a"', JSON.stringify('___\uDA7A'));
assertEquals('"___\\uda7b"', JSON.stringify('___\uDA7B'));
assertEquals('"___\\uda7c"', JSON.stringify('___\uDA7C'));
assertEquals('"___\\uda7d"', JSON.stringify('___\uDA7D'));
assertEquals('"___\\uda7e"', JSON.stringify('___\uDA7E'));
assertEquals('"___\\uda7f"', JSON.stringify('___\uDA7F'));
assertEquals('"___\\uda80"', JSON.stringify('___\uDA80'));
assertEquals('"___\\uda81"', JSON.stringify('___\uDA81'));
assertEquals('"___\\uda82"', JSON.stringify('___\uDA82'));
assertEquals('"___\\uda83"', JSON.stringify('___\uDA83'));
assertEquals('"___\\uda84"', JSON.stringify('___\uDA84'));
assertEquals('"___\\uda85"', JSON.stringify('___\uDA85'));
assertEquals('"___\\uda86"', JSON.stringify('___\uDA86'));
assertEquals('"___\\uda87"', JSON.stringify('___\uDA87'));
assertEquals('"___\\uda88"', JSON.stringify('___\uDA88'));
assertEquals('"___\\uda89"', JSON.stringify('___\uDA89'));
assertEquals('"___\\uda8a"', JSON.stringify('___\uDA8A'));
assertEquals('"___\\uda8b"', JSON.stringify('___\uDA8B'));
assertEquals('"___\\uda8c"', JSON.stringify('___\uDA8C'));
assertEquals('"___\\uda8d"', JSON.stringify('___\uDA8D'));
assertEquals('"___\\uda8e"', JSON.stringify('___\uDA8E'));
assertEquals('"___\\uda8f"', JSON.stringify('___\uDA8F'));
assertEquals('"___\\uda90"', JSON.stringify('___\uDA90'));
assertEquals('"___\\uda91"', JSON.stringify('___\uDA91'));
assertEquals('"___\\uda92"', JSON.stringify('___\uDA92'));
assertEquals('"___\\uda93"', JSON.stringify('___\uDA93'));
assertEquals('"___\\uda94"', JSON.stringify('___\uDA94'));
assertEquals('"___\\uda95"', JSON.stringify('___\uDA95'));
assertEquals('"___\\uda96"', JSON.stringify('___\uDA96'));
assertEquals('"___\\uda97"', JSON.stringify('___\uDA97'));
assertEquals('"___\\uda98"', JSON.stringify('___\uDA98'));
assertEquals('"___\\uda99"', JSON.stringify('___\uDA99'));
assertEquals('"___\\uda9a"', JSON.stringify('___\uDA9A'));
assertEquals('"___\\uda9b"', JSON.stringify('___\uDA9B'));
assertEquals('"___\\uda9c"', JSON.stringify('___\uDA9C'));
assertEquals('"___\\uda9d"', JSON.stringify('___\uDA9D'));
assertEquals('"___\\uda9e"', JSON.stringify('___\uDA9E'));
assertEquals('"___\\uda9f"', JSON.stringify('___\uDA9F'));
assertEquals('"___\\udaa0"', JSON.stringify('___\uDAA0'));
assertEquals('"___\\udaa1"', JSON.stringify('___\uDAA1'));
assertEquals('"___\\udaa2"', JSON.stringify('___\uDAA2'));
assertEquals('"___\\udaa3"', JSON.stringify('___\uDAA3'));
assertEquals('"___\\udaa4"', JSON.stringify('___\uDAA4'));
assertEquals('"___\\udaa5"', JSON.stringify('___\uDAA5'));
assertEquals('"___\\udaa6"', JSON.stringify('___\uDAA6'));
assertEquals('"___\\udaa7"', JSON.stringify('___\uDAA7'));
assertEquals('"___\\udaa8"', JSON.stringify('___\uDAA8'));
assertEquals('"___\\udaa9"', JSON.stringify('___\uDAA9'));
assertEquals('"___\\udaaa"', JSON.stringify('___\uDAAA'));
assertEquals('"___\\udaab"', JSON.stringify('___\uDAAB'));
assertEquals('"___\\udaac"', JSON.stringify('___\uDAAC'));
assertEquals('"___\\udaad"', JSON.stringify('___\uDAAD'));
assertEquals('"___\\udaae"', JSON.stringify('___\uDAAE'));
assertEquals('"___\\udaaf"', JSON.stringify('___\uDAAF'));
assertEquals('"___\\udab0"', JSON.stringify('___\uDAB0'));
assertEquals('"___\\udab1"', JSON.stringify('___\uDAB1'));
assertEquals('"___\\udab2"', JSON.stringify('___\uDAB2'));
assertEquals('"___\\udab3"', JSON.stringify('___\uDAB3'));
assertEquals('"___\\udab4"', JSON.stringify('___\uDAB4'));
assertEquals('"___\\udab5"', JSON.stringify('___\uDAB5'));
assertEquals('"___\\udab6"', JSON.stringify('___\uDAB6'));
assertEquals('"___\\udab7"', JSON.stringify('___\uDAB7'));
assertEquals('"___\\udab8"', JSON.stringify('___\uDAB8'));
assertEquals('"___\\udab9"', JSON.stringify('___\uDAB9'));
assertEquals('"___\\udaba"', JSON.stringify('___\uDABA'));
assertEquals('"___\\udabb"', JSON.stringify('___\uDABB'));
assertEquals('"___\\udabc"', JSON.stringify('___\uDABC'));
assertEquals('"___\\udabd"', JSON.stringify('___\uDABD'));
assertEquals('"___\\udabe"', JSON.stringify('___\uDABE'));
assertEquals('"___\\udabf"', JSON.stringify('___\uDABF'));
assertEquals('"___\\udac0"', JSON.stringify('___\uDAC0'));
assertEquals('"___\\udac1"', JSON.stringify('___\uDAC1'));
assertEquals('"___\\udac2"', JSON.stringify('___\uDAC2'));
assertEquals('"___\\udac3"', JSON.stringify('___\uDAC3'));
assertEquals('"___\\udac4"', JSON.stringify('___\uDAC4'));
assertEquals('"___\\udac5"', JSON.stringify('___\uDAC5'));
assertEquals('"___\\udac6"', JSON.stringify('___\uDAC6'));
assertEquals('"___\\udac7"', JSON.stringify('___\uDAC7'));
assertEquals('"___\\udac8"', JSON.stringify('___\uDAC8'));
assertEquals('"___\\udac9"', JSON.stringify('___\uDAC9'));
assertEquals('"___\\udaca"', JSON.stringify('___\uDACA'));
assertEquals('"___\\udacb"', JSON.stringify('___\uDACB'));
assertEquals('"___\\udacc"', JSON.stringify('___\uDACC'));
assertEquals('"___\\udacd"', JSON.stringify('___\uDACD'));
assertEquals('"___\\udace"', JSON.stringify('___\uDACE'));
assertEquals('"___\\udacf"', JSON.stringify('___\uDACF'));
assertEquals('"___\\udad0"', JSON.stringify('___\uDAD0'));
assertEquals('"___\\udad1"', JSON.stringify('___\uDAD1'));
assertEquals('"___\\udad2"', JSON.stringify('___\uDAD2'));
assertEquals('"___\\udad3"', JSON.stringify('___\uDAD3'));
assertEquals('"___\\udad4"', JSON.stringify('___\uDAD4'));
assertEquals('"___\\udad5"', JSON.stringify('___\uDAD5'));
assertEquals('"___\\udad6"', JSON.stringify('___\uDAD6'));
assertEquals('"___\\udad7"', JSON.stringify('___\uDAD7'));
assertEquals('"___\\udad8"', JSON.stringify('___\uDAD8'));
assertEquals('"___\\udad9"', JSON.stringify('___\uDAD9'));
assertEquals('"___\\udada"', JSON.stringify('___\uDADA'));
assertEquals('"___\\udadb"', JSON.stringify('___\uDADB'));
assertEquals('"___\\udadc"', JSON.stringify('___\uDADC'));
assertEquals('"___\\udadd"', JSON.stringify('___\uDADD'));
assertEquals('"___\\udade"', JSON.stringify('___\uDADE'));
assertEquals('"___\\udadf"', JSON.stringify('___\uDADF'));
assertEquals('"___\\udae0"', JSON.stringify('___\uDAE0'));
assertEquals('"___\\udae1"', JSON.stringify('___\uDAE1'));
assertEquals('"___\\udae2"', JSON.stringify('___\uDAE2'));
assertEquals('"___\\udae3"', JSON.stringify('___\uDAE3'));
assertEquals('"___\\udae4"', JSON.stringify('___\uDAE4'));
assertEquals('"___\\udae5"', JSON.stringify('___\uDAE5'));
assertEquals('"___\\udae6"', JSON.stringify('___\uDAE6'));
assertEquals('"___\\udae7"', JSON.stringify('___\uDAE7'));
assertEquals('"___\\udae8"', JSON.stringify('___\uDAE8'));
assertEquals('"___\\udae9"', JSON.stringify('___\uDAE9'));
assertEquals('"___\\udaea"', JSON.stringify('___\uDAEA'));
assertEquals('"___\\udaeb"', JSON.stringify('___\uDAEB'));
assertEquals('"___\\udaec"', JSON.stringify('___\uDAEC'));
assertEquals('"___\\udaed"', JSON.stringify('___\uDAED'));
assertEquals('"___\\udaee"', JSON.stringify('___\uDAEE'));
assertEquals('"___\\udaef"', JSON.stringify('___\uDAEF'));
assertEquals('"___\\udaf0"', JSON.stringify('___\uDAF0'));
assertEquals('"___\\udaf1"', JSON.stringify('___\uDAF1'));
assertEquals('"___\\udaf2"', JSON.stringify('___\uDAF2'));
assertEquals('"___\\udaf3"', JSON.stringify('___\uDAF3'));
assertEquals('"___\\udaf4"', JSON.stringify('___\uDAF4'));
assertEquals('"___\\udaf5"', JSON.stringify('___\uDAF5'));
assertEquals('"___\\udaf6"', JSON.stringify('___\uDAF6'));
assertEquals('"___\\udaf7"', JSON.stringify('___\uDAF7'));
assertEquals('"___\\udaf8"', JSON.stringify('___\uDAF8'));
assertEquals('"___\\udaf9"', JSON.stringify('___\uDAF9'));
assertEquals('"___\\udafa"', JSON.stringify('___\uDAFA'));
assertEquals('"___\\udafb"', JSON.stringify('___\uDAFB'));
assertEquals('"___\\udafc"', JSON.stringify('___\uDAFC'));
assertEquals('"___\\udafd"', JSON.stringify('___\uDAFD'));
assertEquals('"___\\udafe"', JSON.stringify('___\uDAFE'));
assertEquals('"___\\udaff"', JSON.stringify('___\uDAFF'));
assertEquals('"___\\udb00"', JSON.stringify('___\uDB00'));
assertEquals('"___\\udb01"', JSON.stringify('___\uDB01'));
assertEquals('"___\\udb02"', JSON.stringify('___\uDB02'));
assertEquals('"___\\udb03"', JSON.stringify('___\uDB03'));
assertEquals('"___\\udb04"', JSON.stringify('___\uDB04'));
assertEquals('"___\\udb05"', JSON.stringify('___\uDB05'));
assertEquals('"___\\udb06"', JSON.stringify('___\uDB06'));
assertEquals('"___\\udb07"', JSON.stringify('___\uDB07'));
assertEquals('"___\\udb08"', JSON.stringify('___\uDB08'));
assertEquals('"___\\udb09"', JSON.stringify('___\uDB09'));
assertEquals('"___\\udb0a"', JSON.stringify('___\uDB0A'));
assertEquals('"___\\udb0b"', JSON.stringify('___\uDB0B'));
assertEquals('"___\\udb0c"', JSON.stringify('___\uDB0C'));
assertEquals('"___\\udb0d"', JSON.stringify('___\uDB0D'));
assertEquals('"___\\udb0e"', JSON.stringify('___\uDB0E'));
assertEquals('"___\\udb0f"', JSON.stringify('___\uDB0F'));
assertEquals('"___\\udb10"', JSON.stringify('___\uDB10'));
assertEquals('"___\\udb11"', JSON.stringify('___\uDB11'));
assertEquals('"___\\udb12"', JSON.stringify('___\uDB12'));
assertEquals('"___\\udb13"', JSON.stringify('___\uDB13'));
assertEquals('"___\\udb14"', JSON.stringify('___\uDB14'));
assertEquals('"___\\udb15"', JSON.stringify('___\uDB15'));
assertEquals('"___\\udb16"', JSON.stringify('___\uDB16'));
assertEquals('"___\\udb17"', JSON.stringify('___\uDB17'));
assertEquals('"___\\udb18"', JSON.stringify('___\uDB18'));
assertEquals('"___\\udb19"', JSON.stringify('___\uDB19'));
assertEquals('"___\\udb1a"', JSON.stringify('___\uDB1A'));
assertEquals('"___\\udb1b"', JSON.stringify('___\uDB1B'));
assertEquals('"___\\udb1c"', JSON.stringify('___\uDB1C'));
assertEquals('"___\\udb1d"', JSON.stringify('___\uDB1D'));
assertEquals('"___\\udb1e"', JSON.stringify('___\uDB1E'));
assertEquals('"___\\udb1f"', JSON.stringify('___\uDB1F'));
assertEquals('"___\\udb20"', JSON.stringify('___\uDB20'));
assertEquals('"___\\udb21"', JSON.stringify('___\uDB21'));
assertEquals('"___\\udb22"', JSON.stringify('___\uDB22'));
assertEquals('"___\\udb23"', JSON.stringify('___\uDB23'));
assertEquals('"___\\udb24"', JSON.stringify('___\uDB24'));
assertEquals('"___\\udb25"', JSON.stringify('___\uDB25'));
assertEquals('"___\\udb26"', JSON.stringify('___\uDB26'));
assertEquals('"___\\udb27"', JSON.stringify('___\uDB27'));
assertEquals('"___\\udb28"', JSON.stringify('___\uDB28'));
assertEquals('"___\\udb29"', JSON.stringify('___\uDB29'));
assertEquals('"___\\udb2a"', JSON.stringify('___\uDB2A'));
assertEquals('"___\\udb2b"', JSON.stringify('___\uDB2B'));
assertEquals('"___\\udb2c"', JSON.stringify('___\uDB2C'));
assertEquals('"___\\udb2d"', JSON.stringify('___\uDB2D'));
assertEquals('"___\\udb2e"', JSON.stringify('___\uDB2E'));
assertEquals('"___\\udb2f"', JSON.stringify('___\uDB2F'));
assertEquals('"___\\udb30"', JSON.stringify('___\uDB30'));
assertEquals('"___\\udb31"', JSON.stringify('___\uDB31'));
assertEquals('"___\\udb32"', JSON.stringify('___\uDB32'));
assertEquals('"___\\udb33"', JSON.stringify('___\uDB33'));
assertEquals('"___\\udb34"', JSON.stringify('___\uDB34'));
assertEquals('"___\\udb35"', JSON.stringify('___\uDB35'));
assertEquals('"___\\udb36"', JSON.stringify('___\uDB36'));
assertEquals('"___\\udb37"', JSON.stringify('___\uDB37'));
assertEquals('"___\\udb38"', JSON.stringify('___\uDB38'));
assertEquals('"___\\udb39"', JSON.stringify('___\uDB39'));
assertEquals('"___\\udb3a"', JSON.stringify('___\uDB3A'));
assertEquals('"___\\udb3b"', JSON.stringify('___\uDB3B'));
assertEquals('"___\\udb3c"', JSON.stringify('___\uDB3C'));
assertEquals('"___\\udb3d"', JSON.stringify('___\uDB3D'));
assertEquals('"___\\udb3e"', JSON.stringify('___\uDB3E'));
assertEquals('"___\\udb3f"', JSON.stringify('___\uDB3F'));
assertEquals('"___\\udb40"', JSON.stringify('___\uDB40'));
assertEquals('"___\\udb41"', JSON.stringify('___\uDB41'));
assertEquals('"___\\udb42"', JSON.stringify('___\uDB42'));
assertEquals('"___\\udb43"', JSON.stringify('___\uDB43'));
assertEquals('"___\\udb44"', JSON.stringify('___\uDB44'));
assertEquals('"___\\udb45"', JSON.stringify('___\uDB45'));
assertEquals('"___\\udb46"', JSON.stringify('___\uDB46'));
assertEquals('"___\\udb47"', JSON.stringify('___\uDB47'));
assertEquals('"___\\udb48"', JSON.stringify('___\uDB48'));
assertEquals('"___\\udb49"', JSON.stringify('___\uDB49'));
assertEquals('"___\\udb4a"', JSON.stringify('___\uDB4A'));
assertEquals('"___\\udb4b"', JSON.stringify('___\uDB4B'));
assertEquals('"___\\udb4c"', JSON.stringify('___\uDB4C'));
assertEquals('"___\\udb4d"', JSON.stringify('___\uDB4D'));
assertEquals('"___\\udb4e"', JSON.stringify('___\uDB4E'));
assertEquals('"___\\udb4f"', JSON.stringify('___\uDB4F'));
assertEquals('"___\\udb50"', JSON.stringify('___\uDB50'));
assertEquals('"___\\udb51"', JSON.stringify('___\uDB51'));
assertEquals('"___\\udb52"', JSON.stringify('___\uDB52'));
assertEquals('"___\\udb53"', JSON.stringify('___\uDB53'));
assertEquals('"___\\udb54"', JSON.stringify('___\uDB54'));
assertEquals('"___\\udb55"', JSON.stringify('___\uDB55'));
assertEquals('"___\\udb56"', JSON.stringify('___\uDB56'));
assertEquals('"___\\udb57"', JSON.stringify('___\uDB57'));
assertEquals('"___\\udb58"', JSON.stringify('___\uDB58'));
assertEquals('"___\\udb59"', JSON.stringify('___\uDB59'));
assertEquals('"___\\udb5a"', JSON.stringify('___\uDB5A'));
assertEquals('"___\\udb5b"', JSON.stringify('___\uDB5B'));
assertEquals('"___\\udb5c"', JSON.stringify('___\uDB5C'));
assertEquals('"___\\udb5d"', JSON.stringify('___\uDB5D'));
assertEquals('"___\\udb5e"', JSON.stringify('___\uDB5E'));
assertEquals('"___\\udb5f"', JSON.stringify('___\uDB5F'));
assertEquals('"___\\udb60"', JSON.stringify('___\uDB60'));
assertEquals('"___\\udb61"', JSON.stringify('___\uDB61'));
assertEquals('"___\\udb62"', JSON.stringify('___\uDB62'));
assertEquals('"___\\udb63"', JSON.stringify('___\uDB63'));
assertEquals('"___\\udb64"', JSON.stringify('___\uDB64'));
assertEquals('"___\\udb65"', JSON.stringify('___\uDB65'));
assertEquals('"___\\udb66"', JSON.stringify('___\uDB66'));
assertEquals('"___\\udb67"', JSON.stringify('___\uDB67'));
assertEquals('"___\\udb68"', JSON.stringify('___\uDB68'));
assertEquals('"___\\udb69"', JSON.stringify('___\uDB69'));
assertEquals('"___\\udb6a"', JSON.stringify('___\uDB6A'));
assertEquals('"___\\udb6b"', JSON.stringify('___\uDB6B'));
assertEquals('"___\\udb6c"', JSON.stringify('___\uDB6C'));
assertEquals('"___\\udb6d"', JSON.stringify('___\uDB6D'));
assertEquals('"___\\udb6e"', JSON.stringify('___\uDB6E'));
assertEquals('"___\\udb6f"', JSON.stringify('___\uDB6F'));
assertEquals('"___\\udb70"', JSON.stringify('___\uDB70'));
assertEquals('"___\\udb71"', JSON.stringify('___\uDB71'));
assertEquals('"___\\udb72"', JSON.stringify('___\uDB72'));
assertEquals('"___\\udb73"', JSON.stringify('___\uDB73'));
assertEquals('"___\\udb74"', JSON.stringify('___\uDB74'));
assertEquals('"___\\udb75"', JSON.stringify('___\uDB75'));
assertEquals('"___\\udb76"', JSON.stringify('___\uDB76'));
assertEquals('"___\\udb77"', JSON.stringify('___\uDB77'));
assertEquals('"___\\udb78"', JSON.stringify('___\uDB78'));
assertEquals('"___\\udb79"', JSON.stringify('___\uDB79'));
assertEquals('"___\\udb7a"', JSON.stringify('___\uDB7A'));
assertEquals('"___\\udb7b"', JSON.stringify('___\uDB7B'));
assertEquals('"___\\udb7c"', JSON.stringify('___\uDB7C'));
assertEquals('"___\\udb7d"', JSON.stringify('___\uDB7D'));
assertEquals('"___\\udb7e"', JSON.stringify('___\uDB7E'));
assertEquals('"___\\udb7f"', JSON.stringify('___\uDB7F'));
assertEquals('"___\\udb80"', JSON.stringify('___\uDB80'));
assertEquals('"___\\udb81"', JSON.stringify('___\uDB81'));
assertEquals('"___\\udb82"', JSON.stringify('___\uDB82'));
assertEquals('"___\\udb83"', JSON.stringify('___\uDB83'));
assertEquals('"___\\udb84"', JSON.stringify('___\uDB84'));
assertEquals('"___\\udb85"', JSON.stringify('___\uDB85'));
assertEquals('"___\\udb86"', JSON.stringify('___\uDB86'));
assertEquals('"___\\udb87"', JSON.stringify('___\uDB87'));
assertEquals('"___\\udb88"', JSON.stringify('___\uDB88'));
assertEquals('"___\\udb89"', JSON.stringify('___\uDB89'));
assertEquals('"___\\udb8a"', JSON.stringify('___\uDB8A'));
assertEquals('"___\\udb8b"', JSON.stringify('___\uDB8B'));
assertEquals('"___\\udb8c"', JSON.stringify('___\uDB8C'));
assertEquals('"___\\udb8d"', JSON.stringify('___\uDB8D'));
assertEquals('"___\\udb8e"', JSON.stringify('___\uDB8E'));
assertEquals('"___\\udb8f"', JSON.stringify('___\uDB8F'));
assertEquals('"___\\udb90"', JSON.stringify('___\uDB90'));
assertEquals('"___\\udb91"', JSON.stringify('___\uDB91'));
assertEquals('"___\\udb92"', JSON.stringify('___\uDB92'));
assertEquals('"___\\udb93"', JSON.stringify('___\uDB93'));
assertEquals('"___\\udb94"', JSON.stringify('___\uDB94'));
assertEquals('"___\\udb95"', JSON.stringify('___\uDB95'));
assertEquals('"___\\udb96"', JSON.stringify('___\uDB96'));
assertEquals('"___\\udb97"', JSON.stringify('___\uDB97'));
assertEquals('"___\\udb98"', JSON.stringify('___\uDB98'));
assertEquals('"___\\udb99"', JSON.stringify('___\uDB99'));
assertEquals('"___\\udb9a"', JSON.stringify('___\uDB9A'));
assertEquals('"___\\udb9b"', JSON.stringify('___\uDB9B'));
assertEquals('"___\\udb9c"', JSON.stringify('___\uDB9C'));
assertEquals('"___\\udb9d"', JSON.stringify('___\uDB9D'));
assertEquals('"___\\udb9e"', JSON.stringify('___\uDB9E'));
assertEquals('"___\\udb9f"', JSON.stringify('___\uDB9F'));
assertEquals('"___\\udba0"', JSON.stringify('___\uDBA0'));
assertEquals('"___\\udba1"', JSON.stringify('___\uDBA1'));
assertEquals('"___\\udba2"', JSON.stringify('___\uDBA2'));
assertEquals('"___\\udba3"', JSON.stringify('___\uDBA3'));
assertEquals('"___\\udba4"', JSON.stringify('___\uDBA4'));
assertEquals('"___\\udba5"', JSON.stringify('___\uDBA5'));
assertEquals('"___\\udba6"', JSON.stringify('___\uDBA6'));
assertEquals('"___\\udba7"', JSON.stringify('___\uDBA7'));
assertEquals('"___\\udba8"', JSON.stringify('___\uDBA8'));
assertEquals('"___\\udba9"', JSON.stringify('___\uDBA9'));
assertEquals('"___\\udbaa"', JSON.stringify('___\uDBAA'));
assertEquals('"___\\udbab"', JSON.stringify('___\uDBAB'));
assertEquals('"___\\udbac"', JSON.stringify('___\uDBAC'));
assertEquals('"___\\udbad"', JSON.stringify('___\uDBAD'));
assertEquals('"___\\udbae"', JSON.stringify('___\uDBAE'));
assertEquals('"___\\udbaf"', JSON.stringify('___\uDBAF'));
assertEquals('"___\\udbb0"', JSON.stringify('___\uDBB0'));
assertEquals('"___\\udbb1"', JSON.stringify('___\uDBB1'));
assertEquals('"___\\udbb2"', JSON.stringify('___\uDBB2'));
assertEquals('"___\\udbb3"', JSON.stringify('___\uDBB3'));
assertEquals('"___\\udbb4"', JSON.stringify('___\uDBB4'));
assertEquals('"___\\udbb5"', JSON.stringify('___\uDBB5'));
assertEquals('"___\\udbb6"', JSON.stringify('___\uDBB6'));
assertEquals('"___\\udbb7"', JSON.stringify('___\uDBB7'));
assertEquals('"___\\udbb8"', JSON.stringify('___\uDBB8'));
assertEquals('"___\\udbb9"', JSON.stringify('___\uDBB9'));
assertEquals('"___\\udbba"', JSON.stringify('___\uDBBA'));
assertEquals('"___\\udbbb"', JSON.stringify('___\uDBBB'));
assertEquals('"___\\udbbc"', JSON.stringify('___\uDBBC'));
assertEquals('"___\\udbbd"', JSON.stringify('___\uDBBD'));
assertEquals('"___\\udbbe"', JSON.stringify('___\uDBBE'));
assertEquals('"___\\udbbf"', JSON.stringify('___\uDBBF'));
assertEquals('"___\\udbc0"', JSON.stringify('___\uDBC0'));
assertEquals('"___\\udbc1"', JSON.stringify('___\uDBC1'));
assertEquals('"___\\udbc2"', JSON.stringify('___\uDBC2'));
assertEquals('"___\\udbc3"', JSON.stringify('___\uDBC3'));
assertEquals('"___\\udbc4"', JSON.stringify('___\uDBC4'));
assertEquals('"___\\udbc5"', JSON.stringify('___\uDBC5'));
assertEquals('"___\\udbc6"', JSON.stringify('___\uDBC6'));
assertEquals('"___\\udbc7"', JSON.stringify('___\uDBC7'));
assertEquals('"___\\udbc8"', JSON.stringify('___\uDBC8'));
assertEquals('"___\\udbc9"', JSON.stringify('___\uDBC9'));
assertEquals('"___\\udbca"', JSON.stringify('___\uDBCA'));
assertEquals('"___\\udbcb"', JSON.stringify('___\uDBCB'));
assertEquals('"___\\udbcc"', JSON.stringify('___\uDBCC'));
assertEquals('"___\\udbcd"', JSON.stringify('___\uDBCD'));
assertEquals('"___\\udbce"', JSON.stringify('___\uDBCE'));
assertEquals('"___\\udbcf"', JSON.stringify('___\uDBCF'));
assertEquals('"___\\udbd0"', JSON.stringify('___\uDBD0'));
assertEquals('"___\\udbd1"', JSON.stringify('___\uDBD1'));
assertEquals('"___\\udbd2"', JSON.stringify('___\uDBD2'));
assertEquals('"___\\udbd3"', JSON.stringify('___\uDBD3'));
assertEquals('"___\\udbd4"', JSON.stringify('___\uDBD4'));
assertEquals('"___\\udbd5"', JSON.stringify('___\uDBD5'));
assertEquals('"___\\udbd6"', JSON.stringify('___\uDBD6'));
assertEquals('"___\\udbd7"', JSON.stringify('___\uDBD7'));
assertEquals('"___\\udbd8"', JSON.stringify('___\uDBD8'));
assertEquals('"___\\udbd9"', JSON.stringify('___\uDBD9'));
assertEquals('"___\\udbda"', JSON.stringify('___\uDBDA'));
assertEquals('"___\\udbdb"', JSON.stringify('___\uDBDB'));
assertEquals('"___\\udbdc"', JSON.stringify('___\uDBDC'));
assertEquals('"___\\udbdd"', JSON.stringify('___\uDBDD'));
assertEquals('"___\\udbde"', JSON.stringify('___\uDBDE'));
assertEquals('"___\\udbdf"', JSON.stringify('___\uDBDF'));
assertEquals('"___\\udbe0"', JSON.stringify('___\uDBE0'));
assertEquals('"___\\udbe1"', JSON.stringify('___\uDBE1'));
assertEquals('"___\\udbe2"', JSON.stringify('___\uDBE2'));
assertEquals('"___\\udbe3"', JSON.stringify('___\uDBE3'));
assertEquals('"___\\udbe4"', JSON.stringify('___\uDBE4'));
assertEquals('"___\\udbe5"', JSON.stringify('___\uDBE5'));
assertEquals('"___\\udbe6"', JSON.stringify('___\uDBE6'));
assertEquals('"___\\udbe7"', JSON.stringify('___\uDBE7'));
assertEquals('"___\\udbe8"', JSON.stringify('___\uDBE8'));
assertEquals('"___\\udbe9"', JSON.stringify('___\uDBE9'));
assertEquals('"___\\udbea"', JSON.stringify('___\uDBEA'));
assertEquals('"___\\udbeb"', JSON.stringify('___\uDBEB'));
assertEquals('"___\\udbec"', JSON.stringify('___\uDBEC'));
assertEquals('"___\\udbed"', JSON.stringify('___\uDBED'));
assertEquals('"___\\udbee"', JSON.stringify('___\uDBEE'));
assertEquals('"___\\udbef"', JSON.stringify('___\uDBEF'));
assertEquals('"___\\udbf0"', JSON.stringify('___\uDBF0'));
assertEquals('"___\\udbf1"', JSON.stringify('___\uDBF1'));
assertEquals('"___\\udbf2"', JSON.stringify('___\uDBF2'));
assertEquals('"___\\udbf3"', JSON.stringify('___\uDBF3'));
assertEquals('"___\\udbf4"', JSON.stringify('___\uDBF4'));
assertEquals('"___\\udbf5"', JSON.stringify('___\uDBF5'));
assertEquals('"___\\udbf6"', JSON.stringify('___\uDBF6'));
assertEquals('"___\\udbf7"', JSON.stringify('___\uDBF7'));
assertEquals('"___\\udbf8"', JSON.stringify('___\uDBF8'));
assertEquals('"___\\udbf9"', JSON.stringify('___\uDBF9'));
assertEquals('"___\\udbfa"', JSON.stringify('___\uDBFA'));
assertEquals('"___\\udbfb"', JSON.stringify('___\uDBFB'));
assertEquals('"___\\udbfc"', JSON.stringify('___\uDBFC'));
assertEquals('"___\\udbfd"', JSON.stringify('___\uDBFD'));
assertEquals('"___\\udbfe"', JSON.stringify('___\uDBFE'));
assertEquals('"___\\udbff"', JSON.stringify('___\uDBFF'));
assertEquals('"___\\udc00"', JSON.stringify('___\uDC00'));
assertEquals('"___\\udc01"', JSON.stringify('___\uDC01'));
assertEquals('"___\\udc02"', JSON.stringify('___\uDC02'));
assertEquals('"___\\udc03"', JSON.stringify('___\uDC03'));
assertEquals('"___\\udc04"', JSON.stringify('___\uDC04'));
assertEquals('"___\\udc05"', JSON.stringify('___\uDC05'));
assertEquals('"___\\udc06"', JSON.stringify('___\uDC06'));
assertEquals('"___\\udc07"', JSON.stringify('___\uDC07'));
assertEquals('"___\\udc08"', JSON.stringify('___\uDC08'));
assertEquals('"___\\udc09"', JSON.stringify('___\uDC09'));
assertEquals('"___\\udc0a"', JSON.stringify('___\uDC0A'));
assertEquals('"___\\udc0b"', JSON.stringify('___\uDC0B'));
assertEquals('"___\\udc0c"', JSON.stringify('___\uDC0C'));
assertEquals('"___\\udc0d"', JSON.stringify('___\uDC0D'));
assertEquals('"___\\udc0e"', JSON.stringify('___\uDC0E'));
assertEquals('"___\\udc0f"', JSON.stringify('___\uDC0F'));
assertEquals('"___\\udc10"', JSON.stringify('___\uDC10'));
assertEquals('"___\\udc11"', JSON.stringify('___\uDC11'));
assertEquals('"___\\udc12"', JSON.stringify('___\uDC12'));
assertEquals('"___\\udc13"', JSON.stringify('___\uDC13'));
assertEquals('"___\\udc14"', JSON.stringify('___\uDC14'));
assertEquals('"___\\udc15"', JSON.stringify('___\uDC15'));
assertEquals('"___\\udc16"', JSON.stringify('___\uDC16'));
assertEquals('"___\\udc17"', JSON.stringify('___\uDC17'));
assertEquals('"___\\udc18"', JSON.stringify('___\uDC18'));
assertEquals('"___\\udc19"', JSON.stringify('___\uDC19'));
assertEquals('"___\\udc1a"', JSON.stringify('___\uDC1A'));
assertEquals('"___\\udc1b"', JSON.stringify('___\uDC1B'));
assertEquals('"___\\udc1c"', JSON.stringify('___\uDC1C'));
assertEquals('"___\\udc1d"', JSON.stringify('___\uDC1D'));
assertEquals('"___\\udc1e"', JSON.stringify('___\uDC1E'));
assertEquals('"___\\udc1f"', JSON.stringify('___\uDC1F'));
assertEquals('"___\\udc20"', JSON.stringify('___\uDC20'));
assertEquals('"___\\udc21"', JSON.stringify('___\uDC21'));
assertEquals('"___\\udc22"', JSON.stringify('___\uDC22'));
assertEquals('"___\\udc23"', JSON.stringify('___\uDC23'));
assertEquals('"___\\udc24"', JSON.stringify('___\uDC24'));
assertEquals('"___\\udc25"', JSON.stringify('___\uDC25'));
assertEquals('"___\\udc26"', JSON.stringify('___\uDC26'));
assertEquals('"___\\udc27"', JSON.stringify('___\uDC27'));
assertEquals('"___\\udc28"', JSON.stringify('___\uDC28'));
assertEquals('"___\\udc29"', JSON.stringify('___\uDC29'));
assertEquals('"___\\udc2a"', JSON.stringify('___\uDC2A'));
assertEquals('"___\\udc2b"', JSON.stringify('___\uDC2B'));
assertEquals('"___\\udc2c"', JSON.stringify('___\uDC2C'));
assertEquals('"___\\udc2d"', JSON.stringify('___\uDC2D'));
assertEquals('"___\\udc2e"', JSON.stringify('___\uDC2E'));
assertEquals('"___\\udc2f"', JSON.stringify('___\uDC2F'));
assertEquals('"___\\udc30"', JSON.stringify('___\uDC30'));
assertEquals('"___\\udc31"', JSON.stringify('___\uDC31'));
assertEquals('"___\\udc32"', JSON.stringify('___\uDC32'));
assertEquals('"___\\udc33"', JSON.stringify('___\uDC33'));
assertEquals('"___\\udc34"', JSON.stringify('___\uDC34'));
assertEquals('"___\\udc35"', JSON.stringify('___\uDC35'));
assertEquals('"___\\udc36"', JSON.stringify('___\uDC36'));
assertEquals('"___\\udc37"', JSON.stringify('___\uDC37'));
assertEquals('"___\\udc38"', JSON.stringify('___\uDC38'));
assertEquals('"___\\udc39"', JSON.stringify('___\uDC39'));
assertEquals('"___\\udc3a"', JSON.stringify('___\uDC3A'));
assertEquals('"___\\udc3b"', JSON.stringify('___\uDC3B'));
assertEquals('"___\\udc3c"', JSON.stringify('___\uDC3C'));
assertEquals('"___\\udc3d"', JSON.stringify('___\uDC3D'));
assertEquals('"___\\udc3e"', JSON.stringify('___\uDC3E'));
assertEquals('"___\\udc3f"', JSON.stringify('___\uDC3F'));
assertEquals('"___\\udc40"', JSON.stringify('___\uDC40'));
assertEquals('"___\\udc41"', JSON.stringify('___\uDC41'));
assertEquals('"___\\udc42"', JSON.stringify('___\uDC42'));
assertEquals('"___\\udc43"', JSON.stringify('___\uDC43'));
assertEquals('"___\\udc44"', JSON.stringify('___\uDC44'));
assertEquals('"___\\udc45"', JSON.stringify('___\uDC45'));
assertEquals('"___\\udc46"', JSON.stringify('___\uDC46'));
assertEquals('"___\\udc47"', JSON.stringify('___\uDC47'));
assertEquals('"___\\udc48"', JSON.stringify('___\uDC48'));
assertEquals('"___\\udc49"', JSON.stringify('___\uDC49'));
assertEquals('"___\\udc4a"', JSON.stringify('___\uDC4A'));
assertEquals('"___\\udc4b"', JSON.stringify('___\uDC4B'));
assertEquals('"___\\udc4c"', JSON.stringify('___\uDC4C'));
assertEquals('"___\\udc4d"', JSON.stringify('___\uDC4D'));
assertEquals('"___\\udc4e"', JSON.stringify('___\uDC4E'));
assertEquals('"___\\udc4f"', JSON.stringify('___\uDC4F'));
assertEquals('"___\\udc50"', JSON.stringify('___\uDC50'));
assertEquals('"___\\udc51"', JSON.stringify('___\uDC51'));
assertEquals('"___\\udc52"', JSON.stringify('___\uDC52'));
assertEquals('"___\\udc53"', JSON.stringify('___\uDC53'));
assertEquals('"___\\udc54"', JSON.stringify('___\uDC54'));
assertEquals('"___\\udc55"', JSON.stringify('___\uDC55'));
assertEquals('"___\\udc56"', JSON.stringify('___\uDC56'));
assertEquals('"___\\udc57"', JSON.stringify('___\uDC57'));
assertEquals('"___\\udc58"', JSON.stringify('___\uDC58'));
assertEquals('"___\\udc59"', JSON.stringify('___\uDC59'));
assertEquals('"___\\udc5a"', JSON.stringify('___\uDC5A'));
assertEquals('"___\\udc5b"', JSON.stringify('___\uDC5B'));
assertEquals('"___\\udc5c"', JSON.stringify('___\uDC5C'));
assertEquals('"___\\udc5d"', JSON.stringify('___\uDC5D'));
assertEquals('"___\\udc5e"', JSON.stringify('___\uDC5E'));
assertEquals('"___\\udc5f"', JSON.stringify('___\uDC5F'));
assertEquals('"___\\udc60"', JSON.stringify('___\uDC60'));
assertEquals('"___\\udc61"', JSON.stringify('___\uDC61'));
assertEquals('"___\\udc62"', JSON.stringify('___\uDC62'));
assertEquals('"___\\udc63"', JSON.stringify('___\uDC63'));
assertEquals('"___\\udc64"', JSON.stringify('___\uDC64'));
assertEquals('"___\\udc65"', JSON.stringify('___\uDC65'));
assertEquals('"___\\udc66"', JSON.stringify('___\uDC66'));
assertEquals('"___\\udc67"', JSON.stringify('___\uDC67'));
assertEquals('"___\\udc68"', JSON.stringify('___\uDC68'));
assertEquals('"___\\udc69"', JSON.stringify('___\uDC69'));
assertEquals('"___\\udc6a"', JSON.stringify('___\uDC6A'));
assertEquals('"___\\udc6b"', JSON.stringify('___\uDC6B'));
assertEquals('"___\\udc6c"', JSON.stringify('___\uDC6C'));
assertEquals('"___\\udc6d"', JSON.stringify('___\uDC6D'));
assertEquals('"___\\udc6e"', JSON.stringify('___\uDC6E'));
assertEquals('"___\\udc6f"', JSON.stringify('___\uDC6F'));
assertEquals('"___\\udc70"', JSON.stringify('___\uDC70'));
assertEquals('"___\\udc71"', JSON.stringify('___\uDC71'));
assertEquals('"___\\udc72"', JSON.stringify('___\uDC72'));
assertEquals('"___\\udc73"', JSON.stringify('___\uDC73'));
assertEquals('"___\\udc74"', JSON.stringify('___\uDC74'));
assertEquals('"___\\udc75"', JSON.stringify('___\uDC75'));
assertEquals('"___\\udc76"', JSON.stringify('___\uDC76'));
assertEquals('"___\\udc77"', JSON.stringify('___\uDC77'));
assertEquals('"___\\udc78"', JSON.stringify('___\uDC78'));
assertEquals('"___\\udc79"', JSON.stringify('___\uDC79'));
assertEquals('"___\\udc7a"', JSON.stringify('___\uDC7A'));
assertEquals('"___\\udc7b"', JSON.stringify('___\uDC7B'));
assertEquals('"___\\udc7c"', JSON.stringify('___\uDC7C'));
assertEquals('"___\\udc7d"', JSON.stringify('___\uDC7D'));
assertEquals('"___\\udc7e"', JSON.stringify('___\uDC7E'));
assertEquals('"___\\udc7f"', JSON.stringify('___\uDC7F'));
assertEquals('"___\\udc80"', JSON.stringify('___\uDC80'));
assertEquals('"___\\udc81"', JSON.stringify('___\uDC81'));
assertEquals('"___\\udc82"', JSON.stringify('___\uDC82'));
assertEquals('"___\\udc83"', JSON.stringify('___\uDC83'));
assertEquals('"___\\udc84"', JSON.stringify('___\uDC84'));
assertEquals('"___\\udc85"', JSON.stringify('___\uDC85'));
assertEquals('"___\\udc86"', JSON.stringify('___\uDC86'));
assertEquals('"___\\udc87"', JSON.stringify('___\uDC87'));
assertEquals('"___\\udc88"', JSON.stringify('___\uDC88'));
assertEquals('"___\\udc89"', JSON.stringify('___\uDC89'));
assertEquals('"___\\udc8a"', JSON.stringify('___\uDC8A'));
assertEquals('"___\\udc8b"', JSON.stringify('___\uDC8B'));
assertEquals('"___\\udc8c"', JSON.stringify('___\uDC8C'));
assertEquals('"___\\udc8d"', JSON.stringify('___\uDC8D'));
assertEquals('"___\\udc8e"', JSON.stringify('___\uDC8E'));
assertEquals('"___\\udc8f"', JSON.stringify('___\uDC8F'));
assertEquals('"___\\udc90"', JSON.stringify('___\uDC90'));
assertEquals('"___\\udc91"', JSON.stringify('___\uDC91'));
assertEquals('"___\\udc92"', JSON.stringify('___\uDC92'));
assertEquals('"___\\udc93"', JSON.stringify('___\uDC93'));
assertEquals('"___\\udc94"', JSON.stringify('___\uDC94'));
assertEquals('"___\\udc95"', JSON.stringify('___\uDC95'));
assertEquals('"___\\udc96"', JSON.stringify('___\uDC96'));
assertEquals('"___\\udc97"', JSON.stringify('___\uDC97'));
assertEquals('"___\\udc98"', JSON.stringify('___\uDC98'));
assertEquals('"___\\udc99"', JSON.stringify('___\uDC99'));
assertEquals('"___\\udc9a"', JSON.stringify('___\uDC9A'));
assertEquals('"___\\udc9b"', JSON.stringify('___\uDC9B'));
assertEquals('"___\\udc9c"', JSON.stringify('___\uDC9C'));
assertEquals('"___\\udc9d"', JSON.stringify('___\uDC9D'));
assertEquals('"___\\udc9e"', JSON.stringify('___\uDC9E'));
assertEquals('"___\\udc9f"', JSON.stringify('___\uDC9F'));
assertEquals('"___\\udca0"', JSON.stringify('___\uDCA0'));
assertEquals('"___\\udca1"', JSON.stringify('___\uDCA1'));
assertEquals('"___\\udca2"', JSON.stringify('___\uDCA2'));
assertEquals('"___\\udca3"', JSON.stringify('___\uDCA3'));
assertEquals('"___\\udca4"', JSON.stringify('___\uDCA4'));
assertEquals('"___\\udca5"', JSON.stringify('___\uDCA5'));
assertEquals('"___\\udca6"', JSON.stringify('___\uDCA6'));
assertEquals('"___\\udca7"', JSON.stringify('___\uDCA7'));
assertEquals('"___\\udca8"', JSON.stringify('___\uDCA8'));
assertEquals('"___\\udca9"', JSON.stringify('___\uDCA9'));
assertEquals('"___\\udcaa"', JSON.stringify('___\uDCAA'));
assertEquals('"___\\udcab"', JSON.stringify('___\uDCAB'));
assertEquals('"___\\udcac"', JSON.stringify('___\uDCAC'));
assertEquals('"___\\udcad"', JSON.stringify('___\uDCAD'));
assertEquals('"___\\udcae"', JSON.stringify('___\uDCAE'));
assertEquals('"___\\udcaf"', JSON.stringify('___\uDCAF'));
assertEquals('"___\\udcb0"', JSON.stringify('___\uDCB0'));
assertEquals('"___\\udcb1"', JSON.stringify('___\uDCB1'));
assertEquals('"___\\udcb2"', JSON.stringify('___\uDCB2'));
assertEquals('"___\\udcb3"', JSON.stringify('___\uDCB3'));
assertEquals('"___\\udcb4"', JSON.stringify('___\uDCB4'));
assertEquals('"___\\udcb5"', JSON.stringify('___\uDCB5'));
assertEquals('"___\\udcb6"', JSON.stringify('___\uDCB6'));
assertEquals('"___\\udcb7"', JSON.stringify('___\uDCB7'));
assertEquals('"___\\udcb8"', JSON.stringify('___\uDCB8'));
assertEquals('"___\\udcb9"', JSON.stringify('___\uDCB9'));
assertEquals('"___\\udcba"', JSON.stringify('___\uDCBA'));
assertEquals('"___\\udcbb"', JSON.stringify('___\uDCBB'));
assertEquals('"___\\udcbc"', JSON.stringify('___\uDCBC'));
assertEquals('"___\\udcbd"', JSON.stringify('___\uDCBD'));
assertEquals('"___\\udcbe"', JSON.stringify('___\uDCBE'));
assertEquals('"___\\udcbf"', JSON.stringify('___\uDCBF'));
assertEquals('"___\\udcc0"', JSON.stringify('___\uDCC0'));
assertEquals('"___\\udcc1"', JSON.stringify('___\uDCC1'));
assertEquals('"___\\udcc2"', JSON.stringify('___\uDCC2'));
assertEquals('"___\\udcc3"', JSON.stringify('___\uDCC3'));
assertEquals('"___\\udcc4"', JSON.stringify('___\uDCC4'));
assertEquals('"___\\udcc5"', JSON.stringify('___\uDCC5'));
assertEquals('"___\\udcc6"', JSON.stringify('___\uDCC6'));
assertEquals('"___\\udcc7"', JSON.stringify('___\uDCC7'));
assertEquals('"___\\udcc8"', JSON.stringify('___\uDCC8'));
assertEquals('"___\\udcc9"', JSON.stringify('___\uDCC9'));
assertEquals('"___\\udcca"', JSON.stringify('___\uDCCA'));
assertEquals('"___\\udccb"', JSON.stringify('___\uDCCB'));
assertEquals('"___\\udccc"', JSON.stringify('___\uDCCC'));
assertEquals('"___\\udccd"', JSON.stringify('___\uDCCD'));
assertEquals('"___\\udcce"', JSON.stringify('___\uDCCE'));
assertEquals('"___\\udccf"', JSON.stringify('___\uDCCF'));
assertEquals('"___\\udcd0"', JSON.stringify('___\uDCD0'));
assertEquals('"___\\udcd1"', JSON.stringify('___\uDCD1'));
assertEquals('"___\\udcd2"', JSON.stringify('___\uDCD2'));
assertEquals('"___\\udcd3"', JSON.stringify('___\uDCD3'));
assertEquals('"___\\udcd4"', JSON.stringify('___\uDCD4'));
assertEquals('"___\\udcd5"', JSON.stringify('___\uDCD5'));
assertEquals('"___\\udcd6"', JSON.stringify('___\uDCD6'));
assertEquals('"___\\udcd7"', JSON.stringify('___\uDCD7'));
assertEquals('"___\\udcd8"', JSON.stringify('___\uDCD8'));
assertEquals('"___\\udcd9"', JSON.stringify('___\uDCD9'));
assertEquals('"___\\udcda"', JSON.stringify('___\uDCDA'));
assertEquals('"___\\udcdb"', JSON.stringify('___\uDCDB'));
assertEquals('"___\\udcdc"', JSON.stringify('___\uDCDC'));
assertEquals('"___\\udcdd"', JSON.stringify('___\uDCDD'));
assertEquals('"___\\udcde"', JSON.stringify('___\uDCDE'));
assertEquals('"___\\udcdf"', JSON.stringify('___\uDCDF'));
assertEquals('"___\\udce0"', JSON.stringify('___\uDCE0'));
assertEquals('"___\\udce1"', JSON.stringify('___\uDCE1'));
assertEquals('"___\\udce2"', JSON.stringify('___\uDCE2'));
assertEquals('"___\\udce3"', JSON.stringify('___\uDCE3'));
assertEquals('"___\\udce4"', JSON.stringify('___\uDCE4'));
assertEquals('"___\\udce5"', JSON.stringify('___\uDCE5'));
assertEquals('"___\\udce6"', JSON.stringify('___\uDCE6'));
assertEquals('"___\\udce7"', JSON.stringify('___\uDCE7'));
assertEquals('"___\\udce8"', JSON.stringify('___\uDCE8'));
assertEquals('"___\\udce9"', JSON.stringify('___\uDCE9'));
assertEquals('"___\\udcea"', JSON.stringify('___\uDCEA'));
assertEquals('"___\\udceb"', JSON.stringify('___\uDCEB'));
assertEquals('"___\\udcec"', JSON.stringify('___\uDCEC'));
assertEquals('"___\\udced"', JSON.stringify('___\uDCED'));
assertEquals('"___\\udcee"', JSON.stringify('___\uDCEE'));
assertEquals('"___\\udcef"', JSON.stringify('___\uDCEF'));
assertEquals('"___\\udcf0"', JSON.stringify('___\uDCF0'));
assertEquals('"___\\udcf1"', JSON.stringify('___\uDCF1'));
assertEquals('"___\\udcf2"', JSON.stringify('___\uDCF2'));
assertEquals('"___\\udcf3"', JSON.stringify('___\uDCF3'));
assertEquals('"___\\udcf4"', JSON.stringify('___\uDCF4'));
assertEquals('"___\\udcf5"', JSON.stringify('___\uDCF5'));
assertEquals('"___\\udcf6"', JSON.stringify('___\uDCF6'));
assertEquals('"___\\udcf7"', JSON.stringify('___\uDCF7'));
assertEquals('"___\\udcf8"', JSON.stringify('___\uDCF8'));
assertEquals('"___\\udcf9"', JSON.stringify('___\uDCF9'));
assertEquals('"___\\udcfa"', JSON.stringify('___\uDCFA'));
assertEquals('"___\\udcfb"', JSON.stringify('___\uDCFB'));
assertEquals('"___\\udcfc"', JSON.stringify('___\uDCFC'));
assertEquals('"___\\udcfd"', JSON.stringify('___\uDCFD'));
assertEquals('"___\\udcfe"', JSON.stringify('___\uDCFE'));
assertEquals('"___\\udcff"', JSON.stringify('___\uDCFF'));
assertEquals('"___\\udd00"', JSON.stringify('___\uDD00'));
assertEquals('"___\\udd01"', JSON.stringify('___\uDD01'));
assertEquals('"___\\udd02"', JSON.stringify('___\uDD02'));
assertEquals('"___\\udd03"', JSON.stringify('___\uDD03'));
assertEquals('"___\\udd04"', JSON.stringify('___\uDD04'));
assertEquals('"___\\udd05"', JSON.stringify('___\uDD05'));
assertEquals('"___\\udd06"', JSON.stringify('___\uDD06'));
assertEquals('"___\\udd07"', JSON.stringify('___\uDD07'));
assertEquals('"___\\udd08"', JSON.stringify('___\uDD08'));
assertEquals('"___\\udd09"', JSON.stringify('___\uDD09'));
assertEquals('"___\\udd0a"', JSON.stringify('___\uDD0A'));
assertEquals('"___\\udd0b"', JSON.stringify('___\uDD0B'));
assertEquals('"___\\udd0c"', JSON.stringify('___\uDD0C'));
assertEquals('"___\\udd0d"', JSON.stringify('___\uDD0D'));
assertEquals('"___\\udd0e"', JSON.stringify('___\uDD0E'));
assertEquals('"___\\udd0f"', JSON.stringify('___\uDD0F'));
assertEquals('"___\\udd10"', JSON.stringify('___\uDD10'));
assertEquals('"___\\udd11"', JSON.stringify('___\uDD11'));
assertEquals('"___\\udd12"', JSON.stringify('___\uDD12'));
assertEquals('"___\\udd13"', JSON.stringify('___\uDD13'));
assertEquals('"___\\udd14"', JSON.stringify('___\uDD14'));
assertEquals('"___\\udd15"', JSON.stringify('___\uDD15'));
assertEquals('"___\\udd16"', JSON.stringify('___\uDD16'));
assertEquals('"___\\udd17"', JSON.stringify('___\uDD17'));
assertEquals('"___\\udd18"', JSON.stringify('___\uDD18'));
assertEquals('"___\\udd19"', JSON.stringify('___\uDD19'));
assertEquals('"___\\udd1a"', JSON.stringify('___\uDD1A'));
assertEquals('"___\\udd1b"', JSON.stringify('___\uDD1B'));
assertEquals('"___\\udd1c"', JSON.stringify('___\uDD1C'));
assertEquals('"___\\udd1d"', JSON.stringify('___\uDD1D'));
assertEquals('"___\\udd1e"', JSON.stringify('___\uDD1E'));
assertEquals('"___\\udd1f"', JSON.stringify('___\uDD1F'));
assertEquals('"___\\udd20"', JSON.stringify('___\uDD20'));
assertEquals('"___\\udd21"', JSON.stringify('___\uDD21'));
assertEquals('"___\\udd22"', JSON.stringify('___\uDD22'));
assertEquals('"___\\udd23"', JSON.stringify('___\uDD23'));
assertEquals('"___\\udd24"', JSON.stringify('___\uDD24'));
assertEquals('"___\\udd25"', JSON.stringify('___\uDD25'));
assertEquals('"___\\udd26"', JSON.stringify('___\uDD26'));
assertEquals('"___\\udd27"', JSON.stringify('___\uDD27'));
assertEquals('"___\\udd28"', JSON.stringify('___\uDD28'));
assertEquals('"___\\udd29"', JSON.stringify('___\uDD29'));
assertEquals('"___\\udd2a"', JSON.stringify('___\uDD2A'));
assertEquals('"___\\udd2b"', JSON.stringify('___\uDD2B'));
assertEquals('"___\\udd2c"', JSON.stringify('___\uDD2C'));
assertEquals('"___\\udd2d"', JSON.stringify('___\uDD2D'));
assertEquals('"___\\udd2e"', JSON.stringify('___\uDD2E'));
assertEquals('"___\\udd2f"', JSON.stringify('___\uDD2F'));
assertEquals('"___\\udd30"', JSON.stringify('___\uDD30'));
assertEquals('"___\\udd31"', JSON.stringify('___\uDD31'));
assertEquals('"___\\udd32"', JSON.stringify('___\uDD32'));
assertEquals('"___\\udd33"', JSON.stringify('___\uDD33'));
assertEquals('"___\\udd34"', JSON.stringify('___\uDD34'));
assertEquals('"___\\udd35"', JSON.stringify('___\uDD35'));
assertEquals('"___\\udd36"', JSON.stringify('___\uDD36'));
assertEquals('"___\\udd37"', JSON.stringify('___\uDD37'));
assertEquals('"___\\udd38"', JSON.stringify('___\uDD38'));
assertEquals('"___\\udd39"', JSON.stringify('___\uDD39'));
assertEquals('"___\\udd3a"', JSON.stringify('___\uDD3A'));
assertEquals('"___\\udd3b"', JSON.stringify('___\uDD3B'));
assertEquals('"___\\udd3c"', JSON.stringify('___\uDD3C'));
assertEquals('"___\\udd3d"', JSON.stringify('___\uDD3D'));
assertEquals('"___\\udd3e"', JSON.stringify('___\uDD3E'));
assertEquals('"___\\udd3f"', JSON.stringify('___\uDD3F'));
assertEquals('"___\\udd40"', JSON.stringify('___\uDD40'));
assertEquals('"___\\udd41"', JSON.stringify('___\uDD41'));
assertEquals('"___\\udd42"', JSON.stringify('___\uDD42'));
assertEquals('"___\\udd43"', JSON.stringify('___\uDD43'));
assertEquals('"___\\udd44"', JSON.stringify('___\uDD44'));
assertEquals('"___\\udd45"', JSON.stringify('___\uDD45'));
assertEquals('"___\\udd46"', JSON.stringify('___\uDD46'));
assertEquals('"___\\udd47"', JSON.stringify('___\uDD47'));
assertEquals('"___\\udd48"', JSON.stringify('___\uDD48'));
assertEquals('"___\\udd49"', JSON.stringify('___\uDD49'));
assertEquals('"___\\udd4a"', JSON.stringify('___\uDD4A'));
assertEquals('"___\\udd4b"', JSON.stringify('___\uDD4B'));
assertEquals('"___\\udd4c"', JSON.stringify('___\uDD4C'));
assertEquals('"___\\udd4d"', JSON.stringify('___\uDD4D'));
assertEquals('"___\\udd4e"', JSON.stringify('___\uDD4E'));
assertEquals('"___\\udd4f"', JSON.stringify('___\uDD4F'));
assertEquals('"___\\udd50"', JSON.stringify('___\uDD50'));
assertEquals('"___\\udd51"', JSON.stringify('___\uDD51'));
assertEquals('"___\\udd52"', JSON.stringify('___\uDD52'));
assertEquals('"___\\udd53"', JSON.stringify('___\uDD53'));
assertEquals('"___\\udd54"', JSON.stringify('___\uDD54'));
assertEquals('"___\\udd55"', JSON.stringify('___\uDD55'));
assertEquals('"___\\udd56"', JSON.stringify('___\uDD56'));
assertEquals('"___\\udd57"', JSON.stringify('___\uDD57'));
assertEquals('"___\\udd58"', JSON.stringify('___\uDD58'));
assertEquals('"___\\udd59"', JSON.stringify('___\uDD59'));
assertEquals('"___\\udd5a"', JSON.stringify('___\uDD5A'));
assertEquals('"___\\udd5b"', JSON.stringify('___\uDD5B'));
assertEquals('"___\\udd5c"', JSON.stringify('___\uDD5C'));
assertEquals('"___\\udd5d"', JSON.stringify('___\uDD5D'));
assertEquals('"___\\udd5e"', JSON.stringify('___\uDD5E'));
assertEquals('"___\\udd5f"', JSON.stringify('___\uDD5F'));
assertEquals('"___\\udd60"', JSON.stringify('___\uDD60'));
assertEquals('"___\\udd61"', JSON.stringify('___\uDD61'));
assertEquals('"___\\udd62"', JSON.stringify('___\uDD62'));
assertEquals('"___\\udd63"', JSON.stringify('___\uDD63'));
assertEquals('"___\\udd64"', JSON.stringify('___\uDD64'));
assertEquals('"___\\udd65"', JSON.stringify('___\uDD65'));
assertEquals('"___\\udd66"', JSON.stringify('___\uDD66'));
assertEquals('"___\\udd67"', JSON.stringify('___\uDD67'));
assertEquals('"___\\udd68"', JSON.stringify('___\uDD68'));
assertEquals('"___\\udd69"', JSON.stringify('___\uDD69'));
assertEquals('"___\\udd6a"', JSON.stringify('___\uDD6A'));
assertEquals('"___\\udd6b"', JSON.stringify('___\uDD6B'));
assertEquals('"___\\udd6c"', JSON.stringify('___\uDD6C'));
assertEquals('"___\\udd6d"', JSON.stringify('___\uDD6D'));
assertEquals('"___\\udd6e"', JSON.stringify('___\uDD6E'));
assertEquals('"___\\udd6f"', JSON.stringify('___\uDD6F'));
assertEquals('"___\\udd70"', JSON.stringify('___\uDD70'));
assertEquals('"___\\udd71"', JSON.stringify('___\uDD71'));
assertEquals('"___\\udd72"', JSON.stringify('___\uDD72'));
assertEquals('"___\\udd73"', JSON.stringify('___\uDD73'));
assertEquals('"___\\udd74"', JSON.stringify('___\uDD74'));
assertEquals('"___\\udd75"', JSON.stringify('___\uDD75'));
assertEquals('"___\\udd76"', JSON.stringify('___\uDD76'));
assertEquals('"___\\udd77"', JSON.stringify('___\uDD77'));
assertEquals('"___\\udd78"', JSON.stringify('___\uDD78'));
assertEquals('"___\\udd79"', JSON.stringify('___\uDD79'));
assertEquals('"___\\udd7a"', JSON.stringify('___\uDD7A'));
assertEquals('"___\\udd7b"', JSON.stringify('___\uDD7B'));
assertEquals('"___\\udd7c"', JSON.stringify('___\uDD7C'));
assertEquals('"___\\udd7d"', JSON.stringify('___\uDD7D'));
assertEquals('"___\\udd7e"', JSON.stringify('___\uDD7E'));
assertEquals('"___\\udd7f"', JSON.stringify('___\uDD7F'));
assertEquals('"___\\udd80"', JSON.stringify('___\uDD80'));
assertEquals('"___\\udd81"', JSON.stringify('___\uDD81'));
assertEquals('"___\\udd82"', JSON.stringify('___\uDD82'));
assertEquals('"___\\udd83"', JSON.stringify('___\uDD83'));
assertEquals('"___\\udd84"', JSON.stringify('___\uDD84'));
assertEquals('"___\\udd85"', JSON.stringify('___\uDD85'));
assertEquals('"___\\udd86"', JSON.stringify('___\uDD86'));
assertEquals('"___\\udd87"', JSON.stringify('___\uDD87'));
assertEquals('"___\\udd88"', JSON.stringify('___\uDD88'));
assertEquals('"___\\udd89"', JSON.stringify('___\uDD89'));
assertEquals('"___\\udd8a"', JSON.stringify('___\uDD8A'));
assertEquals('"___\\udd8b"', JSON.stringify('___\uDD8B'));
assertEquals('"___\\udd8c"', JSON.stringify('___\uDD8C'));
assertEquals('"___\\udd8d"', JSON.stringify('___\uDD8D'));
assertEquals('"___\\udd8e"', JSON.stringify('___\uDD8E'));
assertEquals('"___\\udd8f"', JSON.stringify('___\uDD8F'));
assertEquals('"___\\udd90"', JSON.stringify('___\uDD90'));
assertEquals('"___\\udd91"', JSON.stringify('___\uDD91'));
assertEquals('"___\\udd92"', JSON.stringify('___\uDD92'));
assertEquals('"___\\udd93"', JSON.stringify('___\uDD93'));
assertEquals('"___\\udd94"', JSON.stringify('___\uDD94'));
assertEquals('"___\\udd95"', JSON.stringify('___\uDD95'));
assertEquals('"___\\udd96"', JSON.stringify('___\uDD96'));
assertEquals('"___\\udd97"', JSON.stringify('___\uDD97'));
assertEquals('"___\\udd98"', JSON.stringify('___\uDD98'));
assertEquals('"___\\udd99"', JSON.stringify('___\uDD99'));
assertEquals('"___\\udd9a"', JSON.stringify('___\uDD9A'));
assertEquals('"___\\udd9b"', JSON.stringify('___\uDD9B'));
assertEquals('"___\\udd9c"', JSON.stringify('___\uDD9C'));
assertEquals('"___\\udd9d"', JSON.stringify('___\uDD9D'));
assertEquals('"___\\udd9e"', JSON.stringify('___\uDD9E'));
assertEquals('"___\\udd9f"', JSON.stringify('___\uDD9F'));
assertEquals('"___\\udda0"', JSON.stringify('___\uDDA0'));
assertEquals('"___\\udda1"', JSON.stringify('___\uDDA1'));
assertEquals('"___\\udda2"', JSON.stringify('___\uDDA2'));
assertEquals('"___\\udda3"', JSON.stringify('___\uDDA3'));
assertEquals('"___\\udda4"', JSON.stringify('___\uDDA4'));
assertEquals('"___\\udda5"', JSON.stringify('___\uDDA5'));
assertEquals('"___\\udda6"', JSON.stringify('___\uDDA6'));
assertEquals('"___\\udda7"', JSON.stringify('___\uDDA7'));
assertEquals('"___\\udda8"', JSON.stringify('___\uDDA8'));
assertEquals('"___\\udda9"', JSON.stringify('___\uDDA9'));
assertEquals('"___\\uddaa"', JSON.stringify('___\uDDAA'));
assertEquals('"___\\uddab"', JSON.stringify('___\uDDAB'));
assertEquals('"___\\uddac"', JSON.stringify('___\uDDAC'));
assertEquals('"___\\uddad"', JSON.stringify('___\uDDAD'));
assertEquals('"___\\uddae"', JSON.stringify('___\uDDAE'));
assertEquals('"___\\uddaf"', JSON.stringify('___\uDDAF'));
assertEquals('"___\\uddb0"', JSON.stringify('___\uDDB0'));
assertEquals('"___\\uddb1"', JSON.stringify('___\uDDB1'));
assertEquals('"___\\uddb2"', JSON.stringify('___\uDDB2'));
assertEquals('"___\\uddb3"', JSON.stringify('___\uDDB3'));
assertEquals('"___\\uddb4"', JSON.stringify('___\uDDB4'));
assertEquals('"___\\uddb5"', JSON.stringify('___\uDDB5'));
assertEquals('"___\\uddb6"', JSON.stringify('___\uDDB6'));
assertEquals('"___\\uddb7"', JSON.stringify('___\uDDB7'));
assertEquals('"___\\uddb8"', JSON.stringify('___\uDDB8'));
assertEquals('"___\\uddb9"', JSON.stringify('___\uDDB9'));
assertEquals('"___\\uddba"', JSON.stringify('___\uDDBA'));
assertEquals('"___\\uddbb"', JSON.stringify('___\uDDBB'));
assertEquals('"___\\uddbc"', JSON.stringify('___\uDDBC'));
assertEquals('"___\\uddbd"', JSON.stringify('___\uDDBD'));
assertEquals('"___\\uddbe"', JSON.stringify('___\uDDBE'));
assertEquals('"___\\uddbf"', JSON.stringify('___\uDDBF'));
assertEquals('"___\\uddc0"', JSON.stringify('___\uDDC0'));
assertEquals('"___\\uddc1"', JSON.stringify('___\uDDC1'));
assertEquals('"___\\uddc2"', JSON.stringify('___\uDDC2'));
assertEquals('"___\\uddc3"', JSON.stringify('___\uDDC3'));
assertEquals('"___\\uddc4"', JSON.stringify('___\uDDC4'));
assertEquals('"___\\uddc5"', JSON.stringify('___\uDDC5'));
assertEquals('"___\\uddc6"', JSON.stringify('___\uDDC6'));
assertEquals('"___\\uddc7"', JSON.stringify('___\uDDC7'));
assertEquals('"___\\uddc8"', JSON.stringify('___\uDDC8'));
assertEquals('"___\\uddc9"', JSON.stringify('___\uDDC9'));
assertEquals('"___\\uddca"', JSON.stringify('___\uDDCA'));
assertEquals('"___\\uddcb"', JSON.stringify('___\uDDCB'));
assertEquals('"___\\uddcc"', JSON.stringify('___\uDDCC'));
assertEquals('"___\\uddcd"', JSON.stringify('___\uDDCD'));
assertEquals('"___\\uddce"', JSON.stringify('___\uDDCE'));
assertEquals('"___\\uddcf"', JSON.stringify('___\uDDCF'));
assertEquals('"___\\uddd0"', JSON.stringify('___\uDDD0'));
assertEquals('"___\\uddd1"', JSON.stringify('___\uDDD1'));
assertEquals('"___\\uddd2"', JSON.stringify('___\uDDD2'));
assertEquals('"___\\uddd3"', JSON.stringify('___\uDDD3'));
assertEquals('"___\\uddd4"', JSON.stringify('___\uDDD4'));
assertEquals('"___\\uddd5"', JSON.stringify('___\uDDD5'));
assertEquals('"___\\uddd6"', JSON.stringify('___\uDDD6'));
assertEquals('"___\\uddd7"', JSON.stringify('___\uDDD7'));
assertEquals('"___\\uddd8"', JSON.stringify('___\uDDD8'));
assertEquals('"___\\uddd9"', JSON.stringify('___\uDDD9'));
assertEquals('"___\\uddda"', JSON.stringify('___\uDDDA'));
assertEquals('"___\\udddb"', JSON.stringify('___\uDDDB'));
assertEquals('"___\\udddc"', JSON.stringify('___\uDDDC'));
assertEquals('"___\\udddd"', JSON.stringify('___\uDDDD'));
assertEquals('"___\\uddde"', JSON.stringify('___\uDDDE'));
assertEquals('"___\\udddf"', JSON.stringify('___\uDDDF'));
assertEquals('"___\\udde0"', JSON.stringify('___\uDDE0'));
assertEquals('"___\\udde1"', JSON.stringify('___\uDDE1'));
assertEquals('"___\\udde2"', JSON.stringify('___\uDDE2'));
assertEquals('"___\\udde3"', JSON.stringify('___\uDDE3'));
assertEquals('"___\\udde4"', JSON.stringify('___\uDDE4'));
assertEquals('"___\\udde5"', JSON.stringify('___\uDDE5'));
assertEquals('"___\\udde6"', JSON.stringify('___\uDDE6'));
assertEquals('"___\\udde7"', JSON.stringify('___\uDDE7'));
assertEquals('"___\\udde8"', JSON.stringify('___\uDDE8'));
assertEquals('"___\\udde9"', JSON.stringify('___\uDDE9'));
assertEquals('"___\\uddea"', JSON.stringify('___\uDDEA'));
assertEquals('"___\\uddeb"', JSON.stringify('___\uDDEB'));
assertEquals('"___\\uddec"', JSON.stringify('___\uDDEC'));
assertEquals('"___\\udded"', JSON.stringify('___\uDDED'));
assertEquals('"___\\uddee"', JSON.stringify('___\uDDEE'));
assertEquals('"___\\uddef"', JSON.stringify('___\uDDEF'));
assertEquals('"___\\uddf0"', JSON.stringify('___\uDDF0'));
assertEquals('"___\\uddf1"', JSON.stringify('___\uDDF1'));
assertEquals('"___\\uddf2"', JSON.stringify('___\uDDF2'));
assertEquals('"___\\uddf3"', JSON.stringify('___\uDDF3'));
assertEquals('"___\\uddf4"', JSON.stringify('___\uDDF4'));
assertEquals('"___\\uddf5"', JSON.stringify('___\uDDF5'));
assertEquals('"___\\uddf6"', JSON.stringify('___\uDDF6'));
assertEquals('"___\\uddf7"', JSON.stringify('___\uDDF7'));
assertEquals('"___\\uddf8"', JSON.stringify('___\uDDF8'));
assertEquals('"___\\uddf9"', JSON.stringify('___\uDDF9'));
assertEquals('"___\\uddfa"', JSON.stringify('___\uDDFA'));
assertEquals('"___\\uddfb"', JSON.stringify('___\uDDFB'));
assertEquals('"___\\uddfc"', JSON.stringify('___\uDDFC'));
assertEquals('"___\\uddfd"', JSON.stringify('___\uDDFD'));
assertEquals('"___\\uddfe"', JSON.stringify('___\uDDFE'));
assertEquals('"___\\uddff"', JSON.stringify('___\uDDFF'));
assertEquals('"___\\ude00"', JSON.stringify('___\uDE00'));
assertEquals('"___\\ude01"', JSON.stringify('___\uDE01'));
assertEquals('"___\\ude02"', JSON.stringify('___\uDE02'));
assertEquals('"___\\ude03"', JSON.stringify('___\uDE03'));
assertEquals('"___\\ude04"', JSON.stringify('___\uDE04'));
assertEquals('"___\\ude05"', JSON.stringify('___\uDE05'));
assertEquals('"___\\ude06"', JSON.stringify('___\uDE06'));
assertEquals('"___\\ude07"', JSON.stringify('___\uDE07'));
assertEquals('"___\\ude08"', JSON.stringify('___\uDE08'));
assertEquals('"___\\ude09"', JSON.stringify('___\uDE09'));
assertEquals('"___\\ude0a"', JSON.stringify('___\uDE0A'));
assertEquals('"___\\ude0b"', JSON.stringify('___\uDE0B'));
assertEquals('"___\\ude0c"', JSON.stringify('___\uDE0C'));
assertEquals('"___\\ude0d"', JSON.stringify('___\uDE0D'));
assertEquals('"___\\ude0e"', JSON.stringify('___\uDE0E'));
assertEquals('"___\\ude0f"', JSON.stringify('___\uDE0F'));
assertEquals('"___\\ude10"', JSON.stringify('___\uDE10'));
assertEquals('"___\\ude11"', JSON.stringify('___\uDE11'));
assertEquals('"___\\ude12"', JSON.stringify('___\uDE12'));
assertEquals('"___\\ude13"', JSON.stringify('___\uDE13'));
assertEquals('"___\\ude14"', JSON.stringify('___\uDE14'));
assertEquals('"___\\ude15"', JSON.stringify('___\uDE15'));
assertEquals('"___\\ude16"', JSON.stringify('___\uDE16'));
assertEquals('"___\\ude17"', JSON.stringify('___\uDE17'));
assertEquals('"___\\ude18"', JSON.stringify('___\uDE18'));
assertEquals('"___\\ude19"', JSON.stringify('___\uDE19'));
assertEquals('"___\\ude1a"', JSON.stringify('___\uDE1A'));
assertEquals('"___\\ude1b"', JSON.stringify('___\uDE1B'));
assertEquals('"___\\ude1c"', JSON.stringify('___\uDE1C'));
assertEquals('"___\\ude1d"', JSON.stringify('___\uDE1D'));
assertEquals('"___\\ude1e"', JSON.stringify('___\uDE1E'));
assertEquals('"___\\ude1f"', JSON.stringify('___\uDE1F'));
assertEquals('"___\\ude20"', JSON.stringify('___\uDE20'));
assertEquals('"___\\ude21"', JSON.stringify('___\uDE21'));
assertEquals('"___\\ude22"', JSON.stringify('___\uDE22'));
assertEquals('"___\\ude23"', JSON.stringify('___\uDE23'));
assertEquals('"___\\ude24"', JSON.stringify('___\uDE24'));
assertEquals('"___\\ude25"', JSON.stringify('___\uDE25'));
assertEquals('"___\\ude26"', JSON.stringify('___\uDE26'));
assertEquals('"___\\ude27"', JSON.stringify('___\uDE27'));
assertEquals('"___\\ude28"', JSON.stringify('___\uDE28'));
assertEquals('"___\\ude29"', JSON.stringify('___\uDE29'));
assertEquals('"___\\ude2a"', JSON.stringify('___\uDE2A'));
assertEquals('"___\\ude2b"', JSON.stringify('___\uDE2B'));
assertEquals('"___\\ude2c"', JSON.stringify('___\uDE2C'));
assertEquals('"___\\ude2d"', JSON.stringify('___\uDE2D'));
assertEquals('"___\\ude2e"', JSON.stringify('___\uDE2E'));
assertEquals('"___\\ude2f"', JSON.stringify('___\uDE2F'));
assertEquals('"___\\ude30"', JSON.stringify('___\uDE30'));
assertEquals('"___\\ude31"', JSON.stringify('___\uDE31'));
assertEquals('"___\\ude32"', JSON.stringify('___\uDE32'));
assertEquals('"___\\ude33"', JSON.stringify('___\uDE33'));
assertEquals('"___\\ude34"', JSON.stringify('___\uDE34'));
assertEquals('"___\\ude35"', JSON.stringify('___\uDE35'));
assertEquals('"___\\ude36"', JSON.stringify('___\uDE36'));
assertEquals('"___\\ude37"', JSON.stringify('___\uDE37'));
assertEquals('"___\\ude38"', JSON.stringify('___\uDE38'));
assertEquals('"___\\ude39"', JSON.stringify('___\uDE39'));
assertEquals('"___\\ude3a"', JSON.stringify('___\uDE3A'));
assertEquals('"___\\ude3b"', JSON.stringify('___\uDE3B'));
assertEquals('"___\\ude3c"', JSON.stringify('___\uDE3C'));
assertEquals('"___\\ude3d"', JSON.stringify('___\uDE3D'));
assertEquals('"___\\ude3e"', JSON.stringify('___\uDE3E'));
assertEquals('"___\\ude3f"', JSON.stringify('___\uDE3F'));
assertEquals('"___\\ude40"', JSON.stringify('___\uDE40'));
assertEquals('"___\\ude41"', JSON.stringify('___\uDE41'));
assertEquals('"___\\ude42"', JSON.stringify('___\uDE42'));
assertEquals('"___\\ude43"', JSON.stringify('___\uDE43'));
assertEquals('"___\\ude44"', JSON.stringify('___\uDE44'));
assertEquals('"___\\ude45"', JSON.stringify('___\uDE45'));
assertEquals('"___\\ude46"', JSON.stringify('___\uDE46'));
assertEquals('"___\\ude47"', JSON.stringify('___\uDE47'));
assertEquals('"___\\ude48"', JSON.stringify('___\uDE48'));
assertEquals('"___\\ude49"', JSON.stringify('___\uDE49'));
assertEquals('"___\\ude4a"', JSON.stringify('___\uDE4A'));
assertEquals('"___\\ude4b"', JSON.stringify('___\uDE4B'));
assertEquals('"___\\ude4c"', JSON.stringify('___\uDE4C'));
assertEquals('"___\\ude4d"', JSON.stringify('___\uDE4D'));
assertEquals('"___\\ude4e"', JSON.stringify('___\uDE4E'));
assertEquals('"___\\ude4f"', JSON.stringify('___\uDE4F'));
assertEquals('"___\\ude50"', JSON.stringify('___\uDE50'));
assertEquals('"___\\ude51"', JSON.stringify('___\uDE51'));
assertEquals('"___\\ude52"', JSON.stringify('___\uDE52'));
assertEquals('"___\\ude53"', JSON.stringify('___\uDE53'));
assertEquals('"___\\ude54"', JSON.stringify('___\uDE54'));
assertEquals('"___\\ude55"', JSON.stringify('___\uDE55'));
assertEquals('"___\\ude56"', JSON.stringify('___\uDE56'));
assertEquals('"___\\ude57"', JSON.stringify('___\uDE57'));
assertEquals('"___\\ude58"', JSON.stringify('___\uDE58'));
assertEquals('"___\\ude59"', JSON.stringify('___\uDE59'));
assertEquals('"___\\ude5a"', JSON.stringify('___\uDE5A'));
assertEquals('"___\\ude5b"', JSON.stringify('___\uDE5B'));
assertEquals('"___\\ude5c"', JSON.stringify('___\uDE5C'));
assertEquals('"___\\ude5d"', JSON.stringify('___\uDE5D'));
assertEquals('"___\\ude5e"', JSON.stringify('___\uDE5E'));
assertEquals('"___\\ude5f"', JSON.stringify('___\uDE5F'));
assertEquals('"___\\ude60"', JSON.stringify('___\uDE60'));
assertEquals('"___\\ude61"', JSON.stringify('___\uDE61'));
assertEquals('"___\\ude62"', JSON.stringify('___\uDE62'));
assertEquals('"___\\ude63"', JSON.stringify('___\uDE63'));
assertEquals('"___\\ude64"', JSON.stringify('___\uDE64'));
assertEquals('"___\\ude65"', JSON.stringify('___\uDE65'));
assertEquals('"___\\ude66"', JSON.stringify('___\uDE66'));
assertEquals('"___\\ude67"', JSON.stringify('___\uDE67'));
assertEquals('"___\\ude68"', JSON.stringify('___\uDE68'));
assertEquals('"___\\ude69"', JSON.stringify('___\uDE69'));
assertEquals('"___\\ude6a"', JSON.stringify('___\uDE6A'));
assertEquals('"___\\ude6b"', JSON.stringify('___\uDE6B'));
assertEquals('"___\\ude6c"', JSON.stringify('___\uDE6C'));
assertEquals('"___\\ude6d"', JSON.stringify('___\uDE6D'));
assertEquals('"___\\ude6e"', JSON.stringify('___\uDE6E'));
assertEquals('"___\\ude6f"', JSON.stringify('___\uDE6F'));
assertEquals('"___\\ude70"', JSON.stringify('___\uDE70'));
assertEquals('"___\\ude71"', JSON.stringify('___\uDE71'));
assertEquals('"___\\ude72"', JSON.stringify('___\uDE72'));
assertEquals('"___\\ude73"', JSON.stringify('___\uDE73'));
assertEquals('"___\\ude74"', JSON.stringify('___\uDE74'));
assertEquals('"___\\ude75"', JSON.stringify('___\uDE75'));
assertEquals('"___\\ude76"', JSON.stringify('___\uDE76'));
assertEquals('"___\\ude77"', JSON.stringify('___\uDE77'));
assertEquals('"___\\ude78"', JSON.stringify('___\uDE78'));
assertEquals('"___\\ude79"', JSON.stringify('___\uDE79'));
assertEquals('"___\\ude7a"', JSON.stringify('___\uDE7A'));
assertEquals('"___\\ude7b"', JSON.stringify('___\uDE7B'));
assertEquals('"___\\ude7c"', JSON.stringify('___\uDE7C'));
assertEquals('"___\\ude7d"', JSON.stringify('___\uDE7D'));
assertEquals('"___\\ude7e"', JSON.stringify('___\uDE7E'));
assertEquals('"___\\ude7f"', JSON.stringify('___\uDE7F'));
assertEquals('"___\\ude80"', JSON.stringify('___\uDE80'));
assertEquals('"___\\ude81"', JSON.stringify('___\uDE81'));
assertEquals('"___\\ude82"', JSON.stringify('___\uDE82'));
assertEquals('"___\\ude83"', JSON.stringify('___\uDE83'));
assertEquals('"___\\ude84"', JSON.stringify('___\uDE84'));
assertEquals('"___\\ude85"', JSON.stringify('___\uDE85'));
assertEquals('"___\\ude86"', JSON.stringify('___\uDE86'));
assertEquals('"___\\ude87"', JSON.stringify('___\uDE87'));
assertEquals('"___\\ude88"', JSON.stringify('___\uDE88'));
assertEquals('"___\\ude89"', JSON.stringify('___\uDE89'));
assertEquals('"___\\ude8a"', JSON.stringify('___\uDE8A'));
assertEquals('"___\\ude8b"', JSON.stringify('___\uDE8B'));
assertEquals('"___\\ude8c"', JSON.stringify('___\uDE8C'));
assertEquals('"___\\ude8d"', JSON.stringify('___\uDE8D'));
assertEquals('"___\\ude8e"', JSON.stringify('___\uDE8E'));
assertEquals('"___\\ude8f"', JSON.stringify('___\uDE8F'));
assertEquals('"___\\ude90"', JSON.stringify('___\uDE90'));
assertEquals('"___\\ude91"', JSON.stringify('___\uDE91'));
assertEquals('"___\\ude92"', JSON.stringify('___\uDE92'));
assertEquals('"___\\ude93"', JSON.stringify('___\uDE93'));
assertEquals('"___\\ude94"', JSON.stringify('___\uDE94'));
assertEquals('"___\\ude95"', JSON.stringify('___\uDE95'));
assertEquals('"___\\ude96"', JSON.stringify('___\uDE96'));
assertEquals('"___\\ude97"', JSON.stringify('___\uDE97'));
assertEquals('"___\\ude98"', JSON.stringify('___\uDE98'));
assertEquals('"___\\ude99"', JSON.stringify('___\uDE99'));
assertEquals('"___\\ude9a"', JSON.stringify('___\uDE9A'));
assertEquals('"___\\ude9b"', JSON.stringify('___\uDE9B'));
assertEquals('"___\\ude9c"', JSON.stringify('___\uDE9C'));
assertEquals('"___\\ude9d"', JSON.stringify('___\uDE9D'));
assertEquals('"___\\ude9e"', JSON.stringify('___\uDE9E'));
assertEquals('"___\\ude9f"', JSON.stringify('___\uDE9F'));
assertEquals('"___\\udea0"', JSON.stringify('___\uDEA0'));
assertEquals('"___\\udea1"', JSON.stringify('___\uDEA1'));
assertEquals('"___\\udea2"', JSON.stringify('___\uDEA2'));
assertEquals('"___\\udea3"', JSON.stringify('___\uDEA3'));
assertEquals('"___\\udea4"', JSON.stringify('___\uDEA4'));
assertEquals('"___\\udea5"', JSON.stringify('___\uDEA5'));
assertEquals('"___\\udea6"', JSON.stringify('___\uDEA6'));
assertEquals('"___\\udea7"', JSON.stringify('___\uDEA7'));
assertEquals('"___\\udea8"', JSON.stringify('___\uDEA8'));
assertEquals('"___\\udea9"', JSON.stringify('___\uDEA9'));
assertEquals('"___\\udeaa"', JSON.stringify('___\uDEAA'));
assertEquals('"___\\udeab"', JSON.stringify('___\uDEAB'));
assertEquals('"___\\udeac"', JSON.stringify('___\uDEAC'));
assertEquals('"___\\udead"', JSON.stringify('___\uDEAD'));
assertEquals('"___\\udeae"', JSON.stringify('___\uDEAE'));
assertEquals('"___\\udeaf"', JSON.stringify('___\uDEAF'));
assertEquals('"___\\udeb0"', JSON.stringify('___\uDEB0'));
assertEquals('"___\\udeb1"', JSON.stringify('___\uDEB1'));
assertEquals('"___\\udeb2"', JSON.stringify('___\uDEB2'));
assertEquals('"___\\udeb3"', JSON.stringify('___\uDEB3'));
assertEquals('"___\\udeb4"', JSON.stringify('___\uDEB4'));
assertEquals('"___\\udeb5"', JSON.stringify('___\uDEB5'));
assertEquals('"___\\udeb6"', JSON.stringify('___\uDEB6'));
assertEquals('"___\\udeb7"', JSON.stringify('___\uDEB7'));
assertEquals('"___\\udeb8"', JSON.stringify('___\uDEB8'));
assertEquals('"___\\udeb9"', JSON.stringify('___\uDEB9'));
assertEquals('"___\\udeba"', JSON.stringify('___\uDEBA'));
assertEquals('"___\\udebb"', JSON.stringify('___\uDEBB'));
assertEquals('"___\\udebc"', JSON.stringify('___\uDEBC'));
assertEquals('"___\\udebd"', JSON.stringify('___\uDEBD'));
assertEquals('"___\\udebe"', JSON.stringify('___\uDEBE'));
assertEquals('"___\\udebf"', JSON.stringify('___\uDEBF'));
assertEquals('"___\\udec0"', JSON.stringify('___\uDEC0'));
assertEquals('"___\\udec1"', JSON.stringify('___\uDEC1'));
assertEquals('"___\\udec2"', JSON.stringify('___\uDEC2'));
assertEquals('"___\\udec3"', JSON.stringify('___\uDEC3'));
assertEquals('"___\\udec4"', JSON.stringify('___\uDEC4'));
assertEquals('"___\\udec5"', JSON.stringify('___\uDEC5'));
assertEquals('"___\\udec6"', JSON.stringify('___\uDEC6'));
assertEquals('"___\\udec7"', JSON.stringify('___\uDEC7'));
assertEquals('"___\\udec8"', JSON.stringify('___\uDEC8'));
assertEquals('"___\\udec9"', JSON.stringify('___\uDEC9'));
assertEquals('"___\\udeca"', JSON.stringify('___\uDECA'));
assertEquals('"___\\udecb"', JSON.stringify('___\uDECB'));
assertEquals('"___\\udecc"', JSON.stringify('___\uDECC'));
assertEquals('"___\\udecd"', JSON.stringify('___\uDECD'));
assertEquals('"___\\udece"', JSON.stringify('___\uDECE'));
assertEquals('"___\\udecf"', JSON.stringify('___\uDECF'));
assertEquals('"___\\uded0"', JSON.stringify('___\uDED0'));
assertEquals('"___\\uded1"', JSON.stringify('___\uDED1'));
assertEquals('"___\\uded2"', JSON.stringify('___\uDED2'));
assertEquals('"___\\uded3"', JSON.stringify('___\uDED3'));
assertEquals('"___\\uded4"', JSON.stringify('___\uDED4'));
assertEquals('"___\\uded5"', JSON.stringify('___\uDED5'));
assertEquals('"___\\uded6"', JSON.stringify('___\uDED6'));
assertEquals('"___\\uded7"', JSON.stringify('___\uDED7'));
assertEquals('"___\\uded8"', JSON.stringify('___\uDED8'));
assertEquals('"___\\uded9"', JSON.stringify('___\uDED9'));
assertEquals('"___\\udeda"', JSON.stringify('___\uDEDA'));
assertEquals('"___\\udedb"', JSON.stringify('___\uDEDB'));
assertEquals('"___\\udedc"', JSON.stringify('___\uDEDC'));
assertEquals('"___\\udedd"', JSON.stringify('___\uDEDD'));
assertEquals('"___\\udede"', JSON.stringify('___\uDEDE'));
assertEquals('"___\\udedf"', JSON.stringify('___\uDEDF'));
assertEquals('"___\\udee0"', JSON.stringify('___\uDEE0'));
assertEquals('"___\\udee1"', JSON.stringify('___\uDEE1'));
assertEquals('"___\\udee2"', JSON.stringify('___\uDEE2'));
assertEquals('"___\\udee3"', JSON.stringify('___\uDEE3'));
assertEquals('"___\\udee4"', JSON.stringify('___\uDEE4'));
assertEquals('"___\\udee5"', JSON.stringify('___\uDEE5'));
assertEquals('"___\\udee6"', JSON.stringify('___\uDEE6'));
assertEquals('"___\\udee7"', JSON.stringify('___\uDEE7'));
assertEquals('"___\\udee8"', JSON.stringify('___\uDEE8'));
assertEquals('"___\\udee9"', JSON.stringify('___\uDEE9'));
assertEquals('"___\\udeea"', JSON.stringify('___\uDEEA'));
assertEquals('"___\\udeeb"', JSON.stringify('___\uDEEB'));
assertEquals('"___\\udeec"', JSON.stringify('___\uDEEC'));
assertEquals('"___\\udeed"', JSON.stringify('___\uDEED'));
assertEquals('"___\\udeee"', JSON.stringify('___\uDEEE'));
assertEquals('"___\\udeef"', JSON.stringify('___\uDEEF'));
assertEquals('"___\\udef0"', JSON.stringify('___\uDEF0'));
assertEquals('"___\\udef1"', JSON.stringify('___\uDEF1'));
assertEquals('"___\\udef2"', JSON.stringify('___\uDEF2'));
assertEquals('"___\\udef3"', JSON.stringify('___\uDEF3'));
assertEquals('"___\\udef4"', JSON.stringify('___\uDEF4'));
assertEquals('"___\\udef5"', JSON.stringify('___\uDEF5'));
assertEquals('"___\\udef6"', JSON.stringify('___\uDEF6'));
assertEquals('"___\\udef7"', JSON.stringify('___\uDEF7'));
assertEquals('"___\\udef8"', JSON.stringify('___\uDEF8'));
assertEquals('"___\\udef9"', JSON.stringify('___\uDEF9'));
assertEquals('"___\\udefa"', JSON.stringify('___\uDEFA'));
assertEquals('"___\\udefb"', JSON.stringify('___\uDEFB'));
assertEquals('"___\\udefc"', JSON.stringify('___\uDEFC'));
assertEquals('"___\\udefd"', JSON.stringify('___\uDEFD'));
assertEquals('"___\\udefe"', JSON.stringify('___\uDEFE'));
assertEquals('"___\\udeff"', JSON.stringify('___\uDEFF'));
assertEquals('"___\\udf00"', JSON.stringify('___\uDF00'));
assertEquals('"___\\udf01"', JSON.stringify('___\uDF01'));
assertEquals('"___\\udf02"', JSON.stringify('___\uDF02'));
assertEquals('"___\\udf03"', JSON.stringify('___\uDF03'));
assertEquals('"___\\udf04"', JSON.stringify('___\uDF04'));
assertEquals('"___\\udf05"', JSON.stringify('___\uDF05'));
assertEquals('"___\\udf06"', JSON.stringify('___\uDF06'));
assertEquals('"___\\udf07"', JSON.stringify('___\uDF07'));
assertEquals('"___\\udf08"', JSON.stringify('___\uDF08'));
assertEquals('"___\\udf09"', JSON.stringify('___\uDF09'));
assertEquals('"___\\udf0a"', JSON.stringify('___\uDF0A'));
assertEquals('"___\\udf0b"', JSON.stringify('___\uDF0B'));
assertEquals('"___\\udf0c"', JSON.stringify('___\uDF0C'));
assertEquals('"___\\udf0d"', JSON.stringify('___\uDF0D'));
assertEquals('"___\\udf0e"', JSON.stringify('___\uDF0E'));
assertEquals('"___\\udf0f"', JSON.stringify('___\uDF0F'));
assertEquals('"___\\udf10"', JSON.stringify('___\uDF10'));
assertEquals('"___\\udf11"', JSON.stringify('___\uDF11'));
assertEquals('"___\\udf12"', JSON.stringify('___\uDF12'));
assertEquals('"___\\udf13"', JSON.stringify('___\uDF13'));
assertEquals('"___\\udf14"', JSON.stringify('___\uDF14'));
assertEquals('"___\\udf15"', JSON.stringify('___\uDF15'));
assertEquals('"___\\udf16"', JSON.stringify('___\uDF16'));
assertEquals('"___\\udf17"', JSON.stringify('___\uDF17'));
assertEquals('"___\\udf18"', JSON.stringify('___\uDF18'));
assertEquals('"___\\udf19"', JSON.stringify('___\uDF19'));
assertEquals('"___\\udf1a"', JSON.stringify('___\uDF1A'));
assertEquals('"___\\udf1b"', JSON.stringify('___\uDF1B'));
assertEquals('"___\\udf1c"', JSON.stringify('___\uDF1C'));
assertEquals('"___\\udf1d"', JSON.stringify('___\uDF1D'));
assertEquals('"___\\udf1e"', JSON.stringify('___\uDF1E'));
assertEquals('"___\\udf1f"', JSON.stringify('___\uDF1F'));
assertEquals('"___\\udf20"', JSON.stringify('___\uDF20'));
assertEquals('"___\\udf21"', JSON.stringify('___\uDF21'));
assertEquals('"___\\udf22"', JSON.stringify('___\uDF22'));
assertEquals('"___\\udf23"', JSON.stringify('___\uDF23'));
assertEquals('"___\\udf24"', JSON.stringify('___\uDF24'));
assertEquals('"___\\udf25"', JSON.stringify('___\uDF25'));
assertEquals('"___\\udf26"', JSON.stringify('___\uDF26'));
assertEquals('"___\\udf27"', JSON.stringify('___\uDF27'));
assertEquals('"___\\udf28"', JSON.stringify('___\uDF28'));
assertEquals('"___\\udf29"', JSON.stringify('___\uDF29'));
assertEquals('"___\\udf2a"', JSON.stringify('___\uDF2A'));
assertEquals('"___\\udf2b"', JSON.stringify('___\uDF2B'));
assertEquals('"___\\udf2c"', JSON.stringify('___\uDF2C'));
assertEquals('"___\\udf2d"', JSON.stringify('___\uDF2D'));
assertEquals('"___\\udf2e"', JSON.stringify('___\uDF2E'));
assertEquals('"___\\udf2f"', JSON.stringify('___\uDF2F'));
assertEquals('"___\\udf30"', JSON.stringify('___\uDF30'));
assertEquals('"___\\udf31"', JSON.stringify('___\uDF31'));
assertEquals('"___\\udf32"', JSON.stringify('___\uDF32'));
assertEquals('"___\\udf33"', JSON.stringify('___\uDF33'));
assertEquals('"___\\udf34"', JSON.stringify('___\uDF34'));
assertEquals('"___\\udf35"', JSON.stringify('___\uDF35'));
assertEquals('"___\\udf36"', JSON.stringify('___\uDF36'));
assertEquals('"___\\udf37"', JSON.stringify('___\uDF37'));
assertEquals('"___\\udf38"', JSON.stringify('___\uDF38'));
assertEquals('"___\\udf39"', JSON.stringify('___\uDF39'));
assertEquals('"___\\udf3a"', JSON.stringify('___\uDF3A'));
assertEquals('"___\\udf3b"', JSON.stringify('___\uDF3B'));
assertEquals('"___\\udf3c"', JSON.stringify('___\uDF3C'));
assertEquals('"___\\udf3d"', JSON.stringify('___\uDF3D'));
assertEquals('"___\\udf3e"', JSON.stringify('___\uDF3E'));
assertEquals('"___\\udf3f"', JSON.stringify('___\uDF3F'));
assertEquals('"___\\udf40"', JSON.stringify('___\uDF40'));
assertEquals('"___\\udf41"', JSON.stringify('___\uDF41'));
assertEquals('"___\\udf42"', JSON.stringify('___\uDF42'));
assertEquals('"___\\udf43"', JSON.stringify('___\uDF43'));
assertEquals('"___\\udf44"', JSON.stringify('___\uDF44'));
assertEquals('"___\\udf45"', JSON.stringify('___\uDF45'));
assertEquals('"___\\udf46"', JSON.stringify('___\uDF46'));
assertEquals('"___\\udf47"', JSON.stringify('___\uDF47'));
assertEquals('"___\\udf48"', JSON.stringify('___\uDF48'));
assertEquals('"___\\udf49"', JSON.stringify('___\uDF49'));
assertEquals('"___\\udf4a"', JSON.stringify('___\uDF4A'));
assertEquals('"___\\udf4b"', JSON.stringify('___\uDF4B'));
assertEquals('"___\\udf4c"', JSON.stringify('___\uDF4C'));
assertEquals('"___\\udf4d"', JSON.stringify('___\uDF4D'));
assertEquals('"___\\udf4e"', JSON.stringify('___\uDF4E'));
assertEquals('"___\\udf4f"', JSON.stringify('___\uDF4F'));
assertEquals('"___\\udf50"', JSON.stringify('___\uDF50'));
assertEquals('"___\\udf51"', JSON.stringify('___\uDF51'));
assertEquals('"___\\udf52"', JSON.stringify('___\uDF52'));
assertEquals('"___\\udf53"', JSON.stringify('___\uDF53'));
assertEquals('"___\\udf54"', JSON.stringify('___\uDF54'));
assertEquals('"___\\udf55"', JSON.stringify('___\uDF55'));
assertEquals('"___\\udf56"', JSON.stringify('___\uDF56'));
assertEquals('"___\\udf57"', JSON.stringify('___\uDF57'));
assertEquals('"___\\udf58"', JSON.stringify('___\uDF58'));
assertEquals('"___\\udf59"', JSON.stringify('___\uDF59'));
assertEquals('"___\\udf5a"', JSON.stringify('___\uDF5A'));
assertEquals('"___\\udf5b"', JSON.stringify('___\uDF5B'));
assertEquals('"___\\udf5c"', JSON.stringify('___\uDF5C'));
assertEquals('"___\\udf5d"', JSON.stringify('___\uDF5D'));
assertEquals('"___\\udf5e"', JSON.stringify('___\uDF5E'));
assertEquals('"___\\udf5f"', JSON.stringify('___\uDF5F'));
assertEquals('"___\\udf60"', JSON.stringify('___\uDF60'));
assertEquals('"___\\udf61"', JSON.stringify('___\uDF61'));
assertEquals('"___\\udf62"', JSON.stringify('___\uDF62'));
assertEquals('"___\\udf63"', JSON.stringify('___\uDF63'));
assertEquals('"___\\udf64"', JSON.stringify('___\uDF64'));
assertEquals('"___\\udf65"', JSON.stringify('___\uDF65'));
assertEquals('"___\\udf66"', JSON.stringify('___\uDF66'));
assertEquals('"___\\udf67"', JSON.stringify('___\uDF67'));
assertEquals('"___\\udf68"', JSON.stringify('___\uDF68'));
assertEquals('"___\\udf69"', JSON.stringify('___\uDF69'));
assertEquals('"___\\udf6a"', JSON.stringify('___\uDF6A'));
assertEquals('"___\\udf6b"', JSON.stringify('___\uDF6B'));
assertEquals('"___\\udf6c"', JSON.stringify('___\uDF6C'));
assertEquals('"___\\udf6d"', JSON.stringify('___\uDF6D'));
assertEquals('"___\\udf6e"', JSON.stringify('___\uDF6E'));
assertEquals('"___\\udf6f"', JSON.stringify('___\uDF6F'));
assertEquals('"___\\udf70"', JSON.stringify('___\uDF70'));
assertEquals('"___\\udf71"', JSON.stringify('___\uDF71'));
assertEquals('"___\\udf72"', JSON.stringify('___\uDF72'));
assertEquals('"___\\udf73"', JSON.stringify('___\uDF73'));
assertEquals('"___\\udf74"', JSON.stringify('___\uDF74'));
assertEquals('"___\\udf75"', JSON.stringify('___\uDF75'));
assertEquals('"___\\udf76"', JSON.stringify('___\uDF76'));
assertEquals('"___\\udf77"', JSON.stringify('___\uDF77'));
assertEquals('"___\\udf78"', JSON.stringify('___\uDF78'));
assertEquals('"___\\udf79"', JSON.stringify('___\uDF79'));
assertEquals('"___\\udf7a"', JSON.stringify('___\uDF7A'));
assertEquals('"___\\udf7b"', JSON.stringify('___\uDF7B'));
assertEquals('"___\\udf7c"', JSON.stringify('___\uDF7C'));
assertEquals('"___\\udf7d"', JSON.stringify('___\uDF7D'));
assertEquals('"___\\udf7e"', JSON.stringify('___\uDF7E'));
assertEquals('"___\\udf7f"', JSON.stringify('___\uDF7F'));
assertEquals('"___\\udf80"', JSON.stringify('___\uDF80'));
assertEquals('"___\\udf81"', JSON.stringify('___\uDF81'));
assertEquals('"___\\udf82"', JSON.stringify('___\uDF82'));
assertEquals('"___\\udf83"', JSON.stringify('___\uDF83'));
assertEquals('"___\\udf84"', JSON.stringify('___\uDF84'));
assertEquals('"___\\udf85"', JSON.stringify('___\uDF85'));
assertEquals('"___\\udf86"', JSON.stringify('___\uDF86'));
assertEquals('"___\\udf87"', JSON.stringify('___\uDF87'));
assertEquals('"___\\udf88"', JSON.stringify('___\uDF88'));
assertEquals('"___\\udf89"', JSON.stringify('___\uDF89'));
assertEquals('"___\\udf8a"', JSON.stringify('___\uDF8A'));
assertEquals('"___\\udf8b"', JSON.stringify('___\uDF8B'));
assertEquals('"___\\udf8c"', JSON.stringify('___\uDF8C'));
assertEquals('"___\\udf8d"', JSON.stringify('___\uDF8D'));
assertEquals('"___\\udf8e"', JSON.stringify('___\uDF8E'));
assertEquals('"___\\udf8f"', JSON.stringify('___\uDF8F'));
assertEquals('"___\\udf90"', JSON.stringify('___\uDF90'));
assertEquals('"___\\udf91"', JSON.stringify('___\uDF91'));
assertEquals('"___\\udf92"', JSON.stringify('___\uDF92'));
assertEquals('"___\\udf93"', JSON.stringify('___\uDF93'));
assertEquals('"___\\udf94"', JSON.stringify('___\uDF94'));
assertEquals('"___\\udf95"', JSON.stringify('___\uDF95'));
assertEquals('"___\\udf96"', JSON.stringify('___\uDF96'));
assertEquals('"___\\udf97"', JSON.stringify('___\uDF97'));
assertEquals('"___\\udf98"', JSON.stringify('___\uDF98'));
assertEquals('"___\\udf99"', JSON.stringify('___\uDF99'));
assertEquals('"___\\udf9a"', JSON.stringify('___\uDF9A'));
assertEquals('"___\\udf9b"', JSON.stringify('___\uDF9B'));
assertEquals('"___\\udf9c"', JSON.stringify('___\uDF9C'));
assertEquals('"___\\udf9d"', JSON.stringify('___\uDF9D'));
assertEquals('"___\\udf9e"', JSON.stringify('___\uDF9E'));
assertEquals('"___\\udf9f"', JSON.stringify('___\uDF9F'));
assertEquals('"___\\udfa0"', JSON.stringify('___\uDFA0'));
assertEquals('"___\\udfa1"', JSON.stringify('___\uDFA1'));
assertEquals('"___\\udfa2"', JSON.stringify('___\uDFA2'));
assertEquals('"___\\udfa3"', JSON.stringify('___\uDFA3'));
assertEquals('"___\\udfa4"', JSON.stringify('___\uDFA4'));
assertEquals('"___\\udfa5"', JSON.stringify('___\uDFA5'));
assertEquals('"___\\udfa6"', JSON.stringify('___\uDFA6'));
assertEquals('"___\\udfa7"', JSON.stringify('___\uDFA7'));
assertEquals('"___\\udfa8"', JSON.stringify('___\uDFA8'));
assertEquals('"___\\udfa9"', JSON.stringify('___\uDFA9'));
assertEquals('"___\\udfaa"', JSON.stringify('___\uDFAA'));
assertEquals('"___\\udfab"', JSON.stringify('___\uDFAB'));
assertEquals('"___\\udfac"', JSON.stringify('___\uDFAC'));
assertEquals('"___\\udfad"', JSON.stringify('___\uDFAD'));
assertEquals('"___\\udfae"', JSON.stringify('___\uDFAE'));
assertEquals('"___\\udfaf"', JSON.stringify('___\uDFAF'));
assertEquals('"___\\udfb0"', JSON.stringify('___\uDFB0'));
assertEquals('"___\\udfb1"', JSON.stringify('___\uDFB1'));
assertEquals('"___\\udfb2"', JSON.stringify('___\uDFB2'));
assertEquals('"___\\udfb3"', JSON.stringify('___\uDFB3'));
assertEquals('"___\\udfb4"', JSON.stringify('___\uDFB4'));
assertEquals('"___\\udfb5"', JSON.stringify('___\uDFB5'));
assertEquals('"___\\udfb6"', JSON.stringify('___\uDFB6'));
assertEquals('"___\\udfb7"', JSON.stringify('___\uDFB7'));
assertEquals('"___\\udfb8"', JSON.stringify('___\uDFB8'));
assertEquals('"___\\udfb9"', JSON.stringify('___\uDFB9'));
assertEquals('"___\\udfba"', JSON.stringify('___\uDFBA'));
assertEquals('"___\\udfbb"', JSON.stringify('___\uDFBB'));
assertEquals('"___\\udfbc"', JSON.stringify('___\uDFBC'));
assertEquals('"___\\udfbd"', JSON.stringify('___\uDFBD'));
assertEquals('"___\\udfbe"', JSON.stringify('___\uDFBE'));
assertEquals('"___\\udfbf"', JSON.stringify('___\uDFBF'));
assertEquals('"___\\udfc0"', JSON.stringify('___\uDFC0'));
assertEquals('"___\\udfc1"', JSON.stringify('___\uDFC1'));
assertEquals('"___\\udfc2"', JSON.stringify('___\uDFC2'));
assertEquals('"___\\udfc3"', JSON.stringify('___\uDFC3'));
assertEquals('"___\\udfc4"', JSON.stringify('___\uDFC4'));
assertEquals('"___\\udfc5"', JSON.stringify('___\uDFC5'));
assertEquals('"___\\udfc6"', JSON.stringify('___\uDFC6'));
assertEquals('"___\\udfc7"', JSON.stringify('___\uDFC7'));
assertEquals('"___\\udfc8"', JSON.stringify('___\uDFC8'));
assertEquals('"___\\udfc9"', JSON.stringify('___\uDFC9'));
assertEquals('"___\\udfca"', JSON.stringify('___\uDFCA'));
assertEquals('"___\\udfcb"', JSON.stringify('___\uDFCB'));
assertEquals('"___\\udfcc"', JSON.stringify('___\uDFCC'));
assertEquals('"___\\udfcd"', JSON.stringify('___\uDFCD'));
assertEquals('"___\\udfce"', JSON.stringify('___\uDFCE'));
assertEquals('"___\\udfcf"', JSON.stringify('___\uDFCF'));
assertEquals('"___\\udfd0"', JSON.stringify('___\uDFD0'));
assertEquals('"___\\udfd1"', JSON.stringify('___\uDFD1'));
assertEquals('"___\\udfd2"', JSON.stringify('___\uDFD2'));
assertEquals('"___\\udfd3"', JSON.stringify('___\uDFD3'));
assertEquals('"___\\udfd4"', JSON.stringify('___\uDFD4'));
assertEquals('"___\\udfd5"', JSON.stringify('___\uDFD5'));
assertEquals('"___\\udfd6"', JSON.stringify('___\uDFD6'));
assertEquals('"___\\udfd7"', JSON.stringify('___\uDFD7'));
assertEquals('"___\\udfd8"', JSON.stringify('___\uDFD8'));
assertEquals('"___\\udfd9"', JSON.stringify('___\uDFD9'));
assertEquals('"___\\udfda"', JSON.stringify('___\uDFDA'));
assertEquals('"___\\udfdb"', JSON.stringify('___\uDFDB'));
assertEquals('"___\\udfdc"', JSON.stringify('___\uDFDC'));
assertEquals('"___\\udfdd"', JSON.stringify('___\uDFDD'));
assertEquals('"___\\udfde"', JSON.stringify('___\uDFDE'));
assertEquals('"___\\udfdf"', JSON.stringify('___\uDFDF'));
assertEquals('"___\\udfe0"', JSON.stringify('___\uDFE0'));
assertEquals('"___\\udfe1"', JSON.stringify('___\uDFE1'));
assertEquals('"___\\udfe2"', JSON.stringify('___\uDFE2'));
assertEquals('"___\\udfe3"', JSON.stringify('___\uDFE3'));
assertEquals('"___\\udfe4"', JSON.stringify('___\uDFE4'));
assertEquals('"___\\udfe5"', JSON.stringify('___\uDFE5'));
assertEquals('"___\\udfe6"', JSON.stringify('___\uDFE6'));
assertEquals('"___\\udfe7"', JSON.stringify('___\uDFE7'));
assertEquals('"___\\udfe8"', JSON.stringify('___\uDFE8'));
assertEquals('"___\\udfe9"', JSON.stringify('___\uDFE9'));
assertEquals('"___\\udfea"', JSON.stringify('___\uDFEA'));
assertEquals('"___\\udfeb"', JSON.stringify('___\uDFEB'));
assertEquals('"___\\udfec"', JSON.stringify('___\uDFEC'));
assertEquals('"___\\udfed"', JSON.stringify('___\uDFED'));
assertEquals('"___\\udfee"', JSON.stringify('___\uDFEE'));
assertEquals('"___\\udfef"', JSON.stringify('___\uDFEF'));
assertEquals('"___\\udff0"', JSON.stringify('___\uDFF0'));
assertEquals('"___\\udff1"', JSON.stringify('___\uDFF1'));
assertEquals('"___\\udff2"', JSON.stringify('___\uDFF2'));
assertEquals('"___\\udff3"', JSON.stringify('___\uDFF3'));
assertEquals('"___\\udff4"', JSON.stringify('___\uDFF4'));
assertEquals('"___\\udff5"', JSON.stringify('___\uDFF5'));
assertEquals('"___\\udff6"', JSON.stringify('___\uDFF6'));
assertEquals('"___\\udff7"', JSON.stringify('___\uDFF7'));
assertEquals('"___\\udff8"', JSON.stringify('___\uDFF8'));
assertEquals('"___\\udff9"', JSON.stringify('___\uDFF9'));
assertEquals('"___\\udffa"', JSON.stringify('___\uDFFA'));
assertEquals('"___\\udffb"', JSON.stringify('___\uDFFB'));
assertEquals('"___\\udffc"', JSON.stringify('___\uDFFC'));
assertEquals('"___\\udffd"', JSON.stringify('___\uDFFD'));
assertEquals('"___\\udffe"', JSON.stringify('___\uDFFE'));
assertEquals('"___\\udfff"', JSON.stringify('___\uDFFF'));

// A random selection of code points from U+E000 to U+FFFF.
assertEquals('"___\uE000"', JSON.stringify('___\uE000'));
assertEquals('"___\uE00B"', JSON.stringify('___\uE00B'));
assertEquals('"___\uE0CC"', JSON.stringify('___\uE0CC'));
assertEquals('"___\uE0FD"', JSON.stringify('___\uE0FD'));
assertEquals('"___\uE19E"', JSON.stringify('___\uE19E'));
assertEquals('"___\uE1B1"', JSON.stringify('___\uE1B1'));
assertEquals('"___\uE24F"', JSON.stringify('___\uE24F'));
assertEquals('"___\uE262"', JSON.stringify('___\uE262'));
assertEquals('"___\uE2C9"', JSON.stringify('___\uE2C9'));
assertEquals('"___\uE2DF"', JSON.stringify('___\uE2DF'));
assertEquals('"___\uE389"', JSON.stringify('___\uE389'));
assertEquals('"___\uE413"', JSON.stringify('___\uE413'));
assertEquals('"___\uE546"', JSON.stringify('___\uE546'));
assertEquals('"___\uE5E4"', JSON.stringify('___\uE5E4'));
assertEquals('"___\uE66B"', JSON.stringify('___\uE66B'));
assertEquals('"___\uE73D"', JSON.stringify('___\uE73D'));
assertEquals('"___\uE74F"', JSON.stringify('___\uE74F'));
assertEquals('"___\uE759"', JSON.stringify('___\uE759'));
assertEquals('"___\uE795"', JSON.stringify('___\uE795'));
assertEquals('"___\uE836"', JSON.stringify('___\uE836'));
assertEquals('"___\uE85D"', JSON.stringify('___\uE85D'));
assertEquals('"___\uE909"', JSON.stringify('___\uE909'));
assertEquals('"___\uE990"', JSON.stringify('___\uE990'));
assertEquals('"___\uE99F"', JSON.stringify('___\uE99F'));
assertEquals('"___\uE9AC"', JSON.stringify('___\uE9AC'));
assertEquals('"___\uE9C2"', JSON.stringify('___\uE9C2'));
assertEquals('"___\uEB11"', JSON.stringify('___\uEB11'));
assertEquals('"___\uED33"', JSON.stringify('___\uED33'));
assertEquals('"___\uED7D"', JSON.stringify('___\uED7D'));
assertEquals('"___\uEDA9"', JSON.stringify('___\uEDA9'));
assertEquals('"___\uEDFB"', JSON.stringify('___\uEDFB'));
assertEquals('"___\uEE09"', JSON.stringify('___\uEE09'));
assertEquals('"___\uEE0D"', JSON.stringify('___\uEE0D'));
assertEquals('"___\uEE34"', JSON.stringify('___\uEE34'));
assertEquals('"___\uEE37"', JSON.stringify('___\uEE37'));
assertEquals('"___\uEE38"', JSON.stringify('___\uEE38'));
assertEquals('"___\uEF80"', JSON.stringify('___\uEF80'));
assertEquals('"___\uEFE2"', JSON.stringify('___\uEFE2'));
assertEquals('"___\uF02C"', JSON.stringify('___\uF02C'));
assertEquals('"___\uF09A"', JSON.stringify('___\uF09A'));
assertEquals('"___\uF0C1"', JSON.stringify('___\uF0C1'));
assertEquals('"___\uF12C"', JSON.stringify('___\uF12C'));
assertEquals('"___\uF250"', JSON.stringify('___\uF250'));
assertEquals('"___\uF2A3"', JSON.stringify('___\uF2A3'));
assertEquals('"___\uF340"', JSON.stringify('___\uF340'));
assertEquals('"___\uF3C9"', JSON.stringify('___\uF3C9'));
assertEquals('"___\uF3F5"', JSON.stringify('___\uF3F5'));
assertEquals('"___\uF41B"', JSON.stringify('___\uF41B'));
assertEquals('"___\uF420"', JSON.stringify('___\uF420'));
assertEquals('"___\uF440"', JSON.stringify('___\uF440'));
assertEquals('"___\uF4AE"', JSON.stringify('___\uF4AE'));
assertEquals('"___\uF4B0"', JSON.stringify('___\uF4B0'));
assertEquals('"___\uF50D"', JSON.stringify('___\uF50D'));
assertEquals('"___\uF55D"', JSON.stringify('___\uF55D'));
assertEquals('"___\uF55E"', JSON.stringify('___\uF55E'));
assertEquals('"___\uF5CD"', JSON.stringify('___\uF5CD'));
assertEquals('"___\uF657"', JSON.stringify('___\uF657'));
assertEquals('"___\uF66D"', JSON.stringify('___\uF66D'));
assertEquals('"___\uF68F"', JSON.stringify('___\uF68F'));
assertEquals('"___\uF6A6"', JSON.stringify('___\uF6A6'));
assertEquals('"___\uF6AA"', JSON.stringify('___\uF6AA'));
assertEquals('"___\uF6EB"', JSON.stringify('___\uF6EB'));
assertEquals('"___\uF79A"', JSON.stringify('___\uF79A'));
assertEquals('"___\uF7E7"', JSON.stringify('___\uF7E7'));
assertEquals('"___\uF7E8"', JSON.stringify('___\uF7E8'));
assertEquals('"___\uF834"', JSON.stringify('___\uF834'));
assertEquals('"___\uF88B"', JSON.stringify('___\uF88B'));
assertEquals('"___\uF8D5"', JSON.stringify('___\uF8D5'));
assertEquals('"___\uF8F1"', JSON.stringify('___\uF8F1'));
assertEquals('"___\uF905"', JSON.stringify('___\uF905'));
assertEquals('"___\uF927"', JSON.stringify('___\uF927'));
assertEquals('"___\uF943"', JSON.stringify('___\uF943'));
assertEquals('"___\uF949"', JSON.stringify('___\uF949'));
assertEquals('"___\uF9A1"', JSON.stringify('___\uF9A1'));
assertEquals('"___\uF9C7"', JSON.stringify('___\uF9C7'));
assertEquals('"___\uFA0F"', JSON.stringify('___\uFA0F'));
assertEquals('"___\uFA20"', JSON.stringify('___\uFA20'));
assertEquals('"___\uFAA7"', JSON.stringify('___\uFAA7'));
assertEquals('"___\uFBCD"', JSON.stringify('___\uFBCD'));
assertEquals('"___\uFBF7"', JSON.stringify('___\uFBF7'));
assertEquals('"___\uFC40"', JSON.stringify('___\uFC40'));
assertEquals('"___\uFC4B"', JSON.stringify('___\uFC4B'));
assertEquals('"___\uFC51"', JSON.stringify('___\uFC51'));
assertEquals('"___\uFC5E"', JSON.stringify('___\uFC5E'));
assertEquals('"___\uFC67"', JSON.stringify('___\uFC67'));
assertEquals('"___\uFC8B"', JSON.stringify('___\uFC8B'));
assertEquals('"___\uFE32"', JSON.stringify('___\uFE32'));
assertEquals('"___\uFFC4"', JSON.stringify('___\uFFC4'));
assertEquals('"___\uFFFD"', JSON.stringify('___\uFFFD'));
assertEquals('"___\uFFFE"', JSON.stringify('___\uFFFE'));
assertEquals('"___\uFFFF"', JSON.stringify('___\uFFFF'));

// A random selection of astral symbols, i.e. surrogate pairs, i.e.
// code points from U+010000 to U+10FFFF.
assertEquals('"___\u{10000}"', JSON.stringify('___\u{10000}'));
assertEquals('"___\u{11DE7}"', JSON.stringify('___\u{11DE7}'));
assertEquals('"___\u{15997}"', JSON.stringify('___\u{15997}'));
assertEquals('"___\u{187B0}"', JSON.stringify('___\u{187B0}'));
assertEquals('"___\u{190B2}"', JSON.stringify('___\u{190B2}'));
assertEquals('"___\u{1BF79}"', JSON.stringify('___\u{1BF79}'));
assertEquals('"___\u{1C624}"', JSON.stringify('___\u{1C624}'));
assertEquals('"___\u{1D9F4}"', JSON.stringify('___\u{1D9F4}'));
assertEquals('"___\u{24149}"', JSON.stringify('___\u{24149}'));
assertEquals('"___\u{2521C}"', JSON.stringify('___\u{2521C}'));
assertEquals('"___\u{2762D}"', JSON.stringify('___\u{2762D}'));
assertEquals('"___\u{2930B}"', JSON.stringify('___\u{2930B}'));
assertEquals('"___\u{29EC4}"', JSON.stringify('___\u{29EC4}'));
assertEquals('"___\u{29F9A}"', JSON.stringify('___\u{29F9A}'));
assertEquals('"___\u{2A27D}"', JSON.stringify('___\u{2A27D}'));
assertEquals('"___\u{2B363}"', JSON.stringify('___\u{2B363}'));
assertEquals('"___\u{2C037}"', JSON.stringify('___\u{2C037}'));
assertEquals('"___\u{2FAE0}"', JSON.stringify('___\u{2FAE0}'));
assertEquals('"___\u{2FFCF}"', JSON.stringify('___\u{2FFCF}'));
assertEquals('"___\u{32C1C}"', JSON.stringify('___\u{32C1C}'));
assertEquals('"___\u{33DA8}"', JSON.stringify('___\u{33DA8}'));
assertEquals('"___\u{3DCA4}"', JSON.stringify('___\u{3DCA4}'));
assertEquals('"___\u{44FA0}"', JSON.stringify('___\u{44FA0}'));
assertEquals('"___\u{45618}"', JSON.stringify('___\u{45618}'));
assertEquals('"___\u{47395}"', JSON.stringify('___\u{47395}'));
assertEquals('"___\u{4752C}"', JSON.stringify('___\u{4752C}'));
assertEquals('"___\u{483FE}"', JSON.stringify('___\u{483FE}'));
assertEquals('"___\u{49D35}"', JSON.stringify('___\u{49D35}'));
assertEquals('"___\u{4CE3B}"', JSON.stringify('___\u{4CE3B}'));
assertEquals('"___\u{55196}"', JSON.stringify('___\u{55196}'));
assertEquals('"___\u{58B3E}"', JSON.stringify('___\u{58B3E}'));
assertEquals('"___\u{5AA47}"', JSON.stringify('___\u{5AA47}'));
assertEquals('"___\u{5C4B8}"', JSON.stringify('___\u{5C4B8}'));
assertEquals('"___\u{5DD1B}"', JSON.stringify('___\u{5DD1B}'));
assertEquals('"___\u{5FDCB}"', JSON.stringify('___\u{5FDCB}'));
assertEquals('"___\u{611BA}"', JSON.stringify('___\u{611BA}'));
assertEquals('"___\u{66433}"', JSON.stringify('___\u{66433}'));
assertEquals('"___\u{690D7}"', JSON.stringify('___\u{690D7}'));
assertEquals('"___\u{6F617}"', JSON.stringify('___\u{6F617}'));
assertEquals('"___\u{711E4}"', JSON.stringify('___\u{711E4}'));
assertEquals('"___\u{758D2}"', JSON.stringify('___\u{758D2}'));
assertEquals('"___\u{780AC}"', JSON.stringify('___\u{780AC}'));
assertEquals('"___\u{7AE5F}"', JSON.stringify('___\u{7AE5F}'));
assertEquals('"___\u{7C2FB}"', JSON.stringify('___\u{7C2FB}'));
assertEquals('"___\u{7D25F}"', JSON.stringify('___\u{7D25F}'));
assertEquals('"___\u{8027A}"', JSON.stringify('___\u{8027A}'));
assertEquals('"___\u{84817}"', JSON.stringify('___\u{84817}'));
assertEquals('"___\u{8B070}"', JSON.stringify('___\u{8B070}'));
assertEquals('"___\u{8B390}"', JSON.stringify('___\u{8B390}'));
assertEquals('"___\u{8BC03}"', JSON.stringify('___\u{8BC03}'));
assertEquals('"___\u{8BE63}"', JSON.stringify('___\u{8BE63}'));
assertEquals('"___\u{8F12A}"', JSON.stringify('___\u{8F12A}'));
assertEquals('"___\u{9345D}"', JSON.stringify('___\u{9345D}'));
assertEquals('"___\u{937A9}"', JSON.stringify('___\u{937A9}'));
assertEquals('"___\u{94596}"', JSON.stringify('___\u{94596}'));
assertEquals('"___\u{967BB}"', JSON.stringify('___\u{967BB}'));
assertEquals('"___\u{A19D1}"', JSON.stringify('___\u{A19D1}'));
assertEquals('"___\u{A4FC5}"', JSON.stringify('___\u{A4FC5}'));
assertEquals('"___\u{AC9CF}"', JSON.stringify('___\u{AC9CF}'));
assertEquals('"___\u{B1366}"', JSON.stringify('___\u{B1366}'));
assertEquals('"___\u{B3D32}"', JSON.stringify('___\u{B3D32}'));
assertEquals('"___\u{B74BA}"', JSON.stringify('___\u{B74BA}'));
assertEquals('"___\u{B8FB0}"', JSON.stringify('___\u{B8FB0}'));
assertEquals('"___\u{BA0A5}"', JSON.stringify('___\u{BA0A5}'));
assertEquals('"___\u{BB48E}"', JSON.stringify('___\u{BB48E}'));
assertEquals('"___\u{C0B60}"', JSON.stringify('___\u{C0B60}'));
assertEquals('"___\u{C2D34}"', JSON.stringify('___\u{C2D34}'));
assertEquals('"___\u{C6C75}"', JSON.stringify('___\u{C6C75}'));
assertEquals('"___\u{C9F26}"', JSON.stringify('___\u{C9F26}'));
assertEquals('"___\u{CDBD0}"', JSON.stringify('___\u{CDBD0}'));
assertEquals('"___\u{D1E28}"', JSON.stringify('___\u{D1E28}'));
assertEquals('"___\u{D4A80}"', JSON.stringify('___\u{D4A80}'));
assertEquals('"___\u{D947F}"', JSON.stringify('___\u{D947F}'));
assertEquals('"___\u{D9B8A}"', JSON.stringify('___\u{D9B8A}'));
assertEquals('"___\u{DA203}"', JSON.stringify('___\u{DA203}'));
assertEquals('"___\u{DEFD3}"', JSON.stringify('___\u{DEFD3}'));
assertEquals('"___\u{E4F7C}"', JSON.stringify('___\u{E4F7C}'));
assertEquals('"___\u{E6BB3}"', JSON.stringify('___\u{E6BB3}'));
assertEquals('"___\u{E972D}"', JSON.stringify('___\u{E972D}'));
assertEquals('"___\u{EB335}"', JSON.stringify('___\u{EB335}'));
assertEquals('"___\u{ED3F8}"', JSON.stringify('___\u{ED3F8}'));
assertEquals('"___\u{ED940}"', JSON.stringify('___\u{ED940}'));
assertEquals('"___\u{EF6F8}"', JSON.stringify('___\u{EF6F8}'));
assertEquals('"___\u{F1F57}"', JSON.stringify('___\u{F1F57}'));
assertEquals('"___\u{F33B5}"', JSON.stringify('___\u{F33B5}'));
assertEquals('"___\u{F4D2A}"', JSON.stringify('___\u{F4D2A}'));
assertEquals('"___\u{F70BA}"', JSON.stringify('___\u{F70BA}'));
assertEquals('"___\u{F899F}"', JSON.stringify('___\u{F899F}'));
assertEquals('"___\u{1034BF}"', JSON.stringify('___\u{1034BF}'));
assertEquals('"___\u{107ACF}"', JSON.stringify('___\u{107ACF}'));
assertEquals('"___\u{10881F}"', JSON.stringify('___\u{10881F}'));
assertEquals('"___\u{1098A5}"', JSON.stringify('___\u{1098A5}'));
assertEquals('"___\u{10ABD1}"', JSON.stringify('___\u{10ABD1}'));
assertEquals('"___\u{10B5C5}"', JSON.stringify('___\u{10B5C5}'));
assertEquals('"___\u{10CC79}"', JSON.stringify('___\u{10CC79}'));
assertEquals('"___\u{10CD19}"', JSON.stringify('___\u{10CD19}'));
assertEquals('"___\u{10FFFF}"', JSON.stringify('___\u{10FFFF}'));
