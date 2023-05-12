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

function f() {
  var x = 131071;
  var tmp = 0;
  assertEquals(1117196836, x -= (-1117065765));
  assertEquals(3092236000.7125187, x -= (-1975039164.7125185));
  assertEquals(1, x /= x);
  assertEquals(-1599945863, x ^= (tmp = 2695021432.453696, tmp));
  assertEquals(940543782, x ^= (tmp = 2561494111, tmp));
  assertEquals(891400321673221800, x *= (tmp = 947749949.2662871, tmp));
  assertEquals(-1509927296, x >>= ((tmp = 1113290009, tmp)-x));
  assertEquals(-23, x >>= (tmp = 3216989626.7370152, tmp));
  assertEquals(-0, x %= x);
  assertEquals(0, x <<= (431687857.15246475));
  assertEquals(-0, x /= (tmp = -1924652745.081665, tmp));
  assertEquals(0, x <<= (1312950547.2179976));
  assertEquals(0, x %= ((tmp = 2110842937.8580878, tmp)|(x<<x)));
  assertEquals(0, x >>>= ((((-386879000)-((tmp = -2334036143.9396124, tmp)/((tmp = 965101904.2841234, tmp)<<(((3029227182.8426695)<<((tmp = -464466927, tmp)>>((((((tmp = 849594477.4111787, tmp)^(x&((513950657.6663146)%(x>>>x))))-((2898589263)|x))+(tmp = 2842171258.621288, tmp))>>>(tmp = -3158746843, tmp))<<(tmp = -2891369879, tmp))))-(x-(x&(tmp = -1707413686.2706504, tmp)))))))-(-2860419051))*(-1708418923)));
  assertEquals(-328055783, x += ((((2857010474.8010874)|((tmp = -1415997622.320347, tmp)-(-1706423374)))%(tmp = 824357977.1339042, tmp))^(x>>(x|x))));
  assertEquals(-168539902503779140, x *= ((tmp = -1057687018, tmp)<<((1408752963)-(2030056734))));
  assertEquals(-Infinity, x /= ((x-(2232683614.320658))*(((tmp = 195551174, tmp)*((((739595970)>>>(tmp = -2218890946.8788786, tmp))>>>(((tmp = -240716255.22407627, tmp)&(((((1598029916.3478878)|((tmp = -881749732, tmp)+(x>>x)))^(4443059))<<(((tmp = 2453020763, tmp)+((x>>>(tmp = -1904203813, tmp))&(-355424604.49235344)))<<(tmp = 2814696070, tmp)))%((tmp = -250266444, tmp)>>>(((((2710614972)&(((tmp = 910572052.6994087, tmp)^(tmp = -1028443184.3220406, tmp))/((-2718010521)^(tmp = 676361106, tmp))))|x)^(-1326539884))>>(-1573782639.7129154)))))/(tmp = 1923172768, tmp)))>>>(tmp = -2858780232.4886074, tmp)))/((((((-2060319376.353397)%x)>>(tmp = -3122570085.9065285, tmp))/(tmp = -1499018723.8064275, tmp))*((-655257391)<<x))>>x))));
  assertEquals(NaN, x += ((3059633304)%((((tmp = 2538190083, tmp)*((tmp = -2386800763.356364, tmp)/x))&(1341370996))%(-2929765076.078223))));
  assertEquals(NaN, x %= ((x&(347774821))>>>(462318570.2578629)));
  assertEquals(NaN, x *= ((2829810152.071517)*(tmp = 768565684.6892327, tmp)));
  assertEquals(NaN, x -= x);
  assertEquals(0, x >>>= (x&(tmp = 1786182552, tmp)));
  assertEquals(973967377, x ^= ((tmp = 2115869489.836838, tmp)&(994956497)));
  assertEquals(985246427.4230617, x += (11279050.423061728));
  assertEquals(985246427, x &= x);
  assertEquals(0, x >>= ((tmp = 1090502660.1867907, tmp)>>((-1599370623.5747645)-(tmp = -1321550958, tmp))));
  assertEquals(0, x %= (tmp = -2386531950.018572, tmp));
  assertEquals(0, x >>>= x);
  assertEquals(NaN, x /= x);
  assertEquals(0, x >>>= (tmp = -1535987507.682257, tmp));
  assertEquals(-0, x /= (-2570639987));
  assertEquals(-542895632, x |= (tmp = -542895632, tmp));
  assertEquals(-33930977, x >>= (tmp = -861198108.1147206, tmp));
  assertEquals(-0, x %= x);
  assertEquals(0, x ^= (x*(-608154714.1872904)));
  assertEquals(-140011520, x |= ((tmp = 377418995, tmp)<<((1989575902)>>(tmp = -2558458031.066773, tmp))));
  assertEquals(-140026048, x -= ((((tmp = 1465272774.7540011, tmp)<<((2164701398)<<(tmp = -818119264, tmp)))>>((tmp = -1490486001, tmp)>>(664410099.6412607)))>>(x>>>(((tmp = -2438272073.2205153, tmp)%(tmp = 2142162105.4572072, tmp))-(tmp = 2259040711.6543813, tmp)))));
  assertEquals(39214588236996610, x *= (x<<(-401696127.06632423)));
  assertEquals(1, x /= x);
  assertEquals(0, x %= x);
  assertEquals(0, x *= ((tmp = -1709874807.176726, tmp)&(-2786424611)));
  assertEquals(-1320474063.3408537, x += (tmp = -1320474063.3408537, tmp));
  assertEquals(88, x >>>= (tmp = -3179247911.7094674, tmp));
  assertEquals(1606348131, x += ((tmp = 1555621121.5726175, tmp)|(-3026277110.9493155)));
  assertEquals(200793516, x >>>= x);
  assertEquals(-2952688672.1074514, x -= (tmp = 3153482188.1074514, tmp));
  assertEquals(1342278624, x >>>= ((x>>>((tmp = 1264475713, tmp)-(-913041544)))>>>((tmp = 2008379930, tmp)%(tmp = 3105129336, tmp))));
  assertEquals(0, x ^= x);
  assertEquals(0, x /= (tmp = 788363717, tmp));
  assertEquals(430466213, x -= (tmp = -430466213, tmp));
  assertEquals(164757385222499550, x *= (tmp = 382741735, tmp));
  assertEquals(164757385222499550, x %= (((tmp = 1974063648, tmp)%((806015603)>>>x))*((tmp = 2836795324, tmp)<<(tmp = -1785878767, tmp))));
  assertEquals(-190957725.86956096, x /= (x^((-2939333300.066044)-(x|(-2085991826)))));
  assertEquals(-190957725.86956096, x %= (tmp = -948386352, tmp));
  assertEquals(0.6457336106922105, x /= (-295722141));
  assertEquals(0, x |= ((415991250)&((x>>(tmp = -3188277823, tmp))<<(511898664.1008285))));
  assertEquals(0, x &= ((793238922)|x));
  assertEquals(-1576701979, x ^= (2718265317));
  assertEquals(-49271937, x >>= x);
  assertEquals(-49271937, x |= x);
  assertEquals(-49271937, x &= x);
  assertEquals(775316382, x -= (-824588319));
  assertEquals(912498176, x <<= (tmp = -2223542776.836312, tmp));
  assertEquals(0, x -= (x&((tmp = 1999412385.1074471, tmp)/(-1628205254))));
  assertEquals(0, x -= x);
  assertEquals(0, x >>= (-768730139.7749677));
  assertEquals(-1861304245, x |= (((5128483)^(((tmp = -1768372004, tmp)/(x^(tmp = 1310002444.757094, tmp)))*((tmp = 188242683.09898067, tmp)^(tmp = -2263757432, tmp))))^((tmp = 2223246327, tmp)*((tmp = -2360528979, tmp)-((tmp = 2442334308, tmp)>>(458302081))))));
  assertEquals(1, x /= x);
  assertEquals(2, x += x);
  assertEquals(1, x /= x);
  assertEquals(0, x ^= x);
  assertEquals(-0, x *= (-1852374359.3930533));
  assertEquals(0, x <<= (tmp = 1223645195.148961, tmp));
  assertEquals(1789655087, x |= ((-2505312209.770559)>>x));
  assertEquals(-65568768, x <<= x);
  assertEquals(4229398528, x >>>= x);
  assertEquals(-8408187, x |= (-3029781627));
  assertEquals(-8408187, x |= (((2322165037)-((tmp = -1424506897.362995, tmp)%x))&x));
  assertEquals(-7884926, x += (x>>>(x|(2738095820))));
  assertEquals(-7884926, x %= (576507013));
  assertEquals(751801768, x ^= (tmp = -750241238, tmp));
  assertEquals(-1986010067668600800, x *= (tmp = -2641667195, tmp));
  assertEquals(1921196240, x ^= (x%(-1954178308)));
  assertEquals(847388880, x ^= ((tmp = 1632856124, tmp)&((tmp = -1536309755, tmp)<<(tmp = -3158362800, tmp))));
  assertEquals(-469662000.6651099, x += (tmp = -1317050880.6651099, tmp));
  assertEquals(-812358332, x ^= ((-2832480471)>>>(2016495937)));
  assertEquals(21, x ^= (((tmp = 1815603134.2513008, tmp)/((tmp = 147415927, tmp)%(-1059701742)))+x));
  assertEquals(-2844409139.792712, x += (tmp = -2844409160.792712, tmp));
  assertEquals(177070, x >>>= x);
  assertEquals(0, x %= x);
  assertEquals(0, x >>= x);
  assertEquals(1459126376, x ^= (tmp = -2835840920, tmp));
  assertEquals(1459126376, x %= (-1462864282));
  assertEquals(0, x >>>= (tmp = 2922724319, tmp));
  assertEquals(338995506, x ^= (338995506.6411549));
  assertEquals(336896258, x &= (2635904967));
  assertEquals(336634112, x -= (x&(tmp = 1659656287, tmp)));
  assertEquals(NaN, x %= (x-x));
  assertEquals(NaN, x /= (tmp = -674606200, tmp));
  assertEquals(NaN, x %= ((x|(2788108542))/(x+(tmp = 600941473, tmp))));
  assertEquals(0, x >>>= ((-1858251597.3970242)>>>x));
  assertEquals(1951294747, x |= (tmp = 1951294747, tmp));
  assertEquals(1951294747, x &= x);
  assertEquals(-153190625, x |= (-1500095737));
  assertEquals(23467367587890624, x *= x);
  assertEquals(346531290.1813514, x /= (((((-513617734.11148167)|x)/((tmp = -2042982150.1170752, tmp)%((x%((x%x)>>>(((-1369980151)&(((922678983)%(x&(tmp = -855337708, tmp)))-((tmp = -2717183760, tmp)>>>((1939904985.4701347)%(((tmp = -2473316858, tmp)&((tmp = -599556221.9046664, tmp)>>((tmp = -6352213, tmp)/x)))&x)))))%x)))/((tmp = -1842773812.8648412, tmp)>>>(((x>>>(tmp = 499774063, tmp))<<(((tmp = -1353532660.5755146, tmp)*(-3070956509))>>(((-905883994.0188017)>>(tmp = -16637173, tmp))<<((tmp = 471668537, tmp)*((tmp = -232036004.26637793, tmp)/x)))))&(tmp = 85227224, tmp))))))>>>(x|(-2528471983)))-((tmp = 1531574803, tmp)+((x>>>x)-(2889291290.158888)))));
  assertEquals(-94.42225749399837, x /= (((tmp = 2381634642.1432824, tmp)>>(tmp = -2637618935, tmp))|(2307200473)));
  assertEquals(-47, x >>= (1524333345.141235));
  assertEquals(-2.8699253616435082e-8, x /= (1637673252));
  assertEquals(0, x |= x);
  assertEquals(1083427040, x += ((-2012055268)<<(tmp = -2192382589.6911573, tmp)));
  assertEquals(1083427040, x %= (x*x));
  assertEquals(2694039776, x += ((((-1740065704.9004602)<<(-736392934))%(2781638048.424092))>>>(x&x)));
  assertEquals(-1600927520, x |= ((tmp = 2904430054.869525, tmp)*(((1054051883.4751332)*x)*((-939020743)-(tmp = 1636935481.1834455, tmp)))));
  assertEquals(-1600927520, x -= (x%x));
  assertEquals(3037584978216498700, x *= (tmp = -1897390694, tmp));
  assertEquals(372598954.1823988, x %= (tmp = 1553763703.5082102, tmp));
  assertEquals(-1476395008, x <<= ((x>>((tmp = 282496335.49494267, tmp)^((-1948623419.6947453)|((((((tmp = -1203306995, tmp)-(-5554612.355098486))>>>(1867254951.4836824))>>x)|(-695777865))/((-59122652.19377303)<<(-609999229.7448442))))))>>(x/(tmp = -1207010654.9993455, tmp))));
  assertEquals(-2.2540185787941605, x /= (((tmp = 1364159859.9199843, tmp)*x)>>x));
  assertEquals(-2, x |= x);
  assertEquals(2241824008, x *= ((3174055292.962967)>>(((-2379151623.602476)>>(tmp = -1423760236, tmp))>>(tmp = -522536019.2225733, tmp))));
  assertEquals(-2138158385, x ^= ((x>>((((1316131966.9180691)-((x*x)>>x))>>>x)>>((-2712430284)|(((((x<<(-616185937.6090865))-(((x-(tmp = 2957048661, tmp))<<(tmp = 617564839.888214, tmp))/(x%((tmp = -447175647.9393475, tmp)<<(2203298493.460617)))))-((x&((x<<(914944265))^(((-1294901094)*((tmp = 2512344795, tmp)+((((tmp = -1227572518, tmp)%(1831277766.4920158))*((x|x)^(tmp = 2515415182.6718826, tmp)))*x)))-(961485129))))>>>(tmp = 2079018304, tmp)))>>(tmp = 734028202, tmp))^(554858721.6149715)))))-((tmp = 1312985279.5114603, tmp)^(tmp = 2450817476.179955, tmp))));
  assertEquals(2.759030298237921, x /= (x|(tmp = -775901745.3688724, tmp)));
  assertEquals(8, x <<= x);
  assertEquals(NaN, x %= (((x&((1792031228.831834)>>(-1174912501)))%(((-2351757750)+(tmp = -2610099430, tmp))*(-2811655968)))*(x&(tmp = -1881632878, tmp))));
  assertEquals(0, x &= ((x*(616116645.7508612))^(2789436828.536846)));
  assertEquals(0, x *= x);
  assertEquals(35097452, x ^= ((tmp = 1023684579, tmp)%(((x|((tmp = -757953041, tmp)+(772988909)))+(tmp = -2934577578, tmp))>>>((tmp = -1973224283, tmp)>>>((x*(2244818063.270375))|(x-(-716709285)))))));
  assertEquals(0.015207441433418992, x /= (2307913014.4056892));
  assertEquals(-5865042.942076175, x -= (5865042.957283616));
  assertEquals(-67719.94207617454, x %= (((1464126615.2493973)+(398302030.0108756))>>>x));
  assertEquals(4294899577, x >>>= (x<<x));
  assertEquals(-1, x >>= (tmp = 607447902, tmp));
  assertEquals(-1, x >>= (3081219749.9119744));
  assertEquals(6.53694303504065e-10, x /= (tmp = -1529767040.4034374, tmp));
  assertEquals(6.53694303504065e-10, x %= ((tmp = 899070650.7190754, tmp)&(tmp = -1101166301, tmp)));
  assertEquals(6.53694303504065e-10, x %= (tmp = -2207346460, tmp));
  assertEquals(NaN, x %= (((x&x)>>x)%(((-10980184)+x)&(tmp = -1473044870.4729445, tmp))));
  assertEquals(NaN, x -= x);
  assertEquals(-1755985426, x ^= (tmp = 2538981870, tmp));
  assertEquals(-13842, x %= ((((-2258237411.3816605)+(-1325704332.0531585))<<((tmp = -877665450.1877053, tmp)>>(((((2420989037)+(2084279990.6278818))*(-327869571.9348242))+x)^x)))>>>x));
  assertEquals(1, x /= x);
  assertEquals(1, x >>= ((2241312290)^(2859250114)));
  assertEquals(0, x >>= x);
  assertEquals(-1615631756, x |= (-1615631756.1469975));
  assertEquals(-1615631756, x |= x);
  assertEquals(-627245056, x <<= ((x*(tmp = -1308330685.5971081, tmp))|(tmp = 1479586158, tmp)));
  assertEquals(-627245056, x |= x);
  assertEquals(1786953888, x ^= (-1340096352.1839824));
  assertEquals(1668014353, x -= (tmp = 118939535, tmp));
  assertEquals(1, x /= x);
  assertEquals(-645681, x ^= ((-1322356629)>>(tmp = 1829870283, tmp)));
  assertEquals(-1322354688, x <<= (-794779253));
  assertEquals(-4310084378.672725, x += (-2987729690.6727247));
  assertEquals(-8620168757.34545, x += x);
  assertEquals(-8720421, x |= (tmp = -748107877.6417065, tmp));
  assertEquals(-1508858270, x ^= (1500137913));
  assertEquals(-0.825735756765112, x /= (1827289490.1767085));
  assertEquals(1253449509.1742642, x += (((tmp = 1253449509.9576545, tmp)-(((tmp = 2860243975, tmp)+(367947569.85976696))>>(((((530960315)>>>((((x%(tmp = -2203199228, tmp))<<(x*(((tmp = -117302283, tmp)/(x-((2579576936)%(-1225024012))))&(tmp = -2857767500.1967726, tmp))))/((x/((tmp = -166066119, tmp)<<x))|x))>>>x))|(((2771852372)>>(((tmp = -3103692094.1463976, tmp)-(tmp = 2867208546.069278, tmp))>>>(702718610.1963737)))|(tmp = 2680447361, tmp)))>>x)>>(-2006613979.051014))))^((-1665626277.9339101)/(x<<(tmp = 342268763, tmp)))));
  assertEquals(1693336701.1742642, x += (tmp = 439887192, tmp));
  assertEquals(0.8479581831275719, x /= ((1171383583)+(((x&x)>>>(51482548.618915915))-(tmp = -825572595.1031849, tmp))));
  assertEquals(28, x |= ((tmp = -2355932919.6737213, tmp)>>(tmp = -2395605638, tmp)));
  assertEquals(0, x %= x);
  assertEquals(0, x -= x);
  assertEquals(0, x <<= (x^((tmp = 2793423893.484949, tmp)*(1585074754.3250475))));
  assertEquals(0, x >>= (x/(x-((957719861.9175875)&(1288527195)))));
  assertEquals(0, x >>>= ((-1429196921.4432657)/x));
  assertEquals(-852424225.734199, x -= (tmp = 852424225.734199, tmp));
  assertEquals(-46674433, x |= ((tmp = -2335242963, tmp)*((2135206646.2614377)>>(tmp = 505649511.8292929, tmp))));
  assertEquals(2944662357, x += (tmp = 2991336790, tmp));
  assertEquals(1404, x >>>= (849155189.1503456));
  assertEquals(-846755170, x ^= (tmp = -846753822.4471285, tmp));
  assertEquals(52615, x >>>= ((-517068110)+x));
  assertEquals(1475021859.9916897, x += (tmp = 1474969244.9916897, tmp));
  assertEquals(0, x %= x);
  assertEquals(0, x %= ((539583595.8244679)*(tmp = 1469751690.9193692, tmp)));
  assertEquals(0, x &= (807524227.2057163));
  assertEquals(NaN, x %= x);
  assertEquals(NaN, x -= (x^((tmp = -362481588, tmp)%(2611296227))));
  assertEquals(NaN, x *= x);
  assertEquals(0, x >>= ((-2519875630.999908)<<x));
  assertEquals(NaN, x %= x);
  assertEquals(NaN, x += (((tmp = 2485209575, tmp)>>(tmp = 2326979823, tmp))%(x-(((-1296334640.7476478)&x)<<x))));
  assertEquals(0, x >>= (((tmp = 1370704131, tmp)^((((tmp = 793217372.7587746, tmp)>>(((-1455696484.109328)|(((((-2186284424.5379324)<<(tmp = 3052914152.254852, tmp))-(x>>(tmp = 3121403408, tmp)))+((778194280)-(((((tmp = 2398957652, tmp)-(x+(((-2592019996.937958)>>((tmp = 1648537981, tmp)>>x))<<(-677436594))))<<(39366669.09012544))|((tmp = 3133808408.9582872, tmp)-(-2987527245.010673)))*x)))|((tmp = -2178662629, tmp)<<x)))^(((tmp = 909652440.3570575, tmp)%(-2572839902.6852217))%(-1879408081))))*(tmp = -2910988598, tmp))&(((x^x)>>(2822040993))|((x*x)^(((1072489842.6785052)|(x-(((464054192.7390214)^x)<<(tmp = -2754448095, tmp))))*((tmp = -1544182396, tmp)/(tmp = -3198554481, tmp)))))))^(tmp = 1946162396.9841106, tmp)));
  assertEquals(371272192, x |= (((x^((x-(x/x))&(tmp = 2370429394, tmp)))-(tmp = -403692829, tmp))*(tmp = 2808636109, tmp)));
  assertEquals(929786482, x |= ((729966239.8987448)^(x-((tmp = 120127779, tmp)^((tmp = -3088531385, tmp)>>>((x+((tmp = 2364833601, tmp)>>>(((599149090.6666714)>>(tmp = 2838821032, tmp))%(tmp = -662846011, tmp))))-(tmp = 1168491221.1813436, tmp)))))));
  assertEquals(-681121542, x += ((-1610909505.998718)^((tmp = -957338882, tmp)>>>(tmp = 1935594133.6531684, tmp))));
  assertEquals(-2147483648, x <<= ((tmp = 15161708, tmp)|(2453975670)));
  assertEquals(-2147483648, x >>= x);
  assertEquals(0, x <<= (2080486058));
  assertEquals(0, x &= (((x&(tmp = -767821326, tmp))/((tmp = 1877040536, tmp)>>>(tmp = 2378603217.75597, tmp)))*(-1601799835)));
  assertEquals(0, x %= (-1820240383));
  assertEquals(1621233920, x ^= ((tmp = 820230232, tmp)*(1727283900)));
  assertEquals(1621233920, x |= (x>>>x));
  assertEquals(1621233931, x += ((tmp = 794966194.9011587, tmp)>>(tmp = -597737830.5450518, tmp)));
  assertEquals(1621276543, x |= (((x^((2354444886)+(tmp = 685142845.4708651, tmp)))-(tmp = 790204976.9120214, tmp))>>>((((tmp = -2792921939, tmp)/(((((tmp = -80705524, tmp)<<x)-(((((((tmp = 1951577216.379527, tmp)>>>x)%((-529882150)>>>(tmp = -1682409624, tmp)))<<((-42043756.29025769)-(-1803729173.6855814)))/(2937202170.118023))*(tmp = -1998098798.5722106, tmp))*(tmp = -2996229463.904228, tmp)))&x)>>>(-301330643)))/(-2858859382.0050273))-(tmp = 1571854256.0740635, tmp))));
  assertEquals(810638271, x >>>= (x/(1553632833)));
  assertEquals(810638271, x <<= (tmp = -1467397440, tmp));
  assertEquals(-2147483648, x <<= x);
  assertEquals(871068871, x ^= (tmp = 3018552519, tmp));
  assertEquals(-1073743881, x |= ((tmp = 2294122324.020989, tmp)|(tmp = -1799706842.4493146, tmp)));
  assertEquals(-77816868, x += (((-2225296403)&x)>>(tmp = -2667103424.445239, tmp)));
  assertEquals(-1215889, x >>= (tmp = 1876107590.8391647, tmp));
  assertEquals(-2431778, x += x);
  assertEquals(4292535518, x >>>= (((x>>(-1825580683))/x)%x));
  assertEquals(4292802560, x -= (x|(1492864090)));
  assertEquals(0, x -= x);
  assertEquals(0, x >>= x);
  assertEquals(0, x %= (tmp = 2173121205, tmp));
  assertEquals(0, x *= (x>>x));
  assertEquals(1565261471, x |= ((1565261471.323931)>>>x));
  assertEquals(0, x -= x);
  assertEquals(-86980804, x |= (-86980804));
  assertEquals(-698956484, x -= (((((2754713793.1746016)*(((((-1514587465.0698888)>>(tmp = -1307050817, tmp))/(tmp = 2368054667.438519, tmp))*(-1908125943.5714772))<<(x>>>(-357164827.4932244))))+(1257487617))<<(2954979945))&(612330472)));
  assertEquals(-1073741824, x <<= x);
  assertEquals(54497747, x ^= (-1019244077.098908));
  assertEquals(54501375, x |= (((tmp = 1944912427, tmp)>>>x)%x));
  assertEquals(0, x -= x);
  assertEquals(0, x -= x);
  assertEquals(-0, x *= (-1748215388));
  assertEquals(0, x >>= x);
  assertEquals(0, x >>>= (((tmp = 988769112, tmp)%(tmp = -3133658477, tmp))<<x));
  assertEquals(0, x %= (1685221089.2950323));
  assertEquals(0, x >>>= (x+((793467168)-(tmp = 135877882, tmp))));
  assertEquals(0, x %= ((tmp = -2406801984, tmp)%(tmp = -987618172, tmp)));
  assertEquals(0, x *= ((-2943444887.953456)|(tmp = -2327469738.4544783, tmp)));
  assertEquals(0, x >>= x);
  assertEquals(-145484729.70167828, x += (tmp = -145484729.70167828, tmp));
  assertEquals(1140855872, x &= (x^(tmp = 3151437967.965556, tmp)));
  assertEquals(1486808408, x += (tmp = 345952536, tmp));
  assertEquals(107846582.36594129, x %= (-1378961825.6340587));
  assertEquals(-642031616, x <<= (x+x));
  assertEquals(151747770.95108718, x *= (x/(tmp = 2716379907, tmp)));
  assertEquals(192723456, x <<= (tmp = -1731167384, tmp));
  assertEquals(2151208003, x -= ((-2151208003)+x));
  assertEquals(1, x /= x);
  assertEquals(1, x |= x);
  assertEquals(1996766603, x |= (1996766602));
  assertEquals(895606123, x ^= (tmp = 1113972960.966081, tmp));
  assertEquals(-1500036886, x ^= (tmp = 2482412929, tmp));
  assertEquals(-1542644247, x ^= (x>>>((tmp = 51449105, tmp)>>>(((-2057313176)*x)/(-1768119916)))));
  assertEquals(-1496074063273093600, x *= ((tmp = 786152274, tmp)^(387292498)));
  assertEquals(-794329073, x %= (((tmp = -2314637675.617696, tmp)*((((x*(411053423.29070306))-(2889448433.4240828))/((-970630131)/(tmp = -2886607600.7423067, tmp)))<<(tmp = 1263617112.9362245, tmp)))|(2816980223.8209996)));
  assertEquals(2468008436047106600, x *= (tmp = -3107035257.725115, tmp));
  assertEquals(3040956928, x >>>= ((tmp = 1514372119.1787262, tmp)*(3169809008)));
  assertEquals(-19, x >>= (tmp = -266966022.10604453, tmp));
  assertEquals(-1.6505580654964654e-8, x /= ((-3143841480)>>(x-x)));
  assertEquals(-2.2420284729165577e-7, x *= (x*((((703414102.2523813)%(tmp = 2989948152, tmp))-((-1583401827.2949386)^((tmp = -1916731338, tmp)%((331500653.3566053)|(((tmp = 29865940, tmp)+((tmp = -2294889418.6764183, tmp)<<(tmp = -1558629267.255229, tmp)))>>>(x*(x+x)))))))|((988977957)&(-2986790281)))));
  assertEquals(0, x ^= (x/(tmp = 781117823.345541, tmp)));
  assertEquals(NaN, x *= (((x^((((tmp = -2969290335, tmp)+(((((tmp = -175387021, tmp)&(tmp = -1080807973, tmp))<<(tmp = -2395571076.6876855, tmp))|((tmp = -1775289899.4106793, tmp)^x))|(-2963463918)))*(tmp = -1761443911, tmp))^(tmp = 847135725, tmp)))<<((146689636)<<x))%x));
  assertEquals(0, x ^= x);
  assertEquals(1720182184, x -= (((tmp = 3184020508, tmp)|((-489485703)+(tmp = -2644503573, tmp)))&(tmp = 2575055579.6375213, tmp)));
  assertEquals(1720182184, x >>= (x<<(-45408034)));
  assertEquals(5.759243187540471e+27, x *= (((x&(1456298805))+(x<<(106573181)))*((566861317.2877743)+(2262937360.3733215))));
  assertEquals(5.759243187540471e+27, x -= (tmp = -1365873935, tmp));
  assertEquals(0, x <<= x);
  assertEquals(0, x >>= (1960073319.3465362));
  assertEquals(0, x <<= x);
  assertEquals(560463904, x += ((tmp = 1844076589.9286406, tmp)&((((((-691675777.5800121)|(-745631201))|x)+(tmp = 1504458593.2843904, tmp))-x)<<x)));
  assertEquals(-513210271, x -= (x|(1052702623.7761713)));
  assertEquals(3781757025, x >>>= ((-1346666404.362477)*(tmp = 2798191459, tmp)));
  assertEquals(1080100929, x &= (1122097879.882534));
  assertEquals(1276833905.8093092, x *= ((1276833905.8093092)/x));
  assertEquals(1276833905.8093092, x %= (1796226525.7152414));
  assertEquals(1276833905, x <<= (((tmp = -491205007.83412814, tmp)*(tmp = 1496201476.496839, tmp))>>(x+((tmp = -854043282.114594, tmp)-((x|(tmp = -807842056, tmp))*x)))));
  assertEquals(1276833905, x %= (((-1870099318)>>>(((tmp = -2689717222, tmp)/(248095232))/(tmp = 1036728800.5566598, tmp)))&(((((857866837)>>(tmp = 3034825801.740485, tmp))|(-1676371984))>>>(x<<x))%((-3035366571.0221004)*(1578324367.8819473)))));
  assertEquals(1, x /= x);
  assertEquals(2819223656.189109, x += (2819223655.189109));
  assertEquals(-1475743640, x >>= (((tmp = 2586723314.38089, tmp)/(x&(tmp = -697978283.9961061, tmp)))<<(x%((-1167534676)>>(x^((tmp = -284763535, tmp)*((x%x)&((((tmp = 2916973220.726839, tmp)%x)/(tmp = -1338421209.0621986, tmp))|((tmp = -834710536.803335, tmp)%x)))))))));
  assertEquals(-3267683406, x -= (tmp = 1791939766, tmp));
  assertEquals(-2090420900700614100, x *= (639725653));
  assertEquals(-1540353536, x %= ((-1800269105)<<((((x&(((tmp = 1135087416.3945065, tmp)^(613708290))>>x))>>(tmp = -1234604858.7683473, tmp))^(2404822882.7666225))>>>((tmp = -287205516, tmp)-((1648853730.1462333)^((x+(x%((tmp = 359176339, tmp)%((2856479172)<<(tmp = -1995209313, tmp)))))^(((tmp = 2857919171.839304, tmp)>>>(tmp = 2779498870, tmp))>>x)))))));
  assertEquals(-2093767030, x ^= (654554250.498078));
  assertEquals(1, x >>>= ((tmp = -166296226.12181997, tmp)^(x/x)));
  assertEquals(-1487427474, x -= ((x<<x)|(1487427475.4063978)));
  assertEquals(-1487427470.562726, x += ((-1226399959.8267038)/((tmp = 2172365551, tmp)<<x)));
  assertEquals(-3457859227618939400, x *= (tmp = 2324724597.3686075, tmp));
  assertEquals(396221312, x >>= (-1354035390));
  assertEquals(0, x %= x);
  assertEquals(0, x &= (tmp = 2733387603, tmp));
  assertEquals(1485905453, x |= ((((tmp = -1321532329.304437, tmp)&((((tmp = 1817382709.4180388, tmp)%(((tmp = 2089156555.7749293, tmp)-(-1555460267))|(tmp = 717392475.9986715, tmp)))%(tmp = 1976713214, tmp))^x))>>>x)+(tmp = -2812404197.002721, tmp)));
  assertEquals(1485905453, x |= x);
  assertEquals(-997658264, x <<= (-1409757949.6038744));
  assertEquals(-997657290, x -= ((-2041106361)>>(tmp = -2014750507, tmp)));
  assertEquals(-2138512124, x &= (tmp = 2565597060, tmp));
  assertEquals(8422400, x &= ((-2819342693.5172367)*(tmp = 1441722560, tmp)));
  assertEquals(111816531.81703067, x -= (-103394131.81703067));
  assertEquals(59606682.673836395, x *= ((tmp = -1451690098, tmp)/(x-(2835050651.717734))));
  assertEquals(-119213365.34767279, x *= (x|((-2656365050)/((-66180492)+(tmp = 284225706.32323086, tmp)))));
  assertEquals(-232839, x >>= (1694344809.435083));
  assertEquals(-1, x >>= x);
  assertEquals(1, x *= x);
  assertEquals(1, x |= x);
  assertEquals(0, x >>= (tmp = 397239268, tmp));
  assertEquals(-1525784563, x -= (tmp = 1525784563, tmp));
  assertEquals(-153.62740888512675, x /= (((tmp = -2040622579.5354173, tmp)*(tmp = -1149025861.549324, tmp))%(((tmp = 2981701364.0073133, tmp)*(tmp = 2993366361, tmp))|(x|(tmp = 1800299979, tmp)))));
  assertEquals(-1671795135, x &= (-1671795135.6173766));
  assertEquals(-4253, x |= ((((x*((1533721762.8796673)<<((tmp = 1026164775.0081646, tmp)<<x)))<<(((x-((((x>>((((((tmp = -481536070.7067797, tmp)&(tmp = 1663121016, tmp))>>>(-2974733313.5449667))+(tmp = -493019653, tmp))>>x)&(tmp = 879307404.8600142, tmp)))>>>x)%(x-(tmp = -1806412445.788453, tmp)))%x))<<(x<<(x+x)))+x))>>((tmp = -332473688.28477216, tmp)<<((tmp = 1701065928, tmp)+(((((tmp = -2407330783, tmp)+x)-((tmp = 584100783, tmp)%(tmp = -3077106506, tmp)))^x)>>x))))<<x));
  assertEquals(-0, x %= x);
  assertEquals(0, x >>>= x);
  assertEquals(0, x >>>= (1578470476.6074834));
  assertEquals(0, x >>>= (974609751));
  assertEquals(-120, x += (x-((tmp = -245718438.0842378, tmp)>>>(tmp = -1870354951, tmp))));
  assertEquals(-6.134465505515781e-8, x /= (1956160645));
  assertEquals(-0, x %= x);
  assertEquals(0, x *= (tmp = -399718472.70049024, tmp));
  assertEquals(-1803198769.8413258, x += (-1803198769.8413258));
  assertEquals(988624943, x ^= ((((tmp = 320776739.5608537, tmp)*(((tmp = -983452570.3150327, tmp)^x)&(tmp = -3181597938, tmp)))-(tmp = -1367913740.9036021, tmp))/(((tmp = -535854933.2943456, tmp)-(717666905.8122432))>>>(((((x^(tmp = 380453258.60062766, tmp))^(tmp = -1242333929, tmp))/((tmp = 1072416261, tmp)+(((2090466933)*(x*(tmp = -386283072, tmp)))|((tmp = 789259942, tmp)<<(tmp = -1475723636.1901488, tmp)))))>>>x)%((x>>(tmp = -1243048658.3818703, tmp))|((((((tmp = -619553509, tmp)|x)/(878117279.285609))|((x<<(x>>>(tmp = -749568437.7390883, tmp)))*x))/(tmp = 1674804407, tmp))-(x*(tmp = 1528620873, tmp))))))));
  assertEquals(988625135, x |= (x>>>(tmp = 2402222006, tmp)));
  assertEquals(988625135, x %= (-2691094165.990094));
  assertEquals(0, x %= x);
  assertEquals(-0, x *= (tmp = -1409904262, tmp));
  assertEquals(-0, x /= ((1176483512.8626208)<<x));
  assertEquals(0, x &= ((((1677892713.6240005)^(tmp = 2575724881, tmp))^(tmp = -2935655281.208194, tmp))*(216675668)));
  assertEquals(0, x >>= (tmp = -1296960457, tmp));
  assertEquals(0, x |= x);
  assertEquals(NaN, x /= x);
  assertEquals(0, x <<= (x>>(-3127984289.9112387)));
  assertEquals(0, x %= ((tmp = 190018725.45957255, tmp)<<((x>>>x)/x)));
  assertEquals(0, x /= (1185681972));
  assertEquals(0, x &= ((tmp = -1285574617, tmp)>>x));
  assertEquals(0, x >>>= ((tmp = 2498246277.2054763, tmp)+(((tmp = 924534435, tmp)&x)>>(tmp = 1379755429, tmp))));
  assertEquals(0, x -= x);
  assertEquals(0, x /= (3093439341));
  assertEquals(0, x *= (x>>>x));
  assertEquals(0, x &= (tmp = 551328367, tmp));
  assertEquals(-0, x /= (-3153411714.834353));
  assertEquals(1217585288, x ^= (tmp = -3077382008.637764, tmp));
  assertEquals(-639702017, x |= ((tmp = -640922633, tmp)%(tmp = -879654762, tmp)));
  assertEquals(-1645297680, x <<= (tmp = 1418982820.8182912, tmp));
  assertEquals(-1.4059558868398736, x /= (1170234212.4674253));
  assertEquals(-2650856935.66554, x *= (1885448157));
  assertEquals(1326259953.26931, x *= (((x>>(x|(-496195134.78045774)))+((2029515886)%(tmp = 1148955580, tmp)))/(tmp = -1760016519, tmp)));
  assertEquals(0, x &= (((((-273334205)+(tmp = 797224093.682485, tmp))/x)>>>((((tmp = -887577414, tmp)/x)+x)%(tmp = 720417467, tmp)))^(((x-(tmp = -309071035, tmp))>>(-3123114729.33889))/x)));
  assertEquals(0, x ^= x);
  assertEquals(0, x %= ((tmp = -2243857462, tmp)/((((((2642220700.6673346)&x)*(tmp = 1454878837, tmp))|((-25825087.30002737)%(851535616.3479034)))<<(tmp = -697581582, tmp))%(tmp = 2248990486, tmp))));
  assertEquals(0, x >>= (((x|(((tmp = -220437911, tmp)&((((255690498)*(((2993252642)>>>(tmp = 300426048.0338713, tmp))>>x))&((-364232989)+(x<<(-1824069275))))%(x+(tmp = 2696406059.026349, tmp))))+((tmp = 2911683270, tmp)/(tmp = 2718991915, tmp))))*(x/(((tmp = -982851060.0744538, tmp)^((-2903383954)<<((-85365803.80553412)^x)))%(1489258330.5730634))))>>>x));
  assertEquals(0.7805921633088815, x += (((-1886920875)/(-2417294156.5304217))%(tmp = -1176793645.8923106, tmp)));
  assertEquals(0, x <<= x);
  assertEquals(-2215008905, x -= (2215008905));
  assertEquals(1931542900, x &= (-215923724.72133207));
  assertEquals(907191462, x ^= (-3133954606.357727));
  assertEquals(453595731, x >>>= (((tmp = 2726241550, tmp)/(tmp = -332682163, tmp))*((((tmp = 2500467531, tmp)>>>(((x<<(tmp = -1847200310.4863105, tmp))/x)^x))+x)<<(191688342.22953415))));
  assertEquals(-0.21671182880645923, x /= ((((-1169180683.1316955)%x)>>>(1650525418))^((2198033206.797462)&((-6913973.910871983)%(1758398541.8440342)))));
  assertEquals(-375102237.1603561, x += (tmp = -375102236.9436443, tmp));
  assertEquals(1, x &= (((84374105.89811504)|((tmp = -2480295008.926951, tmp)>>((605043461)>>(tmp = -2495122811, tmp))))>>(-2129266088)));
  assertEquals(1, x |= x);
  assertEquals(0.0000024171579540208214, x /= (((-2600416098)>>(-2076954196))^x));
  assertEquals(0.0000024171579540208214, x %= (tmp = -2632420148.815531, tmp));
  assertEquals(1809220936.0126908, x -= (-1809220936.0126884));
  assertEquals(1682452118.2686126, x += (((2358977542)<<(x/(tmp = -2862107929, tmp)))+(x+(x%((-3101674407)/(((x*((x>>(tmp = 630458691.3736696, tmp))>>>(tmp = -852137742, tmp)))/x)-((-1875892391.1022017)&(tmp = -1027359748.9533749, tmp))))))));
  assertEquals(1682452118, x <<= (((tmp = -80832958.07816291, tmp)>>x)%(x-((x^(x<<(tmp = -156565345, tmp)))|((tmp = -1208807363.727137, tmp)/(tmp = 2614737513.304538, tmp))))));
  assertEquals(6572078, x >>= (-1573364824));
  assertEquals(13144156, x += x);
  assertEquals(1731678184, x ^= ((tmp = 593370804.9985657, tmp)|(-3124896848.53273)));
  assertEquals(845545, x >>>= (tmp = -605637621.2299933, tmp));
  assertEquals(-1383361088, x ^= (tmp = -1383632087, tmp));
  assertEquals(-82545896480031520, x += ((x+(1023183845.7316296))*((((tmp = 576673669, tmp)>>(((-584800080.1625061)/(2388147521.9174623))+((((x>>>(-905032341.5830328))^(tmp = -2170356357, tmp))-x)+((136459319)+(-1799824119.689473)))))|x)&(tmp = -2688743506.0257063, tmp))));
  assertEquals(-895206176, x |= x);
  assertEquals(-0, x %= x);
  assertEquals(1791306023, x ^= ((tmp = -3219480856, tmp)+(tmp = 715819582.0181161, tmp)));
  assertEquals(1791306023, x &= x);
  assertEquals(2725167636753240600, x *= (1521330025));
  assertEquals(-281190679, x |= (tmp = -1422045975.798171, tmp));
  assertEquals(-281190679, x += (x%x));
  assertEquals(-2342097426.906673, x -= (tmp = 2060906747.906673, tmp));
  assertEquals(-4651462701.906673, x -= (2309365275));
  assertEquals(1878, x >>>= (2544974549.345834));
  assertEquals(1964, x += (x&((1067649861)>>(182139255.7513579))));
  assertEquals(2209, x += (x>>(tmp = -1775039165, tmp)));
  assertEquals(0, x -= x);
  assertEquals(-0, x /= (tmp = -1634697185, tmp));
  assertEquals(NaN, x /= x);
  assertEquals(0, x >>>= ((tmp = 3075747652, tmp)&(tmp = 819236484, tmp)));
  assertEquals(0, x /= ((1276203810.476657)%(-2434960500.784484)));
  assertEquals(0, x >>>= (tmp = -503633649, tmp));
  assertEquals(-982731931, x |= (-982731931));
  assertEquals(-1965463862, x += x);
  assertEquals(-0.221469672913716, x %= ((tmp = -1742292120, tmp)/x));
  assertEquals(-0.221469672913716, x %= (-2021391941.1839576));
  assertEquals(0, x <<= (((((tmp = -2802447851, tmp)>>((2534456072.6518855)&x))%(tmp = 2841162496.610816, tmp))<<((89341820)/(2565367990.0552235)))>>(tmp = 2700250984.4830647, tmp)));
  assertEquals(0, x >>= x);
  assertEquals(0, x >>= ((tmp = -636189745, tmp)>>>(x/(((tmp = 2634252476, tmp)%(2026595795))>>(tmp = -2048078394.743723, tmp)))));
  assertEquals(NaN, x %= ((x%((((x%((tmp = -2583207106, tmp)&x))|(190357769))<<(tmp = 595856931.2599536, tmp))%x))*((-2433186614.6715775)<<((2856869562.1088696)^(tmp = 1112328003, tmp)))));
  assertEquals(1621713910, x |= (tmp = 1621713910.0282416, tmp));
  assertEquals(3243427820, x += x);
  assertEquals(0, x *= (x&(x-x)));
  assertEquals(0, x >>>= (((2871235439)<<((x+((tmp = -1319445828.9659343, tmp)+(tmp = 1595655077.959171, tmp)))>>(tmp = -86333903, tmp)))-(x/(2907174373.268768))));
  assertEquals(0, x >>= (-1091774077.2173789));
  assertEquals(NaN, x /= x);
  assertEquals(NaN, x *= (tmp = 1976023677.7015994, tmp));
  assertEquals(NaN, x -= (-3013707698));
  assertEquals(NaN, x += ((x+(((tmp = -3119865782.9691515, tmp)<<(1327383504.0158405))^(((-143382411.7239611)>>>((-2157016781)+(((-335815848)/x)<<(tmp = 1953515427, tmp))))&(-2715729178))))/(413738158.2334299)));
  assertEquals(NaN, x %= x);
  assertEquals(NaN, x += (-845480493));
  assertEquals(-789816013, x |= (tmp = -789816013.129916, tmp));
  assertEquals(0, x ^= x);
  assertEquals(0, x <<= (3032573320));
  assertEquals(47630, x ^= ((1086705488)%((x^(tmp = -1610832418, tmp))>>>(tmp = 1136352558, tmp))));
  assertEquals(47630, x >>= (tmp = 1035320352.4269229, tmp));
  assertEquals(47630, x >>= ((((x^x)<<(x*((((x&((-1657468419)*((tmp = -674435523, tmp)&((tmp = 2992300334, tmp)|x))))*((tmp = -489509378.31950426, tmp)*(tmp = 2276316053, tmp)))>>>x)<<x)))%(tmp = -1209988989, tmp))/(tmp = -2080515253.3541622, tmp)));
  assertEquals(3192518951.8129544, x += (3192471321.8129544));
  assertEquals(648116457.8129544, x %= (-2544402494));
  assertEquals(0, x -= x);
  assertEquals(NaN, x /= x);
  assertEquals(NaN, x /= x);
  assertEquals(0, x <<= x);
  assertEquals(0, x >>= x);
  assertEquals(0, x *= (tmp = 30051865, tmp));
  assertEquals(0, x ^= ((x&(((x&x)>>>(((((((x+(2319551861.0414495))>>>(tmp = -3099624461, tmp))^((((tmp = 1574312763, tmp)|x)>>>((-2723797246)&(tmp = -1993956152, tmp)))|(-1830179045)))|(((((((-2545698704.3662167)>>>x)-(((-79478653)|x)%(x+(x>>((tmp = 2386405508.2180576, tmp)/x)))))>>((((-1947911815.2808042)*((x+(368522081.2884482))-(tmp = 2452991210, tmp)))>>(343556643.1123545))>>((((tmp = 1869261547.537739, tmp)>>(3193214755))|x)&(x*(2027025120)))))<<((-1149196187)>>>(814378291.8374172)))+((((((((-160721403)/(2079201480.2186408))+((x|((((tmp = -299595483.16805863, tmp)>>>((x|((x+x)/(-2359032023.9366207)))<<(tmp = -3095108545, tmp)))>>((tmp = -1547963617.9087071, tmp)*(x>>x)))&((tmp = -1568186648.7499216, tmp)+(((2646528453)^(-2004832723.0506048))>>>(tmp = -3188715603.921877, tmp)))))+(tmp = 1578824724, tmp)))^x)^x)/(tmp = -985331362, tmp))|(tmp = 445135036, tmp))<<(tmp = -73386074.43413758, tmp)))+(((-1674995105.9837937)-(tmp = 1392915573, tmp))>>x)))%(tmp = 1215953864, tmp))&((tmp = -439264643.5238693, tmp)>>>x))+(((tmp = 2311895902, tmp)|(1604405793.6399229))&(tmp = -565192829, tmp))))-x))>>(-2455985321)));
  assertEquals(0, x %= ((1177798817)>>(tmp = 2081394163.5420477, tmp)));
  assertEquals(0, x >>>= ((x^(tmp = -41947528.33954811, tmp))>>(x>>>((tmp = 1367644771, tmp)+x))));
  assertEquals(0, x %= ((x+((tmp = 163275724, tmp)<<((tmp = -514460883.3040788, tmp)+x)))|(tmp = -287112073.2482593, tmp)));
  assertEquals(0, x &= (3067975906));
  assertEquals(201342051, x |= (tmp = 201342051, tmp));
  assertEquals(0, x %= (((((-2580351108.8990865)<<(tmp = 2675329316, tmp))&((1338398946)%((-1548041558)+((x>>(-1568233868.7366815))|((x>>((tmp = -1064582207, tmp)/(-1062237014)))>>(tmp = 854123209, tmp))))))<<(((989032887)*(1842748656))%(tmp = -1566983130, tmp)))-x));
  assertEquals(-0, x /= (tmp = -828519512.617768, tmp));
  assertEquals(0, x &= ((((1449608518)+(-1829731972))*(1828894311))*(((tmp = -1121326205.614264, tmp)^(-2057547855))<<(tmp = -2758835896, tmp))));
  assertEquals(NaN, x %= ((tmp = -2138671333, tmp)%x));
  assertEquals(0, x &= x);
  assertEquals(665568613.0328879, x += (665568613.0328879));
  assertEquals(317, x >>= (2627267349.735873));
  assertEquals(0, x -= x);
  assertEquals(0, x &= (((tmp = 3030611035, tmp)*(((tmp = 476143340.933007, tmp)>>(x-(2238302130.2331467)))|(x|x)))%(tmp = 320526262, tmp)));
  assertEquals(0, x <<= (tmp = 729401206, tmp));
  assertEquals(0, x >>>= (1721412276));
  assertEquals(217629949.3530736, x += ((tmp = 217629949.3530736, tmp)%((-931931100.601475)%(x^(tmp = -2149340123.548764, tmp)))));
  assertEquals(217629949.3530736, x %= (tmp = 2275384959.4243402, tmp));
  assertEquals(0, x >>>= (1112677437.5524077));
  assertEquals(0, x *= (500256656.7476063));
  assertEquals(0, x >>>= x);
  assertEquals(0, x -= x);
  assertEquals(0, x -= x);
  assertEquals(0, x &= (-1076968794));
  assertEquals(0, x /= (tmp = 1774420931.0082943, tmp));
  assertEquals(0, x |= x);
  assertEquals(0, x >>= x);
  assertEquals(0, x %= (-2978890122.943079));
  assertEquals(-0, x /= (tmp = -2954608787, tmp));
  assertEquals(-800048201, x ^= ((tmp = -800048201.7227018, tmp)>>>((-2016227566.1480863)/(tmp = -2263395521, tmp))));
  assertEquals(3333, x >>>= (-2038839052));
  assertEquals(487957736.625432, x += (487954403.625432));
  assertEquals(-1650983426, x |= (2643918270));
  assertEquals(-1861867448, x &= (tmp = -251254199.12813115, tmp));
  assertEquals(-7.934314690172143e-18, x %= ((((x^(-703896560.6519544))>>(tmp = -1853262409, tmp))/(tmp = -1168012152.177894, tmp))/(tmp = 837616075.1097361, tmp)));
  assertEquals(0, x ^= x);
  assertEquals(0, x &= (tmp = -2328150260.5399947, tmp));
  assertEquals(-1954860020, x |= (tmp = 2340107276, tmp));
  assertEquals(-1954860020, x >>= ((tmp = 159177341, tmp)*(x&(-705832619))));
  assertEquals(-1954895727, x -= (x>>>((-1443742544.7183702)^((((tmp = 869581714.0137681, tmp)+x)^((x%(tmp = -1036566362.5189383, tmp))^(x%x)))>>x))));
  assertEquals(1.0241361338078498, x /= (tmp = -1908824093.2692068, tmp));
  assertEquals(16777216, x <<= (x*(((-1925197281)^(tmp = -1392300089.4750946, tmp))|x)));
  assertEquals(-225882765524992, x *= (tmp = -13463662, tmp));
  assertEquals(-1845493760, x |= x);
  assertEquals(-1845493760, x %= (tmp = 3181618519.786825, tmp));
  assertEquals(0, x ^= x);
  assertEquals(0, x <<= x);
  assertEquals(0, x >>>= x);
  assertEquals(NaN, x /= (x>>>x));
  assertEquals(NaN, x %= (((((tmp = -521176477, tmp)>>(((tmp = 370693623, tmp)/(((tmp = -1181033022.4136918, tmp)>>(x|(x*(2601660441))))+(tmp = -1696992780, tmp)))|(x|(-1197454193.198036))))>>>(((2512453418.3855605)+((((((tmp = 799501914, tmp)&(((1788580469.7069902)*(((((1476778529.5109258)<<(tmp = -1873387738.3541565, tmp))-((tmp = -521988584.7945764, tmp)*(-1598785351.3914914)))&(-1899161721.8061454))&((x/x)*(690506460))))>>>((tmp = 2255896398.840741, tmp)>>((tmp = -1331486014.6180065, tmp)+(-1159698058.534132)))))*((1112115365.2633948)&((x>>((x>>(-784426389.4693215))&(-492064338.97227573)))>>x)))^((x-((tmp = 2986028023, tmp)>>(tmp = 2347380320.00517, tmp)))*(tmp = -1463851121, tmp)))*(tmp = -1059437133, tmp))%(x-(tmp = 1238739493.7636225, tmp))))^(2029235174)))*(-1923899530))>>>x));
  assertEquals(0, x >>>= (2848792983.510682));
  assertEquals(0, x >>= (((tmp = 3042817032.705198, tmp)>>>x)&((((tmp = -829389221, tmp)-((2669682285.8576303)+(tmp = 1812236814.3082042, tmp)))^x)%((tmp = -2401726554, tmp)^((tmp = 2464685683, tmp)|(-2685039620.224061))))));
  assertEquals(2069649722, x |= (2069649722.311271));
  assertEquals(NaN, x %= (((((-68757739.39282179)&(-1382816369))/(3122326124))<<(x-(-507995800.3369653)))<<(((-1962768567.343907)+((tmp = 1357057125, tmp)/x))^(tmp = 1997617124, tmp))));
  assertEquals(NaN, x += x);
  assertEquals(0, x >>= (26895919));
  assertEquals(0, x >>>= x);
  assertEquals(0, x %= (tmp = 1092448030, tmp));
  assertEquals(0, x <<= (tmp = -477672441.46258235, tmp));
  assertEquals(0, x /= (2113701907));
  assertEquals(0, x >>>= x);
  assertEquals(NaN, x /= x);
  assertEquals(1341078673, x |= (-2953888623));
  assertEquals(1341078673, x &= x);
  assertEquals(0, x %= x);
  assertEquals(414817852.151006, x -= (-414817852.151006));
  assertEquals(1006632960, x <<= ((((((126465614.8316778)+(x-(2511803375)))+(tmp = 1620717148.352402, tmp))*x)/(tmp = -3013745105.5275207, tmp))-((tmp = -418034061.6865432, tmp)/(-300492911))));
  assertEquals(1055624813, x |= (tmp = 921407085, tmp));
  assertEquals(-3, x |= ((((tmp = 1382397819.7507677, tmp)+(tmp = -111851147.7289567, tmp))+x)/((tmp = 247980405.7238742, tmp)^(tmp = -592156399.8577058, tmp))));
  assertEquals(35161, x &= (((((((-2973570544.725141)*(tmp = -1244715638, tmp))+x)<<(x/((x>>>(-2143371615.073137))/(226072236))))%((x-(tmp = 1971392936, tmp))^(tmp = 2653103658, tmp)))%((tmp = 2828319571.7066674, tmp)>>((1528970502)^((tmp = -55869558, tmp)%x))))>>(889380585.6738582)));
  assertEquals(0, x ^= x);
  assertEquals(0, x *= (2749718750));
  assertEquals(0, x >>>= ((((-1633495402.6252813)*(tmp = 2943656739.1108646, tmp))+(tmp = 977432165, tmp))&((tmp = -2338132019, tmp)*(408176349.8061733))));
  assertEquals(-1778794752, x -= (((tmp = -1391412154.5199084, tmp)-((-3172342474)|x))&(1854366052)));
  assertEquals(-1778794752, x %= (tmp = 2024807296.6901965, tmp));
  assertEquals(-1114410.466337204, x %= ((tmp = -240344444.24487805, tmp)%(-47661164)));
  assertEquals(-0, x %= x);
  assertEquals(0, x >>= (x>>x));
  assertEquals(0, x *= x);
  assertEquals(0, x /= ((-3134902611)|(tmp = -3131158951, tmp)));
  assertEquals(-0, x /= (((tmp = 1430247610.634234, tmp)&x)+((tmp = -2047191110.8623483, tmp)-((((x%((((x/(tmp = -2599234213, tmp))|(tmp = 2650380060, tmp))|x)+x))>>>x)&(-1961373866))<<x))));
  assertEquals(-718394682, x -= ((x|(tmp = 1764417670.8577194, tmp))%(1046022988)));
  assertEquals(3576572614, x >>>= (((tmp = 2480472883.078992, tmp)<<x)>>((2035208402.8039393)&(tmp = 492980449, tmp))));
  assertEquals(434034142, x %= (x&((x>>>(311110449.48751545))|(-243530647))));
  assertEquals(524703439.3065736, x += (((tmp = 1392771723.3065736, tmp)%(x&x))%(tmp = -2199704930, tmp)));
  assertEquals(373686272, x &= (x<<((tmp = 2103372351.9456532, tmp)%(tmp = -1367109519, tmp))));
  assertEquals(373686272, x >>= x);
  assertEquals(-0.12245430020241108, x /= (tmp = -3051638622.5907507, tmp));
  assertEquals(1, x /= x);
  assertEquals(1, x %= (3095983855));
  assertEquals(-1454736871, x ^= (x*(tmp = -1454736872, tmp)));
  assertEquals(-1454736866, x ^= (((724989405.7338341)|(tmp = -2834298786.384371, tmp))>>>(tmp = -2029602148.1758833, tmp)));
  assertEquals(-1454736866, x &= x);
  assertEquals(-197394432, x <<= (tmp = -1562128975, tmp));
  assertEquals(251658240, x <<= (tmp = 2126510950, tmp));
  assertEquals(3295700610.703306, x -= (tmp = -3044042370.703306, tmp));
  assertEquals(-51152917, x |= ((949179883.1784958)|(((tmp = -2046168220, tmp)>>(x/x))/(((835064313)*(tmp = 2197600689, tmp))^(((tmp = 2717104216, tmp)&x)<<(-1402661995.3845913))))));
  assertEquals(-1549204421, x ^= ((((tmp = -481013711, tmp)>>>((tmp = 119589341.80209589, tmp)%(-995489985.2905662)))-(635717011))^(x+(x*x))));
  assertEquals(-1078356672.3999934, x += (470847748.6000067));
  assertEquals(1484987268.4638166, x += (tmp = 2563343940.86381, tmp));
  assertEquals(277020804, x &= (tmp = 2532819117, tmp));
  assertEquals(-2097118208, x <<= (x>>>x));
  assertEquals(-2147483648, x <<= (tmp = 761285045, tmp));
  assertEquals(2147483648, x >>>= x);
  assertEquals(-935909870282997800, x *= ((-2583300643)|x));
  assertEquals(-370753566.54721737, x %= (-1084543510.4524941));
  assertEquals(-177, x >>= (-946264747.6588805));
  assertEquals(-416077682, x ^= (tmp = 416077761, tmp));
  assertEquals(NaN, x %= ((((tmp = 779607408, tmp)*(((tmp = -3007128117, tmp)*(851442866.6153773))+x))&(1283388806))/(-876363553)));
  assertEquals(NaN, x %= (x/(tmp = -1668413939.652408, tmp)));
  assertEquals(-1726405921, x ^= (tmp = -1726405921, tmp));
  assertEquals(-1, x >>= ((3031008213.807012)>>x));
  assertEquals(4294967295, x >>>= ((x>>>x)&(tmp = 2788082290, tmp)));
  assertEquals(8544111670008449000, x *= (tmp = 1989331020.0417833, tmp));
  assertEquals(268435456, x <<= (tmp = 3121736017.2098465, tmp));
  assertEquals(-2.1011176170964474e+26, x -= (((tmp = 1392503299, tmp)*(tmp = 1446108825.1572113, tmp))*(x^(tmp = 372776014.213725, tmp))));
  assertEquals(0, x |= x);
  assertEquals(0, x >>= ((-112413907.70074797)*(-702798603)));
  assertEquals(1829518838, x |= (tmp = -2465448458, tmp));
  assertEquals(57172463, x >>= ((tmp = 2979642955.241792, tmp)%(tmp = -2464398693.291434, tmp)));
  assertEquals(114344926, x += x);
  assertEquals(113279134, x &= (2397742238.6877637));
  assertEquals(54, x >>= (1908522709.6377516));
  assertEquals(-2.966982919573829e-7, x /= (tmp = -182003070, tmp));
  assertEquals(0, x <<= (-1078417156));
  assertEquals(-147831390, x ^= (((-147831390)>>>x)+x));
  assertEquals(0, x -= x);
  assertEquals(-242221450.44696307, x -= (tmp = 242221450.44696307, tmp));
  assertEquals(-484442900, x <<= (((tmp = -2033947265.088614, tmp)&x)/(x^(tmp = -2893953848, tmp))));
  assertEquals(-3227648, x <<= (x<<((tmp = -193993010, tmp)*((983187830)|(3146465242.2783365)))));
  assertEquals(-6455296, x += x);
  assertEquals(-1771542585, x -= (x^(tmp = -1767335879, tmp)));
  assertEquals(-0, x %= x);
  assertEquals(0, x >>>= ((((tmp = -1612864670.4532743, tmp)*(tmp = 786265765.210487, tmp))*((((tmp = -893735877.3250401, tmp)*((x^(tmp = -2804782464.233885, tmp))<<x))&(x-x))^x))<<x));
  assertEquals(0, x -= (x>>>(-1648118674.380736)));
  assertEquals(0, x >>= ((tmp = -2706058813.0028524, tmp)>>(2745047169)));
  assertEquals(0, x += x);
  assertEquals(0, x %= (-898267735.137356));
  assertEquals(0, x >>>= x);
  assertEquals(0, x >>= ((265527509)/((tmp = 2190845136.7048635, tmp)+((x>>x)>>>((x%(x-x))&((((-2080184609.8989801)&((-327231633)>>>((tmp = 864849136, tmp)%(((-524363239)*(((((tmp = 2245852565.3713694, tmp)&(1918365.8978698254))>>>(tmp = -2463081769, tmp))-(((2438244059.471446)|((((-135303645.38470244)*(-861663832.2253196))%(tmp = 1273185196.0261836, tmp))|((2261539338.832875)%((320267076.2363237)+x))))>>(tmp = -2731398821, tmp)))/(tmp = -1947938611, tmp)))^x))))>>(tmp = 833666235, tmp))|x))))));
  assertEquals(-1116704570, x ^= (-1116704570));
  assertEquals(1379561710, x ^= (tmp = -280362968.19654894, tmp));
  assertEquals(-1673822208, x <<= x);
  assertEquals(-1673822208, x |= (x<<(tmp = 1389479193.9038138, tmp)));
  assertEquals(2559712, x >>>= (-2703763734.0354066));
  assertEquals(2593499, x ^= (x>>>((tmp = 148668150.03291285, tmp)^(tmp = -1580360304, tmp))));
  assertEquals(2070393855, x |= (tmp = -2227002907, tmp));
  assertEquals(304197770, x &= (tmp = 2453257354, tmp));
  assertEquals(304197770, x <<= ((-669331453.8814087)-(x^(x^(tmp = 33804899.98928583, tmp)))));
  assertEquals(297068, x >>= x);
  assertEquals(Infinity, x /= (x-x));
  assertEquals(NaN, x %= x);
  assertEquals(0, x ^= x);
  assertEquals(0, x %= ((tmp = 1723087085, tmp)%(2859382131.304421)));
  assertEquals(0, x %= (((tmp = 2935439763, tmp)<<(-3163992768.637094))%(tmp = 67176733, tmp)));
  assertEquals(0, x &= (tmp = 2480771277, tmp));
  assertEquals(0, x >>>= (x+(tmp = -3168690063, tmp)));
  assertEquals(0, x *= ((tmp = -1915275449.1806245, tmp)>>>((tmp = -1644482094.1822858, tmp)/(tmp = -432927173, tmp))));
  assertEquals(0, x += (((2766509428.071809)/(x/((942453848.5423365)/(((tmp = -1284574492, tmp)&((tmp = 760186450.7301528, tmp)-(2464974117.358138)))/((x/(x|(672536969)))*(x>>(-1272232579)))))))>>(x*(-3175565978))));
  assertEquals(-1277710521, x -= (1277710521));
  assertEquals(-1277710521, x >>= (((tmp = -2349135858, tmp)-x)-x));
  assertEquals(-1277710521, x >>= ((tmp = 2135645051, tmp)*(tmp = -2468555366, tmp)));
  assertEquals(-155971, x >>= (-1294859507));
  assertEquals(-0, x %= x);
  assertEquals(0, x >>>= (((861078292.6597499)|(-268063679))-(((((-221864206.9494424)-(-3186868203.2201176))&(tmp = 1287132927, tmp))<<(((tmp = 1964887915, tmp)<<((25908382)^(tmp = -688293519.875164, tmp)))*(2075946055)))&(x-((x>>x)&(1395338223.7954774))))));
  assertEquals(788002218, x -= (-788002218));
  assertEquals(716399906, x &= (-1145868506));
  assertEquals(145776674, x &= (-1661931477.360386));
  assertEquals(145776674, x |= x);
  assertEquals(-0.05255700469257692, x /= (tmp = -2773686873, tmp));
  assertEquals(-660918434, x |= (-660918434.2915542));
  assertEquals(1223537346, x ^= (tmp = -1871274596, tmp));
  assertEquals(305884336, x >>= (x&x));
  assertEquals(-1.1123775647978218e-8, x *= ((tmp = -793393031.4229445, tmp)/((tmp = -503919284, tmp)*(((((tmp = 429810625, tmp)>>>x)-((2091544148.870375)<<(((((x^x)%x)|x)/(-260773261))<<((tmp = -1323834653, tmp)&x))))*((-1231800099.3724015)+x))*((x+((-559726167)^x))>>>((-549148877)<<((((tmp = 1196115201, tmp)/((tmp = -2654658968.390111, tmp)%(tmp = -1044419580, tmp)))*(((((x>>>(733571228))+(2919762692.511447))/(-2718451983.570547))^x)+((2891533060.1804514)^((tmp = -2514488663, tmp)&x))))<<(tmp = -2526139641.6733007, tmp))))))));
  assertEquals(0, x >>>= x);
  assertEquals(0, x *= x);
  assertEquals(0, x |= x);
  assertEquals(3076984066.336236, x -= ((tmp = -3076984066.336236, tmp)+((tmp = -446575828.5155368, tmp)&x)));
  assertEquals(1, x /= x);
  assertEquals(1513281647.839972, x *= (1513281647.839972));
  assertEquals(1251138155, x ^= ((tmp = 2124481052, tmp)&(2431937351.4392214)));
  assertEquals(1, x /= x);
  assertEquals(0, x &= (tmp = 627050040, tmp));
  assertEquals(497153016, x ^= (497153016));
  assertEquals(-1112801283, x |= (tmp = 2752196557, tmp));
  assertEquals(0.5735447276296568, x /= ((((tmp = -500878794, tmp)%(tmp = -2559962372.2930336, tmp))%(2661010102))+(tmp = -1439338297, tmp)));
  assertEquals(1.0244795995097235e-9, x /= (559840067));
  assertEquals(0.43468811912309857, x *= (424301391));
  assertEquals(-1972757928, x ^= (tmp = -1972757928.9227014, tmp));
  assertEquals(-606757265, x ^= (tmp = -2923461577.264596, tmp));
  assertEquals(-37, x >>= (((-2736561559.7474318)%(tmp = -27668972.662741184, tmp))*(2774711606)));
  assertEquals(-1923785671, x += ((-1923785597)+x));
  assertEquals(-3877639176, x += (tmp = -1953853505, tmp));
  assertEquals(-4688259242, x -= ((810620066.4394455)>>(((-1474285107.459875)>>x)/(((((-570672326.4007359)>>(tmp = -3086802075, tmp))%x)>>>(((tmp = 286938819.28193486, tmp)>>>((1712478502)>>(tmp = 3045149117.796816, tmp)))<<(tmp = 750463263.292952, tmp)))&(tmp = 2055350255.5669963, tmp)))));
  assertEquals(-0, x %= x);
  assertEquals(0, x <<= (1037856162.5105649));
  assertEquals(0, x *= x);
  assertEquals(0, x &= (997845077.4917375));
  assertEquals(0, x *= x);
  assertEquals(0, x *= x);
  assertEquals(0, x <<= (((x<<x)&(57691805))>>(786927663)));
  assertEquals(0, x ^= x);
  assertEquals(0, x += x);
  assertEquals(0, x &= (-2131910624.1429484));
  assertEquals(0, x >>>= (-43787814));
  assertEquals(-2415062021, x += (tmp = -2415062021, tmp));
  assertEquals(-4830124042, x += x);
  assertEquals(-186683401, x |= (tmp = 1960135383, tmp));
  assertEquals(NaN, x *= ((tmp = -1674740173.9864025, tmp)%(((((((-432895485.7261934)-x)^x)>>>(((-1627743078.3383338)>>(179992151))<<((tmp = 911484278.0555259, tmp)|(((tmp = -3042492703, tmp)>>(((-663866035.302746)>>(((x-((440661929.50030375)>>>(tmp = 263692082, tmp)))*x)+x))/((1546004407)^(((tmp = 2023662889.1594632, tmp)*(tmp = -2456602312, tmp))+(tmp = 755602286.1810379, tmp)))))%((tmp = -336449961, tmp)|(tmp = 206780145, tmp))))))/(1068005219.1508512))<<(tmp = -474008862.6864624, tmp))/(((((((1518711056.5437899)>>>(tmp = 287418286.63085747, tmp))<<(tmp = 2823048707, tmp))^(((x<<(x^(-1600970311)))&(x>>(((tmp = 157300110.7636031, tmp)*(tmp = -3047000529, tmp))&(1743024951.3535223))))>>x))-(tmp = -2895435807, tmp))*((tmp = -314120704, tmp)&(tmp = 1759205369, tmp)))>>(tmp = 1833555960.046526, tmp)))));
  assertEquals(NaN, x -= (tmp = 694955369, tmp));
  assertEquals(NaN, x *= (x%x));
  assertEquals(0, x |= x);
  assertEquals(0, x ^= x);
  assertEquals(0, x &= x);
  assertEquals(NaN, x /= (x+x));
  assertEquals(NaN, x %= ((tmp = -1595988845, tmp)*((1754043345)>>>(-601631332))));
  assertEquals(0, x >>>= (tmp = 862768754.5445609, tmp));
  assertEquals(NaN, x /= x);
  assertEquals(NaN, x %= x);
  assertEquals(NaN, x *= (tmp = -1774545519, tmp));
  assertEquals(0, x >>>= (tmp = -2492937784, tmp));
  assertEquals(0, x %= ((((x<<(-1657262788.2028513))&((x^(tmp = -671811451, tmp))<<(-2984124996)))^(1455422699.7504625))-((-340550620)>>x)));
  assertEquals(918278025, x ^= ((tmp = -918278027, tmp)^((tmp = 2889422870, tmp)/(tmp = -657306935.7725658, tmp))));
  assertEquals(918278025, x %= (2603186571.0582614));
  assertEquals(107034679.32509923, x %= (tmp = -811243345.6749008, tmp));
  assertEquals(53517339, x >>= (x%((((x*((tmp = -983766424, tmp)^(-1881545357.8686862)))|(tmp = -1429937087, tmp))>>((x<<x)>>((((tmp = -2347470476, tmp)&x)+((x&x)<<(396061331.6476157)))*(tmp = -3136296453.209073, tmp))))>>>(((tmp = 908427836, tmp)|(tmp = 207737064, tmp))|(((1253036041)-(tmp = 2705074182, tmp))+(-431215157.82083917))))));
  assertEquals(53477378, x &= ((((-1128036654.165636)*x)+x)>>(x>>(3080099059))));
  assertEquals(0, x >>= (-590692293));
  assertEquals(0, x %= (-2395850570.9700127));
  assertEquals(0, x *= ((tmp = 1377485272, tmp)&(1129370608)));
  assertEquals(0, x += (x>>>(x%(((((tmp = -1746827236, tmp)+((tmp = -326913490, tmp)&((-58256967)&x)))*(tmp = -1176487022.001651, tmp))>>>(-2089147643))-x))));
  assertEquals(0, x <<= (tmp = 1073298160.2914447, tmp));
  assertEquals(-837811832, x ^= (-837811832));
  assertEquals(102760448, x <<= (tmp = 2833582450.4544373, tmp));
  assertEquals(0, x &= (((((((tmp = 2595641175, tmp)*x)+(tmp = -2049260172.1025927, tmp))%((2986747823)>>(tmp = -2120598518, tmp)))&((tmp = -2742408622, tmp)&x))>>x)*((1043474247.9601482)&(tmp = 1686365779.9885998, tmp))));
  assertEquals(0, x >>= ((tmp = 1717862848, tmp)-(tmp = 1077024446.4160957, tmp)));
  assertEquals(NaN, x /= x);
  assertEquals(NaN, x /= (-1669429787.975099));
  assertEquals(NaN, x -= (-2299895633.4807186));
  assertEquals(138173970, x ^= (138173970.56627905));
  assertEquals(-2084183776, x <<= (3073345316));
  assertEquals(-0, x %= x);
  assertEquals(0, x >>= (-3080556066.068573));
  assertEquals(0, x &= ((tmp = -2587514820, tmp)*(x-((x^(1995672257))*(1125326747.2339358)))));
  assertEquals(NaN, x %= x);
  assertEquals(0, x >>= (tmp = 2139186585, tmp));
  assertEquals(-1904096640, x |= ((-602301360.1919911)*(-1270444810)));
  assertEquals(1073741824, x <<= (tmp = -1069467849, tmp));
  assertEquals(1073741824, x ^= (x-x));
  assertEquals(536870912, x >>>= (-1579466367.160293));
  assertEquals(512, x >>= (972402804.3890183));
  assertEquals(512, x &= (tmp = 2664796831, tmp));
  assertEquals(16777216, x <<= (-2738292561));
  assertEquals(0, x >>>= ((((1397663615.3889246)|(1117420260.6730964))-(-1173734560))<<((tmp = 1007006104.0172879, tmp)<<((tmp = -623002097, tmp)%(tmp = -35829654.379403114, tmp)))));
  assertEquals(1200191544, x ^= (tmp = -3094775752, tmp));
  assertEquals(71, x >>>= x);
  assertEquals(71, x |= x);
  assertEquals(1394763772, x += (1394763701));
  assertEquals(-1.492717171027427, x /= ((x&(tmp = 1243787435, tmp))-(2043911970.26752)));
  assertEquals(-1.1002448961224718e-8, x /= ((((835185744)*(((tmp = 2165818437, tmp)^(tmp = 2567417009.1166553, tmp))/x))/x)/(((63485842.39971793)^(2668248282.597389))/x)));
  assertEquals(0, x <<= (tmp = 1598238578.637568, tmp));
  assertEquals(0, x |= (x&((tmp = -1812945547.5373957, tmp)>>>x)));
  assertEquals(0, x >>>= (x+(-1969679729.7299538)));
  assertEquals(1582033662, x += (tmp = 1582033662, tmp));
  assertEquals(1, x >>>= x);
  assertEquals(-550748739, x += ((tmp = -550748740, tmp)/(x&((2537822642.235506)^((-2167656297)%(tmp = 1161201210, tmp))))));
  assertEquals(-268921, x >>= (tmp = 1916069547.7381654, tmp));
  assertEquals(-0.00021776939364231114, x /= (tmp = 1234888868, tmp));
  assertEquals(0, x <<= (-1036375023));
  assertEquals(0, x &= ((((x/(2398886792.27443))&(x|((-1813057854.1797302)-x)))&(x/(((tmp = 3091133731.4967556, tmp)|(3013139691.823039))<<x)))>>>(2542784636.963599)));
  assertEquals(0, x += ((x*x)/(tmp = 347079383, tmp)));
  assertEquals(788347904, x |= ((1462257124.6374629)*((3180592147.4065146)-(x&(1922244678)))));
  assertEquals(2130672735, x |= (tmp = -2846986145, tmp));
  assertEquals(-1331327970, x ^= ((656251304)-(tmp = 1489152359, tmp)));
  assertEquals(-0.14377179742889856, x %= (((2889747597.813753)-(1730428996))/(((tmp = -1378710998, tmp)&x)|x)));
  assertEquals(-1754612583.143772, x += ((-1754725729)^((-2285838408)>>>(1434074349))));
  assertEquals(-0, x %= x);
  assertEquals(0, x &= (tmp = -1031961332, tmp));
  assertEquals(NaN, x /= x);
  assertEquals(NaN, x /= (3059476325));
  assertEquals(NaN, x *= ((x*((((tmp = 13529540.462185979, tmp)&x)^((x<<(-1312696238.1628869))&(-2029766712.3852897)))>>x))/x));
  assertEquals(1657339940, x ^= ((tmp = -488956817.1491232, tmp)&(tmp = -2352413900.1983714, tmp)));
  assertEquals(-530683621952432200, x *= (tmp = -320202035.2882054, tmp));
  assertEquals(229226258, x ^= ((tmp = -1263410990.026416, tmp)+(((-808046349)&(tmp = -1294442506, tmp))&((tmp = 1147437219, tmp)<<((tmp = -820299900, tmp)-(tmp = -1947748943.3443851, tmp))))));
  assertEquals(7163320, x >>= (-2631307131));
  assertEquals(-68, x |= (((-1271721343)>>x)%x));
  assertEquals(-39956523818.38862, x *= (587595938.505715));
  assertEquals(0, x -= x);
  assertEquals(0, x >>>= ((x^(x+x))<<(tmp = 265212367, tmp)));
  assertEquals(0, x |= (((x>>((tmp = 2294761023, tmp)/(x>>(2125624288))))&((-2125650113)|(tmp = 1014409884, tmp)))%(tmp = -527324757, tmp)));
  assertEquals(0, x >>= ((tmp = 2267075595, tmp)*(-1681569641.8304193)));
  assertEquals(0, x >>>= x);
  assertEquals(0.5738410949707031, x -= ((tmp = -1846572645.573841, tmp)%((((((x^(((-156613905.64173532)/x)<<x))+((x|((2405109060)>>>x))^x))/(570585894.8542807))+(x&(-2544708558)))^((((tmp = -2539082152.490635, tmp)+((((-657138283)/(2204743293))-((tmp = -1422552246.565012, tmp)+x))<<(x-x)))>>(x/(x>>>(tmp = -3027022305.484394, tmp))))<<x))&((-2066650303.3258202)/(tmp = -1666842593.0050385, tmp)))));
  assertEquals(0, x >>>= ((((tmp = 2473451837.613817, tmp)>>((2526373359.1434193)>>(x<<x)))+((tmp = -579162065, tmp)+((tmp = -3115798169.551487, tmp)-(tmp = 933004398.9618305, tmp))))&(tmp = 131167062, tmp)));
  assertEquals(-2067675316, x ^= (-2067675316.6300585));
  assertEquals(543772, x >>>= x);
  assertEquals(-1073741824, x <<= x);
  assertEquals(3221225472, x >>>= ((x*(1478586441.081221))&(tmp = -3050416829.2279186, tmp)));
  assertEquals(0, x ^= x);
  assertEquals(0, x *= x);
  assertEquals(-1017771903.0298333, x -= (1017771903.0298333));
  assertEquals(0.6404112721149928, x /= ((tmp = -144667370, tmp)^(-2849599562)));
  assertEquals(-2410517638773644000, x -= (((tmp = 1759631550, tmp)*x)*((((tmp = -2949481475, tmp)>>>x)*x)|(tmp = -2977983804, tmp))));
  assertEquals(-0, x %= (x+((((tmp = -1307866327.7569134, tmp)<<((x&((tmp = -2380043169.8405933, tmp)|x))>>(472992789.7639668)))|(((((x<<(tmp = -1416427232.7298179, tmp))%(-1404989679.409946))*((x/(tmp = -992416608, tmp))/(tmp = 524646495, tmp)))-(tmp = 734405570, tmp))>>x))/(1079256317.7325506))));
  assertEquals(0, x <<= (tmp = 2459834668, tmp));
  assertEquals(-0, x /= (tmp = -1892164840.5719755, tmp));
  assertEquals(0, x >>= (x|(((1299844244)>>>(((tmp = -2422924469.9824634, tmp)|x)-((((1914590293.2194016)+(-3033885853.8243046))-((tmp = -1720088308, tmp)%x))<<(tmp = 2210817619, tmp))))<<x)));
  assertEquals(0, x <<= (((tmp = 3192483902.841396, tmp)>>>(((x^(2944537154))|(tmp = -1334426566, tmp))*(((((((-2705218389)&x)+(1987320749))+(tmp = -111851605, tmp))|(2894234323))-(265580345))&x)))%(((tmp = 1431928204.6987057, tmp)&(tmp = 914901046, tmp))&(x>>>x))));
  assertEquals(0, x >>>= (tmp = 1941940941, tmp));
  assertEquals(0, x %= (3089014384));
  assertEquals(0, x += ((tmp = 2948646615, tmp)*x));
  assertEquals(-0, x /= (tmp = -1480146895, tmp));
  assertEquals(NaN, x /= x);
  assertEquals(NaN, x %= (-2995257724.158043));
  assertEquals(NaN, x %= (tmp = 2714835455, tmp));
  assertEquals(NaN, x /= (tmp = -311440765.98078775, tmp));
  assertEquals(NaN, x -= (-1600234513.697098));
  assertEquals(0, x <<= x);
  assertEquals(0, x <<= (-1499045929));
  assertEquals(-0, x *= (-2491783113));
  assertEquals(0, x ^= (x%((x>>(((1234398704.3681123)>>>x)%(x+x)))>>(402257223.4673699))));
  assertEquals(-643225204, x ^= (((-55960194.698637486)+((((721411198)-(((tmp = 1308676208.7953796, tmp)%(2242904895))-x))>>((((tmp = 332791012, tmp)&((tmp = -2094787948, tmp)/((x/(2427791092))^(2444944499.6414557))))%(((x+(1253986263.5049214))+(((((3135584075.248715)+((tmp = -2569819028.5414333, tmp)%(440908176.1619092)))>>>(x<<((3061615025)-x)))%x)%(x+((2369612016)*((((tmp = 1173615806, tmp)*(-1910894327))&(2428053015.077821))*(-55668334.70082307))))))<<(tmp = -2129259989.0307562, tmp)))+(1579400360)))%((-3053590451.8996153)>>x)))+(x>>(x%(x^((-1772493876)^x))))));
  assertEquals(413738663060841600, x *= x);
  assertEquals(1581062538.4501781, x %= ((tmp = -1298397672.0300272, tmp)-((2237197923)+(tmp = -1385478459, tmp))));
  assertEquals(755644566.8709538, x %= (tmp = -825417971.5792243, tmp));
  assertEquals(1, x /= x);
  assertEquals(0, x >>>= ((89330582)%(-1012731642.4855506)));
  assertEquals(0, x >>>= x);
  assertEquals(NaN, x %= ((x>>>((x/(tmp = -1848848941.2352903, tmp))>>>(tmp = -71862893, tmp)))&(-2385996598.2015553)));
  assertEquals(NaN, x += (-2292484503.318904));
  assertEquals(NaN, x *= (2961064461));
  assertEquals(NaN, x += (x<<((2076798243.6442)/((tmp = -81541044.75366282, tmp)^((3041366498.551101)+((2126874365)/(tmp = -177610359, tmp)))))));
  assertEquals(NaN, x %= ((x/((x/x)+x))>>>x));
  assertEquals(NaN, x /= x);
  assertEquals(NaN, x += (1171761980.678));
  assertEquals(NaN, x += ((2355675823)<<(-390497521)));
  assertEquals(NaN, x %= x);
  assertEquals(0, x &= (tmp = -658428225.56619, tmp));
  assertEquals(0, x ^= x);
  assertEquals(0, x <<= (1643310725.5713737));
  assertEquals(0, x <<= x);
  assertEquals(0, x <<= (-397005335.3712895));
  assertEquals(0, x >>>= (tmp = -2804713458.166788, tmp));
  assertEquals(0, x <<= (((((((tmp = 1879988501, tmp)%(1528081313.9360204))+(1376936736))*((((x>>>((1736268617.339198)>>>(-2598735297.4277673)))<<((((((((-2742982036)/(231867353.4549594))-(875335564))<<x)|((2241386341.742653)<<((-22024910.828409433)&(x<<x))))*(-756987803.5693252))+x)^(tmp = 1084498737, tmp)))<<(1920373881.8464394))&(2370827451.82652)))&(x^(tmp = -891503574, tmp)))<<x)>>>((-1519588625.2332087)^(483024636.2600144))));
  assertEquals(52193878.40997505, x -= ((tmp = -341753803.40997505, tmp)%(tmp = -96519975, tmp)));
  assertEquals(-1665844168.938803, x -= (1718038047.348778));
  assertEquals(3.6962232549405003e-19, x /= (((((-809583468.5507183)>>>((tmp = 286797763, tmp)%((1579183142.7321532)/(1853824036.001172))))<<x)>>(((x|x)^((tmp = -2641304815, tmp)<<(x<<x)))>>(((((268338128.8300134)&(-1778318362.8509881))*(751081373.346478))<<(((525066612)>>(-1139761212))*(2949167563.299916)))<<x)))+((tmp = 664905121, tmp)*((-2208280205)*(3069462420)))));
  assertEquals(4710721795.110161, x += (((217604832)+((1307891481.781326)-x))+(tmp = 3185225481.328835, tmp)));
  assertEquals(0, x %= x);
  assertEquals(0, x -= (((x>>>(x/(tmp = 46977522.46204984, tmp)))>>(-2466993199.615269))&(tmp = 14524430.287991166, tmp)));
  assertEquals(0, x >>= x);
  assertEquals(0, x /= (tmp = 578120637, tmp));
  assertEquals(-17267104, x -= (((tmp = 1515285919.495792, tmp)+(((tmp = -1364790286.7057304, tmp)+((954599071)>>((897770243.1509961)*x)))^x))>>>(566027942.1732262)));
  assertEquals(-17267104, x &= x);
  assertEquals(189138241, x ^= ((tmp = 1565742675.9503145, tmp)-((tmp = 1737806643, tmp)|((x*(tmp = -1382435297.5955122, tmp))*(-2820516692.153056)))));
  assertEquals(189138241, x %= (x*(tmp = -1670678493, tmp)));
  assertEquals(1693, x %= ((-2328713314)>>>(1623637325)));
  assertEquals(1693, x %= ((-1019394014)*(x|x)));
  assertEquals(3386, x += x);
  assertEquals(9268970871604, x *= (2737439714));
  assertEquals(-4720.120483643183, x /= (tmp = -1963714889, tmp));
  assertEquals(-1, x >>= ((x^(((-2404688047.455056)|((1439590234.6203847)<<(tmp = -2496557617, tmp)))/((x<<((tmp = 1865549512.282249, tmp)/(((360384191.55661833)>>(tmp = -1225297117.344188, tmp))>>>(2703264010.4122753))))*(1521960888.0071676))))%(tmp = 2834001448.0508294, tmp)));
  assertEquals(63, x >>>= (x&(-3079339174.6490154)));
  assertEquals(0, x >>>= (1039770956.6196513));
  assertEquals(0, x >>>= (-1074820214));
  assertEquals(0, x >>>= (x/x));
  assertEquals(0, x >>= ((tmp = -449117604.2811785, tmp)&x));
  assertEquals(-0, x /= (tmp = -118266935.1241343, tmp));
  assertEquals(2226140134, x += (tmp = 2226140134, tmp));
  assertEquals(2068827161, x ^= ((tmp = -1950744808.846384, tmp)>>((2258661151)^((tmp = -1118176421.8650177, tmp)<<(2828634014)))));
  assertEquals(123, x >>>= (-1779624840.0515127));
  assertEquals(0, x >>>= (x|((tmp = -239082904, tmp)<<(tmp = 1404827607, tmp))));
  assertEquals(0, x >>>= x);
  assertEquals(1793109749, x ^= (tmp = -2501857547.710491, tmp));
  assertEquals(855, x >>>= x);
  assertEquals(0, x >>>= (-847289833));
  assertEquals(0, x %= (-2271241045));
  assertEquals(169648072, x ^= (((tmp = 169648072.66759944, tmp)^x)|x));
  assertEquals(176025927479164930, x *= ((tmp = 1111997198.8803885, tmp)<<(tmp = 2913623691, tmp)));
  assertEquals(176025926613281700, x += ((tmp = -865883245, tmp)<<(x+(-2624661650))));
  assertEquals(3406506912, x >>>= ((x|(tmp = 2436016535, tmp))*(((tmp = -1222337225, tmp)<<((1765930268)&x))*(tmp = 1600702938, tmp))));
  assertEquals(1.694694170868292, x %= (x/(-1597121830.794548)));
  assertEquals(0, x >>= (tmp = -2443203089, tmp));
  assertEquals(0, x >>>= (1323174858.2229874));
  assertEquals(0, x &= ((tmp = 846556929.2764134, tmp)|(((1483000635.0020065)|(-3151225553))|(tmp = -229028309, tmp))));
  assertEquals(0, x >>= x);
  assertEquals(0, x >>= ((((((-2677334787)>>>x)>>((tmp = 496077992, tmp)&((((x<<(x*(tmp = 1095163344.2352686, tmp)))+(-952017952))%((x<<((x*x)/(tmp = 2983152477, tmp)))^((tmp = -939521852.1514642, tmp)^(tmp = 143967625.83755958, tmp))))*((tmp = 551827709.8366535, tmp)>>>x))))^((-1552681253.69869)-(-1874069995)))>>>(x>>(x%(tmp = -2554673215, tmp))))|(tmp = -190693051.77664518, tmp)));
  assertEquals(0, x /= (tmp = 427402761.37668264, tmp));
  assertEquals(0, x <<= x);
  assertEquals(0, x |= (x>>>(((((-543326164.0673618)>>>(-2344090136.707964))>>>((((-563350246.6026886)/x)/(1525481037.3332934))&(tmp = -2917983401.88958, tmp)))^(-1094667845.1208413))^x)));
  assertEquals(0, x &= (1080322749.897747));
  assertEquals(0, x %= (tmp = -1572157280, tmp));
  assertEquals(0, x >>>= x);
  assertEquals(0, x %= ((377280936)|x));
  assertEquals(708335912, x -= (tmp = -708335912, tmp));
  assertEquals(2766937, x >>>= x);
  assertEquals(547342779, x += (tmp = 544575842, tmp));
  assertEquals(546273751, x -= ((x>>>(472833385.9560914))|((tmp = -1164832103.9970903, tmp)/(3147856452.1699758))));
  assertEquals(546273751, x &= x);
  assertEquals(0, x ^= x);
  assertEquals(0, x >>>= (tmp = -3181805175, tmp));
  assertEquals(-375546685, x |= (-375546685.08261824));
  assertEquals(1089992785780217200, x *= (tmp = -2902416209, tmp));
  assertEquals(0, x %= x);
  assertEquals(-1854981526, x -= ((x-x)-(-1854981526)));
  assertEquals(-3709963052, x += x);
  assertEquals(-316772482, x %= (tmp = -1696595285, tmp));
  assertEquals(-316772482, x |= x);
  assertEquals(1, x /= x);
  assertEquals(0, x -= x);
  assertEquals(-1418375842, x ^= (-1418375842));
  assertEquals(-2, x >>= x);
  assertEquals(-4, x += x);
  assertEquals(-8388608, x &= (x<<(-350555339.30086184)));
  assertEquals(-16777216, x += x);
  assertEquals(-0, x %= x);
  assertEquals(1083355129, x += (tmp = 1083355129, tmp));
  assertEquals(0, x &= (((tmp = 389729053, tmp)-(tmp = 2944192190.0939536, tmp))/(x-(2081712461.2657034))));
  assertEquals(0, x += x);
  assertEquals(-3, x += ((3147270119.5831738)>>((2455837253.1801558)%((-2100649096)>>(((290236808.01408327)|(x&((2661741230.3235292)|((tmp = 1686874589.4690177, tmp)<<x))))*(x+(tmp = 2327674670, tmp)))))));
  assertEquals(-3, x %= ((x>>(((-2962686431)%x)>>((((2438370783)-(tmp = 2667305770.4839745, tmp))>>>x)>>>x)))<<((x&(tmp = 1428498616, tmp))|((tmp = 2621728539.102742, tmp)/(-204559901)))));
  assertEquals(2, x ^= (x|((((tmp = 1751230118.6865973, tmp)/(-867465831.207304))>>((-808143600.0912395)+(-2882191493.0506454)))^x)));
  assertEquals(2, x %= (-2015954220.2250996));
  assertEquals(0, x >>>= (tmp = 401373999, tmp));
  assertEquals(0, x >>= (2371830723));
  assertEquals(0, x >>>= ((((tmp = 2765919396, tmp)-x)-(530310269.7131671))|(tmp = -615761207.9006102, tmp)));
  assertEquals(-145389011, x ^= (tmp = -145389011, tmp));
  assertEquals(-145389011, x |= x);
  assertEquals(1632929832, x &= (-2518898392));
  assertEquals(4190540017.751949, x += (tmp = 2557610185.751949, tmp));
  assertEquals(4980024282.153588, x += ((1841304364.1177452)%(tmp = 1051820099.7161053, tmp)));
  assertEquals(0, x >>>= (((((1379314342.4233718)>>((-2782805860)^((x%(tmp = 1328845288, tmp))>>>(tmp = 901403219.858733, tmp))))+(x/((tmp = -3078904299, tmp)/x)))/x)|(x|(1399702815))));
  assertEquals(-1820494882, x ^= (tmp = -1820494882.407127, tmp));
  assertEquals(-305870376, x %= (tmp = -757312253, tmp));
  assertEquals(-577530443, x += (x|(tmp = -1958083619.6653333, tmp)));
  assertEquals(333541412591776260, x *= x);
  assertEquals(-949341696, x >>= ((((1550069663)<<((x>>>(tmp = 2406565178.902887, tmp))>>>((1844746612.632984)/((tmp = 2233757197, tmp)*((-1524891464.1028347)>>(tmp = 2498623474.5616803, tmp))))))&x)<<(x&(tmp = -370379833.3884752, tmp))));
  assertEquals(-277202090, x |= ((-762200848.8405354)-(tmp = 1749136282, tmp)));
  assertEquals(0.13704539927239265, x /= (tmp = -2022702633.373563, tmp));
  assertEquals(0, x -= x);
  assertEquals(0, x %= ((132951580.19304836)-((427623236.27544415)-(1212242858))));
  assertEquals(0, x &= ((449148576)&(-1609588210.249217)));
  assertEquals(0, x >>= x);
  assertEquals(0, x -= x);
  assertEquals(-0, x /= (tmp = -1640777090.9694843, tmp));
  assertEquals(0, x &= (((tmp = -1923412153, tmp)>>>((x>>(tmp = 3027958119.0651507, tmp))+(60243350)))>>(tmp = -2610106062, tmp)));
  assertEquals(0, x ^= (((-186998676)/(tmp = 2697937056, tmp))-x));
  assertEquals(-1147950080, x |= ((2425449461)*(tmp = -2525854833, tmp)));
  assertEquals(457688198, x ^= (2698274950.660941));
  assertEquals(8724, x %= ((1174351031)>>>((371599047.36048746)+(3025292010))));
  assertEquals(0, x <<= (tmp = -710011617, tmp));
  assertEquals(0, x >>>= (1693410026));
  assertEquals(1443005362, x ^= ((tmp = -2851961934, tmp)+((((x%x)-(tmp = 547622400, tmp))<<(((tmp = 722396486.5553623, tmp)|x)>>>((((tmp = -542268973.5080287, tmp)<<(tmp = 1347854903.771954, tmp))>>>(tmp = -889664427.7115686, tmp))&((tmp = 1549560114, tmp)*(tmp = 964918035, tmp)))))&(-2422502602.920377))));
  assertEquals(3986573462, x -= (-2543568100));
  assertEquals(7973146924, x += x);
  assertEquals(-1, x >>= (-75987297));
  assertEquals(-12, x += ((2940824338.64834)>>(tmp = 3061467355, tmp)));
  assertEquals(-3.8229398525977614e-8, x /= (313894554));
  assertEquals(-2.890709270374084e-17, x /= (tmp = 1322491989, tmp));
  assertEquals(0, x |= (x-x));
  assertEquals(0, x >>>= (tmp = -1205300664, tmp));
  assertEquals(-0, x /= (((2869505187.6914144)>>(tmp = 1541407065, tmp))/(((-571132581)>>>(x>>x))/((x^(170373762.8793683))>>>((((tmp = -363073421.05897164, tmp)|(((tmp = -1591421637, tmp)>>(1095719702.8838692))&(636687681.9145031)))^x)^(x|x))))));
  assertEquals(-1487828433, x ^= (-1487828433.3462324));
  assertEquals(-0, x %= x);
  assertEquals(1716342498, x -= ((tmp = 2578624798, tmp)^x));
  assertEquals(1636, x >>= ((264194540)>>>(-801900756)));
  assertEquals(0, x >>>= ((tmp = 2502688876, tmp)+((x<<(x|((-628272226.0338528)|((x<<(-2083074091))>>>(tmp = 1692123246.8418589, tmp)))))>>(1594759826.990993))));
  assertEquals(0, x <<= (tmp = -904399643, tmp));
  assertEquals(NaN, x /= ((x^(x-x))%((tmp = 1744962024.4882128, tmp)%x)));
  assertEquals(NaN, x /= (-1013142883.1845908));
  assertEquals(NaN, x /= ((tmp = 793633198, tmp)^(-2993598490.8659954)));
  assertEquals(0, x &= (x>>((tmp = 1200937851, tmp)<<(((tmp = -2807378465, tmp)&(tmp = -143778237, tmp))|(tmp = -1200772223, tmp)))));
  assertEquals(0, x <<= x);
  assertEquals(88144, x |= (((((tmp = 3002723937.8560686, tmp)*(tmp = -3171720774.2612267, tmp))%(((tmp = -2586705978.7271833, tmp)%((x+(-1553704278))&(2405085526.501994)))>>((-240842053)>>>(((((tmp = -1886367228.4794896, tmp)>>>x)^(tmp = 2604098316, tmp))^(tmp = 1362808529, tmp))<<((tmp = -1062263918, tmp)|((-172718753)%(tmp = -1910172365.4882073, tmp)))))))^((1444153362)>>((x&((-1205465523.2604182)^(tmp = -2062463383, tmp)))>>(tmp = 956712476, tmp))))>>((((-1004215312)^((((-1707378612.5424936)^(tmp = 2372161553, tmp))/((tmp = 1802586581, tmp)*((2082257.1896460056)&((tmp = -1270773477, tmp)^(tmp = 942517360.3447798, tmp)))))+x))%((((666494127)^(x^x))>>>(tmp = -2592829775, tmp))+((-1601528223)+((x+(tmp = -2417034771.7409983, tmp))>>>((tmp = -730673817, tmp)*x)))))>>x)));
  assertEquals(-2603179111.7557006, x -= ((2603267255.755627)+(x/(1200979191.2823262))));
  assertEquals(1691788185, x >>= (tmp = 3088840032, tmp));
  assertEquals(-168382533, x |= (tmp = -780750941.4590135, tmp));
  assertEquals(-168382533, x >>= (60741120.48285198));
  assertEquals(-134287365, x |= (x*(tmp = 834637940.7151251, tmp)));
  assertEquals(-1481917089, x -= (tmp = 1347629724, tmp));
  assertEquals(1, x >>>= x);
  assertEquals(262144, x <<= (2680216914));
  assertEquals(1075132032, x ^= (x-((tmp = 3220359552.3398685, tmp)^(((-434474746.6039338)|((((((((tmp = 1945689314.9683735, tmp)>>(1300022273))>>>(333705550))&x)%(588357521))-(x+(x^(((tmp = -134560382, tmp)+x)-((((994246147.7195556)-(-1506599689.7383268))%(x<<x))>>((1256426985.5269494)+(tmp = 1860295952.8232574, tmp)))))))^(((tmp = 917333220.2226384, tmp)>>x)>>>(tmp = 865898066, tmp)))%((x|(x%((tmp = -2660580370, tmp)&(tmp = 2966426022, tmp))))*x)))/(((tmp = 682585452, tmp)&(-3219368609))+((tmp = -1330253964, tmp)+((x&(2857161427))/x)))))));
  assertEquals(274944, x &= ((2606953028.1319966)-(-1707165702)));
  assertEquals(266752, x &= ((x<<((x+(x+(x^(-1570175484))))^x))^(x+(x<<(tmp = 90330700.84649956, tmp)))));
  assertEquals(266752, x &= ((((x*(tmp = 2033225408, tmp))-(x-((tmp = 1507658653, tmp)/(-3016036094))))>>>((1497480588)>>(2784070758)))|(tmp = -3025904401.93921, tmp)));
  assertEquals(-1680442631, x |= ((x/(445284843))|((tmp = 2614520057.2723284, tmp)<<x)));
  assertEquals(40851947, x >>>= (tmp = -1577031386.938616, tmp));
  assertEquals(2493, x >>= ((3044630989.3662357)-(-2670572992.8580284)));
  assertEquals(-0.0000017317105653562252, x /= (-1439617017.9207587));
  assertEquals(0, x &= (2359806567));
  assertEquals(623768541, x ^= (623768541));
  assertEquals(1028567149.0716183, x += (((tmp = 1307794561, tmp)%(x>>x))-(-404798608.0716183)));
  assertEquals(-1.2971762489811298, x /= (tmp = -792927830.6471529, tmp));
  assertEquals(-1.2971762489811298, x %= ((-2426421701.2490773)/(-689566815.3393874)));
  assertEquals(-2147483648, x <<= x);
  assertEquals(-2147483648, x &= (tmp = -869991477, tmp));
  assertEquals(-268435456, x >>= (1383186659));
  assertEquals(0, x -= x);
  assertEquals(-2009742037, x |= (-2009742037.5389993));
  assertEquals(-1386630820, x ^= (627864695));
  assertEquals(-1033479103975173600, x *= (tmp = 745316697.9046186, tmp));
  assertEquals(-1628048487, x |= (2662654361));
  assertEquals(325551, x >>>= (340874477));
  assertEquals(-1235730537, x ^= (tmp = 3059533880.0725217, tmp));
  assertEquals(-1235730537, x %= (2247137328));
  assertEquals(-220200960, x <<= ((x>>x)-x));
  assertEquals(0, x <<= ((tmp = 337220439.90653336, tmp)|(tmp = 2901619168.375105, tmp)));
  assertEquals(0, x >>>= ((-2114406183)/x));
  assertEquals(0, x %= ((1425828626.3896675)/x));
  assertEquals(0, x >>>= ((3213757494)>>>(2595550834.3436537)));
  assertEquals(0, x <<= x);
  assertEquals(-0, x /= ((1544519069.5634403)/((tmp = -1332146306, tmp)&(-762835430.0022461))));
  assertEquals(0, x ^= x);
  assertEquals(0, x >>= (x|((((x*((-786272700)+x))<<x)+((tmp = -1868484904, tmp)-(tmp = -1692200376, tmp)))+(-1010450257.6674457))));
  assertEquals(0, x -= x);
  assertEquals(0, x ^= (x>>>(706010741)));
  assertEquals(-964928697, x |= (-964928697));
  assertEquals(1, x /= x);
  assertEquals(0, x >>= ((((tmp = 1778003555.3780043, tmp)>>(x%((tmp = -766158535, tmp)^((-2681449292.8257303)%((x-(x|(tmp = 1966478387.2443752, tmp)))^(((tmp = -1848398085, tmp)&x)>>>(tmp = -2860470842, tmp)))))))%(tmp = 2315077030, tmp))^x));
  assertEquals(0, x ^= x);
  assertEquals(-288007757, x ^= ((tmp = 183607156.1803962, tmp)-(tmp = 471614914, tmp)));
  assertEquals(-270573581, x |= (tmp = -849475741.9424644, tmp));
  assertEquals(-2129929, x |= (((((1942852445)&(tmp = 1280372312, tmp))*(x*(tmp = -1601900291, tmp)))^((509080002.81080174)-(tmp = 2699498226.9164257, tmp)))>>(((-335361221)>>(tmp = 843134832, tmp))%(-35532542))));
  assertEquals(-232622355, x ^= ((-3060885134.5375547)-(((tmp = 1965966723, tmp)-((tmp = 1248630129.6970558, tmp)<<(tmp = 1859637857.5027392, tmp)))*x)));
  assertEquals(-52149658093200070, x *= (224181627.31264615));
  assertEquals(-697122968, x ^= (x-(x+(tmp = 2747211186.407712, tmp))));
  assertEquals(-2146269688, x &= ((tmp = -1466710519, tmp)^(x/(1419998975))));
  assertEquals(-536567422, x >>= (((((tmp = -1760701688.999274, tmp)>>(-1821976334))/(((tmp = -1660849531, tmp)>>>x)-((x+((tmp = -2489545009.4327965, tmp)>>>((tmp = -267360771.39148235, tmp)^x)))*(((-1453528661)%x)>>>(((243967010.3118453)/((((((2977476024)>>>((-1630798246)<<x))&(591563895.2506002))*(((2668543723.9720144)>>>x)|(1600638279)))^x)>>(x<<(tmp = -152589389, tmp))))>>>(x|(2821305924.9225664)))))))+(618968002.8307843))%(tmp = -1005408074.368274, tmp)));
  assertEquals(40962, x &= (114403906));
  assertEquals(19741977727890, x *= ((-2367133915.963945)>>>(-3119344126)));
  assertEquals(1313341440, x <<= x);
  assertEquals(626, x >>>= ((((-333992843)%(tmp = -2742280618.6046286, tmp))>>>x)|x));
  assertEquals(0, x <<= (2598188575));
  assertEquals(NaN, x %= x);
  assertEquals(NaN, x %= x);
  assertEquals(0, x ^= (x%((2507288229.3233204)&(tmp = -1714553169.9276752, tmp))));
  assertEquals(0, x /= ((633436914.3859445)>>>(tmp = 1579804050.6442273, tmp)));
  assertEquals(0, x *= ((tmp = 1172218326, tmp)<<((tmp = -2491306095.8456626, tmp)*(((tmp = 1305371897.9753594, tmp)>>((x^(((3077992060)*x)<<(492815553.904796)))>>((652151523)|x)))%x))));
  assertEquals(0, x <<= x);
  assertEquals(0, x %= (1118131711));
  assertEquals(0, x &= ((tmp = 2734673884, tmp)|(x-((tmp = 2694578672.8975897, tmp)*(((x>>(2350811280.974167))*(1052548515))&(x^(x*(tmp = -1336287059.0982835, tmp))))))));
  assertEquals(-2632782867.1256156, x += ((tmp = -2743992725.1256156, tmp)+(tmp = 111209858, tmp)));
  assertEquals(-0, x %= x);
  assertEquals(0, x >>>= (((tmp = -2050519887, tmp)^(106865302.74529803))>>(1642851915.2909596)));
  assertEquals(-171964826, x |= (tmp = -171964826.6087358, tmp));
  assertEquals(-2.113405951193522, x /= (tmp = 81368572.80206144, tmp));
  assertEquals(3, x >>>= x);
  assertEquals(0, x %= x);
  assertEquals(-1717345907.837667, x += (-1717345907.837667));
  assertEquals(-100964883, x |= (tmp = -109574931.80629134, tmp));
  assertEquals(-33849857, x |= (-974111718.2433801));
  assertEquals(1, x >>>= (tmp = -2556222849.005595, tmp));
  assertEquals(1, x /= x);
  assertEquals(0, x >>>= (-1796630999.4739401));
  assertEquals(0, x >>>= x);
  assertEquals(2031695758, x += (((x/(((tmp = -2364918403, tmp)%(x^((tmp = 277767803.6375599, tmp)>>((((tmp = 540036080, tmp)/(x|(2665298931)))/(x|((x>>(-2035456216.6165116))<<(2143184420.5651584))))^x))))&(tmp = 927798419.8784283, tmp)))-(-2031695758))>>>x));
  assertEquals(2031695758, x |= x);
  assertEquals(2031695758, x <<= (((x>>(x%x))|(tmp = -1164531232.7384055, tmp))*x));
  assertEquals(124004, x >>>= x);
  assertEquals(529846352, x += ((529722348)%((2417645298.865121)|(x>>(x>>>(x+x))))));
  assertEquals(60067920, x &= (((tmp = -3166008541.8486233, tmp)-x)|(x%x)));
  assertEquals(1415594240755200, x *= ((-2786707452.873729)>>(((tmp = -2369315809, tmp)*((1559868465)|(1011218835.1735028)))>>>x)));
  assertEquals(1415595182259140, x += (941503939.9023957));
  assertEquals(0, x <<= ((tmp = 2887184784.265529, tmp)/(-2575891671.0881453)));
  assertEquals(0, x &= ((tmp = -1546339583, tmp)>>>(tmp = -587433830, tmp)));
  assertEquals(0, x *= (((tmp = 1356991166.5990682, tmp)%(tmp = -284401292, tmp))*(1869973719.9757812)));
  assertEquals(NaN, x %= x);
  assertEquals(0, x ^= (((tmp = 92575404.43720293, tmp)>>>(263475358.17717505))%x));
  assertEquals(0, x <<= (((561514358)*(tmp = -439584969, tmp))%((((-3005411368.7172136)+x)|(-2230472917))&x)));
  assertEquals(0, x >>= ((x>>>x)-((x-(1630649280.510933))+x)));
  assertEquals(0, x >>= (tmp = -1772403084.7012017, tmp));
  assertEquals(0, x *= x);
  assertEquals(0, x += x);
  assertEquals(0, x &= x);
  assertEquals(0, x >>= (tmp = 1622680387, tmp));
  assertEquals(1033887633558225200, x -= ((-510616337)*(tmp = 2024783695, tmp)));
  assertEquals(-2.8073538539158063e+27, x *= (tmp = -2715337492, tmp));
  assertEquals(-2.8073538539158063e+27, x -= ((tmp = -1664804757, tmp)&((tmp = -226616419, tmp)>>>(1006711498))));
  assertEquals(1894539615, x |= (tmp = -2400427681.1831083, tmp));
  assertEquals(7400545, x >>= (774629608.4463601));
  assertEquals(456756268, x += (449355723));
  assertEquals(285771784, x &= (-1316427366));
  assertEquals(17, x >>= ((tmp = -220509931.20787525, tmp)*(((tmp = 2518859292, tmp)+(-1477543005.1586645))>>(tmp = 3172820250.687789, tmp))));
  assertEquals(85924262443, x *= (x*((tmp = -2856669745.965829, tmp)&(((tmp = 401420695, tmp)^(tmp = 2355371132, tmp))|(tmp = 590645330.021911, tmp)))));
  assertEquals(1703875715, x ^= ((-2576394029.7843904)-x));
  assertEquals(1703875715, x %= (tmp = 2234144310, tmp));
  assertEquals(271405807, x ^= (1973569132));
  assertEquals(1060178, x >>>= (tmp = -84823096, tmp));
  assertEquals(8, x >>>= (tmp = 2246120561.905554, tmp));
  assertEquals(-2846791089, x += (-2846791097));
  assertEquals(104933962, x &= (x-(-2969030955.99584)));
  assertEquals(489215611.96215343, x -= (-384281649.96215343));
  assertEquals(489215611, x |= x);
  assertEquals(1186191360, x <<= ((tmp = 774407142.993727, tmp)%x));
  assertEquals(1186191360, x %= (1555004022));
  assertEquals(-1697134080, x ^= (tmp = -597421568, tmp));
  assertEquals(-1102053376, x <<= ((-927370769.4059179)^((tmp = 1093490918, tmp)>>(((-2522227493.3821955)%x)+(-2657319903)))));
  assertEquals(1086450058, x ^= (-23991926.187098265));
  assertEquals(1086450058, x |= x);
  assertEquals(-1.6554590588410778, x /= (x|(x<<(x+x))));
  assertEquals(67108863, x >>>= ((-926530233)+x));
  assertEquals(494553310, x ^= (tmp = 512079649, tmp));
  assertEquals(207751168, x &= (2892146720.6261826));
  assertEquals(207751168, x &= x);
  assertEquals(207751168, x |= x);
  assertEquals(6340, x >>>= (((((x<<(x-((-2819638321)*((x<<x)+x))))>>x)+(tmp = 2016170261, tmp))+(tmp = 2755496043.772017, tmp))+(-841368625.1402085)));
  assertEquals(6340, x ^= ((x/(tmp = -192734784, tmp))>>>(((-140306239)&x)-x)));
  assertEquals(1, x /= x);
  assertEquals(0, x >>= x);
  assertEquals(26786600, x ^= (tmp = 26786600, tmp));
  assertEquals(-0.014657576899542954, x /= ((-1454855938.0338)+(-372635753.3681567)));
  assertEquals(0, x &= ((tmp = 2480635933, tmp)&(-2986584704.9165974)));
  assertEquals(-2108639122, x += ((tmp = 2108639123.8683565, tmp)^((-881296055)/(((x<<(2026200582))|(tmp = -862495245.138771, tmp))-(-1111596494.892467)))));
  assertEquals(1893466112, x <<= (tmp = 607974481, tmp));
  assertEquals(1893466112, x |= x);
  assertEquals(1133122783.997418, x += ((tmp = -760343332, tmp)-((x-(tmp = -878561823.4218843, tmp))/(tmp = -693454632.596637, tmp))));
  assertEquals(8, x >>>= (tmp = 700339003.3919828, tmp));
  assertEquals(4.605305035175536e-9, x /= (1737127060.8343256));
  assertEquals(4.605305035175536e-9, x -= ((x%(897221779))>>>x));
  assertEquals(-1864423625.5704088, x += (tmp = -1864423625.5704088, tmp));
  assertEquals(1132240092, x <<= (1304417186.1193643));
  assertEquals(-2088985380, x ^= (x<<x));
  assertEquals(-4, x >>= ((tmp = 1959823884.0935726, tmp)%(-1679792398.569136)));
  assertEquals(-268435456, x <<= ((tmp = 2586838136, tmp)|((tmp = -481716750.718518, tmp)>>>((1485826674.882607)/(tmp = -2826294011, tmp)))));
  assertEquals(-32768, x >>= (2060648973));
  assertEquals(1, x /= x);
  assertEquals(-2838976297, x -= (tmp = 2838976298, tmp));
  assertEquals(-1382985298, x <<= ((tmp = -2104305023, tmp)&x));
  assertEquals(10, x >>>= (x+x));
  assertEquals(10, x -= (x>>>(361588901.70779836)));
  assertEquals(854603510, x -= (-854603500));
  assertEquals(-557842432, x <<= (tmp = 1212985813.6094751, tmp));
  assertEquals(-459390188241943040, x *= (tmp = 823512450.6304014, tmp));
  assertEquals(-232800033621957060, x /= ((((((686635689)/(tmp = 2013252543, tmp))*(tmp = -1591617746.8678951, tmp))|(((tmp = -1777454093.5611362, tmp)>>>((tmp = 2680809394, tmp)^(((x>>((((((tmp = -265022244, tmp)%((tmp = -3075004537, tmp)>>(((((1427784269.5686688)^((tmp = -1095171528.911587, tmp)^(-942424985.7979553)))>>(-1279441481.1987405))*((2493620394)>>(-2769016043)))/(x&((tmp = 2059033657, tmp)%(((tmp = 1948606940.1488457, tmp)-(tmp = -2645984114.13219, tmp))^x))))))^x)^x)%(x%((((tmp = 3209433446.4551353, tmp)%(tmp = 1364430104.0424738, tmp))/(tmp = -2103044578.349498, tmp))+(tmp = -2613222750, tmp))))*(2099218034)))&(((tmp = -378500985.49700975, tmp)>>(((x+x)|(x%(((-1841907486)<<(-1220613546.194021))<<(tmp = -1260884176, tmp))))^(tmp = 1858784116, tmp)))>>>((x%x)%((x>>>(tmp = -2540799113.7667685, tmp))|x))))/((((tmp = 642072894.6455215, tmp)-(-324951103.6679399))*(tmp = 1424524615, tmp))+((x<<(tmp = -904578863.5945344, tmp))*(tmp = 49233475.435349464, tmp))))))<<(tmp = 1680210257, tmp)))+((tmp = -1516431503, tmp)>>>(-1105406695.3068116)))/(-275019361.6764543)));
  assertEquals(192359387.42913792, x /= (-1210234846));
  assertEquals(192359387.42913792, x %= (-2920206625.0154076));
  assertEquals(192359387.42913803, x -= (((((((tmp = -1263203016.3258834, tmp)-(2432034005.6011124))&x)<<(1479434294))>>((tmp = -1695856315.523002, tmp)>>>(tmp = 557391345, tmp)))/(tmp = -1280240246.2501266, tmp))%((tmp = -2196489823.034029, tmp)>>(((x&((912221637.1101809)+((tmp = -3003677979.652423, tmp)>>(tmp = -716129460.1668484, tmp))))-((x+(x-(-2780610859)))>>>(-2445608016)))<<((x*(x+(x+(((-2124412727.9007604)%(tmp = -593539041.5539455, tmp))&(tmp = 2404054468.768749, tmp)))))%(x>>(tmp = -2913066344.404591, tmp)))))));
  assertEquals(11740, x >>= (688848398.7228824));
  assertEquals(11740, x >>= ((1545765912)*(307650529.9764147)));
  assertEquals(23480, x += x);
  assertEquals(0, x >>>= ((tmp = 1313078391, tmp)|x));
  assertEquals(1726251264, x -= ((1939413887)<<(1004888744.2840619)));
  assertEquals(765324793.5278986, x %= (960926470.4721014));
  assertEquals(747387, x >>= ((2483010044)-(tmp = -413698190, tmp)));
  assertEquals(1, x /= x);
  assertEquals(3016811624, x *= (3016811624));
  assertEquals(17408, x &= (((tmp = -991624868, tmp)<<(((63107932)/(tmp = 2659939199, tmp))|(tmp = -1968768911.3575773, tmp)))>>(((-2876822038.9910746)|(tmp = 2550230179.243425, tmp))<<((x*(x<<((x<<((tmp = -1627718523.616604, tmp)|((2154120561.254636)-(x%(x<<(1484563622.1791654))))))<<((((x^(tmp = 3016524169, tmp))<<(((x+(tmp = 1887816698.2455955, tmp))+x)-x))-(-3023329069))-x))))+x))));
  assertEquals(0, x <<= (((1247441062.177967)/(-1717276234))+x));
  assertEquals(0, x |= ((x%((-1648299429.4520087)>>(-137511052)))>>(tmp = 221301016.4926411, tmp)));
  assertEquals(0, x /= ((-2598501544.913707)>>>(-2177037696)));
  assertEquals(NaN, x %= (x>>x));
  assertEquals(0, x &= (tmp = 1852419158, tmp));
  assertEquals(-829029120, x |= (((2122339180)*((((((tmp = 768748914, tmp)<<((1008490427)&((1937367899.957056)-(((635094486)>>(((tmp = -795046025, tmp)*(2665104134.4455256))^(tmp = 706594584.2462804, tmp)))/(504397522)))))/(-556057788))>>((x/(tmp = -2732280594, tmp))-x))+(-1989667473))+(tmp = 2766802447.789895, tmp)))<<(((tmp = -2969169096, tmp)-x)+(tmp = 2093593159.0942125, tmp))));
  assertEquals(0.6451933462602606, x /= ((-1284931292)<<(x<<(tmp = 1294716764, tmp))));
  assertEquals(1515416866.520901, x *= (2348779440));
  assertEquals(-1620606242886682600, x *= ((-993898625.5357854)&(((tmp = -571100481, tmp)/x)*((2428590177.311031)%(tmp = -2671379453, tmp)))));
  assertEquals(-1137472828, x %= (tmp = -1195183004, tmp));
  assertEquals(-3096634005473250000, x *= (tmp = 2722380640, tmp));
  assertEquals(-3096634003996758500, x -= (-1476491033.833419));
  assertEquals(-3096634000805538000, x += (3191220521.978341));
  assertEquals(-3096634000805468000, x += ((((tmp = -3024976741, tmp)&(952616360))|((x*(-1547952311))+(x*x)))>>>(tmp = 981373323, tmp)));
  assertEquals(-3096633998655594000, x += (2149873927));
  assertEquals(-118812224101.54297, x %= (((2641881276.9898443)*(((502159480)^x)<<x))%((tmp = -2840045365.547772, tmp)*(((((-2297661528)>>>(x>>(-229103883.94961858)))&(((-1285047374.6746495)<<((-360045084)>>>((x-(tmp = -956123411.1260898, tmp))%x)))>>((tmp = -2375660287.5213504, tmp)+((((tmp = -2753478891, tmp)>>>(((tmp = 101438098, tmp)>>(((tmp = -2736502951, tmp)<<((tmp = -3084561882.368902, tmp)&(tmp = 1491700884, tmp)))|x))&(tmp = 1627412882.6404104, tmp)))>>>(tmp = 1039002116.6784904, tmp))<<((tmp = -2840130800, tmp)-(tmp = -740035567, tmp))))))&(tmp = -416316142, tmp))>>x))));
  assertEquals(86, x >>>= (tmp = -293489896.5572462, tmp));
  assertEquals(172, x += (x%((((-2635082487.364155)|((-2361650420.634912)&(-2147095650.7451198)))<<((tmp = 2258905145.9231243, tmp)%((((tmp = -1365987098.5130103, tmp)*(((((((932437391)/x)/(289270413.0780891))%(x-x))+((((2194986374.917528)>>(((((tmp = -1553805025, tmp)|x)^(((x>>(-564400586.0780811))^(tmp = 1738428582.0238137, tmp))>>(tmp = 1717774140, tmp)))&(tmp = -2789427438, tmp))%(((tmp = -1386118057, tmp)*(-2333221237.7915535))*(x>>>(((((41346648.46438944)&x)%(-478973697.6792319))|(tmp = 2108106738, tmp))/x)))))-(tmp = -133437701.64136505, tmp))>>>x))+(tmp = -1567210003, tmp))*(x+((x&x)-(2942851671)))))>>>(tmp = -446377136, tmp))*((((((tmp = 1597203255, tmp)>>>(619157171))|(-2766246629.005985))>>((tmp = 3130227370, tmp)%x))*(tmp = 2072227901.6101904, tmp))|((tmp = 1369019520, tmp)^(759659487))))))>>>x)));
  assertEquals(1996475731, x ^= ((1456327892.2281098)|(1728022827)));
  assertEquals(0, x %= x);
  assertEquals(0, x &= (1323847974));
  assertEquals(3076829073.8848357, x += (3076829073.8848357));
  assertEquals(9569842648396755000, x *= (3110293883.2782717));
  assertEquals(9569842646260304000, x -= (2136450372.9038036));
  assertEquals(9.158188827418242e+37, x *= x);
  assertEquals(0, x <<= ((x&(tmp = -2241179286, tmp))+((tmp = 2553144081, tmp)&((tmp = -1914709694, tmp)^(tmp = -1469651409.0651562, tmp)))));
  assertEquals(0, x <<= x);
  assertEquals(0, x /= (2177840666.276347));
  assertEquals(0, x %= (-690827104));
  assertEquals(0, x >>>= x);
  assertEquals(0, x ^= x);
  assertEquals(-0, x /= (tmp = -803415280, tmp));
  assertEquals(-2355576914.316743, x += (-2355576914.316743));
  assertEquals(-833671722514674000, x *= ((3053388806.692315)-(tmp = 2699474775.081724, tmp)));
  assertEquals(1, x /= x);
  assertEquals(1898147684, x += ((tmp = 1898147683, tmp)|(x<<x)));
  assertEquals(2.192324660388075, x %= ((tmp = 2630187518, tmp)/((2868794982.790862)|(490860748))));
  assertEquals(0, x >>>= ((2751021779)/(-952522559)));
  assertEquals(321040461, x ^= ((321040461.153594)-x));
  assertEquals(-2.3814602031636922, x /= ((tmp = -170472190, tmp)|x));
  assertEquals(-1, x >>= (2200125174.177402));
  assertEquals(-2964432647.9379396, x += (-2964432646.9379396));
  assertEquals(-370116502.93793964, x %= (tmp = -518863229, tmp));
  assertEquals(777927355.2283959, x -= (-1148043858.1663356));
  assertEquals(0, x *= ((tmp = 1134913539, tmp)&(((x>>>((tmp = -989822787, tmp)>>>x))%x)&(tmp = 1078636160.7313156, tmp))));
  assertEquals(-1089245637, x ^= (3205721659.3548856));
  assertEquals(-1192493056, x <<= (-1173291054));
  assertEquals(78013832, x += ((tmp = 2462999944, tmp)+x));
  assertEquals(0, x %= x);
  assertEquals(0, x >>>= (1794908927.7409873));
  assertEquals(1708338504, x += ((-2586628792.3484306)<<x));
  assertEquals(12, x >>= (-545794789.3827574));
  assertEquals(0, x &= ((2753207225)<<(((-1776581207.557251)+((tmp = -2414140402, tmp)*x))+(x<<(x|(tmp = 772358560.3022032, tmp))))));
  assertEquals(0, x <<= ((tmp = -2755724712.152605, tmp)/((x>>(-732875466))&x)));
  assertEquals(NaN, x *= (((tmp = 2617815318.1134562, tmp)/x)%(x|((((((-851659337.194871)<<(tmp = 2072294700, tmp))%((x+(2193880878.5566335))^((tmp = 3005338026, tmp)-(2947963290))))/x)/(x+(2091745239.4210382)))-(x>>x)))));
  assertEquals(NaN, x /= (tmp = -427684595.0278094, tmp));
  assertEquals(NaN, x /= (tmp = -263945678, tmp));
  assertEquals(0, x <<= x);
  assertEquals(0, x <<= x);
  assertEquals(0, x -= (((x>>((x&x)-(tmp = -673697315, tmp)))>>(((1575095242.2330558)/(x-(-1816886266)))%(-1580195729)))>>>x));
  assertEquals(0, x >>>= x);
  assertEquals(0, x >>= (-2815518206));
  assertEquals(0, x -= (x/(1795634670.692437)));
  assertEquals(-2753579891, x += (tmp = -2753579891, tmp));
  assertEquals(2.7773776150171776, x /= (tmp = -991431585, tmp));
  assertEquals(5.554755230034355, x += x);
  assertEquals(3.362161997528237e-9, x /= (1652137890.4758453));
  assertEquals(3.362161997528237e-9, x %= (tmp = -10848734.527020693, tmp));
  assertEquals(1, x /= x);
  assertEquals(-2978012493, x -= (x+(2978012493)));
  assertEquals(-5.158905851797543, x /= (((x+((tmp = -2548840164, tmp)>>x))<<(x^((tmp = -533281232.7294345, tmp)&x)))&(tmp = -1502692171, tmp)));
  assertEquals(-5.158905851797543, x %= (-3009435255.5612025));
  assertEquals(-20971520, x <<= ((tmp = -2728812464, tmp)%(2619809573.672677)));
  assertEquals(-1900019712, x &= (2398099552));
  assertEquals(-1991377, x %= ((tmp = 1562364373.7334614, tmp)>>>(((x-(-946283217))<<(-2044590694))^(((tmp = 1681238509, tmp)>>(-2801649769))-x))));
  assertEquals(1, x /= x);
  assertEquals(1, x %= (x/(x-x)));
  assertEquals(1.3525631913093335e-9, x /= (739336991));
  assertEquals(0, x &= ((x&(x|(-1530424204)))<<((((tmp = -295143065.9115021, tmp)>>x)+x)<<x)));
  assertEquals(0, x <<= (-1311017801));
  assertEquals(-0, x /= (-667133339.1918633));
  assertEquals(1038307283, x += (1038307283));
  assertEquals(506985, x >>>= ((tmp = 1550624472.9157984, tmp)^x));
  assertEquals(506985, x >>>= ((254646626)<<(tmp = 1572845412.744642, tmp)));
  assertEquals(32447040, x <<= (tmp = -2427326042, tmp));
  assertEquals(0, x -= (x<<((x|x)>>>x)));
  assertEquals(0, x &= x);
  assertEquals(0, x &= ((-484420357)|((tmp = 807540590.6132902, tmp)/(x/x))));
}
f();
