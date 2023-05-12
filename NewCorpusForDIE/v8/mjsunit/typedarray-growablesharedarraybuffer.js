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

// Copyright 2021 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --harmony-rab-gsab --allow-natives-syntax --harmony-array-find-last

"use strict";

d8.file.execute('test/mjsunit/typedarray-helpers.js');

(function TypedArrayPrototype() {
  const gsab = CreateGrowableSharedArrayBuffer(40, 80);
  const sab = new SharedArrayBuffer(80);

  for (let ctor of ctors) {
    const ta_gsab = new ctor(gsab, 0, 3);
    const ta_sab = new ctor(sab, 0, 3);
    assertEquals(ta_gsab.__proto__, ta_sab.__proto__);
  }
})();

(function TypedArrayLengthAndByteLength() {
  const gsab = CreateGrowableSharedArrayBuffer(40, 80);

  for (let ctor of ctors) {
    const ta = new ctor(gsab, 0, 3);
    assertEquals(gsab, ta.buffer);
    assertEquals(3, ta.length);
    assertEquals(3 * ctor.BYTES_PER_ELEMENT, ta.byteLength);

    const empty_ta = new ctor(gsab, 0, 0);
    assertEquals(gsab, empty_ta.buffer);
    assertEquals(0, empty_ta.length);
    assertEquals(0, empty_ta.byteLength);

    const ta_with_offset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 3);
    assertEquals(gsab, ta_with_offset.buffer);
    assertEquals(3, ta_with_offset.length);
    assertEquals(3 * ctor.BYTES_PER_ELEMENT, ta_with_offset.byteLength);

    const empty_ta_with_offset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 0);
    assertEquals(gsab, empty_ta_with_offset.buffer);
    assertEquals(0, empty_ta_with_offset.length);
    assertEquals(0, empty_ta_with_offset.byteLength);

    const length_tracking_ta = new ctor(gsab);
    assertEquals(gsab, length_tracking_ta.buffer);
    assertEquals(40 / ctor.BYTES_PER_ELEMENT, length_tracking_ta.length);
    assertEquals(40, length_tracking_ta.byteLength);

    const offset = 8;
    const length_tracking_ta_with_offset = new ctor(gsab, offset);
    assertEquals(gsab, length_tracking_ta_with_offset.buffer);
    assertEquals((40 - offset) / ctor.BYTES_PER_ELEMENT,
                 length_tracking_ta_with_offset.length);
    assertEquals(40 - offset, length_tracking_ta_with_offset.byteLength);

    const length_tracking_ta_zero = new ctor(gsab, 40);
    assertEquals(gsab, length_tracking_ta_zero.buffer);
    assertEquals(0, length_tracking_ta_zero.length);
    assertEquals(0, length_tracking_ta_zero.byteLength);
  }
})();

(function ConstructInvalid() {
  const gsab = CreateGrowableSharedArrayBuffer(40, 80);

  for (let ctor of ctors) {
    // Length too big.
    assertThrows(() => { new ctor(gsab, 0, 40 / ctor.BYTES_PER_ELEMENT + 1); },
                 RangeError);

    // Offset too close to the end.
    assertThrows(() => { new ctor(gsab, 40 - ctor.BYTES_PER_ELEMENT, 2); },
                 RangeError);

    // Offset beyond end.
    assertThrows(() => { new ctor(gsab, 40, 1); }, RangeError);

    if (ctor.BYTES_PER_ELEMENT > 1) {
      // Offset not a multiple of ctor.BYTES_PER_ELEMENT.
      assertThrows(() => { new ctor(gsab, 1, 1); }, RangeError);
      assertThrows(() => { new ctor(gsab, 1); }, RangeError);
    }
  }

  // Verify the error messages.
  assertThrows(() => { new Int16Array(gsab, 1, 1); }, RangeError,
               /start offset of Int16Array should be a multiple of 2/);

  assertThrows(() => { new Int16Array(gsab, 38, 2); }, RangeError,
               /Invalid typed array length: 2/);
})();

(function ConstructFromTypedArray() {
  AllBigIntMatchedCtorCombinations((targetCtor, sourceCtor) => {
    const gsab = CreateGrowableSharedArrayBuffer(
        4 * sourceCtor.BYTES_PER_ELEMENT,
        8 * sourceCtor.BYTES_PER_ELEMENT);
    const fixedLength = new sourceCtor(gsab, 0, 4);
    const fixedLengthWithOffset = new sourceCtor(
        gsab, 2 * sourceCtor.BYTES_PER_ELEMENT, 2);
    const lengthTracking = new sourceCtor(gsab, 0);
    const lengthTrackingWithOffset = new sourceCtor(
        gsab, 2 * sourceCtor.BYTES_PER_ELEMENT);

    // Write some data into the array.
    const taFull = new sourceCtor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taFull, i, i + 1);
    }

    // Orig. array: [1, 2, 3, 4]
    //              [1, 2, 3, 4] << fixedLength
    //                    [3, 4] << fixedLengthWithOffset
    //              [1, 2, 3, 4, ...] << lengthTracking
    //                    [3, 4, ...] << lengthTrackingWithOffset

    assertEquals([1, 2, 3, 4], ToNumbers(new targetCtor(fixedLength)));
    assertEquals([3, 4], ToNumbers(new targetCtor(fixedLengthWithOffset)));
    assertEquals([1, 2, 3, 4], ToNumbers(new targetCtor(lengthTracking)));
    assertEquals([3, 4], ToNumbers(new targetCtor(lengthTrackingWithOffset)));

    // Grow.
    gsab.grow(6 * sourceCtor.BYTES_PER_ELEMENT);

    for (let i = 0; i < 6; ++i) {
      WriteToTypedArray(taFull, i, i + 1);
    }

    // Orig. array: [1, 2, 3, 4, 5, 6]
    //              [1, 2, 3, 4] << fixedLength
    //                    [3, 4] << fixedLengthWithOffset
    //              [1, 2, 3, 4, 5, 6, ...] << lengthTracking
    //                    [3, 4, 5, 6, ...] << lengthTrackingWithOffset

    assertEquals([1, 2, 3, 4], ToNumbers(new targetCtor(fixedLength)));
    assertEquals([3, 4], ToNumbers(new targetCtor(fixedLengthWithOffset)));
    assertEquals([1, 2, 3, 4, 5, 6],
                 ToNumbers(new targetCtor(lengthTracking)));
    assertEquals([3, 4, 5, 6],
                 ToNumbers(new targetCtor(lengthTrackingWithOffset)));
  });

  AllBigIntUnmatchedCtorCombinations((targetCtor, sourceCtor) => {
    const gsab = CreateGrowableSharedArrayBuffer(
        4 * sourceCtor.BYTES_PER_ELEMENT,
        8 * sourceCtor.BYTES_PER_ELEMENT);
    const fixedLength = new sourceCtor(gsab, 0, 4);
    const fixedLengthWithOffset = new sourceCtor(
        gsab, 2 * sourceCtor.BYTES_PER_ELEMENT, 2);
    const lengthTracking = new sourceCtor(gsab, 0);
    const lengthTrackingWithOffset = new sourceCtor(
        gsab, 2 * sourceCtor.BYTES_PER_ELEMENT);

    assertThrows(() => { new targetCtor(fixedLength); }, TypeError);
    assertThrows(() => { new targetCtor(fixedLengthWithOffset); }, TypeError);
    assertThrows(() => { new targetCtor(lengthTracking); }, TypeError);
    assertThrows(() => { new targetCtor(lengthTrackingWithOffset); },
                 TypeError);
  });

})();

(function ConstructFromTypedArraySpeciesConstructorNotCalled() {
  class MySharedArrayBuffer extends SharedArrayBuffer {
    constructor(...params) {
      super(...params);
    }
    static get [Symbol.species]() {
      throw new Error('This should not be called!');
    }
  };

  AllBigIntMatchedCtorCombinations((targetCtor, sourceCtor) => {
    const gsab = new MySharedArrayBuffer(
      4 * sourceCtor.BYTES_PER_ELEMENT,
      {maxByteLength: 8 * sourceCtor.BYTES_PER_ELEMENT});
    // Write some data into the array.
    const taWrite = new sourceCtor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }

    const fixedLength = new sourceCtor(gsab, 0, 4);
    assertEquals([0, 2, 4, 6], ToNumbers(new targetCtor(fixedLength)));

    const fixedLengthWithOffset = new sourceCtor(
        gsab, 2 * sourceCtor.BYTES_PER_ELEMENT, 2);
    assertEquals([4, 6], ToNumbers(new targetCtor(fixedLengthWithOffset)));

    const lengthTracking = new sourceCtor(gsab, 0);
    assertEquals([0, 2, 4, 6], ToNumbers(new targetCtor(lengthTracking)));

    const lengthTrackingWithOffset = new sourceCtor(
      gsab, 2 * sourceCtor.BYTES_PER_ELEMENT);
    assertEquals([4, 6], ToNumbers(new targetCtor(lengthTrackingWithOffset)));
  });
})();

(function TypedArrayLengthWhenGrown1() {
  const gsab = CreateGrowableSharedArrayBuffer(16, 40);

  // Create TAs which cover the bytes 0-7.
  let tas_and_lengths = [];
  for (let ctor of ctors) {
    const length = 8 / ctor.BYTES_PER_ELEMENT;
    tas_and_lengths.push([new ctor(gsab, 0, length), length]);
  }

  for (let [ta, length] of tas_and_lengths) {
    assertEquals(length, ta.length);
    assertEquals(length * ta.BYTES_PER_ELEMENT, ta.byteLength);
  }

  gsab.grow(20);

  for (let [ta, length] of tas_and_lengths) {
    assertEquals(length, ta.length);
    assertEquals(length * ta.BYTES_PER_ELEMENT, ta.byteLength);
  }

  gsab.grow(40);

  for (let [ta, length] of tas_and_lengths) {
    assertEquals(length, ta.length);
    assertEquals(length * ta.BYTES_PER_ELEMENT, ta.byteLength);
  }
})();

// The previous test with offsets.
(function TypedArrayLengthWhenGrown2() {
  const gsab = CreateGrowableSharedArrayBuffer(20, 40);

  // Create TAs which cover the bytes 8-15.
  let tas_and_lengths = [];
  for (let ctor of ctors) {
    const length = 8 / ctor.BYTES_PER_ELEMENT;
    tas_and_lengths.push([new ctor(gsab, 8, length), length]);
  }

  for (let [ta, length] of tas_and_lengths) {
    assertEquals(length, ta.length);
    assertEquals(length * ta.BYTES_PER_ELEMENT, ta.byteLength);
  }

  gsab.grow(20);

  for (let [ta, length] of tas_and_lengths) {
    assertEquals(length, ta.length);
    assertEquals(length * ta.BYTES_PER_ELEMENT, ta.byteLength);
  }

  gsab.grow(40);

  for (let [ta, length] of tas_and_lengths) {
    assertEquals(length, ta.length);
    assertEquals(length * ta.BYTES_PER_ELEMENT, ta.byteLength);
  }
})();

(function LengthTracking1() {
  const gsab = CreateGrowableSharedArrayBuffer(16, 40);

  let tas = [];
  for (let ctor of ctors) {
    tas.push(new ctor(gsab));
  }

  for (let ta of tas) {
    assertEquals(16 / ta.BYTES_PER_ELEMENT, ta.length);
    assertEquals(16, ta.byteLength);
  }

  gsab.grow(24);
  for (let ta of tas) {
    assertEquals(24 / ta.BYTES_PER_ELEMENT, ta.length);
    assertEquals(24, ta.byteLength);
  }

  // Grow to a number which is not a multiple of all byte_lengths.
  gsab.grow(26);
  for (let ta of tas) {
    const expected_length = Math.floor(26 / ta.BYTES_PER_ELEMENT);
    assertEquals(expected_length, ta.length);
    assertEquals(expected_length * ta.BYTES_PER_ELEMENT, ta.byteLength);
  }

  gsab.grow(40);

  for (let ta of tas) {
    assertEquals(40 / ta.BYTES_PER_ELEMENT, ta.length);
    assertEquals(40, ta.byteLength);
  }
})();

// The previous test with offsets.
(function LengthTracking2() {
  const gsab = CreateGrowableSharedArrayBuffer(16, 40);

  const offset = 8;
  let tas = [];
  for (let ctor of ctors) {
    tas.push(new ctor(gsab, offset));
  }

  for (let ta of tas) {
    assertEquals((16 - offset) / ta.BYTES_PER_ELEMENT, ta.length);
    assertEquals(16 - offset, ta.byteLength);
  }

  gsab.grow(24);
  for (let ta of tas) {
    assertEquals((24 - offset) / ta.BYTES_PER_ELEMENT, ta.length);
    assertEquals(24 - offset, ta.byteLength);
  }

  // Grow to a number which is not a multiple of all byte_lengths.
  gsab.grow(26);
  for (let ta of tas) {
    const expected_length = Math.floor((26 - offset)/ ta.BYTES_PER_ELEMENT);
    assertEquals(expected_length, ta.length);
    assertEquals(expected_length * ta.BYTES_PER_ELEMENT, ta.byteLength);
  }

  gsab.grow(40);

  for (let ta of tas) {
    assertEquals((40 - offset) / ta.BYTES_PER_ELEMENT, ta.length);
    assertEquals(40 - offset, ta.byteLength);
  }
})();

(function LoadWithFeedback() {
  function ReadElement2(ta) {
    return ta[2];
  }
  %EnsureFeedbackVectorForFunction(ReadElement2);

  const gsab = CreateGrowableSharedArrayBuffer(16, 40);

  const i8a = new Int8Array(gsab, 0, 4);
  for (let i = 0; i < 3; ++i) {
    assertEquals(0, ReadElement2(i8a));
  }

  // Within-bounds write
  for (let i = 0; i < 4; ++i) {
    i8a[i] = i;
  }

  // Within-bounds read
  for (let i = 0; i < 3; ++i) {
    assertEquals(2, ReadElement2(i8a));
  }

  gsab.grow(20);

  // Within-bounds read
  for (let i = 0; i < 3; ++i) {
    assertEquals(2, ReadElement2(i8a));
  }

  gsab.grow(40);

  // Within-bounds read
  for (let i = 0; i < 3; ++i) {
    assertEquals(2, ReadElement2(i8a));
  }
})();

(function LoadAndStoreWithFeedback() {
  function ReadElement(ta, i) {
    return ta[i];
  }

  function HasElement(ta, i) {
    return i in ta;
  }

  function WriteElement(ta, i, v) {
    ta[i] = v;
  }

  %EnsureFeedbackVectorForFunction(ReadElement);
  %EnsureFeedbackVectorForFunction(HasElement);
  %EnsureFeedbackVectorForFunction(WriteElement);

  const gsab = CreateGrowableSharedArrayBuffer(16, 40);

  const i8a = new Int8Array(gsab); // length-tracking
  assertEquals(16, i8a.length);

  // Within-bounds read
  for (let i = 0; i < i8a.length; ++i) {
    assertEquals(0, ReadElement(i8a, i));
    assertTrue(HasElement(i8a, i));
  }
  assertFalse(HasElement(i8a, 17));

  // Within-bounds write
  for (let i = 0; i < i8a.length; ++i) {
    WriteElement(i8a, i, i);
  }

  // Within-bounds read
  for (let i = 0; i < i8a.length; ++i) {
    assertEquals(i, ReadElement(i8a, i));
  }

  let old_length = i8a.length;
  gsab.grow(20);
  assertEquals(20, i8a.length);

  for (let i = 0; i < i8a.length; ++i) {
    if (i < old_length) {
      assertEquals(i, ReadElement(i8a, i));
    } else {
      assertEquals(0, ReadElement(i8a, i));
    }
    assertTrue(HasElement(i8a, i));
  }
  assertFalse(HasElement(i8a, 21));

  // Within-bounds write
  for (let i = 0; i < i8a.length; ++i) {
    WriteElement(i8a, i, i + 1);
  }

  // Within-bounds read
  for (let i = 0; i < i8a.length; ++i) {
    assertEquals(i + 1, ReadElement(i8a, i));
  }
})();

(function HasWithOffsetsWithFeedback() {
  function GetElements(ta) {
    let result = '';
    for (let i = 0; i < 8; ++i) {
      result += (i in ta) + ',';
      //           ^ feedback will be here
    }
    return result;
  }
  %EnsureFeedbackVectorForFunction(GetElements);

  const gsab = CreateGrowableSharedArrayBuffer(4, 8);
  const fixedLength = new Int8Array(gsab, 0, 4);
  const fixedLengthWithOffset = new Int8Array(gsab, 1, 3);
  const lengthTracking = new Int8Array(gsab, 0);
  const lengthTrackingWithOffset = new Int8Array(gsab, 1);

  assertEquals('true,true,true,true,false,false,false,false,',
               GetElements(fixedLength));
  assertEquals('true,true,true,false,false,false,false,false,',
              GetElements(fixedLengthWithOffset));
  assertEquals('true,true,true,true,false,false,false,false,',
              GetElements(lengthTracking));
  assertEquals('true,true,true,false,false,false,false,false,',
              GetElements(lengthTrackingWithOffset));

  gsab.grow(8);

  assertEquals('true,true,true,true,false,false,false,false,',
               GetElements(fixedLength));
  assertEquals('true,true,true,false,false,false,false,false,',
               GetElements(fixedLengthWithOffset));
  assertEquals('true,true,true,true,true,true,true,true,',
               GetElements(lengthTracking));
  assertEquals('true,true,true,true,true,true,true,false,',
               GetElements(lengthTrackingWithOffset));
})();

(function EnumerateElements() {
  let gsab = CreateGrowableSharedArrayBuffer(100, 200);
  for (let ctor of ctors) {
    const ta = new ctor(gsab, 0, 3);
    let keys = '';
    for (const key in ta) {
      keys += key;
    }
    assertEquals('012', keys);
  }
}());

(function IterateTypedArray() {
  const no_elements = 10;
  const offset = 2;

  function TestIteration(ta, expected) {
    let values = [];
    for (const value of ta) {
      values.push(Number(value));
    }
    assertEquals(expected, values);
  }

  for (let ctor of ctors) {
    const buffer_byte_length = no_elements * ctor.BYTES_PER_ELEMENT;
    // We can use the same GSAB for all the TAs below, since we won't modify it
    // after writing the initial values.
    const gsab = CreateGrowableSharedArrayBuffer(buffer_byte_length,
                                                 2 * buffer_byte_length);
    const byte_offset = offset * ctor.BYTES_PER_ELEMENT;

    // Write some data into the array.
    let ta_write = new ctor(gsab);
    for (let i = 0; i < no_elements; ++i) {
      WriteToTypedArray(ta_write, i, i % 128);
    }

    // Create various different styles of TypedArrays with the GSAB as the
    // backing store and iterate them.
    const ta = new ctor(gsab, 0, 3);
    TestIteration(ta, [0, 1, 2]);

    const empty_ta = new ctor(gsab, 0, 0);
    TestIteration(empty_ta, []);

    const ta_with_offset = new ctor(gsab, byte_offset, 3);
    TestIteration(ta_with_offset, [2, 3, 4]);

    const empty_ta_with_offset = new ctor(gsab, byte_offset, 0);
    TestIteration(empty_ta_with_offset, []);

    const length_tracking_ta = new ctor(gsab);
    {
      let expected = [];
      for (let i = 0; i < no_elements; ++i) {
        expected.push(i % 128);
      }
      TestIteration(length_tracking_ta, expected);
    }

    const length_tracking_ta_with_offset = new ctor(gsab, byte_offset);
    {
      let expected = [];
      for (let i = offset; i < no_elements; ++i) {
        expected.push(i % 128);
      }
      TestIteration(length_tracking_ta_with_offset, expected);
    }

    const empty_length_tracking_ta_with_offset = new ctor(gsab, buffer_byte_length);
    TestIteration(empty_length_tracking_ta_with_offset, []);
  }
}());

// Helpers for iteration tests.
function CreateGsab(buffer_byte_length, ctor) {
  const gsab = CreateGrowableSharedArrayBuffer(buffer_byte_length,
                                               2 * buffer_byte_length);
  // Write some data into the array.
  let ta_write = new ctor(gsab);
  for (let i = 0; i < buffer_byte_length / ctor.BYTES_PER_ELEMENT; ++i) {
    WriteToTypedArray(ta_write, i, i % 128);
  }
  return gsab;
}

function TestIterationAndGrow(ta, expected, gsab, grow_after,
                              new_byte_length) {
  let values = [];
  let grown = false;
  for (const value of ta) {
    if (value instanceof Array) {
      // When iterating via entries(), the values will be arrays [key, value].
      values.push([value[0], Number(value[1])]);
    } else {
      values.push(Number(value));
    }
    if (!grown && values.length == grow_after) {
      gsab.grow(new_byte_length);
      grown = true;
    }
  }
  assertEquals(expected, values);
  assertTrue(grown);
}

(function IterateTypedArrayAndGrowMidIteration() {
  const no_elements = 10;
  const offset = 2;

  for (let ctor of ctors) {
    const buffer_byte_length = no_elements * ctor.BYTES_PER_ELEMENT;
    const byte_offset = offset * ctor.BYTES_PER_ELEMENT;

    // Create various different styles of TypedArrays with the gsab as the
    // backing store and iterate them.

    // Fixed-length TAs aren't affected by resizing.
    let gsab = CreateGsab(buffer_byte_length, ctor);
    const ta = new ctor(gsab, 0, 3);
    TestIterationAndGrow(ta, [0, 1, 2], gsab, 2, buffer_byte_length * 2);

    gsab = CreateGsab(buffer_byte_length, ctor);
    const ta_with_offset = new ctor(gsab, byte_offset, 3);
    TestIterationAndGrow(ta_with_offset, [2, 3, 4], gsab, 2,
                         buffer_byte_length * 2);

    gsab = CreateGsab(buffer_byte_length, ctor);
    const length_tracking_ta = new ctor(gsab);
    {
      let expected = [];
      for (let i = 0; i < no_elements; ++i) {
        expected.push(i % 128);
      }
      // After resizing, the new memory contains zeros.
      for (let i = 0; i < no_elements; ++i) {
        expected.push(0);
      }

      TestIterationAndGrow(length_tracking_ta, expected, gsab, 2,
                           buffer_byte_length * 2);
    }

    gsab = CreateGsab(buffer_byte_length, ctor);
    const length_tracking_ta_with_offset = new ctor(gsab, byte_offset);
    {
      let expected = [];
      for (let i = offset; i < no_elements; ++i) {
        expected.push(i % 128);
      }
      for (let i = 0; i < no_elements; ++i) {
        expected.push(0);
      }
      TestIterationAndGrow(length_tracking_ta_with_offset, expected, gsab, 2,
                           buffer_byte_length * 2);
    }
  }
}());

(function IterateTypedArrayAndGrowJustBeforeIterationWouldEnd() {
  const no_elements = 10;
  const offset = 2;

  // We need to recreate the gsab between all TA tests, since we grow it.
  for (let ctor of ctors) {
    const buffer_byte_length = no_elements * ctor.BYTES_PER_ELEMENT;
    const byte_offset = offset * ctor.BYTES_PER_ELEMENT;

    // Create various different styles of TypedArrays with the gsab as the
    // backing store and iterate them.

    let gsab = CreateGsab(buffer_byte_length, ctor);
    const length_tracking_ta = new ctor(gsab);
    {
      let expected = [];
      for (let i = 0; i < no_elements; ++i) {
        expected.push(i % 128);
      }
      // After resizing, the new memory contains zeros.
      for (let i = 0; i < no_elements; ++i) {
        expected.push(0);
      }

      TestIterationAndGrow(length_tracking_ta, expected, gsab, no_elements,
                           buffer_byte_length * 2);
    }

    gsab = CreateGsab(buffer_byte_length, ctor);
    const length_tracking_ta_with_offset = new ctor(gsab, byte_offset);
    {
      let expected = [];
      for (let i = offset; i < no_elements; ++i) {
        expected.push(i % 128);
      }
      for (let i = 0; i < no_elements; ++i) {
        expected.push(0);
      }
      TestIterationAndGrow(length_tracking_ta_with_offset, expected, gsab,
                           no_elements - offset, buffer_byte_length * 2);
    }
  }
}());

(function Destructuring() {
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const fixedLength = new ctor(gsab, 0, 4);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    const lengthTracking = new ctor(gsab, 0);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);

    // Write some data into the array.
    let ta_write = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(ta_write, i, i);
    }

    {
      let [a, b, c, d, e] = fixedLength;
      assertEquals([0, 1, 2, 3], ToNumbers([a, b, c, d]));
      assertEquals(undefined, e);
    }

    {
      let [a, b, c] = fixedLengthWithOffset;
      assertEquals([2, 3], ToNumbers([a, b]));
      assertEquals(undefined, c);
    }

    {
      let [a, b, c, d, e] = lengthTracking;
      assertEquals([0, 1, 2, 3], ToNumbers([a, b, c, d]));
      assertEquals(undefined, e);
    }

    {
      let [a, b, c] = lengthTrackingWithOffset;
      assertEquals([2, 3], ToNumbers([a, b]));
      assertEquals(undefined, c);
    }

    // Grow. The new memory is zeroed.
    gsab.grow(6 * ctor.BYTES_PER_ELEMENT);

    {
      let [a, b, c, d, e] = fixedLength;
      assertEquals([0, 1, 2, 3], ToNumbers([a, b, c, d]));
      assertEquals(undefined, e);
    }

    {
      let [a, b, c] = fixedLengthWithOffset;
      assertEquals([2, 3], ToNumbers([a, b]));
      assertEquals(undefined, c);
    }

    {
      let [a, b, c, d, e, f, g] = lengthTracking;
      assertEquals([0, 1, 2, 3, 0, 0], ToNumbers([a, b, c, d, e, f]));
      assertEquals(undefined, g);
    }

    {
      let [a, b, c, d, e] = lengthTrackingWithOffset;
      assertEquals([2, 3, 0, 0], ToNumbers([a, b, c, d]));
      assertEquals(undefined, e);
    }
  }
}());

function TestFill(helper) {
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const fixedLength = new ctor(gsab, 0, 4);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    const lengthTracking = new ctor(gsab, 0);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);

    assertEquals([0, 0, 0, 0], ReadDataFromBuffer(gsab, ctor));

    helper(fixedLength, 1);
    assertEquals([1, 1, 1, 1], ReadDataFromBuffer(gsab, ctor));

    helper(fixedLengthWithOffset, 2);
    assertEquals([1, 1, 2, 2], ReadDataFromBuffer(gsab, ctor));

    helper(lengthTracking, 3);
    assertEquals([3, 3, 3, 3], ReadDataFromBuffer(gsab, ctor));

    helper(lengthTrackingWithOffset, 4);
    assertEquals([3, 3, 4, 4], ReadDataFromBuffer(gsab, ctor));

    gsab.grow(6 * ctor.BYTES_PER_ELEMENT);

    helper(fixedLength, 13);
    assertEquals([13, 13, 13, 13, 0, 0], ReadDataFromBuffer(gsab, ctor));

    helper(fixedLengthWithOffset, 14);
    assertEquals([13, 13, 14, 14, 0, 0], ReadDataFromBuffer(gsab, ctor));

    helper(lengthTracking, 15);
    assertEquals([15, 15, 15, 15, 15, 15], ReadDataFromBuffer(gsab, ctor));

    helper(lengthTrackingWithOffset, 16);
    assertEquals([15, 15, 16, 16, 16, 16], ReadDataFromBuffer(gsab, ctor));

    // Filling with non-undefined start & end.
    helper(fixedLength, 17, 1, 3);
    assertEquals([15, 17, 17, 16, 16, 16], ReadDataFromBuffer(gsab, ctor));

    helper(fixedLengthWithOffset, 18, 1, 2);
    assertEquals([15, 17, 17, 18, 16, 16], ReadDataFromBuffer(gsab, ctor));

    helper(lengthTracking, 19, 1, 3);
    assertEquals([15, 19, 19, 18, 16, 16], ReadDataFromBuffer(gsab, ctor));

    helper(lengthTrackingWithOffset, 20, 1, 2);
    assertEquals([15, 19, 19, 20, 16, 16], ReadDataFromBuffer(gsab, ctor));
  }
}
TestFill(TypedArrayFillHelper);
TestFill(ArrayFillHelper);

function At(atHelper) {
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const fixedLength = new ctor(gsab, 0, 4);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    const lengthTracking = new ctor(gsab, 0);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);

    // Write some data into the array.
    let ta_write = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(ta_write, i, i);
    }

    assertEquals(3, atHelper(fixedLength, -1));
    assertEquals(3, atHelper(lengthTracking, -1));
    assertEquals(3, atHelper(fixedLengthWithOffset, -1));
    assertEquals(3, atHelper(lengthTrackingWithOffset, -1));

    // Grow. New memory is zeroed.
    gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
    assertEquals(3, atHelper(fixedLength, -1));
    assertEquals(0, atHelper(lengthTracking, -1));
    assertEquals(3, atHelper(fixedLengthWithOffset, -1));
    assertEquals(0, atHelper(lengthTrackingWithOffset, -1));
  }
}
At(TypedArrayAtHelper);
At(ArrayAtHelper);

// The corresponding tests for Array.prototype.slice are in
// typedarray-growablesharedarraybuffer-array-methods.js.
(function Slice() {
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const fixedLength = new ctor(gsab, 0, 4);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    const lengthTracking = new ctor(gsab, 0);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);

    // Write some data into the array.
    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, i);
    }

    const fixedLengthSlice = fixedLength.slice();
    assertEquals([0, 1, 2, 3], ToNumbers(fixedLengthSlice));
    assertTrue(fixedLengthSlice.buffer instanceof ArrayBuffer);
    assertFalse(fixedLengthSlice.buffer instanceof SharedArrayBuffer);
    assertFalse(fixedLengthSlice.buffer.resizable);

    const fixedLengthWithOffsetSlice = fixedLengthWithOffset.slice();
    assertEquals([2, 3], ToNumbers(fixedLengthWithOffsetSlice));
    assertTrue(fixedLengthWithOffsetSlice.buffer instanceof ArrayBuffer);
    assertFalse(fixedLengthWithOffsetSlice.buffer instanceof SharedArrayBuffer);
    assertFalse(fixedLengthWithOffsetSlice.buffer.resizable);

    const lengthTrackingSlice = lengthTracking.slice();
    assertEquals([0, 1, 2, 3], ToNumbers(lengthTrackingSlice));
    assertTrue(lengthTrackingSlice.buffer instanceof ArrayBuffer);
    assertFalse(lengthTrackingSlice.buffer instanceof SharedArrayBuffer);
    assertFalse(lengthTrackingSlice.buffer.resizable);

    const lengthTrackingWithOffsetSlice = lengthTrackingWithOffset.slice();
    assertEquals([2, 3], ToNumbers(lengthTrackingWithOffsetSlice));
    assertTrue(lengthTrackingWithOffsetSlice.buffer instanceof ArrayBuffer);
    assertFalse(lengthTrackingWithOffsetSlice.buffer instanceof
        SharedArrayBuffer);
    assertFalse(lengthTrackingWithOffsetSlice.buffer.resizable);

    gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
    assertEquals([0, 1, 2, 3], ToNumbers(fixedLength.slice()));
    assertEquals([2, 3], ToNumbers(fixedLengthWithOffset.slice()));
    assertEquals([0, 1, 2, 3, 0, 0], ToNumbers(lengthTracking.slice()));
    assertEquals([2, 3, 0, 0], ToNumbers(lengthTrackingWithOffset.slice()));

    // Verify that the previously created slices aren't affected by the growing.
    assertEquals([0, 1, 2, 3], ToNumbers(fixedLengthSlice));
    assertEquals([2, 3], ToNumbers(fixedLengthWithOffsetSlice));
    assertEquals([0, 1, 2, 3], ToNumbers(lengthTrackingSlice));
    assertEquals([2, 3], ToNumbers(lengthTrackingWithOffsetSlice));
  }
})();

function SliceParameterConversionGrows(sliceHelper) {
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const lengthTracking = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(lengthTracking, i, i + 1);
    }
    const evil = { valueOf: () => { gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
                                    return 0; }};
    assertEquals([1, 2, 3, 4], ToNumbers(sliceHelper(lengthTracking, evil)));
    assertEquals(6 * ctor.BYTES_PER_ELEMENT, gsab.byteLength);
  }
}
SliceParameterConversionGrows(TypedArraySliceHelper);
SliceParameterConversionGrows(ArraySliceHelper);

// The corresponding test for Array.prototype.slice is not possible, since it
// doesn't call the species constructor if the "original array" is not an Array.
(function SliceSpeciesCreateResizes() {
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);

    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, 1);
    }

    let resizeWhenConstructorCalled = false;
    class MyArray extends ctor {
      constructor(...params) {
        super(...params);
        if (resizeWhenConstructorCalled) {
          gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
        }
      }
    };

    const fixedLength = new MyArray(gsab, 0, 4);
    resizeWhenConstructorCalled = true;
    const a = fixedLength.slice();
    assertEquals(4, a.length);
    assertEquals([1, 1, 1, 1], ToNumbers(a));

    assertEquals(6 * ctor.BYTES_PER_ELEMENT, gsab.byteLength);
  }

  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);

    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, 1);
    }

    let resizeWhenConstructorCalled = false;
    class MyArray extends ctor {
      constructor(...params) {
        super(...params);
        if (resizeWhenConstructorCalled) {
          gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
        }
      }
    };

    const lengthTracking = new MyArray(gsab);
    resizeWhenConstructorCalled = true;
    const a = lengthTracking.slice();
    assertEquals(6 * ctor.BYTES_PER_ELEMENT, gsab.byteLength);
    // The length of the resulting TypedArray is determined before
    // TypedArraySpeciesCreate is called, and it doesn't change.
    assertEquals(4, a.length);
    assertEquals([1, 1, 1, 1], ToNumbers(a));
  }
})();

function TestCopyWithin(helper) {
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const fixedLength = new ctor(gsab, 0, 4);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    const lengthTracking = new ctor(gsab, 0);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);

    // Write some data into the array.
    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, i);
    }

    // Orig. array: [0, 1, 2, 3]
    //              [0, 1, 2, 3] << fixedLength
    //                    [2, 3] << fixedLengthWithOffset
    //              [0, 1, 2, 3, ...] << lengthTracking
    //                    [2, 3, ...] << lengthTrackingWithOffset

    helper(fixedLength, 0, 2);
    assertEquals([2, 3, 2, 3], ToNumbers(fixedLength));

    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, i);
    }

    helper(fixedLengthWithOffset, 0, 1);
    assertEquals([3, 3], ToNumbers(fixedLengthWithOffset));

    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, i);
    }

    helper(lengthTracking, 0, 2);
    assertEquals([2, 3, 2, 3], ToNumbers(lengthTracking));

    helper(lengthTrackingWithOffset, 0, 1);
    assertEquals([3, 3], ToNumbers(lengthTrackingWithOffset));

    gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
    for (let i = 0; i < 6; ++i) {
      WriteToTypedArray(taWrite, i, i);
    }

    // Orig. array: [0, 1, 2, 3, 4, 5]
    //              [0, 1, 2, 3] << fixedLength
    //                    [2, 3] << fixedLengthWithOffset
    //              [0, 1, 2, 3, 4, 5, ...] << lengthTracking
    //                    [2, 3, 4, 5, ...] << lengthTrackingWithOffset

    helper(fixedLength, 0, 2);
    assertEquals([2, 3, 2, 3], ToNumbers(fixedLength));

    for (let i = 0; i < 6; ++i) {
      WriteToTypedArray(taWrite, i, i);
    }

    helper(fixedLengthWithOffset, 0, 1);
    assertEquals([3, 3], ToNumbers(fixedLengthWithOffset));

    for (let i = 0; i < 6; ++i) {
      WriteToTypedArray(taWrite, i, i);
    }

    //              [0, 1, 2, 3, 4, 5, ...] << lengthTracking
    //        target ^     ^ start
    helper(lengthTracking, 0, 2);
    assertEquals([2, 3, 4, 5, 4, 5], ToNumbers(lengthTracking));

    for (let i = 0; i < 6; ++i) {
      WriteToTypedArray(taWrite, i, i);
    }

    //                    [2, 3, 4, 5, ...] << lengthTrackingWithOffset
    //              target ^  ^ start
    helper(lengthTrackingWithOffset, 0, 1);
    assertEquals([3, 4, 5, 5], ToNumbers(lengthTrackingWithOffset));
  }
}
TestCopyWithin(TypedArrayCopyWithinHelper);
TestCopyWithin(ArrayCopyWithinHelper);

function CopyWithinParameterConversionGrows(helper) {
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const lengthTracking = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(lengthTracking, i, i);
    }

    const evil = { valueOf: () => { gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
                                    WriteToTypedArray(lengthTracking, 4, 4);
                                    WriteToTypedArray(lengthTracking, 5, 5);
                                    return 0;} };
    // Orig. array: [0, 1, 2, 3]  [4, 5]
    //               ^     ^       ^ new elements
    //          target     start
    helper(lengthTracking, evil, 2);
    // Only elements up to the original length are copied.
    assertEquals([2, 3, 2, 3, 4, 5], ToNumbers(lengthTracking));
  }
}
CopyWithinParameterConversionGrows(TypedArrayCopyWithinHelper);
CopyWithinParameterConversionGrows(ArrayCopyWithinHelper);

function EntriesKeysValues(keysHelper, valuesFromEntries, valuesFromValues) {
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const fixedLength = new ctor(gsab, 0, 4);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    const lengthTracking = new ctor(gsab, 0);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);

    // Write some data into the array.
    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }

    // Orig. array: [0, 2, 4, 6]
    //              [0, 2, 4, 6] << fixedLength
    //                    [4, 6] << fixedLengthWithOffset
    //              [0, 2, 4, 6, ...] << lengthTracking
    //                    [4, 6, ...] << lengthTrackingWithOffset

    assertEquals([0, 2, 4, 6], valuesFromEntries(fixedLength));
    assertEquals([0, 2, 4, 6], valuesFromValues(fixedLength));
    assertEquals([0, 1, 2, 3], Array.from(keysHelper(fixedLength)));

    assertEquals([4, 6], valuesFromEntries(fixedLengthWithOffset));
    assertEquals([4, 6], valuesFromValues(fixedLengthWithOffset));
    assertEquals([0, 1], Array.from(keysHelper(fixedLengthWithOffset)));

    assertEquals([0, 2, 4, 6], valuesFromEntries(lengthTracking));
    assertEquals([0, 2, 4, 6], valuesFromValues(lengthTracking));
    assertEquals([0, 1, 2, 3], Array.from(keysHelper(lengthTracking)));

    assertEquals([4, 6], valuesFromEntries(lengthTrackingWithOffset));
    assertEquals([4, 6], valuesFromValues(lengthTrackingWithOffset));
    assertEquals([0, 1], Array.from(keysHelper(lengthTrackingWithOffset)));

    // Grow.
    gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
    for (let i = 0; i < 6; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }

    // Orig. array: [0, 2, 4, 6, 8, 10]
    //              [0, 2, 4, 6] << fixedLength
    //                    [4, 6] << fixedLengthWithOffset
    //              [0, 2, 4, 6, 8, 10, ...] << lengthTracking
    //                    [4, 6, 8, 10, ...] << lengthTrackingWithOffset

    assertEquals([0, 2, 4, 6], valuesFromEntries(fixedLength));
    assertEquals([0, 2, 4, 6], valuesFromValues(fixedLength));
    assertEquals([0, 1, 2, 3], Array.from(keysHelper(fixedLength)));

    assertEquals([4, 6], valuesFromEntries(fixedLengthWithOffset));
    assertEquals([4, 6], valuesFromValues(fixedLengthWithOffset));
    assertEquals([0, 1], Array.from(keysHelper(fixedLengthWithOffset)));

    assertEquals([0, 2, 4, 6, 8, 10], valuesFromEntries(lengthTracking));
    assertEquals([0, 2, 4, 6, 8, 10], valuesFromValues(lengthTracking));
    assertEquals([0, 1, 2, 3, 4, 5], Array.from(keysHelper(lengthTracking)));

    assertEquals([4, 6, 8, 10], valuesFromEntries(lengthTrackingWithOffset));
    assertEquals([4, 6, 8, 10], valuesFromValues(lengthTrackingWithOffset));
    assertEquals([0, 1, 2, 3],
                 Array.from(keysHelper(lengthTrackingWithOffset)));
  }
}
EntriesKeysValues(
    TypedArrayKeysHelper, ValuesFromTypedArrayEntries,
    ValuesFromTypedArrayValues);
EntriesKeysValues(
    ArrayKeysHelper, ValuesFromArrayEntries, ValuesFromArrayValues);

function EntriesKeysValuesGrowMidIteration(
  entriesHelper, keysHelper, valuesHelper) {
  // Orig. array: [0, 2, 4, 6]
  //              [0, 2, 4, 6] << fixedLength
  //                    [4, 6] << fixedLengthWithOffset
  //              [0, 2, 4, 6, ...] << lengthTracking
  //                    [4, 6, ...] << lengthTrackingWithOffset
  function CreateGsabForTest(ctor) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    // Write some data into the array.
    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }
    return gsab;
  }

  // Iterating with entries() (the 4 loops below).
  for (let ctor of ctors) {
    const gsab = CreateGsabForTest(ctor);
    const fixedLength = new ctor(gsab, 0, 4);

    // The fixed length array is not affected by resizing.
    TestIterationAndGrow(entriesHelper(fixedLength),
                         [[0, 0], [1, 2], [2, 4], [3, 6]],
                         gsab, 2, 6 * ctor.BYTES_PER_ELEMENT);
  }

  for (let ctor of ctors) {
    const gsab = CreateGsabForTest(ctor);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);

    // The fixed length array is not affected by resizing.
    TestIterationAndGrow(entriesHelper(fixedLengthWithOffset),
                         [[0, 4], [1, 6]],
                         gsab, 2, 6 * ctor.BYTES_PER_ELEMENT);
  }

  for (let ctor of ctors) {
    const gsab = CreateGsabForTest(ctor);
    const lengthTracking = new ctor(gsab, 0);

    TestIterationAndGrow(entriesHelper(lengthTracking),
                         [[0, 0], [1, 2], [2, 4], [3, 6], [4, 0], [5, 0]],
                         gsab, 2, 6 * ctor.BYTES_PER_ELEMENT);
  }

  for (let ctor of ctors) {
    const gsab = CreateGsabForTest(ctor);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);

    TestIterationAndGrow(entriesHelper(lengthTrackingWithOffset),
                         [[0, 4], [1, 6], [2, 0], [3, 0]],
                         gsab, 2, 6 * ctor.BYTES_PER_ELEMENT);
  }

  // Iterating with keys() (the 4 loops below).
  for (let ctor of ctors) {
    const gsab = CreateGsabForTest(ctor);
    const fixedLength = new ctor(gsab, 0, 4);

    // The fixed length array is not affected by resizing.
    TestIterationAndGrow(keysHelper(fixedLength),
                         [0, 1, 2, 3],
                         gsab, 2, 6 * ctor.BYTES_PER_ELEMENT);
  }

  for (let ctor of ctors) {
    const gsab = CreateGsabForTest(ctor);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);

    // The fixed length array is not affected by resizing.
    TestIterationAndGrow(keysHelper(fixedLengthWithOffset),
                         [0, 1],
                         gsab, 2, 6 * ctor.BYTES_PER_ELEMENT);
  }

  for (let ctor of ctors) {
    const gsab = CreateGsabForTest(ctor);
    const lengthTracking = new ctor(gsab, 0);

    TestIterationAndGrow(keysHelper(lengthTracking),
                         [0, 1, 2, 3, 4, 5],
                         gsab, 2, 6 * ctor.BYTES_PER_ELEMENT);
  }

  for (let ctor of ctors) {
    const gsab = CreateGsabForTest(ctor);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);

    TestIterationAndGrow(keysHelper(lengthTrackingWithOffset),
                         [0, 1, 2, 3],
                         gsab, 2, 6 * ctor.BYTES_PER_ELEMENT);
  }

  // Iterating with values() (the 4 loops below).
  for (let ctor of ctors) {
    const gsab = CreateGsabForTest(ctor);
    const fixedLength = new ctor(gsab, 0, 4);

    // The fixed length array is not affected by resizing.
    TestIterationAndGrow(valuesHelper(fixedLength),
                         [0, 2, 4, 6],
                         gsab, 2, 6 * ctor.BYTES_PER_ELEMENT);
  }

  for (let ctor of ctors) {
    const gsab = CreateGsabForTest(ctor);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);

    // The fixed length array is not affected by resizing.
    TestIterationAndGrow(valuesHelper(fixedLengthWithOffset),
                         [4, 6],
                         gsab, 2, 6 * ctor.BYTES_PER_ELEMENT);
  }

  for (let ctor of ctors) {
    const gsab = CreateGsabForTest(ctor);
    const lengthTracking = new ctor(gsab, 0);

    TestIterationAndGrow(valuesHelper(lengthTracking),
                         [0, 2, 4, 6, 0, 0],
                         gsab, 2, 6 * ctor.BYTES_PER_ELEMENT);
  }

  for (let ctor of ctors) {
    const gsab = CreateGsabForTest(ctor);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);

    TestIterationAndGrow(valuesHelper(lengthTrackingWithOffset),
                         [4, 6, 0, 0],
                         gsab, 2, 6 * ctor.BYTES_PER_ELEMENT);
  }
}
EntriesKeysValuesGrowMidIteration(
  TypedArrayEntriesHelper, TypedArrayKeysHelper, TypedArrayValuesHelper);
EntriesKeysValuesGrowMidIteration(
  ArrayEntriesHelper, ArrayKeysHelper, ArrayValuesHelper);

function EverySome(everyHelper, someHelper) {
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const fixedLength = new ctor(gsab, 0, 4);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    const lengthTracking = new ctor(gsab, 0);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);

    // Write some data into the array.
    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }

    // Orig. array: [0, 2, 4, 6]
    //              [0, 2, 4, 6] << fixedLength
    //                    [4, 6] << fixedLengthWithOffset
    //              [0, 2, 4, 6, ...] << lengthTracking
    //                    [4, 6, ...] << lengthTrackingWithOffset

    function div3(n) {
      return Number(n) % 3 == 0;
    }

    function even(n) {
      return Number(n) % 2 == 0;
    }

    function over10(n) {
      return Number(n) > 10;
    }

    assertFalse(everyHelper(fixedLength, div3));
    assertTrue(everyHelper(fixedLength, even));
    assertTrue(someHelper(fixedLength, div3));
    assertFalse(someHelper(fixedLength, over10));

    assertFalse(everyHelper(fixedLengthWithOffset, div3));
    assertTrue(everyHelper(fixedLengthWithOffset, even));
    assertTrue(someHelper(fixedLengthWithOffset, div3));
    assertFalse(someHelper(fixedLengthWithOffset, over10));

    assertFalse(everyHelper(lengthTracking, div3));
    assertTrue(everyHelper(lengthTracking, even));
    assertTrue(someHelper(lengthTracking, div3));
    assertFalse(someHelper(lengthTracking, over10));

    assertFalse(everyHelper(lengthTrackingWithOffset, div3));
    assertTrue(everyHelper(lengthTrackingWithOffset, even));
    assertTrue(someHelper(lengthTrackingWithOffset, div3));
    assertFalse(someHelper(lengthTrackingWithOffset, over10));

    // Grow.
    gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
    for (let i = 0; i < 6; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }

    // Orig. array: [0, 2, 4, 6, 8, 10]
    //              [0, 2, 4, 6] << fixedLength
    //                    [4, 6] << fixedLengthWithOffset
    //              [0, 2, 4, 6, 8, 10, ...] << lengthTracking
    //                    [4, 6, 8, 10, ...] << lengthTrackingWithOffset

    assertFalse(everyHelper(fixedLength, div3));
    assertTrue(everyHelper(fixedLength, even));
    assertTrue(someHelper(fixedLength, div3));
    assertFalse(someHelper(fixedLength, over10));

    assertFalse(everyHelper(fixedLengthWithOffset, div3));
    assertTrue(everyHelper(fixedLengthWithOffset, even));
    assertTrue(someHelper(fixedLengthWithOffset, div3));
    assertFalse(someHelper(fixedLengthWithOffset, over10));

    assertFalse(everyHelper(lengthTracking, div3));
    assertTrue(everyHelper(lengthTracking, even));
    assertTrue(someHelper(lengthTracking, div3));
    assertFalse(someHelper(lengthTracking, over10));

    assertFalse(everyHelper(lengthTrackingWithOffset, div3));
    assertTrue(everyHelper(lengthTrackingWithOffset, even));
    assertTrue(someHelper(lengthTrackingWithOffset, div3));
    assertFalse(someHelper(lengthTrackingWithOffset, over10));
  }
}
EverySome(TypedArrayEveryHelper, TypedArraySomeHelper);
EverySome(ArrayEveryHelper, ArraySomeHelper);

function EveryGrowMidIteration(everyHelper) {
  // Orig. array: [0, 2, 4, 6]
  //              [0, 2, 4, 6] << fixedLength
  //                    [4, 6] << fixedLengthWithOffset
  //              [0, 2, 4, 6, ...] << lengthTracking
  //                    [4, 6, ...] << lengthTrackingWithOffset
  function CreateGsabForTest(ctor) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    // Write some data into the array.
    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }
    return gsab;
  }

  let values;
  let gsab;
  let growAfter;
  let growTo;
  function CollectValuesAndGrow(n) {
    if (n == undefined) {
      values.push(n);
    } else {
      values.push(Number(n));
    }
    if (values.length == growAfter) {
      gsab.grow(growTo);
    }
    return true;
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const fixedLength = new ctor(gsab, 0, 4);
    values = [];
    growAfter = 2;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertTrue(everyHelper(fixedLength, CollectValuesAndGrow));
    assertEquals([0, 2, 4, 6], values);
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    values = [];
    growAfter = 1;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertTrue(everyHelper(fixedLengthWithOffset, CollectValuesAndGrow));
    assertEquals([4, 6], values);
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const lengthTracking = new ctor(gsab, 0);
    values = [];
    growAfter = 2;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertTrue(everyHelper(lengthTracking, CollectValuesAndGrow));
    assertEquals([0, 2, 4, 6], values);
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);
    values = [];
    growAfter = 1;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertTrue(everyHelper(lengthTrackingWithOffset, CollectValuesAndGrow));
    assertEquals([4, 6], values);
  }
}
EveryGrowMidIteration(TypedArrayEveryHelper);
EveryGrowMidIteration(ArrayEveryHelper);

function SomeGrowMidIteration(someHelper) {
  // Orig. array: [0, 2, 4, 6]
  //              [0, 2, 4, 6] << fixedLength
  //                    [4, 6] << fixedLengthWithOffset
  //              [0, 2, 4, 6, ...] << lengthTracking
  //                    [4, 6, ...] << lengthTrackingWithOffset
  function CreateGsabForTest(ctor) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    // Write some data into the array.
    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }
    return gsab;
  }

  let values;
  let gsab;
  let growAfter;
  let growTo;
  function CollectValuesAndGrow(n) {
    if (n == undefined) {
      values.push(n);
    } else {
      values.push(Number(n));
    }
    if (values.length == growAfter) {
      gsab.grow(growTo);
    }
    return false;
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const fixedLength = new ctor(gsab, 0, 4);
    values = [];
    growAfter = 2;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertFalse(someHelper(fixedLength, CollectValuesAndGrow));
    assertEquals([0, 2, 4, 6], values);
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    values = [];
    gsab = gsab;
    growAfter = 1;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertFalse(someHelper(fixedLengthWithOffset, CollectValuesAndGrow));
    assertEquals([4, 6], values);
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const lengthTracking = new ctor(gsab, 0);
    values = [];
    growAfter = 2;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertFalse(someHelper(lengthTracking, CollectValuesAndGrow));
    assertEquals([0, 2, 4, 6], values);
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);
    values = [];
    growAfter = 1;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertFalse(someHelper(lengthTrackingWithOffset, CollectValuesAndGrow));
    assertEquals([4, 6], values);
  }
}
SomeGrowMidIteration(TypedArraySomeHelper);
SomeGrowMidIteration(ArraySomeHelper);

function FindFindIndexFindLastFindLastIndex(
  findHelper, findIndexHelper, findLastHelper, findLastIndexHelper) {
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const fixedLength = new ctor(gsab, 0, 4);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    const lengthTracking = new ctor(gsab, 0);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);

    // Write some data into the array.
    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }

    // Orig. array: [0, 2, 4, 6]
    //              [0, 2, 4, 6] << fixedLength
    //                    [4, 6] << fixedLengthWithOffset
    //              [0, 2, 4, 6, ...] << lengthTracking
    //                    [4, 6, ...] << lengthTrackingWithOffset

    function isTwoOrFour(n) {
      return n == 2 || n == 4;
    }

    assertEquals(2, Number(findHelper(fixedLength, isTwoOrFour)));
    assertEquals(4, Number(findHelper(fixedLengthWithOffset, isTwoOrFour)));
    assertEquals(2, Number(findHelper(lengthTracking, isTwoOrFour)));
    assertEquals(4, Number(findHelper(lengthTrackingWithOffset, isTwoOrFour)));

    assertEquals(1, findIndexHelper(fixedLength, isTwoOrFour));
    assertEquals(0, findIndexHelper(fixedLengthWithOffset, isTwoOrFour));
    assertEquals(1, findIndexHelper(lengthTracking, isTwoOrFour));
    assertEquals(0, findIndexHelper(lengthTrackingWithOffset, isTwoOrFour));

    assertEquals(4, Number(findLastHelper(fixedLength, isTwoOrFour)));
    assertEquals(4, Number(findLastHelper(fixedLengthWithOffset, isTwoOrFour)));
    assertEquals(4, Number(findLastHelper(lengthTracking, isTwoOrFour)));
    assertEquals(4,
                 Number(findLastHelper(lengthTrackingWithOffset, isTwoOrFour)));

    assertEquals(2, findLastIndexHelper(fixedLength, isTwoOrFour));
    assertEquals(0, findLastIndexHelper(fixedLengthWithOffset, isTwoOrFour));
    assertEquals(2, findLastIndexHelper(lengthTracking, isTwoOrFour));
    assertEquals(0, findLastIndexHelper(lengthTrackingWithOffset, isTwoOrFour));

    // Grow.
    gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, 0);
    }
    WriteToTypedArray(taWrite, 4, 2);
    WriteToTypedArray(taWrite, 5, 4);

    // Orig. array: [0, 0, 0, 0, 2, 4]
    //              [0, 0, 0, 0] << fixedLength
    //                    [0, 0] << fixedLengthWithOffset
    //              [0, 0, 0, 0, 2, 4, ...] << lengthTracking
    //                    [0, 0, 2, 4, ...] << lengthTrackingWithOffset

    assertEquals(undefined, findHelper(fixedLength, isTwoOrFour));
    assertEquals(undefined, findHelper(fixedLengthWithOffset, isTwoOrFour));
    assertEquals(2, Number(findHelper(lengthTracking, isTwoOrFour)));
    assertEquals(2, Number(findHelper(lengthTrackingWithOffset, isTwoOrFour)));

    assertEquals(-1, findIndexHelper(fixedLength, isTwoOrFour));
    assertEquals(-1, findIndexHelper(fixedLengthWithOffset, isTwoOrFour));
    assertEquals(4, findIndexHelper(lengthTracking, isTwoOrFour));
    assertEquals(2, findIndexHelper(lengthTrackingWithOffset, isTwoOrFour));

    assertEquals(undefined, findLastHelper(fixedLength, isTwoOrFour));
    assertEquals(undefined, findLastHelper(fixedLengthWithOffset, isTwoOrFour));
    assertEquals(4, Number(findLastHelper(lengthTracking, isTwoOrFour)));
    assertEquals(4,
                 Number(findLastHelper(lengthTrackingWithOffset, isTwoOrFour)));

    assertEquals(-1, findLastIndexHelper(fixedLength, isTwoOrFour));
    assertEquals(-1, findLastIndexHelper(fixedLengthWithOffset, isTwoOrFour));
    assertEquals(5, findLastIndexHelper(lengthTracking, isTwoOrFour));
    assertEquals(3, findLastIndexHelper(lengthTrackingWithOffset, isTwoOrFour));
  }
}
FindFindIndexFindLastFindLastIndex(
    TypedArrayFindHelper, TypedArrayFindIndexHelper, TypedArrayFindLastHelper,
    TypedArrayFindLastIndexHelper);
FindFindIndexFindLastFindLastIndex(
    ArrayFindHelper, ArrayFindIndexHelper, ArrayFindLastHelper,
    ArrayFindLastIndexHelper);

function FindGrowMidIteration(findHelper) {
  // Orig. array: [0, 2, 4, 6]
  //              [0, 2, 4, 6] << fixedLength
  //                    [4, 6] << fixedLengthWithOffset
  //              [0, 2, 4, 6, ...] << lengthTracking
  //                    [4, 6, ...] << lengthTrackingWithOffset
  function CreateGsabForTest(ctor) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    // Write some data into the array.
    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }
    return gsab;
  }

  let values;
  let gsab;
  let growAfter;
  let growTo;
  function CollectValuesAndGrow(n) {
    if (n == undefined) {
      values.push(n);
    } else {
      values.push(Number(n));
    }
    if (values.length == growAfter) {
      gsab.grow(growTo);
    }
    return false;
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const fixedLength = new ctor(gsab, 0, 4);
    values = [];
    growAfter = 2;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals(undefined, findHelper(fixedLength, CollectValuesAndGrow));
    assertEquals([0, 2, 4, 6], values);
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    values = [];
    growAfter = 1;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals(undefined,
                 findHelper(fixedLengthWithOffset, CollectValuesAndGrow));
    assertEquals([4, 6], values);
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const lengthTracking = new ctor(gsab, 0);
    values = [];
    growAfter = 2;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals(undefined, findHelper(lengthTracking, CollectValuesAndGrow));
    assertEquals([0, 2, 4, 6], values);
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);
    values = [];
    growAfter = 1;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals(undefined,
                 findHelper(lengthTrackingWithOffset, CollectValuesAndGrow));
    assertEquals([4, 6], values);
  }
}
FindGrowMidIteration(TypedArrayFindHelper);
FindGrowMidIteration(ArrayFindHelper);

function FindIndexGrowMidIteration(findIndexHelper) {
  // Orig. array: [0, 2, 4, 6]
  //              [0, 2, 4, 6] << fixedLength
  //                    [4, 6] << fixedLengthWithOffset
  //              [0, 2, 4, 6, ...] << lengthTracking
  //                    [4, 6, ...] << lengthTrackingWithOffset
  function CreateGsabForTest(ctor) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    // Write some data into the array.
    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }
    return gsab;
  }

  let values;
  let gsab;
  let growAfter;
  let growTo;
  function CollectValuesAndGrow(n) {
    if (n == undefined) {
      values.push(n);
    } else {
      values.push(Number(n));
    }
    if (values.length == growAfter) {
      gsab.grow(growTo);
    }
    return false;
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const fixedLength = new ctor(gsab, 0, 4);
    values = [];
    growAfter = 2;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals(-1, findIndexHelper(fixedLength, CollectValuesAndGrow));
    assertEquals([0, 2, 4, 6], values);
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    values = [];
    growAfter = 1;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals(-1,
                 findIndexHelper(fixedLengthWithOffset, CollectValuesAndGrow));
    assertEquals([4, 6], values);
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const lengthTracking = new ctor(gsab, 0);
    values = [];
    growAfter = 2;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals(-1, findIndexHelper(lengthTracking, CollectValuesAndGrow));
    assertEquals([0, 2, 4, 6], values);
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);
    values = [];
    growAfter = 1;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals(-1,
        findIndexHelper(lengthTrackingWithOffset, CollectValuesAndGrow));
    assertEquals([4, 6], values);
  }
}
FindIndexGrowMidIteration(TypedArrayFindIndexHelper);
FindIndexGrowMidIteration(ArrayFindIndexHelper);

function FindLastGrowMidIteration(findLastHelper) {
  // Orig. array: [0, 2, 4, 6]
  //              [0, 2, 4, 6] << fixedLength
  //                    [4, 6] << fixedLengthWithOffset
  //              [0, 2, 4, 6, ...] << lengthTracking
  //                    [4, 6, ...] << lengthTrackingWithOffset
  function CreateGsabForTest(ctor) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    // Write some data into the array.
    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }
    return gsab;
  }

  let values;
  let gsab;
  let growAfter;
  let growTo;
  function CollectValuesAndGrow(n) {
    if (n == undefined) {
      values.push(n);
    } else {
      values.push(Number(n));
    }
    if (values.length == growAfter) {
      gsab.grow(growTo);
    }
    return false;
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const fixedLength = new ctor(gsab, 0, 4);
    values = [];
    growAfter = 2;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals(undefined, findLastHelper(fixedLength, CollectValuesAndGrow));
    assertEquals([6, 4, 2, 0], values);
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    values = [];
    growAfter = 1;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals(undefined,
                 findLastHelper(fixedLengthWithOffset, CollectValuesAndGrow));
    assertEquals([6, 4], values);
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const lengthTracking = new ctor(gsab, 0);
    values = [];
    growAfter = 2;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals(undefined,
                 findLastHelper(lengthTracking, CollectValuesAndGrow));
    assertEquals([6, 4, 2, 0], values);
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);
    values = [];
    growAfter = 1;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals(undefined,
      findLastHelper(lengthTrackingWithOffset, CollectValuesAndGrow));
    assertEquals([6, 4], values);
  }
}
FindLastGrowMidIteration(TypedArrayFindLastHelper);
FindLastGrowMidIteration(ArrayFindLastHelper);

function FindLastIndexGrowMidIteration(findLastIndexHelper) {
  // Orig. array: [0, 2, 4, 6]
  //              [0, 2, 4, 6] << fixedLength
  //                    [4, 6] << fixedLengthWithOffset
  //              [0, 2, 4, 6, ...] << lengthTracking
  //                    [4, 6, ...] << lengthTrackingWithOffset
  function CreateGsabForTest(ctor) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    // Write some data into the array.
    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }
    return gsab;
  }

  let values;
  let gsab;
  let growAfter;
  let growTo;
  function CollectValuesAndGrow(n) {
    if (n == undefined) {
      values.push(n);
    } else {
      values.push(Number(n));
    }
    if (values.length == growAfter) {
      gsab.grow(growTo);
    }
    return false;
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const fixedLength = new ctor(gsab, 0, 4);
    values = [];
    growAfter = 2;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals(-1, findLastIndexHelper(fixedLength, CollectValuesAndGrow));
    assertEquals([6, 4, 2, 0], values);
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    values = [];
    growAfter = 1;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals(-1,
        findLastIndexHelper(fixedLengthWithOffset, CollectValuesAndGrow));
    assertEquals([6, 4], values);
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const lengthTracking = new ctor(gsab, 0);
    values = [];
    growAfter = 2;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals(-1,
                 findLastIndexHelper(lengthTracking, CollectValuesAndGrow));
    assertEquals([6, 4, 2, 0], values);
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);
    values = [];
    growAfter = 1;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals(-1,
        findLastIndexHelper(lengthTrackingWithOffset, CollectValuesAndGrow));
    assertEquals([6, 4], values);
  }
}
FindLastIndexGrowMidIteration(TypedArrayFindLastIndexHelper);
FindLastIndexGrowMidIteration(ArrayFindLastIndexHelper);

function Filter(filterHelper) {
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const fixedLength = new ctor(gsab, 0, 4);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    const lengthTracking = new ctor(gsab, 0);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);

    // Write some data into the array.
    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, i);
    }

    // Orig. array: [0, 1, 2, 3]
    //              [0, 1, 2, 3] << fixedLength
    //                    [2, 3] << fixedLengthWithOffset
    //              [0, 1, 2, 3, ...] << lengthTracking
    //                    [2, 3, ...] << lengthTrackingWithOffset

    function isEven(n) {
      return n != undefined && Number(n) % 2 == 0;
    }

    assertEquals([0, 2], ToNumbers(filterHelper(fixedLength, isEven)));
    assertEquals([2], ToNumbers(filterHelper(fixedLengthWithOffset, isEven)));
    assertEquals([0, 2], ToNumbers(filterHelper(lengthTracking, isEven)));
    assertEquals([2],
        ToNumbers(filterHelper(lengthTrackingWithOffset, isEven)));

    // Grow.
    gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
    for (let i = 0; i < 6; ++i) {
      WriteToTypedArray(taWrite, i, i);
    }

    // Orig. array: [0, 1, 2, 3, 4, 5]
    //              [0, 1, 2, 3] << fixedLength
    //                    [2, 3] << fixedLengthWithOffset
    //              [0, 1, 2, 3, 4, 5, ...] << lengthTracking
    //                    [2, 3, 4, 5, ...] << lengthTrackingWithOffset

    assertEquals([0, 2], ToNumbers(filterHelper(fixedLength, isEven)));
    assertEquals([2], ToNumbers(filterHelper(fixedLengthWithOffset, isEven)));
    assertEquals([0, 2, 4], ToNumbers(filterHelper(lengthTracking, isEven)));
    assertEquals([2, 4],
        ToNumbers(filterHelper(lengthTrackingWithOffset, isEven)));
  }
}
Filter(TypedArrayFilterHelper);
Filter(ArrayFilterHelper);

function FilterGrowMidIteration(filterHelper) {
  // Orig. array: [0, 2, 4, 6]
  //              [0, 2, 4, 6] << fixedLength
  //                    [4, 6] << fixedLengthWithOffset
  //              [0, 2, 4, 6, ...] << lengthTracking
  //                    [4, 6, ...] << lengthTrackingWithOffset
  function CreateGsabForTest(ctor) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    // Write some data into the array.
    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }
    return gsab;
  }

  let values;
  let gsab;
  let growAfter;
  let growTo;
  function CollectValuesAndGrow(n) {
    if (n == undefined) {
      values.push(n);
    } else {
      values.push(Number(n));
    }
    if (values.length == growAfter) {
      gsab.grow(growTo);
    }
    return false;
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const fixedLength = new ctor(gsab, 0, 4);
    values = [];
    growAfter = 2;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals([],
        ToNumbers(filterHelper(fixedLength, CollectValuesAndGrow)));
    assertEquals([0, 2, 4, 6], values);
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    values = [];
    growAfter = 1;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals([],
        ToNumbers(filterHelper(fixedLengthWithOffset, CollectValuesAndGrow)));
    assertEquals([4, 6], values);
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const lengthTracking = new ctor(gsab, 0);
    values = [];
    growAfter = 2;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals([],
        ToNumbers(filterHelper(lengthTracking, CollectValuesAndGrow)));
    assertEquals([0, 2, 4, 6], values);
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);
    values = [];
    growAfter = 1;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals([],
        ToNumbers(filterHelper(lengthTrackingWithOffset, CollectValuesAndGrow)));
    assertEquals([4, 6], values);
  }
}
FilterGrowMidIteration(TypedArrayFilterHelper);
FilterGrowMidIteration(ArrayFilterHelper);

function ForEachReduceReduceRight(
    forEachHelper, reduceHelper, reduceRightHelper) {
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const fixedLength = new ctor(gsab, 0, 4);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    const lengthTracking = new ctor(gsab, 0);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);

    // Write some data into the array.
    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }

    // Orig. array: [0, 2, 4, 6]
    //              [0, 2, 4, 6] << fixedLength
    //                    [4, 6] << fixedLengthWithOffset
    //              [0, 2, 4, 6, ...] << lengthTracking
    //                    [4, 6, ...] << lengthTrackingWithOffset

    function Helper(array) {
      const forEachValues = [];
      const reduceValues = [];
      const reduceRightValues = [];

      forEachHelper(array, (n) => { forEachValues.push(n);});

      reduceHelper(array, (acc, n) => {
        reduceValues.push(n);
      }, "initial value");

      reduceRightHelper(array, (acc, n) => {
        reduceRightValues.push(n);
      }, "initial value");

      assertEquals(reduceValues, forEachValues);
      reduceRightValues.reverse();
      assertEquals(reduceValues, reduceRightValues);
      return ToNumbers(forEachValues);
    }

    assertEquals([0, 2, 4, 6], Helper(fixedLength));
    assertEquals([4, 6], Helper(fixedLengthWithOffset));
    assertEquals([0, 2, 4, 6], Helper(lengthTracking));
    assertEquals([4, 6], Helper(lengthTrackingWithOffset));

    // Grow.
    gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
    for (let i = 0; i < 6; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }

    // Orig. array: [0, 2, 4, 6, 8, 10]
    //              [0, 2, 4, 6] << fixedLength
    //                    [4, 6] << fixedLengthWithOffset
    //              [0, 2, 4, 6, 8, 10, ...] << lengthTracking
    //                    [4, 6, 8, 10, ...] << lengthTrackingWithOffset

    assertEquals([0, 2, 4, 6], Helper(fixedLength));
    assertEquals([4, 6], Helper(fixedLengthWithOffset));
    assertEquals([0, 2, 4, 6, 8, 10], Helper(lengthTracking));
    assertEquals([4, 6, 8, 10], Helper(lengthTrackingWithOffset));
  }
}
ForEachReduceReduceRight(TypedArrayForEachHelper, TypedArrayReduceHelper,
                         TypedArrayReduceRightHelper);
ForEachReduceReduceRight(ArrayForEachHelper, ArrayReduceHelper,
                         ArrayReduceRightHelper);

function ForEachReduceReduceRightGrowMidIteration(
    forEachHelper, reduceHelper, reduceRightHelper) {
  // Orig. array: [0, 2, 4, 6]
  //              [0, 2, 4, 6] << fixedLength
  //                    [4, 6] << fixedLengthWithOffset
  //              [0, 2, 4, 6, ...] << lengthTracking
  //                    [4, 6, ...] << lengthTrackingWithOffset
  function CreateGsabForTest(ctor) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    // Write some data into the array.
    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }
    return gsab;
  }

  let values;
  let gsab;
  let growAfter;
  let growTo;
  function CollectValuesAndResize(n) {
    if (typeof n == 'bigint') {
      values.push(Number(n));
    } else {
      values.push(n);
    }
    if (values.length == growAfter) {
      gsab.grow(growTo);
    }
    return true;
  }

  function ForEachHelper(array) {
    values = [];
    forEachHelper(array, CollectValuesAndResize);
    return values;
  }

  function ReduceHelper(array) {
    values = [];
    reduceHelper(array, (acc, n) => { CollectValuesAndResize(n); },
                 "initial value");
    return values;
  }

  function ReduceRightHelper(array) {
    values = [];
    reduceRightHelper(array, (acc, n) => { CollectValuesAndResize(n); },
                      "initial value");
    return values;
  }

  // Test for forEach.

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const fixedLength = new ctor(gsab, 0, 4);
    growAfter = 2;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals([0, 2, 4, 6], ForEachHelper(fixedLength));
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    growAfter = 1;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals([4, 6], ForEachHelper(fixedLengthWithOffset));
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const lengthTracking = new ctor(gsab, 0);
    growAfter = 2;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals([0, 2, 4, 6], ForEachHelper(lengthTracking));
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);
    growAfter = 1;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals([4, 6], ForEachHelper(lengthTrackingWithOffset));
  }

  // Test for reduce.

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const fixedLength = new ctor(gsab, 0, 4);
    growAfter = 2;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals([0, 2, 4, 6], ReduceHelper(fixedLength));
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    growAfter = 1;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals([4, 6], ReduceHelper(fixedLengthWithOffset));
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const lengthTracking = new ctor(gsab, 0);
    growAfter = 2;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals([0, 2, 4, 6], ReduceHelper(lengthTracking));
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);
    growAfter = 1;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals([4, 6], ReduceHelper(lengthTrackingWithOffset));
  }

  // Test for reduceRight.

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const fixedLength = new ctor(gsab, 0, 4);
    growAfter = 2;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals([6, 4, 2, 0], ReduceRightHelper(fixedLength));
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    growAfter = 1;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals([6, 4], ReduceRightHelper(fixedLengthWithOffset));
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const lengthTracking = new ctor(gsab, 0);
    growAfter = 2;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals([6, 4, 2, 0], ReduceRightHelper(lengthTracking));
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);
    growAfter = 1;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals([6, 4], ReduceRightHelper(lengthTrackingWithOffset));
  }
}
ForEachReduceReduceRightGrowMidIteration(TypedArrayForEachHelper,
    TypedArrayReduceHelper, TypedArrayReduceRightHelper);
ForEachReduceReduceRightGrowMidIteration(ArrayForEachHelper,
    ArrayReduceHelper, ArrayReduceRightHelper);

function Includes(helper) {
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const fixedLength = new ctor(gsab, 0, 4);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    const lengthTracking = new ctor(gsab, 0);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);

    // Write some data into the array.
    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }

    // Orig. array: [0, 2, 4, 6]
    //              [0, 2, 4, 6] << fixedLength
    //                    [4, 6] << fixedLengthWithOffset
    //              [0, 2, 4, 6, ...] << lengthTracking
    //                    [4, 6, ...] << lengthTrackingWithOffset

    assertTrue(helper(fixedLength, 2));
    assertFalse(helper(fixedLength, undefined));
    assertTrue(helper(fixedLength, 2, 1));
    assertFalse(helper(fixedLength, 2, 2));
    assertTrue(helper(fixedLength, 2, -3));
    assertFalse(helper(fixedLength, 2, -2));

    assertFalse(helper(fixedLengthWithOffset, 2));
    assertTrue(helper(fixedLengthWithOffset, 4));
    assertFalse(helper(fixedLengthWithOffset, undefined));
    assertTrue(helper(fixedLengthWithOffset, 4, 0));
    assertFalse(helper(fixedLengthWithOffset, 4, 1));
    assertTrue(helper(fixedLengthWithOffset, 4, -2));
    assertFalse(helper(fixedLengthWithOffset, 4, -1));

    assertTrue(helper(lengthTracking, 2));
    assertFalse(helper(lengthTracking, undefined));
    assertTrue(helper(lengthTracking, 2, 1));
    assertFalse(helper(lengthTracking, 2, 2));
    assertTrue(helper(lengthTracking, 2, -3));
    assertFalse(helper(lengthTracking, 2, -2));

    assertFalse(helper(lengthTrackingWithOffset, 2));
    assertTrue(helper(lengthTrackingWithOffset, 4));
    assertFalse(helper(lengthTrackingWithOffset, undefined));
    assertTrue(helper(lengthTrackingWithOffset, 4, 0));
    assertFalse(helper(lengthTrackingWithOffset, 4, 1));
    assertTrue(helper(lengthTrackingWithOffset, 4, -2));
    assertFalse(helper(lengthTrackingWithOffset, 4, -1));

    // Grow.
    gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
    for (let i = 0; i < 6; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }

    // Orig. array: [0, 2, 4, 6, 8, 10]
    //              [0, 2, 4, 6] << fixedLength
    //                    [4, 6] << fixedLengthWithOffset
    //              [0, 2, 4, 6, 8, 10, ...] << lengthTracking
    //                    [4, 6, 8, 10, ...] << lengthTrackingWithOffset

    assertTrue(helper(fixedLength, 2));
    assertFalse(helper(fixedLength, undefined));
    assertFalse(helper(fixedLength, 8));

    assertFalse(helper(fixedLengthWithOffset, 2));
    assertTrue(helper(fixedLengthWithOffset, 4));
    assertFalse(helper(fixedLengthWithOffset, undefined));
    assertFalse(helper(fixedLengthWithOffset, 8));

    assertTrue(helper(lengthTracking, 2));
    assertFalse(helper(lengthTracking, undefined));
    assertTrue(helper(lengthTracking, 8));

    assertFalse(helper(lengthTrackingWithOffset, 2));
    assertTrue(helper(lengthTrackingWithOffset, 4));
    assertFalse(helper(lengthTrackingWithOffset, undefined));
    assertTrue(helper(lengthTrackingWithOffset, 8));
  }
}
Includes(TypedArrayIncludesHelper);
Includes(ArrayIncludesHelper);

function IncludesParameterConversionGrows(helper) {
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const lengthTracking = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(lengthTracking, i, 1);
    }

    let evil = { valueOf: () => {
      gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
      return 0;
    }};
    assertFalse(helper(lengthTracking, 0));
    // The TA grew but we only look at the data until the original length.
    assertFalse(helper(lengthTracking, 0, evil));
  }

  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const lengthTracking = new ctor(gsab);
    WriteToTypedArray(lengthTracking, 0, 1);

    let evil = { valueOf: () => {
      gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
      return -4;
    }};
    assertTrue(helper(lengthTracking, 1, -4));
    // The TA grew but the start index conversion is done based on the original
    // length.
    assertTrue(helper(lengthTracking, 1, evil));
  }
}
IncludesParameterConversionGrows(TypedArrayIncludesHelper);
IncludesParameterConversionGrows(ArrayIncludesHelper);

(function IncludesSpecialValues() {
  for (let ctor of floatCtors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const lengthTracking = new ctor(gsab);
    lengthTracking[0] = -Infinity;
    lengthTracking[1] = Infinity;
    lengthTracking[2] = NaN;
    assertTrue(lengthTracking.includes(-Infinity));
    assertTrue(lengthTracking.includes(Infinity));
    assertTrue(lengthTracking.includes(NaN));
  }
})();

function IndexOfLastIndexOf(indexOfHelper, lastIndexOfHelper) {
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const fixedLength = new ctor(gsab, 0, 4);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    const lengthTracking = new ctor(gsab, 0);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);

    // Write some data into the array.
    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, Math.floor(i / 2));
    }

    // Orig. array: [0, 0, 1, 1]
    //              [0, 0, 1, 1] << fixedLength
    //                    [1, 1] << fixedLengthWithOffset
    //              [0, 0, 1, 1, ...] << lengthTracking
    //                    [1, 1, ...] << lengthTrackingWithOffset

    assertEquals(0, indexOfHelper(fixedLength, 0));
    assertEquals(1, indexOfHelper(fixedLength, 0, 1));
    assertEquals(-1, indexOfHelper(fixedLength, 0, 2));
    assertEquals(-1, indexOfHelper(fixedLength, 0, -2));
    assertEquals(1, indexOfHelper(fixedLength, 0, -3));
    assertEquals(2, indexOfHelper(fixedLength, 1, 1));
    assertEquals(2, indexOfHelper(fixedLength, 1, -3));
    assertEquals(2, indexOfHelper(fixedLength, 1, -2));
    assertEquals(-1, indexOfHelper(fixedLength, undefined));

    assertEquals(1, lastIndexOfHelper(fixedLength, 0));
    assertEquals(1, lastIndexOfHelper(fixedLength, 0, 1));
    assertEquals(1, lastIndexOfHelper(fixedLength, 0, 2));
    assertEquals(1, lastIndexOfHelper(fixedLength, 0, -2));
    assertEquals(1, lastIndexOfHelper(fixedLength, 0, -3));
    assertEquals(-1, lastIndexOfHelper(fixedLength, 1, 1));
    assertEquals(2, lastIndexOfHelper(fixedLength, 1, -2));
    assertEquals(-1, lastIndexOfHelper(fixedLength, 1, -3));
    assertEquals(-1, lastIndexOfHelper(fixedLength, undefined));

    assertEquals(-1, indexOfHelper(fixedLengthWithOffset, 0));
    assertEquals(0, indexOfHelper(fixedLengthWithOffset, 1));
    assertEquals(0, indexOfHelper(fixedLengthWithOffset, 1, -2));
    assertEquals(1, indexOfHelper(fixedLengthWithOffset, 1, -1));
    assertEquals(-1, indexOfHelper(fixedLengthWithOffset, undefined));

    assertEquals(-1, lastIndexOfHelper(fixedLengthWithOffset, 0));
    assertEquals(1, lastIndexOfHelper(fixedLengthWithOffset, 1));
    assertEquals(0, lastIndexOfHelper(fixedLengthWithOffset, 1, -2));
    assertEquals(1, lastIndexOfHelper(fixedLengthWithOffset, 1, -1));
    assertEquals(-1, lastIndexOfHelper(fixedLengthWithOffset, undefined));

    assertEquals(0, indexOfHelper(lengthTracking, 0));
    assertEquals(-1, indexOfHelper(lengthTracking, 0, 2));
    assertEquals(2, indexOfHelper(lengthTracking, 1, -3));
    assertEquals(-1, indexOfHelper(lengthTracking, undefined));

    assertEquals(1, lastIndexOfHelper(lengthTracking, 0));
    assertEquals(1, lastIndexOfHelper(lengthTracking, 0, 2));
    assertEquals(1, lastIndexOfHelper(lengthTracking, 0, -3));
    assertEquals(-1, lastIndexOfHelper(lengthTracking, 1, 1));
    assertEquals(2, lastIndexOfHelper(lengthTracking, 1, 2));
    assertEquals(-1, lastIndexOfHelper(lengthTracking, 1, -3));
    assertEquals(-1, lastIndexOfHelper(lengthTracking, undefined));

    assertEquals(-1, indexOfHelper(lengthTrackingWithOffset, 0));
    assertEquals(0, indexOfHelper(lengthTrackingWithOffset, 1));
    assertEquals(1, indexOfHelper(lengthTrackingWithOffset, 1, 1));
    assertEquals(0, indexOfHelper(lengthTrackingWithOffset, 1, -2));
    assertEquals(-1, indexOfHelper(lengthTrackingWithOffset, undefined));

    assertEquals(-1, lastIndexOfHelper(lengthTrackingWithOffset, 0));
    assertEquals(1, lastIndexOfHelper(lengthTrackingWithOffset, 1));
    assertEquals(1, lastIndexOfHelper(lengthTrackingWithOffset, 1, 1));
    assertEquals(0, lastIndexOfHelper(lengthTrackingWithOffset, 1, -2));
    assertEquals(1, lastIndexOfHelper(lengthTrackingWithOffset, 1, -1));
    assertEquals(-1, lastIndexOfHelper(lengthTrackingWithOffset, undefined));

    // Grow.
    gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
    for (let i = 0; i < 6; ++i) {
      WriteToTypedArray(taWrite, i, Math.floor(i / 2));
    }

    // Orig. array: [0, 0, 1, 1, 2, 2]
    //              [0, 0, 1, 1] << fixedLength
    //                    [1, 1] << fixedLengthWithOffset
    //              [0, 0, 1, 1, 2, 2, ...] << lengthTracking
    //                    [1, 1, 2, 2, ...] << lengthTrackingWithOffset

    assertEquals(2, indexOfHelper(fixedLength, 1));
    assertEquals(-1, indexOfHelper(fixedLength, 2));
    assertEquals(-1, indexOfHelper(fixedLength, undefined));

    assertEquals(3, lastIndexOfHelper(fixedLength, 1));
    assertEquals(-1, lastIndexOfHelper(fixedLength, 2));
    assertEquals(-1, lastIndexOfHelper(fixedLength, undefined));

    assertEquals(-1, indexOfHelper(fixedLengthWithOffset, 0));
    assertEquals(0, indexOfHelper(fixedLengthWithOffset, 1));
    assertEquals(-1, indexOfHelper(fixedLengthWithOffset, 2));
    assertEquals(-1, indexOfHelper(fixedLengthWithOffset, undefined));

    assertEquals(-1, lastIndexOfHelper(fixedLengthWithOffset, 0));
    assertEquals(1, lastIndexOfHelper(fixedLengthWithOffset, 1));
    assertEquals(-1, lastIndexOfHelper(fixedLengthWithOffset, 2));
    assertEquals(-1, lastIndexOfHelper(fixedLengthWithOffset, undefined));

    assertEquals(2, indexOfHelper(lengthTracking, 1));
    assertEquals(4, indexOfHelper(lengthTracking, 2));
    assertEquals(-1, indexOfHelper(lengthTracking, undefined));

    assertEquals(3, lastIndexOfHelper(lengthTracking, 1));
    assertEquals(5, lastIndexOfHelper(lengthTracking, 2));
    assertEquals(-1, lastIndexOfHelper(lengthTracking, undefined));

    assertEquals(-1, indexOfHelper(lengthTrackingWithOffset, 0));
    assertEquals(0, indexOfHelper(lengthTrackingWithOffset, 1));
    assertEquals(2, indexOfHelper(lengthTrackingWithOffset, 2));
    assertEquals(-1, indexOfHelper(lengthTrackingWithOffset, undefined));

    assertEquals(-1, lastIndexOfHelper(lengthTrackingWithOffset, 0));
    assertEquals(1, lastIndexOfHelper(lengthTrackingWithOffset, 1));
    assertEquals(3, lastIndexOfHelper(lengthTrackingWithOffset, 2));
    assertEquals(-1, lastIndexOfHelper(lengthTrackingWithOffset, undefined));
  }
}
IndexOfLastIndexOf(TypedArrayIndexOfHelper, TypedArrayLastIndexOfHelper);
IndexOfLastIndexOf(ArrayIndexOfHelper, ArrayLastIndexOfHelper);

function IndexOfParameterConversionGrows(indexOfHelper) {
  // Growing + length-tracking TA.
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const lengthTracking = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(lengthTracking, i, 1);
    }

    let evil = { valueOf: () => {
      gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
      return 0;
    }};
    assertEquals(-1, indexOfHelper(lengthTracking, 0));
    // The TA grew but we only look at the data until the original length.
    assertEquals(-1, indexOfHelper(lengthTracking, 0, evil));
  }

  // Growing + length-tracking TA, index conversion.
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const lengthTracking = new ctor(gsab);
    WriteToTypedArray(lengthTracking, 0, 1);

    let evil = { valueOf: () => {
      gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
      return -4;
    }};
    assertEquals(0, indexOfHelper(lengthTracking, 1, -4));
    // The TA grew but the start index conversion is done based on the original
    // length.
    assertEquals(0, indexOfHelper(lengthTracking, 1, evil));
  }
}
IndexOfParameterConversionGrows(TypedArrayIndexOfHelper);
IndexOfParameterConversionGrows(ArrayIndexOfHelper);

function LastIndexOfParameterConversionGrows(lastIndexOfHelper) {
  // Growing + length-tracking TA.
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const lengthTracking = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(lengthTracking, i, 1);
    }

    let evil = { valueOf: () => {
      gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
      return -1;
    }};
    assertEquals(-1, lastIndexOfHelper(lengthTracking, 0));
    // Because lastIndexOf iterates from the given index downwards, it's not
    // possible to test that "we only look at the data until the original
    // length" without also testing that the index conversion happening with the
    // original length.
    assertEquals(-1, lastIndexOfHelper(lengthTracking, 0, evil));
  }

  // Growing + length-tracking TA, index conversion.
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const lengthTracking = new ctor(gsab);

    let evil = { valueOf: () => {
      gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
      return -4;
    }};
    assertEquals(0, lastIndexOfHelper(lengthTracking, 0, -4));
    // The TA grew but the start index conversion is done based on the original
    // length.
    assertEquals(0, lastIndexOfHelper(lengthTracking, 0, evil));
  }
}
LastIndexOfParameterConversionGrows(TypedArrayLastIndexOfHelper);
LastIndexOfParameterConversionGrows(ArrayLastIndexOfHelper);

(function IndexOfLastIndexOfSpecialValues() {
  for (let ctor of floatCtors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const lengthTracking = new ctor(gsab);
    lengthTracking[0] = -Infinity;
    lengthTracking[1] = -Infinity;
    lengthTracking[2] = Infinity;
    lengthTracking[3] = Infinity;
    lengthTracking[4] = NaN;
    lengthTracking[5] = NaN;
    assertEquals(0, lengthTracking.indexOf(-Infinity));
    assertEquals(1, lengthTracking.lastIndexOf(-Infinity));
    assertEquals(2, lengthTracking.indexOf(Infinity));
    assertEquals(3, lengthTracking.lastIndexOf(Infinity));
    // NaN is never found.
    assertEquals(-1, lengthTracking.indexOf(NaN));
    assertEquals(-1, lengthTracking.lastIndexOf(NaN));
  }
})();

function JoinToLocaleString(joinHelper, toLocaleStringHelper) {
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const fixedLength = new ctor(gsab, 0, 4);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    const lengthTracking = new ctor(gsab, 0);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);

    // Write some data into the array.
    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }

    // Orig. array: [0, 2, 4, 6]
    //              [0, 2, 4, 6] << fixedLength
    //                    [4, 6] << fixedLengthWithOffset
    //              [0, 2, 4, 6, ...] << lengthTracking
    //                    [4, 6, ...] << lengthTrackingWithOffset

    assertEquals('0,2,4,6', joinHelper(fixedLength));
    assertEquals('0,2,4,6', toLocaleStringHelper(fixedLength));
    assertEquals('4,6', joinHelper(fixedLengthWithOffset));
    assertEquals('4,6', toLocaleStringHelper(fixedLengthWithOffset));
    assertEquals('0,2,4,6', joinHelper(lengthTracking));
    assertEquals('0,2,4,6', toLocaleStringHelper(lengthTracking));
    assertEquals('4,6', joinHelper(lengthTrackingWithOffset));
    assertEquals('4,6', toLocaleStringHelper(lengthTrackingWithOffset));

    // Grow.
    gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
    for (let i = 0; i < 6; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }

    // Orig. array: [0, 2, 4, 6, 8, 10]
    //              [0, 2, 4, 6] << fixedLength
    //                    [4, 6] << fixedLengthWithOffset
    //              [0, 2, 4, 6, 8, 10, ...] << lengthTracking
    //                    [4, 6, 8, 10, ...] << lengthTrackingWithOffset

    assertEquals('0,2,4,6', joinHelper(fixedLength));
    assertEquals('0,2,4,6', toLocaleStringHelper(fixedLength));
    assertEquals('4,6', joinHelper(fixedLengthWithOffset));
    assertEquals('4,6', toLocaleStringHelper(fixedLengthWithOffset));
    assertEquals('0,2,4,6,8,10', joinHelper(lengthTracking));
    assertEquals('0,2,4,6,8,10', toLocaleStringHelper(lengthTracking));
    assertEquals('4,6,8,10', joinHelper(lengthTrackingWithOffset));
    assertEquals('4,6,8,10', toLocaleStringHelper(lengthTrackingWithOffset));
 }
}
JoinToLocaleString(TypedArrayJoinHelper, TypedArrayToLocaleStringHelper);
JoinToLocaleString(ArrayJoinHelper, ArrayToLocaleStringHelper);

function JoinParameterConversionGrows(joinHelper) {
  // Growing + fixed-length TA.
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const fixedLength = new ctor(gsab, 0, 4);

    let evil = { toString: () => {
      gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
      return '.';
    }};
    assertEquals('0.0.0.0', joinHelper(fixedLength, evil));
  }

  // Growing + length-tracking TA.
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const lengthTracking = new ctor(gsab);

    let evil = { toString: () => {
      gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
      return '.';
    }};
    // We iterate 4 elements, since it was the starting length.
    assertEquals('0.0.0.0', joinHelper(lengthTracking, evil));
  }
}
JoinParameterConversionGrows(TypedArrayJoinHelper);

function ToLocaleStringNumberPrototypeToLocaleStringGrows(
    toLocaleStringHelper) {
  const oldNumberPrototypeToLocaleString = Number.prototype.toLocaleString;
  const oldBigIntPrototypeToLocaleString = BigInt.prototype.toLocaleString;

  // Growing + fixed-length TA.
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const fixedLength = new ctor(gsab, 0, 4);

    let growAfter = 2;
    Number.prototype.toLocaleString = function() {
      --growAfter;
      if (growAfter == 0) {
        gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
      }
      return oldNumberPrototypeToLocaleString.call(this);
    }
    BigInt.prototype.toLocaleString = function() {
      --growAfter;
      if (growAfter == 0) {
        gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
      }
      return oldBigIntPrototypeToLocaleString.call(this);
    }

    // We iterate 4 elements since it was the starting length. Resizing doesn't
    // affect the TA.
    assertEquals('0,0,0,0', toLocaleStringHelper(fixedLength));
  }

  // Growing + length-tracking TA.
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const lengthTracking = new ctor(gsab);

    let growAfter = 2;
    Number.prototype.toLocaleString = function() {
      --growAfter;
      if (growAfter == 0) {
        gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
      }
      return oldNumberPrototypeToLocaleString.call(this);
    }
    BigInt.prototype.toLocaleString = function() {
      --growAfter;
      if (growAfter == 0) {
        gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
      }
      return oldBigIntPrototypeToLocaleString.call(this);
    }

    // We iterate 4 elements since it was the starting length.
    assertEquals('0,0,0,0', toLocaleStringHelper(lengthTracking));
  }

  Number.prototype.toLocaleString = oldNumberPrototypeToLocaleString;
  BigInt.prototype.toLocaleString = oldBigIntPrototypeToLocaleString;
}
ToLocaleStringNumberPrototypeToLocaleStringGrows(
    TypedArrayToLocaleStringHelper);
ToLocaleStringNumberPrototypeToLocaleStringGrows(ArrayToLocaleStringHelper);

function TestMap(mapHelper) {
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const fixedLength = new ctor(gsab, 0, 4);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    const lengthTracking = new ctor(gsab, 0);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);

    // Write some data into the array.
    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }

    // Orig. array: [0, 2, 4, 6]
    //              [0, 2, 4, 6] << fixedLength
    //                    [4, 6] << fixedLengthWithOffset
    //              [0, 2, 4, 6, ...] << lengthTracking
    //                    [4, 6, ...] << lengthTrackingWithOffset

    function Helper(array) {
      const values = [];
      function GatherValues(n, ix) {
        assertEquals(values.length, ix);
        values.push(n);
        if (typeof n == 'bigint') {
          return n + 1n;
        }
        return n + 1;
      }
      const newValues = mapHelper(array, GatherValues);
      for (let i = 0; i < values.length; ++i) {
        if (typeof values[i] == 'bigint') {
          assertEquals(newValues[i], values[i] + 1n);
        } else {
          assertEquals(newValues[i], values[i] + 1);
        }
      }
      return ToNumbers(values);
    }

    assertEquals([0, 2, 4, 6], Helper(fixedLength));
    assertEquals([4, 6], Helper(fixedLengthWithOffset));
    assertEquals([0, 2, 4, 6], Helper(lengthTracking));
    assertEquals([4, 6], Helper(lengthTrackingWithOffset));

    // Grow.
    gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
    for (let i = 0; i < 6; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }

    // Orig. array: [0, 2, 4, 6, 8, 10]
    //              [0, 2, 4, 6] << fixedLength
    //                    [4, 6] << fixedLengthWithOffset
    //              [0, 2, 4, 6, 8, 10, ...] << lengthTracking
    //                    [4, 6, 8, 10, ...] << lengthTrackingWithOffset

    assertEquals([0, 2, 4, 6], Helper(fixedLength));
    assertEquals([4, 6], Helper(fixedLengthWithOffset));
    assertEquals([0, 2, 4, 6, 8, 10], Helper(lengthTracking));
    assertEquals([4, 6, 8, 10], Helper(lengthTrackingWithOffset));
  }
}
TestMap(TypedArrayMapHelper);
TestMap(ArrayMapHelper);

function MapGrowMidIteration(mapHelper) {
  // Orig. array: [0, 2, 4, 6]
  //              [0, 2, 4, 6] << fixedLength
  //                    [4, 6] << fixedLengthWithOffset
  //              [0, 2, 4, 6, ...] << lengthTracking
  //                    [4, 6, ...] << lengthTrackingWithOffset
  function CreateGsabForTest(ctor) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    // Write some data into the array.
    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }
    return gsab;
  }

  let values;
  let gsab;
  let growAfter;
  let growTo;
  function CollectValuesAndResize(n) {
    if (typeof n == 'bigint') {
      values.push(Number(n));
    } else {
      values.push(n);
    }
    if (values.length == growAfter) {
      gsab.grow(growTo);
    }
    return n;
  }

  function Helper(array) {
    values = [];
    mapHelper(array, CollectValuesAndResize);
    return values;
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const fixedLength = new ctor(gsab, 0, 4);
    growAfter = 2;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals([0, 2, 4, 6], Helper(fixedLength));
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    growAfter = 1;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals([4, 6], Helper(fixedLengthWithOffset));
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const lengthTracking = new ctor(gsab, 0);
    growAfter = 2;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals([0, 2, 4, 6], Helper(lengthTracking));
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);
    growAfter = 1;
    growTo = 5 * ctor.BYTES_PER_ELEMENT;
    assertEquals([4, 6], Helper(lengthTrackingWithOffset));
  }
}
MapGrowMidIteration(TypedArrayMapHelper);
MapGrowMidIteration(ArrayMapHelper);

(function MapSpeciesCreateGrows() {
  let values;
  let gsab;
  function CollectValues(n, ix, ta) {
    if (typeof n == 'bigint') {
      values.push(Number(n));
    } else {
      values.push(n);
    }
    // We still need to return a valid BigInt / non-BigInt, even if
    // n is `undefined`.
    if (IsBigIntTypedArray(ta)) {
      return 0n;
    }
    return 0;
  }

  function Helper(array) {
    values = [];
    array.map(CollectValues);
    return values;
  }

  for (let ctor of ctors) {
    gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                           8 * ctor.BYTES_PER_ELEMENT);
    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, i);
    }

    let resizeWhenConstructorCalled = false;
    class MyArray extends ctor {
      constructor(...params) {
        super(...params);
        if (resizeWhenConstructorCalled) {
          gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
        }
      }
    };

    const fixedLength = new MyArray(gsab, 0, 4);
    resizeWhenConstructorCalled = true;
    assertEquals([0, 1, 2, 3], Helper(fixedLength));
    assertEquals(6 * ctor.BYTES_PER_ELEMENT, gsab.byteLength);
  }

  for (let ctor of ctors) {
    gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                           8 * ctor.BYTES_PER_ELEMENT);

    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, i);
    }

    let resizeWhenConstructorCalled = false;
    class MyArray extends ctor {
      constructor(...params) {
        super(...params);
        if (resizeWhenConstructorCalled) {
          gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
        }
      }
    };

    const lengthTracking = new MyArray(gsab);
    resizeWhenConstructorCalled = true;
    assertEquals([0, 1, 2, 3], Helper(lengthTracking));
    assertEquals(6 * ctor.BYTES_PER_ELEMENT, gsab.byteLength);
  }
})();

function Reverse(reverseHelper) {
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const fixedLength = new ctor(gsab, 0, 4);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    const lengthTracking = new ctor(gsab, 0);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);

    const wholeArrayView = new ctor(gsab);
    function WriteData() {
      // Write some data into the array.
      for (let i = 0; i < wholeArrayView.length; ++i) {
        WriteToTypedArray(wholeArrayView, i, 2 * i);
      }
    }
    WriteData();

    // Orig. array: [0, 2, 4, 6]
    //              [0, 2, 4, 6] << fixedLength
    //                    [4, 6] << fixedLengthWithOffset
    //              [0, 2, 4, 6, ...] << lengthTracking
    //                    [4, 6, ...] << lengthTrackingWithOffset

    reverseHelper(fixedLength);
    assertEquals([6, 4, 2, 0], ToNumbers(wholeArrayView));
    reverseHelper(fixedLengthWithOffset);
    assertEquals([6, 4, 0, 2], ToNumbers(wholeArrayView));
    reverseHelper(lengthTracking);
    assertEquals([2, 0, 4, 6], ToNumbers(wholeArrayView));
    reverseHelper(lengthTrackingWithOffset);
    assertEquals([2, 0, 6, 4], ToNumbers(wholeArrayView));

    // Grow.
    gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
    WriteData();

    // Orig. array: [0, 2, 4, 6, 8, 10]
    //              [0, 2, 4, 6] << fixedLength
    //                    [4, 6] << fixedLengthWithOffset
    //              [0, 2, 4, 6, 8, 10, ...] << lengthTracking
    //                    [4, 6, 8, 10, ...] << lengthTrackingWithOffset

    reverseHelper(fixedLength);
    assertEquals([6, 4, 2, 0, 8, 10], ToNumbers(wholeArrayView));
    reverseHelper(fixedLengthWithOffset);
    assertEquals([6, 4, 0, 2, 8, 10], ToNumbers(wholeArrayView));
    reverseHelper(lengthTracking);
    assertEquals([10, 8, 2, 0, 4, 6], ToNumbers(wholeArrayView));
    reverseHelper(lengthTrackingWithOffset);
    assertEquals([10, 8, 6, 4, 0, 2], ToNumbers(wholeArrayView));
  }
}
Reverse(TypedArrayReverseHelper);
Reverse(ArrayReverseHelper);

(function SetWithGrowableTarget() {
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const fixedLength = new ctor(gsab, 0, 4);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    const lengthTracking = new ctor(gsab, 0);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);

    // Write some data into the array.
    const taFull = new ctor(gsab);

    // Orig. array: [0, 0, 0, 0]
    //              [0, 0, 0, 0] << fixedLength
    //                    [0, 0] << fixedLengthWithOffset
    //              [0, 0, 0, 0, ...] << lengthTracking
    //                    [0, 0, ...] << lengthTrackingWithOffset

    SetHelper(fixedLength, [1, 2]);
    assertEquals([1, 2, 0, 0], ToNumbers(taFull));
    SetHelper(fixedLength, [3, 4], 1);
    assertEquals([1, 3, 4, 0], ToNumbers(taFull));
    assertThrows(() => { SetHelper(fixedLength, [0, 0, 0, 0, 0])}, RangeError);
    assertThrows(() => { SetHelper(fixedLength, [0, 0, 0, 0], 1)}, RangeError);
    assertEquals([1, 3, 4, 0], ToNumbers(taFull));

    SetHelper(fixedLengthWithOffset, [5, 6]);
    assertEquals([1, 3, 5, 6], ToNumbers(taFull));
    SetHelper(fixedLengthWithOffset, [7], 1);
    assertEquals([1, 3, 5, 7], ToNumbers(taFull));
    assertThrows(() => { SetHelper(fixedLengthWithOffset, [0, 0, 0])},
                 RangeError);
    assertThrows(() => { SetHelper(fixedLengthWithOffset, [0, 0], 1)},
                 RangeError);
    assertEquals([1, 3, 5, 7], ToNumbers(taFull));

    SetHelper(lengthTracking, [8, 9]);
    assertEquals([8, 9, 5, 7], ToNumbers(taFull));
    SetHelper(lengthTracking, [10, 11], 1);
    assertEquals([8, 10, 11, 7], ToNumbers(taFull));
    assertThrows(() => { SetHelper(lengthTracking, [0, 0, 0, 0, 0])},
                 RangeError);
    assertThrows(() => { SetHelper(lengthTracking, [0, 0, 0, 0], 1)},
                 RangeError);
    assertEquals([8, 10, 11, 7], ToNumbers(taFull));

    SetHelper(lengthTrackingWithOffset, [12, 13]);
    assertEquals([8, 10, 12, 13], ToNumbers(taFull));
    SetHelper(lengthTrackingWithOffset, [14], 1);
    assertEquals([8, 10, 12, 14], ToNumbers(taFull));
    assertThrows(() => { SetHelper(lengthTrackingWithOffset, [0, 0, 0])},
                 RangeError);
    assertThrows(() => { SetHelper(lengthTrackingWithOffset, [0, 0], 1)},
                 RangeError);
    assertEquals([8, 10, 12, 14], ToNumbers(taFull));

    // Grow.
    gsab.grow(6 * ctor.BYTES_PER_ELEMENT);

    // Orig. array: [8, 10, 12, 14, 0, 0]
    //              [8, 10, 12, 14] << fixedLength
    //                     [12, 14] << fixedLengthWithOffset
    //              [8, 10, 12, 14, 0, 0, ...] << lengthTracking
    //                     [12, 14, 0, 0, ...] << lengthTrackingWithOffset
    SetHelper(fixedLength, [21, 22]);
    assertEquals([21, 22, 12, 14, 0, 0], ToNumbers(taFull));
    SetHelper(fixedLength, [23, 24], 1);
    assertEquals([21, 23, 24, 14, 0, 0], ToNumbers(taFull));
    assertThrows(() => { SetHelper(fixedLength, [0, 0, 0, 0, 0])}, RangeError);
    assertThrows(() => { SetHelper(fixedLength, [0, 0, 0, 0], 1)}, RangeError);
    assertEquals([21, 23, 24, 14, 0, 0], ToNumbers(taFull));

    SetHelper(fixedLengthWithOffset, [25, 26]);
    assertEquals([21, 23, 25, 26, 0, 0], ToNumbers(taFull));
    SetHelper(fixedLengthWithOffset, [27], 1);
    assertEquals([21, 23, 25, 27, 0, 0], ToNumbers(taFull));
    assertThrows(() => { SetHelper(fixedLengthWithOffset, [0, 0, 0])},
                 RangeError);
    assertThrows(() => { SetHelper(fixedLengthWithOffset, [0, 0], 1)},
                 RangeError);
    assertEquals([21, 23, 25, 27, 0, 0], ToNumbers(taFull));

    SetHelper(lengthTracking, [28, 29, 30, 31, 32, 33]);
    assertEquals([28, 29, 30, 31, 32, 33], ToNumbers(taFull));
    SetHelper(lengthTracking, [34, 35, 36, 37, 38], 1);
    assertEquals([28, 34, 35, 36, 37, 38], ToNumbers(taFull));
    assertThrows(() => { SetHelper(lengthTracking, [0, 0, 0, 0, 0, 0, 0])},
                 RangeError);
    assertThrows(() => { SetHelper(lengthTracking, [0, 0, 0, 0, 0, 0], 1)},
                 RangeError);
    assertEquals([28, 34, 35, 36, 37, 38], ToNumbers(taFull));

    SetHelper(lengthTrackingWithOffset, [39, 40, 41, 42]);
    assertEquals([28, 34, 39, 40, 41, 42], ToNumbers(taFull));
    SetHelper(lengthTrackingWithOffset, [43, 44, 45], 1);
    assertEquals([28, 34, 39, 43, 44, 45], ToNumbers(taFull));
    assertThrows(() => { SetHelper(lengthTrackingWithOffset, [0, 0, 0, 0, 0])},
                 RangeError);
    assertThrows(() => { SetHelper(lengthTrackingWithOffset, [0, 0, 0, 0], 1)},
                 RangeError);
    assertEquals([28, 34, 39, 43, 44, 45], ToNumbers(taFull));
  }
})();

(function SetSourceLengthGetterGrowsTarget() {
  // Orig. array: [0, 2, 4, 6]
  //              [0, 2, 4, 6] << fixedLength
  //                    [4, 6] << fixedLengthWithOffset
  //              [0, 2, 4, 6, ...] << lengthTracking
  //                    [4, 6, ...] << lengthTrackingWithOffset
  function CreateGsabForTest(ctor) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    // Write some data into the array.
    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }
    return gsab;
  }

  let gsab;
  let growTo;
  function CreateSourceProxy(length) {
    return new Proxy({}, {
      get(target, prop, receiver) {
        if (prop == 'length') {
          gsab.grow(growTo);
          return length;
        }
        return true; // Can be converted to both BigInt and Number.
      }
    });
  }

  // Test that we still throw for lengthTracking TAs if the source length is
  // too large, even though we resized in the length getter (we check against
  // the original length).
  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const lengthTracking = new ctor(gsab, 0);
    growTo = 6 * ctor.BYTES_PER_ELEMENT;
    assertThrows(() => { lengthTracking.set(CreateSourceProxy(6)); },
                 RangeError);
    assertEquals([0, 2, 4, 6, 0, 0], ToNumbers(new ctor(gsab)));
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);
    growTo = 6 * ctor.BYTES_PER_ELEMENT;
    assertThrows(() => { lengthTrackingWithOffset.set(CreateSourceProxy(6)); },
                 RangeError);
    assertEquals([0, 2, 4, 6, 0, 0], ToNumbers(new ctor(gsab)));
  }
})();

(function SetGrowTargetMidIteration() {
  // Orig. array: [0, 2, 4, 6]
  //              [0, 2, 4, 6] << fixedLength
  //                    [4, 6] << fixedLengthWithOffset
  //              [0, 2, 4, 6, ...] << lengthTracking
  //                    [4, 6, ...] << lengthTrackingWithOffset
  function CreateGsabForTest(ctor) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    // Write some data into the array.
    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }
    return gsab;
  }

  let gsab;
  // Growing will happen when we're calling Get for the `growAt`:th data
  // element, but we haven't yet written it to the target.
  let growAt;
  let growTo;
  function CreateSourceProxy(length) {
    let requestedIndices = [];
    return new Proxy({}, {
      get(target, prop, receiver) {
        if (prop == 'length') {
          return length;
        }
        requestedIndices.push(prop);
        if (requestedIndices.length == growAt) {
          gsab.grow(growTo);
        }
        return true; // Can be converted to both BigInt and Number.
      }
    });
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const fixedLength = new ctor(gsab, 0, 4);
    growAt = 2;
    growTo = 6 * ctor.BYTES_PER_ELEMENT;
    fixedLength.set(CreateSourceProxy(4));
    assertEquals([1, 1, 1, 1], ToNumbers(fixedLength));
    assertEquals([1, 1, 1, 1, 0, 0], ToNumbers(new ctor(gsab)));
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    growAt = 1;
    growTo = 6 * ctor.BYTES_PER_ELEMENT;
    fixedLengthWithOffset.set(CreateSourceProxy(2));
    assertEquals([1, 1], ToNumbers(fixedLengthWithOffset));
    assertEquals([0, 2, 1, 1, 0, 0], ToNumbers(new ctor(gsab)));
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const lengthTracking = new ctor(gsab, 0);
    growAt = 2;
    growTo = 6 * ctor.BYTES_PER_ELEMENT;
    lengthTracking.set(CreateSourceProxy(2));
    assertEquals([1, 1, 4, 6, 0, 0], ToNumbers(lengthTracking));
    assertEquals([1, 1, 4, 6, 0, 0], ToNumbers(new ctor(gsab)));
  }

  for (let ctor of ctors) {
    gsab = CreateGsabForTest(ctor);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);
    growAt = 1;
    growTo = 6 * ctor.BYTES_PER_ELEMENT;
    lengthTrackingWithOffset.set(CreateSourceProxy(2));
    assertEquals([1, 1, 0, 0], ToNumbers(lengthTrackingWithOffset));
    assertEquals([0, 2, 1, 1, 0, 0], ToNumbers(new ctor(gsab)));
  }
})();

(function SetWithGrowableSource() {
  for (let targetIsGrowable of [false, true]) {
    for (let targetCtor of ctors) {
      for (let sourceCtor of ctors) {
        const gsab = CreateGrowableSharedArrayBuffer(
            4 * sourceCtor.BYTES_PER_ELEMENT,
            8 * sourceCtor.BYTES_PER_ELEMENT);
        const fixedLength = new sourceCtor(gsab, 0, 4);
        const fixedLengthWithOffset = new sourceCtor(
            gsab, 2 * sourceCtor.BYTES_PER_ELEMENT, 2);
        const lengthTracking = new sourceCtor(gsab, 0);
        const lengthTrackingWithOffset = new sourceCtor(
            gsab, 2 * sourceCtor.BYTES_PER_ELEMENT);

        // Write some data into the array.
        const taFull = new sourceCtor(gsab);
        for (let i = 0; i < 4; ++i) {
          WriteToTypedArray(taFull, i, i + 1);
        }

        // Orig. array: [1, 2, 3, 4]
        //              [1, 2, 3, 4] << fixedLength
        //                    [3, 4] << fixedLengthWithOffset
        //              [1, 2, 3, 4, ...] << lengthTracking
        //                    [3, 4, ...] << lengthTrackingWithOffset

        const targetAb = targetIsGrowable ?
          new ArrayBuffer(6 * targetCtor.BYTES_PER_ELEMENT) :
          new ArrayBuffer(6 * targetCtor.BYTES_PER_ELEMENT,
                         {maxByteLength: 8 * targetCtor.BYTES_PER_ELEMENT});
        const target = new targetCtor(targetAb);

        if (IsBigIntTypedArray(target) != IsBigIntTypedArray(taFull)) {
          // Can't mix BigInt and non-BigInt types.
          continue;
        }

        SetHelper(target, fixedLength);
        assertEquals([1, 2, 3, 4, 0, 0], ToNumbers(target));

        SetHelper(target, fixedLengthWithOffset);
        assertEquals([3, 4, 3, 4, 0, 0], ToNumbers(target));

        SetHelper(target, lengthTracking, 1);
        assertEquals([3, 1, 2, 3, 4, 0], ToNumbers(target));

        SetHelper(target, lengthTrackingWithOffset, 1);
        assertEquals([3, 3, 4, 3, 4, 0], ToNumbers(target));

        // Grow.
        gsab.grow(6 * sourceCtor.BYTES_PER_ELEMENT);

        for (let i = 0; i < 6; ++i) {
          WriteToTypedArray(taFull, i, i + 1);
        }

        // Orig. array: [1, 2, 3, 4, 5, 6]
        //              [1, 2, 3, 4] << fixedLength
        //                    [3, 4] << fixedLengthWithOffset
        //              [1, 2, 3, 4, 5, 6, ...] << lengthTracking
        //                    [3, 4, 5, 6, ...] << lengthTrackingWithOffset

        SetHelper(target, fixedLength);
        assertEquals([1, 2, 3, 4, 4, 0], ToNumbers(target));

        SetHelper(target, fixedLengthWithOffset);
        assertEquals([3, 4, 3, 4, 4, 0], ToNumbers(target));

        SetHelper(target, lengthTracking, 0);
        assertEquals([1, 2, 3, 4, 5, 6], ToNumbers(target));

        SetHelper(target, lengthTrackingWithOffset, 1);
        assertEquals([1, 3, 4, 5, 6, 6], ToNumbers(target));
      }
    }
  }
})();

(function Subarray() {
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const fixedLength = new ctor(gsab, 0, 4);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    const lengthTracking = new ctor(gsab, 0);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);

    // Write some data into the array.
    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }

    // Orig. array: [0, 2, 4, 6]
    //              [0, 2, 4, 6] << fixedLength
    //                    [4, 6] << fixedLengthWithOffset
    //              [0, 2, 4, 6, ...] << lengthTracking
    //                    [4, 6, ...] << lengthTrackingWithOffset

    const fixedLengthSubFull = fixedLength.subarray(0);
    assertEquals([0, 2, 4, 6], ToNumbers(fixedLengthSubFull));
    const fixedLengthWithOffsetSubFull = fixedLengthWithOffset.subarray(0);
    assertEquals([4, 6], ToNumbers(fixedLengthWithOffsetSubFull));
    const lengthTrackingSubFull = lengthTracking.subarray(0);
    assertEquals([0, 2, 4, 6], ToNumbers(lengthTrackingSubFull));
    const lengthTrackingWithOffsetSubFull =
        lengthTrackingWithOffset.subarray(0);
    assertEquals([4, 6], ToNumbers(lengthTrackingWithOffsetSubFull));

    // Relative offsets
    assertEquals([4, 6], ToNumbers(fixedLength.subarray(-2)));
    assertEquals([6], ToNumbers(fixedLengthWithOffset.subarray(-1)));
    assertEquals([4, 6], ToNumbers(lengthTracking.subarray(-2)));
    assertEquals([6], ToNumbers(lengthTrackingWithOffset.subarray(-1)));

    // Grow.
    gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
    for (let i = 0; i < 6; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }

    // Orig. array: [0, 2, 4, 6, 8, 10]
    //              [0, 2, 4, 6] << fixedLength
    //                    [4, 6] << fixedLengthWithOffset
    //              [0, 2, 4, 6, 8, 10, ...] << lengthTracking
    //                    [4, 6, 8, 10, ...] << lengthTrackingWithOffset

    assertEquals([0, 2, 4, 6], ToNumbers(fixedLength.subarray(0)));
    assertEquals([4, 6], ToNumbers(fixedLengthWithOffset.subarray(0)));
    assertEquals([0, 2, 4, 6, 8, 10], ToNumbers(lengthTracking.subarray(0)));
    assertEquals([4, 6, 8, 10],
                 ToNumbers(lengthTrackingWithOffset.subarray(0)));

    assertEquals(4, fixedLengthSubFull.length);
    assertEquals(2, fixedLengthWithOffsetSubFull.length);

    // Subarrays of length-tracking TAs that don't pass an explicit end argument
    // are also length-tracking.
    assertEquals(lengthTracking.length, lengthTrackingSubFull.length);
    assertEquals(lengthTrackingWithOffset.length,
                 lengthTrackingWithOffsetSubFull.length);
  }
})();

(function SubarrayParameterConversionGrows() {
  // Orig. array: [0, 2, 4, 6]
  //              [0, 2, 4, 6] << fixedLength
  //              [0, 2, 4, 6, ...] << lengthTracking
  function CreateGsabForTest(ctor) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    // Write some data into the array.
    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, 2 * i);
    }
    return gsab;
  }

  // Growing + fixed-length TA. Growing won't affect anything.
  for (let ctor of ctors) {
    const gsab = CreateGsabForTest(ctor);
    const fixedLength = new ctor(gsab, 0, 4);

    const evil = { valueOf: () => { gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
                                    return 0;}};
    assertEquals([0, 2, 4, 6], ToNumbers(fixedLength.subarray(evil)));
  }

  // Growing + length-tracking TA. The length computation is done with the
  // original length.
  for (let ctor of ctors) {
    const gsab = CreateGsabForTest(ctor);
    const lengthTracking = new ctor(gsab, 0);

    const evil = { valueOf: () => { gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
                                    return 0;}};

    assertEquals([0, 2, 4, 6], ToNumbers(
      lengthTracking.subarray(evil, lengthTracking.length)));
  }
})();

// This function cannot be reused between TypedArray.protoype.sort and
// Array.prototype.sort, since the default sorting functions differ.
(function SortWithDefaultComparison() {
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const fixedLength = new ctor(gsab, 0, 4);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    const lengthTracking = new ctor(gsab, 0);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);

    const taFull = new ctor(gsab, 0);
    function WriteUnsortedData() {
      // Write some data into the array.
      for (let i = 0; i < taFull.length; ++i) {
        WriteToTypedArray(taFull, i, 10 - 2 * i);
      }
    }
    // Orig. array: [10, 8, 6, 4]
    //              [10, 8, 6, 4] << fixedLength
    //                     [6, 4] << fixedLengthWithOffset
    //              [10, 8, 6, 4, ...] << lengthTracking
    //                     [6, 4, ...] << lengthTrackingWithOffset

    WriteUnsortedData();
    fixedLength.sort();
    assertEquals([4, 6, 8, 10], ToNumbers(taFull));

    WriteUnsortedData();
    fixedLengthWithOffset.sort();
    assertEquals([10, 8, 4, 6], ToNumbers(taFull));

    WriteUnsortedData();
    lengthTracking.sort();
    assertEquals([4, 6, 8, 10], ToNumbers(taFull));

    WriteUnsortedData();
    lengthTrackingWithOffset.sort();
    assertEquals([10, 8, 4, 6], ToNumbers(taFull));

    // Grow.
    gsab.grow(6 * ctor.BYTES_PER_ELEMENT);

    // Orig. array: [10, 8, 6, 4, 2, 0]
    //              [10, 8, 6, 4] << fixedLength
    //                     [6, 4] << fixedLengthWithOffset
    //              [10, 8, 6, 4, 2, 0, ...] << lengthTracking
    //                     [6, 4, 2, 0, ...] << lengthTrackingWithOffset

    WriteUnsortedData();
    fixedLength.sort();
    assertEquals([4, 6, 8, 10, 2, 0], ToNumbers(taFull));

    WriteUnsortedData();
    fixedLengthWithOffset.sort();
    assertEquals([10, 8, 4, 6, 2, 0], ToNumbers(taFull));

    WriteUnsortedData();
    lengthTracking.sort();
    assertEquals([0, 2, 4, 6, 8, 10], ToNumbers(taFull));

    WriteUnsortedData();
    lengthTrackingWithOffset.sort();
    assertEquals([10, 8, 0, 2, 4, 6], ToNumbers(taFull));
  }
})();

// The default comparison function for Array.prototype.sort is the string sort.
(function ArraySortWithDefaultComparison() {
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const fixedLength = new ctor(gsab, 0, 4);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    const lengthTracking = new ctor(gsab, 0);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);

    const taFull = new ctor(gsab, 0);
    function WriteUnsortedData() {
      // Write some data into the array.
      for (let i = 0; i < taFull.length; ++i) {
        WriteToTypedArray(taFull, i, 10 - 2 * i);
      }
    }
    // Orig. array: [10, 8, 6, 4]
    //              [10, 8, 6, 4] << fixedLength
    //                     [6, 4] << fixedLengthWithOffset
    //              [10, 8, 6, 4, ...] << lengthTracking
    //                     [6, 4, ...] << lengthTrackingWithOffset

    WriteUnsortedData();
    ArraySortHelper(fixedLength);
    assertEquals([10, 4, 6, 8], ToNumbers(taFull));

    WriteUnsortedData();
    ArraySortHelper(fixedLengthWithOffset);
    assertEquals([10, 8, 4, 6], ToNumbers(taFull));

    WriteUnsortedData();
    ArraySortHelper(lengthTracking);
    assertEquals([10, 4, 6, 8], ToNumbers(taFull));

    WriteUnsortedData();
    ArraySortHelper(lengthTrackingWithOffset);
    assertEquals([10, 8, 4, 6], ToNumbers(taFull));

    // Grow.
    gsab.grow(6 * ctor.BYTES_PER_ELEMENT);

    // Orig. array: [10, 8, 6, 4, 2, 0]
    //              [10, 8, 6, 4] << fixedLength
    //                     [6, 4] << fixedLengthWithOffset
    //              [10, 8, 6, 4, 2, 0, ...] << lengthTracking
    //                     [6, 4, 2, 0, ...] << lengthTrackingWithOffset

    WriteUnsortedData();
    ArraySortHelper(fixedLength);
    assertEquals([10, 4, 6, 8, 2, 0], ToNumbers(taFull));

    WriteUnsortedData();
    ArraySortHelper(fixedLengthWithOffset);
    assertEquals([10, 8, 4, 6, 2, 0], ToNumbers(taFull));

    WriteUnsortedData();
    ArraySortHelper(lengthTracking);
    assertEquals([0, 10, 2, 4, 6, 8], ToNumbers(taFull));

    WriteUnsortedData();
    ArraySortHelper(lengthTrackingWithOffset);
    assertEquals([10, 8, 0, 2, 4, 6], ToNumbers(taFull));
  }
})();

function SortWithCustomComparison(sortHelper) {
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const fixedLength = new ctor(gsab, 0, 4);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    const lengthTracking = new ctor(gsab, 0);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);

    const taFull = new ctor(gsab, 0);
    function WriteUnsortedData() {
      // Write some data into the array.
      for (let i = 0; i < taFull.length; ++i) {
        WriteToTypedArray(taFull, i, 10 - i);
      }
    }
    function CustomComparison(a, b) {
      // Sort all odd numbers before even numbers.
      a = Number(a);
      b = Number(b);
      if (a % 2 == 1 && b % 2 == 0) {
        return -1;
      }
      if (a % 2 == 0 && b % 2 == 1) {
        return 1;
      }
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    }

    // Orig. array: [10, 9, 8, 7]
    //              [10, 9, 8, 7] << fixedLength
    //                     [8, 7] << fixedLengthWithOffset
    //              [10, 9, 8, 7, ...] << lengthTracking
    //                     [8, 7, ...] << lengthTrackingWithOffset

    WriteUnsortedData();
    sortHelper(fixedLength, CustomComparison);
    assertEquals([7, 9, 8, 10], ToNumbers(taFull));

    WriteUnsortedData();
    sortHelper(fixedLengthWithOffset, CustomComparison);
    assertEquals([10, 9, 7, 8], ToNumbers(taFull));

    WriteUnsortedData();
    sortHelper(lengthTracking, CustomComparison);
    assertEquals([7, 9, 8, 10], ToNumbers(taFull));

    WriteUnsortedData();
    sortHelper(lengthTrackingWithOffset, CustomComparison);
    assertEquals([10, 9, 7, 8], ToNumbers(taFull));

    // Grow.
    gsab.grow(6 * ctor.BYTES_PER_ELEMENT);

    // Orig. array: [10, 9, 8, 7, 6, 5]
    //              [10, 9, 8, 7] << fixedLength
    //                     [8, 7] << fixedLengthWithOffset
    //              [10, 9, 8, 7, 6, 5, ...] << lengthTracking
    //                     [8, 7, 6, 5, ...] << lengthTrackingWithOffset

    WriteUnsortedData();
    sortHelper(fixedLength, CustomComparison);
    assertEquals([7, 9, 8, 10, 6, 5], ToNumbers(taFull));

    WriteUnsortedData();
    sortHelper(fixedLengthWithOffset, CustomComparison);
    assertEquals([10, 9, 7, 8, 6, 5], ToNumbers(taFull));

    WriteUnsortedData();
    sortHelper(lengthTracking, CustomComparison);
    assertEquals([5, 7, 9, 6, 8, 10], ToNumbers(taFull));

    WriteUnsortedData();
    sortHelper(lengthTrackingWithOffset, CustomComparison);
    assertEquals([10, 9, 5, 7, 6, 8], ToNumbers(taFull));
  }
}
SortWithCustomComparison(TypedArraySortHelper);
SortWithCustomComparison(ArraySortHelper);

function SortCallbackGrows(sortHelper) {
  function WriteUnsortedData(taFull) {
    for (let i = 0; i < taFull.length; ++i) {
      WriteToTypedArray(taFull, i, 10 - i);
    }
  }

  let gsab;
  let growTo;
  function CustomComparison(a, b) {
    gsab.grow(growTo);
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  }

  // Fixed length TA.
  for (let ctor of ctors) {
    gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                           8 * ctor.BYTES_PER_ELEMENT);
    growTo = 6 * ctor.BYTES_PER_ELEMENT;
    const fixedLength = new ctor(gsab, 0, 4);
    const taFull = new ctor(gsab, 0);
    WriteUnsortedData(taFull);

    sortHelper(fixedLength, CustomComparison);

    // Growing doesn't affect the sorting.
    assertEquals([7, 8, 9, 10, 0, 0], ToNumbers(taFull));
  }

  // Length-tracking TA.
  for (let ctor of ctors) {
    gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                           8 * ctor.BYTES_PER_ELEMENT);
    growTo = 6 * ctor.BYTES_PER_ELEMENT;
    const lengthTracking = new ctor(gsab, 0);
    const taFull = new ctor(gsab, 0);
    WriteUnsortedData(taFull);

    sortHelper(lengthTracking, CustomComparison);

    // Growing doesn't affect the sorting. Only the elements that were part of
    // the original TA are sorted.
    assertEquals([7, 8, 9, 10, 0, 0], ToNumbers(taFull));
  }
}
SortCallbackGrows(TypedArraySortHelper);
SortCallbackGrows(ArraySortHelper);

(function ObjectDefinePropertyDefineProperties() {
  for (let helper of
      [ObjectDefinePropertyHelper, ObjectDefinePropertiesHelper]) {
    for (let ctor of ctors) {
      const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                   8 * ctor.BYTES_PER_ELEMENT);
      const fixedLength = new ctor(gsab, 0, 4);
      const fixedLengthWithOffset = new ctor(
          gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
      const lengthTracking = new ctor(gsab, 0);
      const lengthTrackingWithOffset = new ctor(
          gsab, 2 * ctor.BYTES_PER_ELEMENT);
      const taFull = new ctor(gsab, 0);

      // Orig. array: [0, 0, 0, 0]
      //              [0, 0, 0, 0] << fixedLength
      //                    [0, 0] << fixedLengthWithOffset
      //              [0, 0, 0, 0, ...] << lengthTracking
      //                    [0, 0, ...] << lengthTrackingWithOffset

      helper(fixedLength, 0, 1);
      assertEquals([1, 0, 0, 0], ToNumbers(taFull));
      helper(fixedLengthWithOffset, 0, 2);
      assertEquals([1, 0, 2, 0], ToNumbers(taFull));
      helper(lengthTracking, 1, 3);
      assertEquals([1, 3, 2, 0], ToNumbers(taFull));
      helper(lengthTrackingWithOffset, 1, 4);
      assertEquals([1, 3, 2, 4], ToNumbers(taFull));

      assertThrows(() => { helper(fixedLength, 4, 8); }, TypeError);
      assertThrows(() => { helper(fixedLengthWithOffset, 2, 8); }, TypeError);
      assertThrows(() => { helper(lengthTracking, 4, 8); }, TypeError);
      assertThrows(() => { helper(lengthTrackingWithOffset, 2, 8); },
                   TypeError);

      // Grow.
      gsab.grow(6 * ctor.BYTES_PER_ELEMENT);

      helper(fixedLength, 0, 9);
      assertEquals([9, 3, 2, 4, 0, 0], ToNumbers(taFull));
      helper(fixedLengthWithOffset, 0, 10);
      assertEquals([9, 3, 10, 4, 0, 0], ToNumbers(taFull));
      helper(lengthTracking, 1, 11);
      assertEquals([9, 11, 10, 4, 0, 0], ToNumbers(taFull));
      helper(lengthTrackingWithOffset, 2, 12);
      assertEquals([9, 11, 10, 4, 12, 0], ToNumbers(taFull));

      // Trying to define properties out of the fixed-length bounds throws.
      assertThrows(() => { helper(fixedLength, 5, 13); }, TypeError);
      assertThrows(() => { helper(fixedLengthWithOffset, 3, 13); }, TypeError);
      assertEquals([9, 11, 10, 4, 12, 0], ToNumbers(taFull));

      helper(lengthTracking, 4, 14);
      assertEquals([9, 11, 10, 4, 14, 0], ToNumbers(taFull));
      helper(lengthTrackingWithOffset, 3, 15);
      assertEquals([9, 11, 10, 4, 14, 15], ToNumbers(taFull));

      assertThrows(() => { helper(fixedLength, 6, 8); }, TypeError);
      assertThrows(() => { helper(fixedLengthWithOffset, 4, 8); }, TypeError);
      assertThrows(() => { helper(lengthTracking, 6, 8); }, TypeError);
      assertThrows(() => { helper(lengthTrackingWithOffset, 4, 8); },
                   TypeError);

    }
  }
})();

(function ObjectDefinePropertyParameterConversionGrows() {
  const helper = ObjectDefinePropertyHelper;
  // Length tracking.
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const lengthTracking = new ctor(gsab, 0);
    const evil = {toString: () => {
        gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
        return 4;  // Index valid after resize.
    }};
    helper(lengthTracking, evil, 8);
    assertEquals([0, 0, 0, 0, 8, 0], ToNumbers(lengthTracking));
  }
})();

(function ObjectFreeze() {
  // Freezing non-OOB non-zero-length TAs throws.
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const fixedLength = new ctor(gsab, 0, 4);
    const fixedLengthWithOffset = new ctor(
        gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    const lengthTracking = new ctor(gsab, 0);
    const lengthTrackingWithOffset = new ctor(
        gsab, 2 * ctor.BYTES_PER_ELEMENT);

    assertThrows(() => { Object.freeze(fixedLength); }, TypeError);
    assertThrows(() => { Object.freeze(fixedLengthWithOffset); }, TypeError);
    assertThrows(() => { Object.freeze(lengthTracking); }, TypeError);
    assertThrows(() => { Object.freeze(lengthTrackingWithOffset); }, TypeError);
  }
  // Freezing zero-length TAs doesn't throw.
  for (let ctor of ctors) {
    const gsab = CreateResizableArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                           8 * ctor.BYTES_PER_ELEMENT);
    const fixedLength = new ctor(gsab, 0, 0);
    const fixedLengthWithOffset = new ctor(
        gsab, 2 * ctor.BYTES_PER_ELEMENT, 0);
    // Zero-length because the offset is at the end:
    const lengthTrackingWithOffset = new ctor(
        gsab, 4 * ctor.BYTES_PER_ELEMENT);

    Object.freeze(fixedLength);
    Object.freeze(fixedLengthWithOffset);
    Object.freeze(lengthTrackingWithOffset);
  }
})();

(function FunctionApply() {
  for (let ctor of ctors) {
    const gsab = CreateGrowableSharedArrayBuffer(4 * ctor.BYTES_PER_ELEMENT,
                                                 8 * ctor.BYTES_PER_ELEMENT);
    const fixedLength = new ctor(gsab, 0, 4);
    const fixedLengthWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT, 2);
    const lengthTracking = new ctor(gsab, 0);
    const lengthTrackingWithOffset = new ctor(gsab, 2 * ctor.BYTES_PER_ELEMENT);

    const taWrite = new ctor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taWrite, i, i);
    }

    function func(...args) {
      return [...args];
    }

    assertEquals([0, 1, 2, 3], ToNumbers(func.apply(null, fixedLength)));
    assertEquals([2, 3], ToNumbers(func.apply(null, fixedLengthWithOffset)));
    assertEquals([0, 1, 2, 3], ToNumbers(func.apply(null, lengthTracking)));
    assertEquals([2, 3], ToNumbers(func.apply(null, lengthTrackingWithOffset)));

    // Grow.
    gsab.grow(6 * ctor.BYTES_PER_ELEMENT);
    assertEquals([0, 1, 2, 3], ToNumbers(func.apply(null, fixedLength)));
    assertEquals([2, 3], ToNumbers(func.apply(null, fixedLengthWithOffset)));
    assertEquals([0, 1, 2, 3, 0, 0],
                 ToNumbers(func.apply(null, lengthTracking)));
    assertEquals([2, 3, 0, 0],
                 ToNumbers(func.apply(null, lengthTrackingWithOffset)));
  }
})();

(function TypedArrayFrom() {
  AllBigIntMatchedCtorCombinations((targetCtor, sourceCtor) => {
    const gsab = CreateGrowableSharedArrayBuffer(
        4 * sourceCtor.BYTES_PER_ELEMENT,
        8 * sourceCtor.BYTES_PER_ELEMENT);
    const fixedLength = new sourceCtor(gsab, 0, 4);
    const fixedLengthWithOffset = new sourceCtor(
        gsab, 2 * sourceCtor.BYTES_PER_ELEMENT, 2);
    const lengthTracking = new sourceCtor(gsab, 0);
    const lengthTrackingWithOffset = new sourceCtor(
        gsab, 2 * sourceCtor.BYTES_PER_ELEMENT);

    // Write some data into the array.
    const taFull = new sourceCtor(gsab);
    for (let i = 0; i < 4; ++i) {
      WriteToTypedArray(taFull, i, i + 1);
    }

    // Orig. array: [1, 2, 3, 4]
    //              [1, 2, 3, 4] << fixedLength
    //                    [3, 4] << fixedLengthWithOffset
    //              [1, 2, 3, 4, ...] << lengthTracking
    //                    [3, 4, ...] << lengthTrackingWithOffset

    assertEquals([1, 2, 3, 4], ToNumbers(targetCtor.from(fixedLength)));
    assertEquals([3, 4], ToNumbers(targetCtor.from(fixedLengthWithOffset)));
    assertEquals([1, 2, 3, 4], ToNumbers(targetCtor.from(lengthTracking)));
    assertEquals([3, 4], ToNumbers(targetCtor.from(lengthTrackingWithOffset)));

    // Grow.
    gsab.grow(6 * sourceCtor.BYTES_PER_ELEMENT);

    for (let i = 0; i < 6; ++i) {
      WriteToTypedArray(taFull, i, i + 1);
    }

    // Orig. array: [1, 2, 3, 4, 5, 6]
    //              [1, 2, 3, 4] << fixedLength
    //                    [3, 4] << fixedLengthWithOffset
    //              [1, 2, 3, 4, 5, 6, ...] << lengthTracking
    //                    [3, 4, 5, 6, ...] << lengthTrackingWithOffset

    assertEquals([1, 2, 3, 4], ToNumbers(targetCtor.from(fixedLength)));
    assertEquals([3, 4], ToNumbers(targetCtor.from(fixedLengthWithOffset)));
    assertEquals([1, 2, 3, 4, 5, 6],
                 ToNumbers(targetCtor.from(lengthTracking)));
    assertEquals([3, 4, 5, 6],
                 ToNumbers(targetCtor.from(lengthTrackingWithOffset)));
  });

  AllBigIntUnmatchedCtorCombinations((targetCtor, sourceCtor) => {
    const gsab = CreateGrowableSharedArrayBuffer(
        4 * sourceCtor.BYTES_PER_ELEMENT,
        8 * sourceCtor.BYTES_PER_ELEMENT);
    const fixedLength = new sourceCtor(gsab, 0, 4);
    const fixedLengthWithOffset = new sourceCtor(
        gsab, 2 * sourceCtor.BYTES_PER_ELEMENT, 2);
    const lengthTracking = new sourceCtor(gsab, 0);
    const lengthTrackingWithOffset = new sourceCtor(
        gsab, 2 * sourceCtor.BYTES_PER_ELEMENT);

    assertThrows(() => { targetCtor.from(fixedLength); }, TypeError);
    assertThrows(() => { targetCtor.from(fixedLengthWithOffset); }, TypeError);
    assertThrows(() => { targetCtor.from(lengthTracking); }, TypeError);
    assertThrows(() => { targetCtor.from(lengthTrackingWithOffset); },
                 TypeError);
  });
})();

(function ArrayBufferSizeNotMultipleOfElementSize() {
  // The buffer size is a prime, not multiple of anything.
  const rab = CreateGrowableSharedArrayBuffer(11, 20);
  for (let ctor of ctors) {
    if (ctor.BYTES_PER_ELEMENT == 1) continue;

    // This should not throw.
    new ctor(rab);
  }
})();
