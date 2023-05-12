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

function CheckStrictMode(code, exception) {
  assertDoesNotThrow(code);
  assertThrows("'use strict';\n" + code, exception);
  assertThrows('"use strict";\n' + code, exception);
  assertDoesNotThrow("\
    function outer() {\
      function inner() {\n"
        + code +
      "\n}\
    }");
  assertThrows("\
    function outer() {\
      'use strict';\
      function inner() {\n"
        + code +
      "\n}\
    }", exception);
}

function CheckFunctionConstructorStrictMode() {
  var args = [];
  for (var i = 0; i < arguments.length; i ++) {
    args[i] = arguments[i];
  }
  // Create non-strict function. No exception.
  args[arguments.length] = "";
  assertDoesNotThrow(function() {
    Function.apply(this, args);
  });
  // Create strict mode function. Exception expected.
  args[arguments.length] = "'use strict';";
  assertThrows(function() {
    Function.apply(this, args);
  }, SyntaxError);
}

// Incorrect 'use strict' directive.
(function UseStrictEscape() {
  "use\\x20strict";
  with ({}) {};
})();

// Incorrectly place 'use strict' directive.
assertThrows("function foo (x) 'use strict'; {}", SyntaxError);

// 'use strict' in non-directive position.
(function UseStrictNonDirective() {
  void(0);
  "use strict";
  with ({}) {};
})();

// Multiple directives, including "use strict".
assertThrows('\
"directive 1";\
"another directive";\
"use strict";\
"directive after strict";\
"and one more";\
with({}) {}', SyntaxError);

// 'with' disallowed in strict mode.
CheckStrictMode("with({}) {}", SyntaxError);

// Function named 'eval'.
CheckStrictMode("function eval() {}", SyntaxError);

// Function named 'arguments'.
CheckStrictMode("function arguments() {}", SyntaxError);

// Function parameter named 'eval'.
CheckStrictMode("function foo(a, b, eval, c, d) {}", SyntaxError);

// Function parameter named 'arguments'.
CheckStrictMode("function foo(a, b, arguments, c, d) {}", SyntaxError);

// Property accessor parameter named 'eval'.
CheckStrictMode("var o = { set foo(eval) {} }", SyntaxError);

// Property accessor parameter named 'arguments'.
CheckStrictMode("var o = { set foo(arguments) {} }", SyntaxError);

// Duplicate function parameter name.
CheckStrictMode("function foo(a, b, c, d, b) {}", SyntaxError);

// Function constructor: eval parameter name.
CheckFunctionConstructorStrictMode("eval");

// Function constructor: arguments parameter name.
CheckFunctionConstructorStrictMode("arguments");

// Function constructor: duplicate parameter name.
CheckFunctionConstructorStrictMode("a", "b", "c", "b");
CheckFunctionConstructorStrictMode("a,b,c,b");

// catch(eval)
CheckStrictMode("try{}catch(eval){};", SyntaxError);

// catch(arguments)
CheckStrictMode("try{}catch(arguments){};", SyntaxError);

// var eval
CheckStrictMode("var eval;", SyntaxError);

// var arguments
CheckStrictMode("var arguments;", SyntaxError);

// Strict mode applies to the function in which the directive is used..
assertThrows('\
function foo(eval) {\
  "use strict";\
}', SyntaxError);

// Strict mode doesn't affect the outer stop of strict code.
(function NotStrict(eval) {
  function Strict() {
    "use strict";
  }
  with ({}) {};
})();

// Octal literal
CheckStrictMode("var x = 012", SyntaxError);
CheckStrictMode("012", SyntaxError);
CheckStrictMode("'Hello octal\\032'", SyntaxError);
CheckStrictMode("function octal() { return 012; }", SyntaxError);
CheckStrictMode("function octal() { return '\\032'; }", SyntaxError);

(function ValidEscape() {
  "use strict";
  var x = '\0';
  var y = "\0";
})();

// Octal before "use strict"
assertThrows('\
  function strict() {\
    "octal\\032directive";\
    "use strict";\
  }', SyntaxError);

(function StrictModeNonDuplicate() {
  "use strict";
  var x = { 123 : 1, "0123" : 2 };
  var x = {
    123: 1,
    '123.00000000000000000000000000000000000000000000000000000000000000000001':
      2
  };
})();

// Duplicate data properties are allowed in ES6
(function StrictModeDuplicateES6() {
  'use strict';
  var x = {
    123: 1,
    123.00000000000000000000000000000000000000000000000000000000000000000001: 2
  };
  var x = { dupe : 1, nondupe: 3, dupe : 2 };
  var x = { '1234' : 1, '2345' : 2, '1234' : 3 };
  var x = { '1234' : 1, '2345' : 2, 1234 : 3 };
  var x = { 3.14 : 1, 2.71 : 2, 3.14 : 3 };
  var x = { 3.14 : 1, '3.14' : 2 };

  var x = { get foo() { }, get foo() { } };
  var x = { get foo(){}, get 'foo'(){}};
  var x = { get 12(){}, get '12'(){}};

  // Two setters
  var x = { set foo(v) { }, set foo(v) { } };
  var x = { set foo(v) { }, set 'foo'(v) { } };
  var x = { set 13(v) { }, set '13'(v) { } };

  // Setter and data
  var x = { foo: 'data', set foo(v) { } };
  var x = { set foo(v) { }, foo: 'data' };
  var x = { foo: 'data', set 'foo'(v) { } };
  var x = { set foo(v) { }, 'foo': 'data' };
  var x = { 'foo': 'data', set foo(v) { } };
  var x = { set 'foo'(v) { }, foo: 'data' };
  var x = { 'foo': 'data', set 'foo'(v) { } };
  var x = { set 'foo'(v) { }, 'foo': 'data' };
  var x = { 12: 1, set '12'(v){}};
  var x = { 12: 1, set 12(v){}};
  var x = { '12': 1, set '12'(v){}};
  var x = { '12': 1, set 12(v){}};

  // Getter and data
  var x = { foo: 'data', get foo() { } };
  var x = { get foo() { }, foo: 'data' };
  var x = { 'foo': 'data', get foo() { } };
  var x = { get 'foo'() { }, 'foo': 'data' };
  var x = { '12': 1, get '12'(){}};
  var x = { '12': 1, get 12(){}};
})();

// Assignment to eval or arguments
CheckStrictMode("function strict() { eval = undefined; }", SyntaxError);
CheckStrictMode("function strict() { arguments = undefined; }", SyntaxError);
CheckStrictMode("function strict() { print(eval = undefined); }", SyntaxError);
CheckStrictMode("function strict() { print(arguments = undefined); }",
                SyntaxError);
CheckStrictMode("function strict() { var x = eval = undefined; }", SyntaxError);
CheckStrictMode("function strict() { var x = arguments = undefined; }",
                SyntaxError);

// Compound assignment to eval or arguments
CheckStrictMode("function strict() { eval *= undefined; }", SyntaxError);
CheckStrictMode("function strict() { arguments /= undefined; }", SyntaxError);
CheckStrictMode("function strict() { print(eval %= undefined); }", SyntaxError);
CheckStrictMode("function strict() { print(arguments %= undefined); }",
                SyntaxError);
CheckStrictMode("function strict() { var x = eval += undefined; }",
                SyntaxError);
CheckStrictMode("function strict() { var x = arguments -= undefined; }",
                SyntaxError);
CheckStrictMode("function strict() { eval <<= undefined; }", SyntaxError);
CheckStrictMode("function strict() { arguments >>= undefined; }", SyntaxError);
CheckStrictMode("function strict() { print(eval >>>= undefined); }",
                SyntaxError);
CheckStrictMode("function strict() { print(arguments &= undefined); }",
                SyntaxError);
CheckStrictMode("function strict() { var x = eval ^= undefined; }",
                SyntaxError);
CheckStrictMode("function strict() { var x = arguments |= undefined; }",
                SyntaxError);

// Postfix increment with eval or arguments
CheckStrictMode("function strict() { eval++; }", SyntaxError);
CheckStrictMode("function strict() { arguments++; }", SyntaxError);
CheckStrictMode("function strict() { print(eval++); }", SyntaxError);
CheckStrictMode("function strict() { print(arguments++); }", SyntaxError);
CheckStrictMode("function strict() { var x = eval++; }", SyntaxError);
CheckStrictMode("function strict() { var x = arguments++; }", SyntaxError);

// Postfix decrement with eval or arguments
CheckStrictMode("function strict() { eval--; }", SyntaxError);
CheckStrictMode("function strict() { arguments--; }", SyntaxError);
CheckStrictMode("function strict() { print(eval--); }", SyntaxError);
CheckStrictMode("function strict() { print(arguments--); }", SyntaxError);
CheckStrictMode("function strict() { var x = eval--; }", SyntaxError);
CheckStrictMode("function strict() { var x = arguments--; }", SyntaxError);

// Prefix increment with eval or arguments
CheckStrictMode("function strict() { ++eval; }", SyntaxError);
CheckStrictMode("function strict() { ++arguments; }", SyntaxError);
CheckStrictMode("function strict() { print(++eval); }", SyntaxError);
CheckStrictMode("function strict() { print(++arguments); }", SyntaxError);
CheckStrictMode("function strict() { var x = ++eval; }", SyntaxError);
CheckStrictMode("function strict() { var x = ++arguments; }", SyntaxError);

// Prefix decrement with eval or arguments
CheckStrictMode("function strict() { --eval; }", SyntaxError);
CheckStrictMode("function strict() { --arguments; }", SyntaxError);
CheckStrictMode("function strict() { print(--eval); }", SyntaxError);
CheckStrictMode("function strict() { print(--arguments); }", SyntaxError);
CheckStrictMode("function strict() { var x = --eval; }", SyntaxError);
CheckStrictMode("function strict() { var x = --arguments; }", SyntaxError);

// Delete of an unqualified identifier
CheckStrictMode("delete unqualified;", SyntaxError);
CheckStrictMode("function strict() { delete unqualified; }", SyntaxError);
CheckStrictMode("function function_name() { delete function_name; }",
                SyntaxError);
CheckStrictMode("function strict(parameter) { delete parameter; }",
                SyntaxError);
CheckStrictMode("function strict() { var variable; delete variable; }",
                SyntaxError);
CheckStrictMode("var variable; delete variable;", SyntaxError);

(function TestStrictDelete() {
  "use strict";
  // "delete this" is allowed in strict mode and should work.
  function strict_delete() { delete this; }
  strict_delete();
})();

// Prefix unary operators other than delete, ++, -- are valid in strict mode
(function StrictModeUnaryOperators() {
  "use strict";
  var x = [void eval, typeof eval, +eval, -eval, ~eval, !eval];
  var y = [void arguments, typeof arguments,
           +arguments, -arguments, ~arguments, !arguments];
})();

// 7.6.1.2 Future Reserved Words in strict mode
var future_strict_reserved_words = [
  "implements",
  "interface",
  "let",
  "package",
  "private",
  "protected",
  "public",
  "static",
  "yield" ];

function testFutureStrictReservedWord(word) {
  // Simple use of each reserved word
  CheckStrictMode("var " + word + " = 1;", SyntaxError);
  CheckStrictMode("typeof (" + word + ");", SyntaxError);

  // object literal properties
  eval("var x = { " + word + " : 42 };");
  eval("var x = { get " + word + " () {} };");
  eval("var x = { set " + word + " (value) {} };");
  eval("var x = { get " + word + " () { 'use strict'; } };");
  eval("var x = { set " + word + " (value) { 'use strict'; } };");

  // object literal with string literal property names
  eval("var x = { '" + word + "' : 42 };");
  eval("var x = { get '" + word + "' () { } };");
  eval("var x = { set '" + word + "' (value) { } };");
  eval("var x = { get '" + word + "' () { 'use strict'; } };");
  eval("var x = { set '" + word + "' (value) { 'use strict'; } };");

  // Function names and arguments, strict and non-strict contexts
  CheckStrictMode("function " + word + " () {}", SyntaxError);
  CheckStrictMode("function foo (" + word + ") {}", SyntaxError);
  CheckStrictMode("function foo (" + word + ", " + word + ") {}", SyntaxError);
  CheckStrictMode("function foo (a, " + word + ") {}", SyntaxError);
  CheckStrictMode("function foo (" + word + ", a) {}", SyntaxError);
  CheckStrictMode("function foo (a, " + word + ", b) {}", SyntaxError);
  CheckStrictMode("var foo = function (" + word + ") {}", SyntaxError);

  // Function names and arguments when the body is strict
  assertThrows("function " + word + " () { 'use strict'; }", SyntaxError);
  assertThrows("function foo (" + word + ", " + word + ") { 'use strict'; }",
               SyntaxError);
  assertThrows("function foo (a, " + word + ") { 'use strict'; }", SyntaxError);
  assertThrows("function foo (" + word + ", a) { 'use strict'; }", SyntaxError);
  assertThrows("function foo (a, " + word + ", b) { 'use strict'; }",
               SyntaxError);
  assertThrows("var foo = function (" + word + ") { 'use strict'; }",
               SyntaxError);

  // setter parameter when the body is strict
  CheckStrictMode("var x = { set foo(" + word + ") {} };", SyntaxError);
  assertThrows("var x = { set foo(" + word + ") { 'use strict'; } };",
               SyntaxError);
}

for (var i = 0; i < future_strict_reserved_words.length; i++) {
  testFutureStrictReservedWord(future_strict_reserved_words[i]);
}

function testAssignToUndefined(test, should_throw) {
  try {
    test();
  } catch (e) {
    assertTrue(should_throw, "strict mode");
    assertInstanceof(e, ReferenceError, "strict mode");
    return;
  }
  assertFalse(should_throw, "strict mode");
}

function repeat(n, f) {
  for (var i = 0; i < n; i ++) { f(); }
}

function assignToUndefined() {
  "use strict";
  possibly_undefined_variable_for_strict_mode_test = "should throw?";
}

testAssignToUndefined(assignToUndefined, true);
testAssignToUndefined(assignToUndefined, true);
testAssignToUndefined(assignToUndefined, true);

possibly_undefined_variable_for_strict_mode_test = "value";

testAssignToUndefined(assignToUndefined, false);
testAssignToUndefined(assignToUndefined, false);
testAssignToUndefined(assignToUndefined, false);

delete possibly_undefined_variable_for_strict_mode_test;

testAssignToUndefined(assignToUndefined, true);
testAssignToUndefined(assignToUndefined, true);
testAssignToUndefined(assignToUndefined, true);

repeat(10, function() { testAssignToUndefined(assignToUndefined, true); });
possibly_undefined_variable_for_strict_mode_test = "value";
repeat(10, function() { testAssignToUndefined(assignToUndefined, false); });
delete possibly_undefined_variable_for_strict_mode_test;
repeat(10, function() { testAssignToUndefined(assignToUndefined, true); });
possibly_undefined_variable_for_strict_mode_test = undefined;
repeat(10, function() { testAssignToUndefined(assignToUndefined, false); });

function assignToUndefinedWithEval() {
  "use strict";
  possibly_undefined_variable_for_strict_mode_test_with_eval = "should throw?";
  eval("");
}

testAssignToUndefined(assignToUndefinedWithEval, true);
testAssignToUndefined(assignToUndefinedWithEval, true);
testAssignToUndefined(assignToUndefinedWithEval, true);

possibly_undefined_variable_for_strict_mode_test_with_eval = "value";

testAssignToUndefined(assignToUndefinedWithEval, false);
testAssignToUndefined(assignToUndefinedWithEval, false);
testAssignToUndefined(assignToUndefinedWithEval, false);

delete possibly_undefined_variable_for_strict_mode_test_with_eval;

testAssignToUndefined(assignToUndefinedWithEval, true);
testAssignToUndefined(assignToUndefinedWithEval, true);
testAssignToUndefined(assignToUndefinedWithEval, true);

repeat(10, function() {
             testAssignToUndefined(assignToUndefinedWithEval, true);
           });
possibly_undefined_variable_for_strict_mode_test_with_eval = "value";
repeat(10, function() {
             testAssignToUndefined(assignToUndefinedWithEval, false);
           });
delete possibly_undefined_variable_for_strict_mode_test_with_eval;
repeat(10, function() {
             testAssignToUndefined(assignToUndefinedWithEval, true);
           });
possibly_undefined_variable_for_strict_mode_test_with_eval = undefined;
repeat(10, function() {
             testAssignToUndefined(assignToUndefinedWithEval, false);
           });



(function testDeleteNonConfigurable() {
  function delete_property(o) {
    "use strict";
    delete o.property;
  }
  function delete_element(o, i) {
    "use strict";
    delete o[i];
  }

  var object = {};

  Object.defineProperty(object, "property", { value: "property_value" });
  Object.defineProperty(object, "1", { value: "one" });
  Object.defineProperty(object, 7, { value: "seven" });
  Object.defineProperty(object, 3.14, { value: "pi" });

  assertThrows(function() { delete_property(object); }, TypeError);
  assertEquals(object.property, "property_value");
  assertThrows(function() { delete_element(object, "1"); }, TypeError);
  assertThrows(function() { delete_element(object, 1); }, TypeError);
  assertEquals(object[1], "one");
  assertThrows(function() { delete_element(object, "7"); }, TypeError);
  assertThrows(function() { delete_element(object, 7); }, TypeError);
  assertEquals(object[7], "seven");
  assertThrows(function() { delete_element(object, "3.14"); }, TypeError);
  assertThrows(function() { delete_element(object, 3.14); }, TypeError);
  assertEquals(object[3.14], "pi");
})();

// Not transforming this in Function.call and Function.apply.
(function testThisTransformCallApply() {
  function non_strict() {
    return this;
  }
  function strict() {
    "use strict";
    return this;
  }

  var global_object = (function() { return this; })();
  var object = {};

  // Non-strict call.
  assertTrue(non_strict.call(null) === global_object);
  assertTrue(non_strict.call(undefined) === global_object);
  assertEquals(typeof non_strict.call(7), "object");
  assertEquals(typeof non_strict.call("Hello"), "object");
  assertTrue(non_strict.call(object) === object);

  // Non-strict apply.
  assertTrue(non_strict.apply(null) === global_object);
  assertTrue(non_strict.apply(undefined) === global_object);
  assertEquals(typeof non_strict.apply(7), "object");
  assertEquals(typeof non_strict.apply("Hello"), "object");
  assertTrue(non_strict.apply(object) === object);

  // Strict call.
  assertTrue(strict.call(null) === null);
  assertTrue(strict.call(undefined) === undefined);
  assertEquals(typeof strict.call(7), "number");
  assertEquals(typeof strict.call("Hello"), "string");
  assertTrue(strict.call(object) === object);

  // Strict apply.
  assertTrue(strict.apply(null) === null);
  assertTrue(strict.apply(undefined) === undefined);
  assertEquals(typeof strict.apply(7), "number");
  assertEquals(typeof strict.apply("Hello"), "string");
  assertTrue(strict.apply(object) === object);
})();

(function testThisTransform() {
  try {
    function strict() {
      "use strict";
      return typeof(this);
    }
    function nonstrict() {
      return typeof(this);
    }

    // Concat to avoid symbol.
    var strict_name = "str" + "ict";
    var nonstrict_name = "non" + "str" + "ict";
    var strict_number = 17;
    var nonstrict_number = 19;
    var strict_name_get = "str" + "ict" + "get";
    var nonstrict_name_get = "non" + "str" + "ict" + "get"
    var strict_number_get = 23;
    var nonstrict_number_get = 29;

    function install(t) {
      t.prototype.strict = strict;
      t.prototype.nonstrict = nonstrict;
      t.prototype[strict_number] = strict;
      t.prototype[nonstrict_number] = nonstrict;
      Object.defineProperty(t.prototype, strict_name_get,
                            { get: function() { return strict; },
                              configurable: true });
      Object.defineProperty(t.prototype, nonstrict_name_get,
                            { get: function() { return nonstrict; },
                              configurable: true });
      Object.defineProperty(t.prototype, strict_number_get,
                            { get: function() { return strict; },
                              configurable: true });
      Object.defineProperty(t.prototype, nonstrict_number_get,
                            { get: function() { return nonstrict; },
                              configurable: true });
    }

    function cleanup(t) {
      delete t.prototype.strict;
      delete t.prototype.nonstrict;
      delete t.prototype[strict_number];
      delete t.prototype[nonstrict_number];
      delete t.prototype[strict_name_get];
      delete t.prototype[nonstrict_name_get];
      delete t.prototype[strict_number_get];
      delete t.prototype[nonstrict_number_get];
    }

    // Set up fakes
    install(String);
    install(Number);
    install(Boolean)

    function callStrict(o) {
      return o.strict();
    }
    function callNonStrict(o) {
      return o.nonstrict();
    }
    function callKeyedStrict(o) {
      return o[strict_name]();
    }
    function callKeyedNonStrict(o) {
      return o[nonstrict_name]();
    }
    function callIndexedStrict(o) {
      return o[strict_number]();
    }
    function callIndexedNonStrict(o) {
      return o[nonstrict_number]();
    }
    function callStrictGet(o) {
      return o.strictget();
    }
    function callNonStrictGet(o) {
      return o.nonstrictget();
    }
    function callKeyedStrictGet(o) {
      return o[strict_name_get]();
    }
    function callKeyedNonStrictGet(o) {
      return o[nonstrict_name_get]();
    }
    function callIndexedStrictGet(o) {
      return o[strict_number_get]();
    }
    function callIndexedNonStrictGet(o) {
      return o[nonstrict_number_get]();
    }

    for (var i = 0; i < 10; i ++) {
      assertEquals(("hello").strict(), "string");
      assertEquals(("hello").nonstrict(), "object");
      assertEquals(("hello")[strict_name](), "string");
      assertEquals(("hello")[nonstrict_name](), "object");
      assertEquals(("hello")[strict_number](), "string");
      assertEquals(("hello")[nonstrict_number](), "object");

      assertEquals((10 + i).strict(), "number");
      assertEquals((10 + i).nonstrict(), "object");
      assertEquals((10 + i)[strict_name](), "number");
      assertEquals((10 + i)[nonstrict_name](), "object");
      assertEquals((10 + i)[strict_number](), "number");
      assertEquals((10 + i)[nonstrict_number](), "object");

      assertEquals((true).strict(), "boolean");
      assertEquals((true).nonstrict(), "object");
      assertEquals((true)[strict_name](), "boolean");
      assertEquals((true)[nonstrict_name](), "object");
      assertEquals((true)[strict_number](), "boolean");
      assertEquals((true)[nonstrict_number](), "object");

      assertEquals((false).strict(), "boolean");
      assertEquals((false).nonstrict(), "object");
      assertEquals((false)[strict_name](), "boolean");
      assertEquals((false)[nonstrict_name](), "object");
      assertEquals((false)[strict_number](), "boolean");
      assertEquals((false)[nonstrict_number](), "object");

      assertEquals(callStrict("howdy"), "string");
      assertEquals(callNonStrict("howdy"), "object");
      assertEquals(callKeyedStrict("howdy"), "string");
      assertEquals(callKeyedNonStrict("howdy"), "object");
      assertEquals(callIndexedStrict("howdy"), "string");
      assertEquals(callIndexedNonStrict("howdy"), "object");

      assertEquals(callStrict(17 + i), "number");
      assertEquals(callNonStrict(17 + i), "object");
      assertEquals(callKeyedStrict(17 + i), "number");
      assertEquals(callKeyedNonStrict(17 + i), "object");
      assertEquals(callIndexedStrict(17 + i), "number");
      assertEquals(callIndexedNonStrict(17 + i), "object");

      assertEquals(callStrict(true), "boolean");
      assertEquals(callNonStrict(true), "object");
      assertEquals(callKeyedStrict(true), "boolean");
      assertEquals(callKeyedNonStrict(true), "object");
      assertEquals(callIndexedStrict(true), "boolean");
      assertEquals(callIndexedNonStrict(true), "object");

      assertEquals(callStrict(false), "boolean");
      assertEquals(callNonStrict(false), "object");
      assertEquals(callKeyedStrict(false), "boolean");
      assertEquals(callKeyedNonStrict(false), "object");
      assertEquals(callIndexedStrict(false), "boolean");
      assertEquals(callIndexedNonStrict(false), "object");

      // All of the above, with getters
      assertEquals(("hello").strictget(), "string");
      assertEquals(("hello").nonstrictget(), "object");
      assertEquals(("hello")[strict_name_get](), "string");
      assertEquals(("hello")[nonstrict_name_get](), "object");
      assertEquals(("hello")[strict_number_get](), "string");
      assertEquals(("hello")[nonstrict_number_get](), "object");

      assertEquals((10 + i).strictget(), "number");
      assertEquals((10 + i).nonstrictget(), "object");
      assertEquals((10 + i)[strict_name_get](), "number");
      assertEquals((10 + i)[nonstrict_name_get](), "object");
      assertEquals((10 + i)[strict_number_get](), "number");
      assertEquals((10 + i)[nonstrict_number_get](), "object");

      assertEquals((true).strictget(), "boolean");
      assertEquals((true).nonstrictget(), "object");
      assertEquals((true)[strict_name_get](), "boolean");
      assertEquals((true)[nonstrict_name_get](), "object");
      assertEquals((true)[strict_number_get](), "boolean");
      assertEquals((true)[nonstrict_number_get](), "object");

      assertEquals((false).strictget(), "boolean");
      assertEquals((false).nonstrictget(), "object");
      assertEquals((false)[strict_name_get](), "boolean");
      assertEquals((false)[nonstrict_name_get](), "object");
      assertEquals((false)[strict_number_get](), "boolean");
      assertEquals((false)[nonstrict_number_get](), "object");

      assertEquals(callStrictGet("howdy"), "string");
      assertEquals(callNonStrictGet("howdy"), "object");
      assertEquals(callKeyedStrictGet("howdy"), "string");
      assertEquals(callKeyedNonStrictGet("howdy"), "object");
      assertEquals(callIndexedStrictGet("howdy"), "string");
      assertEquals(callIndexedNonStrictGet("howdy"), "object");

      assertEquals(callStrictGet(17 + i), "number");
      assertEquals(callNonStrictGet(17 + i), "object");
      assertEquals(callKeyedStrictGet(17 + i), "number");
      assertEquals(callKeyedNonStrictGet(17 + i), "object");
      assertEquals(callIndexedStrictGet(17 + i), "number");
      assertEquals(callIndexedNonStrictGet(17 + i), "object");

      assertEquals(callStrictGet(true), "boolean");
      assertEquals(callNonStrictGet(true), "object");
      assertEquals(callKeyedStrictGet(true), "boolean");
      assertEquals(callKeyedNonStrictGet(true), "object");
      assertEquals(callIndexedStrictGet(true), "boolean");
      assertEquals(callIndexedNonStrictGet(true), "object");

      assertEquals(callStrictGet(false), "boolean");
      assertEquals(callNonStrictGet(false), "object");
      assertEquals(callKeyedStrictGet(false), "boolean");
      assertEquals(callKeyedNonStrictGet(false), "object");
      assertEquals(callIndexedStrictGet(false), "boolean");
      assertEquals(callIndexedNonStrictGet(false), "object");

    }
  } finally {
    // Cleanup
    cleanup(String);
    cleanup(Number);
    cleanup(Boolean);
  }
})();


(function ObjectEnvironment() {
  var o = {};
  Object.defineProperty(o, "foo", { value: "FOO", writable: false });
  assertThrows(
    function () {
      with (o) {
        (function() {
          "use strict";
          foo = "Hello";
        })();
      }
    },
    TypeError);
})();


(function TestSetPropertyWithoutSetter() {
  var o = { get foo() { return "Yey"; } };
  assertThrows(
    function broken() {
      "use strict";
      o.foo = (0xBADBAD00 >> 1);
    },
    TypeError);
})();


(function TestSetPropertyNonConfigurable() {
  var frozen = Object.freeze({});
  var sealed = Object.seal({});

  function strict(o) {
    "use strict";
    o.property = "value";
  }

  assertThrows(function() { strict(frozen); }, TypeError);
  assertThrows(function() { strict(sealed); }, TypeError);
})();


(function TestAssignmentToReadOnlyProperty() {
  "use strict";

  var o = {};
  Object.defineProperty(o, "property", { value: 7 });

  assertThrows(function() { o.property = "new value"; }, TypeError);
  assertThrows(function() { o.property += 10; }, TypeError);
  assertThrows(function() { o.property -= 10; }, TypeError);
  assertThrows(function() { o.property *= 10; }, TypeError);
  assertThrows(function() { o.property /= 10; }, TypeError);
  assertThrows(function() { o.property++; }, TypeError);
  assertThrows(function() { o.property--; }, TypeError);
  assertThrows(function() { ++o.property; }, TypeError);
  assertThrows(function() { --o.property; }, TypeError);

  var name = "prop" + "erty"; // to avoid symbol path.
  assertThrows(function() { o[name] = "new value"; }, TypeError);
  assertThrows(function() { o[name] += 10; }, TypeError);
  assertThrows(function() { o[name] -= 10; }, TypeError);
  assertThrows(function() { o[name] *= 10; }, TypeError);
  assertThrows(function() { o[name] /= 10; }, TypeError);
  assertThrows(function() { o[name]++; }, TypeError);
  assertThrows(function() { o[name]--; }, TypeError);
  assertThrows(function() { ++o[name]; }, TypeError);
  assertThrows(function() { --o[name]; }, TypeError);

  assertEquals(o.property, 7);
})();


(function TestAssignmentToReadOnlyLoop() {
  var name = "prop" + "erty"; // to avoid symbol path.
  var o = {};
  Object.defineProperty(o, "property", { value: 7 });

  function strict(o, name) {
    "use strict";
    o[name] = "new value";
  }

  for (var i = 0; i < 10; i ++) {
    var exception = false;
    try {
      strict(o, name);
    } catch(e) {
      exception = true;
      assertInstanceof(e, TypeError);
    }
    assertTrue(exception);
  }
})();


// Specialized KeyedStoreIC experiencing miss.
(function testKeyedStoreICStrict() {
  var o = [9,8,7,6,5,4,3,2,1];

  function test(o, i, v) {
    "use strict";
    o[i] = v;
  }

  for (var i = 0; i < 10; i ++) {
    test(o, 5, 17);        // start specialized for smi indices
    assertEquals(o[5], 17);
    test(o, "a", 19);
    assertEquals(o["a"], 19);
    test(o, "5", 29);
    assertEquals(o[5], 29);
    test(o, 100000, 31);
    assertEquals(o[100000], 31);
  }
})();


(function TestSetElementWithoutSetter() {
  "use strict";

  var o = { };
  Object.defineProperty(o, 0, { get : function() { } });

  var zero_smi = 0;
  var zero_number = new Number(0);
  var zero_symbol = "0";
  var zero_string = "-0-".substring(1,2);

  assertThrows(function() { o[zero_smi] = "new value"; }, TypeError);
  assertThrows(function() { o[zero_number] = "new value"; }, TypeError);
  assertThrows(function() { o[zero_symbol] = "new value"; }, TypeError);
  assertThrows(function() { o[zero_string] = "new value"; }, TypeError);
})();


(function TestSetElementNonConfigurable() {
  "use strict";
  var frozen = Object.freeze({});
  var sealed = Object.seal({});

  var zero_number = 0;
  var zero_symbol = "0";
  var zero_string = "-0-".substring(1,2);

  assertThrows(function() { frozen[zero_number] = "value"; }, TypeError);
  assertThrows(function() { sealed[zero_number] = "value"; }, TypeError);
  assertThrows(function() { frozen[zero_symbol] = "value"; }, TypeError);
  assertThrows(function() { sealed[zero_symbol] = "value"; }, TypeError);
  assertThrows(function() { frozen[zero_string] = "value"; }, TypeError);
  assertThrows(function() { sealed[zero_string] = "value"; }, TypeError);
})();


(function TestAssignmentToReadOnlyElement() {
  "use strict";

  var o = {};
  Object.defineProperty(o, 7, { value: 17 });

  var seven_smi = 7;
  var seven_number = new Number(7);
  var seven_symbol = "7";
  var seven_string = "-7-".substring(1,2);

  // Index with number.
  assertThrows(function() { o[seven_smi] = "value"; }, TypeError);
  assertThrows(function() { o[seven_smi] += 10; }, TypeError);
  assertThrows(function() { o[seven_smi] -= 10; }, TypeError);
  assertThrows(function() { o[seven_smi] *= 10; }, TypeError);
  assertThrows(function() { o[seven_smi] /= 10; }, TypeError);
  assertThrows(function() { o[seven_smi]++; }, TypeError);
  assertThrows(function() { o[seven_smi]--; }, TypeError);
  assertThrows(function() { ++o[seven_smi]; }, TypeError);
  assertThrows(function() { --o[seven_smi]; }, TypeError);

  assertThrows(function() { o[seven_number] = "value"; }, TypeError);
  assertThrows(function() { o[seven_number] += 10; }, TypeError);
  assertThrows(function() { o[seven_number] -= 10; }, TypeError);
  assertThrows(function() { o[seven_number] *= 10; }, TypeError);
  assertThrows(function() { o[seven_number] /= 10; }, TypeError);
  assertThrows(function() { o[seven_number]++; }, TypeError);
  assertThrows(function() { o[seven_number]--; }, TypeError);
  assertThrows(function() { ++o[seven_number]; }, TypeError);
  assertThrows(function() { --o[seven_number]; }, TypeError);

  assertThrows(function() { o[seven_symbol] = "value"; }, TypeError);
  assertThrows(function() { o[seven_symbol] += 10; }, TypeError);
  assertThrows(function() { o[seven_symbol] -= 10; }, TypeError);
  assertThrows(function() { o[seven_symbol] *= 10; }, TypeError);
  assertThrows(function() { o[seven_symbol] /= 10; }, TypeError);
  assertThrows(function() { o[seven_symbol]++; }, TypeError);
  assertThrows(function() { o[seven_symbol]--; }, TypeError);
  assertThrows(function() { ++o[seven_symbol]; }, TypeError);
  assertThrows(function() { --o[seven_symbol]; }, TypeError);

  assertThrows(function() { o[seven_string] = "value"; }, TypeError);
  assertThrows(function() { o[seven_string] += 10; }, TypeError);
  assertThrows(function() { o[seven_string] -= 10; }, TypeError);
  assertThrows(function() { o[seven_string] *= 10; }, TypeError);
  assertThrows(function() { o[seven_string] /= 10; }, TypeError);
  assertThrows(function() { o[seven_string]++; }, TypeError);
  assertThrows(function() { o[seven_string]--; }, TypeError);
  assertThrows(function() { ++o[seven_string]; }, TypeError);
  assertThrows(function() { --o[seven_string]; }, TypeError);

  assertEquals(o[seven_number], 17);
  assertEquals(o[seven_symbol], 17);
  assertEquals(o[seven_string], 17);
})();


(function TestAssignmentToReadOnlyLoop() {
  "use strict";

  var o = {};
  Object.defineProperty(o, 7, { value: 17 });

  var seven_smi = 7;
  var seven_number = new Number(7);
  var seven_symbol = "7";
  var seven_string = "-7-".substring(1,2);

  for (var i = 0; i < 10; i ++) {
    assertThrows(function() { o[seven_smi] = "value" }, TypeError);
    assertThrows(function() { o[seven_number] = "value" }, TypeError);
    assertThrows(function() { o[seven_symbol] = "value" }, TypeError);
    assertThrows(function() { o[seven_string] = "value" }, TypeError);
  }

  assertEquals(o[7], 17);
})();


(function TestAssignmentToStringLength() {
  "use strict";

  var str_val = "string";
  var str_obj = new String(str_val);
  var str_cat = str_val + str_val + str_obj;

  assertThrows(function() { str_val.length = 1; }, TypeError);
  assertThrows(function() { str_obj.length = 1; }, TypeError);
  assertThrows(function() { str_cat.length = 1; }, TypeError);
})();


(function TestArgumentsAliasing() {
  function strict(a, b) {
    "use strict";
    a = "c";
    b = "d";
    return [a, b, arguments[0], arguments[1]];
  }

  function nonstrict(a, b) {
    a = "c";
    b = "d";
    return [a, b, arguments[0], arguments[1]];
  }

  assertEquals(["c", "d", "a", "b"], strict("a", "b"));
  assertEquals(["c", "d", "c", "d"], nonstrict("a", "b"));
})();


function CheckFunctionPillDescriptor(func, name) {

  function CheckPill(pill) {
    assertEquals("function", typeof pill);
    assertInstanceof(pill, Function);
    pill.property = "value";
    assertEquals(pill.value, undefined);
    assertThrows(function() { 'use strict'; pill.property = "value"; },
                 TypeError);
    assertThrows(pill, TypeError);
    assertEquals(undefined, pill.prototype);
  }

  // Poisoned accessors are no longer own properties
  func = Object.getPrototypeOf(func);
  var descriptor = Object.getOwnPropertyDescriptor(func, name);
  CheckPill(descriptor.get)
  CheckPill(descriptor.set);
  assertFalse(descriptor.enumerable);
  // In ES6, restricted function properties are configurable
  assertTrue(descriptor.configurable);
}


function CheckArgumentsPillDescriptor(func, name) {

  function CheckPill(pill) {
    assertEquals("function", typeof pill);
    assertInstanceof(pill, Function);
    pill.property = "value";
    assertEquals(pill.value, undefined);
    assertThrows(function() { 'use strict'; pill.property = "value"; },
                 TypeError);
    assertThrows(pill, TypeError);
    assertEquals(undefined, pill.prototype);
  }

  var descriptor = Object.getOwnPropertyDescriptor(func, name);
  CheckPill(descriptor.get)
  CheckPill(descriptor.set);
  assertFalse(descriptor.enumerable);
  assertFalse(descriptor.configurable);
}


(function TestStrictFunctionPills() {
  function strict() {
    "use strict";
  }
  assertThrows(function() { strict.caller; }, TypeError);
  assertThrows(function() { strict.arguments; }, TypeError);
  assertThrows(function() { strict.caller = 42; }, TypeError);
  assertThrows(function() { strict.arguments = 42; }, TypeError);

  var another = new Function("'use strict'");
  assertThrows(function() { another.caller; }, TypeError);
  assertThrows(function() { another.arguments; }, TypeError);
  assertThrows(function() { another.caller = 42; }, TypeError);
  assertThrows(function() { another.arguments = 42; }, TypeError);

  var third = (function() { "use strict"; return function() {}; })();
  assertThrows(function() { third.caller; }, TypeError);
  assertThrows(function() { third.arguments; }, TypeError);
  assertThrows(function() { third.caller = 42; }, TypeError);
  assertThrows(function() { third.arguments = 42; }, TypeError);

  CheckFunctionPillDescriptor(strict, "caller");
  CheckFunctionPillDescriptor(strict, "arguments");
  CheckFunctionPillDescriptor(another, "caller");
  CheckFunctionPillDescriptor(another, "arguments");
  CheckFunctionPillDescriptor(third, "caller");
  CheckFunctionPillDescriptor(third, "arguments");
})();


(function TestStrictFunctionWritablePrototype() {
  "use strict";
  function TheClass() {
  }
  assertThrows(function() { TheClass.caller; }, TypeError);
  assertThrows(function() { TheClass.arguments; }, TypeError);

  // Strict functions must have writable prototype.
  TheClass.prototype = {
    func: function() { return "func_value"; },
    get accessor() { return "accessor_value"; },
    property: "property_value",
  };

  var o = new TheClass();
  assertEquals(o.func(), "func_value");
  assertEquals(o.accessor, "accessor_value");
  assertEquals(o.property, "property_value");
})();


(function TestStrictArgumentPills() {
  function strict() {
    "use strict";
    return arguments;
  }

  var args = strict();
  assertEquals(undefined, Object.getOwnPropertyDescriptor(args, "caller"));
  CheckArgumentsPillDescriptor(args, "callee");

  args = strict(17, "value", strict);
  assertEquals(17, args[0])
  assertEquals("value", args[1])
  assertEquals(strict, args[2]);
  assertEquals(undefined, Object.getOwnPropertyDescriptor(args, "caller"));
  CheckArgumentsPillDescriptor(args, "callee");

  function outer() {
    "use strict";
    function inner() {
      return arguments;
    }
    return inner;
  }

  var args = outer()();
  assertEquals(undefined, Object.getOwnPropertyDescriptor(args, "caller"));
  CheckArgumentsPillDescriptor(args, "callee");

  args = outer()(17, "value", strict);
  assertEquals(17, args[0])
  assertEquals("value", args[1])
  assertEquals(strict, args[2]);
  assertEquals(undefined, Object.getOwnPropertyDescriptor(args, "caller"));
  CheckArgumentsPillDescriptor(args, "callee");
})();


(function TestNonStrictFunctionCallerPillSimple() {
  function return_my_caller() {
    return return_my_caller.caller;
  }

  function strict() {
    "use strict";
    // Returning result via local variable to avoid tail call elimination.
    var res = return_my_caller();
    return res;
  }
  assertSame(null, strict());

  function non_strict() {
    return return_my_caller();
  }
  assertSame(non_strict(), non_strict);
})();


(function TestNonStrictFunctionCallerPill() {
  function strict(n) {
    "use strict";
    // Returning result via local variable to avoid tail call elimination.
    var res = non_strict(n);
    return res;
  }

  function recurse(n, then) {
    if (n > 0) {
      return recurse(n - 1, then);
    } else {
      return then();
    }
  }

  function non_strict(n) {
    return recurse(n, function() { return non_strict.caller; });
  }

  function test(n) {
    return recurse(n, function() { return strict(n); });
  }

  for (var i = 0; i < 10; i ++) {
    assertSame(null, test(i));
  }
})();


(function TestNonStrictFunctionCallerDescriptorPill() {
  function strict(n) {
    "use strict";
    // Returning result via local variable to avoid tail call elimination.
    var res = non_strict(n);
    return res;
  }

  function recurse(n, then) {
    if (n > 0) {
      return recurse(n - 1, then);
    } else {
      return then();
    }
  }

  function non_strict(n) {
    return recurse(n, function() {
      return Object.getOwnPropertyDescriptor(non_strict, "caller").value;
    });
  }

  function test(n) {
    return recurse(n, function() { return strict(n); });
  }

  for (var i = 0; i < 10; i ++) {
    assertSame(null, test(i));
  }
})();


(function TestStrictModeEval() {
  "use strict";
  eval("var eval_local = 10;");
  assertThrows(function() { return eval_local; }, ReferenceError);
})();
