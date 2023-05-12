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
  var x = 0;
  var tmp = 0;
  assertEquals(-890607324, x ^= ((tmp = -890607324, tmp)>>((((-2876826295)>>x)<<((tmp = 2351495148.117994, tmp)>>(tmp = 1368611893.274765, tmp)))*(tmp = 1531795251, tmp))));
  assertEquals(-729075363, x += (x+(tmp = 1052139285, tmp)));
  assertEquals(531550884933581760, x *= x);
  assertEquals(1980836332, x ^= ((-746269795.2320724)-((2400458512)>>((1290672548)>>>((((1536843439.5629003)&(3185059975.158061))*(tmp = -1339249276.2667086, tmp))&x)))));
  assertEquals(941373096, x %= ((x+(-451098412))^(tmp = 1725497732, tmp)));
  assertEquals(-1766019323, x += (tmp = -2707392419, tmp));
  assertEquals(2528947973, x >>>= (x^(-896237435.3809054)));
  assertEquals(-263192576, x <<= (-866361580));
  assertEquals(-2008, x >>= (-2608071791));
  assertEquals(-88, x %= (((-1076807218.4792447)&((tmp = 601044863, tmp)>>((tmp = 1228976729, tmp)+((((-2711426325)*x)|x)|(x%(-2700007330.3266068))))))&(tmp = 3147972836.778858, tmp)));
  assertEquals(1762886843, x ^= (tmp = 2532080403, tmp));
  assertEquals(1762886843, x %= ((((((tmp = -2059247788, tmp)>>x)/x)+(x<<x))^x)>>>(-1969283040.3683646)));
  assertEquals(4812334726.587896, x += (tmp = 3049447883.587897, tmp));
  assertEquals(1, x /= x);
  assertEquals(1, x *= x);
  assertEquals(-2150507334, x -= ((tmp = 1578221999, tmp)+(tmp = 572285336, tmp)));
  assertEquals(-4546475858941548500, x *= ((tmp = -931533139.5546813, tmp)^(tmp = 3061503275, tmp)));
  assertEquals(-269064192, x |= ((207217276.91936445)<<(tmp = -957353678.4997551, tmp)));
  assertEquals(1, x /= x);
  assertEquals(1, x <<= (((1463856021.8616743)%(x*(tmp = -2286419102, tmp)))/(-2852887593)));
  assertEquals(2223868564.8383617, x *= (tmp = 2223868564.8383617, tmp));
  assertEquals(918797189.9033995, x -= ((1305071374.9349623)%(x+(2211992629))));
  assertEquals(-2212004787.4668465, x -= (tmp = 3130801977.370246, tmp));
  assertEquals(31783, x >>= (2951958960));
  assertEquals(31783, x ^= ((((tmp = -2441511566, tmp)&((tmp = 91427553.90168321, tmp)+((tmp = 3001737720.327718, tmp)%x)))>>>(-2263859841))>>>((2109161329)>>(tmp = -2816295136.7443414, tmp))));
  assertEquals(4068224, x <<= (x%((tmp = -682576250.4464607, tmp)*(x/(((x-x)>>>(x&((((x<<(x<<x))>>>((((2243036981.528562)/(((-1839328916.9411087)>>(-1907748022.162144))<<(x+x)))+((tmp = 2362574171, tmp)<<(tmp = 1987834539, tmp)))|(-444329240)))|(399451601.1717081))>>x)))&(968363335.6089249))))));
  assertEquals(0.0030991932898194294, x /= ((tmp = 1067316540.5529796, tmp)^(-2388640366)));
  assertEquals(0, x >>= x);
  assertEquals(0, x >>>= (tmp = -393433349.1636851, tmp));
  assertEquals(0, x *= (((x^(((1806955787.471396)<<x)^((517668047.55566347)>>>(x%(x<<(tmp = -276586733.4844558, tmp))))))%(1661242196.1472542))|x));
  assertEquals(0, x |= (x>>x));
  assertEquals(-155236210, x |= (tmp = -155236210.19366312, tmp));
  assertEquals(-606392, x >>= ((tmp = -1533446042.97781, tmp)^x));
  assertEquals(-1, x >>= (936126810));
  assertEquals(2325115611, x -= (-2325115612));
  assertEquals(0, x -= x);
  assertEquals(0, x >>= (tmp = -354826623, tmp));
  assertEquals(-0, x *= (-1232528947.7321298));
  assertEquals(0, x |= x);
  assertEquals(0, x <<= (((tmp = 187758893.4254812, tmp)&(x-(tmp = 648201576, tmp)))&(385106597)));
  assertEquals(0, x >>= (tmp = 2554891961, tmp));
  assertEquals(-1311492611.2970417, x += (-1311492611.2970417));
  assertEquals(-688179220.3221785, x += (623313390.9748632));
  assertEquals(1416835528, x &= (tmp = 1953739224, tmp));
  assertEquals(-11.04719252755072, x /= (-128252995));
  assertEquals(-6.287413042114223e-9, x /= (tmp = 1757033052.1558928, tmp));
  assertEquals(-4231171, x |= (((((2022730885.7773404)*((-2495777565.221855)|(tmp = 274627292, tmp)))<<(-3072596920.4902725))>>>((-2215057529)+(-1134713759.4247034)))^((tmp = -1888181788, tmp)/(572025985.2748461))));
  assertEquals(-4194305, x |= ((tmp = 167328318.038759, tmp)>>>(153800904.34551537)));
  assertEquals(-1316525687, x -= (1312331382));
  assertEquals(1448723245.7863903, x += (2765248932.7863903));
  assertEquals(1.7219707102205526, x /= (tmp = 841317008, tmp));
  assertEquals(1872027792.5217001, x *= (x|(tmp = 1087142645.6665378, tmp)));
  assertEquals(3504488055973669400, x *= x);
  assertEquals(-1075254784, x |= x);
  assertEquals(-5, x >>= (((844461331.8957539)-((x&x)<<((tmp = 1443904777, tmp)+(tmp = 736164505.3670597, tmp))))-(((tmp = 1348422110, tmp)>>((tmp = -2878252514, tmp)/(-1175443113)))|((-2138724317)%(2057081133)))));
  assertEquals(-3.038875804165675e-9, x /= (1645345292.8698258));
  assertEquals(1.25204541454491e-18, x /= (-2427129055.274914));
  assertEquals(-1.7151576137235622e-9, x *= (-1369884505.6247284));
  assertEquals(1590804618, x ^= (1590804618.4910607));
  assertEquals(5061318665300252000, x *= (x+x));
  assertEquals(5061318665300252000, x %= ((tmp = 1102144242, tmp)*x));
  assertEquals(-7, x >>= (2772167516.624264));
  assertEquals(16383, x >>>= (-2979259214.5855684));
  assertEquals(47108415435, x *= ((2944456517.839616)>>>(1041288554.5330646)));
  assertEquals(61, x >>>= (x^(((-1305163705)<<((948566605)-x))-x)));
  assertEquals(0, x %= x);
  assertEquals(0, x ^= (((tmp = 1918861879.3521824, tmp)/((x%(tmp = 945292773.7188392, tmp))%(x|x)))>>x));
  assertEquals(-0, x *= ((((x|((2810775287)|(tmp = 1265530406, tmp)))^((tmp = 3198912504.175658, tmp)-(((tmp = 1422607729.281712, tmp)<<(tmp = 2969836271.8682737, tmp))&x)))<<((tmp = 844656612, tmp)*(((((tmp = -828311659, tmp)%(((-2083870654)>>>(x^(((((933133782)-(tmp = 1033670745, tmp))-(629026895.4391923))%((-605095673.8097742)*((((-227510375.38460112)*x)+x)&(((((tmp = 472873752.68609154, tmp)^(tmp = 2815407038.712165, tmp))+((x>>>((tmp = -1331030665.3510115, tmp)>>>(2281234581)))-(x>>>x)))&(tmp = -2160840573.325921, tmp))&x))))<<(tmp = 1411888595, tmp))))|(((tmp = -915703839.0444739, tmp)/((x+(418836101.8158506))%(-1112605325.4404268)))&((-3098311830.6721926)-x))))-((49446671.477988124)*(-2522433127)))+((tmp = 443068797, tmp)>>(tmp = 418030554.97275746, tmp)))*((tmp = 38931296.738208175, tmp)+(1842742215.3282685)))))-((tmp = 1325672181.205841, tmp)^(tmp = 669284428, tmp))));
  assertEquals(-0, x *= (tmp = 93843030, tmp));
  assertEquals(0, x ^= x);
  assertEquals(0, x ^= x);
  assertEquals(0, x <<= x);
  assertEquals(0, x >>>= (x%((((((tmp = -107458601, tmp)>>(x*((x|((tmp = 2117286494, tmp)>>((x^(tmp = 114214295.42048478, tmp))>>>(tmp = 1032826615, tmp))))&((x*x)&(-225386977.67686415)))))^((-780566702.5911419)+(-1113319771)))|(((x^x)<<(1288064444))>>(-2292704291.619477)))>>(365125945))-((tmp = -1986270727.235776, tmp)/x))));
  assertEquals(-0, x *= (((-18925517.67125845)|((((-1975220517)+(tmp = -1250070128.296064, tmp))+(1085931410.5895243))<<(((x|(((x*(tmp = 160207581.50536323, tmp))|(tmp = 1798744469.7958293, tmp))-x))>>>(((x+((x%x)&((((x^x)<<((tmp = 2538012074.623554, tmp)^x))*x)&x)))/(x+(tmp = -2563837407, tmp)))/(tmp = 2189564730, tmp)))/(((-1703793330.5770798)<<((176432492)|x))<<(1347017755.345185)))))<<(((tmp = -577100582.7258489, tmp)&x)/(-31246973))));
  assertEquals(0, x >>>= x);
  assertEquals(NaN, x %= ((x*(tmp = 1167625971, tmp))&(((tmp = -770445060, tmp)>>((339248786)^((2058689781.2387645)-((-2381162024)*(660448066)))))&x)));
  assertEquals(NaN, x += ((3088519732.515986)-(-267270786.06493092)));
  assertEquals(0, x &= (tmp = 2748768426.3393354, tmp));
  assertEquals(-1109969306, x ^= ((-1109969306)>>>x));
  assertEquals(-1109969306, x %= (tmp = 1150376563.581773, tmp));
  assertEquals(-2058145178, x &= (-2057586057));
  assertEquals(-850185626, x |= ((x^(tmp = 1223093422, tmp))&((-589909669)<<(2299786170))));
  assertEquals(1489215443, x += (2339401069));
  assertEquals(-23592960, x <<= x);
  assertEquals(2063937322, x ^= (-2053296342.2317986));
  assertEquals(12922122, x %= (x^((-2259987830)>>(x*(((tmp = -799867804.7716949, tmp)&(tmp = -1068744142, tmp))*(((((1091932754.8596292)-((tmp = -1778727010, tmp)>>(((tmp = 1207737073.2689717, tmp)-(x-(tmp = -1191958946, tmp)))+(-631801383.7488799))))-(-618332177))>>>(-156558558))>>>(3032101547.6262517)))))));
  assertEquals(12922122, x &= x);
  assertEquals(Infinity, x /= (x%x));
  assertEquals(0, x &= (x*(-227800722.62070823)));
  assertEquals(-865648691, x ^= (-865648691));
  assertEquals(1, x /= (x%(tmp = 1524739353.8907173, tmp)));
  assertEquals(16, x <<= (x<<(2335214658.789205)));
  assertEquals(0, x &= ((tmp = 570332368.1239192, tmp)^(-2278439501)));
  assertEquals(1881145344, x -= (((-569715735.8853142)+(2093355159))<<(tmp = 2788920949, tmp)));
  assertEquals(0, x ^= x);
  assertEquals(NaN, x -= ((tmp = -1427789954, tmp)%((((((411038329.49866784)-x)-(x<<((-1330832247)+x)))/x)^((x*(845763550.2134092))>>(tmp = 1427987604.5938706, tmp)))>>>(1857667535))));
  assertEquals(NaN, x /= (-313793473));
  assertEquals(0, x >>>= (x/x));
  assertEquals(1869358566, x -= (-1869358566));
  assertEquals(-1901664519209545200, x += ((tmp = 944729941.3936644, tmp)*(-2012918653)));
  assertEquals(-1901664519209545200, x += ((tmp = 1348246793, tmp)/(x&x)));
  assertEquals(-1576791552, x &= (tmp = 2719250966.739456, tmp));
  assertEquals(-305087899, x ^= (-2955630491.030272));
  assertEquals(0, x ^= (x%(1575252839.559443)));
  assertEquals(4184604407, x += ((((tmp = -244720076.17657042, tmp)|(2819320515))^((((tmp = 1222623743.9184055, tmp)*(-95662379.577173))/(x/(x+(((x-(tmp = -3024718107.6310973, tmp))^(-1494390781))&(tmp = 2284054218.8323536, tmp)))))>>>(tmp = 2090069761, tmp)))>>>(x%x)));
  assertEquals(3148907440, x -= (((tmp = -332379100.7695112, tmp)-(-1145399547))^(((((((tmp = 3133792677.785844, tmp)+x)<<(2306999139.5799255))>>((tmp = -2051266106, tmp)*(((((x+(((-728654312.8954825)>>(x>>>(((x%x)&(-1587152364))|(((((-2114138294)&x)&(1547554688))^x)-(-1856094268)))))*(((-1135018784)&((x+(tmp = -1444020289, tmp))|x))+x)))>>x)&x)/(2449005489))<<((131073798.64314616)%(x>>>((-2592101383.2205048)^(tmp = -757096673.0381112, tmp)))))))^(2766467316.8307915))-(-2465892914.515834))-((((tmp = 234064056, tmp)^((x>>>(1622627548.7944543))+(-1750474146)))|(-1959662039.4687617))^((-1222880974)&(-2794536175.906498))))));
  assertEquals(-1157627488, x &= (-1156639323));
  assertEquals(-1342170624, x <<= ((x/((((1829945345.0613894)/(x*((tmp = 1278865203.0854595, tmp)/(((tmp = -2298274086.519347, tmp)+(tmp = -545203761, tmp))-(tmp = 2712195820, tmp)))))>>>((tmp = 240870798.9384452, tmp)-(tmp = -3188865300.4768195, tmp)))>>>(x%((648799266)>>>(tmp = 24460403.864815235, tmp)))))|((tmp = 232533924, tmp)|x)));
  assertEquals(-2684341248, x += x);
  assertEquals(1073755136, x &= (((-662718514.9245079)>>(tmp = -1915462105, tmp))+(tmp = 1478850441.8689613, tmp)));
  assertEquals(-1073755136, x /= (x|((tmp = -1767915185, tmp)|((325827419.1430224)|(((-1343423676)|(tmp = -1929549501, tmp))|(-866933068.9585254))))));
  assertEquals(-1073755136, x %= ((tmp = 547342356, tmp)-((tmp = 2213249646.7047653, tmp)-((((((-2463314705)^(tmp = -993331620, tmp))^(((x%x)>>(tmp = 1798026491.3658786, tmp))-(((1024072781)/(tmp = -2407354455, tmp))%(1973295010))))<<(-1966787233))^x)|(-1787730004)))));
  assertEquals(-1073754452, x |= (tmp = 3099823788.077907, tmp));
  assertEquals(-1540683096, x &= (-1540674632.7013893));
  assertEquals(-1540683052, x ^= ((tmp = -126183090, tmp)>>>((-622437575.5788481)|((((tmp = -2947914022, tmp)%(((tmp = 2512586745, tmp)>>x)>>>((27238232.23677671)/(tmp = 3203958551, tmp))))/(tmp = 2906005721.402535, tmp))^((((tmp = 1763897860.737334, tmp)^(1445562340.2485332))/x)+(-2393501217.716533))))));
  assertEquals(-1258599433, x |= (tmp = 351291767.59661686, tmp));
  assertEquals(-1241560065, x |= (626346046.5083935));
  assertEquals(-1241560065, x ^= ((2263372092)/((tmp = -2868907862, tmp)>>>x)));
  assertEquals(-893685228, x -= (tmp = -347874837, tmp));
  assertEquals(3401282068, x >>>= (x*x));
  assertEquals(0, x %= x);
  assertEquals(0, x >>>= x);
  assertEquals(-2079237393, x ^= (tmp = 2215729903, tmp));
  assertEquals(NaN, x %= ((((tmp = 3203450436, tmp)/(2867575150.6528325))&(1864945829))&((x&((((tmp = -1927086741.3438427, tmp)|x)|(-1783290909.3240588))*((-1074778499.0697656)*(x-((tmp = -848983542.8456669, tmp)^(tmp = -1324673961, tmp))))))>>(tmp = -2144580304.245896, tmp))));
  assertEquals(-43334009, x |= (x^(-43334009.72683525)));
  assertEquals(-43334009, x &= x);
  assertEquals(-43334009, x %= (tmp = 1252450645.060542, tmp));
  assertEquals(-43334009, x |= (((((((tmp = 968062202, tmp)/(x|(tmp = 2766801984, tmp)))*((2173353793.938968)>>(((tmp = -2459317247, tmp)<<(tmp = -2333601397, tmp))>>>((tmp = -578254251.8969193, tmp)*(tmp = 839964110.7893236, tmp)))))&(((1675305119)&(tmp = -929153707, tmp))*((x*x)*x)))/x)|(x/(tmp = 384740559.43867135, tmp)))%(1657362591)));
  assertEquals(0, x -= x);
  assertEquals(0, x %= (-1334758781.1087842));
  assertEquals(0, x -= x);
  assertEquals(-54, x += ((tmp = -1787151355.470972, tmp)>>((tmp = 237028977, tmp)>>(((2829473542)<<(x>>>(((((((x-(-1950724753))*(((x>>>(2807353513.6283565))<<((-583810779.1155353)>>(x*x)))>>(-1068513265)))^(x^(-696263908.5131407)))%(((tmp = -1325619399, tmp)<<((tmp = -1030194450, tmp)-x))^x))+((-2852768585.3718724)>>(tmp = -3160022361, tmp)))%(x&x))>>(tmp = 2667222702.5454206, tmp))))+((804998368.8915854)<<x)))));
  assertEquals(-54, x %= (-1601267268.4306633));
  assertEquals(1, x >>>= (tmp = -543199585.579128, tmp));
  assertEquals(4.732914708226396e-10, x /= (tmp = 2112862922, tmp));
  assertEquals(-4266932650, x -= ((((x^((((tmp = 2784618443, tmp)^(tmp = -2271260297.9010153, tmp))|((((tmp = -599752639.7516592, tmp)*(2751967680.3680997))^(tmp = -1478450055.578217, tmp))*x))-x))&((tmp = -520061982, tmp)-((tmp = 1400176711.9637299, tmp)^(((2100417541)|(x+(tmp = -674592897.0420957, tmp)))>>x))))^(tmp = -365650686.7947228, tmp))>>>((-2943521813)&(((tmp = -1888789582, tmp)>>(tmp = 700459655.488978, tmp))+(tmp = -1725725703.655931, tmp)))));
  assertEquals(224277168, x <<= (tmp = 2885115011.8229475, tmp));
  assertEquals(224277168, x %= (tmp = -2655345206.442777, tmp));
  assertEquals(850395136, x <<= (x-(((((-769868538.1729524)/((tmp = -298603579, tmp)%(x^x)))+((2691475692)|(((x>>>(628995710.4745524))^(x<<(((tmp = -1046054749, tmp)|(919868171))-x)))^((-1377678789.8170452)&((3065147797)%(tmp = 2638804433, tmp))))))^(tmp = -2036295169, tmp))&(((tmp = -157844758.08476114, tmp)*(tmp = -2819601496, tmp))&((((tmp = 78921441, tmp)<<(653551762.5197772))/(1801316098))*(-1479268961.8276927))))));
  assertEquals(1645565728, x ^= (tmp = 1353013024, tmp));
  assertEquals(1645565728, x >>>= x);
  assertEquals(3020513544, x += (1374947816));
  assertEquals(0, x %= x);
  assertEquals(0, x %= ((((((tmp = -304228072.4115715, tmp)>>>((-90523260.45975709)-(tmp = -3013349171.084838, tmp)))%((-1640997281)*((tmp = -1600634553, tmp)%((tmp = 557387864, tmp)<<((888796080.766409)|(x^((((x%(((((tmp = 1164377954.1041703, tmp)*x)|(2742407432.192806))&((tmp = 1707928950, tmp)<<(1279554132.4481683)))+(tmp = -2108725405.7752397, tmp)))%(tmp = -465060827, tmp))^((tmp = 2422773793, tmp)+x))^((((((((tmp = -1755376249, tmp)^((-267446806)^x))/(((tmp = -1808578662.4939392, tmp)+((tmp = -1997100217, tmp)+x))+(((tmp = -2469853122.411479, tmp)/x)>>(tmp = 660624616.7956645, tmp))))%((x<<((((((tmp = -1701946558, tmp)-(tmp = 133302235, tmp))>>>x)/(738231394))<<(-1060468151.4959564))&(((((-1877380837.4678264)|(tmp = 2366186363, tmp))%x)>>>(-2382914822.1745577))>>((-1874291848.9775913)<<(tmp = 2522973186, tmp)))))<<(-2672141993)))|(tmp = 732379966, tmp))%x)^x)^x))))))))%(tmp = 2385998902.7287374, tmp))*x)+(tmp = -2195749866.017106, tmp)));
  assertEquals(401488, x ^= (((-320896627)>>>(tmp = 2812780333.9572906, tmp))&(tmp = -2088849328, tmp)));
  assertEquals(-1661116571.0046256, x += (tmp = -1661518059.0046256, tmp));
  assertEquals(-1616122720, x <<= x);
  assertEquals(-1616122720, x >>= x);
  assertEquals(-390439413, x %= (tmp = -1225683307, tmp));
  assertEquals(-84189205, x |= ((x|(2054757858))^(((x<<(((x|x)|(((x>>>((-2938303938.1397676)<<((2993545056)^((tmp = -643895708.5427527, tmp)/((1371449825.5345795)-(1896270238.695752))))))-(tmp = 1061837650, tmp))+(x+(tmp = 3072396681, tmp))))>>(x-((((tmp = -1877865355.1550744, tmp)&x)%(-2766344937))>>>(2055121782)))))-((x<<x)|(tmp = -2742351880.1974454, tmp)))<<((-2600270279.219802)>>(-1625612979)))));
  assertEquals(-168378410, x += x);
  assertEquals(-168378410, x &= x);
  assertEquals(-1534983792, x &= (-1501412943));
  assertEquals(-1821543761, x ^= (938439487));
  assertEquals(-1821543761, x &= (x^(((tmp = -4237854, tmp)>>x)/x)));
  assertEquals(2358, x >>>= (2954252724.620632));
  assertEquals(4716, x <<= ((-75522382.8757689)/((tmp = 1074334479, tmp)|((tmp = -720387522, tmp)>>(x>>>(-3085295162.6877327))))));
  assertEquals(-1313079316, x |= (2981887904.020387));
  assertEquals(-1957790646, x -= (644711330));
  assertEquals(17831, x >>>= ((tmp = -2550108342, tmp)-(((tmp = 454671414.0146706, tmp)+(-661129693.9333956))>>(x>>>(((tmp = 1752959432.3473055, tmp)*(-2619510342.1812334))%(tmp = -456773274.2411971, tmp))))));
  assertEquals(689287937.6879716, x -= ((tmp = -397126863.6879716, tmp)-(((x>>x)^(x/(-1387467129.6278908)))|((x>>((tmp = -2361114214.8413954, tmp)<<(tmp = -805670024.4717407, tmp)))<<(-2724018098)))));
  assertEquals(1378575875.3759432, x += x);
  assertEquals(84112428460187.8, x *= (((((2681425112.3513584)%(tmp = -1757945333, tmp))|x)>>(-1793353713.0003397))%x));
  assertEquals(-3221, x >>= (-1976874128));
  assertEquals(-3221, x %= (((tmp = 2318583056.834932, tmp)|((tmp = -1016115125, tmp)+((-472566636.32567954)+x)))|(tmp = 3135899138.065598, tmp)));
  assertEquals(-6596608, x <<= x);
  assertEquals(-1249902592, x <<= (((tmp = -2025951709.5051148, tmp)/((-465639441)<<(-2273423897.9682302)))*((tmp = -2408892408.0294642, tmp)-(tmp = 1017739741, tmp))));
  assertEquals(73802092170444800, x *= (tmp = -59046275, tmp));
  assertEquals(-1619001344, x <<= x);
  assertEquals(0, x <<= (tmp = 1610670303, tmp));
  assertEquals(-0, x *= ((((x+(tmp = 2039867675, tmp))|(tmp = 399355061, tmp))<<(1552355369.313559))^x));
  assertEquals(0, x *= x);
  assertEquals(0, x >>>= (((2875576018.0610805)>>x)%(tmp = -2600467554, tmp)));
  assertEquals(2290405226.139538, x -= (-2290405226.139538));
  assertEquals(0, x %= x);
  assertEquals(0, x ^= (((tmp = 2542309844.485515, tmp)-x)%((-2950029429.0027323)/(tmp = 2943628481, tmp))));
  assertEquals(0, x += x);
  assertEquals(0, x -= x);
  assertEquals(0, x >>>= (tmp = 2337330038, tmp));
  assertEquals(0, x += (x/(((292272669.0808271)&(tmp = 2923699026.224247, tmp))^(tmp = 367745855, tmp))));
  assertEquals(0, x &= x);
  assertEquals(0, x %= ((tmp = 1565155613.3644123, tmp)<<(-308403859.5844681)));
  assertEquals(-1845345399.3731332, x += (tmp = -1845345399.3731332, tmp));
  assertEquals(5158590659731951000, x *= (-2795460763.8680177));
  assertEquals(-364664, x >>= (1837745292.5701954));
  assertEquals(1, x /= x);
  assertEquals(-860616114.8182092, x += ((tmp = 2076961323.1817908, tmp)+(-2937577439)));
  assertEquals(-860616115, x ^= ((x*(tmp = 2841422442.583121, tmp))>>>((tmp = 1929082917.9039137, tmp)>>(-2602087246.7521305))));
  assertEquals(-38387843, x |= (3114677624));
  assertEquals(2927507837, x += (tmp = 2965895680, tmp));
  assertEquals(1, x /= x);
  assertEquals(-1792887531, x *= (-1792887531));
  assertEquals(-0, x %= ((x^x)+x));
  assertEquals(-0, x %= (tmp = 2800752702.562547, tmp));
  assertEquals(1384510548, x ^= (tmp = 1384510548, tmp));
  assertEquals(42251, x >>= (1645421551.363844));
  assertEquals(0, x >>>= (17537561));
  assertEquals(-2076742862, x ^= (tmp = 2218224434, tmp));
  assertEquals(-2.790313825067623, x /= (744268563.3934636));
  assertEquals(5313538, x &= (((((tmp = -2406579239.0691676, tmp)+((-1470174628)+(((tmp = -783981599, tmp)<<(tmp = -1789801141.272646, tmp))^(((((((tmp = -844643189.5616491, tmp)&(tmp = -252337862, tmp))&(x|x))%((-3159642145.7728815)+(tmp = 2149920003.9525595, tmp)))&(x>>(1737589807.9431858)))-((((((((1610161800)<<(497024994))>>x)<<x)/x)>>>x)&x)-(757420763.2141517)))-(tmp = -3061016994.9596977, tmp)))))/(tmp = 1810041920.4089384, tmp))&(tmp = 5887654.786785364, tmp))&((tmp = 1626414403.2432103, tmp)+(x%x))));
  assertEquals(-2147483648, x <<= (tmp = 1304102366.8011155, tmp));
  assertEquals(-208418816, x %= (((((-2850404799)*(x+(3158771063.226051)))*(-2017465205))/(x>>x))>>(x%(tmp = 2760203322, tmp))));
  assertEquals(-2189223477, x -= (1980804661));
  assertEquals(-859239912, x ^= (tmp = 2974421971.3544703, tmp));
  assertEquals(-1599850415, x ^= (tmp = -2475871671.140151, tmp));
  assertEquals(-1600636847, x += ((((tmp = -1311002944, tmp)<<((tmp = -1137871342, tmp)<<(tmp = 115719116, tmp)))/(413107255.6242596))<<(x>>((((-1908022173)&(((-1519897333)^((x>>(x*(tmp = -2886087774.426503, tmp)))*(tmp = 530910975, tmp)))+(-2579617265.889692)))+((2518127437.127563)>>>((tmp = 481642471.56441486, tmp)>>>(792447239))))^(x<<(248857393.6819017))))));
  assertEquals(-191, x >>= (-1591265193));
  assertEquals(-192.27421813247196, x += ((tmp = 2627329028.207775, tmp)/(tmp = -2061914644.9523563, tmp)));
  assertEquals(1230613220, x ^= (tmp = 3064354212.307105, tmp));
  assertEquals(1230613220, x &= x);
  assertEquals(1230613220, x %= (1833479205.1064768));
  assertEquals(1230613220, x >>>= ((((1559450742.1425748)|((2151905260.956583)*(1213275165)))%(514723483.12764716))>>>x));
  assertEquals(1230613493, x |= ((((3004939197.578903)*(tmp = -576274956, tmp))+((tmp = 1037832416.2243971, tmp)^x))>>>(tmp = 2273969109.7735467, tmp)));
  assertEquals(2461226986, x += x);
  assertEquals(-27981, x >>= ((692831755.8048055)^((tmp = -1593598757, tmp)%(x-((((-1470536513.882593)|((tmp = -2716394020.466401, tmp)|(tmp = 2399097686, tmp)))&x)%x)))));
  assertEquals(-1.4660454948034359e+23, x *= (((x>>>((((((tmp = -3056016696, tmp)<<(-2882888332))*(2041143608.321916))&(((tmp = -634710040, tmp)|(tmp = -2559412457, tmp))>>(1916553549.7552106)))%((-2150969350.3643866)*x))<<((x*(tmp = 2657960438.247278, tmp))|x)))%((tmp = 526041379, tmp)*(tmp = 2514771352.4509397, tmp)))*(1219908294.8107886)));
  assertEquals(-1.4660454948034359e+23, x -= ((1709004428)>>(((x|(-422745730.626189))%x)>>x)));
  assertEquals(-2247766068, x %= (-3105435508));
  assertEquals(-386845856.0649812, x -= (-1860920211.9350188));
  assertEquals(-386846803.0649812, x -= ((((-3214465921)|((tmp = -1326329034, tmp)+(((tmp = -1203188938.9833462, tmp)%((((((-1318276502)+(x+x))^((x<<x)%(x>>>x)))+(tmp = -439689881, tmp))+((-1455448168.695214)^(x-((-388589993)>>((((940252202)^(-2218777278))|x)/(tmp = -1007511556, tmp))))))&(-140407706.28176737)))-(x/((888903270.7746506)-((tmp = -2885938478.632409, tmp)<<(((((tmp = -1750518830.270917, tmp)>>(((((((tmp = 868557365.7908674, tmp)/(tmp = -2805687195.5172157, tmp))*x)|((((((-1342484550)-((tmp = 1089284576, tmp)^(tmp = 120651272, tmp)))<<(tmp = 2230578669.4642825, tmp))-(x*x))%(x^(((tmp = -3177941534, tmp)+(x>>(-1595660968)))/(-1738933247))))>>>(tmp = 2860175623, tmp)))-(((2392690115.8475947)>>>(tmp = -1754609670.2068992, tmp))>>>(tmp = 2615573062, tmp)))-(tmp = 2590387730, tmp))^((x+((((x-(tmp = -2823664112.4548965, tmp))*(200070977))>>>(((x|((((tmp = 1361398, tmp)>>((tmp = 1649209268, tmp)%x))+x)+(x>>>(tmp = -2379989262.1245675, tmp))))|(x^((tmp = -647953298.7526417, tmp)-x)))&(tmp = -1881232501.1945808, tmp)))>>>x))%(x^(tmp = -1737853471.005935, tmp)))))>>>(427363558))>>>((tmp = -3076726422.0846386, tmp)^(-1518782569.1853383)))/x)))))))|x)>>>(1854299126)));
  assertEquals(-386846803.0649812, x -= (x%x));
  assertEquals(238532, x >>>= (-448890706.10774803));
  assertEquals(232, x >>>= (-791593878));
  assertEquals(232, x <<= (((x^((x-x)&(tmp = 1219114201, tmp)))/(tmp = -427332955, tmp))%(tmp = 1076283154, tmp)));
  assertEquals(210, x ^= (x>>>((2975097430)>>>x)));
  assertEquals(1, x /= x);
  assertEquals(2317899531, x *= (2317899531));
  assertEquals(1131786, x >>>= x);
  assertEquals(2301667519.6379366, x += ((tmp = 193109669.63793683, tmp)+(tmp = 2107426064, tmp)));
  assertEquals(3842614963.6379366, x += (((-1676516834)>>>(tmp = -1817478916.5658965, tmp))^(((tmp = 1122659711, tmp)>>>(tmp = -2190796437, tmp))|(tmp = -2754023244, tmp))));
  assertEquals(-452352333, x &= x);
  assertEquals(-863, x >>= x);
  assertEquals(-3.777863669459606e-7, x /= (2284359827.424491));
  assertEquals(-3.777863669459606e-7, x %= ((tmp = -2509759238, tmp)>>>x));
  assertEquals(0, x <<= (-814314066.6614306));
  assertEquals(0, x %= (tmp = 190720260, tmp));
  assertEquals(2301702913, x += (2301702913));
  assertEquals(-249158048, x >>= (tmp = -2392013853.302008, tmp));
  assertEquals(-249158048, x >>= x);
  assertEquals(-498316096, x += x);
  assertEquals(-498316096, x %= (tmp = 2981330372.914731, tmp));
  assertEquals(106616.2199211318, x *= (((((tmp = 1020104482.2766557, tmp)^((tmp = -416114189.96786, tmp)>>>(1844055704)))|(tmp = 1665418123, tmp))>>(1826111980.6564898))/(-2446724367)));
  assertEquals(106616, x |= x);
  assertEquals(1094927345, x -= (((-1229759420)|(741260479.7854375))-x));
  assertEquals(8353, x >>= x);
  assertEquals(0, x >>>= (tmp = -327942828, tmp));
  assertEquals(-953397616.8888416, x += (tmp = -953397616.8888416, tmp));
  assertEquals(-1906641240.7776833, x += (x+((-3033450184.9106326)>>>(tmp = 2090901325.5617187, tmp))));
  assertEquals(-1906641240.7776833, x %= (tmp = 2584965124.3953505, tmp));
  assertEquals(-1098907671, x |= (tmp = -1272590495, tmp));
  assertEquals(-1.8305258600334393, x /= (600323489));
  assertEquals(-1, x &= x);
  assertEquals(-1, x |= ((x+x)-x));
  assertEquals(1, x *= x);
  assertEquals(867473898, x ^= (tmp = 867473899.0274491, tmp));
  assertEquals(6, x >>>= (tmp = 1174763611.341228, tmp));
  assertEquals(0, x >>= ((689882795)^(2250084531)));
  assertEquals(0, x /= (tmp = 2545625607, tmp));
  assertEquals(0, x >>= x);
  assertEquals(0, x += x);
  assertEquals(0, x -= (x*(-1098372339.5157008)));
  assertEquals(NaN, x %= x);
  assertEquals(NaN, x -= (tmp = -1797344676.375759, tmp));
  assertEquals(1121476698, x |= (tmp = 1121476698, tmp));
  assertEquals(1, x /= x);
  assertEquals(1, x &= (-191233693));
  assertEquals(330137888.92595553, x += (330137887.92595553));
  assertEquals(-1792236714, x ^= (tmp = 2256609910, tmp));
  assertEquals(269000724, x &= (316405813.62093115));
  assertEquals(256, x >>= x);
  assertEquals(256, x %= ((2556320341.54669)|(1066176021.2344948)));
  assertEquals(256, x |= x);
  assertEquals(131072, x <<= ((-1650561175.8467631)|x));
  assertEquals(-286761951, x -= ((tmp = 287024095, tmp)-((-2293511421)&(x|x))));
  assertEquals(-1561852927, x &= (3002663949.0989227));
  assertEquals(-460778761, x %= (tmp = -550537083, tmp));
  assertEquals(-3023749308.0492287, x += (tmp = -2562970547.0492287, tmp));
  assertEquals(-481313332.04922867, x %= ((x|((tmp = -855929299, tmp)%((2181641323)%(x|(220607471.33018696)))))&x));
  assertEquals(17510668, x &= (tmp = 363557663, tmp));
  assertEquals(12552, x &= (3020225307));
  assertEquals(1814655896, x |= ((x<<(((-1475967464)*(-3122830185))*x))+(x^(-2480340864.2661023))));
  assertEquals(-3209124403525266400, x -= ((1146847590)*(tmp = 2798213497, tmp)));
  assertEquals(-6418248807050533000, x += x);
  assertEquals(1.1856589432073933e+28, x *= (-1847324681.313275));
  assertEquals(-1238853292, x ^= (-1238853292));
  assertEquals(-77428331, x >>= (x&((((2043976651.8514216)>>>x)^(x>>>(((tmp = -1785122464.9720652, tmp)%x)<<(1570073474.271266))))*x)));
  assertEquals(2011, x >>>= x);
  assertEquals(2011, x &= x);
  assertEquals(0, x >>= (-2682377538));
  assertEquals(-1.1367252770299785, x -= (((tmp = 2704334195.566802, tmp)/(2379056972))%((((-1764065164)*((((468315142.8822602)>>((x%(((tmp = 2537190513.506641, tmp)+((x&(x|((tmp = -947458639, tmp)^(2653736677.417406))))*((x<<((1243371170.1759553)>>>(((tmp = 1572208816, tmp)<<((tmp = 963855806.1090456, tmp)>>>x))%((-3078281718.7743487)*x))))^(-1154518374))))^(-2839738226.6314087)))^((-2865141241.190915)*(-2400659423.8207664))))>>((tmp = 32940590, tmp)/(tmp = 2917024064.570817, tmp)))+(((27601850)/(tmp = 3168834986, tmp))>>x)))+(tmp = 2528181032.600125, tmp))/(3162473952))));
  assertEquals(-1697395408.7948515, x -= (1697395407.6581264));
  assertEquals(1536992607912062500, x *= (tmp = -905500627.5781817, tmp));
  assertEquals(102759872, x >>= (tmp = -707887133.4484048, tmp));
  assertEquals(102759872, x %= (tmp = -1764067619.7913327, tmp));
  assertEquals(12543, x >>>= (-144142995.1469829));
  assertEquals(-2059555229.2592103, x += ((-2059555229.2592103)-x));
  assertEquals(-537022593, x |= (tmp = -2770761410.407701, tmp));
  assertEquals(23777505, x ^= (-560496738.6854918));
  assertEquals(-64329014115772310, x *= ((tmp = -2729234369.198843, tmp)+x));
  assertEquals(189083830, x ^= (tmp = 933619934, tmp));
  assertEquals(189083830, x %= ((tmp = -2918083254, tmp)-(x|(x^(-2481479224.0329475)))));
  assertEquals(378167660, x += x);
  assertEquals(-0.45833387791900504, x /= ((tmp = 2727991875.241294, tmp)<<(tmp = 2570034571.9084663, tmp)));
  assertEquals(0, x <<= x);
  assertEquals(-0, x /= (tmp = -67528553.30662966, tmp));
  assertEquals(0, x <<= (938440044.3983492));
  assertEquals(-945479171, x ^= (tmp = -945479171, tmp));
  assertEquals(-225632619284361200, x *= (238643670.00884593));
  assertEquals(-0, x %= x);
  assertEquals(-585826304, x ^= ((-1256265560)<<(tmp = 1144713549, tmp)));
  assertEquals(-671583855, x ^= (183333265.1468178));
  assertEquals(-484311040, x <<= x);
  assertEquals(-3969762.62295082, x /= ((((tmp = -1164308668.931008, tmp)-x)%x)>>>(((397816647)>>(-1605343671.4070785))<<x)));
  assertEquals(758097879, x ^= ((tmp = -2871307491, tmp)^(-2043176492.646442)));
  assertEquals(0, x *= ((x>>(tmp = 1983292927, tmp))&(tmp = -860505131.4484091, tmp)));
  assertEquals(0, x <<= x);
  assertEquals(0, x &= x);
  assertEquals(0, x %= ((3132981707)-(-2832016477)));
  assertEquals(0, x >>= (x<<((1830195133.0342631)>>>(tmp = -1003969250, tmp))));
  assertEquals(NaN, x %= x);
  assertEquals(NaN, x += (tmp = 273271019.87603223, tmp));
  assertEquals(NaN, x += (625749326.1155348));
  assertEquals(0, x >>= (tmp = -531039433.3702333, tmp));
  assertEquals(0, x -= (((tmp = 2029464099, tmp)-(x-(tmp = -329058111.411458, tmp)))*(x<<x)));
  assertEquals(-0, x *= ((-1112957170.5613296)|((tmp = 847344494, tmp)>>>(tmp = 2735119927, tmp))));
  assertEquals(-0, x /= (tmp = 544636506, tmp));
  assertEquals(0, x >>>= (x^(545093699)));
  assertEquals(0, x %= (((tmp = -2208409647.5052004, tmp)+(3083455385.374988))+(((-482178732.7077277)*x)>>>((2661060565)*(-2125201239)))));
  assertEquals(0, x >>>= (-212334007.34016395));
  assertEquals(0.7004300865203454, x -= ((2032883941)/(-2902336693.0154715)));
  assertEquals(0, x <<= (x<<((265868133.50175047)>>>(1162631094))));
  assertEquals(604920272.4394834, x -= (-604920272.4394834));
  assertEquals(604920272, x &= x);
  assertEquals(0, x <<= (((-1961880051.1127694)%(tmp = 1715021796, tmp))|((tmp = 2474759639.4587016, tmp)|(243416152.55635))));
  assertEquals(-46419074, x |= (((tmp = -518945938.5238774, tmp)%((x+(tmp = 242636408, tmp))+(-1974062910)))|(1546269242.0259726)));
  assertEquals(-46419074, x += ((-629802130)*((tmp = -658144149, tmp)%((-905005358.5370393)>>>x))));
  assertEquals(-46419074, x |= (x%(-1103652494)));
  assertEquals(7892881050983985, x *= (-170035297.36469936));
  assertEquals(1105701997.4273424, x %= ((((-490612260.0023911)>>>(tmp = 1803426906, tmp))^(x%(2725270344.2568116)))-(1010563167.8934317)));
  assertEquals(1088619532, x &= (-2232199650));
  assertEquals(1073807364, x &= (-888024506.5008001));
  assertEquals(1153062254980628500, x *= x);
  assertEquals(1153062255703627000, x -= (tmp = -722998613.897227, tmp));
  assertEquals(-1141418584, x |= (3017232552.4814596));
  assertEquals(-373464140, x ^= (-2914372068));
  assertEquals(994050048, x <<= x);
  assertEquals(0, x ^= x);
  assertEquals(0, x &= (tmp = -3166402389, tmp));
  assertEquals(0, x &= ((-1760842506.337213)|(tmp = 2538748127.795164, tmp)));
  assertEquals(-0, x /= (-2635127769.808626));
  assertEquals(0, x &= ((((tmp = 1414701581, tmp)^(((2425608769)/((x<<x)^(x-x)))^((tmp = -2641946468.737288, tmp)|(tmp = -313564549.1754241, tmp))))*(tmp = -2126027460, tmp))|(-2255015479)));
  assertEquals(225482894, x ^= (225482894.8767246));
  assertEquals(0, x ^= x);
  assertEquals(306216231, x += (tmp = 306216231, tmp));
  assertEquals(306216231, x -= ((-465875275.19848967)&((-806775661.4260025)/((((-184966089.49763203)>>>((x>>x)+((tmp = -1951107532, tmp)|x)))%x)*((2704859526.4047284)%((x*x)>>x))))));
  assertEquals(30754, x &= (1706162402.033193));
  assertEquals(30454.010307602264, x -= (((590456519)>>>(tmp = 2713582726.8181214, tmp))/x));
  assertEquals(8419062, x |= ((2848886788)<<(tmp = 2993383029.402275, tmp)));
  assertEquals(16, x >>= (tmp = -1651287021, tmp));
  assertEquals(1, x /= x);
  assertEquals(-1407643485, x ^= (-1407643486));
  assertEquals(2, x >>>= (-1126004674));
  assertEquals(470812081, x ^= ((-2411718964)>>>x));
  assertEquals(550443688.6407901, x += (tmp = 79631607.6407901, tmp));
  assertEquals(3669092443.64079, x -= (-3118648755));
  assertEquals(-625874853, x <<= (((tmp = -1640437346, tmp)/(((x*x)>>>x)<<x))/x));
  assertEquals(-1431439050363516700, x *= (2287101077));
  assertEquals(-1921660672, x |= ((((((((-1912249689.9978154)&(-1676922742.5343294))*(2625527768))<<((820676465)^(((x+(tmp = -852743692, tmp))&((x-((((1361714551)/(311531668))>>>(tmp = -1330495518.8175917, tmp))<<(((tmp = 1369938417.8760853, tmp)*(-1217947853.8942266))<<(-2048029668))))-(-513455284)))>>>(tmp = 1980267333.6201067, tmp))))<<(((1503464217.2901971)>>(tmp = 2258265389, tmp))>>>(1868451148)))&(x-(x^(tmp = -1565209787, tmp))))*x)<<(tmp = -2426550685, tmp)));
  assertEquals(-1921660672, x %= (((tmp = 523950472.3315773, tmp)+(((2971865706)^x)-x))&(-1773969177)));
  assertEquals(420176973.1169958, x += (2341837645.116996));
  assertEquals(420176973, x >>>= (((tmp = -2485489141, tmp)<<((tmp = -2520928568.360244, tmp)+x))&(543950045.0932506)));
  assertEquals(50, x ^= (x|((tmp = 2001660699.5898843, tmp)>>>(tmp = 1209151128, tmp))));
  assertEquals(138212770720.96973, x *= (2764255414.4193945));
  assertEquals(-28683, x |= (((-535647551)|x)>>((((2065261509)>>(-354214733))*x)+(-3218217378.2592907))));
  assertEquals(1627048838, x ^= (tmp = -1627044749, tmp));
  assertEquals(-839408795, x ^= (2903337187.480303));
  assertEquals(-1000652427, x += (tmp = -161243632, tmp));
  assertEquals(740237908.4196916, x += ((tmp = 1587000348, tmp)+(tmp = 153889987.41969144, tmp)));
  assertEquals(Infinity, x /= (((((-615607376.1012697)&(57343184.023578644))+((-1967741575)|(-3082318496)))<<(((tmp = -958212971.99792, tmp)>>(tmp = 2962656321.3519197, tmp))-(x|(x*(969365195)))))<<(tmp = -1739470562.344624, tmp)));
  assertEquals(-Infinity, x /= ((tmp = -1736849852, tmp)%x));
  assertEquals(0, x <<= x);
  assertEquals(0, x %= (tmp = -226505646, tmp));
  assertEquals(1982856549, x -= (((x+(-1982856549))%(-2274946222))>>(x%(((tmp = -1289577208.9097936, tmp)>>x)^(778147661)))));
  assertEquals(1648018703, x ^= ((3085618856)+((tmp = 1546283467, tmp)&(((x|((-2376306530)*(((((((tmp = -2807616416, tmp)%(((((tmp = 347097983.1491085, tmp)<<x)|(((((1135380667)/(x>>>(tmp = 1679395106, tmp)))^((1277761947)<<((tmp = -1614841203.5244312, tmp)>>x)))%((tmp = 1552249234.2065845, tmp)>>>x))>>>(tmp = -1677859287, tmp)))>>>(2605907565))/(tmp = 2291657422.221277, tmp)))%(((tmp = 425501732.6666014, tmp)>>>(1327403879.455553))+x))>>((tmp = -3075752653.2474413, tmp)&(x-(tmp = -71834630, tmp))))|((((2532199449.6500597)*(-842197612.4577162))%x)>>x))*(((1220047194.5100307)<<((tmp = 1642962251, tmp)<<((-662340)>>>((tmp = -1672316631.3251066, tmp)<<((tmp = 1762690952.542441, tmp)-(x/(1904755683.3277364)))))))>>x))|(((((tmp = 1625817700.7052522, tmp)%(tmp = -2990984460, tmp))|(2395645662))-((2619930607.550086)>>x))^(tmp = 130618712, tmp)))))&((-3142462204.4628367)/(1078126534.8819227)))%(((tmp = -256343715.2267704, tmp)+x)^(tmp = 2009243755, tmp))))));
  assertEquals(1937698223, x |= (((tmp = 866354374.7435778, tmp)+(tmp = 2751925259.3264275, tmp))%(-2252220455)));
  assertEquals(0, x -= x);
  assertEquals(-823946290.6515498, x -= (tmp = 823946290.6515498, tmp));
  assertEquals(706970324, x ^= (-457174758));
  assertEquals(32916, x &= (25740724));
  assertEquals(0, x >>>= ((-1658933418.6445677)|(tmp = -846929510.4794133, tmp)));
  assertEquals(0, x ^= ((-834208600)/((-1256752740)&(tmp = 1973248337.8973258, tmp))));
  assertEquals(-1639195806, x += (-1639195806));
  assertEquals(-1559416478, x ^= ((tmp = 1349893449.0193534, tmp)*(tmp = 2044785568.1713037, tmp)));
  assertEquals(0, x &= ((x>>(tmp = 1720833612, tmp))/((x+(-1305879952.5854573))^x)));
  assertEquals(-0, x *= (tmp = -1713182743, tmp));
  assertEquals(0, x >>= x);
  assertEquals(NaN, x /= (((x%((x>>>(((-1515761763.5499895)^(-3076528507.626539))<<(tmp = 1293944457.8983147, tmp)))<<(tmp = 276867491.8483894, tmp)))>>(tmp = -2831726496.6887417, tmp))%((((tmp = 1780632637.3666987, tmp)^x)%((208921173.18897665)>>(tmp = 633138136, tmp)))+x)));
  assertEquals(0, x >>= (tmp = -2755513767.0561147, tmp));
  assertEquals(0, x |= x);
  assertEquals(840992300.0324914, x -= ((-840992300.0324914)+x));
  assertEquals(840992300, x &= x);
  assertEquals(-1094140277, x ^= (2364029095));
  assertEquals(-Infinity, x /= ((((((1257084956)<<(2009241695))>>(x+x))*x)>>>x)>>>(205318919.85870552)));
  assertEquals(-Infinity, x -= (((x>>>(tmp = 3037168809.20163, tmp))&x)*(x&(((806151109)*x)-(tmp = -1741679480.58333, tmp)))));
  assertEquals(400659949, x ^= (tmp = 400659949, tmp));
  assertEquals(5, x >>= (tmp = 1175519290, tmp));
  assertEquals(5, x |= x);
  assertEquals(0, x >>= x);
  assertEquals(0, x >>= ((1317772443)&(x<<x)));
  assertEquals(-1123981819, x ^= (tmp = 3170985477, tmp));
  assertEquals(1123864651, x ^= ((x%(((x&x)&(-2606227299.7590737))<<((tmp = -2018123078.1859496, tmp)*x)))|(x+(((((1935939774.8139446)/((-1303958190)/(2802816697.32639)))<<((2880056582)*x))+x)+x))));
  assertEquals(1543368927, x |= (-2795691884));
  assertEquals(NaN, x /= (x%((tmp = -1129915114, tmp)<<x)));
  assertEquals(NaN, x += (tmp = -3045743135, tmp));
  assertEquals(NaN, x -= (tmp = -2849555731.8207827, tmp));
  assertEquals(NaN, x /= (((((2127485827)>>>((((tmp = 363239924, tmp)>>x)|((((tmp = -1419142286.0523334, tmp)-(x<<x))^(tmp = -1990365089.8283136, tmp))*((tmp = 2780242444.0739098, tmp)>>>(((-2336511023.342298)&x)/(tmp = 2296926221.402897, tmp)))))>>((tmp = 1378982475.6839466, tmp)>>(tmp = -816522530, tmp))))&(x^(tmp = -1668642255.0586753, tmp)))%(((tmp = 921249300.1500335, tmp)^x)*(tmp = -2228816905, tmp)))>>x));
  assertEquals(-1460685191, x |= (tmp = 2834282105, tmp));
  assertEquals(-1463439264, x &= (tmp = 2881860064.146755, tmp));
  assertEquals(20.98100714963762, x /= (((3017150580.7875347)^((250499372.5339837)<<(tmp = -42767556.30788112, tmp)))|(x%(-2829281526))));
  assertEquals(1, x /= x);
  assertEquals(2, x += x);
  assertEquals(8, x <<= x);
  assertEquals(0, x >>>= ((730174750)>>>x));
  assertEquals(0, x ^= x);
  assertEquals(-1459637373, x ^= (2835329923.456409));
  assertEquals(-1233115861, x ^= (511678120));
  assertEquals(95682857, x >>>= ((tmp = 1534570885, tmp)|(tmp = -414425499.3786578, tmp)));
  assertEquals(70254633, x &= (-1502067585));
  assertEquals(51384749748909710, x *= (tmp = 731407276, tmp));
  assertEquals(9390482.873469353, x %= (tmp = -592576964.7982686, tmp));
  assertEquals(4695241, x >>>= (tmp = -1879898431.5395758, tmp));
  assertEquals(-3129811912538149000, x += (((-727481809)^((3106908604)%x))*((((tmp = -1218123690, tmp)^(x>>((-942923806)^x)))/(x+x))>>>(-1508881888.969373))));
  assertEquals(1596870236, x ^= (-1135673764.9721224));
  assertEquals(0, x ^= x);
  assertEquals(2133782410, x |= (((-2202469371)>>((tmp = 1327588406.183342, tmp)/(tmp = 253581265.7246865, tmp)))-((tmp = 2226575446.838795, tmp)^x)));
  assertEquals(-81895217.83608055, x -= (tmp = 2215677627.8360806, tmp));
  assertEquals(812089344, x <<= ((tmp = 882824005, tmp)/(((x>>((((((((tmp = 1211145185, tmp)/((-137817273)-(((tmp = 2165480503.1144185, tmp)-(-1840859887.1288517))*((155886014.8393339)>>((-1984526598)<<(tmp = 1331249058.3246582, tmp))))))>>(x*x))%(2830324652))%(933701061))|(1346496215))^(tmp = -988800810, tmp))+x))>>>x)<<(-2372088384))));
  assertEquals(812089344, x <<= x);
  assertEquals(8472, x %= ((((x|(((x%(tmp = 2772099481.664402, tmp))+(2894690616))-x))&(x&(((-715790638.6454093)>>(tmp = -1447931029, tmp))-(tmp = 1761027889, tmp))))^x)%(((tmp = 830969811, tmp)|x)|((-1102267929)-(3193018687)))));
  assertEquals(-0.0000028559857417864914, x /= (-2966401364));
  assertEquals(0, x >>= x);
  assertEquals(-701800392, x += (tmp = -701800392, tmp));
  assertEquals(2034756873, x -= (tmp = -2736557265, tmp));
  assertEquals(-0.9475075048394501, x /= (((((82879340.27231383)+((tmp = -2876678920.653639, tmp)*(-2801097850)))<<x)>>>((x<<(((((x|x)&(tmp = -1572694766, tmp))>>(x+(x/((x-(((tmp = 1435301275, tmp)|(tmp = 983577854.212041, tmp))>>(tmp = 632633852.1644179, tmp)))+x))))>>>x)|(-850932021)))>>x))<<(-821983991)));
  assertEquals(0, x >>= (x>>(2424003553.0883207)));
  assertEquals(2599386349, x -= (-2599386349));
  assertEquals(-68157441, x |= (((tmp = -1170343454.9327996, tmp)+((((tmp = 448468098, tmp)|(x>>(x>>(((x>>(((x/(x&(x<<x)))<<(2436876051.2588806))^(3010167261)))%((tmp = 2577616315.7538686, tmp)>>>(-2953152591.015912)))%((tmp = -1304628613, tmp)/(x&((x|((-2000952119)%((691146914)/((tmp = 1480966978.7766845, tmp)<<((tmp = 2644449477.392441, tmp)|(-2143869305.871568))))))+(tmp = -315254308, tmp))))))))&(-2060205555))|((-604140518.8186448)^(x*x))))%(x*((tmp = 1383244000.2807684, tmp)/(3195793656)))));
  assertEquals(-68157441, x |= x);
  assertEquals(-1, x >>= x);
  assertEquals(-2147483648, x <<= x);
  assertEquals(-1.5257198286933313, x /= (tmp = 1407521622, tmp));
  assertEquals(1149084989.47428, x += (((tmp = 1149084991.9004865, tmp)&x)^((((((2797053000)/(x^x))*(-2829253694))>>>((tmp = -610924351, tmp)>>x))>>>(tmp = -675681012, tmp))<<(2812852729))));
  assertEquals(0, x %= x);
  assertEquals(0, x <<= ((tmp = -584069073, tmp)*(-2953140326)));
  assertEquals(0, x <<= (tmp = -481515023.6404002, tmp));
  assertEquals(-1441535370, x ^= (2853431926));
  assertEquals(2853431926, x >>>= (((((((tmp = 2215663525.9620194, tmp)%((-1102832735.9274108)/x))>>x)&(3220898702.76322))&(((2077584946)*((x>>x)<<((tmp = 1845701049, tmp)-x)))/(tmp = 1947184202.5737212, tmp)))|(((tmp = 2976351488, tmp)^(-42517339))%((2648230244.410125)^(1520051731.31089))))/(1761635964)));
  assertEquals(43539, x >>>= (tmp = 1361671184.7432632, tmp));
  assertEquals(21769, x >>= ((tmp = -804932298.9572575, tmp)>>((((tmp = 1749006993.253409, tmp)+(276536978))^x)|(2698166994))));
  assertEquals(1103025563, x |= (tmp = 1103007891, tmp));
  assertEquals(1327594607, x += (tmp = 224569044, tmp));
  assertEquals(1327594607, x |= x);
  assertEquals(-478674944, x <<= (((672378508)&x)^(((-2070209708.6470091)|x)|(x>>>x))));
  assertEquals(-478674943, x ^= ((-1832457698.6345716)>>>((tmp = -3077714019, tmp)/(1809383028))));
  assertEquals(229129701056053250, x *= x);
  assertEquals(1, x /= x);
  assertEquals(2, x <<= (-1522529727));
  assertEquals(2, x &= x);
  assertEquals(-2016989182, x |= ((((tmp = -1267845511, tmp)*(1225350332))+((tmp = -1397690831.5717893, tmp)>>>(tmp = -2575382994, tmp)))+x));
  assertEquals(-241, x >>= (tmp = 931869591, tmp));
  assertEquals(-1048087547, x &= (tmp = -1048087403.1163051, tmp));
  assertEquals(-4004486369.844599, x += (tmp = -2956398822.844599, tmp));
  assertEquals(-4004486368.844599, x -= (((2701878498)>>x)|(x|(-1079354967))));
  assertEquals(1, x >>= (tmp = -1583689092, tmp));
  assertEquals(1, x *= (x>>(x%x)));
  assertEquals(0, x %= x);
  assertEquals(-0, x *= (-120818969));
  assertEquals(0, x >>= ((tmp = 1794099660, tmp)/(((x&(((-321906091)^(tmp = -3009885933.8449526, tmp))&((tmp = -140917780, tmp)|(2037803173.4075825))))&x)&(tmp = -745357154, tmp))));
  assertEquals(0, x <<= (563984257.3493614));
  assertEquals(NaN, x %= ((((x>>(tmp = -2190891392.320677, tmp))-x)<<(462714956))<<((tmp = -84413570, tmp)|((x|(-2787022855))-((tmp = 2028532622, tmp)|(tmp = 1103757073.9178817, tmp))))));
  assertEquals(NaN, x *= ((2137674085.3142445)|((tmp = -1054749859.2353804, tmp)%x)));
  assertEquals(NaN, x /= (x>>>(((((tmp = 597103360.9069608, tmp)>>>(-2850217714.1866236))-((tmp = 1125150527, tmp)*x))%(tmp = -982662312, tmp))|((x/(((968656808.6069037)*(((128484784.15362918)>>x)^x))&((((x/((((tmp = 748775979, tmp)*((x-(((tmp = 709571811.9883962, tmp)%(-2083567026))%(x/(tmp = -680467505, tmp))))/((tmp = -167543858, tmp)/(tmp = -3113588783, tmp))))/x)<<(-2605415230)))>>>(tmp = 3133054172, tmp))%(tmp = -1904650393, tmp))*((x|(-1193709562))*(tmp = -1731312795.718104, tmp)))))/((tmp = -672386301, tmp)/(tmp = 808898833.4163612, tmp))))));
  assertEquals(-9, x |= (((((tmp = 150377964.57195818, tmp)/(tmp = 2161910879.0514045, tmp))-(-2381625849))>>(-2715928517))/(((452113643)^(-2502232011))/((-3076471740)^(((tmp = 1664851172, tmp)*(((-1460011714)>>>x)<<((-2870606437)%x)))*((tmp = -2836565755.609597, tmp)-((x/(tmp = -871461415, tmp))-(2278867564))))))));
  assertEquals(-1, x >>= x);
  assertEquals(-1, x |= ((-1319927272)>>>(-2866709980)));
  assertEquals(-1, x >>= ((2345179803.155703)&(-978025218.2243443)));
  assertEquals(1, x /= x);
  assertEquals(-260730973, x |= (tmp = -260730973, tmp));
  assertEquals(1174405120, x <<= (2681054073));
  assertEquals(1174405120, x &= x);
  assertEquals(1073741824, x &= (tmp = 2017166572.7622075, tmp));
  assertEquals(1073741824, x |= x);
  assertEquals(168806102, x %= ((((tmp = -2939969193.950067, tmp)|((-2325174027.614815)/(-2329212715)))*(x/(((((-2927776738)/(x|x))+(x%(tmp = -3007347037.698492, tmp)))<<(-1898633380))>>(tmp = 204338085.45241892, tmp))))^x));
  assertEquals(168806102, x %= ((-832849739.5197744)&(tmp = -141908598, tmp)));
  assertEquals(-401033205.05225074, x -= (tmp = 569839307.0522507, tmp));
  assertEquals(-401033205, x &= x);
  assertEquals(-401130402, x ^= ((x*(tmp = 311418759.22436893, tmp))>>x));
  assertEquals(793533469, x ^= (-950312893.5201888));
  assertEquals(756, x >>>= (-1096189516));
  assertEquals(711, x += ((tmp = -753105189, tmp)>>(599823192.5381484)));
  assertEquals(0, x >>>= ((tmp = -2859668634.4641137, tmp)+(-1160392986.1521513)));
  assertEquals(2427599726.176195, x -= (-2427599726.176195));
  assertEquals(1942312465.2523103, x -= (485287260.92388475));
  assertEquals(0, x >>>= ((tmp = -1740656456, tmp)/(tmp = 1339746799.9335847, tmp)));
  assertEquals(0, x <<= ((-7017077.38786912)*((-699490904.4551768)^x)));
  assertEquals(0, x <<= (tmp = 715662384, tmp));
  assertEquals(0, x *= (x>>>(2149735450.0758677)));
  assertEquals(NaN, x /= x);
  assertEquals(0, x >>= ((397078885)*((851639692.8982519)-x)));
  assertEquals(0, x &= (-2526654445));
  assertEquals(0, x %= (-1204924598));
  assertEquals(251639720, x ^= (x|(tmp = 251639720, tmp)));
  assertEquals(695433573, x ^= (663539405));
  assertEquals(-1038050104, x -= (1733483677));
  assertEquals(0, x ^= x);
  assertEquals(NaN, x %= x);
  assertEquals(0, x &= (392107269));
  assertEquals(0, x %= (-3084908458.241551));
  assertEquals(0, x ^= x);
  assertEquals(-2121660509, x ^= (tmp = -2121660509.7861986, tmp));
  assertEquals(2285041855588855800, x *= (x|(3209046634)));
  assertEquals(54915072, x >>>= (x%(((((x%((((tmp = -1429433339.5078833, tmp)|(tmp = 2906845137, tmp))^(3207260333))&(-848438650)))-(-2721099735))&(141851917.19978714))+x)/x)));
  assertEquals(54915072, x &= x);
  assertEquals(54915072, x %= (x+(1855489160)));
  assertEquals(70078753, x ^= ((((((-1648661736)+(x%((-1421237596)+(tmp = 2053180992.3857927, tmp))))+(tmp = 38606889, tmp))<<((-241334284)%((x>>(215316122))*(tmp = 396488307, tmp))))+((tmp = -2900704565, tmp)^x))^(((1103481003.1111188)^x)-(tmp = 1304113534, tmp))));
  assertEquals(1149501440, x <<= ((x>>(tmp = 3203172843, tmp))*(tmp = -192535531, tmp)));
  assertEquals(0, x ^= x);
  assertEquals(0, x >>= ((tmp = 2751499787, tmp)&((tmp = 2217654798, tmp)*(tmp = -2798728014, tmp))));
  assertEquals(NaN, x /= ((((-2019592425)>>>((((-1571930240.741224)>>>((-183952981)/((((1990518443.672842)>>(((((2051371284)%(685322833.6793983))>>>(2662885938))<<(-1212029669.6675105))|((-2790877875)<<(1546643473))))<<x)-(tmp = 804296674.4579233, tmp))))-(tmp = -417759051.68770766, tmp))/((-621859758)>>>x)))&x)<<(tmp = -48558935.55320549, tmp)));
  assertEquals(0, x <<= (x&x));
  assertEquals(0, x *= (x%(tmp = 301196068, tmp)));
  assertEquals(398290944, x |= (((tmp = 1904146839, tmp)+(1521017178))*(-3174245888.562067)));
  assertEquals(1256401076, x ^= (1566464180));
  assertEquals(149620758, x %= ((tmp = 532626355, tmp)^(tmp = -382971203, tmp)));
  assertEquals(149620791, x |= (x>>x));
  assertEquals(-0.07034576194938641, x /= ((tmp = -1977313182.7573922, tmp)-x));
  assertEquals(0, x <<= x);
  assertEquals(0, x &= x);
  assertEquals(0, x /= ((2182424851.139966)%(((-2768516150)+x)>>>x)));
  assertEquals(0, x %= (-504299638.53962016));
  assertEquals(-0, x *= (-2915134629.6909094));
  assertEquals(0, x <<= ((tmp = 952692723.402582, tmp)%(2146335996.785011)));
  assertEquals(230457472, x |= ((tmp = -574776101.8681948, tmp)*(683185125)));
  assertEquals(933795934, x ^= (tmp = 974395614, tmp));
  assertEquals(933801974, x ^= (x>>>((-148683729)*(((tmp = 2912596991.415531, tmp)^(-2883672328))/x))));
  assertEquals(222, x >>= (-3060224682));
  assertEquals(27, x >>>= (1429156099.1338701));
  assertEquals(754519106, x ^= (tmp = 754519129.7281355, tmp));
  assertEquals(188629776, x >>>= ((x>>>((1247267193)<<(tmp = -936228622, tmp)))%((tmp = 978604324.8236886, tmp)*((tmp = -3018953108, tmp)^(((tmp = 259650195, tmp)>>>(tmp = 2762928902.7901163, tmp))*(x>>((tmp = 787444263.5542864, tmp)/(x>>>(((-2039193776)<<(tmp = -1408159169, tmp))-(1238893783))))))))));
  assertEquals(188629775.33987066, x += ((tmp = 1040520414, tmp)/((-1576237184)|((tmp = -970083705, tmp)&(((tmp = -312062761.12228274, tmp)|(1171754278.2968853))<<(-2069846597.7723892))))));
  assertEquals(1473670, x >>>= ((tmp = 202409672, tmp)^x));
  assertEquals(2171703268900, x *= (x>>(((tmp = 840468550, tmp)&(-3208057101.2136793))/x)));
  assertEquals(0, x ^= x);
  assertEquals(0, x ^= (x&((tmp = 2569871408.2405066, tmp)|((tmp = -3149374622, tmp)<<(x-(x|((tmp = -821239139.1626894, tmp)>>>x)))))));
  assertEquals(NaN, x /= x);
  assertEquals(NaN, x %= (tmp = 1926106354, tmp));
  assertEquals(0, x >>= ((x/(-2848416))/(tmp = 2484293767, tmp)));
  assertEquals(0, x <<= ((tmp = -2484137114, tmp)>>>(tmp = -887083772.8318355, tmp)));
  assertEquals(0, x >>= (tmp = -2651389432, tmp));
  assertEquals(0, x ^= x);
  assertEquals(1041871201, x += ((tmp = 1041871201.9272791, tmp)|(x<<(-1136959830))));
  assertEquals(651390879501530900, x *= ((tmp = 1250424964.0346212, tmp)>>x));
  assertEquals(1965815296.245636, x %= ((2650603245.655831)+((-1610821947.8640454)>>>(((878987151.6917406)*((((784630543)%(((1448720244)>>(((tmp = 3036767847, tmp)+((tmp = 1012548422, tmp)<<(1957000200)))-x))/(x>>x)))<<((tmp = 914710268, tmp)*(((x^(1559603121))<<(tmp = 3181816736, tmp))|((-1964115655)+x))))-(-1055603890)))&(946797797.0616649)))));
  assertEquals(1965815296.245636, x %= (tmp = -2601038357.593118, tmp));
  assertEquals(-769384440.872302, x += (-2735199737.117938));
  assertEquals(-769384440.872302, x %= (2193123162));
  assertEquals(1, x /= x);
  assertEquals(1, x -= (((x>>>(-1968465925))*((tmp = 563037904, tmp)>>((tmp = 3009534415.769578, tmp)>>((-2567240601.7038674)<<(tmp = -1258402723.4150183, tmp)))))%(3112239470.276867)));
  assertEquals(1, x |= x);
  assertEquals(1505461527, x ^= (tmp = 1505461526.5858076, tmp));
  assertEquals(406553877, x &= (tmp = 2558242293, tmp));
  assertEquals(406553877, x |= x);
  assertEquals(-574902339, x |= ((-709809495)%(tmp = -2880884811.410611, tmp)));
  assertEquals(-20281777.349363208, x %= (22184822.46602547));
  assertEquals(1, x /= x);
  assertEquals(-4360732, x ^= ((x|(tmp = 3178620274, tmp))>>(((2686286888)&(((-1107223053.8716578)/(((-2955575332.3675404)+(-2770518721))|(-2705016953.640522)))-x))^((1473641110.4633303)*((((-1466496401)<<x)+x)%(1805868749.082736))))));
  assertEquals(-1158545408, x <<= ((((x/((-2710098221.691819)-(-2421462965.788145)))/(((((x>>>(tmp = 1994541591.1032422, tmp))+(tmp = -1276676679.9747126, tmp))&((tmp = 1764029634.2493339, tmp)+((x|(tmp = -3050446156, tmp))-((tmp = -9441859, tmp)/(((-2072420232)&x)*(-1003199889))))))+(tmp = -2443230628, tmp))*x))*((x&((((x|(747566933))*(((2039741506)>>>((tmp = -2456000554, tmp)>>>(-1566360933.7788877)))^((tmp = 960600745, tmp)/x)))&(x^(((-2649310348.777452)^((2224282875)-(tmp = -2129141087.3182096, tmp)))<<((x<<x)+((-1307892509.3874407)-(x|(tmp = -2831643528.9720087, tmp)))))))/(((tmp = -35502946, tmp)<<((tmp = 1091279222, tmp)>>(((-2686069468.8930416)-x)+(tmp = 367442353.2904701, tmp))))%(1218262628))))/x))^(-919079153.7857773)));
  assertEquals(747, x >>>= (1229157974));
  assertEquals(747, x |= x);
  assertEquals(NaN, x %= (((3086718766.4715977)*((7912648.497568846)*((-2713828337.1659327)*(-176492425.4011252))))<<(tmp = -1074475173, tmp)));
  assertEquals(0, x >>>= ((((444923201)<<x)>>>(-883391420.2142565))*((((617245412)<<x)>>>x)*(-913086143.2793813))));
  assertEquals(1941802406, x ^= (tmp = -2353164890, tmp));
  assertEquals(14, x >>>= (-1600311077.4571416));
  assertEquals(-18229482703.7246, x += (((x+(-993157139.7880647))%x)*(1862419512.1781366)));
  assertEquals(-14.531388114858734, x /= ((tmp = -1649072797.951641, tmp)<<x));
  assertEquals(0, x ^= x);
  assertEquals(0, x >>= ((x/x)^x));
  assertEquals(2, x ^= ((-1597416259)/(-738770020)));
  assertEquals(0, x >>= (tmp = -387850072.74833393, tmp));
  assertEquals(0, x >>>= ((2491085477.186817)>>(x*(((tmp = -1592498533, tmp)+(tmp = 2086841852, tmp))&(-3174019330.8288536)))));
  assertEquals(0, x >>= x);
  assertEquals(0, x >>>= (tmp = -3045348659.45243, tmp));
  assertEquals(-1208573479, x |= ((3086393817)-x));
  assertEquals(1460649854142163500, x *= x);
  assertEquals(1588199424, x <<= (-1902076952));
  assertEquals(1586102272, x &= (tmp = 2139876091.9142454, tmp));
  assertEquals(-460908552.5528109, x -= (tmp = 2047010824.552811, tmp));
  assertEquals(-460908552.5528109, x %= (tmp = 507904117.09368753, tmp));
  assertEquals(-460908552.5528109, x %= (2749577642.527038));
  assertEquals(234012, x >>>= (-340465746.91275));
  assertEquals(0, x >>>= x);
  assertEquals(0, x %= (tmp = -2601875531, tmp));
  assertEquals(0, x %= (x|(tmp = 650979981.1158671, tmp)));
  assertEquals(0, x %= (tmp = -2286020987, tmp));
  assertEquals(0, x |= x);
  assertEquals(0, x &= (x|((tmp = 2568101411, tmp)-(-1438002403))));
  assertEquals(0, x >>>= (1399248574));
  assertEquals(0, x %= (-1906670287.2043698));
  assertEquals(0, x >>= (1019286379.6962404));
  assertEquals(0, x |= (x/(tmp = -82583591.62643051, tmp)));
  assertEquals(NaN, x %= x);
  assertEquals(NaN, x *= (x^(1874776436)));
  assertEquals(NaN, x -= ((-1238826797)-(-2971588236.7228813)));
  assertEquals(0, x <<= (2064632559));
  assertEquals(-0.5967273958864694, x += (((tmp = 1502995019, tmp)>>x)/(-2518729707)));
  assertEquals(0, x >>>= x);
  assertEquals(-0, x /= (-1923030890));
  assertEquals(NaN, x %= x);
  assertEquals(0, x >>= (tmp = 1081732779.9449487, tmp));
  assertEquals(-820183066, x |= ((tmp = -3169007292.4721155, tmp)|(-1912588318)));
  assertEquals(0, x -= x);
  assertEquals(NaN, x %= x);
  assertEquals(NaN, x /= (tmp = 287181840, tmp));
  assertEquals(0, x &= (x/((tmp = -1139766051, tmp)<<(x&(tmp = 2779004578, tmp)))));
  assertEquals(0, x >>= (((tmp = -1816938028, tmp)+(-224851993.3139863))*(-2933829524)));
  assertEquals(0, x |= ((((tmp = 305077929.1808746, tmp)&((x-(((((tmp = 2122810346.7475111, tmp)<<(717271979))*(tmp = 256854043.72633624, tmp))%((x+(tmp = -318657223.9992106, tmp))*((1993144830)<<(2594890698.603228))))^((((tmp = 257370667, tmp)>>>((((x^(3160746820))>>>(2049640466.8116226))>>>(2543930504.7117066))^(x-x)))^(x%(964838975)))^x)))%(x*x)))>>>x)*(tmp = -46861540, tmp)));
  assertEquals(747575633, x ^= ((-2406502427)-(-3154078060.3794584)));
  assertEquals(0, x *= (x%x));
  assertEquals(0, x <<= (1313773705.3087234));
  assertEquals(0, x >>>= ((x+x)>>>(3068164056)));
  assertEquals(-0, x *= (tmp = -1771797797, tmp));
  assertEquals(1784146970, x ^= (tmp = 1784146970, tmp));
  assertEquals(1784146970, x >>>= (tmp = -2219972320.7195597, tmp));
  assertEquals(1744830464, x <<= ((((-2769476584)-(((1798431604)>>(tmp = 1337687914.799577, tmp))>>>((-2802941943.15014)>>x)))>>>(tmp = 646033678, tmp))-x));
  assertEquals(3044433348102455300, x *= x);
  assertEquals(0, x >>= ((tmp = 1592076570.1900845, tmp)-((645774223.6317859)>>x)));
  assertEquals(0, x >>= (x>>>(-3045822290.1536255)));
  assertEquals(-0, x *= (tmp = -2450298800.986624, tmp));
  assertEquals(0, x >>= (tmp = 1379605393, tmp));
  assertEquals(0, x &= (((x-((((tmp = 837939461.6683749, tmp)+((((-813261853.3247359)|(x&(((-2565113940)*(tmp = -2725085381.240134, tmp))|x)))%(-1457259320))-(x+((tmp = -273947066, tmp)%((1164825698.879649)>>(1653138880.3434052))))))>>>(2823967606.411492))>>>((((((((1189235604.9646997)/(tmp = -2875620103.4002438, tmp))-(tmp = -801261493, tmp))<<(((1832556579.5095325)<<x)|((tmp = -2740330665, tmp)>>(tmp = -2352814025, tmp))))-(tmp = -1445043552.99499, tmp))&(x<<(((((445325471)*(1293047043.1808558))>>>(((1901837408.5910044)-(tmp = -2349093446.5313253, tmp))>>>(tmp = 1000847053.1861948, tmp)))*(x>>>(1771853406.6567078)))>>x)))>>>x)>>>(x^((tmp = 2813422715, tmp)-(x+(-342599947)))))))&(x>>>x))*x));
  assertEquals(NaN, x %= ((tmp = -3027713526, tmp)-((((x%(((((x/((2711155710)^(((((x>>>x)%((1098599291.155015)^(((((tmp = 1855724377.8987885, tmp)/(x|x))*((-1963179786)*((x-((-1634717702)%x))<<x)))>>(2008859507))>>((tmp = 2635024299.7983694, tmp)^(tmp = -602049246, tmp)))))*(x>>x))&(tmp = -1925103609, tmp))*((tmp = 2106913531.2828505, tmp)%((tmp = -200970069, tmp)*(-2809001910.951446))))))%x)*((1990098169)>>((x<<(2303347904.2601404))%x)))|(2767962065.9846206))+(201589933.301661)))>>(((tmp = 1921071149.5140274, tmp)>>(1054558799.1731887))|x))*(x/((((-2833879637.345674)>>>(tmp = 2849099601, tmp))%x)+(x%(x%(((tmp = 1983018049, tmp)^(tmp = -2659637454, tmp))>>((-1335497229.6945198)-(x+(((((tmp = 1136612609.848967, tmp)%(2471741030.01762))<<(x|(((tmp = 1644081190.1972675, tmp)&(-1422527338))^(2379264356.265957))))/(tmp = 2979299484.1884174, tmp))/x)))))))))*((tmp = 1858298882, tmp)^((tmp = -547417134.9651439, tmp)*x)))));
  assertEquals(-7664, x |= ((2286000258.825538)>>(1716389170)));
  assertEquals(-1, x >>= x);
  assertEquals(-1231640486.3023372, x += ((tmp = 1231640485.3023372, tmp)*x));
  assertEquals(-2463280972.6046743, x += x);
  assertEquals(1746, x >>>= x);
  assertEquals(1746, x >>>= (((tmp = -562546488.0669937, tmp)*((-2475357745.8508205)&((x%(821425388.8633704))%((((-2315481592.687686)&(((tmp = 3130530521.7453523, tmp)+x)-x))^(-973033390.1773088))/x))))<<x));
  assertEquals(1746, x %= (-1544973951.076033));
  assertEquals(27936, x <<= (-525441532.33816123));
  assertEquals(27936, x %= (x*((tmp = 344991423.5336287, tmp)+(-2267207281))));
  assertEquals(27, x >>>= (tmp = 1249792906, tmp));
  assertEquals(0, x >>>= (tmp = -1068989615, tmp));
  assertEquals(0, x >>>= (tmp = 347969658.92579734, tmp));
  assertEquals(-2656611892, x -= (2656611892));
  assertEquals(1944539596, x |= (((tmp = 3000889963, tmp)-x)<<((tmp = 2917390580.5323124, tmp)^(-996041439))));
  assertEquals(1944539596, x |= x);
  assertEquals(-739740167.0752468, x -= ((1712009965.0752468)+(x>>((tmp = -740611560.99014, tmp)>>>((tmp = -1033267419.6253037, tmp)&(862184116.3583733))))));
  assertEquals(-1479480334.1504936, x += x);
  assertEquals(-4294967296.150494, x -= (x>>>((1219235492.3661718)&(3138970355.0665245))));
  assertEquals(0, x >>= (x*x));
  assertEquals(-0, x *= ((-2202530054.6558375)-(-676578695)));
  assertEquals(-0, x %= (1336025846));
  assertEquals(0, x &= x);
  assertEquals(0, x /= (1759366510));
  assertEquals(630007622, x |= (630007622));
  assertEquals(-0.22460286863455903, x /= (tmp = -2804984753, tmp));
  assertEquals(1102410276.775397, x -= (-1102410277));
  assertEquals(1102410276.775397, x %= ((((-2569525203)&x)*(x|(-1932675298)))/((-2376634450)>>>(x>>>(tmp = 936937604.9491489, tmp)))));
  assertEquals(33642, x >>= (3028252527));
  assertEquals(2181106522.688034, x -= (-2181072880.688034));
  assertEquals(-2113861630, x &= (2523921542));
  assertEquals(-2147483646, x &= (-1996601566.9370148));
  assertEquals(-2147483648, x &= (tmp = -665669175.1968856, tmp));
  assertEquals(-2858673260.1367273, x -= (tmp = 711189612.1367272, tmp));
  assertEquals(350657, x >>= (tmp = -170243892.25474262, tmp));
  assertEquals(-0.0001405571562140975, x /= (-2494764474.7868776));
  assertEquals(0, x ^= x);
  assertEquals(NaN, x /= ((x&(-2041236879))*((tmp = -2182530229, tmp)^((1274197078)*x))));
  assertEquals(0, x |= (x&(x-(1794950303))));
  assertEquals(1222105379, x |= (tmp = 1222105379, tmp));
  assertEquals(729884484, x ^= (tmp = 1666645607.6907792, tmp));
  assertEquals(729884484, x %= (tmp = -2896922082, tmp));
  assertEquals(8768, x &= ((tmp = 358940932, tmp)>>>(3159687631.3308897)));
  assertEquals(1892384495, x |= (-2402591569));
  assertEquals(1892470533, x += ((((x^(-2266612043))>>>(tmp = -531009952, tmp))<<(x>>>((-1365315963.5698428)>>>((x+((-3168207800.184341)-(tmp = 1776222157.609917, tmp)))+(-1588857469.3596382)))))>>>x));
  assertEquals(143587205, x += (tmp = -1748883328, tmp));
  assertEquals(0, x ^= x);
  assertEquals(0, x >>= (tmp = 2334880462.3195543, tmp));
  assertEquals(0, x &= ((tmp = 1819359625.4396145, tmp)|(tmp = -1323513565, tmp)));
  assertEquals(-1102259874, x ^= (3192707422));
  assertEquals(2567457772588852700, x *= (-2329267202));
  assertEquals(-16783687, x |= ((-2212476227.060922)^(378973700.78452563)));
  assertEquals(4278183609, x >>>= ((((((((tmp = 1766363150.197206, tmp)*(-2774552871))%x)>>>((3071429820)&((((((tmp = 351068445.27642524, tmp)<<(tmp = 2646575765, tmp))^(806452682))<<((x>>>(-2217968415.505327))<<(1564726716)))|x)-(tmp = -3110814468.9023848, tmp))))+x)^x)>>>(tmp = -617705282.0788529, tmp))>>>x));
  assertEquals(4314933530, x -= ((1032195469.789219)|(tmp = -448053861.9531791, tmp)));
  assertEquals(9709850, x %= (((tmp = -3056286252.5853324, tmp)*x)&x));
  assertEquals(9709850, x %= (tmp = -2596800940, tmp));
  assertEquals(2655489828.9461126, x -= (tmp = -2645779978.9461126, tmp));
  assertEquals(369266212, x &= (((335712316.24874604)|(tmp = 33648215, tmp))-((x/(2639848695))<<((-499681175)<<(-2490554556)))));
  assertEquals(-2147483648, x <<= (-834465507));
  assertEquals(1073741824, x >>>= (((tmp = 3018385473.1824775, tmp)>>(x*(-2574502558.216812)))|(((tmp = -1742844828, tmp)*(1698724455))&x)));
  assertEquals(-270818218, x += (-1344560042));
  assertEquals(360710144, x <<= x);
  assertEquals(0, x <<= (tmp = 612718075, tmp));
  assertEquals(0, x <<= x);
  assertEquals(-0, x /= (tmp = -1922423684, tmp));
  assertEquals(-0, x *= ((((tmp = 741806213.3264687, tmp)%(-711184803.2022421))+((tmp = -3209040938, tmp)&(525355849.044886)))&(x<<(tmp = -698610297, tmp))));
  assertEquals(0, x <<= (-482471790));
  assertEquals(0, x &= ((-921538707)/(tmp = -482498765.988616, tmp)));
  assertEquals(0, x ^= (x^x));
  assertEquals(-351721702, x ^= (-351721702.8850286));
  assertEquals(726242219625599900, x -= ((2064820612)*x));
  assertEquals(1452484439251199700, x += x);
  assertEquals(2.52318299412847e-15, x %= ((((x<<((2508143285)+x))>>(-2493225905.011774))%(1867009511.0792103))/((((x<<(2542171236))>>((x|x)&(tmp = -384528563, tmp)))+((-1168755343)*(1731980691.6745195)))+(tmp = -1608066022.71164, tmp))));
  assertEquals(79905008, x += ((((-2702081714.590131)&(x+(tmp = -1254725471.2121565, tmp)))*(3088309981))%(((tmp = 1476844981.1453142, tmp)|((((tmp = -1243556934.7291331, tmp)%x)^(-1302096154))+((660489180)/(tmp = -681535480.8642154, tmp))))^(tmp = -8410710, tmp))));
  assertEquals(1215822204, x ^= ((-3008054900)>>>(tmp = -1990206464.460693, tmp)));
  assertEquals(-394790532, x |= ((((-1334779133.2038574)+(tmp = -1407958866.832946, tmp))<<(1699208315))-(((x^(x%x))<<(3216443))>>(x+((((2576716374.3081336)|((tmp = 2316167191.348064, tmp)&((51086351.20208645)&((x|(tmp = -357261999, tmp))^(x/x)))))*(-45901631.10155654))*(((-439588079)>>>((-2358959768.7634916)|(1613636894.9373643)))+(((-908627176)<<x)%(x%((-1669567978)>>>((x>>(1289400876))+(tmp = 2726174270, tmp)))))))))));
  assertEquals(-0.17717467607696327, x /= (2228255982.974148));
  assertEquals(-1905616474, x ^= (tmp = 2389350822.851587, tmp));
  assertEquals(-0, x %= x);
  assertEquals(2818124981.508915, x -= (-2818124981.508915));
  assertEquals(-1476842315, x |= x);
  assertEquals(73408564, x &= (-3147390604.3453345));
  assertEquals(70, x >>>= x);
  assertEquals(1, x >>= x);
  assertEquals(3086527319.899181, x *= (3086527319.899181));
  assertEquals(-145, x >>= x);
  assertEquals(-145, x %= (tmp = -2500421077.3982406, tmp));
  assertEquals(-1, x >>= (tmp = -2970678326.712191, tmp));
  assertEquals(-1, x %= ((tmp = -535932632.4668834, tmp)+(((-1226598339.347982)<<((tmp = 616949449, tmp)/(tmp = 2779464046, tmp)))/(214578501.67984307))));
  assertEquals(1, x *= x);
  assertEquals(1, x >>= ((tmp = 11080208, tmp)<<(460763913)));
  assertEquals(-1.8406600706723492e-19, x /= ((tmp = -2334126306.1720915, tmp)*(tmp = 2327566272.5901165, tmp)));
  assertEquals(856681434186007200, x -= ((tmp = -2286974992.8133907, tmp)*(374591518)));
  assertEquals(3126084224, x >>>= x);
  assertEquals(-1160460669, x |= (tmp = 181716099, tmp));
  assertEquals(873988096, x <<= (tmp = 406702419, tmp));
  assertEquals(0, x <<= ((tmp = 802107965.4672925, tmp)-((tmp = 1644174603, tmp)>>((tmp = 604679952, tmp)+(tmp = -515450096.51425123, tmp)))));
  assertEquals(NaN, x %= ((x>>(tmp = 2245570378, tmp))*(tmp = 1547616585, tmp)));
  assertEquals(NaN, x /= ((tmp = -776657947.0382309, tmp)&(tmp = 163929332.28270507, tmp)));
  assertEquals(NaN, x *= (tmp = 243725679.78916526, tmp));
  assertEquals(NaN, x /= (x>>x));
  assertEquals(0, x <<= ((tmp = -1293291295.5735884, tmp)%(((((63309078)>>>x)&(x&(-2835108260.025297)))+x)>>>(-1317213424))));
  assertEquals(0, x *= ((((tmp = -1140319441.0068483, tmp)*(tmp = 2102496185, tmp))&(-2326380427))<<(tmp = -2765904696, tmp)));
  assertEquals(0, x /= (tmp = 2709618593, tmp));
  assertEquals(0, x >>= (-1753085095.7670164));
  assertEquals(1766381484, x |= (-2528585812));
  assertEquals(1766381484, x %= (2735943476.6363373));
  assertEquals(1766381484, x %= (x*(tmp = 2701354268, tmp)));
  assertEquals(-2147483648, x <<= (-323840707.4949653));
  assertEquals(4611686018427388000, x *= (x<<x));
  assertEquals(0, x <<= (3066735113));
  assertEquals(0, x ^= ((((x*x)^(tmp = -2182795086.39927, tmp))<<(x^(tmp = 1661144992.4371827, tmp)))<<((((-2885512572.176741)*(tmp = 609919485, tmp))|(tmp = 929399391.0790694, tmp))>>>((((((((((399048996)>>((-107976581.61751771)>>>x))|(((-1502100015)<<(tmp = -1108852531.9494338, tmp))&(x/(tmp = -3198795871.7239237, tmp))))+((-2627653357)>>x))>>>x)*(1066736757.2718519))%(tmp = 1326732482.201604, tmp))/(tmp = 2513496019.814191, tmp))>>>((1694891519)>>>(-2860217254.378931)))<<(tmp = 31345503, tmp)))));
  assertEquals(0, x ^= (x/((-2556481161)>>>(x/(x%(x&(1302923615.7148068)))))));
  assertEquals(NaN, x /= x);
  assertEquals(NaN, x += (tmp = 846522031, tmp));
  assertEquals(0, x >>= (x+(-1420249556.419045)));
  assertEquals(0, x ^= (((x%(-1807673170))&x)-x));
  assertEquals(-3484.311990686845, x -= ((((((-510347602.0068991)>>>x)<<((tmp = 1647999950, tmp)&(((305407727)>>((1781066601.791009)&x))<<((tmp = -998795238, tmp)%(((x/x)+x)<<(((2586995491.434947)<<x)-((((tmp = 545715607.9395425, tmp)*x)>>>x)>>>(((((2332534960.4595165)^(-3159493972.3695474))<<(tmp = 867030294, tmp))|(2950723135.753855))^(((3150916666)<<x)>>((tmp = 414988690, tmp)|((tmp = -1879594606, tmp)/(tmp = 1485647336.933429, tmp))))))))))))>>(tmp = -2676293177, tmp))%(617312699.1995015))/((((tmp = -1742121185, tmp)^((((x&x)<<(tmp = 698266916, tmp))/(-1860886248))+((-213304430)%((((((-2508973021.1333447)+(tmp = 2678876318.4903, tmp))&(tmp = -43584540, tmp))-x)^(-2251323850.4611115))-x))))>>>(tmp = 2555971284, tmp))%((((tmp = 16925106, tmp)^x)&x)|((x/((x|(tmp = -2787677257.125139, tmp))<<(-853699567)))+(tmp = -1721553520, tmp))))));
  assertEquals(-447873933.26863855, x += (-447870448.9566479));
  assertEquals(200591060101520900, x *= x);
  assertEquals(200591062202483420, x -= (-2100962536));
  assertEquals(-5.261023346568228e+24, x *= ((tmp = -419641692.6377077, tmp)>>(tmp = -224703100, tmp)));
  assertEquals(1269498660, x |= (195756836));
  assertEquals(1269498660, x |= x);
  assertEquals(1269498660, x |= x);
  assertEquals(-37.75978948486164, x /= (((tmp = -595793780, tmp)+((tmp = 2384365752, tmp)>>>(1597707155)))|((968887032)^(tmp = 2417905313.4337964, tmp))));
  assertEquals(-37.75978948486164, x %= (tmp = -1846958365.291661, tmp));
  assertEquals(1102319266.6421175, x += (1102319304.401907));
  assertEquals(-1664202255175155200, x -= ((x^(tmp = 407408729, tmp))*x));
  assertEquals(-752874653, x ^= (tmp = 314673507, tmp));
  assertEquals(-72474761, x |= (tmp = -2538726025.8884344, tmp));
  assertEquals(-72474761, x |= x);
  assertEquals(-122849418, x += ((tmp = -2332080457, tmp)|(((((30496388.145492196)*(((-1654329438.451212)|(-2205923896))&(x>>(tmp = -1179784444.957002, tmp))))&(tmp = 319312118, tmp))*(651650825))|(((-2305190283)|x)>>>(-428229803)))));
  assertEquals(994, x >>>= x);
  assertEquals(614292, x *= (((((2565736877)/((tmp = 649009094, tmp)>>>(((x>>>(2208471260))>>(x>>>x))%x)))&(tmp = 357846438, tmp))<<(tmp = -2175355851, tmp))%x));
  assertEquals(1792008118, x |= (tmp = 1791924774.5121183, tmp));
  assertEquals(1246238208, x &= (tmp = 1264064009.9569638, tmp));
  assertEquals(-88877082, x ^= (2969289190.285704));
  assertEquals(0.044923746573582474, x /= ((tmp = -3057438043, tmp)^(-1009304907)));
  assertEquals(0, x <<= ((-828383918)-((((x>>(734512101))*(tmp = -3108890379, tmp))-(x|((tmp = 3081370585.3127823, tmp)^((-271087194)-(x/(tmp = -2777995324.4073873, tmp))))))%x)));
  assertEquals(1604111507.3365753, x -= (-1604111507.3365753));
  assertEquals(-1721314970, x ^= (tmp = -956686859, tmp));
  assertEquals(-102247425, x |= (tmp = -2535095555, tmp));
  assertEquals(-102247425, x %= (-955423877));
  assertEquals(1053144489850425, x *= (((tmp = 1583243590.9550207, tmp)&(1356978114.8592746))|(tmp = -10299961.622774363, tmp)));
  assertEquals(-0.0043728190668037336, x /= ((-1196259252.435701)*(((-689529982)|(tmp = -1698518652.4373918, tmp))<<x)));
  assertEquals(-2, x ^= (((x+(tmp = 2961627388, tmp))>>(tmp = 231666110.84104693, tmp))|x));
  assertEquals(-1, x >>= (tmp = -83214419.92958307, tmp));
  assertEquals(-1, x %= (-1303878209.6288595));
  assertEquals(2944850457.5213213, x -= (tmp = -2944850458.5213213, tmp));
  assertEquals(-1.6607884436053055, x /= (-1773164107));
  assertEquals(-0.6607884436053055, x %= ((x>>(1240245489.8629928))%(tmp = -3044136221, tmp)));
  assertEquals(-0, x *= ((x*x)>>>((1069542313.7656753)+x)));
  assertEquals(0, x >>>= (tmp = -202931587.00212693, tmp));
  assertEquals(-0, x *= (-375274420));
  assertEquals(0, x |= ((x/(((tmp = -876417141, tmp)*(x>>>x))&(-2406962078)))<<x));
  assertEquals(0, x &= ((tmp = -650283599.0780096, tmp)*(tmp = 513255913.34108484, tmp)));
  assertEquals(3027255453.458466, x += (3027255453.458466));
  assertEquals(-12568623413253943000, x *= (((x-(198689694.92141533))|x)-x));
  assertEquals(-12568623410285185000, x -= (tmp = -2968758030.3694654, tmp));
  assertEquals(-2008903680, x &= (3111621747.7679076));
  assertEquals(-110045263.26583672, x += (tmp = 1898858416.7341633, tmp));
  assertEquals(15964, x >>>= (1141042034));
  assertEquals(31928, x += x);
  assertEquals(0, x ^= x);
  assertEquals(-1159866377, x |= (-1159866377));
  assertEquals(0, x ^= x);
  assertEquals(3072699529.4306993, x -= (tmp = -3072699529.4306993, tmp));
  assertEquals(1, x /= x);
  assertEquals(-1471195029, x |= (2823772267.429641));
  assertEquals(-4152937108, x += (-2681742079));
  assertEquals(142030188, x |= x);
  assertEquals(270, x >>= (tmp = 1013826483, tmp));
  assertEquals(0, x >>>= (529670686));
  assertEquals(-2912300367, x -= (2912300367));
  assertEquals(2213791134963007500, x *= (x<<((((-3214746140)>>(tmp = -588929463, tmp))+((tmp = -3084290306, tmp)>>x))>>x)));
  assertEquals(2213791133466809900, x -= (tmp = 1496197641, tmp));
  assertEquals(69834416, x >>>= (x|(((2755815509.6323137)^(x%(((x*((((tmp = 375453453, tmp)<<(x*x))>>(tmp = -973199642, tmp))*x))>>((tmp = -356288629, tmp)>>(tmp = 2879464644, tmp)))<<((((1353647167.9291127)>>>(x/x))<<((2919449101)/(2954998123.5529594)))^x))))&((-2317273650)>>>(tmp = 34560010.71060455, tmp)))));
  assertEquals(69834416, x >>>= (x^(-2117657680.8646245)));
  assertEquals(2217318064, x -= ((tmp = 2035883891, tmp)<<(tmp = -1884739265, tmp)));
  assertEquals(-1272875686, x ^= (tmp = 805889002.7165648, tmp));
  assertEquals(-1272875686, x >>= (x&(((1750455903)*x)>>((722098015)%((tmp = 1605335626, tmp)>>(tmp = -565369634, tmp))))));
  assertEquals(-1274351316, x -= (x>>>((tmp = 2382002632, tmp)-((tmp = -2355012843, tmp)+(1465018311.6735773)))));
  assertEquals(-2982908522.4418216, x -= ((tmp = 1635549038.4418216, tmp)+(((1952167017.720186)&((tmp = -2284822073.1002254, tmp)>>(-1403893917)))%(tmp = 655347757, tmp))));
  assertEquals(312, x >>>= x);
  assertEquals(1248, x <<= (2376583906));
  assertEquals(0, x ^= x);
  assertEquals(0, x *= ((((tmp = 1914053541.881434, tmp)>>>(tmp = 1583032186, tmp))>>>(-2511688231))%(tmp = -2647173031, tmp)));
  assertEquals(0, x >>>= (tmp = -2320612994.2421227, tmp));
  assertEquals(0, x %= (((x+(tmp = -720216298.5403998, tmp))<<(414712685))>>(tmp = 480416588, tmp)));
  assertEquals(0, x >>= ((((3039442014.271272)<<x)%(-2402430612.9724464))&((-2141451461.3664773)%((x>>(1361764256))/((tmp = -1723952801.9320493, tmp)%(477351810.2485285))))));
  assertEquals(-0, x /= (tmp = -1627035877, tmp));
  assertEquals(0, x >>>= (tmp = 1745193212, tmp));
  assertEquals(0, x >>>= (2309131575));
  assertEquals(NaN, x %= (((x*(tmp = -1730907131.6124666, tmp))%((((1481750041)|(x>>((((x>>>(tmp = 3128156522.5936565, tmp))/(tmp = -1277222645.9880452, tmp))^(tmp = -2327254789, tmp))+x)))>>>(-1161176960))>>>(tmp = 3135906272.5466847, tmp)))*(((((-2230902834.464362)^(1822893689.8183987))+(((tmp = 1597326356, tmp)/(x&((tmp = -3044163063.587389, tmp)>>(tmp = 2844997555, tmp))))%(x^x)))>>((x|x)/x))^(2634614167.2529745))));
  assertEquals(0, x &= (3081901595));
  assertEquals(0, x &= (-2453019214.8914948));
  assertEquals(0, x &= x);
  assertEquals(0, x >>>= (-596810618.3666217));
  assertEquals(0, x >>= (((908276623)|x)/x));
  assertEquals(0, x ^= x);
  assertEquals(958890056, x |= (tmp = 958890056.474458, tmp));
  assertEquals(1325436928, x <<= (tmp = -2474326583, tmp));
  assertEquals(711588532333838300, x *= ((-148161646.68183947)<<(tmp = -1149179108.8049204, tmp)));
  assertEquals(0, x ^= (((2862565506)%x)/(tmp = -2865813112, tmp)));
  assertEquals(-2064806628, x += (((tmp = -2677361175.7317276, tmp)/((817159440)>>>(tmp = 1895467706, tmp)))^(x|(tmp = -2309094859, tmp))));
  assertEquals(-69806982479424, x *= ((x&(tmp = 2857559765.1909904, tmp))&(-3166908966.754988)));
  assertEquals(-430255744, x %= ((((((-2968574724.119535)<<x)<<((tmp = 1603913671, tmp)%((-1495838556.661653)^(tmp = 1778219751, tmp))))*(-400364265))<<((((1607866371.235576)-(1961740136))|(1259754297))&(tmp = -1018024797.1352971, tmp)))^x));
  assertEquals(6.828637393208647e-7, x /= (x*(tmp = 1464421, tmp)));
  assertEquals(0, x &= x);
  assertEquals(-0, x *= (((tmp = -2510016276, tmp)-(2088209546))<<((tmp = -1609442851.3789036, tmp)+(tmp = 1919930212, tmp))));
  assertEquals(-0, x %= (tmp = 1965117998, tmp));
  assertEquals(-290294792.53186846, x += ((tmp = -2361555894.5318685, tmp)%(2071261102)));
  assertEquals(-70873, x >>= (tmp = 2206814124, tmp));
  assertEquals(-141746, x += x);
  assertEquals(-141733.9831459089, x -= (((tmp = -806523527, tmp)>>>(tmp = 1897214891, tmp))/x));
  assertEquals(-141733.9831459089, x %= ((tmp = 1996295696, tmp)<<(tmp = 3124244672, tmp)));
  assertEquals(141733.9831459089, x /= (x>>(2688555704.561076)));
  assertEquals(3196954517.3075542, x -= (tmp = -3196812783.3244085, tmp));
  assertEquals(-19929155, x |= (((x|x)+x)^((tmp = 391754876, tmp)-(((((((tmp = -3051902902.5100636, tmp)*(x/(1546924993)))|(tmp = 1494375949, tmp))/((((-795378522)/(tmp = 509984856, tmp))>>>(tmp = -106173186, tmp))+x))|x)|(1916921307))>>>x))));
  assertEquals(1279271449, x &= ((tmp = 1289446971, tmp)&(tmp = 1836102619, tmp)));
  assertEquals(17876992, x <<= (-207633461));
  assertEquals(0, x >>= (tmp = -903885218.9406946, tmp));
  assertEquals(0, x >>>= x);
  assertEquals(-2999, x -= (((754533336.2183633)%(tmp = 557970276.0537136, tmp))>>(tmp = -1171045520, tmp)));
  assertEquals(-0.000003020470363504361, x /= (tmp = 992891715.2229724, tmp));
  assertEquals(1, x /= x);
  assertEquals(0.45768595820301217, x %= ((tmp = 673779031, tmp)/(tmp = -1242414872.3263657, tmp)));
  assertEquals(-980843052.1872087, x += (tmp = -980843052.6448946, tmp));
  assertEquals(-Infinity, x /= ((((tmp = 317747175.8024508, tmp)&(x&(((tmp = 1632953053, tmp)>>x)/x)))%x)/(3145184986)));
  assertEquals(0, x &= (x<<x));
  assertEquals(0, x ^= (x-((2969023660.5619783)/x)));
  assertEquals(0, x *= x);
  assertEquals(NaN, x %= (x/(((x-x)/((tmp = -1622970458.3812745, tmp)-(1626134522)))&((((((tmp = 1384729039.4149384, tmp)^(x%(tmp = -2736365959, tmp)))+((-1465172172)%x))>>(tmp = -1839184810.2603343, tmp))^(((tmp = 1756918419, tmp)>>>(x+(x%(tmp = -2011122996.9794662, tmp))))<<(-3026600748.902623)))*((tmp = -2040286580, tmp)>>(-2899217430.655154))))));
  assertEquals(0, x >>>= (tmp = 2100066003.3046467, tmp));
  assertEquals(1362012169, x ^= (tmp = 1362012169, tmp));
  assertEquals(1476312683, x |= ((457898409)>>>(-3079768830.723079)));
  assertEquals(1441711, x >>>= (905040778.7770994));
  assertEquals(2078530607521, x *= x);
  assertEquals(-208193103, x |= ((tmp = -241750000, tmp)^x));
  assertEquals(745036378, x ^= (((tmp = -1737151062.4726632, tmp)<<x)|(tmp = -1900321813, tmp)));
  assertEquals(1744830464, x <<= x);
  assertEquals(212992, x >>>= ((1210741037)-(x-(x>>>((x^(-1273817997.0036907))+((2401915056.5471)%(x<<(tmp = 1696738364.277438, tmp))))))));
  assertEquals(0.0001604311565639742, x /= (1327622418));
  assertEquals(0, x <<= (tmp = 166631979.34529006, tmp));
  assertEquals(0, x *= ((((tmp = 657814984, tmp)/(((-831055031)>>>(1531978379.1768064))|((tmp = 2470027754.302619, tmp)^(-223467597))))/(tmp = 1678697269.468965, tmp))&(tmp = -1756260071.4360774, tmp)));
  assertEquals(-2049375053, x ^= (tmp = -2049375053, tmp));
  assertEquals(-1879109889, x |= (tmp = -1963586818.0436726, tmp));
  assertEquals(718239919, x ^= (tmp = -1523550640.1925273, tmp));
  assertEquals(-1361085185, x |= (-1939964707));
  assertEquals(2, x >>>= (1864136030.7395325));
  assertEquals(0.794648722849246, x %= ((-668830999)*(((-2227700170.7193384)%(x^(x>>>x)))/(tmp = 399149892, tmp))));
  assertEquals(0, x >>= x);
  assertEquals(0, x *= x);
  assertEquals(0, x &= ((tmp = -2389008496.5948563, tmp)|((((tmp = -2635919193.905919, tmp)*((-64464127)<<(2136112830.1317358)))>>((184057979)*(-1204959085.8362718)))>>>(-442946870.3341484))));
  assertEquals(-243793920, x -= ((tmp = 3002998032, tmp)<<((537875759)<<x)));
  assertEquals(0, x -= x);
  assertEquals(0, x *= ((((66852616.82442963)/((((x^x)&(2975318321.223734))+(((tmp = -1388210811.1249495, tmp)^((((-680567297.7620237)%(x-(tmp = -672906716.4672911, tmp)))-x)*(tmp = -1452125821.0132627, tmp)))*(((2770387154.5427895)%x)%x)))-x))<<((-1481832432.924325)>>(tmp = 3109693867, tmp)))>>>(x/(((((((tmp = 928294418, tmp)^(((-1018314535)/(tmp = -3167523001, tmp))%((((((tmp = -1639338126, tmp)-(tmp = -2613558829, tmp))&x)/x)%(tmp = 513624872, tmp))/((-520660667)&x))))*(2620452414))^((tmp = 2337189239.5949326, tmp)*(3200887846.7954993)))>>>((tmp = 1173330667, tmp)^x))<<x)>>(((tmp = -2475534594.982338, tmp)*x)|x)))));
  assertEquals(0, x /= (2520915286));
  assertEquals(0, x &= x);
  assertEquals(0, x >>= (-1908119327));
  assertEquals(0, x >>>= (tmp = 549007635, tmp));
  assertEquals(0, x >>= (-994747873.8117285));
  assertEquals(0, x <<= ((((x>>>((-3084793026.846681)%((1107295502)&(tmp = -296613957.8133817, tmp))))&((19637717.166736007)/(x+x)))+x)/(-2479724242)));
  assertEquals(-695401420, x += (-695401420));
  assertEquals(-695401394, x += (x>>>(tmp = 2340097307.6556053, tmp)));
  assertEquals(-555745552, x -= (x|(-483851950.68644)));
  assertEquals(-17825792, x <<= x);
  assertEquals(-17825792, x >>= x);
  assertEquals(-17, x %= ((tmp = 1799361095, tmp)|((x>>(((-1201252592)<<((((543273288)+(-2859945716.606924))*x)<<((-3030193601)<<(3081129914.9217644))))|((1471431587.981769)>>(-246180750))))|(((tmp = -2689251055.1605787, tmp)>>x)&(((2131333169)^x)-((tmp = -951555489, tmp)/x))))));
  assertEquals(-8912896, x <<= (1146444211));
  assertEquals(2854567584, x += (tmp = 2863480480, tmp));
  assertEquals(426232502.24151134, x %= (1214167540.8792443));
  assertEquals(1806802048, x ^= (-2368317898));
  assertEquals(432537600, x <<= (tmp = 2831272652.589364, tmp));
  assertEquals(432537600, x %= (((1713810619.3880467)-x)&((-2853023009.553296)&(tmp = -3158798098.3355417, tmp))));
  assertEquals(-509804066, x += (tmp = -942341666, tmp));
  assertEquals(-509804066, x %= (-732349220));
  assertEquals(259900185710132350, x *= x);
  assertEquals(711598501.7021885, x %= ((tmp = 2020395586.2280731, tmp)-(tmp = 3031459563.1386633, tmp)));
  assertEquals(711598503.0618857, x += ((tmp = 967558548.4141241, tmp)/x));
  assertEquals(711598503, x &= x);
  assertEquals(711598503, x ^= (((((1609355669.1963444)+((((tmp = -2660082403.258437, tmp)+(tmp = -235367868, tmp))&(x/x))*((-2595932186.69466)|((tmp = -3039202860, tmp)<<x))))>>>(-951354869))-((tmp = -691482949.6335375, tmp)/(tmp = -1735502400, tmp)))/(tmp = 798440377, tmp)));
  assertEquals(558262613882868500, x *= (784519095.4299527));
  assertEquals(558262611968479000, x -= ((((tmp = 1039039153.4026555, tmp)/(-3138845051.6240187))*(tmp = 633557994, tmp))&(1981507217)));
  assertEquals(1170427648, x |= ((x>>((((-1086327124)%((tmp = -1818798806.368613, tmp)^(tmp = 2183576654.9959817, tmp)))>>x)&((((((tmp = 1315985464.0330539, tmp)&(2774283689.333836))%x)*((2722693772.8994813)&(tmp = -2720671984.945404, tmp)))^(tmp = -76808019, tmp))<<((tmp = 685037799.2336662, tmp)^((tmp = 1057250849, tmp)&(tmp = 1469205111.2989025, tmp))))))+(x*(((tmp = 448288818.47173154, tmp)-(-2527606231))-((8387088.402292728)>>x)))));
  assertEquals(558, x >>>= (tmp = 2732701109, tmp));
  assertEquals(558, x &= x);
  assertEquals(-0.00015855057024653912, x /= ((x+(((tmp = -1963815633, tmp)-(x>>x))-((x|x)>>x)))/x));
  assertEquals(1.3458861596445712e-13, x /= (-1178038492.4116466));
  assertEquals(0, x <<= (-104550232));
  assertEquals(0, x >>>= (x>>(tmp = -255275244.12613606, tmp)));
  assertEquals(0, x >>= x);
  assertEquals(375, x |= ((1576819294.6991196)>>>(-2570246122)));
  assertEquals(96000, x <<= ((2252913843.0150948)>>>(-49239716)));
  assertEquals(6144000, x <<= ((((tmp = -2478967279, tmp)&((x%((tmp = -1705332610.8018858, tmp)+(x+(tmp = 590766349, tmp))))<<(tmp = 1759375933, tmp)))+(-2024465658.849834))&(1564539207.3650014)));
  assertEquals(-1149239296, x <<= (1862803657.7241006));
  assertEquals(-9, x >>= (((tmp = 463306384.05696774, tmp)^x)|((x>>((((-2098070856.799663)<<((-2054870274.9012866)<<(((-2582579691)/(829257170.0266814))<<(((((tmp = -1753535573.7074275, tmp)<<((x>>(-197886116))%((2487188445)%(tmp = 2465391564.873364, tmp))))&(((tmp = -500069832, tmp)&(tmp = 3016637032, tmp))&((tmp = 2525942628, tmp)|((((-920996215)|x)^((((tmp = -687548533.419106, tmp)&(1423222636.058937))<<((tmp = -1096532228, tmp)>>((((tmp = -3124481449.2740726, tmp)^(tmp = 2724328271.808975, tmp))>>x)*x)))+(-1661789589.5808442)))+(((x*(tmp = -1224371664.9549093, tmp))^((tmp = 3202970043, tmp)^x))/(tmp = 131494054.58501709, tmp))))))|(((tmp = -1654136720, tmp)<<x)>>((1652979932.362416)-(tmp = -863732721, tmp))))^(-113307998)))))^(-90820449.91417909))*((tmp = 641519890, tmp)-((((x<<(tmp = 2349936514.071881, tmp))*(2324420443.587892))^x)%(x<<((tmp = -1838473742, tmp)/(((-3154172718.4274178)-x)+x)))))))|(x>>>((tmp = 2096024376.4308293, tmp)<<x)))));
  assertEquals(81, x *= x);
  assertEquals(81, x &= x);
  assertEquals(81, x %= (tmp = 2223962994, tmp));
  assertEquals(81, x ^= ((x/(((-1606183420.099584)|(-1242175583))&(((x|((tmp = 828718431.3311573, tmp)/(x>>x)))+(((-2207542725.4531174)^(x*x))*(tmp = 551575809.955105, tmp)))/x)))&((x>>x)&x)));
  assertEquals(81, x %= (tmp = 279598358.6976975, tmp));
  assertEquals(101.72338484518858, x -= (((tmp = 2452584495.44003, tmp)%((-1181192721)+(((x>>(((x&x)^x)+((x>>>((x+(-2472793823.57181))/(((2854104951)>>(-1208718359.6554642))>>>(1089411895.694705))))/(x|(-2821482890.1780205)))))^(-1786654551))/(-29404242.70557475))))/(((-4352531)<<((-1227287545)<<x))%(-2558589438))));
  assertEquals(101.72338484518858, x %= (-943645643));
  assertEquals(0, x -= x);
  assertEquals(0, x >>>= (-2440404084));
  assertEquals(0, x >>= (tmp = 1029680958.405923, tmp));
  assertEquals(0, x >>>= (1213820208.7204895));
  assertEquals(-0, x /= (tmp = -103093683, tmp));
  assertEquals(0, x >>>= (-2098144813));
  assertEquals(-0, x /= (((-3087283334)+(((tmp = -3129028112.6859293, tmp)%(tmp = 2413829931.1605015, tmp))-(2578195237.8071446)))|x));
  assertEquals(-15, x |= ((((-178926550.92823577)>>>(-965071271))^((tmp = -484633724.7237625, tmp)-(tmp = 473098919.1486404, tmp)))>>((-2264998310.203265)%(tmp = -499034672, tmp))));
  assertEquals(0, x ^= x);
  assertEquals(0, x >>= (((-3207915976.698118)<<(tmp = 2347058630, tmp))|(tmp = -2396250098.559627, tmp)));
  assertEquals(NaN, x %= x);
  assertEquals(NaN, x *= (621843222));
  assertEquals(0, x >>= (((-2409032228.7238913)*x)-(tmp = -887793239, tmp)));
  assertEquals(NaN, x /= x);
  assertEquals(1193017666, x ^= (tmp = 1193017666, tmp));
  assertEquals(3.5844761899682753, x /= (tmp = 332829011.206393, tmp));
  assertEquals(-888572929, x |= (((tmp = 1032409228, tmp)+(tmp = -1920982163.7853453, tmp))+x));
  assertEquals(-1817051951333455600, x *= (((-1506265102)^(tmp = -775881816, tmp))-(tmp = -32116372.59181881, tmp)));
  assertEquals(-1638479616, x |= x);
  assertEquals(-114489, x %= (((tmp = -247137297.37866855, tmp)>>>((((((-322805409)-x)^x)>>((((((((x>>>(tmp = -900610424.7148039, tmp))/(-1155208489.6240904))|((-2874045803)|(tmp = 3050499811, tmp)))+(x/((tmp = -613902712, tmp)^((-982142626.2892077)*((((tmp = -3201753245.6026397, tmp)|((1739238762.0423079)^x))/(243217629.47237313))^((tmp = -11944405.987132788, tmp)/(tmp = 2054031985.633406, tmp)))))))*(tmp = 2696108952.450961, tmp))*x)>>>(tmp = 3058430643.0660386, tmp))>>(x<<x)))>>(-984468302.7450335))%((tmp = 1302320585.246251, tmp)>>>x)))%(tmp = -2436842285.8208156, tmp)));
  assertEquals(2047, x >>>= (2380161237));
  assertEquals(0, x >>= x);
  assertEquals(0, x &= (tmp = 980821012.975836, tmp));
  assertEquals(-1090535537, x -= ((-3064511503.1214876)&((tmp = -2598316939.163751, tmp)<<((tmp = -969452391.8925576, tmp)*x))));
  assertEquals(-2181071074, x += x);
  assertEquals(1, x >>>= ((2902525386.449062)>>x));
  assertEquals(1, x += (x&(tmp = -2643758684.6636515, tmp)));
  assertEquals(1, x %= ((tmp = -2646526891.7004848, tmp)/x));
  assertEquals(448735695.7888887, x -= (tmp = -448735694.7888887, tmp));
  assertEquals(1, x /= x);
  assertEquals(1, x >>= ((-480385726)<<(2641021142)));
  assertEquals(1, x %= (375099107.9200462));
  assertEquals(1, x >>= (((x&((tmp = -2402469116.9903326, tmp)%(tmp = -2862459555.860298, tmp)))*(tmp = -2834162871.0586414, tmp))%(((x>>>(tmp = 721589907.5073895, tmp))*(x^x))%(((tmp = 2844611489.231776, tmp)^((983556913)&(906035409.6693488)))^(x>>>(1239322375))))));
  assertEquals(268435456, x <<= (tmp = 178807644.80966163, tmp));
  assertEquals(44, x %= ((tmp = 2527026779.081539, tmp)>>>(2736129559)));
  assertEquals(88, x += x);
  assertEquals(0, x >>>= x);
  assertEquals(0, x -= x);
  assertEquals(-1523121602, x |= (2771845694));
  assertEquals(-2, x >>= x);
  assertEquals(-4, x += x);
  assertEquals(-256, x <<= (((2522793132.8616533)>>(tmp = 77232772.94058788, tmp))+(3118669244.49152)));
  assertEquals(4294967040, x >>>= x);
  assertEquals(-256, x &= x);
  assertEquals(1278370155.835435, x -= (-1278370411.835435));
  assertEquals(-3.488228054921667, x /= (tmp = -366481243.6881058, tmp));
  assertEquals(1.162742684973889, x /= ((x|(((((2404819175.562809)*(tmp = -2524589506, tmp))&(tmp = -675727145, tmp))>>>(x*x))&((-413250006)<<(tmp = 2408322715, tmp))))|((2940367603)>>>x)));
  assertEquals(0, x >>>= ((2513665793)-(tmp = 1249857454.3367786, tmp)));
  assertEquals(0, x ^= x);
  assertEquals(0, x ^= x);
  assertEquals(1989998348.6336238, x -= (-1989998348.6336238));
  assertEquals(903237918.986834, x %= (1086760429.6467898));
  assertEquals(-4.4185765232981975, x /= (-204418304));
  assertEquals(1471621914, x ^= (tmp = -1471621914.1771696, tmp));
  assertEquals(1471621914, x |= ((((((x<<(tmp = -2676407394.536844, tmp))%(((343324258)+(x/(x>>(((-221193011)>>>x)|x))))>>(((-2737713893)^((tmp = -49214797.00735545, tmp)+((-2818106123.172874)/(tmp = -2361786565.3028684, tmp))))<<(1859353297.6355076))))*(tmp = -751970685, tmp))|((tmp = 2502717391.425871, tmp)/(tmp = -2647169430, tmp)))*((tmp = -1647567294, tmp)&(((tmp = 1819557651, tmp)/x)>>((((-3073469753)/x)-(((tmp = -1973810496.6407511, tmp)&((x-(x+(tmp = -2986851659, tmp)))>>>(tmp = -2226975699, tmp)))|(418770782.142766)))<<x))))*(((((tmp = 125466732, tmp)/((((1453655756.398259)|(((874792086.7064595)-(194880772.91499102))>>>x))%(x<<(tmp = -1445557137, tmp)))<<x))>>>(tmp = -1953751906, tmp))/((tmp = -2140573172.2979035, tmp)*((-108581964)^x)))|(-481484013.0393069))));
  assertEquals(1454179065, x += ((tmp = 947147038.2829313, tmp)|(tmp = -154822975.3629098, tmp)));
  assertEquals(1, x /= x);
  assertEquals(1, x %= ((((((tmp = -2262250297.991866, tmp)-(tmp = 481953960, tmp))/(1629215187.6020458))|(2515244216))>>>((tmp = -3040594752.2184515, tmp)-(tmp = -1116041279, tmp)))^(((-182133502)-(1065160192.6609197))+(((((-1850040207)^(tmp = -1570328610, tmp))^(tmp = 20542725.09256518, tmp))*x)|(2386866629)))));
  assertEquals(1, x &= (2889186303));
  assertEquals(0, x >>= (((-1323093107.050538)>>(x%x))-(((((((-1736522840)+(tmp = -2623890690.8318863, tmp))*(959395040.5565329))*(233734920))<<((x+(x%((tmp = -2370717284.4370327, tmp)%(tmp = 2109311949, tmp))))-(tmp = -1005532894, tmp)))|(861703605))>>>((2399820772)/x))));
  assertEquals(0, x >>= x);
  assertEquals(57233408, x |= ((tmp = 2655923764.4179816, tmp)*(-1353634624.3025436)));
  assertEquals(997939728, x |= (980552208.9005274));
  assertEquals(1859642592476610800, x *= (1863481872));
  assertEquals(-977190656, x <<= x);
  assertEquals(4.378357529141239e+26, x *= ((((x/(((tmp = 2429520991, tmp)/(x/(tmp = 784592802, tmp)))-(tmp = -2704781982, tmp)))*(tmp = -2161015768.2322354, tmp))&((((-3164868762)>>(tmp = 2390893153.32907, tmp))^x)>>(-2422626718.322538)))*(tmp = 278291869, tmp)));
  assertEquals(4.378357529141239e+26, x -= (1710777896.992369));
  assertEquals(0, x &= (((((tmp = -2532956158.400033, tmp)|((2195255831.279001)|(1051047432)))|(-1628591858))|(tmp = -2042607521.947963, tmp))>>((-1471225208)/(((-133621318)>>(1980416325.7358408))*((1741069593.1036062)-(x|(2133911581.991011)))))));
  assertEquals(-0, x /= (-656083507));
  assertEquals(NaN, x += ((tmp = -1071410982.2789869, tmp)%x));
  assertEquals(NaN, x *= (tmp = -1513535145.3146675, tmp));
  assertEquals(0, x >>= ((2831245247.5267224)>>(x<<((x+(((3068824580.7922907)|(1708295544.275714))*((tmp = -1662930228.1170444, tmp)-(((tmp = 1979994889, tmp)<<(tmp = -1826911988, tmp))&((x/(x<<(1909384611.043981)))+(1958052414.7139997))))))<<(tmp = 2481909816.56558, tmp)))));
  assertEquals(0, x *= (((tmp = -2979739958.1614842, tmp)&x)+x));
  assertEquals(-0, x *= ((-332769864.50313234)^x));
  assertEquals(0, x >>= ((((689018886.1436445)+(tmp = -2819546038.620694, tmp))|(((tmp = -1459669934.9066005, tmp)|x)/x))<<(((tmp = 2640360389, tmp)/((x%((-1947492547.9056122)%((1487212416.2083092)-(-1751984129))))^x))%(tmp = 2666842881, tmp))));
  assertEquals(-1801321460, x |= (tmp = 2493645836, tmp));
  assertEquals(-1801321460, x %= (2400405136));
  assertEquals(-2905399858195810300, x *= (tmp = 1612926911, tmp));
  assertEquals(-2905399858195810300, x -= (x>>(tmp = 1603910263.9593458, tmp)));
  assertEquals(-238798848, x &= ((tmp = -2638646212.767516, tmp)/(((tmp = 1755616291.436998, tmp)>>>(tmp = 1083349775, tmp))-(x%(((tmp = 1728859105.53634, tmp)^(1931522619.0403612))/(tmp = 712460587.0025489, tmp))))));
  assertEquals(-2363873607.2302856, x += (-2125074759.230286));
  assertEquals(1712665, x &= (((117229515)>>>(((1707090894.1915488)>>>((-1696008695)>>(((-1045367326.7522249)<<(tmp = -209334716, tmp))-x)))|(-1707909786.080653)))%(1260761349.172689)));
  assertEquals(1073741824, x <<= (tmp = -289437762.34742975, tmp));
  assertEquals(1073741824, x &= (tmp = 2079141140, tmp));
  assertEquals(0, x <<= ((x^(-3139646716.1615124))-(((-362323071.74237394)|(tmp = 2989896849, tmp))*(tmp = -218217991, tmp))));
  assertEquals(0, x &= (tmp = -1476835288.425903, tmp));
  assertEquals(0, x >>>= (tmp = 61945262.70868635, tmp));
  assertEquals(0, x ^= x);
  assertEquals(-2735263498.7189775, x -= (2735263498.7189775));
  assertEquals(-1182289920, x <<= (x+x));
  assertEquals(-1182289580, x ^= ((2858446263.2258)>>>(2387398039.6273785)));
  assertEquals(696693056, x &= ((2178665823)*(-51848583)));
  assertEquals(1652555776, x <<= (((tmp = 2943916975, tmp)-((-1544273901)>>(-1671503106.2896929)))|x));
  assertEquals(6455296, x >>>= (tmp = 1492638248.675439, tmp));
  assertEquals(2097152, x &= (((x|x)*(2873891571.7000637))^((2165264807)+(tmp = 451721563, tmp))));
  assertEquals(2097152, x %= (tmp = 1089484582.1455994, tmp));
  assertEquals(2097152, x <<= x);
  assertEquals(2097152, x &= ((tmp = 119096343.4032247, tmp)^((-1947874541)*x)));
  assertEquals(0, x &= (tmp = 2363070677, tmp));
  assertEquals(0, x &= ((tmp = -1897325383, tmp)>>>((2368480527)>>>((tmp = 1837528979, tmp)*(-1838904077)))));
  assertEquals(-1898659416, x ^= (-1898659416.1125412));
  assertEquals(-725506048, x <<= x);
  assertEquals(1392943104, x <<= (295287938.9104482));
  assertEquals(-63620329, x ^= ((tmp = -3175925826.5573816, tmp)-(tmp = 2474613927, tmp)));
  assertEquals(-1135111726, x -= ((tmp = -1133259081, tmp)^(((tmp = -742228219, tmp)>>((-7801909.587711811)%((tmp = -642758873, tmp)+(tmp = 2893927824.6036444, tmp))))^((tmp = -2145465178.9142997, tmp)+x))));
  assertEquals(0, x ^= x);
  assertEquals(660714589, x |= (660714589));
  assertEquals(660714676, x ^= ((-376720042.8047826)>>>(2196220344)));
  assertEquals(660714676, x |= ((((((((x<<(-1140465568))-(tmp = -1648489774.1573918, tmp))%(((tmp = -2955505390.573639, tmp)*x)<<((((tmp = -1769375963, tmp)*(tmp = -440619797, tmp))&((tmp = 1904284066, tmp)%(-2420852665.0629807)))+(-324601009.2063596))))>>(tmp = 2317210783.9757776, tmp))^((tmp = 750057067.4541628, tmp)^(tmp = -1391814244.7286487, tmp)))>>((344544658.6054913)%((tmp = -1508630423.218488, tmp)&(tmp = 1918909238.2974637, tmp))))>>((-647746783.685822)&(tmp = 2444858958.3595476, tmp)))&x));
  assertEquals(-962337195, x ^= (tmp = -507358495.30825853, tmp));
  assertEquals(-182008925.58535767, x %= (tmp = -195082067.35366058, tmp));
  assertEquals(502070, x >>>= (tmp = 1459732237.1447744, tmp));
  assertEquals(-2391009930.7235765, x -= (tmp = 2391512000.7235765, tmp));
  assertEquals(1568669696, x <<= x);
  assertEquals(0, x <<= (tmp = -571056688.2717848, tmp));
  assertEquals(1770376226, x ^= (tmp = 1770376226.0584736, tmp));
  assertEquals(0, x ^= x);
  assertEquals(0, x &= ((((x<<x)>>>x)|x)|(((tmp = -2141573723, tmp)^x)|(64299956))));
  assertEquals(0, x ^= x);
  assertEquals(0, x &= x);
  assertEquals(0, x <<= (1106060336.7362857));
  assertEquals(-0, x /= (x|(tmp = 2760823963, tmp)));
  assertEquals(0, x <<= ((-2436225757)|(-1800598694.4062433)));
  assertEquals(0, x >>>= ((-728332508.9870625)<<x));
  assertEquals(-173377680, x ^= ((tmp = -173377680, tmp)%(tmp = -2843994892, tmp)));
  assertEquals(-173377680, x |= ((((-819217898)&(tmp = -1321650255, tmp))&(x+((x^x)<<((1700753064)>>((((((-1038799327)>>((782275464)^x))-(tmp = -2113814317.8539028, tmp))>>(2143804838))&x)-((2970418921)/(-3073015285.6587048)))))))&((-1759593079.4077306)%((1699128805)-((tmp = -467193967, tmp)&(((2225788267.3466334)*(((2687946762.5504274)+x)>>>x))<<(-1853556066.880512)))))));
  assertEquals(-0.5520657226957338, x /= ((tmp = -755493878, tmp)&(tmp = 918108389, tmp)));
  assertEquals(0.30477656217556287, x *= x);
  assertEquals(0, x &= ((tmp = -2746007517, tmp)<<(2749629340)));
  assertEquals(0, x ^= ((x%(tmp = 1683077876, tmp))%(-162706778)));
  assertEquals(0, x *= (tmp = 10203423, tmp));
  assertEquals(119043212.1461842, x += (tmp = 119043212.1461842, tmp));
  assertEquals(587202560, x <<= (tmp = 658697910.7051642, tmp));
  assertEquals(-138689730, x |= (x-(tmp = 1296317634.5661907, tmp)));
  assertEquals(-138663011, x -= ((-1751010109.5506423)>>(152829872)));
  assertEquals(-138663011, x %= (-1266200468));
  assertEquals(-138663011, x &= (x|((tmp = -571277275.622529, tmp)<<x)));
  assertEquals(-138663011, x >>= ((971259905.1265712)*(tmp = 2203764981, tmp)));
  assertEquals(-138663011, x %= (-904715829));
  assertEquals(-138663011, x |= ((tmp = -2823047885.283391, tmp)>>>(((tmp = 533217000, tmp)|(650754598.7836078))|(-1475565890))));
  assertEquals(-1610612736, x <<= x);
  assertEquals(-1610612736, x &= x);
  assertEquals(163840, x >>>= (-188885010));
  assertEquals(-1224224814, x |= (tmp = 3070742482, tmp));
  assertEquals(1498726395213334500, x *= x);
  assertEquals(1723591210, x |= ((tmp = 615164458, tmp)|x));
  assertEquals(1721910480, x ^= (x>>>x));
  assertEquals(4505284605.764313, x -= (tmp = -2783374125.7643127, tmp));
  assertEquals(-9504912393868483000, x *= (((tmp = 2896651872, tmp)<<(-2896385692.9017262))&(((((tmp = -2081179810.20238, tmp)|(tmp = -2484863999, tmp))>>((tmp = 1560885110.2665749, tmp)/(((tmp = 934324123.4289343, tmp)<<((tmp = -1591614157.0496385, tmp)+x))/(((x%(((tmp = 1672629986.8055913, tmp)%x)>>(tmp = 2116315086.2559657, tmp)))/(((-2687682697.5806303)>>x)/(-2034391222.5029132)))%(x-((((((tmp = 2598594967, tmp)/(((((((2950032233)%x)/x)^(tmp = -2126753451.3732262, tmp))<<(tmp = -3019113473, tmp))+(tmp = -2021220129.2320697, tmp))%((((-587645875.4666483)>>(((((x+x)+x)&(tmp = 533801785, tmp))|x)-((tmp = -2224808495.678903, tmp)/(1501942300))))>>>(-2558947646))>>((2798508249.020792)>>>x))))>>>((1060584557)/((((((((x&x)|(1426725365))>>>(tmp = 1500508838, tmp))>>(-1328705938))*((tmp = -2288009425.598777, tmp)>>>(((2586897285.9759064)%((-1605651559.2122297)>>>(tmp = 1936736684.4887302, tmp)))+((tmp = 2316261040, tmp)^(570340750.353874)))))&(x^((tmp = -2266524143, tmp)-(tmp = 2358520476, tmp))))+(tmp = 1449254900.9222453, tmp))%((-100598196)%((tmp = -2985318242.153491, tmp)>>((620722274.4565848)>>(871118975)))))))<<x)*(tmp = -1287065606.4143271, tmp))>>>(1038059916.2438471)))))))+((x/(-276990308.1264961))&(tmp = 2471016351.2195315, tmp)))|(((((tmp = -1288792769.3210807, tmp)+((tmp = -641817194, tmp)*(x<<(((-1933817364)>>(((tmp = 2084673536, tmp)|x)&x))&(tmp = -2752464480, tmp)))))%((796026752)*x))+(((tmp = -3083359669, tmp)|x)-((715303522)|(tmp = 181297266, tmp))))*(-1691520182.3207517)))));
  assertEquals(0, x <<= (-2322389800));
  assertEquals(0, x *= (tmp = 3188682235, tmp));
  assertEquals(0, x |= (x>>>((tmp = -2729325231.8288336, tmp)^((-393497076.96012783)*(x/(tmp = -2198942459.9466457, tmp))))));
  assertEquals(0, x ^= x);
  assertEquals(0, x %= (2835024997.4447937));
  assertEquals(0, x <<= x);
  assertEquals(0, x >>= (tmp = 1109824126, tmp));
  assertEquals(0, x <<= (3013043386));
  assertEquals(206825782.74659085, x -= (-206825782.74659085));
  assertEquals(-645346761227699500, x *= (-3120243292));
  assertEquals(6825462, x >>= ((tmp = 1457908135, tmp)<<x));
  assertEquals(-612366097.9189918, x -= (619191559.9189918));
  assertEquals(-612306090.9189918, x -= ((2328676543.893506)>>x));
  assertEquals(0, x ^= (x>>(((x>>>(1856200611.2269292))&(tmp = 2003217473, tmp))%((((((-107135673)+(((3062079356.170611)<<(tmp = -676928983, tmp))>>((tmp = -1487074941.2638814, tmp)|((-1601614031)/(1317006144.5025365)))))+x)*(((1163301641)>>>(448796567))/((x%((tmp = 72293197.34410787, tmp)+(-2304112723)))/((455610361)%(-2799431520)))))>>>(-217305041.09432888))<<(x-(tmp = -2168353649, tmp))))));
  assertEquals(0, x >>= x);
  assertEquals(-Infinity, x -= (((-1651597599.8950624)+(1780404320))/x));
  assertEquals(0, x <<= (tmp = 2246420272.4321294, tmp));
  assertEquals(0, x *= ((2793605382)-(tmp = -272299011, tmp)));
  assertEquals(0, x *= x);
  assertEquals(0, x <<= x);
  assertEquals(0, x >>= (tmp = 2556413090, tmp));
  assertEquals(0, x >>= ((tmp = -1784710085, tmp)%x));
  assertEquals(0, x %= (tmp = -1929880813, tmp));
  assertEquals(0, x *= (2586983368));
  assertEquals(0, x &= x);
  assertEquals(0, x <<= (-2144588807));
  assertEquals(0, x ^= ((x<<(((((((-596537598)+((x-(((((((tmp = -3179604796, tmp)/((tmp = 1156725365.3543215, tmp)>>>(tmp = -2762144319, tmp)))%(x<<x))&((tmp = 1750241928.1271567, tmp)&(x/((tmp = 1781306819, tmp)|x))))+((((2893068644)/((tmp = -576164593.9720252, tmp)<<((2724671.48995471)&(tmp = -573132475, tmp))))%(tmp = -1355625108, tmp))&(tmp = -302869512.5880568, tmp)))+x)<<x))>>((tmp = -2569172808, tmp)/x)))^x)-(tmp = -1174006275.2213159, tmp))&x)&(((((((-2303274799)>>(tmp = -814839320, tmp))/(tmp = 183887306.09810615, tmp))>>(((tmp = 1054106394.3704875, tmp)|x)>>>x))-(x-(tmp = 1313696830, tmp)))-((tmp = 2373274399.0742035, tmp)|((((tmp = -3163779539.4902935, tmp)*(tmp = -3056125181.726942, tmp))&(((x^(x^(x/((tmp = -576441696.6015451, tmp)<<(tmp = -26223719.920306206, tmp)))))>>(tmp = -2332835940, tmp))|((-146303509.41093707)&(tmp = -2676964025, tmp))))/((((x*(tmp = 1059918020, tmp))|((((2341797349)|(tmp = -744763805.1381104, tmp))<<x)+((2991320875.552578)^(2920702604.701831))))^(-1721756138))^(((tmp = -2794367554, tmp)>>((-2671235923.2097874)<<(x&((((tmp = -621472314.0859051, tmp)-(((x*x)+x)>>>((tmp = 1834038956, tmp)+x)))*x)^(tmp = -2090567586.321468, tmp)))))<<(321395210))))))>>>(tmp = -1207661719, tmp)))+(-2877264053.3805156)))/(x%(tmp = -2226991657.709366, tmp))));
  assertEquals(0, x *= (tmp = 986904991.061398, tmp));
  assertEquals(0, x -= (x%(650819306.6671969)));
  assertEquals(0, x >>>= (905893666.2871252));
  assertEquals(0, x += (((tmp = 2501942710.4804144, tmp)&x)/((tmp = -851080399.1751502, tmp)-(-1168623992))));
  assertEquals(-0, x *= (tmp = -2014577821.4554045, tmp));
  assertEquals(0, x &= (tmp = 1995246018, tmp));
  assertEquals(0, x %= (1724355237.7031958));
  assertEquals(-954696411, x += (((-2825222201)+(((1662353496.1795506)>>>(x-x))|(tmp = 225015046, tmp)))^(x&x)));
  assertEquals(-2158427339993389800, x *= (2260852052.1539803));
  assertEquals(19559, x >>>= (-862409169.4978967));
  assertEquals(-0.000012241163878671237, x /= (x^(tmp = 2697144215.160239, tmp)));
  assertEquals(0, x -= x);
  assertEquals(1448177644, x |= (tmp = 1448177644.624848, tmp));
  assertEquals(1448177644, x %= (((-1497553637.4976408)+(402228446))<<x));
  assertEquals(2304640553, x -= (-856462909));
  assertEquals(152436736, x &= ((766686903)*(((tmp = 660964683.1744609, tmp)|((((tmp = 297369746, tmp)-(x+((tmp = -2677127146, tmp)/x)))>>(((((((x%(x<<x))-(((((529254728)|((x|(-1407086127.6088922))&(tmp = -1968465008.5000398, tmp)))/(x%x))&((((-2761805265.92574)-x)*(x^(tmp = 110730179, tmp)))%((177220657.06030762)*(((2532585190.671373)/x)+(-1465143151)))))<<((tmp = -3008848338, tmp)<<(-2475597073))))|((-192996756.38619018)|((((1445996780)|(x>>>((((tmp = -2482370545.791443, tmp)*(tmp = -270543594, tmp))^x)*((1346780586)/(tmp = -625613363.885356, tmp)))))-(x<<(x/(-562307527))))&(-125701272))))*((x&x)%(tmp = 752963070, tmp)))>>>(tmp = 17419750.79086232, tmp))*x)^(x^((-157821212.04674292)-(tmp = 503849221.598824, tmp)))))-(tmp = 1479418449, tmp)))>>>((((((-78138548.2193842)<<(((2319032860.806689)-(tmp = -1564963892.5137577, tmp))>>>(-73673322.28957987)))<<((1797573493.3467085)*x))>>(tmp = 759994997, tmp))>>>(-1066441220))&(((((((tmp = 1972048857, tmp)*(((x&((-1347017320.0747669)>>>x))*(-2332716925.705054))%(-376976019.24362826)))>>>((tmp = -466479974, tmp)+x))&(-2282789473.3675604))|(((((((((269205423.7510414)-(tmp = 21919626.105656862, tmp))*((x-(tmp = -378670528, tmp))>>(tmp = -1045706598, tmp)))>>(tmp = -3062647341.234485, tmp))>>>x)|(tmp = -285399599.9386575, tmp))%(tmp = 2731214562, tmp))|((((tmp = 837093165.3438574, tmp)|(tmp = -2956931321, tmp))+((1871874558.3292787)<<((x|((tmp = -3169147427, tmp)%(((x^x)%(1479885041))%((1769991217)%(tmp = -1899472458, tmp)))))*(tmp = -837098563.71806, tmp))))>>(tmp = -1866722748, tmp)))-(2037734340.8345597)))>>((tmp = -1262019180.5332131, tmp)+(x*(1274173993.9800131))))*(tmp = 2336989321.855402, tmp))))));
  assertEquals(4, x >>= (tmp = -2577728327, tmp));
  assertEquals(16, x *= (x<<((2622323372.580596)*(tmp = -1947643367, tmp))));
  assertEquals(33554432, x <<= (tmp = -2938370507, tmp));
  assertEquals(-2399497018.987414, x -= (tmp = 2433051450.987414, tmp));
  assertEquals(1, x /= x);
  assertEquals(2, x <<= x);
  assertEquals(0, x >>= (x&x));
  assertEquals(0, x <<= x);
}
f();