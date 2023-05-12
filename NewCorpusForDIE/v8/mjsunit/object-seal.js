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

// Copyright 2010 the V8 project authors. All rights reserved.
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

// Tests the Object.seal and Object.isSealed methods - ES 19.1.2.17 and
// ES 19.1.2.13

// Flags: --allow-natives-syntax --turbofan --noalways-turbofan

// Test that we return obj if non-object is passed as argument
var non_objects = new Array(undefined, null, 1, -1, 0, 42.43, Symbol("test"));
for (var key in non_objects) {
  assertSame(non_objects[key], Object.seal(non_objects[key]));
}

// Test that isSealed always returns true for non-objects
for (var key in non_objects) {
  assertTrue(Object.isSealed(non_objects[key]));
}

// Test normal data properties.
var obj = { x: 42, z: 'foobar' };
var desc = Object.getOwnPropertyDescriptor(obj, 'x');
assertTrue(desc.writable);
assertTrue(desc.configurable);
assertEquals(42, desc.value);

desc = Object.getOwnPropertyDescriptor(obj, 'z');
assertTrue(desc.writable);
assertTrue(desc.configurable);
assertEquals('foobar', desc.value);

assertTrue(Object.isExtensible(obj));
assertFalse(Object.isSealed(obj));

Object.seal(obj);

// Make sure we are no longer extensible.
assertFalse(Object.isExtensible(obj));
assertTrue(Object.isSealed(obj));

// We should not be frozen, since we are still able to
// update values.
assertFalse(Object.isFrozen(obj));

// We should not allow new properties to be added.
obj.foo = 42;
assertEquals(obj.foo, undefined);

desc = Object.getOwnPropertyDescriptor(obj, 'x');
assertTrue(desc.writable);
assertFalse(desc.configurable);
assertEquals(42, desc.value);

desc = Object.getOwnPropertyDescriptor(obj, 'z');
assertTrue(desc.writable);
assertFalse(desc.configurable);
assertEquals("foobar", desc.value);

// Since writable is not affected by seal we should still be able to
// update the values.
obj.x = "43";
assertEquals("43", obj.x);

// Test on accessors.
var obj2 = {};
function get() { return 43; };
function set() {};
Object.defineProperty(obj2, 'x', { get: get, set: set, configurable: true });

desc = Object.getOwnPropertyDescriptor(obj2, 'x');
assertTrue(desc.configurable);
assertEquals(undefined, desc.value);
assertEquals(set, desc.set);
assertEquals(get, desc.get);

assertTrue(Object.isExtensible(obj2));
assertFalse(Object.isSealed(obj2));
Object.seal(obj2);

// Since this is an accessor property the object is now effectively both
// sealed and frozen (accessors has no writable attribute).
assertTrue(Object.isFrozen(obj2));
assertFalse(Object.isExtensible(obj2));
assertTrue(Object.isSealed(obj2));

desc = Object.getOwnPropertyDescriptor(obj2, 'x');
assertFalse(desc.configurable);
assertEquals(undefined, desc.value);
assertEquals(set, desc.set);
assertEquals(get, desc.get);

obj2.foo = 42;
assertEquals(obj2.foo, undefined);

// Test seal on arrays.
var arr = new Array(42,43);

desc = Object.getOwnPropertyDescriptor(arr, '0');
assertTrue(desc.configurable);
assertTrue(desc.writable);
assertEquals(42, desc.value);

desc = Object.getOwnPropertyDescriptor(arr, '1');
assertTrue(desc.configurable);
assertTrue(desc.writable);
assertEquals(43, desc.value);

assertTrue(Object.isExtensible(arr));
assertFalse(Object.isSealed(arr));
Object.seal(arr);
assertTrue(Object.isSealed(arr));
assertFalse(Object.isExtensible(arr));
// Since the values in the array is still writable this object
// is not frozen.
assertFalse(Object.isFrozen(arr));

desc = Object.getOwnPropertyDescriptor(arr, '0');
assertFalse(desc.configurable);
assertTrue(desc.writable);
assertEquals(42, desc.value);

desc = Object.getOwnPropertyDescriptor(arr, '1');
assertFalse(desc.configurable);
assertTrue(desc.writable);
assertEquals(43, desc.value);

arr[0] = 'foo';

// We should be able to overwrite the existing value.
assertEquals('foo', arr[0]);

// Test that isSealed returns the correct value even if configurable
// has been set to false on all properties manually and the extensible
// flag has also been set to false manually.
var obj3 = { x: 42, y: 'foo' };

assertFalse(Object.isFrozen(obj3));

Object.defineProperty(obj3, 'x', {configurable: false, writable: true});
Object.defineProperty(obj3, 'y', {configurable: false, writable: false});
Object.preventExtensions(obj3);

assertTrue(Object.isSealed(obj3));


// Make sure that an object that has a configurable property
// is not classified as sealed.
var obj4 = {};
Object.defineProperty(obj4, 'x', {configurable: true, writable: false});
Object.defineProperty(obj4, 'y', {configurable: false, writable: false});
Object.preventExtensions(obj4);

assertFalse(Object.isSealed(obj4));

// Make sure that Object.seal returns the sealed object.
var obj4 = {};
assertTrue(obj4 === Object.seal(obj4));

//
// Test that built-in array functions can't modify a sealed array.
//
obj = [1, 2, 3];
var objControl = [4, 5, 6];

// Allow these functions to set up monomorphic calls, using custom built-ins.
var push_call = function(a) { a.push(10); return a; }
var pop_call = function(a) { return a.pop(); }
for (var i = 0; i < 3; i++) {
  push_call(obj);
  pop_call(obj);
}

Object.seal(obj);
assertThrows(function() { push_call(obj); }, TypeError);
assertThrows(function() { pop_call(obj); }, TypeError);

// But the control object is fine at these sites.
assertDoesNotThrow(function() { push_call(objControl); });
assertDoesNotThrow(function() { pop_call(objControl); });

assertDoesNotThrow(function() { obj.push(); });
assertThrows(function() { obj.push(3); }, TypeError);
assertThrows(function() { obj.pop(); }, TypeError);
assertThrows(function() { obj.shift(3); }, TypeError);
assertDoesNotThrow(function() { obj.unshift(); });
assertThrows(function() { obj.unshift(1); }, TypeError);
assertThrows(function() { obj.splice(0, 0, 100, 101, 102); }, TypeError);
assertDoesNotThrow(function() { obj.splice(0,0); });

assertDoesNotThrow(function() { objControl.push(3); });
assertDoesNotThrow(function() { objControl.pop(); });
assertDoesNotThrow(function() { objControl.shift(3); });
assertDoesNotThrow(function() { objControl.unshift(); });
assertDoesNotThrow(function() { objControl.splice(0, 0, 100, 101, 102); });

// Verify that crankshaft still does the right thing.
obj = [1, 2, 3];

push_call = function(a) { a.push(1000); return a; };
%PrepareFunctionForOptimization(push_call);
// Include a call site that doesn't have a custom built-in.
var shift_call = function(a) { a.shift(1000); return a; };
%PrepareFunctionForOptimization(shift_call);
for (var i = 0; i < 3; i++) {
  push_call(obj);
  shift_call(obj);
}

%OptimizeFunctionOnNextCall(push_call);
%OptimizeFunctionOnNextCall(shift_call);
push_call(obj);
shift_call(obj);
assertOptimized(push_call);
assertOptimized(shift_call);
Object.seal(obj);
assertThrows(function() { push_call(obj); }, TypeError);
assertThrows(function() { shift_call(obj); }, TypeError);
assertUnoptimized(push_call);
assertUnoptimized(shift_call);
assertDoesNotThrow(function() { push_call(objControl); });
assertDoesNotThrow(function() { shift_call(objControl); });

// Verify special behavior of splice on sealed objects.
obj = [1,2,3];
Object.seal(obj);
assertDoesNotThrow(function() { obj.splice(0,1,100); });
assertEquals(100, obj[0]);
assertDoesNotThrow(function() { obj.splice(0,2,1,2); });
assertDoesNotThrow(function() { obj.splice(1,2,1,2); });
// Count of items to delete is clamped by length.
assertDoesNotThrow(function() { obj.splice(1,2000,1,2); });
assertThrows(function() { obj.splice(0,0,1); }, TypeError);
assertThrows(function() { obj.splice(1,2000,1,2,3); }, TypeError);

// Test that the enumerable attribute is unperturbed by sealing.
obj = { x: 42, y: 'foo' };
Object.defineProperty(obj, 'y', {enumerable: false});
Object.seal(obj);
assertTrue(Object.isSealed(obj));
assertFalse(Object.isFrozen(obj));
desc = Object.getOwnPropertyDescriptor(obj, 'x');
assertTrue(desc.enumerable);
desc = Object.getOwnPropertyDescriptor(obj, 'y');
assertFalse(desc.enumerable);

// Fast properties should remain fast
obj = { x: 42, y: 'foo' };
assertTrue(%HasFastProperties(obj));
Object.seal(obj);
assertTrue(Object.isSealed(obj));
assertFalse(Object.isFrozen(obj));
assertTrue(%HasFastProperties(obj));

// Sealed objects should share maps where possible
obj = { prop1: 1, prop2: 2 };
obj2 = { prop1: 3, prop2: 4 };
assertTrue(%HaveSameMap(obj, obj2));
Object.seal(obj);
Object.seal(obj2);
assertTrue(Object.isSealed(obj));
assertTrue(Object.isSealed(obj2));
assertFalse(Object.isFrozen(obj));
assertFalse(Object.isFrozen(obj2));
assertTrue(%HaveSameMap(obj, obj2));

// Sealed objects should share maps even when they have elements
obj = { prop1: 1, prop2: 2, 75: 'foo' };
obj2 = { prop1: 3, prop2: 4, 150: 'bar' };
assertTrue(%HaveSameMap(obj, obj2));
Object.seal(obj);
Object.seal(obj2);
assertTrue(Object.isSealed(obj));
assertTrue(Object.isSealed(obj2));
assertFalse(Object.isFrozen(obj));
assertFalse(Object.isFrozen(obj));
assertTrue(%HaveSameMap(obj, obj2));

// Setting elements after sealing should not be allowed
obj = { prop: 'thing' };
Object.seal(obj);
assertTrue(Object.isSealed(obj));
assertFalse(Object.isFrozen(obj));
obj[0] = 'hello';
assertFalse(obj.hasOwnProperty(0));

// Sealing an object in dictionary mode should work
// Also testing that getter/setter properties work after sealing
obj = { };
for (var i = 0; i < 100; ++i) {
  obj['x' + i] = i;
}
var accessorDidRun = false;
Object.defineProperty(obj, 'accessor', {
  get: function() { return 42 },
  set: function() { accessorDidRun = true },
  configurable: true,
  enumerable: true
});

assertFalse(%HasFastProperties(obj));
Object.seal(obj);
assertFalse(%HasFastProperties(obj));
assertTrue(Object.isSealed(obj));
assertFalse(Object.isFrozen(obj));
assertFalse(Object.isExtensible(obj));
for (var i = 0; i < 100; ++i) {
  desc = Object.getOwnPropertyDescriptor(obj, 'x' + i);
  assertFalse(desc.configurable);
}
assertEquals(42, obj.accessor);
assertFalse(accessorDidRun);
obj.accessor = 'ignored value';
assertTrue(accessorDidRun);

// Sealing arguments should work
var func = function(arg) {
  Object.seal(arguments);
  assertTrue(Object.isSealed(arguments));
};
func('hello', 'world');
func('goodbye', 'world');

// Sealing sparse arrays
var sparseArr = [0, 1];
sparseArr[10000] = 10000;
Object.seal(sparseArr);
assertTrue(Object.isSealed(sparseArr));

// Accessors on fast object should behavior properly after sealing
obj = {};
Object.defineProperty(obj, 'accessor', {
  get: function() { return 42 },
  set: function() { accessorDidRun = true },
  configurable: true,
  enumerable: true
});
assertTrue(%HasFastProperties(obj));
Object.seal(obj);
assertTrue(Object.isSealed(obj));
assertTrue(%HasFastProperties(obj));
assertEquals(42, obj.accessor);
accessorDidRun = false;
obj.accessor = 'ignored value';
assertTrue(accessorDidRun);

// Test for regression in mixed accessor/data property objects.
// The strict function is one such object.
assertTrue(Object.isSealed(Object.seal(function(){"use strict";})));

// Also test a simpler case
obj = {};
Object.defineProperty(obj, 'accessor2', {
  get: function() { return 42 },
  set: function() { accessorDidRun = true },
  configurable: true,
  enumerable: true
});
obj.data = 'foo';
assertTrue(%HasFastProperties(obj));
Object.seal(obj);
assertTrue(%HasFastProperties(obj));
assertTrue(Object.isSealed(obj));

function Sealed() {}
Object.seal(Sealed);
assertDoesNotThrow(function() { return new Sealed(); });
Sealed.prototype.prototypeExists = true;
assertTrue((new Sealed()).prototypeExists);

obj = new Int32Array(10);
Object.seal(obj);
assertTrue(Object.isSealed(obj));

// Test packed element array built-in functions with seal.
function testPackedSealedArray1(obj) {
  assertTrue(Object.isSealed(obj));
  assertFalse(Object.isFrozen(obj));
  assertTrue(Array.isArray(obj));

  // Verify that the length can't be written by builtins.
  assertThrows(function() { obj.pop(); }, TypeError);
  assertThrows(function() { obj.push(1); }, TypeError);
  assertThrows(function() { obj.shift(); }, TypeError);
  assertThrows(function() { obj.unshift(1); }, TypeError);
  assertThrows(function() { obj.splice(0); }, TypeError);
  assertDoesNotThrow(function() { obj.splice(0, 0); });

  // Verify search, filter, iterator
  obj = new Array(undefined, null, 1, -1, 'a', Symbol("test"));
  assertTrue(%HasPackedElements(obj));
  Object.seal(obj);
  assertTrue(Object.isSealed(obj));
  assertFalse(Object.isFrozen(obj));
  assertTrue(Array.isArray(obj));
  assertEquals(obj.lastIndexOf(1), 2);
  assertEquals(obj.indexOf('a'), 4);
  assertEquals(obj.indexOf(undefined), 0);
  assertFalse(obj.includes(Symbol("test")));
  assertTrue(obj.includes(undefined));
  assertFalse(obj.includes(NaN));
  assertTrue(obj.includes());
  assertEquals(obj.find(x => x==0), undefined);
  assertEquals(obj.findIndex(x => x=='a'), 4);
  assertTrue(obj.some(x => typeof x == 'symbol'));
  assertFalse(obj.every(x => x == -1));
  var filteredArray = obj.filter(e => typeof e == "symbol");
  assertEquals(filteredArray.length, 1);
  assertEquals(obj.map(x => x), obj);
  var countPositiveNumber = 0;
  obj.forEach(function(item, index) {
    if (item === 1) {
      countPositiveNumber++;
      assertEquals(index, 2);
    }
  });
  assertEquals(countPositiveNumber, 1);
  assertEquals(obj.length, obj.concat([]).length);
  var iterator = obj.values();
  assertEquals(iterator.next().value, undefined);
  assertEquals(iterator.next().value, null);
  var iterator = obj.keys();
  assertEquals(iterator.next().value, 0);
  assertEquals(iterator.next().value, 1);
  var iterator = obj.entries();
  assertEquals(iterator.next().value, [0, undefined]);
  assertEquals(iterator.next().value, [1, null]);

  // Verify that the value can be written
  var length = obj.length;
  for (var i = 0; i < length-1; i++) {
    obj[i] = 'new';
    assertEquals(obj[i], 'new');
  }
};
obj = new Array(undefined, null, 1, -1, 'a', Symbol("test"));
assertTrue(%HasPackedElements(obj));
Object.seal(obj);
testPackedSealedArray1(obj);

// Verify after transition from preventExtensions
obj = new Array(undefined, null, 1, -1, 'a', Symbol("test"));
assertTrue(%HasPackedElements(obj));
Object.preventExtensions(obj);
Object.seal(obj);
testPackedSealedArray1(obj);

// Verify flat, map, slice, flatMap, join, reduce, reduceRight for sealed packed array
function testPackedSealedArray2(arr) {
  assertTrue(Object.isSealed(arr));
  assertFalse(Object.isFrozen(arr));
  assertEquals(arr.map(x => [x]), [['a'], ['b'], ['c']]);
  assertEquals(arr.flatMap(x => [x]), arr);
  assertEquals(arr.flat(), arr);
  assertEquals(arr.join('-'), "a-b-c");
  const reducer = (accumulator, currentValue) => accumulator + currentValue;
  assertEquals(arr.reduce(reducer), "abc");
  assertEquals(arr.reduceRight(reducer), "cba");
  assertEquals(arr.slice(0, 1), ['a']);
  // Verify change content of sealed packed array
  arr.sort();
  assertEquals(arr.join(''), "abc");
  arr.reverse();
  assertEquals(arr.join(''), "cba");
  arr.copyWithin(0, 1, 2);
  assertEquals(arr.join(''),"bba");
  arr.fill('d');
  assertEquals(arr.join(''), "ddd");
}

var arr1 = new Array('a', 'b', 'c');
assertTrue(%HasPackedElements(arr1));
Object.seal(arr1);
testPackedSealedArray2(arr1);

var arr2 = new Array('a', 'b', 'c');
assertTrue(%HasPackedElements(arr2));
Object.preventExtensions(arr2);
Object.seal(arr2);
testPackedSealedArray2(arr2);

// Test regression with Object.defineProperty
var obj = [];
obj.propertyA = 42;
obj[0] = true;
Object.seal(obj);
assertDoesNotThrow(function() {
  Object.defineProperty(obj, 'propertyA', {
    value: obj,
  });
});
assertEquals(obj, obj.propertyA);
assertDoesNotThrow(function() {
  Object.defineProperty(obj, 'propertyA', {
    value: obj,
    writable: false,
  });
});
obj.propertyA = 42;
assertEquals(obj, obj.propertyA);
assertThrows(function() {
  Object.defineProperty(obj, 'abc', {
    value: obj,
  });
}, TypeError);

// Regression test with simple array
var arr = ['a'];
Object.seal(arr);
arr[0] = 'b';
assertEquals(arr[0], 'b');

// Test regression Array.concat with double
var arr = ['a'];
Object.seal(arr);
arr = arr.concat(0.5);
assertEquals(arr, ['a', 0.5]);
Object.seal(arr);
arr = arr.concat([1.5, 'b']);
assertEquals(arr, ['a', 0.5, 1.5, 'b']);

// Regression test with change length
var arr = ['a', 'b'];
Object.seal(arr);
assertEquals(arr.length, 2);
arr.length = 3;
assertEquals(arr.length, 3);
arr[2] = 'c';
assertEquals(arr[2], undefined);
arr.length = 1;
assertEquals(arr.length, 2);

// Start testing for holey element array
// Test holey element array built-in functions with seal.
function testHoleySealedArray1(obj) {
  assertTrue(Object.isSealed(obj));
  assertFalse(Object.isFrozen(obj));
  assertTrue(Array.isArray(obj));

  // Verify that the length can't be written by builtins.
  assertThrows(function() { obj.pop(); }, TypeError);
  assertThrows(function() { obj.push(1); }, TypeError);
  assertThrows(function() { obj.shift(); }, TypeError);
  assertThrows(function() { obj.unshift(1); }, TypeError);
  assertThrows(function() { obj.splice(0); }, TypeError);
  assertDoesNotThrow(function() { obj.splice(0, 0); });

  // Verify search, filter, iterator
  obj = [undefined, null, 1, , -1, 'a', Symbol("test")];
  assertTrue(%HasHoleyElements(obj));
  Object.seal(obj);
  assertTrue(Object.isSealed(obj));
  assertFalse(Object.isFrozen(obj));
  assertTrue(Array.isArray(obj));
  assertEquals(obj.lastIndexOf(1), 2);
  assertEquals(obj.indexOf('a'), 5);
  assertEquals(obj.indexOf(undefined), 0);
  assertFalse(obj.includes(Symbol("test")));
  assertTrue(obj.includes(undefined));
  assertFalse(obj.includes(NaN));
  assertTrue(obj.includes());
  assertEquals(obj.find(x => x==0), undefined);
  assertEquals(obj.findIndex(x => x=='a'), 5);
  assertTrue(obj.some(x => typeof x == 'symbol'));
  assertFalse(obj.every(x => x == -1));
  var filteredArray = obj.filter(e => typeof e == "symbol");
  assertEquals(filteredArray.length, 1);
  assertEquals(obj.map(x => x), obj);
  var countPositiveNumber = 0;
  obj.forEach(function(item, index) {
    if (item === 1) {
      countPositiveNumber++;
      assertEquals(index, 2);
    }
  });
  assertEquals(countPositiveNumber, 1);
  assertEquals(obj.length, obj.concat([]).length);
  var iterator = obj.values();
  assertEquals(iterator.next().value, undefined);
  assertEquals(iterator.next().value, null);
  var iterator = obj.keys();
  assertEquals(iterator.next().value, 0);
  assertEquals(iterator.next().value, 1);
  var iterator = obj.entries();
  assertEquals(iterator.next().value, [0, undefined]);
  assertEquals(iterator.next().value, [1, null]);

  // Verify that the value can be written
  var length = obj.length;
  for (var i = 0; i < length; i++) {
    if (i==3) continue;
    obj[i] = 'new';
    assertEquals(obj[i], 'new');
  }
};
obj = [undefined, null, 1, , -1, 'a', Symbol("test")];
assertTrue(%HasHoleyElements(obj));
Object.seal(obj);
testHoleySealedArray1(obj);

// Verify after transition from preventExtensions
obj = [undefined, null, 1, , -1, 'a', Symbol("test")];
assertTrue(%HasHoleyElements(obj));
Object.preventExtensions(obj);
Object.seal(obj);
testHoleySealedArray1(obj);

// Verify flat, map, slice, flatMap, join, reduce, reduceRight for sealed holey array
function testHoleySealedArray2(arr) {
  assertTrue(Object.isSealed(arr));
  assertFalse(Object.isFrozen(arr));
  assertEquals(arr.map(x => [x]), [, ['a'], ['b'], ['c']]);
  assertEquals(arr.flatMap(x => [x]), ["a", "b", "c"]);
  assertEquals(arr.flat(), ["a", "b", "c"]);
  assertEquals(arr.join('-'), "-a-b-c");
  const reducer = (accumulator, currentValue) => accumulator + currentValue;
  assertEquals(arr.reduce(reducer), "abc");
  assertEquals(arr.reduceRight(reducer), "cba");
  assertEquals(arr.slice(0, 1), [,]);
  assertEquals(arr.slice(1, 2), ["a"]);
  // Verify change content of sealed holey array
  assertThrows(function(){arr.sort();}, TypeError);
  assertEquals(arr.join(''), "abc");
  assertThrows(function(){arr.reverse();}, TypeError);
  assertEquals(arr.join(''), "abc");
  assertThrows(function(){arr.copyWithin(0, 1, 2);}, TypeError);
  assertEquals(arr.join(''),"abc");
  arr.copyWithin(1, 2, 3);
  assertEquals(arr.join(''),"bbc");
  assertThrows(function(){arr.fill('d');}, TypeError);
  assertEquals(arr.join(''), "bbc");
}

var arr1 = [, 'a', 'b', 'c'];
assertTrue(%HasHoleyElements(arr1));
Object.seal(arr1);
testHoleySealedArray2(arr1);

var arr2 = [, 'a', 'b', 'c'];
assertTrue(%HasHoleyElements(arr2));
Object.preventExtensions(arr2);
Object.seal(arr2);
testHoleySealedArray2(arr2);

// Test regression with Object.defineProperty
var obj = ['a', , 'b'];
obj.propertyA = 42;
obj[0] = true;
Object.seal(obj);
assertDoesNotThrow(function() {
  Object.defineProperty(obj, 'propertyA', {
    value: obj,
  });
});
assertEquals(obj, obj.propertyA);
assertDoesNotThrow(function() {
  Object.defineProperty(obj, 'propertyA', {
    value: obj,
    writable: false,
  });
});
obj.propertyA = 42;
assertEquals(obj, obj.propertyA);
assertThrows(function() {
  Object.defineProperty(obj, 'abc', {
    value: obj,
  });
}, TypeError);

// Regression test with simple holey array
var arr = [, 'a'];
Object.seal(arr);
arr[1] = 'b';
assertEquals(arr[1], 'b');
arr[0] = 1;
assertEquals(arr[0], undefined);

// Test regression Array.concat with double
var arr = ['a', , 'b'];
Object.seal(arr);
arr = arr.concat(0.5);
assertEquals(arr, ['a', ,'b', 0.5]);
Object.seal(arr);
arr = arr.concat([1.5, 'c']);
assertEquals(arr, ['a', ,'b', 0.5, 1.5, 'c']);

// Regression test with change length
var arr = ['a', ,'b'];
Object.seal(arr);
assertEquals(arr.length, 3);
arr.length = 4;
assertEquals(arr.length, 4);
arr[3] = 'c';
assertEquals(arr[3], undefined);
arr.length = 2;
assertEquals(arr.length, 3);

// Change length with holey entries at the end
var arr = ['a', ,];
Object.seal(arr);
assertEquals(arr.length, 2);
arr.length = 0;
assertEquals(arr.length, 1);
arr.length = 3;
assertEquals(arr.length, 3);
arr.length = 0;
assertEquals(arr.length, 1);

// Spread with array
var arr = ['a', 'b', 'c'];
Object.seal(arr);
var arrSpread = [...arr];
assertEquals(arrSpread.length, arr.length);
assertEquals(arrSpread[0], 'a');
assertEquals(arrSpread[1], 'b');
assertEquals(arrSpread[2], 'c');

// Spread with array-like
function returnArgs() {
  return Object.seal(arguments);
}
var arrLike = returnArgs('a', 'b', 'c');
assertTrue(Object.isSealed(arrLike));
var arrSpread = [...arrLike];
assertEquals(arrSpread.length, arrLike.length);
assertEquals(arrSpread[0], 'a');
assertEquals(arrSpread[1], 'b');
assertEquals(arrSpread[2], 'c');

// Spread with holey
function countArgs() {
  return arguments.length;
}
var arr = [, 'b','c'];
Object.seal(arr);
assertEquals(countArgs(...arr), 3);
assertEquals(countArgs(...[...arr]), 3);
assertEquals(countArgs.apply(this, [...arr]), 3);
function checkUndefined() {
  return arguments[0] === undefined;
}
assertTrue(checkUndefined(...arr));
assertTrue(checkUndefined(...[...arr]));
assertTrue(checkUndefined.apply(this, [...arr]));

//
// Array.prototype.map
//
(function() {
  var a = Object.seal(['0','1','2','3','4']);

  // Simple use.
  var result = [1,2,3,4,5];
  assertArrayEquals(result, a.map(function(n) { return Number(n) + 1; }));

  // Use specified object as this object when calling the function.
  var o = { delta: 42 }
  result = [42,43,44,45,46];
  assertArrayEquals(result, a.map(function(n) { return this.delta + Number(n); }, o));

  // Modify original array.
  b = Object.seal(['0','1','2','3','4']);
  result = [1,2,3,4,5];
  assertArrayEquals(result,
      b.map(function(n, index, array) {
        array[index] = Number(n) + 1; return Number(n) + 1;
      }));
  assertArrayEquals(b, result);

  // Only loop through initial part of array and elements are not
  // added.
  a = Object.seal(['0','1','2','3','4']);
  result = [1,2,3,4,5];
  assertArrayEquals(result,
      a.map(function(n, index, array) { assertThrows(() => { array.push(n) }); return Number(n) + 1; }));
  assertArrayEquals(['0','1','2','3','4'], a);

  // Respect holes.
  a = new Array(20);
  a[1] = '2';
  Object.seal(a);
  a = Object.seal(a).map(function(n) { return 2*Number(n); });

  for (var i in a) {
    assertEquals(4, a[i]);
    assertEquals('1', i);
  }

  // Skip over missing properties.
  a = {
    "0": 1,
    "2": 2,
    length: 3
  };
  var received = [];
  assertArrayEquals([2, , 4],
      Array.prototype.map.call(Object.seal(a), function(n) {
        received.push(n);
        return n * 2;
      }));
  assertArrayEquals([1, 2], received);

  // Modify array prototype
  a = ['1', , 2];
  received = [];
  assertThrows(() => {
    Array.prototype.map.call(Object.seal(a), function(n) {
      a.__proto__ = null;
      received.push(n);
      return n * 2;
    });
  }, TypeError);
  assertArrayEquals([], received);

  // Create a new object in each function call when receiver is a
  // primitive value. See ECMA-262, Annex C.
  a = [];
  Object.seal(['1', '2']).map(function() { a.push(this) }, "");
  assertTrue(a[0] !== a[1]);

  // Do not create a new object otherwise.
  a = [];
  Object.seal(['1', '2']).map(function() { a.push(this) }, {});
  assertSame(a[0], a[1]);

  // In strict mode primitive values should not be coerced to an object.
  a = [];
  Object.seal(['1', '2']).map(function() { 'use strict'; a.push(this); }, "");
  assertEquals("", a[0]);
  assertEquals(a[0], a[1]);

})();


// Test with double elements
// Test packed element array built-in functions with seal.
function testDoubleSealedArray1(obj) {
  assertTrue(Object.isSealed(obj));
  assertFalse(Object.isFrozen(obj));
  assertTrue(Array.isArray(obj));

  // Verify that the length can't be written by builtins.
  assertThrows(function() { obj.pop(); }, TypeError);
  assertThrows(function() { obj.push(1); }, TypeError);
  assertThrows(function() { obj.shift(); }, TypeError);
  assertThrows(function() { obj.unshift(1); }, TypeError);
  assertThrows(function() { obj.splice(0); }, TypeError);
  assertDoesNotThrow(function() { obj.splice(0, 0); });

  // Verify search, filter, iterator
  assertEquals(obj.lastIndexOf(1), 1);
  assertEquals(obj.indexOf(undefined), -1);
  assertFalse(obj.includes(Symbol("test")));
  assertTrue(obj.includes(1));
  assertTrue(obj.includes(-1.1));
  assertFalse(obj.includes());
  assertEquals(obj.find(x => x==0), undefined);
  assertEquals(obj.findIndex(x => x==2), 3);
  assertFalse(obj.some(x => typeof x == 'symbol'));
  assertFalse(obj.every(x => x == -1));
  var filteredArray = obj.filter(e => typeof e == "symbol");
  assertEquals(filteredArray.length, 0);
  assertEquals(obj.map(x => x), obj);
  var countPositiveNumber = 0;
  obj.forEach(function(item, index) {
    if (item === 1) {
      countPositiveNumber++;
      assertEquals(index, 1);
    }
  });
  assertEquals(countPositiveNumber, 1);
  assertEquals(obj.length, obj.concat([]).length);
  var iterator = obj.values();
  assertEquals(iterator.next().value, -1.1);
  assertEquals(iterator.next().value, 1);
  var iterator = obj.keys();
  assertEquals(iterator.next().value, 0);
  assertEquals(iterator.next().value, 1);
  var iterator = obj.entries();
  assertEquals(iterator.next().value, [0, -1.1]);
  assertEquals(iterator.next().value, [1, 1]);

  // Verify that the value can't be written
  var length = obj.length;
  for (var i = 0; i < length; i++) {
    obj[i] = 'new';
    assertEquals('new', obj[i]);
  }
}

obj = new Array(1.1, -1.1, 1, -1, 2);
assertTrue(%HasDoubleElements(obj));
Object.seal(obj);
testDoubleSealedArray1(obj);

// Verify change from non-extensible to sealed
obj = new Array(1.1, -1.1, 1, -1, 2);
assertTrue(%HasDoubleElements(obj));
Object.preventExtensions(obj);
Object.seal(obj);
assertTrue(Object.isSealed(obj));
testDoubleSealedArray1(obj);

// Verify flat, map, slice, flatMap, join, reduce, reduceRight for sealed packed array
function testDoubleSealedArray2(arr) {
  assertTrue(Object.isSealed(arr));
  assertTrue(Array.isArray(arr));
  assertEquals(arr.map(x => [x]), [[1], [1.1], [0]]);
  assertEquals(arr.flatMap(x => [x]), arr);
  assertEquals(arr.flat(), arr);
  assertEquals(arr.join('-'), "1-1.1-0");
  const reducer = (accumulator, currentValue) => accumulator + currentValue;
  assertEquals(arr.reduce(reducer), 2.1);
  assertEquals(arr.reduceRight(reducer), 2.1);
  assertEquals(arr.slice(0, 1), [1]);
}
var arr1 = new Array(1, 1.1, 0);
assertTrue(%HasDoubleElements(arr1));
Object.seal(arr1);
testDoubleSealedArray2(arr1);

// Verify change from non-extensible to sealed
var arr1 = new Array(1, 1.1, 0);
assertTrue(%HasDoubleElements(arr1));
Object.preventExtensions(arr1);
Object.seal(arr1);
testDoubleSealedArray2(arr1);

// Test regression with Object.defineProperty
var obj = [];
obj.propertyA = 42;
obj[0] = 1.1;
Object.seal(obj);
assertDoesNotThrow(function() {
  Object.defineProperty(obj, 'propertyA', {
    value: obj,
  });
});
assertEquals(obj, obj.propertyA);
assertDoesNotThrow(function() {
  Object.defineProperty(obj, 'propertyA', {
    value: obj,
    writable: false,
  });
});
obj.propertyA = 42;
assertEquals(obj, obj.propertyA);
assertThrows(function() {
  Object.defineProperty(obj, 'abc', {
    value: obj,
  });
}, TypeError);

// Regression test with simple array
var arr = [1.1];
Object.seal(arr);
arr[0] = 1;
assertEquals(arr[0], 1);

// Test regression Array.concat with double
var arr = [1.1];
Object.seal(arr);
arr = arr.concat(0.5);
assertEquals(arr, [1.1, 0.5]);
Object.seal(arr);
arr = arr.concat([1.5, 'b']);
assertEquals(arr, [1.1, 0.5, 1.5, 'b']);

// Regression test with change length
var arr = [1.1, 0];
Object.seal(arr);
assertEquals(arr.length, 2);
arr.length = 3;
assertEquals(arr.length, 3);
arr[2] = 'c';
assertEquals(arr[2], undefined);
arr.length = 1;
assertEquals(arr.length, 2);

// Start testing for holey double element array
// Test holey double element array built-in functions with seal.
function testHoleyDoubleSealedArray1() {
  assertTrue(Object.isSealed(obj));
  assertFalse(Object.isFrozen(obj));
  assertTrue(Array.isArray(obj));

  // Verify that the length can't be written by builtins.
  assertThrows(function() { obj.pop(); }, TypeError);
  assertThrows(function() { obj.push(1); }, TypeError);
  assertThrows(function() { obj.shift(); }, TypeError);
  assertThrows(function() { obj.unshift(1); }, TypeError);
  assertThrows(function() { obj.splice(0); }, TypeError);
  assertDoesNotThrow(function() { obj.splice(0, 0); });

  // Verify search, filter, iterator
  obj = [-1.1, 0, 1, , -1, 1.1];
  assertTrue(%HasHoleyElements(obj));
  Object.seal(obj);
  assertTrue(Object.isSealed(obj));
  assertFalse(Object.isFrozen(obj));
  assertTrue(Array.isArray(obj));
  assertEquals(obj.lastIndexOf(1), 2);
  assertEquals(obj.indexOf(1.1), 5);
  assertEquals(obj.indexOf(undefined), -1);
  assertFalse(obj.includes(Symbol("test")));
  assertTrue(obj.includes(undefined));
  assertFalse(obj.includes(NaN));
  assertTrue(obj.includes());
  assertEquals(obj.find(x => x==0), 0);
  assertEquals(obj.findIndex(x => x==1.1), 5);
  assertFalse(obj.some(x => typeof x == 'symbol'));
  assertFalse(obj.every(x => x == -1));
  var filteredArray = obj.filter(e => typeof e == "symbol");
  assertEquals(filteredArray.length, 0);
  assertEquals(obj.map(x => x), obj);
  var countPositiveNumber = 0;
  obj.forEach(function(item, index) {
    if (item === 1) {
      countPositiveNumber++;
      assertEquals(index, 2);
    }
  });
  assertEquals(countPositiveNumber, 1);
  assertEquals(obj.length, obj.concat([]).length);
  var iterator = obj.values();
  assertEquals(iterator.next().value, -1.1);
  assertEquals(iterator.next().value, 0);
  var iterator = obj.keys();
  assertEquals(iterator.next().value, 0);
  assertEquals(iterator.next().value, 1);
  var iterator = obj.entries();
  assertEquals(iterator.next().value, [0, -1.1]);
  assertEquals(iterator.next().value, [1, 0]);

  // Verify that the value can be written
  var length = obj.length;
  for (var i = 0; i < length; i++) {
    if (i==3) continue;
    obj[i] = 'new';
    assertEquals(obj[i], 'new');
  }
};

obj = [-1.1, 0, 1, , -1, 1.1];
assertTrue(%HasHoleyElements(obj));
Object.seal(obj);
testHoleyDoubleSealedArray1(obj);

// Verify change from non-extensible to sealed
obj = [-1.1, 0, 1, , -1, 1.1];
assertTrue(%HasHoleyElements(obj));
Object.preventExtensions(obj);
Object.seal(obj);
assertTrue(Object.isSealed(obj));
testHoleyDoubleSealedArray1(obj);

// Verify flat, map, slice, flatMap, join, reduce, reduceRight for sealed packed array
function testHoleyDoubleSealedArray2(arr) {
  assertTrue(Object.isSealed(arr));
  assertTrue(Array.isArray(arr));
  assertEquals(arr.map(x => [x]), [, [1.1], [1], [0]]);
  assertEquals(arr.flatMap(x => [x]), [1.1, 1, 0]);
  assertEquals(arr.flat(), [1.1, 1, 0]);
  assertEquals(arr.join('-'), "-1.1-1-0");
  const reducer = (accumulator, currentValue) => accumulator + currentValue;
  assertEquals(arr.reduce(reducer), 2.1);
  assertEquals(arr.reduceRight(reducer), 2.1);
  assertEquals(arr.slice(0, 1), [,]);
  assertEquals(arr.slice(1, 2), [1.1]);
}
var arr1 = [, 1.1, 1, 0];
assertTrue(%HasHoleyElements(arr1));
Object.seal(arr1);
testHoleyDoubleSealedArray2(arr1);

// Verify change from non-extensible to sealed
var arr1 = [, 1.1, 1, 0];
assertTrue(%HasHoleyElements(arr1));
Object.preventExtensions(arr1);
Object.seal(arr1);
testHoleyDoubleSealedArray2(arr1);

// Test regression with Object.defineProperty
var obj = [1.1, , 0];
obj.propertyA = 42;
obj[0] = 1.2;
Object.seal(obj);
assertDoesNotThrow(function() {
  Object.defineProperty(obj, 'propertyA', {
    value: obj,
  });
});
assertEquals(obj, obj.propertyA);
assertDoesNotThrow(function() {
  Object.defineProperty(obj, 'propertyA', {
    value: obj,
    writable: false,
  });
});
obj.propertyA = 42;
assertEquals(obj, obj.propertyA);
assertThrows(function() {
  Object.defineProperty(obj, 'abc', {
    value: obj,
  });
}, TypeError);

// Regression test with simple holey array
var arr = [, 1.1];
Object.seal(arr);
arr[1] = 'b';
assertEquals(arr[1], 'b');
arr[0] = 1;
assertEquals(arr[0], undefined);

// Test regression Array.concat with double
var arr = [1.1, , 0];
Object.seal(arr);
arr = arr.concat(0.5);
assertEquals(arr, [1.1, , 0, 0.5]);
Object.seal(arr);
arr = arr.concat([1.5, 'c']);
assertEquals(arr, [1.1, ,0, 0.5, 1.5, 'c']);

// Regression test with change length
var arr = [1.1, ,0];
Object.seal(arr);
assertEquals(arr.length, 3);
arr.length = 4;
assertEquals(arr.length, 4);
arr[3] = 'c';
assertEquals(arr[2], 0);
assertEquals(arr[3], undefined);
arr.length = 2;
assertEquals(arr.length, 3);

// Change length with holey entries at the end
var arr = [1.1, ,];
Object.seal(arr);
assertEquals(arr.length, 2);
arr.length = 0;
assertEquals(arr.length, 1);
arr.length = 3;
assertEquals(arr.length, 3);
arr.length = 0;
assertEquals(arr.length, 1);

// Spread with array
var arr = [1.1, 0, -1];
Object.seal(arr);
var arrSpread = [...arr];
assertEquals(arrSpread.length, arr.length);
assertEquals(arrSpread[0], 1.1);
assertEquals(arrSpread[1], 0);
assertEquals(arrSpread[2], -1);

// Spread with array-like
function returnArgs() {
  return Object.seal(arguments);
}
var arrLike = returnArgs(1.1, 0, -1);
assertTrue(Object.isSealed(arrLike));
var arrSpread = [...arrLike];
assertEquals(arrSpread.length, arrLike.length);
assertEquals(arrSpread[0], 1.1);
assertEquals(arrSpread[1], 0);
assertEquals(arrSpread[2], -1);

// Spread with holey
function countArgs() {
  return arguments.length;
}
var arr = [, 1.1, 0];
Object.seal(arr);
assertEquals(countArgs(...arr), 3);
assertEquals(countArgs(...[...arr]), 3);
assertEquals(countArgs.apply(this, [...arr]), 3);
function checkUndefined() {
  return arguments[0] === undefined;
}
assertTrue(checkUndefined(...arr));
assertTrue(checkUndefined(...[...arr]));
assertTrue(checkUndefined.apply(this, [...arr]));

//
// Array.prototype.map
//
(function() {
  var a = Object.seal([0.1,1,2,3,4]);

  // Simple use.
  var result = [1.1,2,3,4,5];
  assertArrayEquals(result, a.map(function(n) { return Number(n) + 1; }));

  // Use specified object as this object when calling the function.
  var o = { delta: 42 }
  result = [42.1,43,44,45,46];
  assertArrayEquals(result, a.map(function(n) { return this.delta + Number(n); }, o));

  // Modify original array.
  b = Object.seal([0.1,1,2,3,4]);
  result = [1.1,2,3,4,5];
  assertArrayEquals(result,
      b.map(function(n, index, array) {
        array[index] = Number(n) + 1; return Number(n) + 1;
      }));
  assertArrayEquals(b, result);

  // Only loop through initial part of array and elements are not
  // added.
  a = Object.seal([0.1,1,2,3,4]);
  result = [1.1,2,3,4,5];
  assertArrayEquals(result,
      a.map(function(n, index, array) { assertThrows(() => { array.push(n) }); return Number(n) + 1; }));
  assertArrayEquals([0.1,1,2,3,4], a);

  // Respect holes.
  a = new Array(20);
  a[1] = 1.1;
  Object.seal(a);
  a = Object.seal(a).map(function(n) { return 2*Number(n); });

  for (var i in a) {
    assertEquals(2.2, a[i]);
    assertEquals('1', i);
  }

  // Skip over missing properties.
  a = {
    "0": 1.1,
    "2": 2,
    length: 3
  };
  var received = [];
  assertArrayEquals([2.2, , 4],
      Array.prototype.map.call(Object.seal(a), function(n) {
        received.push(n);
        return n * 2;
      }));
  assertArrayEquals([1.1, 2], received);

  // Modify array prototype
  a = [1.1, , 2];
  received = [];
  assertThrows(() => {
    Array.prototype.map.call(Object.seal(a), function(n) {
      a.__proto__ = null;
      received.push(n);
      return n * 2;
    });
  }, TypeError);
  assertArrayEquals([], received);

  // Create a new object in each function call when receiver is a
  // primitive value. See ECMA-262, Annex C.
  a = [];
  Object.seal([1.1, 2]).map(function() { a.push(this) }, "");
  assertTrue(a[0] !== a[1]);

  // Do not create a new object otherwise.
  a = [];
  Object.seal([1.1, 2]).map(function() { a.push(this) }, {});
  assertSame(a[0], a[1]);

  // In strict mode primitive values should not be coerced to an object.
  a = [];
  Object.seal([1.1, 1.2]).map(function() { 'use strict'; a.push(this); }, "");
  assertEquals("", a[0]);
  assertEquals(a[0], a[1]);

})();