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

(function module() {
  "use asm";
  function foo(
      a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11,
      a12, a13, a14, a15, a16, a17, a18, a19, a20, a21,
      a22, a23, a24, a25, a26, a27, a28, a29, a30, a31,
      a32, a33, a34, a35, a36, a37, a38, a39, a40, a41,
      a42, a43, a44, a45, a46, a47, a48, a49, a50, a51,
      a52, a53, a54, a55, a56, a57, a58, a59, a60, a61,
      a62, a63, a64, a65, a66, a67, a68, a69, a70, a71,
      a72, a73, a74, a75, a76, a77, a78, a79, a80, a81,
      a82, a83, a84, a85, a86, a87, a88, a89, a90, a91,
      a92, a93, a94, a95, a96, a97, a98, a99, a100, a101,
      a102, a103, a104, a105, a106, a107, a108, a109, a110,
      a111, a112, a113, a114, a115, a116, a117, a118, a119,
      a120, a121, a122, a123, a124, a125, a126, a127, a128,
      a129, a130, a131, a132, a133, a134, a135, a136, a137,
      a138, a139, a140, a141, a142, a143, a144, a145, a146,
      a147, a148, a149, a150, a151, a152, a153, a154, a155,
      a156, a157, a158, a159, a160, a161, a162, a163, a164,
      a165, a166, a167, a168, a169, a170, a171, a172, a173,
      a174, a175, a176, a177, a178, a179, a180, a181, a182,
      a183, a184, a185, a186, a187, a188, a189, a190, a191,
      a192, a193, a194, a195, a196, a197, a198, a199, a200,
      a201, a202, a203, a204, a205, a206, a207, a208, a209,
      a210, a211, a212, a213, a214, a215, a216, a217, a218,
      a219, a220, a221, a222, a223, a224, a225, a226, a227,
      a228, a229, a230, a231, a232, a233, a234, a235, a236,
      a237, a238, a239, a240, a241, a242, a243, a244, a245,
      a246, a247, a248, a249, a250, a251, a252, a253, a254,
      a255, a256, a257, a258, a259, a260, a261, a262, a263,
      a264, a265, a266, a267, a268, a269, a270, a271, a272,
      a273, a274, a275, a276, a277, a278, a279, a280, a281,
      a282, a283, a284, a285, a286, a287, a288, a289, a290,
      a291, a292, a293, a294, a295, a296, a297, a298, a299,
      a300, a301, a302, a303, a304, a305, a306, a307, a308,
      a309, a310, a311, a312, a313, a314, a315, a316, a317,
      a318, a319, a320, a321, a322, a323, a324, a325, a326,
      a327, a328, a329, a330, a331, a332, a333, a334, a335,
      a336, a337, a338, a339, a340, a341, a342, a343, a344,
      a345, a346, a347, a348, a349, a350, a351, a352, a353,
      a354, a355, a356, a357, a358, a359, a360, a361, a362,
      a363, a364, a365, a366, a367, a368, a369, a370, a371,
      a372, a373, a374, a375, a376, a377, a378, a379, a380,
      a381, a382, a383, a384, a385, a386, a387, a388, a389,
      a390, a391, a392, a393, a394, a395, a396, a397, a398,
      a399, a400, a401, a402, a403, a404, a405, a406, a407,
      a408, a409, a410, a411, a412, a413, a414, a415, a416,
      a417, a418, a419, a420, a421, a422, a423, a424, a425,
      a426, a427, a428, a429, a430, a431, a432, a433, a434,
      a435, a436, a437, a438, a439, a440, a441, a442, a443,
      a444, a445, a446, a447, a448, a449, a450, a451, a452,
      a453, a454, a455, a456, a457, a458, a459, a460, a461,
      a462, a463, a464, a465, a466, a467, a468, a469, a470,
      a471, a472, a473, a474, a475, a476, a477, a478, a479,
      a480, a481, a482, a483, a484, a485, a486, a487, a488,
      a489, a490, a491, a492, a493, a494, a495, a496, a497,
      a498, a499, a500, a501, a502, a503, a504, a505, a506,
      a507, a508, a509, a510, a511, a512, a513, a514, a515,
      a516, a517, a518, a519, a520, a521, a522, a523, a524,
      a525, a526, a527, a528, a529, a530, a531, a532, a533,
      a534, a535, a536, a537, a538, a539, a540, a541, a542,
      a543, a544, a545, a546, a547, a548, a549, a550, a551,
      a552, a553, a554, a555, a556, a557, a558, a559, a560,
      a561, a562, a563, a564, a565, a566, a567, a568, a569,
      a570, a571, a572, a573, a574, a575, a576, a577, a578,
      a579, a580, a581, a582, a583, a584, a585, a586, a587,
      a588, a589, a590, a591, a592, a593, a594, a595, a596,
      a597, a598, a599, a600, a601, a602, a603, a604, a605,
      a606, a607, a608, a609, a610, a611, a612, a613, a614,
      a615, a616, a617, a618, a619, a620, a621, a622, a623,
      a624, a625, a626, a627, a628, a629, a630, a631, a632,
      a633, a634, a635, a636, a637, a638, a639, a640, a641,
      a642, a643, a644, a645, a646, a647, a648, a649, a650,
      a651, a652, a653, a654, a655, a656, a657, a658, a659,
      a660, a661, a662, a663, a664, a665, a666, a667, a668,
      a669, a670, a671, a672, a673, a674, a675, a676, a677,
      a678, a679, a680, a681, a682, a683, a684, a685, a686,
      a687, a688, a689, a690, a691, a692, a693, a694, a695,
      a696, a697, a698, a699, a700, a701, a702, a703, a704,
      a705, a706, a707, a708, a709, a710, a711, a712, a713,
      a714, a715, a716, a717, a718, a719, a720, a721, a722,
      a723, a724, a725, a726, a727, a728, a729, a730, a731,
      a732, a733, a734, a735, a736, a737, a738, a739, a740,
      a741, a742, a743, a744, a745, a746, a747, a748, a749,
      a750, a751, a752, a753, a754, a755, a756, a757, a758,
      a759, a760, a761, a762, a763, a764, a765, a766, a767,
      a768, a769, a770, a771, a772, a773, a774, a775, a776,
      a777, a778, a779, a780, a781, a782, a783, a784, a785,
      a786, a787, a788, a789, a790, a791, a792, a793, a794,
      a795, a796, a797, a798, a799, a800, a801, a802, a803,
      a804, a805, a806, a807, a808, a809, a810, a811, a812,
      a813, a814, a815, a816, a817, a818, a819, a820, a821,
      a822, a823, a824, a825, a826, a827, a828, a829, a830,
      a831, a832, a833, a834, a835, a836, a837, a838, a839,
      a840, a841, a842, a843, a844, a845, a846, a847, a848,
      a849, a850, a851, a852, a853, a854, a855, a856, a857,
      a858, a859, a860, a861, a862, a863, a864, a865, a866,
      a867, a868, a869, a870, a871, a872, a873, a874, a875,
      a876, a877, a878, a879, a880, a881, a882, a883, a884,
      a885, a886, a887, a888, a889, a890, a891, a892, a893,
      a894, a895, a896, a897, a898, a899, a900, a901, a902,
      a903, a904, a905, a906, a907, a908, a909, a910, a911,
      a912, a913, a914, a915, a916, a917, a918, a919, a920,
      a921, a922, a923, a924, a925, a926, a927, a928, a929,
      a930, a931, a932, a933, a934, a935, a936, a937, a938,
      a939, a940, a941, a942, a943, a944, a945, a946, a947,
      a948, a949, a950, a951, a952, a953, a954, a955, a956,
      a957, a958, a959, a960, a961, a962, a963, a964, a965,
      a966, a967, a968, a969, a970, a971, a972, a973, a974,
      a975, a976, a977, a978, a979, a980, a981, a982, a983,
      a984, a985, a986, a987, a988, a989, a990, a991, a992,
      a993, a994, a995, a996, a997, a998, a999, a1000, a1001,
      a1002, a1003, a1004, a1005) {
    a0 = +a0;
    a1 = +a1;
    a2 = +a2;
    a3 = +a3;
    a4 = +a4;
    a5 = +a5;
    a6 = +a6;
    a7 = +a7;
    a8 = +a8;
    a9 = +a9;
    a10 = +a10;
    a11 = +a11;
    a12 = +a12;
    a13 = +a13;
    a14 = +a14;
    a15 = +a15;
    a16 = +a16;
    a17 = +a17;
    a18 = +a18;
    a19 = +a19;
    a20 = +a20;
    a21 = +a21;
    a22 = +a22;
    a23 = +a23;
    a24 = +a24;
    a25 = +a25;
    a26 = +a26;
    a27 = +a27;
    a28 = +a28;
    a29 = +a29;
    a30 = +a30;
    a31 = +a31;
    a32 = +a32;
    a33 = +a33;
    a34 = +a34;
    a35 = +a35;
    a36 = +a36;
    a37 = +a37;
    a38 = +a38;
    a39 = +a39;
    a40 = +a40;
    a41 = +a41;
    a42 = +a42;
    a43 = +a43;
    a44 = +a44;
    a45 = +a45;
    a46 = +a46;
    a47 = +a47;
    a48 = +a48;
    a49 = +a49;
    a50 = +a50;
    a51 = +a51;
    a52 = +a52;
    a53 = +a53;
    a54 = +a54;
    a55 = +a55;
    a56 = +a56;
    a57 = +a57;
    a58 = +a58;
    a59 = +a59;
    a60 = +a60;
    a61 = +a61;
    a62 = +a62;
    a63 = +a63;
    a64 = +a64;
    a65 = +a65;
    a66 = +a66;
    a67 = +a67;
    a68 = +a68;
    a69 = +a69;
    a70 = +a70;
    a71 = +a71;
    a72 = +a72;
    a73 = +a73;
    a74 = +a74;
    a75 = +a75;
    a76 = +a76;
    a77 = +a77;
    a78 = +a78;
    a79 = +a79;
    a80 = +a80;
    a81 = +a81;
    a82 = +a82;
    a83 = +a83;
    a84 = +a84;
    a85 = +a85;
    a86 = +a86;
    a87 = +a87;
    a88 = +a88;
    a89 = +a89;
    a90 = +a90;
    a91 = +a91;
    a92 = +a92;
    a93 = +a93;
    a94 = +a94;
    a95 = +a95;
    a96 = +a96;
    a97 = +a97;
    a98 = +a98;
    a99 = +a99;
    a100 = +a100;
    a101 = +a101;
    a102 = +a102;
    a103 = +a103;
    a104 = +a104;
    a105 = +a105;
    a106 = +a106;
    a107 = +a107;
    a108 = +a108;
    a109 = +a109;
    a110 = +a110;
    a111 = +a111;
    a112 = +a112;
    a113 = +a113;
    a114 = +a114;
    a115 = +a115;
    a116 = +a116;
    a117 = +a117;
    a118 = +a118;
    a119 = +a119;
    a120 = +a120;
    a121 = +a121;
    a122 = +a122;
    a123 = +a123;
    a124 = +a124;
    a125 = +a125;
    a126 = +a126;
    a127 = +a127;
    a128 = +a128;
    a129 = +a129;
    a130 = +a130;
    a131 = +a131;
    a132 = +a132;
    a133 = +a133;
    a134 = +a134;
    a135 = +a135;
    a136 = +a136;
    a137 = +a137;
    a138 = +a138;
    a139 = +a139;
    a140 = +a140;
    a141 = +a141;
    a142 = +a142;
    a143 = +a143;
    a144 = +a144;
    a145 = +a145;
    a146 = +a146;
    a147 = +a147;
    a148 = +a148;
    a149 = +a149;
    a150 = +a150;
    a151 = +a151;
    a152 = +a152;
    a153 = +a153;
    a154 = +a154;
    a155 = +a155;
    a156 = +a156;
    a157 = +a157;
    a158 = +a158;
    a159 = +a159;
    a160 = +a160;
    a161 = +a161;
    a162 = +a162;
    a163 = +a163;
    a164 = +a164;
    a165 = +a165;
    a166 = +a166;
    a167 = +a167;
    a168 = +a168;
    a169 = +a169;
    a170 = +a170;
    a171 = +a171;
    a172 = +a172;
    a173 = +a173;
    a174 = +a174;
    a175 = +a175;
    a176 = +a176;
    a177 = +a177;
    a178 = +a178;
    a179 = +a179;
    a180 = +a180;
    a181 = +a181;
    a182 = +a182;
    a183 = +a183;
    a184 = +a184;
    a185 = +a185;
    a186 = +a186;
    a187 = +a187;
    a188 = +a188;
    a189 = +a189;
    a190 = +a190;
    a191 = +a191;
    a192 = +a192;
    a193 = +a193;
    a194 = +a194;
    a195 = +a195;
    a196 = +a196;
    a197 = +a197;
    a198 = +a198;
    a199 = +a199;
    a200 = +a200;
    a201 = +a201;
    a202 = +a202;
    a203 = +a203;
    a204 = +a204;
    a205 = +a205;
    a206 = +a206;
    a207 = +a207;
    a208 = +a208;
    a209 = +a209;
    a210 = +a210;
    a211 = +a211;
    a212 = +a212;
    a213 = +a213;
    a214 = +a214;
    a215 = +a215;
    a216 = +a216;
    a217 = +a217;
    a218 = +a218;
    a219 = +a219;
    a220 = +a220;
    a221 = +a221;
    a222 = +a222;
    a223 = +a223;
    a224 = +a224;
    a225 = +a225;
    a226 = +a226;
    a227 = +a227;
    a228 = +a228;
    a229 = +a229;
    a230 = +a230;
    a231 = +a231;
    a232 = +a232;
    a233 = +a233;
    a234 = +a234;
    a235 = +a235;
    a236 = +a236;
    a237 = +a237;
    a238 = +a238;
    a239 = +a239;
    a240 = +a240;
    a241 = +a241;
    a242 = +a242;
    a243 = +a243;
    a244 = +a244;
    a245 = +a245;
    a246 = +a246;
    a247 = +a247;
    a248 = +a248;
    a249 = +a249;
    a250 = +a250;
    a251 = +a251;
    a252 = +a252;
    a253 = +a253;
    a254 = +a254;
    a255 = +a255;
    a256 = +a256;
    a257 = +a257;
    a258 = +a258;
    a259 = +a259;
    a260 = +a260;
    a261 = +a261;
    a262 = +a262;
    a263 = +a263;
    a264 = +a264;
    a265 = +a265;
    a266 = +a266;
    a267 = +a267;
    a268 = +a268;
    a269 = +a269;
    a270 = +a270;
    a271 = +a271;
    a272 = +a272;
    a273 = +a273;
    a274 = +a274;
    a275 = +a275;
    a276 = +a276;
    a277 = +a277;
    a278 = +a278;
    a279 = +a279;
    a280 = +a280;
    a281 = +a281;
    a282 = +a282;
    a283 = +a283;
    a284 = +a284;
    a285 = +a285;
    a286 = +a286;
    a287 = +a287;
    a288 = +a288;
    a289 = +a289;
    a290 = +a290;
    a291 = +a291;
    a292 = +a292;
    a293 = +a293;
    a294 = +a294;
    a295 = +a295;
    a296 = +a296;
    a297 = +a297;
    a298 = +a298;
    a299 = +a299;
    a300 = +a300;
    a301 = +a301;
    a302 = +a302;
    a303 = +a303;
    a304 = +a304;
    a305 = +a305;
    a306 = +a306;
    a307 = +a307;
    a308 = +a308;
    a309 = +a309;
    a310 = +a310;
    a311 = +a311;
    a312 = +a312;
    a313 = +a313;
    a314 = +a314;
    a315 = +a315;
    a316 = +a316;
    a317 = +a317;
    a318 = +a318;
    a319 = +a319;
    a320 = +a320;
    a321 = +a321;
    a322 = +a322;
    a323 = +a323;
    a324 = +a324;
    a325 = +a325;
    a326 = +a326;
    a327 = +a327;
    a328 = +a328;
    a329 = +a329;
    a330 = +a330;
    a331 = +a331;
    a332 = +a332;
    a333 = +a333;
    a334 = +a334;
    a335 = +a335;
    a336 = +a336;
    a337 = +a337;
    a338 = +a338;
    a339 = +a339;
    a340 = +a340;
    a341 = +a341;
    a342 = +a342;
    a343 = +a343;
    a344 = +a344;
    a345 = +a345;
    a346 = +a346;
    a347 = +a347;
    a348 = +a348;
    a349 = +a349;
    a350 = +a350;
    a351 = +a351;
    a352 = +a352;
    a353 = +a353;
    a354 = +a354;
    a355 = +a355;
    a356 = +a356;
    a357 = +a357;
    a358 = +a358;
    a359 = +a359;
    a360 = +a360;
    a361 = +a361;
    a362 = +a362;
    a363 = +a363;
    a364 = +a364;
    a365 = +a365;
    a366 = +a366;
    a367 = +a367;
    a368 = +a368;
    a369 = +a369;
    a370 = +a370;
    a371 = +a371;
    a372 = +a372;
    a373 = +a373;
    a374 = +a374;
    a375 = +a375;
    a376 = +a376;
    a377 = +a377;
    a378 = +a378;
    a379 = +a379;
    a380 = +a380;
    a381 = +a381;
    a382 = +a382;
    a383 = +a383;
    a384 = +a384;
    a385 = +a385;
    a386 = +a386;
    a387 = +a387;
    a388 = +a388;
    a389 = +a389;
    a390 = +a390;
    a391 = +a391;
    a392 = +a392;
    a393 = +a393;
    a394 = +a394;
    a395 = +a395;
    a396 = +a396;
    a397 = +a397;
    a398 = +a398;
    a399 = +a399;
    a400 = +a400;
    a401 = +a401;
    a402 = +a402;
    a403 = +a403;
    a404 = +a404;
    a405 = +a405;
    a406 = +a406;
    a407 = +a407;
    a408 = +a408;
    a409 = +a409;
    a410 = +a410;
    a411 = +a411;
    a412 = +a412;
    a413 = +a413;
    a414 = +a414;
    a415 = +a415;
    a416 = +a416;
    a417 = +a417;
    a418 = +a418;
    a419 = +a419;
    a420 = +a420;
    a421 = +a421;
    a422 = +a422;
    a423 = +a423;
    a424 = +a424;
    a425 = +a425;
    a426 = +a426;
    a427 = +a427;
    a428 = +a428;
    a429 = +a429;
    a430 = +a430;
    a431 = +a431;
    a432 = +a432;
    a433 = +a433;
    a434 = +a434;
    a435 = +a435;
    a436 = +a436;
    a437 = +a437;
    a438 = +a438;
    a439 = +a439;
    a440 = +a440;
    a441 = +a441;
    a442 = +a442;
    a443 = +a443;
    a444 = +a444;
    a445 = +a445;
    a446 = +a446;
    a447 = +a447;
    a448 = +a448;
    a449 = +a449;
    a450 = +a450;
    a451 = +a451;
    a452 = +a452;
    a453 = +a453;
    a454 = +a454;
    a455 = +a455;
    a456 = +a456;
    a457 = +a457;
    a458 = +a458;
    a459 = +a459;
    a460 = +a460;
    a461 = +a461;
    a462 = +a462;
    a463 = +a463;
    a464 = +a464;
    a465 = +a465;
    a466 = +a466;
    a467 = +a467;
    a468 = +a468;
    a469 = +a469;
    a470 = +a470;
    a471 = +a471;
    a472 = +a472;
    a473 = +a473;
    a474 = +a474;
    a475 = +a475;
    a476 = +a476;
    a477 = +a477;
    a478 = +a478;
    a479 = +a479;
    a480 = +a480;
    a481 = +a481;
    a482 = +a482;
    a483 = +a483;
    a484 = +a484;
    a485 = +a485;
    a486 = +a486;
    a487 = +a487;
    a488 = +a488;
    a489 = +a489;
    a490 = +a490;
    a491 = +a491;
    a492 = +a492;
    a493 = +a493;
    a494 = +a494;
    a495 = +a495;
    a496 = +a496;
    a497 = +a497;
    a498 = +a498;
    a499 = +a499;
    a500 = +a500;
    a501 = +a501;
    a502 = +a502;
    a503 = +a503;
    a504 = +a504;
    a505 = +a505;
    a506 = +a506;
    a507 = +a507;
    a508 = +a508;
    a509 = +a509;
    a510 = +a510;
    a511 = +a511;
    a512 = +a512;
    a513 = +a513;
    a514 = +a514;
    a515 = +a515;
    a516 = +a516;
    a517 = +a517;
    a518 = +a518;
    a519 = +a519;
    a520 = +a520;
    a521 = +a521;
    a522 = +a522;
    a523 = +a523;
    a524 = +a524;
    a525 = +a525;
    a526 = +a526;
    a527 = +a527;
    a528 = +a528;
    a529 = +a529;
    a530 = +a530;
    a531 = +a531;
    a532 = +a532;
    a533 = +a533;
    a534 = +a534;
    a535 = +a535;
    a536 = +a536;
    a537 = +a537;
    a538 = +a538;
    a539 = +a539;
    a540 = +a540;
    a541 = +a541;
    a542 = +a542;
    a543 = +a543;
    a544 = +a544;
    a545 = +a545;
    a546 = +a546;
    a547 = +a547;
    a548 = +a548;
    a549 = +a549;
    a550 = +a550;
    a551 = +a551;
    a552 = +a552;
    a553 = +a553;
    a554 = +a554;
    a555 = +a555;
    a556 = +a556;
    a557 = +a557;
    a558 = +a558;
    a559 = +a559;
    a560 = +a560;
    a561 = +a561;
    a562 = +a562;
    a563 = +a563;
    a564 = +a564;
    a565 = +a565;
    a566 = +a566;
    a567 = +a567;
    a568 = +a568;
    a569 = +a569;
    a570 = +a570;
    a571 = +a571;
    a572 = +a572;
    a573 = +a573;
    a574 = +a574;
    a575 = +a575;
    a576 = +a576;
    a577 = +a577;
    a578 = +a578;
    a579 = +a579;
    a580 = +a580;
    a581 = +a581;
    a582 = +a582;
    a583 = +a583;
    a584 = +a584;
    a585 = +a585;
    a586 = +a586;
    a587 = +a587;
    a588 = +a588;
    a589 = +a589;
    a590 = +a590;
    a591 = +a591;
    a592 = +a592;
    a593 = +a593;
    a594 = +a594;
    a595 = +a595;
    a596 = +a596;
    a597 = +a597;
    a598 = +a598;
    a599 = +a599;
    a600 = +a600;
    a601 = +a601;
    a602 = +a602;
    a603 = +a603;
    a604 = +a604;
    a605 = +a605;
    a606 = +a606;
    a607 = +a607;
    a608 = +a608;
    a609 = +a609;
    a610 = +a610;
    a611 = +a611;
    a612 = +a612;
    a613 = +a613;
    a614 = +a614;
    a615 = +a615;
    a616 = +a616;
    a617 = +a617;
    a618 = +a618;
    a619 = +a619;
    a620 = +a620;
    a621 = +a621;
    a622 = +a622;
    a623 = +a623;
    a624 = +a624;
    a625 = +a625;
    a626 = +a626;
    a627 = +a627;
    a628 = +a628;
    a629 = +a629;
    a630 = +a630;
    a631 = +a631;
    a632 = +a632;
    a633 = +a633;
    a634 = +a634;
    a635 = +a635;
    a636 = +a636;
    a637 = +a637;
    a638 = +a638;
    a639 = +a639;
    a640 = +a640;
    a641 = +a641;
    a642 = +a642;
    a643 = +a643;
    a644 = +a644;
    a645 = +a645;
    a646 = +a646;
    a647 = +a647;
    a648 = +a648;
    a649 = +a649;
    a650 = +a650;
    a651 = +a651;
    a652 = +a652;
    a653 = +a653;
    a654 = +a654;
    a655 = +a655;
    a656 = +a656;
    a657 = +a657;
    a658 = +a658;
    a659 = +a659;
    a660 = +a660;
    a661 = +a661;
    a662 = +a662;
    a663 = +a663;
    a664 = +a664;
    a665 = +a665;
    a666 = +a666;
    a667 = +a667;
    a668 = +a668;
    a669 = +a669;
    a670 = +a670;
    a671 = +a671;
    a672 = +a672;
    a673 = +a673;
    a674 = +a674;
    a675 = +a675;
    a676 = +a676;
    a677 = +a677;
    a678 = +a678;
    a679 = +a679;
    a680 = +a680;
    a681 = +a681;
    a682 = +a682;
    a683 = +a683;
    a684 = +a684;
    a685 = +a685;
    a686 = +a686;
    a687 = +a687;
    a688 = +a688;
    a689 = +a689;
    a690 = +a690;
    a691 = +a691;
    a692 = +a692;
    a693 = +a693;
    a694 = +a694;
    a695 = +a695;
    a696 = +a696;
    a697 = +a697;
    a698 = +a698;
    a699 = +a699;
    a700 = +a700;
    a701 = +a701;
    a702 = +a702;
    a703 = +a703;
    a704 = +a704;
    a705 = +a705;
    a706 = +a706;
    a707 = +a707;
    a708 = +a708;
    a709 = +a709;
    a710 = +a710;
    a711 = +a711;
    a712 = +a712;
    a713 = +a713;
    a714 = +a714;
    a715 = +a715;
    a716 = +a716;
    a717 = +a717;
    a718 = +a718;
    a719 = +a719;
    a720 = +a720;
    a721 = +a721;
    a722 = +a722;
    a723 = +a723;
    a724 = +a724;
    a725 = +a725;
    a726 = +a726;
    a727 = +a727;
    a728 = +a728;
    a729 = +a729;
    a730 = +a730;
    a731 = +a731;
    a732 = +a732;
    a733 = +a733;
    a734 = +a734;
    a735 = +a735;
    a736 = +a736;
    a737 = +a737;
    a738 = +a738;
    a739 = +a739;
    a740 = +a740;
    a741 = +a741;
    a742 = +a742;
    a743 = +a743;
    a744 = +a744;
    a745 = +a745;
    a746 = +a746;
    a747 = +a747;
    a748 = +a748;
    a749 = +a749;
    a750 = +a750;
    a751 = +a751;
    a752 = +a752;
    a753 = +a753;
    a754 = +a754;
    a755 = +a755;
    a756 = +a756;
    a757 = +a757;
    a758 = +a758;
    a759 = +a759;
    a760 = +a760;
    a761 = +a761;
    a762 = +a762;
    a763 = +a763;
    a764 = +a764;
    a765 = +a765;
    a766 = +a766;
    a767 = +a767;
    a768 = +a768;
    a769 = +a769;
    a770 = +a770;
    a771 = +a771;
    a772 = +a772;
    a773 = +a773;
    a774 = +a774;
    a775 = +a775;
    a776 = +a776;
    a777 = +a777;
    a778 = +a778;
    a779 = +a779;
    a780 = +a780;
    a781 = +a781;
    a782 = +a782;
    a783 = +a783;
    a784 = +a784;
    a785 = +a785;
    a786 = +a786;
    a787 = +a787;
    a788 = +a788;
    a789 = +a789;
    a790 = +a790;
    a791 = +a791;
    a792 = +a792;
    a793 = +a793;
    a794 = +a794;
    a795 = +a795;
    a796 = +a796;
    a797 = +a797;
    a798 = +a798;
    a799 = +a799;
    a800 = +a800;
    a801 = +a801;
    a802 = +a802;
    a803 = +a803;
    a804 = +a804;
    a805 = +a805;
    a806 = +a806;
    a807 = +a807;
    a808 = +a808;
    a809 = +a809;
    a810 = +a810;
    a811 = +a811;
    a812 = +a812;
    a813 = +a813;
    a814 = +a814;
    a815 = +a815;
    a816 = +a816;
    a817 = +a817;
    a818 = +a818;
    a819 = +a819;
    a820 = +a820;
    a821 = +a821;
    a822 = +a822;
    a823 = +a823;
    a824 = +a824;
    a825 = +a825;
    a826 = +a826;
    a827 = +a827;
    a828 = +a828;
    a829 = +a829;
    a830 = +a830;
    a831 = +a831;
    a832 = +a832;
    a833 = +a833;
    a834 = +a834;
    a835 = +a835;
    a836 = +a836;
    a837 = +a837;
    a838 = +a838;
    a839 = +a839;
    a840 = +a840;
    a841 = +a841;
    a842 = +a842;
    a843 = +a843;
    a844 = +a844;
    a845 = +a845;
    a846 = +a846;
    a847 = +a847;
    a848 = +a848;
    a849 = +a849;
    a850 = +a850;
    a851 = +a851;
    a852 = +a852;
    a853 = +a853;
    a854 = +a854;
    a855 = +a855;
    a856 = +a856;
    a857 = +a857;
    a858 = +a858;
    a859 = +a859;
    a860 = +a860;
    a861 = +a861;
    a862 = +a862;
    a863 = +a863;
    a864 = +a864;
    a865 = +a865;
    a866 = +a866;
    a867 = +a867;
    a868 = +a868;
    a869 = +a869;
    a870 = +a870;
    a871 = +a871;
    a872 = +a872;
    a873 = +a873;
    a874 = +a874;
    a875 = +a875;
    a876 = +a876;
    a877 = +a877;
    a878 = +a878;
    a879 = +a879;
    a880 = +a880;
    a881 = +a881;
    a882 = +a882;
    a883 = +a883;
    a884 = +a884;
    a885 = +a885;
    a886 = +a886;
    a887 = +a887;
    a888 = +a888;
    a889 = +a889;
    a890 = +a890;
    a891 = +a891;
    a892 = +a892;
    a893 = +a893;
    a894 = +a894;
    a895 = +a895;
    a896 = +a896;
    a897 = +a897;
    a898 = +a898;
    a899 = +a899;
    a900 = +a900;
    a901 = +a901;
    a902 = +a902;
    a903 = +a903;
    a904 = +a904;
    a905 = +a905;
    a906 = +a906;
    a907 = +a907;
    a908 = +a908;
    a909 = +a909;
    a910 = +a910;
    a911 = +a911;
    a912 = +a912;
    a913 = +a913;
    a914 = +a914;
    a915 = +a915;
    a916 = +a916;
    a917 = +a917;
    a918 = +a918;
    a919 = +a919;
    a920 = +a920;
    a921 = +a921;
    a922 = +a922;
    a923 = +a923;
    a924 = +a924;
    a925 = +a925;
    a926 = +a926;
    a927 = +a927;
    a928 = +a928;
    a929 = +a929;
    a930 = +a930;
    a931 = +a931;
    a932 = +a932;
    a933 = +a933;
    a934 = +a934;
    a935 = +a935;
    a936 = +a936;
    a937 = +a937;
    a938 = +a938;
    a939 = +a939;
    a940 = +a940;
    a941 = +a941;
    a942 = +a942;
    a943 = +a943;
    a944 = +a944;
    a945 = +a945;
    a946 = +a946;
    a947 = +a947;
    a948 = +a948;
    a949 = +a949;
    a950 = +a950;
    a951 = +a951;
    a952 = +a952;
    a953 = +a953;
    a954 = +a954;
    a955 = +a955;
    a956 = +a956;
    a957 = +a957;
    a958 = +a958;
    a959 = +a959;
    a960 = +a960;
    a961 = +a961;
    a962 = +a962;
    a963 = +a963;
    a964 = +a964;
    a965 = +a965;
    a966 = +a966;
    a967 = +a967;
    a968 = +a968;
    a969 = +a969;
    a970 = +a970;
    a971 = +a971;
    a972 = +a972;
    a973 = +a973;
    a974 = +a974;
    a975 = +a975;
    a976 = +a976;
    a977 = +a977;
    a978 = +a978;
    a979 = +a979;
    a980 = +a980;
    a981 = +a981;
    a982 = +a982;
    a983 = +a983;
    a984 = +a984;
    a985 = +a985;
    a986 = +a986;
    a987 = +a987;
    a988 = +a988;
    a989 = +a989;
    a990 = +a990;
    a991 = +a991;
    a992 = +a992;
    a993 = +a993;
    a994 = +a994;
    a995 = +a995;
    a996 = +a996;
    a997 = +a997;
    a998 = +a998;
    a999 = +a999;
    a1000 = +a1000;
    a1001 = +a1001;
    a1002 = +a1002;
    a1003 = +a1003;
    a1004 = +a1004;
    a1005 = +a1005;
    return 10;
  }
  function bar() {
    return foo(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
               0.0, 0.0, 0.0, 0.0, 1.0) |
           0;
  }
  return bar
})()();
