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

function testEscape(str, regex) {
  assertEquals("foo:bar:baz", str.split(regex).join(":"));
}

testEscape("foo\nbar\nbaz", /\n/);
testEscape("foo bar baz", /\s/);
testEscape("foo\tbar\tbaz", /\s/);
testEscape("foo-bar-baz", /\u002D/);

// Test containing null char in regexp.
var s = '[' + String.fromCharCode(0) + ']';
var re = new RegExp(s);
assertEquals(s.match(re).length, 1);
assertEquals(s.match(re)[0], String.fromCharCode(0));

// Test strings containing all line separators
s = 'aA\nbB\rcC\r\ndD\u2028eE\u2029fF';
re = /^./gm; // any non-newline character at the beginning of a line
var result = s.match(re);
assertEquals(result.length, 6);
assertEquals(result[0], 'a');
assertEquals(result[1], 'b');
assertEquals(result[2], 'c');
assertEquals(result[3], 'd');
assertEquals(result[4], 'e');
assertEquals(result[5], 'f');

re = /.$/gm; // any non-newline character at the end of a line
result = s.match(re);
assertEquals(result.length, 6);
assertEquals(result[0], 'A');
assertEquals(result[1], 'B');
assertEquals(result[2], 'C');
assertEquals(result[3], 'D');
assertEquals(result[4], 'E');
assertEquals(result[5], 'F');

re = /^[^]/gm; // *any* character at the beginning of a line
result = s.match(re);
assertEquals(result.length, 7);
assertEquals(result[0], 'a');
assertEquals(result[1], 'b');
assertEquals(result[2], 'c');
assertEquals(result[3], '\n');
assertEquals(result[4], 'd');
assertEquals(result[5], 'e');
assertEquals(result[6], 'f');

re = /[^]$/gm; // *any* character at the end of a line
result = s.match(re);
assertEquals(result.length, 7);
assertEquals(result[0], 'A');
assertEquals(result[1], 'B');
assertEquals(result[2], 'C');
assertEquals(result[3], '\r');
assertEquals(result[4], 'D');
assertEquals(result[5], 'E');
assertEquals(result[6], 'F');

// Some tests from the Mozilla tests, where our behavior used to differ from
// SpiderMonkey.
// From ecma_3/RegExp/regress-334158.js
assertTrue(/\ca/.test( "\x01" ));
assertFalse(/\ca/.test( "\\ca" ));
assertFalse(/\ca/.test( "ca" ));
assertTrue(/\c[a/]/.test( "\\ca" ));
assertTrue(/\c[a/]/.test( "\\c/" ));

// Test \c in character class
re = /^[\cM]$/;
assertTrue(re.test("\r"));
assertFalse(re.test("M"));
assertFalse(re.test("c"));
assertFalse(re.test("\\"));
assertFalse(re.test("\x03"));  // I.e., read as \cc

re = /^[\c]]$/;
assertTrue(re.test("c]"));
assertTrue(re.test("\\]"));
assertFalse(re.test("\x1d"));  // ']' & 0x1f
assertFalse(re.test("\x03]"));  // I.e., read as \cc

re = /^[\c1]$/;  // Digit control characters are masked in character classes.
assertTrue(re.test("\x11"));
assertFalse(re.test("\\"));
assertFalse(re.test("c"));
assertFalse(re.test("1"));

re = /^[\c_]$/;  // Underscore control character is masked in character classes.
assertTrue(re.test("\x1f"));
assertFalse(re.test("\\"));
assertFalse(re.test("c"));
assertFalse(re.test("_"));

re = /^[\c$]$/;  // Other characters are interpreted literally.
assertFalse(re.test("\x04"));
assertTrue(re.test("\\"));
assertTrue(re.test("c"));
assertTrue(re.test("$"));

assertTrue(/^[Z-\c-e]*$/.test("Z[\\cde"));

// Test that we handle \s and \S correctly on special Unicode characters.
re = /\s/;
assertTrue(re.test("\u2028"));
assertTrue(re.test("\u2029"));
assertTrue(re.test("\uFEFF"));

re = /\S/;
assertFalse(re.test("\u2028"));
assertFalse(re.test("\u2029"));
assertFalse(re.test("\uFEFF"));

// Test that we handle \s and \S correctly inside some bizarre
// character classes.
re = /[\s-:]/;
assertTrue(re.test('-'));
assertTrue(re.test(':'));
assertTrue(re.test(' '));
assertTrue(re.test('\t'));
assertTrue(re.test('\n'));
assertFalse(re.test('a'));
assertFalse(re.test('Z'));

re = /[\S-:]/;
assertTrue(re.test('-'));
assertTrue(re.test(':'));
assertFalse(re.test(' '));
assertFalse(re.test('\t'));
assertFalse(re.test('\n'));
assertTrue(re.test('a'));
assertTrue(re.test('Z'));

re = /[^\s-:]/;
assertFalse(re.test('-'));
assertFalse(re.test(':'));
assertFalse(re.test(' '));
assertFalse(re.test('\t'));
assertFalse(re.test('\n'));
assertTrue(re.test('a'));
assertTrue(re.test('Z'));

re = /[^\S-:]/;
assertFalse(re.test('-'));
assertFalse(re.test(':'));
assertTrue(re.test(' '));
assertTrue(re.test('\t'));
assertTrue(re.test('\n'));
assertFalse(re.test('a'));
assertFalse(re.test('Z'));

re = /[\s]/;
assertFalse(re.test('-'));
assertFalse(re.test(':'));
assertTrue(re.test(' '));
assertTrue(re.test('\t'));
assertTrue(re.test('\n'));
assertFalse(re.test('a'));
assertFalse(re.test('Z'));

re = /[^\s]/;
assertTrue(re.test('-'));
assertTrue(re.test(':'));
assertFalse(re.test(' '));
assertFalse(re.test('\t'));
assertFalse(re.test('\n'));
assertTrue(re.test('a'));
assertTrue(re.test('Z'));

re = /[\S]/;
assertTrue(re.test('-'));
assertTrue(re.test(':'));
assertFalse(re.test(' '));
assertFalse(re.test('\t'));
assertFalse(re.test('\n'));
assertTrue(re.test('a'));
assertTrue(re.test('Z'));

re = /[^\S]/;
assertFalse(re.test('-'));
assertFalse(re.test(':'));
assertTrue(re.test(' '));
assertTrue(re.test('\t'));
assertTrue(re.test('\n'));
assertFalse(re.test('a'));
assertFalse(re.test('Z'));

re = /[\s\S]/;
assertTrue(re.test('-'));
assertTrue(re.test(':'));
assertTrue(re.test(' '));
assertTrue(re.test('\t'));
assertTrue(re.test('\n'));
assertTrue(re.test('a'));
assertTrue(re.test('Z'));

re = /[^\s\S]/;
assertFalse(re.test('-'));
assertFalse(re.test(':'));
assertFalse(re.test(' '));
assertFalse(re.test('\t'));
assertFalse(re.test('\n'));
assertFalse(re.test('a'));
assertFalse(re.test('Z'));

// First - is treated as range operator, second as literal minus.
// This follows the specification in parsing, but doesn't throw on
// the \s at the beginning of the range.
re = /[\s-0-9]/;
assertTrue(re.test(' '));
assertTrue(re.test('\xA0'));
assertTrue(re.test('-'));
assertTrue(re.test('0'));
assertTrue(re.test('9'));
assertFalse(re.test('1'));

// Test beginning and end of line assertions with or without the
// multiline flag.
re = /^\d+/;
assertFalse(re.test("asdf\n123"));
re = /^\d+/m;
assertTrue(re.test("asdf\n123"));

re = /\d+$/;
assertFalse(re.test("123\nasdf"));
re = /\d+$/m;
assertTrue(re.test("123\nasdf"));

// Test that empty matches are handled correctly for multiline global
// regexps.
re = /^(.*)/mg;
assertEquals(3, "a\n\rb".match(re).length);
assertEquals("*a\n*b\r*c\n*\r*d\r*\n*e", "a\nb\rc\n\rd\r\ne".replace(re, "*$1"));

// Test that empty matches advance one character
re = new RegExp("", "g");
assertEquals("xAx", "A".replace(re, "x"));
assertEquals(3, String.fromCharCode(161).replace(re, "x").length);

// Test that we match the KJS behavior with regard to undefined constructor
// arguments:
re = new RegExp();
// KJS actually shows this as '//'.  Here we match the Firefox behavior (ie,
// giving a syntactically legal regexp literal).
assertEquals('/(?:)/', re.toString());
re = new RegExp(void 0);
assertEquals('/(?:)/', re.toString());
re.compile();
assertEquals('/(?:)/', re.toString());
re.compile(void 0);
assertEquals('/(?:)/', re.toString());


// Check for early syntax errors.
assertThrows("/foo(/gi");

// Check $01 and $10
re = new RegExp("(.)(.)(.)(.)(.)(.)(.)(.)(.)(.)");
assertEquals("t", "123456789t".replace(re, "$10"), "$10");
assertEquals("15", "123456789t".replace(re, "$15"), "$10");
assertEquals("1", "123456789t".replace(re, "$01"), "$01");
assertEquals("$001", "123456789t".replace(re, "$001"), "$001");
re = new RegExp("foo(.)");
assertEquals("bar$0", "foox".replace(re, "bar$0"), "$0");
assertEquals("bar$00", "foox".replace(re, "bar$00"), "$00");
assertEquals("bar$000", "foox".replace(re, "bar$000"), "$000");
assertEquals("barx", "foox".replace(re, "bar$01"), "$01 2");
assertEquals("barx5", "foox".replace(re, "bar$15"), "$15");

assertFalse(/()foo$\1/.test("football"), "football1");
assertFalse(/foo$(?=ball)/.test("football"), "football2");
assertFalse(/foo$(?!bar)/.test("football"), "football3");
assertTrue(/()foo$\1/.test("foo"), "football4");
assertTrue(/foo$(?=(ball)?)/.test("foo"), "football5");
assertTrue(/()foo$(?!bar)/.test("foo"), "football6");
assertFalse(/(x?)foo$\1/.test("football"), "football7");
assertFalse(/foo$(?=ball)/.test("football"), "football8");
assertFalse(/foo$(?!bar)/.test("football"), "football9");
assertTrue(/(x?)foo$\1/.test("foo"), "football10");
assertTrue(/foo$(?=(ball)?)/.test("foo"), "football11");
assertTrue(/foo$(?!bar)/.test("foo"), "football12");

// Check that the back reference has two successors.  See
// BackReferenceNode::PropagateForward.
assertFalse(/f(o)\b\1/.test('foo'));
assertTrue(/f(o)\B\1/.test('foo'));

// Back-reference, ignore case:
// ASCII
assertEquals("xaAx,a", String(/x(a)\1x/i.exec("xaAx")), "backref-ASCII");
assertFalse(/x(...)\1/i.test("xaaaaa"), "backref-ASCII-short");
assertTrue(/x((?:))\1\1x/i.test("xx"), "backref-ASCII-empty");
assertTrue(/x(?:...|(...))\1x/i.test("xabcx"), "backref-ASCII-uncaptured");
assertTrue(/x(?:...|(...))\1x/i.test("xabcABCx"), "backref-ASCII-backtrack");
assertEquals("xaBcAbCABCx,aBc",
             String(/x(...)\1\1x/i.exec("xaBcAbCABCx")),
             "backref-ASCII-twice");

for (var i = 0; i < 128; i++) {
  var testName = "backref-ASCII-char-" + i + "," + (i^0x20);
  var test = /^(.)\1$/i.test(String.fromCharCode(i, i ^ 0x20))
  var c = String.fromCharCode(i);
  if (('A' <= c && c <= 'Z') || ('a' <= c && c <= 'z')) {
    assertTrue(test, testName);
  } else {
    assertFalse(test, testName);
  }
}

assertFalse(/f(o)$\1/.test('foo'), "backref detects at_end");

// Check decimal escapes doesn't overflow.
// (Note: \214 is interpreted as octal).
assertArrayEquals(["\x8c7483648"],
                  /\2147483648/.exec("\x8c7483648"),
                  "Overflow decimal escape");


// Check numbers in quantifiers doesn't overflow and doesn't throw on
// too large numbers.
assertFalse(/a{111111111111111111111111111111111111111111111}/.test('b'),
            "overlarge1");
assertFalse(/a{999999999999999999999999999999999999999999999}/.test('b'),
            "overlarge2");
assertFalse(/a{1,111111111111111111111111111111111111111111111}/.test('b'),
            "overlarge3");
assertFalse(/a{1,999999999999999999999999999999999999999999999}/.test('b'),
            "overlarge4");
assertFalse(/a{2147483648}/.test('b'),
            "overlarge5");
assertFalse(/a{21474836471}/.test('b'),
            "overlarge6");
assertFalse(/a{1,2147483648}/.test('b'),
            "overlarge7");
assertFalse(/a{1,21474836471}/.test('b'),
            "overlarge8");
assertFalse(/a{2147483648,2147483648}/.test('b'),
            "overlarge9");
assertFalse(/a{21474836471,21474836471}/.test('b'),
            "overlarge10");
assertFalse(/a{2147483647}/.test('b'),
            "overlarge11");
assertFalse(/a{1,2147483647}/.test('b'),
            "overlarge12");
assertTrue(/a{1,2147483647}/.test('a'),
            "overlarge13");
assertFalse(/a{2147483647,2147483647}/.test('a'),
            "overlarge14");


// Check that we don't read past the end of the string.
assertFalse(/f/.test('b'));
assertFalse(/[abc]f/.test('x'));
assertFalse(/[abc]f/.test('xa'));
assertFalse(/[abc]</.test('x'));
assertFalse(/[abc]</.test('xa'));
assertFalse(/f/i.test('b'));
assertFalse(/[abc]f/i.test('x'));
assertFalse(/[abc]f/i.test('xa'));
assertFalse(/[abc]</i.test('x'));
assertFalse(/[abc]</i.test('xa'));
assertFalse(/f[abc]/.test('x'));
assertFalse(/f[abc]/.test('xa'));
assertFalse(/<[abc]/.test('x'));
assertFalse(/<[abc]/.test('xa'));
assertFalse(/f[abc]/i.test('x'));
assertFalse(/f[abc]/i.test('xa'));
assertFalse(/<[abc]/i.test('x'));
assertFalse(/<[abc]/i.test('xa'));

// Test that merging of quick test masks gets it right.
assertFalse(/x([0-7]%%x|[0-6]%%y)/.test('x7%%y'), 'qt');
assertFalse(/()x\1(y([0-7]%%%x|[0-6]%%%y)|dkjasldkas)/.test('xy7%%%y'), 'qt2');
assertFalse(/()x\1(y([0-7]%%%x|[0-6]%%%y)|dkjasldkas)/.test('xy%%%y'), 'qt3');
assertFalse(/()x\1y([0-7]%%%x|[0-6]%%%y)/.test('xy7%%%y'), 'qt4');
assertFalse(/()x\1(y([0-7]%%%x|[0-6]%%%y)|dkjasldkas)/.test('xy%%%y'), 'qt5');
assertFalse(/()x\1y([0-7]%%%x|[0-6]%%%y)/.test('xy7%%%y'), 'qt6');
assertFalse(/xy([0-7]%%%x|[0-6]%%%y)/.test('xy7%%%y'), 'qt7');
assertFalse(/x([0-7]%%%x|[0-6]%%%y)/.test('x7%%%y'), 'qt8');


// Don't hang on this one.
/[^\xfe-\xff]*/.test("");


var long = "a";
for (var i = 0; i < 100000; i++) {
  long = "a?" + long;
}
// Don't crash on this one, but maybe throw an exception.
try {
  RegExp(long).exec("a");
} catch (e) {
  assertTrue(String(e).indexOf("Stack overflow") >= 0, "overflow");
}


// Test that compile works on modified objects
var re = /re+/;
assertEquals("re+", re.source);
assertFalse(re.global);
assertFalse(re.ignoreCase);
assertFalse(re.multiline);
assertEquals(0, re.lastIndex);

re.compile("ro+", "gim");
assertEquals("ro+", re.source);
assertTrue(re.global);
assertTrue(re.ignoreCase);
assertTrue(re.multiline);
assertEquals(0, re.lastIndex);

re.lastIndex = 42;
re.someOtherProperty = 42;
re.someDeletableProperty = 42;
re[37] = 37;
re[42] = 42;

re.compile("ra+", "i");
assertEquals("ra+", re.source);
assertFalse(re.global);
assertTrue(re.ignoreCase);
assertFalse(re.multiline);
assertEquals(0, re.lastIndex);

assertEquals(42, re.someOtherProperty);
assertEquals(42, re.someDeletableProperty);
assertEquals(37, re[37]);
assertEquals(42, re[42]);

re.lastIndex = -1;
re.someOtherProperty = 37;
re[42] = 37;
assertTrue(delete re[37]);
assertTrue(delete re.someDeletableProperty);
re.compile("ri+", "gm");

assertEquals("ri+", re.source);
assertTrue(re.global);
assertFalse(re.ignoreCase);
assertTrue(re.multiline);
assertEquals(0, re.lastIndex);
assertEquals(37, re.someOtherProperty);
assertEquals(37, re[42]);

// Test boundary-checks.
function assertRegExpTest(re, input, test) {
  assertEquals(test, re.test(input), "test:" + re + ":" + input);
}

assertRegExpTest(/b\b/, "b", true);
assertRegExpTest(/b\b$/, "b", true);
assertRegExpTest(/\bb/, "b", true);
assertRegExpTest(/^\bb/, "b", true);
assertRegExpTest(/,\b/, ",", false);
assertRegExpTest(/,\b$/, ",", false);
assertRegExpTest(/\b,/, ",", false);
assertRegExpTest(/^\b,/, ",", false);

assertRegExpTest(/b\B/, "b", false);
assertRegExpTest(/b\B$/, "b", false);
assertRegExpTest(/\Bb/, "b", false);
assertRegExpTest(/^\Bb/, "b", false);
assertRegExpTest(/,\B/, ",", true);
assertRegExpTest(/,\B$/, ",", true);
assertRegExpTest(/\B,/, ",", true);
assertRegExpTest(/^\B,/, ",", true);

assertRegExpTest(/b\b/, "b,", true);
assertRegExpTest(/b\b/, "ba", false);
assertRegExpTest(/b\B/, "b,", false);
assertRegExpTest(/b\B/, "ba", true);

assertRegExpTest(/b\Bb/, "bb", true);
assertRegExpTest(/b\bb/, "bb", false);

assertRegExpTest(/b\b[,b]/, "bb", false);
assertRegExpTest(/b\B[,b]/, "bb", true);
assertRegExpTest(/b\b[,b]/, "b,", true);
assertRegExpTest(/b\B[,b]/, "b,", false);

assertRegExpTest(/[,b]\bb/, "bb", false);
assertRegExpTest(/[,b]\Bb/, "bb", true);
assertRegExpTest(/[,b]\bb/, ",b", true);
assertRegExpTest(/[,b]\Bb/, ",b", false);

assertRegExpTest(/[,b]\b[,b]/, "bb", false);
assertRegExpTest(/[,b]\B[,b]/, "bb", true);
assertRegExpTest(/[,b]\b[,b]/, ",b", true);
assertRegExpTest(/[,b]\B[,b]/, ",b", false);
assertRegExpTest(/[,b]\b[,b]/, "b,", true);
assertRegExpTest(/[,b]\B[,b]/, "b,", false);

// Test that caching of result doesn't share result objects.
// More iterations increases the chance of hitting a GC.
for (var i = 0; i < 100; i++) {
  var re = /x(y)z/;
  var res = re.exec("axyzb");
  assertTrue(!!res);
  assertEquals(2, res.length);
  assertEquals("xyz", res[0]);
  assertEquals("y", res[1]);
  assertEquals(1, res.index);
  assertEquals("axyzb", res.input);
  assertEquals(undefined, res.foobar);

  res.foobar = "Arglebargle";
  res[3] = "Glopglyf";
  assertEquals("Arglebargle", res.foobar);
}

// Test that we perform the spec required conversions in the correct order.
var log;
var string = "the string";
var fakeLastIndex = {
      valueOf: function() {
        log.push("li");
        return 0;
      }
    };
var fakeString = {
      toString: function() {
        log.push("ts");
        return string;
      },
      length: 0
    };

var re = /str/;
log = [];
re.lastIndex = fakeLastIndex;
var result = re.exec(fakeString);
assertEquals(["str"], result);
assertEquals(["ts", "li"], log);

// Again, to check if caching interferes.
log = [];
re.lastIndex = fakeLastIndex;
result = re.exec(fakeString);
assertEquals(["str"], result);
assertEquals(["ts", "li"], log);

// And one more time, just to be certain.
log = [];
re.lastIndex = fakeLastIndex;
result = re.exec(fakeString);
assertEquals(["str"], result);
assertEquals(["ts", "li"], log);

// Now with a global regexp, where lastIndex is actually used.
re = /str/g;
log = [];
re.lastIndex = fakeLastIndex;
var result = re.exec(fakeString);
assertEquals(["str"], result);
assertEquals(["ts", "li"], log);

// Again, to check if caching interferes.
log = [];
re.lastIndex = fakeLastIndex;
result = re.exec(fakeString);
assertEquals(["str"], result);
assertEquals(["ts", "li"], log);

// And one more time, just to be certain.
log = [];
re.lastIndex = fakeLastIndex;
result = re.exec(fakeString);
assertEquals(["str"], result);
assertEquals(["ts", "li"], log);


// Check that properties of RegExp have the correct permissions.
var re = /x/g;
var desc = Object.getOwnPropertyDescriptor(re.__proto__, "global");
assertInstanceof(desc.get, Function);
assertEquals(true, desc.configurable);
assertEquals(false, desc.enumerable);

desc = Object.getOwnPropertyDescriptor(re.__proto__, "multiline");
assertInstanceof(desc.get, Function);
assertEquals(true, desc.configurable);
assertEquals(false, desc.enumerable);

desc = Object.getOwnPropertyDescriptor(re.__proto__, "ignoreCase");
assertInstanceof(desc.get, Function);
assertEquals(true, desc.configurable);
assertEquals(false, desc.enumerable);

desc = Object.getOwnPropertyDescriptor(re, "global");
assertEquals(undefined, desc);

desc = Object.getOwnPropertyDescriptor(re, "multiline");
assertEquals(undefined, desc);

desc = Object.getOwnPropertyDescriptor(re, "ignoreCase");
assertEquals(undefined, desc);

desc = Object.getOwnPropertyDescriptor(re, "lastIndex");
assertEquals(0, desc.value);
assertEquals(false, desc.configurable);
assertEquals(false, desc.enumerable);
assertEquals(true, desc.writable);


// Check that end-anchored regexps are optimized correctly.
var re = /(?:a|bc)g$/;
assertTrue(re.test("ag"));
assertTrue(re.test("bcg"));
assertTrue(re.test("abcg"));
assertTrue(re.test("zimbag"));
assertTrue(re.test("zimbcg"));

assertFalse(re.test("g"));
assertFalse(re.test(""));

// Global regexp (non-zero start).
var re = /(?:a|bc)g$/g;
assertTrue(re.test("ag"));
re.lastIndex = 1;  // Near start of string.
assertTrue(re.test("zimbag"));
re.lastIndex = 6;  // At end of string.
assertFalse(re.test("zimbag"));
re.lastIndex = 5;  // Near end of string.
assertFalse(re.test("zimbag"));
re.lastIndex = 4;
assertTrue(re.test("zimbag"));

// Anchored at both ends.
var re = /^(?:a|bc)g$/g;
assertTrue(re.test("ag"));
re.lastIndex = 1;
assertFalse(re.test("ag"));
re.lastIndex = 1;
assertFalse(re.test("zag"));

// Long max_length of RegExp.
var re = /VeryLongRegExp!{1,1000}$/;
assertTrue(re.test("BahoolaVeryLongRegExp!!!!!!"));
assertFalse(re.test("VeryLongRegExp"));
assertFalse(re.test("!"));

// End anchor inside disjunction.
var re = /(?:a$|bc$)/;
assertTrue(re.test("a"));
assertTrue(re.test("bc"));
assertTrue(re.test("abc"));
assertTrue(re.test("zimzamzumba"));
assertTrue(re.test("zimzamzumbc"));
assertFalse(re.test("c"));
assertFalse(re.test(""));

// Only partially anchored.
var re = /(?:a|bc$)/;
assertTrue(re.test("a"));
assertTrue(re.test("bc"));
assertEquals(["a"], re.exec("abc"));
assertEquals(4, re.exec("zimzamzumba").index);
assertEquals(["bc"], re.exec("zimzomzumbc"));
assertFalse(re.test("c"));
assertFalse(re.test(""));

// Valid syntax in ES5.
re = RegExp("(?:x)*");
re = RegExp("(x)*");

// Syntax extension relative to ES5, for matching JSC (and ES3).
// Shouldn't throw.
re = RegExp("(?=x)*");
re = RegExp("(?!x)*");

// Should throw. Shouldn't hit asserts in debug mode.
assertThrows("RegExp('(*)')");
assertThrows("RegExp('(?:*)')");
assertThrows("RegExp('(?=*)')");
assertThrows("RegExp('(?!*)')");

// Test trimmed regular expression for RegExp.test().
assertTrue(/.*abc/.test("abc"));
assertFalse(/.*\d+/.test("q"));

// Test that RegExp.prototype.toString() throws TypeError for
// incompatible receivers (ES5 section 15.10.6 and 15.10.6.4).
assertThrows("RegExp.prototype.toString.call(null)", TypeError);
assertThrows("RegExp.prototype.toString.call(0)", TypeError);
assertThrows("RegExp.prototype.toString.call('')", TypeError);
assertThrows("RegExp.prototype.toString.call(false)", TypeError);
assertThrows("RegExp.prototype.toString.call(true)", TypeError);

// Test mutually recursive capture and backreferences.
assertEquals(["b", "", ""], /(\2)b(\1)/.exec("aba"));
assertEquals(["a", "", ""], /(\2).(\1)/.exec("aba"));
assertEquals(["aba", "a", "a"], /(.\2).(\1)/.exec("aba"));
assertEquals(["acbc", "c", "c"], /a(.\2)b(\1)$/.exec("acbc"));
assertEquals(["acbc", "c", "c"], /a(.\2)b(\1)/.exec("aabcacbc"));

// Test surrogate pair detection in split.
// \u{daff}\u{e000} is not a surrogate pair, while \u{daff}\u{dfff} is.
assertEquals(["\u{daff}", "\u{e000}"], "\u{daff}\u{e000}".split(/[a-z]{0,1}/u));
assertEquals(["\u{daff}\u{dfff}"], "\u{daff}\u{dfff}".split(/[a-z]{0,1}/u));

// Test that changing a property on RegExp.prototype results in us taking the
// slow path, which executes RegExp.prototype.exec instead of our
// RegExpExecStub.
const RegExpPrototypeExec = RegExp.prototype.exec;
RegExp.prototype.exec = function() { throw new Error(); }
assertThrows(() => "abc".replace(/./, ""));
RegExp.prototype.exec = RegExpPrototypeExec;

// Test the code path in RE.proto[@@search] when previousLastIndex is a receiver
// but can't be converted to a primitive. This exposed a crash in an older
// C++ implementation of @@search which a) still relied on Object::Equals,
// and b) incorrectly returned isolate->pending_exception() on error.

var re = /./;
re.lastIndex = { [Symbol.toPrimitive]: 42 };
try { "abc".search(re); } catch (_) {}  // Ensure we don't crash.

// Test lastIndex values of -0.0 and NaN (since @@search uses SameValue).

var re = /./;
re.exec = function(str) { assertEquals(0, re.lastIndex); return []; }
re.lastIndex = -0.0;
assertEquals(-0, re.lastIndex);
"abc".search(re);
assertEquals(-0, re.lastIndex);

var re = /./;
re.exec = function(str) { assertEquals(0, re.lastIndex); return []; }
re.lastIndex = NaN;
assertEquals(NaN, re.lastIndex);
"abc".search(re);
assertEquals(NaN, re.lastIndex);

// Annex B changes: https://github.com/tc39/ecma262/pull/303

assertThrows("/{1}/", SyntaxError);
assertTrue(/^{*$/.test("{{{"));
assertTrue(/^}*$/.test("}}}"));
assertTrue(/]/.test("]"));
assertTrue(/^\c%$/.test("\\c%"));   // We go into ExtendedPatternCharacter.
assertTrue(/^\d%$/.test("2%"));     // ... CharacterClassEscape.
assertTrue(/^\e%$/.test("e%"));     // ... IdentityEscape.
assertTrue(/^\ca$/.test("\u{1}"));  // ... ControlLetter.
assertTrue(/^\cA$/.test("\u{1}"));  // ... ControlLetter.
assertTrue(/^\c9$/.test("\\c9"));   // ... ExtendedPatternCharacter.
assertTrue(/^\c$/.test("\\c"));   // ... ExtendedPatternCharacter.
assertTrue(/^[\c%]*$/.test("\\c%"));  // TODO(v8:6201): Not covered by the spec.
assertTrue(/^[\c:]*$/.test("\\c:"));  // TODO(v8:6201): Not covered by the spec.
assertTrue(/^[\c0]*$/.test("\u{10}"));  // ... ClassControlLetter.
assertTrue(/^[\c1]*$/.test("\u{11}"));  // ('0' % 32 == 0x10)
assertTrue(/^[\c2]*$/.test("\u{12}"));
assertTrue(/^[\c3]*$/.test("\u{13}"));
assertTrue(/^[\c4]*$/.test("\u{14}"));
assertTrue(/^[\c5]*$/.test("\u{15}"));
assertTrue(/^[\c6]*$/.test("\u{16}"));
assertTrue(/^[\c7]*$/.test("\u{17}"));
assertTrue(/^[\c8]*$/.test("\u{18}"));
assertTrue(/^[\c9]*$/.test("\u{19}"));
assertTrue(/^[\c_]*$/.test("\u{1F}"));
assertTrue(/^[\c11]*$/.test("\u{11}1"));
assertTrue(/^[\8]*$/.test("8"));  // ... ClassEscape ~~> IdentityEscape.
assertTrue(/^[\7]*$/.test("\u{7}"));  // ... ClassEscape
                                      // ~~> LegacyOctalEscapeSequence.
assertTrue(/^[\11]*$/.test("\u{9}"));
assertTrue(/^[\111]*$/.test("\u{49}"));
assertTrue(/^[\222]*$/.test("\u{92}"));
assertTrue(/^[\333]*$/.test("\u{DB}"));
assertTrue(/^[\444]*$/.test("\u{24}4"));
assertTrue(/^[\d-X]*$/.test("234-X-432"));  // CharacterRangeOrUnion.
assertTrue(/^[\d-X-Z]*$/.test("234-XZ-432"));
assertFalse(/^[\d-X-Z]*$/.test("234-XYZ-432"));

// Lone leading surrogates. Just here to exercise specific parsing code-paths.

assertFalse(/\uDB88|\uDBEC|aa/.test(""));
assertFalse(/\uDB88|\uDBEC|aa/u.test(""));

// EscapeRegExpPattern
assertEquals("\\n", /\n/.source);
assertEquals("\\n", new RegExp("\n").source);
assertEquals("\\n", new RegExp("\\n").source);
assertEquals("\\\\n", /\\n/.source);
assertEquals("\\r", /\r/.source);
assertEquals("\\r", new RegExp("\r").source);
assertEquals("\\r", new RegExp("\\r").source);
assertEquals("\\\\r", /\\r/.source);
assertEquals("\\u2028", /\u2028/.source);
assertEquals("\\u2028", new RegExp("\u2028").source);
assertEquals("\\u2028", new RegExp("\\u2028").source);
assertEquals("\\u2029", /\u2029/.source);
assertEquals("\\u2029", new RegExp("\u2029").source);
assertEquals("\\u2029", new RegExp("\\u2029").source);
assertEquals("[/]", /[/]/.source);
assertEquals("[\\/]", /[\/]/.source);
assertEquals("[\\\\/]", /[\\/]/.source);
assertEquals("[/]", new RegExp("[/]").source);
assertEquals("[/]", new RegExp("[\/]").source);
assertEquals("[\\/]", new RegExp("[\\/]").source);
assertEquals("[[/]", /[[/]/.source);
assertEquals("[/]]", /[/]]/.source);
assertEquals("[[/]]", /[[/]]/.source);
assertEquals("[[\\/]", /[[\/]/.source);
assertEquals("[[\\/]]", /[[\/]]/.source);
assertEquals("\\n", new RegExp("\\\n").source);
assertEquals("\\r", new RegExp("\\\r").source);
assertEquals("\\u2028", new RegExp("\\\u2028").source);
assertEquals("\\u2029", new RegExp("\\\u2029").source);

{
  // No escapes needed, the original string should be reused as `.source`.
  const pattern = "\\n";
  assertTrue(%ReferenceEqual(pattern, new RegExp(pattern).source));
}
