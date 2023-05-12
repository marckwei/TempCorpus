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

// Make sure the 'constructor' property isn't enumerable.
var enums = "";
for (var k in this) enums += (k + '|');
assertEquals(-1, enums.split('|').indexOf("constructor"));

// Make sure this doesn't crash.
new this.constructor;
new this.constructor();
new this.constructor(1,2,3,4,5,6);

var x = 0;
try {
  eval("SetValueOf(typeof(break.prototype.name), Math.max(typeof(break)))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("export Join((void), false.className(), null instanceof continue, return 'a', 0.__defineGetter__(x,function(){native}))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("with ({ void&&null.push(goto NaN) : Math.max(undef).toText }) { {-1/null,1.isNull} }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new break>>>=native.charCodeAt(-1.valueOf())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Number(this > native)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new {native,0.2}?continue+undef:IsSmi(0.2)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = break.toString()&&return continue")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (-1==continue.toJSONProtocol, GetFunctionFor(break.call(NaN)), (!new RegExp).prototype.new Object()<<void) { debugger.__defineSetter__(null,function(){continue})>>>=GetFunctionFor(-1) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (parseFloat(NaN).splice() in null.add(1).className()) { true[0.2]<<x.splice() }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("let (debugger.constructor.valueOf()) { this.sort().true.splice() }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("unescape(break.toObject()).prototype.new RegExp.continue.__lookupGetter__(x.slice(1, NaN)) = typeof(null.push(0.2))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Date(Iterator(continue.pop()))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("function X(x) { return new RegExp.shift().concat({debugger,continue}) }; X(return goto 0)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("Instantiate(0.add(break)&&x > null)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("with ({ eval(Array(x)) : 1.call('a').superConstructor }) { debugger.lastIndex.toLocaleString() }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = return true.__defineGetter__(this,function(){0.2})")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = new typeof(0)&this.lastIndex")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("String(new RegExp.call(1)).prototype.unescape(parseFloat(-1)) = false<<true.x.lastIndexOf(1)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("with ({ 1+debugger.valueOf() : continue.join().name() }) { parseInt(true)==undef.sort() }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new RegExp>>0.2.superConstructor.prototype.eval(void).className() = false.join().prototype.name")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("export (new Object()?undef:native)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = new null.isNull.slice(x.prototype.value, Iterator(undef))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("export function () { 0.2 }.unshift()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Math.max(continue.valueOf())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = return debugger.toObject()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("switch (-1.length+new Object().prototype.name) { case (debugger.constructor.sort()): IsPrimitive(undef.__defineSetter__(undef,function(){native})); break; }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("delete (!new Object().toLocaleString())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Date(0<<'a'>>>=new RegExp['a'])")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("native {unescape(true),new RegExp.isNull}")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = -1.lastIndexOf(false)?parseFloat(void):Join(null, continue, new Object(), x, break)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("label null/void-break.__lookupGetter__(native)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Function(0.2.join().constructor)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("label function () { false }.__lookupGetter__(this==1)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("Instantiate(-1.prototype.0.2.unshift())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = new return goto -1")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new {Number(debugger)}")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("if (parseInt(break) instanceof 0.length) { this.(!0.2) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("SetValueOf(break.superConstructor[throw new false(true)], this.~x)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("SetValueOf(function () { IsSmi(-1) }, unescape(IsPrimitive(void)))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (new RegExp.join().className() in new Object().length()>>true.toObject()) { parseFloat(escape(debugger)) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = new String(debugger).toJSONProtocol")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("SetValueOf(1.indexOf('a')<<break.__lookupGetter__('a'), new Object().null.prototype.new RegExp.charCodeAt(-1))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = new {parseInt(0)}")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Date(void.join().add(escape(undef)))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("native parseFloat(false.charAt(new RegExp))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Date(~Iterator(void))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Function(NaN.shift().toJSONProtocol)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Date(native-debugger<<continue.slice(x, new RegExp))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = parseFloat(~new Object())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (null.size/true.add(void) in 0+continue&true.null) { continue.toObject()/throw new true(debugger) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (Iterator(native+break) in debugger.superConstructor.constructor) { Math.max(0.add(undef)) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new {-1.add(native),true.sort()}")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new {IsSmi(break),throw new 'a'(null)}")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("switch (parseInt(0).length()) { case ('a'.toObject().__defineSetter__(GetFunctionFor(null),function(){(!x)})): IsSmi(void).constructor; break; }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = new 0.lastIndexOf(NaN).shift()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("with ({ 0>>>=this.lastIndex : new Object().lastIndexOf(true).toObject() }) { x.lastIndex > 1.__defineSetter__(false,function(){this}) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("with ({ throw new false(0.2).prototype.name : parseFloat(false)+(!debugger) }) { escape(undef.lastIndex) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("Math.pow(0.2).toJSONProtocol.prototype.break.superConstructor.slice(NaN.exec(undef), -1.lastIndexOf(NaN)) = true.splice().length")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("native continue.className().constructor")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("let (0.2.isNull&undef.toString()) { continue/void+parseInt(null) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = new Math.pow(break==this)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("SetValueOf(continue.__lookupGetter__(null).constructor, debugger.filter(0.2)>>>=this.'a')")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("with ({ 0.2.unshift() > true.size : return Math.max(new RegExp) }) { void.splice().toString() }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new unescape(false).unshift()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("function X(x) { return this.true?'a'==this:0.2.__lookupGetter__(void) }; X(Iterator(false).length)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = function () { null }.__defineSetter__(0.charCodeAt(new Object()),function(){null>>>=new Object()})")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("import goto 'a'.charAt(native.className())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("import 0.2.isNull.__lookupGetter__(debugger.size)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (~new Object().push(Array(null)) in new RegExp>>>=void.prototype.name) { goto break.lastIndex }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("delete String(x).slice(String('a'), parseFloat(false))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new parseInt(continue.__defineGetter__(0.2,function(){1}))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("Instantiate(true.concat(undef)==0.2.new RegExp)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("function X(x) { return NaN['a']?-1.exec(0):NaN.prototype.this }; X(native.prototype.name.toLocaleString())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (debugger==continue.toObject(), Array(NaN.className()), Math.max(new RegExp).prototype.value) { GetFunctionFor('a').prototype.value }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = new parseInt(break)==Array(x)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (parseInt(0.2.charCodeAt(this)), this.continue.prototype.name, native.superConstructor.superConstructor) { Join(0.__defineGetter__(continue,function(){undef}), {1}, parseFloat(0), undef.__defineSetter__(break,function(){null}), x?-1:-1) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("export Join(debugger.splice(), parseInt(NaN), new RegExp.pop(), this.false, x.-1)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = Math.max(native).charCodeAt(continue==break)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (void==NaN.sort(), new Object()==new RegExp.toObject(), -1/NaN.unshift()) { GetFunctionFor(true).name() }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for ((!'a'.join()), ~NaN.__defineGetter__(undef,function(){this}), Math.pow(NaN).__lookupGetter__(typeof(false))) { throw new debugger.toObject()(Math.max(-1)) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (NaN.shift()&&undef&&continue in throw new x(NaN).prototype.-1&x) { return native.toJSONProtocol }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = new (0).charAt(this.charCodeAt(new Object()))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("function X(x) { return x.valueOf().size }; X(0.2.unshift().unshift())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("if (eval(new Object().valueOf())) { break.prototype.name.__defineGetter__(eval(NaN),function(){Math.max(native)}) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (Math.pow(1).isNull in Iterator(continue.length())) { Join(true, 0.2, null, x, new Object()).length }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("SetValueOf(0>>>=void.unshift(), void.exec('a').undef.length())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("delete throw new this(0.2).pop()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Iterator(unescape(continue))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("function X(x) { return unescape(goto debugger) }; X(new RegExp.push(break).name())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = undef/'a'.indexOf(-1.exec(false))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (continue.isNull.filter(this.toText), function () { throw new 'a'(0.2) }, native?break:undef.prototype.return continue) { Array(void.toText) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = new this.slice(new Object(), 1).isNull")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (0.2.className().call((!debugger)), native.__defineGetter__(0,function(){x}).name(), null.splice().splice()) { NaN.charCodeAt(new Object()) > true.toString() }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("native false.length?new RegExp instanceof this:Array(undef)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new ~0.2.call(typeof(false))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Number(0.2.sort())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new x.join().shift()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("switch (~new Object().toText) { case (new RegExp.unshift().exec(new RegExp<<debugger)): -1.length.exec(this.isNull); break; }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new parseInt(~true)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new unescape(debugger.call(null))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = new GetFunctionFor(0.2).toObject()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("delete IsPrimitive(null.join())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (eval(0.2) instanceof debugger.splice() in null.superConstructor==new Object()&void) { Number(0+x) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("let ('a'-continue?null.length():escape(continue)) { return undef.push(false.shift()) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (Array(x.length) in 'a'.length().sort()) { goto (new Object()) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("let (NaN==true.length) { IsPrimitive(0.2).prototype.value }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("SetValueOf(return true&&void, new RegExp.toObject().length())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Math.pow(void).length")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Function(void.add(continue).charCodeAt(this.toObject()))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("export Join(break.toObject(), 0.2.isNull, false.call(0), break.filter(break), 1.length())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("if (1/NaN.__lookupGetter__(undef.prototype.value)) { escape(eval(this)) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Function(Join(unescape(x), new RegExp.__defineGetter__(debugger,function(){NaN}), 'a'.indexOf(0.2), false.prototype.name, (this)))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = new Math.pow(native).indexOf(1>>>=-1)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new RegExp?native:continue.join().prototype.Math.max(x.__defineSetter__(1,function(){continue})) = parseFloat(parseInt(null))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("native function () { new RegExp }.new RegExp.pop()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("import typeof(new RegExp.valueOf())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("switch (0.2.size>>NaN-continue) { case ('a'.push(true).indexOf(NaN.lastIndexOf(-1))): {0.2,x}.toObject(); break; }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("if (IsSmi(new Object())/false.filter('a')) { function () { Iterator(debugger) } }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = break.lastIndex.size")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Function(new Object() > 0.length())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("native IsPrimitive(continue)==break.charCodeAt(new Object())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new break.true<<'a'-NaN")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Number(-1?'a':-1)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (parseFloat('a'.exec(continue)) in (!new RegExp)&&0.2.toObject()) { {true,x}.add(void.prototype.NaN) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("let (-1.prototype.value.join()) { (!1.prototype.name) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new GetFunctionFor(continue).toJSONProtocol")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (Math.pow(continue.slice(null, native)), goto (!0), native?1:this.charAt(String(debugger))) { parseFloat(~this) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("SetValueOf(debugger.pop().length, new RegExp.isNull.toText)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (typeof(new RegExp.slice(new RegExp, 0)) in native.toLocaleString().lastIndexOf(0.2.length())) { native>>>=new RegExp.length() }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("native x.join().className()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new 0?0:true.toLocaleString()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = IsPrimitive(0).concat(new Object().name())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = new parseFloat(x)?this.valueOf():IsSmi(x)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = new 'a'.slice(null, -1).shift()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("label 'a'+void.concat('a'>>>=-1)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Function(escape(0.length))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = parseInt(0.lastIndexOf(NaN))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("SetValueOf(null&debugger.valueOf(), 0[false].push(false.add(debugger)))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = parseInt(new RegExp.__lookupGetter__(break))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("SetValueOf(~false&&break>>0, new RegExp.lastIndex.add({this}))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = Join(break, continue, 0, debugger, NaN).toLocaleString()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("import new Object().sort().superConstructor")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = new IsSmi(goto -1)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("function X(x) { return Iterator(null).toObject() }; X(-1==new Object()==0.__lookupGetter__(native))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("native void.join().add(parseFloat(continue))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("let (function () { -1 }.shift()) { escape(1.unshift()) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Function(new RegExp.indexOf(1).filter(continue instanceof break))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("if (NaN?continue:NaN.shift()) { native.push(null).add(new Object().superConstructor) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("function X(x) { return new Object().length().toText }; X(debugger.indexOf(this).toText)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = new Object().call('a').charCodeAt(native.size)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new function () { continue }.add(true.slice(continue, new RegExp))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x[native] instanceof -1.join().prototype.this.null.size = 0.2.prototype.x+0.2.indexOf(false)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (this instanceof new RegExp.splice() in null>>>=new RegExp.valueOf()) { function () { unescape(1) } }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (true.shift()/native.null in undef.call(NaN).isNull) { native+this-x.size }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("function X(x) { return false.pop()<<Join(continue, false, break, NaN, -1) }; X(IsSmi(debugger>>x))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("if ({parseFloat(null),Math.max(native)}) { 0.2-new Object().__lookupGetter__(eval(new Object())) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("SetValueOf(Array(1).toLocaleString(), null.name().exec(undef.filter(false)))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Function(true.filter(this).pop())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("let (break.lastIndex.superConstructor) { new Object().toString().length() }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("label (!0.2/debugger)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("with ({ NaN.concat(new RegExp)+Join(1, false, new Object(), new Object(), x) : unescape(x).concat(Iterator(-1)) }) { 'a'.isNull.__lookupGetter__(this+native) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("export break.name()/IsPrimitive(this)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new {null}.prototype.value")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new true+false.__lookupGetter__(null&continue)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("if (-1.push(new RegExp)[void.valueOf()]) { new RegExp.className().__lookupGetter__(Array(0)) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("export NaN.__lookupGetter__(undef).__lookupGetter__(void.isNull)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("with ({ ~new RegExp.filter(undef&&this) : String(continue)<<NaN.toText }) { this.exec(this).length }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (true&void.exec(void.exec(continue)) in Join('a', undef, new Object(), continue, x) instanceof {undef}) { unescape(-1.prototype.name) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("import void.push(true).join()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("SetValueOf({break}&x.name(), 1.charAt(false).slice(continue.superConstructor, this&&break))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("let (this.call(this) > Iterator(continue)) { new Object().prototype.value.slice(1.slice(native, -1), (!false)) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("export parseInt(new RegExp>>>=x)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (escape(x==debugger), NaN.shift()&debugger?false:0.2, (!new RegExp)&goto break) { unescape(x.toText) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Date(throw new NaN.toObject()(this?break:true))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new (typeof(this))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (unescape('a'/0) in ~new Object().lastIndex) { IsSmi(0).push(0.concat(0.2)) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("(!new RegExp)[0.2 > new Object()].prototype.Number(debugger.join()) = native&-1.size")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new false.toJSONProtocol&&0.2.constructor")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (~0?0.2:undef in new RegExp.charCodeAt(0).prototype.name) { NaN.toLocaleString().splice() }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (~IsPrimitive(new RegExp), true.toString().size, null.charCodeAt('a') > null.concat(0)) { break.toJSONProtocol/IsPrimitive(break) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new parseInt(new Object()).lastIndexOf(NaN > void)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("export break.splice()&&-1.prototype.new Object()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("{{true,0}}.prototype.break.length.splice() = 'a'.toText.superConstructor")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("let (debugger>>>=continue > break.exec(1)) { Math.pow(new RegExp)==NaN>>>=0.2 }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("with ({ 0.2==0.2/goto true : IsSmi(native).isNull }) { throw new {x,null}(false.className()) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = {false.concat(null),Math.pow(NaN)}")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("export Array(null).add(NaN.valueOf())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (parseFloat(new Object()==true) in GetFunctionFor('a'&false)) { native&undef.toJSONProtocol }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = new {eval(null),(debugger)}")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("import {this.0,debugger.filter(NaN)}")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("import break.charAt(-1)<<false.__defineSetter__(0,function(){x})")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = goto false > new Object()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("null.superConstructor[debugger.isNull].prototype.Math.max('a').shift() = parseInt(0).size")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("native eval(void.add(break))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Date(x > void.join())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("with ({ {this.toObject()} : Number(NaN).toJSONProtocol }) { 0.2.className().prototype.name }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("if (false.__defineGetter__(undef,function(){undef}).exec(NaN.splice())) { typeof(Join(void, new RegExp, break, -1, -1)) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (false.splice().toObject(), continue.name().size, Join(void?debugger:this, new RegExp.__defineSetter__(NaN,function(){NaN}), x.unshift(), this.true, parseInt(break))) { undef<<continue.toText }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("let (this.0.indexOf(break)) { break.charAt(this).unshift() }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("import Join(new Object().splice(), this instanceof 1, parseFloat(NaN), undef.concat(x), void.className())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Function(goto NaN.toString())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("label 'a'<<break.shift()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = Iterator(continue)[new Object()>>NaN]")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = Join(new RegExp, 'a', this, void, true)>>>=continue>>native")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("import new Object().toJSONProtocol.splice()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("function X(x) { return undef.__defineSetter__(native,function(){void}).toJSONProtocol }; X(eval(x).charCodeAt('a'.concat(true)))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("Instantiate(throw new 0.2.__defineGetter__(NaN,function(){-1})(void&&new RegExp))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = 0.unshift() > IsSmi(NaN)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("label x.call(null).lastIndex")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("SetValueOf(IsSmi(0.2.add(0)), x.add(break).this.__defineGetter__(undef,function(){new RegExp}))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("native Number(this).toObject()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new NaN.shift().add(String(new Object()))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new null.name().splice()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = 1.undef.push(new Object().call(null))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Function(parseInt(1).size)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = this.x.sort()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("Instantiate(continue.valueOf().prototype.new RegExp.splice())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("Instantiate(this.charAt(continue)?undef+'a':unescape(1))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("SetValueOf({throw new 'a'(0.2),void.lastIndexOf(NaN)}, Math.pow(new Object().className()))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("if (1.slice(new Object(), this).valueOf()) { parseInt(true).pop() }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("with ({ 0.2.superConstructor.lastIndex : goto debugger<<Join(undef, 1, true, undef, debugger) }) { function () { NaN }.prototype.name }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("-1.exec(debugger).length.prototype.debugger > null.slice(Iterator(void), continue.concat(0)) = parseInt(throw new 1(1))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Date(new Object().constructor.call(Number(1)))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = new null.unshift().call(escape(x))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("switch (Math.pow(native).toLocaleString()) { case (false instanceof native.join()): Math.pow(NaN).size; break; }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("label function () { new Object() }.prototype.true.size")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = Join('a', 0.2, false, new Object(), void).continue.className()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = IsPrimitive(break.__lookupGetter__(-1))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = new Object()>>0.2.prototype.name")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = new IsPrimitive(new Object()).shift()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("if (Array(parseInt(break))) { 'a'.toString().unshift() }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = return 0.2>>>=-1?undef:undef")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Object().splice().unshift().prototype.null&&native.__lookupGetter__(undef>>>=NaN) = (1<<break)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("delete NaN.charAt(1).concat(NaN.0.2)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("Instantiate(new RegExp.sort().toJSONProtocol)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("function X(x) { return GetFunctionFor(false).lastIndexOf(1.shift()) }; X(this.0.2.charCodeAt(0.2))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (goto NaN.toObject(), ~true.'a', parseInt(debugger)+eval(false)) { eval(0.2.constructor) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("switch (parseInt(debugger).pop()) { case (this.push(true).valueOf()): Join(continue, debugger, native, native, debugger).filter(Array(continue)); break; }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = new debugger.sort() instanceof this>>1")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("with ({ parseFloat(false).prototype.(!new Object()) : {unescape(-1)} }) { Math.max(new RegExp.superConstructor) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("Instantiate({Math.pow(break)})")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("import typeof(break.valueOf())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("Instantiate(Math.pow(-1[new RegExp]))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("native IsPrimitive(1).concat({x,null})")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("NaN.length.prototype.value.prototype.function () { null==new Object() } = break.name()&IsPrimitive(0)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("delete NaN.prototype.-1.toString()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new continue.unshift()+parseFloat(undef)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = new NaN-break.call(false.pop())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("native new RegExp.exec(break).pop()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("SetValueOf({'a',null}.prototype.value, 1.shift() instanceof {'a',0})")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (debugger.valueOf().size, function () { x.unshift() }, IsSmi(1)&&true==native) { new Object().__defineGetter__(this,function(){'a'})&&eval(native) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("export 'a'.pop().charCodeAt(x.className())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("export String(IsSmi(debugger))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("typeof(debugger).valueOf().prototype.(1).lastIndexOf(this.break) = x.prototype.name.toLocaleString()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("native Array(typeof(false))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Function(1.__defineGetter__(1,function(){1}).null.constructor)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = 1.charAt(0).toObject()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Date(Math.max('a'.filter(new Object())))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Date(void.prototype.name.unshift())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (-1.toJSONProtocol.call(-1.size) in ~x.sort()) { eval(0&debugger) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for ('a'==undef.join() in Math.pow(IsSmi(false))) { undef > this>>goto x }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("Instantiate('a'.constructor.isNull)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (GetFunctionFor(this.slice(0.2, this)), this.prototype.void?null.unshift():native.className(), Number(new Object().call(-1))) { 0.splice() > debugger&&this }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("with ({ {goto new RegExp,Join(new Object(), native, continue, -1, x)} : NaN&x/{0,break} }) { this.lastIndexOf(new RegExp).join() }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("let (typeof(break.length())) { native&&false.sort() }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = new parseFloat(-1 instanceof break)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("label throw new continue.unshift()(null.shift())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("import Math.max(0.2.toLocaleString())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("function X(x) { return false.unshift().className() }; X(escape(NaN&NaN))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Date(Join(native.toText, goto x, 0.2.splice(), Join('a', 0, void, NaN, 1), eval(native)))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("if (GetFunctionFor(true.prototype.name)) { parseInt(NaN).toLocaleString() }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new escape(native).__defineSetter__(return native,function(){undef > native})")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = new typeof(true > 'a')")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("switch (debugger.prototype.0.2<<new RegExp+false) { case (native.splice().filter({x})): false&true.indexOf(1.__defineGetter__(native,function(){continue})); break; }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("label true-NaN.prototype.native.shift()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new typeof(new RegExp.splice())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("switch (function () { this.NaN }) { case (this.continue.prototype.parseFloat(false)): IsPrimitive(new Object()-'a'); break; }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("export break.__lookupGetter__(debugger).indexOf(native.pop())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("switch (GetFunctionFor(NaN.lastIndex)) { case (new RegExp.lastIndex.toLocaleString()): NaN.join().indexOf(eval(-1)); break; }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("native {void.charAt(true)}")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new new Object()==NaN.join()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Date(typeof(Array(new Object())))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("label throw new (false)(eval(x))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new new RegExp.size.charAt(true > -1)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = debugger.toObject().charAt(this<<undef)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("with ({ 'a'.valueOf()+parseInt(undef) : IsPrimitive(null).lastIndex }) { NaN.toObject().isNull }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = new new Object()&&void.lastIndexOf(0.2.splice())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("with ({ 1+1.name() : Join(Math.pow(debugger), new RegExp-1, x > 1, x<<-1, new RegExp.size) }) { undef[undef].size }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("delete native.call(-1).isNull")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("if (new Object()>>>=break==Math.pow(debugger)) { IsPrimitive(this).lastIndex }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for ((!x&&new RegExp) in undef.toLocaleString().slice(new RegExp.indexOf(NaN), IsPrimitive(-1))) { false.size+debugger[x] }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("import 0.length.__defineGetter__(0.2.shift(),function(){'a'.className()})")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("Instantiate(goto new Object().push(void))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("with ({ Array(this.0) : parseFloat(void).pop() }) { escape(true).slice(continue.lastIndex, false.toObject()) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new native==true.filter({NaN,-1})")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for ('a'.__defineSetter__(continue,function(){-1}).unshift(), Array(undef).toLocaleString(), undef.__lookupGetter__(void).toLocaleString()) { parseInt(false/native) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("this.x<<false.prototype.true.toLocaleString()==NaN.pop() = this.superConstructor>>Math.max(true)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("function X(x) { return this.prototype.name.splice() }; X(unescape(x).__lookupGetter__(Number(debugger)))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = new (!NaN).unshift()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Function(escape(Iterator(this)))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("function X(x) { return Number(new RegExp)<<this?true:-1 }; X(Number(null).lastIndex)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("export this.void.splice()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (this.prototype.null.sort() in -1.className()&void.filter(new Object())) { GetFunctionFor(new Object()).pop() }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("label 0[break].sort()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (null.length().toString(), eval(-1).toObject(), (!continue.concat(continue))) { true.name()/native<<new RegExp }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (unescape(null).sort(), Number(undef).charCodeAt(IsPrimitive(NaN)), null>>true/null.join()) { 0.2.toObject() > IsPrimitive(new RegExp) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Date({NaN,native}&&1+undef)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("Instantiate(IsPrimitive(undef>>>=1))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (Join(true, 'a', true, 1, NaN).add({1}), GetFunctionFor(new Object().push(new Object())), goto 1.length) { Math.pow(GetFunctionFor(native)) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("function X(x) { return break.isNull > parseInt(continue) }; X((new RegExp instanceof 1))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("with ({ Number(false).indexOf(x instanceof new Object()) : function () { x.toString() } }) { false.name().indexOf(GetFunctionFor(null)) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Date('a'.constructor.prototype.name)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("GetFunctionFor(void&new Object()).prototype.debugger.add(null)[void.unshift()] = new RegExp.isNull.Iterator(this)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("delete false?break:undef.constructor")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("with ({ (native.filter(1)) : eval(this&&0.2) }) { undef.length instanceof new Object().toText }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("export String(break.lastIndexOf(null))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("label (!Iterator(new RegExp))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("SetValueOf(String(null==-1), {1&0})")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Date(parseInt('a' > 0))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("SetValueOf(debugger.toJSONProtocol.indexOf(escape(0)), this.filter(null).__defineSetter__(continue.break,function(){debugger>>null}))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("this.name().length().prototype.goto false.exec(true.charCodeAt(continue)) = Join(-1-false, undef.superConstructor, 'a'.shift(), (!x), NaN.this)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Function(typeof(new RegExp).sort())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new 0.2.concat(x).splice()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (goto void.indexOf(throw new x(1)), typeof(return new RegExp), IsPrimitive(-1).add(void.lastIndexOf(debugger))) { null.indexOf(void).toText }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("return new RegExp.pop().prototype.String(x.toObject()) = 1.superConstructor.charCodeAt(new RegExp.charCodeAt(null))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new null&true.prototype.name")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = -1>>>=NaN.indexOf((debugger))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = new parseFloat(null).splice()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("import -1.lastIndexOf(new RegExp) instanceof throw new void(0.2)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("if ((0.shift())) { Join(IsPrimitive(-1), break.__defineSetter__(true,function(){break}), parseInt(null), parseFloat(break), true/null) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = new escape(1 > continue)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("switch (parseInt(undef)>>false.filter(continue)) { case (this.undef/new Object()): 'a'.toJSONProtocol.__defineGetter__(new RegExp-undef,function(){parseFloat(new RegExp)}); break; }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("{void}.shift().prototype.this.Array(new Object()) = {0.2,new RegExp}.lastIndexOf(break.splice())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new continue&&new Object().lastIndexOf(new Object() instanceof 1)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (throw new 'a'.exec(x)(return false), native/void.constructor, {native}==true.toLocaleString()) { goto 1 instanceof 1.isNull }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (break.concat(break) > native>>>=-1, (debugger.x), Join(x, void, void, new RegExp, null).name()) { void.charCodeAt(true).valueOf() }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = new 'a'>>0 instanceof new Object().push(new RegExp)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("if (return ~break) { break.__defineGetter__(break,function(){-1}).shift() }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("Instantiate(Join(null, -1, undef, null, 0).toString())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("let ({new RegExp,void}.slice(break.isNull, false.shift())) { eval(debugger.slice(this, 1)) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("function X(x) { return {GetFunctionFor(0)} }; X('a'.prototype.debugger.concat(void.constructor))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("let (~true instanceof continue) { escape(new RegExp.toObject()) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("escape(0[native]).prototype.debugger.add(1).unshift() = (true.join())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (unescape(void).length, undef.toObject() instanceof x.toObject(), 0.2+true.concat(true.__lookupGetter__(this))) { (x).toJSONProtocol }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("Instantiate(escape(null).__lookupGetter__(undef.size))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("label Array(continue[false])")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("function X(x) { return Number(this&&false) }; X(NaN.toJSONProtocol.toJSONProtocol)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("null.toString().shift().prototype.Array(x).__lookupGetter__('a'.prototype.x) = {1.length,break.join()}")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = new 1.charCodeAt(break)+IsSmi(false)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("SetValueOf(String(this) > 0.2.toText, new RegExp.length.lastIndexOf(1<<0.2))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("switch (new RegExp.pop().charAt(IsSmi(new RegExp))) { case (native.indexOf(this)/native.lastIndex): this.debugger.indexOf(debugger); break; }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Date(Number(x)[debugger.prototype.break])")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("function X(x) { return new RegExp>>>=x.unshift() }; X(Math.max(continue.name()))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("Instantiate(IsSmi(null.size))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = native?0.2:1+GetFunctionFor(void)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (IsPrimitive(-1)>>>=break.valueOf() in String(0 > 0.2)) { Math.max(true.length()) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("switch (escape(unescape(NaN))) { case (Math.pow(eval(undef))): true.charAt(null)&new RegExp.pop(); break; }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("delete Join(new RegExp, 1, false, new Object(), this).toLocaleString()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("label return x.filter(x.join())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new new RegExp.pop().shift()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = new (!debugger.size)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("label Math.max(debugger.__lookupGetter__(NaN))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("Instantiate(eval(debugger[debugger]))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new 0.2.filter(true)&throw new true(debugger)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Date(continue.exec(debugger) > Math.pow(0.2))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("void.prototype.value.name().prototype.Number(undef&NaN) = false.__lookupGetter__(-1).name()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("Instantiate(null.__defineGetter__(native,function(){continue}).valueOf())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("with ({ {new Object()[continue],native.length()} : undef.name().superConstructor }) { Math.pow(break).indexOf(0.toJSONProtocol) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("switch (Iterator(native.call(new RegExp))) { case (String(new RegExp).isNull): goto new RegExp.pop(); break; }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = new x.constructor instanceof undef.indexOf(-1)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("SetValueOf(this.~null, continue.pop()&0&'a')")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("switch (GetFunctionFor(~0)) { case ('a'.'a'<<undef.__defineGetter__(false,function(){true})): (!1).lastIndex; break; }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("function X(x) { return debugger.unshift().0.toString() }; X(Number(break).0.2>>>=false)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Date(Iterator(x)/undef.pop())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("SetValueOf(undef.join().toLocaleString(), null.add(false).valueOf())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("IsSmi(x).toString().prototype.0>>continue.indexOf(NaN.__lookupGetter__(new Object())) = ~-1&typeof(0)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (continue.__lookupGetter__(new RegExp).toObject(), false-0.toString(), return native.sort()) { new RegExp.name().className() }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("switch (escape(new RegExp).toString()) { case (goto eval(1)): this.filter(new Object()).call(new RegExp.slice(null, this)); break; }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = debugger-false.toText")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = Number(null>>new RegExp)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("delete this&native.indexOf('a'.splice())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("SetValueOf(~Math.max(break), 0.2.valueOf().length)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("Instantiate(Number(native.charCodeAt(x)))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = new goto continue.add(0)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("delete typeof(debugger).name()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("'a'<<false.toText.prototype.throw new true(1).lastIndex = 'a'.name().length")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("native 'a'.indexOf(debugger).charAt(NaN.add(new Object()))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("SetValueOf(break>>false.toString(), (false.indexOf(this)))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("delete goto NaN==(!debugger)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Date(0.2.join().superConstructor)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = new this.void.toLocaleString()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("SetValueOf(x.exec(debugger)[GetFunctionFor(0)], native.toObject().exec(new RegExp.sort()))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("Instantiate(0.2.valueOf().toLocaleString())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Function(-1.toJSONProtocol.prototype.name)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Date(Array(-1.shift()))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("export break.concat(undef).unshift()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("native parseFloat(-1)?NaN.toText:debugger.toString()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (void-continue/continue.prototype.undef in String(break.toText)) { parseInt(false).isNull }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("Instantiate(true.isNull.toObject())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("with ({ typeof(debugger).toObject() : x.constructor>>>=null.__defineGetter__(native,function(){debugger}) }) { unescape(undef.lastIndexOf(false)) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("export unescape(continue)<<native[0]")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("if (String(0).unescape(debugger)) { {break.pop(),0.2.constructor} }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("String({true}).prototype.break.length.call(false > 0.2) = GetFunctionFor(0.prototype.new RegExp)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("with ({ false.push(0.2).indexOf(Math.max(debugger)) : x&x.prototype.name }) { goto 1.lastIndex }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Function(0.2.lastIndex&0.2?break:NaN)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = -1.prototype.value.toText")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("import native.toLocaleString()-1.prototype.0")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("export debugger[-1].indexOf(Join(new Object(), 0, x, new Object(), 0.2))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("function X(x) { return (!true).lastIndexOf(true.splice()) }; X(NaN.toString().prototype.value)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("function X(x) { return continue.slice(-1, 1).prototype.true.name() }; X('a'.push(void).prototype.value)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (goto new RegExp.length(), x.sort().className(), Math.max(new RegExp.toJSONProtocol)) { (IsSmi(-1)) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = 0.splice()&&-1.sort()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("let (Math.max(-1>>1)) { break.toLocaleString().toJSONProtocol }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new {void.prototype.break,new RegExp.toString()}")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new IsSmi(debugger).name()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new 'a'.concat(undef).sort()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = new {debugger.toObject(),'a' > false}")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("if (goto 1.concat(Join(x, undef, native, x, new Object()))) { new RegExp.prototype.name==new RegExp.superConstructor }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("function X(x) { return new Object().__defineGetter__(0.2,function(){0.2}).length() }; X(void.isNull<<parseFloat(NaN))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("delete continue.toJSONProtocol.toLocaleString()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (continue.constructor.toObject() in true&&undef.toJSONProtocol) { String(0+break) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("import true.call(continue)>>break.toString()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("label escape(this) > Math.pow(new RegExp)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new {void}/IsSmi(new Object())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("switch (native==null?debugger.prototype.name:null.toLocaleString()) { case (NaN.push(this).join()): (break instanceof continue); break; }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = new Math.pow(x.push(0))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new (Array(NaN))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("label IsSmi(new RegExp).toLocaleString()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("label NaN.push(1).shift()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("{escape(undef),debugger.filter(0.2)}.prototype.-1 > new RegExp[0.2.valueOf()] = new RegExp.prototype.value.splice()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = new Join(0.2, x, continue, debugger, new Object()).size")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("with ({ Number(null).name() : Math.pow(true).__defineGetter__(debugger.toString(),function(){false+0.2}) }) { this.{x,break} }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Math.pow(goto debugger)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = IsPrimitive(void.pop())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = new Object().toString().toJSONProtocol")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("Instantiate(this.String(0.2))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("let ({-1.call(new RegExp)}) { break.length().splice() }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("import null.size.__defineGetter__(void.filter(x),function(){null.pop()})")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = new IsPrimitive(null.superConstructor)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new eval(-1.prototype.continue)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("switch (typeof(Iterator('a'))) { case (0.constructor>>~1): void.__defineGetter__(void,function(){1})/GetFunctionFor(0); break; }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for (false instanceof x.add(true.charAt(new RegExp)) in Join(undef.lastIndexOf(break), 0.2.add(new Object()), Iterator(1), {'a',x}, Array(new Object()))) { function () { null }/1&&-1 }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new escape('a'.concat(undef))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Function(Math.pow(NaN).toText)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = new throw new 0(NaN).className()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("delete String(GetFunctionFor(new Object()))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = Iterator(new Object()).charAt((0.2))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("Number(undef.charAt(1)).prototype.undef.lastIndexOf(true).slice(1.className(), undef.filter(-1)) = null<<null.push(parseInt('a'))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = {Math.max(1),IsSmi(new Object())}")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("switch (new Object().exec(0).isNull) { case (escape(IsSmi(false))): false.toObject()-null.size; break; }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new 'a'.__defineSetter__(debugger,function(){false}).name()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = debugger?-1:0+true.prototype.1")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new {false instanceof continue,native.size}")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("GetFunctionFor(continue.__lookupGetter__(0.2)).prototype.Math.max(1.splice()) = true.__defineGetter__(undef,function(){NaN}).filter(String(new RegExp))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("null.size-1.toLocaleString().prototype.(this).shift() = GetFunctionFor(native.charAt(break))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("Instantiate((!null.indexOf(-1)))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = {break.sort()}")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new throw new debugger.splice()(this.__lookupGetter__(undef))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("unescape(x[native]).prototype.0.splice().-1.prototype.true = x.prototype.value.className()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("export x+true.length")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("export debugger.indexOf(-1).indexOf(true.constructor)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("for ({break}.exec(new Object().continue) in eval(0.2.charAt(new Object()))) { throw new null.length(null?break:-1) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = NaN.toLocaleString().toObject()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("function X(x) { return Math.pow(break+false) }; X(Join(true.add(new Object()), null[-1], new RegExp[true], NaN&&debugger, x.charAt(undef)))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("switch ((break).add(true.sort())) { case (undef.charAt(native).__defineGetter__(IsPrimitive(1),function(){NaN<<new RegExp})): -1.__defineSetter__(null,function(){-1}) > this.charCodeAt(this); break; }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("import return 0.2.length")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("continue.join().toText.prototype.Number(debugger).slice(new RegExp.-1, (NaN)) = function () { (!null) }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("export Number(break.__lookupGetter__(false))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Date(return null/x)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("export Number(undef).shift()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = 1[native]/this&true")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("delete typeof(debugger.unshift())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("import x.charAt(false)&-1>>x")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("if (null.toText.superConstructor) { typeof(-1).toString() }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("let (parseFloat(continue.superConstructor)) { 0.2.toText.prototype.value }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("label parseInt(IsSmi(null))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("delete new Object().valueOf().indexOf(true-x)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = new unescape(1.__defineGetter__(new Object(),function(){x}))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("let (undef.size.splice()) { 1.constructor.charCodeAt(0+'a') }")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("this.new RegExp.pop().prototype.eval(debugger).toJSONProtocol = unescape(continue).valueOf()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("const x = new this.new RegExp.indexOf(unescape(new Object()))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = new break instanceof false instanceof native.length()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("Instantiate(parseFloat(x).valueOf())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("label {escape(true),Math.max(null)}")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("'a'>>>=void.prototype.value.prototype.break.prototype.break.indexOf(0.className()) = (!this&native)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("import Number(NaN).push(IsSmi(break))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("export true.exec(void).toObject()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Function({'a',true}/eval(new Object()))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("label null.concat(null).toObject()")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("native {0.2.length,new RegExp.lastIndexOf(-1)}")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("function X(x) { return Math.max({0.2}) }; X(true.charCodeAt(null).add(new RegExp.name()))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("delete -1.lastIndex.length")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("new Function(0.2[1].call(true > break))")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("Instantiate('a'.toLocaleString().splice())")
} catch (e) { if (e.message.length > 0) { print (e.message); } };

try {
  eval("x = typeof(void&&void)")
} catch (e) { if (e.message.length > 0) { print (e.message); } };
