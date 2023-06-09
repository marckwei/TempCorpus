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
// JsonStringifier::SerializeStringUnchecked_.

// All code points from U+0000 to U+00FF.
assertEquals('"\\u0000"', JSON.stringify('\0'));
assertEquals('"\\u0001"', JSON.stringify('\x01'));
assertEquals('"\\u0002"', JSON.stringify('\x02'));
assertEquals('"\\u0003"', JSON.stringify('\x03'));
assertEquals('"\\u0004"', JSON.stringify('\x04'));
assertEquals('"\\u0005"', JSON.stringify('\x05'));
assertEquals('"\\u0006"', JSON.stringify('\x06'));
assertEquals('"\\u0007"', JSON.stringify('\x07'));
assertEquals('"\\b"', JSON.stringify('\b'));
assertEquals('"\\t"', JSON.stringify('\t'));
assertEquals('"\\n"', JSON.stringify('\n'));
assertEquals('"\\u000b"', JSON.stringify('\x0B'));
assertEquals('"\\f"', JSON.stringify('\f'));
assertEquals('"\\r"', JSON.stringify('\r'));
assertEquals('"\\u000e"', JSON.stringify('\x0E'));
assertEquals('"\\u000f"', JSON.stringify('\x0F'));
assertEquals('"\\u0010"', JSON.stringify('\x10'));
assertEquals('"\\u0011"', JSON.stringify('\x11'));
assertEquals('"\\u0012"', JSON.stringify('\x12'));
assertEquals('"\\u0013"', JSON.stringify('\x13'));
assertEquals('"\\u0014"', JSON.stringify('\x14'));
assertEquals('"\\u0015"', JSON.stringify('\x15'));
assertEquals('"\\u0016"', JSON.stringify('\x16'));
assertEquals('"\\u0017"', JSON.stringify('\x17'));
assertEquals('"\\u0018"', JSON.stringify('\x18'));
assertEquals('"\\u0019"', JSON.stringify('\x19'));
assertEquals('"\\u001a"', JSON.stringify('\x1A'));
assertEquals('"\\u001b"', JSON.stringify('\x1B'));
assertEquals('"\\u001c"', JSON.stringify('\x1C'));
assertEquals('"\\u001d"', JSON.stringify('\x1D'));
assertEquals('"\\u001e"', JSON.stringify('\x1E'));
assertEquals('"\\u001f"', JSON.stringify('\x1F'));
assertEquals('" "', JSON.stringify(' '));
assertEquals('"!"', JSON.stringify('!'));
assertEquals('"\\""', JSON.stringify('"'));
assertEquals('"#"', JSON.stringify('#'));
assertEquals('"$"', JSON.stringify('$'));
assertEquals('"%"', JSON.stringify('%'));
assertEquals('"&"', JSON.stringify('&'));
assertEquals('"\'"', JSON.stringify('\''));
assertEquals('"("', JSON.stringify('('));
assertEquals('")"', JSON.stringify(')'));
assertEquals('"*"', JSON.stringify('*'));
assertEquals('"+"', JSON.stringify('+'));
assertEquals('","', JSON.stringify(','));
assertEquals('"-"', JSON.stringify('-'));
assertEquals('"."', JSON.stringify('.'));
assertEquals('"/"', JSON.stringify('/'));
assertEquals('"0"', JSON.stringify('0'));
assertEquals('"1"', JSON.stringify('1'));
assertEquals('"2"', JSON.stringify('2'));
assertEquals('"3"', JSON.stringify('3'));
assertEquals('"4"', JSON.stringify('4'));
assertEquals('"5"', JSON.stringify('5'));
assertEquals('"6"', JSON.stringify('6'));
assertEquals('"7"', JSON.stringify('7'));
assertEquals('"8"', JSON.stringify('8'));
assertEquals('"9"', JSON.stringify('9'));
assertEquals('":"', JSON.stringify(':'));
assertEquals('";"', JSON.stringify(';'));
assertEquals('"<"', JSON.stringify('<'));
assertEquals('"="', JSON.stringify('='));
assertEquals('">"', JSON.stringify('>'));
assertEquals('"?"', JSON.stringify('?'));
assertEquals('"@"', JSON.stringify('@'));
assertEquals('"A"', JSON.stringify('A'));
assertEquals('"B"', JSON.stringify('B'));
assertEquals('"C"', JSON.stringify('C'));
assertEquals('"D"', JSON.stringify('D'));
assertEquals('"E"', JSON.stringify('E'));
assertEquals('"F"', JSON.stringify('F'));
assertEquals('"G"', JSON.stringify('G'));
assertEquals('"H"', JSON.stringify('H'));
assertEquals('"I"', JSON.stringify('I'));
assertEquals('"J"', JSON.stringify('J'));
assertEquals('"K"', JSON.stringify('K'));
assertEquals('"L"', JSON.stringify('L'));
assertEquals('"M"', JSON.stringify('M'));
assertEquals('"N"', JSON.stringify('N'));
assertEquals('"O"', JSON.stringify('O'));
assertEquals('"P"', JSON.stringify('P'));
assertEquals('"Q"', JSON.stringify('Q'));
assertEquals('"R"', JSON.stringify('R'));
assertEquals('"S"', JSON.stringify('S'));
assertEquals('"T"', JSON.stringify('T'));
assertEquals('"U"', JSON.stringify('U'));
assertEquals('"V"', JSON.stringify('V'));
assertEquals('"W"', JSON.stringify('W'));
assertEquals('"X"', JSON.stringify('X'));
assertEquals('"Y"', JSON.stringify('Y'));
assertEquals('"Z"', JSON.stringify('Z'));
assertEquals('"["', JSON.stringify('['));
assertEquals('"\\\\"', JSON.stringify('\\'));
assertEquals('"]"', JSON.stringify(']'));
assertEquals('"^"', JSON.stringify('^'));
assertEquals('"_"', JSON.stringify('_'));
assertEquals('"`"', JSON.stringify('`'));
assertEquals('"a"', JSON.stringify('a'));
assertEquals('"b"', JSON.stringify('b'));
assertEquals('"c"', JSON.stringify('c'));
assertEquals('"d"', JSON.stringify('d'));
assertEquals('"e"', JSON.stringify('e'));
assertEquals('"f"', JSON.stringify('f'));
assertEquals('"g"', JSON.stringify('g'));
assertEquals('"h"', JSON.stringify('h'));
assertEquals('"i"', JSON.stringify('i'));
assertEquals('"j"', JSON.stringify('j'));
assertEquals('"k"', JSON.stringify('k'));
assertEquals('"l"', JSON.stringify('l'));
assertEquals('"m"', JSON.stringify('m'));
assertEquals('"n"', JSON.stringify('n'));
assertEquals('"o"', JSON.stringify('o'));
assertEquals('"p"', JSON.stringify('p'));
assertEquals('"q"', JSON.stringify('q'));
assertEquals('"r"', JSON.stringify('r'));
assertEquals('"s"', JSON.stringify('s'));
assertEquals('"t"', JSON.stringify('t'));
assertEquals('"u"', JSON.stringify('u'));
assertEquals('"v"', JSON.stringify('v'));
assertEquals('"w"', JSON.stringify('w'));
assertEquals('"x"', JSON.stringify('x'));
assertEquals('"y"', JSON.stringify('y'));
assertEquals('"z"', JSON.stringify('z'));
assertEquals('"{"', JSON.stringify('{'));
assertEquals('"|"', JSON.stringify('|'));
assertEquals('"}"', JSON.stringify('}'));
assertEquals('"~"', JSON.stringify('~'));
assertEquals('"\x7F"', JSON.stringify('\x7F'));
assertEquals('"\x80"', JSON.stringify('\x80'));
assertEquals('"\x81"', JSON.stringify('\x81'));
assertEquals('"\x82"', JSON.stringify('\x82'));
assertEquals('"\x83"', JSON.stringify('\x83'));
assertEquals('"\x84"', JSON.stringify('\x84'));
assertEquals('"\x85"', JSON.stringify('\x85'));
assertEquals('"\x86"', JSON.stringify('\x86'));
assertEquals('"\x87"', JSON.stringify('\x87'));
assertEquals('"\x88"', JSON.stringify('\x88'));
assertEquals('"\x89"', JSON.stringify('\x89'));
assertEquals('"\x8A"', JSON.stringify('\x8A'));
assertEquals('"\x8B"', JSON.stringify('\x8B'));
assertEquals('"\x8C"', JSON.stringify('\x8C'));
assertEquals('"\x8D"', JSON.stringify('\x8D'));
assertEquals('"\x8E"', JSON.stringify('\x8E'));
assertEquals('"\x8F"', JSON.stringify('\x8F'));
assertEquals('"\x90"', JSON.stringify('\x90'));
assertEquals('"\x91"', JSON.stringify('\x91'));
assertEquals('"\x92"', JSON.stringify('\x92'));
assertEquals('"\x93"', JSON.stringify('\x93'));
assertEquals('"\x94"', JSON.stringify('\x94'));
assertEquals('"\x95"', JSON.stringify('\x95'));
assertEquals('"\x96"', JSON.stringify('\x96'));
assertEquals('"\x97"', JSON.stringify('\x97'));
assertEquals('"\x98"', JSON.stringify('\x98'));
assertEquals('"\x99"', JSON.stringify('\x99'));
assertEquals('"\x9A"', JSON.stringify('\x9A'));
assertEquals('"\x9B"', JSON.stringify('\x9B'));
assertEquals('"\x9C"', JSON.stringify('\x9C'));
assertEquals('"\x9D"', JSON.stringify('\x9D'));
assertEquals('"\x9E"', JSON.stringify('\x9E'));
assertEquals('"\x9F"', JSON.stringify('\x9F'));
assertEquals('"\xA0"', JSON.stringify('\xA0'));
assertEquals('"\xA1"', JSON.stringify('\xA1'));
assertEquals('"\xA2"', JSON.stringify('\xA2'));
assertEquals('"\xA3"', JSON.stringify('\xA3'));
assertEquals('"\xA4"', JSON.stringify('\xA4'));
assertEquals('"\xA5"', JSON.stringify('\xA5'));
assertEquals('"\xA6"', JSON.stringify('\xA6'));
assertEquals('"\xA7"', JSON.stringify('\xA7'));
assertEquals('"\xA8"', JSON.stringify('\xA8'));
assertEquals('"\xA9"', JSON.stringify('\xA9'));
assertEquals('"\xAA"', JSON.stringify('\xAA'));
assertEquals('"\xAB"', JSON.stringify('\xAB'));
assertEquals('"\xAC"', JSON.stringify('\xAC'));
assertEquals('"\xAD"', JSON.stringify('\xAD'));
assertEquals('"\xAE"', JSON.stringify('\xAE'));
assertEquals('"\xAF"', JSON.stringify('\xAF'));
assertEquals('"\xB0"', JSON.stringify('\xB0'));
assertEquals('"\xB1"', JSON.stringify('\xB1'));
assertEquals('"\xB2"', JSON.stringify('\xB2'));
assertEquals('"\xB3"', JSON.stringify('\xB3'));
assertEquals('"\xB4"', JSON.stringify('\xB4'));
assertEquals('"\xB5"', JSON.stringify('\xB5'));
assertEquals('"\xB6"', JSON.stringify('\xB6'));
assertEquals('"\xB7"', JSON.stringify('\xB7'));
assertEquals('"\xB8"', JSON.stringify('\xB8'));
assertEquals('"\xB9"', JSON.stringify('\xB9'));
assertEquals('"\xBA"', JSON.stringify('\xBA'));
assertEquals('"\xBB"', JSON.stringify('\xBB'));
assertEquals('"\xBC"', JSON.stringify('\xBC'));
assertEquals('"\xBD"', JSON.stringify('\xBD'));
assertEquals('"\xBE"', JSON.stringify('\xBE'));
assertEquals('"\xBF"', JSON.stringify('\xBF'));
assertEquals('"\xC0"', JSON.stringify('\xC0'));
assertEquals('"\xC1"', JSON.stringify('\xC1'));
assertEquals('"\xC2"', JSON.stringify('\xC2'));
assertEquals('"\xC3"', JSON.stringify('\xC3'));
assertEquals('"\xC4"', JSON.stringify('\xC4'));
assertEquals('"\xC5"', JSON.stringify('\xC5'));
assertEquals('"\xC6"', JSON.stringify('\xC6'));
assertEquals('"\xC7"', JSON.stringify('\xC7'));
assertEquals('"\xC8"', JSON.stringify('\xC8'));
assertEquals('"\xC9"', JSON.stringify('\xC9'));
assertEquals('"\xCA"', JSON.stringify('\xCA'));
assertEquals('"\xCB"', JSON.stringify('\xCB'));
assertEquals('"\xCC"', JSON.stringify('\xCC'));
assertEquals('"\xCD"', JSON.stringify('\xCD'));
assertEquals('"\xCE"', JSON.stringify('\xCE'));
assertEquals('"\xCF"', JSON.stringify('\xCF'));
assertEquals('"\xD0"', JSON.stringify('\xD0'));
assertEquals('"\xD1"', JSON.stringify('\xD1'));
assertEquals('"\xD2"', JSON.stringify('\xD2'));
assertEquals('"\xD3"', JSON.stringify('\xD3'));
assertEquals('"\xD4"', JSON.stringify('\xD4'));
assertEquals('"\xD5"', JSON.stringify('\xD5'));
assertEquals('"\xD6"', JSON.stringify('\xD6'));
assertEquals('"\xD7"', JSON.stringify('\xD7'));
assertEquals('"\xD8"', JSON.stringify('\xD8'));
assertEquals('"\xD9"', JSON.stringify('\xD9'));
assertEquals('"\xDA"', JSON.stringify('\xDA'));
assertEquals('"\xDB"', JSON.stringify('\xDB'));
assertEquals('"\xDC"', JSON.stringify('\xDC'));
assertEquals('"\xDD"', JSON.stringify('\xDD'));
assertEquals('"\xDE"', JSON.stringify('\xDE'));
assertEquals('"\xDF"', JSON.stringify('\xDF'));
assertEquals('"\xE0"', JSON.stringify('\xE0'));
assertEquals('"\xE1"', JSON.stringify('\xE1'));
assertEquals('"\xE2"', JSON.stringify('\xE2'));
assertEquals('"\xE3"', JSON.stringify('\xE3'));
assertEquals('"\xE4"', JSON.stringify('\xE4'));
assertEquals('"\xE5"', JSON.stringify('\xE5'));
assertEquals('"\xE6"', JSON.stringify('\xE6'));
assertEquals('"\xE7"', JSON.stringify('\xE7'));
assertEquals('"\xE8"', JSON.stringify('\xE8'));
assertEquals('"\xE9"', JSON.stringify('\xE9'));
assertEquals('"\xEA"', JSON.stringify('\xEA'));
assertEquals('"\xEB"', JSON.stringify('\xEB'));
assertEquals('"\xEC"', JSON.stringify('\xEC'));
assertEquals('"\xED"', JSON.stringify('\xED'));
assertEquals('"\xEE"', JSON.stringify('\xEE'));
assertEquals('"\xEF"', JSON.stringify('\xEF'));
assertEquals('"\xF0"', JSON.stringify('\xF0'));
assertEquals('"\xF1"', JSON.stringify('\xF1'));
assertEquals('"\xF2"', JSON.stringify('\xF2'));
assertEquals('"\xF3"', JSON.stringify('\xF3'));
assertEquals('"\xF4"', JSON.stringify('\xF4'));
assertEquals('"\xF5"', JSON.stringify('\xF5'));
assertEquals('"\xF6"', JSON.stringify('\xF6'));
assertEquals('"\xF7"', JSON.stringify('\xF7'));
assertEquals('"\xF8"', JSON.stringify('\xF8'));
assertEquals('"\xF9"', JSON.stringify('\xF9'));
assertEquals('"\xFA"', JSON.stringify('\xFA'));
assertEquals('"\xFB"', JSON.stringify('\xFB'));
assertEquals('"\xFC"', JSON.stringify('\xFC'));
assertEquals('"\xFD"', JSON.stringify('\xFD'));
assertEquals('"\xFE"', JSON.stringify('\xFE'));
assertEquals('"\xFF"', JSON.stringify('\xFF'));

// A random selection of code points from U+0100 to U+D7FF.
assertEquals('"\u0100"', JSON.stringify('\u0100'));
assertEquals('"\u0120"', JSON.stringify('\u0120'));
assertEquals('"\u07D3"', JSON.stringify('\u07D3'));
assertEquals('"\u0B8B"', JSON.stringify('\u0B8B'));
assertEquals('"\u0C4C"', JSON.stringify('\u0C4C'));
assertEquals('"\u178D"', JSON.stringify('\u178D'));
assertEquals('"\u18B8"', JSON.stringify('\u18B8'));
assertEquals('"\u193E"', JSON.stringify('\u193E'));
assertEquals('"\u198A"', JSON.stringify('\u198A'));
assertEquals('"\u1AF5"', JSON.stringify('\u1AF5'));
assertEquals('"\u1D38"', JSON.stringify('\u1D38'));
assertEquals('"\u1E37"', JSON.stringify('\u1E37'));
assertEquals('"\u1FC2"', JSON.stringify('\u1FC2'));
assertEquals('"\u22C7"', JSON.stringify('\u22C7'));
assertEquals('"\u2619"', JSON.stringify('\u2619'));
assertEquals('"\u272A"', JSON.stringify('\u272A'));
assertEquals('"\u2B7F"', JSON.stringify('\u2B7F'));
assertEquals('"\u2DFF"', JSON.stringify('\u2DFF'));
assertEquals('"\u341B"', JSON.stringify('\u341B'));
assertEquals('"\u3A3C"', JSON.stringify('\u3A3C'));
assertEquals('"\u3E53"', JSON.stringify('\u3E53'));
assertEquals('"\u3EC2"', JSON.stringify('\u3EC2'));
assertEquals('"\u3F76"', JSON.stringify('\u3F76'));
assertEquals('"\u3F85"', JSON.stringify('\u3F85'));
assertEquals('"\u43C7"', JSON.stringify('\u43C7'));
assertEquals('"\u4A19"', JSON.stringify('\u4A19'));
assertEquals('"\u4A1C"', JSON.stringify('\u4A1C'));
assertEquals('"\u4F80"', JSON.stringify('\u4F80'));
assertEquals('"\u5A30"', JSON.stringify('\u5A30'));
assertEquals('"\u5B55"', JSON.stringify('\u5B55'));
assertEquals('"\u5C74"', JSON.stringify('\u5C74'));
assertEquals('"\u6006"', JSON.stringify('\u6006'));
assertEquals('"\u63CC"', JSON.stringify('\u63CC'));
assertEquals('"\u6608"', JSON.stringify('\u6608'));
assertEquals('"\u6ABF"', JSON.stringify('\u6ABF'));
assertEquals('"\u6AE9"', JSON.stringify('\u6AE9'));
assertEquals('"\u6C91"', JSON.stringify('\u6C91'));
assertEquals('"\u714B"', JSON.stringify('\u714B'));
assertEquals('"\u728A"', JSON.stringify('\u728A'));
assertEquals('"\u7485"', JSON.stringify('\u7485'));
assertEquals('"\u77C8"', JSON.stringify('\u77C8'));
assertEquals('"\u7BE9"', JSON.stringify('\u7BE9'));
assertEquals('"\u7CEF"', JSON.stringify('\u7CEF'));
assertEquals('"\u7DD5"', JSON.stringify('\u7DD5'));
assertEquals('"\u8DF1"', JSON.stringify('\u8DF1'));
assertEquals('"\u94A9"', JSON.stringify('\u94A9'));
assertEquals('"\u94F2"', JSON.stringify('\u94F2'));
assertEquals('"\u9A7A"', JSON.stringify('\u9A7A'));
assertEquals('"\u9AA6"', JSON.stringify('\u9AA6'));
assertEquals('"\uA2B0"', JSON.stringify('\uA2B0'));
assertEquals('"\uB711"', JSON.stringify('\uB711'));
assertEquals('"\uBC01"', JSON.stringify('\uBC01'));
assertEquals('"\uBCB6"', JSON.stringify('\uBCB6'));
assertEquals('"\uBD70"', JSON.stringify('\uBD70'));
assertEquals('"\uC3CD"', JSON.stringify('\uC3CD'));
assertEquals('"\uC451"', JSON.stringify('\uC451'));
assertEquals('"\uC677"', JSON.stringify('\uC677'));
assertEquals('"\uC89B"', JSON.stringify('\uC89B'));
assertEquals('"\uCBEF"', JSON.stringify('\uCBEF'));
assertEquals('"\uCEF8"', JSON.stringify('\uCEF8'));
assertEquals('"\uD089"', JSON.stringify('\uD089'));
assertEquals('"\uD24D"', JSON.stringify('\uD24D'));
assertEquals('"\uD3A7"', JSON.stringify('\uD3A7'));
assertEquals('"\uD7FF"', JSON.stringify('\uD7FF'));

// All lone surrogates, i.e. code points from U+D800 to U+DFFF.
assertEquals('"\\ud800"', JSON.stringify('\uD800'));
assertEquals('"\\ud801"', JSON.stringify('\uD801'));
assertEquals('"\\ud802"', JSON.stringify('\uD802'));
assertEquals('"\\ud803"', JSON.stringify('\uD803'));
assertEquals('"\\ud804"', JSON.stringify('\uD804'));
assertEquals('"\\ud805"', JSON.stringify('\uD805'));
assertEquals('"\\ud806"', JSON.stringify('\uD806'));
assertEquals('"\\ud807"', JSON.stringify('\uD807'));
assertEquals('"\\ud808"', JSON.stringify('\uD808'));
assertEquals('"\\ud809"', JSON.stringify('\uD809'));
assertEquals('"\\ud80a"', JSON.stringify('\uD80A'));
assertEquals('"\\ud80b"', JSON.stringify('\uD80B'));
assertEquals('"\\ud80c"', JSON.stringify('\uD80C'));
assertEquals('"\\ud80d"', JSON.stringify('\uD80D'));
assertEquals('"\\ud80e"', JSON.stringify('\uD80E'));
assertEquals('"\\ud80f"', JSON.stringify('\uD80F'));
assertEquals('"\\ud810"', JSON.stringify('\uD810'));
assertEquals('"\\ud811"', JSON.stringify('\uD811'));
assertEquals('"\\ud812"', JSON.stringify('\uD812'));
assertEquals('"\\ud813"', JSON.stringify('\uD813'));
assertEquals('"\\ud814"', JSON.stringify('\uD814'));
assertEquals('"\\ud815"', JSON.stringify('\uD815'));
assertEquals('"\\ud816"', JSON.stringify('\uD816'));
assertEquals('"\\ud817"', JSON.stringify('\uD817'));
assertEquals('"\\ud818"', JSON.stringify('\uD818'));
assertEquals('"\\ud819"', JSON.stringify('\uD819'));
assertEquals('"\\ud81a"', JSON.stringify('\uD81A'));
assertEquals('"\\ud81b"', JSON.stringify('\uD81B'));
assertEquals('"\\ud81c"', JSON.stringify('\uD81C'));
assertEquals('"\\ud81d"', JSON.stringify('\uD81D'));
assertEquals('"\\ud81e"', JSON.stringify('\uD81E'));
assertEquals('"\\ud81f"', JSON.stringify('\uD81F'));
assertEquals('"\\ud820"', JSON.stringify('\uD820'));
assertEquals('"\\ud821"', JSON.stringify('\uD821'));
assertEquals('"\\ud822"', JSON.stringify('\uD822'));
assertEquals('"\\ud823"', JSON.stringify('\uD823'));
assertEquals('"\\ud824"', JSON.stringify('\uD824'));
assertEquals('"\\ud825"', JSON.stringify('\uD825'));
assertEquals('"\\ud826"', JSON.stringify('\uD826'));
assertEquals('"\\ud827"', JSON.stringify('\uD827'));
assertEquals('"\\ud828"', JSON.stringify('\uD828'));
assertEquals('"\\ud829"', JSON.stringify('\uD829'));
assertEquals('"\\ud82a"', JSON.stringify('\uD82A'));
assertEquals('"\\ud82b"', JSON.stringify('\uD82B'));
assertEquals('"\\ud82c"', JSON.stringify('\uD82C'));
assertEquals('"\\ud82d"', JSON.stringify('\uD82D'));
assertEquals('"\\ud82e"', JSON.stringify('\uD82E'));
assertEquals('"\\ud82f"', JSON.stringify('\uD82F'));
assertEquals('"\\ud830"', JSON.stringify('\uD830'));
assertEquals('"\\ud831"', JSON.stringify('\uD831'));
assertEquals('"\\ud832"', JSON.stringify('\uD832'));
assertEquals('"\\ud833"', JSON.stringify('\uD833'));
assertEquals('"\\ud834"', JSON.stringify('\uD834'));
assertEquals('"\\ud835"', JSON.stringify('\uD835'));
assertEquals('"\\ud836"', JSON.stringify('\uD836'));
assertEquals('"\\ud837"', JSON.stringify('\uD837'));
assertEquals('"\\ud838"', JSON.stringify('\uD838'));
assertEquals('"\\ud839"', JSON.stringify('\uD839'));
assertEquals('"\\ud83a"', JSON.stringify('\uD83A'));
assertEquals('"\\ud83b"', JSON.stringify('\uD83B'));
assertEquals('"\\ud83c"', JSON.stringify('\uD83C'));
assertEquals('"\\ud83d"', JSON.stringify('\uD83D'));
assertEquals('"\\ud83e"', JSON.stringify('\uD83E'));
assertEquals('"\\ud83f"', JSON.stringify('\uD83F'));
assertEquals('"\\ud840"', JSON.stringify('\uD840'));
assertEquals('"\\ud841"', JSON.stringify('\uD841'));
assertEquals('"\\ud842"', JSON.stringify('\uD842'));
assertEquals('"\\ud843"', JSON.stringify('\uD843'));
assertEquals('"\\ud844"', JSON.stringify('\uD844'));
assertEquals('"\\ud845"', JSON.stringify('\uD845'));
assertEquals('"\\ud846"', JSON.stringify('\uD846'));
assertEquals('"\\ud847"', JSON.stringify('\uD847'));
assertEquals('"\\ud848"', JSON.stringify('\uD848'));
assertEquals('"\\ud849"', JSON.stringify('\uD849'));
assertEquals('"\\ud84a"', JSON.stringify('\uD84A'));
assertEquals('"\\ud84b"', JSON.stringify('\uD84B'));
assertEquals('"\\ud84c"', JSON.stringify('\uD84C'));
assertEquals('"\\ud84d"', JSON.stringify('\uD84D'));
assertEquals('"\\ud84e"', JSON.stringify('\uD84E'));
assertEquals('"\\ud84f"', JSON.stringify('\uD84F'));
assertEquals('"\\ud850"', JSON.stringify('\uD850'));
assertEquals('"\\ud851"', JSON.stringify('\uD851'));
assertEquals('"\\ud852"', JSON.stringify('\uD852'));
assertEquals('"\\ud853"', JSON.stringify('\uD853'));
assertEquals('"\\ud854"', JSON.stringify('\uD854'));
assertEquals('"\\ud855"', JSON.stringify('\uD855'));
assertEquals('"\\ud856"', JSON.stringify('\uD856'));
assertEquals('"\\ud857"', JSON.stringify('\uD857'));
assertEquals('"\\ud858"', JSON.stringify('\uD858'));
assertEquals('"\\ud859"', JSON.stringify('\uD859'));
assertEquals('"\\ud85a"', JSON.stringify('\uD85A'));
assertEquals('"\\ud85b"', JSON.stringify('\uD85B'));
assertEquals('"\\ud85c"', JSON.stringify('\uD85C'));
assertEquals('"\\ud85d"', JSON.stringify('\uD85D'));
assertEquals('"\\ud85e"', JSON.stringify('\uD85E'));
assertEquals('"\\ud85f"', JSON.stringify('\uD85F'));
assertEquals('"\\ud860"', JSON.stringify('\uD860'));
assertEquals('"\\ud861"', JSON.stringify('\uD861'));
assertEquals('"\\ud862"', JSON.stringify('\uD862'));
assertEquals('"\\ud863"', JSON.stringify('\uD863'));
assertEquals('"\\ud864"', JSON.stringify('\uD864'));
assertEquals('"\\ud865"', JSON.stringify('\uD865'));
assertEquals('"\\ud866"', JSON.stringify('\uD866'));
assertEquals('"\\ud867"', JSON.stringify('\uD867'));
assertEquals('"\\ud868"', JSON.stringify('\uD868'));
assertEquals('"\\ud869"', JSON.stringify('\uD869'));
assertEquals('"\\ud86a"', JSON.stringify('\uD86A'));
assertEquals('"\\ud86b"', JSON.stringify('\uD86B'));
assertEquals('"\\ud86c"', JSON.stringify('\uD86C'));
assertEquals('"\\ud86d"', JSON.stringify('\uD86D'));
assertEquals('"\\ud86e"', JSON.stringify('\uD86E'));
assertEquals('"\\ud86f"', JSON.stringify('\uD86F'));
assertEquals('"\\ud870"', JSON.stringify('\uD870'));
assertEquals('"\\ud871"', JSON.stringify('\uD871'));
assertEquals('"\\ud872"', JSON.stringify('\uD872'));
assertEquals('"\\ud873"', JSON.stringify('\uD873'));
assertEquals('"\\ud874"', JSON.stringify('\uD874'));
assertEquals('"\\ud875"', JSON.stringify('\uD875'));
assertEquals('"\\ud876"', JSON.stringify('\uD876'));
assertEquals('"\\ud877"', JSON.stringify('\uD877'));
assertEquals('"\\ud878"', JSON.stringify('\uD878'));
assertEquals('"\\ud879"', JSON.stringify('\uD879'));
assertEquals('"\\ud87a"', JSON.stringify('\uD87A'));
assertEquals('"\\ud87b"', JSON.stringify('\uD87B'));
assertEquals('"\\ud87c"', JSON.stringify('\uD87C'));
assertEquals('"\\ud87d"', JSON.stringify('\uD87D'));
assertEquals('"\\ud87e"', JSON.stringify('\uD87E'));
assertEquals('"\\ud87f"', JSON.stringify('\uD87F'));
assertEquals('"\\ud880"', JSON.stringify('\uD880'));
assertEquals('"\\ud881"', JSON.stringify('\uD881'));
assertEquals('"\\ud882"', JSON.stringify('\uD882'));
assertEquals('"\\ud883"', JSON.stringify('\uD883'));
assertEquals('"\\ud884"', JSON.stringify('\uD884'));
assertEquals('"\\ud885"', JSON.stringify('\uD885'));
assertEquals('"\\ud886"', JSON.stringify('\uD886'));
assertEquals('"\\ud887"', JSON.stringify('\uD887'));
assertEquals('"\\ud888"', JSON.stringify('\uD888'));
assertEquals('"\\ud889"', JSON.stringify('\uD889'));
assertEquals('"\\ud88a"', JSON.stringify('\uD88A'));
assertEquals('"\\ud88b"', JSON.stringify('\uD88B'));
assertEquals('"\\ud88c"', JSON.stringify('\uD88C'));
assertEquals('"\\ud88d"', JSON.stringify('\uD88D'));
assertEquals('"\\ud88e"', JSON.stringify('\uD88E'));
assertEquals('"\\ud88f"', JSON.stringify('\uD88F'));
assertEquals('"\\ud890"', JSON.stringify('\uD890'));
assertEquals('"\\ud891"', JSON.stringify('\uD891'));
assertEquals('"\\ud892"', JSON.stringify('\uD892'));
assertEquals('"\\ud893"', JSON.stringify('\uD893'));
assertEquals('"\\ud894"', JSON.stringify('\uD894'));
assertEquals('"\\ud895"', JSON.stringify('\uD895'));
assertEquals('"\\ud896"', JSON.stringify('\uD896'));
assertEquals('"\\ud897"', JSON.stringify('\uD897'));
assertEquals('"\\ud898"', JSON.stringify('\uD898'));
assertEquals('"\\ud899"', JSON.stringify('\uD899'));
assertEquals('"\\ud89a"', JSON.stringify('\uD89A'));
assertEquals('"\\ud89b"', JSON.stringify('\uD89B'));
assertEquals('"\\ud89c"', JSON.stringify('\uD89C'));
assertEquals('"\\ud89d"', JSON.stringify('\uD89D'));
assertEquals('"\\ud89e"', JSON.stringify('\uD89E'));
assertEquals('"\\ud89f"', JSON.stringify('\uD89F'));
assertEquals('"\\ud8a0"', JSON.stringify('\uD8A0'));
assertEquals('"\\ud8a1"', JSON.stringify('\uD8A1'));
assertEquals('"\\ud8a2"', JSON.stringify('\uD8A2'));
assertEquals('"\\ud8a3"', JSON.stringify('\uD8A3'));
assertEquals('"\\ud8a4"', JSON.stringify('\uD8A4'));
assertEquals('"\\ud8a5"', JSON.stringify('\uD8A5'));
assertEquals('"\\ud8a6"', JSON.stringify('\uD8A6'));
assertEquals('"\\ud8a7"', JSON.stringify('\uD8A7'));
assertEquals('"\\ud8a8"', JSON.stringify('\uD8A8'));
assertEquals('"\\ud8a9"', JSON.stringify('\uD8A9'));
assertEquals('"\\ud8aa"', JSON.stringify('\uD8AA'));
assertEquals('"\\ud8ab"', JSON.stringify('\uD8AB'));
assertEquals('"\\ud8ac"', JSON.stringify('\uD8AC'));
assertEquals('"\\ud8ad"', JSON.stringify('\uD8AD'));
assertEquals('"\\ud8ae"', JSON.stringify('\uD8AE'));
assertEquals('"\\ud8af"', JSON.stringify('\uD8AF'));
assertEquals('"\\ud8b0"', JSON.stringify('\uD8B0'));
assertEquals('"\\ud8b1"', JSON.stringify('\uD8B1'));
assertEquals('"\\ud8b2"', JSON.stringify('\uD8B2'));
assertEquals('"\\ud8b3"', JSON.stringify('\uD8B3'));
assertEquals('"\\ud8b4"', JSON.stringify('\uD8B4'));
assertEquals('"\\ud8b5"', JSON.stringify('\uD8B5'));
assertEquals('"\\ud8b6"', JSON.stringify('\uD8B6'));
assertEquals('"\\ud8b7"', JSON.stringify('\uD8B7'));
assertEquals('"\\ud8b8"', JSON.stringify('\uD8B8'));
assertEquals('"\\ud8b9"', JSON.stringify('\uD8B9'));
assertEquals('"\\ud8ba"', JSON.stringify('\uD8BA'));
assertEquals('"\\ud8bb"', JSON.stringify('\uD8BB'));
assertEquals('"\\ud8bc"', JSON.stringify('\uD8BC'));
assertEquals('"\\ud8bd"', JSON.stringify('\uD8BD'));
assertEquals('"\\ud8be"', JSON.stringify('\uD8BE'));
assertEquals('"\\ud8bf"', JSON.stringify('\uD8BF'));
assertEquals('"\\ud8c0"', JSON.stringify('\uD8C0'));
assertEquals('"\\ud8c1"', JSON.stringify('\uD8C1'));
assertEquals('"\\ud8c2"', JSON.stringify('\uD8C2'));
assertEquals('"\\ud8c3"', JSON.stringify('\uD8C3'));
assertEquals('"\\ud8c4"', JSON.stringify('\uD8C4'));
assertEquals('"\\ud8c5"', JSON.stringify('\uD8C5'));
assertEquals('"\\ud8c6"', JSON.stringify('\uD8C6'));
assertEquals('"\\ud8c7"', JSON.stringify('\uD8C7'));
assertEquals('"\\ud8c8"', JSON.stringify('\uD8C8'));
assertEquals('"\\ud8c9"', JSON.stringify('\uD8C9'));
assertEquals('"\\ud8ca"', JSON.stringify('\uD8CA'));
assertEquals('"\\ud8cb"', JSON.stringify('\uD8CB'));
assertEquals('"\\ud8cc"', JSON.stringify('\uD8CC'));
assertEquals('"\\ud8cd"', JSON.stringify('\uD8CD'));
assertEquals('"\\ud8ce"', JSON.stringify('\uD8CE'));
assertEquals('"\\ud8cf"', JSON.stringify('\uD8CF'));
assertEquals('"\\ud8d0"', JSON.stringify('\uD8D0'));
assertEquals('"\\ud8d1"', JSON.stringify('\uD8D1'));
assertEquals('"\\ud8d2"', JSON.stringify('\uD8D2'));
assertEquals('"\\ud8d3"', JSON.stringify('\uD8D3'));
assertEquals('"\\ud8d4"', JSON.stringify('\uD8D4'));
assertEquals('"\\ud8d5"', JSON.stringify('\uD8D5'));
assertEquals('"\\ud8d6"', JSON.stringify('\uD8D6'));
assertEquals('"\\ud8d7"', JSON.stringify('\uD8D7'));
assertEquals('"\\ud8d8"', JSON.stringify('\uD8D8'));
assertEquals('"\\ud8d9"', JSON.stringify('\uD8D9'));
assertEquals('"\\ud8da"', JSON.stringify('\uD8DA'));
assertEquals('"\\ud8db"', JSON.stringify('\uD8DB'));
assertEquals('"\\ud8dc"', JSON.stringify('\uD8DC'));
assertEquals('"\\ud8dd"', JSON.stringify('\uD8DD'));
assertEquals('"\\ud8de"', JSON.stringify('\uD8DE'));
assertEquals('"\\ud8df"', JSON.stringify('\uD8DF'));
assertEquals('"\\ud8e0"', JSON.stringify('\uD8E0'));
assertEquals('"\\ud8e1"', JSON.stringify('\uD8E1'));
assertEquals('"\\ud8e2"', JSON.stringify('\uD8E2'));
assertEquals('"\\ud8e3"', JSON.stringify('\uD8E3'));
assertEquals('"\\ud8e4"', JSON.stringify('\uD8E4'));
assertEquals('"\\ud8e5"', JSON.stringify('\uD8E5'));
assertEquals('"\\ud8e6"', JSON.stringify('\uD8E6'));
assertEquals('"\\ud8e7"', JSON.stringify('\uD8E7'));
assertEquals('"\\ud8e8"', JSON.stringify('\uD8E8'));
assertEquals('"\\ud8e9"', JSON.stringify('\uD8E9'));
assertEquals('"\\ud8ea"', JSON.stringify('\uD8EA'));
assertEquals('"\\ud8eb"', JSON.stringify('\uD8EB'));
assertEquals('"\\ud8ec"', JSON.stringify('\uD8EC'));
assertEquals('"\\ud8ed"', JSON.stringify('\uD8ED'));
assertEquals('"\\ud8ee"', JSON.stringify('\uD8EE'));
assertEquals('"\\ud8ef"', JSON.stringify('\uD8EF'));
assertEquals('"\\ud8f0"', JSON.stringify('\uD8F0'));
assertEquals('"\\ud8f1"', JSON.stringify('\uD8F1'));
assertEquals('"\\ud8f2"', JSON.stringify('\uD8F2'));
assertEquals('"\\ud8f3"', JSON.stringify('\uD8F3'));
assertEquals('"\\ud8f4"', JSON.stringify('\uD8F4'));
assertEquals('"\\ud8f5"', JSON.stringify('\uD8F5'));
assertEquals('"\\ud8f6"', JSON.stringify('\uD8F6'));
assertEquals('"\\ud8f7"', JSON.stringify('\uD8F7'));
assertEquals('"\\ud8f8"', JSON.stringify('\uD8F8'));
assertEquals('"\\ud8f9"', JSON.stringify('\uD8F9'));
assertEquals('"\\ud8fa"', JSON.stringify('\uD8FA'));
assertEquals('"\\ud8fb"', JSON.stringify('\uD8FB'));
assertEquals('"\\ud8fc"', JSON.stringify('\uD8FC'));
assertEquals('"\\ud8fd"', JSON.stringify('\uD8FD'));
assertEquals('"\\ud8fe"', JSON.stringify('\uD8FE'));
assertEquals('"\\ud8ff"', JSON.stringify('\uD8FF'));
assertEquals('"\\ud900"', JSON.stringify('\uD900'));
assertEquals('"\\ud901"', JSON.stringify('\uD901'));
assertEquals('"\\ud902"', JSON.stringify('\uD902'));
assertEquals('"\\ud903"', JSON.stringify('\uD903'));
assertEquals('"\\ud904"', JSON.stringify('\uD904'));
assertEquals('"\\ud905"', JSON.stringify('\uD905'));
assertEquals('"\\ud906"', JSON.stringify('\uD906'));
assertEquals('"\\ud907"', JSON.stringify('\uD907'));
assertEquals('"\\ud908"', JSON.stringify('\uD908'));
assertEquals('"\\ud909"', JSON.stringify('\uD909'));
assertEquals('"\\ud90a"', JSON.stringify('\uD90A'));
assertEquals('"\\ud90b"', JSON.stringify('\uD90B'));
assertEquals('"\\ud90c"', JSON.stringify('\uD90C'));
assertEquals('"\\ud90d"', JSON.stringify('\uD90D'));
assertEquals('"\\ud90e"', JSON.stringify('\uD90E'));
assertEquals('"\\ud90f"', JSON.stringify('\uD90F'));
assertEquals('"\\ud910"', JSON.stringify('\uD910'));
assertEquals('"\\ud911"', JSON.stringify('\uD911'));
assertEquals('"\\ud912"', JSON.stringify('\uD912'));
assertEquals('"\\ud913"', JSON.stringify('\uD913'));
assertEquals('"\\ud914"', JSON.stringify('\uD914'));
assertEquals('"\\ud915"', JSON.stringify('\uD915'));
assertEquals('"\\ud916"', JSON.stringify('\uD916'));
assertEquals('"\\ud917"', JSON.stringify('\uD917'));
assertEquals('"\\ud918"', JSON.stringify('\uD918'));
assertEquals('"\\ud919"', JSON.stringify('\uD919'));
assertEquals('"\\ud91a"', JSON.stringify('\uD91A'));
assertEquals('"\\ud91b"', JSON.stringify('\uD91B'));
assertEquals('"\\ud91c"', JSON.stringify('\uD91C'));
assertEquals('"\\ud91d"', JSON.stringify('\uD91D'));
assertEquals('"\\ud91e"', JSON.stringify('\uD91E'));
assertEquals('"\\ud91f"', JSON.stringify('\uD91F'));
assertEquals('"\\ud920"', JSON.stringify('\uD920'));
assertEquals('"\\ud921"', JSON.stringify('\uD921'));
assertEquals('"\\ud922"', JSON.stringify('\uD922'));
assertEquals('"\\ud923"', JSON.stringify('\uD923'));
assertEquals('"\\ud924"', JSON.stringify('\uD924'));
assertEquals('"\\ud925"', JSON.stringify('\uD925'));
assertEquals('"\\ud926"', JSON.stringify('\uD926'));
assertEquals('"\\ud927"', JSON.stringify('\uD927'));
assertEquals('"\\ud928"', JSON.stringify('\uD928'));
assertEquals('"\\ud929"', JSON.stringify('\uD929'));
assertEquals('"\\ud92a"', JSON.stringify('\uD92A'));
assertEquals('"\\ud92b"', JSON.stringify('\uD92B'));
assertEquals('"\\ud92c"', JSON.stringify('\uD92C'));
assertEquals('"\\ud92d"', JSON.stringify('\uD92D'));
assertEquals('"\\ud92e"', JSON.stringify('\uD92E'));
assertEquals('"\\ud92f"', JSON.stringify('\uD92F'));
assertEquals('"\\ud930"', JSON.stringify('\uD930'));
assertEquals('"\\ud931"', JSON.stringify('\uD931'));
assertEquals('"\\ud932"', JSON.stringify('\uD932'));
assertEquals('"\\ud933"', JSON.stringify('\uD933'));
assertEquals('"\\ud934"', JSON.stringify('\uD934'));
assertEquals('"\\ud935"', JSON.stringify('\uD935'));
assertEquals('"\\ud936"', JSON.stringify('\uD936'));
assertEquals('"\\ud937"', JSON.stringify('\uD937'));
assertEquals('"\\ud938"', JSON.stringify('\uD938'));
assertEquals('"\\ud939"', JSON.stringify('\uD939'));
assertEquals('"\\ud93a"', JSON.stringify('\uD93A'));
assertEquals('"\\ud93b"', JSON.stringify('\uD93B'));
assertEquals('"\\ud93c"', JSON.stringify('\uD93C'));
assertEquals('"\\ud93d"', JSON.stringify('\uD93D'));
assertEquals('"\\ud93e"', JSON.stringify('\uD93E'));
assertEquals('"\\ud93f"', JSON.stringify('\uD93F'));
assertEquals('"\\ud940"', JSON.stringify('\uD940'));
assertEquals('"\\ud941"', JSON.stringify('\uD941'));
assertEquals('"\\ud942"', JSON.stringify('\uD942'));
assertEquals('"\\ud943"', JSON.stringify('\uD943'));
assertEquals('"\\ud944"', JSON.stringify('\uD944'));
assertEquals('"\\ud945"', JSON.stringify('\uD945'));
assertEquals('"\\ud946"', JSON.stringify('\uD946'));
assertEquals('"\\ud947"', JSON.stringify('\uD947'));
assertEquals('"\\ud948"', JSON.stringify('\uD948'));
assertEquals('"\\ud949"', JSON.stringify('\uD949'));
assertEquals('"\\ud94a"', JSON.stringify('\uD94A'));
assertEquals('"\\ud94b"', JSON.stringify('\uD94B'));
assertEquals('"\\ud94c"', JSON.stringify('\uD94C'));
assertEquals('"\\ud94d"', JSON.stringify('\uD94D'));
assertEquals('"\\ud94e"', JSON.stringify('\uD94E'));
assertEquals('"\\ud94f"', JSON.stringify('\uD94F'));
assertEquals('"\\ud950"', JSON.stringify('\uD950'));
assertEquals('"\\ud951"', JSON.stringify('\uD951'));
assertEquals('"\\ud952"', JSON.stringify('\uD952'));
assertEquals('"\\ud953"', JSON.stringify('\uD953'));
assertEquals('"\\ud954"', JSON.stringify('\uD954'));
assertEquals('"\\ud955"', JSON.stringify('\uD955'));
assertEquals('"\\ud956"', JSON.stringify('\uD956'));
assertEquals('"\\ud957"', JSON.stringify('\uD957'));
assertEquals('"\\ud958"', JSON.stringify('\uD958'));
assertEquals('"\\ud959"', JSON.stringify('\uD959'));
assertEquals('"\\ud95a"', JSON.stringify('\uD95A'));
assertEquals('"\\ud95b"', JSON.stringify('\uD95B'));
assertEquals('"\\ud95c"', JSON.stringify('\uD95C'));
assertEquals('"\\ud95d"', JSON.stringify('\uD95D'));
assertEquals('"\\ud95e"', JSON.stringify('\uD95E'));
assertEquals('"\\ud95f"', JSON.stringify('\uD95F'));
assertEquals('"\\ud960"', JSON.stringify('\uD960'));
assertEquals('"\\ud961"', JSON.stringify('\uD961'));
assertEquals('"\\ud962"', JSON.stringify('\uD962'));
assertEquals('"\\ud963"', JSON.stringify('\uD963'));
assertEquals('"\\ud964"', JSON.stringify('\uD964'));
assertEquals('"\\ud965"', JSON.stringify('\uD965'));
assertEquals('"\\ud966"', JSON.stringify('\uD966'));
assertEquals('"\\ud967"', JSON.stringify('\uD967'));
assertEquals('"\\ud968"', JSON.stringify('\uD968'));
assertEquals('"\\ud969"', JSON.stringify('\uD969'));
assertEquals('"\\ud96a"', JSON.stringify('\uD96A'));
assertEquals('"\\ud96b"', JSON.stringify('\uD96B'));
assertEquals('"\\ud96c"', JSON.stringify('\uD96C'));
assertEquals('"\\ud96d"', JSON.stringify('\uD96D'));
assertEquals('"\\ud96e"', JSON.stringify('\uD96E'));
assertEquals('"\\ud96f"', JSON.stringify('\uD96F'));
assertEquals('"\\ud970"', JSON.stringify('\uD970'));
assertEquals('"\\ud971"', JSON.stringify('\uD971'));
assertEquals('"\\ud972"', JSON.stringify('\uD972'));
assertEquals('"\\ud973"', JSON.stringify('\uD973'));
assertEquals('"\\ud974"', JSON.stringify('\uD974'));
assertEquals('"\\ud975"', JSON.stringify('\uD975'));
assertEquals('"\\ud976"', JSON.stringify('\uD976'));
assertEquals('"\\ud977"', JSON.stringify('\uD977'));
assertEquals('"\\ud978"', JSON.stringify('\uD978'));
assertEquals('"\\ud979"', JSON.stringify('\uD979'));
assertEquals('"\\ud97a"', JSON.stringify('\uD97A'));
assertEquals('"\\ud97b"', JSON.stringify('\uD97B'));
assertEquals('"\\ud97c"', JSON.stringify('\uD97C'));
assertEquals('"\\ud97d"', JSON.stringify('\uD97D'));
assertEquals('"\\ud97e"', JSON.stringify('\uD97E'));
assertEquals('"\\ud97f"', JSON.stringify('\uD97F'));
assertEquals('"\\ud980"', JSON.stringify('\uD980'));
assertEquals('"\\ud981"', JSON.stringify('\uD981'));
assertEquals('"\\ud982"', JSON.stringify('\uD982'));
assertEquals('"\\ud983"', JSON.stringify('\uD983'));
assertEquals('"\\ud984"', JSON.stringify('\uD984'));
assertEquals('"\\ud985"', JSON.stringify('\uD985'));
assertEquals('"\\ud986"', JSON.stringify('\uD986'));
assertEquals('"\\ud987"', JSON.stringify('\uD987'));
assertEquals('"\\ud988"', JSON.stringify('\uD988'));
assertEquals('"\\ud989"', JSON.stringify('\uD989'));
assertEquals('"\\ud98a"', JSON.stringify('\uD98A'));
assertEquals('"\\ud98b"', JSON.stringify('\uD98B'));
assertEquals('"\\ud98c"', JSON.stringify('\uD98C'));
assertEquals('"\\ud98d"', JSON.stringify('\uD98D'));
assertEquals('"\\ud98e"', JSON.stringify('\uD98E'));
assertEquals('"\\ud98f"', JSON.stringify('\uD98F'));
assertEquals('"\\ud990"', JSON.stringify('\uD990'));
assertEquals('"\\ud991"', JSON.stringify('\uD991'));
assertEquals('"\\ud992"', JSON.stringify('\uD992'));
assertEquals('"\\ud993"', JSON.stringify('\uD993'));
assertEquals('"\\ud994"', JSON.stringify('\uD994'));
assertEquals('"\\ud995"', JSON.stringify('\uD995'));
assertEquals('"\\ud996"', JSON.stringify('\uD996'));
assertEquals('"\\ud997"', JSON.stringify('\uD997'));
assertEquals('"\\ud998"', JSON.stringify('\uD998'));
assertEquals('"\\ud999"', JSON.stringify('\uD999'));
assertEquals('"\\ud99a"', JSON.stringify('\uD99A'));
assertEquals('"\\ud99b"', JSON.stringify('\uD99B'));
assertEquals('"\\ud99c"', JSON.stringify('\uD99C'));
assertEquals('"\\ud99d"', JSON.stringify('\uD99D'));
assertEquals('"\\ud99e"', JSON.stringify('\uD99E'));
assertEquals('"\\ud99f"', JSON.stringify('\uD99F'));
assertEquals('"\\ud9a0"', JSON.stringify('\uD9A0'));
assertEquals('"\\ud9a1"', JSON.stringify('\uD9A1'));
assertEquals('"\\ud9a2"', JSON.stringify('\uD9A2'));
assertEquals('"\\ud9a3"', JSON.stringify('\uD9A3'));
assertEquals('"\\ud9a4"', JSON.stringify('\uD9A4'));
assertEquals('"\\ud9a5"', JSON.stringify('\uD9A5'));
assertEquals('"\\ud9a6"', JSON.stringify('\uD9A6'));
assertEquals('"\\ud9a7"', JSON.stringify('\uD9A7'));
assertEquals('"\\ud9a8"', JSON.stringify('\uD9A8'));
assertEquals('"\\ud9a9"', JSON.stringify('\uD9A9'));
assertEquals('"\\ud9aa"', JSON.stringify('\uD9AA'));
assertEquals('"\\ud9ab"', JSON.stringify('\uD9AB'));
assertEquals('"\\ud9ac"', JSON.stringify('\uD9AC'));
assertEquals('"\\ud9ad"', JSON.stringify('\uD9AD'));
assertEquals('"\\ud9ae"', JSON.stringify('\uD9AE'));
assertEquals('"\\ud9af"', JSON.stringify('\uD9AF'));
assertEquals('"\\ud9b0"', JSON.stringify('\uD9B0'));
assertEquals('"\\ud9b1"', JSON.stringify('\uD9B1'));
assertEquals('"\\ud9b2"', JSON.stringify('\uD9B2'));
assertEquals('"\\ud9b3"', JSON.stringify('\uD9B3'));
assertEquals('"\\ud9b4"', JSON.stringify('\uD9B4'));
assertEquals('"\\ud9b5"', JSON.stringify('\uD9B5'));
assertEquals('"\\ud9b6"', JSON.stringify('\uD9B6'));
assertEquals('"\\ud9b7"', JSON.stringify('\uD9B7'));
assertEquals('"\\ud9b8"', JSON.stringify('\uD9B8'));
assertEquals('"\\ud9b9"', JSON.stringify('\uD9B9'));
assertEquals('"\\ud9ba"', JSON.stringify('\uD9BA'));
assertEquals('"\\ud9bb"', JSON.stringify('\uD9BB'));
assertEquals('"\\ud9bc"', JSON.stringify('\uD9BC'));
assertEquals('"\\ud9bd"', JSON.stringify('\uD9BD'));
assertEquals('"\\ud9be"', JSON.stringify('\uD9BE'));
assertEquals('"\\ud9bf"', JSON.stringify('\uD9BF'));
assertEquals('"\\ud9c0"', JSON.stringify('\uD9C0'));
assertEquals('"\\ud9c1"', JSON.stringify('\uD9C1'));
assertEquals('"\\ud9c2"', JSON.stringify('\uD9C2'));
assertEquals('"\\ud9c3"', JSON.stringify('\uD9C3'));
assertEquals('"\\ud9c4"', JSON.stringify('\uD9C4'));
assertEquals('"\\ud9c5"', JSON.stringify('\uD9C5'));
assertEquals('"\\ud9c6"', JSON.stringify('\uD9C6'));
assertEquals('"\\ud9c7"', JSON.stringify('\uD9C7'));
assertEquals('"\\ud9c8"', JSON.stringify('\uD9C8'));
assertEquals('"\\ud9c9"', JSON.stringify('\uD9C9'));
assertEquals('"\\ud9ca"', JSON.stringify('\uD9CA'));
assertEquals('"\\ud9cb"', JSON.stringify('\uD9CB'));
assertEquals('"\\ud9cc"', JSON.stringify('\uD9CC'));
assertEquals('"\\ud9cd"', JSON.stringify('\uD9CD'));
assertEquals('"\\ud9ce"', JSON.stringify('\uD9CE'));
assertEquals('"\\ud9cf"', JSON.stringify('\uD9CF'));
assertEquals('"\\ud9d0"', JSON.stringify('\uD9D0'));
assertEquals('"\\ud9d1"', JSON.stringify('\uD9D1'));
assertEquals('"\\ud9d2"', JSON.stringify('\uD9D2'));
assertEquals('"\\ud9d3"', JSON.stringify('\uD9D3'));
assertEquals('"\\ud9d4"', JSON.stringify('\uD9D4'));
assertEquals('"\\ud9d5"', JSON.stringify('\uD9D5'));
assertEquals('"\\ud9d6"', JSON.stringify('\uD9D6'));
assertEquals('"\\ud9d7"', JSON.stringify('\uD9D7'));
assertEquals('"\\ud9d8"', JSON.stringify('\uD9D8'));
assertEquals('"\\ud9d9"', JSON.stringify('\uD9D9'));
assertEquals('"\\ud9da"', JSON.stringify('\uD9DA'));
assertEquals('"\\ud9db"', JSON.stringify('\uD9DB'));
assertEquals('"\\ud9dc"', JSON.stringify('\uD9DC'));
assertEquals('"\\ud9dd"', JSON.stringify('\uD9DD'));
assertEquals('"\\ud9de"', JSON.stringify('\uD9DE'));
assertEquals('"\\ud9df"', JSON.stringify('\uD9DF'));
assertEquals('"\\ud9e0"', JSON.stringify('\uD9E0'));
assertEquals('"\\ud9e1"', JSON.stringify('\uD9E1'));
assertEquals('"\\ud9e2"', JSON.stringify('\uD9E2'));
assertEquals('"\\ud9e3"', JSON.stringify('\uD9E3'));
assertEquals('"\\ud9e4"', JSON.stringify('\uD9E4'));
assertEquals('"\\ud9e5"', JSON.stringify('\uD9E5'));
assertEquals('"\\ud9e6"', JSON.stringify('\uD9E6'));
assertEquals('"\\ud9e7"', JSON.stringify('\uD9E7'));
assertEquals('"\\ud9e8"', JSON.stringify('\uD9E8'));
assertEquals('"\\ud9e9"', JSON.stringify('\uD9E9'));
assertEquals('"\\ud9ea"', JSON.stringify('\uD9EA'));
assertEquals('"\\ud9eb"', JSON.stringify('\uD9EB'));
assertEquals('"\\ud9ec"', JSON.stringify('\uD9EC'));
assertEquals('"\\ud9ed"', JSON.stringify('\uD9ED'));
assertEquals('"\\ud9ee"', JSON.stringify('\uD9EE'));
assertEquals('"\\ud9ef"', JSON.stringify('\uD9EF'));
assertEquals('"\\ud9f0"', JSON.stringify('\uD9F0'));
assertEquals('"\\ud9f1"', JSON.stringify('\uD9F1'));
assertEquals('"\\ud9f2"', JSON.stringify('\uD9F2'));
assertEquals('"\\ud9f3"', JSON.stringify('\uD9F3'));
assertEquals('"\\ud9f4"', JSON.stringify('\uD9F4'));
assertEquals('"\\ud9f5"', JSON.stringify('\uD9F5'));
assertEquals('"\\ud9f6"', JSON.stringify('\uD9F6'));
assertEquals('"\\ud9f7"', JSON.stringify('\uD9F7'));
assertEquals('"\\ud9f8"', JSON.stringify('\uD9F8'));
assertEquals('"\\ud9f9"', JSON.stringify('\uD9F9'));
assertEquals('"\\ud9fa"', JSON.stringify('\uD9FA'));
assertEquals('"\\ud9fb"', JSON.stringify('\uD9FB'));
assertEquals('"\\ud9fc"', JSON.stringify('\uD9FC'));
assertEquals('"\\ud9fd"', JSON.stringify('\uD9FD'));
assertEquals('"\\ud9fe"', JSON.stringify('\uD9FE'));
assertEquals('"\\ud9ff"', JSON.stringify('\uD9FF'));
assertEquals('"\\uda00"', JSON.stringify('\uDA00'));
assertEquals('"\\uda01"', JSON.stringify('\uDA01'));
assertEquals('"\\uda02"', JSON.stringify('\uDA02'));
assertEquals('"\\uda03"', JSON.stringify('\uDA03'));
assertEquals('"\\uda04"', JSON.stringify('\uDA04'));
assertEquals('"\\uda05"', JSON.stringify('\uDA05'));
assertEquals('"\\uda06"', JSON.stringify('\uDA06'));
assertEquals('"\\uda07"', JSON.stringify('\uDA07'));
assertEquals('"\\uda08"', JSON.stringify('\uDA08'));
assertEquals('"\\uda09"', JSON.stringify('\uDA09'));
assertEquals('"\\uda0a"', JSON.stringify('\uDA0A'));
assertEquals('"\\uda0b"', JSON.stringify('\uDA0B'));
assertEquals('"\\uda0c"', JSON.stringify('\uDA0C'));
assertEquals('"\\uda0d"', JSON.stringify('\uDA0D'));
assertEquals('"\\uda0e"', JSON.stringify('\uDA0E'));
assertEquals('"\\uda0f"', JSON.stringify('\uDA0F'));
assertEquals('"\\uda10"', JSON.stringify('\uDA10'));
assertEquals('"\\uda11"', JSON.stringify('\uDA11'));
assertEquals('"\\uda12"', JSON.stringify('\uDA12'));
assertEquals('"\\uda13"', JSON.stringify('\uDA13'));
assertEquals('"\\uda14"', JSON.stringify('\uDA14'));
assertEquals('"\\uda15"', JSON.stringify('\uDA15'));
assertEquals('"\\uda16"', JSON.stringify('\uDA16'));
assertEquals('"\\uda17"', JSON.stringify('\uDA17'));
assertEquals('"\\uda18"', JSON.stringify('\uDA18'));
assertEquals('"\\uda19"', JSON.stringify('\uDA19'));
assertEquals('"\\uda1a"', JSON.stringify('\uDA1A'));
assertEquals('"\\uda1b"', JSON.stringify('\uDA1B'));
assertEquals('"\\uda1c"', JSON.stringify('\uDA1C'));
assertEquals('"\\uda1d"', JSON.stringify('\uDA1D'));
assertEquals('"\\uda1e"', JSON.stringify('\uDA1E'));
assertEquals('"\\uda1f"', JSON.stringify('\uDA1F'));
assertEquals('"\\uda20"', JSON.stringify('\uDA20'));
assertEquals('"\\uda21"', JSON.stringify('\uDA21'));
assertEquals('"\\uda22"', JSON.stringify('\uDA22'));
assertEquals('"\\uda23"', JSON.stringify('\uDA23'));
assertEquals('"\\uda24"', JSON.stringify('\uDA24'));
assertEquals('"\\uda25"', JSON.stringify('\uDA25'));
assertEquals('"\\uda26"', JSON.stringify('\uDA26'));
assertEquals('"\\uda27"', JSON.stringify('\uDA27'));
assertEquals('"\\uda28"', JSON.stringify('\uDA28'));
assertEquals('"\\uda29"', JSON.stringify('\uDA29'));
assertEquals('"\\uda2a"', JSON.stringify('\uDA2A'));
assertEquals('"\\uda2b"', JSON.stringify('\uDA2B'));
assertEquals('"\\uda2c"', JSON.stringify('\uDA2C'));
assertEquals('"\\uda2d"', JSON.stringify('\uDA2D'));
assertEquals('"\\uda2e"', JSON.stringify('\uDA2E'));
assertEquals('"\\uda2f"', JSON.stringify('\uDA2F'));
assertEquals('"\\uda30"', JSON.stringify('\uDA30'));
assertEquals('"\\uda31"', JSON.stringify('\uDA31'));
assertEquals('"\\uda32"', JSON.stringify('\uDA32'));
assertEquals('"\\uda33"', JSON.stringify('\uDA33'));
assertEquals('"\\uda34"', JSON.stringify('\uDA34'));
assertEquals('"\\uda35"', JSON.stringify('\uDA35'));
assertEquals('"\\uda36"', JSON.stringify('\uDA36'));
assertEquals('"\\uda37"', JSON.stringify('\uDA37'));
assertEquals('"\\uda38"', JSON.stringify('\uDA38'));
assertEquals('"\\uda39"', JSON.stringify('\uDA39'));
assertEquals('"\\uda3a"', JSON.stringify('\uDA3A'));
assertEquals('"\\uda3b"', JSON.stringify('\uDA3B'));
assertEquals('"\\uda3c"', JSON.stringify('\uDA3C'));
assertEquals('"\\uda3d"', JSON.stringify('\uDA3D'));
assertEquals('"\\uda3e"', JSON.stringify('\uDA3E'));
assertEquals('"\\uda3f"', JSON.stringify('\uDA3F'));
assertEquals('"\\uda40"', JSON.stringify('\uDA40'));
assertEquals('"\\uda41"', JSON.stringify('\uDA41'));
assertEquals('"\\uda42"', JSON.stringify('\uDA42'));
assertEquals('"\\uda43"', JSON.stringify('\uDA43'));
assertEquals('"\\uda44"', JSON.stringify('\uDA44'));
assertEquals('"\\uda45"', JSON.stringify('\uDA45'));
assertEquals('"\\uda46"', JSON.stringify('\uDA46'));
assertEquals('"\\uda47"', JSON.stringify('\uDA47'));
assertEquals('"\\uda48"', JSON.stringify('\uDA48'));
assertEquals('"\\uda49"', JSON.stringify('\uDA49'));
assertEquals('"\\uda4a"', JSON.stringify('\uDA4A'));
assertEquals('"\\uda4b"', JSON.stringify('\uDA4B'));
assertEquals('"\\uda4c"', JSON.stringify('\uDA4C'));
assertEquals('"\\uda4d"', JSON.stringify('\uDA4D'));
assertEquals('"\\uda4e"', JSON.stringify('\uDA4E'));
assertEquals('"\\uda4f"', JSON.stringify('\uDA4F'));
assertEquals('"\\uda50"', JSON.stringify('\uDA50'));
assertEquals('"\\uda51"', JSON.stringify('\uDA51'));
assertEquals('"\\uda52"', JSON.stringify('\uDA52'));
assertEquals('"\\uda53"', JSON.stringify('\uDA53'));
assertEquals('"\\uda54"', JSON.stringify('\uDA54'));
assertEquals('"\\uda55"', JSON.stringify('\uDA55'));
assertEquals('"\\uda56"', JSON.stringify('\uDA56'));
assertEquals('"\\uda57"', JSON.stringify('\uDA57'));
assertEquals('"\\uda58"', JSON.stringify('\uDA58'));
assertEquals('"\\uda59"', JSON.stringify('\uDA59'));
assertEquals('"\\uda5a"', JSON.stringify('\uDA5A'));
assertEquals('"\\uda5b"', JSON.stringify('\uDA5B'));
assertEquals('"\\uda5c"', JSON.stringify('\uDA5C'));
assertEquals('"\\uda5d"', JSON.stringify('\uDA5D'));
assertEquals('"\\uda5e"', JSON.stringify('\uDA5E'));
assertEquals('"\\uda5f"', JSON.stringify('\uDA5F'));
assertEquals('"\\uda60"', JSON.stringify('\uDA60'));
assertEquals('"\\uda61"', JSON.stringify('\uDA61'));
assertEquals('"\\uda62"', JSON.stringify('\uDA62'));
assertEquals('"\\uda63"', JSON.stringify('\uDA63'));
assertEquals('"\\uda64"', JSON.stringify('\uDA64'));
assertEquals('"\\uda65"', JSON.stringify('\uDA65'));
assertEquals('"\\uda66"', JSON.stringify('\uDA66'));
assertEquals('"\\uda67"', JSON.stringify('\uDA67'));
assertEquals('"\\uda68"', JSON.stringify('\uDA68'));
assertEquals('"\\uda69"', JSON.stringify('\uDA69'));
assertEquals('"\\uda6a"', JSON.stringify('\uDA6A'));
assertEquals('"\\uda6b"', JSON.stringify('\uDA6B'));
assertEquals('"\\uda6c"', JSON.stringify('\uDA6C'));
assertEquals('"\\uda6d"', JSON.stringify('\uDA6D'));
assertEquals('"\\uda6e"', JSON.stringify('\uDA6E'));
assertEquals('"\\uda6f"', JSON.stringify('\uDA6F'));
assertEquals('"\\uda70"', JSON.stringify('\uDA70'));
assertEquals('"\\uda71"', JSON.stringify('\uDA71'));
assertEquals('"\\uda72"', JSON.stringify('\uDA72'));
assertEquals('"\\uda73"', JSON.stringify('\uDA73'));
assertEquals('"\\uda74"', JSON.stringify('\uDA74'));
assertEquals('"\\uda75"', JSON.stringify('\uDA75'));
assertEquals('"\\uda76"', JSON.stringify('\uDA76'));
assertEquals('"\\uda77"', JSON.stringify('\uDA77'));
assertEquals('"\\uda78"', JSON.stringify('\uDA78'));
assertEquals('"\\uda79"', JSON.stringify('\uDA79'));
assertEquals('"\\uda7a"', JSON.stringify('\uDA7A'));
assertEquals('"\\uda7b"', JSON.stringify('\uDA7B'));
assertEquals('"\\uda7c"', JSON.stringify('\uDA7C'));
assertEquals('"\\uda7d"', JSON.stringify('\uDA7D'));
assertEquals('"\\uda7e"', JSON.stringify('\uDA7E'));
assertEquals('"\\uda7f"', JSON.stringify('\uDA7F'));
assertEquals('"\\uda80"', JSON.stringify('\uDA80'));
assertEquals('"\\uda81"', JSON.stringify('\uDA81'));
assertEquals('"\\uda82"', JSON.stringify('\uDA82'));
assertEquals('"\\uda83"', JSON.stringify('\uDA83'));
assertEquals('"\\uda84"', JSON.stringify('\uDA84'));
assertEquals('"\\uda85"', JSON.stringify('\uDA85'));
assertEquals('"\\uda86"', JSON.stringify('\uDA86'));
assertEquals('"\\uda87"', JSON.stringify('\uDA87'));
assertEquals('"\\uda88"', JSON.stringify('\uDA88'));
assertEquals('"\\uda89"', JSON.stringify('\uDA89'));
assertEquals('"\\uda8a"', JSON.stringify('\uDA8A'));
assertEquals('"\\uda8b"', JSON.stringify('\uDA8B'));
assertEquals('"\\uda8c"', JSON.stringify('\uDA8C'));
assertEquals('"\\uda8d"', JSON.stringify('\uDA8D'));
assertEquals('"\\uda8e"', JSON.stringify('\uDA8E'));
assertEquals('"\\uda8f"', JSON.stringify('\uDA8F'));
assertEquals('"\\uda90"', JSON.stringify('\uDA90'));
assertEquals('"\\uda91"', JSON.stringify('\uDA91'));
assertEquals('"\\uda92"', JSON.stringify('\uDA92'));
assertEquals('"\\uda93"', JSON.stringify('\uDA93'));
assertEquals('"\\uda94"', JSON.stringify('\uDA94'));
assertEquals('"\\uda95"', JSON.stringify('\uDA95'));
assertEquals('"\\uda96"', JSON.stringify('\uDA96'));
assertEquals('"\\uda97"', JSON.stringify('\uDA97'));
assertEquals('"\\uda98"', JSON.stringify('\uDA98'));
assertEquals('"\\uda99"', JSON.stringify('\uDA99'));
assertEquals('"\\uda9a"', JSON.stringify('\uDA9A'));
assertEquals('"\\uda9b"', JSON.stringify('\uDA9B'));
assertEquals('"\\uda9c"', JSON.stringify('\uDA9C'));
assertEquals('"\\uda9d"', JSON.stringify('\uDA9D'));
assertEquals('"\\uda9e"', JSON.stringify('\uDA9E'));
assertEquals('"\\uda9f"', JSON.stringify('\uDA9F'));
assertEquals('"\\udaa0"', JSON.stringify('\uDAA0'));
assertEquals('"\\udaa1"', JSON.stringify('\uDAA1'));
assertEquals('"\\udaa2"', JSON.stringify('\uDAA2'));
assertEquals('"\\udaa3"', JSON.stringify('\uDAA3'));
assertEquals('"\\udaa4"', JSON.stringify('\uDAA4'));
assertEquals('"\\udaa5"', JSON.stringify('\uDAA5'));
assertEquals('"\\udaa6"', JSON.stringify('\uDAA6'));
assertEquals('"\\udaa7"', JSON.stringify('\uDAA7'));
assertEquals('"\\udaa8"', JSON.stringify('\uDAA8'));
assertEquals('"\\udaa9"', JSON.stringify('\uDAA9'));
assertEquals('"\\udaaa"', JSON.stringify('\uDAAA'));
assertEquals('"\\udaab"', JSON.stringify('\uDAAB'));
assertEquals('"\\udaac"', JSON.stringify('\uDAAC'));
assertEquals('"\\udaad"', JSON.stringify('\uDAAD'));
assertEquals('"\\udaae"', JSON.stringify('\uDAAE'));
assertEquals('"\\udaaf"', JSON.stringify('\uDAAF'));
assertEquals('"\\udab0"', JSON.stringify('\uDAB0'));
assertEquals('"\\udab1"', JSON.stringify('\uDAB1'));
assertEquals('"\\udab2"', JSON.stringify('\uDAB2'));
assertEquals('"\\udab3"', JSON.stringify('\uDAB3'));
assertEquals('"\\udab4"', JSON.stringify('\uDAB4'));
assertEquals('"\\udab5"', JSON.stringify('\uDAB5'));
assertEquals('"\\udab6"', JSON.stringify('\uDAB6'));
assertEquals('"\\udab7"', JSON.stringify('\uDAB7'));
assertEquals('"\\udab8"', JSON.stringify('\uDAB8'));
assertEquals('"\\udab9"', JSON.stringify('\uDAB9'));
assertEquals('"\\udaba"', JSON.stringify('\uDABA'));
assertEquals('"\\udabb"', JSON.stringify('\uDABB'));
assertEquals('"\\udabc"', JSON.stringify('\uDABC'));
assertEquals('"\\udabd"', JSON.stringify('\uDABD'));
assertEquals('"\\udabe"', JSON.stringify('\uDABE'));
assertEquals('"\\udabf"', JSON.stringify('\uDABF'));
assertEquals('"\\udac0"', JSON.stringify('\uDAC0'));
assertEquals('"\\udac1"', JSON.stringify('\uDAC1'));
assertEquals('"\\udac2"', JSON.stringify('\uDAC2'));
assertEquals('"\\udac3"', JSON.stringify('\uDAC3'));
assertEquals('"\\udac4"', JSON.stringify('\uDAC4'));
assertEquals('"\\udac5"', JSON.stringify('\uDAC5'));
assertEquals('"\\udac6"', JSON.stringify('\uDAC6'));
assertEquals('"\\udac7"', JSON.stringify('\uDAC7'));
assertEquals('"\\udac8"', JSON.stringify('\uDAC8'));
assertEquals('"\\udac9"', JSON.stringify('\uDAC9'));
assertEquals('"\\udaca"', JSON.stringify('\uDACA'));
assertEquals('"\\udacb"', JSON.stringify('\uDACB'));
assertEquals('"\\udacc"', JSON.stringify('\uDACC'));
assertEquals('"\\udacd"', JSON.stringify('\uDACD'));
assertEquals('"\\udace"', JSON.stringify('\uDACE'));
assertEquals('"\\udacf"', JSON.stringify('\uDACF'));
assertEquals('"\\udad0"', JSON.stringify('\uDAD0'));
assertEquals('"\\udad1"', JSON.stringify('\uDAD1'));
assertEquals('"\\udad2"', JSON.stringify('\uDAD2'));
assertEquals('"\\udad3"', JSON.stringify('\uDAD3'));
assertEquals('"\\udad4"', JSON.stringify('\uDAD4'));
assertEquals('"\\udad5"', JSON.stringify('\uDAD5'));
assertEquals('"\\udad6"', JSON.stringify('\uDAD6'));
assertEquals('"\\udad7"', JSON.stringify('\uDAD7'));
assertEquals('"\\udad8"', JSON.stringify('\uDAD8'));
assertEquals('"\\udad9"', JSON.stringify('\uDAD9'));
assertEquals('"\\udada"', JSON.stringify('\uDADA'));
assertEquals('"\\udadb"', JSON.stringify('\uDADB'));
assertEquals('"\\udadc"', JSON.stringify('\uDADC'));
assertEquals('"\\udadd"', JSON.stringify('\uDADD'));
assertEquals('"\\udade"', JSON.stringify('\uDADE'));
assertEquals('"\\udadf"', JSON.stringify('\uDADF'));
assertEquals('"\\udae0"', JSON.stringify('\uDAE0'));
assertEquals('"\\udae1"', JSON.stringify('\uDAE1'));
assertEquals('"\\udae2"', JSON.stringify('\uDAE2'));
assertEquals('"\\udae3"', JSON.stringify('\uDAE3'));
assertEquals('"\\udae4"', JSON.stringify('\uDAE4'));
assertEquals('"\\udae5"', JSON.stringify('\uDAE5'));
assertEquals('"\\udae6"', JSON.stringify('\uDAE6'));
assertEquals('"\\udae7"', JSON.stringify('\uDAE7'));
assertEquals('"\\udae8"', JSON.stringify('\uDAE8'));
assertEquals('"\\udae9"', JSON.stringify('\uDAE9'));
assertEquals('"\\udaea"', JSON.stringify('\uDAEA'));
assertEquals('"\\udaeb"', JSON.stringify('\uDAEB'));
assertEquals('"\\udaec"', JSON.stringify('\uDAEC'));
assertEquals('"\\udaed"', JSON.stringify('\uDAED'));
assertEquals('"\\udaee"', JSON.stringify('\uDAEE'));
assertEquals('"\\udaef"', JSON.stringify('\uDAEF'));
assertEquals('"\\udaf0"', JSON.stringify('\uDAF0'));
assertEquals('"\\udaf1"', JSON.stringify('\uDAF1'));
assertEquals('"\\udaf2"', JSON.stringify('\uDAF2'));
assertEquals('"\\udaf3"', JSON.stringify('\uDAF3'));
assertEquals('"\\udaf4"', JSON.stringify('\uDAF4'));
assertEquals('"\\udaf5"', JSON.stringify('\uDAF5'));
assertEquals('"\\udaf6"', JSON.stringify('\uDAF6'));
assertEquals('"\\udaf7"', JSON.stringify('\uDAF7'));
assertEquals('"\\udaf8"', JSON.stringify('\uDAF8'));
assertEquals('"\\udaf9"', JSON.stringify('\uDAF9'));
assertEquals('"\\udafa"', JSON.stringify('\uDAFA'));
assertEquals('"\\udafb"', JSON.stringify('\uDAFB'));
assertEquals('"\\udafc"', JSON.stringify('\uDAFC'));
assertEquals('"\\udafd"', JSON.stringify('\uDAFD'));
assertEquals('"\\udafe"', JSON.stringify('\uDAFE'));
assertEquals('"\\udaff"', JSON.stringify('\uDAFF'));
assertEquals('"\\udb00"', JSON.stringify('\uDB00'));
assertEquals('"\\udb01"', JSON.stringify('\uDB01'));
assertEquals('"\\udb02"', JSON.stringify('\uDB02'));
assertEquals('"\\udb03"', JSON.stringify('\uDB03'));
assertEquals('"\\udb04"', JSON.stringify('\uDB04'));
assertEquals('"\\udb05"', JSON.stringify('\uDB05'));
assertEquals('"\\udb06"', JSON.stringify('\uDB06'));
assertEquals('"\\udb07"', JSON.stringify('\uDB07'));
assertEquals('"\\udb08"', JSON.stringify('\uDB08'));
assertEquals('"\\udb09"', JSON.stringify('\uDB09'));
assertEquals('"\\udb0a"', JSON.stringify('\uDB0A'));
assertEquals('"\\udb0b"', JSON.stringify('\uDB0B'));
assertEquals('"\\udb0c"', JSON.stringify('\uDB0C'));
assertEquals('"\\udb0d"', JSON.stringify('\uDB0D'));
assertEquals('"\\udb0e"', JSON.stringify('\uDB0E'));
assertEquals('"\\udb0f"', JSON.stringify('\uDB0F'));
assertEquals('"\\udb10"', JSON.stringify('\uDB10'));
assertEquals('"\\udb11"', JSON.stringify('\uDB11'));
assertEquals('"\\udb12"', JSON.stringify('\uDB12'));
assertEquals('"\\udb13"', JSON.stringify('\uDB13'));
assertEquals('"\\udb14"', JSON.stringify('\uDB14'));
assertEquals('"\\udb15"', JSON.stringify('\uDB15'));
assertEquals('"\\udb16"', JSON.stringify('\uDB16'));
assertEquals('"\\udb17"', JSON.stringify('\uDB17'));
assertEquals('"\\udb18"', JSON.stringify('\uDB18'));
assertEquals('"\\udb19"', JSON.stringify('\uDB19'));
assertEquals('"\\udb1a"', JSON.stringify('\uDB1A'));
assertEquals('"\\udb1b"', JSON.stringify('\uDB1B'));
assertEquals('"\\udb1c"', JSON.stringify('\uDB1C'));
assertEquals('"\\udb1d"', JSON.stringify('\uDB1D'));
assertEquals('"\\udb1e"', JSON.stringify('\uDB1E'));
assertEquals('"\\udb1f"', JSON.stringify('\uDB1F'));
assertEquals('"\\udb20"', JSON.stringify('\uDB20'));
assertEquals('"\\udb21"', JSON.stringify('\uDB21'));
assertEquals('"\\udb22"', JSON.stringify('\uDB22'));
assertEquals('"\\udb23"', JSON.stringify('\uDB23'));
assertEquals('"\\udb24"', JSON.stringify('\uDB24'));
assertEquals('"\\udb25"', JSON.stringify('\uDB25'));
assertEquals('"\\udb26"', JSON.stringify('\uDB26'));
assertEquals('"\\udb27"', JSON.stringify('\uDB27'));
assertEquals('"\\udb28"', JSON.stringify('\uDB28'));
assertEquals('"\\udb29"', JSON.stringify('\uDB29'));
assertEquals('"\\udb2a"', JSON.stringify('\uDB2A'));
assertEquals('"\\udb2b"', JSON.stringify('\uDB2B'));
assertEquals('"\\udb2c"', JSON.stringify('\uDB2C'));
assertEquals('"\\udb2d"', JSON.stringify('\uDB2D'));
assertEquals('"\\udb2e"', JSON.stringify('\uDB2E'));
assertEquals('"\\udb2f"', JSON.stringify('\uDB2F'));
assertEquals('"\\udb30"', JSON.stringify('\uDB30'));
assertEquals('"\\udb31"', JSON.stringify('\uDB31'));
assertEquals('"\\udb32"', JSON.stringify('\uDB32'));
assertEquals('"\\udb33"', JSON.stringify('\uDB33'));
assertEquals('"\\udb34"', JSON.stringify('\uDB34'));
assertEquals('"\\udb35"', JSON.stringify('\uDB35'));
assertEquals('"\\udb36"', JSON.stringify('\uDB36'));
assertEquals('"\\udb37"', JSON.stringify('\uDB37'));
assertEquals('"\\udb38"', JSON.stringify('\uDB38'));
assertEquals('"\\udb39"', JSON.stringify('\uDB39'));
assertEquals('"\\udb3a"', JSON.stringify('\uDB3A'));
assertEquals('"\\udb3b"', JSON.stringify('\uDB3B'));
assertEquals('"\\udb3c"', JSON.stringify('\uDB3C'));
assertEquals('"\\udb3d"', JSON.stringify('\uDB3D'));
assertEquals('"\\udb3e"', JSON.stringify('\uDB3E'));
assertEquals('"\\udb3f"', JSON.stringify('\uDB3F'));
assertEquals('"\\udb40"', JSON.stringify('\uDB40'));
assertEquals('"\\udb41"', JSON.stringify('\uDB41'));
assertEquals('"\\udb42"', JSON.stringify('\uDB42'));
assertEquals('"\\udb43"', JSON.stringify('\uDB43'));
assertEquals('"\\udb44"', JSON.stringify('\uDB44'));
assertEquals('"\\udb45"', JSON.stringify('\uDB45'));
assertEquals('"\\udb46"', JSON.stringify('\uDB46'));
assertEquals('"\\udb47"', JSON.stringify('\uDB47'));
assertEquals('"\\udb48"', JSON.stringify('\uDB48'));
assertEquals('"\\udb49"', JSON.stringify('\uDB49'));
assertEquals('"\\udb4a"', JSON.stringify('\uDB4A'));
assertEquals('"\\udb4b"', JSON.stringify('\uDB4B'));
assertEquals('"\\udb4c"', JSON.stringify('\uDB4C'));
assertEquals('"\\udb4d"', JSON.stringify('\uDB4D'));
assertEquals('"\\udb4e"', JSON.stringify('\uDB4E'));
assertEquals('"\\udb4f"', JSON.stringify('\uDB4F'));
assertEquals('"\\udb50"', JSON.stringify('\uDB50'));
assertEquals('"\\udb51"', JSON.stringify('\uDB51'));
assertEquals('"\\udb52"', JSON.stringify('\uDB52'));
assertEquals('"\\udb53"', JSON.stringify('\uDB53'));
assertEquals('"\\udb54"', JSON.stringify('\uDB54'));
assertEquals('"\\udb55"', JSON.stringify('\uDB55'));
assertEquals('"\\udb56"', JSON.stringify('\uDB56'));
assertEquals('"\\udb57"', JSON.stringify('\uDB57'));
assertEquals('"\\udb58"', JSON.stringify('\uDB58'));
assertEquals('"\\udb59"', JSON.stringify('\uDB59'));
assertEquals('"\\udb5a"', JSON.stringify('\uDB5A'));
assertEquals('"\\udb5b"', JSON.stringify('\uDB5B'));
assertEquals('"\\udb5c"', JSON.stringify('\uDB5C'));
assertEquals('"\\udb5d"', JSON.stringify('\uDB5D'));
assertEquals('"\\udb5e"', JSON.stringify('\uDB5E'));
assertEquals('"\\udb5f"', JSON.stringify('\uDB5F'));
assertEquals('"\\udb60"', JSON.stringify('\uDB60'));
assertEquals('"\\udb61"', JSON.stringify('\uDB61'));
assertEquals('"\\udb62"', JSON.stringify('\uDB62'));
assertEquals('"\\udb63"', JSON.stringify('\uDB63'));
assertEquals('"\\udb64"', JSON.stringify('\uDB64'));
assertEquals('"\\udb65"', JSON.stringify('\uDB65'));
assertEquals('"\\udb66"', JSON.stringify('\uDB66'));
assertEquals('"\\udb67"', JSON.stringify('\uDB67'));
assertEquals('"\\udb68"', JSON.stringify('\uDB68'));
assertEquals('"\\udb69"', JSON.stringify('\uDB69'));
assertEquals('"\\udb6a"', JSON.stringify('\uDB6A'));
assertEquals('"\\udb6b"', JSON.stringify('\uDB6B'));
assertEquals('"\\udb6c"', JSON.stringify('\uDB6C'));
assertEquals('"\\udb6d"', JSON.stringify('\uDB6D'));
assertEquals('"\\udb6e"', JSON.stringify('\uDB6E'));
assertEquals('"\\udb6f"', JSON.stringify('\uDB6F'));
assertEquals('"\\udb70"', JSON.stringify('\uDB70'));
assertEquals('"\\udb71"', JSON.stringify('\uDB71'));
assertEquals('"\\udb72"', JSON.stringify('\uDB72'));
assertEquals('"\\udb73"', JSON.stringify('\uDB73'));
assertEquals('"\\udb74"', JSON.stringify('\uDB74'));
assertEquals('"\\udb75"', JSON.stringify('\uDB75'));
assertEquals('"\\udb76"', JSON.stringify('\uDB76'));
assertEquals('"\\udb77"', JSON.stringify('\uDB77'));
assertEquals('"\\udb78"', JSON.stringify('\uDB78'));
assertEquals('"\\udb79"', JSON.stringify('\uDB79'));
assertEquals('"\\udb7a"', JSON.stringify('\uDB7A'));
assertEquals('"\\udb7b"', JSON.stringify('\uDB7B'));
assertEquals('"\\udb7c"', JSON.stringify('\uDB7C'));
assertEquals('"\\udb7d"', JSON.stringify('\uDB7D'));
assertEquals('"\\udb7e"', JSON.stringify('\uDB7E'));
assertEquals('"\\udb7f"', JSON.stringify('\uDB7F'));
assertEquals('"\\udb80"', JSON.stringify('\uDB80'));
assertEquals('"\\udb81"', JSON.stringify('\uDB81'));
assertEquals('"\\udb82"', JSON.stringify('\uDB82'));
assertEquals('"\\udb83"', JSON.stringify('\uDB83'));
assertEquals('"\\udb84"', JSON.stringify('\uDB84'));
assertEquals('"\\udb85"', JSON.stringify('\uDB85'));
assertEquals('"\\udb86"', JSON.stringify('\uDB86'));
assertEquals('"\\udb87"', JSON.stringify('\uDB87'));
assertEquals('"\\udb88"', JSON.stringify('\uDB88'));
assertEquals('"\\udb89"', JSON.stringify('\uDB89'));
assertEquals('"\\udb8a"', JSON.stringify('\uDB8A'));
assertEquals('"\\udb8b"', JSON.stringify('\uDB8B'));
assertEquals('"\\udb8c"', JSON.stringify('\uDB8C'));
assertEquals('"\\udb8d"', JSON.stringify('\uDB8D'));
assertEquals('"\\udb8e"', JSON.stringify('\uDB8E'));
assertEquals('"\\udb8f"', JSON.stringify('\uDB8F'));
assertEquals('"\\udb90"', JSON.stringify('\uDB90'));
assertEquals('"\\udb91"', JSON.stringify('\uDB91'));
assertEquals('"\\udb92"', JSON.stringify('\uDB92'));
assertEquals('"\\udb93"', JSON.stringify('\uDB93'));
assertEquals('"\\udb94"', JSON.stringify('\uDB94'));
assertEquals('"\\udb95"', JSON.stringify('\uDB95'));
assertEquals('"\\udb96"', JSON.stringify('\uDB96'));
assertEquals('"\\udb97"', JSON.stringify('\uDB97'));
assertEquals('"\\udb98"', JSON.stringify('\uDB98'));
assertEquals('"\\udb99"', JSON.stringify('\uDB99'));
assertEquals('"\\udb9a"', JSON.stringify('\uDB9A'));
assertEquals('"\\udb9b"', JSON.stringify('\uDB9B'));
assertEquals('"\\udb9c"', JSON.stringify('\uDB9C'));
assertEquals('"\\udb9d"', JSON.stringify('\uDB9D'));
assertEquals('"\\udb9e"', JSON.stringify('\uDB9E'));
assertEquals('"\\udb9f"', JSON.stringify('\uDB9F'));
assertEquals('"\\udba0"', JSON.stringify('\uDBA0'));
assertEquals('"\\udba1"', JSON.stringify('\uDBA1'));
assertEquals('"\\udba2"', JSON.stringify('\uDBA2'));
assertEquals('"\\udba3"', JSON.stringify('\uDBA3'));
assertEquals('"\\udba4"', JSON.stringify('\uDBA4'));
assertEquals('"\\udba5"', JSON.stringify('\uDBA5'));
assertEquals('"\\udba6"', JSON.stringify('\uDBA6'));
assertEquals('"\\udba7"', JSON.stringify('\uDBA7'));
assertEquals('"\\udba8"', JSON.stringify('\uDBA8'));
assertEquals('"\\udba9"', JSON.stringify('\uDBA9'));
assertEquals('"\\udbaa"', JSON.stringify('\uDBAA'));
assertEquals('"\\udbab"', JSON.stringify('\uDBAB'));
assertEquals('"\\udbac"', JSON.stringify('\uDBAC'));
assertEquals('"\\udbad"', JSON.stringify('\uDBAD'));
assertEquals('"\\udbae"', JSON.stringify('\uDBAE'));
assertEquals('"\\udbaf"', JSON.stringify('\uDBAF'));
assertEquals('"\\udbb0"', JSON.stringify('\uDBB0'));
assertEquals('"\\udbb1"', JSON.stringify('\uDBB1'));
assertEquals('"\\udbb2"', JSON.stringify('\uDBB2'));
assertEquals('"\\udbb3"', JSON.stringify('\uDBB3'));
assertEquals('"\\udbb4"', JSON.stringify('\uDBB4'));
assertEquals('"\\udbb5"', JSON.stringify('\uDBB5'));
assertEquals('"\\udbb6"', JSON.stringify('\uDBB6'));
assertEquals('"\\udbb7"', JSON.stringify('\uDBB7'));
assertEquals('"\\udbb8"', JSON.stringify('\uDBB8'));
assertEquals('"\\udbb9"', JSON.stringify('\uDBB9'));
assertEquals('"\\udbba"', JSON.stringify('\uDBBA'));
assertEquals('"\\udbbb"', JSON.stringify('\uDBBB'));
assertEquals('"\\udbbc"', JSON.stringify('\uDBBC'));
assertEquals('"\\udbbd"', JSON.stringify('\uDBBD'));
assertEquals('"\\udbbe"', JSON.stringify('\uDBBE'));
assertEquals('"\\udbbf"', JSON.stringify('\uDBBF'));
assertEquals('"\\udbc0"', JSON.stringify('\uDBC0'));
assertEquals('"\\udbc1"', JSON.stringify('\uDBC1'));
assertEquals('"\\udbc2"', JSON.stringify('\uDBC2'));
assertEquals('"\\udbc3"', JSON.stringify('\uDBC3'));
assertEquals('"\\udbc4"', JSON.stringify('\uDBC4'));
assertEquals('"\\udbc5"', JSON.stringify('\uDBC5'));
assertEquals('"\\udbc6"', JSON.stringify('\uDBC6'));
assertEquals('"\\udbc7"', JSON.stringify('\uDBC7'));
assertEquals('"\\udbc8"', JSON.stringify('\uDBC8'));
assertEquals('"\\udbc9"', JSON.stringify('\uDBC9'));
assertEquals('"\\udbca"', JSON.stringify('\uDBCA'));
assertEquals('"\\udbcb"', JSON.stringify('\uDBCB'));
assertEquals('"\\udbcc"', JSON.stringify('\uDBCC'));
assertEquals('"\\udbcd"', JSON.stringify('\uDBCD'));
assertEquals('"\\udbce"', JSON.stringify('\uDBCE'));
assertEquals('"\\udbcf"', JSON.stringify('\uDBCF'));
assertEquals('"\\udbd0"', JSON.stringify('\uDBD0'));
assertEquals('"\\udbd1"', JSON.stringify('\uDBD1'));
assertEquals('"\\udbd2"', JSON.stringify('\uDBD2'));
assertEquals('"\\udbd3"', JSON.stringify('\uDBD3'));
assertEquals('"\\udbd4"', JSON.stringify('\uDBD4'));
assertEquals('"\\udbd5"', JSON.stringify('\uDBD5'));
assertEquals('"\\udbd6"', JSON.stringify('\uDBD6'));
assertEquals('"\\udbd7"', JSON.stringify('\uDBD7'));
assertEquals('"\\udbd8"', JSON.stringify('\uDBD8'));
assertEquals('"\\udbd9"', JSON.stringify('\uDBD9'));
assertEquals('"\\udbda"', JSON.stringify('\uDBDA'));
assertEquals('"\\udbdb"', JSON.stringify('\uDBDB'));
assertEquals('"\\udbdc"', JSON.stringify('\uDBDC'));
assertEquals('"\\udbdd"', JSON.stringify('\uDBDD'));
assertEquals('"\\udbde"', JSON.stringify('\uDBDE'));
assertEquals('"\\udbdf"', JSON.stringify('\uDBDF'));
assertEquals('"\\udbe0"', JSON.stringify('\uDBE0'));
assertEquals('"\\udbe1"', JSON.stringify('\uDBE1'));
assertEquals('"\\udbe2"', JSON.stringify('\uDBE2'));
assertEquals('"\\udbe3"', JSON.stringify('\uDBE3'));
assertEquals('"\\udbe4"', JSON.stringify('\uDBE4'));
assertEquals('"\\udbe5"', JSON.stringify('\uDBE5'));
assertEquals('"\\udbe6"', JSON.stringify('\uDBE6'));
assertEquals('"\\udbe7"', JSON.stringify('\uDBE7'));
assertEquals('"\\udbe8"', JSON.stringify('\uDBE8'));
assertEquals('"\\udbe9"', JSON.stringify('\uDBE9'));
assertEquals('"\\udbea"', JSON.stringify('\uDBEA'));
assertEquals('"\\udbeb"', JSON.stringify('\uDBEB'));
assertEquals('"\\udbec"', JSON.stringify('\uDBEC'));
assertEquals('"\\udbed"', JSON.stringify('\uDBED'));
assertEquals('"\\udbee"', JSON.stringify('\uDBEE'));
assertEquals('"\\udbef"', JSON.stringify('\uDBEF'));
assertEquals('"\\udbf0"', JSON.stringify('\uDBF0'));
assertEquals('"\\udbf1"', JSON.stringify('\uDBF1'));
assertEquals('"\\udbf2"', JSON.stringify('\uDBF2'));
assertEquals('"\\udbf3"', JSON.stringify('\uDBF3'));
assertEquals('"\\udbf4"', JSON.stringify('\uDBF4'));
assertEquals('"\\udbf5"', JSON.stringify('\uDBF5'));
assertEquals('"\\udbf6"', JSON.stringify('\uDBF6'));
assertEquals('"\\udbf7"', JSON.stringify('\uDBF7'));
assertEquals('"\\udbf8"', JSON.stringify('\uDBF8'));
assertEquals('"\\udbf9"', JSON.stringify('\uDBF9'));
assertEquals('"\\udbfa"', JSON.stringify('\uDBFA'));
assertEquals('"\\udbfb"', JSON.stringify('\uDBFB'));
assertEquals('"\\udbfc"', JSON.stringify('\uDBFC'));
assertEquals('"\\udbfd"', JSON.stringify('\uDBFD'));
assertEquals('"\\udbfe"', JSON.stringify('\uDBFE'));
assertEquals('"\\udbff"', JSON.stringify('\uDBFF'));
assertEquals('"\\udc00"', JSON.stringify('\uDC00'));
assertEquals('"\\udc01"', JSON.stringify('\uDC01'));
assertEquals('"\\udc02"', JSON.stringify('\uDC02'));
assertEquals('"\\udc03"', JSON.stringify('\uDC03'));
assertEquals('"\\udc04"', JSON.stringify('\uDC04'));
assertEquals('"\\udc05"', JSON.stringify('\uDC05'));
assertEquals('"\\udc06"', JSON.stringify('\uDC06'));
assertEquals('"\\udc07"', JSON.stringify('\uDC07'));
assertEquals('"\\udc08"', JSON.stringify('\uDC08'));
assertEquals('"\\udc09"', JSON.stringify('\uDC09'));
assertEquals('"\\udc0a"', JSON.stringify('\uDC0A'));
assertEquals('"\\udc0b"', JSON.stringify('\uDC0B'));
assertEquals('"\\udc0c"', JSON.stringify('\uDC0C'));
assertEquals('"\\udc0d"', JSON.stringify('\uDC0D'));
assertEquals('"\\udc0e"', JSON.stringify('\uDC0E'));
assertEquals('"\\udc0f"', JSON.stringify('\uDC0F'));
assertEquals('"\\udc10"', JSON.stringify('\uDC10'));
assertEquals('"\\udc11"', JSON.stringify('\uDC11'));
assertEquals('"\\udc12"', JSON.stringify('\uDC12'));
assertEquals('"\\udc13"', JSON.stringify('\uDC13'));
assertEquals('"\\udc14"', JSON.stringify('\uDC14'));
assertEquals('"\\udc15"', JSON.stringify('\uDC15'));
assertEquals('"\\udc16"', JSON.stringify('\uDC16'));
assertEquals('"\\udc17"', JSON.stringify('\uDC17'));
assertEquals('"\\udc18"', JSON.stringify('\uDC18'));
assertEquals('"\\udc19"', JSON.stringify('\uDC19'));
assertEquals('"\\udc1a"', JSON.stringify('\uDC1A'));
assertEquals('"\\udc1b"', JSON.stringify('\uDC1B'));
assertEquals('"\\udc1c"', JSON.stringify('\uDC1C'));
assertEquals('"\\udc1d"', JSON.stringify('\uDC1D'));
assertEquals('"\\udc1e"', JSON.stringify('\uDC1E'));
assertEquals('"\\udc1f"', JSON.stringify('\uDC1F'));
assertEquals('"\\udc20"', JSON.stringify('\uDC20'));
assertEquals('"\\udc21"', JSON.stringify('\uDC21'));
assertEquals('"\\udc22"', JSON.stringify('\uDC22'));
assertEquals('"\\udc23"', JSON.stringify('\uDC23'));
assertEquals('"\\udc24"', JSON.stringify('\uDC24'));
assertEquals('"\\udc25"', JSON.stringify('\uDC25'));
assertEquals('"\\udc26"', JSON.stringify('\uDC26'));
assertEquals('"\\udc27"', JSON.stringify('\uDC27'));
assertEquals('"\\udc28"', JSON.stringify('\uDC28'));
assertEquals('"\\udc29"', JSON.stringify('\uDC29'));
assertEquals('"\\udc2a"', JSON.stringify('\uDC2A'));
assertEquals('"\\udc2b"', JSON.stringify('\uDC2B'));
assertEquals('"\\udc2c"', JSON.stringify('\uDC2C'));
assertEquals('"\\udc2d"', JSON.stringify('\uDC2D'));
assertEquals('"\\udc2e"', JSON.stringify('\uDC2E'));
assertEquals('"\\udc2f"', JSON.stringify('\uDC2F'));
assertEquals('"\\udc30"', JSON.stringify('\uDC30'));
assertEquals('"\\udc31"', JSON.stringify('\uDC31'));
assertEquals('"\\udc32"', JSON.stringify('\uDC32'));
assertEquals('"\\udc33"', JSON.stringify('\uDC33'));
assertEquals('"\\udc34"', JSON.stringify('\uDC34'));
assertEquals('"\\udc35"', JSON.stringify('\uDC35'));
assertEquals('"\\udc36"', JSON.stringify('\uDC36'));
assertEquals('"\\udc37"', JSON.stringify('\uDC37'));
assertEquals('"\\udc38"', JSON.stringify('\uDC38'));
assertEquals('"\\udc39"', JSON.stringify('\uDC39'));
assertEquals('"\\udc3a"', JSON.stringify('\uDC3A'));
assertEquals('"\\udc3b"', JSON.stringify('\uDC3B'));
assertEquals('"\\udc3c"', JSON.stringify('\uDC3C'));
assertEquals('"\\udc3d"', JSON.stringify('\uDC3D'));
assertEquals('"\\udc3e"', JSON.stringify('\uDC3E'));
assertEquals('"\\udc3f"', JSON.stringify('\uDC3F'));
assertEquals('"\\udc40"', JSON.stringify('\uDC40'));
assertEquals('"\\udc41"', JSON.stringify('\uDC41'));
assertEquals('"\\udc42"', JSON.stringify('\uDC42'));
assertEquals('"\\udc43"', JSON.stringify('\uDC43'));
assertEquals('"\\udc44"', JSON.stringify('\uDC44'));
assertEquals('"\\udc45"', JSON.stringify('\uDC45'));
assertEquals('"\\udc46"', JSON.stringify('\uDC46'));
assertEquals('"\\udc47"', JSON.stringify('\uDC47'));
assertEquals('"\\udc48"', JSON.stringify('\uDC48'));
assertEquals('"\\udc49"', JSON.stringify('\uDC49'));
assertEquals('"\\udc4a"', JSON.stringify('\uDC4A'));
assertEquals('"\\udc4b"', JSON.stringify('\uDC4B'));
assertEquals('"\\udc4c"', JSON.stringify('\uDC4C'));
assertEquals('"\\udc4d"', JSON.stringify('\uDC4D'));
assertEquals('"\\udc4e"', JSON.stringify('\uDC4E'));
assertEquals('"\\udc4f"', JSON.stringify('\uDC4F'));
assertEquals('"\\udc50"', JSON.stringify('\uDC50'));
assertEquals('"\\udc51"', JSON.stringify('\uDC51'));
assertEquals('"\\udc52"', JSON.stringify('\uDC52'));
assertEquals('"\\udc53"', JSON.stringify('\uDC53'));
assertEquals('"\\udc54"', JSON.stringify('\uDC54'));
assertEquals('"\\udc55"', JSON.stringify('\uDC55'));
assertEquals('"\\udc56"', JSON.stringify('\uDC56'));
assertEquals('"\\udc57"', JSON.stringify('\uDC57'));
assertEquals('"\\udc58"', JSON.stringify('\uDC58'));
assertEquals('"\\udc59"', JSON.stringify('\uDC59'));
assertEquals('"\\udc5a"', JSON.stringify('\uDC5A'));
assertEquals('"\\udc5b"', JSON.stringify('\uDC5B'));
assertEquals('"\\udc5c"', JSON.stringify('\uDC5C'));
assertEquals('"\\udc5d"', JSON.stringify('\uDC5D'));
assertEquals('"\\udc5e"', JSON.stringify('\uDC5E'));
assertEquals('"\\udc5f"', JSON.stringify('\uDC5F'));
assertEquals('"\\udc60"', JSON.stringify('\uDC60'));
assertEquals('"\\udc61"', JSON.stringify('\uDC61'));
assertEquals('"\\udc62"', JSON.stringify('\uDC62'));
assertEquals('"\\udc63"', JSON.stringify('\uDC63'));
assertEquals('"\\udc64"', JSON.stringify('\uDC64'));
assertEquals('"\\udc65"', JSON.stringify('\uDC65'));
assertEquals('"\\udc66"', JSON.stringify('\uDC66'));
assertEquals('"\\udc67"', JSON.stringify('\uDC67'));
assertEquals('"\\udc68"', JSON.stringify('\uDC68'));
assertEquals('"\\udc69"', JSON.stringify('\uDC69'));
assertEquals('"\\udc6a"', JSON.stringify('\uDC6A'));
assertEquals('"\\udc6b"', JSON.stringify('\uDC6B'));
assertEquals('"\\udc6c"', JSON.stringify('\uDC6C'));
assertEquals('"\\udc6d"', JSON.stringify('\uDC6D'));
assertEquals('"\\udc6e"', JSON.stringify('\uDC6E'));
assertEquals('"\\udc6f"', JSON.stringify('\uDC6F'));
assertEquals('"\\udc70"', JSON.stringify('\uDC70'));
assertEquals('"\\udc71"', JSON.stringify('\uDC71'));
assertEquals('"\\udc72"', JSON.stringify('\uDC72'));
assertEquals('"\\udc73"', JSON.stringify('\uDC73'));
assertEquals('"\\udc74"', JSON.stringify('\uDC74'));
assertEquals('"\\udc75"', JSON.stringify('\uDC75'));
assertEquals('"\\udc76"', JSON.stringify('\uDC76'));
assertEquals('"\\udc77"', JSON.stringify('\uDC77'));
assertEquals('"\\udc78"', JSON.stringify('\uDC78'));
assertEquals('"\\udc79"', JSON.stringify('\uDC79'));
assertEquals('"\\udc7a"', JSON.stringify('\uDC7A'));
assertEquals('"\\udc7b"', JSON.stringify('\uDC7B'));
assertEquals('"\\udc7c"', JSON.stringify('\uDC7C'));
assertEquals('"\\udc7d"', JSON.stringify('\uDC7D'));
assertEquals('"\\udc7e"', JSON.stringify('\uDC7E'));
assertEquals('"\\udc7f"', JSON.stringify('\uDC7F'));
assertEquals('"\\udc80"', JSON.stringify('\uDC80'));
assertEquals('"\\udc81"', JSON.stringify('\uDC81'));
assertEquals('"\\udc82"', JSON.stringify('\uDC82'));
assertEquals('"\\udc83"', JSON.stringify('\uDC83'));
assertEquals('"\\udc84"', JSON.stringify('\uDC84'));
assertEquals('"\\udc85"', JSON.stringify('\uDC85'));
assertEquals('"\\udc86"', JSON.stringify('\uDC86'));
assertEquals('"\\udc87"', JSON.stringify('\uDC87'));
assertEquals('"\\udc88"', JSON.stringify('\uDC88'));
assertEquals('"\\udc89"', JSON.stringify('\uDC89'));
assertEquals('"\\udc8a"', JSON.stringify('\uDC8A'));
assertEquals('"\\udc8b"', JSON.stringify('\uDC8B'));
assertEquals('"\\udc8c"', JSON.stringify('\uDC8C'));
assertEquals('"\\udc8d"', JSON.stringify('\uDC8D'));
assertEquals('"\\udc8e"', JSON.stringify('\uDC8E'));
assertEquals('"\\udc8f"', JSON.stringify('\uDC8F'));
assertEquals('"\\udc90"', JSON.stringify('\uDC90'));
assertEquals('"\\udc91"', JSON.stringify('\uDC91'));
assertEquals('"\\udc92"', JSON.stringify('\uDC92'));
assertEquals('"\\udc93"', JSON.stringify('\uDC93'));
assertEquals('"\\udc94"', JSON.stringify('\uDC94'));
assertEquals('"\\udc95"', JSON.stringify('\uDC95'));
assertEquals('"\\udc96"', JSON.stringify('\uDC96'));
assertEquals('"\\udc97"', JSON.stringify('\uDC97'));
assertEquals('"\\udc98"', JSON.stringify('\uDC98'));
assertEquals('"\\udc99"', JSON.stringify('\uDC99'));
assertEquals('"\\udc9a"', JSON.stringify('\uDC9A'));
assertEquals('"\\udc9b"', JSON.stringify('\uDC9B'));
assertEquals('"\\udc9c"', JSON.stringify('\uDC9C'));
assertEquals('"\\udc9d"', JSON.stringify('\uDC9D'));
assertEquals('"\\udc9e"', JSON.stringify('\uDC9E'));
assertEquals('"\\udc9f"', JSON.stringify('\uDC9F'));
assertEquals('"\\udca0"', JSON.stringify('\uDCA0'));
assertEquals('"\\udca1"', JSON.stringify('\uDCA1'));
assertEquals('"\\udca2"', JSON.stringify('\uDCA2'));
assertEquals('"\\udca3"', JSON.stringify('\uDCA3'));
assertEquals('"\\udca4"', JSON.stringify('\uDCA4'));
assertEquals('"\\udca5"', JSON.stringify('\uDCA5'));
assertEquals('"\\udca6"', JSON.stringify('\uDCA6'));
assertEquals('"\\udca7"', JSON.stringify('\uDCA7'));
assertEquals('"\\udca8"', JSON.stringify('\uDCA8'));
assertEquals('"\\udca9"', JSON.stringify('\uDCA9'));
assertEquals('"\\udcaa"', JSON.stringify('\uDCAA'));
assertEquals('"\\udcab"', JSON.stringify('\uDCAB'));
assertEquals('"\\udcac"', JSON.stringify('\uDCAC'));
assertEquals('"\\udcad"', JSON.stringify('\uDCAD'));
assertEquals('"\\udcae"', JSON.stringify('\uDCAE'));
assertEquals('"\\udcaf"', JSON.stringify('\uDCAF'));
assertEquals('"\\udcb0"', JSON.stringify('\uDCB0'));
assertEquals('"\\udcb1"', JSON.stringify('\uDCB1'));
assertEquals('"\\udcb2"', JSON.stringify('\uDCB2'));
assertEquals('"\\udcb3"', JSON.stringify('\uDCB3'));
assertEquals('"\\udcb4"', JSON.stringify('\uDCB4'));
assertEquals('"\\udcb5"', JSON.stringify('\uDCB5'));
assertEquals('"\\udcb6"', JSON.stringify('\uDCB6'));
assertEquals('"\\udcb7"', JSON.stringify('\uDCB7'));
assertEquals('"\\udcb8"', JSON.stringify('\uDCB8'));
assertEquals('"\\udcb9"', JSON.stringify('\uDCB9'));
assertEquals('"\\udcba"', JSON.stringify('\uDCBA'));
assertEquals('"\\udcbb"', JSON.stringify('\uDCBB'));
assertEquals('"\\udcbc"', JSON.stringify('\uDCBC'));
assertEquals('"\\udcbd"', JSON.stringify('\uDCBD'));
assertEquals('"\\udcbe"', JSON.stringify('\uDCBE'));
assertEquals('"\\udcbf"', JSON.stringify('\uDCBF'));
assertEquals('"\\udcc0"', JSON.stringify('\uDCC0'));
assertEquals('"\\udcc1"', JSON.stringify('\uDCC1'));
assertEquals('"\\udcc2"', JSON.stringify('\uDCC2'));
assertEquals('"\\udcc3"', JSON.stringify('\uDCC3'));
assertEquals('"\\udcc4"', JSON.stringify('\uDCC4'));
assertEquals('"\\udcc5"', JSON.stringify('\uDCC5'));
assertEquals('"\\udcc6"', JSON.stringify('\uDCC6'));
assertEquals('"\\udcc7"', JSON.stringify('\uDCC7'));
assertEquals('"\\udcc8"', JSON.stringify('\uDCC8'));
assertEquals('"\\udcc9"', JSON.stringify('\uDCC9'));
assertEquals('"\\udcca"', JSON.stringify('\uDCCA'));
assertEquals('"\\udccb"', JSON.stringify('\uDCCB'));
assertEquals('"\\udccc"', JSON.stringify('\uDCCC'));
assertEquals('"\\udccd"', JSON.stringify('\uDCCD'));
assertEquals('"\\udcce"', JSON.stringify('\uDCCE'));
assertEquals('"\\udccf"', JSON.stringify('\uDCCF'));
assertEquals('"\\udcd0"', JSON.stringify('\uDCD0'));
assertEquals('"\\udcd1"', JSON.stringify('\uDCD1'));
assertEquals('"\\udcd2"', JSON.stringify('\uDCD2'));
assertEquals('"\\udcd3"', JSON.stringify('\uDCD3'));
assertEquals('"\\udcd4"', JSON.stringify('\uDCD4'));
assertEquals('"\\udcd5"', JSON.stringify('\uDCD5'));
assertEquals('"\\udcd6"', JSON.stringify('\uDCD6'));
assertEquals('"\\udcd7"', JSON.stringify('\uDCD7'));
assertEquals('"\\udcd8"', JSON.stringify('\uDCD8'));
assertEquals('"\\udcd9"', JSON.stringify('\uDCD9'));
assertEquals('"\\udcda"', JSON.stringify('\uDCDA'));
assertEquals('"\\udcdb"', JSON.stringify('\uDCDB'));
assertEquals('"\\udcdc"', JSON.stringify('\uDCDC'));
assertEquals('"\\udcdd"', JSON.stringify('\uDCDD'));
assertEquals('"\\udcde"', JSON.stringify('\uDCDE'));
assertEquals('"\\udcdf"', JSON.stringify('\uDCDF'));
assertEquals('"\\udce0"', JSON.stringify('\uDCE0'));
assertEquals('"\\udce1"', JSON.stringify('\uDCE1'));
assertEquals('"\\udce2"', JSON.stringify('\uDCE2'));
assertEquals('"\\udce3"', JSON.stringify('\uDCE3'));
assertEquals('"\\udce4"', JSON.stringify('\uDCE4'));
assertEquals('"\\udce5"', JSON.stringify('\uDCE5'));
assertEquals('"\\udce6"', JSON.stringify('\uDCE6'));
assertEquals('"\\udce7"', JSON.stringify('\uDCE7'));
assertEquals('"\\udce8"', JSON.stringify('\uDCE8'));
assertEquals('"\\udce9"', JSON.stringify('\uDCE9'));
assertEquals('"\\udcea"', JSON.stringify('\uDCEA'));
assertEquals('"\\udceb"', JSON.stringify('\uDCEB'));
assertEquals('"\\udcec"', JSON.stringify('\uDCEC'));
assertEquals('"\\udced"', JSON.stringify('\uDCED'));
assertEquals('"\\udcee"', JSON.stringify('\uDCEE'));
assertEquals('"\\udcef"', JSON.stringify('\uDCEF'));
assertEquals('"\\udcf0"', JSON.stringify('\uDCF0'));
assertEquals('"\\udcf1"', JSON.stringify('\uDCF1'));
assertEquals('"\\udcf2"', JSON.stringify('\uDCF2'));
assertEquals('"\\udcf3"', JSON.stringify('\uDCF3'));
assertEquals('"\\udcf4"', JSON.stringify('\uDCF4'));
assertEquals('"\\udcf5"', JSON.stringify('\uDCF5'));
assertEquals('"\\udcf6"', JSON.stringify('\uDCF6'));
assertEquals('"\\udcf7"', JSON.stringify('\uDCF7'));
assertEquals('"\\udcf8"', JSON.stringify('\uDCF8'));
assertEquals('"\\udcf9"', JSON.stringify('\uDCF9'));
assertEquals('"\\udcfa"', JSON.stringify('\uDCFA'));
assertEquals('"\\udcfb"', JSON.stringify('\uDCFB'));
assertEquals('"\\udcfc"', JSON.stringify('\uDCFC'));
assertEquals('"\\udcfd"', JSON.stringify('\uDCFD'));
assertEquals('"\\udcfe"', JSON.stringify('\uDCFE'));
assertEquals('"\\udcff"', JSON.stringify('\uDCFF'));
assertEquals('"\\udd00"', JSON.stringify('\uDD00'));
assertEquals('"\\udd01"', JSON.stringify('\uDD01'));
assertEquals('"\\udd02"', JSON.stringify('\uDD02'));
assertEquals('"\\udd03"', JSON.stringify('\uDD03'));
assertEquals('"\\udd04"', JSON.stringify('\uDD04'));
assertEquals('"\\udd05"', JSON.stringify('\uDD05'));
assertEquals('"\\udd06"', JSON.stringify('\uDD06'));
assertEquals('"\\udd07"', JSON.stringify('\uDD07'));
assertEquals('"\\udd08"', JSON.stringify('\uDD08'));
assertEquals('"\\udd09"', JSON.stringify('\uDD09'));
assertEquals('"\\udd0a"', JSON.stringify('\uDD0A'));
assertEquals('"\\udd0b"', JSON.stringify('\uDD0B'));
assertEquals('"\\udd0c"', JSON.stringify('\uDD0C'));
assertEquals('"\\udd0d"', JSON.stringify('\uDD0D'));
assertEquals('"\\udd0e"', JSON.stringify('\uDD0E'));
assertEquals('"\\udd0f"', JSON.stringify('\uDD0F'));
assertEquals('"\\udd10"', JSON.stringify('\uDD10'));
assertEquals('"\\udd11"', JSON.stringify('\uDD11'));
assertEquals('"\\udd12"', JSON.stringify('\uDD12'));
assertEquals('"\\udd13"', JSON.stringify('\uDD13'));
assertEquals('"\\udd14"', JSON.stringify('\uDD14'));
assertEquals('"\\udd15"', JSON.stringify('\uDD15'));
assertEquals('"\\udd16"', JSON.stringify('\uDD16'));
assertEquals('"\\udd17"', JSON.stringify('\uDD17'));
assertEquals('"\\udd18"', JSON.stringify('\uDD18'));
assertEquals('"\\udd19"', JSON.stringify('\uDD19'));
assertEquals('"\\udd1a"', JSON.stringify('\uDD1A'));
assertEquals('"\\udd1b"', JSON.stringify('\uDD1B'));
assertEquals('"\\udd1c"', JSON.stringify('\uDD1C'));
assertEquals('"\\udd1d"', JSON.stringify('\uDD1D'));
assertEquals('"\\udd1e"', JSON.stringify('\uDD1E'));
assertEquals('"\\udd1f"', JSON.stringify('\uDD1F'));
assertEquals('"\\udd20"', JSON.stringify('\uDD20'));
assertEquals('"\\udd21"', JSON.stringify('\uDD21'));
assertEquals('"\\udd22"', JSON.stringify('\uDD22'));
assertEquals('"\\udd23"', JSON.stringify('\uDD23'));
assertEquals('"\\udd24"', JSON.stringify('\uDD24'));
assertEquals('"\\udd25"', JSON.stringify('\uDD25'));
assertEquals('"\\udd26"', JSON.stringify('\uDD26'));
assertEquals('"\\udd27"', JSON.stringify('\uDD27'));
assertEquals('"\\udd28"', JSON.stringify('\uDD28'));
assertEquals('"\\udd29"', JSON.stringify('\uDD29'));
assertEquals('"\\udd2a"', JSON.stringify('\uDD2A'));
assertEquals('"\\udd2b"', JSON.stringify('\uDD2B'));
assertEquals('"\\udd2c"', JSON.stringify('\uDD2C'));
assertEquals('"\\udd2d"', JSON.stringify('\uDD2D'));
assertEquals('"\\udd2e"', JSON.stringify('\uDD2E'));
assertEquals('"\\udd2f"', JSON.stringify('\uDD2F'));
assertEquals('"\\udd30"', JSON.stringify('\uDD30'));
assertEquals('"\\udd31"', JSON.stringify('\uDD31'));
assertEquals('"\\udd32"', JSON.stringify('\uDD32'));
assertEquals('"\\udd33"', JSON.stringify('\uDD33'));
assertEquals('"\\udd34"', JSON.stringify('\uDD34'));
assertEquals('"\\udd35"', JSON.stringify('\uDD35'));
assertEquals('"\\udd36"', JSON.stringify('\uDD36'));
assertEquals('"\\udd37"', JSON.stringify('\uDD37'));
assertEquals('"\\udd38"', JSON.stringify('\uDD38'));
assertEquals('"\\udd39"', JSON.stringify('\uDD39'));
assertEquals('"\\udd3a"', JSON.stringify('\uDD3A'));
assertEquals('"\\udd3b"', JSON.stringify('\uDD3B'));
assertEquals('"\\udd3c"', JSON.stringify('\uDD3C'));
assertEquals('"\\udd3d"', JSON.stringify('\uDD3D'));
assertEquals('"\\udd3e"', JSON.stringify('\uDD3E'));
assertEquals('"\\udd3f"', JSON.stringify('\uDD3F'));
assertEquals('"\\udd40"', JSON.stringify('\uDD40'));
assertEquals('"\\udd41"', JSON.stringify('\uDD41'));
assertEquals('"\\udd42"', JSON.stringify('\uDD42'));
assertEquals('"\\udd43"', JSON.stringify('\uDD43'));
assertEquals('"\\udd44"', JSON.stringify('\uDD44'));
assertEquals('"\\udd45"', JSON.stringify('\uDD45'));
assertEquals('"\\udd46"', JSON.stringify('\uDD46'));
assertEquals('"\\udd47"', JSON.stringify('\uDD47'));
assertEquals('"\\udd48"', JSON.stringify('\uDD48'));
assertEquals('"\\udd49"', JSON.stringify('\uDD49'));
assertEquals('"\\udd4a"', JSON.stringify('\uDD4A'));
assertEquals('"\\udd4b"', JSON.stringify('\uDD4B'));
assertEquals('"\\udd4c"', JSON.stringify('\uDD4C'));
assertEquals('"\\udd4d"', JSON.stringify('\uDD4D'));
assertEquals('"\\udd4e"', JSON.stringify('\uDD4E'));
assertEquals('"\\udd4f"', JSON.stringify('\uDD4F'));
assertEquals('"\\udd50"', JSON.stringify('\uDD50'));
assertEquals('"\\udd51"', JSON.stringify('\uDD51'));
assertEquals('"\\udd52"', JSON.stringify('\uDD52'));
assertEquals('"\\udd53"', JSON.stringify('\uDD53'));
assertEquals('"\\udd54"', JSON.stringify('\uDD54'));
assertEquals('"\\udd55"', JSON.stringify('\uDD55'));
assertEquals('"\\udd56"', JSON.stringify('\uDD56'));
assertEquals('"\\udd57"', JSON.stringify('\uDD57'));
assertEquals('"\\udd58"', JSON.stringify('\uDD58'));
assertEquals('"\\udd59"', JSON.stringify('\uDD59'));
assertEquals('"\\udd5a"', JSON.stringify('\uDD5A'));
assertEquals('"\\udd5b"', JSON.stringify('\uDD5B'));
assertEquals('"\\udd5c"', JSON.stringify('\uDD5C'));
assertEquals('"\\udd5d"', JSON.stringify('\uDD5D'));
assertEquals('"\\udd5e"', JSON.stringify('\uDD5E'));
assertEquals('"\\udd5f"', JSON.stringify('\uDD5F'));
assertEquals('"\\udd60"', JSON.stringify('\uDD60'));
assertEquals('"\\udd61"', JSON.stringify('\uDD61'));
assertEquals('"\\udd62"', JSON.stringify('\uDD62'));
assertEquals('"\\udd63"', JSON.stringify('\uDD63'));
assertEquals('"\\udd64"', JSON.stringify('\uDD64'));
assertEquals('"\\udd65"', JSON.stringify('\uDD65'));
assertEquals('"\\udd66"', JSON.stringify('\uDD66'));
assertEquals('"\\udd67"', JSON.stringify('\uDD67'));
assertEquals('"\\udd68"', JSON.stringify('\uDD68'));
assertEquals('"\\udd69"', JSON.stringify('\uDD69'));
assertEquals('"\\udd6a"', JSON.stringify('\uDD6A'));
assertEquals('"\\udd6b"', JSON.stringify('\uDD6B'));
assertEquals('"\\udd6c"', JSON.stringify('\uDD6C'));
assertEquals('"\\udd6d"', JSON.stringify('\uDD6D'));
assertEquals('"\\udd6e"', JSON.stringify('\uDD6E'));
assertEquals('"\\udd6f"', JSON.stringify('\uDD6F'));
assertEquals('"\\udd70"', JSON.stringify('\uDD70'));
assertEquals('"\\udd71"', JSON.stringify('\uDD71'));
assertEquals('"\\udd72"', JSON.stringify('\uDD72'));
assertEquals('"\\udd73"', JSON.stringify('\uDD73'));
assertEquals('"\\udd74"', JSON.stringify('\uDD74'));
assertEquals('"\\udd75"', JSON.stringify('\uDD75'));
assertEquals('"\\udd76"', JSON.stringify('\uDD76'));
assertEquals('"\\udd77"', JSON.stringify('\uDD77'));
assertEquals('"\\udd78"', JSON.stringify('\uDD78'));
assertEquals('"\\udd79"', JSON.stringify('\uDD79'));
assertEquals('"\\udd7a"', JSON.stringify('\uDD7A'));
assertEquals('"\\udd7b"', JSON.stringify('\uDD7B'));
assertEquals('"\\udd7c"', JSON.stringify('\uDD7C'));
assertEquals('"\\udd7d"', JSON.stringify('\uDD7D'));
assertEquals('"\\udd7e"', JSON.stringify('\uDD7E'));
assertEquals('"\\udd7f"', JSON.stringify('\uDD7F'));
assertEquals('"\\udd80"', JSON.stringify('\uDD80'));
assertEquals('"\\udd81"', JSON.stringify('\uDD81'));
assertEquals('"\\udd82"', JSON.stringify('\uDD82'));
assertEquals('"\\udd83"', JSON.stringify('\uDD83'));
assertEquals('"\\udd84"', JSON.stringify('\uDD84'));
assertEquals('"\\udd85"', JSON.stringify('\uDD85'));
assertEquals('"\\udd86"', JSON.stringify('\uDD86'));
assertEquals('"\\udd87"', JSON.stringify('\uDD87'));
assertEquals('"\\udd88"', JSON.stringify('\uDD88'));
assertEquals('"\\udd89"', JSON.stringify('\uDD89'));
assertEquals('"\\udd8a"', JSON.stringify('\uDD8A'));
assertEquals('"\\udd8b"', JSON.stringify('\uDD8B'));
assertEquals('"\\udd8c"', JSON.stringify('\uDD8C'));
assertEquals('"\\udd8d"', JSON.stringify('\uDD8D'));
assertEquals('"\\udd8e"', JSON.stringify('\uDD8E'));
assertEquals('"\\udd8f"', JSON.stringify('\uDD8F'));
assertEquals('"\\udd90"', JSON.stringify('\uDD90'));
assertEquals('"\\udd91"', JSON.stringify('\uDD91'));
assertEquals('"\\udd92"', JSON.stringify('\uDD92'));
assertEquals('"\\udd93"', JSON.stringify('\uDD93'));
assertEquals('"\\udd94"', JSON.stringify('\uDD94'));
assertEquals('"\\udd95"', JSON.stringify('\uDD95'));
assertEquals('"\\udd96"', JSON.stringify('\uDD96'));
assertEquals('"\\udd97"', JSON.stringify('\uDD97'));
assertEquals('"\\udd98"', JSON.stringify('\uDD98'));
assertEquals('"\\udd99"', JSON.stringify('\uDD99'));
assertEquals('"\\udd9a"', JSON.stringify('\uDD9A'));
assertEquals('"\\udd9b"', JSON.stringify('\uDD9B'));
assertEquals('"\\udd9c"', JSON.stringify('\uDD9C'));
assertEquals('"\\udd9d"', JSON.stringify('\uDD9D'));
assertEquals('"\\udd9e"', JSON.stringify('\uDD9E'));
assertEquals('"\\udd9f"', JSON.stringify('\uDD9F'));
assertEquals('"\\udda0"', JSON.stringify('\uDDA0'));
assertEquals('"\\udda1"', JSON.stringify('\uDDA1'));
assertEquals('"\\udda2"', JSON.stringify('\uDDA2'));
assertEquals('"\\udda3"', JSON.stringify('\uDDA3'));
assertEquals('"\\udda4"', JSON.stringify('\uDDA4'));
assertEquals('"\\udda5"', JSON.stringify('\uDDA5'));
assertEquals('"\\udda6"', JSON.stringify('\uDDA6'));
assertEquals('"\\udda7"', JSON.stringify('\uDDA7'));
assertEquals('"\\udda8"', JSON.stringify('\uDDA8'));
assertEquals('"\\udda9"', JSON.stringify('\uDDA9'));
assertEquals('"\\uddaa"', JSON.stringify('\uDDAA'));
assertEquals('"\\uddab"', JSON.stringify('\uDDAB'));
assertEquals('"\\uddac"', JSON.stringify('\uDDAC'));
assertEquals('"\\uddad"', JSON.stringify('\uDDAD'));
assertEquals('"\\uddae"', JSON.stringify('\uDDAE'));
assertEquals('"\\uddaf"', JSON.stringify('\uDDAF'));
assertEquals('"\\uddb0"', JSON.stringify('\uDDB0'));
assertEquals('"\\uddb1"', JSON.stringify('\uDDB1'));
assertEquals('"\\uddb2"', JSON.stringify('\uDDB2'));
assertEquals('"\\uddb3"', JSON.stringify('\uDDB3'));
assertEquals('"\\uddb4"', JSON.stringify('\uDDB4'));
assertEquals('"\\uddb5"', JSON.stringify('\uDDB5'));
assertEquals('"\\uddb6"', JSON.stringify('\uDDB6'));
assertEquals('"\\uddb7"', JSON.stringify('\uDDB7'));
assertEquals('"\\uddb8"', JSON.stringify('\uDDB8'));
assertEquals('"\\uddb9"', JSON.stringify('\uDDB9'));
assertEquals('"\\uddba"', JSON.stringify('\uDDBA'));
assertEquals('"\\uddbb"', JSON.stringify('\uDDBB'));
assertEquals('"\\uddbc"', JSON.stringify('\uDDBC'));
assertEquals('"\\uddbd"', JSON.stringify('\uDDBD'));
assertEquals('"\\uddbe"', JSON.stringify('\uDDBE'));
assertEquals('"\\uddbf"', JSON.stringify('\uDDBF'));
assertEquals('"\\uddc0"', JSON.stringify('\uDDC0'));
assertEquals('"\\uddc1"', JSON.stringify('\uDDC1'));
assertEquals('"\\uddc2"', JSON.stringify('\uDDC2'));
assertEquals('"\\uddc3"', JSON.stringify('\uDDC3'));
assertEquals('"\\uddc4"', JSON.stringify('\uDDC4'));
assertEquals('"\\uddc5"', JSON.stringify('\uDDC5'));
assertEquals('"\\uddc6"', JSON.stringify('\uDDC6'));
assertEquals('"\\uddc7"', JSON.stringify('\uDDC7'));
assertEquals('"\\uddc8"', JSON.stringify('\uDDC8'));
assertEquals('"\\uddc9"', JSON.stringify('\uDDC9'));
assertEquals('"\\uddca"', JSON.stringify('\uDDCA'));
assertEquals('"\\uddcb"', JSON.stringify('\uDDCB'));
assertEquals('"\\uddcc"', JSON.stringify('\uDDCC'));
assertEquals('"\\uddcd"', JSON.stringify('\uDDCD'));
assertEquals('"\\uddce"', JSON.stringify('\uDDCE'));
assertEquals('"\\uddcf"', JSON.stringify('\uDDCF'));
assertEquals('"\\uddd0"', JSON.stringify('\uDDD0'));
assertEquals('"\\uddd1"', JSON.stringify('\uDDD1'));
assertEquals('"\\uddd2"', JSON.stringify('\uDDD2'));
assertEquals('"\\uddd3"', JSON.stringify('\uDDD3'));
assertEquals('"\\uddd4"', JSON.stringify('\uDDD4'));
assertEquals('"\\uddd5"', JSON.stringify('\uDDD5'));
assertEquals('"\\uddd6"', JSON.stringify('\uDDD6'));
assertEquals('"\\uddd7"', JSON.stringify('\uDDD7'));
assertEquals('"\\uddd8"', JSON.stringify('\uDDD8'));
assertEquals('"\\uddd9"', JSON.stringify('\uDDD9'));
assertEquals('"\\uddda"', JSON.stringify('\uDDDA'));
assertEquals('"\\udddb"', JSON.stringify('\uDDDB'));
assertEquals('"\\udddc"', JSON.stringify('\uDDDC'));
assertEquals('"\\udddd"', JSON.stringify('\uDDDD'));
assertEquals('"\\uddde"', JSON.stringify('\uDDDE'));
assertEquals('"\\udddf"', JSON.stringify('\uDDDF'));
assertEquals('"\\udde0"', JSON.stringify('\uDDE0'));
assertEquals('"\\udde1"', JSON.stringify('\uDDE1'));
assertEquals('"\\udde2"', JSON.stringify('\uDDE2'));
assertEquals('"\\udde3"', JSON.stringify('\uDDE3'));
assertEquals('"\\udde4"', JSON.stringify('\uDDE4'));
assertEquals('"\\udde5"', JSON.stringify('\uDDE5'));
assertEquals('"\\udde6"', JSON.stringify('\uDDE6'));
assertEquals('"\\udde7"', JSON.stringify('\uDDE7'));
assertEquals('"\\udde8"', JSON.stringify('\uDDE8'));
assertEquals('"\\udde9"', JSON.stringify('\uDDE9'));
assertEquals('"\\uddea"', JSON.stringify('\uDDEA'));
assertEquals('"\\uddeb"', JSON.stringify('\uDDEB'));
assertEquals('"\\uddec"', JSON.stringify('\uDDEC'));
assertEquals('"\\udded"', JSON.stringify('\uDDED'));
assertEquals('"\\uddee"', JSON.stringify('\uDDEE'));
assertEquals('"\\uddef"', JSON.stringify('\uDDEF'));
assertEquals('"\\uddf0"', JSON.stringify('\uDDF0'));
assertEquals('"\\uddf1"', JSON.stringify('\uDDF1'));
assertEquals('"\\uddf2"', JSON.stringify('\uDDF2'));
assertEquals('"\\uddf3"', JSON.stringify('\uDDF3'));
assertEquals('"\\uddf4"', JSON.stringify('\uDDF4'));
assertEquals('"\\uddf5"', JSON.stringify('\uDDF5'));
assertEquals('"\\uddf6"', JSON.stringify('\uDDF6'));
assertEquals('"\\uddf7"', JSON.stringify('\uDDF7'));
assertEquals('"\\uddf8"', JSON.stringify('\uDDF8'));
assertEquals('"\\uddf9"', JSON.stringify('\uDDF9'));
assertEquals('"\\uddfa"', JSON.stringify('\uDDFA'));
assertEquals('"\\uddfb"', JSON.stringify('\uDDFB'));
assertEquals('"\\uddfc"', JSON.stringify('\uDDFC'));
assertEquals('"\\uddfd"', JSON.stringify('\uDDFD'));
assertEquals('"\\uddfe"', JSON.stringify('\uDDFE'));
assertEquals('"\\uddff"', JSON.stringify('\uDDFF'));
assertEquals('"\\ude00"', JSON.stringify('\uDE00'));
assertEquals('"\\ude01"', JSON.stringify('\uDE01'));
assertEquals('"\\ude02"', JSON.stringify('\uDE02'));
assertEquals('"\\ude03"', JSON.stringify('\uDE03'));
assertEquals('"\\ude04"', JSON.stringify('\uDE04'));
assertEquals('"\\ude05"', JSON.stringify('\uDE05'));
assertEquals('"\\ude06"', JSON.stringify('\uDE06'));
assertEquals('"\\ude07"', JSON.stringify('\uDE07'));
assertEquals('"\\ude08"', JSON.stringify('\uDE08'));
assertEquals('"\\ude09"', JSON.stringify('\uDE09'));
assertEquals('"\\ude0a"', JSON.stringify('\uDE0A'));
assertEquals('"\\ude0b"', JSON.stringify('\uDE0B'));
assertEquals('"\\ude0c"', JSON.stringify('\uDE0C'));
assertEquals('"\\ude0d"', JSON.stringify('\uDE0D'));
assertEquals('"\\ude0e"', JSON.stringify('\uDE0E'));
assertEquals('"\\ude0f"', JSON.stringify('\uDE0F'));
assertEquals('"\\ude10"', JSON.stringify('\uDE10'));
assertEquals('"\\ude11"', JSON.stringify('\uDE11'));
assertEquals('"\\ude12"', JSON.stringify('\uDE12'));
assertEquals('"\\ude13"', JSON.stringify('\uDE13'));
assertEquals('"\\ude14"', JSON.stringify('\uDE14'));
assertEquals('"\\ude15"', JSON.stringify('\uDE15'));
assertEquals('"\\ude16"', JSON.stringify('\uDE16'));
assertEquals('"\\ude17"', JSON.stringify('\uDE17'));
assertEquals('"\\ude18"', JSON.stringify('\uDE18'));
assertEquals('"\\ude19"', JSON.stringify('\uDE19'));
assertEquals('"\\ude1a"', JSON.stringify('\uDE1A'));
assertEquals('"\\ude1b"', JSON.stringify('\uDE1B'));
assertEquals('"\\ude1c"', JSON.stringify('\uDE1C'));
assertEquals('"\\ude1d"', JSON.stringify('\uDE1D'));
assertEquals('"\\ude1e"', JSON.stringify('\uDE1E'));
assertEquals('"\\ude1f"', JSON.stringify('\uDE1F'));
assertEquals('"\\ude20"', JSON.stringify('\uDE20'));
assertEquals('"\\ude21"', JSON.stringify('\uDE21'));
assertEquals('"\\ude22"', JSON.stringify('\uDE22'));
assertEquals('"\\ude23"', JSON.stringify('\uDE23'));
assertEquals('"\\ude24"', JSON.stringify('\uDE24'));
assertEquals('"\\ude25"', JSON.stringify('\uDE25'));
assertEquals('"\\ude26"', JSON.stringify('\uDE26'));
assertEquals('"\\ude27"', JSON.stringify('\uDE27'));
assertEquals('"\\ude28"', JSON.stringify('\uDE28'));
assertEquals('"\\ude29"', JSON.stringify('\uDE29'));
assertEquals('"\\ude2a"', JSON.stringify('\uDE2A'));
assertEquals('"\\ude2b"', JSON.stringify('\uDE2B'));
assertEquals('"\\ude2c"', JSON.stringify('\uDE2C'));
assertEquals('"\\ude2d"', JSON.stringify('\uDE2D'));
assertEquals('"\\ude2e"', JSON.stringify('\uDE2E'));
assertEquals('"\\ude2f"', JSON.stringify('\uDE2F'));
assertEquals('"\\ude30"', JSON.stringify('\uDE30'));
assertEquals('"\\ude31"', JSON.stringify('\uDE31'));
assertEquals('"\\ude32"', JSON.stringify('\uDE32'));
assertEquals('"\\ude33"', JSON.stringify('\uDE33'));
assertEquals('"\\ude34"', JSON.stringify('\uDE34'));
assertEquals('"\\ude35"', JSON.stringify('\uDE35'));
assertEquals('"\\ude36"', JSON.stringify('\uDE36'));
assertEquals('"\\ude37"', JSON.stringify('\uDE37'));
assertEquals('"\\ude38"', JSON.stringify('\uDE38'));
assertEquals('"\\ude39"', JSON.stringify('\uDE39'));
assertEquals('"\\ude3a"', JSON.stringify('\uDE3A'));
assertEquals('"\\ude3b"', JSON.stringify('\uDE3B'));
assertEquals('"\\ude3c"', JSON.stringify('\uDE3C'));
assertEquals('"\\ude3d"', JSON.stringify('\uDE3D'));
assertEquals('"\\ude3e"', JSON.stringify('\uDE3E'));
assertEquals('"\\ude3f"', JSON.stringify('\uDE3F'));
assertEquals('"\\ude40"', JSON.stringify('\uDE40'));
assertEquals('"\\ude41"', JSON.stringify('\uDE41'));
assertEquals('"\\ude42"', JSON.stringify('\uDE42'));
assertEquals('"\\ude43"', JSON.stringify('\uDE43'));
assertEquals('"\\ude44"', JSON.stringify('\uDE44'));
assertEquals('"\\ude45"', JSON.stringify('\uDE45'));
assertEquals('"\\ude46"', JSON.stringify('\uDE46'));
assertEquals('"\\ude47"', JSON.stringify('\uDE47'));
assertEquals('"\\ude48"', JSON.stringify('\uDE48'));
assertEquals('"\\ude49"', JSON.stringify('\uDE49'));
assertEquals('"\\ude4a"', JSON.stringify('\uDE4A'));
assertEquals('"\\ude4b"', JSON.stringify('\uDE4B'));
assertEquals('"\\ude4c"', JSON.stringify('\uDE4C'));
assertEquals('"\\ude4d"', JSON.stringify('\uDE4D'));
assertEquals('"\\ude4e"', JSON.stringify('\uDE4E'));
assertEquals('"\\ude4f"', JSON.stringify('\uDE4F'));
assertEquals('"\\ude50"', JSON.stringify('\uDE50'));
assertEquals('"\\ude51"', JSON.stringify('\uDE51'));
assertEquals('"\\ude52"', JSON.stringify('\uDE52'));
assertEquals('"\\ude53"', JSON.stringify('\uDE53'));
assertEquals('"\\ude54"', JSON.stringify('\uDE54'));
assertEquals('"\\ude55"', JSON.stringify('\uDE55'));
assertEquals('"\\ude56"', JSON.stringify('\uDE56'));
assertEquals('"\\ude57"', JSON.stringify('\uDE57'));
assertEquals('"\\ude58"', JSON.stringify('\uDE58'));
assertEquals('"\\ude59"', JSON.stringify('\uDE59'));
assertEquals('"\\ude5a"', JSON.stringify('\uDE5A'));
assertEquals('"\\ude5b"', JSON.stringify('\uDE5B'));
assertEquals('"\\ude5c"', JSON.stringify('\uDE5C'));
assertEquals('"\\ude5d"', JSON.stringify('\uDE5D'));
assertEquals('"\\ude5e"', JSON.stringify('\uDE5E'));
assertEquals('"\\ude5f"', JSON.stringify('\uDE5F'));
assertEquals('"\\ude60"', JSON.stringify('\uDE60'));
assertEquals('"\\ude61"', JSON.stringify('\uDE61'));
assertEquals('"\\ude62"', JSON.stringify('\uDE62'));
assertEquals('"\\ude63"', JSON.stringify('\uDE63'));
assertEquals('"\\ude64"', JSON.stringify('\uDE64'));
assertEquals('"\\ude65"', JSON.stringify('\uDE65'));
assertEquals('"\\ude66"', JSON.stringify('\uDE66'));
assertEquals('"\\ude67"', JSON.stringify('\uDE67'));
assertEquals('"\\ude68"', JSON.stringify('\uDE68'));
assertEquals('"\\ude69"', JSON.stringify('\uDE69'));
assertEquals('"\\ude6a"', JSON.stringify('\uDE6A'));
assertEquals('"\\ude6b"', JSON.stringify('\uDE6B'));
assertEquals('"\\ude6c"', JSON.stringify('\uDE6C'));
assertEquals('"\\ude6d"', JSON.stringify('\uDE6D'));
assertEquals('"\\ude6e"', JSON.stringify('\uDE6E'));
assertEquals('"\\ude6f"', JSON.stringify('\uDE6F'));
assertEquals('"\\ude70"', JSON.stringify('\uDE70'));
assertEquals('"\\ude71"', JSON.stringify('\uDE71'));
assertEquals('"\\ude72"', JSON.stringify('\uDE72'));
assertEquals('"\\ude73"', JSON.stringify('\uDE73'));
assertEquals('"\\ude74"', JSON.stringify('\uDE74'));
assertEquals('"\\ude75"', JSON.stringify('\uDE75'));
assertEquals('"\\ude76"', JSON.stringify('\uDE76'));
assertEquals('"\\ude77"', JSON.stringify('\uDE77'));
assertEquals('"\\ude78"', JSON.stringify('\uDE78'));
assertEquals('"\\ude79"', JSON.stringify('\uDE79'));
assertEquals('"\\ude7a"', JSON.stringify('\uDE7A'));
assertEquals('"\\ude7b"', JSON.stringify('\uDE7B'));
assertEquals('"\\ude7c"', JSON.stringify('\uDE7C'));
assertEquals('"\\ude7d"', JSON.stringify('\uDE7D'));
assertEquals('"\\ude7e"', JSON.stringify('\uDE7E'));
assertEquals('"\\ude7f"', JSON.stringify('\uDE7F'));
assertEquals('"\\ude80"', JSON.stringify('\uDE80'));
assertEquals('"\\ude81"', JSON.stringify('\uDE81'));
assertEquals('"\\ude82"', JSON.stringify('\uDE82'));
assertEquals('"\\ude83"', JSON.stringify('\uDE83'));
assertEquals('"\\ude84"', JSON.stringify('\uDE84'));
assertEquals('"\\ude85"', JSON.stringify('\uDE85'));
assertEquals('"\\ude86"', JSON.stringify('\uDE86'));
assertEquals('"\\ude87"', JSON.stringify('\uDE87'));
assertEquals('"\\ude88"', JSON.stringify('\uDE88'));
assertEquals('"\\ude89"', JSON.stringify('\uDE89'));
assertEquals('"\\ude8a"', JSON.stringify('\uDE8A'));
assertEquals('"\\ude8b"', JSON.stringify('\uDE8B'));
assertEquals('"\\ude8c"', JSON.stringify('\uDE8C'));
assertEquals('"\\ude8d"', JSON.stringify('\uDE8D'));
assertEquals('"\\ude8e"', JSON.stringify('\uDE8E'));
assertEquals('"\\ude8f"', JSON.stringify('\uDE8F'));
assertEquals('"\\ude90"', JSON.stringify('\uDE90'));
assertEquals('"\\ude91"', JSON.stringify('\uDE91'));
assertEquals('"\\ude92"', JSON.stringify('\uDE92'));
assertEquals('"\\ude93"', JSON.stringify('\uDE93'));
assertEquals('"\\ude94"', JSON.stringify('\uDE94'));
assertEquals('"\\ude95"', JSON.stringify('\uDE95'));
assertEquals('"\\ude96"', JSON.stringify('\uDE96'));
assertEquals('"\\ude97"', JSON.stringify('\uDE97'));
assertEquals('"\\ude98"', JSON.stringify('\uDE98'));
assertEquals('"\\ude99"', JSON.stringify('\uDE99'));
assertEquals('"\\ude9a"', JSON.stringify('\uDE9A'));
assertEquals('"\\ude9b"', JSON.stringify('\uDE9B'));
assertEquals('"\\ude9c"', JSON.stringify('\uDE9C'));
assertEquals('"\\ude9d"', JSON.stringify('\uDE9D'));
assertEquals('"\\ude9e"', JSON.stringify('\uDE9E'));
assertEquals('"\\ude9f"', JSON.stringify('\uDE9F'));
assertEquals('"\\udea0"', JSON.stringify('\uDEA0'));
assertEquals('"\\udea1"', JSON.stringify('\uDEA1'));
assertEquals('"\\udea2"', JSON.stringify('\uDEA2'));
assertEquals('"\\udea3"', JSON.stringify('\uDEA3'));
assertEquals('"\\udea4"', JSON.stringify('\uDEA4'));
assertEquals('"\\udea5"', JSON.stringify('\uDEA5'));
assertEquals('"\\udea6"', JSON.stringify('\uDEA6'));
assertEquals('"\\udea7"', JSON.stringify('\uDEA7'));
assertEquals('"\\udea8"', JSON.stringify('\uDEA8'));
assertEquals('"\\udea9"', JSON.stringify('\uDEA9'));
assertEquals('"\\udeaa"', JSON.stringify('\uDEAA'));
assertEquals('"\\udeab"', JSON.stringify('\uDEAB'));
assertEquals('"\\udeac"', JSON.stringify('\uDEAC'));
assertEquals('"\\udead"', JSON.stringify('\uDEAD'));
assertEquals('"\\udeae"', JSON.stringify('\uDEAE'));
assertEquals('"\\udeaf"', JSON.stringify('\uDEAF'));
assertEquals('"\\udeb0"', JSON.stringify('\uDEB0'));
assertEquals('"\\udeb1"', JSON.stringify('\uDEB1'));
assertEquals('"\\udeb2"', JSON.stringify('\uDEB2'));
assertEquals('"\\udeb3"', JSON.stringify('\uDEB3'));
assertEquals('"\\udeb4"', JSON.stringify('\uDEB4'));
assertEquals('"\\udeb5"', JSON.stringify('\uDEB5'));
assertEquals('"\\udeb6"', JSON.stringify('\uDEB6'));
assertEquals('"\\udeb7"', JSON.stringify('\uDEB7'));
assertEquals('"\\udeb8"', JSON.stringify('\uDEB8'));
assertEquals('"\\udeb9"', JSON.stringify('\uDEB9'));
assertEquals('"\\udeba"', JSON.stringify('\uDEBA'));
assertEquals('"\\udebb"', JSON.stringify('\uDEBB'));
assertEquals('"\\udebc"', JSON.stringify('\uDEBC'));
assertEquals('"\\udebd"', JSON.stringify('\uDEBD'));
assertEquals('"\\udebe"', JSON.stringify('\uDEBE'));
assertEquals('"\\udebf"', JSON.stringify('\uDEBF'));
assertEquals('"\\udec0"', JSON.stringify('\uDEC0'));
assertEquals('"\\udec1"', JSON.stringify('\uDEC1'));
assertEquals('"\\udec2"', JSON.stringify('\uDEC2'));
assertEquals('"\\udec3"', JSON.stringify('\uDEC3'));
assertEquals('"\\udec4"', JSON.stringify('\uDEC4'));
assertEquals('"\\udec5"', JSON.stringify('\uDEC5'));
assertEquals('"\\udec6"', JSON.stringify('\uDEC6'));
assertEquals('"\\udec7"', JSON.stringify('\uDEC7'));
assertEquals('"\\udec8"', JSON.stringify('\uDEC8'));
assertEquals('"\\udec9"', JSON.stringify('\uDEC9'));
assertEquals('"\\udeca"', JSON.stringify('\uDECA'));
assertEquals('"\\udecb"', JSON.stringify('\uDECB'));
assertEquals('"\\udecc"', JSON.stringify('\uDECC'));
assertEquals('"\\udecd"', JSON.stringify('\uDECD'));
assertEquals('"\\udece"', JSON.stringify('\uDECE'));
assertEquals('"\\udecf"', JSON.stringify('\uDECF'));
assertEquals('"\\uded0"', JSON.stringify('\uDED0'));
assertEquals('"\\uded1"', JSON.stringify('\uDED1'));
assertEquals('"\\uded2"', JSON.stringify('\uDED2'));
assertEquals('"\\uded3"', JSON.stringify('\uDED3'));
assertEquals('"\\uded4"', JSON.stringify('\uDED4'));
assertEquals('"\\uded5"', JSON.stringify('\uDED5'));
assertEquals('"\\uded6"', JSON.stringify('\uDED6'));
assertEquals('"\\uded7"', JSON.stringify('\uDED7'));
assertEquals('"\\uded8"', JSON.stringify('\uDED8'));
assertEquals('"\\uded9"', JSON.stringify('\uDED9'));
assertEquals('"\\udeda"', JSON.stringify('\uDEDA'));
assertEquals('"\\udedb"', JSON.stringify('\uDEDB'));
assertEquals('"\\udedc"', JSON.stringify('\uDEDC'));
assertEquals('"\\udedd"', JSON.stringify('\uDEDD'));
assertEquals('"\\udede"', JSON.stringify('\uDEDE'));
assertEquals('"\\udedf"', JSON.stringify('\uDEDF'));
assertEquals('"\\udee0"', JSON.stringify('\uDEE0'));
assertEquals('"\\udee1"', JSON.stringify('\uDEE1'));
assertEquals('"\\udee2"', JSON.stringify('\uDEE2'));
assertEquals('"\\udee3"', JSON.stringify('\uDEE3'));
assertEquals('"\\udee4"', JSON.stringify('\uDEE4'));
assertEquals('"\\udee5"', JSON.stringify('\uDEE5'));
assertEquals('"\\udee6"', JSON.stringify('\uDEE6'));
assertEquals('"\\udee7"', JSON.stringify('\uDEE7'));
assertEquals('"\\udee8"', JSON.stringify('\uDEE8'));
assertEquals('"\\udee9"', JSON.stringify('\uDEE9'));
assertEquals('"\\udeea"', JSON.stringify('\uDEEA'));
assertEquals('"\\udeeb"', JSON.stringify('\uDEEB'));
assertEquals('"\\udeec"', JSON.stringify('\uDEEC'));
assertEquals('"\\udeed"', JSON.stringify('\uDEED'));
assertEquals('"\\udeee"', JSON.stringify('\uDEEE'));
assertEquals('"\\udeef"', JSON.stringify('\uDEEF'));
assertEquals('"\\udef0"', JSON.stringify('\uDEF0'));
assertEquals('"\\udef1"', JSON.stringify('\uDEF1'));
assertEquals('"\\udef2"', JSON.stringify('\uDEF2'));
assertEquals('"\\udef3"', JSON.stringify('\uDEF3'));
assertEquals('"\\udef4"', JSON.stringify('\uDEF4'));
assertEquals('"\\udef5"', JSON.stringify('\uDEF5'));
assertEquals('"\\udef6"', JSON.stringify('\uDEF6'));
assertEquals('"\\udef7"', JSON.stringify('\uDEF7'));
assertEquals('"\\udef8"', JSON.stringify('\uDEF8'));
assertEquals('"\\udef9"', JSON.stringify('\uDEF9'));
assertEquals('"\\udefa"', JSON.stringify('\uDEFA'));
assertEquals('"\\udefb"', JSON.stringify('\uDEFB'));
assertEquals('"\\udefc"', JSON.stringify('\uDEFC'));
assertEquals('"\\udefd"', JSON.stringify('\uDEFD'));
assertEquals('"\\udefe"', JSON.stringify('\uDEFE'));
assertEquals('"\\udeff"', JSON.stringify('\uDEFF'));
assertEquals('"\\udf00"', JSON.stringify('\uDF00'));
assertEquals('"\\udf01"', JSON.stringify('\uDF01'));
assertEquals('"\\udf02"', JSON.stringify('\uDF02'));
assertEquals('"\\udf03"', JSON.stringify('\uDF03'));
assertEquals('"\\udf04"', JSON.stringify('\uDF04'));
assertEquals('"\\udf05"', JSON.stringify('\uDF05'));
assertEquals('"\\udf06"', JSON.stringify('\uDF06'));
assertEquals('"\\udf07"', JSON.stringify('\uDF07'));
assertEquals('"\\udf08"', JSON.stringify('\uDF08'));
assertEquals('"\\udf09"', JSON.stringify('\uDF09'));
assertEquals('"\\udf0a"', JSON.stringify('\uDF0A'));
assertEquals('"\\udf0b"', JSON.stringify('\uDF0B'));
assertEquals('"\\udf0c"', JSON.stringify('\uDF0C'));
assertEquals('"\\udf0d"', JSON.stringify('\uDF0D'));
assertEquals('"\\udf0e"', JSON.stringify('\uDF0E'));
assertEquals('"\\udf0f"', JSON.stringify('\uDF0F'));
assertEquals('"\\udf10"', JSON.stringify('\uDF10'));
assertEquals('"\\udf11"', JSON.stringify('\uDF11'));
assertEquals('"\\udf12"', JSON.stringify('\uDF12'));
assertEquals('"\\udf13"', JSON.stringify('\uDF13'));
assertEquals('"\\udf14"', JSON.stringify('\uDF14'));
assertEquals('"\\udf15"', JSON.stringify('\uDF15'));
assertEquals('"\\udf16"', JSON.stringify('\uDF16'));
assertEquals('"\\udf17"', JSON.stringify('\uDF17'));
assertEquals('"\\udf18"', JSON.stringify('\uDF18'));
assertEquals('"\\udf19"', JSON.stringify('\uDF19'));
assertEquals('"\\udf1a"', JSON.stringify('\uDF1A'));
assertEquals('"\\udf1b"', JSON.stringify('\uDF1B'));
assertEquals('"\\udf1c"', JSON.stringify('\uDF1C'));
assertEquals('"\\udf1d"', JSON.stringify('\uDF1D'));
assertEquals('"\\udf1e"', JSON.stringify('\uDF1E'));
assertEquals('"\\udf1f"', JSON.stringify('\uDF1F'));
assertEquals('"\\udf20"', JSON.stringify('\uDF20'));
assertEquals('"\\udf21"', JSON.stringify('\uDF21'));
assertEquals('"\\udf22"', JSON.stringify('\uDF22'));
assertEquals('"\\udf23"', JSON.stringify('\uDF23'));
assertEquals('"\\udf24"', JSON.stringify('\uDF24'));
assertEquals('"\\udf25"', JSON.stringify('\uDF25'));
assertEquals('"\\udf26"', JSON.stringify('\uDF26'));
assertEquals('"\\udf27"', JSON.stringify('\uDF27'));
assertEquals('"\\udf28"', JSON.stringify('\uDF28'));
assertEquals('"\\udf29"', JSON.stringify('\uDF29'));
assertEquals('"\\udf2a"', JSON.stringify('\uDF2A'));
assertEquals('"\\udf2b"', JSON.stringify('\uDF2B'));
assertEquals('"\\udf2c"', JSON.stringify('\uDF2C'));
assertEquals('"\\udf2d"', JSON.stringify('\uDF2D'));
assertEquals('"\\udf2e"', JSON.stringify('\uDF2E'));
assertEquals('"\\udf2f"', JSON.stringify('\uDF2F'));
assertEquals('"\\udf30"', JSON.stringify('\uDF30'));
assertEquals('"\\udf31"', JSON.stringify('\uDF31'));
assertEquals('"\\udf32"', JSON.stringify('\uDF32'));
assertEquals('"\\udf33"', JSON.stringify('\uDF33'));
assertEquals('"\\udf34"', JSON.stringify('\uDF34'));
assertEquals('"\\udf35"', JSON.stringify('\uDF35'));
assertEquals('"\\udf36"', JSON.stringify('\uDF36'));
assertEquals('"\\udf37"', JSON.stringify('\uDF37'));
assertEquals('"\\udf38"', JSON.stringify('\uDF38'));
assertEquals('"\\udf39"', JSON.stringify('\uDF39'));
assertEquals('"\\udf3a"', JSON.stringify('\uDF3A'));
assertEquals('"\\udf3b"', JSON.stringify('\uDF3B'));
assertEquals('"\\udf3c"', JSON.stringify('\uDF3C'));
assertEquals('"\\udf3d"', JSON.stringify('\uDF3D'));
assertEquals('"\\udf3e"', JSON.stringify('\uDF3E'));
assertEquals('"\\udf3f"', JSON.stringify('\uDF3F'));
assertEquals('"\\udf40"', JSON.stringify('\uDF40'));
assertEquals('"\\udf41"', JSON.stringify('\uDF41'));
assertEquals('"\\udf42"', JSON.stringify('\uDF42'));
assertEquals('"\\udf43"', JSON.stringify('\uDF43'));
assertEquals('"\\udf44"', JSON.stringify('\uDF44'));
assertEquals('"\\udf45"', JSON.stringify('\uDF45'));
assertEquals('"\\udf46"', JSON.stringify('\uDF46'));
assertEquals('"\\udf47"', JSON.stringify('\uDF47'));
assertEquals('"\\udf48"', JSON.stringify('\uDF48'));
assertEquals('"\\udf49"', JSON.stringify('\uDF49'));
assertEquals('"\\udf4a"', JSON.stringify('\uDF4A'));
assertEquals('"\\udf4b"', JSON.stringify('\uDF4B'));
assertEquals('"\\udf4c"', JSON.stringify('\uDF4C'));
assertEquals('"\\udf4d"', JSON.stringify('\uDF4D'));
assertEquals('"\\udf4e"', JSON.stringify('\uDF4E'));
assertEquals('"\\udf4f"', JSON.stringify('\uDF4F'));
assertEquals('"\\udf50"', JSON.stringify('\uDF50'));
assertEquals('"\\udf51"', JSON.stringify('\uDF51'));
assertEquals('"\\udf52"', JSON.stringify('\uDF52'));
assertEquals('"\\udf53"', JSON.stringify('\uDF53'));
assertEquals('"\\udf54"', JSON.stringify('\uDF54'));
assertEquals('"\\udf55"', JSON.stringify('\uDF55'));
assertEquals('"\\udf56"', JSON.stringify('\uDF56'));
assertEquals('"\\udf57"', JSON.stringify('\uDF57'));
assertEquals('"\\udf58"', JSON.stringify('\uDF58'));
assertEquals('"\\udf59"', JSON.stringify('\uDF59'));
assertEquals('"\\udf5a"', JSON.stringify('\uDF5A'));
assertEquals('"\\udf5b"', JSON.stringify('\uDF5B'));
assertEquals('"\\udf5c"', JSON.stringify('\uDF5C'));
assertEquals('"\\udf5d"', JSON.stringify('\uDF5D'));
assertEquals('"\\udf5e"', JSON.stringify('\uDF5E'));
assertEquals('"\\udf5f"', JSON.stringify('\uDF5F'));
assertEquals('"\\udf60"', JSON.stringify('\uDF60'));
assertEquals('"\\udf61"', JSON.stringify('\uDF61'));
assertEquals('"\\udf62"', JSON.stringify('\uDF62'));
assertEquals('"\\udf63"', JSON.stringify('\uDF63'));
assertEquals('"\\udf64"', JSON.stringify('\uDF64'));
assertEquals('"\\udf65"', JSON.stringify('\uDF65'));
assertEquals('"\\udf66"', JSON.stringify('\uDF66'));
assertEquals('"\\udf67"', JSON.stringify('\uDF67'));
assertEquals('"\\udf68"', JSON.stringify('\uDF68'));
assertEquals('"\\udf69"', JSON.stringify('\uDF69'));
assertEquals('"\\udf6a"', JSON.stringify('\uDF6A'));
assertEquals('"\\udf6b"', JSON.stringify('\uDF6B'));
assertEquals('"\\udf6c"', JSON.stringify('\uDF6C'));
assertEquals('"\\udf6d"', JSON.stringify('\uDF6D'));
assertEquals('"\\udf6e"', JSON.stringify('\uDF6E'));
assertEquals('"\\udf6f"', JSON.stringify('\uDF6F'));
assertEquals('"\\udf70"', JSON.stringify('\uDF70'));
assertEquals('"\\udf71"', JSON.stringify('\uDF71'));
assertEquals('"\\udf72"', JSON.stringify('\uDF72'));
assertEquals('"\\udf73"', JSON.stringify('\uDF73'));
assertEquals('"\\udf74"', JSON.stringify('\uDF74'));
assertEquals('"\\udf75"', JSON.stringify('\uDF75'));
assertEquals('"\\udf76"', JSON.stringify('\uDF76'));
assertEquals('"\\udf77"', JSON.stringify('\uDF77'));
assertEquals('"\\udf78"', JSON.stringify('\uDF78'));
assertEquals('"\\udf79"', JSON.stringify('\uDF79'));
assertEquals('"\\udf7a"', JSON.stringify('\uDF7A'));
assertEquals('"\\udf7b"', JSON.stringify('\uDF7B'));
assertEquals('"\\udf7c"', JSON.stringify('\uDF7C'));
assertEquals('"\\udf7d"', JSON.stringify('\uDF7D'));
assertEquals('"\\udf7e"', JSON.stringify('\uDF7E'));
assertEquals('"\\udf7f"', JSON.stringify('\uDF7F'));
assertEquals('"\\udf80"', JSON.stringify('\uDF80'));
assertEquals('"\\udf81"', JSON.stringify('\uDF81'));
assertEquals('"\\udf82"', JSON.stringify('\uDF82'));
assertEquals('"\\udf83"', JSON.stringify('\uDF83'));
assertEquals('"\\udf84"', JSON.stringify('\uDF84'));
assertEquals('"\\udf85"', JSON.stringify('\uDF85'));
assertEquals('"\\udf86"', JSON.stringify('\uDF86'));
assertEquals('"\\udf87"', JSON.stringify('\uDF87'));
assertEquals('"\\udf88"', JSON.stringify('\uDF88'));
assertEquals('"\\udf89"', JSON.stringify('\uDF89'));
assertEquals('"\\udf8a"', JSON.stringify('\uDF8A'));
assertEquals('"\\udf8b"', JSON.stringify('\uDF8B'));
assertEquals('"\\udf8c"', JSON.stringify('\uDF8C'));
assertEquals('"\\udf8d"', JSON.stringify('\uDF8D'));
assertEquals('"\\udf8e"', JSON.stringify('\uDF8E'));
assertEquals('"\\udf8f"', JSON.stringify('\uDF8F'));
assertEquals('"\\udf90"', JSON.stringify('\uDF90'));
assertEquals('"\\udf91"', JSON.stringify('\uDF91'));
assertEquals('"\\udf92"', JSON.stringify('\uDF92'));
assertEquals('"\\udf93"', JSON.stringify('\uDF93'));
assertEquals('"\\udf94"', JSON.stringify('\uDF94'));
assertEquals('"\\udf95"', JSON.stringify('\uDF95'));
assertEquals('"\\udf96"', JSON.stringify('\uDF96'));
assertEquals('"\\udf97"', JSON.stringify('\uDF97'));
assertEquals('"\\udf98"', JSON.stringify('\uDF98'));
assertEquals('"\\udf99"', JSON.stringify('\uDF99'));
assertEquals('"\\udf9a"', JSON.stringify('\uDF9A'));
assertEquals('"\\udf9b"', JSON.stringify('\uDF9B'));
assertEquals('"\\udf9c"', JSON.stringify('\uDF9C'));
assertEquals('"\\udf9d"', JSON.stringify('\uDF9D'));
assertEquals('"\\udf9e"', JSON.stringify('\uDF9E'));
assertEquals('"\\udf9f"', JSON.stringify('\uDF9F'));
assertEquals('"\\udfa0"', JSON.stringify('\uDFA0'));
assertEquals('"\\udfa1"', JSON.stringify('\uDFA1'));
assertEquals('"\\udfa2"', JSON.stringify('\uDFA2'));
assertEquals('"\\udfa3"', JSON.stringify('\uDFA3'));
assertEquals('"\\udfa4"', JSON.stringify('\uDFA4'));
assertEquals('"\\udfa5"', JSON.stringify('\uDFA5'));
assertEquals('"\\udfa6"', JSON.stringify('\uDFA6'));
assertEquals('"\\udfa7"', JSON.stringify('\uDFA7'));
assertEquals('"\\udfa8"', JSON.stringify('\uDFA8'));
assertEquals('"\\udfa9"', JSON.stringify('\uDFA9'));
assertEquals('"\\udfaa"', JSON.stringify('\uDFAA'));
assertEquals('"\\udfab"', JSON.stringify('\uDFAB'));
assertEquals('"\\udfac"', JSON.stringify('\uDFAC'));
assertEquals('"\\udfad"', JSON.stringify('\uDFAD'));
assertEquals('"\\udfae"', JSON.stringify('\uDFAE'));
assertEquals('"\\udfaf"', JSON.stringify('\uDFAF'));
assertEquals('"\\udfb0"', JSON.stringify('\uDFB0'));
assertEquals('"\\udfb1"', JSON.stringify('\uDFB1'));
assertEquals('"\\udfb2"', JSON.stringify('\uDFB2'));
assertEquals('"\\udfb3"', JSON.stringify('\uDFB3'));
assertEquals('"\\udfb4"', JSON.stringify('\uDFB4'));
assertEquals('"\\udfb5"', JSON.stringify('\uDFB5'));
assertEquals('"\\udfb6"', JSON.stringify('\uDFB6'));
assertEquals('"\\udfb7"', JSON.stringify('\uDFB7'));
assertEquals('"\\udfb8"', JSON.stringify('\uDFB8'));
assertEquals('"\\udfb9"', JSON.stringify('\uDFB9'));
assertEquals('"\\udfba"', JSON.stringify('\uDFBA'));
assertEquals('"\\udfbb"', JSON.stringify('\uDFBB'));
assertEquals('"\\udfbc"', JSON.stringify('\uDFBC'));
assertEquals('"\\udfbd"', JSON.stringify('\uDFBD'));
assertEquals('"\\udfbe"', JSON.stringify('\uDFBE'));
assertEquals('"\\udfbf"', JSON.stringify('\uDFBF'));
assertEquals('"\\udfc0"', JSON.stringify('\uDFC0'));
assertEquals('"\\udfc1"', JSON.stringify('\uDFC1'));
assertEquals('"\\udfc2"', JSON.stringify('\uDFC2'));
assertEquals('"\\udfc3"', JSON.stringify('\uDFC3'));
assertEquals('"\\udfc4"', JSON.stringify('\uDFC4'));
assertEquals('"\\udfc5"', JSON.stringify('\uDFC5'));
assertEquals('"\\udfc6"', JSON.stringify('\uDFC6'));
assertEquals('"\\udfc7"', JSON.stringify('\uDFC7'));
assertEquals('"\\udfc8"', JSON.stringify('\uDFC8'));
assertEquals('"\\udfc9"', JSON.stringify('\uDFC9'));
assertEquals('"\\udfca"', JSON.stringify('\uDFCA'));
assertEquals('"\\udfcb"', JSON.stringify('\uDFCB'));
assertEquals('"\\udfcc"', JSON.stringify('\uDFCC'));
assertEquals('"\\udfcd"', JSON.stringify('\uDFCD'));
assertEquals('"\\udfce"', JSON.stringify('\uDFCE'));
assertEquals('"\\udfcf"', JSON.stringify('\uDFCF'));
assertEquals('"\\udfd0"', JSON.stringify('\uDFD0'));
assertEquals('"\\udfd1"', JSON.stringify('\uDFD1'));
assertEquals('"\\udfd2"', JSON.stringify('\uDFD2'));
assertEquals('"\\udfd3"', JSON.stringify('\uDFD3'));
assertEquals('"\\udfd4"', JSON.stringify('\uDFD4'));
assertEquals('"\\udfd5"', JSON.stringify('\uDFD5'));
assertEquals('"\\udfd6"', JSON.stringify('\uDFD6'));
assertEquals('"\\udfd7"', JSON.stringify('\uDFD7'));
assertEquals('"\\udfd8"', JSON.stringify('\uDFD8'));
assertEquals('"\\udfd9"', JSON.stringify('\uDFD9'));
assertEquals('"\\udfda"', JSON.stringify('\uDFDA'));
assertEquals('"\\udfdb"', JSON.stringify('\uDFDB'));
assertEquals('"\\udfdc"', JSON.stringify('\uDFDC'));
assertEquals('"\\udfdd"', JSON.stringify('\uDFDD'));
assertEquals('"\\udfde"', JSON.stringify('\uDFDE'));
assertEquals('"\\udfdf"', JSON.stringify('\uDFDF'));
assertEquals('"\\udfe0"', JSON.stringify('\uDFE0'));
assertEquals('"\\udfe1"', JSON.stringify('\uDFE1'));
assertEquals('"\\udfe2"', JSON.stringify('\uDFE2'));
assertEquals('"\\udfe3"', JSON.stringify('\uDFE3'));
assertEquals('"\\udfe4"', JSON.stringify('\uDFE4'));
assertEquals('"\\udfe5"', JSON.stringify('\uDFE5'));
assertEquals('"\\udfe6"', JSON.stringify('\uDFE6'));
assertEquals('"\\udfe7"', JSON.stringify('\uDFE7'));
assertEquals('"\\udfe8"', JSON.stringify('\uDFE8'));
assertEquals('"\\udfe9"', JSON.stringify('\uDFE9'));
assertEquals('"\\udfea"', JSON.stringify('\uDFEA'));
assertEquals('"\\udfeb"', JSON.stringify('\uDFEB'));
assertEquals('"\\udfec"', JSON.stringify('\uDFEC'));
assertEquals('"\\udfed"', JSON.stringify('\uDFED'));
assertEquals('"\\udfee"', JSON.stringify('\uDFEE'));
assertEquals('"\\udfef"', JSON.stringify('\uDFEF'));
assertEquals('"\\udff0"', JSON.stringify('\uDFF0'));
assertEquals('"\\udff1"', JSON.stringify('\uDFF1'));
assertEquals('"\\udff2"', JSON.stringify('\uDFF2'));
assertEquals('"\\udff3"', JSON.stringify('\uDFF3'));
assertEquals('"\\udff4"', JSON.stringify('\uDFF4'));
assertEquals('"\\udff5"', JSON.stringify('\uDFF5'));
assertEquals('"\\udff6"', JSON.stringify('\uDFF6'));
assertEquals('"\\udff7"', JSON.stringify('\uDFF7'));
assertEquals('"\\udff8"', JSON.stringify('\uDFF8'));
assertEquals('"\\udff9"', JSON.stringify('\uDFF9'));
assertEquals('"\\udffa"', JSON.stringify('\uDFFA'));
assertEquals('"\\udffb"', JSON.stringify('\uDFFB'));
assertEquals('"\\udffc"', JSON.stringify('\uDFFC'));
assertEquals('"\\udffd"', JSON.stringify('\uDFFD'));
assertEquals('"\\udffe"', JSON.stringify('\uDFFE'));
assertEquals('"\\udfff"', JSON.stringify('\uDFFF'));

// A random selection of code points from U+E000 to U+FFFF.
assertEquals('"\uE000"', JSON.stringify('\uE000'));
assertEquals('"\uE00B"', JSON.stringify('\uE00B'));
assertEquals('"\uE0CC"', JSON.stringify('\uE0CC'));
assertEquals('"\uE0FD"', JSON.stringify('\uE0FD'));
assertEquals('"\uE19E"', JSON.stringify('\uE19E'));
assertEquals('"\uE1B1"', JSON.stringify('\uE1B1'));
assertEquals('"\uE24F"', JSON.stringify('\uE24F'));
assertEquals('"\uE262"', JSON.stringify('\uE262'));
assertEquals('"\uE2C9"', JSON.stringify('\uE2C9'));
assertEquals('"\uE2DF"', JSON.stringify('\uE2DF'));
assertEquals('"\uE389"', JSON.stringify('\uE389'));
assertEquals('"\uE413"', JSON.stringify('\uE413'));
assertEquals('"\uE546"', JSON.stringify('\uE546'));
assertEquals('"\uE5E4"', JSON.stringify('\uE5E4'));
assertEquals('"\uE66B"', JSON.stringify('\uE66B'));
assertEquals('"\uE73D"', JSON.stringify('\uE73D'));
assertEquals('"\uE74F"', JSON.stringify('\uE74F'));
assertEquals('"\uE759"', JSON.stringify('\uE759'));
assertEquals('"\uE795"', JSON.stringify('\uE795'));
assertEquals('"\uE836"', JSON.stringify('\uE836'));
assertEquals('"\uE85D"', JSON.stringify('\uE85D'));
assertEquals('"\uE909"', JSON.stringify('\uE909'));
assertEquals('"\uE990"', JSON.stringify('\uE990'));
assertEquals('"\uE99F"', JSON.stringify('\uE99F'));
assertEquals('"\uE9AC"', JSON.stringify('\uE9AC'));
assertEquals('"\uE9C2"', JSON.stringify('\uE9C2'));
assertEquals('"\uEB11"', JSON.stringify('\uEB11'));
assertEquals('"\uED33"', JSON.stringify('\uED33'));
assertEquals('"\uED7D"', JSON.stringify('\uED7D'));
assertEquals('"\uEDA9"', JSON.stringify('\uEDA9'));
assertEquals('"\uEDFB"', JSON.stringify('\uEDFB'));
assertEquals('"\uEE09"', JSON.stringify('\uEE09'));
assertEquals('"\uEE0D"', JSON.stringify('\uEE0D'));
assertEquals('"\uEE34"', JSON.stringify('\uEE34'));
assertEquals('"\uEE37"', JSON.stringify('\uEE37'));
assertEquals('"\uEE38"', JSON.stringify('\uEE38'));
assertEquals('"\uEF80"', JSON.stringify('\uEF80'));
assertEquals('"\uEFE2"', JSON.stringify('\uEFE2'));
assertEquals('"\uF02C"', JSON.stringify('\uF02C'));
assertEquals('"\uF09A"', JSON.stringify('\uF09A'));
assertEquals('"\uF0C1"', JSON.stringify('\uF0C1'));
assertEquals('"\uF12C"', JSON.stringify('\uF12C'));
assertEquals('"\uF250"', JSON.stringify('\uF250'));
assertEquals('"\uF2A3"', JSON.stringify('\uF2A3'));
assertEquals('"\uF340"', JSON.stringify('\uF340'));
assertEquals('"\uF3C9"', JSON.stringify('\uF3C9'));
assertEquals('"\uF3F5"', JSON.stringify('\uF3F5'));
assertEquals('"\uF41B"', JSON.stringify('\uF41B'));
assertEquals('"\uF420"', JSON.stringify('\uF420'));
assertEquals('"\uF440"', JSON.stringify('\uF440'));
assertEquals('"\uF4AE"', JSON.stringify('\uF4AE'));
assertEquals('"\uF4B0"', JSON.stringify('\uF4B0'));
assertEquals('"\uF50D"', JSON.stringify('\uF50D'));
assertEquals('"\uF55D"', JSON.stringify('\uF55D'));
assertEquals('"\uF55E"', JSON.stringify('\uF55E'));
assertEquals('"\uF5CD"', JSON.stringify('\uF5CD'));
assertEquals('"\uF657"', JSON.stringify('\uF657'));
assertEquals('"\uF66D"', JSON.stringify('\uF66D'));
assertEquals('"\uF68F"', JSON.stringify('\uF68F'));
assertEquals('"\uF6A6"', JSON.stringify('\uF6A6'));
assertEquals('"\uF6AA"', JSON.stringify('\uF6AA'));
assertEquals('"\uF6EB"', JSON.stringify('\uF6EB'));
assertEquals('"\uF79A"', JSON.stringify('\uF79A'));
assertEquals('"\uF7E7"', JSON.stringify('\uF7E7'));
assertEquals('"\uF7E8"', JSON.stringify('\uF7E8'));
assertEquals('"\uF834"', JSON.stringify('\uF834'));
assertEquals('"\uF88B"', JSON.stringify('\uF88B'));
assertEquals('"\uF8D5"', JSON.stringify('\uF8D5'));
assertEquals('"\uF8F1"', JSON.stringify('\uF8F1'));
assertEquals('"\uF905"', JSON.stringify('\uF905'));
assertEquals('"\uF927"', JSON.stringify('\uF927'));
assertEquals('"\uF943"', JSON.stringify('\uF943'));
assertEquals('"\uF949"', JSON.stringify('\uF949'));
assertEquals('"\uF9A1"', JSON.stringify('\uF9A1'));
assertEquals('"\uF9C7"', JSON.stringify('\uF9C7'));
assertEquals('"\uFA0F"', JSON.stringify('\uFA0F'));
assertEquals('"\uFA20"', JSON.stringify('\uFA20'));
assertEquals('"\uFAA7"', JSON.stringify('\uFAA7'));
assertEquals('"\uFBCD"', JSON.stringify('\uFBCD'));
assertEquals('"\uFBF7"', JSON.stringify('\uFBF7'));
assertEquals('"\uFC40"', JSON.stringify('\uFC40'));
assertEquals('"\uFC4B"', JSON.stringify('\uFC4B'));
assertEquals('"\uFC51"', JSON.stringify('\uFC51'));
assertEquals('"\uFC5E"', JSON.stringify('\uFC5E'));
assertEquals('"\uFC67"', JSON.stringify('\uFC67'));
assertEquals('"\uFC8B"', JSON.stringify('\uFC8B'));
assertEquals('"\uFE32"', JSON.stringify('\uFE32'));
assertEquals('"\uFFC4"', JSON.stringify('\uFFC4'));
assertEquals('"\uFFFD"', JSON.stringify('\uFFFD'));
assertEquals('"\uFFFE"', JSON.stringify('\uFFFE'));
assertEquals('"\uFFFF"', JSON.stringify('\uFFFF'));

// A random selection of astral symbols, i.e. surrogate pairs, i.e.
// code points from U+010000 to U+10FFFF.
assertEquals('"\u{10000}"', JSON.stringify('\u{10000}'));
assertEquals('"\u{11DE7}"', JSON.stringify('\u{11DE7}'));
assertEquals('"\u{15997}"', JSON.stringify('\u{15997}'));
assertEquals('"\u{187B0}"', JSON.stringify('\u{187B0}'));
assertEquals('"\u{190B2}"', JSON.stringify('\u{190B2}'));
assertEquals('"\u{1BF79}"', JSON.stringify('\u{1BF79}'));
assertEquals('"\u{1C624}"', JSON.stringify('\u{1C624}'));
assertEquals('"\u{1D9F4}"', JSON.stringify('\u{1D9F4}'));
assertEquals('"\u{24149}"', JSON.stringify('\u{24149}'));
assertEquals('"\u{2521C}"', JSON.stringify('\u{2521C}'));
assertEquals('"\u{2762D}"', JSON.stringify('\u{2762D}'));
assertEquals('"\u{2930B}"', JSON.stringify('\u{2930B}'));
assertEquals('"\u{29EC4}"', JSON.stringify('\u{29EC4}'));
assertEquals('"\u{29F9A}"', JSON.stringify('\u{29F9A}'));
assertEquals('"\u{2A27D}"', JSON.stringify('\u{2A27D}'));
assertEquals('"\u{2B363}"', JSON.stringify('\u{2B363}'));
assertEquals('"\u{2C037}"', JSON.stringify('\u{2C037}'));
assertEquals('"\u{2FAE0}"', JSON.stringify('\u{2FAE0}'));
assertEquals('"\u{2FFCF}"', JSON.stringify('\u{2FFCF}'));
assertEquals('"\u{32C1C}"', JSON.stringify('\u{32C1C}'));
assertEquals('"\u{33DA8}"', JSON.stringify('\u{33DA8}'));
assertEquals('"\u{3DCA4}"', JSON.stringify('\u{3DCA4}'));
assertEquals('"\u{44FA0}"', JSON.stringify('\u{44FA0}'));
assertEquals('"\u{45618}"', JSON.stringify('\u{45618}'));
assertEquals('"\u{47395}"', JSON.stringify('\u{47395}'));
assertEquals('"\u{4752C}"', JSON.stringify('\u{4752C}'));
assertEquals('"\u{483FE}"', JSON.stringify('\u{483FE}'));
assertEquals('"\u{49D35}"', JSON.stringify('\u{49D35}'));
assertEquals('"\u{4CE3B}"', JSON.stringify('\u{4CE3B}'));
assertEquals('"\u{55196}"', JSON.stringify('\u{55196}'));
assertEquals('"\u{58B3E}"', JSON.stringify('\u{58B3E}'));
assertEquals('"\u{5AA47}"', JSON.stringify('\u{5AA47}'));
assertEquals('"\u{5C4B8}"', JSON.stringify('\u{5C4B8}'));
assertEquals('"\u{5DD1B}"', JSON.stringify('\u{5DD1B}'));
assertEquals('"\u{5FDCB}"', JSON.stringify('\u{5FDCB}'));
assertEquals('"\u{611BA}"', JSON.stringify('\u{611BA}'));
assertEquals('"\u{66433}"', JSON.stringify('\u{66433}'));
assertEquals('"\u{690D7}"', JSON.stringify('\u{690D7}'));
assertEquals('"\u{6F617}"', JSON.stringify('\u{6F617}'));
assertEquals('"\u{711E4}"', JSON.stringify('\u{711E4}'));
assertEquals('"\u{758D2}"', JSON.stringify('\u{758D2}'));
assertEquals('"\u{780AC}"', JSON.stringify('\u{780AC}'));
assertEquals('"\u{7AE5F}"', JSON.stringify('\u{7AE5F}'));
assertEquals('"\u{7C2FB}"', JSON.stringify('\u{7C2FB}'));
assertEquals('"\u{7D25F}"', JSON.stringify('\u{7D25F}'));
assertEquals('"\u{8027A}"', JSON.stringify('\u{8027A}'));
assertEquals('"\u{84817}"', JSON.stringify('\u{84817}'));
assertEquals('"\u{8B070}"', JSON.stringify('\u{8B070}'));
assertEquals('"\u{8B390}"', JSON.stringify('\u{8B390}'));
assertEquals('"\u{8BC03}"', JSON.stringify('\u{8BC03}'));
assertEquals('"\u{8BE63}"', JSON.stringify('\u{8BE63}'));
assertEquals('"\u{8F12A}"', JSON.stringify('\u{8F12A}'));
assertEquals('"\u{9345D}"', JSON.stringify('\u{9345D}'));
assertEquals('"\u{937A9}"', JSON.stringify('\u{937A9}'));
assertEquals('"\u{94596}"', JSON.stringify('\u{94596}'));
assertEquals('"\u{967BB}"', JSON.stringify('\u{967BB}'));
assertEquals('"\u{A19D1}"', JSON.stringify('\u{A19D1}'));
assertEquals('"\u{A4FC5}"', JSON.stringify('\u{A4FC5}'));
assertEquals('"\u{AC9CF}"', JSON.stringify('\u{AC9CF}'));
assertEquals('"\u{B1366}"', JSON.stringify('\u{B1366}'));
assertEquals('"\u{B3D32}"', JSON.stringify('\u{B3D32}'));
assertEquals('"\u{B74BA}"', JSON.stringify('\u{B74BA}'));
assertEquals('"\u{B8FB0}"', JSON.stringify('\u{B8FB0}'));
assertEquals('"\u{BA0A5}"', JSON.stringify('\u{BA0A5}'));
assertEquals('"\u{BB48E}"', JSON.stringify('\u{BB48E}'));
assertEquals('"\u{C0B60}"', JSON.stringify('\u{C0B60}'));
assertEquals('"\u{C2D34}"', JSON.stringify('\u{C2D34}'));
assertEquals('"\u{C6C75}"', JSON.stringify('\u{C6C75}'));
assertEquals('"\u{C9F26}"', JSON.stringify('\u{C9F26}'));
assertEquals('"\u{CDBD0}"', JSON.stringify('\u{CDBD0}'));
assertEquals('"\u{D1E28}"', JSON.stringify('\u{D1E28}'));
assertEquals('"\u{D4A80}"', JSON.stringify('\u{D4A80}'));
assertEquals('"\u{D947F}"', JSON.stringify('\u{D947F}'));
assertEquals('"\u{D9B8A}"', JSON.stringify('\u{D9B8A}'));
assertEquals('"\u{DA203}"', JSON.stringify('\u{DA203}'));
assertEquals('"\u{DEFD3}"', JSON.stringify('\u{DEFD3}'));
assertEquals('"\u{E4F7C}"', JSON.stringify('\u{E4F7C}'));
assertEquals('"\u{E6BB3}"', JSON.stringify('\u{E6BB3}'));
assertEquals('"\u{E972D}"', JSON.stringify('\u{E972D}'));
assertEquals('"\u{EB335}"', JSON.stringify('\u{EB335}'));
assertEquals('"\u{ED3F8}"', JSON.stringify('\u{ED3F8}'));
assertEquals('"\u{ED940}"', JSON.stringify('\u{ED940}'));
assertEquals('"\u{EF6F8}"', JSON.stringify('\u{EF6F8}'));
assertEquals('"\u{F1F57}"', JSON.stringify('\u{F1F57}'));
assertEquals('"\u{F33B5}"', JSON.stringify('\u{F33B5}'));
assertEquals('"\u{F4D2A}"', JSON.stringify('\u{F4D2A}'));
assertEquals('"\u{F70BA}"', JSON.stringify('\u{F70BA}'));
assertEquals('"\u{F899F}"', JSON.stringify('\u{F899F}'));
assertEquals('"\u{1034BF}"', JSON.stringify('\u{1034BF}'));
assertEquals('"\u{107ACF}"', JSON.stringify('\u{107ACF}'));
assertEquals('"\u{10881F}"', JSON.stringify('\u{10881F}'));
assertEquals('"\u{1098A5}"', JSON.stringify('\u{1098A5}'));
assertEquals('"\u{10ABD1}"', JSON.stringify('\u{10ABD1}'));
assertEquals('"\u{10B5C5}"', JSON.stringify('\u{10B5C5}'));
assertEquals('"\u{10CC79}"', JSON.stringify('\u{10CC79}'));
assertEquals('"\u{10CD19}"', JSON.stringify('\u{10CD19}'));
assertEquals('"\u{10FFFF}"', JSON.stringify('\u{10FFFF}'));
